define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/BloqueoPaletas.html', 'definiciones', 'compartido/notificaciones'],
    function (_, Backbone, $, Plantilla, definiciones, Not) {
        var VistaBloqueoPaletas = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            component: null,
            llenadoras: null,
            llenadoraSel: null,
            Offset: null,
            numLlenadoraSel: null,
            idUbicacionLlenadora: null,
            initialize: function () {
                var self = this;
                
                var numLinea = window.app.lineaSel.numLinea;
                self.obtenerUbicacionesLinea(numLinea);
                self.obtenerNumeroLlenadoras();
            },
            render: function (numLlenadoras) {
                var self = this;

                $(self.el).html(self.template()); // Renderizar el HTML base

                var contenedorLlenadoras = $('#contenedorLlenadoras', self.el); 

                // Crear botones dinámicamente según el número de llenadoras
                for (let i = 1; i <= numLlenadoras; i++) {
                    var btnHtml = '<div id="divLlenadora' + i + '" style="padding-top: 10px">' +
                        '<button id="btnLlenadora' + i + '" class="k-button k-button-icontext ajustesBoton btnLlenadora" ' +
                        'data-llenadora=' + i + ' style="margin-left: 5px;">Bloqueo de Paletas Llenadora ' + i + '</button></div>';

                    contenedorLlenadoras.append(btnHtml);
                }

                $("#center-pane").css("overflow", "hidden");
            },
            obtenerNumeroLlenadoras: function () {
                var self = this;
                
                window.app.lineaSel.llenadoras.sort(function (a, b) {
                    return a.nombre - b.nombre;
                });
                self.llenadoras = window.app.lineaSel.llenadoras;

                var numLlenadoras = self.llenadoras.length;
                self.render(numLlenadoras); // Llamar a render con el número de llenadoras
            },
            obtenerUbicacionesLinea: function (idLinea) {
                var self = this;
                $.ajax({
                    url: "../api/ObtenerUbicacionesPorLinea?Linea=" + idLinea,
                    async: false,
                    success: function (res) {
                        self.UbicacionesLinea = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
 
            events: {
                'click .btnLlenadora': 'BloqueoPaletasModal',
            },
            BloqueoPaletasModal: async function (e) {
                var self = this;

                let data = {
                    NumPaletas: 0,
                    Offset: 1
                }

                //Datos llenadora Seleccionada
                self.numLlenadoraSel = $(e.currentTarget).data('llenadora');
                self.llenadoraSel = self.llenadoras[self.numLlenadoraSel - 1];

                //Buscamos idUbicacion de la llenadora n
                for (let i = 0; i < self.UbicacionesLinea.length; i++) {
                    if (self.UbicacionesLinea[i].Nombre === self.llenadoraSel.nombre) {
                        self.idUbicacionLlenadora = self.UbicacionesLinea[i].IdUbicacion;
                        break;
                    }
                }

                // Esperar a que se obtenga el Offset
                try {
                    data.Offset = await self.obtenerOffsetUbicacion(self.idUbicacionLlenadora);
                } catch (error) {
                    return; // No continuar si falla
                }

                let tmplt = Array.from($(self.template())).find(e => e.id == 'BloqueoPaletasTemplate').innerHTML;

                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("BLOQUEO_PALETAS"),
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template(tmplt);
                kendoWindow
                    .content(template(data));
                kendo.init(ventana);

                // Configuramos los botones
                $("#btnCancelarBloqueo").click((e) => {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('CANCELADO'), 4000);
                    kendoWindow.close();
                })

                $("#btnAceptarBloqueo").click((e) => {
                    //Bloqueamos paletas
                    data.NumPaletas = document.getElementById('inpt_Paletas').value;
                    data.Offset = document.getElementById('inpt_Offset').value;
                    kendoWindow.close();

                    kendo.ui.progress($("#BloqueoPaletasTemplate"), true);
                    self.bloquearPaletas(data);
                })

                kendoWindow.center().open();

            },
            obtenerOffsetUbicacion: function (IdUbicacion) {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "../api/GetDatosUbicacion/" + IdUbicacion,
                        async: false,
                        success: function (res) {
                            resolve(res.Offset);  
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } 
                            reject(e);  
                        }
                    });
                });
            },
            bloquearPaletas: function (data) {
                var self = this;

                let datosBloqueo = {
                    BLOQUEO_VAL_MES: data.NumPaletas,
                    T_EVACUACION: data.Offset,
                };

                let idLinea = window.app.lineaSel.id;

                $.ajax({
                    url: `../api/HacerBloqueoSIGI?idLinea=${idLinea}`,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(datosBloqueo),
                    success: function (response) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('BLOQUEO_PALETAS_EXITO'), 3000);
                        kendo.ui.progress($("#BloqueoPaletasTemplate"), false);
                        kendoWindow.close();
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_BLOQUEANDO_PALETAS'), 3000);
                        }
                        kendo.ui.progress($("#BloqueoPaletasTemplate"), false);
                        kendoWindow.close();
                    }
                });                
            },
            eliminar: function () {
                if (this.component)
                    this.component.eliminar();
                $("#center-pane").css("overflow", "");
                this.remove();
                this.off();
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            actualiza: function () {
                var self = this;

                self.initialize();
            }
        });

        return VistaBloqueoPaletas;
    });
