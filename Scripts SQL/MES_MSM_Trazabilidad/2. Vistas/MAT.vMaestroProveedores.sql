USE [MES_MSM_Trazabilidad]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

DROP VIEW [MAT].[vMaestroProveedores]

GO

CREATE VIEW [MAT].[vMaestroProveedores]
AS

SELECT	ISNULL(ROW_NUMBER() OVER(ORDER BY IdProveedor Asc), -1) AS Id,
		IdProveedor, upper(min(Proveedor)) as Proveedor
FROM	[MAT].[vMaestroEANProveedorJDE]
GROUP BY IdProveedor

GO




