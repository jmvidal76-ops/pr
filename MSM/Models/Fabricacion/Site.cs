using MSM.BBDD.Fabricacion;
using MSM.BBDD.Planta;
using Siemens.Brewing.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.Models.Fabricacion
{
    public class Site
    {
        private SitEquipment eq { get; set; }

        public Site()
        {
            
        }

        private async Task<Site> InitializeAsync(string id)
        {
            string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
            DAO_Equipo _daoEquipo = new DAO_Equipo();
            this.eq = await _daoEquipo.EquipmentByPlantId(id, planta);
            return this;
        }

        public static Task<Site> CreateAsync(string id)
        {
            var ret = new Site();
            return ret.InitializeAsync(id);
        }
    

    public SitEquipment EquipoSit
        {
            get { return this.eq; }
        }

        public async Task<List<Area>> GetAreas()
        {
            List<Area> lstAreas = new List<Area>();
            string planta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
            DAO_Equipo _daoEquipo = new DAO_Equipo();
            var result = await _daoEquipo.SelectAllChildrenByPlant(this.eq, planta);
            result.ToList().Where(a => a.Level == "Area").All(eq =>
            //SitEquipment_BREAD.SelectAllChildrenNUEVAPLANTA(this.eq).ToList().Where(a => a.Level == "Area").All(eq =>
            {
                lstAreas.Add(new Area(eq));
                return true;
            });

            return lstAreas;
        }
    }
}