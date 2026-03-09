using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public enum Roles
    {
        [StringValueAttribute("Oficial de Envasado")]
        OficialEnvasado = 0,
        [StringValueAttribute("Supervisor de Envasado")]
        SupervisorEnvasado = 1,
    }


}