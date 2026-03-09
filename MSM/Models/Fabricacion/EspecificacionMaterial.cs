using MSM.BBDD.Model;
using Siemens.Brewing.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class EspecificacionMaterial
    {
        public EspecificacionMaterial()
        {
            this.DetalleEspecificacion = new List<DetalleEspecificacionMaterial>();
        }

        public string Id_Material { get; set; }
        public string NombreEm { get; set; }
        public string Descripcion_Material { get; set; }
        public string Id_ORDEN { get; set; }

        public Nullable<double> Cantidad_Estimada { get; set; }
        public string Unidad_Medida { get; set; }
        public int Cod_Orden { get; set; }
        public System.DateTime FechaTransferencia { get; set; }
        public string Equipo_Origen { get; set; }
        public Nullable<double> Cantidad_Actual { get; set; }

        public List<DetalleEspecificacionMaterial> DetalleEspecificacion { get; set; }

        public Nullable<double> Total_Cantidad_Actual
        {
            get
            {
                double cantidad = 0;
                foreach (DetalleEspecificacionMaterial detespm in this.DetalleEspecificacion)
                {
                    cantidad += detespm.Cantidad_Actual == null ? 0 : detespm.Cantidad_Actual.Value;
                }
                return cantidad;
            }
        }

        public bool IsReworked
        {
            get
            {
                return SitString.AreEquals(this.NombreEm, "Reworked");
            }
        }


        public bool IsProduced
        {
            get
            {
                return SitString.AreEquals(this.NombreEm, "Produced");
            }
        }
    }
}