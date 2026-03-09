USE [master]
GO
/****** Object:  Database [MES_MSM_ALT]     Script Date: 22/06/2018 15:43:53 ******/
CREATE DATABASE [MES_MSM_ALT]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'FormsDB', FILENAME = N'D:\# MSSQL\DATA\MES_MSM_ALT.mdf' , SIZE = 27200KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'FormsDB_log', FILENAME = N'D:\# MSSQL\DATA\MES_MSM_ALT_log.ldf' , SIZE = 8384KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [MES_MSM_ALT] SET COMPATIBILITY_LEVEL = 110
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [MES_MSM_ALT].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [MES_MSM_ALT] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET ARITHABORT OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET AUTO_CREATE_STATISTICS ON 
GO
ALTER DATABASE [MES_MSM_ALT] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [MES_MSM_ALT] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [MES_MSM_ALT] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET  DISABLE_BROKER 
GO
ALTER DATABASE [MES_MSM_ALT] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET ALLOW_SNAPSHOT_ISOLATION ON 
GO
ALTER DATABASE [MES_MSM_ALT] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [MES_MSM_ALT] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [MES_MSM_ALT] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [MES_MSM_ALT] SET  MULTI_USER 
GO
ALTER DATABASE [MES_MSM_ALT] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [MES_MSM_ALT] SET DB_CHAINING OFF 
GO
ALTER DATABASE [MES_MSM_ALT] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [MES_MSM_ALT] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
USE [MES_MSM_ALT]
GO
/****** Object:  User [MES_MSM_user]    Script Date: 22/06/2018 15:43:53 ******/
CREATE USER [MES_MSM_user] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [MES_MSM_user]
GO
ALTER ROLE [db_datareader] ADD MEMBER [MES_MSM_user]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [MES_MSM_user]
GO
/****** Object:  StoredProcedure [dbo].[checkTriggerCiclico]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerCiclico]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @date datetime	
	declare @hora integer
	declare @minutos integer
	
	set @date = GETUTCDATE()	
	select @hora = datepart(hour, @date)
	select @minutos = datepart(minute, @date)
	--CICLICLOS
 
	--consigue minuto del día le aplicamos el módulo para saber si hay que aplicarlo
	--revisamos de todos los triggers cual de ellos hacer su modulo es 0, que quiere decir que el ciclo si tiene que lanzar

	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02, location, turnoId)
	select tri.id, @date, tri.name, tri.typeID, tri.attr01, tri.attr02, tri.locID,  dbo.getturnoid(@hora)
	from dbo.TemplatesTriggers tri where tri.typeID = 'CICLICO' and (@hora *60 + @minutos) % CAST(tri.attr01 AS integer)  = 0
	and tri.deleted = 0
	and tri.status = 1
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID)
	and not exists (--comprobamos que no se haya lanzado ya este trigger
	select i.id from inboxTrigger i where i.idTrigger = tri.ID 
	and CAST(I.createdonUTC as date) = CAST(@date as date) 
	and datepart(hour, i.createdOnUTC) = @hora and datepart(minute, i.createdonUTC) = @minutos)
   
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerOrders]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerOrders]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @date datetime	
	declare @hora integer
	set @date = GETUTCDATE()	
	select @hora = datepart(hour, @date)
	--insert
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02, orderId, orderStatus, orderStatusAnt, location, turnoId, orderTypeId)
	select tri.id,@date, tri.name, tri.typeID, tri.attr01, tri.attr02,  ord.Id, ord.EstadoAct, ord.EstadoAnt, ord.equipoOrden, dbo.getturnoid(@hora),  tri.attr01
	from dbo.TemplatesTriggers tri inner join dbo.SIT_Orders ord on ord.typeID = tri.attr01 and ord.EstadoAct = tri.attr02 and ( tri.locID is null or equipoOrden like tri.locID + '%')
	where tri.typeID = 'ORDEN' and tri.deleted = 0 and tri.status = 1
	and ord.FecHorAct between dateadd(hour, -4, @date) and @date --solo hacemos las ordenes que han cambiado de estado las ultimas 4 horas
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select ibox.orderId from dbo.inboxTrigger ibox where ibox.orderStatus = ord.EstadoAct and ibox.orderStatusAnt = ord.EstadoAnt and ibox.orderId = ord.id) --miramos que ese transición de estados no se haya hecho ya
	--
	RETURN @@ROWCOUNT;
END


GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlan]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlan]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @date datetime
	declare @dia integer
	declare @hora integer
	declare @minutos integer
	declare @diaStr varchar(50)
	
	set @date = GETDATE()
	select @dia = datepart(dw,@date) -- consigue el día de la semana
	select @hora = datepart(hour, @date)
	select @minutos = datepart(minute, @date)


	select @diaStr = 
		CASE @dia  
			 WHEN 1 THEN '"value":"D"'  
			 WHEN 2 THEN '"value":"L"'  
			 WHEN 3 THEN '"value":"M"'  
			 WHEN 4 THEN '"value":"X"'  
			 WHEN 5 THEN '"value":"J"'
			 WHEN 6 THEN '"value":"V"'
			 WHEN 7 THEN '"value":"S"'
        
		END 


	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02, location, turnoId)
	select tri.id, GETUTCDATE(), tri.name, tri.typeID, tri.attr01, tri.attr02, tri.locID,  dbo.getturnoid(@hora)
	from dbo.TemplatesTriggers tri 
	where tri.typeID = 'PLANIFICADO' AND tri.deleted = 0 
	and tri.status = 1
	and tri.attr01 like '%' + @diaStr + '%'
	and datepart(hour,convert(datetime, tri.attr02)) = @hora
	and datepart(minute,convert(datetime, tri.attr02)) = @minutos
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and cast(GETUTCDATE() as date) = cast(i.createdOnUTC as date))
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanDaily]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanDaily]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @date datetime	
	declare @dateLocal datetime
	declare @hora integer
	declare @minutos integer 
	
	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)
	
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedDays, attrFrecuencyIsCycle, attrFrecuencyHour)
	select tri.id, GETUTCDATE(), tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedDays, attrFrecuencyIsCycle, attrFrecuencyHour
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 2 AND tri.attrFrecuencyIsCycle = 0 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(day, tri.attrValidFrom, @date) % tri.attrPlannedDays = 0 -- cada X dias se tiene que ejecutar
	and  datepart(hour,convert(datetime, tri.attrFrecuencyHour)) = @hora and datepart(minute,convert(datetime, tri.attrFrecuencyHour)) = @minutos -- la hora coincide con la de disparo
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and  convert(date,@date) = convert(date, i.createdOnUTC) and i.attrFrecuencyHour = tri.attrFrecuencyHour) -- no existe ningun disparo de ese tipo para el mismo día y misma configuración de hora
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanDailyCycle]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanDailyCycle]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @date datetime	
	declare @dateLocal datetime
	declare @hora integer
	declare @minutos integer 
	
	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)
	
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrFrecuencyIsCycle,  attrPlannedDays, attrFrecuencyQuantity, attrFrecuencyUnits, attrFrecuencyFrom, attrFrecuencyTo)
								select tri.id, @date, tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrFrecuencyIsCycle, attrPlannedDays, attrFrecuencyQuantity, attrFrecuencyUnits, attrFrecuencyFrom, attrFrecuencyTo
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 2 AND tri.attrFrecuencyIsCycle = 1 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(day, tri.attrValidFrom, @date) % tri.attrPlannedDays = 0 -- cada X dias se tiene que ejecutar
	and DATEDIFF(minute, tri.attrFrecuencyFrom, convert(time(5),@dateLocal)) % (tri.attrFrecuencyQuantity * tri.attrFrecuencyUnits) = 0 -- ciclicamente, (en caso que sean horas se pasa a minutos por eso se multipkica Quantity * Units)
	and convert(time(5),@dateLocal) >=  tri.attrFrecuencyFrom and  convert(time(5),@dateLocal) <= tri.attrFrecuencyTo -- la hora tiene que estar entre el Desde y Hasta configurado en la frecuencia
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and   CONVERT(VARCHAR(16),@date,120) =  convert(VARCHAR(16), i.createdOnUTC,120) ) -- no existe ningun disparo de ese tipo para el mismo día y misma hora
	
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanMonthly]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanMonthly]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @dateLocal datetime
	declare @date datetime
	declare @dia integer
	declare @hora integer
	declare @minutos integer


	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @dia = datepart(day,@date) -- consigue el día de la semana
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)

	

	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedMonthFrec, attrPlannedMonthDay, attrPlannedMonthIsHourly, attrFrecuencyHour)
					select tri.id, GETUTCDATE(), tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedMonthFrec, attrPlannedMonthDay, attrPlannedMonthIsHourly, attrFrecuencyHour
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 4 AND tri.attrPlannedMonthIsHourly = 1 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(MONTH, tri.attrValidFrom, @date) % tri.attrPlannedMonthFrec = 0 -- cada X meses se tiene que ejecutar
	and tri.attrPlannedMonthDay = @dia  --el día de hoy es igual al día planificado
	and  datepart(hour,convert(datetime, tri.attrFrecuencyHour)) = @hora and datepart(minute,convert(datetime, tri.attrFrecuencyHour)) = @minutos -- la hora coincide con la de disparo
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and  convert(date,@date) = convert(date, i.createdOnUTC) and i.attrFrecuencyHour = tri.attrFrecuencyHour and i.attrPlannedMonthDay = tri.attrPlannedMonthDay and tri.attrPlannedMonthFrec = i.attrPlannedMonthFrec ) -- no existe ningun disparo de ese tipo para el mismo mes y misma configuración de hora
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanMonthlyTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanMonthlyTypes]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @dateLocal datetime
	declare @date datetime
	declare @dia integer
	declare @hora integer
	declare @minutos integer


	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @dia = datepart(day,@date) -- consigue el día de la semana
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)


	

	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedMonthFrec, attrPlannedMonthNumDay, attrPlannedMonthDayWeek, attrPlannedMonthIsHourly, attrFrecuencyHour)
			select tri.id, GETUTCDATE(), tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedMonthFrec, attrPlannedMonthNumDay, attrPlannedMonthDayWeek, attrPlannedMonthIsHourly, attrFrecuencyHour
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 4 AND tri.attrPlannedMonthIsHourly = 0 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(MONTH, tri.attrValidFrom, @date) % tri.attrPlannedMonthFrec = 0 -- cada X meses se tiene que ejecutar
	and  datepart(hour,convert(datetime, tri.attrFrecuencyHour)) = @hora and datepart(minute,convert(datetime, tri.attrFrecuencyHour)) = @minutos -- la hora coincide con la de disparo
	and dbo.checkMonthlyTriggerAttr(@datelocal, tri.attrPlannedMonthNumDay, tri.attrPlannedMonthDayWeek) = 1 --comprobamos si la fecha es primer, segundo, tercero, cuarto de LMXJVS  día, entresemana o finde
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and  convert(date,@date) = convert(date, i.createdOnUTC) and i.attrFrecuencyHour = tri.attrFrecuencyHour and tri.attrPlannedMonthFrec = i.attrPlannedMonthFrec and i.attrPlannedMonthDayWeek = tri.attrPlannedMonthDayWeek and i.attrPlannedMonthNumDay = tri.attrPlannedMonthNumDay ) -- no existe ningun disparo de ese tipo para el mismo mes y misma configuración de hora
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanOnce]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanOnce]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;

	declare @date datetime
	set @date = GETUTCDATE()


	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedOnce) 
		select tri.id, GETUTCDATE(), tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, tri.attrPlannedOnce 
	from dbo.TemplatesTriggers tri 
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 1 AND tri.deleted = 0 and tri.status = 1
	and tri.attrPlannedOnce between dateadd(hour, -1, tri.attrPlannedOnce) and @date --La fechade disparo esta entre la fecha actual y hace una hora, Lo lanzaremos sino lo hemos lanzado antes para esta fecha atributo
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and i.attrPlannedOnce = tri.attrPlannedOnce) 
	
	RETURN @@ROWCOUNT;
END


GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanWeekly]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerPlanWeekly]
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @dateLocal datetime
	declare @date datetime
	declare @dia integer
	declare @hora integer
	declare @minutos integer
	declare @diaStr varchar(50)

	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @dia = datepart(dw,@dateLocal) -- consigue el día de la semana
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)

	select @diaStr = 
		CASE @dia  
			 WHEN 1 THEN 'D'  
			 WHEN 2 THEN 'L'  
			 WHEN 3 THEN 'M'  
			 WHEN 4 THEN 'X'  
			 WHEN 5 THEN 'J'
			 WHEN 6 THEN 'V'
			 WHEN 7 THEN 'S'
        
		END 


	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedWeeks, attrPlannedWeekDays, attrFrecuencyIsCycle, attrFrecuencyHour)
					select tri.id, GETUTCDATE(), tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedWeeks, attrPlannedWeekDays, attrFrecuencyIsCycle, attrFrecuencyHour
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 3 AND tri.attrFrecuencyIsCycle = 0 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(week, tri.attrValidFrom, @date) % tri.attrPlannedWeeks = 0 -- cada X semanas se tiene que ejecutar
	and tri.attrPlannedWeekDays like '%' + @diaStr + '%' --el día de hoy esta entre los días de la semana escogidos
	and  datepart(hour,convert(datetime, tri.attrFrecuencyHour)) = @hora and datepart(minute,convert(datetime, tri.attrFrecuencyHour)) = @minutos -- la hora coincide con la de disparo
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and  convert(date,@date) = convert(date, i.createdOnUTC) and i.attrFrecuencyHour = tri.attrFrecuencyHour) -- no existe ningun disparo de ese tipo para el mismo día y misma configuración de hora
	
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerPlanWeeklyCycle]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE procedure [dbo].[checkTriggerPlanWeeklyCycle]
as
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	sET NOCOUNT off;
	declare @dateLocal datetime
	declare @date datetime
	declare @dia integer
	declare @hora integer
	declare @minutos integer
	declare @diaStr varchar(50)

	set @date = GETUTCDATE()
	set @dateLocal = getdate()
	select @dia = datepart(dw,@dateLocal) -- consigue el día de la semana
	select @hora = datepart(hour, @dateLocal)
	select @minutos = datepart(minute, @dateLocal)

	select @diaStr = 
		CASE @dia  
			 WHEN 1 THEN 'D'  
			 WHEN 2 THEN 'L'  
			 WHEN 3 THEN 'M'  
			 WHEN 4 THEN 'X'  
			 WHEN 5 THEN 'J'
			 WHEN 6 THEN 'V'
			 WHEN 7 THEN 'S'
        
		END 
	--DECLARE @OutputTbl TABLE (ID INT)

	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attrPlannedOrderActive, attrPlannedShiftActive, attrPlannedWeeks, attrPlannedWeekDays, attrFrecuencyIsCycle,  attrFrecuencyQuantity, attrFrecuencyUnits, attrFrecuencyFrom, attrFrecuencyTo)
	--output INSERTED.ID INTO @OutputTbl(ID)
							select tri.id, @date, tri.name, tri.typeID, attrPlannedOrderActive, attrPlannedShiftActive, tri.attrPlannedWeeks, tri.attrPlannedWeekDays,  attrFrecuencyIsCycle,  attrFrecuencyQuantity, attrFrecuencyUnits, attrFrecuencyFrom, attrFrecuencyTo
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'PLANIFICADOV2' and tri.attrplannedtype = 3 AND tri.attrFrecuencyIsCycle = 1 and tri.deleted = 0 and tri.status = 1
	and @date >= tri.attrValidFrom and (tri.attrValidHasUntil = 0 or tri.attrValidUntil> @date) -- comprobar validez
	and datediff(week, tri.attrValidFrom, @date) % tri.attrPlannedWeeks = 0 -- cada X semanas se tiene que ejecutar
	and tri.attrPlannedWeekDays like '%' + @diaStr + '%' --el día de hoy esta entre los días de la semana escogidos
	and DATEDIFF(minute, tri.attrFrecuencyFrom, convert(time(5),@dateLocal)) % (tri.attrFrecuencyQuantity * tri.attrFrecuencyUnits) = 0 -- ciclicamente, (en caso que sean horas se pasa a minutos por eso se multipkica Quantity * Units)
	and convert(time(5),@dateLocal) >=  tri.attrFrecuencyFrom and  convert(time(5),@dateLocal) <= tri.attrFrecuencyTo  -- la hora tiene que estar entre el Desde y Hasta configurado en la frecuencia
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	and not exists (select i.idTrigger from dbo.inboxTrigger i where i.idTrigger = tri.ID and   CONVERT(VARCHAR(16),@date,120) =  convert(VARCHAR(16), i.createdOnUTC,120) ); -- no existe ningun disparo de ese tipo para el mismo día y misma hora
	
	--declare @result int
	--select @result = count(id) from Forms f where f.idInbox in (select ID from @OutputTbl);
	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[checkTriggerTurno]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[checkTriggerTurno]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @date datetime
	declare @dataUTC datetime
	declare @hora integer
	declare @minutos integer
	set @dataUTC = GETUTCDATE()	
	set @date = GETDATE()	
	select @hora = datepart(hour, @date)
	select @minutos = datepart(minute, @date)
	-- revisamos todos los triggers que tenemos configurados en Templates Triggers que cruzan con los turnos y están configurados para lanzarse
	-- comprobamos el no exists que no se haya lanzado este trigger antes
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02, location, shcID, turnoId)
	select tri.id, @dataUTC, tri.name, tri.typeID, tri.attr01, tri.attr02, tri.locID, shc.Id, shc.IdTipoTurno
	from SIT_SHC_Turnos shc, TemplatesTriggers tri where
	tri.typeID = 'TURNO'
	and tri.deleted = 0
	and tri.status = 1
	and tri.attr01 like '%value":"' + shc.IdTipoTurno + '%'	
	and (shc.linea like tri.locID + '%')
	and cast(shc.InicioTurno as date) = cast(@date as date) 
	-- que el inicio coincida con el de la hora y minutos actuales
	and datepart(hour, shc.InicioTurno) = @hora
	and datepart(minute, shc.InicioTurno)= @minutos
	and not exists (select i.id from inboxTrigger i where i.idTrigger = tri.id and cast(i.createdOnUTC as date) = cast(@dataUTC as date) and i.shcID = shc.id)

	RETURN @@ROWCOUNT;
END

GO
/****** Object:  StoredProcedure [dbo].[copyTemplateForm]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[copyTemplateForm]
	-- Add the parameters for the stored procedure here
	@idTemplateForm integer
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	Insert dbo.TemplatesForms (name, descript, createdOnUTC, lastModifyUTC, typeID, jsonTemplate, deleted, idDepartmentType )
	select name + ' (2)', descript, getUTCdate(), null, typeID, jsonTemplate, 0, idDepartmentType from dbo.TemplatesForms where ID = @idTemplateForm
END

GO
/****** Object:  StoredProcedure [dbo].[sendTriggerMaterial]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sendTriggerMaterial]
	@idPDV int,	 
	@clase varchar(200),
	@referencia varchar(200),
	@newDescript varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @date datetime	
	declare @hora integer
	set @date = GETUTCDATE()	
	select @hora = datepart(hour, @date)
	DECLARE @insertedInbox01 TABLE (newPk INT)
	DECLARE @insertedInbox02 TABLE (newPk INT)
	--insert
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02,  turnoId, materialId, soloLocationID, newDescript)
	output INSERTED.ID into @insertedInbox01
	select tri.id,@date, tri.name, tri.typeID, tri.attr01, tri.attr02,  dbo.getturnoid(@hora),  @referencia, @idPDV, @newDescript
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1	
	and tri.attr01 = @clase and tri.attr02 = @referencia --primero vemos si existe un trigger con clase y referencia igual
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	
	--IF @@ROWCOUNT = 0 
	--begin
		--buscamos también si existe alguno generico que lanzar
		insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02,  turnoId, materialId, soloLocationID, newDescript)
		output INSERTED.ID into @insertedInbox02
		select tri.id,@date, tri.name, tri.typeID, tri.attr01, tri.attr02,  dbo.getturnoid(@hora),  @referencia, @idPDV, @newDescript
		from dbo.TemplatesTriggers tri
		where tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1	
		and tri.attr01 = @clase and tri.attr02 = ''--primero vemos si existe un trigger con clase y referencia igual
		and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	
	--end
	--Una vez insertado en inboxTrigger será el trigger de esta tabla el responsable de instanciar todos los formularios en el PDV indicado
	--Devolvemos todos los formularios creados que tienen el idInbox
	select f.ID from dbo.Forms f, @insertedInbox01 inbox where f.idInbox = inbox.newPk
	union
	select f.ID from dbo.Forms f, @insertedInbox02 inbox where f.idInbox = inbox.newPk
END


GO
/****** Object:  StoredProcedure [dbo].[sendTriggerMaterial_old]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sendTriggerMaterial_old]
	@idPDV int,
	@matricula varchar(50),
	@idAlbaran varchar(200),
	@clase varchar(200),
	@referencia varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @date datetime	
	set @date = GETUTCDATE()	
	declare @descript varchar(100)
	set @descript = ''
	IF @matricula != '' or @idAlbaran != ''
	begin
		set @descript = 'MATRICULA: ' + @matricula + '; ALBARÁN: ' +  @idAlbaran
	end
	DECLARE @insertedPk01 TABLE (newPk INT)
	DECLARE @insertedPk02 TABLE (newPk INT)
	--buscamos si hay trigger materiales específicos con esta clase referencia
	--creamos las instancias
	insert into dbo.Forms(idFormTemplate, idInbox, idLocation, idTrigger,  idSITinfo, isValid, statusID, FormTemplate, FormTemplateXml, triggerName, name, descript, createdOnUTC)
	OUTPUT INSERTED.ID INTO @insertedPk01
	select f.ID, NULL, lft.idLoc,  lft.idTrigger, null, 0, 'PENDIENTE', f.jsonTemplate,f.xmlTemplate, 'MATERIAL' , f.name, CASE WHEN @descript = '' THEN f.descript ELSE @descript END, getUTCdate()
	from  TemplatesLocFormTri lft, TemplatesForms f, TemplatesLocations l, TemplatesTriggers tri
	
	where 	
	l.ID = @idPDV
	AND tri.attr01 = @clase and  tri.attr02 = @referencia
	and  tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1
	and tri.ID = lft.idTrigger  and lft.idTemForm = f.ID and  lft.idLoc = l.ID and f.deleted = 0 and l.deleted = 0;

	select newpk As primerins from @insertedpk01
	--IF @@ROWCOUNT = 0 
	--begin
	--comprobamos los triggers genericos
		insert into dbo.Forms(idFormTemplate, idInbox, idLocation, idTrigger,  idSITinfo, isValid, statusID, FormTemplate, FormTemplateXml, triggerName, name, descript, createdOnUTC)
		OUTPUT INSERTED.ID INTO @insertedPk02
		select f.ID, NULL, lft.idLoc,  lft.idTrigger, null, 0, 'PENDIENTE', f.jsonTemplate,f.xmlTemplate, 'MATERIAL' , f.name, CASE WHEN @descript = '' THEN f.descript ELSE @descript END, getUTCdate()
		from  TemplatesLocFormTri lft, TemplatesForms f, TemplatesLocations l, TemplatesTriggers tri
		where 	
		l.ID = @idPDV
		AND tri.attr01 = @clase and  tri.attr02 = '' --el attr02 que es la referencia tiene queser vacío para que sea un trigger generico
		and  tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1
		and tri.ID = lft.idTrigger  and lft.idTemForm = f.ID and  lft.idLoc = l.ID and f.deleted = 0 and l.deleted = 0;
		
	--end
	select newpk As primeri2 from @insertedpk02
	insert into dbo.[FormsMESData] ([idForm]      
      ,[materialId]
       )
	(select newPk, @referencia from @insertedPk01
	union
	 select newPk, @referencia from @insertedPk02)
	 --devoldemos los insertados
	(select newPk from @insertedPk01
	union
	select newPk from @insertedPk02)
END


GO
/****** Object:  StoredProcedure [dbo].[sendTriggerMaterial_TRA]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sendTriggerMaterial_TRA]
	@idPDV int,	 
	@clase varchar(200),
	@referencia varchar(200),
	@newDescript varchar(200)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT OFF;
	declare @date datetime	
	declare @hora integer
	set @date = GETUTCDATE()	
	select @hora = datepart(hour, @date)
	DECLARE @insertedInbox01 TABLE (newPk INT)
	DECLARE @insertedInbox02 TABLE (newPk INT)
	--insert
	insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02,  turnoId, materialId, soloLocationID, newDescript)
	output INSERTED.ID into @insertedInbox01
	select tri.id,@date, tri.name, tri.typeID, tri.attr01, tri.attr02,  dbo.getturnoid(@hora),  @referencia, @idPDV, @newDescript
	from dbo.TemplatesTriggers tri
	where tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1	
	and tri.attr01 = @clase and tri.attr02 = @referencia --primero vemos si existe un trigger con clase y referencia igual
	and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	
	--IF @@ROWCOUNT = 0 
	--begin
		--buscamos también si existe alguno generico que lanzar
		insert into dbo.inboxTrigger  (idTrigger, createdOnUTC, name , typeID, attr01, attr02,  turnoId, materialId, soloLocationID, newDescript)
		output INSERTED.ID into @insertedInbox02
		select tri.id,@date, tri.name, tri.typeID, tri.attr01, tri.attr02,  dbo.getturnoid(@hora),  @referencia, @idPDV, @newDescript
		from dbo.TemplatesTriggers tri
		where tri.typeID = 'MATERIAL' and tri.deleted = 0 and tri.status = 1	
		and tri.attr01 = @clase and tri.attr02 = ''--primero vemos si existe un trigger con clase y referencia igual
		and exists( select rel.idTrigger from TemplatesLocFormTri rel where rel.idTrigger = tri.ID) --existe en alguna relacion con formularios
	
	--end
	--Una vez insertado en inboxTrigger será el trigger de esta tabla el responsable de instanciar todos los formularios en el PDV indicado
	--Devolvemos todos los formularios creados que tienen el idInbox
	
	
	
	select f.ID 
				from dbo.Forms f, 
					@insertedInbox01 inbox , 
					dbo.inboxTrigger  SD 
	
				where  sd.id = inbox.newPk
				and		f.idTrigger = sd.idTrigger
	union
	select f.ID from dbo.Forms f, 
					@insertedInbox02 inbox , 
					dbo.inboxTrigger  SD 
	
				where  sd.id = inbox.newPk
				and		f.idTrigger = sd.idTrigger
END


GO
/****** Object:  UserDefinedFunction [dbo].[checkMonthlyTriggerAttr]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[checkMonthlyTriggerAttr]
(
	-- Add the parameters for the function here
	@date datetime,
	@attrPlannedMonthNumDay int,
	@attrPlannedMonthDayWeek nvarchar(10)
)
RETURNS int
AS
BEGIN
	-- Declare the return variable here
 	declare @dia int

	select @dia = 
		CASE @attrPlannedMonthDayWeek  
			 WHEN 'D'  then 1
			 WHEN 'L'  then 2
			 WHEN 'M'  then 3
			 WHEN 'X'  then 4
			 WHEN 'J' then 5
			 WHEN 'V' then 6
			 WHEN 'S' then 7        
		END 

	declare @DateStart datetime
	declare @DateEnd datetime
	declare @date2check date

	
	set @dateEnd = DATEADD(month, ((YEAR(@date) - 1900) * 12) + MONTH(@date), -1)
	-- en caso que tengamos que buscar el ultimo.
	
	if(@attrPlannedMonthNumDay=0) --el dia ha buscar es el ultimo, preparamos los parametros en caso que tengamos que buscar el ultimo
		begin
			set @DateStart = dateadd(day, -6, @dateEnd) -- si hay que buscar el ultimo miraremos en la ultima semaNa con la posicion 1
			
			select @date2check = 
				CASE @attrPlannedMonthDayWeek  
						 WHEN 'DIA'  then @DateEnd
						 WHEN 'FIN'  then dbo.getLastDayWeekendOfMonth(@date)
						 WHEN 'SEM'  then dbo.getLastDayMidWeekOfMonth(@date)
						 else dbo.getDayWeekOfMonth(1, @dia, @DateStart, @DateEnd)		 
				END 
		end
	else
		--No hay que buscar el ultimo
		begin
			set @datestart = DATEADD(month, DATEDIFF(month, 0, @date), 0) --firs day of month

			select @date2check = 
				CASE @attrPlannedMonthDayWeek  
						 WHEN 'DIA'  then DATEADD(DAY, @attrPlannedMonthNumDay-1, @DateStart)
						 WHEN 'FIN'  then dbo.getDayWeekendOfMonth(@attrPlannedMonthNumDay,  @DateStart, @DateEnd)
						 WHEN 'SEM'  then dbo.getDayMidWeekOfMonth(@attrPlannedMonthNumDay,  @DateStart, @DateEnd)
						 else dbo.getDayWeekOfMonth(@attrPlannedMonthNumDay, @dia, @DateStart, @DateEnd)		 
				END 
		end
	
	

	if(@date2check = convert (date, @date))
		return 1
	return 0
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDayMidWeekOfMonth]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDayMidWeekOfMonth]
(
	@position int,
	@dateStart datetime,
	@dateEnd datetime

)
RETURNS date
AS
BEGIN
	
	declare @firstdayOfMidWeek datetime
	declare @result datetime

	;with CTE as
	(
	select @DateStart as dt,datepart(Weekday,@DateStart) as Dw
	union all
	select dt+ 1,datepart(Weekday,dt+1)
	from CTE
	where dt< @DateEnd
	)
	,
	CTE2 as (
	select dt,Dw,ROW_NUMBER() over (partition by datepart(mm,dt),Dw order by dt) as rn from CTE)
	 select @firstdayOfMidWeek= min(dt) from CTE2 C2 where C2.Dw in (2,3,4,5,6) and rn=1
	option (maxrecursion 0)
	--con el primer dia de entre semana del mes le sumamos la posición que queremos primer, segundo, tercero o cuarto dia.
	set @result = dateadd(day, @position -1, @firstdayOfMidWeek)

	--si el resultado ha caido en fin de semana deberemos sumarle dos mas
	if(datepart(dw, @result) in (0,7))
	begin
		set @result = dateadd(day, 2, @result)
	end
	return @result
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDayWeekendOfMonth]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDayWeekendOfMonth]
(
	@position int,
	@DateStart datetime,
	@DateEnd datetime
)
RETURNS date
AS
BEGIN

	--declare @firstSaturday datetime
	--declare @firstSunday datetime

	--set @firstSaturday = dbo.getDayWeekOfMonth(@position, 7, @date)
	--set @firstSunday =dbo.getDayWeekOfMonth(@position, 1, @date)
	
	--if(@firstSunday < @firstSaturday)
	--begin
	--	return @firstSunday
	--end
	
	--return @firstSaturday
	
	declare @result datetime

	--si buscamos la primera posicion y cae el dia 1 en domingo devolvemos este sino buscaremos el primer sabado del mes dentro de la posicion indicada
	if(@position = 1 and datepart(dw, @datestart) = 1)
	begin
		return @datestart
	end
	if(@position > 1 and datepart(dw, @datestart) = 1) --si el domingo cae en 1 hay que restar uno a la poscion para que coja el sabado anterior
	begin
		set @position = @position -1
	end
	;with CTE as
	(
	select @DateStart as dt,datepart(Weekday,@DateStart) as Dw
	union all
	select dt+ 1,datepart(Weekday,dt+1)
	from CTE
	where dt< @DateEnd
	)
	,
	CTE2 as (
	select dt,Dw,ROW_NUMBER() over (partition by datepart(mm,dt),Dw order by dt) as rn from CTE)
	 select @result= min(dt) from CTE2 C2 where C2.Dw = 7 and rn=@position 
	option (maxrecursion 0)

	return @result
END

GO
/****** Object:  UserDefinedFunction [dbo].[getDayWeekOfMonth]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getDayWeekOfMonth]
(
	@position int,
	@day int, 
	 @DateStart datetime,
	 @DateEnd datetime
)
RETURNS date
AS
BEGIN

	
	declare @result datetime

	;with CTE as
	(
	select @DateStart as dt,datepart(Weekday,@DateStart) as Dw
	union all
	select dt+ 1,datepart(Weekday,dt+1)
	from CTE
	where dt< @DateEnd
	)
	,
	CTE2 as (
	select dt,Dw,ROW_NUMBER() over (partition by datepart(mm,dt),Dw order by dt) as rn from CTE)
	 select @result= dt from CTE2 C2 where C2.Dw=@day and rn=@position
	option (maxrecursion 0)

	return @result
END

GO
/****** Object:  UserDefinedFunction [dbo].[getLastDayMidWeekOfMonth]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getLastDayMidWeekOfMonth]
(
	@date datetime
)
RETURNS date
AS
BEGIN
	declare @dateEnd date
	
	set @dateEnd = DATEADD(month, ((YEAR(@date) - 1900) * 12) + MONTH(@date), -1)
	
	
	declare @dwEnd int
	set @dwEnd = datepart(dw, @dateEnd)

	if( @dwEnd = 1) --si es domingo el ultimo dia restamos dos
	begin
		return dateadd(day, -2,@dateEnd)
	end
	if( @dwEnd = 7) --si es sabado restamos 1
	begin
		return dateadd(day, -1,@dateEnd)
	end
	
	return @dateEnd
	
END

GO
/****** Object:  UserDefinedFunction [dbo].[getLastDayWeekendOfMonth]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
create FUNCTION [dbo].[getLastDayWeekendOfMonth]
(
	@date datetime
)
RETURNS date
AS
BEGIN
	declare @dateEnd date
	set @dateEnd = DATEADD(month, ((YEAR(@date) - 1900) * 12) + MONTH(@date), -1)
	declare @dwEnd int
	set @dwEnd = datepart(dw, @dateEnd)

	if( @dwEnd in (1,7)) 
	begin
		return @dateEnd
	end
	return dateadd(day, 1-@dwEnd,@dateEnd)
	
END

GO
/****** Object:  UserDefinedFunction [dbo].[getTurnoID]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[getTurnoID]
(
	@hora int
)
RETURNS  int
AS
BEGIN
	-- Manana
	if @hora >=6 and @hora < 14
	begin
		return 1
	end
	-- tarde
	if @hora >=14 and @hora < 22
	begin
		return 2
	end
	-- noche
	if @hora >=0 and @hora < 6
	begin
		return 3
	end
	if @hora >=22 and @hora <= 24
	begin
		return 3
	end
	-- Return the result of the function
	RETURN 0

END

GO
/****** Object:  Table [dbo].[DepartmentTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[DepartmentTypes](
	[ID] [int] NOT NULL,
	[name] [varchar](10) NULL,
 CONSTRAINT [PK_DepartmentTypes] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[Forms]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Forms](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idLocation] [int] NOT NULL,
	[idTrigger] [int] NULL,
	[idSITinfo] [int] NULL,
	[triggerName] [nvarchar](50) NULL,
	[name] [nvarchar](50) NOT NULL,
	[descript] [nvarchar](200) NULL,
	[statusID] [nvarchar](20) NOT NULL CONSTRAINT [DF_Forms_statusID]  DEFAULT (N'PENDIENTE'),
	[createdOnUTC] [datetime] NULL,
	[lastModifyUTC] [datetime] NULL,
	[delete] [bit] NOT NULL CONSTRAINT [DF_Forms_isDelete]  DEFAULT ((0)),
	[idInbox] [int] NULL,
	[isValid] [int] NOT NULL CONSTRAINT [DF_Forms_isValid]  DEFAULT ((0)),
	[errors] [nvarchar](max) NULL CONSTRAINT [DF_Forms_error]  DEFAULT (''),
	[idFormTemplate] [int] NULL,
	[FormTemplate] [nvarchar](max) NULL,
	[FormTemplateXML] [xml] NULL,
	[FormValues] [nvarchar](max) NULL,
	[FormValuesXML] [xml] NULL,
 CONSTRAINT [PK_Forms] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[FormsFiles]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[FormsFiles](
	[idForm] [int] NOT NULL,
	[name] [varchar](500) NOT NULL,
	[size] [int] NULL,
	[extension] [varchar](50) NULL,
	[type] [varchar](50) NULL,
	[documento] [varbinary](max) NULL,
 CONSTRAINT [PK_FormsFiles] PRIMARY KEY CLUSTERED 
(
	[idForm] ASC,
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[FormsLog]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[FormsLog](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idForm] [int] NOT NULL,
	[createdOn] [datetime] NOT NULL CONSTRAINT [DF_FormsLog_createdOn]  DEFAULT (getdate()),
	[type] [varchar](100) NULL,
	[traza] [varchar](max) NULL,
	[usuario] [varchar](100) NULL,
 CONSTRAINT [PK_FormsLog] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[FormsMESData]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormsMESData](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idForm] [int] NOT NULL,
	[orderId] [nvarchar](101) NULL,
	[orderTypeId] [nvarchar](101) NULL,
	[turnoId] [nvarchar](50) NULL,
	[shcId] [nvarchar](50) NULL,
	[lotId] [nvarchar](64) NULL,
	[materialId] [nvarchar](64) NULL,
	[location] [nvarchar](255) NULL,
 CONSTRAINT [PK_FormsMESData] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [IX_FormsMESData] UNIQUE NONCLUSTERED 
(
	[idForm] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[inboxTrigger]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[inboxTrigger](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idTrigger] [int] NULL,
	[createdOnUTC] [datetime] NULL,
	[name] [nvarchar](50) NULL,
	[typeID] [nvarchar](20) NULL,
	[attr01] [nvarchar](500) NULL,
	[attr02] [nvarchar](200) NULL,
	[location] [nvarchar](255) NULL,
	[orderId] [nvarchar](101) NULL,
	[orderTypeId] [nvarchar](101) NULL,
	[orderStatus] [nvarchar](50) NULL,
	[orderStatusAnt] [nvarchar](50) NULL,
	[turnoId] [nvarchar](50) NULL,
	[shcId] [nvarchar](50) NULL,
	[lotId] [nvarchar](64) NULL,
	[materialId] [nvarchar](64) NULL,
	[soloLocationID] [int] NULL,
	[newDescript] [nvarchar](200) NULL,
	[attrPlannedShiftActive] [int] NULL,
	[attrPlannedOrderActive] [int] NULL,
	[attrPlannedType] [int] NULL,
	[attrPlannedOnce] [datetime] NULL,
	[attrPlannedDays] [int] NULL,
	[attrPlannedWeeks] [int] NULL,
	[attrPlannedWeekDays] [nvarchar](500) NULL,
	[attrPlannedMonthIsHourly] [int] NULL,
	[attrPlannedMonthDay] [int] NULL,
	[attrPlannedMonthFrec] [int] NULL,
	[attrPlannedMonthNumDay] [int] NULL,
	[attrPlannedMonthDayWeek] [nvarchar](10) NULL,
	[attrFrecuencyIsCycle] [int] NULL,
	[attrFrecuencyHour] [time](0) NULL,
	[attrFrecuencyQuantity] [int] NULL,
	[attrFrecuencyUnits] [int] NULL,
	[attrFrecuencyFrom] [time](0) NULL,
	[attrFrecuencyTo] [time](0) NULL,
 CONSTRAINT [PK_inboxTrigger] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Status]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Status](
	[ID] [nvarchar](20) NOT NULL,
	[descript] [nvarchar](200) NULL,
 CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesForms]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesForms](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idDepartmentType] [int] NOT NULL CONSTRAINT [DF_TemplatesForms_idDepartmentType]  DEFAULT ((0)),
	[name] [nvarchar](50) NOT NULL,
	[descript] [nvarchar](200) NULL,
	[createdOnUTC] [datetime] NULL,
	[lastModifyUTC] [datetime] NULL CONSTRAINT [DF_TemplatesForms_lastModify]  DEFAULT (getdate()),
	[typeID] [nvarchar](20) NOT NULL CONSTRAINT [DF_TemplatesForms_typeID]  DEFAULT (N'ALT'),
	[jsonTemplate] [nvarchar](max) NULL,
	[xmlTemplate] [xml] NULL,
	[deleted] [bit] NULL CONSTRAINT [DF_TemplatesForms_deleted]  DEFAULT ((0)),
 CONSTRAINT [PK_TemplatesForms] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesFormsTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesFormsTypes](
	[typeID] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_TemplatesFormsTypes] PRIMARY KEY CLUSTERED 
(
	[typeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesLocations]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesLocations](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idDepartmentType] [int] NOT NULL CONSTRAINT [DF_TemplatesLocations_idDepartmentType]  DEFAULT ((0)),
	[shortName] [nvarchar](10) NULL,
	[name] [nvarchar](50) NOT NULL,
	[descript] [nvarchar](200) NULL,
	[idParent] [int] NULL,
	[idSITInherit] [bit] NULL CONSTRAINT [DF_TemplatesLocations_idSITInherit]  DEFAULT ((1)),
	[idSITLoc] [nvarchar](50) NULL CONSTRAINT [DF_TemplatesLocations_idSITLoc]  DEFAULT (''),
	[deleted] [bit] NULL CONSTRAINT [DF_TemplatesLocations_deleted]  DEFAULT ((0)),
	[createdOnUTC] [datetime] NULL,
	[lastUpdatedUTC] [datetime] NULL,
 CONSTRAINT [PK_TemplatesLocations] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesLocForms]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesLocForms](
	[idLoc] [int] NOT NULL,
	[idTemForm] [int] NOT NULL,
 CONSTRAINT [PK_LocationsForms] PRIMARY KEY CLUSTERED 
(
	[idLoc] ASC,
	[idTemForm] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesLocFormTri]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesLocFormTri](
	[idLoc] [int] NOT NULL,
	[idTemForm] [int] NOT NULL,
	[idTrigger] [int] NOT NULL,
 CONSTRAINT [PK_LocationsFormsTriggers] PRIMARY KEY CLUSTERED 
(
	[idLoc] ASC,
	[idTemForm] ASC,
	[idTrigger] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesTriggers]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesTriggers](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[idDepartmentType] [int] NOT NULL CONSTRAINT [DF_TemplatesTriggers_idDepartmentType]  DEFAULT ((0)),
	[status] [int] NOT NULL CONSTRAINT [DF_TemplatesTriggers_activated]  DEFAULT ((1)),
	[name] [nvarchar](50) NOT NULL,
	[descript] [nvarchar](200) NULL,
	[createdOnUTC] [datetime] NULL,
	[lastModifyUTC] [datetime] NULL,
	[typeID] [nvarchar](20) NOT NULL,
	[locID] [nvarchar](255) NULL,
	[attr01] [nvarchar](500) NULL,
	[attr02] [nvarchar](200) NULL,
	[attrPlannedShiftActive] [int] NULL,
	[attrPlannedOrderActive] [int] NULL,
	[attrPlannedType] [int] NULL,
	[attrPlannedOnce] [datetime] NULL,
	[attrPlannedDays] [int] NULL,
	[attrPlannedWeeks] [int] NULL,
	[attrPlannedWeekDays] [nvarchar](500) NULL,
	[attrPlannedMonthIsHourly] [int] NULL,
	[attrPlannedMonthDay] [int] NULL,
	[attrPlannedMonthFrec] [int] NULL,
	[attrPlannedMonthNumDay] [int] NULL,
	[attrPlannedMonthDayWeek] [nvarchar](10) NULL,
	[attrFrecuencyIsCycle] [int] NULL,
	[attrFrecuencyHour] [time](0) NULL,
	[attrFrecuencyQuantity] [int] NULL,
	[attrFrecuencyUnits] [int] NULL,
	[attrFrecuencyFrom] [time](0) NULL,
	[attrFrecuencyTo] [time](0) NULL,
	[attrValidHasUntil] [int] NULL,
	[attrValidFrom] [datetime] NULL,
	[attrValidUntil] [datetime] NULL,
	[deleted] [bit] NULL CONSTRAINT [DF_TemplatesTriggers_deleted]  DEFAULT ((0)),
 CONSTRAINT [PK_TemplatesTriggers] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesTriggersPlannedMonthNumDayTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesTriggersPlannedMonthNumDayTypes](
	[ID] [int] NOT NULL,
	[name] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_attrPlannedMonthNumDayTypes] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesTriggersPlannedTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesTriggersPlannedTypes](
	[ID] [int] NOT NULL,
	[name] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_TemplatesTriggersPlannedTypes] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[TemplatesTriggersTypes]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TemplatesTriggersTypes](
	[typeID] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_TemplatesTriggersTypes] PRIMARY KEY CLUSTERED 
(
	[typeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  View [dbo].[SIT_Equipment_orders]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Equipment_orders]
AS
SELECT        Equipos.equip_id, Equipos.equip_superior, Ordenes.equip_prpty_value
FROM            SITMesDb.dbo.BPM_EQUIPMENT AS Equipos INNER JOIN
                         SITMesDb.dbo.BPM_EQUIPMENT_PROPERTY AS Ordenes ON Equipos.equip_pk = Ordenes.equip_pk
WHERE        (Ordenes.equip_prpty_id = 'ORDER_ID') AND (Equipos.equip_in_plant = 1)

GO
/****** Object:  View [dbo].[SIT_Locations]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Locations]
AS
SELECT        LocPK, LocID, LocAlias, ParentLocPK, CommonLocPK, LocPath
FROM            SITMesDB.dbo.MMvLocations
WHERE        (LocAlias IS NOT NULL)

GO
/****** Object:  View [dbo].[SIT_Locations_PDVs]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Locations_PDVs]
AS
SELECT        pdv.ID, pdv.name, u.IdUbicacionLinkMes
FROM            dbo.TemplatesLocations AS pdv INNER JOIN
                         MES_MSM_Trazabilidad.UBI.tUbicacion AS u ON u.IdPDV = pdv.ID

GO
/****** Object:  View [dbo].[SIT_Lots]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Lots]
AS
SELECT        LotPK, LotID, LotName, DefVerPK, BomAltPK, MasterLotPK, ParentLotPK, Descript, InitQuantity, Quantity, UomPK, LocPK, LotStatusPK, HutPK, ValidFrom, ValidTill, 
                         SourceLotPK, TargetLotPK, CreatedBy, CreatedOn, LastUser, LastUpdate, LocalInfo, ContextID, RowGuid, RowVer, RowDeleted, RowUpdated
FROM            SITMesDB.dbo.MMLots

GO
/****** Object:  View [dbo].[SIT_Materiales]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Materiales]
AS
SELECT        Materiales.DefID AS IdMaterial, Materiales.DefName AS Nombre, Materiales.Descript AS Descripcion, Materiales.ClassID AS IdClase, Clases.Descript AS Clase, 
                         Materiales.VLabel AS Version, Materiales.DefStatusID AS Status, Materiales.UomID AS UdMedida, Materiales.EffectiveFrom AS F_EfectivoDesde, 
                         Materiales.EffectiveTill AS F_EfectivoHasta, Materiales.IsCurrent AS EnUso, Materiales.CreatedBy AS Autor, Materiales.CreatedOn AS FechaCreacion, 
                         Materiales.LastUpdate AS FechaUltCreacion, Materiales.LastUser AS ModificadoPor, Materiales.AdditionalInfo AS InfoAdicional, Materiales.TypeID AS Tipo, 
                         MTypes.TypeCD AS DescTipo, Materiales.LotUomID AS IdLote
FROM            SITMesDB.dbo.MMwDefVers AS Materiales LEFT OUTER JOIN
                         SITMesDB.dbo.MMvClasses AS Clases ON Materiales.ClassID = Clases.ClassID LEFT OUTER JOIN
                         SITMesDB.dbo.MMTypes AS MTypes ON MTypes.TypeID = Materiales.TypeID

GO
/****** Object:  View [dbo].[SIT_Orders]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Orders]
AS
SELECT        Ordenes.pom_order_id AS Id, Ordenes.pom_order_type_id AS typeID, Ordenes.matl_def_id AS IdProducto, Ordenes.pom_order_status_id AS EstadoAct, 
                         Ordenes.prev_pom_order_status_id AS EstadoAnt, MES_MSM.dbo.ParametrosLinea.idLinea AS EquipoOrden, Ordenes.RowUpdated AS FecHorAct
FROM            SITMesDB.dbo.POMV_ORDR AS Ordenes LEFT OUTER JOIN
                         MES_MSM.dbo.ParametrosLinea ON Ordenes.ppr_name = MES_MSM.dbo.ParametrosLinea.PPR LEFT OUTER JOIN
                         MES_MSM.dbo.ParametrosOrdenes ON Ordenes.pom_order_id = MES_MSM.dbo.ParametrosOrdenes.IdOrden
WHERE        Ordenes.pom_order_type_id = 'WO_ENVASADO' AND (MES_MSM.dbo.ParametrosOrdenes.IdSubOrden = 0)
UNION
SELECT        Ordenes.pom_order_id AS Id, Ordenes.pom_order_type_id AS typeID, Ordenes.matl_def_id AS IdProducto, Ordenes.pom_order_status_id AS EstadoAct, 
                         Ordenes.prev_pom_order_status_id AS EstadoAnt, Ordenes.equip_long_name AS EquipoOrden, Ordenes.RowUpdated AS FecHorAct
FROM            SITMesDB.dbo.POMV_ORDR AS Ordenes LEFT OUTER JOIN
                         MES_MSM.dbo.ParametrosLinea ON Ordenes.ppr_name = MES_MSM.dbo.ParametrosLinea.PPR LEFT OUTER JOIN
                         MES_MSM.dbo.ParametrosOrdenes ON Ordenes.pom_order_id = MES_MSM.dbo.ParametrosOrdenes.IdOrden
WHERE        Ordenes.pom_order_type_id <> 'WO_ENVASADO'

GO
/****** Object:  View [dbo].[SIT_Orders_Status]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Orders_Status]
AS
SELECT        id
FROM            SITMesDB.dbo.POMV_ORDR_STAT
WHERE        (pom_order_transition_group_id = 'MSM')

GO
/****** Object:  View [dbo].[SIT_Orders_Types]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_Orders_Types]
AS
SELECT        id, descript
FROM            SITMesDB.dbo.POMV_ORDR_TPY

GO
/****** Object:  View [dbo].[SIT_RTDS_Points]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_RTDS_Points]
AS
SELECT        Unit, Point, PointID
FROM            PPA.dbo.POINT
WHERE        (Unit = 'RTDS')

GO
/****** Object:  View [dbo].[SIT_SHC_Turnos]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_SHC_Turnos]
AS
SELECT        SCH.shc_work_sched_day_pk AS Id, REPLACE(LN.id, 'SHC_', '') AS Linea, SCH.work_date AS Fecha, DATEADD(minute, - SCH.work_start_bias, SCH.work_start) 
                         AS InicioTurno, DATEADD(minute, - SCH.work_end_bias, SCH.work_end) AS FinTurno, ISNULL(SCH.shc_shift_id, 0) AS IdTipoTurno, WT.label AS Turno
FROM            SITMesDB.dbo.SHCV_WORK_SCHED_DAY AS SCH INNER JOIN
                         SITMesDB.dbo.SHC_WORK_SCHED AS LN ON SCH.shc_work_sched_pk = LN.shc_work_sched_pk INNER JOIN
                         SITMesDB.dbo.SHC_WORKING_TIME AS WT ON WT.id = ISNULL(SCH.shc_shift_id, 0)

GO
/****** Object:  View [dbo].[SIT_TiposTurno]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[SIT_TiposTurno]
AS
SELECT        id, work_start AS Inicio, CASE isdayafter WHEN 1 THEN DATEADD(DAY, 1, work_end) ELSE work_end END AS Fin, label AS Nombre, work_start_bias AS Bias
FROM            SITMesDB.dbo.SHC_WORKING_TIME

GO
/****** Object:  View [dbo].[vFormsValues]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vFormsValues]
AS
SELECT 
    ID, 
	--tem.value('local-name(.)', 'VARCHAR(8000)') AS Value2,
	tem.value('../type[1]', 'VARCHAR(500)') AS type,
	p.value('local-name(.)', 'varchar(50)') as idField,
	tem.value('../label[1]', 'VARCHAR(500)') AS label,
	p.value('.', 'VARCHAR(8000)') AS value
	
FROM dbo.Forms 
    CROSS APPLY FormValuesXML.nodes('/formValues/*') t(p)
	CROSS APPLY FormTemplateXML.nodes('/formTemplate/fieldsTemplate/nameID') x(tem)
where tem.value('.', 'VARCHAR(8000)') = p.value('local-name(.)', 'varchar(50)') 

GO
/****** Object:  View [dbo].[vFormsValues5S]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vFormsValues5S]
AS
SELECT  f.ID
		, p.value('./ID[1]', 'int')  as idRow  
		, p.value('./label[1]', 'VARCHAR(MAX)')  as label, p.value('./id5S[1]', 'int')  as id5s, p.value('./valoration[1]', 'int')  as valoration,  p.value('./apply[1]', 'bit')  as apply, p.value('./criticality[1]', 'int')  as critically                
		, p.value('./comentarios[1]', 'VARCHAR(MAX)')  as comentario  
		, p.value('./solvedOn[1]', 'DATE')  as solvedOn
		, p.value('./linkAction[1]', 'VARCHAR(MAX)')  as linkAction
FROM          dbo.TemplatesForms tem inner join dbo.Forms f on f.idFormTemplate = tem.ID  CROSS APPLY FormValuesXML.nodes('/formValues/data5s') t (p)
where tem.idDepartmentType = 1

GO
/****** Object:  View [dbo].[vTemplatesLocForms]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vTemplatesLocForms]
AS
SELECT        r.idLoc, r.idTemForm, f.name, f.descript, f.typeID
FROM            dbo.TemplatesLocForms AS r INNER JOIN
                         dbo.TemplatesForms AS f ON r.idTemForm = f.ID

GO
/****** Object:  View [dbo].[vTemplatesLocFormTri]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Script for SelectTopNRows command from SSMS  ******/
CREATE VIEW [dbo].[vTemplatesLocFormTri]
AS
SELECT        r.idLoc, r.idTemForm, r.idTrigger, t.name, t.descript, t.typeID
FROM            dbo.TemplatesLocFormTri AS r INNER JOIN
                         dbo.TemplatesTriggers AS t ON r.idTrigger = t.ID

GO
ALTER TABLE [dbo].[Forms]  WITH CHECK ADD  CONSTRAINT [FK_Forms_inboxTrigger] FOREIGN KEY([idInbox])
REFERENCES [dbo].[inboxTrigger] ([ID])
GO
ALTER TABLE [dbo].[Forms] CHECK CONSTRAINT [FK_Forms_inboxTrigger]
GO
ALTER TABLE [dbo].[Forms]  WITH CHECK ADD  CONSTRAINT [FK_Forms_Status] FOREIGN KEY([statusID])
REFERENCES [dbo].[Status] ([ID])
GO
ALTER TABLE [dbo].[Forms] CHECK CONSTRAINT [FK_Forms_Status]
GO
ALTER TABLE [dbo].[Forms]  WITH CHECK ADD  CONSTRAINT [FK_Forms_TemplatesLocations] FOREIGN KEY([idLocation])
REFERENCES [dbo].[TemplatesLocations] ([ID])
GO
ALTER TABLE [dbo].[Forms] CHECK CONSTRAINT [FK_Forms_TemplatesLocations]
GO
ALTER TABLE [dbo].[FormsFiles]  WITH CHECK ADD  CONSTRAINT [FK_FormsFiles_Forms] FOREIGN KEY([idForm])
REFERENCES [dbo].[Forms] ([ID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[FormsFiles] CHECK CONSTRAINT [FK_FormsFiles_Forms]
GO
ALTER TABLE [dbo].[FormsLog]  WITH CHECK ADD  CONSTRAINT [FK_FormsLog_Forms] FOREIGN KEY([idForm])
REFERENCES [dbo].[Forms] ([ID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[FormsLog] CHECK CONSTRAINT [FK_FormsLog_Forms]
GO
ALTER TABLE [dbo].[FormsMESData]  WITH CHECK ADD  CONSTRAINT [FK_FormsMESData_Forms] FOREIGN KEY([idForm])
REFERENCES [dbo].[Forms] ([ID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[FormsMESData] CHECK CONSTRAINT [FK_FormsMESData_Forms]
GO
ALTER TABLE [dbo].[TemplatesForms]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesForms_DepartmentTypes] FOREIGN KEY([idDepartmentType])
REFERENCES [dbo].[DepartmentTypes] ([ID])
GO
ALTER TABLE [dbo].[TemplatesForms] CHECK CONSTRAINT [FK_TemplatesForms_DepartmentTypes]
GO
ALTER TABLE [dbo].[TemplatesForms]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesForms_TemplatesFormsTypes] FOREIGN KEY([typeID])
REFERENCES [dbo].[TemplatesFormsTypes] ([typeID])
GO
ALTER TABLE [dbo].[TemplatesForms] CHECK CONSTRAINT [FK_TemplatesForms_TemplatesFormsTypes]
GO
ALTER TABLE [dbo].[TemplatesLocations]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesLocations_DepartmentTypes] FOREIGN KEY([idDepartmentType])
REFERENCES [dbo].[DepartmentTypes] ([ID])
GO
ALTER TABLE [dbo].[TemplatesLocations] CHECK CONSTRAINT [FK_TemplatesLocations_DepartmentTypes]
GO
ALTER TABLE [dbo].[TemplatesLocations]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesLocations_TemplatesLocations] FOREIGN KEY([idParent])
REFERENCES [dbo].[TemplatesLocations] ([ID])
GO
ALTER TABLE [dbo].[TemplatesLocations] CHECK CONSTRAINT [FK_TemplatesLocations_TemplatesLocations]
GO
ALTER TABLE [dbo].[TemplatesLocForms]  WITH CHECK ADD  CONSTRAINT [FK_LocationsForms_TemplatesForms] FOREIGN KEY([idTemForm])
REFERENCES [dbo].[TemplatesForms] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TemplatesLocForms] CHECK CONSTRAINT [FK_LocationsForms_TemplatesForms]
GO
ALTER TABLE [dbo].[TemplatesLocForms]  WITH CHECK ADD  CONSTRAINT [FK_LocationsForms_TemplatesLocations] FOREIGN KEY([idLoc])
REFERENCES [dbo].[TemplatesLocations] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TemplatesLocForms] CHECK CONSTRAINT [FK_LocationsForms_TemplatesLocations]
GO
ALTER TABLE [dbo].[TemplatesLocFormTri]  WITH CHECK ADD  CONSTRAINT [FK_LocationsFormsTriggers_LocationsForms] FOREIGN KEY([idLoc], [idTemForm])
REFERENCES [dbo].[TemplatesLocForms] ([idLoc], [idTemForm])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TemplatesLocFormTri] CHECK CONSTRAINT [FK_LocationsFormsTriggers_LocationsForms]
GO
ALTER TABLE [dbo].[TemplatesLocFormTri]  WITH CHECK ADD  CONSTRAINT [FK_LocationsFormsTriggers_TemplatesTriggers] FOREIGN KEY([idTrigger])
REFERENCES [dbo].[TemplatesTriggers] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TemplatesLocFormTri] CHECK CONSTRAINT [FK_LocationsFormsTriggers_TemplatesTriggers]
GO
ALTER TABLE [dbo].[TemplatesTriggers]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesTriggers_attrPlannedMonthNumDayTypes] FOREIGN KEY([attrPlannedMonthNumDay])
REFERENCES [dbo].[TemplatesTriggersPlannedMonthNumDayTypes] ([ID])
GO
ALTER TABLE [dbo].[TemplatesTriggers] CHECK CONSTRAINT [FK_TemplatesTriggers_attrPlannedMonthNumDayTypes]
GO
ALTER TABLE [dbo].[TemplatesTriggers]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesTriggers_DepartmentTypes] FOREIGN KEY([idDepartmentType])
REFERENCES [dbo].[DepartmentTypes] ([ID])
GO
ALTER TABLE [dbo].[TemplatesTriggers] CHECK CONSTRAINT [FK_TemplatesTriggers_DepartmentTypes]
GO
ALTER TABLE [dbo].[TemplatesTriggers]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesTriggers_TemplatesTriggersPlannedTypes] FOREIGN KEY([attrPlannedType])
REFERENCES [dbo].[TemplatesTriggersPlannedTypes] ([ID])
GO
ALTER TABLE [dbo].[TemplatesTriggers] CHECK CONSTRAINT [FK_TemplatesTriggers_TemplatesTriggersPlannedTypes]
GO
ALTER TABLE [dbo].[TemplatesTriggers]  WITH CHECK ADD  CONSTRAINT [FK_TemplatesTriggers_TemplatesTriggersTypes] FOREIGN KEY([typeID])
REFERENCES [dbo].[TemplatesTriggersTypes] ([typeID])
GO
ALTER TABLE [dbo].[TemplatesTriggers] CHECK CONSTRAINT [FK_TemplatesTriggers_TemplatesTriggersTypes]
GO
/****** Object:  Trigger [dbo].[saveMESData]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE TRIGGER [dbo].[saveMESData]
   ON  [dbo].[Forms]
   AFTER INSERT
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	insert into dbo.[FormsMESData] ([idForm]
      ,[orderId]
      ,[orderTypeId]
      ,[turnoId]
      ,[shcId]
      ,[lotId]
      ,[materialId]
      ,[location])
	select i.ID, t.orderId, t.orderTypeId, t.turnoId, t.shcId, t.lotId, t.materialId, t.location 
	from inserted i, inboxTrigger t where i.idInbox = t.ID
    -- Insert statements for trigger here

END

GO
/****** Object:  Trigger [dbo].[createFormInstances]    Script Date: 22/06/2018 15:43:53 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE TRIGGER [dbo].[createFormInstances]
   ON  [dbo].[inboxTrigger]
   AFTER insert
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
    
	-- si le pasamos una nueva descripcion en el inbox no le ponemos las del template del formulario.
	insert into dbo.Forms(idFormTemplate, idInbox, idLocation, idTrigger,  idSITinfo, isValid, statusID, FormTemplate, FormTemplateXml, triggerName, name, descript, createdOnUTC)
	select f.ID, i.ID, lft.idLoc,  lft.idTrigger, null, 0, 'PENDIENTE', f.jsonTemplate,f.xmlTemplate, i.name, f.name, case when i.newDescript is not null then i.newDescript else f.descript end, getUTCdate()
	from inserted i
	inner join TemplatesLocFormTri lft on lft.idTrigger = i.idTrigger 
	inner join TemplatesForms f on f.ID = lft.idTemForm and f.deleted = 0
	inner join TemplatesLocations l on l.ID = lft.idLoc and l.deleted = 0
	
	where 
	(l.ID = i.soloLocationID or i.soloLocationID is null) -- si el campo soloLocationID tiene un id de una localización, solo se lanzan los trigger de esta localización
	--and lft.idTrigger = i.idTrigger and lft.idTemForm = f.ID and  l.ID  
	--si es planificado, tiene activa la opcion de buscar orden activa y su localizacion no es nulla sbuscaremos si hay una orden activa para esa ubicacion MES
	and (i.typeID <> 'PLANIFICADOV2' or  isnull(i.attrPlannedOrderActive,-1) = -1 or i.attrPlannedOrderActive IN (select (CASE WHEN count(relpdv.id)>=1 THEN 1 ELSE 0 END) from  dbo.SIT_locations_PDVs relpdv where relpdv.id = l.ID and  relpdv.IdUbicacionLinkMes in (select eo.equip_id from dbo.SIT_Equipment_orders eo where eo.equip_prpty_value <> '')))
	--si es planificado, tiene activa la opcion de buscar yutno activa y su localizacion no es nulla sbuscaremos si hay un turno activo para esa ubicacion MES 
	and (i.typeID <> 'PLANIFICADOV2' or  isnull(i.attrPlannedShiftActive,-1) = -1 or i.attrPlannedShiftActive IN (select (CASE WHEN count(shc.id)>=1 THEN 1 ELSE 0 END) from dbo.SIT_SHC_Turnos shc ,dbo.SIT_locations_PDVs relpdv where relpdv.id = l.ID and relpdv.IdUbicacionLinkMes like shc.Linea +'%' and shc.IdTipoTurno <> 0 and i.createdOnUTC >= shc.InicioTurno and i.createdonUtC < shc.FinTurno))
	
END

GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "Equipos"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 232
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "Ordenes"
            Begin Extent = 
               Top = 6
               Left = 270
               Bottom = 135
               Right = 508
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Equipment_orders'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Equipment_orders'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[31] 4[5] 2[13] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "MMvLocations (SITMesDB.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 211
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 19
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 2370
         Width = 1500
         Width = 1500
         Width = 4650
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Locations'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Locations'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "pdv"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 213
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "u"
            Begin Extent = 
               Top = 6
               Left = 251
               Bottom = 135
               Right = 493
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Locations_PDVs'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Locations_PDVs'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[21] 4[40] 2[10] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "MMLots (SITMesDB.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Lots'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Lots'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[25] 4[26] 2[14] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "Materiales"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "Clases"
            Begin Extent = 
               Top = 6
               Left = 246
               Bottom = 135
               Right = 416
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "MTypes"
            Begin Extent = 
               Top = 6
               Left = 1078
               Bottom = 135
               Right = 1248
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 20
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 2850
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
E' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Materiales'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane2', @value=N'nd
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Materiales'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=2 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Materiales'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[7] 4[24] 2[31] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = -96
         Left = 0
      End
      Begin Tables = 
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 17
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 2460
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[41] 4[3] 2[26] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "POMV_ORDR_STAT (SITMesDB.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 295
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 18
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders_Status'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders_Status'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[23] 4[26] 2[18] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "POMV_ORDR_TPY (SITMesDB.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 231
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders_Types'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_Orders_Types'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[24] 4[30] 2[15] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "POINT (PPA.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 4050
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_RTDS_Points'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_RTDS_Points'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "SCH"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 254
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "LN"
            Begin Extent = 
               Top = 6
               Left = 292
               Bottom = 135
               Right = 509
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "WT"
            Begin Extent = 
               Top = 6
               Left = 547
               Bottom = 135
               Right = 749
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 2385
         Width = 3660
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_SHC_Turnos'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_SHC_Turnos'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "SHC_WORKING_TIME (SITMesDB.dbo)"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 135
               Right = 240
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_TiposTurno'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'SIT_TiposTurno'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vFormsValues'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vFormsValues'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vFormsValues5S'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vFormsValues5S'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "r"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 101
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "f"
            Begin Extent = 
               Top = 6
               Left = 246
               Bottom = 135
               Right = 416
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vTemplatesLocForms'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vTemplatesLocForms'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "r"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 118
               Right = 208
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "t"
            Begin Extent = 
               Top = 6
               Left = 246
               Bottom = 135
               Right = 416
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
      Begin ColumnWidths = 9
         Width = 284
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
         Width = 1500
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vTemplatesLocFormTri'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vTemplatesLocFormTri'
GO
USE [master]
GO
ALTER DATABASE [MES_MSM_ALT] SET  READ_WRITE 
GO
