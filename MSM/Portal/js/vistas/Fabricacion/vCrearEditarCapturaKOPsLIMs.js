define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearEditarCapturaKOPsLIMs.html', 'compartido/notificaciones', 'definiciones'],
    function (_, Backbone, $, plantillaKOPsLIMs, Not, definiciones) {
        var vistaCrearEditarCapturaKOPsLIMs = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearEditarCapturaKOPsLIMs',
            window: null,
            accion: null,
            dsTiposWO: null,
            dsKOPs: null,
            row: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            template: _.template(plantillaKOPsLIMs),
            initialize: function (accion) {
                var self = this;

                // Accion: 0 - Añadir, 1 - Editar
                self.accion = accion.operacion;

                if (self.accion == self.constOperaciones.Editar) {
                    // Obtenemos la línea seleccionada del grid
                    var grid = $("#gridKopsLims").data("kendoGrid");
                    self.row = grid.dataItem(grid.select());

                    if (self.row == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                        return;
                    }
                }

                self.obtenerTiposWO();
                self.render();
            },
            obtenerTiposWO: function () {
                var self = this;

                self.dsTiposWO = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerTiposWO",
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();
                var tituloWindow = self.accion == self.constOperaciones.Crear ? window.app.idioma.t('ANADIR') + ' ' + window.app.idioma.t('CAPTURA_KOPS_LIMS')
                    : window.app.idioma.t('ACTUALIZAR') + ' ' + window.app.idioma.t('CAPTURA_KOPS_LIMS');

                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "690px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearEditarCapturaKOPsLIMs').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == self.constOperaciones.Editar) {
                    self.rellenarDatos();
                }
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbTipoWO").kendoDropDownList({
                    dataSource: self.dsTiposWO,
                    dataTextField: "Descripcion",
                    dataValueField: "Id",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {
                        //let dataItem = this.dataItem(e.item);
                        let listaKOPs = null;

                        if (e.sender.value() == '') return;

                        $.ajax({
                            url: "../api/KOPS/ObtenerKOPSPorTipoWO/" + e.sender.value(),
                            dataType: 'json',
                            async: false
                        }).done(function (data) {
                            listaKOPs = data;
                        }).fail(function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        });

                        self.dsKOPs = new kendo.data.DataSource({
                            data: listaKOPs,
                        });

                        let cmbKOP = $("#cmbKOP").data("kendoDropDownList");
                        cmbKOP.setDataSource(self.dsKOPs);

                        if (self.accion == self.constOperaciones.Editar) {
                            $("#cmbKOP").data("kendoDropDownList").value(self.row.CodigoKOP);
                        }
                    },
                });

                self.$("#cmbKOP").kendoDropDownList({
                    template: "#= data.CodKOP # - #= data.DescKOP #",
                    filter: "contains",
                    dataTextField: "DescKOP",
                    dataValueField: "CodKOP",
                    valueTemplate: "#= data.CodKOP # - #= data.DescKOP #",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filtering: function (ev) {
                        var filterValue = ev.filter != undefined ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "CodKOP",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "DescKOP",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                });

                $("#btnAceptarCaptura").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarCaptura").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            rellenarDatos: function () {
                var self = this;

                let comboTipoWO = $("#cmbTipoWO").getKendoDropDownList();
                comboTipoWO.value(self.row.IdTipoWO);
                comboTipoWO.trigger("change");
                
                $('#txtCodigoTest').val(self.row.CodigoTest);
                $('#txtComponente').val(self.row.Componente);
                $('#chkActivo').prop("checked", self.row.Activo);
            },
            events: {
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            guardar: function () {
                var self = this;

                $("#trError").hide();

                let idTipoWO = $("#cmbTipoWO").data("kendoDropDownList").value();
                let codigoKOP = $("#cmbKOP").data("kendoDropDownList").value();
                let codigoTest = $('#txtCodigoTest').val();
                let componente = $('#txtComponente').val();
                let activo = $('#chkActivo').prop("checked");

                if (idTipoWO == '' || codigoKOP == '' || codigoTest == '' || componente == '') {
                    $("#trError").show();
                    return;
                }

                var data = {};
                data.IdConfig = self.accion == self.constOperaciones.Crear ? 0 : self.row.IdConfig;
                data.IdTipoWO = idTipoWO;
                data.CodigoKOP = codigoKOP;
                data.CodigoTest = codigoTest;
                data.Componente = componente;
                data.Activo = activo;

                var type = self.accion == self.constOperaciones.Crear ? "POST" : "PUT";
                var url = self.accion == self.constOperaciones.Crear ? "../api/KOPS/InsertarCapturaKOPSLIMS" : "../api/KOPS/ActualizarCapturaKOPSLIMS";

                $.ajax({
                    data: JSON.stringify(data),
                    type: type,
                    async: false,
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            $("#gridKopsLims").data('kendoGrid').dataSource.read();

                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 3000);
                            else
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('REGISTRO_ACTUALIZADO_CORRECTAMENTE'), 3000);
                        } else {
                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarCapturaKOPsLIMs;
    });