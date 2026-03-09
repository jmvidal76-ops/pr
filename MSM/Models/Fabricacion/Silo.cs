using BreadMES.Fabricacion;
using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Silo : Equipo
    {
        public double cantidadInicial { get; set; }
        public double cantidad { get; set; }
        public string idMaterial { get; set; }
        public string descMaterial { get; set; }
        public string uom { get; set; }
        public string serialNumber { get; set; }
        public int tieneLote { get; set; }

        public Silo() { }


        public Silo(int pkEquipo)
            : base(pkEquipo)
        {
            using (MESEntities context = new MESEntities())
            {
                //var pkMMLocation = context.MMLocations_FAB.Where(e => e.LocID.Equals(this.id)).FirstOrDefault();
                var MMLots = context.LoteUbicacionMaterial_FAB.AsNoTracking().Where(l => l.LocPath.Equals(this.id));

                if (MMLots.FirstOrDefault() != null)
                {
                    this.cantidadInicial = (double)MMLots.First().InitQuantity;
                    this.cantidad = (double)MMLots.Sum(l => l.Quantity);
                    this.idMaterial = MMLots.First().DefID;
                    this.descMaterial = MMLots.First().Descript;
                    this.uom = MMLots.First().UomID;
                    this.serialNumber = MMLots.First().serialNumber;
                    this.tieneLote = 1;
                }
                else
                {
                    this.tieneLote = 0;
                    this.cantidadInicial = 0.0;
                    this.cantidad = 0.0;
                    this.idMaterial = "";
                    this.descMaterial = "";
                    this.uom = "";
                    this.serialNumber = "";
                }
            }
        }
    }
}