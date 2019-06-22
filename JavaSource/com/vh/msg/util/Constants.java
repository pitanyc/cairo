/**
 * @file Constants
 * @author peter.szocs
 * 
 * Constants that are used in general throughout the application.
 */


package com.vh.msg.util;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 * @author  peter.szocs
 * @version 1.0
 */
public interface Constants {

  //user status keys
  public static final int USERSTATUS_ONLINE  = 1;		//user is online and available
  public static final int USERSTATUS_OFFLINE = 2;		//user is logged off
  public static final int USERSTATUS_AWAY    = 3;		//user is away from machine and not available

  //event types
  public static final int EVENTTYPE_GET_USERS              = 1;	//get all users with their statuses right after login, to populate buddy list
  public static final int EVENTTYPE_GET_OFFLINE_MESSAGES   = 2;	//get all offline messages sent to me while i was offline
  public static final int EVENTTYPE_CLEAR_OFFLINE_MESSAGES = 3;	//clear all offline messages: this event is omitted right after painting all offline messages on dialogs after login
  public static final int EVENTTYPE_INCOMING_MESSAGE       = 4;	//regular incoming message event
  public static final int EVENTTYPE_USER_CHANGE_STATUS     = 5;	//a chat buddy or self is changing status
  public static final int EVENTTYPE_USER_CHANGE_BUDDY_ICON = 6;	//a chat buddy or self is changing buddy icon
  public static final int EVENTTYPE_USER_TYPING            = 7;	//a chat buddy has changed typing to me
  public static final int EVENTTYPE_SYSTEM_MESSAGE         = 8;	//a system problem has occurred (eg: session became invalid due to 2x login with same username)
  public static final int EVENTTYPE_SPECIAL_EFFECT         = 9;	//a special effect (eg: nudge the chat partner's dialog)

  //file upload
  public static final int FILEUPLOAD_BUFFER = 8192;		//size in bytes of each uploaded chunk

}