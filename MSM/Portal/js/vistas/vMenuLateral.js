define(['underscore', 'backbone', 'jquery', 'vistas/vMenu', 'colecciones/cMenu', '../../../../Portal/js/constantes' ], function (_, Backbone, $, Menu, Menus, enums) {
    var MenuPrincipal = Backbone.View.extend({
        tagName: 'ul',
        enlacesExternos: enums.EnlacesExternos(),
        url: null,
        initialize: function () {
            this.render();
        },
        render: function () {
            var self = this;
            this.$el.html('');
            var datasource = [];

            this.collection.each(function (menu) {
                if (menu.get("permiso")) {
                    var opcion = {};
                    opcion.text = window.app.idioma.t(menu.get('texto'));
                    opcion.value = menu.get('vista');
                    opcion.url = "#" + menu.get('vista');

                    opcion.items = [];

                    if (menu.get('subMenus').length > 0) {
                        var menuSecundario = new Menus(menu.get('subMenus'));

                        menuSecundario.each(function (submenu) {
                            if (submenu.get("permiso")) {
                                var subOpcion = {};
                                subOpcion.value = submenu.get('vista');
                                subOpcion.name = submenu.get('texto');

                                // Comprobamos si el elemento de menú es un enlace externo
                                if (self.enlacesExternos[subOpcion.name]) {
                                    subOpcion.encoded = false;
                                    subOpcion.text = "<a id='" + subOpcion.value + "'>" + window.app.idioma.t(subOpcion.name) + "</a>";
                                } else {
                                    subOpcion.text = window.app.idioma.t(subOpcion.name);
                                    subOpcion.url = "#" + subOpcion.value;
                                }

                                opcion.items.push(subOpcion);
                            }                            
                        })
                    }
                    datasource.push(opcion);
                }
            }, this);

            //Rellenamos el menu lateral con el datasource creado
            $("#panelbar-images").kendoPanelBar({ 
                dataSource: datasource,
                expandMode: "single"
            })

            // Asignamos las urls de los enlaces externos a los botones correspondientes
            for (let ds of datasource) {
                for (let item of ds.items) {
                    let valor = item.value;
                    let nombre = window.app.idioma.t(item.name);
                    let idURL = self.enlacesExternos[item.name];
                    if (idURL) {
                        self.obtenerEnlaceExterno(idURL);
                        self.setLinkToChildElement(valor, self.url, nombre);
                    }
                }
            }

            return this;
        },
        obtenerEnlaceExterno: function (idEnlace) {
            var self = this;

            $.ajax({
                type: "GET",
                url: "../api/obtenerEnlaceExterno/" + idEnlace,
                dataType: "json",
                async: false
            }).done(function (url) {
                self.url = url;
            }).fail(function (e) {
                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENLACE'), 4000);
                }
            });
        },
        setLinkToChildElement: function(id, href, text){
            var _elementEnlace = $("#" + id).parent();

            if (id === "Deslizante" && _elementEnlace.length > 0) {
                _elementEnlace.length = 0;
            }

            if (_elementEnlace.length > 0) {
                var _elementReplaced = document.createElement("a");
                _elementReplaced.setAttribute("class", "k-link");
                _elementReplaced.setAttribute("href", href);
                _elementReplaced.setAttribute("target", "_blank");
                _elementReplaced.innerText = text;
                _elementEnlace[0].replaceWith(_elementReplaced);
            }
        }
    });
    return MenuPrincipal;
});


