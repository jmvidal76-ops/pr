using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class Incidencia
    {
        //Atributos

        private int _id;
        private string _usuario;
        private string _pantalla;
        private string _descripcion;
        private string _aplicacion;
        private string _email;
        

        //Constructor

        public Incidencia(int pId, string pUsuario, string pPantalla, string pDecripcion, string pAplicacion,string pEmail)
        {
             _id = pId;
             _usuario = pUsuario;
             _pantalla = pPantalla;
             _descripcion = pDecripcion;
             _aplicacion = pAplicacion;
             _email = pEmail;
        }

        //Propiedades

        public int id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string usuario
        {
            get { return _usuario; }
            set { _usuario = value; }
        }

        public string pantalla
        {
            get { return _pantalla; }
            set { _pantalla = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public string aplicacion
        {
            get { return _aplicacion; }
            set { _aplicacion = value; }
        }
        public string email
        {
            get { return _email; }
            set { _email = value; }
        }
      
        //Metodos
    }
}