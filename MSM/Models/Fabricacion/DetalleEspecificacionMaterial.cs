using MSM.BBDD.Fabricacion;
using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace MSM.Models.Fabricacion
{
    public class DetalleEspecificacionMaterial
    {
        public System.DateTime FechaTransferencia { get; set; }
        public string Equipo_Origen { get; set; }
        public string Unidad_Medida { get; set; }
        public Nullable<double> Cantidad_Actual { get; set; }

        public string Equipo_Descripcion
        {
            get
            {
                if (!string.IsNullOrEmpty(this.Equipo_Origen))
                {
                    Equipo_FAB equipo = DAO_Equipo.GetEquipoPorNombre(this.Equipo_Origen);
                    return equipo == null? string.Empty : equipo.Descripcion;
                }
                else
                {
                    return string.Empty;
                }
            }
        }
    }
}
