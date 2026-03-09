define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/Duotank.html', 'compartido/notificaciones', 'compartido/util', 'vistas/Logistica/vBloqueCarga'],
    function (_, Backbone, $, PlantillaDuotank, Not, util, BloqueCarga) {
        var vistaDuotank = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaDuotank),
            dsMatriculas: null,
            initialize: function () {
                Backbone.on('eventActDuotank', this.CargarInfo, this);
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;

                kendo.ui.progress($("#horizontal"), true);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.tab = util.ui.createTabStrip('#divPestanias');

                self.CargarInfo();
                self.CargarMatriculas();

                util.ui.enableResizeCenterPane();
            },
            CargarInfo: function () {
                var self = this;

                if (self.$("#listadoBloques").html() != '') {
                    self.$("#listadoBloques").html('');
                }

                $.ajax({
                    async: false,
                    url: "../api/ObtenerDuotankDatos",
                    dataType: "json",
                    success: function (res) {
                        self.zonas = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            kendo.ui.progress($("#divDuotank"), false);
                        }
                    }
                });

                self.zonas.forEach(function (zona) {
                    var bloque = new BloqueCarga({ model: zona });
                    self.$("#listadoBloques").append(bloque.el);
                    //self.lineas.push(bloqueLinea);
                });

                kendo.ui.progress($("#horizontal"), false);
            },
            CargarMatriculas: function () {
                var self = this;

                self.dsMatriculas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerDuotankMatriculas/",
                            dataType: "json",
                        },
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'Nombre': { type: "string" },
                                'Descripcion': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridMatriculas").kendoGrid({
                    dataSource: self.dsMatriculas,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    scrollable: false,
                    //height: '95%',
                    columns: [
                        {
                            field: "Id", title: window.app.idioma.t("ID"),
                        },
                        {
                            field: "Nombre", title: window.app.idioma.t("NOMBRE"),
                        },
                        {
                            field: "Descripcion", title: window.app.idioma.t("DESCRIPCION"),
                        },
                    ],
                }).data("kendoGrid");
            },
            events: {
            },
            eliminar: function () {
                Backbone.off('eventActProd');
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

        return vistaDuotank;
    });