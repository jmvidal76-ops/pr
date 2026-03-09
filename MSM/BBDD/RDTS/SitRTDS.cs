using Clients.ApiClient.Contracts;
using Common.Models.Material;
using Common.Models.RTDS;
using Common.Models.Transportes;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.RTDS
{
    public class SitRTDS : ISitRTDS
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiSIT"].ToString();
        private string UriRTDS ;
        private string UriGetRTDS ;
        private string UriCheckRTDS ;
        private string UriSetRTDS;
        
        private IApiClient _apiSIT;

        public SitRTDS(IApiClient apiSIT)
        {
            _apiSIT = apiSIT;
            UriRTDS = UriBase + "api/rtds";
            UriGetRTDS = UriRTDS + "/readtags";
            UriCheckRTDS = UriRTDS + "/checktags";
            UriSetRTDS = UriRTDS + "/writetags";

            //_apiSIT.UrlBaseSimatic = ConfigurationManager.AppSettings["HostApiSIT"].ToString();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterData"></param>
        /// <returns></returns>
        public async Task<object> readRTDS(RTDSValuesDto filterData)
        {
            var ret = await _apiSIT.PostObjectAsJsonAsync<RTDSValuesDto>(filterData, UriGetRTDS);
            return ret;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="filterData"></param>
        /// <returns></returns>
        public async Task<List<bool>> checkRTDSVariables(RTDSValuesDto filterData)
        {
            var ret = await _apiSIT.PostObjectAsJsonAsync<RTDSValuesDto>(filterData, UriCheckRTDS);
            return ret.ConvertAll (x => (bool)x);
        }

        /// <summary>
        /// Escribe una lista de valores en tags
        /// </summary>
        /// <param name="filterData"></param>
        /// <returns></returns>
        public async Task<object> writeRTDS(RTDSValuesDto filterData)
        {
            var ret = await _apiSIT.PostObjectAsJsonAsync<RTDSValuesDto>(filterData, UriSetRTDS);
            return ret;
        }

    }
}