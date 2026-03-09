using Services.TrackingService.Tracking.Contracts;
using Services.TrackingService.Tracking.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Services.TrackingService.Tracking
{
    public sealed class TrackingService : ITrackingService
    {
        #region Constructor

        public TrackingService()
        {
            Trackers = new List<ITracker>();
        }

        #endregion

        #region Properties

        public ICollection<ITracker> Trackers { get; private set; }

        #endregion

        #region Methods

        public void AddTracker(ITracker tracker)
        {
            Trackers.Add(tracker);
        }

        public void RemoveTracker(ITracker tracker)
        {
            Trackers.Remove(tracker);
        }

        public void ClearTrackers()
        {
            Trackers.Clear();
        }

        public void Log(object message)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Verbose))
            {
                tracker.Log(message);
            }
        }

        public void LogException(Exception exception)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Verbose))
            {
                tracker.TraceException(exception);
            }
        }

        public void TrackEvent(object message)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Information))
            {
                tracker.TraceEvent(message);
            }
        }

        public void TrackWarning(object message)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Warning))
            {
                tracker.TraceWarning(message);
            }
        }

        public void TrackError(object message)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Error))
            {
                tracker.TraceError(message);
            }
        }

        public void TrackException(Exception exception)
        {
            foreach (var tracker in Trackers.Where(tracker => tracker.IsEnabled && tracker.LoggingLevel <= LoggingLevel.Exception))
            {
                tracker.TraceException(exception);
            }
        }

        #endregion
    }
}
