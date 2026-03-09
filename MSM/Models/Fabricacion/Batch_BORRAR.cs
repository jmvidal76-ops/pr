//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using SITCAB.DataSource.Libraries;
//using Siemens.Brewing.Data.Bread;
//using Siemens.SimaticIT.POM.Breads.Types;
//using Siemens.Brewing.Data.Bread;
//using Siemens.Brewing.Shared;
//using Siemens.SimaticIT.POM.Breads;
//using Siemens.SimaticIT.PDefM.Breads.Types;
//using Siemens.Brewing.Domain.Entities;
//using System.Collections.ObjectModel;
//using Siemens.SimaticIT.PDefM.Breads;
//using Siemens.Brewing.Data;
//using Siemens.SimaticIT.MM.Breads.Types;
//using Siemens.SimaticIT.MM.Breads;

//namespace MSM.Models.Fabricacion
//{
//    public class Batch
//    {
//        private string _batchID;
//        private Int64 _unixTime;
//        private DateTime? _startDate;
//        private DateTime? _endDate;
//        private Material _materialID;
//        private string _equipoID;
//        private string _uom;
//        private TipoOrden _tipoOrden;

//        public Batch() { }

//        public string batchID
//        {
//            get { return _batchID; }
//            set { _batchID = value; }
//        }

//        public TipoOrden tipoOrden
//        {
//            get { return _tipoOrden; }
//            set { _tipoOrden = value; }
//        }

//        public Int64 unixTime
//        {
//            get { return _unixTime; }
//            set { _unixTime = value; }
//        }

//        public DateTime? startDate
//        {
//            get { return _startDate; }
//            set { _startDate = value; }
//        }

//        public DateTime? endDate
//        {
//            get { return _endDate; }
//            set { _endDate = value; }
//        }

//        public Material materialID
//        {
//            get { return _materialID; }
//            set { _materialID = value; }
//        }

//        public string equipoID
//        {
//            get { return _equipoID; }
//            set { _equipoID = value; }
//        }

//        public string uom
//        {
//            get { return _uom; }
//            set { _uom = value; }
//        }

//        public int crearInicioWO(SitOrder plo)
//        {
//            Precheck precheckInicioBatch = new Precheck();
//            Dictionary<int, string> resultado = new Dictionary<int, string>();

//            resultado = precheckInicioBatch.hacerPrecheckInicioBatch(plo);

//            if (resultado.Count > 0)
//            {
//                return -1; //Logeamos en la tabla de errores de la template
//            }
//            else
//            { 
//                //Crear WO
//                SITCAB.DataSource.Libraries.ReturnValue res = new SITCAB.DataSource.Libraries.ReturnValue(true);

//                string orderTypeDec = SitOrder_BREAD.GetOrderTypeDesc(plo.TypeID);
//                Order_BREAD orderBread = BreadFactory.Create<Order_BREAD>();
//                Order lastPO = orderBread.Select("ID DESC", 0, 0, string.Format("{{Description}} = 'PO' and {{TypeID}} = '{0}' and {{ID}} like 'PO-{1}-%'", plo.TypeID, orderTypeDec)).FirstOrDefault();
//                int counter = 1;
//                if (lastPO != null)
//                {
//                    string[] array = lastPO.ID.Split('-');
//                    counter = int.Parse(array.Last()) + 1;
//                }


//                string orderId = string.Format("PO-{0}-{1}", orderTypeDec, counter.ToString("D5"));

//                Siemens.SimaticIT.PDefM.Breads.Types.ProductProductionRule ppr = GetPpr(plo);
//                Order pomPLO = SitOrder_BREAD.GetPomOrder(plo);
//                string xml =
//                    string.Format(@"<CREATE_ORDER_FROM_PRODUCT VERSION=""1"">
//        <ORDER>
//                <ORDER_ID>{0}</ORDER_ID>
//                <CREATION_MODE>Manual</CREATION_MODE>
//                <PLANT_ID>{1}</PLANT_ID>
//                <PLANT_VERSION>01.00</PLANT_VERSION>
//                <PPR_ID>{2}</PPR_ID>
//                <PPR_VERSION>{3}</PPR_VERSION> 
//                <QUANTITY>{4}</QUANTITY> 
//                <UOM>{5}</UOM>
//                <ORDER_STATUS_ID>Ready</ORDER_STATUS_ID>
//                <ORDER_TRANSITION_GROUP_ID>EMI_PO_Order</ORDER_TRANSITION_GROUP_ID>
//                <ENTRY_STATUS_ID>Ready</ENTRY_STATUS_ID>
//                <ENTRY_TRANSITION_GROUP_ID>EMI_PO_Entry</ENTRY_TRANSITION_GROUP_ID>
//                <PRIORITY>-1</PRIORITY>
//                <HEALTH_CHECK_ON_PPR>
//                        <DELAY_FROM_LATEST>P5Y</DELAY_FROM_LATEST>
//                </HEALTH_CHECK_ON_PPR>
//        </ORDER>
//</CREATE_ORDER_FROM_PRODUCT>", orderId, SitConfiguration.PlantName, ppr.PPRName, ppr.PPRVersion, pomPLO.FinalMaterialQuantity, ppr.BatchUoMID);
//                Order_BREAD.CreateFromPPRResult[] createFromPPRResult;

//                res = orderBread.CreateFromPPR(xml, out createFromPPRResult);

//                if (!res.succeeded) return 0;

//                string equipId = SitOrder_BREAD.GetOrderPropertyValueString(plo, "FromTank");
//                PostProcessing(orderId, plo.ID, ppr, equipId, plo.FinalMaterialID, pomPLO.FinalMaterialQuantity, pomPLO.EstimatedStartTime, pomPLO.EstimatedEndTime);
                
//                //FIN DE CREAR LA WO

//                PostCheck postcheckInicioBatch = new PostCheck();
//                resultado = new Dictionary<int, string>();

//                resultado = postcheckInicioBatch.hacerPostcheckInicioBatch(plo);
                
                
//                return 0;
//            }

//        }


//        public static Siemens.SimaticIT.PDefM.Breads.Types.ProductProductionRule GetPpr(SitOrder SelectedOrder)
//        {

//            string workCenter = SitOrder_BREAD.GetOrderPropertyValueString(SelectedOrder, "Resource");
//            String condition = string.Format("{{Type}} = '{0}' and {{PlantName}} = '{1}.PLN' and {{Valid}} = 'True' and {{Status}} = 'AP' and {{PPRName}} like '%{2}%' ",
//                SelectedOrder.TypeID, SitConfiguration.PlantName, workCenter);
//            ProductProductionRule_BREAD productProductionRuleBread = BreadFactory.Create<ProductProductionRule_BREAD>();
//            Collection<Siemens.SimaticIT.PDefM.Breads.Types.ProductProductionRule> pprList = productProductionRuleBread.Select("Approved DESC", 0, 0, condition);
//            Siemens.SimaticIT.PDefM.Breads.Types.ProductProductionRule ppr = pprList.FirstOrDefault(x => x.FinalMaterialID.Equals(SelectedOrder.FinalMaterialID));
//            if (ppr == null)
//                ppr = pprList.First(x => x.PPRName.StartsWith(SitConfiguration.PlantName));
//            return ppr;
//        }

//        public static SITCAB.DataSource.Libraries.ReturnValue PostProcessing(string orderId, string ploId, Siemens.SimaticIT.PDefM.Breads.Types.ProductProductionRule ppr,
//        string equipId, string finalMaterialID, double? finalMaterialQuantity, DateTime? estimatedStartTime, DateTime? estimatedEndTime)
//        {
//            SITCAB.DataSource.Libraries.ReturnValue res = new SITCAB.DataSource.Libraries.ReturnValue(true);
//            Siemens.SimaticIT.POM.Breads.MaterialSpecification_BREAD materialSpecificationPOMBread = BreadFactory.Create<Siemens.SimaticIT.POM.Breads.MaterialSpecification_BREAD>();
//            ProductProductionRule_BREAD productProductionRuleBread = BreadFactory.Create<ProductProductionRule_BREAD>();
//            SitOrder po = SitOrder_BREAD.SelectByID(orderId);
//            if (ppr == null) ppr = productProductionRuleBread.Select("", 0, 0, string.Format("{{PPRName}} ='{0}'", po.MainEntryPPRName)).Single();
//            Order pomPO = SitOrder_BREAD.GetPomOrder(po);
//            Entry pomMainEntry = SitOrder_BREAD.GetPomMainEntry(po);
//            pomMainEntry.OutputMaterialID = pomPO.FinalMaterialID = finalMaterialID;
//            pomMainEntry.Quantity = pomPO.FinalMaterialQuantity = finalMaterialQuantity;

//            if (estimatedStartTime.HasValue)
//                pomMainEntry.EstimatedStartTime = pomPO.EstimatedStartTime = estimatedStartTime;
//            if (estimatedEndTime.HasValue)
//                pomMainEntry.EstimatedEndTime = pomPO.EstimatedEndTime = estimatedEndTime;
//            pomPO.ERPID = pomPO.ID;
//            Order_BREAD orderBread = BreadFactory.Create<Order_BREAD>();

//            res = orderBread.Edit(pomPO);
//            if (!res.succeeded) return res;

//            Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
//            res = entryBread.Edit(pomMainEntry);
//            if (!res.succeeded) return res;


//            if (!string.IsNullOrEmpty(ploId))
//            {
//                res = SitPomProperty_BREAD.SetOrderCF(po, "PlannedOrderId", ploId);
//                if (!res.succeeded) return res;
//            }

//            //se è gestito a tank setto l' exec equipment prendendolo dal from tank del plo
//            if (po.UseTank && !string.IsNullOrEmpty(equipId))
//            {

//                ExecutionEquipment_BREAD executionEquipmentBread = BreadFactory.Create<ExecutionEquipment_BREAD>();
//                //remove all execution equipment
//                foreach (ExecutionEquipment equipment in executionEquipmentBread.Select("", 0, 0, string.Format("{{OrderID}} = '{0}'", po.ID)))
//                {
//                    res = executionEquipmentBread.Delete(equipment);
//                    if (!res.succeeded) return res;
//                }

//                foreach (Entry entry in entryBread.Select("", 0, 0, string.Format("{{OrderID}} = '{0}'", po.ID)))
//                {
//                    res = SitBread.SetExecutionEquipment(entry.ID, equipId).ReturnValue;
//                    if (!res.succeeded) return res;
//                }

//                res = SitPomProperty_BREAD.SetOrderCF(po, "FromTank", equipId);
//                if (!res.succeeded) return res;

//            }
//            res = CreateMaterialSpecification(po, "CONSUMED");
//            if (!res.succeeded) return res;

//            // ppr Is default ==>> add materials
//            if (ppr.PPRName.StartsWith(SitConfiguration.PlantName))
//            {
//                //change final material
//                Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD materialSpecificationItemBread = BreadFactory.Create<Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD>();
//                Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem producedItem =
//                    materialSpecificationItemBread.Select("", 0, 0, string.Format("{{OrderID}} = '{0}' and {{MaterialSpecificationName}} = 'PRODUCED'", po.ID)).SingleOrDefault();
//                if (producedItem != null)
//                {
//                    producedItem.Quantity = pomPO.FinalMaterialQuantity;
//                    producedItem.UoMID = pomPO.FinalMaterialUoMID;
//                    producedItem.DefID = pomPO.FinalMaterialID;
//                    res = materialSpecificationItemBread.Edit(producedItem);
//                }
//                else
//                {
//                    Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification produced =
//                    materialSpecificationPOMBread.Select("", 0, 0, string.Format("{{EntryID}} = '{0}' and {{Name}} = 'PRODUCED'", po.MainEntryID)).Single();
//                    producedItem = new Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem();
//                    producedItem.OrderID = po.ID;
//                    producedItem.EntryID = po.MainEntryID;
//                    producedItem.MaterialSpecificationType = produced.Type;
//                    producedItem.MaterialSpecificationPK = produced.PK;
//                    producedItem.MaterialSpecificationName = produced.Name;
//                    producedItem.Quantity = pomPO.FinalMaterialQuantity;
//                    producedItem.UoMID = pomPO.FinalMaterialUoMID;
//                    producedItem.DefID = pomPO.FinalMaterialID;
//                    res = materialSpecificationItemBread.Create(producedItem);
//                }
//                if (!res.succeeded) return res;

//                //id there is a BOM add consumed


//                BomAlternative_BREAD bomAlternativeBread = BreadFactory.Create<BomAlternative_BREAD>();
//                BomItem_BREAD bomItemBread = BreadFactory.Create<BomItem_BREAD>();
//                String sortBy = "Priority DESC";
//                String condition = string.Format("{{DefinitionID}}  = '{0}'", finalMaterialID);
//                BomAlternative bom = bomAlternativeBread.Select(sortBy, 0, 0, condition).FirstOrDefault();

//                if (bom != null)
//                {

//                    Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification consumed = materialSpecificationPOMBread.Select("", 0, 0, string.Format("{{EntryID}} = '{0}' and {{Name}} = 'CONSUMED'", po.MainEntryID)).Single();

//                    Decimal factor = 1;

//                    factor = Convert.ToDecimal(pomPO.FinalMaterialQuantity.Value) / bom.Quantity;
//                    Collection<BomItem> bomItems = bomItemBread.SelectByBomAlternativePK(bom.PK, "", 0, 0, "");

//                    foreach (BomItem bomItem in bomItems.Where(x => x.Quantity >= 0))
//                    {
//                        res = AddBomItem(po, consumed, factor, bomItem);
//                        if (!res.succeeded) return res;
//                    }
//                    //if there is some negative quantity BOM Item
//                    if (bomItems.Any(x => x.Quantity < 0))
//                    {
//                        //se non cè creo il reworked
//                        res = CreateMaterialSpecification(po, "REWORKED");
//                        if (!res.succeeded) return res;

//                        Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification reworked = materialSpecificationPOMBread.Select("", 0, 0, string.Format("{{EntryID}} = '{0}' and {{Name}} = 'REWORKED'", po.MainEntryID)).Single();
//                        foreach (BomItem bomItem in bomItems.Where(x => x.Quantity < 0))
//                        {
//                            res = AddBomItem(po, reworked, -factor, bomItem);
//                            if (!res.succeeded) return res;
//                        }

//                    }

//                }



//            }

//            else
//            {
//                Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD materialSpecificationItemBread = BreadFactory.Create<Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD>();
//                Siemens.SimaticIT.PDefM.Breads.MaterialSpecificationItem_BREAD materialSpecificationItemPDefMBread = BreadFactory.Create<Siemens.SimaticIT.PDefM.Breads.MaterialSpecificationItem_BREAD>();
//                Collection<Siemens.SimaticIT.PDefM.Breads.Types.MaterialSpecificationItem> pprItems = materialSpecificationItemPDefMBread.Select("", 0, 0, string.Format("{{PPRName}} = '{0}'", ppr.PPRName));
//                //rescale material specification ITEMS
//                decimal factor = 1;
//                Siemens.SimaticIT.PDefM.Breads.Types.MaterialSpecificationItem pprItem = pprItems.Single(x => x.MaterialSpecificationName.Equals("PRODUCED", StringComparison.InvariantCultureIgnoreCase));

//                factor = Convert.ToDecimal(pomPO.FinalMaterialQuantity.Value) / Convert.ToDecimal(pprItem.Quantity);
//                foreach (Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem pomItem in materialSpecificationItemBread.Select("", 0, 0, string.Format("{{OrderID}} = '{0}'", po.ID)))
//                {
//                    pprItem = pprItems.Single(x => x.DefID.Equals(pomItem.DefID) && x.MaterialSpecificationName.Equals(pomItem.MaterialSpecificationName));
//                    pomItem.Quantity = Convert.ToDouble(Math.Round((Convert.ToDecimal(pprItem.Quantity) * factor) * 1000m) / 1000m);//pprItem.Quantity * factor;
//                    res = materialSpecificationItemBread.Edit(pomItem);
//                    if (!res.succeeded) return res;
//                }
//            }

//            return res;
//        }



//        private static SITCAB.DataSource.Libraries.ReturnValue CreateMaterialSpecification(SitOrder po, string matSpecName)
//        {
//            SITCAB.DataSource.Libraries.ReturnValue res = new SITCAB.DataSource.Libraries.ReturnValue(true);
//            //add consumed
//            Siemens.SimaticIT.POM.Breads.MaterialSpecification_BREAD materialSpecificationPOMBread = BreadFactory.Create<Siemens.SimaticIT.POM.Breads.MaterialSpecification_BREAD>();
//            Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification matSpec =
//                  materialSpecificationPOMBread.Select("", 0, 0, string.Format("{{EntryID}} = '{0}' and {{Name}} = '{1}'", po.MainEntryID, matSpecName)).SingleOrDefault();

//            if (matSpec == null)
//            {
//                matSpec = new Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification();
//                matSpec.OrderID = po.ID;
//                matSpec.EntryID = po.MainEntryID;
//                matSpec.EntryPK = po.MainEntryPK.Value;
//                matSpec.Type = matSpecName.Equals("CONSUMED", StringComparison.InvariantCultureIgnoreCase) ? "Input" : "Output";
//                matSpec.ExpectedLevelOfDetail = "MaterialDefinition";
//                matSpec.Name = matSpecName; //"CONSUMED";
//                res = materialSpecificationPOMBread.Create(matSpec);
//                //if (!res.succeeded) return res;

//            }
//            return res;
//        }

//        private static SITCAB.DataSource.Libraries.ReturnValue AddBomItem(SitOrder po, Siemens.SimaticIT.POM.Breads.Types.MaterialSpecification consumed, decimal factor, BomItem bomItem)
//        {

//            Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD materialSpecificationItemBread = BreadFactory.Create<Siemens.SimaticIT.POM.Breads.MaterialSpecificationItem_BREAD>();
//            Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem materialItem = new Siemens.SimaticIT.POM.Breads.Types.MaterialSpecificationItem();
//            materialItem.OrderID = po.ID;
//            materialItem.EntryID = po.MainEntryID;
//            materialItem.MaterialSpecificationType = consumed.Type;
//            materialItem.MaterialSpecificationPK = consumed.PK;
//            materialItem.MaterialSpecificationName = consumed.Name;

//            materialItem.Quantity = Convert.ToDouble(Math.Round((bomItem.Quantity * factor) * 1000m) / 1000m);
//            materialItem.UoMID = bomItem.UoMID;
//            materialItem.DefID = bomItem.DefinitionID;
//            return materialSpecificationItemBread.Create(materialItem);
//        }

//    }
//}