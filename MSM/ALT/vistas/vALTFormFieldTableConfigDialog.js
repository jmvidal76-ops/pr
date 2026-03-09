define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldTableConfigDialog.html', 'compartido/notificaciones'],
    function (_, Backbone, $, htmlTemplate, Not) {
       
        var gridKend = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplate),            
            ds: null,
            dataRow: [],
            dataRowOld: [], //se emplea para hacer el log
            dataColumns: [],
            formTable: null,
            initialize: function (fieldTem, fieldTable) {                
                //reset default values
                formTable = fieldTable;
                var self = this;
                this.fieldTemplate = {};
                //prepare data
                for (var prop in fieldTem) {
                    this.fieldTemplate[prop] = fieldTem[prop];
                }                
                //Cargamos en las filas del grid las columnas del campo Table, si no existen inicializamos a array vacio
                if (formTable.dataColumns) {
                    //empleamos JSON para hacer una copia. Sino no funciona correctamente
                    this.dataRow = JSON.parse(JSON.stringify(formTable.dataColumns));                    
                } else {
                    this.dataRow = [];
                }

                this.render();               
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                
                //GRID
                this.renderGrid();
               
                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "600px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: true,
                    actions: [],
                    activate: this.onActivate
                }).data("kendoWindow");

                self.dialog = $('#myDialog').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #toggleUpCol': 'toggleItemUpRow',
                'click #toggleDownCol': 'toggleItemDownRow',
                'click .k-grid-btnCerrar': 'cerrar'
            },
            cerrar: function (e) {
                e.preventDefault();
                formTable.dataColumns = this.dataRow;
                formTable.render();
                this.dialog.close();
                //this.eliminar();
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind evens.ts that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            toggleItemDownRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = this.$("#gridColConf").data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfItem(dataItem);
                this.swapPosRow(index, index+1);             
            },
            toggleItemUpRow: function (e) {
                var row = $(e.target).closest("tr");
                var grid = this.$("#gridColConf").data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOfItem(dataItem);

                this.swapPosRow(index, index-1);             
            },
            swapPosRow: function (oldPos, newPos) {
                if (newPos >= 0 && newPos < this.dataRow.length) {
                    var temp = this.dataRow[oldPos];
                    this.dataRow[oldPos] = this.dataRow[newPos];
                    this.dataRow[newPos] = temp;
                    this.ds.read();
                }
            },         
            getIndexOfItem: function (dataItem) {
                for (var i = 0; i < this.dataRow.length; i++) {
                    if (this.dataRow[i].field === dataItem.field) {
                        return i;
                    }
                }
                return -1;
            },
            renderGrid: function () {
                var self = this;
                
                this.ds = new kendo.data.DataSource({
                    transport: {
                        read: function (e) {                          
                            e.success(self.dataRow);
                        },
                        create: function (e) {
                            //add here to the local model if necessary   
                            e.data.field = 'c' + Date.now() / 1;//timespam ES EL ID, ponemos la c porque solo numerico no funciona
                            self.dataRow.push(e.data);
                            
                            e.success(e.data);
                        },
                        update: function (e) {
                            e.success();
                        },
                        destroy: function (e) {
                            self.dataRow = self.dataRow.filter(function (item) {
                                return item.field !== e.data.field;
                            });
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
                                field: {type: "string"},
                                title: {type: "string"},
                                editCol: { type: "boolean" }
                            }
                        }
                    },
                });
               
                //columns
                var arrayCommands = [
                        { template: '<a id="toggleUpCol" class="k-button k-button-icontext toggleUpRow"><img  src="../ALT/img/ALT_up.png" /></span></a>' },
                        { template: '  <a id="toggleDownCol" class="k-button k-button-icontext toggleDownRow" ><img  src="../ALT/img/ALT_down.png" /></span></a> ' },
                        { name: "edit", text: { edit: "", update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } },
                        { name: "destroy", text: "" }];
                var gridColumns = [
                    { field: "title", title: window.app.idioma.t('TITULO_COLUMNA') },
                    { field: "editCol", title: window.app.idioma.t('EDITABLE_EJECUCION'), template: '<input type="checkbox" #= editCol ? \'checked="checked"\' : "" # class="chkbx" disabled/>', },
                    { title: "&nbsp;", command: arrayCommands, width: "180px" }
                ];
                //grid
                self.grid = this.$("#gridColConf").kendoGrid({
                    dataSource: self.ds,
                    editable: {
                        mode: "inline",
                        confirmation: false,
                        createAt: "bottom"
                    },
                    width: "100%",
                    height: 500,
                    toolbar: [
                        { name: "btnCerrar", type: "button", text: window.app.idioma.t('CERRAR') },
                        { name: "create", text: window.app.idioma.t('ANADIR') }
                    ],
                    pageable: false,
                    scrollable: true,
                    columns: gridColumns,
                }).data("kendoGrid");
            }
        });
        
        return gridKend;
    }
);