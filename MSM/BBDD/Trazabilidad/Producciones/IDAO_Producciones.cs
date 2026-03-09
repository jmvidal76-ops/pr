using Common.Models.Almacen;
using Common.Models.Operation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Producciones
{
   
    public interface IDAO_Producciones
    {
        Task<List<dynamic>> Get();

        Task<List<dynamic>> GetByDates(string fechaInicio, string fechaFin);

        Task<List<dynamic>> GetByOrder(string idOrden);

        Task<dynamic> DeleteConsum(ConsumDto consumo);

        Task<List<dynamic>> GetBomMaterialByProduct(string idProducto);

        Task<List<dynamic>> GetUbicacionesByIdLinea(string numLinea);

        Task<List<dynamic>> GetUbicacionLoteByRefMaterial(string refMaterial);

        Task<dynamic> AddConsum(ConsumDto consumo);

        Task<dynamic> UpdateConsum(ConsumDto consum);

        Task<List<dynamic>> GetPartitionsByIDAndLinea(string numLinea, string referencia);

        Task<List<dynamic>> GetProductionsOffsetById(string idProduccion);

        Task<List<dynamic>> GetProduccionCosumByIdAndLocation(string idProduccion, string ubicacion);

        Task<dynamic> UpdateOffset(ProductionOffSetsDto production);

        Task<dynamic> UpdateQuarantine(UpdProduccionDto upd);

        Task<dynamic> UpdProduccionBlocking(UpdProduccionDto upd);

        Task<dynamic> UpdProducctionLabel(UpdProduccionDto upd);

        Task<bool> UpdProductionPartition(ProduccionesDto produccionesDto);

        Task<bool> AnularHabilitarEtiquetas(ProduccionesDto produccionesDto);

        Task<bool> ModificarFechaProduccion(ProduccionesDto produccionesDto);

        Task<bool> GuardarSSCCMuestraTomada(PaletsProductoAcabadoMuestrasDto dto);

    }
}