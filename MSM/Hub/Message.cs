using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM
{
    public class Message
    {
        public Guid Id { get; set; }
        public string UserOrig { get; set; }
        public string UserDest { get; set; }
        public string Content { get; set; }
        public Guid GuidCodeTab { get; set; }

        public Message Clone() 
        {
            return (Message)this.MemberwiseClone();
        }

        
    }
}