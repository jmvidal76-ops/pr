USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SIGI_ObtenerSecuenciaActiva]    Script Date: 07/06/2022 13:36:27 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 11-04-2022
-- Description:	Se envía la planificación inicial de MES para su preparación antes de pasarlo a SIGI
-- =============================================
CREATE PROCEDURE [dbo].[MES_SIGI_ObtenerSecuenciaActiva]
	@idEtiquetaSIGI int
AS
BEGIN
	SET NOCOUNT ON;

	SELECT CONMES
	FROM dbo.SIGI_Trenes
	WHERE ID = @idEtiquetaSIGI

	--SELECT CONMES
	--FROM [SIGI].[SIGI].[dbo].[TRENES]
	--WHERE ID = @idEtiquetaSIGI
END
GO

