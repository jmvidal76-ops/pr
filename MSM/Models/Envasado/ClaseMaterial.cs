using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class ClaseMaterial
    {

         //Atributos

        private string _id;
        private string _nombre;
        
        //Constructor

        public ClaseMaterial(string pId, string pNombre)
        {
            _id = pId;
            _nombre = pNombre;         
        }

        //Propiedades

        public string id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }


        //Metodos

    }
}