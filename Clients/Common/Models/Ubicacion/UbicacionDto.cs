using Common.Models.Ubicaciones;
using System;
using System.Collections.Generic;

namespace Common.Models
{
    public class UbicacionDto
    {
        public int IdUbicacion { get; set; }
        public string Descripcion { get; set; }
        public string Nombre { get; set; }
        public int? Version { get; set; }
        public int? IdEstado { get; set; }
        public string DescripcionEstado { get; set; }
        public int? IdPlanta { get; set; }
        public string DescripcionPlanta { get; set; }
        public int IdAlmacen { get; set; }
        public string DescripcionAlmacen { get; set; }
        public int IdZona { get; set; }
        public List<ZonaDto> Zona { get; set; }
        public int? IdTipoUbicacion { get; set; }
        public string DescripcionTipoUbicacion { get; set; }
        public int? IdPoliticaAlmacenamiento { get; set; }
        public string DescripcionPoliticaAlmacenamiento { get; set; }
        public int? IdPoliticaLlenado { get; set; }
        public string DescripcionPoliticaLlenado { get; set; }
        public int? IdPoliticaVaciado { get; set; }
        public string DescripcionPoliticaVaciado { get; set; }
        public string CooRelativas { get; set; }
        public string CooAlbsolutas { get; set; }
        public string RefMaterial { get; set; }
        public string DescripcionMaterial { get; set; }
        public string IdClaseMaterial { get; set; }
        public string DescripcionClaseMaterial { get; set; }
        public string IdTipoMaterial { get; set; }
        public string DescripcionTipoMaterial { get; set; }
        public string DescripcionUnidadAlmacenamiento { get; set; }
        public string IdUdMedida { get; set; }
        public decimal? UmbralStockCero { get; set; }
        public string IdUbicacionLinkMes { get; set; }
        public bool CanBeDeleted { get; set; }
        public bool Activo { get; set; }
        public string IdLinea { get; set; }
        public string DescLinea { get; set; }
        public string IdZonaAsociada { get; set; }
        public string DescZonaAsociada { get; set; }
        public decimal? Offset { get; set; }
        public decimal? VelocidadNominalReferencia { get; set; }
        public int? IdPDV { get; set; }
        public string DescPDV { get; set; }
        public int? IdPDVSEO { get; set; }
        public string DescPDVSEO { get; set; }
        //Propiedades necesarias para contabilizar los lotes consumidos en los buffers
        public Boolean? Buffer { get; set; }
        public string Tag { get; set; }
        public Decimal? Cantidad_Lote_Buffer { get; set; }
        public int UbicacionAsociada { get; set; }
        public int? IdGrupo { get; set; }
        public string NombreGrupo { get; set; }
        public int CantidadLotesVaciadoAutomatico { get; set; }

    }
}
