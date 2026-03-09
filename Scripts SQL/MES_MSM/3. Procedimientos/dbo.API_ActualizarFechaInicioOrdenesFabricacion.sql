USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[API_ActualizarFechaInicioOrdenesFabricacion]    Script Date: 22/03/2021 14:00:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Alexis Anselmi
-- Create date: 22/03/2021
-- Description:	Este método se encarga de actualizar todas las fechas de inicio de las órdenes dependiendo si existen datos de Inicio de proceso en CRUDOS
-- Esto se creó en base a la primisa de que todas las órdenes se crean desde el proceso de Maceración, pero si existen datos de TIEMPO_INICIO_CRUDOS para la orden arrancada
-- se debe actualizar la fecha de inicio a esa misma fecha.
-- =============================================

CREATE PROCEDURE [dbo].[API_ActualizarFechaInicioOrdenesFabricacion]
AS
BEGIN
	SET NOCOUNT ON;
	
    --2 Se actualizan los datos del inicio de la orden, convirtiendolo a utc del dato que viene del KOP
	UPDATE [ORDER]
	SET 
		[ORDER].actual_start_time = DATEADD(MI,[ORDER].estimated_start_time_bias,dbo.CLR_DATETIME_ConvertStringToDate([KOP].[Valor_Actual]))
	FROM
		[MES_MSM].[dbo].[KOPs_FAB] [KOP]
		INNER JOIN  [SITMesDB].[dbo].[POM_ORDER] AS [ORDER] ON [ORDER].pom_order_id = [KOP].ID_Orden
	WHERE 
	  [KOP].[ID_KOP] =  'TIEMPO_INICIO_CRUDOS'
	  AND 
	  [KOP].[Valor_Actual] IS NOT NULL AND [KOP].[Valor_Actual] <> ''
	  AND 
	  ([ORDER].actual_start_time > DATEADD(MI,[ORDER].estimated_start_time_bias,dbo.CLR_DATETIME_ConvertStringToDate([KOP].[Valor_Actual]))
	  OR [ORDER].actual_start_time IS NULL)
END
GO


