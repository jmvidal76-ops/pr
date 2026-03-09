using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.BBDD.Utilidades.Utils;
using MSM.Controllers.Planta;
using MSM.DTO.Envasado;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using MSM.RealTime;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace MSM.BBDD.Envasado.GestionAlertas
{
    public class DAO_GestionAlertas
    {
        #region GRUPOS

        public static bool MailGroup_Create(MailGroup mailGroup)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    context.MailGroup.Add(mailGroup);
                    context.SaveChanges();

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailGroup_Create", IdiomaController.GetResourceName("CREADO_CORRECTAMENTE") + 
                        " el grupo de email " + mailGroup.Name, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailGroup_Create", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static List<MailGroup> MailGroup_Read()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.MailGroup.AsNoTracking().ToList();
            }
        }

        public static bool MailGroup_Update(MailGroup mailGroup)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailGroup _mailGroupForUpdate = context.MailGroup.Where(m => m.Id == mailGroup.Id).FirstOrDefault();
                    if (_mailGroupForUpdate != null)
                    {
                        _mailGroupForUpdate.Name = mailGroup.Name;
                        _mailGroupForUpdate.UserAddress = mailGroup.UserAddress;
                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailGroup_Update", IdiomaController.GetResourceName("REGISTRO_ACTUALIZADO_CORRECTAMENTE") + 
                        " con Id " + mailGroup.Id, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailGroup_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailGroup_Delete(int id)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailGroup _mailGroupForDelete = context.MailGroup.Where(m => m.Id == id).FirstOrDefault();
                    if (_mailGroupForDelete != null)
                    {
                        context.MailGroup.Remove(_mailGroupForDelete);
                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailGroup_Delete", IdiomaController.GetResourceName("ELIMINACION_OK") + 
                        ". Grupo de email " + _mailGroupForDelete.Name, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    string mensajeError = ex.InnerException == null ? ex.Message : ex.InnerException.InnerException.Message;
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, mensajeError, "DAO_GestionAlertas.MailGroup_Delete", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }
        #endregion

        #region ALERTAS

        public static List<DTO_MailNotification> MailNotification_Read()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailNotification> _mailNotification = context.MailNotification.Include("MailGroup").AsNoTracking().ToList();

                    List<MailEquipmentNotification> _mailEquipmentNotification = context.MailEquipmentNotification.AsNoTracking().ToList();
                    List<Linea> linea = PlantaRT.planta.lineas.ToList();
                    List<Maquina> _equipment = new List<Maquina>();

                    foreach (var item in linea)
                    {
                        foreach (var maquina in item.obtenerMaquinas)
                        {
                            _equipment.Add(maquina);
                        }
                    }

                    var result = (from mailNoti in _mailNotification
                                  select new DTO_MailNotification()
                                  {
                                      Id = mailNoti.Id,
                                      UserAddress = mailNoti.UserAddress,
                                      StoppageTime = mailNoti.StoppageTime,
                                      SendedOn = mailNoti.SendedOn,
                                      Subject = mailNoti.Subject,
                                      BodyMessage = mailNoti.BodyMessage,
                                      MailGroup = mailNoti.MailGroup,
                                      Active = mailNoti.Active
                                  }
                                 ).Distinct().ToList();

                    foreach (var item in result)
                    {
                        List<MailEquipmentNotification> listEquipment = _mailEquipmentNotification.Where(e => e.IdMailNotification == item.Id).ToList();
                        List<Maquina> _listMaquinas = new List<Maquina>();
                        foreach (var equipoAsociado in listEquipment)
                        {
                            _listMaquinas.Add(_equipment.Where(e => e.id == equipoAsociado.IdMailEquipment).FirstOrDefault());
                        }
                        item.MailEquipments = _listMaquinas;
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static bool MailNotification_Create(DTO_MailNotification mailNotification)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    var _mailsGroup = mailNotification.MailGroup.Select(m => m.Id);
                    var _mailNotiAdd = new MailNotification()
                    {
                        Subject = mailNotification.Subject,
                        BodyMessage = mailNotification.BodyMessage,
                        StoppageTime = mailNotification.StoppageTime,
                        MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList(),
                        UserAddress = mailNotification.UserAddress,
                        Active = mailNotification.Active
                    };

                    context.MailNotification.Add(_mailNotiAdd);
                    context.SaveChanges();

                    mailNotification.Id = _mailNotiAdd.Id;
                    if (!MailEquipmentNotification_Update(mailNotification))
                        return false;

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailNotification_Create", IdiomaController.GetResourceName("CREADO_CORRECTAMENTE") +
                        " el registro de paro de máquina por un tiempo de " + mailNotification.StoppageTime + " minutos", HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailNotification_Create", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailNotification_Update(DTO_MailNotification mailNotification)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailNotification _mailNotificationForUpdate = context.MailNotification.Include("MailGroup").Where(m => m.Id == mailNotification.Id).FirstOrDefault();
                    if (_mailNotificationForUpdate != null)
                    {
                        _mailNotificationForUpdate.Subject = mailNotification.Subject;
                        _mailNotificationForUpdate.UserAddress = mailNotification.UserAddress;
                        _mailNotificationForUpdate.BodyMessage = mailNotification.BodyMessage;
                        _mailNotificationForUpdate.SendedOn = mailNotification.SendedOn;
                        _mailNotificationForUpdate.StoppageTime = mailNotification.StoppageTime;
                        _mailNotificationForUpdate.Active = mailNotification.Active;

                        var _mailsGroup = mailNotification.MailGroup.Select(m => m.Id);
                        _mailNotificationForUpdate.MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList();

                        if (!MailEquipmentNotification_Update(mailNotification))
                            return false;

                        context.Entry(_mailNotificationForUpdate).State = System.Data.Entity.EntityState.Modified;
                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailNotification_Update", IdiomaController.GetResourceName("REGISTRO_ACTUALIZADO_CORRECTAMENTE") +
                        " con Id " + mailNotification.Id, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailNotification_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailNotification_Delete(int id)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailNotification _mailNotificationForDelete = context.MailNotification.Include("MailGroup").Where(m => m.Id == id).FirstOrDefault();
                    if (_mailNotificationForDelete != null)
                    {
                        context.MailNotification.Remove(_mailNotificationForDelete);

                        List<MailEquipmentNotification> _mailEquipNotiRemove = context.MailEquipmentNotification.Where(m => m.IdMailNotification == id).ToList();
                        foreach (var item in _mailEquipNotiRemove)
                        {
                            context.MailEquipmentNotification.Remove(item);
                        }

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailNotification_Delete", IdiomaController.GetResourceName("ELIMINACION_OK") +
                           ". Tiempo de paro " + _mailNotificationForDelete.StoppageTime + " minutos", HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailNotification_Delete", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static void MailNotification_UpdateSendedOn(int id)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailNotification _mailNotificationForUpdate = context.MailNotification.Where(m => m.Id == id).FirstOrDefault();
                    if (_mailNotificationForUpdate != null)
                    {
                        _mailNotificationForUpdate.SendedOn = DateTime.UtcNow;
                        context.Entry(_mailNotificationForUpdate).State = System.Data.Entity.EntityState.Modified;
                        context.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        private static bool MailEquipmentNotification_Update(DTO_MailNotification mailNotification)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailEquipmentNotification> _mailEquipNotiRemove = context.MailEquipmentNotification.Where(m => m.IdMailNotification == mailNotification.Id).ToList();
                    foreach (var item in _mailEquipNotiRemove)
                    {
                        context.MailEquipmentNotification.Remove(item);
                    }

                    foreach (var item in mailNotification.MailEquipments)
                    {
                        context.MailEquipmentNotification.Add(new MailEquipmentNotification()
                        {
                            IdMailNotification = mailNotification.Id,
                            IdMailEquipment = item.id
                        });
                    }

                    context.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailEquipmentNotification_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public static void MailNotification_TestMail(int id, string pathFormatHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailNotification _contextMailNotification = context.MailNotification.Include("MailGroup").AsNoTracking().Where(m => m.Id == id).FirstOrDefault();
                    if (_contextMailNotification != null)
                    {
                        string _equipment = context.MailEquipmentNotification.AsNoTracking().Where(e => e.IdMailNotification == _contextMailNotification.Id).FirstOrDefault().IdMailEquipment;
                        var _userAddress = _contextMailNotification.MailGroup
                            .GroupBy(x => x.Name)
                            .Select(
                                x => new
                                {
                                    Subject = x.Key,
                                    Address = string.Join(", ", x.Select(n => n.UserAddress))
                                }
                            );
                        string address = _userAddress.FirstOrDefault().Address;

                        DTO_MailNotification mailNotification = new DTO_MailNotification()
                        {
                            Id = _contextMailNotification.Id,
                            BodyMessage = _contextMailNotification.BodyMessage,
                            Subject = _contextMailNotification.Subject,
                            UserAddress = address,
                            IdEquipment = _equipment,
                            DescriptionEquipment = _equipment
                        };

                        DAO_Utils.SendMail(mailNotification, pathFormatHTML, true);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailNotification_TestMail", "I-MES-WEB", HttpContext.Current.User.Identity.Name);
                    throw ex;
                }
            }
        }
        #endregion

        #region MALA GESTION WO

        public static List<DTO_MailMalaGestionWO> MailMalaGestionWO_Read()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailMalaGestionWO> _mailMalaGestionWO = context.MailMalaGestionWO.Include("MailGroup").AsNoTracking().ToList();

                    List<MailMalaGestionWOLineas> _mailLineas = context.MailMalaGestionWOLineas.AsNoTracking().ToList();
                    List<Lineas> lineas = context.Lineas.ToList();

                    var result = (from mailMalaGestionWO in _mailMalaGestionWO
                                  select new DTO_MailMalaGestionWO()
                                  {
                                      Id = mailMalaGestionWO.Id,
                                      Asunto = mailMalaGestionWO.Asunto,
                                      CuerpoMensaje = mailMalaGestionWO.CuerpoMensaje,
                                      MailGrupos = mailMalaGestionWO.MailGroup,
                                      Activo = mailMalaGestionWO.Activo,
                                      FechaEnvio = mailMalaGestionWO.FechaEnvio
                                  }
                                 ).Distinct().ToList();

                    foreach (var item in result)
                    {
                        List<MailMalaGestionWOLineas> listaMailLineas = _mailLineas.Where(e => e.IdMailGestionWO == item.Id).ToList();
                        List<Lineas> _listaLineas = new List<Lineas>();
                        foreach (var linea in listaMailLineas)
                        {
                            _listaLineas.Add(lineas.Where(l => l.Id == linea.IdLinea).FirstOrDefault());
                        }
                        item.MailLineas = _listaLineas;
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static bool MailMalaGestionWO_Create(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    var _mailsGroup = mailMalaGestionWO.MailGrupos.Select(m => m.Id);
                    var _mailMalaGestionWOAdd = new MailMalaGestionWO()
                    {
                        Asunto = mailMalaGestionWO.Asunto,
                        CuerpoMensaje = mailMalaGestionWO.CuerpoMensaje,
                        MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList(),
                        Activo = mailMalaGestionWO.Activo,
                    };

                    context.MailMalaGestionWO.Add(_mailMalaGestionWOAdd);
                    context.SaveChanges();

                    mailMalaGestionWO.Id = _mailMalaGestionWOAdd.Id;
                    if (!MailMalaGestionWOLineas_Update(mailMalaGestionWO))
                        return false;

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailMalaGestionWO_Create", IdiomaController.GetResourceName("CREADO_CORRECTAMENTE") + 
                        " el registro de mala gestión de WO con asunto " + mailMalaGestionWO.Asunto, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailMalaGestionWO_Create", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailMalaGestionWO_Update(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailMalaGestionWO _mailMalaGestionWOForUpdate = context.MailMalaGestionWO.Include("MailGroup").Where(m => m.Id == mailMalaGestionWO.Id).FirstOrDefault();
                    if (_mailMalaGestionWOForUpdate != null)
                    {
                        _mailMalaGestionWOForUpdate.Asunto = mailMalaGestionWO.Asunto;
                        _mailMalaGestionWOForUpdate.CuerpoMensaje = mailMalaGestionWO.CuerpoMensaje;
                        _mailMalaGestionWOForUpdate.Activo = mailMalaGestionWO.Activo;

                        var _mailsGroup = mailMalaGestionWO.MailGrupos.Select(m => m.Id);
                        _mailMalaGestionWOForUpdate.MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList();

                        if (!MailMalaGestionWOLineas_Update(mailMalaGestionWO))
                            return false;

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailMalaGestionWO_Update", IdiomaController.GetResourceName("REGISTRO_ACTUALIZADO_CORRECTAMENTE") +
                        " con Id " + mailMalaGestionWO.Id, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailMalaGestionWO_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailMalaGestionWO_Delete(int id)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailMalaGestionWO _mailMalaGestionWOForDelete = context.MailMalaGestionWO.Include("MailGroup").Where(m => m.Id == id).FirstOrDefault();
                    if (_mailMalaGestionWOForDelete != null)
                    {
                        context.MailMalaGestionWO.Remove(_mailMalaGestionWOForDelete);

                        List<MailMalaGestionWOLineas> _mailLineasRemove = context.MailMalaGestionWOLineas.Where(m => m.IdMailGestionWO == id).ToList();
                        foreach (var item in _mailLineasRemove)
                        {
                            context.MailMalaGestionWOLineas.Remove(item);
                        }

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailMalaGestionWO_Delete", IdiomaController.GetResourceName("ELIMINACION_OK") + 
                        ". Asunto " + _mailMalaGestionWOForDelete.Asunto, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailMalaGestionWO_Delete", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        private static bool MailMalaGestionWOLineas_Update(DTO_MailMalaGestionWO mailMalaGestionWO)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailMalaGestionWOLineas> _mailLineasRemove = context.MailMalaGestionWOLineas.Where(m => m.IdMailGestionWO == mailMalaGestionWO.Id).ToList();
                    foreach (var item in _mailLineasRemove)
                    {
                        context.MailMalaGestionWOLineas.Remove(item);
                    }

                    foreach (var item in mailMalaGestionWO.MailLineas)
                    {
                        context.MailMalaGestionWOLineas.Add(new MailMalaGestionWOLineas()
                        {
                            IdMailGestionWO = mailMalaGestionWO.Id,
                            IdLinea = item.Id
                        });
                    }

                    context.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailMalaGestionWOLineas_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }
        }

        public static void MailMalaGestionWO_TestMail(int id, string pathFormatHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailMalaGestionWO _contextMailMalaGestionWO = context.MailMalaGestionWO.Include("MailGroup").AsNoTracking().Where(m => m.Id == id).FirstOrDefault();
                    if (_contextMailMalaGestionWO != null)
                    {
                        string idLinea = context.MailMalaGestionWOLineas.AsNoTracking().Where(e => e.IdMailGestionWO == _contextMailMalaGestionWO.Id).FirstOrDefault().IdLinea;
                        Lineas linea = context.Lineas.Where(l => l.Id == idLinea).FirstOrDefault();

                        var direccionesUsuario = _contextMailMalaGestionWO.MailGroup
                            .GroupBy(x => x.Name)
                            .Select(
                                x => new
                                {
                                    Subject = x.Key,
                                    Address = string.Join(", ", x.Select(n => n.UserAddress))
                                }
                            );
                        string direccion = direccionesUsuario.FirstOrDefault().Address;

                        DTO_MailMalaGestionWO mailMalaGestionWO = new DTO_MailMalaGestionWO()
                        {
                            Id = _contextMailMalaGestionWO.Id,
                            Asunto = _contextMailMalaGestionWO.Asunto,
                            CuerpoMensaje = _contextMailMalaGestionWO.CuerpoMensaje,
                            Direccion = direccion,
                            LineaDescripcion = "Línea " + linea.NumeroLineaDescripcion + " - " + linea.Descripcion,
                        };

                        DAO_Utils.MalaGestionWO_SendMail(mailMalaGestionWO, pathFormatHTML);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailMalaGestionWO_TestMail", "I-MES-WEB", HttpContext.Current.User.Identity.Name);
                    throw ex;
                }
            }
        }

        #endregion

        #region PARTES CALIDAD NO VALIDOS

        public static List<DTO_MailPartesCalidadNoValidos> MailPartesCalidadNoValidos_Read()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailPartesCalidadNoValidos> _mailPartesCalidad = context.MailPartesCalidadNoValidos.Include("MailGroup").AsNoTracking().ToList();

                    var result = (from mailParteCalidad in _mailPartesCalidad
                                  select new DTO_MailPartesCalidadNoValidos()
                                  {
                                      IdMailParteCalidad = mailParteCalidad.IdMailParteCalidad,
                                      PuntoVerificacion = mailParteCalidad.PuntoVerificacion,
                                      Asunto = mailParteCalidad.Asunto,
                                      CuerpoMensaje = mailParteCalidad.CuerpoMensaje,
                                      MailGrupos = mailParteCalidad.MailGroup,
                                      Activo = mailParteCalidad.Activo,
                                      FechaEnvio = mailParteCalidad.FechaEnvio
                                  }
                                 ).Distinct().ToList();

                    return result;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Read", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public static bool MailPartesCalidadNoValidos_Create(DTO_MailPartesCalidadNoValidos mailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    var _mailsGroup = mailParteCalidad.MailGrupos.Select(m => m.Id);
                    var _mailParteCalidadAdd = new MailPartesCalidadNoValidos()
                    {
                        PuntoVerificacion = mailParteCalidad.PuntoVerificacion,
                        Asunto = mailParteCalidad.Asunto,
                        CuerpoMensaje = mailParteCalidad.CuerpoMensaje,
                        MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList(),
                        Activo = mailParteCalidad.Activo
                    };

                    context.MailPartesCalidadNoValidos.Add(_mailParteCalidadAdd);
                    context.SaveChanges();

                    mailParteCalidad.IdMailParteCalidad = _mailParteCalidadAdd.IdMailParteCalidad;

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Create", IdiomaController.GetResourceName("CREADO_CORRECTAMENTE") +
                        " el registro para el parte de calidad no válido con punto de verificación " + mailParteCalidad.PuntoVerificacion, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Create", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailPartesCalidadNoValidos_Update(DTO_MailPartesCalidadNoValidos mailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadNoValidos _mailPartesCalidadForUpdate = context.MailPartesCalidadNoValidos.Include("MailGroup").Where(m => m.IdMailParteCalidad == mailParteCalidad.IdMailParteCalidad).FirstOrDefault();
                    if (_mailPartesCalidadForUpdate != null)
                    {
                        _mailPartesCalidadForUpdate.PuntoVerificacion = mailParteCalidad.PuntoVerificacion;
                        _mailPartesCalidadForUpdate.Asunto = mailParteCalidad.Asunto;
                        _mailPartesCalidadForUpdate.CuerpoMensaje = mailParteCalidad.CuerpoMensaje;
                        _mailPartesCalidadForUpdate.Activo = mailParteCalidad.Activo;

                        var _mailsGroup = mailParteCalidad.MailGrupos.Select(m => m.Id);
                        _mailPartesCalidadForUpdate.MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList();

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Update", IdiomaController.GetResourceName("REGISTRO_ACTUALIZADO_CORRECTAMENTE") +
                        " con Id " + mailParteCalidad.IdMailParteCalidad, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailPartesCalidadNoValidos_Delete(int idMailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadNoValidos _mailPartesCalidadForDelete = context.MailPartesCalidadNoValidos.Include("MailGroup").Where(m => m.IdMailParteCalidad == idMailParteCalidad).FirstOrDefault();
                    if (_mailPartesCalidadForDelete != null)
                    {
                        context.MailPartesCalidadNoValidos.Remove(_mailPartesCalidadForDelete);

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Delete", IdiomaController.GetResourceName("ELIMINACION_OK") + 
                        ". Punto de verificación " + _mailPartesCalidadForDelete.PuntoVerificacion, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadNoValidos_Delete", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static void MailPartesCalidadNoValidos_TestMail(int id, string pathFormatHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadNoValidos _contextMailPartesCalidad = context.MailPartesCalidadNoValidos.Include("MailGroup").AsNoTracking().Where(m => m.IdMailParteCalidad == id).FirstOrDefault();
                    if (_contextMailPartesCalidad != null)
                    {
                        var direccionesUsuario = _contextMailPartesCalidad.MailGroup
                            .GroupBy(x => x.Name)
                            .Select(
                                x => new
                                {
                                    Subject = x.Key,
                                    Address = string.Join(", ", x.Select(n => n.UserAddress))
                                }
                            );
                        string direccion = direccionesUsuario.FirstOrDefault().Address;

                        DTO_MailPartesCalidadNoValidos mailPartesCalidad = new DTO_MailPartesCalidadNoValidos()
                        {
                            IdMailParteCalidad = _contextMailPartesCalidad.IdMailParteCalidad,
                            PuntoVerificacion = _contextMailPartesCalidad.PuntoVerificacion,
                            Asunto = _contextMailPartesCalidad.Asunto,
                            CuerpoMensaje = _contextMailPartesCalidad.CuerpoMensaje,
                            Direccion = direccion,
                        };

                        DAO_Utils.PartesCalidadNoValidos_SendMail(mailPartesCalidad, pathFormatHTML);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailPartesCalidadNoValidos_TestMail", "I-MES-WEB", HttpContext.Current.User.Identity.Name);
                    throw ex;
                }
            }
        }

        #endregion

        #region PARTES CALIDAD PENDIENTES

        public static List<DTO_MailPartesCalidadPendientes> MailPartesCalidadPendientes_Read()
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    List<MailPartesCalidadPendientes> _mailPartesCalidad = context.MailPartesCalidadPendientes.Include("MailGroup").AsNoTracking().ToList();

                    var result = (from mailParteCalidad in _mailPartesCalidad
                                  select new DTO_MailPartesCalidadPendientes()
                                  {
                                      IdMailParteCalidad = mailParteCalidad.IdMailParteCalidad,
                                      PuntoVerificacion = mailParteCalidad.PuntoVerificacion,
                                      Asunto = mailParteCalidad.Asunto,
                                      CuerpoMensaje = mailParteCalidad.CuerpoMensaje,
                                      MailGrupos = mailParteCalidad.MailGroup,
                                      Activo = mailParteCalidad.Activo,
                                      FechaEnvio = mailParteCalidad.FechaEnvio
                                  }
                                 ).Distinct().ToList();

                    return result;
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailPartesCalidadPendientes_Read", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                throw ex;
            }
        }

        public static bool MailPartesCalidadPendientes_Create(DTO_MailPartesCalidadPendientes mailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    var _mailsGroup = mailParteCalidad.MailGrupos.Select(m => m.Id);
                    var _mailParteCalidadAdd = new MailPartesCalidadPendientes()
                    {
                        PuntoVerificacion = mailParteCalidad.PuntoVerificacion,
                        Asunto = mailParteCalidad.Asunto,
                        CuerpoMensaje = mailParteCalidad.CuerpoMensaje,
                        MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList(),
                        Activo = mailParteCalidad.Activo
                    };

                    context.MailPartesCalidadPendientes.Add(_mailParteCalidadAdd);
                    context.SaveChanges();

                    mailParteCalidad.IdMailParteCalidad = _mailParteCalidadAdd.IdMailParteCalidad;

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadPendientes_Create", IdiomaController.GetResourceName("CREADO_CORRECTAMENTE") +
                        " el registro para el parte de calidad pendiente con punto de verificación " + mailParteCalidad.PuntoVerificacion, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadPendientes_Create", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailPartesCalidadPendientes_Update(DTO_MailPartesCalidadPendientes mailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadPendientes _mailPartesCalidadForUpdate = context.MailPartesCalidadPendientes.Include("MailGroup").Where(m => m.IdMailParteCalidad == mailParteCalidad.IdMailParteCalidad).FirstOrDefault();
                    if (_mailPartesCalidadForUpdate != null)
                    {
                        _mailPartesCalidadForUpdate.PuntoVerificacion = mailParteCalidad.PuntoVerificacion;
                        _mailPartesCalidadForUpdate.Asunto = mailParteCalidad.Asunto;
                        _mailPartesCalidadForUpdate.CuerpoMensaje = mailParteCalidad.CuerpoMensaje;
                        _mailPartesCalidadForUpdate.Activo = mailParteCalidad.Activo;

                        var _mailsGroup = mailParteCalidad.MailGrupos.Select(m => m.Id);
                        _mailPartesCalidadForUpdate.MailGroup = context.MailGroup.Where(g => _mailsGroup.Contains(g.Id)).ToList();

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadPendientes_Update", IdiomaController.GetResourceName("REGISTRO_ACTUALIZADO_CORRECTAMENTE") +
                        " con Id " + mailParteCalidad.IdMailParteCalidad, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadPendientes_Update", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static bool MailPartesCalidadPendientes_Delete(int idMailParteCalidad)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadPendientes _mailPartesCalidadForDelete = context.MailPartesCalidadPendientes.Include("MailGroup").Where(m => m.IdMailParteCalidad == idMailParteCalidad).FirstOrDefault();
                    if (_mailPartesCalidadForDelete != null)
                    {
                        context.MailPartesCalidadPendientes.Remove(_mailPartesCalidadForDelete);

                        context.SaveChanges();
                    }

                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_GestionAlertas.MailPartesCalidadPendientes_Delete", IdiomaController.GetResourceName("ELIMINACION_OK") +
                        ". Punto de verificación " + _mailPartesCalidadForDelete.PuntoVerificacion, HttpContext.Current.User.Identity.Name);
                    return true;
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_GestionAlertas.MailPartesCalidadPendientes_Delete", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                    return false;
                }
            }
        }

        public static void MailPartesCalidadPendientes_TestMail(int id, string pathFormatHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                try
                {
                    MailPartesCalidadPendientes _contextMailPartesCalidad = context.MailPartesCalidadPendientes.Include("MailGroup").AsNoTracking().Where(m => m.IdMailParteCalidad == id).FirstOrDefault();
                    if (_contextMailPartesCalidad != null)
                    {
                        var direccionesUsuario = _contextMailPartesCalidad.MailGroup
                            .GroupBy(x => x.Name)
                            .Select(
                                x => new
                                {
                                    Subject = x.Key,
                                    Address = string.Join(", ", x.Select(n => n.UserAddress))
                                }
                            );
                        string direccion = direccionesUsuario.FirstOrDefault().Address;

                        DTO_MailPartesCalidadPendientes mailPartesCalidad = new DTO_MailPartesCalidadPendientes()
                        {
                            IdMailParteCalidad = _contextMailPartesCalidad.IdMailParteCalidad,
                            PuntoVerificacion = _contextMailPartesCalidad.PuntoVerificacion,
                            Asunto = _contextMailPartesCalidad.Asunto,
                            CuerpoMensaje = _contextMailPartesCalidad.CuerpoMensaje,
                            Direccion = direccion,
                        };

                        DAO_Utils.PartesCalidadPendientes_SendMail(mailPartesCalidad, pathFormatHTML);
                    }
                }
                catch (Exception ex)
                {
                    DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_GestionAlertas.MailPartesCalidadPendientes_TestMail", "I-MES-WEB", HttpContext.Current.User.Identity.Name);
                    throw ex;
                }
            }
        }

        #endregion
    }
}