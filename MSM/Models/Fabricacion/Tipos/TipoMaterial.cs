using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    public enum TipoMaterial
    {
        [StringValue("01")]
        MateriasPrimas,
        [StringValue("20")]
        Subproductos,
        [StringValue("71")]
        Semielaborados,
        [StringValue("Dummy")]
        Dummy,
    }
}