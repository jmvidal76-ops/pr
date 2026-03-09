using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_SIGIBloqueo
    {
        public int BLOQUEO_MODO { get; set; }
        public int BLOQUEO_VAL_SIGI { get; set; }
        public int BLOQUEO_VAL_MES { get; set; }
        public int BLOQUEO_VAL_MANUAL { get; set; }
        public int BLOQUEO_CNT { get; set; }
        public string FH_ULTIMO_SSCC { get; set; }
        public int T_PARADA { get; set; }
        public string BLOQUEO_MES_FH { get; set; }
        public int T_EVACUACION { get; set; }
        public string ULTIMO_LOTE_SIN_BLOQUEO { get; set; }
        public string ULTIMO_LOTE_CON_BLOQUEO { get; set; }
        public int BLOQUEO_ORDEN { get; set; }
        public int BLOQUEO_VAL_CONTINUO { get; set; }
        public int CONT_INICIO_HORA { get; set; }
        public int CONT_INICIO_DIA { get; set; }
        public int CONT_INICIO_FLAG { get; set; }
        public int CONT_FINAL_DIA { get; set; }
        public int CONT_FINAL_HORA { get; set; }
        public int CONT_FINAL_FLAG { get; set; }
        public int CON_CAMBIO_PRODUCTO { get; set; }
       
    }
}