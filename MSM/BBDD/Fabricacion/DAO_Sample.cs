using Clients.ApiClient.Contracts;
using Common.Models.Muestras;
using Common.Models.Operation;
using Common.Models.Sample;
using MSM.BBDD.Fabricacion;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Albaran
{
    public class DAO_Sample : IDAO_Sample
    {
        private string UrlBase =  ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriSample ;
        private string UriListaLotes ;


        private IApiClient _apiTrazabilidad;

        public DAO_Sample(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriSample = "api/operation";
            UriListaLotes = "api/ubicacionLote";
            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }

        public async Task<List<SampleDto>> GetSamplesList(int IdOrder)
        {
            //var ret = await _apiTrazabilidad.GetPostsAsync<List<SampleDto>>(UriSample);

            List<SampleDto> listaMuestras = new List<SampleDto>();

            //SampleDto s1 = new SampleDto();
            //s1.DateSample = DateTime.Now;
            //s1.DescriptionDepartment = "Materias Primas";
            //s1.DescriptionSample = "Muestra Analisis";
            //s1.DescriptionSubdepartment = "Malta";
            //s1.DescriptionTypeSample = "Coccion";
            //s1.IdDepartment = 1;
            //s1.IdOrder = "ORDER FAB 01";
            //s1.IdSample = "S0001/11";
            //s1.IdSubdepartment = 1;
            //s1.IdTypeSample = 1;
            //s1.LotId = "LOTE0000012";
            //s1.PkSample = 1;
            //s1.PositionSample = 2;
            //s1.ResultSample = "OK";
            //s1.ColorResult = "Verde";

            //SampleDto s2 = new SampleDto();
            //s2.DateSample = DateTime.Now;
            //s2.DescriptionDepartment = "Labo";
            //s2.DescriptionSample = "Analisis Laboratorio";
            //s2.DescriptionSubdepartment = "Coadyuvantes";
            //s2.DescriptionTypeSample = "Recuperada";
            //s2.IdDepartment = 3;
            //s2.IdOrder = "ORDER FAB 33";
            //s2.IdSample = "S0002/12";
            //s2.IdSubdepartment = 3;
            //s2.IdTypeSample = 3;
            //s2.LotId = "LOTE0000013";
            //s2.PkSample = 3;
            //s2.PositionSample = 2;
            //s2.ResultSample = "OK";
            //s2.ColorResult = "Amarillo";

            //SampleDto s3 = new SampleDto();
            //s3.DateSample = DateTime.Now;
            //s3.DescriptionDepartment = "Fermentacion";
            //s3.DescriptionSample = "Analisis Levaduras";
            //s3.DescriptionSubdepartment = "Unitanque";
            //s3.DescriptionTypeSample = "Fermentador";
            //s3.IdDepartment = 1;
            //s3.IdOrder = "ORDER FAB 07";
            //s3.IdSample = "S0010/10";
            //s3.IdSubdepartment = 1;
            //s3.IdTypeSample = 1;
            //s3.LotId = "LOTE0000017";
            //s3.PkSample = 2;
            //s3.PositionSample = 3;
            //s3.ResultSample = "OK";
            //s3.ColorResult = "Azul";


            //listaMuestras.Add(s1);
            //listaMuestras.Add(s2);
            //listaMuestras.Add(s3);
            //return ret;
            return listaMuestras;
        }

        public async Task<SampleDto> CreateSample(SampleDto dto)
        {

            OperationDto LotAnalysisOperation = new OperationDto();

            //Rellenador el DTO de Operaciones
            LotAnalysisOperation.FechaInicio = DateTime.Now;
            //LotAnalysisOperation.FechaFin  Sin definir, deberia ser rellenado al completar la muestra
            LotAnalysisOperation.FechaEntrada = DateTime.Now;
            LotAnalysisOperation.IdTipoOperacion = (int)TipoOperacionEnum.AnalizarLote;
            //LotAnalysisOperation.IdLote = dto.LotId;
            //LotAnalysisOperation.IdOrdenOrigen = dto.IdOrder;
            //LotAnalysisOperation.Parametro01 = dto.IdSample;

            //List<UbicacionLoteDto> listaUbicacionesLote = await _apiTrazabilidad.GetPostsAsync<List<UbicacionLoteDto>>(UriListaLotes);

            //LotAnalysisOperation.IdUbicacionOrigen = listaUbicacionesLote.Find(i => i.IdLote.Equals(dto.LotId)).IdUbicacion;

            //OperationDto ret = await _apiTrazabilidad.PostPostsAsync(LotAnalysisOperation, UriSample);

            return dto;
        }

        public async Task<ReturnValue> DeleteSample(SampleDto dto)
        {
            try
            {
                int idSample = int.Parse(dto.Sc.ToString());

                var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriSample + "/" + idSample.ToString());

                return new ReturnValue(true);
            }
            catch (Exception e)
            {
                return new ReturnValue(false, -1, e.Message);
            }
        }
    }
}