using System.Collections.Generic;

namespace MSM.Models.Planta
{
    public class Menu
    {
        public int id { get; set; }
        public string texto { get; set; }
        public string vista { get; set; }
        public bool permiso { get; set; }
        public List<Menu> subMenus { get; set; }
        public List<Funcion> funciones { get; set; }
        public bool selected { get; set; }

        //----------------------------------------------------------------
        //Constructores
        //----------------------------------------------------------------

        public Menu()
        {
           
        }

        public Menu(int Id, string Texto, string Vista, bool Permiso, List<Menu> pSubMenus, List<Funcion> pFunciones)
        {
            id = Id;
            texto = Texto;
            vista = Vista;
            permiso = Permiso;
            subMenus = pSubMenus;
            funciones = pFunciones;
        }
        
    }
}