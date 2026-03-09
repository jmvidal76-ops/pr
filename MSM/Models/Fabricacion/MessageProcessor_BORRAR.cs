using Siemens.Brewing.Data;
using Siemens.Brewing.Data.Bread;
using Siemens.Brewing.Data.Manager;
using Siemens.Brewing.Data.Manager.TankStatus;
using Siemens.Brewing.Domain.Entities;
using Siemens.Brewing.Domain.Message;
using Siemens.Brewing.Domain.Message.FromSfToMes;
using Siemens.Brewing.Domain.SitEnum;
using Siemens.Brewing.Logging;
using Siemens.Brewing.OEE.Entities;
using Siemens.Brewing.OEE.Manager;
using Siemens.Brewing.OEE.Task;
using Siemens.Brewing.PPA;
using Siemens.Brewing.Services;
using Siemens.Brewing.Shared;
using Siemens.SimaticIT.LogbookCustomsitsfmonitor.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class MessageProcessor_BORRAR
    {
        //context informations
        private string ctxBatchId;
        private string ctxMaterialId;
        private string ctxEquipmentId;
        private string ctxOrderId;
        private string ctxExecEquipmentId;
        private string ctxOrderType;

        public Entry ctxBatch;
        public ProcedureInfo_BORRAR ctxProcedure;
        public SitOrder ctxOrder;

        public Entry dstBatch;
        public SitOrder dstOrder;

        public bool isTest = false;


        private Params CTXParams
        {
            get
            {
                return new Params(){
                {"ctxXmlMsgId", Message.MessageID},
                {"ctxBatchId",Message.BatchName},
                {"ctxMaterialId",ctxMaterialId},
                {"ctxEquipmentId",ctxEquipmentId}, 
                {"ctxOrderId",ctxOrderId},
                {"ctxExecEquipmentId",ctxExecEquipmentId}};
            }
        }

        int res = 0;
        Params parameters = new Params();

        //the message to validate
        EBRBaseMessage Message { get; set; }

        public MessageProcessor_BORRAR(EBRBaseMessage message, bool test)
        {
            ctxBatchId = ctxEquipmentId = ctxExecEquipmentId = ctxMaterialId = ctxOrderId = "n/a";
            Message = message;
            isTest = test;
            SetCtxParameter();

        }


        private void SetCtxParameter()
        {

            // startBatchEquipment
            switch (Message.MessageType)
            {
                case SitMessageType.StartBatch:
                case SitMessageType.BatchComplete:
                    //ctxEquipmentId = SitConfiguration.SFMapping.GetSITEquip(Message.ProcessCell);
                    ctxEquipmentId = SitEquipment_BREAD.GetMappedSITEquip(Message.ProcessCell);
                    ctxMaterialId = SitConfiguration.SFMapping.GetSITMaterial(Message.FormulaId);
                    ctxBatch = GetBatchInfoById(Message.BatchName);
                    ctxBatchId = Message.BatchName;
                    break;
                case SitMessageType.StartProcedure:
                case SitMessageType.CloseProcedure:
                    //ctxEquipmentId = SitConfiguration.SFMapping.GetSITEquip(Message.ProcedureEquipment);
                    ctxEquipmentId = SitEquipment_BREAD.GetMappedSITEquip(Message.ProcedureEquipment);
                    ctxBatch = GetBatchInfoById(Message.BatchName);
                    ctxBatchId = Message.BatchName;
                    break;
                case SitMessageType.KOPMessage:
                    ctxBatch = GetBatchInfoById(Message.BatchName);
                    ctxBatchId = Message.BatchName;
                    if (ctxBatch != null)
                    {
                        ctxEquipmentId = ctxBatch.ExecutionEquipmentID;

                    }
                    break;
                //case SitMessageType.TimeBased:
                //    //ctxEquipmentId = SitConfiguration.SFMapping.GetSITEquip(((TimeBased)Message).EquipmentID);
                //    ctxEquipmentId = SitEquipment_BREAD.GetMappedSITEquip(((TimeBased)Message).EquipmentID);
                //    break;
                case SitMessageType.ProductionDeclaration:
                case SitMessageType.MaterialConsumption:
                    ctxBatch = GetBatchInfoById(Message.BatchName);
                    ctxBatchId = Message.BatchName;
                    if (ctxBatch != null)
                        ctxOrder = SitOrder_BREAD.SelectByBatchID(ctxBatch.BatchID);
                    dstBatch = GetBatchInfoById(((Siemens.Brewing.Domain.Message.FromSfToMes.MaterialMovement)Message).BatchNameDestination);
                    if (dstBatch != null)
                        dstOrder = SitOrder_BREAD.SelectByBatchID(dstBatch.BatchID);
                    break;
                case SitMessageType.Unknown:
                    break;
                default:
                    break;
            }

        }


        public int PreCheck(out string errorDesc)
        {
            errorDesc = string.Empty;
            bool messageIsValid = Message.IsValid(out res, out parameters);
            bool checkPassed = true;

            if (messageIsValid)
            {

                List<Func<bool>> checkToDo = new List<Func<bool>>();

                switch (Message.MessageType)
                {
                    case SitMessageType.StartBatch:
                        checkToDo.Add(PreCheckAllFieldAreMapped);
                        //checkToDo.Add(TheEquipmentIsMapped);
                        checkToDo.Add(TheBatchIsNotYetUsed);
                        checkToDo.Add(ThereAreNoOtherOrderRunningOnTheExecutionEquipment);
                        checkToDo.Add(PPRIsHealthChecked);
                        if (!isTest)
                            checkToDo.Add(SendTankStatusOnStartBatch);
                        break;
                    case SitMessageType.BatchComplete:
                        checkToDo.Add(TheBatchIsRunningOnCompleteBatch);
                        break;
                    case SitMessageType.StartProcedure:
                        checkToDo.Add(PreCheckTheBatchIsRunning);
                        checkToDo.Add(PreCheckProcedureIsNotYetUsed);
                        checkToDo.Add(TheProcedureBelongToTheRunningBatch);
                        checkToDo.Add(ProcedureEquipEqualBatchEquip);
                        checkToDo.Add(ThereIsNoStepAlreadyStarted);
                        break;
                    case SitMessageType.CloseProcedure:
                        checkToDo.Add(PreCheckTheBatchIsRunning);
                        checkToDo.Add(CheckProcedureExists);
                        checkToDo.Add(CheckProcedureIsRunning);
                        break;
                    case SitMessageType.KOPMessage:
                        checkToDo.Add(PreCheckTheBatchIsRunning);
                        checkToDo.Add(CheckProcedureExists);
                        checkToDo.Add(CheckProcedureIsRunning);
                        checkToDo.Add(KOPDefinitionExistsAndIsValid);
                        break;
                    case SitMessageType.MaterialConsumption:
                        //checkToDo.Add(PreCheckTheBatchIsRunning);
                        //checkToDo.Add(TheOrderIsRunning);
                        break;
                    case SitMessageType.ProductionDeclaration:
                        //checkToDo.Add(PreCheckTheBatchIsRunning);
                        //checkToDo.Add(MaterialIdIsValid);
                        //checkToDo.Add(TheOrderIsNotDummy);
                        //checkToDo.Add(TheOrderIsRunning);
                        if (IsGoodReceipt())
                        {
                            checkToDo.Add(PreCheckTheBatchIsRunning);
                            checkToDo.Add(TheOrderIsNotDummy);
                            checkToDo.Add(TheOrderIsRunning);
                            checkToDo.Add(MaterialIdIsValid);
                        }
                        break;
                    case SitMessageType.OEECTRUtilityMessage:
                        checkToDo.Add(PreCheckAllFieldAreMapped);
                        break;
                    default:
                        break;
                }
                foreach (var check in checkToDo)
                {
                    checkPassed = check();
                    if (!checkPassed)
                    {
                        break;
                    }
                }
            }
            if (!messageIsValid || !checkPassed)
                ////errorDesc = Logger.BuildMessage(res, parameters, CTXParams);
                //Gestion de errores
                return 0;
            return res;
        }

        public int PostCheck(out string errorDesc)
        {

            errorDesc = string.Empty;
            bool checkPassed = true;

            List<Func<bool>> checkToDo = new List<Func<bool>>();

            switch (Message.MessageType)
            {
                case SitMessageType.StartBatch:
                    checkToDo.Add(TheBatchExists);
                    checkToDo.Add(PostCheckTheBatchIsRunning);
                    checkToDo.Add(CleanLotInsideEquipment);
                    checkToDo.Add(BatchStartTimeIsCorrect);
                    checkToDo.Add(UpdateDueDate);
                    checkToDo.Add(SendTankStatusAfterStartBatch);
                    checkToDo.Add(SendMessageToShopFloor);
                    checkToDo.Add(PostProcessingForDummyOrder);
                    break;
                case SitMessageType.BatchComplete:
                    checkToDo.Add(TheBatchIsRunningOnCompleteBatch);
                    checkToDo.Add(BatchEndTimeIsCorrect);
                    break;
                case SitMessageType.StartProcedure:
                    checkToDo.Add(CheckProcedureExists);
                    checkToDo.Add(CheckProcedureIsRunning);
                    checkToDo.Add(ProcedureStartTimeIsCorrect);
                    checkToDo.Add(CallOEEStartPackEntry);
                    break;
                case SitMessageType.CloseProcedure:
                    checkToDo.Add(CheckProcedureExists);
                    checkToDo.Add(ProcedureIsCompleted);
                    checkToDo.Add(ProcedureEndTimeIsCorrect);
                    checkToDo.Add(SetAltKops);
                    checkToDo.Add(CallOEEEndPackEntry);
                    break;
                case SitMessageType.KOPMessage:
                    checkToDo.Add(CheckProcedureExists);
                    checkToDo.Add(CheckKopValue);
                    break;
                default:
                    break;
            }
            foreach (var check in checkToDo)
            {
                checkPassed = check();
                if (!checkPassed)
                {
                    ////errorDesc = Logger.BuildMessage(res, parameters, CTXParams);
                    //Gestion de errores
                    break;
                }
            }
            return res;
        }


        #region PreCheck functions


        private bool PreCheckAllFieldAreMapped()
        {
            bool result = true;
            List<string> notMappedList = new List<string>();
            switch (Message.MessageType)
            {
                case SitMessageType.StartBatch:
                    ((StartBatch)Message).MappedProcessCell = FillNotMappedList(SFMessageEntityMapping.Equipment, ((StartBatch)Message).ProcessCell, "STR_ProcessCell", ref notMappedList);
                    ((StartBatch)Message).MappedMaterial = FillNotMappedList(SFMessageEntityMapping.Material, ((StartBatch)Message).FormulaId, "STR_FormulaId", ref notMappedList);
                    break;
                case SitMessageType.OEECTRUtilityMessage:
                    ((OEECTRUtilityMessage)Message).MappedEquipmentID =
                        FillNotMappedList(SFMessageEntityMapping.Equipment,
                                         ((OEECTRUtilityMessage)Message).EquipmentID,
                                          "STR_EQUIPMENT_ID", ref notMappedList);
                    break;


            }
            if (notMappedList.Count > 0)
            {
                result = false;
                res = -350;
                parameters.Add("fieldNames", string.Join(",", notMappedList.ToArray()));
            }
            return result;

        }




        private bool ThereAreNoOtherOrderRunningOnTheExecutionEquipment()
        {
            bool result = true;
            string anotherOrderId = string.Empty;
            if (!string.IsNullOrEmpty(ctxEquipmentId))
            {
                Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
                String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\">"
                    + "<property>ID</property>"
                    + "<property>ExecutionEquipmentID</property>"
                    + "<property>ParentEntryID</property>"
                    + "<property>StatusID</property>"
                    + "<entity name=\"POMTypes.Order\" link=\"OrderPK\">"
                    + "<property>ID</property>"
                    + "<property>TypeID</property>"
                    + "</entity>"
                    + "</virtualEntity>";
                String condition = "{StatusID} = 'Running' and {ParentEntryID} is null and {ExecutionEquipmentID} ='" + ctxEquipmentId + "' and {OrderTypeID} in ('FE', 'MT', 'FL')";
                DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition);
                if (dataSet != null && dataSet.Tables != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows != null && dataSet.Tables[0].Rows.Count > 0)
                {

                    anotherOrderId = dataSet.Tables[0].Rows[0]["OrderID"].ToString();
                    result = false;

                }

            }
            if (!result)
            {
                res = -316;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - Order (%orderId%) is already running on %equipId%
                parameters = new Params() { { "orderId", anotherOrderId }, { "equipId", ctxEquipmentId } };
            }

            return result;
        }

        private bool TheBatchIsNotYetUsed()
        {
            bool result = ctxBatch == null;
            if (!result)
            {
                res = -300;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - BatchId is already used by order '%ctxOrderId%'
            }
            return result;
        }

        private bool TheEquipmentIsMapped()
        {
            bool result = !string.IsNullOrEmpty(ctxEquipmentId);
            if (!result)
            {
                res = -319;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - STR_ProcessCell  %equipId% is not mapped in content_mapping_table.xml
                parameters = new Params() { { "equipId", Message.ProcessCell } };
            }
            return result;
        }

        private bool PPRIsHealthChecked()
        {
            string pprName = "";
            bool isHealthCecked = SitBread.PPRIsHealthChecked(ctxEquipmentId, ctxMaterialId, out pprName);

            bool succeed = string.IsNullOrEmpty(pprName) || isHealthCecked;
            if (!succeed)
            {
                res = -338;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' -  PPR (%pprName%) is not valid
                parameters = new Params() { { "pprName", pprName } };
            }
            return succeed;
        }

        private bool TheBatchIsRunningOnCompleteBatch()
        {
            ctxBatch = GetBatchInfoById(Message.BatchName);
            if (ctxBatch == null)
            {
                res = -329;
                //COMPLETE BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - BatchId  does not exist
                return false;
            }
            else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID))
            {
                string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);
                res = -329;
                parameters = new Params() { { "entryStatusId", statusId } };
                return false;
            }
            return true;
        }

        private bool PreCheckTheBatchIsRunning()
        {
            if (ctxBatch == null)
            {
                res = -304;
                //BatchId '%batchId%' does not exist
                parameters = new Params() { { "batchId", Message.BatchName } };
                return false;
            }
            else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID))
            {
                string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);

                res = -305;
                //BatchId '%batchId%' is associated to the entry '%entryId%' but the status is '%entryStatusId%'
                parameters = new Params() { { "batchId", ctxBatch.BatchID }, { "entryId", ctxBatch.ID }, { "entryStatusId", ctxBatch.StatusID } };
                return false;
            }
            return true;
        }

        private bool PreCheckProcedureIsNotYetUsed()
        {
            ctxProcedure = GetProcedureInfoById();
            if (ctxProcedure != null)
            {
                res = -301;
                //Procedure %procedureName%(%procedureId%) is already used by Entry '%entryId%'
                parameters = new Params() { { "procedureName", ctxProcedure.ProcedureName }, { "procedureId", ctxProcedure.ProcedureId }, { "entryId", ctxProcedure.ProcedureEntryId } };
                return false;
            }
            return true;
        }

        //check if in the batch there's a procedure with name equal to that in the message
        private bool TheProcedureBelongToTheRunningBatch()
        {
            bool result = false;

            Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
            String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\">"
                + "<property>ID</property>"
                + "<property>BatchID</property>"
                + "<entity name=\"POMTypes.Entry\" backLink=\"ParentEntryPK\">"
                + "<property>ProductSegmentID</property>"
                + "</entity>"
                + "</virtualEntity>";
            String condition = "{BatchID} = '" + Message.BatchName + "' and {EntryProductSegmentID} = '" + Message.ProcedureName + "'";
            DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition);
            if (dataSet != null && dataSet.Tables != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows != null && dataSet.Tables[0].Rows.Count > 0)
                result = true;
            if (!result)
            {
                res = -336;
                //Procedure %procedureName% does not belong to the running batch
                parameters = new Params() { { "procedureName", Message.ProcedureName } };
            }

            return result;
        }

        private bool ProcedureEquipEqualBatchEquip()
        {
            bool result = true;
            //string sitProcedureEquipment = SitConfiguration.SFMapping.GetSITEquip(Message.ProcedureEquipment);
            if (string.IsNullOrEmpty(ctxEquipmentId))
                result = false;
            else
            {

                ctxOrderType = GetOrderType(ctxBatch.OrderID);

                if (new string[] { "FE", "MT", "FL" }.Contains(ctxOrderType) && !ctxEquipmentId.Equals(ctxBatch.ExecutionEquipmentID))
                {

                    result = false;
                }
            }
            if (!result)
            {
                res = -321;

                //Procedure equipment %procedureEquipment% is different from Batch Equipment %batchEquipment%
                parameters = new Params() { { "procedureEquipment", Message.ProcedureEquipment }, { "batchEquipment", ctxBatch.ExecutionEquipmentID } };
            }
            return result;
        }

        private bool ThereIsNoStepAlreadyStarted()
        {
            bool result = true;
            if (SitString.AreEquals(ctxOrderType, "P"))
            {

                string multiOutputLine = SitConfiguration.MultiOutputLines;
                string line = SitEquipment_BREAD.SelectByID(ctxEquipmentId).SuperiorCell;
                if (!multiOutputLine.Contains(line))
                {
                    String condition = "{TypeID} = '" + Message.ProcedureName + "' and {StatusID} = 'Running' and {ExecutionEquipmentID} = '"
                        + ctxEquipmentId + "'";
                    DataSet ds = GetProcedureInfo(condition);
                    if (!(ds.IsEmpty()))
                    {
                        result = false;
                        res = -352;
                        //There's already a procedure %procedureName% in status running on the equipment %execEquipment%
                        parameters = new Params() { { "procedureName", Message.ProcedureName }, { "execEquipment", ctxEquipmentId } };
                    }
                }
            }
            return result;
        }

        private bool CheckProcedureExists()
        {
            ctxProcedure = GetProcedureInfoById();
            if (ctxProcedure == null)
            {
                res = -309;
                //Procedure %procedureName%(%procedureId%)  does not exsist
                parameters = new Params() { { "procedureName", Message.ProcedureName }, { "procedureId", Message.ProcedureID } };
                return false;
            }
            return true;
        }

        private bool CheckProcedureIsRunning()
        {
            if (!new string[] { "Processed", "Running" }.Contains(ctxProcedure.ProcedureStatus))
            {
                res = -306;
                //Procedure %procedureName%(%procedureId%) - Entry(%entryId%)  is not Running but  is '%entryStatusId%'
                parameters = new Params() { { "procedureName", ctxProcedure.ProcedureName }, 
                                            { "procedureId", ctxProcedure.ProcedureId }, 
                                            { "entryId", ctxProcedure.ProcedureEntryId }, 
                                            { "entryStatusId", ctxProcedure.ProcedureStatus } };


                return false;

            }
            return true;
        }

        private bool KOPDefinitionExistsAndIsValid()
        {
            int kopPk = -1;
            ProcessSegmentParameter param = GetKopInfo(ctxProcedure.ProcedureEntryId, Message.ParameterName, out kopPk);
            if (param == null)
            {
                res = -302;
                //KOP definition (%kopName%) does not exsist in entry '%entryId%'
                parameters = new Params() { { "kopName", Message.ParameterName }, { "entryId", ctxProcedure.ProcedureEntryId } };

                return false;
            }
            else if (!param.UoMID.Equals(Message.ParameterUom, StringComparison.InvariantCultureIgnoreCase))
            {
                if (!UoMMapper_BORRAR.IsSpecialCase(Message.ParameterUom, param.UoMID))
                {
                    res = -303;
                    //KOP (%kopName%) is definited with  uom:'%pomUOM%' and not with uom:'%xmlUOM%'
                    parameters = new Params() { { "kopName", Message.ParameterName }, { "pomUOM", param.UoMID }, { "xmlUOM", Message.ParameterUom } };
                    return false;
                }
            }

            return true;
        }

        private bool MaterialIdIsValid()
        {
            bool result = true;

            if (ctxOrder != null)
            {
                string SAPOrderMaterial = ctxOrder.FinalMaterialID;
                result = SitString.Equals(SAPOrderMaterial, ((ProductionDeclaration)Message).MaterialId);
                if (!result)
                {
                    res = -339;
                    //The Final material mismatch: SAP Order Material %SAPOrderMaterial%, Shop-floor Material %ctxMaterialId%
                    parameters = new Params() { { "SAPOrderMaterial", SAPOrderMaterial }, { "ctxMaterialId", ctxMaterialId } };
                }
            }
            return result;
        }

        private bool TheOrderIsNotDummy()
        {
            bool result = !ctxOrder.IsDummy;
            if (!result)
            {
                res = -340;
                //The source order is a DUMMY order. The operator must synchronize DUMMY order with SAP Order before to proceeds with production declaration
            }
            return result;
        }

        public bool IsGoodReceipt()
        {
            return ctxOrder != null && ctxOrder.IsPackaging;
        }

        private bool TheOrderIsRunning()
        {
            bool result = false;
            if (ctxOrder != null)
                result = ctxOrder.IsRunning;
            if (!result)
            {
                //There's no order linked to the batch in status running
                res = -341;
            }
            return result;
        }

        private bool TheDestinationOrderIsRunning()
        {
            bool result = false;
            if (dstOrder != null)
                result = dstOrder.IsRunning;
            if (!result)
            {
                //There's no order linked to the destination batch in status running
                res = -342;
            }
            return result;
        }

        private bool TheDestinationBatchExistsAndIsRunning()
        {

            if (dstBatch == null)
            {
                res = -343;
                //MATERIAL MOVEMENT - The destination batch %batchId% doesn't exist
                parameters = new Params() { { "batchId", dstBatch.ID } };
                return false;
            }
            else if (!new string[] { "Running", "Processed" }.Contains(dstBatch.StatusID))
            {
                string statusId = SitStatusDescription_BREAD.GetEntryDescription(dstBatch.StatusID);
                //MATERIAL MOVEMENT - The destination batch '%batchId%' is associated to the entry '%entryId%' but the status is '%entryStatusId%'
                res = -344;
                parameters = new Params() { { "batchId", dstBatch.BatchID }, { "entryId", dstBatch.ID }, { "entryStatusId", statusId } };
                return false;
            }
            return true;
        }

        #endregion


        #region PostCheck functions
        private bool TheBatchExists()
        {
            ctxBatch = GetBatchInfoById(Message.BatchName);
            bool result = ctxBatch != null;
            if (!result)
            {
                res = -304;
                //BatchId '%batchId%' does not exist
                parameters = new Params() { { "batchId", Message.BatchName } };
            }
            return result;
        }

        private bool CleanLotInsideEquipment()
        {
            try
            {
                SitOrder orderRun = SitOrder_BREAD.SelectByBatchID(ctxBatch.BatchID);
                TFMManager.CleanTank(orderRun.ExecutionEquipmentID);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private bool PostCheckTheBatchIsRunning()
        {
            if (ctxBatch == null)
            {
                res = -327;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - BatchId  does not exsist
                return false;
            }
            else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID))
            {
                string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);
                res = -328;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' -  BatchId '%batchId%' is associated to the order '%orderId%' but the status is '%entryStatusId%'
                parameters = new Params() { { "batchId", ctxBatch.BatchID }, { "orderId", ctxBatch.OrderID }, { "entryStatusId", statusId } };
                return false;
            }
            return true;
        }

        private bool UpdateDueDate()
        {
            SitOrder myOrder = SitOrder_BREAD.SelectByBatchID(ctxBatchId);
            //se è un dummy order non updato...
            if (myOrder.IsDummy || myOrder.IsFilterRun || myOrder.IsPackaging) return true;
            SitBread.UpdateDueDate(myOrder.MainEntryID, myOrder.ID);
            return true;
        }

        private bool ProcedureIsCompleted()
        {
            if (!ctxProcedure.ProcedureStatus.Equals("Processed"))
            {
                res = -313;
                //Procedure %procedureName%(%procedureId%) - Entry(%entryId%)  is not Completed but  is '%entryStatusId%'
                parameters = new Params() { { "procedureName", ctxProcedure.ProcedureName }, 
                                            { "procedureId", ctxProcedure.ProcedureId }, 
                                            { "entryId", ctxProcedure.ProcedureEntryId }, 
                                            { "entryStatusId", ctxProcedure.ProcedureStatus } };

                return false;

            }
            return true;

        }

        private bool BatchStartTimeIsCorrect()
        {
            string startTime = ((StartBatch)Message).BatchStartTime;
            bool result = IsDateTimeEqual(ctxBatch.ActualStartTime, startTime, false);
            if (!result)
            {
                res = -331;

                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' -  ActualStartTime (%pomActualStartTime%) of Entry(%entryId%) is different from the xml DataTime (%xmlActualStartTime%)
                parameters = new Params() { { "pomActualStartTime", ctxBatch.ActualStartTime.ToString() }, 
                                            { "xmlActualStartTime", startTime }, 
                                            { "entryId", ctxBatch.ID } };
            }
            return result;
        }

        private bool SendMessageToShopFloor()
        {
            SitOrder order = SitOrder_BREAD.SelectByID(ctxBatch.OrderID);
            //if (string.IsNullOrEmpty(order.ERPID) || order.IsFilterRun)
            if (string.IsNullOrEmpty(order.ERPID))
                return true;
            ParamsReturnValue ret = SitOrder_BREAD.SendMessageToSf(order);
            if (!ret.succeeded)
            {
                res = -351;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - Error while sending message to EBR
                return false;
            }
            return true;
        }

        private bool PostProcessingForDummyOrder()
        {
            SitOrder po = SitOrder_BREAD.SelectByID(ctxBatch.OrderID);
            //if (string.IsNullOrEmpty(order.ERPID) || order.IsFilterRun)
            if (!string.IsNullOrEmpty(po.ERPID)) return true;
            string finalMaterial = ctxMaterialId;
            if (finalMaterial.StartsWith("[") && finalMaterial.EndsWith("]"))
            {
                //check if material exist
                finalMaterial = finalMaterial.Replace("[", "").Replace("]", "");
                Siemens.SimaticIT.MM.Breads.Definition_BREAD definitionBread = new Siemens.SimaticIT.MM.Breads.Definition_BREAD();

                String condition = string.Format("{{ID}} = '{0}'", finalMaterial);

                Siemens.SimaticIT.MM.Breads.Types.Definition matDef = definitionBread.Select("", 0, 0, condition).SingleOrDefault();
                if (matDef == null)
                {
                    res = -359;
                    //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - Error while sending message to EBR
                    return false;
                }

            }
            double qty = double.Parse(((StartBatch)Message).BatchQuantity, CultureInfo.InvariantCulture.NumberFormat);
            ReturnValue ret = SitOrder_BREAD.PostProcessing(po.ID, "", null,
        "", finalMaterial, qty, null, null);

            if (!ret.succeeded)
            {
                res = -358;
                //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - Error while sending message to EBR
                return false;
            }
            return true;
        }


        private bool BatchEndTimeIsCorrect()
        {
            string endTime = ((BatchComplete)Message).BatchEndTime;
            bool result = IsDateTimeEqual(ctxBatch.ActualEndTime, endTime, false);
            if (!result)
            {
                res = -332;

                //COMPLETE BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' -  ActualEndTime (%pomActualEndTime%) of Entry(%entryId%) is different from the xml DataTime (%xmlActualEndTime%)
                parameters = new Params() { { "pomActualEndTime", ctxBatch.ActualEndTime.ToString() }, 
                                            { "xmlActualEndTime", endTime }, 
                                            { "entryId", ctxBatch.ID } };



            }
            return result;
        }

        private bool ProcedureStartTimeIsCorrect()
        {
            string startTime = ((StartProcedure)Message).ProcedureStartTime;
            bool result = IsDateTimeEqual(ctxProcedure.ProcedureStartTime, startTime, false);
            if (!result)
            {
                res = -307;

                //ActualStartTime (%pomActualStartTime%) of Entry(%entryId%) is different from the xml DataTime (%xmlActualStartTime%)
                parameters = new Params() { { "pomActualStartTime", ctxProcedure.ProcedureStartTime.ToString() }, 
                                            { "xmlActualStartTime", startTime }, 
                                            { "entryId", ctxProcedure.ProcedureEntryId } };
            }
            return result;
        }

        private bool CallOEEStartPackEntry()
        {
            bool result = true;
            SitOrder order = SitOrder_BREAD.SelectByMainEntryID(ctxProcedure.BatchEntryId);
            if (order.IsPackaging)
            {
                string execEquipment = ctxEquipmentId;

                StartPackagingEntry startPackStep = new StartPackagingEntry(execEquipment, order);
                ParamsReturnValue r = startPackStep.Execute();
                if (!r.succeeded)
                {
                    result = false;
                    res = -354;
                    //START PROCEDURE ERROR - %procedureName%(%procedureId%) - Entry(%entryId%) - Equipment(%procedureEquipment%). Failed OEE set context/speed
                    parameters = new Params() { { "procedureName", ctxProcedure.ProcedureName }, 
                                            { "procedureId", ctxProcedure.ProcedureId }, 
                                            { "entryId", ctxProcedure.BatchEntryId }, 
                                            { "procedureEquipment", execEquipment } };
                }
            }
            return result;

        }

        private bool CallOEEEndPackEntry()
        {
            bool result = true;
            SitOrder order = SitOrder_BREAD.SelectByMainEntryID(ctxProcedure.BatchEntryId);
            if (order.IsPackaging)
            {
                string execEquipment = ctxEquipmentId;

                EndPackagingEntry endPackStep = new EndPackagingEntry(execEquipment, ctxProcedure.BatchEntryId);
                ParamsReturnValue r = endPackStep.Execute();
                if (!r.succeeded)
                {
                    result = false;
                    res = -355;
                    //END PROCEDURE ERROR - %procedureName%(%procedureId%) - Entry(%entryId%) - Equipment(%procedureEquipment%). Failed OEE set context/speed
                    parameters = new Params() { { "procedureName", ctxProcedure.ProcedureName }, 
                                            { "procedureId", ctxProcedure.ProcedureId }, 
                                            { "entryId", ctxProcedure.BatchEntryId }, 
                                            { "procedureEquipment", execEquipment } };
                }
            }
            return result;

        }

        private bool ProcedureEndTimeIsCorrect()
        {
            string endTime = ((CloseProcedure)Message).ProcedureEndTime;
            bool result = IsDateTimeEqual(ctxProcedure.ProcedureEndTime, endTime, false);
            if (!result)
            {
                res = -308;

                //ActualEndTime (%pomActualEndTime%) of Entry(%entryId%) is different from the xml DataTime (%xmlActualEndTime%)
                parameters = new Params() { { "pomActualEndTime", ctxProcedure.ProcedureEndTime.ToString() }, 
                                            { "xmlActualEndTime", endTime }, 
                                            { "entryId", ctxProcedure.ProcedureEntryId } };
            }
            return result;
        }

        // If the process step is configured for this behavior, set to zero the value of all ALT kops whithout a value (and therefore send the message to SAP)
        private bool SetAltKops()
        {
            Entry entry = SitBread.GetEntry(ctxProcedure.ProcedureEntryId);

            if (!SitString.IsInList(entry.TypeID, SitConfiguration.StepsToSetAltZero))
                return true;

            SitOrder order = SitOrder_BREAD.SelectByID(ctxOrderId);
            Dictionary<string, SitProcessParameter> allEntryParameters = SitProcessParameter_BREAD.GetAllSitProcessParameters(order, entry);
            bool result = true;
            ParamsReturnValue ret = new ParamsReturnValue(true);
            string kopsFailed = string.Empty;
            foreach (SitProcessParameter sitProcessParameter in allEntryParameters.Values)
            {
                if (sitProcessParameter.IsALT && (SitString.AreEquals(sitProcessParameter.Type, "Numeric") || SitString.AreEquals(sitProcessParameter.Type, "float")) && !sitProcessParameter.HasValues)
                {
                    ret = SitProcessParameter_BREAD.SetLastValue(order, sitProcessParameter, 0, SitDateTime.Now);
                    if (!ret.succeeded)
                    {
                        result = false;
                        kopsFailed = string.Format("{0}{1}{2}", kopsFailed, string.IsNullOrEmpty(kopsFailed) ? "" : ",", sitProcessParameter.Name);
                    }
                }
            }
            if (!result)
            {
                res = -353;
                //Error while trying to set to zero the values of ALT kops without values. Order: '%OrderId%', Entry: '%EntryId%'§§OrderId=%OrderId%§EntryId=%EntryId%
                parameters = new Params() { { "OrderId", ctxOrderId }, 
                                            { "EntryId", ctxProcedure.ProcedureEntryId },
                                            { "KopsFailed", kopsFailed} };
            }
            return result;
        }

        private bool CheckKopValue()
        {
            string messageValue = ((KOPMessage)Message).ParameterValue;
            string messageTimestamp = ((KOPMessage)Message).ParameterValueTimestamp;
            EBRDataType messageDataType = ((KOPMessage)Message).ParameterType;
            ProcessSegmentParameterActualValue_BREAD processSegmentParameterActualBread = BreadFactory.Create<ProcessSegmentParameterActualValue_BREAD>();
            string messageValueTrim = (messageDataType == EBRDataType.Numeric) ?
                float.Parse(messageValue, CultureInfo.InvariantCulture.NumberFormat).ToString(CultureInfo.InvariantCulture)
                : messageValue.Replace("+00:00", "");

            // STR_ValueName="OPWPBLALPHAACID" STR_ValueDescription="Alpha-acid" STR_ValueDescriptionEng="" STR_UnitOfMeasure="%a-acid" STR_DataType="Numeric" STR_DataInterpretation="" STR_TimeStamp="2012-02-10T15:11:50" STR_ActualValue="" STR_SetPoint="" STR_HighValue="" STR_LowValue="" />


            string condition = "{EntryID} = '" + ctxProcedure.ProcedureEntryId + "' and {ParameterName} = '" + Message.ParameterName + "'";
            Collection<ProcessSegmentParameterActualValue> list = processSegmentParameterActualBread.Select("", 0, 0, condition);
            if (list != null && list.Count > 0)
            {
                //guardo se ce ne è uno con lo stesso actual value e con lo stesso time stamp
                foreach (var item in list)
                {
                    if (item.ActualValue.Equals(messageValueTrim) &&
                     IsDateTimeEqual(item.Timestamp, messageTimestamp, true))
                    {
                        return true;
                    }
                }
                res = -310;
                //No Actual value for KOP (%kopName%) with value:%kopValue% and dateTime:%kopDateTime%
                parameters = new Params() { { "kopName", Message.ParameterName }, 
                                            { "kopValue", messageValue }, 
                                            { "kopDateTime", messageTimestamp } };
            }
            else
            {
                res = -311;
                //No Actual value for KOP (%kopName%)

                parameters = new Params() { { "kopName", Message.ParameterName } };
            }

            return false;

        }

        #endregion

        #region utility functions


        protected string FillNotMappedList(SFMessageEntityMapping mappingType, string value, string xPath, ref List<string> notMappedList)
        {
            string mappedValue = string.Empty;
            switch (mappingType)
            {
                case SFMessageEntityMapping.Equipment:
                    mappedValue = SitEquipment_BREAD.GetMappedSITEquip(value);
                    break;
                case SFMessageEntityMapping.Material:
                    mappedValue = SitConfiguration.SFMapping.GetSITMaterial(value);
                    break;
                default:
                    break;
            }
            if (string.IsNullOrEmpty(mappedValue))
                notMappedList.Add(xPath);
            return mappedValue;
        }

        Entry GetBatchInfo(string whereCondtion)
        {
            Entry res = null;
            Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();

            //String condition = "{BatchID} ='' and  {StatusID} not in ('Aborted', 'Discarded')";
            Collection<Entry> list = entryBread.Select("", 0, 0, whereCondtion);
            if (list != null && list.Count > 0)
            {
                res = list[0];
                ctxOrderId = res.OrderID;
                ctxExecEquipmentId = res.ExecutionEquipmentID;
                if (!string.IsNullOrEmpty(res.OutputMaterialID))
                    ctxMaterialId = res.OutputMaterialID;
            }

            return res;
        }

        Entry GetBatchInfoById(string batchID)
        {

            String condition = "{BatchID} ='" + batchID + "' and  {StatusID} not in ('Aborted', 'Discarded')";

            return GetBatchInfo(condition);

        }


        private void SetProcedureIdandName(string entryId, string procedureId, string procedureName)
        {

            SitBread.SetEntryCF(entryId, "PROCEDURE_ID", procedureId);
            SitBread.SetEntryCF(entryId, "PROCEDURE_NAME", procedureName);

        }

        private DataSet GetProcedureInfo(string condition)
        {
            Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
            String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\" logicalEntity=\"\">"
            + "<property>ID</property>"
            + "<property>TypeID</property>"
            + "<property>StatusID</property>"
            + "<property>ActualEndTime</property>"
            + "<property>ActualStartTime</property>"
            + "<property>ExecutionEquipmentID</property>"
            + "<entity name=\"POMTypes.Entry\" link=\"ParentEntryPK\">"
            + "<property>ID</property>"
            + "<property>BatchID</property>"
            + "<property>StatusID</property>"
            + "<property>ActualStartTime</property>"
            + "<property>ActualEndTime</property>"
            + "</entity>"
            + "<pivotedEntity name=\"POMTypes.EntryProperty\" link=\"EntryPK\" pivotProperty=\"Name\">"
            + "<pivotValue>PROCEDURE_NAME</pivotValue>"
            + "<pivotValue>PROCEDURE_ID</pivotValue>"
            + "<entity name=\"POMTypes.EntryPropertyValue\" backLink=\"EntryPropertyPK\">"
            + "<property>Value</property>"
            + "</entity>"
            + "</pivotedEntity>"
            + "</virtualEntity>";
            DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition);
            return dataSet;

        }

        private ProcedureInfo_BORRAR GetProcedureInfoById()
        {
            ProcedureInfo_BORRAR info = null;

            String condition = "{EntryBatchID} = '" + Message.BatchName + "' and {PROCEDURE_NAMEEntryPropertyValueValue} = '" + Message.ProcedureName +
                "' and {PROCEDURE_IDEntryPropertyValueValue} = '" + Message.ProcedureID + "'";
            DataSet ds = GetProcedureInfo(condition);
            if (!(ds.IsEmpty()))
            {
                info = new ProcedureInfo_BORRAR(ds);

            }
            else
            {

                condition = "{EntryBatchID} = '" + Message.BatchName + "' and {TypeID} = '" + Message.ProcedureName + "' and {StatusID}='Running' and (" +
                    " {PROCEDURE_IDEntryPropertyValueValue} is null or {PROCEDURE_IDEntryPropertyValueValue} = '' )";

                ds = GetProcedureInfo(condition);
                if (!(ds.IsEmpty()))
                {
                    info = new ProcedureInfo_BORRAR(ds);
                    if (!isTest)
                        SetProcedureIdandName(info.ProcedureEntryId, Message.ProcedureID, Message.ProcedureName);

                    info.ProcedureId = Message.ProcedureID;
                    info.ProcedureName = Message.ProcedureName;

                }
            }
            //

            return info;
        }

        private string GetOrderType(string orderId)
        {
            Order_BREAD bread = BreadFactory.Create<Order_BREAD>();
            return bread.Select("", 0, 0, "{ID} = '" + orderId + "'")[0].TypeID;
        }

        private ProcessSegmentParameter GetKopInfo(string entryId, string paramName, out int kopPk)
        {
            kopPk = -1;
            ProcessSegmentParameter res = null;
            ProcessSegmentParameter_BREAD processSegmentParameterBread = BreadFactory.Create<ProcessSegmentParameter_BREAD>();


            string condition = "{EntryID} = '" + entryId + "' and {Name} = '" + paramName + "'";
            Collection<ProcessSegmentParameter> list = processSegmentParameterBread.Select("", 0, 0, condition);
            if (list != null && list.Count > 0)
            {
                res = list[0];
                kopPk = res.PK;
            }

            return res;

        }

        private bool IsDateTimeEqual(DateTime? dateTime, string stringDate, bool isKop)
        {
            bool res = false;

            if (dateTime.HasValue)
            {
                string sufix = (stringDate.EndsWith("+00:00")) ? "+00:00" : "";
                //DateTime dt = (isKop) ? dateTime.Value.ToUniversalTime() : dateTime.Value;
                DateTime dt = dateTime.Value;
                string x = dt.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss", DateTimeFormatInfo.InvariantInfo) + sufix;
                res = x.Equals(stringDate);
            }

            return res;

        }

        public int WriteKOP(out string errorDesc)
        {
            errorDesc = string.Empty;
            SitDateTime timestamp = SitDateTime.Parse(((KOPMessage)Message).ParameterValueTimestamp);
            string value = ((KOPMessage)Message).ParameterValue;
            SitProcessParameter sitProcessParameter = null;
            SitOrder sitOrder = null;

            ParamsReturnValue result = new ParamsReturnValue(false);
            if (!string.IsNullOrEmpty(ctxProcedure.ProcedureEntryId) && !string.IsNullOrEmpty(Message.ParameterName))
            {
                sitOrder = SitOrder_BREAD.SelectByBatchID(ctxBatchId);
                Entry entry = SitBread.GetEntry(ctxProcedure.ProcedureEntryId);
                sitProcessParameter = SitProcessParameter_BREAD.GetSitProcessParameter(sitOrder, entry, Message.ParameterName);
                if (sitProcessParameter != null)
                {
                    IConvertible val = ParseValue(value, sitProcessParameter);
                    result = SitProcessParameter_BREAD.SetNewValue(sitOrder, sitProcessParameter, val, timestamp);
                }
                else
                {
                    result.numcode = -5200;
                }

            }
            else
            {
                result.numcode = -5100;
            }

            if (result.succeeded)
            {
                //loggo il successo
                res = 0;
                //   I801	BatchId: '%batchId%' - Message:'%messageDesc%' - Info: success	
                //Logger.LogSuccess(801, new Params(){{"batchId", Message.BatchName },
                //                        {"messageDesc", Message.MessageName}}, CTXParams);

                try
                {
                    SitTankStatusKop statusKop = SitTankStatusMap.ParseStatusKop(Message.ParameterName);
                    SitTankStatusRequest req = SitTankStatusRequest.Create(SitTankStatusSource.AutoKOPWrite, SitOrder_BREAD.SelectByBatchID(ctxBatchId),
                       statusKop, value, timestamp);
                    new SitTankStatusManager().Manage(req);
                }
                catch (Exception exc)
                {
                    Exception realEx = Utility.GetRealException(exc);
                    res = -314;
                    //Error sending messages to INFOR on entry: %entryId% (%expMessage%)
                    //errorDesc = Logger.BuildMessage(-314, new Params() { { "entryId", ctxProcedure.ProcedureEntryId }, { "expMessage", realEx.Message } }, CTXParams);
                }

                // Check if send batch classification message
                if (!sitOrder.IsDummy && !sitOrder.IsFilterRun && ((sitProcessParameter.IsStepOEKOP && !SitOrder_BREAD.ThereIsProducedItems(sitOrder)) || sitProcessParameter.IsStepFilterRunIdKOP))
                {
                    BatchClassificationMsgMgmt bcm = new BatchClassificationMsgMgmt();
                    bcm.strOrderID = sitOrder.ID;
                    bcm.PlantName = SitConfiguration.PlantName;
                    G2Manager manager = new G2Manager();
                    ParamsReturnValue resPM = manager.ExecASync<BatchClassificationMsgMgmt>(ref bcm);
                }
            }
            else
            {
                res = (result.numcode.HasValue) ? result.numcode.Value : -101010;

                errorDesc = result.message;
                if (res == -5200)
                {
                    //KOP Value  is not uptated (internalError: %internalError%), check if is MANUAL
                    //errorDesc = Logger.BuildMessage(-337, new Params() { { "internalError", res.ToString() } }, CTXParams);
                    res = -337;
                }
            }
            return res;
        }

        //public int WriteKOP(out string errorDesc)
        //{
        //    errorDesc = string.Empty;
        //    SitDateTime timestamp = SitDateTime.Parse(((KOPMessage)Message).ParameterValueTimestamp);
        //    string value = ((KOPMessage)Message).ParameterValue;

        //    ParamsReturnValue result = SitPSPKOP.WritePSPActualValue(ctxProcedure.ProcedureEntryId, Message.ParameterName, value, timestamp);

        //    if (result.succeeded)
        //    {
        //        //se scrittura ha avuto successo -> check se è ALT e eventualmente mando messaggio
        //        string co = "{EntryID}='" + ctxProcedure.ProcedureEntryId + "' and {Name}='" + Message.ParameterName + "'";
        //        ProcessSegmentParameter p = BreadFactory.Create<ProcessSegmentParameter_BREAD>().Select("", 0, 0, co).FirstOrDefault();

        //        if (p != null && (p.Group.Contains("ALT")))
        //        {
        //            Order o = SitBread.GetOrder(p.OrderID);
        //            if (o != null && !string.IsNullOrEmpty(o.ERPID))// if is dummy, no alt message creation
        //            {
        //                //AltMessageCreationFromAutomation.buildXmlAltForEbrValueAndSendIt(p, value, timestamp);    //costruisco ALT message e mando messaggio
        //            }
        //        }

        //        //loggo il successo

        //        res = 0;
        //        //   I801	BatchId: '%batchId%' - Message:'%messageDesc%' - Info: success	

        //        Logger.LogSuccess(801, new Params(){{"batchId", Message.BatchName },
        //                                {"messageDesc", Message.MessageName}}, CTXParams);

        //        try
        //        {
        //            SitTankStatusKop statusKop = SitTankStatusMap.ParseStatusKop(Message.ParameterName);
        //            SitTankStatusRequest req = SitTankStatusRequest.Create(SitTankStatusSource.AutoKOPWrite, SitOrder_BREAD.SelectByBatchID(ctxBatchId),
        //               statusKop, value, timestamp);
        //            new SitTankStatusManager().Manage(req);
        //        }
        //        catch (Exception exc)
        //        {
        //            Exception realEx = Utility.GetRealException(exc);
        //            res = -314;
        //            //Error sending messages to INFOR on entry: %entryId% (%expMessage%)
        //            errorDesc = Logger.BuildMessage(-314, new Params() { { "entryId", ctxProcedure.ProcedureEntryId }, { "expMessage", realEx.Message } }, CTXParams);
        //        }

        //    }
        //    else
        //    {
        //        res = (result.numcode.HasValue) ? result.numcode.Value : -101010;

        //        errorDesc = result.message;
        //        if (res == -5200)
        //        {
        //            //KOP Value  is not uptated (internalError: %internalError%), check if is MANUAL
        //            errorDesc = Logger.BuildMessage(-337, new Params() { { "internalError", res.ToString() } }, CTXParams);
        //            res = -337;
        //        }

        //    }
        //    return res;
        //}

        public int WritePPAKOP(out string errorDesc)
        {
            errorDesc = string.Empty;
            TimeBased message = Message as TimeBased;
            SitDateTime timestamp = SitDateTime.Parse(message.ParameterValueTimestamp);
            string uom = message.ParameterUom;
            string parsedValue = message.ParameterValue;
            object value = string.Empty;


            if (SitConfiguration.KopTankStatusList.Contains(message.ParameterName))
            {

                try
                {
                    SitTankStatusKop statusKop = SitTankStatusMap.ParseStatusKop(Message.ParameterName);
                    SitEquipment tank = SitEquipment_BREAD.SelectByID(ctxEquipmentId);
                    //KOP %KOP_CODE% is a Tank-Status related KOP. Status of tank %SIT_EQU% wil be updated to %TANK_STS%
                    //LogService.Log(Message.MessageID, "SAB-TIMEBASED", 1000116,
                    //            "SIT_EQU", ctxEquipmentId,
                    //            "KOP_CODE", message.ParameterName,
                    //            "TANK_STS", Enum.GetName(typeof(SitTankStatusKop), statusKop));

                    SitTankStatusRequest req = SitTankStatusRequest.Create(SitTankStatusSource.AutoKOPWrite, tank, statusKop, parsedValue, timestamp);
                    new SitTankStatusManager().Manage(req);
                }
                catch (Exception exc)
                {
                    Exception realEx = Utility.GetRealException(exc);
                    res = -312;
                    //.Net Exception (%messageException%)  (%stackTrace%)
                    //errorDesc = Logger.BuildMessage(-312, new Params() { { "messageException", realEx.Message }, { "stackTrace", realEx.StackTrace } }, null);
                    return res;
                }

            }

            if (timestamp.IsInTheFuture)
            {
                res = -1000110;
                errorDesc = "timestamp is in the future (" + timestamp.ToUTCString() + ">" + DateTime.UtcNow.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss") + "  UTC)";
            }
            else
            {

                switch (message.ParameterType)
                {
                    case EBRDataType.DateTime:
                    case EBRDataType.String:
                        value = parsedValue;
                        break;
                    case EBRDataType.Numeric:
                        value = float.Parse(parsedValue, CultureInfo.InvariantCulture.NumberFormat);
                        break;
                    default:
                        break;
                }

                ParamsReturnValue result = PPAKOP.insertKOPValue(message.ParameterName, ctxEquipmentId, timestamp, value);
                if (result.succeeded)
                {
                    res = 0;
                    //Timebased Message: %kop%, equipment: %equipment%, value: %value%, uom: %uom%, timestamp: %timestamp%, processing succeeded
                    //Logger.LogSuccess(804, new Params() { { "kop", message.ParameterName },
                    //                                                 { "equipment", message.EquipmentID },
                    //                                                 { "value", message.ParameterValue },
                    //                                                 { "uom", message.ParameterUom },
                    //                                                 { "timestamp", message.ParameterValueTimestamp }}, null);
                }
                else
                {
                    res = -357;
                    //Timebased Message: %kop%, equipment: %equipment%, value: %value%, uom: %uom%, timestamp: %timestamp%, processing failed with error %error%
                    //errorDesc = Logger.BuildMessage(-357, new Params() { { "kop", message.ParameterName },
                    //                                                 { "equipment", message.EquipmentID },
                    //                                                 { "value", message.ParameterValue },
                    //                                                 { "uom", message.ParameterUom },
                    //                                                 { "timestamp", message.ParameterValueTimestamp },
                    //                                                 { "error", LogService.GetMessage(result) }}, null);

                }


            }
            return res;
        }

        private bool SendTankStatusOnStartBatch()
        {

            SitEquipment sitEquip = SitEquipment_BREAD.SelectByID(ctxEquipmentId);
            if (sitEquip.IsBBT)
            {
                SitOrder prevOrder = SitOrder_BREAD.GetLastCompletedOrder(sitEquip);
                SitTankStatusRequest requestFL = SitTankStatusRequest.Create(SitTankStatusSource.ManualStartOrderPreviousFL, prevOrder);
                new SitTankStatusManager().Manage(requestFL);
            }
            return true;
        }

        private bool SendTankStatusAfterStartBatch()
        {
            SitOrder myOrder = SitOrder_BREAD.SelectByBatchID(ctxBatchId);
            SitTankStatusRequest req = SitTankStatusRequest.Create(SitTankStatusSource.AutoStartOrder, myOrder);
            new SitTankStatusManager().Manage(req);
            return true;
        }

        //Process OEE counter with information taken from production declaration message
        public int processMessageInOEE(string disSchedulerCounter, out string errorDesc)
        {
            errorDesc = string.Empty;
            ProductionDeclaration message = Message as ProductionDeclaration;
            DateTime timestamp = DateTime.UtcNow;
            SitDateTime messageTimestamp = SitDateTime.Parse(message.MoveTimeStamp);
            if (messageTimestamp.HasValue)
                timestamp = messageTimestamp.UTCDateTime.Value;
            double value = double.Parse(message.Quantity, CultureInfo.InvariantCulture.NumberFormat);
            string EquipFullPath = SitBread.GetSuperiorCell(ctxOrder.ExecutionEquipmentID);


            SitOEECustomFieldCollection customfields = new SitOEECustomFieldCollection();
            customfields.OrderID = ctxOrder.ERPID;
            customfields.BatchID = ctxBatchId;
            customfields.ProductID = message.MaterialId;
            customfields.DISSchedulerCounter = disSchedulerCounter.ToString();

            ParamsReturnValue result = CounterManager.ProcessQuantity(timestamp, EquipFullPath, SitConfiguration.CounterProductionPackaging,
                                        value, message.ParameterUom, customfields);
            if (result.succeeded)
            {
                res = 0;
                //Logger.LogSuccess(802, new Params(){{"batchId", Message.BatchName },
                //                        {"messageDesc", Message.MessageName}}, null);
            }
            else
            {

                //generate OEE counter message
                SitCTRRecord newCounter = new SitCTRRecord();
                newCounter.BatchID = ctxBatchId;
                newCounter.CounterName = SitConfiguration.CounterProductionPackaging;
                newCounter.DisSchedulerCounter = disSchedulerCounter.ToString();
                newCounter.EquipmentFullPath = EquipFullPath;
                newCounter.OrderID = ctxOrder.ERPID;
                newCounter.ProductID = message.MaterialId;
                newCounter.Quantity = value;
                newCounter.UoM = message.ParameterUom;
                newCounter.UtcEndTime = SitDateTime.Create(timestamp, false);

                OEECTRMessage ctrMessage = CounterManager.CreateOEECTRMessage(newCounter);
                string messageContent = ctrMessage.MessageContent;
                //park the message in the shopfloor monitor for future reprocessing
                SitSFMonitorUtility.Save(ctrMessage.MessageID, ctrMessage.BatchName, ctrMessage.MessageName, SitCMMMonitorActionStatus.Ready,
                    result.numcode, LogService.GetMessage(result), ref messageContent, "EBR", "REWORK", ctrMessage.Timestamp, disSchedulerCounter);
            }
            return res;
        }

        //Process OEE counter with information taken from oee counter message
        public int processMessageInOEE(out string errorDesc)
        {
            errorDesc = string.Empty;
            OEECTRMessage message = Message as OEECTRMessage;
            ParamsReturnValue result = CounterManager.ProcessOEECTRMessage(message);
            if (result.succeeded)
            {
                res = 0;
                //Logger.LogSuccess(802, new Params(){{"batchId", Message.BatchName },
                //                        {"messageDesc", Message.MessageName}}, null);
            }
            else
            {
                res = (result.numcode.HasValue) ? result.numcode.Value : -101010;
                errorDesc = LogService.GetMessage(result);
            }
            return res;
        }

        public int processUtilityMessageInOEE(out string errorDesc)
        {
            errorDesc = string.Empty;
            OEECTRUtilityMessage message = Message as OEECTRUtilityMessage;
            ParamsReturnValue result = CounterManager.ProcessOEECTRUtilityMessage(message);
            if (result.succeeded)
            {
                res = 0;
                //Logger.LogSuccess(803, new Params() { { "counter", message.ParameterName },
                //                                                     { "equipment", message.EquipmentID },
                //                                                     { "value", message.ParameterValue },
                //                                                     { "uom", message.ParameterUom }}, null);
            }
            else
            {
                res = -356;
                //Utility Message - Counter: %counter%, equipment: %equipment%, value: %value%, uom: %uom%, processing failed with error %error%
                //errorDesc = Logger.BuildMessage(-356, new Params() { { "counter", message.ParameterName },
                //                                                     { "equipment", message.EquipmentID },
                //                                                     { "value", message.ParameterValue },
                //                                                     { "uom", message.ParameterUom },
                //                                                     { "error", LogService.GetMessage(result) }}, null);

            }
            return res;
        }




        public bool Delete()
        {
            ParamsReturnValue res = SitSFMonitorUtility.Delete(Message.MessageID);
            return res.succeeded;
        }

        public bool Save(int errorCode, string errorString, SitCMMMonitorActionStatus messageStatus,
          ref string xmlMessage, string disType, string disSchema, string disSchedulerCounter)
        {

            //loggo il risultato negativo
            //E802	BatchId: '%batchId%' - Message:'%messageDesc%' - Error: %errorDesc%	
            ///Logger.BuildMessage(-802, new Params() { { "batchId", Message.BatchName }, { "messageDesc", Message.MessageName }, { "errorDesc", "(" + errorCode + ") " + errorString } }, CTXParams);

            bool res = SitSFMonitorUtility.Save(Message.MessageID, Message.BatchName, Message.MessageName, messageStatus, errorCode,
                errorString, ref xmlMessage, disType, disSchema, Message.Timestamp, disSchedulerCounter);

            return res;

            //se il msgID cè già aumento il counter di uno

        }

        #endregion




        public SitSFMonitor GetMonitorObject(string source)
        {
            return new SitSFMonitor()
            {
                SitCode = 0,
                SitMessageID = Message.MessageID,
                SitBatchID = Message.BatchName,
                SitEquipID = ctxEquipmentId,
                SitMessageDesc = Message.MessageName,
                Description = string.Empty,
                SitMessageType = Message.GetType().Name,
                SitProcedureName = Message.ProcedureName,
                SitProcedureId = Message.ProcedureID,
                SitKopName = Message.ParameterName,
                SitKopUoM = Message.ParameterUom,
                SitOrderType = string.Empty,
                SitSource = source,
                SitTimestamp = DateTime.UtcNow

            };
        }

        private IConvertible ParseValue(string stringValue, SitProcessParameter sitProcessParameter)
        {
            switch (sitProcessParameter.DataType)
            {
                case Siemens.Brewing.Domain.SitEnum.KopDataType.DateTime:
                    return SitDateTime.Parse(stringValue);
                case Siemens.Brewing.Domain.SitEnum.KopDataType.Float:
                    double doubleResult;
                    if (double.TryParse(stringValue, NumberStyles.Number, CultureInfo.InvariantCulture, out doubleResult))
                        return doubleResult;
                    break;
                case Siemens.Brewing.Domain.SitEnum.KopDataType.String:
                    return stringValue;
                case Siemens.Brewing.Domain.SitEnum.KopDataType.None:
                default:
                    return null;
            }
            return null;
        }

    }
}