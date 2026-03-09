using MSM.BBDD.Envasado.GestionAlertas;
using MSM.BBDD.Model;
using MSM.DTO.Envasado;
using MSM.Mappers.DTO.Envasado;
using MSM.Security;
using System.Collections.Generic;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class GestionAlertasController : ApiController
    {
        #region GRUPOS

        [Route("api/MailGroup_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionGruposGestionAlertas)]
        public bool MailGroup_Create(MailGroup mailGroup)
        {
            return DAO_GestionAlertas.MailGroup_Create(mailGroup);
        }

        [Route("api/MailGroup_Read")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionGruposGestionAlertas, Funciones.ENV_PROD_EXE_1_VisualizacionGruposGestionAlertas)]
        public List<MailGroup> MailGroup_Read()
        {
            return DAO_GestionAlertas.MailGroup_Read();
        }

        [Route("api/MailGroup_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionGruposGestionAlertas)]
        public bool MailGroup_Update(MailGroup mailGroup)
        {
            return DAO_GestionAlertas.MailGroup_Update(mailGroup);
        }

        [Route("api/MailGroup_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_1_GestionGruposGestionAlertas)]
        public bool MailGroup_Delete(MailGroup mailGroup)
        {
            return DAO_GestionAlertas.MailGroup_Delete(mailGroup.Id);
        }
        #endregion 

        #region ALERTAS

        [Route("api/MailNotification_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_GestionGestionAlertas)]
        public bool MailNotification_Create(DTO_MailNotification mailNotification)
        {
            return DAO_GestionAlertas.MailNotification_Create(mailNotification);
        }

        [Route("api/MailNotification_Read")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_GestionGestionAlertas, Funciones.ENV_PROD_EXE_2_VisualizacionGestionAlertas)]
        public List<DTO_MailNotification> MailNotification_Read()
        {
            return DAO_GestionAlertas.MailNotification_Read();
        }

        [Route("api/MailNotification_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_GestionGestionAlertas)]
        public bool MailNotification_Update(DTO_MailNotification mailNotification)
        {
            return DAO_GestionAlertas.MailNotification_Update(mailNotification);
        }

        [Route("api/MailNotification_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_GestionGestionAlertas)]
        public bool MailNotification_Delete(DTO_MailNotification mailNotification)
        {
            return DAO_GestionAlertas.MailNotification_Delete(mailNotification.Id);
        }

        [Route("api/MailNotification_TestMail/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_2_GestionGestionAlertas)]
        public void TestConnectionSMTP(int id)
        {
            string pathHTML = System.Web.HttpContext.Current.Server.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
            DAO_GestionAlertas.MailNotification_TestMail(id, pathHTML);
        }
        #endregion

        #region MALA GESTION WO

        [Route("api/MailMalaGestionWO_Read")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO, Funciones.ENV_PROD_EXE_51_VisualizacionEnviosEmailWO)]
        public List<DTO_MailMalaGestionWO> MailMalaGestionWO_Read()
        {
            return DAO_GestionAlertas.MailMalaGestionWO_Read();
        }

        [Route("api/MailMalaGestionWO_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public bool MailMalaGestionWO_Create(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            return DAO_GestionAlertas.MailMalaGestionWO_Create(mailMalaGestionWO);
        }

        [Route("api/MailMalaGestionWO_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public bool MailMalaGestionWO_Update(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            return DAO_GestionAlertas.MailMalaGestionWO_Update(mailMalaGestionWO);
        }

        [Route("api/MailMalaGestionWO_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public bool MailMalaGestionWO_Delete(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            return DAO_GestionAlertas.MailMalaGestionWO_Delete(mailMalaGestionWO.Id);
        }

        [Route("api/MailMalaGestionWO_TestMail/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public void MailMalaGestionWO_TestMail(int id)
        {
            string pathHTML = System.Web.HttpContext.Current.Server.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
            DAO_GestionAlertas.MailMalaGestionWO_TestMail(id, pathHTML);
        }
        #endregion

        #region PARTES CALIDAD NO VALIDOS

        [Route("api/MailPartesCalidadNoValidos_Read")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_56_GestionEmailsPartesCalidadNoValidos, Funciones.ENV_PROD_EXE_56_VisualizacionEmailsPartesCalidadNoValidos)]
        public List<DTO_MailPartesCalidadNoValidos> MailPartesCalidadNoValidos_Read()
        {
            return DAO_GestionAlertas.MailPartesCalidadNoValidos_Read();
        }

        [Route("api/MailPartesCalidadNoValidos_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_56_GestionEmailsPartesCalidadNoValidos)]
        public bool MailPartesCalidadNoValidos_Create(DTO_MailPartesCalidadNoValidos mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadNoValidos_Create(mailParteCalidad);
        }

        [Route("api/MailPartesCalidadNoValidos_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_56_GestionEmailsPartesCalidadNoValidos)]
        public bool MailPartesCalidadNoValidos_Update(DTO_MailPartesCalidadNoValidos mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadNoValidos_Update(mailParteCalidad);
        }

        [Route("api/MailPartesCalidadNoValidos_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_56_GestionEmailsPartesCalidadNoValidos)]
        public bool MailPartesCalidadNoValidos_Delete(DTO_MailPartesCalidadNoValidos mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadNoValidos_Delete(mailParteCalidad.IdMailParteCalidad);
        }

        [Route("api/MailPartesCalidadNoValidos_TestMail/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public void MailPartesCalidadNoValidos_TestMail(int id)
        {
            string pathHTML = System.Web.HttpContext.Current.Server.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
            DAO_GestionAlertas.MailPartesCalidadNoValidos_TestMail(id, pathHTML);
        }

        #endregion

        #region PARTES CALIDAD PENDIENTES

        [Route("api/MailPartesCalidadPendientes_Read")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_58_GestionEmailsPartesCalidadPendientes, Funciones.ENV_PROD_EXE_58_VisualizacionEmailsPartesCalidadPendientes)]
        public List<DTO_MailPartesCalidadPendientes> MailPartesCalidadPendientes_Read()
        {
            return DAO_GestionAlertas.MailPartesCalidadPendientes_Read();
        }

        [Route("api/MailPartesCalidadPendientes_Create")]
        [HttpPost]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_58_GestionEmailsPartesCalidadPendientes)]
        public bool MailPartesCalidadPendientes_Create(DTO_MailPartesCalidadPendientes mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadPendientes_Create(mailParteCalidad);
        }

        [Route("api/MailPartesCalidadPendientes_Update")]
        [HttpPut]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_58_GestionEmailsPartesCalidadPendientes)]
        public bool MailPartesCalidadPendientes_Update(DTO_MailPartesCalidadPendientes mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadPendientes_Update(mailParteCalidad);
        }

        [Route("api/MailPartesCalidadPendientes_Delete")]
        [HttpDelete]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_58_GestionEmailsPartesCalidadPendientes)]
        public bool MailPartesCalidadPendientes_Delete(DTO_MailPartesCalidadPendientes mailParteCalidad)
        {
            return DAO_GestionAlertas.MailPartesCalidadPendientes_Delete(mailParteCalidad.IdMailParteCalidad);
        }

        [Route("api/MailPartesCalidadPendientes_TestMail/{id}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ENV_PROD_EXE_50_GestionEnviosEmailWO)]
        public void MailPartesCalidadPendientes_TestMail(int id)
        {
            string pathHTML = System.Web.HttpContext.Current.Server.MapPath("~/Portal/Administracion/html/FormatoHTMLMail.html");
            DAO_GestionAlertas.MailPartesCalidadPendientes_TestMail(id, pathHTML);
        }

        #endregion
    }
}