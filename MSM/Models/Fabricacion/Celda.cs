using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MSM.Utilidades;
using MSM.Models.Fabricacion.Tipos;
using BreadMES.Fabricacion;
using MSM.BBDD.Fabricacion;
using System.Threading.Tasks;

namespace MSM.Models.Fabricacion
{
    public class Celda : Equipo
    {
        private SitEquipment eq { get; set; }
        private List<SitEquipment> lstChildrenEquipment = null;
        private string[] paramsForQuery = { "L0" };
     

        public Celda()
        {
            
        }

        private async Task<Celda> InitializeAsync(SitEquipment eq)
        {
            this.eq = eq;
            await GetPropiedadesCelda();
            return this;
        }

        public static Task<Celda> CreateAsync(SitEquipment eq)
        {
            var ret = new Celda();
            return ret.InitializeAsync(eq);
        }
    

    public string NombreDescripcion { get; set; }

        public SitEquipment EquipoSit
        {
            get { return this.eq; }
        }


        public List<Equipo> GetEquipos()
        {
            checkIfLoadChildren();
            List<Equipo> lstEquipos = new List<Equipo>();

            foreach (TipoTanque item in GetClaseEquipos())
            {
                string tipo = item.GetStringValue();

                this.lstChildrenEquipment.Where(eq => eq.ClassID.Replace('-', '_').Contains(item.ToString())).All(eq =>
                {
                    Type type = Type.GetType(tipo);
                    lstEquipos.Add((Equipo)Activator.CreateInstance(type, eq));
                    return true;
                });
            }

            return lstEquipos;
        }

        public List<TipoTanque> GetClaseEquipos()
        {
            checkIfLoadChildren();
            List<TipoTanque> lstClases = new List<TipoTanque>();

            this.lstChildrenEquipment.Select(eq => eq.ClassID).Where(eq => !eq.Contains("UV")).Distinct().All(eq =>
            {
                string classname = eq.Split('.').Last();
                lstClases.Add(classname.Replace('-','_').ToEnum<TipoTanque>());
                //lstClases.Add(classname.ToEnum<TipoTanque>());
                return true;
            });

            return lstClases;
        }

        private async Task GetPropiedadesCelda()
        {
            DAO_Equipo _daoEquipo = new DAO_Equipo();
            Dictionary<string, string> props = await _daoEquipo.GetAtributosEquipo(this.EquipoSit, paramsForQuery); 
            
            this.NombreDescripcion = props.Count > 0 ? props[paramsForQuery[0]] : string.Empty;
        }

        private async Task checkIfLoadChildren()
        {
            string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];

            if (this.lstChildrenEquipment == null)
            {
                 DAO_Equipo _daoEquipo = new DAO_Equipo();
                 var _listAllChildren = await _daoEquipo.SelectAllChildrenByPlant(this.eq, planta);

                this.lstChildrenEquipment = _listAllChildren != null ? _listAllChildren.ToList() : null;
            };
        }
    }
}
