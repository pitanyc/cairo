/**
 * Create 'cairo' namespace, and put all global vars inside it!
 */
if (!window.cairo) {

  var cairo = {
    
    // members
    userName: '',						//authenticated username
    sentMsgCounter: 0,                  //counts the number of messages sent from this user in the 'Away' user status
    blinker: { timeOut: null,           //stores window.setTimeout() so that it can be stopped later
                titles: ['',''],		//stores the messages to be displayed
               counter: 0,				//counts how many blinks have been shown
             frequency: 1000,           //the blinking frequency, in ms (ie: 1000 --> blink every second)
              maxCount: -1,				//the maximum number of minutes to blink (ie: maxCount x 60 = maximum blinking time, in seconds)
                 focus: true },	        //stores whether this window is currently in focus
    customBuddyIcon: {    file: '',		//custom buddy icon
                       counter: 0 },
    customWallpaper: {    file: '',		//custom wallpaper
                       counter: 0 },
    fileUpload: [],                     //holds file upload JS objects: { chatPartner:'aaa', file:'file:///FULL_PATH/abc.txt' }
    command: {  isSet: false,			//helper for delayed JS command execution
                delay: 0,
               action: '',
              timeOut: null },
    autoAway: { isUserOnAutoAway: false,//helper for auto away feature
                     maxIdleTime: 15,   //the maximum idle time after which we go into auto away in minutes (ie: 1 --> auto away after 1 minute)
                         timeOut: null },

/*  ====================================================================================================
    ====================================================================================================

                                  ...  BLINKER EVENTS  ...
    
	====================================================================================================
    ==================================================================================================== */

    /**
     * Starts the blink title effect.
     *
     * Note: private method, called from index.jsp.
     */
    startBlinkTitle: function(pos, dialogId) {
        //top.frames[0].document.body.appendChild( document.createTextNode('startBlinkTitle(' + pos + ')'));
        if(pos==-1) {
            this.blinker.focus=false;
        } else {
            if((this.blinker.maxCount > 0) && ((1000 * this.blinker.counter / this.blinker.frequency) >= (this.blinker.maxCount * 60))) {
                this.stopBlinkTitle();
            } else {
                var msg = this.blinker.titles[pos];
                pos==0 ? pos = 1 : pos = 0;
                top.document.title = msg;

                var trayTextSpan = top.frames['contentFrame'].document.getElementById('trayText_' + dialogId);
                if(trayTextSpan) {
                    if(pos == 0 && msg.length > 10) msg = msg.substr(0, 10) + '...';
                    else if(pos == 1 && msg.length > 10) msg = msg.substr(0, 10);
                    trayTextSpan.innerHTML = msg;
                }
                
                this.blinker.timeOut = top.setTimeout('cairo.startBlinkTitle('+pos+', "'+dialogId+'")', this.blinker.frequency);
                this.blinker.counter++;
            }
        }
    },


    /**
     * Stops the blink title effect.
     *
     * Note: private method, called from index.jsp.
     */
    stopBlinkTitle: function() {
        //top.frames[0].document.body.appendChild( document.createTextNode('stopBlinkTitle()'));
        this.blinker.focus=true;
        if(this.blinker.timeOut) {
            top.document.title = 'Cairo';
            //var trayTextSpan = top.frames['contentFrame'].document.getElementById('trayText_' + dialogId);
            //if(trayTextSpan) trayTextSpan.innerHTML = dialogId.substr(7);
            top.clearTimeout(this.blinker.timeOut);
            this.blinker.timeOut = null;
            this.blinker.counter = 0;
        }
    },


    /**
     * Utility method to be called from outside of this file.
     * Checks the checkbox, and starts the blinking effect if needed.
     * Note: public method.
     */
    blinkTitle: function(who, msg, dialogId) {
        if(!this.blinker.timeOut && !this.blinker.focus) {
            this.blinker.titles[0] = who + ' says...';
			if(who.length > 10) this.blinker.titles[0] = who.substr(0, 10) + ' says...';
            this.blinker.titles[1] = msg;
            this.startBlinkTitle(0, dialogId);
        }
    },

/*  ====================================================================================================
    ====================================================================================================

                                  ...  DELAYED ACTION EVENTS  ...
    
	====================================================================================================
    ==================================================================================================== */

    /**
     * Sets a JS command for delayed execution.
     * Note: public method.
     */
    setDelayedAction: function(action, delay, isSet) {
        this.command.isSet = isSet;
        this.command.delay = delay;
        this.command.action = action;
    },


    /**
     * Sets a JS command for delayed execution.
     * Note: public method.
     */
    executeDelayedAction: function() {
        if( this.command.timeOut != null) top.clearTimeout(this.command.timeOut);
        this.command.timeOut = top.setTimeout(this.command.action, this.command.delay);
    },


    /**
     * Sets a JS command for delayed execution.
     * Note: public method.
     */
    isDelayedActionSet: function() {
        return this.command.isSet;
    }

  };
}