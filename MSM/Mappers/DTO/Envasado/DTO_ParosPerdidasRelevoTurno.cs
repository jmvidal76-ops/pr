using Common.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_ParosPerdidasRelevoTurno
    {
        public string Maquina { get; set; }
        public List<ParosPerdidasRTGrupo_DTO> Motivos { get; set; }
        public bool PorDuracion { get; set; }
        public decimal ValorParosMayores
        {
            get
            {
                return Motivos.Sum(s => s.ValorParosMayores);
            }
        }
        public decimal ValorPerdidasProduccion
        {
            get
            {
                return Motivos.Sum(s => s.ValorPerdidasProduccion);
            }
        }
        public decimal ValorTotal
        {
            get
            {
                return Motivos.Sum(s => s.ValorTotal);

            }
        }

        public DTO_ParosPerdidasRelevoTurno()
        {
            Motivos = new List<ParosPerdidasRTGrupo_DTO>();
        }
    }

    public class ParosPerdidasRTGrupo_DTO
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public bool PorDuracion { get; set; }
        public List<ParosPerdidasRTGrupo_DTO> SubGrupo { get; set; }
        public List<ParosRT_DTO> Paros { get; set; }

        public decimal ValorParosMayores
        {
            get
            {
                if (Paros.Count > 0)
                {
                    return Paros.FindAll(f => f.TipoParo == TipoEnumTipoParo.PARO_MAYOR)
                    .Sum(s => s.Valor);
                }
                else
                {
                    return SubGrupo.Sum(s => s.ValorParosMayores);
                }
                
            }
        }
        public decimal ValorPerdidasProduccion
        {
            get
            {
                if (Paros.Count > 0)
                {

                    return Paros.FindAll(f => f.TipoParo == TipoEnumTipoParo.PERDIDA_PRODUCCION)
                        .Sum(s => s.Valor);
                }
                else
                {
                    return SubGrupo.Sum(s => s.ValorPerdidasProduccion);
                }
            }
        }
        public decimal ValorTotal
        {
            get
            {                
                return this.ValorParosMayores + this.ValorPerdidasProduccion;     
            }
        }

        public ParosPerdidasRTGrupo_DTO()
        {
            SubGrupo = new List<ParosPerdidasRTGrupo_DTO>();
            Paros = new List<ParosRT_DTO>();
        }
    }    

    public class ParosRT_DTO
    {
        public TipoEnumTipoParo TipoParo { get; set; }
        public decimal Valor { get; set; }
        public string Comentario { get; set; }
        public bool PorDuracion { get; set; }
        public decimal ValorParosMayores
        {
            get
            {
                return TipoParo == TipoEnumTipoParo.PARO_MAYOR ? Valor : 0;
            }
        }
        public decimal ValorPerdidasProduccion
        {
            get
            {
                return TipoParo == TipoEnumTipoParo.PERDIDA_PRODUCCION ? Valor : 0;
            }
        }
        public decimal ValorTotal
        {
            get
            {
                return this.ValorParosMayores + this.ValorPerdidasProduccion;
            }
        }
    }
}