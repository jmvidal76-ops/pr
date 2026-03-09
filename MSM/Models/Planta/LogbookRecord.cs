using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Planta
{
    public class LogbookRecord
    {
        public DateTime Fecha { set; get; }
        public string applicationID { set; get; }
        public string description { set; get; }
        public string objectId { set; get; }
        public string userName { set; get; }
        public string computerName { set; get; }
        public string processName { set; get; }
        public string descSection { get; set; }
        public string descLevel { get; set; }
        private int _section;
        private int _level;

        public int section
        {
            set
            {
                this._section = value;
                switch (value)
                {
                    case 1: this.descSection = "Error de programa"; break;
                    case 2: this.descSection = "Aviso de programa"; break;
                    case 3: this.descSection = "Comentario general de programa"; break;
                    case 4: this.descSection = "Traza de programa"; break;
                    case 5: this.descSection = "Error en la logica de negocio"; break;
                    case 6: this.descSection = "Aviso en la logica de negocio"; break;
                    case 7: this.descSection = "Comentario general de la logica de negocio"; break;
                    case 8: this.descSection = "Traza de la logica de negocio"; break;
                    default: this.descSection = "Seccion no definida"; break;
                }
            }
            get { return this._section; }
        }

        public int level
        {
            set
            {
                this._level = value;
                if (this.section < 9 && 1 <= this.section)
                {
                    if (section == 1 || section == 5)
                        switch (this.level)
                        {
                            case 1: this.descLevel = "Error leve"; break;
                            case 2: this.descLevel = "Error grave"; break;
                            case 3: this.descLevel = "Error critico"; break;
                            default: this.descLevel = "Error no definido"; break;
                        }

                    if (section == 2 || section == 6)
                        switch (this.level)
                        {
                            case 1: this.descLevel = "Importancia baja"; break;
                            case 2: this.descLevel = "Importancia media"; break;
                            case 3: this.descLevel = "Importancia alta"; break;
                            default: this.descLevel = "Importancia no definida"; break;
                        }

                    if (section == 3 || section == 7)
                        switch (this.level)
                        {
                            case 1: this.descLevel = "General"; break;
                            case 2: this.descLevel = "Detallado"; break;
                            default: this.descLevel = "No definida"; break;
                        }

                    if (section == 4 || section == 8)
                        switch (this.level)
                        {
                            case 1: this.descLevel = "Baja frecuencia"; break;
                            case 2: this.descLevel = "Media frecuencia"; break;
                            case 3: this.descLevel = "Alta frecuencia"; break;
                            default: this.descLevel = "Frecuencia no definida"; break;
                        }
                }
                else
                {
                    this.descLevel = "Nivel sin definir";
                }
            }
            get { return this._level; }
        }

    }
}