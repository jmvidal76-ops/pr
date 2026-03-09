define(['underscore', 'backbone', 'jquery', 'text!../../html/TruckQueue.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantilla, Not) {
        var VistaLogin = Backbone.View.extend({
            template: _.template(plantilla),
            tagName: 'div',
            id: 'dlgLogin',
            IdLocation:15,
            initialize: function () {
                var self = this;
                Backbone.on('eventRefreshColaCamionesTerminal', self.actualiza, self);
                $("#center-pane").prepend($(this.el));
                var parametros = _.object(_.compact(_.map(location.search.slice(1).split('&'), function (item) { if (item) return item.split('='); })));
                self.IdLocation = parseInt(parametros.IdUbicacion);
                this.GetTruckQueue();
                this.render();
            },
            render: function () {
                var self = this;
                
               
                $(this.el).html(this.template());
                $("#center - pane").css({ "margin": "0", "padding": "0" });                
                self.CreateGrid(null);
                self.GetLocationName();
                $("#gridTruckQueue").css({ "margin": "0", "padding": "0"});
            },
            CreateGrid: function (ds) {
                var self = this;

                $("#gridTruckQueue").kendoGrid({
                    dataSource: ds,
                    sortable: false,
                    resizable: true,
                    scrollable: true,                    
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    pageable: false,
                    columns: [{
                        field: "Matricula",
                        attributes: { style: "text-align:center;"},
                        template: "<Div style='margin: 0px; padding: 0px; width: 50%; text-align: center; float: left; postion: relative;'><img src='img/TruckQueue.png' style='width: 50%; margin-bottom: 5px;'></img> <label class='labelCola marginTopElement' style='left: 4%; width: 50%; text-align: center; color: white;  position: absolute;'>#=Matricula#</label></Div>",
                        width: 150
                    },
                    {
                        field: "IdLote",                       
                        hidden: true
                    },
                    {
                        field: "UltimoCamion",
                        hidden: true
                    },
                    {
                        field: "IdAlbaran",
                        hidden: true
                    }],
                    toolbar: [{ template: '<label id="title" style="text-align: center; font-size:25px;margin:0;padding:0;"></label>' }],
                    dataBound: function (e) {
                        self.resizeGrid(e, self);
                        $("#gridTruckQueue").find("tr").eq(1).css("background-color", "#26C281");
                        $("#gridTruckQueue").find("tr").eq(1).find("td").eq(0).append("<Div style='text-align:center;width:50%;float:right;margin:0;padding:0;display:flex;align-items: center;justify-content: center;'><button class='k-button btnTruck' style='width:50% !important;height:100px !important; margin-top:5% !important; position:inherit !important;' id='btnDescargar' >" + window.app.idioma.t('FINALIZAR_DESCARGA').toUpperCase() + "</button></Div>"),
                        $("#gridTruckQueue").find("table").css("border-style", "none");

                        e.sender.dataSource.data().forEach(function (element, index) {
                            if (element.UltimoCamion == "1") {
                                //$("#gridTruckQueue").find("tr").eq(index + 2).css("background-color", "red");
                                //$("#gridTruckQueue").find("tr").eq(index + 1).find("td").eq(0).append("<Div style='text-align:center;width:50%;float:right;margin:0;padding:0;'><label style='font: bold 25px Italic;text-align:center;color:white;margin-top:4.5%'>" + window.app.idioma.t('ULTIMO_CAMION') + "</label></Div>");

                                var _findTr = $("#gridTruckQueue").find("tr[data-uid='" + element.uid + "']");
                                _findTr.after("<table><tr style='background-color:#F03434'><td><div style='text-align:center;width:100%;margin:5px;'><label class='labelCola' style='text-align:center;color:white;'><b>" + window.app.idioma.t('CAMBIO_MATERIA_PRIMA').toUpperCase() + "</b></label></div></td></tr></table>");
                                //$("#gridTruckQueue").find("tr").eq(index + 2).find("td").eq(0).append("<Div style='text-align:center;width:50%;float:right;margin:0;padding:0;'><label style='font: bold 25px;text-align:center;color:white;margin-top:4.5%'>" + window.app.idioma.t('ULTIMO_CAMION') + "</label></Div>");


                            }
                        });
                    }
                });


            },
            GetTruckQueue:function()
            {
                var self = this;

                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/GetLotesByIdUbicacionAnonymous/" + self.IdLocation,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (data) {
                    var aux = new kendo.data.DataSource({
                        data:data,
                    });
                    $("#gridTruckQueue").data("kendoGrid").setDataSource(aux);
                    $("#gridTruckQueue").data("kendoGrid").dataSource.read();
                }).fail(function (err) {
                });

            },
            GetLocationName:function()
            {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/GetUnLoadLocationName/" + self.IdLocation,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (data) {
                    $("#title").text(data.toUpperCase());
                }).fail(function (err) {                                        
                });
            },
            resizeGrid: function (e, self) {

                self.pass = false;
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#navbar").innerHeight();
                var footerHeight = $("#footer").innerHeight();

                var gridElement = $("#" + e.sender._cellId.split('_')[0]),
                        dataArea = gridElement.find(".k-grid-content"),
                        gridHeight = gridElement.innerHeight(),
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;
                        tableHead = gridElement.find(".k-header.k-grid-toolbar").innerHeight();
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(((contenedorHeight - otherElementsHeight) - tableHead)-50);
            },
            events: {
                'click #btnDescargar': 'PutDatas'
            },
            PutDatas: function () {
                var self = this;
                var data = $("#gridTruckQueue").data("kendoGrid").dataItem($("#gridTruckQueue").find("tr").eq(1));
                var transporte = { IdTransporte: data.IdTransporte, IdTipoAlbaran: data.IdTipoAlbaran }
                $.ajax({
                    type: "PUT",
                    url: "../api/FinalizarDescargaByTransporteAnonymous",
                    data: JSON.stringify(transporte),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (data) {
                    Backbone.trigger('eventRefreshColaCamionesTerminal');//SE PASA EL VALOR A TRUE PARA ACTUALIZAR EN LA WEB
                    Backbone.trigger('eventRefreshColaCamiones', true);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('UNLOAD_OK'), 4000);
                }).fail(function (err) {
                });                
            },
            eliminar: function () {                
                // unbind events that are
                // set on this view
                Backbone.off('eventRefreshColaCamionesTerminal');
                this.off();
                // same as this.$el.remove();
                this.remove();
            },
            actualiza: function (value) {
                    var self = this;
                    self.GetTruckQueue();
                
                //$("#gridTruckQueue").data("kendoGrid").dataSource.read();
            }
        });
        return VistaLogin;
    });