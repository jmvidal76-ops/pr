<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="InformeFPA.aspx.cs" Inherits="MSM.Informes.InformeFPA" %>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <asp:ScriptManager ID="sm" runat="server"></asp:ScriptManager>
            <rsweb:ReportViewer ID="ReportViewer1" runat="server" Font-Names="Verdana" Font-Size="8pt" ProcessingMode="Remote" WaitMessageFont-Names="Verdana" WaitMessageFont-Size="14pt" Height="500px" Width="500px" KeepSessionAlive="false" >
                <ServerReport ReportPath="/Interspec/FPA rev03 11" />
            </rsweb:ReportViewer>
        </div>
    </form>
</body>
</html>
