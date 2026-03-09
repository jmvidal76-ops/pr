using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MSM.Utilidades;

namespace MSM.Models.Envasado
{
    public class CambiosOrden
    {
        private Tipos.EstadosOrden estado;

        public CambiosOrden() { }


        public CambiosOrden(string nombre) 
        {
            this.estado = (Tipos.EstadosOrden)Enum.Parse(typeof(Tipos.EstadosOrden), nombre);

        }
        public string nombre 
        {
            get { return this.estado.ToString();}
        }
        public string ordenMES
        {
            get { return (string)this.estado.GetProperty("keyReglaSIT"); }
        }
    }
}
