using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Alt;
using MSM.Mappers.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Alt
{
    public class DAO_AnaliticasO2: IDAO_AnaliticasO2
    {
        private IApiClient _api;
        private string _urlO2Llenadoras;        
        private string UriLIMS;
        private string UriCalidad = ConfigurationManager.AppSettings["HostApiCalidad"].ToString();
        private string UriBaseLims = ConfigurationManager.AppSettings["HostApiLIMS"].ToString();

        public DAO_AnaliticasO2()
        {
        }

        public DAO_AnaliticasO2(IApiClient api)
        {
            _api = api;
            _urlO2Llenadoras = string.Concat(UriCalidad, "api/O2_Llenadoras/");
            UriLIMS = UriBaseLims + "api/LIMS/";
        }

        public List<O2_Llenadoras> ObtenerAnaliticasO2(DateTime fechaInicio, DateTime fechaFin)
        {
            var lista = new List<O2_Llenadoras>();

            using (FormsDBEnt context = new FormsDBEnt())
            {
                lista = context.O2_Llenadoras.AsNoTracking().Where(x => x.Fecha >= fechaInicio && x.Fecha <= fechaFin).OrderByDescending(x => x.Fecha).ToList();
            }

            foreach (var item in lista)
            {
                item.Fecha = item.Fecha.ToLocalTime();
            }

            return lista;
        }

        public List<TiposUnidades> ObtenerUnidadesAnalitica()
        {
            using (FormsDBEnt context = new FormsDBEnt())
            {
                return context.TiposUnidades.AsNoTracking().ToList();
            }
        }

        public string GuardarAnaliticaO2(O2_Llenadoras datos)
        {
            try
            {
                int numLinea = Convert.ToInt32(new string(datos.Linea.Where(c => Char.IsDigit(c)).ToArray()));
                using (MESEntities context = new MESEntities())
                {
                    datos.IdLinea = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).Select(l => l.Id).First();
                }

                datos.Fecha = datos.Fecha == DateTime.MinValue ? DateTime.UtcNow : datos.Fecha;

                using (FormsDBEnt contexto = new FormsDBEnt())
                {
                    O2_Llenadoras analitica = contexto.O2_Llenadoras.FirstOrDefault(x => x.Id == datos.Id);

                    if (analitica == null) // No existe el parametro así que lo creamos
                    {
                        if (contexto.O2_Llenadoras.Any(m => m.IdMuestra == datos.IdMuestra))
                        {
                            return "YA_EXISTE_MUESTRA";
                        }
                        contexto.O2_Llenadoras.Add(datos);
                    }
                    else // El parametro existe y hay que modificarlo
                    {
                        Mapper_AnaliticasO2.MapperO2Llenadoras(datos, analitica);
                    }

                    contexto.SaveChanges();
                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_AnaliticasO2.GuardarAnaliticaO2", IdiomaController.GetResourceName("SE_HA_GUARDADO_ANALITICA") + datos.IdMuestra, HttpContext.Current.User.Identity.Name);
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_AÑADIR_ANALITICA") + ". " + ex.Message + " -> " + ex.StackTrace, 
                    "DAO_AnaliticasO2.GuardarAnaliticaO2", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public int GuardarAnaliticasO2Importar(dynamic datos)
        {
            try
            {
                var correctos = 0;

                foreach (var dato in datos)
                {
                    O2_Llenadoras O2Llenadora = Mapper_AnaliticasO2.MapperDynamicToO2Llenadoras(dato);

                    if (O2Llenadora.Linea == string.Empty)
                    {
                        O2Llenadora.IdLinea = string.Empty;
                    }
                    else
                    {
                        int numLinea = Convert.ToInt32(new string(O2Llenadora.Linea.Where(c => Char.IsDigit(c)).ToArray()));
                        using (MESEntities context = new MESEntities())
                        {
                            O2Llenadora.IdLinea = context.Lineas.AsNoTracking().Where(l => l.NumeroLinea == numLinea).Select(l => l.Id).First();
                        }
                    }

                    O2Llenadora.Fecha = O2Llenadora.Fecha == DateTime.MinValue ? DateTime.Now : O2Llenadora.Fecha;

                    using (FormsDBEnt contexto = new FormsDBEnt())
                    {
                        O2_Llenadoras analitica = contexto.O2_Llenadoras.FirstOrDefault(x => x.IdMuestra == O2Llenadora.IdMuestra);

                        if (analitica == null) // No existe el parametro así que lo creamos
                        {
                            contexto.O2_Llenadoras.Add(O2Llenadora);
                        }
                        else // El parametro existe y hay que modificarlo
                        {
                            Mapper_AnaliticasO2.MapperO2Llenadoras(O2Llenadora, analitica);
                        }

                        contexto.SaveChanges();
                        correctos++;
                    }
                }

                return correctos;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_IMPORTAR_EXCEL") + ". " + ex.Message + " -> " + ex.StackTrace,
                    "DAO_AnaliticasO2.GuardarAnaliticaO2Importar", "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public bool EliminarAnaliticaO2(O2_Llenadoras datos)
        {
            try
            {
                using (FormsDBEnt contexto = new FormsDBEnt())
                {
                    O2_Llenadoras analitica = contexto.O2_Llenadoras.FirstOrDefault(x => x.IdMuestra == datos.IdMuestra);

                    if (analitica != null)
                    {
                        contexto.O2_Llenadoras.Remove(analitica);
                        contexto.SaveChanges();
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
        public List<O2_Llenadoras> ObtenerAnaliticasO2Terminal(string linea)
        {
            var lista = new List<O2_Llenadoras>();
            var fechaInicio = DateTime.UtcNow.AddDays(-7);
            var fechaFin = DateTime.UtcNow;

            using (FormsDBEnt context = new FormsDBEnt())
            {
                lista = context.O2_Llenadoras.AsNoTracking().Where(x => x.Linea == linea && x.Fecha >= fechaInicio && x.Fecha <= fechaFin).OrderByDescending(x => x.Fecha).ToList();
            }

            foreach (var item in lista)
            {
                item.Fecha = item.Fecha.ToLocalTime();
            }

            return lista;
        }

        public List<O2_Llenadoras_Tolerancias> ObtenerToleranciasO2()
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                return contexto.O2_Llenadoras_Tolerancias.AsNoTracking().ToList();
            }
        }

        public bool EditarToleranciasO2(O2_Llenadoras_Tolerancias tolerancia)
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                try
                {
                    O2_Llenadoras_Tolerancias toleranciaExistente = contexto.O2_Llenadoras_Tolerancias.Where(t => t.Id == tolerancia.Id).FirstOrDefault();
                    if (toleranciaExistente != null)
                    {
                        toleranciaExistente.LimiteIncremento = tolerancia.LimiteIncremento;
                        toleranciaExistente.ToleranciaIncremento = tolerancia.ToleranciaIncremento;
                        
                        contexto.SaveChanges();
                    }

                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }

        public List<O2_Llenadoras_Parametros> ObtenerParametrosO2()
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                return contexto.O2_Llenadoras_Parametros.AsNoTracking().ToList();
            }
        }

        public bool EditarParametrosO2(O2_Llenadoras_Parametros parametro)
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                try
                {
                    O2_Llenadoras_Parametros paramExistente = contexto.O2_Llenadoras_Parametros.Where(t => t.Id == parametro.Id).FirstOrDefault();
                    if (paramExistente != null)
                    {
                        paramExistente.ConTPO = parametro.ConTPO;

                        contexto.SaveChanges();
                    }

                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }

        public List<O2_Llenadoras_ToleranciasCO2> ObtenerToleranciasCO2()
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                return contexto.O2_Llenadoras_ToleranciasCO2.AsNoTracking().ToList();
            }
        }

        public bool EditarToleranciasCO2(O2_Llenadoras_ToleranciasCO2 tolerancia)
        {
            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                try
                {
                    O2_Llenadoras_ToleranciasCO2 toleranciaExistente = contexto.O2_Llenadoras_ToleranciasCO2.Where(t => t.Id == tolerancia.Id).FirstOrDefault();
                    if (toleranciaExistente != null)
                    {
                        toleranciaExistente.LimiteInferior = tolerancia.LimiteInferior;
                        toleranciaExistente.LimiteSuperior = tolerancia.LimiteSuperior;
                        toleranciaExistente.ToleranciaInferior = tolerancia.ToleranciaInferior;
                        toleranciaExistente.ToleranciaSuperior = tolerancia.ToleranciaSuperior;

                        contexto.SaveChanges();
                    }

                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }

        public bool EditarPresion(dynamic datos)
        {
            string idMuestra = datos.idMuestra.ToString();
            int tipo = (int)datos.tipo;
            decimal cantidad = (decimal)datos.cantidad;
            TipoParametrosO2 tipoParametro = (TipoParametrosO2)tipo;

            using (FormsDBEnt contexto = new FormsDBEnt())
            {
                try
                {
                    O2_Llenadoras analitica = contexto.O2_Llenadoras.FirstOrDefault(x => x.IdMuestra == idMuestra);
                    if (analitica != null)
                    {
                        switch (tipoParametro)
                        {
                            case TipoParametrosO2.PresionVacio:
                                analitica.PresionVacio = cantidad;
                                break;
                            case TipoParametrosO2.PresionEspumado:
                                analitica.PresionEspumado = cantidad;
                                break;
                            case TipoParametrosO2.PresionSoplado:
                                analitica.PresionSoplado = cantidad;
                                break;
                            case TipoParametrosO2.ConsumoGas:
                                analitica.ConsumoGas = cantidad;
                                break;
                        }

                        contexto.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_AnaliticasO2.EditarPresion", IdiomaController.GetResourceName("SE_HA_EDITADO_PRESION"), HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, IdiomaController.GetResourceName("ERROR_EDITAR_PRESION") + ". IdMuestra " + idMuestra + 
                        ", tipo " + tipo + ", cantidad " + cantidad + ". " + ex.Message + " -> " + ex.StackTrace, "DAO_AnaliticasO2.EditarPresion", 
                        "WEB-CALIDAD", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public async Task<decimal> ObtenerTPO_O2Llenadoras(string linea, DateTime desde, DateTime hasta)
        {
            var result = await _api.GetPostsAsync<decimal>(string.Concat(_urlO2Llenadoras, "ObtenerTPOLlenadoras?linea=", linea, "&desde=" + desde.ToString(), "&hasta=" + hasta.ToString()));

            return result;
        }

        public async Task<DTO_RespuestaAPI<List<DTO_VariacionGasesArranquesEnvasado>>> ObtenerVariacionGasesArranquesEnvasado(DateTime fechaInicio, DateTime fechaFin)
        {
            var ret = await _api.GetPostsAsync<DTO_RespuestaAPI<List<DTO_VariacionGasesArranquesEnvasado>>>(string.Concat(UriLIMS, "ObtenerVariacionGasesArranquesEnvasado?fechaInicio=" + fechaInicio.ToUniversalTime().ToString("u"), "&fechaFin=" + fechaFin.ToUniversalTime().ToString("u")));
            return ret;
        }
    }
}