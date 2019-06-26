/**
 * This is the onload method of canvas.jsp.
 */
function canvasOnLoad() {
  //dojo requirements
  dojo.require("dojo.dnd.HtmlDragMove");
  dojo.require("dojo.io.cometd");
  dojo.require("dojo.widget.Checkbox");
  dojo.require("dojo.widget.RadioGroup");
  dojo.require("dojo.widget.ColorPalette");

  //init globals
  initGlobals();

  //init encoding
  CIPHER_KEY = h2b(CIPHER_KEY);

  //connect to events: onkeydown
  dojo.event.connect(document, "onkeydown", function(evt) {
    if (evt.keyCode == evt.KEY_ESCAPE) {
      //ESC_KEY = dojo cometd ESC key breaks FF bug
      setTimeout("handleLogout()", 50);
      dojo.event.browser.stopEvent(evt);
      return false;
    } else if (evt.keyCode == evt.KEY_TAB) {
      //TAB_KEY = tab into next dialog
      var focusDialog = getInFocusDialog();
      if (focusDialog) focusOnDialog(focusDialog);
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode > 48 && evt.keyCode < 58 && evt.ctrlKey) {
      //Ctrl + 1, 2 = open dialog to 1st, 2nd etc buddy
      try {
        var buddyListContent = document.getElementById("buddyListContent");
        var buddyContainer = buddyListContent.getElementsByTagName("DIV")[
          evt.keyCode - 49
        ];
        buddyContainer.onclick();
      } catch (e) {}
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode == A_KEY && evt.ctrlKey) {
      //Ctrl + A = change my status to 'Away: ...'
      var customAwayMsg = prompt("Please enter your away message:", "");
      if (customAwayMsg != null)
        changeUserStatus(USER_STATUS_AWAY, customAwayMsg);
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode == O_KEY && evt.ctrlKey) {
      //Ctrl + O = change my status to 'Online'
      changeUserStatus(USER_STATUS_ONLINE);
      if (IS_IE) window.event.keyCode = 505; //needed because IE would still pop the 'Open URL' box
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode == S_KEY && evt.ctrlKey) {
      //Ctrl + S = turn sound ON or OFF
      var cb = dojo.widget.manager.getWidgetById("soundCheckbox");
      if (cb.checked) cb.checked = false;
      else cb.checked = true;
      cb._setInfo();
      handleSoundCheckboxEvent(cb);
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode == B_KEY && evt.ctrlKey) {
      //Ctrl + B = turn blinker ON or OFF
      var cb = dojo.widget.manager.getWidgetById("blinkerCheckbox");
      if (cb.checked) cb.checked = false;
      else cb.checked = true;
      cb._setInfo();
      handleBlinkerCheckboxEvent(cb);
      dojo.event.browser.stopEvent(evt);
    } else if (evt.keyCode == W_KEY && evt.ctrlKey) {
      //Ctrl + W = turn wallpaper ON or OFF
      var cb = dojo.widget.manager.getWidgetById("wallpaperCheckbox");
      if (cb.checked) cb.checked = false;
      else cb.checked = true;
      cb._setInfo();
      handleWallpaperCheckboxEvent(cb);
      dojo.event.browser.stopEvent(evt);
    }
  });

  //connect to events: onmouseup
  dojo.event.connect(document, "onmouseup", function(evt) {
    var sel = "";
    if (window.getSelection) sel = window.getSelection();
    else if (document.selection) sel = document.selection.createRange().text;
    else if (document.getSelection) sel = document.getSelection();
    var text = sel + ""; //force conversion to String
    if (text != "") {
      copyToClipboard(text);
      if (window.getSelection) sel.removeAllRanges();
      else if (document.selection) document.selection.empty();
      else if (document.getSelection) sel.removeAllRanges();
    }
  });

  //init cometd
  cometd.init({}, "cometd");
  cometd.subscribe(USERNAME, false, "pushHandler");

  //init blinker
  var contentFrame = top.document.getElementById("contentFrame");
  if (IS_IE) {
    contentFrame.attachEvent("onblur", canvasOnBlur);
    contentFrame.attachEvent("onfocus", canvasOnFocus);
  } else if (IS_FF) {
    contentFrame.contentDocument.addEventListener("blur", canvasOnBlur, false);
    contentFrame.contentDocument.addEventListener(
      "focus",
      canvasOnFocus,
      false
    );
  } else {
    window.onblur = canvasOnBlur;
    window.onfocus = canvasOnFocus;
  }
  canvasOnFocus();

  //init buddy list
  initBuddyList(USERNAME);

  //finally, hide the wait indicator
  hideWaitIndicator();
}

/**
 * This is the onunload method of canvas.jsp.
 */
function canvasOnUnLoad() {
  //unsubscribe from all messages from the server
  cometd.unsubscribe(USERNAME, false);

  //make sure we do go through handleLogout(), and not some other page, like CONTEXT_PREFIX/js/ folder
  window.onbeforeunload = null;
  if (IS_IE && SESSION.valid && window.screenTop <= 10000) {
    //ie and browser open
    alert(
      "Copyright 2006-2008 Z, Inc. All rights reserved.\n\n" +
        "Are you ready to grow with us?  We have both full time and part time positions available.\n" +
        "Please email your resume and cover letter to:\n" +
        "\tPeter Szocs\n" +
        "\tpeter at zlocker dot com\n\n" +
        "Thanks!"
    );
    handleLogout();
  } else if (SESSION.valid) {
    //not ie or browser closed
    handleLogout();
  }

  return true;
}

/**
 * This is the onblur method of canvas.jsp.
 */
function canvasOnBlur() {
  //dojo.debug('canvasOnBlur()');
  top.cairo.startBlinkTitle(-1, 0);
  startAutoAway();
}

/**
 * This is the onfocus method of canvas.jsp.
 */
function canvasOnFocus() {
  //dojo.debug('canvasOnFocus()');
  top.cairo.stopBlinkTitle();
  stopAutoAway();
}

/*  ====================================================================================================
    ====================================================================================================

                                        ...  COMET  ...
    
	====================================================================================================
    ==================================================================================================== */

/**
 * This is the main comet callback method.
 *
 * All comet events are going through this method, meaning that
 * the server calls this method if an event is happening.  The server passes
 * a HashMap<String, String> that always has a key "eventType", which describes
 * the type of event that just happened, as well as what other keys are present
 * inside the HashMap.
 */
function pushHandler(msg) {
  if (msg.data) {
    //window.status += ' ' + msg.data.eventType;
    switch (msg.data.eventType) {
      case EVENT_TYPE_GET_USERS:
        handleGetUsersEvent(msg.data);
        break;
      case EVENT_TYPE_GET_OFFLINE_MESSAGES:
        handleGetOfflineMessagesEvent(msg.data);
        break;
      case EVENT_TYPE_INCOMING_MESSAGE:
        handleIncomingMessageEvent(msg.data);
        break;
      case EVENT_TYPE_USER_CHANGE_STATUS:
        handleUserChangeStatusEvent(msg.data);
        break;
      case EVENT_TYPE_USER_CHANGE_BUDDY_ICON:
        handleUserChangeBuddyIconEvent(msg.data);
        break;
      case EVENT_TYPE_USER_TYPING:
        handleUserTypingEvent(msg.data);
        break;
      case EVENT_TYPE_SYSTEM_MESSAGE:
        handleSystemMessageEvent(msg.data);
        break;
      case EVENT_TYPE_SPECIAL_EFFECT:
        handleSpecialEffectEvent(msg.data);
        break;
      default:
        alert("pushHandler: Unknown eventType: " + msg.data.eventType);
        break;
    }
  } else {
    alert("pushHandler: msg.data is NULL!");
  }
}

/**
 * Event handler: get users event (comet).
 *
 * Message must have the following properties:
 *      - "eventType" : EVENT_TYPE_GET_USERS
 *		- "users"	  : the buddies (chat partners) array, each element is a UserBean
 */
function handleGetUsersEvent(msg) {
  for (var i = 0; i < msg.users.length; i++) {
    if (msg.users[i].userName != USERNAME) {
      //don't display current user on buddy list
      paintUserOnBuddyList(msg.users[i]);
    } else if (msg.users[i].userName == USERNAME) {
      //paint current user's buddy icon on the buddy list (buddy icons are stored on the server side only!!)
      paintBuddyIconOnBuddyList(msg.users[i].buddyIcon);
    }
  }
}

/**
 * Event handler: get offline messages (right after a fresh login) event (comet).
 *
 * Message must have the following properties:
 *      - "eventType" : EVENT_TYPE_GET_OFFLINE_MESSAGES
 *		- "messages"  : the messages array, each element is a MessageBean
 */
function handleGetOfflineMessagesEvent(msg) {
  //paint all offline messages into dialogs
  for (var i = 0; i < msg.messages.length; i++) {
    handleIncomingMessageEvent(msg.messages[i]);
  }

  //clear all offline messages
  var mb = { eventType: EVENT_TYPE_CLEAR_OFFLINE_MESSAGES };
  cometd.publish(USERNAME, mb);
}

/**
 * Event handler: incoming message event (comet).
 *
 * Message must have the following properties:
 *      - "eventType"       : EVENT_TYPE_INCOMING_MESSAGE
 *		- "hour"	        : the hour when this message was sent
 *		- "minute"	        : the minute when this message was sent
 *		- "source"	        : the userName of the partner sending me this message
 *		- "target"          : the userName of the partner receiving this message (recipient userName)
 *		- "message"         : the actual message (String)
 *      - "translate"       : JSON object:
 *                              { enabled: true,
 *                                   from: 'en',
 *                                     to: 'fr'   }
 *      - "sourceBuddyIcon" : the source's buddy icon (NOTE: SENT ONLY BY OFFLINE MESSAGES!)
 *      - "style"           : the styling of this message, in a JSON object:
 *                              { color:           ta.style.color,         ('#3333ff')
 *	                              fontFamily:      ta.style.fontFamily,    ('Georgia')
 *							      fontSize:        ta.style.fontSize,      ('24px')
 *							      fontWeight:      ta.style.fontWeight,    ('normal')
 *							      fontStyle:       ta.style.fontStyle,     ('normal')
 *							      textDecoration:  ta.style.textDecoration ('none')    }
 */
function handleIncomingMessageEvent(msg) {
  //to cause tunnel error:
  //dojo.debug('inside handleIncomingMessageEvent()...');
  //document.getElementById('abc').style.margin = '2px';

  var dialog = getDialog(msg.source);
  if (!dialog) {
    //figure out buddy icon:
    //  - if msg.source is logged in --> get buddy icon from buddyList
    //  - if msg.source is logged out --> get buddy icon from offline message
    //
    //NOTE: only offline messages store the msg source's buddy icon!
    var buddyIconSrc = IMG_UNSET_BUDDY_ICON_SRC;
    var buddyOnBuddyList = getBuddy(msg.source);
    if (buddyOnBuddyList)
      buddyIconSrc = buddyOnBuddyList.getElementsByTagName("IMG")[0].src;
    else if (msg.sourceBuddyIcon != BUDDY_ICON_UNSET)
      buddyIconSrc = msg.sourceBuddyIcon;
    dialog = new Dialog(msg.source, buddyIconSrc);
  }
  appendMessageToChatHistory(dialog, msg);
  playSound(SOUND_MSG_RECEIVED);
}

/**
 * Event handler: user (chat buddy, ie not self) status change event (comet).
 *
 * Message must have the following properties:
 *      - "eventType"     : EVENT_TYPE_USER_CHANGE_STATUS
 *		- "userName"      : the username of the partner changing status
 *		- "status"	      : the status int of the partner's new status
 *      - "customAwayMsg" : the custom away message of the partner (defaults to "" if nothing set)
 *		- "buddyIcon"	  : the buddy icon of the partner
 */
function handleUserChangeStatusEvent(msg) {
  var container = getBuddy(msg.userName);
  if (container) {
    //user already painted on buddy list --> simply change the status or remove (if status is OFFLINE)
    //update the title (alt message) on the buddy list
    container.title = msg.userName + " is " + getUserStatusAsText(msg.status);
    if (msg.status == USER_STATUS_OFFLINE) {
      container.parentNode.removeChild(container);
      if (dojo.widget.manager.getWidgetById("showOfflineCheckbox").checked)
        paintUserOnBuddyList(msg);
      playSound(SOUND_BUDDY_LOGOUT);
    } else if (msg.status == USER_STATUS_ONLINE) {
      if (USERS[msg.userName].status == USER_STATUS_AWAY) {
        //going from AWAY --> ONLINE
        container.getElementsByTagName(
          "IMG"
        )[1].src = IMG_LED_STATUS_ONLINE_SRC;
        container.getElementsByTagName("SPAN")[0].innerHTML = "";
      } else {
        //going from OFFLINE --> ONLINE
        container.parentNode.removeChild(container);
        paintUserOnBuddyList(msg);
      }
      playSound(SOUND_BUDDY_LOGIN);
    } else {
      //USER_STATUS_AWAY
      container.getElementsByTagName("IMG")[1].src = IMG_LED_STATUS_AWAY_SRC;
      container.getElementsByTagName("SPAN")[0].innerHTML = getUserStatusAsText(
        msg.status
      );
      if (msg.customAwayMsg != "") {
        container.title += ": " + msg.customAwayMsg;
        //this is the length of the chat partner's custom away message on the buddylist
        if (msg.customAwayMsg.length > 12)
          container.getElementsByTagName("SPAN")[0].innerHTML +=
            ": " + msg.customAwayMsg.substr(0, 12) + "...";
        else
          container.getElementsByTagName("SPAN")[0].innerHTML +=
            ": " + msg.customAwayMsg;
      }
      //do NOT play sound if we're going to AUTO AWAY
      if (msg.customAwayMsg != AUTO_AWAY_CUSTOM_MESSAGE)
        playSound(SOUND_BUDDY_LOGOUT);
    }
    paintSystemMessageOnDialogAboutUserChangeStatus(msg, false);
  } else {
    //user not yet painted on buddy list --> let's paint it now!
    //alert('handleUserChangeStatusEvent: user not yet painted on buddy list!');
    paintUserOnBuddyList(msg);
    paintSystemMessageOnDialogAboutUserChangeStatus(msg, true);
    playSound(SOUND_BUDDY_LOGIN);
  }
}

/**
 * Event handler: user (chat buddy, ie not self) buddy icon change event (comet).
 *
 * Message must have the following properties:
 *      - "eventType" : EVENT_TYPE_USER_CHANGE_BUDDY_ICON
 *		- "userName"  : the username of the partner changing buddy icon
 *		- "buddyIcon" : the buddy icon (String): URL on the server of the new buddy icon
 */
function handleUserChangeBuddyIconEvent(msg) {
  var container = getBuddy(msg.userName);
  if (container) {
    //known buddy
    container.getElementsByTagName("IMG")[0].src = msg.buddyIcon;
    paintBuddyIconChangeOnDialog(msg);
  } else {
    //unknown buddy
    alert("Unknown buddy...\n" + msg.userName);
  }
}

/**
 * Event handler: buddy is currently typing to me (comet).
 *
 * Message must have the following properties:
 *      - "eventType" : EVENT_TYPE_USER_TYPING
 *		- "source"    : the userName of the chat partner who is typing to me
 *      - "status"    : the new chat status of the chat partner that is omitting this event
 */
function handleUserTypingEvent(msg) {
  var dialog = getDialog(msg.source);
  if (dialog) paintChatStatusChange(dialog, msg.source, msg.status);
}

/**
 * Event handler: system error has occurred (comet).
 *
 * Message must have the following properties:
 *      - "eventType" : EVENT_TYPE_SYSTEM_MESSAGE
 *		- "message"   : the system message (String)
 */
function handleSystemMessageEvent(msg) {
  alert(msg.message);
  window.onbeforeunload = null;
  handleLogout();
}

/**
 * Event handler: system error has occurred (comet).
 *
 * Message must have the following properties:
 *      - "eventType"  : EVENT_TYPE_SPECIAL_EFFECT
 *		- "effectType" : the type of the special effect
 *		- "effectId"   : the id of the special effect
 *		- "source"     : the source of the special effect
 */
function handleSpecialEffectEvent(msg) {
  var dialog = getDialog(msg.source);
  if (!dialog) {
    //paint the dialog first, before applying the special effect
    //  - if msg.source is logged in --> get buddy icon from buddyList
    //  - if msg.source is logged out --> do NOT deliver the special effect
    //
    //NOTE: only offline messages store the msg source's buddy icon!
    var buddyOnBuddyList = getBuddy(msg.source);
    if (buddyOnBuddyList) {
      var buddyIconSrc = buddyOnBuddyList.getElementsByTagName("IMG")[0].src;
      dialog = new Dialog(msg.source, buddyIconSrc);
    }
  }

  switch (msg.effectType) {
    case SPECIAL_EFFECT_TYPE_SOUND:
      paintSystemMessageOnDialogAboutIncomingSpecialEffect(
        msg.source,
        msg.effectType,
        msg.effectId,
        false
      );
      Sound.play(msg.effectId);
      break;
    case SPECIAL_EFFECT_TYPE_VISUAL:
      paintSystemMessageOnDialogAboutIncomingSpecialEffect(
        msg.source,
        msg.effectType,
        msg.effectId,
        false
      );
      break;
    default:
      alert("Unknown special effect type... <" + msg.effectType + ">");
      break;
  }
}

/*  ====================================================================================================
    ====================================================================================================

                                     ...  THIS CLIENT  ...
    
	====================================================================================================
    ==================================================================================================== */

/**
 * Send an individual message from this client to the indicated chat partner.
 */
function sendMessage(chatPartner, msg) {
  //get current time
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();

  //get dialog
  var dialog = getDialog(chatPartner);

  //publish message via comet
  var mb = {
    eventType: EVENT_TYPE_INCOMING_MESSAGE,
    source: USERNAME,
    target: chatPartner,
    message: b2h(c2e(msg, CIPHER_KEY, CIPHER_MODE)),
    translate: dialog.translate,
    hour: hour,
    minute: minute,
    style: {
      color: dialog.ta.style.color,
      fontFamily: dialog.ta.style.fontFamily,
      fontSize: dialog.ta.style.fontSize,
      fontWeight: dialog.ta.style.fontWeight,
      fontStyle: dialog.ta.style.fontStyle,
      textDecoration: dialog.ta.style.textDecoration
    }
  };
  cometd.publish(chatPartner, mb);

  //paint message on chat window
  mb.message = msg;
  appendMessageToChatHistory(dialog, mb);

  //append message to dialog's send history
  dialog.addMessageToSendHistory(msg);

  //check if this user's status is set to AWAY
  if (USERS[USERNAME].status == USER_STATUS_AWAY) {
    top.cairo.sentMsgCounter++;
    if (top.cairo.sentMsgCounter == 10) {
      changeUserStatus(USER_STATUS_ONLINE);
      top.cairo.sentMsgCounter = 0;
    }
  }
}

/**
 * Send a user status update from this client to ALL partners.
 *
 * @param status: user status, as an int (eg: USER_STATUS_ONLINE)
 */
function sendUserStatus(status, customAwayMsg) {
  //publish message via comet
  var ub = {
    eventType: EVENT_TYPE_USER_CHANGE_STATUS,
    userName: USERNAME,
    status: status,
    customAwayMsg: customAwayMsg
  };
  cometd.publish(USERNAME, ub);
}

/**
 * This client is attempting to change its user status.
 *
 * If the current status is already the new status indicated, nothing will happen.
 * If the current status is not yet the new status indicated, the user status
 * will be updated, and a message will be sent to ALL partners.
 *
 * @param status: user status, as int (eg: USER_STATUS_ONLINE)
 * @param customAwayMsg: user custom away message, as string (optional, can be null or '')
 */
function changeUserStatus(newStatusInt, customAwayMsg) {
  var statusPicker = document.getElementById("myStatusButton"); //the status picker on the buddy list
  if (customAwayMsg == null) {
    customAwayMsg = "";
  } else {
    if (!document.getElementById("myCustomAwayMsg")) {
      paintStatusPalette();
      handleClickFilterEvent();
    }
    //put my custom away message to the input box, unless we're going into auto-away
    if (customAwayMsg != AUTO_AWAY_CUSTOM_MESSAGE)
      document.getElementById("myCustomAwayMsg").value = customAwayMsg;
    customAwayMsg = dojo.string.trim(customAwayMsg);
  }
  var newStatusText = getUserStatusAsText(newStatusInt);
  if (newStatusInt == USER_STATUS_AWAY && customAwayMsg != "") {
    //this is length of MY custom away message on MY buddy status button on MY buddylist
    if (customAwayMsg.length > 10)
      newStatusText += ":<br>" + customAwayMsg.substr(0, 10) + "...";
    else newStatusText += ":<br>" + customAwayMsg;
  }

  if (
    newStatusInt != USERS[USERNAME].status ||
    newStatusText != statusPicker.getElementsByTagName("SPAN")[0].innerHTML
  ) {
    //real status update --> need to inform chat partners
    statusPicker.getElementsByTagName("SPAN")[0].innerHTML = newStatusText;
    sendUserStatus(newStatusInt, customAwayMsg); //inform chat partners about status update
    USERS[USERNAME].status = newStatusInt; //update local client's USERS array
  }
}

/**
 * Send a chat status update from this client to the indicated chat partner.
 *
 * @param status: chat status, as an int (eg: CHAT_STATUS_TYPING)
 */
function sendChatStatus(chatPartner, status) {
  //publish message via comet
  var mb = {
    eventType: EVENT_TYPE_USER_TYPING,
    source: USERNAME,
    status: status
  };
  cometd.publish(chatPartner, mb);
}

/**
 * Send a buddy icon update from this client to all chat partners.
 */
function sendBuddyIcon(newBuddyIconSrc) {
  //create newBuddyIconSrc (custom buddy icons only)
  if (!newBuddyIconSrc)
    newBuddyIconSrc = rewriteURL(top.cairo.customBuddyIcon.file);

  //publish message via comet
  var ub = {
    eventType: EVENT_TYPE_USER_CHANGE_BUDDY_ICON,
    userName: USERNAME,
    buddyIcon: newBuddyIconSrc
  };
  cometd.publish(USERNAME, ub);

  //swap the buddy icon with whatever was picked
  var buddyIconPicker = document.getElementById("myBuddyIcon");
  buddyIconPicker.src = newBuddyIconSrc;
}

/**
 * Send a special effect from this client to the indicated chat partner.
 *
 * @param chatPartner - the recipient of the special effect
 * @param effectType  - the type of effect to deliver
 * @param effectId    - the id of the special effect to deliver
 */
function sendSpecialEffect(chatPartner, effectType, effectId) {
  //publish message via comet
  var mb = {
    eventType: EVENT_TYPE_SPECIAL_EFFECT,
    source: USERNAME,
    effectType: effectType,
    effectId: effectId
  };
  cometd.publish(chatPartner, mb);
}

/*  ====================================================================================================
    ====================================================================================================

                                     ...  CANVAS  ...
    
	====================================================================================================
    ==================================================================================================== */

/**
 * Handle the click on the Settings link.
 */
function handleSettingsEvent() {
  //maximizeFilter();
  paintSettings();
}

/**
 * Handle the click on the Sound checkbox.
 */
function handleSoundCheckboxEvent(cb) {
  if (cb.checked) {
    setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND, "1");
  } else {
    setCookieProperty(COOKIE_GLOBALS, GLOBALS_SOUND, "0");
  }
}

/**
 * Handle the click on the Sound settings link.
 */
function handleSoundSettingsEvent() {
  paintSoundSettingsPalette();
}

/**
 * Handle the click on the Blinker checkbox: save out values into cookies.
 */
function handleBlinkerCheckboxEvent(cb) {
  if (cb.checked) setCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER, "1");
  else setCookieProperty(COOKIE_GLOBALS, GLOBALS_BLINKER, "0");
}

/**
 * Handle the click on the Blinker settings link.
 */
function handleBlinkerSettingsEvent() {
  paintBlinkerSettingsPalette();
}

/**
 * Handle the click on the Wallpaper checkbox.
 *
 * Note: do NOT handle saving values into cookies here... they're handled inside paintWallpaper()!
 */
function handleWallpaperCheckboxEvent() {
  paintWallpaper();
}

/**
 * Handle the click on the Wallpaper settings link.
 */
function handleWallpaperPickerEvent() {
  //remove customWallpaperForm, if already present on the page
  //(NOTE: THIS IS TO FIX THE FILE INPUT RESET ISSUE, BECAUSE THE FILE INPUT
  //       ELEMENT CANNOT BE RESET IN THE BROWSER FOR SECURITY REASONS)
  var customWallpaperForm = document.getElementById("customWallpaperForm");
  if (customWallpaperForm)
    customWallpaperForm.parentNode.removeChild(customWallpaperForm);

  //NOTE: the wallpaperForm.jsp calls paintWallpaperPalette() when body onload!!!
  loadURLIntoContainer("/wallpaperForm.jsp", "customWallpaperForm", false);
}

/**
 * Handle the click on the Status dropdown (button): need to show status palette.
 */
function handleStatusDropdownEvent() {
  paintStatusPalette();
}

/**
 * Handle the click on my buddy icon: this client is attempting to change his/her own buddy icon.
 */
function handleMyBuddyIconChangeEvent() {
  //remove customBuddyIconForm, if already present on the page
  //(NOTE: THIS IS TO FIX THE FILE INPUT RESET ISSUE, BECAUSE THE FILE INPUT
  //       ELEMENT CANNOT BE RESET IN THE BROWSER FOR SECURITY REASONS)
  var customBuddyIconForm = document.getElementById("customBuddyIconForm");
  if (customBuddyIconForm)
    customBuddyIconForm.parentNode.removeChild(customBuddyIconForm);

  //NOTE: buddyIconForm.jsp calls paintBuddyIconPalette() when body onload!!!
  loadURLIntoContainer("/buddyIconForm.jsp", "customBuddyIconForm", false);
}

/**
 * Handle the onchange event of any custom picker file upload:
 * this client is attempting to upload a custom buddy icon, or a custom wallpaper!
 *
 * Parameters:
 *	- fileInput: a file input, form element (passed by .jsp, eg: handleCustomPickerUploadEvent(this))
 *	- storeImg:  a global JSON object, where we will store this image temporarily (eg: top.cairo.customBuddyIcon)
 *	- targetDir: the target dir to upload the custom image into (eg: CUSTOM_BUDDY_ICON_DIR)
 */
function handleCustomPickerUploadEvent(fileInput, targetDir, storeImg) {
  //the picked file name
  var fileName = fileInput.value;

  if (isValidFileName(fileName, IMAGE_FILE_EXTENSIONS, true)) {
    //after successful validation, lets upload that new custom image!

    //extract the extension from the fileName
    var extension = fileName.substr(fileName.lastIndexOf(".") + 1);
    extension = extension.toLowerCase();

    storeImg.counter++; //increment counter
    var targetFileName =
      targetDir + //create targetFileName (USERNAME_1.gif)
      USERNAME +
      "_" +
      storeImg.counter +
      "." +
      extension;
    var whiteSpace = new RegExp("\\s+", "g");
    targetFileName = targetFileName.replace(whiteSpace, "_"); //replace ' ' with '_' (this could only happen in USERNAME)
    storeImg.file = targetFileName;
    fileInput.form.targetFileName.value = targetFileName;
    fileInput.form.submit(); //submit the form
    handleClickFilterEvent(); //hide palette and custom picker
  }
}

/**
 * Handles the file upload event (drag-n-drop to a file onto a dialog).
 *
 * Parameters:
 *	- fileInput: a file input, form element (passed by .jsp, eg: handleFileUploadEvent(this))
 */
function handleFileUploadEvent(fileInput) {
  //the picked file name
  var fileName = fileInput.value;

  if (isValidFileName(fileName, FILE_EXTENSIONS, true)) {
    //after successful validation, lets upload that new file!
    var shortFileName = fileName.substr(fileName.lastIndexOf("/") + 1);
    var targetFileName = FILE_UPLOAD_DIR + shortFileName; //create targetFileName
    var whiteSpace = new RegExp("\\s+", "g");
    targetFileName = targetFileName.replace(whiteSpace, "_"); //replace ' ' with '_'
    top.cairo.fileUpload[
      fileInput.form.currentTime.value
    ].file = targetFileName;
    fileInput.form.targetFileName.value = targetFileName;
    fileInput.form.submit(); //submit the form
  } else {
    //remove the just uploaded file's form
    var sendFileForm = document.getElementById(
      "sendFileForm_" + fileInput.form.currentTime.value
    );
    if (sendFileForm) sendFileForm.parentNode.removeChild(sendFileForm);
  }
}

/**
 * Handles the file upload callback event.  This method is called after the file upload (via drag-n-drop) has been finished.
 *
 * NOTE: THIS METHOD IS *NOT* CALLED FOR custom buddy icon OR custom wallpaper UPLOAD EVENTS!!
 *       See custom.jsp and struts-config.xml for details.
 *
 * Parameters:
 *	- currentTime: the exact time (in ms) when the file upload (drop) took place
 */
function handleFileUploadCallbackEvent(evt, currentTime) {
  //dojo.debug('handleFileUploadCallbackEvent() - evt: ' + evt + ', currentTime: ' + currentTime);

  //remove the just uploaded file's form
  var sendFileForm = document.getElementById("sendFileForm_" + currentTime);
  if (sendFileForm) sendFileForm.parentNode.removeChild(sendFileForm);

  //get the chatPartner to be informed about the file upload
  var chatPartner = top.cairo.fileUpload[currentTime].chatPartner;
  //dojo.debug('handleFileUploadCallbackEvent() - chatPartner: ' + chatPartner);

  //fix the fileName to be sent over to the chat partner
  var fileName = rewriteURL(top.cairo.fileUpload[currentTime].file);
  fileName = SERVER_URL + fileName;
  //dojo.debug('handleFileUploadCallbackEvent() - fileName: ' + fileName);

  //send a link to the chat partner with the just uploaded file
  sendMessage(chatPartner, fileName);

  //stop the event
  loadURLIntoContainer("/iframe.jsp", "iframe", false);
  var iframe = document.getElementById("iframe");
  if (iframe) iframe.parentNode.removeChild(iframe);

  dojo.event.browser.stopEvent(evt);
}

/**
 * Handle the onmouseover & onmouseout events over custom pickers:
 * need to manually trigger the onmouseover & onmouseout style effects of the underlying image,
 * because the custom picker form is positioned with a higher z-index!
 */
function handleCustomPickerMouseEvent(palette, ARRAY, newClassName) {
  var picker = palette.getElementsByTagName("IMG")[ARRAY.length - 1].parentNode;
  picker.className = newClassName;
}

/**
 * Handle the click on the buddy list's 'Show offline buddies' checkbox:
 * either show or hide the offline buddies on this client's buddy list.
 */
function handleShowOfflineCheckboxEvent(cb) {
  //publish message via comet
  var mb = { eventType: EVENT_TYPE_GET_USERS };
  cometd.publish(USERNAME, mb);
}

/**
 * Handle the click on the click filter: hide any object from the screen if something needs to be hidden!
 */
function handleClickFilterEvent() {
  if (window.hideObject.length > 0) {
    //hide the last objects in the window.hideObject array
    var toHide = window.hideObject.pop();
    for (var i = 0; i < toHide.obj.length; i++)
      toHide.obj[i].style.visibility = "hidden";
    if (toHide.cssObj) {
      var temp = toHide.cssObj[1]; // need to save it out, because toHide becomes null!
      toHide.cssObj[0].className = toHide.cssObj[1];
      toHide.cssObj[0].onmouseout = function(e) {
        clearClassName(e, this, temp);
      };
    }
    toHide = null;

    //disconnect to from onresize event
    dojo.event.kwDisconnect({
      srcObj: window,
      srcFunc: "onresize",
      targetFunc: "maximizeClickFilter",
      once: true
    });

    //hide the appropriate click filter
    var cf = document.getElementById(
      "clickFilter" + (window.hideObject.length + 1)
    );
    if (cf) {
      cf.style.width = "0px";
      cf.style.height = "0px";
    }
  }
}

/**
 * Logout the current client.
 */
function handleLogout() {
  console.log("handleLogout()");

  if (window.confirm("Sure you want to leave?")) {
    // yes ==> logout this user
    changeUserStatus(USER_STATUS_OFFLINE);
    SESSION.valid = false;
    window.location.href = rewriteURL("/login.jsp");
  } else {
    // no ==> do nothing
  }

  // try {
  //   //turn off dojo debugging --> Moz sometimes prints error messages on logout, this prevents it
  //   djConfig.isDebug = false;

  //   changeUserStatus(USER_STATUS_OFFLINE);

  //   //set delayed action --> close the browser after successful logout
  //   if (IS_IE) {
  //     //IE only
  //     top.window.opener = "x";
  //   }
  //   top.cairo.setDelayedAction("top.window.close()", 50, true);

  //   //invalidate session, goto logout
  //   SESSION.valid = false;
  //   window.location.href = rewriteURL("/login.jsp");
  // } catch (e) {
  //   //purposefully left empty: the user clicked Cancel on the
  //   //onbeforeunload dialog, so do nothing!
  // }
}

/*  ====================================================================================================
    ====================================================================================================

                                  ...  AUTO AWAY EVENTS  ...
    
	====================================================================================================
    ==================================================================================================== */

/**
 * Starts the auto away counter.  Called from canvasOnBlur().
 */
function startAutoAway() {
  if (USERS[USERNAME].status == USER_STATUS_ONLINE)
    top.cairo.autoAway.timeOut = setTimeout(
      "putUserToAutoAway()",
      top.cairo.autoAway.maxIdleTime * 60 * 1000
    );
}

/**
 * Stops the auto away feature.  Called from canvasOnFocus().
 */
function stopAutoAway() {
  if (top.cairo.autoAway.timeOut != null)
    clearTimeout(top.cairo.autoAway.timeOut);
  if (top.cairo.autoAway.isUserOnAutoAway) {
    changeUserStatus(USER_STATUS_ONLINE);
    top.cairo.autoAway.isUserOnAutoAway = false;
  }
}

/**
 * Changes the user status to auto away.  Called from setTimeout method.
 */
function putUserToAutoAway() {
  changeUserStatus(USER_STATUS_AWAY, AUTO_AWAY_CUSTOM_MESSAGE);
  top.cairo.autoAway.isUserOnAutoAway = true;
}

/**
 * Disable right click on entire site.
 */
// document.oncontextmenu = function(e) { return false; };

/**
 * Make sure the system knows about users that logout thru closing the browser.
 */
// window.onbeforeunload = function(e) {
//   e = e || event;
//   var message = "Are you sure you want to leave?";
//   if (e) e.returnValue = message;
//   return message;
// };
