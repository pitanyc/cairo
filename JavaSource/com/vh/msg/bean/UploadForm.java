/**
 * @file UploadForm
 * @author peter.szocs
 * @version 1.0
 * 
 * Used when uploading a single file onto the server.
 */


package com.vh.msg.bean;

import org.apache.struts.action.ActionForm;
import org.apache.struts.upload.FormFile;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 * @author  peter.szocs
 * @version 1.0
 */
public class UploadForm extends ActionForm {

  private FormFile file;
  private String   targetFileName;
  private long     currentTime;

  /**
   * @return
   */
  public FormFile getFile() {
	return file;
  }

  /**
   * @return
   */
  public String getTargetFileName() {
	return targetFileName;
  }

  /**
   * @return
   */
  public long getCurrentTime() {
	return currentTime;
  }

  /**
   * @param file
   */
  public void setFile(FormFile newFile) {
	file = newFile;
  }

  /**
   * @param string
   */
  public void setTargetFileName(String string) {
	targetFileName = string;
  }

  /**
   * @param string
   */
  public void setCurrentTime(long now) {
	currentTime = now;
  }

}