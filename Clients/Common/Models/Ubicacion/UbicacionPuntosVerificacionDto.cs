using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicacion
{
    public class UbicacionPuntosVerificacionDto
    {
        public int IdUbicacion { get; set; }
        public int? IdTipoUbicacion { get; set; }
        public int IdAlmacen { get; set; }
        public int? IdZona { get; set; }
        public int? IdPoliticaLlenado { get; set; }
        public int? IdPoliticaVaciado { get; set; }
        public string IdClaseMaterial { get; set; }
        public string IdUbicacionLinkMes { get; set; }
        public int? IdEstado { get; set; }
        public int? IdGrupo { get; set; }
        public string IdUnidadMedida { get; set; }
        public string Descripcion { get; set; }
        public string DescripcionAlmacen { get; set; }
        public string DescripcionZona { get; set; }
        public string DescripcionTipoUbicacion { get; set; }
        public string DescripcionPoliticaLlenado { get; set; }
        public string DescripcionPoliticaVaciado { get; set; }
        public string DescripcionClaseMaterial { get; set; }
        public string DescripcionEstado { get; set; }
        public string DescripcionLinea { get; set; }
        public string Nombre { get; set; }
        public string IdLinea { get; set; }
        public int? NumeroLinea { get; set; }
        public string IdZonaAsociada { get; set; }
        public decimal? Offset { get; set; }
        public decimal? VelocidadNominalReferencia { get; set; }
        public string NombreGrupo { get; set; }
        public string NamePDVCalidad { get; set; }
        public string NamePDVSEO { get; set; }
        public string DescripcionZonaAsociada { get; set; }
        public int CantidadLotesVaciadoAutomatico { get; set; }

    }
}
