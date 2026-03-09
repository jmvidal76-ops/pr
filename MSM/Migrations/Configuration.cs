namespace MSM.Migrations
{
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using MSM.Controllers;
    using MSM.Models;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<MSM.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(MSM.Models.ApplicationDbContext context)
        {
            //UsuariosController controladorUsuarios = new UsuariosController();
            //controladorUsuarios.crearUsuario(new Usuario("oficial", "oficial"));
            //var manager = new UserManager<Usuario>(new UserStore<Usuario>(new ApplicationDbContext()));
            
            //var usuario = new Usuario()
            //{
            //    UserName = "oficial"
            //};

            //manager.Create(user, "idomidom");
        }
    }
}
