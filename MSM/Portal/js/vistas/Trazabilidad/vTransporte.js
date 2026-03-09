define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/vpTransporte_CamionesTransito.html'], function (_, Backbone, $, plantillaTransporte) {
    var vistaParcialTransporte = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaTransporte),
        dsMatriculas: null,
        dsMatriculaTractoraAutoComplete: null,
        dsMatriculaRemolqueAutoComplete: null,
        dsClienteProveedor: null,
        dsProducto: null,
        dsOrigenMercancia: null,
        dsUbicacionDestino: null,
        dsDNI: null,
        gridTransportes: null,
        options: null,
        initialize: function (options) {
            var self = this;
            self.options = options;
 
            self.dsClienteProveedor = self.options.cmbClienteProvedor;
            self.dsProducto = self.options.cmbProducto;
            self.dsUbicacionDestino = self.options.cmbDestino;
            self.dsOrigenMercancia = self.options.txtOrigenMercancia;
            self.dsMatriculaTractoraAutoComplete = self.options.cmbMatriculaTractora
            self.dsMatriculaRemolqueAutoComplete = self.options.cmbMatriculaRemolque
            this.render();
        },
        render: function () {
            
            var self = this;
            $("#detalleTransporte").html(this.template(this.model));
                   
            $("#btnGuardar").kendoButton();
            $("#btnCrear").kendoButton();
            $("#btnReiniciarCampos").kendoButton();
            $("#btnCancelarTransporte").kendoButton({
                click: function (e) {
                    self.mostrarBotonTransporte("btnGuardar");
                    self.mostrarBotonTransporte("btnCancelarTransporte");
                    self.mostrarBotonTransporte("btnCrear");
                    self.mostrarBotonTransporte("btnReiniciarCampos");
                    $("#btnReiniciarCampos").trigger("click");
                    var gridTransportes = $("#gridTransportes").data('kendoGrid');
                    gridTransportes.clearSelection();
                }
            });

           
           

            $("#selectClienteProveedor").kendoComboBox({
                dataTextField: "Nombre",
                dataValueField: "ID",
                dataSource: self.dsClienteProveedor,
                filter: "contains",
                suggest: true,
                open: function (e) {
                    valid = false;
                },
                select: function (e) {
                    valid = true;
                },
                close: function (e) {
                    // if no valid selection - clear input
                    if (!valid) this.value('');
                },
            });

            

            $("#selectDestino").kendoComboBox({
                dataTextField: "Nombre",
                dataValueField: "ID",
                dataSource: self.dsUbicacionDestino,
                filter: "contains",
                suggest: true,
                highlightFirst: true,
                open: function (e) {
                    valid = false;
                },
                select: function (e) {
                    valid = true;
                },
                close: function (e) {
                    // if no valid selection - clear input
                    if (!valid) this.value('');
                },
            });

            $("#selectProducto").kendoComboBox({
                dataTextField: "Nombre",
                dataValueField: "ID",
                dataSource: self.dsProducto,
                filter: "contains",
                suggest: true,
                open: function (e) {
                    valid = false;
                },
                select: function (e) {
                    valid = true;
                },
                close: function (e) {
                    // if no valid selection - clear input
                    if (!valid) this.value('');
                },
            });

            


            $("#numericTxtPesoEntrada").kendoNumericTextBox({
                format: "#.00 kg"
            });

            $("#btnCapturarEntrada").kendoButton({ enable: false });

            $("#numericTxtPesoSalida").kendoNumericTextBox({
                format: "#.00 kg"
            });

            $("#btnCapturarSalida").kendoButton({ enable: false });

            $("#btnImprimirTicket").kendoButton({ enable: false });


            //AUTOCOMPLETE MATRICULA TRACTORA 
            $("#txtMatriculaTractora").kendoComboBox({
                suggest: true,
                dataSource: self.dsMatriculaTractoraAutoComplete,
                filter: "contains",
                dataTextField: "Nombre",
                dataValueField: "ID",

            }).data("kendoAutoComplete");

            //widgetTxtMatriculaTractora.element.on("blur", function () {
            //    widgetTxtMatriculaTractora.shouldClose = true;

            //    widgetTxtMatriculaTractora.close();

            //    widgetTxtMatriculaTractora.shouldClose = false;
            //});
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //AUTOCOMPLETE MATRICULA REMOLQUE 
            var widgetTxtMatriculaRemolque = $("#txtMatriculaRemolque").kendoComboBox({
                suggest: true,
                dataSource: self.dsMatriculaRemolqueAutoComplete,
                filter: "startswith",
                dataTextField: "Nombre",
                dataValueField: "ID",

            }).data("kendoAutoComplete");

            //widgetTxtMatriculaRemolque.element.on("blur", function () {
            //    widgetTxtMatriculaRemolque.shouldClose = true;

            //    widgetTxtMatriculaRemolque.close();

            //    widgetTxtMatriculaRemolque.shouldClose = false;
            //});
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




            // AUTOCOMPLETE ORIGEN
            $("#txtOrigen").kendoComboBox({
                suggest: true,
                dataSource: self.dsOrigenMercancia,
                filter: "contains",
                dataTextField: "Nombre",
                dataValueField: "ID",
            }).data("kendoAutoComplete");

            
            // BOTON DNI TRANSPORTISTA
            $("#txtDNITransportista").kendoComboBox({
                suggest: true,
                dataSource: self.dsDNI,
                filter: "contains",
                dataTextField: "Nombre",
                select: self.selectDNI,
                dataValueField: "ID",

            }).data("kendoAutoComplete");

            $("#dateFechaSalida").kendoDateTimePicker();

            if (typeof self.options.model.FechaEntrada === 'undefined') {
                $("#dateFechaEntrada").kendoDateTimePicker({
                    value: new Date(),
                    dateInput: true
                });

            } else {
                $("#dateFechaEntrada").kendoDateTimePicker();
            }
            

            //SETEO DE VALORES SI EL MODELO ES DISTINTO DE NULL
            var cmbClienteProveedor = $("#selectClienteProveedor").data("kendoComboBox");
            var cmbProducto = $("#selectProducto").data("kendoComboBox");
            var cmbDestino = $("#selectDestino").data("kendoComboBox");
            var txtOrigen = $("#txtOrigen").data("kendoComboBox");
            var cmbDNI = $("#txtDNITransportista").data("kendoComboBox");
            var cmbMatriculaTractora = $("#txtMatriculaTractora").data("kendoComboBox");
            var cmbMatriculaRemolque = $("#txtMatriculaRemolque").data("kendoComboBox");
            if (self.options.model != null) {          
                cmbClienteProveedor.value(self.options.model.IdProveedor);
                cmbProducto.value(self.options.model.IdProducto);
                cmbDestino.value(self.options.model.IdDestinoMercancia);
                txtOrigen.value(self.options.model.IdOrigenMercancia);
                cmbDNI.value(self.options.model.IdTransportista);
                cmbMatriculaTractora.value(self.options.model.MatriculaTractora);
                cmbMatriculaRemolque.value(self.options.model.MatriculaRemolque);
            } else {
               

               

            }

          

            //}).data("kendoAutoComplete");

            //widgetTxtOrigen.element.on("blur", function () {
            //    widgetTxtOrigen.shouldClose = true;

            //    widgetTxtOrigen.close();

            //    widgetTxtOrigen.shouldClose = false;
            //});

           
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //$("#txtDestino").kendoAutoComplete({
            //    filter: "startswith",
            //    dataSource: self.dsUbicacion,
            //    dataTextField: "Nombre",
            //    noDataTemplate: $("#noDataTemplate").html()
            //});

            $("#txtOperador").val(self.options.user);

         

            $('#txtDNITransportista, #txtMatriculaTractora, #txtMatriculaRemolque').on('keypress', function (e) {
                if (e.which == 32)
                    return false;
            });

          
            ////////////////////////////////////////////////////

            //$("#formCamionesTransito").kendoValidator({
            //    rules: {
                    
            //        checkFechas: function (input) {
            //            if (input.data("kendoDateTimePicker")) {
            //                if ($("#dateFechaEntrada").data("kendoDateTimePicker").value() && $("#dateFechaSalida").data("kendoDateTimePicker").value() != "") {
            //                    return $("#dateFechaEntrada").data("kendoDateTimePicker").value() <= $("#dateFechaSalida").data("kendoDateTimePicker").value()
            //                }
            //            } else {
            //                return true;
            //            }
            //        }
            //    },
            //    messages: {
            //        required: "campo obligatorio",
            //        checkFechas: "La fecha de entrada debe ser menor a la de salida"
            //    }
            //}).data("kendoValidator");

           kendo.ui.progress(self.options.grid.$("#divDetalle"), false);
         
           

        },
      
        
        selectDNI: function (e) {
          
            if (typeof e.item !== 'undefined') {
                var dataItem = this.dataItem(e.item.index());
                if (dataItem.ID != 0) {
                    $("#txtNombreTransportista").val(dataItem.Tipo);
                } else {
                    $("#txtNombreTransportista").val("");
                }
            }
                
            
        },
        mostrarBotonTransporte: function (idBoton) {
            if ($("#" + idBoton).is(":visible")) {
                $("#" + idBoton).hide();
            } else {
                $("#" + idBoton).show();
            }
        },
        eliminar: function () {
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        }
    });
    return vistaParcialTransporte;
});