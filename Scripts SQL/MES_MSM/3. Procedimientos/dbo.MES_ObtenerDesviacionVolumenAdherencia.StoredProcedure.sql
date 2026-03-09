USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_ObtenerDesviacionVolumenAdherencia]    Script Date: 26/04/2022 9:06:46 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 14-01-2020
-- Description:	Se obtienen las desviaciones en volumen de Adherencia en función de los parámetros solicitados 
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDesviacionVolumenAdherencia]
	@tipoComparacion NVARCHAR(50),
	@anioIni INT,
	@semanaIni INT,
	@anioFin INT,
	@semanaFin INT,
	@esAdherente INT
AS
BEGIN
	SET NOCOUNT ON;

	-- 25/04/2022 DAJ Versión Sin IF
	--SELECT *
	--FROM AdherenciaDesviacionVolumen
	--WHERE
	--	-- Comprobación del año y semana, teniendo en cuenta la posibilidad de que el año inicial y final del rango sean distintos
	--	CASE 
	--		-- Mismos años inicial y final
	--		WHEN @anioIni = @anioFin AND Anio = @anioIni AND Semana >= @semanaIni AND Semana <= @semanaFin THEN 1
	--		-- Distintos años inicial y final
	--		WHEN @anioIni != @anioFin AND ((Anio = @anioIni AND Semana >= @semanaIni) OR (Anio = @anioFin AND Semana <= @semanaFin)) THEN 1
	--		ELSE 0 END
	--	= 1 AND 
	--	TipoComparacion LIKE @tipoComparacion AND
	--	-- Comprobación para mostrar los adherentes o inadherentes
	--	CASE 
	--		WHEN
	--			@esAdherente = 1 
	--			AND 
	--			ABS(Desviacion) <= (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END) 
	--		THEN 1
	--		WHEN 
	--			@esAdherente != 1
	--			AND
	--			ABS(Desviacion) > (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END)
	--		THEN 1
	--		ELSE 0 END
	--	= 1
	--ORDER BY Semana


	IF @esAdherente = 1
	BEGIN
		IF @anioIni = @anioFin
		BEGIN
			SELECT *
			FROM AdherenciaDesviacionVolumen
			WHERE
				Anio = @anioIni AND Semana >= @semanaIni AND Semana <= @semanaFin AND 
				TipoComparacion LIKE @tipoComparacion AND 
				ABS(Desviacion) <= (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END)
			ORDER BY Semana
		END
		ELSE
		BEGIN
			SELECT *
			FROM AdherenciaDesviacionVolumen
			WHERE
				((Anio = @anioIni AND Semana >= @semanaIni) OR (Anio = @anioFin AND Semana <= @semanaFin)) AND 
				TipoComparacion LIKE @tipoComparacion AND 
				ABS(Desviacion) <= (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END)
			ORDER BY Anio, Semana
		END
	END
	ELSE
	BEGIN
		IF @anioIni = @anioFin
		BEGIN
			SELECT *
			FROM AdherenciaDesviacionVolumen
			WHERE
				Anio = @anioIni AND Semana >= @semanaIni AND Semana <= @semanaFin AND 
				TipoComparacion LIKE @tipoComparacion AND 
				ABS(Desviacion) > (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END)
			ORDER BY Semana
		END
		ELSE
		BEGIN
			SELECT *
			FROM AdherenciaDesviacionVolumen
			WHERE
				((Anio = @anioIni AND Semana >= @semanaIni) OR (Anio = @anioFin AND Semana <= @semanaFin)) AND 
				TipoComparacion LIKE @tipoComparacion AND 
				ABS(Desviacion) > (CASE WHEN @tipoComparacion like 'PLAN%' THEN DesviacionObjetivoPlanPlan ELSE DesviacionObjetivoPlanReal END)
			ORDER BY Anio, Semana
		END
	END
END
GO


