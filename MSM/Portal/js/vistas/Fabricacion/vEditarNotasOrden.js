define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarNotasOrden.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaNotas, Not, VistaDlgConfirm) {
        var vistaNotas = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',
            orderID: null,
            grid: null,
            order: null,
            notes: null,
            editor: null,
            gridActual: null,
            template: _.template(plantillaNotas),
            initialize: function (OrderID,GridActual) {
                var self = this;
                self.orderID = OrderID;                
                self.gridActual = GridActual;
                var datos = {};
                datos.orderID = self.orderID
                
                $.ajax({                    
                    type: "POST",
                    async: false,
                    url: "../api/OrdenesFab/GetPlannedOrderNotes/",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(datos),
                    dataType: "json",
                    cache: false,
                }).done(function (res) {
                    self.notes = res;
                    self.render();
                }).fail(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_LAS'), 4000);
                    }                    
                });
                
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#editor").kendoEditor({ tools: [] });
                this.$("#editor").data("kendoEditor").value(self.notes);
                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('AÑADIR_NOTAS_A'),
                    width: "575px",
                    height: "315px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
            },
            eliminar: function () {
                this.remove();
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('EDITAR_NOTAS_ORDEN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_AÑADIR_LAS'), funcion: function (e) { self.AñadirNotas(e); }, contexto: this
                });
            },
            AñadirNotas: function (e) {
                var self = this;
                datos = { orderID: self.orderID, text: $("#editor").data("kendoEditor").value() };
                $.ajax({
                    type: "POST",
                    url: "../api/OrdenesFab/SetPlannedOrderNotes/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    if (self.order != null && !self.envasado) {
                        $("#auxEditor").data("kendoEditor").value(self.$("#editor").data("kendoEditor").value());
                        $("#auxEditor").data("kendoEditor").refresh();
                        $("#auxEditor").data("kendoEditor").body.contentEditable = false;
                    }

                    if ($(self.gridActual).data("kendoGrid") != undefined) {                        
                        $(self.gridActual).data("kendoGrid").dataSource.read();
                    }

                    
                    try {
                        if (self.envasado) {
                            var notas = self.$("#editor").data("kendoEditor").value();
                            var rowExpand = self.grid.find(".k-detail-row:visible");
                            if (notas.length > 0) {
                                
                                rowExpand.find("#divNotas").css({ "background-color": "green", "color": "white" });
                            } else {
                                rowExpand.find("#divNotas").css({ "background-color": "", "color": "" });
                            }
                           
                            rowExpand.find("#auxEditor").data("kendoEditor").value(self.$("#editor").data("kendoEditor").value());
                            rowExpand.find("#auxEditor").data("kendoEditor").refresh();
                            rowExpand.find("#auxEditor").data("kendoEditor").body.contentEditable = false;
                        }                        
                    }
                    catch (err) {
                       
                    }

                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('NOTAS_ACTUALIZADAS_CORRECTAMENTE'), 4000);
                 
                    self.cancelar(e);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_NO_SE'), 4000);
                    self.cancelar(e);
                });
            }
        });

        return vistaNotas;
    });