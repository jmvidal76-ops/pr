using Clients.ApiClient.Contracts;
using Common.Models.Transporte;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public class DAO_Cliente : IDAO_Cliente
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriClientes;

        private IApiClient _apiTrazabilidad;

        public DAO_Cliente(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriClientes = UriBase + "api/cliente";
        }

        public async Task<List<ClienteDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<ClienteDto>>(UriClientes);
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriClientes + "/" + id);
            return ret;
        }

        public async Task<ClienteDto> Post(ClienteDto cliente)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<ClienteDto>(cliente, UriClientes);
            return ret;
        }

        public async Task<ClienteDto> Put(ClienteDto cliente)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<ClienteDto>(UriClientes, cliente);
            return ret;
        }
    }
}