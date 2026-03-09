
using MSM.BBDD.Model;
using MSM.Mappers.DTO.Mantenimiento;
using MSM.Models.Mantenimiento;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MSM.BBDD.Mantenimiento
{
    public interface IDAO_SolicitudMantenimiento
    {
        List<DTO_SolicitudIntervencion> ObtenerSolicitudesIntervencionTerminal(string linea);
        bool CrearSolicitudIntervencion(DTO_SolicitudIntervencion solicitud, out int nuevoCodigo);
        bool EditarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud);
        bool CerrarSolicitudIntervencion(DTO_SolicitudIntervencion solicitud);
        List<DTO_SolicitudIntervencion> ObtenerSolicitudesIntervencion(DateTime startDate, DateTime endDate, bool esEnvasado);
        List<SolicitudesLinea> ObtenerSolicitudesAbiertasLinea();
        bool AsociarParosSolicitudMantenimiento(int idSolicitud, List<int> paros);
        List<TipoAveria> ObtenerTiposAveria();
    }
}