define(['underscore', 'backbone', 'jquery', 'text!../../../html/envasado/VerQRMMPPZona.html', 'definiciones', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, Plantilla, definiciones, Not, JSZip) {
        var VerQRMMPPZona = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            zonaEq: null,
            ubicacionesLinea: null,
            ubicacionesZona: null,
            listaLotes: null,
            barcode: null,
            initialize: function () {
                var self = this;

                self.zonaEq = window.app.zonaSel.maquinas;

                // Usar promesas para cargar datos
                var promesas = [                               
                    self.obtenerUbicacionesPorLinea(window.app.lineaSel.numLinea),
                ];

                // Cuando ambas promesas se resuelvan, renderizamos
                Promise.all(promesas)
                    .then(function () {
                        // Obtenemos ubicaciones de la zona en la que estamos
                        var maquinas = self.zonaEq ? self.zonaEq.map(item => item.nombre) : [];
                        self.ubicacionesZona = self.ubicacionesLinea.filter(ubicacion =>
                            maquinas.includes(ubicacion.Nombre)
                        );

                        // Llamamos a obtenemosLotes() y esperamos su resolución
                        return self.obtenemosLotes();
                    })
                    .then(() => {
                        // Una vez obtenidos los lotes, renderizamos
                        self.render();
                    })
                    .catch(function (error) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_DATOS'), 4000);
                    });
            },
            obtenemosLotes: function () {
                var self = this;

                return new Promise((resolve, reject) => {

                    var promesas = self.ubicacionesZona.map(ubicacion =>
                        self.obtenerLotesPorUbicacion(ubicacion.IdUbicacion)
                            .then(lotes => ({ ubicacionId: ubicacion.IdUbicacion, lotes }))
                            .catch(error => {
                                Not.crearNotificacion('ERROR', window.app.idioma.t('ERROR'), 'ObtenerLotesMateriaPrimaPorIdUbicacion', 4000);
                                return { ubicacionId: ubicacion.IdUbicacion, lotes: [] };
                            })
                    );

                    Promise.all(promesas)
                        .then(resultados => {
                            // Quitamos los lotes que sean cerveza
                            self.listaLotes = resultados.flatMap(res =>
                                res.lotes.filter(lote =>
                                    lote.CLASE_MATERIAL && !lote.CLASE_MATERIAL.toUpperCase().includes("CER") &&
                                    lote.CANTIDAD_ACTUAL > 0
                                )
                            );
                            resolve(); 
                        })
                        .catch(error => {
                            Not.crearNotificacion('ERROR', window.app.idioma.t('ERROR'), 'Obtener Lotes', 4000);
                            reject(error);
                        });
                });
            },
            obtenerLotesPorUbicacion: function (idUbicacion) {
                var self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({                        
                        url: "../api/ObtenerLotesMateriaPrimaPorIdUbicacion?idUbicacion=" + idUbicacion,
                        type: "GET",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (error) {
                            Not.crearNotificacion('ERROR', window.app.idioma.t('ERROR'), 'ObtenerLotesMateriaPrimaPorIdUbicacion', 4000);
                            reject(error);
                        }
                    });
                });
            },
            obtenerUbicacionesPorLinea: function (Linea) {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "../api/ObtenerUbicacionesPorLinea?Linea=" + Linea,
                        success: function (res) {
                            self.ubicacionesLinea = res;
                            resolve();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                            }
                            reject(e);
                        }
                    });
                });
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                var contenedorBotones = $('#contenedorBotones', self.el);

                if (!self.listaLotes || self.listaLotes.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_LOTES_MOSTRAR'), 4000);
                    return;
                }

                // Crear botones dinámicamente según los lotes
                self.listaLotes.forEach((lote, index) => {
                    var btnHtml = `
                    <div id="divLote${index}" style="padding-top: 10px">
                        <button id="btnLote${index}" class="k-button k-button-icontext ajustesBoton btnLote"
                            data-idlote="${lote.LOTE_MES}">
                            <div><strong>${lote.CLASE_MATERIAL}</strong></div>
                            <div>${lote.DESCRIPCION_UBICACION}</div>
                            <div>${lote.LOTE_MES}</div>
                        </button>
                    </div>`;

                    contenedorBotones.append(btnHtml);
                });

                $("#center-pane").css("overflow", "hidden");

            },
            events: {
                'click .btnLote': function (event) { this.generarQR(event); },
            },
            generarQR: function (event) {
                var idLoteMES = $(event.currentTarget).data("idlote");
                this.generarEtiqueta(idLoteMES);
            },

            generarEtiqueta: function (idLoteMES) {

                // Limpiar cualquier código QR anterior
                $("#barcode").empty();

                var barcode = $("#barcode").kendoQRCode().data("kendoQRCode");                

                barcode.setOptions({
                    value: idLoteMES,
                    renderAs: "svg",
                    color: "#000000",
                    size: 520,
                    text: { visible: false }
                });
                barcode.redraw();

                $("#txtBarcode").remove();
                $("#barcode div").append('<center><h3 style="color:#000000" id="txtBarcode">' + idLoteMES + '</h3></center>');

                var mywindow = window.open('', 'QR', '');
                mywindow.document.write('<html><head><title>QR - ' + idLoteMES + '</title>');
                mywindow.document.write("<style>");
                mywindow.document.write(`
                    @media print {
                        body { margin: 0; padding: 0; }
                        #barcode {
                            width: 100%;
                            height: auto;
                            page-break-inside: avoid; /* Evita saltos de página */
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        svg {
                            max-width: 100%;
                            height: auto;
                            margin-top: 80px;
                        }
                    }
                `);
                mywindow.document.write("</style>");
                mywindow.document.write('</head><body>');
                mywindow.document.write('<div id="barcode">' + document.getElementById('barcode').outerHTML + '</div>');
                mywindow.document.write('</body></html>');

                mywindow.document.close();
                mywindow.focus();
                mywindow.print();

                return true;
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
                let self = this;
                self.initialize();
            }
        });

        return VerQRMMPPZona;
    });
