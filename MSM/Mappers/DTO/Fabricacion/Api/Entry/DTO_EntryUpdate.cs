using Siemens.Brewing.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO.Fabricacion.Api.Entry
{
    public class DTO_EntryUpdate
    {
        public string IdEntry { get; set; }
        public SitDateTime Time { get; set; }
        public DateTime Start { get; set; }

        public DateTime End { get; set; }

        public string CodProcess { get; set; }

        public string Order { get; set; }
    }
}