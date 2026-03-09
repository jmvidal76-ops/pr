USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_SincronizarSolicitudesMantenimiento]    Script Date: 27/07/2022 10:09:09 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 15-05-2022
-- Description:	Proceso que actualiza los estados de las solicitudes de mantenimiento en MES desde JDE, y también cierra las solicitudes terminadas en JDE
-- =============================================
CREATE PROCEDURE [dbo].[MES_SincronizarSolicitudesMantenimiento]
	
AS

DECLARE @ERROR_NUMBER int
DECLARE @ERROR_PROCEDURE nvarchar(max)
DECLARE @ERROR_MESSAGE nvarchar(max)
DECLARE @RESULTADO int = 0
DECLARE @TRANSACTION_OPEN bit = 0

BEGIN
	BEGIN TRY
		SET NOCOUNT ON;

		-- Actualizamos los estados de las solicitudes en MES
		update MI 
		SET MI.Estado = MIJDE.WASRST
		FROM MantenimientoIntervenciones MI
		join MantenimientoJDE_F4801 MIJDE on MIJDE.WADOCO = MI.OT
		WHERE MI.Estado not in ('M5', 'M6')

		
		DECLARE @NUM_OTS varchar(max)
		DECLARE @CONSULTA nvarchar(max)

		-- Actualizamos las solicitudes cerradas en JDE
		SELECT @NUM_OTS = OTs FROM (SELECT DISTINCT SUBSTRING(
			(
				SELECT ', '+ converT(varchar(25), ST1.OT) AS [text()]
				FROM MantenimientoIntervenciones ST1
				WHERE ESTADO = 'M5'
				FOR XML PATH (''), TYPE
			).value('text()[1]','nvarchar(max)'), 2, 1000) [OTs]
		FROM MantenimientoIntervenciones ST2) AUX

		SELECT @CONSULTA = 
		-- Version para JDE
		--'update OPENQUERY(JDE, ''SELECT WASRST, WASTRX, WAUSER, WAPID, WAJOBN, WAUPMJ, WATDAY 
		--FROM PRODDTA.F4801 WHERE WADOCO in ('+@NUM_OTS+')'') SET
		--WASRST = ''M5'',
		--WASTRX = dbo.GregorianoToJuliano(GETDATE()),
		--WAUSER = ''INTER_MES'',
		--WAPID = ''INTER_MES'',
		--WAJOBN = ''INTER_MES'',
		--WAUPMJ = dbo.GregorianoToJuliano(GETDATE()),
		--WATDAY = dbo.MES_fn_HoraToJDE(GETDATE())'

		'update MantenimientoJDE_F4801 SET
		WASRST = ''M5'',
		WASTRX = dbo.GregorianoToJuliano(GETDATE()),
		WAUSER = ''INTER_MES'',
		WAPID = ''INTER_MES'',
		WAJOBN = ''INTER_MES'',
		WAUPMJ = dbo.GregorianoToJuliano(GETDATE()),
		WATDAY = dbo.MES_fn_HoraToJDE(GETDATE())
		WHERE WADOCO in ('+@NUM_OTS+')'

		EXECUTE(@CONSULTA)

		INSERT INTO MantenimientoJDE_F1307
		-- INSERT INTO [JDE].[S4405712].[PRODDTA].[F1307]  -- JDE Version
			(
				F1NUMR,
				F1TREC,
				F1EFTB,
				F1BEGT,
				F1EWST,
				F1DOCO,
				F1RMK,
				F1USER,
				F1PID,
				F1JOBN,
				F1UPMJ,
				F1UPMT,
				F1EFTE,
				F1ENDT,
				F1STHR,
				F1CUMH,
				F1LFR,
				F1LHR,
				F1LMR,
				F1LM4R,
				F1LM5R,
				F1LM6R
			)
		SELECT
			F1NUMR = MAESTRO.FANUMB,
			F1TREC = (SELECT TOP(1)TipoRegistro_TREC FROM MantenimientoConfiguracion),
			F1EFTB = dbo.GregorianoToJuliano(GETDATE()),
			F1BEGT = dbo.MES_fn_HoraToJDE(GETDATE()),
			F1EWST = 'M5',
			F1DOCO = MI.OT,
			F1RMK = 'INTERFASE_MES',
			F1USER = 'INTER_MES',
			F1PID  = 'INTER_MES',
			F1JOBN = 'INTER_MES',
			F1UPMJ = dbo.GregorianoToJuliano(GETDATE()),
			F1UPMT = dbo.MES_fn_HoraToJDE(GETDATE()),
			F1EFTE = 0,
			F1ENDT = 0,
			F1STHR = 0.0,
			F1CUMH = 0.0,
			F1LFR  = 0.0,
			F1LHR  = 0.0,
			F1LMR  = 0.0,
			F1LM4R = 0.0,
			F1LM5R = 0.0,
			F1LM6R = 0.0
		FROM MantenimientoIntervenciones MI
		join [JDE].[S4405712].[PRODDTA].[F1201] MAESTRO on MAESTRO.FAAPID = MI.EquipoConstructivo
		WHERE MI.Estado like 'M5'

		-- Guardamos los cambios de estado
		SELECT @NUM_OTS = OTs FROM (SELECT DISTINCT SUBSTRING(
				(
					SELECT ', '+ converT(varchar(25), ST1.OT) AS [text()]
					FROM MantenimientoIntervenciones ST1
					FOR XML PATH (''), TYPE
				).value('text()[1]','nvarchar(max)'), 2, 1000) [OTs]
		FROM MantenimientoIntervenciones ST2) AUX
		
		SELECT @CONSULTA =
		--	+++++++++++++++++  Version para JDE
		--'INSERT INTO MantenimientoCambiosEstados (OT, Estado, Fecha)
		--SELECT A.* FROM (
		--SELECT	OT = F1DOCO,
		--		Estado = F1EWST,
		--		Fecha = dbo.JulianoToGregorianoDatetime(F1EFTB) + CONVERT(DATETIME, dbo.MES_fn_HoraFromJDE(F1BEGT))
		--FROM OPENQUERY(JDE, ''SELECT F1DOCO, F1EWST, F1EFTB, F1BEGT FROM PRODDTA.F1307 WHERE F1DOCO IN ('+@NUM_OTS+')'')
		--) A
		--WHERE A.Fecha > (SELECT isnull(MAX(FECHA), convert(DATETIME, ''01-01-2022'')) FROM MantenimientoCambiosEstados)'
		
		'INSERT INTO MantenimientoCambiosEstados (OT, Estado, Fecha)
		SELECT A.* FROM (
		SELECT OT = F1DOCO,
				Estado = F1EWST,
				Fecha = dbo.JulianoToGregorianoDatetime(F1EFTB) + CONVERT(DATETIME, dbo.MES_fn_HoraFromJDE(F1BEGT))
		FROM MantenimientoJDE_F1307 WHERE F1DOCO IN ('+@NUM_OTS+') 
		) A
		WHERE A.Fecha > (SELECT isnull(MAX(FECHA), convert(DATETIME, ''01-01-2022'')) FROM MantenimientoCambiosEstados)'
		
		EXECUTE(@CONSULTA)

		-- Actualizamos los registros en MES para que no se vuelvan a sincronizar las solicitudes cerradas con JDE
		update MantenimientoIntervenciones SET
		ESTADO = 'M6'
		where ESTADO = 'M5'

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
		;throw
		RETURN @RESULTADO

	END CATCH
END

GO


