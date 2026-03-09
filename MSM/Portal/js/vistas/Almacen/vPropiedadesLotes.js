define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/vpPropiedadesLotes.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsPropiedades: null,
            editable: false,
            elementHtml: "",
            resizeGrid: false,
            //#endregion ATTRIBUTES

            initialize: function (data, idLote, idTipo, editable, elementHtml, resizeGrid) {
                var self = this;
                self.editable = editable;
                self.elementHtml = elementHtml;
                self.resizeGrid = resizeGrid ? resizeGrid : false;
                self.dsPropiedades = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerPropiedadesLote",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
                        },
                        update: {
                            url: "../api/ActualizarPropiedadesLote",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT",
                            success: function () {
                                Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t("PROPIEDADES_MODIFICADAS_CORRECTAMENTE"), 2000);
                            }
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                return {
                                    IdLote: idLote,
                                    IdTipo: idTipo
                                };
                            } else {
                                if (data.length > 0) {
                                    var _isLoteSemielaborado = data[0].IdLoteSemielaborado;
                                    if (_isLoteSemielaborado) {
                                        options.IdLoteSeleccionado = data.map(item => item.IdLoteSemielaborado);
                                    } else {
                                        options.IdLoteSeleccionado = data.map(item => item.IdLoteMateriaPrima || item.IdLoteMES);
                                    }
                                }
                                
                                options.IdLote = idLote;
                                return JSON.stringify(options);
                            }
                        }
                    },
                    sort: { field: "Nombre", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdPropiedad",
                            fields: {
                                'IdPropiedad': { type: "number", editable: false },
                                'Nombre': { type: "string", editable: false },
                                'Valor': { type: "string" },
                                'Unidad': { type: "string", editable: false  },
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.render();
            },
            render: function () {
                var self = this;
                $(self.elementHtml).html('');
                $(self.elementHtml).prepend($(this.el));
                $(this.el).html(this.template());

                if (!$("#grid").data("kendoGrid")) {
                    $("#grid").kendoGrid({
                        dataSource: self.dsPropiedades,
                        sortable: true,
                        scrollable: true,
                        resizable: true,
                        editable: self.editable,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 500, 'All'],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: self.editable ? [{ name: "save", text: window.app.idioma.t('GUARDAR') }] : [],
                        dataBound: function () {
                            
                            if (self.resizeGrid && this.dataSource.data().length > 0)
                                self.ResizeGridPropiedades();
                        },
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        columns: [
                            {
                                title: window.app.idioma.t("NOMBRE"),
                                field: 'Nombre',
                                template: "<span class='addTooltip'>#=Nombre != null ? Nombre : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', }
                            },
                            {
                                title: window.app.idioma.t("VALOR"),
                                field: 'Valor',
                                attributes: { "align": "center", style: 'white-space: nowrap ', }
                            },
                            {
                                title: window.app.idioma.t("UNIDAD"),
                                field: 'Unidad',
                                attributes: { "align": "center", style: 'white-space: nowrap ', }
                            },
                        ]
                    });
                }
                else {
                    self.dsPropiedades.read();
                }

            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS

            ResizeGridPropiedades: function () {
                var windowHeight = $(".wnd").height();
                var cabeceraHeight = $("#grid.k-grouping-header").height();
                var headerHeightGrid = $("#grid.k-grid-header").height();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(windowHeight - cabeceraHeight - headerHeightGrid - otherElementsHeight - 20);

            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

