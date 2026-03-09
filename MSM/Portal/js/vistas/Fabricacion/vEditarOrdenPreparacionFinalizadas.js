define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarOrdenPreparacion.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'vistas/Fabricacion/vCrearMateriaPrima', 'vistas/Fabricacion/vEditarMateriaPrimaOrden'],
    function (_, Backbone, $, plantillaCrearNoConformidad, VistaDlgConfirm, Not, VistaCrearMateriaPrima, VistaEditarMateriaPrima) {
        var vistaCrearPlantilla = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearNoConformidad',
            opciones: null,
            roles: null,
            window: null,
            crear: null,
            title: null,
            dataTiposOrdenes: null,
            dataUbicaciones: null,
            vistaEditarMateriaPrima : null,
            template: _.template(plantillaCrearNoConformidad),
            initialize: function (options) {
                var self = this;
                self.opciones = options;
                self.crear = self.opciones ? false : true;

                self.title =  window.app.idioma.t('EDITAR_ORDEN');

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.$("#divError").hide();
                self.$("#divErrorPREPARACION").hide();

                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptarEditar").kendoButton();
              

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMateriasPrimasOrdenesPrep/"+self.opciones.IdOrden,
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
                        },
                    },
                    schema: {
                        model: {
                            fields: {
                                'Clase': { type: "string" },
                                'Referencia': { type: "string" },
                                'Descripcion': { type: "string" },
                                'Cantidad': { type: "number" },
                                'IdLote': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridMateriasPrimas"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridMateriasPrimas"), false);
                        }
                    },
                });


                self.grid = this.$("#gridMateriasPrimas").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    height: 200,
                    columns: [
                        {
                            field: "Clase",
                            attributes: { style: 'white-space: nowrap ' },
                            title: window.app.idioma.t("CLASE"),
                        },
                        {
                            field: "IdMaterial",
                            attributes: { style: 'white-space: nowrap ' },
                            title: window.app.idioma.t("REFERENCIA"),
                        },
                        {
                            field: "Descripcion",
                            attributes: { style: 'white-space: nowrap ' },
                            title: window.app.idioma.t("DESCRIPCION"),
                        },
                        {
                            field: "Cantidad",
                            attributes: { style: 'white-space: nowrap ' },
                            title: window.app.idioma.t("CANTIDAD"),
                            template: '#= kendo.format("{0:n2}",Cantidad)#',
                        },
                        {
                            field: "IdLote",
                            attributes: { style: 'white-space: nowrap ' },
                            title: window.app.idioma.t("ID_LOTE"),
                        },
                    ],
                    dataBound: function () {
                    }
                }).data("kendoGrid");

                $("#txtVolumenFinal").kendoNumericTextBox({
                    spinners: true,
                    decimals: 0,
                    culture: kendo.culture().name,
                    format: "n0",
                    min: 0,
                });


                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "930px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.cargaContenido();

                self.dialog = $('#divCrearNoConformidad').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptarEditar': 'aceptar',
                'click #btnAnadirMateriaPrima': 'anadirMateria',
                'click #btnEditarMateriaPrima': 'editarMateria',
                'click #btnBorrarMateriaPrima': 'borrarMateria',
            },
            borrarMateria: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                    var materiaPrimaPlantilla = {};
                    materiaPrimaPlantilla.idMaterial = data.Id;

                    self.eliminarMateriaPrimaPost(data.Id);

                


            },
            eliminarMateriaPrimaPost: function (data) {
                var self = this;
                var idMateriaPrima = data.idMaterial ? data.idMaterial : data;
                $.ajax({
                    type: "DELETE",
                    async: true,
                    url: "../api/eliminarMateriaPrimaOrden/" + idMateriaPrima,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                            if (res) {
                                $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                                $("#gridMateriasPrimas").data('kendoGrid').refresh();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_BORRADO_MATERIA_PRIMA'), 4000);
                            kendo.ui.progress(self.window.element, false);
                    },
                    error: function (response) {
                        kendo.ui.progress(self.window.element, false);
                        if (!bulk) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_BORRADO_MATERIA_PRIMA'), 4000);
                            }
                        }
                    }
                });
            },
            crearMateriaPrimaPost: function (materiaPrimaPlantilla, bulk) {
                var self = this;
                $.ajax({
                    data: JSON.stringify(materiaPrimaPlantilla),
                    type: "POST",
                    async: true,
                    url: "../api/crearMateriaPrimaOrden",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (!bulk) {
                            if (res == true) {
                                $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                                $("#gridMateriasPrimas").data('kendoGrid').refresh();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MATERIA_PRIMA'), 4000);
                        } else {
                            kendo.ui.progress(self.window.element, false);
                            $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                            $("#gridMateriasPrimas").data('kendoGrid').refresh();
                        }
                    },
                    error: function (response) {
                        kendo.ui.progress(self.window.element, false);
                        if (!bulk) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MATERIA_PRIMA'), 4000);
                            }
                        }
                    }
                });
            },
            editarMateria: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                self.vistaEditarMateriaPrima = new VistaEditarMateriaPrima({
                    funcion: function (materiaPrima) {
                        self.editarMateriaPrima(materiaPrima, data);
                    },
                    contexto: data
                });

            },
            editarMateriaPrima: function (materiaPrima, data) {
                var self = this;
                
                    var materiaPrimaPlantilla = {};
                    materiaPrimaPlantilla.idMaterial = data.Id;
                    materiaPrimaPlantilla.Cantidad = materiaPrima.Cantidad;
                    materiaPrimaPlantilla.IdLote = materiaPrima.IdLote;
                    self.editarMateriaPrimaPost(materiaPrimaPlantilla, false);

                
            },
            editarMateriaPrimaPost: function (materiaPrimaPlantilla, bulk) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(materiaPrimaPlantilla),
                    type: "PUT",
                    async: true,
                    url: "../api/editarMateriaPrimaOrden",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                      
                            if (res) {
                                $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                                $("#gridMateriasPrimas").data('kendoGrid').refresh();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_MATERIA_PRIMA'), 4000);
                             
                            if (self.vistaEditarMateriaPrima != null) {
                                self.vistaEditarMateriaPrima.finLoad();
                                self.vistaEditarMateriaPrima.cancelar();
                            } else {
                                self.finLoad();
                            }
                      
                    },
                    error: function (response) {
                        kendo.ui.progress(self.window.element, false);
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_MATERIA_PRIMA'), 4000);
                            }
                            self.vistaEditarMateriaPrima.finLoad();
                           
                    }
                });
            },
            anadirMateria: function (e) {
                var self = this;
                //this.vistaMateriaPrima = new VistaCrearMateriaPrima();
                self.vistaMateriaPrima = new VistaCrearMateriaPrima({
                    funcion: function (dataSel, dataDesSel) {

                        self.seleccionMateriasPrimas(dataSel, dataDesSel, self);
                    },
                    crear: self.crear,
                    datos: self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.data()
                });

            },
            seleccionMateriasPrimas: function (ds, dsDesSel, self) {
                self.vistaMateriaPrima.cancelar();

                var dataSource = self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.data();

                var dataSourceCrear = [];
                var dataSourceEditar = [];
                var dataSourceEliminar = [];

                ds.forEach(function (element, index) {
                    var encontrado = $.map(dataSource, function (data, index) {
                        if (data.IdMaterial == element.IdMaterial) {
                            return index;
                        }
                    });
                    if (self.crear) {
                        if (encontrado.length != 0) {
                            dataSource.splice(encontrado[0], 1);

                        }
                        dataSource.push(element);
                    } else {
                        if (encontrado.length != 0) {//Editar
                            if (dataSource[encontrado[0]].Cantidad != element.Cantidad) {
                                var materiaPrima = {}
                                materiaPrima.idMaterial = dataSource[encontrado[0]].Id;
                                materiaPrima.Cantidad = element.Cantidad;
                                dataSourceEditar.push(materiaPrima);
                            }
                        } else {//Crear
                            var materiaPrima = {}
                            materiaPrima.Clase = element.Clase;
                            materiaPrima.IdMaterial = element.IdMaterial;
                            materiaPrima.Descripcion = element.Descripcion;
                            materiaPrima.Cantidad = element.Cantidad;
                            materiaPrima.IdOrden = self.opciones.IdOrden;
                            dataSourceCrear.push(materiaPrima);
                        }
                    }
                });

                dsDesSel.forEach(function (element, index) {
                    var encontrado = $.map(dataSource, function (data, index) {
                        if (data.IdMaterial == element.IdMaterial) {
                            return index;
                        }
                    });
                    if (self.crear) {
                        if (encontrado.length != 0) {
                            dataSource.splice(encontrado[0], 1);
                        }
                    } else {
                        if (encontrado.length != 0) {
                            var materiaPrima = {}
                            materiaPrima.idMaterial = dataSource[encontrado[0]].Id;
                            dataSourceEliminar.push(materiaPrima);
                        }
                    }
                });

                if (self.crear) {


                    var aux = new kendo.data.DataSource({
                        data: dataSource,
                        schema: {
                            model: {
                                fields: {
                                    'Clase': { type: "string" },
                                    'IdMaterial': { type: "string" },
                                    'Descripcion': { type: "string" },
                                    'Cantidad': { type: "number" },
                                }
                            }
                        },
                        sort: [
                             { field: "IdMaterial", dir: "asc" },
                        ]
                    });

                    self.$("#gridMateriasPrimas").data("kendoGrid").setDataSource(aux);
                } else {
                    dataSourceCrear.forEach(function (element, index) {
                        self.cargarload();
                        self.crearMateriaPrimaPost(element, true);
                    });

                    dataSourceEditar.forEach(function (element, index) {
                        self.cargarload();
                        self.editarMateriaPrimaPost(element, true);
                    });

                    dataSourceEliminar.forEach(function (element, index) {
                        self.cargarload();
                        self.eliminarMateriaPrimaPost(element, true);
                    });
                }
                self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.read();
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            aceptar: function (e) {
                e.preventDefault();

                var self = this;
                self.$("#divError").hide();
                self.$("#divErrorPREPARACION").hide();

                self.dialog.close();
                self.eliminar();
            },
            cargarload: function () {
                var self = this;

                kendo.ui.progress(self.window.element, true);
            },
            finLoad: function () {
                var self = this;

                kendo.ui.progress(self.window.element, false);
            },
            cargaContenido: function () {
                var self = this;
                var plantillaPrep = self.opciones;

                self.$("#txtDescripcion").val(plantillaPrep.Descripcion);
                self.$("#txtUnidades").val(plantillaPrep.UnidadMedida);
                $("#txtVolumenFinal").data("kendoNumericTextBox").value(plantillaPrep.VolumenReal)
            },
            eliminar: function () {
                // same as this.$el.remove();
                var self = this;

                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return vistaCrearPlantilla;
    });