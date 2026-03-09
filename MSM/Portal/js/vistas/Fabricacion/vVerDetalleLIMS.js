define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/VistaDetalleLIMS.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDeltaV, Not, VistaDlgConfirm) {
        var vistaVerDeltaV = Backbone.View.extend({
            tagName: 'div',
            id: 'divVerDeltaV',
            datos: null,
            window: null,
            mensajes: null,
            dsMensajes: null,
            sample: null,
            tipo: null,
            dsDetalle: null,
            template: _.template(plantillaDeltaV),
            initialize: function (IdSample) {
                var self = this;
                self.sample = IdSample;
                this.render();
            },
            render: function () {
                var self = this;


                //    this.datos.tipo = self.tipo;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('DETALLE_LIMS'),
                    width: "50%",
                    height: "44%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divVerDeltaV').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                self.dsDetalle = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/LIMS/GetSampleDetails/" + parseInt(self.sample),
                            dataType: "json",
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                        }
                    }
                });
                //self.dsDetalle = new kendo.data.DataSource({ data: example });
                $("#gridLIMSDetalle").kendoGrid({
                    dataSource: self.dsDetalle,
                    columns: [
                        {
                            field: "Sc",
                            title: window.app.idioma.t('PARAMETRO'),
                            width: "100"
                        },
                        {
                            field: "Pa",
                            title: window.app.idioma.t('VALOR'),
                            width: "80"
                        },
                        {
                            title: window.app.idioma.t("RESULTADO"),
                            template: "<img id='imgEstado' src='img/KOP_#= Ss #.png'></img>",
                            width: "100px",
                            attributes: { style: "text-align:center;" }
                        },

                        //{
                        //    field: "CreationDate",
                        //    title: window.app.idioma.t('FECHA'),
                        //    width: "80"
                        //},
                    ],
                }).data("kendoGrid");



            },
            events: {
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaVerDeltaV;
    });