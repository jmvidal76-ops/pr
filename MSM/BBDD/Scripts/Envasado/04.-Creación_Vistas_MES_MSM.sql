USE [MES_MSM]
GO
/****** Object:  View [dbo].[ProductosLineas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/*AND Materiales.PPR_Current = 1*/
CREATE VIEW [dbo].[ProductosLineas]
AS
SELECT
	LineaPPR.ExecEquipList_ExecEquipLongName AS Linea
	,Materiales.PPR
	,Materiales.PPR_FinalMaterialId AS Material
	,LineaPPR.ExecEquipList_PPRVersion AS Versionado
FROM SITMesDB.dbo.PDefM_PPR AS Materiales
INNER JOIN SITMesDB.dbo.PDefM_PS_ExecEquipList AS LineaPPR ON ExecEquipList_PPR = Materiales.PPR AND ExecEquipList_PPRVersion = Materiales.PPR_Version


GO
/****** Object:  View [dbo].[ParametrosLinea]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[ParametrosLinea]
AS
SELECT
	dbo.ProductosLineas.PPR
	,dbo.ProductosLineas.Linea AS idLinea
	,dbo.ProductosLineas.Material AS Producto
	,Parametros.VELOCIDAD_NOMINAL AS VelocidadNominal
	,Parametros.OEE_CRITICO AS OEECritico
	,Parametros.OEE_OBJETIVO AS OEEObjetivo
	,Parametros.OEE_CALCULADO AS OEECalculado
	,Parametros.OEE_PREACTOR
FROM dbo.ProductosLineas
INNER JOIN dbo.COB_MSM_PARAMETROS_LINEA_PRODUCTO AS Parametros
	ON Parametros.ID_PPR = dbo.ProductosLineas.PPR


GO
/****** Object:  View [dbo].[ParametrosOrdenes]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






CREATE VIEW [dbo].[ParametrosOrdenes]
AS
SELECT
	Parametros.IdOrden
	,Parametros.idOrdenPadre
	,Parametros.OEE
	,Parametros.Disponibilidad
	,Parametros.Eficiencia
	,Parametros.Calidad
	,Parametros.RendMecanico
	,ISNULL(CONVERT(INT,Parametros.IdSubOrden),-1) AS IdSubOrden
	,Parametros.ConversionEnvases AS EnvasesPorPalet
	,Parametros.ConversionCajas AS CajasPorPalet
	,Parametros.HectolitrosProducto AS HectolitrosProducto
	,Parametros.CausaPausa
	,ISNULL(CONVERT(INT, Parametros.PaletsProducidos), 0) AS PaletsProducidos
	,ISNULL(CONVERT(INT, Parametros.CajasProducidas), 0) AS CajasProducidas
	,ISNULL(CONVERT(INT, Parametros.EnvasesProducidos), 0) AS EnvasesProducidos
	,ISNULL(CONVERT(INT, Parametros.RechazosALlenadora), 0) AS RechazosALlenadora
	,ISNULL(CONVERT(INT, Parametros.RechazosAClasificador), 0) AS RechazosAClasificador
	,ISNULL(CONVERT(INT, Parametros.RechazosAProductoTerminado), 0) AS RechazosAProductoTerminado
	,ISNULL(CONVERT(INT, Parametros.RechazosAVacios), 0) AS RechazosAVacios
	,ISNULL(CONVERT(INT, Parametros.Picos), 0) AS PicosCajas
	,Parametros.FechaInicioRealOriginal 
	,Parametros.FechaFinRealOriginal
	,Parametros.VelocidadNominal
	,Parametros.OEECritico
	,Parametros.OEEObjetivo
FROM 
(
SELECT
	o.pom_order_id AS IdOrden
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP oprp
	WHERE (pom_custom_fld_name = 'WO_ID_MASTER' AND oprp.pom_order_id = o.pom_order_id )) AS idOrdenPadre
	--,idOrdenPadre.VAL AS idOrdenPadre
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'OEE' AND oprp.pom_order_id = o.pom_order_id)) AS OEE
	--,OEE.VAL AS OEE
	,(SELECT 
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'DISPONIBILIDAD' AND oprp.pom_order_id = o.pom_order_id)) AS Disponibilidad
	--,Disponibilidad.VAL AS Disponibilidad
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'EFICIENCA' AND oprp.pom_order_id = o.pom_order_id)) AS Eficiencia
	--,Eficiencia.VAL AS Eficiencia
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'CALIDAD' AND oprp.pom_order_id = o.pom_order_id)) AS Calidad
	--,Calidad.VAL AS Calidad
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'Rendimiento_Mecanico' AND oprp.pom_order_id = o.pom_order_id)) AS RendMecanico
	--,RendMecanico.VAL AS RendMecanico
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'WO_PART_ID' AND oprp.pom_order_id = o.pom_order_id)) AS IdSubOrden
	--,ISNULL(CONVERT(INT,SubOrden.VAL),-1) AS IdSubOrden
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'ENVASES_PALETS' AND oprp.pom_order_id = o.pom_order_id)) AS ConversionEnvases
	--,ConversionEnvases.VAL AS EnvasesPorPalet
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'CAJAS_PALETS' AND oprp.pom_order_id = o.pom_order_id)) AS ConversionCajas
	--,ConversionCajas.VAL AS CajasPorPalet
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'ENVASES_HL' AND oprp.pom_order_id = o.pom_order_id)) AS HectolitrosProducto
	--,HectolitrosProducto.VAL AS HectolitrosProducto
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'CAUSA_PAUSA' AND oprp.pom_order_id = o.pom_order_id)) AS CausaPausa
	--,CausaPausa.VAL AS CausaPausa
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'CAJAS_PRODUCIDAS' AND oprp.pom_order_id = o.pom_order_id)) AS CajasProducidas
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'ENVASES_PRODUCIDOS' AND oprp.pom_order_id = o.pom_order_id)) AS EnvasesProducidos
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'PALETS_PRODUCIDOS' AND oprp.pom_order_id = o.pom_order_id)) AS PaletsProducidos
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'RECHAZOS_LLENADORA' AND oprp.pom_order_id = o.pom_order_id)) AS RechazosALlenadora
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'RECHAZOS_CLASIFICADOR' AND oprp.pom_order_id = o.pom_order_id)) AS RechazosAClasificador
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'RECHAZOS_PRODUCTO_TERMINADO' AND oprp.pom_order_id = o.pom_order_id)) AS RechazosAProductoTerminado
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'RECHAZOS_VACIOS' AND oprp.pom_order_id = o.pom_order_id)) AS RechazosAVacios
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'PICOS' AND oprp.pom_order_id = o.pom_order_id)) AS Picos
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'FECHA_INICIO_REAL' AND oprp.pom_order_id = o.pom_order_id)) AS FechaInicioRealOriginal
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'FECHA_FIN_REAL' AND oprp.pom_order_id = o.pom_order_id)) AS FechaFinRealOriginal
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'VELOCIDAD_NOMINAL' AND oprp.pom_order_id = o.pom_order_id)) as VelocidadNominal
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'OEE_CRITICO' AND oprp.pom_order_id = o.pom_order_id)) as OEECritico
	,(SELECT
		VAL
	FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
	WHERE (pom_custom_fld_name = 'OEE_OBJETIVO' AND oprp.pom_order_id = o.pom_order_id)) as OEEObjetivo
FROM SITMesDB.dbo.POMV_ORDR o
) AS Parametros

GO
/****** Object:  View [dbo].[Particiones]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







CREATE VIEW [dbo].[Particiones]
AS
SELECT
	Ordenes.pom_order_id AS Id
	,dbo.ParametrosOrdenes.idOrdenPadre AS IdOrdenPadre
	,dbo.ParametrosOrdenes.IdSubOrden
	,Ordenes.estimated_start_time AS FecIniEstimada
	,Ordenes.estimated_end_time AS FecFinEstimada
	,Ordenes.actual_start_time AS FecIniReal
	,Ordenes.actual_end_time AS FecFinReal
	,Ordenes.matl_def_id AS IdProducto
	,Ordenes.pom_matl_qty AS CantidadPlanificada
	,Ordenes.produced_qty AS CantidadProducida
	,Ordenes.pom_order_status_id AS EstadoAct
	,Ordenes.pom_order_status_pk AS IdEstadoAct
	,Ordenes.prev_pom_order_status_id AS EstadoAnt
	,Ordenes.prev_pom_order_status_pk AS IdEstadoAnt
	,dbo.ParametrosLinea.idLinea AS Linea
	,Ordenes.note AS Descripcion
	,Ordenes.RowUpdated AS FecHorAct
	,ISNULL(CAST(dbo.ParametrosOrdenes.VelocidadNominal AS FLOAT), 0) AS VelocidadNominal
	,ISNULL(NULLIF(CAST(dbo.ParametrosOrdenes.OEEObjetivo AS FLOAT),0), ISNULL(CAST(dbo.ParametrosOrdenes.OEEObjetivo AS FLOAT), 0)) AS OEEObjetivo
	,ISNULL(NULLIF(CAST(dbo.ParametrosOrdenes.OEECritico AS FLOAT),0), ISNULL(CAST(dbo.ParametrosOrdenes.OEECritico AS FLOAT), 0)) AS OEECritico
	,Ordenes.ERP_ID AS CodigoJDE
	,Ordenes.ppr_name AS PPR
	,ISNULL(CAST(Ordenes.scrapped_qty AS INT), 0) AS Rechazos
	,ISNULL(CAST(dbo.ParametrosOrdenes.OEE AS FLOAT), 0) AS OEE
	,ISNULL(CAST(dbo.ParametrosOrdenes.Disponibilidad AS FLOAT), 0) AS Disponibilidad
	,ISNULL(CAST(dbo.ParametrosOrdenes.Eficiencia AS FLOAT), 0) AS Eficiencia
	,ISNULL(CAST(dbo.ParametrosOrdenes.Calidad AS FLOAT), 1) AS Calidad
	,ISNULL(CAST(dbo.ParametrosOrdenes.RendMecanico AS FLOAT), 0) AS RendMecanico
	,ISNULL(CAST(dbo.ParametrosOrdenes.EnvasesPorPalet AS INT), 0)
	AS EnvasesPorPalet
	,ISNULL(CAST(dbo.ParametrosOrdenes.CajasPorPalet AS INT), 0) AS CajasPorPalet
	,ISNULL(CAST(dbo.ParametrosOrdenes.HectolitrosProducto AS NUMERIC(16, 6)), 0) AS HectolitrosProducto
	,dbo.ParametrosOrdenes.CausaPausa
	,(SELECT COALESCE(SUM(CANTIDAD),0)
	FROM dbo.COB_MSM_PICOS_PROD
	WHERE ID_PARTICION = Ordenes.pom_order_id) AS PicosCajas
FROM SITMesDB.dbo.POMV_ORDR AS Ordenes
LEFT OUTER JOIN dbo.ParametrosLinea
	ON Ordenes.ppr_name = dbo.ParametrosLinea.PPR
LEFT OUTER JOIN dbo.ParametrosOrdenes
	ON Ordenes.pom_order_id = dbo.ParametrosOrdenes.IdOrden
WHERE Ordenes.pom_order_type_id IN ('Envasado','WO_ENVASADO') AND ParametrosOrdenes.IdSubOrden > 0




GO
/****** Object:  View [dbo].[HighDensityBeerWP_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[HighDensityBeerWP_FAB]
AS
	SELECT ISNULL(ROW_NUMBER() OVER (ORDER BY aux.Beer), 0) ID, aux.*
	FROM (
		SELECT  DefID, LTRIM(SubString(Descript,PATINDEX('%M.F.  A. DENS.%',Descript)+15,Len(Descript))) as Beer
		FROM [SITMesDB].[dbo].[MTMV2_B_DEF]
		WHERE ClassID = 'MOS'
			AND Descript LIKE '%M.F.  A. DENS.%'
	) aux

GO
/****** Object:  View [dbo].[RelHDBeer_HDBeerParametersWP_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[RelHDBeer_HDBeerParametersWP_FAB]
AS
SELECT DISTINCT 
                         hd.ID, hd.Beer, hd.DefID, cob.DefID AS MaterialCod, cob.TipoCerveza, COALESCE (cob.MermaFermentacion, 0) AS MermaFermentacion, 
                         COALESCE (cob.HlPorCoccion, 0) AS HlPorCoccion
FROM            dbo.HighDensityBeerWP_FAB AS hd LEFT OUTER JOIN
                         dbo.COB_MSM_HDBeerParametersForDecantingWP AS cob ON hd.DefID = cob.DefID

GO
/****** Object:  View [dbo].[PPR_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[PPR_FAB]
AS
SELECT        def.DefID, def.Descript, prop.PValue AS item
FROM            SITMesDB.dbo.PDefM_PPR AS ppr INNER JOIN
                         SITMesDB.dbo.MMDefinitions AS def ON ppr.PPR_FinalMaterialId = def.DefID INNER JOIN
                         SITMesDB.dbo.MMwDefVerPrpVals AS prop ON prop.PropertyID = 'Gama' AND prop.DefID = def.DefID
WHERE        (ppr.PPR_TargetOrderLifeCycle = 'MSM')

GO
/****** Object:  View [dbo].[RelPPR_COB_ArticlesParametersFIL]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelPPR_COB_ArticlesParametersFIL]
AS
SELECT DISTINCT cob.ID, ppr.defid, ppr.descript, COALESCE (cob.MermaEnvasado, 0) AS MermaEnvasado
FROM            dbo.PPR_FAB AS ppr LEFT OUTER JOIN
                         dbo.COB_MSM_ArticlesParametersForDecantingFIL AS cob ON cob.DefID = ppr.defid

GO
/****** Object:  View [dbo].[RelPPR_COB_ArticlesParametersPackingLineFIL]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelPPR_COB_ArticlesParametersPackingLineFIL]
AS
SELECT DISTINCT cob.ID, ppr.defid, ppr.descript, COALESCE (cob.MermaEnvasado, 0) AS MermaEnvasado, cob.LineaEnvasado, cob.TotalNecesidadTCP
FROM            dbo.PPR_FAB AS ppr LEFT OUTER JOIN
                         dbo.COB_MSM_ArticlesParametersForPackingLineFIL AS cob ON cob.DefID = ppr.defid

GO
/****** Object:  View [dbo].[HighDensityBeer_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[HighDensityBeer_FAB]
AS
	SELECT ISNULL(ROW_NUMBER() OVER(Order by aux.Beer),0) ID,aux.*
	FROM(SELECT DISTINCT LTRIM(SubString(Descript,PATINDEX('%HIGH DEN. %',Descript)+10,Len(Descript))) Beer,DefID		
		 FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MTMV2_B_DEF]
		 WHERE ClassID = 'CZH') aux


GO
/****** Object:  View [dbo].[RelHDBeer_HDBeerParameters_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

  CREATE view [dbo].[RelHDBeer_HDBeerParameters_FAB]
  as
  select  Distinct hd.*,COB.DefID MaterialCod,BeerType,Coalesce(COB.AVVolumeForDecantingTanqs,0) AVVolumeForDecantingTanqs
  from HighDensityBeer_FAB hd
  LEFT JOIN COB_MSM_HDBeerParametersForDecanting cob on hd.DefID=cob.DefID

GO
/****** Object:  View [dbo].[RelPPR_COB_ArticlesParametersGroupPackingLineFIL]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelPPR_COB_ArticlesParametersGroupPackingLineFIL]
AS
SELECT        LineaEnvasado, SUM(TotalNecesidadTCP) AS TotalNecesidadTCP
FROM            dbo.RelPPR_COB_ArticlesParametersPackingLineFIL
GROUP BY LineaEnvasado

GO
/****** Object:  View [dbo].[LoteUbicacionMaterial_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[LoteUbicacionMaterial_FAB]
AS
SELECT L.LocPK, L.LOCID, L.LocPath, L.ParentLocPK,e.equip_superior Parent, 
CASE WHEN LOTS.LastUpdate IS NULL THEN NULL
ELSE [dbo].[ToLocalDateTime](LOTS.LastUpdate)
END AS LastUpdate,
LOTS.LastUpdate as LastUpdateUTC, ISNULL(EP.[equip_prpty_value],'') AS Descripcion , lots.LotPK, LOTS.InitQuantity, LOTS.Quantity, UOM.UomID, d.DefID, d.Descript, D.DefPK
, C.Descript as ClassDescript, ISNULL(LEXT.SERIAL_NUMBER,'') as serialNumber,  ISNULL(PV.[equip_prpty_value],'') AS PoliticaVaciado
, Lots.LotName as LoteMes,LOTS.CreatedOn
FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLots] LOTS ON LOTS.LocPK = L.LocPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvDefVers] DV ON LOTS.DefVerPK = DV.[DefVerPK]
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvDefinitions] D ON DV.DefPK = D.DefPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvClasses] C ON D.ClassPK = C.ClassPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MESvUoMs] UOM ON UOM.UomPK = LOTS.UomPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT] E ON L.LOCPATH = E.EQUIP_ID --E.[equip_pk] = L.CommonLocPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] EP ON E.[equip_pk] = EP.[equip_pk] AND EP.EQUIP_PRPTY_ID = 'OBJECT-LABEL'
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] PV ON E.[equip_pk] = PV.[equip_pk] AND PV.EQUIP_PRPTY_ID = 'POLITICA_DE_VACIADO'
--INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMLotsCustom] LEXT /*WITH_NOLOCK*/ ON LOTS.LotPK = LEXT.LotPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocTypes] LocT ON LocT.[LocTypePK] = L.[LocTypePK]
WHERE LocT.[LocTypeID] = 'Unit'

GO
/****** Object:  View [dbo].[Ordenes_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[Ordenes_FAB]
AS
SELECT
	pom_order_pk AS Cod_Orden
	,pom_order_id AS ID_Orden
	,note AS Des_Orden
	,matl_def_id AS Cod_Material
	,pom_matl_qty AS Cantidad_Material
	,uom_id AS UOM_Material
	,estimated_start_time AS Tiempo_Inicio_Estimado
	,estimated_start_time AS Tiempo_Inicio_EstimadoUTC
	,estimated_end_time AS Tiempo_Fin_Estimado
	,estimated_end_time AS Tiempo_Fin_EstimadoUTC
	,actual_start_time AS Tiempo_Inicio_Real
	,actual_start_time AS Tiempo_Inicio_RealUTC
	,actual_end_time  AS Tiempo_Fin_Real
	,actual_end_time AS Tiempo_Fin_RealUTC
	,pom_order_type_id AS TipoOrden
	,ppr_name AS EquipoOrden
	,pom_order_status_pk AS IdEstado
	,pom_order_status_id AS Estado
	,SRC_ID as pkLote
FROM [SITMESDB_FAB].SITMesDB.dbo.POMV_ORDR
where pom_order_id LIKE '%FAB%'


GO
/****** Object:  View [dbo].[UbicacionLoteByOrden_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







CREATE VIEW [dbo].[UbicacionLoteByOrden_FAB]
AS
	SELECT LoteMes,InitQuantity,Quantity,LocPK,
LOCID,LocPath,ParentLocPK,Descripcion,
ID_Orden,Tiempo_Inicio_Real,Tiempo_Fin_Real,
Estado,CASE WHEN (ID_Orden like '%FL%' OR ID_Orden like '%PR%') AND Material not like '%Dummy%'  THEN SUBSTRING(Material,0,CHARINDEX('-',Material)) else Material end Cod_Material,pkLote
FROM
(
SELECT LoteMes,InitQuantity,Quantity,LocPK,
LOCID,LocPath,ParentLocPK,Descripcion,
ID_Orden,Tiempo_Inicio_Real,Tiempo_Fin_Real,
Estado,CASE WHEN (ID_Orden like '%FL%' OR ID_Orden like '%PR%') AND Cod_Material not like '%Dummy%'  THEN [dbo].[GetMostoFromEnvasado](Cod_Material,'M.F.  A. DENS.%') else Cod_Material end Material,pkLote
FROM(
--obtengo las op de coc, y fer que están en producción
SELECT distinct lum.LoteMes,lum.InitQuantity,lum.Quantity,lum.LocPK,
lum.LOCID,lum.LocPath,lum.ParentLocPK,lum.Descripcion,
o.ID_Orden,o.Tiempo_Inicio_Real,o.Tiempo_Fin_Real,
o.Estado,o.Cod_Material,o.pkLote
FROM LoteUbicacionMaterial_FAB lum 
INNER JOIN Ordenes_FAB o on o.pkLote = lum.LotPK
WHERE o.Estado <> 'Terminated' and lum.Descripcion <> 'TANQUE-PRELLENADO' and o.ID_Orden not like '%GU%' AND o.Cod_Material not like '%Dummy%'
UNION ALL 
--obtengo las op de coc y fil planificadas	
SELECT '' lote,Cantidad_Material,Cantidad_Material Quantity,0 LocPK,'' LocID,'' LocPath,0 ParentLocPk,'' Descripcion,ID_Orden,Coalesce(Tiempo_Inicio_Real,Tiempo_Inicio_Estimado) inicio,Tiempo_Fin_Real,Estado,
Cod_Material,'' pkLote
FROM Ordenes_FAB 
WHERE Estado = 'Ready'	
UNION ALL
--obtengo lo que hay en los TCP agrupado por artículo
SELECT LoteMes,Quantity,TCPs.TCPQuantity,LocPK,LOCID,LocPath,ParentLocPK,Descripcion,o.ID_Orden,o.Tiempo_Inicio_Real,o.Tiempo_Fin_Real,o.Estado,lum.DefID,o.pkLote
FROM LoteUbicacionMaterial_FAB lum
LEFT JOIN (SELECT Sum(Quantity) TCPQuantity,DefID
			FROM LoteUbicacionMaterial_FAB
			WHERE Descripcion ='TANQUE-PRELLENADO'
			Group by DefID) TCPs on Tcps.DefID=lum.DefID
LEFT JOIN Ordenes_FAB o on o.pkLote=lum.LotPK
WHERE Descripcion ='TANQUE-PRELLENADO' and o.Estado <> 'Terminated'
UNION ALL
--obtengo las op de fil que están en producción	
SELECT distinct lotop.LotID,lum.InitQuantity,lotop.OldQuantity Quantity,lum.LocPK,
lum.LOCID,lum.LocPath,lum.ParentLocPK,lum.Descripcion,
o.ID_Orden,o.Tiempo_Inicio_Real,o.Tiempo_Fin_Real,
o.Estado,SUBSTRING(lotop.Comments,0,CHARINDEX(';',lotop.Comments)) Material,o.pkLote
FROM LoteUbicacionMaterial_FAB lum 
INNER JOIN Ordenes_FAB o on o.pkLote = lum.LotPK
INNER JOIN [SITMESDB_FAB].[SITMesDb].dbo.MTMV2_B_LOT_OP lotop on lotop.LotID like '%'+SUBSTRING(LoteMes,CHARINDEX('_',LoteMes)+4,LEN(LoteMes))
WHERE o.Estado = 'In Progress' and o.ID_Orden like '%FL%' and lotop.Comments <> '' and LotID not like '%Dummy%' and lotop.SourceLotID is null) aux
)aux
UNION ALL
--obtengo las op de gu
SELECT distinct lum.LoteMes,lum.InitQuantity,lum.Quantity,lum.LocPK,
lum.LOCID,lum.LocPath,lum.ParentLocPK,lum.Descripcion,
o.ID_Orden,o.Tiempo_Inicio_Real,o.Tiempo_Fin_Real,
o.Estado,Substring(lotop.Comments,0,CHARINDEX(';',lotop.Comments)),o.pkLote
FROM LoteUbicacionMaterial_FAB lum
INNER JOIN Ordenes_FAB o on o.pkLote = lum.LotPK
INNER JOIN [SITMESDB_FAB].[SITMesDb].dbo.MTMV2_B_LOT_OP lotop on lotop.LotID=lum.LoteMes
WHERE o.ID_Orden like '%GU%' and lotop.SourceLotID is not null and o.Estado <> 'Terminated'


GO
/****** Object:  View [dbo].[EQUIPO_CONSTRUCTIVO]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[EQUIPO_CONSTRUCTIVO]
AS
SELECT
	IdObj
	,ID_EQUIPO_CONSTRUCTIVO
	,ID_MAQUINA
	,NOMBRE
FROM dbo.COB_MSM_EQUIPOS_CONSTRUCTIVOS




GO
/****** Object:  View [dbo].[LlenadorasLineas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[LlenadorasLineas]
AS
SELECT 
Equipos.equip_id AS Id, 
Equipos.equip_name AS Nombre, 
Equipos.equip_label AS Linea, 
Equipos.equip_pk AS PkEquipo,
Lineas.NUM_LINEA AS NumLinea,
Lineas.DESC_LINEA AS DescLinea
FROM     SITMesDB.dbo.BPMV_EQPT AS Equipos INNER JOIN
SITMesDB.dbo.BPMV_EQPT_CLS AS Clases ON Clases.equip_class_pk = Equipos.equip_class_pk AND equip_class_name = 'LLENADORA'
INNER JOIN COB_MSM_LINEAS AS Lineas ON Equipos.equip_superior = Lineas.LINEA
WHERE  
Equipos.equip_in_plant = 1 and Equipos.equip_status = 1


GO
/****** Object:  View [dbo].[MaquinasLineasTodas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO










CREATE VIEW [dbo].[MaquinasLineasTodas]
AS
SELECT
	Lineas.NUM_LINEA AS NumLinea
	,Equipos.equip_id AS Id
	,Equipos.equip_name AS Nombre
	,Clases.equip_class_name AS Clase
	,Equipos.equip_class_pk AS IdClase
	,Equipos.equip_label AS Descripcion
	,Equipos.equip_pk AS PkEquipo
FROM SITMesDB.dbo.BPMV_EQPT AS Equipos
INNER JOIN SITMesDB.dbo.BPMV_EQPT_CLS AS Clases
	ON Clases.equip_class_pk = Equipos.equip_class_pk
INNER JOIN COB_MSM_LINEAS AS Lineas
	ON Equipos.equip_superior = Lineas.LINEA
	OR equipos.equip_superior like '%009'
INNER JOIN [SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] Posicion
	ON Equipos.equip_pk = Posicion.equip_pk
	AND [equip_prpty_id] = 'POSICION'
WHERE Equipos.equip_in_plant = 1 AND Equipos.equip_status = 1
AND (Equipos.equip_class_lvl_pk = 5
OR Equipos.equip_class_lvl_pk = 7)











GO
/****** Object:  View [dbo].[Turnos]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Turnos]
AS
SELECT
	SCH.shc_work_sched_day_pk AS Id
	,REPLACE(LN.id, 'SHC_', '') AS Linea
	,SCH.work_date AS Fecha
	,SCH.work_start AS InicioTurno
	,SCH.work_end AS FinTurno
	,ISNULL(SCH.shc_shift_id, 0) AS IdTipoTurno
	,wt.label AS Turno
	,ROW_NUMBER() OVER (ORDER BY CONVERT(DATETIME, SCH.work_start) ASC) ID_Ordenado_Turno
FROM SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS SCH
INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS LN ON SCH.shc_work_sched_pk = LN.shc_work_sched_pk
INNER JOIN SITMesDB.dbo.SHC_WORKING_TIME WT ON WT.ID = ISNULL(SCH.shc_shift_id, 0)



GO
/****** Object:  View [dbo].[ParosPerdidas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
















CREATE VIEW [dbo].[ParosPerdidas]
AS
--Paros, Perdidas de prod (paros menores), baja velocidad sólo de llenadoras -> Justificado o no (sólo se justifica llenadora) agrupados por hora
SELECT DISTINCT
	Paros.[$IDArchiveValue] AS Id
	,Paros.FK_PAROS_ID AS IdTipoParoPerdida
	,TiposParosPerdidas.DESC_PARO AS TipoParoPerdida
	,LlenadorasLineas.NumLinea AS IdLinea
	,LlenadorasLineas.DescLinea AS DescLinea
	,Paros.SHC_WORK_SCHED_DAY_PK AS Turno
	,T.Fecha AS FechaTurno
	,T.IdTipoTurno
	,T.Turno AS NombreTipoTurno
	,T.FinTurno
	,Paros.INICIO
	,Paros.FIN
	,dbo.ToLocalDateTime(Paros.INICIO) AS InicioLocal
	,dbo.ToLocalDateTime(Paros.FIN) AS FinLocal
	,LlenadorasLineas.Id AS EquipoId
	,LlenadorasLineas.Nombre AS EquipoNombre
	,CAST(EstadosN0.ID_MOTIVO AS VARCHAR) AS MotivoId
	,EstadosN0.DESCRIPCION AS MotivoNombre
	,CAST(EstadosN1.ID_CAUSA AS VARCHAR) AS CausaId
	,EstadosN1.DESCRIPCION AS CausaNombre
	,Paros.JUSTIFICADO AS Justificado
	,Paros.OBSERVACIONES AS Observaciones
	,EquipoCausa.Nombre AS MaquinaCausaId
	,EquipoCausa.Descripcion AS MaquinaCausaNombre
	,CAST(EquiposCons.IdObj AS VARCHAR) AS EquipoConstructivoId
	,EquiposCons.ID_EQUIPO_CONSTRUCTIVO AS EquipoConstructivoMaquinaId
	,EquiposCons.NOMBRE AS EquipoConstructivoNombre	
	,COB_PA.DESCRIPCION AS Descripcion
	,ISNULL(Paros.NUMERO_PAROS_MENORES, 0) AS NumeroParosMenores
	,Paros.DURACION_PAROS_MENORES AS DuracionParosMenores
	,CASE
		WHEN TiposParos.DESC_PARO = 'Paro Mayor' THEN Paros.DURACION
		ELSE 0
	END AS DuracionParoMayor
	,Paros.DURACION_BAJA_VELOCIDAD AS DuracionBajaVelocidad
	,LlenadorasLineas.Linea AS EquipoDescripcion
	--DURACION: En caso de ser Paro Mayor es la duración del mismo y se obtiene de Paros.FIN -Paros.INICIO
	--          En caso de ser Perdida de Producción es la duracion de la misma y se obtiene de Paro.DURACION_BAJA_VELOCIDAD + Paros.DURACION_PAROS_MENORES
	,ISNULL(Paros.DURACION, 0) AS Duracion
	,CASE
		WHEN Paros.DESCRIPCION = '' THEN -1
		ELSE ISNULL(CONVERT(INT, Paros.DESCRIPCION), -1)
	END AS DescripcionId
FROM dbo.COB_MSM_PAROS_PERDIDAS AS Paros
LEFT JOIN COB_MSM_PAROS TiposParos
	ON TiposParos.ID_PARO = PAROS.FK_PAROS_ID
LEFT OUTER JOIN COB_MSM_MOTIVOS_PAROS AS EstadosN0
	ON EstadosN0.ID_MOTIVO = Paros.MOTIVO
LEFT OUTER JOIN COB_MSM_CAUSAS_PAROS AS EstadosN1
	ON EstadosN1.ID_CAUSA = Paros.CAUSA
INNER JOIN LlenadorasLineas
	ON LlenadorasLineas.Id = Paros.MAQUINA
LEFT OUTER JOIN MaquinasLineasTodas AS EquipoCausa
	ON EquipoCausa.Nombre = Paros.MAQUINA_RESPONSABLE
LEFT OUTER JOIN dbo.EQUIPO_CONSTRUCTIVO AS EquiposCons
	ON EquiposCons.IdObj = Paros.EQUIPO_CONSTRUCTIVO
INNER JOIN Turnos AS T
	ON T.Id = Paros.SHC_WORK_SCHED_DAY_PK
INNER JOIN COB_MSM_PAROS AS TiposParosPerdidas
	ON TiposParosPerdidas.ID_PARO = Paros.FK_PAROS_ID
LEFT JOIN COB_MSM_POSIBLE_AVERIA AS COB_PA
	ON COB_PA.ID_POSIBLE_AVERIA = Paros.DESCRIPCION















GO
/****** Object:  View [dbo].[Equipos]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Equipos]
AS
SELECT
	Equipos.equip_id AS Id
	,Equipos.equip_name AS Nombre
	,Equipos.equip_uuid AS IdBD
	,Equipos.equip_superior AS EquipoSuperior
	,Equipos.equip_prnt_pk AS IdEquipoSuperior
	,Equipos.equip_class_lvl_id AS Nivel
	,Equipos.equip_class_lvl_pk AS IdNivel
	,Clases.equip_class_name AS Clase
	,Equipos.equip_class_pk AS IdClase
	,Equipos.equip_status AS Estado
	,Equipos.equip_label AS Descripcion
	,Equipos.equip_pk AS PkEquipo
	,Prop.equip_prpty_value AS Posicion
	,ISNULL(equipment_properties.equip_prpty_value, 'false') AS RechazoManual -- Añadido a la vista
FROM SITMesDB.dbo.BPMV_EQPT AS Equipos
INNER JOIN SITMesDB.dbo.BPMV_EQPT_CLS AS Clases
	ON Clases.equip_class_pk = Equipos.equip_class_pk
INNER JOIN [SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] Prop
	ON Equipos.equip_pk = Prop.equip_pk
	AND [equip_prpty_id] = 'POSICION'
LEFT JOIN [SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] equipment_properties
	ON Equipos.equip_pk = equipment_properties.equip_pk
	AND equipment_properties.equip_prpty_id = 'RECHAZO_MANUAL' -- Añadido a la vista
WHERE (Equipos.equip_in_plant = 1 AND Equipos.equip_status = 1)




GO
/****** Object:  View [dbo].[ParosMayores]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE VIEW [dbo].[ParosMayores]
AS

SELECT
	Paros.[$IDArchiveValue] AS Id
	,Paros.FK_PAROS_ID AS TimeCategory
	,1 AS EsParoMayor
	,0 AS EsParoMenor
	,0 AS EsBajaVelocidad
	,Paros.INICIO AS Inicio
	,Paros.FIN AS Fin
	,e.Id AS EquipoId
	,e.Nombre AS EquipoNombre
	,1 AS CategoriaId
	,'Paro Mayor' AS CategoriaNombre
	,CAST(EstadosN0.ID_MOTIVO AS VARCHAR) AS MotivoId
	,EstadosN0.DESCRIPCION AS MotivoNombre
	,CAST(EstadosN1.ID_CAUSA AS VARCHAR) AS CausaId
	,EstadosN1.DESCRIPCION AS CausaNombre
	,Paros.JUSTIFICADO AS Justificado
	,'' AS ProductoId
	,'' AS Usuario
	,Paros.OBSERVACIONES AS Observaciones
	,'' AS Orden
	,'' AS Lote
	,e2.Id AS MaquinaCausaId
	,e2.Clase AS MaquinaCausaNombre
	,CAST(ec.IdObj AS VARCHAR) AS EquipoConstructivoId
	,ec.NOMBRE AS EquipoConstructivoNombre
	,COB_PA.DESCRIPCION AS Descripcion

FROM dbo.COB_MSM_PAROS_PERDIDAS AS Paros
INNER JOIN COB_MSM_PAROS TiposParos ON TiposParos.ID_PARO = PAROS.FK_PAROS_ID AND TiposParos.DESC_PARO = 'Paro Mayor'
LEFT OUTER JOIN COB_MSM_MOTIVOS_PAROS AS EstadosN0 ON EstadosN0.ID_MOTIVO = Paros.MOTIVO
LEFT OUTER JOIN COB_MSM_CAUSAS_PAROS AS EstadosN1 ON EstadosN1.ID_CAUSA = Paros.CAUSA
INNER JOIN (SELECT
		equip_id AS Id
		,equip_name AS Nombre
		,equip_superior AS Linea
	FROM SITMesDB.dbo.BPMV_EQPT
	WHERE equip_in_plant = 1
	AND equip_class_lvl_pk = 5 AND equip_status = 1) AS e ON e.Id = Paros.MAQUINA
LEFT OUTER JOIN dbo.Equipos AS e2 ON e2.Id = Paros.MAQUINA_RESPONSABLE
LEFT JOIN dbo.EQUIPO_CONSTRUCTIVO AS ec ON ec.IdObj = Paros.EQUIPO_CONSTRUCTIVO
LEFT JOIN COB_MSM_POSIBLE_AVERIA AS COB_PA
	ON COB_PA.ID_POSIBLE_AVERIA = Paros.DESCRIPCION



GO
/****** Object:  View [dbo].[Perdidas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
















CREATE VIEW [dbo].[Perdidas]
AS

SELECT DISTINCT
	Paros.[$IDArchiveValue] AS Id
	,Paros.FK_PAROS_ID AS TimeCategory
	,0 AS EsParoMayor
	,1 AS EsParoMenor
	,1 AS EsBajaVelocidad
	,Paros.INICIO AS Inicio
	,Paros.FIN AS Fin
	,e.Id AS EquipoId
	,e.Nombre AS EquipoNombre
	,2 AS CategoriaId
	,'Perdida' AS CategoriaNombre
	,CAST(EstadosN0.ID_MOTIVO AS VARCHAR) AS MotivoId
	,EstadosN0.DESCRIPCION AS MotivoNombre
	,CAST(EstadosN1.ID_CAUSA AS VARCHAR) AS CausaId
	,EstadosN1.DESCRIPCION AS CausaNombre
	,Paros.JUSTIFICADO AS Justificado
	,'' AS ProductoId
	,'' AS Usuario
	,Paros.OBSERVACIONES AS Observaciones
	,'' AS Orden
	,'' AS Lote
	,CAST(ec.IdObj AS VARCHAR) AS EquipoConstructivoId
	,e2.Id AS MaquinaCausaId
	,e2.Clase AS MaquinaCausaNombre
	,ec.NOMBRE AS EquipoConstructivoNombre
	,COB_PA.DESCRIPCION AS Descripcion
	,Paros.NUMERO_PAROS_MENORES
	,Paros.DURACION_PAROS_MENORES
	,Paros.DURACION_BAJA_VELOCIDAD
	,CASE
		WHEN Paros.DESCRIPCION = '' THEN -1
		ELSE ISNULL(CONVERT(INT, Paros.DESCRIPCION), -1)
	END AS DescripcionId
FROM dbo.COB_MSM_PAROS_PERDIDAS AS Paros
INNER JOIN COB_MSM_PAROS TiposParos ON TiposParos.ID_PARO = PAROS.FK_PAROS_ID AND TiposParos.DESC_PARO = 'Pérdida de producción'
LEFT OUTER JOIN COB_MSM_MOTIVOS_PAROS AS EstadosN0 ON EstadosN0.ID_MOTIVO = Paros.MOTIVO
LEFT OUTER JOIN COB_MSM_CAUSAS_PAROS AS EstadosN1 ON EstadosN1.ID_CAUSA = Paros.CAUSA
INNER JOIN (SELECT
		equip_id AS Id
		,equip_name AS Nombre
		,equip_superior AS Linea
	FROM SITMesDB.dbo.BPMV_EQPT
	WHERE equip_in_plant = 1
	AND equip_class_lvl_pk = 5 AND equip_status = 1) AS e ON e.Id = Paros.MAQUINA
LEFT OUTER JOIN dbo.Equipos AS e2 ON e2.Id = Paros.MAQUINA_RESPONSABLE
LEFT OUTER JOIN dbo.EQUIPO_CONSTRUCTIVO AS ec ON ec.ID_EQUIPO_CONSTRUCTIVO = Paros.EQUIPO_CONSTRUCTIVO
LEFT JOIN COB_MSM_POSIBLE_AVERIA AS COB_PA
	ON COB_PA.ID_POSIBLE_AVERIA = Paros.DESCRIPCION



GO
/****** Object:  View [dbo].[Ordenes_FIL]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Ordenes_FIL]
AS
SELECT        pom_order_pk AS Cod_Orden, pom_order_id AS ID_Orden, note AS Des_Orden, matl_def_id AS Cod_Material, pom_matl_qty AS Cantidad_Material, 
                         uom_id AS UOM_Material, estimated_start_time AS Tiempo_Inicio_Estimado, estimated_start_time AS Tiempo_Inicio_EstimadoUTC, 
                         estimated_end_time AS Tiempo_Fin_Estimado, estimated_end_time AS Tiempo_Fin_EstimadoUTC, actual_start_time AS Tiempo_Inicio_Real, 
                         actual_start_time AS Tiempo_Inicio_RealUTC, actual_end_time AS Tiempo_Fin_Real, actual_end_time AS Tiempo_Fin_RealUTC, pom_order_type_id AS TipoOrden, 
                         ppr_name AS EquipoOrden, pom_order_status_pk AS IdEstado, pom_order_status_id AS Estado, SRC_ID AS pkLote
FROM            SITMESDB_FAB.SITMesDB.dbo.POMV_ORDR AS POMV_ORDR_1
WHERE        (pom_order_type_id = 'FL')

GO
/****** Object:  View [dbo].[Ordenes_FIL_MAT_PLANNED]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Ordenes_FIL_MAT_PLANNED]
AS
SELECT        o.Cod_Orden, o.ID_Orden, o.Des_Orden, o.Cod_Material, o.Cantidad_Material, o.UOM_Material, o.Tiempo_Inicio_Estimado, o.Tiempo_Inicio_EstimadoUTC, 
                         o.Tiempo_Fin_Estimado, o.Tiempo_Fin_EstimadoUTC, o.Tiempo_Inicio_Real, o.Tiempo_Inicio_RealUTC, o.Tiempo_Fin_Real, o.Tiempo_Fin_RealUTC, o.TipoOrden, 
                         o.EquipoOrden, o.IdEstado, o.Estado, o.pkLote, mat.def_id, mat.quantity
FROM            dbo.Ordenes_FIL AS o INNER JOIN
                         SITMesDb.dbo.POMV_MATL_SPEC_ITM AS mat ON mat.pom_order_id = o.ID_Orden AND mat.name = 'PLANNED'

GO
/****** Object:  View [dbo].[Ordenes_FIL_MAT_PRODUCED]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Ordenes_FIL_MAT_PRODUCED]
AS
SELECT        o.Cod_Orden, o.ID_Orden, o.Des_Orden, o.Cod_Material, o.Cantidad_Material, o.UOM_Material, o.Tiempo_Inicio_Estimado, o.Tiempo_Inicio_EstimadoUTC, 
                         o.Tiempo_Fin_Estimado, o.Tiempo_Fin_EstimadoUTC, o.Tiempo_Inicio_Real, o.Tiempo_Inicio_RealUTC, o.Tiempo_Fin_Real, o.Tiempo_Fin_RealUTC, o.TipoOrden, 
                         o.EquipoOrden, o.IdEstado, o.Estado, o.pkLote, mat.def_id, mat.quantity
FROM            dbo.Ordenes_FIL AS o INNER JOIN
                         SITMesDb.dbo.POMV_MATL_SPEC_ITM AS mat ON mat.pom_order_id = o.ID_Orden AND mat.name = 'PRODUCED'

GO
/****** Object:  View [dbo].[Equipo_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO















CREATE VIEW [dbo].[Equipo_FAB]
AS
SELECT
	eq.equip_pk AS [EquipoPK]
	,eq.equip_id AS [ID]
	,eq.equip_prnt_pk AS [CeldaPK]
	,eq.equip_in_plant AS [IsInPlant]
	,eq.equip_name AS [Name]
	,eq.equip_class_lvl_id AS [Level]
	,eqcls.[equip_class_lvl_pk] AS [ClassPK]
	,eqcls.equip_class_id AS [ClassID]
	,module.module_name AS [ModuleName]
	,eqproperty.equip_prpty_value AS ID_ORDEN
	,eqpropertyLang.equip_prpty_value as [Descripcion]
	, tipoU.equip_prpty_value as Tipo_Ubicacion
	, estado.equip_prpty_value as Estado
	, CASE WHEN pos.equip_prpty_value IS NULL THEN NULL
	ELSE CONVERT(INT,pos.equip_prpty_value) END AS Posicion
	, CASE WHEN cmax.equip_prpty_value IS NULL THEN 0
	ELSE CONVERT(INT,cmax.equip_prpty_value) END AS Capacidad_Maxima
FROM SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT as eq
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT_CLS eqcls ON (eq.equip_class_pk = eqcls.equip_class_pk)
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_MODULE module ON (eqcls.module_pk = module.module_pk)
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty ON (eq.equip_pk = eqproperty.equip_pk) AND eqproperty.equip_prpty_id = N'ORDER_ID'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqpropertyLang ON (eq.equip_pk = eqpropertyLang.equip_pk) AND eqpropertyLang.equip_prpty_id = N'OBJECT-LABEL'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY tipoU ON (eq.equip_pk = tipoU.equip_pk) AND tipoU.equip_prpty_id = N'TIPO_UBICACION'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY estado ON (eq.equip_pk = estado.equip_pk) AND estado.equip_prpty_id = N'EQUIPMENT-STATUS'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY pos ON (eq.equip_pk = pos.equip_pk) AND pos.equip_prpty_id = N'POSICION'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY cmax ON (eq.equip_pk = cmax.equip_pk) AND cmax.equip_prpty_id = N'Capacidad_Maxima'
WHERE eq.equip_in_plant = 'true' AND eq.equip_class_lvl_id <> 'Logical-Cell'
AND eq.equip_class_lvl_id <> 'Logical-Unit'
AND eq.equip_id NOT LIKE '%-interface'
AND eqcls.equip_class_lvl_id  = 'Unit'
AND eqcls.equip_class_id NOT LIKE '%ENVASADO%'

GO
/****** Object:  View [dbo].[Procedimiento_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO












CREATE VIEW [dbo].[Procedimiento_FAB]
AS
SELECT Cod_Procedimiento,ID_Procedimiento,
CASE WHEN (CHARINDEX('Transferencia',Des_Procedimiento) <> 0 OR CHARINDEX('Siembra',Des_Procedimiento) <> 0)
THEN CASE WHEN (CHARINDEX('Transferencia',ID_Procedimiento) <> 0) THEN Substring(Des_Procedimiento,0,CHARINDEX('_',Des_Procedimiento)) else Des_Procedimiento end
ELSE Des_Procedimiento 
END Des_Procedimiento,
Cod_Orden,ID_Orden
,ID_Material,Cantidad_Material,ID_Uom,Estado_Procedimiento,Orden_Procedimiento
,ID_Equipo,Des_Equipo,Tiempo_Inicio,Tiempo_InicioUTC,Tiempo_Fin,Tiempo_FinUTC,IDEstado_Procedimiento
FROM
(SELECT pom_entry_pk as Cod_Procedimiento,pom_entry_id as ID_Procedimiento,
CASE WHEN ps_name = 'AuxEntry' 
	THEN 
		CASE WHEN pom_entry_id NOT LIKE 'Entry%' THEN  pom_entry_id ELSE ps_name END
	ELSE ps_name 
END AS Des_Procedimiento
,pom_order_pk as Cod_Orden
,pom_order_id as ID_Orden
,matl_def_id as ID_Material
,pom_matl_qty as Cantidad_Material
,uom_id as ID_Uom
,pom_entry_status_id as Estado_Procedimiento
,sequence as Orden_Procedimiento
, EQ.Name AS ID_Equipo
,EQ.Descripcion as Des_Equipo
,CASE WHEN actual_start_time IS NULL THEN NULL
ELSE [dbo].[ToLocalDateTime](actual_start_time) END AS Tiempo_Inicio
,actual_start_time as Tiempo_InicioUTC
,CASE WHEN actual_end_time IS NULL THEN NULL
ELSE [dbo].[ToLocalDateTime](actual_end_time) END AS Tiempo_Fin
, actual_end_time as Tiempo_FinUTC
,pom_entry_status_pk as IDEstado_Procedimiento
FROM [SITMESDB_FAB].SitMesDB.[dbo].[POMV_ETRY] PR
INNER JOIN [dbo].[Equipo_FAB] EQ ON PR.equip_pk = EQ.EquipoPK) aux

GO
/****** Object:  View [dbo].[EspecificacionMateriales_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[EspecificacionMateriales_FAB]
AS
SELECT        POMV_MATL_SPEC_ITM_1.pom_material_pk AS Cod_POM_Material, POMV_MATL_SPEC_ITM_1.name AS NombreEM, POMV_MATL_SPEC_1.type_str AS TipoEM, 
                         POMV_MATL_SPEC_ITM_1.def_id AS Id_Material, MTMV2_B_DEF_15.Descript AS Descripcion_Material, o.Cod_Orden, 
                         POMV_MATL_SPEC_ITM_1.pom_order_id AS Id_ORDEN, POMV_MATL_SPEC_ITM_1.location_id AS Id_Localizacion, 
                         POMV_MATL_SPEC_ITM_1.actual_qty AS Cantidad_Actual, POMV_MATL_SPEC_ITM_1.quantity AS Cantidad_Estimada, POMV_MATL_SPEC_ITM_1.location_id, 
                         POMV_MATL_SPEC_ITM_1.uom_id AS Unidad_Medida, POMV_MATL_SPEC_ITM_1.actual_def_id AS Id_Material_Actual, 
                         POMV_MATL_SPEC_ITM_1.ACTL_ERP_LOT_ID AS ActualERPLotID, POMV_MATL_SPEC_ITM_1.actual_lot AS Id_Lote, POMV_MATL_SPEC_ITM_1.ALS AS Alias, 
                         POMV_MATL_SPEC_ITM_1.seq AS UniqueNumber, CASE WHEN POMV_MATL_SPEC_ITM_1.RowUpdated IS NULL 
                         THEN POMV_MATL_SPEC_ITM_1.RowUpdated ELSE [dbo].[ToLocalDateTime](POMV_MATL_SPEC_ITM_1.RowUpdated) END AS RowUpdated, 
                         POMV_MATL_SPEC_ITM_1.RowUpdated AS RowUpdatedUTC, CONVERT(VARCHAR(255), POMV_MATL_LST_PRP_VAL.pom_cf_value) AS Equipo_Origen, 
                         POMV_MATL_SPEC_1.pom_entry_id AS Id_POM_ENTRY, POMV_MATL_SPEC_1.pom_entry_pk AS Cod_POM_ENTRY
FROM            SITMesDB.dbo.POMV_MATL_SPEC_ITM AS POMV_MATL_SPEC_ITM_1 INNER JOIN
                         SITMesDB.dbo.POMV_MATL_SPEC AS POMV_MATL_SPEC_1 ON 
                         POMV_MATL_SPEC_1.pom_material_specification_pk = POMV_MATL_SPEC_ITM_1.pom_material_specification_pk LEFT OUTER JOIN
                         SITMesDB.dbo.POMV_MATL_SPEC_ITM_PRP AS POMV_MATL_SPEC_ITM_PRP_4 ON 
                         POMV_MATL_SPEC_ITM_1.pom_material_pk = POMV_MATL_SPEC_ITM_PRP_4.pom_material_list_pk AND 
                         POMV_MATL_SPEC_ITM_PRP_4.pom_custom_fld_name = N'SABsloc' LEFT OUTER JOIN
                         SITMesDB.dbo.POMV_MATL_LST_PRP_VAL AS POMV_MATL_LST_PRP_VAL_6 ON 
                         POMV_MATL_SPEC_ITM_PRP_4.pom_material_list_custom_field_pk = POMV_MATL_LST_PRP_VAL_6.pom_material_list_custom_field_pk LEFT OUTER JOIN
                         SITMesDB.dbo.POMV_MATL_SPEC_ITM_PRP AS POMV_MATL_SPEC_ITM_PRP_10 ON 
                         POMV_MATL_SPEC_ITM_1.pom_material_pk = POMV_MATL_SPEC_ITM_PRP_10.pom_material_list_pk AND 
                         POMV_MATL_SPEC_ITM_PRP_10.pom_custom_fld_name = N'Location' LEFT OUTER JOIN
                         SITMesDB.dbo.POMV_MATL_LST_PRP_VAL AS POMV_MATL_LST_PRP_VAL ON 
                         POMV_MATL_SPEC_ITM_PRP_10.pom_material_list_custom_field_pk = POMV_MATL_LST_PRP_VAL.pom_material_list_custom_field_pk INNER JOIN
                         SITMesDB.dbo.MTMV2_B_DEF AS MTMV2_B_DEF_15 ON POMV_MATL_SPEC_ITM_1.def_id = MTMV2_B_DEF_15.DefID INNER JOIN
                         dbo.Ordenes_FAB AS o ON o.ID_Orden = POMV_MATL_SPEC_ITM_1.pom_order_id

GO
/****** Object:  View [dbo].[Planta_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Planta_FAB]
AS
SELECT 
	eq.equip_pk AS [PlantaPK]
	,eq.equip_id AS [ID]
	,eq.equip_in_plant AS [IsInPlant]
	,eq.equip_name AS [Name]
	,eq.equip_class_lvl_id AS [Level]
	,eqcls.[equip_class_lvl_pk] AS [ClassPK]
	,eqcls.equip_class_id AS [ClassID]
	,module.module_name AS [ModuleName]
	,eqproperty.equip_prpty_value AS [C_External-IDSloc]
FROM SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT as eq
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT_CLS eqcls ON (eq.equip_class_pk = eqcls.equip_class_pk)
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_MODULE module ON (eqcls.module_pk = module.module_pk)
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty ON (eq.equip_pk = eqproperty.equip_pk) AND eqproperty.equip_prpty_id = N'C_External-ID'
WHERE eq.equip_in_plant = 'true' AND eq.equip_class_lvl_id <> 'Logical-Cell'
AND eq.equip_class_lvl_id <> 'Logical-Unit'
AND eq.equip_id NOT LIKE '%-interface'
AND eqcls.equip_class_lvl_id = 'Site'

GO
/****** Object:  View [dbo].[TipoOrden_Fab]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[TipoOrden_Fab]
AS
SELECT	pom_order_type_pk as Cod_TipoOrden, id as Des_TipoOrden,ordersName.Area
FROM [SITMESDB_FAB].[SITMesDB].dbo.POMV_ORDR_TPY orders
INNER JOIN (select Distinct TYP,SUBSTRING(SUBSTRING(PPR,CHARINDEX('.',PPR)+1,len(PPR)),0,CHARINDEX('.',SUBSTRING(PPR,CHARINDEX('.',PPR)+1,len(PPR)))) Area
		   from [SITMESDB_FAB].[SITMesDB].dbo.PDefM_PPR pdefm
		   INNER JOIN Planta_FAB p on pdefm.PPR like p.NAME+'.%') ordersName ON orders.id = ordersName.TYP
WHERE id NOT LIKE 'WO%'


GO
/****** Object:  View [dbo].[PlanningDecanting_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[PlanningDecanting_FAB]
as
select o.*,e.equip_long_name
from Ordenes_FAB o
left join [SITMESDB_FAB].SITMesDb.dbo.POMV_EXE_EQPT e on e.pom_order_id = o.ID_Orden
where Estado = 'Ready' AND TipoOrden = 'TR' and  e.srt_num = 2

GO
/****** Object:  View [dbo].[MaquinasZonas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[MaquinasZonas]
AS
SELECT
	Zonas.equip_pk AS PkEquipo
	,COBZonas.ID_ZONA AS Zona
FROM SITMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS Zonas
INNER JOIN dbo.COB_MSM_ZONAS AS COBZonas
	ON COBZonas.ID_ZONA = Zonas.equip_prpty_value
WHERE (Zonas.equip_prpty_id = 'ZONA_ID')



GO
/****** Object:  View [dbo].[EstadoActualMaquinas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[EstadoActualMaquinas]
AS
SELECT DISTINCT
               EstadoActMaquinas.StartTime AS FecInicio
               ,EqPPA.EquipmentName AS IdMaquina
               ,EstadoActMaquinas.Level0 AS Estado
               ,dbo.Equipos.EquipoSuperior AS Linea
               ,dbo.MaquinasZonas.Zona
FROM dbo.OEEDTMTable AS EstadoActMaquinas
INNER JOIN PPA.dbo.Equipment_Extension_Link  AS versiones
               ON versiones.PPAObjectId = EstadoActMaquinas.EqID
INNER JOIN [PPA].[dbo].[version_history] AS VH ON VH.is_current = 1 AND versiones.VersionID = VH.version_id
INNER JOIN PPA.dbo.Equipment AS EqPPA
               ON EqPPA.EquipmentId = versiones.EqID
INNER JOIN dbo.Equipos
               ON EqPPA.EquipmentName = dbo.Equipos.Nombre
INNER JOIN dbo.MaquinasZonas
               ON dbo.MaquinasZonas.PkEquipo = dbo.Equipos.PkEquipo
WHERE (EstadoActMaquinas.EndTime IS NULL)

GO
/****** Object:  View [dbo].[MaquinasOrdenes]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[MaquinasOrdenes]
AS
SELECT
	equip_pk AS PkEquipo
	,equip_prpty_value AS Orden
	,RowUpdated AS FecHorAct
FROM SITMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS Ordenes
WHERE (equip_prpty_id = 'ORDER_ID')
AND (equip_prpty_value <> '')


GO
/****** Object:  View [dbo].[Maquinas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[Maquinas]
AS
SELECT
	Maquinas.PkEquipo
	,Maquinas.Id
	,Maquinas.Nombre
	,Maquinas.IdBD
	,Maquinas.EquipoSuperior AS Linea
	,Maquinas.IdEquipoSuperior AS IdLinea
	,Maquinas.Nivel
	,Maquinas.IdNivel
	,Maquinas.Clase
	,Maquinas.IdClase
	,Maquinas.Descripcion
	,dbo.MaquinasZonas.Zona
	,dbo.MaquinasOrdenes.Orden
	,dbo.MaquinasOrdenes.FecHorAct AS FecHorActOrden
	,ISNULL(dbo.EstadoActualMaquinas.Estado, 0) AS Estado
	,CAST(Maquinas.Posicion AS INT) AS Posicion
	,Maquinas.RechazoManual AS RechazoManual
	, -- Añadido a la vista
	CASE
		WHEN CONVERT(INT, Maquinas.POSICION) < CONVERT(INT, (SELECT
					MIN(CONVERT(INT, POSICION))
				FROM Equipos
				WHERE Clase = 'LLENADORA'
				AND EquipoSuperior = Maquinas.EquipoSuperior)
			) THEN 1
		ELSE 0
	END AS MENOR_LLENADORA
FROM dbo.Equipos AS Maquinas
INNER JOIN dbo.MaquinasZonas
	ON Maquinas.PkEquipo = dbo.MaquinasZonas.PkEquipo
LEFT OUTER JOIN dbo.MaquinasOrdenes
	ON Maquinas.PkEquipo = dbo.MaquinasOrdenes.PkEquipo
LEFT OUTER JOIN dbo.EstadoActualMaquinas
	ON Maquinas.Nombre = dbo.EstadoActualMaquinas.IdMaquina
WHERE (Maquinas.IdNivel = 5)


GO
/****** Object:  View [dbo].[PRODUCCION_ORDEN_TURNO]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[PRODUCCION_ORDEN_TURNO]
AS
SELECT
	CONVERT(DATE, MIN(FECHA_INICIO)) AS FECHA
	,MIN([FECHA_INICIO]) AS INICIO
	,MAX([FECHA_FIN]) AS FIN
	,ID_ORDEN AS Orden
	,[SHC_WORK_SCHED_DAY_PK] AS IdTurno
	,SUM(TIEMPO_NETO) AS TIEMPO_NETO
	,SUM(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
	,SUM(TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
	,SUM(VELOCIDAD_NOMINAL) AS VELNOMINAL
	,SUM(Consolidacion.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
	,SUM(Consolidacion.Contador_Rechazos) AS ENVASES_RECHAZADOS
	,SUM(TotalPalets) AS ENVASES_PALETIZADORA
	,CASE
		WHEN SUM(Velocidad_NOMINAL) = 0 THEN 0
		ELSE (SUM(Consolidacion.CONTADOR_PRODUCCION) / SUM(VELOCIDAD_NOMINAL) * 100)
	END AS 'Rendimiento_Mecanico'
	,CASE
		WHEN SUM([TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM([TIEMPO_OPERATIVO]) / SUM([TIEMPO_PLANIFICADO])) * 100)
	END AS Disponibilidad
	,CASE
		WHEN SUM(TIEMPO_OPERATIVO) = 0 THEN 0
		ELSE ((SUM(TIEMPO_NETO) / SUM(TIEMPO_OPERATIVO)) * 100)
	END AS Eficiencia
	,CASE
		WHEN SUM(TIEMPO_OPERATIVO) = 0 OR
			SUM([TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM([TIEMPO_OPERATIVO]) / SUM([TIEMPO_PLANIFICADO])) * (SUM([TIEMPO_NETO]) / SUM([TIEMPO_OPERATIVO])) * 1.0) * 100.0
	END AS OEE
	,SUM(Paleteras.TotalPalets) AS TotalPalets
	,MIN(M.Linea) AS LINEA
FROM COB_MSM_PROD_LLENADORA_HORA AS Consolidacion
INNER JOIN Turnos ON Consolidacion.[SHC_WORK_SCHED_DAY_PK] = Turnos.Id
INNER JOIN Maquinas M ON Consolidacion.ID_MAQUINA = M.Id
LEFT JOIN (SELECT
		[SHC_WORK_SCHED_DAY_PK] AS IdTurno
		,[HORA] AS Hora
		,SUM(CONTADOR_PRODUCCION) AS TotalPalets
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	WHERE ID_MAQUINA LIKE '%-EQ-PAL-%'
	AND SHC_WORK_SCHED_DAY_PK <> 0
	GROUP BY [SHC_WORK_SCHED_DAY_PK],[HORA]) Paleteras ON Paleteras.Hora = Consolidacion.HORA AND Paleteras.IdTurno = Consolidacion.SHC_WORK_SCHED_DAY_PK
GROUP BY [SHC_WORK_SCHED_DAY_PK],Consolidacion.ID_ORDEN


GO
/****** Object:  View [dbo].[ProduccionTurnosConsolidada]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[ProduccionTurnosConsolidada]
AS


SELECT
	CONVERT(DATE, MIN(Consolidacion.FECHA_INICIO)) AS FECHA
	,MIN(Consolidacion.[FECHA_INICIO]) AS INICIO
	,MAX(Consolidacion.[FECHA_FIN]) AS FIN
	,Consolidacion.[SHC_WORK_SCHED_DAY_PK] AS Turno
	,SUM(Consolidacion.TIEMPO_NETO) AS TIEMPO_NETO
	,SUM(Consolidacion.TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
	,SUM(Consolidacion.TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
	,SUM(Consolidacion.VELOCIDAD_NOMINAL) AS VELNOMINAL
	,SUM(Consolidacion.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
	,SUM(Consolidacion.Contador_Rechazos) AS ENVASES_RECHAZADOS
	,SUM(PAL.CONTADOR_PRODUCCION) AS ENVASES_PALETIZADORA
	,CASE
		WHEN m.[MENOR_LLENADORA] = 1 THEN ISNULL(SUM(ISNULL(PAL.CONTADOR_RECHAZOS, 0)), 0)
		ELSE 0
	END AS 'ENVASES_VACIOS_RECHAZADOS'
	,CASE
		WHEN m.[MENOR_LLENADORA] = 0 THEN ISNULL(ISNULL(SUM(ISNULL(PAL.CONTADOR_RECHAZOS, 0)), 0) + SUM(Consolidacion.Contador_Rechazos), 0)
		ELSE 0
	END AS 'ENVASES_LLENOS_RECHAZADOS'
	,ISNULL(SUM(ISNULL(PAL.CONTADOR_RECHAZOS, 0)), 0) AS RECHAZOS_RESTO
	,CASE
		WHEN SUM(Consolidacion.Velocidad_NOMINAL) = 0 THEN 0
		ELSE (SUM(Consolidacion.CONTADOR_PRODUCCION) / SUM(Consolidacion.VELOCIDAD_NOMINAL) * 100)
	END AS 'Rendimiento_Mecanico'
	,CASE
		WHEN SUM(Consolidacion.[TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM(Consolidacion.[TIEMPO_OPERATIVO]) / SUM(Consolidacion.[TIEMPO_PLANIFICADO])) * 100)
	END AS Disponibilidad
	,CASE
		WHEN SUM(Consolidacion.TIEMPO_OPERATIVO) = 0 THEN 0
		ELSE ((SUM(Consolidacion.TIEMPO_NETO) / SUM(Consolidacion.TIEMPO_OPERATIVO)) * 100)
	END AS Eficiencia
	,CASE
		WHEN SUM(Consolidacion.TIEMPO_OPERATIVO) = 0 OR
			SUM(Consolidacion.[TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM(Consolidacion.[TIEMPO_OPERATIVO]) / SUM(Consolidacion.[TIEMPO_PLANIFICADO])) * (SUM(Consolidacion.[TIEMPO_NETO]) / SUM(Consolidacion.[TIEMPO_OPERATIVO])) * 1.0) * 100.0
	END AS OEE
	,SUM(PAL.CONTADOR_PRODUCCION) AS TotalPalets
	,MIN(M.Linea) AS LINEA
	,1 AS CALIDAD
FROM COB_MSM_PROD_LLENADORA_HORA AS Consolidacion
INNER JOIN Turnos ON Consolidacion.[SHC_WORK_SCHED_DAY_PK] = Turnos.Id
INNER JOIN Maquinas M ON Consolidacion.ID_MAQUINA = M.Id
LEFT JOIN COB_MSM_PROD_RESTO_MAQ_HORA PAL ON PAL.HORA = Consolidacion.HORA  AND PAL.SHC_WORK_SCHED_DAY_PK = Consolidacion.SHC_WORK_SCHED_DAY_PK
INNER JOIN DBO.Maquinas M2 ON PAL.ID_MAQUINA = M2.Id AND M2.Clase = 'PALETIZADORA'
WHERE ISNULL(Consolidacion.ID_ORDEN,'') != ''
GROUP BY Consolidacion.SHC_WORK_SCHED_DAY_PK,m.MENOR_LLENADORA



GO
/****** Object:  View [dbo].[Picos]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Picos]
AS

SELECT
	Picos.[$IDArchiveValue] AS IdPico
	,Picos.ID_ORDEN AS IdOrden
	,Picos.ID_PARTICION AS IdParticion
	,Picos.Cantidad
	,Picos.SHC_WORK_SCHED_DAY_PK AS IdTurno
	,dbo.Turnos.Fecha AS FechaTurno
	,dbo.Turnos.IdTipoTurno AS TipoTurno
FROM dbo.COB_MSM_PICOS_PROD AS Picos
INNER JOIN dbo.Turnos ON dbo.Turnos.Id = Picos.SHC_WORK_SCHED_DAY_PK


GO
/****** Object:  View [dbo].[ProduccionHoras]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO











CREATE VIEW [dbo].[ProduccionHoras]
AS


SELECT
	CONVERT(DATE, MIN(FECHA_INICIO)) AS FECHA
	,MIN([FECHA_INICIO]) AS INICIO
	,MAX([FECHA_FIN]) AS FIN
	,[SHC_WORK_SCHED_DAY_PK] AS IdTurno
	,Consolidacion.[HORA] AS Hora
	,SUM(TIEMPO_NETO) AS TIEMPO_NETO
	,SUM(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
	,SUM(TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
	,SUM(VELOCIDAD_NOMINAL) AS VELNOMINAL
	,SUM(Consolidacion.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
	,SUM(Consolidacion.Contador_Rechazos) AS ENVASES_RECHAZADOS
	,SUM(TotalPalets) AS ENVASES_PALETIZADORA
	,SUM(RechazosResto) AS RECHAZOS_PALETIZADORA
	,CASE
		WHEN MAX(M.MENOR_LLENADORA) = 1 THEN SUM(RechazosResto)
		ELSE 0
	END AS ENVASES_VACIOS_RECHAZADOS
	,CASE
		WHEN MIN(M.MENOR_LLENADORA) = 0 THEN SUM(RechazosResto) + SUM(Consolidacion.Contador_Rechazos)
		ELSE 0
	END AS ENVASES_LLENOS_RECHAZADOS
	,CASE
		WHEN SUM(Velocidad_NOMINAL) = 0 THEN 0
		ELSE (SUM(Consolidacion.CONTADOR_PRODUCCION) / SUM(VELOCIDAD_NOMINAL) * 100)
	END AS 'Rendimiento_Mecanico'
	,CASE
		WHEN SUM([TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM([TIEMPO_OPERATIVO]) / SUM([TIEMPO_PLANIFICADO])) * 100)
	END AS Disponibilidad
	,CASE
		WHEN SUM(TIEMPO_OPERATIVO) = 0 THEN 0
		ELSE ((SUM(TIEMPO_NETO) / SUM(TIEMPO_OPERATIVO)) * 100)
	END AS Eficiencia
	,CASE
		WHEN SUM(TIEMPO_OPERATIVO) = 0 OR
			SUM([TIEMPO_PLANIFICADO]) = 0 THEN 0
		ELSE ((SUM([TIEMPO_OPERATIVO]) / SUM([TIEMPO_PLANIFICADO])) * (SUM([TIEMPO_NETO]) / SUM([TIEMPO_OPERATIVO])) * 1.0) * 100.0
	END AS OEE
	,SUM(Paleteras.TotalPalets) AS TotalPalets
	,MIN(M.Linea) AS LINEA
FROM COB_MSM_PROD_LLENADORA_HORA AS Consolidacion
INNER JOIN Turnos ON Consolidacion.[SHC_WORK_SCHED_DAY_PK] = Turnos.Id
INNER JOIN Maquinas M ON Consolidacion.ID_MAQUINA = M.Id
LEFT JOIN (SELECT
		[SHC_WORK_SCHED_DAY_PK] AS IdTurno
		,[HORA] AS Hora
		,SUM(CONTADOR_PRODUCCION) AS TotalPalets
		,SUM(CONTADOR_RECHAZOS) AS RechazosResto
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	WHERE SHC_WORK_SCHED_DAY_PK <> 0 AND ISNULL(Consolidacion.ID_ORDEN,'') != ''
	GROUP BY [SHC_WORK_SCHED_DAY_PK],[HORA]) Paleteras ON Paleteras.Hora = Consolidacion.HORA
	AND Paleteras.IdTurno = Consolidacion.SHC_WORK_SCHED_DAY_PK
WHERE ISNULL(Consolidacion.ID_ORDEN,'') != ''
GROUP BY [SHC_WORK_SCHED_DAY_PK],Consolidacion.[HORA]



GO
/****** Object:  View [dbo].[Materiales]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






/*WHERE  (Materiales.IsCurrent = 1)*/
CREATE VIEW [dbo].[Materiales]
AS
SELECT
	Materiales.DefID AS IdMaterial
	,Materiales.DefName AS Nombre
	,Materiales.Descript AS Descripcion
	,Materiales.ClassID AS IdClase
	,Clases.Descript AS Clase
	,Materiales.VLabel AS Version
	,Materiales.DefStatusID AS Status
	,Materiales.UomID AS UdMedida
	,Materiales.EffectiveFrom AS F_EfectivoDesde
	,Materiales.EffectiveTill AS F_EfectivoHasta
	,Materiales.IsCurrent AS EnUso
	,Materiales.CreatedBy AS Autor
	,Materiales.CreatedOn AS FechaCreacion
	,Materiales.LastUpdate AS FechaUltCreacion
	,Materiales.LastUser AS ModificadoPor
	,Materiales.AdditionalInfo AS InfoAdicional
	,Materiales.TypeID AS Tipo
	,MTypes.TypeCD AS DescTipo
	,Materiales.LotUomID AS IdLote
	,Gamas_1.PValue AS Gama
	,Marcas_1.PValue AS Marca
	,TiposEnvase_1.PValue AS TipoEnvase
	,Materiales.DefVerPK
FROM SITMesDB.dbo.MMwDefVers AS Materiales
LEFT OUTER JOIN SITMesDB.dbo.MMvClasses AS Clases ON Materiales.ClassID = Clases.ClassID
LEFT OUTER JOIN (SELECT
		DefVerPK
		,PValue
	FROM SITMesDB.dbo.MMvDefVerPrpVals AS Gamas
	WHERE (PropertyPK = dbo.GetPkParametroMaterial('Gama'))) AS Gamas_1 ON Gamas_1.DefVerPK = Materiales.DefVerPK
LEFT OUTER JOIN (SELECT
		DefVerPK
		,PValue
	FROM SITMesDB.dbo.MMvDefVerPrpVals AS Marcas
	WHERE (PropertyPK = dbo.GetPkParametroMaterial('Marca'))) AS Marcas_1 ON Marcas_1.DefVerPK = Materiales.DefVerPK
LEFT OUTER JOIN (SELECT
		DefVerPK
		,PValue
	FROM SITMesDB.dbo.MMvDefVerPrpVals AS TiposEnvase
	WHERE (PropertyPK = dbo.GetPkParametroMaterial('Tipo_Envase'))) AS TiposEnvase_1 ON TiposEnvase_1.DefVerPK = Materiales.DefVerPK
LEFT OUTER JOIN SITMesDB.dbo.MMTypes AS MTypes ON MTypes.TypeID = Materiales.TypeID
--WHERE        (Materiales.DefStatusID = 'APPROVED')

GO
/****** Object:  View [dbo].[Productos]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Productos]
AS
SELECT
	IdMaterial AS IdProducto
	,Nombre
	,Descripcion
	,IdClase
	,Clase
	,Version
	,Status
	,UdMedida
	,F_EfectivoDesde
	,F_EfectivoHasta
	,EnUso
	,Autor
	,FechaCreacion
	,FechaUltCreacion
	,ModificadoPor
	,InfoAdicional
	,Tipo
	,IdLote
	,Gama
	,Marca
	,TipoEnvase
FROM dbo.Materiales
WHERE (Tipo = '03')
AND (UdMedida = 'PL'
OR UdMedida = 'MD')
AND Status = 'APPROVED'



GO
/****** Object:  View [dbo].[TiemposCambio]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[TiemposCambio]
AS
SELECT
	TiemposCambio.[$IDArchiveValue] AS IdTiempoCambio
	,Lineas.LINEA
	,TiemposCambio.ID_PRODUCTO_ENTRANTE AS IdProductoEntrante
	,ProdEnt.Descripcion AS ProductoEntrante
	,TiemposCambio.ID_PRODUCTO_SALIENTE AS IdProductoSaliente
	,ProdSal.Descripcion AS ProductoSaliente
	,TiemposCambio.TIEMPO_OBJETIVO_1 AS Tobj1
	,ProdEnt.Descripcion
	,TiemposCambio.TIEMPO_OBJETIVO_2 AS Tobj2
	,TiemposCambio.TIEMPO_CALCULADO_1 AS Tm
	,TiemposCambio.TIEMPO_CALCULADO_2
	,TiemposCambio.TIEMPO_PREACTOR
FROM dbo.COB_MSM_TIEMPOS_CAMBIOS AS TiemposCambio
INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.ID_LINEA = TiemposCambio.FK_LINEAS_ID
INNER JOIN dbo.Productos AS ProdEnt ON TRY_CAST(ProdEnt.IdProducto AS INT) = TiemposCambio.ID_PRODUCTO_ENTRANTE
INNER JOIN dbo.Productos AS ProdSal ON TRY_CAST(ProdSal.IdProducto AS INT) = TiemposCambio.ID_PRODUCTO_SALIENTE
WHERE (ISNUMERIC(ProdEnt.IdProducto) = 1)
AND (ISNUMERIC(ProdSal.IdProducto) = 1)




GO
/****** Object:  View [dbo].[OrdenesCambio]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO








CREATE VIEW [dbo].[OrdenesCambio]
AS


SELECT        
	Ordenes.pom_order_id AS Id,
	Lineas.LINEA as IdLinea, 
	Lineas.NUM_LINEA AS Linea, 
	Lineas.DESC_LINEA AS DescripcionLinea, 
	dbo.ToLocalDateTime(Ordenes.actual_start_time) AS InicioReal, 
	Ordenes.actual_start_time as InicioUTC,
	Turno.shc_working_time_id AS TipoTurnoId, 
	Turno.descript AS TipoTurno, 
	Turno.work_date AS FechaTurno,
	OrdenSaliente.Orden as OrdenSaliente,
	ProdSal.IdProducto as IDProductoSaliente,
	ProdSal.Nombre AS ProductoSaliente,
	OrdenEntrante.Orden as OrdenEntrante,
	ProdEnt.IdProducto as IDProductoEntrante,
	ProdEnt.Nombre AS ProductoEntrante, 
	CASE WHEN CONVERT(FLOAT,TIEMPO1.Tiempo) <= 0 THEN 0
	ELSE CONVERT(INT,ISNULL(CONVERT(FLOAT,TIEMPO1.Tiempo)/60,0)) END AS MinutosFinal1,
	CASE WHEN CONVERT(FLOAT,TIEMPO2.Tiempo) <= 0 THEN 0
	ELSE CONVERT(INT,ISNULL(CONVERT(FLOAT,TIEMPO2.Tiempo)/60,0)) END AS MinutosFinal2,
	ISNULL(CONVERT(INT, TiempoObjetivoLle.MinutosObjetivo1), 0) AS MinutosObjetivo1,
	ISNULL(CONVERT(INT, TiempoObjetivoPal.MinutosObjetivo2), 0) AS MinutosObjetivo2,
	--tiemposCambio.TIEMPO_OBJETIVO_1 AS MinutosObjetivo1, 
	--tiemposCambio.TIEMPO_OBJETIVO_2 AS MinutosObjetivo2,
	tiemposCambio.[$IDArchiveValue] as ID_CAMBIO,
	Ordenes.pom_order_status_id AS EstadoAct
FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS Calendar ON Calendar.id = Ordenes.equip_long_name 
INNER JOIN SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS Turno ON Turno.shc_work_sched_pk = Calendar.shc_work_sched_pk AND Turno.work_start <= Ordenes.actual_start_time AND Turno.work_end > Ordenes.actual_start_time 
LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
			WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdSal ON ProdSal.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
			INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
			WHERE pom_custom_fld_name = 'CMB_MATERIAL_2') AS ProdEnt ON ProdEnt.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Tiempo,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OC%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Tiempo,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
			WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OC%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id

LEFT JOIN (SELECT VAL as MinutosObjetivo1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_LLE' AND pom_order_id like '%OC%') AS TiempoObjetivoLle ON TiempoObjetivoLle.pom_order_id = Ordenes.pom_order_id

LEFT JOIN (SELECT VAL as MinutosObjetivo2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_PAL' AND pom_order_id like '%OC%') AS TiempoObjetivoPal ON TiempoObjetivoPal.pom_order_id = Ordenes.pom_order_id

LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'CMB_WO_1') AS OrdenSaliente ON OrdenSaliente.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
			WHERE pom_custom_fld_name = 'CMB_WO_2') AS OrdenEntrante ON OrdenEntrante.pom_order_id = Ordenes.pom_order_id
LEFT JOIN dbo.COB_MSM_TIEMPOS_CAMBIOS AS tiemposCambio ON tiemposCambio.ID_PRODUCTO_ENTRANTE = ProdEnt.IdProducto AND tiemposCambio.ID_PRODUCTO_SALIENTE = ProdSal.IdProducto AND tiemposCambio.FK_LINEAS_ID = Lineas.ID_LINEA
WHERE  (Ordenes.pom_order_type_id IN ('WO_ENV_CMB','WO_ENVASADO_CAMBIO')) 







GO
/****** Object:  View [dbo].[OrdenesArranque]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO








CREATE VIEW [dbo].[OrdenesArranque]
AS



SELECT        
	Ordenes.pom_order_id AS Id,
	Lineas.LINEA as IdLinea, 
	Lineas.NUM_LINEA AS Linea, 
	Lineas.DESC_LINEA AS DescripcionLinea, 
	dbo.ToLocalDateTime(Ordenes.actual_start_time) AS InicioReal, 
	Ordenes.actual_start_time as InicioUTC,
	Turno.shc_working_time_id AS TipoTurnoId, 
	Turno.descript AS TipoTurno, 
	Turno.work_date AS FechaTurno,
	OrdenArr.Orden as OrdenEntrante,
	ProdArr.IdProducto as IDProductoEntrante,
	ProdArr.Nombre as ProductoEntrante, 
	CASE WHEN CONVERT(INT,TIEMPO1.Tiempo) <=0 THEN 0 ELSE ISNULL(CONVERT(INT,CONVERT(FLOAT, Tiempo1.Tiempo)/60),0) END as MinutosFinal1,
	CASE WHEN CONVERT(INT,TIEMPO2.Tiempo) <=0 THEN 0 ELSE ISNULL(CONVERT(INT,CONVERT(FLOAT, Tiempo2.Tiempo)/60),0) END as MinutosFinal2,
	--ISNULL(tiemposArranque.TIEMPO_OBJETIVO_1,0) AS MinutosObjetivo1, 
	--ISNULL(tiemposArranque.TIEMPO_OBJETIVO_2,0) AS MinutosObjetivo2, 
	ISNULL(CONVERT(INT, TiempoObjetivoLle.MinutosObjetivo1), 0) AS MinutosObjetivo1,
	ISNULL(CONVERT(INT, TiempoObjetivoPal.MinutosObjetivo2), 0) AS MinutosObjetivo2,
	ISNULL(CONVERT(INT,TB.VAL),0) AS TipoArranque,
	tiemposArranque.[$IDArchiveValue] AS ID_ARRANQUE,
	Ordenes.pom_order_status_id AS EstadoAct
FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS Calendar ON Calendar.id = Ordenes.equip_long_name 
INNER JOIN ( SELECT VAL, pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'ARRANQUE_ID') TB ON TB.pom_order_id = Ordenes.pom_order_id
LEFT JOIN SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS Turno ON Turno.shc_work_sched_pk = Calendar.shc_work_sched_pk AND Turno.work_start <= Ordenes.actual_start_time AND Turno.work_end > Ordenes.actual_start_time 
LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
			WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdArr ON ProdArr.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Tiempo,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OA%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Tiempo,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
			WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OA%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id

LEFT JOIN (SELECT VAL as MinutosObjetivo1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_LLE' AND pom_order_id like '%OA%') AS TiempoObjetivoLle ON TiempoObjetivoLle.pom_order_id = Ordenes.pom_order_id

LEFT JOIN (SELECT VAL as MinutosObjetivo2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_PAL' AND pom_order_id like '%OA%') AS TiempoObjetivoPal ON TiempoObjetivoPal.pom_order_id = Ordenes.pom_order_id
LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
			WHERE pom_custom_fld_name = 'CMB_WO_1') AS OrdenArr ON OrdenArr.pom_order_id = Ordenes.pom_order_id
LEFT JOIN dbo.COB_MSM_TIEMPOS_ARRANQUES AS tiemposArranque ON tiemposArranque.ID_PRODUCTO_ENTRANTE = ProdArr.IdProducto AND tiemposArranque.FK_LINEAS_ID = Lineas.ID_LINEA AND tiemposArranque.FK_ARRANQUES_ID = CONVERT(INT,TB.VAL)






GO
/****** Object:  View [dbo].[TIPOS_ARRANQUE]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[TIPOS_ARRANQUE]
AS
SELECT        ID_ARRANQUE, DESC_ARRANQUE, IdObj
FROM            dbo.COB_MSM_ARRANQUES

GO
/****** Object:  View [dbo].[TiemposArranque]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[TiemposArranque]
AS
SELECT
	TiemposArranque.[$IDArchiveValue] AS IdTiempoArranque
	,Lineas.LINEA
	,TiemposArranque.ID_PRODUCTO_ENTRANTE AS IdProductoEntrante
	,ProdEnt.Descripcion AS ProductoEntrante
	,TiemposArranque.FK_ARRANQUES_ID AS TipoArranque
	,TiemposArranque.TIEMPO_OBJETIVO_1 AS Tobj1
	,ProdEnt.Descripcion
	,TiemposArranque.TIEMPO_OBJETIVO_2 AS Tobj2
	,TiemposArranque.TIEMPO_CALCULADO_1 AS Tm
	,TIEMPO_CALCULADO_2
	,TIEMPO_PREACTOR
	,TA.DESC_ARRANQUE AS DescArranque
FROM dbo.COB_MSM_TIEMPOS_ARRANQUES AS TiemposArranque
INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.ID_LINEA = TiemposArranque.FK_LINEAS_ID
INNER JOIN dbo.Productos AS ProdEnt ON CAST(ProdEnt.IdProducto AS INT) = TiemposArranque.ID_PRODUCTO_ENTRANTE
INNER JOIN [dbo].[TIPOS_ARRANQUE] TA ON TA.ID_ARRANQUE = TiemposArranque.FK_ARRANQUES_ID
WHERE (ISNUMERIC(ProdEnt.IdProducto) = 1)





GO
/****** Object:  View [dbo].[MaquinasLogicasComunes]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[MaquinasLogicasComunes]
AS
SELECT
	Maquinas.PkEquipo
	,Maquinas.Id
	,Maquinas.Nombre
	,Maquinas.IdBD
	,Maquinas.EquipoSuperior AS Linea
	,Maquinas.IdEquipoSuperior AS IdLinea
	,Maquinas.Nivel
	,Maquinas.IdNivel
	,Maquinas.Clase
	,Maquinas.IdClase
	,Maquinas.Descripcion
	,dbo.MaquinasZonas.Zona
	,dbo.MaquinasOrdenes.Orden
	,dbo.MaquinasOrdenes.FecHorAct AS FecHorActOrden
	,ISNULL(dbo.EstadoActualMaquinas.Estado, 0) AS Estado
	,CAST(Maquinas.Posicion AS INT) AS Posicion
	,Maquinas.RechazoManual AS RechazoManual
	, -- agomezn 05/07/16, añadido para filtrar en el desplegable de nuevo rechazo de Terminal
	CASE
		WHEN CONVERT(INT, Maquinas.POSICION) < CONVERT(INT, (SELECT
					MIN(CONVERT(INT, POSICION))
				FROM Equipos
				WHERE Clase = 'LLENADORA'
				AND EquipoSuperior = Maquinas.EquipoSuperior)
			) THEN 1
		ELSE 0
	END AS MENOR_LLENADORA
FROM dbo.Equipos AS Maquinas
LEFT OUTER JOIN dbo.MaquinasZonas
	ON Maquinas.PkEquipo = dbo.MaquinasZonas.PkEquipo
LEFT OUTER JOIN dbo.MaquinasOrdenes
	ON Maquinas.PkEquipo = dbo.MaquinasOrdenes.PkEquipo
LEFT OUTER JOIN dbo.EstadoActualMaquinas
	ON Maquinas.Nombre = dbo.EstadoActualMaquinas.IdMaquina
WHERE Maquinas.IdNivel IN (5 ,7)



GO
/****** Object:  View [dbo].[Ordenes]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







/*dbo.ParametrosLinea.idLinea = Ordenes.equip_long_name AND dbo.ParametrosLinea.Producto = Ordenes.matl_def_id*/
CREATE VIEW [dbo].[Ordenes]
AS
SELECT 
	Ordenes.pom_order_id AS Id, 
	Ordenes.estimated_start_time AS FecIniEstimada, 
	Ordenes.estimated_end_time AS FecFinEstimada, 
	Ordenes.actual_start_time AS FecIniReal, 
	Ordenes.actual_end_time AS FecFinReal, 
	Ordenes.matl_def_id AS IdProducto, 
	Ordenes.pom_matl_qty AS CantidadPlanificada, 
	Ordenes.produced_qty AS CantidadProducida, 
	Ordenes.pom_order_status_id AS EstadoAct, 
	Ordenes.pom_order_status_pk AS IdEstadoAct, 
	Ordenes.prev_pom_order_status_id AS EstadoAnt, 
	Ordenes.prev_pom_order_status_pk AS IdEstadoAnt, 
	dbo.ParametrosLinea.idLinea AS Linea, 
	Ordenes.note AS Descripcion, Ordenes.RowUpdated AS FecHorAct, 
	ISNULL(CAST(dbo.ParametrosOrdenes.VelocidadNominal AS float), 0) AS VelocidadNominal, 
	ISNULL(CAST(dbo.ParametrosOrdenes.OEEObjetivo AS float), 0) AS OEEObjetivo, 
	ISNULL(CAST(dbo.ParametrosOrdenes.OEECritico AS float), 0) AS OEECritico, 
	Ordenes.ERP_ID AS CodigoJDE, 
	Ordenes.ppr_name AS PPR,
	ISNULL(CAST(Ordenes.scrapped_qty AS int), 0) AS Rechazos,
	ISNULL(CAST(ParametrosOrdenes.OEE AS float), 0) as OEE,
	ISNULL(CAST(ParametrosOrdenes.Disponibilidad AS float), 0) as Disponibilidad,
	ISNULL(CAST(ParametrosOrdenes.Eficiencia AS float), 0) as Eficiencia,
	ISNULL(CAST(ParametrosOrdenes.Calidad AS float), 0) as Calidad,
	ISNULL(CAST(ParametrosOrdenes.RendMecanico AS float), 0) as RendMecanico,
	--ISNULL(CAST(ParametrosOrdenes.ProdLlenadora AS int), 0) as ProdLlenadora,
	ISNULL(CAST(ParametrosOrdenes.EnvasesPorPalet AS int), 0) AS EnvasesPorPalet,
	ISNULL(CAST(ParametrosOrdenes.CajasPorPalet AS int), 0) AS CajasPorPalet,
	ISNULL(CAST(ParametrosOrdenes.HectolitrosProducto AS numeric(16,6)), 0) AS HectolitrosProducto,
	ParametrosOrdenes.CausaPausa
	,ParametrosOrdenes.PicosCajas
	--,(SELECT COALESCE(SUM(CANTIDAD),0)
	--FROM dbo.COB_MSM_PICOS_PROD
	--WHERE ID_ORDEN = Ordenes.pom_order_id) AS PicosCajas
FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
LEFT JOIN
ParametrosLinea ON Ordenes.ppr_name = dbo.ParametrosLinea.PPR 
LEFT JOIN
ParametrosOrdenes ON Ordenes.pom_order_id = ParametrosOrdenes.IdOrden
WHERE Ordenes.pom_order_type_id IN ('Envasado','WO_ENVASADO') AND ParametrosOrdenes.IdSubOrden = 0

GO
/****** Object:  View [dbo].[EstadoHistoricoMaquinas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[EstadoHistoricoMaquinas]
AS
SELECT DISTINCT
	EstadoActMaquinas.StartTime AS FecInicio
	,EstadoActMaquinas.EndTime AS FecFin
	,dbo.Equipos.EquipoSuperior AS Linea
	,dbo.MaquinasZonas.Zona
	,EqPPA.EquipmentName AS IdMaquina
	,EstadoActMaquinas.Level0 AS Estado
FROM dbo.OEEDTMTable AS EstadoActMaquinas
INNER JOIN (SELECT
		EqID
		,PPAObjectId
	FROM PPA.dbo.Equipment_Extension_Link AS Equipment_Extension_Link_1
	GROUP BY	EqID
				,PPAObjectId) AS versiones
	ON versiones.PPAObjectId = EstadoActMaquinas.EqID
INNER JOIN PPA.dbo.Equipment AS EqPPA
	ON EqPPA.EquipmentId = versiones.EqID
INNER JOIN dbo.Equipos
	ON EqPPA.EquipmentName = dbo.Equipos.Nombre
INNER JOIN dbo.MaquinasZonas
	ON dbo.MaquinasZonas.PkEquipo = dbo.Equipos.PkEquipo
WHERE (NOT (EstadoActMaquinas.EndTime IS NULL))



GO
/****** Object:  View [dbo].[ParametrosPlanta_Admin]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[ParametrosPlanta_Admin]
AS
SELECT
	ParametrosLinea.IdObj AS Id
	,ParametrosLinea.FK_LINEA_ID AS IdLinea
	,ParametrosLinea.FK_PARAMETRO_ID AS IdParametro
	,TiposParametros.NOMBRE AS NombreParametro
	,TiposParametros.DESCRIPCION AS DescripcionParametro
	,TiposParametros.TIPO_VALOR AS TipoValor
	,ParametrosLinea.VALOR_FLOAT
	,ParametrosLinea.VALOR_INT
	,ParametrosLinea.VALOR_STRING
	,TiposParametros.REGLA AS Regla
FROM dbo.COB_MSM_PARAMETROS_LINEA_ADMIN AS ParametrosLinea
INNER JOIN dbo.COB_MSM_TIPOS_PARAMETRO AS TiposParametros
	ON ParametrosLinea.FK_PARAMETRO_ID = TiposParametros.PARAMETRO_ID


GO
/****** Object:  View [dbo].[Lineas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







CREATE VIEW [dbo].[Lineas]
AS
SELECT
	NUM_LINEA AS NumeroLinea
	,DESC_LINEA AS Descripcion
	,LINEA AS Nombre
	,Equi.equip_id AS Id
	,Equi.equip_superior AS EquipoSuperior
	,PPCritico.VALOR_FLOAT AS OEECritico
	,PPObjetivo.VALOR_FLOAT AS OEEObjetivo
FROM dbo.COB_MSM_LINEAS AS MaestroLineas
INNER JOIN SITMesDB.dbo.BPM_EQUIPMENT AS Equi
	ON MaestroLineas.LINEA = Equi.equip_Id
LEFT JOIN [dbo].[ParametrosPlanta_Admin] AS PPCritico ON  PPCritico.IdLinea =  MaestroLineas.NUM_LINEA AND PPCritico.IdParametro = 13
LEFT JOIN [dbo].[ParametrosPlanta_Admin] AS PPObjetivo ON  PPObjetivo.IdLinea =  MaestroLineas.NUM_LINEA AND PPObjetivo.IdParametro = 12 


GO
/****** Object:  View [dbo].[ACCION_MEJORA]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[ACCION_MEJORA]
AS
SELECT
	ID_ACCION_MEJORA
	,TIPO
	,ACCION_PROPUESTA
	,OBSERVACIONES
	,FECHA_ALTA
	,FECHA_FINALIZADA
	,DESCRIPCION_PROBLEMA
	,CAUSA
	,USUARIO
	,ID_LINEA
	,ID_MAQUINA
	,ID_EQUIPO_CONSTRUCTIVO
FROM dbo.COB_MSM_ACCIONES_DE_MEJORA


GO
/****** Object:  View [dbo].[ACCION_MEJORA_ARRANQUES]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[ACCION_MEJORA_ARRANQUES]
AS
SELECT
	[$IdArchObj]
	,[$IDArchiveValue]
	,FK_ACCION_MEJORA_ID
	,ID_ARRANQUE
FROM dbo.COB_MSM_ACCIONES_ARRANQUES


GO
/****** Object:  View [dbo].[ACCION_MEJORA_CAMBIOS]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[ACCION_MEJORA_CAMBIOS]
AS
SELECT        [$IdArchObj], [$IDArchiveValue], FK_ACCION_MEJORA_ID, ID_CAMBIO
FROM            dbo.COB_MSM_ACCIONES_CAMBIOS

GO
/****** Object:  View [dbo].[ACCION_MEJORA_PAROS_MAYORES]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[ACCION_MEJORA_PAROS_MAYORES]
AS
SELECT
	FK_ACCIONES_DE_MEJORA_ID AS ID_ACCION_MEJORA
	,ID_PARO AS ID_PARO_MAYOR
FROM dbo.COB_MSM_ACCIONES_PAROS


GO
/****** Object:  View [dbo].[Area_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









--Cuando se unifiquen modelos de planta Area sera ENVASADO y Fabricacion el resto seran SubAreas (MSM01.COCCIÓN)
CREATE VIEW [dbo].[Area_FAB]
AS
SELECT
	eq.equip_pk AS [AreaPK]
	,eq.equip_id AS [ID]
	,eq.equip_prnt_pk AS [PlantaPK]
	,eq.equip_in_plant AS [IsInPlant]
	,eq.equip_name AS [Name]
	,eq.equip_class_lvl_id AS [Level]
	,eqcls.[equip_class_lvl_pk] AS [ClassPK]
	,eqcls.equip_class_id AS [ClassID]
	,module.module_name AS [ModuleName]
	,eqproperty.equip_prpty_value AS [C_External-IDSloc]
	, CASE WHEN pos.equip_prpty_value IS NULL THEN NULL
	ELSE CONVERT(INT,pos.equip_prpty_value) END AS Posicion
FROM SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT as eq
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT_CLS eqcls ON (eq.equip_class_pk = eqcls.equip_class_pk)
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_MODULE module ON (eqcls.module_pk = module.module_pk)
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty ON (eq.equip_pk = eqproperty.equip_pk) AND eqproperty.equip_prpty_id = N'C_External-ID'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY pos ON (eq.equip_pk = pos.equip_pk) AND pos.equip_prpty_id = N'POSICION'
WHERE eq.equip_in_plant = 'true' AND eq.equip_class_lvl_id <> 'Logical-Cell'
AND eq.equip_class_lvl_id <> 'Logical-Unit'
AND eq.equip_id NOT LIKE '%-interface'
AND eqcls.equip_class_lvl_id = 'Area'
AND eq.equip_name <> 'ENVASADO'

GO
/****** Object:  View [dbo].[BeerTypes_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[BeerTypes_FAB]
AS
	SELECT ISNULL(ROW_NUMBER() OVER(Order by aux.Beer),0) ID,aux.*
	FROM(SELECT DISTINCT cast([dbo].GetNameBeer(Descript) as nvarchar(25)) Beer
		 FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MTMV2_B_DEF]
		 WHERE ClassID = 'MOS' AND Descript NOT LIKE 'CZA%' AND Descript NOT LIKE 'MOSTO%' AND Descript NOT LIKE 'Default%') aux


GO
/****** Object:  View [dbo].[Celda_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO













CREATE VIEW [dbo].[Celda_FAB]
AS
SELECT
	eq.equip_pk AS [CeldaPK]
	,eq.equip_id AS [ID]
	,eq.equip_prnt_pk AS [AreaPK]
	,eq.equip_in_plant AS [IsInPlant]
	,eq.equip_name AS [Name]
	,eq.equip_class_lvl_id AS [Level]
	,eqcls.[equip_class_lvl_pk] AS [ClassPK]
	,eqcls.equip_class_id AS [ClassID]
	,module.module_name AS [ModuleName]
	,eqproperty.equip_prpty_value AS [C_External-IDSloc]
	,eqproperty2.equip_prpty_value AS equipPropL9
	,eqproperty3.equip_prpty_value AS TipoUbicacion
	, CASE WHEN pos.equip_prpty_value IS NULL THEN NULL
	ELSE CONVERT(INT,pos.equip_prpty_value) END AS Posicion
FROM SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT as eq
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPMV_EQPT_CLS eqcls ON (eq.equip_class_pk = eqcls.equip_class_pk)
INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_MODULE module ON (eqcls.module_pk = module.module_pk)
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty ON (eq.equip_pk = eqproperty.equip_pk) AND eqproperty.equip_prpty_id = N'OBJECT-LABEL'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty2 ON (eq.equip_pk = eqproperty2.equip_pk) AND eqproperty2.equip_prpty_id = 'L9'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY eqproperty3 ON (eq.equip_pk = eqproperty3.equip_pk) AND eqproperty3.equip_prpty_id = 'Tipo_Ubicacion'
LEFT JOIN SITMESDB_FAB.[SITMesDB].[dbo].BPM_EQUIPMENT_PROPERTY pos ON (eq.equip_pk = pos.equip_pk) AND pos.equip_prpty_id = N'POSICION'
WHERE eq.equip_in_plant = 'true' AND eq.equip_class_lvl_id <> 'Logical-Cell'
AND eq.equip_class_lvl_id <> 'Logical-Unit'
AND eq.equip_id NOT LIKE '%-interface'
AND eqcls.equip_class_lvl_id = 'Cell' 
AND eq.[equip_status] =1
AND eqcls.equip_class_id NOT LIKE '%ENVASADO%'

GO
/****** Object:  View [dbo].[ConsumosMateriales_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[ConsumosMateriales_FAB]
AS
SELECT        item.def_id AS IdMaterial, item.quantity AS Cantidad_Estimada, item.location_id, item.actual_qty AS Cantidad, item.uom_id AS UOM, item.name, 
                         MTMV2_B_DEF_15.Descript AS Descripcion_Material, item.pom_order_id AS IdOrden, 
                         CASE name WHEN 'CONSUMED' THEN 1 WHEN 'PRODUCED' THEN 0 WHEN 'PLANNED' THEN 3 ELSE - 1 END AS tipo, item.actual_lot AS loteMES, 
                         item.RowUpdated
FROM            SITMesDB.dbo.POMV_MATL_SPEC_ITM AS item INNER JOIN
                         SITMesDB.dbo.MTMV2_B_DEF AS MTMV2_B_DEF_15 ON item.def_id = MTMV2_B_DEF_15.DefID

GO
/****** Object:  View [dbo].[DiasFestivos]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[DiasFestivos]
AS
SELECT
	FESTIVOS.shc_holiday_pk AS id
	,FESTIVOS.holiday_date AS fecha
	,FESTIVOS_DESC.descript AS descripcion
	,FESTIVOS_DESC.md_lang_code_pk AS idioma
FROM SITMesDB.dbo.SHC_HOLIDAY AS FESTIVOS
INNER JOIN SITMesDB.dbo.SHC_HOLIDAY_DESC AS FESTIVOS_DESC
	ON FESTIVOS.shc_holiday_pk = FESTIVOS_DESC.shc_holiday_pk



GO
/****** Object:  View [dbo].[Equipos_FAB_old]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[Equipos_FAB_old]
AS
SELECT Equipos.equip_id AS Id, Equipos.equip_name AS Nombre, Equipos.equip_uuid AS IdBD, Equipos.equip_superior AS EquipoSuperior, 
                  Equipos.equip_prnt_pk AS IdEquipoSuperior, Equipos.equip_class_lvl_id AS Nivel, Equipos.equip_class_lvl_pk AS IdNivel, Clases.equip_class_name AS Clase, 
                  Equipos.equip_class_pk AS IdClase, Equipos.equip_status AS Estado, Equipos.equip_label AS Descripcion, Equipos.equip_pk AS PkEquipo
				 -- , Prop.equip_prpty_value AS Posicion
FROM     [SITMESDB_FAB].SITMesDB.dbo.BPMV_EQPT AS Equipos INNER JOIN
                  [SITMESDB_FAB].SITMesDB.dbo.BPMV_EQPT_CLS AS Clases ON Clases.equip_class_pk = Equipos.equip_class_pk
				  --INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] Prop on Equipos.equip_pk = Prop.equip_pk and [equip_prpty_id]='POSICION'
WHERE  (Equipos.equip_in_plant = 1)

GO
/****** Object:  View [dbo].[EstadosOrden]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[EstadosOrden]
AS
SELECT
	pom_order_status_pk AS Id, id AS Estado, color
FROM SITMesDB.dbo.POM_ORDER_STATUS AS POM_ORDER_STATUS_1
WHERE (cond = 'Custom')





GO
/****** Object:  View [dbo].[HistoricoOrdenes]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[HistoricoOrdenes]
AS
SELECT
	[$IDArchiveValue] AS ID_CAMBIO
	,ORDER_ID AS ID_ORDEN
	,FECHA_CAMBIO
	,ESTADO
FROM dbo.COB_MSM_HISTORICO_ORDENES


GO
/****** Object:  View [dbo].[KOPs_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[KOPs_FAB]
AS
SELECT 
	KOP.pom_process_segment_parameter_pk AS Cod_KOP
	,KOP.name AS ID_KOP
	,KOP.description AS Des_KOP
	,ORD.pom_order_pk AS Cod_Orden
	,KOP.pom_order_id AS ID_Orden
	,CASE
when ENT.LBL = 'D_WP' then 'Orden cocción'
when ENT.LBL = 'D_FE' then 'Orden fermentación'
when ENT.LBL = 'D_FL' then 'Orden filtración'
when ENT.LBL = 'D_GU' then 'Orden guarda'
when ENT.LBL = 'D_PR' then 'Orden prellenado'
		ELSE ps_name
	END AS ID_Procedimiento
	,ENT.pom_entry_pk AS Cod_Procedimiento
	,KOP.type AS Tipo_KOP
	,CASE
		WHEN VAL.ACTL_VAL <> '' AND
			type = 'DateTime' THEN CONVERT(VARCHAR(10),
			CONVERT(DATETIME, REPLACE(VAL.ACTL_VAL, 'T', ' ')), 103) + ' ' + CONVERT(VARCHAR(8), CONVERT(DATETIME, REPLACE(VAL.ACTL_VAL, 'T', ' ')), 24)
		WHEN KOP.GRP LIKE '%MULTIVALOR%' THEN CASE
				WHEN (SELECT
							COUNT(PARM_PK)
						FROM SITMESDB_FAB.SITmesDB.DBO.POMV_PCS_PARM_ACTL_VAL
						WHERE PARM_PK = KOP.pom_process_segment_parameter_pk)
					<> 0 THEN CAST
					((SELECT
							COUNT(PARM_PK)
						FROM SITMESDB_FAB.SITmesDB.DBO.POMV_PCS_PARM_ACTL_VAL
						WHERE PARM_PK = KOP.pom_process_segment_parameter_pk)
					AS NVARCHAR(MAX)) + ' Valores asignados'
				ELSE ''
			END
		ELSE ISNULL(REPLACE(VAL.ACTL_VAL, '.', ','), REPLACE(KOP.value, '.', ','))
	END AS Valor_Actual
	,ISNULL(REPLACE(VAL.LOW_VAL, '.', ','), REPLACE(KOP.min_val, '.', ',')) AS Valor_Minimo
	,ISNULL(REPLACE(VAL.HIGH_VAL, '.', ','), REPLACE(KOP.max_val, '.', ',')) AS Valor_Maximo
	,KOP.mandatory AS Obligatorio
	,KOP.uom_id AS UOM_KOP	
	,CASE
		WHEN VAL.TS IS NULL AND
			KOP.RowUpdated IS NULL THEN NULL
		WHEN VAL.TS IS NULL THEN [dbo].[ToLocalDateTime](KOP.RowUpdated)
		ELSE [dbo].[ToLocalDateTime](VAL.TS)
	END AS Fecha
	,ISNULL(VAL.TS, KOP.RowUpdated) AS FechaUTC
	,CASE
		WHEN KOP.GRP LIKE '%MANU%' OR
			KOP.GRP LIKE '%MANUAL%' THEN 'MANUAL'
		WHEN KOP.GRP LIKE '%CALCULADO' THEN 'CALCULADO'
		WHEN KOP.GRP LIKE '%CAPTURADO%' THEN 'CAPTURADO'
		WHEN KOP.GRP LIKE '%CALCULADO_ACUMULADO' THEN 'CALCULADO ACUMULADO'
		WHEN KOP.GRP LIKE '%MULTIVALOR%' THEN 'MULTIVALOR'
		WHEN KOP.GRP LIKE '%CONSTANTE%' THEN 'CONSTANTE'
		ELSE 'HISTORICO'
	END AS TipoKOP
	,ENT.sequence AS Sequence_Procedimiento
	,CASE
		WHEN VAL.PK IS NULL THEN 0
		ELSE VAL.PK
	END AS PkActVal
	,KOP.seq AS Sequence_KOP
FROM SITMESDB_FAB.SITmesDB.dbo.POMV_ETRY_PCS_PARM AS KOP
INNER JOIN SITMESDB_FAB.SITmesDB.dbo.POMV_ETRY AS ENT
	ON KOP.pom_entry_id = ENT.pom_entry_id
INNER JOIN SITMESDB_FAB.SITmesDB.DBO.POMV_ORDR AS ORD
	ON KOP.pom_order_id = ORD.pom_order_id
LEFT OUTER JOIN (SELECT
		PK
		,PARM_PK
		,ACTL_VAL
		,LOW_VAL
		,HIGH_VAL
		,TS
	FROM SITMESDB_FAB.SITmesDB.DBO.POMV_PCS_PARM_ACTL_VAL AS POMV_PCS_PARM_ACTL_VAL_2
	WHERE (PK IN (SELECT
			MAX(PK) AS Expr1
		FROM SITMESDB_FAB.SITmesDB.DBO.POMV_PCS_PARM_ACTL_VAL AS POMV_PCS_PARM_ACTL_VAL_1
		GROUP BY PARM_PK)
	)) AS VAL
	ON KOP.pom_process_segment_parameter_pk = VAL.PARM_PK
	AND KOP.GRP <> 'MULTIVALOR'
	AND KOP.GRP <> 'HISTORICO'
WHERE (KOP.name NOT LIKE '#%')
AND (KOP.GRP <> 'HISTORICO') AND (KOP.GRP <> 'MULTIVALOR')



GO
/****** Object:  View [dbo].[KOPs_FAB_Historian]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






CREATE VIEW [dbo].[KOPs_FAB_Historian]
AS
SELECT pom_process_segment_parameter_pk as Cod_KOP, name as ID_KOP, description as Des_KOP,
ORD.pom_order_pk AS Cod_Orden ,KOP.pom_order_id as ID_Orden, case
when ENT.LBL = 'D_WP' then 'Orden Cocción'
when ENT.LBL = 'D_FE' then 'Orden Fermentación'
when ENT.LBL = 'D_FL' then 'Orden Filtración'
when ENT.LBL = 'D_GU' then 'Orden Guarda'
when ENT.LBL = 'D_PR' then 'Orden Prellenado'
when ENT.LBL = 'D_TR' then 'Orden Trasiego'
else ENT.ps_name
	--CASE
	--WHEN ENT.pom_entry_id LIKE '%' + ENT.pom_entry_type_id +'%' THEN ENT.pom_entry_type_id + '-' + LEFT(REVERSE(ENT.pom_entry_id),CHARINDEX('_',REVERSE(ENT.pom_entry_id))-1)
	--ELSE
	--ENT.pom_entry_type_id
	--END
	END AS ID_Procedimiento, 
Ent.pom_entry_pk as Cod_Procedimiento , type as Tipo_KOP, 
0 as Valor_Actual, 
0 as Valor_Minimo, 
0 as Valor_Maximo,
mandatory as Obligatorio, KOP.uom_id as UOM_KOP, 
CASE
	WHEN KOP.RowUpdated IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](KOP.RowUpdated)
	END as Fecha,
KOP.RowUpdated as FechaUTC,
case
when KOP.GRP like '%MANU%' or KOP.GRP like '%MANUAL%' then 'Manual'
when KOP.GRP like '%CALCULADO' then 'Calculado'
when KOP.GRP like '%CAPTURADO%' then 'Capturado'
when KOP.GRP like '%CALCULADO_ACUMULADO' then 'Calculado Acumulado'
when KOP.GRP like '%MULTIVALOR%' then 'Multivalor' 
else 'Automático'
end as TipoKOP,
ENT.sequence as Sequence_Procedimiento,
0 AS PkActVal,
KOP.Seq as Sequence_KOP
FROM [SITMESDB_FAB].SITmesDB.dbo.POMV_ETRY_PCS_PARM KOP
INNER JOIN [SITMESDB_FAB].SITmesDB.[dbo].[POMV_ETRY] ENT ON KOP.pom_entry_id = ENT.pom_entry_id
INNER JOIN [SITMESDB_FAB].SITmesDB.DBO.[POMV_ORDR] ORD  ON KOP.pom_order_id = ORD.[pom_order_id]
WHERE name NOT LIKE '#%' AND KOP.GRP = 'HISTORICO' 


GO
/****** Object:  View [dbo].[KOPs_FAB_MultiValor]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[KOPs_FAB_MultiValor] as
SELECT pom_process_segment_parameter_pk as Cod_KOP, name as ID_KOP, description as Des_KOP,
ORD.pom_order_pk AS Cod_Orden ,KOP.pom_order_id as ID_Orden, case
when ENT.LBL = 'D_WP' then 'Orden cocción'
when ENT.LBL = 'D_FE' then 'Orden fermentación'
when ENT.LBL = 'D_FL' then 'Orden filtración'
when ENT.LBL = 'D_GU' then 'Orden guarda'
when ENT.LBL = 'D_PR' then 'Orden prellenado'
else 
	CASE
	WHEN ENT.pom_entry_id LIKE '%' + ENT.pom_entry_type_id +'%' THEN ENT.pom_entry_type_id + '-' + LEFT(REVERSE(ENT.pom_entry_id),CHARINDEX('_',REVERSE(ENT.pom_entry_id))-1)
	ELSE
	ENT.pom_entry_type_id
	END
	END AS ID_Procedimiento, 
Ent.pom_entry_pk as Cod_Procedimiento , type as Tipo_KOP, 
CASE WHEN VAL.ACTL_VAL <> '' AND type='DateTime' THEN CONVERT(VARCHAR(10), convert(datetime,REPLACE(VAL.ACTL_VAL,'T',' ')), 103) +' '+ CONVERT(VARCHAR(8), convert(datetime,REPLACE(VAL.ACTL_VAL,'T',' ')), 24)
ELSE ISNULL(REPLACE(VAL.ACTL_VAL,'.',','), REPLACE(KOP.value,'.',',')) END as Valor_Actual, 
REPLACE(KOP.min_val,'.',',') as Valor_Minimo, 
REPLACE(KOP.max_val,'.',',') as Valor_Maximo,
mandatory as Obligatorio, KOP.uom_id as UOM_KOP, 
CASE
	WHEN VAL.TS IS NULL AND KOP.RowUpdated IS NULL THEN NULL
	WHEN VAL.TS IS NULL THEN [dbo].[ToLocalDateTime](KOP.RowUpdated)
	ELSE [dbo].[ToLocalDateTime](VAL.TS)
	END as Fecha,
ISNULL(VAL.TS,KOP.RowUpdated) as FechaUTC,
case
when KOP.GRP like '%MANU%' or KOP.GRP like '%MANUAL%' then 'Manual'
when KOP.GRP like '%CALCULADO' then 'Calculado'
when KOP.GRP like '%CAPTURADO%' then 'Capturado'
when KOP.GRP like '%CALCULADO_ACUMULADO' then 'Calculado Acumulado'
when KOP.GRP like '%MULTIVALOR%' then 'Multivalor' 
else 'Automático'
end as TipoKOP,
ENT.sequence as Sequence_Procedimiento,
CASE WHEN VAL.PK IS NULL THEN 0
ELSE VAL.PK END AS PkActVal,
KOP.Seq as Sequence_KOP
FROM [SITMESDB_FAB].SITmesDB.dbo.POMV_ETRY_PCS_PARM KOP
LEFT JOIN [SITMESDB_FAB].SITmesDB.[dbo].[POMV_ETRY] ENT ON KOP.pom_entry_id = ENT.pom_entry_id
left JOIN [SITMESDB_FAB].SITmesDB.DBO.[POMV_ORDR] ORD  ON KOP.pom_order_id = ORD.[pom_order_id]
LEFT JOIN [SITMESDB_FAB].SITmesDB.DBO.[POMV_PCS_PARM_ACTL_VAL] VAL ON KOP.pom_process_segment_parameter_pk = VAL.PARM_PK 
WHERE name NOT LIKE '#%' AND KOP.GRP = 'MULTIVALOR'



GO
/****** Object:  View [dbo].[LOG_ERRORES]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[LOG_ERRORES]
AS
SELECT         
	[dbo].[LOG_PROCESOS].FechaHora, 
	[dbo].[LOG_PROCESOS].Funcion COLLATE DATABASE_DEFAULT as Funcion, 
	[dbo].[LOG_PROCESOS].Evento COLLATE DATABASE_DEFAULT as Evento,  
	[dbo].[LOG_PROCESOS].Usuario COLLATE DATABASE_DEFAULT as Usuario, 
	CAST([dbo].[LOG_PROCESOS].Traza AS NVARCHAR(MAX)) as Traza
FROM [dbo].[LOG_PROCESOS] 
WHERE dbo.LOG_PROCESOS.Tipo = 'INCIDENCIA'
UNION
SELECT        
	[dbo].[LOG].FechaHora, 
	[dbo].[LOG].Funcion COLLATE DATABASE_DEFAULT as Funcion,
	[dbo].[LOG].Evento COLLATE DATABASE_DEFAULT as Evento, 
	[dbo].[LOG].Usuario COLLATE DATABASE_DEFAULT as Usuario, 
	CAST([dbo].[LOG].Traza AS NVARCHAR(MAX)) as Traza
FROM [dbo].[LOG]
WHERE [dbo].[LOG].Tipo = 'INCIDENCIA'




GO
/****** Object:  View [dbo].[Lotes_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Lotes_FAB]
AS
SELECT * 
FROM [SITMESDB_FAB].SITMesDB.dbo.MMLots
GO
/****** Object:  View [dbo].[LoteUbicacion_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

















CREATE VIEW [dbo].[LoteUbicacion_FAB]
AS
SELECT L.LocPK, L.LOCID, L.LocPath, L.ParentLocPK,  ISNULL(EP.[equip_prpty_value],'') AS Descripcion , SUM(LOTS.InitQuantity) AS InitQuantity, SUM(LOTS.Quantity) AS Quantity, UOM.UomID, ISNULL(PV.[equip_prpty_value],'') AS PoliticaVaciado
FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLots] LOTS ON LOTS.LocPK = L.LocPK
--INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvDefVers] DV ON LOTS.DefVerPK = DV.[DefVerPK]
--INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvDefinitions] D ON DV.DefPK = D.DefPK
--INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMvClasses] C ON D.ClassPK = C.ClassPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MESvUoMs] UOM ON UOM.UomPK = LOTS.UomPK
INNER JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT] E ON L.LOCPATH = E.EQUIP_ID --E.[equip_pk] = L.CommonLocPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] EP ON E.[equip_pk] = EP.[equip_pk] AND EP.EQUIP_PRPTY_ID = 'OBJECT-LABEL'
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] PV ON E.[equip_pk] = PV.[equip_pk] AND PV.EQUIP_PRPTY_ID = 'POLITICA_DE_VACIADO'
--INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMLotsCustom] LEXT /*WITH_NOLOCK*/ ON LOTS.LotPK = LEXT.LotPK
GROUP BY L.LocPK, L.LOCID, L.LocPath,EP.[equip_prpty_value],UOM.UomID,L.ParentLocPK,PV.[equip_prpty_value]

GO
/****** Object:  View [dbo].[MaquinasLineas]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO







CREATE VIEW [dbo].[MaquinasLineas]
AS
SELECT
	Lineas.NUM_LINEA AS NumLinea
	,Equipos.equip_id AS Id
	,Equipos.equip_name AS Nombre
	,Clases.equip_class_name AS Clase
	,Equipos.equip_class_pk AS IdClase
	,Equipos.equip_label AS Descripcion
	,Equipos.equip_pk AS PkEquipo
FROM SITMesDB.dbo.BPMV_EQPT AS Equipos
INNER JOIN SITMesDB.dbo.BPMV_EQPT_CLS AS Clases
	ON Clases.equip_class_pk = Equipos.equip_class_pk
INNER JOIN COB_MSM_LINEAS AS Lineas
	ON Equipos.equip_superior = Lineas.LINEA
INNER JOIN [SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] Posicion
	ON Equipos.equip_pk = Posicion.equip_pk
	AND [equip_prpty_id] = 'POSICION'
WHERE Equipos.equip_in_plant = 1
AND Equipos.equip_class_lvl_pk = 5 and Equipos.equip_status = 1


GO
/****** Object:  View [dbo].[MaquinasLineasPlanConti]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[MaquinasLineasPlanConti]
AS
SELECT        Lineas.NUM_LINEA AS NumLinea, Equipos.equip_id AS Id, Equipos.equip_name AS Nombre, Clases.equip_class_name AS Clase, 
                         Equipos.equip_class_pk AS IdClase, Equipos.equip_label AS Descripcion, Equipos.equip_pk AS PkEquipo, ISNULL(CONVERT(INT, Posicion.equip_prpty_value), 0) 
                         AS Posicion
FROM            SITMesDB.dbo.BPMV_EQPT AS Equipos INNER JOIN
                         SITMesDB.dbo.BPMV_EQPT_CLS AS Clases ON Clases.equip_class_pk = Equipos.equip_class_pk INNER JOIN
                         dbo.COB_MSM_LINEAS AS Lineas ON Equipos.equip_superior = Lineas.LINEA INNER JOIN
                         SITMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS Posicion ON Equipos.equip_pk = Posicion.equip_pk AND Posicion.equip_prpty_id = 'POSICION'
WHERE        (Equipos.equip_in_plant = 1) AND (Equipos.equip_class_lvl_pk = 5) AND (Equipos.equip_status = 1) AND (Clases.equip_class_name IN ('DESPALETIZADORA', 
                         'CLASIFICADOR', 'INSPECTOR_BOTELLAS_VACIAS', 'LLENADORA', 'INSPECTOR_SALIDA_LLENADORA', 'INSPECTOR_BOTELLAS_LLENAS', 'EMPAQUETADORA', 
                         'PALETIZADORA', 'ETIQUETADORA_PALETS', 'PALETIZADORA', 'ETIQUETADORA_PALETS', 'BASCULA','ENCAJONADORA'))



GO
/****** Object:  View [dbo].[Materiales_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[Materiales_FAB]
AS
SELECT 
	mmd.DefID AS IdMaterial,
	REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mmd.DefName,'DummyMaterial_WP','Material por defecto para cocción'),'DummyMaterial_FE','Material por defecto para fermentación'),'DummyMaterial_FL','Material por defecto para filtración'),'DummyMaterial_GU','Material por defecto para guarda'),'DummyMaterial_PR','Material por defecto para prellenado'),'DummyMaterial_TR','Material por defecto para trasiegos') as Nombre,
	REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mmd.Descript,'DummyMaterial_WP','Material por defecto para cocción'),'DummyMaterial_FE','Material por defecto para fermentación'),'DummyMaterial_FL','Material por defecto para filtración'),'DummyMaterial_GU','Material por defecto para guarda'),'DummyMaterial_PR','Material por defecto para prellenado'),'DummyMaterial_TR','Material por defecto para trasiegos' )as Descripcion,
	--mmd.Descript as Descripcion,
	mmc.ClassID as IdClase,
	mmc.Descript as Clase,
	MMDV.VLabel as Version,
	mmvs.DefStatusID as Status,
	mesu.UomID as UdMedida,
	CASE WHEN mmdv.EffectiveFrom IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](mmdv.EffectiveFrom) END AS F_EfectivoDesde,
	mmdv.EffectiveFrom AS F_EfectivoDesdeUTC,
	CASE WHEN mmdv.EffectiveTill IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](mmdv.EffectiveTill) END AS F_EfectivoHasta,
	mmdv.EffectiveTill AS F_EfectivoHastaUTC,
	mmdv.IsCurrent as EnUso,
	mmdv.CreatedBy as Autor,
	CASE WHEN mmdv.CreatedOn IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](mmdv.CreatedOn) END AS FechaCreacion,
	mmdv.CreatedOn as FechaCreacionUTC,
	CASE WHEN mmdv.LastUpdate IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](mmdv.LastUpdate) END AS FechaUltCreacion,
	mmdv.LastUpdate as FechaUltCreacionUTC,
	mmdv.LastUser as ModificadoPor,
	mmdv.AdditionalInfo as InfoAdicional,
	MMT.TypeID as Tipo,
	MMT.TypeCD as DescTipo,
	MMDV.DEFPK AS PK_Material,
	BOMMAT.Descript BOM
  FROM SITMESDB_FAB.[SITMesDB].[dbo].[MMvDefVers] MMDV
  INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].[MMvDefinitions] mmd on mmd.DefPK = MMDV.DefPK
  INNER JOIN SITMESDB_FAB.[SITMesDB].[dbo].[MMvDefStatuses] mmvs on mmvs.DefStatusPK = MMDV.DefStatusPK
  INNER JOIN SITMESDB_FAB.SITMesDB.dbo.MESUoMs mesu	ON mesu.UomPK = MMDV.UomPK
  INNER JOIN SITMESDB_FAB.[SITMesDB].dbo.MMvClasses mmc on mmc.ClassPK = mmd.ClassPK 
  INNER JOIN SITMESDB_FAB.SITMesDB.dbo.MMvTypes MMT on MMT.TypePK = mmc.TypePK
  LEFT JOIN SITMESDB_FAB.SITMesDB.dbo.MTMV2_B_BOM BOMMAT on BOMMAT.DefID=mmd.DefID
  WHERE MMT.TypeID not in ('02','03')


GO
/****** Object:  View [dbo].[MMLocations_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO









CREATE VIEW [dbo].[MMLocations_FAB]
AS


select * from [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations]
WHERE LocPath NOT LIKE '%ENVASADO%' AND LocPath NOT LIKE '%TEST%'

GO
/****** Object:  View [dbo].[Ordenes_ENV]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Ordenes_ENV]
AS
SELECT        pom_order_pk AS Cod_Orden, pom_order_id AS ID_Orden, note AS Des_Orden, matl_def_id AS Cod_Material, pom_matl_qty AS Cantidad_Material, 
                         uom_id AS UOM_Material, estimated_start_time AS Tiempo_Inicio_Estimado, estimated_start_time AS Tiempo_Inicio_EstimadoUTC, 
                         estimated_end_time AS Tiempo_Fin_Estimado, estimated_end_time AS Tiempo_Fin_EstimadoUTC, actual_start_time AS Tiempo_Inicio_Real, 
                         actual_start_time AS Tiempo_Inicio_RealUTC, actual_end_time AS Tiempo_Fin_Real, actual_end_time AS Tiempo_Fin_RealUTC, pom_order_type_id AS TipoOrden, 
                         ppr_name AS EquipoOrden, pom_order_status_pk AS IdEstado, pom_order_status_id AS Estado, SRC_ID AS pkLote
FROM            SITMESDB_FAB.SITMesDB.dbo.POMV_ORDR AS POMV_ORDR_1
WHERE        (pom_order_type_id = 'WO_ENVASADO')

GO
/****** Object:  View [dbo].[Ordenes_GU]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[Ordenes_GU]
as
SELECT        pom_order_pk AS Cod_Orden, pom_order_id AS ID_Orden, note AS Des_Orden, matl_def_id AS Cod_Material, pom_matl_qty AS Cantidad_Material, 
                         uom_id AS UOM_Material, estimated_start_time AS Tiempo_Inicio_Estimado, estimated_start_time AS Tiempo_Inicio_EstimadoUTC, 
                         estimated_end_time AS Tiempo_Fin_Estimado, estimated_end_time AS Tiempo_Fin_EstimadoUTC, actual_start_time AS Tiempo_Inicio_Real, 
                         actual_start_time AS Tiempo_Inicio_RealUTC, actual_end_time AS Tiempo_Fin_Real, actual_end_time AS Tiempo_Fin_RealUTC, pom_order_type_id AS TipoOrden, 
                         ppr_name AS EquipoOrden, pom_order_status_pk AS IdEstado, pom_order_status_id AS Estado, SRC_ID AS pkLote
FROM            SITMESDB_FAB.SITMesDB.dbo.POMV_ORDR
WHERE        (pom_order_type_id = 'GU')

GO
/****** Object:  View [dbo].[Ordenes_WP]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[Ordenes_WP]
AS
SELECT        pom_order_pk AS Cod_Orden, pom_order_id AS ID_Orden, note AS Des_Orden, matl_def_id AS Cod_Material, pom_matl_qty AS Cantidad_Material, 
                         uom_id AS UOM_Material, estimated_start_time AS Tiempo_Inicio_Estimado, estimated_start_time AS Tiempo_Inicio_EstimadoUTC, 
                         estimated_end_time AS Tiempo_Fin_Estimado, estimated_end_time AS Tiempo_Fin_EstimadoUTC, actual_start_time AS Tiempo_Inicio_Real, 
                         actual_start_time AS Tiempo_Inicio_RealUTC, actual_end_time AS Tiempo_Fin_Real, actual_end_time AS Tiempo_Fin_RealUTC, pom_order_type_id AS TipoOrden, 
                         ppr_name AS EquipoOrden, pom_order_status_pk AS IdEstado, pom_order_status_id AS Estado, SRC_ID AS pkLote, produced_qty AS cantidad_producida
FROM            SITMESDB_FAB.SITMesDB.dbo.POMV_ORDR AS POMV_ORDR_1
WHERE        (pom_order_type_id = 'WP')

GO
/****** Object:  View [dbo].[PackingWo_HighBeer]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[PackingWo_HighBeer]
AS
SELECT     PackingArticleID AS DefID, Czh, PPR, Description AS Descript, CZAEnv, Mosto
FROM        dbo.REL_PackingWo_HighBeer

GO
/****** Object:  View [dbo].[PlantillasTurnosFabrica]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[PlantillasTurnosFabrica]
AS
SELECT
	VWSD.PRD_WRK_SCHD_ID AS Plantilla	
	,SWT.id AS IdTipoTurno
	,SWT.label AS TipoTurno
	,SWT.type AS PropTurno
	,VWSD.TMPLT_ID AS WDTemplate
	,CASE
		WHEN SWT.isdayafter = 1 THEN DATEDIFF(HOUR, SWT.work_start, DATEADD(DAY, 1,
			SWT.work_end))
		WHEN SWT.isdaybefore = 1 THEN DATEDIFF(HOUR, DATEADD(DAY, -1, SWT.work_start), SWT.work_end)
		ELSE DATEDIFF(HOUR, SWT.work_start,
			SWT.work_end)
	END AS HorasTurno
	,DATEPART(WEEKDAY, DATEADD(DAY, VWSD.POS, DATEADD(WEEK, DATEDIFF(WEEK, 0, GETDATE()), 0))) AS diaSemana
FROM SITMesDB.dbo.MDSSHC_PRD_WRK_SCHD_DAY AS VWSD
INNER JOIN SITMesDB.dbo.SHC_SHIFT_TEMPLATE AS ST
	ON ST.id = VWSD.SHT_TMPLT_ID
INNER JOIN SITMesDB.dbo.SHC_WORKING_TIME AS SWT
	ON SWT.id = VWSD.WKT_ID
WHERE (VWSD.TMPLT_ID <> '<NA>')




GO
/****** Object:  View [dbo].[POSIBLES_AVERIAS]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[POSIBLES_AVERIAS]
AS
SELECT
	IdObj
	,ID_POSIBLE_AVERIA
	,ID_EQUIPO_CONSTRUCTIVO
	,DESCRIPCION
FROM dbo.COB_MSM_POSIBLE_AVERIA


GO
/****** Object:  View [dbo].[ReasonTree]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[ReasonTree]
AS
SELECT
	Categorias.ID_CATEGORIA AS IdCategoria
	,Categorias.DESCRIPCION AS Categoria
	,Motivos.ID_MOTIVO AS IdNivel1
	,Motivos.DESCRIPCION AS Nivel1
	,Causas.ID_CAUSA AS IdNivel2
	,Causas.DESCRIPCION AS Nivel2
FROM COB_MSM_ARBOL_MOTIVOS_PAROS AS Arbol
INNER JOIN COB_MSM_CATEGORIAS_PAROS AS Categorias ON Arbol.ID_ARBOL_MOTIVOS_PAROS = Categorias.FK_ARBOL_MOTIVOS_PAROS_ID
INNER JOIN COB_MSM_MOTIVOS_PAROS AS Motivos ON Categorias.FK_ARBOL_MOTIVOS_PAROS_ID = Motivos.FK_ARBOL_MOTIVOS_PAROS_ID
LEFT JOIN COB_MSM_CAUSAS_PAROS AS Causas ON Motivos.ID_MOTIVO = Causas.FK_MOTIVOS_PAROS_ID


GO
/****** Object:  View [dbo].[RecursoTipoOrden_FAB]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[RecursoTipoOrden_FAB]
AS

SELECT PPR as Recurso, TYP as TipoOrden
FROM [SITMESDB_FAB].[SITMesDB].[dbo].[PDMV_PPR]
WHERE PPR_TargetOrderLifeCycle = 'OM'

GO
/****** Object:  View [dbo].[RelCZA_Mosto]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelCZA_Mosto]
AS
SELECT        PackingArticleID, Czh, PPR, Description, CZAEnv, Mosto
FROM            dbo.REL_PackingWo_HighBeer

GO
/****** Object:  View [dbo].[RelPackingWO_COB_ArticlesParameters]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE VIEW [dbo].[RelPackingWO_COB_ArticlesParameters]
AS
--select Distinct rel.*,cob.DefID,cob.Beer,Coalesce(cob.DecreasePacking,0) DecreasePacking,
--Coalesce(cob.DecreaseFiltration,0) DecreaseFiltration,Coalesce(cob.RecoveredBeerInFiltration,0) RecoveredBeerInFiltration,
--Coalesce(cob.Dilution,0) Dilution,cob.ID ParameterID
--from REL_PackingWo_HighBeer rel
--LEFT JOIN COB_MSM_ArticlesParametersForDecanting cob on cob.DefID=rel.PackingArticleID
		SELECT TOP (select Count(*) from REL_PackingWo_HighBeer rel) rank() OVER (ORDER BY PackingArticleID) as ID,aux.* 
		FROM(
			select Distinct rel.PackingArticleID,rel.Czh,rel.[Description],rel.CZAEnv,rel.Mosto,cob.DefID,cob.Beer,Cast(Coalesce(cob.DecreasePacking,0) as float) DecreasePacking,
			Cast(Coalesce(cob.DecreaseFiltration,0) as float) DecreaseFiltration,Cast(Coalesce(cob.RecoveredBeerInFiltration,0) as float) RecoveredBeerInFiltration,
			Cast(Coalesce(cob.Dilution,0) as float) Dilution
			from REL_PackingWo_HighBeer rel
			LEFT JOIN COB_MSM_ArticlesParametersForDecanting cob on cob.DefID=rel.PackingArticleID
			WHERE Mosto like 'F%')aux	
			order by Cast(PackingArticleID as numeric)

GO
/****** Object:  View [dbo].[RelPackingWo_HighBeer]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelPackingWo_HighBeer]
AS
SELECT DISTINCT ID, PackingArticleID AS Defid, Czh, PPR, Description AS Descript, CZAEnv AS CZAENV, Mosto AS HDBeer, '' AS Test
FROM            dbo.REL_PackingWo_HighBeer

GO
/****** Object:  View [dbo].[RelPackingWOHighBeer_COB_ArticlesParametersWP]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelPackingWOHighBeer_COB_ArticlesParametersWP]
AS
SELECT DISTINCT 
                         rel.ID, rel.PackingArticleID, rel.Czh, rel.PPR, rel.Description, rel.CZAEnv, rel.Mosto, cob.DefID, cob.Cerveza, COALESCE (cob.MermaEnvasado, 0) 
                         AS MermaEnvasado, COALESCE (cob.MermaFiltracion, 0) AS MermaFiltracion, COALESCE (cob.FiltracionRecuperado, 0) AS FiltracionRecuperado, 
                         COALESCE (cob.Dilucion, 0) AS Dilucion, cob.ID AS ParameterID
FROM            dbo.REL_PackingWo_HighBeer AS rel LEFT OUTER JOIN
                         dbo.COB_MSM_ArticlesParametersForDecantingWP AS cob ON cob.DefID = rel.PackingArticleID

GO
/****** Object:  View [dbo].[RelWO_HDBeer]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[RelWO_HDBeer]
AS
SELECT DISTINCT ID, PackingArticleID, Czh, PPR, Description, CZAEnv, Mosto
FROM            dbo.REL_PackingWo_HighBeer

GO
/****** Object:  View [dbo].[SalasCocciones]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE VIEW [dbo].[SalasCocciones]
AS
	select h.locpk, h.locpath, h.localias
	from sitmesdb.dbo.mmlocations p
		inner join sitmesdb.dbo.mmlocations h on p.locpk = h.parentlocpk
			and p.locid = 'COCCION' and h.locid LIKE '%SC%'

GO
/****** Object:  View [dbo].[TiposPlantillaTurno]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[TiposPlantillaTurno]
AS
SELECT
	shc_period_work_sched_pk AS PK
	,id AS Id
	,label AS Nombre
FROM SITMesDB.dbo.SHC_PERIOD_WORK_SCHED
WHERE (shc_period_work_sched_pk > 0)
AND (NOT (id LIKE '%-%'))


GO
/****** Object:  View [dbo].[TiposTurno]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[TiposTurno]
AS
SELECT
	id AS Id
	,work_start AS Inicio
	,CASE isdayafter
		WHEN 1 THEN DATEADD(DAY,1, work_end)
		ELSE work_end
	END AS Fin
	,label AS Nombre
	,work_start_bias as Bias
FROM SITMesDB.dbo.SHC_WORKING_TIME



GO
/****** Object:  View [dbo].[TurnosFabrica]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[TurnosFabrica]
AS
SELECT DISTINCT
	TurnosFabrica.work_date AS PrimerDiaSemana
	,DATEPART(WEEK, TurnosFabrica.work_date) AS NumeroSemana
	,TurnosFabrica.shc_working_day_id AS PlantillaTurno
	,LineaTFab.id AS IdLinea
FROM SITMesDB.dbo.SHC_WORK_SCHED_DAY AS TurnosFabrica
INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS LineaTFab
	ON TurnosFabrica.shc_work_sched_pk = LineaTFab.shc_work_sched_pk



GO
/****** Object:  View [dbo].[TurnosOEE]    Script Date: 05/06/2018 15:46:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[TurnosOEE]
AS
SELECT        SCH.shc_work_sched_day_pk AS Id, REPLACE(LN.id, 'SHC_', '') AS Linea, SCH.work_date AS Fecha, SCH.work_start AS InicioTurno, SCH.work_end AS FinTurno, 
                         BR.break_start AS InicioBreak, BR.break_end AS FinBreak, ISNULL(SCH.shc_shift_id, 0) AS IdTipoTurno, WT.label AS Turno, COBT.OEE_CRITICO, 
                         COBT.OEE_OBJETIVO
FROM            SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS SCH LEFT OUTER JOIN
                         SITMesDB.dbo.SHC_WORK_SCHED AS LN ON SCH.shc_work_sched_pk = LN.shc_work_sched_pk INNER JOIN
                         SITMesDB.dbo.SHC_WORKING_TIME AS WT ON WT.id = ISNULL(SCH.shc_shift_id, 0) LEFT OUTER JOIN
                         SITMesDB.dbo.SHC_WORK_SCHED_BREAK AS BR ON BR.shc_work_sched_day_pk = SCH.shc_work_sched_day_pk LEFT OUTER JOIN
                         dbo.COB_MSM_CONSOLIDADO_TURNO AS COBT ON SCH.shc_work_sched_day_pk = COBT.SHC_WORK_SCHED_DAY_PK AND 
                         COBT.SHC_WORK_SCHED_DAY_PK <> 0

GO
