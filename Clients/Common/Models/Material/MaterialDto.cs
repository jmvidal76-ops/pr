
using System.Collections.Generic;
namespace Common.Models.Material
{
    public class MaterialDto
    {

        public string IdMaterial { get; set; }
        public string Descripcion { get; set; }
        public string SourceUoMID { get; set; }
        public string DescripcionCompleta { get; set; }
        public List<MaterialUnitsDto> UnidadesMedidaDto { get; set; }
        public MaterialUnitsDto UnidadMedidaDto { get; set; }
        public string IdClase { get; set; }
        public string Tipo { get; set; }
    }
}
