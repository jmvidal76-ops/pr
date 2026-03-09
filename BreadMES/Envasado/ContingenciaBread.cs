using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_RT.Breads.Types;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;


namespace BreadMES.Envasado
{
    public class ContingenciaBread
    {

        public static bool ModificarCantidad(int hora, int turno, int eLlenadora, int pPaletizadora, int rLlenadora, int rPaletizadora)
        {
            bool correcto = true;

            //Informacion de la llenadora
            //Para un turno y una hora
            //Insertar nuevo valor de envases llenadora y nuevo valor de tiempo neto
            //Insertar nuevo valor de envases rechazados
            COB_MSM_PROD_LLENADORA_HORA_BREAD daoLlenadora = new COB_MSM_PROD_LLENADORA_HORA_BREAD();
            Collection<COB_MSM_PROD_LLENADORA_HORA> llenadora = new Collection<COB_MSM_PROD_LLENADORA_HORA>();
            ReturnValue res = new ReturnValue();
            res.succeeded = true;
            string filtro = "{HORA} = " + hora.ToString() + " AND {SHC_WORK_SCHED_DAY_PK} = " + turno.ToString();

            llenadora = daoLlenadora.Select("", 0, 100, filtro);
            //ordenacion, fila de comienzo, top 100, filtro
            if (llenadora.Count > 0)
            {
                int valorInicial = llenadora[0].CONTADOR_PRODUCCION;
                int diferencia = eLlenadora - valorInicial;
                int rechazoInicial = llenadora[0].CONTADOR_RECHAZOS;
                int diferenciaRechazos = rLlenadora - rechazoInicial;

                if (llenadora.Count > 1)
                {
                    int paraAnadir = diferencia / llenadora.Count;
                    int paraAnadirRechazo = diferenciaRechazos / llenadora.Count;
                    int resto = diferencia % llenadora.Count;
                    int restoRechazo = diferenciaRechazos % llenadora.Count;

                    for (int i = 0; i < llenadora.Count; i++)
                    {
                        while (res.succeeded)
                        {
                            if (i == 0 && resto > 0)
                            {
                                llenadora[i].CONTADOR_PRODUCCION += paraAnadir + resto;
                                llenadora[i].CONTADOR_RECHAZOS += paraAnadirRechazo + restoRechazo;
                            }
                            else
                            {
                                llenadora[i].CONTADOR_PRODUCCION += paraAnadir;
                                llenadora[i].CONTADOR_RECHAZOS += paraAnadirRechazo;
                            }

                            res = daoLlenadora.Edit(llenadora[i]);
                        }
                    }
                }
                else
                {
                    llenadora[0].CONTADOR_PRODUCCION = eLlenadora;
                    llenadora[0].TIEMPO_NETO += (diferencia / llenadora[0].VELOCIDAD_NOMINAL) * llenadora[0].TIEMPO_PLANIFICADO;
                    llenadora[0].CONTADOR_RECHAZOS = rLlenadora;

                    res = daoLlenadora.Edit(llenadora[0]);

                }

            }

            if (!res.succeeded)
            {
                correcto = false;
                res.message = "Error al rellenar las llenadoras";
            }


            //Informacion de la paletizadora
            //Para un turno y una hora
            //Insertar nuevo valor de pasles paletizadora y nuevo valor de tiempo neto
            //Insertar nuevo valor de pales rechazados que de momento siempre es 0



            COB_MSM_PROD_RESTO_MAQ_HORA_BREAD daoPaletizadora = new COB_MSM_PROD_RESTO_MAQ_HORA_BREAD();
            Collection<COB_MSM_PROD_RESTO_MAQ_HORA> paletizadora = new Collection<COB_MSM_PROD_RESTO_MAQ_HORA>();

            res.succeeded = true;
            string maquina = "EQ-PAL";

            filtro = "{HORA} = " + hora.ToString() + " AND {SHC_WORK_SCHED_DAY_PK} = " + turno.ToString() + " AND {ID_MAQUINA} like" + "'%" + maquina + "%'";

            paletizadora = daoPaletizadora.Select("", 0, 100, filtro);

            if (paletizadora.Count > 0)
            {
                int valorInicial = paletizadora[0].CONTADOR_PRODUCCION;
                int diferencia = pPaletizadora - valorInicial;
                //int rechazoInicial = paletizadora[0].CONTADOR_RECHAZOS;
                //int diferenciaRechazos = rPaletizadora - rechazoInicial;

                if (paletizadora.Count > 1)
                {
                    int paraAnadir = diferencia / paletizadora.Count;
                    //int paraAnadirRechazo = diferenciaRechazos / paletizadora.Count;
                    int resto = diferencia % paletizadora.Count;
                    //int restoRechazo = diferenciaRechazos % paletizadora.Count;

                    for (int i = 0; i < paletizadora.Count; i++)
                    {
                        while (res.succeeded)
                        {
                            if (i == 0 && resto > 0)
                            {
                                paletizadora[i].CONTADOR_PRODUCCION += paraAnadir + resto;
                                //paletizadora[i].CONTADOR_RECHAZOS += paraAnadirRechazo + restoRechazo;
                            }
                            else
                            {
                                paletizadora[i].CONTADOR_PRODUCCION += paraAnadir;
                                //paletizadora[i].CONTADOR_RECHAZOS += paraAnadirRechazo;
                            }

                            res = daoPaletizadora.Edit(paletizadora[i]);
                        }
                    }
                }
                else
                {
                    paletizadora[0].CONTADOR_PRODUCCION = pPaletizadora;
                    //paletizadora[0].CONTADOR_RECHAZOS = rPaletizadora;

                    res = daoPaletizadora.Edit(paletizadora[0]);

                }

            }

            if (!res.succeeded)
            {
                correcto = false;
                res.message = "Error al rellenar las paletizadoras";
            }


            res.succeeded = correcto;


            //COB_MSM_RECHAZOS_MANUALES_BREAD daoRechazos = new COB_MSM_RECHAZOS_MANUALES_BREAD();
            //Collection<COB_MSM_RECHAZOS_MANUALES> rechazo = new Collection<COB_MSM_RECHAZOS_MANUALES>();

            //string filtro = "{PK}like" + "'%#" + idRechazo.ToString() + "'";

            //rechazo = daoRechazos.Select("", 0, 1, filtro);

            //rechazo[0].CANTIDAD = cantidad;
            //rechazo[0].ID_ORDEN = idOrden;
            //rechazo[0].ID_MAQUINA = maquina;

            //ReturnValue res = daoRechazos.Edit(rechazo[0]);
            return res.succeeded;
        }

        //AÑADIDO PLAN DE CONTINGENCIA 2
        public static bool CrearConsolidadoHora(COB_MSM_PROD_LLENADORA_HORA llenadora)
        {
            COB_MSM_PROD_LLENADORA_HORA_BREAD context = new COB_MSM_PROD_LLENADORA_HORA_BREAD();

            ReturnValue returnValue = context.Create(llenadora);
            return returnValue.succeeded;
        }

        public static bool CrearConsolidadoHora(COB_MSM_PROD_RESTO_MAQ_HORA maquina)
        {
            COB_MSM_PROD_RESTO_MAQ_HORA_BREAD context = new COB_MSM_PROD_RESTO_MAQ_HORA_BREAD();

            ReturnValue returnValue = context.Create(maquina);
            return returnValue.succeeded;
        }

        //PLAN CONTINGENCIA V2
        //PASAMOS EL ID MAQUINA, FEFCHA INICIO / FIN PARA BUSCAR EL REGISTRO A EDITAR Y CON COB_MSM_PROD_LLENADORA_HORA LOS NUEVOS DATOS
        public static bool EditarConsolidadoHora(string idMaquina, DateTime fechaInicio, DateTime fechaFin, COB_MSM_PROD_LLENADORA_HORA maquina,
                                                bool esMultilinea, bool esAsignar, bool esDividir)
        {
            ReturnValue returnValue = new ReturnValue();
            COB_MSM_PROD_LLENADORA_HORA_BREAD context = new COB_MSM_PROD_LLENADORA_HORA_BREAD();

            string filtro = string.Format("{{ID_MAQUINA}} = '{0}' AND {{FECHA_INICIO}} = '{1}' AND {{FECHA_FIN}} = '{2}'", idMaquina, fechaInicio.ToString("yyyy-MM-dd HH:mm:ss"), fechaFin.ToString("yyyy-MM-dd HH:mm:ss"));
            Collection<COB_MSM_PROD_LLENADORA_HORA> lstCobH = context.Select("", 0, -1, filtro);

            if (lstCobH.Count > 0)
            {
                COB_MSM_PROD_LLENADORA_HORA cobM = lstCobH.FirstOrDefault();

                cobM.CONTADOR_PRODUCCION = maquina.CONTADOR_PRODUCCION;
                cobM.CONTADOR_PRODUCCION_AUTO = maquina.CONTADOR_PRODUCCION_AUTO;
                cobM.CONTADOR_RECHAZOS = maquina.CONTADOR_RECHAZOS;
                cobM.CONTADOR_RECHAZOS_AUTO = maquina.CONTADOR_RECHAZOS_AUTO;
                cobM.ID_ORDEN = maquina.ID_ORDEN;
                cobM.ID_PARTICION = maquina.ID_PARTICION;
                cobM.FECHA_FIN = maquina.FECHA_FIN;
                cobM.FECHA_INICIO = maquina.FECHA_INICIO;
                cobM.TIEMPO_PLANIFICADO = maquina.TIEMPO_PLANIFICADO;

                if (esAsignar)
                {
                    cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                }
                else if (esDividir)
                {
                    cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                }
                else 
                { 
                    if (cobM.VELOCIDAD_NOMINAL <= 0 || maquina.VELOCIDAD_NOMINAL == 0)
                    { 
                        cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                    }
                }

                cobM.SHC_WORK_SCHED_DAY_PK = maquina.SHC_WORK_SCHED_DAY_PK;

                returnValue = context.Edit(cobM);
            }

            return returnValue.succeeded;
        }

        public static bool EditarConsolidadoHora(string idMaquina, DateTime fechaInicio, DateTime fechaFin, COB_MSM_PROD_RESTO_MAQ_HORA maquina,
                                                 bool esMultilinea, bool esAsignar, bool esDividir)
        {
            ReturnValue returnValue = new ReturnValue();
            COB_MSM_PROD_RESTO_MAQ_HORA_BREAD context = new COB_MSM_PROD_RESTO_MAQ_HORA_BREAD();


            string filtro = string.Format("{{ID_MAQUINA}} = '{0}' AND {{FECHA_INICIO}} = '{1}' AND {{FECHA_FIN}} = '{2}'", idMaquina, fechaInicio.ToString("yyyy-MM-dd HH:mm:ss"), fechaFin.ToString("yyyy-MM-dd HH:mm:ss"));
            Collection<COB_MSM_PROD_RESTO_MAQ_HORA> lstCobH = context.Select("", 0, -1, filtro);

            if (lstCobH.Count > 0)
            {
                COB_MSM_PROD_RESTO_MAQ_HORA cobM = lstCobH.FirstOrDefault();

                cobM.CONTADOR_PRODUCCION = maquina.CONTADOR_PRODUCCION;
                cobM.CONTADOR_PRODUCCION_AUTO = maquina.CONTADOR_PRODUCCION_AUTO;
                cobM.CONTADOR_RECHAZOS = maquina.CONTADOR_RECHAZOS;
                cobM.CONTADOR_RECHAZOS_AUTO = maquina.CONTADOR_RECHAZOS_AUTO;
                cobM.ID_ORDEN = maquina.ID_ORDEN;
                cobM.ID_PARTICION = maquina.ID_PARTICION;
                cobM.FECHA_FIN = maquina.FECHA_FIN;
                cobM.FECHA_INICIO = maquina.FECHA_INICIO;
                cobM.TIEMPO_PLANIFICADO = maquina.TIEMPO_PLANIFICADO;

                if (esAsignar)
                {
                    cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                }
                else if (esDividir)
                {
                    cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                }
                else
                {
                    if (cobM.VELOCIDAD_NOMINAL <= 0 || maquina.VELOCIDAD_NOMINAL == 0)
                    {
                        cobM.VELOCIDAD_NOMINAL = maquina.VELOCIDAD_NOMINAL;
                    }
                }

                cobM.SHC_WORK_SCHED_DAY_PK = maquina.SHC_WORK_SCHED_DAY_PK;

                returnValue = context.Edit(cobM);
            }

            return returnValue.succeeded;
        }

        public static bool Editar_WO_JDE_Status(string status, string idWO)
        {
            ReturnValue returnValue = new ReturnValue();
            COB_MSM_WO_JDE_BREAD context = new COB_MSM_WO_JDE_BREAD();

            string filtro = string.Format("{{ID_WO_SIT}} = '{0}'", idWO);
            Collection<COB_MSM_WO_JDE> lstCobFinded = context.Select("", 0, -1, filtro);

            if (lstCobFinded.Count > 0)
            {
                COB_MSM_WO_JDE cobFindend = lstCobFinded.FirstOrDefault();
                cobFindend.ESTADO_WO_SIT = status;
                cobFindend.FECHA_ULTIMA_MOD = DateTime.Now;

                returnValue = context.Edit(cobFindend);
            }
           

            return returnValue.succeeded;
        }
        public static bool CrearHistoricoOffset(COB_MSM_HISTORICO_ORDENES cobHistorico)
        {
            ReturnValue returnValue = new ReturnValue();
            COB_MSM_HISTORICO_ORDENES_BREAD context = new COB_MSM_HISTORICO_ORDENES_BREAD();

            returnValue = context.Create(cobHistorico);

            return returnValue.succeeded;
        }

        public static bool EliminarHistorico(string idOrden)
        {
            ReturnValue returnValue = new ReturnValue();
            string filtro = string.Format("{{ORDER_ID}} LIKE '{0}%'", idOrden);
            COB_MSM_HISTORICO_ORDENES_BREAD contextHO = new COB_MSM_HISTORICO_ORDENES_BREAD();
            Collection<COB_MSM_HISTORICO_ORDENES> lstCobH = contextHO.Select("", 0, -1, filtro);

            foreach (COB_MSM_HISTORICO_ORDENES cobH in lstCobH)
            {
                returnValue = contextHO.Delete(cobH);
            }

            return returnValue.succeeded;
        }
    }
}
