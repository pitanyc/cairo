<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html" />
	<title></title>
	<script>
	  window.onload = function(e) {
		e = e || event;
        var t = <%= request.getParameter("t") %>;
		if(t==1) top.frames[0].sendBuddyIcon();
		else if(t==2) top.frames[0].paintWallpaper();
		else if(t==3) top.frames[0].handleFileUploadCallbackEvent( e, <%= request.getAttribute("ct") %> );
		else alert('Oops!  There has been an error with the upload...');
	  }
	</script>
  </head>
  <body></body>
</html>