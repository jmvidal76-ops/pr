using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSM.Mappers.DTO
{
    public enum PatchOperation
    {
        Add,
        Remove,
        Replace
        //,Move, Copy, Test     // Parte del estandar, no implementados actualmente
    }

    public class MPatchOperation
    {
        public int Id { get; set; }
        public List<MPatch> Patches { get; set; }
    }

    public class MPatch
    {
        public PatchOperation Op { get; set; } // Operación: add, remove, replace, move, copy, test
        public string Path { get; set; } // Ruta al campo: "/property/subproperty"
        //public string From { get; set; } // Ruta de origen (para "move" y "copy")
        public object Value { get; set; } // Valor (para "add", "replace", y "test")
    }
}