using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO
{
    public class DTO_ProduccionTurno
    {
        /* PKs */
        private double _calidad;
        public int numLinea { get; set; }
        public string descripcion { get; set; }
        public DateTime fechaTurnoUTC { get; set; }
        public DateTime fechaTurnoLocal
        {
            get
            {
                DateTime fechaTurno = fechaTurnoUTC.ToLocalTime();
                //fechaTurno = fechaTurno.AddMilliseconds(-fechaTurno.Millisecond).AddSeconds(-fechaTurno.Second).AddMinutes(-fechaTurno.Minute).AddHours(-fechaTurno.Hour);
                return fechaTurno;
            }
        }
        public DateTime fechaTurno
        {
            get
            {
                DateTime fechaTurno = fechaTurnoUTC.ToLocalTime();
                fechaTurno = fechaTurno.AddMilliseconds(-fechaTurno.Millisecond).AddSeconds(-fechaTurno.Second).AddMinutes(-fechaTurno.Minute).AddHours(-fechaTurno.Hour);
                return fechaTurno;
            }
        }
        public int idTipoTurno { get; set; }
        public string strTipoTurno
        {
            get
            {
                switch (idTipoTurno) { case 1: return "MAÑANA"; case 2: return "TARDE"; case 3: return "NOCHE"; }
                return "DESCONOCIDO";
            }
        }
        /*******/
        //public int workDateBias { get; set; }
        public DateTime fechaInicioUTC { get; set; }
        public DateTime fechaInicioLocal { get { return fechaInicioUTC.ToLocalTime(); } }
        public DateTime fechaFinUTC { get; set; }
        public DateTime fechaFinLocal { get { return fechaFinUTC.ToLocalTime(); } }
        public float duracion { get; set; }
        /**info ordenes asociadas**/
        public int nCambios { get; set; }
        public int nArranques { get; set; }
        /** SHC **/
        public int idSHC_MAX { get; set; }
        public int idSHC_MIN { get; set; }
        public int shcID { get; set; }
        /**Contadores produccion maquinas **/
        public int prodDesPaletizadora { get; set; }
        public int prodLlenadora { get; set; }
        public int prodEmpaquetadora { get; set; }
        public int prodEncajonadora { get; set; }
        public int prodPaletizadora { get; set; }
        public int prodEtiquetadoraPalets { get; set; }
        /**Rechazos maquinas**/
        public int rechClasificador { get; set; }
        public int rechInspectorBotellasVacias { get; set; }
        public int rechLLenadora { get; set; }
        public int rechInspectorSalidaLlenadora { get; set; }
        public int rechInspectorBotellasLLenas { get; set; }
        public int rechBascula { get; set; }
        /**Clasificacion Rechazos nivel agregado 01 **/
        public int totalRechazosVacios { get { return rechClasificador + rechInspectorBotellasVacias; } }
        public int totalRechazosLlenos { get { return rechLLenadora + rechInspectorSalidaLlenadora + rechInspectorBotellasLLenas + rechBascula; } }
        public int sunEmpaquetadora { get { return prodEmpaquetadora + prodEncajonadora; } }

        /**OEE y Ind. Calidad **/
        public double envasesTeoricos { get; set; }
        public double calidad
        {
            get
            {
                //if (estadoActual.id == Tipos.EstadosOrden.Iniciando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Finalizando.GetValue() || estadoActual.id == Tipos.EstadosOrden.Producción.GetValue()) return 100.0;
                //else 
                return _calidad * 1000;
            }
            set { _calidad = value; }
        }
        public double oee
        {
            get
            {
                //double cal = ((calidad / 1000) > 1 && string.IsNullOrEmpty(Linea.Grupo)) ? 1 : (calidad / 1000);
                double cal = (calidad / 1000);
                return ((rendimiento / 100) * cal) * 100;
            }
        }
        public double oeeCritico { get; set; }
        public double oeeObjetivo { get; set; }
        //public double iCalidad { get { return 1000; } }
        public double rendimiento
        {
            get
            {
                try
                {
                    if (envasesTeoricos > 0)
                    {
                        return 100 * prodLlenadora / envasesTeoricos;
                    }
                    else
                    {
                        return 0;
                    }
                }
                catch
                {
                    return 0;
                }
            }
        }

        /**Semaforos y flags **/
        public int flagRegistroConsolidadoTurno { get; set; }
        public int flagNumRegistrosSinOrd { get; set; }
        public int flagNumRegistrosConOrd { get; set; }
        public double flagNumRegistros { get; set; }
        public double flagNumHoras { get; set; }
        public int flagNumRegistrosFaltantes { get { return 8 + nArranques + nCambios - flagNumMaquinas; } }
        public int flagNumMaquinas { get; set; }
        public int flagNumRegistrosSinSHCs { get; set; }
        public int flagRegModificadoManualmente { get; set; }
        public string colorSemaforo
        {
            get
            {
                string result = "Verde";

                if ((flagNumHoras != 8 || flagRegistroConsolidadoTurno <= 0) && !EsTurnoActual)
                    result = "Gris";
                else if (totalRechazosLlenos == 0 || prodDesPaletizadora == 0 || prodLlenadora == 0 || prodPaletizadora == 0 || prodEtiquetadoraPalets == 0)
                    result = "Amarillo";
                else if (flagNumRegistrosSinOrd == 0)
                    result = "Verde";
                else if (flagNumRegistrosConOrd == 0)
                    result = "VerdeOscuro";
                else if (flagNumRegistrosSinOrd > 0)
                    result = "Azul";

                return result;

            }
        }

        public bool EsTurnoActual
        {
            get
            {
                return (fechaInicioUTC <= DateTime.UtcNow && fechaFinUTC >= DateTime.UtcNow);
            }
        }

        public Linea Linea { get; set; }

        
    }
}
