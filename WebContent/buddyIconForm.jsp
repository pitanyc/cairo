<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html" />
    <title></title>
  </head>

  <body onload="paintBuddyIconPalette()">
    <iframe name="bgFrame" id="bgFrame" src="blank.jsp"></iframe>
    <form name="uploadForm" action="ucbi.do" target="bgFrame" method="post" enctype="multipart/form-data">
    <!-- <form name="uploadForm" action="" onsubmit="paintCustomBuddyIconCropper()" target="bgFrame" method="post" enctype="multipart/form-data"> -->
      <input type="hidden" name="targetFileName" value=""/>

      <label class="customUpload">
        <input type="file" name="file" title="Custom Icon" accept="image/bmp,image/jpeg,image/gif,image/png" onchange="handleCustomPickerUploadEvent(this, CUSTOM_BUDDY_ICON_DIR, top.cairo.customBuddyIcon)" onmouseover="handleCustomPickerMouseEvent(document.getElementById('buddyIconPalette'), BUDDY_ICONS, 'focus')" onmouseout="handleCustomPickerMouseEvent(document.getElementById('buddyIconPalette'), BUDDY_ICONS, '')"/>
      </label>

    </form>
  </body>
</html>