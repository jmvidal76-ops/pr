USE [MES_MSM_Trazabilidad]
GO
/****** Object:  StoredProcedure [MAT].[spGetControlStockByFilters]    Script Date: 01/03/2021 12:23:15 ******/
DROP PROCEDURE [MAT].[spSetOperacionControlStock]
GO
/****** Object:  StoredProcedure [MAT].[spGetControlStockByFilters]    Script Date: 01/03/2021 12:23:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [MAT].[spSetOperacionControlStock]
@IdLote		AS nvarchar(256),
@Operacion	AS int, 
@Valor		AS decimal(18,6),
@Fecha		AS datetime,
@Motivo		AS nvarchar(255)
AS
DECLARE
@Respuesta	AS INTEGER = 0
BEGIN
	IF @Operacion = 8
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		CantidadActual = @Valor
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 9
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaBloqueo = @Fecha,
				MotivoBloqueo = @Motivo
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 10
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaBloqueo = NULL,
				MotivoBloqueo = NULL
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 11
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaCuarentena = @Fecha,
				MotivoCuarentena = @Motivo
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 12
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaCuarentena = NULL,
				MotivoCuarentena = NULL
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 21
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		Prioridad = convert(int, @Valor)
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 27
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaCaducidad = CASE WHEN @Motivo = '0' THEN @Fecha ELSE  NULL END
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END

	IF @Operacion = 30
	BEGIN
		UPDATE	lot.tLoteMateriaPrima
		SET		FechaDefectuoso = CASE WHEN @Motivo = '0' THEN @Fecha ELSE  NULL END
		WHERE	IdLoteMES = @IdLote

		SET @Respuesta = @Operacion;
	END
	SELECT @Respuesta
END
GO
