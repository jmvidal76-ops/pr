using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class Rol : IdentityRole
    {

        public Rol()
        {

        }
        public Rol(string nombre)
        {
            base.Name = nombre;
        }
    }


}