define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/PlanificacionTrasiegos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaPlanificacionTra, Not, VistaDlgConfirm) {
        var vistaPlanificacionTrasiegos = Backbone.View.extend({
            tagName: 'div',
            dsMostosParameters: [],
            dsBeerParameters: [],
            dsMaterial: [],
            dsConfig: [],
            dsWoArticles: [],
            dsHDBeerDatas: [],
            dsPlanningDetail: [],
            tab: null,
            pass: true,
            gridDetalle: null,
            tabPass: true,
            tabPass2: true,
            tryCount:0,
            retryLimit:1,
            confirmacion: null,
            window: null,
            currentWeek: null,
            gridObj: null,
            weeksNumber: 0,
            startWeek: 0,
            endWeek: 0,
            template: _.template(plantillaPlanificacionTra),
            initialize: function () {
                Backbone.on('eventNotificacionOrdenFabricacion', this.actualiza, this);
                var self = this;
                self.render();
                self.tab.select(0);
            },
            SetDataSourceParameters: function () {
                var self = this;

                kendo.ui.progress($("#gridMostos"), true);
                $.ajax({
                    type: "POST",
                    url: "../api/GetArticlesParametersForDecanting",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsMostosParameters = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsMostosParameters,
                        pageSize: 30,
                        schema: {
                            model: {
                                id: "PK",
                                fields: {
                                    PK: { type: "number" },
                                    DefID: { type: "number" },
                                    Beer: { type: "string" },
                                    DecreasePacking: { type: "number" },
                                    DecreaseFiltration: { type: "number" },
                                    RecoveredBeerInFiltration: { type: "number" },
                                    Dilution: { type: "number" },
                                    HDBeerInSelectedPeriod: { type: "string" },
                                    ID: { type: "number" },
                                    CZAEnv: { type: "string" }
                                }
                            }
                        }
                    });
                    kendo.ui.progress($("#gridMostos"), false);
                    self.pass = true;

                    $("#gridMostos").data("kendoGrid").setDataSource(aux);
                    $("#gridMostos").data("kendoGrid").dataSource.read();
                    $("#gridMostos").data("kendoGrid").thead.kendoTooltip({
                        filter: "th"
                    });
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CO'), 2000);
                    kendo.ui.progress($("#gridMostos"), false);
                });

                kendo.ui.progress($("#gridBeers"), true);
                $.ajax({
                    type: "POST",
                    url: "../api/GetHDBeerParametersForDecanting",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsBeerParameters = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsBeerParameters,
                        pageSize: 30,
                        schema: {
                            model: {
                                id: "PK",
                                fields: {
                                    PK: { type: "number" },
                                    AVVolumeForDecantingTanqs: { type: "number" },                                    
                                    BeerType: { type: "string" },
                                    DefID: { type: "string" },                                    
                                    ID: { type: "number" },
                                    NecessaryTotalHDBeer: { type: "number" }
                                }
                            }
                        }
                    });
                    kendo.ui.progress($("#gridBeers"), false);
                    self.pass = true;

                    $("#gridBeers").data("kendoGrid").setDataSource(aux);
                    $("#gridBeers").data("kendoGrid").dataSource.read();
                    $("#gridBeers").data("kendoGrid").thead.kendoTooltip({
                        filter: "th"
                    });
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CO'), 2000);
                    }
                    kendo.ui.progress($("#gridBeers"), false);
                });
            },
            render: function () {
                var self = this;
                self.tabPass = true;
                self.tabPass2 = true;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
               
                // Tabstrip
                self.tab = $("#divPestanias").kendoTabStrip({
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    },
                    select: function (e) {
                        self.selectTab(e, self)
                    }
                }).data("kendoTabStrip");
            },
            selectTab: function (e, self) {
                var self = this;
                self.pass = true;

                switch ($(e.item).index()) {
                    case 0:
                        if (self.tabPass) {
                            self.SetPlanning();
                            self.SetDatas();
                            self.tabPass = false;
                        } else
                            self.SetDatas();                        
                        break;
                    case 1:
                        if (self.tabPass2) {
                            self.SetParameters();
                            self.SetDataSourceParameters();
                            self.tabPass2 = false;
                        } else
                            self.SetDataSourceParameters();                        
                        break;
                }
            },
            events: {
                'click #chbBeer': 'SelectRows',
                'click #chbMosto': 'SelectRows',
                'click .checkbox': 'CheckRegister',
                'click .aplicar': 'SaveDatas',
                'click #btnAplicar': 'SetDatas'
            },
            SetDatas: function () {
                var self = this;

                var days = parseInt($("#daysToContemplate").data("kendoNumericTextBox").value());
                var currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + parseInt(days)-1);
                kendo.ui.progress($("#gridWoPlanning"), true);
                kendo.ui.progress($("#gridHDBeerPlanning"), true);

                $.ajax({
                    type: "GET",
                    url: "../api/GetPackingArticlesDatasForDecantingPlanning/"+currentDate.toDateString(),
                    dataType: 'json',
                    tryCount: 0,
                    retryLimit:1,
                    contentType: "application/json; charset=utf-8",
                    //data: JSON.stringify(currentDate.toDateString()),
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsWoArticles = data.WoPlanning;
                    var aux = new kendo.data.DataSource({
                        data: self.dsWoArticles,
                        pageSize: 30,
                        schema: {
                            model: {
                                id: "Code",
                                fields: {
                                    Code: { type: "string" },
                                    Article: { type: "string" },                                    
                                    Quantity: { type: "number" },
                                    StockInTcp: { type: "number" },                                    
                                    TotalNecessity: { type: "number" },
                                    TotalBeerToFilter: { type: "number" },
                                    TotalHDBeerToSendToFiltration: { type: "number" },
                                    HDBeer: { type: "string" },                                    
                                }
                            }
                        }});
                    self.pass = true;
                    $("#gridWoPlanning").data("kendoGrid").setDataSource(aux);
                    $("#gridWoPlanning").data("kendoGrid").dataSource.read();
                    $("#gridWoPlanning").data("kendoGrid").refresh();
                    //Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t("UPDATED_DATAS"), 4000);
                    kendo.ui.progress($("#gridWoPlanning"), false);
                    $("#gridWoPlanning").data("kendoGrid").thead.kendoTooltip({
                        filter: "th"
                    });

                    self.dsHDBeerDatas = data.HDBeerPlanning;
                    var aux2 = new kendo.data.DataSource({
                        data: self.dsHDBeerDatas,
                        pageSize: 30,
                        schema: {
                            model: {
                                id: "HDBeer",
                                fields: {
                                    HDBeer: { type: "string" },
                                    TotalHDBeerInPeriod: { type: "number" },
                                    HDBeerInCellar: { type: "number" },
                                    RealTanqsNumberToEmpty: { type: "number" },
                                    NecesaryTotalHDBeer: { type: "number" },
                                    EstimatedTanqsNumberToEmpty: { type: "number" },
                                    EstimatedTanqsNumberToEmpty: { type: "number" },
                                    TotalBeerInPlanning: { type: "string" },
                                    EstimatedTanqsNumberToFill: { type: "number" },
                                    TanqsDifference: { type: "number" }
                                }
                            }
                        }
                    });                   

                    $("#gridHDBeerPlanning").data("kendoGrid").setDataSource(aux2);
                    $("#gridHDBeerPlanning").data("kendoGrid").dataSource.read();
                    $("#gridHDBeerPlanning").data("kendoGrid").refresh();                   
                    kendo.ui.progress($("#gridHDBeerPlanning"), false);
                    $("#gridHDBeerPlanning").data("kendoGrid").thead.kendoTooltip({
                        filter: "th"
                    });

                }).fail(function (xhr) {
                    kendo.ui.progress($("#gridWoPlanning"), false);
                    kendo.ui.progress($("#gridHDBeerPlanning"), false);
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    }else
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('FALLO_CONEXION'), 2000);
                });
            },
            SaveDatas: function (e) {
                kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), true);
                var self = this,
                    value = [],
                    object = {};

                $.grep($($(e.currentTarget).closest(".k-grid")).find("input[id*='field']"), function (item) { return (item.value != "" ? item.value : "0") }).forEach(function (item) {
                    if ($($(e.currentTarget).closest(".k-grid")).attr("id").indexOf("Mostos") != -1) {
                        if (item.id.indexOf("DecreasePacking") != -1)
                            object.decreasePacking = item.value;
                        else
                            if (item.id.indexOf("DecreaseFiltration") != -1)
                                object.decreaseFiltration = item.value;
                            else
                                if (item.id.indexOf("BeerInFiltration") != -1)
                                    object.beerInFiltration = item.value;
                                else
                                    if (item.id.indexOf("Dilution") != -1)
                                        object.dilution = item.value;
                    } else {
                        object.avVolumeDecantingTanqs = item.value;
                    }
                });

                var aux = null;
                var article = null;
                //Se pasa a array (por eso se usa el grep) para poder aplicar el foreach
                $.grep($(e.currentTarget).closest(".k-grid").data("kendoGrid").select(), function (item) { return item.id === "" }).forEach(function (item) {
                    aux = $(e.currentTarget).closest(".k-grid").data("kendoGrid").dataItem(item);

                    if ($($(e.currentTarget).closest(".k-grid")).attr("id").indexOf("Mostos") != -1)
                        article = aux.Beer;
                    else
                        article = aux.BeerType;

                    value.push({ mosto: article, parameters: object });
                });

                var accion = "";
                if ($($(e.currentTarget).closest(".k-grid")).attr("id").indexOf("Mostos") != -1)
                    accion = "../api/SetMostosParameters";
                else
                    accion = "../api/SetBeersParameters";

                $.ajax({
                    type: "POST",
                    url: accion,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(value),
                    cache: false,
                    async: true
                }).done(function (data) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t("UPDATED_VALUES"), 4000);
                    kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), false);
                    self.SetDataSourceParameters();
                    $.map($($(e.currentTarget).closest(".k-grid")).find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                        $("#" + item.id).data("kendoNumericTextBox").value(null);
                    });
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), xhr.message, 4000);
                    }
                    kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), false);
                });
            },
            SelectRows: function (e, self) {
                if (e.currentTarget.checked == true) {
                    $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").tbody.find(">tr").addClass('k-state-selected');
                    $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").tbody.find('input:checkbox').prop("checked", true);
                    if ($($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").select().length != 0) {
                        var data = $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").dataItem($($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").select(0));
                        $.map($($(e.currentTarget.offsetParent).closest(".k-grid")).find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                            $("#" + item.id).data("kendoNumericTextBox").value(data[item.id.replace("field", "")]);
                        });
                    }
                } else {
                    $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").tbody.find(">tr").removeClass('k-state-selected');
                    $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").tbody.find('input:checkbox').prop("checked", false);
                    $.map($($(e.currentTarget.offsetParent).closest(".k-grid")).find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                        $("#" + item.id).data("kendoNumericTextBox").value(null);
                    });
                }
            },
            CheckRegister: function (e) {
                if (e.currentTarget.checked == true) {
                    $(e.currentTarget.closest("tr")).addClass('k-state-selected');
                } else {
                    $(e.currentTarget.closest("tr")).removeClass('k-state-selected');
                }

                if ($($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").select().length != 0) {
                    var data = $($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").dataItem($($(e.currentTarget.offsetParent).closest(".k-grid")).data("kendoGrid").select(0));
                    $.map($($(e.currentTarget.offsetParent).closest(".k-grid")).find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                        $("#" + item.id).data("kendoNumericTextBox").value(data[item.id.replace("field", "")]);
                    });
                } else {
                    $.map($($(e.currentTarget.offsetParent).closest(".k-grid")).find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                        $("#" + item.id).data("kendoNumericTextBox").value(null);
                    });
                }
            },
            SetPlanning: function () {
                var self = this,
                    tools = [];

                var planningitems = [
                        {
                            field: "Article",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                        },
                        {
                            field: "Quantity",
                            title: window.app.idioma.t("TOTAL_ENVASAR"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            }
                        },
                        {
                            field: "StockInTCP",
                            title: window.app.idioma.t("EXISTENCIAS_TCP"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            }
                        },
                        {
                            field: "TotalNecessity",
                            title: window.app.idioma.t("NECESIDAD_TCP"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            }
                        },
                        {
                            field: "TotalBeerToFilter",
                            title: window.app.idioma.t("TOTAL_TO_FILTER"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            }
                        },
                        {
                            field: "TotalHDBeerToSendToFiltration",
                            title: window.app.idioma.t("TOTAL_HDBEER_SEND_FILTRATION"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            }
                        },
                        {
                            field: "HDBeer",
                            title: window.app.idioma.t("HDBEER")
                        }
                ];

                tools = [
                     { template: '<center><label>' + window.app.idioma.t('PREVISION_FILTRACIONES') + '&nbsp;&nbsp; </label></center>' },
                     {
                         template: '&nbsp;&nbsp;<label>' + window.app.idioma.t('DIAS_CONTEMPLAR') + ':&nbsp;&nbsp;</label>&nbsp;&nbsp;<input id="daysToContemplate" style="width: 80px;"/>'
                     },
                    {
                        template: "<button id='btnAplicar' class='k-button' style='background-color: green; color: white; float:right'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>"
                    }
                ];

                self.CreateGrid("gridWoPlanning", planningitems, self.dsWoArticles, tools);
                //$("#gridWoPlanning").data("kendoGrid").setOptions({
                //    groupable: {
                //        messages: {
                //            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                //        }
                //    }
                //});
                self.CreateNumericField("daysToContemplate", 4);

                kendo.ui.progress($("#gridWoPlanning"), true);
                self.cont = 0;

                var planningitems2 = [
                       {
                           field: "HDBeer",
                           title: window.app.idioma.t("HDBEER")
                       },
                       {
                           field: "TotalHDBeerInPeriod",
                           title: window.app.idioma.t("TOTAL_HDBEER_NECESSITY"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "HDBeerInCellar",
                           title: window.app.idioma.t("HDBEER_IN_CELLAR"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "RealTanqsNumberToEmpty",
                           title: window.app.idioma.t("TANQS_TO_EMPTY"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "NecesaryTotalHDBeer",
                           title: window.app.idioma.t("NECESARY_TOTALHDBEER"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "EstimatedTanqsNumberToEmpty",
                           title: window.app.idioma.t("ESTIMATED_TANQS_TOEMPTY"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "TotalBeerInPlanning",
                           title: window.app.idioma.t("BEER_IN_PLANING"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "EstimatedTanqsNumberToFill",
                           title: window.app.idioma.t("TANQS_TO_FILL"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "TanqsDifference",
                           title: window.app.idioma.t("TANQS_DIFERENCE"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       }
                ];


                var auxTools = [{ template: '<center><label>' + window.app.idioma.t('NECESIDAD_TRASIEGO') + '&nbsp;&nbsp; </label></center>' }];

                self.CreateGrid("gridHDBeerPlanning", planningitems2, self.dsHDBeerDatas, auxTools);
                kendo.ui.progress($("#gridHDBeerPlanning"), true);

                //self.SetDatas();
            },
            CreateCombo: function (id, text, value, ds) {
                $("#" + id).kendoDropDownList({
                    dataTextField: text,
                    dataValueField: value,
                    dataSource: ds,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });
            },
            CreateNumericField: function (field, value) {
                $("#" + field).kendoNumericTextBox({
                    placeholder: "Introduzca valor",
                    format: "n0",
                    decimals: 0,
                    restrictDecimals: true
                });

                $("#" + field).data("kendoNumericTextBox").value(value);
            },
            SetParameters: function () {
                var self = this;

                var mostoItems = [
                       {
                           field: "ID",
                           title: window.app.idioma.t("ID_MATERIAL"),
                           hidden: true
                       },
                       {
                           headerTemplate: '<input id="chbMosto" type="checkbox" style="width: 14px; height: 14px;" />',
                           template: '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px;" />',
                           width: 25
                       },
                       {
                           field: "Beer",
                           title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                       },
                       {
                           field: "DecreasePacking",
                           title: window.app.idioma.t("PACKING_DECREASE"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "DecreaseFiltration",
                           title: window.app.idioma.t("FILTRATION_DECREASE"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "RecoveredBeerInFiltration",
                           title: window.app.idioma.t("RECOVERED_BEER_INFILTRATION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "Dilution",
                           title: window.app.idioma.t("DILUTION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       },
                       {
                           field: "HDBeerInSelectedPeriod",
                           title: window.app.idioma.t("HDBEER_IN_SELECTED_PERIOD")
                       }
                ];

                tool = [
                         { template: '<center><label>' + window.app.idioma.t('PARAMETROS_TRASIEGOS') + '&nbsp;&nbsp; </label></center>' },
                         {
                             template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('NEW_PACKING_DECREASE') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDecreasePacking' class='txtField'>"
                         },
                         {
                             template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('NEW_FILTRATION_DECREASE') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDecreaseFiltration' class='txtField'>"
                         },
                         {
                             template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('NEW_RECOVERED_BEER_INFILTRATION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldRecoveredBeerInFiltration' class='txtField'>"
                         },
                         {
                             template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('NEW_DILUTION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDilution' class='txtField'>"
                         },
                         {
                             template: "&nbsp;&nbsp;<button type='button' class='k-button k-button-icontex aplicar' style='background-color: green; color: white;'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>"
                         }
                ];

                self.CreateGrid("gridMostos", mostoItems, self.dsMostosParameters, tool);
                $("#gridMostos").data("kendoGrid").setOptions({
                    change: self.SelectedRow
                });

                var beerItems = [
                       {
                           headerTemplate: '<input id="chbBeer" type="checkbox" style="width: 14px; height: 14px;" />',
                           template: '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px;" />',
                           width: 25
                       },
                       {
                           field: "BeerType",
                           title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                       },
                       {
                           field: "AVVolumeForDecantingTanqs",
                           title: window.app.idioma.t("AV_VOLUME_FOR_DECANTING_TANQS"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           filterable: {
                               ui: function (element) {
                                   element.kendoNumericTextBox({
                                       format: "{0:n2}",
                                       culture: localStorage.getItem("idiomaSeleccionado")
                                   })
                               }
                           }
                       }];

                toolBar = [
                         { template: '<center><label>' + window.app.idioma.t('PARAMETROS_HDBEER') + '&nbsp;&nbsp; </label></center>' },
                         {
                             template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('NEW_AV_VOLUME_FOR_DECANTING_TANQS') + "</label>&nbsp;&nbsp;<input type='number' id='fieldAVVolumeForDecantingTanqs' class='txtField'>"
                         },
                         {
                             template: "&nbsp;&nbsp;<button type='button' class='k-button k-button-icontex aplicar' style='background-color: green; color: white;'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>"
                         }
                ];
                self.CreateGrid("gridBeers", beerItems, self.dsBeerParameters, toolBar);
                $("#gridBeers").data("kendoGrid").setOptions({
                    change: self.SelectedRow
                });

                $.map($("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                    self.CreateTextField(item.id);
                    $("#" + item.id).data("kendoNumericTextBox").value(null);
                });
            },
            SelectedRow: function (e) {
                if (e.sender.select(0).find("input:checked").length != 0) {
                    e.sender.select(0).find("input:checkbox").prop("checked", false);
                    $(e.sender.select(0)).removeClass('k-state-selected');
                }
                else 
                    e.sender.select(0).find("input:checkbox").prop("checked", true);
                
                $.map(e.sender.element.find("input:checked"), function (value, index) { return [value] }).forEach(function (item) {
                    if(!$(item).closest("tr").hasClass('k-state-selected'))
                        $(item).closest("tr").addClass('k-state-selected');
                });

                var data = $(e.sender.element).data("kendoGrid").dataItem($(e.sender.element).data("kendoGrid").select(0));
                var cont = $(e.sender.element).data("kendoGrid").select().length;

                $.map(e.sender.element.find("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                    if (cont == 0)
                        $("#" + item.id).data("kendoNumericTextBox").value(null);
                    else
                        $("#" + item.id).data("kendoNumericTextBox").value(data[item.id.replace("field", "")]);
                });
            },
            CreateTextField: function (name) {
                $("#" + name).kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 2,
                    min: -99999,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n2'
                });
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrdenFabricacion');
                this.remove();
            },
            SetDataSource: function (serverfunction) {
                var self = this;
                var aux = [];
                $.ajax({
                    type: "POST",
                    url: serverfunction,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    aux = data;
                    return aux;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CO'), 2000);
                    }
                });
            },
            CreateGrid: function (grid, items, ds, tool) {
                var self = this;

                $("#" + grid).kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        data: ds,
                        pageSize: 30
                    }),
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    selectable: "multiple, row",
                    //height: "auto",
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [30, 50, 100,'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: tool,
                    columns: items,
                    //dataBinding: function (e) { self.resizeGrid(e, self); },
                    dataBound: function (e) {
                        //self.SelectRow(e, self);
                        self.resizeGrid(e, self);
                    }
                });
            },
            actualiza: function (tipo) {
                var self = this;
                self.SetParameters();
            },
            resizeGrid: function (e, self) {

                if (self.pass) {

                    if (e.sender._cellId.indexOf("gridWoPlanning") != -1)
                        self.pass = true;
                    else
                        self.pass = false;

                    var contenedorHeight = $("#center-pane").innerHeight();
                    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                    var utilSpace = contenedorHeight - cabeceraHeight;
                    var gridElement = null,
                                dataArea = null,
                                gridHeight = null,
                                otherElements = null,
                                otherElementsHeight = 0;

                    var gridElement2 = null,
                                dataArea2 = null,
                                gridHeight2 = null,
                                otherElements2 = null,
                                otherElementsHeight2 = 0;

                    if (e.sender._cellId.indexOf("gridWoPlanning") != -1 || e.sender._cellId.indexOf("gridHDBeerPlanning") != -1) {

                        gridElement = $("#gridWoPlanning"),
                        dataArea = gridElement.find(".k-grid-content"),
                        gridHeight = gridElement.innerHeight(),
                            otherElements = gridElement.children().not(".k-grid-content"),
                            otherElementsHeight = 0;

                        otherElements.each(function () {
                            otherElementsHeight += $(this).innerHeight();
                        });
                        dataArea.height((utilSpace / 2)-otherElementsHeight);

                        gridElement2 = $("#gridHDBeerPlanning"),
                        dataArea2 = gridElement2.find(".k-grid-content");
                        gridHeight2 =gridElement2.innerHeight();
                        otherElements2 = gridElement2.children().not(".k-grid-content"),
                        otherElementsHeight2 = 0;

                        otherElements2.each(function () {
                            otherElementsHeight2 += $(this).innerHeight();
                        });
                        
                        dataArea2.height((utilSpace / 2) - otherElementsHeight2 + 50);                       

                    } else
                        if (e.sender._cellId.indexOf("gridMostos") != -1 || e.sender._cellId.indexOf("gridBeers") != -1) {
                                gridElement =$("#gridMostos"),
                                dataArea = gridElement.find(".k-grid-content"),
                                gridHeight = gridElement.innerHeight(),
                                otherElements = gridElement.children().not(".k-grid-content"),
                                otherElementsHeight = 0;

                            otherElements.each(function () {
                                otherElementsHeight += $(this).innerHeight();
                            });

                            dataArea.height((utilSpace / 2) - otherElementsHeight);

                                gridElement2 = $("#gridBeers"),
                                dataArea2 = gridElement2.find(".k-grid-content"),
                                gridHeight2 = gridElement2.innerHeight();
                                otherElements2 = gridElement2.children().not(".k-grid-content"),
                                otherElementsHeight2 = 0;

                            otherElements2.each(function () {
                                otherElementsHeight2 += $(this).innerHeight();
                            });

                            dataArea2.height((utilSpace / 2) - otherElementsHeight2 - 50);                           
                        }
                }
            }
        });
        return vistaPlanificacionTrasiegos;
    });