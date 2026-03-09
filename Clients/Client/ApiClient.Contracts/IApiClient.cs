using Common.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Clients.ApiClient.Contracts
{
    public interface IApiClient
    {
        //string UrlBaseTrazabilidad {get;set;}

        //string UrlBaseSimatic { get; set; }

        Task<T> GetPostsAsync<T>(string Uri);

        Task<T> PostPostsAsync<T>(T post, string Uri);

        Task<T> PostPostsAsymmetricAsync<T>(object post, string Uri);

        Task<T> PutPostsAsync<T>(string Uri,T post);
        Task<T> PutPostsAsymmetricAsync<T>(string Uri, object post);

        Task<T> PatchPostsAsync<T>(T post, int id, string Uri);

        Task<T> DeletePostsAsync<T>(string Uri);

        Task<List<T>> PostAsJsonAsync<T>(T objeto, string Uri);

        Task<List<object>> PostObjectAsJsonAsync<T>(T objeto, string Uri);

        Task<object> PostObjectAsJsonAsync<T>(T objeto, string Uri, bool uniquevalue);

    }
}
