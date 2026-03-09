define(['underscore', 'backbone', 'jquery', 'text!../../html/login.html', 'compartido/notificaciones', 'compartido/realTime', 'modelos/mSesion', 'section'],
    function (_, Backbone, $, plantillaLogin, Not, RT, Sesion, Section) {
    var VistaLogin = Backbone.View.extend({
        template: _.template(plantillaLogin),
        initialize: function () {
            this.render();
        },
        render: function () {
            $(this.el).html(this.template());
            $("#btnAceptar").kendoButton();
            this.$("#imgProcesando").hide();
            $("#dlgLogin").show();

            $("#dlgLogin").kendoWindow(
            {
                title: window.app.idioma.t('LOGIN'),
                width: "300px",
                height: "220px",
                resizable: false,
                draggable: false,
                actions: []
            });

            if (this.model.get('validada')) {
                $("#txtUsuario").val(this.model.get('usuario'));
                $("#txtPassword").val('pass');
                $("#txtUsuario").prop('disabled', true);
                $("#txtPassword").prop('disabled', true);
            }

            this.dialog = $("#dlgLogin").data("kendoWindow");
            this.dialog.center();
        },
        events: {
            'click #btnAceptar': 'loguearse',
            'keydown #txtPassword': 'keyAction',
            'click .field-icon': 'mostrarPassword',
        },
        loguearse: function()
        {
            var self = this;
            var usuario = $("#txtUsuario").val().toLowerCase();
            var se = new Sesion();

            se.fetch({
                reset: true,
                success: function (sesion) {
                    if (sesion.get('validada') && !$('#txtUsuario').prop('disabled')) {
                        self.model.set('validada', true);
                        $("#txtUsuario").val(sesion.get('usuario'));
                        $("#txtPassword").val('pass');
                        $("#txtUsuario").prop('disabled', true);
                        $("#txtPassword").prop('disabled', true);
                    } else {                        
                        if ($("#txtUsuario").val().toLowerCase() != '' && $("#txtPassword").val() != '') {
                            var sesion = {};
                            sesion.validada = self.model.get('validada')
                            sesion.usuario = $("#txtUsuario").val().toLowerCase();
                            sesion.password = $("#txtPassword").val();
                            self.logIn(sesion);
                        } else {
                            if ($("#txtUsuario").val() === '') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_INDICADO'), 4000);
                            } else {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_INDICADO_LA_PASSWORD'), 4000);
                            }
                        }
                    }
                },
                error: function (e, a, c) {

                }
            });
        },
        keyAction: function (e) {
            if (e.keyCode == 13) {
                this.loguearse();
            }
        },
        mostrarPassword: function () {
            $('.field-icon').toggleClass('glyphicon-eye-close').toggleClass('glyphicon-eye-open');
            var input = $('#txtPassword');
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        },
        logIn: function (sesion) {
            var res = null;
            var error = false;           
            var self = this;           
            self.$("#imgProcesando").show();
            self.$("#divAceptar").hide();

            this.model.fetch({
                type: 'POST',
                url: "../api/loginPortal",
                contentType: "application/json",
                data: JSON.stringify(sesion),
                cache: false,
                async: true,
                reset: true,
                success: function (e) {
                    if (self.model.get("usuario") == 'UsuarioOcupado') {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOGIN_OCUPADA'), 4000);
                        self.$("#imgProcesando").hide();
                        self.$("#divAceptar").show();
                    } else {
                        if (self.model.get("validada")) {
                            //Comprobamos permiso para mostrar logo y favicon ocultos al inicio
                            permiso = TienePermiso(422); //Permiso ocultar logos
                            if (!permiso) {
                                self.section = new Section();
                                $("#favicon").attr("href", self.section.getAppSettingsValue('faviconPlanta'));
                                $("#logo").show();
                                $(".navbar-header").css('margin-top', '0px');
                            }
                            Backbone.trigger('eventActSesion');
                            self.dialog.close();
                            self.remove();
                            self.getTiempoSesion()
                            RT.iniciar();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOGIN'), 4000);
                        }
                    }
                    return self.model;
                },
                error: function (data, status, xhr) {
                    error = true;
                    var errorText = null;
                    this.$("#imgProcesando").hide();
                    this.$("#divAceptar").show();

                    if (status.responseJSON.bloqueado) {
                        errorText = window.app.idioma.t('ERROR_LOGIN_LOCKED')
                    } else {
                        errorText = window.app.idioma.t('ERROR_LOGIN')
                    }
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), errorText, 4000);
                    return self.model;
                }
            });
        },
        getTiempoSesion: function () {
            $.ajax({
                type: "GET",
                url: "../api/planta/getTiempoSesion",
                dataType: 'json',
                cache: true
            }).done(function (data) {
                if (data) {
                    window.app.interval = setInterval(window.app.comprobarSesionActiva, data);
                }
            }).fail(function (xhr) {
                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }
            });
        }
    });

    return VistaLogin;
});