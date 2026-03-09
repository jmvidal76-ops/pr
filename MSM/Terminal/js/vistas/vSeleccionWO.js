define(['underscore', 'backbone', 'jquery', 'vistas/vOrden', 'modelos/mOrden', 'text!../../html/seleccionWO.html', 'compartido/notificaciones'],
    function (_, Backbone, $, BloqueOrden, Orden, PlantillaSeleccionWO, Not) {
        var SeleccionWO = Backbone.View.extend({
            template: _.template(PlantillaSeleccionWO),
            vistaBloqueOrden: null,
            vistaAcciones: null,
            vistaMenuWO: null,
            opciones: null,
            dlgVista: null,
            dsDetalle: null,
            tipoArranque: 0,
            eventosLinea: ['eventNotificacionOrden'],
            initialize: function (options) {
                var self = this;
                $.each(self.eventosLinea, function (index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
                });
                Backbone.on('eventActProd', this.actualiza, this);
                Backbone.on('eventActPlanificacionOrden', this.actualiza, this);

                self.opciones = options;
                self.model = new Orden();

                //self.actualiza();
                var datosPeticion = {};
                datosPeticion.idLinea = self.opciones.idLinea;
                datosPeticion.idOrden = self.opciones.idOrden;
                datosPeticion.idLineaSel = window.app.lineaSel.id;
                datosPeticion.idZonaSel = window.app.zonaSel.id;
                self.model.fetch({
                    type: 'POST',
                    url: "../api/ordenes/getOrden",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datosPeticion),
                    success: function (e) {
                        if (e.attributes.id != "VACIA") {
                            self.render();
                        } else {
                            self.limpiarMenuOrden();
                        }

                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            console.log('ERROR: al crear obtener las ordenes');
                        }
                    }
                });
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());
                self.vistaBloqueOrden = new BloqueOrden({ model: this.model, tipoArranque: self.tipoArranque, el: $("#bloqueWO") });

                if (this.opciones.seccion == "menu") {
                    require(['vistas/vMenuWO'], function (MenuWO) {
                        if (self.vistaAcciones) self.vistaAcciones.eliminar();
                        self.vistaMenuWO = new MenuWO({ el: self.$("#seccionWO"), model: self.model });
                    });
                }
                else if (this.opciones.seccion == "fpa") {
                    if (self.vistaMenuWO) self.vistaMenuWO.eliminar();
                    if (!self.dlgVista) {
                        self.generarFPA();
                    }
                }
                else if (this.opciones.seccion == "listaMateriales") {
                    if (self.vistaMenuWO) self.vistaMenuWO.eliminar();

                    self.dsDetalle = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/obtenerDetalleMateriales/" + self.model.get('producto').codigo,
                                dataType: "json"
                            }
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                fields: {
                                    Cantidad: { type: "number" },
                                }
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            }
                        },
                    });

                    self.abrirListaMateriales();
                }
                else if (this.opciones.seccion == "comprobar") {
                    require(['vistas/vComprobarMaterial'], function (ComprobarMaterial) {
                        if (self.vistaMenuWO) self.vistaMenuWO.eliminar();
                        self.vistaAcciones = new ComprobarMaterial({ el: self.$("#seccionWO"), model: self.model });
                    });
                }
            },
            posicionScroll: 0,
            eliminar: function () {
                Backbone.off('eventNotificacionOrden' + window.app.lineaSel.numLinea);
                //Backbone.off('eventNotificacionMaquina');
                Backbone.off('eventActProd');
                Backbone.off('eventActPlanificacionOrden');

                if (this.vistaMenuWO) this.vistaMenuWO.eliminar();
                if (this.vistaBloqueOrden) this.vistaBloqueOrden.eliminar();
                if (this.vistaAcciones) this.vistaAcciones.eliminar();
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            generarFPA: function () {
                var self = this;
                var producto = self.model.get('producto');
                self.$el.prepend("<div id='dialog'></div>");

                self.dlgVista = self.$("#dialog").kendoWindow({
                    title: window.app.idioma.t('FICHA_DE_PRODUCTO') + producto.codigo + " - " + producto.nombre,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ['Close'],
                    scrollable: false,
                    content: window.location.protocol + "//" + window.location.host + "/Informes/InformeFPA.aspx?prod=" + producto.codigo,
                    height: '70%',
                    width: '90%',
                    iframe: true,
                    close: function (e) {
                        history.back();
                        self.dlgVista = null;
                    }
                }).data("kendoWindow");

                self.dlgVista.center();
            },
            abrirListaMateriales: function () {
                var self = this;
                self.$el.prepend("<div id='modalListaMateriales'></div>");

                $("#modalListaMateriales").kendoWindow({
                    title: window.app.idioma.t('LISTA_MATERIALES'),
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ['Close'],
                    scrollable: true,
                    content: "html/ListaMateriales.html",
                    height: '90%',
                    width: '90%',
                    close: function (e) {
                        history.back();
                        self.vistaMateriales.destroy();
                        self.vistaMateriales = null;
                    },
                    refresh: function () {
                        self.cargarListaMateriales();
                    }
                });

                self.vistaMateriales = $("#modalListaMateriales").data("kendoWindow");
                if (typeof self.vistaMateriales != "undefined") {
                    self.vistaMateriales.center();
                }

            },
            cargarListaMateriales: function () {
                var self = this;

                $('#gridListaMateriales').kendoGrid({
                    dataSource: self.dsDetalle,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    detailTemplate: kendo.template($("#detailEans").html()),
                    detailInit: function (e) {
                        self.detailEans(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    scrollable: false,
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "Linea", title: window.app.idioma.t('LINEA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                }
                            }
                        },
                        {
                            field: "IdMaterial", title: window.app.idioma.t('ID_MATERIAL'), width: "150px",
                        },
                        {
                            field: "NombreMaterial", title: window.app.idioma.t('MATERIAL'),
                        },
                        {
                            field: "Cantidad", title: window.app.idioma.t('CANTIDAD'), width: "150px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 6
                                    });
                                }
                            }
                        },
                        {
                            field: "UnidadMedida", title: window.app.idioma.t('UNIDAD_MEDIDA'), width: "150px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#=UnidadMedida#</label></div>";
                                }
                            }
                        }
                    ]
                });
            },
            detailEans: function (e, vista) {
                var self = this;
                var detailRow = e.detailRow;
                var idMaterial = e.data.IdMaterial;

                var gridEans = detailRow.find(".ean");
                vista.cargarEans(gridEans, idMaterial);
            },
            cargarEans: function (gridEans, idMaterial) {
                var self = this;

                var dsEans = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerEansMaterial/" + idMaterial,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });

                gridEans.kendoGrid({
                    dataSource: dsEans,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    scrollable: false,
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "IdEan", title: window.app.idioma.t('EAN'), width: "140px",
                        },
                        {
                            field: "NombreEan", title: window.app.idioma.t('NOMBRE'), //width: "150px",
                        },
                        {
                            field: "CodProveedor", title: window.app.idioma.t('CODIGO_PROVEEDOR'), width: "170px",
                        },
                        {
                            field: "Proveedor", title: window.app.idioma.t('PROVEEDOR'), //width: "150px",
                        }
                    ]
                });
            },
            actualizarDatosSesion: function () {
                var sesion = window.app.sesion;
                $.ajax({
                    data: JSON.stringify(sesion),
                    type: "POST",
                    async: false,
                    url: "../api/actualizarDatosSesion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data) {
                            window.app.sesion.set("linea", data.linea);
                            window.app.sesion.set("zona", data.zona);
                            Backbone.trigger('eventActualizaLineaZona');
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_DATOS'), 4000);
                        }
                    }
                });
            },
            unbindEvents: function () {
                var self = this;
                $.each(Backbone._events, function (eventName, event) {
                    var isInEventosLinea = $.grep(self.eventosLinea, function (value, index) {
                        return eventName.indexOf(value) >= 0;
                    });
                    if (isInEventosLinea.length > 0) {
                        Backbone.off(eventName);
                    }

                });
            },
            bindEvents: function () {
                var self = this;
                $.each(self.eventosLinea, function (index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
                });
            },
            actualiza: function (cambioPuesto) {
                var self = this;

                if (cambioPuesto) {
                    self.unbindEvents();
                    self.bindEvents();
                }

                //if (!cambioPuesto) { //Si no actualizamos Datos de la sesion al cambiar de puesto, la informacion que obtenemos no esta actualizada.
                self.actualizarDatosSesion();
                //}
                var datosPeticion = {};
                datosPeticion.idLinea = self.opciones.idLinea;
                datosPeticion.idOrden = self.opciones.idOrden;
                datosPeticion.idLineaSel = window.app.lineaSel.id;
                datosPeticion.idZonaSel = window.app.zonaSel.id;
                self.model.fetch({
                    type: 'POST',
                    url: "../api/ordenes/getOrden",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datosPeticion),
                    success: function (e) {
                        if (e.attributes.id == "VACIA") {
                            self.limpiarMenuOrden();
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        console.log('ERROR: al crear obtener las ordenes');
                    }
                });
            },
            limpiarMenuOrden: function () {
                var self = this;
                $(this.el).html('');
            }
        });

        return SeleccionWO;
    });
