define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/PlanificacionCoccion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaPlanificacionCoccion, Not, VistaDlgConfirm) {
        var vistaPlanificacionCoccion = Backbone.View.extend({
            tagName: 'div',
            SelGridBeers: [],
            SelGridMostos: [],
            dsMostosParameters: [],
            dsBeerParameters: [],
            dsMaterial: [],
            dsConfig: [],
            dsWoArticles: [],
            dsHDBeerDatas: [],
            dsPlanningDetail: [],
            initialDays: 21,
            tab: null,
            pass: true,
            gridDetalle: null,
            tabPass: true,
            tabPass2: true,
            confirmacion: null,
            window: null,
            currentDay: null,
            daysNumber: null,
            startDay: null,
            endDay: null,
            gridObj: null,
            template: _.template(plantillaPlanificacionCoccion),
            initialize: function () {
                Backbone.on('eventNotificacionOrdenFabricacion', this.actualiza, this);
                var self = this;
                self.render();
                self.SetSalasCoccion();
                self.SetDataSourceArticles();
            },
            SetCurrentDay: function () {
                var today = new Date(),
                    dd = today.getDate(),
                    mm = today.getMonth() + 1,
                    yyyy = today.getFullYear();

                if (dd < 10) { dd = '0' + dd; }
                if (mm < 10) { mm = '0' + mm; }

                this.currentDay = yyyy + '-' + mm + '-' + dd;
            },
            SetDaysNumber: function () {
                this.daysNumber = parseInt($("#daysToContemplate").data("kendoNumericTextBox").value());
            },
            SetStartDay: function () {
                this.startDay = this.currentDay;
            },
            SetEndDay: function () {
                var newdate = new Date();
                newdate.setDate(newdate.getDate() + this.daysNumber);

                var dd = newdate.getDate(),
                    mm = newdate.getMonth() + 1,
                    yyyy = newdate.getFullYear();

                if (dd < 10) { dd = '0' + dd; }
                if (mm < 10) { mm = '0' + mm; }

                this.endDay = yyyy + '-' + mm + '-' + dd;
            },
            SalasCoccion: [],
            SetSalasCoccion: function () {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: "../api/GetSalasCoccion",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.SalasCoccion = data;
                }).fail(function (e) {
                    if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_SALAS_COCCION'), 2000);
                    }
                });
            },
            SetDataSourceArticles: function () {
                var self = this;
                self.SetCurrentDay();
                self.SetDaysNumber();
                self.SetStartDay();
                self.SetEndDay();
                $.ajax({
                    type: "POST",
                    url: "../api/GetArticlesWP/" + String(self.currentDay) + "/" + String(self.startDay) + "/" + String(self.endDay),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsArticles = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsArticles,
                        pageSize: 50
                    });
                    $("#gridWoPlanning").data("kendoGrid").setDataSource(aux);
                    $("#gridWoPlanning").data("kendoGrid").dataSource.read();

                    kendo.ui.progress($("#gridWoPlanning"), false);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_CO'), 2000);
                    kendo.ui.progress($("#gridWoPlanning"), false);
                });
            },
            SetDataSourceParameters: function () {
                var self = this;

                kendo.ui.progress($("#gridMostos"), true);
                $.ajax({
                    type: "POST",
                    url: "../api/GetArticlesParametersForDecantingWP",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsMostosParameters = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsMostosParameters,
                        pageSize: 30
                    });
                    kendo.ui.progress($("#gridMostos"), false);
                    self.pass = true;

                    $("#gridMostos").data("kendoGrid").setDataSource(aux);
                    $("#gridMostos").data("kendoGrid").dataSource.read();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_CO'), 2000);
                    kendo.ui.progress($("#gridMostos"), false);
                });

                kendo.ui.progress($("#gridBeers"), true);
                $.ajax({
                    type: "POST",
                    url: "../api/GetHDBeerParametersForDecantingWP",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsBeerParameters = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsBeerParameters,
                        pageSize: 30
                    });
                    kendo.ui.progress($("#gridBeers"), false);
                    self.pass = true;

                    $("#gridBeers").data("kendoGrid").setDataSource(aux);
                    $("#gridBeers").data("kendoGrid").dataSource.read();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_CO'), 2000);
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

                self.tab.select(0);

            },
            selectTab: function (e, self) {
                var self = this;
                self.pass = true;

                switch ($(e.item).index()) {
                    case 0:
                        if (self.tabPass) {
                            self.SetPlanningWP();
                            self.tabPass = false;
                        } else {
                            self.SetDatas();
                        }
                        break;
                    case 1:
                        if (self.tabPass2) {
                            self.SetParameters();
                            self.SetDataSourceParameters();
                            self.tabPass2 = false;
                        } else {
                            self.SetDataSourceParameters();
                        }
                        break;
                }
            },
            events: {
                'click .aplicar': 'SaveDatas',
                'click #btnAplicar': 'SetDatas',
                'click #btnCrearCoccion': 'CreateWP',
                'change .selector': 'coccion',
                'change .comboBox': 'ChangeCombo',
                'click #btnSelPlanning': function () { this.aplicarSeleccion("gridMostos", "btnSelPlanning"); },
                'click #btnSelMostos': function () { this.aplicarSeleccion("gridBeers", "btnSelMostos"); },
            },
            aplicarSeleccion: function (myGrid, check) {
                var self = this;
                var grid = $("#" + myGrid).data("kendoGrid");

                if ($("#" + check).is(":checked")) {
                    grid.tbody.find(">tr").each(function (index, row) {
                        $(row).find('input:checkbox').prop("checked", true);
                        $(row).addClass('k-state-selected');
                        dataItem = grid.dataItem(row);

                        if (myGrid == "gridBeers") { self.SelGridBeers.push(dataItem); }
                        if (myGrid == "gridMostos") { self.SelGridMostos.push(dataItem); }
                    });
                } else {
                    grid.tbody.find(">tr").each(function (index, row) {
                        $(row).find('input:checkbox').prop("checked", false);
                        $(row).removeClass('k-state-selected');

                        if (myGrid == "gridMostos") {
                            var datafound = _.findWhere(self.SelGridMostos, dataItem);
                            index = _.indexOf(self.SelGridMostos, datafound);
                            if (index >= 0) { self.SelGridMostos.splice(index, 1); }
                        }

                        if (myGrid == "gridBeers") {
                            var datafound = _.findWhere(self.SelGridBeers, dataItem);
                            index = _.indexOf(self.SelGridBeers, datafound);
                            if (index >= 0) { self.SelGridBeers.splice(index, 1); }
                        }
                    });

                }
            },
            SelectRow: function (e, self) {
                var index;
                if (e.sender.element.find(".k-master-row").length != 0) {
                    for (index = 0; index < e.sender.element.find(".k-master-row").length ; index++) {
                        if (parseFloat(e.sender.element.find(".k-master-row")[index].lastChild.innerText) > 0) {
                            $(e.sender.element.find(".k-master-row")[index].lastChild).addClass("redRow");
                        }
                    }
                }
            },
            CreateWP: function (e) {
                var self = this;
                var row = $(e.target).closest("tr");
                var myGrid = $("#gridHDBeerPlanning").data("kendoGrid");
                dataItem = myGrid.dataItem(row);
                //asignamos parámetros de configuración
                var wo = {};
                wo.anyo = new Date().getFullYear().toString();
                wo.material = dataItem.DefID.toString();
                wo.cantidadCocciones = row.find("input[id*='fieldNumCocciones']")[0].value.toString();
                wo.salaCoccionPath = row.find("input[id*='fieldSalaCoccion']")[0].value.toString();
                wo.sourceEquipPK = "-1";
                wo.destinationEquipPK = "-1";
                wo.type = "WP";

                if (parseInt(dataItem.TotalNecesario) > 0) {
                    if (wo.salaCoccionPath != "") {
                        if ((parseInt(wo.cantidadCocciones) > parseInt(dataItem.TotalNecesarioCocciones)) || (parseInt(dataItem.TotalNecesarioCocciones) <= 0)) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_AVISO_NUM_COCCIONES'), 2000);
                        }
                        else {
                            $.ajax({
                                type: "POST",
                                url: "../api/CreateWoWP",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                async: true,
                                data: JSON.stringify(wo),
                                success: function (res) {
                                    if (res) {
                                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_CREADA'), 4000);
                                        self.SetDatas();
                                    }
                                    else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_ERROR'), 4000);
                                    }
                                },
                                error: function (response) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_ERROR'), 2000);
                                }
                            });
                        }
                    }
                    else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_ERROR_SALA'), 2000);
                    }
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_NO_NECESIDAD'), 2000);
                }
            },
            SetDatas: function () {
                var self = this;

                var days = parseInt($("#daysToContemplate").data("kendoNumericTextBox").value());
                var currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + parseInt(days));

                $.ajax({
                    type: "POST",
                    url: "../api/GetPackingArticlesDatasForDecantingPlanningWP",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(currentDate),
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.dsWoArticles = data;
                    var aux = new kendo.data.DataSource({
                        data: self.dsWoArticles,
                        pageSize: 30
                    });
                    self.pass = true;
                    $("#gridWoPlanning").data("kendoGrid").setDataSource(aux);
                    $("#gridWoPlanning").data("kendoGrid").dataSource.read();
                    kendo.ui.progress($("#gridWoPlanning"), false);

                    $.ajax({
                        type: "POST",
                        url: "../api/GetHDBeerDatasForDecantingPlanningWP",
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true
                    }).done(function (data) {
                        self.dsHDBeerDatas = data;
                        var aux = new kendo.data.DataSource({
                            data: self.dsHDBeerDatas,
                            pageSize: 30
                        });
                        self.pass = true;
                        $("#gridHDBeerPlanning").data("kendoGrid").setDataSource(aux);
                        $("#gridHDBeerPlanning").data("kendoGrid").dataSource.read();

                        $.map($("input[id*='SalaCoccion']"), function (value, index) { return [value] }).forEach(function (item) {
                            self.CreateCombo(encodeURI(item.id), "localias", "locpath", self.SalasCoccion);
                        });

                        $.map($("input[id*='NumCocciones']"), function (value, index) { return [value] }).forEach(function (item) {
                            self.CreateInputSalaCoccion(encodeURI(item.id), "");
                        });
                        kendo.ui.progress($("#gridHDBeerPlanning"), false);
                    }).fail(function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                        kendo.ui.progress($("#gridHDBeerPlanning"), false);
                    });

                }).fail(function (e) {
                    if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    }
                    kendo.ui.progress($("#gridWoPlanning"), false);
                });

            },
            SaveDatas: function (e) {
                kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), true);
                var self = this,
                    value = [],
                    object = {};

                if ($($(e.currentTarget).closest(".k-grid")).attr("id") == "gridMostos") {
                    if (self.SelGridMostos.length == 0) {
                        Not.crearNotificacion('warning', 'Aviso', window.app.idioma.t("NO_BEER_SELECTED"), 2000);
                        kendo.ui.progress($("#" + $($(e.currentTarget).closest(".k-grid")).attr("id")), false);
                        return false;
                    }
                }

                if ($($(e.currentTarget).closest(".k-grid")).attr("id") == "gridBeers") {
                    if (self.SelGridBeers.length == 0) {
                        Not.crearNotificacion('warning', 'Aviso', window.app.idioma.t("NO_HDBEER_SELECTED"), 2000);
                        kendo.ui.progress($("#" + $($(e.currentTarget).closest(".k-grid")).attr("id")), false);
                        return false;
                    }
                }

                $.grep($($(e.currentTarget).closest(".k-grid")).find("input[id*='field']"), function (item) { return (item.value != "" ? item.value : "0") }).forEach(function (item) {
                    if ($($(e.currentTarget).closest(".k-grid")).attr("id").indexOf("Mostos") != -1) {
                        if (item.id.indexOf("DecreasePacking") != -1)
                            object.MermaEnvasado = item.value;
                        else
                            if (item.id.indexOf("DecreaseFiltration") != -1)
                                object.MermaFiltracion = item.value;
                            else
                                if (item.id.indexOf("BeerInFiltration") != -1)
                                    object.FiltracionRecuperado = item.value;
                                else
                                    if (item.id.indexOf("Dilution") != -1)
                                        object.Dilucion = item.value;
                    } else {
                        if (item.id.indexOf("DecreaseFermentation") != -1)
                            object.MermaFermentacion = item.value;
                        else
                            if (item.id.indexOf("HlPorCoccion") != -1)
                                object.HlPorCoccion = item.value;
                    }
                });

                var aux = null,
                    article = null,
                    accion = "";

                if ($($(e.currentTarget).closest(".k-grid")).attr("ID").indexOf("Mostos") != -1) {
                    self.SelGridMostos.forEach(function (item) {
                        value.push({ mosto: item.Cerveza, defid: item.DefID, parameters: object });
                    });
                }
                else {
                    self.SelGridBeers.forEach(function (item) {
                        value.push({ mosto: item.TipoCerveza, parameters: object });
                    });
                }

                if ($($(e.currentTarget).closest(".k-grid")).attr("ID").indexOf("Mostos") != -1) { accion = "../api/SetMostosParametersWP"; }
                else { accion = "../api/SetBeersParametersWP"; }

                $.ajax({
                    type: "POST",
                    url: accion,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(value),
                    cache: false,
                    async: true
                }).done(function (data) {
                    Not.crearNotificacion('success', 'Aviso', window.app.idioma.t("UPDATED_VALUES"), 4000);
                    kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), false);
                    self.SelGridMostos = [];
                    self.SelGridBeers = [];
                    self.SetDataSourceParameters();
                    self.ResetParam1();
                    self.ResetParam2();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', 'Error', xhr.message, 4000);
                    kendo.ui.progress($($(e.currentTarget).closest(".k-grid")), false);
                });
            },
            ResetParam1: function () {  //reset parámetro de configuración de cervezas
                $("#fieldDecreasePacking").data("kendoNumericTextBox").value("");
                $("#fieldDecreaseFiltration").data("kendoNumericTextBox").value("");
                $("#fieldRecoveredBeerInFiltration").data("kendoNumericTextBox").value("");
                $("#fieldDilution").data("kendoNumericTextBox").value("");
                $("#btnSelPlanning").prop("checked", false);
            },
            ResetParam2: function () {  //reset parámetro de configuración de mostos
                $("#fieldDecreaseFermentation").data("kendoNumericTextBox").value("");
                $("#fieldHlPorCoccion").data("kendoNumericTextBox").value("");
                $("#btnSelMostos").prop("checked", false);
            },
            SetPlanningWP: function () {
                var self = this,
                    tools = [];

                self.SetSalasCoccion(); //obtenemos las salas de cocción de planta

                var planningitems = [
                        {
                            field: "Articulo",
                            title: window.app.idioma.t("PRODUCTO"),
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("COCCION_TOTAL_ENVASAR"),
                            format: "{0:n2}",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "StockInTCP",
                            title: window.app.idioma.t("COCCION_EXISTENCIAS_TCP"),
                            format: "{0:n2}",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "TotalNecesidadTCP",
                            title: window.app.idioma.t("COCCION_NECESIDAD_TCP"),
                            format: "{0:n2}",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "TotalCervezaFiltrar",
                            title: window.app.idioma.t("COCCION_TOTAL_TO_FILTER"),
                            format: "{0:n2}",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "TotalCervezaEnBodega",
                            title: window.app.idioma.t("COCCION_CERVEZA_BODEGA"),
                            format: "{0:n2}",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        },
                        {
                            field: "HDBeer",
                            title: window.app.idioma.t("COCCION_TIPO_MOSTO")
                        }
                ];

                tools = [
                    { template: '<center><label>' + window.app.idioma.t('PREVISION_CERVEZA') + '&nbsp;&nbsp; </label></center>' },

                    { template: '&nbsp;&nbsp;<label>' + window.app.idioma.t('DIAS_CONTEMPLAR') + ':&nbsp;&nbsp;</label>&nbsp;&nbsp;<input id="daysToContemplate" style="width: 80px;"/>' },

                    { template: "<button id='btnAplicar' class='k-button' style='background-color: green; color: white; float:right; margin-right: 18px;'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>" }
                ];

                self.CreateGrid("gridWoPlanning", planningitems, self.dsWoArticles, tools);
                self.CreateNumericField("daysToContemplate", self.initialDays);

                kendo.ui.progress($("#gridWoPlanning"), true);
                self.cont = 0;

                var planningitems2 = [
                        {
                            field: "ID",
                            hidden: true
                        },
                       {
                           field: "HDBeer",
                           title: window.app.idioma.t("COCCION_TIPO_MOSTO"),
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalMostoPlanificado",
                           title: window.app.idioma.t("COCCION_MOSTO_PLANIFICADO"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalMostoEnProceso",
                           title: window.app.idioma.t("COCCION_MOSTO_PROCESO"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "StockEnFermentacion",
                           title: window.app.idioma.t("COCCION_EXISTENCIAS_FERMENTACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalFermentacion",
                           title: window.app.idioma.t("COCCION_TOTAL_FERMENTACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "StockEnBodega",
                           title: window.app.idioma.t("COCCION_STOCK_BODEGA"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalBodega",
                           title: window.app.idioma.t("COCCION_TOTAL_BODEGA"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalNecesario",
                           title: window.app.idioma.t("COCCION_TOTAL_NECESARIO"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalNecesarioFabricacion",
                           title: window.app.idioma.t("COCCION_TOTAL_NECESARIO_FABRICACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "TotalNecesarioCocciones",
                           title: window.app.idioma.t("COCCION_NUM_COCCIONES"),
                           format: "{0}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "FieldInput",
                           template: "<input id='fieldSalaCoccion#=ID#' class='comboBox' style='width:100 !important;'>&nbsp;" +
                                      "<input type='number' id='fieldNumCocciones#=ID#' class='txtField' style='width:100 !important;'>&nbsp;" +
                                      "<button id='btnCrearCoccion' class='k-button' style='background-color: green; color: white; width: auto !important;'><span class='k-icon k-add'></span>" + window.app.idioma.t('COCCION_CREAR_COCCION') + "</button>",
                           title: window.app.idioma.t("COCCION_CREACION_COCCION"),
                           culture: localStorage.getItem("idiomaSeleccionado"),
                           width: 475
                       }
                ];

                tools = [
                    { template: '<center><label>' + window.app.idioma.t('PREVISION_MOSTO') + '&nbsp;&nbsp; </label></center>' }
                ];

                self.CreateGrid("gridHDBeerPlanning", planningitems2, self.dsHDBeerDatas, tools)
                kendo.ui.progress($("#gridHDBeerPlanning"), true);
                /* $.when(d).done(function() {});*/
                self.SetDatas();
            },
            CreateNumericField: function (field, value) {
                $("#" + field).kendoNumericTextBox({
                    placeholder: window.app.idioma.t("INTRODUZCA_UN_VALOR"),
                    format: "n0",
                    decimals: 0,
                    restrictDecimals: true
                });

                $("#" + field).data("kendoNumericTextBox").value(value);
            },
            CreateInputSalaCoccion: function (field, value) {
                $("#" + field).kendoNumericTextBox({
                    placeholder: window.app.idioma.t("INTRODUZCA_NUM_COCCIONES"),
                    format: "n0",
                    decimals: 0,
                    min: 1,
                    max: 10,
                    restrictDecimals: true
                });

                $("#" + field).data("kendoNumericTextBox").value(value);
            },
            SetParameters: function () {
                var self = this;

                var mostoItems = [
                       {
                           headerTemplate: '<input id="btnSelPlanning" type="checkbox" style="width: 14px; height: 14px;" />',
                           template: '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px;" />',
                           width: 25
                       },
                       {
                           field: "ID",
                           title: window.app.idioma.t("ID_MATERIAL"),
                           hidden: true
                       },
                       {
                           field: "Cerveza",
                           title: window.app.idioma.t("PRODUCTO")
                       },
                       {
                           field: "MermaEnvasado",
                           title: window.app.idioma.t("COCCION_MERMA_ENVASADO"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "MermaFiltracion",
                           title: window.app.idioma.t("COCCION_MERMA_FILTRACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "FiltracionRecuperado",
                           title: window.app.idioma.t("COCCION_RECUPERADO_FILTRACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "Dilucion",
                           title: window.app.idioma.t("COCCION_DILUCION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "CervezaHD",
                           title: window.app.idioma.t("COCCION_TIPO_MOSTO")
                       }
                ];

                tool = [
                        { template: '<center><label>' + window.app.idioma.t('PARAM_CONFIG') + '&nbsp;&nbsp; </label></center>' },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_MERMA_ENVASADO') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDecreasePacking' class='txtField'>" },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_MERMA_FILTRACION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDecreaseFiltration' class='txtField'>" },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_RECUPERADO_FILTRACION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldRecoveredBeerInFiltration' class='txtField'>" },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_DILUCION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDilution' class='txtField'>" },

                        { template: "&nbsp;&nbsp;<button type='button' class='k-button k-button-icontex aplicar' style='background-color: green; color: white; float: right; margin-right: 18px;'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>" }
                ];

                self.CreateGrid("gridMostos", mostoItems, self.dsMostosParameters, tool);

                var beerItems = [
                       {
                           headerTemplate: '<input id="btnSelMostos" type="checkbox" style="width: 14px; height: 14px;" />',
                           template: '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px;" />',
                           width: 25
                       },
                       {
                           field: "DefID",
                           hidden: true
                       },
                       {
                           field: "TipoCerveza",
                           title: window.app.idioma.t("COCCION_TIPO_MOSTO")
                       },
                       {
                           field: "MermaFermentacion",
                           title: window.app.idioma.t("COCCION_MERMA_FERMENTACION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       },
                       {
                           field: "HlPorCoccion",
                           title: window.app.idioma.t("COCCION_HL_POR_COCCION"),
                           format: "{0:n2}",
                           culture: localStorage.getItem("idiomaSeleccionado")
                       }];

                toolBar = [
                        { template: '<center><label>' + window.app.idioma.t('PARAM_CONFIG_MOSTO') + '&nbsp;&nbsp; </label></center>' },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_MERMA_FERMENTACION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldDecreaseFermentation' class='txtField'>" },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;<label>" + window.app.idioma.t('COCCION_NUEVA_COCCION_HL_POR_COCCION') + "</label>&nbsp;&nbsp;<input type='number' id='fieldHlPorCoccion' class='txtField'>" },

                        { template: "&nbsp;&nbsp;<button type='button' class='k-button k-button-icontex aplicar' style='background-color: green; color: white; float: right; margin-right: 18px;'><span class='k-icon k-i-pencil'></span>" + window.app.idioma.t('APLICAR') + "</button>" }

                ];
                self.CreateGrid("gridBeers", beerItems, self.dsBeerParameters, toolBar);

                $.map($("input[id*='field']"), function (value, index) { return [value] }).forEach(function (item) {
                    self.CreateTextField(item.id);
                    $("#" + item.id).data("kendoNumericTextBox").value(null);
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
            CreateCombo: function (id, text, value, ds) {   //exclusivo salas de cocción
                $("#" + id).kendoDropDownList({
                    dataTextField: text,
                    dataValueField: value,
                    dataSource: ds,
                    optionLabel: window.app.idioma.t("SELECCIONAR_SALA_COCCION")
                });
            },
            ChangeCombo: function (e) {
                var self = this,
                    HDBeer = $(e.currentTarget).closest("tr")[0].childNodes[1].innerHTML,
                    location = e.currentTarget.value;
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
                    Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_CO'), 2000);
                });
            },
            CreateGrid: function (grid, items, ds, tool) {  //función genérica para crear los kendogrid de la pantalla de cocciones
                var self = this;
                var gridName = grid;
                //var def = $.Deferred();
                $("#" + grid).kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        data: ds,
                        pageSize: 30
                    }),
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    //selectable: "multiple, row",  //utilizamos checkbox
                    height: "auto",
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [30, 50, 100],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: tool,
                    columns: items,
                    dataBound: function (e) {
                        self.resizeGrid(e, self);

                        if (gridName == "gridHDBeerPlanning") {
                            var rows = e.sender.content.find('tr');
                            var numeroCocciones = e.sender.wrapper.find(".k-grid-header [data-field='TotalNecesarioCocciones']").index();
                            var fieldInput = e.sender.wrapper.find(".k-grid-header [data-field='FieldInput']").index();
                            rows.each(function (index, row) {
                                var dataItem = e.sender.dataItem(row);
                                if (!dataItem.name) {
                                    if ((parseInt(dataItem.TotalNecesarioCocciones) > 0) && (parseInt(dataItem.TotalNecesarioFabricacion) > 0)) {
                                        $(row).children('td:eq(' + numeroCocciones + ')').addClass('redCell');
                                    }
                                    $(row).children('td:eq(' + fieldInput + ')').addClass('multiCell')
                                }
                            })
                        }

                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            var myGrid = $("#" + gridName).data("kendoGrid");
                            dataItem = myGrid.dataItem(row);
                            if (checked) {
                                row.addClass("k-state-selected");
                                switch (gridName) {
                                    case "gridBeers":
                                        self.SelGridBeers.push(dataItem);
                                        if (self.SelGridBeers.length == 1) {
                                            $("#fieldDecreaseFermentation").data("kendoNumericTextBox").value(dataItem.MermaFermentacion);
                                            $("#fieldHlPorCoccion").data("kendoNumericTextBox").value(dataItem.HlPorCoccion);
                                        }
                                        else {
                                            self.ResetParam2();
                                        }
                                        break;
                                    case "gridMostos":
                                        self.SelGridMostos.push(dataItem);
                                        if (self.SelGridMostos.length == 1) {
                                            $("#fieldDecreasePacking").data("kendoNumericTextBox").value(dataItem.MermaEnvasado);
                                            $("#fieldDecreaseFiltration").data("kendoNumericTextBox").value(dataItem.MermaFiltracion);
                                            $("#fieldRecoveredBeerInFiltration").data("kendoNumericTextBox").value(dataItem.FiltracionRecuperado);
                                            $("#fieldDilution").data("kendoNumericTextBox").value(dataItem.Dilucion);
                                        }
                                        else {
                                            self.ResetParam1();
                                        }
                                        break;
                                }
                            }
                            else {
                                row.removeClass("k-state-selected");
                                switch (gridName) {
                                    case "gridBeers":
                                        var datafound = _.findWhere(self.SelGridBeers, dataItem);
                                        index = _.indexOf(self.SelGridBeers, datafound);
                                        if (index >= 0) { self.SelGridBeers.splice(index, 1); }
                                        if (self.SelGridBeers.length == 1) {
                                            $("#fieldDecreaseFermentation").data("kendoNumericTextBox").value(dataItem.MermaFermentacion);
                                            $("#fieldHlPorCoccion").data("kendoNumericTextBox").value(dataItem.HlPorCoccion);
                                        }
                                        else {
                                            self.ResetParam2();
                                        }
                                        break;
                                    case "gridMostos":
                                        var datafound = _.findWhere(self.SelGridMostos, dataItem);
                                        index = _.indexOf(self.SelGridMostos, datafound);
                                        if (index >= 0) { self.SelGridMostos.splice(index, 1); }
                                        if (self.SelGridMostos.length == 1) {
                                            $("#fieldDecreasePacking").data("kendoNumericTextBox").value(dataItem.MermaEnvasado);
                                            $("#fieldDecreaseFiltration").data("kendoNumericTextBox").value(dataItem.MermaFiltracion);
                                            $("#fieldRecoveredBeerInFiltration").data("kendoNumericTextBox").value(dataItem.FiltracionRecuperado);
                                            $("#fieldDilution").data("kendoNumericTextBox").value(dataItem.Dilucion);
                                        }
                                        else {
                                            self.ResetParam1();
                                        }
                                        break;
                                }
                            }
                        });
                        // def.resolve();
                    }
                });

                $("#" + grid).kendoTooltip({ filter: "th" });   //tooltip de los títulos de las columnas
                //return def;
            },
            actualiza: function (tipo) {
                var self = this;
                self.SetParameters();
            },
            resizeGrid: function (e, self) {
                if (self.pass) {
                    self.pass = false;
                    var contenedorHeight = $("#center-pane").innerHeight();
                    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                    var utilSpace = contenedorHeight - cabeceraHeight;

                    if (e.sender._cellId.indexOf("gridWoPlanning") != -1 || e.sender._cellId.indexOf("gridHDBeerPlanning") != -1) {

                        var gridElement = $("#gridWoPlanning"),
                            dataArea = gridElement.find(".k-grid-content"),
                            gridHeight = gridElement.innerHeight(),
                            otherElements = gridElement.children().not(".k-grid-content"),
                            otherElementsHeight = 0;

                        otherElements.each(function () {
                            otherElementsHeight += $(this).outerHeight();
                        });

                        dataArea.height((utilSpace / 2) - (75*2));

                        var gridElement2 = $("#gridHDBeerPlanning"),
                               dataArea2 = gridElement2.find(".k-grid-content"),
                               gridHeight2 = gridElement2.innerHeight();
                        otherElements2 = gridElement2.children().not(".k-grid-content"),
                        otherElementsHeight2 = 0;

                        otherElements2.each(function () {
                            otherElementsHeight2 += $(this).outerHeight();
                        });

                        dataArea2.height((utilSpace / 2) - $("#bottom-pane").height() - 75);

                    }
                    else {
                        if (e.sender._cellId.indexOf("gridMostos") != -1 || e.sender._cellId.indexOf("gridBeers") != -1) {
                            var gridElement = $("#gridMostos"),
                                dataArea = gridElement.find(".k-grid-content"),
                                gridHeight = gridElement.innerHeight(),
                                otherElements = gridElement.children().not(".k-grid-content"),
                                otherElementsHeight = 0;

                            otherElements.each(function () {
                                otherElementsHeight += $(this).outerHeight();
                            });

                            dataArea.height((utilSpace / 2)  - otherElementsHeight);

                            var gridElement2 = $("#gridBeers"),
                                            dataArea2 = gridElement2.find(".k-grid-content"),
                                            gridHeight2 = gridElement2.innerHeight();
                            otherElements2 = gridElement2.children().not(".k-grid-content"),
                            otherElementsHeight2 = 0;

                            otherElements2.each(function () {
                                otherElementsHeight2 += $(this).outerHeight();
                            });

                            dataArea2.height((utilSpace / 2) - otherElementsHeight2 - $("#bottom-pane").height());
                        }
                    }
                }
            }
        });
        return vistaPlanificacionCoccion;
    });