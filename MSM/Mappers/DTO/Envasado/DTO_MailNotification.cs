using MSM.BBDD.Model;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.DTO.Envasado
{
    public class DTO_MailNotification
    {
        public int Id { set; get; }
        public string UserAddress { set; get; }
        public int StoppageTime { set; get; }
        public DateTime? SendedOn { set; get; }
        public string Subject { set; get; }
        public string BodyMessage { set; get; }
        public virtual ICollection<MailGroup> MailGroup { get; set; }
        public virtual ICollection<Maquina> MailEquipments { get; set; }
        public string MachinesConcat { get; set; }
        public string IdEquipment { get; set; }
        public string DescriptionEquipment { get; set; }
        public bool Active { get; set; }
    }
}