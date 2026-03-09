using System.Linq;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using System.Collections.ObjectModel;


namespace BreadMES.Envasado
{
    public class TiemposBread
    {
        public static bool ModificarTiempoCambio(long idTiempoCambio, int t1, int t2, int tpre, int tiempoMedio1, int tiempoMedio2, bool? inhabilitarCalculo)
        {
            string filtro = "{PK}like" + "'%#" + idTiempoCambio + "'";
            COB_MSM_TIEMPOS_CAMBIOS_BREAD daoCambios = new COB_MSM_TIEMPOS_CAMBIOS_BREAD();
            Collection<COB_MSM_TIEMPOS_CAMBIOS> cambio = daoCambios.Select("", 0, 1, filtro);
            
            if (t1 != -1) cambio[0].TIEMPO_OBJETIVO_1 = t1;
            if (t2 != -1) cambio[0].TIEMPO_OBJETIVO_2 = t2;
            if (tpre != -1) cambio[0].TIEMPO_PREACTOR = tpre;
            if (tiempoMedio1 != -1) cambio[0].TIEMPO_CALCULADO_1 = tiempoMedio1;
            if (tiempoMedio2 != -1) cambio[0].TIEMPO_CALCULADO_2 = tiempoMedio2;
            if (inhabilitarCalculo != null) cambio[0].INHABILITAR_CALCULO = inhabilitarCalculo.Value ? (short)1 : (short)0;

            daoCambios.Edit(cambio[0]);

            return true;
        }

        public static void ModificarTiempoCambio(dynamic datos, int numeroLinea)
        {
            string producto = datos.productoEnt.ToString();
            string idProducto = producto.Substring(0, producto.IndexOf('-')).Trim();
            string productoSal = datos.productoSal.ToString();
            string idProductoSal = productoSal.Substring(0, productoSal.IndexOf('-')).Trim();
            int tiempoObjLle = int.Parse(datos.toLlenadora.ToString());
            int tiempoObjPal = int.Parse(datos.toPaletizadora.ToString());
            int tiempoPreactor = int.Parse(datos.tiempoPreactor.ToString());

            var cobTiemposCambios = new COB_MSM_TIEMPOS_CAMBIOS_BREAD();
            var tiempoCambio = cobTiemposCambios.Select("", 0, 0, "{FK_LINEAS_ID}='" + numeroLinea.ToString() + "' AND {ID_PRODUCTO_ENTRANTE}='" + idProducto + "' AND {ID_PRODUCTO_SALIENTE}='" + idProductoSal + "'").FirstOrDefault();

            tiempoCambio.TIEMPO_OBJETIVO_1 = tiempoObjLle;
            tiempoCambio.TIEMPO_OBJETIVO_2 = tiempoObjPal;
            tiempoCambio.TIEMPO_PREACTOR = tiempoPreactor;

            cobTiemposCambios.Edit(tiempoCambio);
        }

        public static bool ModificarTiempoArranque(long idTiempoArranque, int t1, int t2, int tpre, int tiempoMedio1, int tiempoMedio2, bool? inhabilitarCalculo)
        {
            string filtro = "{PK}like" + "'%#" + idTiempoArranque + "'";
            COB_MSM_TIEMPOS_ARRANQUES_BREAD daoArranques = new COB_MSM_TIEMPOS_ARRANQUES_BREAD();
            Collection<COB_MSM_TIEMPOS_ARRANQUES> arranque = daoArranques.Select("", 0, 1, filtro);
            
            if (t1 != -1) arranque[0].TIEMPO_OBJETIVO_1 = t1;
            if (t2 != -1) arranque[0].TIEMPO_OBJETIVO_2 = t2;
            if (tpre != -1) arranque[0].TIEMPO_PREACTOR = tpre;
            if (tiempoMedio1 != -1) arranque[0].TIEMPO_CALCULADO_1 = tiempoMedio1;
            if (tiempoMedio2 != -1) arranque[0].TIEMPO_CALCULADO_2 = tiempoMedio2;
            if (inhabilitarCalculo != null) arranque[0].INHABILITAR_CALCULO = inhabilitarCalculo.Value ? (short)1 : (short)0;

            daoArranques.Edit(arranque[0]);

            return true;
        }

        public static void ModificarTiempoArranque(dynamic datos, int numeroLinea)
        {
            string producto = datos.productoEnt.ToString();
            string idProducto = producto.Substring(0, producto.IndexOf('-')).Trim();
            string tipoArranque = datos.tipoArranque.ToString();
            int tiempoObjLle = int.Parse(datos.toLlenadora.ToString());
            int tiempoObjPal = int.Parse(datos.toPaletizadora.ToString());
            int tiempoPreactor = int.Parse(datos.tiempoPreactor.ToString());

            var cobTiemposArranques = new COB_MSM_TIEMPOS_ARRANQUES_BREAD();
            var tiempoArranque = cobTiemposArranques.Select("", 0, 0, "{FK_LINEAS_ID}='" + numeroLinea.ToString() + "' AND {ID_PRODUCTO_ENTRANTE}='" + idProducto + "' AND {FK_ARRANQUES_ID}='" + tipoArranque.ToString() + "'").FirstOrDefault();

            tiempoArranque.TIEMPO_OBJETIVO_1 = tiempoObjLle;
            tiempoArranque.TIEMPO_OBJETIVO_2 = tiempoObjPal;
            tiempoArranque.TIEMPO_PREACTOR = tiempoPreactor;

            cobTiemposArranques.Edit(tiempoArranque);
        }

        public static COB_MSM_TIEMPOS_ARRANQUES ObtenerTiempodeArranque(int numeroLinea, string producto, string tipoArranque)
        {
            COB_MSM_TIEMPOS_ARRANQUES_BREAD arranquesBread = new COB_MSM_TIEMPOS_ARRANQUES_BREAD();
            COB_MSM_TIEMPOS_ARRANQUES tArran = arranquesBread.Select("", 0, 0, "{FK_LINEAS_ID}='" + numeroLinea.ToString() + "' AND {ID_PRODUCTO_ENTRANTE}='" + producto + "' AND {FK_ARRANQUES_ID}='" + tipoArranque.ToString() + "'").FirstOrDefault();

            return tArran;
        }

        public static COB_MSM_TIEMPOS_CAMBIOS ObtenerTiempodeCambio(int numeroLinea, string producto, string productoSal)
        {
            COB_MSM_TIEMPOS_CAMBIOS_BREAD cambiosBread = new COB_MSM_TIEMPOS_CAMBIOS_BREAD();
            COB_MSM_TIEMPOS_CAMBIOS tCamb = cambiosBread.Select("", 0, 0, "{FK_LINEAS_ID}='" + numeroLinea.ToString() + "' AND {ID_PRODUCTO_ENTRANTE}='" + producto + "' AND {ID_PRODUCTO_SALIENTE}='" + productoSal.ToString() + "'").FirstOrDefault();

            return tCamb;
        }
    }
}
