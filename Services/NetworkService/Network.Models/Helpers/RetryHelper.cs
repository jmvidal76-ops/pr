using System;
using System.Threading.Tasks;

namespace Services.NetworkService.Network.Models.Helpers
{
    public static class RetryHelper
    {
        #region Public Methods

        public static async Task ExecuteWithRetryAsync(Func<Task> action, TimeSpan sleepPeriod, int retryCount, Action<Exception> actionAfterRetries)
        {
            do
            {
                try
                {
                    await action();
                    break;
                }
                catch (Exception ex)
                {
                    --retryCount;

                    if (retryCount >= 0)
                    {
                        //await Task.Delay(sleepPeriod);
                        Task.Delay(sleepPeriod);
                    }
                    else
                    {
                        actionAfterRetries.Invoke(ex);
                    }
                }
            } while (retryCount >= 0);
        }

        #endregion
    }
}
