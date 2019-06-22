<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html" />
    <meta http-equiv="imagetoolbar" content="no" />
	<title>Cropper</title>
	<script src="js/prototype.js"                           type="text/javascript"></script>	
 	<script src="js/scriptaculous.js?load=builder,dragdrop" type="text/javascript"></script>
	<script src="js/cropper.js"                             type="text/javascript"></script>	
</head>
<body>
	<h3>Preview buddy icon</h3>
	<img src="img/castle.jpg" id="fullSizeImage"/>
	<div id="rightCol">
		<span id="previewText">Preview:</span>
		<div id="previewArea"></div>
	</div>
	<div id="buttons">
		<button onclick="alert('todo')">OK</button>
		<button onclick="alert('todo')">Cancel</button>
	</div>
</body>
</html>