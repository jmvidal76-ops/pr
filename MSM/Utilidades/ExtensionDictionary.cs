using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public static class ExtensionDictionary
    {
        public static TValue GetValueOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, TKey key, TValue defaultValue = default(TValue))
        {
            TValue value;
            return dictionary.TryGetValue(key, out value) ? value : defaultValue;
        }
    }
}