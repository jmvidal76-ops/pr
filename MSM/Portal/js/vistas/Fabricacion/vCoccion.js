define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/Coccion.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaSilos, Not, vistaResumenSilos) {
        var gridSilos = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            areas: [],
            resultadoDatos: [],
            area: null,
            contador: 0,
            aPintar: 0,
            template: _.template(PlantillaSilos),
            initialize: function () {
                var self = this;

                //Nos traemos los datos de BBDD
                //-----------------------------

                $.ajax({
                    type: "GET",
                    url: "../api/GetAreasGenerico/COC",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.areas = data;
                    self.render();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });


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

                $("#cmbArea").kendoDropDownList({
                    dataTextField: "Name",
                    dataValueField: "CeldaPK",
                    dataSource: self.areas,
                    change: function () { self.cambiaArea(this, self); }
                     , dataBound: function () {
                         this.select(0);
                         self.area = $("#cmbArea").data("kendoDropDownList").value();
                     }
                });


                if (self.areas.length === 0) {
                    $("#lblNCoc").html("No se han encontrado silo_s");
                    $("#btnConsultar").hide();
                }
                else {
                    self.consultaSilos();
                }
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
            consultaSilos: function () {
                var self = this;

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

                progress.value(porcentaje);

                //Segundo elemento a pintar: rellenar la informacion del tanque

                $("#lblIDEquipo" + id).html(equipo.nombre.toUpperCase());

                $("#img" + id).attr('src', './img/letraLogo_MSM.png');

                if (equipo.descripcion == "MOLINO")
                    $("#img" + id).attr('src', './img/molino.png');
                else
                    if (equipo.descripcion.indexOf("CALDERA")>=0)
                        $("#img" + id).attr('src', './img/caldera.png');


                $("#img" + id).width('100%');

                $("#txt11" + id).html(equipo.nombre);
                $("#txt12" + id).html(equipo.descripcion);
                $("#txt13" + id).html(equipo.estado ? equipo.estado : '-');

                $("#txt21" + id).html(equipo.idMaterial ? equipo.idMaterial : '-');
                $("#txt22" + id).html(equipo.descMaterial ? equipo.descMaterial : '-');
                $("#lbl23" + id).hide();
                $("#txt23" + id).hide();

                $("#lbl31" + id).text(window.app.idioma.t('NUMERO_ORDEN') + ":");
                $("#lbl32" + id).text(window.app.idioma.t('NUMERO_COCCION') + ":");
                $("#txt31" + id).html(equipo.orden ? equipo.orden : '-');
                $("#txt32" + id).html(equipo.numeroCoccion ? equipo.numeroCoccion : '-');
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