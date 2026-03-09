USE [MES_MSM]
GO

/****** Object:  StoredProcedure [dbo].[MES_ImportarEtiquetasPalets]    Script Date: 14/02/2022 9:41:39 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		Daniel Salván García
-- Create date: 13/01/2022
-- Description:	Procedimiento para importar las etiquetas de JDE o de SIGI y gestionarlas en la tabla t.producciones
-- =============================================
CREATE PROCEDURE [dbo].[MES_ImportarEtiquetasPalets] 
	-- Add the parameters for the stored procedure here
	-- Las fechas hay que pasarlas en hora local
	@FechaInicio NVARCHAR(19) = '1900-01-01 00:00:00', -- fecha de inicio del periodo contemplado
	@FechaFin NVARCHAR(19) = '9999-12-31 23:59:59', -- fecha de fin del periodo contemplado
	@SIGI bit = 0 -- Boleando para determinar si el origen de datos es JDE (0) o SIGI (1)

WITH RECOMPILE	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	-- Declaración de variables comunes
	DECLARE @FechaInicioMES DATETIME
	DECLARE @FechaFinMES DATETIME
	DECLARE @FechaInicioJDE CHAR(8)
	DECLARE @FechaFinJDE CHAR(8)

	DECLARE @LineasJDE NVARCHAR(4000)
	DECLARE @NumRegistros INT
	DECLARE @Openquery NVARCHAR(4000)

	DECLARE @tEtiquetasJDE TABLE (ETQSSC NVARCHAR(50) NOT NULL PRIMARY KEY, ETLITM NVARCHAR(50), ETQLIN NVARCHAR(50), ETQFEC NVARCHAR(50), ETQHOR NVARCHAR(50), FECHAHORA DATETIME)
	DECLARE @tEtiquetasMES TABLE (SSCC NVARCHAR(50) NOT NULL PRIMARY KEY, IdStatus INT)


	-- En JDE, la fecha y la hora están almacenados en dos campos distintos (ETQFEC y ETQHOR). El filtro para obtener las etiquetas de JDE será sólo por fecha, por tanto, hay que considerar días naturales completos.
	-- Actualización de la fecha de inicio y de fin conforme al formato de JDE.
	SET @FechaInicioJDE = CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112);
	SET @FechaFinJDE = CONVERT(NVARCHAR,DATEADD(day,1,@FechaFin),112);

	-- Actualización de la fecha de inicio y de fin a UTC para buscar en la tabla tProduccion y como se cruzará con los datos de JDE, hay que considerar días naturales completos.
	SET @FechaInicioMES =  [dbo].[CLR_DATETIME_ConvertLocalToUtc] (CONVERT(DATETIME, CONVERT(NVARCHAR,DATEADD(day,0,@FechaInicio),112), 112));
	SET @FechaFinMES = [dbo].[CLR_DATETIME_ConvertLocalToUtc] (CONVERT(DATETIME, CONVERT(NVARCHAR,DATEADD(day,1,@FechaFin),112), 112));

	-- Conversión de las líenas de JDE a XML para usarlo en la openquery
	SET @LineasJDE = (SELECT STUFF
	(
		(
			SELECT DISTINCT ',' + [LineaProducionJDE] 
			FROM [dbo].[RelacionETQMESLineaJDE]
			FOR XML PATH('')
		),
		 1, 1, ''
	));

	-- Añade doble comillas para poder pasar las líneas como parámetro
	SET @LineasJDE = REPLACE (@LineasJDE,',',''''',''''');

	-- Creación de la Openquery para obtener los datos de JDE del fichero de etiquetas de producto acabado - F57ETJ16
	SET @Openquery = 'SELECT * FROM OPENQUERY(JDE,
		''SELECT ETQSSC
				,ETLITM
				,ETQLIN
				,ETQFEC
				,ETQHOR
				,CHAR(DATE(TIMESTAMP_FORMAT (CHAR(ETQFEC),''''YYYYMMDD''''))) || '''' '''' || ETQHOR AS FECHAHORA
  
		FROM PRODDTA.F57ETJ16 
		WHERE ETQFEC >= ' + @FechaInicioJDE + '
		AND ETQFEC < ' + @FechaFinJDE + '
		AND ETQLIN IN (''''' + @LineasJDE + ''''')
		ORDER BY ETQSSC
		'')';

	-- Si el origen de datos es JDE
	IF @SIGI = 0 
	BEGIN

		-- Declaración de variables específicas del origen de datos de JDE
		DECLARE @ListadoSSCCPicos NVARCHAR(4000)
		DECLARE @tPicosJDE TABLE (DEQSCC NVARCHAR(18),DELITM NVARCHAR(25), DEUORG NVARCHAR(15))
		DECLARE @tResultadoMerge TABLE (Referencia NVARCHAR(100), SSCC NVARCHAR (50))	

		-- Obtención de los datos de JDE
		INSERT INTO @tEtiquetasJDE EXEC(@Openquery)
		SET @NumRegistros = @@ROWCOUNT;
		PRINT CONCAT ('Número de etiquetas de palets obtenidas de JDE: ', @NumRegistros); 
	
		-- Comprobación que la consulta ha devuelto datos
		IF @NumRegistros <> 0 
		BEGIN

			-- Las etiquetas en JDE están en hora local se pasan a UTC
			UPDATE @tEtiquetasJDE SET FECHAHORA = [dbo].[CLR_DATETIME_ConvertLocalToUtc](FECHAHORA);

			-- Se realiza un MERGE entre la tabla tProducción y las tabla de las etiquetas de JDE
 			MERGE INTO [MES_MSM_Trazabilidad].[TRA].[tProduccion] AS Destino
			USING @tEtiquetasJDE AS Origen
			ON (Destino.SSCC = Origen.ETQSSC)
			WHEN NOT MATCHED BY TARGET THEN
				-- Se insertan las etiquetas que están en JDE y no están en tProduccion
				INSERT (Referencia, EtiquetaCreatedAt, SSCC, IdStatus, CreatedAt, CreatedBy, Consolidado, LastModifiedMesAt, LastModifiedMes, Procesado, LineaProduccionJDE)
				VALUES (Origen.ETLITM, Origen.FECHAHORA, Origen.ETQSSC, 1, GETUTCDATE(),'Sistema', 0, GETUTCDATE(),'Obtenida desde JDE', 0, Origen.ETQLIN)
			WHEN NOT MATCHED BY SOURCE AND (Destino.EtiquetaCreatedAt >= @FechaInicioMES AND Destino.EtiquetaCreatedAt < @FechaFinMES AND Destino.IdStatus = 1) THEN
				-- Se actualizan las etiquetas que están en tProducción y que no están en JDE
				UPDATE SET IdStatus = 0
				,ParticionWO = NULL
				,idLotMes = NULL
				,LastModifiedMesAt = GETUTCDATE()
				,LastModifiedMes = 'Desaparecida en JDE'
			OUTPUT inserted.Referencia, Inserted.SSCC INTO @tResultadoMerge;
			PRINT CONCAT('Número de registros insertados o actualizados en tProduccion: ', @@ROWCOUNT);

			-- Obtención del número de registros de etiquetas de picos
			SET @NumRegistros = (SELECT COUNT (*) FROM @tResultadoMerge WHERE Referencia = '000');
		
			-- Comprobación que existen etiquetas de picos
			IF @NumRegistros > 0 
			BEGIN

				-- Obtención de los codígos SSCC de las etiquetas de picos
				SET @ListadoSSCCPicos = (SELECT STUFF
				(
					(
						SELECT  ',' + [SSCC] 
						FROM @tResultadoMerge
						WHERE Referencia = '000'
						FOR XML PATH('')
					),
						1, 1, ''
				));

				-- Añade doble comillas para poder pasar las líneas como parámetro
				SET @ListadoSSCCPicos = REPLACE (@ListadoSSCCPicos,',',''''',''''');

				-- Creación de la Openquery para obtener los datos de JDE del fichero de etiquetas DESADV - F57ET008
				SET @Openquery = 'SELECT * FROM OPENQUERY(JDE,
				''SELECT DEQSSC
						,DELITM
						,DEUORG
				FROM PRODDTA.F57ET008 
				WHERE DEQSSC IN (''''' + @ListadoSSCCPicos + ''''')
				'')';

				-- Obtención de los datos de JDE
				INSERT INTO @tPicosJDE EXEC(@Openquery)
				SET @NumRegistros = @@ROWCOUNT;
				PRINT CONCAT ('Número de etiquetas de picos obtenidas de JDE: ', @NumRegistros); 

				-- Comprobación que la consulta ha devuelto datos
				IF @NumRegistros <> 0 
				BEGIN

					-- Actualización de los registros en la tabla tProduccion
					UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccion]  
						SET Picos = (Temporal.DEUORG / 100)
						,CodigoCaja = Temporal.DELITM
						FROM [MES_MSM_Trazabilidad].[TRA].[tProduccion] AS Destino
						INNER JOIN @tPicosJDE AS Temporal ON Temporal.DEQSCC = Destino.SSCC
					PRINT CONCAT ('Número registros de palets de picos actualizados en tproducción: ', @@ROWCOUNT);

				END;
			END;
		END;
	END;

	-- Si el origen de datos es SIGI
	ELSE
	BEGIN

		-- Declaración variables específicas del origen de datos de SIGI
		DECLARE @FechaInicioSIGI VARCHAR(40)
		DECLARE @FechaFinSIGI VARCHAR(40)
		DECLARE @tEtiquetasSIGI TABLE (SSCC VARCHAR(20), FECHAHORA VARCHAR(40), CODPROD VARCHAR(20), CANTIDAD INT, TREN INT, FECHAHORAUTC DATETIME)
		DECLARE @tEtiquetasMESInsertadas TABLE (SSCC NVARCHAR(50) NOT NULL PRIMARY KEY, IdStatus INT)

		-- En SIGI la fecha y la hora está almacenada en un campo de tipo VARCHAR(40) en formato YYYYMMDDHHMMSS
		SET @FechaInicioSIGI = CONCAT(CONVERT(CHAR(8),DATEADD(day,0,@FechaInicio),112), '000000');
		SET @FechaFinSIGI = CONCAT(CONVERT(CHAR(8),DATEADD(day,1,@FechaFin),112), '000000');

		-- Obtención de las etiquetas de SIGI enviadas a JDE y comprendidas en el intervalo
		-- La columna TREN en SIGI está definida como un entero mientras que en JDE y en la tabla tproducción está definida como un char.
		-- Se hace un tratamiento para añadir el caracter 0 si la longitud del campo TREN es 1 ya que los códigos de Solán empiezan por 0.
		INSERT INTO @tEtiquetasSIGI (SSCC, FECHAHORA, CODPROD, CANTIDAD, TREN)
		SELECT [SSCC]  
			  ,[FECHAHORA]
			  ,[CODPROD]
			  ,[CANTIDAD]
			  ,IIF(LEN([TREN]) = 1, ('0' + CAST ([TREN] AS CHAR)), CAST ([TREN] AS CHAR))	 
		FROM [SIGI].[SIGI].[dbo].[PALETS] 
		WHERE FECHAHORA >= @FechaInicioSIGI AND FECHAHORA < @FechaFinSIGI AND ENVIADO_JDE = 1 AND TREN IN (SELECT CAST([LineaProducionJDE] AS INTEGER) FROM [dbo].[RelacionETQMESLineaJDE]);
		SET @NumRegistros = @@ROWCOUNT;
		PRINT CONCAT ('Número de etiquetas de palets obtenidas de SIGI: ', @NumRegistros); 
	
		-- Comprobación que la consulta ha devuelto datos
		IF @NumRegistros <> 0 
		BEGIN

			-- Se actualiza el campo FECHAHORAUTC de la tabla @tEtiquetasSIGI conviertiendo a formato DATETIME y en formato UTC
			UPDATE @tEtiquetasSIGI SET FECHAHORAUTC = [dbo].[CLR_DATETIME_ConvertLocalToUtc] (CONVERT (DATETIME, CONCAT (CONVERT (DATE, LEFT(FECHAHORA, 8), 108), ' ',  SUBSTRING (FECHAHORA, 9, 2), ':',SUBSTRING (FECHAHORA, 11, 2), ':',RIGHT(FECHAHORA,2)  ), 20))

			--Se obtienen las etiquetas de la tabla tProduccion
			INSERT INTO @tEtiquetasMES (SSCC, IdStatus)
			SELECT SSCC, IdStatus		 
			FROM [MES_MSM_Trazabilidad].[TRA].[tProduccion]
			WHERE EtiquetaCreatedAt >= @FechaInicioMES AND EtiquetaCreatedAt < @FechaFinMES;

			-- Se inserta en la tabla tProduccion las etiquetas de SIGI que no se encuentran en tProduccion
			INSERT INTO [MES_MSM_Trazabilidad].[TRA].[tProduccion] (Referencia, EtiquetaCreatedAt, SSCC, IdStatus, CreatedAt, CreatedBy, LastModifiedMesAt, LastModifiedMes, Picos, Consolidado, Procesado, LineaProduccionJDE)
			OUTPUT INSERTED.SSCC, INSERTED.IdStatus 
			INTO @tEtiquetasMESInsertadas
			SELECT S.CODPROD, S.FECHAHORAUTC, S.SSCC, 2, GETUTCDATE(),'Sistema', GETUTCDATE(),'Enviada desde SIGI', IIF(S.CANTIDAD > 0, S.CANTIDAD, NULL), 0, 0, S.TREN
			FROM @tEtiquetasSIGI as S LEFT JOIN @tEtiquetasMES as M
			ON S.SSCC = M.SSCC
			WHERE M.SSCC IS NULL
			PRINT CONCAT('Número de registros insertados en tProduccion: ', @@ROWCOUNT);

			-- Se añaden los registros insertados en la tabla @tEtiquetasMES
			INSERT INTO @tEtiquetasMES SELECT * FROM @tEtiquetasMESInsertadas

			-- Obtención de los datos de JDE
			INSERT INTO @tEtiquetasJDE EXEC(@Openquery)
			SET @NumRegistros = @@ROWCOUNT;
			PRINT CONCAT ('Número de etiquetas de palets obtenidas de JDE: ', @NumRegistros); 

			-- Comprobación que la consulta ha devuelto datos
			IF @NumRegistros <> 0 
			BEGIN

				---- Actualización de las etiquetas que están en la tabla de tProduccion y que están en JDE
				UPDATE @tEtiquetasMES
					SET IdStatus = 1
					FROM @tEtiquetasMES as M 
					INNER JOIN @tEtiquetasJDE as J ON M.SSCC = J.ETQSSC
				
				-- Actualización de las etiquetas que están en la tabla de tProduccion, que se han leido en JDE y que han desaparecido en JDE
				UPDATE @tEtiquetasMES
					SET IdStatus = 0
					FROM @tEtiquetasMES as M 
					LEFT JOIN @tEtiquetasJDE as J ON M.SSCC = J.ETQSSC
					WHERE J.ETQSSC IS NULL AND M.IdStatus = 1

				-- Actualización de los registros que se han modificado en la tabla tProduccion
				UPDATE [MES_MSM_Trazabilidad].[TRA].[tProduccion]  
					SET [IdStatus] = Temporal.IdStatus
					   ,[ParticionWO] = IIF(Temporal.IdStatus = 1, ParticionWO, NULL)
					   ,[idLotMes] = IIF(Temporal.IdStatus = 1, idLotMes, NULL)
					   ,[LastModifiedMesAt] = GETUTCDATE()
					   ,[LastModifiedMes] = IIF(Temporal.IdStatus = 1, 'Confirmada en SIGI y en JDE', 'Desaparecida en JDE')
					FROM [MES_MSM_Trazabilidad].[TRA].[tProduccion] AS Destino
					INNER JOIN @tEtiquetasMES AS Temporal ON Temporal.SSCC = Destino.SSCC
					WHERE EXISTS (SELECT Temporal.IdStatus EXCEPT SELECT Destino.IdStatus);

				PRINT CONCAT ('Número de registros actualizados en tproduccion: ', @@ROWCOUNT);

			END;
		END;
	END;
END;




GO

