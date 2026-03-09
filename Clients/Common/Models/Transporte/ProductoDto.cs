using System;

namespace Common.Models.Transportes
{
    public class ProductoDto
    {
        public int IdProducto { get; set; }

        public string Nombre { get; set; }

        public string Codigo { get; set; }

        public string Observaciones { get; set; }

        public string IdClase { get; set; }

        public string DescClase { get; set; }

        public string SubClase { get; set; }

        public int IdCombo { get; set; }

        public int IdMaestroOrigen { get; set; }

        public int IdTipoMatTransporte { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }

    }
}
