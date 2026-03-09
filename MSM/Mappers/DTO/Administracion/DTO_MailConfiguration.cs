using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Administracion
{
    public class DTO_MailConfiguration
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string IPServer { get; set; }
        public string MailAddress { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool SSL { get; set; }
        public string AuthenticationSMTP { get; set; }

        public bool IsAnonymousAuth { get; set; }
        public bool IsBasicAuth { get; set; }
    }
}