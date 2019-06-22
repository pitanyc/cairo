<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html" />
    <title></title>
  </head>

  <% /* NOTE: For Firefox 3.5+, the following property must be turned on in 'about:config':
                   signed.applets.codebase_principal_support: TRUE
     */ %>
  <body onload="netscape.security.PrivilegeManager.enablePrivilege('UniversalFileRead');
				document.getElementById('file').value = document.getElementById('targetFileName').value;
				handleFileUploadEvent(document.getElementById('file'));">
    <iframe name="bgFrame" id="bgFrame" src="blank.jsp"></iframe>
    <form name="uploadForm" action="ufile.do" target="bgFrame" method="post" enctype="multipart/form-data">
      <input type="hidden" id="targetFileName" name="targetFileName" value="<%= request.getParameter("fn") %>"/>
      <input type="hidden" id="currentTime" name="currentTime" value="<%= request.getParameter("ct") %>"/>

      <label class="customUpload">
        <input type="file" id="file" name="file" title="Send File"/>
      </label>

	</form>
  </body>
</html>