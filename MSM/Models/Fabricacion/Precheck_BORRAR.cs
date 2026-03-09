//using MSM.BBDD.Planta;
//using Siemens.Brewing.Data;
//using Siemens.Brewing.Data.Bread;
//using Siemens.Brewing.Data.Manager.TankStatus;
//using Siemens.Brewing.Domain.Entities;
//using Siemens.Brewing.Domain.Message;
//using Siemens.Brewing.Domain.Message.FromSfToMes;
//using Siemens.Brewing.Domain.SitEnum;
//using Siemens.Brewing.Shared;
//using Siemens.SimaticIT.POM.Breads;
//using Siemens.SimaticIT.POM.Breads.Types;
//using System;
//using System.Collections.Generic;
//using System.Collections.ObjectModel;
//using System.Data;
//using System.Linq;
//using System.Web;

//namespace MSM.Models.Fabricacion
//{
//    //Clases copiadas del template, el codigo es de siemens, solo que se ha adaptado para su correcto funcionamiento en MES
//    /// <summary>
//    /// Clase para realizar todos los precheck antes de llevar a cabo una operacion de inserccion
//    /// Aplica a inicios y fines de batch y procedimientos, KOP y consumo de materiales
//    /// La codificacion es la siguiente
//    /// 0 -> Inicio batch
//    /// 1 -> Inicio procedimiento
//    /// 2 -> KOP
//    /// 3 -> MM
//    /// 4 -> Fin procedimiento
//    /// 5 -> Fin batch
//    /// </summary>
//    public class Precheck
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
//        /// Precheck para mensajes de inicio de Batch
//        /// </summary>
//        /// <param name="iniB"></param>
//        /// <returns>Diccionario con errores</returns>
//        public Dictionary<int, string> hacerPrecheckInicioBatch(SitOrder iniB)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>(); //Vacionamos el diccionario
//                elementosMapeados(iniB);//Ver que todos los elementos son correctos y existen en SimaticIT
//                if (resultado.Count==0) batchEnUso(iniB); //Ver si el codigo de batch ya existe
//                //SOLO TIENE SENTIDO EN LO QUE NO SEA COCCION -> EquipoLibre
//                if (resultado.Count == 0) equipoLibre(iniB); //Ver si el equipo indicado esta disponible para su uso
//                if (resultado.Count == 0) pprHealthChecked(iniB); //Realizar HealthCheck del PPR para ver si cumple las condiciones
//                if (resultado.Count == 0) estadoTanque(iniB);
//                return resultado;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckInicioBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Guarda la ultima orden ejecutada en ese tanque
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void estadoTanque(SitOrder iniB)
//        {
//            try
//            {
//                SitEquipment sitEquip = SitEquipment_BREAD.SelectByID(iniB.ExecutionEquipmentID);
//                //Busca el id del equipo que vamos a utilizar
//                if (sitEquip.IsBBT)
//                {
//                    SitOrder prevOrder = SitOrder_BREAD.GetLastCompletedOrder(sitEquip);
//                    //Obtienes la orden anterior
//                    SitTankStatusRequest requestFL = SitTankStatusRequest.Create(SitTankStatusSource.ManualStartOrderPreviousFL, prevOrder);
//                    new SitTankStatusManager().Manage(requestFL);
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.estadoTanque", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Metodo para realizar HealthCheck del PPR para ver si cumple las condiciones
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void pprHealthChecked(SitOrder iniB)
//        {
//            try
//            {
//                string pprName = String.Empty;
//                bool isHealthCecked = SitBread.PPRIsHealthChecked(iniB.ExecutionEquipmentID, iniB.FinalMaterialID, out pprName);
//                //Llamamos al metodo que nos devuelve un booleano indicando si se ha pasado el HealthCheck o no

//                bool succeed = string.IsNullOrEmpty(pprName) || isHealthCecked;
//                if (!succeed)
//                {
//                    resultado.Add(0, "Error haciendo el HealthCheck del PPR"); //Guardamos el mal precheck en caso de que no haya superado el HealthCheck
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.pprHealthChecked", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Funcion que busca a ver si el equipo esta disponible para iniciar la orden
//        /// No aplica en coccion
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void equipoLibre(SitOrder iniB)
//        {
//            try
//            {
//                bool result = true;
//                string anotherOrderId = string.Empty;
//                if (!string.IsNullOrEmpty(iniB.ExecutionEquipmentID))
//                {
//                    //Esta consulta obtiene la lista de Entrys que tengan ordenes activas para ese equipo
//                    //No aplicaria a coccion ya que a nivel de batch el equipo puede compartirse
//                    Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
//                    String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\">"
//                        + "<property>ID</property>"
//                        + "<property>ExecutionEquipmentID</property>"
//                        + "<property>ParentEntryID</property>"
//                        + "<property>StatusID</property>"
//                        + "<entity name=\"POMTypes.Order\" link=\"OrderPK\">"
//                        + "<property>ID</property>"
//                        + "<property>TypeID</property>"
//                        + "</entity>"
//                        + "</virtualEntity>";
//                    String condition = "{StatusID} = 'Running' and {ParentEntryID} is null and {ExecutionEquipmentID} ='" + iniB.ExecutionEquipmentID + "' and {OrderTypeID} in ('FE', 'MT', 'FL')";
//                    using (DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition))
//                    {
//                        if (dataSet != null && dataSet.Tables != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows != null && dataSet.Tables[0].Rows.Count > 0)
//                        {
//                            //Busca en el listado si ese batch tiene ese equipo en uso y devuelve error
//                            anotherOrderId = dataSet.Tables[0].Rows[0]["OrderID"].ToString();
//                            result = false;

//                        }
//                    }
//                }
//                if (!result)
//                {
//                    //SE guarda el precheck fallido
//                    resultado.Add(0, "Error viendo si el equipo esta libre");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.equipoLibre", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Busca si el batch indicado como ID se encuentra actualmente registrado y en uso
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void batchEnUso(SitOrder iniB)
//        {
//            try
//            {
//                bool batchUso = GetBatchInfoById(iniB.ID) == null; //Hacemos una busqueda con el ID que vamos a insertar

//                //Si hay datos es que ya existe y no se podia volver a insertar
//                if (batchUso)
//                {
//                    resultado.Add(0, "Error viendo si el batch esta en uso");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.batchEnUso", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//        }

//        /// <summary>
//        /// Funcion que comprueba si todos los materiales y equipos suministrados en el mensaje son correctos
//        /// </summary>
//        /// <param name="iniB"></param>
//        private void elementosMapeados(SitOrder iniB)
//        {
//            try
//            {
//                List<string> notMappedList = new List<string>();

//                //Comprobamos el equipo
//                string MappedProcessCell = FillNotMappedList(SFMessageEntityMapping.Equipment, iniB.ExecutionEquipmentID, "STR_ProcessCell", ref notMappedList);

//                //Comprobamos el material
//                string MappedMaterial = FillNotMappedList(SFMessageEntityMapping.Material, iniB.FinalMaterialID, "STR_FormulaId", ref notMappedList);

//                //Si no existen guardamos error de precheck
//                if (notMappedList.Count > 0)
//                {
//                    resultado.Add(0, "Error mapeando los materiales o equipos");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.elementosMapeados", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//        }

//        /// <summary>
//        /// Funciona para obtener el tipo de una orden, lo devuelve como string
//        /// </summary>
//        /// <param name="orderId"></param>
//        /// <returns></returns>
//        private string GetOrderType(string orderId)
//        {
//            try
//            {
//                Order_BREAD bread = BreadFactory.Create<Order_BREAD>();
//                return bread.Select("", 0, 0, "{ID} = '" + orderId + "'")[0].TypeID;
//                //Le pasamos el orderID como string
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetOrderType", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetBatchInfo", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetBatchInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//        }

//        /// <summary>
//        /// Metodo del template que busca el material y el equipo mapeado
//        /// </summary>
//        /// <param name="mappingType"></param>
//        /// <param name="value"></param>
//        /// <param name="xPath"></param>
//        /// <param name="notMappedList"></param>
//        /// <returns></returns>
//        protected string FillNotMappedList(SFMessageEntityMapping mappingType, string value, string xPath, ref List<string> notMappedList)
//        {
//            try
//            {
//                string mappedValue = string.Empty;
//                switch (mappingType)
//                {
//                    case SFMessageEntityMapping.Equipment: //Obtener el equipo
//                        mappedValue = SitEquipment_BREAD.GetMappedSITEquip(value);
//                        break;
//                    case SFMessageEntityMapping.Material: //Obtener el material
//                        mappedValue = SitConfiguration.SFMapping.GetSITMaterial(value);
//                        break;
//                    default:
//                        break;
//                }
//                if (string.IsNullOrEmpty(mappedValue))
//                    notMappedList.Add(xPath);
//                return mappedValue;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.FillNotMappedList", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region InicioProcedimiento

//        /// <summary>
//        /// Precheck para mensajes de inicio de procedimiento
//        /// </summary>
//        /// <param name="iniP"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPrecheckInicioProcedimiento(Procedure iniP)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                batchActivo(iniP.batchId); //Ver si el batch indicado esta activo
//                nuevoProcedimiento(iniP); //VEr si el procedimiento existe
//                procedimientoBatch(iniP); //Ver si el procedimiento esta incluido en el batch
//                equipoCorrecto(iniP); //Ver si el procedimiento tiene asignado el equipo correcto
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckInicioProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }


//        /// <summary>
//        /// Ver si el procedimiento tiene asignado el equipo correcto
//        /// Solo aplica a Fermentacion, maduracion y filtracion
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void equipoCorrecto(Procedure iniP)
//        {
//            try
//            {
//                string ctxEquipmentId = SitEquipment_BREAD.GetMappedSITEquip(iniP.equipo); //Obtener la informacion del equipo
//                bool result = true;
//                Entry ctxBatch = GetBatchInfoById(iniP.batchId); //Obtener la informacion del batch
//                if (string.IsNullOrEmpty(ctxEquipmentId))
//                    result = false;
//                else
//                {

//                    string ctxOrderType = GetOrderType(ctxBatch.OrderID); //Obtenemos la lista de tipos de ordenes

//                    if (new string[] { "FE", "MT", "FL" }.Contains(ctxOrderType) && !ctxEquipmentId.Equals(ctxBatch.ExecutionEquipmentID))
//                    {
//                        result = false;
//                    }
//                }
//                if (!result)
//                {
//                    resultado.Add(1, "El equipo no esta disponible");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.equipoCorrecto", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Ver si el procedimiento esta incluido en el batch
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void procedimientoBatch(Procedure iniP)
//        {
//            try
//            {
//                bool result = false;
//                Entry_BREAD entryBread = BreadFactory.Create<Entry_BREAD>();
//                String xml = "<virtualEntity entity=\"POMTypes.Entry\" version=\"6.5\">"
//                    + "<property>ID</property>"
//                    + "<property>BatchID</property>"
//                    + "<entity name=\"POMTypes.Entry\" backLink=\"ParentEntryPK\">"
//                    + "<property>ProductSegmentID</property>"
//                    + "</entity>"
//                    + "</virtualEntity>";
//                String condition = "{BatchID} = '" + iniP.batchId + "' and {EntryProductSegmentID} = '" + iniP.nombre + "'";
//                //En esta consulta lo que hace es obtener de las entrys los procedimientos para ese batch
//                using (DataSet dataSet = entryBread.SelectExXml(xml, "", 0, 0, condition))
//                {
//                    //En el dataset busca a ver si contiene ese procedimiento o no
//                    if (dataSet != null && dataSet.Tables != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows != null && dataSet.Tables[0].Rows.Count > 0)
//                        result = true;
//                    if (!result)
//                    {
//                        resultado.Add(1, "El procedimiento no existe en ese batch");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.procedimientoBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Funcion para ver si el procedimiento a crear ya existe
//        /// </summary>
//        /// <param name="iniP"></param>
//        private void nuevoProcedimiento(Procedure iniP)
//        {
//            try
//            {
//                //Obtenemos la informacion para procedimientoID deseado
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(iniP);
//                if (ctxProcedure != null)
//                {
//                    //Si existe es que ya esta creado
//                    resultado.Add(1, "El procedimiento ya existe");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.nuevoProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetProcedureInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetProcedureInfo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region KOP

//        /// <summary>
//        /// Precheck para mensajes de KOP
//        /// </summary>
//        /// <param name="kop"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPrecheckKOP(KOP kop)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                batchActivo(kop.batchId); //Comprobar que el batch esta activo
//                procedimientoExiste(kop); //Comprobar que el procedimiento existe
//                procedimientoActivo(kop); //Comprobar que el procedimiento esta activo
//                kopExisteValido(kop); //Comprobar que el KOP es valido

//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckKOP", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Comprobar que el KOP es valido
//        /// </summary>
//        /// <param name="kop"></param>
//        private void kopExisteValido(KOP kop)
//        {
//            try
//            {
//                int kopPk = -1;
//                ProcedureInfo ctxProcedure = GetProcedureKOPInfoById(kop); //Obtiene la informacion del procedimiento
//                ProcessSegmentParameter param = GetKopInfo(ctxProcedure.ProcedureEntryId, kop.codigoKOP, out kopPk); //Obtiene la informacion del KOP
//                if (param == null) //El KOP no existe
//                {
//                    resultado.Add(2, "El KOP no existe");
//                }
//                else if (!param.UoMID.Equals(kop.uom, StringComparison.InvariantCultureIgnoreCase)) //El UOM no es correcto
//                {
//                    if (!UoMMapper.IsSpecialCase(kop.uom, param.UoMID))
//                    {
//                        resultado.Add(2, "El UOM del KOP es incorrecto");
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.kopExisteValido", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprobar que el procedimiento esta activo
//        /// </summary>
//        /// <param name="kop"></param>
//        private void procedimientoActivo(KOP kop)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureKOPInfoById(kop); //Obtiene la informacion del procedimiento
//                if (!ctxProcedure.ProcedureStatus.Equals("Processed") || !ctxProcedure.ProcedureStatus.Equals("Running")) //Si el estado es diferente a estos da error
//                {
//                    resultado.Add(2, "El procedimiento no esta activo");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.procedimientoActivo", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.procedimientoExiste", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Obtiene el objeto KOP para usarlo
//        /// </summary>
//        /// <param name="entryId"></param>
//        /// <param name="paramName"></param>
//        /// <param name="kopPk"></param>
//        /// <returns></returns>
//        private ProcessSegmentParameter GetKopInfo(string entryId, string paramName, out int kopPk)
//        {
//            try
//            {
//                kopPk = -1;
//                ProcessSegmentParameter res = null;
//                //Prepara el bread para hacer la consulta
//                ProcessSegmentParameter_BREAD processSegmentParameterBread = BreadFactory.Create<ProcessSegmentParameter_BREAD>();

//                //Prepara la condicion par la consulta
//                string condition = "{EntryID} = '" + entryId + "' and {Name} = '" + paramName + "'";
//                Collection<ProcessSegmentParameter> list = processSegmentParameterBread.Select("", 0, 0, condition);
//                //Ejecuta la consulta
//                if (list != null && list.Count > 0)
//                {
//                    res = list[0]; //Deuvelve el primer resultado
//                    kopPk = res.PK;
//                }

//                return res;
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetKopInfo", ex.Message, HttpContext.Current.User.Identity.Name);
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
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.GetProcedureKOPInfoById", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region MaterialMove

//        /// <summary>
//        /// Precheck para mensajes de Material Move
//        /// </summary>
//        /// <param name="mm"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPrecheckMaterialMove(MaterialMove mm)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                batchActivo(mm.batchId); //Comprueba que el batch esta activo

//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckMaterialMove", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        #endregion

//        #region FinProcedimiento

//        /// <summary>
//        /// Precheck para mensajes de fin de procedimiento
//        /// </summary>
//        /// <param name="finP"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPrecheckFinProcedimiento(Procedure finP)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                batchActivo(finP.batchId); //COmprueba que el batch esta activo
//                procedimientoExiste(finP); //Comprueba que el procedimiento existe
//                procedimientoActivo(finP); //Comprueba que el procedimiento esta activo

//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckFinProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Busca si el procedimiento existe y esta activo o no
//        /// </summary>
//        /// <param name="finP"></param>
//        private void procedimientoActivo(Procedure finP)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(finP); //Obtiene el procedimiento para ese ID
//                if (!ctxProcedure.ProcedureStatus.Equals("Processed") || !ctxProcedure.ProcedureStatus.Equals("Running")) //Comprueba el estado
//                {
//                    resultado.Add(4, "El procedimiento no esta activo");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.procedimientoActivo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        /// <summary>
//        /// Comprueba si el procedimiento existe
//        /// </summary>
//        /// <param name="finP"></param>
//        private void procedimientoExiste(Procedure finP)
//        {
//            try
//            {
//                ProcedureInfo ctxProcedure = GetProcedureInfoById(finP); //Devuelve la informacion del procedimiento
//                if (ctxProcedure == null)
//                {
//                    resultado.Add(4, "El procedimiento no existe");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.procedimientoExiste", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region FinBatch
//        /// <summary>
//        /// Precheck para mensajes de fin de batch
//        /// </summary>
//        /// <param name="finB"></param>
//        /// <returns></returns>
//        public Dictionary<int, string> hacerPrecheckFinBatch(Batch finB)
//        {
//            try
//            {
//                resultado = new Dictionary<int, string>();
//                batchEjecutandose(finB); //Comprueba si el estado del batch es en ejecucion
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.hacerPrecheckFinBatch", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }

//            return resultado;
//        }

//        /// <summary>
//        /// Obtiene el batch y el estado en el que se encuentra
//        /// </summary>
//        /// <param name="finB"></param>
//        private void batchEjecutandose(Batch finB)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(finB.batchID); //Obtiene el objeto batch como Entry
//                if (ctxBatch == null)
//                {
//                    //No existe
//                    resultado.Add(5, "Error comprobando si el batch esta activo");
//                }
//                else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID))
//                {
//                    //Estado incorrecto
//                    string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);
//                    resultado.Add(5, "El estado del batch no es correcto");
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.batchEjecutandose", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//        #region Comun
//        /// <summary>
//        /// Obtiene el estado del batch
//        /// </summary>
//        /// <param name="batchID"></param>
//        private void batchActivo(string batchID)
//        {
//            try
//            {
//                Entry ctxBatch = GetBatchInfoById(batchID);

//                if (ctxBatch == null)
//                {
//                    //No existe el batch
//                    resultado.Add(1, "Error comprobando si el batch existe");
//                }
//                else if (!new string[] { "Running", "Processed" }.Contains(ctxBatch.StatusID))
//                {
//                    string statusId = SitStatusDescription_BREAD.GetEntryDescription(ctxBatch.StatusID);
//                    //Estado incorrecto
//                    resultado.Add(1, "El estado no es correcto: " + statusId);
//                }
//            }
//            catch (Exception ex)
//            {
//                DAO_Log.registrarLog(DateTime.Now, "Precheck.batchActivo", ex.Message, HttpContext.Current.User.Identity.Name);
//                throw new Exception(ex.Message);
//            }
//        }

//        #endregion

//    }
//}