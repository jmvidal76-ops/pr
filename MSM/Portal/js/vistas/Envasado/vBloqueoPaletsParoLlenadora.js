define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/BloqueoPaletsParoLlenadora.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaBloqueoPalets, Not) {
        var vistaBloqueoPalets = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            template: _.template(PlantillaBloqueoPalets),
            initialize: function () {
                var self = this;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsBloqueoPalets = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerConfiguracionBloqueoPalets",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/EditarDatosBloqueoPalets",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                } else {
                                    if (e.responseJSON) {
                                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                                    } else {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_BLOQUEO_PALETS'), 4000);
                                    }

                                    var grid = $("#gridBloqueoPalets").data("kendoGrid");
                                    grid.dataSource.read();
                                }
                            },
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "IdBloqueo",
                            fields: {
                                IdBloqueo: { type: "number" },
                                LineaDescripcion: { type: "string", editable: false },
                                Habilitado: { type: "boolean" },
                                DuracionParoMinutos: { type: "number", validation: { min: 0 } },
                                NumPalets: { type: "number", validation: { min: 0 } },
                                DuracionLlenadoraEtiquetadoraMinutos: { type: "number", validation: { min: 0 } },
                                IdUltimoParo: { type: "number", editable: false }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = self.$("#gridBloqueoPalets").kendoGrid({
                    dataSource: self.dsBloqueoPalets,
                    sortable: true,
                    resizable: true,
                    editable: "inline",
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "LineaDescripcion",
                            title: window.app.idioma.t('LINEA'),
                        },
                        {
                            field: "Habilitado",
                            title: window.app.idioma.t('HABILITADO'),
                            width: 120,
                            template: "# if(Habilitado){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#} #",
                        },
                        {
                            field: "DuracionParoMinutos",
                            title: window.app.idioma.t('DURACION_PARO'),
                            format: "{0:n0}"
                        },
                        {
                            field: "NumPalets",
                            title: window.app.idioma.t('NUMERO') + ' ' + window.app.idioma.t('PALETS'),
                            format: "{0:n0}",
                            width: 150
                        },
                        {
                            field: "DuracionLlenadoraEtiquetadoraMinutos",
                            title: window.app.idioma.t('DURACION_LLENADORA_ETIQUETADORA'),
                            format: "{0:n0}"
                        },
                        {
                            field: "IdUltimoParo",
                            title: window.app.idioma.t('ID_ULTIMO_PARO'),
                            width: 150
                        },
                        {
                            title: '',
                            attributes: { "align": "center" },
                            width: 200,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(343);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridBloqueoPalets').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");
            },
            events: {
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

                var gridElement = $("#gridBloqueoPalets"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            }
        });

        return vistaBloqueoPalets;
    });