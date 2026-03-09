using System;
namespace Common.Models.Fabricacion.Coccion
{
    public class ParametrosFabricacionDto
    {
        public int IdParametroFabricacionMaterial { get; set; }
        public int IdMaestroParametroFabricacion { get; set; }
        public int IdMaestroParametroFabricacionTipoWO { get; set; }
        public string EnumParametro { get; set; }
        public string Descripcion { get; set; }
        public string Unidad { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaActualizado { get; set; }

        public int IdTipoWO { get; set; }
        public string IdMaterial { get; set; }
        public decimal Valor { get; set; }
    }
}
