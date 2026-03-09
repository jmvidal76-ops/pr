USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_GuardarImagenesAdherenciaIntermedia]    Script Date: 26/04/2022 8:59:56 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:	Daniel Abad Jaraute
-- Create date: 22-04-2022
-- Description:	Se guardan mediante job imagenes cada hora para la Adherencia Intermedia
-- =============================================
CREATE PROCEDURE [dbo].[MES_GuardarImagenesAdherenciaIntermedia] 

AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @fechaActual date = GETDATE()
	DECLARE @anio int
	DECLARE @semana int
	DECLARE @fechaSemana date
	DECLARE @fechaInicial datetime
	DECLARE @fechaFinal datetime

	SET LANGUAGE Spanish
		SET @fechaSemana = @fechaActual --DATEADD(day, 7, @fechaActual)
		SET @semana = DATEPART(ISOWK, @fechaSemana)

		IF @semana >= 52 AND MONTH(@fechaSemana) = 1
		BEGIN
			SET @anio = YEAR(@fechaSemana) - 1;
		END
		ELSE IF @semana = 1 AND MONTH(@fechaSemana) = 12
		BEGIN
			SET @anio = YEAR(@fechaSemana) + 1;
		END
		ELSE
		BEGIN
			SET @anio = YEAR(@fechaSemana)
		END
		
		SELECT 
			@fechaInicial = INICIO,
			@fechaFinal = DATEADD(ms, -3, DATEADD(day, 1, FIN)) --Para que coja las 23:59:59 del día que queremos
		FROM SEMANAS
		WHERE AÑO = @anio AND SEMANA = @semana
	

		INSERT INTO dbo.AdherenciaImagenesPlanificacion(TipoImagen, Anio, Semana, Linea, WO, FecIniEstimada, FecFinEstimada, FecIniReal, 
			FecFinReal, FecModif, Formato, IdPaleta, IdItem, DescripProducto, CantidadPlanificada, CantidadProducida, Unidad, ConversionCPB, 
			ConversionHL, Procesado)
		SELECT 
			-- Hay que comprobar si existen PLAN_INT_1 previos y meter los nuevos como PLAN_INT_2, en caso contrario meterlos como PLAN_INT_1
			 CONCAT('PLAN_INT_', 
				CASE WHEN exists (SELECT 1 FROM dbo.AdherenciaImagenesPlanificacion ai 
									WHERE ai.anio = @anio AND ai.semana = @semana AND ai.idPaleta = pr.IdProducto AND ai.TipoImagen like 'PLAN_INT_1')
					THEN '2' ELSE '1' END) AS TipoImagen,
			@anio AS Anio,
			@semana AS Semana,
			(CASE WHEN pa.Linea = 'MSM.ALOVERA.ENVASADO.AB09' OR pa.Linea = 'MSM.ALOVERA.ENVASADO.AC09' THEN 'MSM.ALOVERA.ENVASADO.1109' ELSE pa.Linea END) AS Linea,
			pa.Id AS WO, 
			pa.FecIniEstimada,
			pa.FecFinEstimada, 
			pa.FecIniReal,
			pa.FecFinReal,
			GETDATE() AS FecModif,
			ISNULL((
				SELECT TOP 1 f.Descripcion
				FROM dbo.DeslizanteProductos p
				INNER JOIN dbo.DeslizanteFormatos f ON f.IdFormato = p.IdFormato
				WHERE p.Paleta = pa.IdProducto), '---') AS Formato,
			pr.IdProducto AS IdPaleta,
			ue.ID_TipoFormato AS IdItem,
			pr.Descripcion AS DescripProducto,
			pa.CantidadPlanificada,
			pa.CantidadProducida,
			pr.UdMedida AS Unidad,
			(CASE WHEN pa.CajasPorPalet = 0 OR pr.UdMedida = 'MD' THEN 1 ELSE pa.CajasPorPalet END) AS ConversionCPB,
			pa.EnvasesPorPalet * pa.HectolitrosProducto AS ConversionHL,
			0 AS Procesado
		FROM Particiones pa
		LEFT JOIN Productos pr ON pr.IdProducto = pa.IdProducto
		LEFT JOIN [INTERSPEC].[MSMIS].[dbo].[VISUnidadExpedicion] ue ON ue.CodigoExpedicion COLLATE modern_spanish_ci_as = pr.IdProducto
		WHERE pa.FecIniEstimada BETWEEN @fechaInicial AND @fechaFinal AND (pa.EstadoAct = 'Planificada' OR pa.EstadoAct = 'Creada')
		
END
GO


