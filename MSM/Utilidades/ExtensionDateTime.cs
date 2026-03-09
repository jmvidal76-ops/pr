using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public static class ExtensionDateTime
    {
        public static DateTime KindUTC(this DateTime dt)
        {
            if (dt.Kind == DateTimeKind.Utc)
            {
                return dt;
            }

            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }

        public static DateTime? KindUTC(this DateTime? dt)
        {
            if (dt == null || ((DateTime)dt).Kind == DateTimeKind.Utc)
            {
                return dt;
            }

            return (DateTime?)DateTime.SpecifyKind((DateTime)dt, DateTimeKind.Utc);
        }
    }
}