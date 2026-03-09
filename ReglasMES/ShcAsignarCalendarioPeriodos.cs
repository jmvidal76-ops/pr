namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_CREATE_SHC
    /// </summary>
    public class ShcAsignarCalendarioPeriodos : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "SHC-MANAGER";
        
        protected static string m_Path = "SHC-MANAGER.SHC-MANAGEMENT.ROOT_CREATE_SHC";
        
        /// <summary>
        /// Create an object to invoke "MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_CREATE_SHC" on the equipment "MSM.SHC-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ShcAsignarCalendarioPeriodos(G2Base.PMConnector connector) : 
                base(connector, "MSM.SHC-MANAGER", "MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_CREATE_SHC", 5, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ShcAsignarCalendarioPeriodos(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 5, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ShcAsignarCalendarioPeriodos(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 5, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="INT_NUMERO_PERIODOS">Input INTEGER</param>
        /// <param name="INT_START_DATE">Input FLOAT</param>
        /// <param name="STR_ID_FACTORY_CALENDAR">Input TEXT</param>
        /// <param name="STR_ID_LINEA">Input TEXT</param>
        /// <param name="STR_TIPO_PERIODO">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(int INT_NUMERO_PERIODOS, double INT_START_DATE, string STR_ID_FACTORY_CALENDAR, string STR_ID_LINEA, string STR_TIPO_PERIODO, ref double errCode, ref string errDescription, ref string errSource)
        {
            m_InputParamValues[0] = INT_NUMERO_PERIODOS;
            m_InputParamValues[1] = INT_START_DATE;
            m_InputParamValues[2] = STR_ID_FACTORY_CALENDAR;
            m_InputParamValues[3] = STR_ID_LINEA;
            m_InputParamValues[4] = STR_TIPO_PERIODO;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[1]);
                errDescription = ((string)(m_OutputParamValues[0]));
                errSource = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="INT_NUMERO_PERIODOS">Input INTEGER</param>
        /// <param name="INT_START_DATE">Input FLOAT</param>
        /// <param name="STR_ID_FACTORY_CALENDAR">Input TEXT</param>
        /// <param name="STR_ID_LINEA">Input TEXT</param>
        /// <param name="STR_TIPO_PERIODO">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, int INT_NUMERO_PERIODOS, double INT_START_DATE, string STR_ID_FACTORY_CALENDAR, string STR_ID_LINEA, string STR_TIPO_PERIODO, ref double errCode, ref string errDescription, ref string errSource)
        {
            m_InputParamValues[0] = INT_NUMERO_PERIODOS;
            m_InputParamValues[1] = INT_START_DATE;
            m_InputParamValues[2] = STR_ID_FACTORY_CALENDAR;
            m_InputParamValues[3] = STR_ID_LINEA;
            m_InputParamValues[4] = STR_TIPO_PERIODO;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[0]);
                errDescription = ((string)(m_OutputParamValues[1]));
                errSource = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="INT_NUMERO_PERIODOS">Input INTEGER</param>
        /// <param name="INT_START_DATE">Input FLOAT</param>
        /// <param name="STR_ID_FACTORY_CALENDAR">Input TEXT</param>
        /// <param name="STR_ID_LINEA">Input TEXT</param>
        /// <param name="STR_TIPO_PERIODO">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(int INT_NUMERO_PERIODOS, double INT_START_DATE, string STR_ID_FACTORY_CALENDAR, string STR_ID_LINEA, string STR_TIPO_PERIODO)
        {
            m_InputParamValues[0] = INT_NUMERO_PERIODOS;
            m_InputParamValues[1] = INT_START_DATE;
            m_InputParamValues[2] = STR_ID_FACTORY_CALENDAR;
            m_InputParamValues[3] = STR_ID_LINEA;
            m_InputParamValues[4] = STR_TIPO_PERIODO;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="INT_NUMERO_PERIODOS">Input INTEGER</param>
        /// <param name="INT_START_DATE">Input FLOAT</param>
        /// <param name="STR_ID_FACTORY_CALENDAR">Input TEXT</param>
        /// <param name="STR_ID_LINEA">Input TEXT</param>
        /// <param name="STR_TIPO_PERIODO">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, int INT_NUMERO_PERIODOS, double INT_START_DATE, string STR_ID_FACTORY_CALENDAR, string STR_ID_LINEA, string STR_TIPO_PERIODO)
        {
            m_InputParamValues[0] = INT_NUMERO_PERIODOS;
            m_InputParamValues[1] = INT_START_DATE;
            m_InputParamValues[2] = STR_ID_FACTORY_CALENDAR;
            m_InputParamValues[3] = STR_ID_LINEA;
            m_InputParamValues[4] = STR_TIPO_PERIODO;
            G2Base.CallResult result = AsynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult(ref double errCode, ref string errDescription, ref string errSource)
        {
            G2Base.CallResult result = AsynchGetResult();
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[0]);
                errDescription = ((string)(m_OutputParamValues[1]));
                errSource = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "INT_NUMERO_PERIODOS";
            m_InputParamNames[1] = "INT_START_DATE";
            m_InputParamNames[2] = "STR_ID_FACTORY_CALENDAR";
            m_InputParamNames[3] = "STR_ID_LINEA";
            m_InputParamNames[4] = "STR_TIPO_PERIODO";
            Timeout = 300000;
        }
    }
}
