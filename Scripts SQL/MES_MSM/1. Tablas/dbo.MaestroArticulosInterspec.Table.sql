USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MaestroArticulosInterspec]    Script Date: 11/02/2022 13:21:47 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MaestroArticulosInterspec](
	[IdUnidadExpedicion] [bigint] NULL,
	[Revision] [numeric](8, 0) NOT NULL,
	[CodigoExpedicion] [nvarchar](20) NOT NULL,
	[DescUnidadExpedicion] [nvarchar](80) NOT NULL,
	[IdTipoFormato] [nvarchar](20) NULL,
	[DescTipoFormato] [nvarchar](80) NULL,
	[FechaUltimaModificacion] [datetime] NULL,
	[EstadoComercial] [nvarchar](60) NULL,
	[GamaComercial] [nvarchar](60) NULL,
	[DescMarca] [nvarchar](60) NULL,
	[DescTipologia] [nvarchar](60) NULL,
	[GradoAlcoholico] [float] NULL,
	[EsFormatoConRetorno] [nvarchar](80) NULL,
	[CervezaEnvasar] [nvarchar](20) NULL,
	[CPBPorPalet] [float] NULL,
	[EnvasesPorPalet] [float] NULL,
	[HectolitrosEnvase] [numeric](16, 6) NULL,
	[CajaEnvaseRetornable] [nvarchar](20) NULL,
	[DescripcionCajaEnvaseRetornable] [nvarchar](80) NULL
) ON [PRIMARY]
GO

