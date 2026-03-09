define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTRunTimeLocations.html', 'ALT/vALTUtils', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, templateHTML, ALTUtils, VistaDlgConfirm, Not) {
        var altUtil = new ALTUtils();
        var runTimeTreeLocs = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLruntLocs',  
            treeNodeModel: [],
            treeViewLib: null,
            data2BindSITInfo: null,
            functionSelectNode: null,
            functionFilter: null,
            idDepartmentType: null,
            initialize: function (funcSelect, funcFilter , idDepart) {
                var aux = altUtil.getData('../api/getInfoMESFilters').data;
                
                this.data2BindSITInfo =  new kendo.data.ObservableObject(aux);
                this.data2BindSITInfo.filterMES = {
                    orderTypeID: '',
                    orderID: '',
                    locationID: '',
                    turnoID: '',
                    shcID: '',
                    materialID: '',
                    lotID: ''
                };

                var self = this;
                self.idDepartmentType = idDepart;
                self.functionSelectNode = funcSelect;
                self.functionFilter = funcFilter;
            },
            template: _.template(templateHTML),
            render: function () {
                var self = this;
                $(self.el).html(self.template())
                //toolbar                
                this.$("#ALTtoolbarTree").kendoToolBar({
                    items: [
                        {
                            template: "<label>" + window.app.idioma.t('FILTRAR_POR') + "</label><select id='selectfilterType' style='width: 120px'><option value='ALTtree'>" + window.app.idioma.t('ALT_LOCATIONS') + "</option><option value='ALTInfoMES'>" + window.app.idioma.t('ALT_INFO_PROCESO') + "</option></select>" 
                        },
                        {
                            template: "<a id='btnManualTrigger' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVO') + "</a>"
                        },
                        {
                            template: "<button id='btnFiltrar' class='k-button k-button-icontext' ><span class='k-icon k-i-search'></span>" + window.app.idioma.t('FILTRAR') + "</button>"
                        }
                    ]
                });
                //Add treeView   
                self.treeViewLib = this.$("#ALTtree").kendoTreeView({
                    select: self.functionSelectNode
                }).data("kendoTreeView");
                self.loadData(self.idDepartmentType);
                this.$("#selectfilterType").kendoDropDownList();
                //hide buttons
                this.$('#btnManualTrigger').hide();
                this.$('#btnFiltrar').hide();

                //DIV ALT SIT INFO
                this.$("#txtOrdenTypeID").kendoDropDownList();
                this.$("#txtTipoTurno").kendoDropDownList();
                this.$("#txtLocation").kendoAutoComplete({
                    filter: "contains",
                    dataSource: self.data2BindSITInfo.lLocationsID
                });
                this.$("#txtOrdenID").kendoAutoComplete({
                    filter: "contains",
                    dataSource: self.data2BindSITInfo.lOrdenesID
                });
                this.$("#txtSHCID").kendoAutoComplete({
                    filter: "contains",
                    dataSource: self.data2BindSITInfo.lSHCIDs
                });
                this.$("#txtMaterialTypeID").kendoAutoComplete({
                    filter: "contains",
                    dataSource: self.data2BindSITInfo.lMaterials
                });
                this.$("#txtLotID").kendoAutoComplete({
                    filter: "contains",
                    dataSource: self.data2BindSITInfo.lotsIDs
                });

                kendo.bind(this.$('#ALTInfoMES'), self.data2BindSITInfo);
                return self;
            },
            events: {
                'change #selectfilterType': 'selectFilter',
                'click  #btnFiltrar': 'filtrarMESinfo'
            },
            selectFilter: function () {               
                switch ($('#selectfilterType').val()) {
                    case 'ALTtree':                        
                        this.$('#btnManualTrigger').hide();
                        this.$('#btnFiltrar').hide();
                        this.$('#ALTtree').show();
                        this.$('#ALTInfoMES').hide();
                        break;
                    case 'ALTInfoMES':                        
                        this.$('#btnManualTrigger').hide();
                        this.$('#btnFiltrar').show();
                        this.$('#ALTInfoMES').show();
                        this.$('#ALTtree').hide();
                        break;                      
                }        
            },
            filtrarMESinfo: function(){
                console.log(this.data2BindSITInfo.filterMES);
                this.functionFilter();
            },
            loadData: function(idDepartmentType){
                this.treeNodeModel = altUtil.getLocationsForTree(idDepartmentType);
                //Añadimos nodo donde consultaremos los formularios huerfanos
                var newNode = {
                    id: -1,
                    text: window.app.idioma.t('ALT_FORMS_SIN_PDV'),
                    type: 'location',
                    imageUrl: "/ALT/img/ALT_location.png",
                    data: { ID: -1 },
                    items: [],
                };
                this.treeNodeModel.push(newNode);
                this.treeViewLib.setDataSource(new kendo.data.HierarchicalDataSource({
                    data: this.treeNodeModel
                }));
                // expand all loaded items
                this.treeViewLib.expand(".k-item");
            },
            createManualForm: function () {
                var self = this;
                var dataItem = this.treeViewLib.dataItem(this.treeViewLib.select());
                if (dataItem.type == 'form') {
                    dataItem.data.TemplatesLocations = {};
                    dataItem.data.TemplatesLocations.idDepartmentType = self.idDepartmentType;
                    altUtil.postData('../api/manualTrigger', dataItem.data);
                }
            },          
            eliminar: function () {              
                this.remove();
                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return runTimeTreeLocs;
    });