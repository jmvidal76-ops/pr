USE [MES_MSM_Trazabilidad]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER VIEW [LOT].[vLoteConsumido]
AS

SELECT 
	Lote.IdLoteMateriaPrima				AS ID_LOTE_MMPP,
	TM.DescTipo							AS TIPO_MATERIAL,
	MM.Clase							AS CLASE_MATERIAL,
	MM.IdMaterial						AS REFERENCIA_MES, 
	MM.Descripcion						AS MATERIAL,
	Lote.IdLoteMES						AS LOTE_MES,
	Lote.IdProveedor					AS ID_PROVEEDOR,
	Proveedor.Proveedor					AS PROVEEDOR,
	Lote.LoteProveedor					AS LOTE_PROVEEDOR,
	Lote.CantidadInicial				AS CANTIDAD_INICIAL,
	Lote.CantidadActual					AS CANTIDAD_ACTUAL,
	MM.UdMedida							AS UNIDADES,
	Lote.PRIORIDAD						AS PRIORIDAD,
    Lote.FechaEntradaPlanta				AS FECHA_ENTRADA_PLANTA,
    Lote.FechaEntradaUbicacion			AS FECHA_ENTRADA_UBICACION,
    Lote.FechaInicioConsumo 			AS FECHA_INICIO_CONSUMO,
    Lote.FechaFinConsumo				AS FECHA_FIN_CONSUMO,
	Lote.FechaInicioConsumoEtiqPalet	AS FECHA_INICIO_ETIQUETA,
	Lote.FechaFinConsumoEtiqPalet		AS FECHA_FIN_ETIQUETA,
	CASE WHEN Lote.FechaInicioConsumo IS NULL OR Lote.FechaInicioConsumoEtiqPalet IS NULL THEN 0
		 ELSE DATEDIFF(minute, Lote.FechaInicioConsumo, Lote.FechaInicioConsumoEtiqPalet) END AS MINUTO_VIAJE_ENVASE,
    Lote.FechaCaducidad					AS FECHA_CADUCIDAD,
    Lote.FechaCuarentena				AS FECHA_CUARENTENA,
    Lote.MotivoCuarentena				AS MOTIVO_CUARENTENA,
    Lote.FechaBloqueo					AS FECHA_BLOQUEO,
	Lote.MotivoBloqueo					AS MOTIVO_BLOQUEO,
	Almacen.Descripcion					AS ALMACEN,
	Zona.Descripcion					AS ZONA,
	Ubicacion.Nombre					AS UBICACION,
	Ubicacion.IdUbicacionLinkMes		AS UBICACION_MES,
	Ubicacion.IdUbicacion				AS UBICACION_ORIGEN,
	EstadoUbicacion.Descripcion			AS ESTADO_UBICACION,
	TipoUbicacion.Descripcion			AS TIPO_UBICACION,
	PoliticaVaciado.Descripcion			AS POLITICA_VACIADO,
	Lote.FechaDefectuoso				AS DEFECTUOSO
FROM [LOT].[tLoteMateriaPrimaConsumido] Lote
     INNER JOIN [MAT].[vMateriales] MM ON MM.IdMaterial = Lote.IdMaterial
	 LEFT JOIN [MAT].[vTipoMaterial] TM ON TM.Tipo = MM.Tipo
	 LEFT JOIN [UBI].[tUbicacion] Ubicacion ON Ubicacion.IdUbicacion = Lote.IdUbicacion
	 INNER JOIN [UBI].[tAlmacen] Almacen ON Almacen.IdAlmacen = Ubicacion.IdAlmacen
	 INNER JOIN [UBI].[tZona] Zona ON Ubicacion.IdZona = Zona.IdZona	  
	 LEFT JOIN UBI.tEstadoUbicacion EstadoUbicacion ON EstadoUbicacion.IdEstadoUbicacion = Ubicacion.IdEstado
	 LEFT JOIN [UBI].[tTipoUbicacion] TipoUbicacion ON TipoUbicacion.IdTipoUbicacion = Ubicacion.IdTipoUbicacion
	 LEFT JOIN [UBI].[tPoliticaVaciado] PoliticaVaciado ON PoliticaVaciado.IdPoliticaVaciado = Ubicacion.IdPoliticaVaciado
	 LEFT JOIN [MAT].[vMaestroProveedores] Proveedor ON Proveedor.IdProveedor = Lote.IdProveedor

GO


