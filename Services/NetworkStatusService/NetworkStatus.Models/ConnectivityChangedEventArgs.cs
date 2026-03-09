using System;

namespace Services.NetworkStatusServices.NetworkStatus.Models
{
    public class ConnectivityChangedEventArgs : EventArgs
    {
        public ConnectivityChangedEventArgs() { }

        public bool IsConnected { get; set; }
    }
}
