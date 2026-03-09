using G2Base;
using MSM.BBDD.Envasado;
using MSM.DTO;
using MSM.Models.Envasado;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using BreadMES.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;

namespace MSM.Controllers.Envasado
{
    [Authorize]
    public class ContingenciasController : ApiController
    {
        [Route("api/EstadosMaquina/{idLinea}/{idMaquina}/{miliSegundos}/{tipoTurno}")]
        [HttpGet]
        public IEnumerable<DTO.DTO_EstadoMaquina> GetEstadosMaquina(string idLinea, string idMaquina, long miliSegundos, int tipoTurno)
        {
            try
            {
                DateTime refDate = new DateTime(1970, 1, 1);
                DateTime fechaTurno = refDate.AddMilliseconds(miliSegundos);
                DAO_Turnos daoTurnos = new DAO_Turnos();
                Turno turno = daoTurnos.ObtenerTurno(idLinea, fechaTurno, tipoTurno);

                List<DTO_EstadoMaquina> listaParos = new List<DTO_EstadoMaquina>();

                DAO_Maquinas daoMaquinas = new DAO_Maquinas();

                listaParos = daoMaquinas.obtenerEstadoHistoricoMaquinas(idLinea, idMaquina, turno.inicio, turno.fin);
                return listaParos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.GetEstadosMaquina", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.GetEstadosMaquina", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_HISTORICO_DE"));
            }

        }

        [Route("api/ActualizarEstadoHistorico")]
        [HttpPost]
        public object[] ActualizarEstadoHistorico(DTO_EstadoMaquina estado)
        {
            PMConnector conexion = new PMConnector();
            conexion.G2HostName = ConfigurationManager.AppSettings["IP_SIMATIC"];
            conexion.G2Port = ConfigurationManager.AppSettings["PUERTO_SIMATIC"];
            conexion.Connect();
            //ReglasMES.JustificarParoMayor regla = new ReglasMES.JustificarParoMayor(conexion);

            throw new NotImplementedException("Pendiente implementación");
        }

        [Route("api/UnirEstadosHistoricos")]
        [HttpPost]
        public string UnirEstadosHistoricos(DTO_UnionEstadosMaquina estados)
        {
            ReglasMES.ModidicacionEstadoMaquinaMerge regla = null;
            try
            {
                using (PMConnector conexion = new PMConnector())
                {
                    conexion.G2HostName = ConfigurationManager.AppSettings["IP_SIMATIC"];
                    conexion.G2Port = ConfigurationManager.AppSettings["PUERTO_SIMATIC"];
                    conexion.Connect();
                    regla = new ReglasMES.ModidicacionEstadoMaquinaMerge(conexion);

                    CallResult result = regla.Call(estados.up, estados.estado1.fechaFinUTC, estados.estado1.fechaInicioUTC, estados.estado1.idLinea + "." + estados.estado1.idMaquina);
                    if (result != CallResult.CR_Ok)
                    {
                        if (result == CallResult.CR_Timedout)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ContingenciasController.UnirEstadosHistoricos", "The call timed out", "Sistema");
                        }
                        else
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ContingenciasController.UnirEstadosHistoricos", "", "Sistema");
                        }
                        throw new ApplicationException();
                    }
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.UnirEstadosHistoricos", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.UnirEstadosHistoricos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_UNIENDO_ESTADOS"));
            }
            finally
            {
                regla.Dispose();
            }
        }

        [Route("api/SepararEstadoHistorico")]
        [HttpPost]
        public string SepararEstadoHistorico(DTO_SepararEstadoMaquina separacion)
        {
            ReglasMES.ModidicacionEstadoMaquinaSplit regla = null;
            try
            {
                using (PMConnector conexion = new PMConnector())
                {
                    conexion.G2HostName = ConfigurationManager.AppSettings["IP_SIMATIC"];
                    conexion.G2Port = ConfigurationManager.AppSettings["PUERTO_SIMATIC"];
                    conexion.Connect();
                    regla = new ReglasMES.ModidicacionEstadoMaquinaSplit(conexion);

                    //CallResult result = regla.Call(estados.up, estados.estado1.fechaFinUTC, estados.estado1.fechaInicioUTC, estados.estado1.idMaquina);
                    CallResult result = regla.Call(separacion.estadoMaquina.fechaFinUTC, separacion.horaSeparacionMilisegundosUTF / 1000 - 60, separacion.estadoMaquina.fechaInicioUTC, separacion.estadoMaquina.idLinea + "." + separacion.estadoMaquina.idMaquina);
                    if (result != CallResult.CR_Ok)
                    {
                        if (result == CallResult.CR_Timedout)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ContingenciasController.SepararEstadoHistorico", "The call timed out", "Sistema");
                        }
                        else
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ContingenciasController.SepararEstadoHistorico", "", "Sistema");
                        }
                        throw new ApplicationException();
                    }
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.SepararEstadoHistorico", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.SepararEstadosHistoricos", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_SEPARANDO_ESTADOS"));
            }
            finally 
            {
                regla.Dispose();
            }
        }


        [Route("api/ModificarCantidades/")]
        [HttpPost]
        public List<ContingenciaCantidad> ModificarCantidades(dynamic datos)
        {

            DateTime fInicio = datos.fInicio.Value;
            DateTime fFin = datos.fFin.Value;
            fInicio = fInicio.Date.Add(new TimeSpan(0, 0, 0));
            fFin = fFin.AddDays(1.0);
            fFin = fFin.Date.Add(new TimeSpan(0, 0, 0));

            string linea = datos.linea.Value;


            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            TimeSpan diff = fInicio.ToUniversalTime() - origin;
            Int64 FechaInicio = Int64.Parse(Math.Floor(diff.TotalSeconds).ToString());
            diff = fFin.ToUniversalTime() - origin;
            Int64 FechaFin = Int64.Parse(Math.Floor(diff.TotalSeconds).ToString());

            try
            {
                DAO_Contingencias Contingencias = new DAO_Contingencias();
                List<ContingenciaCantidad> cantidades = new List<ContingenciaCantidad>();
                cantidades = Contingencias.obtenerContingencias(FechaInicio, FechaFin, linea);
                return cantidades;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.ModificarCantidades", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.ModificarCantidades", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_RELLENANDO_EL"));
            }

        }


        [Route("api/ObtenerSubGrid/{fecha}/{turno}/{linea}")]
        [HttpGet]
        public List<DTO.DTO_ContingenciasHoras> ObtenerSubGrid(Int64 fecha, string turno, string linea)
        {
            try
            {
                DAO_Contingencias Contingencias = new DAO_Contingencias();
                List<DTO.DTO_ContingenciasHoras> Horas = new List<DTO_ContingenciasHoras>();
                Horas = Contingencias.ObtenerSubGrid(fecha, turno, linea);
                return Horas;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.ObtenerSubGrid", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.ObtenerSubGrid", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_RELLENANDO_EL_SUBGRID"));
            }

        }

        [Route("api/modificarCantidad/")]
        [HttpPost]
        public object[] modificarCantidad(dynamic datosCantidades)
        {
            try
            {
                int Turno = int.Parse(datosCantidades.turno.Value.ToString());
                int hora = int.Parse(datosCantidades.Hora.Value.ToString());
                int eLlenadora = int.Parse(datosCantidades.eLlenadora.Value.ToString());
                int pPaletizadora = int.Parse(datosCantidades.pPaletizadora.Value.ToString());
                int rLlenadora = int.Parse(datosCantidades.rLlenadora.Value.ToString());
                int rPaletizadora = int.Parse(datosCantidades.rPaletizadora.Value.ToString());

                ContingenciaBread.ModificarCantidad(hora, Turno, eLlenadora, pPaletizadora, rLlenadora, rPaletizadora);
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "ContingenciasController.modificarCantidad", "Modificadas cantidades del turno:" + Turno.ToString() + " ,hora: " + hora.ToString(), HttpContext.Current.User.Identity.Name);
                return new object[] { true, "Los párametros se han actualizado correctamente" };

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "ContingenciasController.modificarCantidad", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "ContingenciasController.modificarCantidad", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR"));
            }

        }      
    }
}
