using System;

namespace Common.Models
{
    public class UbicacionConResumenOrdenesDto
    {
        public int IdUbicacion { get; set; }
        public Nullable<int> IdPlanta { get; set; }
        public int IdAlmacen { get; set; }
        public int IdZona { get; set; }
        public Nullable<int> IdTipoUbicacion { get; set; }
        public Nullable<int> IdEstado { get; set; }
        public bool Activo { get; set; }
        public string IdUbicacionLinkMes { get; set; }
        public string Nombre { get; set; }
        public Nullable<int> Produccion { get; set; }
        public Nullable<int> Iniciando { get; set; }
        public Nullable<int> Pausada { get; set; }
        public Nullable<int> Planificada { get; set; }
        public Nullable<int> Finalizando { get; set; }
    }
}
