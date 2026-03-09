using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Services.NetworkService.Network.Contracts;
using Services.NetworkService.Network.Models;
using Services.TrackingService.Tracking.Contracts;
using System.Configuration;
using Clients.ApiClient.Contracts;
using Common.Models;

namespace Clients.ApiClient
{
    public class ApiClient : IApiClient
    {
        //public string UrlBaseTrazabilidad { get; set; }
        private const string ContentType = "application/json";

        private readonly INetworkService _networkService;
        private readonly ITrackingService _trackingService;

        private RequestSettings _requestSettings;

        public ApiClient(INetworkService networkService, ITrackingService trackingService)
        {
            _networkService = networkService;
            _trackingService = trackingService;
            _requestSettings = new RequestSettings();
        }

        public Task<T> GetPostsAsync<T>(string Uri)
        {
            var requestUri = Uri;//UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Get;

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<T> PostPostsAsync<T>(T post, string Uri)
        {
            var requestUri = Uri; //UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Post;
            var content = JsonConvert.SerializeObject(post);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType );

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }
        
        public Task<T> PostPostsAsymmetricAsync<T>(object post, string Uri)
        {
            var requestUri = Uri; //UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Post;
            var content = JsonConvert.SerializeObject(post);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType );

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<T> PutPostsAsync<T>(string Uri,T post)
        {
            var requestUri = Uri; //UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Put;
            var content = JsonConvert.SerializeObject(post);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<T> PutPostsAsymmetricAsync<T>(string Uri, object post)
        {
            var requestUri = Uri; //UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Put;
            var content = JsonConvert.SerializeObject(post);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<T> PatchPostsAsync<T>(T post, int id, string Uri)
        {
            var requestUri = Uri; // UrlBaseTrazabilidad + Uri + id;
            MethodType methodType = MethodType.Patch;
            var content = JsonConvert.SerializeObject(post);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<T> DeletePostsAsync<T>(string Uri)
        {
            var requestUri = Uri; // UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Delete;

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<T>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<List<T>> PostAsJsonAsync<T>(T objeto, string Uri)
        {
            var requestUri = Uri; //UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Post;
            var content = JsonConvert.SerializeObject(objeto);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<List<T>>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        public Task<List<object>> PostObjectAsJsonAsync<T>(T objeto, string Uri)
        {
            var requestUri = Uri; // UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Post;
            var content = JsonConvert.SerializeObject(objeto);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<List<object>>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }

        /// <summary>
        /// Cuando solo debe traer un solo valor de resultado
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="objeto"></param>
        /// <param name="Uri"></param>
        /// <param name="uniquevalue"></param>
        /// <returns></returns>
        public Task<object> PostObjectAsJsonAsync<T>(T objeto, string Uri, bool uniquevalue)
        {
            var requestUri = Uri; // UrlBaseTrazabilidad + Uri;
            MethodType methodType = MethodType.Post;
            var content = JsonConvert.SerializeObject(objeto);

            RequestInfo requestInfo = new RequestInfo(new Uri(requestUri), methodType, content, ContentType);

            _trackingService.TrackEvent("API Service: {methodType} to {requestUri}");

            return _networkService.RequestAsync<object>(requestInfo, _requestSettings, ActionOnNoConnectivity, (exception) => ActionOnException(exception, null));
        }


        private void ActionOnNoConnectivity()
        {
            _trackingService.TrackError("API Service: Error. No connectivity");
        }

        private void ActionOnException(Exception ex, ErrorRequest error)
        {
            throw ex;
            //_trackingService.TrackException(ex);
        }
    }
}
