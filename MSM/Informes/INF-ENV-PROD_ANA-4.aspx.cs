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
    public partial class INF_ENV_PROD_ANA_4 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {

                ReportViewer1.ServerReport.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["servidorReportingMES"].ToString());

                List<ReportParameter> listaParametros = new List<ReportParameter>();
               
                listaParametros.Add(new ReportParameter("desde", Request["FechaInicio"], false));
                listaParametros.Add(new ReportParameter("hasta", Request["FechaFin"], false));
                listaParametros.Add(new ReportParameter("Linea", Request["Linea"], false));
                listaParametros.Add(new ReportParameter("Idioma", Request["Idioma"], false));
                listaParametros.Add(new ReportParameter("turnoInicio", Request["turnoInicio"], false));
                string fabrica = ConfigurationManager.AppSettings["PlantaNombre"].ToString();
                listaParametros.Add(new ReportParameter("Fabrica", fabrica, false));

                ReportViewer1.ServerReport.SetParameters(listaParametros);

                ReportViewer1.ServerReport.Timeout = 600000;

                ReportViewer1.SizeToReportContent = true;

                ReportViewer1.ServerReport.Refresh();
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

                FileStream fs = new FileStream(Server.MapPath("Report4.PDF"), FileMode.OpenOrCreate);

                fs.Write(bytes, 0, bytes.Length);
                fs.Close();

                Response.ContentType = "Application/pdf";
                Response.TransmitFile(Server.MapPath("Report4.PDF"));
            }
            catch (Exception ex)
            {
            }

        }
    }
}