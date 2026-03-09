using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mermas
{
    public class DTO_DatosMermas
    {
        public int Id { get; set; }                         
        public DateTime? Fecha { get; set; }
        public string Direccion { get; set; }

        public int? Linea { get; set; }
        public int? IdMovimiento { get; set; }
        public string UbicacionSiloOrigen { get; set; }

        public int? IdLoteOrigen { get; set; }
        public int? IdTipoMaterialMovimientoOrigen { get; set; }
        public string LoteMESOrigen { get; set; }
        public string IdClaseMaterialOrigen { get; set; }
        public int IdUbicacionOrigen { get; set; }
        public string UbicacionOrigen { get; set; }

        public int? IdLoteDestino { get; set; }
        public int? IdTipoMaterialMovimientoDestino { get; set; }
        public string LoteMESDestino { get; set; }
        public string IdClaseMaterialDestino { get; set; }
        public int IdUbicacionDestino { get; set; }
        public string UbicacionDestino { get; set; }

        public string CodProducto { get; set; }
        public string DescripcionProducto { get; set; }

        public string SSCC { get; set; }
        public string CodWO { get; set; }

        public decimal? Cantidad { get; set; }
        public decimal? Rendimiento { get; set; }
        public decimal? Humedad { get; set; }
        public decimal? Extracto { get; set; }
        public decimal? GradoPlato { get; set; }
        public int? FormulaCalculo { get; set; }

        public bool? Editado { get; set; }
        public bool? Borrado { get; set; }

        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }

  
}