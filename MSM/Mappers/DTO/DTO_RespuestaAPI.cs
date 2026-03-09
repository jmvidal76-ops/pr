using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO
{
    public class DTO_RespuestaAPI<T>
    {
        public T Data { get; set; }
        public string Message { get; set; }
        public Exception Exception { get; set; }
    }
}