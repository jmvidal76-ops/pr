namespace UtilidadesDesarrollo
{
    partial class CargaCOB
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button1 = new System.Windows.Forms.Button();
            this.openFileDialog1 = new System.Windows.Forms.OpenFileDialog();
            this.chkBENG = new System.Windows.Forms.CheckBox();
            this.chkBRT = new System.Windows.Forms.CheckBox();
            this.chkENV = new System.Windows.Forms.CheckBox();
            this.chkFAB = new System.Windows.Forms.CheckBox();
            this.lblResult = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(16, 75);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(256, 37);
            this.button1.TabIndex = 2;
            this.button1.Text = "Cargar Fichero Excel";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.cargarExcel);
            // 
            // openFileDialog1
            // 
            this.openFileDialog1.FileName = "openFileDialog1";
            // 
            // chkBENG
            // 
            this.chkBENG.AutoSize = true;
            this.chkBENG.Location = new System.Drawing.Point(16, 12);
            this.chkBENG.Name = "chkBENG";
            this.chkBENG.Size = new System.Drawing.Size(74, 17);
            this.chkBENG.TabIndex = 3;
            this.chkBENG.Text = "ENG COB";
            this.chkBENG.UseVisualStyleBackColor = true;
            this.chkBENG.CheckedChanged += new System.EventHandler(this.chkBENG_CheckedChanged);
            // 
            // chkBRT
            // 
            this.chkBRT.AutoSize = true;
            this.chkBRT.Location = new System.Drawing.Point(16, 35);
            this.chkBRT.Name = "chkBRT";
            this.chkBRT.Size = new System.Drawing.Size(66, 17);
            this.chkBRT.TabIndex = 5;
            this.chkBRT.Text = "RT COB";
            this.chkBRT.UseVisualStyleBackColor = true;
            this.chkBRT.CheckedChanged += new System.EventHandler(this.chkBRT_CheckedChanged);
            // 
            // chkENV
            // 
            this.chkENV.AutoSize = true;
            this.chkENV.Location = new System.Drawing.Point(153, 12);
            this.chkENV.Name = "chkENV";
            this.chkENV.Size = new System.Drawing.Size(85, 17);
            this.chkENV.TabIndex = 6;
            this.chkENV.Text = "ENVASADO";
            this.chkENV.UseVisualStyleBackColor = true;
            this.chkENV.CheckedChanged += new System.EventHandler(this.chkENV_CheckedChanged);
            // 
            // chkFAB
            // 
            this.chkFAB.AutoSize = true;
            this.chkFAB.Location = new System.Drawing.Point(153, 35);
            this.chkFAB.Name = "chkFAB";
            this.chkFAB.Size = new System.Drawing.Size(97, 17);
            this.chkFAB.TabIndex = 7;
            this.chkFAB.Text = "FABRICACION";
            this.chkFAB.UseVisualStyleBackColor = true;
            this.chkFAB.CheckedChanged += new System.EventHandler(this.chkFAB_CheckedChanged);
            // 
            // lblResult
            // 
            this.lblResult.AutoSize = true;
            this.lblResult.Location = new System.Drawing.Point(13, 59);
            this.lblResult.Name = "lblResult";
            this.lblResult.Size = new System.Drawing.Size(35, 13);
            this.lblResult.TabIndex = 8;
            this.lblResult.Text = "label1";
            this.lblResult.Visible = false;
            // 
            // CargaCOB
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(284, 124);
            this.Controls.Add(this.lblResult);
            this.Controls.Add(this.chkFAB);
            this.Controls.Add(this.chkENV);
            this.Controls.Add(this.chkBRT);
            this.Controls.Add(this.chkBENG);
            this.Controls.Add(this.button1);
            this.Name = "CargaCOB";
            this.Text = "CargaCOB";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.OpenFileDialog openFileDialog1;
        private System.Windows.Forms.CheckBox chkBENG;
        private System.Windows.Forms.CheckBox chkBRT;
        private System.Windows.Forms.CheckBox chkENV;
        private System.Windows.Forms.CheckBox chkFAB;
        private System.Windows.Forms.Label lblResult;
    }
}