using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_Orden
    {
        Task<List<DTO_RelacionEnvasesProductos>> ObtenerRelacionesEnvasesProductos();
        Task<List<DTO_LoteMMPPOrden>> ObtenerLotesMateriaPrima(string idWO);
        Task<DTO_EnvasesCajasPaletProducto> GetConversionesProducto(string producto);
        Task<double> GetHectolitrosProducto(string producto);
        Task<DateTime?> CalcularFechaFinOrden(string idLinea, string idProducto, int cantidad, DateTime fechaInicio);
    }
}
