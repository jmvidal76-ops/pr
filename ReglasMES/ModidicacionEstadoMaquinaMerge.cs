namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.OEE-MANAGER.MSM-UC-ENV-DRP-1_MODIFICAR_MANUAL_ESTADOS_MAQUINA.ROOT_MERGE
    /// </summary>
    public class ModidicacionEstadoMaquinaMerge : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "OEE-MANAGER";
        
        protected static string m_Path = "OEE-MANAGER.MSM-UC-ENV-DRP-1_MODIFICAR_MANUAL_ESTADOS_MAQUINA.ROOT_MERGE";
        
        /// <summary>
        /// Create an object to invoke "MSM.OEE-MANAGER.MSM-UC-ENV-DRP-1_MODIFICAR_MANUAL_ESTADOS_MAQUINA.ROOT_MERGE" on the equipment "MSM.OEE-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ModidicacionEstadoMaquinaMerge(G2Base.PMConnector connector) : 
                base(connector, "MSM.OEE-MANAGER", "MSM.OEE-MANAGER.MSM-UC-ENV-DRP-1_MODIFICAR_MANUAL_ESTADOS_MAQUINA.ROOT_MERGE", 4, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ModidicacionEstadoMaquinaMerge(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 4, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ModidicacionEstadoMaquinaMerge(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 4, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="BL_MERGE_UP">Input TRUTH-VALUE</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(bool BL_MERGE_UP, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = BL_MERGE_UP;
            m_InputParamValues[1] = FLT_END_TIME;
            m_InputParamValues[2] = FLT_START_TIME;
            m_InputParamValues[3] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = SynchCall();
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="BL_MERGE_UP">Input TRUTH-VALUE</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, bool BL_MERGE_UP, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = BL_MERGE_UP;
            m_InputParamValues[1] = FLT_END_TIME;
            m_InputParamValues[2] = FLT_START_TIME;
            m_InputParamValues[3] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = SynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="BL_MERGE_UP">Input TRUTH-VALUE</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(bool BL_MERGE_UP, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = BL_MERGE_UP;
            m_InputParamValues[1] = FLT_END_TIME;
            m_InputParamValues[2] = FLT_START_TIME;
            m_InputParamValues[3] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="BL_MERGE_UP">Input TRUTH-VALUE</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, bool BL_MERGE_UP, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = BL_MERGE_UP;
            m_InputParamValues[1] = FLT_END_TIME;
            m_InputParamValues[2] = FLT_START_TIME;
            m_InputParamValues[3] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = AsynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult()
        {
            G2Base.CallResult result = AsynchGetResult();
            return result;
        }
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "BL_MERGE_UP";
            m_InputParamNames[1] = "FLT_END_TIME";
            m_InputParamNames[2] = "FLT_START_TIME";
            m_InputParamNames[3] = "STR_EQUIPMENT_PATH";
            Timeout = 300000;
        }
    }
}
