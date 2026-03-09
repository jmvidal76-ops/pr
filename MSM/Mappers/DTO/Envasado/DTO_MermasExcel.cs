using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasExcel
    {
        public List<DTO_MermasExcelRegistro> Mermas { get; set; }
        public List<DTO_MermasExcelContador> Contadores { get; set; }
    }

    public class DTO_MermasExcelRegistro
    {
        public string Turno { get; set; }
        public DateTime Fecha { get; set; }
        public string Linea { get; set; }
        public int IdMerma { get; set; }
        public string Maquina { get; set; }
        public int? IdProducto { get; set; }
        public string Consumible { get; set; }
        public string Producto { get; set; }
        public decimal Produccion { get; set; }
        public decimal Rechazo { get; set; }
        public string Proveedor { get; set; }
        public string CodigoRechazo { get; set; }
        public string Observaciones { get; set; }
    }

    public class DTO_MermasExcelContador
    {
        public int IdRegistro { get; set; }
        public DateTime FechaTurno { get; set; }
        public int IdTipoTurno { get; set; }
        public string TipoTurno { get; set; }
        public string Linea { get; set; }
        public string CodigoMaquina { get; set; }
        public string DescripcionMaquina { get; set; }
        public string ClaseMaquina { get; set; }
        public string Descripcion { get; set; }
        public bool EsProduccion { get; set; }
        public bool EsRechazo { get; set; }
        public decimal Valor { get; set; }
    }
}