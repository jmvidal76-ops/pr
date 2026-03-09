using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace BreadMES.Envasado
{
    public class AccionesMejoraBread
    {
        
        public static COB_MSM_ACCIONES_DE_MEJORA ObtenerPorId(long id) 
        {
            COB_MSM_ACCIONES_DE_MEJORA result = null;

            String sortby = "", condition = String.Format("ID_ACCION_MEJORA={0}", id);
            int startInstance = 0, numberOfInstances = 500;

            COB_MSM_ACCIONES_DE_MEJORA_BREAD bread = new COB_MSM_ACCIONES_DE_MEJORA_BREAD();

            Collection<COB_MSM_ACCIONES_DE_MEJORA> collection = bread.Select(sortby, startInstance, numberOfInstances, condition);
            if (collection.Count > 0)
            {
                result = collection[0];
            }
            return result;
        }

        public static void Insertar(COB_MSM_ACCIONES_DE_MEJORA accionMejora) 
        {
            COB_MSM_ACCIONES_DE_MEJORA_BREAD bread = new COB_MSM_ACCIONES_DE_MEJORA_BREAD();

            ReturnValue ret = bread.Create(accionMejora);
            if (ret.succeeded)
            {
                accionMejora.ID_ACCION_MEJORA = long.Parse(accionMejora.PK.Split('#')[1]);
                ret = bread.Edit(accionMejora);

                if (!ret.succeeded) {
                    throw new ApplicationException("Error Insertando Accion de mejora en AccionesMejoraBread: " + ret.message);
                }
            }
            else
            {
                throw new ApplicationException("Error Insertando Accion de mejora en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static void Actualizar(COB_MSM_ACCIONES_DE_MEJORA accionMejoraActualizado)
        {
            COB_MSM_ACCIONES_DE_MEJORA accionMejoraViejo = ObtenerPorId(accionMejoraActualizado.ID_ACCION_MEJORA);
            accionMejoraActualizado.PK = accionMejoraViejo.PK;
            accionMejoraActualizado.FECHA_ALTA = accionMejoraViejo.FECHA_ALTA;
            
            COB_MSM_ACCIONES_DE_MEJORA_BREAD bread = new COB_MSM_ACCIONES_DE_MEJORA_BREAD();
            
            ReturnValue ret = bread.Edit(accionMejoraActualizado);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Actualizando Accion de mejora en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static void insertarAccionMejoraParo(COB_MSM_ACCIONES_PAROS nuevaAccionParo)
        {
            COB_MSM_ACCIONES_PAROS_BREAD bread = new COB_MSM_ACCIONES_PAROS_BREAD();

            ReturnValue ret = bread.Create(nuevaAccionParo);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Insertando Accion Paro en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static void insertarAccionMejoraCambios(COB_MSM_ACCIONES_CAMBIOS nuevaAccionCambio)
        {
            COB_MSM_ACCIONES_CAMBIOS_BREAD bread = new COB_MSM_ACCIONES_CAMBIOS_BREAD();

            ReturnValue ret = bread.Create(nuevaAccionCambio);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Insertando Accion Cambio en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static void insertarAccionMejoraArranque(COB_MSM_ACCIONES_ARRANQUES nuevaAccionArranque)
        {
            COB_MSM_ACCIONES_ARRANQUES_BREAD bread = new COB_MSM_ACCIONES_ARRANQUES_BREAD();

            ReturnValue ret = bread.Create(nuevaAccionArranque);
            if (!ret.succeeded)
            {
                throw new ApplicationException("Error Insertando Accion Arranque en  AccionesMejoraBread: " + ret.message);
            }
        }

        public static void eliminarAccionMejora(int idAccionMejora)
        {
            eliminarAccionMejoraParos(idAccionMejora);
            eliminarAccionMejoraCambios(idAccionMejora);
            eliminarAccionMejoraArranques(idAccionMejora);

            COB_MSM_ACCIONES_DE_MEJORA_BREAD bread = new COB_MSM_ACCIONES_DE_MEJORA_BREAD();
            COB_MSM_ACCIONES_DE_MEJORA accionMejora = ObtenerPorId(idAccionMejora);
            ReturnValue result = bread.Delete(accionMejora);
            if (!result.succeeded) {
                throw new ApplicationException("Error Eliminando Accion de mejora en  AccionesMejoraBread: " + result.message);
            }
            
        }

        public static void eliminarAccionMejoraParos(int idAccionMejora)
        {
            COB_MSM_ACCIONES_PAROS_BREAD bread = new COB_MSM_ACCIONES_PAROS_BREAD();

            String sortby = "", condition = String.Format("FK_ACCIONES_DE_MEJORA_ID={0}", idAccionMejora);
            int startInstance = 0, numberOfInstances = 500;


            foreach (COB_MSM_ACCIONES_PAROS accionParo in bread.Select(sortby, startInstance, numberOfInstances, condition))
            {
                ReturnValue ret = bread.Delete(accionParo);
                if (!ret.succeeded)
                {
                    throw new ApplicationException("Error Eliminando Accion Paro en  AccionesMejoraBread: " + ret.message);
                }
            }
        }

        public static void eliminarAccionMejoraCambios(int idAccionMejora)
        {
            COB_MSM_ACCIONES_CAMBIOS_BREAD bread = new COB_MSM_ACCIONES_CAMBIOS_BREAD();

            String sortby = "", condition = String.Format("FK_ACCION_MEJORA_ID={0}", idAccionMejora);
            int startInstance = 0, numberOfInstances = 500;


            foreach (COB_MSM_ACCIONES_CAMBIOS accionCambio in bread.Select(sortby, startInstance, numberOfInstances, condition))
            {
                ReturnValue ret = bread.Delete(accionCambio);
                if (!ret.succeeded)
                {
                    throw new ApplicationException("Error Eliminando Accion Cambio en  AccionesMejoraBread: " + ret.message);
                }
            }
        }

        public static void eliminarAccionMejoraArranques(int idAccionMejora)
        {
            COB_MSM_ACCIONES_ARRANQUES_BREAD bread = new COB_MSM_ACCIONES_ARRANQUES_BREAD();

            String sortby = "", condition = String.Format("FK_ACCION_MEJORA_ID={0}", idAccionMejora);
            int startInstance = 0, numberOfInstances = 500;


            foreach (COB_MSM_ACCIONES_ARRANQUES accionArranque in bread.Select(sortby, startInstance, numberOfInstances, condition))
            {
                ReturnValue ret = bread.Delete(accionArranque);
                if (!ret.succeeded)
                {
                    throw new ApplicationException("Error Eliminando Accion Arranque en  AccionesMejoraBread: " + ret.message);
                }
            }
        }

        public static List<COB_MSM_ACCIONES_CAMBIOS> ObtenerAccionMejoraCambioPorID(string ordenCambioArranqueID )
        {
            COB_MSM_ACCIONES_CAMBIOS_BREAD mejoraBread = new COB_MSM_ACCIONES_CAMBIOS_BREAD();
            List<COB_MSM_ACCIONES_CAMBIOS> mejora = mejoraBread.Select("", 0, 0, "{ID_CAMBIO}='" + ordenCambioArranqueID + "'").ToList();

            return mejora;
        }

        public static ReturnValue BorrarAccionMejoraCambio(COB_MSM_ACCIONES_CAMBIOS paromejora)
        {
            COB_MSM_ACCIONES_CAMBIOS_BREAD mejoraBread = new COB_MSM_ACCIONES_CAMBIOS_BREAD();
            ReturnValue ret = mejoraBread.Delete(paromejora);
            return ret;
        }

        public static List<COB_MSM_ACCIONES_ARRANQUES> ObtenerAccionMejoraArranquePorID(string ordenCambioArranqueID)
        {
            COB_MSM_ACCIONES_ARRANQUES_BREAD mejoraBread = new COB_MSM_ACCIONES_ARRANQUES_BREAD();
            List<COB_MSM_ACCIONES_ARRANQUES> mejora = mejoraBread.Select("", 0, 0, "{ID_ARRANQUE}='" + ordenCambioArranqueID + "'").ToList();

            return mejora;
        }

        public static ReturnValue BorrarAccionMejoraArranque(COB_MSM_ACCIONES_ARRANQUES paromejora)
        {
            COB_MSM_ACCIONES_ARRANQUES_BREAD mejoraBread = new COB_MSM_ACCIONES_ARRANQUES_BREAD();
            ReturnValue ret = mejoraBread.Delete(paromejora);

            return ret;
        }

        public static List<COB_MSM_ACCIONES_PAROS> ObtenerAccionMejoraParosPorID(int idParo)
        {
            COB_MSM_ACCIONES_PAROS_BREAD mejoraBread = new COB_MSM_ACCIONES_PAROS_BREAD();
            List<COB_MSM_ACCIONES_PAROS> mejora = mejoraBread.Select("", 0, 0, "{ID_PARO}=" + idParo).ToList();

            return mejora;
        }

        public static ReturnValue eliminarAccionMejoraParos(COB_MSM_ACCIONES_PAROS paromejora)
        {
            COB_MSM_ACCIONES_PAROS_BREAD mejoraBread = new COB_MSM_ACCIONES_PAROS_BREAD();
            ReturnValue ret = mejoraBread.Delete(paromejora);

            return ret;
        }
    }
}
