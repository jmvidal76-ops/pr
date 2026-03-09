define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/ArbolEquipos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaArbol, Not, VistaDlgConfirm) {
        var vistaArbol = Backbone.View.extend({
            tagName: 'div',
            id: 'divArbolEquipos',
            window: null,
            dialog: null,
            dataitem:null,
            template: _.template(plantillaArbol),
            initialize: function (dataItem) {
                var self = this;
                self.dataitem = dataItem;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
               {
                   title: window.app.idioma.t('SELECCIONE_EQUIPO_ASOCIADO'),
                   width: "800px",
                   height: "560px",
                   modal: true,
                   resizable: false,
                   draggable: false,
                   actions: ["Close"],
                   close: function () {
                       self.window.destroy();
                       self.window = null;
                   },
               }).data("kendoWindow");

                self.dialog = $('#divArbolEquipos').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#treelist").kendoTreeList({
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerEquiposSIT",
                                dataType: "json"
                            }
                        },
                        schema: {
                            model: {
                                id: "PK_Equipo",
                                parentId: "PK_Padre",
                                fields: {
                                    'PK_Equipo': { type: "number" },
                                    'PK_Padre': { type: "number" },
                                    'ID_Equipo': { type: "string" },
                                    'Nombre_Equipo': { type: "string" },
                                    'Tipo_Equipo': { type: "string" },
                                    'Common_Private': { type: "string" },
                                    'Path': { type: "string" },
                                    'Descripcion': { type: "string" }
                                },
                                expanded: true
                            }
                        }
                    },
                    height: 540,
                    filterable: true,
                    sortable: true,
                    columns: [
                        { field: "PK_Equipo", hidden: true },
                        { field: "PK_Padre", hidden: true },
                        { field: "Tipo_Equipo", hidden: true },
                        { field: "Path", hidden: true },
                        { field: "ID_Equipo", title: window.app.idioma.t('UBICACION') },
                        { field: "Descripcion", title: window.app.idioma.t('NOMBRE') },
                        { title: "", template: '<button id="btnArbol#=PK_Equipo#" class="k-button editarArbol">' + window.app.idioma.t('SELECCIONAR') + '</button>' }

                
                    ],
                    dataBound: function ()
                    {
                        var data = this.dataSource.data();

                        for (var x = 0; x < data.length; x++) {
                            var dataItem = data[x];
                            var id = dataItem.PK_Equipo;
                            var tipo = dataItem.Tipo_Equipo;

                            if (tipo != 5) {
                                $("#btnArbol" + id).hide();
                            }
                        }
                    }
                });

            },
            events: {
                'click .editarArbol': function(e) { this.seleccionaRow(e, this);  }
            },
            seleccionaRow: function(e, self)
            {
                var row = $(e.target.parentNode.parentNode).closest("tr");
                var path = row.children()[3].innerText;

                $("#linkMesIdUbicacionLinkMes").val(path);
                self.dataitem.set("valor", path);
                self.dataitem.set("idProp", "IdUbicacionLinkMes");
                self.dataitem.set("idSup", self.dataitem.idSup);

                self.window.close();
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaArbol;
    });