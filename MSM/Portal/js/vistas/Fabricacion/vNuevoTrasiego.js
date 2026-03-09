define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/NuevoTrasiego.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, decantingTemplate, Not, VistaDlgConfirm) {
        var vistaTrasiego = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',            
            materiales: null,            
            sourceEquipments: null,
            destinationEquipments: null,
            decantingNumber: null,
            maximo: null,
            edit: null,
            idOrder: null,
            template: _.template(decantingTemplate),            
            initialize: function (edit, sourceEquipment, destinationEquipment, material, decantingNumber, quantity,orderID,date) {
                var self = this;
                self.edit = (edit === "true");
                self.idOrder = orderID;
                self.decantingNumber = decantingNumber;
                kendo.ui.progress($("#gridListadoWO"), true);

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMostosSinDummy/TR",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                if (!self.edit) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerSiguienteNumeroCoccion/" + new Date().getFullYear() + "/" + "FAB-TR1",
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.decantingNumber = data;
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_BUSCANDO_EL_SIGUIENTE'), 4000);
                    });
                }

                $.ajax({
                    type: "POST",
                    url: "../api/GetCellEquipment/FE1",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.sourceEquipments = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                $.ajax({
                    type: "POST",
                    url: "../api/GetCellEquipment/GU1",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.destinationEquipments = data;
                    self.sourceEquipments.forEach(function (item) {
                        if (item.descripcion == "UNITANQUE")
                            self.destinationEquipments.push(item);
                    });                    
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                this.render();

                if (self.edit) {
                    self.$("#material").data("kendoDropDownList").value(material);
                    self.$("#source").data("kendoDropDownList").value(sourceEquipment);
                    self.$("#destination").data("kendoDropDownList").value(destinationEquipment);
                    $("#quantity").data("kendoNumericTextBox").value(quantity);
                    //$("#serie").data("kendoNumericTextBox").value(decantingNumber);
                    self.$("#date").data("kendoDateTimePicker").value(date);
                }
                kendo.ui.progress($("#gridListadoWO"), false);
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                //// Carga de combos
                this.$("#material").kendoDropDownList({
                    dataValueField: "IdMaterial",
                    dataTextField: "Descripcion",
                    dataSource: new kendo.data.DataSource({
                        data: self.materiales,
                        sort: { field: "Descripcion", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#source").kendoDropDownList({
                    dataValueField: "pk",
                    dataTextField: "nombre",
                    template: "#=nombre# - #=descripcion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.sourceEquipments,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#destination").kendoDropDownList({
                    dataValueField: "pk",
                    dataTextField: "nombre",
                    template: "#=nombre# - #=descripcion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.destinationEquipments,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#quantity").kendoNumericTextBox({
                    spinners: true, decimals: 2, culture: localStorage.getItem("idiomaSeleccionado"), format: "n2", min: 0, max: 99999, value:0
                });

                //$("#serie").kendoNumericTextBox({
                //    spinners: false, decimals: 0, format: "n0", culture: localStorage.getItem("idiomaSeleccionado"), min: 1, max: 99999, value: self.decantingNumber
                //});
                //$("#serie").prop("disabled", true);

                $("#date").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });                 

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                var auxTitle = self.edit ? window.app.idioma.t('EDITAR_TRASIEGO') : window.app.idioma.t('NUEVO_TRASIEGO');
                
                self.window = $(self.el).kendoWindow(
                {
                    title: auxTitle,
                    width: "575px",
                    height: "450px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");
                kendo.ui.progress($("#center-pane"), false);
                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar'
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
                if (!self.edit)
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('NUEVO_TRASIEGO'), msg: window.app.idioma.t('ACEPTAR_TRASIEGO'), funcion: function () { self.CreateDecanting(); }, contexto: this });
                else
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('EDITAR_TRASIEGO'), msg: window.app.idioma.t('ACEPTAR_TRASIEGO'), funcion: function () { self.EditeDecanting(); }, contexto: this });
            },
            ErrorManager:function()
            {
                var self = this;
                var error = false;

                if (self.$("#material").data("kendoDropDownList").text().indexOf("Seleccione") != -1) {
                    $("#materialError").show();
                    $("#materialError").html(window.app.idioma.t('ERROR_MATERIAL'));
                    error = true;
                }

                if (self.$("#source").data("kendoDropDownList").text().indexOf("Seleccione") != -1) {
                    $("#sourceError").show();
                    $("#sourceError").html(window.app.idioma.t('ERROR_ORIGEN'));
                    error = true;
                }

                if (self.$("#destination").data("kendoDropDownList").text().indexOf("Seleccione") != -1) {
                    $("#destinationError").show();
                    $("#destinationError").html(window.app.idioma.t('ERROR_DESTINO'));
                    error = true;
                }

                if (parseFloat(self.$("#quantity").data("kendoNumericTextBox").value()) <= 0.0) {
                    $("#quantityError").show();
                    $("#quantityError").html(window.app.idioma.t('ERROR_CANTIDAD'));
                    error = true;
                }
                
                return error;
            },
            EditeDecanting: function () {
                var self = this;
                var error = self.ErrorManager();
                kendo.ui.progress($("#gridListadoWO"), true);

                if (! error ) {
                    var object = {
                        codWo: self.decantingNumber,
                        material: self.$("#material").data("kendoDropDownList").value(),
                        inicioEstimado: self.$("#date").data("kendoDateTimePicker").value(),                    
                        cantidad: self.$("#quantity").data("kendoNumericTextBox").value(),
                        sc: "TR1",
                        type: "TR",
                        sourceEquipPK: self.$("#source").data("kendoDropDownList").value(),
                        destinationEquipPK: self.$("#destination").data("kendoDropDownList").value(),
                        idOrden: self.idOrder
                    };

                    $.ajax({
                        data: JSON.stringify(object),
                        type: "POST",
                        async: true,
                        url: "../api/UpdateDecanting",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_WO_SE'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                            self.cancelar();
                            $("#gridListadoWO").data('kendoGrid').dataSource.read();
                            kendo.ui.progress($("#gridListadoWO"), false);
                        },
                        error: function (response) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_LA'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                            self.cancelar();
                            kendo.ui.progress($("#gridListadoWO"), false);
                        }
                    });
                }
                else 
                    Backbone.trigger('eventCierraDialogo');
            },
            CreateDecanting: function () {
                var self = this;
                var error = self.ErrorManager();
                kendo.ui.progress($("#gridListadoWO"), true);
                if (! error ) {
                    var object = {
                        codWo: self.decantingNumber,
                        material: self.$("#material").data("kendoDropDownList").value(),
                        inicioEstimado: self.$("#date").data("kendoDateTimePicker").value(),                    
                        cantidad: self.$("#quantity").data("kendoNumericTextBox").value(),
                        sc: "TR1",
                        type: "TR",
                        sourceEquipPK: self.$("#source").data("kendoDropDownList").value(),
                        destinationEquipPK: self.$("#destination").data("kendoDropDownList").value()
                    };

                    $.ajax({
                        data: JSON.stringify(object),
                        type: "POST",
                        async: true,
                        url: "../api/AddOrdenFabricacion",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                            self.cancelar();
                            $("#gridListadoWO").data('kendoGrid').dataSource.read();
                            kendo.ui.progress($("#gridListadoWO"), false);
                        },
                        error: function (response) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                            self.cancelar();
                            kendo.ui.progress($("#gridListadoWO"), false);
                        }
                    });
                }
                else 
                    Backbone.trigger('eventCierraDialogo');
            }
        });

        return vistaTrasiego;
    });