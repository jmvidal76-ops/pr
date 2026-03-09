using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    /// <summary>
    /// Clase de TipoOrden
    /// Correspondiente a la vista TipoOrden_FAB
    /// </summary>
    public class PlantillaConsumoMMPP_DTO
    {
        public int IdPlantillaConsumo { get; set; }
        public string Descripcion { get; set; }
        public int IdTipoWO { get; set; }
        public string CodigoJDE { get; set; }
        public Nullable<decimal> CantidadTeorica { get; set; }
        public Nullable<decimal> ValorMinimoRequerido { get; set; }
        public Nullable<decimal> ValorMaximoRequerido { get; set; }
        public string Unidad { get; set; }
        public Nullable<int> IdTipoDisparadorConsumo { get; set; }
        public Nullable<int> IdModoDescuento { get; set; }
        public string DescModoDescuento { get; set; }
        public Nullable<int> IdUbicacionOrigen { get; set; }
        public Nullable<int> IdIndicadorMMPPAsignadas { get; set; }
        public Nullable<bool> Activa { get; set; }
        public string DescTipoWO { get; set; }
        public string DescTipoDisparador { get; set; }
        public string NombreUbicacion { get; set; }
        public string DescripcionUbicacion { get; set; }
        public string DescIndicador { get; set; }
        public string ColorIndicador { get; set; }
    }
}