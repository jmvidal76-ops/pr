define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/vpSeleccionarUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divSeleccionarUbicacion',
            idElementUbicacion : null,
            //#endregion ATTRIBUTES

            initialize: function (idElementUbicacion) {
                var self = this;
                self.idElementUbicacion = idElementUbicacion;

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

              


                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('UBICACION'),
                        width: "40%",
                        height: "auto",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divSeleccionarUbicacion').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#vpTxtAlmacen").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    optionLabel: window.app.idioma.t("SELECCIONAR_ALMACEN"),
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDepot/",
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idAlmacen = dataItem.IdAlmacen;

                        //Se setea el dataSource del combo de Zona
                        dsZona.transport.options.read.url = "../api/GetZone/" + idAlmacen;
                        dsZona.read();

                        //Se setea el DataSource se Ubicacion
                        dsUbicacion.transport.options.read.url = urlGetUbicacion + idAlmacen + "/0"
                        dsUbicacion.read();
                    },

                }).data("kendoDropDownList");

                var dsZona = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetZone/0",
                            dataType: "json",
                            cache: false
                        }

                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdZona",
                            fields: {
                                'IdZona': { type: "number" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                var urlGetUbicacion = "../api/GetLocation/";

                $("#vpTxtZona").kendoDropDownList({
                    autoBind: false,
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    filter: "contains",
                    optionLabel: window.app.idioma.t("SELECCIONAR_ZONA"),
                    dataSource: dsZona,
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var IdZona = dataItem.IdZona;

                        var idAlmacen = $("#vpTxtAlmacen").data("kendoDropDownList").value();

                        dsUbicacion.transport.options.read.url = urlGetUbicacion + idAlmacen + "/" + IdZona
                        dsUbicacion.read();
                    },
                }).data("kendoDropDownList");

                var dsUbicacion = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: urlGetUbicacion + "0/0",
                            dataType: "json",
                            cache: false
                        }

                    },
                    sort: { field: "Nombre", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdUbicacion",
                            fields: {
                                'IdUbicacion': { type: "number" },
                                'Nombre': { type: "string" }
                            }
                        }
                    }
                });

                $("#vpTxtUbicacion").kendoDropDownList({
                    autoBind: false,
                    filter: "contains",
                    optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    dataSource: dsUbicacion
                }).data("kendoDropDownList");

                $(".btnAplicarCambio").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        var ubicacion = $("#vpTxtUbicacion").data("kendoDropDownList").dataItem($("#vpTxtUbicacion").data("kendoDropDownList").select());

                        if (ubicacion) {
                            if (self.idElementUbicacion) {
                                if (typeof ubicacion.id != "undefined") {
                                    var ubicacionElement = document.getElementById(self.idElementUbicacion);
                                    ubicacionElement.dataset.idselected = ubicacion.id;
                                    ubicacionElement.value = ubicacion.Nombre;

                                    $("#" + self.idElementUbicacion).trigger("change");
                                }
                                
                                //$("#" + self.idElementUbicacion).data("idSelected",ubicacion.id);
                                //$("#" + self.idElementUbicacion).val(ubicacion.Nombre);
                            }
                               
                        }
                        self.window.close();
                    }
                });

            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS

            

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

