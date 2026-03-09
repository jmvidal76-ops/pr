define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CambiarProcedimientos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgCambiarProcedimientos, Not, VistaDlgConfirm) {
        var vistaCambiarProcedimientos = Backbone.View.extend({
            tagName: 'div',
            id: 'divCambiarProcedimientos',
            datos: null,
            window: null,
            equipos: [],
            tipo: null,
            template: _.template(plantillaDlgCambiarProcedimientos),
            initialize: function (data, tipoProc) {
                var self = this;
                self.datos = data;
                self.tipo = tipoProc;

                this.render();
            },
            render: function () {
                var self = this;
                //this.datos.tipo = self.tipo;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({ 'proc': this.datos }));

                $("#btnAceptar").kendoButton({
                    click: function () { self.confirmarEdicion(); }
                });
                $("#btnCancelar").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                $("#txtStartDate").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()//self.datos.Tiempo_Inicio
                });

                $("#txtFecha").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('AÑADIR_PROCESO_A'),
                    width: "500px",
                    height: "350px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divCambiarProcedimientos').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
            },
            CancelarFormulario: function () {
                this.window.close();
            },
            confirmarEdicion: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('AÑADIR_PROCESO')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_AÑADIR'), funcion: function () { self.cambiaEstadoProcedimiento(); }, contexto: this
                });
            },
            cambiaEstadoProcedimiento: function () {
                var self = this;
                var datosProc = {};

                datosProc.entryPK = self.datos.ID_Proc;
                datosProc.startDate = $("#txtStartDate").val();
                datosProc.endDate = $("#txtFecha").val();

                $.ajax({
                    type: "POST",
                    url: "../api/UpdateProc/",
                    dataType: 'json',
                    data: JSON.stringify(datosProc),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: false,
                }).done(function (res) {
                    $("#gridProcs").data('kendoGrid').dataSource.read();
                    $("#gridProcs").data('kendoGrid').refresh();
                    $("#gridKOPS").data('kendoGrid').dataSource.read();
                    $("#cmdProc").data('kendoDropDownList').select(0);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROCESO_AÑADIDO_CORRECTAMENTE'), 4000);
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DECLARAR_PROD'), 4000);
                });
                self.window.close();
                Backbone.trigger('eventCierraDialogo');
                self.eliminar();
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCambiarProcedimientos;
    });