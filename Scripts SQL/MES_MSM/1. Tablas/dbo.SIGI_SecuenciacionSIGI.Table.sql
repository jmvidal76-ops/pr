USE [MES_MSM]
GO

/****** Object:  Table [dbo].[SIGI_SecuenciacionSIGI]    Script Date: 07/06/2022 13:32:41 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SIGI_SecuenciacionSIGI](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[IdEtiquetaSIGI] [int] NOT NULL,
	[IdLinea] [nvarchar](50) NOT NULL,
	[ProductoCaja] [nvarchar](10) NOT NULL,
	[Descripcion] [nvarchar](100) NOT NULL,
	[Orden] [int] NOT NULL,
 CONSTRAINT [PK_SIGI_SecuenciacionSIGI] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[SIGI_SecuenciacionSIGI] ADD  CONSTRAINT [DF_SIGI_SecuenciacionSIGI_IdEtiquetaSIGI]  DEFAULT ((0)) FOR [IdEtiquetaSIGI]
GO

