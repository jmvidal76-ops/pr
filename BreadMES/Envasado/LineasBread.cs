using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using System.Collections.ObjectModel;


namespace BreadMES.Envasado
{
    public class LineasBread
    {
        /// <summary>
        /// Optione el registro de linea a partir de su identificativo, Ej:MSM.BURGOS.ENVASADO.B347
        /// </summary>
        /// <param name="id">Identificativo de linea, Ej: MSM.BURGOS.ENVASADO.B347</param>
        /// <returns></returns>
        public static COB_MSM_LINEAS ObtenerPorId(string id)
        {
            

            COB_MSM_LINEAS result=null;
            
            String sortby = "", condition = String.Format("LINEA={0}", id);
            int startInstance = 0, numberOfInstances = 10;
            // ... 
            // assign meaningful values to sortby, condition, startInstance and numberOfInstances...
            // ...
            COB_MSM_LINEAS_BREAD bread = new COB_MSM_LINEAS_BREAD();

            Collection<COB_MSM_LINEAS> collection = bread.Select(sortby, startInstance, numberOfInstances, condition);
            if (collection.Count > 0) {
                result = collection[0];
            }
            return result;

        }



        public static List<COB_MSM_TIEMPOS_CAMBIOS> ObtenerProductoSalientesLinea(string linea, string producto)
        {
            COB_MSM_TIEMPOS_CAMBIOS_BREAD cambiosBread = new COB_MSM_TIEMPOS_CAMBIOS_BREAD();
            COB_MSM_LINEAS_BREAD lineasBread = new COB_MSM_LINEAS_BREAD();
            int numeroLinea = lineasBread.Select("", 0, 0, "{LINEA}='" + linea + "'").FirstOrDefault().ID_LINEA;

            List<COB_MSM_TIEMPOS_CAMBIOS> listaProductosSalientes = cambiosBread.Select("", 0, 0, "{FK_LINEAS_ID}=" + numeroLinea.ToString() + " AND {ID_PRODUCTO_ENTRANTE}='" + producto + "'").ToList();

            return listaProductosSalientes;
        }

        public static int ObtenerNumeroLinea(string linea)
        {
            COB_MSM_LINEAS_BREAD lineasBread = new COB_MSM_LINEAS_BREAD();
            int numeroLinea = lineasBread.Select("", 0, 0, "{LINEA}='" + linea + "'").FirstOrDefault().ID_LINEA;

            return numeroLinea;
        }
    }
}
