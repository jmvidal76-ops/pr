namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CHANGE_WO_STATUS.ROOT_CHANGE_WO_STATUS
    /// </summary>
    public class InterfazJDEChangeStatusWO : G2Base.PMCall
    {
       
        
        public InterfazJDEChangeStatusWO(G2Base.PMConnector connector) :
            base(connector, "MSM.INTERFAZ-MANAGER", "MSM.INTERFAZ-MANAGER.JDE-MES-PREACTOR.ROOT-WO_CHANGE_STATUS", 2, 0)
        {
            InitParamNames();
        }
        
       
      
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(string STR_WO_STATUS, string STR_WO_ID)
        {
            m_InputParamValues[0] = STR_WO_STATUS;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = SynchCall();
           
            return result;
        }

        
       
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>     
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(string STR_WO_STATUS, string STR_WO_ID)
        {
            m_InputParamValues[0] = STR_WO_STATUS;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "STR_WO_STATUS";
            m_InputParamNames[1] = "STR_WO_ID";
            Timeout = 300000;
        }
    }
}
