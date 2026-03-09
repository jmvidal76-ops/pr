using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MSM.BreadMES.Utilidades;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Extensions;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.CO_MSM_FAB_RT.Breads.Extensions;
using Siemens.SimaticIT.CO_MSM_FAB_RT.Breads.Types;
using SITCAB.DataSource.Libraries;

namespace BreadMES.Fabricacion
{
    public class PlantillaPreparacionBread
    {



        public static bool CrearPlantilla(dynamic plantilla, out long idPlantilla)
        {
            COB_MSM_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_PLANTILLA_PREPARACION_BREAD();

            COB_MSM_PLANTILLA_PREPARACION pp = new COB_MSM_PLANTILLA_PREPARACION();
            pp.DESCRIPCION = plantilla.Descripcion.Value.ToString();
            pp.ID_TIPO_PLANTILLA = Convert.ToInt32(plantilla.Tipo.Value);
            if (Utils.HasProperty(plantilla, "Ubicacion")) pp.ID_UBICACION = Convert.ToInt32(plantilla.Ubicacion);
            if (Utils.HasProperty(plantilla, "Volumen")) pp.VOLUMEN_FINAL = Convert.ToSingle(plantilla.Volumen.Value);
            if (Utils.HasProperty(plantilla, "Unidades")) pp.UNIDADES = plantilla.Unidades.Value.ToString();
            if (Utils.HasProperty(plantilla, "NotasOficial")) pp.NOTAS_OFICIAL = plantilla.NotasOficial.Value.ToString();
            if (Utils.HasProperty(plantilla, "NotasSupervisor")) pp.NOTAS_SUPERVISOR = plantilla.NotasSupervisor.Value.ToString();
            pp.FECHA_CREACION = DateTime.Now.ToUniversalTime();
            pp.USUARIO_CREACION = plantilla.Usuario;

            ReturnValue ret = context.Create(pp);
            idPlantilla = Convert.ToInt64(pp.PK.Split(new char[] { '#' })[1]);
            return ret.succeeded;
        }

        public static bool EditarPlantilla(dynamic plantilla)
        {
            COB_MSM_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_PLANTILLA_PREPARACION_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", plantilla.Id);
            COB_MSM_PLANTILLA_PREPARACION pp = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (pp != null)
            {
                pp.DESCRIPCION = plantilla.Descripcion.Value.ToString();
                pp.ID_TIPO_PLANTILLA = Convert.ToInt32(plantilla.Tipo.Value);
                if (Utils.HasProperty(plantilla, "Ubicacion")) pp.ID_UBICACION = Convert.ToInt32(plantilla.Ubicacion.Value);
                if (Utils.HasProperty(plantilla, "Volumen")) pp.VOLUMEN_FINAL = Convert.ToSingle(plantilla.Volumen.Value);
                if (Utils.HasProperty(plantilla, "Unidades")) pp.UNIDADES = plantilla.Unidades.Value.ToString();
                if (Utils.HasProperty(plantilla, "NotasOficial")) pp.NOTAS_OFICIAL = plantilla.NotasOficial.Value.ToString();
                if (Utils.HasProperty(plantilla, "NotasSupervisor")) pp.NOTAS_SUPERVISOR = plantilla.NotasSupervisor.Value.ToString();
                pp.FECHA_EDICION = DateTime.Now.ToUniversalTime();
                pp.USUARIO_EDICION = plantilla.Usuario.Value.ToString();
                ReturnValue ret = context.Edit(pp);

                return ret.succeeded;
            }
            else 
            {
                return false;
            }
        }

        public static bool BorrarPlantilla(long idPlantilla, string usuario)
        {
            COB_MSM_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_PLANTILLA_PREPARACION_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", idPlantilla);
            COB_MSM_PLANTILLA_PREPARACION pp = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (pp != null)
            {
                ReturnValue res = context.Delete(pp);
                return res.succeeded;
            }
            else
            {
                return false;
            }
        }  

        public static bool CrearDetallePlantilla(dynamic detallePlantilla)
        {
            COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD();

            COB_MSM_DETALLE_PLANTILLA_PREPARACION dpp = new COB_MSM_DETALLE_PLANTILLA_PREPARACION();
            dpp.ID_PLANTILLA = Convert.ToInt64(detallePlantilla.IdPlantilla.Value);
            dpp.ID_MATERIAL = detallePlantilla.IdMaterial.Value.ToString();
            dpp.CANTIDAD = Convert.ToSingle(detallePlantilla.Cantidad.Value);
            dpp.FECHA_CREACION = DateTime.Now.ToUniversalTime();
            dpp.USUARIO_CREACION = detallePlantilla.Usuario.Value.ToString();

            ReturnValue ret = context.Create(dpp);

            return ret.succeeded;

        }

        public static bool EditarMaterialOrden(dynamic datos)
        {
        COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", datos.idMaterial);
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP dpp = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (dpp != null)
            {
                dpp.CANTIDAD = Convert.ToSingle(datos.Cantidad);
                dpp.FECHA_EDICION = DateTime.Now.ToUniversalTime();
                dpp.USUARIO_EDICION = datos.Usuario.Value.ToString();
                dpp.ID_LOTE = datos.IdLote != null && datos.IdLote != dpp.ID_LOTE ? datos.IdLote.Value.ToString() : dpp.ID_LOTE;
                ReturnValue res = context.Edit(dpp);
                return res.succeeded;
            }
            else
            {
                return false;
            }}

        

        public static bool EditarDetallePlantilla(dynamic detallePlantilla)
        {
            COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", detallePlantilla.idDetallePlantilla.Value.ToString());
            COB_MSM_DETALLE_PLANTILLA_PREPARACION dpp = context.Select("", 0, 1, filtro).FirstOrDefault();
            if (dpp != null)
            {
                dpp.CANTIDAD = Convert.ToSingle(detallePlantilla.Cantidad);
                dpp.FECHA_EDICION = DateTime.Now.ToUniversalTime();
                dpp.USUARIO_EDICION = detallePlantilla.Usuario.Value.ToString();
                ReturnValue res = context.Edit(dpp);
                return res.succeeded;
            }
            else
            {
                return false;
            }

        }

        public static bool BorrarDetallelPlantilla(long idDetallePlantilla)
        {
            COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", idDetallePlantilla);
            COB_MSM_DETALLE_PLANTILLA_PREPARACION dpp = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (dpp != null)
            {
                ReturnValue res = context.Delete(dpp);
                return res.succeeded;
            }
            else
            {
                return false;
            }
        }

        public static bool BorrarMateria(string idMaterial)
        {
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", idMaterial);
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP dpp = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (dpp != null)
            {
                ReturnValue res = context.Delete(dpp);
                return res.succeeded;
            }
            else
            {
                return false;
            }
        }

        public static List<dynamic> ObtenerDetallePlantillaPorIdPlantilla(long idPlantilla)
        {
            COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD context = new COB_MSM_DETALLE_PLANTILLA_PREPARACION_BREAD();

            string filtro = String.Format("{{ID_PLANTILLA}} = '{0}'", idPlantilla);
            List<COB_MSM_DETALLE_PLANTILLA_PREPARACION> lstDetalle = context.Select("", 0, 0, filtro).ToList();
            List<dynamic> lstDetallePlantilla = new List<dynamic>();
            foreach (COB_MSM_DETALLE_PLANTILLA_PREPARACION item in lstDetalle)
            {
                dynamic detallePlantilla = new System.Dynamic.ExpandoObject();
                detallePlantilla.Id  =  Convert.ToInt64(item.PK.Split(new char[] { '#' })[1]);
                detallePlantilla.IdMaterial = item.ID_MATERIAL;
                detallePlantilla.Cantidad = item.CANTIDAD;

                lstDetallePlantilla.Add(detallePlantilla);
            }

            return lstDetallePlantilla;
        }


        public static List<dynamic> ObtenerMaterialesPorIdOrden(string idOrden)
        {
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            string filtro = String.Format("{{ID_ORDEN}} = '{0}'", idOrden);
            List<COB_MSM_MATERIA_PRIMA_ORDEN_PREP> lstDetalle = context.Select("", 0, 0, filtro).ToList();
            List<dynamic> lstDetallePlantilla = new List<dynamic>();
            foreach (COB_MSM_MATERIA_PRIMA_ORDEN_PREP item in lstDetalle)
            {
                dynamic detallePlantilla = new System.Dynamic.ExpandoObject();
                detallePlantilla.Id  =  Convert.ToInt64(item.PK.Split(new char[] { '#' })[1]);
                detallePlantilla.IdMaterial = item.ID_MATERIAL;
                detallePlantilla.Cantidad = item.CANTIDAD;
                detallePlantilla.IdLote = item.ID_LOTE;
                lstDetallePlantilla.Add(detallePlantilla);
            }



            return lstDetallePlantilla;
        }
        
    }
}
