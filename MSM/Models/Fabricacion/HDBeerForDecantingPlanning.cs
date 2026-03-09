using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class HDBeerForDecantingPlanning
    {
        private String _HDBeer;
        private double _totalHDBeerInPeriod;
        private double _HDBeerInCellar;
        private double _realTanqsNumberToEmpty;
        private double _necesaryTotalHDBeer;
        private double _estimatedTanqsNumberToEmpty;
        private double _totalBeerInPlanning;
        private double _estimatedTanqsNumberToFill;
        private double _tanqsDifference;


        public String HDBeer { 
            get {return _HDBeer;}
            set { _HDBeer = value; }
        }

        public double TotalHDBeerInPeriod
        {
            get { return _totalHDBeerInPeriod; }
            set { _totalHDBeerInPeriod = value; }
        }

        public double HDBeerInCellar
        {
            get { return _HDBeerInCellar; }
            set { _HDBeerInCellar = value; }
        }

        public double RealTanqsNumberToEmpty
        {
            get { return _realTanqsNumberToEmpty; }
            set { _realTanqsNumberToEmpty = value; }
        }

        public double NecesaryTotalHDBeer
        {
            get { return _necesaryTotalHDBeer; }
            set { _necesaryTotalHDBeer = value; }
        }

        public double EstimatedTanqsNumberToEmpty
        {
            get { return _estimatedTanqsNumberToEmpty; }
            set { _estimatedTanqsNumberToEmpty = value; }
        }

        public double TotalBeerInPlanning
        {
            get { return _totalBeerInPlanning; }
            set { _totalBeerInPlanning = value; }
        }

        public double EstimatedTanqsNumberToFill
        {
            get { return _estimatedTanqsNumberToFill; }
            set { _estimatedTanqsNumberToFill = value; }
        }

        public double TanqsDifference
        {
            get { return _tanqsDifference; }
            set { _tanqsDifference = value; }
        }
    }
}