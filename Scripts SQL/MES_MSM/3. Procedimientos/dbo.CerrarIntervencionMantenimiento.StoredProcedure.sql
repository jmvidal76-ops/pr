USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_CerrarIntervencionMantenimiento]    Script Date: 06/06/2022 10:14:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 05-05-2022
-- Description:	Se cierra una solicitud de intervención de mantenimiento. Un job debe encargarse de actualizar en JDE las solicitudes cerradas.
-- =============================================
CREATE PROCEDURE [dbo].[MES_CerrarIntervencionMantenimiento]
	@Id int,
	@ComentarioCierre nvarchar(max)
AS

DECLARE @ERROR_NUMBER int
DECLARE @ERROR_PROCEDURE nvarchar(max)
DECLARE @ERROR_MESSAGE nvarchar(max)
DECLARE @RESULTADO int = 0
--DECLARE @TRANSACTION_OPEN bit = 0

BEGIN
	BEGIN TRY
		SET NOCOUNT ON;


		UPDATE MantenimientoIntervenciones SET
		ComentarioCierre = @ComentarioCierre,
		FechaCierre = GETUTCDATE(),
		Estado = 'M5'
		Where Id = @Id

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

		RETURN @RESULTADO

	END CATCH
END
GO


