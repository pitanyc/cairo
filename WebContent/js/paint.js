/**
 * Initializes the global controls on the canvas from the saved cookies.
 * Called by canvasOnLoad().
 */
function initGlobals() {
    //init sound settings
    paintSoundSettingsPalette();
    handleClickFilterEvent();

    //init blinker count
	var blinkerCount = getCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER_COUNT);
	if(blinkerCount) {
		try { blinkerCount = blinkerCount - 0; } catch(e) {}
		if(blinkerCount > -1) {
            if(blinkerCount > 1) document.getElementById('blinkerSettings').innerHTML = '( ' + blinkerCount + ' mins )';
            else document.getElementById('blinkerSettings').innerHTML = '( ' + blinkerCount + ' min )';
			top.cairo.blinker.maxCount = blinkerCount;
		}
	}

	//init wallpaper picker
	var wallpaperPicker = document.getElementById('wallpaperPicker');
	var wallpaper = getCookieProperty(COOKIE_GLOBALS, GLOBALS_WALLPAPER_IMG);
	if(!wallpaper) {
		//wallpaper has never been set --> default it now
		wallpaper = WALLPAPER_UNSET;
		wallpaperPicker.innerHTML = '( Penguin )';
	} else {
		//wallpaper has been set before --> try to find it in WALLPAPERS[] array
		for(var i=0; i<WALLPAPERS.length; i++) if(WALLPAPERS[i].img==wallpaper) break;
		if(i < WALLPAPERS.length) wallpaperPicker.innerHTML = '( ' + WALLPAPERS[i].desc + ' )'; //offered wallpaper --> set wallpaper picker text to offered wallpaper's description
		else wallpaperPicker.innerHTML = '( ' + getFileName(wallpaper) + ' )';					//custom wallpaper  --> set wallpaper picker text to filename
	}
	top.cairo.customWallpaper.file = wallpaper;
	if(wallpaper.search(CUSTOM_WALLPAPER_DIR) > -1) {		//this is a custom wallpaper --> reset top.cairo.customWallpaper.counter
		var lastUnder = wallpaper.lastIndexOf('_');
		var lastDot   = wallpaper.lastIndexOf('.');
		var counter = wallpaper.substring(lastUnder + 1, lastDot);
		try { counter = counter - 0; } catch(e) {}			//convert string to number, where possible
		top.cairo.customWallpaper.counter = counter;
	}

	//init global checkboxes
	//NOTE: keep these after the global features' settings have been initialized, because the individual
	//      features (for example, wallpaper img to show) depend on the settings if the checkboxes are checked!
	if(getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND)) {
		var cb = dojo.widget.manager.getWidgetById('soundCheckbox');
		cb.checked = true;
		cb._setInfo();
		handleSoundCheckboxEvent(cb);
	}
	if(getCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER)) {
		var cb = dojo.widget.manager.getWidgetById('blinkerCheckbox');
		cb.checked = true;
		cb._setInfo();
		handleBlinkerCheckboxEvent(cb);
	}
	if(getCookieProperty(COOKIE_GLOBALS, GLOBALS_WALLPAPER)) {
		var cb = dojo.widget.manager.getWidgetById('wallpaperCheckbox');
		cb.checked = true;
		cb._setInfo();
		handleWallpaperCheckboxEvent();
	}
}


/**
 * Initializes the buddy list:
 *		- enables buddy list drag and drop
 *		- paints the logged on users on the buddy list
 */
function initBuddyList(userName) {
	//make buddy list draggable
	var buddyList = document.getElementById('buddyList');
    buddyList.onmousedown = function(e) {
      focusOnDialog(buddyList);
    };
    buddyList.onmousemove = function(e) {
      try { document.execCommand("Unselect"); } catch(e) {}
    };
    buddyList.maximizeBuddyList = function(e) {
      var totalWidth  = Math.max(buddyList.maximized.containerWidth, document.body.offsetWidth);   //total width of maximized object
      var totalHeight = Math.max(buddyList.maximized.containerHeight, document.body.offsetHeight); //total height of maximized object

      // structural elements
      var topbarMid = getElementsByClassName(buddyList, 'span', 'mid')[0];
      var topbarSpc = getElementsByClassName(buddyList, 'span', 'mid')[1];
      var iwinLeft = getElementsByClassName(buddyList, 'span', 'left')[1];
      var iwinMid = getElementsByClassName(buddyList, 'div', 'mid')[0];
      var iwinRight = getElementsByClassName(buddyList, 'span', 'right')[1];
      var btmMid = getElementsByClassName(buddyList, 'span', 'mid')[2];
      var btmSpc = getElementsByClassName(buddyList, 'div', 'mid')[1];
    
      // resize elements: WIDTH
      buddyList.style.width	= totalWidth + 'px';
      topbarMid.style.width = totalWidth - 70 + 'px';
      topbarSpc.style.width = totalWidth - 16 + 'px';
      iwinMid.style.width = totalWidth - 18 + 'px';
      btmMid.style.width = totalWidth - 16 + 'px';
      btmSpc.style.width = totalWidth - 16 + 'px';
    
      // resize elements: HEIGHT
      iwinLeft.style.height = totalHeight - 157 + 'px';
      iwinMid.style.height = totalHeight - 159 + 'px';
      iwinRight.style.height = totalHeight - 157 + 'px';
    };
    buddyList.restoreDownBuddyList = function(e) {
      var totalWidth  = buddyList.maximized.containerWidth;  //total width of restored object
      var totalHeight = buddyList.maximized.containerHeight; //total height of restored object

      // structural elements
      var topbarMid = getElementsByClassName(buddyList, 'span', 'mid')[0];
      var topbarSpc = getElementsByClassName(buddyList, 'span', 'mid')[1];
      var iwinLeft = getElementsByClassName(buddyList, 'span', 'left')[1];
      var iwinMid = getElementsByClassName(buddyList, 'div', 'mid')[0];
      var iwinRight = getElementsByClassName(buddyList, 'span', 'right')[1];
      var btmMid = getElementsByClassName(buddyList, 'span', 'mid')[2];
      var btmSpc = getElementsByClassName(buddyList, 'div', 'mid')[1];

      // resize elements: WIDTH
      buddyList.style.width	= totalWidth + 'px';
      topbarMid.style.width = totalWidth - 70 + 'px';
      topbarSpc.style.width = totalWidth - 16 + 'px';
      iwinMid.style.width = totalWidth - 18 + 'px';
      btmMid.style.width = totalWidth - 16 + 'px';
      btmSpc.style.width = totalWidth - 16 + 'px';

      // resize elements: HEIGHT
      iwinLeft.style.height = 220 + 'px';
      iwinMid.style.height = 218 + 'px';
      iwinRight.style.height = 220 + 'px';
    };
    buddyList.minimizeBuddyList = function(e) {
      minimizeDialog(buddyList);
    };
	var buddyListHeader = document.getElementById('buddyListHeader');
    buddyListHeader.ondblclick = function(e) {
      try { document.execCommand("Unselect"); } catch(e) {}
      if(buddyList.maximized) {    //restore down already maximized object
        //disconnect from window onresize event
        dojo.event.kwDisconnect({
          srcObj:     window,
          srcFunc:    "onresize",
          targetObj:  buddyList,
          targetFunc: "maximizeBuddyList",
          once:       true
        });

        // minimize the dialog
        document.body.style.cursor  = 'default';
        buddyList.restoreDownBuddyList();
		buddyList.style.top = buddyList.maximized.top + 'px';
		buddyList.style.left = buddyList.maximized.left + 'px';

        // swap maximize / tiles images
        var maximizeImg = getElementsByClassName(buddyList, 'a', 'topbarTiles|topbarTileshover')[0];
          maximizeImg.title = LABEL_MAXIMIZE;
          maximizeImg.className = 'max';
          maximizeImg.onmouseover = function(e) {
            setClassName(e, this, 'maxhover');
          };
          maximizeImg.onmouseout = function(e) {
            setClassName(e, this, 'max');
          };

        // update members
        buddyList.drag.reregister();    //turn on dragging
        buddyList.maximized = null;

      } else {				//maximize this object

        // update members
        buddyList.maximized = { left:               buddyList.offsetLeft,
                                top:                buddyList.offsetTop,
                                containerWidth:     buddyList.offsetWidth,
                                containerHeight:    buddyList.offsetHeight };
        buddyList.drag.unregister();	//turn off dragging

        // hide scrollbars, if any
        document.body.scroll = 'no';
          
        // swap maximize / tiles images
        var maximizeImg = getElementsByClassName(buddyList, 'a', 'max|maxhover')[0];
          maximizeImg.title = LABEL_TILES;
          maximizeImg.className = 'topbarTiles';
          maximizeImg.onmouseover = function(e) {
            setClassName(e, this, 'topbarTileshover');
          };
          maximizeImg.onmouseout = function(e) {
            setClassName(e, this, 'topbarTiles');
          };

        // maximize the dialog
        buddyList.style.left = '0px';   //put left to 0
        buddyList.style.top  = '0px';   //put top to 0
        buddyList.maximizeBuddyList();  //maximize the buddy list
        buddyList.style.cursor = 'default';

        //connect to window onresize event, and remaximize the buddy list accordingly!
        dojo.event.kwConnect({
          srcObj:     window,
          srcFunc:    "onresize",
          targetObj:  buddyList,
          targetFunc: "maximizeBuddyList",
          once:       true
        });
      }
    }; // EOF: buddyListHeader.ondblclick()
    buddyList.maximized = null;
    buddyList.drag = new dojo.dnd.HtmlDragMoveSource(buddyList);
	buddyList.drag.setDragHandle(buddyListHeader);

	//paint username on buddy list
	var text = document.createTextNode(USERNAME);
    if(USERNAME.length > 6) text = document.createTextNode(USERNAME.substr(0, 6) + '...');
	var myUserName = document.getElementById('myUserName');
	myUserName.appendChild(text);
	myUserName.title = USERNAME;

	//show the buddy list
	buddyList.style.display = 'block';

	//init Ctrl + 1, 2
	buddyList.focus();
}


/**
 * Paints the buddy icon palette: either shows the hidden, already painted
 * buddy icon palette, or creates it now and appends it to document.body only once.
 */
function paintBuddyIconPalette() {

	//buddy icon picker style effects
	var buddyList = document.getElementById('buddyList');
	var buddyIconPicker = document.getElementById('myBuddyIcon');
	var customBuddyIconForm = document.getElementById('customBuddyIconForm');
	buddyIconPicker.onmouseout = function (e) { this.className = 'focus'; };	//this is to keep the onhover style effects of the buddy icon picker WHEN the buddy icon palette is displayed!

	//get the buddy icon palette
	var buddyIconPalette = document.getElementById('buddyIconPalette');
	if(!buddyIconPalette) {		//buddy icon palette has never been created --> let's paint it now!
		buddyIconPalette = document.createElement('TABLE');
		buddyIconPalette.id = 'buddyIconPalette';
		var nextRow = null;
		for(var i=0; i<BUDDY_ICONS.length; i++) {
			//the next buddy icon
			var nextIcon = document.createElement('IMG');
			nextIcon.src = BUDDY_ICONS[i].img;

			//the next row --> only if divisible by 4
			if(i%4 == 0) nextRow = buddyIconPalette.insertRow(-1);

			var nextCell = nextRow.insertCell(-1);
			nextCell.className = '';													//by default each entry is NOT in focus
			nextCell.title = BUDDY_ICONS[i].desc;										//onhover show the user an alt message
			nextCell.onmouseover = function (e) { this.className = 'focus'; };			//onmouseover effects
			nextCell.onmouseout = function (e) { this.className = ''; };				//onmouseout effects
			nextCell.onclick = function(e) {
			  handleClickFilterEvent();													//hide buddyIconPalette
			  var buddyIconPicker = document.getElementById('myBuddyIcon');				//this is my buddy icon picker (ie my buddy icon on my buddy list)
			  var newBuddyIconSrc = this.firstChild.src;								//this is the image i have just selected to be my new buddy icon
			  if(newBuddyIconSrc != buddyIconPicker.src) sendBuddyIcon(newBuddyIconSrc);//validate if buddy icon was really updated --> inform chat partners about real updates only
			};
			nextCell.appendChild(nextIcon);
		}
		document.body.appendChild(buddyIconPalette);
	}

	//show click filter
	window.hideObject.push( { obj: [ buddyIconPalette, customBuddyIconForm ], cssObj: [ buddyIconPicker, '' ] } );
	maximizeClickFilter();

	//connect to window onresize event, and remaximize the click filter accordingly!
	dojo.event.kwConnect({
	  srcObj:     window,
	  srcFunc:    "onresize",
	  targetFunc: "maximizeClickFilter",
	  once:       true
	});

	//show the smiley palette
	if(buddyList.offsetLeft + buddyIconPicker.offsetLeft + buddyIconPalette.offsetWidth < document.body.offsetWidth) buddyIconPalette.style.left = buddyList.offsetLeft + (IS_IE ? DIALOG_LEFT_WIDTH : 0) + buddyIconPicker.offsetLeft + 'px';	//if there is enough space, paint it towards the RIGHT...
	else buddyIconPalette.style.left = buddyList.offsetLeft + (IS_IE ? DIALOG_LEFT_WIDTH : 0) + buddyIconPicker.offsetLeft + buddyIconPicker.offsetWidth - buddyIconPalette.offsetWidth + 'px';													//...otherwise, paint it towards the LEFT
	if(buddyList.offsetTop + buddyIconPicker.offsetTop + buddyIconPicker.offsetHeight + buddyIconPalette.offsetHeight < document.body.offsetHeight) buddyIconPalette.style.top = buddyList.offsetTop + (IS_IE ? DIALOG_TOP_HEIGHT : 0) + buddyIconPicker.offsetTop + buddyIconPicker.offsetHeight + 'px';	//if there is enough space, paint it towards the BOTTOM...
	else buddyIconPalette.style.top = buddyList.offsetTop + (IS_IE ? DIALOG_TOP_HEIGHT : 0) + buddyIconPicker.offsetTop - buddyIconPalette.offsetHeight + 'px';																																				//...otherwise, paint it towards the TOP
	buddyIconPalette.style.visibility = 'visible';

	//position the custom buddy icon file input's Browse... button right under the custom buddy icon image
	//keep this after the buddyIconPalette has been positioned on the page, because the
	//customBuddyIconForm's position depends on where the buddyIconPalette has already been positioned!
	var customBuddyIconPicker = buddyIconPalette.getElementsByTagName('IMG')[BUDDY_ICONS.length - 1].parentNode;
	customBuddyIconForm.style.left = buddyIconPalette.offsetLeft + customBuddyIconPicker.offsetLeft + 'px';
	customBuddyIconForm.style.top = buddyIconPalette.offsetTop + customBuddyIconPicker.offsetTop + 'px';
	styler.fileInput.stylizeAll(customBuddyIconForm);
	customBuddyIconForm.style.visibility = 'visible';
}


/**
 * Paints the custom buddy icon cropper.
 */
function paintCustomBuddyIconCropper() {
    // load the cropper
	loadURLIntoContainer('/cropper.jsp', 'cropperPopup', true);
	var cropperPopup = document.getElementById('cropperPopup');
	alert(cropperPopup.outerHTML);
	//maximizeFilter();

	//show the cropper
	cropperPopup.style.left = (document.body.offsetWidth - cropperPopup.style.offsetWidth) / 2 + 'px';
	cropperPopup.style.top = (document.body.offsetHeight - cropperPopup.style.offsetHeight) / 2 + 'px';
	cropperPopup.style.visibility = 'visible';

	new Cropper.ImgWithPreview( 
					'fullSizeImage',
					{
					    minWidth: 48,
						minHeight: 48,
						displayOnInit: true,
						onloadCoords: { x1: 10, y1: 10, x2: 250, y2: 100 },
						previewWrap: 'previewArea'
					}
				);
}


/**
 * Paint this user's buddy icon onto the buddy list.
 * Called by the handleGetUsersEvent() method, right after a fresh
 * login by this client.
 *
 * The incoming user parameter is a JS String of the following type:
 *		- myBuddyIconSrc: 'http://...'
 */
function paintBuddyIconOnBuddyList(myBuddyIconSrc) {
    //only paint my buddy icon if not already painted
    if( document.getElementById('myBuddyIcon') == null ) {
        USERS[USERNAME] = { userName: USERNAME,
                            status:   USER_STATUS_ONLINE };
        if(myBuddyIconSrc.search(CUSTOM_BUDDY_ICON_DIR) > -1) {		//this is a custom buddy icon --> reset top.cairo.customBuddyIcon.counter
            var lastUnder = myBuddyIconSrc.lastIndexOf('_');
            var lastDot   = myBuddyIconSrc.lastIndexOf('.');
            var counter = myBuddyIconSrc.substring(lastUnder + 1, lastDot);
            try { counter = counter - 0; } catch(e) {}				//convert string to number, where possible
            top.cairo.customBuddyIcon.counter = counter;
        }
        var myBuddyIcon = document.createElement('IMG');			//create my buddy icon
        myBuddyIcon.id = 'myBuddyIcon';
        if(myBuddyIconSrc == BUDDY_ICON_UNSET) myBuddyIcon.src = IMG_UNSET_BUDDY_ICON_SRC;
        else myBuddyIcon.src = myBuddyIconSrc;
        myBuddyIcon.alt = 'Change your buddy icon';
        myBuddyIcon.title = 'Change your buddy icon';
        myBuddyIcon.onmouseover = function(e) { this.className = 'focus'; };
        myBuddyIcon.onmouseout = function(e) { this.className = ''; };
        myBuddyIcon.onclick = function(e) { handleMyBuddyIconChangeEvent(); };
        var myUserName = document.getElementById('myUserName');		//this is my userName on the buddy list
        myUserName.parentNode.insertBefore(myBuddyIcon, myUserName);
    }
}


/**
 * Paint a single buddy onto the buddy list.
 *
 * The incoming user parameter is a JSON object of the following type:
 *		- { userName:       'abc',
 *          status:         1,
 *          customAwayMsg:  '',
 *          buddyIcon:      ''  }
 */
function paintUserOnBuddyList(user) {

    //check if buddy already painted on buddy list
    if( getBuddy(user.userName) == null ) {
        //check to see if we need to paint offline buddies --> if not, simply return
        if(user.status == USER_STATUS_OFFLINE && !dojo.widget.manager.getWidgetById('showOfflineCheckbox').checked) return;
        
        //create buddy icon
        var buddyIcon = document.createElement('IMG');
        buddyIcon.className = 'buddyIcon';
        if(user.buddyIcon == BUDDY_ICON_UNSET) buddyIcon.src = IMG_UNSET_BUDDY_ICON_SRC;
        else buddyIcon.src = user.buddyIcon;

        //create buddy status icon
        var userStatusIcon = document.createElement('IMG');
        var statusTextNode;
        if(user.status == USER_STATUS_ONLINE) {
            statusText = '';
            userStatusIcon.src = IMG_LED_STATUS_ONLINE_SRC;
        } else if(user.status == USER_STATUS_AWAY) {
            statusText = getUserStatusAsText(user.status);
            if(user.customAwayMsg != '') {
                //this is the length of the chat partner's custom away message on the buddylist
                if(user.customAwayMsg.length > 12) statusText += ': ' + user.customAwayMsg.substr(0, 12) + '...';
                else statusText += ': ' + user.customAwayMsg;
            }
            userStatusIcon.src = IMG_LED_STATUS_AWAY_SRC;
        } else if(user.status == USER_STATUS_OFFLINE) {
            statusText = getUserStatusAsText(user.status);
            userStatusIcon.src = IMG_LED_STATUS_OFFLINE_SRC;
        }

        //create userName div
        var userNameTextNode = document.createTextNode(user.userName);
        if(user.userName.length > 6) userNameTextNode = document.createTextNode(user.userName.substr(0, 6) + '...');
        var userNameSpan = document.createElement('DIV');
          userNameSpan.className = 'buddyName';
          userNameSpan.appendChild(userStatusIcon);
          userNameSpan.appendChild(document.createTextNode('\u00A0'));  //&nbsp;
          userNameSpan.appendChild(userNameTextNode);

        //create userStatus span
        var statusSpan = document.createElement('SPAN');
          statusSpan.className = 'buddyStatus';
          statusSpan.appendChild(document.createTextNode(statusText));

        //create buddy container div containing both the buddy userName and status
        var container = document.createElement('DIV');
        container.id = getBuddyId(user.userName);
        container.className = 'buddy';
        container.title = user.userName + ' is ' + getUserStatusAsText(user.status);
        if(user.customAwayMsg != '' && user.status == USER_STATUS_AWAY) container.title += ': ' + user.customAwayMsg;
        container.onmouseover = function(e) {
            if(this.className != 'buddyHover') this.className = 'buddyHover';
            window.status = '';
        };
        container.onmouseout = function(e) {
            e = e || event;
            var newEl = e.relatedTarget || e.toElement;
            if((newEl != this) &&
               (newEl != this.childNodes[0]) &&
               (newEl != this.childNodes[1]) &&
               (newEl != this.childNodes[2]) && 
               (newEl != this.childNodes[1].childNodes[0])) this.className = 'buddy';
        };
        container.onclick = function(e) { //create/focus chat window here
            var chatPartner = unescape(this.id.substr(6));
            var dialog = getDialog(chatPartner);
            if(dialog) { //dialog window already open, so focus on it
                focusOnDialog(dialog);
            } else { //dialog not yet open --> create it now!
                var dialog = new Dialog(chatPartner, buddyIcon.src);
            }
        };
        container.appendChild(buddyIcon);	    //buddy icon
        container.appendChild(userNameSpan);	//buddy user status icon, buddy name
        container.appendChild(statusSpan);		//buddy status

        //find the correct place to insert new container (alphabetical order)        
        var nextBuddy = null;
        if(user.status == USER_STATUS_OFFLINE) nextBuddy = findNextBuddy(user.userName, false);
        else nextBuddy = findNextBuddy(user.userName, true);
        if(nextBuddy == null) document.getElementById('buddyListContent').appendChild(container);
        else nextBuddy.parentNode.insertBefore(container, nextBuddy);

        USERS[user.userName] = user;	//put this chat buddy into USERS HashMap
    } else {
        //if we are here --> it means this buddy has already been painted
        if(user.status == USER_STATUS_OFFLINE && !dojo.widget.manager.getWidgetById('showOfflineCheckbox').checked) {
            var container = getBuddy(user.userName);
            container.parentNode.removeChild(container);
        }
    }
}


/**
 * Paints the status: this is the dropdown for my status on the buddy list.
 */
function paintStatusPalette() {

	//paint the next row onto the palette's table element
	function paintNextRow(container, text) {
	  //the next row
	}


	//get the buddy list, status picker elements
	var buddyList = document.getElementById('buddyList');
	var statusPicker = document.getElementById('myStatusButton');

	//onclick style effects
	statusPicker.onmouseout = function (e) { this.className = 'comboboxFocus'; };

	//get the status palette
	var statusPalette = document.getElementById('statusPalette');
	if(!statusPalette) {	//status palette has never been created --> let's paint it now!
	  statusPalette = document.createElement('DIV');
	  statusPalette.id = 'statusPalette';

      //online row
	  var onlineRow = document.createElement('DIV');
        onlineRow.className = '';											//by default each entry is NOT in focus
        onlineRow.style.fontWeight = 'bold';
        onlineRow.onmouseover = function (e) { this.className = 'focus'; }; //onmouseover effects
	    onlineRow.onmouseout = function (e) { this.className = ''; };       //onmouseout effects
	    onlineRow.onclick = function(e) {
		  handleClickFilterEvent();										  //handle click filter event
          awayRow.style.fontWeight = 'normal';
          onlineRow.style.fontWeight = 'bold';
		  changeUserStatus( USER_STATUS_ONLINE );                         //attempt to update MY user status
	    };
	    onlineRow.title = getUserStatusAsText(USER_STATUS_ONLINE);		  //onhover show the user an alt message
	    onlineRow.appendChild(document.createTextNode(getUserStatusAsText(USER_STATUS_ONLINE)));

      //custom away message input field
	  var inputCustomAwayMsg = document.createElement('INPUT');
        inputCustomAwayMsg.id = 'myCustomAwayMsg';
	    inputCustomAwayMsg.type = 'text';
        inputCustomAwayMsg.onclick = function(e) {
          e = e || event;
          dojo.event.browser.stopEvent(e);
        };
        inputCustomAwayMsg.onkeydown = function(e) {
          e = e || event;
          if(e.keyCode==ENTER_KEY) {      //ENTER_KEY = close status palette
            awayRow.onclick();
          }
        };
      
      //away row
	  var awayRow = document.createElement('DIV');
	    awayRow.className = '';											  //by default each entry is NOT in focus
	    awayRow.onmouseover = function (e) { this.className = 'focus'; }; //onmouseover effects
	    awayRow.onmouseout = function (e) { this.className = ''; };       //onmouseout effects
	    awayRow.onclick = function(e) {
		  handleClickFilterEvent();										  //handle click filter event
          onlineRow.style.fontWeight = 'normal';
          awayRow.style.fontWeight = 'bold';
	      if(inputCustomAwayMsg.value == '') awayRow.title = getUserStatusAsText(USER_STATUS_AWAY);
	      else awayRow.title = getUserStatusAsText(USER_STATUS_AWAY) + ': ' + inputCustomAwayMsg.value;
          changeUserStatus( USER_STATUS_AWAY, inputCustomAwayMsg.value ); //attempt to update MY user status
	    };
        awayRow.title = getUserStatusAsText(USER_STATUS_AWAY);     //onhover show the user an alt message
        awayRow.appendChild(document.createTextNode(getUserStatusAsText(USER_STATUS_AWAY)));
	    awayRow.appendChild(document.createTextNode(':'));
	    awayRow.appendChild(inputCustomAwayMsg);

      //assemble
      statusPalette.appendChild(onlineRow);
      statusPalette.appendChild(awayRow);

      document.body.appendChild(statusPalette);
	}

	//show click filter
	window.hideObject.push( { obj: [ statusPalette ], cssObj: [ statusPicker, 'combobox' ] } );
	maximizeClickFilter();

	//connect to window onresize event, and remaximize the click filter accordingly!
	dojo.event.kwConnect({
	  srcObj:     window,
	  srcFunc:    "onresize",
	  targetFunc: "maximizeClickFilter",
	  once:       true
	});

	//show status palette
	if(buddyList.offsetLeft + statusPicker.offsetLeft + statusPalette.offsetWidth < document.body.offsetWidth) statusPalette.style.left = buddyList.offsetLeft + (IS_IE ? DIALOG_LEFT_WIDTH : 0) + statusPicker.offsetLeft + 'px';	//if there is enough space, paint it towards the RIGHT...
	else statusPalette.style.left = buddyList.offsetLeft + (IS_IE ? DIALOG_LEFT_WIDTH : 0) + statusPicker.offsetLeft + statusPicker.offsetWidth - statusPalette.offsetWidth + 'px';													//...otherwise, paint it towards the LEFT
	if(buddyList.offsetTop + statusPicker.offsetTop + statusPicker.offsetHeight + statusPalette.offsetHeight < document.body.offsetHeight) statusPalette.style.top = buddyList.offsetTop + (IS_IE ? DIALOG_TOP_HEIGHT : 0) + statusPicker.offsetTop + statusPicker.offsetHeight + 'px';	//if there is enough space, paint it towards the BOTTOM...
	else statusPalette.style.top = buddyList.offsetTop + (IS_IE ? DIALOG_TOP_HEIGHT : 0) + statusPicker.offsetTop - statusPalette.offsetHeight + 'px';																																	//...otherwise, paint it towards the TOP
	statusPalette.style.visibility = 'visible';
}


/**
 * Paints the sound settings: this is the palette to configure the global sounds.
 */
function paintSoundSettingsPalette() {
    function updateSoundSettingsPicker() {
      soundSettingsPicker.innerHTML = '( ';
      if(checkboxLogin.checked) {
        soundSettingsPicker.innerHTML += 'online';
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGIN, '1');
      } else {
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGIN, '0');
      }
      if(checkboxLogout.checked) {
        if(soundSettingsPicker.innerHTML != '( ') soundSettingsPicker.innerHTML += '/';
        soundSettingsPicker.innerHTML += 'away';
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGOUT, '1');
      } else {
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGOUT, '0');
      }
      if(checkboxMessage.checked) {
        if(soundSettingsPicker.innerHTML != '( ') soundSettingsPicker.innerHTML += '/';
        soundSettingsPicker.innerHTML += 'message';
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_MESSAGE, '1');
      } else {
        setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_MESSAGE, '0');
      }
      if(soundSettingsPicker.innerHTML == '( ') soundSettingsPicker.innerHTML += 'none';
      soundSettingsPicker.innerHTML += ' )';
    }

    //get the sound settings picker anchor
    var soundSettingsPicker = document.getElementById('soundSettings');

    //onclick style effects
    soundSettingsPicker.onmouseout = function (e) { this.className = 'focus'; };

    //get the sound settings palette
    var checkboxLogin;
    var checkboxLogout;
    var checkboxMessage;
    var soundSettingsPalette = document.getElementById('soundSettingsPalette');
    if(!soundSettingsPalette) {	//soundSettingsPalette has never been created --> let's paint it now!
      //labels
      var labelLogin = document.createElement('LABEL');
        labelLogin.htmlFor = 'soundCheckboxLogin';
        labelLogin.style.marginLeft = '5px';
        if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGIN) == 1 ) labelLogin.style.fontWeight = 'bold';
        else labelLogin.style.fontWeight = 'normal';
        labelLogin.appendChild(document.createTextNode('Buddy Online'));
        if(!IS_IE) {
          labelLogin.onclick = function(e) {
            if(checkboxLogin.checked) {
              checkboxLogin.checked = false;
              labelLogin.style.fontWeight = 'normal';
            } else {
              checkboxLogin.checked = true;
              labelLogin.style.fontWeight = 'bold';
            }
            checkboxLogin._setInfo();
            updateSoundSettingsPicker();
	      };
        }
      var labelLogout = document.createElement('LABEL');
        labelLogout.htmlFor = 'soundCheckboxLogout';
        labelLogout.style.marginLeft = '5px';
        if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGOUT) == 1 ) labelLogout.style.fontWeight = 'bold';
        else labelLogout.style.fontWeight = 'normal';
        labelLogout.appendChild(document.createTextNode('Buddy Offline/Away'));
        if(!IS_IE) {
          labelLogout.onclick = function(e) {
            if(checkboxLogout.checked) {
              checkboxLogout.checked = false;
              labelLogout.style.fontWeight = 'normal';
            } else {
              checkboxLogout.checked = true;
              labelLogout.style.fontWeight = 'bold';
            }
            checkboxLogout._setInfo();
            updateSoundSettingsPicker();
	      };
        }
      var labelMessage = document.createElement('LABEL');
        labelMessage.htmlFor = 'soundCheckboxMessage';
        labelMessage.style.marginLeft = '5px';
        if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_MESSAGE) == 1 ) labelMessage.style.fontWeight = 'bold';
        else labelMessage.style.fontWeight = 'normal';
        labelMessage.appendChild(document.createTextNode('Incoming Message'));
        if(!IS_IE) {
          labelMessage.onclick = function(e) {
            if(checkboxMessage.checked) {
              checkboxMessage.checked = false;
              labelMessage.style.fontWeight = 'normal';
            } else {
              checkboxMessage.checked = true;
              labelMessage.style.fontWeight = 'bold';
            }
            checkboxMessage._setInfo();
            updateSoundSettingsPicker();
	      };
        }

      //dojo checkboxes
      checkboxLogin = dojo.widget.createWidget('Checkbox', {id: 'soundCheckboxLogin', widgetId: 'soundCheckboxLogin', name: 'soundCheckboxLogin'});
	  checkboxLogout = dojo.widget.createWidget('Checkbox', {id: 'soundCheckboxLogout', widgetId: 'soundCheckboxLogout', name: 'soundCheckboxLogout'});
	  checkboxMessage = dojo.widget.createWidget('Checkbox', {id: 'soundCheckboxMessage', widgetId: 'soundCheckboxMessage', name: 'soundCheckboxMessage'});
      dojo.event.connect(checkboxLogin.domNode, 'onclick', function(evt) {
        if(dojo.widget.manager.getWidgetById('soundCheckboxLogin').checked) labelLogin.style.fontWeight = 'bold';
        else labelLogin.style.fontWeight = 'normal';
        updateSoundSettingsPicker();
      });
      dojo.event.connect(checkboxLogout.domNode, 'onclick', function(evt) {
        if(dojo.widget.manager.getWidgetById('soundCheckboxLogout').checked) labelLogout.style.fontWeight = 'bold';
        else labelLogout.style.fontWeight = 'normal';
        updateSoundSettingsPicker();
      });
      dojo.event.connect(checkboxMessage.domNode, 'onclick', function(evt) {
        if(dojo.widget.manager.getWidgetById('soundCheckboxMessage').checked) labelMessage.style.fontWeight = 'bold';
        else labelMessage.style.fontWeight = 'normal';
        updateSoundSettingsPicker();
      });

	  var buttonOK = document.createElement('BUTTON');
	  buttonOK.onclick = function(e) {
        handleClickFilterEvent();
      };
	  buttonOK.appendChild(document.createTextNode('OK'));

      //the blinker palette container
      soundSettingsPalette = document.createElement('DIV');
      soundSettingsPalette.id = 'soundSettingsPalette';
      soundSettingsPalette.appendChild(checkboxLogin.domNode);
      soundSettingsPalette.appendChild(labelLogin);
      soundSettingsPalette.appendChild(document.createElement('BR'));
      soundSettingsPalette.appendChild(checkboxLogout.domNode);
      soundSettingsPalette.appendChild(labelLogout);
      soundSettingsPalette.appendChild(document.createElement('BR'));
      soundSettingsPalette.appendChild(checkboxMessage.domNode);
      soundSettingsPalette.appendChild(labelMessage);
      soundSettingsPalette.appendChild(document.createElement('BR'));
      soundSettingsPalette.appendChild(buttonOK);
	  document.body.appendChild(soundSettingsPalette);
	} else {
      checkboxLogin = dojo.widget.manager.getWidgetById('soundCheckboxLogin');
	  checkboxLogout = dojo.widget.manager.getWidgetById('soundCheckboxLogout');
	  checkboxMessage = dojo.widget.manager.getWidgetById('soundCheckboxMessage');
    }

    //initialize state --> the checkboxes (based on saved sound settings)
    if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGIN) == 1 ) {
      checkboxLogin.checked = true;
      checkboxLogin._setInfo();
    }
    if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_LOGOUT) == 1 ) {
      checkboxLogout.checked = true;
      checkboxLogout._setInfo();
    }
    if( getCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND_MESSAGE) == 1 ) {
      checkboxMessage.checked = true;
      checkboxMessage._setInfo();
    }
    updateSoundSettingsPicker();

    //show click filter
    window.hideObject.push( { obj: [ soundSettingsPalette ], cssObj: [ soundSettingsPicker, '' ] } );
    maximizeClickFilter();

    //connect to window onresize event, and remaximize the click filter accordingly!
    dojo.event.kwConnect({
      srcObj:     window,
      srcFunc:    "onresize",
      targetFunc: "maximizeClickFilter",
      once:       true
    });

    //show the palette
    if(soundSettingsPicker.offsetLeft + soundSettingsPalette.offsetWidth < document.body.offsetWidth) soundSettingsPalette.style.left = soundSettingsPicker.offsetLeft + 'px';	//if there is enough space, paint it towards the RIGHT...
    else soundSettingsPalette.style.left = soundSettingsPicker.offsetLeft + soundSettingsPicker.offsetWidth - soundSettingsPalette.offsetWidth + 'px';							//...otherwise, paint it towards the LEFT
    if(soundSettingsPicker.offsetTop + soundSettingsPicker.offsetHeight + soundSettingsPalette.offsetHeight < document.body.offsetHeight) soundSettingsPalette.style.top = soundSettingsPicker.offsetTop + soundSettingsPicker.offsetHeight + 2 + 'px';	//if there is enough space, paint it towards the BOTTOM...
    else soundSettingsPalette.style.top = soundSettingsPicker.offsetTop - soundSettingsPalette.offsetHeight + 'px';																																		//...otherwise, paint it towards the TOP
    soundSettingsPalette.style.visibility = 'visible';
}


/**
 * Paints the blinker settings: this is the palette to configure the blinker.
 */
function paintBlinkerSettingsPalette() {
	//get the blinker settings picker anchor
	var blinkerSettingsPicker = document.getElementById('blinkerSettings');
	var inputMaxBlinkCountValue = blinkerSettingsPicker.innerHTML.substring(2,blinkerSettingsPicker.innerHTML.lastIndexOf(' '));

	//onclick style effects
	blinkerSettingsPicker.onmouseout = function (e) { this.className = 'focus'; };

	//get the blinker settings palette
	var blinkerSettingsPalette = document.getElementById('blinkerSettingsPalette');
	var radioButtonUnlimitedBlinker;
	var radioButtonMaxBlinker;
	var inputMaxBlinkCount;
    var notNumber = new RegExp('^\\d*\\.?\\d*$');
	if(!blinkerSettingsPalette) {	//blinkerSettingsPalette has never been created --> let's paint it now!
	  //blinker palette components
	  if(IS_IE) {	//due to IE bug in 6.x, which makes dynamic radio buttons uncheckable, need to branch out...
		radioButtonUnlimitedBlinker = document.createElement("<input type='radio' name='blinkerType' value='0' maxlength='10' style='margin-right:5px;'>");
		radioButtonMaxBlinker       = document.createElement("<input type='radio' name='blinkerType' value='1' maxlength='10' style='margin-right:5px;'>");
      } else {				//Moz
	    radioButtonUnlimitedBlinker = document.createElement('INPUT');
        radioButtonUnlimitedBlinker.type = 'radio';
	    radioButtonUnlimitedBlinker.name = 'blinkerType';
	    radioButtonUnlimitedBlinker.value = '0';
	    radioButtonUnlimitedBlinker.maxlength = '10';
	    radioButtonUnlimitedBlinker.style.marginRight = '5px';
	    radioButtonMaxBlinker = document.createElement('INPUT');
        radioButtonMaxBlinker.type = 'radio';
	    radioButtonMaxBlinker.name = 'blinkerType';
	    radioButtonMaxBlinker.value = '1';
	    radioButtonMaxBlinker.maxlength = '10';
	    radioButtonMaxBlinker.style.marginRight = '5px';
	  }
	  radioButtonUnlimitedBlinker.onclick = function(e) {
	    radioButtonUnlimitedBlinker.checked = 'checked';
        spanMax.style.fontWeight = 'normal';
	    inputMaxBlinkCount.disabled = 'disabled';
		spanUnlimited.style.fontWeight = 'bold';
	  };
	  radioButtonMaxBlinker.onclick = function(e) {
	    radioButtonMaxBlinker.checked = 'checked';
		spanUnlimited.style.fontWeight = 'normal';
        spanMax.style.fontWeight = 'bold';
		inputMaxBlinkCount.disabled = '';
	  };
      
	  var spanUnlimited = document.createElement('SPAN');
      spanUnlimited.style.cursor = 'default';
	  spanUnlimited.appendChild(document.createTextNode('Unlimited'));
	  spanUnlimited.onclick = function(e) { radioButtonUnlimitedBlinker.onclick(); };

	  var spanMax = document.createElement('SPAN');
      spanMax.style.cursor = 'default';
	  spanMax.appendChild(document.createTextNode('Max '));
	  spanMax.onclick = function(e) { radioButtonMaxBlinker.onclick(); };

	  inputMaxBlinkCount = document.createElement('INPUT');
	  if(top.cairo.blinker.maxCount == -1) inputMaxBlinkCount.value = 5;
	  else inputMaxBlinkCount.value = top.cairo.blinker.maxCount;
	  inputMaxBlinkCount.type = 'text';
	  inputMaxBlinkCount.style.width = '30px';
	  inputMaxBlinkCount.style.margin = '0px 3px 0px 3px';
	  inputMaxBlinkCount.style.border = '1px solid #999999';
	  inputMaxBlinkCount.style.textAlign = 'right';
	  inputMaxBlinkCount.disabled = 'disabled';
      inputMaxBlinkCount.onkeydown = function(e) {
        e = e || event;
        if(e.keyCode==ENTER_KEY) {      //ENTER_KEY = close blinker settings palette
          buttonOK.onclick();
        }
      };
	  spanMax.appendChild(inputMaxBlinkCount);
	  spanMax.appendChild(document.createTextNode(' min(s)'));

	  var buttonOK = document.createElement('BUTTON');
	  buttonOK.onclick = function(e) {
        handleClickFilterEvent();	//hide blinkerPalette
        if(radioButtonUnlimitedBlinker.checked) {
		  top.cairo.blinker.maxCount = -1;
		  blinkerSettingsPicker.innerHTML = '( unlimited )';
		  setCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER_COUNT, '-1');
        } else {
          //validate input
		  inputMaxBlinkCountValue = dojo.string.trim(inputMaxBlinkCount.value);
          if(inputMaxBlinkCountValue.match(notNumber) == null || inputMaxBlinkCountValue == '') {	//means user entered not a number
			inputMaxBlinkCountValue = 1;
			inputMaxBlinkCount.value = 1;
		  }
          //round to 10 decimals max
          inputMaxBlinkCountValue = Math.round(inputMaxBlinkCountValue*Math.pow(10,10))/Math.pow(10,10);
          inputMaxBlinkCount.value = inputMaxBlinkCountValue;
          //update values
          top.cairo.blinker.maxCount = inputMaxBlinkCountValue;
          if(inputMaxBlinkCountValue > 1) blinkerSettingsPicker.innerHTML = '( ' + inputMaxBlinkCountValue + ' mins )';
          else blinkerSettingsPicker.innerHTML = '( ' + inputMaxBlinkCountValue + ' min )';
		  setCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER_COUNT, inputMaxBlinkCountValue);
		}
	  };
	  buttonOK.appendChild(document.createTextNode('OK'));

	  //the blinker palette container
	  blinkerSettingsPalette = document.createElement('DIV');
	  blinkerSettingsPalette.id = 'blinkerSettingsPalette';
	  blinkerSettingsPalette.appendChild(radioButtonUnlimitedBlinker);
	  blinkerSettingsPalette.appendChild(spanUnlimited);
	  blinkerSettingsPalette.appendChild(document.createElement('BR'));
	  blinkerSettingsPalette.appendChild(radioButtonMaxBlinker);
	  blinkerSettingsPalette.appendChild(spanMax);
	  blinkerSettingsPalette.appendChild(document.createElement('BR'));
	  blinkerSettingsPalette.appendChild(buttonOK);
	  document.body.appendChild(blinkerSettingsPalette);
	} else {
	  radioButtonUnlimitedBlinker = blinkerSettingsPalette.getElementsByTagName('INPUT')[0];
	  radioButtonMaxBlinker = blinkerSettingsPalette.getElementsByTagName('INPUT')[1];
	  inputMaxBlinkCount = blinkerSettingsPalette.getElementsByTagName('INPUT')[2];
	}

	//initialize state --> the radio buttons (based on saved blinker settings)
	if(top.cairo.blinker.maxCount == -1) radioButtonUnlimitedBlinker.onclick();
	else {
	  if(inputMaxBlinkCount.value.match(notNumber) == null || inputMaxBlinkCountValue == '') {  //this validation is here for the case when user cleared the input text and clicked on the clickfilter
		inputMaxBlinkCount.value = blinkerSettingsPicker.innerHTML.substring(2,blinkerSettingsPicker.innerHTML.lastIndexOf(' '));
	  }
	  radioButtonMaxBlinker.onclick();
	}

	//show click filter
	window.hideObject.push( { obj: [ blinkerSettingsPalette ], cssObj: [ blinkerSettingsPicker, '' ] } );
	maximizeClickFilter();

	//connect to window onresize event, and remaximize the click filter accordingly!
	dojo.event.kwConnect({
	  srcObj:     window,
	  srcFunc:    "onresize",
	  targetFunc: "maximizeClickFilter",
	  once:       true
	});

	//show blinker settings palette
	if(blinkerSettingsPicker.offsetLeft + blinkerSettingsPalette.offsetWidth < document.body.offsetWidth) blinkerSettingsPalette.style.left = blinkerSettingsPicker.offsetLeft + 'px';	//if there is enough space, paint it towards the RIGHT...
	else blinkerSettingsPalette.style.left = blinkerSettingsPicker.offsetLeft + blinkerSettingsPicker.offsetWidth - blinkerSettingsPalette.offsetWidth + 'px';							//...otherwise, paint it towards the LEFT
	if(blinkerSettingsPicker.offsetTop + blinkerSettingsPicker.offsetHeight + blinkerSettingsPalette.offsetHeight < document.body.offsetHeight) blinkerSettingsPalette.style.top = blinkerSettingsPicker.offsetTop + blinkerSettingsPicker.offsetHeight + 2 + 'px';	//if there is enough space, paint it towards the BOTTOM...
	else blinkerSettingsPalette.style.top = blinkerSettingsPicker.offsetTop - blinkerSettingsPalette.offsetHeight + 'px';																																		    //...otherwise, paint it towards the TOP
	blinkerSettingsPalette.style.visibility = 'visible';
}


/**
 * Paints the wallpaper: either show or hide the wallpaper.
 *
 * @param newWallpaperSrc: the new wallpaper image's src (optional, can be left null)
 */
function paintWallpaper(newWallpaperSrc) {
	//if newWallpaperSrc is specified:
	//		it means that this is one of the default wallpapers! In this case, we need to save out
	//      this selection, because the wallpaper might not be shown!
	//
	//if newWallpaperSrc is NOT specified:
	//		it means that either (1) this call is coming from a click on the wallpaper
	//                           checkbox, in which case we need to show or hide the correct wallpaper;
	//                           (2) this call is coming from a custom wallpaper selection, in which
	//                           case we read wallpaper source from the custom wallpaper
	//                           storage (top.cairo.customWallpaper)
	
	//figure out the new wallpaper source, and wallpaper to save into cookie
	var cookieWallpaperSrc = newWallpaperSrc;
	if(newWallpaperSrc) top.cairo.customWallpaper.file = newWallpaperSrc;
	else {
		newWallpaperSrc = top.cairo.customWallpaper.file;
		cookieWallpaperSrc = top.cairo.customWallpaper.file;
		if(newWallpaperSrc.search(CUSTOM_WALLPAPER_DIR) > -1) {		//custom wallpapers only...
			var wallpaperPicker = document.getElementById('wallpaperPicker');
			wallpaperPicker.innerHTML = '( ' + getFileName(newWallpaperSrc) + ' )'; //update the wallpaper picker
			newWallpaperSrc = rewriteURL(newWallpaperSrc);			//encode the context
		}
	}

	//show or hide the wallpaper, which is already saved into cookie
	var isDisplayed = dojo.widget.manager.getWidgetById('wallpaperCheckbox').checked;
	//var wallpaper   = document.getElementById('wallpaper');
	if(isDisplayed) {	//show wallpaper
		document.body.style.backgroundColor   = '';
		document.body.style.background        = 'url(\'' + newWallpaperSrc + '\')';
		/*
		wallpaper.src    = newWallpaperSrc;
		wallpaper.width  = document.body.offsetWidth;
		wallpaper.height = document.body.offsetHeight;
		wallpaper.style.display = 'block';
		*/
	} else {			//hide wallpaper
		document.body.style.background        = '';
		document.body.style.backgroundColor   = '#4A514A';
		/*
		wallpaper.style.display = 'none';
		*/
	}

	//save out cookies
	if(isDisplayed) setCookieProperty(COOKIE_GLOBALS, GLOBALS_WALLPAPER, '1');
	else setCookieProperty(COOKIE_GLOBALS, GLOBALS_WALLPAPER, '0');
	setCookieProperty(COOKIE_GLOBALS, GLOBALS_WALLPAPER_IMG, cookieWallpaperSrc);
}


/**
 * Paints the wallpaper palette: this is the palette to configure the wallpaper.
 */
function paintWallpaperPalette() {
	//get the wallpaper picker anchor
	var wallpaperPicker = document.getElementById('wallpaperPicker');
	var customWallpaperForm = document.getElementById('customWallpaperForm');

	//onclick style effects
	wallpaperPicker.onmouseout = function (e) { this.className = 'focus'; };

	//get the wallpaper palette
	var wallpaperPalette = document.getElementById('wallpaperPalette');
	if(!wallpaperPalette) {		//wallpaper palette has never been created --> let's paint it now!
		wallpaperPalette = document.createElement('TABLE');
		wallpaperPalette.id = 'wallpaperPalette';
		var nextRow = null;
		for(var i=0; i<WALLPAPERS.length; i++) {
			//the next wallpaper
			var nextIcon  = document.createElement('IMG');
			nextIcon.src  = WALLPAPERS[i].thumb;	//src is the thumbnail of the wallpaper
			nextIcon.src2 = WALLPAPERS[i].img;		//src2 is the original image of the wallpaper

			//the next row --> only if divisible by 4
			if(i%5 == 0) nextRow = wallpaperPalette.insertRow(-1);

			var nextCell = nextRow.insertCell(-1);
			nextCell.className = '';												//by default each entry is NOT in focus
			nextCell.title = WALLPAPERS[i].desc;									//onhover show the user an alt message
			nextCell.onmouseover = function (e) { this.className = 'focus'; };		//onmouseover effects
			nextCell.onmouseout = function (e) { this.className = ''; };			//onmouseout effects
			nextCell.onclick = function(e) {
			  handleClickFilterEvent();												//hide wallpaperPalette
			  var newWallpaperSrc = this.firstChild.src2;							//this is the image i have just selected to be my new wallpaper
			  paintWallpaper(newWallpaperSrc);										//update the wallpaper
			  newWallpaperSrc = getFileName(newWallpaperSrc);						//retrieve the file name only from the whole URL of the wallpaper
			  wallpaperPicker.innerHTML = '( ' + this.title + ' )';					//update the wallpaper picker
			};
			nextCell.appendChild(nextIcon);
		}
		document.body.appendChild(wallpaperPalette);
	}

	//show click filter
	window.hideObject.push( { obj: [ wallpaperPalette, customWallpaperForm ], cssObj: [ wallpaperPicker, '' ] } );
	maximizeClickFilter();

	//connect to window onresize event, and remaximize the click filter accordingly!
	dojo.event.kwConnect({
	  srcObj:     window,
	  srcFunc:    "onresize",
	  targetFunc: "maximizeClickFilter",
	  once:       true
	});

	//show the wallpaper palette
	if(wallpaperPicker.offsetLeft + wallpaperPalette.offsetWidth < document.body.offsetWidth) wallpaperPalette.style.left = wallpaperPicker.offsetLeft + 'px';	//if there is enough space, paint it towards the RIGHT...
	else wallpaperPalette.style.left = wallpaperPicker.offsetLeft + wallpaperPicker.offsetWidth - wallpaperPalette.offsetWidth + 'px';													//...otherwise, paint it towards the LEFT
	if(wallpaperPicker.offsetTop + wallpaperPicker.offsetHeight + wallpaperPalette.offsetHeight < document.body.offsetHeight) wallpaperPalette.style.top = wallpaperPicker.offsetTop + wallpaperPicker.offsetHeight + 'px';	//if there is enough space, paint it towards the BOTTOM...
	else wallpaperPalette.style.top = wallpaperPicker.offsetTop - wallpaperPalette.offsetHeight + 'px';																																			//...otherwise, paint it towards the TOP
	wallpaperPalette.style.visibility = 'visible';

	//position the custom wallpaper file input's Browse... button right under the custom wallpaper image
	//keep this after the wallpaperPalette has been positioned on the page, because the
	//customWallpaperForm's position depends on where the wallpaperPalette has already been positioned!
	var customWallpaperPicker = wallpaperPalette.getElementsByTagName('IMG')[WALLPAPERS.length - 1].parentNode;
	customWallpaperForm.style.left = wallpaperPalette.offsetLeft + customWallpaperPicker.offsetLeft + 'px';
	customWallpaperForm.style.top = wallpaperPalette.offsetTop + customWallpaperPicker.offsetTop + 'px';
	styler.fileInput.stylizeAll(customWallpaperForm);
	customWallpaperForm.style.visibility = 'visible';
}


/**
 * Paint a system message on a dialog (if dialog exists) about 
 * user change status, which is either a real status change or coming online/offline.
 *
 * The incoming user parameter is a JSON object of the following type:
 *		- { userName:       'abc',
 *          status:         1,
 *          customAwayMsg:  '',
 *          buddyIcon:      ''  }
 *
 * The isLogin (boolean) parameter indicates whether the user has just come
 * online as a result of a fresh login (true) or a status change (false).
 */
function paintSystemMessageOnDialogAboutUserChangeStatus(user, isLogin) {
	USERS[user.userName].status = user.status;	//update buddy's user status in USERS HashMap
	var dialog = getDialog(user.userName);
	if(dialog) { //dialog exists
        //update the user status indicator image first (ie the green/red/yellow icon next to buddy name)
        //then, paint System message about user status change
		var now = new Date();
		var message = user.userName;
		switch(user.status) {
			case USER_STATUS_ONLINE:
                dialog.buddyName.firstChild.src = IMG_LED_STATUS_ONLINE_SRC;
                dialog.buddyStatus.innerHTML = '';
				if(isLogin) message += ' has just logged on.';
				else message += ' is online.';
				break;
			case USER_STATUS_OFFLINE:
                dialog.buddyName.firstChild.src = IMG_LED_STATUS_OFFLINE_SRC;
                dialog.buddyStatus.innerHTML = getUserStatusAsText(USER_STATUS_OFFLINE);
				message += ' has just logged off.';
				break;
			case USER_STATUS_AWAY:
                dialog.buddyName.firstChild.src = IMG_LED_STATUS_AWAY_SRC;
                dialog.buddyStatus.innerHTML = getUserStatusAsText(USER_STATUS_AWAY);
				message += ' is away';
                if(user.customAwayMsg != '') {
                    //this is the length of the chat partner's custom away message on the header of the open dialog
                    if(user.customAwayMsg.length > 20) dialog.buddyStatus.innerHTML += ': ' + user.customAwayMsg.substr(0, 20) + '...';
                    else dialog.buddyStatus.innerHTML += ': ' + user.customAwayMsg;
                    message += ': ' + user.customAwayMsg;
                } else {
                    message += '.';
                }
				break;
			default:
				alert('Unknown user status... <' + user.status + '>');
				break;
		}
		paintChatStatusChange(dialog, user.userName, CHAT_STATUS_NOT_TYPING);

		var mb = { source:		'System',
		           target:		'',
		           message:		message,
		           hour:		now.getHours(),
		           minute:		now.getMinutes() };
		appendMessageToChatHistory(dialog, mb);
	}
}


/**
 * Paint a system message on a dialog (if dialog exists) about 
 * incoming special effect.
 */
function paintSystemMessageOnDialogAboutIncomingSpecialEffect(userName, effectType, effectId, isOwnDialog) {
    var dialog = getDialog(userName);
	if(dialog) { //dialog exists
		var now = new Date();
        var message = '';
        if(isOwnDialog) message += 'You have just sent ' + userName;
		else message = userName + ' has just sent you';
		switch(effectType) {
			case SPECIAL_EFFECT_TYPE_SOUND:
				message += ' the sound effect: \'' + findDescInHashMap(SOUNDS, effectId) + '\'';
				break;
			case SPECIAL_EFFECT_TYPE_VISUAL:
                message += ' the visual effect: \'' + effectId + '\'';
				break;
			default:
				alert('Unknown special effect... <' + effectType + '>');
				break;
		}
		var mb = { source:		'System',
		           target:		'',
		           message:		message,
		           hour:		now.getHours(),
		           minute:		now.getMinutes() };
		appendMessageToChatHistory(dialog, mb);
	}
}


/**
 * Update buddy icon on an existing dialog (only if dialog exists).
 *
 * The incoming user parameter is a JSON object of the following type:
 *		- { userName:'abc', buddyIcon:'http://...' }
 */
function paintBuddyIconChangeOnDialog(user) {
    var dialog = getDialog(user.userName);
    if(dialog) { //dialog exists
        dialog.buddyIcon.src = user.buddyIcon;
    }
}


/**
 * Paints the logged on user's userName on the canvas.
 */
function paintChatStatusChange(dialog, who, status) {
    //update the chat status text
    var chatStatusText = getChatStatusAsText(who, status);
    dialog.chatStatus.innerHTML = chatStatusText;

	//update the typing image
    if(status==CHAT_STATUS_TYPING) {    //if typing to me, show both text AND typing image ...
        dialog.typingImg.style.display = 'block';
    } else {                            //... else if entered text or no text, show text AND no image
        dialog.typingImg.style.display = 'none';
    }
}


/**
 * Append a single message to a given chat window's chat history div.
 */
function appendMessageToChatHistory(dialog, mb) {

	//paint smileys in a token
	function paintSmileys(token, container) {
		while(token!='') {
			
			//find first smiley in token, store:
			//		minIndex:    index in the token of the first smiley found
			//		paintIndex:  index of the smiley to paint within SMILEYS array
			//		paintLength: length of the matching regular expression
			var minIndex    = -1;
			var paintIndex  = -1;
			var paintLength = 0;
			for(var i=0; i<SMILEYS.length; i++) {
				for(var j=0; j<SMILEYS[i].regExp.length; j++) {
					var regExp = new RegExp(SMILEYS[i].regExp[j]);
					var match = regExp.exec(token);	//this returns array --> The zeroth item in the array will hold the text that was matched by the regular expression!
					if(match != null) {
						//alert(regExp);
						//alert(match);
						var smileyIndex = token.search(SMILEYS[i].regExp[j]);
						if((minIndex==-1) || (smileyIndex<minIndex)) {
							minIndex = smileyIndex;
							paintIndex = i;
							paintLength = match[0].length;
						}
					}
				}
			}
			
			//check if any smileys were found, if so, paint first one, else paint entire token as text
			if(minIndex==-1) { //no smiley found in token --> simply paint it
				var text = document.createTextNode(token);
				container.appendChild(text);
				token = '';
			} else { //smiley found --> need to paint it and chop token!
				if(minIndex > 0) { //text before first smiley
					var text = document.createTextNode(token.substr(0, minIndex));
					container.appendChild(text);
					token = token.substr(minIndex);
				}
				var img = document.createElement('IMG');
				img.src = SMILEYS[paintIndex].img;
				container.appendChild(img);
				token = token.substr(paintLength);
			}
		}
	}

	//paint a single message onto the chatHistory div
	function paintMessage(dialog, mb) {	
        //fix hour/minute formatting
        if(mb.hour   == 0) mb.hour = 12;
        if(mb.hour   < 10) mb.hour   = '0' + mb.hour;
        if(mb.minute < 10) mb.minute = '0' + mb.minute;

        //create container div, add msg metadata info
        var text = document.createTextNode('[' + mb.hour + 
                                           ':' +
                                           mb.minute + '] ' + 
                                           mb.source + ':');  //(mb.source == 'System' ? '' : (mb.source + ':')));
        var msgMetaSpan = document.createElement('SPAN');	//this is the msg meta data span
        msgMetaSpan.appendChild(text);						//append msg meta to meta span
        var container = document.createElement('SPAN');		//this is the msg content span
        var outerMostElement = container;
        if(mb.source == USERNAME) {			//myChatMessage
            //style the msg meta
            msgMetaSpan.className = 'myChatMessageMeta';

            //style the msg content --> use the same colors as those stored on the textarea!
            var fontElement = document.createElement('FONT');
            outerMostElement = fontElement;			//store the outer most element --> to know what to append to dialog.screen div
            var innerMostElement = fontElement;		//store the inner most element --> useful for BUI stuff
            fontElement.color = convertToHexColor(dialog.ta.style.color);	//conversion needed because Mozilla return dialog.ta.style.color as rgb(255,0,0), which needs to be converted to '#ff0000' first!
            fontElement.face = dialog.ta.style.fontFamily;
            container.style.fontSize = dialog.ta.style.fontSize;
            if(dialog.ta.style.fontWeight == 'bold') {
                var bElement = document.createElement('B');
                innerMostElement.appendChild(bElement);
                innerMostElement = bElement;
            }
            if(dialog.ta.style.fontStyle == 'italic') {
                var iElement = document.createElement('I');
                innerMostElement.appendChild(iElement);
                innerMostElement = iElement;
            }
            if(dialog.ta.style.textDecoration == 'underline') {
                var uElement = document.createElement('U');
                innerMostElement.appendChild(uElement);
                innerMostElement = uElement;
            }

            //end styling --> append container to inner most element
            innerMostElement.appendChild(container);
        } else if(mb.source != 'System') {	//partnerChatMessage
            //style the msg meta
            msgMetaSpan.className = 'partnerChatMessageMeta';

            //style the msg content --> use the same colors as stored on the dialog object
            var fontElement = document.createElement('FONT');
            outerMostElement = fontElement;			//store the outer most element --> to know what to append to dialog.screen div
            var innerMostElement = fontElement;		//store the inner most element --> useful for BUI stuff
            fontElement.color = convertToHexColor(mb.style.color);
            fontElement.face = mb.style.fontFamily;
            container.style.fontSize = mb.style.fontSize;
            if(mb.style.fontWeight == 'bold') {
                var bElement = document.createElement('B');
                innerMostElement.appendChild(bElement);
                innerMostElement = bElement;
            }
            if(mb.style.fontStyle == 'italic') {
                var iElement = document.createElement('I');
                innerMostElement.appendChild(iElement);
                innerMostElement = iElement;
            }
            if(mb.style.textDecoration == 'underline') {
                var uElement = document.createElement('U');
                innerMostElement.appendChild(uElement);
                innerMostElement = uElement;
            }

            //end styling --> append container to inner most element
            innerMostElement.appendChild(container);
        } else {							//systemChatMessage
            msgMetaSpan.className = 'systemChatMessageMeta';
            container.className = 'systemChatMessageContent';
        }

        //lineToken[i] is the i-th line of the msg
        var lineToken = new Array();
        var msg = escape(mb.message);
        if(msg.indexOf('%0D%0A') > -1)   lineToken = msg.split('%0D%0A');
        else if(msg.indexOf('%0A') > -1) lineToken = msg.split('%0A');
        else if(msg.indexOf('%0D') > -1) lineToken = msg.split('%0D');
        else lineToken.push(msg);

        //add title to container if this was a translated message
        if(mb.source != 'System' && mb.translate.enabled && mb.originalMessage) container.title = mb.originalMessage;

        //add http/smiley feature to msg tokens
        var httpWWWRegExp = new RegExp('http(s)?:\/\/|www\\.\\w', 'i'); //matches http/https/www
        var httpRegExp = new RegExp('http(s)?:\/\/', 'i');              //matches http/https
        var httpServerUrlRegExp = new RegExp(SERVER_URL, 'i');          //matches http://zlocker.com

        //consume each token until the tokens equal '', build dialog.screen symultaneously
        for(var i=0; i<lineToken.length; i++) {
            var msgSplit = lineToken[i].split('%20');
            for(var j=0; j<msgSplit.length; j++) {
                //unescape the token, just to be safe
                msgSplit[j] = unescape(msgSplit[j]); //msgSplit[j] is the j-th token on line i

                //prepend ' ' before each token except the first one (to avoid first space having underline, etc)
                if(j != 0) container.appendChild(document.createTextNode(' '));

                //http support
                if(msgSplit[j].match(httpWWWRegExp)) {
                    var startIndex = msgSplit[j].search(httpWWWRegExp);
                    if(startIndex > 0) {
                        var preText = msgSplit[j].substr(0, startIndex);
                        paintSmileys(preText, container);
                        msgSplit[j] = msgSplit[j].substr(startIndex);
                    }
                    var href = document.createElement('A');
                    href.target = '_new';
                    if(!msgSplit[j].match(httpRegExp)) href.href = 'http://' + msgSplit[j];
                    else href.href = msgSplit[j];
                    var fileName = msgSplit[j].substr(msgSplit[j].lastIndexOf('/')+1);
                    if( isValidFileName(fileName, IMAGE_FILE_EXTENSIONS, false) ) {
                        // IMAGE
                        var sentImage = document.createElement('IMG');
                          sentImage.className = 'sentImage';
                          sentImage.src = msgSplit[j];
                          sentImage.alt = fileName;
                          sentImage.title = fileName;
                        href.appendChild(sentImage);
                        container.appendChild( document.createElement('BR') );
                    } else {
                        // NON-IMAGE
                        if(msgSplit[j].match(httpServerUrlRegExp)) href.appendChild(document.createTextNode(fileName));
                        else href.appendChild(document.createTextNode(msgSplit[j]));
                        var vidArray = isVideoURL(msgSplit[j]);
                        if( vidArray[0] > 0 ) {
                            //video url: render video viewer
                            if( vidArray[0] == 1 ) {
                                // type #1: youtube
                                var param1 = document.createElement('PARAM');
                                  param1.name = 'movie';
                                  param1.value = 'http://www.youtube.com/v/' + vidArray[1] + '?rel=0';
                                var embed = document.createElement('EMBED');
                                  embed.src = 'http://www.youtube.com/v/' + vidArray[1] + '?rel=0';
                                  embed.type = 'application/x-shockwave-flash';
                                  embed.className = 'video';
                                var video = document.createElement('OBJECT');
                                  video.className = 'video';
                                video.appendChild(param1);
                                video.appendChild(embed);
                                container.appendChild( document.createElement('BR') );
                                container.appendChild(video);
                                container.appendChild( document.createElement('BR') );
                            }
                        }
                    }
                    container.appendChild(href);
                    msgSplit[j] = '';
                }

                //special characters
                for(var k=0; k<SPECIAL_CHARS.length; k++) {
                    var nextRegExp = new RegExp(SPECIAL_CHARS[k].ascii,'g');
                    msgSplit[j] = msgSplit[j].replace(nextRegExp, SPECIAL_CHARS[k].value);
                }

                //smiley support
                paintSmileys(msgSplit[j], container);
            }

            //put <br/> after each line except the last one!
            if(i < (lineToken.length - 1) ) container.appendChild( document.createElement('BR') );
        }

        //finally append the msg to the dialog.screen, and scroll down the div if autoscroll is enabled
        var newChatMessage = document.createElement('DIV');
        newChatMessage.appendChild(msgMetaSpan);
        newChatMessage.appendChild(document.createTextNode(' '));//put ' ' between msg meta and msg content
        newChatMessage.appendChild(outerMostElement);
        dialog.screen.appendChild(newChatMessage);
        if(DIALOGS[dialog.id].autoScroll.enabled) dialog.screen.scrollTop = dialog.screen.scrollHeight;
    }

    //entry point
    if(mb.source != USERNAME && mb.source != 'System') mb.message = b2s(e2c(h2b(mb.message),CIPHER_KEY,CIPHER_MODE));
    if(mb.source != 'System' && mb.translate.enabled) {
        top.google.language.translate(mb.message, mb.translate.from, mb.translate.to, function(result) {
            if(result.translation) {
              mb.originalMessage = mb.message;
              mb.message = result.translation.replace(': ', ':').replace('| ', '|').replace(' |', '|');
            }
            paintMessage(dialog, mb);
	        if(dojo.widget.manager.getWidgetById('blinkerCheckbox').checked) top.cairo.blinkTitle(mb.source, mb.message, dialog.id);
        });
    } else {
        paintMessage(dialog, mb);
	    if(mb.source != 'System' && dojo.widget.manager.getWidgetById('blinkerCheckbox').checked) top.cairo.blinkTitle(mb.source, mb.message, dialog.id);
    }
}


/**
 * Paints the Settings Dialog.
 */
function paintSettings() {

    // close image
    var closeImg = document.createElement('A');
      closeImg.className = 'topbarClose';
	  closeImg.title = LABEL_CLOSE;
      closeImg.onmouseover = function (e) {						//onmouseover style effects
        if(this.className != 'topbarClosehover') this.className = 'topbarClosehover';
      };
      closeImg.onmouseout = function (e) {						//onmouseout style effects
        if(this.className != 'topbarClose') this.className = 'topbarClose';
      };
      closeImg.onclick = function(e) {
        var settingsDialog = document.getElementById('settingsDialog');
        if(settingsDialog) settingsDialog.parentNode.removeChild(settingsDialog);
      };

    // title
    var title = document.createElement('SPAN');
      title.style.marginLeft = '10px';
      title.style.fontWeight = 'bold';
      title.appendChild(document.createTextNode('Settings'));

    // structural elements -- TOP PART
    var topbarTop = document.createElement('A');
      topbarTop.className = 'topbarTop';
    var topbarMid = document.createElement('SPAN');
      topbarMid.className = 'topbarMid';
      topbarMid.style.width = '487px';
      topbarMid.appendChild(title);
    var topPart = document.createElement('DIV');
      topPart.className = 'topbarActive';

    // assemble TOP PART
    topPart.appendChild(topbarTop);
    topPart.appendChild(topbarMid);
    topPart.appendChild(closeImg);

    // structural elements -- MIDDLE PART
    var midLeft = document.createElement('SPAN');
      midLeft.className = 'iwinLeft';
      midLeft.style.height = '118px';
    var midMid = document.createElement('DIV');
      midMid.className = 'topmenuMid';
      midMid.style.width = '526px';
      midMid.style.height = '118px';
      midMid.style.opacity = '0.8';
      midMid.style.filter = 'alpha(opacity=80)';
      midMid.appendChild(document.createTextNode('aaa'));
    var midRight = document.createElement('SPAN');
      midRight.className = 'iwinRight';
      midRight.style.height = '118px';
    var midPart = document.createElement('DIV');
      midPart.className = 'iwinActive';
      midPart.style.height = '0px';
    
    // assemble MIDDLE PART
    midPart.appendChild(midLeft);
    midPart.appendChild(midMid);
    midPart.appendChild(midRight);

    // structural elements -- BOTTOM PART
    var btmbarLeft = document.createElement('SPAN');
      btmbarLeft.className = 'btmbarLeft';
    var btmbarMid = document.createElement('DIV');
      btmbarMid.className = 'btmbarMid';
      btmbarMid.style.width = '531px';
    var btmbarRight = document.createElement('SPAN');
      btmbarRight.className = 'btmbarRight';
    var bottomPart = document.createElement('DIV');
      bottomPart.className = 'btmbarActive';

    // assemble BOTTOM PART
    bottomPart.appendChild(btmbarLeft);
    bottomPart.appendChild(btmbarMid);
    bottomPart.appendChild(btmbarRight);

    // create container
    var container = document.createElement('DIV');
      container.id = 'settingsDialog';
      container.appendChild(topPart);
      container.appendChild(midPart);
      container.appendChild(bottomPart);
    var drag = new dojo.dnd.HtmlDragMoveSource(container);
    document.body.appendChild(container);
}


/**************************************************************************************/
/********************                     UNUSED                         **************/
/**************************************************************************************/

/**
 * Paints the nudge effect on the passed in dialog: shakes the screen (like on MSN,
 * and then starts the opacity in-and-out fading effect).
 *
 * @param dialog - the dialog to deliver the effect on
 */
function paintNudgeEffect(dialog) {
    //shake the entire IE/FF window
    for(var i = 10; i > 0; i--) {       // i --> controls the shake size
        for(var j = 10; j > 0; j--) {   // j --> controls the shake length in time
            parent.moveBy(0,i);
            parent.moveBy(i,0);
            parent.moveBy(0,-i);
            parent.moveBy(-i,0);
        }
    }

    //start fade in/fade out on the designated dialog: make sure this is only started once!
    if(dialog.nudge.enabled == false) {
        dialog.nudge.enabled = true;
        if(dialog.DOM.style.zIndex == 10) dialog.nudge.timeOut = setTimeout('changeDialogOpacity("'+dialog.id+'", 80, 1)', dialog.nudge.speed);
        else dialog.nudge.timeOut = setTimeout('changeDialogOpacity("'+dialog.id+'", 60, 1)', dialog.nudge.speed);
    }
}