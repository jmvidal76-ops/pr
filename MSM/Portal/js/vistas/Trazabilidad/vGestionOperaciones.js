define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/GestionOperaciones.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaGestionOperaciones, Not, VistaDlgConfirm, Session) {
        var vistaGestionOperaciones = Backbone.View.extend({
            //#region ATTRIBUTES
            tagName: 'div',
            id: 'divGestionOperaciones',
            template: _.template(plantillaGestionOperaciones),
            dsOperaciones: null,
            gridOperaciones: null,
            tmpToolbar: null,
            dsUbicaciones: null,
            dsTipoOperacion: null,
            filtros: {
                IdOperacion: null,
                FechaInicio: null,
                FechaFin: null,
                TipoOperacion: null,
                IdLote: null,
                IdSublote: null,
                IdOrdenOrigen: null,
                IdOrdenDestino: null,
                IdUbicacionOrigen: null,
                IdUbicacionDestino: null

            },
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                self.DataSourceOperaciones(self);
                self.GridOperaciones(self);

                $("#filterFechaEntrada_Desde").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    dateInput: true,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#filterFechaEntrada_Hasta").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    dateInput: true,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#filterTipoOperacion").kendoComboBox({
                    suggest: true,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteTipoOperacion",
                                dataType: "json",
                                cache: false
                            }

                        },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    open: self.onElementOpen
                });

                $("#filterTipoOperacion").data("kendoComboBox").select(0);
                var cmbTipoOperacion = $("#filterTipoOperacion").data("kendoComboBox");
                cmbTipoOperacion.list.width("auto");

                $("#filterUbicacionOrigen").kendoComboBox({
                    suggest: true,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteUbicacion/Interna",
                                dataType: "json",
                                cache: false
                            }

                        },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",

                });

                $("#filterUbicacionDestino").kendoComboBox({
                    suggest: true,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteUbicacion/Interna",
                                dataType: "json",
                                cache: false
                            }

                        },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",

                });

                

                self.tmpToolbar = kendo.template($("#tmpToolbar").html());

            },

            //#region EVENTOS
            events: {
                'click #filtrar': function (e) { this.FiltrarOperaciones(e, this) },
                'click #limpiar': function (e) { this.LimpiarFiltros(e, this) },
                'click #btnFiltros': function () { this.mostrarFiltros(this); },
            },
            //#endregion EVENTOS

            //#region GRID OPERACIONES
            DataSourceOperaciones: function (self) {


                self.dsOperaciones = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    pageSize: 25,
                    transport: {
                        read: {
                            url: "../api/GetOperationsByFilters",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (data, type) {
                            if (type == "read") {
                                return JSON.stringify(self.filtros)

                            }
                        },
                    },

                    change: function () {
                        kendo.ui.progress($("#gridOperaciones"), false);
                    },
                    schema: {
                        model: {
                            id: "IdOperacion",
                            fields: {
                                'IdOperacion': { type: "number" },
                                'FechaEntrada': { type: "date" },
                                'FechaInicio': { type: "date" },
                                'FechaFin': { type: "date" },
                                'TipoOperacion': { type: "string" },
                                'IdLote': { type: "string" },
                                'IdSublote': { type: "string" },
                                'Cantidad': { type: "number" },
                                'UnidadesMedida': { type: "string" },
                                'IdOrdenOrigen': { type: "string" },
                                'IdOrdenDestino': { type: "string" },
                                'UbicacionOrigen': { type: "string" },
                                'UbicacionDestino': { type: "string" },
                                'OperadorSistema': { type: "string" },
                                'Proveedor': { type: "string" },//
                                'EAN': { type: "string" },//EAN
                                'AECOC': { type: "string" },//EAN
                                'LoteProveeddor': { type: "string" },//Lote de proveedor
                                'SSCC': { type: "string" },//SSCC
                                'IdAlbaran': { type: "string" },//ID Albaran Posición
                                'CantidadPrevia': { type: "string" },//ID Albaran Posición

                                'ReferenciaMaterial': { type: "string" },
                                'CantidadRestante': { type: "string" },
                                'IDLoteNuevo': { type: "string" },
                                'MotivoBloqueo': { type: "string" },
                                'IDMuestraLims': { type: "string" },
                                'PropiedadesExtendidas': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'Prioridad': { type: "string" },
                                'FechaCuarentena': { type: "date" },
                                'Defectuoso': { type: "string" },






                            }


                        }
                    }
                });
            },
            DetailOperations: function (e) {
                var self = this;
                self.filtros.IdOperacion = e.data.IdOperacion
                self.DataSourceOperaciones();
            },
            FiltrarOperaciones: function (e, self) {
                self.filtros = null;
                self.filtros = {
                    //IdOperacion: $("#filterIdOperacion").val() != "" ? $("#filterIdOperacion").val() : 0,
                    FechaInicio: $("#filterFechaEntrada_Desde").val() != "" ? kendo.parseDate($("#filterFechaEntrada_Desde").data('kendoDatePicker').value(), "yyyy-mm-dd") : null,
                    FechaFin: $("#filterFechaEntrada_Hasta").val() != "" ? kendo.parseDate($("#filterFechaEntrada_Hasta").data('kendoDatePicker').value(), "yyyy-mm-dd") : null,
                    IdTipoOperacion: $("#filterTipoOperacion").data("kendoComboBox").value() != "" ? $("#filterTipoOperacion").data("kendoComboBox").value() : 0,
                    IdLote: $("#filterIdLote").val() != "" ? $("#filterIdLote").val() : null,
                    IdSublote: $("#filterIdSublote").val() != "" ? $("#filterIdSublote").val() : null,
                    IdOrdenOrigen: $("#filterOrdenOrigen").val() != "" ? $("#filterOrdenOrigen").val() : null,
                    IdOrdenDestino: $("#filterOrdenDestino").val() != "" ? $("#filterOrdenDestino").val() : null,
                    IdUbicacionOrigen: $("#filterUbicacionOrigen").data("kendoComboBox").value() != "" ? $("#filterUbicacionOrigen").data("kendoComboBox").value() : 0,
                    IdUbicacionDestino: $("#filterUbicacionDestino").data("kendoComboBox").value() != "" ? $("#filterUbicacionDestino").data("kendoComboBox").value() : 0,

                };
                self.DataSourceOperaciones(self);
                var grid = $("#gridOperaciones").data("kendoGrid");
                grid.setDataSource(self.dsOperaciones);
                //grid.dataSource.read();
            },
            LimpiarFiltros: function (e, self) {
                self.filtros = null;
                var todayDate = kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy hh:mm:ss');
                $("#filterIdOperacion").val("");
                $("#filterFechaEntrada_Desde").val(todayDate);
                $("#filterFechaEntrada_Hasta").val(todayDate);
                $('#filterTipoOperacion').val("");
                $("#filterIdLote").val("");
                $("#filterIdSublote").val("");
                $("#filterOrdenOrigen").val("");
                $("#filterOrdenDestino").val("");
                $("#filterUbicacionOrigen").val("");
                $("#filterUbicacionDestino").val(""),
                self.filtros = {
                    FechaInicio: null,
                    FechaFin: null,
                    IdTipoOperacion: null,
                    IdLote: null,
                    IdSublote: null,
                    IdOrdenOrigen: null,
                    IdOrdenDestino: null,
                    IdUbicacionOrigen: null,
                    IdUbicacionDestino: null

                };
                self.DataSourceOperaciones(self);
                var grid = $("#gridOperaciones").data("kendoGrid");
                grid.setDataSource(self.dsOperaciones);
                //grid.dataSource.read();
            },
            //Metodo que muestra los pre-filtros de la consulta
            mostrarFiltros: function (self) {
                if ($("#divFilters").is(":visible")) {
                    $("#divFilters").hide("slow");
                    $("#btnFiltros").html('<span class="k-icon k-i-plus"></span>' + window.app.idioma.t('MOSTRAR_FILTROS'));
                    self.resizeContent(0);
                }
                else {
                    $("#divFilters").show("slow");
                    $("#btnFiltros").html('<span class="k-icon k-i-minus"></span>' + window.app.idioma.t('OCULTAR_FILTROS'));
                    self.resizeContent(1);
                }


            },
            GetFormattedDate: function (_date) {
                //var date = new Date(_date);
                var year = _date.getFullYear();
                var month = (1 + _date.getMonth()).toString();
                month = month.length > 1 ? month : '0' + month;
                var day = _date.getDate().toString();
                day = day.length > 1 ? day : '0' + day;
                return day + '-' + month + '-' + year;
            },
            GridOperaciones: function (self) {
                if ($("#gridOperaciones").data("kendoGrid") !== undefined) {
                    $("#gridOperaciones").data("kendoGrid").destroy();
                }
                self.gridOperaciones = this.$("#gridOperaciones").kendoGrid({
                    dataSource: self.dsOperaciones,
                    sortable: true,
                    resizable: true,
                    //autoBind: false,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    scrollable: true,
                    pageable: {
                        pageSizes: true,
                        pageSizes: [25, 50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailInit: function (e) {
                        var detailRow = e.detailRow;
                        if ($(".k-grid-Operaciones").data("kendoGrid") !== undefined) {
                            $(".k-grid-Operaciones").data("kendoGrid").destroy();
                        }

                        detailRow.find(".k-grid-Operaciones").kendoGrid({
                            sortable: true
                        });

                    },
                    detailTemplate: kendo.template($("#template").html()),
                    detailExpand: function (e) {
                        var tipoOperacion = e.sender.dataItem(e.masterRow).TipoOperacion;

                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        
                        

                    },
                    toolbar: [
                        {
                            template: kendo.template($("#tmpToolbar").html())
                        },
                        {
                            template: "<button id='filtrar' style='margin-left:5px;float:right' class='k-button k-button-icontext'><span class='k-icon k-i-search'></span>" + window.app.idioma.t('CONSULTAR') + "</button>"
                        },
                        {
                            template: "<button id='limpiar' style='margin-left:5px;float:right' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('LIMPIAR_FILTROS') + "</button>"
                        },
                         {
                             template: '<button id="btnFiltros" class="k-button" style="margin-left:5px;float:right"><span class="k-icon k-i-plus"></span>' + window.app.idioma.t('MOSTRAR_FILTROS') + '</button>'
                         },

                    ],
                    noRecords: {
                        template: "No existen datos de operaciones"
                    },
                    //detailInit: function (e) { self.detailOperations(e) },
                    columns: [
                          {
                              field: "IdOperacion",
                              hidden: true
                          },
                          {
                              field: "FechaEntrada",
                              width: "15%",
                              title: window.app.idioma.t("FECHA_ENTRADA"),
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  class: 'addTooltip'
                              },
                              template: '#=typeof FechaEntrada !== "undefined" && FechaEntrada !== null?  kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : ""#'
                          },
                          {
                              field: "TipoOperacion",
                              width: "10%",
                              title: window.app.idioma.t("TIPO_OPERACION"),
                              template: '#=typeof TipoOperacion !== "undefined" && TipoOperacion !== null ?  TipoOperacion : ""#',
                              filterable: {
                                  multi: true,
                                  itemTemplate: function (e) {
                                      if (e.field == "all") {
                                          return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                      } else {
                                          return "<div><label><input type='checkbox' value='#=TipoOperacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoOperacion#</label></div>";
                                      }
                                  }
                              },
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  class: 'addTooltip'
                              },

                          },
                            {
                                field: "IdLote",
                                width: "25%",
                                title: window.app.idioma.t("ID_LOTE"),
                                template: '#=typeof IdLote !== "undefined" && IdLote !== null ?  IdLote : ""#',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "IdSublote",
                                width: "20%",
                                title: window.app.idioma.t("ID_SUBLOTE"),
                                template: '#=typeof IdSublote !== "undefined" && IdSublote !== null ?  IdSublote : ""#',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                             {
                                 field: "Cantidad",
                                 width: "10%",
                                 title: window.app.idioma.t("CANTIDAD"),
                                 template: '#=typeof Cantidad !== "undefined" && Cantidad !== null ?   kendo.format("{0:n2}", Cantidad) : ""#'
                             },
                              {
                                  field: "UnidadesMedida",
                                  width: "5%",
                                  title: window.app.idioma.t("UNIDADES_MEDIDA"),
                                  template: '#=typeof UnidadesMedida !== "undefined" && UnidadesMedida !== null ?  UnidadesMedida : ""#',
                                  filterable: {
                                      multi: true,
                                      itemTemplate: function (e) {
                                          if (e.field == "all") {
                                              return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                          } else {
                                              return "<div><label><input type='checkbox' value='#=UnidadesMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#= UnidadesMedida#</label></div>";
                                          }
                                      }
                                  }
                              },
                               {
                                   field: "IdOrdenOrigen",
                                   width: "10%",
                                   title: window.app.idioma.t("ID_ORDEN_ORIGEN"),
                                   template: '#=typeof IdOrdenOrigen !== "undefined" && IdOrdenOrigen !== null ?  IdOrdenOrigen : ""#',
                                   attributes: {
                                       style: 'white-space: nowrap ',
                                       class: 'addTooltip'
                                   },
                               },
                                {
                                    field: "IdOrdenDestino",
                                    width: "10%",
                                    title: window.app.idioma.t("ID_ORDEN_DESTINO"),
                                    template: '#=typeof IdOrdenDestino !== "undefined" && IdOrdenDestino !== null ?  IdOrdenDestino : ""#',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                 {
                                     field: "UbicacionOrigen",
                                     width: "15%",
                                     title: window.app.idioma.t("UBICACION_ORIGEN"),
                                     template: '#=typeof UbicacionOrigen !== "undefined" && UbicacionOrigen !== null ?  UbicacionOrigen : ""#',
                                     filterable: true,
                                     attributes: {
                                         style: 'white-space: nowrap ',
                                         class: 'addTooltip'
                                     },
                                 },
                                  {
                                      field: "UbicacionDestino",
                                      width: "15%",
                                      title: window.app.idioma.t("UBICACION_DESTINO"),
                                      template: '#=typeof UbicacionDestino !== "undefined" && UbicacionDestino !== null ?  UbicacionDestino : ""#',
                                      filterable: true,
                                      attributes: {
                                          style: 'white-space: nowrap ',
                                          class: 'addTooltip'
                                      },
                                  },
                    ],
                    dataBound: function (e) {



                        self.ResizeTab();
                    }

                }).data("kendoGrid");
                $("#gridOperaciones").kendoTooltip({
                    filter: ".addTooltip",
                    show: function (e) {
                        this.popup.wrapper.css("min-width", "100px");
                        this.popup.wrapper.width("auto");

                    },
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },
            ResizeTab: function () {

                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $("#divCabeceraVista").height();
                var divtabla = $("#gridOperaciones").height(contenedorHeight - cabeceraHeight);

                $('#detail').height(contenedorHeight - cabeceraHeight);
                $("#gridOperaciones").data("kendoGrid").resize();
            },

            onElementOpen: function (e) {
                var listContainer = e.sender.list.closest(".k-list-container");
                listContainer.width(listContainer.width() + kendo.support.scrollbar());
            },
            //#endregion 

            eliminar: function () {
                this.remove();
            },
        });

        return vistaGestionOperaciones;
    });

