using MSM.BBDD.Model;
using MSM.Mappers.DTO.Mantenimiento;
using MSM.Models.Planta;
using MSM.Utilidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Mantenimiento
{
    public class Mapper_MantenimientoIntervencion
    {
        public static DTO_SolicitudIntervencion Mapper_MantenimientoIntervencion_toDTO(MantenimientoIntervenciones origen)
        {
            return new DTO_SolicitudIntervencion
            {
                Id = origen.IdMantenimientoIntervenciones,
                NumOT = origen.OT,
                Estado = origen.Estado,
                CerradoEnJDE = origen.CerradoEnJDE,
                Linea = origen.Linea,
                Maquina = origen.Maquina,
                EquipoConstructivo = origen.EquipoConstructivo,
                EquipoConstructivoDescripcion = origen.EquiposConstructivosEnvasado?.Descripcion,
                AreaFabricacion = origen.IdAreaFabricacion,
                CodigoAreaFabricacion = origen.MaestroAreasFabricacion?.Codigo,
                NombreAreaFabricacion = origen.MaestroAreasFabricacion?.Descripcion,
                ZonaFabricacion = origen.IdZonaFabricacion,
                CodigoZonaFabricacion = origen.MaestroZonasFabricacion?.Codigo,
                NombreZonaFabricacion = origen.MaestroZonasFabricacion?.Descripcion,
                EquipoFabricacion = origen.IdEquipoFabricacion,
                CodigoEquipoFabricacion = origen.MaestroEquiposFabricacion?.Codigo,
                NombreEquipoFabricacion = origen.MaestroEquiposFabricacion?.Descripcion,
                GrupoConstructivoFabricacion = origen.IdGrupoConstructivoFabricacion,
                CodigoGrupoConstructivoFabricacion = origen.MaestroGruposConstructivosFabricacion?.Codigo,
                NombreGrupoConstructivoFabricacion = origen.MaestroGruposConstructivosFabricacion?.Descripcion,
                RepuestoFabricacion = origen.IdRepuestoFabricacion,
                CodigoRepuestoFabricacion = origen.MaestroRepuestosFabricacion?.Codigo,
                NombreRepuestoFabricacion = origen.MaestroRepuestosFabricacion?.Descripcion,
                DescripcionAveria = origen.DescripcionAveria,
                IdTipoAveria = origen.IdTipoAveria,
                DescripcionTipoAveria = origen.TipoAveria?.DescripcionAveria,
                DescripcionProblema = origen.DescripcionProblema,
                ComentarioCierre = origen.ComentarioCierre,
                FechaCreacion = origen.FechaCreacion.ToLocalTime(),
                FechaCierre = origen.FechaCierre == null ? (DateTime?)null : ((DateTime)origen.FechaCierre).ToLocalTime(),
                EsEnvasado = origen.EsEnvasado
            };
        }
        
        public static DTO_SolicitudIntervencion Mapper_MantenimientoIntervencion_toDTO_Usuario(MantenimientoIntervenciones origen, string maquinaDesc, string estadoDesc, Usuario usuario)
        {
            var dto = Mapper_MantenimientoIntervencion.Mapper_MantenimientoIntervencion_toDTO(origen);
            dto.MaquinaDescripcion = maquinaDesc;
            dto.EstadoDescripcion = estadoDesc;
            dto.Usuario = usuario;

            return dto;
        }

        public static DTO_CambioEstadoMantenimiento Mapper_MantenimientoCambioEstado_toDTO(MantenimientoCambiosEstados origen)
        {
            return new DTO_CambioEstadoMantenimiento()
            {
                OT = origen.OT,
                Estado = origen.Estado,
                Fecha = origen.FechaInicio.ToLocalTime()
            };           
        }

        public static DTO_CambioEstadoMantenimiento Mapper_MantenimientoCambioEstado_toDTO_Estado(MantenimientoCambiosEstados origen, string estadoDesc)
        {
            var dto = Mapper_MantenimientoCambioEstado_toDTO(origen);
            dto.EstadoDescripcion = estadoDesc;

            return dto;     
        }

        public static DTO_ConfValidacionArranque Mapper_ConfValidacionArranque_toDTO(vMantenimientoConfMaquinasValidacionArranque origen)
        {
            return new DTO_ConfValidacionArranque
            {
                Id = origen.Id,
                Linea = origen.Linea,
                CodigoMaquina = origen.CodigoMaquina,
                MaquinaDescripcion = origen.DescripcionMaquina
            };
        }

        public static DTO_DatosValidacionArranque Mapper_DatosValidacionArranque_toDTO(MantenimientoDatosValidacionArranqueOT origen)
        {
            return new DTO_DatosValidacionArranque
            {
                Id = origen.Id,
                OT = origen.OT,
                ResponsableProduccion = origen.ResponsableProduccion,
                ResponsableMantenimiento = origen.ResponsableMantenimiento,
                FechaValidacion = origen.FechaValidacion.KindUTC()
            };
        }

        public static DTO_MaestroFabricacionBase Mapper_MaestroAreasFabricacion_toDTO(MaestroAreasFabricacion origen)
        {
            return new DTO_MaestroFabricacionBase
            {
                Id = origen.IdAreaFabricacion,
                Codigo = origen.Codigo,
                Descripcion = origen.Descripcion,
                Descripcion2 = origen.Descripcion2,
                Descripcion3 = origen.Descripcion3
            };
        }

        public static DTO_MaestroFabricacion Mapper_MaestroZonasFabricacion_toDTO(MaestroZonasFabricacion origen)
        {           
            return new DTO_MaestroFabricacion
            {
                Id = origen.IdZonaFabricacion,
                IdPadre = origen.IdAreaFabricacion,
                Codigo = origen.Codigo,
                Descripcion = origen.Descripcion,
                Descripcion2 = origen.Descripcion2,
                Descripcion3 = origen.Descripcion3
            };
        }

        public static DTO_MaestroFabricacion Mapper_MaestroEquiposFabricacion_toDTO(MaestroEquiposFabricacion origen)
        {           
            return new DTO_MaestroFabricacion
            {
                Id = origen.IdEquipoFabricacion,
                IdPadre = origen.IdZonaFabricacion,
                Codigo = origen.Codigo,
                Descripcion = origen.Descripcion,
                Descripcion2 = origen.Descripcion2,
                Descripcion3 = origen.Descripcion3
            };
        }

        public static DTO_MaestroFabricacion Mapper_MaestroGruposConstructivosFabricacion_toDTO(MaestroGruposConstructivosFabricacion origen)
        {           
            return new DTO_MaestroFabricacion
            {
                Id = origen.IdGrupoConstructivoFabricacion,
                IdPadre = origen.IdEquipoFabricacion,
                Codigo = origen.Codigo,
                Descripcion = origen.Descripcion,
                Descripcion2 = origen.Descripcion2,
                Descripcion3 = origen.Descripcion3
            };
        }

        public static DTO_MaestroFabricacion Mapper_MaestroRepuestosFabricacion_toDTO(MaestroRepuestosFabricacion origen)
        {           
            return new DTO_MaestroFabricacion
            {
                Id = origen.IdRepuestoFabricacion,
                IdPadre = origen.IdGrupoConstructivoFabricacion,
                Codigo = origen.Codigo,
                Descripcion = origen.Descripcion,
                Descripcion2 = origen.Descripcion2,
                Descripcion3 = origen.Descripcion3
            };
        }
    }
}