define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/PerroGuardian.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaPerroGuardian, Not) {
        var vistaPerroGuardian = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            template: _.template(PlantillaPerroGuardian),
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerDatosPerroGuardian",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdProceso",
                            fields: {
                                'DescripcionProceso': { type: "string" },
                                'FechaUltimaEjecucion': { type: "date" },
                                'Activo': { type: "boolean" },
                                'MensajeMail': { type: "string" },
                                'Destinatarios': { type: "string" },
                                'MaximoTiempoInactivo': { type: "number" }
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridPerroGuardian").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridPerroGuardian"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridPerroGuardian").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridPerroGuardian"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                });

                var grid = self.$("#gridPerroGuardian").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    height: '100%',
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Semaforo",
                            title: window.app.idioma.t("INDICADOR"),
                            template: function (data) {
                                return self.ObtenerColorSemaforo(data);
                            },
                            width: 75,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "DescripcionProceso",
                            title: window.app.idioma.t('PROCESO'),
                        },
                        {
                            field: "FechaUltimaEjecucion",
                            title: window.app.idioma.t('FECHA_ULTIMA_EJECUCION'),
                            width: 190,
                            template: '#: kendo.toString(new Date(FechaUltimaEjecucion), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Activo",
                            title: window.app.idioma.t('ACTIVO'),
                            width: 90,
                            template: "# if(Activo){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#} #",
                        },
                        {
                            field: "MensajeMail",
                            title: window.app.idioma.t('MENSAJE'),
                        },
                        {
                            field: "Destinatarios",
                            title: window.app.idioma.t('DESTINATARIO'),
                        },
                        {
                            field: "MaximoTiempoInactivo",
                            title: window.app.idioma.t('MAXIMO_TIEMPO_INACTIVO'),
                            width: 190,
                        },
                    ],
                }).data("kendoGrid");
            },
            ObtenerColorSemaforo: function (dato) {
                var self = this;

                if (self.GetMinutesBetweenDates(dato.FechaUltimaEjecucion, new Date()) > dato.MaximoTiempoInactivo) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                } else {
                    return "<img id='imgEstado' src='img/KOP_Verde.png'></img>";
                }
            },
            GetMinutesBetweenDates(startDate, endDate) {
                var diff = endDate.getTime() - startDate.getTime();
                return (diff / 60000);
            },
            events: {
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
        });

        return vistaPerroGuardian;
    });