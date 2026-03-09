USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MantenimientoCambiosEstados]    Script Date: 06/06/2022 9:50:25 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MantenimientoCambiosEstados](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[OT] [int] NOT NULL,
	[Estado] [varchar](2) NOT NULL,
	[Fecha] [datetime] NOT NULL,
 CONSTRAINT [PK_MantenimientoCambiosEstados] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


