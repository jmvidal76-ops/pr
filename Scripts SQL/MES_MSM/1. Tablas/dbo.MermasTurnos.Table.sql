USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MermasTurnos]    Script Date: 22/06/2022 12:26:59 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MermasTurnos](
	[IdMermaTurno] [int] IDENTITY(1,1) NOT NULL,
	[IdTurno] [bigint] NOT NULL,
	[Linea] [nvarchar](50) NOT NULL,
	[turno] [nvarchar](15) NOT NULL,
	[fecha] [datetime] NOT NULL,
	[FechaActualizado] [datetime] NULL,
 CONSTRAINT [PK_TurnosMermas] PRIMARY KEY CLUSTERED 
(
	[IdMermaTurno] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- =============================================
-- Author:		Daniel Abad
-- Create date: 22/06/2022
-- Description:	Guarda la fecha de la última modificación en la tabla
-- =============================================
CREATE TRIGGER [dbo].[trgMermasTurnos]
   ON  [dbo].[MermasTurnos]
   AFTER INSERT,UPDATE
AS 
BEGIN
	
	SET NOCOUNT ON;

	UPDATE MermasTurnos
	SET [FechaActualizado] = SYSUTCDATETIME()
	FROM MermasTurnos Tabla
	INNER JOIN INSERTED i ON Tabla.IdMermaTurno = i.IdMermaTurno

END

