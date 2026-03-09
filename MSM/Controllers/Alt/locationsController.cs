using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Alt
{
    [Authorize]
    public class locationsController : ApiController
    {
        public class TemplateLocationDto
        {
            public int ID { get; set; }
            public string shortName { get; set; }
            public string name { get; set; }
            public string descript { get; set; }
            public int? idParent { get; set; }
            public bool? idSITInherit { get; set; }
            public string idSITLoc { get; set; }
        }

        /// <summary>
        /// Obtiene todas las localizaciones de un departamento [CEL, O SEO] 
        /// /// </summary> 
        [HttpGet]
        [Route("api/TemplatesLocations/{idDepartmentType}")]
        [AllowAnonymous]
        //[ApiAuthorize(Funciones.CEL_2_VisualizacionConfiguracionCEL, Funciones.SEM_2_VisualizacionConfiguracionSEM)]
        public List<TemplateLocationDto> getTemplatesLocations(int idDepartmentType)
        {
            try
            {
                using (var context = new FormsDBEnt())
                {
                    return context.TemplatesLocations
                        .AsNoTracking()
                        .Where(t => t.idDepartmentType == idDepartmentType && !t.deleted.Value)
                        .Select(t => new TemplateLocationDto
                        {
                            ID = t.ID,
                            shortName = t.shortName,
                            name = t.name,
                            descript = t.descript,
                            idParent = t.idParent,
                            idSITInherit = t.idSITInherit,
                            idSITLoc = t.idSITLoc
                        })
                        .ToList();
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message,
                    "locationsController.getTemplatesLocations", "WEB-CALIDAD",
                    HttpContext.Current.User.Identity.Name);

                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOCALIZACIONES"));
            }
        }

        /// <summary>
        /// Obtiene todas las localizaciones de TODOS los departamentos
        /// /// </summary> 
        [HttpGet]
        [Route("api/TemplatesLocationsAll")]
        [AllowAnonymous]
        //[ApiAuthorize(Funciones.ALT_CONF, Funciones.ALT_HISTORIAN, Funciones.ALT_RUNTIME)]
        public List<object> getAllTemplatesLocations()
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;
                    var result = context.TemplatesLocations.AsNoTracking().Where(t => t.deleted == false).Select(t => new { t.ID, t.shortName, t.name, t.descript, t.idParent, t.idSITInherit, t.idSITLoc }).ToList<object>();                  
                    return result;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "locationsController.getAllTemplatesLocations", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOCALIZACIONES"));
            }
        }

        /// <summary>
        /// Crear o Modificar nueva plantilla de formulario
        /// </summary>
        [HttpDelete]
        [Route("api/TemplatesLocations/{idTem}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object borrarLocation(int idTem)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    //delete Childs
                    IEnumerable<TemplatesLocations> childs = context.TemplatesLocations.Where(t => t.idParent == idTem);
                    foreach (TemplatesLocations loc in childs)
                    {
                        this.borrarLocation((int)loc.ID);
                    }
                    //delete parent
                    var original = context.TemplatesLocations.Single(t => t.ID == idTem);                  
                    original.deleted = true;
                    original.TemplatesLocForms.ToList().ForEach(lf =>
                    {
                        original.TemplatesLocForms.Remove(lf);
                    });
                    context.SaveChanges();
                }
               
                return new object[] { true, Resources.idioma.BORRADO_CORRECTAMENTE };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_locationsController.borrarLocation", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error borrando el punto de verificación" };
            }
        }
        
        /// <summary>
        /// Crear o Modificar nueva plantilla de formulario
        /// </summary>
        [HttpPost]
        [Route("api/TemplatesLocations")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object CrearModifLocationTemplate(TemplatesLocations newTemplate)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    if (newTemplate.ID >= 0)
                    {
                        //UPDATE. EL REGISTRO EXISTE Y HAY QUE MODIFICARLO
                        var original = context.TemplatesLocations.Single(t => t.ID == newTemplate.ID);
                        original.name = newTemplate.name;
                        
                        original.shortName = newTemplate.shortName;
                        original.idSITLoc = newTemplate.idSITLoc;
                        original.idSITInherit = newTemplate.idSITInherit;
                        original.descript = newTemplate.descript;
                        original.deleted = false;
                        original.lastUpdatedUTC = DateTime.UtcNow;
                    }
                    else
                    {
                        //INSERT. EL TEMPLATE ES NUEVO   
                        //comprobamos que no exista una localización con elmismo nombre
                        if(context.TemplatesLocations.Where(loc => loc.deleted == false && loc.name == newTemplate.name && loc.idDepartmentType == newTemplate.idDepartmentType).Count() > 0){
                       
                            return new object[] { false, Resources.idioma.ALT_ERROR_LOCATION_REPEAT };
                        }
                        
                        newTemplate.deleted = false;
                        newTemplate.createdOnUTC = DateTime.UtcNow;
                        context.TemplatesLocations.Add(newTemplate);
                    }
                    
                    context.SaveChanges();
                    return new object[] { true, Resources.idioma.GUARDADO_CORRECTAMENTE };
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "locationsController.CrearModifLocationTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, newTemplate.ID >= 0 ? "Error al modificar el punto de verificación" : "Error al crear el punto de verificación " };
            }
        }

        /////////////////////////////////////////////////////////
        ///////////******* TEMPLATELOCFORMS********/////////////
        ///////////////////////////////////////////////////////

        /// <summary>
        /// Obtiene relaciones entre formularios y localizaciones
        /// /// </summary>
        [HttpGet]
        [Route("api/TemplatesLocForms")]
        [ApiAuthorize(Funciones.CEL_2_VisualizacionConfiguracionCEL, Funciones.SEM_2_VisualizacionConfiguracionSEM,
                      Funciones.CEL_4_VisualizacionFormulariosActivosCELPortal, Funciones.SEM_4_VisualizacionFormulariosActivosSEMPortal,
                      Funciones.CEL_13_VisualizacionHistoricoCEL, Funciones.SEM_11_VisualizacionHistoricoSEM)]
        public List<object> getRelLocForms()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                return context.vTemplatesLocForms.AsNoTracking().Select(t => new { t.idLoc, t.idTemForm, t.name, t.descript, t.path }).ToList<object>();
            }
        }
        
        /// <summary>
        /// Borrar relación entre formulario y localización
        /// </summary>
        [HttpDelete]
        [Route("api/TemplatesLocForms")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object borrarRelLocForm(TemplatesLocForms temp)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    //delete parent
                    var original = context.TemplatesLocForms.Single(t=> t.idLoc == temp.idLoc && t.idTemForm == temp.idTemForm);
                    
                    context.TemplatesLocForms.Remove(original);
                    context.SaveChanges();
                }
           
                return new object[] { true, Resources.idioma.BORRADO_CORRECTAMENTE};
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_locationsController.borrarRelLocForm", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error borrando el elemento" };
            }
        }
        /// <summary>
        /// Vincular o Desvincular relaciones entre formulario - localización
        /// pasando como parametro array de IDs de forms
        /// </summary>
        [HttpPost]
        [Route("api/TemplatesLocForms/{idLoc}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object crearRelLocForm(int idLoc, IEnumerable<TemplatesLocForms> listNewTemplates)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {   
                    //Borramos los idS que ya no estan en la nueva relacion
                    var listNuevos = listNewTemplates.Select(t => t.idTemForm).ToList<int>();                   
                    var relationsOld = context.TemplatesLocForms.Where(t => t.idLoc == idLoc);
                    
                    foreach(TemplatesLocForms rel in relationsOld){
                        if (!listNuevos.Contains(rel.idTemForm)) context.TemplatesLocForms.Remove(rel);                      
                    }

                    //Insertamos únicamente los nuevos
                    var listViejos = relationsOld.Select(t => t.idTemForm).ToList<int>();  
                    foreach(TemplatesLocForms rel in listNewTemplates)
                    {
                        if (!listViejos.Contains(rel.idTemForm)) context.TemplatesLocForms.Add(rel);
                    }

                    context.SaveChanges();
                    return new object[] { true, Resources.idioma.GUARDADO_CORRECTAMENTE }; 
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "Alt_locationsController.crearRelLocForm", "WEB-ALT", "Sistema");
                return new object[] { false, "Error en la edición" };
            }
        }

        //////////////////////////////////////////////////////////
        ///////////******* TEMPLATELOCFORMTRIGGERS********////////
        //////////////////////////////////////////////////////////
        
        [HttpGet]
        [Route("api/TemplatesLocFormTri")]
        [ApiAuthorize(Funciones.CEL_2_VisualizacionConfiguracionCEL, Funciones.SEM_2_VisualizacionConfiguracionSEM,
                      Funciones.CEL_4_VisualizacionFormulariosActivosCELPortal, Funciones.SEM_4_VisualizacionFormulariosActivosSEMPortal,
                      Funciones.CEL_13_VisualizacionHistoricoCEL, Funciones.SEM_11_VisualizacionHistoricoSEM)]
        public List<object> getRelLocFormsTri()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                return context.vTemplatesLocFormTri.AsNoTracking().Select(t => new { t.idLoc, t.idTemForm, t.idTrigger, t.name, t.descript }).ToList<object>();
            }
        }

        /// <summary>
        /// Borrar relación entre formulario y localización
        /// </summary>
        [HttpDelete]
        [Route("api/TemplatesLocFormTri")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object borrarRelLocFormTri(vTemplatesLocFormTri temp)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    //delete parent
                    var parentForm = context.TemplatesLocForms.Single(t => t.idLoc == temp.idLoc && t.idTemForm == temp.idTemForm );
                    var original = parentForm.TemplatesTriggers.Single(t => t.ID == temp.idTrigger);
                    parentForm.TemplatesTriggers.Remove(original);
                    context.SaveChanges();
                }
              
                return new object[] { true, Resources.idioma.BORRADO_CORRECTAMENTE};
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_locationsController.borrarRelLocFormTri", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error borrando el elemento" };
            }
        }

        /// <summary>
        /// Crear una relacion formulario - localización -trigger
        /// </summary>
        [HttpPost]
        [Route("api/TemplatesLocFormTri/{idLoc}/{idTemForm}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object crearRelLocFormTri(int idLoc, int idTemForm, List<int> listNewRel)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    //Comprobamos que si hay algún trigger de tipo MATERIAL que no exista un trigger relacionado para la misma clase 
                    List<TemplatesTriggers> listaTriggersActualesLoc = context.TemplatesTriggers.Where(x => x.typeID =="MATERIAL" && listNewRel.Any(y => x.ID == y)).ToList();
                    List<string> clasesTriggersGenericos = listaTriggersActualesLoc.Where(t => t.attr02 == "").Select(t=>t.attr01).ToList();
                    List<string> clasesTriggersEspecificos = listaTriggersActualesLoc.Where(t => t.attr02 != "").Select(t=>t.attr01).ToList();
                    bool isOk = true;
                    clasesTriggersEspecificos.ForEach(tespe =>
                    {
                        if (clasesTriggersGenericos.Contains(tespe))
                            isOk = false;
                
                    });
                    if(!isOk)
                         return new object[] { false , Resources.idioma.ALT_ERROR_TRIG_MATERIALES_MISMA_CLASE };
                
                    //INSERT. EL TEMPLATE ES NUEVO    
                    var original = context.TemplatesLocForms.Include("TemplatesTriggers").Single(t => t.idLoc == idLoc && t.idTemForm == idTemForm);
                    var items2DEL = original.TemplatesTriggers.Where(x => !listNewRel.Any(y => x.ID == y)).ToList();

                    List<int> listOldRel = original.TemplatesTriggers.Select(t => t.ID).ToList<int>();
                    var items2ADD = context.TemplatesTriggers.Where(x => !listOldRel.Any(y => x.ID == y) && listNewRel.Any(y => x.ID == y)).ToList();
                 
                    foreach (TemplatesTriggers t in items2DEL)
                    {                      
                        original.TemplatesTriggers.Remove(t);
                    }
                    foreach (TemplatesTriggers idTri in items2ADD)
                    {
                        //var templateTrigger = context.TemplatesTriggers.Single(t=>t.ID == idTri);
                        original.TemplatesTriggers.Add(idTri);
                    }               

                    context.SaveChanges();
                    
                    return new object[] { true, Resources.idioma.GUARDADO_CORRECTAMENTE};
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "Alt_locationsController.crearRelLocFormTri", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error en la creación " };
            }
        }
    }
}