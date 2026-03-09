define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearPlantilla.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'vistas/Fabricacion/vCrearMateriaPrima', 'vistas/Fabricacion/vEditarMateriaPrima'],
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
            template: _.template(plantillaCrearNoConformidad),
            initialize: function (options) {
                var self = this;
                self.opciones = options;
                self.crear = self.opciones ? false : true;

                self.title = self.opciones ? window.app.idioma.t('EDITAR_PLANTILLA') : window.app.idioma.t('CREAR_PLANTILLA');

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerTiposOrdenesPreparacion/",
                    dataType: 'json',
                    async: false,
                    cache: false
                }).success(function (data) {
                    self.dataTiposOrdenes = data;
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TIPOS_ORDENES_PREPARACION') + ':' + ex, 4000);
                    }
                })

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerUbicacionesPreparacion/",
                    dataType: 'json',
                    async: false,
                    cache: false
                }).success(function (data) {
                    self.dataUbicaciones = data;
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TIPOS_ORDENES_PREPARACION') + ':' + ex, 4000);
                    }
                })

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.$("#lblDescripcion").text(window.app.idioma.t('DESCRIPCION')+'*');
                self.$("#lblTipo").text(window.app.idioma.t('TIPO') + '*');


                self.$("#PREPARACION").hide();
                self.$("#TAREA").hide();
                self.$("#divError").hide();
                self.$("#divErrorPREPARACION").hide();

                self.cmbTipoOrdenes = self.$("#cmbTipo").kendoDropDownList({
                    dataValueField: "Id",
                    dataTextField: "Descripcion",
                    dataSource: self.dataTiposOrdenes,
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {
                        var value = this.value();
                        var dataItem = this.dataItem(e.item)
                        $.each(self.dataTiposOrdenes, function (index, tipoPlantilla) {
                            if (tipoPlantilla.Nombre != dataItem.Nombre) {
                                self.$("#" + tipoPlantilla.Nombre).hide();
                            }

                        });
                        //self.$("#PREPARACION").hide();
                        //self.$("#TAREA").hide();
                        self.$("#" + dataItem.Nombre).show();
                        self.dialog.center();
                    }
                });

                self.cmbUbicacion = self.$("#cmbUbicacion").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    dataTextField: "Nombre",
                    dataSource: self.dataUbicaciones,
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                });

                self.$("#lblUbicacion").text(window.app.idioma.t('UBICACION'));
                self.$("#lblVolumenFinal").text(window.app.idioma.t('VOLUMEN_FINAL'));
                self.$("#lblUnidades").text(window.app.idioma.t('UNIDADES'));
                self.$("#lblNotasSupervisor").text(window.app.idioma.t('NOTAS_SUPERVISOR'));
                self.$("#lblNotasOficial").text(window.app.idioma.t('NOTAS_OFICIAL'));
                self.$("#lblMateriasPrimas").text(window.app.idioma.t('MATERIAS_PRIMAS') + ':');
                self.$("#btnCancelar").kendoButton();
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));
                self.$("#btnAceptarEditar").kendoButton();
                self.$("#btnAceptarEditar").val(window.app.idioma.t('ACEPTAR'));

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMateriasPrimasPlantillaOrdenesPrep/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {

                            if (operation === "read") {

                                var result = {};

                                result.idPlantilla = self.opciones ? self.opciones.IdPlantilla : null;
                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                'Clase': { type: "string" },
                                'Referencia': { type: "string" },
                                'Descripcion': { type: "string" },
                                'Cantidad': { type: "number" }
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
                    dataSource: self.crear ? null : self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    height: 200,
                    toolbar: [
                       {
                           name: "create",
                           text: window.app.idioma.t('ANADIR_MATERIA_PRIMA'),
                           template: "<a id='btnAnadirMateriaPrima' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('ANADIR_MATERIA_PRIMA') + "</a>"
                       },

                    ],
                    columns: [
                        {
                            command:
                            {
                                template: "<div align='center' title='Editar'><a id='btnEditarMateriaPrima' class='k-button k-edit' data-funcion='FAB_PROD_RES_12_GestionPlantillasPrep' style='min-width:16px;'><span class='k-icon k-edit'></span></a></div>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            width: 80
                        },
                        {
                            field: "Clase",
                            title: window.app.idioma.t("CLASE"),
                            width: 170,
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("REFERENCIA"),
                            width: 170,
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 210,
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            template: '#= kendo.format("{0:n2}",Cantidad)#',
                            width: 150,
                        },
                        {
                            command:
                            {
                                template: "<div align='center' title='Borrar'><a id='btnBorrarMateriaPrima' class='k-button k-grid-delete' data-funcion='FAB_PROD_RES_12_GestionPlantillasPrep' style='min-width:16px;'><span class='k-icon k-delete'></span></a></div>"
                            },
                            title: window.app.idioma.t("ELIMINAR"),
                            width: 80
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
                    min: 1,
                });

                if (!self.crear) {
                    self.cargaContenido();
                }

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

                self.dialog = $('#divCrearNoConformidad').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnCancelar': 'cancelar',
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

                if (self.crear) {
                    var dataSource = self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.data();

                    var lstElement = $.map(dataSource, function (element, index) {
                        if (element.IdMaterial == data.IdMaterial) {
                            return index;
                        }
                    });

                    if (lstElement.length != 0) {
                        dataSource.splice(lstElement[0], 1);
                    }

                    self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.read();


                } else {

                    var materiaPrimaPlantilla = {};
                    materiaPrimaPlantilla.idDetallePlantilla = data.Id;

                    self.eliminarMateriaPrimaPost(materiaPrimaPlantilla, false);

                }


            },
            eliminarMateriaPrimaPost: function (materiaPrimaPlantilla, bulk) {
                var self = this;
                $.ajax({
                    data: JSON.stringify(materiaPrimaPlantilla),
                    type: "POST",
                    async: true,
                    url: "../api/eliminarMateriaPrimaPlantilla",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (!bulk) {
                            if (res) {
                                $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                                $("#gridMateriasPrimas").data('kendoGrid').refresh();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_BORRADO_MATERIA_PRIMA'), 4000);
                        } else {
                            self.finLoad();
                            $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                            $("#gridMateriasPrimas").data('kendoGrid').refresh();
                        }
                    },
                    error: function (response) {
                        self.finLoad();
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
                    url: "../api/crearMateriaPrimaPlantilla",
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
                            self.finLoad();
                            $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                            $("#gridMateriasPrimas").data('kendoGrid').refresh();
                        }
                    },
                    error: function (response) {
                        self.finLoad();
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
                if (self.crear) {
                    var dataSource = self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.data();
                    var lstElement = $.grep(dataSource, function (element, index) {
                        return materiaPrima.IdMaterial == element.IdMaterial;
                    });

                    if (lstElement.length != 0) {
                        lstElement[0].Cantidad = materiaPrima.Cantidad;
                        self.$("#gridMateriasPrimas").data("kendoGrid").dataSource.read();
                    }
                    self.vistaEditarMateriaPrima.cancelar();
                } else {
                    var materiaPrimaPlantilla = {};
                    materiaPrimaPlantilla.idDetallePlantilla = data.Id;
                    materiaPrimaPlantilla.Cantidad = materiaPrima.Cantidad;

                    self.editarMateriaPrimaPost(materiaPrimaPlantilla, false);

                }
            },
            editarMateriaPrimaPost: function (materiaPrimaPlantilla, bulk) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(materiaPrimaPlantilla),
                    type: "POST",
                    async: true,
                    url: "../api/editarMateriaPrimaPlantilla",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (!bulk) {
                            if (res == true) {
                                $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                                $("#gridMateriasPrimas").data('kendoGrid').refresh();
                                self.vistaEditarMateriaPrima.cancelar();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_MATERIA_PRIMA'), 4000);
                            self.vistaEditarMateriaPrima.finLoad();
                        } else {
                            self.finLoad();
                            $("#gridMateriasPrimas").data('kendoGrid').dataSource.read();
                            $("#gridMateriasPrimas").data('kendoGrid').refresh();
                        }
                    },
                    error: function (response) {
                        self.finLoad();
                        if (!bulk) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_MATERIA_PRIMA'), 4000);
                            }
                            self.vistaEditarMateriaPrima.finLoad();
                        }
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
                                materiaPrima.idDetallePlantilla = dataSource[encontrado[0]].Id;
                                materiaPrima.Cantidad = element.Cantidad;
                                dataSourceEditar.push(materiaPrima);
                            }
                        } else {//Crear
                            var materiaPrima = {}
                            materiaPrima.Clase = element.Clase;
                            materiaPrima.IdMaterial = element.IdMaterial;
                            materiaPrima.Descripcion = element.Descripcion;
                            materiaPrima.Cantidad = element.Cantidad;
                            materiaPrima.IdPlantilla = self.opciones.IdPlantilla;
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
                            materiaPrima.idDetallePlantilla = dataSource[encontrado[0]].Id;
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

                var plantillaPrep = {};
                plantillaPrep.Descripcion = self.$("#txtDescripcion").val();

                var dropdownlist = self.$("#cmbTipo").data("kendoDropDownList");
                //dropdownlist.value(self.plantillaPrep.Tipo);
                var dataItem = dropdownlist.dataItem()
                plantillaPrep.Tipo = dropdownlist.value();

                var errorTipo = false;
                var errorPrep = false;
                if (dataItem.Nombre == "PREPARACION") {
                    plantillaPrep.Ubicacion = $("#cmbUbicacion").data("kendoDropDownList").value();
                    plantillaPrep.Volumen = self.$("#txtVolumenFinal").val();
                    plantillaPrep.Unidades = self.$("#txtUnidades").val();
                    if (plantillaPrep.Ubicacion.length == 0 || plantillaPrep.Volumen.length == 0 || plantillaPrep.Volumen == 0 || plantillaPrep.Unidades.length == 0) {
                        errorPrep = true;
                    }
                } else if (dataItem.Nombre == "TAREA") {
                    plantillaPrep.NotasSupervisor = self.$("#txtNotasSupervisor").val();
                    plantillaPrep.NotasOficial = self.$("#txtNotasOficial").val();
                } else {
                    errorTipo = true;
                }

                if (errorTipo || plantillaPrep.Descripcion.length == 0) {
                    self.$("#divError").show();
                } else if (errorPrep) {
                    self.$("#divErrorPREPARACION").show();
                }
                else {
                    if (self.crear) {
                        var dataSource = $("#gridMateriasPrimas").data("kendoGrid").dataSource;
                        var allData = dataSource.data();
                        plantillaPrep.materiasPrimas = [];
                        allData.forEach(function (data, i) {
                            var materiaPrima = {}
                            materiaPrima.Clase = data.Clase;
                            materiaPrima.IdMaterial = data.IdMaterial;
                            materiaPrima.Descripcion = data.Descripcion;
                            materiaPrima.Cantidad = data.Cantidad;
                            plantillaPrep.materiasPrimas.push(materiaPrima);
                        });

                        self.cargarload();
                        $.ajax({
                            data: JSON.stringify(plantillaPrep),
                            type: "POST",
                            async: true,
                            url: "../api/CrearPlantillaPreparacion",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res == true) {
                                    $("#gridListadoWOPrep").data('kendoGrid').dataSource.read();
                                    $("#gridListadoWOPrep").data('kendoGrid').refresh();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANTILLA_CREADA'), 4000);
                                }
                                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_CREACION_PLANTILLA'), 4000);

                                self.finLoad();
                                self.dialog.close();
                                self.eliminar();
                            },
                            error: function (response) {
                                self.finLoad();
                                if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_CREACION_PLANTILLA'), 4000);
                                }
                                self.dialog.close();
                                self.eliminar();
                            }
                        });

                    } else {
                        plantillaPrep.Id = self.opciones.IdPlantilla;
                        $.ajax({
                            data: JSON.stringify(plantillaPrep),
                            type: "POST",
                            async: true,
                            url: "../api/EditarPlantillaPreparacion",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res == true) {
                                    $("#gridListadoWOPrep").data('kendoGrid').dataSource.read();
                                    $("#gridListadoWOPrep").data('kendoGrid').refresh();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANTILLA_EDITADA'), 4000);
                                    self.dialog.close();
                                    self.eliminar();
                                }
                                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_EDICION_PLANTILLA'), 4000);
                                Backbone.trigger('eventCierraDialogo');
                                self.finLoad();
                            },
                            error: function (response) {
                                self.finLoad();
                                if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_EDICION_PLANTILLA'), 4000);
                                }
                                Backbone.trigger('eventCierraDialogo');
                            }
                        });

                    }
                }
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
                var dropdownlist = self.$("#cmbTipo").data("kendoDropDownList");

                dropdownlist.select(function (dataItem) {
                    return dataItem.Id == plantillaPrep.Tipo.Id;
                });

                dropdownlist.enable(false);
                var dataItem = dropdownlist.dataItem()

                if (dataItem.Nombre == "PREPARACION") {
                    var dropdownlistUbicacion = self.$("#cmbUbicacion").data("kendoDropDownList");
                    dropdownlistUbicacion.select(function (dataItem) {
                        return dataItem.IdUbicacion == plantillaPrep.IdUbicacion;
                    });
                    var numerictextbox = $("#txtVolumenFinal").data("kendoNumericTextBox");
                    numerictextbox.value(plantillaPrep.Volumen);
                    self.$("#txtUnidades").val(plantillaPrep.Unidades);
                } else {
                    self.$("#txtNotasSupervisor").val(plantillaPrep.NotasSupervisor);
                    self.$("#txtNotasOficial").val(plantillaPrep.NotasOficial);

                }
                self.$("#" + dataItem.Nombre).show();
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