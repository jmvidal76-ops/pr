define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearCFG.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCurva',
            equiposDisponibles: null,
            window: null,
            materiales: null,
            selectedPK: null,
            material: null,
            kop: null,
            kopGrid: null,
            GetDatas: null,
            GetDatasJson: null,
            SetDatas: null,
            ddlMat: null,
            tipo: null,
            update: false,
            oldLabel: null,
            numCfg:10,
            isText: false,
            template: _.template(plantillaCrearLote),
            UpdateRender: function (pk, tipo, dataRow) {
                var self = this;
                this.render(pk, tipo);

                if (!($("#txtMinimo").data("kendoNumericTextBox") === undefined)) {
                    $("#txtMinimo").data("kendoNumericTextBox").value(dataRow.Min_Value);
                    $("#txtMaximo").data("kendoNumericTextBox").value(dataRow.Max_Value);
                }
                else {
                    $("#txtMinimo").val(dataRow.Min_Value);
                    $("#txtMaximo").val(dataRow.Max_Value);
                }
                self.oldLabel = dataRow.Label;
                $("#txtLabel").val(dataRow.Label);
                $("#txtUOM").val(dataRow.UOM);
            },
            initialize: function (kopObj,masterRowKop, masterRowMaterial, dataRow, updateAction,funcGet, funcGetJson, funcSet) {
                var self = this;
                self.material = kopObj.Material;
                self.kop = kopObj;
                self.kopGrid = masterRowKop;
                self.GetDatas = funcGet;
                self.GetDatasJson = funcGetJson;
                self.SetDatas = funcSet;
                var row = masterRowMaterial.detailRow.find("#gridDetalleArticulo").data("kendoGrid").dataItem(masterRowKop.masterRow[0]);
                self.selectedPK = row.KopID;
                self.tipo = row.Datatype; //masterRowKop.masterRow[0].children[masterRowKop.masterRow[0].children.length - 1].innerText;
                self.update = updateAction;

                if (!self.update)
                    this.render(self.selectedPK, self.tipo);
                else
                    self.UpdateRender(self.selectedPK, self.tipo, dataRow)
            },
            render: function (pk, tipo) {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                switch (tipo) {
                    case window.app.idioma.t('TIPO_TEXTO'):
                        $("#txtMinimo").addClass("k-textbox");
                        $("#txtMaximo").addClass("k-textbox");
                        self.isText = true;
                        break;                    
                    case window.app.idioma.t('TIPO_NUMERICO'):
                        $("#txtMinimo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 2,
                            min: -9999,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            format: 'n2'
                        });
                        $("#txtMaximo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 2,
                            min: -9999,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            format: 'n2'
                        });
                        break;
                    case window.app.idioma.t('TIPO_FECHA'):
                        $("#txtMinimo").kendoDateTimePicker({
                            format:kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });
                        $("#txtMaximo").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });
                        break;
                }

                var titulo = self.update ? window.app.idioma.t('UPDATED_MULTIVALUE_KOP') : window.app.idioma.t('CREATED_MULTIVALUE_KOP');
                self.window = $(self.el).kendoWindow(
                {
                    title: titulo,
                    width: "750px",
                    height: "200px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divCrearCurva').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
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
                var title = self.update ? window.app.idioma.t('UPDATED_MULTIVALUE_KOP'): window.app.idioma.t('CREATED_MULTIVALUE_KOP');
                var sms = self.update ? window.app.idioma.t('MSG_UPDATED_MULTIVALUE_KOP') : window.app.idioma.t('MSG_CREATED_MULTIVALUE_KOP');
                var max, min;

                if (!self.isText) {
                    if ($("#txtMaximo").val() == "")
                        max = $("#txtMaximo").text().replace(",", ".");
                    else
                        max = $("#txtMaximo").val().replace(",", ".");

                    if ($("#txtMinimo").val() == "")
                        min = $("#txtMinimo").text().replace(",", ".");
                    else
                        min = $("#txtMinimo").val().replace(",", ".");

                    var rexp = new RegExp(/^(\d{4}|\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{1}|\d{2}|\d{4}) (\d{1}|\d{2}):\d{2}:\d{2}$/);

                    if (rexp.test(min) || rexp.test(max)) {
                        min = Date.parse(min);
                        max = Date.parse(max);
                    }
                    else {
                        min = parseFloat(min);
                        max = parseFloat(max);
                    }

                    if (min >= max || max <= min)
                        $("#errorMsg").show();
                    else {
                        $("#errorMsg").hide();
                        this.confirmacion = new VistaDlgConfirm({ titulo: title, msg: sms, funcion: function () { self.creaCurva(); }, contexto: this });
                    }
                } else
                    this.confirmacion = new VistaDlgConfirm({ titulo: title, msg: sms, funcion: function () { self.creaCurva(); }, contexto: this });
            },
            creaCurva: function () {
                var self = this,
                    cmbName;

                var datos = {};
                datos.label = $("#txtLabel").val();

                var date = new RegExp(/^(\d{4}|\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{1}|\d{2}|\d{4}) (\d{1}|\d{2}):\d{2}:\d{2}$/);
                if (date.test($("#txtMinimo").val()) && date.test($("#txtMaximo").val())) {
                    $("#txtMinimo").data("kendoDateTimePicker").value($("#txtMinimo").val());
                    $("#txtMaximo").data("kendoDateTimePicker").value($("#txtMaximo").val());

                    datos.min = kendo.format("{0:MM/dd/yyyy HH:mm:ss}", $("#txtMinimo").data("kendoDateTimePicker").value());
                    datos.max = kendo.format("{0:MM/dd/yyyy HH:mm:ss}", $("#txtMaximo").data("kendoDateTimePicker").value());                    
                }
                else {
                    datos.min = $("#txtMinimo").val().replace(",", ".");
                    datos.max = $("#txtMaximo").val().replace(",", ".");
                }
                datos.uom = $("#txtUOM").val();
                datos.idkop = self.selectedPK;
                datos.material = self.material;
                datos.proccess = self.kop.Proccess;                
                datos.orderId = -1;
            
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

                datos.area = $("#cmbArea" + cmbName).data("kendoDropDownList").text();

                if ($(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.indexOf(window.app.idioma.t('FERMENTACION')) != -1) {
                    if ($("#cmbAreaFER").data("kendoDropDownList").text().indexOf("FE") != -1)
                        datos.phase = window.app.idioma.t('FASE_FERMENTACION');
                    else
                        if ($("#cmbAreaFER").data("kendoDropDownList").text().indexOf("GU") != -1)
                            datos.phase = window.app.idioma.t('FASE_GUARDA');
                        else
                            datos.phase = window.app.idioma.t('FASE_TRASIEGO');
                }
                else
                    datos.phase = $(".k-item.k-state-default.k-tab-on-top.k-state-active")[0].innerText.toUpperCase();

                var url = null,
                    sms = null,
                    error = null;

                if (!self.update) {
                    url = "../api/crearCFGCurva/";
                    sms = window.app.idioma.t('MSG_OK_CREATED_MULTIVALUE_KOP');
                    error = window.app.idioma.t('MSG_FAIL_CREATED_MULTIVALUE_KOP');

                } else {
                    datos.oldLabel = self.oldLabel;
                    url = "../api/ActualizarCFGCurva/";
                    sms = window.app.idioma.t('REGISTRO_ACTUALIZADO_CORRECTAMENTE');
                    error = window.app.idioma.t('MSG_FAIL_UPDATED_MULTIVALUE_KOP');
                }

                $.ajax({
                    type: "POST",
                    url: url,
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    var aux = self.kop.Material;//self.material.masterRow.children()[1].innerText;

                    var datos = {};
                    datos.pkKop = self.kop.KopID;
                    datos.material = (aux.indexOf("defecto") != -1 ? "Default" : aux);
                    datos.area = self.kop.Area;

                    self.GetDatasJson("POST", "../api/GetCFGCurva", true, self.kopGrid.detailRow.find("#gridDetalleKop"), self.SetDatas, self.numCfg, datos);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), sms, 3000);
                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), error, 2000);
                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearLote;
    });