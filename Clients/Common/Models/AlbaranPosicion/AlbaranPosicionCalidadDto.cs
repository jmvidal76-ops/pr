using Common.Models.Material;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.AlbaranPosicion
{
   public class AlbaranPosicionCalidadDto
    {
    
      
        public Nullable<int> ID { get; set; }
        public string FormTemplate { get; set; }
        public string FormTemplateXml { get; set; }
        public Nullable<int> IdFormTemplate { get; set; }
        public string orderId { get; set; }
        public string orderTypeId { get; set; }
        public string turnoId { get; set; }
        public string shcId { get; set; }
        public string lotId { get; set; }
        public string materialId { get; set; }
        public string location { get; set; }
        public Nullable<System.DateTime> createdOn { get; set; }
        public Nullable<System.DateTime> lastModify { get; set; }
        public string triggerName { get; set; }
        public string errors { get; set; }
        public string Name { get; set; }
        public string descript { get; set; }
        public string statusID { get; set; }
        public string semaforoStatus { get; set; }
        public string isValid { get; set; }
        public string FormValues { get; set; }
        public string semaforoVal { get; set; }
        public int IdAlbaranPosicionCalidad { get; set; }
        public int IdAlbaranPosicion { get; set; }

       
    }
}
