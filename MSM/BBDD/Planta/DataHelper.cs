using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Planta
{
    class DataHelper
    {
        public static Guid GetGuid(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (Guid)reader[field] : Guid.Empty;
        }

        public static int GetInt(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? int.Parse(reader[field].ToString()) : 0;
          
        }

        public static short GetShort(SqlDataReader reader, string field)
        {
            return short.Parse((reader[field] != DBNull.Value ? reader[field].ToString() : "0"));
        }

        public static long GetLong(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (long)reader[field] : 0;
        }

        public static decimal GetDecimal(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (decimal)reader[field] : 0;
        }

        public static double GetSingleAsDouble(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (double)(Single)reader[field] : 0;
        }

        public static double  GetDouble(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? Convert.ToDouble(reader[field]) : 0;
        }

        public static bool GetBool(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (bool)reader[field] : false;
        }

        public static DateTime GetDate(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? (DateTime)reader[field] : DateTime.MinValue;
        }

        /// <summary>
        /// Función que devuelve la fecha sin la precisión de milisegundos, para que los filtros de los grid funcionen correctamente
        /// </summary>
        /// <param name="reader">registro de de bbdd</param>
        /// <param name="field">Nombre de la columna del registro</param>
        /// <returns>DateTime sin milisegundos</returns>
        public static DateTime GetDateForFilter(SqlDataReader reader, string field)
        {            
            return reader[field] != DBNull.Value ? ((DateTime)reader[field]).AddMilliseconds(-(((DateTime)reader[field]).Millisecond)) : DateTime.MinValue;
        }

        public static decimal? GetNullableDecimal(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new decimal?((decimal)reader[field]) : null;
        }

        public static double? GetNullableDouble(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new double?((double)reader[field]) : null;
        }

        public static int? GetNullableInt(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new int?((int)reader[field]) : null;
        }

        public static bool? GetNullableBool(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new bool?((bool)reader[field]) : null;
        }

        public static Guid? GetNullableGuid(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new Guid?((Guid)reader[field]) : null;
        }

        public static DateTime? GetNullableDate(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new DateTime?((DateTime)reader[field]) : null;
        }

        /// <summary>
        /// Función que devuelve la fecha sin la precisión de milisegundos, para que los filtros de los grid funcionen correctamente
        /// </summary>
        /// <param name="reader">registro de de bbdd</param>
        /// <param name="field">Nombre de la columna del registro</param>
        /// <returns>DateTime sin milisegundos</returns>
        public static DateTime? GetNullableDateForFilter(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new DateTime?(((DateTime)reader[field]).AddMilliseconds(-(((DateTime)reader[field]).Millisecond))): null;
        }

        public static short? GetNullableShort(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? new short?((short)reader[field]) : null;
        }

        public static string GetString(SqlDataReader reader, string field)
        {
            return reader[field] != DBNull.Value ? reader[field].ToString() : null;
        }

        public static Object SetNullableInt(int? field)
        {
            if (!field.HasValue)
                return DBNull.Value;
            else
                return field.Value;
        }

        public static Object SetNullableBool(bool? field)
        {
            if (!field.HasValue)
                return DBNull.Value;
            else
                return field.Value;
        }

        public static Object SetNullableDecimal(decimal? field)
        {
            if (!field.HasValue)
                return DBNull.Value;
            else
                return field.Value;
        }

        public static Object SetNullableGuid(Guid? field)
        {
            if (!field.HasValue)
                return DBNull.Value;
            else
                return field.Value;
        }

        public static Object SetString(string field)
        {
            if (string.IsNullOrEmpty(field))
                return DBNull.Value;
            else
                return field;
        }

        public static object SetNullableDate(DateTime? field)
        {
            if (!field.HasValue)
                return DBNull.Value;
            else
                return field;
        }

    }
}