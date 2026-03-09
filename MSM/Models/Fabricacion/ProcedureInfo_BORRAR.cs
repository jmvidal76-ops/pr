using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class ProcedureInfo_BORRAR
    {


        public string ProcedureEntryId;
        public string ProcedureId;
        public string ProcedureName;
        public DateTime? ProcedureStartTime;
        public DateTime? ProcedureEndTime;
        public string ProcedureStatus;
        public string BatchEntryId;
        public string BatchId;
        public string BatchStatus;
        public DateTime? BatchStartTime;
        public DateTime? BatchEndTime;



        public ProcedureInfo_BORRAR(DataSet ds)
        {
            DataRow row = ds.Tables[0].Rows[0];
            ProcedureEntryId = row["ID"].ToString();
            ProcedureId = row["PROCEDURE_IDEntryPropertyValueValue"].ToString();
            ProcedureName = row["PROCEDURE_NAMEEntryPropertyValueValue"].ToString();
            ProcedureStartTime = row["ActualStartTime"] as DateTime?;
            ProcedureEndTime = row["ActualEndTime"] as DateTime?;
            ProcedureStatus = row["StatusID"].ToString();
            BatchEntryId = row["EntryID"].ToString();
            BatchId = row["EntryBatchID"].ToString();
            BatchStatus = row["EntryStatusID"].ToString();
            BatchStartTime = row["EntryActualStartTime"] as DateTime?;
            BatchEndTime = row["EntryActualEndTime"] as DateTime?;


        }

    }
}