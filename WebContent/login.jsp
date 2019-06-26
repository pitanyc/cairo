<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <meta http-equiv="content-type" content="text/html" />
  <title>Login</title>
  <link rel="stylesheet" type="text/css" href="css/login.css">
  <script type="text/javascript" src="js/sha1.js"></script>
  <script type="text/javascript" src="js/login.js"></script>
</head>
<body onload="o();">

  <form action="canvas.jsp" method="post" onsubmit="return v()">
	<div id="lineDiv" style="margin-top:15%;">
	  <div id="horizontalDiv">
		<div id="leftBox">
          <div id="logo">Cairo</div>
		</div>
	    <div id="rightBox">
		  <span id="rightBoxContent">
			  <div id="welcome">Welcome</div>
			  <div id="err"></div>
			  <div class="input">Username: <input type="text" id="userName" name="userName" onfocus="s(this, 1)" onblur="s(this, 0)" maxlength="10"/></div>
			  <div class="input">Password: <input type="password" id="password" name="password" readonly="true" value="istanbul" onfocus="s(this, 1)" onblur="s(this, 0)"/></div>
			  <div id="button" title="GO"><input type="image" id="goButton" src="img/canvas/go.png"/></div>
		  </span>
		</div>
	  </div>
	</div>
  </form>

  <!-- copyright -->
  <div id="copyright">
    <jsp:useBean id="date" class="java.util.Date" />
    <fmt:formatDate value="${date}" pattern="yyyy" var="currentYear" />
      &copy; <span><c:out value="${currentYear}" /></span>
      <a href="http://www.peterszocs.com" target="_blank">Peter Szocs</a>
  </div>

</body>
</html>