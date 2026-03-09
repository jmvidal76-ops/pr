using Clients.ApiClient.Contracts;
using Common.Models.TAG;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.TAG
{
    public class DAO_Tag: IDAO_Tag
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriCOUNTER ;        
        
        private IApiClient _apiSIT;

        public DAO_Tag(IApiClient apiSIT)
        {
            _apiSIT = apiSIT;
            UriCOUNTER = UriBase + "api/tag/GetEquipmentCounterTags/";                      
        }

        public async Task<List<TagDto>> GetEquipmentCounterTags(int ubicationID)
        {
            List<TagDto> aux= new List<TagDto>();
            var ret = await _apiSIT.GetPostsAsync<List<TagDto>>(UriCOUNTER + ubicationID.ToString());
            return ret; 
        }
    }
}