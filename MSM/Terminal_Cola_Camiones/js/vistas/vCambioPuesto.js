define(['underscore', 'backbone', 'jquery', 'keyboard', 'text!../../html/CambioPuesto.html', 'compartido/notificaciones'],
    function (_, Backbone, $, Keyboard, plantillaCambioPuesto, Not) {
        var VistaCambioPuesto = Backbone.View.extend({
            template: _.template(plantillaCambioPuesto),
            tagName: 'div',
            id: 'dlgCambioPuesto',
            initialize: function () {
                $("body").append($(this.el));
                this.render();
            },
            render: function () {
                $(this.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();


                this.$("#cmbLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                });

                var ddlLineas = $("#cmbLinea").data("kendoDropDownList");
                if (window.app.lineaSel) {
                    ddlLineas.value(window.app.lineaSel.id);

                    this.$("#cmbZona").kendoDropDownList({
                        dataTextField: "descripcion",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: window.app.lineaSel.zonas,
                            sort: { field: "numZona", dir: "asc" }
                        }),
                    });

                    var ddlZonas = $("#cmbZona").data("kendoDropDownList");
                    ddlZonas.value(window.app.zonaSel.id);
                }

                //add for ALT
                this.$("#cmbPdvs").kendoDropDownList({
                    dataTextField: "descript",
                    dataValueField: "ID",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.calidad.pdvs,
                        sort: { field: "descript", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });
                var ddlPDVs = $("#cmbPdvs").data("kendoDropDownList");
                ddlPDVs.value(window.app.pdvSel);



                $(this.el).kendoWindow({
                    title: window.app.idioma.t("CAMBIO_LINEAZONA"),
                    width: "700px",
                    height: "400px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                });

                this.dialog = $(this.el).data("kendoWindow");
                this.dialog.center();

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cerrar',
                'change #cmbLinea': 'cambiaLinea'
            },
            aceptar: function () {
                var self = this;
                var sesion = window.app.sesion;
                var indexLineaSel = this.$("#cmbLinea option:selected").val();

                if (indexLineaSel != -1) sesion.set("linea", self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(indexLineaSel));

                var indexZonaSel = this.$("#cmbZona option:selected").val();
                if (indexZonaSel != -1) sesion.set("zona", self.$("#cmbZona").data("kendoDropDownList").dataSource.get(indexZonaSel));

                //Add to ALT
                var indexPdvSel = self.$("#cmbPdvs option:selected").val();
                
                if (indexPdvSel != -1) {
                    //window.app.pdvSel = indexPdvSel;
                    sesion.set("pdv", indexPdvSel);
                }
                else {
                    //window.app.pdvSel = null;
                    sesion.set("pdv", null);

                }//

                this.CambiaPuesto(sesion);

            },
            CambiaPuesto: function (sesion) {
                var self = this;
                $.ajax({
                    data: JSON.stringify(sesion),
                    type: "POST",
                    async: false,
                    url: "../api/cambioPuesto",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        Not.quitarNotificacionOrden();
                        Not.crearNotificacion('success', 'Aviso Cambio Linea y Zona', window.app.idioma.t('EL_USUARIO_') + self.model.get("usuario") + window.app.idioma.t('HA_CAMBIADO_DE'), 5000);

                        self.dialog.close();
                        self.eliminar();


                        Backbone.trigger('eventActualizaPie');
                        Backbone.trigger('eventcambioPuesto');
                        if (window.app.vista && window.app.vista.actualiza) {
                            window.app.vista.actualiza(true);
                        }

                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 5000);
                        } else {
                            Not.crearNotificacion('error', 'Erro cambiando de puesto', window.app.idioma.t('SE_HA_PRODUCIDO') + self.model.get("usuario") + window.app.idioma.t('INTENTABA_CAMBIAR_DE'), 5000);
                        }

                    }
                });

                return this.model;
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
            actualiza: function () {
                this.render();
            },
            cambiaLinea: function () {

                var self = this;
                var cmbZonas = self.$("#cmbZona").data("kendoDropDownList");
                var opcSel = this.$("#cmbLinea option:selected").val();
                if (opcSel != "") {
                    cmbZonas.dataSource.data(self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(opcSel).zonas);
                    cmbZonas.select(0);
                }
                else {
                    cmbZonas.dataSource.data([]);
                    cmbZonas.refresh();
                }
            },
            cerrar: function () {
                this.dialog.close();
                this.eliminar();
            }
        });
        return VistaCambioPuesto;
    });