using MSM.BBDD.Model;

namespace MSM.Mappers.DTO.Logistica
{
    public class DTO_MermasStockVacio
    {
        public MermasStockVacio MermasStockVacio { get; set; }
        public string DescripcionLinea { get; set; }
        public string FormatoComun { get; set; }
        public string DescripcionProducto { get; set; }
    }
}