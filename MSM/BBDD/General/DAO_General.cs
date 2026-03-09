using Clients.ApiClient.Contracts;
using MSM.BBDD.Utilidades.Utils;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;

namespace MSM.BBDD.General
{
    public class DAO_General : IDAO_General
    {
        private IApiClient _api;
        private string _urlGeneral;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        //public DAO_General()
        //{

        //}

        public DAO_General(IApiClient api)
        {
            _api = api;
            _urlGeneral = string.Concat(UriEnvasado, "api/general/");
        }

        public async Task<List<DTO_ColorSemaforo>> ObtenerColoresSemaforo()
        {
            var result = await _api.GetPostsAsync<List<DTO_ColorSemaforo>>(string.Concat(_urlGeneral, "ColoresSemaforo"));

            return result;
        }

        public bool EnviarEmailGenerico(DTO_MailGeneric mailInfo, bool esManual = true)
        {
            DAO_Utils.SendGenericMail(mailInfo, esManual);

            return true;
        }

        public async Task<string> ObtenerValorParametroGeneral(string bbdd, string clave)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand comando = new SqlCommand("MES_ObtenerValorParametroGeneral", connection))
                    {
                        comando.CommandType = CommandType.StoredProcedure;

                        comando.Parameters.Add(new SqlParameter("@Clave", clave));
                        comando.Parameters.Add(new SqlParameter("@NombreBaseDatos", bbdd));

                        connection.Open();

                        using (SqlDataReader reader = await comando.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                string valor = reader["Valor"] != DBNull.Value ? reader["Valor"].ToString() : "";
                                return valor;
                            }
                            else
                            {
                                // No se encontró el valor, devolver cadena vacía
                                return "";
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "ERROR: obtener valor parametro general" + ": " +
                        ex.Message + " -> " + ex.StackTrace, "DAO_General.ObtenerValorParametroGeneral", "WEB-MANTENIMIENTO", HttpContext.Current?.User.Identity.Name ?? "Sistema");

                return "";
            }
        }
        
    }
}