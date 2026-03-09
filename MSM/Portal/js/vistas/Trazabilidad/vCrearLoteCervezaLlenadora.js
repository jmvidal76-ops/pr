define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/CrearLoteCervezaLlenadora.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaLoteCerveza, Not) {
        var vistaCrearLoteCervezaLlenadora = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearLoteCervezaLlenadora',
            window: null,
            dsTiposCerveza: null,
            dsCervezasEnvasar: null,
            parent: null,
            template: _.template(plantillaLoteCerveza),
            initialize: function (opciones) {
                var self = this;

                self.parent = opciones.ventanaPadre;
                self.obtenerTiposCerveza();
                self.obtenerCervezasEnvasar();
                self.render();
            },
            obtenerTiposCerveza: function () {
                var self = this;

                self.dsTiposCerveza = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetClaseMaterial/71",
                            dataType: "json"
                        }
                    },
                    filter: {
                        field: "IdClaseMaterial",
                        operator: "contains",
                        value: "CZAE"
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerCervezasEnvasar: function () {
                var self = this;

                self.dsCervezasEnvasar = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/materiales/CervezasAEnvasar",
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_LOTE_CERVEZA_LLE'),
                        width: "590px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearLoteCervezaLlenadora').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbTipoCerveza").kendoDropDownList({
                    dataSource: self.dsTiposCerveza,
                    template: '#:data.IdClaseMaterial #' + ' - ' + '#: data.Descripcion #',
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                });

                self.$("#cmbCodigoCerveza").kendoDropDownList({
                    dataSource: self.dsCervezasEnvasar,
                    filter: "contains",
                    template: '#:data.IdMaterial #' + ' - ' + '#: data.Descripcion #',
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filtering: function (ev) {
                        var filterValue = ev.filter != undefined ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "IdMaterial",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "Descripcion",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                });

                self.$("#cmbLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: "#= ObtenerLineaDescripcion(id) #",
                    valueTemplate: "#= ObtenerLineaDescripcion(id) #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {
                        let lineaId = this.value();
                        let linea = window.app.planta.lineas.find(l => l.id == lineaId);

                        let cmbUbicacion = self.$("#cmbUbicacion").data("kendoDropDownList");

                        if (linea) {
                            cmbUbicacion.dataSource.data(linea.llenadoras || []);
                        } else {
                            cmbUbicacion.dataSource.data([]);
                        }
                    }
                });

                self.$("#cmbUbicacion").kendoDropDownList({
                    dataSource: [],
                    dataValueField: "id",
                    dataTextField: "nombre",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                });

                $("#dtpFechaInicioConsumo").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                }).data("kendoDateTimePicker");

                $("#btnAceptarLoteCerveza").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarLoteCerveza").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            events: {
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            guardar: function () {
                var self = this;

                $("#trError").hide();

                let tipoCerveza = $("#cmbTipoCerveza").data("kendoDropDownList").value();
                let codigoCerveza = $("#cmbCodigoCerveza").data("kendoDropDownList").value();
                let ubicacion = $("#cmbUbicacion").data("kendoDropDownList").text();
                let fechaInicioConsumo = $("#dtpFechaInicioConsumo").data("kendoDateTimePicker").value();

                if (tipoCerveza == '' || codigoCerveza == '' || ubicacion == '' || fechaInicioConsumo == null) {
                    $("#trError").show();
                    return;
                }

                var data = {};
                data.tipoCerveza = tipoCerveza;
                data.codigoCerveza = codigoCerveza;
                data.ubicacion = ubicacion;
                data.fechaInicioConsumo = fechaInicioConsumo;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    url: "../api/LoteCervezaLlenadora",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            self.parent.actualizarGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearLoteCervezaLlenadora;
    });