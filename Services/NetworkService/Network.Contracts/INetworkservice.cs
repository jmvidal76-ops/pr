using System;
using System.Threading.Tasks;
using Services.NetworkService.Network.Models;
using Services.NetworkService.Network.Models.Settings;

namespace Services.NetworkService.Network.Contracts
{
    public interface INetworkService
    {
        Task<bool> AuthRequestAsync<K>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, K> actionOnException, string errorKey)
            where K : ErrorRequest;

        Task<T> AuthRequestAsync<T, K>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, K> actionOnException, string errorKey)
            where K : ErrorRequest;

        Task<T> AuthRequestAsync<T>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException);

        Task AuthRequestAsync(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException);

        Task<bool> RequestAsync<K>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception, K> actionOnException, string errorKey)
            where K : ErrorRequest;

        Task<T> RequestAsync<T, K>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception, K> actionOnException, string errorKey)
            where K : ErrorRequest;

        Task<T> RequestAsync<T>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception> actionOnException);

        Task<string> RequestAsync(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception> actionOnException);
    }
}
