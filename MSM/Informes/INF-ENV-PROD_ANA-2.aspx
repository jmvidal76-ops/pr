<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="INF-ENV-PROD_ANA-2.aspx.cs" Inherits="MSM.Informes.INF_ENV_PROD_ANA_2" %>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

</head>
<body>
    <form id="form1" runat="server">
    <div>
                <input type="button" id="printBTN" runat="server" value="Imprimir como PDF" style="border:0; color:gray; cursor:pointer; background-color:transparent; font-size:8pt; font-family:Verdana; width:130px; position:relative; top:23px; left:550px" onserverclick="printBTN_Click"  />

        <asp:ScriptManager ID="sm" runat="server"></asp:ScriptManager>
    <rsweb:ReportViewer ID="ReportViewer1" runat="server" Font-Names="Verdana" Font-Size="8pt" ProcessingMode="Remote" WaitMessageFont-Names="Verdana" WaitMessageFont-Size="14pt" Height="500px" Width="500px" KeepSessionAlive="false" >
        <ServerReport ReportPath="/MES_MSM/INF_ENV_PROD_ANA_2"  />    
        
        </rsweb:ReportViewer>
    </div>
    </form>
    
</body>
</html>
