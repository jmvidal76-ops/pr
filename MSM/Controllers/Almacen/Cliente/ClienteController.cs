using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using MSM.BBDD.Planta;
using MSM.Mappers.DTO;
using Common.Models.Transporte;

namespace MSM.Controllers.Almacen.Cliente
{
    [Authorize]
    public class ClienteController : ApiController
    {

        private readonly BBDD.Trazabilidad.Transporte.IDAO_Cliente _iDAO_Cliente;

        public ClienteController(BBDD.Trazabilidad.Transporte.IDAO_Cliente iDAO_Cliente)
        {
            _iDAO_Cliente = iDAO_Cliente;
        }

        [Route("api/GetDataAutoCompleteCliente")]
        [HttpGet]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_CamionesTransito)]
        public async Task<IHttpActionResult> ObtenerDataAutoCompleteCliente(string nombre = null)
        {
            List<DTO_ClaveValorInfo> listaClaveValor = new List<DTO_ClaveValorInfo>();
            try
            {
                List<ClienteDto> clientes = await _iDAO_Cliente.Get();
                foreach (var item in clientes)
                {
                    var claveValor = new DTO_ClaveValorInfo()
                    {
                        Id = item.IdCliente,
                        Valor = item.Nombre,
                        Info = new string[] { item.Codigo, item.IdMaestroOrigen.ToString(), item.NIF, item.Direccion, item.CodigoPostal, item.Poblacion }
                    };

                    listaClaveValor.Add(claveValor);
                }

            }
            catch (Exception e)
            {
                var mensaje = e.Message;
            }

            return Json(listaClaveValor);
        }

        [Route("api/AddClient")]
        [HttpPost]
        [ApiAuthorize(Funciones.ALM_PROD_DAT_1_GestionCamionesTransito)]
        public async Task<ClienteDto> AddClient(ClienteDto cliente)
        {
            try
            {
                cliente.CreadoPor = HttpContext.Current?.User.Identity.Name ?? "Sistema";
                if (!String.IsNullOrEmpty(cliente.Nombre))
                {
                    ClienteDto _result = await _iDAO_Cliente.Post(cliente);
                    if (_result != null)
                    {
                        _result.IdCombo = _result.IdCliente;
                        return _result;
                    }
                }
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

            return null;
        }
    }
}