define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/DuplicarEntry.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgDuplicarEntry, Not, VistaDlgConfirm) {
        var vistaDuplicarEntry = Backbone.View.extend({
            tagName: 'div',
            id: 'divDuplicarEntry',
            datos: null,
            window: null,
            order: null,
            procs: [],
            template: _.template(plantillaDlgDuplicarEntry),
            initialize: function (data) {
                var self = this;
                self.datos = data;              
                
                $.ajax({
                    type: "GET",
                    url: "../api/OrdenesFab/GetProcedimientosOrden/" + parseInt(self.datos.idOrden),
                    dataType: "json",
                    cache: false,
                    async: false,
                }).done(function (data) {
                    self.procs = data;
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS_PROD'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerDetalleOrdenFab/" + parseInt(self.datos.idOrden),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.order = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                //$("#txtProcFechaInicio").kendoDateTimePicker({
                //    format: "dd/MM/yyyy HH:mm:ss",
                //    culture: "es-ES",
                //    value: new Date()
                //});

                $("#cmbProc").kendoDropDownList({
                    dataTextField: "Des_Procedimiento",
                    dataValueField: "ID_Procedimiento",
                    dataSource: new kendo.data.DataSource({
                        data: self.procs,
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#txtOrden").html(self.order.id);
                $("#txtTipoOrden").html(self.order.tipoOrden.descripcion);
                $("#txtEstado").html(self.order.estadoActual.descripcion);
                $("#txtFechaInicio").html(self.order.fecInicio);


                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('DUPLICAR_ENTRY_2'),
                    width: "750px",
                    height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divDeclararProd').data("kendoWindow");
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
                
                var valor = $("#cmbProc").data("kendoDropDownList").value();

                if (valor !== '' && valor !== null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('DUPLICAR_ENTRY')
                        , msg: window.app.idioma.t('DESEA_REALMENTE_DUPLICAR'), funcion: function () { self.duplicaProcedimiento(); }, contexto: this
                    });
                }
                else {
                    $("#lblError").show();
                }

            },
            duplicaProcedimiento: function () {
                var self = this;

                var ordenId = self.order.id;
                var proc = $("#cmbProc").data("kendoDropDownList").value();
                //var fecha = $("#txtProcFechaInicio").val();

                var fechaEnt = new Date(fecha).getTime();

                var datos = {};
                //datos.fecha = fechaEnt;
                datos.proc = proc;
                datos.orden = ordenId;

                $.ajax({
                    type: "POST",
                    url: "../api/duplicarEntry/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false,
                }).done(function (res) {
                    $("#gridProcs").data('kendoGrid').dataSource.read();
                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DUPLICADO_EL_PROCEDIMIENTO'), 4000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DECLARAR_PROD'), 4000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaDuplicarEntry;
    });