define(['underscore', 'backbone', 'jquery', 'text!../../../fabricacion/html/CrearKOPsMaterial.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, definicion) {
        var vistaCrearKOPsMaterial = Backbone.View.extend({
            tagName: 'div',
            id: 'CrearKOPsMaterial',
            idZona: null,
            tipoSeleccionado: null,
            selectedMaterial: null,
            tipoKOPs: null,
            dsMostosCervezas: null,
            dsMaterialCreados: null,
            dsMaterialDisponibles: null,
            dsMatFabCtr: null,
            template: _.template(plantilla),
            initialize: function (idZona, tipoSeleccionado, tipoKOPs, dsMaterialCreados) {
                var self = this;

                self.idZona = idZona;
                self.tipoSeleccionado = tipoSeleccionado;
                self.tipoKOPs = tipoKOPs;
                self.dsMaterialCreados = dsMaterialCreados;

                self.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();

                var tituloWindow = window.app.idioma.t('CREAR_KOPS_PARA_MATERIAL');
                if (self.tipoKOPs == "Multivalor") {
                    tituloWindow += " (Multivalor)";
                }
                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "470px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#CrearKOPsMaterial').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
                
            },
            configurarControles: function () {
                var self = this;

                self.cargarComboMateriales();

                $("#btnCrearKopsMaterial").kendoButton({
                    click: function () { self.crearKopsMaterial(); }
                });

                $("#btnCancelarKopsMaterial").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            cargarComboMateriales: function () {
                var self = this;
                var promise;

                // Buscamos materiales disponibles según tipo de WO
                switch (self.tipoSeleccionado) {
                    case 1: // Cocción
                        promise = self.obtenemosMatCoccion();
                        break;
                    case 2: // Fermentación
                    case 3: // Trasiego
                    case 4: // Guarda
                        promise = self.obtenemosMatFermentacion();
                        break;
                    case 6: // Prellenado
                        promise = self.obtenemosMatCervezas();
                        break;
                    case 7: // Concentrados
                        promise = self.obtenemosMatConcentrados();
                        break;
                    default:
                        //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('TIPO_WO_ERROR'), 4000);
                        promise = Promise.resolve(); // para continuar
                }

                promise.then(function () {

                    if (self.tipoSeleccionado == 5) {
                        self.dsMaterialDisponibles = [];
                    }
                    // Filtramos los materiales disponibles, eliminando los que ya están en dsMaterialCreados
                    self.dsMaterialDisponibles = self.dsMaterialDisponibles.filter(matDisp =>
                        !self.dsMaterialCreados.some(matCread => matCread.IdMaterial === matDisp.IdMaterial)
                    );

                    if (self.dsMaterialDisponibles.length == 0 && self.tipoSeleccionado != 5) {
                        $("#avisoMaterial").show();
                    }

                    // Cargamos combo materiales solo cuando se hayan obtenido los datos
                    self.$("#cmbMaterial").kendoDropDownList({
                        dataSource: self.dsMaterialDisponibles.map(item => ({
                            IdMaterial: item.IdMaterial,
                            DescripcionMaterial: `${item.IdMaterial} - ${item.DescripcionMaterial}`
                        })),
                        filter: "contains",
                        dataTextField: "DescripcionMaterial",
                        dataValueField: "IdMaterial",
                        optionLabel: window.app.idioma.t('SELECCIONAR')
                    });

                });
            },
            obtenemosMatCoccion: function () {
                var self = this;
                return self.obtenemosRelCervezasMostos().then(function () {
                    var vistos = new Set();
                    self.dsMaterialDisponibles = self.dsMostosCervezas
                        .filter(item => item.CodMostCOC && item.DescripcionCodMostCOC)
                        .map(item => ({ IdMaterial: item.CodMostCOC, DescripcionMaterial: item.DescripcionCodMostCOC }))
                        .filter(m => {
                            if (vistos.has(m.IdMaterial)) return false;
                            vistos.add(m.IdMaterial);
                            return true;
                        });
                });
            },
            obtenemosMatFermentacion: function () {
                var self = this;
                return self.obtenemosRelCervezasMostos().then(function () {
                    var vistos = new Set();
                    self.dsMaterialDisponibles = self.dsMostosCervezas
                        .filter(function (item) {
                            return item.CodMostFERM && item.DescripcionCodMostFERM;
                        })
                        .map(function (item) {
                            return {
                                IdMaterial: item.CodMostFERM,
                                DescripcionMaterial: item.DescripcionCodMostFERM
                            };
                        })
                        .filter(function (m) {
                            if (vistos.has(m.IdMaterial)) return false;
                            vistos.add(m.IdMaterial);
                            return true;
                        });
                });
            },
            obtenemosMatCervezas: function () {
                var self = this;
                return self.obtenemosRelCervezasMostos().then(function () {
                    var vistos = new Set();
                    self.dsMaterialDisponibles = self.dsMostosCervezas
                        .filter(function (item) {
                            return item.CodCervTCP && item.DescripcionCodCervTCP &&
                                item.DescripcionCodCervTCP.includes("CZA") &&
                                !item.DescripcionCodCervTCP.includes("M.P.A");
                        })
                        .map(function (item) {
                            return {
                                IdMaterial: item.CodCervTCP,
                                DescripcionMaterial: item.DescripcionCodCervTCP
                            };
                        })
                        .filter(function (m) {
                            if (vistos.has(m.IdMaterial)) return false;
                            vistos.add(m.IdMaterial);
                            return true;
                        });
                });
            },
            obtenemosRelCervezasMostos: function () {
                var self = this;

                if (self.dsMostosCervezas) {
                    return Promise.resolve();
                } else {
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                            type: "GET",
                            url: "../api/ObtenerRelacionMostosCervezas",
                            cache: true,
                            dataType: 'json'
                        }).done(function (data) {
                            self.dsMostosCervezas = data;
                            resolve();
                        }).fail(function (e) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/ObtenerRelacionMostosCervezas', 4000);
                            reject(e);
                        });
                    });
                }
            },
            obtenemosMatConcentrados: function () {
                var self = this;
                return self.ObtenerMaterialesFabricacion().then(function () {
                    var vistos = new Set();
                    self.dsMaterialDisponibles = self.dsMatFab
                        .map(function (item) {
                            return {
                                IdMaterial: item.IdMaterial,
                                DescripcionMaterial: item.Descripcion
                            };
                        })
                        .filter(function (m) {
                            if (vistos.has(m.IdMaterial)) return false;
                            vistos.add(m.IdMaterial);
                            return true;
                        });
                });
            },
            ObtenerMaterialesFabricacion: function () {
                var self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerMaterialesFabricacion",
                        dataType: 'json'
                    }).done(function (data) {
                        // Filtramos para seleccionar solo los concentrados
                        var filteredData = data.filter(function (item) {
                            return item.IdClase === "CTR";
                        });
                        self.dsMatFab = filteredData || [];
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        reject(e);
                    });
                });
            },

            events: {

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.eliminar();
                this.window.close();
            },
            crearKopsMaterial: async function () { 
                var self = this;

                self.selectedMaterial = $("#cmbMaterial").data("kendoDropDownList").value();

                if (self.selectedMaterial == "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_MATERIAL'), 4000);
                    return;
                }

                try {
                    let kopsPromise = (self.tipoKOPs === "Normal")
                        ? self.obtenerKOPsMaterial()
                        : self.obtenerKOPsMultivalorMaterial();

                    let results = await Promise.all([kopsPromise]);
                    let kops = results[0];

                    if (kops && kops.length > 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANTILLAS_KOPS_EXISTEN'), 5000);
                    } else {
                        self.crearPlantillasKOPs();
                    }
                } catch (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), e.message, 4000);
                }
            },
            obtenerKOPsMaterial: function () {
                var self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerKOPSMostosPorZonaMostoTipoOrden/" + self.idZona + "/" + self.selectedMaterial + "/" + self.tipoSeleccionado,
                        dataType: 'json'
                    }).done(function (data) {
                        resolve(data);
                    }).fail(function (e) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.responseJSON?.Message || "Error en la solicitud", 3000);
                        reject(e);
                    });
                });
            },
            obtenerKOPsMultivalorMaterial: function () {
                var self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerListadoKOPsMultivalorPorZonaTipoMosto/" + self.tipoSeleccionado + "/" + self.idZona + "/" + self.selectedMaterial,
                        dataType: 'json'
                    }).done(function (data) {
                        resolve(data);
                    }).fail(function (e) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.responseJSON?.Message || "Error en la solicitud", 3000);
                        reject(e);
                    });
                });
            },
            crearPlantillasKOPs: function () {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "POST",
                        url: "../api/CrearPlantillasKOPsMaterial/" + self.selectedMaterial + "/" + self.idZona + "/" + self.tipoSeleccionado + "/" + self.tipoKOPs,
                        dataType: 'json'
                    }).done(function (res) {
                        if (res == "OK") {
                            self.window.close();
                            self.eliminar();
                            $("#divMosto").data('kendoGrid').dataSource.read(); //Actualizamos grid de mostos en la pantalla que llama

                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PLANTILLAS_KOPS_CREADAS'), 5000);

                            resolve(res);
                        }
                        else {
                            if (res.includes("Error:")) {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'ERROR ' + window.app.idioma.t('CREAR_KOPS_PARA_MATERIAL'), 4000);
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), res, 4000);
                            }
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/CrearPlantillasKOPsMaterial', 4000);

                        reject(e);
                        Backbone.trigger('eventCierraDialogo');
                    });
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearKOPsMaterial;
    });