using Common.Models.RTDS;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.RTDS
{
    public interface ISitRTDS
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterdata"></param>
        /// <returns></returns>
        Task<object> readRTDS(RTDSValuesDto filterdata);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterdata"></param>
        /// <returns></returns>
        Task<List<bool>> checkRTDSVariables(RTDSValuesDto filterdata);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterdata"></param>
        /// <returns></returns>
        Task<object> writeRTDS(RTDSValuesDto filterdata);

    }
}
