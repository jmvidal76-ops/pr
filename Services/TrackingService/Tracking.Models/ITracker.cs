using System;

namespace Services.TrackingService.Tracking.Models
{
    public interface ITracker
    {
        LoggingLevel LoggingLevel { get; set; }

        bool IsEnabled { get; set; }

        void TraceEvent(object message);

        void Log(object message);

        void TraceError(object message);

        void TraceWarning(object message);

        void TraceException(Exception exception);
    }
}
