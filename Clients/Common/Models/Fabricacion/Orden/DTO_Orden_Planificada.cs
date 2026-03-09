using System;

namespace MSM.Models.Fabricacion
{
    public class DTO_Orden_Planificada
    {
        public int Id { get; set; }
        public string InicioPlanificado { get; set; }
        public string FinPlanificado { get; set; }
        public string Cantidad { get; set; }
        public string NotasWO { get; set; }
        public string CodUbicacion { get; set; }
        public string Ubicacion { get; set; }
        public string CodOrigen { get; set; }
        public string Origen { get; set; }
        public string IdUbicacionDescripcionOrigen { get; set; }
        public string CodDestino { get; set; }
        public string Destino { get; set; }
        public string IdUbicacionDescripcionDestino { get; set; }
        public string CodMaterialDescripcion { get; set; }
        public string CodMaterial { get; set; }
        public string Material { get; set; }
        public string UdMedida { get; set; }
        public string NumTeorico { get; set; }
        public string IdZona { get; set; }
        public string Zona { get; set; }

    }
}