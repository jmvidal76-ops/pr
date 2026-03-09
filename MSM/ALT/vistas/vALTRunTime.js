define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTrunTime.html', 'ALT/vALTRunTimeLocations', 'ALT/vALTRunTimeForms', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTTemplate, comTreeLoc, comGridForms, VistaDlgConfirm, Not) {
        var ALTRunTime = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLrunTime',
            ds: null,
            dialogEdit: null,
            comTreeView: null,
            comGridForms: null,
            filtersData: null,
            template: _.template(ALTTemplate),
            initialize: function (filters) {
                var self = this;
                self.filtersData = filters;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeSplitter);

                self.comTreeView = new comTreeLoc(
                    function (e) {
                        var dataItem = this.dataItem(e.node);
                        //// Obtenemos los nodos padre del que tenemos
                        //var itemsList = $(e.node).add($(e.node).parentsUntil('.k-treeview', '.k-item'));
                        //// Nos quedamos con los nombres
                        //var texts = $.map(itemsList, function (item) {
                        //        return $(item).find('>div span.k-in').text();
                        //});
                        //// Eliminamos el nombre del nodo actual
                        //texts.pop();

                        //dataItem.data.nodeSelectedPath = texts.join(' \\ ');

                        switch (dataItem.type) {
                            case "location":
                                //ADD COMPONENT GRID FORMS INTANCES
                                self.comGridForms.setFilters({ idLoc: dataItem.data.ID, idForm: null, infoSIT: null });
                                self.comGridForms.refreshGrid();
                                //Buttons for this node
                                $('#btnManualTrigger').hide();
                                break;
                            case "form":
                                self.comGridForms.setFilters({
                                    idLoc: dataItem.data.idLoc,
                                    idForm: dataItem.data.idTemForm,
                                    infoSIT: null,
                                    path: dataItem.data.path
                                });
                                self.comGridForms.refreshGrid();
                                $('#btnManualTrigger').show();
                                break;
                            case "trigger":
                                $('#btnManualTrigger').hide();
                                break;
                        }
                    },
                    function () {
                        self.comGridForms.setFilters({ idLoc: null, idForm: null, infoSIT: self.comTreeView.data2BindSITInfo.filterMES });
                        self.comGridForms.refreshGrid();
                    },
                    filters.idDepartmentType); //0 cel 1 seo
                self.comGridForms = new comGridForms(filters);
                // self.render();
            },
            render: function () {
                var self = this;
                $(self.el).html(self.template())

                $("#center-pane").append($(self.el))

                //split
                $("#alt-horizontal").kendoSplitter({
                    panes: [
                        { collapsible: false, size: "300px" },
                        { collapsible: false }
                    ]
                });
                //ADD COMPONENT TREE
                $("#alt-left").append(self.comTreeView.render().el);
                //ADD COMPONENT FORM
                $("#alt-main").append(self.comGridForms.render().el);
                //INI AUTO RESIZE

                var browserWindow = $(window);
                self.resizeSplitter();
            },
            resizeSplitter: function () {
                var outerSplitter = $("#alt-horizontal").data("kendoSplitter");
                var headerFooterHeight = $("#divCabeceraVista").height();
                outerSplitter.wrapper.height($("#center-pane").height() - headerFooterHeight);
                $("#ALTtree").height(outerSplitter.wrapper.height() - $("#ALTtoolbarTree").height());
                outerSplitter.resize();
            },
            events: {
                'click #btnManualTrigger': 'createForm'
            },
            createForm: function () {
                var self = this;
                var permiso;

                if (this.comTreeView.idDepartmentType === "0") {
                    permiso = (self.filtersData.statusFinalizado ? TienePermiso(236) : TienePermiso(184))
                } else {
                    permiso = (self.filtersData.statusFinalizado ? TienePermiso(238) : TienePermiso(190))
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.comTreeView.createManualForm();
                this.comGridForms.refreshGrid();
            },
            eliminar: function () {
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.unbind("resize", self.resizeSplitter);

                //remove components
                this.comGridForms.eliminar();
                this.comTreeView.eliminar();
                // same as this.$el.remove();
                this.remove();
                // unbind events that are
                // set on this view
                this.off();
                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            selectTreeNode: function (e) {

                var dataItem = this.dataItem(e.node);
                switch (dataItem.type) {
                    case "location":
                        //ADD COMPONENT GRID FORMS INTANCES
                        //if (self.comGridForms) self.comGridForms.eliminar();
                        this.comGridForms.idLoc = dataItem.data.ID;
                        this.comGridForms.refreshGrid();
                        //Buttons for this node
                        $('#btnManualTrigger').hide();
                        break;
                    case "form":
                        $('#btnManualTrigger').show();
                        break;
                    case "trigger":
                        $('#btnManualTrigger').hide();
                        break;
                }
            }
        });


        return ALTRunTime;
    });