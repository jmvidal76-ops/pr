define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ParosPerdidasMaquinas.html', 'jszip', 'compartido/notificaciones', 'compartido/utils'],
    function (_, Backbone, $, PlantillaParosPerdidas, JSZip, Not, Utils) {
        var VistaParosPerdidas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dia: 0,
            turno: 0,
            linea: '',
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            vistaSeleccionaCambios: null,
            template: _.template(PlantillaParosPerdidas),
            ds: null,
            linea:null,
            initialize: function (options) {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                window.JSZip = JSZip;

                splitter.bind("resize", self.resizeGrid);

                
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());

                $("#center-pane").append($(this.el));

                var filtros = []
                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                this.$("#selectLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.renderGrid();
                
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
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();


                var gridElement = $("#gridSeleccionParosPerdidasMaquinas"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid', // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                'click #btnExportExcel': 'exportExcel',
                'click  #btnFiltrar': 'actualiza'
            },
            LimpiarFiltroGrid: function () { // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridSeleccionParosPerdidasMaquinas"), true);
                setTimeout(function () {
                    var grid = $("#gridSeleccionParosPerdidasMaquinas").data("kendoGrid");
                    grid.saveAsExcel();
                }, 1000);                
            },
            actualiza: function () {
                var self = this;
                var elementLinea = $("#selectLinea").data("kendoDropDownList");
                if (elementLinea.value()) {
                    var linea = $("#selectLinea").data("kendoDropDownList").dataSource.get(elementLinea.value());
                    self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                    self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                    self.linea = linea.numLinea;

                    self.ds.filter({});
                    $("#gridSeleccionParosPerdidasMaquinas").data("kendoGrid").setDataSource(self.ds);
                    self.ds.read();
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SELECCIONE_LINEA'), 4000);
                }
            },
            renderGrid: function () {
                var self = this;

                self.ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/obtenerParosPerdidasPPAMaquinas/",// + self.inicio.getTime() + "/" + self.fin.getTime(),
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {

                            if (operation === "read") {

                                var result = {};

                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                result.linea = self.linea;
                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            //id: "Id",
                            fields: {
                                NumLinea: { type: "number" },
                                Linea: { type: "string" },
                                CodMaquina: { type: "string" },
                                IdMaquina: { type: "string" },
                                DescripcionMaquina: { type: "string" },
                                ParoMayorMenor: { type: "number" },
                                Inicio: { type: "date" },
                                Fin: { type: "date" },
                                Duracion: { type: "date" },
                                InicioTurno: { type: "date" },
                                FinTurno: { type: "date" },
                                IdTurno: { type: "number" },
                                IdTipoTurno: { type: "number" },
                                NumLineaDescripcion: { type: "string" }
                            },
                            getDuracion: function () {
                                return window.app.getDateFormat(this.Duracion);
                            },
                        },
                        parse: function (data) {
                            var stringLinea = window.app.idioma.t('LINEA');
                            for (var i = 0; i < data.length; i++) {
                                data[i].Linea = stringLinea + " " + data[i].NumLineaDescripcion + " - " + data[i].Linea;
                            }
                            return data;
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var grid = this.$("#gridSeleccionParosPerdidasMaquinas").kendoGrid({
                    excel: {
                        fileName: "ParosPerdidasMaquinas.xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.ds,
                    dataBound: function (e) {
                        //avisamos si se han llegado al limite de 30000registros
                        var numItems = e.sender.dataSource.data().length;
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    selectable: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [

                         {
                             field: "Linea",//"IdLinea"
                             title: window.app.idioma.t("LINEA"),
                             width: 130,
                             //template: "Línea #= IdLinea# - #= DescLinea#",
                             filterable: {
                                 multi: true,
                                 itemTemplate: function (e) {
                                     if (e.field == "all") {
                                         //handle the check-all checkbox template
                                         return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                     } else {
                                         //handle the other checkboxes
                                         return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                     }
                                 }
                             }
                         },
                         {
                             field: "IdMaquina",
                             title: window.app.idioma.t("COD_MAQUINA"),
                             width: 60,
                             hidden: true
                         },
                         {
                             field: "DescripcionMaquina",
                             title: window.app.idioma.t("MAQUINA"),
                             width: 90,
                             filterable: {
                                 multi: true,
                                 itemTemplate: function (e) {
                                     if (e.field == "all") {
                                         return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                     } else {
                                         return "<div><label><input type='checkbox' value='#=DescripcionMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaquina#</label></div>";
                                     }
                                 }
                             }
                         },
                         {
                             field: "Inicio", title: window.app.idioma.t("FECHA_INICIO"), width: 50,
                             format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                             filterable: {
                                 extra: true,
                                 ui: function (element) {
                                     element.kendoDatePicker({
                                         format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                         culture: localStorage.getItem("idiomaSeleccionado")
                                     });
                                 }
                             }
                         },
                         {
                             field: "IdTipoTurno",
                             template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                             title: window.app.idioma.t("TURNO"),
                             width: 50,
                             //template: "#: CodigoMaquina # - #: Maquina #"
                             filterable: {
                                 multi: true,
                                 itemTemplate: function (e) {
                                     if (e.field == "all") {
                                         //handle the check-all checkbox template
                                         return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                     } else {
                                         //handle the other checkboxes
                                         return "<div><label><input type='checkbox' value='#=IdTipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                     }
                                 }
                             }
                         }, {
                             field: "ParoMayorMenor",
                             title: window.app.idioma.t("TIPO"),
                             template: "#if(ParoMayorMenor==0){# #: window.app.idioma.t('PARO_MAYOR') # #}if(ParoMayorMenor==1){# #: window.app.idioma.t('PARO_MENOR') # #}#",
                             width: 90,
                             filterable: {
                                 multi: true,
                                 itemTemplate: function (e) {
                                     if (e.field == "all") {
                                         return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                     } else {
                                         return "<div><label><input type='checkbox' value='#=ParoMayorMenor#' style='width: 14px;height:14px;margin-right:5px;'/>#if(ParoMayorMenor==0){# #: window.app.idioma.t('PARO_MAYOR') # #}if(ParoMayorMenor==1){# #: window.app.idioma.t('PARO_MENOR') # #}#</label></div>";
                                     }
                                 }
                             }
                         },
                         {
                             field: "Duracion",
                             title: window.app.idioma.t("DURACION"),
                             width: 50,
                             format: "{0:HH:mm:ss}",
                             //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
                             filterable: {
                                 extra: false,
                                 ui: function (element) {
                                     element.kendoTimePicker({
                                         format: "HH:mm:ss",
                                         culture: localStorage.getItem("idiomaSeleccionado")
                                     });
                                 }

                             }
                         }
                         //{
                         //    field: "getDuracion()", title: "Duracion", width: 50,
                         //    //format: "{HH:mm:ss}",
                         //    filterable: {
                         //        multi: true,
                         //        itemTemplate: function (e) {
                         //            if (e.field == "all") {
                         //                //handle the check-all checkbox template
                         //                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                         //            } else {
                         //                //handle the other checkboxes
                         //                return "<div><label><input type='checkbox' value='#=getDuracion()#' style='width: 14px;height:14px;margin-right:5px;'/>#=getDuracion()#</label></div>";
                         //            }
                         //        }
                         //    }
                         //}

                    ]
                });

                var exportFlag = false;
                grid.data("kendoGrid").bind("excelExport", function (e) {
                    if (exportFlag == false) {
                        e.sender.showColumn("IdMaquina");
                        e.preventDefault();
                        exportFlag = true;

                        var columns = e.sender.columns;
                        var count = 0;

                        setTimeout(function () {
                            e.sender.saveAsExcel();
                        }, 1000);
                    } else {

                        e.sender.hideColumn("IdMaquina");

                        var sheet = e.workbook.sheets[0];

                        //jQuery.each(sheet.columns, function (index, col) {
                        //    col.width = col.width + 50;
                        //});

                        var template2 = kendo.template(this.columns[4].template);
                        var template3 = kendo.template(this.columns[5].template);

                        //sheet.rows[0].cells.splice(4, 1);
                        for (var i = 1; i < sheet.rows.length; i++) {
                            var row = sheet.rows[i];

                            var dataItem2 = {
                                IdTipoTurno: row.cells[4].value
                            };
                            row.cells[4].value = template2(dataItem2);
                            if (row.cells[5].value === 0) {
                                row.cells[5].value = "Paro Mayor";
                            }
                            if (row.cells[5].value === 1) {
                                row.cells[5].value = "Paro Menor";
                            }
                            //row.cells[3].format = "dd/MM/yy hh:mm:ss";
                            //row.cells[6].format = "hh:mm:ss";
                            row.cells[3].value = kendo.toString(row.cells[3].value, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            //row.cells[6].value = kendo.toString(row.cells[6].value, "HH:mm:ss");
                            row.cells[6].format = "[hh]:mm:ss"
                            var seconds = GetSecondsForExcel(row.cells[6].value);
                            row.cells[6].value = seconds;
                        }
                        exportFlag = false;
                        kendo.ui.progress($("#gridSeleccionParosPerdidasMaquinas"), false);
                    }
                });
                self.resizeGrid();
            },
         
        });

        return VistaParosPerdidas;
    });