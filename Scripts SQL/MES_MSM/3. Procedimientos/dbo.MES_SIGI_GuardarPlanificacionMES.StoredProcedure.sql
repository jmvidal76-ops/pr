USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SIGI_GuardarPlanificacionMES]    Script Date: 07/06/2022 13:36:10 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 29-03-2022
-- Description:	Se obtienen las WO planificadas e iniciando con inicio planificado mayor que el momento actual
-- =============================================
CREATE PROCEDURE [dbo].[MES_SIGI_GuardarPlanificacionMES]
AS
BEGIN
	SET NOCOUNT ON;

	DELETE FROM dbo.SIGI_SecuenciacionMES;

	INSERT INTO dbo.SIGI_SecuenciacionMES
	SELECT
		P.Linea, 
		ISNULL(R.IdProducto, 0),
		R.Descripcion,
		P.FecIniEstimada,
		P.Id,
		P.EstadoAct
	FROM dbo.Particiones P
	LEFT OUTER JOIN dbo.Productos R ON R.IdProducto = P.IdProducto
	WHERE P.FecIniEstimada > GETUTCDATE() AND (P.EstadoAct = 'Planificada' OR P.EstadoAct = 'Iniciando') 
	ORDER BY FecIniEstimada

END
GO

