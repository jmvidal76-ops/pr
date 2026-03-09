using System;

namespace Services.NetworkService.Network.Models
{
    public class RequestSettings
    {
        #region Fields

        private static readonly int RetriesDefault = 0;
        private static readonly bool RunInNewThreadDefault = false;
        private static readonly TimeSpan SleepPeriodDefault = TimeSpan.FromSeconds(1);

        #endregion

        #region Properties

        public bool RunInNewThread { get; private set; }

        public int RetriesCount { get; private set; }

        public TimeSpan SleepPeriod { get; private set; }

        #endregion

        #region Constructors

        public RequestSettings(bool runInNewThread, int retriesCount, TimeSpan sleepPeriod)
        {
            RetriesCount = retriesCount;
            RunInNewThread = runInNewThread;
            SleepPeriod = sleepPeriod;
        }

        public RequestSettings(bool runInNewThread, int retriesCount)
            : this(runInNewThread, retriesCount, SleepPeriodDefault)
        {
        }

        public RequestSettings(int retriesCount, TimeSpan sleepPeriod)
            : this(RunInNewThreadDefault, retriesCount, sleepPeriod)
        {
        }

        public RequestSettings(bool runInNewThread)
            : this(runInNewThread, RetriesDefault, SleepPeriodDefault)
        {
        }

        public RequestSettings(int retriesCount)
            : this(RunInNewThreadDefault, RetriesDefault, SleepPeriodDefault)
        {
        }

        public RequestSettings(TimeSpan sleepPeriod)
            : this(RunInNewThreadDefault, RetriesDefault, sleepPeriod)
        {
        }

        public RequestSettings()
            : this(RunInNewThreadDefault, RetriesDefault, SleepPeriodDefault)
        {
        }

        #endregion
    }
}
