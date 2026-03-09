define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearLoteUbicacion',
            equiposDisponibles: null,
            window: null,
            materiales: null,
            selectedMasterRow: null,
            ddlMat: null,
            uom:null,
            template: _.template(plantillaCrearLote),
            initialize: function (masterRow) {
                var self = this;

                self.selectedMasterRow = masterRow;
                var salaCoccion = $("#cmbArea").data("kendoDropDownList").value();
                $.ajax({
                    type: "GET",
                    url: "../api/obtenerEquiposSinLote/" + salaCoccion,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.equiposDisponibles = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });


                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $("#cmbEquipos").kendoDropDownList({
                    dataTextField: "descripcion",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: self.equiposDisponibles,
                        sort: { field: "descripcion", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.ddlMat = $("#cmbMaterial").kendoDropDownList({
                    dataValueField: "PK_Material",
                    dataTextField: "Descripcion",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });
                self.ddlMat.data("kendoDropDownList").enable(false);

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,                   
                    culture: "es-ES",
                    spinners: true
                });

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('CREAR_NUEVO_LOTE'),
                    width: "580px",
                    height: "400px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divCrearLoteUbicacion').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #cmbEquipos': 'cambiaEquipo',
                'change #cmbMaterial': 'cambiaMaterial'
            },
            cambiaMaterial: function () {
                var self = this;

                var mat = $("#cmbMaterial").data("kendoDropDownList").text();

                if (mat.indexOf("LEVADURA") >= 0) {
                    $("#lblLoteProv").hide();
                    $("#lblLev").show();
                }
                else {
                    $("#lblLoteProv").show();
                    $("#lblLev").hide();
                }

                var idMat = $("#cmbMaterial").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerUOMconPKMaterial/" + idMat,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.uom = data;
                    $("#lblUOM").html(self.uom.toUpperCase());
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });
            },
            cambiaEquipo: function (e)
            {
                var self = this;
                //PK equipo
                var equipo = $("#cmbEquipos").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMaterialesFabricacionAprobados/" + equipo,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                    if ($("#cmbCelda").data("kendoDropDownList").text() === "RECUPERADOS")
                    {
                        //Solo se muestra la cerveza recuperada
                        self.materiales = $.grep(data, function (item) { return (item.Descripcion.indexOf("CZA") != -1 && item.Descripcion.indexOf("RECUP") != -1) });
                    }else
                        if ($("#cmbCelda").data("kendoDropDownList").text() === "FERMENTACION-GUARDA")
                        {
                            if ($("#cmbArea").data("kendoDropDownList").text() === "ADITIVOS")
                            {
                                //En los aditivos no muestro las levaduras
                                self.materiales = $.grep(data, function (item) { return (item.Descripcion.indexOf("LEVADURA") != -1) }, true);
                            }else//solo se muestran cuando se seleccione LE1
                                self.materiales = $.grep(data, function (item) { return (item.Descripcion.indexOf("LEVADURA") != -1) },false);
                        }
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_MATERIALES'), 4000);
                });

                if (self.materiales.length > 0) {
 
                    self.ddlMat.data("kendoDropDownList").setDataSource(self.materiales);
                    self.ddlMat.data("kendoDropDownList").select(0);
                    $("#lblErrorMat").hide();
                    self.ddlMat.data("kendoDropDownList").wrapper.show();
                    self.ddlMat.data("kendoDropDownList").enable(true);
                }
                else {
                    self.ddlMat.data("kendoDropDownList").wrapper.hide();
                    $("#lblErrorMat").html("El equipo no tiene politica de almacenamiento");
                    $("#lblErrorMat").show();                   
                }
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
                
                var equipo = $("#cmbEquipos").data("kendoDropDownList").value();

                if (equipo !== '' && equipo !== null)
                {
                    $("#lblErrorEq").hide();
                    var mat = $("#cmbMaterial").data("kendoDropDownList").value();

                    if (mat !== '' && mat !== null)
                    {
                        $("#lblErrorMat").hide();
                        var cant = $("#txtCantidad").data("kendoNumericTextBox").value();

                        if (cant !== '' && cant !== null)
                        {
                            $("#lblErrorCant").hide();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('CREAR_LOTE_PARA')
                                , msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTE_LOTE'), funcion: function () { self.creaLoteEnUbicacion(equipo, mat, cant); }, contexto: this
                            });
                        }
                        else
                            $("#lblErrorCant").show();
                    }
                    else
                        $("#lblErrorMat").show();
                }
                else
                    $("#lblErrorEq").show();

            },
            creaLoteEnUbicacion: function (equipo, mat, cant) {
                var self = this;

                var serie = $("#txtSerie").val();

                var datos = {};
                datos.equipo = equipo;
                datos.material = mat;
                datos.cantidad = cant;
                datos.serie = serie;

                var mat = $("#cmbMaterial").data("kendoDropDownList").text();

                if (mat.indexOf("LEVADURA") >= 0) {
                    var aux = datos.serie.split("-");
                    datos.serie = aux[0] + " - " + aux[1];
                }

                $.ajax({
                    type: "POST",
                    url: "../api/crearLoteEnUbicacion/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    //$("#gridGestionMateriales").data('kendoGrid').dataSource.read();                   
                    if (self.selectedMasterRow != undefined) {
                        if ($("#gridGestionMateriales").data("kendoGrid").dataItem(self.selectedMasterRow.masterRow) != undefined && $("#gridGestionMateriales").data("kendoGrid").dataItem(self.selectedMasterRow.masterRow).LocPK == $("#cmbEquipos").data("kendoDropDownList").value()) {
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
                        } else
                            $("#gridGestionMateriales").data("kendoGrid").dataSource.read();
                    } else
                        $("#gridGestionMateriales").data("kendoGrid").dataSource.read();

                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_EL_LOTE'), 4000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREANDO_EL_LOTE'), 4000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearLote;
    });