using Services.TrackingService.Tracking.Models;
using System;

namespace Services.TrackingService.Tracking.Contracts
{
    public interface ITrackingService
    {
        void AddTracker(ITracker tracker);

        void RemoveTracker(ITracker tracker);

        void ClearTrackers();

        void Log(object message);

        void LogException(Exception exception);

        void TrackEvent(object message);

        void TrackError(object message);

        void TrackWarning(object message);

        void TrackException(Exception exception);
    }
}
