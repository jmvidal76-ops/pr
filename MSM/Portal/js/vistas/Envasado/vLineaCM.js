
define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/BloqueLineaCM.html'], function(_, Backbone, $, plantillaBloque) {
    var BloqueLineaCM = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaBloque),
        initialize: function() {
            this.model.on('change', this.render, this);
            this.render();
        },
        render: function() {

            $(this.el).html(this.template(this.model.toJSON()));

            var self = this;
            //Parametros de linea
            var linea = self.model.get("linea");
            var OEETurno = self.model.get("OEETurno");

            // Añadimos un parámetro a cada bloque con el id de la línea para poder usarlo luego (al añadir el aviso de averías p.e.)
            self.$(".BloqueLineaCM").attr("data-linea", self.model.get("idLinea"))

	    //Cambiamos el tamaño del nombre linea si es mayor a 2 caracteres (para que entre la llave inglesa de mantenimiento)
            if (linea.numLineaDescripcion.length > 2) {
                this.$('.tituloLinea').css("font-size", "30px");
            }

            //Recorremos las llenadoras y pintamos segun su estado
            //-------------------------------------------
            var llenadoras = linea.llenadoras;
            for (var i = 0; i < llenadoras.length; i++) {
                switch (llenadoras[i].estado.id) {
                    case 0:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquinaNoConectada' title ='Llenadora no conectada'>" + (i + 1) + "</label></div>"));
                        break;
                    case 1:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquinaMarcha' title ='Llenadora en marcha'>" + (i + 1) + " </label></div>"));
                        break;
                    case 2:
                        this.$('#divLlenadoras').append($("<div><label id='" + llenadoras[i].id + "' class='maquinaParada' title ='Llenadora parada'>" + (i + 1) + "</label></div>"));
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

            //Barras de progreso
            //------------------
            var oeeWO = linea.ordenEnPaletizadora == null ? 0 : linea.ordenEnPaletizadora.produccion.oee;
            var passProgressWO;

            passProgressWO = this.$("#oeeWO" + linea.numLinea).kendoProgressBar({
                type: "percent",
                max: 100,
                value: oeeWO, //Este dato se calcula de parametros linea/Producto, en funcion del producto de la Orden En curso de la WO.
                animation: true,
                showStatus: false
            }).data("kendoProgressBar");
            if (linea.ordenEnPaletizadora != null) {
                if (oeeWO < linea.ordenEnPaletizadora.oeeCritico) {
                    passProgressWO.progressWrapper.css({
                        "background-color": "#FF3333",
                        "border-color": "#FF3333"
                    });
                } else if (oeeWO < linea.ordenEnPaletizadora.oeeObjetivo) {
                    passProgressWO.progressWrapper.css({
                        "background-color": "#FF9933",
                        "border-color": "#FF9933"
                    });
                } else {
                    passProgressWO.progressWrapper.css({
                        "background-color": "lightgreen",
                        "border-color": "lightgreen"
                    });
                }
            }

            var oeeTurno = OEETurno; //linea.llenadoras[0].datosSeguimiento.datosProduccionAvanceTurno.oee;

            //Parametros de turno
            //if (self.model.get("turnoProductivo")) {

            var passProgressTURNO;

            passProgressTURNO = this.$("#oeeTurno" + linea.numLinea).kendoProgressBar({
                type: "percent",
                max: 100,
                value: oeeTurno,
                animation: false,
                showStatus: false
            }).data("kendoProgressBar");

            if (oeeTurno < linea.oeeCritico) {
                passProgressTURNO.progressWrapper.css({
                    "background-color": "#FF3333",
                    "border-color": "#FF3333"
                });
            } else if (oeeTurno < linea.oeeObjetivo) {
                passProgressTURNO.progressWrapper.css({
                    "background-color": "#FF9933",
                    "border-color": "#FF9933"
                });
            } else {
                passProgressTURNO.progressWrapper.css({
                    "background-color": "lightgreen",
                    "border-color": "lightgreen"
                });
            }
            //}

            return this;
        },
        actualiza: function() {
            this.render();
        },
        esFechaValida: function (fecha) {
            return !((fecha == window.app.idioma.t('NO_DISPONIBLE')) || (fecha == window.app.idioma.t('FECHA_NO_DISPONIBLE')) || (fecha == window.app.idioma.t('SIN_ORDEN_ACTIVA')) || (fecha == window.app.idioma.t('SIN_TURNO_ACTIVO')) || (fecha == window.app.idioma.t('SIN_OEE_WO')) || (fecha == window.app.idioma.t('SIN_OEE_PREACTOR')))
        },
        dateStringToDate: function(dateString) {
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
    return BloqueLineaCM;
});