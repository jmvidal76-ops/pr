define(['underscore', 'jquery', 'compartido/notificaciones', '../../../../Portal/js/constantes', 'text!../../../Almacen/html/vpMantenimientoRecepcion.html'],
    function (_, $, Not, enums, vpMantenimientoRecepcion) {
        var mantenimiento = {
            vpMantenimiento: _.template(vpMantenimientoRecepcion),
            constFormulario: enums.MantenimientoFormulario(),
            //1. Metodo que añade nuevos valores del formulario seleccionado
            AddNewObjectMaintain: function (tipo, id, queryParams) {
                var uri = "../api/Add";
                var $inputs = $('#formMaintain div:visible .k-textbox');
                var cmbRefresh = id;
                var _valueTextBox = "";
                //Obtenemos los valores del formulario
                var values = {};
                $inputs.each(function () {
                    //Se suplanta el nombre de la clase txtXXXX por XXXX
                    if (this.id.replace('vpTxt', '') == "Nombre" || this.id.replace('vpTxt', '') == "MatriculaTractora" || this.id.replace('vpTxt', '') == "MatriculaRemolque") {
                        _valueTextBox = this.value;
                    }
                    if (this.id.replace('vpTxt', '') == "Nombre" && tipo.key == "ORIGEN_MERCANCIA") {
                        values["Descripcion"] = this.value;
                    } else {
                        values[this.id.replace('vpTxt', '')] = this.value;
                    }
                });

                if (!this.ValidarFormulario(tipo)) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 4000);
                    return;
                }

                // Comprobamos si el nif es valido
                let nif = $("#vpTxtNIF").val();
                if (nif && !this.ValidarNIF(nif)) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NIF_INVALIDO'), 4000);
                    $("#vpTxtNIF").addClass("k-invalid");
                    return;
                }                

                uri += tipo.uri;

                if (queryParams) {
                    uri += "?"
                    for (let [clave, valor] of Object.entries(queryParams)) {
                        uri += `${clave}=${valor}&`;
                    }

                    uri = uri.slice(0, -1);
                }

                kendo.ui.progress($("#wnd_" + id), true);
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(values),
                    url: uri,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    complete: function () {
                        kendo.ui.progress($("#wnd_" + id), false);
                    },
                    success: function (res) {
                        if (res != null) {
                            let cmb = $("#" + cmbRefresh).getKendoComboBox();
                            cmb.newId = res.IdCombo
                            cmb.text(_valueTextBox);
                            cmb.dataSource.read();

                            $("#wnd_" + id).getKendoWindow().close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_CORRECTAMENTE'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DATOS_FORMULARIO_EXISTENTE'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
                
            },

            //2. Metodo que valida si el formulario está correctamente cumplimentado
            ValidarFormulario: function (tipoFormulario) {
                let valido = true;

                $('#formMaintain input:visible[required=required]').each(function (idx, e) {
                    const input = $(this);
                    if (input.val() == null || input.val() == "") {
                        valido = false;
                        input.addClass("k-invalid");
                    }
                    else
                    {
                        input.removeClass("k-invalid");
                    }
                });                

                return valido;
            },
            ValidarNIF: function (nif) {
                // Sólo validamos que los carácteres sean alfanuméricos
                const patron = /^[a-zA-Z0-9]+$/;

                // Verificar si la cadena cumple con el patrón
                return patron.test(nif);

                // NO USADO
                // Version para comprobar DNI valido, no funciona para NIE o NIF, finalmente no se usa
                var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
                var valueNif = nif.substr(0, nif.length - 1);
                var letra = nif.substr(nif.length - 1, 1).toUpperCase();

                if (lockup.charAt(valueNif % 23) == letra) {
                    return true;
                } else {
                    return false;
                }
            },

            //3. Metodo que oculta los elementos del formulario de mantenimiento (Se utiliza para las ventanas de creacion)
            HideElementsFormMaintain: function (tipoForm, initialValue) {
                let self = this;

                switch (tipoForm.key) {
                    case self.constFormulario.TRANSPORTISTA.key:
                        $(".divNIF .req").html("(*)");
                        $(".divNIF input").attr("required", true);
                    case self.constFormulario.OPERADOR.key:                    
                    case self.constFormulario.DESTINATARIO.key:
                        $(".divNombre, .divNIF, .divDireccion, .divPoblacion, .divTelefono, .divObservaciones").show();
                        $(".divTractora, .divRemolque, .divCodigoPostal, .divPesoMaximo").hide();
                        if (tipoForm.key == self.constFormulario.OPERADOR.key) {
                            $(".divCodigoPostal").show();
                        }
                        break;
                    case self.constFormulario.PROVEEDOR.key:
                        $(".divNombre, .divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono, .divObservaciones").show();
                        $(".divTractora, .divRemolque, .divPesoMaximo").hide();
                        //$(".divNIF .req").html("(*)");
                        //$(".divNIF input").attr("required", true);
                        break;
                    case self.constFormulario.CLIENTE.key:
                        $(".divNombre, .divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono, .divObservaciones").show();
                        $(".divTractora, .divRemolque, .divPesoMaximo").hide();
                        //$(".divNIF .req").html("(*)");
                        //$(".divNIF input").attr("required", true);
                        break;
                    case self.constFormulario.PRODUCTO.key:
                        $(".divNombre, .divObservaciones").show();
                        $(".divTractora, .divRemolque, .divPesoMaximo, .divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono").hide();
                        break;
                    case self.constFormulario.MATRICULA_TRACTORA.key:
                        $(".divTractora, .divPesoMaximo").show();
                        $(".divNombre, .divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono, .divObservaciones, .divRemolque").hide();                        
                        break;
                    case self.constFormulario.MATRICULA_REMOLQUE.key:
                        $(".divRemolque").show();
                        $(".divNombre, .divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono, .divObservaciones, .divTractora, .divPesoMaximo").hide();
                        break;
                    case self.constFormulario.ORIGEN_MERCANCIA.key:
                        $(".divNombre").show();
                        $(".divNIF, .divDireccion, .divPoblacion, .divCodigoPostal, .divTelefono, .divObservaciones,.divTractora, .divRemolque, .divPesoMaximo").hide();
                        break;
                }

                // Valor inicial, depende del tipo de formulario será un campo u otro
                switch (tipoForm.key) {
                    case self.constFormulario.MATRICULA_TRACTORA.key:
                        $("#vpTxtMatriculaTractora").val(initialValue)
                        break;
                    case self.constFormulario.MATRICULA_REMOLQUE.key:
                        $("#vpTxtMatriculaRemolque").val(initialValue)
                        break;
                    default:
                        $("#vpTxtNombre").val(initialValue)
                }
            },

            //4. Metodo que carga los datos de la ventana de creación con el titulo y su id
            ShowWindowNewForm: function (attrTransportes, id, initialValue, tipoForm, queryParams) {
                
                if (!TienePermiso(134)) {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                } else {
                    var _functionsForm = this;
                    this.Window(id, tipoForm, attrTransportes);
                    attrTransportes.wnd = $('#wnd_' + id).data("kendoWindow");
                    attrTransportes.wnd.open();
                    attrTransportes.wnd.center();
                    attrTransportes.wnd.one("activate", function () {
                    });

                    $(".btnAddMantain").kendoButton({
                        click: function () { _functionsForm.AddNewObjectMaintain(tipoForm, id, queryParams) }
                    });

                    this.HideElementsFormMaintain(tipoForm, initialValue);
                }
            },

            //5. Metodo generico que crea una nueva ventana con un id y un titulo (Se utiliza para las ventanas de creacion)
            Window: function (id, tipoForm, attrTransportes) {
                let self = this;
                $("#divWnd").prepend($('<div id="wnd_' + id + '">' + self.vpMantenimiento() + '</div>'));
                $("#wnd_" + id).kendoWindow({
                    width: '40%',
                    visible: false,
                    modal: true,
                    title: window.app.idioma.t(tipoForm.key),
                    close: function () {
                        attrTransportes.wnd.destroy();
                        attrTransportes.wnd = null;
                    }
                });

            },
        }

    return mantenimiento;
         
});

