define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/NuevaFiltracion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaTransferencia, Not, VistaDlgConfirm) {
        var vistaTransferencia = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',
            tcps: null,
            materiales: null,
            lineaFiltracion: null,
            materiales: null,
            planificados: null,
            TCPs: null,
            materialesCoccion: null,
            idOrden: null,
            fecha: null,
            maximo: null,
            template: _.template(plantillaTransferencia),
            ds: null,
            grid: null,
            initialize: function (idOrden, fecha) {
                var self = this;

                self.idOrden = idOrden;
                self.fecha = fecha;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMostosSinDummy/FIL",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerTCPs/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.TCPs = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerLineasFil",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.lineaFiltracion = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerPlanificadosMaterial/" + self.idOrden,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.planificados = data;
                    self.planificados.forEach(function (p, index) {
                        p.ID = index;
                    });
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                //// Cargamos los combos
               
                $("#lblFecha").kendoDateTimePicker({
                    
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
                

                $("#ddlLinea").kendoDropDownList({
                    dataTextField: "C_External_IDSloc",
                    dataValueField: "CeldaPK",
                    dataSource: self.lineaFiltracion,
                    dataBound: function () {
                        this.select(0);
                    }
                });

                if (self.lineaFiltracion.length == 0) {
                    $("#lbl").show();
                    $("#lbl").html("No hay líneas disponibles, use alguna de las ordenes de Filtración existentes");
                    $("#btnAceptar").attr("disabled","disabled");
                }
                //grid materiales auxiliares
               
                self.ds = new kendo.data.DataSource({
                    transport: {
                       
                        read: function (e) {
                            // on success
                            e.success(self.planificados);
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        },
                        create: function (e) {
                            // assign an ID to the new item
                            //e.data.ProductID = sampleDataNextID++;
                            // save data item to the original datasource

                            var idMaterial = e.data.Id_Material;
                            var idTCP = e.data.Id_Localizacion;
                            var nameTCP = "";
                            var descMaterial = "";
                            var cantidad = e.data.Cantidad_Estimada;
                            self.TCPs.forEach(function (t) {
                                if (t.ID == e.data.Id_Localizacion) {
                                    nameTCP = t.Name;
                                }
                            });
                            self.materiales.forEach(function (m) {
                                if (e.data.Id_Material == m.IdMaterial) {
                                    descMaterial = m.Descripcion;
                                }
                            });
                            if (idMaterial != '' && cantidad > 0) {

                                if (idTCP == '') {
                                    $("#lblError").text(window.app.idioma.t('DEBE_SELECCIONAR_TCP'));
                                    e.error("XHR response", "status code", window.app.idioma.t('DEBE_SELECCIONAR_TCP'));                                   
                                    //return;
                                }

                                $("#lblError").text("");
                                var newEl = {
                                    ID: self.planificados.length,
                                    Id_Material: idMaterial,
                                    Descripcion_Material: descMaterial,
                                    Cantidad_Estimada: cantidad,
                                    Id_Localizacion: idTCP,
                                    Nombre_Localizacion: nameTCP
                                };
                                self.planificados.push(newEl);

                            } else {
                                $("#lblError").text(window.app.idioma.t('DEBE_SELECCIONAR_AL'));
                                e.error("XHR response", "status code", window.app.idioma.t('DEBE_SELECCIONAR_AL'));                               
                            }
                            // on success
                            e.success(e.data);
                            $("#gridMaterialesAux").data("kendoGrid").dataSource.read();
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        },
                        update: function (e) {
                            // locate item in original datasource and update it
                            //sampleData[getIndexById(e.data.ProductID)] = e.data;  
                            //"Name",
                            //"ID",
                            self.planificados[getIndexById(e.data.ID)].Cantidad_Estimada = e.data.Cantidad_Estimada;

                            self.TCPs.forEach(function (t) {
                                if (t.ID == e.data.Id_Localizacion) {
                                    self.planificados[getIndexById(e.data.ID)].Id_Localizacion = e.data.Id_Localizacion;
                                    self.planificados[getIndexById(e.data.ID)].Nombre_Localizacion = t.Name;
                                }
                            });
                            self.materiales.forEach(function (m) {
                                if (e.data.Id_Material == m.IdMaterial) {
                                    //e.data.set("Descripcion_Material", m.Descripcion);
                                    self.planificados[getIndexById(e.data.ID)].Id_Material = e.data.Id_Material;
                                    self.planificados[getIndexById(e.data.ID)].Descripcion_Material = m.Descripcion;
                                }                                    
                            });
                            // on success                           
                            e.success();
                            $("#gridMaterialesAux").data("kendoGrid").dataSource.read();
                           // $("#gridMaterialesAux").data("kendoGrid").refresh();
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        },
                        destroy: function (e) {
                            // locate item in original datasource and remove it
                            //sampleData.splice(getIndexById(e.data.ProductID), 1);
                            self.planificados.splice(getIndexById(e.data.ID), 1);
                            // on success
                            e.success();
                            $("#gridMaterialesAux").data("kendoGrid").dataSource.read();
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        }
                    },
                    batch: false,
                    schema: {                        
                        model: {                           
                            id: "ID",
                            fields: {                               
                                Id_Material: { type: "string", editable: true, nullable: false },
                                Descripcion_Material: {type: "string" },
                                Id_Localizacion: { type: "string", editable: true, nullable: false },
                                Nombre_Localizacion: { type: "string" },                               
                                Cantidad_Estimada: { type: "number", editable: true,validation: { required: false, min: 1 } }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    requestEnd: function (e) {
                        kendo.ui.progress($("#center-pane"), false);
                    }
                    //sort: { field: "name", dir: "asc" }
                });               
                function tcpEditor(container, options) {
                    $('<input required name="' + options.field + '"  data-bind="value:Id_Localizacion" />')
                        .appendTo(container)
                        .kendoDropDownList({
                            autoBind: true,
                            dataTextField: "Name",
                            dataValueField: "ID",
                            dataSource: self.TCPs
                        });
                }
                function materialEditor(container, options) {
                    $('<input required name="' + options.field + '"  data-bind="value:Id_Material" />')
                        .appendTo(container)
                        .kendoDropDownList({
                            autoBind: true,
                            dataTextField: "Descripcion",
                            template: "#=IdMaterial + ' - ' + Descripcion#",
                            dataValueField: "IdMaterial",
                            dataSource: self.materiales
                        });
                }
                function getIndexById(id) {
                    var idx,
                        l = self.planificados.length;

                    for (var j = 0; j < l; j++) {
                        if (self.planificados[j].ID == id) {
                            return j;
                        }
                    }
                    return null;
                }
                self.grid = this.$("#gridMaterialesAux").kendoGrid({
                    dataSource: self.ds,
                    height: "200px",                    
                    toolbar: [{ name: "create", text: window.app.idioma.t('ANADIR') }],
                    //editable: "inline",
                    editable: {
                         mode:"inline",
                         confirmation: false,
                         createAt: "bottom"
                     } ,                                 
                    columns: [   
                        {
                            field: "Id_Material",
                            title: window.app.idioma.t('MATERIAL'),
                            editor: materialEditor,
                            template: "#=Id_Material + ' - ' + Descripcion_Material#",
                            width: 350, filterable: false
                        },
                        {
                            field: "Id_Localizacion",
                            title: window.app.idioma.t('TCP'),
                            width: 180,
                            editor: tcpEditor,
                            template: "#=Nombre_Localizacion#",
                            filterable: false
                        },
                        {
                            field: "Cantidad_Estimada",
                            title: window.app.idioma.t('CANTIDAD') + ' (hl)',
                            filterable: false ,
                            width: 120                        
                        },
                        // { command: ["edit", "destroy"], title: "&nbsp;", width: "200px" }
                        {   title: "&nbsp;", 
                            command: [{ name: "edit", text: { edit: window.app.idioma.t('EDITAR'), update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } }, { name: "destroy", text: window.app.idioma.t('ELIMINAR') }],
                                width: "200px" }
                        
                    ],
                    
                }).data("kendoGrid");
                //update event
                

                this.$("#btnAceptar").kendoButton();
                this.$("#btnEditarAux").kendoButton();
                this.$("#btnCancelar").kendoButton();
                if(self.idOrden) {
                    //EDIT MODE
                    $("#trFecha").show(); //Mostrar fecha
                    $("#trFiltro").hide(); //Ocultar filtros
                    $("#divBtnAceptar").hide(); //Ocultar boton de aceptar
                    $("#divBtnEditar").show(); //Mostrar boton de Editar
                    $("#divBtnEditar").css('display', 'inline');
                    $("#idOrden").val(idOrden);
                    $("#lblFecha").data("kendoDateTimePicker").value(self.fecha);
                }                

                self.window = $(self.el).kendoWindow(
                {
                    title: (self.idOrden == undefined ? window.app.idioma.t('NUEVA_FILTRACIÓN') : window.app.idioma.t('EDITAR') + ' ' + self.idOrden),
                    width: "900px",
                    modal: true,
                    resizable: false,
                    scrollable: false,
                    draggable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnEditarAux': 'editar',
                'click #btnBorrarAux': 'borrarFila',
                'click #btnNuevo': 'anadirFila'
            },
            eliminar: function () {
                this.remove();
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
                
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('NUEVA_FILTRACIÓN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA_FILTRACION'), funcion: function () { self.creaFil(); }, contexto: this
                });
            },
            editar: function (e) {
                e.preventDefault();
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('EDITAR_FILTRACIÓN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_EDITAR_ESTA'), funcion: function () { self.editaFil(); }, contexto: this
                });
            },
            creaFil: function () {
                var self = this;

                var datos = {};

                var pkLinea = $("#ddlLinea").data("kendoDropDownList").value();
                datos.otrosMateriales = self.planificados;
                if (datos.otrosMateriales.length>0) {
                    datos.linea = pkLinea;          
                    $.ajax({
                        type: "POST",
                        url: "../api/CreaFiltracion/",
                        dataType: 'json',
                        data: JSON.stringify(datos),
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true,
                    }).done(function (res) {
                        if(res) {
                            self.window.close();
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                            $("#gridListadoWO").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success',  window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_CREADA_CORRECTAMENTE'), 4000);
                        }else{
                            $("#lblError").text(window.app.idioma.t('ERROR_CREANDO_LA_ORDEN'));
                            Backbone.trigger('eventCierraDialogo');
                        }
                       
                    }).fail(function (err) {
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error',  window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREANDO_LA_ORDEN'), 4000);
                    });
                } else {
                    Backbone.trigger('eventCierraDialogo');
                    $("#lblError").text(window.app.idioma.t('DEBE_SELECCIONAR_AL'));
                   
                }
            },

            editaFil: function () {
                var self = this;

                var datos = {};
                var idOrden = self.idOrden;
                var pkLinea = $("#ddlLinea").data("kendoDropDownList").value();
                var fecha = $("#lblFecha").data("kendoDateTimePicker").value();
                datos.otrosMateriales = self.planificados;
                
                if ( datos.otrosMateriales.length>0) {
                    datos.fecha = fecha;                   
                    datos.idOrden = idOrden;
                    datos.linea = pkLinea;                 

                    $.ajax({
                        type: "POST",
                        url: "../api/editaFiltracion/",
                        dataType: 'json',
                        data: JSON.stringify(datos),
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true,
                    }).done(function (res) {
                        if(res){
                            self.window.close();
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                            $("#gridListadoWO").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_EDITADA_CORRECTAMENTE'), 4000);
                        }else{
                            self.window.close();
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_EDITAR_LA_WO'), 4000);
                        
                        }
                    }).fail(function (err) {
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_LA_WO'), 4000);
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_AL'), 4000);
                    Backbone.trigger('eventCierraDialogo');
                }
            }
        });

        return vistaTransferencia;
    });