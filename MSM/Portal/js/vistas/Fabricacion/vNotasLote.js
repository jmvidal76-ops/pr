define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/NotasLote.html',
    'compartido/notificaciones',
    'jszip', 'compartido/utils', '../../../../Portal/js/constantes'
],
    function (_, Backbone, $, plantilla, Not, JSZip, utils, enums) {
        var vistaNotasLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divNotasLote',
            template: _.template(plantilla),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            initialize: function ({ parent, data }) {
                const self = this;
                //window.JSZip = JSZip;
                self.parent = parent;
                self.data = data;

                self.render();
            },
            render: function () {
                const self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                if (self.data && self.data.notas) {
                    $("#inpt_NotasLote").val(self.data.notas);
                }

                $("#btnNotasLotesAceptar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        self.data.notas = $("#inpt_NotasLote").val();

                        try {
                            kendo.ui.progress($("#divNotasLote"), true);
                            await self.ActualizarNotasLote(self.data);
                            kendo.ui.progress($("#divNotasLote"), false);
                            self.parent.ActualizarGrid();
                            self.window.close();
                        }
                        catch (err) {
                            kendo.ui.progress($("#divNotasLote"), false);
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITANDO_NOTAS_LOTE'), 5000);
                        }   
                    }
                });

                $("#btnNotasLotesCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                self.window = $(self.el).kendoWindow({
                    title: window.app.idioma.t("NOTAS_LOTE"),
                    width: "40%",
                    height: "20%",
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                        self.parent.windowNL = null;
                        self.eliminar();
                    },
                    resizable: false,
                    modal: true
                }).data("kendoWindow");

                self.window.center();
            },
            ActualizarNotasLote: async function (data) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/ControlStock/NotasLote?idLote=${data.id}&notas=${data.notas}&tipoLote=${data.tipoLote}`,
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                })
            },
            eliminar: function () {
                this.remove();
            }
        });
        return vistaNotasLote;
    });