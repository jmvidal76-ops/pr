USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SIGI_ActivarSecuenciaAuto]    Script Date: 07/06/2022 13:35:19 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 07-04-2022
-- Description:	Se actualiza el valor de la columna CONMES de la tabla TRENES de SIGI de la línea solicitada
-- =============================================
CREATE PROCEDURE [dbo].[MES_SIGI_ActivarSecuenciaAuto]
	@idEtiquetaSIGI int,
	@valor bit
AS
BEGIN
	SET NOCOUNT ON;

	UPDATE dbo.SIGI_Trenes
	SET CONMES = @valor
	WHERE ID = @idEtiquetaSIGI

	--UPDATE [SIGI].[SIGI].[dbo].[TRENES]
	--SET CONMES = @valor
	--WHERE ID = @idEtiquetaSIGI

END
GO

