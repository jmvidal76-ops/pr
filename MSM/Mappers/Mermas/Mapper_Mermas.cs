using Common.Models.Envasado;
//using Common.Models.Mermas;
using MSM.BBDD.Model;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.DTO.Mermas;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.Mermas
{
    public class Mapper_Merma
    {
        //public static DTO_Mermas Mapper_TurnosMermas_toDTO(MermasTurnos origen)
        //{
        //    return new DTO_Mermas()
        //    {
        //        Id = origen.IdMermaTurno,
        //        IdTurno = origen.IdTurno,
        //        Linea = origen.Linea,
        //        IdTipoTurno = origen.idTipoTurno,
        //        Turno = origen.turno,
        //        Fecha = origen.fecha.ToLocalTime()
        //    };
        //}

        //public static DTO_MermasRegistro Mapper_RegistrosMermas_toDTO(MermasRegistros origen, MermasTurnos turno, string maquinaDesc, string maquinaClase)
        //{
        //    return new DTO_MermasRegistro()
        //    {
        //        Id = origen.IdMermaRegistro,
        //        IdTurnoMerma = origen.IdMermaTurno,
        //        IdTurno = turno.IdTurno,
        //        Maquina = origen.Maquina,
        //        MaquinaDescripcion = maquinaDesc,
        //        MaquinaClase = maquinaClase,
        //        CodigoProveedor = origen.CodigoProveedor,
        //        Proveedor = origen.Proveedor,
        //        Observaciones = origen.Observaciones,
        //        WO = origen.WO,
        //        IdProducto = origen.IdProducto,
        //        DescripcionProducto = origen.DescripcionProducto,
        //        FechaCreado = origen.FechaCreado
        //    };
        //}
        
        public static DTO_MermasRegistro Mapper_RegistrosMermas_toDTO(vMermasRegistros origen, vMermasTurnos turno = null)
        {
            var item = new DTO_MermasRegistro()
            {
                Id = origen.IdMermaRegistro,
                IdTurnoMerma = origen.IdMermaTurno,
                IdTurno = origen.IdTurno,
                IdMaquina = origen.IdMaquina,
                CodigoMaquina = origen.CodigoMaquina,
                MaquinaDescripcion = origen.DescripcionMaquina,
                MaquinaClase = TipoEnumMaquinasClasesExtensions.GetEnumAbrev(origen.ClaseMaquina).ToString(),
                CodigoProveedor = origen.CodigoProveedor,
                Proveedor = origen.DescripcionProveedor,
                Observaciones = origen.Observaciones,
                WO = origen.WO,
                IdProducto = origen.IdProducto,
                DescripcionProducto = origen.DescripcionProducto,
                FechaCreado = origen.FechaCreado
            };

            if (turno != null)
            {
                item.IdTurno = turno.IdTurno;
            }

            return item;
        }

        //public static DTO_MermasContador Mapper_ContadorMermas_toDTO(MermasContadores origen, MermasConfiguracionContadores config)
        //{
        //    var dtoConfig = Mapper_Mermas.Mapper_ConfiguracionContadorMermas_toDTO(config);
        //    return Mapper_ContadorMermas_toDTO(origen, dtoConfig);
        //}

        public static DTO_MermasContador Mapper_ContadorMermas_toDTO(MermasContadores origen, vMermasMaquinasContadores config)
        {
            var dtoConfig = Mapper_Merma.Mapper_MermasMaquinaContador_toDTO(config);
            return Mapper_ContadorMermas_toDTO(origen, dtoConfig);
        }

        public static DTO_MermasContador Mapper_ContadorMermas_toDTO(MermasContadores origen, DTO_MermasConfiguracionContador config)
        {
            return new DTO_MermasContador()
            {
                Id = origen.IdMermaContador,
                IdRegistro = origen.IdMermaRegistro,
                ContadorConfiguracion = config,
                Valor = origen.Valor,
                Unidad = origen.Unidad,
                Justificacion = origen.Justificacion
            };
        }

        //public static MermasConfiguracionContadores Mapper_ConfiguracionContadorMermas_toDB(DTO_MermasConfiguracionContador origen)
        //{
        //    return new MermasConfiguracionContadores()
        //    {
        //        IdMermaConfiguracionContador = origen.Id,
        //        Linea = origen.Linea,
        //        Maquina = origen.Maquina,
        //        ClaseMaquina = origen.ClaseMaquina,
        //        Descripcion = origen.Descripcion,
        //        ContadorGlobal = origen.TipoGlobal,
        //        PorcentajeMinimo = origen.PorcentajeMinimo,
        //        PorcentajeMaximo = origen.PorcentajeMaximo,
        //        CapturaAutomatica = origen.CapturaAutomatica,
        //        ClaseEnvase = origen.ClaseEnvase,
        //        Orden = origen.Orden,
        //        EsContadorProduccion = origen.EsContadorProduccion,
        //        RechazoTotal = origen.RechazoTotal
        //    };
        //}
        
        public static MermasMaestroContadores Mapper_ConfiguracionContadorMermas_toDB(DTO_MermasConfiguracionContador origen)
        {
            return new MermasMaestroContadores()
            {
                IdMermasMaestroContadores = origen.Id ?? 0,
                ClaseMaquina = origen.ClaseMaquina,                
                Descripcion = origen.Descripcion,
                ContadorGlobal = origen.TipoGlobal,
                PorcentajeMinimo = origen.PorcentajeMinimo,
                PorcentajeMaximo = origen.PorcentajeMaximo,
                CapturaAutomatica = origen.CapturaAutomatica,
                ClaseEnvase = origen.ClaseEnvase,
                Orden = origen.Orden,
                EsContadorProduccion = origen.EsContadorProduccion,
                EsRechazoTotal = origen.RechazoTotal
            };
        }

        //public static DTO_MermasConfiguracionContador Mapper_ConfiguracionContadorMermas_toDTO(MermasConfiguracionContadores origen)
        //{
        //    return new DTO_MermasConfiguracionContador()
        //    {
        //        Id = origen.IdMermaConfiguracionContador,
        //        Linea = origen.Linea,
        //        Maquina = origen.Maquina,
        //        ClaseMaquina = origen.ClaseMaquina,
        //        Descripcion = origen.Descripcion,
        //        TipoGlobal = origen.ContadorGlobal,
        //        PorcentajeMinimo = origen.PorcentajeMinimo,
        //        PorcentajeMaximo = origen.PorcentajeMaximo,
        //        CapturaAutomatica = origen.CapturaAutomatica,
        //        ClaseEnvase = origen.ClaseEnvase,
        //        Orden = origen.Orden,
        //        EsContadorProduccion = origen.EsContadorProduccion,
        //        RechazoTotal = origen.RechazoTotal
        //    };
        //}
        
        public static DTO_MermasConfiguracionContador Mapper_MermasMaquinaContador_toDTO(vMermasMaquinasContadores origen)
        {
            return new DTO_MermasConfiguracionContador()
            {
                Id = origen.IdMermaMaquinaContador,   
                IdMaestroContador = origen.IdMermasMaestroContadores,
                Linea = origen.IdLinea,
                IdMaquina = origen.IdMaquina,
                CodigoMaquina = origen.CodigoMaquina,
                DescripcionMaquina = origen.DescripcionMaquina,
                ClaseMaquina = TipoEnumMaquinasClasesExtensions.GetEnumAbrev(origen.ClaseMaquina).ToString(),
                Descripcion = origen.Contador,
                TipoGlobal = origen.ContadorGlobal,
                TipoGlobalNombre = origen.ContadorGlobalNombre,
                PorcentajeMinimo = origen.PorcentajeMinimo,
                PorcentajeMaximo = origen.PorcentajeMaximo,
                CapturaAutomatica = origen.CapturaAutomatica,
                ClaseEnvase = origen.ClaseEnvase,
                Orden = origen.Orden,
                EsContadorProduccion = origen.EsProduccion,
                RechazoTotal = origen.EsRechazoTotal,
                Incluido = origen.Incluido,
                Activo = origen.Activo
            };
        }
        
        public static DTO_MermasConfiguracionContador Mapper_MermasConfiguracionContador_toDTO(MermasMaestroContadores origen)
        {
            return new DTO_MermasConfiguracionContador()
            {
                Id = origen.IdMermasMaestroContadores,   
                IdMaestroContador = origen.IdMermasMaestroContadores,                
                ClaseMaquina = TipoEnumMaquinasClasesExtensions.GetEnumAbrev(origen.ClaseMaquina).ToString(),
                Descripcion = origen.Descripcion,
                TipoGlobal = origen.ContadorGlobal,
                TipoGlobalNombre = origen.MermasContadorGlobal?.NombreContadorGlobal,
                PorcentajeMinimo = origen.PorcentajeMinimo,
                PorcentajeMaximo = origen.PorcentajeMaximo,
                CapturaAutomatica = origen.CapturaAutomatica,
                ClaseEnvase = origen.ClaseEnvase,
                Orden = origen.Orden,
                EsContadorProduccion = origen.EsContadorProduccion,
                RechazoTotal = origen.EsRechazoTotal,
                Activo = origen.Activo
            };
        }
    }
}