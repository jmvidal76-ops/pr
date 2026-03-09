USE [MES_MSM]
GO

/****** Object:  UserDefinedFunction [dbo].[MES_fn_HoraToJDE]    Script Date: 06/06/2022 10:11:19 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Daniel Abad Jaraute
-- Create date: 20/05/2022
-- Description:	Devuelve la hora actual local en formato apto para JDE
-- =============================================

CREATE FUNCTION [dbo].[MES_fn_HoraToJDE]
(
	@FECHA DATETIME
)
RETURNS int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @RESULTADO varchar(6)
	--DECLARE @FECHA DATETIME = GETDATE()

	SELECT @RESULTADO = convert(varchar(6), convert(int, REPLACE(CONVERT(varchar, @FECHA, 8), ':', '')))
	
	RETURN @RESULTADO

END
GO


