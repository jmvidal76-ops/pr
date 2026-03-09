using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.DTO.Envasado;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.RealTime;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Web;

namespace MSM.BBDD.Utilidades.Utils
{
    public class DAO_Utils
    {
        public static void SendGenericMail(DTO_MailGeneric mailInfo, bool esManual)
        {
            using (MESEntities context = new MESEntities())
            {
                var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                {
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(_mailConfiguration.MailAddress);

                    foreach (var item in mailInfo.Recipients)
                    {
                        if (!string.IsNullOrEmpty(item))
                            mail.To.Add(item);
                    }

                    mail.Subject = mailInfo.Subject;

                    try
                    {
                        mail.Body = mailInfo.ConstructBody;
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/SendGenericEmail.ConstructBody", "WEB-ENVASADO", "System");
                    }

                    mail.IsBodyHtml = true;
                    SmtpServer.Port = _mailConfiguration.Port;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = _mailConfiguration.SSL;

                    if (_mailConfiguration.AuthenticationSMTP == "Basica")
                    {
                        SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                    }

                    try
                    {
                        SmtpServer.Send(mail);

                        if (esManual)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.SendGenericMail", "Envío de email", HttpContext.Current.User.Identity.Name);
                        }
                        else
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 7, 1, "Envío de email", "DAO_Utils.SendGenericMail", "WEB-ENVASADO", "Sistema");
                        }

                    }
                    catch (Exception ex)
                    {                        
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_Utils.SendGenericMail", "WEB-ENVASADO", "Sistema");
                        throw ex;
                    }
                }
            }
        }

        public static void SendMail(DTO_MailNotification mailNotification, string pathHTML, bool esManual)
        {
            using (MESEntities context = new MESEntities())
            {
                var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                {
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(_mailConfiguration.MailAddress);

                    string[] addressConcat = mailNotification.UserAddress.Split(';');
                    foreach (var item in addressConcat)
                    {
                        if (!string.IsNullOrEmpty(item))
                            mail.To.Add(item);
                    }

                    mail.Subject = mailNotification.Subject;
                    mail.Body = CreateEmailBody(mailNotification, pathHTML);
                    mail.IsBodyHtml = true;
                    SmtpServer.Port = _mailConfiguration.Port;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = _mailConfiguration.SSL;

                    if (_mailConfiguration.AuthenticationSMTP == "Basica")
                    {
                        SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                    }

                    try
                    {
                        SmtpServer.Send(mail);
                        
                        if (esManual)
                        {
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.sendMail", "Envío de email", HttpContext.Current.User.Identity.Name);
                        }
                        else
                        {
                            DAO_Log.RegistrarLogBook("WEB-BACKEND", 7, 1, "Envío de email", "DAO_Utils.sendMail", "WEB-ENVASADO", "Sistema");
                        }

                    }
                    catch (Exception ex)
                    {
                        if (PlantaRT.activarLogTiemposParosMaquina)
                        {
                            DAO_Log.EscribeLog("T_PARO_MAQ-Enviar email", "Error: " + ex.Message, "Error");
                        }
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_Utils.sendMail", "I-MES-REALTIME", "Sistema");
                        throw ex;
                    }
                }
            }
        }

        public static void TestMail(string toUser)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                    using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                    {
                        MailMessage mail = new MailMessage();
                        mail.From = new MailAddress(_mailConfiguration.MailAddress);
                        mail.To.Add(toUser);
                        mail.Subject = IdiomaController.GetResourceName("CORREO_PRUEBA");
                        mail.Body = IdiomaController.GetResourceName("CORREO_PRUEBA");
                        mail.IsBodyHtml = false;
                        SmtpServer.Port = _mailConfiguration.Port;
                        SmtpServer.UseDefaultCredentials = false;
                        SmtpServer.EnableSsl = _mailConfiguration.SSL;

                        if (_mailConfiguration.AuthenticationSMTP == "Basica")
                        {
                            SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                        }

                        SmtpServer.Send(mail);

                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.TestMail", "Envio de test de email para: " + toUser, HttpContext.Current.User.Identity.Name);
                    }
                }
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/testMail", "WEB-ENVASADO", "Sistema");
                throw ex;
            }
        }

        private static string CreateEmailBody(DTO_MailNotification mailNoti, string pathHTML)
        {
            string body = string.Empty;
            try
            {
                using (StreamReader reader = new StreamReader(pathHTML))
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{automaticMessage}", IdiomaController.GetResourceName("MAIL_AUTOMATICO_MES"));
                body = body.Replace("{subject}", mailNoti.IdEquipment + " / " + mailNoti.DescriptionEquipment);
                body = body.Replace("{message}", mailNoti.BodyMessage);
                body = body.Replace("{footerMessage}", IdiomaController.GetResourceName("NO_RESPONDA_ESTE_CORREO"));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/createEmailBody", "WEB-ENVASADO", "System");
            }

            return body;
        }

        public static List<DTO_ConfiguracionVisualizacionColumnas> ObtenerConfiguracionVisualizacionColumnas(string pantalla)
        {
            try
            {
                var lista = new List<DTO_ConfiguracionVisualizacionColumnas>();

                using (MESEntities context = new MESEntities())
                {
                    // Obtenemos las configuraciones de columnas de la pantalla
                    lista = context.ConfiguracionVisualizacionColumnas.AsNoTracking()
                        .Where(e => e.Pantalla.ToUpper().Equals(pantalla.ToUpper()))
                        .OrderBy(e => e.NombreConfiguracion)
                        .AsEnumerable().Select(e => DTO_ConfiguracionVisualizacionColumnas.Mapper_ConfiguracionVisualicacionColumnas_toDTO(e)).ToList();
                }

                return lista;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_OBTENER_CONFIGURACIONES_COLUMNAS").Replace("#PANTALLA", pantalla) + ": " + ex.Message, "DAO_Utils.ObtenerConfiguracionVisualizacionColumnas", "WEB-Utilidades", "Sistema");
                return null;
            }
        }

        public static bool GuardarConfiguracionVisualicacionColumnas(DTO_ConfiguracionVisualizacionColumnas datos)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    // Comprobamos si existe una configuracion con el mismo nombre
                    var elem = context.ConfiguracionVisualizacionColumnas
                        .Where(e => e.Pantalla.ToUpper().Equals(datos.Pantalla.ToUpper()) && e.NombreConfiguracion.ToUpper().Equals(datos.Nombre.ToUpper()))
                        .FirstOrDefault();

                    if (elem != null)
                    {
                        // reemplazamos la configuracion existente
                        elem.ConfiguracionColumnas = datos.Configuracion;
                    }
                    else
                    {
                        // creamos una nueva configuracion
                        context.ConfiguracionVisualizacionColumnas.Add(
                            new ConfiguracionVisualizacionColumnas()
                            {
                                NombreConfiguracion = datos.Nombre,
                                Pantalla = datos.Pantalla,
                                ConfiguracionColumnas = datos.Configuracion
                            });
                    }
                    context.SaveChanges();
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_GUARDAR_CONFIGURACION_VISUALIZACION_COLUMNAS").Replace("#PANTALLA", datos.Pantalla) + ": " + ex.Message, "DAO_Utils.GuardarConfiguracionVisualicacionColumnas", "WEB-Utilidades", "Sistema");

                return false;
            }
        }

        public static bool EliminarConfiguracionVisualicacionColumnas(int id)
        {
            try
            {
                using (MESEntities context = new MESEntities())
                {
                    var elemento = context.ConfiguracionVisualizacionColumnas
                        .Where(e => e.IdConfiguracionVisualizacionColumnas == id)
                        .FirstOrDefault();

                    if (elemento != null)
                    {
                        context.ConfiguracionVisualizacionColumnas.Remove(elemento);
                        context.SaveChanges();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_ELIMINAR_CONFIGURACION_VISUALIZACION_COLUMNAS") + ": " + ex.Message, "DAO_Utils.EliminarConfiguracionVisualicacionColumnas", "WEB-Utilidades", "Sistema");

                return false;
            }
        }

        public static void MalaGestionWO_SendMail(DTO_MailMalaGestionWO mailMalaGestionWO, string pathHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                {
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(_mailConfiguration.MailAddress);

                    string[] addressConcat = mailMalaGestionWO.Direccion.Split(';');
                    foreach (var item in addressConcat)
                    {
                        if (!string.IsNullOrEmpty(item))
                            mail.To.Add(item);
                    }

                    mail.Subject = mailMalaGestionWO.Asunto;
                    mail.Body = MalaGestionWO_CreateEmailBody(mailMalaGestionWO, pathHTML);
                    mail.IsBodyHtml = true;
                    SmtpServer.Port = _mailConfiguration.Port;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = _mailConfiguration.SSL;

                    if (_mailConfiguration.AuthenticationSMTP == "Basica")
                    {
                        SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                    }

                    try
                    {
                        SmtpServer.Send(mail);
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.MalaGestionWO_SendMail", "Envío de email", HttpContext.Current.User.Identity.Name);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_Utils.MalaGestionWO_SendMail", "I-MES-REALTIME", "Sistema");
                        throw ex;
                    }
                }
            }
        }

        private static string MalaGestionWO_CreateEmailBody(DTO_MailMalaGestionWO mailMalaGestionWO, string pathHTML)
        {
            string body = string.Empty;
            try
            {
                using (StreamReader reader = new StreamReader(pathHTML))
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{automaticMessage}", IdiomaController.GetResourceName("MAIL_AUTOMATICO_MES"));
                body = body.Replace("{subject}", mailMalaGestionWO.LineaDescripcion);
                body = body.Replace("{message}", mailMalaGestionWO.CuerpoMensaje);
                body = body.Replace("{footerMessage}", IdiomaController.GetResourceName("NO_RESPONDA_ESTE_CORREO"));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/MalaGestionWO_CreateEmailBody", "WEB-ENVASADO", "Sistema");
            }

            return body;
        }

        public static void PartesCalidadNoValidos_SendMail(DTO_MailPartesCalidadNoValidos mailPartesCalidad, string pathHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                {
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(_mailConfiguration.MailAddress);

                    string[] addressConcat = mailPartesCalidad.Direccion.Split(';');
                    foreach (var item in addressConcat)
                    {
                        if (!string.IsNullOrEmpty(item))
                            mail.To.Add(item);
                    }

                    mail.Subject = mailPartesCalidad.Asunto;
                    mail.Body = PartesCalidadNoValidos_CreateEmailBody(mailPartesCalidad, pathHTML);
                    mail.IsBodyHtml = true;
                    SmtpServer.Port = _mailConfiguration.Port;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = _mailConfiguration.SSL;

                    if (_mailConfiguration.AuthenticationSMTP == "Basica")
                    {
                        SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                    }

                    try
                    {
                        SmtpServer.Send(mail);
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.PartesCalidadNoValidos_SendMail", "Envío de email", HttpContext.Current.User.Identity.Name);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_Utils.PartesCalidadNoValidos_SendMail", "I-MES-REALTIME", "Sistema");
                        throw ex;
                    }
                }
            }
        }

        private static string PartesCalidadNoValidos_CreateEmailBody(DTO_MailPartesCalidadNoValidos mailPartesCalidad, string pathHTML)
        {
            string body = string.Empty;
            try
            {
                using (StreamReader reader = new StreamReader(pathHTML))
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{automaticMessage}", IdiomaController.GetResourceName("MAIL_AUTOMATICO_MES"));
                body = body.Replace("{subject}", mailPartesCalidad.PuntoVerificacion);
                body = body.Replace("{message}", mailPartesCalidad.CuerpoMensaje);
                body = body.Replace("{footerMessage}", IdiomaController.GetResourceName("NO_RESPONDA_ESTE_CORREO"));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/PartesCalidadNoValidos_CreateEmailBody", "WEB-ENVASADO", "Sistema");
            }

            return body;
        }

        public static void PartesCalidadPendientes_SendMail(DTO_MailPartesCalidadPendientes mailPartesCalidad, string pathHTML)
        {
            using (MESEntities context = new MESEntities())
            {
                var _mailConfiguration = context.MailConfiguration.AsNoTracking().FirstOrDefault();

                using (SmtpClient SmtpServer = new SmtpClient(_mailConfiguration.IPServer))
                {
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(_mailConfiguration.MailAddress);

                    string[] addressConcat = mailPartesCalidad.Direccion.Split(';');
                    foreach (var item in addressConcat)
                    {
                        if (!string.IsNullOrEmpty(item))
                            mail.To.Add(item);
                    }

                    mail.Subject = mailPartesCalidad.Asunto;
                    mail.Body = PartesCalidadPendientes_CreateEmailBody(mailPartesCalidad, pathHTML);
                    mail.IsBodyHtml = true;
                    SmtpServer.Port = _mailConfiguration.Port;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = _mailConfiguration.SSL;

                    if (_mailConfiguration.AuthenticationSMTP == "Basica")
                    {
                        SmtpServer.Credentials = new System.Net.NetworkCredential(_mailConfiguration.Username, DAO_Administracion.Decrypt(_mailConfiguration.Password));
                    }

                    try
                    {
                        SmtpServer.Send(mail);
                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Utils.PartesCalidadPendientes_SendMail", "Envío de email", HttpContext.Current.User.Identity.Name);
                    }
                    catch (Exception ex)
                    {
                        DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message, "DAO_Utils.PartesCalidadPendientes_SendMail", "I-MES-REALTIME", "Sistema");
                        throw ex;
                    }
                }
            }
        }

        private static string PartesCalidadPendientes_CreateEmailBody(DTO_MailPartesCalidadPendientes mailPartesCalidad, string pathHTML)
        {
            string body = string.Empty;
            try
            {
                using (StreamReader reader = new StreamReader(pathHTML))
                {
                    body = reader.ReadToEnd();
                }

                body = body.Replace("{automaticMessage}", IdiomaController.GetResourceName("MAIL_AUTOMATICO_MES"));
                body = body.Replace("{subject}", mailPartesCalidad.PuntoVerificacion);
                body = body.Replace("{message}", mailPartesCalidad.CuerpoMensaje);
                body = body.Replace("{footerMessage}", IdiomaController.GetResourceName("NO_RESPONDA_ESTE_CORREO"));
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 4, 2, ex.Message, "DAO_Utils/PartesCalidadPendientes_CreateEmailBody", "WEB-ENVASADO", "Sistema");
            }

            return body;
        }
    }
}