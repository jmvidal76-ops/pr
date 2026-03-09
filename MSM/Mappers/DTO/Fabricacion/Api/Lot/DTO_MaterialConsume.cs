using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_MaterialConsume
    {
        public string Batch { get; set; }
        public string Origen { get; set; }
        public string Destino { get; set; }
        public string Cantidad { get; set; }
        public string Fecha { get; set; }
        public String OriginBatch { get; set; }
        public String MessageId { get; set; }
    }
}