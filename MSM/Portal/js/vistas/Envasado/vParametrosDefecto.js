define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ParametrosDefecto.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaParametrosDefecto, VistaDlgConfirm, Not) {
        var gridParametrosDefecto = Backbone.View.extend({
            tagName: 'div',
            id: 'divParametrosDefecto',
            ds: null,
            grid: null,
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            ventanaEditar: null,
            template: _.template(PlantillaParametrosDefecto),
            initialize: function () {
                var self = this;
                self.registrosSelData = [];
                self.registrosDesSelData = [];
                self.selTodos = false;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerParametrosDefecto/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdObj",
                            fields: {
                                'IdObj': { type: "number" },
                                'NumeroLinea': { type: "string" },
                                'DescripcionLinea': { type: "string" },
                                'NumeroLineaDescripcion': { type: "string" },
                                'FormatoComun': { type: "string" },
                                'VelocidadNominal': { type: "number" },
                                'VelocidadNominalMaqLimitante': { type: "number" },
                                'OEEObjetivo': { type: "number" },
                                'OEECritico': { type: "number" },
                                'OEEPreactor': { type: "number" }
                            }
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridParametrosDefecto"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridParametrosDefecto"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                });

                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                $("#txtParamDefVelNom").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtParamDefVelNomMaqLimitante").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtParamDefOeeObj").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#txtParamDefOeeCri").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#txtParamDefOeePreactor").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                var permiso = TienePermiso(197);

                $("#txtParamDefVelNom").data("kendoNumericTextBox").enable(permiso);

                //Cargamos el grid
                self.grid = this.$("#gridParametrosDefecto").kendoGrid({
                    dataSource: self.ds,
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnSelTodos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnDesSelTodos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<span style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSel'></span>"
                        },
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                    ],
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 25
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "35px"
                        },
                        {
                            field: "NumeroLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: window.app.idioma.t("LINEA") + ' #:NumeroLineaDescripcion# - #:DescripcionLinea#', width: 140,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NumeroLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion# - #= DescripcionLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=FormatoComun#' style='width: 14px;height:14px;margin-right:5px;'/>#=FormatoComun#</label></div>";
                                }
                            }
                        },
                        {
                            field: "VelocidadNominal", title: window.app.idioma.t("VELOCIDAD_NOMINAL"), width: 90, filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "VelocidadNominalMaqLimitante", title: window.app.idioma.t("VEL_NOM_MAQ_LIMITANTE"), width: 110, filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        { field: "OEEObjetivo", title: window.app.idioma.t("OEE_OBJETIVO"), width: 90, template: '#if(OEEObjetivo % 1 != 0){# #:OEEObjetivo.toFixed(2) # #}else{ # #:OEEObjetivo # # }#' },
                        { field: "OEECritico", title: window.app.idioma.t("OEE_CRITICO"), width: 90, template: '#if(OEECritico % 1 != 0){# #:OEECritico.toFixed(2) # #}else{ # #:OEECritico # # }#' },
                        { field: "OEEPreactor", title: window.app.idioma.t("OEE_SECUENCIADOR"), width: 90, template: '#if(OEEPreactor % 1 != 0){# #:OEEPreactor.toFixed(2) # #}else{ # #:OEEPreactor # # }#' }
                    ],
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridParametrosDefecto").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            var datos = {};
                            datos.id = dataItem.id;
                            datos.numeroLinea = dataItem.NumeroLinea;
                            datos.formatoComun = dataItem.FormatoComun;

                            if (checked) {
                                row.addClass("k-state-selected");
                                var datafound = _.findWhere(self.registrosDesSelData, datos);
                                index = _.indexOf(self.registrosDesSelData, datafound);

                                if (index >= 0) {
                                    self.registrosDesSelData.splice(index, 1);
                                }

                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(++numReg);
                                self.registrosSelData.push(datos);
                            } else {
                                row.removeClass("k-state-selected");
                                self.registrosDesSelData.push(datos);
                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(--numReg);
                                var datafound = _.findWhere(self.registrosSelData, datos);
                                index = _.indexOf(self.registrosSelData, datafound);

                                if (index >= 0) {
                                    self.registrosSelData.splice(index, 1);
                                }
                            }
                        });

                        var grid = $('#gridParametrosDefecto').data('kendoGrid');

                        if (self.selTodos) {
                            grid.tbody.find('.checkbox').prop("checked", true);
                            grid.tbody.find(">tr").addClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosDesSelData.some(function (data) {
                                    return data.id == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = false;
                                $(row).closest("tr").removeClass("k-state-selected");
                            });
                        } else {
                            grid.tbody.find('.checkbox').prop("checked", false);
                            grid.tbody.find(">tr").removeClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosSelData.some(function (data) {
                                    return data.id == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                                $(row).closest("tr").addClass("k-state-selected");
                            });
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                var _grid = $("#gridParametrosDefecto").data("kendoGrid");
                $("#gridParametrosDefecto").data("kendoGrid").dataSource.bind("change", function (e) {
                    if (_grid.dataSource.filter() != null && typeof (_grid.dataSource.filter()) != "undefined") {
                        //Comprobamos si el cambio en el datasource se debe a un cambio del filtro y en tal caso eliminamos los checkbox
                        if (_grid.dataSource.filter().filters != self.filtroActual) {
                            self.filtroActual = _grid.dataSource.filter().filters; //hay que actualizar la variable antes de llamar a aplicarSeleccion para que no entre en un bucle infinito
                        }
                        self.filtroActual = _grid.dataSource.filter().filters;
                    }
                });

                window.app.headerGridTooltip(self.grid);
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            editarParametroDefecto: function (e) {
                var self = this;
                var permiso = TienePermiso(195);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                {
                    title: window.app.idioma.t('PARAMETROS_POR_DEFECTO_LARGO'),
                    width: "440px",
                    height: "375px",
                    content: "Envasado/html/EditarParametrosDefecto.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditar.destroy();
                        self.ventanaEditar = null;
                    },
                    refresh: function () {
                        self.cargaContenido(e);
                    }
                });

                self.ventanaEditar = $('#window').data("kendoWindow");
                self.ventanaEditar.center();
                self.ventanaEditar.open();
            },
            cargaContenido: function (e) {
                var self = this;

                $("#lblDefLinea").text(window.app.idioma.t('LINEA') + ': ');
                $("#lblDefFormatoComun").text(window.app.idioma.t('FORMATO_COMUN') + ': ');
                $("#lblDefVelNom").text(window.app.idioma.t('VELOCIDAD_NOMINAL'));
                $("#lblDefVelNomMaqLimitante").text(window.app.idioma.t('VEL_NOM_MAQ_LIMITANTE'));
                $("#lblDefOeeObj").text(window.app.idioma.t('OEE_OBJETIVO') + ' %');
                $("#lblDefOeeCri").text(window.app.idioma.t('OEE_CRITICO') + ' %');
                $("#lblDefOeePreactor").text(window.app.idioma.t('OEE_SECUENCIADOR') + ' %');
                $("#btnAceptarPD").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarPD").text(window.app.idioma.t('CANCELAR'));

                $("#ntxtDefVelNom").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0'
                });

                $("#ntxtDefVelNomMaqLimitante").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0'
                });

                $("#ntxtDefOeeObj").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtDefOeeCri").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtDefOeePreactor").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#btnAceptarPD").kendoButton({
                    click: function () { self.confirmarEdicion(); }
                });

                $("#btnCancelarPD").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                $("#lblIdObj").text(data.id);
                $("#lblDefValorLinea").text(data.NumeroLinea + ' - ' + data.DescripcionLinea);
                $("#lblDefValorFormatoComun").text(data.FormatoComun);
                $("#ntxtDefVelNom").data("kendoNumericTextBox").value(data.VelocidadNominal);
                $("#ntxtDefVelNomMaqLimitante").data("kendoNumericTextBox").value(data.VelocidadNominalMaqLimitante);
                $("#ntxtDefOeeObj").data("kendoNumericTextBox").value(data.OEEObjetivo);
                $("#ntxtDefOeeCri").data("kendoNumericTextBox").value(data.OEECritico);
                $("#ntxtDefOeePreactor").data("kendoNumericTextBox").value(data.OEEPreactor);

                var permiso = TienePermiso(197);

                $("#ntxtDefVelNom").data("kendoNumericTextBox").enable(permiso);
            },
            events: {
                'click #btnEditar': 'editarParametroDefecto',
                'click #btnAsignarParamDef': 'confirmAsignarParametros',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnSelTodos': function () { this.aplicarSeleccion(true); },
                'click #btnDesSelTodos': function () { this.aplicarSeleccion(false); }
            },
            aplicarSeleccion: function (checked) {
                var self = this;

                self.selTodos = checked;

                var grid = $('#gridParametrosDefecto').data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = $("#gridParametrosDefecto").data("kendoGrid").dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    self.$("#lblRegSel").text(dataFiltered.length);
                } else {
                    grid.tbody.find('.checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");
                }
            },
            confirmAsignarParametros: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(195);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridParametrosDefecto').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.ds.data().length)) {

                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('PARAMETROS_POR_DEFECTO_LARGO'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_DEFECTO'),
                        funcion: function () { self.AsignarParametros(e.currentTarget.id); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            AsignarParametros: function () {
                var self = this;
                var datos = {};
                datos.velNom = $('#txtParamDefVelNom').val();
                datos.velNomMaqLimitante = $('#txtParamDefVelNomMaqLimitante').val();
                datos.oeeObj = $('#txtParamDefOeeObj').val();
                datos.oeeCri = $('#txtParamDefOeeCri').val();
                datos.oeePre = $('#txtParamDefOeePreactor').val();

                var cambios = [];
                var dataSource = $("#gridParametrosDefecto").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.NumeroLinea;
                        datos.formatoComun = data.FormatoComun;
                        datos.id = data.id;

                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return {
                                id: datos.id,
                                lineaFormato: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' +
                                    window.app.idioma.t('FORMATO_COMUN') + ' ' + datos.formatoComun
                            };
                        }
                    });
                } else {
                    var cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.NumeroLinea;
                        datos.formatoComun = data.FormatoComun;
                        datos.id = data.id;

                        if (_.findWhere(self.registrosSelData, datos)) {
                            return {
                                id: datos.id,
                                lineaFormato: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' +
                                    window.app.idioma.t('FORMATO_COMUN') + ' ' + datos.formatoComun
                            };
                        }
                    });
                }

                datos.cambios = cambios;
                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                $.ajax({
                    type: "POST",
                    url: "../api/asignarParametrosDefecto/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.ds.read();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_ASIGNADO_PARAM_DEFECTO'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_PARAM_DEFECTO'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_PARAM_DEFECTO'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            CancelarFormulario: function () {
                this.ventanaEditar.close();
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
            confirmarEdicion: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('PARAMETROS_POR_DEFECTO_LARGO'),
                    msg: window.app.idioma.t('CONFIRMACION_EDITAR_PARAMETROS_LINEA'),
                    funcion: function () { self.editarParametros(); },
                    contexto: this
                });
            },
            editarParametros: function () {
                var self = this;

                var pl = {};
                pl.id = $("#lblIdObj").text();
                pl.velocidadNominal = $("#ntxtDefVelNom").data("kendoNumericTextBox").value();
                pl.velNomMaqLimitante = $("#ntxtDefVelNomMaqLimitante").data("kendoNumericTextBox").value();
                pl.OEE_objetivo = $("#ntxtDefOeeObj").data("kendoNumericTextBox").value();
                pl.OEE_critico = $("#ntxtDefOeeCri").data("kendoNumericTextBox").value();
                pl.OEE_preactor = $("#ntxtDefOeePreactor").data("kendoNumericTextBox").value();
                pl.linea = $("#lblDefValorLinea").text();
                pl.formatoComun = $("#lblDefValorFormatoComun").text();
                
                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: false,
                    url: "../api/editarParametrosDefecto",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.ds.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO_PARAM_DEFECTO'), 4000);
                            self.ventanaEditar.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_PARAM_DEFECTO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_PARAM_DEFECTO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridParametrosDefecto"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return gridParametrosDefecto;
    });