using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class DiaFestivo
    {

         //Atributos
        private int _id;
        private DateTime _fecha;
        private string _descripcion;


        //Constructor
        public DiaFestivo()
        {

        }

        public DiaFestivo(int pId, DateTime pFecha, string pDescripcion)
        {
            _id = pId;
            _fecha = pFecha;
            _descripcion = pDescripcion;
        }

        //Propiedades
        public int id
        {
            get { return _id; }
            set { _id = value; }
        }

        public DateTime fecha
        {
            get
            {

                return _fecha;
            }
            set
            {
                _fecha = value; ;
            }

        }

        public DateTime  inicio
        {
            get {

                return _fecha;
            }
            set {
                _fecha = value; ;
            }
            
        }

        public DateTime fin
        {
            get
            {

                return _fecha;
            }
            set
            {
                _fecha = value ;
            }
            
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public bool isAllDay { get { return true; } }
       

    }
}