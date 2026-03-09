namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_MAQUINA.ROOT-PRINCIPAL
    /// </summary>
    public class ObtenerProduccionMaquina : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "OEE-MANAGER";
        
        protected static string m_Path = "OEE-MANAGER.OBTENER_DATOS_PRODUCCION_MAQUINA.ROOT-PRINCIPAL";
        
        /// <summary>
        /// Create an object to invoke "MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_MAQUINA.ROOT-PRINCIPAL" on the equipment "MSM.OEE-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public ObtenerProduccionMaquina(G2Base.PMConnector connector) : 
                base(connector, "MSM.OEE-MANAGER", "MSM.OEE-MANAGER.OBTENER_DATOS_PRODUCCION_MAQUINA.ROOT-PRINCIPAL", 3, 11)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public ObtenerProduccionMaquina(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 3, 11)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public ObtenerProduccionMaquina(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 3, 11)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH, ref double errCode, ref string errDescription, ref string errSource, ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL,ref int INT_CONTADOR_PRODUCCION, ref int INT_CONTADOR_RECHAZOS)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[1]);
                errDescription = ((string)(m_OutputParamValues[2]));
                errSource = ((string)(m_OutputParamValues[0]));
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[4]));
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[3]));
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[5]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[6]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[7]));
                INT_CONTADOR_PRODUCCION = ((int)(m_OutputParamValues[8]));
                INT_CONTADOR_RECHAZOS = ((int)(m_OutputParamValues[9]));
            }
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(G2Base.PMMultiConnector pmmc, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH, ref double errCode, ref string errDescription, ref string errSource, ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL, ref int INT_CONTADOR_PRODUCCION, ref int INT_CONTADOR_RECHAZOS)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[0]);
                errDescription = ((string)(m_OutputParamValues[1]));
                errSource = ((string)(m_OutputParamValues[2]));
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[3]));
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[4]));
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[5]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[6]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[7]));
                INT_CONTADOR_PRODUCCION = ((int)(m_OutputParamValues[8]));
                INT_CONTADOR_RECHAZOS = ((int)(m_OutputParamValues[9]));
            }
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, double FLT_END_TIME, double FLT_START_TIME, string STR_EQUIPMENT_PATH)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = STR_EQUIPMENT_PATH;
            G2Base.CallResult result = AsynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <param name="FLT_TIEMPO_BRUTO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_NETO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_OPERATIVO">Output FLOAT</param>
        /// <param name="FLT_TIEMPO_PLANIFICADO">Output FLOAT</param>
        /// <param name="FLT_VELOCIDAD_NOMINAL">Output FLOAT</param>
        /// <param name="INT_CONTADOR_PRODUCCION">Output INTEGER</param>
        /// <param name="INT_CONTADOR_RECHAZOS">Output INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult(ref double errCode, ref string errDescription, ref string errSource, ref double FLT_TIEMPO_BRUTO, ref double FLT_TIEMPO_NETO, ref double FLT_TIEMPO_OPERATIVO, ref double FLT_TIEMPO_PLANIFICADO, ref double FLT_VELOCIDAD_NOMINAL, ref int INT_CONTADOR_PRODUCCION, ref int INT_CONTADOR_RECHAZOS)
        {
            G2Base.CallResult result = AsynchGetResult();
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[0]);
                errDescription = ((string)(m_OutputParamValues[1]));
                errSource = ((string)(m_OutputParamValues[2]));
                FLT_TIEMPO_BRUTO = ((double)(m_OutputParamValues[3]));
                FLT_TIEMPO_NETO = ((double)(m_OutputParamValues[4]));
                FLT_TIEMPO_OPERATIVO = ((double)(m_OutputParamValues[5]));
                FLT_TIEMPO_PLANIFICADO = ((double)(m_OutputParamValues[6]));
                FLT_VELOCIDAD_NOMINAL = ((double)(m_OutputParamValues[7]));
                INT_CONTADOR_PRODUCCION = ((int)(m_OutputParamValues[8]));
                INT_CONTADOR_RECHAZOS = ((int)(m_OutputParamValues[9]));
            }
            return result;
        }
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "FLT_END_TIME";
            m_InputParamNames[1] = "FLT_START_TIME";
            m_InputParamNames[2] = "STR_EQUIPMENT_PATH";
            Timeout = 300000;
        }
    }
}
