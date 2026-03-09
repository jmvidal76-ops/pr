using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Siemens.SimaticIT.SHC.Breads;
using Siemens.SimaticIT.SHC.Breads.Types;
using SITCAB.DataSource.Libraries;


namespace BreadMES.Envasado
{
    public class CalendarioBread
    {
        public static Collection<Holiday> ObtenerFestivos()
        {

            String sortby = "HolidayDate DESC";
            //String condition = String.Format("TIPO={0}", tipo);
            int startInstance = 0, numberOfInstances = 500;

            Holiday_BREAD bread = new Holiday_BREAD();

            Collection<Holiday> collection = bread.Select(sortby, startInstance, numberOfInstances, null);

            return collection;

        }

        public static Holiday ObtenerPorId(long id)
        {
            Holiday result = null;

            Holiday_BREAD bread = new Holiday_BREAD();

            Collection<Holiday> collection = bread.SelectByPK(id);
            if (collection.Count > 0)
            {
                result = collection[0];
            }
            return result;
        }

        public static void Insertar(Holiday festivo)
        {

            Holiday_BREAD bread = new Holiday_BREAD();

            ReturnValue ret = bread.Create(festivo);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Insertando festivo en  CalendarioBread: " + ret.message);
            }

        }

        public static void eliminar(int id)
        {
            Holiday_BREAD bread = new Holiday_BREAD();

            Collection<Holiday> collection = bread.SelectByPK(id);
            if (collection.Count > 0)
            {
                Holiday festivo = collection[0];
                ReturnValue result = bread.Delete(festivo);
                if (!result.succeeded)
                {
                    throw new ApplicationException("Error Eliminandofestivo en  CalendarioBread: " + result.message);
                }
            }
        }

        /// <summary>
        /// Metodo por el cual insertamos un turno en un día concreto
        /// </summary>
        /// <param name="workDate">Fecha del turno</param>
        /// <param name="startDate">Fecha de inicio del Turno</param>
        /// <param name="endDate">Fecha fin del turno</param>
        /// <param name="tipoTurno">Tipo del turno</param>
        /// <param name="idLinea">Linea en la que se planificará el turno</param>
        /// <param name="idTurno">Id del turno (parámetro de salida)</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ReturnValue insertarTurno(DateTime workDate, DateTime startDate, DateTime endDate, string tipoTurno, string idLinea, TimeSpan horaFinTeoricaTurno, string nombreTipoTurno, out int idTurno)
        {
            ShiftCalendar sc = obtenerShiftCalendarPorId(idLinea);

            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();
            DateTime workDateFilter = workDate;
            string filterAux = string.Empty;
            if (nombreTipoTurno.ToLowerInvariant().Equals("noche"))
            {
                if (startDate.ToString("tt", System.Globalization.CultureInfo.InvariantCulture).Equals("AM"))
                {
                    workDateFilter = workDate.AddDays(-1);
                }

                DateTime fechaTurnoNocheAM = workDateFilter.AddDays(1);
                DateTime fechaFinTeoricaTurno = new DateTime(fechaTurnoNocheAM.Year, fechaTurnoNocheAM.Month, fechaTurnoNocheAM.Day, horaFinTeoricaTurno.Hours, horaFinTeoricaTurno.Minutes, horaFinTeoricaTurno.Seconds).ToUniversalTime();

                filterAux = string.Format(" OR ({{WorkDate}} = '{0}' AND {{ShiftTemplateID}} = '{1}' AND {{ShiftCalendarPK}} = '{2}' AND {{WorkStart}} < '{3}')", fechaTurnoNocheAM.ToString("yyyy-MM-dd HH:mm:ss"), tipoTurno, sc.PK, fechaFinTeoricaTurno.ToString("yyyy-MM-dd HH:mm:ss"));
            }

            string filtro = string.Format("{{WorkDate}} = '{0}' AND {{ShiftTemplateID}} = '{1}' AND {{ShiftCalendarPK}} = '{2}'{3}", workDateFilter.ToString("yyyy-MM-dd HH:mm:ss"), tipoTurno, sc.PK, filterAux);

            ShiftCalendarDay shcCDayOld = breadShiftCalendar.Select("", 0, 1, filtro).FirstOrDefault();
            ReturnValue ret = new ReturnValue();
            if (shcCDayOld == null)
            {
                ShiftCalendarDay shcCDay = new ShiftCalendarDay()
                {
                    WorkDate = workDate,
                    WorkStart = startDate,
                    WorkEnd = endDate,
                    ShiftCalendarPK = sc.PK,
                    ShiftTemplateID = tipoTurno,
                    WorkingTimeID = tipoTurno
                };
                ret = breadShiftCalendar.Create(shcCDay);

                idTurno = shcCDay.PK;
            }
            else
            {
                idTurno = shcCDayOld.PK;
                ret.succeeded = true;
            }
            return ret;
        }

        /// <summary>
        /// Metodo para editar un turno
        /// </summary>
        /// <param name="idTurno">Id del turno</param>
        /// <param name="workDate">Fecha del turno</param>
        /// <param name="startDate">Fecha de inicio del Turno</param>
        /// <param name="endDate">Fecha fin del turno</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ReturnValue editarTurno(int idTurno, DateTime workDate, DateTime startDate, DateTime endDate)
        {
            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();

            ShiftCalendarDay shcCDay = breadShiftCalendar.SelectByPK(idTurno).SingleOrDefault();
            shcCDay.WorkDate = workDate;
            shcCDay.WorkStart = startDate;
            shcCDay.WorkEnd = endDate;

            ReturnValue ret = breadShiftCalendar.Edit(shcCDay);
            return ret;
        }

        /// <summary>
        /// Método para borrar un turno
        /// </summary>
        /// <param name="idTurno">Id del turno</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ReturnValue borrarTurno(int idTurno)
        {
            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();

            ShiftCalendarDay shcCDay = breadShiftCalendar.SelectByPK(idTurno).SingleOrDefault();

            ReturnValue ret = breadShiftCalendar.Delete(shcCDay);

            return ret;
        }

        /// <summary>
        /// Obtiene el calendario de una línea
        /// </summary>
        /// <param name="id">Id de la línea</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ShiftCalendar obtenerShiftCalendarPorId(string id)
        {

            ShiftCalendar_BREAD bsh = new ShiftCalendar_BREAD();
            string condicion = string.Format("{{ID}} = '{0}'", id);
            ShiftCalendar sc = bsh.Select("", 0, 0, condicion).SingleOrDefault();
            return sc;
        }

        /// <summary>
        /// Método para insertar una parada en un turno concreto
        /// </summary>
        /// <param name="startDate">Fecha de inicio de la parada</param>
        /// <param name="endDate">Fecha de fin de la parada</param>
        /// <param name="idTurno">Id del turno</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ReturnValue insertarBreak(DateTime startDate, DateTime endDate, int idTurno)
        {
            ShiftCalendarBreak_BREAD breadBreak = new ShiftCalendarBreak_BREAD();

            ShiftCalendarBreak shcBreak = new ShiftCalendarBreak()
            {
                BreakStart = startDate,
                BreakEnd = endDate,
                ShiftCalendarDayPK = idTurno,
                ID = string.Format("break_turno_{0}", idTurno)
            };

            ReturnValue ret = breadBreak.Create(shcBreak);

            return ret;
        }

        /// <summary>
        /// Método para eliminar la parada de un turno
        /// </summary>
        /// <param name="idTurno">Id del turno</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static ReturnValue eliminarBreakPorIdTurno(int idTurno)
        {
            ShiftCalendarBreak_BREAD breadBreak = new ShiftCalendarBreak_BREAD();
            string condicion = string.Format("{{ShiftCalendarDayPK}} = '{0}'", idTurno);
            ShiftCalendarBreak shcBreak = breadBreak.Select("", 0, 0, condicion).SingleOrDefault();
            if (shcBreak != null)
            {
                ReturnValue ret = breadBreak.Delete(shcBreak);
                return ret;
            }
            else
            {
                ReturnValue retTrue = new ReturnValue();
                retTrue.succeeded = true;
                return retTrue;
            }
        }

        public static void getBreak()
        {
            // Break_BREAD bread = new Break_BREAD();
            //ShiftCalendarException_BREAD breadexp = new ShiftCalendarException_BREAD();




            //Siemens.SimaticIT.SHC.Breads.ShiftCalendarBreak_BREAD breadbreak = new ShiftCalendarBreak_BREAD();
            //ShiftCalendarBreak br = breadbreak.SelectByPK(3).FirstOrDefault();
            //breadbreak.Delete(br);
            //ShiftCalendarBreak shcBreak = new ShiftCalendarBreak();

            //shcBreak.BreakStart = new DateTime(2017, 01, 30, 13,0,0);
            //shcBreak.BreakEnd = new DateTime(2017, 01, 30, 14, 0, 0);
            //shcBreak.ID = "PruebasCode";
            //shcBreak.ShiftCalendarDayPK = 12421;
            //ReturnValue ret = breadbreak.Create(shcBreak);


            ShiftCalendar_BREAD bsh = new ShiftCalendar_BREAD();
            Collection<ShiftCalendar> sc = bsh.SelectByPK(1);
            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();
            ShiftCalendarDay scd = breadShiftCalendar.SelectByPK(13631).SingleOrDefault();
            //scd.DayTypeID = "Normal";
            //scd.WorkDate
            //scd.WorkDate = new DateTime(2017, 3, 20);
            scd.WorkStart = new DateTime(2017, 2, 11, 13, 0, 0);
            scd.WorkEnd = new DateTime(2017, 2, 11, 21, 0, 0);
            scd.PK = 0;
            ReturnValue rett = breadShiftCalendar.Create(scd);
            breadShiftCalendar.Delete(scd);
            Collection<ShiftCalendarPatternError> scpe = new Collection<ShiftCalendarPatternError>();
            breadShiftCalendar.Edit(scd);

            ReturnValue retddd = breadShiftCalendar.AddShiftCalendarDays(sc, scd, scd.WorkDate, scd.WorkDate, new[] { true }, 0, "Romance Standard Time", out scpe);



            ReturnValue ret = breadShiftCalendar.AddShiftCalendarDays(sc, scd, new DateTime(2017, 3, 20, 5, 0, 0), new DateTime(2017, 3, 20, 13, 0, 0), new[] { false }, 0, string.Empty, out scpe);
            Collection<ShiftCalendarDay> shc = breadShiftCalendar.SelectByPK(12755);
        }

        /// <summary>
        /// Metodo por el cual insertamos un turno en un día concreto
        /// </summary>
        /// <param name="workDate">Fecha del turno</param>
        /// <param name="startDate">Fecha de inicio del Turno</param>
        /// <param name="endDate">Fecha fin del turno</param>
        /// <param name="tipoTurno">Tipo del turno</param>
        /// <param name="idLinea">Linea en la que se planificará el turno</param>
        /// <returns>booleano que indica el resultado de la operación</returns>
        public static bool insertarTurnoPlantilla(DateTime workDate, DateTime startDate, DateTime endDate, string tipoTurno, string idLinea,string temPlateDay, out int idTurno)
        {
            ShiftCalendar sc = obtenerShiftCalendarPorId(idLinea);

            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();
            DateTime workDateFilter = workDate;

            string filtro = string.Format("{{WorkDate}} = '{0}' AND {{ShiftTemplateID}} = '{1}' AND {{ShiftCalendarPK}} = '{2}'", workDateFilter.ToString("yyyy-MM-dd HH:mm:ss"), tipoTurno, sc.PK);

            ShiftCalendarDay shcCDayOld = breadShiftCalendar.Select("", 0, 1, filtro).FirstOrDefault();
            ReturnValue ret = new ReturnValue();

            if (shcCDayOld == null)
            {
                ShiftCalendarDay shcCDay = new ShiftCalendarDay()
                {
                    WorkDate = workDate,
                    WorkStart = startDate,
                    WorkEnd = endDate,
                    ShiftCalendarPK = sc.PK,
                    ShiftTemplateID = tipoTurno,
                    WorkingTimeID = tipoTurno,
                    WorkingDayTemplateID = temPlateDay
                };
                ret = breadShiftCalendar.Create(shcCDay);
                idTurno = shcCDay.PK;
            }
            else
            {
                shcCDayOld.WorkDate = workDate;
                shcCDayOld.WorkStart = startDate;
                shcCDayOld.WorkEnd = endDate;
                shcCDayOld.ShiftCalendarPK = sc.PK;
                shcCDayOld.ShiftTemplateID = tipoTurno;
                shcCDayOld.WorkingTimeID = tipoTurno;
                shcCDayOld.WorkingDayTemplateID = temPlateDay;
                ret = breadShiftCalendar.Edit(shcCDayOld);

                idTurno = shcCDayOld.PK;
            }
            return ret.succeeded;
        }

        public static bool eliminarTurnosPlantilla(DateTime startDate, DateTime endDate,string idLinea)
        {
            ShiftCalendar sc = obtenerShiftCalendarPorId(idLinea);

            ReturnValue ret = new ReturnValue();
            ShiftCalendarDay_BREAD breadShiftCalendar = new ShiftCalendarDay_BREAD();
            string filtro = string.Format("{{WorkDate}} >= '{0}' AND {{WorkDate}} <= '{1}' AND {{ShiftCalendarPK}} = '{2}'", startDate.ToString("yyyy-MM-dd HH:mm:ss"), endDate.ToString("yyyy-MM-dd HH:mm:ss"), sc.PK);

            List<ShiftCalendarDay> lstShiftCalendarDays = breadShiftCalendar.Select("", 0, 0, filtro).ToList();

            foreach (ShiftCalendarDay item in lstShiftCalendarDays)
            {
                ret = breadShiftCalendar.Delete(item);
            }

            return ret.succeeded;
        }
    }
}
