define(['underscore', 'backbone', 'jquery', 'compartido/realTime', 'text!../../html/chat.html'], function (_, Backbone, $, RT, plantillaChat) {
    var VistaChat = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaChat),
        dialog: null,
        grid: null,
        registrosSel: [],
        usuarios: [],
        tab: null,
        replyUsers: {},
        principalGuid: null,
        open: false,
        usuario: null,
        linea: null,
        ds: null,
        initialize: function (options) {
            Backbone.on('eventActualizarUsuarios', this.actualizarUsuarios, this);
            this.options = options;
            this.usuario = window.app.sesion.get("usuario");
            this.render();
        },
        render: function () {
            var self = this;
            self.usuarios.push(window.app.sesion.attributes.usuario);

            $(this.el).html(this.template());

            this.$("#cmbLinea").kendoDropDownList({
                //dataTextField: "nombre",
                dataValueField: "id",
                template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                dataSource: new kendo.data.DataSource({
                    data: window.app.planta.lineas,
                    sort: { field: "nombre", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            $("#center-pane").append($(this.el));
            this.$("#btnAceptar").kendoButton();

            $("#divChatV").kendoSplitter({
                orientation: "vertical",
                panes: [
                    { collapsible: false, scrollable: false }
                ]
            });

            $("#divChatH").kendoSplitter({
                panes: [
                    { collapsible: true, size: "40%", scrollable: false },
                    { collapsible: false, scrollable: false }
                ]
            });

            self.principalGuid = self.generarGuid();

            self.tab = $("#divtextarea").kendoTabStrip({
                animation: {
                    open: { effects: "fadeIn" }
                },
                select: function (e) {
                    if (self.tab && self.dialog && !self.dialog.element.is(":hidden")) {
                        var guid = e.item.id;
                        if (self.principalGuid != guid) {
                            var splitter = $("#divChatH").data("kendoSplitter");
                            splitter.collapse(".k-pane:first");
                            splitter.options.panes[0].collapsible = false;
                            splitter.options.panes[0].resizable = false;
                            splitter.resize(true);
                        } else {
                            var splitter = $("#divChatH").data("kendoSplitter");
                            splitter.expand(".k-pane:first");
                            splitter.options.panes[0].collapsible = true;
                            splitter.options.panes[0].resizable = true;
                            splitter.options.panes[0].scrollable = false;
                            splitter.resize(true);
                        }
                        self.$("#" + guid).removeClass("parpadeo");
                    }
                },
                scrollable: {
                    distance: 300
                }
            }).data("kendoTabStrip");

            //Creamos pestaña
            self.tab.append({
                text: "Principal",
                content: "<div class='textarea' id='txtChat_" + self.principalGuid +"'></div>"
            });
            //Establecemos el id de la pestaña
            self.tab.tabGroup.children().last().attr("id", self.principalGuid);

            self.tab.select("#" + self.principalGuid);
            
            self.usuario = window.app.sesion.get("usuario");
            self.ds = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: "../api/ObtenerUsuariosConectados/" + null + "/" + self.usuario + "/",
                        dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        , cache: true
                    }
                },
                pageSize: 20,
                schema: {
                    model: {
                        fields: {
                            'usuario': { type: "string" },
                            'zona': { type: "string" },
                        }
                    }
                },
                sort: { field: "usuario", dir: "asc" }
            });

            self.grid = this.$("#gridUsuarios").kendoGrid({
                dataSource: self.ds,
                sortable: true,
                resizable: true,
                scrollable: true,
                columns: [
                    {
                        title: "",
                        template: '<input class="checkbox" type="checkbox"/>',
                        width: 30
                    },
                    {
                        field: "usuario",
                        title: window.app.idioma.t("USUARIO"),
                        width: 80,
                    },
                    {
                        field: "zona",
                        title: window.app.idioma.t("ZONAS"),
                        width: 80,
                    }
                ],
                dataBinding: self.resizeGrid,
                dataBound: function () {
                    $(".checkbox").bind("change", function (e) {
                        var checked = this.checked;
                        row = $(e.target).closest("tr");
                        grid = $("#gridUsuarios").data("kendoGrid");
                        dataItem = grid.dataItem(row);
                        var idValue = dataItem.get("usuario");
                        if (checked) {
                            //row.addClass("k-state-selected");
                            self.registrosSel.push(idValue);
                            if (jQuery.inArray(idValue, this.usuarios) != -1) {
                                self.usuarios.push(idValue);
                            }

                            self.$("#lblRegSel").text(self.registrosSel.length);

                        } else {
                            //row.removeClass("k-state-selected");
                            var index = self.registrosSel.indexOf(idValue);
                            if (index >= 0) {
                                self.registrosSel.splice(index, 1);
                                self.$("#lblRegSel").text(self.registrosSel.length);
                            }
                        }

                    });

                    if (self.registrosSel.length > 0) {

                        var items = self.grid.items();
                        var users = [];
                        items.each(function (idx, row) {
                            var dataItem = self.grid.dataItem(row);
                            var user = dataItem["usuario"];
                            users.push(user);
                            if (self.registrosSel.indexOf(user) >= 0) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                            }
                        });

                        self.registrosSel.forEach(function (user, id) {
                            if (users.indexOf(user) < 0) {
                                self.registrosSel.splice(id, 1);
                            }
                        });
                    }
                }
            }).data("kendoGrid");


            $(this.el).kendoWindow(
            {
                title: window.app.idioma.t('CHAT'),
                resizable: false,               
                position: {
                    top: 98,
                    left: window.innerWidth - 800
                },
                visible: false
            });

            this.dialog = $(this.el).data("kendoWindow");          

        },
        events: {
            'click #btnAceptar': 'enviarMsg',
            'click .btnclose': 'closeTab',
            'change #cmbLinea': 'cambiaLinea'
        },

        cambiaLinea: function()
        {
            var self = this;
            var cmbZonas = self.$("#cmbZona").data("kendoDropDownList");
            var opcSel = this.$("#cmbLinea option:selected").val();
            if (opcSel != "")
            {
                self.linea = self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(opcSel).numLinea;
                self.usuario = window.app.sesion.get("usuario");

                //self.AsociarUsuarioLinea(self.linea, self.usuario);

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerUsuariosConectados/" + null + "/" + self.usuario+ "/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                'usuario': { type: "string" },
                                'zona': { type: "string" },
                            }
                        }
                    },
                    sort: { field: "usuario", dir: "asc" }
                });


                $("#gridUsuarios").data("kendoGrid").setDataSource(self.ds);
                this.grid.dataSource.read();                           
            }
        },
        AsociarUsuarioLinea: function (linea, usuario) {
            $.ajax({
                type: "POST",
                async: false,
                url: "../api/AsociarUsuarioLinea/" + usuario + "/" + linea,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                },
                error: function (res) {
                    //Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'Error al cargar la lista de usuarios conectados', 4000);
                }
            });    
        },
        abrir: function () {
            this.dialog.open();
        },
        cerrar: function () {
            this.dialog.close();
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
            this.$el.empty();
            Backbone.off('eventActualizarUsuarios')
        },
        actualiza: function () {
            this.render();
        },
        actualizarUsuarios: function () {
            this.grid.dataSource.read();
            //this.grid.refresh();
        },
        generarGuid: function () {
            var guid;
            $.ajax({
                type: "GET",
                async: false,
                url: "../api/obtenerGuid",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    guid = data;
                },
                error: function (response) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_OBTENER_GUID'), 4000);
                }
            });
            return guid;
        },
        crearPestaña: function (usuario, guid) {
            var self = this;

            self.tab.append({
                text: usuario,
                content: "<div class='textarea' id='txtChat_" + guid + "'></div>"
            });
            self.tab.tabGroup.children().last().attr("id", guid);
            self.tab.tabGroup.children().last().append("<a class='k-window-action k-link btnclose' role='button' href='#'><span class='k-icon k-i-close' role='presentation'>Close</span></a>")
        },
        closeTab: function () {
            var self = this;
            var tabsel = self.tab.select();
            var index = tabsel.index();
            self.tab.remove(tabsel);
            self.tab.select(index - 1);
        },
        enviarMsg: function () {
            //RT.actualizarEstadoUsuariosChat();
            var self = this;
            var guid = $('#divtextarea li').eq(self.tab.select().index()).attr('id');

            if (self.replyUsers[guid] != undefined) {
                RT.enviarMsg(this.$("#txtInput").val(), window.app.sesion.attributes.usuario, self.replyUsers[guid], guid);
                this.$("#txtInput").val('');
            } else if (this.registrosSel.length > 0) {
                RT.enviarMsg(this.$("#txtInput").val(), window.app.sesion.attributes.usuario, this.registrosSel, guid);
                this.$("#txtInput").val('');
            }
            
        },
        recibirMsg: function (txtMsg, usuario, guid, idmessage) {
            var self = this;

            if (self.$("#" + guid).length == 0 & usuario != window.app.sesion.attributes.usuario) {
                //Creamos nueva pestaña
                self.crearPestaña(usuario, guid);
                var usuarios = [];
                usuarios.push(usuario);
                self.replyUsers[guid] = usuarios;
            }
            if (self.$("#" + guid).length != 0) {
                var txtAreaId = "#txtChat_" + guid;
                var txtArea = this.$(txtAreaId);

                if (txtArea.find("#" + idmessage).length == 0) {
                    var contenido = "<div id='"+idmessage+"'><span style='color:rgb(112,112,112);'>" + usuario + " : </span>" + txtMsg + "</div>";
                    txtArea.append(contenido);
                    txtArea.scrollTop(txtArea[0].scrollHeight - txtArea.height());

                    var guidSel = $('#divtextarea li').eq(self.tab.select().index()).attr('id');
                    if (usuario != window.app.sesion.attributes.usuario && guidSel != guid) {
                        self.$("#" + guid).addClass("parpadeo");
                    }
                }
            }
            RT.confirmarRecepccion(window.app.sesion.attributes.usuario, idmessage);
        }
    });
    return VistaChat;
});