define(['underscore', 'backbone', 'jquery', 'text!../../html/comprobarMaterial.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaComprobarMaterial, VistaDlgConfirm, Not) {
        var vistaComprobarMaterial = Backbone.View.extend({
            tagName: 'div',
            material: null,
            model: null,
            template: _.template(plantillaComprobarMaterial),
            initialize: function () {
                this.render();
            },
            render: function () {
                var self = this;
                self.model = self.model.toJSON();
                $(this.el).html(this.template())
                this.$("#btnVolver").kendoButton({ imageUrl: "img/back.png" });
                self.$("#btnValidar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnKey0").kendoButton();
                self.$("#btnKey1").kendoButton();
                self.$("#btnKey2").kendoButton();
                self.$("#btnKey3").kendoButton();
                self.$("#btnKey4").kendoButton();
                self.$("#btnKey5").kendoButton();
                self.$("#btnKey6").kendoButton();
                self.$("#btnKey7").kendoButton();
                self.$("#btnKey8").kendoButton();
                self.$("#btnKey9").kendoButton();

                var numeric = self.$("#txtCodEan");
                numeric.focus();
                $("#center-pane").css("overflow", "hidden");
            },
            events: {
                "click .key": "push",
                "click #btnValidar": "validar",
                "click #btnCancelar": "cancelar",
                'keydown #txtCodEan': 'keyAction',
                'paste #txtCodEan': 'pegar',
            },
            pegar: function (e) {
                var self = this;

                self.$("#divValidacion").hide();

                var theEvent = e || window.event;
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();

                var txtCodEad = self.$("#txtCodEan");
                var value = window.clipboardData ? window.clipboardData.getData('text') : e.originalEvent.clipboardData.getData('text');

                txtCodEad.val(value);
            },
            change: function (e) {
                var theEvent = e || window.event;
            },
            keyAction: function (e) {
                var self = this;
                self.$("#divValidacion").hide();
                var theEvent = e || window.event;
                var reg = new RegExp('[a-zA-Z!@#\$%\^\&*\)\(+=._-¿\"?/#€@¬|~]');

                if (!e.ctrlKey && !e.altKey && reg.test(String.fromCharCode(e.keyCode))) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            },
            push: function (e) {
                var self = this;
                self.$("#divValidacion").hide();

                var txtCodEan = self.$("#txtCodEan");
                var value = txtCodEan.val() == undefined ? "" : txtCodEan.val();
                var key = $(e.target).val();
                txtCodEan.val(value.toString() + key);
            },
            validar: function () {
                var self = this;
                self.$("#divValidacion").hide();
                var codEan = self.$("#txtCodEan").val();

                if (codEan) {
                    var linea = self.model.idLinea.split(".");
                    var idLinea = linea[linea.length - 1];
                    $.ajax({
                        type: "POST",
                        async: false,
                        url: "../api/validarMaterial/" + codEan + "/" + self.model.producto.codigo + "/" + idLinea,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            self.material = data;
                            self.showValidation();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_CANCELACION'), 4000);
                            }
                        }
                    });
                }
            },
            showValidation: function () {
                if (this.material) {
                    this.$("#lblMaterial").text(window.app.idioma.t("MATERIAL") + ": ");
                    this.$("#lblCodMaterial").text(this.material.idMaterial);
                    this.$("#DesMaterial").text("(" + this.material.nombre + ")");

                    if (this.material.codEan) {
                        this.$("#lblMaterialRegistrado").text(window.app.idioma.t("MATERIAL_CORRECTO"));
                        this.$("#divVal").css("background", "#84e184");
                        this.$("#divMaterial").show()
                    } else {
                        this.$("#lblMaterialRegistrado").text(window.app.idioma.t("MATERIAL_INCORRECTO"));
                        this.$("#divVal").css("background", "#ff8080");
                        this.$("#divMaterial").show()
                    }
                } else {
                    this.$("#divMaterial").hide();
                    this.$("#lblMaterialRegistrado").text(window.app.idioma.t("MATERIAL_INCORRECTO"));
                    this.$("#divVal").css("background", "#ff8080");
                }
                this.$("#divValidacion").show();
            },
            cancelar: function () {
                var self = this;
                self.$("#divValidacion").hide();
                var txtCodEan = self.$("#txtCodEan");

                if (txtCodEan.val()) {
                    var numbers = txtCodEan.val().toString().split('');
                    var value = "";

                    for (i = 0; i < numbers.length - 1; ++i) {
                        value = value + numbers[i];
                    }
                    txtCodEan.val(value);
                }
            },
            eliminar: function () {
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

        return vistaComprobarMaterial;
    });