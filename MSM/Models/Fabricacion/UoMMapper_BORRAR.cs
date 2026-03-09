using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Xml;

namespace MSM.Models.Fabricacion
{
    public class UoMMapper_BORRAR
    {
        private static XmlDocument _xmlDoc;
        private static XmlDocument xmlDoc
        {
            get
            {
                if (_xmlDoc == null)
                    _xmlDoc = LoadXml();

                return _xmlDoc;
            }

        }

        private static XmlDocument LoadXml()
        {
            XmlDocument doc = new XmlDocument();
            //Utility.GetResourceTextFile(Assembly.GetExecutingAssembly(), "Resources", "UoMMapping.xml");
            using (Stream stream = Assembly.GetExecutingAssembly().
                       GetManifestResourceStream("Siemens.Brewing.DIS.ReceiveEBRMessage.Resources.UoMMapping.xml"))
            {

                doc.Load(stream);

            }



            return doc;
        }


        public static bool IsSpecialCase(string winCC_UoM, string mes_UoM)
        {
            bool res = false;

            winCC_UoM = winCC_UoM.ToLower();
            mes_UoM = mes_UoM.ToLower();
            //  <uom wincc="timestamp" mes="n/a" toMes="TS"/>
            string xPath = "//uom[@wincc='" + winCC_UoM + "' and @mes='" + mes_UoM + "']";
            XmlNode node = xmlDoc.SelectSingleNode(xPath);
            if (node != null)
            {
                res = true;

            }


            return res;
        }
    }
}