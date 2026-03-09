using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Models.Envasado
{
    public class Material
    {

        //Atributos
        private string _idMaterial;
        private string _nombre;
        private string _idClase;
        private string _descripcion;
        private string _version;
        private string _estatus;
        private string _udMedida;
        private string _autor;
        private DateTime? _f_efectivoDesde;
        private DateTime? _f_efectivoHasta;
        private DateTime? _fechaCreacion;
        private DateTime? _fechaUltCreacion;
        private bool _enUso;
        private string _modificadoPor;
        private string _infoAdicional;
        private string _tipo;
        private string _idLote;
        private string _clase;
        private string _marca;
        private string _gama;
        private string _tipoEnvase;
        private string _codEan;


        
        //Constructor
        public Material(string pId, string pNombre)
        {
            _idMaterial = pId;
            _nombre = pNombre;
        }


        public Material(string pId, string pNombre, string pIdClase, string pDescripcion, string pVersion, string pEstatus, string pUdMedida, string pAutor,
            DateTime? pEfectivoDesde, DateTime? pEfectivoHasta, DateTime? pFechaCreacion, DateTime? pFechaUltCreacion, bool pEnUso, string pModificadoPor,
            string pInfoAdicional, string pTipo, string pIdLote, string pClase, string pMarca, string pGama, string pTipoEnvase)
        {
            _idMaterial = pId;
            _nombre = pNombre;
            _idClase = pIdClase;
            _descripcion= pDescripcion;
            _version= pVersion;
            _estatus= pEstatus;
            _udMedida= pUdMedida;
            _autor= pAutor;
            _f_efectivoDesde= pEfectivoDesde;
            _f_efectivoHasta= pEfectivoHasta; 
            _fechaCreacion= pFechaCreacion; 
            _fechaUltCreacion= pFechaUltCreacion;
            _enUso= pEnUso;
            _modificadoPor= pModificadoPor;
            _infoAdicional = pInfoAdicional;
            _tipo = pTipo;
            _idLote = pIdLote;
            _clase = pClase;
            _marca = pMarca;
            _gama = pGama;
            _tipoEnvase = pTipoEnvase;
            _codEan = string.Empty;
           
        }

        //Propiedades                       

        public string idMaterial
        {
            get { return _idMaterial; }
            set { _idMaterial = value; }
        }

        public string nombre
        {
            get { return _nombre; }
            set { _nombre = value; }
        }

        public string idClase
        {
            get { return _idClase; }
            set { _idClase = value; }
        }

        public string descripcion
        {
            get { return _descripcion; }
            set { _descripcion = value; }
        }

        public string version
        {
            get { return _version; }
            set { _version = value; }
        }

        public string estatus
        {
            get { return _estatus; }
            set { _estatus = value; }
        }

        public string udMedida
        {
            get { return _udMedida; }
            set { _udMedida = value; }
        }

        public string autor
        {
            get { return _autor; }
            set { _autor = value; }
        }

        public DateTime? f_efectivoDesde
        {
            get { return _f_efectivoDesde ; }
            set { _f_efectivoDesde = value; }
        }

        public DateTime? f_efectivoHasta
        {
            get { return _f_efectivoHasta; }
            set { _f_efectivoHasta = value; }
        }

        public DateTime? fechaCreacion
        {
            get { return _fechaCreacion; }
            set { _fechaCreacion = value; }
        }

        public DateTime? fechaUltCreacion
        {
            get { return _fechaUltCreacion; }
            set { _fechaUltCreacion = value; }
        }

        public bool enUso
        {
            get { return _enUso; }
            set { _enUso = value; }
        }

        public string modificadoPor
        {
            get { return _modificadoPor; }
            set { _modificadoPor = value; }
        }

        public string infoAdicional
        {
            get { return _infoAdicional; }
            set { _infoAdicional = value; }
        }

        public string tipo
        {
            get { return _tipo; }
            set { _tipo = value; }
        }

        public string idLote
        {
            get { return _idLote; }
            set { _idLote = value; }
        }

        public string clase
        {
            get { return _clase; }
            set { _clase = value; }
        }

        public string marca
        {
            get { return _marca; }
            set { _marca = value; }
        }

        public string gama
        {
            get { return _gama; }
            set { _gama = value; }
        }

        public string tipoEnvase
        {
            get { return _tipoEnvase; }
            set { _tipoEnvase = value; }
        }

        public string codEan
        {
            get { return _codEan; }
            set { _codEan = value; }
        }

        //Metodos


        public string FormatoComun { get; set; }
        public string idSubclase { get; set; }
        public string subclase { get; set; }

    }
}