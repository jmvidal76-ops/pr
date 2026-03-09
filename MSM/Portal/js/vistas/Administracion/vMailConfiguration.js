define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/MailConfiguration.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantilla, Not) {
        var vista = Backbone.View.extend({
            template: _.template(plantilla),
            mailData: null,
            ds: null,
            viewModel: null,
            modelTestConnection: null,
            validator: null,

            initialize: function () {
                var self = this;

                self.getMailConfiguration();
                self.render();
            },
            getMailConfiguration: function () {
                var self = this;

                $.ajax({
                    url: "../api/mailConfiguration/",
                    dataType: 'json',
                    async: false
                }).done(function (data) {
                    self.mailData = data;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                });
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                $('#IPServer').val(self.mailData.IPServer);
                $('#MailAddress').val(self.mailData.MailAddress);
                $('#Port').val(self.mailData.Port);
                $('#chkSSL').prop('checked', self.mailData.SSL);
                $('#rbBasica').prop('checked', self.mailData.IsBasicAuth);
                $('#Username').val(self.mailData.Username);
                $('#Password').val(self.mailData.Password);
                $('#rbAnonima').prop('checked', self.mailData.IsAnonymousAuth);

                if (self.mailData.IsBasicAuth) {
                    $('#Username').prop('disabled', false);
                    $('#Password').prop('disabled', false);
                } else {
                    $('#Username').prop('disabled', true);
                    $('#Password').prop('disabled', true);
                }

                $('#formMailConfiguration :input').change(function (e) {
                    if (e.target.id != $('#TestMail').attr('id')) {
                        $('#btnSave').prop('disabled', false);
                    }
                });

                //Validación del formulario
                self.validator = $("#formMailConfiguration").kendoValidator({
                    messages: {
                        required: function () { return window.app.idioma.t('CAMPO_REQUERIDO') },
                        email: function () { return window.app.idioma.t('EMAIL_NO_VALIDO') }
                    },
                });
            },
            events: {
                'change .rbAuth': 'changeAuth',
                'click #btnSave': 'save',
                'click #btnTestMail': 'testConnection',
            },
            changeAuth: function () {
                var self = this;
                if ($("#rbAnonima").prop('checked')) {
                    $('#Username').prop('disabled', true);
                    $('#Password').prop('disabled', true);
                    $('#Username').val('');
                    $('#Password').val('');
                    self.validator.data("kendoValidator").hideMessages();
                } else {
                    $('#Username').prop('disabled', false);
                    $('#Password').prop('disabled', false);
                }
            },
            save: function () {
                var self = this;
                var data = {
                    Id: self.mailData.Id,
                    IPServer: $('#IPServer').val(),
                    MailAddress: $('#MailAddress').val(),
                    Port: $('#Port').val(),
                    Username: $('#Username').val(),
                    Password: $('#Password').val(),
                    SSL: $('#chkSSL').prop('checked'),
                    IsAnonymousAuth: $('#rbAnonima').prop('checked'),
                    IsBasicAuth: $('#rbBasica').prop('checked')
                };

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/mailConfigurationUpdate/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('GUARDAR_CONFIGURACION_EMAIL'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_CONFIGURACION'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_CONFIGURACION'), 4000);
                        }
                    }
                });
            },
            testConnection: function () {
                var value = $('#TestMail').val();

                $.ajax({
                    type: "POST",
                    url: "../api/mailTestConnection",
                    data: { "": value },
                }).success(function (data) {
                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('SUCCESS_TEST_MAIL'), 4000);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_TEST_MAIL'), 4000);
                    }
                });
            },
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });