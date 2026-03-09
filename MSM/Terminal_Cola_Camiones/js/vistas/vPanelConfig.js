define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'vistas/vCambioPuesto', 'vistas/vDialogoReportarIncidencia', 'text!../../html/panelConfig.html', 'compartido/notificaciones', 'vistas/vTruckQueue'],
    function (_, Backbone, $, VistaDlgConfirm, VistaCambioPuesto, VistaDlgReportarIncidencia, plantillaPanelConfig, Not,truckQueueView) {
        var PanelConfig = Backbone.View.extend({
            tagName: 'div',
            id: 'panelConfig',
            className: "cPanelCfg",
            template: _.template(plantillaPanelConfig),
            dlgConfirmacion: null,
            desplegado: false,
            truckQueue:null,
            initialize: function () {
                this.render();
            },
            vistaPanelConfigCambiarContrasenia: null,
            render: function () {
                if (!this.desplegado) $(this.el).hide();
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.$("#selIdioma").kendoDropDownList();
                var comboIdioma = this.$("#selIdioma").data("kendoDropDownList");
                comboIdioma.value(localStorage.getItem("idiomaSeleccionado"));                
            },
            events: {
                "change #selIdioma": "cambiaIdioma"
            },
            mostrar: function () {
                
                if (!this.desplegado) {
                    $("#gridTruckQueue").css("width", "86.8%");
                    $("#btnConfig").attr("src", "img/close.png");
                }
                else {
                    $("#gridTruckQueue").css("width", "99.8%");
                    $("#btnConfig").attr("src", "img/settings.png");
                }

                $(this.el).animate({ width: 'toggle', queue: false, opacity: "toggle" }, 100);
                this.desplegado = (!this.desplegado);
            },
            actualiza: function () {
                this.render();
            },
            cambiaIdioma: function () {
                var self = this;
                localStorage.setItem("idiomaSeleccionado", this.$("#selIdioma").val());
                window.app.idioma.getFicheroIdioma(localStorage.getItem("idiomaSeleccionado"));
                kendo.culture(this.$("#selIdioma").val());
                $("#btnConfig").attr("src", "img/settings.png");
                self.mostrar();
                $("#gridTruckQueue").data("kendoGrid").dataSource.read();
                $("#center - pane").css({ "margin": "0", "padding": "0" });
                $("#gridTruckQueue").css({ "margin": "0", "padding": "0"});
                $("#gridTruckQueue").find(".k-grid-content").height($("#gridTruckQueue").find(".k-grid-content").height()+63);
                window.app.vistaPrincipal.actualiza();
            }
        });
        return PanelConfig;
    }
);