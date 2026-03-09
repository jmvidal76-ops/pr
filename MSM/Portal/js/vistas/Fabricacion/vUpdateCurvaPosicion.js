define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/UpdateCurvaPosicion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearLote, Not, VistaDlgConfirm) {
        var vistaCrearLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarCurvaPosicion',
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
            initialize: function (data, dataFila, filaSeleccionada) {
                var self = this;
                self.data = data;
                self.dataFila = dataFila;
                self.filaSeleccionada = filaSeleccionada
                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('ACTUALIZAR_KOP_MULTIVALOR'),
                        width: 970,
                        top: "339",
                        left: "410",
                        height: "180",
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

                self.CargaContenidoMultivalor(self.data, self.dataFila);
            },
            events: {
            },
            CargaContenidoMultivalor: function (data, dataFila) {
                var self = this;

                $("#lblCod").text(window.app.idioma.t('CODIGO_KOP') + ": ");
                $("#lblPosicion").text(window.app.idioma.t('POSICION') + ": ");
                $("#lblDescripcion").text(window.app.idioma.t('DESCRIPCION') + ": ");
                $("#lblUnidad").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#lblActivo").text(window.app.idioma.t('ACTIVO') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));

                $("#btnAceptarKOP").kendoButton({
                    click: function (e) { self.Aceptar(e); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function (e) { self.Cancelar(e); }
                });
                $("#txtPosicion").text(dataFila.INDEX);

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
                $("#txtDescripcion").val(dataFila.NAME)
                $('#txtUnidad').text(data.MEDIDA);
                if (dataFila.ACTIVO) {
                    $("#chxActivo").prop('checked', true);
                }
                $("#txtValor").val('');
                $("#txtMinimo").val('');
                $("#txtMaximo").val('');
                switch (data.DATATYPE.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: dataFila.VALOR == ""
                        });
                        $("#txtMinimo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: dataFila.VALOR_MINIMO
                        });

                        $("#txtMaximo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: dataFila.VALOR_MAXIMO
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

                                if (dataFila.VALOR_MINIMO != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(dataFila.VALOR_MINIMO * 3600).split(":");
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
                                if (dataFila.VALOR != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(dataFila.VALOR * 3600).split(":");
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
                                if (dataFila.VALOR_MAXIMO != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(dataFila.VALOR_MAXIMO * 3600).split(":");
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
                                    value: dataFila.VALOR == "" ? "" : parseFloat(FormatearNumericosPorRegion(dataFila.VALOR), localStorage.getItem("idiomaSeleccionado"))
                                });

                                $("#txtMinimo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 2,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n2',
                                    value: dataFila.VALOR_MINIMO == "" ? "" : parseFloat(FormatearNumericosPorRegion(dataFila.VALOR_MINIMO), localStorage.getItem("idiomaSeleccionado"))

                                });
                                $("#txtMaximo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 2,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n2',
                                    value: dataFila.VALOR_MAXIMO == "" ? "" : parseFloat(FormatearNumericosPorRegion(dataFila.VALOR_MAXIMO), localStorage.getItem("idiomaSeleccionado"))
                                });
                                self.isText = false;
                                $("#txtValor").prop('disabled', false);
                                break;
                        }
                        break;
                    case "string":
                        $("#txtMinimo").prop('disabled', true);
                        $("#txtMinimo").val(dataFila.VALOR_MINIMO)
                        $("#txtMaximo").prop('disabled', true);
                        $("#txtMaximo").val(dataFila.VALOR_MAXIMO)
                        $("#txtValor").attr('maxlength', '100');
                        $("#txtValor").val(dataFila.VALOR);
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

                var self = this;
                var max, min, val;
                var tipoKOP = self.dataFila.DATATYPE;
                

                    if ($("#txtMaximo").val() == "") {
                        max = $("#txtMaximo").text();
                    }
                    else {
                    max = $("#txtMaximo").val().replace(",", ".");
                    }


                    if ($("#txtMinimo").val() == "") {
                        min = $("#txtMinimo").text();
                    } else {
                    min = $("#txtMinimo").val().replace(",", ".");
                    }

                    if ($("#txtValor").val() == "") {
                        val = $("#txtValor").text();
                    } else {
                    val = $("#txtValor").val().replace(",", ".");
                    }

                    

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
                                    , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.Actualizar(); }, contexto: this
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
                                , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.Actualizar(); }, contexto: this
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
                                , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.Actualizar(); }, contexto: this
                            });
                        }
                    }


                }

                var descripcion = $("#txtDescripcion").val().trim()
                //si es un fecha o un string no hay que comprobar los valores de máximo y mínimo

             
            },
            Actualizar: function () {
                var self = this;
                var pl = {};

                var _max, _min, _val;

                if ($("#txtMaximo").val() == "") {
                    _max = $("#txtMaximo").text();
                }
                else {
                    _max = $("#txtMaximo").val();
                }


                if ($("#txtMinimo").val() == "") {
                    _min = $("#txtMinimo").text();
                } else {
                    _min = $("#txtMinimo").val();
                }

                if ($("#txtValor").val() == "") {
                    _val = $("#txtValor").text();
                } else {
                    _val = $("#txtValor").val();
                }



                _min = _min.replace(",", ".");
                _max = _max.replace(",", ".");
                _val = _val.replace(",", ".");

                if (_min !== "") {
                    _min = parseFloat(_min).toFixed(2);
                }
                if (_max !== "") {
                    _max = parseFloat(_max).toFixed(2);
                }
                if (_val !== "") {
                    _val = parseFloat(_val).toFixed(2);
                }





                var _descripcion = $("#txtDescripcion").val();
                var _posicion = parseInt($("#txtPosicion").text());
                var _activo = $("#chxActivo").prop('checked');

                pl.IdValor = self.data.PK;
                pl.Tipo = self.data.DATATYPE;
                pl.Minimo = _min;
                pl.Maximo = _max;
                pl.Valor = _val;
                pl.DescKop = _descripcion;
                pl.Posicion = _posicion;
                pl.IdMosto = self.data.IdMosto;
                pl.Activo = _activo;
                pl.CodKOP = parseInt(self.dataFila.COD_KOP);

                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/ActualizarPosicionKOPMultivalor",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#divMaterialesDefecto"), false);
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion(res[0] ? 'success' : 'error', window.app.idioma.t('AVISO'), res[1], 2000);
                        self.window.close();
                        self.eliminar();
                        self.filaSeleccionada.data('kendoGrid').dataSource.read();
                        
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