using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Fabricacion.Api.Equipment;
using MSM.Models.Fabricacion;
using MSM.Models.Fabricacion.Tipos;
using MSM.Utilidades;
using Siemens.Brewing.Domain.Entities;
using Siemens.SimaticIT.BPM.Breads;
using Siemens.SimaticIT.BPM.Breads.Types;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads;
using Siemens.SimaticIT.CO_MSM_FAB_ENG.Breads.Types;
using Siemens.SimaticIT.MM.Breads;
using Siemens.SimaticIT.MM.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using Siemens.SimaticIT.POM.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_Equipo
    {
        static string nombrePlanta = System.Configuration.ConfigurationManager.AppSettings["PlantaIDFAB"];
        private string UriBase = ConfigurationManager.AppSettings["HostApiSiemensBrewingData"].ToString();
        private string _urlEquipment;

        public DAO_Equipo()
        {
            _urlEquipment = UriBase + "equipment/";
        }

        internal static Equipo_FAB GetEquipoPorNombre(string nombre)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.Equipo_FAB.AsNoTracking().Where(eq => eq.Name == nombre && eq.ID.Contains(nombrePlanta)).FirstOrDefault();
            }
        }

        internal static List<Equipo> ObtenerEquiposProcedimiento(string entryID)
        {

            try
            {
                List<Equipo> listaEquipos = new List<Equipo>();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerEquiposProced_FAB]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@entryID", entryID);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                Equipo e = new Equipo();
                                e.descripcion = row["Equipo"].ToString();
                                e.id = row["ID"].ToString();
                                listaEquipos.Add(e);
                            }
                        }
                    }
                }

                return listaEquipos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Equipos.ObtenerEquiposProcedimiento", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Equipos.ObtenerEquiposProcedimiento", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static List<Equipo> obtenerEquiposSinLote(int salaCoccion)
        {

            try
            {
                List<Equipo> listaEquipos = new List<Equipo>();
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
                {
                    using (SqlCommand command = new SqlCommand("[MES_ObtenerEquiposSinLote_FAB]", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@salaCoccion", salaCoccion);

                        using (SqlDataAdapter da = new SqlDataAdapter(command))
                        {

                            connection.Open();
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            foreach (DataRow row in dt.Rows)
                            {
                                Equipo e = new Equipo();
                                e.descripcion = row["Equipo"].ToString();
                                e.id = row["ID"].ToString();
                                listaEquipos.Add(e);
                            }
                        }
                    }
                }

                return listaEquipos;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "DAO_Equipos.obtenerEquiposSinLote", ex.Message, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_Equipos.ObtenerEquiposSinLote", "WEB-FABRICACION", "Sistema");
                throw new Exception(ex.Message);
            }
        }

        internal static List<Celda_FAB> obtenerCeldasMateriales()
        {
            List<Celda_FAB> celdas = new List<Celda_FAB>();

            using (MESEntities context = new MESEntities())
            {
                var celdasPK = context.Equipo_FAB.AsNoTracking().Where(m => m.ID.StartsWith(nombrePlanta) && (m.Tipo_Ubicacion.Equals("ALMACENAMIENTO") || m.Tipo_Ubicacion.Equals("ALMACENAMIENTO_Y_CONSUMO") || m.Tipo_Ubicacion.Equals("PREPARACION") || m.Tipo_Ubicacion.Equals("VIRTUAL"))).Select(p => p.CeldaPK).ToArray();
                celdas = context.Celda_FAB.AsNoTracking().Where(c => celdasPK.Contains(c.CeldaPK)).OrderBy(p => p.equipPropL9).ToList();
            }

            return celdas;
        }

        internal static List<Celda_FAB> obtenerCeldasMaterialesProduccion()
        {
            List<Celda_FAB> celdas = new List<Celda_FAB>();

            using (MESEntities context = new MESEntities())
            {
                var celdasPK = context.Equipo_FAB.AsNoTracking().Where(m => m.ID.StartsWith(nombrePlanta) && (m.Tipo_Ubicacion.Equals("PRODUCCION"))).Select(p => p.CeldaPK).ToArray();
                celdas = context.Celda_FAB.AsNoTracking().Where(c => celdasPK.Contains(c.CeldaPK)).OrderBy(p => p.equipPropL9).ToList();
            }

            return celdas;
        }

        internal static List<Area_FAB> obtenerCeldasModeloPlanta()
        {
            List<Area_FAB> celdas = new List<Area_FAB>();

            using (MESEntities context = new MESEntities())
            {
                //Equipos con almacenamiento aceptado, obtenemos su CeldaPK
                var AreasPK = context.Equipo_FAB.AsNoTracking().Where(m => m.ID.StartsWith(nombrePlanta) && (m.Tipo_Ubicacion.Equals("ALMACENAMIENTO") || m.Tipo_Ubicacion.Equals("ALMACENAMIENTO_Y_CONSUMO") || m.Tipo_Ubicacion.Equals("PREPARACION") || m.Tipo_Ubicacion.Equals("VIRTUAL"))).Select(p => p.CeldaPK).ToArray();
                //Con esa celda PK sacamos las AreasPK
                var celdasPK = context.Celda_FAB.AsNoTracking().Where(c => AreasPK.Contains(c.CeldaPK)).Select(p => p.AreaPK).ToArray();
                //Sacamos la informacion de esas areas
                celdas = context.Area_FAB.AsNoTracking().Where(p => celdasPK.Contains(p.AreaPK)).OrderBy(c => c.Posicion).ToList();
            }

            return celdas;
        }

        internal static List<LoteUbicacionMaterial_FAB> obtenerEquiposConLote(string material)
        {
            List<LoteUbicacionMaterial_FAB> equiposConLote = new List<LoteUbicacionMaterial_FAB>();
            using (MESEntities context = new MESEntities())
            {
                equiposConLote = context.LoteUbicacionMaterial_FAB.AsNoTracking().Where(m => m.DefID.Equals(material) && m.Quantity > 0).ToList();
                equiposConLote = equiposConLote.GroupBy(c => c.LocPK).Select(c => new LoteUbicacionMaterial_FAB()
                {
                    ClassDescript = c.FirstOrDefault().ClassDescript,
                    DefID = c.FirstOrDefault().DefID,
                    DefPK = c.FirstOrDefault().DefPK,
                    Descripcion = c.FirstOrDefault().Descripcion,
                    Descript = c.FirstOrDefault().Descript,
                    InitQuantity = c.Sum(e => e.InitQuantity),
                    LastUpdate = c.FirstOrDefault().LastUpdate,
                    LastUpdateUTC = c.FirstOrDefault().LastUpdateUTC,
                    LOCID = c.FirstOrDefault().LOCID,
                    LocPath = c.FirstOrDefault().LocPath,
                    LocPK = c.FirstOrDefault().LocPK,
                    LoteMes = c.FirstOrDefault().LoteMes,
                    LotPK = c.FirstOrDefault().LotPK,
                    ParentLocPK = c.FirstOrDefault().ParentLocPK,
                    PoliticaVaciado = c.FirstOrDefault().PoliticaVaciado,
                    Quantity = c.Sum(e => e.Quantity),
                    serialNumber = c.FirstOrDefault().serialNumber,
                    UomID = c.FirstOrDefault().UomID,
                }).ToList();

                equiposConLote.ForEach(a =>
                {
                    a.Descripcion = a.Descripcion + " - " + a.LOCID + " - " + decimal.Round((decimal)a.Quantity, 2, MidpointRounding.AwayFromZero).ToString("N") + " " + a.UomID;
                });
            }

            List<LoteUbicacionMaterial_FAB> listaBorrar = new List<LoteUbicacionMaterial_FAB>();

            foreach (LoteUbicacionMaterial_FAB eq in equiposConLote)
            {
                Equipment_BREAD eqBread = new Equipment_BREAD();
                Equipment equip = eqBread.Select("", 0, 0, "{Name}='" + eq.LOCID + "' AND {IsInPlant}='True'").FirstOrDefault();
                EquipmentProperty_BREAD eqPropBread = new EquipmentProperty_BREAD();
                EquipmentProperty eqProp = eqPropBread.SelectByEquipmentPK(equip.PK, "", 0, 0, "{ID}='TIPO_UBICACION'").FirstOrDefault();

                if (!eqProp.Value.Contains("ALMACENAMIENTO"))
                    listaBorrar.Add(eq);
            }

            foreach (LoteUbicacionMaterial_FAB borr in listaBorrar)
            {
                equiposConLote.Remove(borr);
            }

            return equiposConLote.OrderBy(e => e.Descripcion).ToList();
        }

        internal static List<Silo> GetEquiposSilos(string area)
        {
            List<Silo> equipoSilos = new List<Silo>();
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlMES"].ConnectionString))
            {
                using (SqlCommand command = new SqlCommand("[MES_ObtenerEquipoAreaSilos]", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@AREA", area);

                    using (SqlDataAdapter da = new SqlDataAdapter(command))
                    {

                        connection.Open();
                        DataTable dt = new DataTable();
                        da.Fill(dt);
                        foreach (DataRow row in dt.Rows)
                        {
                            Silo s = new Silo();
                            equipoSilos.Add(s);
                        }
                    }
                }
            }

            return equipoSilos;
        }

        internal static List<Celda_FAB> obtenerCeldaDesdeArea(int idArea)
        {
            List<Celda_FAB> equiposConLote = new List<Celda_FAB>();
            using (MESEntities context = new MESEntities())
            {
                //Equipos con almacenamiento aceptado, obtenemos su CeldaPK
                var AreasPK = context.Equipo_FAB.AsNoTracking().Where(m => m.ID.StartsWith(nombrePlanta) && (m.Tipo_Ubicacion.Equals("ALMACENAMIENTO") || m.Tipo_Ubicacion.Equals("ALMACENAMIENTO_Y_CONSUMO") || m.Tipo_Ubicacion.Equals("PREPARACION") || m.Tipo_Ubicacion.Equals("VIRTUAL"))).Select(p => p.CeldaPK).ToArray();
                //Con esa celda PK sacamos las AreasPK
                equiposConLote = context.Celda_FAB.AsNoTracking().Where(c => AreasPK.Contains(c.CeldaPK) && c.AreaPK == idArea).OrderBy(p => p.Posicion).ToList();
            }

            return equiposConLote;
        }

        internal static List<object> GetEquipos(int idEquipo)
        {
            List<object> listaEquipos = new List<object>();
            string salasEquipos = System.Configuration.ConfigurationManager.AppSettings["EquiposProduccionFAB"];

            using (MESEntities context = new MESEntities())
            {
                var nombreArea = context.Celda_FAB.AsNoTracking().Where(a => a.CeldaPK == idEquipo).Select(e => e.Name).FirstOrDefault();

                if (salasEquipos.Contains(nombreArea.ToUpper()))
                {
                    //obtiene los equipo de las celdas de produccion SC1,FE1,...
                    listaEquipos = GetEquiposSala(idEquipo);
                }
                else
                {
                    //obtiene los equipos de cedas de almacenamiento
                    listaEquipos = GetSilos(idEquipo);
                }

                return listaEquipos;
            }
        }

        private static List<object> GetSilos(int idEquipo)
        {
            List<object> listaSilos = new List<object>();

            using (MESEntities context = new MESEntities())
            {
                var listaEquipos = context.Equipo_FAB.AsNoTracking().Where(e => e.CeldaPK == idEquipo).OrderBy(p => p.Posicion).ToList();

                if (listaEquipos != null)
                {
                    foreach (Equipo_FAB eq in listaEquipos)
                    {
                        Silo s = new Silo(eq.EquipoPK);
                        listaSilos.Add((object)s);
                    }
                }
                else
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HAN"));
                }

            }

            return listaSilos;
        }

        public static List<Equipo> GetCellEquipment(String cell)
        {
            List<Equipo> equipment = new List<Equipo>();
            long cellPK = -1;
            using (MESEntities context = new MESEntities())
            {
                cellPK = context.Celda_FAB.AsNoTracking().Where(item => item.Name.Equals(cell)).Select(item => item.CeldaPK).FirstOrDefault();
                context.Equipo_FAB.AsNoTracking().Where(e => e.CeldaPK == cellPK).OrderBy(p => p.Posicion).ToList().ForEach(item => equipment.Add(new Equipo(item.EquipoPK)));
            }

            return equipment;
        }

        public static List<object> GetEquiposSala(int idEquipo)
        {
            List<object> listaEquiposProduccion = new List<object>();

            using (MESEntities context = new MESEntities())
            {
                var listaEquipos = context.Equipo_FAB.AsNoTracking().Where(e => e.CeldaPK == idEquipo).OrderBy(p => p.Posicion).ToList();

                if (listaEquipos != null)
                {
                    foreach (Equipo_FAB eq in listaEquipos)
                    {
                        EquipoProduccion s = new EquipoProduccion(eq.EquipoPK);
                        listaEquiposProduccion.Add((object)s);
                    }
                }
                else
                {
                    throw new Exception(IdiomaController.GetResourceName("NO_SE_HAN"));
                }
            }

            return listaEquiposProduccion;
        }

        internal static List<Area_FAB> obtenerCeldasModeloPlantaFases()
        {
            List<Area_FAB> celdas = new List<Area_FAB>();

            using (MESEntities context = new MESEntities())
            {
                //Equipos con almacenamiento aceptado, obtenemos su CeldaPK
                var AreasPK = context.Equipo_FAB.AsNoTracking().Where(m => m.ID.StartsWith(nombrePlanta) && (m.Tipo_Ubicacion.Equals("PRODUCCION"))).Select(p => p.CeldaPK).ToArray();
                //Con esa celda PK sacamos las AreasPK
                var celdasPK = context.Celda_FAB.AsNoTracking().Where(c => AreasPK.Contains(c.CeldaPK)).Select(p => p.AreaPK).ToArray();
                //Sacamos la informacion de esas areas
                celdas = context.Area_FAB.AsNoTracking().Where(p => celdasPK.Contains(p.AreaPK)).OrderBy(c => c.Posicion).ToList();
            }

            return celdas;
        }

        internal static List<String> ObtenerClassesPKTanquesFERGU()
        {
            List<String> pk = new List<String>();
            EquipmentClass_BREAD classes = new EquipmentClass_BREAD();
            List<EquipmentClass> item = new List<EquipmentClass>();
            item = classes.Select("Name asc", 0, 0, "{Name} in('UNIDAD-TANQUE-FERGU','UNIDAD-TANQUE-FERMENTACION','UNIDAD-TANQUE-GUARDA')").ToList();
            item.ForEach(delegate (EquipmentClass element) { pk.Add(element.PK.ToString()); });
            return pk;
        }

        internal static List<Celda_FAB> obtenerAreasModeloPlantaFases(int celdaPK)
        {
            using (MESEntities context = new MESEntities())
            {
                return context.Celda_FAB.AsNoTracking().Where(c => celdaPK == c.AreaPK && !c.ClassID.Contains("ALMACENAMIENTO")).OrderBy(p => p.Posicion).ToList();
            }
        }

        internal async Task<ReturnValue> ChangeDecantingDestination(dynamic newEquipment)
        {
            string _urlChangeDecantionDestionation = string.Concat(_urlEquipment, "ChangeDecantingDestination");
             return await MSM.Utilidades.ApiClient.PostAsJsonAsync<ReturnValue>(_urlChangeDecantionDestionation, newEquipment); 
        }

        internal static List<DTO.DTO_TransferenciaMostos> obtenerDestinoTransferencia(int idOrden, string idMaterial)
        {
            List<DTO.DTO_TransferenciaMostos> listaDestinos = new List<DTO.DTO_TransferenciaMostos>();

            Definition_BREAD defBread = new Definition_BREAD();

            Definition def = defBread.Select("", 0, 0, "{ID}='" + idMaterial + "'").FirstOrDefault();

            if (!string.IsNullOrEmpty(idMaterial))
            {
                if (def == null)
                    return obtenerDestinoTransferenciaArea(idOrden, idMaterial);
                else
                {

                    Order_BREAD oBread = new Order_BREAD();
                    Equipment_BREAD locBread = new Equipment_BREAD();
                    Entry_BREAD eBread = new Entry_BREAD();

                    Order orden = oBread.SelectByPK(idOrden).FirstOrDefault();
                    bool equipoPropio = false;
                    string pathPropio = "";

                    //Opciones para WP -> Bagazo, Cerveza envasar y mosto
                    string idBagazo = System.Configuration.ConfigurationManager.AppSettings["idBagazo"];
                    //Opciones para FE, GU -> Levadura viva, muerta y MMix
                    string idLevaduraColeccion = System.Configuration.ConfigurationManager.AppSettings["idLevaduraColeccion"];
                    string idLevaduraMuerta = System.Configuration.ConfigurationManager.AppSettings["idLevaduraMuerta"];

                    if (idMaterial.Equals(idBagazo))
                    {
                        string destinoBagazo = System.Configuration.ConfigurationManager.AppSettings["destinoBagazo"];
                        string[] destinos = destinoBagazo.Split(',');

                        foreach (var idEq in destinos)
                        {
                            DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();
                            Equipment eq = locBread.Select("", 0, 0, "{Name}='" + idEq + "'").FirstOrDefault();
                            objetoDTO.PK = eq.PK.ToString();
                            objetoDTO.Descripcion = eq.Name + " - " + eq.Label;
                            listaDestinos.Add(objetoDTO);
                        }
                    }
                    else
                        if (idMaterial.Equals(idLevaduraColeccion))
                    {
                        string destinoLevaduraColeccion = System.Configuration.ConfigurationManager.AppSettings["destinoLevaduraColeccion"];
                        string[] destinos = destinoLevaduraColeccion.Split(',');

                        foreach (var idEq in destinos)
                        {
                            DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();
                            Equipment eq = locBread.Select("", 0, 0, "{Name}='" + idEq + "'").FirstOrDefault();
                            objetoDTO.PK = eq.PK.ToString();
                            objetoDTO.Descripcion = eq.Name + " - " + eq.Label;
                            listaDestinos.Add(objetoDTO);
                        }
                    }
                    else
                            if (idMaterial.Equals(idLevaduraMuerta))
                    {
                        string destinoLevaduraMuerta = System.Configuration.ConfigurationManager.AppSettings["destinoLevaduraMuerta"];
                        string[] destinos = destinoLevaduraMuerta.Split(',');

                        foreach (var idEq in destinos)
                        {
                            DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();
                            Equipment eq = locBread.Select("", 0, 0, "{Name}='" + idEq + "'").FirstOrDefault();
                            objetoDTO.PK = eq.PK.ToString();
                            objetoDTO.Descripcion = eq.Name + " - " + eq.Label;
                            listaDestinos.Add(objetoDTO);
                        }
                    }
                    else
                    {

                        List<string> celdas = new List<string>();
                        if (orden.TypeID.Equals("WP"))
                            celdas.Add("FE1");
                        else
                            if (orden.TypeID.Equals("FL"))
                        {
                            celdas.Add("PR");
                        }
                        else
                        {
                            if (orden.TypeID.Equals("FE") || orden.TypeID.Equals("TR"))
                            {
                                celdas.Add("FE1");
                                celdas.Add("GU1");
                            }
                        }


                        foreach (var celda in celdas)
                        {
                            Equipment padre = locBread.Select("", 0, 0, "{Name} = '" + celda + "' AND {IsInPlant} = 'True' ").FirstOrDefault();

                            Collection<Equipment> hijos = locBread.Select("", 0, 0, "{Superior}='" + padre.ID + "'");

                            foreach (var hijo in hijos)
                            {
                                DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();

                                objetoDTO.PK = hijo.PK.ToString();
                                objetoDTO.Descripcion = hijo.Name + " - " + hijo.Label;
                                objetoDTO.ParentPK = hijo.EquipmentClassPK.Value.ToString();

                                if (!equipoPropio || !pathPropio.Equals(hijo.ID))
                                {
                                    Entry entryEjecutandose = eBread.Select("", 0, 0, "{StatusID}='Running' AND {ExecutionEquipmentID}='" + hijo.ID + "'").FirstOrDefault();
                                    if (entryEjecutandose != null)
                                    {
                                        Order ordenEjecutandose = oBread.SelectByPK(entryEjecutandose.OrderPK).FirstOrDefault();

                                        objetoDTO.Descripcion += " - " + ordenEjecutandose.ID + " - " + ordenEjecutandose.FinalMaterialID;
                                        listaDestinos.Add(objetoDTO);
                                    }
                                    else
                                    {
                                        listaDestinos.Add(objetoDTO);

                                    }
                                }
                                else
                                {
                                    objetoDTO.Descripcion += " - Orden actual";
                                    listaDestinos.Add(objetoDTO);

                                }
                            }
                        }

                        if (orden.TypeID.Equals("PR"))
                        {
                            List<FillersByTCP> fillers = new List<FillersByTCP>();
                            List<Ordenes_ENV> packingOrders = new List<Ordenes_ENV>();
                            Ordenes_ENV packingOrder;
                            REL_PackingWo_HighBeer packingMaterial;
                            List<REL_PackingWo_HighBeer> packingMaterials = new List<REL_PackingWo_HighBeer>();
                            int count = orden.ExecutionEquipmentID.Split('.').Count();

                            using (MESEntities context = new MESEntities())
                            {
                                String aux = orden.ExecutionEquipmentID.Split('.')[count - 1];
                                fillers = context.FillersByTCP.AsNoTracking().Where(item => item.Clase.Equals("LLENADORA") && item.IdTCP.Equals(aux)).ToList();
                                packingOrders = context.Ordenes_ENV.AsNoTracking().ToList();
                                packingMaterials = context.REL_PackingWo_HighBeer.AsNoTracking().ToList();
                            }

                            Equipment eq;
                            EquipmentProperty_BREAD eqPropBREAD = new EquipmentProperty_BREAD();
                            EquipmentProperty eqProp;
                            foreach (var fill in fillers)
                            {
                                //Compruebo que el material que se está produciendo en envasado es el mismo que está almacenado en el TCP
                                //sino lo es, se descartará la llenadora
                                eqProp = eqPropBREAD.SelectByEquipmentPK(fill.PkEquipo.Value, "", 0, 0, "{ID} = 'ORDER_ID'").FirstOrDefault();
                                if (String.IsNullOrEmpty(eqProp.Value))
                                    continue;
                                else
                                {
                                    packingOrder = packingOrders.Find(item => item.ID_Orden.Equals(eqProp.Value));
                                    packingMaterial = packingMaterials.Find(item => item.PackingArticleID.Equals(packingOrder.Cod_Material));
                                    if (packingMaterial == null)
                                        continue;
                                    else
                                    {
                                        String czaEnv = packingMaterial.CZAEnv.Contains('-') ? packingMaterial.CZAEnv.Split('-')[0] : packingMaterial.CZAEnv;
                                        if (!orden.FinalMaterialID.Equals(czaEnv))
                                            continue;
                                    }
                                }

                                DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();
                                objetoDTO.PK = fill.PkEquipo.ToString();
                                objetoDTO.Descripcion = fill.Clase + " - " + fill.Nombre;
                                //Entry entryEjecutandose = eBread.Select("", 0, 0, "{StatusID}='Running' AND {ExecutionEquipmentID}='" + orden.ExecutionEquipmentID + "'").FirstOrDefault();
                                //if (entryEjecutandose != null)
                                //    objetoDTO.Descripcion += " - " + orden.ID + " - " + orden.FinalMaterialID;

                                eq = locBread.Select("", 0, 0, "{ID}='" + orden.ExecutionEquipmentID + "'").FirstOrDefault();
                                objetoDTO.ParentPK = eq != null ? eq.ParentPK.ToString() : "-1";
                                listaDestinos.Add(objetoDTO);
                            }
                        }
                    }
                    return listaDestinos.OrderBy(c => c.Descripcion).ToList();
                }
            }
            else
                return new List<DTO.DTO_TransferenciaMostos>();
        }

        internal static List<Equipo_FAB> obtenerTCPs()
        {
            List<Equipo_FAB> listaTCPs = new List<Equipo_FAB>();
            string descripcionTanquePrellenado = System.Configuration.ConfigurationManager.AppSettings["descripcionTanquePrellenado"];

            using (MESEntities context = new MESEntities())
            {
                listaTCPs = context.Equipo_FAB.AsNoTracking().Where(c => c.ClassID.Equals(descripcionTanquePrellenado)).OrderBy(p => p.Posicion).ToList();
            }

            return listaTCPs;
        }

        internal static List<Celda_FAB> obtenerLineasFil()
        {
            List<Celda_FAB> listaFil = new List<Celda_FAB>();
            //Entry_BREAD eBread = new Entry_BREAD();
            string descripcionLineasFil = System.Configuration.ConfigurationManager.AppSettings["descripcionLineasFil"];

            using (MESEntities context = new MESEntities())
            {
                listaFil = context.Celda_FAB.AsNoTracking().Where(c => c.ClassID.Contains(descripcionLineasFil) && c.TipoUbicacion.Equals("PRODUCCION")).OrderBy(p => p.Posicion).ToList();
            }

            //Order_BREAD oBread = new Order_BREAD();
            //Collection<Order> coleccionesOrdenesFil = oBread.Select("", 0, 0, "{TypeID}='FL' AND {StatusID}='In Progress'");

            //foreach (var ordenFil in coleccionesOrdenesFil)
            //{
            //    Entry mainEntryFil = eBread.SelectByOrderPk(ordenFil.PK, "", 0, 0, "{Label} like 'D_%'").FirstOrDefault();

            //    listaFil.RemoveAll(c => c.ID.Equals(mainEntryFil.ExecutionEquipmentID));
            //}

            return listaFil;
        }

        internal static List<Celda_FAB> ObtenerSalasCoccion()
        {
            using (MESEntities context = new MESEntities())
            {
                return context.Celda_FAB.AsNoTracking().Where(c => c.ClassID.Contains("SALA-COCCION")).OrderBy(p => p.Posicion).ToList();
            }
        }
        
        internal static List<dynamic> ObtenerSalasDestinoCoccion()
        {
            using (MESFabEntities context = new MESFabEntities())
            {
                return context.vMaestroUbicaciones.AsNoTracking().ToList().Where(x => x.IdTipoZona == (int)TipoZona.SalaFermentacionBodega).
                    OrderBy(x => x.CodUbicacion).Select(x => (dynamic)new { x.IdUbicacion,  x.CodUbicacion, x.DescUbicacion }).Distinct().ToList();
            }
        }

        internal static List<DTO.DTO_TransferenciaMostos> obtenerDestinoTransferenciaArea(int idOrden, string area)
        {
            //Este caso solo se da cuando se selecciona el combo de areas de destino en FE o GU
            //Si es FE las opciones son FE y GU
            //Si es GU las opciones son GU y FL

            Entry_BREAD eBread = new Entry_BREAD();
            Order_BREAD oBread = new Order_BREAD();
            List<DTO.DTO_TransferenciaMostos> lista = new List<DTO.DTO_TransferenciaMostos>();
            Order ordenActual = oBread.SelectByPK(idOrden).FirstOrDefault();

            if (area.Equals("FE") || area.Equals("GU"))
            {
                string claseABuscar = System.Configuration.ConfigurationManager.AppSettings[area + "_ClaseEquipo"];
                string[] clasesEq = claseABuscar.Split(';');

                foreach (string idClase in clasesEq)
                {
                    using (MESEntities context = new MESEntities())
                    {
                        List<Equipo_FAB> listEqF = context.Equipo_FAB.AsNoTracking().Where(c => c.ClassID.Contains(idClase) && c.ID.Contains(area)).OrderBy(p => p.Posicion).ToList();

                        foreach (Equipo_FAB eq in listEqF)
                        {
                            DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();

                            objetoDTO.PK = eq.EquipoPK.ToString();
                            objetoDTO.Descripcion = eq.Name + " - " + eq.Descripcion;
                            objetoDTO.ParentPK = eq.CeldaPK.ToString();

                            string tipo = area;
                            Entry entryEjecutandose = eBread.Select("", 0, 0, "{StatusID}='Running' AND {ExecutionEquipmentID}='" + eq.ID + "'").FirstOrDefault();
                            if (entryEjecutandose != null)
                            {
                                Order ordenEjecutandose = oBread.SelectByPK(entryEjecutandose.OrderPK).FirstOrDefault();

                                if (ordenEjecutandose.PK == idOrden)
                                    objetoDTO.Descripcion += " - Orden actual";
                                else
                                    objetoDTO.Descripcion += " - " + ordenEjecutandose.ID + " - " + ordenEjecutandose.FinalMaterialID;

                                tipo = ordenEjecutandose.TypeID;

                                if (ordenActual.TypeID.Equals(area) && ordenEjecutandose.PK == idOrden)
                                    tipo = "N/A";

                                //if ((ordenActual.TypeID.Equals("FE") || area.Equals("GU")) && ordenEjecutandose.PK != idOrden)
                                //    tipo = "N/A";
                            }

                            if (tipo.Equals(area) || (tipo.Equals("FE") && area.Equals("GU") && entryEjecutandose.OrderID == ordenActual.ID))
                                lista.Add(objetoDTO);
                        }
                    }
                }

                return lista;
            }
            else
            {
                List<Celda_FAB> listFil = new List<Celda_FAB>();
                string descripcionLineasFil = System.Configuration.ConfigurationManager.AppSettings["descripcionLineasFil"];

                using (MESEntities context = new MESEntities())
                {
                    listFil = context.Celda_FAB.AsNoTracking().Where(c => c.ClassID.Contains(descripcionLineasFil) && c.TipoUbicacion.Equals("PRODUCCION")).OrderBy(p => p.Posicion).ToList();
                }

                //Collection<Order> coleccionesOrdenesFil = oBread.Select("", 0, 0, "{TypeID}='FL' AND {StatusID}='In Progress'");

                foreach (Celda_FAB celda in listFil)
                {
                    string idEquipo = "";

                    using (MESEntities context = new MESEntities())
                    {
                        idEquipo = context.Equipo_FAB.AsNoTracking().Where(c => c.CeldaPK.Value == celda.CeldaPK && c.Posicion == 1).OrderBy(p => p.Posicion).FirstOrDefault().ID;
                    }

                    Collection<Entry> entryEjecutandose = eBread.Select("", 0, 0, "({StatusID}='Ready' OR {StatusID}='Running') AND {ExecutionEquipmentID}='" + idEquipo + "'");
                    if (entryEjecutandose.Count > 0)
                    {
                        foreach (Entry entry in entryEjecutandose)
                        {
                            Order orden = oBread.SelectByPK(entry.OrderPK).FirstOrDefault();
                            if (orden != null)
                            {
                                if (orden.StatusID.Equals("In Progress"))
                                {
                                    DTO.DTO_TransferenciaMostos objetoDTO = new DTO.DTO_TransferenciaMostos();

                                    objetoDTO.PK = celda.CeldaPK.ToString();
                                    objetoDTO.Descripcion = celda.Name + " - " + celda.C_External_IDSloc;
                                    objetoDTO.Descripcion = entry.OrderID + " - " + objetoDTO.Descripcion;
                                    lista.Add(objetoDTO);
                                }
                            }
                        }
                    }
                }

                return lista;
            }
        }

        public async Task<Dictionary<string, string>> GetAtributosEquipo(SitEquipment sitEquipment, string[] prop)
        {
            DTO_EquipmentPropertiesValue _data = new DTO_EquipmentPropertiesValue()
            {
                Equipment = sitEquipment,
                PropNames = prop
            };
            string _urlPropertiesEquipment = string.Concat(_urlEquipment, "Properties");
            var _ret = await ApiClient.PostAsJsonAsync(_urlPropertiesEquipment, _data);
            if (_ret.IsSuccessStatusCode)
            {
                var _readAsyncResult = await _ret.Content.ReadAsAsync<DTO_EquipmentPropertiesValue>();
                return _readAsyncResult.Result;
            }
            return null;
        }

        public async Task<IEnumerable<SitEquipment>> SelectAllChildrenByPlant(SitEquipment sitEquipment, string plant)
        {
            DTO_EquipmentPropertiesValue _data = new DTO_EquipmentPropertiesValue()
            {
                Equipment = sitEquipment,
                Plant = plant
            };
            string _urlAllChildrenByPlant = string.Concat(_urlEquipment, "AllChildrenByPlant");
            var _ret = await ApiClient.PostAsJsonAsync(_urlAllChildrenByPlant, _data);
            if (_ret.IsSuccessStatusCode)
            {
                return await _ret.Content.ReadAsAsync<IEnumerable<SitEquipment>>();
            }
            return null;
        }

        public async Task<string> GetIdEquipment(string Id)
        {

            string _urlEquipmentId = string.Concat(_urlEquipment, "EquipmentId/", Id, "/");
            var _ret = await ApiClient.GetAsync(_urlEquipmentId);
            if (_ret.IsSuccessStatusCode)
            {
                return await _ret.Content.ReadAsAsync<string>();
            }
            return null;
        }

        private class DataEquipmentByPlant
        {
            public string EquipID { get; set; }

            public string Planta { get; set; }
        }

        public async Task<SitEquipment> EquipmentByPlantId(string EquipID, string Planta)
        {
            string uriEquipmentByPlantId = string.Concat(_urlEquipment, "EquipmentByPlantId");
            DataEquipmentByPlant _data = new DataEquipmentByPlant
            {
                EquipID = EquipID,
                Planta = Planta
            };

            var _ret = await ApiClient.PostAsJsonAsync(uriEquipmentByPlantId, _data);
            if (_ret.IsSuccessStatusCode)
            {
                var _readAsyncResult = await _ret.Content.ReadAsAsync<SitEquipment>();
                return _readAsyncResult;
            }

            return null;
        }
    }
}