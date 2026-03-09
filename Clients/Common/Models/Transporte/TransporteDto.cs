using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Common.Models.Transportes
{
    public class TransporteDto
    {
        public int IdTransporte { get; set; }

        public DateTime? FechaEntrada { get; set; }

        public DateTime? FechaSalida { get; set; }

        public int? IdMatriculaTractora { get; set; }

        public string MatriculaTractora { get; set; }

        public int? IdMatriculaRemolque { get; set; }

        public string MatriculaRemolque { get; set; }

        public int? IdProveedor { get; set; }

        public string NombreProveedor { get; set; }
        public string NIFProveedor { get; set; }

        public int? IdCliente { get; set; }

        public string NombreCliente { get; set; }
        public string NIFCliente { get; set; }

        public int? IdProducto { get; set; }

        public string NombreProducto { get; set; }

        public decimal? PesoEntrada { get; set; }

        public decimal? PesoEntradaAuto { get; set; }

        public decimal? PesoSalida { get; set; }

        public decimal? PesoSalidaAuto { get; set; }

        public int? IdOperador { get; set; }

        public string NombreOperador { get; set; }
        public string NIFOperador { get; set; }

        public int? IdOrigenMercancia { get; set; }

        public string DescripcionOrigenMercancia { get; set; }

        public int? IdUbicacionInterna { get; set; }

        public string DescripcionUbicacionInterna { get; set; }

        public int? IdDestinatario { get; set; }

        public string DescripcionDestinatario { get; set; }

        public string PoblacionDestinatario { get; set; }

        public string Observaciones { get; set; }

        public int IdTransportista { get; set; }

        public string NombreTransportista { get; set; }

        public string NIF { get; set; }

        public Boolean Activo { get; set; }

        public int IdTipoOperacion { get; set; }

        public string TipoOperacion { get; set; }

        public string ColorSemaforo { get; set; }

        public string LoteProveedor { get; set; }

        public string PedidoCliente { get; set; }

        public int? CodigoOrdenJDE { get; set; }

        public string TipoOrdenJDE { get; set; }

        public string AlbaranProveedor { get; set; }

        public string NombreArchivoAlbaranEntrada { get; set; }

        public string CodigoAlbaran { get; set; }

        public DateTime? FechaDescarga { get; set; }

        public DateTime FechaOrden { get; set; }

        public bool Facturado { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }

    }

}
