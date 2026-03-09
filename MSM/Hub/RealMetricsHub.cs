using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM
{
    [HubName("realMetrics")]
    public class RealMetricsHub : Hub
    {
        public async Task SendMetrics(string metricId, string metric)
        {
            await Clients.All.metricasRealTime(metricId, metric);
        }
    }
}