/**
 * @file MessageBean
 * @author peter.szocs
 * @version 1.0
 * 
 * Contains all necessary data for a chat message.  This POJO is used to store
 * all relevant information of an offline message.
 */


package com.vh.msg.bean;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 * @author  peter.szocs
 * @version 1.0
 */
public class MessageBean {

	// main message properties
    private int hour;
    private int minute;
    private String source;
    private String target;
    private String message;
    private String sourceBuddyIcon;		// the source buddy icon is stored for offline messages only
    private TranslateBean translate;	// translate properties
	private MessageStyleBean style;		// message style properties


	public MessageBean(int hour,
		               int minute,
		               String source,
		               String target,
		               String message,
		               String sourceBuddyIcon,
		               TranslateBean translate,
		               MessageStyleBean style) {
		this.hour            = hour;
		this.minute          = minute;
		this.source          = source;
		this.target          = target;
		this.message         = message;
		this.sourceBuddyIcon = sourceBuddyIcon;
		this.translate       = translate;
		this.style           = style;
	}

	public MessageBean(Object hour,
		               Object minute,
		               Object source,
		               Object target,
		               Object message,
		               Object sourceBuddyIcon,
		               TranslateBean translate,
		               MessageStyleBean style) {
		this.hour            = ((Long)hour).intValue();
		this.minute          = ((Long)minute).intValue();
		this.source          = (String)source;
		this.target          = (String)target;
		this.message         = (String)message;
		this.sourceBuddyIcon = (String)sourceBuddyIcon;
		this.translate       = translate;
		this.style           = style;
	}

    /**
     * @return
     */
    public int getHour() {
    	return hour;
    }

	/**
     * @return
     */
    public int getMinute() {
    	return minute;
    }

	/**
     * @return
     */
    public String getSource() {
    	return source;
    }

	/**
     * @return
     */
    public String getTarget() {
    	return target;
    }
    
    /**
     * @return
     */
    public String getMessage() {
    	return message;
    }

    /**
     * @return
     */
    public String getSourceBuddyIcon() {
    	return sourceBuddyIcon;
    }

    /**
     * @return
     */
    public TranslateBean getTranslate() {
    	return translate;
    }

    /**
     * @return
     */
    public MessageStyleBean getStyle() {
    	return style;
    }


    /**
     * @param int h
     */
    public void setHour(int h) {
    	hour = h;
    }

	/**
     * @param int m
     */
    public void setMinute(int m) {
    	minute = m;
    }

    /**
     * @param string
     */
    public void setSource(String string) {
    	source = string;
    }

    /**
     * @param string
     */
    public void setTarget(String string) {
    	target = string;
    }

    /**
     * @param string
     */
    public void setMessage(String string) {
    	message = string;
    }    

    /**
     * @param string
     */
    public void setSourceBuddyIcon(String string) {
    	sourceBuddyIcon = string;
    }    

    /**
     * @param boolean
     */
    public void setTranslate(TranslateBean bean) {
    	translate = bean;
    }    

    /**
     * @param MessageStyleBean
     */
    public void setStyle(MessageStyleBean bean) {
    	style = bean;
    }    

}