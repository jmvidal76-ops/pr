using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class RelacionEnvasesCajasPalets
    {
        //700044: Envases por caja
        public int ContenedoresPorEmbalaje { get; set; }

        //700045: Cajas por capa
        public int EmbalajesPorManto { get; set; }
        //700048: Capas por palet
        public int MantosPorPalet { get; set; }

        //700047: Cajas por palet
        public int PacksPorPalet { get; set; }

        //700046: Envases por palet
        public int ContenedoresPorPalet { get; set; }
    }
}