
namespace Common.Models.Material
{
    public class MaterialUnitsDto
    {
        public int PK { get; set; }
        public string DefinitionID { get; set; }
        public decimal Factor { get; set; }
        public string SourceUoMID { get; set; }
        public string TargetUoMID { get; set; } 
    }
}
