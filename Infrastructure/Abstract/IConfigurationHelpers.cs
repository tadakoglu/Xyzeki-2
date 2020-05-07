using System;
using Microsoft.Extensions.Configuration;

namespace XYZToDo.Infrastructure.Abstract
{
    public interface IConfigurationHelpers
    {
         IConfiguration Configuration{get;}
    }
}
