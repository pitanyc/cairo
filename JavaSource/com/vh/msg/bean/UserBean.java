/**
 * @file UserBean
 * @author peter.szocs
 * @version 1.0
 * 
 * Contains all necessary data for a logged in user.
 */


package com.vh.msg.bean;

import java.util.ArrayList;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 * @author  peter.szocs
 * @version 1.0
 */
public class UserBean {

	private String clientId;
    private String userName;
    private int status;
    private String customAwayMsg;
    private String buddyIcon;
    private ArrayList messages;
	

	public UserBean(String clientId,
		            String userName,
		            int status,
		            String customAwayMsg,
		            String buddyIcon) {
		this.clientId      = clientId;
		this.userName	   = userName;
		this.status		   = status;
		this.customAwayMsg = customAwayMsg;
		this.buddyIcon     = buddyIcon;
		this.messages      = new ArrayList();
	}

    /**
     * @return
     */
    public String getClientId() {
    	return clientId;
    }

    /**
     * @return
     */
    public String getUserName() {
    	return userName;
    }
    
    /**
     * @return
     */
    public int getStatus() {
    	return status;
    }

	/**
     * @return
     */
    public String getCustomAwayMsg() {
    	return customAwayMsg;
    }

	/**
     * @return
     */
    public String getBuddyIcon() {
    	return buddyIcon;
    }


    /**
     * @param string
     */
    public void setClientId(String string) {
    	clientId = string;
    }

    /**
     * @param string
     */
    public void setUserName(String string) {
    	userName = string;
    }

    /**
     * @param int
     */
    public void setStatus(int newStatus) {
    	status = newStatus;
    }

    /**
     * @param string
     */
    public void setCustomAwayMsg(String string) {
    	customAwayMsg = string;
    }

    /**
     * @param string
     */
    public void setBuddyIcon(String string) {
    	buddyIcon = string;
    }

    /**
	 * Add a message to the messages arraylist of this user.
	 */
    public void addMessage(MessageBean mb) {
        synchronized (this) {
            messages.add(mb);
        }
    }

    /**
	 * Get all messages of this user.
	 */
    public ArrayList getMessages() {
        synchronized (this) {
            if(messages==null || messages.size()==0) return null;
			return messages;
        }
    }

    /**
	 * Returns whether this user has any messages pending to be delivered.
	 */
    public void clearMessages() {
        synchronized (this) {
            if(messages!=null) messages.clear();
        }
    }

    /**
	 * Returns whether this user has any messages pending to be delivered.
	 */
    public boolean hasMessages() {
        synchronized (this) {
            return (messages!=null) && (messages.size()>0);
        }
    }

}