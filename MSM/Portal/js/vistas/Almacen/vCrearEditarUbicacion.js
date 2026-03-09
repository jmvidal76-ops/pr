define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/CrearEditarUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm) {
        var vistaCrearEditarUbicacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            dialog: null,
            row: null,
            accion: null,
            dsTiposUbicacion: null,
            dsEstadosUbicacion: null,
            dsPoliticaAlmacenamiento: null,
            dsPoliticaLlenado: null,
            dsPoliticaVaciado: null,
            dsAlmacen: null,
            dsZona: null,
            dsMateriales: null,
            dsClasesMaterial: null,
            dsTiposMaterial: null,
            tituloWindow: null,
            idPolitica: null,
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function (accion, row) {
                var self = this;

                self.accion = accion;

                if (self.accion == "1")
                    self.row = row;

                self.dsAlmacen = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerAlmacenesUbicacion",
                            dataType: "json"
                        }

                    },
                    schema: {
                        model: {
                            id: "IdAlmacen",
                            fields: {
                                'IdAlmacen': { type: "int" },
                                'Descripcion': { type: "string" },
                                'IdTipoAlmacen': { type: "int" },
                                'DescripcionTipoAlmacen': { type: "string" }
                            }
                        }
                    },
                });


                self.dsTiposUbicacion = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerTiposUbicacion",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "idTipoUbicacion",
                            fields: {
                                'idTipoUbicacion': { type: "int" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsEstadosUbicacion = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerEstadosUbicacion",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdEstadoUbicacion",
                            fields: {
                                'IdEstadoUbicacion': { type: "int" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsPoliticaAlmacenamiento = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerPoliticasAlmacenamiento",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdPoliticaAlmacenamiento",
                            fields: {
                                'IdPoliticaAlmacenamiento': { type: "int" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsPoliticaLlenado = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerPoliticasLlenado",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "idPoliticaLlenado",
                            fields: {
                                'idPoliticaLlenado': { type: "int" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsPoliticaVaciado = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerPoliticasVaciado",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdPoliticaVaciado",
                            fields: {
                                'IdPoliticaVaciado': { type: "int" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsMateriales = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerMaterialesUbicacion",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdMaterial",
                            fields: {
                                'IdMaterial': { type: "string" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsClasesMaterial = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerClasesMaterialUbicacion",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdClaseMaterial",
                            fields: {
                                'IdClaseMaterial': { type: "string" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });

                self.dsTiposMaterial = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerTiposMaterial",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdTipoMaterial",
                            fields: {
                                'IdTipoMaterial': { type: "string" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });



                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));


                if (self.accion == "0")
                    self.tituloWindow = "Añadir Ubicación";
                else
                    self.tituloWindow = "Editar Ubicación";

                self.window = $(self.el).kendoWindow(
                {
                    title: self.tituloWindow,
                    width: "800px",
                    height: "700px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divEditarArranqueCambio').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#btnNewAceptar").kendoButton();

                $("#btnNewCancelar").kendoButton();

                $("#cmbNewAlmacen").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    dataSource: self.dsAlmacen,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbNewAlmacen").data("kendoDropDownList").value($("#cmbAlmacen").data("kendoDropDownList").value());
                $("#cmbNewAlmacen").data("kendoDropDownList").enable(false);

                $("#cmbNewZona").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.cambiaAlmacen();

                $("#cmbNewZona").data("kendoDropDownList").value($("#cmbZona").data("kendoDropDownList").value());
                $("#cmbNewZona").data("kendoDropDownList").enable(false);



                $("#cmbTipoUbicacion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "idTipoUbicacion",
                    dataSource: self.dsTiposUbicacion,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbEstadoUbicacion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdEstadoUbicacion",
                    dataSource: self.dsEstadosUbicacion,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbPoliticaAlmacenamiento").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdPoliticaAlmacenamiento",
                    dataSource: self.dsPoliticaAlmacenamiento,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbPoliticaLlenado").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "idPoliticaLlenado",
                    dataSource: self.dsPoliticaLlenado,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbPoliticaVaciado").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdPoliticaVaciado",
                    dataSource: self.dsPoliticaVaciado,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbRefMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    dataSource: self.dsMateriales,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbClaseMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    dataSource: self.dsClasesMaterial,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbTipoMaterial").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    dataSource: self.dsTiposMaterial,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });


                $("#cmbRefMaterial").closest(".k-widget").hide();
                $("#cmbClaseMaterial").closest(".k-widget").hide();
                $("#cmbTipoMaterial").closest(".k-widget").hide();

                if (self.accion == "1") {
                    $("#txtNewNombreUbicacion").val(self.row.Nombre);
                    $("#cmbEstadoUbicacion").data("kendoDropDownList").value(self.row.IdEstado);
                    $("#cmbTipoUbicacion").data("kendoDropDownList").value(self.row.IdTipoMaterial);

                    $("#cmbPoliticaAlmacenamiento").data("kendoDropDownList").value(self.row.IdPoliticaAlmacenamiento);
                    $("#cmbPoliticaLlenado").data("kendoDropDownList").value(self.row.IdPoliticaLlenado);
                    $("#cmbPoliticaVaciado").data("kendoDropDownList").value(self.row.IdPoliticaVaciado);
                    $("#txtNewCOORelativas").val(self.row.CooRelativas);
                    $("#txtNewCOOAbsolutas").val(self.row.CooAlbsolutas);
                    $("#txtNewCapacidadMaxima").val(self.row.CapacidadMax);
                    $("#txtNewStockActual").val(self.row.StockActual);
                    $("#txtNewStockMinimo").val(self.row.StockMinimo);
                    $("#txtNewStockCampo").val(self.row.StockCampo);
                    $("#txtNewUmbralStockCero").val(self.row.UmbralStockCero);
                    $("#txtNewUmbralLoteCero").val(self.row.UmbralLoteCero);

                    $("#cmbRefMaterial").data("kendoDropDownList").value(self.row.RefMaterial);
                    $("#cmbClaseMaterial").data("kendoDropDownList").value(self.row.IdClaseMaterial);
                    $("#cmbTipoMaterial").data("kendoDropDownList").value(self.row.IdTipoMaterial);

                    self.idPolitica = self.row.DescripcionPoliticaAlmacenamiento;
                    self.cambiaPoliticaAlmacenamiento();
                }

                $("#form1").kendoValidator({
                    messages: {
                        required: "campo obligatorio",
                    }
                }).data("kendoValidator");

            },
            events: {
                'change #cmbNewAlmacen': 'cambiaAlmacen',
                'change #cmbPoliticaAlmacenamiento': 'cambiaPoliticaAlmacenamiento',
                'click #btnNewAceptar': 'aceptar',
                'click #btnNewCancelar': 'cancelar'
            },
            cambiaAlmacen: function () {
                var self = this;

                var IdAlmacen = $("#cmbNewAlmacen").data("kendoDropDownList").value();

                if (IdAlmacen > 0) {

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerZonasDesdeAlmacen/" + parseInt(IdAlmacen),
                        dataType: 'json',
                        async: false
                    }).done(function (data) {
                        self.dszonasLista = data;
                        self.zonas = new kendo.data.DataSource({ data: self.dszonasLista });
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });

                    $("#cmbNewZona").data("kendoDropDownList").setDataSource(self.zonas);
                    $("#cmbNewZona").data("kendoDropDownList").refresh();
                    $("#cmbNewZona").data("kendoDropDownList").select(0);
                    $("#cmbNewZona").data("kendoDropDownList").refresh();

                }

            },
            cambiaPoliticaAlmacenamiento: function () {
                var self = this;

                var idPolitica = $("#cmbPoliticaAlmacenamiento").data("kendoDropDownList").text();

                if (idPolitica.trim() == "" || idPolitica == null || idPolitica == undefined)
                    idPolitica = self.idPolitica;

                if (idPolitica.indexOf("Referencia") >= 0) {
                    $("#lblNewMaterial").show();
                    $("#lblNewClaseMaterial").hide();
                    $("#lblNewTipoMaterial").hide();

                    $("#cmbRefMaterial").closest(".k-widget").show();
                    $("#cmbClaseMaterial").closest(".k-widget").hide();
                    $("#cmbTipoMaterial").closest(".k-widget").hide();
                }
                else
                    if (idPolitica.indexOf("Clase") >= 0) {
                        $("#lblNewMaterial").hide();
                        $("#lblNewClaseMaterial").show();
                        $("#lblNewTipoMaterial").hide();

                        $("#cmbRefMaterial").closest(".k-widget").hide();
                        $("#cmbClaseMaterial").closest(".k-widget").show();
                        $("#cmbTipoMaterial").closest(".k-widget").hide();
                    }
                    else
                        if (idPolitica.indexOf("Tipo") >= 0) {
                            $("#lblNewMaterial").hide();
                            $("#lblNewClaseMaterial").hide();
                            $("#lblNewTipoMaterial").show();

                            $("#cmbRefMaterial").closest(".k-widget").hide();
                            $("#cmbClaseMaterial").closest(".k-widget").hide();
                            $("#cmbTipoMaterial").closest(".k-widget").show();
                        }
                        else {
                            $("#lblNewMaterial").hide();
                            $("#lblNewClaseMaterial").hide();
                            $("#lblNewTipoMaterial").hide();

                            $("#cmbRefMaterial").closest(".k-widget").hide();
                            $("#cmbClaseMaterial").closest(".k-widget").hide();
                            $("#cmbTipoMaterial").closest(".k-widget").hide();
                        }

            },
            cancelar: function () {
                this.window.close();
            },
            aceptar: function (e) {
                var self = this;

                if ($("#form1").data("kendoValidator").validate()) {

                    var ubicacion = {};

                    if (self.accion == "1") {
                        ubicacion.Id = self.row.IdUbicacion;
                        url = "../api/editarUbicacion";
                        ubicacion.Version = self.row.Version;
                    }
                    else {
                        var url = "../api/crearUbicacion";
                        ubicacion.Version = 1;
                    }


                    ubicacion.Nombre = $("#txtNewNombreUbicacion").val();
                    ubicacion.Estado = $("#cmbEstadoUbicacion").data("kendoDropDownList").value();
                    ubicacion.Tipo = $("#cmbTipoUbicacion").data("kendoDropDownList").value();
                    ubicacion.Almacen = $("#cmbNewAlmacen").data("kendoDropDownList").value();
                    ubicacion.Zona = $("#cmbNewZona").data("kendoDropDownList").value();
                    ubicacion.PolAlm = $("#cmbPoliticaAlmacenamiento").data("kendoDropDownList").value();
                    ubicacion.PolLle = $("#cmbPoliticaLlenado").data("kendoDropDownList").value();
                    ubicacion.PolVac = $("#cmbPoliticaVaciado").data("kendoDropDownList").value();
                    ubicacion.COORel = $("#txtNewCOORelativas").val();
                    ubicacion.COOAbs = $("#txtNewCOOAbsolutas").val();
                    ubicacion.Capacidad = $("#txtNewCapacidadMaxima").val();
                    ubicacion.StockAct = $("#txtNewStockActual").val();
                    ubicacion.StockMin = $("#txtNewStockMinimo").val();
                    ubicacion.StockCamp = $("#txtNewStockCampo").val();
                    ubicacion.StockCero = $("#txtNewUmbralStockCero").val();
                    ubicacion.LoteCero = $("#txtNewUmbralLoteCero").val();
                    ubicacion.Material = $("#cmbRefMaterial").data("kendoDropDownList").value();
                    ubicacion.Clase = $("#cmbClaseMaterial").data("kendoDropDownList").value();
                    ubicacion.TipoMaterial = $("#cmbTipoMaterial").data("kendoDropDownList").value();

                    $.ajax({
                        type: "POST",
                        url: url,
                        data: JSON.stringify(ubicacion),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: false,
                    }).success(function (data) {

                        Backbone.trigger('eventCierraDialogo');
                        self.window.close();
                        self.eliminar();

                        $("#gridUbicaciones").data("kendoGrid").dataSource.read();
                        $("#gridUbicaciones").data("kendoGrid").refresh();

                        if (self.accion == "1")
                            Not.crearNotificacion('success', 'Info', window.app.idioma.t('EDITADA_LA_UBICACIÓN'), 2000);
                        else
                            Not.crearNotificacion('success', 'Info', window.app.idioma.t('CREADA_LA_UBICACIÓN'), 2000);



                    }).error(function (err, msg, ex) {
                        var a = "";
                    });

                }
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarUbicacion;
    });