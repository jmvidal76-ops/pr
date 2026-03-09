using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Services.NetworkService.Network.Contracts;
using Services.NetworkStatusServices.NetworkStatus.Contracts;
using Services.NetworkService.Network.Models.Settings;
using Services.NetworkService.Network.Models.Serializer;
using Services.NetworkService.Network.Models;
using Services.NetworkService.Network.Models.Extensions;
using Services.NetworkService.Network.Models.Helpers;

namespace Services.NetworkService.Network
{
    public sealed class NetworkService : INetworkService
    {
        #region Fields

        private readonly INetworkStatusService _networkStatusService;
        private readonly IApiSettings _apiSettings;
        private readonly ISerializer _serializer;

        #endregion

        #region Constructor

        public NetworkService(INetworkStatusService networkStatusService, ISerializer serializer, IApiSettings apiSettings)
        {
            _networkStatusService = networkStatusService;
            _apiSettings = apiSettings;
            _serializer = serializer;
        }

        #endregion

        #region Public Methods

        public Task<bool> AuthRequestAsync<TK>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            return MakeRequestWithRetriesAsync<TK>(requestInfo, requestSettings, authInfo, actionOnNotConnectivity, actionOnException, errorKey);
        }

        public Task<T> AuthRequestAsync<T, TK>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
        where TK : ErrorRequest
        {
            return MakeRequesWithRetriestAsync<T, TK>(requestInfo, requestSettings, authInfo, actionOnNotConnectivity, actionOnException, errorKey);
        }

        public Task<T> AuthRequestAsync<T>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            return MakeRequestWithRetriesAsync<T>(requestInfo, requestSettings, authInfo, actionOnNotConnectivity, actionOnException);
        }

        public Task AuthRequestAsync(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            return MakeRequestWithRetriesAsync(requestInfo, requestSettings, authInfo, actionOnNotConnectivity, actionOnException);
        }

        public Task<bool> RequestAsync<TK>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            return MakeRequestWithRetriesAsync<TK>(requestInfo, requestSettings, null, actionOnNotConnectivity, actionOnException, errorKey);
        }

        public Task<T> RequestAsync<T, TK>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            return MakeRequesWithRetriestAsync<T, TK>(requestInfo, requestSettings, null, actionOnNotConnectivity, actionOnException, errorKey);
        }

        public Task<T> RequestAsync<T>(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            return MakeRequestWithRetriesAsync<T>(requestInfo, requestSettings, null, actionOnNotConnectivity, actionOnException);
        }

        public Task<string> RequestAsync(RequestInfo requestInfo, RequestSettings requestSettings, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            return MakeRequestWithRetriesAsync(requestInfo, requestSettings, null, actionOnNotConnectivity, actionOnException);
        }

        #endregion

        #region Private Methods

        private async Task<T> MakeRequestAsync<T, TK>(RequestInfo requestInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey, AuthInfo authInfo = null)
            where TK : ErrorRequest
        {
            var request = _apiSettings.CreateWebRequest(requestInfo.Request, requestInfo.MethodType.ToString().ToUpper(), requestInfo.ContentType, authInfo);

            if (!string.IsNullOrWhiteSpace(requestInfo.Content))
            {
                using (var stream = await request.GetRequestStreamAsync())
                {
                    var byteArray = Encoding.UTF8.GetBytes(requestInfo.Content);
                    stream.Write(byteArray, 0, byteArray.Length);
                }
            }

            using (var response = await request.GetResponseAsync())
            {
                using (var stream = response.GetResponseStream())
                {
                    var resultStr = stream.ReadString();
                    if (!string.IsNullOrWhiteSpace(errorKey) && !string.IsNullOrWhiteSpace(resultStr) && resultStr.Contains(errorKey))
                    {
                        HandleError<TK>(actionOnException, resultStr);
                        return default(T);
                    }
                    else
                    {
                        var resultObj = _serializer.Deserialize<T>(resultStr);
                        return resultObj;
                    }
                }
            }
        }

        private async Task<T> MakeRequestAsync<T>(RequestInfo requestInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException, AuthInfo authInfo = null)
        {
            var request = _apiSettings.CreateWebRequest(requestInfo.Request, requestInfo.MethodType.ToString().ToUpper(), requestInfo.ContentType, authInfo);

            if (!string.IsNullOrWhiteSpace(requestInfo.Content))
            {
                using (var stream = await request.GetRequestStreamAsync())
                {
                    var byteArray = Encoding.UTF8.GetBytes(requestInfo.Content);
                    stream.Write(byteArray, 0, byteArray.Length);
                }
            }

            using (var response = await request.GetResponseAsync())
            {
                using (var stream = response.GetResponseStream())
                {
                    var resultStr = stream.ReadString();
                    var resultObj = _serializer.Deserialize<T>(resultStr);
                    return resultObj;
                }
            }
        }

        private async Task<string> MakeRequestAsync(RequestInfo requestInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException, AuthInfo authInfo = null)
        {
            var request = _apiSettings.CreateWebRequest(requestInfo.Request, requestInfo.MethodType.ToString().ToUpper(), requestInfo.ContentType, authInfo);

            if (!string.IsNullOrWhiteSpace(requestInfo.Content))
            {
                using (var stream = await request.GetRequestStreamAsync())
                {
                    var byteArray = Encoding.UTF8.GetBytes(requestInfo.Content);
                    stream.Write(byteArray, 0, byteArray.Length);
                }
            }

            using (var response = await request.GetResponseAsync())
            {
                if (response == null)
                {
                    throw new Exception();
                }
                using (var stream = response.GetResponseStream())
                {
                    return stream.ReadString();
                }
            }
        }

        private async Task<bool> MakeBoolRequestAsync<TK>(RequestInfo requestInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey, AuthInfo authInfo = null)
            where TK : ErrorRequest
        {
            var request = _apiSettings.CreateWebRequest(requestInfo.Request, requestInfo.MethodType.ToString().ToUpper(), requestInfo.ContentType, authInfo);

            if (!string.IsNullOrWhiteSpace(requestInfo.Content))
            {
                using (var stream = await request.GetRequestStreamAsync())
                {
                    var byteArray = Encoding.UTF8.GetBytes(requestInfo.Content);
                    stream.Write(byteArray, 0, byteArray.Length);
                }
            }

            using (var response = await request.GetResponseAsync())
            {
                var resultBool = true;

                if (!string.IsNullOrWhiteSpace(errorKey))
                {
                    using (var stream = response.GetResponseStream())
                    {
                        var resultStr = stream.ReadString();
                        if (string.IsNullOrWhiteSpace(resultStr) || !resultStr.Contains(errorKey))
                            return true;
                        HandleError<TK>(actionOnException, resultStr);
                        resultBool = false;
                    }
                }

                return resultBool;
            }
        }

        private async Task<bool> MakeRequestWithRetriesAsync<TK>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            if (requestInfo.Request == null)
                return false;

            if (requestSettings == null)
                requestSettings = new RequestSettings();

            var result = false;

            await RetryHelper.ExecuteWithRetryAsync(async () =>
            {
                if (requestSettings.RunInNewThread)
                {
                    result = await MakeBoolRequestInNewThreadAsync<TK>(requestInfo, authInfo, actionOnNotConnectivity, actionOnException, errorKey);
                }
                else
                {
                    result = await MakeBoolRequestAsync<TK>(requestInfo, actionOnNotConnectivity, actionOnException, errorKey, authInfo);
                }

            }, requestSettings.SleepPeriod, requestSettings.RetriesCount, (exception) =>
            {
                HandleException<TK>(requestInfo.Request, exception, actionOnNotConnectivity, actionOnException);
            });

            return result;
        }

        private async Task<T> MakeRequesWithRetriestAsync<T, TK>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            if (requestInfo.Request == null)
                return default(T);

            if (requestSettings == null)
                requestSettings = new RequestSettings();

            var result = default(T);

            await RetryHelper.ExecuteWithRetryAsync(async () =>
            {
                if (requestSettings.RunInNewThread)
                {
                    result = await MakeRequestInNewThreadAsync<T, TK>(requestInfo, authInfo, actionOnNotConnectivity, actionOnException, errorKey);
                }
                else
                {
                    result = await MakeRequestAsync<T, TK>(requestInfo, actionOnNotConnectivity, actionOnException, errorKey, authInfo);
                }
            }, requestSettings.SleepPeriod, requestSettings.RetriesCount, (exception) =>
            {
                HandleException<TK>(requestInfo.Request, exception, actionOnNotConnectivity, actionOnException);
            });

            return result;
        }

        private async Task<T> MakeRequestWithRetriesAsync<T>(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            if (requestInfo.Request == null)
                return default(T);

            if (requestSettings == null)
                requestSettings = new RequestSettings();

            var result = default(T);

            await RetryHelper.ExecuteWithRetryAsync(async () =>
            {
                if (requestSettings.RunInNewThread)
                {
                    result = await MakeRequestInNewThreadAsync<T>(requestInfo, authInfo, actionOnNotConnectivity, actionOnException);
                }
                else
                {
                    result = await MakeRequestAsync<T>(requestInfo, actionOnNotConnectivity, actionOnException, authInfo);
                }

            }, requestSettings.SleepPeriod, requestSettings.RetriesCount, (exception) =>
            {
                HandleException(requestInfo.Request, exception, actionOnNotConnectivity, actionOnException);
            });

            return result;
        }

        private async Task<string> MakeRequestWithRetriesAsync(RequestInfo requestInfo, RequestSettings requestSettings, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            if (requestInfo.Request == null)
                return null;

            if (requestSettings == null)
                requestSettings = new RequestSettings();
            string result = string.Empty;

            await RetryHelper.ExecuteWithRetryAsync(async () =>
            {
                if (requestSettings.RunInNewThread)
                {
                    result = await MakeRequestInNewThreadAsync(requestInfo, authInfo, actionOnNotConnectivity, actionOnException);
                }
                else
                {
                    result = await MakeRequestAsync(requestInfo, actionOnNotConnectivity, actionOnException, authInfo);
                }

            }, requestSettings.SleepPeriod, requestSettings.RetriesCount, (exception) =>
            {
                HandleException(requestInfo.Request, exception, actionOnNotConnectivity, actionOnException);
            });
            return result;
        }

        private async Task<T> MakeRequestInNewThreadAsync<T, TK>(RequestInfo requestInfo, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            var result = await Task.Run<T>
                (
                    async () => await MakeRequestAsync<T, TK>(requestInfo, actionOnNotConnectivity, actionOnException, errorKey, authInfo)
                );

            return result;
        }

        private async Task<T> MakeRequestInNewThreadAsync<T>(RequestInfo requestInfo, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            var result = await Task.Run<T>
                (
                    async () => await MakeRequestAsync<T>(requestInfo, actionOnNotConnectivity, actionOnException, authInfo)
                );

            return result;
        }

        private async Task<string> MakeRequestInNewThreadAsync(RequestInfo requestInfo, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            return await Task.Run(async () =>
            {
                return await MakeRequestAsync(requestInfo, actionOnNotConnectivity, actionOnException, authInfo);
            });
        }

        private async Task<bool> MakeBoolRequestInNewThreadAsync<TK>(RequestInfo requestInfo, AuthInfo authInfo, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException, string errorKey)
            where TK : ErrorRequest
        {
            var result = await Task.Run<bool>
                (
                    async () => await MakeBoolRequestAsync<TK>(requestInfo, actionOnNotConnectivity, actionOnException, errorKey, authInfo)
                );

            return result;
        }

        private void HandleException<TK>(Uri request, Exception exception, Action actionOnNotConnectivity, Action<Exception, TK> actionOnException)
            where TK : ErrorRequest
        {
            if (!_networkStatusService.IsConnected)
            {
                actionOnNotConnectivity.Invoke();
            }
            else
            {
                var errorObj = default(TK);

                var webException = exception as WebException;
                var webResponse = webException.Response as HttpWebResponse;
                if (webResponse != null)
                {
                    using (var stream = webResponse.GetResponseStream())
                    {
                        var resultStr = stream.ReadString();
                        errorObj = _serializer.Deserialize<TK>(resultStr);
                    }
                }

                actionOnException.Invoke(exception, errorObj);
            }
        }

        private void HandleException(Uri request, Exception exception, Action actionOnNotConnectivity, Action<Exception> actionOnException)
        {
            if (!_networkStatusService.IsConnected)
            {
                actionOnNotConnectivity.Invoke();
            }
            else
            {
                actionOnException.Invoke(exception);
            }
        }

        private void HandleError<TK>(Action<Exception, TK> actionOnException, string resultStr)
            where TK : ErrorRequest
        {
            var errorObj = _serializer.Deserialize<TK>(resultStr);
            var exception = new InvalidOperationException(errorObj.Description);
            actionOnException.Invoke(exception, errorObj);
        }

        #endregion
    }
}
