define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/GestionProducciones.html','vistas/Trazabilidad/vComponentProducciones' ],
    function (_, Backbone, $, templateHTML,ComponentProducciones ) {
        // 
        var comGestion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLgestionProducciones',
            component: null,
            template: _.template(templateHTML),
            initialize: function () {
                var self = this;
                self.component = new ComponentProducciones({hiddenColumns: false, hiddenToolBar: false}, self.resizePage);;
                self.render();
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizePage);
            },
            
            render: function () {
                var self = this;
                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));
                $("#divComponent").append(self.component.render().el);
                self.resizePage();
            },
            eliminar: function () {
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.unbind("resize", self.resizePage);
                this.component.eliminar();
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizePage: function () {
                
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divProdFiltrosHeader").innerHeight();

                var gridElement = $("#gridProducciones"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight);
            },
           
        });

        return comGestion;
    });