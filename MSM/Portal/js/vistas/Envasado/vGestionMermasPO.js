define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionMermasPO.html', 'compartido/notificaciones',
    'compartido/util', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, Not, util, JSZip, enums) {
        var vistaGestionMermasPO = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsMermas: null,
            dsContadores: null,
            gridMermas: null,
            gridContadores: null,
            constClaseMaquina: enums.ClaseMaquina(),
            constCRUD: enums.OperacionesCRUD(),
            constClaseEnvase: enums.ClaseEnvase(),
            fin: new Date(), //Cambiar después inicio y fin
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            tabSelect: 1,
            //maquinas: "LLE_ETQ_IBV_IBL",
            detailsEdited: [],
            template: _.template(Plantilla),
            initialize: function () {
                let self = this;
                window.JSZip = JSZip;
                
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                //let today = kendo.toString(new Date(), 'dd/MM/yyyy');

                self.dsMermas = new kendo.data.DataSource({
                    pageSize: 30,
                    transport: {
                        read: {
                            url: "../api/Mermas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",
                            data: function () {
                                return {
                                    linea: $("#selectLinea").val() || 0,
                                    fDesde: $("#dtpFechaDesde").data("kendoDatePicker").value()?.toISOString(),
                                    fHasta: $("#dtpFechaHasta").data("kendoDatePicker").value()?.toISOString()
                                }
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: {type: "number" },
                                IdTurno: {type: "number"},
                                Fecha: { type: "date" },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                        else if (e.xhr.status == '405') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                        }
                        else if (e.xhr.status == '406') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_MERMAS'), 2000);
                        }
                    }
                });

                self.dsMaquinasContadores = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/Mermas/MaquinasContadores",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",
                            data: function () {
                                return {
                                    linea: $("#selectLinea2").val() || 0
                                }
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "IdMaquina",
                            fields: {
                                IdMaquina: { type: "number" },
                                ClaseMaquina: { type: "string", editable: false, default: '' },
                                DescripcionMaquina: { type: "string", editable: false, default: '' },
                                CodigoMaquina: { type: "string", editable: false },
                                Orden: { type: "number", editable: false },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_MAQUINAS_CONTADORES_MERMAS'), 2000);
                        }
                    }
                });

                self.dsContadores = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/mermas/ConfiguracionContadoresMermas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",
                        },
                    },
                    group: [
                        { field: "ClaseMaquina" }
                    ],
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "number" },
                                CapturaAutomatica: { type: "boolean" },
                                ClaseEnvase: { type: "string" },
                                ClaseMaquina: { type: "string" },
                                Descripcion: { type: "string" },
                                Linea: { type: "string" },
                                Maquina: { type: "string" },
                                Orden: { type: "number" },
                                PorcentajeMaximo: { type: "number" },
                                PorcentajeMinimo: { type: "number" },
                                TipoGlobal: { type: "number" },
                                EsContadorGlobal: { type: "boolean"},
                                EsContadorGlobalStr: { type: "string"},
                                RechazoTotal: { type: "boolean"},
                                RechazoTotalStr: { type: "string"},
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CONFIGURACION_CONTADORES_MERMAS'), 2000);
                        }
                    }
                });

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            cargarMaquinaResumen: function (maqResumen, maq, index) {
                let datos = maqResumen.filter(e => e.CodigoClaseMaquina == maq)
                if (datos.length > 0) {
                    let template = "<span class='global_cont_cell_name'>#NAME:</span><span class='global_cont_cell_value'>#VALUE</span>"
                    let result = "";
                    for (let c of Array.from(datos[0].contadoresGlobales)) {
                        result += template.replace("#NAME", c.NombreContador).replace("#VALUE", c.Valor);
                    }
                    return "<div class='global_cont_cell'>" + result + "</div>";
                }

                return "<span></span>";
            },
            cargarMermas: async function() {
                let self = this;

                let maqs = [];
                try {
                    maqs = await self.getMaquinasMermas();
                    maqs = maqs.map(m => ({ clase: m, columna: 0 }));
                }
                catch (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_MERMAS'), 4000);
                    return;
                }

                let columns = [
                    {
                        field: "Estado",
                        title: " ",
                        template: "<img src='img/KOP_#=EstadoColor#.png'></img>",
                        width: "40px",
                        filterable: false
                    },
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        format: "{0:" + kendo.culture().calendar.patterns.MES_Fecha + "}",
                        width: "130px"
                    },
                    {
                        field: "Turno",
                        title: window.app.idioma.t("TURNO"),
                        template: "#: window.app.idioma.t('TURNO'+IdTipoTurno)#",
                        width: "90px",
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Turno#' style='width: 14px;height:14px;margin-right:5px;'/>#: window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                }
                            }
                        }
                    },
                ];

                let columnOffset = columns.length;
                let idx = 0;
                for (let m of maqs) {
                    columns.push(
                        {
                            title: window.app.idioma.t(self.constClaseMaquina[m.clase]),
                            filterable: false,
                            sortable: false,
                            template: "#=window.app.vista.cargarMaquinaResumen(MaquinasResumen, '" + m.clase + "', " + idx + ")#",
                            width: "auto"
                        }
                    );
                    m.columna = columnOffset + idx;
                    idx++;                    
                }
                
                self.gridMermas = self.$("#gridMermas").kendoGrid({
                    autoBind: false,
                    dataSource: self.dsMermas,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    selectable: false,
                    scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: kendo.template($("#templateMermas").html()),
                    detailInit: self.detailMermasInit,
                    columns: columns,
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }
                        //avisamos si se han llegado al limite de 30000 registros
                        let numItems = e.sender.dataSource.total();
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }

                        //Desplegamos el detalle del registro que acabamos de editar en su caso
                        if (self.detailsEdited.length >= 1) {
                            let item = this.dataSource._data.find(f => f.Id == self.detailsEdited[0]);
                            if (item != null) {
                                let uid = item.uid;
                                this.expandRow("tr[data-uid=" + uid + "]");
                            }
                        }

                        // Ocultamos las columnas de las clases que no estén presentes en el dataSource
                        const clasesPresentes = [...new Set(Array.from(e.sender.dataItems()).flatMap(m => m.MaquinasResumen.map(m2 => m2.CodigoClaseMaquina)))];
                        for (let m of maqs) {
                            if (clasesPresentes.includes(m.clase) || clasesPresentes.length == 0) {
                                e.sender.showColumn(m.columna);
                            } else {
                                e.sender.hideColumn(m.columna);
                            }
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            detailMermasInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;

                detailRow.find(".gridDetail").kendoGrid({
                    dataSource: {
                        transport: {
                            type: "GET",
                            read: "../api/mermas/registros/" + e.data.Id + "/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "number", editable: false, nullable: false },
                                    Maquina: { type: "string" },
                                    MaquinaDescripcion: { type: "string" },
                                    MaquinaClase: { type: "string" },
                                },
                            },
                        },
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: false,
                    detailTemplate: kendo.template($("#templateMermas2").html()),
                    detailInit: self.detailMermasInit2,
                    columns: [
                        {
                            field: "Estado",
                            title: " ",
                            template: "<img src='img/KOP_#=EstadoColor#.png'></img>",
                            width: "40px",
                            filterable: false
                        },
                        {
                            field: "CodigoMaquina",
                            title: window.app.idioma.t("MAQUINA"),
                            width: 150,
                        },
                        {
                            field: "MaquinaDescripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 200,
                        },
                        {
                            field: "MaquinaClase",
                            title: window.app.idioma.t("CLASE"),
                            width: 120,
                            template: "#=window.app.idioma.t(MaquinaClase)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=window.app.idioma.t(MaquinaClase)#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t(MaquinaClase)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Proveedor",
                            title: window.app.idioma.t("PROVEEDOR"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Proveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proveedor #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "WO",
                            title: "WO",
                            width: 180,
                        },
                        {
                            field: "IdProducto",
                            title: window.app.idioma.t("PRODUCTO"),
                            template: "#:IdProducto ? IdProducto : ''#",
                            width: 150
                        },
                        {
                            field: "DescripcionProducto",
                            title: window.app.idioma.t("DESCRIPCION_PRODUCTO"),
                            width: 250,
                            filterable: false
                        },
                        {
                            field: "Observaciones",
                            title: window.app.idioma.t("Observaciones"),
                            template: "<div class='addTooltip truncated-text-cell'>#= Observaciones?.replace(/\\n/g, '<br>') || ''#</div>",
                            width: 150,
                            filterable: false
                        },
                        {
                            command: {
                                name: "editarMerma",
                                text: "",
                                template: "<a class='k-button k-grid-edit k-grid-editarMerma' data-role='edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>",
                                click: self.editarMerma
                            }, title: " ", width: "53px"
                        },
                        {
                            command: {
                                name: "eliminarMerma",
                                text: "",
                                template: "<a class='k-button k-grid-delete k-grid-eliminarMerma' data-role='delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>",
                                click: self.eliminarMerma
                            }, title: " ", width: "53px"
                        }
                    ],
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }
                        //Desplegamos el detalle del registro que acabamos de editar en su caso
                        if (self.detailsEdited.length >= 2) {
                            let item = this.dataSource._data.find(f => f.Id == self.detailsEdited[1]);
                            if (item != null) {
                                let uid = item.uid;
                                this.expandRow("tr[data-uid=" + uid + "]");
                            }
                        }
                        self.detailsEdited = [];

                        $(".gridDetail").kendoTooltip({
                            filter: ".addTooltip",
                            width: "200px",
                            show: function (e) {
                                e.sender.popup.element.addClass('multiline-tooltip');
                            },
                            content: function (e) {
                                return e.target.html();
                            }
                        })
                    }
                });
            },
            integerTextBox: function (container, options) {
                const self = window.app.vista;
                return self.integerTextBoxConfig(container, options, { min: 0 });
            },
            integerTextBoxOrden: function (container, options) {
                const self = window.app.vista;
                return self.integerTextBoxConfig(container, options, { min: 3 });
            },
            integerTextBoxConfig: function (container, options, config) {
                $('<input name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoNumericTextBox({
                        decimals: 0,
                        restrictDecimals: true,
                        format: "n0",
                        min: config?.min || 0
                    })
            },
            claseEnvaseEditor: function (container, options) {
                const self = window.app.vista;
                let claseEnvaseDatasource = new Array();
                for (let p in self.constClaseEnvase) {
                    claseEnvaseDatasource.push({ id: p, descripcion: self.constClaseEnvase[p] })
                }

                $('<input name="' + options.field + '"/>')
                .appendTo(container)
                .kendoDropDownList({
                    dataValueField: "id",
                    dataTextField: "descripcion",
                    dataSource: new kendo.data.DataSource({
                        data: claseEnvaseDatasource
                    }),
                    value: options.model.ClaseEnvase
                });
            },
            detailMermasInit2: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;

                detailRow.find(".gridDetail2").kendoGrid({
                    dataSource: {
                        transport: {
                            type: "GET",
                            read: "../api/mermas/contadores/" + e.data.Id + "/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "int", editable: false, nullable: false },
                                    Descripcion: { type: "string", editable: false, from: "ContadorConfiguracion.Descripcion" },
                                    Valor: { type: "number" },
                                    Unidad: { type: "string" },
                                    PorcentajeMinimo: { type: "number", editable: false, from: "ContadorConfiguracion.PorcentajeMinimo" },
                                    PorcentajeMaximo: { type: "number", editable: false, from: "ContadorConfiguracion.PorcentajeMaximo" },
                                    Justificacion: { type: "string" },
                                    EsContadorProduccion: { type: "boolean", editable: false, from: "ContadorConfiguracion.EsContadorProduccion" },
                                    EsContadorProduccionStr: { type: "string", editable: false, from: "ContadorConfiguracion.EsContadorProduccionStr"},
                                    RechazoTotal: { type: "boolean", editable: false, from: "ContadorConfiguracion.RechazoTotal"},
                                    RechazoTotalStr: { type: "string", editable: false, from: "ContadorConfiguracion.RechazoTotalStr" },
                                    Porcentaje: { type: "number", editable: false }
                                },
                            },
                        },
                    },
                    filterable: false,
                    scrollable: true,
                    sortable: false,
                    pageable: false,
                    editable: "inline",
                    save: self.editarContador,
                    columns: [
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 200,
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR"),
                            attributes: {
                                style: "color: #=(Estado == 3 ? 'red' : Estado == 2 ? 'orange' : 'green' )#; font-weight:bold"
                            },
                            width: 100,
                            editor: self.integerTextBox
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 120,
                        },
                        {
                            field: "Porcentaje",
                            title: window.app.idioma.t("PORCENTAJE"),
                            template: "#= Estado == 0 ? '' : kendo.format('{0:n3} %', Porcentaje) #",
                            attributes: {
                                style: "color: #=(Estado == 3 ? 'red' : Estado == 2 ? 'orange' : 'green' )#; font-weight:bold"
                            },
                            width: 100,
                        },
                        //{
                        //    field: "EsContadorProduccionStr",
                        //    title: window.app.idioma.t("CONTADOR_PRODUCCION"),
                        //    template: "#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                        //    width: 150,
                        //},
                        {
                            field: "PorcentajeMinimo",
                            title: window.app.idioma.t("PORCENTAJE_MINIMO_ABV"),
                            template: "#= (EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMinimo)) #",
                            width: 85,
                        },
                        {
                            field: "PorcentajeMaximo",
                            title: window.app.idioma.t("PORCENTAJE_MAXIMO_ABV"),
                            template: "#= (EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMaximo)) #",
                            width: 85,
                        },
                        {
                            field: "Justificacion",
                            title: window.app.idioma.t("JUSTIFICACION"),
                            //width: 100,
                        },
                        {
                            command: {
                                name: "edit",
                                text: { edit: "", cancel: "", update: "" }
                            },
                            width: 80,
                        }
                    ],
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }
                        var grid = e.sender;
                        var items = Array.from(grid.dataSource.view());

                        for (var i of items) {
                            rowColor(grid, i);
                        }
                    },
                    edit: function (e) {
                        var grid = this;
                        // Detectar si ya hay una fila en edición
                        if (grid.lastEditedRow && grid.lastEditedRow !== e.container) {
                            // Llama al proceso de personalizado
                            rowColor(grid, grid.lastEditedItem);
                        }
                        grid.lastEditedRow = e.container; // Guarda la nueva fila editada
                        grid.lastEditedItem = e.model; // Guarda el modelo de la fila editada
                    },
                    cancel: function (e) {
                        var grid = this;
                        var item = e.model;

                        rowColor(grid, item);

                        grid.lastEditedRow = null; // Guarda la nueva fila editada
                        grid.lastEditedItem = null; // Guarda el modelo de la fila editada
                    }
                });                

                function rowColor(grid, item) {                    

                    setTimeout(() => {
                        var row = grid?.table.find(`tr[data-uid='${item.uid}']`);
                        if (item.EsContadorProduccion || item.RechazoTotal) {
                            if (row) {
                                row.removeClass("contador-produccion");
                                row.removeClass("contador-rechazo");
                                if (item.EsContadorProduccion) {
                                    row.addClass("contador-produccion");
                                    row.attr("title", window.app.idioma.t("CONTADOR_PRODUCCION"))
                                } else {
                                    row.addClass("contador-rechazo");
                                    row.attr("title", window.app.idioma.t("CONTADOR_RECHAZO"))
                                }
                            }
                        };
                        // Para que no aparezca el title de la fila en los botones de acción, puede inducir error
                        $(".gridDetail2 a.k-grid-edit").attr("title", "");
                    })                    
                }
            },
            detailMaquinasContadoresMermasInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;
                const dataSource = new kendo.data.DataSource({
                    transport: {
                        read: function (o) {
                            o.success(e.data.Contadores.map(m => ({
                                Id: parseInt(m.IdMaquina + '' + m.IdMaestroContador),
                                IdMaquina: m.IdMaquina,
                                IdMaestroContador: m.IdMaestroContador,
                                Descripcion: m.Descripcion,
                                Orden: m.Orden,
                                Incluido: m.Incluido,
                                PorcentajeMaximo: m.PorcentajeMaximo,
                                PorcentajeMinimo: m.PorcentajeMinimo,
                                RechazoTotal: m.RechazoTotal,
                                EsContadorProduccion: m.EsContadorProduccion,
                                ClaseEnvase: m.ClaseEnvase
                            })
                            ))
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "number", editable: false },
                                Incluido: { type: "boolean" },
                                Orden: { type: "number", editable: false },
                                Descripcion: { type: "string", editable: false },
                                PorcentajeMaximo: { type: "number" },
                                PorcentajeMinimo: { type: "number" },
                                EsContadorGlobal: { type: "boolean", editable: false },
                                EsContadorGlobalStr: { type: "string", editable: false},
                                RechazoTotal: { type: "boolean", editable: false},
                                RechazoTotalStr: { type: "string", editable: false },
                                EsContadorProduccion: { type: "boolean", editable: false },
                                EsContadorProduccionStr: { type: "string", editable: false },                                
                            }
                        },
                    },
                });

                function n3NumericEditor(container, options) {
                    $('<input data-bind="value:' + options.field + '"/>')
                        .appendTo(container)
                        .kendoNumericTextBox({
                            format: "n3",       // Formato con 3 decimales
                            decimals: 3,        // Permitir 3 decimales
                            step: 0.001,        // Incremento mínimo
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });
                }

                detailRow.find(".gridDetailMaquinasContadores").kendoGrid({
                    dataSource: dataSource,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: false,
                    editable: "inline",
                    save: self.editarMaquinaContador,
                    columns: [
                        {
                            field: "Incluido",
                            title: " ",
                            template: "<input class='disabled-cb' type='checkbox' #: Incluido ? 'checked' : '' #/>",                            
                            width: "40px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Incluido#' style='width: 14px;height:14px;margin-right:5px;'/>#= (Incluido ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                        },
                        {
                            field: "Orden",
                            title: window.app.idioma.t("ORDEN"),
                            editor: self.integerTextBoxOrden
                        },
                        {
                            field: "ClaseEnvase",
                            title: window.app.idioma.t("TIPO_ENVASE"),
                            template: "<span>#: window.app.vista.constClaseEnvase[ClaseEnvase] #</span>",
                            editor: self.claseEnvaseEditor,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ClaseEnvase#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.vista.constClaseEnvase[ClaseEnvase] #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EsContadorProduccionStr",
                            title: window.app.idioma.t("CONTADOR_PRODUCCION"),
                            template: "#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EsContadorProduccionStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "RechazoTotalStr",
                            title: window.app.idioma.t("CONTADOR_RECHAZO"),
                            template: "#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=RechazoTotalStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "PorcentajeMinimo",
                            title: window.app.idioma.t("PORCENTAJE_MINIMO"),
                            template: "#=(EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMinimo))#",
                            editor: n3NumericEditor,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n3}",
                                        decimals: 3,
                                        step: 0.001,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PorcentajeMaximo",
                            title: window.app.idioma.t("PORCENTAJE_MAXIMO"),
                            template: "#=(EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMaximo))#",
                            editor: n3NumericEditor,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n3}",
                                        decimals: 3,
                                        step: 0.001,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            command: {
                                name: "edit",
                                text: { edit: "", cancel: "", update: "" },                                
                            },
                            width: 80,
                        }
                    ],
                    edit: function (e) {
                        var grid = this;

                        const condEditableFields = ["Incluido", "Orden"];
                        const editable = !e.model.EsContadorProduccion && !e.model.RechazoTotal;
                        
                        e.container.find("input[name]").each((idx, elem) => {
                            const name = $(elem).attr("name");
                            const widget = kendo.widgetInstance($(elem));
                            if (!editable && condEditableFields.includes(name)) {
                                if (widget) {
                                    widget.enable(false);
                                    if (e.model.Orden < 3) {
                                        widget.min(0);
                                        widget.value(e.model.Orden);
                                    }
                                } else {
                                    $(elem).attr("disabled", "disabled");
                                }
                            }
                        })
                    },
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }
                        var grid = this;
                        var data = this._data;

                        for (let d of data) {
                            var currentUid = d.uid;
                            if (d.EsContadorProduccion) {
                                var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currentRow).find(".k-grid-edit");
                                editButton.hide();
                            }
                        }
                        //Desplegamos el detalle del registro que acabamos de editar en su caso
                        if (self.detailsEdited.length >= 2) {
                            let item = this.dataSource._data.find(f => f.Id == self.detailsEdited[1]);
                            if (item != null) {
                                let uid = item.uid;
                                this.expandRow("tr[data-uid=" + uid + "]");
                            }
                        }
                        self.detailsEdited = [];

                    //    $(".gridDetail").kendoTooltip({
                    //        filter: ".addTooltip",
                    //        width: "200px",
                    //        content: function (e) {
                    //            return e.target.html();
                    //        }
                    //    })
                    }
                });
            },
            editarMerma: function (e) {
                e.preventDefault();
                let data = this.dataItem($(e.target).closest("tr"));

                window.app.vista.AbrirModalEditarMerma(e, data);
            },
            eliminarMerma: function (e) {
                e.preventDefault();
                let data = this.dataItem($(e.target).closest("tr"));

                window.app.vista.AbrirModalEliminarMerma(e, data);
            },
            editarContador: function (e) {
                let self = window.app.vista;
                e.preventDefault();

                if (e.model.Valor == null || e.model.Valor === "" || !e.model.Unidad) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('RELLENAR_CAMPOS_EDITAR_CONTADOR_MERMAS'), 4000);
                    return;
                }

                let uids = $("tr[data-uid=" + e.model.uid + "]").parents("tr.k-detail-row").prev();

                self.detailsEdited = [];

                uids.each(function (idx) {
                    let uid = $(this).attr("data-uid");
                    let dataItem = $($(this).parents(".k-grid").get(0)).getKendoGrid().dataSource._data.find(e => e.uid == uid)

                    self.detailsEdited.unshift(dataItem.Id);
                })

                $.ajax({
                    type: "PUT",
                    url: "../api/Mermas/contadores/"+ e.model.Id +"/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(e.model),
                    success: function (res) {
                        if (res) {
                            self.actualizaMermas();
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_CONTADOR_MERMAS'), 4000);
                        }
                    }
                });
            },
            editarMaquinaContador: function (e) {
                let self = window.app.vista;
                e.preventDefault();

                const incluido = e.model.Incluido || false;
                //const orden = Math.max(e.model.Orden || 0, 0);
                //const esProduccion = e.model.EsContadorProduccion;
                //const esRechazo = e.model.RechazoTotal;
                const claseEnvase = e.model.ClaseEnvase;
                const porcentajeMinimo = Math.max(e.model.PorcentajeMinimo || 0, 0);
                const porcentajeMaximo = Math.max(e.model.PorcentajeMaximo || 0, 0);

                if (!claseEnvase || !porcentajeMinimo || !porcentajeMaximo) {//|| !orden || (!esProduccion && (!porcentajeMinimo || !porcentajeMaximo))) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPOS_OBLIGATORIOS'), 4000);
                    return;
                }

                let uids = $("tr[data-uid=" + e.model.uid + "]").parents("tr.k-detail-row").prev();

                self.detailsEdited = [];

                uids.each(function (idx) {
                    let uid = $(this).attr("data-uid");
                    let dataItem = $($(this).parents(".k-grid").get(0)).getKendoGrid().dataSource._data.find(e => e.uid == uid)

                    self.detailsEdited.unshift(dataItem.IdMaquina);
                })

                const data = {
                    Id: e.model.Id,
                    ClaseEnvase: claseEnvase,
                    IdMaestroContador: e.model.IdMaestroContador,
                    IdMaquina: e.model.IdMaquina,
                    Incluido: incluido,
                    PorcentajeMinimo: porcentajeMinimo,
                    PorcentajeMaximo: porcentajeMaximo
                }

                $.ajax({
                    type: "PUT",
                    url: "../api/Mermas/MaquinasContadores",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function (res) {
                        if (res) {
                            self.actualizaMaquinasContadores();
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_CONTADOR_MAQUINA_MERMAS'), 4000);
                        }
                    }
                });
            },
            cargarConfiguracionContadores: function () {
                let self = this;

                self.gridContadores = self.$("#gridContadoresMermas").kendoGrid({
                    dataSource: self.dsContadores,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    groupable: {
                        messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') },
                        sort: {
                            dir: "desc",
                            compare: function (a, b) {
                                return b.localeCompare(a)
                            }
                        }
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "ClaseMaquina",
                            title: window.app.idioma.t("CLASE_MAQUINA"),
                            template: "#= window.app.idioma.t(ClaseMaquina)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ClaseMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t(ClaseMaquina) #</label></div>";
                                    }
                                }
                            },
                            groupHeaderTemplate: "#= window.app.idioma.t('CLASE_MAQUINA') + ': ' + window.app.idioma.t(value)+' ('+window.app.vista.obtenerSiglasClaseMaquina(value)+')' #" +
                                "<a class='k-button k-button-icontext k-grid-edit' data-role='edit' onclick='window.app.vista.AbrirModalEditarContadoresClase(event, \"#=value#\")'><span class='k-icon k-edit'></span></a>"
                            //groupHeaderTemplate: "#= `${window.app.idioma.t('CLASE_MAQUINA')}` #"
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            groupable: false
                        },
                        {
                            field: "Orden",
                            title: window.app.idioma.t("ORDEN"),
                            groupable: false
                        },
                        {
                            field: "ClaseEnvase",
                            title: window.app.idioma.t("TIPO_ENVASE"),
                            template: "<span>#: window.app.vista.constClaseEnvase[ClaseEnvase] #</span>",
                            editor: self.claseEnvaseEditor,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ClaseEnvase#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.vista.constClaseEnvase[ClaseEnvase] #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EsContadorProduccionStr",
                            title: window.app.idioma.t("CONTADOR_PRODUCCION"),
                            template: "#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            groupable: false,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EsContadorProduccionStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "RechazoTotalStr",
                            title: window.app.idioma.t("CONTADOR_RECHAZO"),
                            template: "#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            groupable: false,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=RechazoTotalStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoGlobal",
                            title: window.app.idioma.t("TIPO_GLOBAL"),
                            template: "#=(!TipoGlobalNombre ? '' : TipoGlobalNombre)#",
                            groupable: false
                        },
                        {
                            field: "PorcentajeMinimo",
                            title: window.app.idioma.t("PORCENTAJE_MINIMO"),
                            template: "#=(EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMinimo))#",
                            groupable: false,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n3}",
                                        decimals: 3,
                                        step: 0.001,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PorcentajeMaximo",
                            title: window.app.idioma.t("PORCENTAJE_MAXIMO"),
                            template: "#=(EsContadorProduccion ? '' : kendo.format('{0:n3}', PorcentajeMaximo))#",
                            groupable: false,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n3}",
                                        decimals: 3,
                                        step: 0.001,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }
                        //avisamos si se han llegado al limite de 30000 registros
                        var numItems = e.sender.dataSource.total();
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }

                        // Ocultamos el div de agrupamientos para que no pueda cancelarse
                        e.sender.wrapper.find(".k-grouping-header").hide();
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            cargarMaquinasContadores: function () {
                let self = this;

                self.gridMaquinasContadores = self.$("#gridMaquinasContadoresMermas").kendoGrid({
                    dataSource: self.dsMaquinasContadores,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: kendo.template($("#templateMaquinasContadoresMermas").html()),
                    detailInit: self.detailMaquinasContadoresMermasInit,
                    columns: [
                        {
                            field: "IdMaquina",
                            title: window.app.idioma.t("CODIGO_MAQUINA"),
                            template: "<span>#:CodigoMaquina#</span>",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= CodigoMaquina #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaquina",
                            title: window.app.idioma.t("MAQUINA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaquina #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "ClaseMaquina",
                            title: window.app.idioma.t("CLASE_MAQUINA"),
                            template: "#= window.app.idioma.t(ClaseMaquina) || ''#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ClaseMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t(ClaseMaquina) #</label></div>";
                                    }
                                }
                            }
                        }
                    ],
                    dataBound: function (e) {
                        if (this.dirtyDatabound) {
                            return;
                        }

                        //avisamos si se han llegado al limite de 30000 registros
                        var numItems = e.sender.dataSource.total();
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }

                        //Desplegamos el detalle del registro que acabamos de editar en su caso
                        if (self.detailsEdited.length >= 1) {
                            let item = this.dataSource._data.find(f => f.IdMaquina == self.detailsEdited[0]);
                            if (item != null) {
                                let uid = item.uid;
                                this.expandRow("tr[data-uid=" + uid + "]");
                            }                            
                        }

                        self.detailsEdited = [];
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            actualizaMermas: function () {
                let self = this;

                RecargarGrid({ grid: self.gridMermas });

            },
            actualizaMaquinasContadores: function () {
                let self = this;

                RecargarGrid({ grid: self.gridMaquinasContadores });

            },
            actualizaContadores: function () {
                let self = this;

                RecargarGrid({ grid: self.gridContadores, options: { group: self.dsContadores.group() } });

            },
            actualiza: function () {
                let self = this;

                // Cada función actualiza el grid de una pestaña distinta: 1 Pestaña Mermas, 2 Pestaña Configuración contadores
                self.actualizaMermas();
                self.actualizaMaquinasContadores();
                self.actualizaContadores();
            },
            onTabShow: function (e) {
                let self = window.app.vista;

                if (self) {
                    self.tabSelect = $(e.item).data("id");
                    self.resizeGrid();
                }
            },
            render: function () {
                let self = this;

                DestruirKendoWidgets(self);

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                this.tab = util.ui.createTabStrip('#divPestanias', {show: self.onTabShow});

                //Cargamos combos
                this.$("#selectLinea").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#selectLinea2").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: kendo.culture().name
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: kendo.culture().name
                });

                self.cargarMermas();
                self.cargarMaquinasContadores();
                self.cargarConfiguracionContadores();

                util.ui.enableResizeCenterPane();
            },
            LimpiarFiltroGridMermas: function () {
                var self = this;

                self.dsMermas.query({
                    page: 1,
                    pageSize: self.dsMermas.pageSize(),
                    sort: [],
                    filter: []
                });
            },
            LimpiarFiltroGridMaquinasContadores: function () {
                var self = this;

                self.dsMaquinasContadores.query({
                    page: 1,
                    pageSize: self.dsMaquinasContadores.pageSize(),
                    sort: [],
                    filter: []
                });
            },
            LimpiarFiltroGridContadores: function () {
                var self = this;

                self.dsContadores.query({
                    page: 1,
                    pageSize: self.dsContadores.pageSize(),
                    sort: [],
                    filter: []
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
            resizeGrid: function (e) {
                let self = window.app.vista;

                let contenedorHeight = $("#center-pane").innerHeight();
                let cabeceraHeight = $("#divCabeceraVista").innerHeight();
                let tabsHeight = $(".k-tabstrip-items").innerHeight();

                let tabElements = [$("#divPestanias-1"), $("#divPestanias-2"), $("#divPestanias-3")];
                let tabElement = tabElements[self.tabSelect - 1];

                if (tabElement) {
                    let filtrosHeight = tabElement.find(".k-header:first").innerHeight();
                    let gridElement = tabElement.find("[data-role='grid']:first"),
                        dataArea = gridElement.find(".k-grid-content:first"),
                        gridHeight = gridElement.innerHeight(),
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;

                    otherElements.each(function () {
                        otherElementsHeight += $(this).outerHeight();
                    });
                    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - tabsHeight - filtrosHeight - 2);
                }

            },
            events: {
                'click #btnLimpiarFiltrosMermas': 'LimpiarFiltroGridMermas',
                'click #btnLimpiarFiltrosMaquinasContadores': 'LimpiarFiltroGridMaquinasContadores',
                'click #btnLimpiarFiltrosContadores': 'LimpiarFiltroGridContadores',
                'click #btnFiltrarMermas': 'actualizaMermas',
                'click #btnFiltrarMaquinasContadores': 'actualizaMaquinasContadores',
                'click #btnFiltrarContadores': 'actualizaContadores',
                'click #btnAnadirMermas': 'AbrirModalAnadir',
                'click #btnAnadirMaquinasContadores': 'AbrirModalAnadirMaquinaContador',
                'click #btnAnadirContadores': 'AbrirModalAnadir',
                'click #btnEliminarMaquinasContadores': 'AbrirModalEliminarMaquinaContador',
                'click #btnEliminarContadores': 'AbrirModalEliminarContador',
                'click #btnExportarExcel': 'ExportarExcel',
               
            },
            AbrirModalAnadirMaquinaContador: function (e) {
                const self = this;

                $("body").prepend($("<div id='dlgAnadirMaqCont'></div>"));
                const tmp = kendo.template($("#templateAnadirMaquinasContadoresMermas").html());
                const _tmp = tmp({});

                let ventanaAnadirMaqCont = $("#dlgAnadirMaqCont").kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_CONTADOR_MAQUINA_MERMAS'),
                        width: '900px',
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            ventanaAnadirMaqCont.destroy();
                            ventanaAnadirMaqCont = null;
                        }
                    }).getKendoWindow();

                ventanaAnadirMaqCont.content(_tmp);

                // Combo de Lineas
                $("#selectLineaMaqCont").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    value: $("#selectLinea2").getKendoDropDownList().value(),
                    change: function (e) {
                        let dropDownList = $("#cmbMaquinasContadores").getKendoDropDownList();
                        if (!dropDownList) {
                            return;
                        }
                        dropDownList.value(null);
                        dropDownList.dataSource.read();

                        RefrescarAlturaDropDownListKendo(dropDownList);
                        dropDownList.trigger("change");
                    }
                });

                $("#cmbMaquinasContadores").kendoDropDownList({
                    dataTextField: "Nombre",
                    dataValueField: "Id",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    autobind: false,
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                let dataItem = $("#selectLineaMaqCont").getKendoDropDownList().dataItem();
                                if (dataItem?.nombre && dataItem?.id) {
                                    $.ajax({
                                        url: "../api/Mermas/maquinasSinUsar",
                                        data: { IdLinea: dataItem.id },
                                        dataType: "json",
                                        contentType: "application/json; charset=utf-8",
                                        success: function (response) {
                                            operation.success(response); //mark the operation as successful
                                        },
                                        error: function (er) {
                                            operation.error(er);
                                        }
                                    });
                                }
                                else {
                                    operation.success([]);
                                }
                            }
                        },
                        schema: {
                            parse: function (response) {
                                return response.map(m => {
                                    m.Linea = m.Info[2];
                                    m.Clase = m.Info[1];
                                    m.Nombre = `${m.Valor} (${m.Info[0]})`

                                    return m;
                                })
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                            }
                        }
                    }),
                    height: 200,
                    change: function (e) {
                        const grid = $("#gridAnadirMaquinaContador").getKendoGrid();
                        grid.dataSource.read();
                    }
                });

                $("#gridAnadirMaquinaContador").kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                const clase = $("#cmbMaquinasContadores").getKendoDropDownList().dataItem()?.Clase;

                                if (clase) {
                                    $.ajax({
                                        url: "../api/Mermas/ContadoresClase",
                                        data: { clase },
                                        dataType: "json",
                                        contentType: "application/json; charset=utf-8",
                                        success: function (response) {
                                            let resMap = response.map(m => {
                                                m.Incluido = m.EsContadorProduccion || m.RechazoTotal ? true : false;
                                                m.Bloqueado = m.Incluido
                                                return m;
                                            })

                                            operation.success(resMap); //mark the operation as successful
                                        },
                                        error: function (er) {
                                            operation.error(er);
                                        }
                                    });
                                } else {
                                    operation.success([]);
                                }
                            }
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "number" },
                                    Orden: { type: "number" }
                                }
                            },
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            }                            
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CONTADORES_MERMAS'), 2000);
                            }
                        }
                    }),
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    selectable: false,
                    sortable: true,
                    resizable: true,
                    pageable: false,
                    scrollable: true,
                    height: "370px",
                    columns: [
                        {
                            title: " ",
                            field: "Incluido",
                            template: "<input class='#: (Bloqueado ? 'disabled-cb' : '') #' data-model='Incluido' type='checkbox' #: (Incluido ? 'checked' : '') #>",
                            width: "30px",
                            filterable: false
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: "Descripcion",
                            width: "240px",
                        },
                        {
                            title: window.app.idioma.t("ORDEN"),
                            field: "Orden",
                            width: "105px",
                        },
                        {
                            field: "ClaseEnvase",
                            title: window.app.idioma.t("TIPO_ENVASE"),
                            template: "<select class='selectClaseEnvase' data-model='ClaseEnvase' value='#:ClaseEnvase#' style='width:100%'></select>",
                            filterable: false,
                            width: "110px",
                        },
                        {
                            field: "EsContadorProduccionStr",
                            title: window.app.idioma.t("PRODUCCION"),
                            template: "#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            width: "118px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EsContadorProduccionStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (EsContadorProduccion ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "RechazoTotalStr",
                            title: window.app.idioma.t("RECHAZO"),
                            template: "#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #",
                            width: "105px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=RechazoTotalStr#' style='width: 14px;height:14px;margin-right:5px;'/>#= (RechazoTotal ? window.app.idioma.t('SI') : window.app.idioma.t('NO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "PorcentajeMinimo",
                            title: window.app.idioma.t("PORCENTAJE_MINIMO"),
                            filterable: false,
                            template: function (model) {
                                if (model.EsContadorProduccion) {
                                    return '';
                                }

                                return "<input type='number' min='0' class='selectPorcentajeMinimo' data-model='PorcentajeMinimo' value='" + model.PorcentajeMinimo +"' style='width: 100%;'/>"
                            },
                            width: "160px"
                        },
                        {
                            field: "PorcentajeMaximo",
                            title: window.app.idioma.t("PORCENTAJE_MAXIMO"),
                            filterable: false,
                            template: function (model) {
                                if (model.EsContadorProduccion) {
                                    return '';
                                }

                                return "<input type='number' min='0' class='selectPorcentajeMaximo' data-model='PorcentajeMaximo' value='" + model.PorcentajeMaximo + "' style='width: 100%;'/>"
                            },
                            width: "165px"
                        },
                    ],
                    dataBinding: function () {
                        if (!this.loaded) {
                            ventanaAnadirMaqCont.center().open();
                            this.loaded = true;
                        }                        
                    },
                    dataBound: function (e) {                        
                        let claseEnvaseDatasource = new Array();
                        for (let p in self.constClaseEnvase) {
                            claseEnvaseDatasource.push({ id: p, descripcion: self.constClaseEnvase[p] })
                        }

                        $(".selectClaseEnvase").each(function (idx, elem) {
                            $(this).kendoDropDownList({
                                dataValueField: "id",
                                dataTextField: "descripcion",
                                dataSource: new kendo.data.DataSource({
                                    data: claseEnvaseDatasource
                                }),
                                value: $(this).attr("value")
                            })
                        })

                        $(".selectPorcentajeMinimo, .selectPorcentajeMaximo").each(function (idx, elem) {
                            $(this).kendoNumericTextBox({
                                decimals: 3,
                                //restrictDecimals: true,
                                format: "{0:n3}",
                                min: 0,
                                step: 0.001,
                                value: parseFloat($(this).attr("value"))
                            })
                        })
                    }
                });

                $("#btnAnadirMaqContCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        ventanaAnadirMaqCont.close();
                    }
                })

                $("#btnAnadirMaqContAceptar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        // Montamos el modelo
                        const maquina = $("#cmbMaquinasContadores").getKendoDropDownList().value();
                        const contadores = [];
                        const grid = $("#gridAnadirMaquinaContador").getKendoGrid();
                        $("#gridAnadirMaquinaContador").find(".k-grid-content tr").each(function (idx, elem) {
                            const _r = $(this);
                            const dataItem = grid.dataItem(_r);
                            _r.find("[data-model]").each(function (idx2, elem2) {
                                const widget = kendo.widgetInstance($(this));
                                if (widget) {
                                    dataItem[$(this).data("model")] = widget.value();
                                } else {
                                    dataItem[$(this).data("model")] = $(this).is(":checked");
                                }
                            });
                            contadores.push(dataItem);
                        });

                        if (!maquina || !contadores.length) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPOS_OBLIGATORIOS'), 4000);
                            return;
                        }

                        const model = {
                            IdMaquina: maquina,
                            Contadores: contadores
                        }

                        const res = await self.CrearMaquinaContadorMermas(model);

                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_MAQUINAS_CONTADOR_MERMAS'), 4000);
                            ventanaAnadirMaqCont.close();
                            self.actualizaMaquinasContadores();
                        }
                        else
                        {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MAQUINAS_CONTADOR_MERMAS'), 4000);
                        }
                    }
                })
            },
            AbrirModalEliminarMaquinaContador: function (e) {
                let self = this;
                e.preventDefault();

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridMaquinasContadoresMermas").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                OpenWindow(
                    window.app.idioma.t('ELIMINAR_MAQUINA_MERMA')
                    , window.app.idioma.t('CONFIRMAR_BORRAR_MAQUINA_CONTADOR_MERMA')
                    , async function (e) {
                        const res = await self.EliminarMaquinaContador(datos);
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_MAQUINAS_CONTADOR_MERMAS'), 4000);
                            self.actualizaMermas();
                            self.actualizaMaquinasContadores();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINANDO_MAQUINAS_CONTADOR_MERMAS'), 4000);
                        }
                    });
            },
            AbrirModalAnadir: function (e) {
                let self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                self.ConfigurarModal(e, null);
            },
            AbrirModalEditarContadoresClase: function (e, clase) {
                const self = this;

                // Esta línea clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ClaseMaquina: clase };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                self.ConfigurarModal(e, datos);
            },            
            AbrirModalEliminarContador: function (e) {
                let self = this;
                e.preventDefault();

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridContadoresMermas").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                self.ConfigurarModal(e, datos);
            },
            AbrirModalEditarMerma: function (e, datos) {
                let self = window.app.vista;

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                self.ConfigurarModal(e, datos);
            },
            AbrirModalEliminarMerma: function (e, datos) {
                let self = window.app.vista;

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                self.ConfigurarModal(e, datos);
            },
            ConfigurarModal: function (e, datos) {
                let self = this;
                let role = $(e.target.closest("button,a")).data("role");

                let modo = role.includes("add") ? self.constCRUD.Crear :
                    role.includes("edit") ? self.constCRUD.Editar :
                        self.constCRUD.Eliminar;

                let title;
                let template;
                let width = "700px";
                let height = "";

                switch (modo) {
                    case self.constCRUD.Crear:
                        if (self.tabSelect == 1) {
                            // Creación de registro de Merma
                            title = window.app.idioma.t('CREAR_REGISTRO_MERMA');
                            template = "Envasado/html/CrearMerma.html";
                        } else {
                            // Creación de contador de merma
                            title = window.app.idioma.t('CREAR_CONTADOR_MERMA');
                            template = "Envasado/html/CrearEditarContadorMermas.html";
                        }
                        break;
                    case self.constCRUD.Editar:
                        if (self.tabSelect == 1) {
                            // Edición de registro de Merma
                            title = window.app.idioma.t('EDITAR_REGISTRO_MERMA');
                            template = "Envasado/html/EditarRegistroMerma.html";
                            width = "900px";
                        } else {
                            // Edición de contador de merma
                            title = window.app.idioma.t('EDITAR_CONTADOR_MERMA');
                            template = "Envasado/html/CrearEditarContadorMermas.html";
                            width = "1200px";
                        }
                        break;
                    case self.constCRUD.Eliminar:
                        width = "400px";
                        if (self.tabSelect == 1) {
                            // Elimnar registro de Merma
                            title = window.app.idioma.t('ELIMINAR_REGISTRO_MERMA');
                            template = "html/dialogoConfirmKversion.html";
                        } else {
                            // Elimnar contador de Merma
                            title = window.app.idioma.t('ELIMINAR_CONTADOR_MERMA');
                            template = "html/dialogoConfirmKversion.html";
                        }
                        break;
                }

                self.ventanaGestion = $("#dlgGestionMermas").kendoWindow(
                    {
                        title: title,
                        width: width,
                        height: height,
                        content: template,
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaGestion.destroy();
                            self.ventanaGestion = null;
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e, datos, modo);
                            if (typeof self.ventanaGestion != "undefined") {
                                self.ventanaGestion.center();
                            }
                        }
                    }).getKendoWindow();
            },
            CargaContenidoModal: function (e, datos, modo) {
                let self = this;

                $("#trError").hide();

                //Modificamos los botones aceptar y cancelar para que sean más pequeños en el portal
                $("#dlgGestionMermas").find(".boton").removeClass("boton");
                $("#dlgGestionMermas").find(".botonDialogo").removeClass("botonDialogo");

                if (modo == self.constCRUD.Crear || modo == self.constCRUD.Editar) {
                    // ****************************** CREAR / EDITAR ******************************
                    // Si existe el combo de Lineas lo configuramos
                    if ($("#cmbLinea").length > 0) {

                        $("#lblLinea").text(window.app.idioma.t('LINEA'));
                        $("#cmbLinea").kendoDropDownList({
                            dataValueField: "id",
                            template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                            valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                            dataSource: new kendo.data.DataSource({
                                data: window.app.planta.lineas,
                                sort: { field: "nombre", dir: "asc" }
                            }),
                            index: self.tabSelect == 1 ? $("#selectLinea").getKendoDropDownList().select() : $("#selectLinea2").getKendoDropDownList().select(),
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            change: function (e) {
                                let dropDownList = $("#cmbMaquina").getKendoDropDownList();
                                if (!dropDownList) {
                                    return;
                                }
                                dropDownList.value(null);
                                dropDownList.dataSource.filter({ field: "Linea", operator: "eq", value: this.value() })

                                RefrescarAlturaDropDownListKendo(dropDownList);
                                dropDownList.trigger("change");

                                // Filtramos la lista de turnos si estamos en creacion de mermas
                                if (self.tabSelect == 1) {
                                    $("#btnFiltrarTurnos").click();
                                }
                            }
                        });
                    }

                    // Si existe el combo de maquinas lo configuramos
                    if ($("#cmbMaquina").length > 0) {
                        $("#lblMaquina").text(window.app.idioma.t('MAQUINA'));
                        $("#cmbMaquina").kendoDropDownList({
                            dataTextField: "Nombre",
                            dataValueField: "Id",
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            autobind: false,
                            dataSource: new kendo.data.DataSource({
                                filter: { field: "Linea", operator: "eq", value: " " },
                                transport: {
                                    read: {
                                        url: "../api/Mermas/maquinas/",
                                        dataType: "json",
                                    }
                                },
                                schema: {
                                    parse: function (response) {
                                        return response.map(m => {
                                            m.Linea = m.Info[2];
                                            m.Clase = m.Info[1];
                                            m.Nombre = `${m.Valor} (${m.Info[0]})`

                                            return m;
                                        })
                                    }
                                },
                                error: function (e) {
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                                    }
                                }
                            }),
                            height: 200,
                            change: function (e) {
                                if ($("#tbClaseMaquina").length > 0) {
                                    let claseMaquina = window.app.idioma.t(self.constClaseMaquina[e.sender.dataItem().Clase]) || "--"
                                    $("#tbClaseMaquina").html(claseMaquina);
                                }
                            },
                            //dataBound: function (e) {
                            //    if (modo == self.constCRUD.Editar && e.sender.dataSource.total() > 0 && e.sender.value() == "") {
                            //        e.sender.dataSource.filter({ })
                            //        e.sender.value(datos.IdMaquina);
                            //        e.sender.trigger("change");
                            //    }
                            //}
                        });
                    }

                    $("#btnDialogoGestionAceptar").val(window.app.idioma.t('ACEPTAR'));

                    if (self.tabSelect == 1) {
                        // Pestaña Mermas
                        if (modo == self.constCRUD.Crear) {
                            // Crear Registro
                            $("#lblTurno").text(window.app.idioma.t('TURNO'));
                            $("#lblFechaDesdeTurnos").text(window.app.idioma.t('DESDE'));
                            $("#lblFechaHastaTurnos").text(window.app.idioma.t('HASTA'));
                            $("#btnFiltrarTurnos").html("<span class='k-icon k-i-search'></span>" + window.app.idioma.t('CONSULTAR'));

                            $("#dtpFechaDesdeTurnos").kendoDatePicker({
                                value: $("#dtpFechaDesde").data("kendoDatePicker").value(),
                                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                culture: kendo.culture().name
                            });

                            $("#dtpFechaHastaTurnos").kendoDatePicker({
                                value: $("#dtpFechaHasta").data("kendoDatePicker").value(),
                                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                culture: kendo.culture().name
                            });

                            // Grid con los turnos
                            $("#gridTurnosMermas").kendoGrid({
                                autoBind: false,
                                dataSource: new kendo.data.DataSource({
                                    transport: {
                                        read: {
                                            url: "../api/mermas/turnos/",
                                            dataType: "json",
                                            contentType: "application/json; charset=utf-8",
                                            type: "GET",
                                            data: function () {
                                                return {
                                                    linea: $("#cmbLinea").val() || 0,
                                                    fDesde: $("#dtpFechaDesdeTurnos").data("kendoDatePicker").value()?.toISOString(),
                                                    fHasta: $("#dtpFechaHastaTurnos").data("kendoDatePicker").value()?.toISOString()
                                                }
                                            }
                                        }
                                    },
                                    error: function (e) {
                                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                        }
                                        else if (e.xhr.status == '405') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                                        }
                                        else if (e.xhr.status == '406') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                                        }
                                        else {
                                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_MERMAS'), 2000);
                                        }
                                    }
                                }),
                                filterable: {
                                    extra: false,
                                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                                },
                                scrollable: true,
                                selectable: true,
                                sortable: true,
                                height: 300,
                                dataBound: function (e) {
                                    $("#idTurno").val(null);
                                },
                                change: function (e) {
                                    let dataItem = this.dataItem(this.select());
                                    $("#idTurno").val(dataItem.idTurno);
                                    $("#idTipoTurno").val(dataItem.tipo.id);

                                    // cargamos las WO asociadas al turno
                                    let dropDownList = $("#cmbWO").getKendoDropDownList();
                                    if (!dropDownList) {
                                        return;
                                    }
                                    dropDownList.dataSource.read();
                                    RefrescarAlturaDropDownListKendo(dropDownList);
                                    dropDownList.trigger("change");
                                },
                                columns: [
                                    {
                                        title: "ID",
                                        field: "idTurno",
                                        width: 45,
                                        attributes: { style: "text-align: center;" },
                                        hidden: true
                                    },
                                    {
                                        field: "fecha",
                                        title: window.app.idioma.t('FECHA'),
                                        width: 100,
                                        filterable: {
                                            ui: function (element) {
                                                element.kendoDatePicker({
                                                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                                    //culture: localStorage.getItem("idiomaSeleccionado")
                                                });
                                            }
                                        },
                                        template: '#: kendo.toString(new Date(fecha),kendo.culture().calendars.standard.patterns.MES_Fecha)#'
                                    },
                                    {
                                        field: "tipo.id",
                                        title: window.app.idioma.t('TIPO_TURNO'),
                                        template: "#if(tipo.id){# #: window.app.idioma.t('TURNO'+tipo.id) # #}#",
                                        width: 100,
                                        filterable: {
                                            multi: true,
                                            itemTemplate: function (e) {
                                                if (e.field == "all") {
                                                    //handle the check-all checkbox template
                                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                                } else {
                                                    //handle the other checkboxes
                                                    return "<div><label><input type='checkbox' value='#=tipo.nombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+tipo.id)#</label></div>";
                                                }
                                            }
                                        }
                                    },
                                ]
                            });

                            $("#btnFiltrarTurnos").click((e) => {
                                e.preventDefault();

                                let grid = $("#gridTurnosMermas").getKendoGrid();

                                RecargarGrid({ grid })


                                // Reiniciamos el selector de WO
                                let dropDownList = $("#cmbWO").getKendoDropDownList();
                                if (!dropDownList) {
                                    return;
                                }
                                dropDownList.dataSource.read();
                                RefrescarAlturaDropDownListKendo(dropDownList);
                                dropDownList.trigger("change");
                            })

                            $("#btnDialogoGestionAceptar").kendoButton({
                                click: function () {
                                    $("#trError").hide();
                                    // Faltan campos por rellenar
                                    if (!ValidarFormulario("CrearMerma")) {
                                        $("#trError").text(ObtenerCamposObligatorios("CrearMerma"));
                                        $("#trError").show();
                                        return;
                                    }

                                    if ($("#cmbWO").getKendoDropDownList().dataSource._requestInProgress) {
                                        $("#trError").text(window.app.idioma.t("CARGANDO_DATOS"));
                                        $("#trError").show();
                                        return;
                                    }

                                    let wo = $("#cmbWO").getKendoDropDownList().dataItem();
                                    let datos = {
                                        mermaTurno: {
                                            IdTurno: parseInt($("#idTurno").val()),                                            
                                        },
                                        merma: {
                                            IdMaquina: $("#cmbMaquina").getKendoDropDownList().value(),
                                            CodigoProveedor: $("#cmbProveedor").getKendoComboBox().value(),
                                            WO: wo.id ? wo.id : "",
                                            IdProducto: wo.id ? wo.producto.codigo : 0,
                                        }
                                    };

                                    self.CrearMerma(datos);
                                }
                            });
                        }

                        if (datos != null && datos.IdTurno != null) {
                            $("#idTurno").val(datos.IdTurno);
                        }
                        
                        $("#lblWO").text(window.app.idioma.t('WO'));
                        $("#cmbWO").kendoDropDownList({
                            template: "#=data.id# | #=data.producto.codigo# | #=data.producto.nombre#",
                            valueTemplate: "#=(data.id == null ? window.app.idioma.t('SELECCIONE_WO_PRODUCTO') : data.id +' | '+ data.producto.codigo+' | '+ data.producto.nombre)#",
                            dataValueField: "id",
                            dataTextField: "id",
                            optionLabel: window.app.idioma.t('SELECCIONE_WO_PRODUCTO'),
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: function (operation) {
                                        let turnoID = parseInt($("#idTurno").val());
                                        if (!isNaN(turnoID) && turnoID) {
                                            $.ajax({
                                                url: "../api/ordenes/obtenerOrdenesTurno/" + turnoID + "/",
                                                dataType: "json",
                                                success: function (response) {                                                    
                                                    operation.success(response); //mark the operation as successful
                                                }
                                            });

                                        }
                                        else {
                                            operation.success([])
                                        }
                                    }                                    
                                },
                                error: function (e) {
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ORDENES_INTERVALO'), 4000);
                                    }
                                }
                            }),
                            height: 200,
                            dataBound: function (e) {
                                if (modo == self.constCRUD.Editar && e.sender.dataSource.total() > 0 && e.sender.value() == "") {
                                    e.sender.value(datos.WO);
                                }
                            }
                        });

                        $("#lblProveedor").text(window.app.idioma.t('PROVEEDOR'));
                        $("#cmbProveedor").kendoComboBox({
                            dataTextField: "Nombre",
                            dataValueField: "IdProveedor",
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            filter: "contains",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: "../api/mermas/proveedores/",
                                        dataType: "json",
                                    }
                                },
                                error: function (e) {
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_PROVEEDORES_MERMAS'), 4000);
                                    }
                                }
                            }),
                            height: 200,
                            dataBound: function (e) {
                                if (modo == self.constCRUD.Editar && e.sender.dataSource.total() > 0 && e.sender.value() == "") {
                                    e.sender.value(datos.CodigoProveedor);
                                }
                            }
                        });

                        if (modo == self.constCRUD.Editar) {
                            // Editar Registro Merma

                            $("#lblObservaciones").text(window.app.idioma.t('OBSERVACIONES'));
                            $("#lblMaquina").text(window.app.idioma.t('MAQUINA'));
                            $("#inputMaquina").text(datos.CodigoMaquina + " - " + datos.MaquinaDescripcion);

                            // Damos valores a los inputs con los originales
                            $("#tfObservaciones").val(datos.Observaciones);

                            // Cargamos los contadores de merma
                            $.ajax({
                                type: "GET",
                                url: "../api/Mermas/Contadores/"+datos.Id,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    // Mostramos los contadores de la merma

                                    let templateContadores = kendo.template($("#contadorMermaTemplate").html());
                                    let result = templateContadores(res); 
                                    $("#contenedorContadores").html(result);

                                    $(".contador_valor").kendoNumericTextBox({
                                        decimals: 0,
                                        restrictDecimals: true,
                                        format: "n0"
                                    });
                                },
                                error: function (e) {
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CONTADORES_MERMAS'), 4000);
                                    }
                                }
                            });

                            $("#btnDialogoGestionAceptar").kendoButton({
                                click: function () {
                                    $("#trError").hide();
                                    // Faltan campos por rellenar
                                    if (!ValidarFormulario("EditarRegistroMerma")) {
                                        $("#trError").text(ObtenerCamposObligatorios("EditarRegistroMerma"));
                                        $("#trError").show();
                                        return;
                                    }

                                    if ($("#cmbWO").getKendoDropDownList().dataSource._requestInProgress) {
                                        $("#trError").text(window.app.idioma.t("CARGANDO_DATOS"));
                                        $("#trError").show();
                                        return;
                                    }

                                    let wo = $("#cmbWO").getKendoDropDownList().dataItem();
                                    if (!wo.id) {
                                        wo = null;
                                    }

                                    datos.CodigoProveedor = $("#cmbProveedor").getKendoComboBox().value();
                                    datos.Proveedor = $("#cmbProveedor").getKendoComboBox().text();
                                    datos.Observaciones = $("#tfObservaciones").val();
                                    datos.WO = wo == null ? '' : wo.id;
                                    datos.IdProducto = wo == null ? 0 : wo.producto.codigo;
                                    datos.DescripcionProducto = wo == null ? '' : wo.producto.nombre;

                                    let contadores = [];
                                    let elems = $(".tarjetaContadorMerma");
                                    let valido = true;
                                    elems.each(function (idx, elem) {
                                        let id = $(elem).attr("contador-id");
                                        let contador = {
                                            Id: id,
                                            Valor: $("#valor_contador_"+id).getKendoNumericTextBox().value(),
                                            Unidad: $("#unidades_contador_" + id).val(),
                                            Justificacion: $("#justificacion_contador_" + id).val()
                                        };
                                        if (contador.Valor == null || contador.Unidad == "") {
                                            valido = false;
                                        }
                                        contadores.push(contador);
                                    });

                                    if (!valido) {
                                        $("#trError").text(window.app.idioma.t("RELLENAR_CAMPOS_EDITAR_CONTADOR_MERMAS"));
                                        $("#trError").show();
                                        return;
                                    }

                                    for (let c of contadores) {
                                        let C = datos.Contadores.find(f => f.Id == c.Id);
                                        if (C) {
                                            C.Valor = c.Valor;
                                            C.Unidad = c.Unidad;
                                            C.Justificacion = c.Justificacion
                                        }
                                    }

                                    self.EditarRegistroMermas(datos);
                                }
                            });
                        }

                    } else if (self.tabSelect == 3) {
                        // Pestaña Configuracion contadores
                        $("#lblClase").text(window.app.idioma.t('CLASE_MAQUINA')+':');
                        $("#lblContadores").text(window.app.idioma.t('CONTADORES'));
                        $("#btnAnadirContador").append(window.app.idioma.t('ANADIR'));
                        $("#btnAnadirTipoGlobal").append(window.app.idioma.t('CREAR_TIPO_GLOBAL'));

                        if (modo == self.constCRUD.Crear) {
                            // TODO Cambiar si se decide permitir crear contadores
                            // Creación de nueva contador

                            $("#btnDialogoGestionAceptar").kendoButton({
                                click: function () {
                                    $("#trError").hide();
                                    // Faltan campos por rellenar
                                    if (!ValidarFormulario("CrearEditarContadorMermas")) {
                                        $("#trError").text(ObtenerCamposObligatorios("CrearEditarContadorMermas"));
                                        $("#trError").show();
                                        return;
                                    }

                                    let datos = {};
                                    datos.Linea = $("#cmbLinea").getKendoDropDownList().value();
                                    datos.IdMaquina = $("#cmbMaquina").getKendoDropDownList().value();
                                    datos.Descripcion = $("#tfDescripcion").val();
                                    datos.TipoGlobal = $("#cmbTipoGlobal").getKendoDropDownList().value() ? 
                                        $("#cmbTipoGlobal").getKendoDropDownList().value() : null;
                                    datos.PorcentajeMinimo = $("#tbPorcentajeMinimo").getKendoNumericTextBox().value();
                                    datos.PorcentajeMaximo = $("#tbPorcentajeMaximo").getKendoNumericTextBox().value();
                                    datos.CapturaAutomatica = $("#cmbTipoCaptura").getKendoDropDownList().value() == 1;
                                    datos.ClaseEnvase = $("#cmbClaseEnvase").getKendoDropDownList().value();
                                    datos.Orden = $("#tbOrden").getKendoNumericTextBox().value();
                                    datos.EsContadorProduccion = $("#cbContadorProduccion")[0].checked;
                                    datos.RechazoTotal = $("#cbContadorRechazo")[0].checked;

                                    self.CrearContadorMermas(datos);
                                }
                            });
                        } else if (modo == self.constCRUD.Editar) {
                            // Edición de contador merma

                            // Cargamos los contadores de la clase de maquina
                            $("#lblClaseMaquina").html(window.app.idioma.t(datos.ClaseMaquina));
                            $("#btnAnadirContador").kendoButton({
                                click: function (e) {
                                    e.preventDefault();
                                    const grid = $("#gridContadoresEdit").getKendoGrid();
                                    const dataItem = Array.from(grid.dataSource.data()).reduce((a, b) => a.Orden > b.Orden ? a : b);
                                    const newItem = { ...dataItem };
                                    newItem.IdMaestroContador = 0;
                                    newItem.Descripcion = "";
                                    newItem.ClaseEnvase = "VAC";
                                    newItem.TipoGlobal = null;
                                    newItem.Orden++;
                                    newItem.EsContadorProduccion = false;
                                    newItem.RechazoTotal = false;
                                    newItem.PorcentajeMinimo = 0.05;
                                    newItem.PorcentajeMaximo = 0.1;

                                    grid.dataSource.add(newItem);

                                    // Tras un breve retardo para que se renderice el nuevo registro:
                                    setTimeout(function () {
                                        var gridContent = grid.element.find(".k-grid-content");
                                        gridContent.animate({ scrollTop: gridContent[0].scrollHeight }, 500);
                                    }, 0);
                                }
                            })

                            self.$("[data-funcion]").checkSecurity();
                            $("#btnAnadirTipoGlobal").kendoButton({
                                click: function (e) {
                                    e.preventDefault();
                                    $("body").prepend($("<div id='dlgAnadirTipoGlobal'></div>"));

                                    let ventanaCrearTipoGlobal = $("#dlgAnadirTipoGlobal").kendoWindow({
                                        title: window.app.idioma.t('CREAR_TIPO_GLOBAL'),
                                        width: '300px',
                                        modal: true,
                                        resizable: false,
                                        draggable: false,
                                        scrollable: false,
                                        close: function () {
                                            ventanaCrearTipoGlobal.destroy();
                                            ventanaCrearTipoGlobal = null;
                                        }
                                    }).getKendoWindow();

                                    ventanaCrearTipoGlobal.content($("#templateAnadirTipoGlobal").html());

                                    $("#btnDlgCancelar").kendoButton({
                                        click: function (e) {
                                            e.preventDefault();
                                            ventanaCrearTipoGlobal.close();
                                        }
                                    })

                                    $("#btnDlgAnadirTipoGlobal").kendoButton({
                                        click: async function (e) {
                                            e.preventDefault();

                                            const nombreGlobal = $("#btnCrearTipoGlobal").val();
                                            if (nombreGlobal) {
                                                try {
                                                    await self.CrearTipoGlobalMermas(nombreGlobal);
                                                    $("select.selectTipoGlobal").eq(0).getKendoDropDownList().dataSource.read();
                                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_TIPO_ACUMULADO_MERMA'), 4000);
                                                    ventanaCrearTipoGlobal.close();
                                                } catch (er) {
                                                    if (er.status == '403' && er.responseJSON == 'NotAuthorized') {
                                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                                    } else {
                                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREAR_CONTADOR_ACUMULADO_MERMAS'), 4000);
                                                    }
                                                }                                                
                                            } else {
                                                $("#trError").text(window.app.idioma.t('ALT_ERROR_FORM_NOMBRE'));
                                                $("#trError").show();
                                                return;
                                            }                                            
                                        }
                                    })

                                    ventanaCrearTipoGlobal.center().open();
                                }
                            });

                            $("#gridContadoresEdit").kendoGrid({
                                dataSource: new kendo.data.DataSource({
                                    transport: {
                                        read: function (operation) {
                                            const clase = self.obtenerSiglasClaseMaquina( datos.ClaseMaquina );

                                            if (clase) {
                                                $.ajax({
                                                    url: "../api/Mermas/ContadoresClase",
                                                    data: { clase },
                                                    dataType: "json",
                                                    contentType: "application/json; charset=utf-8",
                                                    success: function (response) {
                                                        let resMap = response.map(m => {
                                                            m.Bloqueado = function () {
                                                                return this.EsContadorProduccion || this.RechazoTotal ? true : false;
                                                            }

                                                            return m;
                                                        })

                                                        operation.success(resMap); //mark the operation as successful
                                                    },
                                                    error: function (er) {
                                                        operation.error(er);
                                                    }
                                                });
                                            } else {
                                                operation.success([]);
                                            }
                                        }
                                    },
                                    sort: {
                                        field: "Orden", dir: "asc"
                                    },
                                    schema: {
                                        model: {
                                            id: "Id",
                                            fields: {
                                                Id: { type: "number" },
                                                Orden: { type: "number" },
                                                EsContadorProduccion: { type: "boolean" },
                                                RechazoTotal: { type: "boolean" },
                                            }
                                        },
                                    },
                                    error: function (e) {
                                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                        }
                                        else {
                                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CONTADORES_MERMAS'), 2000);
                                        }
                                    }
                                }),
                                filterable: {
                                    extra: false,
                                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                                },
                                noRecords: {
                                    template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                                },
                                selectable: false,
                                sortable: true,
                                resizable: true,
                                pageable: false,
                                scrollable: true,
                                height: "370px",
                                columns: [
                                    {
                                        title: window.app.idioma.t("DESCRIPCION"),
                                        field: "Descripcion",
                                        template: "<input type='text' class='k-input k-textbox npt_descripcion w-100' value='#=Descripcion#'>",
                                        width: "240px",
                                    },
                                    {
                                        title: window.app.idioma.t("ORDEN"),
                                        template: "<div style='display: flex;flex-direction:row;justify-content:space-between;'><span>#=Orden#</span><img src='../../../Common/img/drag--vertical.svg' style='width:20px;opacity:0.5;cursor:move;'></div>",
                                        field: "Orden",
                                        width: "105px",
                                    },
                                    {
                                        field: "ClaseEnvase",
                                        title: window.app.idioma.t("TIPO_ENVASE"),
                                        template: "<select class='selectClaseEnvase' data-model='ClaseEnvase' value='#:ClaseEnvase#' style='width:100%'></select>",
                                        filterable: false,
                                        width: "110px",
                                    },
                                    {
                                        title: window.app.idioma.t("PRODUCCION"),
                                        field: "EsContadorProduccion",
                                        template: "<input class='cb_produccion' data-model='EsContadorProduccion' data-model2='RechazoTotal' type='checkbox' #: (EsContadorProduccion ? 'checked' : '') #>",
                                        width: "118px",
                                        filterable: { messages: { isTrue: window.app.idioma.t("SI"), isFalse: window.app.idioma.t("NO") }},
                                    },
                                    {
                                        title: window.app.idioma.t("RECHAZO"),
                                        field: "RechazoTotal",
                                        template: "<input class='cb_rechazo' data-model='RechazoTotal' data-model2='EsContadorProduccion' type='checkbox' #: (RechazoTotal ? 'checked' : '') #>",
                                        width: "105px",
                                        filterable: { messages: { isTrue: window.app.idioma.t("SI"), isFalse: window.app.idioma.t("NO") } },
                                    },
                                    {
                                        field: "TipoGlobal",
                                        title: window.app.idioma.t("TIPO_GLOBAL"),
                                        filterable: false,
                                        template: "<select class='selectTipoGlobal' data-model='TipoGlobal' value='#:TipoGlobal#' style='width:100%'></select>",
                                        width: "160px"
                                    },
                                    {
                                        field: "PorcentajeMinimo",
                                        title: window.app.idioma.t("PORCENTAJE_MINIMO"),
                                        filterable: false,
                                        template: function (model) {
                                            if (model.EsContadorProduccion) {
                                                return '';
                                            }

                                            return "<input type='number' min='0' class='selectPorcentajeMinimo' data-model='PorcentajeMinimo' value='" + model.PorcentajeMinimo + "' style='width: 100%;'/>"
                                        },
                                        width: "130px"
                                    },
                                    {
                                        field: "PorcentajeMaximo",
                                        title: window.app.idioma.t("PORCENTAJE_MAXIMO"),
                                        filterable: false,
                                        template: function (model) {
                                            if (model.EsContadorProduccion) {
                                                return '';
                                            }

                                            return "<input type='number' min='0' class='selectPorcentajeMaximo' data-model='PorcentajeMaximo' value='" + model.PorcentajeMaximo + "' style='width: 100%;'/>"
                                        },
                                        width: "130px"
                                    },
                                    {
                                        command: {
                                            name: "eliminaContadorMerma",
                                            text: "",
                                            template: "<a class='k-button k-grid-delete k-grid-eliminarMerma btn_borrarContador' data-role='delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>",
                                        }, title: " ", width: "53px"
                                    }
                                ],
                                dataBound: function (e) {
                                    const grid = this;

                                    // Deshabilitamos los botones eliminar en registros bloqueados
                                    $(".btn_borrarContador").each(function () {
                                        const uid = $(this).closest("tr").data("uid");
                                        const dataItem = grid.dataSource.getByUid(uid);
                                        if (dataItem.Bloqueado()) {
                                            $(this).hide();
                                        }
                                    })

                                    // Change del cambio descripcion
                                    $(".npt_descripcion").on("change", function (e) {
                                        const uid = $(this).closest("tr").data("uid");
                                        const dataItem = grid.dataSource.getByUid(uid);
                                        dataItem.Descripcion = $(this).val();
                                    })

                                    // Inicializa Sortable en el cuerpo de la tabla
                                    var tbody = grid.tbody;
                                    tbody.sortable({
                                        helper: function (e, tr) {
                                            // Para mantener el ancho de cada celda durante el arrastre
                                            tr.children().each(function () {
                                                $(this).width($(this).width());
                                            });
                                            return tr;
                                        },
                                        update: function (e, ui) {
                                            // Recorre cada fila en el nuevo orden y actualiza el campo 'Orden'
                                            tbody.children("tr").each(function (index) {
                                                // Obtiene el modelo correspondiente a la fila
                                                const dataItem = grid.dataSource.getByUid($(this).data("uid"));
                                                dataItem.Orden = index + 1;
                                            });
                                            grid.refresh();
                                            grid.dataSource.sort(grid.dataSource.sort());
                                        }
                                    });

                                    // Control de Producción y Rechazo (sólo dejamos que haya 1 en cada caso, y nunca el mismo registro los 2 activados)
                                    $(".cb_produccion, .cb_rechazo").on("change", function (e) {
                                        const uid = $(this).closest("tr").data("uid");
                                        const modelProp = $(this).data("model");
                                        const modelProp2 = $(this).data("model2");
                                        const data = Array.from(grid.dataSource.data());
                                        if (!grid.dataSource.getByUid(uid)[modelProp2]) {
                                            for (let d of data) {
                                                if (d.uid == uid) {
                                                    d[modelProp] = true;
                                                } else {
                                                    d[modelProp] = false;
                                                }
                                            }
                                        }                                        
                                        grid.refresh();
                                    })

                                    let claseEnvaseDatasource = new Array();
                                    for (let p in self.constClaseEnvase) {
                                        claseEnvaseDatasource.push({ id: p, descripcion: self.constClaseEnvase[p] })
                                    }

                                    $(".selectClaseEnvase").each(function (idx, elem) {
                                        $(this).kendoDropDownList({
                                            dataValueField: "id",
                                            dataTextField: "descripcion",
                                            dataSource: new kendo.data.DataSource({
                                                data: claseEnvaseDatasource
                                            }),
                                            value: $(this).attr("value"),
                                            change: function (e) {
                                                const uid = $(this.wrapper).closest("tr").data("uid");
                                                dataItem = grid.dataSource.getByUid(uid);
                                                dataItem.ClaseEnvase = this.value();
                                            }
                                        })
                                    })

                                    const tipoGlobalDs = new kendo.data.DataSource({
                                        transport: {
                                            read: {
                                                url: "../api/Mermas/ContadoresGlobales",
                                                dataType: "json",
                                            }
                                        },
                                        error: function (e) {
                                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                            } else {
                                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_CONTADORES_ACUMULADOS_MERMAS'), 4000);
                                            }
                                        }
                                    })

                                    $(".selectTipoGlobal").each(function (idx, elem) {
                                        $(this).kendoDropDownList({
                                            dataValueField: "IdContadorGlobal",
                                            dataTextField: "NombreContadorGlobal",
                                            optionLabel: window.app.idioma.t('SELECCIONE'),
                                            dataSource: tipoGlobalDs,
                                            value: $(this).attr("value"),
                                            change: function (e) {
                                                const uid = $(this.wrapper).closest("tr").data("uid");
                                                dataItem = grid.dataSource.getByUid(uid);
                                                dataItem.TipoGlobal = this.value();
                                            }
                                        });
                                    });

                                    $(".selectPorcentajeMinimo, .selectPorcentajeMaximo").each(function (idx, elem) {
                                        $(this).kendoNumericTextBox({
                                            decimals: 3,
                                            //restrictDecimals: true,
                                            format: "{0:n3}",
                                            min: 0,
                                            step: 0.001,
                                            value: parseFloat($(this).attr("value")),
                                            change: function (e) {
                                                const uid = $(this.wrapper).closest("tr").data("uid");
                                                dataItem = grid.dataSource.getByUid(uid);
                                                const modelProp = $(elem).data("model");
                                                dataItem[modelProp] = this.value();
                                            }
                                        })
                                    })

                                    $(".btn_borrarContador").on("click", function (e) {
                                        const uid = $(this).closest("tr").data("uid");

                                        OpenWindow(
                                            window.app.idioma.t('ATENCION')
                                            , window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO')
                                            , function (e2) {
                                                grid.removedRegisters = true;                                                
                                                const dataItem = grid.dataSource.getByUid(uid);
                                                grid.dataSource.remove(dataItem);

                                                const data = Array.from(grid.dataSource.data());
                                                let idx = 1;
                                                for (let d of data) {
                                                    d.Orden = idx;
                                                    idx++;
                                                }
                                                grid.refresh();
                                            });
                                    });
                                }
                            });

                            // Edición
                            $("#btnDialogoGestionAceptar").kendoButton({
                                click: async function () {
                                    $("#trError").hide();

                                    const lista = Array.from($("#gridContadoresEdit").getKendoGrid().dataSource.data());
                                    try
                                    {
                                        await self.EditarContadorMermas(lista);
                                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_EDITADO_CONFIGURACION_CONTADOR_MERMAS'), 4000);

                                        self.CancelarFormulario();
                                        self.actualizaMermas();
                                        self.actualizaMaquinasContadores();
                                        self.actualizaContadores();

                                    } catch (er)
                                    {
                                        $("#trError").html(JSON.parse(er.responseText).Message);
                                        $("#trError").show();
                                    }
                                    
                                }
                            });
                        }
                    }
                    if ($("#cmbLinea").length > 0) {
                        $("#cmbLinea").getKendoDropDownList().trigger("change");
                    }
                } else if (modo == self.constCRUD.Eliminar) {
                    // Eliminar
                    $("#btnDialogoConfirmAceptar").val(window.app.idioma.t('ACEPTAR'));

                    if (self.tabSelect == 1) {
                        // Eliminar registro merma
                        $("#msgDialogo").text(window.app.idioma.t('SEGURO_QUE_DESEA'));

                        // accion Eliminar registro merma
                        $("#btnDialogoConfirmAceptar").kendoButton({
                            click: function () {

                                self.EliminarRegistroMermas(datos);
                            }
                        });

                    } else {
                        //eliminar configuracion contador merma
                        $("#msgDialogo").html(window.app.idioma.t('CONFIRMAR_BORRAR_CONTADOR_MERMA').replace("#CLASE#", window.app.idioma.t(datos.ClaseMaquina)));

                        // accion Eliminar contador
                        $("#btnDialogoConfirmAceptar").kendoButton({
                            click: async function () {

                                try
                                {
                                    await self.EliminarContadorMermas(datos);
                                    self.actualizaContadores();
                                    self.actualizaMaquinasContadores();
                                    self.actualizaMermas();
                                    self.CancelarFormulario();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_CONFIGURACION_CONTADOR_MERMAS').replace("#CLASE#", window.app.idioma.t(datos.MaquinaClase)), 4000);

                                } catch (errMsg) {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), errMsg, 4000);
                                }
                            }
                        });
                    }
                }
                    
                $("#btnDialogoGestionCancelar,#btnDialogoConfirmCancelar").val(window.app.idioma.t('CANCELAR'));

                $("#btnDialogoGestionCancelar,#btnDialogoConfirmCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.CancelarFormulario();
                    }
                });
            },
            CancelarFormulario: function () {
                this.ventanaGestion.close();
            },
            ExportarExcel: function (e) {
                let self = this;

                // mostramos un spinner
                kendo.ui.progress($("#GestionMermasPO"), true);

                let datos = {
                    idLinea: $("#selectLinea").getKendoDropDownList().value(),
                    fechaInicio: $("#dtpFechaDesde").getKendoDatePicker().value().midday().toISOString(),
                    fechaFin: $("#dtpFechaHasta").getKendoDatePicker().value().addDays(1).midday().toISOString()
                }

                $.ajax({
                    type: "GET",
                    url: "../api/mermas/Excel",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: datos,
                    success: function (res) {

                        let sheets = [
                            {
                                title: window.app.idioma.t('MERMAS'),
                                columns: [],
                                freezePane: { colSplit: 0, rowSplit: 1 },
                                rows: []
                            },
                            {
                                title: window.app.idioma.t('CONTADORES_MAQUINAS'),
                                columns: [],
                                freezePane: { colSplit: 0, rowSplit: 1 },
                                rows: []
                            }
                        ]

                        let headerRow = {
                            type: "header",
                            cells: [
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("SEMANA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("TURNO"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("FECHA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("LINEA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("MAQUINA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("CONSUMIBLE"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("PRODUCTO"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("PRODUCCION"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("RECHAZOS"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("OBSERVACIONES"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("PROVEEDOR"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("CODIGO_RECHAZO"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("CODIGO_PRODUCTO"), colSpan: 1, rowSpan: 1 },
                                
                            ]
                        };

                        let rows = [headerRow];

                        for (let r of res.Mermas) {
                            let cells = [
                                { value: new Date(r.Fecha).getWeek() },
                                { value: r.Turno },
                                { value: new Date(r.Fecha), format: "dd/mm/yy" },
                                { value: r.Linea },
                                { value: r.Maquina },
                                { value: r.Consumible },
                                { value: r.Producto },
                                { value: r.Produccion },
                                { value: r.Rechazo },
                                { value: r.Observaciones },
                                { value: r.Proveedor },
                                { value: r.CodigoRechazo },
                                { value: r.IdProducto },                                
                            ];

                            rows.push({
                                type: "data",
                                cells: cells
                            })
                        };

                        let columns = [
                            { width: 60 },
                            { width: 70 },
                            { width: 80 },
                            { width: 60 },
                            { autoWidth: true },
                            { autoWidth: true },
                            { autoWidth: true },
                            { width: 80 },
                            { width: 80 },
                            { width: 100 },
                            { autoWidth: true },
                            { width: 100 },
                            { width: 80 },                            
                        ];

                        sheets[0].columns = columns;
                        sheets[0].rows = rows;

                        // Hoja de Contadores

                        headerRow = {
                            type: "header",
                            cells: [
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("FECHA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("TURNO"), colSpan: 1, rowSpan: 1 },                                
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("LINEA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("MAQUINA"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("CONTADOR"), colSpan: 1, rowSpan: 1 },
                                { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("VALOR"), colSpan: 1, rowSpan: 1 }
                            ]
                        };

                        rows = [headerRow];

                        for (let r of res.Contadores) {
                            const background = r.EsProduccion ? "#bccaf6" : (r.EsRechazo ? "#f7ebb7" : "");
                            let cells = [
                                { value: new Date(r.FechaTurno), format: "dd/mm/yy", background },
                                { value: r.TipoTurno, background },
                                { value: r.Linea, background },
                                { value: `${r.DescripcionMaquina} (${r.CodigoMaquina})`, background },
                                { value: r.Descripcion, background},
                                { value: r.Valor, background }
                            ];

                            rows.push({
                                type: "data",
                                cells: cells
                            })
                        };

                        columns = [
                            { width: 80 },
                            { width: 70 },                            
                            { width: 60 },
                            { autoWidth: true },
                            { autoWidth: true },
                            { width: 70 },
                        ];

                        sheets[1].columns = columns;
                        sheets[1].rows = rows;

                        let workbook = new kendo.ooxml.Workbook({
                            sheets: sheets
                        });

                        // Nombre del excel 
                        let filename = util.ui.default.gridExcelDate('MERMAS').fileName;
                        kendo.saveAs({
                            dataURI: workbook.toDataURL(),
                            fileName: filename
                        });

                        kendo.ui.progress($("#GestionMermasPO"), false);
                    },
                    error: function (e) {
                        kendo.ui.progress($("#GestionMermasPO"), false);
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_EXCEL_MERMAS'), 4000);
                        }
                    }
                });
            },
            getMaquinasMermas: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/Mermas/Maquinas/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {

                            const clases = [... new Set(res.map(m => m.Info[1]))];

                            resolve(clases);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    });
                })
            },
            obtenerClaseMaquina: function (clase) {
                let self = this;

                return window.app.idioma.t(self.constClaseMaquina[clase]) || "--";
            },
            obtenerSiglasClaseMaquina: function (clase) {
                let self = this;

                const elem = Object.entries(self.constClaseMaquina).find(f => f[1] == clase);

                if (elem) {
                    return elem[0];
                }
                else {
                    return '--';
                }
            },
            CrearMerma: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/Mermas",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid(self.gridMermas, self.dsMermas);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_MERMA'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MERMA'), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            //Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MERMA'), 4000);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.responseJSON.Message, 4000);
                        }
                    }
                });
            },
            CrearTipoGlobalMermas: async function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/Mermas/ContadoresGlobales",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(datos),
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false);
                        },
                        success: function (res) {
                            if (res) {
                                resolve();                                
                            }
                            else {
                                reject(false)
                            }
                        },
                        error: function (er) {
                            reject(er);                            
                        }
                    });
                });
            },
            CrearMaquinaContadorMermas: async function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/Mermas/MaquinasContadores",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(datos),
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false)
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                })
            },
            EliminarMaquinaContador: async function (datos) {
                kendo.ui.progress($(".k-window"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "DELETE",
                        url: "../api/Mermas/MaquinasContadores",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(datos),
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false)
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                })
            },
            CrearContadorMermas: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                $.ajax({
                    type: "POST",
                    url: "../api/mermas/ConfiguracionContadoresMermas",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                    },
                    success: function (res) {
                        if (res) {
                            self.CancelarFormulario();
                            self.actualizarGrid(self.gridContadores, self.dsContadores);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CONFIGURACION_CONTADOR_MERMAS'), 4000);
                        }
                        else
                        {
                            $("#trError").html(window.app.idioma.t('ERROR_CREANDO_CONFIGURACION_CONTADOR_MERMAS'));
                        }
                    },
                    error: function (e) {
                        $("#trError").html(e.responseJSON.Message);
                        $("#trError").show();
                    }
                });
            },
            EditarContadorMermas: async function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: "../api/mermas/ConfiguracionContadoresMermas",
                        contentType: "application/json; charset=utf-8",
                        dataType: "text",
                        data: JSON.stringify(datos),
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false)
                        },
                        success: function (res) {
                            resolve();
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                });
            },
            EliminarContadorMermas: async function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "DELETE",
                        url: "../api/mermas/ConfiguracionContadoresMermas/" + datos.ClaseMaquina,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false);
                        },
                        success: function (res) {
                            if (res) {
                                resolve();
                            }
                            else {
                                reject(window.app.idioma.t('ERROR_ELIMINANDO_CONFIGURACION_CONTADOR_MERMAS'));                                
                            }
                        },
                        error: function (e) {
                            console.log(e)
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                reject(window.app.idioma.t('AVISO_SIN_PERMISOS'));
                            } else {
                                reject(window.app.idioma.t('ERROR_ELIMINANDO_CONFIGURACION_CONTADOR_MERMAS'));
                            }
                        }
                    });
                });   
            },
            EditarRegistroMermas: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "PUT",
                    url: "../api/Mermas/Registros",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        if (res) {
                            self.detailsEdited = [];
                            self.detailsEdited.unshift(datos.IdTurnoMerma);

                            self.actualizarGrid(self.gridMermas, self.dsMermas);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_EDITADO_REGISTRO_MERMAS'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_REGISTRO_MERMAS'), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            //Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_REGISTRO_MERMAS'), 4000);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.responseJSON.Message, 4000);
                        }
                    }
                });
            },
            EliminarRegistroMermas: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "DELETE",
                    url: "../api/Mermas/Registros/" + datos.Id,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid(self.gridMermas, self.dsMermas);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_REGISTRO_MERMAS'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINANDO_REGISTRO_MERMAS'), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINANDO_REGISTRO_MERMAS'), 4000);
                        }
                    }
                });
            },
            actualizarGrid: function (grid, ds) {
                let self = this;

                grid.setDataSource(ds);
                ds.read();
            },
        });

        return vistaGestionMermasPO;
    });