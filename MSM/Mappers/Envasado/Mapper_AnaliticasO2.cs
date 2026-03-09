using MSM.BBDD.Alt;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Envasado
{
    public class Mapper_AnaliticasO2
    {
        public static O2_Llenadoras MapperDynamicToO2Llenadoras(dynamic analitica)
        {
            var O2Llenadora = new O2_Llenadoras
            {
                Linea = analitica.Linea == null ? string.Empty : analitica.Linea.ToString(),
                VolumenEnvase = analitica.VolumenEnvase == null ? 0 : Convert.ToInt32(analitica.VolumenEnvase.Value),
                Llenadora = analitica.Llenadora == null ? 0 : Convert.ToByte(analitica.Llenadora.Value),
                IdMuestra = analitica.IdMuestra.ToString(),
                Fecha = analitica.Fecha == null ? DateTime.MinValue : Convert.ToDateTime(analitica.Fecha.Value),
                Comentario = analitica.Comentario == null ? string.Empty : analitica.Comentario.ToString(),
                TCP = analitica.TCP == null ? 0 : Convert.ToInt16(analitica.TCP.Value),
                O2_TCP = analitica.O2_TCP == null ? 0 : Convert.ToDecimal(analitica.O2_TCP.Value),
                CO2_TCP = analitica.CO2_TCP == null ? 0 : Convert.ToDecimal(analitica.CO2_TCP.Value),
                TipoMuestra = analitica.TipoMuestra == null ? string.Empty : analitica.TipoMuestra.ToString(),
                NumGrifo = analitica.NumGrifo == null ? 0 : Convert.ToByte(analitica.NumGrifo.Value),
                TPO = analitica.TPO == null ? 0 : Convert.ToDecimal(analitica.TPO.Value),
                UnidadTPO = analitica.UnidadTPO == null ? string.Empty : analitica.UnidadTPO.ToString(),
                HSO = analitica.HSO == null ? 0 : Convert.ToDecimal(analitica.HSO.Value),
                UnidadHSO = analitica.UnidadHSO == null ? string.Empty : analitica.UnidadHSO.ToString(),
                DO = analitica.DO == null ? 0 : Convert.ToDecimal(analitica.DO.Value),
                UnidadDO = analitica.UnidadDO == null ? string.Empty : analitica.UnidadDO.ToString(),
                CO2 = analitica.CO2 == null ? 0 : Convert.ToDecimal(analitica.CO2.Value),
                UnidadCO2 = analitica.UnidadCO2 == null ? string.Empty : analitica.UnidadCO2.ToString(),
                CO2_Ts = analitica.CO2_Ts == null ? 0 : Convert.ToDecimal(analitica.CO2_Ts.Value),
                UnidadCO2_Ts = analitica.UnidadCO2 == null ? string.Empty : analitica.UnidadCO2_Ts.ToString(),
                HSV = analitica.HSV == null ? 0 : Convert.ToDecimal(analitica.HSV.Value),
                UnidadHSV = analitica.UnidadHSV == null ? string.Empty : analitica.UnidadHSV.ToString(),
                Presion = analitica.Presion == null ? 0 : Convert.ToDecimal(analitica.Presion.Value),
                UnidadPresion = analitica.UnidadPresion == null ? string.Empty : analitica.UnidadPresion.ToString(),
                Temperatura = analitica.Temperatura == null ? 0 : Convert.ToDecimal(analitica.Temperatura.Value),
                UnidadTemperatura = analitica.UnidadTemperatura == null ? string.Empty : analitica.UnidadTemperatura.ToString(),
                Temperatura_Ts = analitica.Temperatura_Ts == null ? 0 : Convert.ToDecimal(analitica.Temperatura_Ts.Value),
                UnidadTemperatura_Ts = analitica.UnidadTemperatura_Ts == null ? string.Empty : analitica.UnidadTemperatura_Ts.ToString(),
                PresionVacio = analitica.PresionVacio == null ? 0 : Convert.ToDecimal(analitica.PresionVacio.Value),
                UnidadPresionVacio = analitica.UnidadPresionVacio == null ? string.Empty : analitica.UnidadPresionVacio.ToString(),
                PresionEspumado = analitica.PresionEspumado == null ? 0 : Convert.ToDecimal(analitica.PresionEspumado.Value),
                UnidadPresionEspumado = analitica.UnidadPresionEspumado == null ? string.Empty : analitica.UnidadPresionEspumado.ToString(),
                PresionSoplado = analitica.PresionSoplado == null ? 0 : Convert.ToDecimal(analitica.PresionSoplado.Value),
                UnidadPresionSoplado = analitica.UnidadPresionSoplado == null ? string.Empty : analitica.UnidadPresionSoplado.ToString(),
                ConsumoGas = analitica.ConsumoGas == null ? 0 : Convert.ToDecimal(analitica.ConsumoGas.Value),
                UnidadConsumoGas = analitica.UnidadConsumoGas == null ? string.Empty : analitica.UnidadConsumoGas.ToString(),
                Fichero = analitica.Fichero == null ? string.Empty : analitica.Fichero.ToString()
            };

            return O2Llenadora;
        }

        public static void MapperO2Llenadoras(O2_Llenadoras origen, O2_Llenadoras destino)
        {
            destino.IdLinea = origen.IdLinea;
            destino.Linea = origen.Linea;
            destino.VolumenEnvase = origen.VolumenEnvase;
            destino.Llenadora = origen.Llenadora;
            destino.Fecha = origen.Fecha;
            destino.Comentario = origen.Comentario;
            destino.TCP = origen.TCP;
            destino.O2_TCP = origen.O2_TCP;
            destino.CO2_TCP = origen.CO2_TCP;
            destino.TipoMuestra = origen.TipoMuestra;
            destino.NumGrifo = origen.NumGrifo;
            destino.TPO = origen.TPO;
            destino.UnidadTPO = origen.UnidadTPO;
            destino.HSO = origen.HSO;
            destino.UnidadHSO = origen.UnidadHSO;
            destino.DO = origen.DO;
            destino.UnidadDO = origen.UnidadDO;
            destino.CO2 = origen.CO2;
            destino.UnidadCO2 = origen.UnidadCO2;
            destino.CO2_Ts = origen.CO2_Ts;
            destino.UnidadCO2_Ts = origen.UnidadCO2_Ts;
            destino.HSV = origen.HSV;
            destino.UnidadHSV = origen.UnidadHSV;
            destino.Presion = origen.Presion;
            destino.UnidadPresion = origen.UnidadPresion;
            destino.Temperatura = origen.Temperatura;
            destino.UnidadTemperatura = origen.UnidadTemperatura;
            destino.Temperatura_Ts = origen.Temperatura_Ts;
            destino.UnidadTemperatura_Ts = origen.UnidadTemperatura_Ts;
            destino.PresionVacio = origen.PresionVacio;
            destino.UnidadPresionVacio = origen.UnidadPresionVacio;
            destino.PresionEspumado = origen.PresionEspumado;
            destino.UnidadPresionEspumado = origen.UnidadPresionEspumado;
            destino.PresionSoplado = origen.PresionSoplado;
            destino.UnidadPresionSoplado = origen.UnidadPresionSoplado;
            destino.ConsumoGas = origen.ConsumoGas;
            destino.UnidadConsumoGas = origen.UnidadConsumoGas;
            destino.Fichero += " Editado";
        }
    }
}