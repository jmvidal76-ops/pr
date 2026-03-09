USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[PackingWo_HighBeer_Job]    Script Date: 14/02/2022 10:22:07 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Juan Carlos Gómez Mandujano
-- Create date: 21/06/2021
-- Description:	Actualiza los datos de la tabla 'REL_PackingWo_HighBeer' el cual es invocado desde el job 'RelHDBeer_CZA_Manugistics'
-- 19/01/2022 Daniel Salván: Actualización del procedimiento para introducir un control de errores y que la tabla destino no se quede vacía.
-- =============================================

CREATE PROCEDURE [dbo].[PackingWo_HighBeer_Job]
AS

BEGIN

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- Declaración de variables
	DECLARE @Temporal TABLE(
		PackingArticleID nvarchar (max) NOT NULL,
		Czh nvarchar (max) NOT NULL,
		PPR nvarchar (max) NOT NULL,
		Description nvarchar (max) NOT NULL,
		CZAEnv nvarchar (max) NULL,
		Mosto nvarchar (max) NULL);

	-- Obtención de los datos de Interspec
	INSERT INTO @Temporal
	select aux.DefID, Coalesce(CZH +'-'+def.Descript,'---') CZH, PPR, aux.Descript, CZAENV, Mosto
	from(
			select DefID, Coalesce(MES_MSM.[dbo].[GetFatherFromChild](Substring(Mosto,0,CHARINDEX('-',Mosto)),'CZH'),'---') as CZH, PPR, Descript, CZAENV, Mosto
			from(
					select def.DefID, def.Descript, MES_MSM.dbo.GetMostoFromEnvasado (aux.Cerveza_envasar,'MOP','MDH') as Mosto, aux.*
					from (
							SELECT VS.Cerveza_envasar+ '-' + article.Description + '-' + VS.id_TipoFormato as CZAENV, DM.PPR, DM.PPR_FinalMaterialId, VS.Cerveza_envasar
							FROM SITMESDB.dbo.PDefM_PPR As DM
							INNER JOIN [INTERSPEC].[MSMIS].[dbo].[VISUnidadExpedicion] VS WITH (NOLOCK) ON VS.codigoexpedicion = DM.PPR_FinalMaterialId COLLATE Latin1_General_CI_AS AND VS.Cerveza_envasar IS NOT NULL 
							INNER JOIN [INTERSPEC].[MSMIS].[INTERSPC].ItSh article (NOLOCK) ON article.PartNo=VS.Cerveza_Envasar AND article.Status = 4
							WHERE PPR_TargetOrderLifeCycle = 'MSM'	
						) aux INNER JOIN SITMESDB.dbo.MMDefinitions def on def.DefID = aux.PPR_FinalMaterialId
				) aux WHERE Mosto <> ''
		) aux LEFT JOIN SITMESDB.dbo.MMDefinitions def on def.DefID = CZH;

		-- Comprobación que la consulta ha devuelto datos 
	IF @@ROWCOUNT <> 0 
	BEGIN

		truncate table dbo.REL_PackingWo_HighBeer

		insert into dbo.REL_PackingWo_HighBeer
		select * from @Temporal

		PRINT 'Tabla REL_PackingWo_HighBeer actualizada'

		exec [dbo].[BindColor]

	END

END

GO

