using Common.Models.Lote;
using Common.Models.Material;
using Common.Models.Transportes;
using Common.Models.Ubicaciones;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models.Operation
{
   public class OperationDto
    {
        public int IdOperacion { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        public DateTime? FechaEntrada { get; set; }

        public DateTime? FechaDescarga { get; set; }

        public DateTime? FechaCaducidad { get; set; }

        public string EliminarFechaCaducidad { get; set; }

        public bool IsGranel { get; set; }

        public int? IdTipoOperacion { get; set; }

        public string IdLote { get; set; }

        public string IdSublote { get; set; }

        public string IdOrdenOrigen { get; set; }

        public string IdOrdenDestino { get; set; }

        public int? IdUbicacionOrigen { get; set; }

        public int? IdUbicacionDestino { get; set; }

        public decimal? CantidadInicial { get; set; }

        public decimal? CantidadActual { get; set; }

        public decimal? Cantidad { get; set; }

        public string UnidadesMedida { get; set; }

        public int IdUnidadMedida { get; set; }

        public decimal Factor { get; set; }

        public string TargetUoMID { get; set; }

        public List<MaterialUnitsDto> ListUnidadesMedidaDto { get; set; }

        public MaterialUnitsDto UnidadesMedidaDto { get; set; }

        public string OperadorSistema { get; set; }

        public string Proveedor { get; set; }

        public string EAN { get; set; }

        public string AECOC { get; set; }

        public string LoteProveedor { get; set; }

        public string SSCC { get; set; }

        public int IdAlbaran { get; set; }

        public string CreadoPor { get; set; }

        public string ReferenciaMaterial { get; set; }

        public string CantidadRestante { get; set; }

        public string IDLoteNuevo { get; set; }

        public string CantidadPrevia { get; set; }

        public string MotivoBloqueo { get; set; }

        public string IDMuestraLims { get; set; }

        public string ControlGestion01 { get; set; }

        public string ControlGestion02 { get; set; }

        public string ControlGestion03 { get; set; }

        public int IdTransporte { get; set; }
        
        public int IdAlbaranPosicion { get; set; }

        public string IdMaterial { get; set; }

        public string LocationPathDestino { get; set; }

        public string Location { get; set; }

        public string Proceso { get; set; }

        public int? IdProceso { get; set; }

        public LotStatusDto Estado { get; set; }

        public ZonaDto Zona { get; set; }

        public UbicacionDto Ubicacion { get; set; }

        public AlmacenDto Almacen { get; set; }

        public string TipoOperacion { get; set; }

        public string UbicacionOrigen { get; set; }

        public string UbicacionDestino { get; set; }

        public List<PropiedadLoteDto> PropiedadesLotes { get; set; }

        public Nullable<System.DateTime> FechaBloqueo { get; set; }

        public Nullable<System.DateTime> FechaCuarentena { get; set; }

        public string MotivoCuarentena { get; set; }

        public Nullable<int> Prioridad { get; set; }

        public string ClaseMaterial { get; set; }

        public string DescripcionMaterial { get; set; }

        public int Paleta { get; set; }//Genealogia

        public int IdTipoOperacionRegistro { get; set; }

        public string IdLoteOrden { get; set; }

        public DateTime? Defectuoso { get; set; }

        public string EliminarFechaDefectuoso { get; set; }

        public string IdLinea { get; set; }

        public string IdZona { get; set; }

        public DateTime? Actualizado { get; set; }

        public string NombreProveedor { get; set; }

        public string NombreMaterial { get; set; }

        public string NombreUbicacion { get; set; }

        public bool LoteFabricacion { get; set; }

        public int? IdLoteMateriaPrima { get; set; }

        public DateTime? FechaEntradaUbicacion { get; set; }

        public DateTime? FechaInicioConsumo { get; set; }

        public DateTime? FechaFinConsumo { get; set; }

        public int? ReplicarLote { get; set; }
    }
}
