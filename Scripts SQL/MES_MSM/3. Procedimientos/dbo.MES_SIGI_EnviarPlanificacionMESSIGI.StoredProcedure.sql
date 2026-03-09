USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SIGI_EnviarPlanificacionMESSIGI]    Script Date: 07/06/2022 16:08:04 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 11-04-2022
-- Description:	Se envía la planificación preparada de MES a la columna SecuenciaMES de la tabla Trenes de SIGI
-- =============================================
CREATE PROCEDURE [dbo].[MES_SIGI_EnviarPlanificacionMESSIGI]
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @etiquetasSIGI TABLE (IdFila bigint, IdEtiquetaSIGI int)

	INSERT INTO @etiquetasSIGI
	SELECT DISTINCT DENSE_RANK() OVER(ORDER BY IdLinea), IdEtiquetaSIGI
	FROM dbo.SIGI_SecuenciacionSIGI

	DECLARE @contFilas int, @filas int, @idFila bigint, @idEtiqueta int, @nuevaSecuencia nvarchar(100),
		@secuencia nvarchar(100), @secuenciaMES nvarchar(100), @productocaja nvarchar(10), @conPlanificacion bit,
		@contSecuencia int, @contSecuenciaMES int 

	SET @contFilas = 1
	SET @filas = (SELECT COUNT(*) FROM @etiquetasSIGI)
	SET @idFila = (SELECT MIN(IdFila) FROM @etiquetasSIGI)

	WHILE @contFilas <= @filas
	BEGIN
		SELECT 
			@idEtiqueta = IdEtiquetaSIGI
		FROM @etiquetasSIGI
		WHERE IdFila = @idFila

		SELECT @conPlanificacion = ConPlanificacion FROM dbo.SIGI_Configuracion WHERE IdEtiquetaSIGI = @idEtiqueta

		IF @conPlanificacion = 0
		BEGIN
			SELECT @secuencia = SECUENCIA, @secuenciaMES = SECUENCIA_MES
			FROM dbo.SIGI_Trenes
			WHERE ID = @idEtiqueta

			--SELECT @secuencia = SECUENCIA, @secuenciaMES = SECUENCIA_MES
			--FROM [SIGI].[SIGI].[dbo].[TRENES]
			--WHERE ID = @idEtiqueta

			SET @contSecuencia = LEN(@secuencia) - LEN(REPLACE(@secuencia, ';', '')) + 1
			SET @contSecuenciaMES = LEN(@secuenciaMES) - LEN(REPLACE(@secuenciaMES, ';', '')) + 1

			IF LEN(@secuencia) = 0
			BEGIN
				SET @contSecuencia = 0
			END

			IF LEN(@secuenciaMES) = 0
			BEGIN
				SET @contSecuenciaMES = 0
			END
			
			IF @contSecuencia < @contSecuenciaMES
			BEGIN
				IF @contSecuenciaMES = 1
				BEGIN
					SET @productocaja = @secuenciaMES
				END
				ELSE
				BEGIN
					SET @productocaja = SUBSTRING(@secuenciaMES, 0, CHARINDEX(';', @secuenciaMES, 0))
				END

				DELETE FROM dbo.SIGI_SecuenciacionSIGI
				WHERE IdEtiquetaSIGI = @idEtiqueta AND ProductoCaja = @productoCaja
			END
		END

		SET @nuevaSecuencia = (SELECT STUFF((SELECT ';' + S.ProductoCaja
									  FROM dbo.SIGI_SecuenciacionSIGI S
									  WHERE S.IdEtiquetaSIGI = @idEtiqueta
									  ORDER BY S.Orden
									  FOR XML PATH('')),1,1,''))

		UPDATE dbo.SIGI_Trenes
		SET SECUENCIA_MES = CASE WHEN @nuevaSecuencia IS NULL THEN '' ELSE @nuevaSecuencia END
		WHERE ID = @idEtiqueta

		--UPDATE [SIGI].[SIGI].[dbo].[TRENES]
		--SET SECUENCIA_MES = CASE WHEN @nuevaSecuencia IS NULL THEN '' ELSE @nuevaSecuencia END
		--WHERE ID = @idEtiqueta

		SET @idFila = @idFila + 1
		SET @contFilas = @contFilas + 1;
	END
END
GO

