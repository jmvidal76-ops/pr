USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MantenimientoParosRelaciones]    Script Date: 27/06/2022 14:26:10 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MantenimientoParosRelaciones](
	[IdParo] [int] NOT NULL,
	[IdMantenimientoIntervenciones] [int] NOT NULL,
 CONSTRAINT [PK_MantenimientoParosRelaciones] PRIMARY KEY CLUSTERED 
(
	[IdParo] ASC,
	[IdMantenimientoIntervenciones] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


