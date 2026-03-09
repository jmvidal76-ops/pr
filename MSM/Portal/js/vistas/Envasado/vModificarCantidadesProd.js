define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ModificarCantidadesProd.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, PlantillaModificarCantidadesProd, Not, VistaDlgConfirm) {
        var gridModCantidadesProd = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            results: [],
            filaExpand: null,
            grid: null,
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (30 * 24 * 3600 * 1000)),
            template: _.template(PlantillaModificarCantidadesProd),
            linea: 'B109',
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ModificarCantidades/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {

                            if (operation === "read") {

                                var result = {};

                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                result.linea = self.linea;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "ID",
                            fields: {
                                'ID': { type: "number" },
                                'Fecha': { type: "date" },
                                'Turno': { type: "string" },
                                'envLlenadora': { type: "number" },
                                'palPaletizadora': { type: "number" },
                                'env_vacios': { type: "number" },
                                'env_llenos': { type: "number" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                self.render();
            },
            actualiza: function () {
                var self = this;
                self.inicio = $("#dpFechaInicio").data("kendoDatePicker").value();
                self.fin = $("#dpFechaFin").data("kendoDatePicker").value();
                self.linea = this.$("#cmbLinea").data("kendoDropDownList").value();
                self.linea = self.linea.substring(self.linea.lastIndexOf(".") + 1, self.linea.length);
                self.ds.read();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                this.$("#cmbLinea").kendoDropDownList({
                    //dataTextField: "nombre",
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                });

                $("#dpFechaInicio").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
                //$("#selectTurno").kendoDropDownList();
                $("#dpFechaFin").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                this.$("#gridModCantidadesProd").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    groupable: false,
                    detailTemplate: kendo.template(this.$("#template").html()),
                    detailInit: function (e) {
                        self.detailInit(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    sortable: true,
                    toolbar: [ // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                    {
                        template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                    }],
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        pageSizes: [50, 100, 200],
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [{
                        field: 'ID',
                        title: window.app.idioma.t('ID_2'),
                        hidden: true
                    },
                                {
                                    field: 'Fecha',
                                    title: window.app.idioma.t('FECHA'),
                                    template: "#= kendo.toString(kendo.parseDate(Fecha, 'dd-MM-yyyy'), 'dd/MM/yyyy') #"
                                },
                                {
                                    field: 'Turno',
                                    title: window.app.idioma.t('TIPO_TURNO')
                                },
                                {
                                    field: 'envLlenadora',
                                    title: window.app.idioma.t('ENVASES_LLENADORA')
                                },
                                {
                                    field: 'palPaletizadora',
                                    title: window.app.idioma.t('PALES_PALETIZADORA')
                                },
                                {
                                    field: 'env_vacios',
                                    title: window.app.idioma.t('ENVASES_VACIOS_RECHAZADOS')
                                },
                                {
                                    field: 'env_llenos',
                                    title: window.app.idioma.t('PALES_RECHAZADOS_PALETIZADORA')
                                }],
                    dataBinding: self.resizeGrid,
                });

            },
            detailInit: function (e, vista) {

                var fecha = Date.parse(e.data.Fecha) / 1000;
                var turno = e.data.Turno;
                var detailRow = e.detailRow;
                var gridHoras = detailRow.find(".hora");

                

                //detailRow.find(".container").kendoTabStrip({
                //    animation: {
                //        open: { effects: "fadeIn" }
                //    },
                //})
                    //select: function (e) {
                        //vista.cargaHoras(gridHoras, fecha, turno);
                var dsHoras = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/ObtenerSubGrid/" + fecha + "/" + turno + "/" + vista.linea,
                                    dataType: "json"
                                }
                            },
                            schema: {
                                model: {
                                    fields: {
                                        'ID': { type: "number" },
                                        'Hora': { type: "string" },
                                        'eLlenadora': { type: "number" },
                                        'pPaletizadora': { type: "number" },
                                        'env_vacios': { type: "number" },
                                        'env_llenos': { type: "number" },
                                        'Turno': {type: "number"}
                                    }
                                }
                          
                            },
                            error: function (e) {
                                if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                }
                            }
                        });


                        gridHoras.kendoGrid({
                            dataSource: dsHoras,
                            scrollable: false,
                            sortable: false,
                            filterable: false,
                            pageable: false,
                            columns: [
                                {
                                command:
                                {
                                    template: "<a id='btnEditar' class='k-button k-grid-edit' data-funcion='ENV_DRP_2_GestionManualCantidades' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                },
                                width: "45px"
                            },
                                {
                                    field: 'ID',
                                    title: window.app.idioma.t('ID_2'),
                                    hidden: true
                                },
                                    {
                                        field: 'Hora',
                                        title: window.app.idioma.t('HORA'),
                                        width: "135px"
                                    },
                                    {
                                        field: 'eLlenadora',
                                        title: window.app.idioma.t('ENVASES_LLENADORA'),
                                        width: "135px"
                                    },
                                    {
                                        field: 'pPaletizadora',
                                        title: window.app.idioma.t('PALES_PALETIZADORA'),
                                        width: "135px"
                                    },
                                 {
                                     field: 'env_vacios',
                                     title: window.app.idioma.t('ENVASES_VACIOS_RECHAZADOS'),
                                     width: "135px"
                                 },
                                {
                                    field: 'env_llenos',
                                    title: window.app.idioma.t('PALES_RECHAZADOS_PALETIZADORA'),
                                    width: "135px"
                                },
                                    {
                                        field: 'Turno',
                                        title: window.app.idioma.t('TIPO_TURNO'),
                                        hidden: true
                                    }
                            ],
                        });

                //    }
                //});

            },
           
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnEditar': 'editarParametroLinea',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid' // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
            }, editarParametroLinea: function (e) {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                {
                    title: window.app.idioma.t('MODIFICAR_CANTIDADES'),
                    width: "380px",
                    height: "300px",
                    content: "Envasado/html/EditarContenidosProd.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditarCrear.destroy();
                        self.ventanaEditarCrear = null;
                    },
                    refresh: function () {
                        self.cargaContenido(e);
                    }
                });

                self.ventanaEditarCrear = $('#window').data("kendoWindow");
                self.ventanaEditarCrear.center();
                self.ventanaEditarCrear.open();

            },
            cargaContenido: function (e) {
                //Traducimos los label del formulario
                var self = this;


                $("#btnAceptar").kendoButton();
                $("#btnCancelar").kendoButton();
                $("#lblHora").text(window.app.idioma.t('HORA') + ": ");
                $("#lblEnvLlen").text(window.app.idioma.t('ENVASES_LLENADORA') + ": ");
                $("#lblPalPalet").text(window.app.idioma.t('PALES_PALETIZADORA') + ": ");
                $("#lblRLlenadora").text(window.app.idioma.t('ENVASES_RECHAZADOS_LLENADORA') + ": ");
                $("#lblrPaletizadora").text(window.app.idioma.t('PALES_RECHAZADOS_PALETIZADORA') + ": ");
                $("#btnAceptar").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelar").text(window.app.idioma.t('CANCELAR'));

                $("#txtEnvLlenadora").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0'
                });
                $("#txtPalPalet").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: 'n0'
                });
                $("#txtRLlenadora").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: 'n0'
                });

                $("#txtRPaletizadora").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: 'n0'
                });
                $("#btnAceptar").kendoButton({
                    click: function () { self.confirmarEdicion(); }
                });
                $("#btnCancelar").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });


                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = $("#gridhora").data("kendoGrid").dataItem(tr);

                $("#txtHora").val(data.Hora);
                $("#lblHoraCod").text(data.ID);
                $("#lblTurno").text(data.Turno);
                $("#txtEnvLlenadora").data("kendoNumericTextBox").value(data.eLlenadora);
                $("#txtPalPalet").data("kendoNumericTextBox").value(data.pPaletizadora);
                $("#txtRLlenadora").data("kendoNumericTextBox").value(data.env_vacios);
                $("#txtRPaletizadora").data("kendoNumericTextBox").value(data.env_llenos);

            },
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
            },
            confirmarEdicion: function (e) {
               var pl = {};
                pl.eLlenadora = $("#txtEnvLlenadora").data("kendoNumericTextBox").value();
                pl.pPaletizadora = $("#txtPalPalet").data("kendoNumericTextBox").value();
                pl.rLlenadora = $("#txtRLlenadora").data("kendoNumericTextBox").value();
                pl.rPaletizadora = $("#txtRPaletizadora").data("kendoNumericTextBox").value();

                if (pl.eLlenadora == null || pl.pPaletizadora == null || pl.rLlenadora == null || pl.rPaletizadora == null)
                {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_SIN_VALOR'), 4000);
                }
                else
                {
                    var self = this;
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('EDICION_DE_CANTIDADES'), msg: window.app.idioma.t('DESEA_REALMENTE_EDITAR'), funcion: function () { self.editarParametros(); }, contexto: this });
                }
            },
            editarParametros: function () {
                var self = this;


                var pl = {};
                pl.Hora = $("#lblHoraCod").text();
                pl.eLlenadora = $("#txtEnvLlenadora").data("kendoNumericTextBox").value();
                pl.pPaletizadora = $("#txtPalPalet").data("kendoNumericTextBox").value();
                pl.rLlenadora = $("#txtRLlenadora").data("kendoNumericTextBox").value();
                pl.rPaletizadora = $("#txtRPaletizadora").data("kendoNumericTextBox").value();
                pl.turno = $("#lblTurno").text();

                if (pl.eLlenadora == "")
                    pl.eLlenadora=0

                if (pl.pPaletizadora == "")
                    pl.pPaletizadora = 0

                if (pl.rLlenadora == "")
                    pl.rLlenadora = 0

                if (pl.rPaletizadora == "")
                    pl.rPaletizadora = 0


                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: false,
                    url: "../api/modificarCantidad/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0]) {
                            self.ds.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDADES_MODIFICADAS'), 4000);
                            self.ventanaEditarCrear.close();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_MODIFICAR_CANTIDADES'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_MODIFICAR_CANTIDADES'), 4000);
                        }                        
                        Backbone.trigger('eventCierraDialogo');
                    }
                });

            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridModCantidadesProd"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

            },
            LimpiarFiltroGrid: function () { // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                $("form.k-filter-menu button[type='reset']").trigger("click");
            }
        });


        return gridModCantidadesProd;
    });