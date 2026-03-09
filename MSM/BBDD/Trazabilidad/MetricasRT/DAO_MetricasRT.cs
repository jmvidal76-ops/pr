using Clients.ApiClient.Contracts;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Trazabilidad.MetricasRT
{
    public class DAO_MetricasRT: IDAO_MetricasRT
    {
        private IApiClient _api;
        private string _urlMetricas;
        private string UriTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();

        public DAO_MetricasRT()
        {

        }

        public DAO_MetricasRT(IApiClient api)
        {
            _api = api;
            _urlMetricas = string.Concat(UriTrazabilidad, "api/MetricasRT/");
        }

        public void ActivarMetrica(string metricaId)
        {
            _api.GetPostsAsync<int>(string.Concat(_urlMetricas, "ActivarMetrica?metricaId=", metricaId));
        }

        public void DesactivarMetrica(string metricaId)
        {
            _api.GetPostsAsync<int>(string.Concat(_urlMetricas, "DesactivarMetrica?metricaId=", metricaId));
        }
    }
}