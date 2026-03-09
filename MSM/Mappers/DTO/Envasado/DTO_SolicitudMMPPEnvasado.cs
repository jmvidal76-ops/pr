using System;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_SolicitudMMPPEnvasado
    {
        public long IdSolicitudMision { get; set; }
        public int IdTipoSolicitud { get; set; }
        public string TipoSolicitudDesc { get; set; }
        public int IdEstadoSolicitud { get; set; }
        public string EstadoSolicitudDesc { get; set; }
        public string Fuente { get; set; }
        public string Destino { get; set; }
        public string Equipo { get; set; }
        public string NombreEquipo { get; set; }
        public int Prioridad { get; set; }        
        public string IdMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string LoteProveedor { get; set; }
        public int Cantidad { get; set; }
        public int CantidadRecibida { get; set; }
        public string EstadoCalidad { get; set; }
        public string NotasCambioCalidad { get; set; }
        public int IdEstadoSolicitudPrevio { get; set; }
        public string Error { get; set; }
        public DateTime Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
        public int CantidadDisponible { get; set; }
    }
}