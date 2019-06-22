/**
 * @file MessageStyleBean
 * @author peter.szocs
 * @version 1.0
 * 
 * This POJO is used to store all necessary style information of an individual message.
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
public class MessageStyleBean {

    private String color;
    private String fontFamily;
    private String fontSize;
    private String fontWeight;
    private String fontStyle;
    private String textDecoration;


	public MessageStyleBean(String color,
		                    String fontFamily,
		                    String fontSize,
		                    String fontWeight,
		                    String fontStyle,
		                    String textDecoration) {
		this.color          = color;
		this.fontFamily     = fontFamily;
		this.fontSize       = fontSize;
		this.fontWeight     = fontWeight;
		this.fontStyle      = fontStyle;
		this.textDecoration = textDecoration;
	}

	public MessageStyleBean(Object color,
		                    Object fontFamily,
		                    Object fontSize,
		                    Object fontWeight,
		                    Object fontStyle,
		                    Object textDecoration) {
		this.color          = (String)color;
		this.fontFamily     = (String)fontFamily;
		this.fontSize       = (String)fontSize;
		this.fontWeight     = (String)fontWeight;
		this.fontStyle      = (String)fontStyle;
		this.textDecoration = (String)textDecoration;
	}


	/**
     * @return
     */
    public String getColor() {
    	return color;
    }

	/**
     * @return
     */
    public String getFontFamily() {
    	return fontFamily;
    }
    
    /**
     * @return
     */
    public String getFontSize() {
    	return fontSize;
    }

    /**
     * @return
     */
    public String getFontWeight() {
    	return fontWeight;
    }

    /**
     * @return
     */
    public String getFontStyle() {
    	return fontStyle;
    }

    /**
     * @return
     */
    public String getTextDecoration() {
    	return textDecoration;
    }


    /**
     * @param string
     */
    public void setColor(String string) {
    	color = string;
    }

    /**
     * @param string
     */
    public void setFontFamily(String string) {
    	fontFamily = string;
    }

    /**
     * @param string
     */
    public void setFontSize(String string) {
    	fontSize = string;
    }    

    /**
     * @param string
     */
    public void setFontWeight(String string) {
    	fontWeight = string;
    }    

    /**
     * @param string
     */
    public void setFontStyle(String string) {
    	fontStyle = string;
    }    

    /**
     * @param string
     */
    public void setTextDecoration(String string) {
    	textDecoration = string;
    }    

}