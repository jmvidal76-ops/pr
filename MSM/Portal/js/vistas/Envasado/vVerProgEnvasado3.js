define(['underscore', 'backbone', 'jquery', 'vis', 'text!../../../Envasado/html/VerProgramaEnvasado3.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, vis, PlantillaVerProgEnvasado, Not, VistaDlgConfirmar) {
     var uploadVerProgEnvasado = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        fecha: new Date(),
        shift_tl: {},
        items: new vis.DataSet([]),
        //lineas: [],
        //input:{},
        //output: [],
        //timeline: {},
        //offset: 7 * 24 * 3600000,
        dia: new Date(),
        template: _.template(PlantillaVerProgEnvasado),
        initialize: function () {
            var self = this;
        //    var splitter = $("#vertical").data("kendoSplitter");
        //    splitter.bind("resize", self.resizeGrid);
        //    self.lineas = [];
        //    for (var i = 0; i < window.app.planta.lineas.length; i++) {
        //        self.lineas.push(
        //            {
        //                "content": window.app.idioma.t('LINEA')
        //                          + " " + window.app.planta.lineas[i].numLinea
        //                          + " - " + window.app.planta.lineas[i].descripcion,
        //                "id": window.app.planta.lineas[i].id,
        //                "value": i,
        //                "className": 'line' + i
        //            });
        //    }


            var splitter = $("#vertical").data("kendoSplitter");
        //    self.actualiza();

            self.render();
            
        },
        //actualiza: function () {  
        //    var self = this;

        //    self.input.start = new Date(self.dia.getTime() - self.offset);
        //    self.input.end = new Date(self.dia.getTime() + self.offset);
        //    self.output = [];

        //    $.ajax({
        //        type: "GET",
        //        url: "../api/ordenes/obtenerOrdenesPlanificadas/",
        //        data: JSON.stringify(self.input),
        //        dataType: "json",
        //        contentType: "application/json; charset=utf-8",
        //        type: "POST",
        //        cache: false,
        //        async: false
        //    }).done(function (data) {
        //        //self.output = data;
        //        for (var i = 0; i < data.length ; i++) {
        //            self.output.push({
        //                start: new Date(data[i].dFecInicioEstimadoLocal),
        //                end: new Date(data[i].dFecFinEstimadoLocal),
        //                group: data[i].idLinea,
        //                className: "line" + data[i].numLinea,
        //                content: data[i].id,
        //                id: data[i].id,
        //                //type:"box",
        //                header: data[i].id,
        //                description: data[i].producto.nombre + "(" + data[i].cantPlanificada + ")"
        //                //description: "<strong>" + window.app.idioma.t('CANTIDAD') + "</strong>" + data[i].cantPlanificada + ", " +
        //                //             "<strong>" + window.app.idioma.t('PRODUCTO') + "</strong>" + data[i].producto.nombre
        //            })
        //        }
        //    }).fail(function (xhr) {
        //        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDENES_PLANIFICADAS'), 4000);
        //    });

        //},
        render: function () {
            $(this.el).html(this.template());
            $("#center-pane").append($(this.el))
            var self = this;

            $("#dpFechaInicio").kendoDatePicker({
                value: new Date(),
                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                culture: localStorage.getItem("idiomaSeleccionado")
            });

            this.$("#cmdTurno").kendoDropDownList({
                dataValueField: "id",
                dataTextField: "nombre",
                dataSource: [{ id: 1, nombre: window.app.idioma.t('MAÑANA') }]
            })

            items = new vis.DataSet([
                { id: 1, content: 'WO1',title:'WorkOrder1', start: '2016/01/19 09:00:00', end: '2016/01/19 11:00:00' },
                { id: 2, content: 'WO2', start: '2016/01/19 12:00:00', end: '2016/01/19 13:00:00' },
       //{ id: 1, content: 'item 1', start: '2013-04-20' },
       //{ id: 2, content: 'item 2', start: '2013-04-14' },
       //{ id: 3, content: 'item 3', start: '2013-04-18' },
       //{ id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19' },
       //{ id: 5, content: 'item 5', start: '2013-04-25' },
       //{ id: 6, content: 'item 6', start: '2013-04-27' }
            ]);

            var shift_tl = {
                container: document.getElementById('visualization'),
                items: items,
                options: {
                    onMove: function (item, callback) {
                        updateTimeLine(item, callback, items);
                    },  
                    editable: true,
                    moveable:false,
                    stack: false,
                    start: '2016-01-19 05:50:00',
                    end: '2016-01-19 14:10:00',
                    locales: {
                        // create a new locale (text strings should be replaced with localized strings)
                        mylocale: {
                            'MONTHS': ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                            'MONTHS_SHORT': ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                            'DAYS': ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                            'DAYS_SHORT': ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                            'ZOOM_IN': "Aumentar zoom",
                            'ZOOM_OUT': "Disminuir zoom",
                            'MOVE_LEFT': "Mover izquierda",
                            'MOVE_RIGHT': "Mover derecha",
                            'NEW': "Nuevo",
                            'CREATE_NEW_EVENT': "Crear nuevo evento"
                        }
                    },

                    // use the new locale
                    locale: 'mylocale'
                }
            };

            var timeline = new vis.Timeline(shift_tl.container, shift_tl.items, shift_tl.options);

            
           
            /*
            Calculo de tiempo restante
            */

            var horasTotales = 8 * 60 * 60 * 1000; //Tiempo en ms
            var horasUsadas = 0;

            for (i = 1; i <= timeline.itemsData.length; i++) {
                horasUsadas += new Date(timeline.itemsData._data[i].end).getTime() - new Date(timeline.itemsData._data[i].start).getTime();
            }

            horasUsadas = (horasTotales - horasUsadas) / 3600000;

            $("#lblHoras").text(horasUsadas);


            function updateTimeLine(item, callback, items) {


                var idcambia = item.id;
                var startcambia = item.start;
                var endcambia = item.end;
                /*
                Comprobaciones
                */

                /*
                1. No se supera el maximo de horas
                */
                var horasTotales = 8 * 3600000;
                horasUsadas = 0;

                for (i = 1; i <= timeline.itemsData.length; i++) {
                    if (timeline.itemsData._data[i].id == idcambia)
                    {
                        horasUsadas += new Date(endcambia).getTime() - new Date(startcambia).getTime();
                    }
                    else
                    {
                        horasUsadas += new Date(timeline.itemsData._data[i].end).getTime() - new Date(timeline.itemsData._data[i].start).getTime();
                    }
                }

                if (horasUsadas > horasTotales) {
                    timeline.setItems(items)
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('PLANIFICACION_HORAS_TURNO'), 4000);
                }
                else {

                    horasUsadas = (horasTotales - horasUsadas) / 3600000;

                    

                    /*
                    2. No se desplaza fuera del turno una WO
                    */

                    var FechaLimite = new Date("2016/01/19 14:00:00").getTime();
                    var ErrorMaximo = false;

                    for (i = 1; i <= timeline.itemsData.length; i++) {
                        if (timeline.itemsData._data[i].id != idcambia) {
                            if (new Date(timeline.itemsData._data[i].start).getTime() <= endcambia.getTime() && new Date(timeline.itemsData._data[i].start).getTime() >= new Date(timeline.itemsData._data[idcambia].end).getTime()) {
                                var result = new Date(endcambia);
                                var diferencia = result.getTime() - new Date(timeline.itemsData._data[i].start).getTime();
                                if (new Date(timeline.itemsData._data[i].end).getTime() + diferencia > FechaLimite) {
                                    ErrorMaximo = true;
                                }
                            }
                        }
                    }

                    if (ErrorMaximo)
                    {
                        timeline.setItems(items)
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDEN_FUERA__TURNO'), 4000);
                    }
                    else
                    {


                        /*
                        Resto
                        */

                        for (i = 1; i <= timeline.itemsData.length; i++) {
                            if (timeline.itemsData._data[i].id != idcambia) {
                                if (new Date(timeline.itemsData._data[i].start).getTime() < endcambia.getTime() && new Date(timeline.itemsData._data[i].start).getTime() > new Date(timeline.itemsData._data[idcambia].end).getTime()) {
                                    var result = new Date(endcambia);
                                    var diferencia = result.getTime() - new Date(timeline.itemsData._data[i].start).getTime();
                                    items._data[i].start = new Date(new Date(timeline.itemsData._data[i].start).setTime(new Date(timeline.itemsData._data[i].start).getTime() + diferencia));
                                    items._data[i].end = new Date(new Date(timeline.itemsData._data[i].end).setTime(new Date(timeline.itemsData._data[i].end).getTime() + diferencia));
                                     }
                            }
                        }


                        items._data[idcambia].start = startcambia;
                        items._data[idcambia].end = endcambia;
                        timeline.setItems(items);
                        $("#lblHoras").text(Math.round(horasUsadas * 100) / 100);
                        

                    }
              
                }
            }
            function logEvent(event, properties, item, timeline, shift_tl, timeline2, shiftold) {
                //var log = document.getElementById('log');
                //var msg = document.createElement('div');
                //msg.innerHTML = 'event=' + JSON.stringify(event) + ', ' +
                //    'properties=' + JSON.stringify(properties);
                //log.firstChild ? log.insertBefore(msg, log.firstChild) : log.appendChild(msg);

                if (properties.items != null) {

                    if (properties.items.length > 0) {

                        var idcambia = properties.data[0].id;
                        var startcambia = properties.data[0].start;
                        var endcambia = properties.data[0].end;

                        var items = shift_tl.items;

                        /*
                        Comprobaciones
                        */

                        /*
                        1. No se supera el maximo de horas
                        */
                        for (i = 1; i <= items.length; i++) {
                                horasUsadas += new Date(items._data[i].end).getTime() - new Date(items._data[i].start).getTime();
                        }

                        if (horasUsadas > horasTotales) {
                            timeline.setItems(shiftold.items);
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('PLANIFICACION_HORAS_TURNO'), 4000);
                        }
                        else{

                            horasUsadas = (horasTotales - horasUsadas + 10000) / 3600000;

                            $("#lblHoras").text(horasUsadas);


                            /*
                            2. No se desplaza fuera del turno una WO
                            */


                            for (i = 1; i <= items.length; i++) {
                                if (items._data[i].id == idcambia) {

                                    items._data[i].end = endcambia;
                                    items._data[i].start = startcambia;
                                }
                                else {
                                    if (new Date(items._data[i].start).getTime() < endcambia.getTime()) {
                                        var result = new Date(endcambia);
                                        //var total = new Date();
                                        //total.setTime(result.getTime() + (2 * 24 * 60 * 1000));
                                        var diferencia = result.getTime() - new Date(items._data[i].start).getTime() + 10000;
                                        items._data[i].start = new Date(new Date(items._data[i].start).setTime(new Date(items._data[i].start).getTime() + diferencia));
                                        items._data[i].end = new Date(new Date(items._data[i].end).setTime(new Date(items._data[i].end).getTime() + diferencia));
                                        //items._data[i].start = result;
                                    }
                                }
                            }


                            timeline.setItems(items);



                            //shift_tl = {
                            //    container: document.getElementById('visualization'),
                            //    items: items,
                            //    options: {
                            //        editable: true
                            //    }
                            //};

                            //shift_tl.items.update();

                            //timeline = new vis.Timeline(shift_tl.container, shift_tl.items, shift_tl.options);
                        }
                    }
                }
            }

            //// create visualization
            //var container = document.getElementById('visualization');
            //var options = {
            //    // option groupOrder can be a property name or a sort function
            //    // the sort function must compare two groups and return a value
            //    //     > 0 when a > b
            //    //     < 0 when a < b
            //    //       0 when a == b
            //    groupOrder: function (a, b) {
            //        return a.value - b.value;
            //    },
            //    groupOrderSwap: function (a, b, groups) {
            //        var v = a.value;
            //        a.value = b.value;
            //        b.value = v;
            //    },
            //    //stack:false,
            //    //editable: true,
            //    //groupEditable: true,
            //    maxHeight: $("#center-pane")[0].style.height,
            //    start: self.input.start,
            //    end: self.input.end,
            //    locale: 'es',
            //    template: function (item) {
            //        return "<strong>" + item.header + ":</strong> " + item.description
            //        //return '<h3>' + item.header + '</h3><p>' + item.description + '</p>';
            //    }
            //};

            //self.timeline = new vis.Timeline(container);
            //self.timeline.setOptions(options);
            //self.timeline.setGroups(self.lineas);
            //self.timeline.setItems(self.output);
            

            ////schema: {
            ////        model: {
            ////            id: "id",
            ////            fields: {
            ////                id: { from: "id", type: "string" },
            ////                title: { from: "id" },
            ////                start: { type: "date", from: "dFecInicioEstimado" },
            ////                end: { type: "date", from: "dFecFinEstimado" },
            ////                startTimezone: { defaultValue: "Etc/UTC" },
            ////                endTimezone: { defaultValue: "Etc/UTC" },
            ////                cantidad: { from: "cantPlanificada" },
            ////                producto: { from: "producto.nombre" },
            ////                idLinea: { from: "idLinea", nullable: true },
            ////                isAllDay: { type: "boolean", defaultValue: true }
            ////            }
            ////        }
            ////}

        },
        events: {
            'rangechange timeline': 'test'
            //'click #btnAnterior': 'atras',
            //'click #btnSiguiente': 'adelante',
        },
        test: function(){
            prueba = 1;
        },
        //atras: function () {
        //    var self = this;
        //    self.dia = new Date(self.dia.getTime() - self.offset)
        //    self.actualiza();
        //    self.timeline.setItems(self.output);
        //    self.timeline.redraw();
        //    self.timeline.moveTo(self.dia);
            
        //},
        //adelante: function () {
        //    var self = this;
        //    self.dia = new Date(self.dia.getTime() + self.offset)
        //    self.actualiza();
        //    self.timeline.redraw();
        //    self.timeline.moveTo(self.dia);
        //},
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
        //resizeGrid: function () {

        //    var contenedorHeight = $("#center-pane").innerHeight();
        //    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
        //    var filtrosHeight = $("#divFiltros").innerHeight();

        //    var gridElement = $("#gridProgramasEnvasado"),
        //        dataArea = gridElement.find(".k-grid-content"),
        //        gridHeight = gridElement.innerHeight(),
        //        otherElements = gridElement.children().not(".k-grid-content"),
        //        otherElementsHeight = 0;
        //    otherElements.each(function () {
        //        otherElementsHeight += $(this).outerHeight();
        //    });
        //    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

        //}
    });

    return uploadVerProgEnvasado;
});