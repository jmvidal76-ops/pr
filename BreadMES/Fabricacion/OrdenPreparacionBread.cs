using BreadMES.Envasado.Data.DTO;
using MSM.BreadMES.Utilidades;
using Siemens.Brewing.Shared;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Extensions;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.CO_MSM_FAB_RT.Breads.Extensions;
using Siemens.SimaticIT.CO_MSM_FAB_RT.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace BreadMES.Fabricacion
{
    public class OrdenPreparacionBread
    {
        public enum EstadoEnum
        {
            Creada = 1,
            Iniciada = 2,
            Cancelada = 3,
            Finalizada = 4,
            Cerrada = 5
        }

        public static bool CrearOrden(dynamic orden)
        {
            COB_MSM_ORDEN_PREPARACION_BREAD context = new COB_MSM_ORDEN_PREPARACION_BREAD();

            COB_MSM_ORDEN_PREPARACION op = new COB_MSM_ORDEN_PREPARACION();
            op.ID_ORDEN = orden.Id.ToString();
            op.TIPO_ORDEN = Convert.ToInt32(orden.TipoOrden);
            op.DESCRIPCION = orden.Descripcion.ToString();
            op.VOLUMEN_INICIAL = Convert.ToSingle(orden.VolumenInicial);
            op.VOLUMEN_REAL = Convert.ToSingle(orden.VolumenReal);
            op.UNIDADES = orden.Unidades.ToString();
            op.NOTAS_OFICIAL = orden.NotasOficial.ToString();
            op.NOTAS_SUPERVISOR = orden.NotasSupervisor.ToString();
            op.FECHA_CREACION = DateTime.Now.ToUniversalTime();
            op.ID_UBICACION = Convert.ToInt32(orden.IdUbicacion);
            op.ID_ESTADO = Convert.ToInt32(orden.IdEstado);
            op.FECHA_CREACION = DateTime.Now.ToUniversalTime();
            op.USUARIO_CREACION = orden.Usuario.ToString();

            ReturnValue ret = context.Create(op);

            return ret.succeeded;
        }       

        public static bool AñadirMateriaPrimaOrden(dynamic materiaPrima)
        {
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            COB_MSM_MATERIA_PRIMA_ORDEN_PREP mpo = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP();
            mpo.ID_ORDEN = materiaPrima.IdOrden.ToString();
            mpo.ID_MATERIAL = materiaPrima.IdMaterial.ToString();
            mpo.CANTIDAD = Convert.ToSingle(materiaPrima.Cantidad);
            mpo.FECHA_CREACION = DateTime.Now.ToUniversalTime();
            mpo.USUARIO_CREACION = materiaPrima.Usuario.ToString();

            ReturnValue ret = context.Create(mpo);

            return ret.succeeded;

        }

        public static bool EditarMateriaPrimaOrden(dynamic materiaPrima)
        {
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", materiaPrima.idDetalleMateriaPrima.Value.ToString());
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP mpo = context.Select("", 0, 1, filtro).FirstOrDefault();
            if (mpo != null)
            {
                mpo.CANTIDAD = Convert.ToSingle(materiaPrima.Cantidad);
                mpo.FECHA_EDICION = DateTime.Now.ToUniversalTime();
                mpo.USUARIO_EDICION = materiaPrima.Usuario.Value.ToString();
                mpo.ID_LOTE = materiaPrima.IdLote.Value.ToString();
                ReturnValue res = context.Edit(mpo);
                return res.succeeded;
            }
            else
            {
                return false;
            }

        }

        public static bool BorrarMateriaPrimaOrden(long idMateriaPrimaOrden)
        {
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD context = new COB_MSM_MATERIA_PRIMA_ORDEN_PREP_BREAD();

            string filtro = String.Format("{{PK}}like'%#{0}'", idMateriaPrimaOrden);
            COB_MSM_MATERIA_PRIMA_ORDEN_PREP mpo = context.Select("", 0, 1, filtro).FirstOrDefault();

            if (mpo != null)
            {
                ReturnValue res = context.Delete(mpo);
                return res.succeeded;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> CrearLote(string urlLot, string idOrden, string equipo, string material, string tipoOrden, float cantidad, string unidades) 
        {
            Definition_BREAD definition_BREAD = new Definition_BREAD();
            string filtro = string.Format("{{ID}} = '{0}'", material);
            Definition definition = definition_BREAD.Select("", 0, 1, filtro).FirstOrDefault<Definition>();
            if (definition == null)
            {
                filtro = "{ID} LIKE '%DummyMaterial%'";
                definition = definition_BREAD.Select("", 0, 1, filtro).FirstOrDefault<Definition>();
            }
            MaterialClass_BREAD materialClass_BREAD = new MaterialClass_BREAD();
            MaterialClass materialClass = materialClass_BREAD.SelectByPK(definition.MaterialClassPK).FirstOrDefault<MaterialClass>();
            string materialTypeID = materialClass.MaterialTypeID;
            string materialClassID = definition.MaterialClassID;
            string text2 = tipoOrden;

            DateTime fecha = DateTime.Now;
            SitDateTime _date = SitDateTime.Create(new DateTime?(fecha.ToUniversalTime()), true);
            string text3 = fecha.ToLocalTime().ToString("yyyyMMddHHmmss");
            int num3 = idOrden.LastIndexOf('-') + 1;
            string text4 = idOrden.Substring(num3, idOrden.Length - num3);
            int num = idOrden.IndexOf("-") + 1;
            int num2 = idOrden.IndexOf("-", num);
            string text = idOrden.Substring(num, num2 - num);

            string nombreLote = string.Format("{0}-{1}-{2}-{3}-{4}", new object[] { text, material, text2, text3, text4 });

            string mMUoM = unidades; //SitBread.GetMMUoM(material);
            decimal _cantidad = Convert.ToDecimal(cantidad);
            string empty = string.Empty;
            Lot_DTO lotDTO = new Lot_DTO() { 
                        Location = equipo,
                        Material = definition.ID,
                        Cantidad = _cantidad,
                        UoM = mMUoM,
                        Lote = nombreLote
            };
            var urlCrearLote = string.Concat(urlLot, "LotCreate");
            var _res = await ApiBreadClient.PostAsJsonAsync(urlCrearLote, lotDTO);

            ParamsReturnValue pparamReturn = await _res.Content.ReadAsAsync<ParamsReturnValue>();
            return pparamReturn.succeeded;
        }

        public static bool EditarOrdenPreparacion(dynamic cambio)
        {
            COB_MSM_ORDEN_PREPARACION_BREAD context = new COB_MSM_ORDEN_PREPARACION_BREAD();

            string filtro = String.Format("{{ID_ORDEN}} = '{0}'", cambio.wo.Value.ToString());
            COB_MSM_ORDEN_PREPARACION mpo = context.Select("", 0, 1, filtro).FirstOrDefault();
            if (mpo != null)
            {
                mpo.ID_ESTADO = Convert.ToInt32(cambio.idEstado.Value.ToString());
                mpo.VOLUMEN_REAL = cambio.volumenReal != null ? float.Parse(cambio.volumenReal.Value.ToString()) : mpo.VOLUMEN_REAL;

                int _estado = Convert.ToInt32(cambio.idEstado.Value);

                if (_estado == (int)EstadoEnum.Iniciada)
                {
                    mpo.FECHA_INICIO = DateTime.Now.ToUniversalTime();
                }
                else if (_estado == (int)EstadoEnum.Finalizada)
                {
                    mpo.FECHA_FIN = DateTime.Now.ToUniversalTime();
                }
                
                ReturnValue res = context.Edit(mpo);
                return res.succeeded;
            }
            else
            {
                return false;
            }

        }

        public static bool creaEstadosOrdenes(int id, string nombre)
        {
            COB_MSM_ESTADO_ORDEN_PREP_BREAD context = new COB_MSM_ESTADO_ORDEN_PREP_BREAD();

            COB_MSM_ESTADO_ORDEN_PREP mpo = new COB_MSM_ESTADO_ORDEN_PREP();
            mpo.ID_ESTADO = id;
            mpo.NOMBRE_ESTADO = nombre;

            ReturnValue ret = context.Create(mpo);
            return ret.succeeded;

        }

        public static bool creaTipoOrden(int id, string nombre)
        {
            COB_MSM_TIPO_ORDEN_PREP_BREAD context = new COB_MSM_TIPO_ORDEN_PREP_BREAD();

            COB_MSM_TIPO_ORDEN_PREP mpo = new COB_MSM_TIPO_ORDEN_PREP();
            mpo.ID_TIPO_ORDEN = id;
            mpo.NOMBRE = nombre;

            ReturnValue ret = context.Create(mpo);
            return ret.succeeded;

        }

        public static bool creaTransicionOrdenPreparacion(int idActual, int idSiguiente)
        {
            COB_MSM_TRANSICION_ORDEN_PREP_BREAD context = new COB_MSM_TRANSICION_ORDEN_PREP_BREAD();

            COB_MSM_TRANSICION_ORDEN_PREP mpo = new COB_MSM_TRANSICION_ORDEN_PREP();
            mpo.ID_ESTADO_ACTUAL = idActual;
            mpo.ID_ESTADO_SIGUIENTE = idSiguiente;

            ReturnValue ret = context.Create(mpo);
            return ret.succeeded;

        }

        

    }
}
