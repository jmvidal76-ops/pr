define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_Notas.html',
    'compartido/notificaciones',
    'vistas/vDialogoConfirm',
    'jszip', 'compartido/utils', 'definiciones'
],
    function (_, Backbone, $, FormDetalleOrden, Not, VistaDlgConfirm, JSZip, utils, definiciones) {
        var vistaDetalleOrden = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoNotas',
            idWO : null,
            confirmacion: null,
            nota: null,
            template: _.template(FormDetalleOrden),
            isOrdenActiva:null,
            IdEstadoWO: definiciones.IdEstadoWO(),
            tipoWO: definiciones.TipoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            estadoColor: definiciones.EstadoColor(),
            window: null,
            initialize: function (idWO,Nota,isOrdenActiva) {
                var self = this;
                self.idWO = idWO;
                self.nota = Nota;
                self.isOrdenActiva = isOrdenActiva;
                self.render();
                //self.SetWOKOPColor();

            },
            render: function () {
                var self = this;
                $(self.el).html(this.template());
                self.CargarTabNota(self);
                if (!self.isOrdenActiva) {
                    $("#btnSaveNotes").remove();
                }
            },
            events: {
                'click #btnSaveNotes': 'SaveNotes',
            },
            CargarTabNota: function (self) {
                if (!$("#auxEditor").data("kendoEditor")) {
                    $("#auxEditor").kendoEditor({ tools: [] });
                }
                
                $("#auxEditor").data("kendoEditor").value(self.nota);
                $("#btnSaveNotes").kendoButton();
                $("#btnSaveNotes").kendoButton();
                $("#btnSaveNotes").text(window.app.idioma.t('GUARDAR'));
                $("#btnSaveNotes").addClass("k-button btn-success");
                $("#btnSaveNotes").kendoButton({
                    click: function (e) { e.preventDefault(); self.SaveNotes(); }
                });
                //$("#auxEditor").data("kendoEditor").refresh();
            },
            SaveNotes: function () {
                var self = this;
                var value = $("#auxEditor").data("kendoEditor").value();
                if (value == undefined || value == '﻿')
                    value = "";
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('EDITAR_NOTAS_ORDEN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_AÑADIR_LAS'),
                    funcion: function (e) { self.ActualizarNota(value); },
                    contexto: this
                });

            },
            ActualizarNota: function (value) {
                var self = this;
                datos = { orderID: self.idWO, text: value };
                $.ajax({
                    type: "POST",
                    url: "../api/OrdenesFab/SetNoteWOFinalizadas/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true
                }).done(function (res) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('NOTAS_ACTUALIZADAS_CORRECTAMENTE'), 4000);
                    self.nota = value;
                    self.SetColorTabNotas();
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_NO_SE'), 4000);
                });

                Backbone.trigger('eventCierraDialogo');
            },
            SetColorTabNotas: function () {
                var self = this;
                var backGroundColor = "#eae8e8";
                if (self.nota) {
                    backGroundColor = "lightgreen";
                }

                $("#divNotas").css("background-color", backGroundColor);

            },
            eliminar: function () {
                this.remove();
            },
        });
        return vistaDetalleOrden;
    });