using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace UtilidadesDesarrollo
{
    public partial class Menu : Form
    {
        public Menu()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            BorrarParametrosPPR_Repetidos form = new BorrarParametrosPPR_Repetidos();
            form.ShowDialog();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            CargaParametrosLineaProducto form = new CargaParametrosLineaProducto();
            form.ShowDialog();
        }

        private void Menu_Load(object sender, EventArgs e)
        {

        }

        private void btnCurva_Click(object sender, EventArgs e)
        {
            bool vale = BreadMES.Fabricacion.KOPBread.borrarCurvas();
            if (vale)
                btnCurva.BackColor = Color.Green;
            else
                btnCurva.BackColor = Color.Red;

        }

        private void CargarCOB_Click(object sender, EventArgs e)
        {
            CargaCOB form = new CargaCOB();
            form.ShowDialog();
        }

    }
}
