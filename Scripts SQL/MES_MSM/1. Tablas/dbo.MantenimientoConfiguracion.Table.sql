USE [MES_MSM]
GO

/****** Object:  Table [dbo].[MantenimientoConfiguracion]    Script Date: 06/06/2022 9:52:33 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MantenimientoConfiguracion](
	[ContadorOT_DOCO] [int] NOT NULL,
	[TipoOrden_DCTO] [varchar](2) NOT NULL,
	[TipoWO_TYPS] [char](1) NOT NULL,
	[PrioridadWO_PRTS] [char](1) NOT NULL,
	[ComentarioEstado_STCM] [varchar](30) NOT NULL,
	[EstadoInicial_SRST] [varchar](2) NOT NULL,
	[Subsidiaria_SUB] [varchar](8) NOT NULL,
	[TipoListaMateriales_TBM] [varchar](3) NOT NULL,
	[TipoRuta_TRT] [varchar](3) NOT NULL,
	[CodigoParalizarWO_UNCD] [char](1) NOT NULL,
	[CodigoDivisaDesde_CRCD] [varchar](3) NOT NULL,
	[CodigoDivisaPara_CRDC] [varchar](3) NOT NULL,
	[Pais_CTR] [varchar](3) NOT NULL,
	[Tasas_TXA1] [varchar](10) NOT NULL,
	[TasasCodigoExp1_EXR1] [varchar](2) NOT NULL,
	[TimeZone_TIMEZONES] [varchar](2) NOT NULL,
	[ModoDivisa_CRRM] [char](1) NOT NULL,
	[TipoRegistro_TREC] [char](1) NOT NULL,
	[Empresa_CO] [varchar](5) NOT NULL,
	[CentroCoste_MCU] [varchar](12) NOT NULL,
	[Sucursal_MMCU] [varchar](12) NOT NULL,
	[NumeroDireccion_AN8] [int] NOT NULL,
	[UsuarioIniciador_ANO] [int] NOT NULL,
	[UsuarioAsignado_ANP] [int] NOT NULL,
	[NumeroDireccionServicio_SAID] [int] NOT NULL
) ON [PRIMARY]
GO


