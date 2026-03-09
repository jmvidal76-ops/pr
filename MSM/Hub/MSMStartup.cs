using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(MSM.MSMStartup))]

namespace MSM
{
    public class MSMStartup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
