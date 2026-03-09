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
    public class triggersController : ApiController
    {
        /// <summary>
        /// Obtiene relaciones entre formularios y localizaciones
        /// /// </summary>
        [HttpGet]
        [Route("api/TemplatesTriggersByLocForm/{idLoc}/{idTemForm}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getRelLocFormsByLoc(int idLoc, int idTemForm)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;

                var original = context.TemplatesLocForms.AsNoTracking().Include("TemplatesTriggers").Single(t => t.idLoc == idLoc && t.idTemForm == idTemForm);

                return original.TemplatesTriggers.Select(tigger => new { tigger.ID, tigger.name, tigger.descript }).ToList<object>();
            }
        }
        /// <summary>
        /// Obtiene todos los formularios que están por debajo de una localización, si le pasamos el id root (Planta) devolverá todas 
        /// /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>        
        [HttpGet]
        [Route("api/TemplatesTriggers/{idDepartmentType}")]
        [ApiAuthorize(Funciones.CEL_2_VisualizacionConfiguracionCEL, Funciones.SEM_2_VisualizacionConfiguracionSEM)]
        public List<object> formsByLoc(int idDepartmentType)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
               
                return context.TemplatesTriggers.AsNoTracking().Where(t => t.idDepartmentType == idDepartmentType && t.deleted == false).ToList().Select(t => new
                {
                    t.ID,
                    t.name,
                    t.descript,
                    t.attr01,
                    t.attr02,
                    t.attrPlannedShiftActive,
                    t.attrPlannedOrderActive,
                    t.attrPlannedType,
                    //t.attrPlannedOnce, 
                    attrPlannedOnce = t.attrPlannedOnce != null ? t.attrPlannedOnce.Value.ToLocalTime() : t.attrPlannedOnce,
                    t.attrPlannedDays,
                    t.attrPlannedWeeks,
                    t.attrPlannedWeekDays,
                    t.attrPlannedMonthIsHourly,
                    t.attrPlannedMonthDay,
                    t.attrPlannedMonthFrec,
                    t.attrPlannedMonthNumDay,
                    t.attrPlannedMonthDayWeek,
                    t.attrFrecuencyIsCycle,
                    t.attrFrecuencyHour,
                    t.attrFrecuencyQuantity,
                    t.attrFrecuencyUnits,
                    t.attrFrecuencyFrom,
                    t.attrFrecuencyTo,
                    t.attrValidHasUntil,
                    //t.attrValidFrom, 
                    attrValidFrom = t.attrValidFrom != null ? t.attrValidFrom.Value.ToLocalTime() : t.attrValidFrom,
                    //t.attrValidUntil, 
                    attrValidUntil = t.attrValidUntil != null ? t.attrValidUntil.Value.ToLocalTime() : t.attrValidUntil,
                    t.typeID,
                    t.locID,
                    createdOn = t.createdOnUTC.Value.ToLocalTime(),
                    t.status,
                    semaforo = (t.status == 1 ? "Verde" : "Gris")
                }).ToList<object>(); 
            }
        }
        /// <summary>
        /// Borrar plantilla de formulario
        /// </summary>
        [HttpDelete]
        [Route("api/TemplatesTriggers/{idTem}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object BorrarTriggerTemplate(int idTem)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    TemplatesTriggers original = context.TemplatesTriggers.Single(t => t.ID == idTem);
                    original.deleted = true;
                    original.TemplatesLocForms.ToList<TemplatesLocForms>().ForEach(t =>{
                        original.TemplatesLocForms.Remove(t); //borramos la relacion de la tabla 
                    });                    
                    context.SaveChanges();
                }

                return new object[] { true, IdiomaController.GetResourceName("BORRADO_CORRECTAMENTE") };
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "triggersController.BorrarTriggerTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, "Error borrando el evento" };
            }
        }

        /// <summary>
        /// Crear o Modificar nueva plantilla de formulario
        /// </summary>
        [HttpPost]
        [Route("api/TemplatesTriggers")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object CrearModifTriggerTemplate(TemplatesTriggers newTemplate)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    if (newTemplate.ID >= 0)
                    {
                        //UPDATE. EL REGISTRO EXISTE Y HAY QUE MODIFICARLO
                        var original = context.TemplatesTriggers.Single(t => t.ID == newTemplate.ID);
                        original.name = newTemplate.name;
                        original.typeID = newTemplate.typeID;
                        original.descript = newTemplate.descript;
                        original.status = newTemplate.status;
                        original.attr01 = newTemplate.attr01;
                        original.attr02 = newTemplate.attr02;
                        original.attrPlannedShiftActive = newTemplate.attrPlannedShiftActive;
                        original.attrPlannedOrderActive = newTemplate.attrPlannedOrderActive;
                        original.attrPlannedType=newTemplate.attrPlannedType;
                        original.attrPlannedOnce= newTemplate.attrPlannedOnce;
                        original.attrPlannedDays = newTemplate.attrPlannedDays;
                        original.attrPlannedWeeks = newTemplate.attrPlannedWeeks;
                        original.attrPlannedWeekDays = newTemplate.attrPlannedWeekDays;
                        original.attrPlannedWeekDays = newTemplate.attrPlannedWeekDays;
                        original.attrPlannedMonthIsHourly = newTemplate.attrPlannedMonthIsHourly;
                        original.attrPlannedMonthDay = newTemplate.attrPlannedMonthDay;
                        original.attrPlannedMonthFrec = newTemplate.attrPlannedMonthFrec;
                        original.attrPlannedMonthNumDay = newTemplate.attrPlannedMonthNumDay;
                        original.attrPlannedMonthDayWeek = newTemplate.attrPlannedMonthDayWeek;
                        original.attrFrecuencyIsCycle = newTemplate.attrFrecuencyIsCycle;
                        original.attrFrecuencyHour = newTemplate.attrFrecuencyHour;
                        original.attrFrecuencyQuantity = newTemplate.attrFrecuencyQuantity;
                        original.attrFrecuencyUnits = newTemplate.attrFrecuencyUnits;
                        original.attrFrecuencyFrom = newTemplate.attrFrecuencyFrom;
                        original.attrFrecuencyTo = newTemplate.attrFrecuencyTo;
                        original.attrValidHasUntil = newTemplate.attrValidHasUntil;
                        original.attrValidFrom = newTemplate.attrValidFrom;
                        original.attrValidUntil = newTemplate.attrValidUntil;
                        original.lastModifyUTC = DateTime.Now.ToUniversalTime();
                        original.locID = newTemplate.locID;
                        original.deleted = false;
                    }
                    else
                    {
                        //INSERT. EL TEMPLATE ES NUEVO
                        newTemplate.createdOnUTC = DateTime.Now.ToUniversalTime();
                        newTemplate.deleted = false;
                        context.TemplatesTriggers.Add(newTemplate);
                    }

                    context.SaveChanges();
                    
                    return new object[] { true, IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE") };
                }
                
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "triggersController.CrearModifTriggerTemplate", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                return new object[] { false, newTemplate.ID >= 0 ? "Error al modificar el evento" : "Error al crear el evento " };
            }
        }
        /// <summary>
        /// Obtiene los tipos de órdenes de SIT 
        /// /// </summary>     
        [HttpGet]
        [Route("api/getOrdersTypes")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getOrdersTypes()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                //el nombre lo pondremos en el lado del cliente dependiendo el idioma seleccionado
                context.Configuration.ProxyCreationEnabled = false;
                return context.SIT_Orders_Types.AsNoTracking().ToList().Select(t => new { id = t.id, name = "" }).OrderBy(t => t.name).ToList<object>();
            }
        }
        /// <summary>
        /// Obtiene los status posibles de órdenes de SIT 
        /// /// </summary>     
        [HttpGet]
        [Route("api/getOrdersStatus")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getOrdersStatus()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                //el nombre lo pondremos en el lado del cliente dependiendo el idioma seleccionado
                context.Configuration.ProxyCreationEnabled = false;
                return context.SIT_Orders_Status.AsNoTracking().ToList().Select(t => new { id = t.id, name = "" }).OrderBy(t=> t.name).ToList<object>();
            }
        }
        /// <summary>
        /// Obtiene los status posibles de órdenes de cambio y de arranque de SIT 
        /// /// </summary>     
        [HttpGet]
        [Route("api/getOrdersStatusArranqueCambio")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getOrdersStatusArranqueCambio()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                return context.SIT_Orders_Status_Arranques_Cambios.AsNoTracking().ToList().Select(t => new { id = t.id, name = "" }).OrderBy(t => t.name).ToList<object>();
            }
        }
        /// <summary>
        /// Obtiene las clases posibles de SIT
        /// /// </summary>     
        [HttpGet]
        [Route("api/getClasses")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getClasses()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                return context.SIT_Materiales.AsNoTracking().Select(t => new { t.IdClase, t.Clase }).Distinct().ToList<object>();
            }
        }
        /// <summary>
        /// Obtiene las definiciones posibles de SIT
        /// /// </summary>     
        [HttpGet]
        [Route("api/getDefinitions/{idClass}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getDefinitions(string idClass)
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                context.Configuration.ProxyCreationEnabled = false;
                return context.SIT_Materiales.AsNoTracking().Where(m => m.IdClase == idClass).Select(t => new { t.IdMaterial, t.Nombre }).Distinct().ToList<object>();
            }
        }
    }
}