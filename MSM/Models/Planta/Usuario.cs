using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class Usuario : IdentityUser
    {
        public string password;

        public Usuario()
        {

        }
        public Usuario(string nombre,string pass)
        {
            base.UserName = nombre;
            password = pass;
        }
    }
}