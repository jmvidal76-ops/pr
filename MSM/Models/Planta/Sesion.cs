using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MSM.Models.Envasado;

namespace MSM.Models.Planta
{
    public class Sesion
    {
        public bool validada { get; set; }
        public string usuarioId { get; set; }
        public string usuario { get; set; }
        public string password { get; set; }
        public bool bloqueado { get; set; }
        public Linea linea { get; set; }
        public Zona zona { get; set; }
        public int? pdv { get; set; }
        public string userRol { get; set; }
        public string ip { get; set; }
        public bool portal { get; set; }

        private List<Funcion> _funciones;
        public List<Funcion> funciones { get {
            if (_funciones == null) { 
                DAO_Permisos daoPermisos = new DAO_Permisos();
                _funciones = daoPermisos.FuncionesUsuario(this.usuario);                
            }
            return _funciones;
        } }

        public string fechaSesion { get; set; }

        public Sesion()
        {
           fechaSesion = DateTime.Now.ToString();
        }

        public Sesion(bool pValidada,string pUsuario,string pPassword,Linea pLinea,Zona pZona, string pFechaSesion)
        {
            validada = pValidada;
            usuario = pUsuario;
            fechaSesion = pFechaSesion;
            password = pPassword;
            linea = pLinea;
            zona = pZona;            
        } 
    }
}