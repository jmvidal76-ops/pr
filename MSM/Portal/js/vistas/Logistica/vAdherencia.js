define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/Adherencia.html', 'jszip', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'compartido/util'],
    function (_, Backbone, $, plantillaAdherencia, JSZip, Not, VistaDlgConfirm, util) {
        function T(name) {
            return window.app.idioma.t(name);
        }

        var vistaAdherencia = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsMotivosFiltro: [],
            dsDesviacionVolumen: [],
            aniosInicio: [],
            aniosFin: [],
            confirmacion: null,
            esAdherente: 1,
            dsParametros: [],
            listaParametros: [],
            ventanaEditar: null,
            template: _.template(plantillaAdherencia),
            filtrosComponentMMPP: { hiddenToolBar: true, hiddenColumns: false },
            initialize: function () {
                var self = this;
                Backbone.on('eventActAdherenciaMotivos', self.actualizarMotivosYDatos, self);
                window.JSZip = JSZip;

                self.actualizarMotivosYDatos(true);

                self.aniosInicio = [];
                self.aniosFin = [];
                var anioActual = (new Date()).getFullYear();
                var anioInicial = anioActual - 2;

                for (var i = anioInicial; i <= anioActual; i++) {
                    self.aniosInicio.push({ id: i, nombre: i.toString() });
                }

                for (var i = anioInicial; i <= (anioActual + 1); i++) {
                    self.aniosFin.push({ id: i, nombre: i.toString() });
                }

                self.render();
            },
            actualizarMotivosYDatos: function (soloMotivos = false) {
                var self = this;

                $.ajax({
                    url: "../api/GetMotivosAdherencia",
                    dataType: "json",
                    async: false
                }).done(function (listaMotivos) {
                    motivos = listaMotivos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_MOTIVOS_ADHERENCIA'), 4000);
                    }
                });

                var datosFiltro = [{ IdMotivo: 'ZZ', Motivo: window.app.idioma.t('MOTIVO_SIN_JUSTIFICAR'), Origen: 'Inicio' }].concat(motivos);

                self.dsMotivosFiltro = new kendo.data.DataSource({
                    data: datosFiltro,
                    schema: {
                        model: {
                            id: 'IdMotivo',
                            fields: {
                                'Motivo': { type: 'string' }
                            }
                        }
                    },
                });

                if (!soloMotivos) {
                    self.validacionFiltros();
                }
            },
            render: function () {
                var self = this;

                this.$el.html(this.template());
                $('#center-pane').append(this.$el);

                // Tabstrip
                this.tab = util.ui.createTabStrip('#divPestanias');

                // Parámetros
                //util.ui.createVSplitter('#vsplitPanelAdherenciaVol', ['20%', '80%']);
                this.InitParametros();
                this.InitGridParametros();

                this.InitGridDesviacionVolumen();

                $('[data-funcion').checkSecurity();
                util.ui.enableResizeCenterPane();
            },
            events: {
                'click #gridParVolVista0': 'ajustarColumnas',
                'click #gridParVolVista1': 'ajustarColumnas',
                'click #gridParVolVista2': 'ajustarColumnas',
                'click #btnShowAdherencias': function () {
                    var self = this;
                    $('#gridDesvVol').data('kendoGrid').hideColumn(13); //Causa - Motivo
                    $('#gridDesvVol').data('kendoGrid').hideColumn(14); //Comentario
                    self.esAdherente = 1;
                    self.validacionFiltros();
                },
                'click #btnShowInadherencias': function () {
                    var self = this;
                    $('#gridDesvVol').data('kendoGrid').showColumn(13); //Causa - Motivo
                    $('#gridDesvVol').data('kendoGrid').showColumn(14); //Comentario
                    self.esAdherente = 0;
                    self.validacionFiltros();
                },
                'click #btnExcelVol': 'ExportExcelVolumen',
                'click #btnEditarRegistro': 'EditarRegistro',
                'click #btnEliminarRegistro': 'ConfirmarEliminar',
            },
            validacionFiltros: function () {
                var self = this;

                var anioIni = parseInt($("#anioInicio").data('kendoDropDownList').value());
                var semanaIni = $("#semanaInicio").data('kendoDropDownList').value() === "" ? null : parseInt($("#semanaInicio").data('kendoDropDownList').value());
                var anioFin = parseInt($("#anioFin").data('kendoDropDownList').value());
                var semanaFin = $("#semanaFin").data('kendoDropDownList').value() === "" ? null : parseInt($("#semanaFin").data('kendoDropDownList').value());

                if (anioIni > anioFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ANIO'), 4000);
                    return;
                }

                if (semanaIni == null || semanaFin == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UNA'), 4000);
                    return;
                }

                if (anioIni === anioFin && semanaIni > semanaFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_SEMANA'), 4000);
                    return;
                }

                $('#gridDesvVol').data('kendoGrid').dataSource.read();
                self.dsDesviacionVolumen.page(1);
            },
            getTextoMotivo: function (id) {
                var self = this;
                let texto = 'ZZ' + ' - ' + window.app.idioma.t('MOTIVO_SIN_JUSTIFICAR');

                $.each(self.dsMotivosFiltro.options.data, function (_, m) {
                    if (m.IdMotivo === id) {
                        texto = m.IdMotivo + ' - ' + m.Motivo;
                        return true;
                    }
                });

                return texto;
            },
            itemTemplateMotivo: function (e) {
                if (e.field === 'all') {
                    return "<li class='k-item'><label class='k-label'><input type='checkbox' />#= all #</label></li>";
                } else {
                    return "<li class='k-item'><label class='k-label'><input type='checkbox' name='" + e.field + "' value='#= IdMotivo #'/>#= IdMotivo# - #= Motivo#</label></li>";
                }
            },
            // GRID PARAM VOL
            InitParametros: function () {
                var self = this;

                this.dsParametros = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            util.api.ajaxApi('../api/GetParametrosAdherenciaVolumen')
                                .done(function (data) {
                                    self.listaParametros = data;
                                    options.success(data);
                                }).fail(function (xhr) {
                                    options.error();
                                    util.ui.NotificaError(xhr);
                                });
                        },
                        update: function (options) {
                            var queryArgs = [];
                            queryArgs.push({
                                Id: options.data.Id,
                                Valor: options.data.Valor
                            });

                            util.api.ajaxApi('../api/EditarParametrosAdherencia', queryArgs).done(function (data) {
                                if (data === window.app.idioma.t('MOD_PARAMETRO_OK')) {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_OK'), 3000);
                                } else {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 3000);
                                }

                                options.success();
                            }).fail(function (xhr) {
                                options.error();
                                util.ui.NotificaError(xhr);
                            });
                        }
                    },
                    schema: {
                        model: {
                            id: 'Id',
                            fields: {
                                'Descripcion': { type: 'string', editable: false },
                                'Valor': { type: 'string' },
                                'Editable': { type: 'boolean' }
                            }
                        }
                    },
                    error: function (e) {
                        if (e) {
                            util.ui.NotificaError(e.xhr);
                        }
                    },
                });
            },
            InitGridParametros: function () {
                var self = this;

                var cols = [
                    {
                        field: 'Descripcion',
                        title: T('DESCRIPCION')
                    },
                    {
                        field: 'Valor',
                        title: T('VALOR')
                    },
                    {
                        title: ' ',
                        width: 120,
                        attributes: { 'style': 'text-align: center' },
                        command: [
                            {
                                name: 'edit',
                                text: {
                                    edit: T('EDITAR'),
                                    update: T('ACTUALIZAR'),
                                    cancel: T('CANCELAR')
                                }
                            }]
                    }];

                $('#gridParametros').kendoGrid({
                    dataSource: self.dsParametros,
                    resizable: true,
                    scrollable: false,
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                    columns: cols,
                    dataBound: function (e) {
                        util.ui.applyGridButtonSecurity(e.sender.element, [
                            { selector: '.k-grid-edit', defaultRole: 'LOG_PROD_SCH_2_GestionAdherenciaVolumen' }
                        ]);

                        var grid = $("#gridParametros").data("kendoGrid");
                        var gridData = grid.dataSource.view();
                        for (var i = 0; i < gridData.length; i++) {
                            var currentUid = gridData[i].uid;
                            if (!gridData[i].Editable) {
                                var currenRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currenRow).find(".k-grid-edit");
                                editButton.hide();
                            }
                        }
                    },
                });
            },
            ajustarColumnas: function (e) {
                var self = this;

                var grid = $('#gridDesvVol').data('kendoGrid');
                let vistaDesviacionVolumen = parseInt(self.GetVistaDesviacionVolumen()) || 0;

                // PLAN INI vs PLAN FIN
                if (vistaDesviacionVolumen == 0) {
                    grid.hideColumn("LineaDescripcion");
                    $("#gridDesvVol th[data-field='CPBPlanificados'] .k-link").html(T('CPB_PLANIFICADO_INICIAL'));
                    $("#gridDesvVol th[data-field='CPBReales'] .k-link").html(T('CPB_PLANIFICADO_FINAL'));
                    $("#gridDesvVol th[data-field='HLPlanificados'] .k-link").html(T('HL_PLANIFICADO_INICIAL'));
                    $("#gridDesvVol th[data-field='HLReales'] .k-link").html(T('HL_PLANIFICADO_FINAL'));
                // PLAN FIN vs REAL y PLAN INI vs REAL
                } else {
                    grid.showColumn("LineaDescripcion");
                    $("#gridDesvVol th[data-field='CPBPlanificados'] .k-link").html(T('CPB_PLANIFICADO'));
                    $("#gridDesvVol th[data-field='CPBReales'] .k-link").html(T('CPB_REAL'));
                    $("#gridDesvVol th[data-field='HLPlanificados'] .k-link").html(T('HL_PLANIFICADO'));
                    $("#gridDesvVol th[data-field='HLReales'] .k-link").html(T('HL_REAL'));
                }

                // Actualizamos los tooltips
                $("#gridDesvVol").getKendoTooltip().refresh();

                //self.validacionFiltros();
            },
            // GRID DESV VOL
            InitGridDesviacionVolumen: function () {
                var self = this;

                var columns = [
                    {
                        field: 'Id',
                        hidden: true,
                        culture: localStorage.getItem('idiomaSeleccionado')
                    },
                    {
                        field: 'SemanaNombre',
                        title: T('SEMANA'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 120,
                        filterable: { multi: true }
                    },
                    {
                        field: 'FecModif',
                        title: T('FECHA_MODIFICACION'),
                        format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                        template: "#= kendo.toString(FecModif, '" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "') #",
                        width: 165,
                        filterable: {
                            ui: function (element) {
                                element.kendoDateTimePicker({
                                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                    culture: localStorage.getItem("idiomaSeleccionado")
                                });
                            }
                        }
                    },
                    {
                        field: 'LineaDescripcion',
                        title: T('LINEA'),
                        hidden: true,
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 150,
                        filterable: { multi: true }
                    },
                    {
                        field: 'Formato',
                        title: T('FORMATO'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 180,
                        filterable: { multi: true }
                    },
                    {
                        field: 'IdPaleta',
                        title: T('ID_PALETA'),
                        width: 110
                    },
                    {
                        field: 'ItemMD',
                        title: T('ITEM_MD'),
                        width: 100
                    },
                    {
                        field: 'Descripcion',
                        title: T('DESCRIPCION'),
                        width: 250
                    },
                    {
                        field: 'CPBPlanificados',
                        title: T('CPB_PLANIFICADO_INICIAL'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 150,
                        template: function (dataItem) {
                            var texto = kendo.toString(dataItem.CPBPlanificados, "n2");
                            return kendo.htmlEncode(texto);
                        }
                    },
                    {
                        field: 'CPBReales',
                        title: T('CPB_PLANIFICADO_FINAL'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 145,
                        template: function (dataItem) {
                            var texto = kendo.toString(dataItem.CPBReales, "n2");
                            return kendo.htmlEncode(texto);
                        }
                    },
                    {
                        field: 'HLPlanificados',
                        title: T('HL_PLANIFICADO_INICIAL'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 140,
                        template: function (dataItem) {
                            var texto = kendo.toString(dataItem.HLPlanificados, "n2");
                            return kendo.htmlEncode(texto);
                        }
                    },
                    {
                        field: 'HLReales',
                        title: T('HL_PLANIFICADO_FINAL'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 135,
                        template: function (dataItem) {
                            var texto = kendo.toString(dataItem.HLReales, "n2");
                            return kendo.htmlEncode(texto);
                        }
                    },
                    {
                        field: 'Desviacion',
                        title: T('DESVIACION_VOL'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 140,
                        template: function (dataItem) {
                            var texto = kendo.toString(dataItem.Desviacion, "n2") + '%';
                            return kendo.htmlEncode(texto);
                        }
                    },
                    {
                        field: 'IdMotivo',
                        title: T('CAUSA_MOTIVO'),
                        culture: localStorage.getItem('idiomaSeleccionado'),
                        width: 160,
                        filterable: {
                            multi: true,
                            dataSource: self.dsMotivosFiltro,
                            itemTemplate: self.itemTemplateMotivo
                        },
                        //editor: self.crearEditorMotivo(self.dsMotivosFiltro),
                        template: function (dataItem) {
                            //return kendo.htmlEncode(self.getTextoMotivo(dataItem.AdherenciaDesvVol === undefined ? dataItem.IdMotivo : dataItem.AdherenciaDesvVol.IdMotivo));
                            return kendo.htmlEncode(self.getTextoMotivo(dataItem.IdMotivo));
                        }
                    },
                    {
                        field: 'Comentario',
                        title: T('COMENTARIO'),
                        width: 200
                    }
                ];

                $('#gridDesvVol').kendoGrid({
                    excel: util.ui.default.gridExcel(T('ADHERENCIA_VOLUMEN')),
                    sortable: true,
                    resizable: true,
                    selectable: 'multiple',
                    scrollable: true,
                    height: '100%',
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: util.ui.default.gridPageable(),
                    toolbar: util.ui.loadTemplate('#gridDesvVolToolbar'),
                    columns: columns,
                    excelExport: function (e) {
                        var templateMotivo = kendo.template(this.columns[13].template);
                        let vistaDesviacionVolumen = parseInt(self.GetVistaDesviacionVolumen()) || 0;
                        let tipoComparacion = '';

                        if (vistaDesviacionVolumen == 0) {
                            tipoComparacion = T('VOLPLAN_VOLPLAN').replace('/', '-').replace(/ /g, '');
                        } else if (vistaDesviacionVolumen == 1) {
                            tipoComparacion = T('VOLPLANFIN_VOLREAL').replace('/', '-').replace(/ /g, '');
                        } else {
                            tipoComparacion = T('VOLPLANINI_VOLREAL').replace('/', '-').replace(/ /g, '');
                        }

                        e.workbook.fileName = (self.esAdherente === 1 ? 'Adherencias' : 'Inadherencias') + '_' + tipoComparacion + "_" +
                            T('SEMANA') + $("#semanaInicio").data('kendoDropDownList').value() + "-" + $("#semanaFin").data('kendoDropDownList').value() + ".xlsx";

                        var sheet = e.workbook.sheets[0];

                        if (vistaDesviacionVolumen !== 0) {
                            sheet.rows[0].cells[7].value = T('CPB_PLANIFICADO');
                            sheet.rows[0].cells[8].value = T('CPB_REAL');
                            sheet.rows[0].cells[9].value = T('HL_PLANIFICADO');
                            sheet.rows[0].cells[10].value = T('HL_REAL');
                        }

                        // Modificar los datos de la tabla
                        for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                            var indiceNumerico = vistaDesviacionVolumen == 0 ? 6 : 7;
                            var indiceMotivo = vistaDesviacionVolumen == 0 ? 11 : 12;
                            var row = sheet.rows[rowIndex];

                            row.cells[1].value = kendo.toString(new Date(row.cells[1].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[indiceNumerico].format = "#,##0.00";
                            row.cells[++indiceNumerico].format = "#,##0.00";
                            row.cells[++indiceNumerico].format = "#,##0.00";
                            row.cells[++indiceNumerico].format = "#,##0.00";
                            row.cells[++indiceNumerico].format = "#,##0.00";

                            // Reemplazar el idMotivo por su descripcion
                            if (row.cells[indiceMotivo] != null) {
                                var valueMotivo = templateMotivo({ IdMotivo: row.cells[indiceMotivo].value });
                                row.cells[indiceMotivo].value = valueMotivo;
                            }

                            // Aplicar color de fondo a las filas pares
                            if (rowIndex % 2 == 0) {
                                for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                                    $.extend(row.cells[cellIndex], util.ui.default.excelCellEvenRow);
                                }
                            }
                        }
                    }
                });

                this.$("#anioInicio").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.aniosInicio,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                    //optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
                });

                this.$("#semanaInicio").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#anioFin").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.aniosFin,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                    //optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
                });

                this.$("#semanaFin").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#anioInicio").data('kendoDropDownList').trigger('change');
                var diaSemanaAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7);
                this.$("#semanaInicio").data('kendoDropDownList').value(util.date.getISOWeek(diaSemanaAnterior));
                this.$("#anioFin").data('kendoDropDownList').trigger('change');
                this.$("#semanaFin").data('kendoDropDownList').value(util.date.getISOWeek(new Date()));

                $('#gridDesvVol').kendoTooltip({
                    filter: 'th',
                    content: function (e) {
                        return e.target.text();                        
                    }
                })

                this.UpdateDataSourceDesvVol();
                self.cont = 0;
            },
            cambiaAnio: function (e, self) {
                self.obtenerSemanas($(e.element).val(), e.element[0].id);
            },
            obtenerSemanas: function (anio, origen) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/semanas/" + anio,
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var comboSemana;

                if (origen == 'anioInicio') {
                    comboSemana = this.$("#semanaInicio").data('kendoDropDownList');
                } else {
                    comboSemana = this.$("#semanaFin").data('kendoDropDownList');
                }
                comboSemana.setDataSource(ds);
                //comboSemana.select(0);
            },
            UpdateDataSourceDesvVol: function () {
                var self = this;

                this.dsDesviacionVolumen = new kendo.data.DataSource({
                    schema: {
                        model: {
                            id: 'Id',
                            fields: {
                                'Id': { type: 'number' },
                                'FecModif': { type: 'date' },
                                SemanaNombre: { type: 'string' },
                                LineaDescripcion: { type: 'string' },
                                'Formato': { type: 'string' },
                                'IdPaleta': { type: 'string' },
                                'ItemMD': { type: 'string' },
                                'Descripcion': { type: 'string' },
                                'CPBPlanificados': { type: 'number' },
                                'CPBReales': { type: 'number' },
                                'HLPlanificados': { type: 'number' },
                                'HLReales': { type: 'number' },
                                'Desviacion': { type: 'number' },
                                'IdMotivo': { type: 'string' },
                                'Comentario': { type: 'string' }
                            }
                        }
                    },
                    transport: {
                        read: function (options) {
                            var vista = self.GetVistaDesviacionVolumen();

                            var queryArgs = [{
                                vista: vista,
                                anioIni: $("#anioInicio").data('kendoDropDownList').value(),
                                semanaIni: $("#semanaInicio").data('kendoDropDownList').value(),
                                anioFin: $("#anioFin").data('kendoDropDownList').value(),
                                semanaFin: $("#semanaFin").data('kendoDropDownList').value(),
                                esAdherente: self.esAdherente
                            }];

                            util.api.ajaxApi('../api/GetDesvVolumen', queryArgs)
                                .done(function (result) {
                                    if (!result) {
                                        result = [];
                                    } else {
                                        // Los valores null no pueden filtrarse
                                        for (var i = 0; i < result.length; i++) {
                                            var v = result[i];
                                            if (v.Motivo === null || v.Motivo === undefined) {
                                                v.Motivo = 0;
                                            }
                                        }
                                    }

                                    options.success(result);
                                }).fail(function (xhr) {
                                    options.error();
                                    util.ui.NotificaError(xhr);
                                });
                        },
                    },
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                    pageSize: 100
                });

                $('#gridDesvVol').data('kendoGrid').setDataSource(this.dsDesviacionVolumen);
            },
            GetVistaDesviacionVolumen: function () {
                return $('#gridDesvVol input[name="vista"]:checked').length === 0 ? "0" : $('#gridDesvVol input[name="vista"]:checked')[0].value;
            },
            EditarRegistro: function (e) {
                var self = this;
                var permiso = TienePermiso(166);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridDesvVol').data("kendoGrid");
                if (grid.columns[13].hidden) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_EDITAR_REGISTRO_ADHERENCIA'), 3000);
                    return;
                }

                // Obtenemos la línea seleccionada del grid
                //var data = grid.dataItem(grid.select());
                var rows = grid.select();
                var items = [];

                rows.each(function () {
                    items.push(grid.dataItem(this));
                });

                if (items.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowEditAdh'></div>"));

                $("#windowEditAdh").kendoWindow(
                    {
                        title: window.app.idioma.t('EDITAR'),
                        width: "460px",
                        height: "170px",
                        content: "Logistica/html/EditarAdherencia.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaEditar.destroy();
                            self.ventanaEditar = null;
                        },
                        refresh: function () {
                            self.CargarDatosEdicion(items);
                        }
                    });

                self.ventanaEditar = $('#windowEditAdh').data("kendoWindow");
                self.ventanaEditar.center();
                self.ventanaEditar.open();
            },
            CargarDatosEdicion: function (items) {
                var self = this;

                $("#lblMotivo").text(window.app.idioma.t('MOTIVO') + ': ');
                $("#lblComentario").text(window.app.idioma.t("COMENTARIO") + ': ');
                $("#btnAceptarAdh").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarAdh").text(window.app.idioma.t('CANCELAR'));

                $("#cmbMotivos").kendoDropDownList({
                    dataSource: self.dsMotivosFiltro,
                    dataValueField: 'IdMotivo',
                    template: " #=IdMotivo # - #=Motivo #",
                    valueTemplate: " #=IdMotivo # - #=Motivo #",
                });

                if (items.length == 1) {
                    let data = self.dsMotivosFiltro.data();
                    let estaActivo = data.some(function (item) {
                        return item.IdMotivo === items[0].IdMotivo;
                    });

                    $("#cmbMotivos").data("kendoDropDownList").value(estaActivo ? items[0].IdMotivo : 'ZZ');
                } else {
                    $("#cmbMotivos").data("kendoDropDownList").select(0)
                }

                $("#txtComentario").val(items.length == 1 ? items[0].Comentario : '');

                $("#btnAceptarAdh").kendoButton({
                    click: function () { self.ConfirmarEdicion(items); }
                });

                $("#btnCancelarAdh").kendoButton({
                    click: function () { self.CancelarEdicion(); }
                });
            },
            CancelarEdicion: function () {
                this.ventanaEditar.close();
            },
            ConfirmarEdicion: function (items) {
                var self = this;
                listaIds = [];

                items.forEach(function (item) {
                    listaIds.push(item.Id);
                });

                var queryArgs = [{
                    listaIds: listaIds,
                    causa: $("#cmbMotivos").data("kendoDropDownList").value(),
                    comentario: $('#txtComentario').val(),
                    accion: 'edit'
                }];

                $.ajax({
                    data: JSON.stringify(queryArgs),
                    type: "POST",
                    async: false,
                    url: "../api/SetDesvVol",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            self.dsDesviacionVolumen.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                            self.ventanaEditar.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            ConfirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(166);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridDesvVol').data("kendoGrid");
                if (grid.columns[13].hidden) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_ELIMINAR_REGISTRO_ADHERENCIA'), 3000);
                    return;
                }

                //var data = grid.dataItem(grid.select());
                var rows = grid.select();
                var items = [];

                rows.each(function () {
                    items.push(grid.dataItem(this));
                });

                if (items.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('TITLE_ELIMINAR_REGISTRO'),
                    msg: window.app.idioma.t('PREGUNTA_ELIMINAR_REGISTRO'),
                    funcion: function () { self.EliminarRegistro(items); },
                    contexto: this
                });
            },
            EliminarRegistro: function (items) {
                var self = this;
                listaIds = [];

                items.forEach(function (item) {
                    listaIds.push(item.Id);
                });

                var queryArgs = [{
                    listaIds: listaIds,
                    accion: 'delete'
                }];

                $.ajax({
                    data: JSON.stringify(queryArgs),
                    type: "POST",
                    async: false,
                    url: "../api/SetDesvVol",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            self.dsDesviacionVolumen.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ELIMINACION_OK'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            ExportExcelVolumen: function (e) {
                var grid = $('#gridDesvVol').data('kendoGrid');
                grid.saveAsExcel();
            },
            eliminar: function () {
                Backbone.off('eventActAdherenciaMotivos');
                this.remove();
            }
        });

        return vistaAdherencia;
    });
