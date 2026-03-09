using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using MSM.BBDD.Planta;
using MSM.Models.Envasado;
using MSM.Models.Planta;
using MSM.RealTime;
using MSM.Security;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;


namespace MSM.Controllers.Planta
{
    // [Authorize]
    public class UsuariosController : ApiController
    {
        /// <summary>
        /// Obtiene todos los usuarios que estan activos en el sistema
        /// </summary>
        /// <returns>Lista de nombres de los usuarios</returns>        
        [HttpGet]
        [Route("api/usuariosActivos")]
        public IEnumerable<string> usuariosActivos()
        {
            List<string> usuarios = new List<string>();
            foreach (Sesion s in PlantaRT.usuarios.Values)
            {
                usuarios.Add(s.usuario);
            }
            return usuarios;
        }

        // agomezn 090816: devuelve el listado de nombres de usuario que tienen una sesión abierta una sesión abierta
        [HttpGet]
        [Route("api/usuariosSesionAbierta")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public IEnumerable<string> usuariosSesionAbierta()
        {
            List<string> listaUsuariosSesionAbierta;
            try
            {
                listaUsuariosSesionAbierta = PlantaRT.usuarios.Keys.Cast<string>().ToList();
            }
            catch
            {
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_LISTAR"));
            }

            return listaUsuariosSesionAbierta;
        }

        [HttpGet]
        [Route("api/crearUsuario/{userName}")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public HttpResponseMessage crearUsuario(string userName)
        {

            try
            {
                Usuario usuario = new Usuario(userName, userName);
                UserManager<Usuario> manager = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
                if (manager.FindByName(usuario.UserName) != null)
                    return Request.CreateResponse(HttpStatusCode.OK, "El usuario ya existe");
                else
                {
                    manager.Create(usuario, usuario.password);
                    return Request.CreateResponse(HttpStatusCode.OK, "Usuario creado correctamente");
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearUsuario", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.crearUsuario", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_NUEVO"));
            }
        }

        /// <summary>
        /// Crea un nuevo rol en el sistema
        /// </summary>
        /// <param name="nombreRol">El nombre del rol</param>
        /// <returns>Validación de la operación</returns>
        [HttpPost]
        [Route("api/crearRol")]
        public HttpResponseMessage crearRol(IdentityRole rol)
        {

            try
            {
                RoleManager<IdentityRole> manager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(new ApplicationDbContext()));
                if (manager.FindByName(rol.Name) != null)
                    return Request.CreateResponse(HttpStatusCode.OK, "El rol ya existe");
                else
                {
                    var pp = manager.Create(rol);
                    return Request.CreateResponse(HttpStatusCode.OK, "Rol creado correctamente");
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearRol", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.crearRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_NUEVO_ROL"));
            }
        }

        /// <summary>
        /// Asigna un rol a un usuario
        /// </summary>
        /// <param name="usuario"></param>
        /// <param name="rol"></param>
        /// <returns></returns>

        //[HttpPost]
        //[Route("api/asignarRol")]
        //public HttpResponseMessage asignarRol(UsuarioRolRequest datosPeticion)
        [HttpGet]
        [Route("api/asignarRol/{userName}/{rolName}")]
        public HttpResponseMessage asignarRol(string userName, string rolName)
        {

            try
            {
                UsuarioRolRequest datosPeticion = new UsuarioRolRequest(userName, rolName);

                UserManager<Usuario> manager = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
                //Miramos que el usuario no pertenezca ya a ese rol.
                //Si el rol no existiera, daría un error. Como en la vista se presentará un combo con todos los roles existentes, no preguntamos antes si 
                //el rol existe. Aún así, se capturaría en el Try
                Usuario usuario = manager.FindByName(datosPeticion.NombreUsuario);
                if (!manager.IsInRole(usuario.Id, datosPeticion.NombreRol))
                {
                    manager.AddToRole(manager.FindByName(datosPeticion.NombreUsuario).Id, datosPeticion.NombreRol);
                    return Request.CreateResponse(HttpStatusCode.OK, "El rol ha sido asignado correctamente al usuario");
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK, "El usuario ya está asignado al rol");
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearRol", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.AsignarRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_NUEVO_ROL"));
            }
        }

        [Route("api/ObtenerUsuariosAdmin")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public object obtenerUsuarios()
        {
            try
            {
                List<UsuarioRolRequest> listUserRoles = new List<UsuarioRolRequest>();
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            List<Usuario> listUsers = manager.Users.ToList();
                            foreach (Usuario user in listUsers)
                            {
                                List<string> listRoles = manager.GetRoles(user.Id).ToList();
                                string roles = (listRoles.Count > 0) ? listRoles.Aggregate((a, x) => string.Format("{0}, {1}", a, x)) : string.Empty;
                                UsuarioRolRequest userRol = new UsuarioRolRequest()
                                {
                                    IdUser = user.Id,
                                    NombreRol = roles,
                                    NombreUsuario = user.UserName,
                                    Activo = Convert.ToInt32(!user.LockoutEnabled)
                                };
                                listUserRoles.Add(userRol);
                            }
                        }
                    }
                }

                return listUserRoles;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AdministracionController.obtenerUsuarios", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UsuariosController.obtenerUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_USUARIOS"));
            }
        }

        [Route("api/ObtenerRoles")]
        [HttpGet]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles,
                      Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public object obtenerRoles()
        {
            try
            {
                List<Rol> listRol = new List<Rol>();
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (RoleStore<Rol> roleStore = new RoleStore<Rol>(context))
                    {
                        using (RoleManager<Rol> manager = new RoleManager<Rol>(roleStore))
                        {
                            listRol = manager.Roles.ToList();
                        }
                    }
                }
                return listRol;
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "AdministracionController.obtenerRoles", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "UsuariosController.obtenerRoles", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LOS_ROLES"));
            }
        }

        /// <summary>
        /// Crea un usuario en el sistema
        /// </summary>
        /// <param name="usuario">Los datos del usuario a crear</param>
        /// <returns>Validación de la operación</returns>       
        [HttpPost]
        [Route("api/crearUsuario")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public object crearUsuario(dynamic user)
        {
            try
            {
                Usuario usuario = new Usuario(user.name.Value, user.password.Value);

                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            manager.UserValidator = new UserValidator<Usuario>(manager)
                            {
                                AllowOnlyAlphanumericUserNames = false,
                                RequireUniqueEmail = false,                                
                            };
                            //Creamos el usuario
                            if (FindByNameCaseNotSensitive(manager,usuario.UserName) != null)
                                return new object[] { true, "El usuario ya existe" };
                            else
                            {
                                IdentityResult result = manager.Create(usuario, usuario.password);
                                if (result.Succeeded)
                                {
                                    if (user.role != null)
                                    {
                                        usuario = manager.FindByName(usuario.UserName);
                                        if (!manager.IsInRole(usuario.Id, (string)user.role.Name.Value))
                                        {
                                            result = manager.AddToRole(usuario.Id, (string)user.role.Name.Value);
                                            if (result.Succeeded)
                                            {
                                                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.crearUsuario", string.Format("Usuario creado y rol asignado correctamente al usuario: {0}", usuario.UserName), HttpContext.Current.User.Identity.Name);
                                                return new object[] { true, "Usuario creado y rol asignado correctamente al usuario" };
                                            }
                                            else
                                            {
                                                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.crearUsuario", string.Format("Usuario creado correctamente, error al asignar el rol al usuario: {0}", usuario.UserName), HttpContext.Current.User.Identity.Name);

                                                return new object[] { true, "Usuario creado correctamente, error al asignar el rol al usuario" };
                                            }
                                        }
                                        else
                                        {

                                            return new object[] { true, "El usuario ya está asignado al rol" };
                                        }
                                    }
                                    else
                                    {
                                        return new object[] { true, "Usuario creado correctamente" };
                                    }
                                }
                                else
                                {
                                    return new object[] { false, "No se ha podido crear el usuario" };
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearUsuario", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.CrearUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_NUEVO"));
            }
        }

        private Usuario FindByNameCaseNotSensitive(UserManager<Usuario> manager, string userName)
        {
            Usuario user = manager.Users.Where(u => u.UserName.ToLower().Equals(userName.ToLower())).FirstOrDefault();

            return user;
        }

        /// <summary>
        /// Crea un usuario en el sistema
        /// </summary>
        /// <param name="usuario">Los datos del usuario a crear</param>
        /// <returns>Validación de la operación</returns>       
        [HttpPost]
        [Route("api/editarUsuario")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public async Task<object> editarUsuario(dynamic user)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            manager.UserValidator = new UserValidator<Usuario>(manager)
                            {
                                AllowOnlyAlphanumericUserNames = false,
                                RequireUniqueEmail = false
                            };
                            //Buscamos el usuario que se va a modificar
                            Usuario usuario = manager.FindById((string)user.iduser.Value);
                            if (usuario == null)
                                return new object[] { true, "El usuario no existe" };
                            else
                            {
                                //Modificamos sus datos
                                usuario.UserName = (string)user.name.Value;
                                usuario.LockoutEnabled = !((bool)user.activo.Value);
                                if (!string.IsNullOrEmpty(user.password.Value))
                                {
                                    string newHashPass = manager.PasswordHasher.HashPassword((string)user.password.Value);
                                    await userStore.SetPasswordHashAsync(usuario, newHashPass);
                                }
                                IdentityResult result = manager.Update(usuario);
                                if (!result.Succeeded)
                                {
                                    return new object[] { false, "No se ha podido modificar el usuario" };
                                }
                                else
                                {
                                    //Modificamos el rol al que pertenece si es necesario.
                                    string role = manager.GetRoles(usuario.Id).ToList().FirstOrDefault();

                                    if (string.IsNullOrEmpty(role) && (user.role != null))
                                    {
                                        result = manager.AddToRole(usuario.Id, (string)user.role.Name.Value);
                                        return result.Succeeded ? new object[] { true, "Usuario modificado correctamente" } : new object[] { true, "No se ha podido modificar el rol del usuario" };
                                    }
                                    else if (user.role != null && !role.Equals((string)user.role.Name.Value))
                                    {
                                        //Quitamos el rol al que pertenecía
                                        result = manager.RemoveFromRole(usuario.Id, role);
                                        if (result.Succeeded)
                                        {
                                            result = manager.AddToRole(usuario.Id, (string)user.role.Name.Value);
                                            if (result.Succeeded) 
                                            {
                                                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.editarUsuario", string.Format("Usuario {0}, modificado correctamente", usuario.UserName), HttpContext.Current.User.Identity.Name);
                                                return new object[] { true, "Usuario modificado correctamente" }; 
                                            } else 
                                            {
                                                return new object[] { true, "Usuario creado correctamente, error al asignar el rol al usuario" }; 
                                            }
                                        }
                                        else
                                        {
                                            return new object[] { true, "No se ha podido modificar el rol del usuario" };
                                        }
                                    }
                                    else
                                    {
                                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.editarUsuario", string.Format("Usuario {0}, modificado correctamente", usuario.UserName), HttpContext.Current.User.Identity.Name);
                                        return new object[] { true, "Usuario modificado correctamente" };
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.editarUsuario", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.EditarUsuario", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_UN"));
            }
        }

        /// <summary>
        /// Crea un usuario en el sistema
        /// </summary>
        /// <param name="usuario">Los datos del usuario a crear</param>
        /// <returns>Validación de la operación</returns>       
        [HttpPost]
        [Route("api/bloquearUsuario/{idUser}")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public object bloquearUsuario(string idUser)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            Usuario usuario = manager.FindById(idUser);
                            if (usuario == null)
                                return new object[] { false, "El usuario no existe" };
                            else
                            {
                                usuario.LockoutEnabled = true;
                                IdentityResult result = manager.Update(usuario);
                                if (result.Succeeded)
                                {
                                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.bloquearUsuario", string.Format("Usuario {0}, bloqueado correctamente", usuario.UserName), HttpContext.Current.User.Identity.Name);
                                    return new object[] { true, "Usuario bloqueado correctamente" };
                                }
                                else
                                {
                                    return new object[] { false, "No se ha podido bloquear el usuario" };
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.bloquearUsuario", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.BloquearUsuarios", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_BLOQUEAR"));
            }
        }

        /// <summary>
        /// Crea un nuevo rol en el sistema
        /// </summary>
        /// <param name="nombreRol">El nombre del rol</param>
        /// <returns>Validación de la operación</returns>
        [HttpPost]
        [Route("api/crearNuevoRol")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles)]
        public object crearNuevoRol(dynamic rolData)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (RoleStore<Rol> roleStore = new RoleStore<Rol>(context))
                    {
                        using (RoleManager<Rol> manager = new RoleManager<Rol>(roleStore))
                        {
                            string rolName = (string)rolData.name.Value;
                            if (manager.FindByName(rolName) != null)
                                return new object[] { true, "El rol ya existe" };
                            else
                            {
                                Rol rol = new Rol(rolName);
                                IdentityResult result = manager.Create(rol);
                                if (result.Succeeded)
                                {
                                    //Asociamos las funciones a los roles
                                    List<int> listaFunciones = rolData.funciones.ToObject<List<int>>();
                                    string id_rol = manager.FindByName(rolName).Id;
                                    using (MSM.BBDD.Model.MESEntities contextModel = new MSM.BBDD.Model.MESEntities())
                                    {
                                        List<MSM.BBDD.Model.PERMISOS> listPermisos = new List<BBDD.Model.PERMISOS>();
                                        foreach (int Id_funcion in listaFunciones)
                                        {
                                            MSM.BBDD.Model.PERMISOS permiso = new BBDD.Model.PERMISOS();
                                            permiso.ID_ROL = id_rol;
                                            permiso.ID_FUNCION = Id_funcion;
                                            listPermisos.Add(permiso);
                                        }
                                        contextModel.PERMISOS.AddRange(listPermisos);
                                        contextModel.SaveChanges();
                                    }
                                    DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.crearNuevoRol", string.Format("Rol {0}, creado correctamente", rol.Name), HttpContext.Current.User.Identity.Name);
                                    return new object[] { true, "El rol se ha creado correctamente" };
                                }
                                else
                                {
                                    return new object[] { false, "No se ha podido crear el rol" };
                                }
                            }
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearNuevoRol", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.CrearNuevoRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CREAR_NUEVO_ROL"));
            }
        }

        /// <summary>
        /// Crea un nuevo rol en el sistema
        /// </summary>
        /// <param name="nombreRol">El nombre del rol</param>
        /// <returns>Validación de la operación</returns>
        [HttpPost]
        [Route("api/editarRol")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles)]
        public object editarRol(dynamic rolData)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (RoleStore<Rol> roleStore = new RoleStore<Rol>(context))
                    {
                        using (RoleManager<Rol> manager = new RoleManager<Rol>(roleStore))
                        {
                            string rolId = (string)rolData.Id.Value;
                            Rol rol = manager.FindById(rolId);
                            if (rol == null)
                                return new object[] { true, "El rol no existe" };
                            else
                            {
                                //Asociamos las funciones a los roles
                                List<int> listaFunciones = rolData.funciones.ToObject<List<int>>();

                                using (MSM.BBDD.Model.MESEntities contextModel = new MSM.BBDD.Model.MESEntities())
                                {
                                    List<MSM.BBDD.Model.PERMISOS> listFuncionesRol = contextModel.PERMISOS.Where(p => p.ID_ROL == rol.Id).ToList();

                                    List<MSM.BBDD.Model.PERMISOS> listPermisosDel = listFuncionesRol.Where(p => !listaFunciones.Contains(p.ID_FUNCION)).ToList();

                                    List<int> listFuncionesAdd = listaFunciones.Where(p => !listFuncionesRol.Select(q => q.ID_FUNCION).ToList<int>().Contains(p)).ToList();

                                    contextModel.PERMISOS.RemoveRange(listPermisosDel);

                                    List<MSM.BBDD.Model.PERMISOS> listPermisos = new List<BBDD.Model.PERMISOS>();
                                    foreach (int Id_funcion in listFuncionesAdd)
                                    {
                                        MSM.BBDD.Model.PERMISOS permiso = new BBDD.Model.PERMISOS();
                                        permiso.ID_ROL = rol.Id;
                                        permiso.ID_FUNCION = Id_funcion;
                                        listPermisos.Add(permiso);
                                    }
                                    contextModel.PERMISOS.AddRange(listPermisos);
                                    contextModel.SaveChanges();
                                }
                                //Modificamos el nombre si es necesario
                                if (!rol.Name.Equals((string)rolData.name.Value))
                                {
                                    rol.Name = (string)rolData.name.Value;
                                    IdentityResult result = manager.Update(rol);
                                    if (result.Succeeded)
                                    {
                                        DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.editarRol", string.Format("Rol {0}, modificado correctamente", rol.Name), HttpContext.Current.User.Identity.Name);
                                        return new object[] { true, "El rol se ha modificado correctamente" };
                                    }
                                    else
                                    {
                                        return new object[] { false, "No se ha podido modificar el nombre del rol." };
                                    }
                                }
                            }
                        }
                    }
                }
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.editarRol", string.Format("Rol {0}, modificado correctamente", (string)rolData.name.Value), HttpContext.Current.User.Identity.Name);
                return new object[] { true, "El rol se ha modificado correctamente" };
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.editarRol", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.EditarRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_EDITAR_ROL"));
            }
        }

        /// <summary>
        /// Crea un nuevo rol en el sistema
        /// </summary>
        /// <param name="nombreRol">El nombre del rol</param>
        /// <returns>Validación de la operación</returns>
        [HttpPost]
        [Route("api/eliminarRol/{idRol}")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_2_GestionRoles)]
        public object eliminarRol(string idRol)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (RoleStore<Rol> roleStore = new RoleStore<Rol>(context))
                    {
                        using (RoleManager<Rol> manager = new RoleManager<Rol>(roleStore))
                        {
                            Rol rol = manager.FindById(idRol);
                            if (rol == null)
                                return new object[] { false, IdiomaController.GetResourceName("ROL_NO_EXISTE") };
                            else
                            {
                                //Comprobamos si el rol tiene usuarios asociados
                                List<Usuario> listUsers = null;
                                using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                                {
                                    using (UserManager<Usuario> managerUser = new UserManager<Usuario>(userStore))
                                    {
                                        listUsers = managerUser.Users.Where(u => u.Roles.Select(r => r.RoleId).Contains(rol.Id) && !u.LockoutEnabled).ToList();
                                    }
                                }

                                if (listUsers != null && listUsers.Count > 0)
                                {
                                    return new object[] { false, IdiomaController.GetResourceName("ROL_USUARIOS_ASOCIADOS") };
                                }
                                else
                                {
                                    //En primer lugar borramos los permisos asociados al rol
                                    using (MSM.BBDD.Model.MESEntities contextModel = new MSM.BBDD.Model.MESEntities())
                                    {
                                        List<MSM.BBDD.Model.PERMISOS> listPermisos = contextModel.PERMISOS.Where(p => p.ID_ROL == rol.Id).ToList();

                                        contextModel.PERMISOS.RemoveRange(listPermisos);

                                        contextModel.SaveChanges();
                                        IdentityResult result = manager.Delete(rol);
                                        if (result.Succeeded)
                                        {
                                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.eliminarRol", string.Format(IdiomaController.GetResourceName("ROL_MOFICADO"), rol.Name), HttpContext.Current.User.Identity.Name);
                                            return new object[] { true, IdiomaController.GetResourceName("ROL_BORRADO") };
                                        }
                                        else
                                        {

                                            return new object[] { false, IdiomaController.GetResourceName("ROL_NO_BORRADO") };
                                        }

                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.eliminarRol", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.EliminarRol", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ROL_ERROR_BORRADO"));
            }
        }
        //        /// <summary>
        ///// Asigna un rol a un usuario
        ///// </summary>
        ///// <param name="usuario"></param>
        ///// <param name="rol"></param>
        ///// <returns></returns>
        //   [AllowAnonymous]
        //   [HttpGet]
        //   [Route("api/crearusu")]
        //   public bool crearusu()
        //   {

        //       try
        //       {

        //           var manager = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));

        //           var user = new Usuario("oficial", "oficial");

        //           manager.Create(user, "oficial");

        //           RoleManager<Rol> managerRol = new RoleManager<Rol>(new RoleStore<Rol>(new ApplicationDbContext()));
        //           Rol r = new Rol("oficial");
        //           if (managerRol.FindByName("oficial") != null)
        //           {
        //               //return false;
        //           }
        //           else
        //           {
        //               var pp = managerRol.Create(r);
        //           }
        //           manager.AddToRole(manager.FindByName("oficial").Id, "oficial");
        //          // var roleresult = manager.AddToRole(currentUser.Id, "oficial");
        //           return true;

        //       }
        //       catch (Exception ex)
        //       {
        //           DAO_Log.registrarLog(DateTime.Now, "UsuariosController.crearRol", ex, HttpContext.Current.User.Identity.Name);
        //           throw new Exception("Error al crear nuevo rol");

        //       }          
        //   }

        // Borra un usuario en el sistema // agomezn 100616: 082 Nuevos botones en Administración para borrar usuario y cerrar su sesión
        [HttpPost]
        [Route("api/borrarUsuario/{idUser}")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)]
        public object BorrarUsuario(string idUser)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            Usuario usuario = manager.FindById(idUser);
                            if (usuario == null)
                                return new object[] { false, "El usuario no se pudo borrar porque no existe" };
                            usuario.LockoutEnabled = true;
                            IdentityResult result = manager.Delete(usuario);
                            if (result.Succeeded)
                            {
                                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.BorrarUsuario", string.Format("Usuario {0}, borrado correctamente", usuario.UserName), HttpContext.Current.User.Identity.Name);
                                return new object[] { true, "El usuario fue borrado correctamente" };
                            }
                            return new object[] { false, "No se ha podido borrar el usuario" };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.BorrarUsuario", excepcion, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.BorrarUsuario", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_BORRAR"));
            }
        }

        [HttpPost] // agomezn 040816: 2.3 del PowerPoint, el usuario debe ser capaz de cambiar la contraseña
        [Route("api/cambiarContraseniaUsuario")]
        // [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)] // agomezn 040816: TODO, permisos para 2.3 y 18.3 de PowerPoint
        public async Task<object> CambiarContraseniaUsuario(dynamic user)
        {
            try
            {
                using (ApplicationDbContext context = new ApplicationDbContext())
                {
                    using (UserStore<Usuario> userStore = new UserStore<Usuario>(context))
                    {
                        using (UserManager<Usuario> manager = new UserManager<Usuario>(userStore))
                        {
                            //Buscamos el usuario que se va a modificar
                            Usuario usuario = manager.FindByName((string)user.name.Value);
                            if (usuario == null)
                                return new object[] { true, "El usuario no existe" };
                            //Modificamos sus datos
                            usuario.UserName = (string)user.name.Value;
                            if (!string.IsNullOrEmpty(user.password.Value))
                            {
                                string newHashPass = manager.PasswordHasher.HashPassword((string)user.password.Value);
                                await userStore.SetPasswordHashAsync(usuario, newHashPass);
                            }
                            IdentityResult result = manager.Update(usuario);
                            if (!result.Succeeded)
                            {
                                return new object[] { false, "No se ha podido cambiar la contraseña de usuario" };
                            }
                            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.CambiarContraseniaUsuario", string.Format("Contraseña de l usuario {0} cambiada correctamente", usuario.UserName), HttpContext.Current.User.Identity.Name);
                            return new object[] { true, "Contraseña cambiada correctamente" };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.CambiarContraseniaUsuario", ex, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.CambiarContraseniaUsuario", "WEB-PLANTA", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_AL_CAMBIAR"));
            }
        }

        // Cierra una sesión abierta de usuario  // agomezn 080816
        [HttpPost]
        [Route("api/cerrarSesionUsuario/{idUser}")]
        [ApiAuthorize(Funciones.UC_GEN_USR_MNG_1_GestionUsuarios)] // agomezn 080816: TODO, permisos para 101 de Excel de incidencias
        public object CerrarSesionUsuario(string idUser)
        {
            try
            {
                if(!PlantaRT.usuarios.Contains(idUser))
                {
                    return new object[] { true, "La sesión de usuario  no existe" };
                }
                PlantaRT.usuarios.Remove(idUser);
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "UsuariosController.BorrarUsuario", string.Format("Sesión de usuario {0}, cerrada correctamente", idUser), HttpContext.Current.User.Identity.Name);
                return new object[] { true, "La sesión de usuario fue cerrada correctamente" };
            }
            catch (Exception ex)
            {
                //DAO_Log.registrarLog(DateTime.Now, "UsuariosController.CerrarSesionUsuario", excepcion, HttpContext.Current.User.Identity.Name);
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 2, ex.Message + " -> " + ex.StackTrace, "UsuariosController.CerrarSesionUsuario", "WEB-PLANTA", "Sistema");
                return new object[] { false, "No se ha podido cerrar la sesión de usuario" };
                // throw new Exception("Error al cerra la sesión de un usuario")
            }
        }
    }
}
