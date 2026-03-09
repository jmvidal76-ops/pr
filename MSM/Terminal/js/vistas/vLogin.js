define(['underscore', 'backbone', 'jquery', 'keyboard', 'text!../../html/login.html', 'compartido/notificaciones', 'modelos/mSesion', 'compartido/realTime',
    'section'],
    function (_, Backbone, $, Keyboard, plantillaLogin,Not,Sesion,RT, Section) {
    var VistaLogin = Backbone.View.extend({
        template: _.template(plantillaLogin),
        tagName: 'div',
        id: 'dlgLogin',
        listaPdvs: [],
        listaPdvsSEO: [],
        initialize: function (data) {
            this.esLogin = data.esLogin;
            $("body").append($(this.el));
            this.render();
        },
        render: function () {
            var self = this;
            $(this.el).html(this.template());

            $("#btnCerrarMenuSec").text(window.app.idioma.t('CERRAR'));
            self.$("#btnAceptar").kendoButton();
            self.$("#btnCancelar").kendoButton();
            self.$("#imgProcesando").hide();

            self.$("#cmbLinea").kendoDropDownList({
                dataValueField: "id",
                template: window.app.idioma.t('LINEA')+" #= numLineaDescripcion # - #=descripcion #",
                valueTemplate: window.app.idioma.t('LINEA')+" #= numLineaDescripcion # - #=descripcion #",
                dataSource: new kendo.data.DataSource({
                    data: window.app.planta.lineas,
                    sort: { field: "nombre", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE'),
                change: function () {
                    self.cambiaLinea();
                }
            });

            self.$("#cmbZona").kendoDropDownList({
                dataTextField: "descripcion",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    sort: { field: "numZona", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            self.cargarCombosALT();
            self.cargarCombosSEO();

            if (this.esLogin) {
                this.$("#credenciales").show();
                this.$("#btnCancelar").hide();
            } else {
                this.$("#credenciales").hide();
                this.$("#btnCancelar").show();
                $("#cmbLinea").data("kendoDropDownList").value(this.model.get('linea').id);
                $("#cmbLinea").data("kendoDropDownList").trigger("change");
            }

            if (this.model.get('validada')) {
                $("#txtUsuario").val(this.model.get('usuario'));
                $("#txtPassword").val('pass');
                $("#txtUsuario").prop('disabled', true);
                $("#txtPassword").prop('disabled', true);
                $("#txtUsuario").addClass('ui-state-default');
                $("#txtPassword").addClass('ui-state-default');
            }

            $(this.el).kendoWindow({
                title: this.esLogin ? window.app.idioma.t('LOGIN') : window.app.idioma.t('CAMBIAR_PUESTO'), 
                width: "920px",
                height: this.esLogin ? "480px" : 'auto',
                resizable: false,
                draggable: false,
                actions: []
            });

            this.dialog = $(this.el).data("kendoWindow");
            this.dialog.center();
        },
        cargarCombosALT: function () {
            var self = this;
            var idLocation = 0;

            // Obtenemos pdvs para el nivel 1
            self.listaPdvs = window.app.calidad.pdvs;
            var location = self.listaPdvs.filter(function (item) {
                return item.idParent == null;
            });

            if (location.length != 0) {
                idLocation = location[0].ID;
            }

            var locationsN1 = self.listaPdvs.filter(function (item) {
                return item.idParent == idLocation;
            });

            self.$("#cmbPdvNivel1").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                dataSource: new kendo.data.DataSource({
                    data: locationsN1,
                    sort: { field: "name", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE'),
                change: function () {
                    // Obtenemos pdvs para el nivel 2
                    var idN1 = this.value();

                    var locationsN2 = self.listaPdvs.filter(function (item) {
                        return item.idParent == idN1;
                    });

                    var ds = new kendo.data.DataSource({
                        data: locationsN2,
                        sort: { field: "name", dir: "asc" }
                    });

                    var comboN2 = $("#cmbPdvNivel2").data('kendoDropDownList');
                    comboN2.setDataSource(ds);
                }
            });

            self.$("#cmbPdvNivel2").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                optionLabel: window.app.idioma.t('SELECCIONE'),
                change: function () {
                    // Obtenemos pdvs para el nivel 3
                    var idN2 = this.value();

                    var locationsN3 = self.listaPdvs.filter(function (item) {
                        return item.idParent == idN2;
                    });

                    var locationsN3N4 = [];
                    locationsN3.forEach(function (locationN3) {
                        locationsN3N4.push(locationN3);

                        var locationsN4 = self.listaPdvs.filter(function (item) {
                            return item.idParent == locationN3.ID;
                        });

                        locationsN4.forEach(function (locationN4) {
                            locationsN3N4.push(locationN4);
                        });
                    });

                    var ds = new kendo.data.DataSource({
                        data: locationsN3N4,
                        sort: { field: "name", dir: "asc" }
                    });

                    var comboN3 = $("#cmbPdvNivel3").data('kendoDropDownList');
                    comboN3.setDataSource(ds);
                }
            });

            self.$("#cmbPdvNivel3").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                optionLabel: window.app.idioma.t('SELECCIONE')
            });
        },
        cargarCombosSEO: function () {
            var self = this;
            var idLocation = 0;

            // Obtenemos pdvs para el nivel 1
            self.listaPdvsSEO = window.app.SEO.pdvs;
            var location = self.listaPdvsSEO.filter(function (item) {
                return item.idParent == null;
            });

            if (location.length != 0) {
                idLocation = location[0].ID;
            }

            var locationsN1 = self.listaPdvsSEO.filter(function (item) {
                return item.idParent == idLocation;
            });

            self.$("#cmbPdvSEONivel1").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                dataSource: new kendo.data.DataSource({
                    data: locationsN1,
                    sort: { field: "name", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE'),
                change: function () {
                    // Obtenemos pdvs para el nivel 2
                    var idN1 = this.value();

                    var locationsN2 = self.listaPdvsSEO.filter(function (item) {
                        return item.idParent == idN1;
                    });

                    var ds = new kendo.data.DataSource({
                        data: locationsN2,
                        sort: { field: "name", dir: "asc" }
                    });

                    var comboN2 = $("#cmbPdvSEONivel2").data('kendoDropDownList');
                    comboN2.setDataSource(ds);
                }
            });

            self.$("#cmbPdvSEONivel2").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                optionLabel: window.app.idioma.t('SELECCIONE'),
                change: function () {
                    // Obtenemos pdvs para el nivel 3
                    var idN2 = this.value();

                    var locationsN3 = self.listaPdvsSEO.filter(function (item) {
                        return item.idParent == idN2;
                    });

                    var locationsN3N4 = [];
                    locationsN3.forEach(function (locationN3) {
                        locationsN3N4.push(locationN3);

                        var locationsN4 = self.listaPdvsSEO.filter(function (item) {
                            return item.idParent == locationN3.ID;
                        });

                        locationsN4.forEach(function (locationN4) {
                            locationsN3N4.push(locationN4);
                        });
                    });

                    var ds = new kendo.data.DataSource({
                        data: locationsN3N4,
                        sort: { field: "name", dir: "asc" }
                    });

                    var comboN3 = $("#cmbPdvSEONivel3").data('kendoDropDownList');
                    comboN3.setDataSource(ds);
                }
            });

            self.$("#cmbPdvSEONivel3").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "ID",
                optionLabel: window.app.idioma.t('SELECCIONE')
            });
        },
        events: {
            'click #btnAceptar': 'loginOCambioPuesto',
            'click #btnCancelar': 'cerrar',
            'click .field-icon': 'mostrarPassword',
        },
        loginOCambioPuesto: function() {
            var self = this;
            if (self.esLogin) {
                var usuario = $("#txtUsuario").val().toLowerCase();
                var se = new Sesion();

                se.fetch({
                    reset: true,
                    success: function (sesion) {
                        if (sesion.get('validada') && !$('#txtUsuario').prop('disabled')) {
                            self.model.set('validada', true);
                            $("#txtUsuario").val(sesion.get('usuario'));
                            $("#txtPassword").val('pass');
                            $("#txtUsuario").prop('disabled', true);
                            $("#txtPassword").prop('disabled', true);
                            $("#txtUsuario").addClass('ui-state-default');
                            $("#txtPassword").addClass('ui-state-default');
                        } else {
                            self.model.set("usuario", $("#txtUsuario").val().toLowerCase());
                            self.model.set("password", $("#txtPassword").val());

                            self.cargarDatos(self.model);

                            if (self.model.isValid()) {
                                self.logIn(self.model);

                                if (self.model.get("validada")) {
                                    self.dialog.close();
                                    self.eliminar();
                                    Not.crearNotificacion('success', 'Aviso Login', window.app.idioma.t('EL_USUARIO_') + self.model.get("usuario") + window.app.idioma.t('__SE'), 4000);
                                }
                            }
                        }
                    },
                    error: function () {
                    }
                });
            } else {
                var sesion = window.app.sesion;
                self.cargarDatos(sesion);
                self.cambiaPuesto(sesion);
            }
        },
        cargarDatos: function (datos) {
            var self = this;
            var indexLineaSel = self.$("#cmbLinea option:selected").val();
            if (indexLineaSel != -1) datos.set("linea", self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(indexLineaSel));

            var indexZonaSel = self.$("#cmbZona option:selected").val();
            if (indexZonaSel != -1) datos.set("zona", self.$("#cmbZona").data("kendoDropDownList").dataSource.get(indexZonaSel));

            var valuePdvN1 = self.$("#cmbPdvNivel1").data("kendoDropDownList").value();
            var valuePdvN2 = self.$("#cmbPdvNivel2").data("kendoDropDownList").value();
            var valuePdvN3 = self.$("#cmbPdvNivel3").data("kendoDropDownList").value();

            if (valuePdvN3 != '') {
                datos.set("pdv", valuePdvN3);
            } else {
                if (valuePdvN2 != '') {
                    datos.set("pdv", valuePdvN2);
                } else {
                    if (valuePdvN1 != '') {
                        datos.set("pdv", valuePdvN1);
                    } else {
                        datos.set("pdv", null);
                    }
                }
            }

            var valuePdvSeoN1 = self.$("#cmbPdvSEONivel1").data("kendoDropDownList").value();
            var valuePdvSeoN2 = self.$("#cmbPdvSEONivel2").data("kendoDropDownList").value();
            var valuePdvSeoN3 = self.$("#cmbPdvSEONivel3").data("kendoDropDownList").value();

            if (valuePdvSeoN3 != '') {
                datos.set("pdvSEO", valuePdvSeoN3);
            } else {
                if (valuePdvSeoN2 != '') {
                    datos.set("pdvSEO", valuePdvSeoN2);
                } else {
                    if (valuePdvSeoN1 != '') {
                        datos.set("pdvSEO", valuePdvSeoN1);
                    } else {
                        datos.set("pdvSEO", null);
                    }
                }
            }
        },
        logIn: function (sesion) {
            var error = false;
            var self = this;
            self.$("#imgProcesando").show();
            self.$("#divAceptar").hide();

            this.model.fetch({
                type: 'POST',
                url: "../api/loginTerminal",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(sesion),
                cache: false,
                async: true,
                reset: true,
                success: function (e) {
                    //Backbone.history.navigate('#', { replace: true, trigger: true });
                    if (self.model.get("usuario") == 'UsuarioOcupado') {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOGIN_OCUPADA'), 4000);
                        self.$("#imgProcesando").hide();
                        self.$("#divAceptar").show();
                    } else {
                        if (self.model.get("validada")) {
                            //Comprobamos permiso para mostrar logo y favicon ocultos al inicio
                            permiso = TienePermiso(422); //Permiso ocultar logos
                            if (!permiso) {
                                self.section = new Section();
                                $("#favicon").attr("href", self.section.getAppSettingsValue('faviconPlanta'));
                                $("#logo").show();
                                $("#lblNombrePlanta").css('margin-top', '0px');
                                $("#lblNombrePlanta").css('margin-right', '0px');
                                $(".navbar-header").css('margin-top', '0px');
                            }

                            Backbone.trigger('eventActSesion');
                            self.dialog.close();
                            self.remove();
                            self.getTiempoSesion()
                            RT.iniciar();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOGIN'), 4000);
                        }
                    }
                    return self.model;
                },
                error: function (data, status, xhr) {
                    error = true;
                    self.$("#imgProcesando").hide();
                    self.$("#divAceptar").show();
                    if (status.responseJSON.bloqueado) {
                        errorText = window.app.idioma.t('ERROR_LOGIN_LOCKED')
                    } else {
                        errorText = window.app.idioma.t('ERROR_LOGIN')
                    }
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), errorText, 4000);
                    return self.model;
                }
            });
        },
        cambiaPuesto: function (sesion) {
            var self = this;

            if (!sesion.get('linea')) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_INDICADO_LA_LINEA'), 4000);
                return;
            }

            if (!sesion.get('zona')) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_INDICADO_LA_ZONA'), 4000);
                return;
            }

            if (window.app.vista != null && window.app.vista.el.baseURI.includes('ListadoWO')) {
                kendo.ui.progress($("#listado"), true);
            }

            $.ajax({
                data: JSON.stringify(sesion),
                type: "POST",
                async: false,
                url: "../api/cambioPuesto",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    Not.quitarNotificacionOrden();
                    self.dialog.close();
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EL_USUARIO_') + self.model.get("usuario") + window.app.idioma.t('HA_CAMBIADO_DE'), 5000);

                    Backbone.trigger('eventActualizaPie');
                    Backbone.trigger('eventcambioPuesto');
                    if (window.app.vista && window.app.vista.actualiza) {
                        window.app.vista.actualiza(null, true);
                    }
                },
                error: function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 5000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SE_HA_PRODUCIDO') + self.model.get("usuario") + window.app.idioma.t('INTENTABA_CAMBIAR_DE'), 5000);
                    }
                }
            });

            return this.model;
        },
        eliminar: function()
        {
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        },
        actualiza: function () {
            this.render();
        },
        cerrar: function () {
            this.dialog.close();
            this.eliminar();
        },
        cambiaLinea: function() {
            var self = this;
            var cmbZonas = self.$("#cmbZona").data("kendoDropDownList");
            var opcSel = this.$("#cmbLinea option:selected").val();

            if (opcSel != "") {
                cmbZonas.dataSource.data(self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(opcSel).zonas);
                cmbZonas.dataSource.sort({ field: "numZona", dir: "asc" });

                if (self.esLogin) {
                    cmbZonas.select(0);
                } else {
                    cmbZonas.text(!self.model.get('zona') ? cmbZonas.select(0) : self.model.get('zona').descripcion);
                } 
            } else {
                cmbZonas.dataSource.data([]);
                cmbZonas.refresh();
            }
        },
        mostrarPassword: function () {
            $('.field-icon').toggleClass('glyphicon-eye-close').toggleClass('glyphicon-eye-open');
            var input = $('#txtPassword');

            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        },
        getTiempoSesion: function () {
            $.ajax({
                type: "GET",
                url: "../api/planta/getTiempoSesion",
                dataType: 'json',
                cache: true
            }).done(function (data) {
                if (data) {
                    window.app.interval = setInterval(window.app.comprobarSesionActiva, data);
                }
            }).fail(function (xhr) {
                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }
            });
        }
    });

    return VistaLogin;
});