define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/UpdateCurva.html', 'compartido/notificaciones', 'definiciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaUpdateCurva, Not, definiciones, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarMultivalor',
            window: null,
            tipos: null,
            data: null,
            filaSeleccionada:null,
            ifMosto: false,
            tipoProcesoSeleccionado: null,
            tiposWO: definiciones.TipoWO(),
            template: _.template(plantillaUpdateCurva),
            initialize: function (data, filaSeleccionada) {
                var self = this;
                self.data = data;
                self.filaSeleccionada = filaSeleccionada
                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                
                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('ACTUALIZAR_KOP_MULTIVALOR'),
                        width: 870,
                        top: "339",
                        left: "410",
                        height: "215",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: []
                    }).data("kendoWindow");

                self.dialog = self.window;
                self.dialog.center();
                self.CargaContenidoMultivalor(self.data);
            },
            events: {

            },
            CargaContenidoMultivalor: function (data) {
                var self = this;

                $("#lblNumero").text(window.app.idioma.t('N_KOPMULTIVALOR') + ": ");
                $("#lblCod").text(window.app.idioma.t('KOP') + ": ");
                $("#lblFase").text(window.app.idioma.t('FASE') + ": ");
                $("#lblProceso").text(window.app.idioma.t('PROCEDIMIENTO') + ": ");
                $("#lblUnidad").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblTipoKOP").text(window.app.idioma.t('TIPOKOP') + ": ");
                $("#lblTipoDato").text(window.app.idioma.t('TIPO_DATO') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));

                $("#btnAceptarKOP").kendoButton({
                    click: function (e) { self.Aceptar(e); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function (e) { self.Cancelar(e); }
                });

                $("#txtNumeroKOP").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    culture: kendo.culture().name,
                    format: 'n0',
                    min:1,
                    value: data.PK
                });
                var _Concatenado = data.COD_KOP + " - " + data.NAME;
                $("#txtCod").text(_Concatenado);

                $("#txtCod").addClass("lblOverflow");
                $("#txtCod").kendoTooltip({
                    filter: $("#txtCod"),
                    content: function (e) {
                        var content = _Concatenado;
                        return content;
                    }
                }).data("kendoTooltip");
                $('#txtFase').val(data.PROCCESS);
                $('#txtUnidad').val(data.MEDIDA);
                $('#txtTipoDato').val(data.DATATYPE.charAt(0).toUpperCase() + data.DATATYPE.slice(1));

                this.$("#cmbTipoKOP").kendoDropDownList({
                    dataValueField: "ID",
                    dataTextField: "Descripcion",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerListadoTiposKOPsMultivalor/",
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Descripcion': { type: "string" },
                                }
                            }
                        },
                    },
                    dataBound: function (e) {
                        let data = this.dataSource.data();
                        var _idTipo = data.find(x => x.Descripcion == self.data.TIPO)?.ID;
                        self.tipoProcesoSeleccionado = _idTipo;
                        this.value(_idTipo);
                    }
                })
            },
            Cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            Aceptar: function (e) {
                e.preventDefault();
                var self = this;
                $("#lblError").hide();
                var resValidacion = this.ValidarCampos();
                if (resValidacion != "") {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t(resValidacion));
                    Backbone.trigger('eventCierraDialogo');
                } else {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ACTUALIZAR_KOP_MULTIVALOR')
                        , msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTE'), funcion: function () { self.ActualizarCurva(); }, contexto: this
                    });
                }

            },
            ValidarCampos: function () {
                var self = this;
                var _NKOP = $("#txtNumeroKOP").data("kendoNumericTextBox") == undefined ? "" : $("#txtNumeroKOP").data("kendoNumericTextBox").value();
                var _valTipoKOP = $("#cmbTipoKOP").data("kendoDropDownList").value();
                var _idSubProceso = self.data.COD_PROCCESS;
                if (!_NKOP || _NKOP == "") {
                    return 'ERROR_N_KOP';
                } else {

                    //if (_NKOP == self.data.PK && _valTipoKOP == self.tipoProcesoSeleccionado) {
                    self.ValidarNumeroKOPMultivalorSubProceso(_NKOP, _idSubProceso, _valTipoKOP)
                        if (self.ifValido) {
                            return 'ERROR_N_KOP_EXISTENTE';
                        }
                    //}
                   
                }

                return "";
            },
            ValidarNumeroKOPMultivalorSubProceso: function (NKOPMultivalor, IdTipoSubProceso,TipoKOP) {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/KOPsFab/ValidarNumeroKOPMultivalorSubProceso/" + NKOPMultivalor + "/" + IdTipoSubProceso + "/" + TipoKOP,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.ifValido = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

            },
            ActualizarCurva: function () {
                var self = this;

                var datos = {};
                var _NKOP = $("#txtNumeroKOP").data("kendoNumericTextBox") == undefined ? "" : $("#txtNumeroKOP").data("kendoNumericTextBox").value();
                var _TipoKOP = $("#cmbTipoKOP").data("kendoDropDownList").value();
                var _Id = self.data.PK;
                var _idSubProceso = self.data.COD_PROCCESS;
                kendo.ui.progress($("#divCrearCurva"), false);
                datos = {
                    NKOP: _NKOP,
                    TipoKOP: _TipoKOP,
                    ID: _Id,
                    IdSubProceso: _idSubProceso
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    type: "POST",
                    url: "../api/KOPsFab/ActualizarNumeroKOPTipoKOPMultivalor",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divCrearCurva"), false);
                    if (res) {
                        self.window.close();
                        self.eliminar();
                        $("#divMaterialesDefecto").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_EDITADA_CORRECTAMENTE'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);

                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divCrearCurva"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);
                });
            },
            eliminar: function () {
                this.remove();
            },
           

        });

        return vistaCrearLote;
    });