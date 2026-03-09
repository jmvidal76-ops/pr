using MSM.BBDD.Model;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_ConfiguracionEmpaquetadoras
    {
        public ConfiguracionEmpaquetadoras ConfiguracionEmpaquetadoras { get; set; }
        public string DescripcionLinea { get; set; }
        public string FormatoComun { get; set; }
        public string DescripcionProducto { get; set; }
    }
}