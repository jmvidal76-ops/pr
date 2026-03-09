USE [MES_MSM]
GO

/****** Object:  Table [dbo].[SIGI_SecuenciacionMES]    Script Date: 07/06/2022 13:32:16 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SIGI_SecuenciacionMES](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[IdLinea] [nvarchar](50) NOT NULL,
	[IdProducto] [nvarchar](10) NOT NULL,
	[DescripcionProducto] [nvarchar](100) NOT NULL,
	[FechaInicioPlanificado] [datetime] NOT NULL,
	[WO] [nvarchar](20) NOT NULL,
	[EstadoWO] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_SIGI_Secuenciacion] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

