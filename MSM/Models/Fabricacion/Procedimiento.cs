using MSM.BBDD.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Procedimiento
    {
        public int Cod_Procedimiento { get; set; }
        public string ID_Procedimiento { get; set; }
        public string Des_Procedimiento { get; set; }
        public int Cod_Orden { get; set; }
        public string ID_Orden { get; set; }
        public string ID_Material { get; set; }
        public Nullable<double> Cantidad_Material { get; set; }
        public string ID_Uom { get; set; }
        public EstadoProcedimientos Estado_Procedimiento { get; set; }
        public Nullable<int> Orden_Procedimiento { get; set; }
        public string ID_Equipo { get; set; }
        public string Des_Equipo { get; set; }
        public Nullable<System.DateTime> Tiempo_Inicio { get; set; }
        public Nullable<System.DateTime> Tiempo_Fin { get; set; }
        public string totalHoras
        {
            get
            {
                try
                {
                    decimal result = Convert.ToDecimal(((this.Tiempo_Fin.Value.ToLocalTime() - new DateTime(1970, 1, 1)).TotalSeconds - (Tiempo_Inicio.Value.ToLocalTime() - new DateTime(1970, 1, 1)).TotalSeconds) / 3600);
                    if (result >= 1)
                    {
                        return result.ToString("#.##");
                    }
                    else
                    {
                        return result.ToString("0.##");
                    }
                }
                catch(Exception ex)
                {
                    return "---";
                }
            }
        }
        public Procedimiento(Procedimiento_FAB procEntity)
        {
            this.Cod_Procedimiento = procEntity.Cod_Procedimiento;
            this.ID_Procedimiento = procEntity.ID_Procedimiento;
            this.Des_Procedimiento = procEntity.Des_Procedimiento;
            this.Cod_Orden = procEntity.Cod_Orden;
            this.ID_Orden = procEntity.ID_Orden;
            this.ID_Material = procEntity.ID_Material;
            this.Cantidad_Material = procEntity.Cantidad_Material;
            this.ID_Uom = procEntity.ID_Uom;
            EstadoProcedimientos ep = new EstadoProcedimientos(procEntity.IDEstado_Procedimiento);
            this.Estado_Procedimiento = ep;
            this.Orden_Procedimiento = procEntity.Orden_Procedimiento;
            this.ID_Equipo = procEntity.ID_Equipo;
            this.Des_Equipo = procEntity.Des_Equipo;
            this.Tiempo_Inicio = procEntity.Tiempo_Inicio;
            this.Tiempo_Fin = procEntity.Tiempo_Fin;


        }

        public Procedimiento (int cod, string id)
        {
            this.Cod_Procedimiento = cod;
            this.ID_Procedimiento = id;
        }

        public Procedimiento()
        {
            // TODO: Complete member initialization
        }
    }
}