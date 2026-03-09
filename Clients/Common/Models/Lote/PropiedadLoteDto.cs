
using System;
using System.Collections.Generic;

namespace Common.Models.Lote
{
    public class PropiedadLoteDto
    {
        public int IdPropiedad { get; set; }
        public int IdLote { get; set; }
        public int IdTipoMaterialMovimiento { get; set; }
        public string Valor { get; set; }
        public string Nombre { get; set; }
        public string IdClaseMaterial { get; set; }
        public string Unidad { get; set; }
        public string MensajeSAI { get; set; }
        public bool Activo { get; set; }
        public int? IdAccionPropiedad { get; set; }
        public string NombreAccionPropiedad { get; set; }
        public List<int> IdLoteSeleccionado { get; set; }
        public DateTime? Creado { get; set; }
        public string CreadoPor { get; set; }
        public DateTime? Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
        public int? IdGrupoUbicacion { get; set; }
        public string NombreGrupoUbicacion { get; set; }
    }
}
