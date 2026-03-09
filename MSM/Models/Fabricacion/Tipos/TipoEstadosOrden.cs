using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    [Category("Fabricacion")]
    public enum TipoEstadosOrden
    {
        Planned,
        Aborted,
        Received,
        InProgress,
        Processed,
        Terminated,
        ReOpened, 
        Ready
    }
}