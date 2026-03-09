using Common.Models.Transportes;
using MSM.BBDD.Planta;
using MSM.BBDD.Trazabilidad.Documento;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Controllers.Planta;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Documento
{

    [Authorize]
    public class DocumentoController : ApiController
    {
        private readonly IDAO_Documento _iDAO_Documento;

         public DocumentoController(IDAO_Documento iDAO_Documento)
                    {
                        _iDAO_Documento = iDAO_Documento;
                    }

         #region DOCUMENT

         /// <summary>
         /// Metodo que obtiene todos los documentos según un id de transporte
         /// </summary>
         /// <param name="idTransporte">Id del transporte</param>
         /// <returns></returns>
         [Route("api/GetDocuments/{idTransporte}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<DocumentoDto>> GetDocuments(int idTransporte)
         {
             List<DocumentoDto> listDocumentos = new List<DocumentoDto>();
             if (idTransporte != 0)
             {
                 List<DocumentoDto> documentos = await _iDAO_Documento.GetDocumentosByIdTransporte(idTransporte);
                 if (documentos.Count > 0)
                 {
                     listDocumentos = documentos;
                 }
             }
             return listDocumentos;
         }

         /// <summary>
         /// Metodo que obtiene la lista de los tipos de documentos
         /// </summary>
         /// <returns></returns>
         [Route("api/GetDocumentType")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<TipoDocumentoDto>> GetDocumentType()
         {
             List<TipoDocumentoDto> listTipoDocumento = await _iDAO_Documento.GetTipoDocumentoAll();
             return listTipoDocumento;
         }

         /// <summary>
         /// Metodo que agrega un nuevo documento
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/AddDocument")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<DocumentoDto> AddDocument(DocumentoDto documento)
         {
             DocumentoDto _documentoDto = null;
             if (documento.IdDocumento == 0)
             {
                 _documentoDto = await _iDAO_Documento.Post(documento);
             }
             return _documentoDto;
         }

         /// <summary>
         /// Metodo que actualiza el documento
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/UpdateDocument")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<bool> UpdateDocument(DocumentoDto documento)
         {
             if (documento.IdDocumento != 0)
             {
                 var _documentoDto = await _iDAO_Documento.Put(documento);
             }
             return true;
         }

         /// <summary>
         /// Metodo que elimina el documento seleccionado
         /// </summary>
         /// <param name="documento">Objeto de tipo DocumentoDto</param>
         /// <returns></returns>
         [Route("api/DeleteDocument")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<DocumentoDto> DeleteDocument(DocumentoDto documento)
         {
             if (documento.IdDocumento != 0)
             {
                 var _documentoDto = await _iDAO_Documento.Delete(documento.IdDocumento);

             }
             return documento;
         }

         /// <summary>
         /// Metodo que obtiene el archivo segun el tipo de documento
         /// </summary>
         /// <param name="idDocumento">ID del documento</param>
         /// <returns></returns>
         [Route("api/DownloadFile/{idDocumento}")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<string> DownloadFile(int idDocumento)
         {
             var _documentoDto = await _iDAO_Documento.GetFicheroByIdDocumento(idDocumento);
             //File.WriteAllBytes(@"C:\Documento.pdf", _documentoDto);
             return _documentoDto != null ? Convert.ToBase64String(_documentoDto) : null;
         }


        [Route("api/Documentos/UploadFile/{idRuta}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP
            )]
        public IHttpActionResult DocumentosUploadFile([FromUri] int idRuta, [FromUri] string extensions = "pdf")
        {
            try
            {
                var newFileName = HttpContext.Current.Request.Form["newFileName"];
                var files = System.Web.HttpContext.Current.Request.Files;
                var ruta = DAO_Administracion.ObtenerEnlaceExterno(idRuta);

                if (files.Count > 0 && !String.IsNullOrEmpty(ruta))
                {
                    var directorio = new DirectoryInfo(ruta);
                    // Creacion del directorio si no existe
                    System.IO.Directory.CreateDirectory(directorio.FullName);
                    List<string> extensionsList = extensions.Split(';').ToList();

                    foreach(var key in files.AllKeys)
                    {
                        HttpPostedFileBase filebase = new HttpPostedFileWrapper(files[key]);
                        var type = filebase.ContentType.ToString();

                        if (!extensionsList.Any(f => type.Contains(f)))
                        {
                            return StatusCode(HttpStatusCode.NotAcceptable);
                        }

                        //var fileName = Path.GetFileName(filebase.FileName);
                        var physicalPath = Path.Combine(directorio.FullName, newFileName);

                        filebase.SaveAs(physicalPath);
                    }                    
                }

                // Return an empty string to signify success
                return Json("");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/Documentos/RemoveFile/{idRuta}")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito,
            Funciones.ALM_PROD_DAT_3_GestionControlStockFabricacion,
            Funciones.ALM_PROD_DAT_3_GestionControlStock,
            Funciones.ALM_PROD_DAT_7_GestionControlStockConsumidos,
            Funciones.ALM_PROD_DAT_3_GestionControlStockProductoAcabadoFabricacion,
            Funciones.ENV_PROD_EXE_54_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_13_GestionControlStockMMPP,
            Funciones.FAB_PROD_EXE_14_GestionLotesConsumidosMMPP
            )]
        public IHttpActionResult DocumentosRemoveFile([FromUri] int idRuta)
        {
            var newFileName = HttpContext.Current.Request.Form["newFileName"];

            try
            {
                var ruta = DAO_Administracion.ObtenerEnlaceExterno(idRuta);

                if (!String.IsNullOrEmpty(ruta))
                {
                    var directorio = new DirectoryInfo(ruta);

                    var fileName = Path.GetFileName(newFileName);
                    var physicalPath = Path.Combine(directorio.FullName, fileName);

                    if (System.IO.File.Exists(physicalPath))
                    {
                        System.IO.File.Delete(physicalPath);
                    }
                }

                // Return an empty string to signify success
                return Json("");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [Route("api/Documentos/ShowPDF/{idRuta}")]
        [HttpGet]
        public IHttpActionResult ShowPDF([FromUri] int idRuta, string file)
        {
            var ruta = DAO_Administracion.ObtenerEnlaceExterno(idRuta);
            try
            {
                if (!String.IsNullOrEmpty(ruta))
                {
                    var directorio = new DirectoryInfo(ruta);
                    var path = Path.Combine(directorio.FullName, file);

                    var fileBytes = File.ReadAllBytes(path);                    

                    var content = Convert.ToBase64String(fileBytes);

                    return Json(content);
                }

                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest();
            }
        }

        [Route("api/Documentos/ServeFile/{idRuta}/{fileName}")]
        [HttpGet]
        public HttpResponseMessage ServeFile([FromUri] int idRuta, [FromUri] string fileName, string extension)
        {
            var ruta = DAO_Administracion.ObtenerEnlaceExterno(idRuta);
            try
            {
                if (!String.IsNullOrEmpty(ruta))
                {
                    var directorio = new DirectoryInfo(ruta);
                    var path = Path.Combine(directorio.FullName, fileName + "." + extension);

                    var fileBytes = File.ReadAllBytes(path);

                    HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new ByteArrayContent(fileBytes);
                    string ext = Path.GetExtension(path).ToLower();
                    if (ext == ".pdf")
                    {
                        response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
                    }
                    else if (ext == ".jpg" || ext == ".jpeg") 
                    {
                        response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
                    }
                    else
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest);
                    }
                    
                    response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("inline")
                    {
                        FileName = fileName + "." + extension
                    };

                    return response;

                    //var content = Convert.ToBase64String(fileBytes);

                    //return Json(content);
                }

                return Request.CreateResponse(HttpStatusCode.NotFound);
                //return Ok();
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
                //return BadRequest();
            }
        }


        /// <summary>
        /// Metodo que carga un nuevo archivo en la entidad DocumentoDto
        /// </summary>
        /// <returns></returns>
        [Route("api/UploadFile")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public byte[] UploadFile()
         {
             HttpResponseMessage _returnValue;
             //HttpRequestMessage request = new HttpRequestMessage();
             try
             {
                 if (System.Web.HttpContext.Current.Request.Files.AllKeys.Any())
                 {
                     var pic = System.Web.HttpContext.Current.Request.Files["fileUpload"];
                     HttpPostedFileBase filebase = new HttpPostedFileWrapper(pic);
                     var type = filebase.ContentType.ToString();

                     if (!type.Contains("pdf"))
                     {
                         return new byte[0];
                     }

                     using (var reader = new BinaryReader(filebase.InputStream))
                     {
                         return reader.ReadBytes(filebase.ContentLength);
                     }


                 }

             }
             catch (Exception ex)
             {
                 return new byte[0];
             }

             return new byte[0];
         }

         /// <summary>
         /// Metodo que elimina el archivo de un documento segun su ID
         /// </summary>
         /// <param name="idDocument">ID del documento</param>
         /// <returns></returns>
         [Route("api/RemoveFile/{idDocument}")]
         [HttpPut]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<HttpResponseMessage> RemoveFile(int idDocument)
         {
             HttpResponseMessage _result = new HttpResponseMessage(HttpStatusCode.OK);
             if (idDocument != 0)
             {
                 int result = await _iDAO_Documento.DeleteFicheroByIdDocumento(idDocument);
                 _result = new HttpResponseMessage(HttpStatusCode.Accepted);
             }
             return _result;
         }

         #endregion

    }
}