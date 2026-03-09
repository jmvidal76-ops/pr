namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CONSOLIDACION_DATOS.RECALCULAR_MEDIAS_ARRANQUES
    /// </summary>
    public class RecalcularMediasArranques : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "WO-MANAGER";
        
        protected static string m_Path = "WO-MANAGER.CONSOLIDACION_DATOS.RECALCULAR_MEDIAS_ARRANQUES";
        
        /// <summary>
        /// Create an object to invoke "MSM.WO-MANAGER.CONSOLIDACION_DATOS.RECALCULAR_MEDIAS_ARRANQUES" on the equipment "MSM.WO-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public RecalcularMediasArranques(G2Base.PMConnector connector) : 
                base(connector, "MSM.WO-MANAGER", "MSM.WO-MANAGER.CONSOLIDACION_DATOS.RECALCULAR_MEDIAS_ARRANQUES", 2, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public RecalcularMediasArranques(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 2, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public RecalcularMediasArranques(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 2, 0)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="QTY_NUM_REGISTROS">Input QUANTITY</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(double QTY_NUM_REGISTROS, string STR_LINEA)
        {
            m_InputParamValues[0] = QTY_NUM_REGISTROS;
            m_InputParamValues[1] = STR_LINEA;
            G2Base.CallResult result = SynchCall();
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="QTY_NUM_REGISTROS">Input QUANTITY</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, double QTY_NUM_REGISTROS, string STR_LINEA)
        {
            m_InputParamValues[0] = QTY_NUM_REGISTROS;
            m_InputParamValues[1] = STR_LINEA;
            G2Base.CallResult result = SynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="QTY_NUM_REGISTROS">Input QUANTITY</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(double QTY_NUM_REGISTROS, string STR_LINEA)
        {
            m_InputParamValues[0] = QTY_NUM_REGISTROS;
            m_InputParamValues[1] = STR_LINEA;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="QTY_NUM_REGISTROS">Input QUANTITY</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, double QTY_NUM_REGISTROS, string STR_LINEA)
        {
            m_InputParamValues[0] = QTY_NUM_REGISTROS;
            m_InputParamValues[1] = STR_LINEA;
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
            m_InputParamNames[0] = "QTY_NUM_REGISTROS";
            m_InputParamNames[1] = "STR_LINEA";
            Timeout = 300000;
        }
    }
}
