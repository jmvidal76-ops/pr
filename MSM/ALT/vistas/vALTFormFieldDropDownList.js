define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldDropDownList.html', 'compartido/notificaciones'],
    function (_, Backbone, $, htmlTemplate, Not) {
        var gridKend = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplate),
            parent: null,
            ds: null,
            dataRow: [],
            dataRowOld: [], //se emplea para hacer el log
            items: [],
            //indexCombo: 1,
            dropDownList: null,
            dataTableGrid: null,
            idCombo: '',
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
                this.items = this.filtrosData.field.items === undefined ? [] : this.filtrosData.field.items;

                // Se comprueba si tenemos algun control de tipo Combo para cargar sus datos
                if (!jQuery.isEmptyObject(this.parent.fieldsDropDownList)) {
                    for (var prop in this.parent.fieldsDropDownList) {
                        if (prop === filtros.field.nameID) {
                            this.dataRow = this.parent.fieldsDropDownList[prop].ds.data();
                            this.items = this.parent.fieldsDropDownList[prop].items;
                        }
                    }
                }
            },
            render: function () {
                $(this.el).css("width", "100%"); //para que ocupe un minimo      
                
                $(this.el).html(this.template());
                //$(this.el).attr("id", this.filtrosData.field.nameID);

                this.$('.labelTxt').html(this.filtrosData.field.label);

                this.idCombo = (Date.now() / 1).toString();
                this.$('.formCombo').attr('id', this.idCombo);

                this.renderGrid();

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos  sino los escondemos             
                if (!this.filtrosData.modeConfig) {
                    this.$(".divConfigControls").css("display", "none");

                    if (this.filtrosData.runTimeJustView) {
                        $(this.el).attr("data-readonly", "");
                    }
                }
                
                return this;
            },
            events: {
                'click .toggleUpRow': 'toggleItemUpRow',
                'click .toggleDownRow': 'toggleItemDownRow',
                //methods for configmode
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField',
                'change .formCombo': 'selectOption',
            },
            saveDropDownListInstance: function () {
                var selected = this.$('#' + this.idCombo).data('kendoDropDownList').value();
                return selected === '' ? '' : parseInt(selected);
            },
            saveDropDownListTemplate: function () {
                //this.filtrosData.field.set("dataRow", this.dataRow);
                this.filtrosData.field.set("dataRow", this.ds.data());
                this.filtrosData.field.items = [];
                this.filtrosData.field.set("items", this.items);
            },
            toggleItemDownRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = $("#" + this.filtrosData.field.nameID).data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfRow(dataItem);
                this.swapPosRow(index, index + 1);
            },
            toggleItemUpRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = $("#" + this.filtrosData.field.nameID).data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfRow(dataItem);
                this.swapPosRow(index, index - 1);
            },
            swapPosRow: function (oldPos, newPos) {
                if (newPos > 0 && newPos < this.dataRow.length) {
                    //Para el cambio de orden en la tabla
                    var temp = this.dataRow[oldPos];
                    this.dataRow[oldPos] = this.dataRow[newPos];
                    this.dataRow[newPos] = temp;
                    this.ds.read();
                    //Para el cambio de orden en el combo
                    var oldValor = this.items[oldPos].value;
                    var newValor = this.items[newPos].value;
                    var tempCombo = this.items[oldPos];
                    this.items[oldPos] = this.items[newPos];
                    this.items[oldPos].value = oldValor;
                    this.items[newPos] = tempCombo;
                    this.items[newPos].value = newValor;
                    this.dropDownList.dataSource.read();
                }
            },
            getIndexOfRow: function (dataItem) {
                for (var i = 0; i < this.dataRow.length; i++) {
                    if (this.dataRow[i].field === dataItem.field) {
                        return i;
                    }
                }
                return -1;
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
            bindDataRuntime: function (dataInString) {
                //estamos en modo RUNTIME si hay datos ya ponemos estos sino ponemos la plantilla ya que es la primera vez que se rellena
                var data = JSON.parse(dataInString);

                if (dataInString && data[this.filtrosData.field.nameID]) {
                    this.dataRow = data[this.filtrosData.field.nameID];
                    this.dataRowOld = JSON.parse(dataInString)[this.filtrosData.field.nameID];
                } else {
                    //hacemos un duplicado del template de field sin esto el grid no funciona correctamente
                    //cuando intentas cancelar y editar
                    this.dataRow = JSON.parse(JSON.stringify(this.filtrosData.field.dataRow));
                    this.dataRowOld = this.filtrosData.field.dataRow;
                }
                this.ds.read();
                //$("#gridMaterialesAux").data("kendoGrid").dataSource.read();
            },
            selectOption: function () {
                var self = this;
                if (self.filtrosData.field.required && this.$('#' + self.idCombo).val() === '') {
                    this.$('#' + self.idCombo).siblings('span.k-dropdown-wrap').addClass('invalidRequired');
                } else {
                    this.$('#' + self.idCombo).siblings('span.k-dropdown-wrap').removeClass('invalidRequired');
                }
            },
            renderGrid: function () {
                var self = this;
                if (self.items.length === 0) {
                    self.items = [{ field: 'N/A', value: '1' }];
                }

                self.dropDownList = this.$('#' + this.idCombo).kendoDropDownList({
                    dataTextField: 'field',
                    dataValueField: 'value',
                    dataSource: self.items,
                    optionLabel: ' ',
                    open: function (e) {
                        e.sender.optionLabel.hide();
                    }
                }).data('kendoDropDownList');

                //prepare datasouce
                this.ds = new kendo.data.DataSource({
                    transport: {
                        read: function (e) {
                            if (self.dataRow.length === 0) {
                                self.dataRow = [{ field: 'N/A' }];
                            }
                            e.success(self.dataRow);
                        },
                        create: function (e) {
                            //add here to the local model if necessary
                            e.data.id = Date.now() / 1;//timespam ES EL ID
                            
                            //var value = (++self.indexCombo).toString();
                            var lastValue = parseInt(self.items[self.items.length - 1].value);
                            var value = (++lastValue).toString();
                            self.items.push({ field: e.data.field, value: value });
                            self.dropDownList.dataSource.read();
                            e.success(e.data);
                        },
                        update: function (e) {
                            var editedElement = self.dataTableGrid.dataSource.data().find(function (item) {
                                return item.dirty;
                            });

                            var dropDownItem = self.items.find(function (item) {
                                return item.field === editedElement.id;
                            });

                            dropDownItem.field = editedElement.field;
                            self.dropDownList.dataSource.read();
                            e.success();
                        },

                        destroy: function (e) {
                            var dropDownItem = self.items.find(function (item) {
                                return item.field === e.data.field;
                            });

                            self.items = self.items.filter(function (item) {
                                return item.field !== dropDownItem.field;
                            });
                            self.dropDownList.setDataSource(self.items);
                            self.dropDownList.dataSource.read();
                            e.success();
                        }
                    },
                    error: function (e) {
                        // handle data operation error
                        //alert("Status: " + e.status + "; Error message: " + e.errorThrown);
                    },
                    batch: false,
                    async: true,
                    requestEnd: function (e) { },
                    schema: {
                        model: {
                            id: "field",
                            fields: {
                                field: { type: "string" }
                            }
                        }
                    },
                });

                //prepare gridColumns with dataColumns
                var gridColumns = [];
                gridColumns.push({ field: 'field', title: '&nbsp;' });
               
                if (self.filtrosData.modeConfig) {
                    //Si estamos en modo configuracion ponemos  botones de edición
                    var arrayCommands = [
                        { template: '<a class="k-button k-button-icontext toggleUpRow"><img  src="../ALT/img/ALT_up.png" /></span></a>' },
                        { template: '  <a class="k-button k-button-icontext toggleDownRow" ><img  src="../ALT/img/ALT_down.png" /></span></a> ' },
                        //{template:'<a class="editField k-button" ><img  src="../ALT/img/ALT_edit.png" /></span></a>'},
                        { name: "edit", text: { edit: "", update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } },
                        { name: "destroy", text: "" }];
                    gridColumns.push({ title: "&nbsp;", command: arrayCommands, width: "180px" });
                } else {
                    this.$('.divGridTable').css('display', 'none');
                    this.$('.divConfigControls').css('display', 'none');

                    this.$('#' + self.idCombo).attr('required', self.filtrosData.field.required);

                    if (self.filtrosData.field.descript != "") {
                        $(self.el).kendoTooltip({
                            content: self.filtrosData.field.descript,
                            position: "left"
                        });
                    }

                    var combo = this.$('#' + self.idCombo).data('kendoDropDownList');
                    var valorActual = JSON.parse(this.parent.formInstance.FormValues);

                    if (valorActual != null) {
                        valorActual.dropDownList.forEach(function (item) {
                            if (item.field === self.filtrosData.field.nameID) {
                                combo.value(item.value);
                            }
                        });
                    }

                    if (self.filtrosData.field.required && this.$('#' + self.idCombo).val() === '') {
                        this.$('#' + self.idCombo).siblings('span.k-dropdown-wrap').addClass('invalidRequired');
                    } else {
                        this.$('#' + self.idCombo).siblings('span.k-dropdown-wrap').removeClass('invalidRequired');
                    }
                }

                this.$(".divGridTable").attr("id", this.filtrosData.field.nameID);
                self.grid = this.$(".divGridTable").kendoGrid({
                    dataSource: self.ds,
                    editable: {
                        mode: "inline",
                        confirmation: false,
                        createAt: "bottom"
                    },
                    width: "100%",
                    toolbar: [{ name: "create", text: window.app.idioma.t('ANADIR') }],
                    pageable: false,
                    scrollable: false,
                    columns: gridColumns,
                    dataBound: function (e) {
                        // Para que la opción N/A no sea editable se necesita este código
                        var grid = e.sender;
                        var isDefault = grid.dataSource.view().some(function (element) {
                            return element.field === 'N/A';
                        });

                        if (isDefault) {
                            grid.tbody.find("td:contains('N/A')").siblings().remove();
                        }
                    }
                }).data("kendoGrid");

                self.dataTableGrid = self.grid;
            }
        });

        return gridKend;
    }
);