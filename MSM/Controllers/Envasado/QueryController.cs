using MSM.BBDD;
using MSM.BBDD.Envasado;
using MSM.Models;
using MSM.Models.Envasado;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class QueryController : ApiController
    {

        [Route("api/queries")]
        [ApiAuthorize(Funciones.ENV_PROD_INF_VisualizacionInformes)]
        public List<Query> Get()
        {
            DAO_Query daoQuery = new DAO_Query();
            List<Query> result = daoQuery.obtenerQueries();
            return result;
        }

       //[Route("api/query/execute/{id}")]
       // public QueryResult Get(int id)
       // {
       //    DAO_Query daoQuery = new DAO_Query();
       //    QueryResult result = daoQuery.ejecutarQuery(id, false,0,0,"");
       //    return result;

       // }

       [Route("api/queriesGraficos")]
       [ApiAuthorize(Funciones.ENV_PROD_INF_VisualizacionInformes)]
       public List<QueryGrafico> GetGraficos()
       {
           DAO_Query daoQuery = new DAO_Query();
           List<QueryGrafico> result = daoQuery.obtenerQueriesGraficos();
           return result;
       }

       [Route("api/query/executeGrafico")]
       [HttpPost]
       [ApiAuthorize(Funciones.ENV_PROD_INF_VisualizacionInformes)]
       public QueryResultGrafico GetGraficos(dynamic datos)
       {
           DAO_Query daoQuery = new DAO_Query();
           QueryResultGrafico result = daoQuery.ejecutarQueryGrafico(datos);
           return result;

       }

       [Route("api/query/executeFiltros")]
       [HttpPost]
       [ApiAuthorize(Funciones.ENV_PROD_INF_VisualizacionInformes)]
       public QueryResult Get(dynamic datos)
       {
           DAO_Query daoQuery = new DAO_Query();
           QueryResult result = daoQuery.ejecutarQuery(datos);
           return result;

       }

       
    }
}