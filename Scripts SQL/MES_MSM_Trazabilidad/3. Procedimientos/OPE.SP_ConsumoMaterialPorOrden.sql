USE [MES_MSM_Trazabilidad]
GO
DROP PROCEDURE [OPE].[SP_ConsumoMaterialPorOrden]

/****** Object:  StoredProcedure [OPE].[SP_ConsumoMaterialPorOrden]    Script Date: 15/06/2021 07:31:04 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--=============================================
-- Autor:			Juan Carlos Gómez Mandujano
-- Fecha creacion:  10/06/2021
-- Desccripcion:	Procedimiento que devuelve los datos para la grilla de consumo de cada material de una orden 
--					de Gestion WO Activas
-- Parametros de entrada
	--	@IdOrden  --> Id de Orden,
	--	@Material --> Material
--  =============================================
--exec [OPE].[SP_ConsumoMaterialPorOrden] 'OP-BUR-FAB-SC1-21-0142', 'Default_MALTA'

CREATE PROCEDURE [OPE].[SP_ConsumoMaterialPorOrden] @IdOrden NVARCHAR(MAX), @Material NVARCHAR(MAX)

AS
BEGIN

set nocount on; 

SELECT IdUbicacion, LocAlias + ' - ' + equip_label as Ubicacion
INTO ##TempUbi
FROM [MES_MSM_Trazabilidad].[UBI].[vDetalleUbicaciones] vUbiDest
INNER JOIN [SITMesDB].[dbo].[MMLocations] LocDest ON LocDest.locid = vUbiDest.ubicacion
INNER JOIN [SITMesDB].[dbo].[BPMV_EQPT] EquipDest ON LocDest.LocAlias = EquipDest.equip_name AND EquipDest.equip_in_plant = 1

SELECT COALESCE(TOpe.[IdOrdenOrigen],TOpeMOV.[IdOrdenOrigen]) as IdOrdenOrigen
	  ,IIF(TOpeMOV.[IdOrdenOrigen] IS NOT NULL,vUbiOrig.Ubicacion,vUbiOrigMOV.Ubicacion) as UbiOrigen
	  ,vUbiDest.Ubicacion as Ubidestino
	  ,Mat.Descript as DescMaterial
	  ,TOpe.[IdLote] as LoteMES
	  ,TOpe.[LoteProveedor]
	  ,TOpe.[Cantidad]
      ,TOpe.[UnidadesMedida]
	  ,TOpe.[FechaEntrada] as Fecha
FROM [MES_MSM_Trazabilidad].[OPE].[tOperacion] as TOpe
INNER JOIN [MES_MSM_Trazabilidad].[OPE].[tOperacion] as TOpeMOV on TOpe.IdLote = TOpeMOV.IdLote AND TOpeMOV.IdTipoOperacion = 2
INNER JOIN ##TempUbi vUbiOrig ON TOpe.IdUbicacionOrigen = vUbiOrig.IdUbicacion
INNER JOIN ##TempUbi vUbiDest ON TOpe.IdUbicacionDestino = vUbiDest.IdUbicacion
INNER JOIN ##TempUbi vUbiOrigMOV ON TOpeMOV.IdUbicacionOrigen = vUbiOrigMOV.IdUbicacion
INNER JOIN [SITMesDB].[dbo].[MTMV2_B_DEF] Mat ON CONVERT(NVARCHAR(MAX), Mat.DefID)  = @Material
WHERE TOpe.IdLote like '%' + @Material + '%' 
AND TOpe.IdOrdenDestino = @IdOrden
AND TOpe.IdTipoOperacion = 3

DROP TABLE ##TempUbi

END

GO


