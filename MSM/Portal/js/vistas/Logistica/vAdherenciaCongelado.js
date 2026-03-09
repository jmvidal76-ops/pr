define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/AdherenciaCongelado.html', 'jszip', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'compartido/util'],
    function (_, Backbone, $, plantillaAdherenciaCongelado, JSZip, Not, VistaDlgConfirm, util) {
        var vistaAdherenciaCongelado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsMotivosFiltro: [],
            dsDesviacionCongelado: [],
            aniosInicio: [],
            aniosFin: [],
            confirmacion: null,
            esAdherente: 1,
            dsParametros: [],
            listaParametros: [],
            ventanaEditar: null,
            template: _.template(plantillaAdherenciaCongelado),
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
                self.tab = util.ui.createTabStrip('#divPestanias');

                // Parámetros
                self.obtenerParametrosCongelado();
                self.renderGridParametros();

                self.renderGridDesviacionCongelado();
                self.resizeGrid();
            },
            events: {
                'click #btnShowAdherencias': function () {
                    var self = this;
                    self.esAdherente = 1;
                    self.validacionFiltros();
                },
                'click #btnShowInadherencias': function () {
                    var self = this;
                    self.esAdherente = 0;
                    self.validacionFiltros();
                },
                'click #btnExcelCongelado': 'ExportExcelCongelado',
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

                if (self.dsDesviacionCongelado.page() != 1) {
                    self.dsDesviacionCongelado.page(1);
                }
                //$('#gridDesvCongelado').data('kendoGrid').dataSource.read();
                self.dsDesviacionCongelado.read();
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
            obtenerParametrosCongelado: function () {
                var self = this;

                self.dsParametros = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            util.api.ajaxApi('../api/GetParametrosAdherenciaCongelado', null, 'GET')
                                .done(function (data) {
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
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });
            },
            renderGridParametros: function () {
                var self = this;

                $('#gridParamCongelado').kendoGrid({
                    dataSource: self.dsParametros,
                    resizable: true,
                    scrollable: false,
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                    columns: [
                        {
                            field: 'Descripcion',
                            title: window.app.idioma.t('DESCRIPCION'),
                        },
                        {
                            field: 'Valor',
                            title: window.app.idioma.t('VALOR'),
                        },
                        {
                            title: ' ',
                            width: 120,
                            attributes: { 'style': 'text-align: center' },
                            command: [
                                {
                                    name: 'edit',
                                    text: {
                                        edit: window.app.idioma.t('EDITAR'),
                                        update: window.app.idioma.t('ACTUALIZAR'),
                                        cancel: window.app.idioma.t('CANCELAR')
                                    }
                                }]
                        }
                    ],
                    dataBound: function (e) {
                        util.ui.applyGridButtonSecurity(e.sender.element, [
                            { selector: '.k-grid-edit', defaultRole: 'LOG_PROD_SCH_8_GestionAdherenciaCongelado' }
                        ]);

                        var grid = $("#gridParamCongelado").data("kendoGrid");
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
            renderGridDesviacionCongelado: function () {
                var self = this;

                $('#gridDesvCongelado').kendoGrid({
                    excel: util.ui.default.gridExcel(window.app.idioma.t('ADHERENCIA_CONGELADO')),
                    autoBind: false,
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
                    toolbar: util.ui.loadTemplate('#gridDesvCongToolbar'),
                    columns: [
                        {
                            field: 'Id',
                            hidden: true,
                            culture: localStorage.getItem('idiomaSeleccionado')
                        },
                        {
                            field: 'SemanaNombre',
                            title: window.app.idioma.t('SEMANA'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 120,
                            filterable: { multi: true }
                        },
                        {
                            field: 'FecModif',
                            title: window.app.idioma.t('FECHA_MODIFICACION'),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
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
                            title: window.app.idioma.t('LINEA'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 160,
                            filterable: { multi: true }
                        },
                        {
                            field: 'WO',
                            title: window.app.idioma.t('WO'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 140,
                        },
                        {
                            field: 'Formato',
                            title: window.app.idioma.t('FORMATO'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 130,
                        },
                        {
                            field: 'IdPaleta',
                            title: window.app.idioma.t('ID_PALETA'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 105
                        },
                        {
                            field: 'ItemMD',
                            title: window.app.idioma.t('ITEM_MD'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 100
                        },
                        {
                            field: 'Descripcion',
                            title: window.app.idioma.t('DESCRIPCION'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 250
                        },
                        {
                            field: 'FecIniPlan',
                            title: window.app.idioma.t('FECHA_INICIO_PLAN'),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            width: 160,
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
                            field: 'FecFinPlan',
                            title: window.app.idioma.t('FECHA_FIN_PLAN'),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            width: 150,
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
                            field: 'FecIniReal',
                            title: window.app.idioma.t('FECHA_INICIO_REAL'),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            width: 160,
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
                            field: 'FecFinReal',
                            title: window.app.idioma.t('FECHA_FIN_REAL'),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            width: 150,
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
                            field: 'DesvIni',
                            title: window.app.idioma.t('DESV_INI'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 100,
                            template: function (dataItem) {
                                var texto = kendo.toString(dataItem.DesvIni, "n2");
                                return kendo.htmlEncode(texto);
                            }
                        },
                        {
                            field: 'DesvFin',
                            title: window.app.idioma.t('DESV_FIN'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 105,
                            template: function (dataItem) {
                                var texto = kendo.toString(dataItem.DesvFin, "n2");
                                return kendo.htmlEncode(texto);
                            }
                        },
                        {
                            field: 'HorasPlan',
                            title: window.app.idioma.t('HORAS_PLAN'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 115,
                            template: function (dataItem) {
                                var texto = kendo.toString(dataItem.HorasPlan, "n2");
                                return kendo.htmlEncode(texto);
                            }
                        },
                        {
                            field: 'IdMotivo',
                            title: window.app.idioma.t('CAUSA_MOTIVO'),
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            width: 150,
                            filterable: {
                                multi: true,
                                dataSource: self.dsMotivosFiltro,
                                itemTemplate: self.itemTemplateMotivo
                            },
                            template: function (dataItem) {
                                return kendo.htmlEncode(self.getTextoMotivo(dataItem.IdMotivo));
                            }
                        },
                        {
                            field: 'Comentario',
                            title: window.app.idioma.t('COMENTARIO'),
                            width: 180,
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var templateMotivo = kendo.template(this.columns[16].template);

                        e.workbook.fileName = (self.esAdherente === 1 ? 'Adherencias' : 'Inadherencias') + ' Congelado_' + window.app.idioma.t('SEMANA') +
                            $("#semanaInicio").data('kendoDropDownList').value() + "-" + $("#semanaFin").data('kendoDropDownList').value() + ".xlsx";

                        var sheet = e.workbook.sheets[0];

                        // Modificar los datos de la tabla
                        for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                            var indiceMotivo = 15;
                            var row = sheet.rows[rowIndex];

                            row.cells[1].value = kendo.toString(new Date(row.cells[1].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[8].value = kendo.toString(new Date(row.cells[8].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[9].value = kendo.toString(new Date(row.cells[9].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[10].value = kendo.toString(new Date(row.cells[10].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[11].value = kendo.toString(new Date(row.cells[11].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            row.cells[12].format = "#,##0.00";
                            row.cells[13].format = "#,##0.00";
                            row.cells[14].format = "#,##0.00";

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

                self.$("#anioInicio").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.aniosInicio,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                });

                self.$("#semanaInicio").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#anioFin").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.aniosFin,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                });

                self.$("#semanaFin").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#anioInicio").data('kendoDropDownList').trigger('change');
                var diaSemanaAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7);
                self.$("#semanaInicio").data('kendoDropDownList').value(util.date.getISOWeek(diaSemanaAnterior));
                self.$("#anioFin").data('kendoDropDownList').trigger('change');
                self.$("#semanaFin").data('kendoDropDownList').value(util.date.getISOWeek(new Date()));

                $('#gridDesvCongelado').kendoTooltip({
                    filter: 'th',
                    content: function (e) {
                        return e.target.text();
                    }
                })

                self.updateDataSourceDesvCong();
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
            },
            updateDataSourceDesvCong: function () {
                var self = this;

                self.dsDesviacionCongelado = new kendo.data.DataSource({
                    schema: {
                        model: {
                            id: 'Id',
                            fields: {
                                'Id': { type: 'number', from: 'AdherenciaDesviacionCongelado.Id' },
                                'FecModif': { type: 'date', from: 'AdherenciaDesviacionCongelado.FecModif' },
                                'SemanaNombre': { type: 'string' },
                                'LineaDescripcion': { type: 'string' },
                                'WO': { type: 'string', from: 'AdherenciaDesviacionCongelado.WO' },
                                'Formato': { type: 'string', from: 'AdherenciaDesviacionCongelado.Formato' },
                                'IdPaleta': { type: 'string', from: 'AdherenciaDesviacionCongelado.IdPaleta' },
                                'ItemMD': { type: 'string', from: 'AdherenciaDesviacionCongelado.ItemMD' },
                                'Descripcion': { type: 'string', from: 'AdherenciaDesviacionCongelado.Descripcion' },
                                'FecIniPlan': { type: 'date', from: 'AdherenciaDesviacionCongelado.FecIniPlan' },
                                'FecFinPlan': { type: 'date', from: 'AdherenciaDesviacionCongelado.FecFinPlan' },
                                'FecIniReal': { type: 'date', from: 'AdherenciaDesviacionCongelado.FecIniReal' },
                                'FecFinReal': { type: 'date', from: 'AdherenciaDesviacionCongelado.FecFinReal' },
                                'DesvIni': { type: 'number', from: 'AdherenciaDesviacionCongelado.DesvIni' },
                                'DesvFin': { type: 'number', from: 'AdherenciaDesviacionCongelado.DesvFin' },
                                'HorasPlan': { type: 'number', from: 'AdherenciaDesviacionCongelado.HorasPlan' },
                                'IdMotivo': { type: 'string', from: 'AdherenciaDesviacionCongelado.IdMotivo' },
                                'Comentario': { type: 'string', from: 'AdherenciaDesviacionCongelado.Comentario' }
                            }
                        }
                    },
                    transport: {
                        read: function (options) {
                            var queryArgs = [{
                                anioIni: $("#anioInicio").data('kendoDropDownList').value(),
                                semanaIni: $("#semanaInicio").data('kendoDropDownList').value(),
                                anioFin: $("#anioFin").data('kendoDropDownList').value(),
                                semanaFin: $("#semanaFin").data('kendoDropDownList').value(),
                                esAdherente: self.esAdherente
                            }];

                            util.api.ajaxApi('../api/GetDesviacionCongelado', queryArgs)
                                .done(function (result) {
                                    if (self.esAdherente == 1) {
                                        $('#gridDesvCongelado').data('kendoGrid').hideColumn(16); //Causa - Motivo
                                        $('#gridDesvCongelado').data('kendoGrid').hideColumn(17); //Comentario
                                    } else {
                                        $('#gridDesvCongelado').data('kendoGrid').showColumn(16); //Causa - Motivo
                                        $('#gridDesvCongelado').data('kendoGrid').showColumn(17); //Comentario
                                    }

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

                $('#gridDesvCongelado').data('kendoGrid').setDataSource(self.dsDesviacionCongelado);
            },
            EditarRegistro: function () {
                var self = this;
                var permiso = TienePermiso(332);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridDesvCongelado').data("kendoGrid");
                // Si está oculta la columna Causa - Motivo es porque es adherente
                if (grid.columns[16].hidden) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_EDITAR_REGISTRO_ADHERENCIA'), 3000);
                    return;
                }

                // Obtenemos la línea seleccionada del grid
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
                    url: "../api/SetDesviacionCongelado",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            self.dsDesviacionCongelado.read();
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
                var permiso = TienePermiso(332);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridDesvCongelado').data("kendoGrid");
                // Si está oculta la columna Causa - Motivo es porque es adherente
                if (grid.columns[16].hidden) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_ELIMINAR_REGISTRO_ADHERENCIA'), 3000);
                    return;
                }

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
                    url: "../api/SetDesviacionCongelado",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            self.dsDesviacionCongelado.read();
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
            ExportExcelCongelado: function (e) {
                var grid = $('#gridDesvCongelado').data('kendoGrid');
                grid.saveAsExcel();
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridDesvCongelado"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 30);
            },
            eliminar: function () {
                Backbone.off('eventActAdherenciaMotivos');
                this.remove();
            }
        });

        return vistaAdherenciaCongelado;
    });