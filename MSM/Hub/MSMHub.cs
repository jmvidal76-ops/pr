using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System.Threading.Tasks;
using MSM.Models;
using System.Collections;
using MSM.RealTime;
using System.Web.Security;
using System.Configuration;
using MSM.Utilidades;
using MSM.Models.Envasado;
using MSM.BBDD.Envasado;
using MSM.Models.Planta;

namespace MSM
{
    public class MSMHub : Hub
    {

        private static List<Message> buffer = new List<Message>();

        [HubMethodName("enviarMsg")]
        public void enviarMsg(string txtMsg, string usuario, List<string> usuarioDest, Guid guidtab)
        {
            Message sms = new Message() { Id = Guid.NewGuid(), UserOrig = usuario, UserDest = usuario, Content = txtMsg, GuidCodeTab = guidtab };
            buffer.Add(sms);
            Clients.Caller.recibirMsg(txtMsg, usuario, guidtab, sms.Id);
            foreach (string user in usuarioDest)
            {
                sms = sms.Clone();
                sms.UserDest = user;
                buffer.Add(sms);
                Clients.User(user).recibirMsg(txtMsg, usuario, guidtab, sms.Id);
            }
        }

        [HubMethodName("confirmarRecepccion")]
        public void confirmarRecepccion(string usuario, Guid guid)
        {
            Message sms = buffer.Where(p => p.UserDest == usuario && p.Id == guid).FirstOrDefault();
            if (sms != null && buffer.Contains(sms))
            {
                buffer.Remove(sms);
            }
        }

        [HubMethodName("desconectar")]
        public void desconectar()
        {
            if (ConfigurationManager.AppSettings["AVISO_CIERRE"] == "true")
            {
                string usuario = Context.User.Identity.Name;
                if (!string.IsNullOrEmpty(usuario))
                {
                    Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[usuario];
                    //Si la ip de la sesion del usuario es la misma que la de la solicitud quitamos al usuario de la lista de usuarios en planta,
                    // en caso contrario se tratará de una actualizacion de sesión (usuario conectandose desde otro equipo)
                    if (Utils.checkIpUserSesion(sesionUsuario))
                    {
                        PlantaRT.usuarios.Remove(usuario);
                        Clients.All.actualizarUsuariosChat();
                    }
                    FormsAuthentication.SignOut();


                    /* if((Sesion)PlantaRT.usuarios[usuario]!=null) // agomezn 030816: 2.2 de PowerPoint de Incidencias
                    {
                       Sesion sesionUsuario = (Sesion)PlantaRT.usuarios[usuario];
                       sesionUsuario.usuario = string.Empty;
                    } */
                    FormsAuthentication.RedirectToLoginPage();
                }
            }
        }

        [HubMethodName("actualizarMensajeAdministracion")]
        public void actualizarMensajeAdministracion()
        {
            Clients.All.actualizarMensajeAdministracion();
        }

        [HubMethodName("actualizarPlanificacionOrden")]
        public void actualizarPlanificacionOrden(int numLinea, string ordenId)
        {
            Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
            Orden orden = linea.obtenerOrdenes().Find(o => o.id == ordenId);

            if (orden != null)
            {
                orden.duracion = DAO_Orden.ObtenerDuracion(orden.idLinea, orden.dFecInicioEstimado, orden.dFecFinEstimado);
            }

        }

        [HubMethodName("actualizarAvisoLlenadora")]
        public void actualizarAvisoLlenadora(int numLinea, string ordenId)
        {
            Linea linea = PlantaRT.planta.lineas.Find(l => l.numLinea == numLinea);
            Orden orden = linea.obtenerOrdenes().Find(o => o.id == ordenId);

            if (orden != null)
            {
                orden.avisoLlenadora = true;
            }

        }

        [HubMethodName("actualizarEstadoUsuariosChat")]
        public void actualizarEstadoUsuariosChat()
        {
            Clients.All.actualizarUsuariosChat();
        }

        public override Task OnConnected()
        {
            string user = Context.User.Identity.Name;
            checkBuffer(user);
            return base.OnConnected();
        }

        public override Task OnReconnected()
        {
            string user = Context.User.Identity.Name;
            checkBuffer(user);
            return base.OnReconnected();
        }

        public override Task OnDisconnected(bool p)
        {

            //if (ConfigurationManager.AppSettings["AVISO_CIERRE"] == "true")
            //{
            //    string usuario = Context.User.Identity.Name;
            //    PlantaRT.usuarios.Remove(usuario);

            //}

            return base.OnDisconnected(p);
        }

        private void checkBuffer(string user)
        {
            List<Message> listMessageNotSend = buffer.Where(p => p.UserDest == user).ToList();

            foreach (Message sms in listMessageNotSend)
            {
                Clients.User(sms.UserDest).recibirMsg(sms.Content, sms.UserOrig, sms.GuidCodeTab, sms.Id);
            }
        }
    }

}
