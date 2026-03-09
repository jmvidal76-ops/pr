using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_RelacionEnvasesProductos
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public string UdMedida { get; set; }
        public double CPBPorPalet { get; set; }
        public double EnvasesPorPalet { get; set; }
        public decimal HectolitrosEnvase { get; set; }
    }
}