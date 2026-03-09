define(['underscore', 'backbone', 'jquery', 'colecciones/cLineas', 'text!../../html/CuadroMando.html', 'vistas/vLineasCuadroMando'],
    function(_, Backbone, $, Lineas, PlantillaListadoLineasCM, BloqueLineaCM) {
        var ListadoLineasCM = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaListadoLineas',
            className: 'vistaCarrusel',
            template: _.template(PlantillaListadoLineasCM),
            opciones: [],
            lineas: [],
            indexCarrusel: null,
            initialize: function(options) {
                //Backbone.on('eventNotificacionOrden', this.actualiza,this);
                //Backbone.on('eventNotificacionMaquina', this.actualiza, this);
                //Backbone.on('eventActProdOrden', this.actualiza, this);
                //Backbone.on('eventActProdTurno', this.actualiza, this);
                //Backbone.on('eventNotificacionTurno', this.actualiza, this);
                //Backbone.on('eventActPlanificacionOrden', this.actualiza, this);

                var self = this;
                self.opciones = options;
                self.indexCarrusel = options.indexCarrusel.id;

                this.collection = new Lineas(self.opciones.lineas);

                this.collection.fetch({
                    async: false,
                    success: function(e) {
                        self.render();
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log("Se produjo un error al inicializar la obtención de líneas para el cuadro de mando de Videowall");

                    }
                });

            },
            render: function() {
                var self = this;

                $(this.el).html(this.template(self.opciones.indexCarrusel));
                $("#center-pane").append($(this.el))

                // Borramos las vistas hijas que hubiera cargadas anteriormente
                for (i = 0; i < self.lineas.length; i++) {
                    self.lineas[i].eliminar();
                }

                this.collection.each(function(linea) {
                    var bloqueLinea = new BloqueLineaCM({ model: linea });
                    self.$("#listadoLineasCuadroMando" + self.indexCarrusel).append(bloqueLinea.el);
                    self.lineas.push(bloqueLinea);
                });

                self.resize();

                self.CargarAveriasLineas();
            },
            actualiza: function() {
                var self = this;

                this.collection = new Lineas(self.opciones.lineas);

                this.collection.fetch({
                    async: false,
                    success: function(e) {
                        self.render();
                    },
                    error: function(e) {
                        console.log("Se produjo un error al actualizar la obtención de líneas para el cuadro de mando de Videowall");

                    }
                });
                self.resize();
            },
            actualizaOee: function() {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/lineas/getSeguimiento/" + self.linea + "/",
                    dataType: 'json',
                    cache: false
                }).success(function(data) {
                    self.model = data;
                    self.render();
                }).error(function(err, msg, ex) {
                    //alert(ex);
                    //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SEGUIMIENTO_LINEA') + ': ' + ex, 4000);
                });

            },
            eliminar: function() {
                Backbone.off('eventNotificacionOrden');
                //Backbone.off('eventNotificacionCuadroMandoVideowall');
                Backbone.off('eventActProdOrden');
                Backbone.off('eventActProdTurno');
                Backbone.off('eventNotificacionTurno');
                Backbone.off('eventActPlanificacionOrden');
                var self = this;
                for (var i = 0; i < self.lineas.length; i++) {
                    var linea = self.lineas[i];
                    linea.eliminar();
                }
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resize: function() {
                var self = this;
                var marginTop = null;
                if (self.indexCarrusel == 0) {

                    var totalHeight = $("#carrusel").innerHeight();
                    var listadoLineasHeight = $("#listadoLineasCuadroMando" + self.indexCarrusel).innerHeight();

                    if (listadoLineasHeight > 0) {
                        var dif = totalHeight - listadoLineasHeight;

                        marginTop = dif / 2;
                        if ($(window).width() > 1024) {
                            $(".center").css("margin-top", marginTop);
                        } else {
                            $(".center").css("margin-top", "-1");
                        }
                    }
                }
                return marginTop;
            },
            setTop: function(size) {
                $(".center").css("margin-top", size);
            },
            listen: function() {
                Backbone.on('eventNotificacionOrden', this.actualiza, this);
                //Backbone.on('eventNotificacionCuadroMandoVideowall', this.actualiza, this);
                Backbone.on('eventActProd', this.actualiza, this);
                //Backbone.on('eventActProdTurno', this.actualiza, this);
                Backbone.on('eventNotificacionTurno', this.actualiza, this);
                Backbone.on('eventActPlanificacionOrden', this.actualiza, this);
            },
            CargarAveriasLineas: function () {
                let self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/SolicitudesAbiertasLinea",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        $(".avisoAveria").hide();
                        for (let d of res) {
                            const abiertasReal = d.OTs.filter(f => f.Estado != "M5").length;

                            if (abiertasReal) {
                                let bloque = self.$(`.BloqueLineaCM[data-linea="${d.Linea}"]`);
                                bloque.find(".avisoAveria").show();
                                bloque.find(".contadorAverias").html(abiertasReal);
                            }
                        }
                    },
                    error: function (er) {
                        console.log(`Error al obtener las averías de línea ${er}`)
                    }
                });
            }
        });
        return ListadoLineasCM;
    });