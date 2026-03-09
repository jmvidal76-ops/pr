define(['underscore', 'backbone', 'jquery', 'text!../../../html/Mermas/GestionMermas.html', 'compartido/notificaciones',
    'compartido/KeyboardSettings', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, Not, KeyboardSettings, enums) {
        var vistaGestionMermas = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            constClaseMaquina: enums.ClaseMaquina(),
            constClaseEnvase: enums.ClaseEnvase(),
            //maquinas: "LLE_ETQ_IBV",
            listaMermasProveedor: [],
            cacheProveedores: [],
            scrollGrid: null,
            turnoACargar: null,
            pestania_seleccionada: 0,
            turnoActual: true,
            initialize: async function (options) {
                let self = this;
                self.turnoACargar = window.app.vistaPrincipal.turnoActual != null ? window.app.vistaPrincipal.turnoActual.Id : null;
                self.pestania_seleccionada = 0;
                self.turnoActual = true;

                try
                {
                    self.maquinas = await self.getMaquinasMermas();
                }
                catch (e)
                {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                    self.maquinas = [];
                }                

                self.render();

                //Detecta evento de cambio de puesto en cualquier pestaña
                Backbone.on('eventCambioPuestoGlobal', (data) => {
                    if (window.app.sesion.attributes.usuarioId == data.sesion.usuarioId) {  //Comprobamos si es el mismo usuario
                        //Actualiza datos de window.app 
                        window.app.sesion.attributes = data.sesion;
                        window.app.vistaPrincipal.actualizaLineaZona();
                        window.app.vistaPrincipal.actualizaPie();

                        self.actualiza();
                    }
                }, this);
                Backbone.on('eventCambioTurnoActual', function () {
                    if (!self.turnoACargar) {
                        self.turnoACargar = window.app.vistaPrincipal.turnoActual != null ? window.app.vistaPrincipal.turnoActual.Id : null;
                    }
                    this.CargarMermas();
                }, this);
            },
            getMaquinasMermas: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/Mermas/Maquinas/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {

                            const maquinas = res.map(m => ({
                                id: m.Id,
                                clase: m.Info[1],
                                codigo: m.Info[0],
                                descripcion: m.Valor,
                                linea: m.Info[2]
                            }));

                            resolve(maquinas);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    });
                })
            },
            render: function () {
                let self = this;

                $(this.el).html(this.template());
                $("#center-pane").css("overflow", "hidden");

                self.CargarPestanias();
                self.$("[data-funcion]").checkSecurity();

                const clases = [... new Set(self.maquinas.map(m => m.clase))];
                let maquinaInicial = clases[self.pestania_seleccionada];
                self.CambiarPestania(maquinaInicial);

                if (self.turnoActual) {
                    $("#btnTurnoAnterior").show();
                    $("#btnTurnoActual").hide();
                } else {
                    $("#btnTurnoAnterior").hide();
                    $("#btnTurnoActual").show();
                }
            },
            CargarPestanias: function () {
                let self = this;
                let pestaniasData = [];

                let idx = 0;
                const _maquinas = [... new Set(self.maquinas.filter(f => f.linea == window.app.lineaSel.id).map(m => m.clase))];

                for (let m of _maquinas) {
                    pestaniasData.push({
                        MaquinaClase: m,
                        MaquinaNombre: window.app.idioma.t(self.constClaseMaquina[m]),
                        MaquinaIndex: idx++
                    });
                }

                let templatePestanias = kendo.template(self.$("#pestaniaTemplate").html());
                let result = templatePestanias(pestaniasData);
                self.$("#pestanias_maquinas").html(result);
            },
            CambiarPestania: function (claseMaquina) {
                let self = this;

                let elem = self.$("#btnPestaniaMerma_" + claseMaquina);
                if (elem.length > 0 && !elem.hasClass("selected_tab")) {
                    self.$("#gridMermasTerminal").empty();
                    self.$(".pestania_mermas_button").removeClass("selected_tab");
                    elem.addClass("selected_tab");
                    self.pestania_seleccionada = elem.data("index");
                    self.CargarMermas(claseMaquina);
                }
            },
            CargarMermas: function (claseMaquina) {
                let self = this;

                if (claseMaquina == undefined) {
                    claseMaquina = $(".pestania_mermas_button.selected_tab").data("clase");
                }

                if (self.turnoACargar == null) {
                    self.$("#gridMermasTerminal").empty();
                    return;
                }

                kendo.ui.progress($("#center-pane"), true)

                $.ajax({
                    type: "GET",
                    url: "../api/MermasTerminal/" + window.app.lineaSel.id + "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: {
                        claseMaquina: claseMaquina,
                        idTurno: self.turnoACargar
                    },
                    complete: function () {
                        kendo.ui.progress($("#center-pane"), false)
                    },
                    success: function (res) {
                        // Construimos los contadores unificando los que obtengamos en la llamada

                        let data = [];
                        let orden = 1;

                        if (res.length > 0) {
                            data.push({
                                orden: 1,
                                contadores: {},
                                nombre: window.app.idioma.t("CONTADOR_PRODUCCION")
                            });
                        }

                        for (let r of res) {
                            for (let c of r.Contadores) {
                                // comprobamos si es el contador de produccion
                                if (c.ContadorConfiguracion.EsContadorProduccion) {
                                    data[0].contadores[r.Id] = c;
                                }
                                else {
                                    let contadorAux = data.find(e => e.nombre.toLowerCase() == c.ContadorConfiguracion.Descripcion.toLowerCase());
                                    if (contadorAux != null) {
                                        contadorAux.contadores[r.Id] = c;
                                    } else {
                                        let d = {
                                            orden: orden++,
                                            contadores: {},
                                            nombre: c.ContadorConfiguracion.Descripcion
                                        };
                                        d.contadores[r.Id] = c;
                                        data.push(d)
                                    }
                                }
                            }
                        }

                        if (res.length > 0) {
                            data.push({
                                orden: 1000000,
                                idContador: -1,
                                nombre: window.app.idioma.t("PROVEEDOR")
                            });
                            data.push({
                                orden: 1000001,
                                idContador: -2,
                                nombre: window.app.idioma.t("WO")
                            });
                            data.push({
                                orden: 1000002,
                                idContador: -3,
                                nombre: window.app.idioma.t("OBSERVACIONES")
                            });
                        }

                        self.listaMermasProveedor = [];

                        res.sort(function (a, b) {
                            return new Date(b.FechaCreado) - new Date(a.FechaCreado);
                        });

                        // construimos una lista de registros a mostrar, teniendo en cuenta que si existen varios registros para el mismo turno y máquina con distinto proveedor o WO,
                        // debe mostrarse sólo uno de ellos (el más reciente), y poder cambiar entre los distintos existentes.
                        for (let r of res) {
                            let nuevoRegistro = {
                                IdMaquina: r.IdMaquina,
                                MaquinaDescripcion: r.MaquinaDescripcion,
                                actualIndexProv: self.cacheProveedores[r.IdMaquina] != null ? self.cacheProveedores[r.IdMaquina]["PROV"] : 0,
                                actualIndexWO: self.cacheProveedores[r.IdMaquina] != null ? self.cacheProveedores[r.IdMaquina]["WO"] : 0,
                                proveedores: [
                                    {
                                        CodigoProveedor: r.CodigoProveedor,
                                        registros: [r]
                                    }
                                ]
                            }

                            let reg = self.listaMermasProveedor.find(e => e.IdMaquina == r.IdMaquina);
                            if (reg != null) {
                                let prov = reg.proveedores.find(e => e.CodigoProveedor == r.CodigoProveedor);
                                if (prov != null) {
                                    prov.registros.push(r);
                                }
                                else {
                                    reg.proveedores.push(nuevoRegistro.proveedores[0]);
                                }
                            } else {
                                self.listaMermasProveedor.push(nuevoRegistro)
                            }
                        }

                        self.CrearGridMermas(data);
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_MERMAS'), 4000);
                        }
                    }
                });
            },
            MostrarTurnoActual: function () {
                let self = this;

                $("#btnTurnoAnterior").show();
                $("#btnTurnoActual").hide();
                self.turnoActual = true;

                // Habilitamos el botón de crear Merma
                $("#btnCrearMerma").attr("disabled", false);

                self.turnoACargar = window.app.vistaPrincipal.turnoActual != null ? window.app.vistaPrincipal.turnoActual.Id : null;
                self.CargarMermas();

            },
            ObtenerTurnoAnterior: async function () {
                let self = this;

                kendo.ui.progress($("#center-pane"), true)
                $("#btnCrearMerma").attr("disabled", true);

                // comprobamos si existe turno actual, si no lo obtenemos usando la fecha, linea y tipo turno
                try {
                    if (window.app.vistaPrincipal.turnoActual == null) {
                        self.turnoACargar = await self.ObtenerTurnoAnteriorSinId(window.app.lineaSel.id, new Date().toISOString());
                    } else {
                        self.turnoACargar = await self.ObtenerTurnoAnteriorConId(window.app.vistaPrincipal.turnoActual.Id);
                    }
                } catch (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_ANTERIOR'), 4000);
                    }
                }

                $("#btnTurnoAnterior").hide();
                $("#btnTurnoActual").show();
                self.turnoActual = false;

                kendo.ui.progress($("#center-pane"), false);

                self.CargarMermas();
            },
            ObtenerTurnoAnteriorSinId: async function (idLinea, fecha) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/TurnoAnteriorFechaLinea/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: {
                            idLinea: idLinea,
                            fecha: fecha
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    });
                });
            },
            ObtenerTurnoAnteriorConId: async function (idTurnoActual) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/TurnoAnterior/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: {
                            idTurnoActual: idTurnoActual
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    });
                });
            },
            CrearGridMermas: function (data) {
                let self = this;

                self.$("#gridMermasTerminal").empty();

                let columns = [
                    {
                        title: " ",
                        template: "#=nombre#",
                        width: "250px"
                    }
                ]

                //Reseteamos la cache de indices de proveedores, y la volvemos a generar
                self.cacheProveedores = {};
                for (let r of self.listaMermasProveedor) {
                    self.cacheProveedores[r.IdMaquina] = {
                        PROV: r.actualIndexProv,
                        WO: r.actualIndexWO
                    };
                    columns.push({
                        title: r.MaquinaDescripcion,
                        width: "500px",
                        template: (item) => {
                            let registroMostrar = r.proveedores[r.actualIndexProv].registros[r.actualIndexWO];

                            if (item.idContador < 0) {
                                // Proveedor
                                if (item.idContador == -1) {
                                    return registroMostrar.Proveedor;
                                }
                                // WO
                                if (item.idContador == -2) {
                                    return registroMostrar.WO;
                                }
                                // Observaciones
                                if (item.idContador == -3) {
                                    let observacion = registroMostrar.Observaciones != null ? registroMostrar.Observaciones : "";
                                    let inputObservaciones = "<input class='k-textbox keyboardOn' id='input_observaciones_" + registroMostrar.Id + "' data-registro='" + registroMostrar.Id + "' type='text' value='" + observacion + "' initial-value='" + observacion + "' onfocusout='window.app.vista.EditarObservacion(" + registroMostrar.Id + ")' style='width:100%'/>";

                                    return inputObservaciones;
                                }
                            } else {
                                // Mostramos el campo valor y unidad, siendo editables. También tenemos en cuenta si el valor está dentro de los rangos definidos
                                let contador = item.contadores[registroMostrar.Id]
                                if (contador != undefined) {
                                    let estado = contador.Estado;
                                    //let estado = contador.Valor < contador.ContadorConfiguracion.PorcentajeMinimo ? 1 : contador.Valor > contador.ContadorConfiguracion.PorcentajeMaximo ? 3 : 2;
                                    let estadoClase = estado == 1 ? "contador_merma_bajo" : estado == 2 ? "contador_merma_medio" : estado == 3 ? "contador_merma_alto" : "";

                                    let inputValor = "<input class='valor_contador_mermas' id='input_valor_" + contador.Id + "' data-registro='" + registroMostrar.Id + "' data-id='" + contador.Id +
                                        "' data-role='numerictextbox' data-decimals='0' data-min='0' data-restrictdecimals='true' data-format='n0' value='" + contador.Valor.toString().replace(".", ",") +
                                        "' initial-value='" + contador.Valor.toString().replace(".", ",") + "' onfocusout='window.app.vista.EditarContador(" + contador.Id + ")' onfocusin='window.app.vista.ContadorClick(this)'/>";

                                    let inputUnidad = "<input class='k-textbox unidad_contador_mermas keyboardOn' id='input_unidad_" + contador.Id + "' data-registro='" +
                                        registroMostrar.Id + "' type='text' value='" + contador.Unidad + "' initial-value='" + contador.Unidad + "' onfocusout='window.app.vista.EditarContador(" + contador.Id + ")'/>";

                                    let porcentaje = "<span class='porcentaje_contador_mermas'></span>";
                                    let inputJustificacion = "<input id='input_justificacion_" + contador.Id + "' data-registro='" + registroMostrar.Id + "' data-maquina='"
                                        + r.MaquinaDescripcion + "' type='text' hidden value='" + (contador.Justificacion || "") + "' initial-value='" + (contador.Justificacion || "") + "'/>";
                                    let botonJustificar = "";

                                    if (estado != 0) {
                                        porcentaje = "<span class='porcentaje_contador_mermas'>" + kendo.format('{0:n2} %', contador.Porcentaje) + "</span>";
                                        botonJustificar = "<span class='boton_justificar_contador " + (estado == 1 ? 'noClick' : '') + "' onclick='"
                                            + (estado >= 2 ? `window.app.vista.MostrarModalJustificar(${contador.Id})` : '') + "'><img src='img/KOP_" + (estado == 1 ? "Verde" : estado == 2 ? "Naranja" : "Rojo") + ".png'></img></span>";
                                    }

                                    return "<div class='" + estadoClase + "'>" + inputValor + porcentaje + inputUnidad + inputJustificacion + botonJustificar + "</div>";
                                }
                            }

                            return "";

                        },
                    })
                }

                self.$(".mermas-grid-container").css("max-width", (400 + (columns.length - 1) * 430) + "px");
                if (data.length == 0) {
                    self.$(".mermas-grid-container").hide();
                }
                else {
                    self.$(".mermas-grid-container").show();
                }

                self.$("#gridMermasTerminal").kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        data: data
                    }),
                    columns: columns,
                    dataBound: function (e) {
                        // configuramos todos los inputs de valor para que sean widgets de kendo
                        e.sender.element.find("[data-role='numerictextbox']").each(function (idx, elem) {
                            $(elem).kendoNumericTextBox({
                                decimals: 0,
                                restrictDecimals: true,
                                format: "n0",
                                min: 0
                            });
                        });

                        // Teclado virtual en los numericTextBox de kendo, configurado de esta forma para evitar que pulsar las flechas de incremento/decremento muestre el teclado
                        $(".k-numeric-wrap .k-formatted-value").addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                        KeyboardSettings.Load(".k-numeric-wrap .k-formatted-value",
                            {
                                openOn: "click",
                                accepted: function (e, keyboard, elem) {
                                    let innerInput = $(elem).parent().children().eq(1);
                                    let id = innerInput.data().id;
                                    innerInput.getKendoNumericTextBox().value(keyboard.$preview.val());
                                    self.EditarContador(id, true);
                                },
                                layout: "num"
                            });

                        // añadimos controles para cambiar entre proveedores cuando existan varios
                        e.sender.element.find(".k-grid-header").find("th").each(function (idx, elem) {
                            let columnIndex = $(elem).data("index");
                            $("#cambioProveedor_" + columnIndex).remove();
                            let maq = self.listaMermasProveedor.find(f => f.MaquinaDescripcion == $(elem).html());
                            if (maq != null) {
                                if (maq.proveedores.length > 1 || maq.proveedores[0].registros.length > 1) {
                                    let puedeIzqProv = maq.actualIndexProv + 1 < maq.proveedores.length;
                                    let puedeDerProv = maq.actualIndexProv > 0;
                                    let puedeIzqWO = maq.actualIndexWO + 1 < maq.proveedores[maq.actualIndexProv].registros.length;
                                    let puedeDerWO = maq.actualIndexWO > 0;
                                    let leftArrowProv = "<span id='cambiarProveedorIzq_" + maq.IdMaquina + "'><img src='img/left.png' class='cambio_proveedor_flecha" + (puedeIzqProv ? "" : " disabled") + "'></span>";
                                    let rightArrowProv = "<span id='cambiarProveedorDer_" + maq.IdMaquina + "'><img src='img/right.png' class='cambio_proveedor_flecha" + (puedeDerProv ? "" : " disabled") + "'></span>";
                                    $(elem).append("<span class='cambio_proveedor' id='cambioProveedor_" + columnIndex + "'><span>" + window.app.idioma.t("CAMBIO_PROVEEDOR") + ":</span>" + leftArrowProv + rightArrowProv + "</span>");

                                    let leftArrowWO = "<span id='cambiarWOIzq_" + maq.IdMaquina + "'><img src='img/left.png' class='cambio_proveedor_flecha" + (puedeIzqWO ? "" : " disabled") + "'></span>";
                                    let rightArrowWO = "<span id='cambiarWODer_" + maq.IdMaquina + "'><img src='img/right.png' class='cambio_proveedor_flecha" + (puedeDerWO ? "" : " disabled") + "'></span>";
                                    $(elem).append("<span class='cambio_wo' id='cambioWO_" + columnIndex + "'><span>" + window.app.idioma.t("CAMBIO_WO") + ":</span>" + leftArrowWO + rightArrowWO + "</span>");

                                    if (puedeIzqProv) {
                                        $("#cambiarProveedorIzq_" + maq.IdMaquina).click((i) => {
                                            maq.actualIndexProv++;
                                            self.cacheProveedores[maq.IdMaquina]["PROV"] = maq.actualIndexProv;
                                            maq.actualIndexWO = 0;
                                            self.CrearGridMermas(data);
                                        })
                                    }
                                    if (puedeDerProv) {
                                        $("#cambiarProveedorDer_" + maq.IdMaquina).click((i) => {
                                            maq.actualIndexProv--;
                                            self.cacheProveedores[maq.IdMaquina]["PROV"] = maq.actualIndexProv;
                                            maq.actualIndexWO = 0;
                                            self.CrearGridMermas(data);
                                        })
                                    }

                                    if (puedeIzqWO) {
                                        $("#cambiarWOIzq_" + maq.IdMaquina).click((i) => {
                                            maq.actualIndexWO++;
                                            self.cacheProveedores[maq.IdMaquina]["WO"] = maq.actualIndexWO;
                                            self.CrearGridMermas(data);
                                        })
                                    }
                                    if (puedeDerWO) {
                                        $("#cambiarWODer_" + maq.IdMaquina).click((i) => {
                                            maq.actualIndexWO--;
                                            self.cacheProveedores[maq.IdMaquina]["WO"] = maq.actualIndexWO;
                                            self.CrearGridMermas(data);
                                        })
                                    }
                                }
                            }
                        })

                        // Hacemos scroll al ultimo registro actualizado
                        if (self.scrollGrid) {
                            this.element.find(".k-grid-content").animate({
                                scrollTop: self.scrollGrid
                            }, 100);
                            self.scrollGrid = 0;
                        }

                        if (self.inputFocus) {
                            let elem = $("#" + self.inputFocus);

                            if (!(localStorage.getItem("tecladoVirtual") == "true")) {
                                let role = elem.data("role")
                                if (role) {
                                    if (role == "numerictextbox") {
                                        elem = elem.data("kendoNumericTextBox");
                                    }
                                }
                                elem.focus();
                                document.getElementById(self.inputFocus).setSelectionRange(self.inputPosition, self.inputPosition);
                                elem.trigger("focusin");
                            }
                            else {
                                elem.parent().children()[0].click();
                                self.ContadorClick();
                            }

                            self.inputFocus = null;
                            self.inputPosition = 0;
                        }
                    }
                });

                self.$("#gridMermasTerminal").keyup(function (e) {
                    if (e.which == 13) {
                        let focused = $(document.activeElement);
                        if (focused.length && focused.hasClass("valor_contador_mermas")) {
                            focused.blur();
                            let id = focused.parent().find("[data-id]").data("id");
                            let nextInput = self.SiguienteInput(id);

                            if (nextInput) {
                                nextInput.data("kendoNumericTextBox").focus();
                            }
                        }
                    }
                    e.stopImmediatePropagation();
                })

                // Inicializamos el teclado virtual
                $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load();
            },
            SiguienteInput: function (actualInputId) {
                let idAnterior = 0;
                // hacemos focus al siguiente input de contador
                let listaRegistros = [];
                let inputs = $(".valor_contador_mermas[data-id]");
                let registroActual = inputs.filter(`[data-id='${actualInputId}']`).data("registro");

                inputs.each(function () {
                    let elemRegistro = $(this).data("registro");

                    if (!listaRegistros.includes(elemRegistro)) {
                        listaRegistros.push(elemRegistro);
                    }
                    else {
                        return false;
                    }
                });

                let finalInputs = [];
                for (let s of listaRegistros) {
                    if (finalInputs.length != 0 || s == registroActual) {
                        $.merge(finalInputs, inputs.filter(`[data-registro='${s}']`));
                    }
                }

                let nextInput;
                //$(".valor_contador_mermas[data-id]").sort((a, b) => $(a).data("registro") - $(b).data("registro"))
                $(finalInputs).each((_, elem) => {
                    if (actualInputId == idAnterior) {
                        nextInput = $(elem);
                        //if (fromKeyboard) {
                        //    $(elem).parent().children()[0].click();
                        //} else {
                        //    $(elem).data("kendoNumericTextBox").focus();
                        //}
                        return false;
                    }
                    idAnterior = $(elem).data("id");
                })

                return nextInput;
            },
            EditarContador: function (contadorId, fromVirtualKeyboard = false) {
                let self = this;

                let valorInput = $(`#input_valor_${contadorId}`);
                if (!valorInput.getKendoNumericTextBox()) {
                    return;
                }

                let unidadInput = $(`#input_unidad_${contadorId}`);
                let justificacionInput = $(`#input_justificacion_${contadorId}`);
                if (valorInput.getKendoNumericTextBox().value() == undefined) {
                    valorInput.getKendoNumericTextBox().value(0)
                }

                let valor = valorInput.getKendoNumericTextBox().value();
                let unidad = unidadInput.val();
                let justificacion = justificacionInput.val();

                let registroId = parseInt(valorInput.data("registro"));

                // Comprobamos si alguno ha sido modificado de su valor inicial
                if (parseFloat(valorInput.attr("initial-value").replace(",", ".")) != valor ||
                    unidadInput.attr("initial-value") != unidad ||
                    justificacionInput.attr("initial-value") != justificacion) {

                    kendo.ui.progress($("#gridMermasTerminal"), true)

                    $.ajax({
                        type: "PUT",
                        url: "../api/Mermas/contadores/" + contadorId,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({
                            Id: contadorId,
                            Valor: valor,
                            Unidad: unidad,
                            Justificacion: justificacion
                        }),
                        complete: function () {
                            kendo.ui.progress($("#gridMermasTerminal"), false)
                        },
                        success: function (res) {
                            if (res) {
                                let distance = $("#gridMermasTerminal").find(".k-grid-content").scrollTop();
                                self.scrollGrid = distance;

                                if (!fromVirtualKeyboard) {
                                    let focusInput = $(document.activeElement);
                                    if (focusInput.length) {
                                        self.inputPosition = document.activeElement.selectionStart;
                                        self.inputFocus = focusInput.attr("id");
                                    } else {
                                        self.inputFocus = null;
                                        self.inputPosition = 0;
                                    }
                                }
                                else {
                                    let nextInput = self.SiguienteInput(contadorId);

                                    if (nextInput) {
                                        self.inputFocus = nextInput.attr("id");
                                        self.inputPosition = 0;                                        
                                    }
                                    else {
                                        self.inputFocus = null;
                                        self.inputPosition = 0;
                                    }
                                }                                

                                self.CargarMermas();
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_CONTADOR_MERMAS'), 4000);
                            }
                        }
                    });
                }
                else {
                    // El input no ha cambiado
                    if (fromVirtualKeyboard) {
                        // Hemos pulsado confirmar en el teclado virtual, cambiamos al siguiente input
                        let nextInput = self.SiguienteInput(contadorId);

                        if (nextInput) {
                            nextInput.parent().children()[0].click();
                            self.ContadorClick();
                        }
                    }
                }
            },
            EditarObservacion: function (registroId) {
                let self = this;

                let observacionesInput = $(`#input_observaciones_${registroId}`);

                // Comprobamos si ha cambiado el valor del inicial
                let observaciones = observacionesInput.val();

                if (observacionesInput.attr("initial-value") != observaciones) {

                    kendo.ui.progress($("#gridMermasTerminal"), true)

                    $.ajax({
                        type: "PUT",
                        url: "../api/MermasTerminal/registros/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({
                            Id: registroId,
                            Observaciones: observaciones
                        }),
                        complete: function () {
                            kendo.ui.progress($("#gridMermasTerminal"), false)
                        },
                        success: function (res) {
                            let distance = $("#gridMermasTerminal").find(".k-grid-content").scrollTop();
                            self.scrollGrid = distance;
                            let focusInput = $(document.activeElement);
                            if (focusInput.length) {
                                self.inputPosition = document.activeElement.selectionStart;
                                self.inputFocus = focusInput.attr("id");
                            } else {
                                self.inputFocus = null;
                                self.inputPosition = 0;
                            }
                            self.CargarMermas();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO_REGISTRO_MERMAS'), 4000);
                            }
                        }
                    });
                }
            },
            ContadorClick: function (e) {
                let inpt = $(".ui-keyboard-preview-wrapper input");

                if (inpt.length == 0) {
                    inpt = $(e);
                }

                if (inpt.length > 0) {
                    inpt.focus();
                    if (parseInt(inpt.val()) == 0) {
                        inpt.val(null)
                    }
                    //inpt.get(0)
                }
            },
            MostrarModalJustificar: function (contadorId) {
                let self = this;

                let grid = $("#gridMermasTerminal").getKendoGrid();
                let justificarInput = $(`#input_justificacion_${contadorId}`);

                let di = grid.dataItem($(justificarInput).parents("tr"));
                let registroId = parseInt(justificarInput.data("registro"));
                let maquina = justificarInput.data("maquina");

                let contador = di.contadores[registroId];

                if (contador == null) {
                    return;
                }

                // mostramos ventana para introducir la justificacion
                let data = {
                    id: contador.Id,
                    nombre: di.nombre,
                    maquina: maquina,
                    minimo: contador.ContadorConfiguracion.PorcentajeMinimo,
                    maximo: contador.ContadorConfiguracion.PorcentajeMaximo,
                    valor: contador.Valor,
                    porcentaje: contador.Porcentaje,
                    justificacion: contador.Justificacion
                }

                let ventanaJustificar = $("<div />").kendoWindow({
                    title: window.app.idioma.t("JUSTIFICAR_CONTADOR"),
                    close: function () {
                        kendoWindowJustificar.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindowJustificar = ventanaJustificar.getKendoWindow();

                let template = kendo.template($("#justificarContadorModal").html());
                kendoWindowJustificar
                    .content(template(data))
                    .center().open();

                ventanaJustificar.find("#btnJustificarContador").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        justificarInput.val($(`#justificacion_contador_${contadorId}`).val());
                        self.EditarContador(contadorId);
                        kendoWindowJustificar.close();
                    }
                });

                ventanaJustificar.find("#btnCancelarJustificarContador").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        kendoWindowJustificar.close();
                    }
                });

                // Para mostrar el teclado en pantalla
                $('.keyboardOn2').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load(".keyboardOn2");
            },
            events: {
                'click #btnCrearMerma': 'AbrirModalAnadir',
                'click #btnTurnoAnterior': 'ObtenerTurnoAnterior',
                'click #btnTurnoActual': 'MostrarTurnoActual',
            },
            AbrirModalAnadir: function (e) {
                let self = this;

                if (window.app.vistaPrincipal.turnoActual == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TURNO_INACTIVO'), 4000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionMermas'></div>"));

                let datos = {
                    Linea: window.app.lineaSel.id,
                }

                self.ConfigurarModal(e, datos);
            },
            ConfigurarModal: function (e, datos) {
                let self = this;

                let title = window.app.idioma.t('CREAR_REGISTRO_MERMA');
                let template = "../portal/Envasado/html/CrearMerma.html";
                let width = "700px";
                let height = "";

                let ventanaGestion = $("#dlgGestionMermas").kendoWindow(
                    {
                        title: title,
                        width: width,
                        height: height,
                        content: template,
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            ventanaGestion.destroy();
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e, datos, ventanaGestion);
                            if (typeof ventanaGestion != "undefined") {
                                ventanaGestion.center();
                            }
                        }
                    }).getKendoWindow();
            },
            CargaContenidoModal: function (e, datos, w) {
                let self = this;

                $("#trError").hide();

                $("#lineaContainer").hide();
                $("#cmbLinea").prop('required', false);
                $("#idTurno").prop('required', false);
                $("#turnoContainer").hide();

                $("#lblMaquina").text(window.app.idioma.t('MAQUINA'));
                $("#cmbMaquina").kendoDropDownList({
                    dataTextField: "valor",
                    dataValueField: "id",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function(operation){
                                const ds = self.maquinas
                                    .filter(f => f.linea == datos.Linea && f.clase == $(".pestania_mermas_button.selected_tab").data("clase"))
                                    .map(m => ({
                                        id: m.id,
                                        valor: `${m.descripcion} (${m.codigo})`,
                                        clase: m.clase
                                    }));
                                operation.success(ds);
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                            }
                        }
                    }),
                    height: 200,
                    change: function (e) {
                        if ($("#tbClaseMaquina").length > 0) {
                            let claseMaquina = window.app.idioma.t(self.constClaseMaquina[e.sender.dataItem().clase]) || "--"
                            $("#tbClaseMaquina").html(claseMaquina);
                        }
                    }
                });

                $("#lblWO").text(window.app.idioma.t('WO'));
                $("#cmbWO").kendoDropDownList({
                    template: "#=data.id# | #=data.producto.codigo# | #=data.producto.nombre#",
                    valueTemplate: "#=(data.id == null ? window.app.idioma.t('SELECCIONE_WO_PRODUCTO') : data.id +' | '+ data.producto.codigo+' | '+ data.producto.nombre)#",
                    dataValueField: "id",
                    optionLabel: window.app.idioma.t('SELECCIONE_WO_PRODUCTO'),
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                type: "GET",
                                url: "../api/ordenes/obtenerOrdenesTurno/" + window.app.vistaPrincipal.turnoActual.Id,
                                dataType: "json"
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ORDENES_INTERVALO'), 4000);
                            }
                        }
                    }),
                    height: 200
                });

                $("#lblProveedor").text(window.app.idioma.t('PROVEEDOR'));
                $("#cmbProveedor").kendoComboBox({
                    dataTextField: "Nombre",
                    dataValueField: "IdProveedor",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filter: "contains",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/mermas/proveedores/",
                                dataType: "json",
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_PROVEEDORES_MERMAS'), 4000);
                            }
                        }
                    }),
                    height: 200
                });

                // Le añadimos una clase especial al input de texto dentro del combobox para mostrar el teclado
                $("input[name='cmbProveedor_input']").addClass("keyboardOn3")

                $("#btnDialogoGestionAceptar").val(window.app.idioma.t('ACEPTAR'));
                $("#btnDialogoGestionCancelar").val(window.app.idioma.t('CANCELAR'));

                $("#btnDialogoGestionAceptar").kendoButton({
                    click: function () {
                        $("#trError").hide();
                        // Faltan campos por rellenar
                        if (!ValidarFormulario("CrearMerma")) {
                            $("#trError").text(ObtenerCamposObligatorios("CrearMerma"));
                            $("#trError").show();
                            return;
                        }

                        let turno = window.app.vistaPrincipal.turnoActual;
                        let wo = $("#cmbWO").getKendoDropDownList().dataItem();

                        let datos = {
                            mermaTurno: {
                                IdTurno: turno.Id,
                            },
                            merma: {
                                IdMaquina: $("#cmbMaquina").getKendoDropDownList().value(),
                                CodigoProveedor: $("#cmbProveedor").getKendoComboBox().value(),
                                WO: wo.id != null ? wo.id : "",
                                IdProducto: wo.id != null ? wo.producto.codigo : 0,
                            }
                        };

                        self.CrearMerma(datos);
                    }
                });

                $("#btnDialogoGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        w.close();
                    }
                });

                // Para mostrar el teclado en pantalla
                // Al ser el input de un combobox, sólo nos interesa el teclado al hacer click en el propio input (esto evita que salga al desplegar la lista), 
                // y que se filtren los resultados del combobox al teclear algo en la búsqueda
                $('.keyboardOn3').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load(".keyboardOn3",
                    {
                        openOn: "click",
                        accepted: function (e, keyboard, elem) {
                            setTimeout(function () {
                                if (keyboard.$preview.val()) {
                                    $("#cmbProveedor").getKendoComboBox().search(keyboard.$preview.val());
                                }                                
                            })                            
                        },
                    });
            },
            CrearMerma: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/Mermas",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        $("#dlgGestionMermas").getKendoWindow().close();
                    },
                    success: function (res) {
                        if (res) {
                            self.CargarMermas();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_MERMA'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MERMA'), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            //Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_MERMA'), 4000);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.responseJSON.Message, 4000);
                        }
                    }
                });
            },
            eliminar: function () {
                Backbone.off('eventCambioPuestoGlobal');
                Backbone.off('eventCambioTurnoActual');

                $("#center-pane").css("overflow", "");
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            actualiza: function () {
                let self = window.app.vista;
                self.turnoACargar = null;
                self.pestania_seleccionada = 0;
                self.turnoActual = true;                

                this.render();
            },
            actualizaRender: function () {
                this.render();
            }
        });

        return vistaGestionMermas;
    });