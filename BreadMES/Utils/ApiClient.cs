using Newtonsoft.Json;
//using Services.NetworkService.Network.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BreadMES.Utilidades
{
    public class ApiBreadClient
    {

        public static async Task<HttpResponseMessage> PostAsJsonAsync<T>(string Uri, T post)
        {
            var httpClient = new HttpClient();
            return await httpClient.PostAsJsonAsync(Uri, post);
           
        }

        public static async Task<HttpResponseMessage> GetAsync(string Uri)
        {
            var httpClient = new HttpClient();
            return await httpClient.GetAsync(Uri);

        }

        public static async Task<HttpResponseMessage> DeleteAsync<T>(string Uri)
        {
            var httpClient = new HttpClient();
            return await httpClient.DeleteAsync(Uri);

        }

        public static async Task<HttpResponseMessage> PutAsJsonAsync<T>(string Uri, T post)
        {
            var httpClient = new HttpClient();
            return await httpClient.PutAsJsonAsync(Uri, post);

        }
    }
}