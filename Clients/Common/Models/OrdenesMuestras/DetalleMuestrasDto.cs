using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.OrdenesMuestras
{
    public class DetalleMuestraDto
    {
        /// <summary>
        /// Tipo de Muestra
        /// </summary>
        public string Sc { get; set; }
        /// <summary>
        /// Grupo
        /// </summary>
        public string Pg { get; set; }
        /// <summary>
        /// ID grupo de parametros
        /// </summary>
        public string PgNode { get; set; }
        /// <summary>
        /// Resultado
        /// </summary>
        public string Pa { get; set; }
        /// <summary>
        /// ID Grupo muestra
        /// </summary>
        public string PaNode { get; set; }
        /// <summary>
        /// Descripción de la muestra
        /// </summary>
        public string Description { get; set; }
        /// <summary>
        /// Limite inferior
        /// </summary>
        public string ValueF { get; set; }
        /// <summary>
        /// Limite superior
        /// </summary>
        public string ValueS { get; set; }
        /// <summary>
        /// Unidad
        /// </summary>
        public string Unit { get; set; }
        /// <summary>
        /// Semaforo
        /// </summary>
        public string Ss { get; set; }
    }
}