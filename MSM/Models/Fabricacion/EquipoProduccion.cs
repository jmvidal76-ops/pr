using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;

namespace MSM.Models.Fabricacion
{
    public class EquipoProduccion : Equipo
    {
        public string idMaterial { get; set; }
        public string descMaterial { get; set; }
        public string orden { set; get; }
        public string numeroCoccion { get; set; }
        public string uom { get; set; }
        public int tieneOrden { get; set; }
        public String lote { get; set; }
        public decimal batchQuantity { get; set; }

        public EquipoProduccion() { }


        public EquipoProduccion(int pkEquipo)
            : base(pkEquipo)
        {
            using (MESEntities context = new MESEntities())
            {
                this.tieneOrden = 0;
                this.idMaterial = "";
                this.orden = "";
                this.numeroCoccion = "-";
                this.uom = "-";
                this.descMaterial = "-";
                this.lote = "-";
                this.batchQuantity = 0;

                var equipoOrden = context.Equipo_FAB.AsNoTracking().Where(l => l.EquipoPK == pkEquipo).Select(e => e.ID).FirstOrDefault();

                if (equipoOrden != null)
                {
                    if (equipoOrden.Contains("COCCION"))
                    {
                        equipoOrden = context.Equipo_FAB.AsNoTracking().Where(l => l.EquipoPK == pkEquipo).Select(o => o.ID_ORDEN).FirstOrDefault();

                        var orden = context.Ordenes_FAB.AsNoTracking().Where(o => o.ID_Orden.Equals(equipoOrden)).FirstOrDefault();

                        if (orden != null)
                        {
                            this.idMaterial = orden.Cod_Material;
                            this.orden = equipoOrden;
                            this.numeroCoccion = this.orden.Substring(this.orden.LastIndexOf('-') + 1, 4);
                            this.uom = orden.UOM_Material;
                            this.tieneOrden = 1;

                            var material = context.Materiales_FAB.AsNoTracking().Where(m => m.IdMaterial.Equals(this.idMaterial)).Select(p => p.Descripcion).FirstOrDefault();
                            if (material != null)
                                this.descMaterial = material;
                            else
                                this.descMaterial = "Material no encontrado";
                        }
                    }
                    else
                    {                        
                        if (equipoOrden.Contains("FL"))
                        {
                            Equipo_FAB unit = context.Equipo_FAB.AsNoTracking().Where(l => l.EquipoPK == pkEquipo).FirstOrDefault();
                            Entry_BREAD procedimiento = new Entry_BREAD();
                            //Equivale a un distinct agrupas y devuelve el primer registro de cada grupo
                            //GroupBy(item => item.OrderPK).Select(item => item.FirstOrDefault().OrderPK)
                            List<int> entriesOrders = procedimiento.Select("", 0, 0, "{ExecutionEquipmentID}='" + unit.ID + "'").GroupBy(item => item.OrderPK).Select(item => item.FirstOrDefault().OrderPK).ToList();
                           
                            Order_BREAD order = new Order_BREAD();
                            entriesOrders.ForEach(delegate(int item) {
                               var po = order.SelectByPK(item).FirstOrDefault();
                                if (po.StatusID.Equals("In Progress"))
                                {
                                    this.tieneOrden = po.PK != 0 ? 1 : 0;
                                    this.orden = po.ID;
                                    this.uom = po.FinalMaterialUoMID;

                                    Celda_FAB celda = context.Celda_FAB.AsNoTracking().Where(i => i.CeldaPK == unit.CeldaPK.Value).FirstOrDefault();

                                    Lot_BREAD location = new Lot_BREAD();
                                    Lot activateBatch = location.Select("LastDate DESC", 0, 1, "{LocationPath} like '" + celda.ID + "%' AND {DefinitionID}='" + po.FinalMaterialID +
                                                     "' AND {ID} like '%" + po.ID.Substring(po.ID.Length - 4, 4) + "' AND {Quantity} > 0").FirstOrDefault();

                                    if (activateBatch != null)
                                    {
                                        this.idMaterial = po.FinalMaterialID;
                                        this.batchQuantity = Decimal.Parse(po.FinalMaterialQuantity.Value.ToString());
                                        Definition_BREAD materialProducido = new Definition_BREAD();
                                        this.descMaterial = materialProducido.Select("", 0, 0, "{ID}='" + po.FinalMaterialID + "'").FirstOrDefault().Description;
                                    }
                                }
                            });                            
                        }
                        else
                        {
                            equipoOrden = context.Equipo_FAB.AsNoTracking().Where(l => l.EquipoPK == pkEquipo).Select(o => o.Name).FirstOrDefault();
                            //Busco el batch y su cantidad relacionada con el equipo
                            if (equipoOrden != null)
                            {
                                Location_BREAD equipoLocation = new Location_BREAD();
                                Location equipo = equipoLocation.Select("", 0, 0, "{Name}='" + equipoOrden + "'").FirstOrDefault();
                                if (equipo != null)
                                {
                                    Lot_BREAD batches = new Lot_BREAD();
                                    Lot batch = batches.Select("{CreateDate} asc", 0, 0, "{LocationPK} =" + equipo.PK.ToString() + " AND {Quantity} > 0").FirstOrDefault();
                                    if (batch != null)
                                    {
                                        this.idMaterial = batch.DefinitionID;
                                        this.uom = batch.UoMID;
                                        this.lote = batch.Name;
                                        this.batchQuantity = batch.Quantity;
                                        //Se obtiene la información del material a partir del batch
                                        Definition_BREAD mmDef = new Definition_BREAD();
                                        Definition material = mmDef.Select("", 0, 0, "{ID}='" + batch.DefinitionID + "'").FirstOrDefault();
                                        if (material != null)
                                        {
                                            this.descMaterial = material.Description;
                                            //se obtienen los datos de la orden a partir del procedimiento
                                            Entry_BREAD entry = new Entry_BREAD();
                                            Entry procedimiento = entry.Select("{ActualStartTime} desc", 0, 0, "{EquipmentPK}=" + pkEquipo.ToString()).FirstOrDefault();
                                            if (procedimiento != null)
                                            {
                                                Order_BREAD po = new Order_BREAD();
                                                Order order = po.Select("", 0, 0, "{PK}=" + procedimiento.OrderPK.ToString()).FirstOrDefault();
                                                if (order != null)
                                                {
                                                    if (order.StatusID.Equals("In Progress"))
                                                    {
                                                        this.orden = order.ID;
                                                        this.tieneOrden = 1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }
    }
}