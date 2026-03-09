using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Muestras
{
    public class SampleDto
    {
        /// <summary>
        /// Id Muestra
        /// </summary>
        public string Sc { get; set; }
        /// <summary>
        /// Tipo de muestra
        /// </summary>
        public string St { get; set; }
        /// <summary>
        /// Descripción
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Fecha de creación
        /// </summary>
        public DateTime CreationDate { get; set; }
        /// <summary>
        /// Departamento
        /// </summary>
        public string Department { get; set; }
        /// <summary>
        /// Subdepartamento
        /// </summary>
        public string SubDepartment { get; set; }
        /// <summary>
        /// Semaforo
        /// </summary>
        public string Ss { get; set; }
    }
}