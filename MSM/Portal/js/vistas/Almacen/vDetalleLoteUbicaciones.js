define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/DetalleLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'vistas/Almacen/vMoverLoteUbicacion', 'vistas/Almacen/vAjustarLoteUbicacion', 'vistas/Almacen/vReclasificarLoteUbicacion'],
    function (_, Backbone, $, plantillaGestionUbicaciones, Not, VistaDlgConfirm, vistaMoverLote, vistaAjustarLote, vistaReclasificarLote) {
        var vistaGestionUbicaciones = Backbone.View.extend({
            tagName: 'div',
            id: 'divDetalleLote',
            ds: null,
            dslista: null,
            grid: null,
            almacenes: null,
            dialog2: null,
            window2: null,
            idZona: 0,
            materiales: null,
            clases: null,
            row: null,
            template: _.template(plantillaGestionUbicaciones),
            initialize: function (dataRow) {
                var self = this;

                self.row = dataRow;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window2 = $(self.el).kendoWindow(
               {
                   title: window.app.idioma.t('DETALLE_LOTE'),
                   width: "90%",
                   height: "55%",
                   modal: true,
                   resizable: false,
                   draggable: false,
                   actions: ["close"],
                   close: function () {
                       self.window2.destroy();
                       self.window2 = null;
                   },
               }).data("kendoWindow");

                self.dialog2 = $('#divDetalleLote').data("kendoWindow");
                self.dialog2 = self.window2;
                self.dialog2.center();

                var ejemplo = [
                    { Fecha: "10/10/2017 09:15:00", Operacion: "Lote Creado", LoteMes: self.row.LoteMES, OrdenOrigen: "-", OrdenDestino: "OM-LLE-SC1-20171010-001", UbicacionOrigen: "-", UbicacionDestino: "MAHOU-EQUI1", Cantidad: "1090 KG" },
                    { Fecha: "10/10/2017 14:31:00", Operacion: "Lote Ampliado", LoteMes: self.row.LoteMES, OrdenOrigen: "OM-LLE-SC1-20171010-001", OrdenDestino: "OM-LLE-SC1-20171010-001", UbicacionOrigen: "MAHOU-EQUI1", UbicacionDestino: "MAHOU-EQUI1", Cantidad: "1500 KG" },
                    { Fecha: "11/10/2017 21:05:11", Operacion: "Lote Movido", LoteMes: self.row.LoteMES, OrdenOrigen: "OM-LLE-SC1-20171010-001", OrdenDestino: "OM-ALO-SC2-20171011-211", UbicacionOrigen: "MAHOU-EQUI1", UbicacionDestino: "MAHOU-EQUI-PRIC24", Cantidad: "1000 KG" },
                    { Fecha: "13/10/2017 12:23:42", Operacion: "Lote Dividido", LoteMes: self.row.LoteMES, OrdenOrigen: "OM-ALO-SC2-20171011-211", OrdenDestino: "OM-ALO-SC2-20171011-211", UbicacionOrigen: "MAHOU-EQUI-PRIC24", UbicacionDestino: "MAHOU-EQUI-PRIC24", Cantidad: "500 KG" },
                    { Fecha: "14/10/2017 17:56:56", Operacion: "Lote Transformado", LoteMes: self.row.LoteMES, OrdenOrigen: "OM-ALO-SC2-20171011-211", OrdenDestino: "OM-BUR-SC1-20171014-021", UbicacionOrigen: "MAHOU-EQUI-PRIC24", UbicacionDestino: "B10-EQPQ-32", Cantidad: "0 KG" },
                ];

                var dsOps = new kendo.data.DataSource({
                    data: ejemplo,
                    pageSize: 4
                });

                $("#gridOperacionesLote").kendoGrid({
                    dataSource: dsOps,
                    groupable: false,
                    sortable: false,
                    resizable: false,
                    reorderable: false,
                    scrollable: false,
                    pageable: {
                        refresh: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<label style='text-align:left;'>" + window.app.idioma.t('_OPERACIONES_') + "</label>"
                        }
                    ],
                    columns: [
                        {
                            field: 'Fecha',
                            title: window.app.idioma.t("FECHA"),
                        },
                        {
                            title: window.app.idioma.t("OPERACION"),
                            field: 'Operacion',
                        },
                         {
                             title: window.app.idioma.t("LOTEMES"),
                             field: 'LoteMes',
                         },
                        {
                            title: window.app.idioma.t("ORDEN_ORIGEN"),
                            field: 'OrdenOrigen',
                        },
                        {
                            title: window.app.idioma.t("ORDEN_DESTINO"),
                            field: 'OrdenDestino',
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'UbicacionOrigen',
                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'UbicacionDestino',
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                        },
                    ],
                });

                $("#btnMoverLote").kendoButton();
                $("#btnAjustarLote").kendoButton();
                $("#btnEliminarLote").kendoButton();
                $("#btnBloquearLote").kendoButton();
                $("#btnReclasificarLote").kendoButton();

                $("#txtLoteMES").val(self.row.LoteMES);
                $("#txtMaterial").val(self.row.Material);
                $("#txtCantidadIni").val(parseInt(self.row.Cantidad) + 150 + " " + self.row.UnidadMedida);
                $("#txtCantidadActual").val(self.row.Cantidad + " " + self.row.UnidadMedida);
                $("#txtLoteProveedor").val(self.row.LoteProveedor);
                $("#txtSSCC").val(Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111);

            },
            events: {
                'click #btnEditarLoteProveedor': 'editarLoteProveedor',
                'click #btnGuardarLoteProveedor': 'guardarLoteProveedor',
                'click #btnEditarSSCC': 'editarSSCC',
                'click #btnGuardarSSCC': 'guardarSSCC',
                'click #btnEliminarLote': 'eliminarStock',
                'click #btnBloquearLote': 'bloquearStock',
                'click #btnMoverLote': 'moverLote',
                'click #btnAjustarLote': 'ajustarLote',
                'click #btnReclasificarLote': 'reclasificarLote'

            },
            editarLoteProveedor: function () {
                var self = this;

                $("#btnEditarLoteProveedor").hide();
                $("#btnGuardarLoteProveedor").show();
                $("#txtLoteProveedor").prop("disabled", false);

            },
            guardarLoteProveedor: function () {
                var self = this;

                $("#btnEditarLoteProveedor").show();
                $("#btnGuardarLoteProveedor").hide();
                $("#txtLoteProveedor").prop("disabled", true);
                Not.crearNotificacion('success', 'Info', window.app.idioma.t('LOTE_PROVEEDOR_ACTUALIZADO'), 2000);
            },
            editarSSCC: function () {
                var self = this;

                $("#btnEditarSSCC").hide();
                $("#btnGuardarSSCC").show();
                $("#txtSSCC").prop("disabled", false);
            },
            guardarSSCC: function () {
                var self = this;

                $("#btnEditarSSCC").show();
                $("#btnGuardarSSCC").hide();
                $("#txtSSCC").prop("disabled", true);
                Not.crearNotificacion('success', 'Info', window.app.idioma.t('SSCC_ACTUALIZADO_CORRECTAMENTE'), 2000);
            },
            eliminarStock: function (e) {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ELIMINARLOTE'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTE_LOTE'), funcion: function () { self.confirmaEliminaLote(); }, contexto: this });
            },
            confirmaEliminaLote: function () {
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('BORRADO_EL_LOTE'), 4000);
            },
            bloquearStock: function (e) {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('BLOQUEARLOTE'), msg: window.app.idioma.t('DESEA_REALMENTE_BLOQUEAR_ESTE'), funcion: function () { self.confirmaBloqueaLote(); }, contexto: this });
            },
            confirmaBloqueaLote: function () {
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('BLOQUEADO_EL_LOTE'), 4000);
            },
            moverLote: function () {
                var self = this;

                self.ventanaMover = new vistaMoverLote(self.row);
            },
            ajustarLote: function () {
                var self = this;

                self.ventanaMover = new vistaAjustarLote(self.row);
            },
            reclasificarLote: function () {
                var self = this;

                self.ventanaMover = new vistaReclasificarLote(self.row);
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaGestionUbicaciones;
    });