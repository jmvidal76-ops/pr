using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    /// <summary>
    /// Clase de TipoOrden
    /// Correspondiente a la vista TipoOrden_FAB
    /// </summary>
    public class TipoOrdenPreparacion
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public string Nombre { get; set; }
    }
}