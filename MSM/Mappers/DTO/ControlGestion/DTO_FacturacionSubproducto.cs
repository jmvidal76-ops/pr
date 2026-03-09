using Common.Models.Transporte;
using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.ControlGestion
{
    public class DTO_FacturacionSubproducto
    {
        public TransporteDto Transporte { get; set; }
        public ClienteDto Cliente { get; set; }
        public ProductoDto Producto { get; set; }
        public List<DTO_FacturacionSubproductosHistorico> HistoricoFacturacion { get; set; }
    }
}