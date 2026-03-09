using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace BreadMES.Envasado
{
    public class ParosPerdidasBread
    {
        public static COB_MSM_PAROS_PERDIDAS ObtenerPorId(long id)
        {
            COB_MSM_PAROS_PERDIDAS result = null;

            //String sortby = "", condition = String.Format("ID_ACCION_MEJORA={0}", id);
            //int startInstance = 0, numberOfInstances = 500;

            COB_MSM_PAROS_PERDIDAS_BREAD bread = new COB_MSM_PAROS_PERDIDAS_BREAD();

            string filtro = "{PK}like" + "'%#" + id.ToString() + "'";

            Collection<COB_MSM_PAROS_PERDIDAS> collection = bread.Select("", 0, 0, filtro);
            if (collection.Count > 0)
            {
                result = collection[0];
            }

            return result;
        }

        public static void Actualizar(COB_MSM_PAROS_PERDIDAS paroPerdidaActualizado)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD bread = new COB_MSM_PAROS_PERDIDAS_BREAD();

            ReturnValue ret = bread.Edit(paroPerdidaActualizado);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Actualizando paro o perdida  ParosPerdidasBread: " + ret.message);
            }
        }

        public static void Insertar(COB_MSM_PAROS_PERDIDAS accionMejora)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD bread = new COB_MSM_PAROS_PERDIDAS_BREAD();

            ReturnValue ret = bread.Create(accionMejora);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Insertando Accion de mejora en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static COB_MSM_PAROS_PERDIDAS ObtenerPorId(string idParo)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD ppBread = new COB_MSM_PAROS_PERDIDAS_BREAD();
            COB_MSM_PAROS_PERDIDAS paro = ppBread.Select("", 0, 0, "{PK} like '%" + idParo + "'").FirstOrDefault();

            return paro;
        }

        public static ReturnValue BorrarParo(COB_MSM_PAROS_PERDIDAS paro)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD ppBread = new COB_MSM_PAROS_PERDIDAS_BREAD();
            ReturnValue ret = ppBread.Delete(paro);

            return ret;
        }

        public static ReturnValue EditarParo(COB_MSM_PAROS_PERDIDAS objeto)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD parosBread = new COB_MSM_PAROS_PERDIDAS_BREAD();
            ReturnValue ret = parosBread.Edit(objeto);

            return ret;
        }

        public static ReturnValue CrearParo(COB_MSM_PAROS_PERDIDAS objeto)
        {
            COB_MSM_PAROS_PERDIDAS_BREAD parosBread = new COB_MSM_PAROS_PERDIDAS_BREAD();
            ReturnValue ret = parosBread.Create(objeto);

            return ret;
        }

        /// <summary>
        /// Método que obtiene los Paros y perdidas que se encuentran desde el inicio del turno hasta el fin del nuevo paro a editar
        /// </summary>
        /// <param name="fechaInicio">Fecha Inicio del turno</param>
        /// <param name="fechaFin">Fecha fin del paro o perdida que se quiere editar o crear</param>
        /// <param name="llenadoraID">Id de la llenadora</param>
        /// <param name="turnoId">Id del turno</param>
        /// <param name="idParo">Id del Paro en caso que se esté editando</param>
        /// <returns></returns>
        public static Collection<COB_MSM_PAROS_PERDIDAS> ObtenerParosPerdidasTurno(DateTime fechaInicio, DateTime fechaFin, string idLlenadora, int idTurno, int idParo) 
        {
            COB_MSM_PAROS_PERDIDAS_BREAD parosBread = new COB_MSM_PAROS_PERDIDAS_BREAD();
            string filtroIdParo = idParo != 0 ? " AND {PK} NOT LIKE '%" + idParo+"'" : string.Empty;
            Collection<COB_MSM_PAROS_PERDIDAS> paros = parosBread.Select("", 0, 0, "{INICIO} BETWEEN '" + fechaInicio.ToString("yyyy/MM/dd HH:mm:ss") 
                                                        + "' AND '" + fechaFin.ToString("yyyy/MM/dd HH:mm:ss") + 
                                                        "' AND ({FK_PAROS_ID}=1 OR {FK_PAROS_ID}=2) AND {MAQUINA}='"
                                                        + idLlenadora + "' AND {SHC_WORK_SCHED_DAY_PK}=" + idTurno + filtroIdParo);

            return paros;
        }

    }
}
