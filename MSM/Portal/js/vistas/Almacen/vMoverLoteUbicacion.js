define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/MoverLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
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
            row: null,
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function (dataItem) {
                var self = this;

                self.row = dataItem;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));


                self.tituloWindow = "Mover Lote";

                self.window = $(self.el).kendoWindow(
                {
                    title: self.tituloWindow,
                    width: "400px",
                    height: "250px",
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


                for (var i = 0; i < $("#cmbNewAlmacen").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbNewAlmacen").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.DescripcionAlmacen)
                        $("#cmbNewAlmacen").data("kendoDropDownList").value($("#cmbNewAlmacen").data("kendoDropDownList").dataSource.data()[i].IdAlmacen);
                }

                self.cambiaAlmacen();

                for (var i = 0; i < $("#cmbNewZona").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbNewZona").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.DescripcionZona)
                        $("#cmbNewZona").data("kendoDropDownList").value($("#cmbNewZona").data("kendoDropDownList").dataSource.data()[i].IdZona);
                }

                self.cambiaZona();

                for (var i = 0; i < $("#cmbUbicacion").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbUbicacion").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.DescripcionUbicacion)
                        $("#cmbUbicacion").data("kendoDropDownList").value($("#cmbUbicacion").data("kendoDropDownList").dataSource.data()[i].IdUbicaicon);
                }

            },
            events: {
                'change #cmbNewAlmacen': 'cambiaAlmacen',
                'change #cmbNewZona': 'cambiaZona',
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
            cancelar: function () {
                var self = this;

                self.window.close();
            },
            aceptar: function (e) {
                var self = this;

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_LOTE_2'), msg: window.app.idioma.t('DESEA_REALMENTE_MOVER'), funcion: function () { self.confirmaAcepta(); }, contexto: this });

            },
            confirmaAcepta: function () {
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                self.window.close();

                $("#divControlStock").data("kendoGrid").dataSource.read();
                $("#divControlStock").data("kendoGrid").refresh();

                Not.crearNotificacion('success', 'Info', window.app.idioma.t('MOVIDO_EL_LOTE'), 2000);

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarUbicacion;
    });