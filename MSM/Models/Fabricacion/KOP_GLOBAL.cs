using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class KOP_GLOBAL
    {
        public string ID_MAESTRO { get; set; }
        public string PK { get; set; }
        public string ID_ORDEN { get; set; }
        public string COD_KOP { get; set; }
        public string NAME { get; set; }
        public string FASE { get; set; }
        public string MEDIDA { get; set; }
        public string VALOR_MAXIMO { get; set; }
        public string VALOR_MINIMO { get; set; }
        public string VALOR { get; set; }
        private string _semaforo = "";
        public string SEMAFORO
        {
            get
            {
                if (this._semaforo != "")
                    return this._semaforo;

                if (string.IsNullOrEmpty(this.VALOR) && string.IsNullOrEmpty(this.VALOR_MINIMO) && string.IsNullOrEmpty(this.VALOR_MAXIMO))
                {
                    if (this.KopsMultivalorFueraRango.HasValue && this.KopsMultivalorSinRellenar.HasValue)
                    {
                        if (this.KopsMultivalorSinRellenar.Value)
                            return "Azul";
                        if (this.KopsMultivalorFueraRango.Value)
                            return "Amarillo";

                        return "Verde";
                    }
                }
                else
                {
                    if (string.IsNullOrEmpty(this.VALOR))
                        return "Azul";
                    try
                    {
                        switch (this.DATATYPE.ToLower())
                        {
                            case "float":
                            case "int":
                            case "numeric":
                            case "número":
                            case "numero":
                                decimal valorActual = decimal.Parse(this.VALOR.Replace(".", ","));

                                if (string.IsNullOrEmpty(this.VALOR_MAXIMO) && (string.IsNullOrEmpty(this.VALOR_MINIMO)))
                                    return "Verde";

                                if (!string.IsNullOrEmpty(this.VALOR_MAXIMO))
                                {
                                    decimal valorMaximo = decimal.Parse(this.VALOR_MAXIMO.Replace(".", ","));
                                    if (valorActual > valorMaximo)
                                        return "Amarillo";
                                }

                                if (!string.IsNullOrEmpty(this.VALOR_MINIMO))
                                {
                                    decimal valorMinimo = decimal.Parse(this.VALOR_MINIMO.Replace(".", ","));
                                    if (valorActual < valorMinimo)
                                        return "Amarillo";
                                }

                                return "Verde";
                            case "datetime":
                            case "fecha":
                                DateTime fechaActual = DateTime.Parse(this.VALOR);

                                if (string.IsNullOrEmpty(this.VALOR_MAXIMO) && (string.IsNullOrEmpty(this.VALOR_MINIMO)))
                                    return "Verde";

                                if (!string.IsNullOrEmpty(this.VALOR_MAXIMO))
                                {
                                    DateTime fechaMaxima = DateTime.Parse(this.VALOR_MAXIMO);
                                    if (fechaActual > fechaMaxima)
                                        return "Amarillo";
                                }

                                if (!string.IsNullOrEmpty(this.VALOR_MINIMO))
                                {
                                    DateTime fechaMinima = DateTime.Parse(this.VALOR_MINIMO);
                                    if (fechaActual < fechaMinima)
                                        return "Amarillo";
                                }

                                return "Verde";
                        }
                    }catch(Exception ex)
                    {
                        return "Amarillo";
                    }
                }
                return "Verde";
            }

            set {
                this._semaforo = value;
            }
        }
        public string FILTRO_SEMAFORO { get; set; }
        public string FECHA { get; set; }
        public string TIPO { get; set; }
        public string DATATYPE { get; set; }
        public string COD_PROCCESS { get; set; }
        public string PROCCESS { get; set; }
        public string INDEX { get; set; }
        public bool? ACTIVO { get; set; }

        public bool? KopsMultivalorSinRellenar { get; set; }

        public bool? KopsMultivalorFueraRango { get; set; }
    }
}