//------------------------------------------------------------------------------
// <copyright file="CSSqlFunction.cs" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

using System;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Server;
using System.Collections.Generic;
using System.Globalization;

public partial class UserDefinedFunctions
{
    [Microsoft.SqlServer.Server.SqlFunction]
    public static SqlDateTime ToLocalDateTime(SqlDateTime date)
    {        
        // Put your code here
        return date.Value.ToLocalTime();
    }

    [Microsoft.SqlServer.Server.SqlFunction]
    public static SqlString BrewingPlanningPreparation()
    {
        
        int weeksNumber = DateTimeFormatInfo.CurrentInfo.Calendar.GetWeekOfYear(new DateTime(DateTime.Now.Year, 12, 31), CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        int currentWeek = DateTimeFormatInfo.CurrentInfo.Calendar.GetWeekOfYear(DateTime.Now, DateTimeFormatInfo.CurrentInfo.CalendarWeekRule, DateTimeFormatInfo.CurrentInfo.FirstDayOfWeek);

        int startWeek = currentWeek + 3 > weeksNumber ? (currentWeek + 3) - weeksNumber : currentWeek + 3;
        int endWeek = startWeek + 4 > weeksNumber ? (startWeek + 4) - weeksNumber : startWeek + 4;

        return GetJulianoDateFromWeekOfYear(currentWeek, false) + "-" + 
               GetJulianoDateFromWeekOfYear(startWeek, (startWeek < currentWeek ? true : false)) + "-" +
               GetJulianoDateFromWeekOfYear(endWeek, (endWeek < currentWeek ? true : false));
    }

    private static String GetJulianoDateFromWeekOfYear(int week, bool newYear)
    {
        int aux2;
        aux2 = newYear ? DateTime.Now.Year + 1 : DateTime.Now.Year;
        DateTime aux = DateTimeFormatInfo.CurrentInfo.Calendar.AddWeeks(new DateTime(aux2, 1, 1), week);
        aux = aux.AddDays(-12);
        return (Convert.ToInt32(string.Format("{0:yy}{1:D3}", aux, aux.DayOfYear)) + 100000).ToString();
    }

    //[Microsoft.SqlServer.Server.SqlFunction]
    //public static void BrewingPreparation()
    //{
    //    //PlanificacionFABController controller = new PlanificacionFABController();
    //    //List<PlanificacionCoccionStr> items = new List<PlanificacionCoccionStr>();
    //    ////String currentWeek = controller.GetCurrentWeek();
    //    ////String weeksCount = controller.GetWeeksNumber();
    //    ////int startWeek = Convert.ToInt32(currentWeek) + 3 > Convert.ToInt32(weeksCount) ? (Convert.ToInt32(currentWeek) + 3) - Convert.ToInt32(weeksCount) : Convert.ToInt32(currentWeek) + 3;
    //    ////int endWeek = startWeek + 4 > Convert.ToInt32(weeksCount) ? (startWeek + 4) - Convert.ToInt32(weeksCount) : startWeek + 4;
    //    //String[] aux = BrewingPlanningPreparation().ToString().Split('-');
    //    //items = DAO_Planificacion.SetPlanning(aux[0],aux[1],aux[2]);
    //}
}
