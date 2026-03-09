define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/AgregarPropiedadesMMPPEnvasado.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaPropiedades, Not, VistaDlgConfirm) {
        var vistaAgregarPropiedadesMMPPEnvasado = Backbone.View.extend({
            tagName: 'div',
            id: 'divAgregarPropiedadesMMPPEnvasado',
            window: null,
            checkedItems: null,
            dsTiposPropiedades: null,
            row: null,
            template: _.template(plantillaPropiedades),
            initialize: function ({ checkedItems, dsTiposPropiedades }) {
                var self = this;

                self.checkedItems = checkedItems;
                self.dsTiposPropiedades = dsTiposPropiedades;

                self.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('AGREGAR') + ' ' + window.app.idioma.t('PROPIEDADES'),
                        width: "550px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divAgregarPropiedadesMMPPEnvasado').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            configurarControles: function () {
                var self = this;

                self.$(".tipoPropiedad").kendoDropDownList({
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    dataSource: self.dsTiposPropiedades,
                    change: function (e) {
                        self.obtenerValores(e);
                    }
                });

                self.$(".valorPropiedad").kendoDropDownList({
                    dataTextField: "Valor",
                    dataValueField: "Id"
                });

                $("#btnAceptarPropiedades").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarPropiedades").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            obtenerValores: function (e) {
                var self = this;
                let listaValores = null;

                let datos = {};
                datos.idTipoPropiedad = e.sender.value();

                if (datos.idTipoPropiedad != "") {
                    $.ajax({
                        url: "../api/propiedadesMMPP/valoresPorTipo",
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        data: datos,
                        async: false
                    }).done(function (datos) {
                        listaValores = datos;
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_VALORES_PROPIEDADES'), 4000);
                        }
                    });
                }

                self.dsValores = new kendo.data.DataSource({
                    data: listaValores,
                });

                let comboValorPropiedad = e.sender.wrapper.siblings('.valorPropiedad').find('select').data("kendoDropDownList");
                comboValorPropiedad.setDataSource(self.dsValores);
                comboValorPropiedad.select(0);
            },
            events: {
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            guardar: function () {
                var self = this;

                //kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), true);
                let data = [];

                $.each(self.checkedItems, function (index, item) {
                    $(".filaPropiedades").each(function (index, prop) {
                        let comboTipoPropiedad = $(prop).find("select.tipoPropiedad").data("kendoDropDownList");
                        if (comboTipoPropiedad.value() == '') { return; }
                        let comboValorPropiedad = $(prop).find("select.valorPropiedad").data("kendoDropDownList");

                        data.push({
                            CodigoEAN: item.CodigoEAN,
                            CodigoMaterial: item.CodigoMaterial,
                            UnidadMedida: item.UnidadMedida,
                            DescripcionPropiedad: comboTipoPropiedad.value(),
                            Valor: comboValorPropiedad.value()
                        });
                    });
                });

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/propiedadesMMPP/AgregarMultiple",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        //kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), false);
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            $("#gridPropMMPP").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_CORRECTAMENTE'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREAR_PROPIEDAD'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        //kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREAR_PROPIEDAD'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaAgregarPropiedadesMMPPEnvasado;
    });