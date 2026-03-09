namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR
    /// </summary>
    public class ModificarAsignacionMaquinaMultilinea : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "WO-MANAGER";

        protected static string m_Path = "WO-MANAGER.MULTILINEA.00_MODIFICACION_ASIGNACION_MAQUINA";
        
        /// <summary>
        /// Create an object to invoke "MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR" on the equipment "MSM.WO-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ModificarAsignacionMaquinaMultilinea(G2Base.PMConnector connector) :
            base(connector, "MSM.WO-MANAGER", "MSM.WO-MANAGER.MODIFICACION_MAQUINAS_COMPARTIDAS.ROOT-PRINCIPAL", 4, 1)
        {
            InitParamNames();
        }
        
        public ModificarAsignacionMaquinaMultilinea(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 4, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ModificarAsignacionMaquinaMultilinea(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 4, 1)
        {
            InitParamNames();
        }
     
        public G2Base.CallResult Start()
        {
            G2Base.CallResult result = AsynchCall();
            
            return result;
        }

        public G2Base.CallResult Call()
        {
            G2Base.CallResult result = SynchCall();

            return result;
        }

        protected void InitParamNames()
        {
            Timeout = 300000;
        }
    }
}
