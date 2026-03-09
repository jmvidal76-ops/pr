using Siemens.Brewing.Shared;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads;
using Siemens.SimaticIT.CO_SitMesComponent_ENG.Breads.Types;
using Siemens.SimaticIT.POM.Breads;
using SITCAB.DataSource.Libraries;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using Siemens.SimaticIT.MES.Breads.CO;

namespace BreadMES.Envasado.Envasado
{
    public static class BreadFactory
    {
        public static T Create<T>() where T : new()
        {
            string sectionName = string.Format("{0}/{1}", "system.web", "identity");
            IdentitySection section = (IdentitySection)ConfigurationManager.GetSection(sectionName);

            string user = section.UserName;
            string pw = section.Password;

            T bread = new T();

            if (bread is Order_BREAD)
            {
                if (!string.IsNullOrEmpty(user) && !string.IsNullOrEmpty(pw))
                {
                    (bread as Order_BREAD).SetCurrentUser(user, pw, "");
                }

                return bread;
            }

            if (bread is OrderProperty_BREAD)
            {
                if (!string.IsNullOrEmpty(user) && !string.IsNullOrEmpty(pw))
                {
                    (bread as OrderProperty_BREAD).SetCurrentUser(user, pw, "");
                }

                return bread;
            }

            SitApplicationInfo.SetUser(bread);

            return bread;

        }

        public static bool checkCOBExist(string name, bool ENGCOB, bool ENVASADO)
        {
            try
            {
                string dllCOb = getRTENGCOB(ENGCOB);
                if (ENVASADO)
                {
                    Assembly assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_SitMesComponent_{0}Types.dll", dllCOb));
                    object ob = assembly.CreateInstance(name);
                    IEnumerable<Type> type = assembly.GetTypes().Where(t => t.Name.Contains(name));
                    //object obd = assembly.CreateInstance(type.ElementAt(0).FullName);
                    return type.Count() > 0 ? true : false;
                }
                else
                {
                    Assembly assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_MSM_FAB_{0}Types.dll", dllCOb));
                    object ob = assembly.CreateInstance(name);
                    IEnumerable<Type> type = assembly.GetTypes().Where(t => t.Name.Contains(name));
                    //object obd = assembly.CreateInstance(type.ElementAt(0).FullName);
                    return type.Count() > 0 ? true : false;
                }
            }
            catch (Exception)
            {
                return false;
            }

        }

        public static bool CreateCOB(string nombreCOB, List<string> lstColumns, DataRow rowValues, bool ENGCOB, bool ENVASADO)
        {
            string dllCOb = getRTENGCOB(ENGCOB);
            ReturnValue result = new ReturnValue();
            if (ENVASADO)
            {
                Assembly assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_SitMesComponent_{0}Types.dll", dllCOb));
                //object ob = assembly.CreateInstance(nombreCOB);
                if (assembly != null)
                {


                    IEnumerable<Type> types = assembly.GetTypes().Where(t => t.Name.Contains(nombreCOB));
                    if (types.Count() > 0)
                    {
                        object cob = assembly.CreateInstance(types.ElementAt(0).FullName);

                        Type type = cob.GetType();
                        PropertyInfo[] properties = type.GetProperties();

                        foreach (PropertyInfo property in properties)
                        {
                            int indexProperty = lstColumns.IndexOf(property.Name);
                            if (indexProperty >= 0)
                            {
                                object value = rowValues[indexProperty];
                                property.SetValue(cob, Convert.ChangeType(value, property.PropertyType));
                            }

                        }

                        assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_SitMesComponent_{0}Bread.dll", dllCOb));
                        if (assembly != null)
                        {
                            types = assembly.GetTypes().Where(t => t.Name.Contains(string.Format("{0}_BREAD", nombreCOB)));
                            if (types.Count() > 0)
                            {
                                object cobContext = assembly.CreateInstance(types.ElementAt(0).FullName);
                                type = cobContext.GetType();

                                MethodInfo createMethod = type.GetMethod("Create", new Type[] { cob.GetType() });
                                result = (ReturnValue)createMethod.Invoke(cobContext, new object[] { Convert.ChangeType(cob, cob.GetType()) });
                            }
                        }
                    }
                }
            }
            else
            {
                Assembly assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_MSM_FAB_{0}Types.dll", dllCOb));
                //object ob = assembly.CreateInstance(nombreCOB);
                if (assembly != null)
                {


                    IEnumerable<Type> types = assembly.GetTypes().Where(t => t.Name.Contains(nombreCOB));
                    if (types.Count() > 0)
                    {
                        object cob = assembly.CreateInstance(types.ElementAt(0).FullName);

                        Type type = cob.GetType();
                        PropertyInfo[] properties = type.GetProperties();

                        foreach (PropertyInfo property in properties)
                        {
                            int indexProperty = lstColumns.IndexOf(property.Name);
                            if (indexProperty >= 0)
                            {
                                object value = rowValues[indexProperty];
                                property.SetValue(cob, Convert.ChangeType(value, property.PropertyType));
                            }

                        }

                        assembly = Assembly.LoadFrom(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + string.Format("\\CO_MSM_FAB_{0}Bread.dll", dllCOb));
                        if (assembly != null)
                        {
                            types = assembly.GetTypes().Where(t => t.Name.Contains(string.Format("{0}_BREAD", nombreCOB)));
                            if (types.Count() > 0)
                            {
                                object cobContext = assembly.CreateInstance(types.ElementAt(0).FullName);
                                type = cobContext.GetType();

                                MethodInfo createMethod = type.GetMethod("Create", new Type[] { cob.GetType() });
                                result = (ReturnValue)createMethod.Invoke(cobContext, new object[] { Convert.ChangeType(cob, cob.GetType()) });
                            }
                        }
                    }
                }
            }

            return result.succeeded;
        }

        private static string getRTENGCOB(bool ENGCOB)
        {
            string dllCOb = string.Empty;
            if (ENGCOB)
            {
                dllCOb = "ENG";
            }
            else
            {
                dllCOb = "RT";
            }
            return dllCOb;
        }
    }
}
