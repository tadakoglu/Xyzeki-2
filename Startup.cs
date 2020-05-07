using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.HttpsPolicy;
using XYZToDo.Models.DatabasePersistanceLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Includes JwtBearerDefaults.AuthenticationScheme
using Microsoft.IdentityModel.Tokens; // Includes TokenValidationParameters
using XYZToDo.Infrastructure;
using System.Diagnostics;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.Repository;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Hubs;

using Newtonsoft.Json.Serialization;
using System.IO;
using Microsoft.AspNetCore.SignalR;
using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.FileProviders;
using StackExchange.Redis;

namespace XYZToDo
{
    public class Startup
    {
        //We'll use ASP.NET Core to serve Angular static files for now. (Angular will be on back-end server)
        //Important: If backend and frontend server have different IP's or same IP's with different ports, then enable CORS(Cross-origin-support) on ASP.NET Core to be able to access Web API resources from Angular client. Unless, you won't be able to.
        public IConfiguration Configuration { get; }
        JWTHelpers jwtHelpers;
        IHostingEnvironment _env;
        public Startup(IConfiguration configuration, IHostingEnvironment _env)
        {
            Configuration = configuration;
            this._env = _env;
            this.jwtHelpers = new JWTHelpers();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<XYZToDoSQLDbContext>();// Register to DI (configuration is in db context)
            services.AddMvc().AddJsonOptions(options =>
            {
                options.SerializerSettings.ContractResolver = new DefaultContractResolver(); // Don't use automatic camelCase converting in API !
            });  //or force converting to camelCase ,new CamelCasePropertyNamesContractResolver(); , that is default option.


            services.AddCors(options =>
            {
                options.AddPolicy("EnableCORS", builder =>
                {
                    //builder.SetIsOriginAllowedToAllowWildcardSubdomains().WithOrigins("https://*." + Configuration["JWT:NakedHostname"], Configuration["JWT:FrontEndWebServer"]).AllowAnyHeader().AllowAnyMethod().AllowCredentials().Build();
                     builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod().AllowCredentials().Build();
                    //builder.WithOrigins(Configuration["JWT:FrontEndWebServer"]).AllowAnyHeader().AllowAnyMethod().AllowCredentials().Build();
                    //https://docs.microsoft.com/en-us/aspnet/core/signalr/security?view=aspnetcore-2.2
                    // .AllowAnyHeader() .WithMethods("GET", "POST")   .AllowCredentials(); for signalr

                });    //Only allow  Angular 7 client app(so the front-end IP) to access Web API(so the back-end IP))
            });

            services.AddMvc();


            services.AddSingleton<IConfiguration>(Configuration); // That will inject Configuration into our Controllers via dependency injection.

            //Dependency Injection Transients.
            services.AddTransient<IJWTHelpers, JWTHelpers>();
            services.AddTransient<ICryptoHelpers, CryptoHelpers>();
            services.AddTransient<IAuthRepository, AuthRepository>();
            services.AddTransient<IMemberRepository, MemberRepository>();
            services.AddTransient<IMemberSettingRepository, MemberSettingRepository>();
            services.AddTransient<IMemberLicenseRepository, MemberLicenseRepository>();
            services.AddTransient<ITeamRepository, TeamRepository>();
            services.AddTransient<ITeamMemberRepository, TeamMemberRepository>();
            services.AddTransient<IQuickTodoRepository, QuickTodoRepository>();
            services.AddTransient<IQuickTodoCommentRepository, QuickTodoCommentRepository>();
            services.AddTransient<IProjectRepository, ProjectRepository>();

            services.AddTransient<IProjectToDoRepository, ProjectToDoRepository>();
            services.AddTransient<IProjectToDoCommentRepository, ProjectToDoCommentRepository>();

            services.AddTransient<IPrivateTalkRepository, PrivateTalkRepository>();
            services.AddTransient<IPrivateTalkReceiverRepository, PrivateTalkReceiverRepository>();
            services.AddTransient<IPrivateTalkTeamReceiverRepository, PrivateTalkTeamReceiverRepository>();
            services.AddTransient<IPrivateTalkMessageRepository, PrivateTalkMessageRepository>();

            services.AddTransient<SmtpClient>((serviceProvider) =>
            {
                var config = serviceProvider.GetRequiredService<IConfiguration>();
                return new SmtpClient()
                {
                    Host = config.GetValue<String>("Email:Smtp:Host"),
                    Port = config.GetValue<int>("Email:Smtp:Port"),
                    EnableSsl = true,
                    Credentials = new NetworkCredential(
                            config.GetValue<String>("Email:Smtp:Username"),
                            config.GetValue<String>("Email:Smtp:Password")
                        )
                };
            });

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => { options.TokenValidationParameters = jwtHelpers.TokenValidationParameters; });



            bool IsRedirectionToHTTPSPortOpen = Boolean.Parse(Configuration["IsRedirectionToHTTPSPortOpen"]);


            if (!_env.IsDevelopment() && IsRedirectionToHTTPSPortOpen)
            {
                services.AddHttpsRedirection(options =>
                {
                    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
                    options.HttpsPort = int.Parse(Configuration["HTTPSPort"]); /* UseHttpsRedirection requires a HTTPS port to be set. This is same as HTTP port for now. */
                    //There should exists a HTTPS port on back-end web server.
                });
            }

            services.AddSignalR(options =>
            {
                options.ClientTimeoutInterval = TimeSpan.FromMilliseconds(15000);
                options.KeepAliveInterval = TimeSpan.FromMilliseconds(5000);
                options.EnableDetailedErrors = true;
            }); // To get the Microsoft.AspNetCore.SignalR running we have to add it to DI Container
            
            
            // services.AddSignalR(options =>
            // {
            //     options.EnableDetailedErrors = true;
            // }).AddRedis(Configuration["XYZToDoDatabases:XYZToDoRedis:ConnectionString"], options =>
            // {
            //     options.Configuration.ChannelPrefix = "XyzekiApp";
            //     options.ConnectionFactory = async writer =>
            //     {
            //         var config = new ConfigurationOptions
            //         {
            //             AbortOnConnectFail = false
            //         };
            //         config.EndPoints.Add(IPAddress.Loopback, 0);
            //         config.SetDefaultPorts();
            //         var connection = await ConnectionMultiplexer.ConnectAsync(config, writer);
            //         connection.ConnectionFailed += (_, e) =>
            //         {
            //             Console.WriteLine("Connection to Redis failed.");
            //         };

            //         if (!connection.IsConnected)
            //         {
            //             Console.WriteLine("Did not connect to Redis.");
            //         }

            //         // connection.ConnectionRestored += (_, e) =>
            //         // {
            //         //     Console.WriteLine("Connection to Redis Established.");
            //         // };

            //         //  if (connection.IsConnected)
            //         // {
            //         //     Console.WriteLine("Connected to Redis.");
            //         // }

            //         return connection;
            //     };
            // });




            services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();


        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseCors("EnableCORS"); // If we use front-end and back-end web servers with different ports on same ip, then we yet have to enable cors to allow front-end to access back-end

            // app.UseHsts();
            // app.UseHttpsRedirection();//Redirect HTTP to HTTPS, This won't redirect unless we speficy a HTTPS port,  This is in Microsoft.AspNetCore.HttpsPolicy namespace.
            app.UseMiddleware<WebSocketsMiddleware>(); //Middleware should be before UseAuthentication() ref, //https://medium.com/@tarik.nzl/asp-net-core-and-signalr-authentication-with-the-javascript-client-d46c15584daf
            app.UseAuthentication(); //Enable JWT Auth. 

            app.UseDefaultFiles();

            // app.UseStaticFiles();          
          
            // app.UseStaticFiles(new StaticFileOptions()
            // {
            //   FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot\.well-known")),
            //   RequestPath = new PathString("/.well-known"),
            //   ServeUnknownFileTypes = true // serve extensionless files
            // });


            app.UseStatusCodePages();
            app.UseMvc(); // Attribute routing is included here.

            //app.UseMvcWithDefaultRoute();   

            app.UseSignalR(routeBuilder =>
            {
                routeBuilder.MapHub<XyzekiNotificationHub>("/api/hubs/XyzekiNotificationHub");
                // routeBuilder.MapHub<PrivateTalkNotificationHub>("/api/hubs/PrivateTalkNotificationHub");

                // routeBuilder.MapHub<PrivateTalkMessageNotificationHub>("/api/hubs/PrivateTalkMessageNotificationHub");

                // routeBuilder.MapHub<ProjectNotificationHub>("/api/hubs/ProjectNotificationHub");

                // routeBuilder.MapHub<QuickToDoNotificationHub>("/api/hubs/QuickToDoNotificationHub");

                // routeBuilder.MapHub<ProjectToDoNotificationHub>("/api/hubs/ProjectToDoNotificationHub",
                // options => { options.ApplicationMaxBufferSize = 5120; options.TransportMaxBufferSize = 5120; });

                // routeBuilder.MapHub<TeamMemberNotificationHub>("/api/hubs/TeamMemberNotificationHub");

                // routeBuilder.MapHub<CommentNotificationHub>("/api/hubs/CommentNotificationHub");

                // routeBuilder.MapHub<ContainerNotificationHub>("/api/hubs/ContainerNotificationHub");
                // routeBuilder.MapHub<ContainerBlobNotificationHub>("/api/hubs/ContainerBlobNotificationHub");

            });


            // Route all unknown requests to app root
            app.Use(async (context, next) =>
            {
                await next();

                // If there's no available file and the request doesn't contain an extension, we're probably trying to access a page.
                // Rewrite request to use app root
                if (!context.Request.Path.Value.StartsWith("/api") && context.Response.StatusCode == 404) //  && !Path.HasExtension(context.Request.Path.Value)
                {
                    context.Request.Path = "/index.html"; // Put your Angular root page here 
                    context.Response.StatusCode = 200; // Make sure we update the status code, otherwise it returns 404
                    await next();
                }
            });

            app.UseFileServer();


        }
    }
}
