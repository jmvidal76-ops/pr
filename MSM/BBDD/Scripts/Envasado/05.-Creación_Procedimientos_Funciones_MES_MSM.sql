USE MES_MSM
GO
/****** Object:  StoredProcedure [dbo].[APP_GetAuxRegistersCount]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[APP_GetAuxRegistersCount](@startDate nvarchar(max),@endDate nvarchar(max),@max nvarchar(max),@invertir nvarchar(max)) 
AS
BEGIN
	if @invertir = '1'
	begin
		SELECT Count(*) [Counter] FROM dbo.LogBook 
		WHERE ApplicationId NOT LIKE '%__LOG_%' and [TimeStamp] Between @startDate and @endDate and [$IDArchiveValue] < @max
	end
	else
	begin
		SELECT Count(*) [Counter] FROM dbo.LogBook 
		WHERE ApplicationId NOT LIKE '%__LOG_%' and [TimeStamp] Between @startDate and @endDate and [$IDArchiveValue] > @max
	end
END
GO
/****** Object:  StoredProcedure [dbo].[APP_GetMaxMinRegisters]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[APP_GetMaxMinRegisters](@startDate nvarchar(max),@endDate nvarchar(max),@max nvarchar(max)) 
AS
BEGIN
	declare @query nvarchar(max);

	set @query = '
	SELECT coalesce(Max([$IDArchiveValue]),0) Maximo,coalesce(Min([$IDArchiveValue]),0) Minimo
	FROM
	(SELECT Top '+@max+' * FROM dbo.LogBook 
	WHERE ApplicationId NOT LIKE ''%__LOG_%'' and [TimeStamp] Between '''+@startDate+''' and '''+@endDate+'''
	ORDER BY TimeStamp desc,[$IDArchiveValue] desc) aux';

	execute sp_executesql @query;
END







GO
/****** Object:  StoredProcedure [dbo].[APP_GetRegistersCount]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[APP_GetRegistersCount](@startDate nvarchar(max),@endDate nvarchar(max)) 
AS
BEGIN
	SELECT Count(*) [Counter] FROM dbo.LogBook 
	WHERE ApplicationId NOT LIKE '%__LOG_%' and [TimeStamp] Between @startDate and @endDate
END






GO
/****** Object:  StoredProcedure [dbo].[APP_InsertarIncidencia]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[APP_InsertarIncidencia]
	-- Add the parameters for the stored procedure here	
	@usuario as varchar(50),
	@pantalla as varchar(100),
	@descripcion as varchar(2000),
	@aplicacion as varchar(1)
AS
BEGIN
	
	INSERT INTO INCIDENCIAS (USUARIO,PANTALLA,DESCRIPCION,APLICACION,FECHA_CREACION)
    VALUES (@usuario,@pantalla,@descripcion,@aplicacion,GetDate())

	SET NOCOUNT ON;

    
END
GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerFuncionesMenu]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[APP_ObtenerFuncionesMenu]
	-- Add the parameters for the stored procedure here
	@idMenu int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


SELECT [ID_FUNCION]
      ,[CODIGO]
      ,[DESCRIPCION]
  FROM [dbo].[FUNCIONES]
  where [ID_FUNCION] in (SELECT [ID_FUNCION]
							  FROM [dbo].[FUNCIONES_MENUS]
							  where ID_MENU in (select id_menu from dbo.MENUS where Id_MENU=@idMenu or ID_MENU_PADRE=@idMenu ))


	
END


GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerFuncionesUsuario]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[APP_ObtenerFuncionesUsuario]
	-- Add the parameters for the stored procedure here
	@userName varchar(256)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


SELECT [ID_FUNCION]
      ,[CODIGO]
      ,[DESCRIPCION]
  FROM [dbo].[FUNCIONES]
  where [ID_FUNCION] in (SELECT [ID_FUNCION]
							  FROM [dbo].[PERMISOS]
							  where id_rol in (SELECT [RoleId]
													FROM [dbo].[AspNetUserRoles]
														where userId in (SELECT [Id]  
																			FROM [dbo].[AspNetUsers] 
																				where UserName=@userName)))


	
END
GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerLogBook]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[APP_ObtenerLogBook](@startDate nvarchar(max),@endDate nvarchar(max),@max bigint,@min bigint) 
AS
BEGIN

	 SELECT * FROM dbo.LogBook 
	 WHERE (ApplicationId NOT LIKE '%__LOG_%') and ([TimeStamp] Between @startDate and @endDate) and ([$IDArchiveValue] Between @min and @max)
	 ORDER BY TimeStamp desc 
	 
	 SET NOCOUNT ON
END




GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerLogBookIntervalo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[APP_ObtenerLogBookIntervalo]	
	@startDate as datetime,
	@endDate as datetime 
AS
BEGIN

	 SELECT * FROM dbo.LogBook 
	 WHERE (ApplicationId NOT LIKE '%__LOG_%') and ((CONVERT(DATE,dbo.ToLocalDateTime([TimeStamp]))) Between (CONVERT(DATE,@startDate)) and (CONVERT(DATE,@endDate)))
	 ORDER BY TimeStamp desc 
	 
	 SET NOCOUNT ON
END




GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerLogIncidenciasIntervalo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[APP_ObtenerLogIncidenciasIntervalo]	
	@startDate as datetime,
	@endDate as datetime 
AS
BEGIN

	 SELECT * FROM dbo.INCIDENCIAS
	 WHERE 
	 CONVERT(DATE,CASE WHEN [FECHA_CREACION] IS NOT NULL THEN dbo.ToLocalDateTime([FECHA_CREACION]) ELSE '' END) Between (CONVERT(DATE,@startDate)) and (CONVERT(DATE,@endDate))
	 ORDER BY ID_INCIDENCIA desc 
	 
	 SET NOCOUNT ON
END





GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerLogProcesos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- ==================================================
-- Author:		Leandro
-- Create date: 09/12/2015
-- Description:	Obtiene los materiales de una planta
-- ==================================================
CREATE PROCEDURE [dbo].[APP_ObtenerLogProcesos]
AS
BEGIN
		SELECT
			[Id]
      ,[FechaHora]
      ,[Funcion]
      ,[Tipo]
      ,[Evento]
      ,[Usuario]
	FROM LOG_PROCESOS
	ORDER BY Id desc;

	SET NOCOUNT ON;

END



GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerLogUsuarios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- ==================================================
-- Author:		Leandro
-- Create date: 09/12/2015
-- Description:	Obtiene los materiales de una planta
-- ==================================================
CREATE PROCEDURE [dbo].[APP_ObtenerLogUsuarios]
AS
BEGIN
		SELECT
			[Id]
      ,[FechaHora]
      ,[Funcion]
      ,[Tipo]
      ,[Evento]
      ,[Usuario]
	FROM LOG
	ORDER BY Id desc;

	SET NOCOUNT ON;

END


GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerMenus]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[APP_ObtenerMenus]
	-- Add the parameters for the stored procedure here
	@menuPadre as int,
	@aplicacion as nvarchar(10),
	@usuario as nvarchar(50)

AS
BEGIN
	SET NOCOUNT ON;
	IF @menuPadre = -1 -- obtenemos los menus padres
	BEGIN
		SELECT menus.id_menu AS id_menu,menus.nombre AS nombre, vistas.nombre AS vista,PermisoMenuPadre.PermisoMenu
		FROM menus inner join vistas ON menus.id_vista = vistas.id_vista
		LEFT JOIN(
		SELECT menus.id_menu AS id_menu,isnull(PermisoMenu,0) as PermisoMenu
		FROM menus inner join vistas ON menus.id_vista = vistas.id_vista
		LEFT JOIN (
		select IdMenuPadre, PermisoMenu
		from
		(
			select m.ID_MENU_PADRE as IdMenuPadre1, mp.ID_MENU_PADRE AS IdMenuPadre2, isnull(case when count(1) > 0 then 1 else 0 end,0) AS PermisoMenu from MENUS m
			inner join FUNCIONES_MENUS on m.ID_MENU = FUNCIONES_MENUS.ID_MENU
			inner join PERMISOS on PERMISOS.ID_FUNCION = FUNCIONES_MENUS.ID_FUNCION
			inner join AspNetUserRoles on PERMISOS.ID_ROL = AspNetUserRoles.RoleId
			inner join AspNetUsers on AspNetUsers.Id = AspNetUserRoles.UserId
			INNER JOIN MENUS AS mp on mp.ID_MENU = m.ID_MENU_PADRE
			where AspNetUsers.UserName = @usuario
			group by m.ID_MENU_PADRE, mp.ID_MENU_PADRE) as ma
			UNPIVOT
			(
				IdMenuPadre 
				FOR columna IN (IdMenuPadre1, IdMenuPadre2)
			)AS unpvt
		group by IdMenuPadre, PermisoMenu
		) AS PermisosPadre ON menus.ID_MENU = PermisosPadre.IdMenuPadre
		WHERE menus.id_menu_padre IS NULL and (menus.aplicacion = @aplicacion or menus.aplicacion='A') 
		) as PermisoMenuPadre ON PermisoMenuPadre.id_menu = menus.id_menu
		WHERE menus.id_menu_padre IS NULL and (menus.aplicacion =  @aplicacion  or menus.aplicacion='A') 
		ORDER BY menus.orden ASC

		--SELECT menus.id_menu AS id_menu,menus.nombre AS nombre, vistas.nombre AS vista
		--FROM menus inner join vistas ON menus.id_vista = vistas.id_vista
		--WHERE menus.id_menu_padre IS NULL and (menus.aplicacion =  @aplicacion  or menus.aplicacion='A') 
		--ORDER BY menus.orden ASC
	END
	ELSE -- obtenemos los menus que cuelgan de otro menu
	    SELECT menus.id_menu as id_menu,menus.nombre AS nombre, vistas.nombre AS vista 
        FROM menus inner join vistas on menus.id_vista = vistas.id_vista
        WHERE menus.id_menu_padre = @menuPadre and (menus.aplicacion =  @aplicacion  or menus.aplicacion='A') 
		ORDER BY menus.orden ASC

END

GO
/****** Object:  StoredProcedure [dbo].[APP_ObtenerVistasAplicacion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[APP_ObtenerVistasAplicacion]
	-- Add the parameters for the stored procedure here
	@aplicacion as nvarchar(1),
	@usuario nvarchar(100)

AS
BEGIN
	SET NOCOUNT ON;
	SELECT  DISTINCT
	VISTAS.[ID_VISTA]
	,VISTAS.[NOMBRE]
	,[CODIGO]
	,[RUTA]
	,[FUNCION]
	,[PARAMETROS]
	,[CONTENEDOR]
	,[ACCIONES]
	,[SECCION]
	FROM VISTAS
	INNER JOIN MENUS M ON VISTAS.ID_VISTA = M.ID_VISTA
	INNER JOIN [dbo].[FUNCIONES_MENUS] F ON M.ID_MENU = F.ID_MENU
	INNER JOIN DBO.PERMISOS P ON P.ID_FUNCION = F.ID_FUNCION
	INNER JOIN [dbo].[AspNetUserRoles] R ON P.ID_ROL = R.RoleId
	INNER JOIN [dbo].[AspNetUsers] A ON R.UserId = A.Id AND A.UserName = @usuario 
	WHERE M.APLICACION = @aplicacion OR M.APLICACION = 'A'
	ORDER BY VISTAS.[ID_VISTA] DESC
END


GO
/****** Object:  StoredProcedure [dbo].[APP_RegistrarLog]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Inserta un registro de Log
-- =============================================
CREATE PROCEDURE [dbo].[APP_RegistrarLog]
	@fechaHora as datetime,
	@funcion as nvarchar(100),
	@tipo as nvarchar(50),
	@incidencia as nvarchar(1000),
	@usuario as nvarchar(100),
	@traza as text
AS
BEGIN

	INSERT INTO [log] (FechaHora,Funcion,Tipo,Evento,Usuario,Traza) VALUES (@fechaHora,@funcion,@tipo,@incidencia,@usuario,@traza);
	
	SET NOCOUNT ON;

END



GO
/****** Object:  StoredProcedure [dbo].[APP_RegistrarLogProcesos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Inserta un registro de Log
-- =============================================
CREATE PROCEDURE [dbo].[APP_RegistrarLogProcesos]
	@fechaHora as datetime,
	@funcion as nvarchar(100),
	@tipo as nvarchar(50),
	@incidencia as nvarchar(1000),
	@usuario as nvarchar(100),
	@traza as text
AS
BEGIN

	INSERT INTO [LOG_PROCESOS] (FechaHora,Funcion,Tipo,Evento,Usuario,Traza) VALUES (@fechaHora,@funcion,@tipo,@incidencia,@usuario,@traza);
	
	SET NOCOUNT ON;

END




GO
/****** Object:  StoredProcedure [dbo].[APP_TienePermiso]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[APP_TienePermiso]
	-- Add the parameters for the stored procedure here
	@rol  nvarchar(256), 
	@funcion nvarchar(250)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @permiso  int
	
	SELECT @permiso = count(*)
		FROM [dbo].[PERMISOS]
		where ID_ROL in (select id from AspNetRoles where name=@rol) and
			  ID_FUNCION  in (select ID_FUNCION from FUNCIONES where CODIGO=@funcion)


	select case @permiso when 0 then 0 else 1 end

END
GO
/****** Object:  StoredProcedure [dbo].[BindColor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE procedure [dbo].[BindColor]
as
begin
	declare @article nvarchar(max),
			@index integer

	set @index=1

	declare c cursor for
		SELECT IdMaterial
		FROM [MES_MSM].[dbo].[Materiales_FAB]
		where IdClase in ('CZA','MOS','CZH') and IdMaterial <> 'Default_Material' and Descripcion not like 'M.P.A.%'

	open c

	fetch from c into @article

	while @@FETCH_STATUS=0
	begin
		update materialcolor
		set ProducedArticle=@article
		where IdColor=@index
		
		set @index=@index+1 
		fetch from c into @article
	end

	close c
	deallocate c
end
GO
/****** Object:  StoredProcedure [dbo].[BrewingPlanning]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE procedure [dbo].[BrewingPlanning]
AS
BEGIN
	declare @currentWeek as nvarchar(max)
	declare @startWeek as nvarchar(max)
	declare @endWeek as nvarchar(max)
	declare @aux nvarchar(max)
	declare @aux2 nvarchar(max)

	select @aux = dbo.BrewingPlanningPreparation()

	set @currentWeek = SUBSTRING(@aux,0,CHARINDEX('-',@aux))
	set @aux2 = SUBSTRING(@aux,CHARINDEX('-',@aux)+1,LEN(@aux))
	set @startWeek = SUBSTRING(@aux2,0,CHARINDEX('-',@aux2))
	set @endWeek = SUBSTRING(@aux2,CHARINDEX('-',@aux2)+1,LEN(@aux2)) 

	--print @currentWeek
	--print @startWeek
	--print @endWeek

	truncate table PackingPO
	truncate table PackingArticleFromJDE
	truncate table CocPlanning

	exec [GetPackingsPO] @startWeek=@startWeek,@endWeek=@endWeek

	exec [GetPackingArticleTotalQuantityFromCurrentWeek] @currentWeek=@currentWeek,@startWeek=@startWeek
END


GO
/****** Object:  StoredProcedure [dbo].[GetCOBTableName]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create Procedure [dbo].[GetCOBTableName](@condition nvarchar(max))
as
begin				
	select 
	TABLE_NAME CompleteName,
	SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1) SITTable,				
		SUBSTRING(SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1),0,CHARINDEX('$',SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1))-1) SITType
	,'temp_' +  SUBSTRING(SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1),0,CHARINDEX('$',SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1))-1)  Temp_Tempname
	from SITMesDb.INFORMATION_SCHEMA.TABLES SIT			
	WHERE TABLE_CATALOG = 'sitMesDb' and TABLE_NAME like @condition
end

GO
/****** Object:  StoredProcedure [dbo].[GetListaLoteByLocation]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	Obtiene lista de lotes a partir de una ubicación
-- =============================================
CREATE PROCEDURE [dbo].[GetListaLoteByLocation]
	-- Add the parameters for the stored procedure here
	@ubicacion as nvarchar(max),
	@celda as nvarchar(max)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	declare @pkUnit int = (select loctypepk from sitmesdb.dbo.mmloctypes where loctypeid = 'Unit')
	declare @pkArea int = (select loctypepk from sitmesdb.dbo.mmloctypes where loctypeid = 'Area')
	declare @pkCell int = (select loctypepk from sitmesdb.dbo.mmloctypes where loctypeid = 'Cell')
	declare @parentloc int = (select locpk from sitmesdb.dbo.mmlocations where locid = @ubicacion)
	declare @parentCell int = (select locpk from SITMesDb.dbo.MMLocations where LocID = @celda)
	
	declare @depositos table (locpk int, locpath nvarchar(max))
	insert into @depositos
	select unit.locpk, unit.locpath
	from sitmesdb.dbo.mmlocations area
		inner join sitmesdb.dbo.mmlocations cell on cell.parentlocpk = area.locpk and cell.rowdeleted = 0 
		inner join sitmesdb.dbo.mmlocations unit on unit.parentlocpk = cell.locpk and unit.rowdeleted = 0 
	where area.locpk = @parentloc
		and cell.locpk = @parentCell
		and area.rowdeleted = 0
	
	select def.DefID, def.Descript, SUM(quantity) AS TotalCantidad, COUNT(prod.lotpk) AS TotalLotes, @ubicacion AS Proceso
	from sitmesdb.dbo.mmlots prod
		inner join @depositos dep on dep.locpk = prod.locpk
		inner join sitmesdb.dbo.mmdefvers v on v.DefVerPK = prod.DefVerPK
		inner join sitmesdb.dbo.mmdefinitions def on def.DefPK = v.DefPK
	group by def.DefID, def.Descript

END

GO
/****** Object:  StoredProcedure [dbo].[GetPackingArticleTotalQuantityFromCurrentWeek]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[GetPackingArticleTotalQuantityFromCurrentWeek](@currentWeek nvarchar(max),@startWeek nvarchar(max))
as
BEGIN
	declare @aux as table(WADOCO int,WADRQJ int,WALITM int,WAUORG int,WAUOM nvarchar(max),WAMMCU int,Semana int)
	
	insert into @aux
	EXEC [dbo].[PRE_OrdenesPlanificadasManugistics] '        8030',@currentWeek,@startWeek	

	insert into dbo.PackingArticleFromJDE
	select env,sum(total) total 
	from (select Sum(WAUORG) total,subString([dbo].[GetPackingArticleFromJDE](WALITM),0,Charindex('-',[dbo].[GetPackingArticleFromJDE](WALITM))) env
		  from @aux 
		  group by WALITM) t
	where env is not null 
	group by env	
END


GO
/****** Object:  StoredProcedure [dbo].[GetPackingsPO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[GetPackingsPO](@startWeek nvarchar(max),@endWeek nvarchar(max))
AS
BEGIN
	declare @aux as table(WADOCO int,WADRQJ int,WALITM int,WAUORG int,WAUOM nvarchar(max),WAMMCU int,Semana int)
	--declare @aux3 as table(ENVASADO nvarchar(max),TOTAL int,MOSTO nvarchar(max))
	
	insert into @aux
	exec [dbo].[PRE_OrdenesPlanificadasManugistics] '        8030',@startWeek,@endWeek

	--insert into @aux3
	--select env,sum(total),
	--[dbo].[GetMostoFromEnvasado](env,'M.F.  A. DENS.%') mosto
	--from (select Sum(WAUORG) total,subString([dbo].[GetPackingArticleFromJDE](WALITM),0,Charindex('-',[dbo].[GetPackingArticleFromJDE](WALITM))) env 
	--	from @aux 
	--	group by WALITM) t
	--group by env 
	
	insert into dbo.PackingPO
	Select * 
	from (select env,sum(total) total,
		  [dbo].[GetMostoFromEnvasado](env,'M.F.  A. DENS.%') mosto
		  from (select Sum(WAUORG) total,subString([dbo].[GetPackingArticleFromJDE](WALITM),0,Charindex('-',[dbo].[GetPackingArticleFromJDE](WALITM))) env 
				from @aux 
				group by WALITM) t
		   group by env) tab
	where mosto is not null

	--select * from @aux3 where mosto is not null	
END

GO
/****** Object:  StoredProcedure [dbo].[GetTableInJSON]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[GetTableInJSON](@fields nvarchar(max),@tempCompleteName nvarchar(max))
--returns nvarchar(max)
as
begin
	Declare @Query nvarchar(max)	
	Declare @result nvarchar(max)
	Declare @table table(json nvarchar(max))

	set @Query = 'declare @json xml 					

					set @json = (SELECT ' + @fields + ' FROM '  + @tempCompleteName + ' FOR XML PATH, ROOT)
			
					SELECT Stuff(
								(SELECT * from
									(SELECT '',
									{''+
									Stuff((SELECT '',"''+coalesce(b.c.value(''local-name(.)'', ''NVARCHAR(MAX)''),'''')+''":"''+
									b.c.value(''text()[1]'',''NVARCHAR(MAX)'') +''"''
									from x.a.nodes(''*'') b(c)
									for xml path(''''),TYPE).value(''(./text())[1]'',''NVARCHAR(MAX)'')
									,1,1,'''')+''}''
									from @json.nodes(''/root/*'') x(a)
									) JSON(theLine)
								for xml path(''''),TYPE).value(''.'',''NVARCHAR(MAX)'' )
								,1,1,'''')'	

	INSERT INTO @table exec sp_executesql @Query;		
	Select json from @table  	
end

GO
/****** Object:  StoredProcedure [dbo].[GetTagValue]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure[dbo].[GetTagValue](@whereClausure nvarchar(max),@scannedText nvarchar(max),@getValues int)
as
BEGIN
	declare @sql as nvarchar(max),
			@aux as nvarchar(max),
			@param as nvarchar(max),
			@value nvarchar(max)

	set @param = '@result as nvarchar(max) OUTPUT'
	set @sql='
	declare @pivotValues as nvarchar(max),
			@item as nvarchar(max),
			@pivotSelect as nvarchar(max),
			@tagNameList as nvarchar(max),
			@tagName as nvarchar(max)

	declare c cursor  for
		SELECT CONCAT(''[''+Cast(TagID as nvarchar(max))+'']'','''') 
		FROM [SITMESDB_FAB].[PPA].[dbo].[TAG]
		WHere ' +@whereClausure+'

	Open c
	Fetch from c into @item
	set @pivotValues = '''';
	set @pivotSelect = '''';
	set @tagNameList=Concat(LTRIM(RTRIM(Replace(Replace(Replace(Replace('''+@scannedText+''',''[TagName] like'',''''),''%'',''''),'''''''',''''),''OR'','',''))),'','')
	
	while @@FETCH_STATUS = 0
	begin
		--Preparo la clausura para el Pivot
		set @pivotValues = @pivotValues + @item +'',''
		--Obtengo el nombre de cada tag para preparar el alias correspondiente en el Select
		set @tagName=RTRIM(LTRIM(substring(@tagNameList,0,CharIndex('','',@tagNameList)+1)))
		--Quito el nombre correspondiente de la lista de tags
		set @tagNameList=RTRIM(LTRIM(Replace(@tagNameList,@tagName,'''')))
		
		set @pivotSelect = @pivotSelect + ''Coalesce(Medida.''+@Item+'',0) ''+@tagName 
		Fetch from c into @item
	end

	Close c
	Deallocate c
	
	if '+Cast(@getValues as nvarchar)+' = 1
	begin
		set @result=Left(@pivotValues,len(@pivotValues)-1)
	end
	else
	begin
		set @result=Left(@pivotSelect,len(@pivotSelect)-1)
		--set @result=@pivotSelect
	end	'
	--print @sql
	exec sp_executesql @sql,@param,@result=@value OUTPUT
	Select @value
END;
GO
/****** Object:  StoredProcedure [dbo].[ImportCOBDatas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Procedure [dbo].[ImportCOBDatas]
as
begin
	Begin Try
		--Use MES_MSM
		Declare @CompleteName nvarchar(max)
		Declare @tempCompleteName nvarchar(max)
		Declare @SITTable nvarchar(max)
		Declare @SITType nvarchar(max)
		Declare @Query nvarchar(max) = N''
		Declare @columns nvarchar(max)
	
		set @columns = ''
	
		Declare c cursor for
				select 
				TABLE_NAME CompleteName,
				SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1) SITTable,				
					SUBSTRING(SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1),0,CHARINDEX('$',SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1))-1) SITType
				,'temp_' +  SUBSTRING(SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1),0,CHARINDEX('$',SUBSTRING(TABLE_NAME,CHARINDEX('/',TABLE_NAME)+1,LEN(TABLE_NAME)-1))-1)  Temp_Tempname
				from SITMesDb.INFORMATION_SCHEMA.TABLES SIT			
				WHERE TABLE_CATALOG = 'sitMesDb' and TABLE_NAME like '%COB%$'

		Open C

		fetch next from c into @CompleteName,@SITTable,@SITType,@tempCompleteName

		Begin Transaction t
			while @@FETCH_STATUS = 0
			begin
				select @columns = @columns + COLUMN_NAME + ','
				from SITMesDb.INFORMATION_SCHEMA.COLUMNS SIT			
				WHERE TABLE_CATALOG = 'sitMesDb' and TABLE_NAME = @CompleteName and COLUMN_NAME NOT LIKE '$%'

				set @query = 'SELECT '+SubString(@columns,0,LEN(@Columns))+' INTO  ##'  + @tempCompleteName + ' FROM  SITMESDb.dbo.['  +  @CompleteName  + ']'		 
			
				execute sp_executesql @query;

				execute dbo.GetTableInJSON @tempCompleteName
			
				set @columns = ''

				fetch next from c into @CompleteName,@SITTable,@SITType,@tempCompleteName
			end

			close C
			Deallocate C
	END try
	Begin Catch
		Select ERROR_MESSAGE() msg,ERROR_LINE() line
		close C
		Deallocate C
		Rollback transaction t
	End Catch
end

GO
/****** Object:  StoredProcedure [dbo].[Informe_ALB_1_Mat_tra_SEL]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


--=============================================
-- Autor:			Miguel Angel Suero Aviles - IDOM
-- Fecha creacion: 26032018
-- Desccripcion:	obtiene los datos del albaran de salidad
--						
-- Parametros de entrada
	--  @@MatriculaTractora-> Matricula tractora
--============================================
--exec [dbo].[Informe_ALB_1_Mat_tra_SEL] 'SA8286L'
CREATE  PROCEDURE [dbo].[Informe_ALB_1_Mat_tra_SEL]
	-- Add the parameters for the stored procedure here
     
	 @MatriculaTractora nvarchar(10)

	 
AS
BEGIN



	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


	Select  top 1
	
	convert(varchar,FechaEntrada,105) + space(1) + substring(convert(varchar,FechaEntrada,114),0,6)  as FechaEntrada,
	convert(varchar,FechaSalida,105) + space(1) + substring(convert(varchar,FechaSalida,114),0,6)  as FechaSalida,
    IdAlbaran,
   pro.Nombre,
   pro.NIF,
   pro.Direccion,
   pro.poblacion,
   mt.PesoMaximo,
   PesoEntrada,
   PesoSalida,
   'CERVEZAS MAHOU SA' AS CARGADOR,
   'ALOVERA' AS POBLACION,
    op.Nombre as NombreOP,
   op.Direccion as DireccionOP,   
   tp.Nombre as NombreTP,
   tp.NIF as NIFTran,
   tp.Direccion as DirTra,
   tp.Poblacion as Potrans,
   '' OrigenMeracia,
   om.Descripcion as OrigenMercancia,
   mt.MatriculaTractora,
   mre22.MatriculaRemolque,
   '' as ObservacionesData,
   'Malta' as MaterialData
 From 		[MES_MSM_Trazabilidad].[TRA].[tTransporte] tra (NOLOCK)
    inner JOIN  [MES_MSM_Trazabilidad].[MAT].[tProveedor] pro (NOLOCK)
    ON tra.IdProveedor = pro.IdProveedor
     inner JOIN [MES_MSM_Trazabilidad].[TRA].[tAlbaran] alb (NOLOCK) 
     ON alb.IdTransporte = tra.IdTransporte
      left JOIN [MES_MSM_Trazabilidad].[TRA].[tMatriculaTractora] mt (NOLOCK)
      ON tra.[IdMatriculaTractoraRemolque] = mt.IdMatriculaTractora
       left JOIN [MES_MSM_Trazabilidad].[TRA].[tOperador] OP (NOLOCK)
       ON OP.IdOperador = tra.IdOperador
        INNER JOIN  [MES_MSM_Trazabilidad].[TRA].[tTransportista] TP (NOLOCK)
        ON TP.IdTransportista = TRA.IdTransportista
         INNER JOIN  [MES_MSM_Trazabilidad].[UBI].[tOrigenMercancia] OM  (NOLOCK)
         on OM.IdOrigenMercancia = tra.IdOrigenMercancia          
          left join [MES_MSM_Trazabilidad].tra.tMatriculaTractoraRemolque mre (NOLOCK)
          on mre.IdMatriculaTractora = mt.IdMatriculaTractora
          left JOIN [MES_MSM_Trazabilidad].tra.tMatriculaRemolque  mre22 (NOLOCK)
          ON mre22.IdMatriculaRemolque = mre.IdMatriculaRemolque
		where  mt.MatriculaTractora =@MatriculaTractora
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ALB_1_Propiedaes_ext_Matricula_SEL]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================

CREATE  PROCEDURE [dbo].[Informe_ALB_1_Propiedaes_ext_Matricula_SEL]
	-- Add the parameters for the stored procedure here
     @MatriculaTractora nvarchar(10)
	 
AS
BEGIN

	SET NOCOUNT ON;

	----------------------
	-- Declararcion de variabnles
	-----------------------
	DECLARE @idTransporte  INT
	
	select @idTransporte =tra.IdTransporte
	from [MES_MSM_Trazabilidad].[TRA].[tTransporte] tra (NOLOCK)
	left JOIN [MES_MSM_Trazabilidad].[TRA].[tMatriculaTractora] mt (NOLOCK)
      ON tra.[IdMatriculaTractoraRemolque] = mt.IdMatriculaTractora
	    left join [MES_MSM_Trazabilidad].tra.tMatriculaTractoraRemolque mre (NOLOCK)
          on mre.IdMatriculaTractora = mt.IdMatriculaTractora
		   left JOIN [MES_MSM_Trazabilidad].tra.tMatriculaRemolque  mre22 (NOLOCK)
          ON mre22.IdMatriculaRemolque = mre.IdMatriculaRemolque
	 where   @MatriculaTractora =MatriculaTractora


	SELECT		ll.Propertyid,ll.PropValChar,ll.UomID
	FROM		[MES_MSM_Trazabilidad].[TRA].[tAlbaran] alb (NOLOCK),
				[MES_MSM_Trazabilidad].[TRA].[tAlbaranPosicion] pos (NOLOCK),
				[MES_MSM_Trazabilidad].[TRA].[tAlbaranPosicionLote] pos_lote (NOLOCK),
				[MES_MSM_Trazabilidad].[MAT].[vAllPropExtendbyLot]  ll (nolock)								
    WHERE	alb.IdAlbaran = pos.IdAlbaran
	AND		pos.idalbaranposicion = pos_lote.idalbaranposicion
	and		ll.lotid =  pos_lote.IdLote
	and		ll.prpGroupid ='Especial'	
	and     alb.idtransporte =@idTransporte
	


	

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ALB_1_Propiedaes_ext_SEL]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================

--exec  [dbo].[Informe_ALB_1_Propiedaes_ext_SEL] 1041
CREATE  PROCEDURE [dbo].[Informe_ALB_1_Propiedaes_ext_SEL]
	-- Add the parameters for the stored procedure here
     @idalbaran int
	 
AS
BEGIN

	SET NOCOUNT ON;


	SELECT		ll.Propertyid,ll.PropValChar,ll.UomID
	FROM		[MES_MSM_Trazabilidad].[TRA].[tAlbaran] alb (NOLOCK),
				[MES_MSM_Trazabilidad].[TRA].[tAlbaranPosicion] pos (NOLOCK),
				[MES_MSM_Trazabilidad].[TRA].[tAlbaranPosicionLote] pos_lote (NOLOCK),
				[MES_MSM_Trazabilidad].[MAT].[vAllPropExtendbyLot]  ll (nolock)
    WHERE	alb.IdAlbaran = pos.IdAlbaran
	AND		pos.idalbaranposicion = pos_lote.idalbaranposicion
	and		ll.lotid =  pos_lote.IdLote
	and		ll.prpGroupid ='Especial'
	and     alb.idalbaran =@idalbaran
	


END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ALB_1_SEL]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================

--exec  [dbo].[Informe_ALB_1_SEL] 1100
 
CREATE  PROCEDURE [dbo].[Informe_ALB_1_SEL]
	-- Add the parameters for the stored procedure here
     @idalbaran int
	 
AS
BEGIN



	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	Select 
	
	convert(varchar,FechaEntrada,105) + space(1) + substring(convert(varchar,FechaEntrada,114),0,6)  as FechaEntrada,
	convert(varchar,FechaSalida,105) + space(1) + substring(convert(varchar,FechaSalida,114),0,6)  as FechaSalida,
    IdAlbaran,
   pro.Nombre,
   pro.NIF,
   pro.Direccion,
   pro.poblacion,
   mt.PesoMaximo,
   PesoEntrada,
   PesoSalida,
   'CERVEZAS MAHOU SA' AS CARGADOR,
   'ALOVERA' AS POBLACION,
    op.Nombre as NombreOP,
   op.Direccion as DireccionOP,   
   tp.Nombre as NombreTP,
   tp.NIF as NIFTran,
   tp.Direccion as DirTra,
   tp.Poblacion as Potrans,
   '' OrigenMeracia,
   om.Descripcion as OrigenMercancia,
   mt.MatriculaTractora,
   mre22.MatriculaRemolque,
   '' as ObservacionesData,
   'Malta' as MaterialData
 From 		[MES_MSM_Trazabilidad].[TRA].[tTransporte] tra (NOLOCK)
    inner JOIN  [MES_MSM_Trazabilidad].[MAT].[tProveedor] pro (NOLOCK)
    ON tra.IdProveedor = pro.IdProveedor
     inner JOIN [MES_MSM_Trazabilidad].[TRA].[tAlbaran] alb (NOLOCK) 
     ON alb.IdTransporte = tra.IdTransporte
      left JOIN [MES_MSM_Trazabilidad].[TRA].[tMatriculaTractora] mt (NOLOCK)
      ON tra.[IdMatriculaTractoraRemolque] = mt.IdMatriculaTractora
       left JOIN [MES_MSM_Trazabilidad].[TRA].[tOperador] OP (NOLOCK)
       ON OP.IdOperador = tra.IdOperador
        INNER JOIN  [MES_MSM_Trazabilidad].[TRA].[tTransportista] TP (NOLOCK)
        ON TP.IdTransportista = TRA.IdTransportista
         INNER JOIN  [MES_MSM_Trazabilidad].[UBI].[tOrigenMercancia] OM  (NOLOCK)
         on OM.IdOrigenMercancia = tra.IdOrigenMercancia          
          left join [MES_MSM_Trazabilidad].tra.tMatriculaTractoraRemolque mre (NOLOCK)
          on mre.IdMatriculaTractora = mt.IdMatriculaTractora
          left JOIN [MES_MSM_Trazabilidad].tra.tMatriculaRemolque  mre22 (NOLOCK)
          ON mre22.IdMatriculaRemolque = mre.IdMatriculaRemolque
		where  alb.idalbaran =@idalbaran
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerHistoricoOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerHistoricoOrdenes]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
--Select  O.Id AS ORDEN ,H.FECHA_CAMBIO AS FECHA_CAMBIO ,EO.Estado AS NUEVO_ESTADO, O.EstadoAnt AS ANTIGUO_ESTADO
--From [dbo].[Ordenes] O 
--INNER JOIN [dbo].[HistoricoOrdenes] H ON H.ID_ORDEN = O.Id
--LEFT JOIN [dbo].[EstadosOrden] EO ON EO.Id = H.ESTADO
--where O.Linea = @Linea
--	 and @FechaInicio <= datediff(s, '1970-1-1' ,O.FecIniReal) 
--	 and @FechaFin >= datediff(s, '1970-1-1' ,O.FecFinReal)
--	 order by O.id, H.FECHA_CAMBIO asc



	  SELECT 
	  ID_ORDEN as ORDEN,
	  FECHA_CAMBIO as FECHACAMBIO,
	  EstadosOrden.Estado as NUEVOESTADO
	  FROM HistoricoOrdenes h
	  inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
	  INNER JOIN Particiones P ON h.ID_ORDEN = P.Id AND P.Linea = @Linea
	  where 
	  DATEADD(SECOND, @FechaInicio,'1970-01-01') <= h.FECHA_CAMBIO AND h.FECHA_CAMBIO <=  DATEADD(SECOND, @FechaFin,'1970-01-01') 
	  order by FECHACAMBIO, h.ID_ORDEN

 commit TRANSACTION
END




/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParos]    Script Date: 01/06/2016 12:09:07 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerlistadoParos]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		@turno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

SELECT DISTINCT 'Linea ' + convert(varchar(100),L.numeroLinea) + ' - ' + L.Descripcion as Linea,
	   [dbo].[ToLocalDateTime](Inicio) as InicioLocal,
	   [NombreTipoTurno],
	   ISNULL(MaquinaCausaNombre,'Sin maquina definida') as MaquinaCausaId,
	   [MotivoNombre],
	   [CausaNombre],
	   EquipoConstructivoNombre as Equipo,
	   case 
	   when IdTipoParoPerdida = 1 then isnull(P.DuracionParoMayor,0)
	   when IdTipoParoPerdida = 2 then isnull(P.DuracionParosMenores,0) + isnull(P.DuracionBajaVelocidad,0)
	   end as Duracion,
	   [DuracionBajaVelocidad] as DuracionBajaVelocidad,
	   Observaciones,
	   ISNULL(MaquinaCausaNombre,'Sin maquina definida') as MaquinaCausa,
	   --substring(MaquinaCausaId,charindex('-EQ-',MaquinaCausaId)+4,6) as MaquinaCausa,
	   case 
	   when [Justificado]=0 then 'No'
	   Else 'Si'
	   End as Justificado,
	   P.[Descripcion],
	   0 as EstadoLinea,
	   ISNULL(m.Descripcion,'Sin maquina definida') as Maquina,
	   TipoParoPerdida AS TipoParoPerdida
	   --substring(EquipoID,charindex('-EQ-',EquipoId)+4,6) as Maquina
	   From [dbo].[ParosPerdidas] P
	   INNER JOIN Turnos t ON t.Id = P.Turno
	   INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
		LEFT JOIN MAQUINAS M ON P.EquipoId = M.ID
		--LEFT JOIN MAQUINAS M1 ON P.MaquinaCausaId = M1.ID
	 Where L.Nombre = @Linea  AND t.id = @turno
	 --and @FechaInicio <= datediff(s, '1970-1-1' ,Inicio) 
	 --and @FechaFin > datediff(s, '1970-1-1' ,Inicio)
	 
	-- union all
	-- Select  
	-- DISTINCT 'Linea ' + convert(varchar(100),L.numeroLinea) + ' - ' + L.Descripcion as Linea,
	-- [dbo].[ToLocalDateTime](FECHA_INICIO) AS InicioLocal,
	-- T.Turno AS [NombreTipoTurno],
	-- 'Sin maquina definida' as MaquinaCausaId,
	-- '' as MotivoNombre,
	--  '' as [CausaNombre],
	-- '' as Equipo,
	-- convert(numeric(18,2),CMH.TIEMPO_PLANIFICADO-CMH.TIEMPO_OPERATIVO) as Duracion,
	--   0 as DuracionBajaVelocidad,
	--   '' as Observaciones,
	--   'Sin maquina definida' as MaquinaCausa,
	--   'No' as Justificado,
	--   '' as [Descripcion],
	--   0 as EstadoLinea,
	--   ISNULL(M.Descripcion,'Sin maquina definida') as Maquina	 
	--FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
	--INNER JOIN Maquinas M ON M.Id = CMH.ID_MAQUINA
	--INNER JOIN TURNOS T ON CMH.SHC_WORK_SCHED_DAY_PK  = T.ID
	--INNER JOIN LINEAS L ON L.Id = M.Linea
	--Where L.Nombre = @Linea and CMH.TIEMPO_PLANIFICADO-CMH.TIEMPO_OPERATIVO >0
	--and @FechaInicio <= datediff(s, '1970-1-1' ,FECHA_INICIO) 
	--and @FechaFin >= datediff(s, '1970-1-1' ,Fecha_Fin)
	order by [dbo].[ToLocalDateTime](Inicio)  asc
	commit TRANSACTION
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquina]    Script Date: 01/06/2016 12:10:14 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
	CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquina]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		@turno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT --substring(EquipoID,charindex('-EQ-',EquipoId)+4,6)
		MaquinaCausaNombre AS EquipoId
		,EquipoConstructivoNombre
		,P.Descripcion
		,CausaNombre
		,MotivoNombre
		,SUM(P.DuracionParoMayor) + SUM(P.DuracionParosMenores) + SUM(DuracionBajaVelocidad) AS duracion
		,C.ID_EQUIPO_CONSTRUCTIVO AS CodEC
	FROM ParosPerdidas P
	INNER JOIN Turnos t ON t.Id = P.Turno
	INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	LEFT JOIN EQUIPO_CONSTRUCTIVO C ON P.EquipoConstructivoId = C.IdObj
	WHERE L.Nombre = @Linea AND t.id = @turno
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	GROUP BY DescLinea
				,MaquinaCausaNombre
				,EquipoConstructivoNombre
				,CausaNombre
				,MotivoNombre
				,P.descripcion
				,C.ID_EQUIPO_CONSTRUCTIVO
	ORDER BY MaquinaCausaNombre ASC, duracion DESC
commit TRANSACTION
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquinaCausa]    Script Date: 01/06/2016 12:11:01 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquinaCausa]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquinaCausa]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		@turno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT
		EquipoID
		,MotivoNombre
		,CONVERT(NUMERIC(18, 2), SUM(Duracion)) AS Duracion
	FROM (SELECT --substring(EquipoID,charindex('-EQ-',EquipoId)+4,6)
			EquipoDescripcion AS EquipoID
			,CausaNombre
			,MotivoNombre
			,P.DuracionParoMayor + P.DuracionParosMenores + DuracionBajaVelocidad AS duracion
		FROM ParosPerdidas P
		INNER JOIN [dbo].[Lineas] L
			ON P.IdLinea = L.NumeroLinea
		INNER JOIN DBO.TURNOS T
			ON P.TURNO = T.ID
			AND T.IdTipoTurno > 0
		WHERE L.Nombre = @Linea AND T.id = @turno	
		--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
		--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	-- union all 
	--  Select  distinct
	--  NULL as EquipoID,
	--  NULL as CausaNombre,
	--  NULL as MotivoNombre,
	--  convert(numeric(18,2),CMH.TIEMPO_PLANIFICADO-CMH.TIEMPO_OPERATIVO) as Duracion	 
	--FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
	--INNER JOIN Maquinas M ON M.Id = CMH.ID_MAQUINA
	--INNER JOIN TURNOS T ON CMH.SHC_WORK_SCHED_DAY_PK  = T.ID
	--INNER JOIN LINEAS L ON L.Id = M.Linea
	--Where L.Nombre = @Linea and CMH.TIEMPO_PLANIFICADO-CMH.TIEMPO_OPERATIVO >0
	--and @FechaInicio <= datediff(s, '1970-1-1' ,FECHA_INICIO) 
	--and @FechaFin >= datediff(s, '1970-1-1' ,Fecha_Fin)
	) tab
	GROUP BY	EquipoID
				,MotivoNombre
	ORDER BY duracion DESC
commit TRANSACTION
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_2_ObtenerParosLlenadoraMaquina]    Script Date: 01/06/2016 12:11:36 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerProduccionHorasEtiquetadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerProduccionHorasEtiquetadora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
--set @linea = 'MSM.BURGOS.ENVASADO.B447'
--set @desde = convert(datetime,'2015-11-25T05:00:00',126)
--set @hasta = convert(datetime,'2015-11-25T13:00:00',126)

DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	DECLARE @ID_CLASE_ETQ AS INT
	DECLARE @d datetime
	DECLARE @h datetime
	DECLARE @turno int
	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = dateadd(hour,1, @d)

	--BEGIN TRANSACTION
		
	--	WHILE @h <= DATEADD(s, @hasta, '19700101')
	--	  BEGIN
	--		INSERT  INTO @HorasTurno
	--		VALUES  (@d,@h)
	--		SET @d = @h
	--		SET @h = dateadd(hour,1, @d)
			
	--	  END		
	--COMMIT TRANSACTION
	SELECT
		@turno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno


	SELECT DISTINCT
		@ID_CLASE_ETQ = IdClase
	FROM Maquinas
	WHERE Clase = 'ETIQUETADORA_PALETS'

	SELECT
		m.Id
		,m.Descripcion AS NOMBRE
		,SUM(Produccion.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
		,SUM(Produccion.CONTADOR_RECHAZOS) AS ENVASES_RECHAZADOS
		,0 as ENVASES_PALETIZADORA
	    ,0 as HLCaudar
		,0 AS 'RENDIMIENTO_MECANICO'
		,0 AS HLEnvases
	FROM COB_MSM_PROD_RESTO_MAQ_HORA Produccion
	INNER JOIN Maquinas m
		ON Produccion.ID_MAQUINA = m.Id
		AND M.Linea = @LINEA
	WHERE m.IdClase IN (@ID_CLASE_ETQ)
	AND Produccion.SHC_WORK_SCHED_DAY_PK = @turno --AND ISNULL(Produccion.ID_ORDEN,'') != ''
	GROUP BY M.ID,M.Descripcion


	commit TRANSACTION
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerProduccionHorasPaletizadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE  PROCEDURE [dbo].[Informe_ANA_1_ObtenerProduccionHorasPaletizadora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- Insert statements for procedure here
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		DECLARE @turno int
		DECLARE @d DATETIME
		DECLARE @h DATETIME
		DECLARE @ID_CLASE_PALETIZADORA AS INT
		DECLARE @ID_CLASE_ETIQUETADORA_PALETS AS INT
		DECLARE @ID_CLASE_PALETIZADORA_ETIQUETADORA_PALETS AS INT

		SET @d = DATEADD(s, @desde, '19700101')
		SET @h = DATEADD(s, @hasta, '19700101')

		SELECT
			@turno = Id
		FROM Turnos
		WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
		ORDER BY InicioTurno


		SELECT DISTINCT
			@ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas
		WHERE Clase IN ('PALETIZADORA')

		
		SELECT DISTINCT
			@ID_CLASE_ETIQUETADORA_PALETS = IdClase
		FROM Maquinas
		WHERE Clase IN ('ETIQUETADORA_PALETS')

	

		
	

		SELECT
			m.Id
			,m.Descripcion AS NOMBRE
			,CASE WHEN m.IdClase = @ID_CLASE_PALETIZADORA THEN SUM(Produccion.CONTADOR_PRODUCCION) ELSE 0 END AS ENVASES_LLENADORA
			,CASE WHEN m.IdClase = @ID_CLASE_ETIQUETADORA_PALETS THEN SUM(Produccion.CONTADOR_PRODUCCION) ELSE 0 END AS ETIQUETADORA_PALETS
		FROM COB_MSM_PROD_RESTO_MAQ_HORA Produccion
		INNER JOIN Maquinas m
			ON Produccion.ID_MAQUINA = m.Id
			AND M.Linea = @LINEA
		WHERE m.IdClase IN (@ID_CLASE_PALETIZADORA, @ID_CLASE_ETIQUETADORA_PALETS)
		AND Produccion.SHC_WORK_SCHED_DAY_PK = @turno --AND ISNULL(Produccion.ID_ORDEN,'') != ''
		GROUP BY M.ID,M.Descripcion,m.IdClase

	COMMIT TRANSACTION

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerTurnos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[Informe_ANA_1_ObtenerTurnos]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @INICIO AS DATETIME = DATEADD(SECOND,@FechaInicio, '1970-01-01')
	DECLARE @FIN AS DATETIME = DATEADD(SECOND,@FechaFin, '1970-01-01')

	--PRINT('INICIO: ' + CONVERT(VARCHAR(100),@INICIO))
	--PRINT('FIN: ' + CONVERT(VARCHAR(100),@FIN))

	DECLARE @INICIOTURNO AS INT = 0
	DECLARE @FINTURNO AS INT = 0

	SELECT @INICIOTURNO = ID_Ordenado_Turno FROM TURNOS WHERE InicioTurno = @INICIO and Linea = @Linea
	SELECT @FINTURNO = ID_Ordenado_Turno FROM TURNOS WHERE FinTurno = @FIN and Linea = @Linea

 --   PRINT('INICIO TURNO: ' + CONVERT(VARCHAR(100),@INICIOTURNO))
	--PRINT('FIN TURNO: ' + CONVERT(VARCHAR(100),@FINTURNO))

	SELECT DATEDIFF(SECOND,'1970-01-01',InicioTurno) as desdeT, DATEDIFF(SECOND,'1970-01-01',FinTurno) as hastaT, Turno as tipoTurno
	FROM Turnos
	WHERE ID_Ordenado_Turno BETWEEN @INICIOTURNO AND @FINTURNO and Linea = @Linea
	order by ID_Ordenado_Turno asc
	commit TRANSACTION
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_1_ObtenerlistadoParosMaquina]    Script Date: 01/06/2016 12:10:14 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_2_ObtenerParosAgrupados]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_2_ObtenerParosAgrupados]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #HorasTurno
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT
		'L' + CONVERT(VARCHAR(10), L.NumeroLinea) + ' - ' + L.Descripcion AS Linea
		,P.CausaNombre
		,P.MotivoNombre
		,P.MaquinaCausaNombre
		,EC.ID_EQUIPO_CONSTRUCTIVO
		,EC.NOMBRE AS ECNOMBRE
		,SUM(P.Duracion) AS DURACION
	FROM dbo.ParosPerdidas P
	--INNER JOIN Turnos t ON t.Id = P.Turno
	INNER JOIN #HorasTurno HT on HT.Id = P.Turno
	INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	LEFT JOIN EQUIPO_CONSTRUCTIVO EC ON P.EquipoConstructivoId = EC.IdObj
	WHERE L.Nombre = @Linea-- AND t.id = @turno
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	GROUP BY	L.NumeroLinea
				,L.Descripcion
				,P.CausaNombre
				,P.MotivoNombre
				,P.MaquinaCausaNombre
				,EC.ID_EQUIPO_CONSTRUCTIVO
				,EC.NOMBRE
	ORDER BY P.MaquinaCausaNombre,duracion DESC
	DROP TABLE #HorasTurno
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_2_ObtenerParosLlenadoraMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_2_ObtenerParosLlenadoraMaquina]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
SELECT DISTINCT 
--'Linea ' + convert(varchar(100),L.numeroLinea) + ' - ' + L.Descripcion as Linea,
		P.EquipoDescripcion as Linea,
		[dbo].[ToLocalDateTime](Inicio) as FechaTurno,
		NombreTipoTurno,
	   --case
	   --when [NombreTipoTurno]='Morning' then 'Mañana'
	   --when NombreTipoTurno = 'Afternoon' then 'Tarde'
	   --when NombreTipoTurno = 'Night' then 'Noche'
	   --else 'Turno no productivo' end as NombreTipoTurno,
	   --substring([MaquinaCausaId],charindex('-EQ-',[MaquinaCausaId])+4,6) 
	   MaquinaCausaNombre as [MaquinaCausaId],
	   [MotivoNombre],
	   [CausaNombre],
	   EquipoConstructivoNombre as [EquipoConstructivoId],
	   CASE
	   WHEN IdTipoParoPerdida = 1 THEN isnull(sum(P.DuracionParoMayor),0)
	   WHEN IdTipoParoPerdida = 2 THEN isnull(sum(P.DuracionParosMenores),0) + isnull(sum(P.DuracionBajaVelocidad),0) END AS Duracion,
	   --isnull(sum(P.DuracionParoMayor),0) + isnull(sum(P.DuracionParosMenores),0) + isnull(sum(P.DuracionBajaVelocidad),0) as Duracion,
	   EC.ID_EQUIPO_CONSTRUCTIVO AS CodEC,
	   TipoParoPerdida as TipoParoPerdida,
	   P.Descripcion as Descripcion,
	   Observaciones as Observaciones
	   From [dbo].[ParosPerdidas] P
	   INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	   LEFT JOIN EQUIPO_CONSTRUCTIVO EC ON P.EquipoConstructivoId = EC.IdObj
	 Where L.Nombre = @Linea 
	 and @FechaInicio <= datediff(s, '1970-1-1' ,Inicio) 
	 and @FechaFin >= datediff(s, '1970-1-1' ,Inicio)
	 group by MaquinaCausaNombre, P.EquipoDescripcion, /*L.numeroLinea,L.Descripcion,*/ Inicio, [NombreTipoTurno], [MotivoNombre],
	   [CausaNombre], P.TipoParoPerdida, P.IdTipoParoPerdida,
	   EquipoConstructivoNombre, Ec.ID_EQUIPO_CONSTRUCTIVO,P.Descripcion,Observaciones
	   order by [MaquinaCausaId], FechaTurno asc

END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_2_ObtenerParosTotales]    Script Date: 01/06/2016 12:12:15 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_2_ObtenerParosTotales]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_2_ObtenerParosTotales]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
Select  ISNULL(P.MaquinaCausaNombre,'') as MaquinaCausaNombre,
--substring(P.EquipoId,charindex('-EQ-',P.EquipoId)+4,6) as MaquinaCausaNombre , 
    sum(case when P.[IdTipoParoPerdida] = 1 then 1 else 0 end) as NumeroParoMayor,
	sum(case when P.[IdTipoParoPerdida] = 1 then P.DuracionParoMayor else 0 end) as DuracionParoMayor,
	--sum(case when P.EsParoMenor = 1 then 1 else 0 end) as NumeroParoMenor,
	--sum(case when P.EsParoMenor = 1 then P.Duracion+P.DuracionBajaVelocidad else 0 end) as DuracionParoMenor,
	sum(case when P.[IdTipoParoPerdida] = 2 and DuracionParosMenores>0 then 1 else 0 end) as NumeroPerdida,
	sum(case when P.[IdTipoParoPerdida] = 2 then P.DuracionParosMenores else 0 end) as DuracionPerdida,
	sum(case when P.[IdTipoParoPerdida] = 2 and DuracionBajaVelocidad>0 then 1 else 0 end) as NumeroBajaVelocidad,
	sum(case when P.[IdTipoParoPerdida] = 2 then P.DuracionBajaVelocidad else 0 end) as DuracionBajaVelocidad
From dbo.ParosPerdidas P
	   INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	 Where L.Nombre = @Linea 
	 and @FechaInicio <= datediff(s, '1970-1-1' ,Inicio) 
	 and @FechaFin >= datediff(s, '1970-1-1' ,Inicio)
	 group by P.MaquinaCausaNombre

END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_3_ObtenerParosMaquina]    Script Date: 01/06/2016 12:12:41 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_3_ObtenerParosMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_3_ObtenerParosMaquina]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint,
	 @Maquina nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
SELECT [dbo].[ToLocalDateTime](Inicio) as InicioLocal,
	 M.Descripcion AS EquipoNombre,
	   [FinLocal],
	   [MotivoNombre], 
	   [CausaNombre], 
	   [EquipoConstructivoNombre] as [EquipoConstructivoId], 
	   --EC.ID_EQUIPO_CONSTRUCTIVO AS CodEC,
	   isnull(P.DuracionParoMayor,0) + isnull(P.DuracionParosMenores,0)+ isnull(P.DuracionBajaVelocidad,0) as Duracion,
	   Observaciones,
	   TipoParoPerdida,
	   P.Descripcion
	   From [dbo].[ParosPerdidas] P
	   INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	   --LEFT JOIN EQUIPO_CONSTRUCTIVO EC ON P.EquipoConstructivoId = EC.IdObj
	   LEFT JOIN Maquinas M ON M.Id  = P.EquipoId
	   
	 Where L.Nombre = @Linea 
	 and @FechaInicio <= datediff(s, '1970-1-1' ,Inicio) 
	 and @FechaFin > datediff(s, '1970-1-1' ,Inicio)
	 and MaquinaCausaNombre = @Maquina

END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerParosMaquina]    Script Date: 01/06/2016 12:13:42 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_3_ObtenerTotalMinutosParadaCausa]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_3_ObtenerTotalMinutosParadaCausa]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint,
	 @Maquina nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
SELECT
[MotivoNombre], 
	   [CausaNombre], 
	   isnull(CONVERT(FLOAT,sum(P.Duracion)),0) AS Duracion
	   	   -- + isnull(sum(P.DuracionParosMenores),0)+ isnull(sum(P.DuracionBajaVelocidad),0) as DuracionPrincipal
	   From [dbo].[ParosPerdidas] P
	   INNER JOIN [dbo].[Lineas] L ON P.IdLinea = L.NumeroLinea
	   --LEFT JOIN EQUIPO_CONSTRUCTIVO EC ON P.EquipoConstructivoId = EC.IdObj
	   LEFT JOIN Maquinas M ON M.Id  = P.EquipoId
	   
	 Where L.Nombre = @Linea 
	 and @FechaInicio <= datediff(s, '1970-1-1' ,Inicio) 
	 and @FechaFin > datediff(s, '1970-1-1' ,Inicio)
	 and MaquinaCausaNombre = @Maquina
	 group by MotivoNombre, CausaNombre
	 order by Duracion desc
END



GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerArranquesTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[Informe_ANA_4_ObtenerArranquesTurno]
	@Linea nvarchar(255),
	@desde bigint,
	@hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	SELECT [Id]
      ,[IdLinea]
      ,[Linea]
      ,[DescripcionLinea]
      ,[InicioReal]
      ,[TipoTurnoId]
      ,[TipoTurno]
      ,[FechaTurno]
      ,[OrdenEntrante]
      ,[IDProductoEntrante]
      ,[ProductoEntrante]
      ,[MinutosFinal1]
      ,[MinutosFinal2]
      ,[MinutosObjetivo1]
      ,[MinutosObjetivo2]
      ,[TipoArranque]
      ,[ID_ARRANQUE]
      ,[EstadoAct]
  FROM [dbo].[OrdenesArranque]
  WHERE InicioUTC BETWEEN DATEADD(SECOND,@desde,'1970-01-01') AND DATEADD(SECOND,@hasta,'1970-01-01')
	AND IdLinea = @Linea
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerCambiosTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE  [dbo].[Informe_ANA_4_ObtenerCambiosTurno]
	@Linea nvarchar(255),
	@desde bigint,
	@hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

  


	SELECT  [Id]
      ,[IdLinea]
      ,[Linea]
      ,[DescripcionLinea]
      ,[InicioReal]
      ,[TipoTurnoId]
      ,[TipoTurno]
      ,[FechaTurno]
      ,[OrdenSaliente]
      ,[IDProductoSaliente]
      ,[ProductoSaliente]
      ,[OrdenEntrante]
      ,[IDProductoEntrante]
      ,[ProductoEntrante]
      ,[MinutosFinal1]
      ,[MinutosFinal2]
      ,[MinutosObjetivo1]
      ,[MinutosObjetivo2]
      ,[ID_CAMBIO]
      ,[EstadoAct]
	FROM [OrdenesCambio]

	WHERE InicioUTC BETWEEN DATEADD(SECOND,@desde,'1970-01-01') AND DATEADD(SECOND,@hasta,'1970-01-01')
	AND IdLinea = @Linea
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerOEEGrafico]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_4_ObtenerOEEGrafico]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @d datetime
	DECLARE @h datetime
	DECLARE @turno int

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = DATEADD(s, @hasta, '19700101')

	SELECT  @turno = Id
		FROM Turnos
		where [Linea]=@Linea and  InicioTurno BETWEEN @d and @h and FinTurno BETWEEN @d and @h AND LOWER(Turno) <> 'nowork'
		order by InicioTurno


		PRINT @turno

DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	
	DECLARE @desdeH datetime
	DECLARE @hastaH datetime

	SET @desdeH = DATEADD(s, @desde, '19700101')
	SET @hastaH = dateadd(hour,1, @desdeH)

	BEGIN TRANSACTION
		
		WHILE @hastaH <= DATEADD(s, @hasta, '19700101')
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@desdeH,@hastaH)
			SET @desdeH = @hastaH
			SET @hastaH = dateadd(hour,1, @desdeH)
			
		  END		
	COMMIT TRANSACTION
SELECT * FROM 
(SELECT TABLA.Nombre,		
		TABLA.Hora,
		SUM(TABLA.TiempoPlanificado) AS TiempoPlanificado,
		SUM(TABLA.TiempoOperativo) AS TiempoOperativo,
		SUM(TABLA.TiempoBruto) AS TiempoBruto,
		SUM(TABLA.TiempoNeto) AS TiempoNeto,
		SUM(TABLA.VelocidadNominal) AS VelocidadNominal,
		SUM(TABLA.EnvasesProducidos) AS EnvasesProducidos,
		SUM(TABLA.ContadorRechazos) AS ContadorRechazos,
		case 
			--PCV2 when Sum(TABLA.TiempoOperativo) = 0 OR Sum(TABLA.TiempoPlanificado)=0 then 0
			when Sum(TABLA.VelocidadNominal)=0 then 0
			--PCV2 else CONVERT(DECIMAL(10,2),((Sum(TABLA.TiempoOperativo)/Sum(TABLA.TiempoPlanificado)) * (Sum(TABLA.TiempoNeto)/Sum(TABLA.TiempoOperativo)) *100))
			else CONVERT(DECIMAL(10,2),((Sum(TABLA.EnvasesProducidos)/Sum(TABLA.VelocidadNominal)) *100))
			end as totalOee,
		MAX(TABLA.Fecha_Inicio) As Fecha_Inicio
			FROM (

   (SELECT m.Descripcion as Nombre, 
			DATEPART(HOUR,[dbo].[ToLocalDateTime](inicio)) as Hora, 
			0 AS TiempoPlanificado,
			0 AS TiempoOperativo,
			0 AS TiempoBruto,
			0 AS TiempoNeto,
			0 AS VelocidadNominal,
			0 AS EnvasesProducidos,
			0 AS ContadorRechazos,
			[dbo].[ToLocalDateTime](inicio) as Fecha_Inicio
   FROM @HorasTurno
   CROSS JOIN
   COB_MSM_PROD_LLENADORA_HORA AS LL
   INNER JOIN Maquinas M ON M.Id = LL.ID_MAQUINA
   WHERE M.Linea = @Linea --AND ISNULL(LL.ID_ORDEN,'') != ''
   )
   UNION
   (SELECT
			m.Descripcion as Nombre,		
			DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)) as Hora
			,COALESCE(SUM(h.[TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
			,COALESCE(SUM(h.[TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
			,COALESCE(SUM(h.[TIEMPO_BRUTO]), 0) AS TiempoBruto
			,COALESCE(SUM(h.[TIEMPO_NETO]), 0) AS TiempoNeto
			,COALESCE(SUM(h.[VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
			,COALESCE(SUM(h.[CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
			,COALESCE(SUM(h.[CONTADOR_RECHAZOS]), 0) AS ContadorRechazos,
			h.FECHA_INICIO as Fecha_Inicio
		FROM COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Maquinas m ON m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t
			ON t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE h.SHC_WORK_SCHED_DAY_PK = @turno --AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)),m.Descripcion,h.FECHA_INICIO
		
		)
) AS TABLA 
GROUP BY TABLA.Nombre,TABLA.Hora 
) AS TABLA1


INNER JOIN 

(SELECT TABLA_HORA.Hora,SUM(TABLA_HORA.totalOee)/COUNT(TABLA_HORA.totalOee) as Media 
FROM (SELECT TABLA.Nombre,		
		TABLA.Hora,
		SUM(TABLA.TiempoPlanificado) AS TiempoPlanificado,
		SUM(TABLA.TiempoOperativo) AS TiempoOperativo,
		SUM(TABLA.TiempoBruto) AS TiempoBruto,
		SUM(TABLA.TiempoNeto) AS TiempoNeto,
		SUM(TABLA.VelocidadNominal) AS VelocidadNominal,
		SUM(TABLA.EnvasesProducidos) AS EnvasesProducidos,
		SUM(TABLA.ContadorRechazos) AS ContadorRechazos,
		case 
			--PCV2 when Sum(TABLA.TiempoOperativo) = 0 OR Sum(TABLA.TiempoPlanificado)=0 then 0
			when Sum(TABLA.VelocidadNominal)=0 then 0
			--PCV2 else CONVERT(DECIMAL(10,2),((Sum(TABLA.TiempoOperativo)/Sum(TABLA.TiempoPlanificado)) * (Sum(TABLA.TiempoNeto)/Sum(TABLA.TiempoOperativo)) *100))
			else CONVERT(DECIMAL(10,2),((Sum(TABLA.EnvasesProducidos)/Sum(TABLA.VelocidadNominal)) *100))
			end as totalOee,
		MAX(TABLA.Fecha_Inicio) As Fecha_Inicio
			FROM (

   (SELECT m.Descripcion as Nombre, 
			DATEPART(HOUR,[dbo].[ToLocalDateTime](inicio)) as Hora, 
			0 AS TiempoPlanificado,
			0 AS TiempoOperativo,
			0 AS TiempoBruto,
			0 AS TiempoNeto,
			0 AS VelocidadNominal,
			0 AS EnvasesProducidos,
			0 AS ContadorRechazos,
			[dbo].[ToLocalDateTime](inicio) as Fecha_Inicio
   FROM @HorasTurno
   CROSS JOIN
   COB_MSM_PROD_LLENADORA_HORA AS LL
   INNER JOIN Maquinas M ON M.Id = LL.ID_MAQUINA  
   WHERE M.Linea = @Linea --AND ISNULL(LL.ID_ORDEN,'') != ''
   )
   UNION
   (SELECT
			m.Descripcion as Nombre,		
			DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)) as Hora
			,COALESCE(SUM(h.[TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
			,COALESCE(SUM(h.[TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
			,COALESCE(SUM(h.[TIEMPO_BRUTO]), 0) AS TiempoBruto
			,COALESCE(SUM(h.[TIEMPO_NETO]), 0) AS TiempoNeto
			,COALESCE(SUM(h.[VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
			,COALESCE(SUM(h.[CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
			,COALESCE(SUM(h.[CONTADOR_RECHAZOS]), 0) AS ContadorRechazos,
			h.FECHA_INICIO as Fecha_Inicio
		FROM COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Maquinas m ON m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t
			ON t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE h.SHC_WORK_SCHED_DAY_PK = @turno --AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)),m.Descripcion,h.FECHA_INICIO
		
		)
) AS TABLA 
GROUP BY TABLA.Nombre,TABLA.Hora 
)AS TABLA_HORA group by TABLA_HORA.Hora) AS TABLA2
ON TABLA1.Hora = TABLA2.Hora
ORDER BY TABLA1.Hora

commit TRANSACTION

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerParosMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_4_ObtenerParosMaquina]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
			SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = DATEADD(s, @hasta, '19700101')

	SELECT
		@turno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	DECLARE @IdTipoParoMayor AS INT;
	DECLARE @IdTipoParoMenor AS INT;

	SELECT
		@IdTipoParoMenor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Pérdida de producción'

	SELECT
		@IdTipoParoMayor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Paro Mayor'


	SELECT
		pp.EquipoDescripcion as MaquinaCausaNombre
		,CAST(ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMayor) THEN pp.DuracionParoMayor
		END), 0) AS BIGINT) AS DuracionParoMayor
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.DuracionParosMenores
		END), 0) AS DuracionParoMenor
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.DuracionBajaVelocidad
		END), 0) AS DuracionBajaVelocidad
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.Duracion
		END), 0) AS DuracionPerdidaProduccion
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMayor) THEN 1
		END), 0) AS NumeroParoMayor
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.NumeroParosMenores
		END), 0) AS NumeroParoMenor
	FROM [dbo].[ParosPerdidas] pp
	INNER JOIN Turnos t ON t.Id = pp.Turno
	INNER JOIN Maquinas m ON m.Id = pp.EquipoId
	WHERE t.id = @turno
	GROUP BY pp.EquipoDescripcion

--Select  --substring(P.EquipoId,charindex('-EQ-',P.EquipoId)+4,6) as
--isnull(P.EquipoDescripcion,'Sin definir') as MaquinaCausaNombre , 
--    sum(case when P.IdTipoParoPerdida = 1 then 1 else 0 end) as NumeroParoMayor,
--	sum(case when P.IdTipoParoPerdida = 1 then P.DuracionParoMayor else 0 end) as DuracionParoMayor,
--	sum(case when P.IdTipoParoPerdida = 2 then P.DuracionParosMenores+P.DuracionBajaVelocidad else 0 end) as DuracionPerdidaProduccion,
--	sum(case when P.IdTipoParoPerdida = 2 AND DuracionParosMenores>0 then 1 else 0 end) as NumeroParoMenor,
--	sum(case when P.IdTipoParoPerdida = 2 then P.DuracionParosMenores else 0 end) as DuracionParoMenor,
--	sum(case when P.IdTipoParoPerdida = 2 AND P.DuracionBajaVelocidad>0 then 1 else 0 end) as NumeroBajaVelocidad,
--	sum(case when P.IdTipoParoPerdida = 2 then P.DuracionBajaVelocidad else 0 end) as DuracionBajaVelocidad
--From dbo.ParosPerdidas P
--INNER JOIN DBO.Maquinas M ON P.EquipoId = M.Id
--where P.EquipoId is not null and M.Linea = @Linea and M.Clase='LLENADORA'
--	 and @desde <= datediff(s, '1970-1-1' ,P.Inicio) 
--	 and @hasta >= datediff(s, '1970-1-1' ,P.Inicio) 
--group by P.EquipoDescripcion
commit TRANSACTION
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerOEEs]    Script Date: 01/06/2016 12:18:34 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerParosPivot]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[Informe_ANA_4_ObtenerParosPivot]

--DECLARAMOS VARIABLES
@Linea nvarchar(255),
@desde bigint,
@hasta bigint


as
begin

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)

	DECLARE @d datetime
	DECLARE @h datetime

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = dateadd(hour,1, @d)

	BEGIN TRANSACTION
		
		WHILE @h <= DATEADD(s, @hasta, '19700101')
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@d,@h)
			SET @d = @h
			SET @h = dateadd(hour,1, @d)
			
		  END		
	COMMIT TRANSACTION

	SELECT TB.FECHA as fecha, TB.EquipoID as EquipoID, ISNULL((CONVERT(NUMERIC(18,0), SUM(duracion)/60)),0) as duracion FROM (
				SELECT 
				CASE WHEN inicio is null then null else
				 dbo.fnFormatDate([dbo].[ToLocalDateTime](inicio), 'YYYYMMDDH') END AS fecha,M.Descripcion AS EquipoID, 0 AS duracion
				FROM MAQUINAS M
				CROSS JOIN @HorasTurno H 
				WHERE M.Linea=@Linea AND M.Clase='Llenadora'
				UNION ALL
				SELECT case WHEN inicio is null then null else
				 dbo.fnFormatDate([dbo].[ToLocalDateTime](INICIO), 'YYYYMMDDH') end as fecha, LL.EquipoDescripcion as EquipoID, DuracionParosMenores+DuracionBajaVelocidad AS duracion
				FROM ParosPerdidas LL
				INNER JOIN TURNOS T ON LL.Turno = T.ID
				WHERE T.Linea = @Linea AND T.InicioTurno >= DATEADD(s, @desde, '19700101') and T.FinTurno <= DATEADD(s, @hasta, '19700101')
	) TB
	GROUP BY TB.FECHA,TB.EquipoID
	ORDER BY TB.FECHA, TB.EQUIPOID ASC
commit TRANSACTION

end

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerParosPivotMayor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[Informe_ANA_4_ObtenerParosPivotMayor]

--DECLARAMOS VARIABLES
@Linea nvarchar(255),
@desde bigint,
@hasta bigint


as
begin

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	
	DECLARE @d datetime
	DECLARE @h datetime

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = dateadd(hour,1, @d)

	BEGIN TRANSACTION
		
		WHILE @h <= DATEADD(s, @hasta, '19700101')
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@d,@h)
			SET @d = @h
			SET @h = dateadd(hour,1, @d)
			
		  END		
	COMMIT TRANSACTION

	--select * from @HorasTurno
	--select '1' as fecha, 'a' as EquipoID, 1 as duracion


SELECT dbo.fnFormatDate([dbo].[ToLocalDateTime](H.inicio), 'YYYYMMDDH') as fecha , M.Descripcion as EquipoID,ISNULL((CONVERT(NUMERIC(18,0),(SUM(LL.TIEMPO_PLANIFICADO)-SUM(LL.TIEMPO_OPERATIVO))/60)),0) AS duracion
FROM @HorasTurno H
CROSS JOIN MAQUINAS M
INNER JOIN LINEAS L ON M.Linea = L.ID AND L.ID=@Linea
LEFT JOIN (
SELECT TIEMPO_PLANIFICADO, TIEMPO_OPERATIVO, SHC_WORK_SCHED_DAY_PK, HORA, ID_MAQUINA, FECHA_INICIO  FROM COB_MSM_PROD_LLENADORA_HORA
where SHC_WORK_SCHED_DAY_PK>0
	UNION ALL
	SELECT TIEMPO_PLANIFICADO, TIEMPO_OPERATIVO, SHC_WORK_SCHED_DAY_PK, HORA, ID_MAQUINA, FECHA_INICIO FROM COB_MSM_PROD_RESTO_MAQ_HORA
where SHC_WORK_SCHED_DAY_PK>0
) LL ON LL.ID_MAQUINA = M.Id AND LL.HORA = DATEPART(HOUR, H.inicio) AND CONVERT(DATE,LL.FECHA_INICIO) = CONVERT(DATE, H.inicio) 
GROUP BY dbo.fnFormatDate([dbo].[ToLocalDateTime](H.inicio), 'YYYYMMDDH') , M.Descripcion
--HAVING (SUM(LL.TIEMPO_PLANIFICADO)-SUM(LL.TIEMPO_OPERATIVO))/60 >0
ORDER BY dbo.fnFormatDate([dbo].[ToLocalDateTime](H.inicio), 'YYYYMMDDH') , M.Descripcion ASC
	COMMIT TRANSACTION

end

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerProduccionEmpaquetadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[Informe_ANA_4_ObtenerProduccionEmpaquetadora]
	-- Add the parameters for the stored procedure here
	 @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
	 
	 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- Insert statements for procedure here
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		DECLARE @turno int
		DECLARE @d DATETIME
		DECLARE @h DATETIME
		DECLARE @ID_CLASE_ENCAJONADORA AS INT
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT

		SET @d = DATEADD(s, @desde, '19700101')
		SET @h = DATEADD(s, @hasta, '19700101')

		SELECT
			@turno = Id
		FROM Turnos
		WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
		ORDER BY InicioTurno


		SELECT DISTINCT
			@ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT
			@ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas
		WHERE Clase = 'EMPAQUETADORA'

		SELECT
			m.Id
			,m.Descripcion AS NOMBRE
			,SUM(Produccion.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
			,SUM(Produccion.CONTADOR_RECHAZOS) AS ENVASES_RECHAZADOS
		FROM COB_MSM_PROD_RESTO_MAQ_HORA Produccion
		INNER JOIN Maquinas m
			ON Produccion.ID_MAQUINA = m.Id
			AND M.Linea = @LINEA
		WHERE m.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA)
		AND Produccion.SHC_WORK_SCHED_DAY_PK = @turno AND ISNULL(Produccion.ID_ORDEN,'') != ''
		GROUP BY M.ID,M.Descripcion
	COMMIT TRANSACTION
END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerProduccionHoras]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE  PROCEDURE [dbo].[Informe_ANA_4_ObtenerProduccionHoras]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
--set @linea = 'MSM.BURGOS.ENVASADO.B447'
--set @desde = convert(datetime,'2015-11-25T05:00:00',126)
--set @hasta = convert(datetime,'2015-11-25T13:00:00',126)

DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	
	DECLARE @d datetime
	DECLARE @h datetime
	DECLARE @turno int

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = DATEADD(s, @hasta, '19700101')


	SELECT  @turno = Id
		FROM Turnos
		where [Linea]=@Linea and  InicioTurno BETWEEN @d and @h and FinTurno BETWEEN @d and @h AND LOWER(Turno) <> 'nowork'
		order by InicioTurno


		PRINT @turno

		SET @h = dateadd(hour,1, @d)
	BEGIN TRANSACTION
		
		WHILE @h <= DATEADD(s, @hasta, '19700101')
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@d,@h)
			SET @d = @h
			SET @h = dateadd(hour,1, @d)
			
		  END		
	COMMIT TRANSACTION



	--Select m.Id, 
	--m.Descripcion AS NOMBRE,
	--sum(Produccion.CONTADOR_PRODUCCION) as ENVASES_LLENADORA,
	--sum(Produccion.CONTADOR_RECHAZOS) as ENVASES_RECHAZADOS,
	--0 as ENVASES_PALETIZADORA,
	--0 as HLCaudar,
	----0 as HLEnvases,
	--	case 
	--	when sum(Velocidad_NOMINAL) = 0 then 0 
	--	else convert(numeric(18,2),(sum(Produccion.CONTADOR_PRODUCCION)/sum(VELOCIDAD_NOMINAL)*100)) end as 'RENDIMIENTO_MECANICO'
	--	,CONVERT(real,ISNULL(Sum(O.HectolitrosProducto) * COALESCE(SUM(Produccion.CONTADOR_PRODUCCION),0),0)) AS HLEnvases

	--From COB_MSM_PROD_LLENADORA_HORA Produccion
	--INNER JOIN @HorasTurno Hora on FECHA_INICIO = HORA.inicio
	--INNER JOIN Maquinas m on Produccion.ID_MAQUINA = m.Id and M.Linea = @LINEA
	--LEFT JOIN ORDENES O ON Produccion.ID_ORDEN = O.Id
	--GROUP BY M.ID, M.Descripcion


	SELECT
			ID_MAQUINA, 
			Descripcion,
			SUM(TotalEnvases) AS TotalEnvases,
			SUM(TotalCajas) AS TotalCajas,
			SUM(TotalPalets) AS TotalPalets,
			SUM(HL) AS HL,
			SUM(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
			,SUM(TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
			,SUM(TIEMPO_NETO) AS TIEMPO_NETO
			,SUM(TIEMPO_BRUTO) AS TIEMPO_BRUTO
			,SUM(CONTADOR_RECHAZOS) AS CONTADOR_RECHAZOS
			,SUM([VELOCIDAD_NOMINAL]) AS VELOCIDAD_NOMINAL
		FROM
		(SELECT ID_ORDEN, 
			ID_MAQUINA, 
			Maquinas.Descripcion as Descripcion, 
			o.IdProducto,
			COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalEnvases,
			CONVERT(real,ISNULL(o.CajasPorPalet*COALESCE(SUM(CONTADOR_PRODUCCION),0)/NULLIF(o.EnvasesPorPalet,0),0)) AS TotalCajas,
		
			CONVERT(real,ISNULL(  COALESCE(SUM(CONTADOR_PRODUCCION)/NULLIF(o.EnvasesPorPalet,0),0),0)) AS TotalPalets,
		
			CONVERT(real,ISNULL(o.HectolitrosProducto * COALESCE(SUM(CONTADOR_PRODUCCION),0),0)) as HL,
			COALESCE(SUM([TIEMPO_OPERATIVO]),0) AS TIEMPO_OPERATIVO
			,COALESCE(SUM([TIEMPO_PLANIFICADO]),0) AS TIEMPO_PLANIFICADO
			,COALESCE(SUM([TIEMPO_NETO]),0) AS TIEMPO_NETO
			,COALESCE(SUM([TIEMPO_BRUTO]),0) AS TIEMPO_BRUTO
			,COALESCE(SUM([CONTADOR_RECHAZOS]),0) AS CONTADOR_RECHAZOS
			,COALESCE(SUM([VELOCIDAD_NOMINAL]),0) AS VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Maquinas ON Maquinas.Id = h.ID_MAQUINA
		INNER JOIN Turnos t on t.Id = h.SHC_WORK_SCHED_DAY_PK
		LEFT JOIN Ordenes o ON o.Id = h.ID_ORDEN
		WHERE t.Id = @turno
		GROUP BY ID_ORDEN, ID_MAQUINA, o.IdProducto, o.HectolitrosProducto, o.CajasPorPalet,o.EnvasesPorPalet,Maquinas.Descripcion ) 
		AS ConsolidadoLLenadoraHL
		GROUP BY ID_MAQUINA,Descripcion 



commit TRANSACTION
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerProduccionHorasLlenadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_4_ObtenerProduccionHorasLlenadora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	--OEE LLENADORA

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
--set @linea = 'MSM.BURGOS.ENVASADO.B447'
--set @desde = convert(datetime,'2015-11-25T05:00:00',126)
--set @hasta = convert(datetime,'2015-11-25T13:00:00',126)

DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	
	DECLARE @d datetime
	DECLARE @h datetime

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = dateadd(hour,1, @d)

	BEGIN TRANSACTION
		
		WHILE @h <= DATEADD(s, @hasta, '19700101')
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@d,@h)
			SET @d = @h
			SET @h = dateadd(hour,1, @d)
			
		  END		
	COMMIT TRANSACTION


	
	Select m.Id, m.Descripcion AS NOMBRE,-- convert(varchar(2),DATEPART(HOUR, [dbo].[ToLocalDateTime](FECHA_INICIO))) + ':00' as Hora,
	case 
when sum([TIEMPO_PLANIFICADO]) = 0 then 0
else CONVERT(NUMERIC(18,2),((sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO])) * 100)  )
end as Disponibilidad,
case 
when sum(TIEMPO_OPERATIVO) = 0 then 0
else CONVERT(NUMERIC(18,2),((sum(TIEMPO_NETO)/sum(TIEMPO_OPERATIVO)) * 100)  )
end as Eficiencia,
case 
--PCV2 when sum(TIEMPO_OPERATIVO) = 0 OR sum([TIEMPO_PLANIFICADO])=0 then 0
--PCV2 else CONVERT(NUMERIC(18,2),((sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO])) * (sum([TIEMPO_NETO])/sum([TIEMPO_OPERATIVO])) * 1.0)*100.0)
when sum(VELOCIDAD_NOMINAL) = 0 then 0
else CONVERT(NUMERIC(18,2),ISNULL((SUM(CONTADOR_PRODUCCION)/SUM(VELOCIDAD_NOMINAL))*100.0,0))
end as OEE
, CONVERT(NUMERIC(18,0),SUM(TIEMPO_PLANIFICADO)/60) AS TIEMPO_PLANIFICADO
, CONVERT(NUMERIC(18,0),SUM(TIEMPO_OPERATIVO)/60) AS TIEMPO_OPERATIVO
, CONVERT(NUMERIC(18,0),SUM(TIEMPO_NETO)/60) AS TIEMPO_NETO
,case when SUM(VELOCIDAD_NOMINAL) = 0 then 0 
 else CONVERT(NUMERIC(18,2),ISNULL((SUM(CONTADOR_PRODUCCION)/SUM(VELOCIDAD_NOMINAL))*100.0,0)) end 
 AS RENDIMIENTO

	From COB_MSM_PROD_LLENADORA_HORA Produccion
	INNER JOIN @HorasTurno Hora on Produccion.Hora = DatePart(Hour,HORA.inicio) and Convert(Date,Fecha_INICIO) = Convert(Date, Hora.inicio)
	INNER JOIN Maquinas m on Produccion.ID_MAQUINA = m.Id and M.Linea = @LINEA
	--WHERE ISNULL(Produccion.ID_ORDEN,'') != ''
	GROUP BY M.ID, M.Descripcion--, FECHA_INICIO

commit TRANSACTION
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerRechazosTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE  [dbo].[Informe_ANA_4_ObtenerRechazosTurno]
	-- Add the parameters for the stored procedure here
	@Linea nvarchar(255),
	@desde bigint,
	@hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @idTurno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @desde, '19700101')
	SET @h = DATEADD(s, @hasta, '19700101')

	SELECT
		@idTurno = Id
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	DECLARE @RechazosInspectorSalidaLlenadora INT;
	DECLARE @RechazosInspectorBotellasVacias INT;
	DECLARE @RechazosClasificadores INT;
	DECLARE @RechazosProductoTerminado INT;
	
	SELECT   ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Clasificador' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'CLASIFICADOR'
	
	UNION ALL

	SELECT  ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Vacíos' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'INSPECTOR_BOTELLAS_VACIAS'

	UNION ALL

	SELECT  ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Subtotal vacíos' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND (m.Clase = 'INSPECTOR_BOTELLAS_VACIAS' or m.Clase = 'CLASIFICADOR')

	UNION ALL

	SELECT   ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Llenadora' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'INSPECTOR_SALIDA_LLENADORA'

	UNION ALL

	SELECT   ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Producto_Terminado' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA')

	UNION ALL

	SELECT   ISNULL(SUM(CMH.CONTADOR_RECHAZOS),0) as Total,'Subtotal llenos' as Nombre,'Automatico' AS Tipo
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA','INSPECTOR_SALIDA_LLENADORA')	  	 
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_4_ObtenerWOenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_4_ObtenerWOenTurno]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @desde bigint,
	 @hasta bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	--OEE LLENADORA

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
--set @linea = 'MSM.BURGOS.ENVASADO.B447'
--set @desde = convert(datetime,'2015-11-25T05:00:00',126)
--set @hasta = convert(datetime,'2015-11-25T13:00:00',126)



SELECT O.ID AS WO, O.IdProducto AS CodigoProducto, P.Descripcion as Producto 
  FROM [dbo].[Ordenes] O
  INNER JOIN Productos P on O.IdProducto = P.IdProducto
  WHERE O.Linea = @LINEA AND (
  	(FecIniReal >=  DATEADD(SECOND,@desde,'1970-01-01') and FecIniReal <=  DATEADD(SECOND,@hasta,'1970-01-01'))
		or
	(FecFinReal >=  DATEADD(SECOND,@desde,'1970-01-01') and FecFinReal <=  DATEADD(SECOND,@hasta,'1970-01-01'))
		or	
	(FecIniReal<=  DATEADD(SECOND,@desde,'1970-01-01') and FecFinReal >=  DATEADD(SECOND,@hasta,'1970-01-01'))
  )
  --AND o.FecIniReal <= DATEADD(SECOND,@desde,'1970-01-01') and O.FecFinReal >= DATEADD(SECOND,@hasta,'1970-01-01')
  commit TRANSACTION
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerArranquesLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[Informe_ANA_5_ObtenerArranquesLinea]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
	
	SELECT A.ID_ARRANQUE as IdArranaque
			,A.DESC_ARRANQUE as DescArranque
			, L.Id as Linea
 	FROM dbo.COB_MSM_ARRANQUES A
	INNER JOIN dbo.COB_MSM_LINEAS_ARRANQUES LA ON LA.FK_ID_ARRANQUE = A.ID_ARRANQUE
	INNER JOIN Lineas L ON L.NumeroLinea = LA.FK_ID_LINEA
	WHERE L.Id = @Linea

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerCambios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_5_ObtenerCambios]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Inicio nvarchar(255),
	 @Fin nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	set transaction isolation level read uncommitted


--SELECT convert(varchar(100),S.AÑO) + ' Semana ' + convert(varchar(100),S.SEMANA) as Fecha
--      ,CONVERT(INT,AVG([MinutosFinal1])) as 'Tiempo Real'
--      ,CONVERT(INT,AVG([MinutosObjetivo2])) as 'Tiempo Objetivo'
--  FROM [dbo].[OrdenesCambio] OC
--  LEFT JOIN [dbo].[SEMANAS] S ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO
--  where InicioReal between  convert(datetime,@Inicio) and  convert(datetime,@Fin) and [IdLinea] =@Linea
--  GROUP BY S.AÑO, S.SEMANA

  DECLARE @ini datetime = convert(datetime,@Inicio);
	DECLARE @find datetime = convert(datetime,@Fin);

	SELECT
		CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
		,ISNULL(CONVERT(INT, SUM([MinutosFinal1])), 0) AS 'Tiempo Final Llenadora'
		,ISNULL(CONVERT(INT, SUM([MinutosFinal2])), 0) AS 'Tiempo Final Paletizadora'
		,ISNULL(CONVERT(INT, SUM([MinutosObjetivo1])), 0) AS 'Tiempo Objetivo Llenadora'
		,ISNULL(CONVERT(INT, SUM([MinutosObjetivo2])), 0) AS 'Tiempo Objetivo Paletizadora'
	FROM [dbo].[SEMANAS] S
	LEFT JOIN [dbo].OrdenesCambio  OC ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO AND oc.IdLinea = @Linea
	WHERE @ini <= S.FIN AND @find >= S.INICIO
	GROUP BY S.AÑO, S.SEMANA
	ORDER BY S.SEMANA ASC
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerComentarios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_5_ObtenerComentarios]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Tipo nvarchar(50),
	 @Anyo int,
	 @Semana smallint,
	 @RangoSemanas smallint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
SELECT [LINEA]
      ,[ANYO]
      ,[SEMANA]
      ,[TIPO_ANALISIS]
      ,[COMENTARIOS]
  FROM [dbo].[ANALISIS_SPI]
  INNER JOIN Lineas L ON L.NumeroLinea = LINEA
  where L.Id=@Linea and TIPO_ANALISIS = @Tipo and Anyo = @Anyo and Semana = @Semana 


END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerGraficoOEE]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_5_ObtenerGraficoOEE]
	-- Add the parameters for the stored procedure here
	@linea as nvarchar(100),
	@fIni as nvarchar(100),
	@fFin as nvarchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

 set transaction isolation level read uncommitted


DECLARE @ini datetime = convert(datetime,@fIni);
DECLARE @find datetime = convert(datetime,@fFin);

SELECT
	ROW_NUMBER() OVER (ORDER BY S.AÑO) as ID
	,CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
	,CONVERT(FLOAT, AVG(PTC.OEE)) AS OEE
	,CONVERT(DECIMAL(38, 10),NULL) as Trend
INTO #Temp_Regression
FROM [dbo].[SEMANAS] S
	LEFT JOIN ProduccionTurnosConsolidada PTC ON PTC.FECHA <= S.FIN AND PTC.FECHA >= S.INICIO
WHERE @ini <= S.FIN AND @find >= S.INICIO AND LINEA = @linea
GROUP BY	S.AÑO
			,s.SEMANA

DECLARE @sample_size INT; 
DECLARE @intercept  DECIMAL(38, 10);
DECLARE @slope   DECIMAL(38, 10);
DECLARE @sumX   DECIMAL(38, 10);
DECLARE @sumY   DECIMAL(38, 10);
DECLARE @sumXX   DECIMAL(38, 10);
DECLARE @sumYY   DECIMAL(38, 10);
DECLARE @sumXY   DECIMAL(38, 10);

-- calculate sample size and the different sums
SELECT
  @sample_size = COUNT(*)
 ,@sumX   = SUM(ID)
 ,@sumY   = SUM([OEE])
 ,@sumXX   = SUM(ID*ID)
 ,@sumYY   = SUM([OEE]*[OEE])
 ,@sumXY   = SUM(ID*[OEE])
FROM #Temp_Regression;

 -- calculate the slope and intercept
SET @slope = CASE WHEN @sample_size = 1
    THEN 0 -- avoid divide by zero error
    ELSE (@sample_size * @sumXY - @sumX * @sumY) / (@sample_size * @sumXX - POWER(@sumX,2))
    END;
SET @intercept = (@sumY - (@slope*@sumX)) / @sample_size;

-- calculate trend line
UPDATE #Temp_Regression
SET Trend = (@slope*ID) + @intercept;

-- output results
SELECT ID, Fecha, FORMAT(OEE, 'N2') AS OEE, FORMAT(Trend, 'N2') AS 'Tendencia OEE'
FROM #Temp_Regression
DROP TABLE #Temp_Regression

END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerProduccionTurnosConsolidada]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_5_ObtenerProduccionTurnosConsolidada]
	-- Add the parameters for the stored procedure here
	@linea as nvarchar(100),
	@fIni as nvarchar(100),
	@fFin as nvarchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;

 set transaction isolation level read uncommitted
--SELECT
--	CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
--	,CONVERT(INT, AVG(PTC.OEE)) AS OEE
--	,1 AS CALIDAD
--	,CONVERT(INT, AVG(PTC.DISPONIBILIDAD)) AS Disponibilidad
--	,CONVERT(INT, AVG(PTC.EFICIENCIA)) AS Eficiencia
--FROM ProduccionTurnosConsolidada PTC
--LEFT JOIN [dbo].[SEMANAS] S
--	ON PTC.FECHA <= S.FIN
--	AND PTC.FECHA >= S.INICIO
--WHERE FECHA BETWEEN CONVERT(DATETIME, @fIni) AND CONVERT(DATETIME, @fFin)
--AND LINEA = @linea
--GROUP BY	S.AÑO
--			,s.SEMANA

DECLARE @ini datetime = convert(datetime,@fIni,103);
DECLARE @find datetime = convert(datetime,@fFin,103);

SELECT 
Fecha
,FORMAT(CONVERT(FLOAT, AVG(OEE) * AVG(CALIDAD)), 'N2') AS OEE
,FORMAT(CONVERT(FLOAT,AVG(CALIDAD)), 'N2') AS CALIDAD
,FORMAT(CONVERT(FLOAT, AVG(Disponibilidad)), 'N2') AS Disponibilidad
,FORMAT(CONVERT(FLOAT, AVG(Eficiencia)), 'N2') AS Eficiencia
,FORMAT(CONVERT(FLOAT, AVG(RENDIMIENTO)), 'N2') AS RENDIMIENTO
FROM
(
	SELECT 
	CT.Fecha
	--PCV2 ,isnull(((sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO])) * (sum([TIEMPO_NETO])/sum([TIEMPO_OPERATIVO])) * 1.0)*100.0,0)AS OEE	
	,isnull(((sum([CONTADOR_PRODUCCION])/sum([VELOCIDAD_NOMINAL])) * isnull(AVG(CT.CALIDAD),0))*100.0,0)AS OEE		
	,isnull(sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO]),0)*100.0 AS Disponibilidad
	,isnull(sum([TIEMPO_NETO])/sum([TIEMPO_OPERATIVO]),0)*100.0 AS Eficiencia
	,isnull(AVG(CT.CALIDAD),0) AS CALIDAD 
	,isnull(((sum([CONTADOR_PRODUCCION])/sum([VELOCIDAD_NOMINAL])))*100.0,0)AS RENDIMIENTO	
	FROM
	(
		SELECT
			CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
			,CT.FECHA AS FechaTurno,
			CT.IDTIPOTURNO	
			,sum([CONTADOR_PRODUCCION]) AS CONTADOR_PRODUCCION
			,sum([VELOCIDAD_NOMINAL])AS VELOCIDAD_NOMINAL
			,sum([TIEMPO_OPERATIVO]) AS TIEMPO_OPERATIVO
			,sum([TIEMPO_PLANIFICADO]) AS TIEMPO_PLANIFICADO
			,sum([TIEMPO_NETO]) AS TIEMPO_NETO
			,isnull(CT.IC,0) AS CALIDAD 
		FROM [dbo].[SEMANAS] S
		LEFT JOIN Turnos as Turno ON Turno.InicioTurno >= S.INICIO AND Turno.FinTurno <= S.FIN and Turno.Linea = @linea
		LEFT JOIN COB_MSM_PROD_LLENADORA_HORA AS PTC ON PTC.SHC_WORK_SCHED_DAY_PK = Turno.Id
		LEFT JOIN COB_MSM_CONSOLIDADO_TURNO AS CT ON CT.FECHA_INICIO >= S.INICIO AND CT.FECHA_FIN <= S.FIN and CT.LINEA = @linea
		WHERE @ini <= S.FIN AND @find >= S.INICIO --AND pct.LINEA = @linea
		GROUP BY	S.AÑO
					,s.SEMANA
					,CT.FECHA,CT.IDTIPOTURNO,CT.IC
		--order by CT.FECHA,CT.IDTIPOTURNO 
	) CT
	GROUP BY CT.Fecha	
) AS PP
GROUP BY Fecha

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_5_ObtenerTiempos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_5_ObtenerTiempos]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Inicio nvarchar(255),
	 @Fin nvarchar(255),
	 @Tipo int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	set transaction isolation level read uncommitted

--set @linea = 'MSM.BURGOS.ENVASADO.B447'
--set @desde = convert(datetime,'2015-11-25T05:00:00',126)
--set @hasta = convert(datetime,'2015-11-25T13:00:00',126)
--SELECT convert(varchar(100),S.AÑO) + ' Semana ' + convert(varchar(100),S.SEMANA) as Fecha
--      ,CONVERT(INT,AVG([MinutosFinal1])) as TiempoReal
--      ,CONVERT(INT,AVG([MinutosObjetivo2])) as TiempoObjetivo
--  FROM [dbo].[OrdenesArranque] OC
--  LEFT JOIN [dbo].[SEMANAS] S ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO
--  where TipoArranque=@Tipo and InicioReal between convert(datetime,@Inicio) and convert(datetime,@Fin) and [IdLinea] =@Linea
--  GROUP BY S.AÑO, S.SEMANA


  DECLARE @ini datetime = convert(datetime,@Inicio);
	DECLARE @find datetime = convert(datetime,@Fin);

	SELECT
		CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
		,ISNULL(CONVERT(INT, SUM([MinutosFinal1])), 0) AS 'Tiempo Final Llenadora'
		,ISNULL(CONVERT(INT, SUM([MinutosFinal2])), 0) AS 'Tiempo Final Paletizadora'
		,ISNULL(CONVERT(INT, SUM([MinutosObjetivo1])), 0) AS 'Tiempo Objetivo Llenadora'
		,ISNULL(CONVERT(INT, SUM([MinutosObjetivo2])), 0) AS 'Tiempo Objetivo Paletizadora'
	FROM [dbo].[SEMANAS] S
	LEFT JOIN (SELECT
					OA.*
				FROM [dbo].OrdenesArranque OA 
				INNER JOIN [dbo].[TIPOS_ARRANQUE] TA ON OA.[TipoArranque] = TA.ID_ARRANQUE
				AND TA.ID_ARRANQUE = @Tipo) OC
		ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO AND oc.IdLinea = @Linea
	WHERE @ini <= S.FIN AND @find >= S.INICIO
	GROUP BY S.AÑO, S.SEMANA
	ORDER BY S.SEMANA ASC

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerEnvasesTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerEnvasesTurno]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
SELECT CAST(SUM(PH.ENVASES_LLENADORA) as numeric(18,2)) as ENVASES
FROM [dbo].[Turnos] T
INNER JOIN [dbo].[ProduccionHoras] PH ON Ph.IdTurno = T.Id
WHERE
T.ID = @TURNO AND PH.LINEA = @LINEA

END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerNumeroBotellas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerNumeroBotellas]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint,
	 @OEEMin tinyint,
	 @OEEMax tinyint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT isnull(SUM(TB.NumeroBotellas),0) AS NumeroBotellas
FROM (
SELECT POT.CONTADOR_PRODUCCION as NumeroBotellas,
case 
when TIEMPO_OPERATIVO = 0 OR [TIEMPO_PLANIFICADO]=0 then 0
else (([TIEMPO_OPERATIVO]/[TIEMPO_PLANIFICADO]) * ([TIEMPO_NETO]/[TIEMPO_OPERATIVO]) * 1.0)*100.0
end as OEE
From COB_MSM_PROD_LLENADORA_HORA POT
INNER JOIN #Turnos T ON POT.SHC_WORK_SCHED_DAY_PK = T.Id
INNER JOIN Maquinas M ON M.Id = POT.ID_MAQUINA
INNER JOIN Lineas L ON M.Linea = L.Id
--INNER JOIN [dbo].[Ordenes] O ON POT.ID_ORDEN = O.Id
WHERE L.Id = @Linea --AND ISNULL(POT.ID_ORDEN,'') != ''--and @FechaInicio <= datediff(s, '1970-1-1' ,POT.FECHA_INICIO) and @FechaFin >= datediff(s, '1970-1-1' ,POT.FECHA_INICIO) 
) TB
where TB.OEE <= @OEEMax and TB.OEE >= @OEEMiN

DROP TABLE #Turnos

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerOEEs]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerOEEs]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint,
	 @OEEMin int,
	 @OEEMax int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT  Id
	INTO #TEMP_TURNO
	FROM Turnos
	WHERE [Linea] = @Linea AND  @d <= InicioTurno 
		AND @h >= FinTurno 
		AND LOWER(Turno) <> 'nowork'

SELECT DISTINCT FECHATURNO, CONVERT(NUMERIC(18,2),AVG(OEE)) as OEE, convert(numeric(18,2),avg(OBJETIVO)) AS OEEOBJETIVO, SHC_WORK_SCHED_DAY_PK as Turno, FECHA AS FECHA
FROM 
(Select distinct
case 
	When T.IdTipoTurno=1 Then convert(varchar(10),convert(date, T.FECHA)) + ' Mañana'
	When T.IdTipoTurno=2 Then convert(varchar(10),convert(date, T.FECHA)) + ' Tarde'
	Else convert(varchar(10),convert(date, T.FECHA)) + ' Noche'
end as FechaTurno
, 
case 
--PCV2 when sum(TIEMPO_OPERATIVO) = 0 OR sum([TIEMPO_PLANIFICADO])=0 then 0
--PCV2 else ((sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO])) * (sum([TIEMPO_NETO])/sum([TIEMPO_OPERATIVO])) * 1.0)*100.0
when sum([VELOCIDAD_NOMINAL]) = 0 then 0
else ((sum([CONTADOR_PRODUCCION])/sum([VELOCIDAD_NOMINAL])) * 1.0)*100.0
end as OEE
, avg(PL.OEEObjetivo) AS OBJETIVO, POT.SHC_WORK_SCHED_DAY_PK, datediff(s, '1970-1-1' ,convert(date, T.FECHA)) as FECHA
From [dbo].COB_MSM_PROD_LLENADORA_HORA POT
INNER JOIN [dbo].[Ordenes] O ON POT.ID_ORDEN = O.Id
LEFT JOIN [dbo].[ParametrosLinea] PL ON PL.PPR = O.PPR
INNER JOIN [dbo].[Turnos] T on T.Id = POT.SHC_WORK_SCHED_DAY_PK
INNER JOIN #TEMP_TURNO TEMP_T ON TEMP_T.Id = POT.SHC_WORK_SCHED_DAY_PK
where O.Linea = @Linea
GROUP BY T.FECHA, T.IdTipoTurno, POT.SHC_WORK_SCHED_DAY_PK) TAB
WHERE TAB.OEE <= @OEEMax and TAB.OEE >= @OEEMin
GROUP BY FechaTurno, FECHA,SHC_WORK_SCHED_DAY_PK
ORDER BY FECHA, SHC_WORK_SCHED_DAY_PK


DROP TABLE #TEMP_TURNO
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerParosSinAgrupar]    Script Date: 01/06/2016 12:20:32 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerOEEsPorHora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerOEEsPorHora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
	
	DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	DECLARE @desde datetime
	DECLARE @hasta datetime 
	DECLARE @fechaTurno datetime 

	
	SELECT @desde= InicioTurno , @hasta = FinTurno , @fechaTurno = Fecha
	FROM Turnos 
	WHERE Id = @Turno


	
	
	DECLARE @desdeH datetime
	DECLARE @hastaH datetime

	SET @desdeH = @desde
	SET @hastaH = dateadd(hour,1, @desdeH)

	BEGIN TRANSACTION
		
		WHILE @hastaH <=  @hasta
		  BEGIN
			INSERT  INTO @HorasTurno
			VALUES  (@desdeH,@hastaH)
			SET @desdeH = @hastaH
			SET @hastaH = dateadd(hour,1, @desdeH)
			
		  END		
	COMMIT TRANSACTION
	

	



	SELECT TABLA.Nombre,		
		TABLA.Hora,
		SUM(TABLA.TiempoPlanificado) AS TiempoPlanificado,
		SUM(TABLA.TiempoOperativo) AS TiempoOperativo,
		SUM(TABLA.TiempoBruto) AS TiempoBruto,
		SUM(TABLA.TiempoNeto) AS TiempoNeto,
		SUM(TABLA.VelocidadNominal) AS VelocidadNominal,
		SUM(TABLA.EnvasesProducidos) AS EnvasesProducidos,
		SUM(TABLA.ContadorRechazos) AS ContadorRechazos,
		case 
			--PCV2 when Sum(TABLA.TiempoOperativo) = 0 OR Sum(TABLA.TiempoPlanificado)=0 then 0
			--PCV2 else ((Sum(TABLA.TiempoOperativo)/Sum(TABLA.TiempoPlanificado)) * (Sum(TABLA.TiempoNeto)/Sum(TABLA.TiempoOperativo)) *100)
			when Sum(TABLA.VelocidadNominal) = 0 then 0
			else ((Sum(TABLA.EnvasesProducidos)/Sum(TABLA.VelocidadNominal)) *100)			
			end as totalOee,
		MAX(TABLA.Fecha_Inicio) as Fecha_Inicio
			FROM (

   (SELECT m.Descripcion as Nombre, 
			DATEPART(HOUR,[dbo].[ToLocalDateTime](inicio)) as Hora, 
			0 AS TiempoPlanificado,
			0 AS TiempoOperativo,
			0 AS TiempoBruto,
			0 AS TiempoNeto,
			0 AS VelocidadNominal,
			0 AS EnvasesProducidos,
			0 AS ContadorRechazos,
			[dbo].[ToLocalDateTime](inicio) AS Fecha_Inicio
   FROM @HorasTurno
   CROSS JOIN
   COB_MSM_PROD_LLENADORA_HORA AS LL
   INNER JOIN Maquinas M ON M.Id = LL.ID_MAQUINA --AND ISNULL(LL.ID_ORDEN,'') != ''
   WHERE M.Linea = @Linea 
   )
   UNION
(SELECT
			m.Descripcion as Nombre,
		
			DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)) as Hora
			,COALESCE(SUM(h.[TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
			,COALESCE(SUM(h.[TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
			,COALESCE(SUM(h.[TIEMPO_BRUTO]), 0) AS TiempoBruto
			,COALESCE(SUM(h.[TIEMPO_NETO]), 0) AS TiempoNeto
			,COALESCE(SUM(h.[VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
			,COALESCE(SUM(h.[CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
			,COALESCE(SUM(h.[CONTADOR_RECHAZOS]), 0) AS ContadorRechazos,			
			h.FECHA_INICIO as Fecha_Inicio
		FROM COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Maquinas m ON m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t
			ON t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE h.SHC_WORK_SCHED_DAY_PK = @turno --AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY DATEPART(HOUR,[dbo].[ToLocalDateTime](h.FECHA_INICIO)),m.Descripcion,h.Fecha_Inicio
		

)) AS TABLA 
GROUP BY TABLA.Nombre,TABLA.Hora
ORDER BY MAX(TABLA.Fecha_Inicio) Asc
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerParosAgrupados]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerParosAgrupados]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
Select PP.CausaNombre, sum(DuracionParoMayor) as Duracion, MaquinaCausaNombre, EquipoConstructivoNombre, PP.MotivoNombre, PP.Descripcion, Observaciones
--from dbo.ParosPerdidas PP
--INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
--INNER JOIN DBO.Turnos T ON PP.InicioLocal BETWEEN T.InicioTurno AND T.FinTurno and T.Linea=@Linea
--WHERE IdTipoParoPerdida=1 AND L.Nombre= @Linea AND T.Fecha = convert(Date,DATEADD(s, @Fecha, '19700101')) AND convert(int,t.Id) = @TURNO 
from dbo.ParosPerdidas PP
INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
--INNER JOIN DBO.Turnos T ON PP.Inicio BETWEEN T.InicioTurno AND T.FinTurno and T.Linea = @Linea
WHERE IdTipoParoPerdida=1 AND L.Id= @Linea --AND T.Fecha = convert(Date,DATEADD(s, @Fecha, '19700101')) AND t.Id = @TURNO 
AND PP.Turno = @Turno
Group by PP.CausaNombre, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, Observaciones, PP.MotivoNombre
ORDER BY Duracion DESC
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerParosSinAgrupar]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerParosSinAgrupar]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
Select [dbo].[ToLocalDateTime](PP.Inicio) as InicioLocal, cast(DuracionParoMayor as numeric(18,2)) as Duracion, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, Observaciones,
PP.CausaNombre, PP.MotivoNombre
from dbo.ParosPerdidas PP
INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
--INNER JOIN DBO.Turnos T ON PP.Inicio BETWEEN T.InicioTurno AND T.FinTurno and T.Linea = @Linea
WHERE IdTipoParoPerdida=1 AND L.Id= @Linea --AND T.Fecha = convert(Date,DATEADD(s, @Fecha, '19700101')) AND t.Id = @TURNO 
AND PP.Turno = @Turno

END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerPerdidaEficiencia]    Script Date: 01/06/2016 12:21:14 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerPerdidaEficiencia]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerPerdidaEficiencia]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
Select [dbo].[ToLocalDateTime](PP.Inicio) as InicioLocal, PP.CausaNombre, sum(DuracionBajaVelocidad)+ SUM(ISNULL(PP.DuracionParosMenores,0)) AS Duracion, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, Observaciones
,pp.MotivoNombre
from dbo.ParosPerdidas PP
	   INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
INNER JOIN DBO.Turnos T ON T.InicioTurno<= PP.INICIO and pp.INICIO< t.FinTurno and T.Linea = @Linea
WHERE IdTipoParoPerdida=2 AND L.Nombre= @Linea AND convert(date,convert(date,T.Fecha)) = convert(Date,DATEADD(s, @Fecha, '19700101')) AND t.Id = @TURNO 
Group by PP.Inicio, PP.CausaNombre, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, Observaciones, MotivoNombre

END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerAccionMejora]    Script Date: 01/06/2016 12:23:12 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerSintesisArranques]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerSintesisArranques]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted


 Select  [dbo].[ToLocalDateTime](AM.FECHA_ALTA) as FECHA_ALTA, L.NumeroLinea AS NUMERO_LINEA, L.Descripcion DESCRIPCION_LINEA,[dbo].[ToLocalDateTime](OA.InicioReal) as Inicio,TA.DESC_ARRANQUE, MinutosFinal1, MinutosFinal2, MinutosObjetivo1, MinutosObjetivo2, 
  AM.[DESCRIPCION_PROBLEMA], AM.[CAUSA], AM.[OBSERVACIONES], AM.USUARIO,CONVERT(VARCHAR(10), t.Fecha,103) FECHA_TURNO, T.InicioTurno FECHA_INICIO_TURNO,OA.ProductoEntrante,OA.IDProductoEntrante,
  T.Turno
  from [dbo].[OrdenesArranque] OA
  INNER JOIN Lineas L ON OA.IdLinea = L.Id
  INNER JOIN TIPOS_ARRANQUE TA ON OA.TipoArranque = TA.ID_ARRANQUE
  INNER JOIN [dbo].[ACCION_MEJORA_ARRANQUES] AMA ON AMA.ID_ARRANQUE = OA.Id
  INNER JOIN [dbo].[ACCION_MEJORA] AM ON AMA.FK_ACCION_MEJORA_ID = AM.ID_ACCION_MEJORA
  INNER JOIN DBO.Turnos T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId AND T.ID=@TURNO AND CONVERT(DATE,T.Fecha) = convert(Date,DATEADD(s, @FECHA, '19700101'))
  WHERE OA.IdLinea=@Linea


END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerSintesisCambios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerSintesisCambios]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted


 Select [dbo].[ToLocalDateTime](AM.FECHA_ALTA) as FECHA_ALTA, [dbo].[ToLocalDateTime](OA.InicioReal) as Inicio, MinutosFinal1, MinutosFinal2, MinutosObjetivo1, MinutosObjetivo2, 
  AM.[DESCRIPCION_PROBLEMA], AM.[CAUSA], AM.[OBSERVACIONES], AM.USUARIO, am.ACCION_PROPUESTA, oa.ProductoEntrante, OA.ProductoSaliente, oa.IDProductoEntrante, oa.IDProductoSaliente,
  t.turno, CONVERT(VARCHAR(10), t.Fecha,103) as FECHA_TURNO, L.NumeroLinea NUMERO_LINEA, L.Descripcion DESCRIPCION_LINEA
  from [dbo].OrdenesCambio OA
  INNER JOIN Lineas L ON OA.IdLinea = L.Id
  INNER JOIN [dbo].[ACCION_MEJORA_CAMBIOS] AMA ON AMA.ID_CAMBIO = OA.Id
  INNER JOIN [dbo].[ACCION_MEJORA] AM ON AMA.FK_ACCION_MEJORA_ID = AM.ID_ACCION_MEJORA
  INNER JOIN DBO.Turnos T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId AND T.ID=@TURNO AND CONVERT(DATE,T.Fecha) = convert(Date,DATEADD(s, @FECHA, '19700101'))
  WHERE OA.IdLinea=@Linea


END



GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_6_ObtenerSintesisTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_6_ObtenerSintesisTurno]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Turno int,
	 @Fecha bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
Select PP.EquipoDescripcion AS LLenadora, [dbo].[ToLocalDateTime](AM.FECHA_ALTA) as FECHA_ALTA,  'Linea '+ CONVERT(VARCHAR(2),L.NumeroLinea)+ ' - ' + L.Descripcion AS NUMERO_LINEA, L.Descripcion DESCRIPCION_LINEA,PP.TipoParoPerdida,CONVERT(VARCHAR(10),T.Fecha,103) AS FECHA_TURNO,T.Turno,T.InicioTurno, PP.CausaNombre, sum(PP.Duracion) AS Duracion, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, AM.ACCION_PROPUESTA,AM.DESCRIPCION_PROBLEMA,AM.CAUSA,AM.OBSERVACIONES,AM.USUARIO, PP.MotivoNombre
from dbo.ParosPerdidas PP
	   INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
INNER JOIN DBO.Turnos T ON PP.InicioLocal BETWEEN T.InicioTurno AND T.FinTurno and T.Linea = @Linea
INNER JOIN DBO.ACCION_MEJORA_PAROS_MAYORES AMPM ON AMPM.ID_PARO_MAYOR = PP.Id
INNER JOIN DBO.ACCION_MEJORA AM ON AM.ID_ACCION_MEJORA = AMPM.ID_ACCION_MEJORA
WHERE L.Nombre= @Linea AND convert(date,T.Fecha) = convert(Date,DATEADD(s, @Fecha, '19700101')) AND t.Id = @TURNO 
Group by PP.CausaNombre, MaquinaCausaNombre, EquipoConstructivoNombre, PP.Descripcion, AM.ACCION_PROPUESTA, PP.MotivoNombre,L.NumeroLinea, L.Descripcion,PP.TipoParoPerdida, T.Fecha,T.Turno,T.InicioTurno, AM.ACCION_PROPUESTA,AM.DESCRIPCION_PROBLEMA,AM.CAUSA,AM.OBSERVACIONES,AM.USUARIO
,AM.FECHA_ALTA,PP.EquipoDescripcion
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerAccionMejora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerAccionMejora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT TOP 10
		ROW_NUMBER() OVER (ORDER BY PP.DuracionParoMayor DESC) sequence_no
		,DuracionParoMayor AS Duracion
		,CASE
			WHEN PP.idtipoturno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, PP.FechaTurno)) + ' Mañana'
			WHEN PP.idtipoturno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, PP.FechaTurno)) + ' Tarde'
			ELSE CONVERT(VARCHAR(10), CONVERT(DATE, PP.FechaTurno)) + ' Noche'
		END AS IdTipoTurno
		,
		--PP.NombreTipoTurno as IdTipoTurno, 
		ISNULL(MaquinaCausaNombre, '') AS MaquinaCausaNombre
		,ISNULL(EquipoConstructivoNombre, '') AS EquipoConstructivoNombre
		,ISNULL(PP.Descripcion, '') AS Descripcion
		,ISNULL(AM.OBSERVACIONES, '') OBSERVACIONES
		,ISNULL(AM.ID_ACCION_MEJORA, 0) AS ID_ACCION_MEJORA
		,[dbo].[ToLocalDateTime](Inicio) AS InicioLocal
		,PP.Id AS IDParo
	FROM ParosPerdidas PP
	INNER JOIN #Turnos turnos ON PP.Turno = turnos.Id
	INNER JOIN [dbo].[Lineas] L ON PP.IdLinea = L.NumeroLinea
	LEFT JOIN [dbo].[ACCION_MEJORA_PAROS_MAYORES] AMP ON AMP.ID_PARO_MAYOR = PP.Id
	LEFT JOIN [dbo].[ACCION_MEJORA] AM ON AMP.ID_ACCION_MEJORA = AM.ID_ACCION_MEJORA
	WHERE L.Nombre = @Linea
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	AND PP.IdTipoParoPerdida = 1
	ORDER BY DuracionParoMayor DESC

	DROP TABLE #Turnos
END

/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidad]    Script Date: 01/06/2016 12:24:58 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerEficienciaTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerEficienciaTurno]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
		
	SELECT
		ROW_NUMBER() OVER (ORDER BY c.Fecha, c.IdTipoTurno ASC) AS ID
		,c.Fecha
		,c.FechaTurno
		,c.IdTipoTurno
		,AVG(c.Eficiencia) AS Eficiencia
		,CONVERT(DECIMAL(38, 10), NULL) AS Trend INTO #TempTrend
	FROM (SELECT
			CASE
				WHEN T.IdTipoTurno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' M'
				WHEN T.IdTipoTurno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' T'
				ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' N'
			END AS FechaTurno
			,0 AS Eficiencia
			,T.Fecha
			,T.IdTipoTurno
		FROM Turnos T
		WHERE T.Linea = @Linea
		AND @FechaInicio <= DATEDIFF(s, '1970-1-1', t.InicioTurno)
		AND @FechaFin > DATEDIFF(s, '1970-1-1', T.FinTurno) UNION ALL SELECT
			CASE
				WHEN T.IdTipoTurno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' M'
				WHEN T.IdTipoTurno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' T'
				ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' N'
			END AS FechaTurno
			,CASE
				WHEN TIEMPO_OPERATIVO = 0 THEN 0
				ELSE CONVERT(NUMERIC(18, 2), ((TIEMPO_NETO / TIEMPO_OPERATIVO) * 100))
			END AS Eficiencia
			,T.Fecha
			,T.IdTipoTurno
		FROM [dbo].COB_MSM_PROD_LLENADORA_HORA POT
		INNER JOIN [dbo].[Ordenes] O
			ON POT.ID_ORDEN = O.Id
		INNER JOIN [dbo].[Turnos] T
			ON T.Id = POT.SHC_WORK_SCHED_DAY_PK
		WHERE O.Linea = @Linea
		AND @FechaInicio <= DATEDIFF(s, '1970-1-1', POT.FECHA_INICIO)
		AND @FechaFin > DATEDIFF(s, '1970-1-1', POT.FECHA_INICIO)) C
	GROUP BY	c.Fecha
				,c.FechaTurno
				,c.IdTipoTurno


	--select * from #Temp_Regression

	DECLARE @sample_size INT;
 
	DECLARE @intercept  DECIMAL(38, 10);
	DECLARE @slope   DECIMAL(38, 10);
	DECLARE @sumX   DECIMAL(38, 10);
	DECLARE @sumY   DECIMAL(38, 10);
	DECLARE @sumXX   DECIMAL(38, 10);
	DECLARE @sumYY   DECIMAL(38, 10);
	DECLARE @sumXY   DECIMAL(38, 10);

	-- calculate sample size and the different sums
	SELECT
		@sample_size = COUNT(*)
		,@sumX = SUM(ID)
		,@sumY = SUM(Eficiencia)
		,@sumXX = SUM(ID * ID)
		,@sumYY = SUM(Eficiencia * Eficiencia)
		,@sumXY = SUM(ID * Eficiencia)
	FROM #TempTrend;

	-- output results
	--SELECT
	--  SampleSize   = @sample_size  
	-- ,SumRID    = @sumX   
	-- ,SumOrderQty   =@sumY   
	-- ,SumXX    = @sumXX   
	-- ,SumYY    = @sumYY   
	-- ,SumXY    = @sumXY;

	-- calculate the slope and intercept
	SET @slope =
				CASE
					WHEN @sample_size = 1 THEN 0 -- avoid divide by zero error
					ELSE (@sample_size * @sumXY - @sumX * @sumY) / (@sample_size * @sumXX - POWER(@sumX, 2))
				END;
	SET @intercept = (@sumY - (@slope * @sumX)) / @sample_size;

	-- calculate trend line
	UPDATE #TempTrend
	SET Trend = (@slope * ID) + @intercept;

	-- output results
	SELECT
		*
	FROM #TempTrend;
	DROP TABLE #TempTrend

--Select case 
--	When T.IdTipoTurno=1 Then convert(varchar(10),convert(date, POT.FECHA)) + ' Mañana'
--	When T.IdTipoTurno=2 Then convert(varchar(10),convert(date, POT.FECHA)) + ' Tarde'
--	Else convert(varchar(10),convert(date, POT.FECHA)) + ' Noche'
--end as FechaTurno, POT.[EFICIENCIA]
--From [dbo].[PRODUCCION_ORDEN_TURNO] POT
--INNER JOIN [dbo].[Ordenes] O ON POT.ORDEN = O.Id
--INNER JOIN [dbo].[Turnos] T on T.Id = POT.IdTurno
--where O.Linea = @Linea and @FechaInicio <= datediff(s, '1970-1-1' ,POT.Inicio) and @FechaFin >= datediff(s, '1970-1-1' ,POT.Inicio)

END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerMotivo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerMotivo]
	-- Add the parameters for the stored procedure here
@IdMotivo int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
select top 1 nivel1 from ReasonTree
where idnivel1=@IdMotivo
END

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerParosAccionMejora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerParosAccionMejora]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT DISTINCT TOP 10
		ROW_NUMBER() OVER (ORDER BY Duracion ASC) sequence_no
		,*
	FROM 
		(SELECT
			T.id AS Descripcion
			,CASE
				WHEN SUM(LL.TIEMPO_OPERATIVO) = 0 THEN 0
				ELSE CONVERT(NUMERIC(18, 2), ((SUM(LL.TIEMPO_NETO) / SUM(LL.TIEMPO_OPERATIVO)) * 100))
			END AS Duracion --EFICIENCIA
			,CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' ' + t.Turno AS MaquinaCausaNombre
			,GETDATE() AS InicioLocal
			,'' AS CausaNombre
			,'' AS MotivoNombre
			,'' AS EquipoConstructivoNombre
			,'' AS Observaciones
			,0 as ID_ACCION_MEJORA--,ISNULL(AM.ID_ACCION_MEJORA, 0) AS ID_ACCION_MEJORA
		FROM (
			SELECT
				SHC_WORK_SCHED_DAY_PK
				,TIEMPO_OPERATIVO
				,TIEMPO_NETO
				,FECHA_INICIO
			FROM COB_MSM_PROD_LLENADORA_HORA
			INNER JOIN #Turnos turnos ON turnos.Id = SHC_WORK_SCHED_DAY_PK
			UNION ALL 
			SELECT
			SHC_WORK_SCHED_DAY_PK
			,TIEMPO_OPERATIVO
			,TIEMPO_NETO
			,FECHA_INICIO
			FROM COB_MSM_PROD_RESTO_MAQ_HORA
			INNER JOIN #Turnos turnos ON turnos.Id = SHC_WORK_SCHED_DAY_PK
		) LL
		INNER JOIN TURNOS T ON T.ID = LL.SHC_WORK_SCHED_DAY_PK
		--LEFT JOIN [dbo].[ACCION_MEJORA_PAROS_MAYORES] AMP ON AMP.ID_PARO_MAYOR = PP.Id
		--LEFT JOIN [dbo].[ACCION_MEJORA] AM ON AMP.ID_ACCION_MEJORA = AM.ID_ACCION_MEJORA
		WHERE t.Linea = @Linea-- AND @FechaInicio <= DATEDIFF(s, '1970-1-1', LL.FECHA_INICIO) AND @FechaFin > DATEDIFF(s, '1970-1-1', LL.FECHA_INICIO)
		GROUP BY T.Id, T.Fecha, T.Turno) tab
	ORDER BY sequence_no ASC

DROP TABLE #Turnos
--Select top 10 row_number() OVER (ORDER BY sum(Duracion) asc) sequence_no,
--[dbo].[ToLocalDateTime](InicioLocal) as InicioLocal,
-- ISNULL([MotivoNombre],'') as MotivoNombre,
-- ISNULL([CausaNombre],'') as CausaNombre,
-- sum(Duracion) Duracion,
--convert(varchar(10),convert(date,T.Fecha)) + ' ' + t.Turno AS MaquinaCausaNombre,
-- ISNULL([EquipoConstructivoNombre],'') as EquipoConstructivoNombre,
-- T.id as Descripcion,
-- ISNULL(PP.[Observaciones],'') as Observaciones,
-- ISNULL(AM.ID_ACCION_MEJORA,0) as ID_ACCION_MEJORA
--from dbo.ParosPerdidas PP
--INNER JOIN DBO.Lineas L ON PP.IdLinea = L.NumeroLinea
--LEFT JOIN [dbo].[ACCION_MEJORA_PAROS_MAYORES] AMP ON PP.Id = AMP.ID_PARO_MAYOR
--LEFT JOIN [dbo].[ACCION_MEJORA] AM ON AMP.ID_ACCION_MEJORA = AM.ID_ACCION_MEJORA
--INNER JOIN [dbo].[Turnos] T ON T.Id = PP.Turno
--Where L.Nombre=@Linea and @FechaInicio <= datediff(s, '1970-1-1' ,InicioLocal) and @FechaFin > datediff(s, '1970-1-1' ,InicioLocal) and IdTipoParoPerdida=2
--group by InicioLocal, MotivoNombre,CausaNombre,t.Fecha,t.Turno,EquipoConstructivoNombre,t.Id,pp.Observaciones, am.ID_ACCION_MEJORA
--order by sequence_no asc

END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidad]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidad]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h --AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT
		ROW_NUMBER() OVER (ORDER BY TABLA.FechaTurno) as ID,
		TABLA.FechaTurno,
		SUM(TABLA.PerdidaDisponibilidad) AS PerdidaDisponibilidad,
		TABLA.Fecha,
		TABLA.IdTipoTurno
		,CONVERT(DECIMAL(38, 10),NULL) as Trend
	INTO #Temp_Regression
	FROM
	(
	SELECT
		CASE
			WHEN T.IdTipoTurno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' M'
			WHEN T.IdTipoTurno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' T'
			ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' N'
		END AS FechaTurno
		,0 AS PerdidaDisponibilidad
		,T.Fecha
		,T.IdTipoTurno
	FROM Turnos T
	INNER JOIN #Turnos TQ ON TQ.Id = t.Id
	WHERE T.Linea = @Linea
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', t.InicioTurno)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', T.InicioTurno) 
	UNION ALL 
	
	SELECT
		CASE
			WHEN T.idtipoturno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.fecha)) + ' M'
			WHEN T.idtipoturno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.fecha)) + ' T'
			ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.fecha)) + ' N'
		END AS FechaTurno
		,CONVERT(NUMERIC(18, 2), CONVERT(FLOAT, SUM(DuracionParoMayor)) / CONVERT(FLOAT, DATEDIFF(s, T.InicioTurno, T.FinTurno) * COUNT(*)) * 100) AS PerdidaDisponibilidad
		,T.Fecha
		,T.IdTipoTurno
	FROM [dbo].[ParosPerdidas] PP
	INNER JOIN #Turnos TQ ON TQ.Id = PP.Turno
	INNER JOIN [dbo].[Turnos] T ON T.Id = TQ.Id
	INNER JOIN DBO.Lineas L
		ON PP.IdLinea = L.NumeroLinea
	--INNER JOIN [dbo].[Turnos] T
	--	ON PP.Turno = T.Id
	
	WHERE IdTipoParoPerdida = 1
	AND L.Nombre = @Linea
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	GROUP BY	CONVERT(DATE, PP.FechaTurno)
				,T.idtipoturno
				,L.Nombre
				,DATEDIFF(s, T.InicioTurno, T.FinTurno)
				,T.fecha
	) AS TABLA
	GROUP BY TABLA.FechaTurno, TABLA.Fecha, TABLA.IdTipoTurno
	ORDER BY TABLA.Fecha, TABLA.IdTipoTurno ASC

	DECLARE @sample_size INT; 
	DECLARE @intercept  DECIMAL(38, 10);
	DECLARE @slope   DECIMAL(38, 10);
	DECLARE @sumX   DECIMAL(38, 10);
	DECLARE @sumY   DECIMAL(38, 10);
	DECLARE @sumXX   DECIMAL(38, 10);
	DECLARE @sumYY   DECIMAL(38, 10);
	DECLARE @sumXY   DECIMAL(38, 10);

	-- calculate sample size and the different sums
	SELECT
	  @sample_size = COUNT(*)
	 ,@sumX   = SUM(ID)
	 ,@sumY   = SUM([PerdidaDisponibilidad])
	 ,@sumXX   = SUM(ID*ID)
	 ,@sumYY   = SUM([PerdidaDisponibilidad]*[PerdidaDisponibilidad])
	 ,@sumXY   = SUM(ID*[PerdidaDisponibilidad])
	FROM #Temp_Regression;

	 -- calculate the slope and intercept
	SET @slope = CASE WHEN @sample_size = 1
		THEN 0 -- avoid divide by zero error
		ELSE (@sample_size * @sumXY - @sumX * @sumY) / (@sample_size * @sumXX - POWER(@sumX,2))
		END;
	SET @intercept = (@sumY - (@slope*@sumX)) / @sample_size;

	-- calculate trend line
	UPDATE #Temp_Regression
	SET Trend = (@slope*ID) + @intercept;

	-- output results
	SELECT FechaTurno, PerdidaDisponibilidad, Fecha, IdTipoTurno, FORMAT(Trend, 'N2') AS 'Tendencia OEE'
	FROM #Temp_Regression
	DROP TABLE #Temp_Regression

	DROP TABLE #Turnos
END



/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidadCausaMotivo]    Script Date: 01/06/2016 12:25:52 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidadCausaMotivo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[Informe_ANA_7_ObtenerPerdidaDisponibilidadCausaMotivo]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @FechaInicio bigint,
	 @FechaFin bigint,
	 --@Causa int,
	 @Motivo int = null
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	DECLARE @turno int
	DECLARE @d DATETIME
	DECLARE @h DATETIME

	SET @d = DATEADD(s, @FechaInicio, '19700101')
	SET @h = DATEADD(s, @FechaFin, '19700101')

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @d AND @h AND FinTurno BETWEEN @d AND @h --AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT
		ROW_NUMBER() OVER (ORDER BY TABLA.FechaTurno) as ID,
		TABLA.FechaTurno,
		SUM(TABLA.PerdidaDisponibilidad) AS PerdidaDisponibilidad,
		TABLA.Fecha,
		TABLA.IdTipoTurno
		,CONVERT(DECIMAL(38, 10),NULL) as Trend
	INTO #Temp_Regression
	FROM
	(SELECT
		CASE
			WHEN T.IdTipoTurno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' M'
			WHEN T.IdTipoTurno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' T'
			ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' N'
		END AS FechaTurno
		,0 AS PerdidaDisponibilidad
		,T.Fecha
		,T.IdTipoTurno
	FROM Turnos T
	INNER JOIN #Turnos TQ ON TQ.Id = t.Id
	WHERE T.Linea = @Linea
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', t.InicioTurno)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', T.InicioTurno) 
	UNION ALL 
	SELECT
		CASE
			WHEN T.idtipoturno = 1 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' M'
			WHEN T.idtipoturno = 2 THEN CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' T'
			ELSE CONVERT(VARCHAR(10), CONVERT(DATE, T.Fecha)) + ' N'
		END AS FechaTurno
		,
		--convert(numeric(18,2),convert(float,sum(DuracionParoMayor))/convert(float,DATEDIFF(s,T.InicioTurno,T.FinTurno)*count(*))*100) as PerdidaDisponibilidad
		CONVERT(NUMERIC(18, 2), CONVERT(FLOAT, SUM(DuracionParoMayor)) / CONVERT(FLOAT, DATEDIFF(s, T.InicioTurno, T.FinTurno) * COUNT(*)) * 100) AS PerdidaDisponibilidad
		,T.Fecha
		,T.IdTipoTurno
	FROM [dbo].[ParosPerdidas] PP
	INNER JOIN #Turnos TQ ON TQ.Id = PP.Turno
	INNER JOIN [dbo].[Turnos] T ON T.Id = TQ.Id
	INNER JOIN DBO.Lineas L ON PP.IdLinea = L.NumeroLinea
	--INNER JOIN [dbo].[Turnos] T ON PP.Turno = T.Id
	WHERE MotivoId = @Motivo AND L.Nombre = @Linea
	--AND @FechaInicio <= DATEDIFF(s, '1970-1-1', Inicio)
	--AND @FechaFin > DATEDIFF(s, '1970-1-1', Inicio)
	GROUP BY	CONVERT(DATE, T.Fecha)
				,T.idtipoturno
				,L.Nombre
				,DATEDIFF(s, T.InicioTurno, T.FinTurno)
				,T.fecha
	) AS TABLA
	GROUP BY TABLA.FechaTurno, TABLA.Fecha, TABLA.IdTipoTurno
	ORDER BY TABLA.Fecha, TABLA.IdTipoTurno ASC

	DECLARE @sample_size INT; 
	DECLARE @intercept  DECIMAL(38, 10);
	DECLARE @slope   DECIMAL(38, 10);
	DECLARE @sumX   DECIMAL(38, 10);
	DECLARE @sumY   DECIMAL(38, 10);
	DECLARE @sumXX   DECIMAL(38, 10);
	DECLARE @sumYY   DECIMAL(38, 10);
	DECLARE @sumXY   DECIMAL(38, 10);

	-- calculate sample size and the different sums
	SELECT
	  @sample_size = COUNT(*)
	 ,@sumX   = SUM(ID)
	 ,@sumY   = SUM([PerdidaDisponibilidad])
	 ,@sumXX   = SUM(ID*ID)
	 ,@sumYY   = SUM([PerdidaDisponibilidad]*[PerdidaDisponibilidad])
	 ,@sumXY   = SUM(ID*[PerdidaDisponibilidad])
	FROM #Temp_Regression;

	 -- calculate the slope and intercept
	SET @slope = CASE WHEN @sample_size = 1
		THEN 0 -- avoid divide by zero error
		ELSE (@sample_size * @sumXY - @sumX * @sumY) / (@sample_size * @sumXX - POWER(@sumX,2))
		END;
	SET @intercept = (@sumY - (@slope*@sumX)) / @sample_size;

	-- calculate trend line
	UPDATE #Temp_Regression
	SET Trend = (@slope*ID) + @intercept;

	-- output results
	SELECT FechaTurno, PerdidaDisponibilidad, Fecha, IdTipoTurno, FORMAT(Trend, 'N2') AS 'Tendencia OEE'
	FROM #Temp_Regression
	DROP TABLE #Temp_Regression

	DROP TABLE #Turnos
END


/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidasTurnoSubInforme]    Script Date: 01/06/2016 12:26:37 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerPerdidasTurnoSubInforme]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerPerdidasTurnoSubInforme]
	-- Add the parameters for the stored procedure here
	@Turno int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted


SELECT convert(varchar(100),[dbo].[ToLocalDateTime](Inicio),103) + ' ' + convert(varchar(100),[dbo].[ToLocalDateTime](Inicio),108)  as InicioLocal,
ISNULL(CausaNombre,'') + ' ' + ISNULL(MotivoNombre,'') AS Causa,
CONVERT(NUMERIC(18,2),(DuracionParosMenores + DuracionBajaVelocidad)) as Duracion,
MaquinaCausaNombre,
EquipoConstructivoNombre,
Descripcion,
Observaciones
FROM ParosPerdidas
WHERE Turno =@Turno AND IdTipoParoPerdida = 2
union all
Select '' as InicioLocal,
'Total' as Causa,
CONVERT(NUMERIC(18,2),sum(DuracionParosMenores + DuracionBajaVelocidad)),
'-' as MaquinaCausaNombre,
'-' as EquipoConstructivoNombre,
'-' as Descripcion,
'-' as Observaciones
From ParosPerdidas
WHERE Turno =@Turno AND IdTipoParoPerdida = 2
order by 3 desc

END



GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerSubReportAccionMejora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerSubReportAccionMejora]
	-- Add the parameters for the stored procedure here
    @AccionMejoraID bigint
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted
	

SELECT [dbo].[ToLocalDateTime](fecha_alta) AS fecha_alta,usuario,descripcion_problema,causa,accion_propuesta,fecha_finalizada,observaciones
  FROM [dbo].[ACCION_MEJORA]
  where ID_ACCION_MEJORA = @AccionMejoraID
END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_7_ObtenerSubReportAccionMejoraTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_7_ObtenerSubReportAccionMejoraTurno]
	-- Add the parameters for the stored procedure here
     @TurnoId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	set transaction isolation level read uncommitted

	SELECT DISTINCT
		[dbo].[ToLocalDateTime](AM.fecha_alta) as fecha_alta
		,AM.usuario
		,AM.descripcion_problema
		,AM.causa
		,AM.accion_propuesta
		,AM.fecha_finalizada
		,AM.observaciones
	FROM ParosPerdidas PP
	INNER JOIN [dbo].[ACCION_MEJORA_PAROS_MAYORES] AMP ON AMP.ID_PARO_MAYOR = PP.Id
	INNER JOIN [dbo].[ACCION_MEJORA] AM ON AMP.ID_ACCION_MEJORA = AM.ID_ACCION_MEJORA
	WHERE PP.Turno = @TurnoId AND PP.IdTipoParoPerdida = 2


--SELECT fecha_alta,usuario,descripcion_problema,causa,accion_propuesta,fecha_finalizada,observaciones
--  FROM [dbo].[ACCION_MEJORA]
--  where ID_ACCION_MEJORA = @AccionMejoraID
END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_IDIOMA]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_IDIOMA]
	-- Add the parameters for the stored procedure here
   @IdReport int,
   @Idioma varchar(10)
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	declare @like as varchar(1000)
	set @like = '%' + convert(varchar(1),@IdReport) + '%'
	select Literal,
case @Idioma
when 'en-GB' then Literal_EN
else Literal_ES
end as Traduccion
FRom [dbo].[IDIOMA_INFORME] 
where informe like @like or informe='0'
commit TRANSACTION

END
GO
/****** Object:  StoredProcedure [dbo].[Informe_ANA_LINEA]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[Informe_ANA_LINEA]
	-- Add the parameters for the stored procedure here
   @Linea varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	SELECT 'Línea ' + convert(varchar(2),NumeroLinea) + ' - ' + Descripcion as Linea
	FROM Lineas
	Where ID=@Linea
	COMMIT TRANSACTION
END
GO
/****** Object:  StoredProcedure [dbo].[InsertIntoItemInFiltrationPO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create procedure [dbo].[InsertIntoItemInFiltrationPO]
(@index bigint,@POId nvarchar(max),@item nvarchar(max))
AS
BEGIN
	INSERT INTO ItemsInActiveFiltration values(@index,@POId,@Item)
END

GO
/****** Object:  StoredProcedure [dbo].[INTERSPC_ObtenerRelacionEnvasesCajasPalets]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[INTERSPC_ObtenerRelacionEnvasesCajasPalets]
	-- Add the parameters for the stored procedure here
	@idProducto varchar(200)
AS
BEGIN
  DECLARE @SectionId numeric(8,0);
  DECLARE @PropertyGroupId numeric(8,0);

  select @SectionId = CONVERT(numeric(8,0),ParameterData) from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Esq_Palet_Section'
  select @PropertyGroupId = CONVERT(numeric(8,0),ParameterData) from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Esq_Palet_Group'
  
  CREATE TABLE #PropertyTemp ( PropertyId numeric(8,0))

  INSERT INTO #PropertyTemp (PropertyId)
  SELECT CONVERT(numeric(8),ParameterData) 
  from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] 
  where Parameter IN ('Posicion_Fleje','Cont_Embalaje','Emb_Manto','Cont_Palet','Pack_Palet','Mantos_Palet'); 
  
  SELECT    
   itsp.PartNo,
   itsp.PropertyId,
   itp.Description as Property,
   itsp.Numeric1 as Value
   ,itsp.Revision
  FROM INTERSPEC.MSMIS.INTERSPC.ItSpProperty itsp
	INNER JOIN INTERSPEC.MSMIS.INTERSPC.ItSc itsc on itsp.SectionId = itsc.SectionId
	INNER JOIN INTERSPEC.MSMIS.INTERSPC.ItPropertyGroup itpg on itsp.PropertyGroupId = itpg.PropertyGroupId
	INNER JOIN INTERSPEC.MSMIS.INTERSPC.ItProperty itp on itsp.PropertyId = itp.PropertyId
  where 
	itsp.PartNo = @idProducto
	and itsp.Revision = dbo.f_get_att_rev(itsp.PartNo, NULL)
	and itsc.SectionId = @SectionId
	and itpg.PropertyGroupId  = @PropertyGroupId
	and itp.PropertyId IN (select PropertyId FROM #PropertyTemp)

  DROP TABLE #PropertyTemp
	
 SET NOCOUNT ON;

END


GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaCreaValorKOP_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizaCreaValorKOP_FAB] 
	@kop INT,
	@proc int,
	@ord int,
	@val varchar(100),
	@fec date
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

   IF EXISTS(
		SELECT ACTL_VAL FROM [SITMESDB_FAB].SITmesDB.DBO.POMV_PCS_PARM_ACTL_VAL ACTVAL
		INNER JOIN [SITMESDB_FAB].SITmesDB.DBO.[POMV_ETRY] PR ON PR.pom_entry_id = ACTVAL.pom_entry_id 
			AND PR.pom_order_pk = @ord AND PR.pom_entry_PK = @proc
		WHERE PARM_PK = @kop)
		BEGIN
			--EXISTE, SOLO HAY QUE ACTUALIZAR
			SELECT 1
		END
		ELSE
		BEGIN
			--NO EXISTE, HAY QUE CREARLO
			SELECT 1
		END
		END

GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaKOPProceso]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_ActualizaKOPProceso] 
	@valor varchar(100),
	@min varchar(100),
	@max varchar(100),
	@idValor int,
	@fecha datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

   UPDATE [SITMESDB_FAB].[SITMesDb].[dbo].[PDefM_PS_ParamValues]
   SET ParamValues_Value= @valor, ParamValues_MinVal=@min, ParamValues_MaxVal=@max, RowUpdated=@fecha
   where ParamValues_Num = @idValor

   END

GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaLineaArranqueCambio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizaLineaArranqueCambio]
	-- Add the parameters for the stored procedure here
	@orden varchar(200),
	@valor varchar(200)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

declare @pkLinea as int = (SELECT equip_pk FROM SITMesDB.dbo.BPM_EQUIPMENT WHERE [equip_id] = @valor)

UPDATE E
SET e.equip_pk = @pkLinea
FROM SITMesDB.dbo.POM_ENTRY E
INNER JOIN SITMesDB.dbo.POM_ORDER o ON o.pom_order_pk = E.pom_order_pk
where o.pom_order_id=@orden and E.order_extended_data = N'Y'

END
GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaMinutosArranqueCambio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizaMinutosArranqueCambio]
	-- Add the parameters for the stored procedure here
	@orden varchar(200),
	@tipo varchar(100),
	@valor varchar(200)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;


UPDATE ecf_rt
SET ecf_rt.VAL = CONVERT(DECIMAL,@VALOR)
FROM [SITMesDB].[dbo].[POM_CUSTOM_FIELD_RT] ecf_rt
JOIN [SITMesDB].dbo.POM_ENTRY e
	ON ecf_rt.pom_entry_pk = e.pom_entry_pk
JOIN [SITMesDB].dbo.POM_ORDER o
	ON o.pom_order_pk = e.pom_order_pk
WHERE pom_custom_fld_name = @TIPO AND o.pom_order_id = @ORDEN



END
GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaPropiedadEquipo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizaPropiedadEquipo]
	-- Add the parameters for the stored procedure here
	@equipo varchar(200),
	@prop varchar(200),
	@idOrden varchar(200),
	@tipo varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @EQUIPPK INT = (SELECT [equip_pk] FROM [SITMESDB_FAB].[SITMesDb].[dbo].[BPM_EQUIPMENT] WHERE [equip_id]= @equipo)

	PRINT('EQUIPO: '+@equipo + ' ID: '+ CONVERT(VARCHAR(100),@EQUIPPK))
	PRINT('PROP: '  + @prop)
	PRINT('ID_ORDEN: ' +@idOrden)

	IF @TIPO = 'Inicio'
	BEGIN

	PRINT('INICIO')
		UPDATE [SITMESDB_FAB].[SITMesDb].[dbo].[BPM_EQUIPMENT_PROPERTY]
		SET [equip_prpty_value] = @idOrden
		WHERE [equip_prpty_id] = @prop AND [equip_pk] = @EQUIPPK
	END
	ELSE
	BEGIN
	PRINT('FIN')
		IF EXISTS (SELECT * FROM [SITMESDB_FAB].[SITMesDb].[dbo].[BPM_EQUIPMENT_PROPERTY] WHERE [equip_prpty_id] = @prop AND [equip_pk] = @EQUIPPK AND [equip_prpty_value] = @idOrden )
		BEGIN
		PRINT('EXISTE, ACTUALIZO')
		UPDATE [SITMESDB_FAB].[SITMesDb].[dbo].[BPM_EQUIPMENT_PROPERTY]
		SET [equip_prpty_value] = ''
		WHERE [equip_prpty_id] = @prop AND [equip_pk] = @EQUIPPK AND [equip_prpty_value] = @idOrden 

		END
	END

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaPropiedadOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ActualizaPropiedadOrden]
	-- Add the parameters for the stored procedure here
	@orden varchar(200),
	@nombreProp varchar(100),
	@valor varchar(200)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

	UPDATE SITMesDB.[dbo].[POMV_ORDR_PRP]
	   SET [VAL] = @valor
	 WHERE pom_custom_fld_name = @nombreProp AND pom_order_id = @orden

END
GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaTiemposObjetivoOrdenArranque]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ActualizaTiemposObjetivoOrdenArranque]
	@OA VARCHAR(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		DECLARE @TIEMPO_OBJ_LLENADORA INT = -1;
				DECLARE @TIEMPO_OBJ_PAL INT = -1;

		SELECT
			@TIEMPO_OBJ_LLENADORA = TIEMPO_OBJETIVO_1
			,@TIEMPO_OBJ_PAL = TIEMPO_OBJETIVO_2
		FROM dbo.COB_MSM_TIEMPOS_ARRANQUES AS tiemposArranque
		INNER JOIN (SELECT IDProductoEntrante, Linea, TipoArranque 
					FROM dbo.OrdenesArranque
					WHERE Id = @OA) ord ON tiemposArranque.ID_PRODUCTO_ENTRANTE = ord.IDProductoEntrante AND tiemposArranque.FK_LINEAS_ID = ord.Linea
			AND tiemposArranque.FK_ARRANQUES_ID = ord.TipoArranque

		IF (@TIEMPO_OBJ_LLENADORA <> -1)
		BEGIN
			UPDATE SITMesDB.[dbo].[POMV_ORDR_PRP]
			SET [VAL] = @TIEMPO_OBJ_LLENADORA
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_LLE'
			AND pom_order_id = @OA
		END

		IF (@TIEMPO_OBJ_PAL <> -1)
			BEGIN
			UPDATE SITMesDB.[dbo].[POMV_ORDR_PRP]
			SET [VAL] = @TIEMPO_OBJ_PAL
			WHERE pom_custom_fld_name = 'TIEMPO_OBJETIVO_PAL'
			AND pom_order_id = @OA
		END

	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ActualizaTipoArranque]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ActualizaTipoArranque]
	@OA VARCHAR(100),
	@nuevoTipo VARCHAR(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	--SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	

		UPDATE P
		SET VAL = (SELECT [ID_ARRANQUE] FROM MES_MSM.[dbo].[TIPOS_ARRANQUE] WHERE [ID_ARRANQUE]=@nuevoTipo)
		FROM SITMesDB.dbo.POMV_ORDR_PRP P
		WHERE pom_custom_fld_name = 'ARRANQUE_ID'
		AND pom_order_id  = @OA
			   	 
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoICTurnoActual]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoICTurnoActual]
	@fecha AS DATETIME,
	@NumLinea as SMALLINT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
		DECLARE @IdParamtTiempoVaciadoTren INT = 14;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Tiempo para considerar vaciado tren'
		DECLARE @ParamtTiempoVaciadoTren INT;
		DECLARE @FECHA_INICIO_LIMITE_INFERIOR_GAPINF DATETIME;
		DECLARE @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF DATETIME;
		DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME;
		DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME = NULL;
		DECLARE @TIEMPO_VACIADO_TREN AS INT;
		DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
		DECLARE @NumDiasRango AS INT = 30;
		DECLARE @fIni AS DATETIME;
		DECLARE @fFin AS DATETIME;
		DECLARE @FECHA_INICIO DATETIME;
		DECLARE @FECHA_FIN DATETIME;
		DECLARE @FECHA_DATEPART DATE;
		DECLARE @HORA INT;
		DECLARE @FECHA_FIN_ULTIMO_REG DATETIME;

		PRINT '@fecha: ' + CONVERT(NVARCHAR(MAX), @fecha,25) + ' @NumLinea: ' + CONVERT(NVARCHAR(MAX), @NumLinea);

		SELECT @ParamtTiempoVaciadoTren = VALOR_INT
		from COB_MSM_PARAMETROS_LINEA_ADMIN
		WHERE FK_PARAMETRO_ID = @IdParamtTiempoVaciadoTren AND FK_LINEA_ID = @numLinea
		
		PRINT '@ParamtTiempoVaciadoTren: ' + CONVERT(NVARCHAR(MAX), @ParamtTiempoVaciadoTren,25)

		--Obtención gap limite superior -> fecha del ultimo registro menos el primer registro que tenga producción > TiempoVaciadoTren
		IF((SELECT [dbo].[MES_ExisteConsolidadoTurnoHoraAnterior] (@NumLinea,@fecha)) = 0)
		BEGIN
			PRINT 'No existe consolidado turno hora anterior';
			SET @fecha = DATEADD(HOUR,-1,@fecha);
			PRINT '@fecha: ' + CONVERT(NVARCHAR(MAX), @fecha,25) 
		END
		SET @fFin = @fecha;
		SET @fIni = DATEADD(DAY,-@NumDiasRango,@fFin);
		PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)

		;WITH Consolidado AS(
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_LLENADORA_HORA 
				LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.NumLinea = @NumLinea-- AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
				UNION 
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
				LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea --AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
			)
		SELECT TOP(1) @FECHA_FIN_ULTIMO_REG = MAX(Consolidado.FECHA_FIN) 
		FROM Consolidado
		LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
		GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
		ORDER BY convert(date, Consolidado.FECHA_INICIO) DESC,HORA DESC

		WHILE(@NumDiasRango > 0)
		BEGIN		
			;WITH Consolidado AS(
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_LLENADORA_HORA 
				LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
				UNION 
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
				LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
			)
			SELECT TOP(1) @FECHA_DATEPART = convert(date, Consolidado.FECHA_INICIO) ,@HORA = HORA, @FECHA_INICIO = MIN(Consolidado.FECHA_INICIO), @FECHA_FIN = MAX(Consolidado.FECHA_FIN) , @TIEMPO_VACIADO_TREN = COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren) 
			FROM Consolidado
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
			GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
			ORDER BY convert(date, Consolidado.FECHA_INICIO) DESC,HORA DESC

			IF(@FECHA_FIN IS NOT NULL)
			BEGIN 
				PRINT '@FECHA_FIN_ULTIMO_REG: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_ULTIMO_REG,25)
				IF((datediff(second,@FECHA_FIN, @FECHA_FIN_ULTIMO_REG)/3600.0) >= @TIEMPO_VACIADO_TREN)
				BEGIN
					SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_FIN;
					PRINT '@FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25) 
				END
				SET @NumDiasRango = 0;
			END
			ELSE
			BEGIN
				DECLARE @FECHA_MIN AS DATETIME;
				SELECT @FECHA_MIN = MIN(FECHA_INICIO)
				FROM
				(
					SELECT MIN(FECHA_INICIO) AS FECHA_INICIO
					FROM COB_MSM_PROD_LLENADORA_HORA 
					UNION 
					SELECT MIN(FECHA_INICIO) AS FECHA_INICIO
					FROM COB_MSM_PROD_RESTO_MAQ_HORA 
				) AS C

				IF(@fIni < @FECHA_MIN)
				BEGIN 
					SET @NumDiasRango = 0;
				END
				ELSE
				BEGIN
					SET @fFin = @fIni;
					SET @fIni = DATEADD(DAY,-@NumDiasRango,@fFin);
					PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)
				END
			END		
		END
	
		IF(@FECHA_INICIO_LIMITE_SUPERIOR IS NOT NULL)
		BEGIN
			DECLARE @FALTA_REG BIT;
			SELECT @FALTA_REG = [dbo].[MES_ComprobarGapPorFaltaDeRegistros] (@FECHA_FIN,@FECHA_FIN_ULTIMO_REG,@NumLinea, @TIEMPO_VACIADO_TREN,1);
			IF(@FALTA_REG = 0)
			BEGIN
				--Obtención fechas gap inferior
				SELECT 
					@FECHA_INICIO_LIMITE_INFERIOR_GAPINF = FECHA_INICIO_LIMITE_INFERIOR, 
					@FECHA_INICIO_LIMITE_SUPERIOR_GAPINF = FECHA_INICIO_LIMITE_SUPERIOR, 
					@TIEMPO_VACIADO_TREN = TIEMPO_VACIADO_TREN
				FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@FECHA_INICIO_LIMITE_SUPERIOR,@NumLinea,0)
				PRINT '@FECHA_INICIO_LIMITE_INFERIOR_GAPINF: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR_GAPINF,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF,25);
				IF(@FECHA_INICIO_LIMITE_INFERIOR_GAPINF IS NOT NULL AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF IS NOT NULL)
				BEGIN
					--Comprobamos si el gap es por falta de registros
					SELECT @FALTA_REG = [dbo].[MES_ComprobarGapPorFaltaDeRegistros] (@FECHA_INICIO_LIMITE_INFERIOR_GAPINF,@FECHA_INICIO_LIMITE_SUPERIOR_GAPINF,@NumLinea, @TIEMPO_VACIADO_TREN,0) 
					IF(@FALTA_REG = 0)
					BEGIN
						SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF;
						PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) 
						DECLARE @linea as NVARCHAR(200);
						SELECT @linea = Id
						FROM Lineas WHERE NumeroLinea = @NumLinea

						--Cálculo ICTurnos para el rango de fechas
						DECLARE @ICTURNO AS FLOAT;
						SELECT @ICTURNO = [dbo].[MES_GetICTurnos] (@linea,  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR);

						--Actaulización del ICTurnos para los turnos afectados
						IF(@ICTURNO IS NOT NULL)
						BEGIN
							--EXECUTE [dbo].[MES_UpdateICTurnos]  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR, @NumLinea, @ICTURNO
							DECLARE @tmpTurnosToUpdate TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL)
							-- Obtenemos los turnos que se van a actualizar
							INSERT INTO @tmpTurnosToUpdate
							SELECT * FROM [dbo].[MES_GetTurnosToUpdateIC] (@FECHA_INICIO_LIMITE_INFERIOR,@FECHA_INICIO_LIMITE_SUPERIOR,@NumLinea)					
				
							DECLARE @ICTurnoAnterior FLOAT;
							DECLARE @ICTurnoUNICO INT;
							SELECT DISTINCT @ICTurnoUNICO = COUNT(IC), @ICTurnoAnterior = IC
							FROM @tmpTurnosToUpdate
							GROUP BY IC

							SELECT @ICTurnoUNICO = COUNT(IC), @ICTurnoAnterior = MIN(IC)
							FROM 
							(
								SELECT DISTINCT IC
								FROM @tmpTurnosToUpdate
							) AS C


							--Comprobamos si es necesario actualizarlos o tienen el mismo valo
							PRINT '@ICTurnoAnterior: ' + CONVERT(NVARCHAR(MAX), @ICTurnoAnterior) + ' @ICTurno: ' + CONVERT(NVARCHAR(MAX), @ICTurno) + ' @ICTurnoUNICO: ' + CONVERT(NVARCHAR(MAX), @ICTurnoUNICO,25)
							IF(@ICTurnoUNICO <> 1 OR CONVERT(NVARCHAR(MAX), @ICTurnoAnterior) <> CONVERT(NVARCHAR(MAX), @ICTurno))
							BEGIN
								PRINT 'Es necesario actualizarlo' 
								UPDATE CTURNO
								SET CTURNO.[IC] = @ICTurno
								FROM COB_MSM_CONSOLIDADO_TURNO AS CTURNO
								INNER JOIN @tmpTurnosToUpdate AS TMP ON TMP.IDArchiveValue = CTURNO.[$IDArchiveValue] and CTURNO.SHC_WORK_SCHED_DAY_PK = TMP.ID_TURNO 				
								 

								SELECT ID_TURNO,FECHA_TURNO,t.Nombre AS 'IDTIPOTURNO', @ICTurno AS IC
								from @tmpTurnosToUpdate
								INNER JOIN TiposTurno t on t.Id = IDTIPOTURNO
								ORDER BY FECHA_TURNO,IDTIPOTURNO	
							END	
							ELSE					
							BEGIN
								PRINT 'No es necesario actualizarlo' 
							END
						END
						ELSE
						BEGIN
							PRINT 'No es necesario actualizarlo, ICT NULO' 
						END
					END
				END
			END
		END
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoICTurnosIntervaloFechas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoICTurnosIntervaloFechas]
	@FECHA_INICIO_LIMITE_INFERIOR AS DATETIME,
	@FECHA_INICIO_LIMITE_SUPERIOR AS DATETIME,
	@NumLinea as SMALLINT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
	DECLARE @linea as NVARCHAR(200);
	SELECT @linea = Id
	FROM Lineas WHERE NumeroLinea = @NumLinea

	--Cálculo ICTurnos para el rango de fechas
	DECLARE @ICTURNO AS FLOAT;
	SELECT @ICTURNO = [dbo].[MES_GetICTurnos] (@linea,  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR);

	--Actaulización del ICTurnos para los turnos afectados
	IF(@ICTURNO IS NOT NULL)
	BEGIN
		--EXECUTE [dbo].[MES_UpdateICTurnos]  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR, @NumLinea, @ICTURNO

		DECLARE @tmpTurnosToUpdate TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL)

		INSERT INTO @tmpTurnosToUpdate
		SELECT * FROM [dbo].[MES_GetTurnosToUpdateIC] (@FECHA_INICIO_LIMITE_INFERIOR,@FECHA_INICIO_LIMITE_SUPERIOR,@NumLinea)
			
		UPDATE CTURNO
		SET CTURNO.[IC] = @ICTurno
		FROM COB_MSM_CONSOLIDADO_TURNO AS CTURNO
		INNER JOIN @tmpTurnosToUpdate AS TMP ON TMP.IDArchiveValue = CTURNO.[$IDArchiveValue] and CTURNO.SHC_WORK_SCHED_DAY_PK = TMP.ID_TURNO  

		--Devolvemos los turnos actualizados con el ICTurno para logearlo
		SELECT DISTINCT ID_TURNO,FECHA_TURNO,t.Nombre as 'TIPOTURNO' ,@ICTurno as IC, IDTIPOTURNO
		from @tmpTurnosToUpdate
		INNER JOIN TiposTurno t on t.Id = IDTIPOTURNO
		ORDER BY FECHA_TURNO,IDTIPOTURNO	
	END
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoICTurnosPorFecha]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoICTurnosPorFecha]
	@fecha AS DATETIME,
	@NumLinea as SMALLINT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR_GAPINF DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME;

	--Obtención fechas gap inferior
	SELECT @FECHA_INICIO_LIMITE_INFERIOR_GAPINF = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF = FECHA_INICIO_LIMITE_SUPERIOR FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fecha,@NumLinea,0)
	
	IF(@FECHA_INICIO_LIMITE_INFERIOR_GAPINF IS NOT NULL AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF IS NOT NULL)
	BEGIN
		SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF;
		
		--Obtención fechas gap superior
		SELECT @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP = FECHA_INICIO_LIMITE_SUPERIOR FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fecha,@NumLinea,1)
		
		IF(@FECHA_INICIO_LIMITE_INFERIOR_GAPSUP IS NOT NULL AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP IS NOT NULL)
		BEGIN
			SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP;

			DECLARE @linea as NVARCHAR(200);
			SELECT @linea = Id
			FROM Lineas WHERE NumeroLinea = @NumLinea

			--Cálculo ICTurnos para el rango de fechas
			DECLARE @ICTURNO AS FLOAT;
			SELECT @ICTURNO = [dbo].[MES_GetICTurnos] (@linea,  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR);

			--Actaulización del ICTurnos para los turnos afectados
			IF(@ICTURNO IS NOT NULL)
			BEGIN
				--EXECUTE [dbo].[MES_UpdateICTurnos]  @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR, @NumLinea, @ICTURNO

				DECLARE @tmpTurnosToUpdate TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL)

				INSERT INTO @tmpTurnosToUpdate
				SELECT * FROM [dbo].[MES_GetTurnosToUpdateIC] (@FECHA_INICIO_LIMITE_INFERIOR,@FECHA_INICIO_LIMITE_SUPERIOR,@NumLinea)
			
				UPDATE CTURNO
				SET CTURNO.[IC] = @ICTurno
				FROM COB_MSM_CONSOLIDADO_TURNO AS CTURNO
				INNER JOIN @tmpTurnosToUpdate AS TMP ON TMP.IDArchiveValue = CTURNO.[$IDArchiveValue] and CTURNO.SHC_WORK_SCHED_DAY_PK = TMP.ID_TURNO  

				SELECT ID_TURNO,FECHA_TURNO,IDTIPOTURNO,IC
				from @tmpTurnosToUpdate
				ORDER BY FECHA_TURNO,IDTIPOTURNO	

				SELECT @FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR
			END
		END
	END
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoMensualOeePreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoMensualOeePreactor]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
    -- Insert statements for procedure here
		DECLARE @numLinea SMALLINT;
		DECLARE @IdProducto NVARCHAR(100);
		DECLARE @OEEMedioPreactor FLOAT;

		DECLARE cProductosLinea CURSOR FOR
		SELECT DISTINCT l.NumeroLinea, Ordenes.IdProducto
		FROM Ordenes
		INNER JOIN [dbo].[Lineas] l on l.Id = Ordenes.Linea
		WHERE Ordenes.EstadoAct IN ('Cerrada')

		OPEN cProductosLinea

		FETCH cProductosLinea INTO @numLinea, @IdProducto

		WHILE (@@FETCH_STATUS = 0 )
		BEGIN
			--PRINT 'Linea: ' + CONVERT(nvarchar(2),@numLinea)
			--PRINT 'Cod_producto: ' + @IdProducto

			IF(@numLinea IS NOT NULL AND @IdProducto IS NOT NULL) 
			BEGIN
				SELECT @OEEMedioPreactor = [dbo].[MES_GetOEEMedioPreactor] (@numLinea, @IdProducto)
		
				IF (@OEEMedioPreactor IS NOT NULL)
				BEGIN
					--PRINT 'OEEMedio: ' + CONVERT(NVARCHAR(100),@OEEMedioPreactor)
					UPDATE dbo.COB_MSM_PARAMETROS_LINEA_PRODUCTO
					SET [OEE_PREACTOR] = @OEEMedioPreactor
					WHERE [FK_LINEAS_ID] = @numLinea
					AND [ID_PRODUCTO] = @IdProducto
				END			
			END
			--PRINT '----------'
			-- Lectura de la siguiente fila del cursor
			FETCH cProductosLinea INTO @numLinea, @IdProducto

		END

		CLOSE cProductosLinea

		DEALLOCATE cProductosLinea
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoMensualTiempoArranquePreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoMensualTiempoArranquePreactor]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		DECLARE @numLinea SMALLINT;
		DECLARE @IdProductoEntrante NVARCHAR(100);
		DECLARE @TipoArranque INT;
		DECLARE @TiempoPreactor INT;

		DECLARE cOrdenesArranque CURSOR FOR
		SELECT DISTINCT Linea, IDProductoEntrante, TipoArranque
		FROM OrdenesArranque
		WHERE OrdenesArranque.EstadoAct IN ('Cerrada')

		OPEN cOrdenesArranque

		FETCH cOrdenesArranque INTO @numLinea, @idProductoEntrante, @TipoArranque

		WHILE (@@FETCH_STATUS = 0 )
		BEGIN
			--PRINT 'Linea: ' + CONVERT(nvarchar(2),@numLinea);
			--PRINT 'Cod_producto: ' + CONVERT(nvarchar(100),@idProductoEntrante);
			--PRINT 'Tipo Arranque: ' + CONVERT(nvarchar(50),@TipoArranque);
			IF(@numLinea IS NOT NULL AND @idProductoEntrante IS NOT NULL AND @TipoArranque IS NOT NULL)
			BEGIN
				SELECT @TiempoPreactor = [dbo].[MES_GetTiempoArranqueMedioPreactor] (@numLinea, @idProductoEntrante, @TipoArranque)

  				--PRINT 'TiempoPreactor: ' + CONVERT(NVARCHAR(100), @TiempoPreactor )
				IF (@TiempoPreactor IS NOT NULL)
				BEGIN
					UPDATE [dbo].[COB_MSM_TIEMPOS_ARRANQUES]
					SET [TIEMPO_PREACTOR] = @TiempoPreactor
					WHERE FK_LINEAS_ID = @numLinea AND ID_PRODUCTO_ENTRANTE = @idProductoEntrante AND FK_ARRANQUES_ID = @TipoArranque
				END
			--PRINT '----------'
			END
			-- Lectura de la siguiente fila del cursor
			FETCH cOrdenesArranque INTO @numLinea, @idProductoEntrante, @TipoArranque

		END

		CLOSE cOrdenesArranque

		DEALLOCATE cOrdenesArranque
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_CalculoMensualTiempoCambioPreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_CalculoMensualTiempoCambioPreactor]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		-- Insert statements for procedure here
		DECLARE @numLinea SMALLINT;
		DECLARE @IdProductoEntrante NVARCHAR(100);
		DECLARE @IdProductoSaliente NVARCHAR(100);
		DECLARE @TiempoPreactor INT;

		DECLARE cOrdenesCambio CURSOR FOR
		SELECT DISTINCT Linea, IDProductoEntrante, IDProductoSaliente
		FROM OrdenesCambio
		WHERE OrdenesCambio.EstadoAct IN ('Cerrada')

		OPEN cOrdenesCambio

		FETCH cOrdenesCambio INTO @numLinea, @idProductoEntrante, @IdProductoSaliente

		WHILE (@@FETCH_STATUS = 0 )
		BEGIN
			--PRINT 'Linea: ' + CONVERT(nvarchar(2),@numLinea);
			--PRINT 'Cod_producto_E: ' + CONVERT(nvarchar(100),@idProductoEntrante);
			--PRINT 'Cod_producto_S ' + CONVERT(nvarchar(50),@IdProductoSaliente);
		
			IF(@numLinea IS NOT NULL AND @idProductoEntrante IS NOT NULL AND @IdProductoSaliente IS NOT NULL)
			BEGIN
				SELECT @TiempoPreactor = [dbo].[MES_GetTiempoCambioMedioPreactor] (@numLinea, @idProductoEntrante, @idProductoSaliente)

  				--PRINT 'TiempoPreactor: ' + CONVERT(NVARCHAR(100), @TiempoPreactor )
				IF (@TiempoPreactor IS NOT NULL)
				BEGIN
					UPDATE [dbo].[COB_MSM_TIEMPOS_CAMBIOS]
					SET [TIEMPO_PREACTOR] = @TiempoPreactor
					WHERE FK_LINEAS_ID = @numLinea AND ID_PRODUCTO_ENTRANTE = @idProductoEntrante AND ID_PRODUCTO_SALIENTE = @idProductoSaliente
				END
				--PRINT '----------'
			END
			-- Lectura de la siguiente fila del cursor
			FETCH cOrdenesCambio INTO @numLinea, @idProductoEntrante, @IdProductoSaliente

		END

		CLOSE cOrdenesCambio

		DEALLOCATE cOrdenesCambio
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_EliminarInstantaneaDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_EliminarInstantaneaDeslizante]
	-- Add the parameters for the stored procedure here	
	@id as int
	--@fecha as varchar(max),
	--@descripcion as varchar(max),
	--@tipo as varchar(max)
AS
BEGIN

	DELETE FROM MES_MSM.dbo.DeslizanteInstantaneas
	WHERE id = @id

	DELETE FROM MES_MSM.dbo.DeslizanteDatos
	WHERE idIns = @id

	SET NOCOUNT ON;

    
END

GO
/****** Object:  StoredProcedure [dbo].[MES_EtiquetasMESJDE_Asignar]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[MES_EtiquetasMESJDE_Asignar] 
	-- Add the parameters for the stored procedure here
	@FechaInicio nvarchar(19) = '1900-01-01 00:00:00', 
	@FechaFin nvarchar(19) = '2017-12-31 23:59:59',
	@Opciones nvarchar(10) = ''
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	-- OBTENGO LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO Y LOS ALMACENO EN UNA TABLA TEMPORAL
	DECLARE @OPENQUERY nvarchar(4000)
	DECLARE @TEMPTABLE table (FECHAHORA datetime,ETLITM nvarchar(50),ETAITM nvarchar(50), ETZLTE nvarchar(50), ETQSSC nvarchar(50), ETQLIN nvarchar(50), ETQPRO nvarchar(50), ETQPOK nvarchar(50), ETQINC nvarchar(50), ETQFEC nvarchar(50), ETQHOR nvarchar(50),ETQSCA nvarchar(50),ETQFCP nvarchar(50),ETDOCO nvarchar(50))
	
	-- OBTENEMOS LOS IDENTIFICADORES DE LAS ETIQUETADORAS DE PALETAS PARA FILTRAR POR DÍA Y LÍNEA
	DECLARE @LINEAS nvarchar(4000);

	SET @LINEAS = (SELECT STUFF
	(
		(
			SELECT ',' + COD_ETQ_JDE 
			from [dbo].[COB_MSM_LINEAS]
			ORDER BY COD_ETQ_JDE FOR XML PATH('')
		),
		 1, 1, ''
	) AS ETIQUETAS)

	SET @LINEAS = REPLACE (@LINEAS,',',''''',''''')

	PRINT @LINEAS

	SET @OPENQUERY = 'SELECT * FROM OPENQUERY(JDE,
	''SELECT CHAR(DATE(TIMESTAMP_FORMAT (CHAR(ETQFEC),''''YYYYMMDD''''))) || '''' '''' || ETQHOR AS FECHAHORA
			,J.ETLITM
			,J.ETAITM
			,J.ETZLTE
			,J.ETQSSC
			,J.ETQLIN
			,J.ETQPRO
			,J.ETQPOK
			,J.ETQINC
			,J.ETQFEC
			,J.ETQHOR
			,J.ETQSCA
			,J.ETQFCP
			,J.ETDOCO
  
	FROM PRODDTA.F57ETJ16 J 
	WHERE ETQFEC >= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112) + '
	AND ETQFEC <= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaFin),112) + '
	AND ETQLIN IN (''''' + @LINEAS + ''''')
	'')'

	PRINT @OPENQUERY

	INSERT INTO @TEMPTABLE EXEC(@OPENQUERY)

	-- LAS ETIQUETAS DE JDE ESTAN FECHADAS CON HORA LOCAL, SE PASAN A UTC
	UPDATE @TEMPTABLE SET FECHAHORA = [dbo].[CLR_DATETIME_ConvertLocalToUtc](FECHAHORA)

	-- SENTENCIA QUE DEVUELVE LA COMPARATIVA DE ETIQUETAS CONTABILIZADAS EN MES O EN JDE

	UPDATE T1 SET T1.ETIQUETAS = ISNULL(T2.ETIQUETAS_JDE,0),T1.ETIQUETAS_AUTO = ISNULL(T2.ETIQUETAS_JDE,0) FROM (

	-- OBTENEMOS LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO COTEMPLADO 

	SELECT CONVERT(date, C.FECHA_INICIO) AS 'FECHA', C.HORA AS 'HORA', C.ID_MAQUINA AS 'MAQUINA',O.IDPRODUCTO AS 'PRODUCTO',C.CONTADOR_PRODUCCION AS 'ETIQUETAS',C.CONTADOR_PRODUCCION_AUTO AS 'ETIQUETAS_AUTO' from [dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] C
	INNER JOIN [dbo].[MaquinasLineas] M ON C.ID_MAQUINA = M.Id
	FULL OUTER JOIN [dbo].[Ordenes] O ON C.ID_ORDEN = O.Id
	WHERE C.FECHA_INICIO >= @FechaInicio AND 
	C.FECHA_FIN <= @FechaFin AND
	M.Clase = 'ETIQUETADORA_PALETS' 

	) T1

	-- CRUZAMOS LA TABLA OBTENIDA CON LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO 

	FULL OUTER JOIN

	(

	SELECT CONVERT(date, FECHAHORA) AS 'FECHA_JDE',DATEPART(HOUR,FECHAHORA) AS 'HORA_JDE',C.Id AS 'MAQUINA_JDE',ETLITM AS 'PRODUCTO_JDE' ,count(*) AS 'ETIQUETAS_JDE' FROM @TEMPTABLE
		
	INNER JOIN [dbo].[COB_MSM_LINEAS] B ON ETQLIN = B.COD_ETQ_JDE
	INNER JOIN [dbo].[MaquinasLineas] C ON B.NUM_LINEA = C.NumLinea
	WHERE C.Clase = 'ETIQUETADORA_PALETS'
	GROUP BY CONVERT(date, FECHAHORA),DATEPART(HOUR,FECHAHORA), C.Id,ETLITM

	) T2

	ON T1.FECHA = T2.FECHA_JDE AND T1.HORA = T2.HORA_JDE AND T1.MAQUINA = T2.MAQUINA_JDE AND T1.PRODUCTO = T2.PRODUCTO_JDE

	-- SIEMPRE HACEMOS COINCIDIR FECHA,HORA Y MÁQUINA 
	WHERE T1.FECHA IS NOT NULL
	AND T1.HORA IS NOT NULL
	AND T1.MAQUINA IS NOT NULL

END

GO
/****** Object:  StoredProcedure [dbo].[MES_EtiquetasMESJDE_AsignarNoCoincidentes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Tomás Hidalgo Claver
-- Create date: 28/06/2017
-- Description:	Asignación de etiquetas de JDE a registros de consolidado horario de la paletizadora de la línea correspondiente
-- =============================================
CREATE PROCEDURE [dbo].[MES_EtiquetasMESJDE_AsignarNoCoincidentes] 
	-- Add the parameters for the stored procedure here
	@FechaInicio nvarchar(19) = '1900-01-01 00:00:00', 
	@FechaFin nvarchar(19) = '2017-12-31 23:59:59',
	@Opciones nvarchar(10) = ''
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	-- OBTENGO LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO Y LOS ALMACENO EN UNA TABLA TEMPORAL
	DECLARE @OPENQUERY nvarchar(4000)
	DECLARE @TEMPTABLE table (FECHAHORA datetime,ETLITM nvarchar(50),ETAITM nvarchar(50), ETZLTE nvarchar(50), ETQSSC nvarchar(50), ETQLIN nvarchar(50), ETQPRO nvarchar(50), ETQPOK nvarchar(50), ETQINC nvarchar(50), ETQFEC nvarchar(50), ETQHOR nvarchar(50),ETQSCA nvarchar(50),ETQFCP nvarchar(50),ETDOCO nvarchar(50))
	
	DECLARE @FechaInicioOffset nvarchar(19) = CONVERT(NVARCHAR,DATEADD(DAY,-1,@FechaInicio),120) 
	DECLARE @FechaFinOffset nvarchar(19) = CONVERT(NVARCHAR,DATEADD(DAY,1,@FechaFin),120) 

	-- OBTENEMOS LOS IDENTIFICADORES DE LAS ETIQUETADORAS DE PALETAS PARA FILTRAR POR DÍA Y LÍNEA
	DECLARE @LINEAS nvarchar(4000);

	SET @LINEAS = (SELECT STUFF
	(
		(
			SELECT ',' + COD_ETQ_JDE 
			from [dbo].[COB_MSM_LINEAS]
			ORDER BY COD_ETQ_JDE FOR XML PATH('')
		),
		 1, 1, ''
	) AS ETIQUETAS)

	SET @LINEAS = REPLACE (@LINEAS,',',''''',''''')

	PRINT @LINEAS

	SET @OPENQUERY = 'SELECT * FROM OPENQUERY(JDE,
	''SELECT CHAR(DATE(TIMESTAMP_FORMAT (CHAR(ETQFEC),''''YYYYMMDD''''))) || '''' '''' || ETQHOR AS FECHAHORA
			,J.ETLITM
			,J.ETAITM
			,J.ETZLTE
			,J.ETQSSC
			,J.ETQLIN
			,J.ETQPRO
			,J.ETQPOK
			,J.ETQINC
			,J.ETQFEC
			,J.ETQHOR
			,J.ETQSCA
			,J.ETQFCP
			,J.ETDOCO
  
	FROM PRODDTA.F57ETJ16 J 
	WHERE ETQFEC >= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112) + '
	AND ETQFEC <= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaFin),112) + '
	AND ETQLIN IN (''''' + @LINEAS + ''''')
	'')'

	PRINT @OPENQUERY

	INSERT INTO @TEMPTABLE EXEC(@OPENQUERY)

	-- LAS ETIQUETAS DE JDE ESTAN FECHADAS CON HORA LOCAL, SE PASAN A UTC
	UPDATE @TEMPTABLE SET FECHAHORA = [dbo].[CLR_DATETIME_ConvertLocalToUtc](FECHAHORA)

	-- METO EN UN CURSOR LAS ETIQUETAS NO COINCIDENTES

	DECLARE @FechaHora as DATETIME;
	DECLARE @Maquina as NVARCHAR(255);
	DECLARE @Producto as NVARCHAR(255);
	DECLARE @Etiquetas as int;

	DECLARE @Cursor as CURSOR;

	SET @Cursor = CURSOR FOR

	SELECT DATEADD(HOUR,T2.HORA_JDE,CAST(T2.FECHA_JDE AS DATETIME)) AS 'FECHAHORA_JDE',T2.MAQUINA_JDE,T2.PRODUCTO_JDE,T2.ETIQUETAS_JDE FROM (

	-- OBTENEMOS LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO COTEMPLADO INCLUYENDO EL OFFSET

	SELECT CONVERT(date, C.FECHA_INICIO) AS 'FECHA', C.HORA AS 'HORA', C.ID_MAQUINA AS 'MAQUINA',O.IDPRODUCTO AS 'PRODUCTO',C.CONTADOR_PRODUCCION AS 'ETIQUETAS',C.CONTADOR_PRODUCCION_AUTO AS 'ETIQUETAS_AUTO' from [dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] C
	INNER JOIN [dbo].[MaquinasLineas] M ON C.ID_MAQUINA = M.Id
	FULL OUTER JOIN [dbo].[Ordenes] O ON C.ID_ORDEN = O.Id
	WHERE C.FECHA_INICIO >= @FechaInicioOffset AND 
	C.FECHA_FIN <= @FechaFinOffset AND
	M.Clase = 'ETIQUETADORA_PALETS' 

	) T1

	-- CRUZAMOS LA TABLA OBTENIDA CON LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO 

	FULL OUTER JOIN

	(

	SELECT CONVERT(date, FECHAHORA) AS 'FECHA_JDE',DATEPART(HOUR,FECHAHORA) AS 'HORA_JDE',C.Id AS 'MAQUINA_JDE',ETLITM AS 'PRODUCTO_JDE' ,count(*) AS 'ETIQUETAS_JDE' FROM @TEMPTABLE
		
	INNER JOIN [dbo].[COB_MSM_LINEAS] B ON ETQLIN = B.COD_ETQ_JDE
	INNER JOIN [dbo].[MaquinasLineas] C ON B.NUM_LINEA = C.NumLinea
	WHERE C.Clase = 'ETIQUETADORA_PALETS'
	GROUP BY CONVERT(date, FECHAHORA),DATEPART(HOUR,FECHAHORA), C.Id,ETLITM

	) T2

	ON T1.FECHA = T2.FECHA_JDE AND T1.HORA = T2.HORA_JDE AND T1.MAQUINA = T2.MAQUINA_JDE AND T1.PRODUCTO = T2.PRODUCTO_JDE

	-- SACAMOS LAS QUE NO HAN COINCIDIDO EN FECHA Y HORA PERO HAY ETIQUETAS DE JDE
	WHERE  (T1.FECHA IS NULL OR T1.HORA IS NULL)
	AND T2.ETIQUETAS_JDE > 0

	-- RECORREMOS EL CURSOR ASIGNANDO LAS ETIQUETAS NO COINCIDENTES

	OPEN @Cursor;

	FETCH NEXT FROM @Cursor INTO @Fechahora, @Maquina, @Producto , @Etiquetas;
 
	WHILE @@FETCH_STATUS = 0
	BEGIN
		
		--PRINT cast(@Fechahora as VARCHAR (255)) + ' ' + @Maquina + ' ' + @Producto + ' ' + cast(@Etiquetas as VARCHAR (255));

		--SUMO LAS ETIQUETAS NO COINCIDENTES AL CONSOLIDADO MAS CERCANO DEL PERIODO CONTEMPLADO PARA ESA MAQUINA Y PARA ESE PRODUCTO
		
			DECLARE @IdArchObj as int;
			DECLARE @IDArchiveValue as int;
			DECLARE @FechaEncontrada as DATETIME;

			-- BUSCO EL CONSOLIDADO HORARIO MAS CERCANO PARA LAS ETIQUETAS NO COINCIDENTES AMPLIANDO EL OFFSET UN DIA POR AMBOS LADOS

			SELECT TOP(1) @IdArchObj = [$IdArchObj], @IDArchiveValue = [$IDArchiveValue], @FechaEncontrada = C.FECHA_INICIO from [MES_MSM].[dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] C
			INNER JOIN [MES_MSM].[dbo].[MaquinasLineas] M ON C.ID_MAQUINA = M.Id
			FULL OUTER JOIN [MES_MSM].[dbo].[Ordenes] O ON C.ID_ORDEN = O.Id
			WHERE
			C.FECHA_INICIO >= DATEADD(DAY,-1,@FechaInicioOffset)
			AND C.FECHA_FIN <= DATEADD(DAY,1,@FechaFinOffset)
			AND C.ID_MAQUINA = @Maquina
			AND O.IDPRODUCTO = @Producto
			ORDER BY ABS(DATEDIFF(hh,@Fechahora,C.FECHA_INICIO))
		
			-- SOLO ACTUALIZO SI LA FECHA ENCONTRADA ESTA DENTRO DE LA VENTANA CONTEMPLADA

			PRINT 'Etiquetas no coincidentes: ' + CONVERT(NVARCHAR,@Fechahora,120) + ' ' + CONVERT(NVARCHAR,@Maquina) + ' ' + CONVERT(NVARCHAR,@Producto) + ': ' + CONVERT(NVARCHAR,@Etiquetas)

			IF ISDATE(@FechaEncontrada) = 1
				IF @FechaEncontrada >= @FechaInicio AND @FechaEncontrada <= @FechaFin
		
					BEGIN
				
					UPDATE [MES_MSM].[dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] SET CONTADOR_PRODUCCION = (ISNULL(CONTADOR_PRODUCCION,0) + @Etiquetas),CONTADOR_PRODUCCION_AUTO = (ISNULL(CONTADOR_PRODUCCION_AUTO,0) + @Etiquetas)
					WHERE
					[$IdArchObj] = @IdArchObj AND
					[$IDArchiveValue] = @IDArchiveValue

					PRINT 'Añadidas al consolidado: ' + CAST(@FechaEncontrada as VARCHAR (255)) + ' ' + CAST(@IdArchObj as VARCHAR (255)) + ' ' + CAST(@IDArchiveValue as VARCHAR (255))
		
					END
		
				ELSE

					PRINT 'No añadidas a consolidado'
			ELSE
				PRINT 'No añadidas a consolidado'

		FETCH NEXT FROM @Cursor INTO @Fechahora, @Maquina, @Producto , @Etiquetas;

	END
 
	CLOSE @Cursor;
	DEALLOCATE @Cursor;

END

GO
/****** Object:  StoredProcedure [dbo].[MES_EtiquetasMESJDE_Comparar]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Tomás Hidalgo Claver
-- Create date: 28/06/2017
-- Description:	Asignación de etiquetas de JDE a registros de consolidado horario de la paletizadora de la línea correspondiente
-- =============================================
CREATE PROCEDURE [dbo].[MES_EtiquetasMESJDE_Comparar] 
	-- Add the parameters for the stored procedure here
	@FechaInicio nvarchar(19) = '1900-01-01 00:00:00', 
	@FechaFin nvarchar(19) = '2017-12-31 23:59:59',
	@Opciones nvarchar(10) = ''
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	-- OBTENGO LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO Y LOS ALMACENO EN UNA TABLA TEMPORAL
	DECLARE @OPENQUERY nvarchar(4000)
	DECLARE @TEMPTABLE table (FECHAHORA datetime,ETLITM nvarchar(50),ETAITM nvarchar(50), ETZLTE nvarchar(50), ETQSSC nvarchar(50), ETQLIN nvarchar(50), ETQPRO nvarchar(50), ETQPOK nvarchar(50), ETQINC nvarchar(50), ETQFEC nvarchar(50), ETQHOR nvarchar(50),ETQSCA nvarchar(50),ETQFCP nvarchar(50),ETDOCO nvarchar(50))
	
	-- OBTENEMOS LOS IDENTIFICADORES DE LAS ETIQUETADORAS DE PALETAS PARA FILTRAR POR DÍA Y LÍNEA
	DECLARE @LINEAS nvarchar(4000);

	SET @LINEAS = (SELECT STUFF
	(
		(
			SELECT ',' + COD_ETQ_JDE 
			from [dbo].[COB_MSM_LINEAS]
			ORDER BY COD_ETQ_JDE FOR XML PATH('')
		),
		 1, 1, ''
	) AS ETIQUETAS)

	SET @LINEAS = REPLACE (@LINEAS,',',''''',''''')

	PRINT @LINEAS

	SET @OPENQUERY = 'SELECT * FROM OPENQUERY(JDE,
	''SELECT CHAR(DATE(TIMESTAMP_FORMAT (CHAR(ETQFEC),''''YYYYMMDD''''))) || '''' '''' || ETQHOR AS FECHAHORA
			,J.ETLITM
			,J.ETAITM
			,J.ETZLTE
			,J.ETQSSC
			,J.ETQLIN
			,J.ETQPRO
			,J.ETQPOK
			,J.ETQINC
			,J.ETQFEC
			,J.ETQHOR
			,J.ETQSCA
			,J.ETQFCP
			,J.ETDOCO
  
	FROM PRODDTA.F57ETJ16 J 
	WHERE ETQFEC >= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112) + '
	AND ETQFEC <= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaFin),112) + '
	AND ETQLIN IN (''''' + @LINEAS + ''''')
	'')'

	PRINT @OPENQUERY

	INSERT INTO @TEMPTABLE EXEC(@OPENQUERY)

	UPDATE @TEMPTABLE SET FECHAHORA = [dbo].[CLR_DATETIME_ConvertLocalToUtc](FECHAHORA)

	-- SENTENCIA QUE DEVUELVE LA COMPARATIVA DE ETIQUETAS CONTABILIZADAS EN MES O EN JDE

	SELECT T1.FECHA,T2.FECHA_JDE,T1.HORA,T2.HORA_JDE,T1.MAQUINA,T2.MAQUINA_JDE,T1.PRODUCTO,T2.PRODUCTO_JDE,T1.ETIQUETAS,T1.ETIQUETAS_AUTO,T2.ETIQUETAS_JDE FROM (

	-- OBTENEMOS LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO COTEMPLADO 

	SELECT CONVERT(date, C.FECHA_INICIO) AS 'FECHA', C.HORA AS 'HORA', C.ID_MAQUINA AS 'MAQUINA',O.IDPRODUCTO AS 'PRODUCTO',C.CONTADOR_PRODUCCION AS 'ETIQUETAS',C.CONTADOR_PRODUCCION_AUTO AS 'ETIQUETAS_AUTO' from [dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] C
	INNER JOIN [dbo].[MaquinasLineas] M ON C.ID_MAQUINA = M.Id
	FULL OUTER JOIN [dbo].[Ordenes] O ON C.ID_ORDEN = O.Id
	WHERE C.FECHA_INICIO >= @FechaInicio AND 
	C.FECHA_FIN <= @FechaFin AND
	M.Clase = 'ETIQUETADORA_PALETS' 

	) T1

	-- CRUZAMOS LA TABLA OBTENIDA CON LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO 

	FULL OUTER JOIN

	(

	SELECT CONVERT(date, FECHAHORA) AS 'FECHA_JDE',DATEPART(HOUR,FECHAHORA) AS 'HORA_JDE',C.Id AS 'MAQUINA_JDE',ETLITM AS 'PRODUCTO_JDE' ,count(*) AS 'ETIQUETAS_JDE' FROM @TEMPTABLE		
	INNER JOIN [dbo].[COB_MSM_LINEAS] B ON ETQLIN = B.COD_ETQ_JDE
	INNER JOIN [dbo].[MaquinasLineas] C ON B.NUM_LINEA = C.NumLinea
	WHERE C.Clase = 'ETIQUETADORA_PALETS'
	GROUP BY CONVERT(date, FECHAHORA),DATEPART(HOUR,FECHAHORA), C.Id,ETLITM

	) T2

	ON T1.FECHA = T2.FECHA_JDE AND T1.HORA = T2.HORA_JDE AND T1.MAQUINA = T2.MAQUINA_JDE AND T1.PRODUCTO = T2.PRODUCTO_JDE

-- SIEMPRE HACEMOS COINCIDIR FECHA,HORA Y MÁQUINA 
-- and T1.FECHA IS NOT NULL
-- AND T1.HORA IS NOT NULL
-- AND T1.MAQUINA IS NOT NULL

	ORDER BY FECHA ASC,HORA ASC

END

GO
/****** Object:  StoredProcedure [dbo].[MES_EtiquetasMESJDE_Importar]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Tomás Hidalgo Claver
-- Create date: 28/06/2017
-- Description:	Importamos las etiquetas de JDE para insertarlas en la tabla de producciones
-- =============================================
CREATE PROCEDURE [dbo].[MES_EtiquetasMESJDE_Importar] 
	-- Add the parameters for the stored procedure here
	@FechaInicio nvarchar(19) = '1900-01-01 00:00:00', -- fecha de inicio del periodo contemplado
	@FechaFin nvarchar(19) = '9999-12-31 23:59:59', -- fecha de fin del periodo contemplado
	@Opciones nvarchar(10) = ''
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	-- OBTENGO LOS REGISTROS HORARIOS DE LAS ETIQUETADORAS DE PALETS DE CADA LÍNEA EN EL PERIODO CONTEMPLADO Y LOS ALMACENO EN UNA TABLA TEMPORAL
	DECLARE @OPENQUERY nvarchar(4000)
	DECLARE @tEtiquetasJDE table (FECHAHORA datetime,ETLITM nvarchar(50),ETAITM nvarchar(50), ETZLTE nvarchar(50), ETQSSC nvarchar(50) NOT NULL PRIMARY KEY, ETQLIN nvarchar(50), ETQPRO nvarchar(50), ETQPOK nvarchar(50), ETQINC nvarchar(50), ETQFEC nvarchar(50), ETQHOR nvarchar(50),ETQSCA nvarchar(50),ETQFCP nvarchar(50),ETDOCO nvarchar(50))

	-- OBTENEMOS LOS IDENTIFICADORES DE LAS ETIQUETADORAS DE PALETAS PARA FILTRAR POR DÍA Y LÍNEA
	DECLARE @LINEAS nvarchar(4000);

	SET @LINEAS = (SELECT STUFF
	(
		(
			SELECT ',' + COD_ETQ_JDE 
			from [dbo].[COB_MSM_LINEAS]
			ORDER BY COD_ETQ_JDE FOR XML PATH('')
		),
		 1, 1, ''
	) AS ETIQUETAS)

	SET @LINEAS = REPLACE (@LINEAS,',',''''',''''')

	PRINT @LINEAS

	SET @OPENQUERY = 'SELECT * FROM OPENQUERY(JDE,
	''SELECT CHAR(DATE(TIMESTAMP_FORMAT (CHAR(ETQFEC),''''YYYYMMDD''''))) || '''' '''' || ETQHOR AS FECHAHORA
			,J.ETLITM
			,J.ETAITM
			,J.ETZLTE
			,J.ETQSSC
			,J.ETQLIN
			,J.ETQPRO
			,J.ETQPOK
			,J.ETQINC
			,J.ETQFEC
			,J.ETQHOR
			,J.ETQSCA
			,J.ETQFCP
			,J.ETDOCO
  
	FROM PRODDTA.F57ETJ16 J 
	WHERE ETQFEC >= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112) + '
	AND ETQFEC <= ' + CONVERT(NVARCHAR,DATEADD(day,0,@FechaFin),112) + '
	AND ETQLIN IN (''''' + @LINEAS + ''''')
	'')'

	PRINT @OPENQUERY

	INSERT INTO @tEtiquetasJDE EXEC(@OPENQUERY)

	--INSERT INTO @tEtiquetasJDE SELECT * FROM [MES_MSM].[dbo].[PRODDTA.F57ETJ16]
	--DELETE @tEtiquetasJDE WHERE FECHAHORA < @FechaInicio OR FECHAHORA > @FechaFin

	-- LAS ETIQUETAS DE JDE ESTAN FECHADAS CON HORA LOCAL, SE PASAN A UTC
	UPDATE @tEtiquetasJDE SET FECHAHORA = [dbo].[CLR_DATETIME_ConvertLocalToUtc](FECHAHORA)

	-- Obtenemos la planta de trabajo
	DECLARE @Planta AS NVARCHAR(3);

	SET @Planta = (SELECT SUBSTRING(EQUIP_NAME,1,3) FROM [SITMesDB].[dbo].[BPM_EQUIPMENT] E
	INNER JOIN [SITMesDB].[dbo].[BPM_EQUIPMENT_CLASS] C
	ON E.[equip_class_lvl_pk] = C.[equip_class_lvl_pk]
	WHERE EQUIP_CLASS_NAME = 'SITE');

	-- 1. PROCESAMOS LAS ALTAS

	-- 1.1 Insertamos las etiquetas que están en JDE y no están en MES 

	DECLARE @tEtiquetasInsertadas table(idProduccion bigint,Linea nvarchar(100),Referencia nvarchar(100),ParticionWO nvarchar(101));

	INSERT INTO [MES_MSM_Trazabilidad].[TRA].[tProduccion](idEtiqueta,Linea,Referencia,EtiquetaCreatedAt,ParticionWO,SSCC,idLotMes,IdStatus,CreatedAt,CreatedBy,Consolidado,LastModifiedMesAt,LastModifiedMes, Procesado)
	OUTPUT INSERTED.idProduccion,INSERTED.Linea,INSERTED.Referencia,INSERTED.ParticionWO INTO @tEtiquetasInsertadas
	SELECT NULL,LINEAS.ID_LINEA,ETLITM,FECHAHORA,NULL,ETQSSC,
	@Planta + '-03-CER-' + ETLITM + '-ENV-' + REPLACE(REPLACE(REPLACE(CAST(CONVERT(VARCHAR(19),FECHAHORA, 120) AS VARCHAR(20)),'-',''),':',''),' ','') --idLotMes
	,1, GETUTCDATE(),'MES-TEST',0,GETUTCDATE(),'Creado', 0
    from [MES_MSM_Trazabilidad].[TRA].[tProduccion] ETQMES
	RIGHT JOIN @tEtiquetasJDE ETQJDE ON ETQMES.SSCC = ETQJDE.ETQSSC
	INNER JOIN [MES_MSM].[dbo].[COB_MSM_LINEAS] LINEAS ON ETQJDE.ETQLIN = LINEAS.COD_ETQ_JDE
	WHERE ETQMES.SSCC IS NULL

	-- 1.2 Actualizamos la partición de las etiquetas contempladas en el rango de fechas (se eliminará este punto cuando se lea la partición del origen de datos)

	UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccion] SET PARTICIONWO = [dbo].[MES_EtiquetasMESJDE_ObtenerParticionLinea] (ETIQUETACREATEDAT,REFERENCIA,LINEA)
	WHERE ETIQUETACREATEDAT >= @FechaInicio AND ETIQUETACREATEDAT <= @FechaFin
	AND (PARTICIONWO IS NULL)


	-- 1.3 Actualizamos la velocidad nomimal.

	UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccion] 		
	SET VelocidadNominalProducto = VelocidadNominal
	FROM [MES_MSM_Trazabilidad].[TRA].[tProduccion] prod, 
			[MES_MSM].[dbo].[Ordenes] ord
	WHERE ETIQUETACREATEDAT >= @FechaInicio AND ETIQUETACREATEDAT <= @FechaFin
	and  ParticionWo  like id + '%'
	and ParticionWo is not null
	and VelocidadNominalProducto IS NULL 



	-- 1.4 Insertamos los offsets desde las ubicaciones de consumo

	INSERT INTO [MES_MSM_Trazabilidad].[TRA].[tProduccionOffsets] (idProduccion,idUbicacion,VelocidadNominalReferencia,Offset,RendimientoWO,CreadoPor,Creado)
	SELECT idProduccion, u.IdUbicacion, isnull(u.VelocidadNominalReferencia,0), isnull(Offset,0),0,'MES-TEST',GETUTCDATE() from @tEtiquetasInsertadas ETQINS
	INNER JOIN [MES_MSM].[dbo].[COB_MSM_LINEAS] LINEAS ON ETQINS.Linea = LINEAS.ID_LINEA
	INNER JOIN [MES_MSM_Trazabilidad].[UBI].[tUbicacion] u ON u.IdUbicacionLinkMes LIKE '%' + LINEAS.LINEA + '%' 
	INNER JOIN [MES_MSM_Trazabilidad].[UBI].tTipoUbicacion t ON u.IdTipoUbicacion = t.IdTipoUbicacion and t.Enum_Descripcion = 'Consumo'
	
	-- 1.5 Actualizamos el rendimiento de la partición para las ubicaciones de consumo de las etiquetas contempladas en el rango de fechas (se eliminará este punto cuando se lea la partición del origen de datos)
		
	--Obtenemos el rendimiento de las órdenes de trabajo del periodo 
	SELECT ParticionWO,[MES_MSM].[DBO].[MES_GetRendimientoParticion](T.ParticionWO) AS Rendimiento INTO #OEEWO FROM (
	SELECT DISTINCT ParticionWO
	FROM [MES_MSM_Trazabilidad].[TRA].[tProduccion]
	WHERE ETIQUETACREATEDAT >= @FechaInicio AND ETIQUETACREATEDAT <= @FechaFin
	) T

	--Actualizamos cruzando con el rendimiento obtenido en el paso anterior
	UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccionOffsets]
	SET RendimientoWO = ISNULL(Rendimiento,0),
	ActualiazdoPor = 'MES-TEST',
	Actualiazdo = GETUTCDATE()
	FROM [MES_MSM_Trazabilidad].[TRA].[tProduccionOffsets] PO
	INNER JOIN [MES_MSM_Trazabilidad].[TRA].[tProduccion] P ON PO.IdProduccion = P.Idproduccion
	INNER JOIN #OEEWO
	ON P.ParticionWO = #OEEWO.ParticionWO
	WHERE P.ETIQUETACREATEDAT >= @FechaInicio AND P.ETIQUETACREATEDAT <= @FechaFin
	AND PO.RendimientoWO = 0

	-- 2. PROCESAMOS LAS BAJAS

	-- 2.1 Establecemos como erróneas las etiquetas que desaparecen de JDE

	UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccion] SET IdStatus = 0 WHERE 
	ETIQUETACREATEDAT >= @FechaInicio AND ETIQUETACREATEDAT <= @FechaFin AND
	SSCC IN 
	(SELECT ETQMES.SSCC from [MES_MSM_Trazabilidad].[TRA].[tProduccion] ETQMES
	FULL OUTER JOIN @tEtiquetasJDE ETQJDE ON ETQMES.SSCC = ETQJDE.ETQSSC
	WHERE
	ETIQUETACREATEDAT >= @FechaInicio AND ETIQUETACREATEDAT <= @FechaFin AND
	ETQJDE.ETQSSC IS NULL)

END












GO
/****** Object:  StoredProcedure [dbo].[MES_GetIntervaloFechasyTurnosCalculoICTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_GetIntervaloFechasyTurnosCalculoICTurno]
	@fecha AS DATETIME,
	@NumLinea as SMALLINT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR_GAPINF DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME;
	DECLARE @TIEMPO_VACIADO_TREN INT;

	--Obtención fechas gap inferior
	SELECT @FECHA_INICIO_LIMITE_INFERIOR_GAPINF = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF = FECHA_INICIO_LIMITE_SUPERIOR, @TIEMPO_VACIADO_TREN = TIEMPO_VACIADO_TREN FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fecha,@NumLinea,0)
	
	IF(@FECHA_INICIO_LIMITE_INFERIOR_GAPINF IS NOT NULL AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF IS NOT NULL)
	BEGIN
		--Comprobamos si el gap es por falta de registros
		DECLARE @FALTA_REG BIT;
		SELECT @FALTA_REG = [dbo].[MES_ComprobarGapPorFaltaDeRegistros] (@FECHA_INICIO_LIMITE_INFERIOR_GAPINF,@FECHA_INICIO_LIMITE_SUPERIOR_GAPINF,@NumLinea, @TIEMPO_VACIADO_TREN,0);
		IF(@FALTA_REG = 0)
		BEGIN
			--Si estamos dentro de un gap, cambiamos la fecha para buscar hacia arriba desde el limite superior del gap inferior
			IF(@fecha BETWEEN @FECHA_INICIO_LIMITE_INFERIOR_GAPINF AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF)
			BEGIN
				SET @fecha = @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF;
			END
			SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_INICIO_LIMITE_SUPERIOR_GAPINF;
		
			--Obtención fechas gap superior
			SELECT @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP = FECHA_INICIO_LIMITE_SUPERIOR, @TIEMPO_VACIADO_TREN = TIEMPO_VACIADO_TREN FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fecha,@NumLinea,1)
			
			IF(@FECHA_INICIO_LIMITE_INFERIOR_GAPSUP IS NOT NULL AND @FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP IS NOT NULL AND @FECHA_INICIO_LIMITE_INFERIOR <> @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP)
			BEGIN
				--Comprobamos si el gap es por falta de registros
				SELECT @FALTA_REG = [dbo].[MES_ComprobarGapPorFaltaDeRegistros] (@FECHA_INICIO_LIMITE_INFERIOR_GAPSUP,@FECHA_INICIO_LIMITE_SUPERIOR_GAPSUP,@NumLinea, @TIEMPO_VACIADO_TREN,1) 
				IF(@FALTA_REG = 0)
				BEGIN
					SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO_LIMITE_INFERIOR_GAPSUP;

					DECLARE @linea as NVARCHAR(200);
					SELECT @linea = Id
					FROM Lineas WHERE NumeroLinea = @NumLinea

					--Obtenemos los turnos afectados
					DECLARE @tmpTurnosToUpdate TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL)

					INSERT INTO @tmpTurnosToUpdate
					SELECT * FROM [dbo].[MES_GetTurnosToUpdateIC] (@FECHA_INICIO_LIMITE_INFERIOR,@FECHA_INICIO_LIMITE_SUPERIOR,@NumLinea)
				

					SELECT ID_TURNO,FECHA_TURNO,UPPER(t.Nombre) as TipoTurno
					from @tmpTurnosToUpdate
					INNER JOIN TiposTurno t on t.Id = IDTIPOTURNO
					ORDER BY FECHA_TURNO,IDTIPOTURNO	

					SELECT @FECHA_INICIO_LIMITE_INFERIOR AS FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR AS FECHA_INICIO_LIMITE_SUPERIOR
				END
			END
		END
	END
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_GetNecesidadTCP]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		
-- Create date: 
-- Description:	Obtiene necesidades de TCPs FIL
-- =============================================
CREATE PROCEDURE [dbo].[MES_GetNecesidadTCP]
	
AS
BEGIN
	SET NOCOUNT ON;

	select LineaEnvasado, SUM(TotalNecesidadTCP)
	from dbo.COB_MSM_ArticlesParametersForPackingLineFIL
	group by LineaEnvasado 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_GetNoConformidades]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[MES_GetNoConformidades] 
 
AS
BEGIN
	
	SELECT 
		NC.[$IDArchiveValue] as IdNoConformidad
		,NC.SSCC AS CodigoSSCC
		,NC.FECHA_NO_CONFORMIDAD as Fecha
		,NC.MOTIVO as Motivo, 
		1 as Palets
		,NC.CANTIDAD_ENVASES as Envases
		,NC.ID_ORDEN
		,isnull(((NC.CANTIDAD_ENVASES / NULLIF(CONVERT(FLOAT,O.EnvasesPorPalet),0)) * O.CajasPorPalet),0) AS Cajas
		,NC.SHC_WORK_SCHED_DAY_PK as IdTurno
		,O.CajasPorPalet
		,O.EnvasesPorPalet
		,O.IdProducto
		,P.Descripcion AS Nombre
		,P.UdMedida
		,O.Linea
		,NC.ID_PARTICION
	FROM [dbo].[COB_MSM_NO_CONFORMIDAD] AS NC
	INNER JOIN Ordenes AS O ON O.Id =  NC.ID_ORDEN
	INNER JOIN Productos AS P ON P.IdProducto = O.IdProducto
	ORDER BY FECHA_NO_CONFORMIDAD
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_GetOEEPreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_GetOEEPreactor]
	-- Add the parameters for the stored procedure here
	@numLinea INT, 
	@IdProducto NVARCHAR(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT OEE_PREACTOR from MES_MSM.dbo.COB_MSM_PARAMETROS_LINEA_PRODUCTO
		WHERE FK_LINEAS_ID = @numLinea AND ID_PRODUCTO = @IdProducto
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_GetTurnoRecalculoICT]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[MES_GetTurnoRecalculoICT] 
 @fecha DATETIME,
 @TIEMPO INT
AS
BEGIN
	
	SELECT TOP(1) SHC_WORK_SCHED_DAY_PK, FECHA, FECHA_INICIO,FECHA_FIN, IDTIPOTURNO, UPPER(TT.Nombre) AS TIPOTURNO, LINEA, L.NumeroLinea
	FROM [dbo].[COB_MSM_CONSOLIDADO_TURNO]
	INNER JOIN Lineas L ON L.Id = LINEA
	INNER JOIN TiposTurno TT ON CONVERT(INT,TT.Id) = IDTIPOTURNO
	WHERE FECHA_MODIF_RECALCULO_IC IS NOT NULL AND (DATEDIFF(MINUTE,FECHA_MODIF_RECALCULO_IC, @fecha) >= @TIEMPO)
	ORDER BY FECHA_MODIF_RECALCULO_IC 
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_JobDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ================================================
-- Author:		
-- Create date: 
-- Description:	Gestor de Jobs pantalla deslizante
-- ================================================
CREATE PROCEDURE [dbo].[MES_JobDeslizante]
	-- Add the parameters for the stored procedure here	
	--@semanas as int,
	--@fechaInicio as nvarchar(max),
	--@numdia as nvarchar(max),
	--@hora as nvarchar(max)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	--Parámetros estáticos no configurables
	declare @ReturnCode INT
	select @ReturnCode = 0
	declare @jobname nvarchar(max) = 'Deslizante';
	declare @step nvarchar(max) = 'Manugistics';
	declare @schedule nvarchar(max) = 'Semanal';	
	declare @semanas int = (select semanas from mes_msm.dbo.COB_MSM_DeslizanteGeneral);
	declare @numdia int = (select idDia from mes_msm.dbo.COB_MSM_DeslizanteGeneral);	
	declare @hora nvarchar(max) = (select horastr from mes_msm.dbo.COB_MSM_DeslizanteGeneral);
	declare @diastr nvarchar(max) = (select dia from mes_msm.dbo.DiasSemanaDeslizante where id = @numdia);	
	declare @jobident nvarchar(max) = (select job_id from msdb.dbo.sysjobs where name = @jobname);
	declare @fechaInicio nvarchar(max) = (select CONVERT(nvarchar(max), GETDATE(), 112));	
	
	--Eliminamos el job anterior
	IF (@jobident IS NOT NULL)
	BEGIN
		EXEC msdb.dbo.sp_delete_job @job_id = @jobident;
	END

	--Creamos el job con los nuevos parámetros
	
	BEGIN TRANSACTION	
	IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
	BEGIN
	EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

	END

	DECLARE @jobId BINARY(16)
	EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=@jobname, 
			@enabled=1, 
			@notify_level_eventlog=2, 
			@notify_level_email=0, 
			@notify_level_netsend=0, 
			@notify_level_page=0, 
			@delete_level=0, 
			@description=N'No description available.', 
			@category_name=N'[Uncategorized (Local)]', 
			@owner_login_name=N'sa', @job_id = @jobId OUTPUT
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
	/****** Object:  Step [Manugistics]    Script Date: 26/04/2018 11:20:55 ******/
	EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=@step, 
			@step_id=1, 
			@cmdexec_success_code=0, 
			@on_success_action=1, 
			@on_success_step_id=0, 
			@on_fail_action=2, 
			@on_fail_step_id=0, 
			@retry_attempts=0, 
			@retry_interval=0, 
			@os_run_priority=0, @subsystem=N'TSQL', 
			@command=N'exec mes_msm.dbo.PRE_ManugisticsDeslizante ''AUTO''', 
			@database_name=N'master', 
			@flags=0
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
	EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
	EXEC @ReturnCode = msdb.dbo.sp_add_jobschedule @job_id=@jobId, @name=@schedule,
			@enabled=1, 
			@freq_type=8, --Semanal -> No configurable			
			@freq_interval=@numdia, --Dia -> Parámetro configurable. Dia especificado
			@freq_subday_type=1, --Hora -> Parámetro configurable. Hora completa especificada
			@freq_subday_interval=0, 
			@freq_relative_interval=0, 
			@freq_recurrence_factor=1, 
			@active_start_date=@fechaInicio, --Fecha de inicio -> Parámetro configurable. Fecha actual
			@active_end_date=99991231, --Fecha de fin -> Sin fecha final
			@active_start_time=@hora, --Hora -> Parámetro configurable. Hora especificada
			@active_end_time=235959 --Tiempo de fin -> Sin Tiempo
			--@schedule_uid=N'f95af0d8-4611-438e-9078-759be03ea780'
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
	EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
	IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
	COMMIT TRANSACTION
	GOTO EndSave
	QuitWithRollback:
		select @ReturnCode = -1
		IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
	EndSave:

	select @ReturnCode As ReturnCode

END

GO
/****** Object:  StoredProcedure [dbo].[MES_Obtener_TiposPlantillaTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_Obtener_TiposPlantillaTurno] 
	-- Add the parameters for the stored procedure here

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
    -- Insert statements for procedure here

		SELECT [PK]
			  ,[Id]
			  ,[Nombre]
		  FROM [dbo].[TiposPlantillaTurno]
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerAccionesMejora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerAccionesMejora]
	@tipo as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT A.[ID_ACCION_MEJORA]		  
			  ,A.[DESCRIPCION_PROBLEMA]
			  ,A.[CAUSA]
			  ,A.[ACCION_PROPUESTA]
			  ,A.[OBSERVACIONES]
			  ,A.[USUARIO]
			  ,convert(date,A.FECHA_ALTA) as FECHA_ALTA
			  ,convert(date,A.FECHA_FINALIZADA) as FECHA_FINALIZADA
			  ,A.[TIPO]
			  ,A.ID_LINEA
			  ,L.NumeroLinea
			  ,L.Descripcion as NombreLinea
			  ,A.ID_MAQUINA
			  ,M.Descripcion as NombreMaquina
			  ,A.ID_EQUIPO_CONSTRUCTIVO
			  ,E.NOMBRE as NombreEquipoConstructivo

		  FROM [dbo].[ACCION_MEJORA] A
		  left join [dbo].[Lineas]  L on A.ID_LINEA = L.Id collate Latin1_General_CI_AS
		  left join [dbo].[Maquinas]  M on A.ID_MAQUINA = m.Nombre collate Latin1_General_CI_AS
		  left join [dbo].EQUIPO_CONSTRUCTIVO E on A.ID_EQUIPO_CONSTRUCTIVO = E.IdObj

		  where A.[TIPO]=@tipo
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerAccionMejora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerAccionMejora]
	-- Add the parameters for the stored procedure here
	@idMejora as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT
		  A.[ID_ACCION_MEJORA]		  
		  ,A.[DESCRIPCION_PROBLEMA]
		  ,A.[CAUSA]
		  ,A.[ACCION_PROPUESTA]
		  ,A.[OBSERVACIONES]
		  ,A.[USUARIO]
		  ,A.[FECHA_ALTA]
		  ,A.[FECHA_FINALIZADA]
		  ,A.[TIPO]
		  ,A.ID_LINEA
		  ,L.NumeroLinea
		  ,L.Descripcion as NombreLinea
		  ,A.ID_MAQUINA
		  ,M.Clase as NombreMaquina
		  ,A.ID_EQUIPO_CONSTRUCTIVO
		  ,E.NOMBRE as NombreEquipoConstructivo
	  FROM [dbo].[ACCION_MEJORA] A
	  left join [dbo].[Lineas]  L on A.ID_LINEA = L.Id collate Latin1_General_CI_AS
	  left join [dbo].[Maquinas]  M on A.ID_MAQUINA = m.Nombre collate Latin1_General_CI_AS
	  left join [dbo].EQUIPO_CONSTRUCTIVO E on A.ID_EQUIPO_CONSTRUCTIVO = E.IdObj
	  where A.ID_ACCION_MEJORA = @idMejora

	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerAccionMejoraArranques]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerAccionMejoraArranques]
	-- Add the parameters for the stored procedure here
	@idMejora as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		SELECT [Id]
			  ,[Linea]
			  ,[DescripcionLinea]
			  ,[InicioReal]
			  ,[TipoTurnoId]
			  ,[TipoTurno]
			  ,[FechaTurno]
			  ,[IDProductoEntrante]
			  ,[ProductoEntrante]
			  ,[MinutosFinal1]
			  ,[MinutosFinal2]
			  ,[MinutosObjetivo1]
			  ,[MinutosObjetivo2]
			  ,[TipoArranque]
		  FROM [dbo].[OrdenesArranque]
			WHERE [Id] in (SELECT [ID_ARRANQUE]  collate Latin1_General_CI_AS
							FROM [ACCION_MEJORA_ARRANQUES] where FK_ACCION_MEJORA_ID = @idMejora)	
			ORDER BY [Linea],[TipoArranque],[InicioReal],[TipoTurno] DESC
	COMMIT TRANSACTION; 									

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerAccionMejoraCambios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerAccionMejoraCambios]
	-- Add the parameters for the stored procedure here
	@idMejora as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		SELECT [Id]
			  ,[Linea]
			  ,[DescripcionLinea]
			  ,[InicioReal]
			  ,[TipoTurno]
			  ,[TipoTurnoId]
			  ,[FechaTurno]
			  ,[IDProductoEntrante]
			  ,[ProductoEntrante]
			  ,[IDProductoSaliente]
			  ,[ProductoSaliente]
			  ,[MinutosFinal1]
			  ,[MinutosFinal2]
			  ,[MinutosObjetivo1]
			  ,[MinutosObjetivo2]
		  FROM [dbo].[OrdenesCambio]
			WHERE [Id] in (SELECT [ID_CAMBIO]  collate Latin1_General_CI_AS
							FROM [ACCION_MEJORA_CAMBIOS] where FK_ACCION_MEJORA_ID = @idMejora)	
			ORDER BY [Linea],[InicioReal],[TipoTurno] DESC
											
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerAccionMejoraParosPerdidas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerAccionMejoraParosPerdidas]
	-- Add the parameters for the stored procedure here
	@idMejora as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT P.[Id]
	   --   ,[TimeCategory]
		  --,[Tipo]
	   --   ,[EsParoMayor]
	   --   ,[EsParoMenor]
	   --   ,[EsBajaVelocidad]
		  --,[Linea]
		  ,[IdTipoParoPerdida]
		  ,[TipoParoPerdida] AS Tipo
		  ,[IdLinea]	 
		  ,[DescLinea] 
		  ,[Turno]
		  ,[FechaTurno]
		  ,[IdTipoTurno]
		  ,[NombreTipoTurno]
		  ,[INICIO] as Inicio
		  ,[FIN] as Fin
		  ,[EquipoId]
		  ,[EquipoNombre]
		  --,[CategoriaId]
		  --,[CategoriaNombre]
		  ,[MotivoId]
		  ,[MotivoNombre]
		  ,[CausaId]
		  ,[CausaNombre]
		  ,[Justificado]
		  ,[Observaciones]
		  ,[MaquinaCausaId]
		  ,[MaquinaCausaNombre]
		  ,[EquipoConstructivoId]
		  ,[EquipoConstructivoNombre]
		  ,[NumeroParosMenores]
		  ,[DuracionParosMenores]
		  ,[DuracionParoMayor]
		  ,[DuracionBajaVelocidad]
		  ,P.[Descripcion]
		  --,[Numero]
		  --,[Duracion]
		  ,[InicioLocal]
		  ,[FinLocal]
		  ,P.EquipoDescripcion
		  ,P.Duracion
		FROM [ParosPerdidas] P
		WHERE P.id in (SELECT [ID_PARO_MAYOR]  
						FROM [ACCION_MEJORA_PAROS_MAYORES] where ID_ACCION_MEJORA = @idMejora)	
		ORDER BY [Inicio] DESC
											

	COMMIT TRANSACTION; 


END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerArranqueLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerArranqueLinea] 
	@numLinea INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		-- Insert statements for procedure here
		SELECT EquiP.[equip_prpty_value] as TipoArranqueLinea
		FROM [SITMesDB].[dbo].[BPM_EQUIPMENT_PROPERTY] EquiP
		INNER JOIN dbo.COB_MSM_LINEAS AS MaestroLineas on MaestroLineas.BPM_EQUIPMENT_PK = EquiP.equip_pk 
		WHERE [equip_prpty_id] = 'ARRANQUE_LINEA' AND MaestroLineas.NUM_LINEA = @numLinea
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerCalendarioId]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerCalendarioId] 
	-- Add the parameters for the stored procedure here
	@planta varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	
		-- Insert statements for procedure here
		SELECT [shc_holiday_cal_pk]  as id    
	  FROM [SITMesDB].[dbo].[SHC_HOLIDAY_CAL]
	  where id=@planta
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerCambiosAnalisisSPI]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerCambiosAnalisisSPI]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Inicio nvarchar(255),
	 @Fin nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	set transaction isolation level read uncommitted

--SELECT convert(varchar(100),S.AÑO) + ' Semana ' + convert(varchar(100),S.SEMANA) as Fecha
--      ,C.seriesname
--      ,CONVERT(INT,AVG(C.seriesdata)) as seriesdata
--  FROM [dbo].[OrdenesCambio] OC
--  CROSS APPLY (
--  SELECT 'Tiempo Final Llenadora' as seriesname, [MinutosFinal1] union all
--  SELECT 'Tiempo Final Paletizadora', [MinutosFinal2] union all
--  SELECT 'Tiempo Objetivo Llenadora', [MinutosObjetivo1] union all
--  SELECT 'Tiempo Objetivo Paletizadora', [MinutosObjetivo2] 
--  ) C (seriesname, seriesdata)
--  LEFT JOIN [dbo].[SEMANAS] S ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO
--  where InicioReal between  convert(datetime,@Inicio) and  convert(datetime,@Fin) and [IdLinea] =@Linea
--  GROUP BY S.AÑO, S.SEMANA,C.seriesname
--  order by C.seriesname asc, S.SEMANA asc
	
	DECLARE @ini datetime = convert(datetime,@Inicio);
	DECLARE @find datetime = convert(datetime,@Fin);

	SELECT
		CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
		,C.seriesname
		,ISNULL(CONVERT(INT, SUM(C.seriesdata)), 0) AS seriesdata
	FROM [dbo].[SEMANAS] S
	LEFT JOIN [dbo].[OrdenesCambio] OC ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO AND oc.IdLinea = @Linea
	CROSS APPLY (SELECT
			'Tiempo Final Llenadora' AS seriesname
			,[MinutosFinal1] UNION ALL SELECT
			'Tiempo Final Paletizadora'
			,[MinutosFinal2] UNION ALL SELECT
			'Tiempo Objetivo Llenadora'
			,[MinutosObjetivo1] UNION ALL SELECT
			'Tiempo Objetivo Paletizadora'
			,[MinutosObjetivo2]) C (seriesname, seriesdata)
	WHERE @ini <= S.FIN AND @find >= S.INICIO
	GROUP BY S.AÑO, S.SEMANA, C.seriesname
	ORDER BY C.seriesname ASC, S.SEMANA ASC
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerCodECMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerCodECMaquina]
	-- Add the parameters for the stored procedure here
	@EC varchar(500),
	@MAQ varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;	
			SELECT TOP 1 EC.IdObj as CodEQ FROM MAQUINAS M
		INNER JOIN COB_MSM_EQUIPOS_CONSTRUCTIVOS EC ON M.Nombre = EC.ID_MAQUINA
		WHERE M.Nombre = @MAQ AND EC.NOMBRE = @EC
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerCodigoNuevaWO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Daniel
-- Create date: 08/09/2016
-- Description:	Obtiene un código para generar una nueva WO
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerCodigoNuevaWO]
@codBase AS NVARCHAR(50)
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	SELECT TOP 1 REPLACE(pom_order_id ,@codBase,'') FROM [SITMesDB].[dbo].[POM_ORDER]
	WHERE pom_order_id  like @codBase + '%'and pom_order_id not like '%.%'
	ORDER BY cast(REPLACE(pom_order_id ,@codBase,'')as int) desc;
	
	COMMIT TRANSACTION; 


END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadoEtiquetadoraPalets]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadoEtiquetadoraPalets]
	-- Add the parameters for the stored procedure here
	@idTurno as int
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
BEGIN TRANSACTION;
		SELECT 
			h.ID_MAQUINA
			,COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalPalets
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA h
		INNER JOIN maquinas m ON  m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t on t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE t.Id = @idTurno AND CLASE = 'ETIQUETADORA_PALETS' -- AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY ID_MAQUINA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadosTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadosTurno]
	-- Add the parameters for the stored procedure here
	@idTurno as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		DECLARE @IdTurnoAnterior AS INT;
		DECLARE @InicioTurnoActual AS DATETIME;
		DECLARE @Linea as NVARCHAR(4000);
		DECLARE @ID_CLASE_PALETIZADORA AS INT;
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;
		DECLARE @IC_TURNO AS FLOAT;

		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		SELECT @IC_TURNO = IC
		FROM COB_MSM_CONSOLIDADO_TURNO
		WHERE SHC_WORK_SCHED_DAY_PK = @idTurno

		SELECT 
			ConsolidacionPal.TotalPalets,
			ConsolidacionLle.TotalEnvases,
			ConsolidacionCajas.TotalCajas,		
			ConsolidacionLle.TIEMPO_OPERATIVO,
			ConsolidacionLle.TIEMPO_PLANIFICADO,
			ConsolidacionLle.TIEMPO_NETO,
			ConsolidacionLle.VELOCIDAD_NOMINAL,
			COALESCE(@IC_TURNO,1) AS IC_TURNO
		FROM 
			(SELECT		
				COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as TotalEnvases
				,COALESCE(SUM([TIEMPO_OPERATIVO]),0) AS TIEMPO_OPERATIVO
				,COALESCE(SUM([TIEMPO_PLANIFICADO]),0) AS TIEMPO_PLANIFICADO
				,COALESCE(SUM([TIEMPO_NETO]),0) AS TIEMPO_NETO
				,COALESCE(SUM([VELOCIDAD_NOMINAL]),0) AS VELOCIDAD_NOMINAL
			FROM COB_MSM_PROD_LLENADORA_HORA  
			WHERE [SHC_WORK_SCHED_DAY_PK] = @idTurno --AND ISNULL(ID_ORDEN,'') != ''
			) AS ConsolidacionLle
		CROSS JOIN
			(SELECT 
				COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalPalets
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @idTurno AND ML.IdClase = @ID_CLASE_PALETIZADORA --AND ISNULL(Consolidacion.ID_ORDEN,'') != ''
			) as ConsolidacionPal
			CROSS JOIN
			(SELECT 
				COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalCajas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @idTurno AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA) --AND ISNULL(Consolidacion.ID_ORDEN,'') != ''
			) as ConsolidacionCajas
			
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadosTurnoAnterior]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadosTurnoAnterior]
	-- Add the parameters for the stored procedure here
	@idTurnoActual as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		DECLARE @IdTurnoAnterior AS INT;
		DECLARE @InicioTurnoActual AS DATETIME;
		DECLARE @Linea as NVARCHAR(4000);
		DECLARE @ID_CLASE_PALETIZADORA AS INT;		
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;

		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		SELECT @InicioTurnoActual = InicioTurno, @Linea = Linea FROM Turnos WHERE Id = @idTurnoActual

		SELECT TOP 1 @IdTurnoAnterior = Id
		FROM Turnos
		WHERE Turnos.InicioTurno < @InicioTurnoActual AND Turnos.Linea = @Linea
		ORDER BY InicioTurno DESC

		--SELECT
		--	COALESCE(SUM(ConsolidacionMaq.[CONTADOR_PRODUCCION]), 0) as TotalPalets
		--	,COALESCE(SUM(Consolidacion.[TIEMPO_OPERATIVO])/NULLIF(SUM(Consolidacion.[TIEMPO_PLANIFICADO]),0) , 0) *100 AS Disponibilidad
		--	,COALESCE(SUM(Consolidacion.[TIEMPO_NETO])/NULLIF(SUM(Consolidacion.[TIEMPO_OPERATIVO]),0),0) * 100  AS Eficiencia
		--	,(COALESCE(SUM(Consolidacion.[TIEMPO_OPERATIVO])/NULLIF(sum(Consolidacion.[TIEMPO_PLANIFICADO]),0), 0) * COALESCE(SUM(Consolidacion.[TIEMPO_NETO])/NULLIF(sum(Consolidacion.[TIEMPO_OPERATIVO]),0), 0) * 1.0) * 100.0 as OEE
		--FROM COB_MSM_PROD_LLENADORA_HORA as Consolidacion
		----INNER JOIN Turnos ON Consolidacion.[SHC_WORK_SCHED_DAY_PK] = Turnos.Id
		--LEFT JOIN COB_MSM_PROD_RESTO_MAQ_HORA AS ConsolidacionMaq ON ConsolidacionMaq.SHC_WORK_SCHED_DAY_PK = Consolidacion.SHC_WORK_SCHED_DAY_PK
		--LEFT JOIN MaquinasLineas AS ML on ML.Id = ConsolidacionMaq.ID_MAQUINA
		--WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @IdTurnoAnterior AND ML.IdClase = @ID_CLASE_PALETIZADORA
		--GROUP BY Consolidacion.[SHC_WORK_SCHED_DAY_PK]

		SELECT 
			ConsolidacionMaq.TotalPalets,
			ConsolidacionLle.TotalEnvases,		
			ConsolidacionLle.TIEMPO_OPERATIVO,
			ConsolidacionLle.TIEMPO_PLANIFICADO,
			ConsolidacionLle.TIEMPO_NETO,
			ConsolidacionCajas.TotalCajas,
			ConsolidacionLle.VELOCIDAD_NOMINAL	
		FROM 
			(SELECT		
				COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as TotalEnvases
				,COALESCE(SUM([TIEMPO_OPERATIVO]),0) AS TIEMPO_OPERATIVO
				,COALESCE(SUM([TIEMPO_PLANIFICADO]),0) AS TIEMPO_PLANIFICADO
				,COALESCE(SUM([TIEMPO_NETO]),0) AS TIEMPO_NETO
				,COALESCE(SUM([VELOCIDAD_NOMINAL]),0) AS VELOCIDAD_NOMINAL
			FROM COB_MSM_PROD_LLENADORA_HORA  
			WHERE [SHC_WORK_SCHED_DAY_PK] = @IdTurnoAnterior --AND ISNULL(ID_ORDEN,'') != ''
			) AS ConsolidacionLle
		CROSS JOIN
			(SELECT 
				COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalPalets
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @IdTurnoAnterior AND ML.IdClase = @ID_CLASE_PALETIZADORA  --AND ISNULL(ID_ORDEN,'') != ''
			) as ConsolidacionMaq
		CROSS JOIN
			(SELECT 
				COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalCajas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @IdTurnoAnterior AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA) --AND ISNULL(Consolidacion.ID_ORDEN,'') != ''
			) as ConsolidacionCajas
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadoTurnoEmpaquetadoraEncajonadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadoTurnoEmpaquetadoraEncajonadora]
	-- Add the parameters for the stored procedure here
	@idTurno as int

AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	SELECT 
			h.ID_MAQUINA
			,COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalCajas
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA h,
		(SELECT Id FROM maquinas WHERE  CLASE IN ('EMPAQUETADORA','ENCAJONADORA')) m 
		WHERE h.SHC_WORK_SCHED_DAY_PK = @idTurno  --AND ISNULL(h.ID_ORDEN,'') != ''
		AND m.Id = h.ID_MAQUINA
		GROUP BY ID_MAQUINA
		--SELECT 
		--	h.ID_MAQUINA
		--	,COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalCajas
		--FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA h
		--INNER JOIN maquinas m ON  m.Id = h.ID_MAQUINA
		--INNER JOIN Turnos t on t.Id = h.SHC_WORK_SCHED_DAY_PK
		--WHERE t.Id = @idTurno AND CLASE IN ('EMPAQUETADORA','ENCAJONADORA') --AND ISNULL(h.ID_ORDEN,'') != ''
		--GROUP BY ID_MAQUINA
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadoTurnoLlenadoraPorOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadoTurnoLlenadoraPorOrden]
	-- Add the parameters for the stored procedure here
	@idTurno as int

AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		DECLARE @ICT FLOAT;

		SELECT @ICT = IC
		FROM COB_MSM_CONSOLIDADO_TURNO
		WHERE SHC_WORK_SCHED_DAY_PK = @idTurno

		SELECT
			ID_MAQUINA, 
			SUM(TotalEnvases) AS TotalEnvases,
			SUM(TotalCajas) AS TotalCajas,
			SUM(TotalPalets) AS TotalPalets,
			SUM(HL) AS HL,
			SUM(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
			,SUM(TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
			,SUM(TIEMPO_NETO) AS TIEMPO_NETO
			,SUM(TIEMPO_BRUTO) AS TIEMPO_BRUTO
			,SUM(CONTADOR_RECHAZOS) AS CONTADOR_RECHAZOS
			,SUM([VELOCIDAD_NOMINAL]) AS VELOCIDAD_NOMINAL
			,COALESCE(@ICT,1) AS ICT
		FROM
		(SELECT ID_ORDEN, 
			ID_MAQUINA, 
			o.IdProducto,
			COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalEnvases,
			CONVERT(real,ISNULL(o.CajasPorPalet*COALESCE(SUM(CONTADOR_PRODUCCION),0)/NULLIF(o.EnvasesPorPalet,0),0)) AS TotalCajas,
		
			CONVERT(real,ISNULL(  COALESCE(SUM(CONTADOR_PRODUCCION)/NULLIF(o.EnvasesPorPalet,0),0),0)) AS TotalPalets,
		
			CONVERT(real,ISNULL(o.HectolitrosProducto * COALESCE(SUM(CONTADOR_PRODUCCION),0),0)) as HL,
			COALESCE(SUM([TIEMPO_OPERATIVO]),0) AS TIEMPO_OPERATIVO
			,COALESCE(SUM([TIEMPO_PLANIFICADO]),0) AS TIEMPO_PLANIFICADO
			,COALESCE(SUM([TIEMPO_NETO]),0) AS TIEMPO_NETO
			,COALESCE(SUM([TIEMPO_BRUTO]),0) AS TIEMPO_BRUTO
			,COALESCE(SUM([CONTADOR_RECHAZOS]),0) AS CONTADOR_RECHAZOS
			,COALESCE(SUM([VELOCIDAD_NOMINAL]),0) AS VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Turnos t on t.Id = h.SHC_WORK_SCHED_DAY_PK
		LEFT JOIN Ordenes o ON o.Id = h.ID_ORDEN
		WHERE t.Id = @idTurno
		GROUP BY ID_ORDEN, ID_MAQUINA, o.IdProducto, o.HectolitrosProducto, o.CajasPorPalet,o.EnvasesPorPalet) AS ConsolidadoLLenadoraHL
		GROUP BY ID_MAQUINA
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConsolidadoTurnoPaletera]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConsolidadoTurnoPaletera]
	-- Add the parameters for the stored procedure here
	@idTurno as int

AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
			h.ID_MAQUINA
			,COALESCE(SUM(CONTADOR_PRODUCCION),0) AS TotalPalets
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA h
		INNER JOIN maquinas m ON  m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t on t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE t.Id = @idTurno AND CLASE = 'PALETIZADORA' -- AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY ID_MAQUINA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerContingencias]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerContingencias]
	-- Add the parameters for the stored procedure here
    @fini bigint,
	@ffin bigint,
	@linea varchar(100)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	SELECT
		ROW_NUMBER() OVER (ORDER BY PTC.Fecha) AS ID
		,CONVERT(DATE, PTC.Fecha) AS Fecha
		,ISNULL(TT.Nombre, 'Desconocido') AS 'Turno'
		,ISNULL(SUM(ENVASES_LLENADORA), 0) AS envLlenadora
		,ISNULL(SUM(ENVASES_PALETIZADORA), 0) AS palPaletizadora
		,ISNULL(SUM(ENVASES_VACIOS_RECHAZADOS), 0) AS ENVASES_VACIOS_RECHAZADOS
		,ISNULL(SUM(ENVASES_LLENOS_RECHAZADOS), 0) AS ENVASES_LLENOS_RECHAZADOS
	FROM [dbo].[ProduccionTurnosConsolidada] PTC
	INNER JOIN [dbo].[Turnos] T
		ON PTC.TURNO = T.ID
	LEFT JOIN [dbo].TiposTurno TT
		ON TT.Id = T.IdTipoTurno
	WHERE PTC.Turno <> 0
	AND @fini <= DATEDIFF(s, '1970-1-1', PTC.Inicio)
	AND @ffin >= DATEDIFF(s, '1970-1-1', PTC.Inicio)
	AND PTC.Linea LIKE '%' + @linea + '%'
	GROUP BY	PTC.Fecha
				,T.IdTipoTurno
				,TT.Nombre
COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConversionesOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConversionesOrdenes]
	@ordenes as StringList READONLY
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
		BEGIN TRANSACTION;
		SELECT
			Id as ID_ORDEN,
			EnvasesPorPalet,
			CajasPorPalet
		FROM Ordenes 
		INNER JOIN	@ordenes o ON o.Item = Id
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerConversionesPorProducto]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerConversionesPorProducto]
	@producto as nvarchar(50)
AS
BEGIN
	set transaction isolation level read uncommitted
	BEGIN TRANSACTION;
	DECLARE @ContEmbalajeId nvarchar(25);
	DECLARE @MantosPaletId nvarchar(25);
	DECLARE @EmbMantoId nvarchar(25);

 select @ContEmbalajeId = ParameterData from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Cont_Palet'
 
 select @EmbMantoId = ParameterData from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Emb_Manto'
 
 select @MantosPaletId = ParameterData from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Mantos_Palet'


DECLARE @query nvarchar(max);
set @query = 'WITH [Conversiones] AS (
SELECT PartNo, 
	Revision, 
	['+@ContEmbalajeId+'] as EnvasesPalets, 
	['+@MantosPaletId+'] * ['+@EmbMantoId+'] AS CajasPalets
FROM
	(SELECT    
	   itsp.PartNo,  
	   itsp.Revision,
	   itsp.PropertyId,
	   itsp.Numeric1
	  FROM INTERSPEC.MSMIS.INTERSPC.ItSpProperty itsp
	  where  PropertyId IN ('+@ContEmbalajeId+','+@MantosPaletId+','+@EmbMantoId+') AND itsp.PartNo = ''' + @producto +''' ) AS sourcetable
	 PIVOT
	 (Max(Numeric1)
		FOR	PropertyId IN (['+@ContEmbalajeId+'],['+@EmbMantoId+'], ['+@MantosPaletId+'])

		) as pivottable)
	
	
 SELECT  c.PartNo, c.EnvasesPalets,c.CajasPalets,c.Revision
 FROM [Conversiones] c
 where c.Revision = (SELECT MAX(Revision) FROM [Conversiones] where PartNo = c.PartNo)
 '
 --INNER JOIN #Temp p ON  p.Item = c.PartNo COLLATE DATABASE_DEFAULT
 

 Execute (@query)
 
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerCurvaGrafico]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerCurvaGrafico]
	-- Add the parameters for the stored procedure here
	@pkOrden int,
	@id_kop int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
		
	select cfg.Label +' - Posición: '+Cast(cfg.[Index] as nvarchar(max)) categories,C.Nombre as seriesname, REPLACE(C.valor,',','.') as seriesdata,cfg.[Index] 
	from [dbo].[COB_MSM_CURVAS_KOP_VAL] val
	LEFT JOIN [dbo].[COB_MSM_CURVAS_KOP_CFG] cfg on cfg.OrderID = val.OrderID
	CROSS APPLY (
	SELECT 'Valor minimo', cfg.Min_value UNION ALL
	SELECT 'Valor', val.Valor UNION ALL
	SELECT 'Valor maximo', cfg.MAX_value 
	) C (NOMBRE, VALOR)
	WHERE cfg.KopID = val.KopID AND cfg.[Index]=val.[Index] AND (cfg.OrderID = @pkOrden AND cfg.KopID = @id_kop)
	group by cfg.Label,c.Nombre,c.valor,cfg.[Index]
	order by C.Nombre asc

--select K.Label + ' - ' + CONVERT(VARCHAR(10),k.TimeStamp,103) + ' ' + convert(varchar(8),k.TimeStamp,108) as categories,C.Nombre as seriesname, C.valor as seriesdata  
--from [dbo].[COB_MSM_CURVAS_KOP_VAL] k
--CROSS APPLY (
--SELECT 'Valor minimo', Min_value UNION ALL
--SELECT 'Valor', K.Valor UNION ALL
--SELECT 'Valor maximo', MAX_value 
--) C (NOMBRE, VALOR)
--WHERE K.OrderID = @pkOrden AND KopID = @id_kop
--group by  c.valor,c.Nombre, K.Label + ' - ' + CONVERT(VARCHAR(10),k.TimeStamp,103) + ' ' + convert(varchar(8),k.TimeStamp,108),k.idobj
--order by C.Nombre, k.idobj asc

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerDatosDeslizante]
	@idIns as int,
	@vista as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	declare @columnas varchar(max)
	declare @sql nvarchar(max);	

	set @columnas = ''
	
	select @columnas = coalesce(@columnas + '[' + cast(semana as varchar(12)) + '],', '')
	FROM (select distinct semana from mes_msm.dbo.DeslizanteDatos where idIns = @idIns) as DTM

	set @columnas = left(@columnas,LEN(@columnas)-1)

	if (@vista = 0)		--Vista por Cerveza
	set @sql = '
	    select *		
		from 
		(
			select 			
				defid,
				(
					select def.descript 
					from sitmesdb.dbo.mmwdefinitions def 
					where def.defid = data.defid
				) as description,
				semana, 
				cantidad
			from mes_msm.dbo.DeslizanteDatos data
			where idIns = ' + CAST(@idIns as nvarchar(max)) + '
		) src
		pivot
		(
			sum(cantidad)
			for semana in (' + @columnas + ')
		) piv	
		order by defid desc
		'
	else
	set @sql = '
		select *		
		from 
		(
			select
				linea, 
				(
					select f.descripcion
					from mes_msm.dbo.COB_MSM_DeslizanteFormato f
					inner join mes_msm.dbo.COB_MSM_DeslizanteProductos p on f.id = p.id
					where p.paleta = data.defid
				) as formato,
				defid,
				(
					select def.descript 
					from sitmesdb.dbo.mmwdefinitions def 
					where def.defid = data.defid
			) as description,
			semana, 
			cantidad, 
			item			
			from mes_msm.dbo.DeslizanteDatos data
			where idIns = ' + CAST(@idIns as nvarchar(max)) + '
		) src
		pivot
		(
			sum(cantidad)
			for semana in (' + @columnas + ')
		) piv	
		order by formato desc
		'
exec (@sql)

	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosGeneralesParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosGeneralesParticion]
	@ordenId nvarchar(20)--,
	--@ordenIdPadre nvarchar(20),
	--@subordenId nvarchar(5)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.	
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		
	SELECT
		[Id]
		,[IdOrdenPadre]
		,[IdSubOrden]
		,[FecIniEstimada]
		,[FecFinEstimada]
		,[FecIniReal]
		,[FecFinReal]
	FROM [dbo].[Particiones]
	where id = @ordenId
	
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionLlenadoraHora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionLlenadoraHora]
	@idTurno as int
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		SELECT
			m.Id as Nombre
			,h.HORA
			,COALESCE(SUM(h.[TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
			,COALESCE(SUM(h.[TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
			,COALESCE(SUM(h.[TIEMPO_BRUTO]), 0) AS TiempoBruto
			,COALESCE(SUM(h.[TIEMPO_NETO]), 0) AS TiempoNeto
			,COALESCE(SUM(h.[VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
			,COALESCE(SUM(h.[CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
			,COALESCE(SUM(h.[CONTADOR_RECHAZOS]), 0) AS ContadorRechazos
		FROM COB_MSM_PROD_LLENADORA_HORA h
		INNER JOIN Maquinas m ON m.Id = h.ID_MAQUINA
		INNER JOIN Turnos t
			ON t.Id = h.SHC_WORK_SCHED_DAY_PK
		WHERE h.SHC_WORK_SCHED_DAY_PK = @idTurno --AND ISNULL(h.ID_ORDEN,'') != ''
		GROUP BY h.HORA,m.Id
		ORDER by h.HORA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionMaquina]
	@IdMaquina nvarchar(4000),
	@Clase nvarchar(100),
	@FecInicio datetime,
	@FecFin datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		DECLARE @Min INT = 0;
		IF (@Clase = 'LLENADORA') BEGIN

			SELECT
				@Min = SUM(DATEDIFF(MI,FECHA_INICIO, FECHA_FIN))
			FROM COB_MSM_PROD_LLENADORA_HORA
			WHERE ID_MAQUINA = @IdMaquina
			AND (FECHA_INICIO BETWEEN @FecInicio AND @FecFin
			AND FECHA_FIN BETWEEN @FecInicio AND @FecFin)
		
			--Hasta que no tengamos los datos de toda la hora completa no los devolvemos
			IF (@Min >= 60) BEGIN
				SELECT
					COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
					,COALESCE(SUM([TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
					,COALESCE(SUM([TIEMPO_BRUTO]), 0) AS TiempoBruto
					,COALESCE(SUM([TIEMPO_NETO]), 0) AS TiempoNeto
					,COALESCE(SUM([VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
					,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
					,COALESCE(SUM([CONTADOR_RECHAZOS]), 0) AS ContadorRechazos
					,COUNT(DISTINCT HORA) AS NumHoras
				FROM COB_MSM_PROD_LLENADORA_HORA
				WHERE ID_MAQUINA = @IdMaquina
				AND (FECHA_INICIO BETWEEN @FecInicio AND @FecFin
				AND FECHA_FIN BETWEEN @FecInicio AND @FecFin)
			END
		END ELSE BEGIN

			SELECT
				@Min = SUM(DATEDIFF(MI,FECHA_INICIO, FECHA_FIN))
			FROM COB_MSM_PROD_RESTO_MAQ_HORA
			WHERE ID_MAQUINA = @IdMaquina
			AND (FECHA_INICIO BETWEEN @FecInicio AND @FecFin
			AND FECHA_FIN BETWEEN @FecInicio AND @FecFin)

			--Hasta que no tengamos los datos de toda la hora completa no los devolvemos
			IF (@Min >= 60) BEGIN
				SELECT
					COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) AS TiempoPlanificado
					,COALESCE(SUM([TIEMPO_OPERATIVO]), 0) AS TiempoOperativo
					,COALESCE(SUM([TIEMPO_BRUTO]), 0) AS TiempoBruto
					,COALESCE(SUM([TIEMPO_NETO]), 0) AS TiempoNeto
					,COALESCE(SUM([VELOCIDAD_NOMINAL]), 0) AS VelocidadNominal
					,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) AS EnvasesProducidos
					,COALESCE(SUM([CONTADOR_RECHAZOS]), 0) AS ContadorRechazos
					,COUNT(DISTINCT HORA) AS NumHoras
				FROM COB_MSM_PROD_RESTO_MAQ_HORA
				WHERE ID_MAQUINA = @IdMaquina
				AND (FECHA_INICIO BETWEEN @FecInicio AND @FecFin
				AND FECHA_FIN BETWEEN @FecInicio AND @FecFin)
			END
		END
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionOrden]
	@ordenId nvarchar(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	
	BEGIN TRANSACTION;	

		DECLARE @ID_CLASE_PALETIZADORA AS INT;
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;
		DECLARE @ID_CLASE_ETIQUETADORA AS INT;
		DECLARE @RechazoslLle INT;
		DECLARE @RechazosInspectorSalidaLlenadora INT;
		DECLARE @RechazosInspectorBotellasVacias INT;
		DECLARE @RechazosClasificadores INT;
		DECLARE @RechazosProductoTerminado INT;
		DECLARE @Picos as INT;

		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		SELECT DISTINCT @ID_CLASE_ETIQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ETIQUETADORA_PALETS'

		SELECT @RechazoslLle = SUM(CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_LLENADORA_HORA  
		WHERE ID_ORDEN =  @ordenId and SHC_WORK_SCHED_DAY_PK > 0
	
		SELECT @RechazosClasificadores = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where ID_ORDEN =  @ordenId AND m.Clase = 'CLASIFICADOR' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosInspectorBotellasVacias = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where ID_ORDEN =  @ordenId AND m.Clase = 'INSPECTOR_BOTELLAS_VACIAS' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosInspectorSalidaLlenadora = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where ID_ORDEN =  @ordenId AND m.Clase = 'INSPECTOR_SALIDA_LLENADORA' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosProductoTerminado = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where ID_ORDEN =  @ordenId AND m.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA') and SHC_WORK_SCHED_DAY_PK > 0
	
		DECLARE @PicosPalets as INT;
		SELECT @Picos = COALESCE(SUM(Cantidad),0), @PicosPalets = COUNT(IdParticion)
		FROM dbo.Picos
		WHERE IdOrden = @ordenId

		DECLARE @IC as FLOAT;
		DECLARE @Rendimiento as FLOAT;
		DECLARE @OEE as FLOAT;
		SET @IC = dbo.MES_GetICWO(@ordenId);
		SET @Rendimiento = dbo.MES_GetRendimientoWO(@ordenId);
		SET @OEE = dbo.MES_GetOEEWO(@ordenId);

		DECLARE @NOCONFORMIDAD AS INT;
		SELECT @NOCONFORMIDAD = SUM(CANTIDAD_ENVASES)
		FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
		WHERE ID_ORDEN = @ordenId 

		SELECT  Orden.Id as IdOrden
				,COALESCE(ConsolidacionEtiquetadoraPalets.PaletsETQProducidos,0) AS PaletsETQProducidos
				,COALESCE(PaletsProducidos,0) AS PaletsProducidos			
				,COALESCE(EnvasesProducidos,0) AS EnvasesProducidos
				,COALESCE(@RechazosInspectorSalidaLlenadora,0) AS RechazosLlenadora
				--,COALESCE(@RechazoslLle + @RechazosInspectorSalidaLlenadora,0) AS RechazosLlenadora
				,COALESCE(@RechazosClasificadores,0) AS RechazosClasificadores
				,COALESCE(@RechazosProductoTerminado,0) AS RechazosProductoTerminado
				,COALESCE(@RechazosInspectorBotellasVacias,0) AS RechazosInspectorBotellasVacias
				,COALESCE(@OEE, 0)  as OEE
				--,COALESCE(TotalEnvases/NULLIF(TiempoPaletera,0) , 0) as VelocidadRealMedia
				,COALESCE(Orden.VelocidadNominal, 0) AS VelocidadNominal
				,COALESCE(TiempoPlanificadoPaletera, 0) AS TiempoPlanificadoPaletera
				,COALESCE(TiempoPlanificadoPaletera, 0) AS TiempoPlanificadoLlenadora
				,COALESCE(ConsolidacionEncajonadora.CajasProducidas, 0) CajasProducidas
				,COALESCE(@Picos, 0) AS PicosCajas --@Picos viene en cajas pasamos a Palets
				,COALESCE(@IC, 0) as IC
				,COALESCE(@PicosPalets, 0) as PicosPalets
				,COALESCE(@NOCONFORMIDAD, 0) AS EnvNoConformidad
		FROM [MES_MSM].[dbo].[Ordenes] AS Orden 
		LEFT JOIN (SELECT 
					ID_ORDEN as IdOrden
					,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as EnvasesProducidos
					,COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) as TiempoPlanificadoLlenadora
			FROM COB_MSM_PROD_LLENADORA_HORA  
			WHERE ID_ORDEN = @ordenId and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_ORDEN
			) AS ConsolidacionLle ON ConsolidacionLle.IdOrden = Orden.Id
		LEFT JOIN 
			(SELECT ID_ORDEN as IdOrden,	
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as PaletsProducidos,
					COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) as TiempoPlanificadoPaletera
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @ordenId AND ML.IdClase = @ID_CLASE_PALETIZADORA and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_ORDEN
			) AS ConsolidacionPalet 
		ON ConsolidacionPalet.IdOrden = Orden.Id
		LEFT JOIN
			(SELECT ID_ORDEN as IdOrden,	
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as CajasProducidas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @ordenId AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA) and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_ORDEN
			) AS ConsolidacionEncajonadora 
		ON ConsolidacionEncajonadora.IdOrden = Orden.Id
		LEFT JOIN
			(SELECT ID_ORDEN as IdOrden,
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as PaletsETQProducidos
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @ordenId AND ML.IdClase = @ID_CLASE_ETIQUETADORA and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_ORDEN
			) AS ConsolidacionEtiquetadoraPalets
		ON ConsolidacionEtiquetadoraPalets.IdOrden = Orden.Id
		WHERE Orden.Id = @ordenId
	COMMIT TRANSACTION;	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionOrdenTurno]
	-- Add the parameters for the stored procedure here
	@ordenId nvarchar(4000)
	
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		DECLARE @ID_CLASE_PALETIZADORA AS INT;
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;
		DECLARE @ID_CLASE_ETIQUETADORA AS INT;

		SELECT DISTINCT @ID_CLASE_ETIQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ETIQUETADORA_PALETS'

		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		
		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

	SELECT DISTINCT ID_PARTICION AS IdParticion, SHC_WORK_SCHED_DAY_PK AS IdTurno
	INTO #OrdenesTurno
	FROM 
	(SELECT DISTINCT ID_PARTICION, SHC_WORK_SCHED_DAY_PK
	FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL
	WHERE PLL.ID_ORDEN = @ordenId AND SHC_WORK_SCHED_DAY_PK > 0
	UNION 
	SELECT DISTINCT ID_PARTICION, SHC_WORK_SCHED_DAY_PK
	FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA PR
	INNER JOIN Maquinas m on m.Id = PR.ID_MAQUINA AND m.IdClase IN (@ID_CLASE_ETIQUETADORA,@ID_CLASE_ENCAJONADORA,@ID_CLASE_EMPAQUETADORA,@ID_CLASE_PALETIZADORA)
	WHERE PR.ID_ORDEN = @ordenId AND SHC_WORK_SCHED_DAY_PK > 0
	) AS P

	SELECT
		Turnos.Id
		,Turnos.IdTipoTurno
		,COALESCE(TiposTurno.Nombre, (SELECT
				Nombre
			FROM TiposTurno
			WHERE Id = ConsolidacionLle.IdTurno)
		) TipoTurno--TiposTurno.Nombre as TipoTurno
		,COALESCE(NULLIF(Turnos.InicioTurno, CAST('' AS DATETIME)), (SELECT
				MIN(FECHA_INICIO)
			FROM COB_MSM_PROD_LLENADORA_HORA
			WHERE ID_ORDEN = @ordenId
			AND SHC_WORK_SCHED_DAY_PK = OrdenesTurno.IdTurno),(SELECT
				MIN(FECHA_INICIO)
			FROM COB_MSM_PROD_RESTO_MAQ_HORA
			WHERE ID_ORDEN = @ordenId
			AND SHC_WORK_SCHED_DAY_PK = OrdenesTurno.IdTurno)
		) AS Fecha--Turnos.InicioTurno as Fecha
		,COALESCE(TotalPalets, 0) AS TotalPalets
		,COALESCE(TotalEnvases, 0) AS TotalEnvases
		,COALESCE(Disponibilidad, 0) AS Disponibilidad
		,COALESCE(Eficiencia, 0) AS Eficiencia
		,COALESCE(OEE, 0) AS OEE
		,ISNULL(RechazosSalidaLlenadora,0) AS RechazosLlenadora
		,ISNULL(RechazosClasificadores,0) AS RechazosClasificadores
		,ISNULL(RechazosProductoTerminado,0) AS RechazosProductoTerminado
		,ISNULL(RechazosInspectorBotellasVacias,0) AS RechazosInspectorBotellasVacias
		,COALESCE(ConsolidacionEncajonadora.TotalCajas, 0) AS TotalCajas
		,COALESCE(ConsolidacionEtiquetadoraPalets.TotalPaletsEtiquetadora, 0) AS TotalPaletsEtiquetadora
		,CASE 
			WHEN FechasWOActivaIni.FechaInicioWOActiva = FechasWOActivaFin.FechaFinWOActiva THEN Turnos.InicioTurno
			ELSE ISNULL(FechasWOActivaIni.FechaInicioWOActiva, Turnos.InicioTurno)
		END AS FechaInicioWOActiva
		,ISNULL(FechasWOActivaFin.FechaFinWOActiva,Turnos.FinTurno) AS FechaFinWOActiva
		,ISNULL(DATEDIFF(SECOND, Turnos.InicioTurno, Turnos.FinTurno),0) - ISNULL(breakTurnos.SecondsBreak, 0) AS SecondsTurno 
	FROM #OrdenesTurno AS OrdenesTurno
	LEFT JOIN (SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) AS TotalEnvases
			,0 AS Disponibilidad
			,0 AS Eficiencia
			,0 AS OEE
			--,COALESCE(SUM([TIEMPO_OPERATIVO]) / NULLIF(SUM([TIEMPO_PLANIFICADO]), 0), 0) * 100 AS Disponibilidad
			--,COALESCE(SUM([TIEMPO_NETO]) / NULLIF(SUM([TIEMPO_OPERATIVO]), 0), 0) * 100 AS Eficiencia
			--,(COALESCE(SUM([TIEMPO_OPERATIVO]) / NULLIF(SUM([TIEMPO_PLANIFICADO]), 0), 0) * COALESCE(SUM([TIEMPO_NETO]) / NULLIF(SUM([TIEMPO_OPERATIVO]), 0), 0) * 1.0) * 100.0 AS OEE
		FROM COB_MSM_PROD_LLENADORA_HORA
		WHERE ID_ORDEN = @ordenId
		GROUP BY [SHC_WORK_SCHED_DAY_PK]) AS ConsolidacionLle ON ConsolidacionLle.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN (SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) AS TotalPalets
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
		LEFT JOIN MaquinasLineas AS ML
			ON ML.Id = Consolidacion.ID_MAQUINA
		WHERE Consolidacion.ID_ORDEN = @ordenId
		AND ML.IdClase = @ID_CLASE_PALETIZADORA
		GROUP BY [SHC_WORK_SCHED_DAY_PK]) AS ConsolidacionPalet
		ON OrdenesTurno.IdTurno = ConsolidacionPalet.IdTurno
	LEFT JOIN
			(SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalCajas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML ON ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @ordenId	AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA)
			GROUP BY [SHC_WORK_SCHED_DAY_PK]
			) AS ConsolidacionEncajonadora 
		ON ConsolidacionEncajonadora.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN
			(SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalPaletsEtiquetadora
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML ON ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @ordenId	AND ML.IdClase = @ID_CLASE_ETIQUETADORA
			GROUP BY [SHC_WORK_SCHED_DAY_PK]
			) AS ConsolidacionEtiquetadoraPalets
		ON ConsolidacionEtiquetadoraPalets.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN Turnos
		ON Turnos.Id = OrdenesTurno.IdTurno
	LEFT JOIN (SELECT 
					breakT.shc_work_sched_day_pk as IdTurno,
					DATEDIFF(SECOND, breakT.break_start, breakT.break_end) AS SecondsBreak
			   FROM [SITMesDB].[dbo].[SHC_WORK_SCHED_BREAK] breakT) 
			   AS breakTurnos ON Turnos.Id = breakTurnos.IdTurno
	LEFT JOIN TiposTurno
		ON TiposTurno.Id = Turnos.IdTipoTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosClasificadores
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_ORDEN = @ordenId
				AND ML.Clase = 'CLASIFICADOR'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosClasificadores ON OrdenesTurno.IdTurno = ConsolidacionRechazosClasificadores.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosInspectorBotellasVacias
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_ORDEN = @ordenId
				AND ML.Clase = 'INSPECTOR_BOTELLAS_VACIAS'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosInspectorBotellasVacias ON OrdenesTurno.IdTurno = ConsolidacionRechazosInspectorBotellasVacias.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosSalidaLlenadora
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_ORDEN = @ordenId
				AND ML.Clase = 'INSPECTOR_SALIDA_LLENADORA'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosSalidaLlenadora ON OrdenesTurno.IdTurno = ConsolidacionRechazosSalidaLlenadora.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosProductoTerminado
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_ORDEN = @ordenId
				AND ML.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA')
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosProductoTerminado ON OrdenesTurno.IdTurno = ConsolidacionRechazosProductoTerminado.IdTurno
	LEFT JOIN(SELECT 
					Turnos.Id as IdTurno, MIN(FECHA_CAMBIO) AS FechaInicioWOActiva
				FROM COB_MSM_HISTORICO_ORDENES h
				inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
				inner join Ordenes p on p.Id = h.ORDER_ID 
				inner join Turnos on h.FECHA_CAMBIO BETWEEN Turnos.InicioTurno AND Turnos.FinTurno AND Turnos.Linea = p.Linea
				where ORDER_ID=@ordenId AND EstadosOrden.Estado IN ('Iniciando')
				GROUP BY Turnos.Id
			) AS FechasWOActivaIni ON FechasWOActivaIni.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN(SELECT 
					Turnos.Id as IdTurno, MAX(FECHA_CAMBIO) AS FechaFinWOActiva
				FROM COB_MSM_HISTORICO_ORDENES h
				inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
				inner join Ordenes p on p.Id = h.ORDER_ID 
				inner join Turnos on h.FECHA_CAMBIO BETWEEN Turnos.InicioTurno AND Turnos.FinTurno AND Turnos.Linea = p.Linea
				where ORDER_ID=@ordenId AND EstadosOrden.Estado IN ('Pausada','Finalizada')
				GROUP BY Turnos.Id
			) AS FechasWOActivaFin ON FechasWOActivaFin.IdTurno = OrdenesTurno.IdTurno
	ORDER BY Fecha ASC

	DROP TABLE #OrdenesTurno
	COMMIT TRANSACTION;

END

/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionParticionTurno]    Script Date: 01/08/2017 8:07:30 ******/
SET ANSI_NULLS ON

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionParticion]
	@ordenId nvarchar(20)--,
	--@ordenIdPadre nvarchar(20),
	--@subordenId nvarchar(5)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.	
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		
		DECLARE @ID_CLASE_PALETIZADORA AS INT;
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;
		DECLARE @ID_CLASE_ETIQUETADORA AS INT;
		DECLARE @RechazoslLle INT;
		DECLARE @RechazosInspectorSalidaLlenadora INT;
		DECLARE @RechazosInspectorBotellasVacias INT;
		DECLARE @RechazosClasificadores INT;
		DECLARE @RechazosProductoTerminado INT;
		DECLARE @Picos as INT;
		DECLARE @PicosPalets as INT;

		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		SELECT DISTINCT @ID_CLASE_ETIQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ETIQUETADORA_PALETS'

		SELECT @RechazoslLle = SUM(CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_LLENADORA_HORA  
		WHERE ID_PARTICION = @ordenId and SHC_WORK_SCHED_DAY_PK > 0
	
		SELECT @RechazosClasificadores = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where  ID_PARTICION = @ordenId AND m.Clase = 'CLASIFICADOR' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosInspectorBotellasVacias = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where  ID_PARTICION = @ordenId AND m.Clase = 'INSPECTOR_BOTELLAS_VACIAS' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosInspectorSalidaLlenadora = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where ID_PARTICION = @ordenId AND m.Clase = 'INSPECTOR_SALIDA_LLENADORA' and SHC_WORK_SCHED_DAY_PK > 0

		SELECT @RechazosProductoTerminado = SUM(cob.CONTADOR_RECHAZOS)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA  cob
		INNER JOIN Maquinas m ON m.Id = cob.ID_MAQUINA
		where  ID_PARTICION = @ordenId AND m.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA') and SHC_WORK_SCHED_DAY_PK > 0
				
		SELECT @Picos = COALESCE(SUM(Cantidad),0), @PicosPalets = COUNT(IdParticion)
		FROM dbo.Picos
		WHERE IdParticion = @ordenId 

		DECLARE @IC as FLOAT;
		DECLARE @Rendimiento as FLOAT;
		DECLARE @OEE as FLOAT;
		SET @IC = dbo.MES_GetICParticion(@ordenId);
		SET @Rendimiento = dbo.MES_GetRendimientoParticion(@ordenId);
		SET @OEE = dbo.MES_GetOEEParticion(@ordenId);

		DECLARE @NOCONFORMIDAD AS INT;
		DECLARE @NOCONFORMIDADPALETS AS INT;
		SELECT @NOCONFORMIDAD = SUM(CANTIDAD_ENVASES), @NOCONFORMIDADPALETS = COUNT(ID_PARTICION)
		FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
		WHERE ID_PARTICION = @ordenId 

		SELECT  COALESCE(ConsolidacionEtiquetadoraPalets.PaletsETQProducidos,0) AS PaletsETQProducidos,
				Particion.FecFinReal AS FechaFin
				,COALESCE(PaletsProducidos,0) AS PaletsProducidos			
				,COALESCE(EnvasesProducidos,0) AS EnvasesProducidos
				,COALESCE(@RechazosInspectorSalidaLlenadora,0) AS RechazosLlenadora
				--,COALESCE(@RechazoslLle + @RechazosInspectorSalidaLlenadora,0) AS RechazosLlenadora
				,COALESCE(@RechazosClasificadores,0) AS RechazosClasificadores
				,COALESCE(@RechazosProductoTerminado,0) AS RechazosProductoTerminado
				,COALESCE(@RechazosInspectorBotellasVacias,0) AS RechazosInspectorBotellasVacias
				,COALESCE(@OEE, 0)  as OEE
				--,COALESCE(TotalEnvases/NULLIF(TiempoPaletera,0) , 0) as VelocidadRealMedia
				,COALESCE(Particion.VelocidadNominal, 0) AS VelocidadNominal
				,COALESCE(TiempoPlanificadoPaletera, 0) AS TiempoPlanificadoPaletera
				,COALESCE(TiempoPlanificadoLlenadora, 0) AS TiempoPlanificadoLlenadora
				,COALESCE(ConsolidacionEncajonadora.CajasProducidas, 0) CajasProducidas
				,COALESCE(@Picos,0) AS PicosCajas
				,Particion.CausaPausa
				,ConsolidacionLle.HoraFinEnvases
				,ConsolidacionPalet.HoraFinPalets
				,ConsolidacionEncajonadora.HoraFinCajas
				,COALESCE(@IC,0) as IC
				,COALESCE(@PicosPalets,0) as PicosPalets
				,COALESCE(@NOCONFORMIDAD,0) AS EnvNoConformidad
				,COALESCE(@Rendimiento * 100,0)  as Rendimiento
				,COALESCE(@NOCONFORMIDADPALETS,0) AS EnvNoConformidadPalets
		FROM [MES_MSM].[dbo].[Particiones] AS Particion 
		LEFT JOIN (SELECT 
					ID_PARTICION as IdParticion
					,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as EnvasesProducidos
					,COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) as TiempoPlanificadoLlenadora
					,MAX(FECHA_FIN) AS HoraFinEnvases
			FROM COB_MSM_PROD_LLENADORA_HORA  
			WHERE ID_PARTICION = @ordenId and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_PARTICION
			) AS ConsolidacionLle ON ConsolidacionLle.IdParticion = Particion.Id
		LEFT JOIN 
			(SELECT ID_PARTICION as IdParticion,	
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as PaletsProducidos,
					COALESCE(SUM([TIEMPO_PLANIFICADO]), 0) as TiempoPlanificadoPaletera
					,MAX(FECHA_FIN) AS HoraFinPalets
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @ordenId AND ML.IdClase = @ID_CLASE_PALETIZADORA and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_PARTICION
			) AS ConsolidacionPalet 
		ON ConsolidacionPalet.IdParticion = Particion.Id
		LEFT JOIN
			(SELECT ID_PARTICION as IdParticion,	
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as CajasProducidas
					,MAX(FECHA_FIN) AS HoraFinCajas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @ordenId AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA) and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_PARTICION
			) AS ConsolidacionEncajonadora 
		ON ConsolidacionEncajonadora.IdParticion = Particion.Id
		LEFT JOIN
			(SELECT ID_PARTICION as IdParticion,	
					COALESCE(SUM([CONTADOR_PRODUCCION]), 0) as PaletsETQProducidos
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @ordenId AND ML.IdClase = @ID_CLASE_ETIQUETADORA and SHC_WORK_SCHED_DAY_PK > 0
			GROUP BY ID_PARTICION
			) AS ConsolidacionEtiquetadoraPalets
		ON ConsolidacionEtiquetadoraPalets.IdParticion = Particion.Id
		WHERE Particion.Id = @ordenId
	
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionParticionTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionParticionTurno]
	-- Add the parameters for the stored procedure here
	@particionId nvarchar(4000)
	
AS
BEGIN
		-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		DECLARE @ID_CLASE_PALETIZADORA AS INT;
		DECLARE @ID_CLASE_ENCAJONADORA AS INT;
		DECLARE @ID_CLASE_EMPAQUETADORA AS INT;
		DECLARE @ID_CLASE_ETIQUETADORA AS INT;

		SELECT DISTINCT @ID_CLASE_ETIQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ETIQUETADORA_PALETS'
		SELECT DISTINCT @ID_CLASE_ENCAJONADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ENCAJONADORA'

		SELECT DISTINCT @ID_CLASE_EMPAQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'EMPAQUETADORA'

		
		SELECT DISTINCT @ID_CLASE_PALETIZADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'PALETIZADORA'

	SELECT DISTINCT ID_PARTICION AS IdParticion, SHC_WORK_SCHED_DAY_PK AS IdTurno
	INTO #OrdenesTurno
	FROM 
	(SELECT DISTINCT ID_PARTICION, SHC_WORK_SCHED_DAY_PK
	FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL
	WHERE ID_PARTICION = @particionId AND SHC_WORK_SCHED_DAY_PK > 0
	UNION 
	SELECT DISTINCT ID_PARTICION, SHC_WORK_SCHED_DAY_PK
	FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA PR
	INNER JOIN Maquinas m on m.Id = PR.ID_MAQUINA AND m.IdClase IN (@ID_CLASE_ETIQUETADORA,@ID_CLASE_ENCAJONADORA,@ID_CLASE_EMPAQUETADORA,@ID_CLASE_PALETIZADORA)
	WHERE ID_PARTICION = @particionId AND SHC_WORK_SCHED_DAY_PK > 0
	) AS P

	SELECT
		Turnos.Id
		,Turnos.IdTipoTurno
		,COALESCE(TiposTurno.Nombre, (SELECT
				Nombre
			FROM TiposTurno
			WHERE Id = ConsolidacionLle.IdTurno)
		) TipoTurno--TiposTurno.Nombre as TipoTurno
		,COALESCE(NULLIF(Turnos.InicioTurno, CAST('' AS DATETIME)), (SELECT
				MIN(FECHA_INICIO)
			FROM COB_MSM_PROD_LLENADORA_HORA
			WHERE ID_PARTICION = @particionId
			AND SHC_WORK_SCHED_DAY_PK = OrdenesTurno.IdTurno),(SELECT
				MIN(FECHA_INICIO)
			FROM COB_MSM_PROD_RESTO_MAQ_HORA
			WHERE ID_PARTICION = @particionId
			AND SHC_WORK_SCHED_DAY_PK = OrdenesTurno.IdTurno)
		) AS Fecha--Turnos.InicioTurno as Fecha
		,COALESCE(TotalPalets, 0) AS TotalPalets
		,COALESCE(TotalEnvases, 0) AS TotalEnvases
		,COALESCE(Disponibilidad, 0) AS Disponibilidad
		,COALESCE(Eficiencia, 0) AS Eficiencia
		,COALESCE(OEE, 0) AS OEE
		,ISNULL(RechazosSalidaLlenadora,0) AS RechazosLlenadora
		,ISNULL(RechazosClasificadores,0) AS RechazosClasificadores
		,ISNULL(RechazosProductoTerminado,0) AS RechazosProductoTerminado
		,ISNULL(RechazosInspectorBotellasVacias,0) AS RechazosInspectorBotellasVacias
		,COALESCE(ConsolidacionEncajonadora.TotalCajas, 0) AS TotalCajas
		,COALESCE(ConsolidacionEtiquetadoraPalets.TotalPaletsEtiquetadora, 0) AS TotalPaletsEtiquetadora
		,CASE 
			WHEN FechasWOActivaIni.FechaInicioWOActiva = FechasWOActivaFin.FechaFinWOActiva THEN Turnos.InicioTurno
			ELSE ISNULL(FechasWOActivaIni.FechaInicioWOActiva, Turnos.InicioTurno)
		END AS FechaInicioWOActiva
		,ISNULL(FechasWOActivaFin.FechaFinWOActiva,Turnos.FinTurno) AS FechaFinWOActiva
		,ISNULL(DATEDIFF(SECOND, Turnos.InicioTurno, Turnos.FinTurno),0) - ISNULL(breakTurnos.SecondsBreak,0) AS SecondsTurno 
	FROM #OrdenesTurno AS OrdenesTurno
	LEFT JOIN (SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) AS TotalEnvases
			,0 AS Disponibilidad
			,0 AS Eficiencia
			,0 AS OEE
			--,COALESCE(SUM([TIEMPO_OPERATIVO]) / NULLIF(SUM([TIEMPO_PLANIFICADO]), 0), 0) * 100 AS Disponibilidad
			--,COALESCE(SUM([TIEMPO_NETO]) / NULLIF(SUM([TIEMPO_OPERATIVO]), 0), 0) * 100 AS Eficiencia
			--,(COALESCE(SUM([TIEMPO_OPERATIVO]) / NULLIF(SUM([TIEMPO_PLANIFICADO]), 0), 0) * COALESCE(SUM([TIEMPO_NETO]) / NULLIF(SUM([TIEMPO_OPERATIVO]), 0), 0) * 1.0) * 100.0 AS OEE
		FROM COB_MSM_PROD_LLENADORA_HORA
		WHERE ID_PARTICION = @particionId
		GROUP BY [SHC_WORK_SCHED_DAY_PK]) AS ConsolidacionLle ON ConsolidacionLle.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN (SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) AS TotalPalets
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
		LEFT JOIN MaquinasLineas AS ML
			ON ML.Id = Consolidacion.ID_MAQUINA
		WHERE Consolidacion.ID_PARTICION = @particionId
		AND ML.IdClase = @ID_CLASE_PALETIZADORA
		GROUP BY [SHC_WORK_SCHED_DAY_PK]) AS ConsolidacionPalet
		ON OrdenesTurno.IdTurno = ConsolidacionPalet.IdTurno
	LEFT JOIN
			(SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalCajas
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML ON ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @particionId	AND ML.IdClase IN (@ID_CLASE_ENCAJONADORA, @ID_CLASE_EMPAQUETADORA)
			GROUP BY [SHC_WORK_SCHED_DAY_PK]
			) AS ConsolidacionEncajonadora 
		ON ConsolidacionEncajonadora.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN
			(SELECT
			[SHC_WORK_SCHED_DAY_PK] AS IdTurno
			,COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalPaletsEtiquetadora
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML ON ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @particionId	AND ML.IdClase = @ID_CLASE_ETIQUETADORA
			GROUP BY [SHC_WORK_SCHED_DAY_PK]
			) AS ConsolidacionEtiquetadoraPalets
		ON ConsolidacionEtiquetadoraPalets.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN Turnos
		ON Turnos.Id = OrdenesTurno.IdTurno
	LEFT JOIN (SELECT 
					breakT.shc_work_sched_day_pk as IdTurno,
					DATEDIFF(SECOND, breakT.break_start, breakT.break_end) AS SecondsBreak
			   FROM [SITMesDB].[dbo].[SHC_WORK_SCHED_BREAK] breakT) 
			   AS breakTurnos ON Turnos.Id = breakTurnos.IdTurno
	LEFT JOIN TiposTurno
		ON TiposTurno.Id = Turnos.IdTipoTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosClasificadores
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_PARTICION = @particionId
				AND ML.Clase = 'CLASIFICADOR'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosClasificadores ON OrdenesTurno.IdTurno = ConsolidacionRechazosClasificadores.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosInspectorBotellasVacias
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_PARTICION = @particionId
				AND ML.Clase = 'INSPECTOR_BOTELLAS_VACIAS'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosInspectorBotellasVacias ON OrdenesTurno.IdTurno = ConsolidacionRechazosInspectorBotellasVacias.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosSalidaLlenadora
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_PARTICION = @particionId
				AND ML.Clase = 'INSPECTOR_SALIDA_LLENADORA'
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosSalidaLlenadora ON OrdenesTurno.IdTurno = ConsolidacionRechazosSalidaLlenadora.IdTurno
	LEFT JOIN (
				SELECT
					[SHC_WORK_SCHED_DAY_PK] AS IdTurno
					,COALESCE(SUM(Consolidacion.[CONTADOR_RECHAZOS]), 0) AS RechazosProductoTerminado
				FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
				LEFT JOIN MaquinasLineas AS ML
					ON ML.Id = Consolidacion.ID_MAQUINA
				WHERE Consolidacion.ID_PARTICION = @particionId
				AND ML.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA')
				GROUP BY [SHC_WORK_SCHED_DAY_PK]
				) AS ConsolidacionRechazosProductoTerminado ON OrdenesTurno.IdTurno = ConsolidacionRechazosProductoTerminado.IdTurno
	LEFT JOIN(SELECT 
					Turnos.Id as IdTurno, MIN(FECHA_CAMBIO) AS FechaInicioWOActiva
				FROM COB_MSM_HISTORICO_ORDENES h
				inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
				inner join Particiones p on p.Id = h.ORDER_ID 
				inner join Turnos on h.FECHA_CAMBIO BETWEEN Turnos.InicioTurno AND Turnos.FinTurno AND Turnos.Linea = p.Linea
				where ORDER_ID=@particionId AND EstadosOrden.Estado IN ('Iniciando')
				GROUP BY Turnos.Id
			) AS FechasWOActivaIni ON FechasWOActivaIni.IdTurno = OrdenesTurno.IdTurno
	LEFT JOIN(SELECT 
					Turnos.Id as IdTurno, MAX(FECHA_CAMBIO) AS FechaFinWOActiva
				FROM COB_MSM_HISTORICO_ORDENES h
				inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
				inner join Particiones p on p.Id = h.ORDER_ID 
				inner join Turnos on h.FECHA_CAMBIO BETWEEN Turnos.InicioTurno AND Turnos.FinTurno AND Turnos.Linea = p.Linea
				where ORDER_ID=@particionId AND EstadosOrden.Estado IN ('Pausada','Finalizada')
				GROUP BY Turnos.Id
			) AS FechasWOActivaFin ON FechasWOActivaFin.IdTurno = OrdenesTurno.IdTurno
	ORDER BY Fecha ASC

	DROP TABLE #OrdenesTurno
	COMMIT TRANSACTION;

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Sergio V.
-- Create date: 22/09/2017
-- Description:	IMPORTANTE! El coste de la consulta esta en conseguir el NUM_ARRANQUES y NUM_CAMBIOS
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionTurno]
	@numLinea int,
	@diaIni  DATE,
	@diaFin DATE
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	DECLARE @defaultOEECritico as real;
	DECLARE @defaultOEEObjetivo as real;
	DECLARE @numMaquinasLinea as int;
	declare @lineaPath as nvarchar(100)
	--obtenemos horas de inicios turnos
	declare @iniM as integer
	declare @iniT as integer
	declare @iniN as integer

	select @iniM =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 1;
	select @iniT =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 2;
	select @iniN =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 3;
	--obtenemos los valores por defecto del oeeCritico y objetivo
	select @defaultOEECritico = VALOR_FLOAT
	from ParametrosPlanta_admin pl 
	where pl.IdLinea = @numLinea AND IdParametro = 13

   --obtenemos los valores por defecto del oeeCritico y objetivo
	select  @defaultOEEObjetivo= VALOR_FLOAT
	from ParametrosPlanta_admin pl
	where PL.IdLinea = @numLinea and IdParametro = 12

	select @lineaPath=l.Id from dbo.Lineas l where l.NumeroLinea = @numLinea
	--------
	SELECT distinct dbo.getDiaTurnoBydateV2(SCH.work_start, @iniM) DIA_TURNO,  SCH.shc_work_sched_day_pk AS SHC_ID, REPLACE(LN.id, 'SHC_', '') AS LINEA, 
			 isNull(COBT.OEE_CRITICO, @defaultOEECritico) OEE_CRITICO, isNull(COBT.OEE_OBJETIVO,@defaultOEEObjetivo) OEE_OBJETIVO,
				SCH.work_start AS INICIO_SHC, SCH.work_end AS FIN_SHC, BR.break_start INICIO_BREAK, BR.break_end FIN_BREAK,		
				(DATEDIFF(minute, SCH.work_start, SCH.work_end)/60.0) - coalesce(DATEDIFF(minute, BR.break_start, BR.break_end)/60.0,0) as DURACION,
				ISNULL(SCH.shc_shift_id, 0) AS TIPO_TURNO, wt.label AS TIPO_TURNO_DESC,
				(CASE when COBT.OEE_CRITICO is null then -1 ELSE 1 END) FLAG_NO_CONSOL_TURNO, COBT.IC
			
	INTO #diasSHC
	FROM          SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS SCH left outer JOIN
                         SITMesDB.dbo.SHC_WORK_SCHED AS LN ON SCH.shc_work_sched_pk = LN.shc_work_sched_pk INNER JOIN
                         SITMesDB.dbo.SHC_WORKING_TIME WT ON WT.ID = ISNULL(SCH.shc_shift_id, 0) left outer JOIN
						 SITMesDB.dbo.SHC_WORK_SCHED_BREAK BR ON BR.shc_work_sched_day_pk = SCH.shc_work_sched_day_pk  left outer join 
						 COB_MSM_CONSOLIDADO_TURNO AS COBT ON dbo.getDiaTurnoBydateV2(SCH.work_start,@iniM) = COBT.FECHA AND @lineaPath = COBT.LINEA AND ISNULL(SCH.shc_shift_id, 0) = COBT.IDTIPOTURNO and COBT.SHC_WORK_SCHED_DAY_PK<>0
	where SCH.shc_shift_id <> 0 and REPLACE(LN.id, 'SHC_', '') = @lineaPath and  dbo.getDiaTurnoBydateV2(SCH.work_start,@iniM) between @diaIni and @diaFin
	and  dateadd(hour, dbo.getTurnoByHourv2(SCH.work_start,@iniM,@iniT,@iniN) * 8 + @iniM, SCH.work_date) < getDate() -- para que no aparezca el turno actual
	--obtenemos el número de máquinas que tienen que tener registros
	select @numMaquinasLinea = count(id) from MAQUINASLINEASPLANCONTI where NumLinea = @numLinea
	---
	SELECT *
	into #Consolidados		
	FROM (
		SELECT 
			dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) as DIA_TURNO, 
			datediff(hour, FECHA_INICIO, FECHA_FIN) AS DURACION,  
			dbo.getTurnoByHourv2(FECHA_INICIO,@iniM,@iniT,@iniN) AS TIPO_TURNO, 
			ML.NumLinea, 
			PLL.ID_MAQUINA, 
			'PROD_' + CLASE AS PROD_CLASE, 		
			'RECH_' + CLASE AS RECH_CLASE, 
			PLL.FECHA_INICIO, PLL.FECHA_FIN, PLL.HORA, PLL.ID_ORDEN, PLL.ID_PARTICION,
		 isnull(PLL.SHC_WORK_SCHED_DAY_PK,0) SHC_WORK_SCHED_DAY_PK,
		  (case when SHC_WORK_SCHED_DAY_PK > 0 then isnull(PLL.CONTADOR_PRODUCCION,0) else 0 end) CONTADOR_PRODUCCION,
		   (CASE when SHC_WORK_SCHED_DAY_PK > 0 then isnull(CONTADOR_RECHAZOS,0) ELSE 0 END) CONTADOR_RECHAZOS,  
		  (CASE when SHC_WORK_SCHED_DAY_PK > 0 then isnull(TIEMPO_PLANIFICADO,0) ELSE 0 END) TIEMPO_PLANIFICADO, 
		    (CASE when SHC_WORK_SCHED_DAY_PK > 0 then isnull(VELOCIDAD_NOMINAL,0) ELSE 0 END) VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL LEFT JOIN MAQUINASLINEASPLANCONTI AS ML
					ON ML.Id = PLL.ID_MAQUINA
		WHERE 
		NumLinea = @numLinea
		AND dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) BETWEEN @diaIni AND @diaFin
		---
		union
		--- TIEMPO PLANIFICADO Y VEL. NOMINAL LOS PONEMOS A 0 PARA QUE CALCULEN ENVASES TEORICOS
		SELECT dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) as DIA_TURNO, datediff(hour, FECHA_INICIO, FECHA_FIN) AS DURACION, dbo.getTurnoByHourv2(FECHA_INICIO,@iniM,@iniT,@iniN) AS TIPO_TURNO, ML.NumLinea, ID_MAQUINA, 
		'PROD_' + CLASE AS PROD_CLASE, 		
		'RECH_' + CLASE AS RECH_CLASE, FECHA_INICIO, FECHA_FIN, HORA, ID_ORDEN, ID_PARTICION,isnull(SHC_WORK_SCHED_DAY_PK,0) SHC_WORK_SCHED_DAY_PK, 
		(case when SHC_WORK_SCHED_DAY_PK > 0 then isnull(CONTADOR_PRODUCCION,0) else 0 end) CONTADOR_PRODUCCION, 
		(CASE when SHC_WORK_SCHED_DAY_PK > 0 then isnull(CONTADOR_RECHAZOS,0) ELSE 0 END) CONTADOR_RECHAZOS,    
		 0 AS TIEMPO_PLANIFICADO, 0 AS VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA RM LEFT JOIN MAQUINASLINEASPLANCONTI AS ML
					ON ML.Id = RM.ID_MAQUINA
		WHERE 
		NumLinea = @numLinea 
		AND dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) BETWEEN @diaIni AND @diaFin
		
	) AS MAQUINAS
	--Obtenemos todos los registros de todas las maquinas y pivotamos para tener los contadores en columnas
	PIVOT(
	 SUM(CONTADOR_PRODUCCION )
	 FOR PROD_CLASE IN ([PROD_DESPALETIZADORA], [PROD_LLENADORA], [PROD_EMPAQUETADORA],
	 -- Miguel Angel Suero - 28/12/2017 inclusion de la encajonadora como empaquetadora
	 [PROD_ENCAJONADORA],
	 -- Fin Cambiio	 
	 [PROD_PALETIZADORA],[PROD_ETIQUETADORA_PALETS]) ) AS TABLAPIVOTE --CONSEGUIMOS CONTADORES PRODUCIDOS COMO COLUMNA MAQUINA/CONTADOR
	PIVOT(
	 SUM(CONTADOR_RECHAZOS)
	 FOR RECH_CLASE IN ([RECH_CLASIFICADOR], [RECH_INSPECTOR_BOTELLAS_VACIAS], [RECH_LLENADORA], [RECH_INSPECTOR_SALIDA_LLENADORA], [RECH_INSPECTOR_BOTELLAS_LLENAS], [RECH_BASCULA]) ) AS TABLAPIVOTE2 --CONSEGUIMOS CONTADORES PRODUCIDOS COMO COLUMNA MAQUINA/RECHAZOS
	
	order by DIA_TURNO desc


---- QUERY PARA AGREGADOS NIVEL 1 TURNO ----
	select TURNO.DIA_TURNO, TURNO.TIPO_TURNO, TURNO.DURACION DURACION, turno.INICIO_SHC AS FECHA_INICIO, turno.FIN_SHC AS FECHA_FIN,
	--INICIO , FIN, NUM ARRANQUES Y CAMBIOS
		--MIN(FECHA_INICIO) AS FECHA_INICIO, MAX(FECHA_FIN) AS FECHA_FIN,		
		(SELECT COUNT(TipoTurnoId) FROM DBO.[OrdenesArranque] WHERE LINEA = @numLinea and FechaTurno = TURNO.DIA_TURNO AND TipoTurnoId = TURNO.TIPO_TURNO) N_ARRANQUES,
		(SELECT COUNT(TipoTurnoId) FROM DBO.[OrdenesCambio] WHERE LINEA = @numLinea and FechaTurno = TURNO.DIA_TURNO AND TipoTurnoId = TURNO.TIPO_TURNO) N_CAMBIOS,
	--SHC
		MAX(TURNO.SHC_ID) SHC_ID, MAX(c.SHC_WORK_SCHED_DAY_PK) SHC_MAX, MIN(c.SHC_WORK_SCHED_DAY_PK) SHC_MIN, 
	--CONTADORES PROD
		coalesce(SUM([PROD_DESPALETIZADORA]),0) [PROD_DESPALETIZADORA], coalesce(SUM([PROD_LLENADORA]),0) [PROD_LLENADORA], 
		coalesce(SUM([PROD_ENCAJONADORA]),0) [PROD_ENCAJONADORA], 
		 -- Miguel Angel Suero - 28/12/2017 inclusion de la encajonadora como empaquetadora
		coalesce(SUM([PROD_EMPAQUETADORA]),0) [PROD_EMPAQUETADORA], 
		-- Fin Cambiio	 
		coalesce(SUM([PROD_PALETIZADORA]),0) [PROD_PALETIZADORA], coalesce(SUM([PROD_ETIQUETADORA_PALETS]),0) [PROD_ETIQUETADORA_PALETS],
	--RECHAZOS
		coalesce(SUM([RECH_CLASIFICADOR]) ,0)[RECH_CLASIFICADOR], coalesce(SUM([RECH_INSPECTOR_BOTELLAS_VACIAS]),0) [RECH_INSPECTOR_BOTELLAS_VACIAS], 
		coalesce(SUM([RECH_LLENADORA]),0) [RECH_LLENADORA], coalesce(SUM([RECH_INSPECTOR_SALIDA_LLENADORA]),0) [RECH_INSPECTOR_SALIDA_LLENADORA], 
		coalesce(SUM([RECH_INSPECTOR_BOTELLAS_LLENAS]) ,0) [RECH_INSPECTOR_BOTELLAS_LLENAS], 
		coalesce(SUM([RECH_BASCULA]),0) [RECH_BASCULA],
	--ENVASES TEORICOS
		coalesce(SUM(VELOCIDAD_NOMINAL),0) AS ENVASES_TEORICOS,
		coalesce(MAX(TURNO.OEE_CRITICO), @defaultOEECritico) as OEE_CRITICO,
		coalesce(MAX(TURNO.OEE_OBJETIVO), @defaultOEEObjetivo) as OEE_OBJETIVO,
	--FLAGS,  
		--[PROD_DESPALETIZADORA]+[PROD_LLENADORA]+[PROD_EMPAQUETADORA]+[PROD_PALETIZADORA]+
		--[]+[]+[]+[]+[]
		SUM(case when C.SHC_WORK_SCHED_DAY_PK > 0 then 0 else 1 end) FLAG_NREG_NO_SHC, --NUM REGISTROS SIN SHC
		SUM(case when ( ID_ORDEN = '' and (isnull(PROD_DESPALETIZADORA,0)+isnull(PROD_LLENADORA,0)+isnull(PROD_EMPAQUETADORA,0)
		+isnull(PROD_PALETIZADORA,0)+isnull(PROD_ETIQUETADORA_PALETS,0)+isnull(RECH_INSPECTOR_BOTELLAS_LLENAS,0)+isnull(RECH_INSPECTOR_SALIDA_LLENADORA,0)+isnull(RECH_LLENADORA,0)+isnull(RECH_BASCULA,0)) >0 )THEN 1 ELSE 0 END) FLAG_NREG_NO_ORD, --NUM REGISTROS SIN ORD y QUE TIENE PRODUCIDOS Y RECHAZOS LLENOS
		MIN(FLAG_NO_CONSOL_TURNO) FLAG_NO_CONSOL_TURNO,
		--COUNT(DIA_TURNO)/COUNT(DISTINCT ID_MAQUINA) N_REGISTROS,
		--coalesce(SUM(DURACION)/COUNT(DISTINCT ID_MAQUINA),0) AS HORAS_REGISTROS,
		--COUNT(DISTINCT ID_MAQUINA) N_MAQUINAS, 
		coalesce(SUM(C.DURACION)/@numMaquinasLinea,0) AS HORAS_REGISTROS,
		@numMaquinasLinea N_MAQUINAS,
		COUNT(DISTINCT C.SHC_WORK_SCHED_DAY_PK) N_SHCs,
		COALESCE(turno.IC,1) as IC
	--
	from #diasSHC turno left outer join 
	#Consolidados C on c.DIA_TURNO = turno.DIA_TURNO and C.TIPO_TURNO = turno.TIPO_TURNO 
	
	group by TURNO.DIA_TURNO, TURNO.TIPO_TURNO, TURNO.DURACION, TURNO.INICIO_SHC, TURNO.FIN_SHC, TURNO.IC
	ORDER BY DIA_TURNO DESC, TIPO_TURNO desc

	DROP TABLE #Consolidados
	DROP TABLE #diasSHC
	COMMIT TRANSACTION;

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionTurnoMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Sergio V.
-- Create date: 22/09/2017
-- Description:
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionTurnoMaquina]
	@maquinaID nvarchar(100),
	@fechaTurno DATE,
	@tipoTurno int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	declare @clase nvarchar(50)
	declare @numLinea int 
	--obtenemos horas de inicios turnos
	declare @iniM as integer
	declare @iniT as integer
	declare @iniN as integer

	select @iniM =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 1;
	select @iniT =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 2;
	select @iniN =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 3;

	select @clase = CLASE, @numLinea = NumLinea  from MaquinasLineas where Id = @maquinaID
	IF (@clase = 'LLENADORA') BEGIN

		SELECT concat('$', [$IdArchObj] ,'#',[$IDArchiveValue]) PK,  @numLinea NUM_LINEA, @clase as CLASE, prod.IdProducto AS ID_PRODUCTO,  prod.Descripcion as DESCRIP_PROD, FECHA_INICIO,  FECHA_FIN, HORA, datediff(minute,FECHA_INICIO, FECHA_FIN)/60.0 DURACION, ID_ORDEN, ID_PARTICION, SHC_WORK_SCHED_DAY_PK, CONTADOR_PRODUCCION, CONTADOR_PRODUCCION_AUTO, CONTADOR_RECHAZOS, CONTADOR_RECHAZOS_AUTO, TIEMPO_PLANIFICADO, VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA LEFT JOIN dbo.ordenes AS ORD ON ID_ORDEN = ORD.Id LEFT JOIN dbo.productos as PROD on ord.IdProducto = PROD.IdProducto 
		WHERE 
			ID_MAQUINA = @maquinaID
		and dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) = @fechaTurno
		AND dbo.getTurnoByHourV2(FECHA_INICIO,@iniM, @iniT,@iniN) = @tipoTurno
		order by FECHA_INICIO asc
		
	end else begin
		
		SELECT  concat('$', [$IdArchObj] ,'#',[$IDArchiveValue]) PK, @numLinea NUM_LINEA, @clase as CLASE, prod.IdProducto AS ID_PRODUCTO, prod.Descripcion as DESCRIP_PROD, FECHA_INICIO, FECHA_FIN, HORA, datediff(minute,FECHA_INICIO, FECHA_FIN)/60.0 DURACION, ID_ORDEN, ID_PARTICION, SHC_WORK_SCHED_DAY_PK, CONTADOR_PRODUCCION, CONTADOR_PRODUCCION_AUTO, CONTADOR_RECHAZOS, CONTADOR_RECHAZOS_AUTO,   TIEMPO_PLANIFICADO, VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA RM LEFT JOIN dbo.ordenes AS ORD ON ID_ORDEN = ORD.Id LEFT JOIN dbo.productos as PROD on ord.IdProducto = PROD.IdProducto 
		WHERE 
			ID_MAQUINA = @maquinaID
		and dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) = @fechaTurno
		AND dbo.getTurnoByHourV2(FECHA_INICIO,@iniM, @iniT,@iniN) = @tipoTurno
		order by FECHA_INICIO asc

	end 

	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosProduccionTurnoOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Sergio V.
-- Create date: 22/09/2017
-- Description:	IMPORTANTE! Se podría mejorar si directamente hacemos en la tabla #consolidados el where con el @turnoID y @fechaTurno, no se hace de esta forma
--			para homogenizar con el nivel agregado superior y en un futuro poner los consolidados en una vista.
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosProduccionTurnoOrden]
	@numLinea int,
	@fechaTurno DATE,
	@tipoTurno int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	--obtenemos horas de inicios turnos
	declare @iniM as integer
	declare @iniT as integer
	declare @iniN as integer

	select @iniM =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 1;
	select @iniT =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 2;
	select @iniN =  datepart(hour, dateadd(minute, -bias, inicio)) from dbo.tiposTurno where id = 3;
	

	SELECT *
	into #Consolidados		
	FROM (
		SELECT dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) as DIA_TURNO, dbo.getTurnoByHourV2(FECHA_INICIO,@iniM, @iniT,@iniN) AS TIPO_TURNO, ML.NumLinea, PLL.ID_MAQUINA, 
		'PROD_' + CLASE AS PROD_CLASE, 		
		'RECH_' + CLASE AS RECH_CLASE, PLL.FECHA_INICIO, PLL.FECHA_FIN, PLL.HORA, PLL.ID_ORDEN, PLL.ID_PARTICION, PLL.SHC_WORK_SCHED_DAY_PK, PLL.CONTADOR_PRODUCCION, PLL.CONTADOR_RECHAZOS, TIEMPO_PLANIFICADO, VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL LEFT JOIN MaquinasLineasPlanConti AS ML
					ON ML.Id = PLL.ID_MAQUINA
		WHERE 
		NumLinea = @numLinea AND SHC_WORK_SCHED_DAY_PK > 0
		AND dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) = @fechaTurno
		AND dbo.getTurnoByHourV2(FECHA_INICIO, @iniM, @iniT,@iniN) = @tipoTurno
		---
		union
		--- TIEMPO PLANIFICADO Y VEL. NOMINAL LOS PONEMOS A 0 PARA QUE CALCULEN ENVASES TEORICOS
		SELECT dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) as DIA_TURNO, dbo.getTurnoByHourV2(FECHA_INICIO,@iniM, @iniT,@iniN) AS TIPO_TURNO, ML.NumLinea, ID_MAQUINA, 
		'PROD_' + CLASE AS PROD_CLASE, 		
		'RECH_' + CLASE AS RECH_CLASE, FECHA_INICIO, FECHA_FIN, HORA, ID_ORDEN, ID_PARTICION, SHC_WORK_SCHED_DAY_PK, CONTADOR_PRODUCCION, CONTADOR_RECHAZOS,   0 AS TIEMPO_PLANIFICADO, 0 AS VELOCIDAD_NOMINAL
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA RM LEFT JOIN MaquinasLineasPlanConti AS ML
					ON ML.Id = RM.ID_MAQUINA
		WHERE 
		NumLinea = @numLinea AND SHC_WORK_SCHED_DAY_PK > 0
		AND dbo.getDiaTurnoBydateV2(FECHA_INICIO,@iniM) = @fechaTurno
		AND dbo.getTurnoByHourV2(FECHA_INICIO,@iniM, @iniT,@iniN) = @tipoTurno
		
	) AS MAQUINAS
	--Obtenemos todos los registros de todas las maquinas y pivotamos para tener los contadores en columnas
	PIVOT(
	 SUM(CONTADOR_PRODUCCION)
	 FOR PROD_CLASE IN ([PROD_DESPALETIZADORA], [PROD_LLENADORA], [PROD_EMPAQUETADORA],
	  -- Miguel Angel Suero - 28/12/2017 inclusion de la encajonadora como empaquetadora
	 [PROD_ENCAJONADORA],
	 -- Fin Cambiio	 
	 [PROD_PALETIZADORA],[PROD_ETIQUETADORA_PALETS]) ) AS TABLAPIVOTE --CONSEGUIMOS CONTADORES PRODUCIDOS COMO COLUMNA MAQUINA/CONTADOR
	PIVOT(
	 SUM(CONTADOR_RECHAZOS)
	 FOR RECH_CLASE IN ([RECH_CLASIFICADOR], [RECH_INSPECTOR_BOTELLAS_VACIAS], [RECH_LLENADORA], [RECH_INSPECTOR_SALIDA_LLENADORA], [RECH_INSPECTOR_BOTELLAS_LLENAS], [RECH_BASCULA]) ) AS TABLAPIVOTE2 --CONSEGUIMOS CONTADORES PRODUCIDOS COMO COLUMNA MAQUINA/RECHAZOS
	
	order by DIA_TURNO desc

	------ QUERY PARA AGREGADOS NIVEL 2 TURNO / ORDEN----
	select DIA_TURNO, TIPO_TURNO, ID_ORDEN, MIN(ORD.IdProducto) AS ID_PRODUCTO, MAX(PROD.Descripcion) AS DESCRIP_PROD, 
	--INICIO , FIN, NÚM CAMBIOS ORDEN, 
		MIN(FECHA_INICIO) AS FECHA_INICIO, MAX(FECHA_FIN) AS FECHA_FIN,
	--SHC
		MAX(SHC_WORK_SCHED_DAY_PK) SHC_MAX, MIN(SHC_WORK_SCHED_DAY_PK) SHC_MIN,
	--CONTADORES PROD
		SUM([PROD_DESPALETIZADORA]) [PROD_DESPALETIZADORA], SUM([PROD_LLENADORA]) [PROD_LLENADORA],
		 -- Miguel Angel Suero - 28/12/2017 inclusion de la encajonadora como empaquetadora
		SUM([PROD_ENCAJONADORA]) [PROD_ENCAJONADORA],		
		-- Fin camnbio
		 SUM([PROD_EMPAQUETADORA]) [PROD_EMPAQUETADORA],SUM([PROD_PALETIZADORA]) [PROD_PALETIZADORA],SUM([PROD_ETIQUETADORA_PALETS]) [PROD_ETIQUETADORA_PALETS],
	--RECHAZOS
		SUM([RECH_CLASIFICADOR]) [RECH_CLASIFICADOR], SUM([RECH_INSPECTOR_BOTELLAS_VACIAS]) [RECH_INSPECTOR_BOTELLAS_VACIAS], SUM([RECH_LLENADORA]) [RECH_LLENADORA], SUM([RECH_INSPECTOR_SALIDA_LLENADORA]) [RECH_INSPECTOR_SALIDA_LLENADORA], SUM([RECH_INSPECTOR_BOTELLAS_LLENAS]) [RECH_INSPECTOR_BOTELLAS_LLENAS], SUM([RECH_BASCULA]) [RECH_BASCULA],
	
	--ENVASES TEORICOS
		SUM(VELOCIDAD_NOMINAL) AS ENVASES_TEORICOS	

		
	from #Consolidados LEFT JOIN dbo.ordenes AS ORD ON ID_ORDEN = ORD.Id LEFT JOIN dbo.productos as PROD on ord.IdProducto = PROD.IdProducto 
	group by DIA_TURNO, TIPO_TURNO, ID_ORDEN
	having SUM(isnull([PROD_DESPALETIZADORA],0) +isnull([PROD_LLENADORA],0) + isnull([PROD_EMPAQUETADORA],0) + isnull([PROD_PALETIZADORA],0) + isnull([PROD_ETIQUETADORA_PALETS],0)  
	-- Miguel Angel Suero - 28/12/2017 inclusion de la encajonadora como empaquetadora
	+ isnull([PROD_ENCAJONADORA],0) + 
	-- Fin cambio
	+isnull([RECH_CLASIFICADOR],0)+isnull([RECH_INSPECTOR_BOTELLAS_VACIAS],0) + isnull([RECH_LLENADORA],0) + isnull([RECH_INSPECTOR_SALIDA_LLENADORA],0) + isnull([RECH_INSPECTOR_BOTELLAS_LLENAS],0) + isnull([RECH_BASCULA],0)) > 0

	DROP TABLE #Consolidados
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosQueries]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosQueries]
	@linea varchar(100),
	@fini bigint,
	@tini int,
	@ffin bigint,
	@tfin int,
	@id smallint
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
	DECLARE @SQL AS VARCHAR(MAX) =''
	

	DECLARE @d DATETIME
	DECLARE @h DATETIME

	if @tini = 0
	  SET @tini = 1

	if @tfin = 0
	  SET @tfin = 3


	if @fini > 0
		SET @fini = DATEDIFF(SECOND, '19700101', CONVERT(DATE, DATEADD(SECOND, @fini + 7200, '1970-01-01')))

	if @ffin > 0
		SET @ffin = DATEDIFF(SECOND, '19700101', CONVERT(DATE, DATEADD(SECOND, @ffin + 7200, '1970-01-01')))

   	DECLARE @FechaInicio DATETIME  
	SET @FechaInicio = dbo.getAntesTurnoInicio(CONVERT(VARCHAR(100), @fini),CONVERT(VARCHAR(100), @tini))
	DECLARE @FechaFin DATETIME  
	SET @FechaFin = dbo.getDespuesTurnoFin(CONVERT(VARCHAR(100), @ffin),CONVERT(VARCHAR(100), @tfin))
	SET @d = DATEADD(s, @fini, '19700101')
	SET @h = DATEADD(s, @ffin, '19700101')

	--IF @fini > 0 AND @ffin>0
	--	SET @condition =  ' AND dbo.getAntesTurnoInicio('+CONVERT(VARCHAR(100), @fini)+','+CONVERT(VARCHAR(100), @tini)+') <= T.InicioTurno AND 
	--						dbo.getDespuesTurnoFin('+CONVERT(VARCHAR(100), @ffin)+','+CONVERT(VARCHAR(100), @tfin)+') >= T.FinTurno  '
 --   ELSE
	--IF @fini = 0 and @ffin >0
	--	SET @condition = ' dbo.getAntesTurnoInicio('+CONVERT(VARCHAR(100), @fini)+','+CONVERT(VARCHAR(100), @tini)+') <= T.InicioTurno  '
	--ELSE
	--IF @FFIN = 0 and @fini>0
	--	SET @condition = ' dbo.getDespuesTurnoFin('+CONVERT(VARCHAR(100), @ffin)+','+CONVERT(VARCHAR(100), @tfin)+') <= T.FinTurno  '
	--ELSE
	--IF @ffin=0 and @fini = 0
	--	SET @condition = ''

	SELECT  Id
	INTO #TEMP_TURNO
	FROM Turnos
	WHERE [Linea] = @Linea AND  @FechaInicio <= InicioTurno 
		AND @FechaFin >= FinTurno 
		AND LOWER(Turno) <> 'nowork'




	IF @ID=4
	BEGIN

/*
	Análisis de paros por causa

*/

SET @SQL = 'Select 
isnull(PP.MotivoNombre,''Motivo no definido'') as ''Motivo_paro'',
isnull(CausaNombre,'''') as ''Causa_paro'',
 count(*) as ''Número_de_paros'',
					replace(convert(numeric(9,2), (sum(DuracionParoMayor)+sum(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),''.'','','')  as ''Total_minutos_paradas'',
					replace(convert(numeric(9,2), (sum(DuracionParoMayor)+sum(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/3600),''.'','','') as ''Total_horas_paradas''
					from dbo.ParosPerdidas PP
					INNER JOIN TURNOS T ON PP.Turno = T.ID
					INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
					WHERE '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
					group by Causanombre,MotivoNombre
					order by Causanombre,MotivoNombre asc'
		END


		IF @ID=5
		BEGIN
/*
Envases producidos por turno
*/

SET @SQL = 'Select ''Linea '' + convert(varchar(100),T.NumeroLinea) + '' - '' + T.Descripcion AS ''Línea'', T.TURNO as Turno, SUM(T.Envases_llenadora) as Envases_llenadora, SUM(T.Palets_Paletizadora) as Palets_Paletizadora, SUM(T.Etiquetas_de_palets) as Etiquetas_de_palets, 
SUM(CONVERT(NUMERIC(18,2),T.CP)) as ''Cajas_Packs'',
convert(numeric(18,0),SUM(T.Tiempo_planificado)/60) as Tiempo_planificado, convert(numeric(18,0),SUM(T.Tiempo_Operativo)/60) as Tiempo_Operativo, convert(numeric(18,0),SUM(T.Tiempo_Neto)/60) as Tiempo_Neto, 
CONVERT(varchar(100),
case 
			when SUM(T.TIEMPO_OPERATIVO) = 0 OR SUM(T.[TIEMPO_PLANIFICADO])=0 then 0
			else convert(numeric(18,2),
					(
						(
							(SUM(T.[TIEMPO_OPERATIVO])/SUM(T.[TIEMPO_PLANIFICADO])) * (SUM(T.[TIEMPO_NETO])/SUM(T.[TIEMPO_OPERATIVO]))
						)
					)*100.0
				)
		end )+ ''%'' AS OEE

 FROM (
				SELECT NumeroLinea, Descripcion,
						convert(varchar(100),convert(date, T.Fecha),105) + '' '' + T.TURNO AS Turno,
				LL.CONTADOR_PRODUCCION as Envases_llenadora, --0 as Envases_paletizadora,
				0 AS Palets_Paletizadora,
				0 AS Etiquetas_de_palets,
				0 AS ''CP'',
				LL.TIEMPO_PLANIFICADO as ''Tiempo_planificado'',
				LL.TIEMPO_OPERATIVO as ''Tiempo_Operativo'', LL.TIEMPO_NETO as ''Tiempo_Neto'',
				case 
				when LL.TIEMPO_OPERATIVO = 0 OR LL.[TIEMPO_PLANIFICADO]=0 then ''0''
				else convert(numeric(18,2),((LL.[TIEMPO_OPERATIVO]/LL.[TIEMPO_PLANIFICADO]) * (LL.[TIEMPO_NETO]/LL.[TIEMPO_OPERATIVO]))*100.0)
				end as OEE
				,1 AS LLENADORA
				FROM [dbo].[COB_MSM_PROD_LLENADORA_HORA] LL
				RIGHT JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE   '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA 

				UNION ALL

				SELECT NumeroLinea, Descripcion,
						convert(varchar(100),convert(date, T.Fecha),105) + '' '' + T.TURNO AS Turno,
				0 as Envases_llenadora, --0 as Envases_paletizadora,
				LL.CONTADOR_PRODUCCION AS Palets_Paletizadora,
				0 AS Etiquetas_de_palets,
				0 AS ''CP'',
				0 as ''Tiempo_planificado'',
				0 as ''Tiempo_Operativo'', 
				0 as ''Tiempo_Neto'',
				0 as OEE --Solo miramos OEE de llenadoras
				,0 AS LLENADORA
				FROM [dbo].COB_MSM_PROD_RESTO_MAQ_HORA LL
				RIGHT JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id  
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE LL.ID_MAQUINA LIKE ''%PAL%'' AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA

				UNION ALL
				
				SELECT NumeroLinea, Descripcion,
						convert(varchar(100),convert(date, T.Fecha),105) + '' '' + T.TURNO AS Turno,
				0 as Envases_llenadora, --0 as Envases_paletizadora,
				0 AS Palets_Paletizadora,
				LL.CONTADOR_PRODUCCION AS Etiquetas_de_palets,
				0 AS ''CP'',
				0 as ''Tiempo_planificado'',
				0 as ''Tiempo_Operativo'', convert(numeric(18,0),LL.TIEMPO_NETO/60) as ''Tiempo_Neto'',
				0 as OEE --Solo miramos OEE de llenadoras
				,0 AS LLENADORA
				FROM [dbo].COB_MSM_PROD_RESTO_MAQ_HORA LL
				INNER JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE LL.ID_MAQUINA LIKE ''%EQP%'' AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA

				UNION ALL
				
				SELECT NumeroLinea, Descripcion,
						convert(varchar(100),convert(date, T.Fecha),105) + '' '' + T.TURNO AS Turno,
				0 as Envases_llenadora, --0 as Envases_paletizadora,
				0 AS Palets_Paletizadora,
				0 as Etiquetas_de_palets,				
				LL.CONTADOR_PRODUCCION AS CP,
				0 as ''Tiempo_planificado'',
				0 as ''Tiempo_Operativo'', 
				0 as ''Tiempo_Neto'',
				0 as OEE --Solo miramos OEE de llenadoras
				,0 AS LLENADORA
				FROM [dbo].COB_MSM_PROD_RESTO_MAQ_HORA LL
				INNER JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE (LL.ID_MAQUINA LIKE ''%EMP%'' OR LL.ID_MAQUINA LIKE ''%ENC%'') AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA

				) T
				GROUP BY T.NumeroLinea, T.Descripcion, T.TURNO
				ORDER BY T.NumeroLinea, T.Descripcion, T.TURNO ASC'

		END
		IF @ID=6
		BEGIN
/*
	Envases producidos por línea
*/

SET @SQL = 'Select ''Linea '' + convert(varchar(100),T.NumeroLinea) + '' - '' + T.Descripcion AS ''Linea'', count(DISTINCT T.TURNO)as Numero_Turnos, SUM(T.Envases_llenadora) as Envases_llenadora, SUM(T.Palets_Paletizadora) as Palets_Paletizadora, SUM(T.Etiquetas_de_palets) as Etiquetas_de_palets,
CONVERT(NUMERIC(18, 0),SUM(T.Tiempo_planificado)/ 60) as Tiempo_planificado, CONVERT(NUMERIC(18, 0),SUM(T.Tiempo_Operativo)/ 60) as Tiempo_Operativo, CONVERT(NUMERIC(18, 0),SUM(T.Tiempo_Neto)/ 60) as Tiempo_Neto, 
CONVERT(varchar(100),
case 
			when SUM(T.TIEMPO_OPERATIVO) = 0 OR SUM(T.[TIEMPO_PLANIFICADO])=0 then 0
			else convert(numeric(18,2),
					(
						(
							(SUM(T.[TIEMPO_OPERATIVO])/SUM(T.[TIEMPO_PLANIFICADO])) * (SUM(T.[TIEMPO_NETO])/SUM(T.[TIEMPO_OPERATIVO]))
						)
					)*100.0
				)
		end )+ ''%'' AS Rendimiento

 FROM (
				SELECT NumeroLinea, Descripcion,
						T.Id  Turno,
				LL.CONTADOR_PRODUCCION as Envases_llenadora, --0 as Envases_paletizadora,
				0 AS Palets_Paletizadora,
				0 AS Etiquetas_de_palets,
				LL.TIEMPO_PLANIFICADO as ''Tiempo_planificado'',
				LL.TIEMPO_OPERATIVO as ''Tiempo_Operativo'', LL.TIEMPO_NETO as ''Tiempo_Neto'',
				case 
				when LL.TIEMPO_OPERATIVO = 0 OR LL.[TIEMPO_PLANIFICADO]=0 then ''0''
				else convert(numeric(18,2),((LL.[TIEMPO_OPERATIVO]/LL.[TIEMPO_PLANIFICADO]) * (LL.[TIEMPO_NETO]/LL.[TIEMPO_OPERATIVO]))*100.0)
				end as OEE
				,1 AS LLENADORA
				FROM [dbo].[COB_MSM_PROD_LLENADORA_HORA] LL
				RIGHT JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE   '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA
				UNION ALL

				SELECT NumeroLinea, Descripcion,
						T.Id  Turno,
				0 as Envases_llenadora, --0 as Envases_paletizadora,
				LL.CONTADOR_PRODUCCION AS Palets_Paletizadora,
				0 AS Etiquetas_de_palets,
				0 as ''Tiempo_planificado'',
				0 as ''Tiempo_Operativo'', 
				0 as ''Tiempo_Neto'',
				0 as OEE --Solo miramos OEE de llenadoras
				,0 AS LLENADORA
				FROM [dbo].COB_MSM_PROD_RESTO_MAQ_HORA LL
				RIGHT JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE LL.ID_MAQUINA LIKE ''%PAL%'' AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA

				UNION ALL
				
				SELECT NumeroLinea, Descripcion,
						T.Id  Turno,
				0 as Envases_llenadora, --0 as Envases_paletizadora,
				0 AS Palets_Paletizadora,
				LL.CONTADOR_PRODUCCION AS Etiquetas_de_palets,
				0 as ''Tiempo_planificado'',
				0 as ''Tiempo_Operativo'', convert(numeric(18,0),LL.TIEMPO_NETO/60) as ''Tiempo_Neto'',
				0 as OEE --Solo miramos OEE de llenadoras
				,0 AS LLENADORA
				FROM [dbo].COB_MSM_PROD_RESTO_MAQ_HORA LL
				RIGHT JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id 
				INNER JOIN Lineas L ON T.Linea = L.Id 
				WHERE LL.ID_MAQUINA LIKE ''%EQP%''  AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno @LINEA
				) T
				GROUP BY T.NumeroLinea, T.Descripcion
				ORDER BY T.NumeroLinea, T.Descripcion'


		END
		IF @ID=7
		BEGIN
/*
Máquinas con más paros menores propios
*/

SET @SQL = '	SELECT Maquina, Sum(minutos_paradas) as Total_Minutos_paradas, Sum(ROUND(minutos_paradas/60,3)) as Total_Horas_Paradas
			FROM (
			select ''L'' + convert(varchar(40),L.NumeroLinea) +'' - '' + M.Descripcion as Maquina,
			L.numeroLinea,
			CONVERT(NUMERIC(18,0),(TIEMPO_OPERATIVO - TIEMPO_NETO) /60) as minutos_paradas
			from (SELECT ID_MAQUINA, TIEMPO_OPERATIVO, TIEMPO_NETO, SHC_WORK_SCHED_DAY_PK  FROM COB_MSM_PROD_LLENADORA_HORA
			UNION ALL
			SELECT ID_MAQUINA, TIEMPO_OPERATIVO, TIEMPO_NETO, SHC_WORK_SCHED_DAY_PK FROM COB_MSM_PROD_RESTO_MAQ_HORA) LL
			INNER JOIN Maquinas M ON LL.ID_MAQUINA = M.Id
			INNER JOIN TURNOS T ON LL.SHC_WORK_SCHED_DAY_PK = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
			INNER JOIN LINEAS L ON T.Linea = L.Id @LINEA
						where TIEMPO_OPERATIVO - TIEMPO_NETO < (
				SELECT VALOR_INT FROM [dbo].[ParametrosPlanta_Admin] WHERE NombreParametro like ''%Límite paros menores%'' AND IdLinea = L.NumeroLinea)
				) TB
				group by tb.Maquina, TB.NumeroLinea
			ORDER BY TB.numeroLinea ASC , Total_minutos_paradas DESC'

		END
		IF @ID=8
		BEGIN
/*
Media de arranques de línea*/

SET @SQL = 'SELECT ''Linea '' + convert(varchar(100),OA.Linea) + '' - '' + DescripcionLinea as Linea,
				case 
				when TipoArranque=1 then ''Inicio + Limpieza''
				when TipoArranque=2 then ''Inicio''
				when TipoArranque=3 then ''Cambio + limpieza L2-L1''
				when TipoArranque=4 then ''Cambio + limpieza L1-L2''
				else ''Otros''
				end as TipoArranque
				, isnull(AVG(MinutosFinal1),0) as Duracion_llenadora
				, isnull(AVG(MinutosFinal2),0) as Duracion_paletizadora
				FROM [dbo].[OrdenesArranque] OA
				INNER JOIN Lineas L ON OA.Linea = L.NumeroLinea @LINEA
				INNER JOIN TURNOS T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				GROUP BY OA.LINEA, DescripcionLinea, TipoArranque
				ORDER BY OA.LINEA ASC'

		END
		IF @ID=9
		BEGIN
/*
	Media de cambios de producto*/
-- agomezn 010816: cambiados de orden ProductoSaliente y Producto Entrante
SET @SQL = '	Select IdProductoEntrante AS Código_Producto_Entrante,ProductoEntrante as Producto_Entrante,IdProductoSaliente AS Código_Producto_Saliente,ProductoSaliente as Producto_Saliente
						, isnull(AVG(MinutosFinal1),0) as Duracion_llenadora
				, isnull(AVG(MinutosFinal2),0) as Duracion_paletizadora
		from OrdenesCambio OC
				INNER JOIN Lineas L ON OC.Linea = L.NumeroLinea @LINEA
				INNER JOIN TURNOS T ON T.IdTipoTurno = OC.TipoTurnoId AND T.Fecha = CONVERT(DATE,OC.FECHATURNO) AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				--WHERE MinutosFinal1 > 0 
				GROUP BY ProductoSaliente, ProductoEntrante,IdProductoEntrante,IdProductoSaliente
				ORDER BY ProductoSaliente, ProductoEntrante ASC'

		END
--		IF @ID=7
--		BEGIN
--/*select 'Linea ' + convert(varchar(100),OA.Linea) + ' - ' + OA.DescripcionLinea as Linea,
--	case			when OA.TipoArranque = 1 THEN 'Arranque Lunes'
--	when OA.TipoArranque = 2 THEN 'Arranque 2 turnos'
--	else 'Otro' end as Tipo,
--	sum(OA.MinutosFinal1) as Minutos
--	FROM [MES_MSM].[dbo].[OrdenesArranque] OA
--	INNER JOIN Lineas L ON OA.Linea = L.NumeroLinea --@LINEA
--	INNER JOIN TURNOS T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId --@FECHA
--	group by OA.Linea, OA.DescripcionLinea, OA.TipoArranque

--*/

--SET @SQL = 'select ''Linea '' + convert(varchar(100),OA.Linea) + '' - '' + OA.DescripcionLinea as Linea,
--				case when OA.TipoArranque = 1 THEN ''Inicio + Limpieza''
--				when OA.TipoArranque = 2 THEN ''Inicio''
--				when OA.TipoArranque=3 then ''Cambio + limpieza L2-L1''
--				when OA.TipoArranque=4 then ''Cambio + limpieza L1-L2''
--				else ''Otro'' end as Tipo,
--				AVG(OA.MinutosFinal2) as Minutos
--				FROM [MES_MSM].[dbo].[OrdenesArranque] OA
--				INNER JOIN Lineas L ON OA.Linea = L.NumeroLinea @LINEA
--				INNER JOIN TURNOS T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId @FECHA
--				group by OA.Linea, OA.DescripcionLinea, OA.TipoArranque'

--		END
--		IF @ID=8
--		BEGIN
--/*	Select 'Linea ' + convert(varchar(10),L.NumeroLinea) + ' - ' + L.Descripcion as Linea, ProductoSaliente, ProductoEntrante, isnull(AVG(MinutosFinal1),0) as Minutos from OrdenesCambio OC
--INNER JOIN Lineas L ON OC.Linea = L.NumeroLinea --@LINEA
--INNER JOIN TURNOS T ON T.IdTipoTurno = OC.TipoTurnoId AND T.Fecha = CONVERT(DATE,OC.FECHATURNO) --@TURNO
--WHERE MinutosFinal1 > 0 
--GROUP BY L.NumeroLinea,L.Descripcion,ProductoSaliente, ProductoEntrante

--*/
---- agomezn 010816: cambiados de orden ProductoSaliente y Producto Entrante
--SET @SQL = '	Select ''Linea '' + convert(varchar(10),L.NumeroLinea) + '' - '' + L.Descripcion as Linea, ProductoEntrante, ProductoSaliente, isnull(AVG(MinutosFinal2),0) as Minutos 
--			FROM OrdenesCambio OC
--			INNER JOIN Lineas L ON OC.Linea = L.NumeroLinea @LINEA
--			INNER JOIN TURNOS T ON T.IdTipoTurno = OC.TipoTurnoId AND T.Fecha = CONVERT(DATE,OC.FECHATURNO) @FECHA
--			WHERE MinutosFinal1 > 0 
--			GROUP BY L.NumeroLinea,L.Descripcion,ProductoSaliente, ProductoEntrante'

--		END
		IF @ID=12
		BEGIN
/*
SELECT DISTINCT 'Linea ' + convert(varchar(100),L.NumeroLinea) + ' - ' + L.Descripcion AS Linea, 
convert(date,PP.FechaTurno) as Fecha, 
case
WHEN T.Turno = 'Morning' then 'Mañana'
WHEN T.Turno = 'Afternoon' then 'Tarde'
WHEN T.Turno = 'Night' then 'Noche'
else 'Otros' end as Turno
, MaquinaCausaId  as 'Codigo_Maquina_Causante', MaquinaCausaNombre AS 'Maquina_Causante', 
EquipoConstructivoId AS 'Codigo_Equipo_constructivo_responsable', EquipoConstructivoNombre AS 'Equipo_constructivo_responsable', Observaciones, 
dbo.contarEquipos(PP.EquipoConstructivoId)  as 'Cuenta_Equipo_Constructivo'
FROM DBO.ParosPerdidas PP
INNER JOIN DBO.Turnos T ON PP.IdTipoTurno = T.IdTipoTurno --@FECHA
INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA
WHERE PP.Observaciones IS NOT NULL AND PP.Observaciones<>''
group by L.NumeroLinea, L.Descripcion,PP.FechaTurno, T.Turno, MaquinaCausaId, MaquinaCausaNombre, EquipoConstructivoId, EquipoConstructivoNombre, Observaciones
*/
/*OBSERVACIONES*/
SET @SQL = 'SELECT DISTINCT  ''Línea '' + convert(varchar(100),L.NumeroLinea) + '' - '' + L.Descripcion AS Linea,
CONVERT(CHAR(15), convert(date, PP.FECHATURNO), 105) + '' '' + T.TURNO AS Turno, 
			 MaquinaCausaId  as ''Codigo_Maquina_Causante'', MaquinaCausaNombre AS ''Maquina_Causante'', 
		EQ.ID_EQUIPO_CONSTRUCTIVO AS ''Codigo_Equipo_constructivo_responsable'', EquipoConstructivoNombre AS ''Equipo_constructivo_responsable'', CUENTA.Observaciones, 
	    CUENTA.CONTADOR Cuenta_de_equipo_constructivo
		FROM DBO.ParosPerdidas PP
		INNER JOIN DBO.Turnos T ON PP.Turno = T.Id  AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
		INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA
		LEFT JOIN EQUIPO_CONSTRUCTIVO EQ ON EQ.IdObj = EquipoConstructivoId
		LEFT JOIN (
					SELECT EquipoConstructivoId ID_EQUIPO_CUENTA, COUNT(EquipoConstructivoId) AS CONTADOR,Observaciones
					FROM ParosPerdidas AS PP
					INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA
					INNER JOIN DBO.Turnos T ON PP.Turno = T.Id  AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
					WHERE PP.Observaciones<>'''' and EquipoConstructivoId is not null
					GROUP BY EquipoConstructivoId,PP.Observaciones
		) AS CUENTA ON CUENTA.ID_EQUIPO_CUENTA = PP.EquipoConstructivoId 
		WHERE PP.Observaciones IS NOT NULL AND PP.Observaciones<>''''
	
		ORDER BY Linea, Turno asc'

		END

		/* Indice de Lineas entre fechas*/
		IF @ID=13
		BEGIN

SET @SQL = 'SELECT ''Línea '' + convert(varchar(2),LLEFINAL.NumeroLinea) + '' - '' + l.Descripcion as Línea,
	LLEFINAL.Ocupacion as Ocupación, LLEFINAL.Disponibilidad, LLEFINAL.Eficiencia, LLEFINAL.OEE, LLEFINAL.Rendimiento, LLEFINAL.VelocidadMediaEnvasesHora as Velocidad_media_Env_por_hora,
	PP.NumeroParosMayores, PP.HorasParosMayores, PP.NumeroParosMenores, PP.HorasParosMenores,CONCAT(TABLA_KPI.OEE,''%'') AS OEE_WO,
	CONCAT(CONVERT(numeric(18,2),TABLA_PORCENTAJE.PORCENTAJE), ''%'') AS Perc_Perd ,CONCAT(CONVERT(float,(TABLA_KPI.OEE - CONVERT(numeric(18,2),TABLA_PORCENTAJE.PORCENTAJE))),''%'') AS OEE_Compensado
	
FROM (
select 
LL.NumeroLinea,
CONCAT(CONVERT(NUMERIC(18,2),(LL.cantidadHoras / convert(numeric(18,2),DATEDIFF(HOUR, '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''','''+CONVERT(VARCHAR(100),@FechaFin,120)+''' )))*100),''%'') AS ''Ocupacion'',
case when SUM(LL.TIEMPO_PLANIFICADO) > 0 then CONCAT(convert(numeric(18,2),((SUM(TIEMPO_OPERATIVO))/SUM([TIEMPO_PLANIFICADO])) * 100),''%'') end as Disponibilidad,
case when SUM(LL.TIEMPO_OPERATIVO) > 0 then CONCAT(convert(numeric(18,2),((SUM(TIEMPO_NETO))/SUM(TIEMPO_OPERATIVO)) * 100),''%'') end as Eficiencia,
case when SUM(LL.TIEMPO_OPERATIVO) > 0 AND SUM(LL.[TIEMPO_PLANIFICADO])>0 then CONCAT(convert(numeric(18,2),((SUM(LL.[TIEMPO_OPERATIVO])/SUM(LL.[TIEMPO_PLANIFICADO])) * (SUM(LL.[TIEMPO_NETO])/SUM(LL.[TIEMPO_OPERATIVO])))*100.0),''%'') end as OEE
,convert(numeric(18,2),SUM( CASE WHEN LL.CONTADOR = -1 THEN 0 ELSE CONVERT(BIGINT,LL.CONTADOR) END)/SUM(LL.TIEMPO_PLANIFICADO/3600)) as ''VelocidadMediaEnvasesHora'',
case when SUM(LL.TIEMPO_OPERATIVO) > 0 AND SUM(LL.[TIEMPO_PLANIFICADO])>0 then CONCAT(convert(numeric(18,2),((SUM(LL.[TIEMPO_OPERATIVO])/SUM(LL.[TIEMPO_PLANIFICADO])) * (SUM(LL.[TIEMPO_NETO])/SUM(LL.[TIEMPO_OPERATIVO])))*100.0*1),''%'') end as Rendimiento



from (

SELECT sum(DATEDIFF(HOUR,turnos.InicioTurno,turnos.FinTurno)) as cantidadHoras,L.NumeroLinea,LL.TIEMPO_OPERATIVO, LL.hora,LL.TIEMPO_NETO, LL.TIEMPO_PLANIFICADO, LL.FECHA_INICIO, LL.FECHA_FIN, LL.CONTADOR_PRODUCCION AS CONTADOR, LL.ID_MAQUINA, T.FECHA,T.Id AS ID_TURNO
FROM COB_MSM_PROD_LLENADORA_HORA LL
	INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
	INNER JOIN LINEAS L	ON M.Linea = L.Id  @LINEA
	INNER JOIN Turnos T ON t.Linea = L.Id AND T.InicioTurno <= LL.FECHA_INICIO AND LL.FECHA_FIN <= T.FinTurno AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno ,
	(select InicioTurno,FinTurno from turnos inner join Lineas L on turnos.Linea = L.Id where  InicioTurno >= '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' and FinTurno <= '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' @LINEA ) as turnos
	GROUP BY 		L.NumeroLinea,LL.TIEMPO_OPERATIVO, LL.hora,LL.TIEMPO_NETO, LL.TIEMPO_PLANIFICADO, LL.FECHA_INICIO, 
	LL.FECHA_FIN, LL.CONTADOR_PRODUCCION, LL.ID_MAQUINA, T.FECHA,T.Id	
) LL
group by LL.NumeroLinea,LL.cantidadHoras
) LLEFINAL
LEFT JOIN (SELECT 
L.NumeroLinea,
SUM(CASE WHEN PP.FK_PAROS_ID = 1 THEN 1 ELSE 0 END) AS NumeroParosMayores,
dbo.GetFormatoHoraMinutosSegundos(SUM(CASE WHEN PP.FK_PAROS_ID = 1 THEN DURACION ELSE 0 END)) AS ''HorasParosMayores'',
SUM(CASE WHEN PP.FK_PAROS_ID = 2 THEN NUMERO_PAROS_MENORES ELSE 0 END) AS NumeroParosMenores,
dbo.GetFormatoHoraMinutosSegundos(SUM(CASE WHEN PP.FK_PAROS_ID = 2 THEN DURACION_PAROS_MENORES ELSE 0 END)) AS ''HorasParosMenores''
	FROM COB_MSM_PAROS_PERDIDAS PP
	INNER JOIN TURNOS T ON PP.SHC_WORK_SCHED_DAY_PK = T.Id AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
	INNER JOIN LINEAS L ON T.Linea = L.ID @LINEA
		group by L.NumeroLinea
		) pp ON PP.NumeroLinea = LLEFINAL.NumeroLinea
INNER JOIN LINEAS L ON L.NumeroLinea = LLEFINAL.NumeroLinea
INNER JOIN dbo.MES_KPI_OEE_WO_TABLE('''+@linea+''',CONVERT(DATETIME,'''+CONVERT(VARCHAR(100),@FechaInicio,120)+'''),CONVERT(DATETIME,'''+CONVERT(VARCHAR(100),@FechaFin,120)+''')) AS TABLA_KPI 
ON TABLA_KPI.ID_LINEA = L.NumeroLinea
INNER JOIN dbo.MES_PorcentajeEnvasesNoProducidos_Table('''+@linea+''',CONVERT(DATETIME,'''+CONVERT(VARCHAR(100),@FechaInicio,120)+'''),CONVERT(DATETIME,'''+CONVERT(VARCHAR(100),@FechaFin,120)+''')) AS TABLA_PORCENTAJE
 ON TABLA_PORCENTAJE.ID_LINEA = L.NumeroLinea
 ORDER BY L.NumeroLinea
'

		END
		IF @ID=14
		BEGIN
/*SELECT 'Linea ' + convert(varchar(100),L.NumeroLinea) + ' - ' + L.Descripcion AS Linea, MaquinaCausaId AS 'Codigo_Maquina_Causante', MaquinaCausaNombre as 'Maquina_Causante',
count(*) as 'Numero_paros',
replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),'.',',')  as 'Tiempo_total_minutos',
PP.Descripcion as 'Descripcion_averia'
FROM DBO.ParosPerdidas PP
INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA group by L.NumeroLinea, L.Descripcion, MaquinaCausaId, MaquinaCausaNombre, PP.Descripcion
order by count(*) desc
*/
/*PAROS AGRUPADOS POR MOTIVO*/
SET @SQL = 'SELECT ''Linea '' + convert(varchar(100),L.NumeroLinea) + '' - '' + L.Descripcion AS Linea, MaquinaCausaNombre as ''Maquina'',
		PP.MotivoNombre as Motivo,
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),''.'','','')  as ''Tiempo_total_minutos'',
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/3600),''.'','','')  as ''Tiempo_total_horas''
		FROM DBO.ParosPerdidas PP
		INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
		INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
		group by L.NumeroLinea, L.Descripcion, MaquinaCausaNombre, PP.MotivoNombre
		order by L.NumeroLinea asc, count(*) desc'

		END
		IF @ID=15
		/*PAROS AGRUPADOS POR MOTIVO Y CAUSA*/
		BEGIN
SET @SQL = 'SELECT ''Linea '' + convert(varchar(100),L.NumeroLinea) + '' - '' + L.Descripcion AS Linea, MaquinaCausaNombre as ''Maquina'',
		PP.MotivoNombre as Motivo, PP.CausaNombre as Causa,
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),''.'','','')  as ''Tiempo_total_minutos'',
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/3600),''.'','','')  as ''Tiempo_total_horas''
		FROM DBO.ParosPerdidas PP
		INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
		INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
		group by L.NumeroLinea, L.Descripcion, MaquinaCausaNombre, PP.MotivoNombre, PP.CausaNombre
		order by L.NumeroLinea asc, count(*) desc'
		END
		IF @ID=16
		BEGIN
		/*PAROS PROVOCADOS POR EQUIPOS CONSTRUCTIVOS*/
/*Select 'Linea ' + convert(varchar(100),L.NumeroLinea) + ' - ' + L.Descripcion AS Linea, 
MaquinaCausaId AS 'Codigo_Maquina_Causante', MaquinaCausaNombre as 'Maquina_Causante',
	ISNULL(EquipoConstructivoId,'Sin Equipo definido') AS 'Codigo_Equipo_constructivo_responsable', EquipoConstructivoNombre AS 'Equipo_constructivo_responsable',
	isnull(CausaNombre,'') as 'Causa_paro', count(*) as 'Número_de_paros',
	replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),'.',',')  as 'Total_minutos_paradas',
	replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/3600),'.',',') as 'Total_horas_paradas'
	from dbo.ParosPerdidas PP
	INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
	INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
				group by L.NumeroLinea, L.Descripcion, EquipoConstructivoId, EquipoConstructivoNombre, MaquinaCausaId, MaquinaCausaNombre, CausaNombre
	order by count(*) desc

*/

SET @SQL = 'Select MaquinaCausaNombre as ''Maquina_Causante'',
		EQ.[ID_EQUIPO_CONSTRUCTIVO] AS ''Codigo_Equipo_constructivo_responsable'', EquipoConstructivoNombre AS ''Equipo_constructivo_responsable'',
		 count(*) as ''Número_de_paros'',
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/60),''.'','','')  as ''Total_minutos_paradas'',
		replace(convert(numeric(9,2), (sum(DuracionParoMayor)+SUM(DuracionParosMenores)+sum(isnull(DuracionBajaVelocidad,0)))/3600),''.'','','') as ''Total_horas_paradas''
		from dbo.ParosPerdidas PP
		INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
		INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
		INNER JOIN [dbo].[EQUIPO_CONSTRUCTIVO] EQ ON EQ.IdObj = PP.EquipoConstructivoId
					group by EQ.ID_EQUIPO_CONSTRUCTIVO, EquipoConstructivoNombre, MaquinaCausaNombre
			order by count(*) desc'
		

		END
		IF @ID=17
		BEGIN
		/*PAROS SIN JUSTIFICAR*/
/*
	Select 'Linea ' + convert(varchar(100),L.NumeroLinea) + ' - ' + L.Descripcion AS 'Linea', 
				convert(Date, PP.FechaTurno) as Fecha, 
	case
	when PP.NombreTipoTurno = 'Morning' then 'Mañana'
	when PP.NombreTipoTurno = 'Afternoon' then 'Tarde'
	when PP.NombreTipoTurno = 'Night' then 'Noche'
	else 'Otros' end as Turno
	, MotivoNombre as 'Motivo', 
	replace(convert(numeric(18,2), (SUM(PP.DuracionParoMayor)+SUM(PP.DuracionParosMenores)+SUM(PP.DuracionBajaVelocidad))/60),'.',',')  as 'Duracion_Minutos',
	isnull(CausaNombre,'') as 'Causa_paro',
	isnull(MaquinaCausaId,'Maquina no definida') AS 'Codigo_Maquina_Causante', MaquinaCausaNombre as 'Maquina_Causante',
	ISNULL(EquipoConstructivoId,'Sin Equipo definido') AS 'Codigo_Equipo_constructivo_responsable', EquipoConstructivoNombre AS 'Equipo_constructivo_responsable',
	PP.Descripcion, Observaciones
	from dbo.ParosPerdidas PP
	INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
	INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
	where Justificado =0
	group by L.NumeroLinea,PP.FechaTurno, L.Descripcion,  PP.NombreTipoTurno, MotivoNombre, CausaNombre, EquipoConstructivoId, EquipoConstructivoNombre,MaquinaCausaNombre,
	MaquinaCausaId,PP.Descripcion, Observaciones
*/

SET @SQL = 'Select ''Linea '' + convert(varchar(100),L.NumeroLinea) + '' - '' + L.Descripcion AS ''Linea'', 
			convert(varchar(100),convert(date, PP.FechaTurno)) + '' '' + T.TURNO AS Turno,
			/*case
			when PP.NombreTipoTurno = ''Morning'' then convert(varchar(100),convert(date,PP.FechaTurno)) + '' Mañana''
			when PP.NombreTipoTurno = ''Afternoon'' then convert(varchar(100),convert(date,PP.FechaTurno)) +  '' Tarde''
			when PP.NombreTipoTurno = ''Night'' then convert(varchar(100),convert(date,PP.FechaTurno)) + '' Noche''
			else convert(varchar(100),convert(date,PP.FechaTurno)) + '' Otros'' end as Turno
			,*/ MotivoNombre as ''Motivo'', 
			replace(convert(numeric(18,2), (SUM(PP.DuracionParoMayor)+SUM(PP.DuracionParosMenores)+SUM(PP.DuracionBajaVelocidad))/60),''.'','','')  as ''Duracion_Minutos'',
			isnull(CausaNombre,'''') as ''Causa_paro'',
			isnull(MaquinaCausaId,'''') AS ''Codigo_Maquina_Causante'', MaquinaCausaNombre as ''Maquina_Causante'',
			ISNULL(EquipoConstructivoId,'''') AS ''Codigo_Equipo_constructivo_responsable'', EquipoConstructivoNombre AS ''Equipo_constructivo_responsable'',
			PP.Descripcion, Observaciones
			from dbo.ParosPerdidas PP
			INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
			INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
			where Justificado =0
			group by L.NumeroLinea,PP.FechaTurno, L.Descripcion, T.Fecha, T.IdTipoTurno,  T.TURNO, MotivoNombre, CausaNombre, EquipoConstructivoId, EquipoConstructivoNombre,MaquinaCausaNombre,
			MaquinaCausaId,PP.Descripcion, Observaciones
			order by Linea, T.Fecha, T.IdTipoTurno asc'

		END
		IF @ID=18
		BEGIN
		/*PORCENTAJE DE PAROS JUSTIFICADOS*/
/*
Select Sum([Paros_Totales]) as 'Paros_Totales',Sum([Paros_Justificados]) as 'Paros_Justificados'
	,Sum([Paros_No_Justificados]) as 'Paros_No_Justificados',
	convert(varchar(100),convert(numeric(18,2),( sum(convert(float,Paros_Justificados)) / (sum(convert(float,Paros_No_Justificados)) +sum(convert(float,Paros_Justificados))))*100))+'%' as 'Porcentaje_Justificados'
	From (
	select count(*) as 'Paros_Totales',0 as 'Paros_Justificados',0 as 'Paros_No_Justificados' 
	from ParosPerdidas PP
	INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
	INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
	union all
	Select 0,count(*),0
	from ParosPerdidas PP
	INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
	INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
	where Justificado=1
	union all
	Select 0,0, count(*)
	from ParosPerdidas PP
	INNER JOIN TURNOS T ON PP.Turno = T.ID --@FECHA
	INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
	where Justificado=0) PP
*/

SET @SQL = 'Select Sum([Paros_Totales]) as ''Paros_Totales'',Sum([Paros_Justificados]) as ''Paros_Justificados''
				,Sum([Paros_No_Justificados]) as ''Paros_No_Justificados'' ,
				convert(varchar(100),convert(numeric(18,2),( sum(convert(float,Paros_Justificados)) / (sum(convert(float,Paros_No_Justificados)) +sum(convert(float,Paros_Justificados))))*100))+''%'' as ''Porcentaje_Justificados''
				From (
				select count(*) as ''Paros_Totales'',0 as ''Paros_Justificados'',0 as ''Paros_No_Justificados'' 
				from ParosPerdidas PP
				INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
				union all
				Select 0,count(*),0
				from ParosPerdidas PP
				INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
				where Justificado=1
				union all
				Select 0,0, count(*)
				from ParosPerdidas PP
				INNER JOIN TURNOS T ON PP.Turno = T.ID AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea @LINEA 
				where Justificado=0) PP'

		END
		IF @ID=19
		BEGIN
		/*SINTESIS DE PAROS SIN CUMPLIMENTAR*/
/*
	SELECT DISTINCT 'Linea ' + convert(varchar(100),L.NumeroLinea) + ' - ' + L.Descripcion AS Linea, 
	convert(date,PP.FechaTurno) as Fecha,
	case
	when T.Turno = 'Morning' then 'Mañana'
	when T.Turno = 'Afternoon' then 'Tarde'
	when T.Turno = 'Night' then 'Noche'
	else 'Otros' end as Turno, MaquinaCausaId  as 'Codigo_Maquina_Causante', MaquinaCausaNombre AS 'Maquina_Causante', 
isnull(EquipoConstructivoId,'Sin equipo definido') AS 'Codigo_Equipo_constructivo_responsable', EquipoConstructivoNombre AS 'Equipo_constructivo_responsable', 
PP.Descripcion, 
replace(convert(numeric(9,2), (SUM(PP.DuracionParoMayor)+SUM(PP.DuracionParosMenores)+SUM(PP.DuracionBajaVelocidad))/60),'.',',')  as 'Duracion_parada'
FROM DBO.ParosPerdidas PP
INNER JOIN DBO.Turnos T ON PP.IdTipoTurno = T.IdTipoTurno --@FECHA
INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea --@LINEA 
WHERE PP.Observaciones IS NOT NULL AND PP.Observaciones<>''
group by T.Turno,PP.FechaTurno, MaquinaCausaId, L.NumeroLinea, L.Descripcion, MaquinaCausaNombre, EquipoConstructivoId, EquipoConstructivoNombre, PP.Descripcion
*/

SET @SQL = 'SELECT ''Linea '' + convert(varchar(100),L.NumeroLinea) + '' - '' + L.Descripcion AS Linea, 
		convert(varchar(100),convert(date, PP.FechaTurno),105) + '' '' + T.TURNO AS Fecha_Turno,
        MaquinaCausaId  as Codigo_Maquina_Causante, 
		MaquinaCausaNombre AS Maquina_Causante, 
		isnull(EQ.ID_EQUIPO_CONSTRUCTIVO,'''') AS Codigo_Equipo_constructivo_responsable, 
		EquipoConstructivoNombre AS Equipo_constructivo_responsable, 
		PP.Descripcion, 
		replace(convert(numeric(9,2), (SUM(PP.DuracionParoMayor)+SUM(PP.DuracionParosMenores)+SUM(PP.DuracionBajaVelocidad))/60),''.'','','')  as Duracion_parada_minutos
		FROM DBO.ParosPerdidas PP
		INNER JOIN DBO.Turnos T ON PP.Turno = T.Id  AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
		INNER JOIN Lineas L ON PP.IdLinea = L.NumeroLinea  @LINEA 
		LEFT JOIN EQUIPO_CONSTRUCTIVO EQ ON EQ.IdObj = EquipoConstructivoId
		LEFT JOIN COB_MSM_ACCIONES_PAROS AP ON AP.ID_PARO = PP.Id AND AP.FK_ACCIONES_DE_MEJORA_ID IS NULL
		WHERE PP.Observaciones IS NOT NULL AND PP.Observaciones<>''''
		group by PP.FechaTurno, T.IdTipoTurno, T.Turno, MaquinaCausaId, L.NumeroLinea, L.Descripcion, MaquinaCausaNombre, EQ.ID_EQUIPO_CONSTRUCTIVO, EquipoConstructivoNombre, PP.Descripcion
		order by PP.FechaTurno, T.IdTipoTurno asc'

		END
		IF @ID=20
		BEGIN
		/*SINTESIS DE ARRANQUES SIN CUMPLIMENTAR*/
/*
SELECT 'Linea ' + convert(varchar(100),OA.Linea) + ' - ' + DescripcionLinea as Linea,
case 
when TipoArranque=1 then 'Arranque Lunes'
else 'Arranque 2 turnos'
end as TipoArranque
, isnull(AVG(MinutosFinal1),0) as Minutos
FROM [MES_MSM].[dbo].[OrdenesArranque] OA
INNER JOIN Lineas L ON OA.Linea = L.NumeroLinea @LINEA
INNER JOIN TURNOS T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId @FECHA
GROUP BY OA.LINEA, DescripcionLinea, TipoArranque*/

SET @SQL = 'SELECT ''Linea '' + convert(varchar(100),OA.Linea) + '' - '' + DescripcionLinea as Linea,
				case 
				when TipoArranque=1 then ''Inicio + Limpieza''
				when TipoArranque = 2 THEN ''Inicio''
				when TipoArranque=3 then ''Cambio + limpieza L2-L1''
				when TipoArranque=4 then ''Cambio + limpieza L1-L2''
				else ''Otro''
				end as Tipo_de_arranque
				, isnull(SUM(MinutosFinal1),0) as Duracion_llenadora
				, isnull(SUM(MinutosFinal2),0) as Duracion_paletizadora
				FROM [dbo].[OrdenesArranque] OA
				INNER JOIN Lineas L ON OA.Linea = L.NumeroLinea @LINEA
				INNER JOIN TURNOS T ON CONVERT(DATE,T.Fecha) = CONVERT(DATE,OA.FechaTurno) AND T.IdTipoTurno = OA.TipoTurnoId AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				LEFT JOIN COB_MSM_ACCIONES_ARRANQUES AA ON AA.ID_ARRANQUE = OA.ID_ARRANQUE AND AA.FK_ACCION_MEJORA_ID IS NULL
				GROUP BY OA.LINEA, DescripcionLinea, TipoArranque
				ORDER BY OA.LINEA ASC'

		END
		IF @ID=21
		BEGIN

/*
	Select ProductoSaliente, ProductoEntrante, isnull(AVG(MinutosFinal1),0) as Minutos from OrdenesCambio OC
INNER JOIN Lineas L ON OC.Linea = L.NumeroLinea --@LINEA
INNER JOIN TURNOS T ON T.IdTipoTurno = OC.TipoTurnoId AND T.Fecha = CONVERT(DATE,OC.FECHATURNO) --@TURNO
WHERE MinutosFinal1 > 0 
GROUP BY ProductoSaliente, ProductoEntrante*/

SET @SQL = '	Select ProductoSaliente,ProductoEntrante
						, isnull(AVG(MinutosFinal1),0) as Duracion_llenadora
				, isnull(AVG(MinutosFinal2),0) as Duracion_paletizadora
		from OrdenesCambio OC
				INNER JOIN Lineas L ON OC.Linea = L.NumeroLinea @LINEA
				INNER JOIN TURNOS T ON T.IdTipoTurno = OC.TipoTurnoId AND T.Fecha = CONVERT(DATE,OC.FECHATURNO) AND  '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno
				LEFT JOIN COB_MSM_ACCIONES_CAMBIOS AC ON AC.ID_CAMBIO = OC.ID_CAMBIO AND AC.FK_ACCION_MEJORA_ID IS NULL
				--WHERE MinutosFinal1 > 0 
				GROUP BY ProductoSaliente, ProductoEntrante
				ORDER BY ProductoSaliente, ProductoEntrante ASC'


		END

	




		IF (@linea <> '')
SET @SQL = REPLACE(@SQL, '@LINEA', ' AND L.ID = ''' + @linea + '''')
			ELSE
SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

			--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0
SET @SQL = REPLACE(@SQL, '@FECHA', ' AND dbo.getAntesTurnoInicio('+CONVERT(VARCHAR(100), @fini)+','+CONVERT(VARCHAR(100), @tini)+') <= T.InicioTurno AND 
				dbo.getDespuesTurnoFin('+CONVERT(VARCHAR(100), @ffin)+','+CONVERT(VARCHAR(100), @tfin)+') >= T.FinTurno and T.Linea='''+@linea+''' ')

					ELSE
			IF @fini = 0 and @ffin >0
SET @SQL = REPLACE(@SQL, '@FECHA', ' dbo.getAntesTurnoInicio('+CONVERT(VARCHAR(100), @fini)+','+CONVERT(VARCHAR(100), @tini)+') <= T.InicioTurno and T.Linea='''+@linea+''' ')
					ELSE
			IF @FFIN = 0 and @fini>0
SET @SQL = REPLACE(@SQL, '@FECHA', ' dbo.getDespuesTurnoFin('+CONVERT(VARCHAR(100), @ffin)+','+CONVERT(VARCHAR(100), @tfin)+') <= T.FinTurno and T.Linea='''+@linea+''' ')
					ELSE
			IF @ffin=0 and @fini = 0
SET @SQL = REPLACE(@SQL, '@FECHA', '')





	
				PRINT(@SQL)
EXEC (@SQL)
DROP TABLE #TEMP_TURNO
END



GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDatosQueriesGraficos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDatosQueriesGraficos]
	@linea varchar(100),
	@arranque tinyint,
	@anyo int,
	@semana int,
	@rangos int,
	@fini bigint,
	@tini int,
	@ffin bigint,
	@tfin int,
	@id smallint,
	@maq varchar(max),
	@mot varchar(max)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		DECLARE @SQL AS VARCHAR(MAX) =''
		
if @fini > 0
SET @fini = DATEDIFF(SECOND, '19700101', CONVERT(DATE, DATEADD(SECOND, @fini + 7200, '1970-01-01')))

	if @ffin > 0
SET @ffin = DATEDIFF(SECOND, '19700101', CONVERT(DATE, DATEADD(SECOND, @ffin + 7200, '1970-01-01')))



if @tini = 0
	  SET @tini = 1

	if @tfin = 0
	  SET @tfin = 3

	  	DECLARE @FechaInicio DATETIME  
	SET @FechaInicio = dbo.getAntesTurnoInicio(CONVERT(VARCHAR(100), @fini),CONVERT(VARCHAR(100), @tini))
	DECLARE @FechaFin DATETIME  
	SET @FechaFin = dbo.getDespuesTurnoFin(CONVERT(VARCHAR(100), @ffin),CONVERT(VARCHAR(100), @tfin))

		IF @ID = 1
		/*CONTROL DE ARRANQUES 2 OBJETIVOS*/
		BEGIN

SET @SQL = 'SELECT format(dbo.ToLocalDateTime(OA.InicioReal),''dd-MM-yyyy'') as categories
			,NOMBRE as seriesname, SUM(TIEMPO) as seriesdata,min(OA.InicioReal) as fecha
			FROM [dbo].[OrdenesArranque] OA
			INNER JOIN TURNOS T ON OA.TipoTurnoId = T.IdTipoTurno AND CONVERT(DATE, FECHATURNO) = CONVERT(DATE,T.Fecha)
			CROSS APPLY (
				SELECT ''Duracion Llenadora'', MINUTOSFINAL1 UNION ALL
				SELECT ''Tiempo objetivo Llenadora'',MinutosObjetivo1 UNION ALL
				SELECT ''Duracion Paletizadora'', MINUTOSFINAL2 UNION ALL
				SELECT ''Tiempo objetivo Paletizadora'',MinutosObjetivo2
			) C (NOMBRE, TIEMPO)
			WHERE 1=1 @LINEA 
			@ARRANQUE
			@FECHA 
			GROUP BY format(dbo.ToLocalDateTime(OA.InicioReal),''dd-MM-yyyy''), NOMBRE
			ORDER BY NOMBRE, min(OA.InicioReal) ASC'


			IF (@linea <> '')
				SET @SQL = REPLACE(@SQL, '@LINEA', ' AND OA.idLinea = ''' + @linea + '''')
			ELSE
				SET @SQL = REPLACE(@SQL, '@LINEA', '')
			IF (@arranque > 0)
				SET @SQL = REPLACE(@SQL, '@ARRANQUE', ' AND OA.TipoArranque = ' + CONVERT(VARCHAR(100), @arranque))
			ELSE
				SET @SQL = REPLACE(@SQL, '@ARRANQUE', '')

			--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
				IF @fini > 0 AND @ffin>0 AND @linea <> ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal BETWEEN ( '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''') AND ( '''+CONVERT(VARCHAR(100),@FechaFin,120)+''') AND T.Linea = ''' + @linea + '''')

                ELSE IF @fini > 0 AND @ffin>0 AND @linea = ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal BETWEEN ( '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''') AND ( '''+CONVERT(VARCHAR(100),@FechaFin,120)+''') ')

				IF @fini = 0 and @ffin >0 AND @linea <> ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal < ( '''+CONVERT(VARCHAR(100),@FechaFin,120)+''') AND T.Linea = ''' + @linea + '''')
                ELSE IF @fini = 0 and @ffin >0 AND @linea = ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal < ( '''+CONVERT(VARCHAR(100),@FechaFin,120)+''') ')
				IF @FFIN = 0 and @fini>0 AND @linea <> ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal > ( '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''') AND T.Linea = ''' + @linea + '''')
			    ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND OA.InicioReal > ( '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''')')
				IF @ffin=0 and @fini = 0
					SET @SQL = REPLACE(@SQL, '@FECHA', '')


		END


		IF @ID=3
		/*MEDIA DE OEE POR MAQUINA*/
		BEGIN
SET @SQL = 'SELECT ''L'' + CONVERT(VARCHAR(2),L.NumeroLinea) + '' '' + M.Descripcion as categories,  
					CASE WHEN SUM(TIEMPO_OPERATIVO)=0 OR SUM(TIEMPO_PLANIFICADO)=0 THEN 0
					ELSE CONVERT(NUMERIC(18,2),((sum([TIEMPO_OPERATIVO])/sum([TIEMPO_PLANIFICADO])) * (sum([TIEMPO_NETO])/sum([TIEMPO_OPERATIVO])) * 1.0)*100.0)
					END AS data
					 FROM 
					(SELECT ID_ORDEN,ID_MAQUINA,SHC_WORK_SCHED_DAY_PK, TIEMPO_OPERATIVO, TIEMPO_PLANIFICADO, TIEMPO_NETO FROM COB_MSM_PROD_LLENADORA_HORA
					UNION ALL
					SELECT ID_ORDEN,ID_MAQUINA,SHC_WORK_SCHED_DAY_PK, TIEMPO_OPERATIVO, TIEMPO_PLANIFICADO, TIEMPO_NETO FROM COB_MSM_PROD_RESTO_MAQ_HORA) LL
					INNER JOIN Maquinas M ON LL.ID_MAQUINA = M.Id
					INNER JOIN Turnos T ON LL.SHC_WORK_SCHED_DAY_PK = t.Id
					INNER JOIN LINEAS L ON M.Linea = L.ID
					WHERE 1=1 @LINEA @FECHA @MAQ
					GROUP BY LL.ID_MAQUINA,M.Descripcion, L.NumeroLinea, M.POSICION
					ORDER BY M.POSICION ASC '

			IF (@linea <> '')
				SET @SQL = REPLACE(@SQL, '@LINEA', ' AND M.LINEA = ''' + @linea + '''')
			ELSE
				SET @SQL = REPLACE(@SQL, '@LINEA', '')		
			
				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno and T.Linea='''+@linea+''' ')
            ELSE IF @fini > 0 AND @ffin>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno  ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''	
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
			ELSE IF @ffin=0 and @fini = 0
				SET @SQL = REPLACE(@SQL, '@FECHA', '')

			if @maq=''
				SET @SQL = REPLACE(@SQL, '@MAQ', '')
			else
				SET @SQL = REPLACE(@SQL, '@MAQ', ' AND LL.ID_MAQUINA IN (' + @maq + ')')
		END


		IF @id=4 OR @ID=5
		/*TIEMPO DE PARADA DE MAQUINAS(CIRCULAR)= 4 */
		/*TIEMPO DE PARADAS JUSTIFICADAS = 5*/
		BEGIN
		IF @ID=4
		/*TIEMPO DE PARADA DE MAQUINAS(CIRCULAR)= 4 */
SET @SQL = 'SELECT ''L'' + convert(varchar(2),L.NumeroLinea) + '' '' + isnull(MaquinaCausaNombre,''Sin definir'') AS category, 
						case
						when count(*)*100/(SUM(COUNT(*)) OVER()) = 0 then 0.3
						else count(*)*100/(SUM(COUNT(*)) OVER()) end as value
						FROM ParosPerdidas PP
						INNER JOIN TURNOS T ON T.ID = PP.TURNO @FECHA
						INNER JOIN LINEAS L ON PP.IdLinea = L.NumeroLinea @LINEA
						LEFT JOIN MAQUINAS M ON PP.MaquinaCausaId = M.Nombre
						WHERE 1=1 @MAQ @MOT
						GROUP BY MaquinaCausaNombre,L.NumeroLinea'


		IF @id=5
		/*TIEMPO DE PARADAS JUSTIFICADAS = 5*/
SET @SQL = 'SELECT ''L'' + convert(varchar(2),L.NumeroLinea) + '' '' + isnull(MaquinaCausaNombre,''Sin definir'') AS category,
						case
						when count(*)*100/(SUM(COUNT(*)) OVER()) = 0 then 0.3
						else count(*)*100/(SUM(COUNT(*)) OVER()) end as value
						FROM ParosPerdidas PP
						INNER JOIN TURNOS T ON T.ID = PP.TURNO @FECHA
						INNER JOIN LINEAS L ON PP.IdLinea = L.NumeroLinea @LINEA
						LEFT JOIN MAQUINAS M ON PP.MaquinaCausaId = M.Nombre
						WHERE 1=1 and PP.Justificado=1 @MAQ @MOT
						GROUP BY MaquinaCausaNombre,L.NumeroLinea'


				IF (@linea <> '')
					SET @SQL = REPLACE(@SQL, '@LINEA', ' AND L.NOMBRE = ''' + @linea + '''')
				ELSE
					SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
				IF @fini > 0 AND @ffin>0 AND @linea <>''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
						'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno and T.Linea='''+@linea+''' ')
				ELSE IF @fini > 0 AND @ffin>0 AND @linea =''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
						'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno ')
				ELSE IF @fini = 0 and @ffin >0 AND @linea <> ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
				ELSE IF @fini = 0 and @ffin >0 AND @linea = ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno  ')
				ELSE IF @FFIN = 0 and @fini>0 AND @linea <> ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno and T.Linea='''+@linea+''' ')
				ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''
					SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
				ELSE IF @ffin=0 and @fini = 0 
					SET @SQL = REPLACE(@SQL, '@FECHA', '')

				if @maq=''
					SET @SQL = REPLACE(@SQL, '@MAQ', '')
				else
					SET @SQL = REPLACE(@SQL, '@MAQ', ' AND M.ID IN (' + @maq + ')')

				if @mot=''
					SET @SQL = REPLACE(@SQL, '@MOT', '')
				else
					SET @SQL = REPLACE(@SQL, '@MOT', ' AND PP.MotivoId IN (' + @mot + ')')

		END

		/************************************************************************************************
	
		GRAFICOS DE BARRAS MULTIPLES 

		IDS: 9 y 10

		*************************************************************************************************/

		IF @ID=8 or @ID=9
		BEGIN

		if @ID=8
		/*TIEMPO DE PARADA MAQUINAS MOTIVOS*/

SET @SQL = 'SELECT ''L'' + CONVERT(VARCHAR(100),L.NumeroLinea) +'' '' + M.Descripcion as categories, C.NOMBRE as seriesname, CONVERT(NUMERIC(18,0),SUM(C.TIEMPO/60)) as seriesdata
					FROM (
						SELECT ID_MAQUINA, SHC_WORK_SCHED_DAY_PK, TIEMPO_PLANIFICADO, TIEMPO_OPERATIVO, TIEMPO_NETO FROM COB_MSM_PROD_LLENADORA_HORA
						UNION ALL
						SELECT ID_MAQUINA, SHC_WORK_SCHED_DAY_PK, TIEMPO_PLANIFICADO, TIEMPO_OPERATIVO, TIEMPO_NETO FROM COB_MSM_PROD_RESTO_MAQ_HORA
					) LL
					INNER JOIN MAQUINAS M ON M.ID=LL.ID_MAQUINA @MAQ
					INNER JOIN TURNOS T ON T.ID=LL.SHC_WORK_SCHED_DAY_PK @FECHA
					INNER JOIN LINEAS L ON T.Linea=L.Id @LINEA
					CROSS APPLY (
												SELECT ''Paro'', TIEMPO_PLANIFICADO-TIEMPO_OPERATIVO UNION ALL
												SELECT ''Perdida Produccion'', TIEMPO_OPERATIVO-TIEMPO_NETO) 
												C (NOMBRE, TIEMPO)
					GROUP BY L.NumeroLinea,M.Descripcion, M.Posicion,  C.NOMBRE
					order by c.NOMBRE, M.Posicion asc'
					
			if @ID=9
			/*OEE MAQUINAS*/
SET @SQL = 'SELECT LL.categories,
					c.NOMBRE as stack, c.NOMBRE as seriesname, 
					CONVERT(NUMERIC(18,2),AVG(C.valor)) as seriesdata,
					LL.Posicion
				FROM (

				SELECT ''L'' + convert(varchar(10),L.NumeroLinea)  +'' - ''+ M.Descripcion as categories, ID_MAQUINA, SHC_WORK_SCHED_DAY_PK, Sum([TIEMPO_PLANIFICADO]) AS TIEMPO_PLANIFICADO,Sum(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO,Sum(TIEMPO_NETO) AS TIEMPO_NETO
				,M.POSICION
				FROM COB_MSM_PROD_LLENADORA_HORA
				INNER JOIN Maquinas M ON ID_MAQUINA = M.Id  @MAQ
				INNER JOIN LINEAS L ON M.LINEA = L.ID  @LINEA
				INNER JOIN Turnos T ON SHC_WORK_SCHED_DAY_PK = t.Id  @FECHA
				GROUP BY ID_MAQUINA, SHC_WORK_SCHED_DAY_PK,L.NumeroLinea,M.Descripcion,M.POSICION
				UNION ALL

				SELECT ''L'' + convert(varchar(10),L.NumeroLinea)  +'' - ''+ M.Descripcion as categories, ID_MAQUINA, SHC_WORK_SCHED_DAY_PK, Sum([TIEMPO_PLANIFICADO]) AS TIEMPO_PLANIFICADO,Sum(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO,Sum(TIEMPO_NETO) AS TIEMPO_NETO
				,M.POSICION
				FROM COB_MSM_PROD_RESTO_MAQ_HORA
					INNER JOIN Maquinas M ON ID_MAQUINA = M.Id  @MAQ
					INNER JOIN LINEAS L ON M.LINEA = L.ID  @LINEA
					INNER JOIN Turnos T ON SHC_WORK_SCHED_DAY_PK = t.Id  @FECHA 
				GROUP BY ID_MAQUINA, SHC_WORK_SCHED_DAY_PK,L.NumeroLinea,M.Descripcion,M.POSICION
				) LL

				CROSS APPLY 
				(
				SELECT ''Disponibilidad'', case when LL.TIEMPO_PLANIFICADO = 0 then 0 else convert(numeric(18,2),((TIEMPO_OPERATIVO)/[TIEMPO_PLANIFICADO]) * 100) end as Disponibilidad
				UNION ALL
				SELECT ''Eficiencia'', case when LL.TIEMPO_OPERATIVO = 0 then 0 else convert(numeric(18,2),((TIEMPO_NETO)/TIEMPO_OPERATIVO) * 100) end as Eficiencia
				UNION ALL
				SELECT ''OEE'', case when LL.TIEMPO_OPERATIVO = 0 OR LL.[TIEMPO_PLANIFICADO]=0 then 0 else convert(numeric(18,2),((LL.[TIEMPO_OPERATIVO]/LL.[TIEMPO_PLANIFICADO]) * (LL.[TIEMPO_NETO]/LL.[TIEMPO_OPERATIVO]))*100.0) end as OEE
				) C (NOMBRE, VALOR)			
				GROUP BY LL.categories,LL.Posicion, C.NOMBRE
				order by C.Nombre, LL.POSICION ASC'

			IF (@linea <> '')
				SET @SQL = REPLACE(@SQL, '@LINEA', ' AND L.ID = ''' + @linea + '''')
			ELSE
				SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini > 0 AND @ffin>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea <> '' 
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea = '' 
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
			ELSE IF @ffin=0 and @fini = 0
				SET @SQL = REPLACE(@SQL, '@FECHA', '')

				if @maq=''
					SET @SQL = REPLACE(@SQL, '@MAQ', '')
				else
					SET @SQL = REPLACE(@SQL, '@MAQ', ' AND M.ID IN (' + @maq + ')')

		END





		/*************************************************************************************************/
		/*************************************************************************************************/
		/*************************************************************************************************/


		/************************************************************************************************
	
		GRAFICOS DE BARRAS SIMPLES 

		IDS: 7

		*************************************************************************************************/

		IF @ID=7
		/*TIEMPO PARADA MAQUINAS (BARRAS)*/
		BEGIN

SET @SQL = 'SELECT ''L'' + CONVERT(VARCHAR(2),L.NumeroLinea) + '' '' + M.Descripcion as categories,
				CONVERT(NUMERIC(18,0),(SUM(LL.TIEMPO_PLANIFICADO)-SUM(LL.TIEMPO_NETO))/60) AS data
				FROM (
				SELECT SHC_WORK_SCHED_DAY_PK, ID_MAQUINA, TIEMPO_PLANIFICADO, TIEMPO_NETO FROM COB_MSM_PROD_LLENADORA_HORA
				UNION ALL
				SELECT SHC_WORK_SCHED_DAY_PK, ID_MAQUINA, TIEMPO_PLANIFICADO, TIEMPO_NETO FROM COB_MSM_PROD_RESTO_MAQ_HORA
				) LL
				INNER JOIN MAQUINAS M ON M.ID=LL.ID_MAQUINA @MAQ
				INNER JOIN TURNOS T ON T.ID=LL.SHC_WORK_SCHED_DAY_PK @FECHA
				INNER JOIN LINEAS L ON L.ID=T.Linea @LINEA
				GROUP BY L.NumeroLinea, M.Descripcion, M.Posicion
				ORDER BY L.NumeroLinea, M.Posicion ASC'

			IF (@linea <> '')
				SET @SQL = REPLACE(@SQL, '@LINEA', ' AND M.LINEA = ''' + @linea + '''')
			ELSE
				SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini > 0 AND @ffin>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno  ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ''''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
			ELSE IF @ffin=0 and @fini = 0
				SET @SQL = REPLACE(@SQL, '@FECHA', '')


				if @maq=''
					SET @SQL = REPLACE(@SQL, '@MAQ', '')
				else
					SET @SQL = REPLACE(@SQL, '@MAQ', ' AND M.ID IN (' + @maq + ')')
		END



		/*************************************************************************************************/
		/*************************************************************************************************/
		/*************************************************************************************************/



		/************************************************************************************************
	
		GRAFICOS DE TARTA 

		IDS: 3, 5 Y 6

		*************************************************************************************************/

		IF @id=2 OR @id=4 or @id=5
			BEGIN

			IF @id=2
			/*DISTRIBUCION DE CAUSAS DE PARO*/
SET @SQL = 'SELECT ISNULL(MotivoNombre,''Sin definir'') + ISNULL('' '' + CausaNombre, '''') as category, 
						case
						when count(*)*100/(SUM(COUNT(*)) OVER()) = 0 then 0.3
						else count(*)*100/(SUM(COUNT(*)) OVER()) end as value 
						FROM ParosPerdidas PP
						INNER JOIN TURNOS T ON T.ID = PP.TURNO @FECHA
						INNER JOIN LINEAS L ON PP.IdLinea = L.NumeroLinea @LINEA
						GROUP BY CausaNombre, MotivoNombre'


			IF (@linea <> '')
				SET @SQL = REPLACE(@SQL, '@LINEA', ' AND L.NOMBRE = ''' + @linea + '''')
			ELSE
				SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+'''>= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini > 0 AND @ffin>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno  ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini = 0 and @ffin >0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+'''<= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @FFIN = 0 and @fini>0 AND @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
			ELSE IF @ffin=0 and @fini = 0
				SET @SQL = REPLACE(@SQL, '@FECHA', '')
			END



		/*************************************************************************************************/
		/*************************************************************************************************/
		/*************************************************************************************************/

		/************************************************************************************************
	
		GRAFICOS DE LINEA 

		IDS: 1,2,7,11 Y 12

		*************************************************************************************************/

		IF @ID=11
		/*RENDIMIENTO LINEAS SEMANA*/
				BEGIN
				IF @id=11
SET @SQL = 'Select CONVERT(VARCHAR(100), S.AÑO) + '' SEMANA '' + CONVERT(VARCHAR(100), S.SEMANA) AS categories,
				''Rendimiento'' as seriesname,
				case when sum(Velocidad_NOMINAL) = 0 then 0 else convert(numeric(18,2),(avg(CONTADOR_PRODUCCION)/avg(VELOCIDAD_NOMINAL)*100)) end as seriesdata
				FROM COB_MSM_PROD_LLENADORA_HORA LL 
				inner join Maquinas OA on OA.Id = LL.ID_MAQUINA @LINEA
				INNER JOIN SEMANAS S ON LL.FECHA_INICIO BETWEEN S.INICIO AND S.FIN @ANYO @SEMANA
				GROUP BY S.AÑO, s.SEMANA
				order by seriesname, S.AÑO, S.Semana asc'


				IF (@anyo > 0)
					SET @SQL = REPLACE(@SQL, '@ANYO', ' AND S.AÑO = ' + CONVERT(VARCHAR(100), @anyo))
				ELSE
					SET @SQL = REPLACE(@SQL, '@ANYO', '')

				IF (@semana > 0)
					IF (@rangos > 0)
						SET @SQL = REPLACE(@SQL, '@SEMANA', ' AND S.SEMANA BETWEEN ' + CONVERT(VARCHAR(100), @semana) + ' AND ' + CONVERT(VARCHAR(100), (@semana + @rangos)))
					ELSE
						SET @SQL = REPLACE(@SQL, '@SEMANA', ' AND S.SEMANA = ' + CONVERT(VARCHAR(100), @semana))
				ELSE
						SET @SQL = REPLACE(@SQL, '@SEMANA', '')

	
				IF @id<11
						IF (@linea <> '')
							SET @SQL = REPLACE(@SQL, '@LINEA', ' AND OA.IDLINEA = ''' + @linea + '''')
						ELSE
							SET @SQL = REPLACE(@SQL, '@LINEA', '')
				ELSE
						IF (@linea <> '')
							SET @SQL = REPLACE(@SQL, '@LINEA', ' AND OA.LINEA = ''' + @linea + '''')
						ELSE
							SET @SQL = REPLACE(@SQL, '@LINEA', '')


		END
		ELSE
				IF @ID=6 OR @ID=10
				BEGIN

				IF @ID=6
				/*RENDIMIENTO DE LINEAS*/
SET @SQL = 'SELECT CASE
				WHEN T.IdTipoTurno=1 THEN convert(varchar(10),T.Fecha,103) + '' Mañana''
				WHEN T.IdTipoTurno=2 THEN convert(varchar(10),T.Fecha,103) + '' Tarde''
				WHEN T.IdTipoTurno=3 THEN convert(varchar(10),T.Fecha,103) + '' Noche''
				ELSE convert(varchar(10),T.Fecha,103) + '' No productivo''
				end as categories, ''Rendimiento mecánico'' as seriesname,CASE when sum(LL.Velocidad_NOMINAL) = 0 then 0 else convert(numeric(18,2),(sum(LL.CONTADOR_PRODUCCION)/sum(LL.VELOCIDAD_NOMINAL)*100)) end as ''seriesdata''
				FROM COB_MSM_PROD_LLENADORA_HORA LL
				INNER JOIN Turnos T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
				WHERE 1=1 @LINEA @FECHA
				group by T.Fecha, T.IdTipoTurno
				order by seriesname, T.Fecha, T.IdTipoTurno asc'

				IF @ID=10
				/*OEE LINEAS*/
SET @SQL = 'SELECT LL.categories,
					c.NOMBRE as stack, c.NOMBRE as seriesname, 
					CONVERT(NUMERIC(18,2),AVG(C.valor)) as seriesdata
					,LL.Fecha,LL.IdTipoTurno
				FROM (

				SELECT T.Fecha, T.IdTipoTurno, CASE
				WHEN T.IdTipoTurno=1 THEN convert(varchar(10),T.Fecha,103) + '' Mañana''
				WHEN T.IdTipoTurno=2 THEN convert(varchar(10),T.Fecha,103) + '' Tarde''
				WHEN T.IdTipoTurno=3 THEN convert(varchar(10),T.Fecha,103) + '' Noche''
				ELSE convert(varchar(10),T.Fecha,103) + '' No productivo''
				end as categories,''L'' + convert(varchar(10),L.NumeroLinea)  +'' - ''+ L.Descripcion as Linea, SHC_WORK_SCHED_DAY_PK, Sum([TIEMPO_PLANIFICADO]) AS TIEMPO_PLANIFICADO,Sum(TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO,Sum(TIEMPO_NETO) AS TIEMPO_NETO
				
				FROM COB_MSM_PROD_LLENADORA_HORA
				INNER JOIN Maquinas M ON ID_MAQUINA = M.Id 
				INNER JOIN LINEAS L ON M.LINEA = L.ID  
				INNER JOIN Turnos T ON SHC_WORK_SCHED_DAY_PK = t.Id  @FECHA @LINEA
				GROUP BY  SHC_WORK_SCHED_DAY_PK,L.NumeroLinea,L.Descripcion,T.IdTipoTurno,T.Fecha
				
				) LL

				CROSS APPLY 
				(
				SELECT LL.Linea +  '' Disponibilidad'', case when LL.TIEMPO_PLANIFICADO = 0 then 0 else convert(numeric(18,2),((TIEMPO_OPERATIVO)/[TIEMPO_PLANIFICADO]) * 100) end as Disponibilidad
				UNION ALL
				SELECT LL.Linea +  '' Eficiencia'', case when LL.TIEMPO_OPERATIVO = 0 then 0 else convert(numeric(18,2),((TIEMPO_NETO)/TIEMPO_OPERATIVO) * 100) end as Eficiencia
				UNION ALL
				SELECT LL.Linea +  '' OEE'', case when LL.TIEMPO_OPERATIVO = 0 OR LL.[TIEMPO_PLANIFICADO]=0 then 0 else convert(numeric(18,2),((LL.[TIEMPO_OPERATIVO]/LL.[TIEMPO_PLANIFICADO]) * (LL.[TIEMPO_NETO]/LL.[TIEMPO_OPERATIVO]))*100.0) end as OEE
				) C (NOMBRE, VALOR)			
				GROUP BY LL.categories, C.NOMBRE,LL.Fecha,LL.IdTipoTurno
				order by C.Nombre,LL.Fecha,LL.IdTipoTurno,LL.categories ASC'


				IF (@linea <> '')
					SET @SQL = REPLACE(@SQL, '@LINEA', ' AND T.LINEA = ''' + @linea + '''')
				ELSE
					SET @SQL = REPLACE(@SQL, '@LINEA', '')

			

				--PARA LAS FECHAS TENEMOS VARIAS OPCIONES
			IF @fini > 0 AND @ffin>0 and @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini > 0 AND @ffin>0 and @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' AND '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno AND 
				'''+CONVERT(VARCHAR(100),@FechaFin,120)+''' >= T.FinTurno ')
			ELSE IF @fini = 0 and @ffin >0 and @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+''' <= T.InicioTurno and T.Linea='''+@linea+''' ')
			ELSE IF @fini = 0 and @ffin >0 and @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaInicio,120)+'''  <= T.InicioTurno ')
			ELSE IF @FFIN = 0 and @fini>0 and @linea <> ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno and T.Linea='''+@linea+''' ')
			ELSE IF @FFIN = 0 and @fini>0 and @linea = ''
				SET @SQL = REPLACE(@SQL, '@FECHA', ' '''+CONVERT(VARCHAR(100),@FechaFin,120)+''' <= T.FinTurno ')
			ELSE IF @ffin=0 and @fini = 0
				SET @SQL = REPLACE(@SQL, '@FECHA', '')

				END




				/*************************************************************************************************/
				/*************************************************************************************************/
				/*************************************************************************************************/




	
					PRINT(@SQL)
EXEC (@SQL)

COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDetalleFiltracion_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerDetalleFiltracion_FAB] 
	-- Add the parameters for the stored procedure here
	@idProducto INT,
	@turnos INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	  -- =============================================
-- SE OBTIENE LAS HORAS DE DIFERENCIA SEGUN 
-- LA CANTIDAD DE TURNOS RECIBIDOS
-- 
-- =============================================

	DECLARE @DiferenciaHorasTurnos INT
	DECLARE @HorasDiferencia INT
	DECLARE @fechaInicio DATETIME
	DECLARE @fechaFin DATETIME

	SELECT @DiferenciaHorasTurnos = TABLA_AVG.AVG_DIF
	FROM
	(SELECT  AVG(FECHA.DIFERENCIA) AVG_DIF
		FROM 
		(SELECT TOP 3  DATEDIFF(HOUR,Inicio,Fin) DIFERENCIA
			FROM [dbo].[TiposTurno]
		) FECHA
	) TABLA_AVG

	SET @HorasDiferencia = @DiferenciaHorasTurnos * @turnos

	SET @fechaInicio = GETDATE()
	SET @fechaFin = DATEADD(HOUR,@HorasDiferencia,GETDATE())


   SELECT 
		LINEAS.NumeroLinea,
		'L'+ CAST(LINEAS.NumeroLinea AS VARCHAR(50)) LINEA_ENVASADO,
		CASE WHEN SUM(TABLA_EXISTENCIA.Existencia) IS NULL THEN  
			CASE WHEN SUM(TABLA_FILTRACION.CantidadPlanificada) IS NULL 
				THEN 
					0 
				ELSE 
					SUM(TABLA_FILTRACION.CantidadPlanificada) 
			END
		ELSE 
			CASE WHEN SUM(TABLA_FILTRACION.CantidadPlanificada) IS NULL 
				THEN 
					CONVERT(FLOAT,SUM(TABLA_EXISTENCIA.Existencia)) 
				ELSE 
					CONVERT(FLOAT,SUM(TABLA_EXISTENCIA.Existencia)) + CONVERT(FLOAT,SUM(TABLA_FILTRACION.CantidadPlanificada)) 
			END  
		END * SUM(TABLA_FILTRACION.HectolitrosProducto) as Existencia,
		SUM(TABLA_FILTRACION.HectolitrosProducto) HectolitrosProducto,
		CASE WHEN SUM(TABLA_FILTRACION.Necesidad) IS NULL 
			THEN 
				0 
			ELSE SUM(TABLA_FILTRACION.Necesidad) 
		END NECESIDAD,
		CASE WHEN SUM(TABLA_EXISTENCIA.RENDIMIENTO_LINEA) > 0 
			THEN 
				CASE WHEN SUM(TABLA_FILTRACION.Necesidad) IS NULL 
					THEN 
						0 
					ELSE 
						(SUM(TABLA_FILTRACION.Necesidad) * 100)/SUM(TABLA_EXISTENCIA.RENDIMIENTO_LINEA) 
				END 
			ELSE 
				0 
		END AS FILTRACIONES
		 FROM (
--============================CONSULTA NECESIDAD SEGUN LINEA==================================================================

	SELECT 
		TABLA_Orden.NumeroLinea,
		SUM(TABLA_Orden.Necesidad) Necesidad,
		SUM(CantidadPlanificada) CantidadPlanificada,
		SUM(TABLA_Orden.HectolitrosProducto) HectolitrosProducto,
		SUM(TABLA_Orden.EnvasesPorPalet) EnvasesPorPalet
	FROM
	(
		select DISTINCT 
			L.NumeroLinea, 
			CASE WHEN SUM(CantidadProducida) IS NULL 
			THEN  
				SUM(CantidadPlanificada)*SUM(EnvasesPorPalet) 
			ELSE 
				CASE WHEN SUM(CantidadProducida) < SUM(CantidadPlanificada) 
								THEN
									SUM(CantidadPlanificada)*SUM(EnvasesPorPalet)-SUM(CantidadProducida)*SUM(EnvasesPorPalet) 
								ELSE
									0
							END
		 END *SUM(HectolitrosProducto) Necesidad,
			SUM(CantidadPlanificada)*SUM(EnvasesPorPalet) as CantidadPlanificada,
			CASE WHEN SUM(HectolitrosProducto) IS NULL THEN 0 ELSE SUM(HectolitrosProducto) END AS HectolitrosProducto,
			SUM(EnvasesPorPalet) EnvasesPorPalet
		from Ordenes O
		INNER JOIN LINEAS L ON L.ID = O.Linea
		WHERE 
			EstadoAct IN ('Creada', 'Iniciando','Producción' ,'Finalizando')
			AND O.IdProducto = @idProducto
			AND FecIniEstimada between @fechaInicio and  @fechaFin
		GROUP BY L.NumeroLinea
	) AS TABLA_Orden
	GROUP BY TABLA_Orden.NumeroLinea
--===========================================================================================================================
) AS TABLA_FILTRACION
RIGHT JOIN 
(
--==============================CONSULTA RENDIMIENTO SEGUN LINEA Y TCP ======================================================

	SELECT 
		LINEAS.NumeroLinea,
		CASE WHEN TABLA_EXISTENCIA.Rendimiento IS NULL THEN 0 ELSE TABLA_EXISTENCIA.Rendimiento END AS RENDIMIENTO_LINEA,
		SUM(TABLA_EXISTENCIA.Existencia) Existencia
	 FROM
	(SELECT 
		Linea_Rendimiento.NumeroLinea,
		Linea_TCP.IdTCP, 
		Linea_Rendimiento.Rendimiento,
		CASE WHEN SUM(Tabla_lote.Quantity) IS NULL THEN 0 ELSE SUM(Tabla_lote.Quantity) END  Existencia
	FROM COB_MSM_LINEA_TCP Linea_TCP	
	INNER JOIN COB_MSM_LINEA_RENDIMIENTO Linea_Rendimiento
	ON Linea_TCP.IdLinea = Linea_Rendimiento.NumeroLinea
	LEFT JOIN  [dbo].[LoteUbicacionMaterial_FAB] Tabla_lote 
	ON Tabla_lote.LOCID = Linea_TCP.IdTCP

	GROUP BY 	Linea_Rendimiento.NumeroLinea,Linea_TCP.IdTCP, Linea_Rendimiento.Rendimiento
	) AS TABLA_EXISTENCIA
	RIGHT JOIN LINEAS ON LINEAS.NumeroLinea = TABLA_EXISTENCIA.NumeroLinea
	RIGHT JOIN Ordenes O ON LINEAS.ID = O.Linea
		WHERE 
	  --Tabla_lote.LastUpdate >= GETDATE()
		EstadoAct IN ('Creada', 'Iniciando','Producción' ,'Finalizando')
			AND O.IdProducto = @idProducto
			AND FecIniEstimada between @fechaInicio and  @fechaFin

	 GROUP BY LINEAS.NumeroLinea, TABLA_EXISTENCIA.RENDIMIENTO
--=====================================================================================================================================
) AS TABLA_EXISTENCIA ON TABLA_EXISTENCIA.NumeroLinea = TABLA_FILTRACION.NumeroLinea
RIGHT JOIN LINEAS ON LINEAS.NumeroLinea = TABLA_EXISTENCIA.NumeroLinea
GROUP BY LINEAS.NumeroLinea

ORDER BY LINEAS.NumeroLinea
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDetalleHistoricoOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [dbo].[MES_ObtenerDetalleHistoricoOrden]	
	@idOrden as varchar(200)
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		DECLARE @ID_CLASE_ETIQUETADORA AS INT;

		SELECT DISTINCT @ID_CLASE_ETIQUETADORA = IdClase
		FROM Maquinas 
		WHERE Clase = 'ETIQUETADORA_PALETS'

		DECLARE @PicosPalets as INT;
		SELECT @PicosPalets = COUNT(IdOrden)
		FROM dbo.Picos
		WHERE IdOrden = @idOrden

		DECLARE @NOCONFORMIDAD AS INT;
		DECLARE @NOCONFORMIDADPALETS AS INT;
		SELECT @NOCONFORMIDAD = SUM(CANTIDAD_ENVASES), @NOCONFORMIDADPALETS = COUNT(ID_PARTICION)
		FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
		WHERE ID_ORDEN = @idOrden 

		DECLARE @Rendimiento as FLOAT;
		SET @Rendimiento = dbo.MES_GetRendimientoWO(@idOrden);

		SELECT
			Ordenes.Linea
			,Ordenes.Id
			,Ordenes.Descripcion
			,IdEstadoAct
			,EstadoAct
			,EstadoAct.color AS ColorAct
			,IdEstadoAnt
			,EstadoAnt
			,EstadoAnt.color AS ColorAnt
			,FecIniEstimada
			,FecFinEstimada
			,FecIniReal
			,FecFinReal
			,Productos.IdProducto
			,Productos.Descripcion AS Producto
			,Productos.IdClase AS IdTipoProducto
			,Productos.Clase + ' ' + CAST(Productos.Gama AS VARCHAR) + ' ' + CAST(Productos.Marca AS VARCHAR) AS TipoProducto
			,Ordenes.CantidadPlanificada
			--,Ordenes.CantidadProducida
			,COALESCE(ConsolidacionEtiquetadoraPalets.PaletsETQProducidos, 0) as PaletsETQProducidos
			,Productos.udMedida
			,Ordenes.VelocidadNominal
			,Ordenes.OEEObjetivo
			,Ordenes.OEECritico
			,Ordenes.codigoJDE
			,Ordenes.Rechazos
			,Ordenes.OEE
			,Ordenes.Disponibilidad
			,Ordenes.Eficiencia
			,Ordenes.RendMecanico
			,Ordenes.Calidad
			,Ordenes.FecHorAct AS RowUpdated
			,Ordenes.EnvasesPorPalet
			,Ordenes.CajasPorPalet
			,Ordenes.HectolitrosProducto
			,Ordenes.CausaPausa
			,po.PaletsProducidos
			,po.CajasProducidas
			,po.EnvasesProducidos
			,po.RechazosAClasificador AS rechazosClasificadorAutomatico
			,po.RechazosAVacios AS rechazosVaciosAutomatico
			,po.RechazosALlenadora AS rechazosSalidaLlenadoraAutomatico
			,po.RechazosAProductoTerminado AS rechazosProductoTerminadoAutomatico
			,Ordenes.PicosCajas
			,@PicosPalets as PicosPalets
			,COALESCE(@NOCONFORMIDAD,0) AS EnvNoConformidad
			,COALESCE(@NOCONFORMIDADPALETS,0) AS EnvNoConformidadPalets
			,COALESCE(@Rendimiento * 100,0)  as Rendimiento
		FROM Ordenes
		INNER JOIN ParametrosOrdenes po
			ON po.IdOrden = Ordenes.Id
		LEFT JOIN EstadosOrden AS EstadoAct
			ON EstadoAct.Id = Ordenes.IdEstadoAct
		LEFT JOIN EstadosOrden AS EstadoAnt
			ON EstadoAnt.Id = Ordenes.IdEstadoAnt
		LEFT JOIN Productos
			ON Productos.IdProducto = Ordenes.IdProducto
		LEFT JOIN Maquinas
			ON Maquinas.Orden = Ordenes.Id
		LEFT JOIN (SELECT
				ID_ORDEN AS IdOrden
				,COALESCE(SUM([CONTADOR_PRODUCCION]), 0) AS PaletsETQProducidos
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML
				ON ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @idOrden
			AND ML.IdClase = @ID_CLASE_ETIQUETADORA
			GROUP BY ID_ORDEN) AS ConsolidacionEtiquetadoraPalets
			ON ConsolidacionEtiquetadoraPalets.IdOrden = Ordenes.Id
		WHERE Ordenes.Id = @idOrden
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDiasFestivos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerDiasFestivos]
	--@anyo as varchar(4)

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT f.*
		FROM [DiasFestivos] f
		INNER JOIN [SITMesDB].[dbo].[md_lang_code] LC ON LC.md_lang_code_pk = f.idioma
		where LC.code = 'ESP'
		order by fecha asc;
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerDiasSemanaDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerDiasSemanaDeslizante]
	

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT * 
		FROM MES_MSM.dbo.DiasSemanaDeslizante
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEnvasesLlenosVacios]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEnvasesLlenosVacios] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as int,
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT C.MENOR_LLENADORA, SUM(C.Envases) 
		FROM
		(SELECT 
			M.MENOR_LLENADORA,
			SUM(CLLH.CONTADOR_RECHAZOS) as Envases
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA CLLH
		INNER JOIN Maquinas m ON m.Id = CLLH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CLLH.FECHA_INICIO>=@desde AND CLLH.FECHA_FIN <=@hasta
		GROUP BY M.MENOR_LLENADORA
		UNION
		SELECT 
			M.MENOR_LLENADORA,
			SUM(CMH.CONTADOR_RECHAZOS) as Envases
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
		INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CMH.FECHA_INICIO>=@desde AND CMH.FECHA_FIN <=@hasta
		GROUP BY M.MENOR_LLENADORA) AS C
		GROUP BY MENOR_LLENADORA
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEquipoAreaSilos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEquipoAreaSilos]
	@AREA as nvarchar(50)
AS
BEGIN



Select E.Descripcion ,L.LOCID, LOTS.[InitQuantity], LOTS.[Quantity], D.DEFNAME, D.DESCRIPT, UOM.UOMID, SN.SERIAL_NUMBER    
from [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].MMvLots LOTS ON LOTS.LOCPK = L.LOCPK
LEFT JOIN [SITMESDB_FAB].[SITMESDB].dbo.[MMvDefVers] DV ON LOTS.DEFVERPK = DV.DEFVERPK
LEFT JOIN [SITMESDB_FAB].[SITMESDB].[dbo].[MMvDefinitions] D ON DV.DEFPK = D.DEFPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMwUoMs] UOM ON UOM.UOMPK = LOTS.UOMPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MTMV1_LOT_SLT_ALL] SN ON SN.LOTPK = LOTS.LOTPK
INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
WHERE ParentLocPK = (SELECT TOP 1 LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] WHERE LOCID LIKE '%' + @area + '%')
ORDER BY L.LOCPK desc
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEquiposConstructivosMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEquiposConstructivosMaquina]
	-- Add the parameters for the stored procedure here
	@idMaquina varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

			--Select convert(varchar(100),idObj) as ID_EQUIPO_CONSTRUCTIVO, ID_MAQUINA, NOMBRE From [dbo].[COB_MSM_EQUIPOS_CONSTRUCTIVOS]
			--where ID_MAQUINA= @idMaquina
			--Cambio hecho para que los equipos constructivos devueltos sean ordenados dependiendo de su aparicion en ParosPerdidas
	
			Select convert(varchar(100),idObj) as ID_EQUIPO_CONSTRUCTIVO, ID_MAQUINA, NOMBRE
		From [dbo].[COB_MSM_EQUIPOS_CONSTRUCTIVOS] EQ
		LEFT JOIN dbo.COB_MSM_PAROS_PERDIDAS PP ON PP.EQUIPO_CONSTRUCTIVO = EQ.IdObj
		where ID_MAQUINA= @idMaquina 
		group by idObj, ID_MAQUINA, NOMBRE
		order by count(PP.EQUIPO_CONSTRUCTIVO) desc, IdObj asc
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEquiposLotes_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEquiposLotes_FAB]
	-- Add the parameters for the stored procedure here
	@salaCoccion varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


Select LocPath as ID, ISNULL(E.[Descripcion],'') as Equipo
, CASE WHEN LocPK NOT IN (SELECT DISTINCT LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLots]) THEN 0 ELSE 1 END AS ConLote
from [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
WHERE --LocPK NOT IN (SELECT DISTINCT LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLots])
--AND 
ParentLocPK = (SELECT TOP 1 LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] WHERE LOCID = @salaCoccion)

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEquiposProced_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEquiposProced_FAB]
	-- Add the parameters for the stored procedure here
	@entryID varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


SELECT --[ID],
	--TableWithRowNumbers.equip_pk as ID,
	[ExecutionEquipmentLongName] as ID,
	[L0EquipmentPropertyValue] as Equipo
	--[ExecutionEquipmentLongName] as Equipo
	--,[ExecutionEquipmentSelected]
	--,[L0EquipmentPropertyValue]
FROM (SELECT ROW_NUMBER() OVER (ORDER BY POMV_ETRY.pom_entry_pk) AS rowN
		,POMV_ETRY.pom_entry_id AS [ID]
		,POMV_EXE_EQPT_1.equip_long_name AS [ExecutionEquipmentLongName]
		,CAST((CASE POMV_EXE_EQPT_1.selected
			WHEN 0 THEN 'False'
			WHEN 1 THEN 'True'
			ELSE 'True'
		END) AS BIT) AS [ExecutionEquipmentSelected]
		,SitSqlCustom_SABEquipment_7.PartialEquipmentID AS [Equipment]
		,BPM_EQUIPMENT_PROPERTY_9.equip_prpty_value AS [L0EquipmentPropertyValue]
		,BPM_EQUIPMENT_PROPERTY_11.equip_prpty_value AS [L1EquipmentPropertyValue]
		,BPMV_EQPT_6.equip_pk AS equip_pk
	FROM [SITMESDB_FAB].SITMesDB.dbo.POMV_ETRY
	JOIN [SITMESDB_FAB].SITMesDB.dbo.POMV_EXE_EQPT AS POMV_EXE_EQPT_1
		ON (POMV_ETRY.pom_entry_pk = POMV_EXE_EQPT_1.pom_entry_pk)
	JOIN [SITMESDB_FAB].SITMesDB.dbo.BPMV_EQPT AS BPMV_EQPT_6
		ON (POMV_EXE_EQPT_1.equip_pk = BPMV_EQPT_6.equip_pk)
	JOIN (SELECT
		[BPM_EQUIPMENT].equip_pk AS EquipmentPK
		,[BPM_EQUIPMENT].equip_id AS FullEquipmentID
		,CASE
			WHEN BPM_EQUIPMENT_CLASS_1.equip_class_id = 'SAB-EQUS.SAB-BRH_VU' OR
				BPM_EQUIPMENT_CLASS_1.equip_class_id = 'SAB-EQUS.VIRTUALUNIT' THEN SUBSTRING((SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id))), (PATINDEX('%.%', SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id))) + 1), (LEN(SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id)))) - 7)
			ELSE SUBSTRING((SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id))), (PATINDEX('%.%', SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id))) + 1), (LEN(SUBSTRING([BPM_EQUIPMENT].equip_id, (PATINDEX('%.%', [BPM_EQUIPMENT].equip_id) + 1), LEN([BPM_EQUIPMENT].equip_id)))))
		END PartialEquipmentID
		,BPM_EQUIPMENT_CLASS_1.equip_class_id AS [EquipmentClassID]
	FROM [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT
	JOIN [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT_CLASS_LEVEL
		ON BPM_EQUIPMENT.equip_class_lvl_pk = BPM_EQUIPMENT_CLASS_LEVEL.equip_class_lvl_pk
	JOIN [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT_CLASS AS BPM_EQUIPMENT_CLASS_1
		ON (BPM_EQUIPMENT.equip_class_pk = BPM_EQUIPMENT_CLASS_1.equip_class_pk)
	JOIN [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT_CLASS_LEVEL AS BPM_EQUIPMENT_CLASS_LEVEL_2
		ON BPM_EQUIPMENT_CLASS_1.EQUIP_CLASS_LVL_PK = BPM_EQUIPMENT_CLASS_LEVEL_2.EQUIP_CLASS_LVL_PK) SitSqlCustom_SABEquipment_7
		ON (BPMV_EQPT_6.equip_pk = SitSqlCustom_SABEquipment_7.EquipmentPK)
	LEFT JOIN [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS BPM_EQUIPMENT_PROPERTY_9
		ON (BPMV_EQPT_6.equip_pk = BPM_EQUIPMENT_PROPERTY_9.equip_pk)
		AND BPM_EQUIPMENT_PROPERTY_9.equip_prpty_id = N'OBJECT-LABEL'
	LEFT JOIN [SITMESDB_FAB].SITMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS BPM_EQUIPMENT_PROPERTY_11
		ON (BPMV_EQPT_6.equip_pk = BPM_EQUIPMENT_PROPERTY_11.equip_pk)
		AND BPM_EQUIPMENT_PROPERTY_11.equip_prpty_id = N'L1'
	WHERE POMV_ETRY.pom_entry_id = @entryID) AS TableWithRowNumbers
	order by [ExecutionEquipmentSelected] desc


END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEquiposSinLote_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEquiposSinLote_FAB]
	-- Add the parameters for the stored procedure here
	@salaCoccion int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @PATH AS VARCHAR(200) = (SELECT [equip_id] FROM [SITMESDB_FAB].[SITMesDb].[dbo].[BPMV_EQPT] WHERE [equip_pk] = @salaCoccion)


Select L.LocPK as ID, ISNULL(E.[Descripcion],'') + ' - ' + L.LocID as Equipo from [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
WHERE --LocPK NOT IN (SELECT DISTINCT LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLots])
--AND 
ParentLocPK = (SELECT TOP 1 LocPK FROM [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] WHERE LOCPATH = @PATH)
AND E.Tipo_Ubicacion IN ('ALMACENAMIENTO_Y_CONSUMO','PREPARACION','ALMACENAMIENTO')
order by ISNULL(E.[Descripcion],'') asc

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEstadoHistoricoMaquinas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerEstadoHistoricoMaquinas]
	-- Add the parameters for the stored procedure here
	@idLinea as nvarchar(200),
	@idMaquina as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	   SELECT [FecInicio]
		  ,[FecFin]
		  ,[Linea]
		  ,[Zona]
		  ,[IdMaquina]
		  ,[Estado]
	  FROM [EstadoHistoricoMaquinas]
	   where Linea =  @idLinea 
		and idMaquina = @idMaquina
		AND [FecInicio]>=@desde
		AND [Fecfin]<=@hasta
		ORDER BY [FecInicio] DESC
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerEstadoOrdenFecha]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_ObtenerEstadoOrdenFecha]
	@idParticion as nvarchar(200),
	@fIni as datetime,
	@fFin as datetime
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT 
		EstadosOrden.Id,
		EstadosOrden.Estado,
		COB_MSM_HISTORICO_ORDENES.FECHA_CAMBIO
		FROM COB_MSM_HISTORICO_ORDENES  
		INNER JOIN EstadosOrden  ON EstadosOrden.Id = COB_MSM_HISTORICO_ORDENES.ESTADO
		WHERE 
		COB_MSM_HISTORICO_ORDENES.ORDER_ID = @idParticion
		AND COB_MSM_HISTORICO_ORDENES.FECHA_CAMBIO<@fFin
		AND COB_MSM_HISTORICO_ORDENES.FECHA_CAMBIO>DATEADD(WEEK,-1,@fIni)
		ORDER BY COB_MSM_HISTORICO_ORDENES.FECHA_CAMBIO DESC
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerFiltracionesTurno_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerFiltracionesTurno_FAB] 
	-- Add the parameters for the stored procedure here
		@turnos INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- =============================================
-- SE OBTIENE LAS HORAS DE DIFERENCIA SEGUN 
-- LA CANTIDAD DE TURNOS RECIBIDOS
-- 
-- =============================================

	DECLARE @DiferenciaHorasTurnos INT
	DECLARE @HorasDiferencia INT
	DECLARE @fechaInicio DATETIME
	DECLARE @fechaFin DATETIME

	SELECT @DiferenciaHorasTurnos = TABLA_AVG.AVG_DIF
	FROM
	(SELECT  AVG(FECHA.DIFERENCIA) AVG_DIF
		FROM 
		(SELECT TOP 3  DATEDIFF(HOUR,Inicio,Fin) DIFERENCIA
			FROM [dbo].[TiposTurno]
		) FECHA
	) TABLA_AVG

	SET @HorasDiferencia = @DiferenciaHorasTurnos * @turnos

	SET @fechaInicio = GETDATE()
	SET @fechaFin = DATEADD(HOUR,@HorasDiferencia,GETDATE())

-- =============================================
	SELECT
	    TABLA_AUX.IdProducto,
		TABLA_AUX.CERVEZA,
		SUM(TABLA_AUX.EXISTENCIA) EXISTENCIA,
		SUM(TABLA_AUX.NECESIDAD) NECESIDAD,
		SUM(TABLA_AUX.FILTRACIONES) FILTRACIONES
	FROM
	(SELECT 
			TABLA_EXISTENCIA.IdProducto,
			Tabla_Unidad.DESC_Marca AS CERVEZA,
			CASE WHEN SUM(TABLA_EXISTENCIA.Existencia) IS NULL 
				THEN  
					CASE WHEN SUM(TABLA_FILTRACION.CantidadPlanificada) IS NULL 
						THEN 
							0 
						ELSE 
							SUM(TABLA_FILTRACION.CantidadPlanificada) END
				ELSE 
					CASE WHEN SUM(TABLA_FILTRACION.CantidadPlanificada) IS NULL 
						THEN 
							CONVERT(FLOAT,SUM(TABLA_EXISTENCIA.Existencia)) 
						ELSE 
							CONVERT(FLOAT,SUM(TABLA_EXISTENCIA.Existencia)) + CONVERT(FLOAT,SUM(TABLA_FILTRACION.CantidadPlanificada)) 
						END 
					END * SUM(TABLA_FILTRACION.HectolitrosProducto) as EXISTENCIA,
			CASE WHEN SUM(TABLA_FILTRACION.Necesidad) IS NULL 
				THEN 
					0 
				ELSE 
					SUM(TABLA_FILTRACION.Necesidad) END NECESIDAD,
			CASE WHEN SUM(TABLA_EXISTENCIA.RENDIMIENTO_LINEA) > 0 
				THEN 
					CASE WHEN SUM(TABLA_FILTRACION.Necesidad) IS NULL 
						THEN 
							0 
						ELSE 
							(SUM(TABLA_FILTRACION.Necesidad) * 100)/SUM(TABLA_EXISTENCIA.RENDIMIENTO_LINEA) END ELSE 0 END AS FILTRACIONES
	FROM (
  -- ============================================= CONSULTA NECESIDAD SEGUN PRODUCTO ==============================================
			SELECT 
				TABLA_Orden.IdProducto,
				SUM(TABLA_Orden.Necesidad) Necesidad ,
				SUM(CantidadPlanificada) CantidadPlanificada ,
				SUM(TABLA_Orden.HectolitrosProducto) HectolitrosProducto,
				SUM(EnvasesPorPalet) EnvasesPorPalet
				
			FROM
			(
				select DISTINCT 
					O.IdProducto, 
					CASE WHEN SUM(CantidadProducida) IS NULL 
						THEN  
							SUM(CantidadPlanificada * EnvasesPorPalet) 
						ELSE 
							CASE WHEN SUM(CantidadProducida) < SUM(CantidadPlanificada) 
								THEN
									(SUM(CantidadPlanificada)*SUM(EnvasesPorPalet))-(SUM(CantidadProducida)*SUM(EnvasesPorPalet))
								ELSE
									0
							END
					END *SUM(HectolitrosProducto) Necesidad,
					SUM(CantidadPlanificada)*SUM(EnvasesPorPalet) as CantidadPlanificada,
					CASE WHEN SUM(HectolitrosProducto) IS NULL THEN 0 ELSE SUM(HectolitrosProducto) END AS HectolitrosProducto,
					SUM(EnvasesPorPalet) EnvasesPorPalet
				from Ordenes O
				WHERE 
					EstadoAct IN ('Creada', 'Iniciando','Producción' ,'Finalizando')
					AND
					FecIniEstimada between @fechaInicio and  @fechaFin
				GROUP BY O.IdProducto
			) AS TABLA_Orden 
			 GROUP BY TABLA_Orden.IdProducto
 --================================================================================================================================
		)  AS TABLA_FILTRACION
	RIGHT JOIN 
		(
--===========================================CONSULTA RENDIMIENTO SEGUN LINEA Y TCP ===============================================

			SELECT 
				O.IdProducto,
				CASE WHEN TABLA_EXISTENCIA.Rendimiento IS NULL THEN 0 ELSE TABLA_EXISTENCIA.Rendimiento END AS RENDIMIENTO_LINEA,
				SUM(TABLA_EXISTENCIA.Existencia)  as Existencia,
				SUM(O.HectolitrosProducto) HectolitrosProducto
			 FROM
			(SELECT 
				Linea_Rendimiento.NumeroLinea,
				Linea_TCP.IdTCP, 
				Linea_Rendimiento.Rendimiento,
				CASE WHEN SUM(Tabla_lote.Quantity) IS NULL THEN 0 ELSE SUM(Tabla_lote.Quantity) END  Existencia
			FROM dbo.COB_MSM_LINEA_TCP Linea_TCP	
			INNER JOIN dbo.COB_MSM_LINEA_RENDIMIENTO Linea_Rendimiento
			ON Linea_TCP.IdLinea = Linea_Rendimiento.NumeroLinea
			LEFT JOIN  [dbo].[LoteUbicacionMaterial_FAB] Tabla_lote 
			ON Tabla_lote.LOCID = Linea_TCP.IdTCP

			GROUP BY 	Linea_Rendimiento.NumeroLinea,Linea_TCP.IdTCP, Linea_Rendimiento.Rendimiento
			) AS TABLA_EXISTENCIA
			RIGHT JOIN LINEAS ON LINEAS.NumeroLinea = TABLA_EXISTENCIA.NumeroLinea
			RIGHT JOIN Ordenes O ON LINEAS.ID = O.Linea
				WHERE 
				 FecIniEstimada between @fechaInicio and  @fechaFin
				 AND
				 EstadoAct IN ('Creada', 'Iniciando','Producción' ,'Finalizando')
           GROUP BY O.IdProducto, TABLA_EXISTENCIA.RENDIMIENTO
--===============================================================================================================================================
) AS TABLA_EXISTENCIA ON TABLA_EXISTENCIA.IdProducto = TABLA_FILTRACION.IdProducto
INNER JOIN  [MSMIS].[dbo].[VISUnidadExpedicion] Tabla_Unidad 
ON Tabla_Unidad.CodigoExpedicion = TABLA_EXISTENCIA.IdProducto COLLATE SQL_Latin1_General_CP1_CI_AS
GROUP BY TABLA_EXISTENCIA.IdProducto,Tabla_Unidad.DESC_Marca
) AS TABLA_AUX
GROUP BY TABLA_AUX.IdProducto,TABLA_AUX.CERVEZA
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHectolitrosProducto]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerHectolitrosProducto]
	@producto as nvarchar(64)
AS
BEGIN

	SET NOCOUNT ON
	
	DECLARE @PartNo as varchar(max);
	DECLARE @ItemMaterials TABLE (PartNo NVARCHAR(20),ComponentPartNo NVARCHAR(20), UomName NVARCHAR(60), Quantity numeric(16,6), Revision numeric(8,0));
	DECLARE @QUERYMATERIALS AS NVARCHAR(MAX);
	
	set @QUERYMATERIALS = 'select * from OPENQUERY(INTERSPEC,''
	
	WITH ItemMaterials (PartNo,ComponentPartNo, UomName, Quantity, Revision)
	AS
	(
		SELECT PartNo,ComponentPartNo, UomName, Quantity, Revision
		FROM [MSMIS].[INTERSPC].[ItBomItem]
		WHERE PartNo = '''''+@producto+''''' 
		UNION ALL
		SELECT itb.PartNo, itb.ComponentPartNo, itb.UomName, itb.Quantity, itb.Revision
		FROM [MSMIS].[INTERSPC].[ItBomItem] itb
		INNER JOIN ItemMaterials p on p.ComponentPartNo = itb.PartNo
		
	) select distinct PartNo,ComponentPartNo, UomName, Quantity, Revision from ItemMaterials'')'

	INSERT INTO @ItemMaterials 
	EXEC(@QUERYMATERIALS)

	SELECT @PartNo = PartNo
	FROM
		(SELECT DISTINCT PartNo 
		FROM @ItemMaterials
		where LOWER(UomName) = 'hl') AS a

	DECLARE @Revision TABLE (Revision numeric(8,0));
	DECLARE @QUERY as NVARCHAR(MAX);
	SET @QUERY = 'SELECT a.* FROM OPENQUERY(INTERSPEC,''select [MSMIS].[INTERSPC].f_get_att_rev('''''+@PartNo+''''',null)'') a'

	INSERT INTO @Revision 
	EXEC(@QUERY)

	SELECT TOP(1) COALESCE(Quantity, 0) as HectolitrosEnvase 
	FROM @ItemMaterials itm
	INNER JOIN @Revision r ON r.RevisIon = itm.Revision
	WHERE LOWER(itm.UomName) = 'hl'

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHectolitrosProductoOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerHectolitrosProductoOrdenes]
	@ordenes as StringList READONLY
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT
			Id as ID_ORDEN,
			HectolitrosProducto
		FROM Ordenes 
		INNER JOIN	@ordenes o ON o.Item = Id
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHistoricoOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[MES_ObtenerHistoricoOrden]
	@idOrden as varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	  SELECT 
	  ID_CAMBIO as IdCambio,
	  ID_ORDEN as IdOrden,
	  FECHA_CAMBIO as FechaCambio,
	  EstadosOrden.Id as IdEstado,
	  EstadosOrden.Estado,
	  EstadosOrden.color as Color
	  FROM HistoricoOrdenes
	  inner join EstadosOrden on HistoricoOrdenes.ESTADO = EstadosOrden.Id
	  where ID_ORDEN=@idOrden
	  order by FECHA_CAMBIO desc, HistoricoOrdenes.ESTADO
  
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHistoricoOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerHistoricoOrdenes]	
	@fIni as datetime,
	@fFin as datetime
AS
BEGIN
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT DISTINCT
			Ordenes.Linea,
			Ordenes.Id,
			Ordenes.Descripcion,
			IdEstadoAct,
			EstadoAct,
			EstadoAct.color AS ColorAct,
			IdEstadoAnt,
			EstadoAnt,
			EstadoAnt.color AS ColorAnt,
			FecIniEstimada,
			FecFinEstimada,
			FecIniReal,
			FecFinReal,
			Productos.IdProducto,
			Productos.Descripcion AS Producto,
			Productos.IdClase AS IdTipoProducto,
			Productos.Clase + ' ' + CAST(Productos.Gama AS VARCHAR) + ' ' + CAST(Productos.Marca AS VARCHAR) AS TipoProducto,
			Productos.udMedida,
			Ordenes.CantidadPlanificada,
			Ordenes.CantidadProducida,
			Ordenes.OEE,
			Ordenes.PicosCajas,
			Ordenes.OeeCritico,
			Ordenes.OeeObjetivo,
			Ordenes.VelocidadNominal
			--[dbo].[GetNumParticionesOrden](Ordenes.Id) as NumParticiones	
		FROM Ordenes
		LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Ordenes.IdEstadoAct
		LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Ordenes.IdEstadoAnt
		LEFT JOIN Productos ON Productos.IdProducto = Ordenes.IdProducto
		WHERE (Ordenes.EstadoAct = 'Cerrada' AND (CONVERT(DATE,FecFinReal) BETWEEN @fIni AND @fFin)) or (Ordenes.EstadoAct = 'Cancelada' AND (CONVERT(DATE,FecHorAct) BETWEEN @fIni AND @fFin))
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHistoricoOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[MES_ObtenerHistoricoOrdenTurno]
	@idOrden as varchar(200)
	,@idTurno as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	  SELECT 
			h.[$IDArchiveValue] as IdHistorico
			,h.ORDER_ID
			,h.FECHA_CAMBIO
			,h.ESTADO
	  FROM COB_MSM_HISTORICO_ORDENES h
	  inner join EstadosOrden on h.ESTADO = EstadosOrden.Id
	  inner join SITMesDB.dbo.POMV_ORDR o on o.pom_order_id =  h.ORDER_ID 
	  LEFT OUTER JOIN dbo.ParametrosLinea pl ON o.ppr_name = pl.PPR	  
	  inner join Turnos on h.FECHA_CAMBIO BETWEEN Turnos.InicioTurno AND Turnos.FinTurno AND Turnos.Linea = pl.idLinea AND Turnos.Id = @idTurno
	  where ORDER_ID=@idOrden AND EstadosOrden.Estado IN ('Iniciando','Producción','Finalizando')  
  
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerHorasContingencias]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerHorasContingencias]
	-- Add the parameters for the stored procedure here
    @fecha bigint,
	@turno tinyint,
	@linea varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		declare @horamin as int
		declare @horamax as int

		SELECT Top 1 @horamin=DATEPART(Hour,InicioTurno), @horamax=DATEPART(Hour,FinTurno)-1
		  FROM [dbo].[Turnos]
		  where datediff(s, '1970-1-1' ,convert(date, Fecha)) =@fecha+3600 and 
		  IdTipoTurno=@turno and linea like '%' + @linea +'%'

		  print @horamin
		  print @horamax

		  Select Hora as ID, Hora as Hora,
		  ISNULL(ENVASES_LLENADORA,0) as 'eLlenadora',
		  ISNULL(ENVASES_PALETIZADORA,0) as 'pPaletizadora',
		  ISNULL(ENVASES_RECHAZADOS,0) AS 'rLlenadora',
		  0 AS rPaletizadora,
		  idturno as Turno,
		  FECHA as Fecha
		  from [dbo].[ProduccionHoras]
		  where hora between @horamin and @horamax and datediff(s, '1970-1-1' ,convert(date, Fecha))=@fecha+3600
		  and Linea like '%' + @linea + '%' 
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerInfoEquipoSiloMalta]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerInfoEquipoSiloMalta]
	@Equipo as int
AS
BEGIN

Select E.Descripcion ,L.LOCID, LOTS.[InitQuantity], LOTS.[Quantity], D.DEFNAME, D.DESCRIPT, UOM.UOMID, SN.SERIAL_NUMBER    
from [SITMESDB_FAB].[SITMesDB].[dbo].[MMvLocations] L
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].MMvLots LOTS ON LOTS.LOCPK = L.LOCPK
LEFT JOIN [SITMESDB_FAB].[SITMESDB].dbo.[MMvDefVers] DV ON LOTS.DEFVERPK = DV.DEFVERPK
LEFT JOIN [SITMESDB_FAB].[SITMESDB].[dbo].[MMvDefinitions] D ON DV.DEFPK = D.DEFPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MMwUoMs] UOM ON UOM.UOMPK = LOTS.UOMPK
LEFT JOIN [SITMESDB_FAB].[SITMesDB].[dbo].[MTMV1_LOT_SLT_ALL] SN ON SN.LOTPK = LOTS.LOTPK
INNER JOIN [dbo].[Equipo_FAB] E ON E.ID = L.LocPath
WHERE L.LocPK = @Equipo
ORDER BY L.LOCPK desc
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerInicioTurnoPorHora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerInicioTurnoPorHora]
	@fechaActual as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
	SELECT
		Inicio
		,Fin
	FROM TiposTurno
	WHERE (
	CAST(DATEADD(MINUTE, Bias, @fechaActual) AS TIME) BETWEEN CAST(Inicio AS TIME) AND CAST(Fin AS TIME)
	OR (Nombre = 'Noche'
	AND CAST(DATEADD(MINUTE, Bias, @fechaActual) AS TIME) >= CAST(Inicio AS TIME))
	OR (Nombre = 'Noche'
	AND CAST(DATEADD(MINUTE, Bias, @fechaActual) AS TIME) <= CAST(Fin AS TIME))
	)
	AND (Nombre IN ('Mañana', 'Tarde', 'Noche'))
	COMMIT TRANSACTION; 
END


GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerInstantaneasDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerInstantaneasDeslizante]
	

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT * 
		FROM MES_MSM.dbo.DeslizanteInstantaneas
		ORDER BY id DESC
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerKOPsSegunSC]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerKOPsSegunSC]
@salaCoccion varchar(100),
@codKOP int
AS
BEGIN
	SELECT K.KOP_ID AS Cod_KOP, K.kop_name as Des_KOP, K.KOP_UOM AS UOM_KOP, 
ISNULL(V.KOP_MIN_VALUE, K.KOP_MIN_VALUE) AS Valor_Minimo,
ISNULL(V.KOP_MAX_VALUE, K.KOP_MAX_VALUE) AS Valor_Maximo,
ISNULL(V.KOP_VALUE, K.KOP_DEFAULT_VALUE) AS Valor_Actual,
K.KOP_DATATYPE as Tipo_KOP,
ISNULL(V.KOP_Equipment,'') as Des_equipo,
M.PK_Material as Cod_Material,
M.Descripcion as Des_Material,
CASE WHEN V.KOP_ValueTS IS NULL THEN NULL
	ELSE [dbo].[ToLocalDateTime](V.KOP_ValueTS) END AS Fecha,
V.KOP_ValueTS as FechaUTC,
CASE wHEN CONVERT(FLOAT,ISNULL(V.KOP_VALUE, K.KOP_DEFAULT_VALUE))<= CONVERt(FLOAT,ISNULL(V.KOP_MAX_VALUE, K.KOP_MAX_VALUE)) AND
				CONVERT(FLOAT,ISNULL(V.KOP_VALUE, K.KOP_DEFAULT_VALUE))>= CONVERt(FLOAT,ISNULL(V.KOP_MIN_VALUE, K.KOP_MIN_VALUE))
then 'Verde' else 'Rojo' end as Semaforo,
M.IdMaterial as IdMaterial
FROM DBO.COB_MSM_GLOBAL_KOPS K
CROSS JOIN Materiales_FAB M
LEFT JOIN DBO.COB_MSM_GLOBAL_KOPS_VALUES V ON V.KOP_ID=K.KOP_ID AND M.PK_Material = V.KOP_MATERIAL AND V.[KOP_EQUIPMENT] = @salaCoccion
where M.IdClase= 'MOS' and K.KOP_ID = @codKOP and M.Descripcion like 'M.F.  A. DENS%'

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerKOPsSegunSCMaterial]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerKOPsSegunSCMaterial]
@salaCoccion varchar(100),
@idMaterial varchar(100),
@area varchar(100),
@planta varchar(100)
AS
BEGIN

DECLARE @PPR AS VARCHAR(100) = ''

IF (@idMaterial like '%Dummy%')
SET @PPR = @planta + '.' + @area + '.' + @salaCoccion
ELSE
SET @PPR = @idMaterial + '_' + @salaCoccion + '_000'

--PRINT(@PPR)

SELECT
	REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(PS.PS,'D_WP','Orden cocción'),'D_FE','Orden Fermentación'),'D_FL','Orden Filtración'),'D_GU','Orden Guarda'),'D_PR','Orden Prellenado') as Procedimiento
	,KOP.Param_Desc as KOP
	,PARAM_TYPE as Tipo
	,PARAM_UOM as UOM
	,GRP as Formato
	,VAL.[ParamValues_Value] as Valor
	,VAL.[ParamValues_MinVal] as Minimo
	,VAL.[ParamValues_MaxVal] as Maximo
	,VAL.[ParamValues_Num] as idVal
	,VAL.RowUpdated as Fecha
	,@idMaterial as Material
	,CASE 
	WHEN VAL.[ParamValues_Value]='' THEN 'Azul'
	WHEN VAL.[ParamValues_Value] <> '' AND ISNUMERIC(VAL.[ParamValues_Value])=0 THEN 'Verde'
	WHEN CONVERT(FLOAT,CONVERT(VARCHAR(100),REPLACE(VAL.[ParamValues_Value],',','.')))<= CONVERt(FLOAT,CONVERT(VARCHAR(100),REPLACE(VAL.[ParamValues_MaxVal],',','.'))) AND
				CONVERT(FLOAT,CONVERT(VARCHAR(100),REPLACE(VAL.[ParamValues_Value],',','.')))>= CONVERt(FLOAT,CONVERT(VARCHAR(100),REPLACE(VAL.[ParamValues_MinVal],',','.')))
then 'Verde' else 'Rojo' end as Semaforo
FROM [SITMESDB_FAB].[SITMesDb].[dbo].[PDefM_PS] PS
INNER JOIN [SITMESDB_FAB].[SITMesDb].[dbo].[PDefM_PS_Param] KOP
	ON PS.PK = KOP.FK
INNER JOIN [SITMESDB_FAB].[SITMesDb].[dbo].[PDefM_PS_ParamValues] VAL
	ON KOP.[Param_ValuesLink] = VAL.[ParamValues_Num]
WHERE KOP.PARAM_NAME NOT LIKE '#%'
AND PS.PS_PPR = @PPR AND KOP.GRP<>'HISTORICO'
ORDER BY PS.PS_SEQ, KOP.PARAM_SEQ ASC
END


GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerLimitesOEETurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_ObtenerLimitesOEETurno]
	@idTurno as INT
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT  
		OEE_OBJETIVO AS OEEObjetivo,
		OEE_CRITICO AS OEECritico
		FROM COB_MSM_CONSOLIDADO_TURNO
		WHERE SHC_WORK_SCHED_DAY_PK = @idTurno
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerLimitesOEETurnoParametrosLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_ObtenerLimitesOEETurnoParametrosLinea]
	@idLinea as INT
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT  
		OEECritico,
		OEEObjetivo
		FROM Lineas
		WHERE NumeroLinea = @idLinea
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerLineasPlanta]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las zonas de una linea
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerLineasPlanta]
	@planta as nvarchar(200)
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT     
		numeroLinea,
		Id, 
		Nombre, 
		Descripcion,
		OEECritico,
		OEEObjetivo
		FROM Lineas
		WHERE EquipoSuperior = @planta
		order by numeroLinea;
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaquinasLineasTodas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las máquinas de una zona concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMaquinasLineasTodas]
	@linea as nvarchar(200)
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT DISTINCT
		--Maquinas.Zona,
		Maquinas.Id, 
		Maquinas.Nombre, 
		Maquinas.Descripcion,
		Maquinas.IdClase,
		Maquinas.Clase,
		Maquinas.Estado
		,Maquinas.Posicion
		,EAM.FecInicio as RowUpdated
		,maquinas.RechazoManual -- agomezn 05/07/16, añadido para filtrar en el desplegable de nuevo rechazo de Terminal
		FROM [dbo].[MaquinasLogicasComunes] Maquinas
		LEFT JOIN EstadoActualMaquinas EAM ON EAM.IdMaquina = Maquinas.Nombre
		WHERE (Maquinas.Linea = @linea or Maquinas.Linea like '%.B009') and Maquinas.Nombre <> ''
		ORDER BY Maquinas.Posicion		
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaquinasZona]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Compruebo
-- SELECT TOP 10 * FROM [dbo].[Maquinas]


-- Incluyo "RechazoManual" en el procedimiento MES_ObtenerMaquinasZona
CREATE PROCEDURE [dbo].[MES_ObtenerMaquinasZona]
	@linea as nvarchar(200),
	@zona as nvarchar(200)
AS
BEGIN
	--SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
		Maquinas.Id, 
		Maquinas.Nombre, 
		Maquinas.Descripcion,
		Maquinas.IdClase,
		Maquinas.Clase,
		Maquinas.Estado,
		Maquinas.Posicion,
		EAM.FecInicio as RowUpdated,
		Maquinas.RechazoManual
		FROM Maquinas
		LEFT JOIN EstadoActualMaquinas EAM ON EAM.IdMaquina = Maquinas.Nombre 
		WHERE Maquinas.Zona = @zona AND Maquinas.Linea = @linea
		ORDER BY Maquinas.Posicion
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaquinasZonaTodas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las máquinas de una zona concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMaquinasZonaTodas]
	@linea as nvarchar(200),
	@zona as nvarchar(200)
AS
BEGIN
	--set transaction isolation level read uncommitted
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT DISTINCT
		--Maquinas.Zona,
		Maquinas.Id, 
		Maquinas.Nombre, 
		Maquinas.Descripcion,
		Maquinas.IdClase,
		Maquinas.Clase,
		Maquinas.Estado
		,Maquinas.Posicion
		,EAM.FecInicio as RowUpdated
		,maquinas.RechazoManual -- agomezn 05/07/16, añadido para filtrar en el desplegable de nuevo rechazo de Terminal
		FROM [dbo].[MaquinasLogicasComunes] Maquinas
		LEFT JOIN EstadoActualMaquinas EAM ON EAM.IdMaquina = Maquinas.Nombre
		WHERE (Maquinas.Zona = @zona or Maquinas.Zona is null) AND (Maquinas.Linea = @linea or Maquinas.Linea like '%.B009') and Maquinas.Nombre <> ''
		ORDER BY Maquinas.Posicion	
	COMMIT TRANSACTION; 	

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMateriales]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ==================================================
-- Author:		Andrés
-- Create date: 29/07/2015
-- Description:	Obtiene los materiales de una planta
-- ==================================================
CREATE PROCEDURE [dbo].[MES_ObtenerMateriales]
AS
BEGIN
SELECT
	IdMaterial
   ,Nombre
   ,Descripcion
   ,Materiales.IdClase AS IdClase
   ,Materiales.Clase AS Clase
   ,Version
   ,Status
   ,UdMedida
   ,F_EfectivoDesde
   ,F_EfectivoHasta
   ,EnUso
   ,Autor
   ,FechaCreacion
   ,FechaUltCreacion
   ,ModificadoPor
   ,InfoAdicional
   ,Tipo
   ,DescTipo
   ,IdLote
   ,Gama
   ,Marca
   ,TipoEnvase
   ,FormatoComunCodigo.PValue AS CodigoFormatoComun
   ,FormatoComunDescripcion.PValue AS DescripcionFormatoComun
FROM Materiales
LEFT OUTER JOIN (SELECT
		DefVerPK
	   ,PValue
	FROM SITMesDB.dbo.MMvDefVerPrpVals
	WHERE (PropertyPK = dbo.GetPkParametroMaterial('Formato_comun_codigo'))) AS FormatoComunCodigo
	ON FormatoComunCodigo.DefVerPK = Materiales.DefVerPK
LEFT OUTER JOIN (SELECT
		DefVerPK
	   ,PValue
	FROM SITMesDB.dbo.MMvDefVerPrpVals
	WHERE (PropertyPK = dbo.GetPkParametroMaterial('Formato_comun_nombre'))) AS FormatoComunDescripcion
	ON FormatoComunDescripcion.DefVerPK = Materiales.DefVerPK
WHERE Materiales.Tipo IN ('02','03')
SET NOCOUNT ON;

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaterialesEAN]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMaterialesEAN]
	--@codEan as nvarchar(256) -- MMDefinitions.DefID
	@codEan as nvarchar(256)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;

DECLARE @codigoEan AS BIGINT = CONVERT(BIGINT, @codEan)
DECLARE @SectionId AS INT;
DECLARE @PropertyGroupId AS INT;
DECLARE @PropertyId AS INT;


SELECT DISTINCT
	@SectionId = itsc.[SectionId]
FROM [INTERSPEC].[MSMIS].[INTERSPC].[ItSc] itsc
WHERE [Description] = 'Datos Generales'

SELECT DISTINCT
	@PropertyGroupId = itp.[PropertyGroupId]
FROM [INTERSPEC].[MSMIS].[INTERSPC].[ItPropertyGroup] itp
WHERE [Description] = 'Datos Unidad Expedición'


SELECT DISTINCT
	@PropertyId = [PropertyId]
FROM [INTERSPEC].[MSMIS].[INTERSPC].[ItProperty]
WHERE [Description] = 'EAN/ITF/UPC'

SELECT
	M.IdMaterial AS CodigoMaterial
	,M.Descripcion
	,Numeric1 AS CodigoEAN
FROM INTERSPEC.[MSMIS].INTERSPC.ItSpProperty
INNER JOIN dbo.Materiales M
	ON M.IdMaterial = PartNo COLLATE DATABASE_DEFAULT
WHERE SectionId = @SectionId
AND SubsectionId = 0
AND PropertyGroupId = @PropertyGroupId
AND PropertyId = @PropertyId
AND AttributeId = 0
AND Revision = dbo.f_get_att_rev(PartNo, NULL)
AND Numeric1 = @codEan



END
GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaterialesProducto]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMaterialesProducto]
	@linea as nvarchar(25), -- ID.SPLIT('.')[2]
	@id_prod as nvarchar(64) -- MMDefinitions.DefID
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		DECLARE @BomPK AS INT
		DECLARE @Version AS INT
		DECLARE @BomName AS NVARCHAR(64);

		SET @BomName = 'BOM_'+@linea+'_'+@id_prod;    
	
		SELECT @BomPK = BomPK, @version=MAX(VMinor)
		FROM SITMesDB.DBO.MMBoms
		WHERE Descript = @BomName
		GROUP BY BomPK

		SELECT DISTINCT @id_prod,
				MMD.DefID AS 'IdMaterial',
				MMD.Descript AS 'Name'
		FROM [SITMesDB].[dbo].[MMBomAlts] MMB
		INNER JOIN [SITMesDB].[dbo].[MMBomItemAlts] MMBI ON MMB.BomAltPK = MMBI.BomAltPK
		INNER JOIN [SITMesDB].[dbo].[MMDefinitions] MMD ON MMD.DefPK = MMBI.DefPK
		INNER JOIN [SITMesDB].[dbo].[MMvDefVers] DV ON MMD.DefPK = DV.DefPK
		INNER JOIN [SITMesDB].[dbo].[MMDefStatuses] MMDS ON MMDS.DefStatusPK = DV.DefStatusPK
		WHERE MMB.BomAltName = @BomName AND MMB.BomPK = @BomPK AND MMDS.DefStatusID = 'APPROVED'
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMaterialesProductoArranque]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMaterialesProductoArranque]
	@linea as nvarchar(25), -- ID.SPLIT('.')[2]
	@id_prod as nvarchar(64) -- MMDefinitions.DefID
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;	
	set transaction isolation level read uncommitted
	BEGIN TRANSACTION;
		DECLARE @BomName AS NVARCHAR(64);
		DECLARE @vel_nominal AS INT;
		DECLARE @palets AS INT;
		DECLARE @contenedoresPalet AS FLOAT;
		DECLARE @HORAS AS INT = 2;
		DECLARE @CONTENEDORES_PALET AS INT;
		DECLARE @BomPK AS INT

		SELECT  @vel_nominal = (VELOCIDAD_NOMINAL * @HORAS)
		FROM COB_MSM_PARAMETROS_LINEA_PRODUCTO
		where ID_PPR = 'PPR_'+@linea+'_'+@id_prod

		select @CONTENEDORES_PALET = CONVERT(INT,ParameterData) from INTERSPEC.[MSMIS].[INTERSPC].[ItInterspcConfig] where Parameter = 'Cont_Palet'

		SELECT @contenedoresPalet = itsp.Numeric1
		FROM INTERSPEC.MSMIS.INTERSPC.ItSpProperty itsp
		where PropertyId = @CONTENEDORES_PALET AND itsp.PartNo = @id_prod AND itsp.Revision = dbo.f_get_att_rev(itsp.PartNo, NULL)

		SET @palets = round((@vel_nominal/@contenedoresPalet),0)
	
		SET @BomName = 'BOM_'+@linea+'_'+@id_prod;

		SELECT @BomPK = BomPK
		FROM SITMesDB.DBO.MMBomAlts
		WHERE BomAltName =  @BomName --AND BomPriority = 1 (SÓLO EN LOCAL)

		SELECT DISTINCT @id_prod as 'IdProd',
				MMD.DefID AS 'IdMaterial',
				MMD.Descript AS 'Name',
				CONVERT(INT, ROUND(@palets * ((MMBI.Quantity*dbo.convertUnits(UOM.UomName)) + ((MMBI.Scrap*(MMBI.Quantity*dbo.convertUnits(UOM.UomName)))/100)),0)) AS 'Units'
		FROM [SITMesDB].[dbo].[MMBomAlts] MMB
		INNER JOIN [SITMesDB].[dbo].[MMBomItemAlts] MMBI ON MMB.BomAltPK = MMBI.BomAltPK
		INNER JOIN [SITMesDB].[dbo].[MMDefinitions] MMD ON MMD.DefPK = MMBI.DefPK
		INNER JOIN [SITMesDB].[dbo].[MMvDefVers] DV ON MMD.DefPK = DV.DefPK
		INNER JOIN [SITMesDB].[dbo].[MMDefStatuses] MMDS ON MMDS.DefStatusPK = DV.DefStatusPK
		INNER JOIN [SITMesDB].[dbo].[MESUoMs] UOM ON UOM.UomPK = MMBI.UomPK
		WHERE MMB.BomPK = @BomPK AND MMDS.DefStatusID = 'APPROVED'
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerMensajesDeltaV_Fab]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerMensajesDeltaV_Fab] 
	-- Add the parameters for the stored procedure here
	@area varchar(100),
	@anyo varchar(100),
	@numcoc varchar(100),
	@proc varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

   
   DECLARE @SQL AS VARCHAR(1000)

   SET @SQL = 'SELECT 
   C.[Indice]
      ,C.[Fabrica]
      ,C.[Modulo]
      ,C.[Lote]
      ,REPLACE(C.[Fecha],''-'','' '') as Fecha
      ,C.[Dato_Descripcion]
      ,C.[Dato_Valor]
      ,C.[Dato_Unidad]
      ,C.[FracSec]
    FROM [DELTAV].SSISDeltaV.dbo.OLTP_'+@area+' C 
				INNER JOIN [DELTAV].SSISDeltaV.dbo.OLTP_MODULO M ON C.MODULO = M.DES_MODULO AND M.SEGMENTO = '''+@proc+'''
				where NumCoccion = '+@numcoc+' and year(convert(datetime,REPLACE(Fecha,''-'','' ''),120))='+@anyo+' order by C.Fecha asc'

	PRINT(@SQL)
	EXEC (@SQL)

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerNecesidadTCP]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		
-- Create date: 
-- Description:	Obtiene necesidades de TCPs FIL
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerNecesidadTCP]
	
AS
BEGIN
	SET NOCOUNT ON;

	select LineaEnvasado, SUM(TotalNecesidadTCP) AS TotalNecesidadTCP
	from dbo.COB_MSM_ArticlesParametersForPackingLineFIL
	group by LineaEnvasado 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerOrden]
	@orden as nvarchar(50)
AS
BEGIN

SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	SELECT 
	Particiones.Id,
	Particiones.IdOrdenPadre,
	particiones.IdSuborden,
	Particiones.Descripcion,
	IdEstadoAct,
	EstadoAct,
	EstadoAct.color AS ColorAct,
	IdEstadoAnt,
	EstadoAnt.id AS EstadoAnt,
	EstadoAnt.color AS ColorAnt,
	FecIniEstimada,
	FecFinEstimada,
	FecIniReal,
	FecFinReal,
	Productos.IdProducto,
	Productos.Nombre AS Producto,
		Productos.IdClase + '-' + cast(Productos.Gama as varchar) + '-' + cast(Productos.Marca as varchar) AS IdTipoProducto,
	Productos.Clase + ' ' + cast(Productos.Gama as varchar) + ' ' + cast(Productos.Marca as varchar)  AS TipoProducto,
	CantidadPlanificada,
	CantidadProducida,
	Productos.udMedida,
	Particiones.VelocidadNominal,
	Particiones.OEEObjetivo,
	Particiones.OEECritico,
	Particiones.codigoJDE,
		Particiones.Rechazos,
	Particiones.OEE,
	Particiones.Disponibilidad,
	Particiones.Eficiencia,
	Particiones.RendMecanico,
	Particiones.Calidad,
	Particiones.Linea,
	Particiones.FecHorAct as RowUpdated,
	Particiones.EnvasesPorPalet,
	Particiones.CajasPorPalet,
	Particiones.HectolitrosProducto,
	Particiones.CausaPausa,
	Particiones.PicosCajas
	FROM Particiones
	LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Particiones.IdEstadoAct
	LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Particiones.IdEstadoAnt
	LEFT JOIN Productos ON Productos.IdProducto = Particiones.IdProducto
	WHERE Particiones.Id = @orden
	

COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrden_Fab]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerOrden_Fab]
	@orden as INT
AS
BEGIN


SELECT ID_Orden AS CODWO, 
TIPOORDEN, 
EQUIPOORDEN AS EQUIPO,
COD_MATERIAL AS IDMATERIAL, 
M.[Descripcion] AS MATERIAL ,
CANTIDAD_MATERIAL AS CANTIDAD, 
UOM_MATERIAL AS UOM, 
idEstado as idEstado,
Estado as Estado,
Tiempo_Inicio_Real ,
Tiempo_Fin_Real,
Tiempo_Inicio_Estimado, 
Tiempo_Fin_Estimado,
L.[LotID] as loteMES,
O.[Des_Orden] as Nota
  FROM [dbo].[Ordenes_FAB] O
  INNER JOIN [dbo].[Materiales_FAB] M ON M.[IdMaterial] = O.COD_MATERIAL
  INNER JOIN [dbo].[Lotes_FAB] L ON O.[pkLote] =L.[LotPK]
  WHERE Cod_Orden = @orden

END


GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrdenesActivas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerOrdenesActivas]
	@linea as nvarchar(200)
AS
BEGIN

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

		SELECT DISTINCT
	Particiones.Id,
	Particiones.IdOrdenPadre,
	Particiones.IdSuborden,
	Particiones.Descripcion,
	IdEstadoAct,
	EstadoAct,
	EstadoAct.color AS ColorAct,
	IdEstadoAnt,
	EstadoAnt,
	EstadoAnt.color AS ColorAnt,
	FecIniEstimada,
	FecFinEstimada,
	FecIniReal,
	FecFinReal,
	Productos.IdProducto,
	Productos.Descripcion AS Producto,
	Productos.IdClase + '-' + cast(Productos.Gama as varchar) + '-' + cast(Productos.Marca as varchar) AS IdTipoProducto,
	Productos.Clase + ' ' + cast(Productos.Gama as varchar) + ' ' + cast(Productos.Marca as varchar)  AS TipoProducto,
	Particiones.CantidadPlanificada,
	Particiones.CantidadProducida,
	Productos.udMedida,
	Particiones.VelocidadNominal,
	Particiones.OEEObjetivo,
	Particiones.OEECritico,
	Particiones.codigoJDE,
	Particiones.Rechazos,
	Particiones.OEE,
	Particiones.Disponibilidad,
	Particiones.Eficiencia,
	Particiones.RendMecanico,
	--Particiones.Calidad,
	1 as Calidad,
	Particiones.FecHorAct as RowUpdated,
	Particiones.EnvasesPorPalet,
	Particiones.CajasPorPalet,
	Particiones.HectolitrosProducto,
	Particiones.CausaPausa,
	Particiones.PicosCajas
	FROM Particiones
	LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Particiones.IdEstadoAct
	LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Particiones.IdEstadoAnt
	LEFT JOIN Productos ON Productos.IdProducto = Particiones.IdProducto
	LEFT JOIN Maquinas ON Maquinas.Orden = Particiones.Id
	Where Zona is not null and Particiones.Linea = @linea 

COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrdenesIntervalo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerOrdenesIntervalo]
	@linea as nvarchar(200),
	@fIni as datetime,
	@fFin as datetime
AS
BEGIN

SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	SELECT
		Id
	INTO #Turnos
	FROM Turnos
	WHERE [Linea] = @Linea AND InicioTurno BETWEEN @fIni AND @fFin AND FinTurno BETWEEN @fIni AND @fFin AND LOWER(Turno) <> 'nowork'
	ORDER BY InicioTurno

	SELECT DISTINCT
		Particiones.Id
		,Particiones.IdOrdenPadre
		,Particiones.IdSuborden
		,Particiones.Descripcion
		,IdEstadoAct
		,EstadoAct
		,EstadoAct.color AS ColorAct
		,IdEstadoAnt
		,EstadoAnt
		,EstadoAnt.color AS ColorAnt
		,FecIniEstimada
		,FecFinEstimada
		,FecIniReal
		,FecFinReal
		,Productos.IdProducto
		,Productos.Descripcion AS Producto
		,Productos.IdClase AS IdTipoProducto
		,Productos.Clase AS TipoProducto
		,Particiones.CantidadPlanificada
		,Particiones.CantidadProducida
		,Productos.udMedida
		,Particiones.VelocidadNominal
		,Particiones.OEEObjetivo
		,Particiones.OEECritico
		,Particiones.codigoJDE
		,Particiones.Rechazos
		,Particiones.OEE
		,Particiones.Disponibilidad
		,Particiones.Eficiencia
		,Particiones.RendMecanico
		,Particiones.Calidad
		,Particiones.FecHorAct AS RowUpdated
		,Particiones.EnvasesPorPalet
		,Particiones.CajasPorPalet
		,Particiones.HectolitrosProducto
		,Particiones.CausaPausa
	FROM (
		SELECT DISTINCT ID_PARTICION
		  FROM 
		  (SELECT DISTINCT PLL.ID_PARTICION AS ID_PARTICION
		   FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL
		   INNER JOIN #Turnos T ON PLL.SHC_WORK_SCHED_DAY_PK = T.Id
		   INNER JOIN Maquinas M ON M.Id = PLL.ID_MAQUINA
		   INNER JOIN Lineas L ON L.Id = M.Linea
		   WHERE M.Linea = @linea 
		   UNION 
		   SELECT DISTINCT PR.ID_PARTICION AS ID_PARTICION
		   FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA PR
		   INNER JOIN #Turnos T ON PR.SHC_WORK_SCHED_DAY_PK = T.Id
		   INNER JOIN Maquinas M ON M.Id = PR.ID_MAQUINA
		   INNER JOIN Lineas L ON L.Id = M.Linea
		   WHERE M.Linea = @linea
		   ) AS P
		WHERE P.ID_PARTICION IS NOT NULL AND P.ID_PARTICION <> ''
	) AS ParticionesId
	INNER JOIN Particiones AS Particiones ON Particiones.Id = ParticionesId.ID_PARTICION
	LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Particiones.IdEstadoAct
	LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Particiones.IdEstadoAnt
	LEFT JOIN Productos ON Productos.IdProducto = Particiones.IdProducto
	LEFT JOIN Maquinas ON Maquinas.Orden = Particiones.Id
	--Where 
	--Particiones.Linea = @linea
	--and 
	--(
	--(FecIniReal >= @fIni and FecIniReal <= @fFin)
	--	or
	--(FecFinReal >= @fIni and FecFinReal <= @fFin)
	--	or	
	--(FecIniReal<= @fIni and FecFinReal >= @fFin)
	
	--)
	DROP TABLE #Turnos
COMMIT TRANSACTION; 	
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrdenesPendientes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las ordenes planificadas de una linea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerOrdenesPendientes]
	@linea as nvarchar(200)
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	SELECT 
	Particiones.Id,
	Particiones.IdOrdenPadre,
	Particiones.IdSuborden,
	Particiones.Descripcion,
	IdEstadoAct,
	EstadoAct,
	EstadoAct.color AS ColorAct,
	IdEstadoAnt,
	EstadoAnt.id AS EstadoAnt,
	EstadoAnt.color AS ColorAnt,
	FecIniEstimada,
	FecFinEstimada,
	FecIniReal,
	FecFinReal,
	Productos.IdProducto,
	Productos.Descripcion AS Producto,
		Productos.IdClase + '-' + cast(Productos.Gama as varchar) + '-' + cast(Productos.Marca as varchar) AS IdTipoProducto,
	Productos.Clase + ' ' + cast(Productos.Gama as varchar) + ' ' + cast(Productos.Marca as varchar)  AS TipoProducto,
	CantidadPlanificada,
	CantidadProducida,
	Productos.udMedida,
	Particiones.VelocidadNominal,
	Particiones.OEEObjetivo,
	Particiones.OEECritico,
	Particiones.codigoJDE,
		Particiones.Rechazos,
	Particiones.OEE,
	Particiones.Disponibilidad,
	Particiones.Eficiencia,
	Particiones.RendMecanico,
	--Particiones.Calidad,
	1 as Calidad,
	Particiones.FecHorAct as RowUpdated,
	Particiones.EnvasesPorPalet,
	Particiones.CajasPorPalet,
	Particiones.HectolitrosProducto,
	Particiones.CausaPausa,
	Particiones.PicosCajas
	FROM Particiones
	LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Particiones.IdEstadoAct
	LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Particiones.IdEstadoAnt
	LEFT JOIN Productos ON Productos.IdProducto = Particiones.IdProducto
	WHERE (EstadoAct.Estado = 'Creada' OR EstadoAct.Estado = 'Planificada' OR EstadoAct.Estado = 'Pausada' OR EstadoAct.Estado = 'Finalizada' OR EstadoAct.Estado = 'Preparación') 
	AND Particiones.Linea = @linea
	ORDER BY FecIniEstimada,EstadoAct.Id desc
	

COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrdenesZonas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerOrdenesZonas]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
		max(MaestroLineas.LINEA) AS Linea,
		--Zonas.equip_prpty_value AS Zona, 
		MaestroZonas.ID_ZONA,
		max
		(
			CASE CHARINDEX('.', Ordenes.equip_prpty_value) 
				WHEN 0 THEN Ordenes.equip_prpty_value 
				ELSE Ordenes.equip_prpty_value 
				--ELSE SUBSTRING(Ordenes.equip_prpty_value, 0, CHARINDEX('.', Ordenes.equip_prpty_value)) 
			END
		) AS Orden
		FROM SitMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS Zonas
		LEFT JOIN SitMesDB.dbo.BPM_EQUIPMENT_PROPERTY AS Ordenes on Zonas.equip_pk = Ordenes.equip_pk
		INNER JOIN COB_MSM_ZONAS AS MaestroZonas on Zonas.equip_prpty_value = MaestroZonas.ID_ZONA
		INNER JOIN COB_MSM_LINEAS AS MaestroLineas on MaestroZonas.FK_LINEAS_ID = MaestroLineas.ID_LINEA
		WHERE Zonas.equip_prpty_id = 'ZONA_ID' and Ordenes.equip_prpty_id = 'ORDER_ID' --and not Ordenes.equip_prpty_value like '%.%'
		--GROUP BY Zonas.equip_prpty_value
		GROUP BY MaestroZonas.ID_ZONA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerOrdenFinalizadasTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





CREATE PROCEDURE [dbo].[MES_ObtenerOrdenFinalizadasTurno]	
	@linea as varchar(200),
	@fechaIni as bigINT
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	DECLARE @LINEAID AS VARCHAR(100) = (SELECT ID FROM LINEAS WHERE ID LIKE '%' + @Linea + '%')
	DECLARE @TURNO AS INT = (SELECT ID FROM TURNOS WHERE InicioTurno<= DATEADD(SECOND, @FechaIni, '19700101') AND FinTurno > DATEADD(SECOND, @FechaIni, '19700101') AND Linea = @LINEAID)
	

	
	SELECT DISTINCT P.ID, P.IdProducto, P.FecIniReal, P.FecFinReal, P.FecIniEstimada, P.FecFinEstimada, P.Linea, P.CantidadPlanificada, 
	P.CantidadProducida, P.EstadoAct, P.OEE, P.Disponibilidad, P.Eficiencia, P.RendMecanico, P.Calidad
	FROM PARTICIONES P 
	LEFT JOIN COB_MSM_PROD_LLENADORA_HORA LL ON LL.ID_PARTICION = P.Id AND LL.ID_MAQUINA LIKE '%'+ @LINEAID + '%' AND LL.SHC_WORK_SCHED_DAY_PK = @TURNO
	LEFT JOIN COB_MSM_PROD_RESTO_MAQ_HORA RES ON RES.ID_PARTICION = P.Id AND RES.ID_MAQUINA LIKE '%' + @LINEAID + '%' AND RES.SHC_WORK_SCHED_DAY_PK = @TURNO
	WHERE P.EstadoAct in ('Cerrada', 'Finalizada') AND (LL.HORA IS NOT NULL OR RES.HORA IS NOT NULL)
	
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPaletsConsolidadosOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPaletsConsolidadosOrdenTurno]
	-- Add the parameters for the stored procedure here
	@idTurno as int,
	@clase as nvarchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	SELECT 
			ID_ORDEN,
			o.IdProducto,
			COALESCE(SUM(Consolidacion.[CONTADOR_PRODUCCION]), 0) as TotalPalets,
			o.EnvasesPorPalet,
			o.CajasPorPalet
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
		LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
		INNER JOIN Ordenes o ON o.Id = Consolidacion.ID_ORDEN
		WHERE Consolidacion.[SHC_WORK_SCHED_DAY_PK] = @idTurno AND ML.Clase = @clase
		GROUP BY ID_ORDEN, IdProducto, o.EnvasesPorPalet, o.CajasPorPalet 
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPantallasLineas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerPantallasLineas]
	@IdPantalla as int
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	SELECT
		FK_ID_LINEA
	FROM dbo.COB_MSM_PANTALLAS_LINEAS
	WHERE FK_ID_PANTALLA = @IdPantalla
COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPantallasVideowall]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerPantallasVideowall]
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	SELECT
		ID_PANTALLA AS IdPantalla
		,NOMBRE as Nombre
		,DESCRIPCION as Descripcion
		,CODIGO_PANTALLA as Codigo
	FROM dbo.COB_MSM_PANTALLAS_VIDEOWALL
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParametrosLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MES_ObtenerParametrosLinea]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
		PPR as idPPR,
		[idLinea],
		lineas.NumeroLinea, 
		lineas.Descripcion as DescripcionLinea, 
		[Producto] as idProducto,
		p.Descripcion as NombreProductoGrid,
		pl.PPR as PPR,
		[VelocidadNominal],
		pl.[OEEObjetivo],
		pl.[OEECritico],
		[OEECalculado],
		pl.OEE_PREACTOR
		FROM [ParametrosLinea] pl inner join lineas on pl.idLinea=lineas.Id
		inner join productos p on pl.Producto=p.IdProducto
		order by idLinea asc
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParos] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	DECLARE @IdTipoParo AS INT;

	SELECT
		@IdTipoParo = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Paro Mayor'

	SELECT
		[Id]
		,[IdTipoParoPerdida]
		,[TipoParoPerdida]
		,[Inicio]
		,[Fin]
		,[EquipoId]
		,[EquipoNombre]
		,EquipoDescripcion AS EquipoDesc
		--,'Llenadora ' + Right(EquipoNombre,2)  as EquipoDesc
		,[MotivoId]
		,[MotivoNombre]
		,[CausaId]
		,[CausaNombre]
		,[Justificado]
		,[Observaciones]
		,[MaquinaCausaId]
		,[MaquinaCausaNombre]
		,[EquipoConstructivoId]
		,[EquipoConstructivoNombre]
		,[Descripcion]
		,[DescripcionId]
	FROM [ParosPerdidas]
	WHERE IdLinea = @idLinea
	AND [Inicio] >= @desde
	AND [fin] <= @hasta
	AND [IdTipoParoPerdida] = @IdTipoParo
	ORDER BY [Inicio] DESC
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosMayores]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosMayores] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	DECLARE @IdTipoParo AS INT;

	SELECT
		@IdTipoParo = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Paro Mayor'

	SELECT
		[Id]
		,[TimeCategory]
		,[EsParoMayor]
		,[EsParoMenor]
		,[EsBajaVelocidad]
		,[Inicio]
		,[Fin]
		,[EquipoId]
		,[EquipoNombre]
		,[CategoriaId]
		,[CategoriaNombre]
		,[MotivoId]
		,[MotivoNombre]
		,[CausaId]
		,[CausaNombre]
		,[Justificado]
		,[ProductoId]
		,[Usuario]
		,[Observaciones]
		,[Orden]
		,[Lote]
		,[MaquinaCausaId]
		,[MaquinaCausaNombre]
		,[EquipoConstructivoId]
		,[EquipoConstructivoNombre]
		,[Descripcion]
	FROM [ParosMayores]
	WHERE [EquipoNombre] IN (SELECT
			Nombre
		FROM Maquinas
		WHERE Linea = @idLinea)
	AND [Inicio] >= @desde
	AND [fin] <= @hasta
	AND [EsParoMayor] = @IdTipoParo
	ORDER BY [Inicio] DESC
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosMayoresMaquinas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosMayoresMaquinas] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as int,
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
			m.Nombre,
			CLLH.HORA,
			SUM(CLLH.TIEMPO_PLANIFICADO)-SUM(CLLH.TIEMPO_OPERATIVO) as TiempoParo
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA CLLH
		INNER JOIN Maquinas m ON m.Id = CLLH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CLLH.FECHA_INICIO>=@desde AND CLLH.FECHA_FIN <=@hasta
		GROUP BY ID_MAQUINA, m.Nombre, CLLH.HORA
		UNION
		SELECT 
			m.Nombre,
			CMH.HORA,
			SUM(CMH.TIEMPO_PLANIFICADO)-SUM(CMH.TIEMPO_OPERATIVO) as TiempoParo
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
		INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CMH.FECHA_INICIO>=@desde AND CMH.FECHA_FIN <=@hasta
		GROUP BY ID_MAQUINA, m.Nombre, CMH.HORA 
		ORDER BY Nombre, HORA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosMenoresMaquinas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosMenoresMaquinas] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as int,
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT 
			m.Nombre,
			CLLH.HORA,
			SUM(CLLH.TIEMPO_OPERATIVO)-SUM(CLLH.TIEMPO_BRUTO) as TiempoParo
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA CLLH
		INNER JOIN Maquinas m ON m.Id = CLLH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CLLH.FECHA_INICIO>=@desde AND CLLH.FECHA_FIN <=@hasta
		GROUP BY ID_MAQUINA, m.Nombre, CLLH.HORA
		UNION
		SELECT 
			m.Nombre,
			CMH.HORA,
			SUM(CMH.TIEMPO_OPERATIVO)-SUM(CMH.TIEMPO_BRUTO) as TiempoParo
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
		INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
		INNER JOIN Lineas l ON l.Id = m.Linea
		WHERE l.NumeroLinea = @idLinea AND CMH.FECHA_INICIO>=@desde AND CMH.FECHA_FIN <=@hasta
		GROUP BY ID_MAQUINA, m.Nombre, CMH.HORA 
		ORDER BY Nombre, HORA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosPerdidasPPAMaquinas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosPerdidasPPAMaquinas]
	@FecInicio datetime,
	@FecFin datetime,
	@NumLinea int
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
CREATE TABLE #TipoParos ( Id BIGINT NOT NULL, Descripcion VARCHAR(50) NULL, Tipo INT NOT NULL)

INSERT INTO #TipoParos
	SELECT
		IdObj
		,StateDescription
		,CASE
			WHEN StateDescription = 'Paro_consolidado' THEN 0
			WHEN StateDescription = 'Paro_menor_consolidado' THEN 1
		END
	FROM [OEEStateList]
	WHERE StateDescription IN ('Paro_consolidado', 'Paro_menor_consolidado')

SELECT
	L.NumeroLinea AS NumLinea
	,L.Descripcion AS Linea
	,EQ.equip_pk AS CodMaquina
	,EQ.equip_name AS IdMaquina
	,EQ.equip_label AS DescripcionMaquina
	,(SELECT
			Tipo
		FROM #TipoParos AS TP
		WHERE TP.ID = P.Level0)
	AS ParoMayorMenor
	,dbo.ToLocalDateTime(P.StartTime) AS Inicio
	,dbo.ToLocalDateTime(P.EndTime) AS Fin
	,(DATEDIFF(SECOND, '19700101', P.EndTime) - DATEDIFF(SECOND, '19700101', P.STARTTIME)) AS Duracion
	,T.InicioTurno AS InicioTurno
	,T.FinTurno AS FinTurno
	,t.id AS IdTurno
	,t.IdTipoTurno AS IdTipoTurno
FROM dbo.Lineas L
INNER JOIN DBO.TURNOS T
	ON T.Linea = L.Id AND L.NumeroLinea = @NumLinea
INNER JOIN SITMesDB.dbo.BPM_EQUIPMENT EQ
	ON EQ.equip_superior = L.Id
INNER JOIN PPA.DBO.EQUIPMENT E
	ON EQ.equip_name = E.EquipmentName
INNER JOIN PPA.DBO.Equipment_Extension_Link M
	ON M.EqID = E.EquipmentId
INNER JOIN [PPA].[dbo].[version_history] VH  
	ON VH.version_id = M.VersionID AND is_current = 1
INNER JOIN [dbo].[OEEDTMTable] P
	ON P.Level0 IN (SELECT
			Id
		FROM #TipoParos)
	AND P.EqID = M.PPAObjectId		
	AND P.StartTime <> P.EndTime
	AND T.InicioTurno <= P.StartTime
	AND T.FinTurno >= P.EndTime
	AND CAST(P.StartTime AS DATE) >= CAST(@FecInicio AS DATE)
	AND CAST(P.EndTime AS DATE) <= CAST(@FecFin AS DATE)

DROP TABLE #TipoParos
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosPerdidasTotalesLLenadoraTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosPerdidasTotalesLLenadoraTurno] 
	-- Add the parameters for the stored procedure here
	@idTurno as int
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	DECLARE @IdTipoParoMayor AS INT;
	DECLARE @IdTipoParoMenor AS INT;

	SELECT
		@IdTipoParoMenor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Pérdida de producción'

	SELECT
		@IdTipoParoMayor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Paro Mayor'


	SELECT
		m.Nombre
		,CAST(ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMayor) THEN pp.DuracionParoMayor
		END), 0) AS BIGINT) AS DuracionParoMayor
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.DuracionParosMenores
		END), 0) AS DuracionParosMenores
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.DuracionBajaVelocidad
		END), 0) AS DuracionBajaVelocidad
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.Duracion
		END), 0) AS DuracionPerdidaProduccion
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMayor) THEN 1
		END), 0) AS NumParosMayores
		,ISNULL(SUM(CASE
			WHEN (pp.IdTipoParoPerdida = @IdTipoParoMenor) THEN pp.NumeroParosMenores
		END), 0) AS NumParosMenores
	FROM [dbo].[ParosPerdidas] pp
	INNER JOIN Turnos t ON t.Id = pp.Turno
	INNER JOIN Maquinas m ON m.Id = pp.EquipoId
	WHERE t.id = @idTurno
	GROUP BY m.Nombre
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosPerdidasTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosPerdidasTurno] 
	-- Add the parameters for the stored procedure here
	@idTurno as int
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	--SELECT
	--	m.Nombre
	--	,CMH.HORA
	--	,COALESCE(SUM(CMH.TIEMPO_PLANIFICADO) - SUM(CMH.TIEMPO_OPERATIVO),0) AS DuracionParoMayor
	--	,COALESCE(SUM(CMH.TIEMPO_OPERATIVO) - SUM(CMH.TIEMPO_BRUTO),0) AS DuracionParosMenores
	--	,COALESCE(SUM(CMH.TIEMPO_BRUTO) - SUM(CMH.TIEMPO_NETO),0) AS DuracionBajaVelocidad
	--	,COALESCE(SUM(CMH.TIEMPO_OPERATIVO) - SUM(CMH.TIEMPO_NETO),0) AS DuracionPerdidaProduccion
	--FROM dbo.COB_MSM_PROD_LLENADORA_HORA CMH
	--INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	--INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	--WHERE t.id = @idTurno
	--GROUP BY ID_MAQUINA, m.Nombre, CMH.HORA


	DECLARE @INISQL AS NVARCHAR(MAX)='SELECT NOMBRE, HORA, SUM(DuracionParoMayor) AS DuracionParoMayor, 0 AS DuracionParosMenores, 0 AS DuracionBajaVelocidad,SUM(DuracionPerdidaProduccion) AS DuracionPerdidaProduccion
	 FROM ( '

	 DECLARE POINT CURSOR FOR
	 SELECT DISTINCT NOMBRE FROM MAQUINAS M INNER JOIN TURNOS T ON T.Linea = M.Linea AND T.ID=@idTurno AND M.CLASE='LLENADORA'
	 
	 DECLARE @IDMAQUINA AS VARCHAR(100)

	 OPEN POINT

	 FETCH NEXT FROM POINT INTO @IDMAQUINA
	 DECLARE @I AS INT = 0
	 WHILE @@fetch_status=0
	 BEGIN

	 IF @I<>0
		 SET @INISQL += ' UNION ALL '
	 ELSE
		 SET @I+=1 

	 SET @INISQL += ' select '''+@IDMAQUINA+''' AS Nombre, DATEPART(HOUR, INICIO) AS HORA, SEGUNDOS AS DuracionParoMayor,  0 AS DuracionParosMenores,
			0 AS DuracionBajaVelocidad, 0 AS DuracionPerdidaProduccion
			from [dbo].[ParosPerdidasHorasTurnoMaquina]('+CONVERT(VARCHAR(100),@idTurno)+','''+@IDMAQUINA+''',0) 
			UNION ALL 
			select '''+@IDMAQUINA+''' AS Nombre, DATEPART(HOUR, INICIO) AS HORA, 0 AS DuracionParoMayor,  0 AS DuracionParosMenores,
			0 AS DuracionBajaVelocidad, SEGUNDOS AS DuracionPerdidaProduccion
			from [dbo].[ParosPerdidasHorasTurnoMaquina]('+CONVERT(VARCHAR(100),@idTurno)+','''+@IDMAQUINA+''',1) '

	 FETCH NEXT FROM POINT INTO @IDMAQUINA
	 END

	 CLOSE POINT
	 DEALLOCATE POINT

	 SET @INISQL +=' ) TB
	GROUP BY NOMBRE, HORA
	UNION 
	SELECT
		m.Nombre
		,CMH.HORA
		,COALESCE(SUM(CMH.TIEMPO_PLANIFICADO) - SUM(CMH.TIEMPO_OPERATIVO),0) AS DuracionParoMayor
		,COALESCE(SUM(CMH.TIEMPO_OPERATIVO) - SUM(CMH.TIEMPO_BRUTO),0) AS DuracionParosMenores
		,COALESCE(SUM(CMH.TIEMPO_BRUTO) - SUM(CMH.TIEMPO_NETO),0) AS DuracionBajaVelocidad
		,COALESCE(SUM(CMH.TIEMPO_OPERATIVO) - SUM(CMH.TIEMPO_NETO),0) AS DuracionPerdidaProduccion
	FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	WHERE t.id = '+CONVERT(VARCHAR(100),@idTurno)+'
	GROUP BY ID_MAQUINA, m.Nombre, CMH.HORA
	ORDER BY Nombre, HORA'

	PRINT(@INISQL)
	EXEC(@INISQL)

COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosPerdidasTurnoLlenadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosPerdidasTurnoLlenadora] 
	-- Add the parameters for the stored procedure here
	@idTurno as int,
	@llenadora as varchar(100)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;


	SELECT NOMBRE, HORA, SUM(DuracionParoMayor) AS DuracionParoMayor, 0 AS DuracionParosMenores, 0 AS DuracionBajaVelocidad,SUM(DuracionPerdidaProduccion) AS DuracionPerdidaProduccion
	 FROM ( 
	 select @llenadora AS Nombre, DATEPART(HOUR, INICIO) AS HORA, SEGUNDOS AS DuracionParoMayor,  0 AS DuracionParosMenores,
			0 AS DuracionBajaVelocidad, 0 AS DuracionPerdidaProduccion
			from [dbo].[ParosPerdidasHorasTurnoMaquina](@idTurno,@llenadora,0) 
			UNION ALL 
			select @llenadora AS Nombre, DATEPART(HOUR, INICIO) AS HORA, 0 AS DuracionParoMayor,  0 AS DuracionParosMenores,
			0 AS DuracionBajaVelocidad, SEGUNDOS AS DuracionPerdidaProduccion
			from [dbo].[ParosPerdidasHorasTurnoMaquina](@idTurno,@llenadora,1) 
			UNION ALL
			select @llenadora AS Nombre, DATEPART(HOUR, INICIO) AS HORA, 0 AS DuracionParoMayor, SEGUNDOS AS DuracionParosMenores,
			0 AS DuracionBajaVelocidad, 0 AS DuracionPerdidaProduccion
			from [dbo].[ParosPerdidasHorasTurnoMaquina](@idTurno,@llenadora,2) 
	) TB
	GROUP BY NOMBRE, HORA
	ORDER BY Nombre, HORA


COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParosPorTipo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParosPorTipo] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as nvarchar(200),
	@desde as datetime,
	@hasta as datetime,
	@paroMayor as int,
	@paroMenor as int,
	@bajaVelocidad as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT [Id]
			  ,[TimeCategory]
			  ,[EsParoMayor]   
			  ,[EsParoMenor]   
			  ,[EsBajaVelocidad]     
			  ,[Inicio]
			  ,[Fin]
			  ,[EquipoId]
			  ,[EquipoNombre]
			  ,[CategoriaId]
			  ,[CategoriaNombre]
			  ,[MotivoId]
			  ,[MotivoNombre]
			  ,[CausaId]
			  ,[CausaNombre]
			  ,[Justificado]
			  ,[ProductoId]
			  ,[Usuario]
			  ,[Observaciones]
			  ,[Orden]
			  ,[Lote]
			  ,[MaquinaCausaId]
			  ,[MaquinaCausaNombre]
			  ,[EquipoConstructivoId]
			  ,[EquipoConstructivoNombre]
			  ,[Descripcion]
			FROM [ParosMayores]
			WHERE [EquipoNombre] in (SELECT Nombre FROM Maquinas where Linea =  @idLinea )
			AND [Inicio]>=@desde
			AND [fin]<=@hasta
			AND [EsParoMayor] = @paroMayor
			AND [EsParoMenor] = @paroMenor
			AND [EsBajaVelocidad] = @bajaVelocidad
			ORDER BY [Inicio] ASC
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParticionesActivas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Sergio V.
-- Create date: 28/09/2017
-- Description: Obtienes las particiones activas en una línea durante un periodo de tiempo
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParticionesActivas]
	@numLinea int,
	@iniTurno  datetime,
	@finTurno datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

	set @iniTurno = dateadd(day,-15, @iniTurno)
	set @finTurno = dateadd(day, 15, @finTurno)
	
	select p.Id, p.IdOrdenPadre, IdProducto, VelocidadNominal
	from Particiones p left join lineas l on p.Linea = l.id
	where l.NumeroLinea = @numLinea and FecIniReal is not null
	and (
	(@finTurno >=FecIniReal and @finTurno <= FecFinReal)
	or (@iniTurno >= FecIniReal and @finTurno <= FecFinReal)
	or (@iniTurno >= FecIniReal and @iniTurno <= FecFinReal)
	or (@iniTurno <= FecIniReal and @finTurno >= FecIniReal) 
	or (@finTurno >= FecIniReal and FecFinReal is null) )

	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParticionesOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParticionesOrden]
	@ordenId nvarchar(20)--,
	--@ordenIdPadre nvarchar(20),
	--@subordenId nvarchar(5)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.	
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		
	SELECT
		[Id]
		,[IdOrdenPadre]
		,[IdSubOrden]
		,[FecIniReal]
		,[FecFinReal]
	FROM [dbo].[Particiones]
	where IdOrdenPadre = @ordenId
	order by IdSubOrden
	
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParticionesOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParticionesOrdenTurno]
	@ordenId nvarchar(20)
	--@subordenId nvarchar(5)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.	
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		
	SELECT DISTINCT
		ID_PARTICION AS IdParticion
		,SHC_WORK_SCHED_DAY_PK AS IdTurno
	FROM (
		SELECT DISTINCT
			ID_PARTICION
			,SHC_WORK_SCHED_DAY_PK
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL
		WHERE PLL.ID_ORDEN = @ordenId
		UNION 
		SELECT DISTINCT
			ID_PARTICION
			,SHC_WORK_SCHED_DAY_PK
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA PR
		WHERE PR.ID_ORDEN = @ordenId
	) AS P
	
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerParticionOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerParticionOrdenTurno]
	@ordenId nvarchar(20),
	@idTurno int
	--@subordenId nvarchar(5)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.	
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;	
		
	SELECT DISTINCT
		ID_PARTICION AS IdParticion
		,SHC_WORK_SCHED_DAY_PK AS IdTurno
	FROM (
		SELECT DISTINCT
			ID_PARTICION
			,SHC_WORK_SCHED_DAY_PK
		FROM dbo.COB_MSM_PROD_LLENADORA_HORA PLL
		WHERE PLL.ID_ORDEN = @ordenId
		AND PLL.SHC_WORK_SCHED_DAY_PK = @idTurno 
		UNION 
		SELECT DISTINCT
			ID_PARTICION
			,SHC_WORK_SCHED_DAY_PK
		FROM dbo.COB_MSM_PROD_RESTO_MAQ_HORA PR
		WHERE PR.ID_ORDEN = @ordenId
		AND PR.SHC_WORK_SCHED_DAY_PK = @idTurno
	) AS P
	
	COMMIT TRANSACTION; 	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPerdidas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPerdidas]
	-- Add the parameters for the stored procedure here
	@idLinea as int,
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	DECLARE @IdTipoParoMenor AS INT;
	SELECT
		@IdTipoParoMenor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Pérdida de producción'

	--COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Límite de no justificación de pérdidas de producción (s)' 
	DECLARE @TIEMPO AS INT = (SELECT
			VALOR_INT
		FROM COB_MSM_PARAMETROS_LINEA_ADMIN PL
		INNER JOIN COB_MSM_TIPOS_PARAMETRO P
			ON P.PARAMETRO_ID = PL.FK_PARAMETRO_ID
		WHERE P.PARAMETRO_ID = 4
		AND PL.FK_LINEA_ID = @idLinea)

	SELECT
		Id
		,[IdTipoParoPerdida]
		,[TipoParoPerdida]
		,[inicio]
		,[Fin]
		,[EquipoId]
		,[EquipoNombre]
		,EquipoDescripcion AS EquipoDesc
		--,'Llenadora ' + Right(EquipoNombre,2)  as EquipoDesc
		--  ,'Llenadora ' + Right(EquipoNombre, CharIndex('-',REVERSE(EquipoNombre))-1) as [EquipoNombre]
		,[Justificado]
		,[MotivoId]
		,[MotivoNombre]
		,[CausaId]
		,[CausaNombre]
		,[Observaciones]
		,[MaquinaCausaId] AS [MaquinaCausaId]
		,[MaquinaCausaNombre] AS [MaquinaCausaNombre]
		,[EquipoConstructivoId]
		,[EquipoConstructivoNombre]
		,[Descripcion]
		,NumeroParosMenores
		,DuracionParosMenores
		,DuracionBajaVelocidad AS DuracionBajaVelocidad
		,DescripcionId

	FROM [dbo].ParosPerdidas
	WHERE IdLinea = @idLinea
	AND [Inicio] >= @desde
	AND [fin] <= @hasta
	AND [IdTipoParoPerdida] = @IdTipoParoMenor
	AND DuracionBajaVelocidad + DuracionParosMenores >= @TIEMPO
	ORDER BY inicio DESC
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPerdidasDesglosadas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPerdidasDesglosadas] 
	-- Add the parameters for the stored procedure here
	
	@idLinea as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT [Id]
			  ,[TimeCategory]
			  ,[EsParoMayor]   
			  ,[EsParoMenor]   
			  ,[EsBajaVelocidad]     
			  ,[Inicio]
			  ,[Fin]
			  ,[EquipoId]
			  ,[EquipoNombre]
			  ,[CategoriaId]
			  ,[CategoriaNombre]
			  ,[MotivoId]
			  ,[MotivoNombre]
			  ,[CausaId]
			  ,[CausaNombre]
			  ,[Justificado]
			  ,[ProductoId]
			  ,[Usuario]
			  ,[Observaciones]
			  ,[Orden]
			  ,[Lote]
			  ,[MaquinaCausaId]
			  ,[MaquinaCausaNombre]
			  ,[EquipoConstructivoId]
			  ,[EquipoConstructivoNombre]
			  ,[Descripcion]
			FROM [Perdidas]
			WHERE [EquipoNombre] in (SELECT Nombre FROM Maquinas where Linea =  @idLinea )
			AND [Inicio]>=@desde
			AND [fin]<=@hasta
			AND [EsParoMayor] = 0
			AND(
			 [EsParoMenor] = 1 
			 OR
			 [EsBajaVelocidad] = 1
			)
			ORDER BY [Inicio] DESC
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPicos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- ==================================================
-- Author:		Andrés
-- Create date: 29/07/2015
-- Description:	Obtiene los materiales de una planta
-- ==================================================
CREATE PROCEDURE [dbo].[MES_ObtenerPicos]
@turno as int
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	SELECT
	[IdPico]
	,[IdParticion]
	,[IdOrden]
	,[Cantidad]
	,[FechaTurno]
	,[TipoTurno]
	,Particiones.IdProducto AS [IdProducto]
	,Productos.Descripcion AS [Descripcion]
	FROM Picos
	INNER JOIN Particiones ON Particiones.Id = Picos.IdParticion
	INNER JOIN Productos ON Particiones.IdProducto = Productos.IdProducto
	WHERE IdTurno = @turno 

COMMIT TRANSACTION; 	


END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPlanificacionCocciones]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		
-- Create date: 
-- Description:	Obtener planificación cocciones con consulta a Manugistics
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPlanificacionCocciones]
	-- Add the parameters for the stored procedure here	
	@fIni as nvarchar(max), 
	@fFin as nvarchar(max), 
	@planta as nvarchar(max)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	--Ejemplo:
	--@fIni = '2018-01-01'
	--@fFin = '2018-12-01'
	--@planta = '8030'

	declare @fIniJuliano int = dbo.GregorianoToJuliano(@fIni)
	declare @fFinJuliano int = dbo.GregorianoToJuliano(@fFin)

	declare @fIniDatetime datetime = CONVERT(datetime,@fIni,102)
	declare @fFinDatetime datetime = CONVERT(datetime,@fFin,102)
	
	declare @manu as table(id int, diaJuliano int, codigo int, quantity int, tipo nvarchar(max), planta int, Semana int, Fecha datetime)
	insert into @manu
	exec [dbo].[PRE_OrdenesPlanificadasManugisticsV2] '        8030', @fIniJuliano, @fFinJuliano

	select manu.codigo, def.descript, SUM(manu.quantity) AS total--, rel.Czh
	from @manu manu
		inner join sitmesdb.dbo.mmdefinitions def on def.defid = convert(nvarchar(max),manu.codigo)
		inner join sitmesdb.dbo.mmdefvers v on v.defpk = def.defpk 
		--inner join mes_msm.dbo.RelPackingWOHighBeer_COB_ArticlesParametersWP rel ON  rel.DefID = convert(nvarchar(max),manu.codigo)
	group by manu.codigo, def.descript--, rel.Czh
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPlanificacionFiltraciones]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		
-- Create date: 
-- Description:	Obtener planificación cocciones con consulta a Manugistics
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPlanificacionFiltraciones]
	-- Add the parameters for the stored procedure here	
	@fIni as nvarchar(max), 
	@fFin as nvarchar(max), 
	@planta as nvarchar(max)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	--Ejemplo:
	--@fIni = '2018-01-01'
	--@fFin = '2018-12-01'
	--@planta = '8030'

	declare @fIniJuliano int = dbo.GregorianoToJuliano(@fIni)
	declare @fFinJuliano int = dbo.GregorianoToJuliano(@fFin)

	declare @fIniDatetime datetime = CONVERT(datetime,@fIni,102)
	declare @fFinDatetime datetime = CONVERT(datetime,@fFin,102)
	
	declare @manu as table(id int, diaJuliano int, codigo int, quantity int, tipo nvarchar(max), planta int, Semana int, Fecha datetime, Linea nvarchar(max))
	insert into @manu
	exec [dbo].[PRE_OrdenesPlanificadasManugisticsV3] '        8030', @fIniJuliano, @fFinJuliano

	select manu.codigo, def.descript, SUM(manu.quantity) AS total, manu.Linea AS Linea--, rel.Czh
	from @manu manu
		inner join sitmesdb.dbo.mmdefinitions def on def.defid = convert(nvarchar(max),manu.codigo)
		inner join sitmesdb.dbo.mmdefvers v on v.defpk = def.defpk 
		--inner join mes_msm.dbo.RelPackingWOHighBeer_COB_ArticlesParametersWP rel ON  rel.DefID = convert(nvarchar(max),manu.codigo)
	group by manu.codigo, def.descript, Linea--, rel.Czh
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPlanificacionOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPlanificacionOrdenes] 
	-- Add the parameters for the stored procedure here
	@fechaInicio datetime ,
	@fechaFin datetime 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		SELECT DISTINCT
			Particiones.Id,
			Particiones.IdOrdenPadre,
			Particiones.IdSuborden,
			Particiones.Linea,
			Particiones.Descripcion,
			IdEstadoAct,
			EstadoAct,
			EstadoAct.color AS ColorAct,
			IdEstadoAnt,
			EstadoAnt,
			EstadoAnt.color AS ColorAnt,
			FecIniEstimada as FecIniEstimada,
			FecFinEstimada as FecFinEstimada,
			FecIniReal as FecIniReal,
			FecFinReal as FecFinReal,
			Productos.IdProducto,
			Productos.Descripcion AS Producto,
			Productos.IdClase AS IdTipoProducto,
			Productos.Clase AS TipoProducto,
			Particiones.CantidadPlanificada,
			Particiones.CantidadProducida,
			Productos.udMedida,
			Particiones.VelocidadNominal,
			Particiones.OEEObjetivo,
			Particiones.OEECritico,
			Particiones.codigoJDE,
			Particiones.FecHorAct as RowUpdated,
			Particiones.CausaPausa,
			Particiones.EnvasesPorPalet as EnvasesPorPalet,
			Particiones.CajasPorPalet as CajasPorPalet
			FROM Particiones
			LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Particiones.IdEstadoAct
			LEFT JOIN EstadosOrden AS EstadoAnt ON EstadoAnt.Id = Particiones.IdEstadoAnt
			LEFT JOIN Productos ON Productos.IdProducto = Particiones.IdProducto
			LEFT JOIN Maquinas ON Maquinas.Orden = Particiones.Id
			where 	
			 (
				 (
				  FecIniEstimada between @fechaInicio and DATEADD(ms,86399997,@fechaFin)
				  AND FecFinEstimada between @fechaInicio and DATEADD(ms,86399997,@fechaFin)
				 )
			 
				OR

				 (
				   @fechaFin BETWEEN FecIniEstimada AND Particiones.FecFinEstimada
				 )
			 
				OR

				 (
				   @fechaInicio BETWEEN FecIniEstimada AND Particiones.FecFinEstimada
				 )
				 OR
				 (
					 EstadoAct IN ('Producción', 'Iniciando','Finalizando')
				 )
			 )
			 AND

			--((@fechaInicio <= FecIniEstimada and DATEADD(HOUR,24,@fechaFin) >= FecIniEstimada) OR
			--(@fechaInicio <= FecFinEstimada and DATEADD(HOUR,24,@fechaFin) >= FecFinEstimada) OR
			--(DATEADD(HOUR,24,@fechaFin) <= FecFinEstimada))
			 
			EstadoAct <> 'Creada' and EstadoAct <> 'Cancelada'
			--and FecIniReal is not null
			--(EstadoAct = 'Iniciando' or EstadoAct = 'Producción' or EstadoAct = 'Finalizando')
			order by FecIniEstimada,Particiones.Id asc
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPosiblesAverias]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPosiblesAverias]
	-- Add the parameters for the stored procedure here
	@idObjEquipoConstructivo as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT PA.[ID_POSIBLE_AVERIA]
			  ,PA.[ID_EQUIPO_CONSTRUCTIVO]
			  ,PA.[DESCRIPCION]
		  FROM [dbo].[POSIBLES_AVERIAS] PA
		  INNER JOIN EQUIPO_CONSTRUCTIVO E ON E.ID_EQUIPO_CONSTRUCTIVO = PA.ID_EQUIPO_CONSTRUCTIVO
		  where E.IdObj=@idObjEquipoConstructivo
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPPR]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPPR]
	-- Add the parameters for the stored procedure here
	@idLinea as nvarchar(255),
	@idProducto  as nvarchar(64)
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT [Linea]
		  ,[PPR]
		  ,[Material]
		  ,[Versionado]
	  FROM [ProductosLineas]
	  where Linea=@idLinea and Material =@idProducto
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerPPR_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerPPR_FAB]
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT DISTINCT  defid, descript, item
		FROM MES_MSM.dbo.PPR_FAB
		ORDER BY defid asc
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProduccionConsolidadaPorHora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerProduccionConsolidadaPorHora]
	-- Add the parameters for the stored procedure here
	@idTurno as int,
	@NumLinea as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT 
		[HORA] as Hora
		,min([FECHA_INICIO]) as Inicio
		,max([FECHA_FIN]) as Fin
		,sum([TIEMPO_NETO])  as tNeto
		,sum([TIEMPO_OPERATIVO]) as tOperativo
		,sum([TIEMPO_BRUTO]) as tBruto
		,sum([TIEMPO_PLANIFICADO]) as tPlanificado
		,sum([VELOCIDAD_NOMINAL]) as velNominal
		,sum([CONTADOR_PRODUCCION]) as TotalEnvasesLlenadora
		FROM COB_MSM_PROD_LLENADORA_HORA as Consolidacion
		INNER JOIN Turnos on Consolidacion.[SHC_WORK_SCHED_DAY_PK] = Turnos.Id
		INNER JOIN Lineas l ON l.Id = Turnos.Linea 
		WHERE [SHC_WORK_SCHED_DAY_PK] = @idTurno and l.NumeroLinea = @NumLinea
		GROUP BY [HORA]
		ORDER BY [HORA] 
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProduccionHoras]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerProduccionHoras]
	-- Add the parameters for the stored procedure here
     @linea nvarchar(255),
	 @desde datetime,
	 @hasta datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		DECLARE @HorasTurno TABLE (inicio datetime, fin datetime)
	
			DECLARE @d datetime
			DECLARE @h datetime

			SET @d = @desde
			SET @h = dateadd(hour,1, @d)

			BEGIN TRANSACTION
		
				WHILE @h <= @hasta
				  BEGIN
					INSERT  INTO @HorasTurno
					VALUES  (@d,@h)
					SET @d = @h
					SET @h = dateadd(hour,1, @d)
			
				  END		
			COMMIT TRANSACTION


		SELECT Maquina.[Id],Maquina.[Nombre], Hora.fin as Hora, 
				Produccion.OEE
				,Produccion.[EFICIENCIA]
				,Produccion.[DISPONIBILIDAD]
				--,Produccion.[CALIDAD]
				,Produccion.[RENDIMIENTO_MECANICO]
				,Produccion.[ENVASES_LLENADORA]
				,0 as HLCaudar 		 
				,Produccion.[ENVASES_PALETIZADORA]
				,Produccion.[ENVASES_RECHAZADOS]
		
			FROM [dbo].[Maquinas] Maquina
			Full Join @HorasTurno Hora on 1=1
			left join ProduccionHoras Produccion 
				on Produccion.Linea=Maquina.Linea and Produccion.Fecha=Hora.fin
			where Maquina.idClase=35 and Maquina.Linea=@linea
		order by Hora.fin
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProduccionTurnosConsolidada]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerProduccionTurnosConsolidada]
	@linea as nvarchar(100),
	@fIni as datetime,
	@fFin as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
	 --   SELECT Turnos.IdTipoTurno,Turnos.Turno as TipoTurno,PTC.*
	 --   FROM ProduccionTurnosConsolidada as PTC
		--LEFT JOIN Turnos on Turnos.Id = PTC.TURNO
	 --   where PTC.FECHA BETWEEN @fIni AND @fFin and
		--PTC.LINEA = @linea


		SELECT 
			Turnos.IdTipoTurno,
			Turnos.Turno as TipoTurno,
			Consolidado.*
		FROM (
			--Turnos.IdTipoTurno,
			--Turnos.Turno as TipoTurno,
			SELECT
			CONVERT(DATE, MIN(CLLH.FECHA_INICIO)) AS FECHA
		,MIN(CLLH.[FECHA_INICIO]) AS INICIO
		,MAX(CLLH.[FECHA_FIN]) AS FIN
		,CLLH.[SHC_WORK_SCHED_DAY_PK] AS Turno
		,SUM(CLLH.TIEMPO_NETO) AS TIEMPO_NETO
		,SUM(CLLH.TIEMPO_OPERATIVO) AS TIEMPO_OPERATIVO
		,SUM(CLLH.TIEMPO_PLANIFICADO) AS TIEMPO_PLANIFICADO
		,SUM(CLLH.VELOCIDAD_NOMINAL) AS VELNOMINAL
		,SUM(CLLH.CONTADOR_PRODUCCION) AS ENVASES_LLENADORA
		,SUM(CLLH.Contador_Rechazos) AS ENVASES_RECHAZADOS
		,SUM(CRMH.CONTADOR_PRODUCCION) AS ENVASES_PALETIZADORA
		,CASE
			WHEN SUM(CLLH.[TIEMPO_PLANIFICADO]) = 0 THEN 0
			ELSE ((SUM(CLLH.[TIEMPO_OPERATIVO]) / SUM(CLLH.[TIEMPO_PLANIFICADO])) * 100)
		END AS Disponibilidad
		,CASE
			WHEN SUM(CLLH.TIEMPO_OPERATIVO) = 0 THEN 0
			ELSE ((SUM(CLLH.TIEMPO_NETO) / SUM(CLLH.TIEMPO_OPERATIVO)) * 100)
		END AS Eficiencia
		,CASE
			WHEN SUM(CLLH.TIEMPO_OPERATIVO) = 0 OR
				SUM(CLLH.[TIEMPO_PLANIFICADO]) = 0 THEN 0
			ELSE ((SUM(CLLH.[TIEMPO_OPERATIVO]) / SUM(CLLH.[TIEMPO_PLANIFICADO])) * (SUM(CLLH.[TIEMPO_NETO]) / SUM(CLLH.[TIEMPO_OPERATIVO])) * 1.0) * 100.0
		END AS OEE
		,SUM(CRMH.CONTADOR_PRODUCCION) AS TotalPalets
		,1 AS CALIDAD 
		FROM LINEAS
		INNER JOIN  Turnos ON Turnos.Linea = Lineas.Id AND Lineas.Id = @linea AND Turnos.Fecha BETWEEN @fIni AND @fFin
		INNER JOIN  COB_MSM_PROD_LLENADORA_HORA as CLLH ON Turnos.Id = CLLH.SHC_WORK_SCHED_DAY_PK --AND ISNULL(CLLH.ID_ORDEN,'') != ''
		LEFT JOIN (select * from COB_MSM_PROD_RESTO_MAQ_HORA INNER JOIN Maquinas ON Maquinas.Id = ID_MAQUINA AND Maquinas.Clase = 'PALEETIZADORA' )as CRMH ON CLLH.SHC_WORK_SCHED_DAY_PK = CRMH.SHC_WORK_SCHED_DAY_PK AND CLLH.HORA = CRMH.HORA --AND ISNULL(CRMH.ID_ORDEN,'') != ''
		GROUP BY CLLH.SHC_WORK_SCHED_DAY_PK) AS Consolidado
		INNER JOIN Turnos ON Consolidado.Turno = Turnos.Id
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProductos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ==================================================
-- Author:		Andrés
-- Create date: 29/07/2015
-- Description:	Obtiene los materiales de una planta
-- ==================================================
CREATE PROCEDURE [dbo].[MES_ObtenerProductos]
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT
			IdProducto,
			Nombre,
			Descripcion,
				Productos.IdClase AS IdTipoProducto,
	Productos.Clase AS TipoProducto,
			Version,
			Status,
			UdMedida,
			F_EfectivoDesde,
			F_EfectivoHasta,
			EnUso,
			Autor,
			FechaCreacion,
			FechaUltCreacion,
			ModificadoPor,
			InfoAdicional,
			Tipo,
			IdLote,
			Gama,
			Marca,
			TipoEnvase
			FROM Productos;

	COMMIT TRANSACTION;
	

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProductosLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerProductosLinea]
	@idLinea as varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT PL.[idLinea] as idLinea,
		  PL.[Producto] as idProducto,
		  P.IdClase AS IdTipoProducto,
		  P.Clase AS TipoProducto,
		  P.Descripcion,
		  P.UdMedida
	  FROM [ParametrosLinea] as PL
	  inner join [Productos] as P ON PL.Producto = P.IdProducto
	  where [idLinea]=@idLinea AND p.UdMedida IN  ('PL', 'MD')
	  order by idLinea asc
	
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerProductosPlanta]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ==================================================
-- Author:		Leandro
-- Create date: 29/07/2015
-- Description:	Obtiene los productos de la planta
-- ==================================================
CREATE PROCEDURE [dbo].[MES_ObtenerProductosPlanta]
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT
		IdProducto,
		Nombre,
		Descripcion,
		IdClase AS IdTipoProducto,
		Clase AS TipoProducto,
		Version,
		Status,
		UdMedida,
		F_EfectivoDesde,
		F_EfectivoHasta,
		EnUso,
		Autor,
		FechaCreacion,
		FechaUltCreacion,
		ModificadoPor,
		InfoAdicional,
		Tipo,
		IdLote,
		udMedida
		FROM Productos;
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerQueries]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerQueries]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;


		SELECT [ID_QUERY]      ,[NOMBRE]      ,[TEXTO]  FROM [dbo].[QUERIES]
		Where TEXTO is not null and ID_QUERY > 3 AND ID_QUERY <> 10 AND ID_QUERY <> 11 --in (4,7,8,11)
	    ORDER BY NOMBRE
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerQueriesGraficos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerQueriesGraficos]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT [ID_QUERY]      ,[NOMBRE]      ,[TEXTO], TIPO, SERIESNAME, MAXVALOR ,COLORES FROM [dbo].[QUERIESGRAFICOS]
		--where ID_QUERY in (1,3,1002,1003,1005)
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerQuery]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerQuery]
	@id int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT [ID_QUERY]      ,[NOMBRE]      ,[TEXTO]  FROM [dbo].[QUERIES]
		where [ID_QUERY]=@id
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerQueryGrafico]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================

CREATE PROCEDURE [dbo].[MES_ObtenerQueryGrafico]
	@id int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		SELECT [ID_QUERY]      ,[NOMBRE]      ,[TEXTO], TIPO  FROM [dbo].[QUERIESGRAFICOS]
		where [ID_QUERY]=@id
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerReasonTree]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerReasonTree]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT [IdCategoria]
		  ,[Categoria]
		  ,[IdNivel1]
		  ,[Nivel1]
		  ,[IdNivel2]
		  ,[Nivel2]
	  FROM [ReasonTree]
	  order by idCategoria,idNivel1,idNivel2
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerRechazosTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO






CREATE PROCEDURE [dbo].[MES_ObtenerRechazosTurno]	
	-- Add the parameters for the stored procedure here
	@idTurno as int
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

BEGIN TRANSACTION;	
	DECLARE @RechazosInspectorSalidaLlenadora INT;
	DECLARE @RechazosInspectorBotellasVacias INT;
	DECLARE @RechazosClasificadores INT;
	DECLARE @RechazosProductoTerminado INT;
	
	SELECT @RechazosClasificadores = SUM(CMH.CONTADOR_RECHAZOS)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'CLASIFICADOR'

	SELECT @RechazosInspectorBotellasVacias = SUM(CMH.CONTADOR_RECHAZOS)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'INSPECTOR_BOTELLAS_VACIAS'

	SELECT @RechazosInspectorSalidaLlenadora = SUM(CMH.CONTADOR_RECHAZOS)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase = 'INSPECTOR_SALIDA_LLENADORA'

	SELECT @RechazosProductoTerminado = SUM(CMH.CONTADOR_RECHAZOS)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA CMH
	INNER JOIN Maquinas m ON m.Id = CMH.ID_MAQUINA
	INNER JOIN Turnos t ON CMH.SHC_WORK_SCHED_DAY_PK = t.Id
	where  t.Id = @idTurno AND m.Clase IN ('INSPECTOR_BOTELLAS_LLENAS', 'BASCULA')
		
	SELECT 
	 COALESCE(@RechazosClasificadores,0) AS rechazosClasificadorAutomatico,
	 COALESCE(@RechazosProductoTerminado,0) as rechazosProductoTerminadoAutomatico,
	 COALESCE(@RechazosInspectorSalidaLlenadora,0) as rechazosSalidaLlenadoraAutomatico,
	 COALESCE(@RechazosInspectorBotellasVacias,0)AS rechazosVaciosAutomatico	
	 
COMMIT TRANSACTION; 	 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerResumenParosPerdidas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerResumenParosPerdidas]
	-- Add the parameters for the stored procedure here
	@idMaquina as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN

SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	DECLARE @IdTipoParoMayor AS INT;
	DECLARE @IdTipoParoMenor AS INT;

	SELECT
		@IdTipoParoMenor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Pérdida de producción'

	SELECT
		@IdTipoParoMayor = ID_PARO
	FROM COB_MSM_PAROS
	WHERE DESC_PARO = 'Paro Mayor'


	--COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Límite de no justificación de pérdidas de producción (s)' 
	DECLARE @TIEMPO AS INT = (SELECT
			VALOR_INT
		FROM COB_MSM_PARAMETROS_LINEA_ADMIN PL
		INNER JOIN COB_MSM_TIPOS_PARAMETRO P
			ON P.PARAMETRO_ID = PL.FK_PARAMETRO_ID
		INNER JOIN LINEAS L
			ON PL.FK_LINEA_ID = L.NumeroLinea
		INNER JOIN MAQUINAS M
			ON M.LINEA = L.ID
			AND M.NOMBRE = @idMaquina
		WHERE P.PARAMETRO_ID = 4)

	--1	Paro Mayor
	--2	Pérdida de producción
	SELECT
		[ParosPerdidas].EquipoNombre
		,ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMayor) THEN 1
		END), 0) AS NumParosMayores
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMayor) THEN DATEDIFF(SECOND, INICIO, FIN)
		END), 0) AS BIGINT) AS TiempoParosMayores
		,ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor) THEN NumeroParosMenores
		END), 0) AS NumParosMenores
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor) THEN DuracionParosMenores
		END), 0) AS BIGINT) AS TiempoParosMenores
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor) THEN DuracionBajaVelocidad
		END), 0) AS BIGINT) AS TiempoBajaVelocidad
		,ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMayor AND
				Justificado = 1) THEN 1
		END), 0) AS NumParosMayoresJ
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMayor AND
				Justificado = 1) THEN DATEDIFF(SECOND, INICIO, FIN)
		END), 0) AS BIGINT) AS TiempoParosMayoresJ
		,ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor AND
				Justificado = 1) THEN NumeroParosMenores
		END), 0) AS NumParosMenoresJ
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor AND
				Justificado = 1) THEN DuracionParosMenores
		END), 0) AS BIGINT) AS TiempoParosMenoresJ
		,CAST(ISNULL(SUM(CASE
			WHEN (IdTipoParoPerdida = @IdTipoParoMenor AND
				Justificado = 1) THEN DuracionBajaVelocidad
		END), 0) AS BIGINT) AS TiempoBajaVelocidadJ
	FROM [dbo].[ParosPerdidas]
	WHERE [EquipoNombre] = @idMaquina
	AND [Inicio] >= @desde
	AND [fin] <= @hasta
	AND DuracionBajaVelocidad + DuracionParosMenores >=
														CASE
															WHEN IdTipoParoPerdida = @IdTipoParoMenor THEN @TIEMPO
															ELSE DuracionBajaVelocidad + DuracionParosMenores
														END
	GROUP BY [EquipoNombre]

COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerResumenParosPerdidasNoJustificados]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerResumenParosPerdidasNoJustificados]
	-- Add the parameters for the stored procedure here
	@idMaquina as nvarchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		declare @totalParosNojustificados int
		declare @totalPerdidasNojustificadas int
		declare @milisegundosParosNojustificados bigint
		declare @milisegundosPerdidasNojustificadas bigint

		set @totalParosNojustificados = (SELECT count(*)  FROM [dbo].[ParosMayores] 
							where [EquipoNombre] = @idMaquina
									and [Inicio]>=@desde
									and [fin]<=@hasta
									and [Justificado]=0)

		set @milisegundosParosNojustificados = (SELECT sum(DATEDIFF(ms,inicio,fin))  FROM [dbo].[ParosMayores] 
							where [EquipoNombre] = @idMaquina
									and [Inicio]>=@desde
									and [fin]<=@hasta
									and [Justificado]=0)

		set @totalPerdidasNojustificadas = (SELECT count(*)  FROM [dbo].Perdidas 
							where [EquipoNombre] = @idMaquina
									and [Inicio]>=@desde
									and [fin]<=@hasta
									and [Justificado]=0)

		set @milisegundosPerdidasNojustificadas = (SELECT sum(DATEDIFF(ms,inicio,fin))  FROM [dbo].Perdidas 
							where [EquipoNombre] = @idMaquina
									and [Inicio]>=@desde
									and [fin]<=@hasta
									and [Justificado]=0)

	  select @totalParosNojustificados as TotalParosNojustificados,
			 isnull(@milisegundosParosNojustificados,0) as MilisegundosParosNojustificados,
			 @totalPerdidasNojustificadas as TotalPerdidasNojustificadas,
			 isnull(@milisegundosPerdidasNojustificadas,0) as MilisegundosPerdidasNojustificadas
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerResumenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerResumenTurno]
	-- Add the parameters for the stored procedure here
	@idLinea as nvarchar(200),
	@idTurno as integer
	--,
	--@desde as datetime,
	--@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		declare @totalParosNojustificados int
		declare @totalPerdidasNojustificadas int
		declare @milisegundosParosNojustificados bigint
		declare @milisegundosPerdidasNojustificadas bigint
		DECLARE @IdTipoParoMayor AS INT;
		DECLARE @IdTipoParoMenor AS INT;

		SELECT
			@IdTipoParoMenor = ID_PARO
		FROM COB_MSM_PAROS
		WHERE DESC_PARO = 'Pérdida de producción'

		SELECT
			@IdTipoParoMayor = ID_PARO
		FROM COB_MSM_PAROS
		WHERE DESC_PARO = 'Paro Mayor'

		--COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Límite de no justificación de pérdidas de producción (s)' 
		DECLARE @TIEMPO AS INT = (select VALOR_INT from COB_MSM_PARAMETROS_LINEA_ADMIN PL
					INNER JOIN COB_MSM_TIPOS_PARAMETRO P ON P.PARAMETRO_ID = PL.FK_PARAMETRO_ID
					WHERE P.PARAMETRO_ID=4 AND PL.FK_LINEA_ID = @idLinea)

		set @totalParosNojustificados = (SELECT count(*)  FROM [dbo].[ParosPerdidas] 
							where IdLinea = @idLinea 
									and Turno = @idTurno
									and [Justificado]=0
									and IdTipoParoPerdida = @IdTipoParoMayor)

		set @milisegundosParosNojustificados = (SELECT sum(DATEDIFF(s,inicio,fin))  FROM [dbo].[ParosPerdidas] 
							where IdLinea = @idLinea 
									and Turno = @idTurno
									and [Justificado]=0
									and IdTipoParoPerdida = @IdTipoParoMayor)

		set @totalPerdidasNojustificadas = (SELECT count(*)  FROM [dbo].[ParosPerdidas] 
								where IdLinea = @idLinea 
									and Turno = @idTurno
									and [Justificado]= 0
									and IdTipoParoPerdida = @IdTipoParoMenor
									and DuracionBajaVelocidad + DuracionParosMenores >= @TIEMPO)

		set @milisegundosPerdidasNojustificadas = (SELECT sum(isnull(DuracionParosMenores,0)+isnull(DuracionBajaVelocidad,0))  FROM [dbo].[ParosPerdidas] 
								where IdLinea = @idLinea 
									and Turno = @idTurno
									and [Justificado]= 0
									and IdTipoParoPerdida = @IdTipoParoMenor
									and DuracionBajaVelocidad + DuracionParosMenores >= @TIEMPO)

	  select @totalParosNojustificados as TotalParosNojustificados,
			 isnull(@milisegundosParosNojustificados,0) as MilisegundosParosNojustificados,
			 @totalPerdidasNojustificadas as TotalPerdidasNojustificadas,
			 isnull(@milisegundosPerdidasNojustificadas,0) as MilisegundosPerdidasNojustificadas
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerSalasCoccion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		
-- Create date: 
-- Description:	Obtiene salas de cocción
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerSalasCoccion]
	
AS
BEGIN
	SET NOCOUNT ON;
	declare @parentpk int = (select locpk from sitmesdb.dbo.mmlocations where locid = 'COCCION')

	select locpk, localias, locpath
	from mes_msm.dbo.mmlocations_fab
	where parentlocpk = @parentpk and locid like '%SC%'
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerSemanasAnyo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerSemanasAnyo]
	-- Add the parameters for the stored procedure here
	@anyo as integer
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
    -- Insert statements for procedure here
		SELECT SEMANA,INICIO,FIN FROM SEMANAS
		WHERE AÑO = @anyo
		ORDER BY SEMANA ASC
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerSemanasTurnosFabrica]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerSemanasTurnosFabrica]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@anyo as int
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	CREATE TABLE #SemanasAno(idLinea VARCHAR(200), year INT, NumeroSemana INT, PrimerDiaSemana DATETIME, Inicio DATETIME, Fin DATETIME)

	INSERT INTO #SemanasAno (idLinea, [year], NumeroSemana, PrimerDiaSemana, Inicio, Fin)
		(SELECT
			@idLinea AS IdLinea
			,@anyo AS [year]
			,S.SEMANA
			,S.INICIO AS PrimerDiaSemana
			,S.INICIO AS Inicio
			,S.FIN AS Fin

		FROM dbo.SEMANAS S
		WHERE S.AÑO = @anyo
		GROUP BY	S.SEMANA
					,S.INICIO
					,S.FIN)

	SELECT
		idLinea
		,[year]
		,NumeroSemana
		,PrimerDiaSemana
		,Inicio
		,Fin
		,'<ColeccionTurnos><turnos>'
		-- period_id=''' + (SELECT
		--		ISNULL((SELECT TOP 1
		--				ISNULL(P.[Plantilla], '')
		--			FROM SITMesDB.dbo.SHC_WORK_SCHED_DAY AS turnos
		--			INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS L
		--				ON turnos.shc_work_sched_pk = L.shc_work_sched_pk
		--			INNER JOIN [dbo].[PlantillasTurnosFabrica] P
		--				ON P.[WDTemplate] = turnos.shc_working_day_id
		--			WHERE sa.idLinea = L.id
		--			AND turnos.work_date BETWEEN sa.Inicio AND sa.Fin)
		--		, ''))
		--+ '''>' +
		+ (SELECT
				turno.shc_working_day_id
				,turno.shc_work_sched_day_pk
				,turno.work_date
				,turno.work_start
				,turno.work_end
				,turno.shc_working_time_id
				,turno.shc_day_type_id
				,(SELECT
						holiday_work
					FROM SITMesDB.dbo.SHC_HOLIDAY
					WHERE turno.work_date = holiday_date)
				AS holiday_work
				,
				--datediff(hour,turno.work_start,turno.work_end) as horas,
				CONVERT(DECIMAL(10, 1), DATEDIFF(MINUTE, turno.work_start, turno.work_end) / 60.0) AS horas
				,DATEPART(WEEKDAY, turno.work_date) AS diaSemana
				,DATEADD(MINUTE, -tipoTurno.work_start_bias, CAST(CAST(turno.work_start AS DATE) AS datetime) + ' '+ CAST(CAST(tipoTurno.work_start AS TIME) AS datetime)) as working_time_start
				,DATEADD(MINUTE, -tipoTurno.work_start_bias, CAST(CAST(turno.work_end AS DATE) AS datetime) + ' '+ CAST(CAST(tipoTurno.work_end AS TIME) AS datetime)) as working_time_end
				,workBreak.shc_work_sched_break_pk
				,workBreak.break_start
				,workBreak.break_end
			FROM SITMesDB.dbo.SHC_WORK_SCHED_DAY AS turno
			INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS L
				ON turno.shc_work_sched_pk = L.shc_work_sched_pk
			LEFT JOIN SITMesDB.dbo.SHC_WORK_SCHED_BREAK AS workBreak ON workBreak.shc_work_sched_day_pk = turno.shc_work_sched_day_pk
			INNER JOIN SITMesDB.dbo.SHC_WORKING_TIME as tipoTurno on tipoTurno.id = turno.shc_working_time_id
			--INNER JOIN SEMANAS S
			--	ON S.[AÑO]= DATEPART(YEAR, turno.work_date) 
			--		AND S.[SEMANA]=DATEPART(iso_week, turno.work_date) --week
			--INNER JOIN #SemanasAno sa on sa.idLinea = L.id

			WHERE sa.idLinea = L.id
			AND turno.work_date BETWEEN sa.Inicio AND sa.Fin
			--and S.[Semana] =[SemanasAño].[NumeroSemana]							
			--and S.[AÑO]=[SemanasAño].[year]
			----and turno.shc_working_time_id!=0
			ORDER BY turno.work_date, turno.shc_working_time_id
			FOR XML AUTO)
		+ '</turnos></ColeccionTurnos>' AS Turnos
		,'<Template>' + (SELECT
				turno.[Plantilla]
				,turno.[IdTipoTurno]
				,turno.[TipoTurno]
				,turno.[PropTurno]
				,turno.[WDTemplate]
				,turno.[HorasTurno]
				,turno.[diaSemana]
			FROM [dbo].[PlantillasTurnosFabrica] turno
			WHERE turno.Plantilla IN (SELECT TOP 1
					turno.[Plantilla]
				FROM SITMesDB.dbo.SHC_WORK_SCHED_DAY AS turnos
				INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS L
					ON turnos.shc_work_sched_pk = L.shc_work_sched_pk
				INNER JOIN [dbo].[PlantillasTurnosFabrica] turno
					ON turno.[WDTemplate] = turnos.shc_working_day_id
				WHERE sa.idLinea = L.id
				AND turnos.work_date BETWEEN sa.Inicio AND sa.Fin
				ORDER BY turno.[diaSemana])
			FOR XML AUTO)
		+ '</Template>' AS Plantilla
	FROM #SemanasAno sa
	ORDER BY NumeroSemana


	DROP TABLE #SemanasAno
COMMIT TRANSACTION;
END
GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerServidorVinculado_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerServidorVinculado_FAB]
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


SELECT a.data_source
FROM sys.Servers a
LEFT OUTER JOIN sys.linked_logins b ON b.server_id = a.server_id
LEFT OUTER JOIN sys.server_principals c ON c.principal_id = b.local_principal_id
where a.name='SITMESDB_FAB'

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiemposAnalisisSPI]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiemposAnalisisSPI]
	-- Add the parameters for the stored procedure here
     @Linea nvarchar(255),
	 @Inicio nvarchar(255),
	 @Fin nvarchar(255),
	 @Tipo nvarchar(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET LANGUAGE SPANISH;
	SET DATEFORMAT DMY;
	set transaction isolation level read uncommitted

--SELECT convert(varchar(100),S.AÑO) + ' Semana ' + convert(varchar(100),S.SEMANA) as Fecha
--      ,C.seriesname
--      ,CONVERT(INT,AVG(C.seriesdata)) as seriesdata
--  FROM OrdenesArranque OC
--  INNER JOIN [dbo].[TIPOS_ARRANQUE] TA ON OC.[TipoArranque] = TA.ID_ARRANQUE AND REPLACE(REPLACE(REPLACE(TA.DESC_ARRANQUE,' ',''),'+',''),'-','')=@Tipo
--  CROSS APPLY (
--  SELECT 'Tiempo Final Llenadora' as seriesname, [MinutosFinal1] union all
--  SELECT 'Tiempo Final Paletizadora', [MinutosFinal2] union all
--  SELECT 'Tiempo Objetivo Llenadora', [MinutosObjetivo1] union all
--  SELECT 'Tiempo Objetivo Paletizadora', [MinutosObjetivo2] 
--  ) C (seriesname, seriesdata)
--  LEFT JOIN [dbo].[SEMANAS] S ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO
--  where InicioReal between  convert(datetime,@Inicio) and  convert(datetime,@Fin) and [IdLinea] =@Linea
--  GROUP BY S.AÑO, S.SEMANA,C.seriesname
--  order by C.seriesname, S.AÑO, S.SEMANA asc
	
	DECLARE @ini datetime = convert(datetime,@Inicio);
	DECLARE @find datetime = convert(datetime,@Fin);

	SELECT
		CONVERT(VARCHAR(100), S.AÑO) + ' Semana ' + CONVERT(VARCHAR(100), S.SEMANA) AS Fecha
		,C.seriesname
		,ISNULL(CONVERT(INT, SUM(C.seriesdata)), 0) AS seriesdata
	FROM [dbo].[SEMANAS] S
	LEFT JOIN (SELECT
					OA.*
				FROM [dbo].OrdenesArranque OA 
				INNER JOIN [dbo].[TIPOS_ARRANQUE] TA ON OA.[TipoArranque] = TA.ID_ARRANQUE
				AND REPLACE(REPLACE(REPLACE(TA.DESC_ARRANQUE, ' ', ''), '+', ''), '-', '') = @Tipo) OC
		ON OC.InicioReal <= S.FIN AND OC.InicioReal >= S.INICIO AND oc.IdLinea = @Linea
	CROSS APPLY (SELECT
			'Tiempo Final Llenadora' AS seriesname
			,[MinutosFinal1] UNION ALL SELECT
			'Tiempo Final Paletizadora'
			,[MinutosFinal2] UNION ALL SELECT
			'Tiempo Objetivo Llenadora'
			,[MinutosObjetivo1] UNION ALL SELECT
			'Tiempo Objetivo Paletizadora'
			,[MinutosObjetivo2]) C (seriesname, seriesdata)
	WHERE @ini <= S.FIN AND @find >= S.INICIO
	GROUP BY S.AÑO, S.SEMANA, C.seriesname
	ORDER BY C.seriesname ASC, S.SEMANA ASC

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiemposArranque]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiemposArranque]

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT 
		IdTiempoArranque,
		NumeroLinea as idLinea,
		--cast(NumeroLinea as varchar) + ' - ' + Lineas.Descripcion as DescLinea,
		Lineas.Descripcion as DescLinea,
		IdProductoEntrante,
		ProductoEntrante,
		TipoArranque,
		Tobj1,
		Tobj2,
		Tm,
		-- TIEMPO_CALCULADO_2, -- agomezn 030816: modificado para 117 del Excel de incidencias
		ISNULL([TIEMPO_CALCULADO_2],0) AS [TIEMPO_CALCULADO_2],
		-- TIEMPO_PREACTOR, -- agomezn 030816: modificado para 117 del Excel de incidencias
		ISNULL([TIEMPO_PREACTOR],0) AS [TIEMPO_PREACTOR],
		DescArranque
		FROM TiemposArranque
		INNER JOIN Lineas on Lineas.Nombre = TiemposArranque.LINEA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiemposCambio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiemposCambio]

AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
    -- Insert statements for procedure here
		SELECT 
		IdTiempoCambio,
		NumeroLinea as idLinea,
		--cast(NumeroLinea as varchar) + ' - ' + Lineas.Descripcion as DescLinea,
		Lineas.Descripcion as DescLinea,
		IdProductoEntrante,
		ProductoEntrante,
		IdProductoSaliente,
		ProductoSaliente,
		Tobj1,
		Tobj2,
		Tm,
		-- TIEMPO_CALCULADO_2, -- agomezn 030816: modificado para 116 del Excel de incidencias
		ISNULL([TIEMPO_CALCULADO_2],0) AS [TIEMPO_CALCULADO_2],
		-- TIEMPO_PREACTOR, -- agomezn 030816: modificado para 116 del Excel de incidencias
		ISNULL([TIEMPO_PREACTOR],0) AS [TIEMPO_PREACTOR]
		FROM TiemposCambio
		INNER JOIN Lineas on Lineas.Nombre = TiemposCambio.LINEA
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiempoVaciadoTrenLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiempoVaciadoTrenLinea]
	-- Add the parameters for the stored procedure here
	@linea NVARCHAR(255)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	DECLARE @IdParamtTiempoVaciadoTren INT = 14;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Tiempo para considerar vaciado tren'
	DECLARE @ParamtTiempoVaciadoTren INT;

	SELECT VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	INNER JOIN Lineas l ON l.NumeroLinea = FK_LINEA_ID
	WHERE FK_PARAMETRO_ID = @IdParamtTiempoVaciadoTren AND l.Id = @linea
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiposArranque]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE  PROCEDURE [dbo].[MES_ObtenerTiposArranque] 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT 
			FK_ID_LINEA AS NumLinea,
			A.ID_ARRANQUE AS IdArranque,
			A.DESC_ARRANQUE AS Descripcion
		FROM COB_MSM_ARRANQUES A
		INNER JOIN COB_MSM_LINEAS_ARRANQUES LA ON LA.FK_ID_ARRANQUE = A.ID_ARRANQUE
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiposArranqueLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiposArranqueLinea] 
	@numLinea INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT 
			A.ID_ARRANQUE AS Id,
			A.DESC_ARRANQUE AS Descripcion
		FROM COB_MSM_ARRANQUES A
		INNER JOIN COB_MSM_LINEAS_ARRANQUES LA ON LA.FK_ID_ARRANQUE = A.ID_ARRANQUE
		WHERE LA.FK_ID_LINEA = @numLinea
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTiposTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTiposTurno]
	-- Add the parameters for the stored procedure here
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT [Id]
			  ,[Inicio]
			  ,[Fin]
			  ,[Nombre]
		  FROM [dbo].[TiposTurno]
	COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTodasOrdenesIntervalo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		RPA
-- Create date: 25/04/2016
-- Description:	Obtiene todas las ordenes
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTodasOrdenesIntervalo]
	@fIni as datetime,
	@fFin as datetime
AS
BEGIN

	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

			SELECT DISTINCT
			'L' + CONVERT(VARCHAR(4), L.NumeroLinea) + ' - ' + L.descripcion as Linea,
		Ordenes.Id as CodWO,
		Productos.IdProducto as CodProducto,
		Productos.Descripcion AS Producto,
		FecIniEstimada as IniEst,
		FecFinEstimada as FinEst,
		Ordenes.CantidadProducida as Cantidad,
		Productos.udMedida as UniMedida,
		EstadoAct as Estado	
		FROM Ordenes
		LEFT JOIN EstadosOrden AS EstadoAct ON EstadoAct.Id = Ordenes.IdEstadoAct
		LEFT JOIN Productos ON Productos.IdProducto = Ordenes.IdProducto
		LEFT JOIN Maquinas M ON M.Orden = Ordenes.Id
		INNER JOIN LINEAS L ON Ordenes.[Linea] = L.ID
		Where 
		(FecIniReal >= @fIni and FecIniReal <= @fFin)
			or
		(FecFinReal >= @fIni and FecFinReal <= @fFin)
			or	
		(FecIniReal<= @fIni and FecFinReal >= @fFin)


	COMMIT TRANSACTION;	
	
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurno]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@fechaTurno as datetime,
	@tipoTurno as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno
		FROM Turnos
		where [Linea]=@idLinea and  Fecha=@fechaTurno and idTipoTurno=@tipoTurno
		order by InicioTurno
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnoAnterior]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnoAnterior]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@inicioTurnoAct as datetime
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;


	SELECT TOP 1
		Id
		,Linea
		,Fecha
		,InicioTurno AS InicioTurno
		,FinTurno AS FinTurno
		,IdTipoTurno
		,Turno
	FROM Turnos
	WHERE Turnos.InicioTurno < @inicioTurnoAct
	AND Linea = @idLinea and IdTipoTurno <> 0
	--AND @inicioTurnoAct NOT BETWEEN Turnos.InicioTurno AND Turnos.FinTurno -> Con esto se estaba sacando el turno anterior al anterior
	ORDER BY InicioTurno DESC
COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnoByid]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnoByid]
	-- Add the parameters for the stored procedure here
	@IdTurno as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno
		FROM Turnos
		where Id = @IdTurno
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnoCercano]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnoCercano]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@fechaTurno as datetime,
	@tipoTurno as int,
	@mayorMenor as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		-- Insert statements for procedure here
		IF Exists (SELECT Id,Linea,Fecha,InicioTurno,FinTurno,IdTipoTurno,Turno
				FROM Turnos
				where [Linea]=@idLinea and  Fecha=@fechaTurno and idTipoTurno=@tipoTurno)
		BEGIN
				SELECT Id,Linea,Fecha,InicioTurno as InicioTurno,FinTurno as FinTurno,IdTipoTurno,Turno
				FROM Turnos
				where [Linea]=@idLinea and  Fecha=@fechaTurno and idTipoTurno=@tipoTurno
				order by InicioTurno
		END
		ELSE
			BEGIN
			IF @mayorMenor=0
			BEGIN
					SELECT top 1 Id,Linea,Fecha,InicioTurno as InicioTurno,FinTurno as FinTurno,IdTipoTurno,Turno
					FROM Turnos
					where FinTurno <= @fechaTurno and IdTipoTurno>0 and [Linea]=@idLinea
					order by Convert(datetime,FinTurno) desc
			END
			ELSE
			BEGIN
					SELECT top 1 Id,Linea,Fecha,InicioTurno as InicioTurno,FinTurno as FinTurno,IdTipoTurno,Turno
					FROM Turnos
					where InicioTurno >= @fechaTurno and IdTipoTurno>0 and [Linea]=@idLinea
					order by Convert(datetime,FinTurno) asc
			END

		END
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnoPorFecha]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnoPorFecha]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@fecha as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT top(1)
			Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno AS NombreTipoTurno
		FROM Turnos 
		where [Linea]=@idLinea and @fecha BETWEEN InicioTurno AND FinTurno		
		order by InicioTurno desc
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnos]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@desde as datetime,
	@hasta as datetime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;

		-- Insert statements for procedure here
		SELECT Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno
		FROM Turnos
		where [Linea]=@idLinea and  InicioTurno BETWEEN @desde and @hasta and FinTurno BETWEEN @desde and @hasta AND LOWER(Turno) <> 'nowork'
		order by InicioTurno
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnosFabrica]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerTurnosFabrica]
	@idLinea as varchar(200),
	@anyo as int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		SELECT *
		FROM [TurnosFabrica]
		where [IdLinea]=@idLinea
		--and [PlantillaTurno] like '%T_0%'
		and datepart(year,[PrimerDiaSemana]) = @anyo
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnoSiguiente]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnoSiguiente]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@inicioTurnoAct as datetime
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;


	SELECT TOP 1
		Id
		,Linea
		,Fecha
		,InicioTurno AS InicioTurno
		,FinTurno AS FinTurno
		,IdTipoTurno
		,Turno
	FROM Turnos
	WHERE Turnos.InicioTurno > @inicioTurnoAct
	AND Linea = @idLinea and IdTipoTurno <> 0
	--AND @inicioTurnoAct NOT BETWEEN Turnos.InicioTurno AND Turnos.FinTurno -> Con esto se estaba sacando el turno anterior al anterior
	ORDER BY InicioTurno
COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnosLineaDia]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnosLineaDia]
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@fecha as DateTime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno
		FROM Turnos
		where [Linea]=@idLinea and  convert(date,Fecha) = convert(date,@fecha)
		order by InicioTurno
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnosMayoresFechaLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnosMayoresFechaLinea] 
	-- Add the parameters for the stored procedure here
	@idLinea as varchar(200),
	@fecha as DateTime
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
		-- Insert statements for procedure here
		SELECT t.Id
		  ,Linea
		  ,Fecha
		  ,InicioTurno
		  ,FinTurno
		  ,IdTipoTurno
		  ,Turno
		FROM Turnos t
		INNER JOIN Lineas l ON l.Id = t.Linea
		where l.NumeroLinea=@idLinea and  InicioTurno >= @fecha
		order by InicioTurno
	COMMIT TRANSACTION; 
END


GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerTurnosOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- =============================================
-- Description:	Obtiene los turnos que abarca una wo
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerTurnosOrden]
	@linea as nvarchar(200),
	@desde datetime,
	@hasta datetime
AS
BEGIN
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	declare	@desdeOrig datetime= @desde;
	declare	@hastaOrig datetime= @hasta;
	DECLARE @InicioTurno datetime;
	declare @FinTurno datetime;
	DECLARE @TurnoSup BIT = 1;

	--Buscamos la primera fecha de Inicio del turno en el que @desde este comprendida, incrementamos en 1h @desde hasta que no haya más reg o sea > que @hasta
	WHILE ((@InicioTurno IS NULL) OR (LEN(@InicioTurno) = 0)) AND (@TurnoSup = 1)
	BEGIN
		select	@InicioTurno = InicioTurno
		from Turnos
		where [Linea]=@linea and @desde BETWEEN InicioTurno and FinTurno

		SET @desde = DATEADD(hh, +1, @desde);

		DECLARE @Turnos INT;
		select @Turnos = COUNT(Id) 
		FROM Turnos
		where [Linea]=@linea and InicioTurno >= @desde
	
		IF (@Turnos = 0)
			SET @TurnoSup = 0; 
		IF(@desde > @hastaOrig) BREAK;
	END
	-- Si no hemos encontrado @InicioTurno, probamos si hay alguno en el que @hasta este comprendida
	IF((@InicioTurno IS NULL) OR (LEN(@InicioTurno) = 0))
	BEGIN
		select	@InicioTurno = InicioTurno
		from Turnos
		where [Linea]=@linea and @hastaOrig BETWEEN InicioTurno and FinTurno
	END

	--Si hay Turnos superiores (que su Inicio sea superior a @desde)
	IF (@TurnoSup = 1)
	BEGIN
		--Buscamos la primera fecha de Fin en el que @hasta este comprendida, decrementamos 1h hasta que @hasta sea menos que @desde
		WHILE(@FinTurno IS NULL) OR (LEN(@FinTurno) = 0)
		BEGIN
			select	@FinTurno = FinTurno
			from Turnos
			where [Linea]=@linea and @hasta BETWEEN InicioTurno and FinTurno
			SET @hasta = DATEADD(hh, -1, @hasta);

			IF(@hasta < @desdeOrig) BREAK;

		END

		-- Si no hemos encontrado @FinTurno, probamos si hay alguno en el que @desde este comprendida
		IF(@FinTurno IS NULL) OR (LEN(@FinTurno) = 0)
		BEGIN
			select	@FinTurno = FinTurno
			from Turnos
			where [Linea]=@linea and @desdeOrig BETWEEN InicioTurno and FinTurno
		END

		SELECT Id
			  ,Linea
			  ,Fecha
			  ,InicioTurno
			  ,FinTurno
			  ,IdTipoTurno
			  ,Turno
			FROM Turnos
			where [Linea]=@linea and InicioTurno >= @InicioTurno and FinTurno <= @FinTurno and IdTipoTurno <> 0
			order by InicioTurno
	END
COMMIT TRANSACTION; 

END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerValoresAntiguosFechas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerValoresAntiguosFechas]
	@ordenId nvarchar(20)
AS
BEGIN
-- SET NOCOUNT ON added to prevent extra result sets from
-- interfering with SELECT statements.
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

BEGIN TRANSACTION;

	SELECT	Ordenes.actual_start_time AS FechaInicioReal
			,Ordenes.actual_end_time AS FechaFinReal
			,CASE WHEN isnull(FechaFinRealOriginal.VAL,'')='' THEN NULL ELSE FechaFinRealOriginal.VAL END AS FechaInicioRealOld
			,CASE WHEN isnull(FechaFinRealOriginal.VAL,'')='' THEN NULL ELSE FechaFinRealOriginal.VAL END AS FechaFinRealOld
	FROM (SELECT pom_order_id, actual_start_time, actual_end_time FROM SITMesDB.dbo.POMV_ORDR WHERE pom_order_id = @ordenId) AS Ordenes
	INNER JOIN (SELECT
					oprp.pom_order_id AS IdOrden
					,VAL
					FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
					WHERE (pom_custom_fld_name = 'FECHA_INICIO_REAL' AND oprp.pom_order_id = @ordenId)
				) AS FechaInicioRealOriginal ON FechaInicioRealOriginal.IdOrden = Ordenes.pom_order_id
	INNER JOIN (SELECT
					oprp.pom_order_id AS IdOrden
					,VAL
					FROM SITMesDB.dbo.POMV_ORDR_PRP AS oprp
					WHERE (pom_custom_fld_name = 'FECHA_FIN_REAL' AND oprp.pom_order_id = @ordenId)
				) AS FechaFinRealOriginal ON FechaFinRealOriginal.IdOrden =  Ordenes.pom_order_id


COMMIT TRANSACTION;
END
GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerValoresHistorian_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerValoresHistorian_FAB]
	-- Add the parameters for the stored procedure here
	@nombreKOP varchar(200),
	@fechaini int,
	@fechafin int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;


	IF (@fechaini>-1)
	BEGIN
	DECLARE @IDKOP AS INT
	DECLARE @OpType AS VARCHAR(10)

	SELECT @IDKOP = [NewTagID], @OpType=[OperationType] FROM [SITMESDB_FAB].[PPA].[dbo].[LOG_CONFIGURATION_TAG]
	WHERE [TagName] LIKE '%' + @nombreKOP + '%' ORDER BY OPERATIONDATE DESC, NEWTAGID DESC

	--IF (@OpType = 'i')
	--BEGIN
	SELECT TOP 100 [TagID],MIN([Time]) as [Time],Min([Msec]) as Msec,Min([Value]) as [Value],[Status],CONVERT(VARCHAR(10),RowUpdated, 103) + ' ' + CONVERT(VARCHAR(100),RowUpdated,108) as RowUpdated,'i' as Tipo 
	FROM [SITMESDB_FAB].[PPA].[dbo].[View_Read_REALTIMEINTArchive] 
	WHERE [TagID] = @IDKOP AND [Time] between @fechaini AND @fechafin 
	GROUP BY CONVERT(VARCHAR(10),RowUpdated, 103) + ' ' + CONVERT(VARCHAR(100),RowUpdated,108),[TagID], [Status]
	ORDER BY MIN([Time]) ASC, MIN(MSEC) ASC
	--END
	--	SELECT TOP 100 [TagID],[Time] as [Time],[Msec] as Msec,[Value] as [Value],[Status],CONVERT(VARCHAR(10),RowUpdated, 103) + ' ' + CONVERT(VARCHAR(100),RowUpdated,108) as RowUpdated,'i' as Tipo 
	--FROM [SITMESDB_FAB].[PPA].[dbo].[View_Read_REALTIMEINTArchive] 
	--WHERE [TagID] = @IDKOP AND [Time] between @fechaini AND @fechafin 
	----GROUP BY CONVERT(VARCHAR(10),RowUpdated, 103) + ' ' + CONVERT(VARCHAR(100),RowUpdated,108),[TagID], [Status]
	--ORDER BY [Time] ASC, MSEC ASC
	END
	END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerValoresHistorianByList_FAB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[MES_ObtenerValoresHistorianByList_FAB]
	-- Add the parameters for the stored procedure here
	@nombreKOP varchar(max),
	@fechaini nvarchar(max),
	@fechafin nvarchar(max),
	@pivotValues nvarchar(max),
	@pivotSelect nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;
	declare @sql nvarchar(max);
	set @sql='IF ('+@fechaini+'>-1)
			  BEGIN			 
				    SELECT TOP 100 RowUpdated,'+ @pivotSelect +' 
					FROM (SELECT 
						  [TagID],[Value],CONVERT(VARCHAR(10),RowUpdated, 103) + '' '' + CONVERT(VARCHAR(100),RowUpdated,108) as RowUpdated
						  FROM [SITMESDB_FAB].[PPA].[dbo].[RPT_MGR_REALTIMEINTArchive] 
						  WHERE [TagID] in (SELECT [TagID] FROM [SITMESDB_FAB].[PPA].[dbo].[TAG]
											WHERE '+@nombreKOP+') AND [Time] between '+ @fechaini+' AND '+@fechafin+'																														
						  UNION ALL					
						  SELECT 
						  [TagID],[Value],CONVERT(VARCHAR(10),RowUpdated, 103) + '' '' + CONVERT(VARCHAR(100),RowUpdated,108) as RowUpdated
						  FROM [SITMESDB_FAB].[PPA].[dbo].[RPT_MGR_REALTIMEFLOATArchive] 
						  WHERE [TagID] in (SELECT [TagID] FROM [SITMESDB_FAB].[PPA].[dbo].[TAG]
											WHERE '+@nombreKOP+') AND [Time] between '+ @fechaini+' AND '+@fechafin+') aux	  
					Pivot(avg(Value) for TagID  in( '+@pivotValues+')) as Medida
					ORDER BY RowUpdated
			  END'
	--print @sql
	exec sp_sqlexec @sql
END
GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerVelNomTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerVelNomTurno]
	-- Add the parameters for the stored procedure here
	
	@MAQUINA as nvarchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	BEGIN TRANSACTION;
			BEGIN TRY
		SELECT CONVERT(NUMERIC(18,2),isnull(SUM(L.VELOCIDAD_NOMINAL),'0.0')) as VelNom FROM COB_MSM_PROD_LLENADORA_HORA L
		INNER JOIN TURNOS T ON T.Id = L.SHC_WORK_SCHED_DAY_PK AND GETDATE() BETWEEN T.InicioTurno AND T.FinTurno
		WHERE ID_MAQUINA=@MAQUINA
		AND L.FECHA_INICIO >= T.InicioTurno AND HORA < DATEPART(HOUR,GETDATE())
		END TRY
		BEGIN CATCH
		SELECT '0.0'
		END CATCH
	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerZonasCompartidas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[MES_ObtenerZonasCompartidas]
	@IdZona as VARCHAR(8000)
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;

	SELECT	DISTINCT
		Zonas.ID_ZONA AS Id
		,Zonas.ZONA AS NombreZona
		,Zonas.DESC_ZONA as DescripcionZona
		,Zonas.FK_LINEAS_ID as NumLinea
	FROM
	
	(SELECT ID_ZONA
	FROM
	   (SELECT ID_ZONA_1, ID_ZONA_2
	   FROM dbo.COB_MSM_ZONAS_COMPARTIDAS
	   WHERE ID_ZONA_1 = @IdZona OR ID_ZONA_2 = @IdZona) p
	UNPIVOT
	   (ID_ZONA FOR ZONA_ZONA IN
		  (ID_ZONA_1, ID_ZONA_2)
	)AS unpvt
	) AS ZonasComunes
	INNER JOIN dbo.COB_MSM_ZONAS AS Zonas ON Zonas.ID_ZONA = ZonasComunes.ID_ZONA
	WHERE Zonas.ID_ZONA <> @IdZona
COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MES_ObtenerZonasLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		Leandro
-- Create date: 28/02/2015
-- Description:	Obtiene las zonas de una línea concreta
-- =============================================
CREATE PROCEDURE [dbo].[MES_ObtenerZonasLinea]
	@linea as int
AS
BEGIN
SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
	SELECT
		MaestroZonas.ID_ZONA AS Id
		,MaestroZonas.Zona AS Nombre
		,MAX(MaestroZonas.ORDEN_ZONA) AS NumeroZona
		,MAX(MaestroZonas.DESC_ZONA) AS Descripcion
		,MAX(MaestroZonas.Compartida) AS Compartida
		,MAX(MaquinasOrdenes.Orden) AS Orden
		,MaestroZonas.ARRANQUE AS ArranqueFin
		,MaestroZonas.INICIO_CAMBIO_FIN AS InicioCambio
		,MaestroZonas.INICIO_PAUSA AS InicioPausa
		,MaestroZonas.PREPARACION AS Preparacion
	FROM COB_MSM_ZONAS AS MaestroZonas
	INNER JOIN MaquinasZonas
		ON MaquinasZonas.Zona = MaestroZonas.ID_ZONA
	INNER JOIN Lineas
		ON Lineas.NumeroLinea = MaestroZonas.FK_LINEAS_ID
	LEFT JOIN MaquinasOrdenes
		ON MaquinasOrdenes.PkEquipo = MaquinasZonas.PkEquipo
	WHERE MaestroZonas.FK_LINEAS_ID = @linea
	GROUP BY	MaestroZonas.ID_ZONA
				,MaestroZonas.Zona
				,MaestroZonas.ARRANQUE
				,MaestroZonas.INICIO_CAMBIO_FIN
				,MaestroZonas.INICIO_PAUSA
				,MaestroZonas.PREPARACION
	ORDER BY NumeroZona
COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[MES_SetFechaTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[MES_SetFechaTurno]
@fecha AS DATETIME,
@fechaIni AS DATETIME,
@fechaFin AS DATETIME,
@linea AS NVARCHAR(50)
AS
BEGIN

DECLARE @idTurno AS INT = 0;

select  @idTurno = shc_work_sched_day_pk 
FROM [SITMesDB].[dbo].[SHC_WORK_SCHED_DAY] AS turno
INNER JOIN SITMesDB.dbo.SHC_WORK_SCHED AS L
ON turno.shc_work_sched_pk = L.shc_work_sched_pk
WHERE L.id = @linea AND turno.work_date = DATEADD (DAY , 1 , @fecha ) AND turno.work_start = @fechaIni AND turno.work_end = @fechaFin

IF (@idTurno > 0)
BEGIN
UPDATE [SITMesDB].[dbo].[SHC_WORK_SCHED_DAY]
   SET [work_date] = @fecha
 WHERE shc_work_sched_day_pk = @idTurno
END

END




GO
/****** Object:  StoredProcedure [dbo].[MES_UpdateICTurnos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[MES_UpdateICTurnos]
	@fIni AS DATETIME,
	@fFin AS DATETIME,
	@NumLinea as SMALLINT,
	@ICTurno as FLOAT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;

	BEGIN TRANSACTION;
    -- Insert statements for procedure here
	DECLARE @$IDArchiveValue AS BIGINT;
	DECLARE @fIniTurnoInferior AS DATETIME;

	SELECT TOP(1) @$IDArchiveValue = [$IDArchiveValue], @fIniTurnoInferior = FECHA_INICIO
	FROM COB_MSM_CONSOLIDADO_TURNO
	INNER JOIN Lineas l ON l.Id = LINEA
	WHERE (((FECHA_INICIO BETWEEN @fIni AND @fFin) OR (FECHA_FIN BETWEEN @fIni AND @fFin)) OR ((@fIni BETWEEN FECHA_INICIO AND FECHA_FIN) AND (@fFin BETWEEN FECHA_INICIO AND FECHA_FIN))) AND l.NumeroLinea = @NumLinea
	ORDER BY FECHA_INICIO

	UPDATE CTURNO
	SET CTURNO.[IC] = @ICTurno
	FROM COB_MSM_CONSOLIDADO_TURNO AS CTURNO
	INNER JOIN Lineas l ON l.Id = LINEA  
	WHERE (((FECHA_INICIO BETWEEN @fIni AND @fFin) OR (FECHA_FIN BETWEEN @fIni AND @fFin)) OR ((@fIni BETWEEN FECHA_INICIO AND FECHA_FIN) AND (@fFin BETWEEN FECHA_INICIO AND FECHA_FIN))) AND l.NumeroLinea = @NumLinea AND [$IDArchiveValue] <> @$IDArchiveValue
	--En el caso de que un turno tenga un gap entre medias puede que tenga dos IC, en este caso su IC será el del turno anterior
	IF(@fIniTurnoInferior < @fIni)
	BEGIN		
		DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME;
		DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME;
		SELECT @FECHA_INICIO_LIMITE_INFERIOR = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR = FECHA_INICIO_LIMITE_SUPERIOR FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fIniTurnoInferior,@NumLinea,0)

		IF(@FECHA_INICIO_LIMITE_INFERIOR IS NULL OR @FECHA_INICIO_LIMITE_SUPERIOR IS NULL)
		BEGIN
			UPDATE COB_MSM_CONSOLIDADO_TURNO
			SET [IC] = @ICTurno
			WHERE [$IDArchiveValue] = @$IDArchiveValue
		END
	END	

	COMMIT TRANSACTION; 
END

GO
/****** Object:  StoredProcedure [dbo].[MSM-UPDATE-SHC_WORK_SCHED_DAY]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[MSM-UPDATE-SHC_WORK_SCHED_DAY] 
	-- Add the parameters for the stored procedure here
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	UPDATE [SITMesDB].[dbo].[SHC_WORK_SCHED_DAY]
	   SET [shc_working_time_id] = 1
		  ,[shc_shift_id] = 1
	Where [shc_working_time_id] = 4 or [shc_shift_id] = 4 

	UPDATE [SITMesDB].[dbo].[SHC_WORK_SCHED_DAY]
	   SET [shc_working_time_id] = 2
		  ,[shc_shift_id] = 2
	Where [shc_working_time_id] = 5 or [shc_shift_id] = 5 

	UPDATE [SITMesDB].[dbo].[SHC_WORK_SCHED_DAY]
	   SET [shc_working_time_id] = 3
		  ,[shc_shift_id] = 3
	Where [shc_working_time_id] = 6 or [shc_shift_id] = 6 
END

GO
/****** Object:  StoredProcedure [dbo].[NOT_CambiosMaquinas]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- ==================================================
-- Author:		Leandro
-- Create date: 29/07/2015
-- Description:	Obtiene los cambios de estado en las maquinas
-- ==================================================
CREATE PROCEDURE [dbo].[NOT_CambiosMaquinas]
@lastUpdate AS DATETIME
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	
	BEGIN TRANSACTION;	

		SELECT IdMaquina,Estado,Linea,Zona, FecInicio as FechaAct FROM EstadoActualMaquinas
		WHERE EstadoActualMaquinas.FecInicio > @lastUpdate

		--Maquinas que no aparecen en EstadoActualMaquinas -> Desconectadas	
		SELECT m.[Linea],m.[Zona],m.[Nombre]
		FROM [dbo].[Maquinas] m
		EXCEPT
		SELECT Linea, Zona, IdMaquina
		from EstadoActualMaquinas		
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[NOT_CambiosOrdenes]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[NOT_CambiosOrdenes]
@lastUpdate AS DATETIME = NULL
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	
	BEGIN TRANSACTION;	

		--Cambios a nivel de linea y estado orden
		IF (@lastUpdate IS NULL)
		BEGIN
			SELECT 
				Ordenes.pom_order_id AS Orden,
				Ordenes.pom_order_status_id AS Estado,
				Ordenes.pom_order_status_pk AS IdEstado,
				LineaPPR.ExecEquipList_ExecEquipLongName AS Linea,
				Ordenes.RowUpdated, --AS Actualizacion
				Ordenes.estimated_start_time AS FecIniEstimada, 
				Ordenes.estimated_end_time AS FecFinEstimada,
				Ordenes.pom_matl_qty AS CantidadPlanificada,
				Ordenes.actual_start_time AS FecIniReal,
				Ordenes.note
			FROM SitMesDB.dbo.pomv_ordr as Ordenes
			--LEFT JOIN @listEstados as lstE ON Ordenes.pom_order_status_pk = lstE.IdEstado
			INNER JOIN SITMesDB.dbo.PDefM_PPR AS PPR ON PPR.PPR = Ordenes.ppr_name and PPR.PPR_Active = 1
			INNER JOIN SITMesDB.dbo.PDefM_PS_ExecEquipList AS LineaPPR ON ExecEquipList_PPR = PPR.PPR and ExecEquipList_PPRVersion = PPR.PPR_Version
			LEFT JOIN SITMesDB.dbo.POMV_ORDR_PRP OrderProperty ON Ordenes.pom_order_id = OrderProperty.pom_order_id AND pom_custom_fld_name = 'WO_PART_ID'
			where pom_order_type_id IN ('Envasado','WO_ENVASADO') AND ISNULL(CONVERT(INT,OrderProperty.VAL),-1) > 0
		END
		ELSE BEGIN
			SELECT 
				Ordenes.pom_order_id AS Orden,
				Ordenes.pom_order_status_id AS Estado,
				Ordenes.pom_order_status_pk AS IdEstado,
				LineaPPR.ExecEquipList_ExecEquipLongName AS Linea,
				Ordenes.RowUpdated, --AS Actualizacion
				Ordenes.estimated_start_time AS FecIniEstimada, 
				Ordenes.estimated_end_time AS FecFinEstimada,
				Ordenes.pom_matl_qty AS CantidadPlanificada,
				Ordenes.actual_start_time AS FecIniReal,
				Ordenes.note
			FROM SitMesDB.dbo.pomv_ordr as Ordenes
			--LEFT JOIN @listEstados as lstE ON Ordenes.pom_order_status_pk = lstE.IdEstado
			INNER JOIN SITMesDB.dbo.PDefM_PPR AS PPR ON PPR.PPR = Ordenes.ppr_name and PPR.PPR_Active = 1
			INNER JOIN SITMesDB.dbo.PDefM_PS_ExecEquipList AS LineaPPR ON ExecEquipList_PPR = PPR.PPR and ExecEquipList_PPRVersion = PPR.PPR_Version
			LEFT JOIN SITMesDB.dbo.POMV_ORDR_PRP OrderProperty ON Ordenes.pom_order_id = OrderProperty.pom_order_id AND pom_custom_fld_name = 'WO_PART_ID'
			where pom_order_type_id IN ('Envasado','WO_ENVASADO') AND ISNULL(CONVERT(INT,OrderProperty.VAL),-1) > 0  and Ordenes.RowUpdated > @lastUpdate
			--AND lstE.IdEstado IS NULL
		END

		--Cambios de Zona
		select distinct COB_MSM_ZONAS.ID_ZONA as Zona,
		Ordenes.equip_prpty_value 
		AS Orden
		from SitMesDB.dbo.BPM_EQUIPMENT_PROPERTY as Zonas
		INNER JOIN  COB_MSM_ZONAS on COB_MSM_ZONAS.ID_ZONA = Zonas.equip_prpty_value
		inner join SitMesDB.dbo.BPM_EQUIPMENT_PROPERTY as Ordenes on Zonas.equip_pk = Ordenes.equip_pk
		inner join SitMesDB.dbo.BPM_EQUIPMENT as Equipos on Equipos.equip_pk = Zonas.equip_pk
		where Zonas.equip_prpty_id = 'ZONA_ID' and Ordenes.equip_prpty_id = 'ORDER_ID' and Equipos.equip_in_plant = 1 AND Equipos.equip_status = 1
		group by COB_MSM_ZONAS.ID_ZONA,Ordenes.equip_prpty_value

	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[NOT_CambiosTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




-- ==================================================
-- Author:		Leandro
-- Create date: 28/08/2015
-- Description:	Comprueba si ha habido un cambio de turno
--				para una fecha y hora determinada
-- ==================================================
CREATE PROCEDURE [dbo].[NOT_CambiosTurno]
@fechaHora AS DATETIME,
@idPlanta AS NVARCHAR(255)
AS
BEGIN
	SET NOCOUNT ON;
	SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
	
	BEGIN TRANSACTION;	

		SELECT Lineas.Id as Linea,Turnos.Id as IdTurno,Fecha,InicioTurno,FinTurno,IdTipoTurno,Turno
		FROM Lineas 
		LEFT JOIN (SELECT Linea,Id,Fecha,InicioTurno,FinTurno,IdTipoTurno,Turno FROM Turnos WHERE @fechaHora >= InicioTurno AND @fechaHora <= FinTurno) As Turnos
		ON Lineas.Id = Turnos.Linea WHERE Lineas.EquipoSuperior = @idPlanta
		ORDER BY Linea ASC;
				
	COMMIT TRANSACTION;
END

GO
/****** Object:  StoredProcedure [dbo].[PRE_ManugisticsDeslizante]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[PRE_ManugisticsDeslizante]
	@tipo as nvarchar(max)
AS

BEGIN

	declare @NextDayID INT  = 0 -- 0=Mon, 1=Tue, 2 = Wed, ..., 5=Sat, 6=Sun

	declare @fIniDatetime datetime = (SELECT DATEADD(DAY, (DATEDIFF(DAY, @NextDayID, GETDATE()) / 7) * 7 + 7, @NextDayID))
	
	declare @numSemanas int = (select semanas from mes_msm.dbo.COB_MSM_DeslizanteGeneral)
	declare @fFinDatetime datetime = DATEADD(DAY,@numSemanas * 7, DATEADD(SECOND,-1,@fIniDatetime))
	
	declare @fIniJuliano int = dbo.GregorianoToJuliano(@fIniDatetime)
	declare @fFinJuliano int = dbo.GregorianoToJuliano(@fFinDatetime)

	declare @currentWeek nvarchar(max) = (SELECT DATEPART( WEEK, @fIniDatetime))	--semana inicial (actual)
	declare @untilWeek nvarchar(max) = (SELECT DATEPART( WEEK, @fFinDatetime))	--semana final (según COB)

	--Instanciar parámetros de instantánea
	declare @fechaIns nvarchar(max) = (select CONVERT(VARCHAR(10), GETDATE(), 103) + ' '  + convert(VARCHAR(8), GETDATE(), 14))
	declare @descripIns nvarchar(max) = 'Semana ' + @currentWeek  + '/' + CONVERT(NVARCHAR(MAX),YEAR(@fIniDatetime)) + ' a Semana ' + @untilWeek + '/' + CONVERT(NVARCHAR(MAX),YEAR(@fFinDatetime)) + ''
	declare @tipoIns nvarchar(max) = @tipo

	--Insertar instantánea
	insert into mes_msm.dbo.DeslizanteInstantaneas (fecha, descripcion, tipo) VALUES (@fechaIns, @descripIns, @tipoIns)
	
	--Obtenemos id de instantánea
	declare @idIns int = (select scope_identity())

	declare @WAMMCU varchar(18) = '8030'
	declare @WADRQJ_min as varchar(max) = @fIniJuliano
	declare @WADRQJ_max as varchar(max) = @fFinJuliano

	declare @consulta varchar(max)
	declare @temp table (defid nvarchar(max), cantidad nvarchar(max), semana nvarchar(max), fecha datetime, linea int)

	set @consulta = '
		SELECT 
			WALITM as defid, 
			WAUORG as cantidad, 
			DATEPART(week,[dbo].[JulianoToGregoriano](WADRQJ)) as semana,
			[dbo].[JulianoToGregorianoDatetime](WADRQJ) as fecha,
			WALNID as linea
		FROM OPENQUERY(JDE,
		''
			SELECT 
				WADOCO,
				WADRQJ,
				WALITM,
				WAUORG,
				WALNID,
				WAUOM,
				WAMMCU
			FROM PRODDTA.F4801
			WHERE
				WAVR01 = ''''' + 'MANUGIS' + '''''
				AND WADCTO = ''''' + 'WO' + '''''
				AND WAMMCU = ''''' + @WAMMCU + '''''
				AND WADRQJ <= ''''' + @WADRQJ_max + '''''
				AND WADRQJ >= ''''' + @WADRQJ_min + '''''
				AND WASRST = ''''' + '10' + '''''
				AND (WAUOM = ''''' + 'PL' + ''''' 
					OR WAUOM = ''''' + 'MD' + ''''') 
		''
		)
		'

		insert into @temp
		exec (@consulta)

		--Insertamos los datos con la instantánea creada
		insert into mes_msm.dbo.DeslizanteDatos (idIns, defid, cantidad, semana, fecha, linea, item)
		select @idIns, tmp.defid, tmp.cantidad, tmp.semana, tmp.fecha, tmp.linea,
		(
			select CONVERT(nvarchar(max),prop.pvalue)
			from sitmesdb.dbo.MMwDefVerPrpVals prop
			where prop.defid = tmp.defid  
				and prop.propertyid = 'Gama'
		) as item 
		from @temp tmp
END

GO
/****** Object:  StoredProcedure [dbo].[PRE_OrdenesPlanificadasManugistics]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[PRE_OrdenesPlanificadasManugistics]
@WAMMCU varchar(18),
@WADRQJ_min varchar(18),
@WADRQJ_max varchar(18)

AS

BEGIN
DECLARE @consulta VARCHAR(8000)
SET @consulta = '
		SELECT WADOCO,WADRQJ,WALITM,WAUORG,WAUOM,WAMMCU,DATEPART(week,[dbo].[JulianoToGregoriano](WADRQJ))+1 as Semana--,[dbo].[GetMostoFromEnvasado](SUBSTRING(dbo.[GetPackingArticleFromJDE](WALITM),0,CHARINDEX(''-'',dbo.[GetPackingArticleFromJDE](WALITM))),''M.F.  A. DENS.%'')  CzaAenv
		FROM OPENQUERY(JDE,
		''
		SELECT 
		WADOCO,
		WADRQJ,
		WALITM,
		WAUORG,
		WAUOM,
		WAMMCU
		FROM PRODDTA.F4801
		WHERE
		WAVR01 = ''''' + 'MANUGIS' + '''''
		AND WADCTO = ''''' + 'WO' + '''''
		AND WAMMCU = ''''' + @WAMMCU + '''''
		AND WADRQJ <= ''''' + @WADRQJ_max + '''''
		AND WADRQJ >= ''''' + @WADRQJ_min + '''''
		AND WASRST = ''''' + '10' + '''''
		AND (WAUOM = ''''' + 'PL' + ''''' 
		OR WAUOM = ''''' + 'MD' + ''''') 
		'')'
		exec (@consulta)
		--print @consulta
END


GO
/****** Object:  StoredProcedure [dbo].[PRE_OrdenesPlanificadasManugisticsV2]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[PRE_OrdenesPlanificadasManugisticsV2]
@WAMMCU varchar(18),
@WADRQJ_min varchar(18),
@WADRQJ_max varchar(18)

AS

BEGIN
DECLARE @consulta VARCHAR(8000)
SET @consulta = '
		SELECT WADOCO,WADRQJ,WALITM,WAUORG,WAUOM,WAMMCU,DATEPART(week,[dbo].[JulianoToGregoriano](WADRQJ))+1 as Semana--,[dbo].[GetMostoFromEnvasado](SUBSTRING(dbo.[GetPackingArticleFromJDE](WALITM),0,CHARINDEX(''-'',dbo.[GetPackingArticleFromJDE](WALITM))),''M.F.  A. DENS.%'')  CzaAenv
		,[dbo].[JulianoToGregorianoDatetime](WADRQJ) AS Fecha
		FROM OPENQUERY(JDE,
		''
		SELECT 
		WADOCO,
		WADRQJ,
		WALITM,
		WAUORG,
		WAUOM,
		WAMMCU
		FROM PRODDTA.F4801
		WHERE
		WAVR01 = ''''' + 'MANUGIS' + '''''
		AND WADCTO = ''''' + 'WO' + '''''
		AND WAMMCU = ''''' + @WAMMCU + '''''
		AND WADRQJ <= ''''' + @WADRQJ_max + '''''
		AND WADRQJ >= ''''' + @WADRQJ_min + '''''
		AND WASRST = ''''' + '10' + '''''
		AND (WAUOM = ''''' + 'PL' + ''''' 
		OR WAUOM = ''''' + 'MD' + ''''') 
		'')'
		exec (@consulta)
		--print @consulta
END

GO
/****** Object:  StoredProcedure [dbo].[PRE_OrdenesPlanificadasManugisticsV3]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[PRE_OrdenesPlanificadasManugisticsV3]
@WAMMCU varchar(18),
@WADRQJ_min varchar(18),
@WADRQJ_max varchar(18)

AS

BEGIN
DECLARE @consulta VARCHAR(8000)
SET @consulta = '
		SELECT WADOCO,WADRQJ,WALITM,WAUORG,WAUOM,WAMMCU,DATEPART(week,[dbo].[JulianoToGregoriano](WADRQJ))+1 as Semana--,[dbo].[GetMostoFromEnvasado](SUBSTRING(dbo.[GetPackingArticleFromJDE](WALITM),0,CHARINDEX(''-'',dbo.[GetPackingArticleFromJDE](WALITM))),''M.F.  A. DENS.%'')  CzaAenv
		,[dbo].[JulianoToGregorianoDatetime](WADRQJ) AS Fecha, WALNID as Linea
		FROM OPENQUERY(JDE,
		''
		SELECT 
		WADOCO,
		WADRQJ,
		WALITM,
		WAUORG,
		WALNID,
		WAUOM,
		WAMMCU
		FROM PRODDTA.F4801
		WHERE
		WAVR01 = ''''' + 'MANUGIS' + '''''
		AND WADCTO = ''''' + 'WO' + '''''
		AND WAMMCU = ''''' + @WAMMCU + '''''
		AND WADRQJ <= ''''' + @WADRQJ_max + '''''
		AND WADRQJ >= ''''' + @WADRQJ_min + '''''
		AND WASRST = ''''' + '10' + '''''
		AND (WAUOM = ''''' + 'PL' + ''''' 
		OR WAUOM = ''''' + 'MD' + ''''') 
		'')'
		exec (@consulta)
		--print @consulta
END

GO
/****** Object:  StoredProcedure [dbo].[SIT_ExecuteJobMESJDE]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO










-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
create PROCEDURE [dbo].[SIT_ExecuteJobMESJDE]
	-- Add the parameters for the stored procedure here
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	EXEC msdb.dbo.sp_start_job 'Test'
	--EXEC msdb.dbo.sp_start_job 'MesPreactor'


END





GO
/****** Object:  UserDefinedFunction [dbo].[BrewingPlanningPreparation]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[BrewingPlanningPreparation]()
RETURNS [nvarchar](max) WITH EXECUTE AS CALLER
AS 
EXTERNAL NAME [DatabaseMSM].[UserDefinedFunctions].[BrewingPlanningPreparation]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_ConvertLocalToUtc]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertLocalToUtc](@LocalDate [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertLocalToUtc]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_ConvertStringToDate]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertStringToDate](@DateString [nvarchar](40))
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertStringToDate]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_ConvertUtcToLocal]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertUtcToLocal](@UtcDate [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertUtcToLocal]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_IsDaylightSaving]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_IsDaylightSaving](@LocalDate [datetime])
RETURNS [bit] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[IsDaylightSaving]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_IsLeapYear]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_IsLeapYear](@LocalDate [datetime])
RETURNS [bit] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[IsLeapYear]
GO
/****** Object:  UserDefinedFunction [dbo].[contarEquipos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[contarEquipos] 
(
	@equipoConstructivoID int,
	@turnoIni int,
	@turnoFin int,
	@linea varchar(100)
)
RETURNS INT
AS
BEGIN
declare @fechaIni as datetime = (Select InicioTurno From Turnos where [ID_Ordenado_Turno]=@turnoIni and Linea = @linea)
declare @fechaFin as datetime = (Select FinTurno From Turnos where [ID_Ordenado_Turno]=@turnoFin and Linea = @linea)

declare @count as int = 0

select @count = count(*) from ParosPerdidas
INNER JOIN Lineas L ON L.Id = @linea
 where EquipoConstructivoId = @equipoConstructivoID AND INICIO BETWEEN @fechaIni AND @fechaFin and IdLinea = L.NumeroLinea

return @count

END



GO
/****** Object:  UserDefinedFunction [dbo].[convertUnits]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[convertUnits] 
(
	@UnitsName NVARCHAR(32)
)
RETURNS INT
AS
BEGIN
	DECLARE @Value INT;
	IF(@UnitsName = 'MI')
	BEGIN
		 SET @Value = 1000
	END
	ELSE
	BEGIN
		SET @Value = 1
	END

	RETURN @VALUE
END

GO
/****** Object:  UserDefinedFunction [dbo].[ExistsItemInFiltrationPO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[ExistsItemInFiltrationPO]
(@POId nvarchar(max),@item nvarchar(max))
RETURNS nvarchar(max)
AS
BEGIN
	declare @value nvarchar(max)

	 if (SELECT ItemId FROM ItemsInActiveFiltration WHERE FiltrationId=@POId AND ItemId=@item) Is Null
	 Begin
		set @value='false'
	 End
	 else
	 Begin
		set @value='true'
	 end

	RETURN @value
END

GO
/****** Object:  UserDefinedFunction [dbo].[f_get_att_rev]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[f_get_att_rev]
(
   -- Input parameters
   @asPartNo nvarchar(20),
   @anRevision numeric(8)
)
RETURNS numeric(8) -- Returned value
   ---------------------------------------------------------------------------
   -- $Workfile: F_GET_ATT_REV.sql [F_GET_ATT_REV] $
   --     Type:  Function script
   ----------------------------------------------------------------------------
   --   $Author: evoline $
   -- $Revision: 1 $
   --  $Modtime: 19.04.2010 $
   --   Project: speCX development
   ----------------------------------------------------------------------------
   --  Abstract: Returns the current revision of a given specification if the
   --            revision was 0. Else the function returns the revision.
   ----------------------------------------------------------------------------
   --  Elements: asPartNo (IN) a string which defines the part
   --            anRevision (IN) a number which defines the revision
   ----------------------------------------------------------------------------
   --    Return: a number containing the revision
   ----------------------------------------------------------------------------
 BEGIN
    DECLARE @lnRevision NUMERIC (8,0)
    
	--SELECT @lnRevision = MAX(Revision) FROM INTERSPEC.MSMIS.INTERSPC.ItSh where PartNo = @asPartNo 
	--SELECT @lnRevision = MAX(Revision) FROM INTERSPEC.MSMIS.INTERSPC.ItSpProperty where PartNo = @asPartNo
    IF @anRevision = 0 OR @anRevision IS NULL 
       BEGIN
          SELECT @lnRevision  = MAX(sh.Revision)
           FROM INTERSPEC.MSMIS.INTERSPC.ItSh sh INNER JOIN INTERSPEC.MSMIS.INTERSPC.ItSs s 
           ON s.Status = sh.Status
           WHERE sh.PartNo = @asPartNo
             AND s.StatusType = 'CURRENT'

          IF @lnRevision = 0 OR @lnRevision IS NULL
             SELECT @lnRevision = MAX(Revision) 
             FROM INTERSPEC.MSMIS.INTERSPC.ItSh
             WHERE PartNo = @asPartNo 

          RETURN @lnRevision
       END
    ELSE
       RETURN @lnRevision
       
   RETURN 0       
END




GO
/****** Object:  UserDefinedFunction [dbo].[fnFormatDate]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[fnFormatDate] (@Datetime DATETIME, @FormatMask VARCHAR(32))
RETURNS VARCHAR(32)
AS
BEGIN
    DECLARE @StringDate VARCHAR(32)
    SET @StringDate = @FormatMask
    IF (CHARINDEX ('YYYY',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'YYYY',
                         DATENAME(YY, @Datetime))
    IF (CHARINDEX ('YY',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'YY',
                         RIGHT(DATENAME(YY, @Datetime),2))
    IF (CHARINDEX ('Month',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'Month',
                         DATENAME(MM, @Datetime))
    IF (CHARINDEX ('MON',@StringDate COLLATE SQL_Latin1_General_CP1_CS_AS)>0)
       SET @StringDate = REPLACE(@StringDate, 'MON',
                         LEFT(UPPER(DATENAME(MM, @Datetime)),3))
    IF (CHARINDEX ('Mon',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'Mon',
                                     LEFT(DATENAME(MM, @Datetime),3))
    IF (CHARINDEX ('MM',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'MM',
                  RIGHT('0'+CONVERT(VARCHAR,DATEPART(MM, @Datetime)),2))
    IF (CHARINDEX ('M',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'M',
                         CONVERT(VARCHAR,DATEPART(MM, @Datetime)))
    IF (CHARINDEX ('DD',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'DD',
                         RIGHT('0'+DATENAME(DD, @Datetime),2))
    IF (CHARINDEX ('D',@StringDate) > 0)
       SET @StringDate = REPLACE(@StringDate, 'D',
                                     DATENAME(DD, @Datetime))   
	IF (CHARINDEX ('H',@StringDate) > 0)
		IF (DATEPART(HOUR, @Datetime))<10
			SET @StringDate = REPLACE(@StringDate, 'H', '0'+CONVERT(VARCHAR,DATEPART(HOUR, @Datetime))) 
		ELSE
		  SET @StringDate = REPLACE(@StringDate, 'H', CONVERT(VARCHAR,DATEPART(HOUR, @Datetime))) 
RETURN @StringDate
END

GO
/****** Object:  UserDefinedFunction [dbo].[getAntesTurnoID]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getAntesTurnoID] 
(
	@fecha bigint,
	@tipoturno int,
	@linea varchar(100)
)
RETURNS INT
AS
BEGIN
DECLARE @VALUE AS INT
IF EXISTS (SELECT ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno and Linea = @linea)
SELECT @VALUE = ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno and Linea = @linea
ELSE
BEGIN
SELECT  TOP 1 @VALUE = ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) < @fecha and Linea = @linea order by Fecha, IdTipoTurno desc
END
	RETURN @VALUE
END

GO
/****** Object:  UserDefinedFunction [dbo].[getAntesTurnoInicio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getAntesTurnoInicio] 
(
	@fecha bigint,
	@tipoturno int
)
RETURNS DateTime
AS
BEGIN
DECLARE @VALUE AS DateTime
IF EXISTS (SELECT InicioTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno)
SELECT @VALUE = InicioTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno
ELSE
BEGIN
SELECT  TOP 1 @VALUE = InicioTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) < @fecha order by InicioTurno  desc
END
	RETURN @VALUE
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDespuesTurnoFin]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDespuesTurnoFin] 
(
	@fecha bigint,
	@tipoturno int
)
RETURNS DateTime
AS
BEGIN
DECLARE @VALUE AS DateTime
IF EXISTS (SELECT FinTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno)
SELECT distinct @VALUE =FinTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturnO
ELSE
BEGIN
SELECT  TOP 1 @VALUE = FinTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) > @fecha order by Fecha, IdTipoTurno asc
END
	RETURN @VALUE
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDespuesTurnoID]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDespuesTurnoID] 
(
	@fecha bigint,
	@tipoturno int,
	@linea varchar(100)
)
RETURNS INT
AS
BEGIN
DECLARE @VALUE AS INT
IF EXISTS (SELECT ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno and Linea = @linea)
SELECT @VALUE =ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno and Linea = @linea
ELSE
BEGIN
SELECT  TOP 1 @VALUE = ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) > @fecha and Linea = @linea order by Fecha, IdTipoTurno asc
END
	RETURN @VALUE
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDiaTurnoByDateV2]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDiaTurnoByDateV2]
(
	-- Add the parameters for the function here
	@fechaUTC as datetime,
	@iniM as integer
)
RETURNS date
AS
BEGIN
	
	declare @horaLocal as int
	declare @fechaLocal datetime 
	set @fechaLocal= dbo.CLR_DATETIME_ConvertUTCtoLocal(@fechaUTC)
	select @horaLocal = DATEPART(hour, @fechaLocal)

	if(@horaLocal >= 0  and @horaLocal < @iniM) 
		return cast(dateadd(day, -1, @fechaLocal) as date)
	return cast(@fechaUTC as date)
	
END

GO
/****** Object:  UserDefinedFunction [dbo].[getFechaTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- 
CREATE FUNCTION [dbo].[getFechaTurno]
(
	-- Add the parameters for the function here
	@Fecha date,
	@Linea varchar(100),
	@Tipo varchar(3),
	@Turno varchar(20)
)
RETURNS datetime
AS
BEGIN
	declare @idTipoTurno int
	declare @FechaInicio datetime
	declare @FechaFin datetime

	declare @FechaDevolver datetime

	SELECT @idTipoTurno = ISNULL(Id,0)
	FROM [MES_MSM].[dbo].[TiposTurno]
	WHERE Nombre = @Turno



Select @FechaInicio = [InicioTurno], @Fechafin = [FinTurno]
From Turnos
Where Linea = @Linea and idTipoTurno = @IdTipoTurno and convert(date, Fecha)=@Fecha

IF @Tipo ='Ini'
BEGIN
set @FechaDevolver =  @FechaInicio
END
ELSE
BEGIN
set @FechaDevolver = @Fechafin
END

return @FechaDevolver
END

GO
/****** Object:  UserDefinedFunction [dbo].[GetFieldsCOB]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Function [dbo].[GetFieldsCOB](@tempCompleteName nvarchar(max))
returns nvarchar(max)
begin
	declare @fields nvarchar(max)
	set @fields = ''''

	SELECT @fields = @fields + 'REPLACE(REPLACE('+COLUMN_NAME+',CHAR(10),''''''''),CHAR(13),'''''''') as '+ COLUMN_NAME + ','
	FROM SITMesDb.INFORMATION_SCHEMA.COLUMNS SIT			
	WHERE TABLE_CATALOG = 'sitMesDb' and TABLE_NAME = @tempCompleteName and COLUMN_NAME NOT LIKE '$%'

	set @fields = SubString(@fields,0,Len(@fields));
	return @fields
end
GO
/****** Object:  UserDefinedFunction [dbo].[getFinTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getFinTurno] 
(
	@fecha bigint,
	@tipoturno int
)
RETURNS datetime
AS
BEGIN
DECLARE @VALUE AS datetime

SELECT @VALUE = FinTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',dbo.ToLocalDateTime(CONVERT(DATE,Fecha))) = @fecha  AND IdTipoTurno= @tipoturno

RETURN @VALUE

END

GO
/****** Object:  UserDefinedFunction [dbo].[GetFormatoHoraMinutosSegundos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[GetFormatoHoraMinutosSegundos] 
(
	-- Add the parameters for the function here
	@Numero decimal
)
RETURNS VARCHAR(30)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @Hora VARCHAR(30)
	DECLARE @NumInt int 

	SET @NumInt = CONVERT(int,@Numero)
	

	SELECT @Hora = RIGHT('0' + CAST(@NumInt / 3600 AS VARCHAR),2) + ':' +
					  RIGHT('0' + CAST((@NumInt / 60) % 60 AS VARCHAR),2) + ':' +
					  RIGHT('0' + CAST(@NumInt % 60 AS VARCHAR),2) 

	RETURN @Hora
END

GO
/****** Object:  UserDefinedFunction [dbo].[GetHectolitrosProducto]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[GetHectolitrosProducto]
(
	-- Add the parameters for the function here
	@producto nvarchar(20)
)
RETURNS numeric(16,6)
AS
BEGIN
	DECLARE @HL as numeric(16,6);

	WITH ItemMaterials (PartNo,ComponentPartNo, UomName, Quantity)
	AS
	(
		SELECT PartNo,ComponentPartNo, UomName, Quantity
		FROM INTERSPEC.[MSMIS].[INTERSPC].[ItBomItem]
		WHERE PartNo = @producto AND Revision = dbo.f_get_att_rev(PartNo,null)
		UNION ALL
		SELECT itb.PartNo, itb.ComponentPartNo, itb.UomName, itb.Quantity
		FROM INTERSPEC.[MSMIS].[INTERSPC].[ItBomItem] itb
		INNER JOIN ItemMaterials p on p.ComponentPartNo = itb.PartNo
		WHERE Revision = dbo.f_get_att_rev(itb.PartNo,null)
	)

	select @HL = COALESCE(Quantity, 0) from ItemMaterials
	where LOWER(UomName) = 'hl'
	
	RETURN @HL
END
GO
/****** Object:  UserDefinedFunction [dbo].[getIdTipoTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getIdTipoTurno]
(
	-- Add the parameters for the function here
	@Turno varchar(20)
)
RETURNS int
AS
BEGIN
	declare @idTipoTurno int

	SELECT @idTipoTurno = ISNULL(Id,0)
	FROM [MES_MSM].[dbo].[TiposTurno]
	WHERE Nombre = @Turno

	return @idTipoTurno

END
GO
/****** Object:  UserDefinedFunction [dbo].[getInicioTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getInicioTurno] 
(
	@fecha bigint,
	@tipoturno int
)
RETURNS datetime
AS
BEGIN
DECLARE @VALUE AS datetime

SELECT @VALUE = InicioTurno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',dbo.ToLocalDateTime(CONVERT(DATE,Fecha))) = @fecha  AND IdTipoTurno= @tipoturno

RETURN @VALUE

END

GO
/****** Object:  UserDefinedFunction [dbo].[GetItemsInActiveFiltrationMaxId]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetItemsInActiveFiltrationMaxId]()
RETURNS Bigint
AS
BEGIN
	declare @value as bigint
	SELECT @value=Coalesce(max(id),0) FROM ItemsInActiveFiltration
	RETURN @value
END

GO
/****** Object:  UserDefinedFunction [dbo].[GetMostoFromEnvasado]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE function[dbo].[GetMostoFromEnvasado](@CodArticle nvarchar(max),@Condition nvarchar(max))
returns nvarchar(max)
as
BEGIN
	Declare @article nvarchar(max)
	Declare @description nvarchar(max) 
	Declare @envasada nvarchar(max)
	Declare @Cont int
	Declare @aux nvarchar(max)

	set @aux = ''
	Declare c cursor for
		SELECT Distinct Bom.DefID,article.Descript,
		CASE WHEN article.Descript like @Condition THEN 'True' ELSE 'False' END Envasado
		FROM (SELECT distinct opBom.BomAltDefID,opBom.DefID
			  FROM [SITMESDB_FAB].[SITMesDB].dbo.[MTMV2_BOM_ITM_ALT] opBom 
			  WHERE opBom.BomAltDefID = @CodArticle) Bom
		LEFT JOIN [SITMESDB_FAB].[SITMesDB].dbo.[MTMV2_B_DEF] article on article.DefID=Bom.DefID		 
	open c
	fetch from c into  @article,@description,@envasada 
	WHILE @@FETCH_STATUS = 0 
	begin
		IF (SELECT distinct count(opBom.BomAltDefID)
			FROM [SITMESDB_FAB].[SITMesDB].dbo.[MTMV2_BOM_ITM_ALT] opBom 
			WHERE opBom.BomAltDefID = @article) = 0
		BEGIN
			fetch from c into  @article,@description,@envasada
			Continue
		END

		IF @envasada NOT LIKE 'True'
		BEGIN			
			select @aux = [dbo].[GetMostoFromEnvasado](@article,@Condition)
			if @aux <> '' 
			begin
				return @aux
			end
		END
		ELSE
		BEGIN
			set @aux = @article +'-'+@description
			Break			
		END
		fetch from c into  @article,@description,@envasada		
	end
	close c
	deallocate c	
	return @aux	
END




GO
/****** Object:  UserDefinedFunction [dbo].[GetNameBeer]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetNameBeer](@material as nvarchar(max))
returns nvarchar(max)
begin
Declare @result as nvarchar(max)
	IF PATINDEX('%DENS.%',@material) = 0 	
	BEGIN 
		IF CHARINDEX(' ',SubString(@material,PATINDEX('%D.%',@material)+3,Len(@material))) <> 0 
		BEGIN
			set @result = SubString(SubString(@material,PATINDEX('%D.%',@material)+3,Len(@material)),0,CHARINDEX(' ',SubString(@material,PATINDEX('%D.%',@material)+3,Len(@material)))) 
		END
		ELSE
		BEGIN
			set @result = SubString(@material,PATINDEX('%D.%',@material)+3,Len(@material))
		END
	END
	ELSE
	BEGIN 
		IF CHARINDEX(' ',SubString(@material,PATINDEX('%DENS.%',@material)+6,Len(@material))) <> 0 
		BEGIN
			set @result = SubString(SubString(@material,PATINDEX('%DENS.%',@material)+6,Len(@material)),0,CHARINDEX(' ',SubString(@material,PATINDEX('%DENS.%',@material)+6,Len(@material)))) 			
		END
		ELSE
		BEGIN
			set @result = SubString(@material,PATINDEX('%DENS.%',@material)+6,Len(@material))
		END
	 END

return @result
end



GO
/****** Object:  UserDefinedFunction [dbo].[GetNumParticionesOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[GetNumParticionesOrden]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS INT
AS
BEGIN
	DECLARE @NumPart as INT;

	SELECT @NumPart = COUNT(IdOrdenPadre)
	FROM [MES_MSM].[dbo].Particiones 
	WHERE IdOrdenPadre = @id_wo
		
	RETURN @NumPart
END
GO
/****** Object:  UserDefinedFunction [dbo].[GetPackingArticleFromJDE]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE function[dbo].[GetPackingArticleFromJDE](@CodArticle nvarchar(max))
returns nvarchar(max)
as
BEGIN
	Declare @article nvarchar(max)
	Declare @description nvarchar(max) 
	Declare @envasada nvarchar(max)
	Declare @Cont int
	Declare @aux nvarchar(max)

	Declare c cursor for
		SELECT Distinct Bom.ComponentPartNo,article.Description,
		CASE WHEN article.Description like 'CZA. A ENV.%' THEN 'True' ELSE 'False' END Envasado
		FROM (SELECT distinct opBom.PartNo,opBom.ComponentPartNo
			  FROM [INTERSPEC].[MSMIS].[INTERSPC].[ItBomItem] opBom 
			  WHERE opBom.PartNo = @CodArticle
			  Collate SQL_Latin1_General_CP1_CS_AS ) Bom
		LEFT JOIN [INTERSPEC].[MSMIS].[INTERSPC].ItSh article on article.PartNo=Bom.ComponentPartNo
		collate SQL_Latin1_General_CP1_CS_AS 
	open c
	fetch from c into  @article,@description,@envasada 
	WHILE @@FETCH_STATUS = 0 
	begin
		IF (SELECT distinct count(opBom.PartNo) 
			FROM [INTERSPEC].[MSMIS].[INTERSPC].[ItBomItem] opBom 
			WHERE opBom.PartNo = @article
			Collate SQL_Latin1_General_CP1_CS_AS) = 0
		BEGIN
			fetch from c into  @article,@description,@envasada
			Continue
		END

		IF @envasada NOT LIKE 'True'
		BEGIN
			return [dbo].[GetPackingArticleFromJDE](@article)			
		END
		ELSE
		BEGIN			
			Break
		END

		fetch from c into  @article,@description,@envasada		
	end
	close c
	deallocate c	
	return @article +'-'+ @description +'-'+@CodArticle
END




GO
/****** Object:  UserDefinedFunction [dbo].[GetPkParametroMaterial]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[GetPkParametroMaterial]
(
	-- Add the parameters for the function here
	@nomParam nvarchar(20)
)
RETURNS int
AS
BEGIN
	DECLARE @pk as int = -1;

	SELECT @pk = PropertyPK
		FROM [SITMesDB].[dbo].[MMProperties]
		WHERE PropertyID = @nomParam
	--IF @nomParam  = 'Gama' 
	--	SET @pk = 12
	--ELSE IF @nomParam  = 'Marca' 
	--	SET @pk = 8
	--ELSE IF @nomParam  = 'Tipo_Envase' 
	--	SET @pk = 10

	--SELECT DISTINCT @pk = DefVerPK FROM SITMesDB.dbo.MMvDefVerPrpVals
	--WHERE PropertyID = @nomParam
	RETURN @pk

END

GO
/****** Object:  UserDefinedFunction [dbo].[getTurnoByHourv2]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getTurnoByHourv2]
(
	-- Add the parameters for the function here
	@fechaRegistro as datetime,
	@iniM as integer,
	@iniT as integer,
	@iniN as integer
)
RETURNS int
AS
BEGIN
	declare @horaLoc int
	set @horaLoc = datepart(hour, dbo.CLR_DATETIME_ConvertUTCtoLocal(@fechaRegistro))
	if(@horaLoc >= @iniM and @horaLoc < @iniT) 
		return 1
	if(@horaLoc >= @iniT and @horaLoc < @iniN) 
		return 2
	return 3
	
END

GO
/****** Object:  UserDefinedFunction [dbo].[getTurnoID]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[getTurnoID] 
(
	@fecha bigint,
	@tipoturno int
)
RETURNS INT
AS
BEGIN
DECLARE @VALUE AS INT
IF EXISTS (SELECT ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno)
SELECT @VALUE =ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) = @fecha  AND IdTipoTurno= @tipoturno
ELSE
BEGIN
SELECT  TOP 1 @VALUE = ID_Ordenado_Turno FROM Turnos WHERE DATEDIFF(SECOND,'19700101',CONVERT(DATE,Fecha)) > @fecha order by Fecha, IdTipoTurno asc
END
	RETURN @VALUE
END
GO
/****** Object:  UserDefinedFunction [dbo].[GregorianoToJuliano]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GregorianoToJuliano] 
(
	-- Add the parameters for the function here
	-- INFORMACIÓN: a partir del día Gregoriano devuelva el día Juliano
	@Gregoriano as datetime
)
RETURNS int
AS
BEGIN
	
	RETURN CONVERT(VARCHAR, datepart(yy,@Gregoriano)-1900) + CASE WHEN datepart(dy,@Gregoriano) < 10 THEN CONVERT(VARCHAR , 0) + CONVERT(VARCHAR , 0) + CONVERT(VARCHAR , datepart(dy,@Gregoriano)) WHEN datepart(dy,@Gregoriano) < 100 and datepart(dy,@Gregoriano) > 9 THEN CONVERT(VARCHAR , 0) + CONVERT(VARCHAR , datepart(dy,@Gregoriano)) ELSE CONVERT(VARCHAR , datepart(dy,@Gregoriano)) END

END

GO
/****** Object:  UserDefinedFunction [dbo].[JDE_ObtenerNuevoCodigo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[JDE_ObtenerNuevoCodigo]
(
	-- Add the parameters for the function here
	@codPlanta int
)
RETURNS int
AS
BEGIN
	

	DECLARE @pkEquipoPlanta as int;
	DECLARE @codSiguiente as int;
	DECLARE @inicioCodigos as int;
	DECLARE @finCodigos as int;

	select  @pkEquipoPlanta =  equip_pk
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'ID_PLANTA_JDE' and [equip_prpty_value] = @codPlanta;

	select  @inicioCodigos =  equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'RANGO_MIN_WO_JDE' and equip_pk = @pkEquipoPlanta;

	select  @finCodigos =  equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'RANGO_MAX_WO_JDE' and equip_pk = @pkEquipoPlanta;

	select  @codSiguiente = isnull(MAX(CAST(Parametros.VAL as int))+1,@inicioCodigos)  FROM SITMesDB.dbo.pomv_ordr Ordenes
	left join SITMesDB.dbo.POMV_ORDR_PRP Parametros 
	on Ordenes.pom_order_id = Parametros.pom_order_id and Parametros.pom_custom_fld_name = 'CODIGO_JDE'
	WHERE Parametros.VAL > @inicioCodigos and Parametros.VAL > @finCodigos;

	return isnull(@codSiguiente,-1);

END


GO
/****** Object:  UserDefinedFunction [dbo].[JDE_ObtenerNuevoCodigo2]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[JDE_ObtenerNuevoCodigo2]
(
	@planta as nvarchar(50)
)
RETURNS 
@datos TABLE 
(
	-- Add the column definitions for the TABLE variable here
	codPlanta int, 
	codOrden int
)
AS
BEGIN
	-- Fill the table variable with the rows for your result set
	DECLARE @codPlanta as int;
	DECLARE @codSiguiente as int;
	DECLARE @inicioCodigos as int;
	DECLARE @finCodigos as int;

	--select  @codPlanta =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'ID_PLANTA_JDE';

	--select  @inicioCodigos =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'RANGO_MIN_WO_JDE';

	--select  @finCodigos =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'RANGO_MAX_WO_JDE';

	SELECT 
		@codPlanta = bep.equip_prpty_value,  
		@inicioCodigos = RangoMin.equip_prpty_value, 
		@finCodigos = RangoMax.equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] bep
	INNER JOIN SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] RangoMin ON RangoMin.equip_pk = bep.equip_pk
	INNER JOIN SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] RangoMax ON RangoMax.equip_pk = bep.equip_pk
	WHERE bep.[equip_prpty_value] = @planta AND bep.[equip_prpty_id] = 'ID_PLANTA_JDE' AND RangoMin.[equip_prpty_id] = 'RANGO_MIN_WO_JDE' AND RangoMax.[equip_prpty_id] = 'RANGO_MAX_WO_JDE'
	
	--SELECT  
	--	@codSiguiente = isnull(MAX(CAST(Parametros.VAL as int))+1,@inicioCodigos)  
	--FROM SITMesDB.dbo.pomv_ordr Ordenes
	--LEFT JOIN SITMesDB.dbo.POMV_ORDR_PRP Parametros ON Ordenes.pom_order_id = Parametros.pom_order_id and Parametros.pom_custom_fld_name = 'CODIGO_JDE'
	--WHERE Parametros.VAL > @inicioCodigos;

	SELECT 
		@codSiguiente = ISNULL(MAX(CAST(NUM_WO_JDE AS INT))+1,@inicioCodigos)
	FROM [dbo].[COB_MSM_WO_JDE]
	WHERE NUM_WO_JDE >= @inicioCodigos AND PLANTA = @codPlanta;


	IF @codSiguiente < @finCodigos 
		INSERT INTO @datos(codPlanta,CodOrden) VALUES(@codPlanta,@codSiguiente);
	ELSE
		INSERT INTO @datos(codPlanta,CodOrden) VALUES(@codPlanta,-1);
	RETURN 
END

GO
/****** Object:  UserDefinedFunction [dbo].[JDE_ObtenerNuevoCodigo3]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[JDE_ObtenerNuevoCodigo3]
(
	-- Add the parameters for the function here
	@codBase varchar(50)
)
RETURNS varchar
AS
BEGIN
	-- Declare the return variable here
	DECLARE @codigo varchar;

	SELECT @codigo = (SELECT TOP 1 REPLACE(pom_order_id,@codBase,'') FROM SITMesDB.dbo.POM_ORDER 
	WHERE pom_order_id like @codBase + '%' and  pom_order_id not like @codBase + '%.%'
	ORDER BY cast(REPLACE(pom_order_id,@codBase,'')as int) desc);


	RETURN @codigo + 1

END


GO
/****** Object:  UserDefinedFunction [dbo].[JDE_ObtenerNuevoCodigo4]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[JDE_ObtenerNuevoCodigo4]
(
	@codPlanta as int
)
RETURNS 
@datos TABLE 
(
	-- Add the column definitions for the TABLE variable here
	codPlanta int, 
	codOrden int
)
AS
BEGIN
	-- Fill the table variable with the rows for your result set
	DECLARE @codigoPlanta as int;
	DECLARE @codSiguiente as int;
	DECLARE @inicioCodigos as int;
	DECLARE @finCodigos as int;

	select  @codPlanta =  equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'ID_PLANTA_JDE';

	select  @inicioCodigos =  equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'RANGO_MIN_WO_JDE';

	select  @finCodigos =  equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	where [equip_prpty_id] = 'RANGO_MAX_WO_JDE';

	select  @codSiguiente = isnull(MAX(CAST(Parametros.VAL as int))+1,@inicioCodigos)  FROM SITMesDB.dbo.pomv_ordr Ordenes
	left join SITMesDB.dbo.POMV_ORDR_PRP Parametros 
	on Ordenes.pom_order_id = Parametros.pom_order_id and Parametros.pom_custom_fld_name = 'CODIGO_JDE'
	WHERE Parametros.VAL > @inicioCodigos;

	IF @codSiguiente < @finCodigos 
		insert into @datos(codPlanta,CodOrden) values(@codigoPlanta,@codSiguiente);
	ELSE
		insert into @datos(codPlanta,CodOrden) values(@codigoPlanta,-1);
	RETURN 
END

GO
/****** Object:  UserDefinedFunction [dbo].[JDE_ObtenerNuevoCodigoJDE]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[JDE_ObtenerNuevoCodigoJDE]
(
	@planta as nvarchar(50)
)
RETURNS INT
AS
BEGIN
	-- Fill the table variable with the rows for your result set
	DECLARE @codPlanta as int;
	DECLARE @codSiguiente as int;
	DECLARE @inicioCodigos as int;
	DECLARE @finCodigos as int;

	--select  @codPlanta =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'ID_PLANTA_JDE';

	--select  @inicioCodigos =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'RANGO_MIN_WO_JDE';

	--select  @finCodigos =  equip_prpty_value
	--FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY]
	--where [equip_prpty_id] = 'RANGO_MAX_WO_JDE';

	SELECT 
		@codPlanta = bep.equip_prpty_value,  
		@inicioCodigos = RangoMin.equip_prpty_value, 
		@finCodigos = RangoMax.equip_prpty_value
	FROM SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] bep
	INNER JOIN SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] RangoMin ON RangoMin.equip_pk = bep.equip_pk
	INNER JOIN SitMesDB.dbo.[BPM_EQUIPMENT_PROPERTY] RangoMax ON RangoMax.equip_pk = bep.equip_pk
	WHERE bep.[equip_prpty_value] = @planta AND bep.[equip_prpty_id] = 'ID_PLANTA_JDE' AND RangoMin.[equip_prpty_id] = 'RANGO_MIN_WO_JDE' AND RangoMax.[equip_prpty_id] = 'RANGO_MAX_WO_JDE'
	
	--SELECT  
	--	@codSiguiente = isnull(MAX(CAST(Parametros.VAL as int))+1,@inicioCodigos)  
	--FROM SITMesDB.dbo.pomv_ordr Ordenes
	--LEFT JOIN SITMesDB.dbo.POMV_ORDR_PRP Parametros ON Ordenes.pom_order_id = Parametros.pom_order_id and Parametros.pom_custom_fld_name = 'CODIGO_JDE'
	--WHERE Parametros.VAL > @inicioCodigos;

	SELECT 
		@codSiguiente = ISNULL(MAX(CAST(NUM_WO_JDE AS INT))+1,@inicioCodigos)
	FROM [dbo].[COB_MSM_WO_JDE]
	WHERE NUM_WO_JDE >= @inicioCodigos AND PLANTA = @codPlanta;


	IF @codSiguiente >= @finCodigos 
	BEGIN
		SET @codSiguiente = -1;
	END

	RETURN @codSiguiente
END

GO
/****** Object:  UserDefinedFunction [dbo].[JulianoToGregoriano]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[JulianoToGregoriano] 
(
	-- Add the parameters for the function here
	@Juliano as int
)
RETURNS datetime
AS
BEGIN
	RETURN  DateAdd (d, @Juliano - ((@Juliano / 1000) * 1000), convert(datetime, str((@Juliano / 1000) + 1900 ) + '0101')) - 1 
END
GO
/****** Object:  UserDefinedFunction [dbo].[JulianoToGregorianoDatetime]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[JulianoToGregorianoDatetime] 
(
	-- Add the parameters for the function here
	-- INFORMACIÓN: a partir del día Juliano devuelva la fecha en formato inglés.
	@Juliano as int
)
RETURNS datetime
AS
BEGIN
	
	declare @Año int, @DiasEnAño int, @Gregoriano datetime 
	select @Año = (@Juliano / 1000) + 1900 
	select @DiasEnAño = @Juliano - ((@Juliano / 1000) * 1000) 
	select @Gregoriano = convert(datetime, str(@Año) + '0101') 
	select @Gregoriano = DateAdd (d, @DiasenAño, @Gregoriano) 
	
	RETURN  @Gregoriano - 1

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_ComprobarGapPorFaltaDeRegistros]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_ComprobarGapPorFaltaDeRegistros]
(
	-- Add the parameters for the function here	
	@fIni as DATETIME,
	@fFin as DATETIME,
	@NumLinea as INT,
	@TIEMPO_VACIADO_TREN AS INT,
	@SUPERIOR AS BIT
)
RETURNS BIT
AS
BEGIN

	DECLARE @DURACION_GAP as INT = DATEDIFF(second, @fIni, @fFin);
	DECLARE @DURACION_GREGISTROS as INT;
	DECLARE @CLASE_PAL AS NVARCHAR(20) = 'PALETIZADORA';
	DECLARE @CLASE_LLE AS NVARCHAR(20) = 'LLENADORA';
	DECLARE @ID_MAQUINA AS NVARCHAR(255);
	DECLARE @FECHA_INICIO_PRIMER_REGISTRO AS DATETIME;
	DECLARE @FECHA_FIN_PRIMER_REGISTRO AS DATETIME;
	DECLARE @FECHA_INICIO_ULTIMO_REGISTRO AS DATETIME;
	DECLARE @FECHA_FIN_ULTIMO_REGISTRO AS DATETIME;
	DECLARE @FECHA_INICIO AS DATETIME;
	DECLARE @FECHA_FIN AS DATETIME;
	DECLARE @FaltaDeRegistros AS BIT = 0;

	--PRINT '@fIni: ' + CONVERT(NVARCHAR(MAX), @fIni,25) + ' @fFin: ' + CONVERT(NVARCHAR(MAX), @fFin,25) + '@FaltaDeRegistros: ' + CONVERT(NVARCHAR(MAX), @FaltaDeRegistros);
	--PRINT '---INICIO LLENADORAS ------------------------------------------------------------';
	DECLARE cLLenadorasLinea CURSOR FOR
	SELECT DISTINCT ML.Id
	FROM MaquinasLineas ML
	WHERE ML.NumLinea = @NumLinea and ML.Clase = @CLASE_LLE

	OPEN cLLenadorasLinea

	FETCH cLLenadorasLinea INTO @ID_MAQUINA

	WHILE (@@FETCH_STATUS = 0 )
		BEGIN			
			IF(@FaltaDeRegistros = 0)
			BEGIN
				--PRINT '@ID_MAQUINA: ' + CONVERT(NVARCHAR(MAX), @ID_MAQUINA);
				SELECT TOP(1) @FECHA_INICIO_PRIMER_REGISTRO = COBLLE.FECHA_INICIO, @FECHA_FIN_PRIMER_REGISTRO = COBLLE.FECHA_FIN
				FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
				WHERE COBLLE.ID_MAQUINA = @ID_MAQUINA AND (
				(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
				OR
				( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
				OR
				(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
				)
				ORDER BY COBLLE.FECHA_INICIO ASC
				--PRINT '@FECHA_INICIO_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PRIMER_REGISTRO,25) + ' @FECHA_FIN_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PRIMER_REGISTRO,25);
				SELECT TOP(1) @FECHA_INICIO_ULTIMO_REGISTRO = COBLLE.FECHA_INICIO, @FECHA_FIN_ULTIMO_REGISTRO = COBLLE.FECHA_FIN
				FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
				WHERE COBLLE.ID_MAQUINA = @ID_MAQUINA AND (
				(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
				OR
				( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
				OR
				(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
				)
				ORDER BY COBLLE.FECHA_INICIO DESC
				--PRINT '@FECHA_INICIO_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_ULTIMO_REGISTRO,25) + ' @FECHA_FIN_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_ULTIMO_REGISTRO,25);
				SELECT @FECHA_INICIO = MIN(COBLLE.FECHA_INICIO), @FECHA_FIN = MAX(COBLLE.FECHA_FIN)
				FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
				WHERE COBLLE.ID_MAQUINA = @ID_MAQUINA AND (
				(FECHA_INICIO >= @FECHA_FIN_PRIMER_REGISTRO AND FECHA_FIN <= @FECHA_INICIO_ULTIMO_REGISTRO)
				OR
				( @FECHA_FIN_PRIMER_REGISTRO > FECHA_INICIO AND @FECHA_FIN_PRIMER_REGISTRO < FECHA_FIN)
				OR
				(@FECHA_INICIO_ULTIMO_REGISTRO > FECHA_INICIO AND @FECHA_INICIO_ULTIMO_REGISTRO < FECHA_FIN)
				)
				--PRINT '@FECHA_INICIO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO,25) + ' @FECHA_FIN: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25);
				SET @DURACION_GREGISTROS = DATEDIFF(second, @fIni, @FECHA_FIN_PRIMER_REGISTRO) + DATEDIFF(second, @FECHA_INICIO, @FECHA_FIN) + DATEDIFF(second, @FECHA_INICIO_ULTIMO_REGISTRO, @fFin); 

				IF(@DURACION_GREGISTROS < @DURACION_GAP)
				BEGIN
					--PRINT 'FaltaDeRegistros, comprobamos registros continuos';
					--PRINT '@FECHA_FIN_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PRIMER_REGISTRO,25) + ' @FECHA_INICIO_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @@FECHA_INICIO_ULTIMO_REGISTRO,25) + ' @ID_MAQUINA: ' + CONVERT(NVARCHAR(MAX), @ID_MAQUINA) + ' @SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @SUPERIOR);
					DECLARE @DURACION_REGISTROS_CONTIGUOS AS INT;
					SELECT	@DURACION_REGISTROS_CONTIGUOS = [dbo].[MES_GetDuracionRegistrosContinuos] (@FECHA_FIN_PRIMER_REGISTRO,@FECHA_INICIO_ULTIMO_REGISTRO,@ID_MAQUINA,@SUPERIOR);			
					--PRINT '@DURACION_REGISTROS_CONTIGUOS: ' + CONVERT(NVARCHAR(MAX), @DURACION_REGISTROS_CONTIGUOS);

					IF(@SUPERIOR = 0)
					BEGIN
						SET @DURACION_GREGISTROS = @DURACION_REGISTROS_CONTIGUOS + DATEDIFF(second, @FECHA_INICIO_ULTIMO_REGISTRO, @fFin)
					END
					ELSE
					BEGIN
						SET @DURACION_GREGISTROS = @DURACION_REGISTROS_CONTIGUOS + DATEDIFF(second, @fIni, @FECHA_FIN_PRIMER_REGISTRO)
					END
					--PRINT '@DURACION_GREGISTROS: ' + CONVERT(NVARCHAR(MAX), @DURACION_GREGISTROS) + ' @TIEMPO_VACIADO_TREN: ' + CONVERT(NVARCHAR(MAX), @TIEMPO_VACIADO_TREN * 36000);
					IF(@DURACION_GREGISTROS < (@TIEMPO_VACIADO_TREN * 3600))
					BEGIN
						SET @FaltaDeRegistros = 1;
						--PRINT '@FaltaDeRegistros: ' + CONVERT(NVARCHAR(MAX), @FaltaDeRegistros);
					END
					
					
				END
			END
						
			FETCH cLLenadorasLinea INTO @ID_MAQUINA
		END

	CLOSE cLLenadorasLinea

	DEALLOCATE cLLenadorasLinea
	--PRINT '---FIN LLENADORAS ------------------------------------------------------------';
	IF(@FaltaDeRegistros = 0)
	BEGIN
		SET @FECHA_INICIO_PRIMER_REGISTRO = NULL;
		SET @FECHA_FIN_PRIMER_REGISTRO = NULL;
		SET @FECHA_INICIO_ULTIMO_REGISTRO  = NULL;
		SET @FECHA_FIN_ULTIMO_REGISTRO = NULL;
		SET @FECHA_INICIO = NULL;
		SET @FECHA_FIN = NULL;

		--PRINT '---INICIO PALETERAS ------------------------------------------------------------';

		DECLARE cPaleterasLinea CURSOR FOR
		SELECT DISTINCT ML.Id
		FROM MaquinasLineas ML
		WHERE ML.NumLinea = @NumLinea and ML.Clase = @CLASE_PAL

		OPEN cPaleterasLinea

		FETCH cPaleterasLinea INTO @ID_MAQUINA

		WHILE (@@FETCH_STATUS = 0 )
			BEGIN			
				IF(@FaltaDeRegistros = 0)
				BEGIN
					--PRINT '@ID_MAQUINA: ' + CONVERT(NVARCHAR(MAX), @ID_MAQUINA);
					SELECT TOP(1) @FECHA_INICIO_PRIMER_REGISTRO = COBPAL.FECHA_INICIO, @FECHA_FIN_PRIMER_REGISTRO = COBPAL.FECHA_FIN
					FROM COB_MSM_PROD_RESTO_MAQ_HORA AS COBPAL
					WHERE COBPAL.ID_MAQUINA = @ID_MAQUINA AND (
					(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
					OR
					( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
					OR
					(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
					)
					ORDER BY COBPAL.FECHA_INICIO ASC
					--PRINT '@FECHA_INICIO_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PRIMER_REGISTRO,25) + ' @FECHA_FIN_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PRIMER_REGISTRO,25);
					SELECT TOP(1) @FECHA_INICIO_ULTIMO_REGISTRO = COBPAL.FECHA_INICIO, @FECHA_FIN_ULTIMO_REGISTRO = COBPAL.FECHA_FIN
					FROM COB_MSM_PROD_RESTO_MAQ_HORA AS COBPAL
					WHERE COBPAL.ID_MAQUINA = @ID_MAQUINA AND (
					(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
					OR
					( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
					OR
					(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
					)
					ORDER BY COBPAL.FECHA_INICIO DESC
					--PRINT '@FECHA_INICIO_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_ULTIMO_REGISTRO,25) + ' @FECHA_FIN_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_ULTIMO_REGISTRO,25);
					SELECT @FECHA_INICIO = MIN(COBPAL.FECHA_INICIO), @FECHA_FIN = MAX(COBPAL.FECHA_FIN)
					FROM COB_MSM_PROD_RESTO_MAQ_HORA AS COBPAL
					WHERE COBPAL.ID_MAQUINA = @ID_MAQUINA AND (
					(FECHA_INICIO >= @FECHA_FIN_PRIMER_REGISTRO AND FECHA_FIN <= @FECHA_INICIO_ULTIMO_REGISTRO)
					OR
					( @FECHA_FIN_PRIMER_REGISTRO > FECHA_INICIO AND @FECHA_FIN_PRIMER_REGISTRO < FECHA_FIN)
					OR
					(@FECHA_INICIO_ULTIMO_REGISTRO > FECHA_INICIO AND @FECHA_INICIO_ULTIMO_REGISTRO < FECHA_FIN)
					)
					--PRINT '@FECHA_INICIO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO,25) + ' @FECHA_FIN: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25);
					SET @DURACION_GREGISTROS = DATEDIFF(second, @fIni, @FECHA_FIN_PRIMER_REGISTRO) + DATEDIFF(second, @FECHA_INICIO, @FECHA_FIN) + DATEDIFF(second, @FECHA_INICIO_ULTIMO_REGISTRO, @fFin); 

					IF(@DURACION_GREGISTROS < @DURACION_GAP)
					BEGIN
						--PRINT 'FaltaDeRegistros, comprobamos registros continuos';
						--PRINT '@FECHA_FIN_PRIMER_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PRIMER_REGISTRO,25) + ' @FECHA_INICIO_ULTIMO_REGISTRO: ' + CONVERT(NVARCHAR(MAX), @@FECHA_INICIO_ULTIMO_REGISTRO,25) + ' @ID_MAQUINA: ' + CONVERT(NVARCHAR(MAX), @ID_MAQUINA) + ' @SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @SUPERIOR);
						SELECT	@DURACION_REGISTROS_CONTIGUOS = [dbo].[MES_GetDuracionRegistrosContinuos] (@FECHA_FIN_PRIMER_REGISTRO,@FECHA_INICIO_ULTIMO_REGISTRO,@ID_MAQUINA,@SUPERIOR);			
						--PRINT '@DURACION_REGISTROS_CONTIGUOS: ' + CONVERT(NVARCHAR(MAX), @DURACION_REGISTROS_CONTIGUOS);					
						IF(@SUPERIOR = 0)
						BEGIN
							SET @DURACION_GREGISTROS = @DURACION_REGISTROS_CONTIGUOS + DATEDIFF(second, @FECHA_INICIO_ULTIMO_REGISTRO, @fFin)
						END
						ELSE
						BEGIN
							SET @DURACION_GREGISTROS = @DURACION_REGISTROS_CONTIGUOS + DATEDIFF(second, @fIni, @FECHA_FIN_PRIMER_REGISTRO)
						END
						--PRINT '@DURACION_GREGISTROS: ' + CONVERT(NVARCHAR(MAX), @DURACION_GREGISTROS) + ' @TIEMPO_VACIADO_TREN: ' + CONVERT(NVARCHAR(MAX), @TIEMPO_VACIADO_TREN * 36000);
						IF(@DURACION_GREGISTROS < (@TIEMPO_VACIADO_TREN * 3600))
						BEGIN
							--PRINT '@FaltaDeRegistros: ' + CONVERT(NVARCHAR(MAX), @FaltaDeRegistros);
							SET @FaltaDeRegistros = 1;
						END
					END
				END
						
				FETCH cPaleterasLinea INTO @ID_MAQUINA
			END

		CLOSE cPaleterasLinea

		DEALLOCATE cPaleterasLinea

		--PRINT '---FIN PALETIZADORAS ------------------------------------------------------------';
	END
	
	RETURN @FaltaDeRegistros
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_EtiquetasMESJDE_ObtenerParticionEtiquetadora]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Tomás Hidalgo
-- Create date: 04/04/2018
-- Description:	Función para obtener la partición a la que corresponde una etiqueta 
-- =============================================
CREATE FUNCTION [dbo].[MES_EtiquetasMESJDE_ObtenerParticionEtiquetadora] 
(
	-- Add the parameters for the function here
	@FechaEtiqueta DATETIME = '1900-01-01 00:00:00',
	@Producto NVARCHAR(50),
	@Etiquetadora NVARCHAR(50)
)
RETURNS NVARCHAR(100)
AS
BEGIN

	-- Declare the return variable here
	DECLARE @Particion AS NVARCHAR(100) = ''

	-- Add the T-SQL statements to compute the return value here
	
	-- Obtenemos la partición activa para la fecha, producto y etiquetadora
	SET @Particion = (
	
	SELECT TOP 1 ID_ORDEN FROM [dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] P
	INNER JOIN [dbo].[MaquinasLineas] M ON P.ID_MAQUINA = M.Id
	INNER JOIN [dbo].[COB_MSM_LINEAS] L ON M.NumLinea = L.NUM_LINEA
	INNER JOIN [dbo].[Ordenes] O ON P.ID_ORDEN = O.Id
	WHERE M.Clase = 'ETIQUETADORA_PALETS'
	AND O.IdProducto = @Producto
	AND L.COD_ETQ_JDE = @Etiquetadora
	AND @FechaEtiqueta <= FECHA_FIN  
	ORDER BY FECHA_INICIO DESC
	
	)

	-- Return the result of the function
	RETURN ISNULL(@Particion,'')

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_EtiquetasMESJDE_ObtenerParticionLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Tomás Hidalgo
-- Create date: 04/04/2018
-- Description:	Función para obtener la partición a la que corresponde una etiqueta 
-- =============================================
CREATE FUNCTION [dbo].[MES_EtiquetasMESJDE_ObtenerParticionLinea] 
(
	-- Add the parameters for the function here
	@FechaEtiqueta DATETIME = '1900-01-01 00:00:00',
	@Producto NVARCHAR(50),
	@Linea NVARCHAR(50)
)
RETURNS NVARCHAR(100)
AS
BEGIN

	-- Declare the return variable here
	DECLARE @Particion AS NVARCHAR(100) = ''

	-- Add the T-SQL statements to compute the return value here
	
	-- Obtenemos la partición activa para la fecha, producto y etiquetadora
	SET @Particion = (
	
	SELECT TOP 1 ID_PARTICION FROM [dbo].[COB_MSM_PROD_RESTO_MAQ_HORA] P
	INNER JOIN [dbo].[MaquinasLineas] M ON P.ID_MAQUINA = M.Id
	INNER JOIN [dbo].[COB_MSM_LINEAS] L ON M.NumLinea = L.NUM_LINEA
	INNER JOIN [dbo].[Ordenes] O ON P.ID_ORDEN = O.Id
	WHERE M.Clase = 'ETIQUETADORA_PALETS'
	AND L.NUM_LINEA = @Linea
	AND O.IdProducto = @Producto
	AND P.FECHA_INICIO >= DATEADD(day, -1,@FechaEtiqueta)
	AND P.FECHA_FIN <= DATEADD(hour,1,@FechaEtiqueta) 
	ORDER BY FECHA_INICIO DESC
	
	)

	-- Return the result of the function
	RETURN ISNULL(@Particion,'')

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_ExisteConsolidadoTurnoHoraAnterior]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_ExisteConsolidadoTurnoHoraAnterior]
(
	@numLinea INT, @fecha DATETIME
)
RETURNS BIT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @ConsolidadoHoraAct AS BIT= 0;
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @NumReg AS INT;
	DECLARE @fIni AS DATETIME = DATEADD(HOUR,-1,@fecha); 
		
	-- Add the T-SQL statements to compute the return value here
	WITH Consolidado AS(
			SELECT FECHA_INICIO,FECHA_FIN,HORA
			FROM COB_MSM_PROD_LLENADORA_HORA 
			LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
			WHERE (FECHA_INICIO BETWEEN @fIni AND @fecha) AND (FECHA_FIN BETWEEN @fIni AND @fecha) AND ML.NumLinea = @NumLinea
			UNION 
			SELECT FECHA_INICIO,FECHA_FIN,HORA
			FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
			WHERE (FECHA_INICIO BETWEEN @fIni AND @fecha) AND (FECHA_FIN BETWEEN @fIni AND @fecha) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea
	)
	SELECT @NumReg = COUNT(HORA)
	FROM(
		SELECT convert(date, Consolidado.FECHA_INICIO) AS FECHA, HORA, MIN(Consolidado.FECHA_INICIO) AS FECHA_INICIO, MAX(Consolidado.FECHA_FIN) AS FECHA_FIN
		FROM Consolidado
		GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
	) AS C

	IF(@NumReg > 0)
	BEGIN
		SET @ConsolidadoHoraAct = 1;
	END
	ELSE 
	BEGIN
		SET @ConsolidadoHoraAct = 0;
	END
	RETURN @ConsolidadoHoraAct

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetDuracionRegistrosContinuos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetDuracionRegistrosContinuos]
(
	-- Add the parameters for the function here	
	@fIni as DATETIME,
	@fFin as DATETIME,
	@ID_MAQUINA AS NVARCHAR(255),
	@SUPERIOR AS BIT
)
RETURNS INT
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(50);
	DECLARE @FECHA_INICIO AS DATETIME;
	DECLARE @FECHA_FIN AS DATETIME;
	DECLARE @FECHA_INICIO_PREV DATETIME = NULL;
	DECLARE @FECHA_FIN_PREV DATETIME = NULL; 
	DECLARE @REGISTRO_NO_CONTIGUO_ENCONTRADO BIT = 0;
	DECLARE @DURACION INT = 0;
	--PRINT '@fIni: ' + CONVERT(NVARCHAR(MAX), @fIni,25) + ' @fFin: ' + CONVERT(NVARCHAR(MAX), @fFin,25) + '@ID_MAQUINA ' + CONVERT(NVARCHAR(MAX), @ID_MAQUINA) + '@SUPERIOR ' + CONVERT(NVARCHAR(MAX), @SUPERIOR);
	
	SELECT @CLASE = Clase
	FROM Maquinas WHERE 
	Id = @ID_MAQUINA

	declare @cr CURSOR;
	
	IF(@CLASE = 'LLENADORA')
	BEGIN
		SET @cr = CURSOR FOR
		SELECT COBLLE.FECHA_INICIO, COBLLE.FECHA_FIN
		FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
		WHERE COBLLE.ID_MAQUINA = @ID_MAQUINA AND (
		(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
		OR
		( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
		OR
		(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
		)
		ORDER BY
				CASE WHEN @Superior = 1 THEN COBLLE.FECHA_INICIO END ASC,
				CASE WHEN @Superior = 0 THEN COBLLE.FECHA_INICIO end DESC
	END
	ELSE
	BEGIN
		SET @cr = CURSOR FOR
		SELECT COBPAL.FECHA_INICIO, COBPAL.FECHA_FIN
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS COBPAL
		WHERE COBPAL.ID_MAQUINA = @ID_MAQUINA AND (
		(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
		OR
		( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
		OR
		(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
		)
		ORDER BY
				CASE WHEN @Superior = 1 THEN COBPAL.FECHA_INICIO END ASC,
				CASE WHEN @Superior = 0 THEN COBPAL.FECHA_INICIO end DESC
	END

	OPEN @cr		
	FETCH @cr INTO  @FECHA_INICIO, @FECHA_FIN
	WHILE (@@FETCH_STATUS = 0 )
	BEGIN
		IF(@REGISTRO_NO_CONTIGUO_ENCONTRADO = 0)
		BEGIN
			--PRINT '@FECHA_INICIO_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PREV,25) + ' @FECHA_FIN_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PREV,25) + ' @FECHA_INICIO ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO, 25) + ' @FECHA_FIN ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25);

			IF(@Superior = 1)
			BEGIN
				--Comprobamos que los registros son consecutivos o bien que sea la primera iteración
				IF(@FECHA_INICIO <> @FECHA_FIN_PREV AND (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL))
				BEGIN
					--PRINT '@FECHA_INICIO <> @FECHA_FIN_PREV';
					SET @REGISTRO_NO_CONTIGUO_ENCONTRADO = 1;
					SET @DURACION = datediff(second,@fIni, @FECHA_FIN_PREV);
					--PRINT '@DURACION ' + CONVERT(NVARCHAR(MAX), @DURACION);
				END 
				ELSE IF (@FECHA_FIN_PREV IS NULL AND @FECHA_INICIO_PREV IS NULL)
				BEGIN
					IF(@fIni <> @FECHA_INICIO)
					BEGIN
						--PRINT 'PRIMERA ITERACION @fFin <> @FECHA_FIN';
						SET @REGISTRO_NO_CONTIGUO_ENCONTRADO = 1;
						SET @DURACION = 0;
						--PRINT '@DURACION ' + CONVERT(NVARCHAR(MAX), @DURACION);
					END
				END
			END
			ELSE
			BEGIN
				--Comprobamos que los registros no son consecutivos, es decir hay ausencia de registros
				IF(@FECHA_FIN <> @FECHA_INICIO_PREV AND (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL))
				BEGIN
					--PRINT '@FECHA_FIN <> @FECHA_INICIO_PREV';
					SET @REGISTRO_NO_CONTIGUO_ENCONTRADO = 1;
					SET @DURACION = datediff(second, @FECHA_INICIO_PREV, @fFin);
					--PRINT '@DURACION ' + CONVERT(NVARCHAR(MAX), @DURACION);
				END 
				ELSE IF (@FECHA_FIN_PREV IS NULL AND @FECHA_INICIO_PREV IS NULL)
				BEGIN
					IF(@fFin <> @FECHA_FIN)
					BEGIN
						--PRINT 'PRIMERA ITERACION @fFin <> @FECHA_FIN';
						SET @REGISTRO_NO_CONTIGUO_ENCONTRADO = 1;
						SET @DURACION = 0;
						--PRINT '@DURACION ' + CONVERT(NVARCHAR(MAX), @DURACION);
					END
				END
			END

		END
		SET @FECHA_INICIO_PREV=@FECHA_INICIO;
		SET @FECHA_FIN_PREV=@FECHA_FIN;
		FETCH @cr INTO @FECHA_INICIO, @FECHA_FIN
	END
	
	CLOSE @cr
	DEALLOCATE @cr	
			
	RETURN @DURACION
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetHistoricKopDate]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[MES_GetHistoricKopDate] 
(	
	@tag varchar(max),
	@value float
)
RETURNS datetime
AS
BEGIN
	declare @date as datetime;

	SELECT Distinct @date=Min(RowUpdated)
	FROM
	(SELECT [TagID],[Value],RowUpdated
	 FROM [SITMESDB_FAB].[PPA].[dbo].[RPT_MGR_REALTIMEINTArchive] 
	 WHERE [TagID] in (SELECT [TagID] FROM [SITMESDB_FAB].[PPA].[dbo].[TAG]
					 WHERE [TagName] like '%'+@tag) AND Value between @value - 5 AND  @value + 5																													
	 UNION ALL					
	 SELECT [TagID],[Value],RowUpdated
	 FROM [SITMESDB_FAB].[PPA].[dbo].[RPT_MGR_REALTIMEFLOATArchive] 
	 WHERE [TagID] in (SELECT [TagID] FROM [SITMESDB_FAB].[PPA].[dbo].[TAG]
					 WHERE [TagName] like '%'+@tag) AND Value between @value - 5 AND  @value + 5)aux

return @date
END
GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetICParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetICParticion]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN

	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @CANTIDAD_PICOS_CAJAS as INT;
	DECLARE @CANTIDAD_PALETS_PALETIZADORA as INT;
	DECLARE @CANTIDAD_ENVASES_LLENADORA AS INT;
	DECLARE @CANTIDAD_ENVASES_NO_CONFORMIDAD as INT;
	DECLARE @NumPaletsdePicos AS INT;
	DECLARE @ICWO as FLOAT;
	DECLARE @ENVASES_PALETIZADORA_WO as INT;
	DECLARE @EnvasesPorPalet AS INT;
	DECLARE @CajasPorPalet AS INT;
	DECLARE @ENVASES_PICOS_WO AS INT;
	DECLARE @ESTADO_WO AS NVARCHAR(50);
	
	SELECT @EnvasesPorPalet = o.EnvasesPorPalet, @CajasPorPalet = o.CajasPorPalet, @ESTADO_WO = o.EstadoAct
	FROM dbo.Particiones o
	WHERE o.Id = @id_wo 

	IF (@ESTADO_WO IN ('Iniciando', 'Producción','Finalizando'))
	BEGIN
	 SET @ICWO = 1
	END
	ELSE
	BEGIN
		SELECT 
			@CANTIDAD_PALETS_PALETIZADORA = COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
		LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
		WHERE Consolidacion.ID_PARTICION = @id_wo AND ML.Clase = @CLASE
		GROUP BY ID_PARTICION

		SELECT 
			@CANTIDAD_ENVASES_LLENADORA = COALESCE(SUM(COBLLE.CONTADOR_PRODUCCION), 0)
		FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
		WHERE COBLLE.ID_PARTICION = @id_wo
		GROUP BY ID_PARTICION
	
		SELECT @CANTIDAD_PICOS_CAJAS = COALESCE(SUM(Cantidad),0), @NumPaletsdePicos = COUNT(IdParticion)
		FROM dbo.Picos
		WHERE IdParticion = @id_wo
	
		SELECT @CANTIDAD_ENVASES_NO_CONFORMIDAD = COALESCE(SUM(CANTIDAD_ENVASES),0)
		FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
		WHERE ID_PARTICION = @id_wo

		SET @ENVASES_PALETIZADORA_WO = (@CANTIDAD_PALETS_PALETIZADORA - @NumPaletsdePicos) * @EnvasesPorPalet;
	
		SET @ENVASES_PICOS_WO = @CANTIDAD_PICOS_CAJAS * COALESCE(@EnvasesPorPalet/NULLIF(@CajasPorPalet,0),0);
	
		SET @ICWO = COALESCE((@ENVASES_PALETIZADORA_WO + @ENVASES_PICOS_WO - @CANTIDAD_ENVASES_NO_CONFORMIDAD) /CONVERT(FLOAT,NULLIF(@CANTIDAD_ENVASES_LLENADORA,0)),0);
	END
	RETURN CONVERT(DECIMAL(10,3),@ICWO)
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetICTurnos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetICTurnos]
(
	-- Add the parameters for the function here
	@linea as NVARCHAR(200),
	@fIni as DATETIME,
	@fFin as DATETIME
)
RETURNS FLOAT
AS
BEGIN

	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @NUM_TURNOS_CONTIGUOS as INT;
	DECLARE @NUM_TURNOS_CON_ORDEN as INT;
	DECLARE @ICTurno as FLOAT = NULL;
	DECLARE @NumLinea as SMALLINT; 
	
	DECLARE @tmpDatosTurnosOrden TABLE (FECHA DATETIME, SHC_WORK_SCHED_DAY_PK int, TIPOTURNO INT, ID_ORDEN nvarchar(101), CANTIDAD_PALETS_PALETIZADORA INT, CANTIDAD_ENVASES_LLENADORA INT, CANTIDAD_PICOS_CAJAS INT, NumPaletsdePicos INT, CANTIDAD_ENVASES_NO_CONFORMIDAD INT, EnvasesPorPalet INT, CajasPorPalet INT)
	DECLARE @lstTurnos TABLE (SHC_WORK_SCHED_DAY_PK INT, FECHA DATETIME, FECHA_INICIO DATETIME, FECHA_FIN DATETIME, TIPOTURNO INT)

	SELECT @NumLinea = NumeroLinea FROM Lineas WHERE Id = @linea

	--INSERT INTO @lstTurnos
	--SELECT Id 
	--FROM cob 
	--WHERE Linea = @linea AND ((InicioTurno >= @fIni and FinTurno <=@fFin) or (@fIni BETWEEN InicioTurno AND FinTurno) or (@fFin BETWEEN InicioTurno AND FinTurno))

	INSERT INTO @lstTurnos
	SELECT SHC_WORK_SCHED_DAY_PK , FECHA, FECHA_INICIO, FECHA_FIN, IDTIPOTURNO
	FROM COB_MSM_CONSOLIDADO_TURNO 
	WHERE LINEA = @linea AND (
		(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
		OR
		( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
		OR
		(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
	)

	--SELECT * FROM @lstTurnos order by FECHA_INICIO

	------------------------OBTENCION CANTIDAD_PALETS_PALETIZADORA---------------------------------------------------------------------------------
	MERGE @tmpDatosTurnosOrden AS T
	USING (SELECT CT.FECHA, Consolidacion.SHC_WORK_SCHED_DAY_PK,ID_ORDEN, COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0), CT.IDTIPOTURNO
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			INNER JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			INNER JOIN Lineas AS L ON ML.NumLinea = L.NumeroLinea
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO CT ON L.Id = CT.LINEA AND Consolidacion.FECHA_INICIO BETWEEN CT.FECHA_INICIO AND CT.FECHA_FIN AND Consolidacion.FECHA_FIN BETWEEN CT.FECHA_INICIO AND CT.FECHA_FIN
			WHERE (Consolidacion.FECHA_INICIO >= @fIni AND Consolidacion.FECHA_FIN <= @fFin) AND ML.Clase = @CLASE AND ISNULL(ID_ORDEN,'') != '' AND ML.NumLinea = @NumLinea
			GROUP BY ID_ORDEN, Consolidacion.SHC_WORK_SCHED_DAY_PK, CT.FECHA,CT.IDTIPOTURNO) AS U (Fecha, IdTurno, IdOrden, CANTIDAD_PALETS_PALETIZADORA, TIPOTURNO)
		ON U.IdOrden = T.ID_ORDEN AND U.IdTurno = T.SHC_WORK_SCHED_DAY_PK AND U.TIPOTURNO = T.TIPOTURNO AND U.Fecha = T.FECHA
	WHEN MATCHED THEN 
		UPDATE SET T.CANTIDAD_PALETS_PALETIZADORA = U.CANTIDAD_PALETS_PALETIZADORA,
				   T.ID_ORDEN = U.IdOrden
	WHEN NOT MATCHED THEN
		INSERT (FECHA, SHC_WORK_SCHED_DAY_PK, TIPOTURNO,  ID_ORDEN, CANTIDAD_PALETS_PALETIZADORA) 
		VALUES (U.Fecha, U.IdTurno, U.TIPOTURNO, U.IdOrden, U.CANTIDAD_PALETS_PALETIZADORA);

	------------------------OBTENCION CANTIDAD_ENVASES_LLENADORA---------------------------------------------------------------------------------
	MERGE @tmpDatosTurnosOrden AS T
	USING (SELECT CT.FECHA, COBLLE.SHC_WORK_SCHED_DAY_PK, ID_ORDEN, COALESCE(SUM(COBLLE.CONTADOR_PRODUCCION), 0), CT.IDTIPOTURNO
			FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
			INNER JOIN MaquinasLineas AS ML on ML.Id = COBLLE.ID_MAQUINA
			INNER JOIN Lineas AS L ON ML.NumLinea = L.NumeroLinea
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO CT ON L.Id = CT.LINEA AND COBLLE.FECHA_INICIO BETWEEN CT.FECHA_INICIO AND CT.FECHA_FIN AND COBLLE.FECHA_FIN BETWEEN CT.FECHA_INICIO AND CT.FECHA_FIN
			WHERE (COBLLE.FECHA_INICIO >= @fIni AND COBLLE.FECHA_FIN <= @fFin) AND ISNULL(ID_ORDEN,'') != '' AND ML.NumLinea = @NumLinea
			GROUP BY COBLLE.ID_ORDEN, COBLLE.SHC_WORK_SCHED_DAY_PK, CT.FECHA, CT.IDTIPOTURNO) AS U (Fecha,IdTurno, IdOrden, CANTIDAD_ENVASES_LLENADORA, TIPOTURNO)
		ON U.IdOrden = T.ID_ORDEN AND U.IdTurno = T.SHC_WORK_SCHED_DAY_PK AND U.TIPOTURNO = T.TIPOTURNO AND U.Fecha = T.FECHA
	WHEN MATCHED THEN 
		UPDATE SET T.CANTIDAD_ENVASES_LLENADORA = U.CANTIDAD_ENVASES_LLENADORA,
				   T.ID_ORDEN = U.IdOrden
	WHEN NOT MATCHED THEN
		INSERT (FECHA, SHC_WORK_SCHED_DAY_PK, TIPOTURNO,  ID_ORDEN, CANTIDAD_ENVASES_LLENADORA) 
		VALUES (U.Fecha, U.IdTurno, U.TIPOTURNO, U.IdOrden, U.CANTIDAD_ENVASES_LLENADORA);
		
	------------------------OBTENCION CANTIDAD_PICOS_CAJAS, NumPaletsdePicos PARA CADA WO---------------------------------------------------------------------------------

	
	MERGE @tmpDatosTurnosOrden AS T
	USING (SELECT IdTurno, IdOrden, COALESCE(SUM(Cantidad),0), COUNT(IdOrden)
			FROM dbo.Picos
			WHERE IdTurno IN (SELECT SHC_WORK_SCHED_DAY_PK FROM @lstTurnos)
			GROUP BY IdOrden, IdTurno) AS U (IdTurno, IdOrden, CANTIDAD_PICOS_CAJAS, NumPaletsdePicos)
			ON U.IdOrden = T.ID_ORDEN AND U.IdTurno = T.SHC_WORK_SCHED_DAY_PK
	WHEN MATCHED THEN 
		UPDATE SET T.CANTIDAD_PICOS_CAJAS = U.CANTIDAD_PICOS_CAJAS, T.NumPaletsdePicos = U.NumPaletsdePicos;
	
	------------------------OBTENCION CANTIDAD_ENVASES_NO_CONFORMIDAD---------------------------------------------------------------------------------

	MERGE @tmpDatosTurnosOrden AS T
	USING (SELECT  SHC_WORK_SCHED_DAY_PK, ID_ORDEN, COALESCE(SUM(CANTIDAD_ENVASES),0)
			FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
			---COMPROBAR QUE FECHA_PROD_PALET POR BREAD SE PONE A NULL
			WHERE (FECHA_PROD_PALET IS NULL AND SHC_WORK_SCHED_DAY_PK IN (SELECT SHC_WORK_SCHED_DAY_PK FROM @lstTurnos)) or (FECHA_PROD_PALET BETWEEN @fIni AND @fFin) 
			GROUP BY ID_ORDEN, SHC_WORK_SCHED_DAY_PK) AS U (IdTurno, IdOrden, CANTIDAD_ENVASES_NO_CONFORMIDAD)
			ON U.IdOrden = T.ID_ORDEN AND U.IdTurno = T.SHC_WORK_SCHED_DAY_PK
	WHEN MATCHED THEN 
		UPDATE SET T.CANTIDAD_ENVASES_NO_CONFORMIDAD = U.CANTIDAD_ENVASES_NO_CONFORMIDAD;

	------------------------OBTENCION CONVERSIONES PARA CADA WO---------------------------------------------------------------------------------
	
	UPDATE
		Tdto
	SET
		Tdto.EnvasesPorPalet = o.EnvasesPorPalet,
		Tdto.CajasPorPalet = o.CajasPorPalet
	FROM
		@tmpDatosTurnosOrden AS Tdto
		INNER JOIN Ordenes AS o
			ON Tdto.ID_ORDEN = o.Id			

	--SELECT * FROM @tmpDatosTurnosOrden order by SHC_WORK_SCHED_DAY_PK

	SELECT @NUM_TURNOS_CONTIGUOS = COUNT(C.SHC_WORK_SCHED_DAY_PK)
	FROM
	(SELECT SHC_WORK_SCHED_DAY_PK
	FROM @lstTurnos
	GROUP BY SHC_WORK_SCHED_DAY_PK, FECHA) AS C

	SELECT @NUM_TURNOS_CON_ORDEN = COUNT(C.SHC_WORK_SCHED_DAY_PK)
	FROM
	(SELECT 1 AS SHC_WORK_SCHED_DAY_PK
	FROM @tmpDatosTurnosOrden TMP
	INNER JOIN @lstTurnos LST ON LST.SHC_WORK_SCHED_DAY_PK = TMP.SHC_WORK_SCHED_DAY_PK OR (TMP.FECHA = LST.FECHA AND TMP.TIPOTURNO = LST.TIPOTURNO)
	GROUP BY TMP.TIPOTURNO, TMP.FECHA) AS C
	--SELECT @NUM_TURNOS_CONTIGUOS AS '@NUM_TURNOS_CONTIGUOS', @NUM_TURNOS_CON_ORDEN AS '@NUM_TURNOS_CON_ORDEN'
	IF(@NUM_TURNOS_CONTIGUOS = @NUM_TURNOS_CON_ORDEN)
	BEGIN
		SELECT @ICTurno = ISNULL( (SUM(COALESCE((T.CANTIDAD_PALETS_PALETIZADORA - COALESCE(T.NumPaletsdePicos,0)) * T.EnvasesPorPalet,0)) + SUM(COALESCE( T.CANTIDAD_PICOS_CAJAS *T.EnvasesPorPalet/NULLIF(T.CajasPorPalet,0),0)) - SUM(COALESCE(T.CANTIDAD_ENVASES_NO_CONFORMIDAD,0)))/(SUM(CONVERT(FLOAT,NULLIF(T.CANTIDAD_ENVASES_LLENADORA,0))) ),0)
		FROM
		(	 SELECT ID_ORDEN, SUM(CANTIDAD_PALETS_PALETIZADORA) as CANTIDAD_PALETS_PALETIZADORA, SUM(CANTIDAD_ENVASES_LLENADORA) as CANTIDAD_ENVASES_LLENADORA, SUM(CANTIDAD_PICOS_CAJAS) as CANTIDAD_PICOS_CAJAS, SUM(NumPaletsdePicos) as NumPaletsdePicos, SUM(CANTIDAD_ENVASES_NO_CONFORMIDAD) as CANTIDAD_ENVASES_NO_CONFORMIDAD, EnvasesPorPalet, CajasPorPalet
			 FROM @tmpDatosTurnosOrden
			 GROUP BY ID_ORDEN, EnvasesPorPalet, CajasPorPalet 
		)T

		SET @ICTurno = CONVERT(DECIMAL(10,3),ROUND (@ICTurno, 3, 1))
	END

	RETURN @ICTurno
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetICWO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetICWO]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN

	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @CANTIDAD_PICOS_CAJAS as INT;
	DECLARE @CANTIDAD_PALETS_PALETIZADORA as INT;
	DECLARE @CANTIDAD_ENVASES_LLENADORA AS INT;
	DECLARE @CANTIDAD_ENVASES_NO_CONFORMIDAD as INT;
	DECLARE @NumPaletsdePicos AS INT;
	DECLARE @ICWO as FLOAT;
	DECLARE @ENVASES_PALETIZADORA_WO as INT;
	DECLARE @EnvasesPorPalet AS INT;
	DECLARE @CajasPorPalet AS INT;
	DECLARE @ENVASES_PICOS_WO AS INT;
	DECLARE @ESTADO_WO AS NVARCHAR(50);
	
	SELECT @EnvasesPorPalet = o.EnvasesPorPalet, @CajasPorPalet = o.CajasPorPalet, @ESTADO_WO = o.EstadoAct
	FROM dbo.Ordenes o
	WHERE o.Id = @id_wo 

	IF (@ESTADO_WO IN ('Cancelada'))
	BEGIN
	 SET @ICWO = 1
	END
	ELSE
	BEGIN
		SELECT 
			@CANTIDAD_PALETS_PALETIZADORA = COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0)
		FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
		LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
		WHERE Consolidacion.ID_ORDEN = @id_wo AND ML.Clase = @CLASE
		GROUP BY ID_ORDEN

		SELECT 
			@CANTIDAD_ENVASES_LLENADORA = COALESCE(SUM(COBLLE.CONTADOR_PRODUCCION), 0)
		FROM COB_MSM_PROD_LLENADORA_HORA AS COBLLE
		WHERE COBLLE.ID_ORDEN = @id_wo
		GROUP BY ID_ORDEN
	
		SELECT @CANTIDAD_PICOS_CAJAS = COALESCE(SUM(Cantidad),0), @NumPaletsdePicos = COUNT(IdParticion)
		FROM dbo.Picos
		WHERE IdOrden = @id_wo
	
		SELECT @CANTIDAD_ENVASES_NO_CONFORMIDAD = COALESCE(SUM(CANTIDAD_ENVASES),0)
		FROM [dbo].[COB_MSM_NO_CONFORMIDAD]
		WHERE ID_ORDEN = @id_wo

		SET @ENVASES_PALETIZADORA_WO = (@CANTIDAD_PALETS_PALETIZADORA - @NumPaletsdePicos) * @EnvasesPorPalet;
	
		SET @ENVASES_PICOS_WO = @CANTIDAD_PICOS_CAJAS * COALESCE(@EnvasesPorPalet/NULLIF(@CajasPorPalet,0),0);
	
		SET @ICWO = COALESCE((@ENVASES_PALETIZADORA_WO + @ENVASES_PICOS_WO - @CANTIDAD_ENVASES_NO_CONFORMIDAD) /CONVERT(FLOAT,NULLIF(@CANTIDAD_ENVASES_LLENADORA,0)),0);
	END
	RETURN CONVERT(DECIMAL(10,3),@ICWO)
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetIntervaloFechasVaciadoLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetIntervaloFechasVaciadoLinea]
(
	-- Add the parameters for the function here
	@fecha AS DATETIME,
	@NumLinea as SMALLINT,
	@Superior as BIT
)
RETURNS @OutputTbl TABLE (FECHA_INICIO_LIMITE_INFERIOR DATETIME, FECHA_INICIO_LIMITE_SUPERIOR DATETIME, TIEMPO_VACIADO_TREN INT)
AS
BEGIN
	DECLARE @NumDiasRango AS INT = 30;
	DECLARE @LIMITEREGISTROS_SUPERADO AS BIT= 0;
	DECLARE @IdParamtTiempoVaciadoTren INT = 14;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 14 => 'Tiempo para considerar vaciado tren'
	DECLARE @ParamtTiempoVaciadoTren INT;
	DECLARE @fIni AS DATETIME;
	DECLARE @fFin AS DATETIME;
	DECLARE @fIniTurno AS DATETIME;
	DECLARE @fFinTurno AS DATETIME;
	DECLARE @TIEMPO_VACIADO_TREN AS INT;
	DECLARE @TIEMPO_VACIADO_TREN_ENCONTRADO AS INT;
	--DECLARE @NumLinea as SMALLINT;
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @NumHoras AS INT = 10;
	
	--SELECT @NumLinea = NumeroLinea FROM Lineas WHERE Id = @linea
	--PRINT '@fecha: ' + CONVERT(NVARCHAR(MAX), @fecha,25) + ' @NumLinea: ' + CONVERT(NVARCHAR(MAX), @NumLinea) + ' @Superior: ' + CONVERT(NVARCHAR(MAX), @Superior);

	SELECT @ParamtTiempoVaciadoTren = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamtTiempoVaciadoTren AND FK_LINEA_ID = @numLinea
	
	--PRINT '@ParamtTiempoVaciadoTren: ' + CONVERT(NVARCHAR(MAX), @ParamtTiempoVaciadoTren,25)

	--SELECT TOP(1) @fecha = FECHA_INICIO 
	--FROM COB_MSM_PROD_LLENADORA_HORA Consolidacion
	--LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA			
	--WHERE @fecha BETWEEN FECHA_INICIO AND FECHA_FIN AND ML.NumLinea = @NumLinea
	--ORDER BY FECHA_INICIO DESC

	IF(@Superior = 1)
	BEGIN
		SET @fIni = @fecha;
		SET @fFin = DATEADD(DAY,@NumDiasRango,@fIni);
	END
	ELSE
	BEGIN
		SET @fFin = @fecha;
		SET @fIni = DATEADD(DAY,-@NumDiasRango,@fFin);
	END

	--PRINT 'Fecha origen: ' + CONVERT(NVARCHAR(MAX), @fecha,25)
	--PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)
	DECLARE @ENCONTRADO BIT = 0;
	DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME = NULL;
	DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME = NULL;

	--Primero comprobamos que no estemos en un gap -> Si la fecha a la que preguntamos está 
	--en un gap lo devolvemos directamente si @Superior = 0, si no continuamos para poder sacar el limite superior (si no siempre devolvemos lo mismo)
	
	DECLARE @fIni_GAP_SUP DATETIME = @fecha;
	DECLARE @fFin_GAP_SUP DATETIME = DATEADD(DAY,@NumDiasRango,@fIni_GAP_SUP);	 
	DECLARE @fFin_GAP_INF DATETIME = @fecha
	DECLARE @fIni_GAP_INF DATETIME =DATEADD(DAY,-@NumDiasRango,@fFin_GAP_INF);

	--PRINT '@fIni_GAP_INF: ' + CONVERT(NVARCHAR(MAX), @fIni_GAP_INF, 25) + ' @fFin_GAP_INF : ' + CONVERT(NVARCHAR(MAX), @fFin_GAP_INF,25)

	--Obtenemos el primer valor con orden y producción por debajo
	DECLARE @FECHA_FIN_GAP_INFERIOR DATETIME;
	DECLARE @FECHA_INICIO_GAP_SUPERIOR DATETIME;
	DECLARE @TIEMPO_VACIADO_TREN_GAP AS INT;
	;WITH Consolidado AS(
		SELECT FECHA_INICIO,FECHA_FIN,HORA
		FROM COB_MSM_PROD_LLENADORA_HORA 
		LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
		WHERE (FECHA_INICIO BETWEEN @fIni_GAP_INF AND @fFin_GAP_INF) AND (FECHA_FIN BETWEEN @fIni_GAP_INF AND @fFin_GAP_INF) AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
		UNION 
		SELECT FECHA_INICIO,FECHA_FIN,HORA
		FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
		LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
		WHERE (FECHA_INICIO BETWEEN @fIni_GAP_INF AND @fFin_GAP_INF) AND (FECHA_FIN BETWEEN @fIni_GAP_INF AND @fFin_GAP_INF) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
	)
	SELECT TOP(1) @FECHA_FIN_GAP_INFERIOR = MAX(Consolidado.FECHA_FIN), @TIEMPO_VACIADO_TREN_GAP = COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren)
	FROM Consolidado
	LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
	GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
	ORDER BY convert(date, Consolidado.FECHA_INICIO) DESC, HORA DESC

	--PRINT '@FECHA_FIN_GAP_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_GAP_INFERIOR, 25)

	--PRINT '@fIni_GAP_SUP: ' + CONVERT(NVARCHAR(MAX), @fIni_GAP_SUP, 25) + ' @fFin_GAP_SUP : ' + CONVERT(NVARCHAR(MAX), @fFin_GAP_SUP,25)
	--Obtenemos el primer valor con orden y producción por arriba
	;WITH Consolidado AS(
		SELECT FECHA_INICIO,FECHA_FIN,HORA
		FROM COB_MSM_PROD_LLENADORA_HORA 
		LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
		WHERE (FECHA_INICIO BETWEEN @fIni_GAP_SUP AND @fFin_GAP_SUP) AND (FECHA_FIN BETWEEN @fIni_GAP_SUP AND @fFin_GAP_SUP) AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
		UNION 
		SELECT FECHA_INICIO,FECHA_FIN,HORA
		FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
		LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
		WHERE (FECHA_INICIO BETWEEN @fIni_GAP_SUP AND @fFin_GAP_SUP) AND (FECHA_FIN BETWEEN @fIni_GAP_SUP AND @fFin_GAP_SUP) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
	)
	SELECT TOP(1) 
		@FECHA_INICIO_GAP_SUPERIOR = MIN(Consolidado.FECHA_INICIO), 
		@TIEMPO_VACIADO_TREN_GAP = 
		CASE 
			WHEN COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren) > @TIEMPO_VACIADO_TREN_GAP THEN @TIEMPO_VACIADO_TREN_GAP
			ELSE COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren) 
		END
	FROM Consolidado
	LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
	GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
	ORDER BY convert(date, Consolidado.FECHA_INICIO) ASC, HORA ASC

	--PRINT '@FECHA_INICIO_GAP_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_GAP_SUPERIOR, 25) 

	DECLARE @DENTRO_GAP AS BIT;
	IF(@Superior = 0)
	BEGIN
		IF((@FECHA_FIN_GAP_INFERIOR <> @fecha) AND ((datediff(second,@FECHA_FIN_GAP_INFERIOR, @FECHA_INICIO_GAP_SUPERIOR)/3600.0) >= @TIEMPO_VACIADO_TREN_GAP) OR (@FECHA_FIN_GAP_INFERIOR IS NULL))
		BEGIN 
			--PRINT 'Estamos dentro de un gap @Superior: ' + CONVERT(NVARCHAR(MAX), @Superior);
			SET @DENTRO_GAP = 1;
		END
		ELSE
		BEGIN
			--PRINT 'NO estamos dentro de un gap @Superior: ' + CONVERT(NVARCHAR(MAX), @Superior);
			SET @DENTRO_GAP = 0;
		END
	END
	ELSE
	BEGIN
		IF((@FECHA_INICIO_GAP_SUPERIOR <> @fecha) AND ((datediff(second,@FECHA_FIN_GAP_INFERIOR, @FECHA_INICIO_GAP_SUPERIOR)/3600.0) >= @TIEMPO_VACIADO_TREN_GAP) OR (@FECHA_INICIO_GAP_SUPERIOR IS NULL))
		BEGIN 
			--PRINT 'Estamos dentro de un gap @Superior: ' + CONVERT(NVARCHAR(MAX), @Superior);
			SET @DENTRO_GAP = 1;
		END
		ELSE
		BEGIN
			--PRINT 'NO estamos dentro de un gap @Superior: ' + CONVERT(NVARCHAR(MAX), @Superior); 
			SET @DENTRO_GAP = 0;
		END
	END
	IF(@DENTRO_GAP = 1)
	BEGIN 
		--PRINT 'Estamos dentro de un gap'
		SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_FIN_GAP_INFERIOR
		SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO_GAP_SUPERIOR;
		SET @ENCONTRADO = 1;		
		SET @TIEMPO_VACIADO_TREN_ENCONTRADO = @TIEMPO_VACIADO_TREN_GAP;
		--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25)

	END
	ELSE
	BEGIN
		--PRINT 'NO estamos dentro de un gap'
		DECLARE @FECHA_DATEPART DATE;
		DECLARE @HORA INT;
		DECLARE @FECHA_INICIO DATETIME;
		DECLARE @FECHA_FIN DATETIME;
		DECLARE @FECHA_INICIO_PREV DATETIME = NULL;
		DECLARE @FECHA_FIN_PREV DATETIME = NULL; 
		DECLARE @ID_ORDEN NVARCHAR(101);
		DECLARE @CONTADOR_PROD INT;
		DECLARE @tmpConsolidado TABLE (FECHA_INICIO DATETIME, FECHA_FIN DATETIME);
		--PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)
		
		DECLARE @TURNO_CONSECUTIVO BIT = 1;

		WHILE(@NumDiasRango > 0)
		BEGIN
			--PRINT '@NumDiasRango: ' + CONVERT(NVARCHAR(MAX), @NumDiasRango)
			declare @cr CURSOR;
	
			SET @cr = CURSOR FOR
			WITH Consolidado AS(
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_LLENADORA_HORA 
				LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
				UNION 
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
				LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
				WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
			)
			SELECT convert(date, Consolidado.FECHA_INICIO) AS FECHA, HORA, MIN(Consolidado.FECHA_INICIO) AS FECHA_INICIO, MAX(Consolidado.FECHA_FIN) AS FECHA_FIN, COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren) AS TIEMPO_VACIADO_TREN
			FROM Consolidado
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
			GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
			ORDER BY
					CASE WHEN @Superior = 1 THEN convert(date, Consolidado.FECHA_INICIO) END ASC,
					CASE WHEN @Superior = 0 THEN convert(date, Consolidado.FECHA_INICIO) end DESC,
					CASE WHEN @Superior = 1 THEN HORA END ASC,
					CASE WHEN @Superior = 0 THEN HORA end DESC

			OPEN @cr
			IF(CURSOR_STATUS('variable','@cr') = 0)		
			BEGIN
				IF(@Superior = 1)
				BEGIN
					DECLARE @FECHA_MAX AS DATETIME;
					SELECT @FECHA_MAX = MAX(FECHA_FIN)
					FROM
					(
					SELECT MAX(FECHA_FIN) AS FECHA_FIN
					FROM COB_MSM_PROD_LLENADORA_HORA 
					UNION 
					SELECT MAX(FECHA_FIN) AS FECHA_FIN
					FROM COB_MSM_PROD_RESTO_MAQ_HORA ) AS C

					IF(@fFin > @FECHA_MAX)
					BEGIN 
						SET @NumDiasRango = 0;
						SET @LIMITEREGISTROS_SUPERADO = 1;
						--PRINT '@fFin: ' + CONVERT(VARCHAR(MAX),@fFin,25) + ' > @FECHA_MAX: ' +CONVERT(VARCHAR(MAX),@FECHA_MAX,25) + ' No hay mas registros por arriba'
					END

				END
				ELSE
				BEGIN
					DECLARE @FECHA_MIN AS DATETIME;
					SELECT @FECHA_MIN = MIN(FECHA_INICIO)
					FROM
					(
					SELECT MIN(FECHA_INICIO) AS FECHA_INICIO
					FROM COB_MSM_PROD_LLENADORA_HORA 
					UNION 
					SELECT MIN(FECHA_INICIO) AS FECHA_INICIO
					FROM COB_MSM_PROD_RESTO_MAQ_HORA ) AS C

					IF(@fIni < @FECHA_MIN)
					BEGIN 
						SET @NumDiasRango = 0;
						SET @LIMITEREGISTROS_SUPERADO = 1;
						--PRINT '@fIni: ' + CONVERT(VARCHAR(MAX),@fIni,25) + ' < @FECHA_MIN: ' +CONVERT(VARCHAR(MAX),@FECHA_MIN,25) + ' No hay mas registros por atras'
					END
				END
			END
			--PRINT '---------------------------------------------------------------------------------------------------------------------------------------------------'
			FETCH @cr INTO  @FECHA_DATEPART, @HORA, @FECHA_INICIO, @FECHA_FIN, @TIEMPO_VACIADO_TREN
			WHILE (@@FETCH_STATUS = 0 )
			BEGIN
				--PRINT '@FECHA_DATEPART: ' + CONVERT(NVARCHAR(MAX), @FECHA_DATEPART,25) + ' @HORA: ' + CONVERT(NVARCHAR(MAX), @HORA) + '@FECHA_INICIO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO,25) + '@FECHA_FIN: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25) + ' @TIEMPO_VACIADO_TREN: ' + CONVERT(NVARCHAR(MAX), @TIEMPO_VACIADO_TREN)
				--PRINT '@FECHA_INICIO_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PREV,25) + ' @FECHA_FIN_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PREV,25)
				IF(@ENCONTRADO = 0)
				BEGIN			
					IF(@Superior = 1)
					BEGIN
						--Comprobamos que los registros son consecutivos o bien que sea la primera iteración
						IF(@FECHA_INICIO <> @FECHA_FIN_PREV AND (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL))
						BEGIN
							--PRINT '@FECHA_INICIO <> @FECHA_FIN_PREV AND (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL)'
							--PRINT '@FECHA_INICIO: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO,25) + ' @FECHA_FIN_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PREV,25) + ' @FECHA_INICIO_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PREV,25)
							IF((datediff(second,@FECHA_FIN_PREV, @FECHA_INICIO)/3600.0) >= @TIEMPO_VACIADO_TREN)
							BEGIN
								--PRINT CONVERT(NVARCHAR(MAX), (datediff(second,@FECHA_INICIO_PREV, @FECHA_FIN)/3600.0)) + '>= @TIEMPO_VACIADO_TREN: ' + CONVERT(NVARCHAR(MAX), @TIEMPO_VACIADO_TREN)
								SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_FIN_PREV
								SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO;
								SET @ENCONTRADO = 1;
								
								SET @TIEMPO_VACIADO_TREN_ENCONTRADO = @TIEMPO_VACIADO_TREN
								--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25) + ' @ENCONTRADO: ' + CONVERT(NVARCHAR(MAX), @ENCONTRADO)

							END
						END
					END
					ELSE
					BEGIN
						--Comprobamos que los registros no son consecutivos, es decir hay un gap
						IF(@FECHA_FIN <> @FECHA_INICIO_PREV AND (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL))
						BEGIN
							--PRINT '@FECHA_FIN <> @FECHA_INICIO_PREV OR (@FECHA_FIN_PREV IS NOT NULL AND @FECHA_INICIO_PREV IS NOT NULL)'
							--PRINT '@FECHA_FIN: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25) + ' @FECHA_FIN_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_PREV,25) + ' @FECHA_INICIO_PREV: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_PREV,25)

							IF((datediff(second,@FECHA_FIN,@FECHA_INICIO_PREV)/3600.0) >= @TIEMPO_VACIADO_TREN)
							BEGIN
								--PRINT CONVERT(NVARCHAR(MAX), (datediff(second,@FECHA_FIN,@FECHA_INICIO_PREV)/3600.0)) + '>= @TIEMPO_VACIADO_TREN: ' + CONVERT(NVARCHAR(MAX), @TIEMPO_VACIADO_TREN)
								SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_FIN
								SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO_PREV;
								SET @ENCONTRADO = 1;
								SET @TIEMPO_VACIADO_TREN_ENCONTRADO = @TIEMPO_VACIADO_TREN
								--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25) + ' @ENCONTRADO: ' + CONVERT(NVARCHAR(MAX), @ENCONTRADO)

							END
						END
					END		

					SET @FECHA_INICIO_PREV=@FECHA_INICIO;
					SET @FECHA_FIN_PREV=@FECHA_FIN;
				END
				--PRINT '---------------------------------------------------------------------------------------------------------------------------------------------------'
				FETCH @cr INTO @FECHA_DATEPART, @HORA, @FECHA_INICIO, @FECHA_FIN, @TIEMPO_VACIADO_TREN
			END

			IF(@ENCONTRADO = 0 AND @LIMITEREGISTROS_SUPERADO = 0)
			BEGIN
				IF(@Superior = 1)
				BEGIN
					SET @fIni = @fFin;
					SET @fFin = DATEADD(DAY,@NumDiasRango,@fIni);
					--PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)
				END
				ELSE
				BEGIN
					SET @fFin = @fIni;
					SET @fIni = DATEADD(DAY,-@NumDiasRango,@fFin);
					--PRINT 'Limites -> @fIni: ' + CONVERT(NVARCHAR(MAX), @fIni, 25) + ' @fFin : ' + CONVERT(NVARCHAR(MAX), @fFin,25)
				END
			END
			ELSE
			BEGIN
				SET @NumDiasRango = 0
			END		
		END

		CLOSE @cr
		DEALLOCATE @cr	
	END
	--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25) + ' @ENCONTRADO: ' + CONVERT(NVARCHAR(MAX), @ENCONTRADO)
	IF(@ENCONTRADO = 1)
	BEGIN		
		INSERT INTO @OutputTbl VALUES (@FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR, @TIEMPO_VACIADO_TREN_ENCONTRADO);			
	END
	ELSE IF(@LIMITEREGISTROS_SUPERADO = 1)
	BEGIN
		IF(@Superior = 1)
		BEGIN
			SET @fIni = @fecha;
			SET @fFin = GETDATE();
			DECLARE @FECHA_FIN_ULTIMO_REG DATETIME;
			SET @FECHA_FIN = NULL;
			--PRINT '@LIMITEREGISTROS_SUPERADO: ' + CONVERT(NVARCHAR(MAX), @LIMITEREGISTROS_SUPERADO)
			--Obtenemos la fecha fin del ultimo registro	
			;WITH Consolidado AS(
					SELECT FECHA_INICIO,FECHA_FIN,HORA
					FROM COB_MSM_PROD_LLENADORA_HORA 
					LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
					WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.NumLinea = @NumLinea-- AND (ISNULL(ID_ORDEN,'') <> '' AND CONTADOR_PRODUCCION > 0
					UNION 
					SELECT FECHA_INICIO,FECHA_FIN,HORA
					FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
					LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
					WHERE (FECHA_INICIO BETWEEN @fIni AND @fFin) AND (FECHA_FIN BETWEEN @fIni AND @fFin) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea --AND (ISNULL(ID_ORDEN,'') <> '' AND CONTADOR_PRODUCCION > 0
				)
			SELECT TOP(1) @FECHA_FIN_ULTIMO_REG = MAX(Consolidado.FECHA_FIN) 
			FROM Consolidado
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
			GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
			ORDER BY convert(date, Consolidado.FECHA_INICIO) DESC,HORA DESC
			--PRINT '@FECHA_FIN_ULTIMO_REG: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN_ULTIMO_REG,25)

			IF(@FECHA_INICIO_GAP_SUPERIOR IS NOT NULL)
			BEGIN 
				SET @FECHA_FIN = @FECHA_INICIO_GAP_SUPERIOR; 
			END
			ELSE
			BEGIN
				SET @FECHA_FIN = @FECHA_FIN_GAP_INFERIOR; 
			END
			--PRINT '@FECHA_FIN: ' + CONVERT(NVARCHAR(MAX), @FECHA_FIN,25)
			IF(@FECHA_FIN IS NOT NULL)
			BEGIN 
				--PRINT '@TIEMPO_VACIADO_TREN' + CONVERT(NVARCHAR(MAX),@TIEMPO_VACIADO_TREN_GAP)
				IF((datediff(second,@FECHA_FIN, @FECHA_FIN_ULTIMO_REG)/3600.0) >= @TIEMPO_VACIADO_TREN_GAP)
				BEGIN
					SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_FIN;
					SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_FIN_ULTIMO_REG;
					--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25);
					INSERT INTO @OutputTbl VALUES (@FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR,@TIEMPO_VACIADO_TREN_GAP);
				END			
			END
		END	
		ELSE
		BEGIN
			SET @fIni = @fecha;
			DECLARE @FECHA_INICIO_ULTIMO_REG DATETIME;
			SET @FECHA_INICIO = NULL;
			--PRINT '@LIMITEREGISTROS_SUPERADO: ' + CONVERT(NVARCHAR(MAX), @LIMITEREGISTROS_SUPERADO)
			--Obtenemos la fecha fin del ultimo registro	
			;WITH Consolidado AS(
					SELECT FECHA_INICIO,FECHA_FIN,HORA
					FROM COB_MSM_PROD_LLENADORA_HORA 
					LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
					WHERE (FECHA_INICIO < @fIni) AND ML.NumLinea = @NumLinea-- AND (ISNULL(ID_ORDEN,'') <> '' AND CONTADOR_PRODUCCION > 0
					UNION 
					SELECT FECHA_INICIO,FECHA_FIN,HORA
					FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
					LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
					WHERE (FECHA_INICIO < @fIni)  AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea --AND (ISNULL(ID_ORDEN,'') <> '' AND CONTADOR_PRODUCCION > 0
				)
			SELECT TOP(1) @FECHA_INICIO_ULTIMO_REG = MIN(Consolidado.FECHA_INICIO) 
			FROM Consolidado
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
			GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
			
			--Obtenemos las fechas del último registro con producción
			;WITH Consolidado AS(
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_LLENADORA_HORA 
				LEFT JOIN MaquinasLineas AS ML on ML.Id = ID_MAQUINA
				WHERE (FECHA_INICIO < @fIni) AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
				UNION 
				SELECT FECHA_INICIO,FECHA_FIN,HORA
				FROM COB_MSM_PROD_RESTO_MAQ_HORA Consolidacion
				LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA 			 		
				WHERE (FECHA_INICIO < @fIni) AND ML.Clase = @CLASE AND ML.NumLinea = @NumLinea AND (ISNULL(ID_ORDEN,'') <> '' OR CONTADOR_PRODUCCION > 0)
			)
			SELECT TOP(1) @FECHA_DATEPART = convert(date, Consolidado.FECHA_INICIO) ,@HORA = HORA, @FECHA_INICIO = MIN(Consolidado.FECHA_INICIO), @FECHA_FIN = MAX(Consolidado.FECHA_FIN) , @TIEMPO_VACIADO_TREN = COALESCE(NULLIF(MIN(ct.TIEMPO_VACIADO_TREN),0),@ParamtTiempoVaciadoTren) 
			FROM Consolidado
			LEFT JOIN COB_MSM_CONSOLIDADO_TURNO ct ON (Consolidado.FECHA_INICIO BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN) AND (Consolidado.FECHA_FIN BETWEEN ct.FECHA_INICIO AND ct.FECHA_FIN)
			GROUP BY convert(date, Consolidado.FECHA_INICIO), HORA
			ORDER BY convert(date, Consolidado.FECHA_INICIO) ASC,HORA ASC

			IF(@FECHA_INICIO IS NOT NULL)
			BEGIN 
				--PRINT '@FECHA_INICIO_ULTIMO_REG: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_ULTIMO_REG,25)
				IF((datediff(second,@FECHA_INICIO_ULTIMO_REG, @FECHA_INICIO)/3600.0) >= @TIEMPO_VACIADO_TREN)
				BEGIN
					SET @FECHA_INICIO_LIMITE_INFERIOR = @FECHA_INICIO_ULTIMO_REG;
					SET @FECHA_INICIO_LIMITE_SUPERIOR = @FECHA_INICIO;
					--PRINT '@FECHA_INICIO_LIMITE_INFERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_INFERIOR,25) + ' @FECHA_INICIO_LIMITE_SUPERIOR: ' + CONVERT(NVARCHAR(MAX), @FECHA_INICIO_LIMITE_SUPERIOR,25);
					INSERT INTO @OutputTbl VALUES (@FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR,@TIEMPO_VACIADO_TREN);
				END			
			END
		END
	END
	ELSE
	BEGIN
		INSERT INTO @OutputTbl VALUES (NULL, NULL, NULL);
	END
	RETURN
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetNumerPicosOrden]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetNumerPicosOrden]
(
	 @idOrden NVARCHAR(101)
)
RETURNS INT
AS
BEGIN
	DECLARE @CantidadPicos INT;
	SELECT
	@CantidadPicos = ISNULL(SUM(Cantidad), 0)
	FROM Picos
	WHERE  IdOrden = @idOrden

	RETURN @CantidadPicos;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetNumerPicosOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetNumerPicosOrdenTurno]
(
	@idTurno INT, @idOrden NVARCHAR(101)
)
RETURNS INT
AS
BEGIN
	DECLARE @CantidadPicos INT;
	SELECT
	@CantidadPicos = ISNULL(SUM(Cantidad), 0)
	FROM Picos
	WHERE IdTurno = @idTurno AND IdOrden = @idOrden

	RETURN @CantidadPicos;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetNumerPicosParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetNumerPicosParticion]
(
	 @idParticion NVARCHAR(101)
)
RETURNS INT
AS
BEGIN
	DECLARE @CantidadPicos INT;
	SELECT
	@CantidadPicos = ISNULL(SUM(Cantidad), 0)
	FROM Picos
	WHERE  IdParticion = @idParticion

	RETURN @CantidadPicos;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetNumerPicosParticionTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetNumerPicosParticionTurno]
(
	@idTurno INT, @idParticion NVARCHAR(101)
)
RETURNS INT
AS
BEGIN
	DECLARE @CantidadPicos INT;
	SELECT
	@CantidadPicos = ISNULL(SUM(Cantidad), 0)
	FROM Picos
	WHERE IdTurno = @idTurno AND IdParticion = idParticion

	RETURN @CantidadPicos;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetOEEMedio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetOEEMedio]
(
	@numLinea INT, @IdProducto NVARCHAR(100)
)
RETURNS FLOAT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamOEEMedio INT = 1;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 1 => 'Número de WO para el cálculo del OEE Medio'
	DECLARE @ParamOEEMedio INT;
	DECLARE @OEEMedio as FLOAT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamOEEMedio = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamOEEMedio AND FK_LINEA_ID = @numLinea

	SELECT @OEEMedio = ISNULL(STR(AVG(OEE),5,2),0)
	FROM
	(SELECT TOP (@ParamOEEMedio) o.OEE 
	FROM dbo.Ordenes o
	INNER JOIN dbo.Lineas l ON l.Id = o.Linea
	WHERE o.IdProducto = @IdProducto AND l.NumeroLinea = @numLinea AND o.EstadoAct IN ('Cerrada') --o.FecIniReal IS NOT NULL --¿FecFinReal IS NOT NULL?
	ORDER BY o.FecIniReal desc) AS tbOEE

	-- Return the result of the function
	RETURN @OEEMedio

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetOEEMedioPreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetOEEMedioPreactor]
(
	@numLinea INT, @IdProducto NVARCHAR(100)
)
RETURNS FLOAT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamOEEMedio INT = 1;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 1 => 'Número de WO para el cálculo del OEE Medio'
	DECLARE @ParamOEEMedio INT;
	DECLARE @OEEMedio FLOAT;
	DECLARE @PorcentajeInferiorId INT = 7;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 7 => 'Porcentaje inferior OEE Preactor'
	DECLARE @PorcentajeInferior FLOAT;
	DECLARE @PorcentajeSuperiorId INT = 6;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 6 => 'Porcentaje superior OEE Preactor'
	DECLARE @PorcentajeSuperior FLOAT;
	DECLARE @OEEObjetivo FLOAT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamOEEMedio = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamOEEMedio AND FK_LINEA_ID = @numLinea

	SELECT @PorcentajeInferior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeInferiorId AND FK_LINEA_ID = @numLinea

	SELECT @PorcentajeSuperior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeSuperiorId AND FK_LINEA_ID = @numLinea

	SELECT @OEEObjetivo = pl.OEEObjetivo
	from dbo.ParametrosLinea pl
	INNER JOIN dbo.Lineas l ON l.Id = pl.IdLinea
	WHERE l.NumeroLinea = @numLinea AND pl.Producto = @IdProducto

	--SELECT @OEEMedio = ISNULL(STR(AVG(OEE), 5, 2),0)
	SELECT @OEEMedio = STR(AVG(OEE), 5, 2)
	FROM
	(SELECT TOP (@ParamOEEMedio) o.OEE 
	FROM dbo.Ordenes o
	INNER JOIN dbo.Lineas l ON l.Id = o.Linea
	--INNER JOIN dbo.ParametrosLinea pl ON pl.IdLinea = l.Id
	WHERE o.IdProducto = @IdProducto AND l.NumeroLinea = @numLinea AND o.EstadoAct IN ('Cerrada') AND o.OEE BETWEEN (@OEEObjetivo - ((@PorcentajeInferior * @OEEObjetivo) / 100)) AND (@OEEObjetivo + ((@PorcentajeSuperior * @OEEObjetivo) / 100))
	ORDER BY o.FecIniReal desc) AS tbOEE

	-- Return the result of the function
	RETURN @OEEMedio

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetOEEParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetOEEParticion]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN

	DECLARE @OEE as FLOAT;	
	DECLARE @IC AS FLOAT;
	SET @IC = [dbo].[MES_GetICParticion](@id_wo) 

	IF (@IC > 1)
	BEGIN
	  SET @IC = 1
	END

	SET @OEE = ( [dbo].[MES_GetRendimientoParticion](@id_wo) * @IC ) * 100

	RETURN @OEE
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetOEEWO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetOEEWO]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN
	DECLARE @OEE as FLOAT;
	DECLARE @IC AS FLOAT;

	SET @IC = [dbo].[MES_GetICWO](@id_wo) 

	IF (@IC > 1)
	BEGIN
	  SET @IC = 1
	END

	SET @OEE = ( [dbo].[MES_GetRendimientoWO](@id_wo) * @IC) * 100

	RETURN @OEE
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetPaletsParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetPaletsParticion]
(
	@idParticion NVARCHAR(101)
)
RETURNS REAL
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @PALETS as INT;


	SELECT 
		@PALETS = CONVERT(REAL,COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0))
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
	WHERE Consolidacion.ID_PARTICION = @idParticion AND ML.Clase = @CLASE

	RETURN @PALETS;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetRendimientoParticion]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetRendimientoParticion]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN

	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @producto nvarchar(50)
	DECLARE @palets AS FLOAT;
	DECLARE @velocidad_nominal AS FLOAT;
	DECLARE @OEE as FLOAT;
	DECLARE @RENDIMIENTO as FLOAT;
	DECLARE @Tiempo as FLOAT;
	DECLARE @Picos as INT;
	DECLARE @CantidadPaletsProducidos as INT;
	DECLARE @NumPaletsdePicos AS INT;

	SELECT @producto = o.IdProducto
	FROM dbo.Particiones o 
	WHERE o.Id = @id_wo

	SELECT 
		@Tiempo = COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0) / 3600
		,@CantidadPaletsProducidos = COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
	WHERE Consolidacion.ID_PARTICION = @id_wo AND ML.Clase = @CLASE
	GROUP BY ID_PARTICION
	
	SELECT @Picos = COALESCE(SUM(Cantidad),0)
	FROM dbo.Picos
	WHERE IdParticion = @id_wo

	IF(@Picos > 0) --Si hay picos le quitamos el número de palets de picos que se han dado de alta (cada registro de picos que se introduce es un palet de pico)
	BEGIN
		SELECT @NumPaletsdePicos = COUNT(IdParticion)
		FROM dbo.Picos
		WHERE IdParticion = @id_wo
		IF (@NumPaletsdePicos > @CantidadPaletsProducidos)
		BEGIN
			SET @CantidadPaletsProducidos = 0
		END
		ELSE
		BEGIN
			SET @CantidadPaletsProducidos = @CantidadPaletsProducidos - @NumPaletsdePicos;
		END
	END

	select @RENDIMIENTO = COALESCE(((@CantidadPaletsProducidos * o.EnvasesPorPalet) + (@Picos * COALESCE(o.EnvasesPorPalet/NULLIF(o.CajasPorPalet,0),0))) / NULLIF(@Tiempo * o.VelocidadNominal, 0), 0)
	FROM dbo.Particiones o
	WHERE o.Id = @id_wo 	

	RETURN @RENDIMIENTO
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetRendimientoWO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
create FUNCTION [dbo].[MES_GetRendimientoWO]
(
	-- Add the parameters for the function here
	@id_wo nvarchar(101)
)
RETURNS FLOAT
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @producto nvarchar(50)
	DECLARE @palets AS FLOAT;
	DECLARE @velocidad_nominal AS FLOAT;
	DECLARE @OEE as FLOAT;
	DECLARE @Tiempo as FLOAT;
	DECLARE @Picos as INT;
	DECLARE @CantidadPaletsProducidos as INT;
	DECLARE @NumPaletsdePicos AS INT;
	DECLARE @RENDIMIENTO as FLOAT;

	SELECT @producto = o.IdProducto
	FROM dbo.Ordenes o 
	WHERE o.Id = @id_wo

	SELECT 
		@Tiempo = COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0) / 3600
		,@CantidadPaletsProducidos = COALESCE(SUM(Consolidacion.CONTADOR_PRODUCCION), 0)
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
	WHERE Consolidacion.ID_ORDEN = @id_wo AND ML.Clase = @CLASE
	GROUP BY ID_ORDEN
	
	SELECT @Picos =  COALESCE(SUM(Cantidad),0)
	FROM dbo.Picos
	WHERE IdOrden = @id_wo

	IF(@Picos > 0) --Si hay picos le quitamos el número de palets de picos que se han dado de alta (cada registro de picos que se introduce es un palet de pico)
	BEGIN
		SELECT @NumPaletsdePicos = COUNT(IdOrden)
		FROM dbo.Picos
		WHERE IdOrden = @id_wo
		IF (@NumPaletsdePicos > @CantidadPaletsProducidos)
		BEGIN
			SET @CantidadPaletsProducidos = 0
		END
		ELSE
		BEGIN
			SET @CantidadPaletsProducidos = @CantidadPaletsProducidos - @NumPaletsdePicos;
		END
	END

	select @RENDIMIENTO = COALESCE(((@CantidadPaletsProducidos * o.EnvasesPorPalet) + (@Picos * COALESCE(o.EnvasesPorPalet/NULLIF(o.CajasPorPalet,0),0))) / NULLIF(@Tiempo * o.VelocidadNominal, 0), 0)
	FROM dbo.Ordenes o
	WHERE o.Id = @id_wo
		
	RETURN @RENDIMIENTO
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoArranqueMedio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoArranqueMedio]
(
	@numLinea INT, @idProductoEntrante NVARCHAR(100), @TipoArranque INT
)
RETURNS @tiemposMedios TABLE 
(
    -- Columns returned by the function
    TiempoMedio_1 INT NULL,
    TiempoMedio_2 INT NULL
)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamArranque INT = 3; -- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 3 => 'Número de arranques para el cálculo de los tiempos medios'
	DECLARE @ParamArranque INT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamArranque = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamArranque AND FK_LINEA_ID = @numLinea

	INSERT @tiemposMedios
	SELECT ISNULL(CONVERT(INT,AVG(TIEMPO_CAMBIO_1)/60),0) AS TiempoArranqueMedio_1, ISNULL(CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60),0) AS TiempoArranqueMedio_2
	FROM
	(SELECT TOP (@ParamArranque) 
		CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_1,0)) AS TIEMPO_CAMBIO_1, 
		CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_2, 0)) AS TIEMPO_CAMBIO_2 
	--,Ordenes.pom_order_id, Ordenes.actual_start_time AS FecIniReal,Ordenes.actual_end_time AS FecFinReal, OrdenPadre.Orden as OrdenEntrante
	FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
	INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
	INNER JOIN ( SELECT VAL AS TipoArranque, pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				WHERE pom_custom_fld_name = 'ARRANQUE_ID') TB ON TB.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdEnt ON ProdEnt.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OA%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OA%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id	
	WHERE ProdEnt.IdProducto = @idProductoEntrante AND Ordenes.pom_order_status_id IN ('Cerrada') AND Lineas.NUM_LINEA = @numLinea AND CONVERT(INT,TB.TipoArranque) = @TipoArranque
	ORDER BY Ordenes.actual_start_time desc) AS TiemposArranque

	RETURN;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoArranqueMedioPreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoArranqueMedioPreactor]
(
	@numLinea INT, @idProductoEntrante NVARCHAR(100), @TipoArranque INT
)
RETURNS INT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamArranque INT = 3;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 3 => 'Número de arranques para el cálculo de los tiempos medios'
	DECLARE @ParamArranque INT;
	DECLARE @TiempoArranqueObjetivo INT;
	DECLARE @PorcentajeInferiorId INT = 11;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 11 => 'Porcentaje inferior tiempo arranque Preactor'
	DECLARE @PorcentajeInferior FLOAT;
	DECLARE @PorcentajeSuperiorId INT = 10;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 10 => 'Porcentaje superior tiempo arranque Preactor'
	DECLARE @PorcentajeSuperior FLOAT;
	DECLARE @TiempoArranqueObjetivoMedio INT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamArranque = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamArranque AND FK_LINEA_ID = @numLinea

	SELECT @TiempoArranqueObjetivo = TIEMPO_OBJETIVO_2 * 60
	FROM COB_MSM_TIEMPOS_ARRANQUES 
	WHERE FK_LINEAS_ID = @numLinea AND ID_PRODUCTO_ENTRANTE = @idProductoEntrante AND FK_ARRANQUES_ID = @TipoArranque

	SELECT @PorcentajeInferior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeInferiorId AND FK_LINEA_ID = @numLinea

	SELECT @PorcentajeSuperior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeSuperiorId AND FK_LINEA_ID = @numLinea

	--SELECT @TiempoArranqueObjetivoMedio = ISNULL(CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60), 0)
	SELECT @TiempoArranqueObjetivoMedio = CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60)
	FROM
	(SELECT TOP (@ParamArranque) 
		CONVERT(FLOAT,TIEMPO_CAMBIO_2) AS TIEMPO_CAMBIO_2 
		--CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_2, 0)) AS TIEMPO_CAMBIO_2 
	--,Ordenes.pom_order_id, Ordenes.actual_start_time AS FecIniReal,Ordenes.actual_end_time AS FecFinReal, OrdenPadre.Orden as OrdenEntrante
	FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
	INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
	INNER JOIN ( SELECT VAL AS TipoArranque, pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				WHERE pom_custom_fld_name = 'ARRANQUE_ID') TB ON TB.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdEnt ON ProdEnt.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OA%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OA%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id	
	WHERE ProdEnt.IdProducto = @idProductoEntrante AND Ordenes.pom_order_status_id IN ('Cerrada') AND Lineas.NUM_LINEA = @numLinea AND CONVERT(INT,TB.TipoArranque) = @TipoArranque AND CONVERT(FLOAT,TIEMPO_CAMBIO_2) BETWEEN (@TiempoArranqueObjetivo - ((@PorcentajeInferior * @TiempoArranqueObjetivo) / 100)) AND (@TiempoArranqueObjetivo + ((@PorcentajeSuperior * @TiempoArranqueObjetivo) / 100))
	ORDER BY Ordenes.actual_start_time desc) AS TiemposArranque
		
	RETURN @TiempoArranqueObjetivoMedio;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoCambioMedio]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoCambioMedio]
(
	@numLinea INT, @idProductoEntrante NVARCHAR(100), @idProductoSaliente NVARCHAR(100)
)
RETURNS @tiemposMedios TABLE 
(
    -- Columns returned by the function
    TiempoMedio_1 INT NULL,
    TiempoMedio_2 INT NULL
)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamCambio INT = 2; -- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 2 => 'Número de cambios para el cálculo de los tiempos medios'
	DECLARE @ParamCambio INT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamCambio = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamCambio AND FK_LINEA_ID = @numLinea

	INSERT @tiemposMedios
	SELECT ISNULL(CONVERT(INT,AVG(TIEMPO_CAMBIO_1)/60),0) AS TiempoCambioMedio_1, ISNULL(CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60),0) AS TiempoCambioMedio_2
	FROM
	(SELECT TOP (@ParamCambio) 
		CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_1,0)) AS TIEMPO_CAMBIO_1, 
		CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_2, 0)) AS TIEMPO_CAMBIO_2 
	--,Ordenes.pom_order_id, Ordenes.actual_start_time AS FecIniReal,Ordenes.actual_end_time AS FecFinReal, OrdenPadre.Orden as OrdenEntrante
	FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
	INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OC%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OC%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
	--			WHERE pom_custom_fld_name = 'CMB_WO_1') AS OrdenArr ON OrdenArr.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
	--			WHERE pom_custom_fld_name = 'WO_ID_MASTER') AS OrdenPadre ON OrdenArr.Orden = OrdenPadre.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdSal ON ProdSal.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_2') AS ProdEnt ON ProdEnt.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN SITMesDB.dbo.POMV_ORDR OrdenesPadres on OrdenPadre.Orden =  OrdenesPadres.pom_order_id
	WHERE Ordenes.pom_order_type_id = 'WO_ENVASADO_CAMBIO' AND ProdEnt.IdProducto = @idProductoEntrante AND ProdSal.IdProducto = @idProductoSaliente AND Ordenes.pom_order_status_id IN ('Cerrada') AND Lineas.NUM_LINEA = @numLinea
	ORDER BY Ordenes.actual_start_time desc) AS TiemposCambio

	RETURN;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoCambioMedioPreactor]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoCambioMedioPreactor]
(
	@numLinea INT, @idProductoEntrante NVARCHAR(100), @idProductoSaliente NVARCHAR(100)
)
RETURNS INT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @IdParamCambio INT = 2;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 2 => 'Número de cambios para el cálculo de los tiempos medios'
	DECLARE @ParamCambio INT;
	DECLARE @TiempoCambioObjetivo INT;
	DECLARE @PorcentajeInferiorId INT = 9;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 9 => 'Porcentaje inferior tiempo cambio Preactor'
	DECLARE @PorcentajeInferior FLOAT;
	DECLARE @PorcentajeSuperiorId INT = 8;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 8 => 'Porcentaje superior tiempo cambio Preactor'
	DECLARE @PorcentajeSuperior FLOAT;
	DECLARE @TiempoCambioObjetivoMedio INT;

	-- Add the T-SQL statements to compute the return value here
	SELECT @ParamCambio = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamCambio AND FK_LINEA_ID = @numLinea

	SELECT @TiempoCambioObjetivo = TIEMPO_OBJETIVO_2 * 60
	FROM COB_MSM_TIEMPOS_CAMBIOS
	WHERE FK_LINEAS_ID = @numLinea AND ID_PRODUCTO_ENTRANTE = @idProductoEntrante AND ID_PRODUCTO_SALIENTE = @idProductoSaliente

	SELECT @PorcentajeInferior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeInferiorId AND FK_LINEA_ID = @numLinea

	SELECT @PorcentajeSuperior = VALOR_FLOAT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @PorcentajeSuperiorId AND FK_LINEA_ID = @numLinea

	--SELECT @TiempoCambioObjetivoMedio = COALESCE(CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60),0)
	SELECT @TiempoCambioObjetivoMedio = CONVERT(INT,AVG(TIEMPO_CAMBIO_2)/60)
	FROM
	(SELECT TOP (@ParamCambio)  
		CONVERT(FLOAT,TIEMPO_CAMBIO_2) AS TIEMPO_CAMBIO_2 
		--CONVERT(FLOAT,COALESCE(TIEMPO_CAMBIO_2, 0)) AS TIEMPO_CAMBIO_2 
	--,Ordenes.pom_order_id, Ordenes.actual_start_time AS FecIniReal,Ordenes.actual_end_time AS FecFinReal, OrdenPadre.Orden as OrdenEntrante
	FROM  SITMesDB.dbo.POMV_ORDR AS Ordenes 
	INNER JOIN dbo.COB_MSM_LINEAS AS Lineas ON Lineas.LINEA = Ordenes.equip_long_name 
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_1,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_1' AND pom_order_id like '%OC%') AS Tiempo1 ON Tiempo1.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT VAL as TIEMPO_CAMBIO_2,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				WHERE pom_custom_fld_name = 'TIEMPO_2' AND pom_order_id like '%OC%') AS Tiempo2 ON Tiempo2.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
	--			WHERE pom_custom_fld_name = 'CMB_WO_1') AS OrdenArr ON OrdenArr.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN (SELECT VAL as Orden,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
	--			WHERE pom_custom_fld_name = 'WO_ID_MASTER') AS OrdenPadre ON OrdenArr.Orden = OrdenPadre.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_1') AS ProdSal ON ProdSal.pom_order_id = Ordenes.pom_order_id
	LEFT JOIN (SELECT p.Nombre,p.IdProducto,pom_order_id FROM SITMesDB.dbo.POMV_ORDR_PRP 
				INNER JOIN dbo.Productos AS p ON p.IdProducto = POMV_ORDR_PRP.VAL
				WHERE pom_custom_fld_name = 'CMB_MATERIAL_2') AS ProdEnt ON ProdEnt.pom_order_id = Ordenes.pom_order_id
	--LEFT JOIN SITMesDB.dbo.POMV_ORDR OrdenesPadres on OrdenPadre.Orden =  OrdenesPadres.pom_order_id
	WHERE Ordenes.pom_order_type_id IN ('WO_ENV_CMB','WO_ENVASADO_CAMBIO') AND ProdEnt.IdProducto = @idProductoEntrante AND ProdSal.IdProducto = @idProductoSaliente AND Ordenes.pom_order_status_id IN ('Cerrada') AND Lineas.NUM_LINEA = @numLinea AND CONVERT(FLOAT,TIEMPO_CAMBIO_2) BETWEEN (@TiempoCambioObjetivo - ((@PorcentajeInferior * @TiempoCambioObjetivo) / 100)) AND (@TiempoCambioObjetivo + ((@PorcentajeSuperior * @TiempoCambioObjetivo) / 100))
	ORDER BY Ordenes.actual_start_time desc) AS TiemposCambio

	RETURN @TiempoCambioObjetivoMedio;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoPaletera]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoPaletera]
(
	@idOrdenParticion NVARCHAR(101)
)
RETURNS REAL
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @Tiempo as FLOAT;


	IF CHARINDEX('.',@idOrdenParticion) > 0
		begin
			SELECT 
				@Tiempo = CONVERT(REAL,COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0))
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_PARTICION = @idOrdenParticion AND ML.Clase = @CLASE
		end
	ELSE
		BEGIN
			SELECT 
				@Tiempo = CONVERT(REAL,COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0))
			FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
			LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
			WHERE Consolidacion.ID_ORDEN = @idOrdenParticion AND ML.Clase = @CLASE
		END

	RETURN @Tiempo;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoPaleteraOrdenTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoPaleteraOrdenTurno]
(
	@idTurno INT, @idOrden NVARCHAR(101)
)
RETURNS REAL
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @Tiempo as FLOAT;


	SELECT 
		@Tiempo = CONVERT(REAL,COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0))
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
	WHERE Consolidacion.ID_ORDEN = @idOrden AND ML.Clase = @CLASE AND Consolidacion.SHC_WORK_SCHED_DAY_PK = @idTurno

	RETURN @Tiempo;
END



GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoPaleteraParticionTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_GetTiempoPaleteraParticionTurno]
(
	@idTurno INT, @idOrden NVARCHAR(101)
)
RETURNS REAL
AS
BEGIN
	DECLARE @CLASE AS NVARCHAR(20) = 'PALETIZADORA'
	DECLARE @Tiempo as FLOAT;


	SELECT 
		@Tiempo = CONVERT(REAL,COALESCE(SUM(Consolidacion.[TIEMPO_PLANIFICADO]), 0))
	FROM COB_MSM_PROD_RESTO_MAQ_HORA AS Consolidacion
	LEFT JOIN MaquinasLineas AS ML on ML.Id = Consolidacion.ID_MAQUINA
	WHERE Consolidacion.ID_PARTICION = @idOrden AND ML.Clase = @CLASE AND Consolidacion.SHC_WORK_SCHED_DAY_PK = @idTurno

	RETURN @Tiempo;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTiempoVaciadoLinea]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[MES_GetTiempoVaciadoLinea] 
(
	@idTurno AS INT,
	@numLinea AS INT
)
RETURNS INT
AS
BEGIN
	DECLARE @IdParamtTiempoVaciadoTren INT = 14;-- COB_MSM_TIPOS_PARAMETRO.PARAMETRO_ID = 4 => 'Tiempo para considerar vaciado tren'
	DECLARE @ParamtTiempoVaciadoTren INT;
	DECLARE @TIEMPO_VACIADO_TREN AS INT = NULL;

	SELECT @ParamtTiempoVaciadoTren = VALOR_INT
	from COB_MSM_PARAMETROS_LINEA_ADMIN
	WHERE FK_PARAMETRO_ID = @IdParamtTiempoVaciadoTren AND FK_LINEA_ID = @numLinea

	IF(@idTurno = 0)
	BEGIN
		SET @TIEMPO_VACIADO_TREN = @ParamtTiempoVaciadoTren;
	END
	ELSE
		BEGIN
		SELECT @TIEMPO_VACIADO_TREN = ct.TIEMPO_VACIADO_TREN 
		FROM COB_MSM_CONSOLIDADO_TURNO ct
		WHERE ct.SHC_WORK_SCHED_DAY_PK = @idTurno
		ORDER BY FECHA_MODIF_RECALCULO_IC 
	
		IF(@TIEMPO_VACIADO_TREN IS NULL)
		BEGIN
			SET @TIEMPO_VACIADO_TREN = @ParamtTiempoVaciadoTren;
		END	
	END

	RETURN @TIEMPO_VACIADO_TREN
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_GetTurnosToUpdateIC]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[MES_GetTurnosToUpdateIC]
(
	@fIni AS DATETIME,
	@fFin AS DATETIME,
	@NumLinea as SMALLINT
)
RETURNS @OutputTbl TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL)
AS
BEGIN
	DECLARE @$IDArchiveValue AS BIGINT;
	DECLARE @fIniTurnoInferior AS DATETIME;
	DECLARE @fFinTurnoInferior AS DATETIME;
	DECLARE @ICAnterior AS FLOAT;
	DECLARE @fTurnoAnterior AS DATETIME;
	DECLARE @IdTipoTurnoAnterior AS INT;
	DECLARE @IdTurnoAnterior AS INT; 

	SELECT TOP(1) @$IDArchiveValue = [$IDArchiveValue], @fIniTurnoInferior = FECHA_INICIO, @fFinTurnoInferior = FECHA_FIN, @fTurnoAnterior = FECHA,@IdTurnoAnterior = SHC_WORK_SCHED_DAY_PK, @IdTipoTurnoAnterior = IDTIPOTURNO, @ICAnterior = IC
	FROM COB_MSM_CONSOLIDADO_TURNO
	INNER JOIN Lineas l ON l.Id = LINEA
	WHERE l.NumeroLinea = @NumLinea
	AND (
		(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
		OR
		( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
		OR
		(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
	)
	ORDER BY FECHA_INICIO

	DECLARE @TempTbl TABLE (IDArchiveValue BIGINT, ID_TURNO INT, FECHA_TURNO DATETIME, IDTIPOTURNO INT, IC REAL);
	INSERT INTO @TempTbl
	SELECT CTURNO.[$IDArchiveValue],CTURNO.SHC_WORK_SCHED_DAY_PK,CTURNO.FECHA, CTURNO.IDTIPOTURNO, IC
	FROM COB_MSM_CONSOLIDADO_TURNO AS CTURNO
	INNER JOIN Lineas l ON l.Id = LINEA  
	WHERE l.NumeroLinea = @NumLinea
	AND (
		(FECHA_INICIO >= @fIni AND FECHA_FIN <= @fFin)
		OR
		( @fIni > FECHA_INICIO AND @fIni < FECHA_FIN)
		OR
		(@fFin > FECHA_INICIO AND @fFin < FECHA_FIN)
	)
	AND [$IDArchiveValue] <> @$IDArchiveValue
	
	
	INSERT INTO 
	@OutputTbl
	SELECT IDArchiveValue, ID_TURNO, FECHA_TURNO, IDTIPOTURNO, IC
	FROM @TempTbl

	--En el caso de que un turno tenga un gap entre medias puede que tenga dos IC, en este caso su IC será el del turno anterior
	IF(@fIniTurnoInferior < @fIni)
	BEGIN		
		DECLARE @FECHA_INICIO_LIMITE_INFERIOR DATETIME;
		DECLARE @FECHA_INICIO_LIMITE_SUPERIOR DATETIME;
		SELECT @FECHA_INICIO_LIMITE_INFERIOR = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR = FECHA_INICIO_LIMITE_SUPERIOR FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fIniTurnoInferior,@NumLinea,0)

		--Si no existen gaps o el gap llega justo al inicio del turno o lo contiene actualizamos el IC
		IF(@FECHA_INICIO_LIMITE_INFERIOR IS NULL OR @FECHA_INICIO_LIMITE_SUPERIOR IS NULL OR @fIniTurnoInferior = @FECHA_INICIO_LIMITE_SUPERIOR OR (@fIni BETWEEN @FECHA_INICIO_LIMITE_SUPERIOR AND @FECHA_INICIO_LIMITE_SUPERIOR ))
		BEGIN

			INSERT INTO @OutputTbl VALUES (@$IDArchiveValue, @IdTurnoAnterior, @fTurnoAnterior, @IdTipoTurnoAnterior, @ICAnterior)
		END
		ELSE --Si hay gap comprobamos si la fecha del limite superior es igual a la fecha de inicio y el limite inferior es menor o igual que la fecha de inicio del turno en ese caso actualizamos el IC
		BEGIN
			SELECT @FECHA_INICIO_LIMITE_INFERIOR = FECHA_INICIO_LIMITE_INFERIOR, @FECHA_INICIO_LIMITE_SUPERIOR = FECHA_INICIO_LIMITE_SUPERIOR FROM [dbo].[MES_GetIntervaloFechasVaciadoLinea] (@fIniTurnoInferior,@NumLinea,1)
			IF(@FECHA_INICIO_LIMITE_SUPERIOR = @fIni AND @FECHA_INICIO_LIMITE_INFERIOR <= @fIniTurnoInferior)
			BEGIN
				INSERT INTO @OutputTbl VALUES (@$IDArchiveValue, @IdTurnoAnterior, @fTurnoAnterior, @IdTipoTurnoAnterior, @ICAnterior)
			END
		END
	END	
	ELSE 
	BEGIN
		INSERT INTO @OutputTbl VALUES (@$IDArchiveValue, @IdTurnoAnterior, @fTurnoAnterior, @IdTipoTurnoAnterior, @ICAnterior)
	END
	RETURN
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_KPI_OEE_WO]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_KPI_OEE_WO] 
(
	-- Add the parameters for the function here
@Linea varchar(100),
	@fini datetime,
	@ffin datetime
)
RETURNS numeric(18,2)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @OEE_WO numeric(18,2)
	DECLARE @TEMP_TABLE TABLE(ID int);


	
	INSERT INTO @TEMP_TABLE
    SELECT  ID
	FROM Turnos
	WHERE ([Linea] = @linea or @Linea = '') AND  @fini <= InicioTurno 
		AND @ffin >= FinTurno 
		AND LOWER(Turno) <> 'nowork'
	-- Add the T-SQL statements to compute the return value here
	SELECT @OEE_WO = TABLA.OEE_WO 
	FROM (SELECT 
			CONVERT(numeric(18,2),
				CASE WHEN SUM(TABLA_OEE_WO.CantitadRegistros) = 0 THEN 0 
				ELSE 
					SUM(TABLA_OEE_WO.OEE * (TABLA_OEE_WO.CantidadProducida/TABLA_OEE_WO.SUMA))
					/
					SUM(TABLA_OEE_WO.CantitadRegistros) END) AS OEE_WO
				FROM 
				(SELECT CASE WHEN  SUM(O.CantidadProducida) = 0 THEN 1 ELSE SUM(O.CantidadProducida) END  AS SUMA,[dbo].[MES_GetOEEParticion](O.Id) as OEE,O.CantidadProducida, COUNT(O.CantidadProducida)	AS CantitadRegistros
				  FROM [MES_MSM].[dbo].[Particiones] AS O
				  INNER JOIN (
				SELECT DISTINCT(ID_ORDEN)
				FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id AND (L.ID = @Linea or @Linea = '') 
					INNER JOIN @TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
				) AS OPROD ON OPROD.ID_ORDEN = O.IdOrdenPadre
				 GROUP BY O.Id,O.CantidadProducida) AS TABLA_OEE_WO) AS TABLA

	-- Return the result of the function
	RETURN @OEE_WO

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_KPI_OEE_WO_TABLE]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_KPI_OEE_WO_TABLE] 
(
	-- Add the parameters for the function here
	@Linea varchar(100),
	@fini datetime,
	@ffin datetime
)
RETURNS @TABLA TABLE(
  ID_LINEA VARCHAR(100),
  OEE numeric(18,2)
)
AS
BEGIN
	DECLARE @OEE_WO numeric(18,2)
	DECLARE @TEMP_TABLE TABLE(ID int);
	DECLARE @TABLE TABLE(ID_LINEA VARCHAR(100), OEE numeric(18,2))

	
	INSERT INTO @TEMP_TABLE
    SELECT DISTINCT ID
	FROM Turnos
	WHERE ([Linea] = @linea or @Linea = '') AND  @fini <= InicioTurno 
		AND @ffin >= FinTurno 
		AND LOWER(Turno) <> 'nowork'
	-- Add the T-SQL statements to compute the return value here
	
	INSERT INTO @TABLE
	SELECT TABLA.ID_LINEA, TABLA.OEE_WO AS OEE 
	FROM (SELECT 
			CONVERT(numeric(18,2),
				CASE WHEN SUM(TABLA_OEE_WO.CantitadRegistros) = 0 THEN 0 
				ELSE 
					SUM(TABLA_OEE_WO.OEE * (TABLA_OEE_WO.CantidadProducida/TABLA_OEE_WO.SUMA))
					/
					SUM(TABLA_OEE_WO.CantitadRegistros) END) AS OEE_WO,
					TABLA_OEE_WO.ID_LINEA
				FROM 
				(				
				SELECT OPROD.ID AS ID_LINEA, CASE WHEN  SUM(O.CantidadProducida) = 0 THEN 1 ELSE SUM(O.CantidadProducida) END  AS SUMA,
				case when [dbo].[MES_GetOEEParticion](O.Id) > 100 THEN 100 ELSE [dbo].[MES_GetOEEParticion](O.Id) END as OEE,O.CantidadProducida, COUNT(O.CantidadProducida)	AS CantitadRegistros
				  FROM [MES_MSM].[dbo].[Particiones] AS O
				  INNER JOIN (
				SELECT DISTINCT(ID_ORDEN),L.NumeroLinea ID
				FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id AND (L.ID = @Linea or @Linea = '') 
					INNER JOIN @TEMP_TABLE T ON T.ID =  LL.SHC_WORK_SCHED_DAY_PK 
				) AS OPROD ON OPROD.ID_ORDEN = O.IdOrdenPadre
				 GROUP BY O.Id,O.CantidadProducida,OPROD.ID ) AS TABLA_OEE_WO GROUP BY TABLA_OEE_WO.ID_LINEA) AS TABLA
  
     INSERT INTO @TABLA
	 SELECT T.ID_LINEA, T.OEE FROM @TABLE AS T
	-- Return the result of the function
	RETURN 

END


GO
/****** Object:  UserDefinedFunction [dbo].[MES_ObtenerNombreDescripcionPlanta]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_ObtenerNombreDescripcionPlanta]
(
	-- Add the parameters for the function here
	@equip_name varchar(200)
)
RETURNS varchar(255)
AS
BEGIN
	-- Declare the return variable here
	DECLARE @equip_label varchar(255);

	SELECT @equip_label = equip_label  
	FROM SITMesDB.dbo.BPM_EQUIPMENT
	WHERE equip_name = @equip_name


	RETURN @equip_label

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_ParticionActivaEnTurno]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION  [dbo].[MES_ParticionActivaEnTurno]
(
	@ordenId nvarchar(20), @IdTurno INT
)
RETURNS BIT
AS
BEGIN
	-- Declare the return variable here
	DECLARE @Estado NVARCHAR(50);
	DECLARE @ACTIVA BIT;
	DECLARE @FECHA_CAMBIO DATETIME;
	DECLARE @ENPRODUCCION BIT = 1;
	
	SELECT @Estado = EstadoAct
	FROM [dbo].[Particiones]
	WHERE Id = @ordenId
	

	IF(@Estado IN ('Iniciando','Producción','Finalizando'))
	BEGIN
		--PRINT 'Esta Iniciando , Producción o Finalizando'
		SET @ACTIVA = 1
	END
	ELSE
	BEGIN
		--PRINT 'NO Esta Iniciando , Producción o Finalizando'
		DECLARE @tmpFechasProduccion TABLE (FECHA_INICIO DATETIME, FECHA_FIN DATETIME)

		DECLARE cHistoricoOrden CURSOR FOR
		SELECT ho.FECHA_CAMBIO, e.Estado
		FROM [dbo].[COB_MSM_HISTORICO_ORDENES] ho
		inner join [dbo].[EstadosOrden] e ON e.Id= ho.ESTADO
		WHERE ho.ORDER_ID = @ordenId
		ORDER BY ho.FECHA_CAMBIO

		OPEN cHistoricoOrden

		FETCH cHistoricoOrden INTO @FECHA_CAMBIO, @Estado

		WHILE (@@FETCH_STATUS = 0 )
		BEGIN
			--SELECT @Estado AS Estado , @ENPRODUCCION as EnProduccion
			IF(@ENPRODUCCION = 1)
			BEGIN
				IF(@Estado IN ('Iniciando','Producción','Finalizando'))
				BEGIN
					INSERT INTO @tmpFechasProduccion VALUES (@FECHA_CAMBIO, NULL)
					SET @ENPRODUCCION = 0;
					--SELECT * FROM @tmpFechasProduccion
				END
			END
			ELSE
			BEGIN
				IF(@Estado NOT IN ('Iniciando','Producción','Finalizando'))
				BEGIN
					UPDATE @tmpFechasProduccion
					SET FECHA_FIN = @FECHA_CAMBIO
					WHERE FECHA_FIN IS NULL
					--SELECT * FROM @tmpFechasProduccion
					SET @ENPRODUCCION = 1;
				END
			END
			
			-- Lectura de la siguiente fila del cursor
			FETCH cHistoricoOrden INTO @FECHA_CAMBIO, @Estado

		END

		CLOSE cHistoricoOrden

		DEALLOCATE cHistoricoOrden

		DECLARE @FECHA_TURNO_INICIO DATETIME;
		DECLARE @FECHA_TURNO_FIN DATETIME;
		DECLARE @NUMREG_EN_TURNO INT;

		SELECT @FECHA_TURNO_INICIO = InicioTurno, @FECHA_TURNO_FIN = FinTurno
		FROM [dbo].[Turnos]
		WHERE Id = @IdTurno

		-----BORRAR------------------------------------------------------------------------
		--PRINT 'FIniTurno: ' + CONVERT(nvarchar(50), @FECHA_TURNO_INICIO, 103) + ' | FFinTurno: ' + CONVERT(nvarchar(50),@FECHA_TURNO_FIN, 103)
		--DECLARE @FECHA_PRINT_INICIO DATETIME;
		--DECLARE @FECHA_PRINT_FIN DATETIME;
		--DECLARE cPrint CURSOR FOR
		--SELECT FECHA_INICIO, FECHA_FIN
		--FROM @tmpFechasProduccion

		--OPEN cPrint

		--FETCH cPrint INTO @FECHA_PRINT_INICIO, @FECHA_PRINT_FIN

		--WHILE (@@FETCH_STATUS = 0 )
		--BEGIN
		--	PRINT 'FIni: ' + CONVERT(nvarchar(50), @FECHA_PRINT_INICIO, 103) + ' | FFin: ' + CONVERT(nvarchar(50),@FECHA_PRINT_FIN, 103)
			
		--	FETCH cPrint INTO @FECHA_PRINT_INICIO, @FECHA_PRINT_FIN
		--END
		--CLOSE cPrint
		--DEALLOCATE cPrint
		-----BORRAR------------------------------------------------------------------------
		

		SELECT @NUMREG_EN_TURNO = COUNT(1)
		FROM @tmpFechasProduccion
		where ((@FECHA_TURNO_INICIO BETWEEN FECHA_INICIO AND FECHA_FIN) OR (@FECHA_TURNO_FIN BETWEEN FECHA_INICIO AND FECHA_FIN))
		OR ((FECHA_INICIO BETWEEN @FECHA_TURNO_INICIO AND @FECHA_TURNO_FIN) OR (FECHA_FIN BETWEEN @FECHA_TURNO_INICIO AND @FECHA_TURNO_FIN))

		
		IF (@NUMREG_EN_TURNO > 0)
		BEGIN			
			SET @ACTIVA = 1
			--SELECT @NUMREG_EN_TURNO AS NUMREG_EN_TURNO, @ACTIVA AS ACTIVA
		END
		ELSE
		BEGIN			
			SET @ACTIVA = 0
			--SELECT @NUMREG_EN_TURNO AS NUMREG_EN_TURNO, @ACTIVA AS ACTIVA
		END
	END
	RETURN @ACTIVA;
END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_PorcentajeEnvasesNoProducidos]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[MES_PorcentajeEnvasesNoProducidos] 
(
	-- Add the parameters for the function here
	@linea varchar(100),
	@fini datetime,
	@ffin datetime
)
RETURNS int
AS
BEGIN
	-- Declare the return variable here
	DECLARE @ENP as int;
	DECLARE @TEMP_TABLE TABLE(ID int);

	
	INSERT INTO @TEMP_TABLE
    SELECT  ID
	FROM Turnos
	WHERE ([Linea] = @linea or @linea = '') AND  @fini <= InicioTurno 
		AND @ffin >= FinTurno 
		AND LOWER(Turno) <> 'nowork'

SELECT @ENP = CONVERT(float,AVG(OEE_COMPENSADO.CANTIDAD_NO_PRODUCIDA_PORCENTUAL)) 
FROM
(
SELECT TABLA_REAL.Id_Turno,
	   --TABLA_REAL.FECHA_REAL,
	   TABLA_REAL.VELOCIDAD_NOMINAL,
	   TABLA_REAL.TIEMPO_PLANIFICADO, 
	   TABLA_REAL.CONTADOR,
	   (TABLA_REAL.VELOCIDAD_NOMINAL*TABLA_REAL.TIEMPO_PLANIFICADO) AS CANTIDAD_PLANIFICADA,
	   TABLA_REAL.CONTADOR AS CANTIDAD_NO_PRODUCIDA,
	   CASE WHEN TIEMPO_PLANIFICADO = 0 OR VELOCIDAD_NOMINAL = 0 THEN 0 ELSE CONVERT(float,((TABLA_REAL.CONTADOR)*100)/CONVERT(float,(TABLA_REAL.VELOCIDAD_NOMINAL*TABLA_REAL.TIEMPO_PLANIFICADO))) END AS CANTIDAD_NO_PRODUCIDA_PORCENTUAL
FROM 
	(SELECT TABLA.Id_Turno,
			--MIN(TABLA.MIN_FECHA_INI_REAL) FECHA_REAL,
			TABLA.VELOCIDAD_NOMINAL,
			DATEDIFF(HOUR,T.InicioTurno,T.FinTurno) AS TIEMPO_PLANIFICADO, 
			SUM(TABLA.LL_CONTADOR_PRODUCCION) CONTADOR
	 FROM(
	       
			SELECT * FROM (SELECT  
				   OPROD.Id_Turno, 
				   --MIN(P.FecIniReal) MIN_FECHA_INI_REAL, 
				   VELOCIDAD_NOMINAL,
				   SUM(OPROD.CONTADOR_PRODUCCION) AS CONTADOR
			FROM [MES_MSM].[dbo].[Particiones] AS P
		    INNER JOIN (
					SELECT ID_ORDEN, 
						   LL.SHC_WORK_SCHED_DAY_PK  Id_Turno,
						   SUM(LL.CONTADOR_PRODUCCION) CONTADOR_PRODUCCION
					FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id  AND (L.ID = @linea or @linea = '')
					INNER JOIN @TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
			
					GROUP BY ID_ORDEN,  LL.SHC_WORK_SCHED_DAY_PK
			) AS OPROD ON OPROD.ID_ORDEN = P.IdOrdenPadre
		INNER JOIN COB_MSM_PARAMETROS_LINEA_PRODUCTO LP ON LP.ID_PRODUCTO = P.IdProducto  
		GROUP BY  OPROD.Id_Turno,VELOCIDAD_NOMINAL
		) AS TABLA_CONTADOR
		INNER JOIN (
		SELECT ID_ORDEN AS LL_ORDEN, 
						   LL.SHC_WORK_SCHED_DAY_PK  LL_Id_Turno,
						   SUM(LL.CONTADOR_PRODUCCION) LL_CONTADOR_PRODUCCION
					FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id  AND (L.ID = @linea or @linea = '')
					INNER JOIN @TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
				
					GROUP BY ID_ORDEN,  LL.SHC_WORK_SCHED_DAY_PK
		) AS  TJ ON TJ.LL_Id_Turno = TABLA_CONTADOR.Id_Turno 
		WHERE LL_ORDEN = '' OR LL_ORDEN IS NULL

		--INNER JOIN (SELECT TABLA_CONTADOR.ID_TURNO_SIN,
		--				   MIN(TABLA_CONTADOR.MIN_FECHA_INI_REAL_SIN) MIN_FECHA_INI_REAL_SIN 
		--				   FROM (SELECT  OPROD.Id_Turno AS  ID_TURNO_SIN, 
		--							     MIN(P.FecIniReal) MIN_FECHA_INI_REAL_SIN
		--						 FROM [MES_MSM].[dbo].[Particiones] AS P
		--						 INNER JOIN (
		--							SELECT ID_ORDEN, 
		--										   LL.SHC_WORK_SCHED_DAY_PK Id_Turno
		--							FROM COB_MSM_PROD_LLENADORA_HORA LL
		--									INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
		--									INNER JOIN LINEAS L	ON M.Linea = L.Id  AND L.ID = 'MSM.BURGOS.ENVASADO.B309'
		--									INNER JOIN #TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
		--							) AS OPROD ON OPROD.ID_ORDEN = P.IdOrdenPadre 
		--							INNER JOIN COB_MSM_PARAMETROS_LINEA_PRODUCTO LP ON LP.ID_PRODUCTO = P.IdProducto
		--							GROUP BY OPROD.ID_ORDEN, OPROD.Id_Turno,VELOCIDAD_NOMINAL
		--			) AS TABLA_CONTADOR 
		--			GROUP BY TABLA_CONTADOR.ID_TURNO_SIN
		--) AS TABLA_SIN_CONTADOR ON 
		--TABLA_CONTADOR.MIN_FECHA_INI_REAL = TABLA_SIN_CONTADOR.MIN_FECHA_INI_REAL_SIN AND 
		--TABLA_CONTADOR.Id_Turno = TABLA_SIN_CONTADOR.ID_TURNO_SIN
		
	) AS TABLA
	  INNER JOIN Turnos T ON T.Id = TABLA.Id_Turno
	GROUP BY TABLA.Id_Turno,TABLA.VELOCIDAD_NOMINAL,T.FinTurno,T.InicioTurno
   ) AS TABLA_REAL
   ) AS OEE_COMPENSADO

   RETURN @ENP

END

GO
/****** Object:  UserDefinedFunction [dbo].[MES_PorcentajeEnvasesNoProducidos_Table]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[MES_PorcentajeEnvasesNoProducidos_Table] 
(	
	-- Add the parameters for the function here
	@linea varchar(100),
	@fini datetime,
	@ffin datetime
)
RETURNS @TABLA TABLE(
  ID_LINEA int,
  PORCENTAJE float
) 
AS
BEGIN
	-- Declare the return variable here
	DECLARE @ENP as int;
	DECLARE @TEMP_TABLE TABLE(ID int);
	DECLARE @TABLE TABLE(ID_LINEA INT, PORCENTAJE FLOAT)
	
	INSERT INTO @TEMP_TABLE
    SELECT  ID
	FROM Turnos
	WHERE ([Linea] = @linea or @linea = '') AND  @fini <= InicioTurno 
		AND @ffin >= FinTurno 
		AND LOWER(Turno) <> 'nowork'

INSERT INTO @TABLE
SELECT OEE_COMPENSADO.ID_LINEA, CONVERT(float,AVG(OEE_COMPENSADO.CANTIDAD_NO_PRODUCIDA_PORCENTUAL)) as PORCENTAJE
FROM
(
SELECT TABLA_REAL.Id_Turno,
	   TABLA_REAL.ID_LINEA,
	   TABLA_REAL.VELOCIDAD_NOMINAL,
	   TABLA_REAL.TIEMPO_PLANIFICADO, 
	   TABLA_REAL.CONTADOR,
	   (TABLA_REAL.VELOCIDAD_NOMINAL*TABLA_REAL.TIEMPO_PLANIFICADO) AS CANTIDAD_PLANIFICADA,
	   TABLA_REAL.CONTADOR AS CANTIDAD_NO_PRODUCIDA,
	   CASE WHEN TIEMPO_PLANIFICADO = 0 OR VELOCIDAD_NOMINAL = 0 THEN 0 ELSE CONVERT(float,((TABLA_REAL.CONTADOR)*100)/CONVERT(float,(TABLA_REAL.VELOCIDAD_NOMINAL*TABLA_REAL.TIEMPO_PLANIFICADO))) END AS CANTIDAD_NO_PRODUCIDA_PORCENTUAL
FROM 
	(SELECT TABLA.Id_Turno,
			--MIN(TABLA.MIN_FECHA_INI_REAL) FECHA_REAL,
			TABLA.VELOCIDAD_NOMINAL,
			DATEDIFF(HOUR,T.InicioTurno,T.FinTurno) AS TIEMPO_PLANIFICADO, 
			SUM(TABLA.LL_CONTADOR_PRODUCCION) CONTADOR,
			TABLA.ID_LINEA
	 FROM(
	       
			SELECT * FROM (SELECT  
				   OPROD.Id_Turno, 
				   --MIN(P.FecIniReal) MIN_FECHA_INI_REAL, 
				   VELOCIDAD_NOMINAL,
				   SUM(OPROD.CONTADOR_PRODUCCION) AS CONTADOR,
				   OPROD.ID_LINEA AS Num_Linea
			FROM [MES_MSM].[dbo].[Particiones] AS P
		    INNER JOIN (
					SELECT ID_ORDEN, 
						   LL.SHC_WORK_SCHED_DAY_PK  Id_Turno,
						   SUM(LL.CONTADOR_PRODUCCION) CONTADOR_PRODUCCION,
						   L.NumeroLinea AS ID_LINEA
					FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id  
					INNER JOIN @TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
					WHERE (L.ID = @linea or @linea = '')
					GROUP BY ID_ORDEN,  LL.SHC_WORK_SCHED_DAY_PK,L.NumeroLinea
			) AS OPROD ON OPROD.ID_ORDEN = P.IdOrdenPadre
		INNER JOIN COB_MSM_PARAMETROS_LINEA_PRODUCTO LP ON LP.ID_PRODUCTO = P.IdProducto  
		GROUP BY  OPROD.Id_Turno,VELOCIDAD_NOMINAL,OPROD.ID_LINEA
		) AS TABLA_CONTADOR
		INNER JOIN (
		SELECT ID_ORDEN AS LL_ORDEN, 
		       L.NumeroLinea as ID_LINEA ,
						   LL.SHC_WORK_SCHED_DAY_PK  LL_Id_Turno,
						   SUM(LL.CONTADOR_PRODUCCION) LL_CONTADOR_PRODUCCION
					FROM COB_MSM_PROD_LLENADORA_HORA LL
					INNER JOIN MAQUINAS M ON M.ID = LL.ID_MAQUINA
					INNER JOIN LINEAS L	ON M.Linea = L.Id   
					INNER JOIN @TEMP_TABLE T ON LL.SHC_WORK_SCHED_DAY_PK = T.Id
				    WHERE (L.ID = @linea or @linea = '')
					GROUP BY ID_ORDEN,  LL.SHC_WORK_SCHED_DAY_PK,L.NumeroLinea 
		) AS  TJ ON TJ.LL_Id_Turno = TABLA_CONTADOR.Id_Turno AND TABLA_CONTADOR.Num_Linea = TJ.ID_LINEA
		WHERE LL_ORDEN = '' OR LL_ORDEN IS NULL

		
		
	) AS TABLA
	  INNER JOIN Turnos T ON T.Id = TABLA.Id_Turno
	GROUP BY TABLA.Id_Turno,TABLA.VELOCIDAD_NOMINAL,T.FinTurno,T.InicioTurno,TABLA.ID_LINEA
   ) AS TABLA_REAL
   ) AS OEE_COMPENSADO GROUP BY OEE_COMPENSADO.ID_LINEA

   INSERT INTO @TABLA 
   SELECT ID_LINEA, PORCENTAJE FROM @TABLE

   RETURN 
END

GO
/****** Object:  UserDefinedFunction [dbo].[ParosPerdidasHorasTurnoMaquina]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[ParosPerdidasHorasTurnoMaquina] (
@IDTURNO int, 
@MAQUINA varchar(100),
@TIPOPARO int
)
returns @HorasTurno TABLE (inicio datetime, fin datetime, segundos int)
as BEGIN


--DECLARE @IDTURNO AS INT = 175
--DECLARE @MAQUINA AS VARCHAR(100) = 'B309-EQ-LLE-01'
--DECLARE @TIPOPARO AS INT = 0

DECLARE @INICIOTURNO AS DATETIME
DECLARE @FINTURNO AS DATETIME



SELECT @INICIOTURNO=InicioTurno, @FINTURNO=FinTurno FROM TURNOS WHERE ID=@IDTURNO

--DECLARE @HorasTurno TABLE (inicio datetime, fin datetime, segundos int)
	
	DECLARE @d datetime
	DECLARE @h datetime

	SET @d = @INICIOTURNO
	SET @h = dateadd(hour,1, @d)

	--BEGIN TRANSACTION
		
		WHILE @h <= @FINTURNO
		  BEGIN
			INSERT  INTO @HorasTurno (inicio, fin, segundos)
			VALUES  (@d,@h,0)
			SET @d = @h
			SET @h = dateadd(hour,1, @d)
			
		  END		
	--COMMIT TRANSACTION

IF (@TIPOPARO = 0)
	DECLARE POINT CURSOR FOR SELECT DATEPART(HOUR, Inicio), Duracion, DATEPART(MINUTE, Inicio) * 60 + DATEPART(SECOND, Inicio) FROM PAROSPERDIDAS WHERE IdTipoParoPerdida=1 AND TURNO=@IDTURNO AND EquipoNombre=@MAQUINA
ELSE
	IF (@TIPOPARO = 1)
		DECLARE POINT CURSOR FOR SELECT DATEPART(HOUR, Inicio), Duracion, DATEPART(MINUTE, Inicio) * 60 + DATEPART(SECOND, Inicio) FROM PAROSPERDIDAS WHERE IdTipoParoPerdida=2 AND TURNO=@IDTURNO AND EquipoNombre=@MAQUINA
	ELSE
		IF (@TIPOPARO = 2)
			DECLARE POINT CURSOR FOR SELECT DATEPART(HOUR, Inicio), DuracionParosMenores, DATEPART(MINUTE, Inicio) * 60 + DATEPART(SECOND, Inicio) FROM PAROSPERDIDAS WHERE IdTipoParoPerdida=2 AND TURNO=@IDTURNO AND EquipoNombre=@MAQUINA
		ELSE
			DECLARE POINT CURSOR FOR SELECT DATEPART(HOUR, Inicio), DuracionBajaVelocidad, DATEPART(MINUTE, Inicio) * 60 + DATEPART(SECOND, Inicio) FROM PAROSPERDIDAS WHERE IdTipoParoPerdida=2 AND TURNO=@IDTURNO AND EquipoNombre=@MAQUINA


DECLARE @HORA AS INT
DECLARE @TIEMPO AS INT
DECLARE @MINUTOS AS INT
DECLARE @RESTO AS INT
DECLARE @MINUTOSRESTO AS INT

OPEN POINT

FETCH NEXT FROM POINT INTO @HORA, @TIEMPO, @MINUTOS

WHILE @@FETCH_STATUS=0
BEGIN
--PRINT('***********************************************************')
--PRIMERA HORA
SET @MINUTOSRESTO = 3600 - @MINUTOS
--PRINT('PRIMERA HORA: ' + CONVERT(VARCHAR(100),@HORA) + ' -T ' + CONVERT(VARCHAR(100),@TIEMPO) +' -M ' +CONVERT(VARCHAR(100),@MINUTOS))
IF (@TIEMPO > @MINUTOSRESTO)
BEGIN
--PRINT('HAY MAS TIEMPO QUE MINUTOS, TIEMPO: ' + CONVERT(VARCHAR(100),@TIEMPO) + ' MINUTOS: ' + CONVERT(VARCHAR(100),@MINUTOSRESTO))
UPDATE @HorasTurno
SET segundos += @MINUTOSRESTO
WHERE DATEPART(HOUR, INICIO) = @HORA

--PRINT('ACTUALIZADA HORA: ' + CONVERT(VARCHAR(100),@HORA) + ' CON ' + CONVERT(VARCHAR(100),@MINUTOSRESTO) + ' MINUTOS')
SET @TIEMPO -= @MINUTOSRESTO
END
ELSE
BEGIN
--PRINT('HAY MAS MINUTOS QUE TIEMPO')
UPDATE @HorasTurno
SET segundos += @TIEMPO
WHERE DATEPART(HOUR, INICIO) = @HORA
--PRINT('ACTUALIZADA HORA: ' + CONVERT(VARCHAR(100),@HORA) + ' CON ' + CONVERT(VARCHAR(100),@TIEMPO) + ' MINUTOS')

SET @TIEMPO = 0
END

WHILE @TIEMPO > 0
BEGIN
SET @HORA +=1
--PRINT('AUMENTAMOS HORA A ' + CONVERT(VARCHAR(100),@HORA))
IF (@TIEMPO>3600)
BEGIN
--PRINT('HAY MAS DE 60 MINUTOS EN TIEMPO')
SET @TIEMPO -= 3600
UPDATE @HorasTurno
SET segundos += 3600
WHERE DATEPART(HOUR, INICIO) = @HORA
--PRINT('ACTUALIZADA HORA: ' + CONVERT(VARCHAR(100),@HORA) + ' CON 60 MINUTOS')

END
ELSE
BEGIN
--PRINT('NO HAY MAS DE 60 MINUTOS EN TIEMPO')
UPDATE @HorasTurno
SET segundos += @TIEMPO
WHERE DATEPART(HOUR, INICIO) = @HORA
--PRINT('ACTUALIZADA HORA: ' + CONVERT(VARCHAR(100),@HORA) + ' CON ' + CONVERT(VARCHAR(100),@TIEMPO) + ' MINUTOS')
SET @TIEMPO=0
END

END

FETCH NEXT FROM POINT INTO @HORA, @TIEMPO, @MINUTOS
END

CLOSE POINT

DEALLOCATE POINT

--DROP TABLE @HorasTurno
--RETURN @HorasTurno
RETURN

END





GO
/****** Object:  UserDefinedFunction [dbo].[SIT_ObtenerNuevoCodigo]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[SIT_ObtenerNuevoCodigo]
(
	-- Add the parameters for the function here
	@codBase varchar(50)
)
RETURNS varchar
AS
BEGIN
	-- Declare the return variable here
	DECLARE @codigo varchar;

	SELECT @codigo = (SELECT TOP 1 REPLACE(pom_order_id,@codBase,'') FROM SITMesDB.dbo.POM_ORDER 
	WHERE pom_order_id like @codBase + '%' and  pom_order_id not like @codBase + '%.%'
	ORDER BY cast(REPLACE(pom_order_id,@codBase,'')as int) desc);


	RETURN @codigo + 1

END

GO
/****** Object:  UserDefinedFunction [dbo].[ToLocalDateTime]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[ToLocalDateTime](@date [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER
AS 
EXTERNAL NAME [DatabaseMSM].[UserDefinedFunctions].[ToLocalDateTime]
GO
/****** Object:  UserDefinedFunction [dbo].[ConversionesInterspec]    Script Date: 05/06/2018 15:55:39 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[ConversionesInterspec]
(              
                --Add the parameters for the function here
                @producto as nvarchar(50)
)
RETURNS TABLE 
AS
RETURN 
(
 
                
             
                               Select * from Openquery(INTERSPEC,
'SELECT    ItSpProperty.PartNo as IdProducto,
   ItSpProperty.Numeric1 as ContenedoresPalet
  FROM INTERSPC.ItSpProperty as ItSpProperty
    INNER JOIN INTERSPC.ItSc as ItSc on ItSpProperty.SectionId = ItSc.SectionId
    INNER JOIN INTERSPC.ItPropertyGroup as ItPropertyGroup on ItSpProperty.PropertyGroupId = ItPropertyGroup.PropertyGroupId
    INNER JOIN INTERSPC.ItProperty as ItProperty  on ItSpProperty.PropertyId = ItProperty.PropertyId
  where
      ItSpProperty.Revision = INTERSPC.f_get_att_rev(ItSpProperty.PartNo, NULL)
     and ItSc.Description=''Esquema de Paletización''
     and ItPropertyGroup.Description = ''Esquema de Paletización''
                and ItSpProperty.PropertyId = 700046
     and ItProperty.Description in (''Posición Fleje'',''Contenedores por Embalaje'',''Embalajes por Manto'',''Contenedores por Palet'',''Pack por Palet'',''Mantos por Palet'')'
)



)
GO
