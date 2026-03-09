using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class QueryResult
    {
        public List<string> Fields { get; set; }
        public List<string> Types { get; set; }
        public List<Hashtable> Records { get; set; }

    }
}