using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Xml;

namespace MSM.Controllers.Alt
{
    public class formsController : ApiController
    {
        private readonly IDAO_Forms _iDAOForms;

        public formsController(IDAO_Forms iDAOForms)
        {
            _iDAOForms = iDAOForms;
        }

        /// <summary>
        /// Obtiene todos los formularios por departamento 0: CEL, 1: SEM
        /// </summary>
        [HttpGet]
        [Route("api/TemplatesForms/{idDepartmentType}")]
        [ApiAuthorize(Funciones.CEL_2_VisualizacionConfiguracionCEL, Funciones.SEM_2_VisualizacionConfiguracionSEM)]
        public List<object> getForms(int idDepartmentType)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;
                    return context.TemplatesForms.AsNoTracking().Where(f => f.idDepartmentType == idDepartmentType).ToList().Select(t => new { t.ID, t.name, t.descript, t.jsonTemplate, t.typeID, createdOn = t.createdOnUTC.Value.ToLocalTime() }).ToList<object>();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "formsController.getForms", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Obtiene todos los formularios que están por relacionados directamente con una localización
        /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>      
        /// 
        [HttpGet]
        [Route("api/TemplatesFormsByLoc/{id}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM,
                      Funciones.CEL_7_CreacionFormularioCEL, Funciones.SEM_8_CreacionFormularioSEM)]
        public List<object> getRelLocFormsByLoc(int id)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                var original = context.TemplatesLocForms.AsNoTracking().Where(t => t.idLoc == id);
                return original.Select(t => new { t.TemplatesForms.ID, t.TemplatesForms.name, t.TemplatesForms.descript, t.path }).ToList<object>();
            }
        }

        /// <summary>
        /// Crear o Modificar nueva plantilla de formulario
        /// </summary>
        [HttpDelete]
        [Route("api/TemplatesForms/{idTem}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object borrarFormTemplate(int idTem)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    var original = context.TemplatesForms.Single(t => t.ID == idTem);
                    context.TemplatesForms.Remove(original);

                    var sectionsToDelete = context.Forms5sLibreSecciones.Where(x => x.IdFormTemplate == idTem).ToList();
                    context.Forms5sLibreSecciones.RemoveRange(sectionsToDelete);

                    context.SaveChanges();
                }

                return new object[] { true, Resources.idioma.ALT_DELETE_FORM_OK };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_formsController.borrarFormTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, Resources.idioma.ALT_DELETE_FORM_ERROR };
            }
        }

        /// <summary>
        /// Crear o Modificar nueva plantilla de formulario
        /// </summary>
        [HttpPost]
        [Route("api/TemplatesForms")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object crearModifFormTemplate(TemplatesForms newTemplate)
        {
            try
            {
                //TemplatesForms newTemplate =  JsonConvert.DeserializeObject<TemplatesForms>(data.newTemplate);
                XmlDocument xmlTemplate;

                using (FormsDBEnt context = new FormsDBEnt())
                {
                    if (newTemplate.ID >= 0)
                    {
                        //UPDATE. EL REGISTRO EXISTE Y HAY QUE MODIFICARLO
                        var original = context.TemplatesForms.Single(t => t.ID == newTemplate.ID);
                        original.name = newTemplate.name;
                        original.descript = newTemplate.descript;
                        original.typeID = newTemplate.typeID;
                        original.jsonTemplate = newTemplate.jsonTemplate;
                        xmlTemplate = JsonConvert.DeserializeXmlNode(newTemplate.jsonTemplate, "formTemplate");
                        original.xmlTemplate = xmlTemplate.OuterXml;
                        original.lastModifyUTC = DateTime.Now.ToUniversalTime();
                        original.deleted = false;
                        filesController.saveFilesInTemplate(original, newTemplate.StorageFiles.ToList(), context);
                    }
                    else
                    {
                        //INSERT. EL TEMPLATE ES NUEVO
                        newTemplate.createdOnUTC = DateTime.Now.ToUniversalTime();
                        newTemplate.deleted = false;
                        newTemplate.jsonTemplate = newTemplate.jsonTemplate;
                        xmlTemplate = JsonConvert.DeserializeXmlNode(newTemplate.jsonTemplate, "formTemplate");
                        newTemplate.xmlTemplate = xmlTemplate.OuterXml;
                        context.TemplatesForms.Add(newTemplate);
                        if (newTemplate.StorageFiles.Count > 0)
                        {
                            filesController.saveFilesInTemplate(newTemplate, newTemplate.StorageFiles.ToList(), context);
                        }
                    }

                    context.SaveChanges();

                    // Se borran las secciones ya existentes del formulario plantilla
                    List<Forms5sLibreSecciones> sectionsToDelete = context.Forms5sLibreSecciones.Where(x => x.IdFormTemplate == newTemplate.ID).ToList();
                    context.Forms5sLibreSecciones.RemoveRange(sectionsToDelete);
                    context.SaveChanges();

                    //Tratamiento de las Secciones para el control 5S Libre
                    var json = JObject.Parse(newTemplate.jsonTemplate);
                    var secciones = new Dictionary<string, int>();

                    foreach (var ft in json["fieldsTemplate"]) 
                    {
                        if (ft["type"].ToString() == "5SLibre")
                        {
                            foreach (var t5S in ft["template5S"])
                            {
                                string seccion = t5S["seccion"].ToString();

                                if (!secciones.ContainsKey(seccion))
                                {
                                    Forms5sLibreSecciones formSecciones = new Forms5sLibreSecciones();
                                    formSecciones.IdFormTemplate = newTemplate.ID;
                                    formSecciones.Seccion = seccion;
                                    context.Forms5sLibreSecciones.Add(formSecciones);
                                    context.SaveChanges();

                                    secciones.Add(seccion, formSecciones.IdForm5s);
                                }

                                int id5S = secciones[seccion];
                                t5S["id5S"] = id5S;
                            }

                            foreach (var dr in ft["dataRow"])
                            {
                                dr["field"] = secciones[dr["seccion"].ToString()];
                            }
                        }
                    }

                    var formTemplate = context.TemplatesForms.Single(t => t.ID == newTemplate.ID);
                    formTemplate.jsonTemplate = json.ToString();
                    xmlTemplate = JsonConvert.DeserializeXmlNode(formTemplate.jsonTemplate, "formTemplate");
                    formTemplate.xmlTemplate = xmlTemplate.OuterXml;
                    context.SaveChanges();

                    return new object[] { true, Resources.idioma.GUARDADO_CORRECTAMENTE };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_formsController.crearModifFormTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error en la creación " };
            }
        }

        /// <summary>
        /// Copy nueva plantilla de formulario
        /// </summary>
        [HttpPost]
        [Route("api/CopyTemplatesForms/{idTemplate}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object copyFormTemplate(int idTemplate)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.copyTemplateForm(idTemplate);

                    return new object[] { true, Resources.idioma.GUARDADO_CORRECTAMENTE };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_formsController.copyFormTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error copiando " };
            }
        }

        /// <summary>
        /// RUNTIME : Crear o Modificar nuevo  formulario de RunTime
        /// </summary>
        [HttpPost]
        [Route("api/manualTrigger")]
        [ApiAuthorize(Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal,
                      Funciones.CEL_7_CreacionFormularioCEL, Funciones.SEM_8_CreacionFormularioSEM,
            Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM)]
        public object ManualTrigger(TemplatesLocForms relForm)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    var formTemplate = context.TemplatesForms.Single(t => t.ID == relForm.idTemForm);
                    Forms form = new Forms();
                    FormsMESData fMesData = new FormsMESData();
                    //INSERT. EL TEMPLATE ES NUEVO
                    //insert into dbo.inboxTrigger  (idTrigger, createdOn, name , typeID, attr01, attr02, location, turnoId)
                    //select tri.id, getdate(), tri.name, tri.typeID, tri.attr01, tri.attr02, tri.locID,  dbo.getturnoid(@hora)
                    form.idLocation = relForm.idLoc;
                    form.idFormTemplate = relForm.idTemForm;
                    form.triggerName = "MANUAL";
                    form.name = formTemplate.name;
                    form.descript = formTemplate.descript;
                    form.path = relForm.path;
                    form.statusID = "PENDIENTE";
                    form.isValid = 0;
                    form.createdOnUTC = DateTime.Now.ToUniversalTime();
                    form.FormTemplate = formTemplate.jsonTemplate;
                    XmlDocument xmlTemplate = JsonConvert.DeserializeXmlNode(formTemplate.jsonTemplate, "formTemplate");
                    form.FormTemplateXML = xmlTemplate.OuterXml;
                    form.StorageFiles = formTemplate.StorageFiles;
                    fMesData.location = "";

                    form.FormsMESData.Add(fMesData);

                    context.Forms.Add(form);
                    context.SaveChanges();

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "formsController.manualTrigger", "Creación manual de formulario. Área: " +
                        (relForm.TemplatesLocations.idDepartmentType == 0 ? IdiomaController.GetResourceName("CALIDAD") :
                        IdiomaController.GetResourceName("SEM")) + ". Punto de verificación: " + form.path +
                        ". Nombre: " + form.name, HttpContext.Current.User.Identity.Name);

                    return new object[] { true, Resources.idioma.ALT_NUEVA_INSTANCIA_FORMULARIO };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "formsController.ManualTrigger", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error en la creación " };
            }
        }

        /// <summary>
        /// RUNTIME. Obtiene todas las instancias de formularios en Runtime
        /// </summary>
        [HttpPost]
        [Route("api/RuntimeFormsByLoc/")]
        [ApiAuthorize(Funciones.CEL_4_VisualizacionFormulariosActivosCELPortal, Funciones.CEL_6_VisualizacionFormulariosActivosCELTerminal,
                      Funciones.SEM_4_VisualizacionFormulariosActivosSEMPortal, Funciones.SEM_6_VisualizacionFormulariosActivosSEMTerminal,
                      Funciones.CEL_13_VisualizacionHistoricoCEL, Funciones.SEM_11_VisualizacionHistoricoSEM)]
        public List<object> getFormsByLoc(dynamic filterData)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                //**get ALT filters**//
                DateTime fIni = DateTime.Now.AddMonths(-2);
                DateTime fFin = DateTime.Now.AddMonths(2);
                int idDepartmentType = filterData.idDepartmentType;

                if (filterData.inicio != null)
                {
                    fIni = ((DateTime)filterData.inicio);
                    fFin = ((DateTime)filterData.fin);
                }
                List<string> statusList = new List<string>();
                if ((bool)filterData.statusPendiente) statusList.Add("PENDIENTE");
                if ((bool)filterData.statusFinalizado) statusList.Add("FINALIZADO");

                List<int?> allLocsID = new List<int?>();
                if (filterData.idLoc == -1)
                {
                    // si es -1 la localización queremos mostrar todos los formularios que ya no tienen localización
                    List<int?> listaLocalBorradas = context.TemplatesLocations.AsNoTracking().Where(locationsController => locationsController.idDepartmentType == idDepartmentType && locationsController.TemplatesLocForms.Count() == 0).Select(t => (int?)t.ID).ToList();
                    allLocsID.AddRange(listaLocalBorradas);
                }
                else
                {
                    this.getLocationsChild((int?)filterData.idLoc, context.TemplatesLocations.AsNoTracking().Where(l => l.idDepartmentType == idDepartmentType).ToList(), allLocsID, idDepartmentType);
                }
                List<int> allFormsID = new List<int>();
                int? formID = (int?)filterData.idForm;

                var aux = context.Forms.AsNoTracking().Include("FormsMESData").Where(t =>
                    (formID == null || t.idFormTemplate == formID)
                    && t.createdOnUTC >= fIni && t.createdOnUTC <= fFin
                    && statusList.Any(x => x == t.statusID)
                    && allLocsID.Any(x => x == t.idLocation)
                );

                //**get MES Filters**//
                string orderTypeID = "";
                string orderID = "";
                string locationID = "";
                string turnoID = "";
                string shcID = "";
                string materialID = "";
                string lotID = "";

                if (filterData.infoSIT != null)
                {
                    orderTypeID = ((string)filterData.infoSIT.orderTypeID);
                    orderID = ((string)filterData.infoSIT.orderID);
                    locationID = ((string)filterData.infoSIT.locationID);
                    turnoID = ((string)filterData.infoSIT.turnoID);
                    shcID = ((string)filterData.infoSIT.shcID);
                    materialID = ((string)filterData.infoSIT.materialID);
                    lotID = ((string)filterData.infoSIT.lotID);
                }

                List<object> listObjects = new List<object>();
                foreach (Forms t in aux)
                {
                    string semaforoStatus = t.statusID == "PENDIENTE" ? "Azul" : "Verde";
                    string semaforoVal = string.Empty;

                    switch (t.isValid)
                    {
                        case 1:
                            semaforoVal = "Verde";
                            break;
                        case 2:
                            semaforoVal = "Amarillo";
                            break;
                        default:
                            semaforoVal = "Azul";
                            break;
                    }

                    //*FILTER DATA OF MES INFO
                    if (t.FormsMESData.Count() > 0)
                    {
                        FormsMESData formMesData = t.FormsMESData.First();
                        if (orderID != "" && formMesData.orderId != orderID)
                        {
                            continue;
                        }
                        if (orderTypeID != "" && formMesData.orderTypeId != orderTypeID)
                        {
                            continue;
                        }
                        if (locationID != "" && formMesData.location != locationID)
                        {
                            continue;
                        }
                        if (turnoID != "" && formMesData.turnoId != turnoID)
                        {
                            continue;
                        }
                        if (shcID != "" && formMesData.shcId != shcID)
                        {
                            continue;
                        }
                        if (materialID != "" && formMesData.materialId != materialID)
                        {
                            continue;
                        }
                        if (lotID != "" && formMesData.lotId != lotID)
                        {
                            continue;
                        }

                        DateTime lastModify = t.lastModifyUTC == null ? t.createdOnUTC.Value.ToLocalTime() : t.lastModifyUTC.Value.ToLocalTime();

                        //end filters
                        listObjects.Add(new { t.ID, createdOn = t.createdOnUTC.Value.ToLocalTime(), lastModify = lastModify, t.triggerName, t.statusID, 
                            t.isValid, t.errors, t.name, t.descript, formMesData.orderId, formMesData.orderTypeId, formMesData.location, 
                            formMesData.turnoId, formMesData.shcId, formMesData.materialId, formMesData.lotId, t.FormTemplate, t.FormValues, 
                            semaforoStatus = semaforoStatus, semaforoVal = semaforoVal, t.path });
                    }
                }

                return listObjects;
            }
        }

        /// <summary>
        /// RUNTIME. Obtiene todas las instancias de formularios en Runtime
        /// </summary>
        [HttpPost]
        [Route("api/checkNumberPendientesByLoc/")]
        public int checkNumberPendientesByLoc(dynamic filterData)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                try
                {
                    context.Configuration.ProxyCreationEnabled = false;

                    //**get ALT filters**//
                    DateTime fIni = DateTime.Now.AddDays(-20);
                    DateTime fFin = DateTime.Now.AddDays(1);
                    int idDepartment = (int)filterData.idDepartmentType;

                    List<int?> allLocsID = new List<int?>();
                    string strIdLoc = filterData.idLoc == null ? string.Empty : filterData.idLoc;
                    int? idLoc = strIdLoc == string.Empty ? null : (int?)Convert.ToInt32(strIdLoc);

                    this.getLocationsChild(idLoc, context.TemplatesLocations.AsNoTracking().ToList(), allLocsID, idDepartment);

                    var aux = context.Forms.AsNoTracking().Include("FormsMESData").Where(t => t.statusID == "PENDIENTE" && t.delete == false &&
                        t.createdOnUTC >= fIni && t.createdOnUTC <= fFin && allLocsID.Any(x => x == t.idLocation)).Count();

                    return aux;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "formsController.checkNumberPendientesByLoc", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                    return -1;
                }
            }
        }

        private void getLocationsChild(int? locID, List<TemplatesLocations> locations, List<int?> allLocsID, int idDepartmentType)
        {
            foreach (TemplatesLocations locChild in locations.Where(l => l.idDepartmentType == idDepartmentType && l.idParent == locID && l.deleted == false))
            {
                getLocationsChild(locChild.ID, locations, allLocsID, idDepartmentType);
            }

            allLocsID.Add(locID);
        }

        /// <summary>
        /// RUNTIME. borrar formulario
        /// </summary>
        [HttpDelete]
        [Route("api/RuntimeForms/{id}")]
        [ApiAuthorize(Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal
            , Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM)]
        public object deleteForm(int id)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    Forms form = context.Forms.FirstOrDefault(f => f.ID == id);
                    if (form != null)
                    {
                        context.Forms.Remove(form);
                        context.SaveChanges();
                    }
                }

                return new object[] { true, Resources.idioma.ALT_DELETE_FORM_OK };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "formsController.deleteForm", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, Resources.idioma.ALT_DELETE_FORM_ERROR };
            }
        }

        /// <summary>
        /// RUNTIME. Obtiene todas las instancias de formularios en Runtime
        /// </summary>
        [HttpPost]
        [Route("api/RuntimeForms")]
        [ApiAuthorize(Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal,
            Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM,
            Funciones.CEL_5_GestionFormulariosActivosCELTerminal, Funciones.SEM_5_GestionFormulariosActivosSEMTerminal)]
        public object setFormsValues(dynamic filterdata)
        {
            try
            {
                dynamic data = filterdata.formInstance;
                string statusTraza = filterdata.statusTraza;
                string formValuesTraza = filterdata.formValuesTraza;
                List<StorageFiles> newFiles = JsonConvert.DeserializeObject<List<StorageFiles>>(Convert.ToString(filterdata.formFiles));

                newFiles = newFiles ?? new List<StorageFiles>();

                var ID = 0;
                ID = data.ID;
                Forms form;

                using (FormsDBEnt context = new FormsDBEnt())
                {
                    try 
                    { 
                        form = context.Forms.Single(t => t.ID == ID);
                    }
                    catch
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("NO_EXISTE_FORM") + " con Id " + ID, 
                            "Alt_formsController.setFormsValues", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                        return new object[] { false, IdiomaController.GetResourceName("NO_EXISTE_FORM") };
                    }

                    //INSERT. EL TEMPLATE ES NUEVO
                    form.statusID = data.statusID;
                    form.isValid = data.isValid;
                    form.errors = data.errors;
                    form.createdOnUTC = ((DateTime)data.createdOn).ToUniversalTime();
                    form.lastModifyUTC = DateTime.Now.ToUniversalTime();
                    form.path = data.path;
                    form.FormValues = data.FormValues;
                    //form.FormValuesXML.
                    //form.formsSIT = new formsSIT();
                    FormsMESData fmd = form.FormsMESData.First();
                    fmd.orderId = "" + data.orderId;
                    fmd.orderTypeId = "" + data.orderTypeId;
                    fmd.turnoId = "" + data.turnoId;
                    fmd.shcId = "" + data.shcId;
                    fmd.lotId = "" + data.lotId;
                    fmd.materialId = "" + data.materialId;
                    fmd.location = "" + data.location;

                    XmlDocument xmlValues = JsonConvert.DeserializeXmlNode(form.FormValues, "formValues");
                    form.FormValuesXML = xmlValues.OuterXml;

                    //Save trazas
                    if (formValuesTraza != "")
                    {
                        FormsLog logValues = new FormsLog();
                        logValues.idForm = ID;
                        logValues.createdOn = DateTime.UtcNow;
                        logValues.type = "ALT_LOG_EDICION";
                        logValues.traza = formValuesTraza;
                        logValues.usuario = HttpContext.Current.User.Identity.Name;
                        context.FormsLog.Add(logValues);
                    }
                    if (statusTraza != "")
                    {
                        FormsLog logStatus = new FormsLog();
                        logStatus.idForm = ID;
                        logStatus.createdOn = DateTime.UtcNow;
                        logStatus.type = "ALT_LOG_ESTADO";
                        logStatus.traza = statusTraza;
                        logStatus.usuario = HttpContext.Current.User.Identity.Name;
                        context.FormsLog.Add(logStatus);
                    }

                    filesController.saveFilesInForm(form, newFiles, context);
                    context.SaveChanges();

                    return new object[] { true, Resources.idioma.ALT_ACTUALIZADO_FORMULARIO };
                }
            }
            catch (DbEntityValidationException ex)
            {
                string property = string.Empty;

                foreach (var entityValidationError in ex.EntityValidationErrors)
                {
                    foreach (var validationError in entityValidationError.ValidationErrors)
                    {
                        property = validationError.PropertyName;
                        var value = entityValidationError.Entry.CurrentValues.GetValue<object>(validationError.PropertyName);
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, "Property: " + property + ". Value: " + value + ". Error: " + 
                            validationError.ErrorMessage, "Alt_formsController.setFormsValues", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                    }
                }

                string error = property == "lotId" ? "Error en la actualización: LOTEADO PACK no puede superar los 64 caracteres " : "Error en la actualización ";
                return new object[] { false, error };
            }
            catch (Exception ex)
            {
                string mensajeError = ex.InnerException == null ? ex.Message : ex.InnerException.Message;
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, mensajeError + " -> " + ex.StackTrace, "Alt_formsController.setFormsValues", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error en la actualización " };
            }
        }

        /// <summary>
        /// Obtiene todos los cambios producidos en un formulario
        /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>      
        /// 
        [HttpGet]
        [Route("api/runTimeFormsChanges/{idForm}")]
        [ApiAuthorize(Funciones.CEL_4_VisualizacionFormulariosActivosCELPortal, Funciones.SEM_4_VisualizacionFormulariosActivosSEMPortal
            , Funciones.CEL_13_VisualizacionHistoricoCEL, Funciones.SEM_11_VisualizacionHistoricoSEM)]
        public List<object> getFormsChanges(int idForm)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;
                    var original = context.FormsLog.AsNoTracking().Where(t => t.idForm == idForm).ToList();
                    return original.Select(t => new { t.traza, t.type, t.usuario, createdOn = ((DateTime)t.createdOn).ToLocalTime() }).ToList<object>();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_formsController.getFormsChanges", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_OBTENER_CAMBIOS"));
            }
        }

        [Route("api/importForm/{idDepartmentType}")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object UploadFile(int idDepartmentType)
        {
            HttpRequestMessage request = new HttpRequestMessage();
            string formName;
            try
            {
                if (HttpContext.Current.Request.Files.AllKeys.Any())
                {
                    var pic = HttpContext.Current.Request.Files["fileUpload"];
                    HttpPostedFileBase filebase = new HttpPostedFileWrapper(pic);
                    string nameJson = Path.GetFileName(filebase.FileName);
                    //var type = filebase.ContentType.ToString();
                    if (!nameJson.Contains(".json"))
                    {
                        return new HttpResponseMessage(HttpStatusCode.NotAcceptable);
                    }
                    var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                    StreamReader sr = new StreamReader(filebase.InputStream);
                    //var jsonObject = serializer.DeserializeObject(sr.ReadToEnd());
                    TemplatesForms jsonObject = serializer.Deserialize<TemplatesForms>(sr.ReadToEnd());

                    using (FormsDBEnt context = new FormsDBEnt())
                    {
                        formName = jsonObject.name;
                        if (context.TemplatesForms.Where(f => f.name == jsonObject.name && f.idDepartmentType == idDepartmentType).Count() > 0)
                        {
                            return new object[] { false, Resources.idioma.ALT_NOMBRE_DUPLICADO + " '" + formName + "'" };
                        }

                        jsonObject.idDepartmentType = idDepartmentType;
                        jsonObject.deleted = false;
                        jsonObject.createdOnUTC = DateTime.UtcNow;
                        jsonObject.lastModifyUTC = DateTime.UtcNow;
                        XmlDocument xmlTemplate = JsonConvert.DeserializeXmlNode(jsonObject.jsonTemplate, "formTemplate");
                        jsonObject.xmlTemplate = xmlTemplate.OuterXml;

                        context.TemplatesForms.Add(jsonObject);
                        context.SaveChanges();
                    }
                }
                else
                {
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "Alt_formsController.UploadFile", "System.Web.HttpContext.Current.Request.Files.AllKeys.Any()=false", HttpContext.Current.User.Identity.Name);
                    return new object[] { false, Resources.idioma.ALT_ERROR_IMPORTANDO_FORMULARIO };
                }

                return new object[] { true, Resources.idioma.IMPORTACION_FORM_OK + " '" + formName + "'" };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_formsController.UploadFile", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error importando el formulario" };
            }
        }

        [Route("api/forms/analisisDatos")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_14_VisualizacionAnalisisDatosFormularios)]
        public async Task<IHttpActionResult> ObtenerFormulariosAnalisisDatos(DateTime fechaDesde, DateTime fechaHasta, string pdv, string nombreForm)
        {
            try
            {
                var result = await _iDAOForms.ObtenerFormulariosAnalisisDatos(fechaDesde, fechaHasta, pdv, nombreForm);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "formsController.ObtenerFormulariosAnalisisDatos", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_FORMULARIOS"));
            }
        }

        [Route("api/forms/nombreFormPorPDV")]
        [HttpGet]
        [ApiAuthorize(Funciones.CEL_14_VisualizacionAnalisisDatosFormularios)]
        public async Task<IHttpActionResult> ObtenerNombreFormPorPDV(string pdv)
        {
            try
            {
                var result = await _iDAOForms.ObtenerNombreFormPorPDV(pdv);

                return Json(result);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "formsController.ObtenerNombreFormPorPDV", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);

                return BadRequest(IdiomaController.GetResourceName("ERROR_OBTENER_FORMULARIOS"));
            }
        }
    }
}