using Common.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MermasRegistro
    {
        public int Id { get; set; }
        public int IdTurnoMerma { get; set; }
        public long IdTurno { get; set; }
        public int IdMaquina { get; set; }
        public string CodigoMaquina { get; set; }
        public string MaquinaDescripcion { get; set; }
        public string MaquinaClase { get; set; }
        public string Observaciones { get; set; }
        public int CodigoProveedor { get; set; }
        public string Proveedor { get; set; }
        public string WO { get; set; }
        public int IdProducto { get; set; }
        public string DescripcionProducto { get; set; }
        public DateTime FechaCreado { get; set; }
        public List<DTO_MermasContador> Contadores { get; set; }
        public decimal? ContadorProduccion
        {
            get
            {
                if (Contadores == null)
                {
                    return null;
                }
                var prod = Contadores.Find(c => c.ContadorConfiguracion.EsContadorProduccion);

                if (prod != null)
                {
                    return prod.Valor;
                }
                return null;
            }
        }

        public TipoEnumEstadoMermas Estado
        {
            get
            {
                if (Contadores == null || ContadorProduccion == null || ContadorProduccion <= 0)
                {
                    return TipoEnumEstadoMermas.CORRECTO;
                }

                if (Contadores.FindAll(c => !c.ContadorConfiguracion.EsContadorProduccion)
                    .FindAll(c => (c.Valor * 100) / ContadorProduccion > c.ContadorConfiguracion.PorcentajeMaximo).Count > 0)
                {
                    return TipoEnumEstadoMermas.SOBRE_MAXIMO;
                }
                else if (Contadores.FindAll(c => !c.ContadorConfiguracion.EsContadorProduccion)
                    .FindAll(c => (c.Valor * 100) / ContadorProduccion >= c.ContadorConfiguracion.PorcentajeMinimo).Count > 0)
                {
                    return TipoEnumEstadoMermas.SOBRE_MINIMO;
                }
                else
                {
                    return TipoEnumEstadoMermas.CORRECTO;
                }
            }
        }
        public string EstadoColor
        {
            get
            {
                return Estado.GetColor();
            }
        }
    }
}