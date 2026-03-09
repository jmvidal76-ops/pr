using MSM.BBDD.Model;
using MSM.Mappers.DTO.Logistica;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Logistica
{
    public class Mapper_OEEPlanificaciones
    {
        public static DTO_OEEPlanificaciones Mapper_vt_OEEPlanificaciones_To_DTO(vt_OEEPlanificaciones origen)
        {
            return new DTO_OEEPlanificaciones()
            {
                IdOEEPlanificaciones = origen.IdOEEPlanificaciones,
                IdLinea = origen.IdLinea,
                NumeroLinea = origen.NumeroLinea,
                DescripcionLinea = origen.DescripcionLinea,
                IdProducto = origen.IdProducto,
                NombreProducto = origen.NombreProducto,
                VelocidadNominal = origen.VelocidadNominal,
                VelocidadNominalOEE = origen.VelocidadNominalOEE,
                OEEPreactor = origen.OEEPreactor,
                InhabilitarCalculoAC = origen.InhabilitarCalculoAC,
                TiempoArranque = origen.TiempoArranque,
                TiempoCambio = origen.TiempoCambio,
                InhabilitarCalculoOEE = origen.InhabilitarCalculoOEE,
                OEEPlanificado = origen.OEEPlanificado,
                EnvasesMinuto = origen.EnvasesMinuto,
                MediaAC = origen.MediaAC,
                EnvasesPerdidosOEE = origen.EnvasesPerdidosOEE,
                PorcentajePerdidosAC = origen.PorcentajePerdidosAC,
                CBPsHora = origen.CPBsHora,
                CPBsTurno = origen.CPBsTurno,
                AjusteOEE = origen.AjusteOEE,
                CPBMDBY = origen.CPBMDBY,
                OEEFinalPlanificacion = origen.OEEFinalPlanificacion,
                Color = origen.Color,
                UdMedida = origen.UdMedida
            };
        }
    }
}