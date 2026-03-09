define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ListadoWOERP.html', 'vistas/Envasado/vCrearEditarWO', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaListadoWO, VistaCrearEditarWO, VistaDlgConfirm, Not, JSZip) {
        var gridListadoWO = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaFormWO: null,
            template: _.template(PlantillaListadoWO),
            initialize: function () {
                window.JSZip = JSZip;
                Backbone.on('eventNotificacionOrden', this.actualiza, this);
                Backbone.on('eventNotOrdenEditada', this.actualiza, this);
                var self = this;
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ordenesPendientes/",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'idLinea': { type: "string" },
                                'numLinea': { type: "int" },
                                'descLinea': { type: "string" },
                                'descripcion': { type: "string" },
                                'id': { type: "string" },
                                //'codigoJDE': { type: "string" },
                                'estadoActual.nombre': { type: "string" },
                                'producto.codigo': { type: "string" },
                                'producto.nombre': { type: "string" },
                                'producto.udMedida': { type: "string" },
                                'producto.tipoProducto.nombre': { type: "string" },
                                'descripcion': { type: "string" },
                                'cantPlanificada': { type: "number" },
                                'dFecInicioEstimadoLocal': { type: "date" },
                                'dFecFinEstimadoLocal': { type: "date" },
                                'numLineaDescripcion': {type: "string"}
                            },
                            getUdm: function () {
                                var udm = window.app.idioma.t(this.get('producto.udMedida'));
                                return udm ? udm : this.get('producto.udMedida');
                            }
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridListadoWO"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridListadoWO"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    }
                });

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#gridListadoWO").kendoGrid({
                    dataSource: self.ds,
                    excel: {
                        fileName: window.app.idioma.t('WO_PLANIFICADAS') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("EDITAR"),
                            command: {
                                template: "<a class='k-button k-grid-edit btnEditar' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: 40,
                            attributes: { style: "text-align:center;" },
                            filterable: false
                        },
                         {
                             field: "descripcion",
                             title: " ",
                             width: 30,
                             filterable: false,
                             attributes: {
                                 style: "text-align:center;white-space: nowrap",
                             },
                             template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!descripcion){# display:none;#}#">'
                         },
                        {
                            field: "idLinea",
                            title: window.app.idioma.t("LINEA"),
                            width: 160,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            template: window.app.idioma.t("LINEA") +' #:numLineaDescripcion# - #:descLinea#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=idLinea#' style='width: 14px;height:14px;margin-right:5px;'/>Línea #= numLineaDescripcion# - #= descLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "id",
                            title: window.app.idioma.t("IDORDEN"),
                            width: 120,
                            attributes: {
                                "id": "CodWO",
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            }
                        },
                        {
                            field: "estadoActual.nombre",
                            title: window.app.idioma.t("ESTADO"),
                            width: 70,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=estadoActual.nombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= estadoActual.nombre#</label></div>";
                                    }
                                }
                            }
                        },
                        { // agomezn 010816: añadido para el requerimiento 7.1 del PowerPoint de cambios
                            field: "cambioPosible",
                            title: window.app.idioma.t("CAMBIO_ESTADO"),
                            width: 130,
                            filterable: false,
                            attributes: { style: "text-align:center;" },
                            template: "<div id='divEst#=id#' ><select id='selEst#=id#' style='width:72%;float:left;'></select><input type='image' id='btnEst#=id#' class='btnCambiaEstado' src='img/play-24.png' /></button></div>"
                        },
                        //{ field: "codigoJDE", title: window.app.idioma.t("CODIGO_JDE"), width: 80 },
                        {
                            field: "producto.codigo",
                            template: "#: producto.codigo #",
                            title: window.app.idioma.t("CODIGO_PRODUCTO"),
                            width: 80,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "producto.nombre",
                            title: window.app.idioma.t("PRODUCTO"),
                            width: 130,
                            filterable: {
                                cell: {
                                    operator: "contains"
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "dFecInicioEstimadoLocal",
                            title: window.app.idioma.t("INICIO_PLANIFICADO"),
                            width: 100,
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true, // agomezn 300516: 010 Al filtrar los log por fecha no sale nada no tiene el mismo formato de fecha
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "dFecFinEstimadoLocal",
                            title: window.app.idioma.t("FIN_PLANIFICADO"),
                            width: 100,
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true, // agomezn 300516: 010 Al filtrar los log por fecha no sale nada no tiene el mismo formato de fecha
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "cantPlanificada",
                            title: window.app.idioma.t("CANTIDAD"),
                            width: 65,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "getUdm()", title: window.app.idioma.t("UD_MEDIDA"), width: 75,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=getUdm()#' style='width: 14px;height:14px;margin-right:5px;'/>#= getUdm()#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "TipoRuta",
                            hidden: true,
                            title: window.app.idioma.t("TIPO_RUTA"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoRuta#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoRuta#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        }
                    ],
                    excelExport: function (e) {
                        kendo.ui.progress($("#gridListadoWO"), true);
                        var sheet = e.workbook.sheets[0];
                        //Header descripcion
                        sheet.rows[0].cells[0].value = window.app.idioma.t('NOTA');
                        var objectDescription = sheet.rows[0].cells[0]; // Añadimos el header descripción a una variable
                        sheet.rows[0].cells.shift();// Lo eliminamos del arreglo de Headers
                        sheet.rows[0].cells.splice(3, 1);// Eliminamos el header de cambio posible
                        sheet.rows[0].cells.push(objectDescription); // Lo añadimos al final del arreglo

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];
                                var cellDescription = ParseDescriptionToHTML(e.data[dataPosition].descripcion);// Obtenemos la celda de descripción
                                row.cells.shift();// Eliminamos de todos los datos de la fila el primer valor
                                row.cells.splice(3, 1);//Eliminamos Cambio Posible

                                //field: Linea
                                row.cells[0].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].numLinea + ' - ' + e.data[dataPosition].descLinea;
                                //field: "fechaInicio"
                                row.cells[5].value = e.data[dataPosition].dFecInicioEstimadoLocal.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].dFecInicioEstimadoLocal, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                //field: "fechaFin"
                                row.cells[6].value = e.data[dataPosition].dFecFinEstimadoLocal.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].dFecFinEstimadoLocal, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                
                                // Añadimos el valor a la última columna
                                row.cells.push({ value: cellDescription });

                            } catch (e) {
                            }
                        }

                        sheet.columns.forEach(function (column) {
                            // also delete the width if it is set
                            delete column.width;
                            column.autoWidth = true;
                        });

                        kendo.ui.progress($("#gridListadoWO"), false);
                    },
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) { // agomezn 010816: añadido para el requerimiento 7.1 del PowerPoint de cambios, clonado de VGestionWOActivas.js
                        var grid = this;
                        $(".btnCambiaEstado").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);
                            if (model.estadoActual.cambiosPosibles && model.estadoActual.cambiosPosibles.length > 0) {
                                var dsOpcionesCambio = {
                                    data: [] //cambiosPosibles
                                };

                                for (var i = 0; i < model.estadoActual.cambiosPosibles.length; i++) {
                                    dsOpcionesCambio.data.push({ id: model.estadoActual.cambiosPosibles[i].ordenMES, nombre: model.estadoActual.cambiosPosibles[i].nombre });
                                }

                                self.$("#selEst" + model.id.replace(".", "\\.")).kendoDropDownList({
                                    dataTextField: "nombre",
                                    dataValueField: "id",
                                    width: 200,
                                    dataSource: dsOpcionesCambio,
                                    optionLabel: window.app.idioma.t("SELECCIONE")
                                });
                            } else {
                                self.$("#btnEst" + model.id).hide();
                                self.$("#selEst" + model.id).hide();
                                self.$("#divEst" + model.id).append('Sin cambio posible');
                            }
                        });
                    }
                }).data("kendoGrid");

                this.$('#gridListadoWO').kendoTooltip({
                    filter: ".tooltipText",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                this.$('#gridListadoWO').kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $("#gridListadoWO").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        return CodificarEnHTML(dataItem["descripcion"]);
                    }
                }).data("kendoTooltip");

                window.app.headerGridTooltip(self.grid);
            },
            events: {
                "click #btnCrearWO": 'crearWO',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcelPlan',
                'click .btnCambiaEstado': 'validarCambio',
                'click .btnEditar': 'EditarWO',
            },
            EditarWO: function (e) {
                let self = this;
                let permiso = TienePermiso(9);

                if (permiso) {
                    var row = $(e.target.parentNode.parentNode).closest("tr");
                    var dataItem = $("#gridListadoWO").data("kendoGrid").dataItem(row);

                    self.vistaFormWO = new VistaCrearEditarWO({ data: dataItem });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrden');
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
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridListadoWO"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            crearWO: function () {
                var permiso = TienePermiso(9);

                if (permiso) {
                    this.vistaFormWO = new VistaCrearEditarWO();
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            exportExcelPlan: function () {
                kendo.ui.progress($("#gridListadoWO"), true);
                var grid = $("#gridListadoWO").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridListadoWO"), false);
            },
            actualiza: function (tipo) {
                var self = this;
                self.ds.read();
            },
            validarCambio: function (e) {
                var permiso = TienePermiso(9);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var cambio = {};
                var row = $("#" + e.currentTarget.id.replace(".", "\\.")).closest("tr");
                var item = $("#gridListadoWO").data("kendoGrid").dataItem(row);
                cambio.linea = item ? item.idLinea : null;

                if (cambio.linea) {
                    cambio.wo = item.id;
                    cambio.estado = this.$("#selEst" + cambio.wo.replace(".", "\\.") + " option:selected").val();

                    if (cambio.estado !== "") {
                        var self = this;
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('ALT_LOG_ESTADO'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_EL') + cambio.wo + " a " + cambio.estado + "?",
                            funcion: function () { self.cambiarEstado(e.currentTarget.id); },
                            contexto: this
                        });
                        e.preventDefault(); // evitamos que se realice la acción del href
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UN_ESTADO'), 4000);
                    }
                }
            },
            cambiarEstado: function (e) {
                var self = this;
                var cambio = {};
                var row = $("#" + e.replace(".", "\\.")).closest("tr"); //$(e.target.parentNode.parentNode).closest("tr");
                var item = $("#gridListadoWO").data("kendoGrid").dataItem(row);
                cambio.linea = item ? item.idLinea : null;
                cambio.wo = item.id;
                cambio.estado = this.$("#selEst" + cambio.wo.replace(".", "\\.") + " option:selected").val();

                $.ajax({
                    data: JSON.stringify(cambio),
                    type: "POST",
                    async: false,
                    url: "../api/cambiarEstadoPorSupervisor",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        if (!res[0]) Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                        else Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                    },
                    error: function (response) {
                        if (response.status == '500') {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMBIO_ESTADO'), 4000);
                        } else if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            }
        });

        return gridListadoWO;
    });