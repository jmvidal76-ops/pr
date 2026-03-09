USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MermasRegistros]    Script Date: 22/06/2022 12:24:14 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MermasRegistros](
	[IdMermaRegistro] [int] NOT NULL,
	[IdMermaTurno] [int] NOT NULL,
	[Maquina] [char](14) NOT NULL,
	[CodigoProveedor] [int] NOT NULL,
	[Proveedor] [nvarchar](250) NOT NULL,
	[Observaciones] [nvarchar](max) NOT NULL,
	[WO] [nchar](20) NOT NULL,
	[IdProducto] [int] NOT NULL,
	[DescripcionProducto] [nvarchar](max) NOT NULL,
	[FechaActualizado] [datetime] NULL,
 CONSTRAINT [PK_RegistrosMermas2] PRIMARY KEY CLUSTERED 
(
	[IdMermaRegistro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[MermasRegistros]  WITH CHECK ADD  CONSTRAINT [FK_MermasRegistros_MermasTurnos] FOREIGN KEY([IdMermaTurno])
REFERENCES [dbo].[MermasTurnos] ([IdMermaTurno])
GO

ALTER TABLE [dbo].[MermasRegistros] CHECK CONSTRAINT [FK_MermasRegistros_MermasTurnos]
GO

-- =============================================
-- Author:		Daniel Abad
-- Create date: 22/06/2022
-- Description:	Guarda la fecha de la última modificación en la tabla
-- =============================================
CREATE TRIGGER [dbo].[trgMermasRegistros]
   ON  [dbo].[MermasRegistros]
   AFTER INSERT,UPDATE
AS 
BEGIN
	
	SET NOCOUNT ON;

	UPDATE MermasRegistros
	SET [FechaActualizado] = SYSUTCDATETIME()
	FROM MermasRegistros Tabla
	INNER JOIN INSERTED i ON Tabla.IdMermaRegistro = i.IdMermaRegistro

END


