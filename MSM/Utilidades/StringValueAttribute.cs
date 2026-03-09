using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public class StringValueAttribute : Attribute
    {
        public string StringValue { get; set; }

        public StringValueAttribute(string value){
            this.StringValue = value;
        }
    }
}