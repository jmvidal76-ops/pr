using Common.Models.Transportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Documento
{
    public interface IDAO_Documento
    {

        Task<DocumentoDto> Get(int id);

        Task<List<DocumentoDto>> GetDocumentosByIdTransporte(int idTransporte);

        Task<List<TipoDocumentoDto>> GetTipoDocumentoAll();

        Task<byte[]> GetFicheroByIdDocumento(int id);

        Task<DocumentoDto> Post(DocumentoDto documento);

        Task<DocumentoDto> Put(DocumentoDto documento);

        Task<int> DeleteFicheroByIdDocumento(int idDocumento);

        Task<int> Delete(int idDocumento);
    }
}
