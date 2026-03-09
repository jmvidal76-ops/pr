using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion
{
    public class DTO_KOPS_FAB
    {
        public int Cod_KOP { get; set; }
        public string ID_KOP { get; set; }
        public string Des_KOP { get; set; }
        public int Cod_Orden { get; set; }
        public string ID_Orden { get; set; }
        public string ID_Procedimiento { get; set; }
        public int Cod_Procedimiento { get; set; }
        public string Tipo_KOP { get; set; }
        public string Valor_Actual { get; set; }
        public string Valor_Minimo { get; set; }
        public string Valor_Maximo { get; set; }
        public int Obligatorio { get; set; }
        public string UOM_KOP { get; set; }
        public System.DateTime Fecha { get; set; }
        public string TipoKOP { get; set; }
        public Nullable<int> Sequence_Procedimiento { get; set; }
        public System.DateTime FechaUTC { get; set; }
        public Nullable<long> PkActVal { get; set; }
        public int Sequence_KOP { get; set; }
        public bool? Recalcular { get; set; }
        public bool? Editable { get; set; }


        private string _semaforo = "";
        private string _filtroSemaforo = "";

        public string Semaforo
        {
            get
            {
                try
                {
                    if (this._semaforo != "")
                        return this._semaforo;

                    if (string.IsNullOrEmpty(this.Valor_Actual))
                        return "Azul";

                    switch (this.Tipo_KOP.ToLower())
                    {
                        case "float":
                        case "int":
                        case "numeric":
                            decimal valorActual = 0;
                            try
                            {
                                valorActual = decimal.Parse(this.Valor_Actual);
                            }
                            catch
                            {
                                valorActual = decimal.Parse(this.Valor_Actual, System.Globalization.NumberStyles.AllowExponent | System.Globalization.NumberStyles.AllowDecimalPoint);
                            }


                            if (string.IsNullOrEmpty(this.Valor_Maximo) && (string.IsNullOrEmpty(this.Valor_Minimo)))
                                return "Verde";

                            if (!string.IsNullOrEmpty(this.Valor_Maximo))
                            {
                                decimal valorMaximo = decimal.Parse(this.Valor_Maximo);
                                if (valorActual > valorMaximo)
                                    return "Amarillo";
                            }

                            if (!string.IsNullOrEmpty(this.Valor_Minimo))
                            {
                                decimal valorMinimo = decimal.Parse(this.Valor_Minimo);
                                if (valorActual < valorMinimo)
                                    return "Amarillo";
                            }

                            return "Verde";
                        case "datetime":
                            DateTime fechaActual = DateTime.Parse(this.Valor_Actual);

                            if (string.IsNullOrEmpty(this.Valor_Maximo) && (string.IsNullOrEmpty(this.Valor_Minimo)))
                                return "Verde";

                            if (!string.IsNullOrEmpty(this.Valor_Maximo))
                            {
                                DateTime fechaMaxima = DateTime.Parse(this.Valor_Maximo);
                                if (fechaActual > fechaMaxima)
                                    return "Amarillo";
                            }

                            if (!string.IsNullOrEmpty(this.Valor_Minimo))
                            {
                                DateTime fechaMinima = DateTime.Parse(this.Valor_Minimo);
                                if (fechaActual < fechaMinima)
                                    return "Amarillo";
                            }

                            return "Verde";
                    }
                    return "Verde";
                }
                catch
                {
                    return "Amarillo";
                }
            }
            set
            {
                this._semaforo = value;
            }
        }
        public string filtroSemaforo
        {
            get
            {
                if (this._filtroSemaforo != "")
                    return this._filtroSemaforo;
                if (this.Semaforo == "Azul")
                    return IdiomaController.GetResourceName("INEXISTENTE");
                if (this.Semaforo == "Amarillo")
                    return IdiomaController.GetResourceName("MALO");
                if (this.Semaforo == "Verde")
                    return IdiomaController.GetResourceName("BUENO");
                if (string.IsNullOrEmpty(this.Semaforo) || this.Semaforo == "Gris")
                    return IdiomaController.GetResourceName("SININFO");
                return string.Empty;
            }
            set
            {
                this._filtroSemaforo = value;
            }
        }
    }
}