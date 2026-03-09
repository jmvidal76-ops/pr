define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EliminarCurva.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaEliminarCurva = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCurva',
            window: null,
            auxDs: null,
            phase: null,
            area: null,
            GetDatas: null,
            GetDatasJson: null,
            SetDatas: null,
            idMaterial: null,
            idKop: null,
            material: null,
            numKops: 10,
            master: null,
            processes: [],
            template: _.template(plantillaCrearLote),
            initialize: function (area, funcGet, funcGetJson, funcSet, masterRowMaterial, MaterialId, KOPId) {
                var self = this;

                self.area = area;
                self.master = masterRowMaterial;
                self.GetDatas = funcGet;
                self.GetDatasJson = funcGetJson;
                self.SetDatas = funcSet;
                self.idMaterial = MaterialId;
                self.idKOP = KOPId;

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('ELIMINAR_KOP_MULTIVALOR'),
                        width: "550px",
                        height: "300px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: []
                    }).data("kendoWindow");

                self.dialog = $('#divCrearCurva').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                self.setProcess();

                $("#cmbMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    dataSource: $(".k-content.k-state-active").find($(".k-grid.k-widget")).data("kendoGrid").dataSource._data,
                    dataBound: function () {
                        this.select(0);
                        //$(".k-content.k-state-active").find($(".k-grid.k-widget")).data("kendoGrid").dataSource._data.length - 1
                    }
                });
                if (self.idMaterial != null) {
                    var materialesDDL = $("#cmbMaterial").data("kendoDropDownList");
                    materialesDDL.select(function (dataItem) {
                        return dataItem.idMaterial === self.idMaterial;
                    });
                }

                if ($(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.indexOf(window.app.idioma.t('FERMENTACION')) != -1) {
                    if ($("#cmbAreaFER").data("kendoDropDownList").text().indexOf("FE") != -1)
                        self.phase = window.app.idioma.t('FASE_FERMENTACION');
                    else
                        if ($("#cmbAreaFER").data("kendoDropDownList").text().indexOf("GU") != -1)
                            self.phase = window.app.idioma.t('FASE_GUARDA');
                        else
                            self.phase = window.app.idioma.t('FASE_TRASIEGO');
                }
                else
                    self.phase = $(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.toUpperCase();

                $("#txtPhase").val(self.phase);

                $("#txtArea").val(window.app.idioma.t('TODAS'));

                self.GetKopsByPhase();
            },
            GetKopsByPhase: function () {
                var self = this;
                var dato = {};
                dato.phase = self.phase;
                dato.material = null;
                dato.orderId = '-1';
                dato.area = null
                dato.enable = '1';

                $.ajax({
                    type: "POST",
                    url: "../api/GetKOPSCurvaByPhase/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: true,
                    async: false
                }).done(function (data) {
                    $("#cmbKop").kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "KopID",
                        dataSource: data,
                        dataBound: function () {
                            this.select(0);
                        }
                    });
                    if (self.idKOP != null) {
                        var materialesDDL = $("#cmbKop").data("kendoDropDownList");
                        materialesDDL.select(function (dataItem) {
                            return dataItem.KopID === self.idKOP;
                        });
                    }
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });

            },
            setProcess: function () {
                var self = this,
                    cmbName = "";

                if ($(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.indexOf(window.app.idioma.t('COCCION')) != -1)
                    cmbName = "COC";
                else
                    if ($(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.indexOf(window.app.idioma.t('FERMENTACION')) != -1)
                        cmbName = "FER";
                    else
                        if ($(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.indexOf(window.app.idioma.t('FILTRACION')) != -1)
                            cmbName = "FIL";
                        else
                            cmbName = "PRE"

                $.ajax({
                    type: "POST",
                    url: "../api/OrdenesFab/GetProcedimientosByWoType/" + $("#cmbArea" + cmbName).data("kendoDropDownList").text(),
                    dataType: 'json',
                    cache: true,
                    async: false
                }).done(function (data) {
                    self.processes = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
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

                self.VistaDlgConfirm = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('BORRAR_KOP_MULTIVALOR')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTE_KOP'), funcion: function () { self.DeleteCurva(); }, contexto: this
                });
            },
            DeleteCurva: function () {
                var self = this;

                var datos = {};
                datos.OrderID = -1;
                datos.Material = $("#cmbMaterial").data("kendoDropDownList").value();
                self.material = datos.Material;
                datos.KopID = $("#cmbKop").data("kendoDropDownList").value();

                $.ajax({
                    type: "POST",
                    url: "../api/DeleteCurva/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (data) {
                    self.dialog.close();
                    self.eliminar();
                    self.VistaDlgConfirm.finProceso();
                    var datos = {};
                    datos.phase = self.phase;
                    datos.material = (self.material.indexOf("Dummy") != -1 ? "Default" : self.material);
                    datos.area = self.area;
                    datos.enable = null;
                    datos.orderId = null;

                    self.GetDatasJson("POST", "../api/GetKOPSCurva/  " , true, self.master.detailRow.find("#gridDetalleArticulo"), self.SetDatas, self.numKops);
                    var masterGrid = $(self.master.detailRow.find("#gridDetalleArticulo")).parents('.k-grid.k-widget')[0];
                    //se vacía para que no falle la visualización.
                    if (masterGrid != undefined)
                        var item = $("#" + masterGrid.id).data("kendoGrid").select(0)[0];
                    if (item != undefined)
                        $("#" + masterGrid.id).data("kendoGrid").collapseRow(item);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('KOP_MULTIVALOR_ELIMINADO'), 4000);
                }).fail(function (err) {
                    self.dialog.close();
                    self.eliminar();
                    self.VistaDlgConfirm.finProceso();
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINANDO_EL'), 4000);
                });

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaEliminarCurva;
    });