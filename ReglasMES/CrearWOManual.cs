namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR
    /// </summary>
    public class CrearWOManual : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "WO-MANAGER";
        
        protected static string m_Path = "WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR";
        
        /// <summary>
        /// Create an object to invoke "MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR" on the equipment "MSM.WO-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public CrearWOManual(G2Base.PMConnector connector) : 
                base(connector, "MSM.WO-MANAGER", "MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR", 15, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public CrearWOManual(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 15, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public CrearWOManual(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 15, 1)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="STR_PPR_ID">Input TEXT</param>
        /// <param name="QTY_WO_QTY">Input QUANTITY</param>
        /// <param name="STR_UOM">Input TEXT</param>
        /// <param name="FL_START_TIME">Input FLOAT</param>
        /// <param name="FL_END_TIME">Input FLOAT</param>
        /// <param name="STR_WO_ID_PART">Input TEXT</param>
        /// <param name="STR_PART_ID">Input TEXT</param>
        /// <param name="ID_ACTUAL_PART">Input TEXT</param>
        /// <param name="STR_ESTADO">Input TEXT</param>
        /// <param name="FL_DUE_TIME">Input FLOAT</param>
        /// <param name="FL_RELEASE_TIME">Input FLOAT</param>
        /// <param name="STR_CODIGO_PREACTOR">Input TEXT</param>
        /// <param name="STR_WO_ORIGINAL_ID">Input TEXT</param>
        /// <param name="STR_NOTE">Input TEXT</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    string STR_WO_ID, 
                    string STR_PPR_ID, 
                    double QTY_WO_QTY, 
                    string STR_UOM, 
                    double FL_START_TIME, 
                    double FL_END_TIME, 
                    string STR_WO_ID_PART, 
                    string STR_PART_ID, 
                    string ID_ACTUAL_PART, 
                    string STR_ESTADO, 
                    double FL_DUE_TIME, 
                    double FL_RELEASE_TIME, 
                    string STR_CODIGO_PREACTOR, 
                    string STR_WO_ORIGINAL_ID, 
                    string STR_NOTE, 
                    ref string errDescription)
        {
            m_InputParamValues[0] = STR_WO_ID;
            m_InputParamValues[1] = STR_PPR_ID;
            m_InputParamValues[2] = QTY_WO_QTY;
            m_InputParamValues[3] = STR_UOM;
            m_InputParamValues[4] = FL_START_TIME;
            m_InputParamValues[5] = FL_END_TIME;
            m_InputParamValues[6] = STR_WO_ID_PART;
            m_InputParamValues[7] = STR_PART_ID;
            m_InputParamValues[8] = ID_ACTUAL_PART;
            m_InputParamValues[9] = STR_ESTADO;
            m_InputParamValues[10] = FL_DUE_TIME;
            m_InputParamValues[11] = FL_RELEASE_TIME;
            m_InputParamValues[12] = STR_CODIGO_PREACTOR;
            m_InputParamValues[13] = STR_WO_ORIGINAL_ID;
            m_InputParamValues[14] = STR_NOTE;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                errDescription = ((string)(m_OutputParamValues[0]));
            }
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="STR_PPR_ID">Input TEXT</param>
        /// <param name="QTY_WO_QTY">Input QUANTITY</param>
        /// <param name="STR_UOM">Input TEXT</param>
        /// <param name="FL_START_TIME">Input FLOAT</param>
        /// <param name="FL_END_TIME">Input FLOAT</param>
        /// <param name="STR_WO_ID_PART">Input TEXT</param>
        /// <param name="STR_PART_ID">Input TEXT</param>
        /// <param name="ID_ACTUAL_PART">Input TEXT</param>
        /// <param name="STR_ESTADO">Input TEXT</param>
        /// <param name="FL_DUE_TIME">Input FLOAT</param>
        /// <param name="FL_RELEASE_TIME">Input FLOAT</param>
        /// <param name="STR_CODIGO_PREACTOR">Input TEXT</param>
        /// <param name="STR_WO_ORIGINAL_ID">Input TEXT</param>
        /// <param name="STR_NOTE">Input TEXT</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    G2Base.PMMultiConnector pmmc, 
                    string STR_WO_ID, 
                    string STR_PPR_ID, 
                    double QTY_WO_QTY, 
                    string STR_UOM, 
                    double FL_START_TIME, 
                    double FL_END_TIME, 
                    string STR_WO_ID_PART, 
                    string STR_PART_ID, 
                    string ID_ACTUAL_PART, 
                    string STR_ESTADO, 
                    double FL_DUE_TIME, 
                    double FL_RELEASE_TIME, 
                    string STR_CODIGO_PREACTOR, 
                    string STR_WO_ORIGINAL_ID, 
                    string STR_NOTE, 
                    ref string errDescription)
        {
            m_InputParamValues[0] = STR_WO_ID;
            m_InputParamValues[1] = STR_PPR_ID;
            m_InputParamValues[2] = QTY_WO_QTY;
            m_InputParamValues[3] = STR_UOM;
            m_InputParamValues[4] = FL_START_TIME;
            m_InputParamValues[5] = FL_END_TIME;
            m_InputParamValues[6] = STR_WO_ID_PART;
            m_InputParamValues[7] = STR_PART_ID;
            m_InputParamValues[8] = ID_ACTUAL_PART;
            m_InputParamValues[9] = STR_ESTADO;
            m_InputParamValues[10] = FL_DUE_TIME;
            m_InputParamValues[11] = FL_RELEASE_TIME;
            m_InputParamValues[12] = STR_CODIGO_PREACTOR;
            m_InputParamValues[13] = STR_WO_ORIGINAL_ID;
            m_InputParamValues[14] = STR_NOTE;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                errDescription = ((string)(m_OutputParamValues[0]));
            }
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="STR_PPR_ID">Input TEXT</param>
        /// <param name="QTY_WO_QTY">Input QUANTITY</param>
        /// <param name="STR_UOM">Input TEXT</param>
        /// <param name="FL_START_TIME">Input FLOAT</param>
        /// <param name="FL_END_TIME">Input FLOAT</param>
        /// <param name="STR_WO_ID_PART">Input TEXT</param>
        /// <param name="STR_PART_ID">Input TEXT</param>
        /// <param name="ID_ACTUAL_PART">Input TEXT</param>
        /// <param name="STR_ESTADO">Input TEXT</param>
        /// <param name="FL_DUE_TIME">Input FLOAT</param>
        /// <param name="FL_RELEASE_TIME">Input FLOAT</param>
        /// <param name="STR_CODIGO_PREACTOR">Input TEXT</param>
        /// <param name="STR_WO_ORIGINAL_ID">Input TEXT</param>
        /// <param name="STR_NOTE">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(string STR_WO_ID, string STR_PPR_ID, double QTY_WO_QTY, string STR_UOM, double FL_START_TIME, double FL_END_TIME, string STR_WO_ID_PART, string STR_PART_ID, string ID_ACTUAL_PART, string STR_ESTADO, double FL_DUE_TIME, double FL_RELEASE_TIME, string STR_CODIGO_PREACTOR, string STR_WO_ORIGINAL_ID, string STR_NOTE)
        {
            m_InputParamValues[0] = STR_WO_ID;
            m_InputParamValues[1] = STR_PPR_ID;
            m_InputParamValues[2] = QTY_WO_QTY;
            m_InputParamValues[3] = STR_UOM;
            m_InputParamValues[4] = FL_START_TIME;
            m_InputParamValues[5] = FL_END_TIME;
            m_InputParamValues[6] = STR_WO_ID_PART;
            m_InputParamValues[7] = STR_PART_ID;
            m_InputParamValues[8] = ID_ACTUAL_PART;
            m_InputParamValues[9] = STR_ESTADO;
            m_InputParamValues[10] = FL_DUE_TIME;
            m_InputParamValues[11] = FL_RELEASE_TIME;
            m_InputParamValues[12] = STR_CODIGO_PREACTOR;
            m_InputParamValues[13] = STR_WO_ORIGINAL_ID;
            m_InputParamValues[14] = STR_NOTE;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="STR_WO_ID">Input TEXT</param>
        /// <param name="STR_PPR_ID">Input TEXT</param>
        /// <param name="QTY_WO_QTY">Input QUANTITY</param>
        /// <param name="STR_UOM">Input TEXT</param>
        /// <param name="FL_START_TIME">Input FLOAT</param>
        /// <param name="FL_END_TIME">Input FLOAT</param>
        /// <param name="STR_WO_ID_PART">Input TEXT</param>
        /// <param name="STR_PART_ID">Input TEXT</param>
        /// <param name="ID_ACTUAL_PART">Input TEXT</param>
        /// <param name="STR_ESTADO">Input TEXT</param>
        /// <param name="FL_DUE_TIME">Input FLOAT</param>
        /// <param name="FL_RELEASE_TIME">Input FLOAT</param>
        /// <param name="STR_CODIGO_PREACTOR">Input TEXT</param>
        /// <param name="STR_WO_ORIGINAL_ID">Input TEXT</param>
        /// <param name="STR_NOTE">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(
                    G2Base.PMMultiConnector pmmc, 
                    string STR_WO_ID, 
                    string STR_PPR_ID, 
                    double QTY_WO_QTY, 
                    string STR_UOM, 
                    double FL_START_TIME, 
                    double FL_END_TIME, 
                    string STR_WO_ID_PART, 
                    string STR_PART_ID, 
                    string ID_ACTUAL_PART, 
                    string STR_ESTADO, 
                    double FL_DUE_TIME, 
                    double FL_RELEASE_TIME, 
                    string STR_CODIGO_PREACTOR, 
                    string STR_WO_ORIGINAL_ID, 
                    string STR_NOTE)
        {
            m_InputParamValues[0] = STR_WO_ID;
            m_InputParamValues[1] = STR_PPR_ID;
            m_InputParamValues[2] = QTY_WO_QTY;
            m_InputParamValues[3] = STR_UOM;
            m_InputParamValues[4] = FL_START_TIME;
            m_InputParamValues[5] = FL_END_TIME;
            m_InputParamValues[6] = STR_WO_ID_PART;
            m_InputParamValues[7] = STR_PART_ID;
            m_InputParamValues[8] = ID_ACTUAL_PART;
            m_InputParamValues[9] = STR_ESTADO;
            m_InputParamValues[10] = FL_DUE_TIME;
            m_InputParamValues[11] = FL_RELEASE_TIME;
            m_InputParamValues[12] = STR_CODIGO_PREACTOR;
            m_InputParamValues[13] = STR_WO_ORIGINAL_ID;
            m_InputParamValues[14] = STR_NOTE;
            G2Base.CallResult result = AsynchCall(pmmc);
            return result;
        }
        
        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <param name="errDescription">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult(ref string errDescription)
        {
            G2Base.CallResult result = AsynchGetResult();
            if (GetValues(result))
            {
                errDescription = ((string)(m_OutputParamValues[0]));
            }
            return result;
        }
        
        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "STR_WO_ID";
            m_InputParamNames[1] = "STR_PPR_ID";
            m_InputParamNames[2] = "QTY_WO_QTY";
            m_InputParamNames[3] = "STR_UOM";
            m_InputParamNames[4] = "FL_START_TIME";
            m_InputParamNames[5] = "FL_END_TIME";
            m_InputParamNames[6] = "STR_WO_ID_PART";
            m_InputParamNames[7] = "STR_PART_ID";
            m_InputParamNames[8] = "ID_ACTUAL_PART";
            m_InputParamNames[9] = "STR_ESTADO";
            m_InputParamNames[10] = "FL_DUE_TIME";
            m_InputParamNames[11] = "FL_RELEASE_TIME";
            m_InputParamNames[12] = "STR_CODIGO_PREACTOR";
            m_InputParamNames[13] = "STR_WO_ORIGINAL_ID";
            m_InputParamNames[14] = "STR_NOTE";
            Timeout = 300000;
        }
    }
}
