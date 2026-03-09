define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/Deslizante.html',
        'jszip', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/util'],
    function (_, Backbone, $, plantillaDeslizante, JSZip, VistaDlgConfirm, Not, util) {
        function T(name) {
            return window.app.idioma.t(name);
        }

        function tienePermiso() {
            var permiso = false;

            for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                if (window.app.sesion.attributes.funciones[i].id === 156) {
                    permiso = true;
                }
            }

            return permiso;
        }

        var GridVistasView = Backbone.View.extend({
            grid: null,
            numSemanas: null,
            textVistaSemana: null, // vistaDesc
            columnasSemanas: null,
            semanas: [], // { numSemana: 23, numAnyo: 18 }
            fieldsFijos: [],
            fieldsSemanas: [],
            queryArgs: null,
            initialize: function (e) {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                this.grid = util.ui.createGrid(this.el, {
                    toolbar: util.ui.loadTemplate('#tmplGridDeslizToolbar'),
                    columns: [],
                    excel: util.ui.default.gridExcel('DESLIZANTE')
                });

                this.numSemanas = util.ui.createNumericField('#gridDeslizNumSemanas');
                this.textVistaSemana = $('#gridDeslizLblVistaSemana');
                this.$el.kendoTooltip({ filter: 'th' });

                this.clearContent();
            },
            onNewData: function (result) {
                var datos = [];
                var semanas = [];

                if (result) {
                    var vista = +result.vista;
                    var fechaInicial = new Date(result.fechaInicial);
                    var numAnyoInicial = +result.numAnyoInicial;
                    var numSemanaInicial = +result.numSemanaInicial;
                    var fechaFinal = new Date(result.fechaFinal);
                    var numAnyoFinal = +result.numAnyoFinal;
                    var numSemanaFinal = +result.numSemanaFinal;

                    if (numAnyoInicial > numAnyoFinal ||
                        (numAnyoInicial === numAnyoFinal && numSemanaInicial > numSemanaFinal) ||
                        numAnyoFinal <= 0 || numSemanaFinal <= 0) {
                        this.semanas = [];
                        this.fieldsSemanas = [];
                        this.fieldsFijos = this.createStaticFields();
                        this.textVistaSemana.text('');
                        return;
                    }

                    var fecha = new Date(Date.UTC(fechaInicial.getFullYear(), fechaInicial.getMonth(), fechaInicial.getDate()));
                    var fechaFinalMS = new Date(Date.UTC(fechaFinal.getFullYear(), fechaFinal.getMonth(), fechaFinal.getDate())).getTime();
                    var fechaMS = fecha.getTime();
                    while (fechaMS <= fechaFinalMS) {
                        var numSemana = util.date.getISOWeek(fecha);

                        var numAnyo = util.date.getISOWeekYear(fecha);
                        semanas.push({
                            numSemana: numSemana,
                            numAnyo: numAnyo,
                            columnName: 'Week' + numSemana + '' + numAnyo,
                            columnTitle: T('SEMANA') + ' ' + numSemana + '/' + (numAnyo % 100)
                        });

                        fecha.setUTCDate(fecha.getUTCDate() + 7);
                        fechaMS = fecha.getTime();
                    }

                    var pivot = {};
                    $.each(result.datos, function (idx, fila) {
                        //var columnName = 'Week' + fila.numSemana + '' + fila.numAnyo;
                        var columnName = 'Week' + fila.Semana + '' + fila.Anio;

                        var pkey, nuevoDato;
                        if (vista === 0) {
                            nuevoDato = {
                                descCzaEnv: fila.Descripcion,//descCzaEnv
                                idItem: fila.Item
                            };
                            pkey = fila.Descripcion;//descCzaEnv;
                        } else {
                            nuevoDato = {
                                //linea: fila.linea || '---',
                                linea: fila.Linea,
                                formato: fila.Formato || '---',
                                idItem: fila.Item || '---',
                                idPaleta: fila.Paleta,
                                descPaleta: fila.Descripcion
                                //unidad: fila.unidad
                            };
                            pkey = '' + fila.Linea + '#' + fila.Formato + '#' + fila.Item + '#' + fila.Paleta;
                        }

                        var dato = pivot[pkey];
                        if (dato === undefined) {
                            pivot[pkey] = nuevoDato;
                            dato = pivot[pkey];
                        }
                        dato[columnName] = +fila.Cantidad;//cantidad
                    });

                    this.semanas = semanas;
                    if (semanas.length > 0) {
                        var self = this;
                        this.fieldsSemanas = $.map(semanas, function (s) {
                            return self.createFieldSemana(s.columnName, s.columnTitle);
                        });

                        this.textVistaSemana.text(T('SEMANA') + ' ' + numSemanaInicial + '/' + (numAnyoInicial % 100) +
                            (semanas.length > 1 ? (' a ' + T('SEMANA') + ' ' + numSemanaFinal + '/' + (numAnyoFinal % 100)) : '')
                        );
                    } else {
                        this.fieldsSemanas = [];
                        this.textVistaSemana.text('');
                    }

                    datos = $.map(pivot, function (val, _) { return val; });
                } else {
                    this.semanas = [];
                    this.fieldsSemanas = [];
                    this.textVistaSemana.text('');
                    datos = [];
                }

                this.fieldsFijos = this.createStaticFields();
                var listaFields = this.fieldsFijos.concat(this.fieldsSemanas);
                var fields = util.ui.createDataSourceFields(listaFields);
                var ds = new kendo.data.DataSource({
                    data: datos,
                    schema: {
                        model: {
                            fields: fields
                        }
                    },
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                    pageSize: 300
                });
                this.ConfiguraGrid(ds);
            },
            ConfiguraGrid: function (newDataSource) {
                var gridOptions = {};
                var agrupado = this.EsVistaAgrupada();

                // Asignar un nuevo dataSource al grid, si lo hay
                var ds;
                if (newDataSource) {
                    gridOptions.dataSource = newDataSource;
                    ds = newDataSource;
                } else {
                    ds = this.grid.dataSource;
                }

                if (ds !== undefined) {
                    var fieldSemanasAgg = $.map(this.fieldsSemanas, function (f) {
                        return { field: f.name, aggregate: 'sum' };
                    });

                    if (agrupado) {
                        ds.group([
                            { field: 'linea', dir: 'asc', aggregates: fieldSemanasAgg.concat([{ field: 'descPaleta', aggregate: 'count' }]) },
                            { field: 'formato', dir: 'asc', aggregates: fieldSemanasAgg.concat([{ field: 'descPaleta', aggregate: 'count' }]) }
                        ]);
                        ds.aggregates(fieldSemanasAgg.concat([
                            { field: 'linea', aggregate: 'count' },
                            { field: 'formato', aggregate: 'count' }
                        ]));
                    }

                    ds.aggregate(fieldSemanasAgg);
                }

                var listaFields = this.fieldsFijos.concat(this.fieldsSemanas);
                gridOptions.columns = util.ui.createGridColumns(listaFields); // this.CrearGridColumns();
                this.updateGridOptions(gridOptions);
                // this.grid.refresh();
            },
            EsVistaAgrupada: function () {
                return (this.GetTipoVista() === '1' || this.GetTipoVista() === '2');
            },
            updateGridOptions: function (options) {
                var numSemanas = this.numSemanas.value();
                var vistaSemana = this.textVistaSemana.text();
                var vista = this.GetTipoVista();

                this.grid.setOptions(options);
                this.numSemanas = util.ui.createNumericField('#gridDeslizNumSemanas');
                this.numSemanas.value(numSemanas);
                this.textVistaSemana = $('#gridDeslizLblVistaSemana');
                this.textVistaSemana.text(vistaSemana);
                if (vista === "0") {
                    $('#rbVistaPorCerveza').prop('checked', true);
                } else if (vista === "1") {
                    $('#rbVistaLineaFormato').prop('checked', true);
                } else {
                    $('#rbVistaLineaFormatoHl').prop('checked', true);
                }
                this.$el.kendoTooltip({ filter: 'th' });
            },
            updateContent: function (numSemanas, textVistaSemana) {
                this.numSemanas.value(numSemanas);
                this.textVistaSemana.text(textVistaSemana);
            },
            clearContent: function () {
                this.updateContent('8', '');
            },
            events: {
                'click #gridDeslizBtnConsultar': 'mostrarDatos',
                'click #gridDeslizBtnLimpiarFiltros': util.ui.limpiarFiltrosGrid,
                'click #gridDeslizBtnExcel': function () {
                    this.grid.saveAsExcel();
                },
                'click #rbVistaPorCerveza': 'mostrarDatos',
                'click #rbVistaLineaFormato': 'mostrarDatos',
                'click #rbVistaLineaFormatoHl': 'mostrarDatos',
            },
            mostrarDatos: function () {
                var self = this;

                var vista = this.GetTipoVista();
                var nextWeekDate = new Date(new Date().setDate(new Date().getDate() + 7));
                var initialYear = nextWeekDate.getFullYear();
                var nextWeek = util.date.getISOWeek(nextWeekDate);
                var auxDate = new Date(new Date().setDate(new Date().getDate() + 7));
                var finalWeekDate = new Date(auxDate.setDate(auxDate.getDate() + (this.numSemanas.value() - 1) * 7));
                var finalYear = finalWeekDate.getFullYear();
                var finalWeek = util.date.getISOWeek(finalWeekDate);
                var isoWeeks = [];
                var localDate = new Date(new Date().setDate(new Date().getDate() + 7));

                while (localDate <= finalWeekDate) {
                    isoWeeks.push(util.date.getISOWeek(localDate));
                    localDate.setDate(localDate.getDate() + 1);
                }

                var weeks = isoWeeks.filter(function (value, index) {
                    return isoWeeks.indexOf(value) == index;
                });

                var result = {};
                result.vista = vista;
                result.fechaInicial = nextWeekDate;
                result.numAnyoInicial = initialYear;
                result.numSemanaInicial = nextWeek;
                result.fechaFinal = finalWeekDate;
                result.numAnyoFinal = finalYear;
                result.numSemanaFinal = finalWeek;

                if (vista === "0") {
                    util.api.ajaxApi('../api/GetDeslizanteCerveza', weeks)
                        .done(function (data) {
                            result.datos = data;
                            self.onNewData(result);
                        })
                        .fail(function (xhr) {
                            util.ui.NotificaError(xhr);
                        });
                } else if (vista === "1") {
                    util.api.ajaxApi('../api/GetDeslizanteEnvasado', weeks)
                        .done(function (data) {
                            result.datos = data;
                            self.onNewData(result);
                        })
                        .fail(function (xhr) {
                            util.ui.NotificaError(xhr);
                        });
                } else {
                    util.api.ajaxApi('../api/GetDeslizanteEnvasadoHl', weeks)
                        .done(function (data) {
                            result.datos = data;
                            self.onNewData(result);
                        })
                        .fail(function (xhr) {
                            util.ui.NotificaError(xhr);
                        });
                }
            },
            GetTipoVista: function () {
                return $('#gridDeslizRdgroupVista input[name="vista"]:checked')[0].value;
            },
            createFieldSemana: function (columnName, numSemana) {
                var fieldSemana = {
                    name: columnName,
                    type: 'integer',
                    text: numSemana,
                    cssClass: 'columna-cantidad',
                    kGrid: {
                        aggregates: ["sum"],
                        width: '140px',
                        groupFooterTemplate: "#= (sum == null) ? '' : kendo.toString(sum, 'n0')  #",
                        footerAttributes: {
                            "class": "columna-cantidad"
                        },
                        footerTemplate: "Total: #= (sum == null) ? '' : kendo.toString(sum, 'n0') #"
                    }
                };

                return fieldSemana;
            },
            createStaticFields: function () {
                var agrupado = this.EsVistaAgrupada();

                var fields;

                if (agrupado) {
                    fields = [
                        {
                            name: 'linea',
                            type: 'string',
                            i18n: 'TREN',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                hidden: true,
                                //groupHeaderTemplate: T('LINEA') + ": #= value.charAt(0) === '0' ? value.substr(1) : value #",
                                groupHeaderTemplate: T('LINEA') + ": #= value #",
                                // footerTemplate: "Total"
                                // footerTemplate: (agrupado ? "Total" : undefined), // Count: #=count#
                            }
                        },
                        {
                            name: 'formato',
                            type: 'string',
                            i18n: 'FORMATO',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                hidden: true
                                // groupHeaderTemplate: "Total: #= value # (#= aggregates.descPaleta.count #)"
                            }
                        },
                        {
                            name: 'idItem',
                            type: 'string',
                            i18n: 'ITEM',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                width: 128,
                                groupHeaderTemplate: 'Total: #= value # (#= aggregates.descPaleta.count #)'
                            }
                        },
                        {
                            name: 'idPaleta',
                            type: 'string',
                            i18n: 'PALETA',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                width: 128
                            }
                        },
                        {
                            name: 'descPaleta',
                            type: 'string',
                            i18n: 'PRODUCTO',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                width: 400
                            }
                        }
                        //{ name: 'unidad',
                        //  type: 'string',
                        //  i18n: 'UNIDAD_MEDIDA',
                        //  kGrid: {
                        //      filterable: {
                        //          multi: true
                        //      },
                        //      width: 140
                        //  } }
                    ];
                } else {
                    fields = [
                        {
                            name: 'descCzaEnv',
                            type: 'string',
                            i18n: 'CERVEZA_A_ENVASAR',
                            kGrid: {
                                width: 480,
                                filterable: {
                                    multi: true
                                }
                            }
                        },
                        {
                            name: 'idItem',
                            type: 'string',
                            i18n: 'ITEM',
                            kGrid: {
                                filterable: {
                                    multi: true
                                },
                                width: 128
                            }
                        }
                    ];
                }

                return fields;
            },
            createDsFields: function () {
                var fields = this.createStaticFields();
                if (this.semanas) {
                    var self = this;
                    $.each(this.semanas, function (idx, s) {
                        var semana = '' + s.numSemana + '/' + (s.numAnyo % 100);
                        var columnName = semana.replace('/', '');
                        var field = self.createFieldSemana(columnName, semana);
                        fields.push(field);
                    });
                }

                return util.ui.createDataSourceFields(fields);
            },
            MostrarInstantanea: function (idIns) {
                var self = this;
                var tipoVista = this.GetTipoVista();
                var queryArgs = {
                    idIns: idIns,
                    vista: tipoVista,
                };

                util.api.ajaxApi('../api/ShowInstantanea', queryArgs)
                    .done(function (data) {
                        self.onNewData(data);
                    })
                    .fail(function (xhr) {
                        util.ui.NotificaError(xhr);
                    });
            }
        });

        var GridInstantaneasView = Backbone.View.extend({
            grid: null,
            fechaIni: null,
            fechaFin: null,
            initialize: function () {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                var self = this;

                var fields = [
                    { name: 'id', type: 'number', text: 'id', kGrid: { hidden: true } },
                    {
                        name: 'fecha', type: 'date', i18n: 'FECHA', kGrid: {
                            width: 112,
                            attributes: { 'style': 'text-align: center' }
                        }
                    },
                    { name: 'descripcion', i18n: 'VISTA' },
                    {
                        name: 'tipo', i18n: 'TIPO_VISTA', kGrid: {
                            width: 144,
                            filterable: { multi: true },
                            attributes: { 'style': 'text-align: center' }
                        }
                    }
                ];

                var columns = util.ui.createGridColumns(fields);
                function onClickMostrar(e) {
                    e.preventDefault();

                    var tr = $(e.target).closest('tr');
                    var data = this.dataItem(tr);
                    if (self.onMostrarInstantanea) {
                        self.onMostrarInstantanea(data.id);
                    }
                }
                function onClickEliminar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (permiso) {
                        var tr = $(e.target).closest('tr');
                        var data = this.dataItem(tr);

                        this.confirmacion = new VistaDlgConfirm({
                            titulo: T('TITLE_ELIMINAR_INSTANTANEA'),
                            msg: T('PREGUNTA_ELIMINAR_VISTA'),
                            funcion: function (e) {
                                self.EliminarInstantanea(data);
                                Backbone.trigger('eventCierraDialogo');
                            },
                            contexto: this
                        });
                    } else {
                        Not.crearNotificacion('warning', T('AVISO'), T('AVISO_SIN_PERMISOS'), 3000);
                    }
                }
                columns.push({
                    title: ' ',
                    width: 240,
                    attributes: { 'style': 'text-align: center' },
                    command: [
                        { text: T('MOSTRAR'), click: onClickMostrar, iconClass: 'k-icon k-i-search' },
                        { name: 'eliminar', text: T('ELIMINAR'), iconClass: "k-icon k-delete", click: onClickEliminar }
                    ],
                    attributes: {
                        'style': 'text-align: center'
                    }
                });

                this.grid = util.ui.createGrid(this.el, {
                    toolbar: util.ui.loadTemplate('#tmplGridInstToolbar'),
                    columns: columns,
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                });
                this.$el.kendoTooltip({ filter: 'th' });

                var inicioDate = new Date((new Date()).getTime() - (29 * 24 * 3600 * 1000));
                var finDate = new Date((new Date()).getTime() - (3600 * 1000));
                this.fechaIni = util.ui.createDatePickerFecha('#gridInstFechaIni', inicioDate);
                this.fechaFin = util.ui.createDatePickerFecha('#gridInstFechaFin', finDate);
                util.ui.initDatePickerRange(this.fechaIni, this.fechaFin);

                this.updateDataSource();
            },
            updateDataSource: function () {
                var self = this;
                var ds = new kendo.data.DataSource({
                    schema: {
                        model: {
                            fields: {
                                'fecha': { type: 'date' }
                            }
                        }
                    },
                    transport: {
                        read: function (options) {
                            var queryArgs = [{
                                fechaIni: util.text.toSQLDateString(self.fechaIni.value()),
                                fechaFin: util.text.toSQLDateString(self.fechaFin.value())
                            }];

                            util.api.ajaxApi('../api/GetInstantaneas', queryArgs)
                                .done(function (result) {
                                    var datos = $.map(result, function (data) {
                                        var desc = T('SEMANA') + ' ' + data.numSemanaInicial + '/' + (data.numAnyoInicial % 100);
                                        if (data.numSemanaInicial !== data.numSemanaFinal || data.numAnyoInicial !== data.numAnyoFinal) {
                                            desc = desc + ' a ' + T('SEMANA') + ' ' + data.numSemanaFinal + '/' + (data.numAnyoFinal % 100);
                                        }

                                        return {
                                            id: data.id,
                                            fecha: new Date(data.fecha),
                                            descripcion: desc,
                                            tipo: data.tipo
                                        };
                                    });
                                    options.success(datos);
                                }).fail(function (xhr) {
                                    options.error();
                                    util.ui.NotificaError(xhr);
                                });
                        }
                    },
                    pageSize: 100,
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                });
                this.grid.setDataSource(ds);
            },
            events: {
                'click #gridInstBtnSearchInstantanea': 'SearchInstantaneas',
                'click #gridInstBtnAddInstantanea': 'AddNewInstantanea',
                'click #gridInstBtnLimpiarFiltros': util.ui.limpiarFiltrosGrid
            },
            onMostrarInstantanea: null, // function (idIns, descripcion)
            SearchInstantaneas: function () {
                this.updateDataSource();
            },
            AddNewInstantanea: function () {
                var self = this;
                var permiso = tienePermiso();

                if (permiso) {
                    var numSemanas = this.getNumSemanas();
                    var queryArgs = [{
                        accion: 'new',
                        tipo: 'MANUAL',
                        numSemanas: numSemanas
                    }];

                    kendo.ui.progress(self.$el, true);
                    util.api.ajaxApi('../api/SetInstantanea', queryArgs)
                        .done(function (data) {
                            if (data) {
                                util.ui.NotificaCorrecto('NEW_INSTANTANEA_OK');
                                self.grid.dataSource.read();
                            } else {
                                util.ui.NotificaAviso('NEW_INSTANTANEA_ERROR');
                            }
                        }).fail(function (xhr) {
                            util.ui.NotificaError(xhr);
                        }).always(function (e) {
                            kendo.ui.progress(self.$el, false);
                        });
                } else {
                    Not.crearNotificacion('warning', T('AVISO'), T('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            EliminarInstantanea: function (dataItem) {
                // var dataItem = this.grid.dataItem(this.grid.tbody.find(">tr"));
                // var currentWeek = weekInYear(new Date());
                var queryArgs = [{
                    accion: 'delete',
                    id: dataItem.id
                }];

                var self = this;
                kendo.ui.progress(self.$el, true);
                util.api.ajaxApi('../api/SetInstantanea', queryArgs)
                    .done(function (data) {
                        if (data) {
                            util.ui.NotificaCorrecto('DEL_INSTANTANEA_OK');
                            self.grid.dataSource.read();
                        } else {
                            util.ui.NotificaAviso('DEL_INSTANTANEA_ERROR');
                        }
                    }).fail(function (xhr) {
                        util.ui.NotificaError(xhr);
                    }).always(function (e) {
                        kendo.ui.progress(self.$el, false);
                    });
            },
            getNumSemanas: null
        });

        var PanelDeslizanteView = Backbone.View.extend({
            gridVistas: null,
            gridInstantaneas: null,
            initialize: function (e) {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                // 1st Tab (panelDeslizante)
                util.ui.createVSplitter('#vsplitPanelDeslizante', ['50%', '50%']);

                var self = this;
                this.gridVistas = new GridVistasView({
                    el: '#gridVistas'
                });
                this.gridInstantaneas = new GridInstantaneasView({
                    el: '#gridInstantaneas'
                });
                this.gridInstantaneas.onMostrarInstantanea = function (idIns) {
                    self.gridVistas.MostrarInstantanea(idIns);
                };
                this.gridInstantaneas.getNumSemanas = function () {
                    return self.gridVistas.numSemanas.value();
                };
            }
        });

        var GridParamGeneralView = Backbone.View.extend({
            grid: {},
            diasSemana: [],
            initialize: function () {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                var self = this;
                getDiasSemana();

                self.dsParametros = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: '../api/GetParamGeneral',
                            dataType: 'json',
                        },
                        update: {
                            type: 'POST',
                            url: '../api/UpdateParamGeneral',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8'
                        },
                        create: {
                            url: "../api/AddParamGeneral",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                        },
                        destroy: {
                            url: "../api/DeleteParamGeneral",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                        },
                        parameterMap: function (options, operation) {
                            if (operation != 'read' && options) {
                                return JSON.stringify(options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number", editable: false },
                                'IdDia': { type: 'text' },
                                'Hora': { type: 'date' },
                                'Semanas': { type: 'number' }
                            }
                        }
                    },
                    requestStart: function () {
                        kendo.ui.progress($("#gridGeneral"), true);
                    },
                    requestEnd: function (e) {
                        kendo.ui.progress($("#gridGeneral"), false);
                        if (e.type === 'update') {
                            if (e.response === '0') {
                                util.ui.NotificaCorrecto('MOD_PARAMETRO_OK');
                            } else if (e.response === '-1') { // Error al registrar el job
                                util.ui.NotificaAviso('NEW_JOB_ERROR');
                            } else if (e.response === '-3') {
                                util.ui.NotificaAviso('PARAMETRO_EXISTENTE');
                                return;
                            } else { // Error al cambiar el parametro
                                util.ui.NotificaAviso('MOD_PARAMETRO_NOK');
                            }
                            self.grid.dataSource.read();
                        } else if (e.type === 'create') {
                            if (e.response === '0') {
                                util.ui.NotificaCorrecto('MOD_PARAMETRO_OK');
                            } else if (e.response === '-3') {
                                util.ui.NotificaAviso('PARAMETRO_EXISTENTE');
                                return;
                            } else if (e.response === '-1') { // Error al registrar el job
                                util.ui.NotificaAviso('NEW_JOB_ERROR');
                            } else { // Error al crear el parametro
                                util.ui.NotificaAviso('MOD_PARAMETRO_NOK');
                            }
                            self.grid.dataSource.read();
                        } else if (e.type === 'destroy') {
                            if (e.response === '0') {
                                util.ui.NotificaCorrecto('MOD_PARAMETRO_OK');
                            } else if (e.response === '-1') { // Error al registrar el job
                                util.ui.NotificaAviso('NEW_JOB_ERROR');
                            } else { // Error al eliminar el parametro
                                util.ui.NotificaAviso('MOD_PARAMETRO_NOK');
                            }
                            self.grid.dataSource.read();
                        }
                    },
                    error: function (e) {
                        kendo.ui.progress($("#gridGeneral"), false);
                        util.ui.NotificaError(e.xhr);
                    },
                    pageSize: 100
                });

                function onClickEditar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        $('#gridGeneral').data("kendoGrid").cancelChanges();
                    }
                }

                function onClickEliminar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (permiso) {
                        var tr = $(e.target).closest('tr');
                        var data = this.dataItem(tr);

                        this.confirmacion = new VistaDlgConfirm({
                            titulo: T('TITLE_ELIMINAR_PARAMETRO'),
                            msg: T('PREGUNTA_ELIMINAR_PARAMETRO'),
                            funcion: function (e) {
                                $("#gridGeneral").data("kendoGrid").dataSource.remove(data);  //prepare a "destroy" request
                                $("#gridGeneral").data("kendoGrid").dataSource.sync();
                                Backbone.trigger('eventCierraDialogo');
                            },
                            contexto: this
                        });
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    }
                }

                function getDiasSemana() {
                    var self = this;
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "../api/GetDiasSemana",
                        dataType: "json",
                        success: function (result) {
                            self.diasSemana = result.slice(1);
                            self.diasSemana.push(result[0]);
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        }
                    });
                }

                function chooseTemplate(data) {
                    var self = this;
                    var type = data.type;
                    var value = data.value;
                    if (value == null)
                        return "";

                    var diasSemana = self.diasSemana;
                    switch (type) {
                        case "time":
                            return kendo.toString(kendo.parseDate(value), util.text.FORMAT_TIME);
                        case "weekday":
                            for (var i = 0; i < diasSemana.length; i++) {
                                var s = diasSemana[i];
                                if (s.id === +value) {
                                    return s.dia;
                                }
                            }
                        default:
                            return value;
                    }
                }

                function dropdownEditor(container, options, ds) {
                    $('<input name="' + options.field + '"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataTextField: 'dia',
                            dataValueField: 'id',
                            dataSource: ds,
                            //optionLabel: T('SELEC_DIA')
                        });
                }

                function weekdayEditor(container, options) {
                    var self = this;
                    var dsDiasSemana = new kendo.data.DataSource({
                        data: self.diasSemana
                    });
                    dropdownEditor(container, options, dsDiasSemana);
                }

                function timeEditor(container, options) {
                    $('<input name="' + options.field + '"/>')
                        .appendTo(container)
                        .kendoTimePicker({
                            format: util.text.KFORMAT_TIME,
                            culture: localStorage.getItem('idiomaSeleccionado'),
                            //change: function (e) {
                            //    options.model.set("result", e.sender.value() || 1);
                            //}
                        });
                }

                this.grid = util.ui.createGrid(this.el, {
                    dataSource: self.dsParametros,
                    toolbar: util.ui.loadTemplate('#tmplGridParametrosConfiguracion'),
                    culture: kendo.culture().name,
                    selectable: 'row',
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                    columns: [
                        {
                            field: 'Semanas',
                            title: T('NUMERO_SEMANAS')
                        },
                        {
                            field: 'IdDia',
                            title: T('DIA_INSTANTANEA'),
                            template: function (e, options) { return chooseTemplate({ id: "IdDia", type: "weekday", value: e.IdDia }) },
                            editor: weekdayEditor
                        },
                        {
                            field: 'Hora',
                            title: T('HORA_INSTANTANEA'),
                            template: function (e, options) { return chooseTemplate({ id: "Hora", type: "time", value: e.Hora }) },
                            editor: timeEditor
                        },
                        {
                            title: ' ',
                            width: 240,
                            attributes: { 'style': 'text-align: center' },
                            command: [
                                {
                                    name: 'edit',
                                    text: {
                                        edit: T('EDITAR'),
                                        update: T('ACTUALIZAR'),
                                        cancel: T('CANCELAR')
                                    },
                                    click:onClickEditar
                                },
                                {
                                    name: 'eliminar',
                                    text: T('ELIMINAR'),
                                    iconClass: "k-icon k-delete",
                                    click: onClickEliminar
                                }
                            ]
                        }
                    ],
                });

                this.$el.kendoTooltip({ filter: 'th' });

                $("#addParametro").click(function (e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        setTimeout(function () {
                            $('#gridGeneral').find(".k-grid-edit-row").remove();
                        }, 30);
                    }
                });
            }
        });

        var GridParamFormatosView = Backbone.View.extend({
            grid: null,
            formato: null,
            dsFormatos: null,
            initialize: function () {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                var self = this;

                var columns = util.ui.createGridColumns([
                    { name: 'Descripcion', i18n: 'NOMBRE_FORMATO' }
                ]);

                function onClickEditar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        $('#gridFormatos').data("kendoGrid").cancelChanges();
                    }
                }

                function onClickEliminar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (permiso) {
                        var tr = $(e.target).closest('tr');
                        var data = this.dataItem(tr);

                        this.confirmacion = new VistaDlgConfirm({
                            titulo: T('TITLE_ELIMINAR_FORMATO'),
                            msg: T('PREGUNTA_ELIMINAR_FORMATO'),
                            funcion: function (e) {
                                self.DeleteFormato(data);
                                Backbone.trigger('eventCierraDialogo');
                            },
                            contexto: this
                        });
                    } else {
                        Not.crearNotificacion('warning', T('AVISO'), T('AVISO_SIN_PERMISOS'), 3000);
                    }
                }
                columns.push({
                    title: ' ',
                    width: 240,
                    attributes: { 'style': 'text-align: center' },
                    command: [
                        {
                            name: 'edit',
                            text: {
                                edit: T('EDITAR'),
                                update: T('ACTUALIZAR'),
                                cancel: T('CANCELAR')
                            },
                            click: onClickEditar
                        },
                        {
                            name: 'eliminar',
                            text: T('ELIMINAR'),
                            iconClass: "k-icon k-delete",
                            click: onClickEliminar
                        }
                    ]
                });

                self.dsFormatos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: '../api/GetParamFormatos',
                            dataType: 'json',
                        },
                        update: {
                            type: 'POST',
                            url: '../api/UpdateParamFormato',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8'
                        },
                        parameterMap: function (options, operation) {
                            if (operation === 'update' && options) {
                                var value = [];
                                value.push({ idFormato: options.IdFormato, formato: options.Descripcion });
                                return JSON.stringify(value);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: 'Id',
                            fields: {
                                'Id': { type: "number", editable: false },
                                'IdFormato': { type: 'number', editable: false },
                                'Descripcion': { type: 'string' }
                            }
                        }
                    },
                    requestEnd: function (e) {
                        if (e.type === 'update') {
                            if (e.response === '-2') {
                                util.ui.NotificaAviso('FORMATO_NO_VALIDO');
                            } else if (e.response === '-3') {
                                util.ui.NotificaAviso('FORMATO_YA_ASIGNADO');
                                return;
                            }
                            self.grid.dataSource.read();
                        }
                    },
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                    pageSize: 100
                });

                this.grid = util.ui.createGrid(this.el, {
                    dataSource: self.dsFormatos,
                    toolbar: util.ui.loadTemplate('#tmplGridFormatoToolbar'),
                    columns: columns,
                    culture: kendo.culture().name,
                    selectable: 'row',
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                    change: function (e) {
                        var selectedRows = this.select();
                        var dataItem = this.dataItem(selectedRows[0]);
                        // obtenemos los productos asociados
                        // self.SetDataParamProductos();
                        if (self.onSelectionChanged) {
                            self.onSelectionChanged(dataItem);
                        }
                    },
                    dataBound: function (e) {
                        if (self.onSelectionChanged) {
                            self.onSelectionChanged(null);
                        }
                    },
                });
                this.$el.kendoTooltip({ filter: 'th' });
            },
            events: {
                'click #gridFormatoBtnLimpiarFiltros': util.ui.limpiarFiltrosGrid,
                'click #gridFormatoBtnAdd': 'AddNewFormato'
            },
            AddNewFormato: function () {
                var formato = $('#gridFormatoFormato').val().trim();
                var self = this;

                var permiso = tienePermiso();

                if (permiso) {
                    if (formato && formato.length > 0) {
                        var listaAsignados = this.grid.dataSource.data();
                        var yaAsignado = listaAsignados.filter(function (v) {
                            return (v.Descripcion.toLowerCase() === formato.toLowerCase());
                        });

                        if (yaAsignado.length > 0) {
                            util.ui.NotificaAviso('FORMATO_YA_ASIGNADO');
                            return;
                        }

                        kendo.ui.progress($('#gridFormatos'), true);
                        var queryArgs = [{
                            formato: formato
                        }];

                        util.api.ajaxApi('../api/AddParamFormato', queryArgs)
                            .done(function (response) {
                                if (response === '0') {
                                    self.grid.dataSource.read();
                                    $('#gridFormatoFormato').val('');
                                    util.ui.NotificaCorrecto('NEW_FORMATO_OK');
                                } else {
                                    util.ui.NotificaAviso('FORMATO_NO_VALIDO');
                                }
                            }).fail(function (xhr) {
                                util.ui.NotificaError(xhr);
                            }).always(function (e) {
                                kendo.ui.progress($('#gridFormatos'), false);
                            });
                    } else {
                        util.ui.NotificaAviso('FORMATO_NO_VALIDO');
                    }
                } else {
                    Not.crearNotificacion('warning', T('AVISO'), T('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            DeleteFormato: function (data) {
                var self = this;

                kendo.ui.progress($('#gridFormatos'), true);

                var queryArgs = [{
                    idFormato: data.IdFormato,
                    formato: data.Descripcion
                }];

                util.api.ajaxApi('../api/DeleteParamFormato', queryArgs)
                    .done(function (response) {
                        if (response === '0') {
                            self.grid.dataSource.read();
                            util.ui.NotificaCorrecto('DEL_FORMATO_OK');
                        } else {
                            util.ui.NotificaAviso('ERROR_ELIMINAR_FORMATO');
                        }
                    }).fail(function (xhr) {
                        util.ui.NotificaError(xhr);
                    }).always(function (e) {
                        kendo.ui.progress($('#gridFormatos'), false);
                    });
            },
            onSelectionChanged: null // dataItem or null
        });

        var GridParamProductosView = Backbone.View.extend({
            grid: null,
            producto: null,
            formatoActual: null,
            dsFormatos: null,
            dsParamProductos: null,
            initialize: function () {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                var self = this;

                var columns = util.ui.createGridColumns([
                    { name: 'Paleta', i18n: 'PALETA', width: 128 },
                    { name: 'Descripcion', i18n: 'DESC_PRODUCTO' },
                    { name: 'DefId', i18n: 'ITEM', width: 128 }
                ]);
                function onClickEliminar(e) {
                    e.preventDefault();
                    var permiso = tienePermiso();

                    if (permiso) {
                        var tr = $(e.target).closest('tr');
                        var data = this.dataItem(tr);

                        this.confirmacion = new VistaDlgConfirm({
                            titulo: T('TITLE_ELIMINAR_PRODUCTO'),
                            msg: T('PREGUNTA_ELIMINAR_PRODUCTO'),
                            funcion: function (e) {
                                self.DeleteProducto(data);
                                Backbone.trigger('eventCierraDialogo');
                            },
                            contexto: this
                        });
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    }
                }
                columns.push({
                    title: ' ',
                    width: 128,
                    attributes: { 'style': 'text-align: center' },
                    command: [{
                        name: 'eliminar',
                        text: T('ELIMINAR'),
                        click: onClickEliminar,
                        iconClass: "k-icon k-delete"
                    }]
                });

                self.dsParamProductos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: '../api/GetParamProductos',
                            dataType: 'json',
                        },
                    },
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                    pageSize: 100
                });

                this.grid = util.ui.createGrid(this.el, {
                    dataSource: self.dsParamProductos,
                    toolbar: util.ui.loadTemplate('#tmplGridProductosToolbar'),
                    columns: columns,
                });
                this.$el.kendoTooltip({ filter: 'th' });

                var dsProductos = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            util.api.ajaxApi('../api/GetProductos')
                                .done(function (result) {
                                    var datos = $.map(result, function (v) {
                                        return {
                                            texto: (v.defid + ' | ' + v.descript + ' | ' + v.item),
                                            valor: JSON.stringify(v)
                                        };
                                    });
                                    options.success(datos);
                                }).fail(function (xhr) {
                                    options.error();
                                    util.ui.NotificaError(xhr);
                                });
                        }
                    },
                    error: function (e) {
                        util.ui.NotificaError(e.xhr);
                    },
                    //group: { field: "formato" },       
                });

                this.producto = util.ui.createCombo('#gridProductosProducto', 'texto', 'valor', dsProductos, T('SELECT_PRODUCT_DESLIZ'));
            },
            events: {
                'click #gridProductosBtnAdd': 'AddProducto'
            },
            onFormatoHaCambiado: function (data) {
                if (data != null) {
                    this.$el.find('.k-widget, .k-button').removeAttr('disabled').addClass('k-state-enabled').removeClass('k-state-disabled');
                } else {
                    this.$el.find('.k-widget, .k-button').attr('disabled', 'disabled').addClass('k-state-disabled').removeClass('k-state-enabled');
                }

                this.updateDataSource(data);
            },
            updateDataSource: function (nuevoFormato) {
                if (nuevoFormato) {
                    this.formatoActual = {
                        formatoId: nuevoFormato.IdFormato,
                        formato: nuevoFormato.Descripcion
                    };
                    this.dsParamProductos.filter({ field: "IdFormato", operator: "eq", value: nuevoFormato.IdFormato });
                } else {
                    this.formatoActual = null;
                    this.dsParamProductos.filter({ field: "IdFormato", operator: "eq", value: -1 });
                }
            },
            getTextoFormato: function (idFormato) {
                var formatos = this.dsFormatos.data();

                var formato = 'Sin formato';
                if (idFormato !== 0) {
                    $.each(formatos, function (_, f) {
                        if (f.IdFormato === idFormato) {
                            formato = f.Descripcion;
                            return false;
                        }
                    });
                }

                return formato;
            },
            AddProducto: function () {
                var permiso = tienePermiso();

                if (permiso) {
                    if (this.formatoActual == null || this.formatoActual.formatoId == null) {
                        util.ui.NotificaAviso('SELEC_FORMATO');
                        return;
                    }

                    if (this.producto.text() === '') {
                        util.ui.NotificaAviso('RELLENE_TODOS_CAMPOS');
                        return;
                    }

                    // Revisar que la paleta no exista ya
                    var valor = JSON.parse(this.producto.value());
                    var paleta = valor.defid;
                    var listaAsignados = this.dsParamProductos.data();
                    var yaAsignado = listaAsignados.filter(function (v) {
                        return (v.Paleta === paleta);
                    });

                    if (yaAsignado.length > 0) {
                        var texto = T('PRODUCTO_YA_ASIGNADO').replace('{0}', this.getTextoFormato(yaAsignado[0].IdFormato));
                        Not.crearNotificacion('warning', T('AVISO'), texto, 1000 + Math.floor(texto.length / 25) * 1000);
                        return;
                    }

                    var queryArgs = [{
                        formatoId: this.formatoActual.formatoId,
                        paleta: paleta,
                        descripcion: valor.descript,
                        defId: valor.item,
                    }];

                    kendo.ui.progress($('#gridProductos'), true);
                    var self = this;
                    util.api.ajaxApi('../api/AddParamProducto', queryArgs)
                        .done(function (response) {
                            if (response === '0') {
                                self.grid.dataSource.read();
                                self.producto.select(0);
                                util.ui.NotificaCorrecto('NEW_PRODUCTO_OK');
                            } else {
                                util.ui.NotificaAviso('ERROR_CREAR_PRODUCTO');
                            }
                        }).fail(function (xhr) {
                            util.ui.NotificaError(xhr);
                        }).always(function (e) {
                            kendo.ui.progress($('#gridProductos'), false);
                        });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            DeleteProducto: function (data) {
                if (this.formatoActual == null || this.formatoActual.formatoId == null) {
                    util.ui.NotificaAviso('SELEC_FORMATO');
                    return;
                }
                var self = this;

                var queryArgs = [{
                    id: data.Id,
                }];

                kendo.ui.progress($('#gridProductos'), true);
                util.api.ajaxApi('../api/DeleteParamProducto', queryArgs)
                    .done(function (response) {
                        if (response === '0') {
                            self.grid.dataSource.read();
                            self.producto.select(0);
                            util.ui.NotificaCorrecto('DEL_PRODUCTO_OK');
                        } else {
                            util.ui.NotificaAviso('ERROR_ELIMINAR_PRODUCTO');
                        }
                    }).fail(function (xhr) {
                        util.ui.NotificaError(xhr);
                    }).always(function (e) {
                        kendo.ui.progress($('#gridProductos'), false);
                    });
            }
        });

        var PanelParametrosView = Backbone.View.extend({
            gridGeneral: null,
            gridFormatos: null,
            gridProductos: null,
            initialize: function () {
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                var self = this;
                util.ui.createVSplitter('#vsplitPanelParametros', ['35%', '65%']);
                util.ui.createHSplitter('#hsplitPanelParametros', ['50%', '50%']);

                this.gridGeneral = new GridParamGeneralView({
                    el: '#gridGeneral'
                });
                this.gridFormatos = new GridParamFormatosView({
                    el: '#gridFormatos'
                });
                this.gridProductos = new GridParamProductosView({
                    el: '#gridProductos'
                });

                this.gridProductos.dsFormatos = this.gridFormatos.dsFormatos;
                this.gridFormatos.onSelectionChanged = $.proxy(function (data) {
                    if (self.gridProductos && self.gridProductos.onFormatoHaCambiado) {
                        self.gridProductos.onFormatoHaCambiado(data);
                    }
                }, self.gridProductos);

                $('[data-funcion]').checkSecurity();
            }
        });

        var vistaDeslizante = Backbone.View.extend({
            id: 'divHTMLContenido',
            panelDeslizante: null,
            panelParametros: null,
            template: _.template(plantillaDeslizante),
            initialize: function (e) {
                window.JSZip = JSZip;
                this.render();
            },
            eliminar: function () {
                util.ui.eliminar(this);
            },
            render: function () {
                // Create DOM
                this.$el.html(this.template());
                $('#center-pane').append(this.$el);

                // Prepare TabStrip
                this.tab = util.ui.createTabStrip('#divPestanias');

                // Panel Deslizante
                this.panelDeslizante = new PanelDeslizanteView({
                    el: '#panelDeslizante'
                });

                // Panel Parametros
                this.panelParametros = new PanelParametrosView({
                    el: '#panelParametros'
                });

                util.ui.enableResizeCenterPane();
            }
        });

        return vistaDeslizante;
    });
