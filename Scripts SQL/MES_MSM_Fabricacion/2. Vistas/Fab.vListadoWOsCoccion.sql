USE [MES_MSM_Fabricacion]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

ALTER VIEW [Fab].[vListadoWOsCoccion]
AS
	SELECT   WOs.IdWO
			,WOs.CodWO
			,WOs.LoteMES
			,WOs.FechaInicioPlan
			,WOs.FechaFinPlan
			,WOs.CantidadPlan
			,WOs.FechaInicioReal
			,WOs.FechaFinReal
			,WOs.CantidadReal
			,WOs.NotasWO
			,WOs.[IdUbicacion]
			,UB.[Nombre] AS NombreUbicacion
			,'--' AS DescUbicacion--Campo ficticio hasta que se cree el campo en tabla origen [MES_MSM_Trazabilidad].[UBI].[tUbicacion] tarea DevOps #1453
			,WOs.IdTipoWO
			,TW.DescTipoWO
			,WOs.IdEstadoWO
			,EW.DescEstadoWO
			,EW.ColorEstadoWO
			,WOs.IdEstadoLIMS
			,EL.DescEstadoLIMS
			,EL.ColorEstadoLIMS
			,NC.NCoccion
			,ES.ExtractoSeco
			,EC.EficienciaCoccion
			,MT.IdMaterial
			,MT.DescMaterial
			,MT.UdMedida
			,EK.IdEstadoKOP
			,EK.ColorEstadoKOP
			,EK.DescEstadoKOP
			,WOs.Recalcular
			,WOs.FechaActualizado
	FROM	[MES_MSM_Fabricacion].[Fab].[WOs]
			INNER JOIN [MES_MSM_Fabricacion].[Fab].[TiposWO] AS TW ON TW.IdTipoWO = WOs.IdTipoWO
			INNER JOIN [MES_MSM_Fabricacion].[Fab].[EstadosWO] AS EW ON EW.IdEstadoWO = WOs.IdEstadoWO
			INNER JOIN [MES_MSM_Fabricacion].[Fab].[EstadosLIMS] AS EL ON EL.IdEstadoLIMS = WOs.IdEstadoLIMS
			INNER JOIN [MES_MSM_Trazabilidad].[UBI].[tUbicacion] AS UB ON UB.IdUbicacion = WOs.IdUbicacion
			INNER JOIN (SELECT	convert(integer,ValorPropiedadWO) AS NCoccion, IdWO 
						FROM	[MES_MSM_Fabricacion].[Fab].[PropiedadesWO] 
						WHERE	DescPropiedadWO = 'Número Cocción') AS NC ON NC.IdWO = WOs.IdWO
			INNER JOIN (SELECT	convert(float,ValorPropiedadWO) AS ExtractoSeco, IdWO 
						FROM	[MES_MSM_Fabricacion].[Fab].[PropiedadesWO] 
						WHERE	DescPropiedadWO = 'Extracto seco primitivo') AS ES ON ES.IdWO = WOs.IdWO
			INNER JOIN (SELECT	convert(float,ValorPropiedadWO) AS EficienciaCoccion, IdWO 
						FROM	[MES_MSM_Fabricacion].[Fab].[PropiedadesWO] 
						WHERE	DescPropiedadWO = 'Eficiencia cocción') AS EC ON EC.IdWO = WOs.IdWO
			INNER JOIN (SELECT	Prop.ValorPropiedadWO AS IdMaterial, Mat.Descripcion AS DescMaterial, Prop.IdWO, Mat.UdMedida
						FROM	[MES_MSM_Fabricacion].[Fab].[PropiedadesWO] AS Prop
								INNER JOIN [MES_MSM_Trazabilidad].[MAT].[vMateriales] AS Mat ON Mat.IdMaterial = Prop.ValorPropiedadWO
						WHERE	DescPropiedadWO = 'Material') AS MT ON MT.IdWO = WOs.IdWO
			INNER JOIN [MES_MSM_Fabricacion].[Fab].[vEstadoKOP_WO] AS LE ON LE.IdWO = WOs.IdWO
			INNER JOIN [MES_MSM_Fabricacion].[Fab].[EstadosKOP] AS EK ON EK.IdEstadoKOP = LE.IdEstadoKOP
	WHERE	WOs.IdTipoWO = 1
	--AND		WOs.IdEstadoWO != 4
GO


