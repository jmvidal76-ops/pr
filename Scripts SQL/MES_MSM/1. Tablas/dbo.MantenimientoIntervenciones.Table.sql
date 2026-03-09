USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MantenimientoIntervenciones]    Script Date: 22/06/2022 10:58:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MantenimientoIntervenciones](
	[IdMantenimientoIntervenciones] [int] IDENTITY(1,1) NOT NULL,
	[OT] [int] NOT NULL,
	[Estado] [varchar](2) NOT NULL,
	[Linea] [nvarchar](50) NOT NULL,
	[Maquina] [char](12) NOT NULL,
	[EquipoConstructivo] [char](12) NOT NULL,
	[IdTipoAveria] [int] NOT NULL,
	[DescripcionAveria] [nvarchar](30) NOT NULL,
	[DescripcionProblema] [nvarchar](80) NOT NULL,
	[ComentarioCierre] [nvarchar](max) NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
	[FechaCierre] [datetime] NULL,
	[Usuario] [nvarchar](128) NOT NULL,
	[FechaActualizado] [datetime] NULL,
 CONSTRAINT [PK_MantenimientoIntervenciones] PRIMARY KEY CLUSTERED 
(
	[IdMantenimientoIntervenciones] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones] ADD  CONSTRAINT [DF_MantenimientoIntervenciones_ComentarioCierre]  DEFAULT ('') FOR [ComentarioCierre]
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones]  WITH CHECK ADD  CONSTRAINT [FK_MantenimientoIntervenciones_AspNetUsers] FOREIGN KEY([Usuario])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones] CHECK CONSTRAINT [FK_MantenimientoIntervenciones_AspNetUsers]
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones]  WITH CHECK ADD  CONSTRAINT [FK_MantenimientoIntervenciones_EquiposConstructivosEnvasado] FOREIGN KEY([EquipoConstructivo])
REFERENCES [dbo].[EquiposConstructivosEnvasado] ([CodigoEquipo])
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones] CHECK CONSTRAINT [FK_MantenimientoIntervenciones_EquiposConstructivosEnvasado]
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones]  WITH CHECK ADD  CONSTRAINT [FK_MantenimientoIntervenciones_TipoAveria] FOREIGN KEY([IdTipoAveria])
REFERENCES [dbo].[TipoAveria] ([IdTipoAveria])
GO

ALTER TABLE [dbo].[MantenimientoIntervenciones] CHECK CONSTRAINT [FK_MantenimientoIntervenciones_TipoAveria]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Identificador del sistema JDE' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MantenimientoIntervenciones', @level2type=N'COLUMN',@level2name=N'OT'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Estado conforme al sistema JDE. Empieza en M0 (creado) y termina en M5 (cerrado), una vez actualizado en JDE el estado M5, pasará a ser M6 en MES para evitar nuevas actualizaciones' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MantenimientoIntervenciones', @level2type=N'COLUMN',@level2name=N'Estado'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Usuario de MES que inicio la solicitud' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MantenimientoIntervenciones', @level2type=N'COLUMN',@level2name=N'Usuario'
GO

-- =============================================
-- Author:		Daniel Abad
-- Create date: 22/06/2022
-- Description:	Guarda la fecha de la última modificación en la tabla
-- =============================================
CREATE TRIGGER trgMantenimientoIntervencionesActualizado 
   ON MantenimientoIntervenciones
   AFTER INSERT, UPDATE
AS 
BEGIN
	
	SET NOCOUNT ON;

	UPDATE MantenimientoIntervenciones
	SET [FechaActualizado] = SYSUTCDATETIME()
	FROM MantenimientoIntervenciones Tabla
	INNER JOIN INSERTED i ON Tabla.IdMantenimientoIntervenciones = i.IdMantenimientoIntervenciones

END
GO

