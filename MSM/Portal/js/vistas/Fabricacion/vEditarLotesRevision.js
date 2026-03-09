define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarLotesRevision.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaEditarLotesRevision, Not, VistaDlgConfirm) {
        var vistaEditarLotesRevision = Backbone.View.extend({
            window: null,
            datos: null,
            seleccionados: null,
            valoresOriginales: null,
            titulo: null,
            template: _.template(plantillaEditarLotesRevision),

            initialize: function (registrosSeleccionados) {
                var self = this;
                self.seleccionados = registrosSeleccionados;
                self.titulo = window.app.idioma.t("EDITAR_LOTE");

                // Validación de tipo de material en selección múltiple 
                if (self.seleccionados && self.seleccionados.length > 1) {
                    self.titulo = window.app.idioma.t("EDITAR_LOTES");
                    
                    // Obtén el tipo del primer lote
                    var primerTipo = "";
                    if (self.seleccionados[0].Lote) {
                        var bloques = self.seleccionados[0].Lote.split('-');
                        if (bloques.length > 1) {
                            primerTipo = bloques[1];
                        }
                    }
                    // Comprueba todos los tipos
                    var tiposIguales = self.seleccionados.every(function (lote) {
                        if (!lote.Lote) return false;
                        var bloques = lote.Lote.split('-');
                        return bloques.length > 1 && bloques[1] === primerTipo;
                    });
                    if (!tiposIguales) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_MODIFICAR_LOTES_DIFERENTE_MATERIAL'), 4000);
                        return; // NO abre la ventana
                    }
                }

                this.render();
            },

            render: function () {
                var self = this;

                // 1. Crear contenedor temporal y guardarlo en la vista
                self.$popup = $("<div/>").appendTo("body");

                // 2. Renderizar la plantilla dentro del contenedor
                self.$popup.html(this.template());

                // 3. Inicializar el botón "Aplicar"
                self.$popup.find("#btnAceptar").kendoButton();

                // 4. Inicializar campos (combos y numéricos)
                self.inicializarCampos(self.$popup);

                // 5. Cargar datos
                self.cargarDatos(self.$popup);

                // 6. Enlace de evento del botón: La clave para la solución
                self.$popup.find("#btnAceptar").on("click", function (e) {
                    e.preventDefault();
                    self.editarLotes();
                });

                // 7. Crear ventana Kendo
                self.window = self.$popup.kendoWindow({
                    title: self.titulo,
                    width: "700px",
                    height: "500px",
                    modal: true,
                    resizable: false,
                    draggable: true,
                    actions: ["Close"],
                    close: function () {
                        // al cerrar desde la X también liberamos recursos
                        self.eliminar();
                    }
                }).data("kendoWindow");

                self.dialog = self.window;
                self.dialog.center();
            },

            inicializarCampos: function ($popup) {
                var self = this;
                var idAlmacen = 0;
                var idZona = 0;

                // Establece los valores iniciales para los DataSources si es un único registro
                if (self.seleccionados && self.seleccionados.length === 1) {
                    idAlmacen = self.seleccionados[0].IdAlmacen || 0;
                    idZona = self.seleccionados[0].IdZona || 0; 
                }

                // Definiciones de los DataSources
                var dsAlmacen = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetDepot/", dataType: "json" } },
                    sort: { field: "Descripcion", dir: "asc" }
                });

                var dsZona = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetZone/" + idAlmacen, dataType: "json", cache: false } },
                    sort: { field: "Descripcion", dir: "asc" }
                });

                var dsUbicacion = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetLocation/" + idAlmacen + "/" + idZona, dataType: "json", cache: false } },
                    sort: { field: "Nombre", dir: "asc" }
                });

                var dsTipoMaterial = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetTipoMaterial", dataType: "json" } },
                    sort: { field: "Descripcion", dir: "asc" },
                    filter: { logic: "or", filters: [{ field: "IdTipoMaterial", operator: "eq", value: "01" }, { field: "IdTipoMaterial", operator: "eq", value: "71" }] }
                });

                var dsClaseMaterial = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetClaseMaterial", dataType: "json" } },
                    sort: { field: "Descripcion", dir: "asc" },
                    autoBind: false // Asegura que no se cargue automáticamente
                });

                var dsMaterial = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetMaterial", dataType: "json" } },
                    sort: { field: "DescripcionCompleta", dir: "asc" },
                    autoBind: false // Asegura que no se cargue automáticamente
                });

                var dsProveedor = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetMaestroProveedorLoteMMPP", dataType: "json" } },
                    sort: { field: "NombreFull", dir: "asc" }
                });

                var dsUnidadMedida = new kendo.data.DataSource({
                    transport: { read: { url: "../api/GetUnidadMedida/", dataType: "json", cache: false } },
                    schema: { model: { id: "PK", fields: { 'PK': { type: "int" }, 'SourceUoMID': { type: "string" } } } }
                });

                // Inicialización de los DropDownLists
                $("#vpTxtAlmacen").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    optionLabel: window.app.idioma.t("SELECCIONAR_ALMACEN"),
                    dataSource: dsAlmacen,
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idAlmacen = dataItem.IdAlmacen;
                        dsZona.transport.options.read.url = "../api/GetZone/" + idAlmacen;
                        dsZona.read();
                        dsUbicacion.transport.options.read.url = "../api/GetLocation/"  + idAlmacen + "/0";
                        dsUbicacion.read();
                    }
                });

                $("#vpTxtZona").kendoDropDownList({
                    autoBind: false,
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    filter: "contains",
                    optionLabel: window.app.idioma.t("SELECCIONAR_ZONA"),
                    dataSource: dsZona,
                    open: function (e) {
                        var idAlmacen = $("#vpTxtAlmacen").data("kendoDropDownList").value();
                        if (!idAlmacen) {
                            e.preventDefault(); // no hay almacén, no abrir ni cargar
                            return;
                        }
                        // actualizar URL y leer
                        dsZona.transport.options.read.url = "../api/GetZone/" + idAlmacen;
                        dsZona.read();
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idZona = dataItem.IdZona;
                        var idAlmacen = $("#vpTxtAlmacen").data("kendoDropDownList").value();
                        dsUbicacion.transport.options.read.url = "../api/GetLocation/"  + idAlmacen + "/" + idZona;
                        dsUbicacion.read();
                    }
                });


                $("#vpTxtUbicacion").kendoDropDownList({
                    autoBind: false,
                    filter: "contains",
                    optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    dataSource: dsUbicacion,
                    open: function (e) {
                        var idZona = $("#vpTxtZona").data("kendoDropDownList").value();
                        var idAlmacen = $("#vpTxtAlmacen").data("kendoDropDownList").value();
                        if (!idAlmacen || !idZona) {
                            e.preventDefault(); // sin zona o almacén, no abrir
                            return;
                        }
                        // actualizar URL y leer
                        dsUbicacion.transport.options.read.url = "../api/GetLocation/"  + idAlmacen + "/" + idZona;
                        dsUbicacion.read();
                    }
                });


                $("#vpTxtTipoMaterial").kendoDropDownList({
                    optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                    dataSource: dsTipoMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idTipoMaterial = dataItem.IdTipoMaterial || "00";
                        dsClaseMaterial.transport.options.read.url = "../api/GetClaseMaterial/" + idTipoMaterial;
                        dsClaseMaterial.read();
                        dsMaterial.transport.options.read.url = "../api/GetMaterial/" + idTipoMaterial + "/00";
                        dsMaterial.read();
                    }
                });

                $("#vpTxtClaseMaterial").kendoDropDownList({
                    autoBind: false,
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    dataSource: dsClaseMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    open: function (e) {
                        var idTipoMaterial = $("#vpTxtTipoMaterial").data("kendoDropDownList").value();
                        if (!idTipoMaterial) {
                            e.preventDefault();
                            return;
                        }
                        dsClaseMaterial.transport.options.read.url = "../api/GetClaseMaterial/" + idTipoMaterial;
                        dsClaseMaterial.read();
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idTipoMaterial = $("#vpTxtTipoMaterial").data("kendoDropDownList").value() || "00";
                        var idClaseMaterial = dataItem.IdClaseMaterial || "00";
                        dsMaterial.transport.options.read.url = "../api/GetMaterial/" + idTipoMaterial + "/" + idClaseMaterial;
                        dsMaterial.read();
                    }
                });


                $("#vpTxtMaterial").kendoDropDownList({
                    autoBind: false,
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    dataSource: dsMaterial,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    open: function (e) {
                        var idClaseMaterial = $("#vpTxtClaseMaterial").data("kendoDropDownList").value();
                        var idTipoMaterial = $("#vpTxtTipoMaterial").data("kendoDropDownList").value();
                        if (!idTipoMaterial || !idClaseMaterial) {
                            e.preventDefault();
                            return;
                        }
                        dsMaterial.transport.options.read.url = "../api/GetMaterial/" + idTipoMaterial + "/" + idClaseMaterial;
                        dsMaterial.read();
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var idMaterial = dataItem.IdMaterial;
                        if (idMaterial) {
                            dsTipoMaterial.transport.options.read.url = "../api/GetTipoMaterialPorReferencia/" + idMaterial;
                            dsTipoMaterial.read();
                            dsClaseMaterial.transport.options.read.url = "../api/GetClaseMaterialPorReferencia/" + idMaterial;
                            dsClaseMaterial.read();
                        }
                    }
                });


                $("#vpTxtProveedor").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                    dataTextField: "NombreFull",
                    dataValueField: "IdProveedor",
                    dataSource: dsProveedor,
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    }
                });

                $("#vpTxtCantidadInicial").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    min: 0,
                    spinners: true,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                }).closest(".k-numerictextbox").css("width", "180px");

                $("#vpTxtCantidadLote").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    min: 0,
                    spinners: true,
                    culture: localStorage.getItem("idiomaSeleccionado")
                }).closest(".k-numerictextbox").css("width", "180px");

                $("#vpTxtUnidadMedida").kendoDropDownList({
                    autoBind: true,
                    optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                    dataSource: dsUnidadMedida,
                    dataTextField: "SourceUoMID",
                    dataValueField: "SourceUoMID"
                });
            },

            cargarDatos: function ($popup) {
                var self = this;
                if (!self.seleccionados || self.seleccionados.length === 0) return;

                // UN REGISTRO
                if (self.seleccionados.length === 1) {
                    var lote = self.seleccionados[0];

                    // --- Valores simples ---
                    var numericCantidadInicial = $popup.find("#vpTxtCantidadInicial").data("kendoNumericTextBox");
                    if (numericCantidadInicial) numericCantidadInicial.value(lote.CantidadInicial);

                    var numericCantidadLote = $popup.find("#vpTxtCantidadLote").data("kendoNumericTextBox");
                    if (numericCantidadLote) numericCantidadLote.value(lote.CantidadActual);

                    $popup.find("#vpTxtLoteProveedor").val(lote.LoteProveedor || "");
                    $popup.find("#vpTxtCantidadInicial").val(lote.CantidadInicial || "");

                    // --- Almacén / Zona / Ubicación ---
                    var ddlAlmacen = $popup.find("#vpTxtAlmacen").data("kendoDropDownList");
                    if (ddlAlmacen) {
                        ddlAlmacen.one("dataBound", function () {
                            ddlAlmacen.value(lote.IdAlmacen || "");

                            var ddlZona = $popup.find("#vpTxtZona").data("kendoDropDownList");
                            if (ddlZona && lote.IdZona) {
                                ddlZona.dataSource.read();
                                ddlZona.one("dataBound", function () {
                                    ddlZona.value(lote.IdZona || "");

                                    var ddlUbicacion = $popup.find("#vpTxtUbicacion").data("kendoDropDownList");
                                    if (ddlUbicacion && lote.IdUbicacionLote) {
                                        ddlUbicacion.dataSource.transport.options.read.url =
                                            "../api/GetLocation/" + (lote.IdAlmacen || 0) + "/" + (lote.IdZona || 0);
                                            //"../api/GetUbicacionesCrearLote/" + (lote.IdAlmacen || 0) + "/" + (lote.IdZona || 0);
                                        ddlUbicacion.dataSource.read();
                                        ddlUbicacion.one("dataBound", function () {
                                            ddlUbicacion.value(lote.IdUbicacionLote || "");
                                        });
                                    }
                                });
                            }
                        });
                        ddlAlmacen.dataSource.read();

                        ddlAlmacen.dataSource.read();
                    }

                    // --- Clase → Material → Tipo ---
                    var ddlClaseMaterial = $popup.find("#vpTxtClaseMaterial").data("kendoDropDownList");
                    var ddlMaterial = $popup.find("#vpTxtMaterial").data("kendoDropDownList");
                    var ddlTipoMaterial = $popup.find("#vpTxtTipoMaterial").data("kendoDropDownList");

                    var idClaseMaterial = lote.IdClase ? String(lote.IdClase) : "00";
                    var idMaterial = lote.IdMaterial ? String(lote.IdMaterial) : "";
                    var idTipoMaterial = lote.TipoMaterial ? String(lote.TipoMaterial) : "";

                    if (ddlClaseMaterial) {
                        ddlClaseMaterial.dataSource.read();
                        ddlClaseMaterial.one("dataBound", function () {
                            ddlClaseMaterial.value(idClaseMaterial);

                            if (ddlMaterial) {
                                // cargar materiales filtrados por la clase seleccionada
                                ddlMaterial.dataSource.transport.options.read.url =
                                    "../api/GetMaterial/00/" + (idClaseMaterial || "00");
                                ddlMaterial.dataSource.read();

                                ddlMaterial.one("dataBound", function () {
                                    ddlMaterial.value(idMaterial || "");

                                    // Combo TIPO MATERIAL: seleccionar usando el segundo bloque del nombre del lote
                                    var ddlTipoMaterial = $popup.find("#vpTxtTipoMaterial").data("kendoDropDownList");
                                    var tipoMaterial = ""; // segundo bloque del lote
                                    if (lote.Lote) {
                                        var bloques = lote.Lote.split('-');
                                        if (bloques.length > 1) {
                                            tipoMaterial = bloques[1];
                                        }
                                    }
                                    if (ddlTipoMaterial && idMaterial) {
                                        ddlTipoMaterial.dataSource.transport.options.read.url =
                                            "../api/GetTipoMaterialPorReferencia/" + idMaterial;
                                        ddlTipoMaterial.dataSource.read();
                                        ddlTipoMaterial.one("dataBound", function () {
                                            var ds = ddlTipoMaterial.dataSource.data();
                                            if (tipoMaterial) {
                                                ddlTipoMaterial.value(tipoMaterial);
                                            } else if (ds.length === 1) {
                                                ddlTipoMaterial.value(ds[0][ddlTipoMaterial.options.dataValueField]);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }

                    // --- Proveedor ---
                    var ddlProveedor = $popup.find("#vpTxtProveedor").data("kendoDropDownList");
                    if (ddlProveedor) {
                        ddlProveedor.one("dataBound", function () {
                            ddlProveedor.value(lote.IdProveedor || "");
                        });
                        ddlProveedor.dataSource.read();
                    }

                    // --- Unidad de medida ---
                    var ddlUnidadMedida = $popup.find("#vpTxtUnidadMedida").data("kendoDropDownList");
                    if (ddlUnidadMedida) {
                        ddlUnidadMedida.one("dataBound", function () {
                            // Forzar valor a mayúsculas antes de comparar
                            var valorUnidad = (lote.UnidadMedida || "").toUpperCase();

                            var ds = ddlUnidadMedida.dataSource.data();
                            var found = ds.find(function (item) {
                                return (item.SourceUoMID || "").toUpperCase() === valorUnidad;
                            });

                            if (found) {
                                ddlUnidadMedida.value(found.SourceUoMID);
                            } else {
                                ddlUnidadMedida.value("");
                            }
                        });
                        ddlUnidadMedida.dataSource.read();
                    }

                    // Guardamos copia de los valores originales
                    self.valoresOriginales = {
                        IdUbicacion: lote.IdUbicacionLote,
                        IdMaterial: lote.IdMaterial,
                        IdProveedor: lote.IdProveedor,
                        CantidadInicial: lote.CantidadInicial,
                        CantidadActual: lote.CantidadActual,
                        LoteProveedor: lote.LoteProveedor,
                        ClaseMaterial: lote.IdClase
                    };

                } else {
                    // MULTIPLES REGISTROS

                    self.valoresOriginales = null;

                    // Solo limpiar los combos independientes
                    ["#vpTxtAlmacen", "#vpTxtTipoMaterial", "#vpTxtProveedor", "#vpTxtUnidadMedida"]
                        .forEach(function (id) {
                            var ddl = $popup.find(id).data("kendoDropDownList");
                            if (ddl) ddl.value(null);
                        });

                    // Cargar solo combos independientes
                    var ddlAlmacen = $popup.find("#vpTxtAlmacen").data("kendoDropDownList");
                    if (ddlAlmacen) ddlAlmacen.dataSource.read();

                    var ddlTipoMaterial = $popup.find("#vpTxtTipoMaterial").data("kendoDropDownList");
                    if (ddlTipoMaterial) ddlTipoMaterial.dataSource.read();

                    var ddlProveedor = $popup.find("#vpTxtProveedor").data("kendoDropDownList");
                    if (ddlProveedor) ddlProveedor.dataSource.read();

                    var ddlUnidadMedida = $popup.find("#vpTxtUnidadMedida").data("kendoDropDownList");
                    if (ddlUnidadMedida) ddlUnidadMedida.dataSource.read();

                    // Limpiar numéricos y texto
                    var numericCantidadInicial = $popup.find("#vpTxtCantidadInicial").data("kendoNumericTextBox");
                    if (numericCantidadInicial) numericCantidadInicial.value(null);

                    var numericCantidadLote = $popup.find("#vpTxtCantidadLote").data("kendoNumericTextBox");
                    if (numericCantidadLote) numericCantidadLote.value(null);

                    // Obtén el tipo de material del primer lote seleccionado
                    var primerLote = self.seleccionados[0];
                    var tipoMaterial = "";
                    if (primerLote.Lote) {
                        var bloques = primerLote.Lote.split('-');
                        if (bloques.length > 1) {
                            tipoMaterial = bloques[1];
                        }
                    }

                    // Carga el combo de tipo material y selecciona el tipo
                    var ddlTipoMaterial = $popup.find("#vpTxtTipoMaterial").data("kendoDropDownList");
                    if (ddlTipoMaterial) {
                        ddlTipoMaterial.one("dataBound", function () {
                            if (tipoMaterial) {
                                ddlTipoMaterial.value(tipoMaterial);
                                ddlTipoMaterial.enable(false);  // <-- Esto lo bloquea
                            }
                        });
                        ddlTipoMaterial.dataSource.read();
                    }

                    $popup.find("#vpTxtLoteProveedor").val("");
                }

            },
            editarLotes: function () {
                var self = this;
                var $popup = this.$popup;

                // Leer valores actuales de los combos/inputs
                var valoresActuales = {
                    IdUbicacion: $popup.find("#vpTxtUbicacion").data("kendoDropDownList").value(),
                    Ubicacion: $popup.find("#vpTxtUbicacion").data("kendoDropDownList").text(),
                    IdMaterial: $popup.find("#vpTxtMaterial").data("kendoDropDownList").value(),
                    IdProveedor: $popup.find("#vpTxtProveedor").data("kendoDropDownList").value(),
                    CantidadInicial: $popup.find("#vpTxtCantidadInicial").data("kendoNumericTextBox").value(),
                    CantidadActual: $popup.find("#vpTxtCantidadLote").data("kendoNumericTextBox").value(),
                    LoteProveedor: $popup.find("#vpTxtLoteProveedor").val(),
                    ClaseMaterial: $popup.find("#vpTxtClaseMaterial").data("kendoDropDownList").value(),
                    Unidad: $popup.find("#vpTxtUnidadMedida").data("kendoDropDownList").value()
                };

                if (valoresActuales.IdUbicacion === "" || valoresActuales.IdUbicacion == null) {
                    valoresActuales.IdUbicacion = null;
                    valoresActuales.Ubicacion = "";
                }

                // MULTIPLE
                if (!self.valoresOriginales) {
                    // Validación: no hay nada relevante a modificar
                    if (!valoresActuales.IdUbicacion && !valoresActuales.IdMaterial && !valoresActuales.IdProveedor &&
                        !valoresActuales.CantidadInicial && !valoresActuales.CantidadActual && !valoresActuales.LoteProveedor &&
                        !valoresActuales.ClaseMaterial) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HAY_DATOS_RELEVANTES_A_MODIFICAR'), 4000);
                        return;
                    }

                    // Confirmación para múltiples
                    self.mostrarConfirmacionKendo(
                        "¿Está seguro de aplicar los cambios a todos los lotes seleccionados?",
                        function () {
                            self.modificarLotesMultiples(valoresActuales)
                                .then(function () {
                                    if (self.window) self.window.close();
                                    self.eliminar();
                                    Backbone.trigger('eventCierraDialogo.actualizaGrid');
                                });
                        }
                    );
                    return;
                }

                // INDIVIDUAL 
                var haCambiado = false;
                var cambiarNomenclatura = false;

                ["IdUbicacion", "IdMaterial", "IdProveedor", "CantidadInicial", "CantidadActual", "LoteProveedor"]
                    .forEach(function (campo) {
                        var original = self.valoresOriginales[campo];
                        var actual = valoresActuales[campo];
                        if (campo === "CantidadInicial" || campo === "CantidadActual") {
                            original = parseFloat(parseFloat(original).toFixed(2));
                            actual = parseFloat(parseFloat(actual).toFixed(2));
                        }
                        if (!sonIguales(original, actual))
                            haCambiado = true;
                    });

                function sonIguales(val1, val2) {
                    if ((val1 === null || val1 === undefined || val1 === "") &&
                        (val2 === null || val2 === undefined || val2 === "")) {
                        return true;
                    }
                    if ((val1 === null || val1 === undefined || val1 === "") ||
                        (val2 === null || val2 === undefined || val2 === "")) {
                        return true;
                    }
                    return val1 == val2;
                }

                ["ClaseMaterial", "IdMaterial", "IdUbicacion"].forEach(function (campo) {
                    if (self.valoresOriginales[campo] != valoresActuales[campo])
                        cambiarNomenclatura = true;
                });

                var resumenCambios;
                if (cambiarNomenclatura) {
                    var originalLoteMES = self.seleccionados[0].Lote || "";
                    var nuevoLoteMES = self.cambiarNomenclaturaLote(valoresActuales, self.seleccionados[0].Lote);
                    valoresActuales.LoteOriginal = originalLoteMES;
                    valoresActuales.IdLoteMES = nuevoLoteMES;
                    resumenCambios = self.obtenerResumenCambios(self.valoresOriginales, valoresActuales, originalLoteMES, nuevoLoteMES);
                } else {
                    resumenCambios = self.obtenerResumenCambios(self.valoresOriginales, valoresActuales);
                }

                if (haCambiado) {
                    self.mostrarConfirmacionKendo(
                        "¿Está seguro de aplicar los cambios?",
                        function () {
                            self.modificarLote(valoresActuales, self.seleccionados[0].IdLote, true, true, resumenCambios)
                                .then(function () {
                                    if (self.window) self.window.close();
                                    self.eliminar();
                                    Backbone.trigger('eventCierraDialogo.actualizaGrid');
                                });
                        }
                    );
                }
                else {
                    Not.crearNotificacion('info', window.app.idioma.t('INFORMACION'), window.app.idioma.t('NO_HAY_DATOS_RELEVANTES_A_MODIFICAR'), 4000);
                }
            },
            mostrarConfirmacionKendo: function (mensaje, onAceptar) {
                var self = this;
                var dlgContent = $(
                    '<div class="k-dialog-content">' +
                    '<div style="margin-bottom:20px; text-align:center;">' + mensaje + '</div>' +
                    '<div style="text-align:center;">' +
                    '<button id="btnAceptarConfirmacionLotes" class="k-button" style="min-width:110px; margin:0 10px;">Aceptar</button>' +
                    '<button id="btnCancelarConfirmacionLotes" class="k-button" style="min-width:110px; margin:0 10px;">Cancelar</button>' +
                    '</div>' +
                    '</div>'
                );
                $("body").append(dlgContent);

                dlgContent.kendoWindow({
                    title: window.app.idioma.t("CONFIRMAR_MODIFICAR_LOTES"),
                    width: "410px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    visible: false,
                    close: function () {
                        setTimeout(function () {
                            dlgContent.data("kendoWindow").destroy();
                            dlgContent.remove();
                        }, 100);
                    }
                });

                dlgContent.data("kendoWindow").center().open();

                dlgContent.find("#btnAceptarConfirmacionLotes").on("click", function () {
                    dlgContent.data("kendoWindow").close();
                    if (typeof onAceptar === "function") onAceptar.call(self);
                });

                dlgContent.find("#btnCancelarConfirmacionLotes").on("click", function () {
                    dlgContent.data("kendoWindow").close();
                });
            },
            cambiarNomenclaturaLote: function (valores, lote) {
                var self = this;
                var bloques = lote ? lote.split('-') : [];

                function quitarAcentos(str) {
                    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                }

                // Definir los valores originales de cada bloque
                var primerBloque = bloques.length > 0 ? bloques[0] : "ALO";
                var tipoMaterialAnterior = bloques.length > 1 ? bloques[1] : "00";
                var claseMaterialAnterior = bloques.length > 2 ? bloques[2] : "XXX";
                var idMaterialAnterior = bloques.length > 3 ? bloques[3] : "0000000";
                var ubicacionAnterior = bloques.length > 5 ? bloques[5] : "NOUbic";
                var bloqueFinalAnterior = bloques.length > 6 ? bloques.slice(6).join('-') : ""; // Por si hay más de un guion

                //var tipoMaterial = (valores.TipoMaterial !== undefined && valores.TipoMaterial !== null && valores.TipoMaterial !== "")
                //    ? valores.TipoMaterial
                //    : tipoMaterialAnterior;
                //tipoMaterial = tipoMaterial.toString().padStart(2, "0");

                var claseMaterial = (valores.ClaseMaterial !== null && valores.ClaseMaterial !== "")
                    ? valores.ClaseMaterial
                    : claseMaterialAnterior;

                var idMaterial = (valores.IdMaterial !== null && valores.IdMaterial !== "")
                    ? valores.IdMaterial
                    : idMaterialAnterior;

                var ubicacion = (valores.Ubicacion !== null && valores.Ubicacion !== "")
                    ? valores.Ubicacion
                    : ubicacionAnterior;

                // Limpiar la ubicación: quitar acentos, guiones, espacios y poner a mayúsculas
                ubicacion = quitarAcentos(ubicacion).replace(/[-\s]/g, "").toUpperCase();

                // Montar la nomenclatura final
                return primerBloque + "-" + tipoMaterialAnterior + "-" + claseMaterial + "-" +
                    idMaterial + "-FAB-" + ubicacion + "-" + bloqueFinalAnterior;
            },
            obtenerResumenCambios: function (valoresOriginales, valoresActuales, originalLoteMES, nuevoLoteMES) {
                // Los campos relevantes para mostrar cambios
                var campos = [
                    "IdUbicacion",
                    "IdMaterial",
                    "IdProveedor",
                    "CantidadInicial",
                    "CantidadActual",
                    "LoteProveedor",
                    "ClaseMaterial"
                ];

                // Normaliza los valores para comparar y mostrar
                function canonizar(campo, val) {
                    if (val === null || val === undefined) return "";
                    if (campo === "CantidadInicial" || campo === "CantidadActual") {
                        var n = Number(val);
                        return isNaN(n) ? String(val).trim() : n.toFixed(2);
                    }
                    return String(val).trim();
                }

                var cambios = [];
                campos.forEach(function (campo) {
                    var originalC = canonizar(campo, valoresOriginales[campo]);
                    var actualC = canonizar(campo, valoresActuales[campo]);
                    if (
                        originalC !== actualC &&
                        actualC !== "" &&
                        actualC !== null &&
                        actualC !== undefined
                    ) {
                        // Si el original es vacío, intenta buscar el valor real
                        if (campo === "ClaseMaterial" && (!originalC || originalC === "")) {
                            if (valoresOriginales.IdClase) {
                                originalC = canonizar(campo, valoresOriginales.IdClase);
                            }
                        }
                        cambios.push(campo + ": " + originalC + " → " + actualC);
                    }
                });

                if (originalLoteMES && nuevoLoteMES && originalLoteMES !== nuevoLoteMES) {
                    cambios.push("NomenclaturaLote: " + originalLoteMES + " → " + nuevoLoteMES);
                }

                return cambios.join(", ");
            },
            modificarLote: async function (valores, idLote, cerrarVentana = true, mostrarNotificacion = true, resumenCambios = "") {
                var self = this;
                try {
                    var result = await self.obtenerLoteYTipo(idLote);
                    var datosActualizar = $.extend({}, result.datos, valores);
                    datosActualizar.resumenCambios = resumenCambios; 
                    await self.actualizarLote(result.tipo, datosActualizar, cerrarVentana, mostrarNotificacion);
                } catch (err) {
                    // error ya notificado
                }
            },
            obtenerLoteYTipo: function (idLote) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    self.obtenerLoteFab(idLote).then(function (datosFab) {
                        if (datosFab && datosFab.IdLoteMES != null) {
                            resolve({ tipo: "FAB", datos: datosFab });
                        } else {
                            self.obtenerLoteSemielaborado(idLote).then(function (datosSemi) {
                                if (datosSemi && datosSemi.LoteMES != null) {
                                    resolve({ tipo: "SEMI", datos: datosSemi });
                                } else {
                                    Not.crearNotificacion('error', 'Error', window.app.idioma.t('ERROR_NO_SE_ENCONTRO_LOTE'), 4000);
                                    reject(new Error('No se encontró el lote.'));
                                }
                            });
                        }
                    });
                });
            },
            obtenerLoteFab: function (idLote) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerLoteMMPPFabricacion?id=" + encodeURIComponent(idLote),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (datos) {
                            resolve(datos);
                        },
                        error: function (err) {
                            resolve(null); 
                        }
                    });
                });
            },

            obtenerLoteSemielaborado: function (idLote) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerLoteSemielaborado?id=" + encodeURIComponent(idLote),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (datos) {
                            resolve(datos);
                        },
                        error: function (err) {
                            resolve(null); 
                        }
                    });
                });
            },

            actualizarLote: function (tipo, datosActualizar, cerrarVentana = true, mostrarNotificacion = true) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "../api/ActualizarLoteRevision?tipo=" + encodeURIComponent(tipo),
                        type: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify(datosActualizar),
                        success: function (resp) {
                            if (mostrarNotificacion) {
                                Not.crearNotificacion('success', 'Éxito', window.app.idioma.t('EXITO_LOTE_ACTUALIZADO'), 4000);
                            }

                            if (cerrarVentana && self.window) {
                                self.window.close();
                            }
                            // Solo recarga el grid si cerrarVentana es true
                            if (cerrarVentana) {
                                Backbone.trigger('eventCierraDialogo.actualizaGrid');
                            }
                            resolve(resp);
                        },
                        error: function (xhr) {
                            Not.crearNotificacion('error', 'Error', xhr.responseText || window.app.idioma.t('ERROR_NO_SE_PUDO_ACTUALIZAR_LOTE'), 4000);
                            reject(xhr);
                        }
                    });
                });
            },

            modificarLotesMultiples: async function (valores) {
                var self = this;
                if (self.seleccionados && self.seleccionados.length > 0) {
                    for (const lote of self.seleccionados) {
                        var datosLote = lote.toJSON();
                        var nuevosValores = {};

                        function campoInformado(val) {
                            return !(val === "" || val === null || val === undefined);
                        }

                        // Prepara los campos a modificar
                        if (campoInformado(valores.IdUbicacion)) nuevosValores.IdUbicacion = valores.IdUbicacion;
                        if (campoInformado(valores.Ubicacion)) nuevosValores.Ubicacion = valores.Ubicacion;
                        if (campoInformado(valores.IdMaterial)) nuevosValores.IdMaterial = valores.IdMaterial;
                        if (campoInformado(valores.IdProveedor)) nuevosValores.IdProveedor = valores.IdProveedor;
                        if (campoInformado(valores.CantidadInicial)) nuevosValores.CantidadInicial = valores.CantidadInicial;
                        if (campoInformado(valores.CantidadActual)) nuevosValores.CantidadActual = valores.CantidadActual;
                        if (campoInformado(valores.LoteProveedor)) nuevosValores.LoteProveedor = valores.LoteProveedor;
                        if (campoInformado(valores.ClaseMaterial)) nuevosValores.ClaseMaterial = valores.ClaseMaterial;
                        if (campoInformado(valores.Unidad)) nuevosValores.Unidad = valores.Unidad;

                        // --- Cambia nomenclatura si corresponde ---
                        var cambiarNomenclatura = false;
                        ["ClaseMaterial", "IdMaterial", "IdUbicacion"].forEach(function (campo) {
                            var original = lote[campo] || (campo === "IdUbicacion" ? lote.IdUbicacionLote : "");
                            var actual = valores[campo];
                            if (campoInformado(actual) && original != null && String(original) !== String(actual)) {
                                cambiarNomenclatura = true;
                            }
                        });

                        var resumenCambios;
                        if (cambiarNomenclatura) {
                            var originalLoteMES = self.seleccionados[0].Lote || "";
                            var nuevoLoteMES = self.cambiarNomenclaturaLote(valores, lote.Lote);
                            nuevosValores.LoteOriginal = originalLoteMES;
                            nuevosValores.IdLoteMES = nuevoLoteMES;
                            resumenCambios = self.obtenerResumenCambios(datosLote, nuevosValores, originalLoteMES, nuevoLoteMES);
                        } else {
                            resumenCambios = self.obtenerResumenCambios(datosLote, nuevosValores);
                        }
                        nuevosValores.resumenCambios = resumenCambios;

                        // Llama a modificarLote con notificación desactivada y sin cerrar ventana, pasando el resumen
                        await self.modificarLote(nuevosValores, lote.IdLote, false, false, resumenCambios);
                    }

                    Not.crearNotificacion('success', 'Éxito', window.app.idioma.t('EXITO_LOTES_MODIFICADOS'), 4000);

                    // Cierra ventana y limpia
                    if (self.window) {
                        try {
                            self.window.close();
                        } catch (e) { }
                    }
                    self.eliminar();
                    Backbone.trigger('eventCierraDialogo.actualizaGrid');
                }
            },
            eliminar: function () {
                var self = this;

                if (this.window) {
                    this.window.destroy();
                    this.window = null;
                }

                // destruir widgets que pudieras haber creado en el DOM (por si acaso)
                if (this.$popup) {
                    var widgets = this.$popup.find("[id^='vpTxt']").toArray();
                    widgets.forEach(function (el) {
                        var $el = $(el);
                        var widget = $el.data("kendoDropDownList") || $el.data("kendoNumericTextBox") || $el.data("kendoComboBox");
                        if (widget && widget.destroy) widget.destroy();
                    });

                    this.$popup.remove();
                    this.$popup = null;
                }

                this.remove();
                this.unbind();
            }

        });

        return vistaEditarLotesRevision;
    });