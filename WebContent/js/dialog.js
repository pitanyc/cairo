/**
 * Create a new dialog on the screen.
 *
 * The newly created dialog will be the active one.
 *
 * @param chatPartner:  The chat partner to create dialog with.
 *
 * SAMPLE DIALOG:
 *

		<div class=nwinActive ondragenter="this.className='nwinActiveOnDrag'"
                              ondragover="dojo.event.browser.stopEvent(event);"
                              ondrop="dojo.event.browser.stopEvent(event); dodrop(event);">

            <!--  DIALOG HEADER  -->
			<div>
			  <div class=topbarActive>
				<a class=topbarTop></a>
				<span class=topbarMid></span>
				<a class=topbarClose onMouseOver="this.className='topbarClosehover'" onMouseOut="this.className='topbarClose'" alt="Close"></a>
				<a class=topbarMax onMouseOver="this.className='topbarMaxhover'" onMouseOut="this.className='topbarMax'" alt="Maximize"></a>
				<a class=topbarMin onMouseOver="this.className='topbarMinhover'" onMouseOut="this.className='topbarMin'" alt="Minimize"></a>
			  </div>

			  <div class="topmenuActive">
                <span class=topmenuLeft></span>
                <span class=topmenuImg><img src="img/buddy_icons/shoe.jpg"/></span>
                <span class=topmenuMid><img src="img/buddy_list/online.gif"/>&nbsp;Pettuka</span>
                <span class=topmenuRight></span>
                <span class=topmenuSpc></span>
              </div>
            </div>


            <!--  CHAT HISTORY DIV  -->
            <div class=iwinActive>
                <span class=iwinLeft></span>
                <div class="chatHistory"></div>
                <span class=iwinRight></span>
            </div>


            <!--  CHAT CONTROLS, TEXTAREA, STATUS  -->
			<div class="btmmenuActive">
				<span class="btmmenuLeft"></span>
                <span class="btmmenuRight"></span>
				<span class="btmmenuTop">
					<img class="formatleft"  src="img/dialog/format-bold.gif"/>
					<img class="formatleft"  src="img/dialog/format-italic.gif"/>
					<img class="formatleft"  src="img/dialog/format-underline.gif"/>
					<button>Verdana</button>
					<button>12px</button>
					<img class="formatright" src="img/dialog/smiley.gif"/>
					<img class="formatright" src="img/dialog/palette.gif"/>
                </span>
                <textarea class="chatMessage"></textarea>
                <span class="btmmenuBottom">
					<span class="chatStatus">Pettuka is online</span>
                    <img class="typingImg" src="img/dialog/typing.gif"/>
					<img class="resizeHandle" src="src/widget/templates/grabCorner.gif" alt="Resize"/>
				</span>
			</div>

			
            <!--  DIALOG FOOTER  -->
			<div class=btmbarActive>
				<span class=btmbarLeft></span>
				<div class=btmbarMid></div>
				<span class=btmbarResize></span>
			</div>

		</div> <!-- EOF: nwinActive -->

 */

// To be able to render a Dialog from .html, uncomment the following JS vars:
//var CHAT_STATUS_NOT_TYPING = 0;
//var DIALOGS = [];

function Dialog(chatPartner, chatPartnerBuddyIconSrc) {
  // members
  this.chatPartner = chatPartner; //shortcut to the chatPartner of this dialog
  this.id = getDialogId(chatPartner); //this is the document.getElement() id of this dialog + chatWindow
  this.autoScroll = { enabled: true, scrollerLength: 0 }; //autoscrolling feature
  this.sendHistory = { ptr: -1, arr: [] }; //send history feature
  this.chatStatus = { lastChatStatus: CHAT_STATUS_NOT_TYPING, timeOut: null }; //chat status feature
  this.nudge = { enabled: false, step: 5, speed: 100, timeOut: null }; //nudge feature
  this.maximized = null; //stores the maximized object's original data --> gets initialized when clicking on maximizeImg
  this.drag = null; //stores the drag object --> gets initialized inside init()
  this.focus = null; //stores the focus id (sequence) of this dialog
  var that = this; //use 'that' inside private functions! --> ECMAScript bug
  DIALOGS[this.id] = this; //store this dialog into the DIALOGS[] array
  var init = init(); //paint the dialog on the screen

  // shortcuts
  this.DOM = init; //shortcut to the DOM of this dialog (used from DIALOGS[] array)
  this.buddyIcon = getElementsByClassName(init, "img", "buddyIcon")[0]; //shortcut to the buddy icon of this dialog
  this.buddyName = getElementsByClassName(init, "div", "buddyName")[0]; //shortcut to the buddy name (eg: <span> <img src="status_away.gif"/> ppp </span>)
  this.buddyStatus = getElementsByClassName(init, "span", "buddyStatus")[0]; //shortcut to the buddy status (eg: <span> Away: at lunch </span>)
  this.screen = getElementsByClassName(init, "div", "chatHistory")[0]; //shortcut to the chat history div of this dialog
  this.ta = init.getElementsByTagName("TEXTAREA")[0]; //shortcut to the textarea of this dialog
  this.chatStatus = getElementsByClassName(init, "span", "chatStatus")[0]; //shortcut to the chat status span of this dialog
  this.typingImg = getElementsByClassName(init, "img", "typingImg")[0]; //shortcut to the typing image next to the chat status span of this dialog
  this.translate = {
    enabled: false, //shortcut to the translate items on this dialog
    from: "",
    to: "en"
  };

  // initialize BIU, font size, font family, font color
  // NOTE: KEEP THIS AFTER document.body.appendChild() AND AFTER init(),
  //       otherwise bElement etc is not yet on screen, and that.DOM is
  //       not yet initialized!!
  setDialogDefaults();

  // finally focus on this dialog
  focusOnDialog(this);

  /*  ====================================================================================================
    ====================================================================================================

                                   ...  PRIVATE DIALOG PAINT  ...
    
	====================================================================================================
    ==================================================================================================== */

  /**
   * Creates the DOM for this dialog.
   */
  function init() {
    // create dialog components
    var header = createHeader(chatPartner);
    var historyDiv = createChatHistoryDiv();
    var chatControls = createChatControlsAndTextarea(chatPartner);
    var footer = createFooter();
    var container = createContainer(header, historyDiv, chatControls, footer);

    // insert new dialog into the DOM
    document.body.appendChild(container);
    //dojo.debug(container.outerHTML);

    // make dialog draggable
    that.drag = new dojo.dnd.HtmlDragMoveSource(container);
    that.drag.setDragHandle(header);

    // show dialog
    positionDialog(container);

    // finally return with the newly created dialog
    return container;
  } // EOF: init()

  /**
   * Creates the dialog header:

            <!--  DIALOG HEADER  -->
			<div>
			  <div class="topbarActive">
				<a class="topbarTop"></a>
				<span class="topbarMid"></span>
				<a class="topbarClose" onMouseOver="this.className='topbarClosehover'" onMouseOut="this.className='topbarClose'" alt="Close"></a>
				<a class="topbarMax" onMouseOver="this.className='topbarMaxhover'" onMouseOut="this.className='topbarMax'" alt="Maximize"></a>
				<a class="topbarMin" onMouseOver="this.className='topbarMinhover'" onMouseOut="this.className='topbarMin'" alt="Minimize"></a>
			  </div>

			  <div class="topmenuActive">
                <span class=topmenuLeft></span>
                <span class=topmenuImg><img src="img/buddy_icons/shoe.jpg"/></span>
                <span class=topmenuMid><img src="img/buddy_list/online.gif"/>&nbsp;Pettuka</span>
                <span class=topmenuRight></span>
                <span class=topmenuSpc></span>
              </div>
            </div>

   */
  function createHeader(chatPartner) {
    // close image
    var closeImg = document.createElement("A");
    closeImg.className = "topbarClose";
    closeImg.title = LABEL_CLOSE;
    closeImg.onmouseover = function(e) {
      //onmouseover style effects
      if (this.className != "topbarClosehover")
        this.className = "topbarClosehover";
    };
    closeImg.onmouseout = function(e) {
      //onmouseout style effects
      if (this.className != "topbarClose") this.className = "topbarClose";
    };
    closeImg.onclick = function(e) {
      removeDialog();
    };

    // maximize image
    var maxImg = document.createElement("A");
    maxImg.className = "topbarMax";
    maxImg.title = LABEL_MAXIMIZE;
    maxImg.onmouseover = function(e) {
      //onmouseover style effects
      if (this.className != "topbarMaxhover") this.className = "topbarMaxhover";
    };
    maxImg.onmouseout = function(e) {
      //onmouseout style effects
      if (this.className != "topbarMax") this.className = "topbarMax";
    };
    maxImg.onclick = function(e) {
      header.ondblclick(e);
    };

    // minimize image
    var minImg = document.createElement("A");
    minImg.className = "topbarMin";
    minImg.title = LABEL_MINIMIZE;
    minImg.onmouseover = function(e) {
      //onmouseover style effects
      if (this.className != "topbarMinhover") this.className = "topbarMinhover";
    };
    minImg.onmouseout = function(e) {
      //onmouseout style effects
      if (this.className != "topbarMin") this.className = "topbarMin";
    };
    minImg.onclick = function(e) {
      minimizeDialog(that);
    };

    // structural elements -- TOP PART
    var topbarTop = document.createElement("A");
    topbarTop.className = "topbarTop";
    var topbarMid = document.createElement("SPAN");
    topbarMid.className = "topbarMid";
    var topbarActive = document.createElement("DIV");
    topbarActive.className = "topbarActive";

    // assemble TOP PART
    topbarActive.appendChild(topbarTop);
    topbarActive.appendChild(topbarMid);
    topbarActive.appendChild(closeImg);
    topbarActive.appendChild(maxImg);
    topbarActive.appendChild(minImg);

    // structural elements -- BOTTOM PART
    var topmenuLeft = document.createElement("SPAN");
    topmenuLeft.className = "topmenuLeft";
    var topmenuImg = document.createElement("SPAN");
    topmenuImg.className = "topmenuImg";
    var topmenuMid = document.createElement("SPAN");
    topmenuMid.className = "topmenuMid";
    var topmenuRight = document.createElement("SPAN");
    topmenuRight.className = "topmenuRight";
    var topmenuSpc = document.createElement("SPAN");
    topmenuSpc.className = "topmenuSpc";
    topmenuSpc.appendChild(document.createTextNode("\u00A0")); //&nbsp;
    var topmenuActive = document.createElement("DIV");
    topmenuActive.className = "topmenuActive";

    // buddy icon
    var buddyIconImg = document.createElement("IMG");
    buddyIconImg.className = "buddyIcon";
    buddyIconImg.src = chatPartnerBuddyIconSrc;
    buddyIconImg.alt = chatPartner;
    buddyIconImg.title = chatPartner;

    // buddy user status image
    var buddyStatusTextNode = "";
    var buddyUserStatusImg = document.createElement("IMG");
    buddyUserStatusImg.src = IMG_LED_STATUS_OFFLINE_SRC;
    if (USERS[chatPartner]) {
      //need this, because offline users have nothing in USERS[chatPartner]
      if (USERS[chatPartner].status == USER_STATUS_ONLINE)
        buddyUserStatusImg.src = IMG_LED_STATUS_ONLINE_SRC;
      else if (USERS[chatPartner].status == USER_STATUS_AWAY) {
        buddyUserStatusImg.src = IMG_LED_STATUS_AWAY_SRC;
        buddyStatusTextNode = getUserStatusAsText(USER_STATUS_AWAY);
        var firstColon = getBuddy(chatPartner).title.indexOf(":");
        if (firstColon > -1) {
          //this is the length of the chat partner's custom away message on the header of the open dialog
          var customAwayMsg = getBuddy(chatPartner).title.substr(
            firstColon + 2
          );
          if (customAwayMsg.length > 20)
            customAwayMsg = customAwayMsg.substr(0, 20) + "...";
          buddyStatusTextNode += ": " + customAwayMsg;
        }
      }
    }
    buddyUserStatusImg.alt = chatPartner;
    buddyUserStatusImg.title = chatPartner;

    // buddy name
    var buddyName = document.createElement("DIV");
    buddyName.className = "buddyName";
    buddyName.style.cursor = "default";
    buddyName.style.marginLeft = "8px"; // controls how far is the buddy status indicator image from the buddy image
    buddyName.appendChild(buddyUserStatusImg);
    buddyName.appendChild(document.createTextNode("\u00A0"));
    if (chatPartner.length > 15)
      buddyName.appendChild(
        document.createTextNode(chatPartner.substr(0, 15) + "...")
      );
    else buddyName.appendChild(document.createTextNode(chatPartner));

    //create buddyStatus span
    var buddyStatus = document.createElement("SPAN");
    buddyStatus.className = "buddyStatus";
    buddyStatus.appendChild(document.createTextNode(buddyStatusTextNode));
    buddyStatus.style.marginLeft = "8px"; // controls how far is the buddy away message from the buddy image

    // assemble BOTTOM PART
    topmenuImg.appendChild(buddyIconImg);
    topmenuMid.appendChild(buddyName);
    topmenuMid.appendChild(buddyStatus);
    topmenuMid.title = chatPartner;
    topmenuActive.appendChild(topmenuLeft);
    topmenuActive.appendChild(topmenuImg);
    topmenuActive.appendChild(topmenuMid);
    topmenuActive.appendChild(topmenuRight);
    topmenuActive.appendChild(topmenuSpc);

    // create header container
    var header = document.createElement("DIV");
    header.appendChild(topbarActive);
    header.appendChild(topmenuActive);
    header.onmousedown = function(e) {
      //that.DOM.className = 'dialogMove';
      //window.status = '';
    };
    header.onmousemove = function(e) {
      try {
        document.execCommand("Unselect");
      } catch (e) {}
    };
    header.onmouseup = function(e) {
      //that.DOM.className = 'dialog';
      checkDialogHiding();
    };
    header.ondblclick = function(e) {
      try {
        document.execCommand("Unselect");
      } catch (e) {}
      var container = that.DOM;
      var resizeHandle = getElementsByClassName(
        container,
        "img",
        "resizeHandle"
      )[0];
      if (that.maximized) {
        //restore down already maximized object
        //disconnect from window onresize event
        dojo.event.kwDisconnect({
          srcObj: window,
          srcFunc: "onresize",
          targetObj: that,
          targetFunc: "maximizeDialog",
          once: true
        });

        // restore down the dialog
        document.body.style.cursor = "default";
        that.restoreDownDialog();
        container.style.top = that.maximized.top + "px";
        container.style.left = that.maximized.left + "px";

        // swap maximize / tiles images
        var maximizeImg = getElementsByClassName(
          container,
          "a",
          "topbarTiles|topbarTileshover"
        )[0];
        maximizeImg.title = LABEL_MAXIMIZE;
        maximizeImg.className = "topbarMax";
        maximizeImg.onmouseover = function(e) {
          setClassName(e, this, "topbarMaxhover");
        };
        maximizeImg.onmouseout = function(e) {
          setClassName(e, this, "topbarMax");
        };

        //show resize handle
        if (resizeHandle) {
          var btmbarRight = getElementsByClassName(
            container,
            "span",
            "btmbarRight"
          )[0];
          btmbarRight.className = "btmbarResize";
          resizeHandle.style.display = "block";
        }

        // update members
        that.drag.reregister(); //turn on dragging
        that.maximized = null;
      } else {
        //maximize this object

        // update members
        that.maximized = {
          left: container.offsetLeft,
          top: container.offsetTop,
          containerWidth: container.offsetWidth,
          containerHeight: container.offsetHeight
        };
        that.drag.unregister(); //turn off dragging

        // hide resize handle
        if (resizeHandle) {
          //hide resize handle
          resizeHandle.style.display = "none";
          var btmbarResize = getElementsByClassName(
            container,
            "span",
            "btmbarResize"
          )[0];
          btmbarResize.className = "btmbarRight";
        }

        // hide scrollbars, if any
        document.body.scroll = "no";

        // swap maximize / tiles images
        var maximizeImg = getElementsByClassName(
          container,
          "a",
          "topbarMax|topbarMaxhover"
        )[0];
        maximizeImg.title = LABEL_TILES;
        maximizeImg.className = "topbarTiles";
        maximizeImg.onmouseover = function(e) {
          setClassName(e, this, "topbarTileshover");
        };
        maximizeImg.onmouseout = function(e) {
          setClassName(e, this, "topbarTiles");
        };

        // maximize the dialog
        container.style.left = "0px"; //put left to 0
        container.style.top = "0px"; //put top to 0
        that.maximizeDialog(); //maximize the dialog
        container.style.cursor = "default";

        //connect to window onresize event, and remaximize the dialog accordingly!
        dojo.event.kwConnect({
          srcObj: window,
          srcFunc: "onresize",
          targetObj: that,
          targetFunc: "maximizeDialog",
          once: true
        });
      }
    }; // EOF: header.ondblclick()

    // finally return with the newly created dialog header
    return header;
  } // EOF: createHeader()

  /**
   * Creates the chat history div:

            <!--  CHAT HISTORY DIV  -->
            <div class="iwinActive">
                <span class="iwinLeft"></span>
                <div class="chatHistory"></div>
                <span class="iwinRight"></span>
            </div>

   */
  function createChatHistoryDiv() {
    // chat history div
    var historyDiv = document.createElement("DIV");
    historyDiv.className = "chatHistory";
    historyDiv.onscroll = function(e) {
      var newScrollerLength = this.scrollHeight - this.scrollTop;
      if (that.autoScroll.scrollerLength == 0)
        that.autoScroll.scrollerLength = newScrollerLength;
      else {
        if (
          newScrollerLength != that.autoScroll.scrollerLength &&
          that.autoScroll.enabled
        ) {
          that.autoScroll.enabled = false;
          if (this.style.scrollbarArrowColor != "orange") {
            this.style.scrollbarArrowColor = "orange";
            this.style.scrollbarBaseColor = "orange";
            this.style.scrollbarDarkShadowColor = "orange";
          }
        } else if (
          newScrollerLength == that.autoScroll.scrollerLength &&
          !that.autoScroll.enabled
        ) {
          that.autoScroll.enabled = true;
          if (this.style.scrollbarArrowColor != "#999999") {
            this.style.scrollbarArrowColor = "#999999";
            this.style.scrollbarBaseColor = "#999999";
            this.style.scrollbarDarkShadowColor = "#999999";
          }
        }
      }
    };

    // structural elements
    var iwinActive = document.createElement("DIV");
    iwinActive.className = "iwinActive";
    var iwinLeft = document.createElement("SPAN");
    iwinLeft.className = "iwinLeft";
    var iwinRight = document.createElement("SPAN");
    iwinRight.className = "iwinRight";

    // assemble
    iwinActive.appendChild(iwinLeft);
    iwinActive.appendChild(historyDiv);
    iwinActive.appendChild(iwinRight);

    // finally return with the newly created history div container
    return iwinActive;
  } // EOF: createChatHistoryDiv()

  /**
   * Creates the chat controls area, including:
   *    - chat controls

            <!--  CHAT CONTROLS  -->
    		<span class="btmmenuTop">
                <img class="formatright" src="img/dialog/font-style-picker.gif"/>
                <img class="formatright" src="img/dialog/color-palette.gif"/>
                <img class="formatright" src="img/dialog/smiley.gif"/>
                <img class="formatright" src="img/dialog/sound.gif"/>
            </span>
   */
  function createChatControls() {
    // PICKERS
    var fontStylePicker = createFontStylePicker();
    var colorPicker = createColorPicker();
    var translatePicker = createTranslatePicker();
    var soundPicker = createSoundPicker();
    var smileyPicker = createSmileyPicker();

    // assemble
    var btmmenuTop = document.createElement("SPAN");
    btmmenuTop.className = "btmmenuTop";
    btmmenuTop.appendChild(fontStylePicker);
    btmmenuTop.appendChild(colorPicker);
    btmmenuTop.appendChild(translatePicker);
    btmmenuTop.appendChild(smileyPicker);
    btmmenuTop.appendChild(soundPicker);

    // finally return with the newly created chat controls container
    return btmmenuTop;
  } // EOF: createChatControls()

  /**
   * Creates the chat controls area, including:
   *    - chat controls
   *    - textarea
   *    - buddy chat status

            <!--  CHAT CONTROLS, TEXTAREA, STATUS  -->
			<div class="btmmenuActive">
				<span class="btmmenuLeft"></span>
                <span class="btmmenuRight"></span>
				<span class="btmmenuTop">
					<img class="formatleft"  src="img/dialog/format-bold.gif"/>
					<img class="formatleft"  src="img/dialog/format-italic.gif"/>
					<img class="formatleft"  src="img/dialog/format-underline.gif"/>
					<button>Verdana</button>
					<button>12px</button>
					<img class="formatright" src="img/dialog/smiley.gif"/>
					<img class="formatright" src="img/dialog/palette.gif"/>
                </span>
                <textarea class="chatMessage"></textarea>
                <span class="btmmenuBottom">
					<span class="chatStatus">Peter is online</span>
                    <img class="typingImg" src="img/dialog/typing.gif"/>
					<img class="resizeHandle" src="src/widget/templates/grabCorner.gif" alt="Resize"/>
				</span>
			</div>

   */
  function createChatControlsAndTextarea(chatPartner) {
    // CHAT CONTROLS
    var chatControls = createChatControls();

    // TEXTAREA
    var ta = document.createElement("TEXTAREA");
    ta.className = "chatMessage";
    ta.onkeydown = function(e) {
      e = e || event;

      //send history feature
      attemptShowSendHistory(e);

      //chat status feature
      attemptSendChatStatus(e, CHAT_STATUS_TYPING);
    };
    ta.onkeyup = function(e) {
      e = e || event;

      //chat status feature
      attemptSendChatStatus(e, CHAT_STATUS_TYPING);

      //deliver message
      attemptSendMessage(e);
    };
    that.ta = ta;

    // BUDDY CHAT STATUS
    var typingImg = document.createElement("IMG");
    typingImg.className = "typingImg";
    typingImg.style.display = "none";
    typingImg.src = IMG_TYPING_SRC;
    typingImg.alt = getChatStatusAsText(chatPartner, CHAT_STATUS_TYPING);
    typingImg.title = getChatStatusAsText(chatPartner, CHAT_STATUS_TYPING);
    var chatStatusSpan = document.createElement("SPAN");
    chatStatusSpan.className = "chatStatus";
    chatStatusSpan.innerHTML = getChatStatusAsText(
      chatPartner,
      CHAT_STATUS_NOT_TYPING
    );

    // RESIZE HANDLE
    var resizeHandle = document.createElement("IMG");
    resizeHandle.className = "resizeHandle";
    resizeHandle.src = IMG_RESIZE_SRC;
    resizeHandle.alt = LABEL_RESIZE;
    resizeHandle.title = LABEL_RESIZE;
    resizeHandle.onmousedown = function(e) {
      e = e || event;
      window.resizeObject = {
        grabX: e.clientX,
        grabY: e.clientY - 20,
        dialog: that,
        originalWidth: that.DOM.offsetWidth,
        originalHeight: that.DOM.offsetHeight
      };
      //connect to document onmousemove & onmouseup events, and resize accordingly
      dojo.event.kwConnect({
        srcObj: document,
        srcFunc: "onmousemove",
        targetFunc: "resizeOnMouseMove",
        once: true
      });
      dojo.event.kwConnect({
        srcObj: document,
        srcFunc: "onmouseup",
        targetFunc: "resizeOnMouseUp",
        once: true
      });
      if (!IS_IE) e.preventDefault(); //fixes Mozilla onresize start problem
    }; // EOF: resizeHandle.onmousedown()

    // structural elements
    var btmmenuActive = document.createElement("DIV");
    btmmenuActive.className = "btmmenuActive";
    var btmmenuLeft = document.createElement("SPAN");
    btmmenuLeft.className = "btmmenuLeft";
    var btmmenuRight = document.createElement("SPAN");
    btmmenuRight.className = "btmmenuRight";
    var btmmenuBottom = document.createElement("SPAN");
    btmmenuBottom.className = "btmmenuBottom";

    // assemble
    btmmenuBottom.appendChild(chatStatusSpan);
    btmmenuBottom.appendChild(typingImg);
    btmmenuBottom.appendChild(resizeHandle);

    btmmenuActive.appendChild(btmmenuLeft);
    btmmenuActive.appendChild(btmmenuRight);
    btmmenuActive.appendChild(chatControls);
    btmmenuActive.appendChild(ta);
    btmmenuActive.appendChild(btmmenuBottom);

    // finally return with the newly created chat controls container
    return btmmenuActive;
  } // EOF: createChatControlsAndTextarea()

  /**
   * Creates the dialog footer:

            <!--  DIALOG FOOTER  -->
			<div class=btmbarActive>
				<span class=btmbarLeft></span>
				<div class=btmbarMid></div>
				<span class=btmbarResize></span>
			</div>

   */
  function createFooter() {
    // structural elements
    var btmbarActive = document.createElement("DIV");
    btmbarActive.className = "btmbarActive";
    var btmbarLeft = document.createElement("SPAN");
    btmbarLeft.className = "btmbarLeft";
    var btmbarMid = document.createElement("DIV");
    btmbarMid.className = "btmbarMid";
    var btmbarResize = document.createElement("SPAN");
    btmbarResize.className = "btmbarResize";
    btmbarResize.title = LABEL_RESIZE;
    btmbarResize.onmousedown = function(e) {
      var resizeHandle = getElementsByClassName(
        that.DOM,
        "img",
        "resizeHandle"
      )[0];
      resizeHandle.onmousedown(e);
    };

    // assemble
    btmbarActive.appendChild(btmbarLeft);
    btmbarActive.appendChild(btmbarMid);
    btmbarActive.appendChild(btmbarResize);

    // finally return with the newly created dialog footer
    return btmbarActive;
  } // EOF: createFooter()

  /**
   * Create and assemble the dialog container DIV.
   */
  function createContainer(header, historyDiv, chatControls, footer) {
    // create dialog container
    var container = document.createElement("DIV");
    container.className = "nwinActive";
    container.id = that.id;
    container.appendChild(header);
    container.appendChild(historyDiv);
    container.appendChild(chatControls);
    container.appendChild(footer);
    container.onmousedown = function(e) {
      focusOnDialog(that);
    };
    container.onmouseup = function(e) {
      //NOTE: this makes sure that the dialog in focus always has the textarea in focus,
      //      however, it also disables copy+paste because if you select something with the
      //      mouse, it will automatically de-select it and focus on the textarea
      //that.ta.focus();
    };
    container.onkeydown = function(e) {
      e = e || event;
      if (e.keyCode == ESC_KEY) {
        //ESC_KEY = close this dialog
        removeDialog();
        dojo.event.browser.stopEvent(e);
        return false;
      } else if (e.keyCode == TAB_KEY) {
        //TAB_KEY = tab into next dialog
        handleClickFilterEvent();
        var nextDialogId = null;
        var i = 0;
        for (var dialogId in DIALOGS) {
          //dojo.debug( dialogId + ' focus: ' + DIALOGS[dialogId].focus );
          if (DIALOGS[dialogId] && DIALOGS[dialogId].focus > 0) {
            DIALOGS[dialogId].focus--;
            if (DIALOGS[dialogId].focus == 1) {
              nextDialogId = dialogId;
            }
            i++;
          }
        }
        DIALOGS[that.id].focus = i; //set this dialog to last in focus sequence
        if (nextDialogId) focusOnDialog(DIALOGS[nextDialogId]); //focus on next dialog..
      } else if (e.keyCode == PAGEUP_KEY) {
        //PAGEUP_KEY = scroll chat history up
        that.screen.scrollTop -= 30;
      } else if (e.keyCode == PAGEDOWN_KEY) {
        //PAGEDOWN_KEY = scroll chat history down
        that.screen.scrollTop += 30;
      } else if (e.keyCode == X_KEY && e.ctrlKey) {
        //Ctrl + X = maximize this dialog
        handleClickFilterEvent();
        var maximizeImg = getElementsByClassName(
          that.DOM,
          "a",
          "topbarMax|topbarMaxhover|topbarTiles|topbarTileshover"
        )[0];
        maximizeImg.onclick();
        dojo.event.browser.stopEvent(e);
      } else if (e.keyCode == UP_KEY && e.ctrlKey && !that.maximized) {
        //Ctrl + Up = move this dialog up
        handleClickFilterEvent();
        var px = new RegExp("px");
        this.style.top =
          this.style.top.replace(px, "") - DIALOG_MIN_Y_MOVE + "px";
      } else if (e.keyCode == DOWN_KEY && e.ctrlKey && !that.maximized) {
        //Ctrl + Down = move this dialog down
        handleClickFilterEvent();
        var px = new RegExp("px");
        this.style.top =
          this.style.top.replace(px, "") - -DIALOG_MIN_Y_MOVE + "px";
      } else if (e.keyCode == LEFT_KEY && e.ctrlKey && !that.maximized) {
        //Ctrl + Left = move this dialog to the left
        handleClickFilterEvent();
        var px = new RegExp("px");
        this.style.left =
          this.style.left.replace(px, "") - DIALOG_MIN_X_MOVE + "px";
      } else if (e.keyCode == RIGHT_KEY && e.ctrlKey && !that.maximized) {
        //Ctrl + Right = move this dialog to the right
        handleClickFilterEvent();
        var px = new RegExp("px");
        this.style.left =
          this.style.left.replace(px, "") - -DIALOG_MIN_X_MOVE + "px";
      }
    };
    container.ondragenter = function(e) {
      e = e || event;
      focusOnDialog(that);
      that.screen.style.borderColor = "orange";
      dojo.event.browser.stopEvent(e);
    };
    container.ondragover = function(e) {
      e = e || event;
      dojo.event.browser.stopEvent(e);
    };
    container.ondragleave = function(e) {
      e = e || event;
      that.screen.style.borderColor = "";
      dojo.event.browser.stopEvent(e);
    };
    container.ondrop = function(e) {
      e = e || event;
      var d = new Date();
      var currentTime = d.getTime();
      top.cairo.fileUpload[currentTime] = {
        chatPartner: that.chatPartner,
        file: ""
      };
      var fileName = e.dataTransfer.mozGetDataAt("text/x-moz-url", 0);
      loadURLIntoContainer(
        "/sendFileForm.jsp?ct=" + currentTime + "&fn=" + fileName,
        "sendFileForm_" + currentTime,
        false
      );
      dojo.event.browser.stopEvent(e);
    };

    // finally return with the newly created dialog container
    return container;
  } // EOF: createContainer()

  /**
   * Creates the font family picker:

			<button onclick="...">
                <span>Verdana</span>
                <img src="dropDownArrow.gif"/>
            </button>

   */
  function createFontFamilyPicker() {
    // create font family picker
    var dropDownArrow = document.createElement("IMG");
    dropDownArrow.src = IMG_DROPDOWN_ARROW_SRC;
    var fontFamilySpan = document.createElement("SPAN");
    fontFamilySpan.style.color = "#ffffff";
    var defaultFontFamily = getCookieProperty(
      COOKIE_FONTSTYLE,
      DIALOG_FONT_STYLE_FONT_FAMILY
    );
    if (defaultFontFamily) {
      if (defaultFontFamily.length > 12)
        defaultFontFamily = defaultFontFamily.substr(0, 10) + "...";
      fontFamilySpan.appendChild(document.createTextNode(defaultFontFamily));
    } else {
      fontFamilySpan.appendChild(document.createTextNode("Verdana"));
    }
    var fontFamilyPicker = document.createElement("BUTTON");
    fontFamilyPicker.className = "combobox";
    fontFamilyPicker.title = "Font";
    fontFamilyPicker.style.width = "110px";
    fontFamilyPicker.style.fontSize = "10px";
    fontFamilyPicker.appendChild(fontFamilySpan);
    fontFamilyPicker.appendChild(dropDownArrow);
    fontFamilyPicker.onmouseover = function(e) {
      setClassName(e, this, "comboboxFocus");
    };
    fontFamilyPicker.onmouseout = function(e) {
      clearClassName(e, this, "combobox");
    };
    fontFamilyPicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "comboboxFocus";
      };

      //get the font family palette
      var fontFamilyPalette = document.getElementById("fontFamilyPalette");
      if (!fontFamilyPalette) {
        //font family palette has never been created --> let's paint it now!
        //first let's detect the supported font types for this client's browser --> see utils.js
        detectFonts();

        fontFamilyPalette = document.createElement("TABLE");
        fontFamilyPalette.id = "fontFamilyPalette";
        fontFamilyPalette.cellSpacing = "0";
        fontFamilyPalette.cellPadding = "0";
        for (var i = 0; i < FONTS.length; i++) {
          if (FONTS[i].detect) {
            //show only detected font types to the user!
            //the next row
            var nextRow = fontFamilyPalette.insertRow(-1);
            nextRow.className = ""; //by default each entry is NOT in focus
            nextRow.onmouseover = function(e) {
              this.className = "focus";
            }; //onmouseover effects
            nextRow.onmouseout = function(e) {
              this.className = "";
            }; //onmouseout effects
            nextRow.onclick = function(e) {
              handleClickFilterEvent(); //hide fontFamilyPalette
              var fontFamily = this.firstChild.title; //the picked font-family
              if (fontFamily.length > 12)
                fontFamilySpan.innerHTML = fontFamily.substr(0, 10) + "...";
              //if selected font-family too long, truncate it first...
              else fontFamilySpan.innerHTML = fontFamily; //... otherwise simply update text on the fontFamilyPicker to selected font-family
              var focusDialog = getInFocusDialog(); //get the in focus dialog
              focusDialog.ta.style.fontFamily = fontFamily; //update ta's font-family to picked font-family
              focusDialog.ta.focus(); //focus ta
              setCookieProperty(
                COOKIE_FONTSTYLE,
                DIALOG_FONT_STYLE_FONT_FAMILY,
                fontFamily
              ); //save out picked font family
            };

            var nextCell = nextRow.insertCell(-1);
            nextCell.title = FONTS[i].type; //onhover show the user an alt message
            nextCell.appendChild(document.createTextNode(FONTS[i].type));
          }
        }
        document.body.appendChild(fontFamilyPalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [fontFamilyPalette],
        cssObj: [fontFamilyPicker, "combobox"]
      });
      maximizeClickFilter();
      document.getElementById(
        "clickFilter" + window.hideObject.length
      ).style.zIndex = 21;

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position font family palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.left -= 1;
        pos.top -= 3;
      } else {
        pos.left -= 4;
        pos.top -= 5;
      }

      //show font family palette
      if (pos.left + fontFamilyPalette.offsetWidth < document.body.offsetWidth)
        fontFamilyPalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        fontFamilyPalette.style.left =
          pos.left + this.offsetWidth - fontFamilyPalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (
        pos.top + this.offsetHeight + fontFamilyPalette.offsetHeight <
        document.body.offsetHeight
      )
        fontFamilyPalette.style.top = pos.top + this.offsetHeight + "px";
      //if there is enough space, paint it towards the BOTTOM...
      else
        fontFamilyPalette.style.top =
          pos.top - fontFamilyPalette.offsetHeight + "px"; //...otherwise, paint it towards the TOP
      fontFamilyPalette.style.visibility = "visible";
    }; // EOF: fontFamilyPicker.onclick()

    // finally return with the newly created font family picker
    return fontFamilyPicker;
  } // EOF: createFontFamilyPicker()

  /**
   * Creates the font size picker:

			<button onclick="...">
                <span>12px</span>
                <img src="dropDownArrow.gif"/>
            </button>

   */
  function createFontSizePicker() {
    // create font size picker
    var dropDownArrow = document.createElement("IMG");
    dropDownArrow.src = IMG_DROPDOWN_ARROW_SRC;
    var fontSizeSpan = document.createElement("SPAN");
    fontSizeSpan.style.color = "#ffffff";
    var defaultFontSize = getCookieProperty(
      COOKIE_FONTSTYLE,
      DIALOG_FONT_STYLE_FONT_SIZE
    );
    if (defaultFontSize) {
      fontSizeSpan.appendChild(document.createTextNode(defaultFontSize));
    } else {
      fontSizeSpan.appendChild(document.createTextNode("12px"));
    }
    var fontSizePicker = document.createElement("BUTTON");
    fontSizePicker.title = "Font Size";
    fontSizePicker.className = "combobox";
    fontSizePicker.style.width = "55px";
    fontSizePicker.style.fontSize = "10px";
    fontSizePicker.style.marginLeft = "6px";
    fontSizePicker.appendChild(fontSizeSpan);
    fontSizePicker.appendChild(dropDownArrow);
    fontSizePicker.onmouseover = function(e) {
      setClassName(e, this, "comboboxFocus");
    };
    fontSizePicker.onmouseout = function(e) {
      clearClassName(e, this, "combobox");
    };
    fontSizePicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "comboboxFocus";
      };

      //get the font size palette
      var fontSizePalette = document.getElementById("fontSizePalette");
      if (!fontSizePalette) {
        //font size palette has never been created --> let's paint it now!
        fontSizePalette = document.createElement("TABLE");
        fontSizePalette.id = "fontSizePalette";
        fontSizePalette.cellSpacing = "0";
        fontSizePalette.cellPadding = "0";
        for (var i = 0; i < FONTS.length; i++) {
          if (FONTS[i].size != "") {
            //the next row
            var nextRow = fontSizePalette.insertRow(-1);
            nextRow.className = ""; //by default each entry is NOT in focus
            nextRow.onmouseover = function(e) {
              this.className = "focus";
            }; //onmouseover effects
            nextRow.onmouseout = function(e) {
              this.className = "";
            }; //onmouseout effects
            nextRow.onclick = function(e) {
              handleClickFilterEvent(); //hide fontSizePalette
              var fontSize = this.firstChild.title; //the picked font size
              fontSizeSpan.innerHTML = fontSize; //simply update text on the fontSizePicker to selected font size
              var focusDialog = getInFocusDialog(); //get the in focus dialog
              focusDialog.ta.style.fontSize = fontSize; //update ta's font size to picked font size
              focusDialog.ta.focus(); //focus ta
              setCookieProperty(
                COOKIE_FONTSTYLE,
                DIALOG_FONT_STYLE_FONT_SIZE,
                fontSize
              ); //save out picked font size
            };

            var nextCell = nextRow.insertCell(-1);
            nextCell.title = FONTS[i].size + "px"; //onhover show the user an alt message
            nextCell.appendChild(document.createTextNode(FONTS[i].size + "px"));
          }
        }
        document.body.appendChild(fontSizePalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [fontSizePalette],
        cssObj: [fontSizePicker, "combobox"]
      });
      maximizeClickFilter();
      document.getElementById(
        "clickFilter" + window.hideObject.length
      ).style.zIndex = 21;

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position font size palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.left -= 1;
        pos.top -= 3;
      } else {
        pos.left -= 4;
        pos.top -= 5;
      }

      //show font size palette
      if (pos.left + fontSizePalette.offsetWidth < document.body.offsetWidth)
        fontSizePalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        fontSizePalette.style.left =
          pos.left + this.offsetWidth - fontSizePalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (
        pos.top + this.offsetHeight + fontSizePalette.offsetHeight <
        document.body.offsetHeight
      )
        fontSizePalette.style.top = pos.top + this.offsetHeight + "px";
      //if there is enough space, paint it towards the BOTTOM...
      else
        fontSizePalette.style.top =
          pos.top - fontSizePalette.offsetHeight + "px"; //...otherwise, paint it towards the TOP
      fontSizePalette.style.visibility = "visible";
    }; // EOF: fontSizePicker.onclick()

    // finally return with the newly created font size picker
    return fontSizePicker;
  } // EOF: createFontSizePicker()

  /**
   * Creates the color picker:

			<img src="palette.gif" alt="Colors" onclick="..."/>

   */
  function createColorPicker() {
    // create font color picker
    var colorPicker = document.createElement("IMG");
    colorPicker.src = IMG_COLOR_PICKER_SRC;
    colorPicker.alt = "Colors";
    colorPicker.title = "Colors";
    colorPicker.className = "formatleft";
    colorPicker.onmouseover = function(e) {
      if (this.className != "formatleftHover")
        this.className = "formatleftHover";
    };
    colorPicker.onmouseout = function(e) {
      if (this.className != "formatleft") this.className = "formatleft";
    };
    colorPicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "formatleftHover";
      };

      //get the color palette
      var colorPalette = document.getElementById("colorPalette");
      if (!colorPalette) {
        //color palette has never been created --> let's paint it now!
        var colorPaletteChildDiv = document.createElement("DIV");
        colorPalette = document.createElement("DIV");
        colorPalette.id = "colorPalette";
        colorPalette.appendChild(colorPaletteChildDiv);
        document.body.appendChild(colorPalette);
        var widget = dojo.widget.createWidget(
          "dojo:ColorPalette",
          { palette: "7x10" },
          colorPaletteChildDiv
        );
        dojo.event.connect(colorPalette, "onclick", function(evt) {
          var color = evt.target.color;
          if (color) {
            handleClickFilterEvent();
            var focusDialog = getInFocusDialog(); //get the in focus dialog
            focusDialog.ta.style.color = color; //update ta's color to picked color
            focusDialog.ta.focus(); //focus ta
            setCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_COLOR, color); //save out picked color
          }
        });
      }

      //show click filter
      window.hideObject.push({
        obj: [colorPalette],
        cssObj: [colorPicker, "formatleft"]
      });
      maximizeClickFilter();

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position color palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.top -= 1;
      } else {
        pos.left -= 2;
        pos.top -= 2;
      }

      //show dojo color picker (aka colorPalette)
      if (pos.left + colorPalette.offsetWidth < document.body.offsetWidth)
        colorPalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        colorPalette.style.left =
          pos.left + this.offsetWidth - colorPalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (pos.top - colorPalette.offsetHeight > 0)
        colorPalette.style.top = pos.top - colorPalette.offsetHeight + "px";
      //paint it towards the TOP...
      else colorPalette.style.top = pos.top + this.offsetHeight + "px"; //...otherwise, towards the BOTTOM...
      colorPalette.style.visibility = "visible";
    }; // EOF: colorPicker.onclick()

    // finally return with the newly created font color picker
    return colorPicker;
  } // EOF: createColorPicker()

  /**
   * Creates the language dropdown for the translate palette:

			<button onclick="...">
                <span>English</span>
                <img src="dropDownArrow.gif"/>
            </button>

   */
  function createLanguagePicker(cssId) {
    // create language picker
    var dropDownArrow = document.createElement("IMG");
    dropDownArrow.src = IMG_DROPDOWN_ARROW_SRC;
    var langSpan = document.createElement("SPAN");
    var langCode = that.translate.from;
    var displayText = "English";
    if (cssId == "languagePaletteTo") langCode = that.translate.to;
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].code == langCode) {
        displayText = LANGUAGES[i].name;
        break;
      }
    }
    langSpan.appendChild(document.createTextNode(displayText));
    var langPicker = document.createElement("BUTTON");
    langPicker.className = "combobox";
    langPicker.title = "Select desired language";
    langPicker.style.width = "85px";
    langPicker.style.fontSize = "10px";
    langPicker.appendChild(langSpan);
    langPicker.appendChild(dropDownArrow);
    langPicker.onmouseover = function(e) {
      setClassName(e, this, "comboboxFocus");
    };
    langPicker.onmouseout = function(e) {
      clearClassName(e, this, "combobox");
    };
    langPicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "comboboxFocus";
      };

      //get the language palette
      var languagePalette = document.getElementById(cssId);
      if (!languagePalette) {
        //language palette has never been created --> let's paint it now!
        languagePalette = document.createElement("TABLE");
        languagePalette.id = cssId;
        languagePalette.cellSpacing = "0";
        languagePalette.cellPadding = "0";
        for (
          var i = cssId == "languagePaletteFrom" ? 0 : 1;
          i < LANGUAGES.length;
          i++
        ) {
          //the next row
          var nextRow = languagePalette.insertRow(-1);
          nextRow.className = ""; //by default each entry is NOT in focus
          nextRow.onmouseover = function(e) {
            this.className = "focus";
          }; //onmouseover effects
          nextRow.onmouseout = function(e) {
            this.className = "";
          }; //onmouseout effects
          nextRow.onclick = function(e) {
            handleClickFilterEvent();
            var focusDialog = getInFocusDialog(); //get the in focus dialog
            var selectedLanguage = this.firstChild.title; //the picked language
            if (selectedLanguage.length > 12)
              selectedLanguage = selectedLanguage.substr(0, 12) + "..."; //if selected language too long, truncate it first
            if (cssId == "languagePaletteFrom") {
              focusDialog.translate.from = this.firstChild.code;
              document
                .getElementById("translatePalette")
                .getElementsByTagName("SPAN")[1].innerHTML = selectedLanguage;
            } else {
              focusDialog.translate.to = this.firstChild.code;
              document
                .getElementById("translatePalette")
                .getElementsByTagName("SPAN")[2].innerHTML = selectedLanguage;
            }
            updateTranslatePicker(focusDialog);
          };

          var nextCell = nextRow.insertCell(-1);
          nextCell.title = LANGUAGES[i].name; //onhover show the user an alt message
          nextCell.code = LANGUAGES[i].code;
          nextCell.appendChild(document.createTextNode(LANGUAGES[i].name));
        }
        document.body.appendChild(languagePalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [languagePalette],
        cssObj: [langPicker, "combobox"]
      });
      maximizeClickFilter();
      document.getElementById(
        "clickFilter" + window.hideObject.length
      ).style.zIndex = 21;

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position language palette right above this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.left -= 1;
        pos.top -= 3;
      } else {
        pos.left -= 4;
        pos.top -= 5;
      }

      //show font family palette
      if (pos.left + languagePalette.offsetWidth < document.body.offsetWidth)
        languagePalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        languagePalette.style.left =
          pos.left + this.offsetWidth - languagePalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (
        pos.top + this.offsetHeight + languagePalette.offsetHeight <
        document.body.offsetHeight
      )
        languagePalette.style.top = pos.top + this.offsetHeight + "px";
      //if there is enough space, paint it towards the BOTTOM...
      else
        languagePalette.style.top =
          pos.top - languagePalette.offsetHeight + "px"; //...otherwise, paint it towards the TOP
      languagePalette.style.visibility = "visible";
    }; // EOF: langPicker.onclick()

    // finally return with the newly created language picker
    return langPicker;
  } // EOF: createLanguagePicker()

  /**
   * Updates the alt (text) of the translate picker.
   */
  function updateTranslatePicker(dialog) {
    var translatePicker = getElementsByClassName(
      dialog.DOM,
      "img",
      "formatleft|formatleftHover"
    )[2];
    if (dialog.translate.enabled) {
      var fromLanguage = dialog.translate.from;
      var toLanguage = dialog.translate.to;
      for (var i = 0; i < LANGUAGES.length; i++) {
        if (LANGUAGES[i].code == dialog.translate.from)
          fromLanguage = LANGUAGES[i].name;
        if (LANGUAGES[i].code == dialog.translate.to)
          toLanguage = LANGUAGES[i].name;
      }
      translatePicker.alt = fromLanguage + " --> " + toLanguage;
      translatePicker.title = fromLanguage + " --> " + toLanguage;
    } else {
      translatePicker.alt = "Translate";
      translatePicker.title = "Translate";
    }
  }

  /**
   * Creates the translate picker:

			<img src="palette.gif" alt="Translate" onclick="..."/>

   */
  function createTranslatePicker() {
    // create translate picker
    var translatePicker = document.createElement("IMG");
    translatePicker.src = IMG_TRANSLATE_PICKER_OFF_SRC;
    translatePicker.alt = "Translate";
    translatePicker.title = "Translate";
    translatePicker.className = "formatleft";
    translatePicker.onmouseover = function(e) {
      if (this.className != "formatleftHover")
        this.className = "formatleftHover";
    };
    translatePicker.onmouseout = function(e) {
      if (this.className != "formatleft") this.className = "formatleft";
    };
    translatePicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "formatleftHover";
      };

      //get the translate palette
      var translatePalette = document.getElementById("translatePalette");
      if (translatePalette) {
        //remove previously painted translate palette (possibly for another dialog)
        dojo.widget.manager.getWidgetById("translateCheckbox").destroy();
        translatePalette.parentNode.removeChild(translatePalette);
      }

      //start: translatePalette painting
      //label
      var tranLabel = document.createElement("LABEL");
      tranLabel.htmlFor = "translateCheckbox";
      tranLabel.style.marginLeft = "5px";
      tranLabel.appendChild(document.createTextNode("Translate"));
      if (!IS_IE) {
        tranLabel.onclick = function(e) {
          tranCheckbox.domNode.onclick(e);
        };
      }

      //checkbox
      var tranCheckbox = dojo.widget.createWidget("Checkbox", {
        id: "translateCheckbox",
        widgetId: "translateCheckbox",
        name: "translateCheckbox"
      });
      dojo.event.connect(tranCheckbox.domNode, "onclick", function(evt) {
        if (dojo.widget.manager.getWidgetById("translateCheckbox").checked) {
          tranLabel.style.fontWeight = "bold";
          translatePicker.src = IMG_TRANSLATE_PICKER_ON_SRC;
          that.translate.enabled = true;
          updateTranslatePicker(that);
        } else {
          tranLabel.style.fontWeight = "normal";
          translatePicker.src = IMG_TRANSLATE_PICKER_OFF_SRC;
          that.translate.enabled = false;
          updateTranslatePicker(that);
        }
      });

      //language pickers
      var fromLanguage = createLanguagePicker("languagePaletteFrom");
      var toLanguage = createLanguagePicker("languagePaletteTo");

      //table
      var tranTable = document.createElement("TABLE");
      tranTable.id = "translateTable";
      tranTable.cellSpacing = "0";
      tranTable.cellPadding = "0";
      tranTable.border = "0";
      var firstRow = tranTable.insertRow(-1);
      var cell11 = firstRow.insertCell(-1);
      cell11.appendChild(document.createTextNode("From:"));
      var cell12 = firstRow.insertCell(-1);
      cell12.appendChild(fromLanguage);
      var secondRow = tranTable.insertRow(-1);
      var cell21 = secondRow.insertCell(-1);
      cell21.appendChild(document.createTextNode("To:"));
      var cell22 = secondRow.insertCell(-1);
      cell22.appendChild(toLanguage);

      //initialize state
      if (that.translate.enabled) tranCheckbox.domNode.onclick(e);

      //assembly
      translatePalette = document.createElement("DIV");
      translatePalette.id = "translatePalette";
      translatePalette.appendChild(tranCheckbox.domNode);
      translatePalette.appendChild(tranLabel);
      translatePalette.appendChild(tranTable);
      document.body.appendChild(translatePalette);
      //eof: translatePalette painting

      //show click filter
      window.hideObject.push({
        obj: [translatePalette],
        cssObj: [translatePicker, "formatleft"]
      });
      maximizeClickFilter();

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position translate palette right above this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.top -= 1;
      } else {
        pos.left -= 2;
        pos.top -= 2;
      }

      //show translate palette
      if (pos.left + translatePalette.offsetWidth < document.body.offsetWidth)
        translatePalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        translatePalette.style.left =
          pos.left + this.offsetWidth - translatePalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (pos.top - translatePalette.offsetHeight > 0)
        translatePalette.style.top =
          pos.top - translatePalette.offsetHeight + "px";
      //paint it towards the TOP...
      else translatePalette.style.top = pos.top + this.offsetHeight + "px"; //...otherwise, towards the BOTTOM...
      translatePalette.style.visibility = "visible";
    }; // EOF: translatePicker.onclick()

    // finally return with the newly created translate picker
    return translatePicker;
  } // EOF: createTranslatePicker()

  /**
   * Creates the font style picker:

			<img src="font.gif" alt="Font Style" onclick="..."/>

   */
  function createFontStylePicker() {
    // create sounds picker
    var fontStylePicker = document.createElement("IMG");
    fontStylePicker.className = "formatleft";
    fontStylePicker.src = IMG_FONT_STYLE_PICKER_SRC;
    fontStylePicker.alt = "Font Style";
    fontStylePicker.title = "Font Style";
    fontStylePicker.onmouseover = function(e) {
      if (this.className != "formatleftHover")
        this.className = "formatleftHover";
    };
    fontStylePicker.onmouseout = function(e) {
      if (this.className != "formatleft") this.className = "formatleft";
    };
    fontStylePicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "formatleftHover";
      };

      //get the font style palette
      var fontStylePalette = document.getElementById("fontStylePalette");
      if (!fontStylePalette) {
        //fontStylePalette has never been created --> let's paint it now!
        fontStylePalette = document.createElement("DIV");
        fontStylePalette.id = "fontStylePalette";

        // BIU
        var bElement = document.createElement("IMG");
        bElement.src = IMG_BLANK_SRC;
        bElement.alt = "Bold";
        bElement.title = "Bold";
        if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_BOLD)) {
          bElement.checked = true;
          bElement.className = "formatleft bElementOn";
        } else {
          bElement.checked = false;
          bElement.className = "formatleft bElementOff";
        }
        bElement.onmouseover = function(e) {
          if (!this.className.match("formatleftHover "))
            this.className =
              "formatleftHover " +
              (this.checked ? "bElementOn" : "bElementOff");
        };
        bElement.onmouseout = function(e) {
          if (!this.className.match("formatleft "))
            this.className =
              "formatleft " + (this.checked ? "bElementOn" : "bElementOff");
        };
        bElement.onclick = function(e) {
          var focusDialog = getInFocusDialog();
          if (!bElement.checked) {
            focusDialog.ta.style.fontWeight = "bold";
            setCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_BOLD, "1");
            bElement.checked = true;
            bElement.className = "formatleftHover bElementOn";
          } else {
            focusDialog.ta.style.fontWeight = "normal";
            setCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_BOLD, "0");
            bElement.checked = false;
            bElement.className = "formatleftHover bElementOff";
          }
        };
        var iElement = document.createElement("IMG");
        iElement.src = IMG_BLANK_SRC;
        iElement.alt = "Italic";
        iElement.title = "Italic";
        if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_ITALIC)) {
          iElement.checked = true;
          iElement.className = "formatleft iElementOn";
        } else {
          iElement.checked = false;
          iElement.className = "formatleft iElementOff";
        }
        iElement.onmouseover = function(e) {
          if (!this.className.match("formatleftHover "))
            this.className =
              "formatleftHover " +
              (this.checked ? "iElementOn" : "iElementOff");
        };
        iElement.onmouseout = function(e) {
          if (!this.className.match("formatleft "))
            this.className =
              "formatleft " + (this.checked ? "iElementOn" : "iElementOff");
        };
        iElement.onclick = function(e) {
          var focusDialog = getInFocusDialog();
          if (!iElement.checked) {
            focusDialog.ta.style.fontStyle = "italic";
            setCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_ITALIC, "1");
            iElement.checked = true;
            iElement.className = "formatleftHover iElementOn";
          } else {
            focusDialog.ta.style.fontStyle = "normal";
            setCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_ITALIC, "0");
            iElement.checked = false;
            iElement.className = "formatleftHover iElementOff";
          }
        };
        var uElement = document.createElement("IMG");
        uElement.src = IMG_BLANK_SRC;
        uElement.alt = "Underline";
        uElement.title = "Underline";
        if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_UNDERLINE)) {
          uElement.checked = true;
          uElement.className = "formatleft uElementOn";
        } else {
          uElement.checked = false;
          uElement.className = "formatleft uElementOff";
        }
        uElement.onmouseover = function(e) {
          if (!this.className.match("formatleftHover "))
            this.className =
              "formatleftHover " +
              (this.checked ? "uElementOn" : "uElementOff");
        };
        uElement.onmouseout = function(e) {
          if (!this.className.match("formatleft "))
            this.className =
              "formatleft " + (this.checked ? "uElementOn" : "uElementOff");
        };
        uElement.onclick = function(e) {
          var focusDialog = getInFocusDialog();
          if (!uElement.checked) {
            focusDialog.ta.style.textDecoration = "underline";
            setCookieProperty(
              COOKIE_FONTSTYLE,
              DIALOG_FONT_STYLE_UNDERLINE,
              "1"
            );
            uElement.checked = true;
            uElement.className = "formatleftHover uElementOn";
          } else {
            focusDialog.ta.style.textDecoration = "none";
            setCookieProperty(
              COOKIE_FONTSTYLE,
              DIALOG_FONT_STYLE_UNDERLINE,
              "0"
            );
            uElement.checked = false;
            uElement.className = "formatleftHover uElementOff";
          }
        };

        // PICKERS
        var fontFamilyPicker = createFontFamilyPicker();
        var fontSizePicker = createFontSizePicker();

        // assemble
        fontStylePalette.appendChild(fontFamilyPicker);
        fontStylePalette.appendChild(fontSizePicker);
        var lineBreak = document.createElement("BR");
        lineBreak.style.lineHeight = "20pt";
        fontStylePalette.appendChild(lineBreak);
        fontStylePalette.appendChild(bElement);
        fontStylePalette.appendChild(iElement);
        fontStylePalette.appendChild(uElement);

        document.body.appendChild(fontStylePalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [fontStylePalette],
        cssObj: [fontStylePicker, "formatleft"]
      });
      maximizeClickFilter();

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.top -= 1;
      } else {
        pos.left -= 2;
        pos.top -= 2;
      }

      //show the palette
      if (pos.left + fontStylePalette.offsetWidth < document.body.offsetWidth)
        fontStylePalette.style.left = pos.left + "px";
      //if there is enough space, paint it towards the RIGHT...
      else
        fontStylePalette.style.left =
          pos.left + this.offsetWidth - fontStylePalette.offsetWidth + "px"; //...otherwise, paint it towards the LEFT
      if (pos.top - fontStylePalette.offsetHeight > 0)
        fontStylePalette.style.top =
          pos.top - fontStylePalette.offsetHeight + "px";
      //if there is enough space, paint it towards the TOP...
      else fontStylePalette.style.top = pos.top + this.offsetHeight + "px"; //...otherwise, paint it towards the BOTTOM
      fontStylePalette.style.visibility = "visible";
    }; // EOF: fontStylePalette.onclick()

    // finally return with the newly created picker
    return fontStylePicker;
  } // EOF: createFontStylePicker()

  /**
   * Creates the sounds picker:

			<img src="hand.gif" alt="Sounds" onclick="..."/>

   */
  function createSoundPicker() {
    // create sounds picker
    var soundsPicker = document.createElement("IMG");
    soundsPicker.className = "formatright";
    soundsPicker.src = IMG_SOUND_PICKER_SRC;
    soundsPicker.alt = "Sounds";
    soundsPicker.title = "Sounds";
    soundsPicker.onmouseover = function(e) {
      if (this.className != "formatrightHover")
        this.className = "formatrightHover";
    };
    soundsPicker.onmouseout = function(e) {
      if (this.className != "formatright") this.className = "formatright";
    };
    soundsPicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "formatrightHover";
      };

      //get the sounds palette
      var soundsPalette = document.getElementById("soundsPalette");
      if (!soundsPalette) {
        //sounds palette has never been created --> let's paint it now!
        soundsPalette = document.createElement("TABLE");
        soundsPalette.id = "soundsPalette";
        var nextRow = null;
        for (var i = 0; i < SOUNDS.length; i++) {
          //the next sound effect
          var nextSound = document.createElement("IMG");
          nextSound.src = SOUNDS[i].img;

          //the next row: only if divisible by 4
          if (i % 4 == 0) nextRow = soundsPalette.insertRow(-1);

          var nextCell = nextRow.insertCell(-1);
          nextCell.className = ""; //by default each entry is NOT in focus
          nextCell.title = SOUNDS[i].desc; //onhover show the user an alt message
          nextCell.effectId = SOUNDS[i].name; //effectId stores the ID of the effect to show
          nextCell.onmouseover = function(e) {
            this.className = "focus";
          }; //onmouseover effects
          nextCell.onmouseout = function(e) {
            this.className = "";
          }; //onmouseout effects
          nextCell.onclick = function(e) {
            handleClickFilterEvent(); //hide soundsPalette
            var focusDialog = getInFocusDialog(); //get the in focus dialog
            sendSpecialEffect(
              focusDialog.chatPartner,
              SPECIAL_EFFECT_TYPE_SOUND,
              this.effectId
            ); //send over the special effect to the chat partner
            paintSystemMessageOnDialogAboutIncomingSpecialEffect(
              focusDialog.chatPartner,
              SPECIAL_EFFECT_TYPE_SOUND,
              this.effectId,
              true
            ); //paint System message on self dialog
            //Sound.play(this.effectId);//delete this line
          };
          nextCell.appendChild(nextSound);
        }
        document.body.appendChild(soundsPalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [soundsPalette],
        cssObj: [soundsPicker, "formatright"]
      });
      maximizeClickFilter();

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position special effects palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.top += 1;
      } else {
        pos.left -= 2;
        pos.top -= 2;
      }

      //show the special effects palette
      if (pos.left - soundsPalette.offsetWidth > 0)
        soundsPalette.style.left =
          pos.left + this.offsetWidth - soundsPalette.offsetWidth + "px";
      //if there is enough space, paint it towards the LEFT
      else soundsPalette.style.left = pos.left + "px"; //...otherwise, paint it towards the RIGHT
      if (pos.top - soundsPalette.offsetHeight > 0)
        soundsPalette.style.top = pos.top - soundsPalette.offsetHeight + "px";
      //if there is enough space, paint it towards the TOP
      else soundsPalette.style.top = pos.top + this.offsetHeight + "px"; //...otherwise, paint it towards the BOTTOM...
      soundsPalette.style.visibility = "visible";
    }; // EOF: soundsPalette.onclick()

    // finally return with the newly created picker
    return soundsPicker;
  } // EOF: createSoundPicker()

  /**
   * Creates the smiley picker:

			<img src="smiley.gif" alt="Emoticons" onclick="..."/>

   */
  function createSmileyPicker() {
    // create smiley picker
    var smileyPicker = document.createElement("IMG");
    smileyPicker.className = "formatright";
    smileyPicker.src = IMG_SMILEY_PICKER_SRC;
    smileyPicker.alt = "Emoticons";
    smileyPicker.title = "Emoticons";
    smileyPicker.onmouseover = function(e) {
      if (this.className != "formatrightHover")
        this.className = "formatrightHover";
    };
    smileyPicker.onmouseout = function(e) {
      if (this.className != "formatright") this.className = "formatright";
    };
    smileyPicker.onclick = function(e) {
      this.onmouseout = function(e) {
        this.className = "formatrightHover";
      };

      //get the smiley palette
      var smileyPalette = document.getElementById("smileyPalette");
      if (!smileyPalette) {
        //smiley palette has never been created --> let's paint it now!
        smileyPalette = document.createElement("TABLE");
        smileyPalette.id = "smileyPalette";
        var nextRow = null;
        for (var i = 0; i < SMILEYS.length; i++) {
          //the next smiley
          var nextSmiley = document.createElement("IMG");
          nextSmiley.src = SMILEYS[i].img;

          //the next row: only if divisible by 5
          if (i % 5 == 0) nextRow = smileyPalette.insertRow(-1);

          var nextCell = nextRow.insertCell(-1);
          nextCell.className = ""; //by default each entry is NOT in focus
          nextCell.title = SMILEYS[i].desc; //onhover show the user an alt message
          nextCell.keyCode = "'" + SMILEYS[i].regExp[0] + "'"; //nextCell.keyCode stores what we append to the textarea if this smiley is clicked on!
          nextCell.keyCode = nextCell.keyCode.substr(2); //cut '/' from the beginning
          nextCell.keyCode = nextCell.keyCode.substr(
            0,
            nextCell.keyCode.length - 3
          ); //cut '/i' from the end
          nextCell.keyCode = nextCell.keyCode.replace(/\\/g, ""); //remove all '\' chars
          if (nextCell.keyCode.search(/\[/g) > -1) {
            //select first option from [:,;] kind of group
            nextCell.keyCode = nextCell.keyCode.substr(
              nextCell.keyCode.search(/\[/g) + 1
            );
            nextCell.keyCode =
              nextCell.keyCode.substr(0, nextCell.keyCode.search(/,/g)) +
              nextCell.keyCode.substr(nextCell.keyCode.search(/\]/g) + 1);
          }
          nextCell.onmouseover = function(e) {
            this.className = "focus";
          }; //onmouseover effects
          nextCell.onmouseout = function(e) {
            this.className = "";
          }; //onmouseout effects
          nextCell.onclick = function(e) {
            handleClickFilterEvent(); //hide smileyPalette
            var focusDialog = getInFocusDialog(); //get the in focus dialog
            focusDialog.ta.value += this.keyCode; //append clicked smiley to ta
            focusDialog.ta.focus(); //focus ta
          };
          nextCell.appendChild(nextSmiley);
        }
        document.body.appendChild(smileyPalette);
      }

      //show click filter
      window.hideObject.push({
        obj: [smileyPalette],
        cssObj: [smileyPicker, "formatright"]
      });
      maximizeClickFilter();

      //connect to window onresize event, and remaximize the click filter accordingly!
      dojo.event.kwConnect({
        srcObj: window,
        srcFunc: "onresize",
        targetFunc: "maximizeClickFilter",
        once: true
      });

      //position smiley palette right under this picker
      var pos = dojo.html.getAbsolutePosition(this);
      if (IS_IE) {
        pos.top += 1;
      } else {
        pos.left -= 2;
        pos.top -= 2;
      }

      //show the smiley palette
      if (pos.left - smileyPalette.offsetWidth > 0)
        smileyPalette.style.left =
          pos.left + this.offsetWidth - smileyPalette.offsetWidth + "px";
      //if there is enough space, paint it towards the LEFT
      else smileyPalette.style.left = pos.left + "px"; //...otherwise, paint it towards the RIGHT
      if (pos.top - smileyPalette.offsetHeight > 0)
        smileyPalette.style.top = pos.top - smileyPalette.offsetHeight + "px";
      //if there is enough space, paint it towards the TOP
      else smileyPalette.style.top = pos.top + this.offsetHeight + "px"; //...otherwise, paint it towards the BOTTOM
      smileyPalette.style.visibility = "visible";
    }; // EOF: smileyPicker.onclick()

    // finally return with the newly created smiley picker
    return smileyPicker;
  } // EOF: createSmileyPicker()

  /**
   * Read the dialog cookie values, and initialize the chat controls accordingly.
   * This method basically sets the BIU, font family, font size and font color to ON/OFF,
   * based on what was saved out into cookies.
   */
  function setDialogDefaults() {
    // init Bold
    if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_BOLD)) {
      that.ta.style.fontWeight = "bold";
    }
    // init Italic
    if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_ITALIC)) {
      that.ta.style.fontStyle = "italic";
    }
    // init Underline
    if (getCookieProperty(COOKIE_FONTSTYLE, DIALOG_FONT_STYLE_UNDERLINE)) {
      that.ta.style.textDecoration = "underline";
    }
    // init font family
    var defaultFontFamily = getCookieProperty(
      COOKIE_FONTSTYLE,
      DIALOG_FONT_STYLE_FONT_FAMILY
    );
    if (defaultFontFamily) {
      that.ta.style.fontFamily = defaultFontFamily;
    }
    // init font size
    var defaultFontSize = getCookieProperty(
      COOKIE_FONTSTYLE,
      DIALOG_FONT_STYLE_FONT_SIZE
    );
    if (defaultFontSize) {
      that.ta.style.fontSize = defaultFontSize;
    }
    // init font color
    var defaultFontColor = getCookieProperty(
      COOKIE_FONTSTYLE,
      DIALOG_FONT_STYLE_COLOR
    );
    if (defaultFontColor) {
      that.ta.style.color = convertToHexColor(defaultFontColor);
    } else {
      // this is the default color, in case nothing has been set by this user yet
      that.ta.style.color = "#ffffff";
    }
    // init translate picker
    if (that.translate.enabled) {
      getElementsByClassName(
        that.DOM,
        "img",
        "formatleft"
      )[2].src = IMG_TRANSLATE_PICKER_ON_SRC;
    }
  } // EOF: setDialogDefaults()

  /*  ====================================================================================================
    ====================================================================================================

                                  ...  PRIVATE DIALOG EVENTS  ...
    
	====================================================================================================
    ==================================================================================================== */

  /**
   * Append the given msg (a simple js string) to the sendHistory array of this dialog.
   */
  this.addMessageToSendHistory = function(msg) {
    this.sendHistory.arr.push(msg);
  };

  /**
   * Maximizes this dialog on the screen.
   */
  this.maximizeDialog = function() {
    var totalWidth = Math.max(DIALOG_MIN_WIDTH, document.body.offsetWidth); //total width of maximized object
    var totalHeight = Math.max(DIALOG_MIN_HEIGHT, document.body.offsetHeight); //total height of maximized object

    // structural elements
    var topbarMid = getElementsByClassName(that.DOM, "span", "topbarMid")[0];
    var topmenuMid = getElementsByClassName(that.DOM, "span", "topmenuMid")[0];
    var topmenuSpc = getElementsByClassName(that.DOM, "span", "topmenuSpc")[0];
    var iwinActive = getElementsByClassName(that.DOM, "div", "iwinActive")[0];
    if (iwinActive == null)
      iwinActive = getElementsByClassName(that.DOM, "div", "iwinInactive")[0]; //needed when maximizing a hidden (otherwise minimized visually) dialog
    var iwinLeft = getElementsByClassName(that.DOM, "span", "iwinLeft")[0];
    var iwinRight = getElementsByClassName(that.DOM, "span", "iwinRight")[0];
    var btmmenuTop = getElementsByClassName(that.DOM, "span", "btmmenuTop")[0];
    var btmmenuBottom = getElementsByClassName(
      that.DOM,
      "span",
      "btmmenuBottom"
    )[0];
    var btmbarMid = getElementsByClassName(that.DOM, "div", "btmbarMid")[0];

    // resize elements: WIDTH
    that.DOM.style.width = totalWidth + "px";
    topbarMid.style.width = totalWidth - 114 + "px"; // 114 = 300 - 186 = dialog_min width - dialog_min topbarMid width
    topmenuMid.style.width = totalWidth - 69 + "px"; // 69 = 2 x (dialog border width) + img width + padding
    topmenuSpc.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width)
    that.screen.style.width = totalWidth - 18 + "px"; // 18 = 300 - 284 + 2 = 2 x (dialog border width) + 2px = 8px + 8px + 2px
    btmmenuTop.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px
    btmmenuBottom.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px
    if (IS_IE) that.ta.style.width = totalWidth - 20 + "px";
    // 20 = 300 - 280 = IE textarea width
    else if (IS_CHROME || IS_SAFARI)
      that.ta.style.width = totalWidth - 22 + "px";
    // Chrome textarea width
    else that.ta.style.width = totalWidth - 18 + "px"; // 20 = 300 - 282 = FF textarea width
    btmbarMid.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px

    // resize elements: HEIGHT
    iwinActive.style.height = totalHeight - 202 + "px"; // 202
    iwinLeft.style.height = totalHeight - 202 + "px"; // 202 = 370 - 166 - 2 = dialog_min height - dialog_min iwinLeft height + 2px border
    that.screen.style.height = totalHeight - 204 + "px"; // 204 = 370 - 166 = dialog_min height - dialog_min chatHistory height
    iwinRight.style.height = totalHeight - 202 + "px"; // 202 = 370 - 166 - 2 = dialog_min height - dialog_min iwinRight height + 2px border

    // scroll down the scroller on the chatHistoryDiv
    scrollDownScreen(that.id);
  };

  /**
   * Restores down this dialog on the screen.
   * This method is used to restore down a dialog that has been maximized.
   */
  this.restoreDownDialog = function() {
    var totalWidth = Math.max(DIALOG_MIN_WIDTH, that.maximized.containerWidth); //total width of restored object
    var totalHeight = Math.max(
      DIALOG_MIN_HEIGHT,
      that.maximized.containerHeight
    ); //total height of restored object

    // structural elements
    var topbarMid = getElementsByClassName(that.DOM, "span", "topbarMid")[0];
    var topmenuMid = getElementsByClassName(that.DOM, "span", "topmenuMid")[0];
    var topmenuSpc = getElementsByClassName(that.DOM, "span", "topmenuSpc")[0];
    var iwinActive = getElementsByClassName(that.DOM, "div", "iwinActive")[0];
    var iwinLeft = getElementsByClassName(that.DOM, "span", "iwinLeft")[0];
    var iwinRight = getElementsByClassName(that.DOM, "span", "iwinRight")[0];
    var btmmenuTop = getElementsByClassName(that.DOM, "span", "btmmenuTop")[0];
    var btmmenuBottom = getElementsByClassName(
      that.DOM,
      "span",
      "btmmenuBottom"
    )[0];
    var btmbarMid = getElementsByClassName(that.DOM, "div", "btmbarMid")[0];

    // resize elements: WIDTH
    that.DOM.style.width = totalWidth + "px";
    topbarMid.style.width = totalWidth - 114 + "px"; // 114 = 300 - 186 = dialog_min width - dialog_min topbarMid width
    topmenuMid.style.width = totalWidth - 69 + "px"; // 69 = 2 x (dialog border width) + img width + padding
    topmenuSpc.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width)
    that.screen.style.width = totalWidth - 18 + "px"; // 18 = 300 - 284 + 2 = 2 x (dialog border width) + 2px = 8px + 8px + 2px
    btmmenuTop.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px
    btmmenuBottom.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px
    if (IS_IE) that.ta.style.width = totalWidth - 20 + "px";
    // 20 = 300 - 280 = IE textarea width
    else if (IS_CHROME || IS_SAFARI)
      that.ta.style.width = totalWidth - 22 + "px";
    // Chrome textarea width
    else that.ta.style.width = totalWidth - 18 + "px"; // 20 = 300 - 282 = FF textarea width
    btmbarMid.style.width = totalWidth - 16 + "px"; // 16 = 300 - 284 = 2 x (dialog border width) = 8px + 8px

    // resize elements: HEIGHT
    iwinActive.style.height = totalHeight - 202 + "px"; // 202
    iwinLeft.style.height = totalHeight - 202 + "px"; // 202
    that.screen.style.height = totalHeight - 204 + "px"; // 204
    iwinRight.style.height = totalHeight - 202 + "px"; // 202

    // scroll down the scroller on the chatHistoryDiv
    scrollDownScreen(that.id);
  };

  /**
   * Removes this dialog from the screen.
   */
  function removeDialog() {
    if (that.DOM) {
      //remove any popups
      handleClickFilterEvent();

      //decrease remaining dialog focuses in DIALOGS HashMap, and figure out which dialog to focus next
      var nextDialogId = null;
      for (var dialogId in DIALOGS) {
        if (DIALOGS[dialogId]) {
          DIALOGS[dialogId].focus--;
          if (DIALOGS[dialogId].focus == 1) nextDialogId = dialogId;
        }
      }
      if (nextDialogId) focusOnDialog(DIALOGS[nextDialogId]);
      //focus on next dialog..
      else if (window.focusObject) window.focusObject = null; //..or this was the last dialog on the screen!

      //remove this dialog
      that.DOM.parentNode.removeChild(that.DOM); //remove dialog from this client's screen
      var chatPartner = that.id.substr(7); //cut 'dialog_'
      sendChatStatus(chatPartner, CHAT_STATUS_NOT_TYPING); //inform chatPartner that stopped typing
      if (that.chatStatus.timeOut) {
        clearTimeout(that.chatStatus.timeOut);
        that.chatStatus.timeOut = null;
      }

      //cleanups...
      if (that.maximized) {
        dojo.event.kwDisconnect({
          srcObj: window,
          srcFunc: "onresize",
          targetObj: that,
          targetFunc: "maximizeDialog",
          once: true
        });
        that.maximized = null;
      }
      if (window.resizeObject) window.resizeObject = null;
      that.focus = null;
      that.drag = null;
      that.sendHistory.arr = null;
      that.autoScroll = null;
      that.DOM = null;
      DIALOGS[that.id] = null;
      that.id = null;

      //check if any hiding currently occurs with remaining dialogs
      checkDialogHiding();
    }
  }

  /**
   * Deliver message from this client to chat partner.
   */
  function attemptSendMessage(e) {
    if (e.keyCode == ENTER_KEY && !e.shiftKey) {
      var msg = escape(that.ta.value);
      var replacedMsg = msg;
      if (msg.indexOf("%0D%0A") > -1) {
        //Windows encodes returns as \r\n hex
        var endOfLine = new RegExp("%0D%0A", "g");
        replacedMsg = replacedMsg.replace(endOfLine, "");
        var lastIndex = msg.lastIndexOf("%0D%0A");
        if (lastIndex + "%0D%0A".length == msg.length)
          msg = msg.substring(0, lastIndex);
        else
          msg =
            msg.substring(0, lastIndex) +
            msg.substring(lastIndex + "%0D%0A".length);
      } else if (msg.indexOf("%0A") > -1) {
        //Unix encodes returns as \n hex
        var endOfLine = new RegExp("%0A", "g");
        replacedMsg = replacedMsg.replace(endOfLine, "");
        var lastIndex = msg.lastIndexOf("%0A");
        if (lastIndex + "%0A".length == msg.length)
          msg = msg.substring(0, lastIndex);
        else
          msg =
            msg.substring(0, lastIndex) +
            msg.substring(lastIndex + "%0A".length);
      } else if (msg.indexOf("%0D") > -1) {
        //Macintosh encodes returns as \r hex
        var endOfLine = new RegExp("%0D", "g");
        replacedMsg = replacedMsg.replace(endOfLine, "");
        var lastIndex = msg.lastIndexOf("%0D");
        if (lastIndex + "%0D".length == msg.length)
          msg = msg.substring(0, lastIndex);
        else
          msg =
            msg.substring(0, lastIndex) +
            msg.substring(lastIndex + "%0D".length);
      }
      msg = unescape(msg);
      replacedMsg = unescape(replacedMsg);
      that.sendHistory.ptr = -1;
      that.ta.value = that.ta.defaultValue;
      that.ta.focus();
      var notWhiteSpace = new RegExp("\\S");
      if (replacedMsg.match(notWhiteSpace)) {
        sendMessage(chatPartner, msg);
        attemptSendChatStatus(e, CHAT_STATUS_NOT_TYPING);
      }
    }
  }

  /**
   * Send history feature.
   */
  function attemptShowSendHistory(e) {
    if (that.sendHistory.arr.length > 0) {
      //window.status += ' ' + that.sendHistory.ptr;
      if (e.keyCode == UP_KEY && e.altKey && !e.ctrlKey) {
        that.sendHistory.ptr--;
        if (that.sendHistory.ptr < 0)
          that.sendHistory.ptr = that.sendHistory.arr.length - 1;
        if (that.sendHistory.ptr >= 0)
          that.ta.value = that.sendHistory.arr[that.sendHistory.ptr];
      } else if (e.keyCode == DOWN_KEY && e.altKey && !e.ctrlKey) {
        that.sendHistory.ptr++;
        if (that.sendHistory.ptr == that.sendHistory.arr.length)
          that.sendHistory.ptr = 0;
        if (that.sendHistory.ptr >= 0)
          that.ta.value = that.sendHistory.arr[that.sendHistory.ptr];
      }
    }
  }

  /**
   * Chat status feature.
   */
  function attemptSendChatStatus(e, chatStatus) {
    //if this client is only doing meta keys (eg: dialog resizing, page up, etc),
    //then do not send chat status update to the clients
    if (
      (e.keyCode == ENTER_KEY && chatStatus != CHAT_STATUS_NOT_TYPING) ||
      e.keyCode == ESC_KEY ||
      e.keyCode == TAB_KEY ||
      e.keyCode == PAGEUP_KEY ||
      e.keyCode == PAGEDOWN_KEY ||
      e.keyCode == UP_KEY ||
      e.keyCode == DOWN_KEY ||
      e.keyCode == LEFT_KEY ||
      e.keyCode == RIGHT_KEY ||
      e.keyCode == CTRL_KEY ||
      e.ctrlKey
    ) {
      return;
    }

    //dojo.debug(e.keyCode);

    //if we are here, it means that chat status will be sent to all clients
    if (that.chatStatus.lastChatStatus != chatStatus) {
      sendChatStatus(chatPartner, chatStatus);
      that.chatStatus.lastChatStatus = chatStatus;
    }

    //create setTimeout to check if user is still typing after X seconds passed
    if (chatStatus == CHAT_STATUS_TYPING) {
      clearTimeout(that.chatStatus.timeOut);
      that.chatStatus.timeOut = setTimeout(
        'informChatPartnerAboutTypingStopped("' + that.id + '")',
        5000
      );
    }
  }
} // EOF: Dialog()

/*  ====================================================================================================
    ====================================================================================================

                                  ...  PUBLIC DIALOG METHODS  ...
    
	====================================================================================================
    ==================================================================================================== */

/**
 * Return the dialog id for the dialog with title "title".
 *
 * @param title - the chatPartner
 */
function getDialogId(title) {
  return "dialog_" + escape(title);
}

/**
 * Return the dialog with title "title".
 *
 * @param title - the chatPartner
 */
function getDialog(title) {
  var dialogId = getDialogId(title);
  return DIALOGS[dialogId];
}

/**
 * Change dialog opacity.
 */
function changeDialogOpacity(dialogId, opacity, isDown) {
  var dialog = DIALOGS[dialogId];

  // structural elements
  var topbarActive = getElementsByClassName(
    dialog.DOM,
    "div",
    "topbarActive|topbarInactive"
  )[0];
  var topmenuActive = getElementsByClassName(
    dialog.DOM,
    "div",
    "topmenuActive|topmenuInactive"
  )[0];
  var topmenuLeft = getElementsByClassName(
    topmenuActive,
    "span",
    "topmenuLeft"
  )[0];
  var topmenuImg = getElementsByClassName(
    topmenuActive,
    "span",
    "topmenuImg"
  )[0];
  var topmenuMid = getElementsByClassName(
    topmenuActive,
    "span",
    "topmenuMid"
  )[0];
  var topmenuRight = getElementsByClassName(
    topmenuActive,
    "span",
    "topmenuRight"
  )[0];
  var topmenuSpc = getElementsByClassName(
    topmenuActive,
    "span",
    "topmenuSpc"
  )[0];
  var iwinActive = getElementsByClassName(
    dialog.DOM,
    "div",
    "iwinActive|iwinInactive"
  )[0];
  var btmmenuActive = getElementsByClassName(
    dialog.DOM,
    "div",
    "btmmenuActive|btmmenuInactive"
  )[0];
  var btmbarActive = getElementsByClassName(
    dialog.DOM,
    "div",
    "btmbarActive|btmbarInactive"
  )[0];

  // update opacities
  topbarActive.style.opacity = opacity / 100;
  topbarActive.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuActive.style.opacity = opacity / 100;
  topmenuActive.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuLeft.style.opacity = opacity / 100;
  topmenuLeft.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuImg.style.opacity = opacity / 100;
  topmenuImg.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuMid.style.opacity = opacity / 100;
  topmenuMid.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuRight.style.opacity = opacity / 100;
  topmenuRight.style.filter = "alpha(opacity=" + opacity + ")";
  topmenuSpc.style.opacity = opacity / 100;
  topmenuSpc.style.filter = "alpha(opacity=" + opacity + ")";
  iwinActive.style.opacity = opacity / 100;
  iwinActive.style.filter = "alpha(opacity=" + opacity + ")";
  btmmenuActive.style.opacity = opacity / 100;
  btmmenuActive.style.filter = "alpha(opacity=" + opacity + ")";
  btmbarActive.style.opacity = opacity / 100;
  btmbarActive.style.filter = "alpha(opacity=" + opacity + ")";

  // recurse
  if (isDown) opacity -= dialog.nudge.step;
  else opacity += dialog.nudge.step;
  if (opacity <= 30) {
    opacity = 40;
    isDown = 0;
  } else if (opacity >= 90) {
    opacity = 80;
    isDown = 1;
  }
  if (dialog.nudge.enabled)
    dialog.nudge.timeOut = setTimeout(
      'changeDialogOpacity("' +
        dialogId +
        '", ' +
        opacity +
        ", " +
        isDown +
        ")",
      dialog.nudge.speed
    );
}

/**
 * Check if any of the dialogs are covering each other (hiding), and inform the user if this is the case.
 */
function checkDialogHiding() {
  window.status = "Done";
  var px = new RegExp("px");
  for (var i in DIALOGS) {
    if (DIALOGS[i]) {
      for (var j in DIALOGS) {
        if (
          DIALOGS[j] &&
          DIALOGS[i].id != DIALOGS[j].id &&
          DIALOGS[i].DOM.style.left.replace(px, "") ==
            DIALOGS[j].DOM.style.left.replace(px, "") &&
          DIALOGS[i].DOM.style.top.replace(px, "") ==
            DIALOGS[j].DOM.style.top.replace(px, "")
        ) {
          window.status = "Warning: dialogs on top of each other!";
          break;
        }
      }
      if (window.status != "Done") break;
    } else {
      break;
    }
    if (window.status != "Done") break;
  }
}

/**
 * Scroll down the screen, and enable the autoScroll feature.
 * Called from the resizeOnMouseMove() event.
 *
 * @param dialogId - the dialog id
 */
function scrollDownScreen(dialogId) {
  var screen = DIALOGS[dialogId].screen;
  screen.scrollTop = screen.scrollHeight;
  var newScrollerLength =
    screen.scrollTop > 0 ? screen.scrollHeight - screen.scrollTop : 0;
  DIALOGS[dialogId].autoScroll = {
    enabled: true,
    scrollerLength: newScrollerLength
  };
  if (screen.style.scrollbarArrowColor != "#999999") {
    screen.style.scrollbarArrowColor = "#999999";
    screen.style.scrollbarBaseColor = "#999999";
    screen.style.scrollbarDarkShadowColor = "#999999";
  }
}

/**
 * Inform the chat partner of the given dialog that this client 'has entered text' and now stopped typing.
 *
 * Called by the setTimeout() method after X seconds to inform the chat partner
 * that has this client has stopped typing.
 */
function informChatPartnerAboutTypingStopped(dialogId) {
  var dialog = DIALOGS[dialogId];
  var chatPartner = dialogId.substr(7); //cut 'dialog_'
  var chatStatus = CHAT_STATUS_TYPED;
  if (dialog.ta.value == "") chatStatus = CHAT_STATUS_NOT_TYPING;
  sendChatStatus(chatPartner, chatStatus);
  dialog.chatStatus.lastChatStatus = chatStatus;
  clearTimeout(dialog.chatStatus.timeOut);
  dialog.chatStatus.timeOut = null;
}

/**
 * Minimizes the dialog with the given id: paints the div on the bottom of
 * the screen, then hides the dialog.
 *
 * @param dialog - the dialog (or buddy list!) to minimize
 */
function minimizeDialog(dialog) {
  // real content
  var trayImg = document.createElement("IMG");
  trayImg.className = "trayImg";
  var textSpan = document.createElement("SPAN");
  textSpan.id = "trayText_" + dialog.id;
  textSpan.className = "trayText";
  var textValueLong = "";
  var textValueShort = "";

  if (dialog.DOM) {
    trayImg.src = dialog.buddyIcon.src;
    textValueLong = dialog.buddyIcon.title;
  } else {
    trayImg.src = document.getElementById("myBuddyIcon").src;
    textValueLong = "Buddy List";
  }
  if (textValueLong.length > 10)
    textValueShort = textValueLong.substr(0, 10) + "...";
  else textValueShort = textValueLong;
  textSpan.appendChild(document.createTextNode(textValueShort));

  // structural elements -- TOP PART
  var topLeft = document.createElement("SPAN");
  topLeft.className = "smallTopBarLeft";
  var topMid = document.createElement("DIV");
  topMid.className = "smallTopBarMid";
  topMid.style.width = "131px";
  var topRight = document.createElement("SPAN");
  topRight.className = "smallTopBarRight";
  var topPart = document.createElement("DIV");
  topPart.className = "btmbarActive";

  // assemble TOP PART
  topPart.appendChild(topLeft);
  topPart.appendChild(topMid);
  topPart.appendChild(topRight);

  // structural elements -- MIDDLE PART
  var midLeft = document.createElement("SPAN");
  midLeft.className = "iwinLeft";
  midLeft.style.height = "18px";
  var midMid = document.createElement("DIV");
  midMid.className = "topmenuMid";
  midMid.style.width = "126px";
  midMid.style.height = "18px";
  midMid.style.fontSize = "0px";
  midMid.style.opacity = "0.8";
  midMid.style.filter = "alpha(opacity=80)";
  midMid.appendChild(trayImg);
  midMid.appendChild(textSpan);
  var midRight = document.createElement("SPAN");
  midRight.className = "iwinRight";
  midRight.style.height = "18px";
  var midPart = document.createElement("DIV");
  midPart.className = "iwinActive";
  midPart.style.height = "0px";
  midPart.style.fontSize = "0px";
  // assemble MIDDLE PART
  midPart.appendChild(midLeft);
  midPart.appendChild(midMid);
  midPart.appendChild(midRight);

  // structural elements -- BOTTOM PART
  var btmbarLeft = document.createElement("SPAN");
  btmbarLeft.className = "btmbarLeft";
  var btmbarMid = document.createElement("DIV");
  btmbarMid.className = "btmbarMid";
  btmbarMid.style.width = "131px";
  var btmbarRight = document.createElement("SPAN");
  btmbarRight.className = "btmbarRight";
  //btmbarRight.style.styleFloat = 'left';
  var bottomPart = document.createElement("DIV");
  bottomPart.className = "btmbarActive";

  // assemble BOTTOM PART
  bottomPart.appendChild(btmbarLeft);
  bottomPart.appendChild(btmbarMid);
  bottomPart.appendChild(btmbarRight);

  // create container
  var container = document.createElement("LI");
  container.id = "tray_" + dialog.id;
  container.title = textValueLong;
  container.appendChild(topPart);
  container.appendChild(midPart);
  container.appendChild(bottomPart);
  container.onclick = function(e) {
    focusOnDialog(dialog);
  };

  // append container to body
  var tray = document.getElementById("tray");
  if (!tray) {
    tray = document.createElement("UL");
    tray.id = "tray";
    document.body.appendChild(tray);
  }
  tray.appendChild(container);

  //hide the regular dialog
  if (dialog.DOM) {
    dialog.DOM.style.visibility = "hidden";
    dialog.focus = 0;
    for (var dialogId in DIALOGS) {
      if (DIALOGS[dialogId] && DIALOGS[dialogId].focus > 0)
        DIALOGS[dialogId].focus--;
    }
  } else {
    dialog.style.visibility = "hidden";
  }

  // focus on the next dialog (ie, simulate TAB_KEY event)
  var focusDialog = getInFocusDialog();
  if (focusDialog) focusOnDialog(focusDialog);
}

/**
 * Positions the (newly created) dialog on the screen such that it
 * won't block any dialogs already painted!
 */
function positionDialog(container) {
  //local consts
  var marginLeft = Math.round(
    (document.body.offsetWidth - container.offsetWidth) / 6
  ); //the X coord of the middle of the header on the first spot
  var marginTop = Math.round(
    (document.body.offsetHeight - container.offsetHeight) / 4
  ); //the Y coord of the middle of the header on the first spot
  var retryMax = 4; //how many times to try to position dialogs downwards
  var offsetLeft = 60; //how many pixels to the left (X) to put the next dialog, if the spot is taken
  var offsetTop = 40; //how many pixels to the bottom (Y) to put the next dialog, if the spot is taken

  //holds the next possible coords for this dialog
  var pair = { left: 0, top: 0, ok: false };

  //iterate thru DIALOGS, find first empty spot
  var px = new RegExp("px");
  for (var i = 0; i < retryMax; i++) {
    for (var j = 0; j < retryMax; j++) {
      //figure out next pair
      pair.left = marginLeft + (i + j) * offsetLeft;
      pair.top = marginTop + j * offsetTop;
      pair.ok = true;

      //check if any dialog is already painted at pair
      for (var dialogId in DIALOGS) {
        if (DIALOGS[dialogId] && dialogId != container.id) {
          if (
            DIALOGS[dialogId].DOM.style.left.replace(px, "") == pair.left &&
            DIALOGS[dialogId].DOM.style.top.replace(px, "") == pair.top
          ) {
            //means that yes, another dialog already occupies pair!
            pair.ok = false;
            break;
          }
        }
      }

      //check if pair is ok
      if (pair.ok) break;
    }
    //check if pair is ok
    if (pair.ok) break;
  }
  container.style.top = pair.top + "px";
  container.style.left = pair.left + "px";
  if (!pair.ok) {
    window.status = "Warning: dialogs on top of each other!";
  }
}

/**
 * Focus on the dialog that's being passed in, and also
 * make the currently in focused dialog blur.  The dialog currently
 * in focus is stored in window.focusObject.
 *
 * @param theDialog - the one to focus on
 */
function focusOnDialog(theDialog) {
  /**
   * Style the dialog to either active or inactive (meaning in focus or not currently in focus).
   *
   * @param theDialog - the dialog to style
   * @param isInFocus - (bool) is the dialog to style in focus?
   */
  function styleDialog(dialog, isInFocus) {
    // structural elements
    var topbarActive = getElementsByClassName(
      dialog.DOM,
      "div",
      "topbarActive|topbarInactive"
    )[0];
    var topmenuActive = getElementsByClassName(
      dialog.DOM,
      "div",
      "topmenuActive|topmenuInactive"
    )[0];
    var buddyName = getElementsByClassName(dialog.DOM, "div", "buddyName")[0];
    var iwinActive = getElementsByClassName(
      dialog.DOM,
      "div",
      "iwinActive|iwinInactive"
    )[0];
    var btmmenuActive = getElementsByClassName(
      dialog.DOM,
      "div",
      "btmmenuActive|btmmenuInactive"
    )[0];
    var btmbarActive = getElementsByClassName(
      dialog.DOM,
      "div",
      "btmbarActive|btmbarInactive"
    )[0];

    if (isInFocus) {
      // focus on dialog
      if (topbarActive) {
        topbarActive.className = "topbarActive";
        topbarActive.style.opacity = 0.8;
        topbarActive.style.filter = "alpha(opacity=80)";
      }
      if (topmenuActive) {
        topmenuActive.className = "topmenuActive";
        topmenuActive.style.opacity = 1;
        topmenuActive.style.filter = "alpha(opacity=100)";
        var topmenuLeft = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuLeft"
        )[0];
        var topmenuImg = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuImg"
        )[0];
        var topmenuMid = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuMid"
        )[0];
        var topmenuRight = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuRight"
        )[0];
        var topmenuSpc = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuSpc"
        )[0];
        topmenuLeft.style.opacity = 0.8;
        topmenuLeft.style.filter = "alpha(opacity=80)";
        topmenuImg.style.opacity = 1;
        topmenuImg.style.filter = "alpha(opacity=100)";
        topmenuMid.style.opacity = 0.8;
        topmenuMid.style.filter = "alpha(opacity=80)";
        topmenuRight.style.opacity = 0.8;
        topmenuRight.style.filter = "alpha(opacity=80)";
        topmenuSpc.style.opacity = 0.8;
        topmenuSpc.style.filter = "alpha(opacity=80)";
      }
      if (buddyName) {
        buddyName.style.opacity = 0.8;
        buddyName.style.filter = "alpha(opacity=80)";
      }
      if (iwinActive) {
        iwinActive.className = "iwinActive";
        iwinActive.style.opacity = 1;
        iwinActive.style.filter = "alpha(opacity=100)";
      }
      if (btmmenuActive) {
        btmmenuActive.className = "btmmenuActive";
        btmmenuActive.style.opacity = 1;
        btmmenuActive.style.filter = "alpha(opacity=100)";
      }
      if (btmbarActive) {
        btmbarActive.className = "btmbarActive";
        btmbarActive.style.opacity = 0.8;
        btmbarActive.style.filter = "alpha(opacity=80)";
      }
      dialog.DOM.style.zIndex = 10; //increase z-index
      var pos = dojo.html.getAbsolutePosition(dialog.ta);
      pos.top += 70; //increment by textarea height
      //dojo.debug( pos.top + '|' + document.body.offsetHeight + '|' + (pos.top < document.body.offsetHeight) );
      if (pos.top < document.body.offsetHeight) dialog.ta.focus(); //focus on textarea
    } else {
      // blur dialog
      if (topbarActive) {
        topbarActive.className = "topbarInactive";
        topbarActive.style.opacity = 0.6;
        topbarActive.style.filter = "alpha(opacity=60)";
      }
      if (topmenuActive) {
        topmenuActive.className = "topmenuInactive";
        topmenuActive.style.opacity = 0.6;
        topmenuActive.style.filter = "alpha(opacity=60)";
        var topmenuLeft = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuLeft"
        )[0];
        var topmenuImg = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuImg"
        )[0];
        var topmenuMid = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuMid"
        )[0];
        var topmenuRight = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuRight"
        )[0];
        var topmenuSpc = getElementsByClassName(
          topmenuActive,
          "span",
          "topmenuSpc"
        )[0];
        topmenuLeft.style.opacity = 0.6;
        topmenuLeft.style.filter = "alpha(opacity=60)";
        topmenuImg.style.opacity = 0.6;
        topmenuImg.style.filter = "alpha(opacity=60)";
        topmenuMid.style.opacity = 0.6;
        topmenuMid.style.filter = "alpha(opacity=60)";
        topmenuRight.style.opacity = 0.6;
        topmenuRight.style.filter = "alpha(opacity=60)";
        topmenuSpc.style.opacity = 0.6;
        topmenuSpc.style.filter = "alpha(opacity=60)";
      }
      if (iwinActive) {
        iwinActive.className = "iwinInactive";
        iwinActive.style.opacity = 0.6;
        iwinActive.style.filter = "alpha(opacity=60)";
      }
      if (btmmenuActive) {
        btmmenuActive.className = "btmmenuInactive";
        btmmenuActive.style.opacity = 0.6;
        btmmenuActive.style.filter = "alpha(opacity=60)";
      }
      if (btmbarActive) {
        btmbarActive.className = "btmbarInactive";
        btmbarActive.style.opacity = 0.6;
        btmbarActive.style.filter = "alpha(opacity=60)";
      }
      dialog.DOM.style.zIndex = 5; //decrease z-index
    }
  }

  // remove any minimized dialogs/buddy lists (ie, make the minimized dialog maximized)
  var trayContainer = document.getElementById("tray_" + theDialog.id);
  if (trayContainer) {
    if (theDialog.DOM) theDialog.DOM.style.visibility = "visible";
    else theDialog.style.visibility = "visible";
    trayContainer.parentNode.removeChild(trayContainer);
  }

  if (window.focusObject != theDialog) {
    //need to focus on theDialog

    // focus on theDialog
    if (theDialog.DOM) {
      // switching to regular dialog --> set target dialog's focus index to 1, push back everybody else
      // clear nudge effects
      if (theDialog.nudge.enabled) {
        clearTimeout(theDialog.nudge.timeOut);
        theDialog.nudge.enabled = false;
      }
      var oldFocus = theDialog.focus; //holds focus id of the dialog we're swapping in
      for (var dialogId in DIALOGS) {
        //push back current focus indices in DIALOGS HashMap
        //dojo.debug( dialogId + ' focus: ' + DIALOGS[dialogId].focus );
        if (
          DIALOGS[dialogId] &&
          DIALOGS[dialogId].focus > 0 &&
          (oldFocus == null ||
            oldFocus == 0 ||
            DIALOGS[dialogId].focus < oldFocus)
        )
          DIALOGS[dialogId].focus++;
      }
      theDialog.focus = 1;
      styleDialog(theDialog, true);
    } else {
      // switching to buddy list --> no focus update needed
      theDialog.style.zIndex = 10; //increase z-index
    }

    // blur previous window.focusObject
    if (window.focusObject) {
      if (window.focusObject.DOM) {
        // blur previous dialog
        styleDialog(window.focusObject, false);
      } else {
        // blur previous buddy list
        window.focusObject.style.zIndex = 5;
      }
    }

    // finally store the dialog in focus inside global
    window.focusObject = theDialog; //update window.focusObject to theDialog
    //dojo.debug('focusObject: ' + window.focusObject.id);
  } else {
    //dialog already in focus --> just focus the textarea
    if (theDialog.nudge && theDialog.nudge.enabled) {
      clearTimeout(theDialog.nudge.timeOut);
      theDialog.nudge.enabled = false;
      styleDialog(theDialog, true);
    }
    if (theDialog.DOM) {
      var pos = dojo.html.getAbsolutePosition(theDialog.ta);
      pos.top += 70; //increment by textarea height
      //dojo.debug( pos.top + '|' + document.body.offsetHeight + '|' + (pos.top < document.body.offsetHeight) );
      if (pos.top < document.body.offsetHeight) theDialog.ta.focus();
    }
  } // EOF: if(window.focusObject != theDialog
}

/**
 * Returns the in focus dialog, or the Buddy List DOM (if no dialogs are displayed).
 */
function getInFocusDialog() {
  var focusDialog = null;
  for (var dialogId in DIALOGS) {
    if (DIALOGS[dialogId] && DIALOGS[dialogId].focus == 1) {
      focusDialog = DIALOGS[dialogId];
      break;
    }
  }
  if (focusDialog == null) {
    // if we are here --> no dialogs on the screen, so attempt to focus on the buddy list
    var buddyList = document.getElementById("buddyList");
    if (buddyList.style.visibility != "hidden") focusDialog = buddyList;
  }
  return focusDialog;
}

/**
 * This is needed for the dialog resizing.
 */
function resizeOnMouseMove(e) {
  if (window.resizeObject) {
    // init locals
    e = e || event;
    var dialog = window.resizeObject.dialog;
    var totalWidth = Math.max(
      DIALOG_MIN_WIDTH,
      window.resizeObject.originalWidth + e.clientX - window.resizeObject.grabX
    );
    var totalHeight = Math.max(
      DIALOG_MIN_HEIGHT,
      window.resizeObject.originalHeight + e.clientY - window.resizeObject.grabY
    );
    //dojo.debug('totalWidth: '+totalWidth+' | totalHeight: '+totalHeight);

    // structural elements
    var topbarMid = getElementsByClassName(dialog.DOM, "span", "topbarMid")[0];
    var topmenuMid = getElementsByClassName(
      dialog.DOM,
      "span",
      "topmenuMid"
    )[0];
    var topmenuSpc = getElementsByClassName(
      dialog.DOM,
      "span",
      "topmenuSpc"
    )[0];
    var buddyName = getElementsByClassName(dialog.DOM, "div", "buddyName")[0];
    var iwinActive = getElementsByClassName(dialog.DOM, "div", "iwinActive")[0];
    var iwinLeft = getElementsByClassName(dialog.DOM, "span", "iwinLeft")[0];
    var iwinRight = getElementsByClassName(dialog.DOM, "span", "iwinRight")[0];
    var btmmenuTop = getElementsByClassName(
      dialog.DOM,
      "span",
      "btmmenuTop"
    )[0];
    var btmmenuBottom = getElementsByClassName(
      dialog.DOM,
      "span",
      "btmmenuBottom"
    )[0];
    var btmbarMid = getElementsByClassName(dialog.DOM, "div", "btmbarMid")[0];

    // resize WIDTH
    dialog.DOM.style.width = totalWidth + "px";
    topbarMid.style.width = totalWidth - 114 + "px";
    topmenuMid.style.width = totalWidth - 69 + "px";
    topmenuSpc.style.width = totalWidth - 16 + "px";
    buddyName.style.width = totalWidth - 84 + "px";
    dialog.screen.style.width = totalWidth - 18 + "px";
    btmmenuTop.style.width = totalWidth - 16 + "px";
    btmmenuBottom.style.width = totalWidth - 16 + "px";
    if (IS_IE) dialog.ta.style.width = totalWidth - 20 + "px";
    else if (IS_CHROME || IS_SAFARI)
      dialog.ta.style.width = totalWidth - 22 + "px";
    else dialog.ta.style.width = totalWidth - 18 + "px";
    btmbarMid.style.width = totalWidth - 16 + "px";

    // resize HEIGHT
    iwinActive.style.height = totalHeight - 216 + "px";
    iwinLeft.style.height = totalHeight - 216 + "px";
    dialog.screen.style.height = totalHeight - 218 + "px";
    iwinRight.style.height = totalHeight - 216 + "px";

    // scroll down the scroller on the chatHistoryDiv
    scrollDownScreen(dialog.id);

    // stop event propagation
    try {
      document.execCommand("Unselect");
    } catch (e) {}
    dojo.event.browser.stopEvent(e);
  } // EOF: if(window.resizeObject)
} // EOF: resizeOnMouseMove()

/**
 * This is needed for the dialog resizing (disconnect from dialog resize events).
 */
function resizeOnMouseUp(e) {
  if (window.resizeObject) {
    dojo.event.kwDisconnect({
      srcObj: document,
      srcFunc: "onmousemove",
      targetFunc: "resizeOnMouseMove",
      once: true
    });
    dojo.event.kwDisconnect({
      srcObj: document,
      srcFunc: "onmouseup",
      targetFunc: "resizeOnMouseUp",
      once: true
    });
    window.resizeObject = null;
  }
}
