using System;
using System.IO;
using XYZToDo.Infrastructure.Abstract;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;

namespace XYZToDo.Infrastructure
{
    // ref. https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/mapping-users-to-connections
    public class ConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =   new Dictionary<T, HashSet<string>>();
        //key : username, values: connection ids, (same member can have many connection ids(can be both in tablet, pc and mobile))
        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }
        public string[] GetConnectionsArray(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections.ToArray();
            }

            return new string[0];;
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }
}