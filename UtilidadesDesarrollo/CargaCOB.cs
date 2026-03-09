using BreadMES.Envasado.Envasado;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.OleDb;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace UtilidadesDesarrollo
{
    public partial class CargaCOB : Form
    {
        public CargaCOB()
        {
            InitializeComponent();
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void cargarExcel(object sender, EventArgs e)
        {
            lblResult.Visible = true;
            
            if (openFileDialog1.ShowDialog() == DialogResult.OK)
            {
                if ((chkBENG.Checked || chkBRT.Checked) && (chkFAB.Checked || chkENV.Checked))
                {
                    bool ENGCOB = chkBENG.Checked;
                    bool ENVASADO = chkENV.Checked;
                    lblResult.Text = "Realizando operaciones..";
                    LeerExcel(openFileDialog1.FileName, ENGCOB, ENVASADO);
                }
            }
            else
            {
                lblResult.Text = "Debe seleccionar alguna opción..";
            }
        }

        private void LeerExcel(string filename, bool ENGCOB, bool ENVASADO)
        {
            try
            {
                DataSet ds = new DataSet();
                var excelConnectionString = string.Format("Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=\"Excel 12.0;HDR=YES;\"", filename);
                OleDbConnection connection = new OleDbConnection();
                connection.ConnectionString = excelConnectionString;

                DataTable sheets = GetSchemaTable(excelConnectionString);
                bool result = true;
                foreach (DataRow r in sheets.Rows)
                {
                    string query = "SELECT * FROM [" + r.ItemArray[2] + "]";
                    ds.Clear();
                    OleDbDataAdapter data = new OleDbDataAdapter(query, connection);

                    string cobName = r.ItemArray[2].ToString().Split('$')[0];

                    if (BreadFactory.checkCOBExist(cobName, ENGCOB, ENVASADO))
                    {
                        data.Fill(ds);

                        List<string> lstColumns = ds.Tables[0].Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();

                        foreach (DataRow row in ds.Tables[0].Rows)
                        {
                            result = BreadFactory.CreateCOB(cobName, lstColumns, row, ENGCOB, ENVASADO);
                            if (!result)
                            {
                                lblResult.Visible = true;
                                lblResult.Text = "Se ha producido un error";
                                break;
                            }
                        }
                    }
                    if (!result)
                    {
                        lblResult.Visible = true;
                        lblResult.Text = "Se ha producido un error";
                        break;
                    }
                }
                if (result)
                {
                    lblResult.Visible = true;
                    lblResult.Text = "Cargado correctamente"; 
                }                
            }
            catch (Exception)
            {
                lblResult.Visible = true;
                lblResult.Text = "Se ha producido un error";
            }            
        }

        static DataTable GetSchemaTable(string connectionString)
        {
            using (OleDbConnection connection = new
                       OleDbConnection(connectionString))
            {
                connection.Open();
                DataTable schemaTable = connection.GetOleDbSchemaTable(
                    OleDbSchemaGuid.Tables,
                    new object[] { null, null, null, "TABLE" });
                return schemaTable;
            }
        }

        private void chkBENG_CheckedChanged(object sender, EventArgs e)
        {
            chkBRT.Checked = false;
        }

        private void chkBRT_CheckedChanged(object sender, EventArgs e)
        {
            chkBENG.Checked = false;
        }

        private void chkENV_CheckedChanged(object sender, EventArgs e)
        {
            chkFAB.Checked = false;
        }

        private void chkFAB_CheckedChanged(object sender, EventArgs e)
        {            
            chkENV.Checked = false;
        }
    }
}
