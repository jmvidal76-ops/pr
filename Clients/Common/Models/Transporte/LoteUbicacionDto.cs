using System;

namespace Common.Models.LoteUbicacion
{
    public class LoteUbicacionDto
    {
        public int IdTransporte  { get; set; }

        public int Posicion { get; set; }

        public string Matricula { get; set; }

        public string Proveedor { get; set; }

        public DateTime FechaEntrada { get; set; }

        public DateTime FechaOrden { get; set; }

        public string Material { get; set; }

        public decimal Cantidad { get; set; }

        public bool UltimoCamion { get; set; }

        public string IdLote { get; set; }

        public int IdAlbaran { get; set; }
    }
}
