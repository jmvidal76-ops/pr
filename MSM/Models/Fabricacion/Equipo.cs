using MSM.BBDD.Model;
using Siemens.SimaticIT.BPM.Breads;
using Siemens.SimaticIT.BPM.Breads.Types;
using System.Data;
using System.Linq;

namespace MSM.Models.Fabricacion
{
    public class Equipo
    {

        private string _descripcion;
        private string _nombre;
        private string _id;
        private int _pk;
        private string _estado;
        private int _posicion;
        private int _capacidadMaxima;


        public string nombre
        {
            get { return this._nombre; }
            set { this._nombre = value; }
        }

        public string descripcion
        {
            get { return this._descripcion; }
            set { this._descripcion = value; }
        }

        public string id
        {
            get { return this._id; }
            set { this._id = value; }
        }

        public int pk
        {
            get { return this._pk; }
            set { this._pk = value; }
        }

        public string estado
        {
            get { return this._estado; }
            set { this._estado = value; }
        }

        public int posicion
        {
            get { return this._posicion; }
            set { this._posicion = value; }
        }

        public int capacidadMaxima
        {
            get { return this._capacidadMaxima; }
            set { this._capacidadMaxima = value; }
        }    

        public Equipo() { }

        public Equipo(int pkEquipo)
        {
            using (MESEntities context = new MESEntities())
            {
                Equipo_FAB equipoBuscado = context.Equipo_FAB.AsNoTracking().Where(e => e.EquipoPK == pkEquipo).FirstOrDefault();
                //Solo accederá si el equipo es una área/Celda
                if (equipoBuscado == null && pkEquipo != -1)
                {
                    Equipment_BREAD eBread = new Equipment_BREAD();
                    Equipment aux= eBread.Select("", 0, 0, "{PK} =" + pkEquipo.ToString()).FirstOrDefault();
                    if (aux != null)
                    {
                        if (aux.Level.Equals("Cell"))
                        {
                            EquipmentProperty_BREAD propBread = new EquipmentProperty_BREAD();
                            equipoBuscado = new Equipo_FAB();
                            equipoBuscado.Descripcion = aux.Name;
                            equipoBuscado.Estado = propBread.Select("", 0, 0, "{EquipmentPK} = " + pkEquipo.ToString() + " AND {ID} = 'EQUIPMENT-STATUS'").FirstOrDefault().Value;
                            equipoBuscado.ID = aux.ID;
                            equipoBuscado.Name = aux.Name;
                            equipoBuscado.Posicion = int.Parse(propBread.Select("", 0, 0, "{EquipmentPK} = " + pkEquipo.ToString() + " AND {ID} = 'POSICION'").FirstOrDefault().Value);
                            equipoBuscado.Capacidad_Maxima = null;
                        }
                    }
                }

                if (equipoBuscado != null)
                {
                    this._descripcion = equipoBuscado.Descripcion;
                    this._estado = equipoBuscado.Estado;
                    this._id = equipoBuscado.ID;
                    this._nombre = equipoBuscado.Name;
                    this._pk = pkEquipo;
                    this._posicion = equipoBuscado.Posicion.HasValue ? equipoBuscado.Posicion.Value : 99;
                    this._capacidadMaxima = equipoBuscado.Capacidad_Maxima.HasValue ? equipoBuscado.Capacidad_Maxima.Value : 0;
                }
                else
                {
                    this._descripcion = "---";
                    this._estado = "---";
                    this._id = "---";
                    this._nombre = "---";
                    this._pk = -1;
                    this._posicion = -1;
                    this._capacidadMaxima = 0;
                }
            }
        }
    }
}
