using MSM.Controllers.Planta;
using System;

namespace MSM.Models.Envasado
{
    public class Pico
    {

        public Pico()
        {}

        public int idPico { get; set; }

        public int codProducto { get; set; }

        public string descProducto { get; set; }

        public string orden { get; set; }

        public string particion { get; set; }

        public int cantidad { get; set; }

        public int turno { get; set; }

        public DateTime fechaTurno { get; set; }

        public int idTipoTurno { get; set; }

        public string TipoTurno
        {
            get
            {
                switch (idTipoTurno)
                {
                    case 1: return IdiomaController.GetResourceName("MAÑANA");
                    case 2: return IdiomaController.GetResourceName("TARDE");
                    case 3: return IdiomaController.GetResourceName("NOCHE");
                }
                return "DESCONOCIDO";
            }
        }

        public string linea { get; set; }

        public string OrdenEstadoActual { get; set; }

        public string SSCC { get; set; }
    }
}