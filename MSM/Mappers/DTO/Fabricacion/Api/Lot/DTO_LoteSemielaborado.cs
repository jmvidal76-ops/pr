using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_LoteSemielaborado
    {
        public int IdLoteSemielaborado { get; set; }

        public string TipoMaterial { get; set; }

        public string ClaseMaterial { get; set; }

        public string IdMaterial { get; set; }
        public string NombreMaterial { get; set; }

        public string LoteMES { get; set; }
        public decimal? CantidadInicial { get; set; }

        public decimal? CantidadActual { get; set; }

        public string Unidad { get; set; }

        public DateTime? FechaConsumo { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public string Almacen { get; set; }

        public string Zona { get; set; }

        public string Ubicacion { get; set; }

        public string IdUbicacionLinkMES { get; set; }

        public int? IdUbicacionOrigen { get; set; }

        public string EstadoUbicacion { get; set; }

        public int? IdTipoUbicacion { get; set; }

        public string TipoUbicacion { get; set; }

        public string PoliticaVaciado { get; set; }

        public int? IdProceso { get; set; }

        public string Proceso { get; set; }

        public string ResultadoError { get; set; }

        public string DescripcionUbicacion { get; set; }

        public string UbicacionConDescriptivo { get; set; }
        public string MatriculaLevadura { get; set; }
        public int IdEstadoLIMS { get; set; }
        public string ColorEstadoLIMS { get; set; }
        public string Notas { get; set; }
        public string TipoEnvase { get; set; }
    }
}