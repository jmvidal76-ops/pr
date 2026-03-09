using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Ubicaciones
{
    public class BarcodeDto
    {
        public string Title { get; set; }

        public byte[] ImageFile { get; set; }

        public string ImageFileString { get; set; }
    }
}
