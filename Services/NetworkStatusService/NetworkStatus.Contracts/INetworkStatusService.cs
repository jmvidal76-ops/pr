using Services.NetworkStatusServices.NetworkStatus.Models;

namespace Services.NetworkStatusServices.NetworkStatus.Contracts
{
    public interface INetworkStatusService
    {
        /// <summary>
        /// Gets if there is an active internet connection
        /// </summary>
        bool IsConnected { get; }

        /// <summary>
        /// Connectivity event
        /// </summary>
        event ConnectivityChangedEventHandler ConnectivityChanged;
    }
}
