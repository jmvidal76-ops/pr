using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Extensions;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using BreadMES.Envasado.Envasado;

namespace BreadMES.Envasado
{
    public class OrdenesBread
    {
        public static bool editarDatosGeneralesOrden(DateTime? fInicio, DateTime? fFin, string id)
        {

            Order_BREAD ordBread = BreadFactory.Create<Order_BREAD>();
            string filtro = string.Format("{{ID}} = '{0}'", id);
            Order order = ordBread.Select("", 0, -1, filtro).FirstOrDefault();

            order.ActualStartTime = fInicio != null ? fInicio.Value.ToUniversalTime() : order.ActualStartTime;
            order.ActualEndTime = fFin != null ? fFin.Value.ToUniversalTime() : order.ActualEndTime;

            ReturnValue returnvalue = ordBread.Edit(order);
            return returnvalue.succeeded;
        }
        public static ReturnValue changeOrderActualDates(string id, string estado)
        {
            ReturnValue value = new ReturnValue();
            value.succeeded = true;
            try
            {
                Order_BREAD ordBread = BreadFactory.Create<Order_BREAD>();
                string filtro = string.Format("{{ID}} = '{0}'", id);

                Order order = ordBread.Select("", 0, -1, filtro).First();              

                if (order.ActualStartTime == null && (estado == "Producción"))
                {
                    //if we change to INICIANDO o PRODUCCION and its actual_start_time is null we have to update it to actual date
                    DateTime utcdate = DateTime.UtcNow;
                    TimeSpan span = utcdate.Subtract(DateTime.Now);

                    order.ActualStartTime = DateTime.UtcNow;
                    order.ActualStartTimeBias = (short)span.Minutes;
                    order.ActualEndTime = null; //ponemos el end time a null porque no puede ser mayor al actual
                    order.ActualEndTimeBias = null;
                    value = ordBread.Edit(order);


                    
                }
                else if ( estado == "Pausada" || (order.StatusID == "Producción" && order.StatusID  != estado ) )
                {
                    //Antes sólo se cambiaba la fecha fin se pasa de producción a otro estado
                    //Por la incidencia #334    se cambia siempre que pasa a Finalizado o Pausada
                    DateTime utcdate = DateTime.UtcNow;
                    TimeSpan span = utcdate.Subtract(DateTime.Now);

                   
                    order.ActualEndTime = DateTime.UtcNow;
                    order.ActualEndTimeBias = (short)span.Minutes;
                    value = ordBread.Edit(order);
                }

               
            }
            catch (Exception ex)
            {
                value.succeeded = false;
                value.message = ex.Message;                
            }
            return value;
        }
        public static ReturnValue changeActualStartTime(string id)
        {
            ReturnValue value = new ReturnValue();
            try
            {
                Order_BREAD ordBread = BreadFactory.Create<Order_BREAD>();
                string filtro = string.Format("{{ID}} = '{0}'", id);

                Order order = ordBread.Select("", 0, -1, filtro).First();

                DateTime utcdate = DateTime.UtcNow;
                TimeSpan span = utcdate.Subtract(DateTime.Now);

                order.ActualStartTime = DateTime.UtcNow;
                order.ActualStartTimeBias = (short)span.Minutes;
                value = ordBread.Edit(order);
            }
            catch (Exception ex)
            {
                value.succeeded = false;
                value.message = ex.Message;
            }
            return value;
        }
        public static ReturnValue changeActualEndTime(string id)
        {
            ReturnValue value = new ReturnValue();
            try
            {
                Order_BREAD ordBread = BreadFactory.Create<Order_BREAD>();
                string filtro = string.Format("{{ID}} = '{0}'", id);

                Order order = ordBread.Select("", 0, -1, filtro).First();

                DateTime utcdate = DateTime.UtcNow;
                TimeSpan span = utcdate.Subtract(DateTime.Now);

                order.ActualEndTime = DateTime.UtcNow;
                order.ActualEndTimeBias = (short)span.Minutes;
                value = ordBread.Edit(order);
            }
            catch (Exception ex)
            {
                value.succeeded = false;
                value.message = ex.Message;
            }
            return value;
        }
        public static ReturnValue  changeOrderStatus(string id, string estado)
        {
            ReturnValue value = new ReturnValue();
            try {
                Order_BREAD ordBread = BreadFactory.Create<Order_BREAD>();
                string filtro = string.Format("{{ID}} = '{0}'", id);

                Order order = ordBread.Select("", 0, -1, filtro).First();
                Order_BREAD.OrderStatusResult orderStatusResult = new Order_BREAD.OrderStatusResult();
               
                value = ordBread.SetStatus(order.ID, estado, Order_BREAD.StateTransitionCodes.FORCE_TRANSITION, order.LifeCycleID, out orderStatusResult);
            }
            catch (Exception ex)
            {
                value.succeeded = false;
                value.message = ex.Message;
            }
            return value;
        }

        public static Order ObtenerOrden(string orden)
        {
            Order_BREAD oBread = BreadFactory.Create<Order_BREAD>();
            Order ord = oBread.Select("", 0, 0, "{ID}='" + orden + "'").FirstOrDefault();

            return ord;
        }

        public static ReturnValue BorrarOrden(Order orden)
        {
            Order_BREAD oBread = BreadFactory.Create<Order_BREAD>();
            ReturnValue ret = oBread.Delete(orden);

            return ret;
        }

        public static List<OrderProperty> ObtenerPropiedadesOrden(int ordenCambioArranquePK)
        {
            OrderProperty_BREAD opBread = new OrderProperty_BREAD();
            List<OrderProperty> listaProp = opBread.SelectByOrderPk(ordenCambioArranquePK, "", 0, 0, "").ToList();

            return listaProp;
        }

        public static ReturnValue BorrarPropiedadOrden(OrderProperty propiedad)
        {
            OrderProperty_BREAD opBread = BreadFactory.Create<OrderProperty_BREAD>();
            ReturnValue ret = opBread.Delete(propiedad);

            return ret;
        }

        public static OrderProperty ObtenerPropiedadOrdenByName(int ordenPK, string propName)
        {
            OrderProperty_BREAD opBread = new OrderProperty_BREAD();
            OrderProperty op = opBread.SelectByOrderPk(ordenPK, "", 0, 0, String.Format("{{Name}}='{0}'", propName)).FirstOrDefault();

            return op;
        }

        public static ReturnValue EditarOrden(Order orden)
        {
            Order_BREAD oBread = BreadFactory.Create<Order_BREAD>();
            ReturnValue ret = oBread.Edit(orden);

            return ret;
        }

        public static ReturnValue CrearPropiedadOrden(OrderProperty op1)
        {
            OrderProperty_BREAD opBread = BreadFactory.Create<OrderProperty_BREAD>();
            ReturnValue ret = opBread.Create(op1);

            return ret;
        }

        public static COB_MSM_HISTORICO_ORDENES GetHistoricoOrden(string codigo, int estado)
        {
            COB_MSM_HISTORICO_ORDENES_BREAD context = new COB_MSM_HISTORICO_ORDENES_BREAD();

            string filtro = string.Format("{{ORDER_ID}} = '{0}' AND {{ESTADO}} = '{1}'", codigo, estado);
            COB_MSM_HISTORICO_ORDENES cobH = context.Select("", 0, -1, filtro).FirstOrDefault();

            return cobH;
        }

        public static string obtenerOrdenAnterior(string idOrden, string idLinea)
        {
            Order_BREAD oBread = new Order_BREAD();
            Order ordenSel = oBread.Select("", 0, 0, "{ID}='" + idOrden + "'").FirstOrDefault();
            DateTime nuevaFecha = ordenSel.ActualStartTime.Value.Subtract(new TimeSpan(0, 0, 1));
            string fecha = nuevaFecha.Year + "/" + nuevaFecha.Month + "/" + nuevaFecha.Day + " " + nuevaFecha.Hour + ":" + nuevaFecha.Minute + ":" + nuevaFecha.Second;
            Order orden = oBread.Select("ActualStartTime DESC", 0, 1, "({ID} like '%OM-%' OR {ID} like '%OP-%') AND {ActualStartTime}<='" + fecha + "' AND {ID} like '%.%' AND {PPRName} like '%" + idLinea + "%'").FirstOrDefault();
            Definition_BREAD defBread = new Definition_BREAD();
            Definition mat = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").FirstOrDefault();
            return orden.ID + ";" + mat.ID + " - " + mat.Description;
        }

        public static string obtenerOrdenPosterior(string idOrden, string idLinea)
        {
            Order_BREAD oBread = new Order_BREAD();
            Order ordenSel = oBread.Select("", 0, 0, "{ID}='" + idOrden + "'").FirstOrDefault();
            DateTime nuevaFecha = ordenSel.ActualStartTime.Value.AddSeconds(1);
            string fecha = nuevaFecha.Year + "/" + nuevaFecha.Month + "/" + nuevaFecha.Day + " " + nuevaFecha.Hour + ":" + nuevaFecha.Minute + ":" + nuevaFecha.Second;
            Order orden = oBread.Select("ActualStartTime ASC", 0, 1, "({ID} like '%OM-%' OR {ID} like '%OP-%') AND {ActualStartTime}>='" + fecha + "' AND {ID} like '%.%' AND {PPRName} like '%" + idLinea + "%'").FirstOrDefault();
            Definition_BREAD defBread = new Definition_BREAD();
            Definition mat = defBread.Select("", 0, 0, "{ID}='" + orden.FinalMaterialID + "'").FirstOrDefault();
            return orden.ID + ";" + mat.ID + " - " + mat.Description;
        }
    }
}
