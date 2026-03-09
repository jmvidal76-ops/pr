define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/VerMultiValor.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaMultiV, Not, VistaDlgConfirm) {
        var vistaMultiValor = Backbone.View.extend({
            tagName: 'div',
            id: 'divMultiValor',
            datos: null,
            idKOP: null,
            window: null,
            valores: null,
            dsvalores: null,
            tipo: null,
            gridvalores: null,
            ventanaEditar: null,
            ventanaCrear: null,
            dsCurvaOrden:  null,
            template: _.template(plantillaMultiV),
            initialize: function (data,dataSource_Kendo) {
                var self = this;
                self.datos = data[0];
                self.idKOP = self.datos.Cod_KOP;
                self.dsCurvaOrden = dataSource_Kendo;
                //Cargamos la lista de nombre de KOPS
                self.dsvalores = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMultiValor/" + self.datos.Cod_KOP,
                            dataType: "json"
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            id: "PK",
                            fields: {
                                'Cod_KOP': { type: "number" },
                                'ID_KOP': { type: "string" },
                                'Des_KOP': { type: "string" },
                                'Cod_Orden': { type: "number" },
                                'ID_Orden': { type: "string" },
                                'ID_Procedimiento': { type: "string" },
                                'Tipo_KOP': { type: "string" },
                                'Valor_Actual': { type: "string" },
                                'Valor_Minimo': { type: "string" },
                                'Valor_Maximo': { type: "string" },
                                'Obligatorio': { type: "number" },
                                'UOM_KOP': { type: "string" },
                                'Fecha': { type: "date" },
                                'Cod_Procedimiento': { type: "number" },
                                'TipoKOP': { type: "string" },
                                'Sequence_Procedimiento': { type: "number" },
                                'PkActVal': { type: "number" },
                                'Sequence_KOP': { type: "number" },
                            }
                        }
                    },
                    sort: { field: "Fecha", dir: "asc" }
                });

  
                this.render();
            },
            render: function () {
                var self = this;


                //    this.datos.tipo = self.tipo;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                $("#chartMultiValor").hide();
                $("#toolbarMultiValor").hide();


                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('KOPS_MULTIVALOR'),
                    width: "90%",
                    height: "50%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divMultiValor').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();


                self.gridvalores = $("#gridMultiValor").kendoGrid({
                    dataSource: self.dsvalores,
                    dataBound: onDataBound,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                             template: "<button type='button' id='btnExcelMultiValor' class='k-button k-button-icontext' style='float:right;background-color:darkorange; color:white;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                         },
                        {
                            template: "<button type='button' id='btnPDFMultiValor' class='k-button k-button-icontext' style='float:right;background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-pdf'></span>" + window.app.idioma.t('EXPORTAR_PDF') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnGraficoMulti' class='k-button k-button-icontext' style='float:right;background-color:royalblue; color:white;margin-left:5px;width:110.977px;'><img class='k-icon' alt='icon' src='img/chartImg2.png'/>" + window.app.idioma.t('GRAFICO') + "</button>"

                            // template: "<a id='btnGraficoMulti' class='k-button k-button-icontext' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('GRAFICO') + "</a>"
                        },
                        {
                            template: "<a id='btnCrear' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('AÑADIR_VALOR') + "</a>"
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Cod_KOP",
                            title: window.app.idioma.t("KOP"),
                            hidden: true
                        },
                        {
                            template: "<img id='imgEstado#=PkActVal#' src='img/KOP_Verde.png'></img>"
                        },
                         {
                             template: "<a id='btnEditar#=PkActVal#' class='k-button k-grid-edit editarKOP' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                         },
                         {
                             template: "<a id='btnEliminar#=PkActVal#' class='k-button k-grid-delete eliminarKOP' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                         },
                        {
                            field: "Des_KOP",
                            title: window.app.idioma.t("KOP"),
                            width: 500,
                            attributes: {
                                style: 'white-space: nowrap '
                            }
                        },

                        {
                            field: "ID_Procedimiento",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ID_Procedimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#= ID_Procedimiento#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoKOP",
                            title: window.app.idioma.t("TIPO"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoKOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoKOP#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Valor_Actual",
                            title: window.app.idioma.t("VALOR"),
                            template: '#= UOM_KOP === "ts" ? kendo.toString(Valor_Actual, "dd/MM/yyyy HH:mm:ss" ) : Valor_Actual #'
                        },
                        {
                            field: "Valor_Minimo",
                            title: window.app.idioma.t("VALOR_MINIMO")

                        },
                        {
                            field: "Valor_Maximo",
                            title: window.app.idioma.t("VALOR_MAXIMO")
                        },
                        {
                            field: "UOM_KOP",
                            template: "#=UOM_KOP.toUpperCase()#",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=UOM_KOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= UOM_KOP#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            template: '#= Fecha != null ? kendo.toString(Fecha, "dd/MM/yyyy HH:mm:ss" ) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Tipo_KOP",
                            hidden: true
                        },
                        {
                            field: "ID_Orden",
                            hidden: true
                        },
                        {
                            field: "Cod_Procedimiento",
                            hidden: true
                        },
                        {
                            field: "ID_KOP",
                            hidden: true
                        },
                        {
                            field: "PkActVal",
                            hidden: true
                        }
                    ]
                }).data("kendoGrid");


                $("#gridMultiValor").kendoTooltip({
                    filter: "td:nth-child(4)",
                    //position: "right",
                    width: 300,
                    content: function (e) {
                        var dataItem = $("#gridMultiValor").data("kendoGrid").dataItem(e.target.closest("tr"));
                        var content = dataItem.Des_KOP;
                        return content;
                    }
                }).data("kendoTooltip");

                //Databound KOPs
                function onDataBound() {
                    var data = this._data;

                    var gris = false;
                    var amarillo = false;
                    var verde = true;

                    for (var x = 0; x < data.length; x++) {
                        $("#btnGraficoMultiValor").show();
                        var dataItem = data[x];
                        var tr = $("#gridMultiValor").find("[data-uid='" + dataItem.uid + "']");
                        var cell = $("td:nth-child(1)", tr);
                        var id = $("td:nth-child(17)", tr)[0].innerHTML;

                        /*
                        Cargar las imagenes en la primera columna
                        */
                        var valorActual = $("td:nth-child(8)", tr)[0].innerHTML.replace(".", "");
                        var valorMinimo = $("td:nth-child(9)", tr)[0].innerHTML.replace(".", "");
                        var valorMaximo = $("td:nth-child(10)", tr)[0].innerHTML.replace(".", "");

                        valorActual = valorActual === "" ? "" : parseFloat(valorActual);
                        valorMinimo = valorMinimo === "" ? "" : parseFloat(valorMinimo);
                        valorMaximo = valorMaximo === "" ? "" : parseFloat(valorMaximo);

                        if (valorActual === ""){
                            $("#imgEstado" + id).attr("src", "img/KOP_Azul.png");
                            $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Azul.png");
                        }
                        else
                            if (valorMinimo === "" && valorMaximo === "")
                            {
                                $("#imgEstado" + id).attr("src", "img/KOP_Verde.png");
                                $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Verde.png");
                            }
                            else {
                                if (valorMinimo === "" && valorActual <= valorMaximo)
                                {
                                    $("#imgEstado" + id).attr("src", "img/KOP_Verde.png");
                                    $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Verde.png");
                                }
                                if (valorMinimo === "" && valorActual > valorMaximo) {
                                    $("#imgEstado" + id).attr("src", "img/KOP_Amarillo.png");
                                    $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Amarillo.png");
                                }

                                if (valorMaximo === "" && valorActual >= valorMinimo)
                                {
                                    $("#imgEstado" + id).attr("src", "img/KOP_Verde.png");
                                    $("#imgEstado" + self.id).attr("src", "img/KOP_Verde.png");
                                }
                                if (valorMaximo === "" && valorActual < valorMinimo)
                                {
                                    $("#imgEstado" + id).attr("src", "img/KOP_Amarillo.png");
                                    $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Amarillo.png");
                                }


                                if (valorMinimo !== "" && valorMaximo !== "")
                                    if (valorActual >= valorMinimo && valorActual <= valorMaximo)
                                    {
                                        $("#imgEstado" + id).attr("src", "img/KOP_Verde.png");
                                        $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Verde.png");
                                    }
                                    else
                                    {
                                        $("#imgEstado" + id).attr("src", "img/KOP_Amarillo.png");
                                        $("#imgEstado" + self.idKOP).attr("src", "img/KOP_Amarillo.png");
                                    }
                            }
                    }
                }

            },
            events: {
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnCrear': 'crearValor',
                'click .eliminarKOP': 'eliminarValor',
                'click .editarKOP': 'editarKOPS',
                'click #btnGraficoMulti': 'obtenerGrafico',
                'click #btnExcelMultiValor': 'excelMultiValor',
                'click #btnPDFMultiValor': 'pdfMultiValor',
                'click #btnPdfMultiValorGrafico': 'pdfHistorianGrafico',
                'click #btnTablaHistorian': 'cargaTabla'
            },
            cargaTabla: function () {
                var self = this;

                self.dsvalores.read();
                $("#gridMultiValor").show();
                $("#chartMultiValor").hide();
                $("#toolbarMultiValor").hide();
            },
            pdfHistorianGrafico: function () {
                var self = this;

                $("#chartMultiValor").getKendoChart().options.pdf.fileName = self.datos.ID_KOP + "_GraficoMultiValor.pdf";
                $("#chartMultiValor").getKendoChart().saveAsPDF();
            },
            excelMultiValor: function () {
                var self = this;

                $("#gridMultiValor").data("kendoGrid").options.excel.fileName = self.datos.ID_KOP + ".xlsx";
                $("#gridMultiValor").data("kendoGrid").saveAsExcel();
            },
            pdfMultiValor: function () {
                var self = this;

                $("#gridMultiValor").data("kendoGrid").options.pdf.fileName = self.datos.ID_KOP + ".pdf";
                $("#gridMultiValor").data("kendoGrid").saveAsPDF();
            },
            obtenerGrafico: function () {
                var self = this;

                $("#gridMultiValor").hide();
                $("#chartMultiValor").show();
                $("#toolbarMultiValor").show();

                if ($("#toolbarMultiValor").data("kendoToolBar") === undefined) {
                    $("#toolbarMultiValor").kendoToolBar({
                        items: [
                         { type: "button", template: '<button id="btnTablaHistorian" class="k-button k-button-icontext blueBtn"> <img class="k-icon" alt="icon" src="img/tableImg.png" />' + window.app.idioma.t('TABLA') + '</button>' },
                         { type: "separator" },
                         { type: "button", template: '<button id="btnPdfMultiValorGrafico" class="k-button k-button-icontext k-grid-pdf" style="background-color: darkorange; color: white;"><span class="k-icon k-i-pdf"></span>' + window.app.idioma.t('EXPORTAR_PDF') + '</button>' }
                        ]
                    });
                }

                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/ObtenerMultiValorGrafico/" + self.datos.Cod_KOP,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var results = data;
                        var nombre = self.datos.Des_KOP;


                        $("#chartMultiValor").kendoChart({
                            pdf: {
                                fileName: self.datos.ID_KOP + ".pdf",
                            },
                            title: {
                                text: nombre
                            },
                            legend: {
                                position: "bottom"
            },
                            seriesDefaults: {
                                type: "line"
                            },
                            pannable: {
                                lock: "y"
                            },
                            zoomable: {
                                mousewheel: {
                                    lock: "y"
                                },
                                selection: {
                                    lock: "y"
                                }
                            },
                            series: results.series,
                            seriesColors: ["#088A29", "#A4A4A4", "#A4A4A4"],
                            valueAxis: {
                                labels: {
                                    format: "{0} "
                                },
                                line: {
                                    visible: false
                                },
                                axisCrossingValue: -10
                            },
                            categoryAxis: {
                                categories: results.Fields,
                                majorGridLines: {
                                    visible: false
                                },
                                labels: {
                                    rotation: "auto"
                                }
                            },
                            tooltip: {
                                visible: true,
                                format: "{0}",
                                template: "#= series.name #: #= value #"
                            }
                        });
                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });


            },
            crearValor: function () {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowCrear'></div>"));

                $("#windowCrear").kendoWindow(
                {
                    title: window.app.idioma.t('CREAR_VALOR_DE'),
                    width: "870",
                    top: "339",
                    left: "410",
                    height: "210",
                    content: "Fabricacion/html/EditarKOPSMultiValor.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaCrear.destroy();
                        self.ventanaCrear = null;
                    },
                    refresh: function () {
                        self.cargaContenidoCrear();
                    }
                });

                self.ventanaCrear = $('#windowCrear').data("kendoWindow");
                self.ventanaCrear.center();
                self.ventanaCrear.open();

            },
            cargaContenidoCrear: function () {
                //Traducimos los label del formulario
                var self = this;


                $("#btnAceptarKOP").kendoButton();
                $("#btnCancelarKOP").kendoButton();
                $("#lblNombre").text(window.app.idioma.t('NOMBRE') + ": ");
                $("#lblProcedimiento").text(window.app.idioma.t('PROCEDIMIENTO') + ": ");
                $("#lblTipo").text(window.app.idioma.t('TIPO') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#lblUom").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblFecha").text(window.app.idioma.t('FECHA') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));

                $("#txtFecha").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });


                $("#btnAceptarKOP").kendoButton({
                    click: function () { self.agregarMultiValor(); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function () { self.CancelarFormularioCrear(); }
                });

                $("#lblIDKOP").text(self.datos.ID_KOP);
                $("#lblIDOrden").text(self.datos.ID_Orden);
                $("#lblCodProc").text(self.datos.Cod_Procedimiento);


                var maximo = 85;

                if (self.datos.Des_KOP.length > maximo) {
                    $("#txtNombre").text(self.datos.Des_KOP.substring(0, maximo) + '...');
                    $("#txtNombre").kendoTooltip({
                        filter: $("#txtNombre"),
                        width: 600,
                        content: function (e) {
                            var content = self.datos.Des_KOP;
                            return content;
                        }
                    }).data("kendoTooltip");
                }
                else
                $("#txtNombre").text(self.datos.Des_KOP);


                $("#txtProcedimiento").text(self.datos.ID_Procedimiento);
                $("#txtTipo").text(self.datos.TipoKOP);
                $("#txtUom").text(self.datos.UOM_KOP);
                $("#txtMinimo").text(self.datos.Valor_Minimo);
                $("#txtMaximo").text(self.datos.Valor_Maximo);


                switch (self.datos.Tipo_KOP.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            min: 0,
                            culture: "es-ES",
                            format: 'n0'
                        });

                        break;
                    case "float":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 2,
                            min: 0,
                            culture: "es-ES",
                            format: 'n2'
                        });

                        break;
                    case "datetime":

                        $("#txtValor").kendoDateTimePicker({
                            format: "dd/MM/yyyy HH:mm:ss",
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            value: new Date()
                        });

                        break;
                    case "string":
                        $("#txtValor").addClass("k-textbox");
                        break;

                }
            },
            agregarMultiValor: function () {
                var self = this;
                var valor = "";
                if ($("#txtValor").val() === "")
                     valor = $("#txtValor").text();
                else
                     valor = $("#txtValor").val();

                if (valor.length === 0 || valor === "Introduzca un valor")
                    $("#lblErrorValor").show();
                else {
                    $("#lblErrorValor").hide();
                    self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('AÑADIR_VALOR'), msg: window.app.idioma.t('AGREGAR_ESTE_VALOR'), funcion: function () { self.agregaKOPConfirma(); }, contexto: this });
                }
            },
            agregaKOPConfirma: function () {
                var self = this;

                var valor = $("#txtValor").val();
                var kop = $("#lblIDKOP").text();
                var orden = $("#lblIDOrden").text();
                var fecha = $("#txtFecha").val();

                var datos = {};
                datos.valor = valor;
                datos.kop = kop;
                datos.orden = orden;
                datos.fecha = fecha;

                $.ajax({
                    type: "POST",
                    url: "../api/crearMultiValorKOP/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    self.ventanaCrear.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.gridvalores.dataSource.read();
                    self.dsCurvaOrden.read();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('VALOR_AGREGADO_CORRECTAMENTE'), 3000);
                }).fail(function (err) {
                    self.ventanaCrear.close();
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 2000);
                });
            },
            eliminarValor: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.gridvalores.dataItem(tr);

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('BORRA_VALOR'), msg: window.app.idioma.t('BORRAR_ESTE_VALOR'), funcion: function () { self.borraValorConfirma(data.PkActVal); }, contexto: this });

            },
            borraValorConfirma: function (pk) {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/borrarMultiValorKOP/" + pk,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    self.gridvalores.dataSource.read();
                    self.dsCurvaOrden.read();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('VALOR_AGREGADO_CORRECTAMENTE'), 3000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 2000);
                });
            },
            editarKOPS: function (e) {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowEdit'></div>"));

                $("#windowEdit").kendoWindow(
                {
                    title: window.app.idioma.t('EDITARKOP'),
                    width: "870",
                    top: "339",
                    left: "410",
                    height: "210",
                    content: "Fabricacion/html/EditarKOPS.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditar.destroy();
                        self.ventanaEditar = null;
                    },
                    refresh: function () {
                        self.cargaContenidoEditar(e);
                    }
                });

                self.ventanaEditar = $('#windowEdit').data("kendoWindow");
                self.ventanaEditar.center();
                self.ventanaEditar.open();

            },
            cargaContenidoEditar: function (e) {
                //Traducimos los label del formulario
                var self = this;


                $("#btnAceptarKOP").kendoButton();
                $("#btnCancelarKOP").kendoButton();
                $("#lblNombre").text(window.app.idioma.t('NOMBRE') + ": ");
                $("#lblProcedimiento").text(window.app.idioma.t('PROCEDIMIENTO') + ": ");
                $("#lblTipo").text(window.app.idioma.t('TIPO') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#lblUom").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblFecha").text(window.app.idioma.t('FECHA') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));
                $("#lblTextValor").text(window.app.idioma.t('ANTIGUO_VALOR') + ": ");



                $("#txtFecha").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });


                $("#btnAceptarKOP").kendoButton({
                    click: function () { self.confirmarEdicionMultiValue(); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function () { self.CancelarFormularioEditar(); }
                });


                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.gridvalores.dataItem(tr);

                $("#lblIDKOP").text(data.ID_KOP);
                $("#lblIDOrden").text(data.ID_Orden);
                $("#lblCodProc").text(data.Cod_Procedimiento);
                $("#lblAntiguoValor").text(data.Valor_Actual === null ? "-" : data.Valor_Actual);
                $("#txtNombre").text(data.Des_KOP);
                $("#txtProcedimiento").text(data.ID_Procedimiento);
                $("#txtTipo").text(data.TipoKOP);
                $("#txtMinimo").text(data.Valor_Minimo === null ? "-" : data.Valor_Minimo);
                $("#txtMaximo").text(data.Valor_Maximo === null ? "-" : data.Valor_Maximo);
                $("#txtUom").text(data.UOM_KOP);
                $("#lblActValPK").text(data.PkActVal);

                var maximo = 40;

                if (data.Des_KOP.length > maximo) {
                    $("#txtNombre").text(data.Des_KOP.substring(0, maximo) + '...');
                    $("#txtNombre").kendoTooltip({
                        filter: $("#txtNombre"),
                        width: 600,
                        content: function (e) {
                            var content = data.Des_KOP;
                            return content;
                        }
                    }).data("kendoTooltip");
                }
                else
                    $("#txtNombre").text(data.Des_KOP);


                switch (data.Tipo_KOP.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            min: 0,
                            culture: "es-ES",
                            format: 'n0'
                        });
                        break;
                    case "float":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 2,
                            min: 0,
                            culture: "es-ES",
                            format: 'n2'
                        });
                        break;
                    case "datetime":
                        if (data.Valor_Actual !== null) {
                            $("#txtValor").kendoDateTimePicker({
                                format: "dd/MM/yyyy HH:mm:ss",
                                culture: localStorage.getItem("idiomaSeleccionado"),
                                value: data.Valor_Actual
                            });
                        }
                        else {
                            $("#txtValor").kendoDateTimePicker({
                                format: "dd/MM/yyyy HH:mm:ss",
                                culture: localStorage.getItem("idiomaSeleccionado"),
                                value: new Date()
                            });
                        }

                        break;
                    case "string":
                        $("#txtValor").addClass("k-textbox");
                        break;

                }
            },
            confirmarEdicionMultiValue: function () {
                var self = this;
                var valor = "";
                if ($("#txtValor").val() === "")
                     valor = $("#txtValor").text();
                else
                     valor = $("#txtValor").val();

                if (valor.length === 0 || valor === "Introduzca un valor")
                    $("#lblErrorValor").show();
                else {
                    $("#lblErrorValor").hide();
                    self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('EDITAR_KOP'), msg: window.app.idioma.t('EDITAR_ESTE_VALOR'), funcion: function () { self.editarMultiValorKOPConfirma(); }, contexto: this });
                }
            },
            editarMultiValorKOPConfirma: function () {
                var self = this;

                var pl = {};
                pl.Fecha = $("#txtFecha").val();
                var valor = "";
                if ($("#txtValor").val() === "")
                     valor = $("#txtValor").text();
                else
                     valor = $("#txtValor").val();

                pl.ValorKOP = valor;
                pl.PkActVal = $("#lblActValPK").text();

                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: true,
                    url: "../api/editaMultiValorKOP",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                        self.gridvalores.dataSource.read();
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO_CORRECTAMENTE'), 2000);
                        self.ventanaEditar.close();
                        $("#gridKOPS").data('kendoGrid').dataSource.read();
                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                this.remove();
            },
            CancelarFormularioCrear: function () {
                this.ventanaCrear.close();
            },
            CancelarFormularioEditar: function () {
                this.ventanaEditar.close();
            },
            close: function () {
                console.log("Ventana cerrada");
            }
        });

        return vistaMultiValor;
    });