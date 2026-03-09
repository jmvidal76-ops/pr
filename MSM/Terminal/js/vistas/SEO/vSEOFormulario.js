define(['underscore', 'backbone', 'jquery', 'text!../../../html/SEO/SEOFormulario.html', 'compartido/notificaciones'],
    function (_, Backbone, $, Plantilla, Not) {
        var VistaSeoFormulario = Backbone.View.extend({
            tagName: 'div',
            idPDV: null,
            formData: null,
            template: _.template(Plantilla),
            component: null,
            initialize: function (options) {
                var self = this;
                self.render();
                Backbone.on('eventcambioPuesto', this.actualiza, this);
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").css("overflow", "hidden");

                self.idPDV = window.app.pdvSEOSel;
                if (self.idPDV) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "../api/TemplatesFormsByLoc/" + self.idPDV,
                        dataType: 'json',
                        cache: false,
                        success: function (data) {
                            self.formData = data;

                            self.$("#ddlSeoForm").kendoDropDownList({
                                dataValueField: "ID",
                                dataTextField: "name",
                                dataSource: data,
                                optionLabel: window.app.idioma.t('SELECCIONE'),
                            });
                        },
                        error: function (err) {
                        }
                    });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t("SEO_ERR_NO_PDV_SEL"), 8000);
                }

            },
            events: {
                'click  #btnNuevoSeoForm': 'crearForm'
            },
            crearForm: function () {
                var self = this;
                var form = self.formData.find(function (item) {
                    return item.ID === parseInt($("#ddlSeoForm").data('kendoDropDownList').value());
                });

                var templateLocForms = {};
                templateLocForms.idLoc = self.idPDV;
                templateLocForms.idTemForm = form.ID;
                templateLocForms.name = form.name;
                templateLocForms.descript = form.descript;
                templateLocForms.path = form.path;
                templateLocForms.TemplatesLocations = {};
                templateLocForms.TemplatesLocations.idDepartmentType = 1;

                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/manualTrigger/",
                    dataType: 'json',
                    cache: false,
                    data: JSON.stringify(templateLocForms),
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        Not.crearNotificacion(res[0] ? 'success' : 'error', window.app.idioma.t('AVISO'), res[1], 3000);

                        window.location.hash = 'SEORunTime';
                    },
                    error: function (err) {
                    }
                });
            },
            actualiza: function (cambioPuesto) {
                this.render();
            },
            eliminar: function () {
                Backbone.off('eventcambioPuesto');
                if (this.component)
                    this.component.eliminar();
                $("#center-pane").css("overflow", "");
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return VistaSeoFormulario;
    });