define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ModificarEstadosMaquina.html','vistas/Envasado/vPopupSepararEstadoMaquina','compartido/notificaciones'], 
    function (_, Backbone, $, PlantillaModificarCantidadesProd, VistaPopupSepararEstadoMaquina, Not) {
    var gridModEstadosMaquina = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        template: _.template(PlantillaModificarCantidadesProd),
        initialize: function () {
            

            var self = this;
            var splitter = $("#vertical").data("kendoSplitter");
            splitter.bind("resize", self.resizeGrid);

            self.render();
        },
        
        render: function () {
            Backbone.on('eventCierraDialogo', this.filtrar, this);

            $(this.el).html(this.template());
            $("#center-pane").append($(this.el))
            var self = this;

            $("#dtpFecha").kendoDatePicker({
                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                culture: localStorage.getItem("idiomaSeleccionado")
            });

            //Cargamos los combos
            $("#selectTurno").kendoDropDownList({
                dataTextField: "nombre",
                dataValueField: "id",
                dataSource: [{ id: 1, nombre: window.app.idioma.t("MAÑANA") }, { id: 2, nombre: window.app.idioma.t("TARDE") }, { id: 3, nombre: window.app.idioma.t("NOCHE") }],
                optionLabel: window.app.idioma.t("SELECCIONE_TURNO")
            });

            //Combo Anidado Linea y Maquina
            this.$("#selectLinea").kendoDropDownList({
                dataValueField: "id",
                template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                dataSource: new kendo.data.DataSource({
                    data: window.app.planta.lineas,
                    sort: { field: "numLinea", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            this.$("#selectMaquina").kendoDropDownList({
                dataTextField: "nombre",
                dataValueField: "nombre",
                dataSource: new kendo.data.DataSource({
                    sort: { field: "nombre", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t("SELECCIONE")
            }); 

            //Cargamos el grid
            this.$("#gridModEstadosMaquina").kendoGrid({
                dataSource: {                   
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "fechaInicioLocal",
                            fields: {
                                idMaquina: { type: "string", editable: false, nullable: false },
                                fechaInicioLocal: { type: "date", editable: false, nullable: false },
                                fechaFinLocal: { type: "date", editable: false, nullable: false },
                                estado: { type: "string" }
                            }
                        }
                    }
                },
                selectable: "single",
                sortable: true,
                resizable: true,
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                },
                dataBound: self.resizeGrid,
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    pageSizes: [50, 100, 200],
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                toolbar: [
                            { template: "<a class='k-button k-button-icontext' id='btnSeparar'><span class='k-icon k-i-connector'></span>" +window.app.idioma.t("SEPARAR")+"</a>" },
                            { template: "<a class='k-button k-button-icontext' id='btnUnirAbajo'><span class='k-icon k-i-arrowhead-s '></span>" + window.app.idioma.t("UNIR_ABAJO") + "</a>" },
                            { template: "<a class='k-button k-button-icontext' id='btnUnirArriba'><span class='k-icon k-i-arrowhead-n '></span>" + window.app.idioma.t("UNIR_ARRIBA") + "</a>" }
                ],
                columns: [
                    {
                        command: [
                            {
                                name: "details",
                                text: {
                                    edit: "",
                                    update: window.app.idioma.t("GUARDAR"),
                                    cancel: window.app.idioma.t("CANCELAR")
                                },
                                template: "<a class='k-button k-grid-edit' href='' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            }
                        ],
                        width: "20px"
                    },
                    {
                        field: "fechaInicioLocal", title: window.app.idioma.t("DESDE"), width: 200, filterable: false,
                        template: "#= kendo.toString(kendo.parseDate(fechaInicioLocal, 'yyyy-MM-ddTHH:mm:ss'), 'HH:mm:ss') #"
                    },
                    {
                        field: "fechaFinLocal", format: "{0: HH:mm:ss}", title: window.app.idioma.t("HASTA"), width: 200, filterable: false,
                        template: "#= kendo.toString(kendo.parseDate(fechaFinLocal, 'yyyy-MM-ddTHH:mm:ss'), 'HH:mm:ss') #"
                    },
                    {
                        field: "estado", title: window.app.idioma.t("ESTADO"), width: 100, filterable: false,
                        template: "#= window.app.idioma.t('ESTADO_' + estado) #"
                    }
                ],
                editable: {
                    mode: "popup",
                    window: {
                        title: window.app.idioma.t("ESTADOS_MQUINA")
                    },
                    template: kendo.template(this.$("#popup_editor").html())
                },
                edit: function (e) {
                    var editWindow = this.editable.element.data("kendoWindow");
                    editWindow.wrapper.css({ width: 350 });
                    editWindow.center();

                    $("#cmbEstado").kendoDropDownList({
                        autoBind: false,
                        dataTextField: "nombre",
                        dataValueField: "id",
                        dataSource: [
                            { id: 1000, nombre: window.app.idioma.t("ESTADO_1000") },
                            { id: 1001, nombre: window.app.idioma.t("ESTADO_1001") },
                            { id: 1002, nombre: window.app.idioma.t("ESTADO_1002") },
                            { id: 2000, nombre: window.app.idioma.t("ESTADO_2000") },
                            { id: 3000, nombre: window.app.idioma.t("ESTADO_3000") }
                        ],
                        text: window.app.idioma.t("ESTADO_" + e.model.estado)
                    });
                },
               
                save: function (e) {

                    var newValue = $("#cmbEstado").data("kendoDropDownList").value();
                    var oldValue = e.model.estado;
                    // the user changed the name field
                    if (newValue != "" && newValue != oldValue) {
                        e.model.estado = newValue;
                        $.ajax({
                            data: JSON.stringify(e.model),
                            type: "POST",
                            async: false,
                            url: "../api/ActualizarEstadoHistorico",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res[0]) {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ESTADO_ACTUALIZADO') ': ' + res[1], 4000);
                                    self.cancelar();
                                }
                                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_ESTADO') , 4000);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                if (jqXHR.status == '403' && jqXHR.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_ESTADO') + ':' + jqXHR.responseJSON.ExceptionMessage, 4000);
                                }
                                
                                e.model.estado = oldValue;
                            }
                        });

                    }
                    
                }
            });

            $("#filtroForm").kendoValidator({errorTemplate: ""});

            
        },

        events: {
            'change #selectLinea': 'cambiaLinea',
            'click #btnFiltrar': 'filtrar',
            'click #btnSeparar': 'separarSelectedRow',
            'click #btnUnirAbajo': 'unirAbajoSelectedRow',
            'click #btnUnirArriba': 'unirArribaSelectedRow'
        },
        unirArribaSelectedRow: function (e) {
            var self = this;
            var sel = $("#gridModEstadosMaquina tbody").find(".k-state-selected");
            if (sel.length == 0) {
                Not.crearNotificacion('error', window.app.idioma.t('UNIR_ESTADOS') , window.app.idioma.t('DEBE_SELECCIONAR_CAMBIO') , 4000);
            }            
            else {

                var grid = $("#gridModEstadosMaquina").data("kendoGrid");
                var dataRows = grid.items();
                var rowIndex = dataRows.index(grid.select());

                if (rowIndex == 0) {
                    Not.crearNotificacion('error', window.app.idioma.t('UNIR_ESTADOS') , window.app.idioma.t('IMPOSIBLE_UNIR_CAMBIOS_ESTADO') , 4000);
                } else {
                    var selectedRow = grid.dataSource.data()[rowIndex];
                    var upRow = grid.dataSource.data()[rowIndex - 1];
                    var parametros = { estado1: selectedRow, estado2: upRow , up:false}
                    $.ajax({
                        data: JSON.stringify(parametros),                        
                        type: "POST",
                        async: false,
                        url: "../api/UnirEstadosHistoricos",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res=="") {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ESTADOS_UNIDOS') + ': ' + res[1], 4000);
                                self.filtrar();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_UNIR_ESTADOS'), 4000);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == '403' && jqXHR.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_UNIR_ESTADOS') + ':' + jqXHR.responseJSON.ExceptionMessage, 4000);
                            }
                            
                        }
                    });

                }

                              
            }
        },
        unirAbajoSelectedRow: function (e) {
            var self = this;
            var sel = $("#gridModEstadosMaquina tbody").find(".k-state-selected");
            if (sel.length == 0) {
                Not.crearNotificacion('error', window.app.idioma.t('UNIR_ESTADOS') , window.app.idioma.t('DEBE_SELECCIONAR_CAMBIO') , 4000);
            }
            else {

                var grid = $("#gridModEstadosMaquina").data("kendoGrid");
                var dataRows = grid.items();
                var rowIndex = dataRows.index(grid.select());

                if (rowIndex == (dataRows.length - 1)) {
                    Not.crearNotificacion('error', window.app.idioma.t('UNIR_ESTADOS') , 'No es posible unir con ningun cambio de estado por debajo', 4000);
                } else {
                    var selectedRow = grid.dataSource.data()[rowIndex];
                    var downRow = grid.dataSource.data()[rowIndex + 1];
                    var parametros = { estado1: selectedRow, estado2: downRow, up: true }
                    $.ajax({
                        data: JSON.stringify(parametros),
                        //JSON.stringify(e.model),
                        type: "POST",
                        async: false,
                        url: "../api/UnirEstadosHistoricos",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res=="") {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ESTADOS_UNIDOS') + ': ' + res[1], 4000);
                                self.filtrar();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_UNIR_ESTADOS'), 4000);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == '403' && jqXHR.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_UNIR_ESTADOS') + ':' + jqXHR.responseJSON.ExceptionMessage, 4000);
                            }

                        }
                    });

                }
            }
        },
        separarSelectedRow: function () {
            var sel = $("#gridModEstadosMaquina tbody").find(".k-state-selected");
            if (sel.length == 0) {
                Not.crearNotificacion('error', window.app.idioma.t('SEPARAR_ESTADO'), window.app.idioma.t('SELECCIONAR_CAMBIOS_ESTADO'), 4000);
            }
            else {
                
                var grid = $("#gridModEstadosMaquina").data("kendoGrid");
                var dataRows = grid.items();
                var rowIndex = dataRows.index(grid.select());
             
                self.vistaSepararEstadoMaquina = new VistaPopupSepararEstadoMaquina({ model: grid.dataSource.data()[rowIndex] });

            }
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
        cambiaLinea: function () {

            var self = this;
            var cmbMaquina = self.$("#selectMaquina").data("kendoDropDownList");
            var opcSel = this.$("#selectLinea option:selected").val();
            if (opcSel != "") {
                cmbMaquina.dataSource.data(self.$("#selectLinea").data("kendoDropDownList").dataSource.get(opcSel).obtenerMaquinas);
                cmbMaquina.select(0);
            }
            else {
                cmbMaquina.dataSource.data([]);
                cmbMaquina.refresh();
            }


        },
        filtrar: function (e) {

            event.preventDefault();

            var self = this;
            
            if ($("#filtroForm").data("kendoValidator").validate()) {
                var tipoTurno = Number(this.$("#selectTurno").data("kendoDropDownList").value());
                var fechaTurno = this.$("#dtpFecha").data("kendoDatePicker").value().getTime() - this.$("#dtpFecha").data("kendoDatePicker").value().getTimezoneOffset() * 60 * 1000;

                $.ajax({
                    type: "GET",
                    url: "../api/EstadosMaquina/" + $("#selectLinea").data("kendoDropDownList").value() + "/" +
                                                    $("#selectMaquina").data("kendoDropDownList").value() + "/" +
                                                    fechaTurno + "/" + tipoTurno,
                    dataType: 'json',
                    cache: true
                }).success(function (data) {

                    self.$("#gridModEstadosMaquina").data("kendoGrid").dataSource.data(data);

                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_HISTORICO_ESTADOS_MAQUINA'), 4000);
                    }
                });
            } else {
                var errors = self.$("#filtroForm").data("kendoValidator").errors();
                var mensajes = "<ul>"
                $(errors).each(function () {
                    mensajes += "<li>" + this + "</li>";
                });
                mensajes += "</ul>";
                Not.crearNotificacion('error', window.app.idioma.t('FILTRO_NO_VALIDO'), mensajes, 4000);
            }

        },
        resizeGrid: function () {

            var contenedorHeight = $("#center-pane").innerHeight();
            var cabeceraHeight = $("#divCabeceraVista").innerHeight();
            var filtrosHeight = $("#divFiltros").innerHeight();

            var gridElement = $("#gridModEstadosMaquina"),
                dataArea = gridElement.find(".k-grid-content"),
                gridHeight = gridElement.innerHeight(),
                otherElements = gridElement.children().not(".k-grid-content"),
                otherElementsHeight = 0;
            otherElements.each(function () {
                otherElementsHeight += $(this).outerHeight();
            });
            dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

        }
    });


    return gridModEstadosMaquina;
});