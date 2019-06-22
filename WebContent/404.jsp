<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ page isErrorPage="true" %>
<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <meta http-equiv="content-type" content="text/html" />
  <meta http-equiv="imagetoolbar" content="no" />
  <title>Area 404</title>
</head>
<body>
  <img src="img/canvas/404.jpg" style="margin-left:auto; margin-right: auto; margin-top: 200px; display:block;"/>

  <% /* logging the 404 error */ %>
  <% System.out.println("User got a 404 for " + request.getAttribute("javax.servlet.forward.request_uri")); %>

</body>
</html>