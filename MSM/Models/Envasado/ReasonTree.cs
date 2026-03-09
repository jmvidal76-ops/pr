using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    /// <summary>
    /// Estructura de datos que almacena el listado de categorias principales del reason tree
    /// </summary>
    public class ReasonTree
    {
        public List<Categoria> Categorias { get; set; }
    }

    /// <summary>
    /// Estructura de datos que almacena la información de una categoriat los posibles motivos.
    /// </summary>
    public class Categoria {
        public int id { get; set; }
        public string nombre { get; set; }
        public List<Motivo> motivos { get; set; }
    }

    /// <summary>
    /// Estructura de datos que almacena la información de un motivo y sus causas
    /// </summary>
    public class Motivo
    {
        public int id { get; set; }
        public string nombre { get; set; }
        public List<Causa> causas { get; set; }
    }

    /// <summary>
    /// Estructura de datos que almacena la información de una causa
    /// </summary>
    public class Causa
    {
        public int id { get; set; }
        public string nombre { get; set; }        
    }
}