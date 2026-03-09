// Fichero: idioma.js
// Descripción: herramientas para traducir los terminos de la aplicación
define([
  'jquery',
], function ($) {
    var ConfigKendo = function (pIdioma) {

        var idioma = pIdioma;

        if (idioma == 'en-GB') {
            this.configuracionFiltros_Msg =
            {
                info: 'Show items whith value:',
                and: 'and',
                cancel: 'cancel',
                clear: 'clean',
                checkAll: "Select all",
                filter: 'filter',
                isFalse: 'is false',
                isTrue: 'is true',
                operator: 'operator',
                or: 'or',
                selectValue: 'select value',
                value: 'value'
            }

            this.configuracionFiltros_Operadores = {
                string: {
                    //IsEqualTo: "is equal to",
                    eq: "is equal to",
                    //IsNotEqualTo: "is not equal to",
                    neq: "is not equal to",
                    startswith: "start with ",
                    contains: "contains",
                    doesnotcontain: "not contains",
                    endswith: "end with "
                },
                date: {
                    //IsEqualTo: "is equal to",
                    eq: "is equal to",
                    gt: "greater than",
                    gte: "greater than or equal",
                    lt: "less than",
                    lte: "less than or equal",
                    neq: "is not equal to"
                },
                number: {
                    //IsEqualTo: "is equal to",
                    eq: "is equal to",
                    //IsNotEqualTo: "is not equal to",
                    neq: "is not equal to",
                    gt: "greater than",
                    gte: "greater than or equal",
                    lt: "less than",
                    lte: "less than or equal"
                }
            }

            this.configuracionFiltros_Operadores2 = {
                string: {
                    //IsEqualTo: "is equal to",
                    eq: "is equal to",
                    //IsNotEqualTo: "is not equal to",
                    neq: "is not equal to",
                    startswith: "start with ",
                    contains: "contains",
                    doesnotcontain: "not contains",
                    endswith: "end with "
                },
                date: {                   
                    gte: "greater than or equal",                    
                    lte: "less than or equal",
                },
                number: {
                    //IsEqualTo: "is equal to",
                    eq: "is equal to",
                    //IsNotEqualTo: "is not equal to",
                    neq: "is not equal to",
                    gt: "greater than",
                    gte: "greater than or equal",
                    lt: "less than",
                    lte: "less than or equal"
                }
            }

            this.configuracionPaginado_Msg = {
                display: "{0} - {1} of {2} rows", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                empty: "There´re not rows to show",
                page: "Page",
                of: "of {0}", //{0} is total amount of pages
                itemsPerPage: "rows per page",
                first: "Go to the first page",
                previous: "Go to the previous page",
                next: "Go to the next page",
                last: "Go to the last page",
                refresh: "Refresh",
                allPages: 'All'
            }
        }
        else {
          this.configuracionFiltros_Msg =
          {
              info: 'Muestra items cuyo valor:',
              and: 'y',
              cancel: 'cancelar',
              clear: 'limpiar',
              checkAll: "Seleccionar todo",
              filter: 'filtrar',
              isFalse: 'es falso',
              isTrue: 'es verdadero',
              operator: 'operador',
              or: 'o',
              selectValue: 'seleccione valor',
              value: 'valor'
          }

            this.configuracionFiltros_Operadores = {
                string: {
                    //IsEqualTo: "es igual a",
                    eq: "es igual a",
                    //IsNotEqualTo: "no es igual a",
                    neq: "no es igual a",
                    startswith: "empieza con ",
                    contains: "contiene",
                    doesnotcontain: "no contiene",
                    endswith: "termina con "
                },
                date: {
                    //IsEqualTo: "es igual a",
                    eq: "es igual a",
                    gt: "mayor que",
                    gte: "mayor o igual que",
                    lt: "menor que",
                    lte: "menor o igual que",
                    neq: "no es igual a"
                },
                number: {
                    //IsEqualTo: "es igual a",
                    eq: "es igual a",
                    //IsNotEqualTo: "no es igual a",
                    neq: "no es igual a",
                    gt: "mayor que",
                    gte: "mayor o igual que",
                    lt: "menor que",
                    lte: "menor o igual que"
                }
            }

            this.configuracionFiltros_Operadores2 = {
                string: {
                    //IsEqualTo: "es igual a",
                    eq: "es igual a",
                    //IsNotEqualTo: "no es igual a",
                    neq: "no es igual a",
                    startswith: "empieza con ",
                    contains: "contiene",
                    doesnotcontain: "no contiene",
                    endswith: "termina con "
                },
                date: {               
                    gte: "mayor o igual que",
                    lte: "menor o igual que"
                },
                number: {
                    //IsEqualTo: "es igual a",
                    eq: "es igual a",
                    //IsNotEqualTo: "no es igual a",
                    neq: "no es igual a",
                    gt: "mayor que",
                    gte: "mayor o igual que",
                    lt: "menor que",
                    lte: "menor o igual que"
                }
            }

            this.configuracionPaginado_Msg = {
                display: "{0} - {1} de {2} registros", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
                empty: "No hay datos para mostrar",
                page: "Pagina",
                of: "de {0}", //{0} is total amount of pages
                itemsPerPage: "registros por pagina",
                first: "Ir a la primera pagina",
                previous: "Ir a la pagina anterior",
                next: "Ir a la pagina siguiente",
                last: "Ir a la ultima pagina",
                refresh: "Refrescar",
                allPages: 'Todo'
            }
        }

        this.extGridToolbarColumnMenu = kendo.ui.Grid.extend({
            options: {
                toolbarColumnMenu: false,
                name: "ExtGrid",
            },
            init: function (element, options) {
                /// <summary>
                /// Initialize the widget.
                /// </summary>

                if (options.toolbarColumnMenu === true && typeof options.toolbar === "undefined") {
                    options.toolbar = [];

                }
                kendo.ui.Grid.fn.init.call(this, element, options);
                this._initToolbarColumnMenu(element.id);
            },

            _initToolbarColumnMenu: function (grid) {
                /// <summary>
                /// Determine whether the column menu should be displayed, and if so, display it.
                /// </summary>

                // The toolbar column menu should be displayed.
                if (this.options.toolbarColumnMenu === true && this.element.find(".k-ext-grid-columnmenu").length === 0) {

                    // Create the column menu items.
                    var $menu = $("<ul id='ulToolbarColumn' style='max-height:400px !important;overflow-y:auto'></ul>");

                    // Loop over all the columns and add them to the column menu.
                    for (var idx = 0; idx < this.columns.length; idx++) {
                        var column = this.columns[idx];
                        // A column must have a title to be added. 
                        // DAJ: Tambien comprobamos el campo toolbarColumnMenu para ver si se incluye esa columna
                        let tcm = column.toolbarColumnMenu != undefined ? column.toolbarColumnMenu == true : true;
                        if ($.trim(column.title).length > 0 && tcm) {
                            // Add columns to the column menu.
                            $menu.append(kendo.format("<li><input  type='checkbox' data-index='{0}' data-field='{1}' data-title='{2}' {3}>&emsp;{4}</li>",
                                idx, column.field, column.title, column.hidden ? "" : "checked", column.title));
                        }
                    }

                    // Create a "Columns" menu for the toolbar.
                    this.wrapper.find("div.k-grid-toolbar").append("<ul class='k-ext-grid-columnmenu' style='float:left;border-radius:4px;margin-right:5px;'><li data-role='menutitle' class='btnColumns' style='border-style:hidden;'>" + window.app.idioma.t('COLUMNAS') + "</li></ul>");
                    this.wrapper.find("div.k-grid-toolbar ul.k-ext-grid-columnmenu li").append($menu);

                    var that = $("#"+grid).data("kendoExtGrid");

                    this.wrapper.find("div.k-grid-toolbar ul.k-ext-grid-columnmenu").kendoMenu({
                        closeOnClick: false,
                        select: function (e) {
                            // Get the selected column.
                            var $item = $(e.item), $input, columns = that.columns;
                            $input = $item.find(":checkbox");
                            if ($input.attr("disabled") || $item.attr("data-role") === "menutitle") {
                                return;
                            }

                            var column = that._findColumnByTitle($input.attr("data-title"));

                            // If checked, then show the column; otherwise hide the column.
                            if ($input.is(":checked")) {
                                //that.showColumn(column.field);
                                that.showColumn(column);
                            } else {
                                //that.hideColumn(column.field);
                                that.hideColumn(column);
                            }
                        }
                    });
                }
            },
            _findColumnByTitle: function (title) {
                /// <summary>
                /// Find a column by column title.
                /// </summary>
                var result = null;

                for (var idx = 0; idx < this.columns.length && result === null; idx++) {
                    column = this.columns[idx];

                    if (column.title === title) {
                        result = column;
                    }
                }

                return result;
            }
        });


        //configuracionFiltros_Msg: {
        //    info: 'Muestra items cuyo valor:',
        //    and: 'y',
        //    cancel: 'cancelar',
        //    clear: 'limpiar',
        //    checkAll:"Seleccionar todo",
        //    filter: 'filtrar',
        //    isFalse: 'es falso',
        //    isTrue: 'es verdadero',
        //    operator: 'operador',
        //    or: 'o',
        //    selectValue: 'seleccione valor',
        //    value: 'valor'
        //},
        //configuracionFiltros_Operadores: {
        //    string: {
        //        IsEqualTo: "es igual a",
        //        IsNotEqualTo: "no es igual a",
        //        startswith: "empieza con ",
        //        contains: "contiene",
        //        doesnotcontain: "no contiene",
        //        endswith: "termina con "
        //    },
        //    date: {
        //        IsEqualTo: "es igual a",
        //        gt: "mayor que",
        //        gte: "mayor o igual que",
        //        lt: "menor que",
        //        lte: "menor o igual que",
        //        neq: "no es igual a"
        //    },
        //    number: {
        //        IsEqualTo: "es igual a",
        //        IsNotEqualTo: "no es igual a",
        //        gt: "mayor que",
        //        gte: "mayor o igual que",
        //        lt: "menor que",
        //        lte: "menor o igual que"
        //    }
        //},
        //configuracionPaginado_Msg: {
        //    display: "{0} - {1} de {2} registros", //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
        //    empty: "No hay datos para mostrar",
        //    page: "Pagina",
        //    of: "de {0}", //{0} is total amount of pages
        //    itemsPerPage: "registros por pagina",
        //    first: "Ir a la primera pagina",
        //    previous: "Ir a la pagina anterior",
        //    next: "Ir a la pagina siguiente",
        //    last: "Ir a la ultima pagina",
        //    refresh: "Refrescar"
        //}
    }



    return ConfigKendo;
});