using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    /// <summary>
    /// Clase de TipoOrden
    /// Correspondiente a la vista TipoOrden_FAB
    /// </summary>
    public class TipoOrden
    {
        private string _id; //Codigo simple de simatic (Suele ser en ingles)
        private string _descripcion; //Breve descripcion del tipo
        private string _abrev; //Codigo de Simatic 

        public TipoOrden() 
        {
        }

        public TipoOrden(string id) //Asignacion de valor segun el codigo de simatic de la orden
        {
            _id = id;
            switch (id)
            {
                case "WP":
                    _descripcion = "Cocción";
                    _abrev = "COCC";
                    break;
                case "FE": 
                    _descripcion = "Fermentación";
                    _abrev = "FER";
                    break;
                case "GU":
                    _descripcion = "Guarda";
                    _abrev = "GUA";
                    break;
                case "FL":
                    _descripcion = "Filtración";
                    _abrev = "FIL";
                    break;
                case "PR":
                    _descripcion = "Prellenado";
                    _abrev = "PRE";
                    break;
                case "TR":
                    _descripcion = "Trasiego";
                    _abrev = "TR";
                    break;
            }
        }

        public string id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public string abrev
        {
            get { return _abrev; }
            set { _abrev = value; }
        }
    }
}