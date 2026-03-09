using System;

namespace MSM.Mappers.DTO.Envasado
{
    public class DTO_MaestroClasesUbicaciones
    {
        public int Id { get; set; }
        public string IdLinea { get; set; }
        public string IdZona { get; set; }
        public string IdClaseMMPP { get; set; }
        public string IdSubClaseMMPP { get; set; }
        public int IdUbicacionPeticion { get; set; }
        public string UbicacionPeticion { get; set; }
        public string NombreUbicacionPeticion { get; set; }
        public string IdZonaUbicacionPeticion { get; set; }

        public string IdLineaPeticion { get; set; }
        public int IdUbicacionCreacionLote { get; set; }
        public string UbicacionCreacion { get; set; }
        public string NombreUbicacionCreacion { get; set; }
        public string IdLineaCreacion { get; set; }
        public int IdUbicacionDevolucion { get; set; }
        public string UbicacionDevolucion { get; set; }
        public string NombreUbicacionDevolucion { get; set; }
        public string IdLineaDevolucion { get; set; }
        public DateTime Creado { get; set; }
        public string CreadoPor { get; set; }
        public string Actualizado { get; set; }
        public string ActualizadoPor { get; set; }
    }
}