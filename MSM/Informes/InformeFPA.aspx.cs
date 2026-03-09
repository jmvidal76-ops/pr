using Microsoft.Reporting.WebForms;
using MSM.BBDD.Planta;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace MSM.Informes
{
    public partial class InformeFPA : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                try
                {
                    ReportViewer1.ServerReport.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["servidorReportingInterspec"].ToString());
                    ReportViewer1.ServerReport.ReportServerCredentials = new CustomReportCredentials();

                    List<ReportParameter> listaParametros = new List<ReportParameter>();
                    listaParametros.Add(new ReportParameter("SeleccionarFPA", Request["prod"], false));
                    ReportViewer1.ServerReport.SetParameters(listaParametros);
                    ReportViewer1.SizeToReportContent = true;

                    ReportViewer1.ServerReport.Refresh();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }
    }

    class CustomReportCredentials : Microsoft.Reporting.WebForms.IReportServerCredentials
    {
        // local variable for network credential.
        private string _UserName;
        private string _PassWord;
        private string _DomainName;

        public CustomReportCredentials()
        {
            _UserName = ConfigurationManager.AppSettings["userReportingInterspec"].ToString();
            _PassWord = ConfigurationManager.AppSettings["userPwdReportingInterspec"].ToString();
            _DomainName = ConfigurationManager.AppSettings["userDomainReportingInterspec"].ToString();
        }

        public void ChangeCredentials(string username, string password, string domain)
        {
            _UserName = username;
            _PassWord = password;
            _DomainName = domain;
        }

        public WindowsIdentity ImpersonationUser
        {
            get
            {
                return null; // not use ImpersonationUser
            }
        }

        public ICredentials NetworkCredentials
        {
            get
            {
                // use NetworkCredentials
                return new NetworkCredential(_UserName, _PassWord, _DomainName);
            }
        }

        public bool GetFormsCredentials(out Cookie authCookie, out string user, out string password, out string authority)
        {
            // not use FormsCredentials unless you have implements a custom autentication.

            authCookie = null;

            user = password = authority = null;

            return false;

        }

    }
}