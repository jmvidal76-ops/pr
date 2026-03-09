define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/configTrigger.html', 'ALT/vALTTemplatesTrigger'],
    function (_, Backbone, $, ALTTemplate, ALTcomponent) {
        var comGestionLocations = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLgestionLocations',
            component: null,
            template: _.template(ALTTemplate),
            initialize: function () {
                var self = this;
                var idDepartmentType = "0"; //0: CAL 1 : SEO
                self.component = new ALTcomponent(idDepartmentType);
                self.render();
            },
            
            render: function () {
                var self = this;
                $(self.el).html(self.template())
                $("#center-pane").append($(self.el));
                $("#comALT").append(self.component.render().el);

            },
            eliminar: function () {
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

                var gridElement = $("#comALT"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
           
        });

        return comGestionLocations;
    });