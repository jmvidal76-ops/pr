USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SanearImagenesAdherenciaIntermedia]    Script Date: 28/04/2022 12:21:12 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:	Daniel Abad Jaraute
-- Create date: 22-04-2022
-- Description:	Elimina las imágenes de Adhesión Intermedia de tipo PLAN_INT_1, y renombra las de tipo PLAN_INT_2 a PLAN_INT_1
-- =============================================
CREATE PROCEDURE [dbo].[MES_SanearImagenesAdherenciaIntermedia] 
	--@borrarIntermedias bit = 0
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

	-- Borramos las imágenes que ya no son necesarias:	
	-- las de tipo PLAN_INT_1 que tengan una correspondiente PLAN_INT_2
	DELETE FROM dbo.AdherenciaImagenesPlanificacion
	WHERE Anio = @anio AND Semana = @semana 
	AND TipoImagen like 'PLAN_INT_1' AND Procesado = 1
	--AND	CASE	WHEN @borrarIntermedias = 1 AND TipoImagen like 'PLAN_INT_%' THEN 1 
	--			WHEN TipoImagen like 'PLAN_INT_1' AND Procesado = 1 THEN 1
	--			ELSE 0 END
	--	= 1

	-- Actualizamos las de tipo PLAN_INT_2 a PLAN_INT_1
	UPDATE dbo.AdherenciaImagenesPlanificacion
	SET TipoImagen = 'PLAN_INT_1'
		,Procesado = 0
	WHERE TipoImagen like 'PLAN_INT_2' AND Anio = @anio AND Semana = @semana

END
GO


