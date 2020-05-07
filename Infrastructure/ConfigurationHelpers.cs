using System;
using System.IO;
using XYZToDo.Infrastructure.Abstract;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace XYZToDo.Infrastructure
{
    // public class TypeComparator : IComparer<string>
    // {
    //     //Sort by time(#1) and later by event(#2) in the order  G, Y, R, S

    //     //If event type and time is same, sort by team name(#1), then employee name(#2) alphabetically
    //     public int Compare(string x, string y) // return negative if first is smaller
    //     {

    //         if( x== "G" && y ==  "Y"){
    //             return -1;
    //         }
    //         else if( x== "G" && y ==  "R"){
    //             return -1;
    //         }
    //         else if( x== "G" && y ==  "S"){
    //             return -1;
    //         }


    //         else if( x== "Y" && y ==  "G"){
    //             return 1;
    //         }
    //         else if( x== "Y" && y ==  "R"){
    //             return -1;
    //         }
    //         else if( x== "Y" && y ==  "S"){
    //             return -1;
    //         }

    //         else if( x== "R" && y ==  "G"){
    //             return 1;
    //         }
    //         else if( x== "R" && y ==  "Y"){
    //             return 1;
    //         }
    //         else if( x== "R" && y ==  "S"){
    //             return -1;
    //         }



    //         else if( x== "S" && y ==  "G"){
    //             return 1;
    //         }
    //         else if( x== "S" && y ==  "Y"){
    //             return 1;
    //         }
    //         else if( x== "S" && y ==  "R"){
    //             return 1;
    //         }

    //         return 0;

            
    //     }
    // }
    // public class EventSpecial
    // {

    //     public string teamName;
    //     public string employee;
    //     public string time;
    //     public string eventType;
    //     public string employee2;

    // }

    public class ConfigurationHelpers : IConfigurationHelpers
    {
        public IConfiguration Configuration
        {
            get
            {
                string basePath = Directory.GetCurrentDirectory(); //Gets the current working directory of the application.
                return new ConfigurationBuilder().SetBasePath(basePath).AddJsonFile("appsettings.json", false, reloadOnChange: true).Build();
            }

        }

        // public static List<string> getEventsOrder(string team1, string team2, List<string> events1, List<string> events2)
        // {
        //     List<string> all = new List<string>(); // all events
        //     foreach (var e in events1)
        //     {
        //         all.Add(team1 + " " + e);
        //     }
        //     foreach (var e in events2)
        //     {
        //         all.Add(team2 + " " + e);
        //     }

        //     List<EventSpecial> latest = new List<EventSpecial>();

        //     //Sort by time(#1) and later by event(#2) in the order  G, Y, R, S

        //     //If event type and time is same, sort by team name(#1), then employee name(#2) alphabetically

        //     foreach (var e in all)
        //     {
        //         string[] eParts = e.Split(' '); // 
        //         string teamName = eParts[0];
        //         string employee = eParts[1];
        //         string time = eParts[2];
        //         string eventType = eParts[3];

        //         string employee2 = null;
        //         if (eParts.Length == 5)
        //         {
        //             employee2 = eParts[4]; // 5th
        //         }

        //         latest.Add(new EventSpecial { teamName = teamName, employee = employee, time = time, eventType = eventType, employee2 = employee2 });


        //     }
        //     latest = latest.OrderBy(e => e.time).ThenBy( e2 => e2.time, new TypeComparator()).ThenBy(e3 => e3.teamName).ThenBy(e4 => e4.employee).ThenBy(e5 => e5.employee2).ToList();

        //     List<string> lines= new List<string>();
        //     foreach (EventSpecial eParts in latest)
        //     {
        //         string line = eParts.teamName + " " + eParts.employee + " " + eParts.time + " " + eParts.eventType + " " + (eParts.employee2 != null ?  eParts.employee2 : "");
        //         lines.Add(line);
        //     }
        //     return lines;

        // }
    }

}
