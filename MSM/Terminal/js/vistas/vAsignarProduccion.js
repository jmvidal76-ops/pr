define(['underscore', 'backbone', 'jquery', 'text!../../html/EditarAsignacionProduccion.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaAsignarProduccion, VistaDlgConfirm, Not) {
        var vistaEditarAsignacionProduccion = Backbone.View.extend({
            tagName: 'div',
            id: 'divAsignarProduccion',
            parent: null,
            lineas: null,
            template: _.template(PlantillaAsignarProduccion),
            initialize: function (options) {
                var self = this;
                self.parent = options.ventanaPadre;
                self.lineas = options.lineasCompartidas;

                self.render();
                self.dialog.center();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                self.$("#btnAceptarAP").kendoButton();
                self.$("#btnCancelarAP").kendoButton();

                self.grid = this.$("#gridWO").kendoGrid({
                    dataSource: self.lineas,
                    filterable: {
                        extra: false,
                        //messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        //operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: false,
                    resizable: false,
                    scrollable: false,
                    columns: [                        
                        {                            
                            field: "numLinea",
                            title: window.app.idioma.t('LINEA'),
                            width: 330,
                            filterable: false,
                            template: window.app.idioma.t("LINEA") + " #: numLineaDescripcion # - #: descLinea#"
                        },
                        {
                            title: window.app.idioma.t('PORCENTAJE'),
                            template: function (dataItem) {
                                var name = dataItem.numLinea;
                                var value = dataItem.tagValue ? dataItem.tagValue : 0;
                                return '<div style="font-size: 40px;"><input type="text" id="' + name + '" name="numericTextBox" value="' + value + '" style="width: 160px;" /> %</div>'
                            },
                            width: 250
                        },
                    ],
                    dataBound: function () {
                        self.$('input[type="text"]').kendoNumericTextBox({
                            placeholder: '',
                            decimals: 0,
                            min: 0,
                            max: 100,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            format: '0',
                            change: function () {
                                self.changeKendoNumeric(this);
                            },
                            spin: function () {
                                self.changeKendoNumeric(this);
                            }                           
                        });
                    },
                }).data("kendoGrid");

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('ASIGNAR_PRODUCCION'),
                    width: "610px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                }).data("kendoWindow");
                                

                self.dialog = $('#divAsignarProduccion').data("kendoWindow");
                self.dialog.center();                                        
            },
            changeKendoNumeric: function(numerictextbox)
            {
                var self = this;
                var id = numerictextbox.element.context.id
                var value = numerictextbox.value();
                var max = numerictextbox.max();
                var globalValue = 0;
                $.each(self.$('#divWO').find('input[name="numericTextBox"]'), function (index, control) {
                    if (control.id != id) {
                        var textbox = $(control).data("kendoNumericTextBox");
                        globalValue += textbox.value();
                    }
                });

                if ((globalValue + value) == max) {
                    self.$('#divAviso').css('color', 'green');
                    self.$('#divAviso').html(window.app.idioma.t('TOTAL_2') + " " + max);
                } else {
                    self.$('#divAviso').css('color', 'red');
                    self.$('#divAviso').html(window.app.idioma.t('TOTAL_2') + " " + (globalValue + value));
                }
            },
            events: {
                'click #btnAceptarAP': 'confirmarEdicion',
                'click #btnCancelarAP': 'cancelar',
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            confirmarEdicion: function (e) {
                var self = this;
                if (e) {
                    e.preventDefault();
                }
                var total = 0;

                $.each(self.$('#divWO').find('input[name="numericTextBox"]'), function (index, control) {
                    var textbox = $(control).data("kendoNumericTextBox");
                    total += textbox.value();
                });

                if (total < 100) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TOTAL_PRODUCCION_MENOR'), 4000);
                    return;
                }

                if (total > 100) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TOTAL_PRODUCCION_MAYOR'), 4000);
                    return;
                }

                if (self.lineas) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ASIGNACION_PRODUCCION'),
                        msg: window.app.idioma.t('CONFIRMACION_MODIFICAR_REGISTROS'),
                        funcion: function () { self.editarParametros(); },
                        contexto: this
                    });
                } else {
                    self.cancelar();
                }
            },
            editarParametros: function () {
                var self = this;
                var datos = [];

                $.each(self.$('#divWO').find('input[name="numericTextBox"]'), function (index, control) {
                    var textbox = $(control).data("kendoNumericTextBox");
                    var datoLinea = {};
                    datoLinea.numLinea = control.id;
                    datoLinea.value = textbox.value();
                    datos.push(datoLinea);
                });
                
                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    //async: false,
                    url: "../api/modificarAsignacionLlenadoras",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {                            
                            setTimeout(() => {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                                self.parent.actualiza();
                                self.cancelar();
                            }, 500);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            }
        });

        return vistaEditarAsignacionProduccion;
    });