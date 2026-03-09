define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearCurva.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCurva',
            window: null,
            auxDs: null,
            area: null,
            GetDatas: null,
            GetDatasJson: null,
            SetDatas: null,
            material: null,
            phase: null,
            numKops: 10,
            master: null,
            processes: [],
            template: _.template(plantillaCrearLote),
            initialize: function (data) {
                var self = this;
                self.data = data;
                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                
                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_KOP_MULTIVALOR'),
                        width: 970,
                        top: "339",
                        left: "410",
                        height: "215",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        refresh: function () {
                            self.CargaContenidoMultivalor(self.data, self.dataFila);
                        }
                    }).data("kendoWindow");

                self.dialog = self.window;
                self.dialog.center();

                self.CargaContenidoMultivalor(self.data);
            },
            events: {
            },
            ObtenerNumeroMaximo: function (data) {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/KOPsFab/ObtenerMaximoNumeroPosicionSegunMosto/" + data.PK + "/" + data.COD_PROCCESS + "/" + data.IdMosto + "/" + data.IdZona + "/" + data.IdTipo,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.nMaximo = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });
            },
            CargaContenidoMultivalor: function (data) {
                var self = this;

                $("#lblCod").text(window.app.idioma.t('CODIGO_KOP') + ": ");
                $("#lblPosicion").text(window.app.idioma.t('POSICION') + ": ");
                $("#lblDescripcion").text(window.app.idioma.t('DESCRIPCION') + ": ");
                $("#lblUnidad").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));

                $("#btnAceptarKOP").kendoButton({
                    click: function (e) { self.Aceptar(e); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function (e) { self.Cancelar(e); }
                });
                self.ObtenerNumeroMaximo(self.data);
                $("#txtPosicion").text(self.nMaximo);

                var _Concatenado = data.COD_KOP + " - " + data.NAME
                $("#txtCod").text(_Concatenado);
                var maximo = 90;

                if (_Concatenado.length > maximo) {
                    $("#txtNombre").addClass("lblOverflow");
                    $("#txtNombre").kendoTooltip({
                        filter: $("#txtNombre"),
                        content: function (e) {
                            var content = data.DescKop;
                            return content;
                        }
                    }).data("kendoTooltip");
                }

                $("#txtDescripcion").prop('placeholder', window.app.idioma.t('INTRODUZCA_UN_VALOR'))

                $('#txtUnidad').text(data.MEDIDA);

                switch (data.DATATYPE.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Valor
                        });
                        $("#txtMinimo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Minimo
                        });

                        $("#txtMaximo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Maximo
                        });
                        self.isText = false;
                        $("#txtValor").prop('disabled', false);
                        break;
                    case "float":
                        switch (data.DATATYPE.toLowerCase()) {
                            case "hh:mm:ss":
                                $(".UOMOtros").hide();
                                $(".UOMhms").show();

                                var arrHorario = [];

                                if (data.Minimo != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Minimo * 3600).split(":");
                                }
                                var dias = "";
                                var horas = "";
                                var minutos = "";
                                var segundos = "";
                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }


                                $("#txtDiaMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    width: 12,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });

                                arrHorario = [];
                                if (data.Valor != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Valor * 3600).split(":");
                                }
                                dias = "";
                                horas = "";
                                minutos = "";
                                segundos = "";

                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }


                                $("#txtDiaValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });

                                arrHorario = [];
                                if (data.Maximo != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Maximo * 3600).split(":");
                                }
                                dias = "";
                                horas = "";
                                minutos = "";
                                segundos = "";

                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }

                                $("#txtDiaMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });
                                $(".Inputhms").css('width', '4em')
                                break;
                            default:
                                $("#txtValor").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 2,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n2',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Valor), localStorage.getItem("idiomaSeleccionado"))
                                });
                                $("#txtMinimo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 2,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n2',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Minimo), localStorage.getItem("idiomaSeleccionado"))
                                });
                                $("#txtMaximo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 2,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n2',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Maximo), localStorage.getItem("idiomaSeleccionado"))
                                });
                                self.isText = false;
                                $("#txtValor").prop('disabled', false);
                                break;
                        }
                        break;
                    case "string":
                        $("#txtMinimo").prop('disabled', true);
                        $("#txtMinimo").val(data.Minimo)
                        $("#txtMaximo").prop('disabled', true);
                        $("#txtMaximo").val(data.Maximo)
                        $("#txtValor").attr('maxlength', '100');
                        $("#txtValor").val(data.Valor);
                        $("#txtValor").addClass("k-textbox");
                        $("#txtValor").prop('placeholder', window.app.idioma.t('INTRODUZCA_UN_VALOR'))
                        self.isText = true;
                        $("#txtValor").prop('disabled', false);
                        break;
                }//fin switch
            },
            Cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            Aceptar: function (e) {
                e.preventDefault();

                var self = this;
                var max, min, val;
                var tipoKOP = self.data.DATATYPE.toLowerCase();

                if ($("#txtMaximo").val() == "") {
                    max = $("#txtMaximo").text();
                }
                else {
                    max = $("#txtMaximo").val();
                }


                if ($("#txtMinimo").val() == "") {
                    min = $("#txtMinimo").text();
                } else {
                    min = $("#txtMinimo").val();
                }

                if ($("#txtValor").val() == "") {
                    val = $("#txtValor").text();
                } else {
                    val = $("#txtValor").val();
                }



                min = min.replace(",", ".");
                max = max.replace(",", ".");
                val = val.replace(",", ".");

                if (tipoKOP == "float") {
                    if (min !== "") {
                        min = parseFloat(min).toFixed(2);
                    }
                    if (max !== "") {
                        max = parseFloat(max).toFixed(2);
                    }
                    if (val !== "") {
                        val = parseFloat(val).toFixed(2);
                    }
                } else if (tipoKOP == "int" || tipoKOP == "float") {
                    if (min !== "") {
                        min = parseFloat(min);
                    }
                    if (max !== "") {
                        max = parseFloat(max);
                    }
                    if (val !== "") {
                        val = parseFloat(val);
                    }
                }

                $("#txtMaximo").val(max);
                $("#txtMinimo").val(min);
                $("#txtValor").val(val);

                var descripcion = $("#txtDescripcion").val().trim();
                //si es un fecha o un string no hay que comprobar los valores de máximo y mínimo

                if (!isNaN($("#txtValor").val())) {
                    if (min != "" && max != "") {
                        if (parseFloat(min) >= parseFloat(max)) {
                            $("#message").text(window.app.idioma.t('VALOR_MINIMO_MAYOR'));
                            $("#errorMsg").show();
                        }
                        else {
                            if (descripcion == "") {
                                $("#message").text(window.app.idioma.t('ERROR_DESCRIPCION'));
                                $("#errorMsg").show();
                            } else {
                                $("#errorMsg").hide();

                                this.confirmacion = new VistaDlgConfirm({
                                    titulo: window.app.idioma.t('EDITARKOP')
                                    , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.CrearCurva(); }, contexto: this
                                });
                            }

                        }
                    } else if (min !== "" && max == "" || max !== "" && min == "") {
                        $("#message").text(window.app.idioma.t('VALOR_NO_DEFINIDO'));
                        $("#errorMsg").show();
                    } else {
                        if (descripcion == "") {
                            $("#message").text(window.app.idioma.t('ERROR_DESCRIPCION'));
                            $("#errorMsg").show();
                        } else {
                            $("#errorMsg").hide();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('EDITARKOP')
                                , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.CrearCurva(); }, contexto: this
                            });
                        }
                    }
                } else {
                    if (min != "" && max != "") {
                        if (parseFloat(min) >= parseFloat(max)) {
                            $("#message").text(window.app.idioma.t('VALOR_MINIMO_MAYOR'));
                            $("#errorMsg").show();
                            return false;
                        }
                    } else if (min !== "" && max == "" || max !== "" && min == "") {
                        $("#message").text(window.app.idioma.t('VALOR_NO_DEFINIDO'));
                        $("#errorMsg").show();
                    }
                    else {
                        if (descripcion == "") {
                            $("#message").text(window.app.idioma.t('ERROR_DESCRIPCION'));
                            $("#errorMsg").show();
                        } else {
                            $("#errorMsg").hide();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('EDITARKOP')
                                , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.CrearCurva(); }, contexto: this
                            });
                        }
                    }


                }
            },
            CrearCurva: function () {
                var self = this;
                var pl = {};

                var _max = $("#txtMaximo").val();
                var _min = $("#txtMinimo").val();
                var _valor = $("#txtValor").val();
                var _descripcion = $("#txtDescripcion").val();
                var _posicion = parseInt($("#txtPosicion").text());


                pl.IdValor = self.data.ID_MAESTRO;
                pl.Tipo = self.data.DATATYPE;
                pl.Minimo = _min;
                pl.Maximo = _max;
                pl.Valor = _valor;
                pl.DescKop = _descripcion;
                pl.Posicion = _posicion;
                pl.IdMosto = self.data.IdMosto;

                var grid = self.data.Fila;

                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/CrearPosicionKopMultivalor",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        grid.data("kendoGrid").dataSource.read();
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion(res[0] ? 'success' : 'error', window.app.idioma.t('AVISO'), res[1], 2000);
                        self.window.close();
                        self.eliminar();
                        kendo.ui.progress($("#divMaterialesDefecto"), false);
                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                    }
                });
                self.confirmacion.finProceso();
            },
            eliminar: function () {
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },


        });

        return vistaCrearLote;
    });