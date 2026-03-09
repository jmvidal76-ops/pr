using MSM.BBDD.Alt;
using MSM.BBDD.Planta;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Alt
{
    public class filesController : ApiController
    {

        [HttpGet]
        [Route("api/ALTgetFormsFilesV2/{idForm}")]
        [ApiAuthorize(Funciones.CEL_3_GestionFormulariosActivosCELPortal, Funciones.SEM_3_GestionFormulariosActivosSEMPortal, 
            Funciones.CEL_12_GestionHistoricoCEL, Funciones.SEM_10_GestionHistoricoSEM, 
            Funciones.CEL_5_GestionFormulariosActivosCELTerminal, Funciones.SEM_5_GestionFormulariosActivosSEMTerminal)]
        public List<object> getFormsFilesV2(int idForm)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;

                    return context.Forms.AsNoTracking().Include("StorageFiles").Single(t => t.ID == idForm).StorageFiles.Select(t => new { t.ID, t.fieldName, t.uploadOn, t.name, t.size, t.extension, t.type }).ToList<object>();
                }
            }
            catch (Exception ex)
            {
                switch (ex.HResult)
                {
                    case -2146233079:
                        //no data
                        return new List<object>();
                    default:
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message, "filesController.getFormsFilesV2", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                        throw new Exception(ex.Message);
                }
            }
        }

        [HttpGet]
        [Route("api/ALTgetFilesTemplate/{idTemplate}")]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public List<object> getTemplateFiles(int idTemplate)
        {
            try
            {
                using (FormsDBEnt context = new FormsDBEnt())
                {
                    context.Configuration.ProxyCreationEnabled = false;

                    return context.TemplatesForms.AsNoTracking().Include("StorageFiles").Single(t => t.ID == idTemplate).StorageFiles.Select(t => new { t.ID, t.fieldName, t.uploadOn, t.name, t.size, t.extension, t.type }).ToList<object>();
                }
            }
            catch (Exception ex)
            {
                switch (ex.HResult)
                {
                    case -2146233079:
                        //no data
                        return new List<object>();
                    default:
                        throw new Exception(ex.Message);
                }

            }
        }
       
        [Route("api/ALTDownloadFileV2")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public string DownloadFileV2(dynamic filterdata)
        {
            int idFile = filterdata.idFile;
            List<StorageFiles> files = new List<StorageFiles>();

            using (FormsDBEnt context = new FormsDBEnt())
            {
                files = context.StorageFiles.AsNoTracking().Where(f => f.ID == idFile).ToList();
            }
            
            if (files.Count() > 0)
                return Convert.ToBase64String(files.First().documento);

            return null;
        }

        [Route("api/ALTuploadFileV2/{fieldName}")]
        [HttpPost]
        [ApiAuthorize(Funciones.CEL_1_GestionConfiguracionCEL, Funciones.SEM_1_GestionConfiguracionSEM)]
        public object UploadFileV2(string fieldName)
        {
            HttpResponseMessage _returnValue;
            HttpRequestMessage request = new HttpRequestMessage();
            try
            {
                if (HttpContext.Current.Request.Files.AllKeys.Any())
                {
                    StorageFiles newFile = new StorageFiles();
                    //get DATA
                    newFile.fieldName = fieldName;
                    var file = HttpContext.Current.Request.Files["files"];
                    HttpPostedFileBase filebase = new HttpPostedFileWrapper(file);
                    newFile.name = Path.GetFileName(filebase.FileName);
                    newFile.extension = Path.GetExtension(filebase.FileName);
                    newFile.type = filebase.ContentType.ToString();
                    newFile.size = file.ContentLength;
                    newFile.uploadOn = DateTime.UtcNow;
                    /* if ( newFile.size > 5000000) //5 MB máximo
                     {
                         return new HttpResponseMessage(HttpStatusCode.NotAcceptable);
                     }*/
                    using (var reader = new BinaryReader(filebase.InputStream))
                    {
                        newFile.documento = reader.ReadBytes(filebase.ContentLength);
                    }
                    //save DATA
                    using (FormsDBEnt context = new FormsDBEnt())
                    {
                        context.StorageFiles.Add(newFile);
                        context.SaveChanges();
                    }

                    return new { newFile.ID, newFile.fieldName, newFile.uploadOn, newFile.name, newFile.size, newFile.extension, newFile.type };
                    //string json = JsonConvert.SerializeObject(new { newFile.ID, newFile.fieldName, newFile.uploadOn, newFile.name, newFile.size, newFile.extension, newFile.type });
                    //_returnValue = new HttpResponseMessage(HttpStatusCode.OK);
                    //_returnValue.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                }
                else
                {
                    _returnValue = new HttpResponseMessage(HttpStatusCode.NoContent);
                }
            }
            catch (Exception ex)
            {
                switch (ex.HResult)
                {
                    case -2147467259: //Maximum request length exceeded.
                        _returnValue = new HttpResponseMessage(HttpStatusCode.NotAcceptable);
                        break;
                    case -2146233087: //duplicado en la BD
                        _returnValue = new HttpResponseMessage(HttpStatusCode.Conflict);
                        break;
                    default:
                        _returnValue = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                        break;
                }
            }

            return _returnValue;
        }

        static internal bool saveFilesInTemplate(TemplatesForms template2Update, List<StorageFiles> newFiles, FormsDBEnt context)
        {
            // template2Update contiene los archivos viejos
            // Revisamos si ha habido nuevos arhicos y actualizaremos.
            List<StorageFiles> files2Remove = new List<StorageFiles>();
            foreach (StorageFiles oldFile in template2Update.StorageFiles) {
                StorageFiles newF = newFiles.Find(f => f.ID == oldFile.ID);
                if (newF == null)
                {
                    //El archivo ya no existe hay que borrarllo
                    files2Remove.Add(oldFile);
                }
                else
                {
                    //si existe en los archivos anteriores no hay que añadirlo después lo borramos de la lista para luego no añadirlo
                    newFiles.Remove(newF);
                }
            }
            files2Remove.ForEach(fDelete =>
            {
                template2Update.StorageFiles.Remove(fDelete);
            });
           //los arhicos que quedan en la lsita son nuevos y hay que añadirlo.
            newFiles.ForEach(newF =>
            {
                context.createTemplateFileRelation(template2Update.ID, newF.ID);
                //template2Update.StorageFiles.Add(newF);
            });
           
            return true;
        }

        static internal bool saveFilesInForm(Forms form2Update, List<StorageFiles> newFiles, FormsDBEnt context)
        {
            // form2Update contiene los archivos viejos
            // Revisamos si ha habido nuevos arhicos y actualizaremos.
            List<StorageFiles> files2Remove = new List<StorageFiles>();
            foreach (StorageFiles oldFile in form2Update.StorageFiles)
            {
                StorageFiles newF = newFiles.Find(f => f.ID == oldFile.ID);
                if (newF == null)
                {
                    //El archivo ya no existe hay que borrarllo
                    files2Remove.Add(oldFile);

                    FormsLog logStatus = new FormsLog();
                    logStatus.idForm = form2Update.ID;
                    logStatus.createdOn = DateTime.UtcNow;
                    logStatus.type = "ALT_LOG_DELETE_FILE";
                    logStatus.traza = oldFile.name;
                    logStatus.usuario = HttpContext.Current.User.Identity.Name;
                    context.FormsLog.Add(logStatus);
                }
                else
                {
                    //si existe en los archivos anteriores no hay que añadirlo después lo borramos de la lista para luego no añadirlo
                    newFiles.Remove(newF);
                }
            }
            files2Remove.ForEach(fDelete =>
            {
                form2Update.StorageFiles.Remove(fDelete);
            });
            //los arhicos que quedan en la lsita son nuevos y hay que añadirlo.
            newFiles.ForEach(newF =>
            {
                context.createFormFileRelation(form2Update.ID, newF.ID);
                //form2Update.StorageFiles.Add(newF);

                FormsLog logStatus = new FormsLog();
                logStatus.idForm = form2Update.ID;
                logStatus.createdOn = DateTime.UtcNow;
                logStatus.type = "ALT_LOG_UPLOAD_FILE";
                logStatus.traza = newF.name;
                logStatus.usuario = HttpContext.Current.User.Identity.Name;
                context.FormsLog.Add(logStatus);

            });

            return true;
        }
    }
}