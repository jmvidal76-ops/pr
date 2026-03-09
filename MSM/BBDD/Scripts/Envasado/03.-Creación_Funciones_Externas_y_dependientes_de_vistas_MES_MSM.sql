USE [MES_MSM]
/****EXTERNAL FUNCTIONS ***/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertLocalToUtc](@LocalDate [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertLocalToUtc]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_ConvertStringToDate]    Script Date: 18/12/2017 9:32:24 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertStringToDate](@DateString [nvarchar](40))
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertStringToDate]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_ConvertUtcToLocal]    Script Date: 18/12/2017 9:32:24 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_ConvertUtcToLocal](@UtcDate [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[ConvertUtcToLocal]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_IsDaylightSaving]    Script Date: 18/12/2017 9:32:24 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_IsDaylightSaving](@LocalDate [datetime])
RETURNS [bit] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[IsDaylightSaving]
GO
/****** Object:  UserDefinedFunction [dbo].[CLR_DATETIME_IsLeapYear]    Script Date: 18/12/2017 9:32:24 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[CLR_DATETIME_IsLeapYear](@LocalDate [datetime])
RETURNS [bit] WITH EXECUTE AS CALLER, RETURNS NULL ON NULL INPUT
AS 
EXTERNAL NAME [DateCLR].[DateCLR.DateCLR].[IsLeapYear]
GO
/****** Object:  UserDefinedFunction [dbo].[ToLocalDateTime]    Script Date: 18/12/2017 9:32:24 ******/
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE FUNCTION [dbo].[ToLocalDateTime](@date [datetime])
RETURNS [datetime] WITH EXECUTE AS CALLER
AS 
EXTERNAL NAME [DatabaseMSM].[UserDefinedFunctions].[ToLocalDateTime]
GO
/****** Object:  UserDefinedFunction [dbo].[GetPkParametroMaterial]    Script Date: 18/12/2017 9:32:24 ******/
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

SELECT
	@pk = PropertyPK
FROM [SITMesDB].[dbo].[MMProperties]
WHERE PropertyID = @nomParam

RETURN @pk

END

GO
