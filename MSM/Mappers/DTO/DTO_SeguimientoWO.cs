using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Models.Envasado;

namespace MSM.DTO
{
    public class DTO_SeguimientoWO
    {
        public class Cabecera {
            public string inicio { get; set; }
            public string tipo { get; set; }
            public string idOrden { get; set; }
            public string tipoCerveza { get; set; }
            public string codigoProducto { get; set; }
            public string descripcionProduct { get; set; }
            public int cantidadPlanificada { get; set; }
            public string inicioOrden { get; set; }
            public string finOrden { get; set; }
            public string finOrdenTurno { get; set; }
            public double duracionOrden { get; set; }
            public string duracionOrdenTurno { get; set; }
            public double velocidadNominal { get; set; }
            public double oeeObjetivo { get; set; }
            public double oeeCritico { get; set; }
        }

        public class Serie {
            public string name { get; set; }
            public List<double?> data { get; set; }
            public string color { get; set; }
        }

        public Cabecera cabecera { get; set; }
        public DTO_DatosProduccionTurno valoresDesdeInicioTurno { get; set; }
        public DTO_DatosProducccionOrdenTurno valoresDesdeInicioOrden { get; set; }
        public List<string> franjasTitles { get; set; }
        public List<DTO_DatosProduccionTurno> franjas { get; set; }
        public List<Maquina> llenadoras { get; set; }
        public List<Maquina> paleteras { get; set; }
        public List<Maquina> encajonadoras { get; set; }

        public List<Serie> seriesData { get; set; }
        public List<string> categoryLabels { get; set; }

        public double totalParosMayores { get; set; }
        public double totalParosMenores { get; set; }
        public double totalTiempoOperativo { get; set; }
       

        public DTO_SeguimientoWO() {
            cabecera = new Cabecera();
            valoresDesdeInicioTurno = new DTO_DatosProduccionTurno();
            valoresDesdeInicioOrden = new DTO_DatosProducccionOrdenTurno();
            franjasTitles = new List<string>();
            franjas = new List<DTO_DatosProduccionTurno>();
            llenadoras = new List<Maquina>();
            paleteras = new List<Maquina>();
            encajonadoras = new List<Maquina>();
            seriesData = new List<Serie>();
            categoryLabels = new List<string>();
        }
    }
}