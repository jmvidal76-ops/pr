namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_WO.ROOT-PRINCIPAL
    /// </summary>
    public class ObtenerProduccionOrden : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "OEE-MANAGER";
        
        protected static string m_Path = "OEE-MANAGER.OBTENER_DATOS_PRODUCCION_WO.ROOT-PRINCIPAL";
        
        /// <summary>
        /// Create an object to invoke "MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_WO.ROOT-PRINCIPAL" on the equipment "MSM.OEE-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ObtenerProduccionOrden(G2Base.PMConnector connector) : 
                base(connector, "MSM.OEE-MANAGER", "MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_WO.ROOT-PRINCIPAL", 2, 8)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ObtenerProduccionOrden(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 2, 8)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ObtenerProduccionOrden(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 2, 8)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="BL_ACTUALIZAR_BBDD">Input TRUTH-VALUE</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION_LLENADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_PRODUCCION_PALETIZADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS_ENVASES">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(bool BL_ACTUALIZAR_BBDD, string STR_WO_ID, ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL, ref int INT_CONTADOR_PRODUCCION_LLENADORA, ref int INT_CONTADOR_PRODUCCION_PALETIZADORA, ref int INT_CONTADOR_RECHAZOS_ENVASES, ref double FLT_VELOCIDAD_REAL)
        {
            m_InputParamValues[0] = BL_ACTUALIZAR_BBDD;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[0]));
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[1]));                
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[2]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[3]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[4]));
                INT_CONTADOR_PRODUCCION_LLENADORA = ((int)(m_OutputParamValues[5]));
                INT_CONTADOR_PRODUCCION_PALETIZADORA = ((int)(m_OutputParamValues[6]));
                INT_CONTADOR_RECHAZOS_ENVASES = ((int)(m_OutputParamValues[7]));
                FLT_VELOCIDAD_REAL = ((double)(m_OutputParamValues[8]));
            }
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="BL_ACTUALIZAR_BBDD">Input TRUTH-VALUE</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION_LLENADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_PRODUCCION_PALETIZADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS_ENVASES">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, bool BL_ACTUALIZAR_BBDD, string STR_WO_ID, ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL, ref int INT_CONTADOR_PRODUCCION_LLENADORA, ref int INT_CONTADOR_PRODUCCION_PALETIZADORA, ref int INT_CONTADOR_RECHAZOS_ENVASES)
        {
            m_InputParamValues[0] = BL_ACTUALIZAR_BBDD;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[0]));
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[1]));
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[2]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[3]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[4]));
                INT_CONTADOR_PRODUCCION_LLENADORA = ((int)(m_OutputParamValues[5]));
                INT_CONTADOR_PRODUCCION_PALETIZADORA = ((int)(m_OutputParamValues[6]));
                INT_CONTADOR_RECHAZOS_ENVASES = ((int)(m_OutputParamValues[7]));
            }
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="BL_ACTUALIZAR_BBDD">Input TRUTH-VALUE</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(bool BL_ACTUALIZAR_BBDD, string STR_WO_ID)
        {
            m_InputParamValues[0] = BL_ACTUALIZAR_BBDD;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="BL_ACTUALIZAR_BBDD">Input TRUTH-VALUE</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, bool BL_ACTUALIZAR_BBDD, string STR_WO_ID)
        {
            m_InputParamValues[0] = BL_ACTUALIZAR_BBDD;
            m_InputParamValues[1] = STR_WO_ID;
            G2Base.CallResult result = AsynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION_LLENADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_PRODUCCION_PALETIZADORA">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS_ENVASES">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult(ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL, ref int INT_CONTADOR_PRODUCCION_LLENADORA, ref int INT_CONTADOR_PRODUCCION_PALETIZADORA, ref int INT_CONTADOR_RECHAZOS_ENVASES)
        {
            G2Base.CallResult result = AsynchGetResult();
            if (GetValues(result))
            {
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[0]));
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[1]));
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[2]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[3]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[4]));
                INT_CONTADOR_PRODUCCION_LLENADORA = ((int)(m_OutputParamValues[5]));
                INT_CONTADOR_PRODUCCION_PALETIZADORA = ((int)(m_OutputParamValues[6]));
                INT_CONTADOR_RECHAZOS_ENVASES = ((int)(m_OutputParamValues[7]));
            }
            return result;
        }
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "BL_ACTUALIZAR_BBDD";
            m_InputParamNames[1] = "STR_WO_ID";
            Timeout = 300000;
        }
    }
}
