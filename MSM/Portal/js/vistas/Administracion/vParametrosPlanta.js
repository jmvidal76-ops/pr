define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/ParametrosPlanta.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaParametrosLinea, VistaDlgConfirm, Not) {
        var gridParametrosPlanta = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            oldvalue: null,
            ventanaEditarCrear: null,
            pageSizeDefault : 50,
            template: _.template(PlantillaParametrosLinea),
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                $(this.el).html(this.template())
                $("#center-pane").append($(this.el))
                var self = this;

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerParametrosPlantaAdmin/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'IdLinea': { type: "number" },
                                'IdParametro': { type: "number" },
                                'NombreParametro': { type: "string" },
                                'DescripcionParametro': { type: "string" },
                                'TipoValor': { type: "string" },
                                'VALOR_FLOAT': { type: "number" },
                                'VALOR_INT': { type: "number" },
                                'VALOR_STRING': { type: "string" },
                                'Descripcion': { type: "string" },
                                'NumeroLineaDescripcion': { type: "string" }
                            },
                            getValor: function () {
                                var type = this.get('TipoValor').toLowerCase();
                                var valF = this.get('VALOR_FLOAT');
                                var valI = this.get('VALOR_INT');
                                var valS = this.get('VALOR_STRING');
                                return type == 'single' ? valF : (type == 'int32' ? valI : valS);
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    sort: { field: "IdLinea", dir: "asc" }
                });

                self.grid = this.$("#gridParametrosPlanta").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                    {
                        template: "<span style='margin-left:10px;margin-right:10px;font-weight:bold;'>" + window.app.idioma.t('AGRUPAR_POR') + "</span>"
                    },
                    {
                        template: "<input id='selectAgrupacion' style='width: 150px;' />",
                    },
                    {
                        template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                    }
                    ],
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("EDITAR"),
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' data-funcion='ENV_PROD_RES_10_GestionParametrosPlanta' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "35px"
                        },
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            width: 120,
                            template: window.app.idioma.t("LINEA")+" #=NumeroLineaDescripcion# - #=Descripcion#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #=NumeroLineaDescripcion# - #=Descripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NombreParametro",
                            title: window.app.idioma.t("TIPO_PARAMETRO"),
                            width: 230,
                            attributes: {
                                "id": "NombreParametro"
                            }

                        },
                        { field: "getValor()", title: window.app.idioma.t("VALOR"), width: 300, filterable: false },


                    ],
                    dataBinding: self.resizeGrid,                    
                }).data("kendoGrid");

                this.$('#gridParametrosPlanta').kendoTooltip({
                    filter: "#NombreParametro",
                    position: "center",
                    width: 'auto',
                    animation: {
                        open: {
                            effects: "fade:in"
                        }
                    },
                    content: function (e) {
                        var grid = $("#gridParametrosPlanta").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        return dataItem["DescripcionParametro"];
                    }
                }).data("kendoTooltip");

                this.$("#selectAgrupacion").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: window.app.idioma.t('SIN_AGRUPACION'), value: '0' },
                        { text: window.app.idioma.t("TIPO_PARAMETRO"), value: 'NombreParametro' },
                        { text: window.app.idioma.t("LINEA"), value: 'NumeroLineaDescripcion' }
                    ]
                });
            },
            events: {
                'change #selectAgrupacion': 'Agrupar',
                'click #btnEditar': 'editarParametroLinea',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;
                self.ds.read();
            },
            Agrupar: function () {
                if ($("#selectAgrupacion")) {
                    var dataSource = $("#gridParametrosPlanta").data("kendoGrid").dataSource;
                    if ($("#selectAgrupacion").val() != 0) {
                        var pageSize = dataSource.pageSize();
                        var totalReg = dataSource.total();
                        if (pageSize != totalReg) {
                            self.pageSizeDefault = pageSize;
                        }
                        dataSource.pageSize(totalReg);
                        dataSource.group({ field: $("#selectAgrupacion").val()  });
                    }
                    else {
                        dataSource.pageSize(self.pageSizeDefault);
                        dataSource.group("");
                    }                    
                }                
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            editarParametros: function (e) {
                var self = this;

                var dataItemModified = $.extend({}, e);
                var edit = false;

                if (dataItemModified.TipoValor.toLowerCase() == 'single') {
                    dataItemModified.VALOR_FLOAT = $("#ntxtValor").data("kendoNumericTextBox").value();
                    edit = dataItemModified.VALOR_FLOAT != self.oldvalue ? true : false;
                } else if (dataItemModified.TipoValor.toLowerCase() == 'int32') {
                    dataItemModified.VALOR_INT = $("#ntxtValor").data("kendoNumericTextBox").value();
                    edit = dataItemModified.VALOR_INT != self.oldvalue ? true : false;
                } else {
                    dataItemModified.VALOR_STRING = $("#ntxtValor").val();
                    edit = dataItemModified.VALOR_STRING != self.oldvalue ? true : false;
                }

                if (edit) {
                    $.ajax({
                        data: JSON.stringify(dataItemModified),
                        type: "POST",
                        async: false,
                        url: "../api/ModificarParametroLineaAdmin",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res) {
                                $("#gridParametrosPlanta").data('kendoGrid').dataSource.read();
                                $("#gridParametrosPlanta").data('kendoGrid').refresh();
                                //self.ds.read();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO'), 4000);
                                self.oldvalue = null;
                                self.ventanaEditarCrear.close();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                } else {
                    Backbone.trigger('eventCierraDialogo');
                }
            },
            cargaContenido: function (e) {
                //Traducimos los label del formulario
                var self = this;

                $("#btnAceptarPP").kendoButton();
                $("#btnCancelarPP").kendoButton();
                $("#lblLinea").text(window.app.idioma.t('LINEA'));
                $("#lbltipoParametro").text(window.app.idioma.t('TIPO_PARAMETRO'));
                $("#lblValor").text(window.app.idioma.t('VALOR'));
                $("#btnAceptarPP").val(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarPP").val(window.app.idioma.t('CANCELAR'));

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                $("#btnAceptarPP").kendoButton({
                    click: function () { self.confirmarEdicion(data); }
                });
                $("#btnCancelarPP").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                $("#lblValorLinea").text(data.NumeroLineaDescripcion + ' - ' + data.Descripcion);
                $("#lblValortipoParametro").text(data.NombreParametro);
                var type = data.TipoValor.toLowerCase();
                if (type == 'int32') {
                    $("#ntxtValor").kendoNumericTextBox({
                        placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                        decimals: 0,
                        min: 0,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        format: '0'
                    });
                    self.oldvalue = data.VALOR_INT;
                    $("#ntxtValor").data("kendoNumericTextBox").value(data.VALOR_INT);
                } else if (type == 'single') {
                    $("#ntxtValor").kendoNumericTextBox({
                        placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                        decimals: 2,
                        min: 0,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        spinners: false
                    });
                    self.oldvalue = data.VALOR_FLOAT;
                    $("#ntxtValor").data("kendoNumericTextBox").value(data.VALOR_FLOAT);
                } else {
                    self.oldvalue = data.VALOR_STRING;
                    $("#ntxtValor").val(data.VALOR_STRING);
                }
            },
            confirmarEdicion: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('PARAMETROS_DE_LINEA'),
                    msg: window.app.idioma.t('CONFIRMACION_EDITAR_PARAMETRO'),
                    funcion: function () { self.editarParametros(e); },
                    contexto: this
                });
            },
            editarParametroLinea: function (e) {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                {
                    title: window.app.idioma.t('PARAMETROS_LINEA'),
                    width: "450px",
                    content: "Administracion/html/EditarParametrosPlanta.html",
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
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridParametrosPlanta"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
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
        });

        return gridParametrosPlanta;
    });