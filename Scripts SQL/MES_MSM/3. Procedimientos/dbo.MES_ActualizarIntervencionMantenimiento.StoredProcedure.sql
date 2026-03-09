USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_ActualizarIntervencionMantenimiento]    Script Date: 27/07/2022 10:08:45 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 24-05-2022
-- Description:	Actualiza los datos de una solicitud de mantenimiento, sincronizando también los datos en JDE
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizarIntervencionMantenimiento]
	@ID int,
	@Linea nvarchar(50),
	@Maquina char(12),
	@EquipoConstructivo char(12),
	@TipoAveria int,
	@DescripcionAveria nvarchar(30),
	@DescripcionProblema nvarchar(80),
	@ComentarioCierre nvarchar(max)
AS

DECLARE @ERROR_NUMBER int
DECLARE @ERROR_PROCEDURE nvarchar(max)
DECLARE @ERROR_MESSAGE nvarchar(max)
DECLARE @RESULTADO int = 0
DECLARE @TRANSACTION_OPEN bit = 0
BEGIN
	BEGIN TRY
		SET NOCOUNT ON;

		-- Actualizamos los datos en JDE
		DECLARE @NUM_OT int
		SELECT @NUM_OT = OT FROM MantenimientoIntervenciones where IdMantenimientoIntervenciones = @ID
		DECLARE @CONSULTA nvarchar(max)

		--Obtenemos el valor NUMB y el valor ASID del maestro de equipos F1201
		DECLARE @NUMB int
		DECLARE @ASID varchar(25)
		DECLARE @TipoAveriaJDE varchar(3)

		SELECT @TipoAveriaJDE = convert(varchar(3), CodigoJDE) from TipoAveria where IdTipoAveria = @TipoAveria

		SELECT @NUMB = FANUMB, @ASID = FAAPID FROM 
		[JDE].[S4405712].[PRODDTA].[F1201]
		where FAAPID = @EquipoConstructivo

		-- Tabla F4801
		SELECT @CONSULTA = 
		-- Version JDE
		--'update OPENQUERY(JDE, ''
		--SELECT WADL01, WAVR01, WANUMB, WAAPID,
		--WAUSER, WAPID, WAJOBN, WAUPMJ, WATDAY, WAWR02 
		--FROM PRODDTA.F4801 where WADOCO = '+convert(varchar(25), @NUM_OT)+''') SET
		--WADL01 = '''+@DescripcionAveria+''',
		--WAVR01 = '''+@EquipoConstructivo+''',
		--WANUMB = '+convert(nvarchar(25), @NUMB)+',
		--WAAPID = '''+@EquipoConstructivo+''',
		--WAUSER = ''INTER_MES'',
		--WAPID = ''INTER_MES'',
		--WAJOBN = ''INTER_MES'',
		--WAUPMJ = dbo.GregorianoToJuliano(GETDATE()),
		--WATDAY = dbo.MES_fn_HoraToJDE(GETDATE()),
		--WAWR02 = '''+@TipoAveriaJDE+''''

		'update MantenimientoJDE_F4801 SET
		WADL01 = '''+@DescripcionAveria+''',
		WAVR01 = '''+@EquipoConstructivo+''',
		WANUMB = '+convert(nvarchar(25), @NUMB)+',
		WAAPID = '''+@EquipoConstructivo+''',
		WAUSER = ''INTER_MES'',
		WAPID = ''INTER_MES'',
		WAJOBN = ''INTER_MES'',
		WAUPMJ = dbo.GregorianoToJuliano(GETDATE()),
		WATDAY = dbo.MES_fn_HoraToJDE(GETDATE()),
		WAWR02 = '''+@TipoAveriaJDE+'''
		WHERE WADOCO = '+convert(varchar(25), @NUM_OT)

		EXECUTE(@CONSULTA)

		-- Tabla F4801T
		SELECT @CONSULTA = 
		-- Version JDE
		--'update OPENQUERY(JDE, ''
		--SELECT WAASID, WAISSUE
		--FROM PRODDTA.F4801T where WADOCO = '+convert(varchar(25), @NUM_OT)+''') SET
		--WAASID = '''+@ASID+''',
		--WAISSUE = '''+@DescripcionProblema+''''

		'update MantenimientoJDE_F4801T SET
		WAASID = '''+@ASID+''',
		WAISSUE = '''+@DescripcionProblema+'''
		WHERE WADOCO = '+convert(varchar(25), @NUM_OT)

		EXECUTE(@CONSULTA)

		-- Tabla F1307
		SELECT @CONSULTA = 
		-- Version JDE
		--'UPDATE OPENQUERY(JDE, ''
		--SELECT F1DOCO, F1NUMR, F1UPMJ, F1UPMT 
		--FROM PRODDTA.F1307 where F1DOCO = '+convert(varchar(25), @NUM_OT)+''') SET 
		--F1NUMR = '+convert(nvarchar(25), @NUMB)+',
		--F1UPMJ = dbo.GregorianoToJuliano(GETDATE()),
		--F1UPMT = dbo.MES_fn_HoraToJDE(GETDATE())'

		'UPDATE MantenimientoJDE_F1307 SET
		F1NUMR = '+convert(nvarchar(25), @NUMB)+',
		F1UPMJ = dbo.GregorianoToJuliano(GETDATE()),
		F1UPMT = dbo.MES_fn_HoraToJDE(GETDATE())
		WHERE F1DOCO = '+convert(varchar(25), @NUM_OT)

		EXECUTE(@CONSULTA)

		BEGIN TRAN
		SELECT @TRANSACTION_OPEN = 1

		-- Actualizamos los datos en MES
		update MantenimientoIntervenciones SET
		Linea = ISNULL(@linea, Linea),
		Maquina = ISNULL(@Maquina, Maquina),
		EquipoConstructivo = ISNULL(@EquipoConstructivo, EquipoConstructivo),
		IdTipoAveria = isnull(@TipoAveria, IdTipoAveria),
		DescripcionAveria = @DescripcionAveria,
		DescripcionProblema = @DescripcionProblema,
		ComentarioCierre = @ComentarioCierre
		where IdMantenimientoIntervenciones = @ID

		if (@RESULTADO = 0)
		BEGIN 
			commit
		END ELSE
		BEGIN 
			rollback
		END

		SELECT @TRANSACTION_OPEN = 0

		RETURN @RESULTADO

	END TRY
	BEGIN CATCH
		IF @TRANSACTION_OPEN = 1
		BEGIN
			rollback
		END

		IF @RESULTADO = 0
		BEGIN
			SELECT @RESULTADO = 10008
		END

		SET @ERROR_NUMBER = ERROR_NUMBER()
		SET @ERROR_PROCEDURE = ERROR_PROCEDURE()
		SELECT @ERROR_MESSAGE = isnull(@ERROR_MESSAGE, '') +' '+ ERROR_MESSAGE()
		IF @ERROR_NUMBER = 547 -- Se referencia desde otras tablas
		SET @RESULTADO = 10002
		ELSE IF (@ERROR_NUMBER = 2627 ) -- Clave primaria duplicada
		SET @RESULTADO = 10001

		SELECT CODE = @RESULTADO, ERROR = @ERROR_MESSAGE
		RETURN @RESULTADO

	END CATCH
END
GO


