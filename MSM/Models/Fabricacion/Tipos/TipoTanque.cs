using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion.Tipos
{
    public enum TipoTanque
    {
        [StringValue("MSM.Models.Fabricacion.Molino")]
        //COCC_MOLIENDA,
        UNIDAD_MOLINO,
        [StringValue("MSM.Models.Fabricacion.CalderaEbullicion")]
        //COCC_EBULLICION,
        UNIDAD_CALDERA_EBULLICION,
        [StringValue("MSM.Models.Fabricacion.CalderaCrudos")]
        UNIDAD_CALDERA_CRUDOS,
        [StringValue("MSM.Models.Fabricacion.CalderaMaceracion")]
        //COCC_MACERACIÓN,
        UNIDAD_MACERADOR,
        [StringValue("MSM.Models.Fabricacion.Remolino")]
        //COCC_REMOLINO,
        UNIDAD_REMOLINO,
        [StringValue("MSM.Models.Fabricacion.FiltroPrensa")]
        //COCC_FILTRACION,
        UNIDAD_FILTRO_PRENSA,
        [StringValue("MSM.Models.Fabricacion.Refrigerador")]
        //COCC_REFRIGERACIÓN,
        UNIDAD_REFRIGERADOR,
        [StringValue("MSM.Models.Fabricacion.Aireador")]
        //COCC_REFRIGERACIÓN,
        UNIDAD_AIREADOR
        //[StringValue("MSM.Models.Fabricacion.TanqueBodega")]
        //TANQUE_BODEGA,
        //[StringValue("MSM.Models.Fabricacion.Combitanque")]
        //COMBITANQUE,
        //[StringValue("MSM.Models.Fabricacion.TanqueTCP")]
        //TANQUE_TCP,
        //[StringValue("MSM.Models.Fabricacion.SiloMalta")]
        //SILO_MALTA,
        //[StringValue("MSM.Models.Fabricacion.Premacerador")]
        //COCC_PREMACERACIÓN
    }
}