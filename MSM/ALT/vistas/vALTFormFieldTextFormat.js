define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldTextFormat.html'],
    function (_, Backbone, $, htmlTemplate) {
        var viewTextFormat = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplate),
            parent: null,
            ds: null,
            dataRow: [],
            textHeight: null,
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
                this.dataRow = this.filtrosData.field.dataRow;
                this.textHeight = this.filtrosData.field.textHeight;
            },
            render: function () {
                $(this.el).css("width", "100%"); //para que ocupe un minimo
                $(this.el).html(this.template());

                setTimeout(() => {
                    this.$('.labelTxt').html(this.filtrosData.field.label);

                    $(this.el).find('textarea').attr("id", this.filtrosData.field.nameID);

                    if (this.filtrosData.modeConfig) {
                        this.$('#' + this.filtrosData.field.nameID).kendoEditor({
                            resizable: true,
                            tools: [
                                "fontName",
                                "fontSize",
                                "bold",
                                "italic",
                                "underline",
                                "justifyLeft",
                                "justifyCenter",
                                "justifyRight",
                                "justifyFull",
                                "insertUnorderedList",
                                "insertOrderedList",
                                "foreColor",
                                "backColor"
                            ],
                            paste: function (e) {
                                // Se elimina si se quieren pegar imágenes
                                e.html = e.html.replace(/<img[^>]*>/g, "");
                            }
                        });

                        $('table.k-editor .k-content').css('resize', 'both');

                        if (this.dataRow.length != 0) {
                            this.$('#' + this.filtrosData.field.nameID).data("kendoEditor").value(this.dataRow);
                            let toolbarHeight = $('.k-editor-toolbar').height();
                            this.$('#' + this.filtrosData.field.nameID).closest('table').height(this.textHeight + toolbarHeight);
                            //this.$('#' + this.filtrosData.field.nameID).closest('tr').find('.k-resize-handle').on('mousedown', () => {
                            //    this.$('#' + this.filtrosData.field.nameID).closest('tr').height('initial');
                            //});
                            
                        }
                    } else {
                        this.$('#' + this.filtrosData.field.nameID).kendoEditor({ tools: [] });
                        $('table.k-editor .k-content').css('resize', 'none');

                        let editor = $('#' + this.filtrosData.field.nameID).data().kendoEditor;
                        let editorBody = $(editor.body)
                        editorBody.attr("contenteditable", false);

                        this.$('#' + this.filtrosData.field.nameID).data("kendoEditor").value(this.dataRow);
                        this.$('#' + this.filtrosData.field.nameID).closest('table').height(this.textHeight);
                    }
                });

                //si estamos en modo configuración dejamos los botones de edición de los campos, sino los escondemos             
                if (!this.filtrosData.modeConfig) {
                    this.$(".divConfigControls").css("display", "none");

                    if (this.filtrosData.runTimeJustView) {
                        $(this.el).attr("data-readonly", "");
                    }
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
            saveTextFormatInstance: function () {
                return this.$('#' + this.filtrosData.field.nameID).data("kendoEditor").value();
            },
            saveTextFormatTemplate: function () {
                if (this.$('#' + this.filtrosData.field.nameID).data("kendoEditor") == null) {
                    this.filtrosData.field.set("dataRow", "");
                } else {
                    this.filtrosData.field.set("dataRow", this.$('#' + this.filtrosData.field.nameID).data("kendoEditor").value());
                }
                let toolbarHeight = $('.k-editor-toolbar').height();
                let trHeight = this.$('#' + this.filtrosData.field.nameID).closest('table').height();
                this.filtrosData.field.set("textHeight", trHeight - toolbarHeight);
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
            },
        });

        return viewTextFormat;
    }
);