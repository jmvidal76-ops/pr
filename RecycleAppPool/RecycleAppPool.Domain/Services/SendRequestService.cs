using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

namespace RecycleAppPool.Domain.Services
{
    public class SendRequestService
    {
        /// <summary>
        /// Método que llama a la aplicacion MES para realizar el cierre de sesion de los usuarios activos
        /// </summary>
        /// <returns>Booleano que indica el resultado de la respuesta</returns>
        public static async Task<bool> SendCloseUserSesion() 
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(ConfigurationManager.AppSettings["BaseAddress"]);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response = await client.GetAsync(ConfigurationManager.AppSettings["RequestUri"]);

            bool result = false;
            if (response.IsSuccessStatusCode)
            {
                result = await response.Content.ReadAsAsync<bool>();
            }
            return result;
        }

        public static void sendRequestPortal()
        {
            System.Net.WebClient wc = new WebClient();
            wc.DownloadStringAsync(new Uri(string.Format("{0}/Portal",ConfigurationManager.AppSettings["BaseAddress"])));
        }
    }
}
