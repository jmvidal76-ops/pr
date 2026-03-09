define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldFilesTem.html', 'compartido/notificaciones'],
    function (_, Backbone, $, htmlTemplante, Not) {
       
        var filesTemplate = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplante),
            parent: null,
            ds: null,
            initialize: function (filtros, parent) {                
                //reset default values
                var self = this;
                this.filtrosData = {
                    modeConfig: false,
                    field: null,
                    idForm: null,
                    runTimeJustView: false
                };
                //prepare data
                for (var prop in filtros) {
                    this.filtrosData[prop] = filtros[prop];
                }
                this.parent = parent;
                
            },
            render: function () {
                $(this.el).css("width", "100%"); //para que ocupe un minimo          
                $(this.el).html(this.template());
                //$(this.el).attr("id", this.filtrosData.field.nameID);

                this.$('.labelTxt').html(this.filtrosData.field.label);
                this.renderGrid();

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos  sino los escondemos             
                if (!this.filtrosData.modeConfig) {

                }

                return this;
            },
            events: {                
                //methods for configmode
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField',
            },
            
         
            //METHODS FOR CONFIG MODE
            deleteItem: function () {

                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.filtrosData.field);
                if (index >= 0) {
                    this.parent.formTemplate.fieldsTemplate.splice(index, 1);
                    this.parent.prepareForm();
                }
            },
            editField: function () {
                this.parent.toolBoxModel.set("newField", this.filtrosData.field);
                this.parent.changeType();
                this.parent.toolBoxModel.set("modeEdit", true)
                this.parent.toolBoxModel.set("modeAdd", false);
            },
            toggleItemUp: function () {
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.filtrosData.field);
                if (index >= 0) {
                    this.swapPos(index, index - 1);

                }
            },
            toggleItemDown: function () {
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.filtrosData.field);
                if (index >= 0) {
                    this.swapPos(index, index + 1);

                }
            },
            swapPos: function (oldPos, newPos) {
                if (newPos >= 0 && newPos < this.parent.formTemplate.fieldsTemplate.length) {
                    var temp = this.parent.formTemplate.fieldsTemplate[oldPos];
                    this.parent.formTemplate.fieldsTemplate[oldPos] = this.parent.formTemplate.fieldsTemplate[newPos];
                    this.parent.formTemplate.fieldsTemplate[newPos] = temp;
                    this.parent.prepareForm();
                }
            }
        });
        
        return filesTemplate;
    }
);