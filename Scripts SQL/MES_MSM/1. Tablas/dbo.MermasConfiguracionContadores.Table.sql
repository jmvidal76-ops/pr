USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MermasConfiguracionContadores]    Script Date: 22/06/2022 12:27:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MermasConfiguracionContadores](
	[IdMermaConfiguracionContador] [int] IDENTITY(1,1) NOT NULL,
	[Linea] [nvarchar](50) NOT NULL,
	[Maquina] [char](14) NOT NULL,
	[ClaseMaquina] [char](3) NOT NULL,
	[Descripcion] [nvarchar](max) NOT NULL,
	[PorcentajeMinimo] [int] NOT NULL,
	[PorcentajeMaximo] [int] NOT NULL,
	[CapturaAutomatica] [bit] NOT NULL,
	[ClaseEnvase] [char](3) NOT NULL,
	[Orden] [int] NOT NULL,
 CONSTRAINT [PK_ConfiguracionContadoresMermas] PRIMARY KEY CLUSTERED 
(
	[IdMermaConfiguracionContador] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[MermasConfiguracionContadores] ADD  CONSTRAINT [DF_ConfiguracionContadoresMermas_Descripcion]  DEFAULT ('') FOR [Descripcion]
GO

ALTER TABLE [dbo].[MermasConfiguracionContadores] ADD  CONSTRAINT [DF_ConfiguracionContadoresMermas_PorcentajeMinimo]  DEFAULT ((0)) FOR [PorcentajeMinimo]
GO

ALTER TABLE [dbo].[MermasConfiguracionContadores] ADD  CONSTRAINT [DF_ConfiguracionContadoresMermas_PorcentajeMaximo]  DEFAULT ((100)) FOR [PorcentajeMaximo]
GO

ALTER TABLE [dbo].[MermasConfiguracionContadores] ADD  CONSTRAINT [DF_ConfiguracionContadoresMermas_CapturaAutomatica]  DEFAULT ((0)) FOR [CapturaAutomatica]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Indica si el contador se ha capturado de forma automática o manual' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MermasConfiguracionContadores', @level2type=N'COLUMN',@level2name=N'CapturaAutomatica'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Lleno o Vacío' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MermasConfiguracionContadores', @level2type=N'COLUMN',@level2name=N'ClaseEnvase'
GO


