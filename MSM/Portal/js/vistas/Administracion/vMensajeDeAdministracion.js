define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/MensajeDeAdministracion.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantilla, VistaDlgConfirm, Not) {
        var vista = Backbone.View.extend({
            template: _.template(plantilla),
            viewModel: null,
            validator: null,
            mensajeAdministracionText: '',
            mensajeAdministracionActivo: false,
            initialize: function () {
                var self = this;
                self.getMensajeAdministracion();
                self.render();

                Backbone.on('eventActualizarMensajeAdministracion', self.actualizarMensajeAdministracion, self);
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.renderElements();
            },
            renderElements: function (e) {
                $("#ddlOpcion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdOpcion",
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        requestEnd: function (e) {
                            e.response.push({ IdOpcion: "alert-success", Descripcion: "Verde" });
                            e.response.push({ IdOpcion: "alert-info", Descripcion: "Azul" });
                            e.response.push({ IdOpcion: "alert-warning", Descripcion: "Amarillo" });
                            e.response.push({ IdOpcion: "alert-danger", Descripcion: "Rojo" });
                        }
                    }
                });

                $("#frmMensajeAdministracion").kendoValidator({
                    messages: {
                        required: "Campo obligatorio",
                    }
                }).data("kendoValidator");
            },
            events: {
                'click #btnSave': 'confirmSave'
            },
            confirmSave: function (e) {
                var self = this;
                e.preventDefault();
                if ($("#frmMensajeAdministracion").data("kendoValidator").validate()) {
                    self.dialogoConfirm = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('TITULO_ACTUALIZAR_MENSAJE_ADMON'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_ACTUALIZAR_MENSAJE_ADMON'),
                        funcion: function () {
                            self.save();
                            Backbone.trigger('eventCierraDialogo');
                        }, contexto: this
                    });
                }
            },
            save: function (e) { 
                var self = this;

                var value =  $('#txtMensaje').val();
                var activo = $('#chkActivo').is(':checked');
                var opcion = $('#ddlOpcion').val();

                $.ajax({
                    type: "POST",
                    url: "../api/ActualizarMensajeAdministracion",
                    data: { "Opcion": opcion, "Descripcion": value, "Activo": activo },
                }).success(function (data) {
                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('MENSAJE_ADMINISTRACION_ACTUALIZADO_CORRECTAMENTE'), 4000);                    
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        //TODO: Indicar mensaje mas acorde
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('MENSAJE_ERROR_ACTUALIZAR_MENSAJE_ADMINISTRACION'), 4000);
                    }
                });
            },
            getMensajeAdministracion: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMensajeAdministracion",
                    dataType: 'json',
                }).success(function (data) {
                    $('#txtMensaje').val(data.Descripcion);
                    $('#chkActivo').prop('checked', data.Activo);
                    $('#ddlOpcion').data('kendoDropDownList').value(data.Opcion);

                    if (data.Activo) {
                        $("#alrtMensajeAdministracion").css('display', 'block');
                        $("#alrtMensajeAdministracion").css('margin', '7px');
                        $("#alrtMensajeAdministracion").attr('class', 'alert ' + data.Opcion);
                        $("#alrtMensajeAdministracion").html('<span><i class="glyphicon glyphicon-warning-sign"></i>&nbsp;' + data.Descripcion + '</span>');
                    }
                    else {
                        $("#alrtMensajeAdministracion").css('display', 'none');
                        $("#alrtMensajeAdministracion").html('');
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        //TODO: Indicar mensaje mas acorde
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                });
            },
            eliminar: function () {
                Backbone.off('eventActualizarMensajeAdministracion');
                this.remove();
            },
        });

        return vista;
    });