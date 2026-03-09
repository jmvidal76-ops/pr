define(['underscore', 'backbone', 'jquery', 'vis', 'text!../../../Fabricacion/html/VerProgramaFabricacion.html', 'compartido/notificaciones', 'definiciones'],
    function (_, Backbone, $, vis, PlantillaVerProgFabricacion, Not, definicion) {
        var ProgFabricacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date((new Date()).getTime() + (7 * 24 * 3600 * 1000)),
            dia: new Date(),
            template: _.template(PlantillaVerProgFabricacion),
            estado: definicion.IdEstadoOrdenProgramado(),
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                var dptFechaInicio = $("#dtpFechaDesde").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio
                }).data("kendoDatePicker");

                var dptFechaFin = $("#dtpFechaHasta").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin
                }).data("kendoDatePicker");

                self.cargarGrant()
            },
            events: {
                'click #btnFiltrar': 'filtrar'
            },
            cargarGrant: function () {
                var self = this;


                self.tasksDataSource = new kendo.data.GanttDataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/GetListaOrdenesProgramaFabricacion/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST",
                            async: true
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var Fechas = {
                                    FechaInicio: self.inicio,
                                    FechaFin: self.fin
                                };
                                return JSON.stringify(Fechas);
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { from: "Id", type: "number" },
                                orderId: { from: "IdOrden", type: "number" },
                                parentId: { from: "IdPadre", type: "number", nullable: true },
                                start: { from: "FecInicio", type: "date" },
                                end: { from: "FecFin", type: "date" },
                                plannedStart: { from: "FecInicioPlan", type: "date", defaultValue: null, nullable: true },
                                plannedEnd: { from: "FecFinPlan", type: "date", defaultValue: null, nullable: true },
                                title: { from: "Descripcion", defaultValue: "", type: "string" },
                                cantidad: { from: "Cantidad", defaultValue: "", type: "number" },
                                unidad: { from: "UdMedida", defaultValue: "", type: "string" },
                                codWO: { from: "CodWO", type: "string" },
                                summary: { from: "Summary", type: "boolean" },
                                expanded: { from: "Expanded", type: "boolean", defaultValue: true }
                            }
                        }
                    },
                    error: function (ev) {
                        ev.sender.cancelChanges();
                    }

                });

                var gantt = $("#gantt").kendoGantt({
                    tooltip: {
                        visible: true,
                        template: crearTooltips
                    },
                    views: [
                        {
                            type: "day",
                            title: window.app.idioma.t('DIA'),
                        },
                        {
                            type: "week",
                            title: window.app.idioma.t('SEMANA'),
                            selected: true,
                        },
                        {
                            type: "month",
                            title: window.app.idioma.t('MES')
                        },
                        {
                            type: "year",
                            title: window.app.idioma.t('ANYO')

                        },
                    ],
                    columns: [
                        { field: "title", title: window.app.idioma.t('ORDEN'), width: 250 },
                        { field: "start", title: window.app.idioma.t('FECHA_INICIO'), format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}", width: 140 },
                        { field: "end", title: window.app.idioma.t('FECHA_FIN'), format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}", width: 140 }
                    ],
                    dataSource: self.tasksDataSource,
                    height: self.resize,
                    listWidth: 530,
                    taskTemplate: $("#task-template").html(),
                    dataBound: onDataBound,
                    editable: false,
                    resizable: true,
                    showWorkHours: false,
                    showWorkDays: false
                }).data("kendoGantt");

                $('#gantt').kendoTooltip({
                    filter: ".tooltipText",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                function onDataBound() {
                    var gantt = this;

                    gantt.element.find(".k-task").each(function (e) {
                        var dataItem = gantt.dataSource.getByUid($(this).attr("data-uid"));

                        // Colorize the task per business requirement.
                        if (dataItem.IdTipoOrden !== null) {
                            if (self.estado.Real == dataItem.IdTipoOrden) {

                                if (dataItem.end) {
                                    this.style.backgroundColor = "#3B87F5";
                                } else {
                                    this.style.width = "auto";
                                    this.style.backgroundColor = "#5FEC13";
                                }
                            } else {
                                this.style.backgroundColor = "#E5E73C";
                                if (!dataItem.end) {
                                    this.style.width = "10em";
                                }
                            }
                        } else {
                            this.style.backgroundColor = "grey";
                        }

                    });
                }

                function crearTooltips(e) {

                    var cadena = "<div id='idTooltip'>";
                    if (e.task.IdMaterial !== "") {
                        var cadenaConcatenada = e.task.IdMaterial + "  " + e.task.DescMaterial;
                        if (cadenaConcatenada.length > 50) {
                            cadena = "<div id='idTooltip2'>";
                        } else if (cadenaConcatenada.length > 60) {
                            cadena = "<div id='idTooltip3'>";
                        }
                        if (e.task.codWO) {
                            cadena += "<span id='idTitulo' class='subTooltips'><b>" + e.task.codWO + "</b></span>";
                            cadena += "<br><span id='idSubTitulo' class='subTooltips'>" + e.task.IdMaterial + "  " + e.task.DescMaterial + "</span>";
                            if (e.task.cantidad) {
                                cadena += "<br> <span id='idCantidad' class='subTooltips'>" + window.app.idioma.t('CANTIDAD') + ": " + parseFloat(e.task.cantidad).toFixed(2) + " " + e.task.unidad + "</span>";
                            }
                            if (e.task.start) {
                                cadena += "<br><span id='idInicio' class='subTooltips'>" + window.app.idioma.t('INICIO') + ": " + kendo.toString(kendo.parseDate(e.task.start), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                            }
                            if (e.task.end) {
                                cadena += "<br><span id='idFin' class='subTooltips'>" + window.app.idioma.t('FIN') + ": " + kendo.toString(kendo.parseDate(e.task.end), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                            }

                        } else {
                            cadena += "<span id='idTitulo'><b>" + e.task.IdMaterial + "  " + e.task.DescMaterial + "</b></span>";
                            if (e.task.cantidad) {
                                cadena += "<br/> <span id='idCantidad' class='subTooltips'>" + window.app.idioma.t('CANTIDAD') + ": " + parseFloat(e.task.cantidad).toFixed(2) + " " + e.task.unidad + "</span>";
                            }
                            if (e.task.start) {
                                cadena += "<br/><span id='idInicio' class='subTooltips'>" + window.app.idioma.t('INICIO') + ": " + kendo.toString(kendo.parseDate(e.task.start), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                            }
                            if (e.task.end) {
                                cadena += "<br/><span id='idFin' class='subTooltips'>" + window.app.idioma.t('FIN') + ": " + kendo.toString(kendo.parseDate(e.task.end), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                            }
                        }
                    } else {
                        cadena += "<span id='idTitulo' class='subTooltips' style='text-aling:center;'><b>" + e.task.title + "</b></span>";
                        if (e.task.start) {
                            cadena += "<br/><span id='idInicio' class='subTooltips'>" + window.app.idioma.t('INICIO') + ": " + kendo.toString(kendo.parseDate(e.task.start), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                        }
                        if (e.task.end) {
                            cadena += "<br/><span id='idFin' class='subTooltips'>" + window.app.idioma.t('FIN') + ": " + kendo.toString(kendo.parseDate(e.task.end), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</span>";
                        }
                    }
                    cadena += "</div>";


                    return cadena;
                }





            },
            filtrar: function () {
                var self = this;
                var _iniciofecha = $("#dtpFechaDesde").data("kendoDatePicker").value();
                var _finfecha = $("#dtpFechaHasta").data("kendoDatePicker").value();
                var _mensaje = "";

                if ((_iniciofecha == "" || _iniciofecha == null) && (_finfecha == "") || _finfecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (_iniciofecha == "" || _iniciofecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (_finfecha == "" || _finfecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (Date.parse(_iniciofecha) > Date.parse(_finfecha)) {
                    _mensaje = window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO');
                }
                if (_mensaje !== "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), _mensaje, 4000);
                    return false;
                }


                //self.timeline.destroy()
                self.inicio = _iniciofecha;
                self.fin = _finfecha;
                self.actualizar();
            },
            eliminar: function () {
                this.remove();
            },
            actualizar: function () {
                var self = this;
                self.tasksDataSource.read()
            },
            resize: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                $("#gantt").height(contenedorHeight - cabeceraHeight - filtrosHeight - 35);

            }
        });

        return ProgFabricacion;
    });