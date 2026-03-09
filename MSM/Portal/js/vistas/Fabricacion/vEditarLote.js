define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarLote.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarLote',
            window: null,
            datos: null,
            areaAdit: null,
            selectedMasterRow: null,
            template: _.template(plantillaCrearLote),
            initialize: function (masterRow,filaDatos, area) {
                var self = this;
                self.datos = filaDatos;
                self.selectedMasterRow = masterRow;
                self.areaAdit = area;
                this.render(filaDatos, area);
            },
            render: function (filaDatos, area) {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                if(filaDatos.Descript.toUpperCase().indexOf("LEVADURA") != -1)
                    $("#lblote").html("Matrícula-Generación:");

                this.$("#txtEquipo").html(filaDatos.Descripcion);
                this.$("#txtMaterial").html(filaDatos.Descript);
                this.$("#txtCantidad").html(filaDatos.Quantity);

                $("#lblTipoOrden").html(window.app.idioma.t('NUEVA_CANTIDAD') + ":");

                $("#txtCantidadAdit").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    value: filaDatos.Quantity,
                    culture: "es-ES",
                    spinners: true
                });

                this.$("#txtCantidad").hide();

                this.$("#txtSerie").val(filaDatos.serialNumber);


                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('EDITAR_LOTE'),
                    width: "750px",
                    height: "220px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divEditarLote').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar'
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                e.preventDefault();
                var self = this;

                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('EDITAR_LOTE'), msg: window.app.idioma.t('DESEA_REALMENTE_EDITAR_ESTE'), funcion: function () { self.editarLote(); }, contexto: this });

            },
            editarLote: function () {
                var self = this;

                var serie = $("#txtSerie").val();

                var datosString = {};
                datosString.equipo = self.datos.LocPath;
                datosString.material = self.datos.DefID;
                datosString.lotpk = self.datos.LotPK;
                //if (self.areaAdit === "ADITIVOS")
                //{
                var cantidadFinal = $("#txtCantidadAdit").data("kendoNumericTextBox").value();
                datosString.cantidad = cantidadFinal - self.datos.Quantity;
                //}
                //else
                //    datosString.cantidad = self.datos.Quantity;
                datosString.serie = serie;

                $.ajax({
                    type: "POST",
                    url: "../api/editarLote/",
                    dataType: 'json',
                    data: JSON.stringify(datosString),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    var datos = $("#gridGestionMateriales").data("kendoGrid").dataItem($("#gridGestionMateriales").data("kendoGrid").select());
                    var idEq = datos.LocPK;
                    var dsLote = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/Materiales/GetMaterialesUbicacion/" + idEq,
                                dataType: "json"
                            }
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "DefID",
                                fields: {
                                    'LocPK': { type: "number" },
                                    'LocPath': { type: "string" },
                                    'LotPK': { type: "number" },
                                    'InitQuantity': { type: "number" },
                                    'Quantity': { type: "number" },
                                    'UomID': { type: "string" },
                                    'DefID': { type: "string" },
                                    'Descript': { type: "string" },
                                    'DefPK': { type: "number" },
                                    'ClassDescript': { type: "string" },
                                    'LastUpdate': { type: "date" },
                                    'LoteMes': { type: "string" },
                                    'CreatedOn': { type: "date" }
                                }
                            }
                        },
                        sort: { field: "CreatedOn", dir: "asc" }
                    });
                    
                    $(self.selectedMasterRow.detailRow.find("#gridDetalleLote")).data("kendoGrid").setDataSource(dsLote);
                    $("#pass").text("true");
                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITADO_EL_LOTE'), 4000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR'), 4000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearLote;
    });