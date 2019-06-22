/**
 * @file NameFilter
 * @author peter.szocs
 * @version 1.0
 * 
 * Utility filter for deleting files that start with a given string.
 */


package com.vh.msg.util;

import java.io.File;
import java.io.FilenameFilter;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 */
public class NameFilter implements FilenameFilter {

	private String filter;

	public NameFilter(String string) {
		this.filter = string;
	}

	public boolean accept(File dir, String fileName) {
		return fileName.startsWith(filter);
	}

}