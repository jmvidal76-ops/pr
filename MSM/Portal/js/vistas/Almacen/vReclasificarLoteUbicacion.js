define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/ReclasificarLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
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


                self.tituloWindow = "Reclasificar Lote";

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

              
                $("#cmbRefMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbTipoMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    dataSource: [{ Descripcion: "Materias Primas", IdTipoMaterial: 1 }, { Descripcion: "Semielaborado", IdTipoMaterial: 2 }, { Descripcion: "Subproducto", IdTipoMaterial: 3 }],
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbClaseMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });


                for (var i = 0; i < $("#cmbTipoMaterial").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbTipoMaterial").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.TipoMaterial)
                        $("#cmbTipoMaterial").data("kendoDropDownList").value($("#cmbTipoMaterial").data("kendoDropDownList").dataSource.data()[i].IdTipoMaterial);
                }

                self.cambiaTipoMaterial();

                for (var i = 0; i < $("#cmbClaseMaterial").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbClaseMaterial").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.ClaseMaterial)
                        $("#cmbClaseMaterial").data("kendoDropDownList").value($("#cmbClaseMaterial").data("kendoDropDownList").dataSource.data()[i].IdClaseMaterial);
                }

                self.cambiaClaseMaterial();

                for (var i = 0; i < $("#cmbRefMaterial").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#cmbRefMaterial").data("kendoDropDownList").dataSource.data()[i].Descripcion === self.row.Material)
                        $("#cmbRefMaterial").data("kendoDropDownList").value($("#cmbRefMaterial").data("kendoDropDownList").dataSource.data()[i].IdMaterial);
                }
            },
            events: {
                'change #cmbTipoMaterial': 'cambiaTipoMaterial',
                'change #cmbClaseMaterial': 'cambiaClaseMaterial',
                'click #btnNewAceptar': 'aceptar',
                'click #btnNewCancelar': 'cancelar'
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

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_LOTE_2'), msg: window.app.idioma.t('DESEA_REALMENTE_RECLASIFICAR'), funcion: function () { self.confirmaAcepta(); }, contexto: this });

            },
            confirmaAcepta: function(){
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                self.window.close();

                $("#divControlStock").data("kendoGrid").dataSource.read();
                $("#divControlStock").data("kendoGrid").refresh();

                Not.crearNotificacion('success', 'Info', window.app.idioma.t('RECLASIFICADO_EL_LOTE'), 2000);

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarUbicacion;
    });