using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System.Collections.ObjectModel;

namespace BreadMES.Envasado
{
    public class ProduccionLlenadoraHora
    {

        public static Collection<COB_MSM_PROD_LLENADORA_HORA> ObtenertPorHoraMaquinaTurnoSinOffset(int horaSQL, string idMaquina, int turno1Id)
        {
            COB_MSM_PROD_LLENADORA_HORA_BREAD consolBread = new COB_MSM_PROD_LLENADORA_HORA_BREAD();
            Collection<COB_MSM_PROD_LLENADORA_HORA> listaHoras = consolBread.Select("", 0, 0, "{HORA}=" + horaSQL.ToString() + " AND {ID_MAQUINA}='" + idMaquina + "' AND {SHC_WORK_SCHED_DAY_PK} = " + turno1Id );

            return listaHoras;
        }

        public static ReturnValue Editar(COB_MSM_PROD_LLENADORA_HORA primeraHora)
        {
            COB_MSM_PROD_LLENADORA_HORA_BREAD consolBread = new COB_MSM_PROD_LLENADORA_HORA_BREAD();
            ReturnValue ret = consolBread.Edit(primeraHora);

            return ret;
        }
    }
}
