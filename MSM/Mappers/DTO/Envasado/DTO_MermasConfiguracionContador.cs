using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasConfiguracionContador
    {
        public int? Id { get; set; }
        public int IdMaestroContador { get; set; }
        public string Linea { get; set; }
        public int IdMaquina { get; set; }
        public string CodigoMaquina { get; set; }
        public string DescripcionMaquina { get; set; }
        public string ClaseMaquina { get; set; }
        public string Descripcion { get; set; }
        public int? TipoGlobal { get; set; }
        public string TipoGlobalNombre { get; set; }
        public bool EsContadorProduccion { get; set; }
        public string EsContadorProduccionStr { get {
                return EsContadorProduccion.ToString();
            } 
        }
        public bool RechazoTotal { get; set; }
        public string RechazoTotalStr { get {
                return RechazoTotal.ToString();
            } 
        }
        public decimal PorcentajeMinimo { get; set; }
        public decimal PorcentajeMaximo { get; set; }
        public bool CapturaAutomatica { get; set; }
        public string ClaseEnvase { get; set; }
        public int Orden { get; set; }
        public bool Incluido { get; set; }
        public bool Activo { get; set; }
    }
}