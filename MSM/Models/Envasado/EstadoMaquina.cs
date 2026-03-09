using System;
using System.Collections.Generic;
using MSM.Utilidades;

namespace MSM.Models.Envasado
{
    public class EstadoMaquina
    {
        //Atributos

        private Tipos.EstadosMaquina _id;

        //Constructor

        public EstadoMaquina(Tipos.EstadosMaquina pId)
        {
            _id = pId;
        }

        //Propiedades

        public Tipos.EstadosMaquina id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string nombre
        {
            get
            {
               return this.id.GetStringValue();
            }
        }


        //Metodos

    }

}