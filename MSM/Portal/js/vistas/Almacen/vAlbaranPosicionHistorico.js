define(['jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'ALT/vAltFormComponent'],
     function ($, Not, VistaDlgConfirm, VistaFormComponent) {
         var albaranPosicion = {

             //1. Metodo que actualiza el grid de albaran posición
             ActualizarAlbaranPosicion: function (container, options, attrCamionesTransito) {
                 var permiso = false;
                 for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                     if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                         permiso = true;
                 }

                 if (!permiso) {
                     Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                 } else {
                     var _uid = container.currentTarget.className.split(" ")[4];
                     var row = attrCamionesTransito.gridAlbaranPosicion.tbody.find("tr[data-uid='" + _uid + "']");

                     //Se obtiene la fila que se va a modificar, se obtiene el indice y se forza a llamar al evento de actualizar
                     var dataItem = attrCamionesTransito.gridAlbaranPosicion.dataItems()[row[0].rowIndex];
                     if (typeof dataItem.id !== 'undefined') {
                         if (typeof dataItem !== 'undefined') {
                             dataItem.set('EditRow', dataItem.EditRow + 1);
                             this.dsDeliveryNotes.sync();
                             attrCamionesTransito.gridAlbaranPosicion.refresh();
                         }

                     } else {
                         this.dsDeliveryNotes.sync();
                     }
                 }
             },

             //3. Metodo que setea el DataSource de Albaran Posición
             DataSourceDeliveryNotes: function (id, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 var tooltip = kendo.template($("#tooltip").html());
                 attrCamionesTransito.dsDeliveryNotes = new kendo.data.DataSource({
                     autoSync: false,
                     pageSize: 10,
                     transport: {
                         read: {
                             url: "../api/GetDeliveryNotes/" + id + "/" + attrCamionesTransito.TipoAlbaran,
                             dataType: "json"
                         },

                         update: {
                             url: "../api/UpdateDeliveryNotes",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json",
                             type: "PUT",
                             complete: function (e) {

                                 var gridTran = $("#gridTransportes").data("kendoGrid");
                                 gridTran.dataSource.read();


                             }

                         },
                         create: {
                             url: "../api/AddDeliveryNotes",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json",
                             type: "POST",

                         },
                         destroy: {
                             url: "../api/DeleteDeliveryNote",
                             type: "PUT",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json",
                             complete: function (e) {
                                 // e.preventDefault();
                                 if (e.status == 500) {
                                     Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_ALBARAN_POSICION"), 4000);
                                 }


                                 if ($("#gridTransportes").data("kendoGrid").select() != null) {


                                     $("#gridTransportes").data("kendoGrid").select($("#gridTransportes").data("kendoGrid").select())


                                 } else {
                                     attrCamionesTransito.gridAlbaranPosicion.dataSource.read();

                                 }

                             }
                         },
                         parameterMap: function (options, operation) {
                             if (operation !== "read" && options) {
                                 if (typeof options.Material.IdMaterial != 'undefined') {
                                     if (operation == "destroy") {
                                         return JSON.stringify(options);
                                     }
                                     else {
                                         var _valueOA = $("#txtOA").data("kendoComboBox").text();
                                         var _valueTxtOA = $("#txtTipoOA").val();
                                         if (options.TipoOrdenAprovisionamiento == null) {
                                             options.TipoOrdenAprovisionamiento = {
                                                 Tipo: "",
                                                 IdTipoOrdenAprovisionamiento: 0
                                             }
                                         }
                                         if ((options.TipoOrdenAprovisionamiento.Tipo == "OA" && _valueOA == "" && _valueTxtOA == "")) {

                                             Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LA_ORDEN_DE'), 4000);


                                         } else {
                                             options.IdTransporte = id;
                                             options.IdTipoAlbaran = attrCamionesTransito.TipoAlbaran;
                                             options.IdAlbaran = attrCamionesTransito.IdAlbaran;
                                             if (options.TipoOrdenAprovisionamiento != null) {
                                                 if (options.TipoOrdenAprovisionamiento.Tipo != "OA" && operation == "update") {
                                                     options.OrdenAprovisionamiento.Descripcion = $("#txtTipoOA").val();
                                                 } else if (options.TipoOrdenAprovisionamiento.Tipo != "OA" && operation == "create") {
                                                     options.OrdenAprovisionamiento.Descripcion = $("#txtTipoOA").val();
                                                     options.OrdenAprovisionamiento.IdOrdenAprovisionamiento = 0;
                                                 } else if (options.TipoOrdenAprovisionamiento.Tipo == "OA" && (operation == "create" || operation == "update")) {
                                                     if ($("#txtTipoOA").is(":visible")) {
                                                         options.OrdenAprovisionamiento.Descripcion = _valueTxtOA;
                                                         options.OrdenAprovisionamiento.IdOrdenAprovisionamiento = _valueTxtOA;
                                                     }
                                                     else {
                                                         if (options.OrdenAprovisionamiento.Descripcion != undefined) {
                                                             options.OrdenAprovisionamiento.Descripcion = _valueOA;
                                                             options.OrdenAprovisionamiento.IdOrdenAprovisionamiento = _valueOA;
                                                         } else {
                                                             options.OrdenAprovisionamiento = {
                                                                 Descripcion: _valueOA,
                                                                 IdOrdenAprovisionamiento: _valueOA
                                                             }
                                                         }
                                                     }

                                                 }
                                             }
                                             options.IdLote = "";
                                             for (var i = 0; i < attrCamionesTransito.registrosSelData.length; i++) {
                                                 options.IdLote += attrCamionesTransito.registrosSelData[i].IdLote;
                                                 if (i < attrCamionesTransito.registrosSelData.length - 1) {
                                                     options.IdLote += ",";
                                                 }
                                             }
                                             attrCamionesTransito.registrosSelData = [];
                                             return JSON.stringify(options);
                                         }
                                     }
                                 }


                             }
                         }

                     },
                     requestStart: function () {
                         kendo.ui.progress($("#gridAlbaranEntrada"), true);
                         kendo.ui.progress($("#gridAlbaranSalida"), true);
                         $(".k-grid-updateRecepcionadoAlbaranEntrada").hide()
                     },
                     requestEnd: function (e) {
                         e.sender._destroyed = [];
                         kendo.ui.progress($("#gridAlbaranEntrada"), false);
                         kendo.ui.progress($("#gridAlbaranSalida"), false);
                         var response = e.response;
                         var type = e.type;


                         //Se modifican los datos del grid de transportes 
                         if (typeof type !== 'undefined' && type !== "read") {
                             attrCamionesTransito.gridAlbaranPosicion.dataSource.read();
                             var _countGridAlbaran = attrCamionesTransito.gridAlbaranPosicion.dataSource.view().length;
                             var _pestania = $("#divPestanias").data("kendoTabStrip");

                             //Si se está eliminando y no tiene albaranPosicion, se setean los valores del grid de transporte a 0 
                             //  se desbloquean las dos pestañas de "Albaran Entrada" y "Albaran Salida"
                             if (type === "destroy") {
                                 var grid = $("#gridTransportes").data("kendoGrid");
                                 var selectedItem = grid.dataItem(grid.select());
                                 if (selectedItem != null && _countGridAlbaran == 0) {
                                     selectedItem.IdAlbaran = 0;
                                     attrCamionesTransito.IdAlbaran = 0;
                                     attrCamionesTransito.IdTipoAlbaran = 0;
                                     _pestania.enable(_pestania.tabGroup.children().eq(2));
                                     _pestania.enable(_pestania.tabGroup.children().eq(3));



                                 }
                                 grid.dataSource.read()
                             }

                                 // Si se está creando un nuevo Albaran Posicion se setean los valores del grid de transporte 
                                 // y se verifica en que pestaña se encuentra para bloquear la otra.
                             else if (type === "create") {
                                 var grid = $("#gridTransportes").data("kendoGrid");
                                 var selectedItem = grid.dataItem(grid.select());
                                 if (selectedItem != null) {
                                     selectedItem.IdAlbaran = response.IdAlbaran;
                                     attrCamionesTransito.IdAlbaran = response.IdAlbaran;
                                     selectedItem.IdAlbaran = response.IdTipoAlbaran;
                                     if (attrCamionesTransito.itemSelectedGrid == "li_3") {
                                         _pestania.disable(_pestania.tabGroup.children().eq(3));
                                     } else if (attrCamionesTransito.itemSelectedGrid == "li_4") {
                                         _pestania.disable(_pestania.tabGroup.children().eq(2));
                                     }
                                     grid.dataSource.read()
                                 }

                             }
                         }

                     },
                     schema: {
                         model: {
                             id: "IdAlbaran",
                             fields: {
                                 "IdLote": { type: "string", editable: true },
                                 "IdAlbaran": { type: "number", editable: false },
                                 "AlbaranPosicion": { editable: false },
                                 "IdAlbaranPosicion": { editable: false },
                                 "Material.IdMaterial": { type: "number", editable: false },
                                 "Material": {
                                     defaultValue: {
                                         IdMaterial: 0,
                                         DescripcionCompleta: ""
                                     },
                                     editable: false
                                 },
                                 "Material.UnidadMedidaDto": {
                                     defaultValue: { PK: 0, SourceUoMID: "" },
                                     validation: {
                                         required: true,
                                         cutomMaterialUnidadMedidaDto: function (input) {
                                             if (input.attr("data-bind") == "value:Material.UnidadMedidaDto" && input.val() == 0) {
                                                 input.attr("data-cutomMaterialUnidadMedidaDto-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                 input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                 return false;
                                             }
                                             return true;
                                         }
                                     }
                                 },
                                 "Cantidad": { type: "number", validation: { required: true } },
                                 "CantidadInicial": { type: "number", editable: false },
                                 "CantidadActual": { type: "number", editable: false },
                                 "INSP": { type: "string" },
                                 "Lote": { editable: false },
                                 "OrdenAprovisionamiento": {
                                     defaultValue: {
                                         IdOrdenAprovisionamiento: 0,
                                         Descripcion: ""
                                     },
                                 },
                                 "TipoOrdenAprovisionamiento": {
                                     defaultValue: { IdTipoOrdenAprovisionamiento: 0, Tipo: "" },
                                 }
                             }

                         }
                     },
                     change: function (e) {
                         if (e.action === "itemchange" && e.field === "Material") {
                             var model = e.items[0],
                                 type = model.Type,
                                 currentValue = model.Material.SourceUoMID;


                             //_dataExterna.dsUnidadMedida.read();
                             if (currentValue !== model['Material.SourceUoMID']) {
                                 attrCamionesTransito.idMaterial = model.Material.IdMaterial;
                                 model.Material.SourceUoMID = currentValue;

                                 $("[name='slMaterial.UnidadMedidaDto']").data("kendoDropDownList").setDataSource(_mAlbaranPosicion.DataSourceUnidadesMedida(attrCamionesTransito));
                                 $("[name='slMaterial.UnidadMedidaDto']").data("kendoDropDownList").select(1);
                                 //_dsUnidad.read();
                                 //$("#gridAlbaranEntrada").find("tr[data-uid='" + model.uid + "'] td:eq(4)").text(currentValue);
                             }
                         }
                     },
                 });



             },

             //4. Metodo que obtiene el datasource de ubicaciones
             DataSourceLocation: function () {
                 var _item = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
                 var _isGranel = _item.IsGranel ? 1 : 2;
                 //var _idAlmacen = typeof idAlmacen != 'undefined' ? idAlmacen : 0;
                 //var _idZona = typeof idZona != 'undefined' ? idZona : 0;
                 return new kendo.data.DataSource({
                     batch: true,
                     transport: {
                         read: {
                             url: "../api/GetDataAutoCompleteUbicacion/Interna?isGranel=" + _isGranel,
                             dataType: "json",
                             cache: false
                         }

                     },
                     schema: {
                         model: {
                             id: "ID",
                             fields: {
                                 'ID': { type: "number" },
                                 'Nombre': { type: "string" },
                                 'Tipo': { type: "string" },
                             }
                         }
                     }
                 });
             },

             //6. Metodo que obtiene el datasource de las unidades de medida
             DataSourceUnidadesMedida: function (attrCamionesTransito) {
                 attrCamionesTransito.dsUnidadMedida = new kendo.data.DataSource({
                     batch: true,
                     transport: {
                         read: {
                             url: "../api/GetUnidadMedida/" + attrCamionesTransito.idMaterial,
                             dataType: "json",
                             cache: false
                         },
                         schema: {
                             model: {
                                 id: "PK",
                                 fields: {
                                     'PK': { type: "int" },
                                     'SourceUoMID': { type: "string" },
                                 }
                             }
                         }

                     }
                 });
                 return attrCamionesTransito.dsUnidadMedida;
             },

             //7. Metodo que obtiene el datasource de los lotes de segun el id de albaran posicion
             DataSourceReceptionDeliveryNote: function (idMaterial, idAlbaranPosicion, descMaterial, unidadMedida, TipoAlbaran, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 var tooltip = new kendo.template($("#tooltipReception").html());
                 var _itemTransporte = attrCamionesTransito.gridTransportes.dataItem(attrCamionesTransito.gridTransportes.select());
                 var _uriGet = TipoAlbaran == 1 ? "GetReceptionDeliveryNotes" + "/" + idAlbaranPosicion : "GetAllReceptionDeliveryNotes" + "/" + idMaterial;

                 attrCamionesTransito.dsReceptionDeliveryNotes = new kendo.data.DataSource({
                     batch: true,
                     async: false,
                     pageSize: 10,
                     transport: {
                         read: {
                             url: "../api/" + _uriGet,
                             dataType: "json"
                         },

                         update: {
                             url: "../api/UpdateReceptionDeliveryNotes",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json",
                             type: "PUT",


                         },
                         create: {
                             url: "../api/AddReceptionDeliveryNotes",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json",
                             type: "POST",

                         },
                         destroy: {
                             url: "../api/DeleteReceptionDeliveryNote",
                             type: "PUT",
                             contentType: 'application/json;charset=utf-8',
                             dataType: "json"
                         },

                         parameterMap: function (options, operation) {
                             if (operation !== "read") {
                                 var permiso = false;
                                 for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                                     if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                                         permiso = true;
                                 }
                                 if (!permiso) {
                                     Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                 } else {
                                     var _gridSelect = attrCamionesTransito.gridTransportes.select();
                                     var _transporte = _gridSelect != null && _gridSelect != undefined ? attrCamionesTransito.gridTransportes.dataItem(_gridSelect) : null;
                                     if (_transporte != null && _transporte != undefined) {
                                         if (typeof options.models !== 'undefined') {
                                             if (options.models[0].SSCC == undefined && !_itemTransporte.IsGranel) {
                                                 Not.crearNotificacion('info', window.app.idioma.t('ERROR'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 3000);
                                             } else {
                                                 options.models[0].IdAlbaranPosicion = idAlbaranPosicion;
                                                 options.models[0].IdTransporte = _transporte.IdTransporte;
                                                 options.models[0].IdMaterial = idMaterial;
                                                 options.models[0].IdAlbaran = _transporte.IdAlbaran;
                                                 options.models[0].ListPropiedadesExtendidas = attrCamionesTransito.propExtend;
                                                 options.models[0].IsGranel = _transporte.IsGranel;
                                                 if (options.models[0].Ubicacion.IdUbicacionLinkMes == undefined) {
                                                     if (options.models[0].Ubicacion != "" && operation == "update") {
                                                         options.models[0].Ubicacion.IdUbicacion = options.models[0].Ubicacion.ID;
                                                         options.models[0].Ubicacion.IdUbicacionLinkMes = options.models[0].Ubicacion.Tipo;
                                                     } else {
                                                         var _itemUbicacion = $("#ubicacionLote").data("kendoDropDownList").dataItem($("#ubicacionLote").data("kendoDropDownList").select());
                                                         options.models[0].Ubicacion = {
                                                             IdUbicacion: _itemUbicacion.ID,
                                                             IdUbicacionLinkMes: _itemUbicacion.Tipo
                                                         }
                                                     }
                                                 }
                                                 return JSON.stringify(options.models[0]);
                                             }
                                         } else {
                                             if (options.SSCC == undefined && !_itemTransporte.IsGranel) {
                                                 Not.crearNotificacion('info', window.app.idioma.t('ERROR'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 3000);
                                             } else {
                                                 options.IdAlbaran = idAlbaranPosicion;
                                                 options.IdTransporte = _transporte.IdTransporte;
                                                 options.IdMaterial = idMaterial;
                                                 options.IdAlbaranPosicion = idAlbaranPosicion;
                                                 options.IdAlbaran = _transporte.IdAlbaran;
                                                 options.ListPropiedadesExtendidas = attrCamionesTransito.propExtend;
                                                 options.IsGranel = _transporte.IsGranel;
                                                 if (options.models[0].Ubicacion.IdUbicacionLinkMes == undefined) {
                                                     var _itemUbicacion = $("#ubicacionLote").data("kendoDropDownList").dataItem($("#ubicacionLote").data("kendoDropDownList").select());
                                                     options.Ubicacion.IdUbicacion = _itemUbicacion.ID;
                                                     options.Ubicacion.IdUbicacionLinkMes = _itemUbicacion.Tipo;
                                                 }
                                                 return JSON.stringify(options);
                                             }
                                         }
                                     }
                                 }
                             }

                         }

                     },
                     requestStart: function () {
                         kendo.ui.progress($("#gridRecepcionAlbaranEntrada"), true);
                         $(".k-grid-updateRecepcionadoAlbaranEntrada").hide()
                     },
                     requestEnd: function (e) {
                         var response = e.response;
                         var type = e.type;

                         kendo.ui.progress($("#gridRecepcionAlbaranEntrada"), false);


                         if (typeof type !== 'undefined' && type !== "read") {
                             if (response != null) {
                                 if (type == "create") {
                                     if (response.ControlGestion01) {
                                         Not.crearNotificacion('warning', window.app.idioma.t('ERROR'), window.app.idioma.t(response.ControlGestion01), 3000);
                                     } else {
                                         Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_CORRECTAMENTE'), 3000);
                                         $("#gridTransportes").data("kendoGrid").dataSource.read();
                                     }
                                 } else if (type == "update") {
                                     Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 3000);
                                 } else if (type == "destroy") {
                                     $("#gridTransportes").data("kendoGrid").dataSource.read();
                                 }


                                 if ($("#gridTransportes").data("kendoGrid").select() != null) {
                                     $("#gridTransportes").data("kendoGrid").select($("#gridTransportes").data("kendoGrid").select())
                                 } else {
                                     attrCamionesTransito.gridAlbaranPosicion.dataSource.read();
                                 }
                                 $("#gridRecepcionAlbaranEntrada").data("kendoGrid").dataSource.read();
                             } else {
                                 Not.crearNotificacion('warning', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 3000);
                             }

                         }
                         $(".k-grid-updateRecepcionadoAlbaranEntrada").show();
                     },
                     change: function (e) {
                         kendo.ui.progress($("#gridRecepcionAlbaranEntrada"), false);
                     },
                     schema: {
                         model: {
                             id: "IdAlbaranPosicion",
                             fields: {
                                 "IdAlbaran": { type: "number", editable: false },
                                 "IsGranel": {},
                                 "IdAlbaranPosicion": { type: "number", editable: false },
                                 "IdMaterial": { type: "number", editable: false },
                                 "DescripcionCompleta": { type: "string", editable: false, defaultValue: attrCamionesTransito.descMaterial },
                                 "IdLote": { type: "string", editable: false },
                                 "LoteProveedor": {
                                     type: "string",
                                     validation: {
                                         required: {
                                             message: window.app.idioma.t('INTRODUCIR_LOTE')
                                         }

                                     }
                                 },
                                 "Seleccionar": { editable: false },
                                 "CantidadInicial": { type: "number"},
                                 "CantidadActual": { type: "number", editable: false },
                                 "SSCC": { type: "string" },//SSCC
                                 "UnidadesMedida": { type: "string", editable: false },
                                 "UnidadesMedidaDto": {
                                     defaultValue: { PK: 0, SourceUoMID: window.app.idioma.t('SELECCIONE_UNO') },
                                     editable: false
                                 },
                                 "Ubicacion": {
                                     editable: false

                                 },
                                 "ListPropiedadesExtendidas": {},
                                 "FechaCaducidad": {type: "date"}

                             }

                         }
                     }
                 });



             },

             //8. Metodo que obtiene el grid de los lotes de un albaran posicion
             GridReceptionDeliveryNote: function (attrCamionesTransito, cantidadAlbaranPosicion) {
                 var _mAlbaranPosicion = this;
                 attrCamionesTransito.gridReceptionDeliveryNotes = $("#gridRecepcionAlbaranEntrada").kendoGrid({
                     dataSource: attrCamionesTransito.dsReceptionDeliveryNotes,
                     filterable: {
                         extra: false,
                         messages: window.app.cfgKendo.configuracionFiltros_Msg,
                         operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                     },
                     resizable: true,
                     //autoSync: false,
                     //scrollable: true,
                     pageable: {
                         refresh: true,
                         pageSize: 10,
                         buttonCount: 4,
                     },
                     selectable: true,
                     editable: "popup",
                     //culture: localStorage.getItem("idiomaSeleccionado"),
                     //toolbar: [{ name: "create", text: window.app.idioma.t("AGREGAR"), hidden: true }],
                     noRecords: {
                         template: window.app.idioma.t("SIN_RESULTADOS")
                     },
                     columns: [
                          {
                              field: "chkColumn",
                              headerTemplate: '',
                              template: '<input class="checkbox" type="checkbox" id="chk_#=typeof IdLote !== "undefined"?  IdLote : ""#" style="width: 14px;	height: 14px;" />',
                              width: 25,
                              filterable: false,
                              hidden: true,
                          },
                         {
                             field: "IdLote",
                             title: window.app.idioma.t("ID_LOTE"),
                             template: '#=typeof IdLote !== "undefined"?  IdLote : ""#'
                         },
                          {
                              field: "DescripcionCompleta",
                              width: "50%",
                              hidden: true,
                              title: window.app.idioma.t("MATERIAL"),
                              template: "<span>" + attrCamionesTransito.descMaterial + "</span><a style='float:right' class='k-button' id='btnPropiedadesMaterial' href='\\#'  onclick='ShowMaterialProperties(this)' ><span class=' '></span>#=window.app.idioma.t('PROPIEDADES')#</a>"
                          },
                           {
                               field: "LoteProveedor",
                               hidden: true,
                               validation: { required: true },
                               title: window.app.idioma.t("LOTE_PROVEEDOR"),
                               template: '#=typeof LoteProveedor !== "undefined" && LoteProveedor !== null ? LoteProveedor: ""#'
                           },
                           {
                               field: "SSCC",
                               hidden: true,
                               title: "SSCC",
                               template: '#=typeof SSCC !== "undefined" && SSCC != null ? SSCC: ""#'
                           },
                           {
                               field: "CantidadInicial",
                               width: "10%",
                               validation: { required: true },
                               title: window.app.idioma.t("CANTIDAD_INICIAL"),
                               template: '#=typeof CantidadInicial !== "undefined" && CantidadInicial != null ? kendo.format("{0:n2}",CantidadInicial): ""#'
                           },
                           {
                               field: "CantidadActual",
                               width: "10%",
                               title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                               template: '#=typeof CantidadActual !== "undefined" && CantidadActual != null ? CantidadActual == 0?' + cantidadAlbaranPosicion + ':kendo.format("{0:n2}",CantidadActual): ""#'
                           },
                            {
                                field: "UnidadesMedidaDto",
                                width: '15%',
                                attributes: { "align": "center" },
                                title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                editor: function (e, options) { return _mAlbaranPosicion.UnidadMedidaDropDownEditor(e, options, attrCamionesTransito) },
                                template: '#=typeof UnidadesMedidaDto !== "undefined" ? UnidadesMedida: ""#'

                            },
                         {
                             field: "Ubicacion",
                             hidden: true,
                             title: window.app.idioma.t('UBICACION_DESCARGA'),
                             template: '#=typeof Ubicacion !== "undefined" && Ubicacion != null? Ubicacion.Nombre  : ""#',
                             //editor: function (e, options) { return _mAlbaranPosicion.LocationDropDownEditor(e, options, attrCamionesTransito) }
                         },
                         {
                             field: "FechaCaducidad",
                             hidden: true,
                             title: window.app.idioma.t('FECHA_CADUCIDAD'),
                             template: '#= FechaCaducidad != null ? kendo.toString(FechaCaducidad, "dd/MM/yyyy" ) : "" #',
                         },
                         {
                             field: "coms",
                             title: window.app.idioma.t("OPERACIONES"),
                             attributes: { "align": "center" },
                             command: [
                                { name: "edit", text: "Editar" },
                             ],
                             width: "25%",
                         },
                          
                     ],
                     edit: function (e) {
                         var permiso = false;

                         //attrCamionesTransito.RemoveFichero();
                         attrCamionesTransito.propExtend = null;
                         var divLabel = e.container.find("div .k-edit-label");
                         var divOptions = e.container.find("div .k-edit-field");

                         
                         divLabel[0].hidden = true;//Ocultar elementos de check
                         divOptions[0].hidden = true;
                         var wnd = $(e.container).data("kendoWindow");
                         var _itemTransporte = attrCamionesTransito.gridTransportes.dataItem(attrCamionesTransito.gridTransportes.select());
                         wnd.setOptions({
                             width: "40%",
                         });

                         if (_itemTransporte.IsGranel) {
                             $('input[name="SSCC"]').prop("disabled", true).addClass("k-state-disabled");
                         }
                         e.container.find('input[name="Seleccionar"]').hide();

                         if (e.model.CantidadActual == 0) {
                             $("#numCantActual").data("kendoNumericTextBox").value(cantidadAlbaranPosicion);
                         }

                         if (e.model.isNew() == true) {
                             e.container.kendoWindow("title", window.app.idioma.t("AGREGAR"));
                             attrCamionesTransito.idLote = null;
                         } else {
                             e.container.kendoWindow("title", "Editar");

                             $('input[name="Parametro03"]').prop("disabled", true).addClass("k-state-disabled");
                             $('input[name="SSCC"]').prop("disabled", true).addClass("k-state-disabled");
                             attrCamionesTransito.idLote = e.model.IdLote;
                         }


                         var _loteSelect = attrCamionesTransito.idLote;
                         var _dsPropExt = new kendo.data.DataSource({
                             change: function () {
                                 var _data = this.data();
                                 if (_data.length == 0 && _loteSelect != null) {
                                     _loteSelect = null;
                                     this.transport.options.read.url = "../api/GetPropiedadesExtendidas/" + attrCamionesTransito.idMaterial + "/" + _loteSelect;
                                     _dsPropExt.read();
                                 } else if (_data.length == 0 && _loteSelect == null) {
                                     attrCamionesTransito.propExtend = null;
                                     $(".k-window #btnPropiedadesMaterial").hide();
                                 } else {
                                     attrCamionesTransito.propExtend = _data;
                                     $(".k-window #btnPropiedadesMaterial").show();
                                 }
                             },
                             transport: {
                                 read: {
                                     url: "../api/GetPropiedadesExtendidas/" + attrCamionesTransito.idMaterial + "/" + attrCamionesTransito.idLote,
                                     dataType: "json"
                                 }
                             }
                         });

                         var _dataProp = _dsPropExt.read();



                         var commandCell = e.container.find("div:last");
                         commandCell.html('<a class="k-button k-button-icontext k-primary k-grid-updateRecepcionadoAlbaranEntrada ' + e.model.uid + ' k-grid-update">' + window.app.idioma.t("ACTUALIZAR") + '</a><a class="k-button k-button-icontext k-grid-cancel">' + window.app.idioma.t("CANCELAR") + '</a>');

                         $(".k-grid-updateRecepcionadoAlbaranEntrada").on("click", function () {
                             attrCamionesTransito.dsReceptionDeliveryNotes._data[0].dirty = true;
                         });

                         wnd.center()

                     },
                     cancel: function (e) {
                         $("#gridRecepcionAlbaranEntrada").data("kendoGrid").dataSource.read();

                     },

                     dataBinding: function (e) {
                         //e.preventDefault();
                         if (e.action == "remove") e.preventDefault();
                         kendo.ui.progress($("#gridRecepcionAlbaranEntrada"), false);
                     },
                     dataBound: function () {
                         if (attrCamionesTransito.TipoAlbaran == 2) {
                             $('#gridRecepcionAlbaranEntrada .k-grid-add').hide();
                             this.hideColumn("coms");
                             this.hideColumn("DescripcionCompleta");
                             this.hideColumn("SSCC");
                             this.hideColumn("Ubicacion");
                             this.showColumn("Seleccionar");

                             _mAlbaranPosicion.validateCheck(attrCamionesTransito);
                         } else {
                             this.hideColumn("chkColumn");
                         }


                         attrCamionesTransito.wndRecepcionAlbaranEntrada.center();
                         ShowMaterialProperties = function () {
                             var _valor = attrCamionesTransito;
                             if (attrCamionesTransito.propExtend == null) {
                                 $.ajax({
                                     url: "../api/GetPropiedadesExtendidas/" + attrCamionesTransito.idMaterial + "/" + attrCamionesTransito.idLote,
                                     type: "GET",
                                     dataType: "json",
                                     success: function (model) {
                                         if (model.length > 0) {
                                             _mAlbaranPosicion.ShowPropertiesMaterial(model, attrCamionesTransito);
                                         }
                                         else {
                                             Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('MATERIAL_SIN_PROPIEDADES'), 3000);
                                         }

                                     }
                                 });
                             }
                             else {
                                 _mAlbaranPosicion.ShowPropertiesMaterial(attrCamionesTransito.propExtend, attrCamionesTransito);
                             }

                         }
                     }

                 }).data("kendoGrid");

             },

             validateCheck: function (self) {
                 var grid = $("#gridRecepcionAlbaranEntrada").data("kendoGrid");
                 $("#gridRecepcionAlbaranEntrada .checkbox").bind("change", function (e) {

                     var checked = this.checked,
                     row = $(e.target).closest("tr"),
                     dataItem = grid.dataItem(row);
                     var rowAlbaranPosicion = self.gridAlbaranPosicion.tbody.find("tr[data-uid='" + self.uidAlbaranPosicion + "']");
                     var dataItemAlbaranPosicion = self.gridAlbaranPosicion.dataItem(rowAlbaranPosicion);
                     //var idValue = grid.dataItem(row).get("idTiempoCambio");

                     var datos = {};
                     datos.IdLote = dataItem.IdLote;
                     if (checked) {
                         row.addClass("k-state-selected");
                         //self.registrosSel.push(idValue);

                         var datafound = _.findWhere(self.registrosSelData, datos);
                         index = _.indexOf(self.registrosSelData, datafound);
                         if (index >= 0) {
                             self.registrosSelData.splice(index, 1);
                         }

                         self.registrosSelData.push(datos);
                     } else {
                         row.removeClass("k-state-selected");
                         //self.registrosDesSelData.push(datos);

                         var datafound = _.findWhere(self.registrosSelData, datos);
                         index = _.indexOf(self.registrosSelData, datafound);
                         if (index >= 0) {
                             self.registrosSelData.splice(index, 1);
                         }

                     }
                     dataItemAlbaranPosicion.dirty = true;
                 });

                 var lotesSelected = self.registrosSelData;
                 if (lotesSelected.length > 0) {
                     var data = grid.dataSource._data;
                     for (var i = 0; i < data.length; i++) {
                         for (var j = 0; j < lotesSelected.length; j++) {
                             if (lotesSelected[j].IdLote === data[i].IdLote) {
                                 $("#gridRecepcionAlbaranEntrada #chk_" + data[i].IdLote).prop('checked', true);

                                 //$("#gridRecepcionAlbaranEntrada .checkbox").trigger("change");
                                 break;
                             }
                         }

                     }
                 }
             },

             CantidadActualNumericTextBox: function (container, options, CantidadAlbaran) {
                 var _cantidad = options.model.CantidadActual <= 0 ? CantidadAlbaran : options.model.CantidadActual;
                 var _inputCantidadActual = $('<input id="numCantActual" value="' + _cantidad + '" name="' + options.field + '"/>')
                 .appendTo(container)
                 .kendoNumericTextBox({
                     decimals: 2,
                 }).data("kendoNumericTextBox");


                 return _inputCantidadActual;
             },

             //9. Metodo que obtiene el dropdown de ubicaciones
             LocationDropDownEditor: function (container, options, attrCamionesTransito) {
                 $('<input style="width:100% !important" id="ubicacionLote" name="' + options.field + '"/>')
                         .appendTo(container)
                         .kendoDropDownList({
                             //autoBind: true,
                             filter: "contains",
                             optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                             dataTextField: "Nombre",
                             dataValueField: "ID",
                             open: function (e) {
                                 var listContainer = e.sender.list.closest(".k-list-container");
                                 listContainer.width(listContainer.width() + kendo.support.scrollbar());
                             },
                             dataSource: this.DataSourceLocation(),
                             dataBound: function (e) {
                                 var _item = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
                                 var _options = options;
                                 if (_options.model != undefined) {
                                     if (_options.model.Ubicacion.IdUbicacion == 0 || _options.model.Ubicacion.ID == 0 || _options.model.Ubicacion == "") {
                                         this.value(_item.IdUbicacionInterna);
                                     } else {
                                         this.value(_options.model.Ubicacion.IdUbicacion);
                                     }
                                 }

                             },
                         }).data("kendoDropDownList");

                 var ubicacionLote = $("#ubicacionLote").data("kendoDropDownList");
                 ubicacionLote.list.width("auto");
             },

             //10. Metodo que obtiene el dropdown de Materiales
             MaterialDropDownEditor: function (container, options, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 $('<input data-text-field="DescripcionCompleta" required data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                          autoBind: false,
                          filter: "contains",
                          dataSource: {

                              transport: {
                                  read: {
                                      url: "../api/GetMaterial",
                                      dataType: "json"
                                  }

                              },
                              sort: { field: "DescripcionCompleta", dir: "asc" },
                              schema: {
                                  model: {
                                      id: "IdMaterial",
                                      fields: {
                                          'IdMaterial': { type: "string" },
                                          'DescripcionCompleta': { type: "string" },
                                      }
                                  }
                              }


                          },
                          select: function (e) {
                              var dataItem = this.dataItem(e.item);
                              attrCamionesTransito.idMaterial = dataItem.IdMaterial;
                              attrCamionesTransito.dsOA = _mAlbaranPosicion.DataSourceOA(options, attrCamionesTransito);
                              attrCamionesTransito.idLote = dataItem.IdLote;
                              attrCamionesTransito.dpTxtOA = $("#txtOA").data('kendoComboBox');
                              attrCamionesTransito.dpTxtOA.setDataSource(attrCamionesTransito.dsOA);


                          }

                      });
                 $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);

             },

             //11. Metodo que obtiene el dropdown de las unidades de medida
             UnidadMedidaDropDownEditor: function (container, options, attrCamionesTransito) {
                 attrCamionesTransito.idMaterial = options.model.Material != undefined ? options.model.Material.IdMaterial : attrCamionesTransito.idMaterial != undefined ? attrCamionesTransito.idMaterial : 0;

                 $('<input data-text-field="SourceUoMID" id="txtUnidadMedida" required data-value-field="PK" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                          optionLabel: "",
                          autoBind: false,
                          dataSource: this.DataSourceUnidadesMedida(attrCamionesTransito)

                      });
                 $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);

             },

             //12. Metodo que obtiene el grid de los albaranes posicion
             ObtenerAlbaranPosicion: function (id, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;

                 this.DataSourceDeliveryNotes(id, attrCamionesTransito);
                 var _grid = $("#gridAlbaranEntrada");

                 if (attrCamionesTransito.TipoAlbaran == 2) {
                     _grid = $("#gridAlbaranSalida");
                 }

                 if (attrCamionesTransito.gridAlbaranPosicion != null) {
                     _grid.data("kendoGrid").destroy();
                 }


                 attrCamionesTransito.gridAlbaranPosicion = _grid.kendoGrid({
                     dataSource: attrCamionesTransito.dsDeliveryNotes,
                     filterable: {
                         extra: false,
                         messages: window.app.cfgKendo.configuracionFiltros_Msg,
                         operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                     },
                     resizable: true,
                     scrollable: true,
                     pageable: {
                         refresh: true,
                         pageSizes: true,
                         pageSizes: [30, 100, 200, 'All'],
                         buttonCount: 2,
                         messages: window.app.cfgKendo.configuracionPaginado_Msg
                     },
                     //toolbar: [{ name: "create", text: "Agregar", id: "AddDeliveryNote", hidden: true }],
                     editable: "inline",
                     noRecords: {
                         template: window.app.idioma.t("SIN_RESULTADOS")
                     },
                     columns: [

                         {
                             field: "Material.IdMaterial",
                             title: window.app.idioma.t("REFERENCIA"),
                             template: '#=typeof Material !== "undefined"? typeof Material.IdMaterial !== "undefined" && Material.IdMaterial != 0 ? Material.IdMaterial: "": ""#'
                         },
                         {
                             field: "Material",
                             attributes: {
                                 style: 'white-space: nowrap ',
                             },
                             title: window.app.idioma.t("DESCRIPCION"),
                             editor: function (e, options) { return _mAlbaranPosicion.MaterialDropDownEditor(e, options, attrCamionesTransito) },
                             template: '<span class="addTooltip">#=typeof Material !== "undefined"?  Material.Descripcion: ""#</span>'
                         },
                          {
                              field: "Cantidad",
                              attributes: { "align": "center" },
                              title: window.app.idioma.t("CANTIDAD_ALBARAN"),
                              template: '#=typeof Cantidad !== "undefined" && Cantidad != null ?  kendo.format("{0:n2}",Cantidad): ""#'
                          },


                         {
                             field: "Material.UnidadMedidaDto",
                             width: '10%',
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("UNIDAD_MEDIDA"),
                             editor: function (e, options) { return _mAlbaranPosicion.UnidadMedidaDropDownEditor(e, options, attrCamionesTransito) },
                             template: '#=typeof Material !== "undefined" ? typeof Material.SourceUoMID !== "undefined"? Material.SourceUoMID: "" : ""#'

                         },
                         {
                             fields: "INSP",
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("INSPECCION"),
                             template: "#if(typeof INSP !== 'undefined' && INSP != null){#<a href='\\#' id='btnSemaforoAlbaranPosicion' class='#=IdAlbaranPosicion#'><img id='imgEstado' src='img/KOP_#= INSP #.png'></img></a>#}#"
                         },
                         {
                             field: "btnLote",
                             hidden: true,
                             editor: false,
                             title: window.app.idioma.t("LOTES"),
                             attributes: { "align": "center" },
                             template: '<a class="k-button #=uid#'
                                      + '" id="btnRecepcionadoAlbaranEntrada" >...</a>'
                         },
                         {
                             field: "CantidadInicial",
                             hidden: true,
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("CANTIDAD_RECEPCIONADA"),
                             template: '#=typeof CantidadInicial !== "undefined" && CantidadInicial != null ?  kendo.format("{0:n2}",CantidadInicial): ""#'
                         },
                         {
                             field: "CantidadActual",
                             hidden: true,
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                             template: '#=typeof CantidadActual !== "undefined" && CantidadActual != null ?  kendo.format("{0:n2}",CantidadActual): ""#'
                         },
                          {
                              field: "IdLote",
                              hidden: true,
                              attributes: {
                                  style: 'white-space: nowrap ',

                              },
                              title: window.app.idioma.t("ID_LOTE"),
                              template: '<span  class="addTooltip">#=typeof IdLote !== "undefined" && IdLote != null? IdLote:""#</span>',
                              editor: function (e, options) { return _mAlbaranPosicion.btnLote(e, options, attrCamionesTransito) },
                          },
                         {
                             field: "TipoOrdenAprovisionamiento",
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("TIPO"),
                             editor: function (e, options) { return _mAlbaranPosicion.TipoOADropDownEditor(e, options, attrCamionesTransito) },
                             template: '#=typeof TipoOrdenAprovisionamiento !== "undefined" && TipoOrdenAprovisionamiento != null? TipoOrdenAprovisionamiento.Tipo:""#'

                         },
                          {
                              attributes: { "align": "center" },
                              width: '15%',
                              field: "OrdenAprovisionamiento",
                              title: window.app.idioma.t("NUMERO_ORDEN"),
                              editor: function (e, options) { return _mAlbaranPosicion.OADropDownEditor(e, options, attrCamionesTransito) },
                              template: '#=typeof OrdenAprovisionamiento !== "undefined" && OrdenAprovisionamiento != null? OrdenAprovisionamiento.Descripcion !== "undefined" && OrdenAprovisionamiento.Descripcion != null? OrdenAprovisionamiento.Descripcion: "":""#'
                          },
                         {
                             field: "coms",
                             width: '15%',
                             title: window.app.idioma.t("OPERACIONES"),
                             attributes: { "align": "center" },
                             command: [
                                { name: "edit", text: "Editar" },
                             ],
                         }
                     ],
                     edit: function (container) {
                         var permiso = false;
                         for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                             if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                                 permiso = true;
                         }
                         if (!permiso) {
                             Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                         } else {
                             container._defaultPrevented = true;
                             //attrCamionesTransito.RemoveFichero();
                             if (attrCamionesTransito.TipoAlbaran == 1)
                             { _grid.data("kendoGrid").hideColumn("btnLote"); }
                             //else { $("#btnRecepcionadoAlbaranEntrada").hide() }

                             //this.hideColumn("btnLote");
                             if (container.model != undefined) {
                                 if (!container.model.isNew()) {
                                     if (container.model.Recepcionado > 0) {
                                         var _inputMaterial = container.container.find("input[name=slMaterial]").data("kendoDropDownList");
                                         _inputMaterial.enable(false);
                                         var _inputUnidad = container.container.find("input[name=slMaterial\\.UnidadMedidaDto]").data("kendoDropDownList");
                                         _inputUnidad.enable(false);

                                     }
                                 }


                                 attrCamionesTransito.uidAlbaranPosicion = container.model.uid;
                                 attrCamionesTransito.idMaterial = container.model.Material.IdMaterial;
                                 if (container.model.TipoOrdenAprovisionamiento != undefined) {
                                     if (container.model.TipoOrdenAprovisionamiento.Tipo != "OA" ||
                                         (container.model.TipoOrdenAprovisionamiento.Tipo == "OA" && attrCamionesTransito.dsOA._data.length == 0)) {
                                         $("#txtTipoOA").show();

                                         $("#txtTipoOA").val(container.model.OrdenAprovisionamiento.Descripcion)
                                         if (attrCamionesTransito.dpTxtOA != undefined) {
                                             attrCamionesTransito.dpTxtOA.wrapper.hide();
                                         }
                                         $("#btnSearchOrder").hide();
                                     } else if (container.model.TipoOrdenAprovisionamiento.Tipo == "OA" && attrCamionesTransito.dsOA._data.length > 0) {
                                         attrCamionesTransito.dpTxtOA.value(container.model.IdOrden)
                                     }
                                 }
                             }
                             var commandCell = container.container.find("td:last");
                             if (container.container.find("a").length > 0) {
                                 container.container.find("a")[0].hidden = true;//Oculta el btn de Recepcion
                             }
                             commandCell.html('<a class="k-button k-button-icontext k-primary k-grid-updateAlbaranEntrada ' + container.model.uid + '  k-grid-update">' + window.app.idioma.t("ACTUALIZAR") + '</a><a class="k-button k-button-icontext k-grid-cancel">' + window.app.idioma.t("CANCELAR") + '</a>');

                         }

                     },
                     cancel: function (e) {
                         attrCamionesTransito.gridAlbaranPosicion.dataSource.read();
                         var _attr = { idMaterial: 0 }
                         attrCamionesTransito.registrosSelData = [];
                         //attrCamionesTransito.dsOA = _mAlbaranPosicion.DataSourceOA(_attr);
                         //attrCamionesTransito.dpTxtOA.setDataSource(attrCamionesTransito.dsOA);
                     },


                     dataBound: function (e) {
                         kendo.ui.progress(_grid, false);
                         var grid = this;

                         var data = this._data;

                         //$('.k-grid-add').hide();
                         var itemsGridTransport = this.items();
                         itemsGridTransport.each(function (idx, item) {
                             if ($(item).is('.k-state-selected')) {
                                 $('.k-grid-add').show();
                             }
                         });
                         _mAlbaranPosicion.HideColumnsGrid(_grid.data("kendoGrid"), attrCamionesTransito);
                         _grid.data("kendoGrid").autoFitColumn("INSP");



                     }
                 }).data("kendoGrid");




                 _grid.kendoTooltip({
                     filter: ".addTooltip",
                     content: function (e) {
                         return e.target.html().replace(/,/g, "<br>");
                     }
                 }).data("kendoTooltip");


                 $("#gridAlbaranSalida").kendoTooltip(
                 {
                     filter: ".addTooltip span",
                     content: function (e) {
                         return e.target.html();
                     }
                 }
             ).data("kendoTooltip");

             },

             //13. Metodo que obtiene el Boton para seleccionar un lote en los albaranes posicion de Salida
             btnLote: function (container, options, attrCamionesTransito) {

                 //Si es albaran de salida retorna el boton
                 if (attrCamionesTransito.TipoAlbaran == 2) {
                     var _idMaterial = options.model.IdMaterial != undefined ? options.model.IdMaterial : 0;
                     var _idAlbaranPosicion = options.model.IdAlbaranPosicion != undefined ? options.model.IdAlbaranPosicion : 0;
                     var _sourceUoMID = options.model.Material != undefined ? options.model.Material.SourceUoMID != undefined ? options.model.Material.SourceUoMID : 0 : 0;
                     var _descripcionMaterial = options.model.Material != undefined ? options.model.Material.Descripcion != undefined ? options.model.Material.Descripcion : "" : "";
                     var _idLote = options.model.IdLote ? options.model.IdLote.split(',').length : "";

                     if (options.model.IdLote) {
                         attrCamionesTransito.registrosSelData = [];
                         var _lotes = options.model.IdLote.split(',');
                         for (var i = 0; i < _lotes.length; i++) {
                             attrCamionesTransito.registrosSelData.push({
                                 IdLote: _lotes[i]
                             })
                         }
                     }
                     //$('<a class="k-button ' + options.model.uid + '" id="btnRecepcionadoAlbaranSalida"  >...</a><span id="lblLoteSeleccionado" >&nbsp; ' + _idLote + '</span>')
                     //  .appendTo(container);
                     $('<a class="k-button ' + options.model.uid + '" id="btnRecepcionadoAlbaranSalida"  >...</a><span id="lblLoteSeleccionado" >&nbsp;' + _idLote + '</span>')
                       .appendTo(container);
                     $("#btnRecepcionadoAlbaranSalida").show();
                 }

             },

             //14. Metodo que obtiene el datasource de las Ordenes de Aprovisionamiento (OA) segun el ID de un Material
             DataSourceOA: function (options, attrCamionesTransito) {
                 if (attrCamionesTransito != null && attrCamionesTransito != undefined) {
                     var _mAlbaranPosicion = this;
                     attrCamionesTransito.dsOA = new kendo.data.DataSource({
                         transport: {
                             read: {
                                 url: "../api/GetOA/" + attrCamionesTransito.idMaterial,
                                 dataType: "json",
                                 cache: false
                             }

                         },
                         requestEnd: function (e) {
                             var _item = options;
                             if (e.response != undefined) {
                                 if (e.response.length == 0) {
                                     if (attrCamionesTransito.dpTxtOA != undefined) {
                                         attrCamionesTransito.dpTxtOA.wrapper.hide();
                                         $("#btnSearchOrder").hide();
                                         $("#txtTipoOA").show();
                                     }

                                 } else {
                                     if (e.response[0].TipoOrden.Tipo == "OA" && e.response.length > 0) {
                                         var _value = $("#txtTipoOA").val();
                                         attrCamionesTransito.dpTxtOA.text(_value);

                                         if (_item.model.TipoOrdenAprovisionamiento.Tipo == "OA") {
                                             attrCamionesTransito.dpTxtOA.wrapper.show();
                                             $("#btnSearchOrder").show();
                                             $("#txtTipoOA").hide();
                                             $("#txtTipoOA").val('');
                                         }
                                     }
                                 }
                             }
                         }
                     });
                     return attrCamionesTransito.dsOA;
                 }
             },

             //15. Metodo que obtiene el dropdown de las Ordenes de Aprovisionamiento (OA)
             OADropDownEditor: function (container, options, attrCamionesTransito) {
                 $("<input  type='text' id='txtTipoOA' class='k-textbox " + options.model.uid + "' style='display:none' />").appendTo(container);
                 $('<input style="width:65% !important" data-text-field="Descripcion" id="txtOA" data-value-field="IdOrdenAprovisionamiento" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoComboBox({
                          filter: "contains",
                          dataSource: this.DataSourceOA(options, attrCamionesTransito),

                      });
                 $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                 $("<a class='k-button' id='btnSearchOrder'><span class='k-icon k-i-search'></span></a>").appendTo(container)

                 $("#txtTipoOA").on("input", function () {
                     var _uid = this.className.split(" ")[1];
                     var row = attrCamionesTransito.gridAlbaranPosicion.tbody.find("tr[data-uid='" + _uid + "']");

                     ////Se obtiene la fila que se va a modificar, se obtiene el indice y se forza a llamar al evento de actualizar
                     var dataItem = attrCamionesTransito.gridAlbaranPosicion.dataItems()[row[0].rowIndex];
                     if (typeof dataItem.id !== 'undefined') {
                         if (typeof dataItem !== 'undefined') {
                             if (dataItem.OrdenAprovisionamiento != null)
                                 dataItem.set('OrdenAprovisionamiento.Descripcion', this.value);
                             else {
                                 var OrdenAprovisionamiento = { Descripcion: this.value }
                                 dataItem.set('OrdenAprovisionamiento', OrdenAprovisionamiento);
                             }

                         }

                     } else {

                     }
                 });

                 attrCamionesTransito.dpTxtOA = $("#txtOA").data("kendoComboBox");
             },

             //16. Metodo que obtiene el dropdow de los tipos de OA (por defecto "OA"-"ST"-"MM")
             TipoOADropDownEditor: function (container, options, attrTransporte) {

                 $('<input data-text-field="Tipo" id="IdTipoOA"  data-value-field="IdTipoOrdenAprovisionamiento" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                      .appendTo(container)
                      .kendoDropDownList({
                          //autoBind: false,
                          optionLabel: "",
                          filter: "contains",
                          dataSource: [
                                         { IdTipoOrdenAprovisionamiento: 1, Tipo: "OA" },
                                         { IdTipoOrdenAprovisionamiento: 2, Tipo: "ST" },
                                         { IdTipoOrdenAprovisionamiento: 3, Tipo: "MM" }
                          ],
                          select: function (e) {
                              var dataItem = this.dataItem(e.item);
                              var _attrTransportes = attrTransporte;

                              switch (dataItem.IdTipoOrdenAprovisionamiento) {
                                  case 1:
                                      if (_attrTransportes.dsOA != undefined) {
                                          if (_attrTransportes.dsOA._data.length > 0) {
                                              $("#txtOA").data("kendoComboBox").wrapper.show();
                                              $("#txtTipoOA").hide();
                                              $("#btnSearchOrder").show();
                                          }
                                      } else {
                                          $("#txtOA").data("kendoComboBox").wrapper.hide();
                                          $("#txtTipoOA").show();
                                          $("#btnSearchOrder").hide();
                                      }
                                      break;
                                  case 2:
                                  case 3:
                                      $("#txtOA").data("kendoComboBox").wrapper.hide();
                                      $("#txtTipoOA").show();
                                      $("#btnSearchOrder").hide();
                                      break;


                              }
                          }
                      });


                 //$('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
             },

             //17. Metodo que genera un tipo kendoWindow para los Lotes de un Albaran posicion
             WindowReceptionDeliveryNote: function (attrCamionesTransito) {
                 $("#divWnd").prepend($('<div id="wndRecepcionAlbaranEntrada"><div id="gridRecepcionAlbaranEntrada"></div></div>'));
                 $("#wndRecepcionAlbaranEntrada").kendoWindow({
                     //height: 450,
                     modal: true,
                     width: '65%',
                     visible: false,
                     title: window.app.idioma.t("LOTES"),
                     close: function () {
                         attrCamionesTransito.wndRecepcionAlbaranEntrada.destroy();
                         attrCamionesTransito.wndRecepcionAlbaranEntrada = null;
                         $("#lblLoteSeleccionado").text(attrCamionesTransito.registrosSelData.length);
                     }
                 });
             },

             //18. Metodo que genera un tipo kendoWindow para las propiedades extendidas de un material
             WindowPropertiesMaterial: function (attrCamionesTransito) {
                 $("#divWnd").prepend($('<div id="wndPropertiesMaterial" ><div id="formPropertiesMaterial" style="overflow-x:hidden" class="demo-section k-content wide"  >'
                                         + '<ul class="k-reset listValuesProperties" data-template="fieldsTemplate" data-bind="source: fields"></ul>'
                                         + '<div class="col-md-12" style="margin-top:10px"><center><button id="btnGuardarPropiedad"  class="k-button">' + window.app.idioma.t("GUARDAR") + '</button></center></div></div></div>'));

                 $("#wndPropertiesMaterial").kendoWindow({
                     width: '40%',
                     visible: false,
                     modal: true,
                     title: window.app.idioma.t("PROPIEDADES_MATERIAL"),
                     close: function () {
                         attrCamionesTransito.wndMaterialProperties.destroy();
                         attrCamionesTransito.wndMaterialProperties = null;
                     }
                 });

                 $("#btnGuardarPropiedad").on("click", function () {
                     var _arrayProperties = [];
                     //Se recorre todas las propiedades extendidas y se guardan en una lista, luego se guarda en la variable global "propExtend"
                     $('#formPropertiesMaterial .listValuesProperties li').each(function (i) {
                         var _value = this.value;
                         var _namePropertie = null;
                         var _valuePropertie = null;
                         var _unitPropertie = null;
                         //Recorrido de todos los elementos
                         $(this).children().each(function (e) {
                             var _item = this.value;
                             var _innerHTML = this.innerHTML;
                             //Primera columna que pertenece a los nombres de las propiedades
                             if (_innerHTML.indexOf("label") != -1 && _namePropertie == null) {
                                 _namePropertie = this.textContent;
                             } //Segunda columna que pertenece a los valores que ingresa el usuario
                             else if (_innerHTML.indexOf("input") != -1 && _valuePropertie == null) {
                                 _valuePropertie = this.firstChild.value;
                                 //Tercera columna que pertenece a las unidades de medida
                             } else if (_innerHTML.indexOf("label") != -1 && _unitPropertie == null) {
                                 _unitPropertie = this.textContent;
                             }

                             //Si se encuentran todos los valores llenos se guardan en la variable global "propExtend"
                             if (_namePropertie != null && _valuePropertie != null && _unitPropertie != null) {
                                 _arrayProperties.push({
                                     'PropertyID': _namePropertie,
                                     'PropValChar': _valuePropertie,
                                     'UomID': _unitPropertie
                                 });
                             }

                         });

                     });
                     attrCamionesTransito.propExtend = _arrayProperties;
                     attrCamionesTransito.wndMaterialProperties.destroy();
                     attrCamionesTransito.wndMaterialProperties = null;
                     Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROPIEDADES_GUARDADAS_LOTE'), 3000);
                 })
             },

             //19. Metodo que genera un tipo kendoWindow para los formularios de calidad
             WindowCalidadProperties: function (attrCamionesTransito) {
                 $("#divWnd").prepend($('<div id="wndCalidadProperties" ><div id="gridFormsCalidad"></div></div>'));

                 $("#wndCalidadProperties").kendoWindow({
                     width: '40%',
                     modal: true,
                     visible: false,
                     title: window.app.idioma.t("FORMULARIOS"),
                     close: function () {
                         $('#wndCalidadProperties').data("kendoWindow").destroy();
                         $("#gridAlbaranEntrada").data("kendoGrid").dataSource.read();
                         var grid = $("#gridTransportes").data("kendoGrid");
                         grid.dataSource.read();



                     }
                 });
             },

             //20. Metodo que carga los datos de la ventana de propiedades extendidas de un material
             ShowPropertiesMaterial: function (model, attrCamionesTransito) {
                 var _model = { "fields": [] }
                 for (var i = 0; i < model.length; i++) {
                     _model.fields.push({
                         "name": model[i].DefID,
                         "label": model[i].PropertyID,
                         "css": "k-textbox",
                         "type": "text",
                         "unit": model[i].UomID,
                         "value": model[i].PropValChar
                     })
                 };

                 this.WindowPropertiesMaterial(attrCamionesTransito)
                 attrCamionesTransito.wndMaterialProperties = $('#wndPropertiesMaterial').data("kendoWindow");
                 attrCamionesTransito.wndMaterialProperties.open();
                 attrCamionesTransito.wndMaterialProperties.center();

                 var viewModel = kendo.observable(_model);
                 kendo.bind($("#formPropertiesMaterial"), viewModel);
             },

             //21. Metodo que carga los datos de la ventana de Ordenes de aprovisionamiento
             ShowOrdenAprovisionamiento: function (attrCamionesTransito) {
                 $("#divWnd").prepend($('<div id="wndOrdenAprovisionamiento"><div id="gridOrders"></div></div>'));
                 $("#wndOrdenAprovisionamiento").kendoWindow({
                     width: '40%',
                     visible: false,
                     title: window.app.idioma.t("SELECCIONE") + ' ' + window.app.idioma.t("NUMERO_ORDEN"),
                     close: function () {
                         attrCamionesTransito.wnd.destroy();
                         attrCamionesTransito.wnd = null;
                     }
                 });

                 //this.DataSourceOA(null,attrCamionesTransito)

                 this.GridOrders(attrCamionesTransito);

                 attrCamionesTransito.wnd = $('#wndOrdenAprovisionamiento').data("kendoWindow");
                 attrCamionesTransito.wnd.open();
                 attrCamionesTransito.wnd.center();
                 attrCamionesTransito.wnd.one("activate", function () {
                 });
             },

             //22. Metodo que carga los datos de la ventana de los formularios de calidad
             ShowCalidadProperties: function (e, options, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 var idAlbaranPosicion = e.currentTarget.className;
                 this.WindowCalidadProperties()
                 attrCamionesTransito.wndCalidadProperties = $('#wndCalidadProperties').data("kendoWindow");
                 attrCamionesTransito.wndCalidadProperties.open();


                 attrCamionesTransito.wndCalidadProperties.one("activate", function () {
                     _mAlbaranPosicion.GetFormsByIdAlbaranPosicion(idAlbaranPosicion, attrCamionesTransito)


                     //   $("#gridAlbaranEntrada").data('kendoGrid').refresh();
                     //   $("#gridTransportes").data('kendoGrid').refresh();


                 });

             },

             //23. Metodo que obtiene los formularios de calidad segun el id de albaran posicion
             GetFormsByIdAlbaranPosicion: function (idAlbaranPosicion, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 //var dataItem = attrCamionesTransito.gridAlbaranPosicion.dataItem(attrCamionesTransito.gridAlbaranPosicion.select());
                 var gridForms = $("#gridFormsCalidad").kendoGrid({
                     dataSource: {
                         type: "json",
                         transport: {
                             read: "../api/GetFormsByIdAlbaranPosicion/" + idAlbaranPosicion,
                         },
                         requestEnd: function (e) {
                             //var _data = data;
                             attrCamionesTransito.wndCalidadProperties.center();


                         },
                         pageSize: 20
                     },
                     height: 550,
                     sortable: true,
                     pageable: {
                         refresh: true,
                         //pageSizes: true,
                         buttonCount: 5
                     },
                     columns: [{
                         field: "Name",
                         title: window.app.idioma.t('NOMBRE')
                     },
                      {
                          field: window.app.idioma.t("OPERACIONES"),
                          attributes: { "align": "center" },
                          command:
                          {
                              template: "<a  class='k-button k-grid-update btnEditarFormulario'  style='min-width:16px;'>" + window.app.idioma.t("EDITAR") + "</a>"
                          },
                          width: "15%"
                      }, ],
                     dataBound: function () {

                         $(".btnEditarFormulario").click(function (e) {
                             var _self = this;
                             //Obtenemos la línea seleccionada del grid
                             var tr = $(e.target.parentNode.parentNode).closest("tr");
                             // get the data bound to the current table row
                             var data = $("#gridFormsCalidad").data("kendoGrid").dataItem(tr);

                             _mAlbaranPosicion.EditarFormularioCalidad(data);
                         });
                     }
                 });



             },

             //24. Metodo que muestra la ventana de edicion de un formulario de calidad
             EditarFormularioCalidad: function (data) {
                 var permiso = false;
                 for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                     if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                         permiso = true;
                 }
                 if (!permiso) {
                     Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                 } else {
                     var jsonTemplate = JSON.parse(data.FormTemplate);
                     // this.vistaFormComponent = new VistaFormComponent({ modeConfig: true, terminalMode: false, formTemplate: jsonTemplate });


                     this.vistaFormComponent = new VistaFormComponent({ modeConfig: false, terminalMode: false, formTemplate: JSON.parse(data.FormTemplate), refreshFunction: false, formInstance: data })
                     // this.vistaFormComponent = new VistaFormComponent({ modeConfig: false, terminalMode: false, formTemplate: jsonTemplate, formInstance: data });
                 }
             },

             //25. Metodo que obtiene el grid de las ordenes de aprovisionamiento
             GridOrders: function (attrCamionesTransito) {
                 attrCamionesTransito.gridOrders = $("#gridOrders").kendoGrid({
                     dataSource: attrCamionesTransito.dsOA,
                     filterable: {
                         extra: false,
                         messages: window.app.cfgKendo.configuracionFiltros_Msg,
                         operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                     },
                     resizable: true,
                     scrollable: true,
                     selectable: true,
                     noRecords: {
                         template: window.app.idioma.t("SIN_RESULTADOS"),
                     },
                     columns: [
                          {
                              attributes: { "align": "center" },
                              field: "Descripcion",
                              title: window.app.idioma.t("NUMERO_ORDEN"),
                              template: '#=typeof Descripcion !== "undefined" && Descripcion != null? Descripcion: ""#'
                          },
                           {
                               attributes: { "align": "center" },
                               field: "Proveedor",
                               title: window.app.idioma.t("PROVEEDOR"),
                               template: '#=typeof Proveedor !== "undefined" && Proveedor != null? Proveedor: ""#'
                           },
                          {
                              attributes: { "align": "center" },
                              field: "CantidadPendiente",
                              title: window.app.idioma.t("CANTIDAD_PENDIENTE"),
                              template: '#=typeof CantidadPendiente !== "undefined" && CantidadPendiente != null? CantidadPendiente: ""#' + ' ' + '#=typeof UnidadMedida !== "undefined" && UnidadMedida != null? UnidadMedida: ""#'
                          },
                          {
                              title: "",
                              template: '<button id="order_#=uid#" class="k-button selectOrder">' + window.app.idioma.t('SELECCIONAR') + '</button>'
                          }
                     ],




                     dataBinding: function (e) {
                     },
                     dataBound: function () {
                         //attrCamionesTransito.dpTxtOA.setDataSource(attrCamionesTransito.dsOA);
                         //$("#txtOA").data("kendoDropDownList").select(0)


                         kendo.ui.progress($("#gridOrders"), false);
                     }
                 }).data("kendoGrid");

                 $(".selectOrder").on("click", function (e) {
                     var _uid = this.id.split("_")[1];
                     var rowsSelected = $("#gridOrders").data("kendoGrid").tbody.find("tr[data-uid='" + _uid + "']");
                     $("#gridOrders").data("kendoGrid").select(rowsSelected);
                     var _itemSelected = $("#gridOrders").data("kendoGrid").dataItem($("#gridOrders").data("kendoGrid").select());
                     var _tipoOA = $("#IdTipoOA").data("kendoDropDownList").value(_itemSelected.IdTipoOrdenAprovisionamiento);

                     var rowIndex = $("#gridOrders").data("kendoGrid").tbody.find("tr[data-uid='" + _itemSelected.uid + "']")[0].rowIndex;
                     attrCamionesTransito.dpTxtOA.text(_itemSelected.Descripcion);

                     var rowIndexAlbaranEntrada = attrCamionesTransito.gridAlbaranPosicion.tbody.find("tr[data-uid='" + attrCamionesTransito.uidAlbaranPosicion + "']")[0].rowIndex;
                     var gridDataSource = attrCamionesTransito.gridAlbaranPosicion.dataSource;
                     var firstRowData = gridDataSource.view()[rowIndexAlbaranEntrada];
                     if (firstRowData.OrdenAprovisionamiento != null) {
                         firstRowData.set("OrdenAprovisionamiento.Descripcion", _itemSelected.Descripcion);
                         firstRowData.set("OrdenAprovisionamiento.IdOrdenAprovisionamiento", _itemSelected.Descripcion);
                     } else {
                         var _OrdenAprovisionamiento = {
                             Descripcion: _itemSelected.Descripcion,
                             IdOrdenAprovisionamiento: _itemSelected.Descripcion
                         }

                         firstRowData.set("OrdenAprovisionamiento", _OrdenAprovisionamiento);
                     }
                     $("#wndOrdenAprovisionamiento").data("kendoWindow").close()

                 });


             },

             //26. Metodo que carga los datos de la ventana de lotes de un albaran posicion
             ShowWindowReceptionDeliveryNote: function (e, attrCamionesTransito) {
                 var _mAlbaranPosicion = this;
                 if (attrCamionesTransito.idMaterial != 0 || e.currentTarget.className.split(" ")[1] != 0) {
                     var idMaterial = 0;
                     var _uid = e.currentTarget.className.split(" ")[1];
                     var row = attrCamionesTransito.gridAlbaranPosicion.tbody.find("tr[data-uid='" + _uid + "']");
                     var dataItem = attrCamionesTransito.gridAlbaranPosicion.dataItems()[row[0].rowIndex];
                     if (attrCamionesTransito.TipoAlbaran == 1) {

                         if (attrCamionesTransito.idMaterial != dataItem.IdMaterial && attrCamionesTransito.idMaterial != null) {
                             idMaterial = dataItem.IdMaterial;
                         } else if (dataItem.IdMaterial == null
                                         || dataItem.IdMaterial == 0 && attrCamionesTransito.idMaterial != null && attrCamionesTransito.idMaterial != 0) {
                             idMaterial = attrCamionesTransito.idMaterial;
                         } else if (dataItem.IdMaterial != null && attrCamionesTransito.idMaterial == null) {
                             idMaterial = dataItem.IdMaterial;
                         } else if (dataItem.IdMaterial != null && attrCamionesTransito.idMaterial != null) {
                             idMaterial = dataItem.IdMaterial;
                         }
                     } else {
                         idMaterial = attrCamionesTransito.idMaterial
                     }
                     var idAlbaranEntrada = dataItem.IdAlbaranPosicion;
                     var unidadMedida = dataItem.Material.SourceUoMID;
                     attrCamionesTransito.idAlbaranPosicion = idAlbaranEntrada;
                     var descMaterial = dataItem.Material.DescripcionCompleta;
                     var cantidadAlbaranPosicion = dataItem.Cantidad;
                     attrCamionesTransito.idMaterial = idMaterial;
                     attrCamionesTransito.descMaterial = descMaterial.trim();
                     attrCamionesTransito.UnidadMedidaMaterialAlbaranEntrada = unidadMedida;
                     _mAlbaranPosicion.DataSourceReceptionDeliveryNote(idMaterial, idAlbaranEntrada, descMaterial.trim(), unidadMedida, attrCamionesTransito.TipoAlbaran, attrCamionesTransito);
                     //_mAlbaranPosicion.DataSourceZona(0,attrCamionesTransito);
                     //_mAlbaranPosicion.DataSourceLocation();
                     _mAlbaranPosicion.WindowReceptionDeliveryNote(attrCamionesTransito);
                     attrCamionesTransito.wndRecepcionAlbaranEntrada = $('#wndRecepcionAlbaranEntrada').data("kendoWindow");
                     attrCamionesTransito.wndRecepcionAlbaranEntrada.open();
                     attrCamionesTransito.wndRecepcionAlbaranEntrada.center();
                     attrCamionesTransito.wndRecepcionAlbaranEntrada.one("activate", function () {
                         if ($("#gridRecepcionAlbaranEntrada").data("kendoGrid") !== undefined) {
                             $("#gridRecepcionAlbaranEntrada").data("kendoGrid").destroy();
                         }
                         attrCamionesTransito.propExtend = null;
                         kendo.ui.progress($("#gridRecepcionAlbaranEntrada"), true);
                         _mAlbaranPosicion.GridReceptionDeliveryNote(attrCamionesTransito, cantidadAlbaranPosicion);
                     });
                 } else {
                     Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_MATERIAL'), 3000);
                 }

             },

             HideColumnsGrid: function (grid, attrCamionesTransito) {
                 if (attrCamionesTransito.TipoAlbaran == 2) {
                     grid.hideColumn("INSP");
                     grid.hideColumn("btnLote");
                     grid.hideColumn("CantidadInicial");
                     grid.hideColumn("CantidadActual");
                     grid.showColumn("IdLote");
                 } else if (attrCamionesTransito.TipoAlbaran == 1) {
                     grid.hideColumn("IdLote");
                     grid.showColumn("CantidadInicial");
                     grid.showColumn("CantidadActual");
                     //$("#btnRecepcionadoAlbaranSalida")
                     grid.showColumn("INSP");
                     grid.showColumn("btnLote");
                 }

             },
         }
         return albaranPosicion;

     });

