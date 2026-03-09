using Autofac;
using Microsoft.Reporting.WebForms;
using MSM.BBDD.Planta;
using MSM.BBDD.General;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime;
using System.Security.Principal;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace MSM.Informes
{
    public partial class InformeSeguimientoWOFermentacion : System.Web.UI.Page
    {
        protected async void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                try
                {
                    IDAO_General _iDAO_General = AutofacContainerConfig.Container.Resolve<IDAO_General>();

                    //Obtenemos el IPServidor y el path de la tabla de ParametrosGenerales
                    string url = await _iDAO_General.ObtenerValorParametroGeneral("MES_MSM_Fabricacion", "RUTA_SERVIDOR_INFORMES_MES");
                    string path = await _iDAO_General.ObtenerValorParametroGeneral("MES_MSM_Fabricacion", "RUTA_INFORME_SEGUIMIENTO_WO_FERMENTACION");

                    ReportViewer1.ServerReport.ReportServerUrl = new Uri(url);
                    ReportViewer1.ServerReport.ReportPath = path;

                    List<ReportParameter> listaParametros = new List<ReportParameter>();
                    listaParametros.Add(new ReportParameter("CodWO", Request["paramCodWO"], false));

                    ReportViewer1.ServerReport.SetParameters(listaParametros);
                    ReportViewer1.SizeToReportContent = true;

                    ReportViewer1.ServerReport.Refresh();
                    printBTN_Click(sender, e);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
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


                Response.ContentType = "Application/pdf";
                Response.AddHeader("content-length", bytes.Length.ToString());
                Response.BinaryWrite(bytes);

                // Para liberar la memoria del pdf
                bytes = null;
                GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
                GC.Collect();

                //Response.TransmitFile(Server.MapPath("ReportAlbaran.PDF"));
            }
            catch (Exception ex)
            {
            }

        }
    }
}