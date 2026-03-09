
define(['underscore', 'backbone', 'jquery', 'text!../../html/lineasCuadroMando.html'], function(_, Backbone, $, plantillaBloque) {
    var bloqueLineaCm = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaBloque),
        initialize: function() {
            this.model.on('change', this.render, this);
            this.render();
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            var self = this;
            var linea = self.model.get("linea");
            var OEETurno = self.model.get("OEETurno");

            // Añadimos un parámetro a cada bloque con el id de la línea para poder usarlo luego (al añadir el aviso de averías p.e.)
            self.$(".BloqueLineaCM").attr("data-linea", self.model.get("idLinea"))

	    //Cambiamos el tamaño del nombre linea si es mayor a 2 caracteres (para que entre la llave inglesa de mantenimiento)
            if (linea.numLineaDescripcion.length > 2) {
                this.$('.tituloLinea').css("font-size", "50px");
            }

            // Llenadoras
            var llenadoras = linea.llenadoras;
            for (var i = 0; i < llenadoras.length; i++) {
                switch (llenadoras[i].estado.id) {
                    case 0:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquina' style='background-color:#FFA500;' title='Llenadora no conectada'>" + (i + 1) + "</label></div>"));
                        break;
                    case 1:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquina' style='background-color:#008000;' title='Llenadora en marcha'>" + (i + 1) + " </label></div>"));
                        break;
                    case 2:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquina' style='background-color:#F00;' title='Llenadora parada'>" + (i + 1) + "</label></div>"));
                        break;
                }
            }
           
            //if (linea.ordenEnPaletizadora && linea.ordenEnPaletizadora.fecFinEstimadoCalculado != "--/--/----" && linea.ordenEnPaletizadora.fecFinEstimado != "--/--/----") {
            if (linea.ordenEnPaletizadora && self.esFechaValida(linea.ordenEnPaletizadora.fecFinEstimadoCalculado) && self.esFechaValida(linea.ordenEnPaletizadora.fecFinEstimado)) {
                var fechaFinReal = this.dateStringToDate(linea.ordenEnPaletizadora.fecFinEstimadoCalculado);
                var fechaFinPlan = this.dateStringToDate(linea.ordenEnPaletizadora.fecFinEstimado);

                if (fechaFinReal > fechaFinPlan) {
                    this.$("#fechaFinPlan" + linea.numLinea).css('background-color', 'lightblue');
                }
            }

            // WOs
            // Barras de progreso
            var oeeWo = linea.ordenEnPaletizadora == null ? 0 : linea.ordenEnPaletizadora.produccion.oee;
            var passProgressWo;
            passProgressWo = this.$("#oeeWO" + linea.numLinea).kendoProgressBar({
                type: "percent",
                max: 100,
                value: oeeWo, //Este dato se calcula de parametros linea/Producto, en funcion del producto de la Orden En curso de la WO.
                animation: true,
                showStatus: false
            }).data("kendoProgressBar");
            // Color de fondo
            if (linea.ordenEnPaletizadora != null) {
                if (oeeWo < linea.ordenEnPaletizadora.oeeCritico) {
                    passProgressWo.progressWrapper.css({
                        "background-color": "#FF3333",
                        "border-color": "#FF3333"
                    });
                } else if (oeeWo < linea.ordenEnPaletizadora.oeeObjetivo) {
                    passProgressWo.progressWrapper.css({
                        "background-color": "#FF9933",
                        "border-color": "#FF9933"
                    });
                } else {
                    passProgressWo.progressWrapper.css({
                        "background-color": "lightgreen",
                        "border-color": "lightgreen"
                    });
                }
            }

            // Turnos
            var oeeTurno = OEETurno; //linea.llenadoras[0].datosSeguimiento.datosProduccionAvanceTurno.oee;
            if (self.model.get("turnoProductivo")) {
                var passProgressTurno;
                // Barra de progreso
                passProgressTurno = this.$("#oeeTurno" + linea.numLinea).kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: oeeTurno,
                    animation: false,
                    showStatus: false
                }).data("kendoProgressBar");
                // Color de fondo
                if (oeeTurno < linea.oeeCritico) {
                    passProgressTurno.progressWrapper.css({
                        "background-color": "#FF3333",
                        "border-color": "#FF3333"
                    });
                } else if (oeeTurno < linea.oeeObjetivo) {
                    passProgressTurno.progressWrapper.css({
                        "background-color": "#FF9933",
                        "border-color": "#FF9933"
                    });
                } else {
                    passProgressTurno.progressWrapper.css({
                        "background-color": "lightgreen",
                        "border-color": "lightgreen"
                    });
                }
                //}else{ // No hay orden activa, se muestra la fila de fila de turno con fondo naranja
                //    // var valorTdOeeTurno=this.$("#tdOeeTurno"+linea.numLinea).html();
                //    this.$(".k-state-selected").css({"background-color":"#F35800","border-color":"#F35800"});
                //}
            }
            return this;
        },
        esFechaValida: function (fecha) {
            return !((fecha == window.app.idioma.t('NO_DISPONIBLE')) || (fecha == window.app.idioma.t('FECHA_NO_DISPONIBLE')) || (fecha == window.app.idioma.t('SIN_ORDEN_ACTIVA')) || (fecha == window.app.idioma.t('SIN_TURNO_ACTIVO')) || (fecha == window.app.idioma.t('SIN_OEE_WO')) || (fecha == window.app.idioma.t('SIN_OEE_PREACTOR')))
        },
        actualiza: function() {
            this.render();
        },
        dateStringToDate: function (dateString) {
            var dateTimeParts = dateString.split(' ');
            var dateParts = dateTimeParts[0].split('/');
            var timeParts = dateTimeParts[1].split(':');
            var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);

            return date;
        },
        eliminar: function() {
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        }
    });
    return bloqueLineaCm;
});