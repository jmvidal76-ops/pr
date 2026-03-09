using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    public enum TipoEstadosOrdenPreparacion
    {
        CREADA = 1,
        INICIADA = 2,
        CANCELADA = 3,
        FINALIZADA = 4,
        CERRADA = 5
    }
}