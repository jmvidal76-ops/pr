using MSM.BBDD.Model;
using MSM.DTO;
using MSM.Mappers.DTO.Alt;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Envasado
{
    public interface IDAO_Turnos
    {
        Task<bool> ActualizarComentarioTurno(DTO_ConsolidadoTurnos datos);
        Task<bool> ActualizarConsolidadoTurno(DTO_ConsolidadoTurnos datos);
        Task<bool> ActualizarICPorLineaGrupo(DTO_ConsolidadoTurnos datos);
        Task<bool> ActualizarIdTurno(DTO_ConsolidadoTurnos datos);
        Task<bool> ActualizarOEEObjetivoCriticoTurno(DTO_ConsolidadoTurnos datos);
        Task<bool> CrearConsolidadoTurno(DTO_ConsolidadoTurnos datos);
        Task<bool> DesmarcarTurnoParaRecalculoICT(int idTurno, DateTime? fecha = null, int? idTipoTurno = null, string linea = null);
        void EliminarFestivo(int idFestivo);
        void InsertarFestivo(DiaFestivo festivo);
        Task<string> ObtenerComentarioTurno(int idTurno);
        Task<List<DTO_ConsolidadoTurnos>> ObtenerConsolidadoTurnos(dynamic datos);
        Task<DTO_ConsolidadoTurnos> ObtenerConsolidadoTurnosPorIdTurno(int idTurno);
        Task<DTO_ConsolidadoTurnos> ObtenerConsolidadoTurnosPorLineaFechaTipoTurno(string linea, DateTime fechaTurno, int idTipoTurno);
        Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMandoVideowall(string lineas);
        RendimientoTurno ObtenerDatosCurvaRendimiento(string linea, int turno);
        List<DiaFestivo> ObtenerDiasFestivos();
        Task<float> ObtenerDuracionTurno(int idTurno);
        DateTime? ObtenerFechaInicioTurnoPorLineaFecha(string linea, DateTime fecha);
        Task<List<DTO_Forms>> ObtenerFormulariosCalidadPorTurno(dynamic datos);
        Task<int> ObtenerIdTurnoAnterior(int idTurno);
        Task<int> ObtenerIdTurnoAnteriorFechaLinea(string idLinea, DateTime fecha);
        Task<List<DTO_CuadroMandoPlanta>> ObtenerInfoCuadroMando();
        Task<dynamic> ObtenerLimitesOEETurno(int idTurno);
        List<object> ObtenerParticionesTurno(int numLinea, DateTime fechaInicioUTC, DateTime fechaFinUTC);
        List<object> ObtenerProduccionTurnoMaquina(string maquinaID, DateTime fechaTurnoUTC, int idTipoTurno);
        List<DTO_ProduccionTurnoOrdenes> ObtenerProduccionTurnoOrdenes(int numLinea, DateTime fechaTurnoUTC, int idTipoTurno);
        ResumenTurno ObtenerResumenTurno(int idLinea, int? idTurnoAct, int? idTurnoAnt);
        Task<string> ObtenerSemaforoArranqueWOTurno(int idTurno);
        Task<string> ObtenerSemaforoFinalizacionWOTurno(int idTurno);
        Task<string> ObtenerSemaforoTurno(int idTurno);
        List<Semana> ObtenerSemanas(int anyo);
        List<TipoPlantillaTurno> ObtenerTiposPlantillaTurno();
        List<TipoTurno> ObtenerTiposTurno();
        Turno ObtenerTurnoAnterior(string idLinea, DateTime inicioTurnoActual);
        Turno ObtenerTurnoCercano(string idLinea, DateTime fechaTurno, int tipoTurno, int mayorMenor);
        Task<DTO_TurnosOEE> ObtenerTurnoOEE(int idTurno);
        List<TurnoParo> ObtenerTurnos(string idLinea, DateTime desde, DateTime hasta);
        Task<List<DTO_TurnosConBreak>> ObtenerTurnosConBreak(int? idTurno, string idLinea, DateTime? fechaActual, DateTime? fechaInicio, DateTime? fechaFin);
        Task<DTO_TurnosConBreak> ObtenerTurnoConBreakConsecutivo(bool anterior, int? idTurno, string idLinea, DateTime? fechaActual = null);
        List<SemanaTurno> ObtenerTurnosFabrica(string idLinea, int anyo, int semana);
        Turnos ObtenerTurnoSiguiente(dynamic data);
        Turno ObtenerTurnoSiguiente(string idLinea, DateTime inicioTurnoActual);
        List<Turno> ObtenerTurnosLineaDia(string idLinea, DateTime fecha);
        List<Turno> ObtenerTurnosMayoresFechaLinea(string idLinea, DateTime fecha);
        List<Turno> ObtenerTurnosOrden(int numLinea, string idParticion);        
        Task SetTurnoParaRecalculoICT(int idTurno, DateTime? fechaTurno = null, int? idTipoTurno = null, int? numLinea = null);
        Task<DTO_RelevoTurnoOficiales> ObtenerRelevoTurnoOficiales(int idConsolidadoTurno, string idZona);
        Task<List<DTO_RelevoTurnoOficiales>> ObtenerRelevosTurnosOficiales(string idLinea, string idZona, DateTime fechaDesde, DateTime fechaHasta);
        Task<string> ActualizarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos);
        Task<bool> ActivarRelevoTurnoOficiales(DTO_RelevoTurnoOficiales datos);
        Task<double> ObtenerOEETurno(int idTurno);
    }
}