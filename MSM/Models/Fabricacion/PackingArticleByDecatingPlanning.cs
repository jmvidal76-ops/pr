using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class PackingArticleByDecatingPlanning
    {
        private String _code;
        private String _article;
        private double _quantity;
        private double _stockInTCP;
        private double _totalNecessity;
        private double _totalBeerToFilter;
        private double _totalHDBeerToSendToFiltration;
        private String _HDBeer;

        public String HDBeer {
            get { return _HDBeer; }
            set { _HDBeer = value; }
        }

        public String Code{
            get{ return _code;}
            set { _code = value; }
        }

        public String Article{
            get { return _article; }
            set { _article = value; } 
        }
        public double Quantity
        {
            get { return _quantity; }
            set { _quantity = value; }
        }
        public double StockInTCP
        {
            get { return _stockInTCP; }
            set { _stockInTCP = value; }
        }
        public double TotalNecessity
        {
            get { return _totalNecessity; }
            set { _totalNecessity = value; }
        }
        public double TotalBeerToFilter
        {
            get { return _totalBeerToFilter; }
            set { _totalBeerToFilter = value; }
        }
        public double TotalHDBeerToSendToFiltration
        {
            get { return _totalHDBeerToSendToFiltration; }
            set { _totalHDBeerToSendToFiltration = value; }
        }
    }
}