define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTRunTimeForms.html', 'ALT/vAltFormComponent', 'ALT/vALTRuntimeFormsChangesDialog', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, templateHTML, VistaFormComponent, VistaDlgChanges, VistaDlgConfirm, Not) {
        var checkedItems;
        var gridGestionForms = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaFormComponent: null,
            //STANDARD FILTERS: si no pasamos ningún filtro se emplearán los siguientes
            filtrosData: new kendo.data.ObservableObject({
                idDepartmentType: "0", //si no pasan este parametro será de tipo CEL (calidad)
                idLoc: null, //Si esta a null serán todas las localizaciones
                idForm: null, // Si esta a null serán todos los tipos de formularios
                inicio: new Date(),
                fin: new Date(),
                statusPendiente: true,
                statusFinalizado: false,
                infoSIT: null,
                allowFiltersGrid: true,
                pageable: true,
                terminalMode: false,
                path: '',
                esHistorico: null,
            }),

            template: _.template(templateHTML),
            initialize: async function (filtros) {
                var self = this;
                for (var prop in filtros) {
                    self.filtrosData[prop] = filtros[prop];
                }

                if (self.filtrosData.terminalMode) {
                    let dias = await self.obtenerDiasFechaInicio('MES_MSM_ALT', 'FormsActivos_FechaDesde_Terminal');
                    self.filtrosData.inicio = new Date().addDays(parseInt(dias));
                    self.filtrosData.fin = new Date();

                    $("#dtpFechaDesde").getKendoDateTimePicker().value(self.filtrosData.inicio);
                    $("#dtpFechaHasta").getKendoDateTimePicker().value(self.filtrosData.fin);
                } else {
                    self.filtrosData.inicio = new Date().addDays(-60);
                    self.filtrosData.fin = new Date().addHours(1);

                    var splitter = $("#vertical").data("kendoSplitter");
                    splitter.bind("resize", self.resizeGrid);
                }

                Backbone.on('eventNotNewAltForm_type' + this.filtrosData.idDepartmentType, this.eventNotNewAltForm, this);
            },
            obtenerDiasFechaInicio: async function (bbdd, clave) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: "../api/general/ObtenerValorParametroGeneral?bbdd=" + bbdd + "&clave=" + clave,
                        dataType: "json",
                        success: function (response) {
                            resolve(response);
                        },
                        error: function (err) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'ObtenerValorParametroGeneral: ' + err, 4000);
                            reject();
                        }
                    });
                });
            },
            render: function () {
                $(this.el).html(this.template())
                var self = this;

                checkedItems = [];

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/RuntimeFormsByLoc/",
                            // data:  JSON.stringify(),
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                return JSON.stringify(self.filtrosData);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                'id': { type: "int" },
                                'name': { type: "string" },
                                'descript': { type: "string" },
                                'statusID': { type: "string" },
                                'isValid': { type: "string" },
                                'locPath': { type: "string" },
                                'createdOn': { type: "date" },
                                'lastModify': { type: "date" },
                                'semaforoStatus': { type: "string" },
                                'semaforoVal': { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "createdOn", dir: "desc" }
                });

                var strucPageable = false;
                if (this.filtrosData.pageable) {
                    strucPageable = {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    };
                }

                var strucFilterable = false;
                if (self.filtrosData.allowFiltersGrid) {
                    strucFilterable = {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    };
                }

                var strucToolbar = [
                    {
                        template: "<div id='divFiltros' style='float: left;'>"
                            + "<label style='margin-left: 10px;'>#:window.app.idioma.t('DESDE')#</label> "
                            + "<input id='dtpFechaDesde' data-bind='value:inicio' />"
                            + "<label style='margin-left: 10px;'>#:window.app.idioma.t('HASTA')#</label> "
                            + "<input id='dtpFechaHasta' data-bind='value:fin' />"
                            + "<label class='historico' style='margin-left: 10px;'>#:window.app.idioma.t('PENDIENTE')#</label> "
                            + "<input type='checkbox' id='dtpPendiente' class='historico' data-bind='checked:statusPendiente' />"
                            + "<label class='historico' style='margin-left: 10px;'>#:window.app.idioma.t('FINALIZADO')#</label> "
                            + "<input type='checkbox' id='dtpFinalizado' class='historico' data-bind='checked:statusFinalizado' />"
                            + "<button id='btnFiltrar' class='k-button' style='margin-left: 10px;'><span class='k-icon k-i-search'></span>#:window.app.idioma.t('CONSULTAR')#</button>"
                            + "</div>"
                    },
                    {
                        template: "<button id='btnExportarPdf' class='k-button k-button-icontext historico' style='float:right;'>" + window.app.idioma.t('ALT_EXPORTAR_PDF') + "</button>"
                    },
                    {
                        template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>#: window.app.idioma.t('QUITAR_FILTROS')#</button>"
                    }
                ];

                self.grid = this.$("#gridGestionForms").kendoGrid({
                    dataSource: self.ds,
                    autoBind: false,
                    filterable: strucFilterable,
                    toolbar: strucToolbar,
                    sortable: true,
                    resizable: true,
                    pageable: strucPageable,
                    columns: [
                        {
                            width: 30,
                            template: "<input type='checkbox' class='checkbox' style='margin-left: 1px' />",
                            headerTemplate: "<input id='checkSelectAll' type='checkbox' />"
                        },
                        {
                            title: " ",
                            field: "isValid",
                            template: "<img  id='imgEstado' src='img/KOP_#= semaforoVal #.png'></img>", //title= '#:''+errors#'
                            width: 70,
                            attributes: { style: "text-align:center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes 
                                        return "<div><label><input type='checkbox' value='#=isValid#' style='width: 14px;height:14px;margin-right:5px;'/>#= isValid=='1' ? window.app.idioma.t('VALIDO') : (isValid=='2' ? window.app.idioma.t('NO_VALIDO') : window.app.idioma.t('INCOMPLETO')) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: 60,
                            filterable: false
                        },
                        {
                            field: "createdOn",
                            title: window.app.idioma.t('FECHA_CREACION'),
                            template: '#: kendo.toString(new Date(createdOn),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            width: 165,
                            filterable: false
                        },
                        {
                            field: "triggerName",
                            title: window.app.idioma.t('ALT_EVENTO'),
                            width: 130,
                        },
                        {
                            field: window.app.idioma.t("ESTADO"),
                            template: "<img title= '#:''+errors#'  id='imgEstado' src='img/KOP_#= semaforoStatus #.png'> #=  window.app.idioma.t(statusID) #</img>",
                            width: 130,
                            attributes: { style: "text-align:center;" },
                            filterable: false
                        },
                        {
                            field: "name",
                            title: window.app.idioma.t("ALT_FORM"),
                            width: 220,
                        },
                        {
                            field: "descript",
                            title: window.app.idioma.t('DESCRIPCION'),
                            filterable: false
                        },
                        {
                            title: "",
                            command:
                            {
                                template: "<a id='btnLog' class='k-button' style='min-width:16px;'><img  src='/ALT/img/ALT_changes.png' style='width: 16px; height:16px'/></a>" +
                                    "<a id='btnBorrar' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            width: 95,
                            hidden: self.filtrosData.terminalMode,
                            filterable: false
                        }

                    ],
                    dataBound: function (e) {
                        self.editAll();
                    },
                    height: "100%"
                }).data("kendoGrid");

                //on page change reset selected
                $(self.el).find(".k-pager-numbers").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-nav").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-sizes").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });

                //bind click event to the checkbox
                self.grid.table.on("click", ".checkbox", self.selectRow);

                this.$("#dtpFechaDesde").kendoDateTimePicker({
                    //value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                this.$("#dtpFechaHasta").kendoDateTimePicker({
                    // value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                kendo.bind(self.$("#divFiltros"), self.filtrosData);

                setTimeout(function () {
                    self.resizeGrid();

                    if (self.filtrosData.esHistorico) {
                        $(".historico").show();
                    } else {
                        $(".historico").hide();
                    }

                    if (self.filtrosData.terminalMode) {
                        $(".k-i-calendar").css("margin-top", "10px");
                        $(".k-i-clock").css("margin-top", "10px");
                    }
                }, 1);

                return self; // enable chained calls
            },
            onDataBound: function (e) {
                this.editAll();
            },
            filterValid: function (isValid) {
                switch (isValid) { case 0: return 'Incompleto'; case 1: return 'Válido'; case 2: return 'No Válido'; }
            },
            eventNotNewAltForm: function () {
                //Not.crearNotificacion('info', window.app.idioma.t('AVISO'), 'Nuevo formulario CEL', 2000);
                this.refreshGrid();
            },
            refreshGrid: function () {
                $("#gridGestionForms").data('kendoGrid').dataSource.read();
                //$("#gridGestionForms").data('kendoGrid').refresh();
            },
            setFilters: function (filters) {
                for (var prop in filters) {
                    this.filtrosData[prop] = filters[prop];
                }
            },
            editAll: function () {
                var theGrid = $("#gridGestionForms").data("kendoGrid");
                $("#gridGestionForms tbody").find('tr').each(function () {
                    var model = theGrid.dataItem(this);
                    kendo.bind(this, model);
                });
                $("#gridGestionForms").focus();
            },
            events: {
                'click #btnFiltrar': 'refreshGrid',
                'click #btnEditar': 'editarTemplate',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnLog': 'showChanges',
                'click #btnBorrar': 'confirmarBorrado',
                'click #checkSelectAll': 'selectRowAll',
                'click #btnExportarPdf': 'exportarPdf',
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                if (!this.filtrosData.terminalMode) {
                    var splitter = $("#vertical").data("kendoSplitter");
                    splitter.unbind("resize", self.resizeGrid);
                } else {
                    $(window).off("resize", this.resizeGrid);
                }

                Backbone.off('eventNotNewAltForm_type' + this.filtrosData.idDepartmentType);
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

                var gridElement = $("#gridGestionForms"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight);
            },
            editarTemplate: function (e) {
                var self = this;
                var permiso;

                if (self.filtrosData.terminalMode) {
                    permiso = self.filtrosData.idDepartmentType === "0" ? TienePermiso(186) : TienePermiso(192);
                } else {
                    if (self.filtrosData.idDepartmentType === "0") {
                        if (self.filtrosData.statusFinalizado) {
                            permiso = (TienePermiso(236) || TienePermiso(237));
                        } else {
                            permiso = TienePermiso(184);
                        }
                    } else {
                        if (self.filtrosData.statusFinalizado) {
                            permiso = (TienePermiso(238) || TienePermiso(239));
                        } else {
                            permiso = TienePermiso(190)
                        }
                    }

                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                //pop-pup de formularios - visualizador de formularios 
                this.vistaFormComponent = new VistaFormComponent({
                    idDepartmentType: self.filtrosData.idDepartmentType,
                    modeConfig: false,
                    terminalMode: self.filtrosData.terminalMode,
                    formTemplate: JSON.parse(data.FormTemplate),
                    formInstance: data,
                    esHistorico: self.filtrosData.esHistorico
                });
            },
            showChanges: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                console.log("SHOW changes of " + data.ID);
                var dialog = new VistaDlgChanges(data.ID);
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso;

                if (self.filtrosData.terminalMode) {
                    permiso = self.filtrosData.idDepartmentType === "0" ? TienePermiso(186) : TienePermiso(192);
                } else {
                    if (self.filtrosData.idDepartmentType === "0") {
                        permiso = (self.filtrosData.statusFinalizado ? TienePermiso(236) : TienePermiso(184))
                    } else {
                        permiso = (self.filtrosData.statusFinalizado ? TienePermiso(238) : TienePermiso(190))
                    }
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ALT_DELETE_FORM_TITLE'),
                    msg: window.app.idioma.t('ALT_DELETE_FORM'),
                    funcion: function () { self.eliminarTemplate(e); },
                    contexto: this
                });
            },
            eliminarTemplate: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "DELETE",
                    async: false,
                    url: "../api/RuntimeForms/" + data.ID,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionForms").data('kendoGrid').dataSource.read();
                            //$("#gridGestionForms").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);
                        }
                        else
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        if (e.status == '403') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_DELETE_FORM_ERROR'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            selectRowAll: function (e) {
                var checked = $("#checkSelectAll:checked").val();
                var rows = $("#gridGestionForms").find("tr");
                var grid = $("#gridGestionForms").data("kendoGrid");
                checkedItems = [];

                if (checked) {
                    for (var i = 1; i < rows.length; i++) {
                        $(rows[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(rows[i]);
                        checkedItems.push(dataItem);
                    }
                    $("#gridGestionForms").find(".checkbox").prop('checked', true);
                    checkedItems.push()
                } else {
                    $("#gridGestionForms").find("tr").removeClass("k-state-selected");
                    $("#gridGestionForms").find(".checkbox").prop('checked', false);
                }
            },
            selectRow: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridGestionForms").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                if (checked) {
                    //select the row
                    checkedItems.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //remove selection
                    row.removeClass("k-state-selected");
                    $("#checkSelectAll").prop('checked', false);
                    var index = checkedItems.indexOf(dataItem);

                    if (index > -1) {
                        checkedItems.splice(index, 1);
                    }
                }
            },
            // Para los controles de tipo texto con formato que tienen iframe
            inlineIframesInExportContent: function (callback) {
                const $iframes = $('#exportContent iframe');
                let pending = $iframes.length;

                if (pending === 0) {
                    return callback();
                }

                $iframes.each(function () {
                    const iframe = this;

                    function processIframe() {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            const iframeHtml = $(iframeDoc.body).html();
                            const $replacement = $('<div></div>').html(iframeHtml);
                            $(iframe).replaceWith($replacement);
                        } catch (e) {
                            console.warn('No se puede acceder al iframe: ', iframe.src);
                        } finally {
                            pending--;
                            if (pending === 0) callback();
                        }
                    }

                    // Esperar a que cargue o procesar inmediatamente si ya está listo
                    if (iframe.contentDocument?.readyState === "complete") {
                        processIframe();
                    } else {
                        $(iframe).on('load', processIframe);
                    }
                });
            },
            exportarPdf: function () {
                let self = this;

                // Permiso de visualización
                var permiso = self.idDepartmentType === "0" ? TienePermiso(237) : TienePermiso(239);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return false;
                }

                if (checkedItems.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                let content = $("<div id='exportContent'></div>");

                checkedItems.forEach(function (dataItem, index) {
                    let jsonTemplate = JSON.parse(dataItem.FormTemplate);

                    let modalView = new VistaFormComponent({
                        idDepartmentType: self.filtrosData.idDepartmentType,
                        modeConfig: false,
                        terminalMode: self.filtrosData.terminalMode,
                        formTemplate: jsonTemplate,
                        formInstance: dataItem,
                        esHistorico: self.filtrosData.esHistorico
                    });

                    // Para que meta cada formulario en una página nueva
                    modalView.$('#pdfViewDiv').css({
                        "min-height": "1500px"
                    });

                    content.append(modalView.$('#pdfViewDiv'));

                    // Agregar salto de página solo si no es el último
                    if (index !== checkedItems.length - 1) {
                        content.append("<div style='page-break-after: always;'></div>");
                    }
                });

                $("body").append(content);

                setTimeout(() => {
                    self.inlineIframesInExportContent(function () {
                        kendo.drawing.drawDOM(content, {
                            margin: { top: "1cm", bottom: "1cm" },
                            paperSize: "A2",
                            landscape: true,
                        }).then(function (group) {
                            function pad2(n) { return n < 10 ? '0' + n : n }
                            var date = new Date();
                            var formatDate = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
                            var fileName = 'Exportación múltiple' + '_' + formatDate;

                            kendo.drawing.pdf.saveAs(group, fileName, "../");
                            $('.k-window').remove();
                            $('.k-overlay').hide();
                            $("#exportContent").remove();

                            checkedItems.forEach(function (dataItem, index) {
                                let tr = $("#gridGestionForms").find("[data-uid='" + dataItem.uid + "']");
                                let checkBox = tr.find("input[type='checkbox']");
                                tr.addClass("k-state-selected");
                                checkBox.prop('checked', true);
                            });
                        });
                    });
                }, 100);
            },
        });

        return gridGestionForms;
    });