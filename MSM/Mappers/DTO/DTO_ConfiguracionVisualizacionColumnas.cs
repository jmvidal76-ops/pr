using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO
{
    public class DTO_ConfiguracionVisualizacionColumnas
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Pantalla { get; set; }
        public string Configuracion { get; set; }


        public static DTO_ConfiguracionVisualizacionColumnas Mapper_ConfiguracionVisualicacionColumnas_toDTO(ConfiguracionVisualizacionColumnas origen)
        {
            return new DTO_ConfiguracionVisualizacionColumnas() {
                Id = origen.IdConfiguracionVisualizacionColumnas,
                Nombre = origen.NombreConfiguracion,
                Pantalla = origen.Pantalla,
                Configuracion = origen.ConfiguracionColumnas
            };            
        }
    }
}