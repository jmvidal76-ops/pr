using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Transporte
{
    public class ClienteDto
    {
        public int IdCliente { get; set; }

        public string Codigo { get; set; }

        public string Nombre { get; set; }

        public string NIF { get; set; }

        public string Direccion { get; set; }

        public string Poblacion { get; set; }

        public string CodigoPostal { get; set; }

        public string Telefono { get; set; }

        public string Observaciones { get; set; }

        public int IdCombo { get; set; }

        public int IdMaestroOrigen { get; set; }

        public string CreadoPor { get; set; }

        public string ActualizadoPor { get; set; }
    }
}
