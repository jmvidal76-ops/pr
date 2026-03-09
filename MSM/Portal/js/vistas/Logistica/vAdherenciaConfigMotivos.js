define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/AdherenciaConfigMotivos.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaConfigMotivos, VistaDlgConfirm, Not) {
        var vistaAdherenciaConfigMotivos = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaConfigMotivos),
            dsMotivos: [],
            ventanaEditarMotivo: null,
            initialize: function () {
                var self = this;

                self.obtenerDataSourceMotivos();
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.renderGrid();
            },
            events: {
                'click #btnNuevoMotivo': 'nuevoMotivo',
                'click #btnEditarMotivo': 'editarMotivo',
                'click #btnEliminarMotivo': 'confirmarEliminarMotivo'
            },
            obtenerDataSourceMotivos: function () {
                var self = this;

                self.dsMotivos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/GetMotivosAdherencia",
                            dataType: "json",
                            data: { verInactivos: true }
                        },
                    },
                    schema: {
                        model: {
                            id: 'IdMotivo',
                            fields: {
                                'IdMotivo': { type: 'string', editable: false },
                                'Motivo': { type: 'string' },
                                'Origen': { type: 'string' },
                                'Descripcion': { type: "string" },
                                'Activo': { type: "boolean" },
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
            },
            renderGrid: function () {
                var self = this;

                $('#gridMotivos').kendoGrid({
                    dataSource: self.dsMotivos,
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    selectable: true,
                    height: '100%',
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: 'IdMotivo',
                            title: window.app.idioma.t('CAUSA'),
                            width: 180,
                        },
                        {
                            field: 'Motivo',
                            title: window.app.idioma.t('MOTIVO'),
                            attributes: {
                                "id": "Motivo"
                            }
                        },
                        {
                            field: 'Origen',
                            title: window.app.idioma.t('ORIGEN'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Origen#' style='width: 14px;height:14px;margin-right:5px;'/>#=Origen#</label></div>";
                                }
                            }
                        },
                        {
                            field: "Activo",
                            title: window.app.idioma.t('ACTIVO'),
                            template: "# if(Activo){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#} #",
                            filterable: { messages: { isTrue: window.app.idioma.t("SI"), isFalse: window.app.idioma.t("NO") } },
                            width: 180,
                        },
                    ],
                    dataBinding: self.resizeGrid
                });

                self.$('#gridMotivos').kendoTooltip({
                    filter: "#Motivo",
                    position: "center",
                    width: 'auto',
                    animation: {
                        open: {
                            effects: "fade:in"
                        }
                    },
                    content: function (e) {
                        var grid = $("#gridMotivos").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        return dataItem["Descripcion"];
                    }
                }).data("kendoTooltip");
            },
            // GRIDS FUNCTIONS
            nuevoMotivo: function () {
                var self = this;
                var causa = $('#txtCausa').val();
                var motivo = $('#txtMotivo').val();
                var origen = $('#txtOrigen').val();
                var descripcion = $('#txtDescripcion').val();

                if (causa === "" || motivo === "" || origen === "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('RELLENE_TODOS_CAMPOS'), 3000);
                    return;
                }

                var queryArgs = [{
                    causa: causa,
                    motivo: motivo,
                    origen: origen,
                    descripcion: descripcion,
                    accion: 'new'
                }];

                $.ajax({
                    data: JSON.stringify(queryArgs),
                    type: "POST",
                    async: false,
                    url: "../api/SetMotivosAdherencia",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('NEW_MOTIVO_OK'), 4000);
                            $('#txtCausa').val('');
                            $('#txtMotivo').val('');
                            $('#txtOrigen').val('');
                            $('#txtDescripcion').val('');
                            self.dsMotivos.read();
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NEW_MOTIVO_NOK'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREAR_MOTIVO'), 4000);
                        }
                    }
                });
            },
            editarMotivo: function (e) {
                var self = this;
                var permiso = TienePermiso(295);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtenemos la línea seleccionada del grid
                var grid = $("#gridMotivos").data("kendoGrid");
                var row = grid.dataItem(grid.select());

                if (row == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowEditAdhMotivo'></div>"));

                $("#windowEditAdhMotivo").kendoWindow(
                    {
                        title: window.app.idioma.t('EDITAR') + ' ' + window.app.idioma.t('MOTIVO'),
                        width: "460px",
                        content: "Logistica/html/EditarAdherenciaMotivos.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaEditarMotivo.destroy();
                            self.ventanaEditarMotivo = null;
                        },
                        refresh: function () {
                            self.cargarDatosEdicionMotivo(row);
                        }
                    });

                self.ventanaEditarMotivo = $('#windowEditAdhMotivo').data("kendoWindow");
                self.ventanaEditarMotivo.center();
                self.ventanaEditarMotivo.open();
            },
            cargarDatosEdicionMotivo: function (row) {
                var self = this;

                $("#lblEditarMotivo").text(window.app.idioma.t('MOTIVO') + ': ');
                $("#lblEditarOrigen").text(window.app.idioma.t('ORIGEN') + ': ');
                $("#lblEditarDescripcion").text(window.app.idioma.t("DESCRIPCION") + ': ');
                $("#lblEditarActivo").text(window.app.idioma.t('ACTIVO') + ': ');

                $("#btnAceptarMotivo").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarMotivo").text(window.app.idioma.t('CANCELAR'));

                $("#txtEditarMotivo").val(row.Motivo);
                $("#txtEditarOrigen").val(row.Origen);
                $("#txtEditarDescripcion").val(row.Descripcion);
                $("#chkEditarActivo").prop('checked', row.Activo);

                $("#btnAceptarMotivo").kendoButton({
                    click: function () { self.confirmarEdicionMotivo(row); }
                });

                $("#btnCancelarMotivo").kendoButton({
                    click: function () { self.cancelarEdicionMotivo(); }
                });
            },
            cancelarEdicionMotivo: function () {
                this.ventanaEditarMotivo.close();
            },
            confirmarEdicionMotivo: function (row) {
                var self = this;

                var queryArgs = [];
                queryArgs.push({
                    causa: row.IdMotivo,
                    motivo: $('#txtEditarMotivo').val(),
                    origen: $('#txtEditarOrigen').val(),
                    descripcion: $('#txtEditarDescripcion').val(),
                    accion: 'edit',
                    activo: $("#chkEditarActivo").prop('checked')
                });

                $.ajax({
                    data: JSON.stringify(queryArgs),
                    type: "POST",
                    async: false,
                    url: "../api/SetMotivosAdherencia",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            self.dsMotivos.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                            self.ventanaEditarMotivo.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            confirmarEliminarMotivo: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(295);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtenemos la línea seleccionada del grid
                var grid = $("#gridMotivos").data("kendoGrid");
                var row = grid.dataItem(grid.select());

                if (row != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('TITLE_ELIMINAR_MOTIVO'),
                        msg: window.app.idioma.t('PREGUNTA_ELIMINAR_MOTIVO'),
                        funcion: function () { self.eliminarMotivo(row); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            eliminarMotivo: function (row) {
                var self = this;
                var causa = row.IdMotivo;

                var queryArgs = [{
                    causa: causa,
                    accion: 'delete'
                }];

                $.ajax({
                    data: JSON.stringify(queryArgs),
                    type: "POST",
                    async: false,
                    url: "../api/SetMotivosAdherencia",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res === '0') {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('DELETE_MOTIVO_OK'), 4000);
                            self.dsMotivos.read();
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DELETE_MOTIVO_NOK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('DELETE_MOTIVO_NOK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
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
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridMotivos"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
        });

        return vistaAdherenciaConfigMotivos;
    });