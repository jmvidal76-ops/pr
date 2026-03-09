using Common.Models.Operation;
using MSM.BBDD.Trazabilidad.Operations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MSM.Controllers.Fabricacion
{
    public class LotOperationRegisterController : ApiController
    {
        private readonly IDAO_Operations _IDAO_Operacion;

        public LotOperationRegisterController(IDAO_Operations IDAO_Operacion)
        {
            _IDAO_Operacion = IDAO_Operacion;
        }

        [Route("api/LotOperationRegister")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<bool> LotOperationRegister(OperationDto operation)
        {
            var _resOp = await _IDAO_Operacion.PostOperation(operation);
            return _resOp != null ? true : false;
        }
    }
}