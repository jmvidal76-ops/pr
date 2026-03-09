using Common.Models.Material;
using Common.Models.Muestras;
using Common.Models.Transportes;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public interface IDAO_Sample
    {

        Task<List<SampleDto>> GetSamplesList(int IdOrder);

        Task<SampleDto> CreateSample(SampleDto dto);

        Task<ReturnValue> DeleteSample(SampleDto dto);


    }
}
