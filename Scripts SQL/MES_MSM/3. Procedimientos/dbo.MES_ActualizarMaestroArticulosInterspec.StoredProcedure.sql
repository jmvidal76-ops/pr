USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_ActualizarMaestroArticulosInterspec]    Script Date: 11/02/2022 13:28:36 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Daniel Salván
-- Create date: 28/01/2022
-- Description:	Procedimiento para actualizar el maestro de artículos procedente de Interspec
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizarMaestroArticulosInterspec] 

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- Declaración de variables
	DECLARE @Temporal TABLE (
		IdUnidadExpedicion bigint NULL, 
		Revision numeric(8,0) NOT NULL, 
		CodigoExpedicion nvarchar(20) NOT NULL, 
		DescUnidadExpedicion nvarchar(80) NOT NULL, 
		IdTipoFormato nvarchar(20) NULL, 
		DescTipoFormato nvarchar(80) NULL, 
		FechaUltimaModificacion datetime NULL, 
		EstadoComercial nvarchar(60) NULL, 
		GamaComercial nvarchar(60) NULL, 
		DescMarca nvarchar(60) NULL, 
		DescTipologia nvarchar(60) NULL, 
		GradoAlcoholico float NULL, 
		EsFormatoConRetorno nvarchar (80) NULL,
		CervezaEnvasar nvarchar(20) NULL,  
		CPBPorPalet float NULL, 
		EnvasesPorPalet float NULL, 
		HectolitrosEnvase numeric(16,6) NULL,
		CajaEnvaseRetornable nvarchar(20) NULL, 
		DescripcionCajaEnvaseRetornable nvarchar(80) NULL)
		

	-- Obtención de los datos de Interspec
	INSERT INTO @Temporal
	SELECT DISTINCT A.[ID_UnidadExpedicion]
		,A.[REVISION]
		,A.[CodigoExpedicion]
		,A.[DESC_UnidadExpedicion]
		,A.[ID_TipoFormato]
		,A.[DESC_TipoFormato]
		,A.[Fecha_Ultima_Modificacion]
		,A.[EstadoComercial]
		,A.[GamaComercial]
		,A.[DESC_Marca]
		,A.[DESC_Tipologia]
		,A.[GradoAlcoholico]
		,A.[EsFormatoConRetorno]
		,A.[Cerveza_envasar]
		,ISNULL(B.[CajasPorPalet],0)
		,ISNULL(B.[EnvasesPorPalet],0)
		,ISNULL(B.[HectolitrosEnvases],0)
		,C.[ComponentPartNo]
		,C.[Description]
	FROM [INTERSPEC].[MSMIS].[dbo].[VISUnidadExpedicion] AS A
	LEFT OUTER JOIN [INTERSPEC].[MSMIS].[dbo].[vUE_ProductoHL] AS B ON A.[CodigoExpedicion] = B.PartNo 
	LEFT OUTER JOIN [INTERSPEC].[MSMIS].[INTERSPC].[ItBomExplosion] AS C ON A.ID_TipoFormato = C.string2 AND (C.UomName = 'CJ' OR C.UomName = 'BR') 

	-- Comprobación que la consulta ha devuelto datos 
	IF @@ROWCOUNT <> 0 
	BEGIN
		DELETE FROM dbo.MaestroArticulosInterspec

		INSERT INTO dbo.MaestroArticulosInterspec
		SELECT *
		FROM @Temporal

		PRINT 'Tabla MaestroArticulosInterspec actualizada'

	END

END










GO

