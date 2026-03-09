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
    public class EstadoProcedimientos
    {

        //Atributos
        private Tipos.EstadoProcedimientos estadoProc;

        public EstadoProcedimientos() { }
        public EstadoProcedimientos(int pId)
        {
            this.estadoProc = pId.ToString().ToEnum<Tipos.EstadoProcedimientos>();
        }

        public EstadoProcedimientos(Tipos.EstadoProcedimientos estadosOrden)
        {
            this.estadoProc = estadosOrden;
        }

        //Propiedades

        public Tipos.EstadoProcedimientos Estado
        {
            get { return this.estadoProc; }
        }

        public int id
        {
            get { return Convert.ToInt32(this.estadoProc.GetProperty("value")); }
        }

        public string descripcion
        {
            get { return (string)this.estadoProc.GetProperty("cambios"); }
        }

        public string nombre
        {
            get { return this.estadoProc.ToString(); }
        }

        public string accion
        {
            get { return (string)this.estadoProc.GetProperty("color"); }
        }
       
     
        //private int _id; //Codigo numerico que identifica a la orden
        //private string _descripcion; //Descriptivo del estado de la orden

        //public EstadoOrden() { } //Constructor vacio

        //public EstadoOrden(int id, string descripcion) //Constructor con campos
        //{
        //    _id = id;
        //    _descripcion = descripcion;
        //}

        //public int id //Propiedad ID
        //{
        //   get { return _id; }
        //   set { _id = value; }
        //}

        //public string descripcion // Propiedad Descripcion
        //{
        //    get { return _descripcion; }
        //    set { _descripcion = value; }
        //}
    }
}