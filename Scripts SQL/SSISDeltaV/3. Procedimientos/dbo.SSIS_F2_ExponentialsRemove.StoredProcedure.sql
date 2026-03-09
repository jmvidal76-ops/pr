-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		franyelvis colmenares
-- Create date: 31/03/2021
-- Description:	convierte todos los exponenciales en decimales que se puedan trabajar
-- =============================================
CREATE PROCEDURE [dbo].[SSIS_F2_ExponentialsRemove] (@CurrentObject AS NVARCHAR (MAX))
AS
BEGIN
	DECLARE @sql AS NVARCHAR (MAX)
	 SET @sql ='UPDATE '+ @CurrentObject +'
				SET  Dato_Valor = CONVERT(NUMERIC(10,9), CAST(Dato_Valor AS FLOAT))
				WHERE Dato_Valor like ''%E-%'''
	EXEC(@sql)
END
GO

	