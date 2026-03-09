define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTForm5SConfigSections.html', 'compartido/notificaciones'],
    function (_, Backbone, $, htmlTemplate, Not) {
        var vista5sConfig = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTML5SConfigSections',
            template: _.template(htmlTemplate),
            ds: null,
            dataRow: [],
            formTable: null,
            initialize: function ({ parent }) {
                //reset default values
                this.formTable = parent;

                //Cargamos en las filas del grid las columnas del campo Table, si no existen inicializamos a array vacio
                if (this.formTable.dataRow) {
                    //empleamos JSON para hacer una copia. Sino no funciona correctamente
                    this.dataRow = JSON.parse(JSON.stringify(this.formTable.dataRow));
                } else {
                    this.dataRow = [];
                }

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.renderGrid();

                self.window = $(self.el).kendoWindow(
                    {
                        title: self.title,
                        width: "600px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                    }).data("kendoWindow");

                self.dialog = $('#dlgConfigSections').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
            },
            renderGrid: function () {
                var self = this;

                this.ds = new kendo.data.DataSource({
                    transport: {
                        read: function (e) {
                            e.success(self.dataRow);
                        },
                        create: function (e) {
                            if (self.dataRow.some(s => s.seccion === e.data.seccion)) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), "Ya existe una sección con ese nombre", 3000);
                                return;
                            }

                            const arrayIDs = self.dataRow.map(function (row) { return row.field; });
                            e.data.field = Math.max.apply(Math, arrayIDs.length == 0 ? [0] : arrayIDs) + 1;
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
                    error: function (e) { },
                    batch: false,
                    async: true,
                    requestEnd: function (e) { },
                    schema: {
                        model: {
                            id: "field",
                            fields: {
                                field: { type: "number" },
                                seccion: { type: "string" },
                            }
                        }
                    },
                });

                //columns
                var arrayCommands = [
                    { name: "edit", text: { edit: "", update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } },
                    { name: "destroy", text: "" }];
                
                self.grid = this.$("#gridConfig").kendoGrid({
                    dataSource: self.ds,
                    editable: {
                        mode: "inline",
                        confirmation: false,
                        createAt: "bottom"
                    },
                    width: "100%",
                    height: 500,
                    toolbar: [
                        { template: "<button id='btnGuardarSections' class='k-button k-button-icontext' style='float:left;' onclick='guardarClick()' >" + window.app.idioma.t('GUARDAR') + "</button>" },
                        { name: "create", text: window.app.idioma.t('ANADIR') }
                    ],
                    pageable: false,
                    scrollable: true,
                    columns: [
                        { field: "seccion", title: window.app.idioma.t('SECCION') },
                        { title: "&nbsp;", command: arrayCommands, width: "180px" }
                    ],
                    dataBound: function () {
                        guardarClick = function () {
                            self.formTable.dataRow = self.dataRow;
                            self.formTable.createTemplate5sLibre();
                            self.dialog.close();
                        };
                    }
                }).data("kendoGrid");
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
            }
        });

        return vista5sConfig;
    }
);