USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SIGI_EnviarPlanificacionMES]    Script Date: 07/06/2022 13:35:37 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 11-04-2022
-- Description:	Se envía la planificación inicial de MES para su preparación antes de pasarlo a SIGI
-- =============================================
CREATE PROCEDURE [dbo].[MES_SIGI_EnviarPlanificacionMES]
	@tipo int,
    @idEtiquetaSIGI nvarchar(50) = null,
    @esAutomatico bit = null
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @idLinea nvarchar(50), @conPlanificacion bit

	IF @tipo = 1 --Manual
	BEGIN
		SELECT @idLinea = LineaMES, @conPlanificacion = ConPlanificacion FROM dbo.SIGI_Configuracion WHERE IdEtiquetaSIGI = @idEtiquetaSIGI
		
		IF @conPlanificacion = 0 RETURN

		DELETE FROM dbo.SIGI_SecuenciacionSIGI
		WHERE IdLinea = @idLinea

		INSERT INTO dbo.SIGI_SecuenciacionSIGI
		SELECT 
			@idEtiquetaSIGI, IdLinea, IdProducto, DescripcionProducto, ROW_NUMBER() OVER(ORDER BY FechaInicioPlanificado)
		FROM dbo.SIGI_SecuenciacionMES
		WHERE IdLinea = @idLinea
	END
	ELSE IF @tipo = 2 --Automático
	BEGIN
		SELECT @idLinea = LineaMES, @conPlanificacion = ConPlanificacion FROM dbo.SIGI_Configuracion WHERE IdEtiquetaSIGI = @idEtiquetaSIGI
		
		IF @conPlanificacion = 0 RETURN

		UPDATE dbo.SIGI_Configuracion
		SET TransferenciaAutomatica = @esAutomatico
		WHERE IdEtiquetaSIGI = @idEtiquetaSIGI

		IF @esAutomatico = 1
		BEGIN
			DELETE FROM dbo.SIGI_SecuenciacionSIGI
			WHERE IdLinea = @idLinea

			INSERT INTO dbo.SIGI_SecuenciacionSIGI
			SELECT 
				@idEtiquetaSIGI, IdLinea, IdProducto, DescripcionProducto, ROW_NUMBER() OVER(ORDER BY FechaInicioPlanificado)
			FROM dbo.SIGI_SecuenciacionMES
			WHERE IdLinea = @idLinea
		END
	END
	ELSE --A través del job
	BEGIN
		DECLARE @lineas TABLE (IdFila bigint, IdLinea nvarchar(50))

		INSERT INTO @lineas
		SELECT DISTINCT DENSE_RANK() OVER(ORDER BY IdLinea), IdLinea
		FROM dbo.SIGI_SecuenciacionMES

		DECLARE @contFilas int, @filas int, @idFila bigint, @linea nvarchar(50)

		SET @contFilas = 1
		SET @filas = (SELECT COUNT(*) FROM @lineas)
		SET @idFila = (SELECT MIN(IdFila) FROM @lineas)

		WHILE @contFilas <= @filas
		BEGIN
			SELECT 
				@linea = IdLinea
			FROM @lineas
			WHERE IdFila = @idFila

			SELECT @idEtiquetaSIGI = IdEtiquetaSIGI, @esAutomatico = TransferenciaAutomatica 
			FROM SIGI_Configuracion WHERE LineaMES = @linea AND ConPlanificacion = 1

			IF @esAutomatico = 0
			BEGIN
				SET @idFila = @idFila + 1
				SET @contFilas = @contFilas + 1;
				CONTINUE
			END

			DELETE FROM dbo.SIGI_SecuenciacionSIGI
			WHERE IdLinea = @linea

			INSERT INTO dbo.SIGI_SecuenciacionSIGI
			SELECT 
				@idEtiquetaSIGI, IdLinea, IdProducto, DescripcionProducto, ROW_NUMBER() OVER(ORDER BY FechaInicioPlanificado)
			FROM dbo.SIGI_SecuenciacionMES
			WHERE IdLinea = @linea

			SET @idFila = @idFila + 1
			SET @contFilas = @contFilas + 1;
		END
	END
END
GO

