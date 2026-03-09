using MSM.BBDD.Fabricacion;
using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Area
    {
        private SitEquipment eq { get; set; }

        public Area(SitEquipment eq)
        {
            this.eq = eq;
        }

    

    public SitEquipment EquipoSit
        {
            get { return this.eq; }
        }

        public async Task<List<Celda>> GetCeldas()
        {
            string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];

            List<Celda> lstCeldas = new List<Celda>();
            DAO_Equipo _daoEquipo = new DAO_Equipo();
            var _result = await _daoEquipo.SelectAllChildrenByPlant(this.eq, planta);
            _result.ToList().All(eq =>
            {
                lstCeldas.Add(Celda.CreateAsync(eq).Result);
                return true;
            });

            return lstCeldas;
        }
    }
}