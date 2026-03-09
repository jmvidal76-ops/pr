using MSM.Controllers.Planta;
using System;

namespace MSM.DTO
{
    public class DTO_ProduccionTurnoOrdenes
    {
        /* PKs */
        public int numLinea { get; set; }
        public DateTime fechaTurnoUTC { get; set; }
        public DateTime fechaTurnoLocal { get { return fechaTurnoUTC.ToLocalTime(); } }
        public int idTipoTurno { get; set; }
        public string idOrden { get; set; }
        public string idProducto { get; set; }
        public string descriptProducto { get; set; }
        public string TipoTurno
        {
            get
            {
                switch (idTipoTurno)
                { 
                    case 1: return IdiomaController.GetResourceName("MAÑANA"); 
                    case 2: return IdiomaController.GetResourceName("TARDE"); 
                    case 3: return IdiomaController.GetResourceName("NOCHE"); 
                }
                return "DESCONOCIDO";
            }
        }
        /*******/
        public DateTime fechaInicioUTC { get; set; }
        public DateTime fechaInicioLocal { get { return fechaInicioUTC.ToLocalTime(); } }
        public DateTime fechaFinUTC { get; set; }
        public DateTime fechaFinLocal { get { return fechaFinUTC.ToLocalTime(); } }

        /** SHC **/
        public int idSHC_MAX { get; set; }
        public int idSHC_MIN { get; set; }
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
        /**Clasificacion Rechazos nivel agregado 02 **/
        public int sumRechazosLlenadora_Salida { get { return rechLLenadora + rechInspectorSalidaLlenadora; } }
        public int sumRechazosInspBotellaLlena_Bascula { get { return rechInspectorBotellasLLenas + rechBascula; } }
        public int sumEmpaquetadora { get { return prodEmpaquetadora + prodEncajonadora; } }

        /**OEE y Ind. Calidad **/
        public double envasesTeoricos { get; set; }
    }
}
