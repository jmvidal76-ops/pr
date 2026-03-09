namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_SHIFT_MANAGEMENT
    /// </summary>
    public class ShcAsignarExcepcionTurno : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "SHC-MANAGER";
        
        protected static string m_Path = "SHC-MANAGER.SHC-MANAGEMENT.ROOT_SHIFT_MANAGEMENT";
        
        /// <summary>
        /// Create an object to invoke "MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_SHIFT_MANAGEMENT" on the equipment "MSM.SHC-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ShcAsignarExcepcionTurno(G2Base.PMConnector connector) : 
                base(connector, "MSM.SHC-MANAGER", "MSM.SHC-MANAGER.SHC-MANAGEMENT.ROOT_SHIFT_MANAGEMENT", 7, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ShcAsignarExcepcionTurno(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 7, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ShcAsignarExcepcionTurno(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 7, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="ALTERNATIVE_ID">Input TEXT</param>
        /// <param name="DAY_DATE">Input FLOAT</param>
        /// <param name="END_DATE">Input FLOAT</param>
        /// <param name="OPERACION">Input TEXT</param>
        /// <param name="SHIFT_CALENDAR">Input TEXT</param>
        /// <param name="START_DATE">Input FLOAT</param>
        /// <param name="WORKINGTIME_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(string ALTERNATIVE_ID, double DAY_DATE, double END_DATE, string OPERACION, string SHIFT_CALENDAR, double START_DATE, string WORKINGTIME_ID)
        {
            m_InputParamValues[0] = ALTERNATIVE_ID;
            m_InputParamValues[1] = DAY_DATE;
            m_InputParamValues[2] = END_DATE;
            m_InputParamValues[3] = OPERACION;// UPDATE,ADD, DELETE
            m_InputParamValues[4] = SHIFT_CALENDAR;
            m_InputParamValues[5] = START_DATE;
            m_InputParamValues[6] = WORKINGTIME_ID;
            G2Base.CallResult result = SynchCall();
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="ALTERNATIVE_ID">Input TEXT</param>
        /// <param name="DAY_DATE">Input FLOAT</param>
        /// <param name="END_DATE">Input FLOAT</param>
        /// <param name="OPERACION">Input TEXT</param>
        /// <param name="SHIFT_CALENDAR">Input TEXT</param>
        /// <param name="START_DATE">Input FLOAT</param>
        /// <param name="WORKINGTIME_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, string ALTERNATIVE_ID, double DAY_DATE, double END_DATE, string OPERACION, string SHIFT_CALENDAR, double START_DATE, string WORKINGTIME_ID)
        {
            m_InputParamValues[0] = ALTERNATIVE_ID;
            m_InputParamValues[1] = DAY_DATE;
            m_InputParamValues[2] = END_DATE;
            m_InputParamValues[3] = OPERACION;
            m_InputParamValues[4] = SHIFT_CALENDAR;
            m_InputParamValues[5] = START_DATE;
            m_InputParamValues[6] = WORKINGTIME_ID;
            G2Base.CallResult result = SynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="ALTERNATIVE_ID">Input TEXT</param>
        /// <param name="DAY_DATE">Input FLOAT</param>
        /// <param name="END_DATE">Input FLOAT</param>
        /// <param name="OPERACION">Input TEXT</param>
        /// <param name="SHIFT_CALENDAR">Input TEXT</param>
        /// <param name="START_DATE">Input FLOAT</param>
        /// <param name="WORKINGTIME_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(string ALTERNATIVE_ID, double DAY_DATE, double END_DATE, string OPERACION, string SHIFT_CALENDAR, double START_DATE, string WORKINGTIME_ID)
        {
            m_InputParamValues[0] = ALTERNATIVE_ID;
            m_InputParamValues[1] = DAY_DATE;
            m_InputParamValues[2] = END_DATE;
            m_InputParamValues[3] = OPERACION;
            m_InputParamValues[4] = SHIFT_CALENDAR;
            m_InputParamValues[5] = START_DATE;
            m_InputParamValues[6] = WORKINGTIME_ID;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="ALTERNATIVE_ID">Input TEXT</param>
        /// <param name="DAY_DATE">Input FLOAT</param>
        /// <param name="END_DATE">Input FLOAT</param>
        /// <param name="OPERACION">Input TEXT</param>
        /// <param name="SHIFT_CALENDAR">Input TEXT</param>
        /// <param name="START_DATE">Input FLOAT</param>
        /// <param name="WORKINGTIME_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, string ALTERNATIVE_ID, double DAY_DATE, double END_DATE, string OPERACION, string SHIFT_CALENDAR, double START_DATE, string WORKINGTIME_ID)
        {
            m_InputParamValues[0] = ALTERNATIVE_ID;
            m_InputParamValues[1] = DAY_DATE;
            m_InputParamValues[2] = END_DATE;
            m_InputParamValues[3] = OPERACION;
            m_InputParamValues[4] = SHIFT_CALENDAR;
            m_InputParamValues[5] = START_DATE;
            m_InputParamValues[6] = WORKINGTIME_ID;
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
            m_InputParamNames[0] = "ALTERNATIVE_ID";
            m_InputParamNames[1] = "DAY_DATE";
            m_InputParamNames[2] = "END_DATE";
            m_InputParamNames[3] = "OPERACION";
            m_InputParamNames[4] = "SHIFT_CALENDAR";
            m_InputParamNames[5] = "START_DATE";
            m_InputParamNames[6] = "WORKINGTIME_ID";
            Timeout = 300000;
        }
    }
}
