define(['underscore',
        'backbone',
        'jquery',
        'colecciones/cMenu',
        'vistas/vPanelConfig',
        'vistas/vTruckQueue',
        'compartido/realTime',
        'compartido/notificaciones',
        'compartido/utils',
        'compartido/KeyboardSettings',
        'compartido/router',
        'compartido/utils'],
    function (_, Backbone, $, Menus, VistaConfig, VistaTruckQueue, RT, Not, Utils, KeyboardSettings, Ruteador, Utils) {
        var Principal = Backbone.View.extend({
            ventanaLogin: null,
            ventanaChat: null,
            panelConfig: null,
            menuPrincipal: null,
            truckQueue: null,
            initialize: function () {
                // Eventos que escucha la vista principal                
                Backbone.on('eventCheckALTForms', this.eventCheckALTForms, this);
                RT.iniciar();
                this.panelConfig = new VistaConfig();
                this.render();
            },
            render: function () {
                var self = this;

                // Nombre de la planta
                $("#lblNombrePlanta").html(String.format(window.app.idioma.t('PLANTA_HEADER'), window.app.planta.Descripcion.toUpperCase()));
                $("#logo").attr("src", String.format(window.app.idioma.t('PLANTA_LOGO'), window.app.planta.Logo));

                $("#imgReloj").show();
                this.muestraReloj(this.fechaHora);
                setInterval(function () { self.muestraReloj(self.fechaHora); }, 1000);

                $("#loader").hide();
                $("#panel").show();

                $("#panel").kendoSplitter({
                    orientation: "horizontal",
                    panes:
                    [
                        { collapsible: false },
                        { collapsible: true, resizable: false, collapsed: true, size: "250px" }
                    ]
                });

                $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                // Si esta marcada la opción de utilizar el teclado en pantalla lo habilitamos para los controles tipo input text
                KeyboardSettings.Load();

                self.truckQueue = new VistaTruckQueue();
                return this;
            },
            actualiza: function () {
                var self = this;

                if (this.panelConfig)
                    this.panelConfig.render();               

            },
            events: {
                "click #btnConfig": "togglePanelConfig",
                "click #btnCerrarMenuSec": "cierraSubMenu",
                "click #divChat": "abrePantallaChat"
            },
            //ALT evento para detectar nuevos formularios
            eventCheckALTForms: function () {
                var filterData = {
                    inicio: null,
                    formID: null,
                    idLoc: window.app.pdvSel,
                    statusPendiente: true,
                    statusFinalizado: false
                };
                if (window.app.pdvSel != null) {
                    $.ajax({ // agomezn 030816: 2.2 de PowerPoint de Incidencias
                        type: "POST",
                        url: "../api/checkNumberPendientesByLoc/",
                        data: JSON.stringify(filterData),
                        async: false,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (numberRegisters) {
                            if (numberRegisters > 0) {
                                $("#btnMenuPrincipal6").css("background-color", "blue");
                                $("#btnMenuPrincipal6").css("color", "black");
                            } else {
                                $("#btnMenuPrincipal6").css("background-color", "#e9e9e9");
                                $("#btnMenuPrincipal6").css("color", "#777");
                            }
                        },
                        error: function (e) {

                            //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CERRAR_SESION'), 4000);
                        }
                    });
                }
            },
            accesoAChat: function () {
                var acceso = false;
                acceso = $.map(window.app.sesion.attributes.funciones, function (funcion, index) {
                    if (funcion.codigo == 'UC_GEN_TT_4_Chat') {
                        return true;
                    }
                })[0];
                return acceso;
            },
            fechaHora: null,
            timer: null,
            muestraReloj: function (fechaHora) {

                //fechaHora.setSeconds(fechaHora.getSeconds() + 1);
                fechaHora = new Date();

                var dia = fechaHora.getDate();
                var mes = fechaHora.getMonth() + 1;
                var ano = fechaHora.getFullYear();
                var horas = fechaHora.getHours();
                var minutos = fechaHora.getMinutes();
                var segundos = fechaHora.getSeconds();

                if (dia < 10) { dia = '0' + dia; }
                if (mes < 10) { mes = '0' + mes; }
                if (horas < 10) { horas = '0' + horas; }
                if (minutos < 10) { minutos = '0' + minutos; }
                if (segundos < 10) { segundos = '0' + segundos; }

                $("#lblFecHoraSistema").html(dia + "/" + mes + "/" + ano + " " + horas + ':' + minutos + ':' + segundos);
            },
            togglePanelConfig: function () {
                this.panelConfig.mostrar();                
            }
        });
        return Principal;
    }
);