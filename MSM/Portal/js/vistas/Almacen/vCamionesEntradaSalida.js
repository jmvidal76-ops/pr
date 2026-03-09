define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Almacen/html/CamionesEntradaSalida.html'
    , 'compartido/notificaciones', '../../../../Portal/js/constantes', 'vistas/Almacen/vFormMantenimiento'],
    function (_, Backbone, $, kendoTimezones, plantilla, Not, enums, jsMantenimiento) {
        var vistaCamionesEntradaSalida = Backbone.View.extend({
            tagName: 'div',
            id: 'divCamionesEntradaSalida',
            window: null,
            template: _.template(plantilla),
            constAcciones: enums.AccionCamiones(),
            constTipoOperacion: enums.TipoOperacionCamiones(),
            constFormulario: enums.MantenimientoFormulario(),
            constMetricas: enums.MetricasRealTime(),
            constOrigen: enums.IdMaestroOrigen(),
            constEnlacesExternos: enums.EnlacesExternos(),
            comprobarMetricaEstableMargen: 1,           // Margen de error entre valores para considerar varias mediciones estables
            comprobarMetricaEstableIntervalo: 5500,     // milisegundos entre cada comprobación de la estabilidad de la báscula, 
                                                        // para cambiar el color de fondo a verde cuando sea estable
            albaranEntradaTemplate: "Albaran_Entrada_UID.pdf",
            pesoMaximo: 50000,
            operacionInicial: 0, //enums.TipoOperacionCamiones().Descarga,

            // Diccionario con los campos que son requeridos en cada posible accion/operacion
            // el array "req" indica los campos obligatorios para esa operacion, 
            // el array "send" serán los que se manden en el modelo al guardar el formulario. 
            // Sólo se definen los que no esten ya definidos en req (el resultado final es la suma de las 2)
            // el array "special" define casos especiales en los que algún campo debe mostrarse/ocultarse independientemente 
            // de que se encuentre en"send". Por defecto todos los campos de "send" son visibles en el formulario
            camposRequeridosPorAccOp: {
                DEFECTO: {
                    req: ["FechaEntrada"],
                    send: [],
                    special: [],
                },
                ENTRADA: {
                    CARGA: {
                        req: ["FechaEntrada", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "IdOperador", "IdProducto", "Observaciones"],
                        special: [{
                            field: "LecturaBascula",
                            visible: true
                        }],
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            {
                                field: "LecturaBascula",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }
                        ],
                    }
                },
                SALIDA: {
                    CARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdProducto", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "PedidoCliente", "Observaciones"],
                        special: [{
                            field: "LecturaBascula",
                            visible: true
                        },
                        {
                            field: "ImprimirAlbaran",
                            visible: true
                        },
                        {
                            field: "PesoNeto",
                            visible: true
                        }]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            {
                                field: "LecturaBascula",
                                visible: true
                            },
                            {
                                field: "ImprimirJustificante",
                                visible: true
                            },
                            {
                                field: "PesoNeto",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }
                        ]
                    }
                },
                EDITAR: {
                    CARGA: {
                        req: ["FechaEntrada", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "IdOperador", "IdProducto", "Observaciones"],
                        special: [{
                            field: "LecturaBascula",
                            visible: true
                        }]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            {
                                field: "LecturaBascula",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }
                        ],
                    }
                },
                HISTORICO: {
                    CARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdProducto", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "PedidoCliente", "Observaciones"],
                        special: [{
                            field: "ImprimirAlbaran",
                            visible: true
                        },
                        {
                            field: "PesoNeto",
                            visible: true
                        }]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            {
                                field: "ImprimirJustificante",
                                visible: true
                            },
                            {
                                field: "PesoNeto",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }
                        ]
                    }
                },
                VER: {
                    CARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdProducto", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "PedidoCliente", "Observaciones"],
                        special: [{
                            field: "ImprimirAlbaran",
                            visible: true
                        },
                        {
                            field: "PesoNeto",
                            visible: true
                        }]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            {
                                field: "ImprimirJustificante",
                                visible: true
                            },
                            {
                                field: "PesoNeto",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }]
                    }
                },
                FACTURACION_EDITAR: {
                    CARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdProducto", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "PedidoCliente", "Observaciones"],
                        special: [
                            //{
                            //    field: "ImprimirAlbaran",
                            //    visible: true
                            //},
                            {
                                field: "PesoNeto",
                                visible: true
                            }
                        ]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            //{
                            //    field: "ImprimirAlbaran",
                            //    visible: false
                            //},
                            {
                                field: "PesoNeto",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }
                        ]
                    }
                },
                FACTURACION_VER: {
                    CARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdCliente", "IdProducto", "IdDestinatario"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "PedidoCliente", "Observaciones"],
                        special: [
                            //{
                            //    field: "ImprimirAlbaran",
                            //    visible: true
                            //},
                            {
                                field: "PesoNeto",
                                visible: true
                            }
                        ]
                    },
                    DESCARGA: {
                        req: ["FechaEntrada", "FechaSalida", "IdMatriculaTractora", "IdTransportista", "IdProveedor", "IdProducto"],
                        send: ["IdMatriculaRemolque", "PesoEntrada", "PesoSalida", "IdOperador", "LoteProveedor", "AlbaranProveedor", "NombreArchivoAlbaranEntrada", "IdUbicacionInterna", "IdOrigenMercancia", "Observaciones"],
                        special: [
                            //{
                            //    field: "ImprimirAlbaran",
                            //    visible: false
                            //},
                            {
                                field: "PesoNeto",
                                visible: true
                            },
                            {
                                field: "OrdenJDE",
                                visible: true
                            }]
                    }
                },
                getElement: function (self, accion, operacion) {
                    let elem = null;

                    if (accion == self.constAcciones.Entrada) {
                        if (operacion == 0) {
                            return this.DEFECTO;
                        }
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.ENTRADA.CARGA;
                        } else {
                            elem = this.ENTRADA.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.Salida) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.SALIDA.CARGA;
                        } else {
                            elem = this.SALIDA.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.Editar) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.EDITAR.CARGA;
                        } else {
                            elem = this.EDITAR.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.Historico) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.HISTORICO.CARGA;
                        } else {
                            elem = this.HISTORICO.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.Ver) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.VER.CARGA;
                        } else {
                            elem = this.VER.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.FacturacionVer) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.FACTURACION_VER.CARGA;
                        } else {
                            elem = this.FACTURACION_VER.DESCARGA;
                        }
                    } else if (accion == self.constAcciones.FacturacionEditar) {
                        if (operacion == self.constTipoOperacion.Carga) {
                            elem = this.FACTURACION_EDITAR.CARGA;
                        } else {
                            elem = this.FACTURACION_EDITAR.DESCARGA;
                        }
                    }

                    return elem;
                }
            },
            initialize: function ({ parent, action, item, printCallback, callback }) {
                var self = this;

                self.parent = parent;
                self.action = action;
                self.item = item;
                self.printCallback = printCallback;
                self.callback = callback;
                self.ubicacionInternaIds = { 1: null, 2: null };
                self.productoIds = { 1: null, 2: null };
                self.anteriorTipoOp = null;

                Backbone.on('metricasRealTime', function (data) {
                    self.ActualizaMetrica(data)
                }, this);

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                // Configuracion del formulario
                let title = "";

                // Guardamos el IdTransporte del elemento editado en el formulario
                $("#transporteEditado").html(self.item?.IdTransporte);

                //Datepicker Entrada
                $("#inpt_FechaEntrada").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date(),
                });

                //Datepicker Salida
                $("#inpt_FechaSalida").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date(),
                });

                $(".btnFechaActual").click(function (e) {
                    let inptA = $(this).attr("inputAsociado");
                    $("#" + inptA).getKendoDateTimePicker().value(new Date());
                })

                // Operacion
                $("input[type='radio']").on("change", function (e) {
                    let tipoActual = parseInt(e.target.value);

                    // Habilitamos los inputs deshabilitados hasta elegir operacion
                    const initDisableds = $(".init_disabled");
                    if (initDisableds.length) {
                        initDisableds.each(function (idx, elem) {
                            $(this).removeClass("init_disabled")
                            let widget = kendo.widgetInstance($(this));
                            if (widget) {
                                widget.enable(true);
                            } else {
                                $(this).attr("disabled", false)
                                $(this).removeClass("disabled");
                            }
                        });
                    }

                    // Ajustamos el formulario
                    self.CambioTipoOperacion(tipoActual);

                    setTimeout(() => {
                        //Precarga de datos del ultimo transporte
                        let matriculaInput = $("#inpt_IdMatriculaTractora").getKendoComboBox()
                        if (matriculaInput && matriculaInput.selectedIndex >= 0) {

                            self.PrecargaFormularioUltimoTransporte(matriculaInput.value(), tipoActual)
                        }

                        // Selección automática de la ubicación por material                    
                        if (self.anteriorTipoOp == undefined && !kendo.widgetInstance($("#inpt_IdUbicacionInterna")).value()) {
                            kendo.widgetInstance($("#inpt_IdProducto")).trigger("change");
                        }

                        self.anteriorTipoOp = tipoActual;
                    }, 150)
                })

                // Pesos
                $("#inpt_PesoEntrada").kendoNumericTextBox({
                    format: "##.#,0 kg",
                    max: self.pesoMaximo,
                    min: 0,
                    change: function (e) {
                        this.element.parent().removeClass("k-invalid");
                        if ($("#div_FechaSalida").is(":visible")) {
                            self.AjustarTipoPesos(parseInt($("input[type='radio']:checked").val()));
                        }
                    }
                });
                $("#inpt_PesoSalida").kendoNumericTextBox({
                    format: "##.#,0 kg",
                    max: self.pesoMaximo,
                    min: 0,
                    change: function (e) {
                        this.element.parent().removeClass("k-invalid");
                        self.AjustarTipoPesos(parseInt($("input[type='radio']:checked").val()));
                    }
                });
                $("#inpt_PesoNeto").kendoNumericTextBox({
                    format: "##.#,0 kg",
                    min: 0,
                });

                $("#btnWritePesoEntrada").click(function (e) {
                    let inpt = $("#inpt_PesoEntrada").getKendoNumericTextBox();
                    let autoValor = parseFloat($("#lblLecturaBascula").html().replaceAll(".", "").replace(",", "."));

                    inpt.value(Math.min(Math.max(autoValor, 0), self.pesoMaximo));
                    inpt.element.attr("auto-value", autoValor);
                    inpt.trigger("change");
                });

                $("#btnWritePesoSalida").click(function (e) {
                    let inpt = $("#inpt_PesoSalida").getKendoNumericTextBox();
                    let autoValor = parseFloat($("#lblLecturaBascula").html().replaceAll(".", "").replace(",", "."));

                    inpt.value(Math.min(Math.max(autoValor, 0), self.pesoMaximo));
                    inpt.element.attr("auto-value", autoValor);
                    inpt.trigger("change");
                });

                // Matricula
                $("#inpt_IdMatriculaTractora").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        //serverFiltering: true,
                        transport: {
                            read: {
                                url: "../api/Matricula/" + "Tractora",
                                dataType: "json",
                                cache: false,

                            },
                            //parameterMap: function (data, type) {
                            //    let name = $('#inpt_IdMatriculaTractora').data("kendoComboBox").text()
                            //    if (type == "read" && name) {
                            //        return { nombre: $('#inpt_IdMatriculaTractora').data("kendoComboBox").text() };
                            //    }
                            //},
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    // Version para serverfiltering
                    //dataBound: function (e) {
                    //    if (this.newId) {
                    //        this.value(this.newId);
                    //        this.trigger("change");
                    //        this.newId = null;
                    //    }
                    //    if (self.item && self.item.IdMatriculaTractora && !this.firstRead) {
                    //        this.firstRead = true
                    //        this.newId = self.item.IdMatriculaTractora
                    //        this.text(self.item.MatriculaTractora);
                    //        this.dataSource.read();
                    //    }
                    //},
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdMatriculaTractora;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }

                        //let actualItem = self.item;

                        //if (actualItem && actualItem.IdMatriculaTractora) {
                        //    this.newId = actualItem.IdMatriculaTractora;
                        //}
                        
                        //if (this.newId) {
                        //    this.value(this.newId);
                        //    this.trigger("change");
                        //    this.newId = null;
                        //}
                    },
                    change: function (e) {
                        // Al seleccionar matricula, si también tenemos el tipo operación, intentamos precargar los datos del 
                        // ultimo tansporte con esta matricula y tipo operacion

                        // Si existe self.item no es un formulario nuevo, por lo que no hacemos precarga                        
                        if (!self.item && e.sender.selectedIndex >= 0) {
                            let tipoOperacion = self.ObtenerTipoOperacion();
                            if (tipoOperacion) {
                                self.PrecargaFormularioUltimoTransporte(e.sender.value(), tipoOperacion);
                            }
                        }
                    }
                });

                // Remolque
                $("#inpt_IdMatriculaRemolque").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        //serverFiltering: true,
                        transport: {
                            read: {
                                url: "../api/Matricula/" + "Remolque",
                                dataType: "json",
                                cache: false,

                            },
                            //parameterMap: function (data, type) {
                            //    let name = $('#inpt_IdMatriculaRemolque').data("kendoComboBox").text()
                            //    if (type == "read" && name) {
                            //        return { nombre: $('#inpt_IdMatriculaRemolque').data("kendoComboBox").text() };
                            //    }
                            //},
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdMatriculaRemolque;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                });

                // Operador
                $("#inpt_IdOperador").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        //serverFiltering: true,
                        transport: {
                            read: {
                                url: "../api/GetOperador/",
                                dataType: "json",
                                cache: false,

                            },
                            //parameterMap: function (data, type) {
                            //    let name = $('#inpt_IdOperador').data("kendoComboBox").text()
                            //    if (type == "read" && name) {
                            //        return { nombre: $('#inpt_IdOperador').data("kendoComboBox").text() };
                            //    }
                            //},
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (const r of response) {
                                    r.Id = r.IdOperador;
                                    r.Info = [r.NIF];

                                    const [nif] = r.Info;

                                    if (nif) {
                                        r.Valor = `${r.Nombre} (${nif})`;
                                    } else {
                                        r.Valor = r.Nombre;
                                    }
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdOperador;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                });

                // Conductor
                $("#inpt_IdTransportista").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        //serverFiltering: true,
                        transport: {
                            read: {
                                url: "../api/Transportista/",
                                //url: "../api/GetDataAutoCompleteTransportista/",
                                dataType: "json",
                                cache: false,

                            },
                            //parameterMap: function (data, type) {
                            //    let name = $('#inpt_IdTransportista').data("kendoComboBox").text()
                            //    if (type == "read" && name) {
                            //        return { nombre: $('#inpt_IdTransportista').data("kendoComboBox").text() };
                            //    }
                            
                            //},
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (let r of response) {
                                    r.Id = r.IdTransportista;
                                    r.Info = [r.NIF, r.Direccion, r.Poblacion];

                                    r.Valor = `${r.Nombre} (${r.Info[0]})`;
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        },
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdTransportista;                            
                        }
                        
                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                    change: function (e) {
                        //self.SelectInfo(this, "inpt_nif", 0);
                    }
                });

                // Proveedores
                $("#inpt_IdProveedor").kendoComboBox({
                    minLength: 1,
                    height: 400,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteProveedor/",
                                dataType: "json",
                                cache: false,

                            },
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (let r of response) {
                                    let codigo = r.Info[0];
                                    let idOrigen = r.Info[1];
                                    let deJDE = idOrigen == self.constOrigen.JDE
                                    if (deJDE) {
                                        codigo = codigo || "S/N"
                                    }

                                    r.Valor = `${r.Valor}${(codigo ? ` (${codigo})` : "")}`;
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filtering: (e) => {
                        e.preventDefault();

                        // construimos un filtro que tenga en cuenta el NIF                        
                        const filter = { ...e.filter };
                        const dataSource = e.sender.dataSource;

                        if (filter.value) {

                            let newFilter =
                            {
                                logic: "or",
                                filters: [
                                    filter,
                                    { field: "Info[2]", operator: "contains", value: filter.value, ignoreCase: true }
                                ]
                            }

                            // Aplicar el filtro al campo deseado
                            dataSource.filter(newFilter);
                        }
                        else
                        {
                            dataSource.filter({});
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    template: function (d) {
                        let idOrigen = d.Info[1];
                        let deJDE = idOrigen == self.constOrigen.JDE
                        let nif = d.Info[2] || "S/N";
                        let dir = `${d.Info[3] || "S/N"} - ${(d.Info[4] ? d.Info[4] + " " : "")}${d.Info[5] || "S/N"}`

                        return `<div class="dropDownCell" style='background-color: ${(deJDE ? "#c4f2c4" : "#f7e5cb")}'>
                            <strong>${d.Valor}</strong><br>
                            <span>NIF: ${nif}</span><br>
                            <span style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" title="${dir}">${dir}</span>
                        </div>`
                    },
                    suggest: true,
                    dataBound: function (e) {
                        // Configuracion de las celdas
                        $("li:has(.dropDownCell)").css({ "padding": 0, "margin": "6px" })

                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdProveedor;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                });

                // Clientes
                $("#inpt_IdCliente").kendoComboBox({
                    height: 400,
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteCliente/",
                                dataType: "json",
                                cache: false,

                            },
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (let r of response) {
                                    let codigo = r.Info[0];
                                    let idOrigen = r.Info[1];
                                    let deJDE = idOrigen == self.constOrigen.JDE
                                    if (deJDE) {
                                        codigo = codigo || "S/N"
                                    }

                                    r.Valor = `${r.Valor}${(codigo ? ` (${codigo})` : "")}`;
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filtering: (e) => {
                        // construimos un filtro que tenga en cuenta el NIF
                        e.preventDefault();
                        const filter = { ...e.filter };
                        const dataSource = e.sender.dataSource;

                        if (filter.value) {

                            let newFilter =
                            {
                                logic: "or",
                                filters: [
                                    filter,
                                    { field: "Info[2]", operator: "contains", value: filter.value, ignoreCase: true }
                                ]
                            }

                            // Aplicar el filtro al campo deseado
                            dataSource.filter(newFilter);
                        }
                        else {
                            dataSource.filter({});
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    template: function (d) {
                        let idOrigen = d.Info[1];
                        let deJDE = idOrigen == self.constOrigen.JDE
                        let nif = d.Info[2] || "S/N";
                        let dir = `${d.Info[3] || "S/N"} - ${(d.Info[4] ? d.Info[4] + " " : "")}${d.Info[5] || "S/N"}`

                        return `<div class="dropDownCell" style='background-color: ${(deJDE ? "#c4f2c4" : "#f7e5cb")}'>
                            <strong>${d.Valor}</strong><br>
                            <span>NIF: ${nif}</span><br>
                            <span style="display: block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;" title="${dir}">${dir}</span>
                        </div>`
                    },
                    suggest: true,
                    dataBound: function (e) {
                        // Configuracion de las celdas
                        $("li:has(.dropDownCell)").css({ "padding": 0, "margin": "6px" })

                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdCliente;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");                            
                        }
                    },
                });

                // Orden Aprovisionamiento
                $("#inpt_CodigoOrdenJDE").on("input", (e) => {
                    let val = e.target.value
                    if (isNaN(val)) {
                        e.target.value = val.slice(0, -1);
                    }

                    $(e.target).removeClass("k-invalid");
                    $("#inpt_TipoOrdenJDE").removeClass("k-invalid");
                })

                $("#inpt_TipoOrdenJDE").on("input", (e) => {                    
                    $(e.target).removeClass("k-invalid");
                    $("#inpt_CodigoOrdenJDE").removeClass("k-invalid");
                })

                // Albaran entrada
                $("#inpt_NombreArchivoAlbaranEntrada").kendoUpload({
                    async: {
                        saveUrl: "../api/Documentos/UploadFile/" + self.constEnlacesExternos.ALBARANES_ENTRADA_CAMIONES,
                        removeUrl: "../api/Documentos/RemoveFile/" + self.constEnlacesExternos.ALBARANES_ENTRADA_CAMIONES,
                        autoUpload: true
                    },
                    localization: {
                        select: window.app.idioma.t('SELECCIONE') + "...",
                        headerStatusUploading: window.app.idioma.t('CARGANDO') + "...",
                        headerStatusUploaded: window.app.idioma.t('TERMINADO'),
                        remove: window.app.idioma.t('ELIMINAR'),
                    },
                    multiple: false,
                    validation: {
                        allowedExtensions: [".pdf"],
                    },
                    files: self.item && self.item.NombreArchivoAlbaranEntrada ? [{ name: self.item.NombreArchivoAlbaranEntrada, size: 2000, extension: "pdf" }] : [],
                    upload: function (e) {
                        // Si se ha bloqueado la subida del nuevo archivo por esperar a borrar el anterior cancelamos esta subida
                        if (e.sender.removingFile) {
                            e.sender.pendingUpload = true;
                            e.preventDefault();
                            return;
                        }
                        e.sender.newFileName = self.albaranEntradaTemplate.replace("UID", kendo.toString(new Date(), "ddMMyyyyHHmmss"));
                        e.data = {
                            newFileName: e.sender.newFileName
                        }
                    },
                    remove: function (e) {
                        let that = this;
                        e.sender.removingFile = false;
                        // Este codigo hace que si el anterior archivo era erróneo se borre directamente sin preguntar
                        if (e.sender.errorFileUID == e.files[0].uid) {
                            e.sender.errorFileUID = undefined;
                            that.removeFileCall = true;
                        }
                        if (self.item && !that.removeFileCall) {
                            e.preventDefault();
                            // Ya hay cargado un archivo correcto
                            if (e.sender.newFileName) {
                                // Este flag cancela la subida del nuevo archivo en caso de que sea un reemplazo
                                e.sender.removingFile = true;
                            }
                            OpenWindow(window.app.idioma.t("AVISO"),
                                window.app.idioma.t("AVISO_BORRAR_ALBARAN_ENTRADA"),
                                function () {
                                    that.removeFileCall = true;
                                    $(".k-delete").parent(".k-upload-action").click();
                                }
                            );
                        }

                        e.data = {
                            newFileName: e.sender.newFileName
                        }
                        that.removeFileCall = false;
                    },
                    success: function (e) {
                        if (e.operation == "upload") {
                            let file0Uid = e.files[0].uid;
                            let fileNameElem = $(".k-file[data-uid='" + file0Uid + "']").find(".k-filename");
                            fileNameElem.text(e.sender.newFileName);
                            fileNameElem.attr("title", e.sender.newFileName);
                        }
                        if (e.operation == "remove") {
                            e.sender.removingFile = false;
                            e.sender.newFileName = null;
                        }

                        // Al cambiar el archivo (añadirlo o borrarlo), fisicamente se borra/crea en el servidor, por lo que hay que actualizar en el momento 
                        // la asociacion con el transporte para evitar inconsistencias (p.e. borrar el archivo pero salir del formulario sin guardar)
                        if (self.item) {
                            self.ActualizarNombreArchivoAlbaranEntrada(self.item.IdTransporte, e.sender.newFileName);
                            self.item.NombreArchivoAlbaranEntrada = e.sender.newFileName;
                        }

                        self.CambioVisorPdf(e.sender.newFileName);

                        if (e.operation == "remove" && e.sender.pendingUpload) {
                            // Abrimos el selector de archivo para volver a cargar
                            e.sender.pendingUpload = null;
                            $("#inpt_NombreArchivoAlbaranEntrada").click();
                        }
                    },
                    error: function (e) {
                        let err = e.XMLHttpRequest;
                        e.sender.errorFileUID = e.files[0].uid;

                        if (err.status == '403') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (e.XMLHttpRequest.status == 406) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDANDO_ARCHIVO'), 4000);
                            }
                        }
                    }
                });

                if (self.item && self.item.NombreArchivoAlbaranEntrada) {
                    $("#inpt_NombreArchivoAlbaranEntrada").getKendoUpload().newFileName = self.item.NombreArchivoAlbaranEntrada;
                    self.CambioVisorPdf(self.item.NombreArchivoAlbaranEntrada);
                }

                $("#inpt_visorPDF").click(function (e) {
                    let pdfName = $("#inpt_NombreArchivoAlbaranEntrada").getKendoUpload().newFileName;

                    let ventanaVisorPDF = $("<div id='dlgVisorPDF'/>").kendoWindow({
                        title: pdfName,
                        width: "95%",
                        height: "95%",
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            ventanaVisorPDF.getKendoWindow().destroy();
                        },
                        resizable: false,
                        modal: true,
                    });

                    let template = kendo.template($("#visorPDF").html());
                    ventanaVisorPDF.getKendoWindow()
                        .content(template({}))
                        .center().open();

                    $.get(`../api/Documentos/ShowPDF/${self.constEnlacesExternos.ALBARANES_ENTRADA_CAMIONES}?file=${pdfName}` , (data) => {
                        $("#pdfViewer").attr("data", `data:application/pdf;base64,${data}`)
                    })
                        .fail(function (err) {
                            $("#errorPdf").show();
                        })
                });

                // Producto
                $("#inpt_IdProducto").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read:
                            function (operation) {
                                let tipoOperacion = self.ObtenerTipoOperacion()

                                if (tipoOperacion) {
                                    $.ajax({
                                        url: "../api/GetDataAutoCompleteProducto/" + tipoOperacion,
                                        dataType: "json",
                                        cache: false,
                                        success: function (response) {
                                            operation.success(response);
                                        }
                                    })

                                } else {
                                    operation.success([]);
                                }
                            }
                            //{
                            //    url: "../api/GetDataAutoCompleteProducto/",
                            //    dataType: "json",
                            //    cache: false,

                            //},
                        },                        
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (let r of response) {
                                    let codigo = r.Info[0];
                                    let idOrigen = r.Info[1];
                                    let deJDE = idOrigen == self.constOrigen.JDE
                                    if (deJDE) {
                                        codigo = codigo || "S/N"
                                    }

                                    r.Valor = `${r.Valor}${(codigo ? ` (${codigo})` : "")}`;
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    template: function (d) {
                        let idOrigen = d.Info[1];
                        let deJDE = idOrigen == self.constOrigen.JDE;

                        return `<div class="dropDownCell" style='background-color: ${(deJDE ? "#c4f2c4" : "#f7e5cb")}'>
                            <strong>${d.Valor}</strong><br>                            
                        </div>`
                    },
                    suggest: true,
                    dataBound: function (e) {
                        // Configuracion de las celdas
                        $("li:has(.dropDownCell)").css({ "padding": 0, "margin": "6px" });

                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdProducto;
                        }

                        if (e.sender.changeOperation && self.productoIds[self.ObtenerTipoOperacion()] != undefined) {
                            e.sender.changeOperation = false;
                            _id = self.productoIds[self.ObtenerTipoOperacion()];
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.autoChange = true;
                            e.sender.trigger("change");
                        }
                    },
                    change: function (e) {
                        let tipoOp = self.ObtenerTipoOperacion();
                        if (tipoOp) {
                            self.productoIds[tipoOp] = e.sender.value();
                        }

                        if (this.autoChange) {
                            this.autoChange = false;
                            return;
                        }
                        if (e.sender.selectedIndex >= 0) {
                            self.ObtenerUbicacionMaterial(e.sender.value());
                        }
                    }
                });

                // Ubicacion
                $("#inpt_IdUbicacionInterna").kendoDropDownList({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: function (operation) {
                                let tipoOperacion = self.ObtenerTipoOperacion()

                                if (tipoOperacion) {
                                    $.ajax({
                                        url: "../api/GetDataAutoCompleteUbicacion/Interna/" + tipoOperacion,
                                        dataType: "json",
                                        cache: false,
                                        success: function (response) {
                                            operation.success(response);
                                        }
                                    })

                                } else {
                                    operation.success([]);
                                }
                            }
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return;
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdUbicacionInterna;
                        }                      

                        if (self.ubicacionInternaIds[self.ObtenerTipoOperacion()] != undefined) {
                            _id = self.ubicacionInternaIds[self.ObtenerTipoOperacion()];
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");                            
                        }
                    },
                    change: function (e) {
                        let tipoOp = self.ObtenerTipoOperacion();
                        if (tipoOp) {
                            self.ubicacionInternaIds[tipoOp] = e.sender.value();
                        }
                    }
                });

                // Origen
                $("#inpt_IdOrigenMercancia").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteOrigenMercancia/",
                                dataType: "json",
                                cache: false,
                            },
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return;
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdOrigenMercancia;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                });

                // Destinatario
                $("#inpt_IdDestinatario").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteUbicacion/" + "Externa/0",
                                dataType: "json",
                                cache: false,

                            },
                        },
                        sort: { field: "Valor", dir: "asc" },
                        schema: {
                            parse: function (response) {

                                for (const r of response) {                                    
                                    const [pob, nif] = r.Info;

                                    if (nif) {
                                        r.Valor = `${r.Valor} (${nif})`;
                                    }
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    suggest: true,
                    dataBound: function (e) {
                        if (e.sender.skipDatabound) {
                            e.sender.skipDatabound = false;
                            return; 
                        }

                        let _id;

                        if (!e.sender.firstLoad) {
                            e.sender.firstLoad = true;

                            _id = self.item?.IdDestinatario;
                        }

                        if (e.sender.newId) {
                            _id = e.sender.newId;
                            e.sender.newId = null;
                        }

                        if (_id) {
                            e.sender.skipDatabound = true;
                            e.sender.dataSource.filter({});
                            e.sender.value(_id);
                            e.sender.trigger("change");
                        }
                    },
                    change: function (e) {
                        self.SelectInfo(this, "inpt_poblacion", 0);
                    }
                });

                // al hacer focus en un input, le quitamos la clase k-invalid (borde rojo)
                $("#CamionesEntradaSalidaForm .inreq[id]").each(function (idx, el) {

                    let widget = kendo.widgetInstance($(el));

                    if (widget && widget.input) {
                        widget.input.on("focus", (e) => {
                            widget.element.parent().removeClass("k-invalid");
                        })
                    } else if (widget && widget.element) {
                        widget.element.on("focus", (e) => {
                            widget.element.parent().removeClass("k-invalid");
                        })
                    }
                });

                $("#btnCamionesESEliminar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.parent.EliminarTransporteDialog(self.item.IdTransporte, self.item.MatriculaTractora);
                    }
                })

                const popover = $('#inpt_ImprimirAlbaran');
                popover.popover({
                    title: '',
                    content: $('#popoverPrintContent').html(),
                    placement: 'top'
                });
                popover.click(function (e) {
                    e.stopPropagation();
                    popover.popover('hide');
                });
                popover.attr("title", popover.data("originalTitle"));
                const popover2 = $('#inpt_ImprimirJustificante');
                popover2.popover({
                    title: '',
                    content: $('#popoverPrintContent2').html(),
                    placement: 'top'
                });
                popover2.click(function (e) {
                    e.stopPropagation();
                    popover2.popover('hide');
                });
                popover2.attr("title", popover2.data("originalTitle"));
                $(document).click(function (e) {
                    if (($('.popover').has(e.target).length == 0) || $(e.target).is('.close')) {
                        popover.popover('hide');
                        popover2.popover('hide');
                    }
                });

                $("#inpt_ImprimirAlbaran,#inpt_ImprimirJustificante").kendoButton({
                    click: function (e) {
                        if (self.item?.IdTransporte && self.printCallback != null) {
                            self.printCallback(self.item.IdTransporte, self.item.IdTipoOperacion);
                        }
                    }
                });

                // Si el registro ya está facturado, no dejamos editar
                if (self.item && self.item.Facturado) {
                    self.action = self.constAcciones.Ver;
                }

                // Configuracion Inicial
                switch (self.action) {
                    case self.constAcciones.Entrada:
                        title = window.app.idioma.t("ENTRADA") + window.app.idioma.t("DE_CAMION");
                        $("#btnWritePesoSalida").hide();
                        $("#btnCamionesESEliminar").hide();
                        break;
                    case self.constAcciones.Salida:
                        title = window.app.idioma.t("SALIDA") + window.app.idioma.t("DE_CAMION");
                        $(".disabledSalida").each(function (idx, el) {
                            let widget = kendo.widgetInstance($(this));
                            if (widget && widget.enable) {
                                widget.enable(false);
                            } else {
                                $(this).attr("disabled", "disabled")
                                $(this).addClass("disabled");
                            }
                        })
                        $(".addBtn").attr("disabled", "disabled");
                        if (self.item.IdTipoOperacion == self.constTipoOperacion.Carga) {
                            $("#div_IdProducto").find(".addBtn").attr("disabled", null);
                        }
                        $("#btnWritePesoEntrada").css("visibility", "hidden");
                        $("#basculaSpacer").show();
                        $('#inpt_ImprimirAlbaran').addClass("disabled");
                        $('#inpt_ImprimirJustificante').addClass("disabled");
                        break;
                    case self.constAcciones.Editar:
                        title = window.app.idioma.t("EDITAR_DATOS_CAMION");
                        $("#btnWritePesoSalida").hide();
                        break;
                    case self.constAcciones.Historico:
                    case self.constAcciones.FacturacionEditar:
                        title = window.app.idioma.t("EDITAR_DATOS_CAMION");
                        break;
                    case self.constAcciones.Ver:
                    case self.constAcciones.FacturacionVer:
                        title = window.app.idioma.t("VER_DATOS_CAMION");
                        $(".addBtn").attr("disabled", "disabled");
                        $("#divCamionesEntradaSalida").find("input,textarea,button").each(function (idx, el) {
                            let widget = kendo.widgetInstance($(this));
                            if (widget && widget.enable) {
                                widget.enable(false);
                            } else {
                                $(this).attr("disabled", "disabled")
                                $(this).addClass("disabled");
                            }
                        })
                        $(".btnFechaActual").addClass("disabled")
                        $("#btnCamionesESCancelar").attr("disabled", false)
                        $("#btnCamionesESCancelar").removeClass("disabled")
                        break;
                }

                // Lectura de báscula
                if (self.action != self.constAcciones.Historico && self.action != self.constAcciones.Ver
                    && self.action != self.constAcciones.FacturacionEditar && self.action != self.constAcciones.FacturacionVer) {

                    self.ActivarLecturaBascula();

                    // Iniciamos un temporizador para evitar que se desactiven las métricas de báscula. 
                    // Si no se envía una señal de activación antes de que se supere el tiempo de inactividad del emisor de eventos de métricas se desactiva automáticamente

                    self.emisorMetricasInterval = setInterval(() => {
                        self.ActivarLecturaBascula();
                    }, 20000);

                    self.metricasEstables = setInterval(() => {
                        self.CheckMetricaEstable()
                    }, self.comprobarMetricaEstableIntervalo)
                }

                // Si existe el Item estamos editando, asignamos los valores iniciales a los inputs
                if (self.item) {
                    // fecha
                    $("#inpt_FechaEntrada").getKendoDateTimePicker().value(self.item.FechaEntrada);
                    // peso
                    $("#inpt_PesoEntrada").getKendoNumericTextBox().value(self.item.PesoEntrada);
                    // Operacion
                    if (self.item.IdTipoOperacion == self.constTipoOperacion.Carga) {
                        $("#inpt_operacionCargar").prop("checked", true);
                    }
                    if (self.item.IdTipoOperacion == self.constTipoOperacion.Descarga) {
                        $("#inpt_operacionDescargar").prop("checked", true);
                    }
                    $("#inpt_LoteProveedor").val(self.item.LoteProveedor);
                    $("#inpt_CodigoOrdenJDE").val(self.item.CodigoOrdenJDE);
                    $("#inpt_TipoOrdenJDE").val(self.item.TipoOrdenJDE);
                    $("#inpt_AlbaranProveedor").val(self.item.AlbaranProveedor);
                    $("#inpt_Observaciones").val(self.item.Observaciones);
                    $("#inpt_PedidoCliente").val(self.item.PedidoCliente);
                    // El producto lo asignamos mediante el array de valores porque se resetea en cada cambio de operación
                    self.productoIds[self.item.IdTipoOperacion] = self.item.IdProducto;
                    self.ubicacionInternaIds[self.item.IdTipoOperacion] = self.item.IdUbicacionInterna;

                    if (self.action == self.constAcciones.Historico || self.action == self.constAcciones.Ver
                        || self.action == self.constAcciones.FacturacionEditar || self.action == self.constAcciones.FacturacionVer) {
                        $("#inpt_FechaSalida").getKendoDateTimePicker().value(self.item.FechaSalida);
                        $("#inpt_PesoSalida").getKendoNumericTextBox().value(self.item.PesoSalida);
                        $("#inpt_PesoSalida").getKendoNumericTextBox().trigger("change");
                    }

                    // Si el registro ya está facturado, bloqueamos algunos inputs
                    //if (self.item.Facturado) {
                    //    $("input[type='radio']").attr("disabled", "disabled");
                    //}
                }

                self.CambioTipoOperacion(self.item && self.item.IdTipoOperacion ? self.item.IdTipoOperacion : self.operacionInicial, 0);

                // Si estamos creando bloqueamos todos los controles hasta que se seleccione el tipo de operación
                if (!self.item) {
                    $(".addBtn").each(function (idx, el) {
                        if ($(this).attr('disabled') != 'disabled') {
                            $(this).addClass("init_disabled");
                            $(this).attr("disabled", "disabled");
                        }
                    })
                        
                    $("#divCamionesEntradaSalida").find("input,textarea,button").each(function (idx, el) {
                        const inputsActivos = ["inpt_FechaEntrada", "btnCamionesESCancelar", "btnCamionesESAceptar", "inpt_operacionCargar", "inpt_operacionDescargar"];
                        if (!inputsActivos.includes($(this).attr("id"))) {                            
                            let widget = kendo.widgetInstance($(this));
                            if (widget && widget.enable) {
                                $(this).addClass("init_disabled");
                                widget.enable(false);
                            } else if ($(this).attr('disabled') != "disabled") {
                                $(this).addClass("init_disabled");
                                $(this).attr("disabled", "disabled")
                                $(this).addClass("disabled");
                            }
                        }
                    })
                }

                $("#btnCamionesESCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        setTimeout(() => {
                            self.window.close();
                        })
                    }
                });

                $("#btnCamionesESAceptar").kendoButton({
                    click: function (e) {
                        e.preventDefault();

                        setTimeout(async () => {
                            let tipoOperacion = self.ObtenerTipoOperacion();

                            if (!tipoOperacion) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('TIPO_OPERACION_TRANSITO_NECESARIA'), 4000);
                                return;
                            }

                            if (!self.ValidarFormulario(self.action, tipoOperacion)) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 4000);
                                return;
                            }

                            if ($("#inpt_FechaEntrada").getKendoDateTimePicker().value() > new Date()) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDAR_FECHA_MENOR_IGUAL_ACTUAL'), 4000);
                                return;
                            }

                            // Check de fechas
                            if ($("#div_FechaSalida").is(":visible") && $("#inpt_FechaEntrada").getKendoDateTimePicker().value() >= $("#inpt_FechaSalida").getKendoDateTimePicker().value()) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDAR_FECHA_ENTRADA_MENOR_FECHA_SALIDA'), 4000);
                                return;
                            }

                            // Check de pesos
                            if ($("#div_PesoSalida").is(":visible")) {
                                let pesoEntrada = parseFloat($("#inpt_PesoEntrada").getKendoNumericTextBox().value());
                                let pesoSalida = parseFloat($("#inpt_PesoSalida").getKendoNumericTextBox().value());
                                if (tipoOperacion == self.constTipoOperacion.Carga && pesoEntrada >= pesoSalida) {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PESO_SALIDA_MAYOR_QUE_PESO_ENTRADA'), 4000);
                                    return;
                                }
                                if (tipoOperacion == self.constTipoOperacion.Descarga && pesoSalida >= pesoEntrada) {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('PESO_ENTRADA_MAYOR_QUE_PESO_SALIDA'), 4000);
                                    return;
                                }
                            }

                            try {
                                // Creamos/Actualizamos el registro de transporte
                                kendo.ui.progress($(self.el), true);

                                if (self.action == self.constAcciones.Entrada) {
                                    await self.CrearTransporte();
                                    self.actionSave = true;
                                }
                                else if (self.action == self.constAcciones.Salida) {
                                    await self.FinalizarTransporte();
                                }
                                else {
                                    await self.ActualizarTransporte(self.action);
                                }

                                kendo.ui.progress($(self.el), false);

                                if (self.callback) {
                                    self.callback();
                                }

                                if (self.action == self.constAcciones.Salida) {
                                    // Mostramos mensaje de imprimir albarán
                                    //OpenWindow(window.app.idioma.t("AVISO"),
                                    //    window.app.idioma.t("AVISO_IMPRIMIR_ALBARAN"),
                                    //    null
                                    //);

                                    const elem = tipoOperacion == self.constTipoOperacion.Carga ? "Albaran" : "Justificante";

                                    // Mostramos animación del botón de imprimir
                                    $(`#inpt_Imprimir${elem}`).addClass("blink");
                                    setTimeout(() => { $(`#inpt_Imprimir${elem}`).removeClass("blink"); }, 2000);
                                    $(`#inpt_Imprimir${elem}`).popover('show');

                                    // Activamos el botón de imprimir
                                    $(`#inpt_Imprimir${elem}`).removeClass("disabled");
                                    $(`#inpt_Imprimir${elem}`).getKendoButton().enable(true);
                                    
                                } else {
                                    self.window.close();
                                }

                            } catch (err) {
                                kendo.ui.progress($(self.el), false);
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                            }
                        })
                    }
                });

                let maxHeight = $("#center-pane").outerHeight() * 1;

                self.window = $(self.el).kendoWindow(
                    {
                        title: title,
                        maxHeight: maxHeight,
                        modal: true,
                        resizable: false,
                        close: function () {
                            // Este codigo borra el pdf que se haya subido si se cierra la ventana sin guardar
                            if (!self.item && !self.actionSave) {
                                $(".k-delete").parent(".k-upload-action").click();
                            }
                            // Cancelamos el envío de eventos de metricas
                            clearInterval(self.emisorMetricasInterval);
                            clearInterval(self.metricasEstables);
                            // No desactivamos directamente el emisor de eventos por si hay más clientes abiertos leyendo la báscula
                            //self.DesactivarLecturaBascula();
                            self.window.destroy();
                            self.window = null;
                            self.parent.windowES = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                let formHeight = $("#divCamionesEntradaSalida").height() - 70
                $("#divCamionesEntradaSalida form").height(formHeight)
                self.window.center();
            },
            ObtenerTipoOperacion: function () {
                let tipoOperacion = $("input[type='radio']:checked");
                if (tipoOperacion.length) {
                    tipoOperacion = parseInt(tipoOperacion.val());
                } else {
                    tipoOperacion = null
                }

                return tipoOperacion
            },
            CambioTipoOperacion: function (tipoActual, timeAnim = 150) {
                let self = this;

                // Ocultamos todos los elementos de primeras
                if (timeAnim == 0) {
                    $(".divForm").hide();
                }

                let elem = self.camposRequeridosPorAccOp.getElement(self, self.action, tipoActual);

                let visibles = elem.req.concat(elem.send);
                let noVisibles = $(".divForm").toArray().map(m => m.id.substring(4))

                for (let s of elem.special) {
                    if (s.visible) {
                        visibles.push(s.field);
                    } else {
                        noVisibles.push(s.field);
                    }
                }

                let nodesVisibles = [];
                let nodesNoVisibles = [];

                for (let v of visibles) {
                    let e = $("#div_" + v);
                    if (e.length && !e.is(":visible")) {
                        nodesVisibles.push(e[0]);
                    }

                    if (noVisibles.includes(v)) {
                        let index = noVisibles.indexOf(v);
                        if (index > -1) {
                            noVisibles.splice(index, 1);
                        }
                    }

                    // añadimos el * indicador de campo obligatorio
                    if (elem.req.includes(v)) {
                        e.find("strong span").html(' (*):');
                    }
                    else {
                        e.find("strong span").html(':');
                    }
                }

                for (let nv of noVisibles) {
                    let e = $("#div_" + nv);
                    if (e.length && e.is(":visible")) {
                        nodesNoVisibles.push(e[0]);
                    }
                }

                $(nodesVisibles).stop().show(timeAnim);
                $(nodesNoVisibles).stop().hide(timeAnim);

                $(".k-invalid").removeClass("k-invalid");
                self.AjustarTipoPesos(tipoActual);
                $("#inpt_IdUbicacionInterna").getKendoDropDownList().dataSource.read();
                const inputProducto = $("#inpt_IdProducto").getKendoComboBox();
                inputProducto.changeOperation = true;
                inputProducto.value(null);
                inputProducto.dataSource.read();

                if (self.window) {
                    $("#divCamionesEntradaSalida form").height("initial");

                    setTimeout(() => {
                        let formHeight = $("#divCamionesEntradaSalida").height() - 70;
                        $("#divCamionesEntradaSalida form").height(formHeight)
                        self.window.center();
                    }, timeAnim)
                }
            },
            PrecargaFormularioUltimoTransporte: function (idMatricula, tipoOperacion){
                let self = this

                // Si existe self.item no es un formulario nuevo, no precargamos nada
                if (self.item) {
                    return
                }

                let data = {
                    idMatricula,
                    tipoOperacion
                }
                
                $.ajax({
                    type: "GET",
                    url: `../api/GetUltimoTransporte`,
                    contentType: "application/json; charset=utf-8",
                    data: data,
                    success: function (data) {
                        if (data) {
                            $("input[preLoad]").each(function (idx, el) {
                                const _id = el.id.replace("inpt_", "");
                                const widget = kendo.widgetInstance($(this));
                                if (widget && !widget.value()) {
                                    widget.dataSource.filter({});
                                    widget.value(data[_id]);
                                }
                            })
                        }
                    },
                    error: function (err) {
                        console.log("Error obteniendo los datos del ultimos transporte")
                        console.log(err)
                    }
                });         
            },
            ObtenerUbicacionMaterial: function (idMaterial){
                let self = this

                let data = {
                    idMaterial
                }

                $.ajax({
                    type: "GET",
                    url: `../api/UbicacionMaterial`,
                    contentType: "application/json; charset=utf-8",
                    data: data,
                    success: function (data) {
                        if (data) {
                            const widget = kendo.widgetInstance($("#inpt_IdUbicacionInterna"));
                            if (widget && !widget.value()) {
                                widget.dataSource.filter({});
                                widget.value(data);

                                const tipoOp = self.ObtenerTipoOperacion();
                                if (tipoOp) {
                                    self.ubicacionInternaIds[tipoOp] = data;
                                }
                            }                            
                        }
                    },
                    error: function (err) {
                        console.log("Error obteniendo la ubicacion del material")
                        console.log(err)
                    }
                });

            },
            AjustarTipoPesos: function (tipoOperacion) {
                let self = this;

                let pesoEntrada = $("#inpt_PesoEntrada").getKendoNumericTextBox().value();
                let pesoSalida = $("#inpt_PesoSalida").getKendoNumericTextBox().value();
                let pesoNetoInput = $("#inpt_PesoNeto").getKendoNumericTextBox();

                if (tipoOperacion == self.constTipoOperacion.Carga) {
                    $("#tipoPesoEntrada").html(`- ${window.app.idioma.t("TARA")}`);
                    $("#tipoPesoSalida").html(`- ${window.app.idioma.t("BRUTO")}`);
                    pesoNetoInput.value(Math.max(pesoSalida - pesoEntrada, 0));
                } else { // Descarga
                    $("#tipoPesoEntrada").html(`- ${window.app.idioma.t("BRUTO")}`);
                    $("#tipoPesoSalida").html(`- ${window.app.idioma.t("TARA")}`);
                    pesoNetoInput.value(Math.max(pesoEntrada - pesoSalida, 0));
                }
            },            
            AbrirVentanaMantenimiento: function (widget, alert) {
                let self = this;

                let tipoFormularioTxt = widget.element.attr("tipoForm");
                let tipoFormulario = self.constFormulario[tipoFormularioTxt];
                let inputId = widget.element.attr("id");
                var _value = widget.text().trim();
                //widget.value(null);
                if (alert) {
                    OpenWindow(window.app.idioma.t("AVISO"),
                        window.app.idioma.t(tipoFormularioTxt + "_NO_ENCONTRADO"),
                        function () {
                            jsMantenimiento.ShowWindowNewForm(self, inputId, _value, tipoFormulario, { operacion: self.ObtenerTipoOperacion() });
                        }
                    );
                } else {
                    jsMantenimiento.ShowWindowNewForm(self, inputId, _value, tipoFormulario, { operacion: self.ObtenerTipoOperacion() });
                }
            },
            BotonAddMantenimiento: function (e) {
                let self = this;
                let inputAsociado = $(e).attr("inputAsociado");
                let widget = $("#" + inputAsociado).getKendoComboBox();

                self.AbrirVentanaMantenimiento(widget, false);
            },
            SelectInfo: function (e, target, index) {

                if (e.dataItem() && e.dataItem().Id != 0) {
                    $("#" + target).val(e.dataItem().Info[index]);
                } else {
                    $("#" + target).val("");
                }
            },
            CambioVisorPdf: function (nombreArchivo) {
                if (nombreArchivo) {
                    $("#inpt_visorPDF").removeClass("disabled");
                } else {
                    $("#inpt_visorPDF").addClass("disabled");
                }
            },
            ValidarFormulario: function (accion, operacion) {
                let self = this;
                let valido = true;

                let req = self.camposRequeridosPorAccOp.getElement(self, accion, operacion).req;

                for (let r of req) {
                    let input = $("#inpt_" + r);   
                    if (input) {
                        let widget = kendo.widgetInstance(input);
                        // En caso de los combobox, para saber si hay un elemento realmente seleccionado se mira el selectedIndex
                        if ((widget && (!widget.value() || (widget.selectedIndex || 0) < 0)) || (!widget && !input.val())) {
                            valido = false;
                            input.parent().addClass("k-invalid");
                            widget.value(null);
                        }
                        else {
                            input.parent().removeClass("k-invalid");
                        }                        
                    } 
                }

                // Comprobación de Orden Aprovisionamiento
                // No es obligatorio (de momento), pero si se rellena alguno, tienen que ir los 2      
                if (operacion == self.constTipoOperacion.Descarga) {
                    if ($("#inpt_CodigoOrdenJDE").val() || $("#inpt_TipoOrdenJDE").val()) {
                        if (!$("#inpt_CodigoOrdenJDE").val()) {
                            valido = false;
                            $("#inpt_CodigoOrdenJDE").addClass("k-invalid");
                        }
                        if (!$("#inpt_TipoOrdenJDE").val()) {
                            valido = false;
                            $("#inpt_TipoOrdenJDE").addClass("k-invalid");
                        }
                    }
                }

                return valido;
            },
            ObtenerDatosTransporte: function (accion) {
                let self = this;

                let operacion = self.ObtenerTipoOperacion();
                let albaran = $("#inpt_NombreArchivoAlbaranEntrada").getKendoUpload().newFileName;

                let transporte = {
                    IdTransporte: self.item ? self.item.IdTransporte : 0,
                    IdTipoOperacion: operacion,
                }

                let elem = self.camposRequeridosPorAccOp.getElement(self, accion, operacion);
                let send = elem.req.concat(elem.send);

                for (let s of send) {
                    let val = "";
                    if (s == "NombreArchivoAlbaranEntrada") {
                        val = albaran;
                    } else {
                        let widget = kendo.widgetInstance($("#inpt_" + s));
                        if (widget) {
                            val = widget.value();
                        } else {
                            val = $("#inpt_" + s).val();
                        }

                        if (s == "PesoEntrada" || s == "PesoSalida") {
                            val = val || 0;
                            let pesoAuto = $("#inpt_" + s).attr("auto-value");
                            if (pesoAuto != undefined) {
                                transporte[s + "Auto"] = pesoAuto;
                            }
                        }
                    }

                    transporte[s] = val;
                };

                // Datos Orden Aprovisionamiento
                if (operacion == self.constTipoOperacion.Descarga) {
                    transporte.CodigoOrdenJDE = $("#inpt_CodigoOrdenJDE").val() || null;
                    transporte.TipoOrdenJDE = $("#inpt_TipoOrdenJDE").val() || null;
                }

                return transporte;
            },
            CrearTransporte: async function () {
                let self = this;

                let transporte = self.ObtenerDatosTransporte(self.constAcciones.Entrada);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/AddTransport`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(transporte),
                        success: function (data) {
                            if (data) {
                                resolve();
                            } else {
                                reject();
                            }
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ActualizarNombreArchivoAlbaranEntrada: function (id, NombreArchivoAlbaranEntrada) {
                let self = this;

                //let transporte = {
                //    IdTransporte: id,
                //    NombreArchivoAlbaranEntrada: NombreArchivoAlbaranEntrada
                //}
                let transporte = {
                    Id: id,
                    Valor: NombreArchivoAlbaranEntrada
                }

                $.ajax({
                    type: "PUT",
                    url: `../api/UpdateNombreArchivoAlbaranEntrada`,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(transporte),
                    //success: function (data) {                        
                    //},
                    error: function (err) {
                        console.log("Error actualizando archivo albaran");
                        console.log(err);
                    }
                });
            },
            FinalizarTransporte: async function () {
                let self = this;

                let transporte = self.ObtenerDatosTransporte(self.constAcciones.Salida);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/FinalizarTransporte`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(transporte),
                        success: function (data) {
                            if (data) {
                                resolve();
                            } else {
                                reject();
                            }
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ActualizarTransporte: async function (accion) {
                let self = this;

                let transporte = self.ObtenerDatosTransporte(accion);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: `../api/UpdateTransport`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(transporte),
                        success: function (data) {
                            if (data) {
                                resolve();
                            } else {
                                reject();
                            }
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ActivarLecturaBascula: function () {
                let self = this;

                let data = {
                    metricaId: self.constMetricas.Bascula
                }

                $.ajax({
                    type: "GET",
                    url: `../api/MetricasRT/ActivarMetrica`,
                    contentType: "application/json; charset=utf-8",
                    data: data,
                    success: function (data) {
                    },
                    error: function (err) {
                        console.log("Error activando las metricas de báscula")
                        console.log(err)
                    }
                });
            },
            DesactivarLecturaBascula: function () {
                let self = this;

                let data = {
                    metricaId: self.constMetricas.Bascula
                }

                $.ajax({
                    type: "GET",
                    url: `../api/MetricasRT/DesactivarMetrica`,
                    contentType: "application/json; charset=utf-8",
                    data: data,
                    success: function (data) {
                    },
                    error: function (err) {
                        console.log("Error desactivando las metricas de báscula")
                        console.log(err)
                    }
                });
            },
            ActualizaMetrica: function (data) {
                let self = this;                

                if (data.metricaId == self.constMetricas.Bascula) {

                    let valor = parseFloat(data.metricaValor.replace(",", ".") || 0);

                    $("#lblLecturaBascula").html(kendo.format("{0:n2} kg", valor))

                    // comprobación métrica estable
                    clearInterval(self.metricasEstables);
                    self.metricasEstables = setInterval(() => {
                        self.CheckMetricaEstable()
                    }, self.comprobarMetricaEstableIntervalo);

                    self.CheckMetricaEstable()
                    //console.log(data.metricaValor)
                }
            },
            CheckMetricaEstable() {
                let self = this;

                let margenEstable = self.comprobarMetricaEstableMargen;

                let actualValor = parseFloat($("#lblLecturaBascula").html().replaceAll(".", "").replace(",", "."));
                let ultimoValor = parseFloat(($("#lblLecturaBascula").attr("last-value") || "-100.0").replace(",", "."));

                let color = "salmon";

                if (actualValor > ultimoValor - margenEstable && actualValor < ultimoValor + margenEstable) {
                    color = "palegreen"
                }

                $(".lecturaBascula").css("background-color", color);
                $("#lblLecturaBascula").attr("last-value", actualValor);
            },
            eliminar: function () {
                Backbone.off('metricasRealTime');
                $('#inpt_ImprimirAlbaran').popover('hide');
                $('#inpt_ImprimirJustificante').popover('hide');
                this.remove();
            }
        });    

        return vistaCamionesEntradaSalida;
    });