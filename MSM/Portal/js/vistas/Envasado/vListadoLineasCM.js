define(['underscore', 'backbone', 'jquery','colecciones/cLineas', 'text!../../../Envasado/html/ListadoLineasCM.html', 'vistas/Envasado/vLineaCM'],
    function (_, Backbone, $,Lineas, PlantillaListadoLineasCM, BloqueLineaCM) {
        var ListadoLineasCM = Backbone.View.extend({   
            template: _.template(PlantillaListadoLineasCM),
            lineas: [],
            initialize: function () {
                Backbone.on('eventNotificacionOrden', this.actualiza,this);
               // Backbone.on('eventNotificacionCuadroMandoVideowall', this.actualiza, this);
                Backbone.on('eventActProd', this.actualiza, this);
                //Backbone.on('eventActProdTurno', this.actualiza, this);
                Backbone.on('eventNotificacionTurno', this.actualiza, this);
                Backbone.on('eventActPlanificacionOrden', this.actualiza, this);

                var self = this;

                this.collection = new Lineas();

                this.collection.fetch({
                    async: false, // agomezn 030816: 131 del Excel de incidencias, esta línea evita que se monten las vistas al cambiar rapidamente en MSIE de sección del menu izquierdo
                    reset: true,
                    success: function (e) {
                        self.render();
                    },
                    error: function (e) {
                        console.log('ERROR: al crear obtener las lineas');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                // Borramos las vistas hijas que hubiera cargadas anteriormente
                for (i = 0; i < self.lineas.length; i++) {
                    self.lineas[i].eliminar();
                }
             
                this.collection.each(function (linea) {
                     var bloqueLinea = new BloqueLineaCM({ model: linea });
                     self.$("#listadoLineasCM").append(bloqueLinea.el);
                     self.lineas.push(bloqueLinea);
                });

                var height = $("#center-pane").innerHeight() - $("#divCabeceraVista").height();
                $("#listadoLineasCM").css('max-height', height - 40);

                self.CargarAveriasLineas();
            },
            actualiza: function () {
                var self = this;

                this.collection = new Lineas();

                this.collection.fetch({
                    reset: true,
                    success: function (e) {
                        self.render();
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        console.log('ERROR: al crear obtener las lineas');
                    }
                });
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrden');
               // Backbone.off('eventNotificacionCuadroMandoVideowall');
                Backbone.off('eventActProd');
                //Backbone.off('eventActProdTurno');
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
            CargarAveriasLineas: function () {
                let self = this;

                if (!TienePermiso(265)) {
                    return;
                }

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
                                bloque.find(".avisoAveria button").show();
                                bloque.find(".avisoAveria button").click(function () {
                                    self.MostrarResumenOTs(d.OTs);
                                })
                            }
                        }
                    },
                    error: function (er) {
                        console.log(`Error al obtener las averías de línea ${er}`)
                    }
                });
            },
            MostrarResumenOTs: function (OTs) {
                //console.log(OTs);
                let self = this;

                let ventanaResumenOTs = $("<div id='dlgResumenOTs'/>").kendoWindow({
                    title: window.app.idioma.t('OTS_MANTENIMIENTO'),
                    width: "90%",
                    height: "90%",
                    draggable: false,
                    scrollable: true,
                    close: function () {
                        ventanaResumenOTs.destroy();
                    },
                    resizable: false,
                    modal: true,
                }).data('kendoWindow');

                var template = kendo.template($("#resumenOTsTemplate").html());
                var content = template({ OTs });
                ventanaResumenOTs
                    .content(content)
                    .center().open();

                $(".estadoTextCont").each(function (idx, el) {
                    EscalarTextoContenedor({ cont: $(this), text: $(this).find(".estado-text") });
                })

                $(".tooltipable").each(function (idx, el) {
                    $(this).attr("title", $(this).html());
                })
            }
        });
        return ListadoLineasCM;
    });