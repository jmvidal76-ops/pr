define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/ComponentProduccionEdit.html', 'compartido/notificaciones'],
    function (_, Backbone, $, TemplateComponent, Not) {

        // VIEW

        var dialogView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLEditProduccion',
            title: null,
            arrIDs: null,
            refreshFunction: null,
            serverTraza: window.app.section.getAppSettingsValue('HostApiTrazabilidad'),
            data2bind: null,
            listaItems: null,

            template: _.template(TemplateComponent),
            initialize: function (refreshFunction, params) {
                var self = this;
                //reset values
                self.data2bind = new kendo.data.ObservableObject({
                    particiones: [],
                    particionValue: '',
                    typesEstado: [{ text: window.app.idioma.t('CORRECTA'), value: 1 }, { text: window.app.idioma.t('ERRONEA'), value: 0 }],
                    valueEstado: 0,
                    typesCuarentena: [{ text: window.app.idioma.t('NO'), value: '0' }, { text: window.app.idioma.t('SI'), value: '1' }],
                    valueCuarentena: '1',
                    typesBloquear: [{ text: window.app.idioma.t('NO'), value: '0' }, { text: window.app.idioma.t('SI'), value: '1' }],
                    valueBloquear: '1',
                    motivoCuarentena: '',
                    motivoBloquear: '',
                    typeEdit: '',
                });
                //--//
                self.refreshFunction = refreshFunction;
                self.data2bind.typeEdit = params.typeEdition;
                self.listaItems = params.selectArr;
                self.arrIDs = params.selectArr.map(function (p) { return p.IdProduccion; });
                // UpdProductionPartition
                // var particiones = self.callServer(serverTraza + "/api/UpdProductionPartition/",
                //  "GET", 
                //  {});
                //console.log(arrIDs)
                //set tittle of window
                switch (self.data2bind.typeEdit) {
                    case "LOTE":
                        self.title = window.app.idioma.t('LOTE');
                        break;
                    case "PARTICION":
                        var linea = params.selectArr[0].Linea;
                        var referencia = params.selectArr[0].Referencia;
                        //PARA CUANDO CAMBIE LA API - var EtiquetaCreatedAt = params.selectArr[0].EtiquetaCreatedAt;
                        // http://10.2.20.206:2017/TrazabilidadAPITestData/api/PartitionByIDLinea/4/1001
                        //window.app.section.getAppSettingsValue('HostApiTrazabilidad');
                        var urlPart = '../api/PartitionByIDLinea/' + linea + '/' + referencia + '/';
                        //http://10.2.20.206:2017/TrazabilidadAPITestData/api/PartitionByIDLinea
                        self.callBackServer(urlPart, "GET", function (result) {
                            self.data2bind.set("particiones", result);
                        });
                        // self.data2bind.set("particiones", self.callServer(self.serverTraza + "api/PartitionByIDLinea/","GET"));

                        self.title = window.app.idioma.t('PARTICION');
                        break;
                    case "ESTADO":
                        self.title = window.app.idioma.t('ESTADO');
                        break;
                    case "CUARENTENA":
                        self.title = window.app.idioma.t('CUARENTENA');
                        break;
                    case "BLOQUEO":
                        self.title = window.app.idioma.t('BLOQUEAR');
                        break;
                }

                self.render();
            },
            render: function () {
                //--ini DIALOG WINDOW--//
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                kendo.bind($("#myObjectTemplate"), this.data2bind);
                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));

                //Render inputs  
                $("#dateCuarentena").kendoDateTimePicker({
                    value: new Date(),
                    format: "dd/MM/yyyy HH:mm:ss",
                    dateInput: true
                });
                $("#dateBloquear").kendoDateTimePicker({
                    value: new Date(),
                    format: "dd/MM/yyyy HH:mm:ss",
                    dateInput: true
                });
                //hide DIV of not type
                this.showTypeDiv(this.data2bind.typeEdit);
                //bind toolBar

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    activate: this.onActivate
                }).data("kendoWindow");

                self.dialog = $('#myObjectTemplate').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();


            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #selectCuarentena': 'changeCuarentena',
                'change #selectBloquear': 'changeBloquear'

            },
            changeCuarentena: function (e) {
                if (e.target.value == '0') {
                    $("#dateCuarentena").data("kendoDateTimePicker").enable(false);
                    $("#motivoCuarentena").prop('disabled', true);
                } else {
                    $("#dateCuarentena").data("kendoDateTimePicker").enable(true);
                    $("#motivoCuarentena").prop('disabled', false);
                }
            },
            changeBloquear: function (e) {
                if (e.target.value == '0') {
                    $("#dateBloquear").data("kendoDateTimePicker").enable(false);
                    $("#motivoBloquear").prop('disabled', true);
                } else {
                    $("#dateBloquear").data("kendoDateTimePicker").enable(true);
                    $("#motivoBloquear").prop('disabled', false);
                }
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }

                this.eliminar();
            },
            aceptar: function (e) {

                //Guardamos template
                e.preventDefault();

                var self = this;
                var params;
                var url = "../";
                //COMPROBAMOS QUE LOS CAMPOS SEAN CORRECTOS"" }, 
                switch (self.data2bind.typeEdit) {
                    case "CUARENTENA":
                        //arrIDs  (array ints Ids a editar), motivoCuarentena (string), CuarentenaAt (date)
                        url += "api/UpdProduccionQuarantine/"
                        params = {
                            IdProduccion: self.arrIDs,
                            motivo: self.data2bind.get("motivoCuarentena"),
                            fecha: $("#dateCuarentena").data("kendoDateTimePicker").value(),
                            tipo: "0"
                        };
                        if (self.data2bind.get("valueCuarentena") == '0') {
                            params.motivo = "";
                            params.fecha = null;
                        }
                        console.log(JSON.stringify(params));
                        break;
                    case "BLOQUEO":
                        //Inputs: arrIDs  (array ints Ids a editar), motivoBloqueo (string), BloqueoAt(date)
                        url += "api/UpdProduccionBlocking/"
                        params = {
                            IdProduccion: self.arrIDs,
                            motivo: self.data2bind.get("motivoBloquear"),
                            fecha: $("#dateBloquear").data("kendoDateTimePicker").value(),
                            tipo: "1"
                        };
                        console.log("VALUE DE BLOQYUE " + self.data2bind.get("valueBloquear"));
                        if (self.data2bind.get("valueBloquear") == '0') {
                            params.motivo = "";
                            params.fecha = null;
                        }

                        break;
                    case "PARTICION":
                        //arrIDs, idEtiquetaEstado
                        console.log("particion");
                        url += "api/UpdProductionPartition/"
                        params = {
                            Producciones: self.listaItems,
                            ParticionWO: self.data2bind.get("particionValue")
                        };
                        //console.log(JSON.stringify(params));
                        break;
                    case "ESTADO":
                        //arrIDs, idEtiquetaEstado

                        url += "api/UpdProduccionLabel/";
                        params = {
                            IdProduccion: self.arrIDs,
                            motivo: self.data2bind.get("valueEstado"),
                            fecha: "",
                            tipo: "2"
                        };
                        console.log(JSON.stringify(params));
                        break;
                }

                console.log("URL: " + url);
                //console.log("DATA: " + JSON.stringify(params));
                $.ajax({
                    data: JSON.stringify(params),
                    type: "PUT",
                    async: false,
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.eliminar();

                        if (res) {
                            self.refreshFunction();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ASIGNAR') + " WO", 3000);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ASIGNAR') + " WO", 3000);
                        }

                        self.eliminar();
                    }
                });
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.dialog.close();

                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            showTypeDiv: function (type) {

                //buscamos todos los divs y los escondemos
                $("#objectTemplate").find('.divParametros').each(function (index) {
                    $(this).hide();

                });
                $("#div" + type).show();
                //bind

            },
            callServer: function (URL, typeCall) {
                var result;
                $.ajax({
                    type: typeCall,
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        console.log("OK")
                        if (res) {
                            return result = res;
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                        }
                    }
                });
            },
            callBackServer: function (URL, typeCall, callback) {
                $.ajax({
                    type: typeCall,
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            callback(res);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                        }
                    }
                });
            }
        })

        return dialogView;
    }
);