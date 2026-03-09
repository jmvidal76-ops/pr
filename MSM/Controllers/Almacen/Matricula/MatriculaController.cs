using Common.Models.Matricula;
using Common.Models.MatriculaRemolque;
using Common.Models.MatriculaTractora;
using Common.Models.Transportes;
using Common.Models.Transportista;
using MSM.BBDD.Trazabilidad.Matricula;
using MSM.BBDD.Trazabilidad.Transporte;
using MSM.Mappers.DTO;
using MSM.Models.Trazabilidad;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Almacen.Matricula
{
    

    [Authorize]
    public class MatriculaController : ApiController
    {
        private readonly IDAO_Matricula _iDAO_Matricula;

        public enum TipoOrigenEnum
        {
           Tractora,
           Remolque,
           Todas

        }

         public MatriculaController(IDAO_Matricula iDAO_Matricula)
                    {
                        _iDAO_Matricula = iDAO_Matricula;
                    }

         /// <summary>
         /// Metodo que obtiene la lista de los Matriculaes
         /// </summary>
         /// <returns></returns>
         [Route("api/GetMatricula")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<List<MatriculaDto>> GetMatricula()
         {
             List<MatriculaDto> _result = new List<MatriculaDto>();
             List<MatriculaDto> listMatricula = await _iDAO_Matricula.Get();

             if (listMatricula.Count > 0)
             {

                 _result = listMatricula;
             }

             return _result;
         }


         [Route("api/AddRegistrationT")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<MatriculaTractoraDto> AddAdressee(MatriculaTractoraDto matricula)
         {
            matricula.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
            try
            {
                if (!String.IsNullOrEmpty(matricula.MatriculaTractora))
                {
                    MatriculaTractoraDto _result = await _iDAO_Matricula.PostMatriculaTractora(matricula);
                    if (_result != null)
                    {
                        _result.IdCombo = _result.IdMatriculaTractora;
                        return _result;
                    }
                }
                return null;
            }
            catch(Exception ex)
            {
                // Registro repetido
                if (ex.Message.Contains("406"))
                {
                    return null;
                }

                throw ex;
            }             
         }

         [Route("api/AddRegistrationR")]
         [HttpPost]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
         public async Task<MatriculaRemolqueDto> AddAdressee(MatriculaRemolqueDto matricula)
         {
            matricula.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";

            try
            { 
                 if (!String.IsNullOrEmpty(matricula.MatriculaRemolque))
                 {
                     MatriculaRemolqueDto _result = await _iDAO_Matricula.PostMatriculaRemolque(matricula);
                     if (_result != null)
                     {
                         _result.IdCombo = _result.IdMatriculaRemolque;
                         return _result;
                     }
                 }
                 return null;
            }
            catch (Exception ex)
            {
                // Registro repetido
                if (ex.Message.Contains("406"))
                {
                    return null;
                }

                throw ex;
            }
        }

        /// <summary>
        /// Metodo que obtiene todas las matriculas de un tipo
        /// </summary>
        /// <param name="tipo">Tipo de matricula (tractora o remolque)</param>
        [Route("api/Matricula/{tipo}")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<IHttpActionResult> ObtenerMatriculasTipo(string tipo)
        {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            
            try
            {
                TipoOrigenEnum tipoEnum = (TipoOrigenEnum)Enum.Parse(typeof(TipoOrigenEnum), tipo);
                DataAutoComplete dataAutoComplete = new DataAutoComplete();
                switch (tipoEnum)
                {
                    case TipoOrigenEnum.Tractora:
                        List<MatriculaTractoraDto> matriculas = await _iDAO_Matricula.GetMatriculaTractora();

                        if (matriculas != null)
                        {
                            foreach (var transporte in matriculas.Distinct())
                            {
                                if (transporte.MatriculaTractora != null)
                                {
                                    var claveValor = new DTO_ClaveValorInfo()
                                    {
                                        Id = transporte.IdMatriculaTractora,
                                        Valor = transporte.MatriculaTractora,
                                        Info = new string[] { transporte.PesoMaximo.HasValue ? transporte.PesoMaximo.Value.ToString() : null }
                                    };

                                    listaClaveValor.Add(claveValor);
                                }
                            }
                        }
                        break;
                    case TipoOrigenEnum.Remolque:
                        List<MatriculaRemolqueDto> matriculasRemolque = await _iDAO_Matricula.GetMatriculaRemolque();
                        if (matriculasRemolque != null)
                        {
                            foreach (var transporte in matriculasRemolque.Distinct())
                            {
                                if (transporte.MatriculaRemolque != null)
                                {
                                    var claveValor = new DTO_ClaveValorInfo()
                                    {
                                        Id = transporte.IdMatriculaRemolque,
                                        Valor = transporte.MatriculaRemolque,
                                    };

                                    listaClaveValor.Add(claveValor);
                                }
                            }
                        }
                        break;
                    case TipoOrigenEnum.Todas:
                        List<MatriculaDto> matriculasTodas = await _iDAO_Matricula.Get();
                        foreach (var transporte in matriculasTodas)
                        {
                            if (transporte.MatriculaTractora != null)
                            {
                                var claveValor = new DTO_ClaveValorInfo()
                                {
                                    Id = transporte.IdTransporte,
                                    Valor = transporte.MatriculaTractora,
                                };

                                listaClaveValor.Add(claveValor);
                            }
                        }
                        break;
                }

            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }
            return Json(listaClaveValor);

        }

            /// <summary>
            /// Metodo que obtiene la data para los combos de autocomplete según el tipo
            /// </summary>
            /// <param name="tipo">Tipo de autocomplete</param>
            /// <returns>List DataAutoComplete</returns>
            [Route("api/GetDataAutoCompleteMatricula/{tipo}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<IHttpActionResult> ObtenerDataAutoComplete(string tipo, string nombre = null)
         {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
             {
                 TipoOrigenEnum tipoEnum = (TipoOrigenEnum)Enum.Parse(typeof(TipoOrigenEnum), tipo);
                 DataAutoComplete dataAutoComplete = new DataAutoComplete();
                 switch (tipoEnum)
                 {
                     case TipoOrigenEnum.Tractora:
                        List<MatriculaTractoraDto> matriculas = await _iDAO_Matricula.GetMatriculaTractoraFilters(nombre, "MatriculaTractora");
                        
                         if (matriculas != null)
                         {
                             foreach (var transporte in matriculas.Distinct())
                             {
                                 if (transporte.MatriculaTractora != null)
                                 {
                                    var claveValor = new DTO_ClaveValorInfo()
                                    {
                                        Id = transporte.IdMatriculaTractora,
                                        Valor = transporte.MatriculaTractora,
                                        Info = new string[] { transporte.PesoMaximo.HasValue ? transporte.PesoMaximo.Value.ToString() : null }
                                    };

                                    listaClaveValor.Add(claveValor);
                                 }
                             }
                         }
                         break;
                     case TipoOrigenEnum.Remolque:
                         List<MatriculaRemolqueDto> matriculasRemolque = await _iDAO_Matricula.GetMatriculaRemolqueFilters(nombre, "MatriculaRemolque");
                         if (matriculasRemolque != null)
                         {
                             foreach (var transporte in matriculasRemolque.Distinct())
                             {
                                 if (transporte.MatriculaRemolque != null)
                                 {
                                    var claveValor = new DTO_ClaveValorInfo()
                                    {
                                        Id = transporte.IdMatriculaRemolque,
                                        Valor = transporte.MatriculaRemolque,
                                    };

                                    listaClaveValor.Add(claveValor);
                                 }
                             }
                         }
                         break;
                     case TipoOrigenEnum.Todas:
                         List<MatriculaDto> matriculasTodas = await _iDAO_Matricula.Get();
                         foreach (var transporte in matriculasTodas)
                         {
                             if (transporte.MatriculaTractora != null)
                             {
                                var claveValor = new DTO_ClaveValorInfo()
                                {
                                    Id = transporte.IdTransporte,
                                    Valor = transporte.MatriculaTractora,
                                };

                                listaClaveValor.Add(claveValor);
                             }
                         }
                         break;
                 }

             }
             catch (Exception e)
             {
                 var mensaje = e.Message;
             }
             return Json(listaClaveValor);
         }

         [Route("api/GetDataMatriculaByID/{matricula}")]
         [HttpGet]
         [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
         public async Task<DataAutoComplete> ObtenerDataAutoComplete(string matricula)
         {
             DataAutoComplete _dataAutoComplete = new DataAutoComplete();
             if (matricula != null) {

                 MatriculaTractoraDto _matricula = await _iDAO_Matricula.GetMatriculaTractoraByID(matricula);
                 if (_matricula != null)
                 {

                     if (_matricula.MatriculaTractora != null)
                         {
                             _dataAutoComplete.ID = _matricula.IdMatriculaTractora;
                             _dataAutoComplete.Nombre = _matricula.MatriculaTractora;
                             _dataAutoComplete.PesoMaximo = _matricula.PesoMaximo;
                             _dataAutoComplete.IdProducto = _matricula.IdProducto;
                             _dataAutoComplete.IdProveedor = _matricula.IdProveedor;
                             _dataAutoComplete.IdOperador = _matricula.IdOperador;
                             _dataAutoComplete.NombreOperador = _matricula.NombreOperador;
                             _dataAutoComplete.Transportista = _matricula.IdTransportista != null? new TransportistaDto()
                             {
                                 IdTransportista = (int)_matricula.IdTransportista,
                                 NIF = _matricula.NIF,
                                 Nombre = _matricula.NombreTransportista
                             }:null;
                         
                         }
                     
                 }
             }
             return _dataAutoComplete;
         }

    }
}