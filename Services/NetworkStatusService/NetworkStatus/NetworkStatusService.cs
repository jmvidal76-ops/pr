using Services.NetworkStatusServices.NetworkStatus.Contracts;
using Plugin.Connectivity;
using Plugin.Connectivity.Abstractions;

namespace Services.NetworkStatusServices.NetworkStatus
{
    public class NetworkStatusService : INetworkStatusService
    {
        private IConnectivity _connectivity;

        //public bool IsConnected => _connectivity.IsConnected;
        public bool IsConnected { get  { return _connectivity.IsConnected;} }

        public event Models.ConnectivityChangedEventHandler ConnectivityChanged;

        public NetworkStatusService()
        {
            _connectivity = CrossConnectivity.Current;
            _connectivity.ConnectivityChanged += OnConnectivityChanged;
        }

        ~NetworkStatusService()
        {
            _connectivity.ConnectivityChanged -= OnConnectivityChanged;
        }

        //private void OnConnectivityChanged(object sender, ConnectivityChangedEventArgs e) =>
        //    ConnectivityChanged.Invoke(this, new Models.ConnectivityChangedEventArgs { IsConnected = e.IsConnected });


        private void OnConnectivityChanged(object sender, ConnectivityChangedEventArgs e)
        {
            ConnectivityChanged.Invoke(this, new Models.ConnectivityChangedEventArgs { IsConnected = e.IsConnected });
        }

    }
}
