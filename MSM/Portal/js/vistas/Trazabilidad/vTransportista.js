define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/vpTransportista_CamionesTransito.html'], function (_, Backbone, $, plantillaTransportista) {
    var vistaParcialTransportista = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaTransportista),
        dsDNI : null,
        initialize: function (options) {
            var self = this;
            self.options = options;

            self.dsDNI = new kendo.data.DataSource({
                batch: true,
                transport: {
                    read: {
                        url: "../api/ObtenerDataAutoComplete/" + "Transportista",
                        dataType: "json",
                        cache: true
                    }
                },
                schema: {
                    model: {
                        id: "ID",
                        fields: {
                            'ID': { type: "number" },
                            'Nombre': { type: "string" },
                            'Tipo': { type: "string" }
                        }
                    }
                }
            });

            this.render();
        },
        render: function () {
            
            var self = this;
            $("#detalleTransportista").html(this.template(this.model));
           
            var widgetTxtDNI = $("#txtDNITransportista").kendoAutoComplete({
                dataSource: self.dsDNI,
                filter: "startswith",
                dataTextField: "Nombre",
                headerTemplate: $("#noDataDNI").html(),
                dataBound: function () {
                 
                    var noItems = this.list.find(".noDataMessageDNI");

                    if (!this.dataSource.view()[0]) {
                        noItems.show();
                        this.popup.open();

                    } else {
                        noItems.hide();
                    }



                },
                select: function(e) {
                    var item = e.item;
                    var text = item.text();
                    console.log(text);
                },
                close: function (e) {
                    var widget = e.sender;

                    if (!widget.shouldClose && !this.dataSource.view()[0]) {
                        e.preventDefault();
                    }
                }

            }).data("kendoAutoComplete");

            widgetTxtDNI.element.on("blur", function () {
                widgetTxtDNI.shouldClose = true;

                widgetTxtDNI.close();

                widgetTxtDNI.shouldClose = false;
            });

            
            $('#txtDNITransportista').on('keypress', function (e) {
                if (e.which == 32)
                    return false;
            });
            
           
         
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
    return vistaParcialTransportista;
});