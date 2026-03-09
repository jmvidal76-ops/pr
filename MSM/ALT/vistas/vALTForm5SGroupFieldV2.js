define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTForm5SGroupFieldV2.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', "jszip"],
    function (_, Backbone, $, htmlTemplante, VistaDlgConfirm, Not, JSZip) {
        var checkedIds;
        var gridKendo = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTML5SGroup',
            ds: null,
            grid: null,
            trazaServer: null,
            fin: null, //Cambiar después inicio y fin
            inicio: null,
            filtrosData: null,
            summary: null,
            evaluations: null,
            parent: null,
            template: _.template(htmlTemplante),

            data5sOld: null,
            data5s: [],
            valorationsArray: [{ text: window.app.idioma.t('PENDIENTE'), value: -1 }, { text: 'No', value: 0 }, { text: window.app.idioma.t('SI'), value: 1 }],

            initialize: function (filtros, parent) {
                //reset default values 
                this.filtrosData = {
                    modeConfig: false,
                    field: null,
                    idForm: null,
                    runTimeJustView: false
                };
                this.parent = parent;
                //igualamos campos que se pasan
                for (var prop in filtros) {
                    this.filtrosData[prop] = filtros[prop];
                }
                //Cargamos template en modo configuracion
                if (this.filtrosData.modeConfig) {
                    if (this.filtrosData.field.template5S == null) {
                        //DATOS PARA CREAR NUEVO: si estamos en modo edición y el formulario no tiene id quiere decir que el campo 5s es nuevo
                        this.filtrosData.field.template5S = [
                            { ID: 1, id5S: 1, num: null, label: window.app.idioma.t('INSERTE_CAMPO'), valoration: -1, comentarios: "", linkAction: '' },
                            { ID: 2, id5S: 2, num: null, label: window.app.idioma.t('INSERTE_CAMPO'), valoration: -1, comentarios: "", linkAction: '' },
                            { ID: 3, id5S: 3, num: null, label: window.app.idioma.t('INSERTE_CAMPO'), valoration: -1, comentarios: "", linkAction: '' },
                            { ID: 4, id5S: 4, num: null, label: window.app.idioma.t('INSERTE_CAMPO'), valoration: -1, comentarios: "", linkAction: '' },
                            { ID: 5, id5S: 5, num: null, label: window.app.idioma.t('INSERTE_CAMPO'), valoration: -1, comentarios: "", linkAction: '' }
                        ];
                    }
                    //slice for duplicate array. (sino no funciona bien  la edición)
                    //this.data5s = JSON.parse(JSON.stringify(this.filtrosData.field.template5S));
                    this.data5s = this.filtrosData.field.template5S;
                } else {
                    //en modo runtime dejamos los datos vacíos hasta que los binden con el metodo bindDataRuntime
                    this.data5s = [];
                }
                this.initializeDS();
            },
            bindDataRuntime: function (dataInString) {
                //estamos en modo RUNTIME si hay datos ya ponemos estos sino ponemos la plantilla ya que es la primera vez que se rellena

                var data = JSON.parse(dataInString);
                if (dataInString && data["data5s"]) {
                    this.data5s = data["data5s"];
                    this.data5sOld = JSON.parse(dataInString)["data5s"];
                } else {
                    //hacemos el slice() para realizar un duplicado de template5S sin esto el grid no funciona correctamente
                    //cuando intentas cancelar y editar
                    this.data5s = JSON.parse(JSON.stringify(this.filtrosData.field.template5S));
                    this.data5sOld = this.filtrosData.field.template5S;
                }
                this.ds.read();
                //$("#gridMaterialesAux").data("kendoGrid").dataSource.read();
            },
            render: function () {
                $(this.el).css("width", "100%"); //para que ocupe un minimo          
                $(this.el).html(this.template());

                this.renderGrid();

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos  sino los escondemos             
                if (!this.filtrosData.modeConfig)
                    this.$("#divConfigControls").css("display", "none");

                return this;
            },
            events: {
                'click .btnAddNew': 'addRow',
                'click .toggleUp5s': 'toggleItemUp5s',
                'click .toggleDown5s': 'toggleItemDown5s',
                //methods for configmode
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField',
            },
            toggleItemUp5s: function (e) {

                var row = $(e.target).closest("tr");
                var grid = $("#divGrid").data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOf5S(dataItem);
                var indexBefore = -1;
                for (var i = index - 1; i >= 0; i--) {
                    if (this.data5s[i].id5S === dataItem.id5S) {
                        indexBefore = i;
                        break;
                    }
                }
                if (index >= 0 && indexBefore >= 0) {
                    this.swapPos5s(index, indexBefore);
                }
            },
            toggleItemDown5s: function (e) {
                var row = $(e.target).closest("tr");
                var grid = $("#divGrid").data("kendoGrid");
                var dataItem = grid.dataItem(row);
                var index = this.getIndexOf5S(dataItem);
                var indexAfter = -1;
                for (var i = index + 1; i < this.data5s.length; i++) {
                    if (this.data5s[i].id5S === dataItem.id5S) {
                        indexAfter = i;
                        break;
                    }
                }
                if (index >= 0 && indexAfter >= 0) {
                    this.swapPos5s(index, indexAfter);
                }
            },
            swapPos5s: function (oldPos, newPos) {
                if (newPos >= 0 && newPos < this.data5s.length) {
                    var temp = this.data5s[oldPos];
                    this.data5s[oldPos] = this.data5s[newPos];
                    this.data5s[newPos] = temp;
                    this.ds.read();
                }
            },
            validate: function () {
                return this.evaluation[0]["result"] >= this.filtrosData.field.min;
            },
            getIndexOf5S: function (dataItem) {
                for (var i = 0; i < this.data5s.length; i++) {
                    if (this.data5s[i].ID === dataItem.ID) {
                        return i;
                    }
                }
                return -1;
            },
            addRow: function (e) {
                //Cuando añadamos una fila nueva si hay una de ejemplo "Inserte campo" la borramos primero antes de añadir la nueva
                var arraIDs = this.data5s.map(function (row) { return row.ID; });
                var newID = Math.max.apply(Math, arraIDs) + 1;
                var newRow = { ID: newID, id5S: parseInt(e.target.value), num: $("#txtNum" + e.target.value).val(), label: $("#txtNew" + e.target.value).val(), valoration: -1, comentarios: "", linkAction: '' };

                var indexRowDelete = -1;
                this.data5s.forEach(function (row, index) {
                    if (row.ID <= 5 && row.id5S == newRow.id5S) {
                        indexRowDelete = index;
                    }
                });
                if (indexRowDelete >= 0)
                    this.data5s.splice(indexRowDelete, 1);
                this.data5s.push(newRow)
                this.ds.read();
            },
            renderChart: function () {
                var self = this;
                // var themes = kendo.dataviz.ui.themes;
                // var MyTheme = kendo.deepExtend(
                //     // Deep copy
                //     {},

                //     // Base theme      
                //     themes.silver,

                //     {
                //     chart: {
                //         // Can contain any chart settings
                //         seriesColors: ["blue", "orange", "#000066", "#000088", "#0000aa", "#0000cc"]
                //     }
                //     }
                // );
                //themes.MyTheme = MyTheme;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                this.$("#divChart").kendoChart({
                    //theme: "MyTheme",
                    dataSource: {
                        data: this.evaluation
                    },
                    chartArea: {
                        height: 200,
                        width: 400
                    },
                    seriesDefaults: {
                        //type: "verticalBullet",
                        type: "column",
                        labels: {
                            format: "{0:N2}%",
                            visible: true,
                            background: "transparent"
                        }
                    },
                    series: [
                        {
                            //currentField: "result",
                            //targetField: "target",
                            field: "result",

                        }],
                    categoryAxis: {
                        //field: "id5s",
                        name: "categoryAxis",
                        categories: ["TOTAL", "1S", "2S", "3S", "4S", "5S"]
                    },
                    valueAxis: [{
                        name: "valueAxis",
                        min: 0,
                        max: 110,
                        labels: {
                            format: "{0}%"
                        }
                    }],

                    render: function (e) {
                        // Locate value slot
                        //
                        // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/chart/chart_axis/methods/slot
                        var valueAxis = e.sender.getAxis("valueAxis");
                        var valueSlot = valueAxis.slot(self.filtrosData.field.min);

                        // Locate right-most category slot
                        //
                        var categoryAxis = e.sender.getAxis("categoryAxis");
                        var lastCategoryIndex = Math.max(1, categoryAxis.range().max);
                        var minCategorySlot = categoryAxis.slot(0);
                        var maxCategorySlot = categoryAxis.slot(lastCategoryIndex);

                        // Render a line element
                        //
                        // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/drawing/text
                        var line = new kendo.drawing.Path({
                            stroke: {
                                color: "red",
                                width: 2
                            }
                        });
                        line.moveTo(valueSlot.origin).lineTo([maxCategorySlot.origin.x, valueSlot.origin.y]);

                        // Render a text element
                        //
                        // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/drawing/text
                        //var labelPos = [maxCategorySlot.origin.x - 50, valueSlot.origin.y - 20];
                        var labelPos = [0, valueSlot.origin.y - 20];
                        var label = new kendo.drawing.Text(window.app.idioma.t("OBJETIVO") + " " + self.filtrosData.field.min + " %", labelPos, {
                            fill: {
                                color: "red"
                            },
                            font: "12px sans"
                        });

                        var group = new kendo.drawing.Group();
                        group.append(line, label);

                        // Draw on chart surface
                        //
                        // http://docs.telerik.com/kendo-ui/framework/drawing/overview
                        e.sender.surface.draw(group);
                    }
                });
            },
            initializeDS: function () {
                var self = this;
                self.ds = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    transport: {
                        read: function (e) {
                            // on success
                            e.success(self.data5s);
                            // on failure
                            //e.error("XHR response", "status code", "error message");
                        },
                        update: function (e) {
                            e.success();
                        },
                        destroy: function (e) {
                            var i = -1;
                            self.data5s.forEach(function (item, index) {
                                if (item["ID"] == e.data.ID) {
                                    i = index;
                                }
                            });
                            if (i >= 0)
                                self.data5s.splice(i, 1);
                            e.success();
                        }
                    },
                    requestEnd: function (e) { },
                    schema: {
                        model: {
                            id: "ID",
                            fields: {
                                ID: { type: "number", editable: false },
                                num: { type: "number", editable: self.filtrosData.modeConfig },
                                label: { type: "string", editable: self.filtrosData.modeConfig },
                                id5S: { type: "number", editable: false },
                                valoration: { type: "number" },
                                linkAction: { type: "text" }
                            }
                        }
                    },
                    group: {
                        field: "id5S", aggregates: [
                            { field: "id5S", aggregate: "min" }]
                    }
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
            },
            renderGrid: function () {
                var self = this;
                //window.app.idioma.t('EDITAR') , window.app.idioma.t('ACTUALIZAR') window.app.idioma.t('CANCELAR')
                var arrayCommands = [{ name: "edit", text: { edit: "", update: "", cancel: "" } }];
                //[{ name: "edit", text: { edit: window.app.idioma.t('EDITAR'), update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } }, { name: "destroy", text: window.app.idioma.t('ELIMINAR') }];
                if (self.filtrosData.modeConfig) {
                    //Si estamos en modo configuracion ponemos otros botones
                    arrayCommands = [
                        { template: '<a class="k-button k-button-icontext toggleUp5s"><img  src="../ALT/img/ALT_up.png" /></span></a>' },
                        { template: '  <a class="k-button k-button-icontext toggleDown5s" ><img  src="../ALT/img/ALT_down.png" /></span></a> ' },
                        //{template:'<a class="editField k-button" ><img  src="../ALT/img/ALT_edit.png" /></span></a>'},
                        { name: "edit", text: { edit: "", update: window.app.idioma.t('ACTUALIZAR'), cancel: window.app.idioma.t('CANCELAR') } },
                        { name: "destroy", text: "" }];//, template: '<a class="k-button k-grid-destroy" style="background-color:red; width: 24px; height:24px"><img  src="../ALT/img/ALT_cancel.png" style="width: 16px; height:16px"/></a>' }];
                }
                function footerTemplate(dataItem) {
                    if (self.filtrosData.modeConfig)
                        return "";
                    return "<div id='summaryGroup0'></div>";
                }
                function groupFooterTemplateNum(dataItem) {
                    if (self.filtrosData.modeConfig)
                        return "<input id='txtNum" + dataItem.id5S.min + "' class='k-textbox' style='width: 100%'/>";
                    return "";
                }
                function groupFooterTemplate(dataItem) {
                    if (self.filtrosData.modeConfig)
                        return "<input id='txtNew" + dataItem.id5S.min + "' class='k-textbox' style='width: 100%'/> ";
                    return "<div id='summaryGroup" + dataItem.id5S.min + "' ></div>";
                }
                function IDText(dataItem) {
                    return window.app.idioma.t('SEO_TITLE_S' + dataItem.value);
                }
                function valuationEditor(container, options) {
                    $('<input data-bind="value:' + options.field + '"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            autoBind: true,
                            dataTextField: "text",
                            template: "#=text#",
                            dataValueField: "value",
                            dataSource: self.valorationsArray
                        });
                }
                function valuationText(dataItem) {
                    //devolveremos lo que necesitemos
                    return "<strong>" + self.valorationsArray[dataItem.valoration + 1].text + "</strong>";
                }
                function fijarAccion(dataItem) {
                    if (dataItem.linkAction.includes('http://') || dataItem.linkAction.includes('https://')) {
                        return "<a target='_blank' href='" + dataItem.linkAction + "'><img src='/Portal/img/info.png' title='" + dataItem.linkAction + "' />";
                    } else {
                        return dataItem.linkAction;
                    }
                }
                self.grid = this.$("#divGrid").kendoGrid({
                    dataSource: self.ds,
                    editable: {
                        mode: "inline",
                        confirmation: false,
                    },
                    width: "100%",
                    pageable: false,
                    scrollable: false,
                    columns: [
                        {
                            field: "id5S", hidden: true,
                            groupHeaderTemplate: IDText
                        },
                        {
                            field: "num", title: "Núm.", width: "2.5em",
                            groupFooterTemplate: groupFooterTemplateNum,
                        },
                        {
                            field: "label", title: window.app.idioma.t('DESCRIPCION'), width: 350,
                            groupFooterTemplate: groupFooterTemplate,
                            footerTemplate: footerTemplate
                        },
                        {
                            field: "valoration", title: window.app.idioma.t('VALOR'), width: 120, hidden: self.filtrosData.modeConfig,
                            editor: valuationEditor,
                            template: valuationText,
                        },
                        {
                            field: "comentarios", title: window.app.idioma.t('COMENTARIOS'), hidden: self.filtrosData.modeConfig,
                        },
                        {
                            title: window.app.idioma.t('ACCION'), field: "linkAction", width: 350,
                            template: fijarAccion,
                            hidden: self.filtrosData.modeConfig,
                        },
                        {
                            title: "&nbsp;", command: arrayCommands, width: 100, hidden: self.filtrosData.runTimeJustView,
                            groupFooterTemplate: self.filtrosData.modeConfig ? "<button value=#:id5S.min# class='k-button btnAddNew'>" + window.app.idioma.t('ANADIR') + "</button>" : ""
                        }
                    ],
                    dataBound: function (e) {
                        var items = e.sender.items();
                        if (!self.parent.modeConfig) {
                            //summary group                            
                            //haremos un sumatorio para cada S, 
                            //por ejemplo en la posicion del array summary[1] esta la S1
                            //En la posicion 0 esta el sumatorio total. 
                            self.summary = [{}, {}, {}, {}, {}, {}];
                            self.evaluation = [{ sum: 0, numItems: 0 }, { sum: 0, numItems: 0 }, { sum: 0, numItems: 0 }, { sum: 0, numItems: 0 }, { sum: 0, numItems: 0 }, { sum: 0, numItems: 0 }];
                            items.each(function () {
                                var dataItem = e.sender.dataItem(this);

                                //CODIGO PARA HACE SUMATORIOS
                                if (dataItem.id5S != null && dataItem.id5S < self.summary.length) {
                                    //sumamos en la correspondiente 5S solo si applica SUMMARY tiene los sumatorios de cada tipo y EVALUATION tendra cada una de las 5S funciones                               
                                    if (!self.summary[dataItem.id5S][dataItem.valoration]) { //si no tiene valor ponemos el primero
                                        self.summary[dataItem.id5S][dataItem.valoration] = 1;
                                    }
                                    else {
                                        self.summary[dataItem.id5S][dataItem.valoration]++;
                                    }
                                    self.evaluation[dataItem.id5S]["sum"] += dataItem.valoration <= 0 ? 0 : 1;
                                    self.evaluation[dataItem.id5S]["numItems"]++;
                                    //sumamos en la posicion 0 de totalizador
                                    if (!self.summary[0][dataItem.valoration]) {
                                        self.summary[0][dataItem.valoration] = 1;
                                    }
                                    else {
                                        self.summary[0][dataItem.valoration]++;
                                    }
                                    self.evaluation[0]["sum"] += dataItem.valoration <= 0 ? 0 : 1;
                                    self.evaluation[0]["numItems"]++;
                                }

                            })
                            for (var i = 0; i <= 5; i++) {
                                self.evaluation[i]["id5s"] = i;
                                if (self.evaluation[i]["numItems"] > 0)
                                    self.evaluation[i]["result"] = 100 * self.evaluation[i]["sum"] / self.evaluation[i]["numItems"]; //porcentaje la suma divido por el total
                                else
                                    self.evaluation[i]["result"] = 0;
                                var wrapper = e.sender.element.find("#summaryGroup" + i);
                                for (var prop in self.summary[i]) {
                                    wrapper.append("<div><label style='width:100px'>" + self.getValorationText(prop) + "</label><span >:&#09; " + self.summary[i][prop] + "</span></div>");
                                    if (i == 0)
                                        wrapper.css("font-size", "160%");
                                }
                            }

                            self.renderChart();

                        } else {
                            //MODE CONFIG
                            items.each(function () {
                                var dataItem = e.sender.dataItem(this);
                                //SI SOLO HAY UNO DE UNA S, NO DEJAREMOS BORRAR (Si no desaparece el grupo)
                                var arrId5s = self.data5s.filter(function (x) {
                                    return x.id5S == dataItem.id5S;
                                });
                                if (arrId5s.length == 1) { //si solo queda uno no dejamos eliminar ni mover siempre tiene que haber uno de cada tipo de S
                                    $(this).find(".k-grid-delete").css("display", "none");
                                    $(this).find(".toggleUp5s").css("display", "none");
                                    $(this).find(".toggleDown5s").css("display", "none");
                                }
                                if (dataItem.ID <= 5) { //es algun campo inicial de "INSERTE CAMPO"
                                    $(this).find(".toggleUp5s").css("display", "none");
                                    $(this).find(".k-grid-edit").css("display", "none");
                                    $(this).find(".k-grid-edit").css("display", "none");
                                    $(this).find(".toggleUp5s").css("display", "none");
                                    $(this).find(".toggleDown5s").css("display", "none");
                                }
                            });
                        }

                        $("#divGrid").keypress(function (e) {
                            if (e.keyCode === 13) {
                                e.preventDefault();
                            }
                        });
                    },
                    edit: function () {
                        $('input[name="comentarios"]').addClass("keyboardOn");
                        $('input[name="linkAction"]').addClass("keyboardOn");

                        if (localStorage.getItem("tecladoVirtual") == "true" && window.location.pathname.toLowerCase().indexOf("terminal") > 0) {
                            $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                            if (localStorage.getItem("idiomaSeleccionado") == "en-GB") {
                                $('.keyboardOn').keyboard();
                            } else {
                                $('.keyboardOn').keyboard({ layout: 'spanish-qwerty' });
                            }
                        }
                    },
                }).data("kendoGrid");

            },
            getValorationText: function (id) {
                var text = '';
                this.valorationsArray.forEach(function (val) {
                    if (val.value == id) {
                        text = val.text;
                    }
                });
                return text;
            },
            getCambios5SValues: function () {
                var cambiosStr = "";
                var dataOld = this.data5sOld;
                var dataNew = this.ds.data();
                dataOld.forEach(function (item, index) {
                    var cambiosFila = "";
                    if (item.valoration != dataNew[index].valoration)
                        cambiosFila += window.app.idioma.t('VALOR') + ": " + item.valoration + " -> " + dataNew[index].valoration + "; ";

                    if (item.comentarios != dataNew[index].comentarios)
                        cambiosFila += window.app.idioma.t('COMENTARIOS') + ": " + item.comentarios + " -> " + dataNew[index].comentarios + "; ";


                    if (item.linkAction != dataNew[index].linkAction)
                        cambiosFila += window.app.idioma.t('LINK') + ": " + item.linkAction + " -> " + dataNew[index].linkAction + "; ";

                    if (cambiosFila != "")
                        cambiosStr += window.app.idioma.t('CAMBIOS_EN_FILA') + ": " + item.label + " --> " + cambiosFila + "</br>";


                });

                return cambiosStr;
            },
            save5SInstance: function () {
                //console.log("Saving... " + JSON.stringify(this.ds.data()));
                return this.ds.data();
            },
            save5STemplate: function () {
                this.filtrosData.field.set("template5S", this.data5s)
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

        return gridKendo;
    }
);