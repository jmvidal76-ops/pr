using Common.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasContador
    {
        public int Id { get; set; }
        public int IdRegistro { get; set; }
        public decimal? ContadorProduccion { get; set; }
        public DTO_MermasConfiguracionContador ContadorConfiguracion {get; set;}
        public decimal Valor { get; set; }
        public decimal Porcentaje { get
            {
                if (ContadorProduccion == null || ContadorProduccion == 0)
                {
                    return 0;
                }

                return (Valor * 100) / (ContadorProduccion ?? 1);
            }
        }
        public string Unidad { get; set; }
        public string Justificacion { get; set; }
        public TipoEnumEstadoMermas Estado { get
            {
                if (ContadorConfiguracion == null) {
                    return TipoEnumEstadoMermas.CORRECTO;
                }
                if (ContadorConfiguracion.EsContadorProduccion)
                {
                    return TipoEnumEstadoMermas.SIN_ESTADO;
                }
                if (Porcentaje == 0)
                {
                    return TipoEnumEstadoMermas.CORRECTO;
                }

                if (Porcentaje > ContadorConfiguracion.PorcentajeMaximo) 
                {
                    return TipoEnumEstadoMermas.SOBRE_MAXIMO;
                }
                else if (Porcentaje >= ContadorConfiguracion.PorcentajeMinimo) 
                {
                    return TipoEnumEstadoMermas.SOBRE_MINIMO;
                }
                else {
                    return TipoEnumEstadoMermas.CORRECTO;
                }
            } }
    }
}