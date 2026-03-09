using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class UsuarioRolRequest
    {

        private string _nombreUsuario;
        private string _nombreRol;

        public string NombreUsuario
        {
            get { return _nombreUsuario; }
            set { _nombreUsuario = value; }
        }

        public string NombreRol
        {
            get { return _nombreRol; }
            set { _nombreRol = value; }
        }

        public string IdUser { get; set; }

        public int Activo { get; set; }

        public UsuarioRolRequest()
        {
        }

        public UsuarioRolRequest(string nombreUsuario, string nombreRol)
        {
            this._nombreUsuario = nombreUsuario;
            this._nombreRol = nombreRol;
        }


    }
}