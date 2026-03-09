using System;
using System.Collections.Generic;
using MSM.Models;
using MSM.Utilidades;
using System.Linq;

namespace MSM.Models.Envasado
{
    public class EstadoOrden
    {
        //Atributos
        private Tipos.EstadosOrden estado;        

        public EstadoOrden() { }
        public EstadoOrden(int pId)
        {            
            this.estado = pId.ToString().ToEnum<Tipos.EstadosOrden>();
        }

        public EstadoOrden(Tipos.EstadosOrden estadosOrden)
        {
            this.estado = estadosOrden;
        }

        //Propiedades

        public Tipos.EstadosOrden Estado
        {
            get { return this.estado; }
        }

        public int id
        {
            get { return Convert.ToInt32(this.estado.GetProperty("value")); }
        }
        public string ordenMES
        {
            get { return (string)this.estado.GetProperty("keyReglaSIT"); }
        }
        public string nombre
        {
            get { return this.estado.ToString(); }
        }
        public string color
        {
            get { return (string)this.estado.GetProperty("color"); }
        }
        public bool esActiva
        {
            get { return (bool)this.estado.GetProperty("activa"); }
        }
        public bool esPendiente
        {
            get { return (bool)this.estado.GetProperty("pendiente"); }
        }

        public List<CambiosOrden> cambiosPosibles
        {
            get
            {
                List<CambiosOrden> cambios = new List<CambiosOrden>();
                List<string> listCambios = this.estado.GetProperty("cambios").ToString().Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList();
                
                foreach (string cambio in listCambios)
                {
                    cambios.Add(new CambiosOrden(cambio));
                }

                return cambios;
            }
        }
    }
}