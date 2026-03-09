define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'text!../../html/panelConfig.html', 'vistas/vDialogoReportarIncidencia', 'compartido/notificaciones', 'compartido/configuradorKendoGrid'],
    function (_, Backbone, $, VistaDlgConfirm, plantillaPanelConfig, VistaDlgReportarIncidencia, Not, configKendoGrid) {
        var PanelConfig = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaPanelConfig),
            dlgConfirmacion: null,
            initialize: function () {
                Backbone.on('cerrarSesionUsuario', this.logOut, this);
                this.render();
            },
            vistaPanelConfigCambiarContrasenia: null,
            render: function () {
                $(this.el).html(this.template());
                $("#btnCerrarSesion").kendoButton(
                {
                    imageUrl: "img/quit.png"
                });
                $("#btnReportarIncidencia").kendoButton(
                {
                    imageUrl: "img/warning.png"
                });
                $("#selIdioma").kendoDropDownList();
                var comoboIdioma = $("#selIdioma").data("kendoDropDownList");
                comoboIdioma.value(localStorage.getItem("idiomaSeleccionado"));
                $("#btnCambiarContrasenia").kendoButton(
                {
                    imageUrl: "img/llave.png"
                });
            },
            idiomaSel: localStorage.getItem("idiomaSeleccionado"),
            events: {
                "change #selIdioma": "cambiaIdioma",
                "click #btnCerrarSesion": "cerrarSesion",
                "click #btnReportarIncidencia": "reportarIncidencia",
                "click #btnCambiarContrasenia": "toggleCambioContrasenia",
                "click #btnAceptar": "cambiarContrasenia",
                "click #btnCancelar": "toggleCambioContrasenia",
                'click .field-icon': 'mostrarPassword',
            },
            cambiaIdioma: function () {
                this.idiomaSel = this.$("#selIdioma").val();
                localStorage.setItem("idiomaSeleccionado", this.idiomaSel);
                kendo.culture(this.idiomaSel);
                window.app.idioma.getFicheroIdioma(this.idiomaSel);
                window.app.cfgKendo = new configKendoGrid(this.idiomaSel);
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
            logOut: function () {
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
            reportarIncidencia: function () {
                new VistaDlgReportarIncidencia({ titulo: window.app.idioma.t('REPORTAR_INCICENCIA') })
            },
            toggleCambioContrasenia: function (e) {
                var self = this;
                self.$("#divCambioContrasenia").slideToggle();
            },
            cambiarContrasenia: function (e) {
                e.preventDefault();
                var password = $("#txtCambioContrasenia").val();
                if (!password) {
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
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_EL'), 4000);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_LA'), 4000);
                            }
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