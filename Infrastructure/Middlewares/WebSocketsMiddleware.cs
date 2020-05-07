using System;
using System.IO;
using XYZToDo.Infrastructure.Abstract;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace XYZToDo.Infrastructure
{
public class WebSocketsMiddleware
    {
        private readonly RequestDelegate _next; // A function that can process and HTTP request

        public WebSocketsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext) // Injected from ASP.NET Core
        {
            var request = httpContext.Request;

            // Web sockets cannot pass headers so we must take the access token from query param and
            // add it to the header before authentication middleware runs
            if (request.Path.StartsWithSegments("/api/hubs", StringComparison.OrdinalIgnoreCase) &&
                request.Query.TryGetValue("access_token", out var accessToken))
            {
                request.Headers.Add("Authorization", $"Bearer {accessToken}");
            }

            await _next(httpContext); // We added authentication header to HttpRequest object of HttpContext(all of an HTTP request)
        }
    }
}