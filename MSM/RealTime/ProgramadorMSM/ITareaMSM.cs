using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models.Planta;

namespace MSM.RealTime
{
    public interface ITareaMSM
    {
        string Nombre { get; }
        TipoEnumProcesoPerroGuardian Tipo { get; }
        Task Tarea();
    }
}
