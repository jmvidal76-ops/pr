using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Utilidades;

namespace MSM.Models.Fabricacion
{
    /// <summary>
    /// Clase de EstadoOrden
    /// Correspondiente a la vista EstadoOrden_FAB
    /// </summary>
    public class EstadoOrden
    {
        private string _color;
        private string _nombre;
        private string _descripcion;
        //Atributos
        private Tipos.TipoEstadosOrden estado;

        public EstadoOrden() { }
        public EstadoOrden(int pId)
        {
            this.estado = pId.ToString().ToEnum<Tipos.TipoEstadosOrden>();
        }

        public EstadoOrden(Tipos.TipoEstadosOrden estadosOrden)
        {
            this.estado = estadosOrden;
        }

        //Propiedades

        public Tipos.TipoEstadosOrden Estado
        {
            get { return this.estado; }
        }

        public int id
        {
            get { return Convert.ToInt32(this.estado.GetProperty("value")); }
        }

        public string descripcion
        {
            get { return (string.IsNullOrEmpty(_nombre) ? (string)this.estado.GetProperty("cambios") : _descripcion); }
            set { _descripcion = value; }
        }

        public string nombre
        {
            get { return (string.IsNullOrEmpty(_nombre) ? this.estado.ToString() : _nombre); }
            set { _nombre = value; }
        }
        public string color
        {
            get { return (string.IsNullOrEmpty(_color)? (string)this.estado.GetProperty("color") : _color); }
            set { _color = value; }
        }
       
        public bool Recalcular
        {
            get;
            set;
        }
    }
}