define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'vistas/vCambioPuesto', 'vistas/vLogin', 'vistas/vDialogoReportarIncidencia', 'text!../../html/panelConfig.html', 'compartido/notificaciones'],
    function (_, Backbone, $, VistaDlgConfirm, VistaCambioPuesto, VistaLogin, VistaDlgReportarIncidencia, plantillaPanelConfig, Not) {
        var PanelConfig = Backbone.View.extend({
            tagName: 'div',
            id: 'panelConfig',
            className: "cPanelCfg",
            template: _.template(plantillaPanelConfig),
            dlgConfirmacion: null,
            desplegado: false,
            initialize: function () {
                Backbone.on('cerrarSesionUsuario', this.logOut, this);
                this.render();
            },
            vistaPanelConfigCambiarContrasenia: null,
            render: function () {
                if(!this.desplegado)$(this.el).hide();
                $(this.el).html(this.template());
                this.$("#btnCerrarSesion").kendoButton(
                {
                    imageUrl: "img/quit.png"
                });
                this.$("#btnReportarIncidencia").kendoButton(
                {
                    imageUrl: "img/warning.png"
                });
                this.$("#btnCambiarPuesto").kendoButton(
                {
                    imageUrl: "img/machine.png"
                });

                this.$("#selIdioma").kendoDropDownList();
                var comboIdioma = this.$("#selIdioma").data("kendoDropDownList");
                comboIdioma.value(localStorage.getItem("idiomaSeleccionado"));

                this.$("#chkTecladoVirtual").prop("checked", localStorage.getItem("tecladoVirtual") == "true");

                $("#center-pane").append($(this.el));

                $("#btnCambiarContrasenia").kendoButton(
                {
                    imageUrl: "img/llave.png"
                });
            },
            events: {
                "change #selIdioma": "cambiaIdioma",
                "click #btnCerrarSesion": "cerrarSesion",
                "change #chkTecladoVirtual": "selTecladoVirtual",
                "click #btnCambiarPuesto": "cambiarPuesto",
                "click #btnReportarIncidencia": "reportarIncidencia",
                "click #btnCambiarContrasenia": "toggleCambioContrasenia",
                "click #btnAceptar": "cambiarContrasenia",
                "click #btnCancelar": "toggleCambioContrasenia",
                'click .field-icon': 'mostrarPassword',
            },
            mostrar: function () {
                $(this.el).animate({ width: 'toggle', queue: false, opacity: "toggle"}, 100);
                this.desplegado = (!this.desplegado);
            },
            cambiaIdioma: function() {
                localStorage.setItem("idiomaSeleccionado", this.$("#selIdioma").val());
                window.app.idioma.getFicheroIdioma(localStorage.getItem("idiomaSeleccionado"));
                kendo.culture(this.$("#selIdioma").val());
                window.app.vistaPrincipal.actualiza();                
            },
            selTecladoVirtual: function () {
                localStorage.setItem("tecladoVirtual", this.$("#chkTecladoVirtual")[0].checked);
                window.app.vistaPrincipal.actualiza();
            },
            cerrarSesion: function () {
                if (window.app.sesion && window.app.sesion.get("validada")) {
                    this.dlgConfirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('TIT_CONFIRMAR_ACCION'),
                        msg: window.app.idioma.t('MSG_CERRAR_SESION'),
                        funcion: this.logOut
                    });
                }
            },
            logOut: function() {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: "../api/logout",
                    success: function (e) {
                        Backbone.history.navigate('#login', { replace: true, trigger: true });
                        window.location.reload();
                    },
                    error: function (e) {
                        self.dlgConfirmacion.cancelar();
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CERRAR_SESION'), 4000);
                    }
                });
            },
            cambiarPuesto: function () {
                if (window.app.sesion.get("validada")) {
                    this.cambioPuesto = new VistaLogin({ model: window.app.sesion, esLogin: false });
                }
            },
            actualiza: function () {
                this.render();
            },
            reportarIncidencia: function () {
                if (window.app.sesion.get("validada")) {
                    new VistaDlgReportarIncidencia({ titulo: window.app.idioma.t('REPORTAR_INCICENCIA') });
                }
            },
            toggleCambioContrasenia: function(e) {
                var self=this;
                self.$("#divCambioContrasenia").slideToggle();
            },
            cambiarContrasenia: function(e) {
                e.preventDefault();
                var password=$("#txtCambioContrasenia").val();
                if (!password){
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_INDICAR_LA'), 4000);
                } else if (password.length < 6) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_CONTRASEÑA_DEBE_TENER'), 4000);
                } else {
                    var user = {}; 
                    user.name = window.app.sesion.attributes.usuario;
                    user.password = $("#txtCambioContrasenia").val();
                    $.ajax({
                        data: JSON.stringify(user),
                        type: "POST",
                        async: false,
                        url: "../api/cambiarContraseniaUsuario",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0] == true) {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                                self.$("#txtCambioContrasenia").val("");
                                self.$("#divCambioContrasenia").hide();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_EL_CAMBIO'), 4000);
                        },
                        error: function (response) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_LA'), 4000);
                        }
                    });
                }
            },
            mostrarPassword: function () {
                $('.field-icon').toggleClass('glyphicon-eye-close').toggleClass('glyphicon-eye-open');
                var input = $('#txtCambioContrasenia');
                if (input.attr("type") == "password") {
                    input.attr("type", "text");
                } else {
                    input.attr("type", "password");
                }
            },
        });

        return PanelConfig;
    }
);