USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MermasContadores]    Script Date: 22/06/2022 12:20:44 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MermasContadores](
	[IdMermaContador] [int] IDENTITY(1,1) NOT NULL,
	[IdMermaConfiguracionContador] [int] NOT NULL,
	[IdMermaRegistro] [int] NOT NULL,
	[Valor] [decimal](18, 4) NOT NULL,
	[Unidad] [nchar](20) NOT NULL,
	[Justificacion] [nvarchar](max) NOT NULL,
	[FechaActualizado] [datetime] NULL,
 CONSTRAINT [PK_RegistrosMermas] PRIMARY KEY CLUSTERED 
(
	[IdMermaContador] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[MermasContadores] ADD  CONSTRAINT [DF_RegistrosMermas_Justificacion]  DEFAULT ('') FOR [Justificacion]
GO

ALTER TABLE [dbo].[MermasContadores]  WITH CHECK ADD  CONSTRAINT [FK_MermasContadores_MermasConfiguracionContadores] FOREIGN KEY([IdMermaConfiguracionContador])
REFERENCES [dbo].[MermasConfiguracionContadores] ([IdMermaConfiguracionContador])
GO

ALTER TABLE [dbo].[MermasContadores] CHECK CONSTRAINT [FK_MermasContadores_MermasConfiguracionContadores]
GO

ALTER TABLE [dbo].[MermasContadores]  WITH CHECK ADD  CONSTRAINT [FK_MermasContadores_MermasRegistros] FOREIGN KEY([IdMermaRegistro])
REFERENCES [dbo].[MermasRegistros] ([IdMermaRegistro])
GO

ALTER TABLE [dbo].[MermasContadores] CHECK CONSTRAINT [FK_MermasContadores_MermasRegistros]
GO

-- =============================================
-- Author:		Daniel Abad
-- Create date: 22/06/2022
-- Description:	Guarda la fecha de la última modificación en la tabla
-- =============================================
CREATE TRIGGER [dbo].[trgMermasContadores]
   ON  [dbo].[MermasContadores]
   AFTER INSERT,UPDATE
AS 
BEGIN
	
	SET NOCOUNT ON;

	UPDATE MermasContadores
	SET [FechaActualizado] = SYSUTCDATETIME()
	FROM MermasContadores Tabla
	INNER JOIN INSERTED i ON Tabla.IdMermaContador = i.IdMermaContador

END


