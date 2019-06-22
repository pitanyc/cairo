/**
 * This code fixes the document.getElementById() case-insensitivity problem.  
 * The problem is that IE doesn't conform to the W3 specs and the default IE
 * document.getElementById is NOT case sensitive.  Look at the following urls:
 * http://mikebulman.typepad.com/you_love_mike_bulman/2006/02/documentgetelem.html
 * http://www.sitepoint.com/forums/showthread.php?t=439467
 */
document._getElementById = document.getElementById;
document.getElementById = function(id) {
    var a = [];
    var o = document._getElementById(id);
    if(!o) return o;
    while(o && o.id != id) {
        a.push({i:o.id,e:o});
        o.id='';
        o = document._getElementById(id);
    }
    for(j=0,jj=a.length; j<jj; j++) a[j].e.id = a[j].i;
    a = null;
    return o;
};


/**
 * Get elements by class name.
 * Start the search at element oElm.
 * The strTagName is the type of elements we are looking for, eg "a", "div" etc.
 * The strClassName is the name of the class.
 *
 * Example #1:   getElementsByClassName(container, "div", "myClass"):
 *                  find all divs with class "myClass" under container.
 *
 * Example #2:   getElementsByClassName(container, "span", "myClass1|myClass2"):
 *                  find all spans with class "myClass1" OR "myClass2" under container.
 */
function getElementsByClassName(oElm, strTagName, strClassName) {
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    var minusSign = new RegExp('-','g');
    strClassName = strClassName.replace(minusSign, "\\-");
    var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    var oElement;
    for(var i=0; i<arrElements.length; i++) {
        oElement = arrElements[i];      
        if(oRegExp.test(oElement.className)) arrReturnElements.push(oElement);
    }
    return arrReturnElements;
}


/**
 * Get the desired style value on the given element.
 *
 * Eg: getStyle(container, 'marginLeft'): return '2', which is the left
 *			margin of the container being passed in.
 */
function getStyle(el, styleProp) {
	var styleValue;
	if(el.currentStyle) styleValue = el.currentStyle[styleProp];
	else if(window.getComputedStyle) styleValue = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
	var px = new RegExp('px');
    styleValue = styleValue.replace(px, '');
	try { styleValue = styleValue - 0; } catch(e) { alert(e); }
	return styleValue;
}


/**
 * Update the given rule in the given css class to the value specified.
 *
 * Eg: updateCSSRule('components.css', 0, 'fontSize', '12px'): update rule 0
 *            in 'components.css': set the font-size to 12px
 */
function updateCSSRule(url, index, property, value) {
	if(document.styleSheets) {
		url = CONTEXT_PREFIX + 'css/' + url;

		//find correct css file
		var i=0;
		for(i=0; i<document.styleSheets; i++) {
			if(document.styleSheets[i].href == url) break;
		}
		if(i == document.styleSheets.length) {
			alert('Cannot find <' + url + '>');
			return;
		}

		//now update the given property to the value specified
		var theRules = new Array();	  
		if(document.styleSheets[i].cssRules) theRules = document.styleSheets[i].cssRules;
		else if(document.styleSheets[i].rules) theRules = document.styleSheets[i].rules;
		else {
			alert('Oops...  your browser does not support dynamic stylesheets!');
			return;
		}
		var temp = 'theRules[' + index + '].style.' + property + '="' + value + '"';
		eval(temp);
	} else {
		alert('Oops...  your browser does not support dynamic stylesheets!');
	}
}


/**
 * Returns whether the element is OR a descedant of
 * another element with the given id.
 *
 * @param el: the source element (the mouse is over this element)
 * @param id: the id that we want to match
 */
function getParentById(el, id) {
	var ret = null;
	while((!el.id.match(id)) && 
		  (el.tagName != 'BODY') && 
		  (el.tagName != 'HTML')) el = el.parentNode;
    if(el.id.match(id)) ret=el;
	return ret;
}


/**
 * This method takes in a chat buddy userName and a chat status int and returns a
 * text corresponding to the chat status that should be displayed on the dialog for chat status with this buddy.
 */
function getChatStatusAsText(who, status) {
	var statusText = who;
	if(who.length > 15) statusText = who.substr(0, 15) + '...';
	if(status==CHAT_STATUS_NOT_TYPING) statusText += ' is ' + ((USERS[who]==null) ? 'offline' : getUserStatusAsText(USERS[who].status).toLowerCase());
	else if(status==CHAT_STATUS_TYPING) statusText += ' is typing';
	else if(status==CHAT_STATUS_TYPED) statusText += ' has entered text';
	else alert('Unknown chat status: <' + status + '>');
	return statusText;
}


/**
 * This method takes in a user status int and returns a text corresponding to that user status.
 * Basically converts:  1 --> 'Online'.
 */
function getUserStatusAsText(theStatus) {
	var statusText = '';
	if(theStatus==USER_STATUS_ONLINE) statusText = 'Online';
	else if(theStatus==USER_STATUS_OFFLINE) statusText = 'Offline';
	else if(theStatus==USER_STATUS_AWAY) statusText = 'Away';
	else alert('Unknown user status: <' + theStatus + '>');
	return statusText;
}


/**
 * This method takes in a user status text and returns an int corresponding to that user status.
 * Basically converts:  'Online' --> 1.
 */
function getUserStatusAsInt(theStatusText) {
	var statusInt = 0;
	if(theStatusText=='Online') statusInt = USER_STATUS_ONLINE;
	else if(theStatusText=='Offline') statusInt = USER_STATUS_OFFLINE;
	else if(theStatusText=='Away') statusInt = USER_STATUS_AWAY;
	else alert('Unknown user status: <' + theStatusText + '>');
	return statusInt;
}


/**
 * Returns the given cookie property.
 *
 * @param cookie: the id of the cookie to read from
 * @param propertyId: the id of the property to return (0 for 'B', 1 for 'I', etc)
 */
function getCookieProperty(cookie, propertyId) {
	var ret = null;
	var savedCookie = dojo.io.cookie.get(cookie);
	if(savedCookie) {
		//split saved cookie into an array, read value from the appropriate index (propertyId)
		var cookieArray = savedCookie.split(',');
		ret = cookieArray[propertyId];

		//convert string to number, where possible
		if( (propertyId == DIALOG_FONT_STYLE_BOLD) || (propertyId == DIALOG_FONT_STYLE_ITALIC) || (propertyId == DIALOG_FONT_STYLE_UNDERLINE) ||
			(propertyId == GLOBALS_SOUND) || (propertyId == GLOBALS_BLINKER) || (propertyId == GLOBALS_WALLPAPER) ) {
			try { ret = ret - 0; } catch(e) {}
		}
	}
	//alert('cookie: ' + cookie + '\npropertyId: ' + propertyId + '\nsavedCookie: ' + savedCookie + '\nret: ' + ret);
	return ret;
}


/**
 * Sets the given cookie property. The values are saved into cookies on the client side.
 *
 * @param cookie: the id of the cookie to set
 * @param propertyId: the id of the property to return (0 for 'B', 1 for 'I', etc)
 * @param value: the value of the property to save
 */
function setCookieProperty(cookie, propertyId, value) {
	//read cookie, or create one if not yet created
	var savedCookie = dojo.io.cookie.get(cookie);
	if(!savedCookie) {
		if(cookie == COOKIE_FONTSTYLE) savedCookie = '0,0,0,#D65539,Verdana,12px'; //default font style cookie
		else savedCookie = '0,0,0,0,0,0,-1,http://farm3.static.flickr.com/2284/2197561602_992287c386_o.jpg'; //default wallpaper cookie
	}

	//split saved cookie into an array, and update the appropriate property's value
	var cookieArray = savedCookie.split(',');
	cookieArray[propertyId] = value;

	//write back the savedCookie
	savedCookie = '';
    for(var i=0; i<cookieArray.length; i++) savedCookie += cookieArray[i] + ',';
    savedCookie = savedCookie.substr(0, savedCookie.length - 1);	//cut last ','
	dojo.io.cookie.set(cookie, savedCookie, 365);
}


/**
 * This method takes in a JS string of a url to a file, and returns the file name only.
 *
 * Example: input:  'http://www.abc.com/img/cairo/island.jpg'
 *          output: 'island'
 */
function getFileName(url) {
	return url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
}


/**
 * This method returns the DOM id of the div that contains the buddy list entry
 * for the given chat partner (ie a buddy list entry for the buddy).
 *
 * Example: input:  'peter'
 *          output: 'buddy_peter'
 */
function getBuddyId(chatPartner) {
    return 'buddy_' + escape(chatPartner);
}


/**
 * This method returns the entire DOM of the div that contains the buddy list entry
 * for the given chat partner (ie a buddy list entry for the buddy).
 *
 * Example: input:  'peter'
 *          output: <DIV>...</DIV>
 */
function getBuddy(chatPartner) {
    var buddyId = getBuddyId(chatPartner);
    return document.getElementById(buddyId);
}


/**
 * This method returns the DOM of the div that contains the next buddy
 * on the buddy list for which the passed userName (new buddy) should be painted
 * before.  
 *
 * @param newUserName - the new userName for which we're looking for the next buddy
 * @param isAvailable - true/false, indicating whether looking for online/away
 *                      nextBuddy, or offline nextBuddy
 * @return nextBuddy - <DIV>...</DIV> if nextBuddy found, else returns null   
 */
function findNextBuddy(newUserName, isAvailable) {
    // returns true if userName should be the next Buddy, and userName already painted on Buddy List.
    function isAlphabeticalAlreadyPaintedNextBuddy(newUserName, userName, nextBuddy) {
        if( (userName.toLowerCase() > newUserName.toLowerCase())                    &&
            (nextBuddy == null || nextBuddy.toLowerCase() > userName.toLowerCase()) &&
            (getBuddy(userName) != null) ) return true;
        else return false;
    }

    // find the next buddy for newUserName
    var nextBuddy = null;
    for(var userName in USERS) {
        if(userName != USERNAME) {
            if( (isAvailable  && USERS[userName].status != USER_STATUS_OFFLINE) ||
                (!isAvailable && USERS[userName].status == USER_STATUS_OFFLINE) ) {
                if(isAlphabeticalAlreadyPaintedNextBuddy(newUserName, userName, nextBuddy)) nextBuddy = userName;
            }
        }
    }

    // special case: nextBuddy should be the first offline buddy
    if(isAvailable && nextBuddy == null && dojo.widget.manager.getWidgetById('showOfflineCheckbox').checked) {
        for(var userName in USERS) {
            if(userName != USERNAME && USERS[userName].status == USER_STATUS_OFFLINE) {
                if(isAlphabeticalAlreadyPaintedNextBuddy('', userName, nextBuddy)) nextBuddy = userName;
            }
        }
    }

    //dojo.debug('Painting: ' + newUserName + ',  isAvailable: ' + isAvailable + ', nextBuddy: ' + nextBuddy);
    if(nextBuddy != null) nextBuddy = getBuddy(nextBuddy);
    return nextBuddy;
}


/**
 * Plays the sound file embedded with the given name.
 *
 * @param id: the name of the embedded sound file to play
 */
function playSound(id) {
	if(dojo.widget.manager.getWidgetById('soundCheckbox').checked) {
		var isPlaySound = false;
        switch (id) {
		    case SOUND_BUDDY_LOGIN: if(dojo.widget.manager.getWidgetById('soundCheckboxLogin') && dojo.widget.manager.getWidgetById('soundCheckboxLogin').checked) isPlaySound = true; break;
		    case SOUND_BUDDY_LOGOUT: if(dojo.widget.manager.getWidgetById('soundCheckboxLogout') && dojo.widget.manager.getWidgetById('soundCheckboxLogout').checked) isPlaySound = true; break;
		    case SOUND_MSG_RECEIVED: if(dojo.widget.manager.getWidgetById('soundCheckboxMessage') && dojo.widget.manager.getWidgetById('soundCheckboxMessage').checked) isPlaySound = true; break;
		    default: break;
		}
        if(isPlaySound) Sound.play(id);
	}
}


/**
 * Maximizes the click filter on the screen.
 */
function maximizeClickFilter() {
    var cfId = 'clickFilter' + window.hideObject.length;
    var cf = document.getElementById(cfId);
    if(!cf) {
        var cf = document.createElement('DIV');
          cf.className = 'clickFilter';
          cf.id = cfId;
          cf.onclick = function (e) {
            handleClickFilterEvent();
          };
          document.body.appendChild(cf);
    }
    cf.style.width = document.body.offsetWidth + 'px';
    cf.style.height = document.body.offsetHeight + 'px';
}


/**
 * Maximizes the regular filter on the screen.
 */
function maximizeFilter() {
    var f = document.getElementById('filter');
    if(!f) {
        f = document.createElement('DIV');
        f.id = 'filter';
        document.body.appendChild(f);
    }
    f.style.width = document.body.offsetWidth + 'px';
    f.style.height = document.body.offsetHeight + 'px';
}


/**
 * Sets the className of the given object.
 */
function setClassName(e, obj, className) {
    if(obj.className != className) obj.className = className;
}


/**
 * Clears the className of the given object.
 *
 * @param e: event object
 * @param obj: element to set className of
 * @param className: the className to set obj's className to
 */
function clearClassName(e, obj, className) {
	e = e || event;
	var newEl = e.relatedTarget || e.toElement;
	if((newEl != obj) && (newEl != obj.childNodes[0]) && (newEl != obj.childNodes[1])) obj.className = className;
}


/**
 * Resets the 0th form on the page.
function resetForm() {
    for(var i=0; i<document.forms.length; i++) {
        document.forms[i].reset();
    }
}
 */


/**
 * Convert any color to hexadecimal value.
 * Supported color input formats:
 *		- rgb(0, 23, 255)
 *		- #336699
 *		- ffee66
 *		- fb0
 *
 * Author: Stoyan Stefanov <sstoo@gmail.com>
 * Link: http://www.phpied.com/rgb-color-parser-in-javascript/
 */
function convertToHexColor(colorString) {
	//these locals will contain the r, g, b values of the passed in colorString
	var r = 0;
	var g = 0;
	var b = 0;

	//strip any leading #
    if(colorString.charAt(0) == '#') colorString = colorString.substr(1,6);

	//remove all whitespaces, convert to lower case
    var whiteSpace = new RegExp('\\s','g');
    colorString = colorString.replace(whiteSpace,'');
    colorString = colorString.toLowerCase();

	//array of color definition objects
    var colorDefs = [
        {
            //re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            re: new RegExp('^rgb\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\\)$'),
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            //re: /^(\w{2})(\w{2})(\w{2})$/,
            re: new RegExp('^(\\w{2})(\\w{2})(\\w{2})$'),
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            //re: /^(\w{1})(\w{1})(\w{1})$/,
            re: new RegExp('^(\\w{1})(\\w{1})(\\w{1})$'),
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

	//search through the definitions to find a match
    for(var i = 0; i < colorDefs.length; i++) {
        var re = colorDefs[i].re;
        var processor = colorDefs[i].process;
        var bits = re.exec(colorString);
        if(bits) {
            channels = processor(bits);
            r = channels[0];
            g = channels[1];
            b = channels[2];
        }
    }

    //validate/cleanup values
    r = (r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r);
    g = (g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g);
    b = (b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b);
	
	//convert r, g, b to string and append them together for the hex value
	r = r.toString(16);
	g = g.toString(16);
	b = b.toString(16);
	if(r.length == 1) r = '0' + r;
	if(g.length == 1) g = '0' + g;
	if(b.length == 1) b = '0' + b;

	return '#' + r + g + b;
}


/**
 * Detect which font families are supported by this client's browser.
 * This method iterates through the FONTS json array and sets the detect
 * property on each to true if the browser supports that font family.
 */
function detectFonts() {
	//locals
	var h = document.getElementsByTagName('BODY')[0];
	var d = document.createElement('DIV');
	var s = document.createElement('SPAN');

	//setup
	d.style.fontFamily = 'sans-serif';		//font for the parent element DIV.
	s.style.fontFamily = 'sans-serif';		//arial font used as a comparator.
	s.style.fontSize   = '72px';			//we test using 72px font size, we may use any size. I guess larger the better.
	s.innerHTML        = 'mmmmmmmmmml';		//we use m or w because these two characters take up the maximum width. And we use a L so that the same matching fonts can get separated
	d.appendChild(s);						//append span to div
	h.appendChild(d);						//append div to document.body
	var defaultWidth   = s.offsetWidth;		//now we have the defaultWidth
	var defaultHeight  = s.offsetHeight;	//and the defaultHeight, we compare other fonts with these.

	//iterate through each font, check if supported, and if so, set the 'detect' property!
	for (var i=0; i<FONTS.length; i++) {
		s.style.fontFamily = FONTS[i].type;	//set the span's font family to the one we're currently checking
		var font = FONTS[i].type.toLowerCase();
		if(font == 'arial' || font == 'sans-serif') FONTS[i].detect = true;							//to set arial and sans-serif true
		else FONTS[i].detect = (s.offsetWidth != defaultWidth || s.offsetHeight != defaultHeight);	//detected?
	}
	//do cleanup
	h.removeChild(d);
}


/**
 * Find the description of the given ID in the given hashmap.
 */
function findDescInHashMap(map, id) {
    var desc = '';
    for(var i=0; i<map.length; i++) {
        if(map[i].name == id) {
            desc = map[i].desc;
            break;
        }
    }
    return desc;
}


/**
 * Validates the given filename for:
 *   1) emptyness
 *   2) has extension
 *   3) has a valid extension type
 *
 * Returns true if all validation succeeded, otherwise returns false.
 */
function isValidFileName(fileName, validExtensionsArray, isShowAlert) {

    //validate emptyness
    var dot = new RegExp('\\.');
	if(fileName == '') {
	  if(isShowAlert) alert('No file selected.');
	  return false;
	}

    //validate existense of extension
    if(fileName.search(dot) == -1) {
	  if(isShowAlert) alert('No file extension detected.');
	  return false;
	}

    //validate extension
	var extension = fileName.substr(fileName.search(dot) + 1);
	extension = extension.toLowerCase();
    var validExtension = false;
    for(var i=0; i<validExtensionsArray.length; i++) {
      if(extension == validExtensionsArray[i]) {
        validExtension = true;
        break;
      }
    }
	if(!validExtension) {
      if(isShowAlert) {
	    var msg = 'Accepted file types...\n';
        for(var i=0; i<validExtensionsArray.length; i++) {
          if(i%8==0) msg += '\n';
          msg += validExtensionsArray[i] + ', ';
        }
        msg = msg.substr(0, msg.length-2);
        alert(msg);
      }
	  return false;
	}

    return true;
}


/**
 * Validates the given URL for: valid URL video link
 *
 * Returns [vidType, vidParam] if validation succeeded, where:
 *   - vidType:  the video type (1 == youtube, 2 == vimeo)
 *   - vidParam: any parameter that the video embed requires
 */
function isVideoURL(url) {
    var protocol = '^((http://)|(http://www.)|(www.))';

    // type #1: youtube.com
    var match_exp = new RegExp(protocol + 'youtube\.com\/(.+)(v=.+)', 'gi');
    var matches = match_exp.exec(url);
    if(matches && matches.length >= 3) {
        var qs = matches[matches.length-1].split('&');
        for(i=0; i<qs.length; i++) {
            var x = qs[i].split('=');
            if(x[0] == 'v' && x[1]) return [1, x[1]];
        }
    }

    // type#2: vimeo.com
    match_exp = new RegExp(protocol + 'vimeo\.com\/\\d+', 'gi');
    matches = match_exp.exec(url);
    if(matches) {
        var requestUrl = 'http://www.vimeo.com/api/oembed.json?url=' + encodeURIComponent(url) + '&callback=embedVimeoVideo';
        importJS(requestUrl, false);
        return [2, null];
    }

    // default
    return [0, null];
}


/**
 * Embeds the received vimeo video into the current focus dialog.
 */
function embedVimeoVideo(video) {
    var html = unescape(video.html);
    var w_exp = new RegExp('width="\\d+"', 'gi');
    var h_exp = new RegExp('height="\\d+"', 'gi');
    html = html.replace(w_exp, 'class="video"');
    html = html.replace(h_exp, '');
    var d = getInFocusDialog();
    d.screen.innerHTML += html;
}


/**
 * Copies the passed in text onto the clipboard.
 *
 * Returns true if copy to clipboard succeeded, otherwise returns false.
 * See: https://developer.mozilla.org/en/Using_the_Clipboard
 *      http://www.febooti.com/support/website-help/website-javascript-copy-clipboard.html
 */
function copyToClipboard(data) {
    if(IS_IE) {
        // IE
        if(!window.clipboardData.setData('Text', data)) return false;
    } else {
        // FF
		
		//
		// Note: To enable this privilege currently users need to manually edit 
		//		 "signed.applets.codebase_principal_support" setting in "about:config" Firefox page.
		//
        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
        var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
        if(!str) return false;
        str.data = data;

        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
        if(!trans) return false;
        trans.addDataFlavor('text/unicode');
        trans.setTransferData('text/unicode', str, data.length * 2);

        var clipid = Components.interfaces.nsIClipboard;
        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].getService(clipid);
        if (!clip) return false;
        clip.setData(trans, null, clipid.kGlobalClipboard);
    }
    return true;
}