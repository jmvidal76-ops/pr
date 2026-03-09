using System;

namespace Common.Models.Transportes
{
    public class FiltersOADto
    {
        /// <summary>
        /// PDKCOO In JDE
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        ///  PDDOCO JDE
        /// </summary>
        public string Order { get; set; }

        /// <summary>
        /// PDDCTO In JDE
        /// </summary>
        public string OrderType { get; set; }

        /// <summary>
        /// PDLNID  In JDE
        /// </summary>
        public string DocumentLine { get; set; }

        /// <summary>
        /// PDMCU In JDE
        /// </summary>
        public string Plant { get; set; }

        /// <summary>
        /// PDAN8 In JDE
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// PDTRDJ In JDE
        /// </summary>
        public DateTime? DateOrder { get; set; }

        /// <summary>
        /// PDLITM In JDE
        /// </summary>
        public string RefMaterial { get; set; }

        /// <summary>
        /// PDNXTR In JDE
        /// </summary>
        public string NextState { get; set; }

        /// <summary>
        /// PDLTTR In JDE
        /// </summary>
        public string LastState { get; set; }

        /// <summary>
        /// PDPDP1 In JDE
        /// </summary>
        public string PurchaseFamily { get; set; }

        /// <summary>
        /// PDPDP2 In JDE
        /// </summary>
        public string MaterialClass { get; set; }

        /// <summary>
        /// PDUOM In JDE
        /// </summary>
        public string UnitOfMeasure { get; set; }

        /// <summary>
        /// PDUORG In JDE
        /// </summary>
        public string TotalQuantityOrder { get; set; }

        /// <summary>
        /// PDUOPN In JDE
        /// </summary>
        public string QuantityReceived { get; set; }

        /// <summary>
        /// PDUREC In JDE
        /// </summary>
        public string RemainingQuantity { get; set; }

        /// <summary>
        /// Descripcion OA-POSITION-LAST QUANTITY
        /// </summary>
        public string Descripcion { get; set; }

    }
}
