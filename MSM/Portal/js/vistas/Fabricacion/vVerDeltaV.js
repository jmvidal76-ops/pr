define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/VerDeltaV.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDeltaV, Not, VistaDlgConfirm) {
        var vistaVerDeltaV = Backbone.View.extend({
            tagName: 'div',
            id: 'divVerDeltaV',
            datos: null,
            window: null,
            mensajes: null,
            orderType: null,
            dsMensajes: null,
            tipo: null,
            template: _.template(plantillaDeltaV),
            initialize: function (data, orderType) {
                var self = this;
                self.datos = data;
                self.orderType = orderType;                

                $.ajax({
                    type: "GET",
                    url: "../api/Procedimiento/ObtenerMensajesDeltaV/" + data.ID_Orden + "/" + data.Des_Procedimiento,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    self.mensajes = data;

                    self.dsMensajes = new kendo.data.DataSource({
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "indice",
                                fields: {
                                    'indice': { type: "number" },
                                    'fabrica': { type: "string" },
                                    'modulo': { type: "string" },
                                    'lote': { type: "number" },
                                    'fecha': { type: "date" },
                                    'dato_descripcion': {type: "string" },
                                    'dato_valor': { type: "string" },
                                    'dato_unidad': { type: "string" },
                                    'fracsec': { type: "string" }
                                }
                            }
                        },
                        sort: { field: "fecha", dir: "des" }

                    });

                    //self.dsMensajes = new kendo.data.DataSource();

                    for (var i = 0; i < self.mensajes.length; i++) {
                        self.dsMensajes.add(self.mensajes[i]);
                    }

                }).error(function (err, msg, ex) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GET_ROLES'), 4000);
                })
               



                this.render();
            },
            render: function () {
                var self = this;

            
            //    this.datos.tipo = self.tipo;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('MENSAJES_DE_DELTAV'),
                    width: "90%",
                    height: "90%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

               self.dialog = $('#divVerDeltaV').data("kendoWindow");
               self.dialog = self.window;
               self.dialog.center();


               $("#gridDeltaV").kendoGrid({
                   dataSource: self.dsMensajes,
                   filterable: {
                       extra: false,
                       messages: window.app.cfgKendo.configuracionFiltros_Msg,
                       operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                   },
                   toolbar: [
                   {
                       template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                   }
                   ],
                   sortable: true,
                   resizable: true,
                   pageable: {
                       refresh: true,
                       pageSizes: [50, 100, 200],
                       pageSizes: true,
                       buttonCount: 5,
                       messages: window.app.cfgKendo.configuracionPaginado_Msg
                   },
                   columns: [
                       {
                           field: "indice",
                           width: "50px",
                           hidden: true                           
                       },
                       {
                           field: "fabrica",
                           width: "40px",
                           hidden:true
                       },
                       {
                           field: "modulo",
                           width: "80px",
                           hidden: true
                       },
                       {
                           field: "lote",
                           width: "110px",
                           title:window.app.idioma.t('LOTE_DELTAV')
                       },
                       {
                           field: "fecha",
                           width: "100px",
                           template: '#=kendo.toString(fecha).replace("T"," ")#',
                           title:window.app.idioma.t('FECHA_DELTAV')
                       },
                       {
                           field: "dato_descripcion",
                           width: "200px",
                           title:window.app.idioma.t('DATO_DELTAV')
                       },
                       {
                           field: "dato_valor",
                           width: "200px",
                           title: window.app.idioma.t('VALOR_DELTAV'),
                           template: function (e) {
                               return "<div>" + e.dato_valor.toString().replace(".", ",") + "</div>"
                           },
                       },
                        {
                            field: "dato_unidad",
                            width: "50px",
                            title: window.app.idioma.t('UD_MEDIDA')
                        },
                         {
                             field: "fracsec",
                             width: "50px",
                             title: window.app.idioma.t('FRACSEC_DELTAV')
                         },
                   ],
                   dataBinding: self.resizeGrid
               }).data("kendoGrid");
            },
                events: {
               'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();

                var gridElement = $("#gridDeltaV"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight-10);
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaVerDeltaV;
    });