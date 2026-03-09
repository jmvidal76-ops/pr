namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.UTILIDADES.RTDS.ROOT-WRITE
    /// </summary>
    public class ModificarEstadoMaquina : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "UTILIDADES";
        
        protected static string m_Path = "UTILIDADES.RTDS.ROOT-WRITE";
        
        /// <summary>
        /// Create an object to invoke "MSM.UTILIDADES.RTDS.ROOT-WRITE" on the equipment "MSM.UTILIDADES"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ModificarEstadoMaquina(G2Base.PMConnector connector) : 
                base(connector, "MSM.UTILIDADES", "MSM.UTILIDADES.RTDS.ROOT-WRITE", 2, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ModificarEstadoMaquina(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 2, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ModificarEstadoMaquina(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 2, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="V_I_VALUE">Input INTEGER</param>
        /// <param name="VAR_NAME">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(int V_I_VALUE, string VAR_NAME, ref double errCode, ref string errDescription, ref string errSource)
        {
            m_InputParamValues[0] = V_I_VALUE;
            m_InputParamValues[1] = VAR_NAME;
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
        /// <param name="V_I_VALUE">Input INTEGER</param>
        /// <param name="VAR_NAME">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, int V_I_VALUE, string VAR_NAME, ref double errCode, ref string errDescription, ref string errSource)
        {
            m_InputParamValues[0] = V_I_VALUE;
            m_InputParamValues[1] = VAR_NAME;
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
        /// <param name="V_I_VALUE">Input INTEGER</param>
        /// <param name="VAR_NAME">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(int V_I_VALUE, string VAR_NAME)
        {
            m_InputParamValues[0] = V_I_VALUE;
            m_InputParamValues[1] = VAR_NAME;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="V_I_VALUE">Input INTEGER</param>
        /// <param name="VAR_NAME">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, int V_I_VALUE, string VAR_NAME)
        {
            m_InputParamValues[0] = V_I_VALUE;
            m_InputParamValues[1] = VAR_NAME;
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
            m_InputParamNames[0] = "V_I_VALUE";
            m_InputParamNames[1] = "VAR_NAME";
            Timeout = 300000;
        }
    }
}
