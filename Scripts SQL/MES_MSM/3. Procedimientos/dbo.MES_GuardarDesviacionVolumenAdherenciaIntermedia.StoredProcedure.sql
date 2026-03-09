USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_GuardarDesviacionVolumenAdherenciaIntermedia]    Script Date: 28/04/2022 12:19:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 22/04/2022
-- Description:	Se obtienen las desviaciones en volumen de las Adherencias Intermedias
-- =============================================
CREATE PROCEDURE [dbo].[MES_GuardarDesviacionVolumenAdherenciaIntermedia] 	

AS
BEGIN
	SET NOCOUNT ON;

	SET LANGUAGE Spanish

	DECLARE @fecha date
	DECLARE @anio INT
	SET @fecha = GETDATE() --DATEADD(day, -7, GETDATE())

	DECLARE @semana AS INT
	SET @semana = DATEPART(ISOWK, @fecha)
	
	IF @semana >= 52 AND MONTH(@fecha) = 1
	BEGIN
		SET @anio = YEAR(@fecha) - 1;
	END
	ELSE IF @semana = 1 AND MONTH(@fecha) = 12
	BEGIN
		SET @anio = YEAR(@fecha) + 1;
	END
	ELSE
	BEGIN
		SET @anio = YEAR(@fecha)
	END

	DECLARE @Data TABLE (Id int, TipoImagen nvarchar(50), Anio int, Semana int, Linea nvarchar(100), WO nvarchar(50), FecIniEstimada datetime,
				     FecFinEstimada datetime, FecIniReal datetime, FecFinReal datetime, FecModif datetime, Formato nvarchar(100),
				     IdPaleta nvarchar(50), IdItem nvarchar(50), DescripProducto nvarchar(255), CantidadPlanificada float, 
				     CantidadProducida float, Unidad nvarchar(10), ConversionCPB int, ConversionHL float, Procesado bit)

	INSERT INTO @Data
	SELECT AI1.* 
	FROM AdherenciaImagenesPlanificacion AI1
	WHERE 
		-- Sólo hacemos los cálculos si existen imagenes PLAN_INT_1 y PLAN_INT_2
		CASE 
		WHEN TipoImagen = 'PLAN_INT_1' 
			AND EXISTS (
			SELECT 1 FROM AdherenciaImagenesPlanificacion AI2 
			WHERE AI1.Anio = AI2.Anio
				AND AI1.Semana = AI2.Semana
				AND AI1.IdPaleta = AI2.IdPaleta
				AND AI2.TipoImagen LIKE 'PLAN_INT_2')
		THEN 1
		WHEN TipoImagen = 'PLAN_INT_2'
		AND EXISTS (
			SELECT 1 FROM AdherenciaImagenesPlanificacion AI2 
			WHERE AI1.Anio = AI2.Anio
				AND AI1.Semana = AI2.Semana
				AND AI1.IdPaleta = AI2.IdPaleta
				AND AI2.TipoImagen LIKE 'PLAN_INT_1')
		THEN 1
		ELSE 0 END
	= 1
	AND Anio = @anio AND Semana = @semana AND Procesado = 0

	-- Usamos un merge para actualizar los posibles registros existentes, o insertar los nuevos
	MERGE dbo.AdherenciaDesviacionVolumen AS A
	USING (SELECT 
		aux.*
		from (
			SELECT 
			'PLAN_INT' AS  TipoComparacion,
			ISNULL(PlanInt1.Anio, PlanInt2.Anio) AS Anio,
			ISNULL(PlanInt1.Semana, PlanInt2.Semana) AS Semana,
			GETDATE() AS FecModif,
			ISNULL(PlanInt1.Formato, PlanInt2.Formato) AS Formato,
			ISNULL(PlanInt1.IdPaleta, PlanInt2.IdPaleta) AS IdPaleta,
			ISNULL(PlanInt1.IdItem, PlanInt2.IdItem) AS ItemMD,
			ISNULL(PlanInt1.DescripProducto, PlanInt2.DescripProducto) AS Descripcion,
			ISNULL(PlanInt1.CPBPlanificados, 0) AS CPBPlanificados,
			ISNULL(PlanInt2.CPBReales, 0) AS CPBReales,
			ISNULL(PlanInt1.HLPlanificados, 0) AS HLPlanificados,
			ISNULL(PlanInt2.HLReales, 0) AS HLReales,
			CASE WHEN PlanInt1.CPBPlanificados = 0 THEN 100
				WHEN (((ISNULL(PlanInt2.CPBReales, 0) - ISNULL(PlanInt1.CPBPlanificados, 0)) / ISNULL(PlanInt1.CPBPlanificados, 1)) * 100) > 100 THEN 100 
				ELSE ((ISNULL(PlanInt2.CPBReales, 0) - ISNULL(PlanInt1.CPBPlanificados, 0)) / ISNULL(PlanInt1.CPBPlanificados, 1)) * 100 END AS Desviacion,
			(SELECT Valor FROM dbo.AdherenciaParametros WHERE Id = 1) AS DesviacionObjetivoPlanPlan,
			(SELECT Valor FROM dbo.AdherenciaParametros WHERE Id = 2) AS DesviacionObjetivoPlanReal,
			'ZZ' AS IdMotivo
		FROM
		(SELECT
			Anio,
			Semana,
			Formato,
			IdPaleta,
			IdItem,
			DescripProducto,
			(SUM(CantidadPlanificada) * ConversionCPB) AS CPBPlanificados, 
			(SUM(CantidadPlanificada) * ConversionHL) AS HLPlanificados
		FROM @Data
		WHERE TipoImagen = 'PLAN_INT_1' --AND Semana >= @semanaIni AND Semana <= @semanaFin AND Procesado = 0
		GROUP BY Anio, Semana, IdPaleta, IdItem, Formato, DescripProducto, ConversionCPB, ConversionHL) AS PlanInt1
		FULL OUTER JOIN 
		(SELECT
			Anio,
			Semana,
			Formato,
			IdPaleta,
			IdItem,
			DescripProducto,
			(SUM(CantidadPlanificada) * ConversionCPB) AS CPBReales,
			(SUM(CantidadPlanificada) * ConversionHL) AS HLReales
		FROM @Data 
		WHERE tipoImagen = 'PLAN_INT_2' --AND Semana >= @semanaIni AND Semana <= @semanaFin AND Procesado = 0
		GROUP BY Anio, Semana, IdPaleta, IdItem, Formato, DescripProducto, ConversionCPB, ConversionHL) AS PlanInt2
		ON PlanInt1.Semana = PlanInt2.Semana AND PlanInt1.IdPaleta = PlanInt2.IdPaleta
		) aux
		-- Sólo añadimos los registros inadherentes
		WHERE ABS(aux.Desviacion) > aux.DesviacionObjetivoPlanPlan) AS B
	ON (A.Anio = B.Anio AND A.Semana = B.Semana AND A.IdPaleta = B.IdPaleta)
	WHEN MATCHED THEN
		UPDATE SET
			A.FecModif = GETDATE()
			, A.CPBPlanificados					= B.CPBPlanificados				
			, A.CPBReales						= B.CPBReales					
			, A.HLPlanificados					= B.HLPlanificados				
			, A.HLReales						= B.HLReales					
			, A.Desviacion						= B.Desviacion					
			, A.DesviacionObjetivoPlanPlan		= B.DesviacionObjetivoPlanPlan	
			, A.DesviacionObjetivoPlanReal		= B.DesviacionObjetivoPlanReal	
	WHEN NOT MATCHED THEN
		INSERT (TipoComparacion, Anio, Semana, FecModif, Formato, IdPaleta, ItemMD, Descripcion, CPBPlanificados, 
		CPBReales, HLPlanificados, HLReales, Desviacion, DesviacionObjetivoPlanPlan, DesviacionObjetivoPlanReal, IdMotivo)
		VALUES (B.TipoComparacion, B.Anio, B.Semana, B.FecModif, B.Formato, B.IdPaleta, B.ItemMD, B.Descripcion, B.CPBPlanificados, 
		B.CPBReales, B.HLPlanificados, B.HLReales, B.Desviacion, B.DesviacionObjetivoPlanPlan, B.DesviacionObjetivoPlanReal, B.IdMotivo);


	--INSERT INTO dbo.AdherenciaDesviacionVolumen(TipoComparacion, Anio, Semana, FecModif, Formato, IdPaleta, ItemMD, Descripcion, CPBPlanificados, 
	--	CPBReales, HLPlanificados, HLReales, Desviacion, DesviacionObjetivoPlanPlan, DesviacionObjetivoPlanReal, IdMotivo)
	--SELECT 
	--aux.*
	--from (
	--	SELECT 
	--	'PLAN_INT' AS  TipoComparacion,
	--	ISNULL(PlanInt1.Anio, PlanInt2.Anio) AS Anio,
	--	ISNULL(PlanInt1.Semana, PlanInt2.Semana) AS Semana,
	--	GETDATE() AS FecModif,
	--	ISNULL(PlanInt1.Formato, PlanInt2.Formato) AS Formato,
	--	ISNULL(PlanInt1.IdPaleta, PlanInt2.IdPaleta) AS IdPaleta,
	--	ISNULL(PlanInt1.IdItem, PlanInt2.IdItem) AS ItemMD,
	--	ISNULL(PlanInt1.DescripProducto, PlanInt2.DescripProducto) AS Descripcion,
	--	ISNULL(PlanInt1.CPBPlanificados, 0) AS CPBPlanificados,
	--	ISNULL(PlanInt2.CPBReales, 0) AS CPBReales,
	--	ISNULL(PlanInt1.HLPlanificados, 0) AS HLPlanificados,
	--	ISNULL(PlanInt2.HLReales, 0) AS HLReales,
	--	CASE WHEN PlanInt1.CPBPlanificados = 0 THEN 100
	--		WHEN (((ISNULL(PlanInt2.CPBReales, 0) - ISNULL(PlanInt1.CPBPlanificados, 0)) / ISNULL(PlanInt1.CPBPlanificados, 1)) * 100) > 100 THEN 100 
	--		ELSE ((ISNULL(PlanInt2.CPBReales, 0) - ISNULL(PlanInt1.CPBPlanificados, 0)) / ISNULL(PlanInt1.CPBPlanificados, 1)) * 100 END AS Desviacion,
	--	(SELECT Valor FROM dbo.AdherenciaParametros WHERE Id = 1) AS DesviacionObjetivoPlanPlan,
	--	(SELECT Valor FROM dbo.AdherenciaParametros WHERE Id = 2) AS DesviacionObjetivoPlanReal,
	--	'ZZ' AS IdMotivo
	--FROM
	--(SELECT
	--	Anio,
	--	Semana,
	--	Formato,
	--	IdPaleta,
	--	IdItem,
	--	DescripProducto,
	--	(SUM(CantidadPlanificada) * ConversionCPB) AS CPBPlanificados, 
	--	(SUM(CantidadPlanificada) * ConversionHL) AS HLPlanificados
	--FROM @Data
	--WHERE TipoImagen = 'PLAN_INT_1' --AND Semana >= @semanaIni AND Semana <= @semanaFin AND Procesado = 0
	--GROUP BY Anio, Semana, IdPaleta, IdItem, Formato, DescripProducto, ConversionCPB, ConversionHL) AS PlanInt1
	--FULL OUTER JOIN 
	--(SELECT
	--	Anio,
	--	Semana,
	--	Formato,
	--	IdPaleta,
	--	IdItem,
	--	DescripProducto,
	--	(SUM(CantidadPlanificada) * ConversionCPB) AS CPBReales,
	--	(SUM(CantidadPlanificada) * ConversionHL) AS HLReales
	--FROM @Data 
	--WHERE tipoImagen = 'PLAN_INT_2' --AND Semana >= @semanaIni AND Semana <= @semanaFin AND Procesado = 0
	--GROUP BY Anio, Semana, IdPaleta, IdItem, Formato, DescripProducto, ConversionCPB, ConversionHL) AS PlanInt2
	--ON PlanInt1.Semana = PlanInt2.Semana AND PlanInt1.IdPaleta = PlanInt2.IdPaleta
	--) aux
	---- Sólo añadimos los registros inadherentes
	--WHERE ABS(aux.Desviacion) > aux.DesviacionObjetivoPlanPlan

	UPDATE AdherenciaImagenesPlanificacion
	SET Procesado = 1
	WHERE Id IN (SELECT Id FROM @Data)

END
GO


