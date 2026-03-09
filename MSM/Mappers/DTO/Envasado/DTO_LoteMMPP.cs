using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_LoteMMPP
    {
        public int ID_LOTE_MMPP { get; set; }
        public string TIPO_MATERIAL { get; set; }
        public string CLASE_MATERIAL { get; set; }
        public string REFERENCIA_MES { get; set; }
        public string MATERIAL { get; set; }
        public string LOTE_MES { get; set; }
        public string ID_PROVEEDOR { get; set; }
        public string PROVEEDOR { get; set; }
        public string LOTE_PROVEEDOR { get; set; }
        public Nullable<decimal> CANTIDAD_INICIAL { get; set; }
        public Nullable<decimal> CANTIDAD_ACTUAL { get; set; }
        public string UNIDADES { get; set; }
        public Nullable<int> PRIORIDAD { get; set; }
        public Nullable<System.DateTime> FECHA_ENTRADA_PLANTA { get; set; }
        public Nullable<System.DateTime> FECHA_ENTRADA_UBICACION { get; set; }
        public Nullable<System.DateTime> FECHA_INICIO_CONSUMO { get; set; }
        public Nullable<System.DateTime> FECHA_FIN_CONSUMO { get; set; }
        public Nullable<System.DateTime> FECHA_CADUCIDAD { get; set; }
        public Nullable<System.DateTime> FECHA_CUARENTENA { get; set; }
        public string MOTIVO_CUARENTENA { get; set; }
        public Nullable<System.DateTime> FECHA_BLOQUEO { get; set; }
        public string MOTIVO_BLOQUEO { get; set; }
        public string ALMACEN { get; set; }
        public int ID_ALMACEN { get; set; }
        public string ZONA { get; set; }
        public int ID_ZONA { get; set; }
        public string UBICACION { get; set; }
        public string UBICACION_MES { get; set; }
        public Nullable<int> UBICACION_ORIGEN { get; set; }
        public string ESTADO_UBICACION { get; set; }
        public string TIPO_UBICACION { get; set; }
        public Nullable<int> ID_TIPO_UBICACION { get; set; }
        public string POLITICA_VACIADO { get; set; }
        public Nullable<System.DateTime> DEFECTUOSO { get; set; }
        public string LINEA { get; set; }
        public Nullable<System.DateTime> ACTUALIZADO { get; set; }
        public Nullable<int> ID_PROCESO { get; set; }
        public string PROCESO { get; set; }
        public string DESCRIPCION_ZONA { get; set; }
        public string DESCRIPCION_UBICACION { get; set; }

    }
}