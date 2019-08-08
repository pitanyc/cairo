<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%@ include file="/include_tld.jsp" %>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html" />
    <meta http-equiv="imagetoolbar" content="no" />
	<title>Cairo</title>
	<link rel="stylesheet" type="text/css" href="css/canvas.css"/>
	<link rel="stylesheet" type="text/css" href="css/buddylist.css"/>
	<link rel="stylesheet" type="text/css" href="css/dialog.css"/>
	<link rel="stylesheet" type="text/css" href="css/popups.css"/>
	<link rel="stylesheet" type="text/css" href="css/combobox.css"/>
    <link rel="stylesheet" type="text/css" href="css/customupload.css"/>

    <script src="js/dojo.js" type="text/javascript"></script>
    <script src="js/jsonp.min.js" type="text/javascript"></script>
    <script src="js/js_constants.jsp" type="text/javascript"></script>
    <script src="js/rijndael.js" type="text/javascript"></script>
    <script src="js/styler.js" type="text/javascript"></script>
    <script src="js/ajax.js" type="text/javascript"></script>
    <script src="js/utils.js" type="text/javascript"></script>
    <script src="js/dialog.js" type="text/javascript"></script>
    <script src="js/paint.js" type="text/javascript"></script>
    <script src="js/events.js" type="text/javascript"></script>
    
    <script language="JavaScript" type="text/javascript">
      dojo.require('dojo.widget.*');
      dojo.addOnLoad(canvasOnLoad);
      dojo.addOnUnload(canvasOnUnLoad);

      JSONP.init({
        error: function(ex) {
          console.log("Failed to load: " + ex.url);
		},
		timeout: 3000 // timeout in millis before error callback will be called if not yet completed
	  });      
    </script>

  </head>
  <body>



	<% /* ----------------------------------------------- */ %>
	<% /*                GLOBAL CONTROLS                  */ %>
    <div id="globalControls">
      <h1>C2.0</h1>

	  <% /* This is the ajax wait indicator. */ %>
      <img id="waitIndicator" src="http://farm4.static.flickr.com/3124/3225368795_6ba0a62195_o.gif" alt="Please Wait..." title="Please Wait..."/>

	  <% /* This is the Settings link.
      <span style="left:140px; top:15px" class="settings" onmouseover="this.className='settingsFocus'" onmouseout="this.className='settings'" onclick="handleSettingsEvent()" title="Settings">Settings</span>
	  <span style="left:187px; top:15px" class="settings">|</span>
	  <span style="left:197px; top:15px" class="settings" onmouseover="this.className='settingsFocus'" onmouseout="this.className='settings'" onclick="handleLogout()" title="Settings">Logout</span>
	     */ %>

      <% /* This is the sound checkbox. */ %>
	  <div class="options">
	    <input type="checkbox" id="soundCheckbox" onclick="handleSoundCheckboxEvent(this)" dojoType="Checkbox"/>
		<label for="soundCheckbox">Sound</label>
		<span id="soundSettings" onmouseover="this.className='focus'" onmouseout="this.className=''" onclick="handleSoundSettingsEvent()" title="Change your sound settings">( none )</span>
      </div>

	  <% /* This is the blinker checkbox. */ %>
	  <div class="options">
	    <input type="checkbox" id="blinkerCheckbox" onclick="handleBlinkerCheckboxEvent(this)" dojoType="Checkbox"/>
		<label for="blinkerCheckbox">Blinker</label>
		<span id="blinkerSettings" onmouseover="this.className='focus'" onmouseout="this.className=''" onclick="handleBlinkerSettingsEvent()" title="Change your blinker settings">( unlimited )</span>
	  </div>

	  <% /* This is the wallpaper checkbox. */ %>
	  <div class="options">
	    <input type="checkbox" id="wallpaperCheckbox" onclick="handleWallpaperCheckboxEvent()" dojoType="Checkbox"/>
		<label for="wallpaperCheckbox">Wallpaper</label>
		<span id="wallpaperPicker" onmouseover="this.className='focus'" onmouseout="this.className=''" onclick="handleWallpaperPickerEvent()" title="Change your wallpaper"></span>
	  </div>
	</div>



	<% /* ----------------------------------------------- */ %>
	<% /*                    BUDDY LIST                   */ %>
	<div id="buddyList">
	    
		<% /* buddyListHeader */ %>
		<div id="buddyListHeader">
		  <div class="topbarList">
		    <a class="top"></a>
		    <span class="mid"></span>
		    <a class="close"></a>
		    <a class="max" onMouseOver="this.className='maxhover'" onMouseOut="this.className='max'" title="Maximize" onclick="this.parentNode.parentNode.ondblclick(event);"></a>
		    <a class="min" onMouseOver="this.className='minhover'" onMouseOut="this.className='min'" title="Minimize" onclick="this.parentNode.parentNode.parentNode.minimizeBuddyList(event);"></a>
		  </div>
		  <div class="topmenuList">
		    <span class="left"></span>
		    <span class="mid">
			
			  <% /* This is MY BUDDY ICON (painted by JS right after login) */ %>
			  <% /* <img id="myBuddyIcon" src="..." alt="Change buddy icon"/> */ %>

			  <% /* This is MY USERNAME (painted by JS right after login) */ %>
			  <div id="myUserName"></div>

			  <% /* Status dropdown */ %>
			  <button id="myStatusButton"
			  class="combobox"
              style="width:110px;"
			  onmouseover="setClassName(event, this, 'comboboxFocus');"
			  onmouseout="clearClassName(event, this, 'combobox');"
			  onclick="handleStatusDropdownEvent()"
			  title="Change your status">
				<span>Online</span>
				<img src="img/buddy_list/white_down_arrow.gif"/>
			  </button>

		    </span>
		    <span class="right"></span>
		  </div>
		</div> <% /* EOF: buddyListHeader */ %>


		<% /* buddyListContent */ %>
		<div class="iwinList">
		  <span class="left"></span>
		  <div class="mid">
			<% /* This is where the buddies reside. */ %>
			<div id="buddyListContent"></div>
		  </div>
		  <span class="right"></span>
		</div> <% /* EOF: buddyListContent */ %>


		<% /* buddyListFooter */ %>
		<div class="btmmenuList">
		  <span class="left"></span>
		  <span class="mid">

			<% /* Add/remove icons. */ %>
			<div style="height:30px;">
			  <% /*
			  <img src="img/buddy_list/cairo_protocol_online.gif" alt="Add buddy" title="Add buddy" onclick="alert('Coming soon...')"/>
			  <img src="img/buddy_list/cairo_protocol_away.gif" alt="Remove buddy" title="Remove buddy" onclick="alert('Coming soon...')"/>
			  */ %>
			</div>

            <% /* Show offline buddies. */ %>
			<span style="position:absolute;">
              <input type="checkbox" id="showOfflineCheckbox" onclick="handleShowOfflineCheckboxEvent(this)" dojoType="Checkbox"/><label for="showOfflineCheckbox">Show offline buddies</label>
			</span>

			<% /* Logout button. */ %>
			<img id="logout" src="img/buddy_list/logout.gif" alt="Logout" title="Logout" onclick="handleLogout()"/>

		  </span>
		  <span class="right"></span>
		</div>
		<div class="btmbarList">
		  <span class="left"></span>
		  <div class="mid"></div>
		  <span class="right"></span>
		</div> <% /* EOF: buddyListFooter */ %>

	</div> <% /* EOF: buddyList */ %>

  </body>
</html>