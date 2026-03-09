using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Utilidades;
using System.ComponentModel;

namespace MSM.Models.Envasado
{
    public class Tipos
    {
        [Category("Envasado")]
        [DefaultValue(Parada)]
        public enum EstadosMaquina
        {
            [StringValue("No Conectada")]
            NoConectada,
            [StringValue("Marcha")]
            Produccion,
            [StringValue("Parada")]
            Parada,
        }

        [Category("Envasado")]
        [DefaultValue(Creada)]
        public enum EstadosOrden
        {
            Creada,
            Planificada,
            Cancelada,
            Iniciando,
            Iniciar,
            Pausada,
            Cerrada,
            Finalizada,
            Producción
        }

        [Category("Envasado")]
        [DefaultValue(SinPausa)]
        public enum Pausa
        {
            SinPausa,
            Fin,
            Cambio
        }
    }
}