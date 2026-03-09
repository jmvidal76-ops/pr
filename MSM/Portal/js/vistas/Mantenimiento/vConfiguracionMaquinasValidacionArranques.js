define(['underscore', 'backbone', 'jquery', 'text!../../../Mantenimiento/html/ConfiguracionMaquinasValidacionArranques.html', 'compartido/notificaciones'
    , 'compartido/util', /*'jszip', '../../../../Portal/js/constantes'*/],
    function (_, Backbone, $, Plantilla, Not, util, /*JSZip, enums*/) {
        var ConfVistaValidacionArranques = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,            
            template: _.template(Plantilla),
            initialize: function () {
                let self = this;
                //window.JSZip = JSZip;

                let splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/ConfValidacionArranques/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",                            
                        },
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },                                
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CONF_VALIDACION_ARRANQUE'), 2000);
                        }
                        $("#center-pane").empty();
                    },
                    pageSize: 100
                });

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            actualiza: function () {
                let self = this;

                self.ds.filter({});

                self.grid.setDataSource(self.ds);
                self.ds.read();
            },
            LimpiarFiltroGrid: function () {
                let self = this;

                self.ds.filter({});
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnAnadir': 'AbrirModalAnadir',
                'click #btnEliminar': 'AbrirModalEliminar',
            },
            AbrirModalAnadir: function (e) {
                let self = this;

                let ventanaCrear = $("<div id='dlgCrearConfValidacionArranque'/>").kendoWindow({
                    title: window.app.idioma.t("CREAR_CONF_VALIDACION_ARRANQUE"),
                    width: "30%",
                    //height: "95%",
                    draggable: false,
                    scrollable: false,
                    close: function () {
                        ventanaCrear.getKendoWindow().destroy();
                    },
                    resizable: false,
                    modal: true,
                });

                let template = kendo.template($("#ModalCrearConfValidacionArranque").html());
                ventanaCrear.getKendoWindow()
                    .content(template({}))
                    .center().open();

                // Selector Linea
                $("#cmbLinea").kendoDropDownList({
                    dataValueField: "id",
                    //template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    template: "#= ObtenerLineaDescripcion(id) #",
                    valueTemplate: "#= ObtenerLineaDescripcion(id) #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    index: 0,
                    //self.tabSelect == 1 ? $("#selectLinea").getKendoDropDownList().select() : $("#selectLinea2").getKendoDropDownList().select(),
                    //optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {
                        let dropDownList = $("#cmbMaquina").getKendoDropDownList();
                        if (!dropDownList) {
                            return;
                        }
                        dropDownList.dataSource.read();
                    }
                });

                // Selector Maquina
                $("#cmbMaquina").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoMaquina",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: {
                        transport: {
                            read: function (operation) {
                                let idLinea = $("#cmbLinea").getKendoDropDownList().value();
                                if (idLinea) {
                                    $.ajax({
                                        url: "../api/MaquinasLinea/" + idLinea + "/",
                                        dataType: "json",
                                        success: function (response) {

                                            operation.success(response); //mark the operation as successful
                                        }
                                    });
                                }
                                else {
                                    operation.success([]);
                                }
                            }
                        }
                    },
                    height: 200,                    
                });

                $("#btnDialogoGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        setTimeout(() => {
                            ventanaCrear.getKendoWindow().close();
                        })
                    }
                });

                $("#btnDialogoGestionAceptar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        $("#trError").hide();
                        // Faltan campos por rellenar
                        if (!ValidarFormulario("CrearConfValidacionArranque")) {
                            $("#trError").text(ObtenerCamposObligatorios("CrearConfValidacionArranque"));
                            $("#trError").show();
                            return;
                        }

                        let idLinea = $("#cmbLinea").getKendoDropDownList().value();
                        let codigoMaquina = $("#cmbMaquina").getKendoDropDownList().value();

                        try {

                            kendo.ui.progress($("#dlgCrearConfValidacionArranque"), true);

                            await self.Crear({ Linea: idLinea, CodigoMaquina: codigoMaquina });

                            kendo.ui.progress($("#dlgCrearConfValidacionArranque"), false);

                            ventanaCrear.getKendoWindow().close();

                            Not.crearNotificacion('success', 'Mantenimiento', (window.app.idioma.t('CREADA_CONF_VALIDACION_ARRANQUE') || "").replaceAll("#MAQUINA#", codigoMaquina), 4000);

                            self.actualizarGrid();

                        } catch (err) {
                            kendo.ui.progress($("#dlgCrearConfValidacionArranque"), false);

                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), err.responseJSON.Message, 4000);
                            }
                        }
                    }
                });
            },
            AbrirModalEliminar: function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridConfValidacionArranques").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                e.preventDefault();

                OpenWindow(window.app.idioma.t("AVISO"),
                    window.app.idioma.t("SEGURO_QUE_DESEA"),
                    async function () {
                        kendo.ui.progress($("#dlgCrearConfValidacionArranque"), true);

                        try {
                            await self.Eliminar(datos);

                            kendo.ui.progress($("#dlgCrearConfValidacionArranque"), false);

                            Not.crearNotificacion('success', 'Mantenimiento', (window.app.idioma.t('ELIMINADA_CONF_VALIDACION_ARRANQUE') || "").replaceAll("#MAQUINA#", datos.CodigoMaquina), 4000);

                            self.actualizarGrid();
                        }
                        catch (er) {
                            kendo.ui.progress($("#dlgCrearConfValidacionArranque"), false);

                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_CONF_VALIDACION_ARRANQUE'), 4000);
                            }
                        }                        
                    }
                );
            },                     
            Crear: async function (datos) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/ConfValidacionArranques`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(datos),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            Eliminar: async function (datos) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "DELETE",
                        url: `../api/ConfValidacionArranques`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(datos),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            actualizarGrid: function () {
                let self = this;

                self.grid.setDataSource(self.ds);
                self.ds.read();
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(self.el).html(self.template())
                $("#center-pane").append($(self.el))
                

                self.grid = self.$("#gridConfValidacionArranques").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },                    
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Linea",
                            template: "#= ObtenerLineaDescripcion(Linea) #",
                            title: window.app.idioma.t('LINEA'),
                            width: 240,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#= ObtenerLineaDescripcion(Linea) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoMaquina",
                            title: window.app.idioma.t('CODIGO_MAQUINA'),
                            width: 170,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= CodigoMaquina#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaDescripcion",
                            title: window.app.idioma.t('MAQUINA'),
                            width: 170,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MaquinaDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                    ],
                    dataBound: function (e) {


                        //avisamos si se han llegado al limite de 30000 registros
                        //var numItems = e.sender.dataSource.total();
                        //if (numItems >= 30000) {
                        //    //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                        //    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        //}
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },          
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridConfValidacionArranques"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosdivFiltrosHeader - 2);
            }
        });

        return ConfVistaValidacionArranques;
    });