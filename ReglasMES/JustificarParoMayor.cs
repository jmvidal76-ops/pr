namespace ReglasMES
{
    using System;
    using G2Base;
    
    
    /// <summary>
    /// Perform calls to Instance Rule MSM.OEE-MANAGER.MSM-UC-ENV-PROD_EXE-17_JUSTIFICAR_PARO.ROOT_JUSTIFICA_PARO
    /// </summary>
    /// 
    public class JustificarParoMayor : G2Base.PMCall
    {
        
        protected static string m_EquipmentPath = "OEE-MANAGER";
        
        protected static string m_Path = "OEE-MANAGER.MSM-UC-ENV-PROD_EXE-17_JUSTIFICAR_PARO.ROOT_JUSTIFICA_PARO";
        
        /// <summary>
        /// Create an object to invoke "MSM.OEE-MANAGER.MSM-UC-ENV-PROD_EXE-17_JUSTIFICAR_PARO.ROOT_JUSTIFICA_PARO" on the equipment "MSM.OEE-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public JustificarParoMayor(G2Base.PMConnector connector) : 
                base(connector, "MSM.OEE-MANAGER", "MSM.OEE-MANAGER.MSM-UC-ENV-PROD_EXE-17_JUSTIFICAR_PARO.ROOT_JUSTIFICA_PARO", 13, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public JustificarParoMayor(G2Base.PMConnector connector, string equipment, string ruleName) : 
                base(connector, equipment, ruleName, 13, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public JustificarParoMayor(G2Base.PMConnector connector, string plant) : 
                base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 13, 3)
        {
            InitParamNames();
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="LNG_LEVEL1_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL2_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL3_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL4_ID">Input QUANTITY</param>
        /// <param name="LNG_TIME_CATEGORY_ID">Input QUANTITY</param>
        /// <param name="STR_COD_EQ_CONSTRUCTIVO">Input TEXT</param>
        /// <param name="STR_COD_MAQ_CAUSA">Input TEXT</param>
        /// <param name="STR_DESC_AVERIA">Input TEXT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="STR_USERCOMMENT">Input TEXT</param>
        /// <param name="STR_USERNAME">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    //double FLT_END_TIME, 
                    //double FLT_START_TIME, 
                    //double LNG_LEVEL1_ID, 
                    //double LNG_LEVEL2_ID, 
                    //double LNG_LEVEL3_ID, 
                    //double LNG_LEVEL4_ID, 
                    //double LNG_TIME_CATEGORY_ID, 
                    //string STR_COD_EQ_CONSTRUCTIVO, 
                    //string STR_COD_MAQ_CAUSA, 
                    //string STR_DESC_AVERIA, 
                    //string STR_EQUIPMENT_PATH, 
                    //string STR_USERCOMMENT, 
                    //string STR_USERNAME, 
                    //ref double errCode, 
                    //ref string errDescription, 
                    //ref string errSource
                 double FLT_START_TIME,
                     double FLT_END_TIME,
                     string STR_EQUIPMENT_PATH,
                     double LNG_TIME_CATEGORY_ID,
                     double LNG_LEVEL1_ID,
                     double LNG_LEVEL2_ID,
                     double LNG_LEVEL3_ID,
                     double LNG_LEVEL4_ID,
                     string STR_USERNAME,
                     string STR_USERCOMMENT,
                     string STR_COD_MAQ_CAUSA,
                     string STR_COD_EQ_CONSTRUCTIVO,
                     string STR_DESC_AVERIA,

                    ref double errCode,
                    ref string errDescription,
                    ref string errSource
            
            )
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = LNG_LEVEL1_ID;
            m_InputParamValues[3] = LNG_LEVEL2_ID;
            m_InputParamValues[4] = LNG_LEVEL3_ID;
            m_InputParamValues[5] = LNG_LEVEL4_ID;
            m_InputParamValues[6] = LNG_TIME_CATEGORY_ID;
            m_InputParamValues[7] = STR_COD_EQ_CONSTRUCTIVO;
            m_InputParamValues[8] = STR_COD_MAQ_CAUSA;
            m_InputParamValues[9] = STR_DESC_AVERIA;
            m_InputParamValues[10] = STR_EQUIPMENT_PATH;
            m_InputParamValues[11] = STR_USERCOMMENT;
            m_InputParamValues[12] = STR_USERNAME;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[1]);
                errDescription = ((string)(m_OutputParamValues[0]));
                errSource = ((string)(m_OutputParamValues[2]));
                //errCode = QuantityToDouble(m_OutputParamValues[0]);
                //errDescription = ((string)(m_OutputParamValues[1]));
                //errSource = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="LNG_LEVEL1_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL2_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL3_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL4_ID">Input QUANTITY</param>
        /// <param name="LNG_TIME_CATEGORY_ID">Input QUANTITY</param>
        /// <param name="STR_COD_EQ_CONSTRUCTIVO">Input TEXT</param>
        /// <param name="STR_COD_MAQ_CAUSA">Input TEXT</param>
        /// <param name="STR_DESC_AVERIA">Input TEXT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="STR_USERCOMMENT">Input TEXT</param>
        /// <param name="STR_USERNAME">Input TEXT</param>
        /// <param name="errCode">Output QUANTITY</param>
        /// <param name="errDescription">Output TEXT</param>
        /// <param name="errSource">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    G2Base.PMMultiConnector pmmc, 
                    double FLT_END_TIME, 
                    double FLT_START_TIME, 
                    double LNG_LEVEL1_ID, 
                    double LNG_LEVEL2_ID, 
                    double LNG_LEVEL3_ID, 
                    double LNG_LEVEL4_ID, 
                    double LNG_TIME_CATEGORY_ID, 
                    string STR_COD_EQ_CONSTRUCTIVO, 
                    string STR_COD_MAQ_CAUSA, 
                    string STR_DESC_AVERIA, 
                    string STR_EQUIPMENT_PATH, 
                    string STR_USERCOMMENT, 
                    string STR_USERNAME, 
                    ref double errCode, 
                    ref string errDescription, 
                    ref string errSource
            )
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = LNG_LEVEL1_ID;
            m_InputParamValues[3] = LNG_LEVEL2_ID;
            m_InputParamValues[4] = LNG_LEVEL3_ID;
            m_InputParamValues[5] = LNG_LEVEL4_ID;
            m_InputParamValues[6] = LNG_TIME_CATEGORY_ID;
            m_InputParamValues[7] = STR_COD_EQ_CONSTRUCTIVO;
            m_InputParamValues[8] = STR_COD_MAQ_CAUSA;
            m_InputParamValues[9] = STR_DESC_AVERIA;
            m_InputParamValues[10] = STR_EQUIPMENT_PATH;
            m_InputParamValues[11] = STR_USERCOMMENT;
            m_InputParamValues[12] = STR_USERNAME;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                errCode = QuantityToDouble(m_OutputParamValues[1]);
                errDescription = ((string)(m_OutputParamValues[0]));
                errSource = ((string)(m_OutputParamValues[2]));
                //errCode = QuantityToDouble(m_OutputParamValues[0]);
                //errDescription = ((string)(m_OutputParamValues[1]));
                //errSource = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="LNG_LEVEL1_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL2_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL3_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL4_ID">Input QUANTITY</param>
        /// <param name="LNG_TIME_CATEGORY_ID">Input QUANTITY</param>
        /// <param name="STR_COD_EQ_CONSTRUCTIVO">Input TEXT</param>
        /// <param name="STR_COD_MAQ_CAUSA">Input TEXT</param>
        /// <param name="STR_DESC_AVERIA">Input TEXT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="STR_USERCOMMENT">Input TEXT</param>
        /// <param name="STR_USERNAME">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(double FLT_END_TIME, double FLT_START_TIME, double LNG_LEVEL1_ID, double LNG_LEVEL2_ID, double LNG_LEVEL3_ID, double LNG_LEVEL4_ID, double LNG_TIME_CATEGORY_ID, string STR_COD_EQ_CONSTRUCTIVO, string STR_COD_MAQ_CAUSA, string STR_DESC_AVERIA, string STR_EQUIPMENT_PATH, string STR_USERCOMMENT, string STR_USERNAME)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = LNG_LEVEL1_ID;
            m_InputParamValues[3] = LNG_LEVEL2_ID;
            m_InputParamValues[4] = LNG_LEVEL3_ID;
            m_InputParamValues[5] = LNG_LEVEL4_ID;
            m_InputParamValues[6] = LNG_TIME_CATEGORY_ID;
            m_InputParamValues[7] = STR_COD_EQ_CONSTRUCTIVO;
            m_InputParamValues[8] = STR_COD_MAQ_CAUSA;
            m_InputParamValues[9] = STR_DESC_AVERIA;
            m_InputParamValues[10] = STR_EQUIPMENT_PATH;
            m_InputParamValues[11] = STR_USERCOMMENT;
            m_InputParamValues[12] = STR_USERNAME;
            G2Base.CallResult result = AsynchCall();
            return result;
        }
        
        /// <summary>
        /// Start an asynchronous call (non blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="FLT_END_TIME">Input FLOAT</param>
        /// <param name="FLT_START_TIME">Input FLOAT</param>
        /// <param name="LNG_LEVEL1_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL2_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL3_ID">Input QUANTITY</param>
        /// <param name="LNG_LEVEL4_ID">Input QUANTITY</param>
        /// <param name="LNG_TIME_CATEGORY_ID">Input QUANTITY</param>
        /// <param name="STR_COD_EQ_CONSTRUCTIVO">Input TEXT</param>
        /// <param name="STR_COD_MAQ_CAUSA">Input TEXT</param>
        /// <param name="STR_DESC_AVERIA">Input TEXT</param>
        /// <param name="STR_EQUIPMENT_PATH">Input TEXT</param>
        /// <param name="STR_USERCOMMENT">Input TEXT</param>
        /// <param name="STR_USERNAME">Input TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(G2Base.PMMultiConnector pmmc, double FLT_END_TIME, double FLT_START_TIME, double LNG_LEVEL1_ID, double LNG_LEVEL2_ID, double LNG_LEVEL3_ID, double LNG_LEVEL4_ID, double LNG_TIME_CATEGORY_ID, string STR_COD_EQ_CONSTRUCTIVO, string STR_COD_MAQ_CAUSA, string STR_DESC_AVERIA, string STR_EQUIPMENT_PATH, string STR_USERCOMMENT, string STR_USERNAME)
        {
            m_InputParamValues[0] = FLT_END_TIME;
            m_InputParamValues[1] = FLT_START_TIME;
            m_InputParamValues[2] = LNG_LEVEL1_ID;
            m_InputParamValues[3] = LNG_LEVEL2_ID;
            m_InputParamValues[4] = LNG_LEVEL3_ID;
            m_InputParamValues[5] = LNG_LEVEL4_ID;
            m_InputParamValues[6] = LNG_TIME_CATEGORY_ID;
            m_InputParamValues[7] = STR_COD_EQ_CONSTRUCTIVO;
            m_InputParamValues[8] = STR_COD_MAQ_CAUSA;
            m_InputParamValues[9] = STR_DESC_AVERIA;
            m_InputParamValues[10] = STR_EQUIPMENT_PATH;
            m_InputParamValues[11] = STR_USERCOMMENT;
            m_InputParamValues[12] = STR_USERNAME;
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
            m_InputParamNames[0] = "FLT_END_TIME";
            m_InputParamNames[1] = "FLT_START_TIME";
            m_InputParamNames[2] = "LNG_LEVEL1_ID";
            m_InputParamNames[3] = "LNG_LEVEL2_ID";
            m_InputParamNames[4] = "LNG_LEVEL3_ID";
            m_InputParamNames[5] = "LNG_LEVEL4_ID";
            m_InputParamNames[6] = "LNG_TIME_CATEGORY_ID";
            m_InputParamNames[7] = "STR_COD_EQ_CONSTRUCTIVO";
            m_InputParamNames[8] = "STR_COD_MAQ_CAUSA";
            m_InputParamNames[9] = "STR_DESC_AVERIA";
            m_InputParamNames[10] = "STR_EQUIPMENT_PATH";
            m_InputParamNames[11] = "STR_USERCOMMENT";
            m_InputParamNames[12] = "STR_USERNAME";
            Timeout = 300000;
        }
    }
}
