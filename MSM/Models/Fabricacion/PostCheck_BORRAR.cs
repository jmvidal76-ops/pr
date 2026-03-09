//using MSM.BBDD.Planta;
//using Siemens.Brewing.Data;
//using Siemens.Brewing.Data.Bread;
//using Siemens.Brewing.Data.Manager;
//using Siemens.Brewing.Data.Manager.TankStatus;
//using Siemens.Brewing.Domain.Entities;
//using Siemens.Brewing.Domain.SitEnum;
//using Siemens.Brewing.Shared;
//using Siemens.SimaticIT.POM.Breads;
//using Siemens.SimaticIT.POM.Breads.Types;
//using System;
//using System.Collections.Generic;
//using System.Collections.ObjectModel;
//using System.Data;
//using System.Globalization;
//using System.Linq;
//using System.Web;

//namespace MSM.Models.Fabricacion
//{
//    //Clases copiadas del template, el codigo es de siemens, solo que se ha adaptado para su correcto funcionamiento en MES
//    /// <summary>
//    /// Clase para realizar todos los postcheck despues de llevar a cabo una operacion de inserccion
//    /// Aplica a inicios y fines de batch y procedimientos, KOP y consumo de materiales
//    /// La codificacion es la siguiente
//    /// 0 -> Inicio batch
//    /// 1 -> Inicio procedimiento
//    /// 2 -> KOP
//    /// 3 -> MM
//    /// 4 -> Fin procedimiento
//    /// 5 -> Fin batch
//    /// </summary>
//    public class PostCheck
//    {
//        /// <summary>
//        /// Para gestionar el tema de errores en los mensajes, se crea un diccionario de claves
//        /// Este diccionario devolvera un entero, definido arriba del tipo de mensaje que ha dado error
//        /// Y el mensaje de error para guardarlo y mostrarlo en el portal
//        /// </summary>
//        private Dictionary<int, string> _resultado = new Dictionary<int, string>();

//        public Dictionary<int, string> resultado
//        {
//            get { return _resultado; }
//            set { _resultado = value; }
//        }

//        #region InicioBatch

//        /// <summary>
//        /// Postcheck para mensajes de inicio de Batch
//        /// </summary>
//        /// <param name="iniB"></param>
//        /// <returns>Diccionario con errores</returns>
//        public Dictionary<int, string> hacerPostcheckInicioBatch(SitOrder iniB)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                existeBatch(iniB); //Comprueba que el batch existe
//                batchActivo(iniB); //Comprueba que el batch esta activo
//                limpiarLot(iniB); //Limpia el lote del material
//                startTimeCorrecto(iniB); //Comprueba que el start time es correcto
//                actualizarDueDate(iniB); //Actualiza la dueDate
//                mandarEstadoTanque(iniB); //Manda el estado al tanque
//                enviarMensajeShopFloor(iniB); //Envia el mensaje al ShopFloor
//                postProcesar(iniB); //PostProcesa
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.hacerPostcheckInicioBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// PostProcesa el mensaje
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void postProcesar(Batch iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.batchID); //Obtiene la inforamcion del batch
//                SitOrder po = SitOrder_BREAD.SelectByID(ctxBatch.OrderID);
//                string finalMaterial = iniB.materialID.idMaterial; //Obtiene el material final
//                if (finalMaterial.StartsWith("[") && finalMaterial.EndsWith("]")) //Prepara el material
//                {
//                    //check if material exist
//                    finalMaterial = finalMaterial.Replace("[", "").Replace("]", "");
//                    Siemens.SimaticIT.MM.Breads.Definition_BREAD definitionBread = new Siemens.SimaticIT.MM.Breads.Definition_BREAD();


//                    String condition = string.Format("{{ID}} = '{0}'", finalMaterial);

//                    Siemens.SimaticIT.MM.Breads.Types.Definition matDef = definitionBread.Select("", 0, 0, condition).SingleOrDefault();
//                    if (matDef == null)
//                    {
//                        resultado.Add(0, "No existe el material final");
//                    }

//                }
//                //    double qty = double.Parse(((StartBatch)Message).BatchQuantity, CultureInfo.InvariantCulture.NumberFormat);
//                //    ReturnValue ret = SitOrder_BREAD.PostProcessing(po.ID, "", null,
//                //"", finalMaterial, qty, null, null);

//                //    if (!ret.succeeded)
//                //    {
//                //        res = -358;
//                //        //START BATCH ERROR - BatchId '%ctxBatchId%', MaterialId '%ctxMaterialId%', EquipmentId '%ctxEquipmentId%' - Error while sending message to EBR
//                //        return false;
//                //    }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.postProcesar", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Envia el mensaje a ShopFloor
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void enviarMensajeShopFloor(Batch iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.batchID);
//                SitOrder order = SitOrder_BREAD.SelectByID(ctxBatch.OrderID); //Obtiene la informacion de la order
//                ParamsReturnValue ret = SitOrder_BREAD.SendMessageToSf(order);
//                if (!ret.succeeded)
//                {
//                    resultado.Add(0, "Error al enviar el mensaje al ShopFloor");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.enviarMensajeShopFloor", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Manda el estado del tanque
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void mandarEstadoTanque(Batch iniB)
//        {
//            try
//            {
//                SitOrder myOrder = SitOrder_BREAD.SelectByBatchID(iniB.batchID);
//                SitTankStatusRequest req = SitTankStatusRequest.Create(SitTankStatusSource.AutoStartOrder, myOrder);
//                new SitTankStatusManager().Manage(req);
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.mandarEstadoTanque", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Actualiza el campo dueDate de la orden
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void actualizarDueDate(Batch iniB)
//        {
//            try
//            {
//                SitOrder myOrder = SitOrder_BREAD.SelectByBatchID(iniB.batchID); //Obtiene la orden
//                SitBread.UpdateDueDate(myOrder.MainEntryID, myOrder.ID);
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.actualizarDueDate", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba que el startime introducido es correcto
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void startTimeCorrecto(SITOrder iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.batchID); //Obtiene la orden
//                string startTime = iniB.startDate.ToString(); //Lee el startime introducido
//                bool result = IsDateTimeEqual(ctxBatch.ActualStartTime, startTime, false); //compara ambos
//                if (!result)
//                {
//                    resultado.Add(0, "Fecha de inicio incorrecta");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.startTimeCorrecto", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Limpia el lote del material
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void limpiarLot(SitOrder iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.ID);
//                SitOrder orderRun = SitOrder_BREAD.SelectByBatchID(ctxBatch.BatchID);
//                TFMManager.CleanTank(orderRun.ExecutionEquipmentID);
//            }
//            catch (Exception)
//            {
//                resultado.Add(0, "Error al limpiar el tanque");
//            }
//        }

//        /// <summary>
//        /// Funcion para comparar dos fechas
//        /// </summary>
//        /// <param name="dateTime"></param>
//        /// <param name="stringDate"></param>
//        /// <param name="isKop"></param>
//        /// <returns></returns>
//        private bool IsDateTimeEqual(DateTime? dateTime, string stringDate, bool isKop)
//        {
//            try
//            {
//                bool res = false;

//                if (dateTime.HasValue)
//                {
//                    //Iguala formatos
//                    string sufix = (stringDate.EndsWith("+00:00")) ? "+00:00" : "";
//                    DateTime dt = dateTime.Value;
//                    string x = dt.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss", DateTimeFormatInfo.InvariantInfo) + sufix;
//                    res = x.Equals(stringDate);
//                }

//                return res;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.IsDateTimeEqual", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//        }

//        /// <summary>
//        /// Obtiene el estado del batch
//        /// </summary>
//        /// <param name="batchID"></param>
//        private void batchActivo(SitOrder iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.ID);

//                if (ctxBatch == null)
//                {
//                    resultado.Add(0, "El batch insertado no se encuentra en la lista");
//                }
//                else
//                    if (ctxBatch.StatusID.Equals("Running") || ctxBatch.StatusID.Equals("Processed"))
//                        resultado.Add(0, "El batch insertado no tiene el estado correcto");
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "PostCheck.batchActivo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }


//        /// <summary>
//        /// COMprueba si el batch ejecutado existe
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void existeBatch(SitOrder iniB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(iniB.ID); //Devuelve el objeto batch
//                bool result = ctxBatch != null; //Si no tiene valor registramos log
//                if (!result)
//                {
//                    resultado.Add(0, "El batch insertado no se encuentra en la lista");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "PostCheck.existeBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }


//        /// <summary>
//        /// Obtiene el batch como objeto Entry para luego usar sus caracteristicas
//        /// Se recibe la condicion de la consulta por parametro
//        /// </summary>
//        /// <param name="whereCondtion"></param>
//        /// <returns></returns>
//        private Entry GetBatchInfo(string whereCondtion)
//        {
//            try
//            {
//                Entry res = null; //Futuro objeto a devolver
//                Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
//                //Instanciamos bread

//                Collection<Entry> list = entryBread.Select("", 0, 0, whereCondtion); //Ejecuta la consulta
//                if (list != null && list.Count > 0)
//                {
//                    res = list[0]; //Si hay informacion la devuelve
//                }

//                return res;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "PostCheck.GetBatchInfo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Crea y ejecuta la condicion para devolver un objeto entry con la informacion del batch
//        /// </summary>
//        /// <param name="batchID"></param>
//        /// <returns></returns>
//        private Entry GetBatchInfoById(string batchID)
//        {
//            try
//            {
//                //Crea la condicion filtrando por el Batchid y los estados no aceptados
//                String condition = "{BatchID} ='" + batchID + "' and  {StatusID} not in ('Aborted', 'Discarded')";

//                //Devuelve el batch
//                return GetBatchInfo(condition);
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "PostCheck.GetBatchInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//        }

//        #endregion

//        #region InicioProcedimiento

//        /// <summary>
//        /// Post para mensajes de inicio de procedimiento
//        /// </summary>
//        /// <param name="iniP"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPostcheckInicioProcedimiento(Procedure iniP)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                procedimientoExiste(iniP); //Existe el procedimiento
//                procedimientoEstaActivo(iniP); //Esta activo el procedimiento
//                fechaInicioCorrecta(iniP); //La fecha de inicio es correcta
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.hacerPostcheckInicioProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Comprueba si la fecha de inicio especificada es correcta
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void fechaInicioCorrecta(Procedure iniP)
//        {
//            try
//            {
//                string startTime = iniP.startDate.ToString(); //Lee fecha de BBDD
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(iniP); //Lee fecha introducida
//                bool result = IsDateTimeEqual(ctxProcedure.ProcedureStartTime, startTime, false); //Compara
//                if (!result)
//                    resultado.Add(1, "Fecha de inicio incorrecta");
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.fechaInicioCorrecta", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba si el procedimiento esta activo
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void procedimientoEstaActivo(Procedure iniP)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(iniP); //Obtiene el procedimineto
//                if (!new string[] { "Processed", "Running" }.Contains(ctxProcedure.ProcedureStatus)) //Comprueba el estado
//                    resultado.Add(1, "El estado del procedimiento no es correcto");
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.procedimientoEstaActivo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba si el procedimiento existe
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void procedimientoExiste(Procedure iniP)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(iniP); //Obtiene procedimiento
//                if (ctxProcedure == null)
//                {
//                    resultado.Add(1, "El procedimiento no existe");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.procedimientoExiste", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }


//        /// <summary>
//        /// Obtiene el objeto procedimiento trayendo informacion de la bbdd
//        /// </summary>
//        /// <param name="iniP"></param>
//        /// <returns></returns>
//        private ProcedureInfo GetProcedureInfoById(Procedure iniP)
//        {
//            try
//            {
//                ProcedureInfo info = null;

//                String condition = "{EntryBatchID} = '" + iniP.batchId + "' and {PROCEDURE_NAMEEntryPropertyValueValue} = '" + iniP.nombre +
//                    "' and {PROCEDURE_IDEntryPropertyValueValue} = '" + iniP.id + "'";
//                using (DataSet ds = GetProcedureInfo(condition))
//                {
//                    //Obtenemos la informacion del procedimiento buscando por id, nombre e id del batch
//                    if (!(ds.IsEmpty()))
//                    {
//                        info = new ProcedureInfo(ds); //Devuelve el procedimiento

//                    }
//                    else
//                    {
//                        resultado.Add(1, "El procedimiento no existe");

//                        //Esta parte parece que edita el procedimiento en caso de no existir lo cual no es aplicable
//                        //condition = "{EntryBatchID} = '" + iniP.batchId + "' and {TypeID} = '" + iniP.nombre + "' and {StatusID}='Running' and (" +
//                        //    " {PROCEDURE_IDEntryPropertyValueValue} is null or {PROCEDURE_IDEntryPropertyValueValue} = '' )";
//                        //ds = GetProcedureInfo(condition);
//                        //if (!(ds.IsEmpty()))
//                        //{
//                        //    info = new ProcedureInfo(ds);
//                        //    SetProcedureIdandName(info.ProcedureEntryId, Message.ProcedureID, Message.ProcedureName);
//                        //    info.ProcedureId = Message.ProcedureID;
//                        //    info.ProcedureName = Message.ProcedureName;
//                        //}
//                    }
//                }

//                return info;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.GetProcedureInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }


//        /// <summary>
//        /// Obtiene la informacion del procedimiento
//        /// </summary>
//        /// <param name="condition"></param>
//        /// <returns></returns>
//        private DataSet GetProcedureInfo(string condition)
//        {
//            try
//            {
//                //Recibe la condicion por parametro y ejecuta esta consulta con esa condicion
//                Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
//                String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\" logicalEntity=\"\">"
//                + "<property>ID</property>"
//                + "<property>TypeID</property>"
//                + "<property>StatusID</property>"
//                + "<property>ActualEndTime</property>"
//                + "<property>ActualStartTime</property>"
//                + "<property>ExecutionEquipmentID</property>"
//                + "<entity name=\"POMTypes.Entry\" link=\"ParentEntryPK\">"
//                + "<property>ID</property>"
//                + "<property>BatchID</property>"
//                + "<property>StatusID</property>"
//                + "<property>ActualStartTime</property>"
//                + "<property>ActualEndTime</property>"
//                + "</entity>"
//                + "<pivotedEntity name=\"POMTypes.EntryProperty\" link=\"EntryPK\" pivotProperty=\"Name\">"
//                + "<pivotValue>PROCEDURE_NAME</pivotValue>"
//                + "<pivotValue>PROCEDURE_ID</pivotValue>"
//                + "<entity name=\"POMTypes.EntryPropertyValue\" backLink=\"EntryPropertyPK\">"
//                + "<property>Value</property>"
//                + "</entity>"
//                + "</pivotedEntity>"
//                + "</virtualEntity>";
//                DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition);
//                return dataSet;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.GetProcedureInfo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region KOP

//        /// <summary>
//        /// Post para mensajes de KOP
//        /// </summary>
//        /// <param name="kop"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPostcheckKOP(KOP kop)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                procedimientoExiste(kop); //Ver si el procedimiento existe
//                verValor(kop); //Comprobar que el KOP es correcto
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.hacerPostcheckKOP", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Busca el valor del KOP y comprueba que es correcto
//        /// </summary>
//        /// <param name="kop"></param>
//        private void verValor(KOP kop)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureKOPInfoById(kop);
//                string messageValue = kop.valorKOP.ToString(); //Obtiene valor
//                string messageTimestamp = kop.timeStamp.ToString(); //Obtiene fecha
//                EBRDataType messageDataType = EBRDataType.String;
//                switch (kop.tipoKOP) //comprueba tipo de dato
//                {
//                    case "String": messageDataType = EBRDataType.String; break;
//                    case "DateTime": messageDataType = EBRDataType.DateTime; break;
//                    case "int": messageDataType = EBRDataType.Numeric; break;
//                }
//                ProcessSegmentParameterActualValue_BREAD processSegmentParameterActualBread = BreadFactory.Create<ProcessSegmentParameterActualValue_BREAD>();
//                string messageValueTrim = (messageDataType == EBRDataType.Numeric) ?
//                    float.Parse(messageValue, CultureInfo.InvariantCulture.NumberFormat).ToString(CultureInfo.InvariantCulture)
//                    : messageValue.Replace("+00:00", "");

//                string condition = "{EntryID} = '" + ctxProcedure.ProcedureEntryId + "' and {ParameterName} = '" + kop.codigoKOP + "'";
//                Collection<ProcessSegmentParameterActualValue> list = processSegmentParameterActualBread.Select("", 0, 0, condition);
//                if (list == null && list.Count <= 0)
//                {
//                    resultado.Add(2, "El KOP no tiene valor");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.verValor", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Ver que el procedimiento esta creado
//        /// </summary>
//        /// <param name="kop"></param>
//        private void procedimientoExiste(KOP kop)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureKOPInfoById(kop); //Obtenemos informacion del procedimiento
//                if (ctxProcedure == null)
//                {
//                    resultado.Add(2, "El procedimiento no existe");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.procedimientoExiste", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Dado un ID de KOP devuelve el prodecimiento asociado
//        /// </summary>
//        /// <param name="kop"></param>
//        /// <returns></returns>
//        private ProcedureInfo GetProcedureKOPInfoById(KOP kop)
//        {
//            try
//            {
//                ProcedureInfo info = null;
//                //CRea la condicion para buscar el procedimiento
//                String condition = "{EntryBatchID} = '" + kop.batchId + "' and {PROCEDURE_NAMEEntryPropertyValueValue} = '" + kop.nombreProc +
//                    "' and {PROCEDURE_IDEntryPropertyValueValue} = '" + kop.idProc + "'";
//                using (DataSet ds = GetProcedureInfo(condition))
//                {
//                    if (!(ds.IsEmpty()))
//                    {
//                        info = new ProcedureInfo(ds); //Lo devuelve

//                    }
//                    else
//                    {
//                        resultado.Add(2, "El procedimiento del KOP no existe");
//                    }
//                }
//                return info;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.GetProcedureKOPInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region FinProcedimiento

//        /// <summary>
//        /// Postcheck para los mensajes de fin de procedimiento
//        /// </summary>
//        /// <param name="finP"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPostcheckFinProcedimiento(Procedure finP)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                procedimientoExiste(finP); //comprueba que el procedimiento existe
//                procedimientoCompleto(finP); //Comprueba que el procedimiento tiene el estado completo
//                fechaFinCorrecta(finP); //Comprueba que la fecha de fin es correcta
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.hacerPostcheckFinProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// comprueba que la fecha de fin es correcta
//        /// </summary>
//        /// <param name="finP"></param>
//        private void fechaFinCorrecta(Procedure finP)
//        {
//            try
//            {
//                //Lee ambas fechas de fin y las compara
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(finP);
//                string endTime = finP.endDate.ToString();
//                bool result = IsDateTimeEqual(ctxProcedure.ProcedureEndTime, endTime, false);
//                if (!result)
//                    resultado.Add(4, "Fecha fin incorrecta");
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.fechaFinCorrecta", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba que el estado del procedimiento es completado
//        /// </summary>
//        /// <param name="finP"></param>
//        private void procedimientoCompleto(Procedure finP)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(finP); //Lee objeto procedimiento
//                if (!ctxProcedure.ProcedureStatus.Equals("Processed")) //Comprueba estado
//                    resultado.Add(4, "El estado del procedimiento no es correcto");
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.procedimientoCompleto", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region FinBatch

//        /// <summary>
//        /// Postcheck para los mensajes de fin de batch
//        /// </summary>
//        /// <param name="finB"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPostcheckFinBatch(Batch finB)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                estadoCompletado(finB); //Comprueba que el estado de batch sea completado
//                fechaFinCorrecta(finB); //Comprueba que la fecha de fin sea correcta
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.hacerPostcheckFinBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Comprueba que la fecha de fin de batch sea correcta
//        /// </summary>
//        /// <param name="finB"></param>
//        private void fechaFinCorrecta(Batch finB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(finB.batchID); //Fecha bbdd
//                string endTime = finB.endDate.ToString(); //Fecha insertada
//                bool result = IsDateTimeEqual(ctxBatch.ActualEndTime, endTime, false); //Comparacion
//                if (!result)
//                {
//                    resultado.Add(5, "La fecha final no es correcta");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.fechaFinCorrecta", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba que el estado del batch sea completado
//        /// </summary>
//        /// <param name="finB"></param>
//        private void estadoCompletado(Batch finB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(finB.batchID); //Obtiene el batch
//                if (ctxBatch == null) //Si existe
//                {
//                    resultado.Add(0, "El batch no existe");
//                }
//                else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID)) //Estado diferente a esos dos
//                {
//                    string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);
//                    resultado.Add(5, "El estado final es incorrecto");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Postcheck.estadoCompletado", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion


//    }
//}