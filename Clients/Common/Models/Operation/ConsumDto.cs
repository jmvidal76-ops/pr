using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
    public class ConsumDto
    {
        public string RefMaterialID { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public int LocaltionId { get; set; }
        public string PartitionID { get; set; }
        public decimal Quantity { get; set; }
        public string LotID { get; set; }

        public long OperationId { get; set; }
    }
}
