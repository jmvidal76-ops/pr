using MSM.Models.Planta;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Mantenimiento
{
    public class DTO_SolicitudIntervencion
    {
        public int Id { get; set; }
        public int NumOT { get; set; }
        public string Estado { get; set; }
        public string EstadoDescripcion { get; set; }
        public bool CerradoEnJDE { get; set; }
        public string Linea { get; set; }
        public string Maquina { get; set; }
        public string MaquinaDescripcion { get; set; }
        public string EquipoConstructivo { get; set; }
        public string EquipoConstructivoDescripcion { get; set; }
        public int? AreaFabricacion { get; set; }
        public string CodigoAreaFabricacion { get; set; }
        public string NombreAreaFabricacion { get; set; }
        public int? ZonaFabricacion { get; set; }
        public string CodigoZonaFabricacion { get; set; }
        public string NombreZonaFabricacion { get; set; }
        public int? EquipoFabricacion { get; set; }
        public string CodigoEquipoFabricacion { get; set; }
        public string NombreEquipoFabricacion { get; set; }
        public int? GrupoConstructivoFabricacion { get; set; }
        public string CodigoGrupoConstructivoFabricacion { get; set; }
        public string NombreGrupoConstructivoFabricacion { get; set; }
        public int? RepuestoFabricacion { get; set; }
        public string CodigoRepuestoFabricacion { get; set; }
        public string NombreRepuestoFabricacion { get; set; }
        public int IdTipoAveria { get; set; }
        public string DescripcionTipoAveria { get; set; }
        public string DescripcionAveria { get; set; }
        public string DescripcionProblema { get; set; }
        public string ComentarioCierre { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaCierre { get; set; }
        public Usuario Usuario { get; set; }
        public bool EsEnvasado { get; set; }
        public bool OTProgramada { get; set; }
    }
}