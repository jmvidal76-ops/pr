namespace ReglasMES
{
    using System;
    using G2Base;


    /// <summary>
    /// Perform calls to Instance Rule MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR
    /// </summary>
    public class CrearWOArranque : G2Base.PMCall
    {

        protected static string m_EquipmentPath = "WO-MANAGER";

        protected static string m_Path = "WO-MANAGER.Wo_Arranque.Root_Create";

        /// <summary>
        /// Create an object to invoke "MSM.WO-MANAGER.CREAR_WO_FROM_PPR.CREATE_WO_FROM_PPR" on the equipment "MSM.WO-MANAGER"
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        public CrearWOArranque(G2Base.PMConnector connector) :
            base(connector, "MSM.WO-MANAGER", "MSM.WO-MANAGER.Wo_Arranque.Root_Create", 4, 3)
        {
            InitParamNames();
        }

        /// <summary>
        /// Create an object to invoke the Rule on given equipment
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="equipment">Full path of the equipment</param>
        /// <param name="ruleName">Full path of the Rule</param>
        public CrearWOArranque(G2Base.PMConnector connector, string equipment, string ruleName) :
            base(connector, equipment, ruleName, 4, 3)
        {
            InitParamNames();
        }

        /// <summary>
        /// Create an object to invoke the Rule on a plant with given name
        /// </summary>
        /// <param name="connector">The PMConnector to perform calls to Production Modeler</param>
        /// <param name="plant">Name of the plant</param>
        public CrearWOArranque(G2Base.PMConnector connector, string plant) :
            base(connector, string.Format("{0}.{1}", plant, m_EquipmentPath), string.Format("{0}.{1}", plant, m_Path), 4, 3)
        {
            InitParamNames();
        }

        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="STR_WO_EQU_ID">Input TEXT</param>
        /// <param name="STR_JDE_MATERIAL_1">Input TEXT</param>
        /// <param name="STR_WO_PART_ID">Input TEXT</param>
        /// <param name="INT_ARRANQUE_ID">Input INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    string STR_WO_EQU_ID,
                    string STR_JDE_MATERIAL_1,
                    string STR_WO_PART_ID,
                    int INT_ARRANQUE_ID,
                    ref int ErrorCode,
                    ref string ErrorDesc,
                    ref string OrderID)
        {
            m_InputParamValues[0] = STR_WO_EQU_ID;
            m_InputParamValues[1] = STR_JDE_MATERIAL_1;
            m_InputParamValues[2] = STR_WO_PART_ID;
            m_InputParamValues[3] = INT_ARRANQUE_ID;
            G2Base.CallResult result = SynchCall();
            if (GetValues(result))
            {
                ErrorCode = ((int)(m_OutputParamValues[0]));
                ErrorDesc = ((string)(m_OutputParamValues[1]));
                OrderID = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }

        /// <summary>
        /// Asynchronous call (no blocking)
        /// </summary>
        /// <param name="STR_WO_EQU_ID">Input TEXT</param>
        /// <param name="STR_JDE_MATERIAL_1">Input TEXT</param>
        /// <param name="STR_WO_PART_ID">Input TEXT</param>
        /// <param name="INT_ARRANQUE_ID">Input INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Start(
                    string STR_WO_EQU_ID,
                    string STR_JDE_MATERIAL_1,
                    string STR_WO_PART_ID,
                    int INT_ARRANQUE_ID,
                    ref int ErrorCode,
                    ref string ErrorDesc,
                    ref string OrderID)
        {
            m_InputParamValues[0] = STR_WO_EQU_ID;
            m_InputParamValues[1] = STR_JDE_MATERIAL_1;
            m_InputParamValues[2] = STR_WO_PART_ID;
            m_InputParamValues[3] = INT_ARRANQUE_ID;
            G2Base.CallResult result = AsynchCall();
            if (GetValues(result))
            {
                ErrorCode = ((int)(m_OutputParamValues[0]));
                ErrorDesc = ((string)(m_OutputParamValues[1]));
                OrderID = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }
        /// <summary>
        /// Synchronous call (blocking)
        /// </summary>
        /// <param name="pmmc">The PMMultiConnector object to use for PM communication</param>
        /// <param name="STR_WO_EQU_ID">Input TEXT</param>
        /// <param name="STR_JDE_MATERIAL_1">Input TEXT</param>
        /// <param name="STR_WO_PART_ID">Input TEXT</param>
        /// <param name="INT_ARRANQUE_ID">Input INTEGER</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult Call(
                    G2Base.PMMultiConnector pmmc,
                    string STR_WO_EQU_ID,
                    string STR_JDE_MATERIAL_1,
                    string STR_WO_PART_ID,
                    int INT_ARRANQUE_ID,
                    ref int ErrorCode,
                    ref string ErrorDesc,
                    ref string OrderID)
        {
            m_InputParamValues[0] = STR_WO_EQU_ID;
            m_InputParamValues[1] = STR_JDE_MATERIAL_1;
            m_InputParamValues[2] = STR_WO_PART_ID;
            m_InputParamValues[3] = INT_ARRANQUE_ID;
            G2Base.CallResult result = SynchCall(pmmc);
            if (GetValues(result))
            {
                ErrorCode = ((int)(m_OutputParamValues[0]));
                ErrorDesc = ((string)(m_OutputParamValues[1]));
                OrderID = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }

        /// <summary>
        /// Get the results of a previously started asynchronous call (blocking)
        /// </summary>
        /// <param name="errDescription">Output TEXT</param>
        /// <returns>CallResult</returns>
        public G2Base.CallResult GetResult(ref int ErrorCode, ref string ErrorDesc, ref string OrderID)
        {
            G2Base.CallResult result = AsynchGetResult();
            if (GetValues(result))
            {
                ErrorCode = ((int)(m_OutputParamValues[0]));
                ErrorDesc = ((string)(m_OutputParamValues[1]));
                OrderID = ((string)(m_OutputParamValues[2]));
            }
            return result;
        }

        /// <summary>
        /// Initialize input parameters names
        /// </summary>
        protected void InitParamNames()
        {
            m_InputParamNames[0] = "STR_WO_EQU_ID";
            m_InputParamNames[1] = "STR_JDE_MATERIAL_1";
            m_InputParamNames[2] = "STR_WO_PART_ID";
            m_InputParamNames[3] = "INT_ARRANQUE_ID";
            Timeout = 300000;
        }
    }
}
