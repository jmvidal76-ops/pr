USE [MES_MSM]
GO

/****** Object:  Table [dbo].[SIGI_Configuracion]    Script Date: 07/06/2022 13:31:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SIGI_Configuracion](
	[Id] [int] NOT NULL,
	[IdEtiquetaSIGI] [int] NOT NULL,
	[LineaSIGI] [nvarchar](50) NOT NULL,
	[LineaMES] [nvarchar](50) NOT NULL,
	[DescripcionLinea] [nvarchar](100) NOT NULL,
	[ConPlanificacion] [bit] NOT NULL,
	[TransferenciaAutomatica] [bit] NOT NULL,
 CONSTRAINT [PK_SIGI_ConversionNombreLineas] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[SIGI_Configuracion] ADD  CONSTRAINT [DF_SIGI_ConversionNombreLineas_DescripcionLinea]  DEFAULT ('') FOR [DescripcionLinea]
GO

ALTER TABLE [dbo].[SIGI_Configuracion] ADD  CONSTRAINT [DF_SIGI_ConversionNombreLineas_ConPlanificacion]  DEFAULT ((1)) FOR [ConPlanificacion]
GO

ALTER TABLE [dbo].[SIGI_Configuracion] ADD  CONSTRAINT [DF_SIGI_ConversionNombreLineas_TransferenciaAutomatica]  DEFAULT ((0)) FOR [TransferenciaAutomatica]
GO

