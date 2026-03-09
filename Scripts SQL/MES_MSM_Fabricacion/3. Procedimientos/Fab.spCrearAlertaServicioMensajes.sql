USE [MES_MSM_Fabricacion]
GO

/****** Object:  StoredProcedure [Fab].[spCrearAlertaServicioMensajes]    Script Date: 27/06/2022 17:35:50 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Roberto Cristina Fernández
-- Create date: 24-06-2022
-- Description:	Se crea una alerta si se ha dejado de ejecutar el servicio de mensajes
-- =============================================
CREATE PROCEDURE [Fab].[spCrearAlertaServicioMensajes]
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @fecha datetime

    SELECT @fecha = CAST(Valor as datetime2)
	FROM [Fab].[ParametrosEjecucion]
	WHERE Enum_Descripcion = 'UltimaEjecucionProcesamientoMensajes'

	IF DATEDIFF(mi, @fecha, GETUTCDATE()) > 30
	BEGIN
		INSERT INTO MES_MSM.dbo.AlertasBasadasLogMails VALUES (
			0, 
			GETDATE(), 
			null, 
			'MES - Servicio Fabricación', 
			'Se ha detectado que se ha dejado de ejecutar el servicio MES de Fabricación', 
			'santiesp@mahou-sanmiguel.com;dhurayh@mahou-sanmiguel.com;aanselmif@mahou-sanmiguel.com',
			''
		)
	END
END
GO

