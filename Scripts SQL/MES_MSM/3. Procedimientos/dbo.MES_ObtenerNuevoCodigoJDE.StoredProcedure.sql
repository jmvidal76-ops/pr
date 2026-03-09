USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_ObtenerNuevoCodigoJDE]    Script Date: 27/07/2022 10:05:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 04-05-2022
-- Description:	Obtiene el siguiente codigo de OT valido del sistema JDE, tabla F4801/WADOCO
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerNuevoCodigoJDE]
	@NUEVO_CODIGO int out
AS

DECLARE @ERROR_NUMBER int
DECLARE @ERROR_PROCEDURE nvarchar(max)
DECLARE @ERROR_MESSAGE nvarchar(max)
DECLARE @RESULTADO int = 0
BEGIN
	BEGIN TRY
		SET NOCOUNT ON;

		SELECT TOP(1) @NUEVO_CODIGO = c.ContadorOT_DOCO
		FROM dbo.MantenimientoConfiguracion c

		DECLARE @EXISTE bit

		-- Iteramos hasta obtener un codigo que no exista en JDE
		while isnull(@EXISTE, 1) = 1
		begin

			SELECT @EXISTE = count(EXISTE) FROM (
				SELECT 1 AS EXISTE FROM [JDE].[S4405712].[PRODDTA].[F4801] where WADOCO = @NUEVO_CODIGO
			) a

			SELECT @NUEVO_CODIGO = @NUEVO_CODIGO + convert(int, @EXISTE)
		end
	
		UPDATE MantenimientoConfiguracion SET
		ContadorOT_DOCO = @NUEVO_CODIGO

		RETURN @RESULTADO

		END TRY
		BEGIN CATCH
			
			IF @RESULTADO = 0
			BEGIN
				SELECT @RESULTADO = 10008
			END

			SET @ERROR_NUMBER = ERROR_NUMBER()
			SET @ERROR_PROCEDURE = ERROR_PROCEDURE()
			SET @ERROR_MESSAGE = ERROR_MESSAGE()

			IF @ERROR_NUMBER = 547 -- Se referencia desde otras tablas
			SET @RESULTADO = 10002
			ELSE IF (@ERROR_NUMBER = 2627 ) -- Clave primaria duplicada
			SET @RESULTADO = 10001

			SELECT CODE = @RESULTADO, ERROR = @ERROR_MESSAGE
			RETURN @RESULTADO

		END CATCH
	
END
GO


