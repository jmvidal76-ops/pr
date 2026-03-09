define(['jquery', 'compartido/notificaciones'],
    function ($, Not) {
        var FORMAT_TIME = kendo.culture().calendars.standard.patterns.MES_Hora;
        var KFORMAT_TIME = '{0:' + FORMAT_TIME + '}';
        var FORMAT_DATE = kendo.culture().calendars.standard.patterns.MES_Fecha;
        var KFORMAT_DATE = '{0:' + FORMAT_DATE + '}';
        var FORMAT_DATETIME = kendo.culture().calendars.standard.patterns.MES_FechaHora;
        var KFORMAT_DATETIME = '{0:' + FORMAT_DATETIME + '}';
        var FORMAT_SQLDATETIME = 'yyyy-MM-dd HH:mm:ss';
        var FORMAT_QUANTITY = 'n2';
        var KFORMAT_QUANTITY = '{0:n2}';
        var FORMAT_INTEGER = 'n0';
        var KFORMAT_INTEGER = '{0:n0}';

        var CfgKendo = window.app.cfgKendo;

        var defaultValidatorConfig = {
            messages: {
                required: T('CAMPO_OBLIGATORIO'),
            }
        };

        var defaultGridColumnCheckbox = {
            attributes: { 'class': 'columna-checkbox', 'style': 'text-align: center' }
        };

        var defaultNumericTextBox = {
            placeholder: T('INTRODUZCA_UN_VALOR'),
            culture: localStorage.getItem('idiomaSeleccionado'),
            format: FORMAT_INTEGER,
            //decimals: 0,
            // restrictDecimals: true
        };

        function T(name) {
            return window.app.idioma.t(name);
        }

        function ajaxApi(url, data, type = 'POST') {
            return $.ajax({
                type: type,
                url: url,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                cache: false,
                data: (data ? JSON.stringify(data) : undefined)
            });
        }

        function ajaxApiSync(url, data) {
            return $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                cache: false,
                async: false,
                data: (data ? JSON.stringify(data) : undefined)
            });
        }


        function gridPageSizes() {
            return [30, 50, 100, 'All'];
        }

        function gridExcel(name) {
            return {
                fileName: (typeof (name) === 'function' ? name : T(name) + '.xlsx'),
                filterable: true,
                allPages: true
            };
        }

        function gridExcelDate(name) {
            let date = kendo.toString(new Date(), FORMAT_DATE).replace(/\//g, '');
            return {
                fileName: (typeof (name) === 'function' ? name : T(name) + '_' + date + '.xlsx'),
                filterable: true,
                allPages: true
            };
        }

        function gridPageable() {
            return {
                refresh: true,
                pageSizes: gridPageSizes(), // [50, 100, 200, 'All'],
                buttonCount: 5,
                messages: CfgKendo.configuracionPaginado_Msg
            };
        }

        function gridFilterable() {
            return {
                extra: false,
                messages: CfgKendo.configuracionFiltros_Msg,
                operators: CfgKendo.configuracionFiltros_Operadores
            };
        }

        function loadTemplate(selector) {
            return kendo.template($(selector).html());
        }

        function fromSQLDateString(d) {
            return kendo.parseDate(d, FORMAT_SQLDATETIME);
        }

        function toSQLDateString(d) {
            return kendo.toString(d, FORMAT_SQLDATETIME);
        }

        function limpiarFiltrosGrid(e) {
            var ds = undefined;
            if (this.dataSource) { // Es un kendoGrid
                ds = this.dataSource;
            } else {
                var $el = (e ? $(e.target) : (this.$el || $(this)));
                var grid = ($el.hasClass('k-grid') ? $el : $el.closest('.k-grid'));
                if (grid) {
                    ds = $(grid).data('kendoGrid').dataSource;
                }
            }

            if (ds) {
                ds.filter({});
            }
        }

        function gridSaveAsExcel(e) {
            var $el = (e ? $(e.target) : (this.$el || $(this)));
            var grid = ($el.hasClass('k-grid') ? $el : $el.closest('.k-grid'));
            if (grid) {
                $(grid).data('kendoGrid').saveAsExcel();
            }
        }

        function eliminarBackboneView(view) {
            view.remove();

            // unbind events that are
            // set on this view
            view.off();

            // remove all models bindings
            // made by this view
            if (view.model && view.model.off) { view.model.off(null, null, view); }
        }

        function NotificaCorrecto(textKey) {
            var texto = T(textKey) || '';
            Not.crearNotificacion('success', T('AVISO'), texto, 1000 + Math.floor(texto.length / 25) * 1000);
        }
        function NotificaAviso(textKey) {
            var texto = T(textKey) || '';
            Not.crearNotificacion('warning', T('AVISO'), texto, 1000 + Math.floor(texto.length / 25) * 1000);
        }
        function NotificaError(xhr) {
            if (xhr && +xhr.status === 403 && (xhr.responseJSON === 'NotAuthorized' || xhr.responseJSON.Message === 'NotAuthorized')) {
                Not.crearNotificacion('warning', T('AVISO'), T('AVISO_SIN_PERMISOS'), 2000);
            } else {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), T('ERROR'), 2000);
            }
        }

        function createNumericField(el, value, options) {
            var $el = $(el);
            $el.kendoNumericTextBox($.extend(true, {}, defaultNumericTextBox, options));

            // $el.attr("type", "number");
            var widget = $el.data('kendoNumericTextBox');
            if (value !== undefined) {
                widget.value(value);
            }
            return widget;
        }

        function createQuantityField(el, value, options) {
            var defaultOptions = {
                format: FORMAT_QUANTITY,
            };

            return createNumericField(el, value, $.extend(true, defaultOptions, options));
        }

        function createCombo(el, text, value, ds, optLabel) {
            var $el = $(el);
            $el.kendoDropDownList({
                dataTextField: text,
                dataValueField: value,
                dataSource: ds,
                optionLabel: optLabel
            });

            return $el.data('kendoDropDownList');
        }

        function createComboTextTemplate(el, textTemplate, value, ds, optLabel) {
            var $el = $(el);
            $el.kendoDropDownList({
                template: textTemplate,
                valueTemplate: textTemplate,
                dataValueField: value,
                dataSource: ds,
                optionLabel: optLabel
            });

            return $el.data('kendoDropDownList');
        }

        function createGrid(el, options) {
            var $el = $(el);
            var defOptions = {
                sortable: true,
                resizable: true,
                scrollable: true,
                culture: localStorage.getItem('idiomaSeleccionado'),
                filterable: gridFilterable(),
                pageable: gridPageable()
            };

            var kOptions = $.extend(true, {}, defOptions, options);
            $el.kendoGrid(kOptions);
            $el.kendoTooltip({ filter: 'th' });
            return $el.data('kendoGrid');
        }



        // Crear un  grid cuya primera columna tenga un selector de fila checkbox //
        // OJO: no soporta la opcion de cambiar columnas mediante setOptions, queda pendiente.
        var selectionDataField = 'rowSelected';
        function GridCheckboxSyncDataToSelection(e, selecField) {
            var grid = e.sender;

            var checkedCount = 0;
            var rows = grid.items();
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var $row = $(row);
                var dataItem = grid.dataItem(row);
                if (dataItem[selecField]) {
                    $row.addClass("k-state-selected");
                    $row.find("input:checkbox").prop("checked", true);
                    checkedCount++;
                } else {
                    $row.removeClass("k-state-selected");
                    $row.find("input:checkbox").prop("checked", false);
                }
            }

            var checkAll = grid.thead.find('input[type=checkbox].columna-checkbox-header-all');
            if (checkAll.length === 1) {
                checkAll[0].checked = (checkedCount > 0 && checkedCount == e.sender.dataSource.view().length);
            }
        }

        function GridCheckboxSyncSelectionToData(e, selecField, valueSelectionHandler) {
            var grid = e.sender;
            var selectedRow = grid.select()[0];
            var $selectedRow = $(selectedRow);

            // Invertir el estado actual
            var dataItem = grid.dataItem(selectedRow);
            var selecValue = !dataItem[selecField];
            dataItem[selecField] = selecValue;
            $selectedRow.toggleClass("k-state-selected", selecValue);
            $selectedRow.find("input:checkbox").prop("checked", selecValue);

            if (valueSelectionHandler) {
                valueSelectionHandler(grid, selecValue);
            }

            GridCheckboxSyncDataToSelection(e, selecField);
        }

        function GridCheckboxToggleRowSelection(e, selecField) {
            var $parent = $(e.currentTarget.offsetParent);
            var $grid = $($parent.closest(".k-grid"));
            var grid = $grid.data("kendoGrid");

            var newValue = (e.target.checked == true);
            var row = $(e.target).closest("tr");
            var dataItem = grid.dataItem(row);
            dataItem.set(selecField, newValue);
        }

        function GridToggleSelectAllRows(e, selecField) {
            var $parent = $(e.currentTarget.offsetParent);
            var $grid = $($parent.closest(".k-grid"));
            var grid = $grid.data("kendoGrid");
            var newValue = (e.target.checked == true);

            var rows = grid.items();
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var dataItem = grid.dataItem(row);
                dataItem[selecField] = newValue;
                var $row = $(row);
                $row.toggleClass("k-state-selected", newValue);
                $row.find("input:checkbox").prop("checked", newValue);
            }
        }

        function createGridCheckbox(el, options, valueSelectionHandler) {
            var $el = $(el);
            var defOptions = {
                sortable: true,
                resizable: true,
                scrollable: true,
                selectable: "multiple, row",  //utilizamos checkbox
                culture: localStorage.getItem('idiomaSeleccionado'),
                filterable: gridFilterable(),
                pageable: gridPageable()
            };

            if (options.columns) {
                var checkboxColumnOptions = {
                    columnOptions: {
                        title: T('SELECCIONAR_TODO'),
                        headerTemplate: '<input class="columna-checkbox-header-all" type="checkbox"/>',
                        headerAttributes: { 'class': 'columna-checkbox-header' },
                        width: 25
                    },
                    valueField: selectionDataField
                };
                var checkboxColumn = createGridColumnCheckbox(checkboxColumnOptions);
                options.columns.unshift(checkboxColumn);
            }

            var overrideOptions = {
                change: function (e, args) {
                    GridCheckboxSyncSelectionToData(e, selectionDataField, valueSelectionHandler);
                    if (options && options.change) {
                        options.change(e);
                    }
                },
                dataBound: function (e) {
                    GridCheckboxSyncDataToSelection(e, selectionDataField);
                    if (options && options.dataBound) {
                        options.dataBound(e);
                    }
                }
            };

            var kOptions = $.extend(true, {}, defOptions, options, overrideOptions);
            $el.kendoGrid(kOptions);

            $el.on('click', '.columna-checkbox', function (e) {
                GridCheckboxToggleRowSelection(e, selectionDataField);
            });
            $el.on('click', '.columna-checkbox-header > input[type=checkbox]', function (e) {
                GridToggleSelectAllRows(e, selectionDataField);
            });

            return $el.data('kendoGrid');
        }
        ///////////////////////////////

        function createDataSourceFields(campos) {
            var dataSourceFields = {
                'datetime': {
                    type: 'date',
                    parseFormats: [FORMAT_SQLDATETIME, FORMAT_DATETIME]
                },
                'date': {
                    type: 'date',
                    parseFormats: [FORMAT_SQLDATETIME, FORMAT_DATE]
                },
                'time': {
                    type: 'date',
                    parseFormats: [FORMAT_SQLDATETIME, FORMAT_TIME]
                },
                'quantity': {
                    type: 'number',
                    format: KFORMAT_QUANTITY
                },
                'integer': {
                    type: 'number',
                    format: KFORMAT_INTEGER
                }
            };

            var fields = {};
            $.each(campos, function (idx, item) {
                var type = item.type || 'string';
                var defaultTypeOptions = dataSourceFields[type] || { type: type };
                var overrideOptions = item.kDs || {};

                var d = $.extend(true, defaultTypeOptions, overrideOptions);
                fields[item.name] = d;
            });

            return fields;
        }

        function createGridColumnCheckbox(options) {
            var columnOptions = options.columnOptions || {};
            var valueField = options.valueField;
            var checkboxAttributes = options.checkboxAttributes;

            // Convertir los key/value de checkboxAttributes en una lista '"key": "value"'
            // que se pueda insertar en la template de mas abajo
            var attrList = [];
            if (checkboxAttributes) {
                var keys = Object.keys(checkboxAttributes);
                attrList = $.map(keys, function (attrName) {
                    var attrValue = checkboxAttributes[attrName];
                    // if (attrName === 'class') {
                    //   attrValue += ' columna-checkbox';
                    // }
                    return (attrValue ? attrName + '="' + attrValue + '"' : '');
                });
            } else {
                // attrList.push('class="columna-checkbox"');
            }

            var checkedAttr = '';
            switch (typeof (valueField)) {
                case 'string': // Es el nombre del field que contiene el valor
                    checkedAttr = ' #= (data.' + valueField + ') ? "checked=checked" : "" #'
                    break;
                case 'boolean':
                    checkedAttr = (valueField ? ' checked=checked' : '');
                    break;
            }

            var defaultConfig = {
                attributes: {
                    'class': 'columna-checkbox',
                    'style': 'text-align:center;'
                },
                template: '<input type="checkbox" ' + attrList.join(' ') + checkedAttr + '></input>'
            };

            return $.extend(true, {}, defaultConfig, columnOptions);
        }

        function createGridColumns(campos) {
            var dataGridFields = {
                'string': {

                },
                'datetime': {
                    kGrid: {
                        format: KFORMAT_DATETIME,
                        filterable: { ui: 'datetimepicker' }
                    }
                },
                'date': {
                    kGrid: {
                        format: KFORMAT_DATE,
                        filterable: { ui: 'datepicker' }
                    }
                },
                'time': {
                    kGrid: {
                        format: KFORMAT_TIME,
                        filterable: { ui: 'timepicker' }
                    }
                },
                'quantity': {
                    align: 'right',
                    kGrid: {
                        format: KFORMAT_QUANTITY,
                        filterable: {
                            ui: function (element) {
                                element.kendoNumericTextBox({
                                    format: KFORMAT_QUANTITY,
                                    culture: localStorage.getItem('idiomaSeleccionado')
                                });
                            }
                        }
                    }
                },
                'integer': {
                    kGrid: {
                        format: KFORMAT_INTEGER,
                        ui: function (element) {
                            element.kendoNumericTextBox({
                                format: KFORMAT_INTEGER,
                                culture: localStorage.getItem('idiomaSeleccionado')
                            });
                        }
                    }
                }
            };

            var columns = $.map(campos, function (item) {
                var type = item.type || 'string';

                var defaultTypeOptions = dataGridFields[type] || {};
                item = $.extend(true, {}, defaultTypeOptions, item);

                var textAlign = (item.align ? 'text-align:' + item.align + ';' : undefined);
                var column = {
                    field: item.name,
                    title: (
                        item.i18n !== undefined
                            ? (
                                typeof item.i18n === 'function'
                                    ? item.i18n()
                                    : T(item.i18n)
                            )
                            : item.text
                    ),
                    width: item.width,
                    headerAttributes: {
                        'style': textAlign
                    },
                    attributes: {
                        'class': item.cssClass,
                        'style': textAlign
                    },
                    footerAttributes: {
                        'style': textAlign
                    },
                };

                var overrideOptions = item.kGrid || {};
                return $.extend(true, {}, column, overrideOptions);
            });

            return columns;
        }

        function createDatePickerFecha(el, value) {
            var $el = $(el);

            $el.kendoDatePicker({
                value: value,
                format: FORMAT_DATE,
                culture: localStorage.getItem('idiomaSeleccionado'),
                weekNumber: true
            });

            return $el.data('kendoDatePicker');
        }

        function createTimePicker(el, value) {
            var $el = $(el);

            $el.kendoTimePicker({
                value: value,
                format: KFORMAT_TIME,
                culture: localStorage.getItem('idiomaSeleccionado')
            });

            return $(el).data('kendoTimePicker');
        }

        function initDatePickerRange(dpStart, dpEnd) {
            function startChange() {
                var startDate = dpStart.value();
                var endDate = dpEnd.value();

                if (startDate) {
                    startDate = new Date(startDate);
                    startDate.setDate(startDate.getDate());
                    dpEnd.min(startDate);
                } else if (endDate) {
                    dpStart.max(new Date(endDate));
                } else {
                    endDate = new Date();
                    dpStart.max(endDate);
                    dpEnd.min(endDate);
                }
            }

            function endChange() {
                var startDate = dpStart.value();
                var endDate = dpEnd.value();

                if (endDate) {
                    endDate = new Date(endDate);
                    endDate.setDate(endDate.getDate());
                    dpStart.max(endDate);
                } else if (startDate) {
                    dpEnd.min(new Date(startDate));
                } else {
                    endDate = new Date();
                    dpStart.max(endDate);
                    dpEnd.min(endDate);
                }
            }

            dpStart.bind("change", startChange);
            dpEnd.bind("change", endChange);
            dpStart.max(dpEnd.value());
            dpEnd.min(dpStart.value());
        }

        function GridButtonPedirConfirmacion(obj, keyTitulo, keyMsg, callbackFn) {
            var res = function (e) {
                e.preventDefault();

                var tr = $(e.target).closest('tr');
                var data = obj.dataItem(tr);
                obj.confirmacion = new VistaDlgConfirm({
                    titulo: T(keyTitulo),
                    msg: T(keyMsg),
                    funcion: callbackFn(data),
                    contexto: obj
                });
            };
            return res;
        }

        function applyGridButtonSecurity(gridSelector, securityRules) {
            var $grid = $(gridSelector);
            var grid = $grid.data('kendoGrid');
            var $rowgroup = $($grid.find('[role=rowgroup]'));
            var rows = $rowgroup.find('tr[role=row]');
            var btnList = [];

            $.each(securityRules, function (_, rule) {
                var selector = rule.selector;
                var roleField = rule.roleField;
                var defaultRole = rule.defaultRole;

                $.each(rows, function (idx, row) {
                    var data = grid.dataItem(row);
                    var role = (roleField ? data[roleField] : undefined) || defaultRole;
                    if (role) {
                        var button = $(row).find(selector);
                        $(button).attr('data-funcion', role);
                        btnList.push(button);
                    }
                });
            });


            $(btnList).checkSecurity();
        }

        //function createParamGrid(selector, title, readFn, updateFn) {//, validationFn) {
        //  var $el = $(selector);
        //  var dataSource = new kendo.data.DataSource({
        //    schema: {
        //      model: {
        //        id: 'id',
        //        fields: {
        //          id: { type: 'string', editable: false },
        //          param: { type: 'string', editable: false },
        //          type: { type: 'string', editable: false },
        //          role: { type: 'string', editable: false },
        //          value: {
        //            //validation: {
        //            //  required: true, 
        //            //  valuevalidation: function (input) {
        //            //    if (input.is("[name='value']") && input.val() != "") {
        //            //      var item =  input[0].kendoBindingTarget.source;
        //            //      function setMsg(text) {
        //            //        input.attr("data-valuevalidation-msg", text);
        //            //      }
        //            //      return validationFn(item, setMsg, input);
        //            //    }

        //            //    return true;
        //            //  }
        //            //}
        //          }
        //        }
        //      }
        //    },
        //    //batch: true,
        //    transport: {
        //      read: readFn,
        //      update: function (options) {
        //        kendo.ui.progress($el, true);

        //        var wrappedOptions = $.extend({}, options);
        //        wrappedOptions.success = function (result) {
        //          kendo.ui.progress($el, false);
        //          options.success(result);
        //        };
        //        wrappedOptions.error = function (result) {
        //          kendo.ui.progress($el, false);
        //          options.error(result);
        //        };

        //        updateFn(wrappedOptions);
        //      }
        //    }
        //  });

        //  var grid = $el.kendoGrid({
        //    resizable: true,
        //    dataSource: dataSource,
        //    scrollable: true,
        //    culture: localStorage.getItem('idiomaSeleccionado'),
        //    toolbar: 
        //      '<div class="toolbar-titulo"><label>' + kendo.htmlEncode(title) + '</label>' 
        //      + '<div style="display:inline-block;float:right;">' 
        //        + '<a href="\\#" class="k-pager-refresh k-link k-button"><span class="k-icon k-i-refresh"></span></a>'
        //      + '</div>'
        //    + '</div>',
        //    columns: [
        //      { field: "param", title: T('PARAMETRO') },
        //      { field: "type", hidden: true },
        //      { field: "role", hidden: true },
        //      { field: "value", title: T('VALOR'),
        //        template: chooseTemplate,
        //        editor: chooseEditor
        //      },
        //      { title: ' ',
        //        width: 240,
        //        attributes: { 'style': 'text-align: center' },
        //        command: [{
        //          name: 'edit',
        //          text: {
        //            edit: T('EDITAR'),
        //            update: T('ACTUALIZAR'),
        //            cancel: T('CANCELAR')
        //          }
        //        }]
        //      }
        //    ],
        //    editable: 'inline',
        //    dataBound: function (e) {
        //      applyGridButtonSecurity(e.sender.element, [{ selector: '.k-grid-edit', roleField: 'role' }]);
        //    }
        //  // });
        //  }).data('kendoGrid');

        //  $el.find(".k-grid-toolbar").on("click", ".k-pager-refresh", function (e) {
        //    e.preventDefault();
        //    grid.dataSource.read();
        //  });

        //  // Ocultar cabecera y paginacion
        //  $el.children('.k-grid-header, .k-grid-pager')
        //    .hide().height(0).css({ "margin": "0", "padding": "0" });
        //  $el.kendoTooltip({ filter: 'th' });

        //  return grid;
        //};

        function resizeTabStrip(selector) {
            var $el = $(selector);

            var newWidth = $el.width();
            // Remove TabStrip Items from available height
            var tabStripItemsHeight = $el.children('.k-tabstrip-items').outerHeight(true);
            var newHeight = $el.height() - tabStripItemsHeight - 2;

            // Resize (visible) tab contents with the new space
            $el.children('.k-content').filter(':visible').each(function () {
                var $el = $(this);

                // Remove possible margin, padding and border that uses content
                // before setting new size
                var hspace = ($el.outerWidth(true) - $el.width());
                $el.width(Math.floor(newWidth - hspace));
                var vspace = ($el.outerHeight(true) - $el.height());
                $el.height(Math.floor(newHeight - vspace));

                resizeChildren(this);
            });
        }

        function createTabStrip(selector, options) {
            var defaultOptions = {
                activate: function () {
                    resizeTabStrip(this.wrapper);
                },
                animation: {
                    open: {
                        effects: "fadeIn"
                    }
                }
            };
            var $tabstrip = $(selector).kendoTabStrip($.extend(true, {}, defaultOptions, options));
            $tabstrip.css('height', '100%').parent().css('height', '100%');

            return $tabstrip.data('kendoTabStrip');
        }

        function resizeChildren(selector) {
            $(selector)
                .find('.k-tabstrip, .k-splitter, .k-grid') // Ampliar a aquellos widgets de kendo que necesitan resize manual
                .filter(':visible').each(function () {
                    var $el = $(this);

                    if ($el.hasClass('k-tabstrip')) {
                        resizeTabStrip(this);
                    } else {
                        kendo.resize($el);
                    }
                });
        }

        function createSplitter(selector, orientation, paneSizes) {
            var panes = paneSizes.map(function (paneSize) {
                return {
                    size: paneSize,
                    scrollable: false, collapsible: true, resizable: true
                };
            });

            var $el = $(selector).kendoSplitter({
                orientation: orientation,
                panes: panes,
                resize: function () {
                    resizeChildren(this.wrapper);
                }
            });

            return $el.data('kendoSplitter');
        }

        function createVSplitter(selector, paneSizes) {
            return createSplitter(selector, 'vertical', paneSizes);
        }

        function createHSplitter(selector, paneSizes) {
            return createSplitter(selector, 'horizontal', paneSizes);
        }

        function enableResizeCenterPane() {
            var splitter = $("#vertical").data("kendoSplitter");
            splitter.bind("resize", function () {
                resizeChildren('#vertical');
            });
            splitter = $("#horizontal").data("kendoSplitter");
            splitter.bind("resize", function () {
                resizeChildren('#horizontal');
            });
            resizeChildren('#center-pane');
        }

        var date = {
            diasSemana: [],
            // Returns the ISO week of the date.
            getISOWeek: function (d) {
                var date = new Date(d.getTime());
                date.setHours(0, 0, 0, 0);
                // Thursday in current week decides the year.
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                // January 4 is always in week 1.
                var week1 = new Date(date.getFullYear(), 0, 4);
                // Adjust to Thursday in week 1 and count number of weeks from date to week1.
                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 -
                    3 + (week1.getDay() + 6) % 7) / 7);
            },
            // Returns the four-digit year corresponding to the ISO week of the date.
            getISOWeekYear: function (d) {
                var date = new Date(d.getTime());
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                return date.getFullYear();
            },

            setTimezoneToUTC: function (date) {
                return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            },

            convertToUTC: function (date) {
                return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            }
        };

        //date.getDiasSemana = function () {
        //  if (date.diasSemana.length === 0) {
        //    ajaxApiSync('../api/GetDiasSemana')
        //    .done(function (result) {
        //      // Mover el domingo al final
        //      date.diasSemana = result.slice(1);
        //      date.diasSemana.push(result[0]);
        //    }).fail(function (result) {
        //      date.diasSemana = [];
        //      NotificaError(result);
        //    });
        //  }

        //  return date.diasSemana;
        //};

        var text = {
            FORMAT_TIME: FORMAT_TIME,
            KFORMAT_TIME: KFORMAT_TIME,
            FORMAT_DATE: FORMAT_DATE,
            KFORMAT_DATE: KFORMAT_DATE,
            FORMAT_DATETIME: FORMAT_DATETIME,
            KFORMAT_DATETIME: KFORMAT_DATETIME,
            FORMAT_SQLDATETIME: FORMAT_SQLDATETIME,
            FORMAT_QUANTITY: FORMAT_QUANTITY,
            KFORMAT_QUANTITY: KFORMAT_QUANTITY,
            FORMAT_INTEGER: FORMAT_INTEGER,
            KFORMAT_INTEGER: KFORMAT_INTEGER,

            fromSQLDateString: fromSQLDateString,
            toSQLDateString: toSQLDateString,
            toSQLDateStringUTC: function (d) {
                var utc = date.convertToUTC(d);
                return toSQLDateString(utc);
            }
        };

        var ui = {
            T: T,
            CfgKendo: window.app.cfgKendo,

            limpiarFiltrosGrid: limpiarFiltrosGrid,
            gridSaveAsExcel: gridSaveAsExcel,
            eliminar: eliminarBackboneView,
            eliminarBackboneView: eliminarBackboneView,

            NotificaCorrecto: NotificaCorrecto,
            NotificaAviso: NotificaAviso,
            NotificaError: NotificaError,

            loadTemplate: loadTemplate,
            createNumericField: createNumericField,
            createQuantityField: createQuantityField,
            createCombo: createCombo,
            createComboTextTemplate: createComboTextTemplate,
            createGrid: createGrid,
            createGridCheckbox: createGridCheckbox,
            createDataSourceFields: createDataSourceFields,
            createGridColumnCheckbox: createGridColumnCheckbox,
            createGridColumns: createGridColumns,
            createDatePickerFecha: createDatePickerFecha,
            createTimePicker: createTimePicker,
            applyGridButtonSecurity: applyGridButtonSecurity,
            //createParamGrid: createParamGrid,
            initDatePickerRange: initDatePickerRange,

            GridButtonPedirConfirmacion: GridButtonPedirConfirmacion,

            resizeTabStrip: resizeTabStrip,
            createTabStrip: createTabStrip,
            resizeChildren: resizeChildren,
            createVSplitter: createVSplitter,
            createHSplitter: createHSplitter,
            enableResizeCenterPane: enableResizeCenterPane,

            default: {
                gridPageSizes: gridPageSizes,
                gridExcel: gridExcel,
                gridExcelDate: gridExcelDate,
                gridPageable: gridPageable,
                gridFilterable: gridFilterable,
                excelCellEvenRow: {
                    background: '#f1f1f1'
                }
            }
        };

        var api = {
            ajaxApi: ajaxApi,
            ajaxApiSync: ajaxApiSync
        };

        //function comboEditor(container, options, valueField, textField, ds, optLabel) {
        //  var el = $('<input name="' + options.field + '"/>')
        //  .appendTo(container)
        //  .kendoComboBox({
        //    valuePrimitive: true, //N.B. this is needed to have correct behavior when the initial value can be null
        //    dataTextField: textField,
        //    dataValueField: valueField,
        //    dataSource: ds,
        //    optionLabel: optLabel,
        //    change: function (e) {
        //      var d = e.sender.dataItem();
        //      if (d) {
        //        options.model.set("result", +d[valueField]);
        //      } else {
        //        options.model.set("result", null); //+e.sender.element.context.value
        //      }
        //    }
        //  });
        //}

        //function dropdownEditor(container, options, valueField, textField, ds, optLabel) {
        //  var el = $('<input name="' + options.field + '"/>')
        //  .appendTo(container)
        //  .kendoDropDownList({
        //    dataTextField: textField,
        //    dataValueField: valueField,
        //    dataSource: ds,
        //    optionLabel: optLabel
        //  });
        //}

        //function weekdayEditor (container, options) {
        //  var dsDiasSemana = new kendo.data.DataSource({
        //    data: date.getDiasSemana() //self.diasSemana
        //  });
        //  dropdownEditor(container, options, 'id', 'dia', dsDiasSemana, { id: null, dia: T('SELEC_DIA') });
        //}

        //function timeEditor(container, options) {
        //  $('<input name="' + options.field + '"/>')
        //  .appendTo(container)
        //  .kendoTimePicker({
        //    format: KFORMAT_TIME,
        //    culture: localStorage.getItem('idiomaSeleccionado'),
        //    change: function (e) {
        //      options.model.set("result", e.sender.value() || 1);
        //    }
        //  });
        //}

        //function integerEditor(container, options) {
        //  $('<input name="' + options.field + '"/>')
        //  .appendTo(container)
        //  .kendoNumericTextBox({
        //    culture: localStorage.getItem('idiomaSeleccionado'),
        //    decimals: 0,
        //    format: 'n0',
        //    min: 0,
        //    max: options.model.id == 'limiteDias' ? null : 100,
        //    placeholder: T('INTRODUZCA_UN_VALOR'),
        //    restrictDecimals: true,
        //    change: function (e) {
        //      if (e.sender.value() == null) {
        //        options.model.set("result", null);
        //      } else {
        //        options.model.set("result", e.sender.value());
        //      }
        //    }
        //  });
        //}

        //function textEditor(container, options) {
        //  $('<input type="text" name="' + options.field + '"/>')
        //  .addClass('k-input k-textbox')
        //  .appendTo(container)
        //  .blur(function(e) {
        //    if (e.originalEvent.target.value) {
        //      options.model.set("result", 1);
        //    } else {
        //      options.model.set("result", null);
        //    }
        //  });
        //}

        //function chooseEditor(container, options) {
        //  switch (options.model.type) {
        //    case "weekday":
        //      weekdayEditor(container, options);
        //      break;
        //    case "time":
        //      timeEditor(container, options);
        //      break;
        //    case "integer":
        //      integerEditor(container, options);
        //      break;
        //    default:
        //      textEditor(container, options);
        //      break;
        //  }
        //}

        //function chooseTemplate (data) {
        //  var type = data.type;
        //  var value = data.value;
        //  if (value == null)
        //    return "";

        //  var diasSemana = date.getDiasSemana();
        //  switch (type) {
        //    case "date":
        //      return kendo.toString(kendo.parseInt(value), FORMAT_DATE);
        //    case "time":
        //      return kendo.toString(kendo.parseDate(value), FORMAT_TIME);
        //    case "weekday":
        //      for (var i = 0; i < diasSemana.length; i++) {
        //        var s = diasSemana[i];
        //        if (s.id === +value) {
        //          return s.dia;
        //        }
        //      }
        //    default:
        //      return value;
        //  }
        //}

        //ui.chooseEditor = chooseEditor;
        //ui.chooseTemplate = chooseTemplate;

        return {
            text: text,
            ui: ui,
            date: date,
            api: api
        };
    });