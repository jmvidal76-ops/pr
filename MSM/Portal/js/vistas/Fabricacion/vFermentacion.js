define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/Fermentacion.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaSilos, Not, vistaResumenSilos) {
        var gridSilos = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            areas: [],
            resultadoDatos: [],
            resumenSilos: null,
            area: null,
            contador: 0,
            aPintar: 0,
            template: _.template(PlantillaSilos),
            initialize: function () {
                var self = this;


                $.ajax({
                    type: "GET",
                    url: "../api/GetResumenSilos/FERMENTACION",
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    kendo.ui.progress($("#center-pane"), false);
                    self.resumenSilos = data;
                    self.render();
                }).fail(function (e) {
                    kendo.ui.progress($("#center-pane"), false);
                    if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        $("#center-pane").empty();
                    }
                    else
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });

                kendo.ui.progress($("#center-pane"), true);

                //Nos traemos los datos de BBDD
                //-----------------------------

                //$.ajax({
                //    type: "GET",
                //    url: "../api/GetAreasGenerico/FER",
                //    dataType: 'json',
                //    cache: false,
                //    async: false
                //}).done(function (data) {
                //    self.areas = data;
                //    self.render();
                //}).fail(function (xhr) {
                //    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                //});


            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#toolbar").kendoToolBar();

                $("#divHTMLContenido").css({ 'height': "100%" });

                $("#btnConsultar").kendoButton({
                    click: function () { self.consultaSilos(); }
                });

                //$("#cmbArea").kendoDropDownList({
                //    dataTextField: "Name",
                //    dataValueField: "CeldaPK",
                //    dataSource: self.areas,
                //    change: function () { self.cambiaArea(this, self); }
                //     , dataBound: function () {
                //         this.select(0);
                //         self.area = $("#cmbArea").data("kendoDropDownList").value();
                //     }
                //});


                //if (self.areas.length === 0) {
                //    $("#lblNCoc").html("No se han encontrado silos");
                //    $("#btnConsultar").hide();
                //}
                //else {
                //    self.consultaSilos();
                //}

                var tabStrip = this.$("#divPestaniasFermentacion").kendoTabStrip({
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });

                var silosMalta = [];
                var silosMaltaColor = [];
                var silosAdjunto = [];
                var silosAdtivos = [];
                var mosto = [];
                var cerveza = [];

                for (i = 0; i < self.resumenSilos.length; i++) {
                    if (self.resumenSilos[i].Descript.toString().toUpperCase().indexOf("CERVEZA") !== -1)
                        cerveza.push(self.resumenSilos[i]);
                    else
                        //if (self.resumenSilos[i].ClassDescript.toString().indexOf("Materias Primas Auxiliares") !== -1)
                        //    silosAdtivos.push(self.resumenSilos[i]);
                        //else
                        mosto.push(self.resumenSilos[i]);
                }

                self.pintaSilos("maltas", mosto);
                //self.pintaSilos("maltacolor", silosMaltaColor);
                self.pintaSilos("adjunto", cerveza);
                //self.pintaSilos("aditivo", silosAdtivos);



            },
            events: {
                'click #btnArribabtn': 'arriba',
                'click #btnAbajobtn': 'abajo',
                'mousewheel #contenedor': 'wheeled'
            },
            wheeled: function (e) {
                var self = this;

                if (e.originalEvent.wheelDelta > 0) {
                    if ($('#btnArriba').is(":visible")) {
                        self.arriba();
                    }
                } else
                    if ($('#btnAbajo').is(':visible'))
                        self.abajo();

            },
            arriba: function () {
                var self = this;

                self.contador -= 1;

                for (i = self.contador; i < self.aPintar + self.contador; i++) {
                    if (this.resultadoDatos[i].tieneOrden !== undefined)
                        self.pintaEquipoProduccion(self.resultadoDatos[i], i + 1 - self.contador)
                    else
                        self.pintaEquipo(self.resultadoDatos[i], i + 1 - self.contador);
                }

                if (self.contador > 0)
                    $("#btnArriba").show();
                else
                    $("#btnArriba").hide();

                $("#btnAbajo").show();
            },
            abajo: function () {
                var self = this;

                self.contador += 1;

                for (i = self.contador; i < self.aPintar + self.contador; i++) {
                    if (this.resultadoDatos[i].tieneOrden !== undefined)
                        self.pintaEquipoProduccion(self.resultadoDatos[i], i + 1 - self.contador)
                    else
                        self.pintaEquipo(self.resultadoDatos[i], i + 1 - self.contador);
                }
                if (self.resultadoDatos.length > self.aPintar + self.contador)
                    $("#btnAbajo").show();
                else
                    $("#btnAbajo").hide();

                $("#btnArriba").show();
            },
            pintaSilos: function (padre, array) {
                var self = this;

                var cantidadTotal = 0;
                for (i = 0; i < array.length; i++) {
                    cantidadTotal += array[i].Quantity;
                }

                //var divSilos = $(padre);
                switch (padre) {
                    case "maltas":
                        var divSilos = $("#maltas");
                        self.colores = ["#FDF2E9", "#FAE5D3", "#F5CBA7", "#F0B27A", "#EB984E", "#E67E22", "#CA6F1E", "#AF601A", "#935116"];
                        if (array.length > 0) {
                            self.$("#lblNombreMalta").html(window.app.idioma.t("TANQUES_FERMENTACION") + ":");
                            self.$("#lblQtyMalta").html(parseFloat(cantidadTotal).toLocaleString() + array[0].UomID.toUpperCase());
                        }
                        else {
                            self.$("#lblNombreMalta").html(window.app.idioma.t("TANQUES_FERMENTACION") + ":");
                            self.$("#lblQtyMalta").html("0 Hl.");
                        }
                        break;
                    case "adjunto":
                        var divSilos = $("#adjunto");
                        self.colores = ["#E8F8F5", "#D1F2EB", "#A3E4D7", "#76D7C4", "#48C9B0", "#1ABC9C", "#17A589", "#148F77", "#117864"];
                        if (array.length > 0) {
                            self.$("#lblNombreAdjunto").html(window.app.idioma.t("TANQUES_GUARDA") + ":");
                            self.$("#lblQtyAdjunto").html(parseFloat(cantidadTotal).toLocaleString() + array[0].UomID.toUpperCase());
                        }
                        else {
                            self.$("#lblNombreAdjunto").html(window.app.idioma.t("TANQUES_GUARDA") + ":");
                            self.$("#lblQtyAdjunto").html("0 Hl.");
                        }
                        break;
                        //case "aditivo":
                        //    self.colores = ["#99b3ff", "#809fff", "#668cff", "#4d79ff", "#3366ff", "#1a53ff", "#0040ff", "#0039e6", "#0033cc"];
                        //    if (array.length > 0) {
                        //        self.$("#lblNombreAditivo").html("SILOS DE ADITIVO:");
                        //        self.$("#lblQtyAditivo").html(cantidadTotal.toFixed(2) + array[0].UomID.toUpperCase());
                        //    }
                        //    else {
                        //        self.$("#lblNombreAditivo").html("SILOS DE ADITIVO:");
                        //        self.$("#lblQtyAditivo").html("0.00 KG");
                        //    }
                        //    var divSilos = $("#aditivo"); break;
                }
                var acumulado = 0;//array.length;
                var totalDiv = 100;
                if (array.length > 0) {
                    for (i = 0; i < array.length; i++) {
                        if (i === array.length - 1)
                            tamanoDiv = totalDiv;
                        else {
                            tamanoDiv = (array[i].Quantity * 100 / cantidadTotal);
                        }

                        if (tamanoDiv < 4) {
                            acumulado += 4 - tamanoDiv;
                            tamanoDiv = 4;
                        }

                        totalDiv -= tamanoDiv;

                        var divSilo = document.createElement("div");
                        divSilo.setAttribute("id", "Silo" + padre + i);
                        divSilo.setAttribute("style", "width:100%;height:" + tamanoDiv.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + "%;background-color:" + self.colores[i % 9] + ";float:left;");
                        divSilos.prepend(divSilo);

                        if (tamanoDiv > 8) {
                            var saltoLinea = Math.floor(tamanoDiv.toFixed() / 25);
                            for (j = 0; j < saltoLinea; j++) {
                                divSilo.appendChild(document.createElement('br'));
                            }
                        }


                        var divEstado = document.createElement("div");
                        divEstado.setAttribute("class", "nombreSilo");
                        //divEstado.setAttribute("style", "width:80%; float:left; text-align:left;padding-left:20px;background-color:" + self.colores[i % 9] + ";");
                        divSilo.appendChild(divEstado);

                        var lblEstado = document.createElement("label");
                        $(lblEstado).text(array[i].Descript);
                        divEstado.appendChild(lblEstado);

                        var divCantidad = document.createElement("div");
                        divCantidad.setAttribute("class", "cantidadSilo");
                        //divCantidad.setAttribute("style", "width:20%; float:left; text-align:right;background-color:" + self.colores[i % 9] + ";");
                        divSilo.appendChild(divCantidad);

                        var lblCantidad = document.createElement("label");
                        $(lblCantidad).text(parseFloat(array[i].Quantity).toLocaleString() + array[i].UomID);
                        divCantidad.appendChild(lblCantidad);

                    }
                }
                else {
                    var divSilo = document.createElement("div");
                    divSilo.setAttribute("id", "Silo" + padre);
                    divSilo.setAttribute("style", "width:100%;height:100%;background-color:" + self.colores[0] + ";float:left;");
                    divSilos.append(divSilo);
                    var saltoLinea = 4;
                    for (j = 0; j < saltoLinea; j++) {
                        divSilo.appendChild(document.createElement('br'));
                    }

                    var lblEstado = document.createElement("label");
                    $(lblEstado).text(window.app.idioma.t("SILOS_VACIOS"));
                    divSilo.appendChild(lblEstado);
                }


            },
            consultaSilos: function () {
                var self = this;
                self.contador = 0;
                if (self.area) {
                    kendo.ui.progress($('#contenedor'), true);
                    $.ajax({
                        type: "GET",
                        url: "../api/GetEquipos/" + self.area,
                        dataType: 'json',
                        cache: false,
                        async: true
                    }).done(function (data) {
                        self.resultadoDatos = data;
                        kendo.ui.progress($('#contenedor'), false);
                        self.cargaSilos();
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });
                }
            },
            cargaSilos: function () {
                var self = this;

                self.aPintar = 5;

                if (self.resultadoDatos.length < self.aPintar) {
                    for (i = 0; i < self.resultadoDatos.length; i++) {
                        if (this.resultadoDatos[i].tieneOrden !== undefined)
                            self.pintaEquipoProduccion(self.resultadoDatos[i], i + 1)
                        else
                            self.pintaEquipo(self.resultadoDatos[i], i + 1);
                    }

                    for (i = self.resultadoDatos.length; i < 5; i++) {
                        $("#contenedor" + (i + 1)).hide();
                    }

                    $("#btnArriba").hide();
                    $("#btnAbajo").hide();
                }
                else {
                    for (i = 0; i < self.aPintar; i++) {
                        if (this.resultadoDatos[i].tieneOrden !== undefined)
                            self.pintaEquipoProduccion(self.resultadoDatos[i], i + 1)
                        else
                            self.pintaEquipo(self.resultadoDatos[i], i + 1);
                    }

                    $("#btnArriba").hide();

                    if (self.resultadoDatos.length > self.aPintar)
                        $("#btnAbajo").show();
                    else
                        $("#btnAbajo").hide();

                }

            },
            pintaEquipo: function (equipo, id) {

                $("#contenedor" + id).show();

                //Primer elemento a pintar: icono de silo y barra de progreso

                var progress = $("#progress" + id).kendoProgressBar({
                    orientation: "vertical",
                    type: "chunk",
                    chunkCount: 10,
                }).data("kendoProgressBar");

                porcentaje = 0.001;

                if (equipo.cantidad !== 0) {
                    if (equipo.capacidadMaxima > 0)
                        if ((equipo.cantidad * 100 / equipo.capacidadMaxima).toFixed(0) == 0)
                            porcentaje = (equipo.cantidad * 100 / equipo.capacidadMaxima).toFixed(2);
                        else
                            porcentaje = (equipo.cantidad * 100 / equipo.capacidadMaxima).toFixed(0);
                }

                if (equipo.tieneLote === 1 && porcentaje > 0 && porcentaje < 10 && porcentaje) {
                    porcentaje = 10;
                }

                progress.value(porcentaje);

                //Segundo elemento a pintar: rellenar la informacion del tanque

                $("#lblIDEquipo" + id).html(equipo.nombre.toUpperCase());

                $("#img" + id).attr('src', './img/tanque.png');
                $("#img" + id).width('40%');

                if (equipo.descripcion.indexOf("LEVADURA") >= 0) {
                    $("#img" + id).attr('src', './img/levadura.png');
                    $("#img" + id).width('100%');
                }

                $("#txt11" + id).html(equipo.nombre);
                $("#txt12" + id).html(equipo.descripcion);
                $("#txt13" + id).html(equipo.estado ? equipo.estado : '-');

                $("#txt21" + id).html(equipo.idMaterial ? equipo.idMaterial : '-');
                $("#txt22" + id).html(equipo.descMaterial ? equipo.descMaterial : '-');
                $("#txt23" + id).html(equipo.serialNumber ? equipo.serialNumber : '-');

                $("#lbl31" + id).text(window.app.idioma.t('CAPACIDAD_MAXIMA') + ":");
                $("#lbl32" + id).text(window.app.idioma.t('CANTIDAD_ACTUAL') + ":");
                $("#txt31" + id).html(equipo.capacidadMaxima ? equipo.capacidadMaxima.toLocaleString() : 0);
                $("#txt32" + id).html(equipo.cantidad ? equipo.cantidad.toLocaleString() : 0);
                $("#txt33" + id).html(equipo.uom ? equipo.uom.toUpperCase() : '-');

                $("#lbl23" + id).show();
                $("#txt23" + id).show();
                $("#lbl33" + id).show();
                $("#txt33" + id).show();


            },
            pintaEquipoProduccion: function (equipo, id) {

                $("#contenedor" + id).show();

                //Primer elemento a pintar: icono de silo y barra de progreso

                var progress = $("#progress" + id).kendoProgressBar({
                    orientation: "vertical",
                    type: "chunk",
                    chunkCount: 10,
                }).data("kendoProgressBar");

                porcentaje = 0.001;

                if (equipo.batchQuantity !== 0) {
                    if (equipo.capacidadMaxima > 0)
                        if ((equipo.batchQuantity * 100 / equipo.capacidadMaxima).toFixed(0) == 0)
                            porcentaje = (equipo.batchQuantity * 100 / equipo.capacidadMaxima).toFixed(2);
                        else
                            porcentaje = (equipo.batchQuantity * 100 / equipo.capacidadMaxima).toFixed(0);
                }

                if (equipo.tieneOrden === 1 && porcentaje > 0 && porcentaje) {
                    porcentaje = 10;
                }

                progress.value(porcentaje);

                //Segundo elemento a pintar: rellenar la informacion del tanque

                $("#lblIDEquipo" + id).html(equipo.nombre.toUpperCase());

                $("#img" + id).attr('src', './img/fermentacion.png');

                $("#img" + id).width('100%');

                $("#txt11" + id).html(equipo.nombre);
                $("#txt12" + id).html(equipo.descripcion);
                $("#lbl13" + id).text(window.app.idioma.t('LOTEMES'));
                $("#txt13" + id).html(equipo.lote ? equipo.lote : '-');

                $("#txt21" + id).html(equipo.idMaterial ? equipo.idMaterial : '-');
                $("#txt22" + id).html(equipo.descMaterial ? equipo.descMaterial : '-');
                $("#lbl23" + id).text(window.app.idioma.t('CANTIDAD_LOTE') + ":");
                $("#txt23" + id).html(equipo.batchQuantity ? equipo.batchQuantity : "-");

                $("#lbl31" + id).text(window.app.idioma.t('NUMERO_ORDEN') + ":");
                $("#lbl32" + id).text(window.app.idioma.t('ESTADO_EQUIPO') + ":");
                $("#txt31" + id).html(equipo.orden ? equipo.orden : '-');
                $("#txt32" + id).html(equipo.estado ? equipo.estado : '-');
                $("#lbl33" + id).hide();
                $("#txt33" + id).hide();
                //$("#txt31" + id).html(equipo.capacidadMaxima ? parseInt(equipo.capacidadMaxima).toLocaleString() : 0);
                //$("#txt32" + id).html(equipo.cantidad ? parseInt(equipo.cantidad).toLocaleString() : 0);
                //$("#txt33" + id).html(equipo.uom ? equipo.uom.toUpperCase() : '-');


            },
            cambiaArea: function (e, self) {
                var self = this;
                self.area = $("#cmbArea").data("kendoDropDownList").value();

                if (self.area) {
                    self.$("#btnConsultar").show();
                }
            },
            eliminar: function () {
                this.remove();
            }
        });

        return gridSilos;
    });
