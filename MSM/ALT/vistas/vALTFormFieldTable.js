define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldTable.html', 'compartido/notificaciones', 'ALT/vAltFormFieldTableConfigDialog'],
    function (_, Backbone, $, htmlTemplante, Not, ALTFormFieldTableConfigDialog) {
       
        var gridKend = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplante),
            parent: null,
            ds: null,
            dataRow: [],
            dataRowOld: [], //se emplea para hacer el log
            dataColumns: [],
            idInput: '',
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
                //get columns from template
                if (this.filtrosData.field.dataColumns) {
                    this.dataColumns =  JSON.parse(JSON.stringify(this.filtrosData.field.dataColumns));
                } else {
                    //es la primera vez que intenta configurarse
                    this.dataColumns = [];
                }
                //limpiamos valores de row
                if (!this.filtrosData.field.dataRow) {
                    this.filtrosData.field.dataRow = [];
                }

                this.dataRow = this.filtrosData.field.dataRow;
            },
            render: function () {
                $(this.el).css("width", "100%"); //para que ocupe un minimo          
                $(this.el).html(this.template());
                //$(this.el).attr("id", this.filtrosData.field.nameID);

                this.idInput = Date.now().toString();
                this.$('.txtRequired').attr('id', this.idInput);

                this.$('.labelTxt').html(this.filtrosData.field.label);

                this.renderGrid();

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos  sino los escondemos             
                if (!this.filtrosData.modeConfig)
                    this.$(".divConfigControls").css("display", "none");

                return this;
            },
            events: {
                'click .k-grid-btnEditarColumnas': 'editarColumnas',
                'click .toggleUpRow' :'toggleItemUpRow',
                'click .toggleDownRow' :'toggleItemDownRow',
                //methods for configmode
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField'
            },
            saveTableInstance: function () {               
                return this.ds.data();
            },
            saveTableTemplate: function () {
                this.filtrosData.field.set("dataColumns", this.dataColumns);
                this.filtrosData.field.set("dataRow", this.dataRow);
            },
            toggleItemDownRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = $("#" + this.filtrosData.field.nameID).data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfRow(dataItem);
                this.swapPosRow(index, index+1);         
            },
            toggleItemUpRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = $("#" + this.filtrosData.field.nameID).data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfRow(dataItem);

                this.swapPosRow(index, index-1);               
            },
            swapPosRow: function (oldPos, newPos) {
                if (newPos >= 0 && newPos < this.dataRow.length) {
                    var temp =  this.dataRow[oldPos];
                    this.dataRow[oldPos] =  this.dataRow[newPos];
                    this.dataRow[newPos] = temp;
                    this.ds.read();
                }
            },
            getIndexOfRow: function (dataItem) {
                for (var i = 0; i < this.dataRow.length; i++) {
                    if (this.dataRow[i].id === dataItem.id) {
                        return i;
                    }
                }
                return -1;
            },
            editarColumnas: function (e) {
                e.preventDefault();
                var configColumns = new ALTFormFieldTableConfigDialog(this.filtrosData.field, this);
            },
            getCambiosTableValues: function () {
                var self = this;
                var cambiosStr = ""; 
                var dataNew = this.ds.data();
                this.dataRowOld.forEach(function (item, index) {
                    var cambiosFila = "";
                    for (var prop in item) {
                        if( item[prop] != dataNew[index][prop])
                            cambiosFila += self.getTitleCol(prop)+ ": " + item[prop] + " -> " + dataNew[index][prop] + "; ";
                    }
                    
                    if (cambiosFila != "")
                        cambiosStr += window.app.idioma.t('CAMBIOS_EN_FILA') + " " + (item.id + 1) + ":  " + cambiosFila + "</br>";
                });
                if (cambiosStr != "")
                    cambiosStr = window.app.idioma.t('TABLA') + " - " + this.filtrosData.field.label + "</br>" + cambiosStr;
                return cambiosStr;
            },
            getTitleCol: function (field) {
                var colDes = ""
                this.dataColumns.forEach(function (item) {
                    if (field == item.field)
                        colDes = item.title;
                        return;
                });
                return colDes;
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
                this.parent.toolBoxModel.set("modeEdit", true);
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
            },
            renderGrid: function () {
                var self = this;
                var isEmpty = false;

                //prepare datasouce
                this.ds = new kendo.data.DataSource({
                    transport: {
                        read: function (e) {                           
                            e.success(self.dataRow);
                        },
                        create: function (e) {
                            //add here to the local model if necessary                                                       
                            e.data.id =  Date.now();
                            e.success(e.data);
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        },
                        update: function (e) {
                            e.success();
                        },                      
                        destroy: function (e) {
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
                            id: "id"
                        }
                    },
                });

                function editorNotEditable(container,options) {
                    //devolveremos lo que necesitemos
                    $('<strong>' + (options.model[options.field] ?  options.model[options.field] : '' )+ '</strong>')
                        .appendTo(container);                   
                }

                this.$(".divGridTable").attr("id", self.filtrosData.field.nameID);

                //prepare gridColumns with dataColumns
                var gridColumns = [];
                self.dataColumns.forEach(function (col,index) {
                    //si no es editable ponemos el template editorNotEditable
                    gridColumns.push({ field: col.field, title: col.title ? col.title : "&nbsp;", editor: (!col.editCol && !self.filtrosData.modeConfig) ? editorNotEditable : null });
                });
                
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
                    this.$('#' + self.filtrosData.field.nameID).attr('required', self.filtrosData.field.required);
                    this.$('#' + self.idInput).attr('required', self.filtrosData.field.required);

                    if (self.filtrosData.field.descript != "") {
                        $(self.el).kendoTooltip({
                            content: self.filtrosData.field.descript,
                            position: "left"
                        });
                    }
                }

                if (!self.filtrosData.modeConfig && !self.filtrosData.runTimeJustView) {
                    //si  estamos en modo runtime y esta habilitado el modo edicion ponemos otros parametros
                    var arrayCommands = [{ name: "edit", text: { edit: "", update: "", cancel: "" } }];
                    gridColumns.push( { title: "&nbsp;", command: arrayCommands, width: "90px" });
                }

                self.grid = this.$(".divGridTable").kendoGrid({
                    dataSource: self.ds,
                    editable: {
                        mode: "inline",
                        confirmation: false,
                        createAt: "bottom"
                    },
                    dataBound: function (e) {
                        if (!self.filtrosData.modeConfig && self.filtrosData.field.required) {
                            var grid = e.sender;

                            // Solo se comprueban aquellas celdas cuya columna es editable
                            grid.columns.forEach(function (col) {
                                if (col.editor === null) {
                                    var headers = grid.element.find('th');
                                    var colIndex = headers.index(grid.element.find("th[data-title = '" + col.title + "']"));
                                    var cells = grid.element.find('tr').find("td:eq(" + colIndex + ")");
                                    cells.each(function (index, element) {
                                        if ($(element).text() === '') {
                                            isEmpty = true;
                                            return false;
                                        }
                                        isEmpty = false;
                                    });
                                }
                            });

                            if (isEmpty) {
                                $('#' + self.filtrosData.field.nameID).addClass('invalidRequired');
                                $('#' + self.idInput).val('');
                                $('#' + self.idInput).addClass('k-invalid invalidRequired');
                            } else {
                                $('#' + self.filtrosData.field.nameID).removeClass('invalidRequired');
                                $('#' + self.idInput).val(window.app.idioma.t('VALIDO'));
                                $('#' + self.idInput).removeClass('k-invalid invalidRequired');
                            }

                            if ($("#selStatusID3").data("kendoDropDownList").value() == 'PENDIENTE') {
                                if ($('#formTemplate').kendoValidator().data('kendoValidator').validate()) {
                                    $("#selStatusID3_listbox .k-item")[0].disabled = false;
                                    $("#selStatusID3_listbox .k-item")[0].style.cssText = "color: black";
                                } else {
                                    $("#selStatusID3_listbox .k-item")[0].disabled = true;
                                    $("#selStatusID3_listbox .k-item")[0].style.cssText = "color: lightgrey";
                                    $("#selStatusID3").data("kendoDropDownList").select(1);
                                }
                            }
                        }
                    },
                    edit: function () {
                        $('input[name^="c"]').addClass("keyboardOn");

                        if (localStorage.getItem("tecladoVirtual") == "true" && window.location.pathname.toLowerCase().indexOf("terminal") > 0) {
                            $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                            if (localStorage.getItem("idiomaSeleccionado") == "en-GB") {
                                $('.keyboardOn').keyboard();
                            } else {
                                $('.keyboardOn').keyboard({ layout: 'spanish-qwerty' });
                            }
                        }
                    },
                    width: "100%",
                    toolbar: self.filtrosData.modeConfig ? [{ name: "create", text: window.app.idioma.t('ANADIR_FILAS') }, { name: "btnEditarColumnas", text: window.app.idioma.t('EDITAR_COLUMNAS') }] : null,
                    pageable: false,
                    scrollable: false,
                    columns: gridColumns,
                }).data("kendoGrid");
            }
        });
        
        return gridKend;
    }
);