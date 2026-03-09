USE [MES_MSM]
GO

/****** Object:  UserDefinedFunction [dbo].[MES_fn_HoraFromJDE]    Script Date: 06/06/2022 10:09:22 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 20/05/2022
-- Description:	Devuelve una hora en formato JDE en formato gregoriano
-- =============================================

CREATE FUNCTION [dbo].[MES_fn_HoraFromJDE]
(
	@HORA int
)
RETURNS TIME
AS
BEGIN
	-- Declare the return variable here
	DECLARE @RESULTADO TIME

	SELECT @RESULTADO = convert(TIME, STUFF(STUFF(RIGHT('000000'+CAST(@HORA AS VARCHAR(6)),6), 3, 0, ':'), 6, 0, ':'))
	
	RETURN @RESULTADO

END
GO


