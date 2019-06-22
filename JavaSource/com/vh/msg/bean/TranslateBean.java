/**
 * @file TranslateBean
 * @author peter.szocs
 * @version 1.0
 * 
 * This POJO is used to store all translate related information of an individual message.
 */


package com.vh.msg.bean;

/**
 * The VH Corporation
 *
 * Copyright (c) 2010 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 * @author  peter.szocs
 * @version 1.0
 */
public class TranslateBean {

    private boolean enabled;
    private String from;
    private String to;


	public TranslateBean(boolean enabled,
		                 String from,
		                 String to) {
		this.enabled = enabled;
		this.from    = from;
		this.to      = to;
	}

	public TranslateBean(Object enabled,
		                 Object from,
		                 Object to) {
		this.enabled = ((Boolean)enabled).booleanValue();
		this.from    = (String)from;
		this.to      = (String)to;
	}


	/**
     * @return
     */
    public boolean getEnabled() {
    	return enabled;
    }

	/**
     * @return
     */
    public String getFrom() {
    	return from;
    }
    
    /**
     * @return
     */
    public String getTo() {
    	return to;
    }



    /**
     * @param string
     */
    public void setEnabled(boolean bool) {
    	enabled = bool;
    }

    /**
     * @param string
     */
    public void setFrom(String string) {
    	from = string;
    }

    /**
     * @param string
     */
    public void setTo(String string) {
    	to = string;
    }    

}