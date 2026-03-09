using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_AnalisisSPI
    {
        public string ObtenerComentario(dynamic datos)
        {
            try
            {
                int rangS = int.Parse(datos.rangoSemanas.ToString()) - 1;
                int anyo = int.Parse(datos.anho.ToString());
                int semana = int.Parse(datos.semana.ToString());
                string linea = datos.linea.ToString();
                string tipo = datos.tipo.ToString();
                AnalisisSPI existeAnalisis = new AnalisisSPI();

                using (MESEntities context = new MESEntities())
                {
                    existeAnalisis = context.ANALISIS_SPI.AsNoTracking().FirstOrDefault(d => d.LINEA == linea && d.ANYO == anyo && d.SEMANA == semana && d.TIPO_ANALISIS == tipo);
                }

                return (existeAnalisis == null) ? string.Empty : existeAnalisis.COMENTARIOS;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_AnalisisSPI.ObtenerComentario", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        public bool InsertarComentario(AnalisisSPI analisis)
        {
            try
            {
                AnalisisSPI existeAnalisis = new AnalisisSPI();
                using (MESEntities db = new MESEntities())
                {
                    existeAnalisis = db.ANALISIS_SPI.FirstOrDefault(d => d.LINEA == analisis.LINEA && d.ANYO == analisis.ANYO && d.SEMANA == analisis.SEMANA && d.TIPO_ANALISIS == analisis.TIPO_ANALISIS);

                    if (existeAnalisis == null)
                    { //CREATE
                        db.ANALISIS_SPI.Add(analisis);
                    }
                    else //UPDATE
                    {
                        existeAnalisis.COMENTARIOS = analisis.COMENTARIOS;
                    }

                    db.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AnalisisSPI.InsertarComentario", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        public bool EliminarComentario(AnalisisSPI analisis) 
        {
            try
            {
                AnalisisSPI existeAnalisis = new AnalisisSPI();
                using (MESEntities db = new MESEntities())
                {
                    existeAnalisis = db.ANALISIS_SPI.FirstOrDefault(d => d.LINEA == analisis.LINEA && d.ANYO == analisis.ANYO && d.SEMANA == analisis.SEMANA && d.TIPO_ANALISIS == analisis.TIPO_ANALISIS);

                    if (existeAnalisis != null)
                    {
                        db.ANALISIS_SPI.Remove(existeAnalisis);
                        db.SaveChanges();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "DAO_AnalisisSPI.EliminarComentario", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }
    }
}