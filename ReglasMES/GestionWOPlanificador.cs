using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReglasMES
{
    public class GestionWOPlanificador : G2Base.PMCall
    {

        public GestionWOPlanificador(G2Base.PMConnector connector) :
           base(connector, "MSM.INTERFAZ-MANAGER", "MSM.INTERFAZ-MANAGER.JDE-MES-PREACTOR.GESTION_WO_PLANIFICADOR", 8, 0)
        {
            InitParamNames();
        }

        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(string STR_WO_ID, 
            string STR_PPR_ID, 
            double QTY_WO_QTY, 
            string STR_UOM, 
            double FL_START_TIME, 
            double FL_END_TIME, 
            string STR_WO_ID_PART,
            string STR_ACCION,
                    ref string errDescription)
        {
            m_InputParamValues[0] = STR_WO_ID;
            m_InputParamValues[1] = STR_PPR_ID;
            m_InputParamValues[2] = QTY_WO_QTY;
            m_InputParamValues[3] = STR_UOM;
            m_InputParamValues[4] = FL_START_TIME;
            m_InputParamValues[5] = FL_END_TIME;
            m_InputParamValues[6] = STR_WO_ID_PART;
            m_InputParamValues[7] = STR_ACCION;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                errDescription = ((string)(m_OutputParamValues[2]));
            }

            return result;
        }

        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "STR_WO_ID";
            m_InputParamNames[1] = "STR_PPR_ID";
            m_InputParamNames[2] = "QTY_WO_QTY";
            m_InputParamNames[3] = "STR_UOM";
            m_InputParamNames[4] = "FL_START_TIME";
            m_InputParamNames[5] = "FL_END_TIME";
            m_InputParamNames[6] = "STR_WO_ID_PART";
            m_InputParamNames[7] = "STR_ACCION";
            Timeout = 300000;
        }
    }
}
