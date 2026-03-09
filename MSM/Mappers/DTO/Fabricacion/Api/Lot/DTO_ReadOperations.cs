using Siemens.SimaticIT.MM.Breads.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api
{
    public class DTO_ReadOperations
    {
        public LotOperation LotOperation { get; set; }
        public string[] Associated { get; set; }
        public string[] Comment { get; set; }
    }
}