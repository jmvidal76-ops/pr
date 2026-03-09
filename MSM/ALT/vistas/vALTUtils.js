define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones'],
    function (_, Backbone, $, Not) {

        return function () {
            //for TreeNodes Locations
            var self = this;
            this.getLocationsForTree = function (idDepartmentType) {
                var treeNodeArray = [];
                var ALTLocations = self.getData("../api/TemplatesLocations/" + idDepartmentType + "/").data;
                var ALTForms = self.getData("../api/TemplatesLocForms").data;
                var ALTTriggers = self.getData("../api/TemplatesLocFormTri").data;

                this.findChilds(treeNodeArray, null, ALTLocations, ALTForms, ALTTriggers);
                return treeNodeArray;
            },
            this.findChilds = function (arrayParent, idParentNode, locations, forms, triggers) {
                var self = this;

                if (locations != null) {
                    locations.forEach(function (l) {

                        if (idParentNode == l.idParent) {
                            var newNode = {
                                id: l.ID,
                                text: l.name,
                                type: 'location',
                                imageUrl: "/ALT/img/ALT_location.png",
                                data: l,
                                items: [],
                            }
                            self.findChilds(newNode.items, l.ID, locations, forms, triggers);
                            arrayParent.push(newNode);
                        }

                    });
                }

                if (forms != null) {
                    forms.forEach(function (form) {
                        if (idParentNode == form.idLoc) {
                            var newNodeForm = {
                                id: form.idLoc + '_' + form.idTemForm,
                                text: form.name,
                                type: 'form',
                                imageUrl: "/ALT/img/ALT_form.png",
                                data: form,
                                items: [],
                            }

                            triggers.forEach(function (trigger) {
                                if (trigger.idLoc == idParentNode && trigger.idTemForm == form.idTemForm) {
                                    var newNodeTrigger = {
                                        id: trigger.idLoc + '_' + trigger.idTemForm + '_' + trigger.idTrigger,
                                        text: trigger.name,
                                        type: 'trigger',
                                        imageUrl: "/ALT/img/ALT_trigger.png",
                                        data: trigger,
                                        hasChildren: false
                                    }
                                    newNodeForm.items.push(newNodeTrigger);
                                }
                            });
                            arrayParent.push(newNodeForm);
                        }
                    });
                }
            },
            this.getDefaultField = function () {
                return {
                    type: "text",
                    label: "Etiqueta",
                    descript: "",
                    nameID: null,
                    maxLength: 30,
                    min: 0,
                    max: 1,
                    required: true,
                    requireValueCheck: "",
                    editableInRuntime: true,
                    dataRow: [],
                    dataColumns: [],
                    link: "",
                };
            },
            this.getValidator = function (div) {

                return $(div).kendoValidator({
                    rules: {
                        forAll: function (input) {
                            //quitamos los estilos antes de validar, luego dependiendo de que tipo fallo sea ponemos uno u otro
                            $(input).removeClass("invalidRequired")
                            $(input).removeClass("invalidRange");

                            if ($("#selStatusID3_listbox .k-item").length > 0) {
                                if ($('#formTemplate').kendoValidator().data('kendoValidator').validate()) {
                                    $("#selStatusID3_listbox .k-item")[0].disabled = false;
                                    $("#selStatusID3_listbox .k-item")[0].style.cssText = "color: black";
                                } else {
                                    $("#selStatusID3_listbox .k-item")[0].disabled = true;
                                    $("#selStatusID3_listbox .k-item")[0].style.cssText = "color: lightgrey";
                                    $("#selStatusID3").data("kendoDropDownList").select(1);
                                }
                            }
                            return true;
                        },
                        range: function (input) {
                            var min = parseFloat($(input).data("mymin"), 10);
                            var max = parseFloat($(input).data("mymax"), 10);
                            var value = parseFloat($(input).val(), 10);

                            if (isNaN(min) || isNaN(max) || isNaN(value)) {
                                return true;
                            }

                            return min <= value && value <= max;
                        },
                        specialFields: function (input) {
                            var mytype = $(input).attr("name");
                            //for checkbox
                            var require = $(input).attr("required");
                            var requireValue = $(input).data("requirevalue");
                            if (typeof (requireValue) === "boolean" && require) {
                                var val = $.trim($(input).val());
                                if (val == requireValue.toString() || !val)
                                    return true;
                                else
                                    return false;
                            } else {
                                return true;
                            }
                            //rest of special Fuelds
                            switch (mytype) {
                                case 'turnoId':
                                case 'orderId':
                                case 'orderTypeId':
                                case 'shcId':
                                case 'lotId':
                                case 'materialId':
                                case 'location':
                                    var result;
                                    $.ajax({
                                        data: JSON.stringify({ type: mytype, value: $(input).val() }),
                                        type: "POST",
                                        async: false,
                                        url: '../api/checkCampoEspecial/',
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        success: function (res) {
                                            result = res;
                                        },
                                        error: function (response) {
                                            result = false;
                                        }
                                    });
                                    return result;

                                default:
                                    return true;
                            }
                        }
                    },
                    messages: {
                        // overrides the built-in message for the required rule
                        required: function (input) {
                            $(input).addClass("invalidRequired");
                            $(input).removeClass("invalidRange");

                            if ($("#selStatusID3_listbox .k-item").length > 0) {
                                $("#selStatusID3_listbox .k-item")[0].disabled = true;
                                $("#selStatusID3_listbox .k-item")[0].style.cssText = "color: lightgrey";
                                $("#selStatusID3").data("kendoDropDownList").select(1);
                            }

                            return (window.app.idioma.t('ALT_ERROR_FORM_REQUIRED'));
                        },
                        range: function (input) {
                            $(input).addClass("invalidRange");
                            var min = parseFloat($(input).data("mymin"), 10);
                            var max = parseFloat($(input).data("mymax"), 10);

                            return kendo.format(window.app.idioma.t('ALT_ERROR_FORM_INVALID_RANGE') + " {0} - {1}", min, max);
                        },
                        specialFields: function (input) {
                            var val = $.trim($(input).val());
                            if (val)
                            $(input).addClass("invalidRange");

                            return window.app.idioma.t('ALT_ERROR_FORM_SPECIALFIELD');
                        },
                        url: function (input) {
                            $(input).addClass("invalidRange");
                            return window.app.idioma.t('ALT_ERROR_FORM_URL');
                        }
                    },
                }).data("kendoValidator");
            },
            this.postData = function (URL, data2send, NotActivate) {
                if (NotActivate == null) {
                    NotActivate = true;
                }

                var result = {
                    error: -5,
                    errorDesc: 'Not efective Call',
                    data: null
                };

                $.ajax({
                    data: JSON.stringify(data2send),
                    type: "POST",
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            if (res[0] == true) {
                                console.log(res)
                                if (NotActivate) Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);
                                result.error = 0;
                                result.errorDesc = res[1];
                            } else {
                                if (NotActivate) {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                                    result.error = -1;
                                    result.errorDesc = res[1];
                                }
                            }
                        } else {
                            result.error = -2;
                            result.errorDesc = res[1];
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            if (NotActivate) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            }
                            result.error = -3;
                            result.errorDesc = '403 - ' + window.app.idioma.t('AVISO_SIN_PERMISOS');
                        } else {
                            if (NotActivate) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_create_template'), 2000);
                            }
                            result.error = -4;
                            result.errorDesc = window.app.idioma.t('ERROR_OBTENIENDO_DATOS');
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });

                return result;
            },
            //return data from an API REST 
            this.getData = function (URL, NotActivate) {
                if (NotActivate == null) {
                    NotActivate = true;
                }

                var result = {
                    error: -4,
                    errorDesc: '',
                    data: null
                };

                $.ajax({
                    type: "GET",
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            result.data = res;
                            result.error = 0;
                        } else {
                            result.error = -1;
                            result.errorDesc = window.app.idioma.t('ERROR_OBTENIENDO_DATOS');
                            if (NotActivate) {

                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), result.errorDesc, 2000);
                                // Backbone.trigger('eventCierraDialogo');
                            }
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            result.error = -2;
                            result.errorDesc = window.app.idioma.t('AVISO_SIN_PERMISOS');
                            if (NotActivate) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), result.errorDesc, 2000);
                            }
                        } else {
                            result.error = -3;
                            result.errorDesc = window.app.idioma.t('ERROR_OBTENIENDO_DATOS');
                            if (NotActivate) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), result.errorDesc, 2000);
                            }
                        }
                    }
                });

                return result;
            }
        };
    });