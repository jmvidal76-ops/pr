namespace MSM.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UsuariosRoles : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUserRoles", "NombreUsuario", c => c.String());
            AddColumn("dbo.AspNetUserRoles", "NombreRol", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUserRoles", "NombreRol");
            DropColumn("dbo.AspNetUserRoles", "NombreUsuario");
        }
    }
}
