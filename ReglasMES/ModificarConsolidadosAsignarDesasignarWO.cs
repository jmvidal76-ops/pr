namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR
    /// </summary>
    public class ModificarConsolidadosAsignarDesasignarWO : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "WO-MANAGER";

        protected static string m_Path = "WO-MANAGER.SET_ZONE_MACHINES_WO.00_ROOT_PRINCIPAL";
        
        /// <summary>
        /// Create an object to invoke "MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR" on the equipment "MSM.WO-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ModificarConsolidadosAsignarDesasignarWO(G2Base.PMConnector connector) :
            base(connector, "MSM.WO-MANAGER", "MSM.WO-MANAGER.SET_ZONE_MACHINES_WO.00_ROOT_PRINCIPAL", 15, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ModificarConsolidadosAsignarDesasignarWO(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 15, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ModificarConsolidadosAsignarDesasignarWO(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 15, 1)
        {
            InitParamNames();
        }

        /// <summary>
        /// Asynchronous call
        /// </summary>        
        /// <param name="STR_ORDEN_PADRE">Input TEXT</param>
        /// <param name="STR_ORDEN_HIJO">Input TEXT</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <param name="INT_ASIG_O_DESASIG">Input INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(
                    string STR_ORDEN_PADRE,
                    string STR_ORDEN_HIJO,
                    string STR_LINEA,
                    int INT_DESASIGNACION
                    )
        {

            m_InputParamValues[0] = STR_ORDEN_PADRE;
            m_InputParamValues[1] = STR_ORDEN_HIJO;
            m_InputParamValues[2] = STR_LINEA;
            m_InputParamValues[3] = INT_DESASIGNACION;
            G2Base.CallResult result = AsynchCall();

            return result;
        }

        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>        
        /// <param name="STR_ORDEN_PADRE">Input TEXT</param>
        /// <param name="STR_ORDEN_HIJO">Input TEXT</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <param name="INT_ASIG_O_DESASIG">Input INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    string STR_ORDEN_PADRE, 
                    string STR_ORDEN_HIJO,
                    string STR_LINEA,
                    int INT_DESASIGNACION
                    )
        {
           
            m_InputParamValues[0] = STR_ORDEN_PADRE;
            m_InputParamValues[1] = STR_ORDEN_HIJO;
            m_InputParamValues[2] = STR_LINEA;
            m_InputParamValues[3] = INT_DESASIGNACION;
            G2Base.CallResult result = SynchCall();
            
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="STR_ORDEN_PADRE">Input TEXT</param>
        /// <param name="STR_ORDEN_HIJO">Input TEXT</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <param name="INT_ASIG_O_DESASIG">Input INTEGER</param>  
        /// <param name="errDescription">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    G2Base.PMMultiConnector pmmc,
                    string STR_ORDEN_PADRE, 
                    string STR_ORDEN_HIJO,
                    string STR_LINEA,
                    int INT_ASIG_O_DESASIG
                    )
        {
            m_InputParamValues[0] = STR_ORDEN_PADRE;
            m_InputParamValues[1] = STR_ORDEN_HIJO;
            m_InputParamValues[2] = STR_LINEA;
            m_InputParamValues[3] = INT_ASIG_O_DESASIG;
            G2Base.CallResult result = SynchCall(pmmc);
            
            return result;
        }
        
       
        /// <summary>
        /// Initialize input parameters names
        /// <param name="STR_ORDEN_PADRE">Input TEXT</param>
        /// <param name="STR_ORDEN_HIJO">Input TEXT</param>
        /// <param name="STR_LINEA">Input TEXT</param>
        /// <param name="INT_CONSOLIDADOS_WO">Input INTEGER</param>  
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "STR_ORDEN_PADRE";
            m_InputParamNames[1] = "STR_ORDEN_HIJO";
            m_InputParamNames[2] = "STR_LINEA";
            m_InputParamNames[3] = "INT_DESASIGNACION";
            
            Timeout = 300000;
        }
    }
}
