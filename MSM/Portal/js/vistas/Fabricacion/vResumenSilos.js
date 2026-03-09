define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ResumenSilos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaResumenSilos, Not, VistaDlgConfirm) {
        var vistaResumenSilos = Backbone.View.extend({
            tagName: 'div',
            id: 'divResumenSilos',
            resumenSilos: null,
            window: null,
            colores: null,
            template: _.template(plantillaResumenSilos),
            initialize: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/GetResumenSilos/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.resumenSilos = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });


                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                var silosMalta = [];
                var silosMaltaColor = [];
                var silosAdjunto = [];
                var silosAdtivos = [];

                for (i = 0; i < self.resumenSilos.length; i++) {
                    if (self.resumenSilos[i].ClassDescript.toString().toUpperCase().indexOf("MALTA") !== -1)
                        silosMalta.push(self.resumenSilos[i]);
                    else
                        //if (self.resumenSilos[i].ClassDescript.toString().indexOf("Materias Primas Auxiliares") !== -1)
                        //    silosAdtivos.push(self.resumenSilos[i]);
                        //else
                        silosAdjunto.push(self.resumenSilos[i]);
                }

                self.pintaSilos("maltas", silosMalta);
                //self.pintaSilos("maltacolor", silosMaltaColor);
                self.pintaSilos("adjunto", silosAdjunto);
                //self.pintaSilos("aditivo", silosAdtivos);


                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('RESUMEN_SILOS'),
                    width: "85%",
                    height: "60%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["Close"]
                }).data("kendoWindow");

                self.dialog = $('#divResumenSilos').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
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
                        self.colores = ["#ffe0b3", "#ffd699", "#ffcc80", "#ffc266", "#ffb84d", "#ffad33", "#ffa31a", "#ff9900", "#e68a00"];
                        if (array.length > 0) {
                            self.$("#lblNombreMalta").html(window.app.idioma.t("SILOS_MALTA") + ":");
                            self.$("#lblQtyMalta").html(parseFloat(cantidadTotal).toLocaleString() + array[0].UomID.toUpperCase());
                        }
                        else {
                            self.$("#lblNombreMalta").html(window.app.idioma.t("SILOS_MALTA") + ":");
                            self.$("#lblQtyMalta").html("0 KG");
                        }
                        break;
                    case "adjunto":
                        var divSilos = $("#adjunto");
                        self.colores = ["#9fdf9f", "#8cd98c", "#79d279", "#66cc66", "#53c653", "#40bf40", "#39ac39", "#339933", "#2d862d"];
                        if (array.length > 0) {
                            self.$("#lblNombreAdjunto").html(window.app.idioma.t("SILOS_ADJUNTO") + ":");
                            self.$("#lblQtyAdjunto").html(parseFloat(cantidadTotal).toLocaleString() + array[0].UomID.toUpperCase());
                        }
                        else {
                            self.$("#lblNombreAdjunto").html(window.app.idioma.t("SILOS_ADJUNTO") + ":");
                            self.$("#lblQtyAdjunto").html("0 KG");
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
                        if (i === array.length-1)
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
                        $(lblCantidad).text(parseInt(array[i].Quantity).toLocaleString() + array[i].UomID);
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
            events: {

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaResumenSilos;
    });