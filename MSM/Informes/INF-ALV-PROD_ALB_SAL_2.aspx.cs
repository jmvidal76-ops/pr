using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.Reporting.WebForms;
using System.Configuration;
using System.IO;

namespace MSM.Informes
{
    public partial class INF_TRA_PROD_ALB_SAL_2 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {

                ReportViewer1.ServerReport.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["servidorReportingMES"].ToString());

                List<ReportParameter> listaParametros = new List<ReportParameter>();

                listaParametros.Add(new ReportParameter("IdAlbaran", Request["IdAlbaran"], false));
                listaParametros.Add(new ReportParameter("Idioma", Request["Idioma"], false));
                string fabrica = ConfigurationManager.AppSettings["PlantaNombre"].ToString();
                listaParametros.Add(new ReportParameter("Fabrica", fabrica, false));

                ReportViewer1.ServerReport.SetParameters(listaParametros);

                ReportViewer1.SizeToReportContent = true;

                ReportViewer1.ServerReport.Refresh();
                printBTN_Click(sender, e);
            }
        }

        protected void printBTN_Click(object sender, EventArgs e)
        {


            try
            {
                Warning[] warnings = null;
                string[] streamIds = null;
                string mimeType = string.Empty;
                string encoding = string.Empty;
                string extension = string.Empty;
                string filetype = string.Empty;
                // just gets the Report title... make your own method
                //ReportViewer needs a specific type (not always the same as the extension)

                filetype = "PDF";
                byte[] bytes = ReportViewer1.ServerReport.Render(filetype, null, // deviceinfo not needed for csv
                out mimeType, out encoding, out extension, out streamIds, out warnings);

                FileStream fs = new FileStream(Server.MapPath("ReportAlbaran.PDF"), FileMode.OpenOrCreate);

                fs.Write(bytes, 0, bytes.Length);
                fs.Close();

                Response.ContentType = "Application/pdf";
                Response.TransmitFile(Server.MapPath("ReportAlbaran.PDF"));
            }
            catch (Exception ex)
            {
            }

        }
    }
}