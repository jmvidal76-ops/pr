using MSM.BBDD.Model;

namespace MSM.Mappers.DTO.Logistica
{
    public class DTO_MovimientosVacio
    {
        public MovimientosVacio MovimientosVacio { get; set; }
        public string DescripcionMovimiento { get; set; }
        public string DescripcionCaja { get; set; }
    }
}