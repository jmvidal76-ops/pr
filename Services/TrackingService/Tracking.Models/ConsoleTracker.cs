using System;
using System.Diagnostics;

namespace Services.TrackingService.Tracking.Models
{ 
    public sealed class ConsoleTracker : ITracker
    {
        #region Fields

        private const LoggingLevel DefaultLoggingLevel = LoggingLevel.Verbose;
        private const bool DefaultIsEnabled = true;
        private const string LogToken = "LOG";
        private const string InfoToken = "INFO";
        private const string WarningToken = "WARNING";
        private const string ErrorToken = "ERROR";
        private const string ExceptionToken = "EXCEPTION";
        private const string MessageFormat = "{0} - {1}: {2}";
        private const string DateFormat = "HH:mm:ss.FFF";

        #endregion

        #region Properties

        public LoggingLevel LoggingLevel { get; set; }

        public bool IsEnabled { get; set; }

        #endregion

        #region Constructor 

        public ConsoleTracker()
        {
            LoggingLevel = DefaultLoggingLevel;
            IsEnabled = DefaultIsEnabled;
        }

        public ConsoleTracker(LoggingLevel loggingLevel)
        {
            LoggingLevel = loggingLevel;
            IsEnabled = DefaultIsEnabled;
        }

        #endregion

        #region Public Methods

        public void Log(object message)
        {
            if (message == null) return;
            Debug.WriteLine(string.Format(MessageFormat, GetTimeStamp(), LogToken, message));
        }

        public void TraceEvent(object message)
        {
            if (message == null) return;
            Debug.WriteLine(string.Format(MessageFormat, GetTimeStamp(), InfoToken, message));
        }

        public void TraceError(object message)
        {
            if (message == null) return;
            Debug.WriteLine(string.Format(MessageFormat, GetTimeStamp(), ErrorToken, message));
        }

        public void TraceWarning(object message)
        {
            if (message == null) return;
            Debug.WriteLine(string.Format(MessageFormat, GetTimeStamp(), WarningToken, message));
        }

        public void TraceException(Exception exception)
        {
            while (exception != null)
            {
                if (!string.IsNullOrEmpty(exception.Message))
                {
                    Debug.WriteLine(string.Format(MessageFormat, GetTimeStamp(), ExceptionToken, exception.Message));
                }
                exception = exception.InnerException;
            }
        }

        #endregion

        #region Private Methods

        private string GetTimeStamp()
        {
            return DateTime.Now.ToString(DateFormat);
        }

        #endregion
    }
}
