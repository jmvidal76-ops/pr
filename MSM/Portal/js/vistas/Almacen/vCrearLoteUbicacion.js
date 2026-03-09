define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/CrearLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm) {
        var vistaCrearEditarUbicacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            dialog: null,
            row: null,
            accion: null,
            dsTiposUbicacion: null,
            dsEstadosUbicacion: null,
            dsPoliticaAlmacenamiento: null,
            dsPoliticaLlenado: null,
            dsPoliticaVaciado: null,
            dsAlmacen: null,
            dsZona: null,
            dsMateriales: null,
            dsClasesMaterial: null,
            dsTiposMaterial: null,
            tituloWindow: null,
            idPolitica: null,
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function () {
                var self = this;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));


                self.tituloWindow = "Crear Lote en Ubicación";

                self.window = $(self.el).kendoWindow(
                {
                    title: self.tituloWindow,
                    width: "400px",
                    height: "600px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divEditarArranqueCambio').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#btnNewAceptar").kendoButton();

                $("#btnNewCancelar").kendoButton();

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true
                });

                $("#cmbNewAlmacen").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    dataSource: [{ Descripcion: "Envasado", IdAlmacen: 1 }, { Descripcion: "Fabricación", IdAlmacen: 2 }, { Descripcion: "Recepción", IdAlmacen: 3 }],
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbNewZona").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbUbicacion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdUbicaicon",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbRefMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbTipoMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    dataSource: [{ Descripcion: "Material Primas", IdTipoMaterial: 1 }, { Descripcion: "Semielaborado", IdTipoMaterial: 2 }, { Descripcion: "Subproducto", IdTipoMaterial: 3 }],
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbClaseMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

            },
            events: {
                'change #cmbNewAlmacen': 'cambiaAlmacen',
                'change #cmbNewZona': 'cambiaZona',
                'change #cmbTipoMaterial': 'cambiaTipoMaterial',
                'change #cmbClaseMaterial': 'cambiaClaseMaterial',
                'click #btnNewAceptar': 'aceptar',
                'click #btnNewCancelar': 'cancelar'
            },
            cambiaAlmacen: function () {
                var self = this;

                var almacen = $("#cmbNewAlmacen").data("kendoDropDownList").value();

                var datosZona = [];

                switch (parseInt(almacen)) {
                    case 1:
                        datosZona = [
                            { IdZona: 1, Descripcion: "Llenadora" },
                            { IdZona: 2, Descripcion: "Paletizadora" },
                            { IdZona: 3, Descripcion: "Encajonadora" }
                        ]
                        break;
                    case 2:
                        datosZona = [
                           { IdZona: 4, Descripcion: "Cocción" },
                           { IdZona: 5, Descripcion: "Fermentación" },
                           { IdZona: 6, Descripcion: "Filtración" }
                        ]
                        break;
                    case 3:
                        datosZona = [
                          { IdZona: 7, Descripcion: "Malta" },
                          { IdZona: 8, Descripcion: "Adjuntos" },
                          { IdZona: 9, Descripcion: "MPA" }
                        ]
                        break;
                }

                var dsZonas = new kendo.data.DataSource({
                    data: datosZona,
                });

                $("#cmbNewZona").data("kendoDropDownList").setDataSource(dsZonas);
                $("#cmbNewZona").data("kendoDropDownList").dataSource.read();
                $("#cmbNewZona").data("kendoDropDownList").refresh();

            },
            cambiaZona: function () {
                var self = this;

                var zona = $("#cmbNewZona").data("kendoDropDownList").value();

                var datosZona = [];

                switch (parseInt(zona)) {
                    case 1:
                        datosZona = [
                            { IdUbicaicon: 1, Descripcion: "Llenadora" },
                            { IdUbicaicon: 2, Descripcion: "Enjuagadora" },
                            { IdUbicaicon: 3, Descripcion: "Taponadora" }
                        ]
                        break;
                    case 2:
                        datosZona = [
                           { IdUbicaicon: 4, Descripcion: "Molino" },
                           { IdUbicaicon: 5, Descripcion: "Despaletizadora" },
                           { IdUbicaicon: 6, Descripcion: "Embaladora" }
                        ]
                        break;
                    case 3:
                        datosZona = [
                          { IdUbicaicon: 7, Descripcion: "Encajonadora" },
                          { IdUbicaicon: 8, Descripcion: "Empaquetadora" },
                          { IdUbicaicon: 9, Descripcion: "Inspector Botella Vacia" }
                        ]
                        break;
                    case 4:
                        datosZona = [
                          { IdUbicaicon: 10, Descripcion: "Molino" },
                          { IdUbicaicon: 11, Descripcion: "Caldera" },
                          { IdUbicaicon: 12, Descripcion: "Remolino" }
                        ]
                        break;
                    case 5:
                        datosZona = [
                          { IdUbicaicon: 13, Descripcion: "Unitanque 1" },
                          { IdUbicaicon: 14, Descripcion: "Unitanque 12" },
                          { IdUbicaicon: 15, Descripcion: "Unitanque 20" }
                        ]
                        break;
                    case 6:
                        datosZona = [
                          { IdUbicaicon: 16, Descripcion: "Filtro KSG" },
                          { IdUbicaicon: 17, Descripcion: "Filtro PVPP" },
                          { IdUbicaicon: 18, Descripcion: "Post Buffer" }
                        ]
                        break;
                    case 7:
                        datosZona = [
                          { IdUbicaicon: 19, Descripcion: "Silo de Malta 1" },
                          { IdUbicaicon: 20, Descripcion: "Silo de Malta 2" },
                          { IdUbicaicon: 21, Descripcion: "Silo de Malta Molida 1" }
                        ]
                        break;
                    case 5:
                        datosZona = [
                          { IdUbicaicon: 22, Descripcion: "Silo Adjunto 1" },
                          { IdUbicaicon: 23, Descripcion: "Silo Adjunto 2" },
                          { IdUbicaicon: 24, Descripcion: "Báscula Adjunto" }
                        ]
                        break;
                    case 6:
                        datosZona = [
                          { IdUbicaicon: 25, Descripcion: "Tanque Aditivos" },
                          { IdUbicaicon: 26, Descripcion: "Tanque Fosforico" },
                          { IdUbicaicon: 27, Descripcion: "Tanque Sales" }
                        ]
                        break;
                }

                var dsZonas = new kendo.data.DataSource({
                    data: datosZona,
                });

                $("#cmbUbicacion").data("kendoDropDownList").setDataSource(dsZonas);
                $("#cmbUbicacion").data("kendoDropDownList").dataSource.read();
                $("#cmbUbicacion").data("kendoDropDownList").refresh();

            },
            cambiaTipoMaterial: function () {
                var self = this;

                var tipo = $("#cmbTipoMaterial").data("kendoDropDownList").value();

                var datosZona = [];

                switch (parseInt(tipo)) {
                    case 1:
                        datosZona = [
                            { IdClaseMaterial: 1, Descripcion: "Malta" },
                            { IdClaseMaterial: 2, Descripcion: "Lúpulo" },
                            { IdClaseMaterial: 3, Descripcion: "Material Primas Auxiliares" }
                        ]
                        break;
                    case 2:
                        datosZona = [
                           { IdClaseMaterial: 4, Descripcion: "Mosto" },
                           { IdClaseMaterial: 5, Descripcion: "Cerveza" },
                        ]
                        break;
                    case 3:
                        datosZona = [
                          { IdClaseMaterial: 7, Descripcion: "Bagazo" },
                          { IdClaseMaterial: 8, Descripcion: "Levadura Colección" },
                          { IdClaseMaterial: 9, Descripcion: "Levadura Muerta" }
                        ]
                        break;
                }

                var dsZonas = new kendo.data.DataSource({
                    data: datosZona,
                });

                $("#cmbClaseMaterial").data("kendoDropDownList").setDataSource(dsZonas);
                $("#cmbClaseMaterial").data("kendoDropDownList").dataSource.read();
                $("#cmbClaseMaterial").data("kendoDropDownList").refresh();
            },
            cambiaClaseMaterial: function () {
                var self = this;

                var clase = $("#cmbClaseMaterial").data("kendoDropDownList").value();

                var datosZona = [];

                switch (parseInt(clase)) {
                    case 1:
                        datosZona = [
                            { IdMaterial: 1, Descripcion: "Malta Pilsen" },
                            { IdMaterial: 2, Descripcion: "Malta ECO" },
                            { IdMaterial: 3, Descripcion: "Malta Color" }
                        ]
                        break;
                    case 2:
                        datosZona = [
                           { IdMaterial: 4, Descripcion: "Extracto Magnum" },
                           { IdMaterial: 5, Descripcion: "Extracto Strisselpalt" },
                           { IdMaterial: 6, Descripcion: "Extracto Taurus" }
                        ]
                        break;
                    case 3:
                        datosZona = [
                          { IdMaterial: 7, Descripcion: "Ácido Fosfórico" },
                          { IdMaterial: 8, Descripcion: "Sales" },
                          { IdMaterial: 9, Descripcion: "CO2 Alim." }
                        ]
                        break;
                    case 4:
                        datosZona = [
                          { IdMaterial: 10, Descripcion: "M.F. A. DENS Mahou" },
                          { IdMaterial: 11, Descripcion: "M.F. A. DENS San Miguel" },
                          { IdMaterial: 12, Descripcion: "M.F. A. DENS SM Fresca" }
                        ]
                        break;
                    case 5:
                        datosZona = [
                          { IdMaterial: 13, Descripcion: "CZA A Envasar Mahou" },
                          { IdMaterial: 14, Descripcion: "CZA A Envasar San Miguel" },
                          { IdMaterial: 15, Descripcion: "CZA A Envasar Mahou Limón" }
                        ]
                        break;
                    case 7:
                        datosZona = [
                          { IdMaterial: 16, Descripcion: "Bagazo" }
                        ]
                        break;
                    case 5:
                        datosZona = [
                          { IdMaterial: 17, Descripcion: "Levadura Colección" }
                        ]
                        break;
                    case 6:
                        datosZona = [
                          { IdMaterial: 18, Descripcion: "Levadura Muerta" }
                        ]
                        break;
                }

                var dsZonas = new kendo.data.DataSource({
                    data: datosZona,
                });

                $("#cmbRefMaterial").data("kendoDropDownList").setDataSource(dsZonas);
                $("#cmbRefMaterial").data("kendoDropDownList").dataSource.read();
                $("#cmbRefMaterial").data("kendoDropDownList").refresh();

            },
            cancelar: function () {
                var self = this;

                self.window.close();
            },
            aceptar: function (e) {
                var self = this;

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_LOTE_2'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR'), funcion: function () { self.confirmaAcepta(); }, contexto: this });

            },
            confirmaAcepta: function () {
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                self.window.close();

                $("#divControlStock").data("kendoGrid").dataSource.read();
                $("#divControlStock").data("kendoGrid").refresh();

                Not.crearNotificacion('success', 'Info', window.app.idioma.t('CREADO_EL_LOTE_EN'), 2000);

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarUbicacion;
    });