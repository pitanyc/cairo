/**
 * @file UploadFile
 * @author peter.szocs
 * @version 1.0
 * 
 * Upload any single file to the server.
 */


package com.vh.msg.action;

import java.io.File;
import java.io.InputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.upload.FormFile;

import com.vh.msg.bean.UploadForm;
import com.vh.msg.util.Constants;
import com.vh.msg.util.NameFilter;

/**
 * The VH Corporation
 *
 * Copyright (c) 2007 The VH Corporation.  All rights reserved.  
 * Copying or reproduction without prior written approval is prohibited.
 * 
 */
public class UploadFile extends Action {

  private static Logger log = Logger.getLogger(UploadFile.class);
  protected final boolean IS_DEBUG = log.isDebugEnabled();

  public ActionForward execute(ActionMapping mapping, ActionForm form, HttpServletRequest request, HttpServletResponse response) throws Exception {
    //if(IS_DEBUG) log.debug("inside");

	//NOTE: file names must not start or end with "/", but directories must end with "/" and they
    //      do start with (where possible) a "/" character!

    //locals
	UploadForm uploadForm = (UploadForm)form;
    FormFile theFile = uploadForm.getFile();

    //extract the targetFileName, and remove any leading "/" if present
	String targetFileName = uploadForm.getTargetFileName();
	if(targetFileName.startsWith("/")) targetFileName = targetFileName.substring(1);
	log.debug("\nTarget fileName: " + targetFileName);

	//extract the current time, if present
	long currentTime = uploadForm.getCurrentTime();
	log.debug("\nCurrent time: " + currentTime);

	//the context prefix, which always ends with a "/"
	String contextPrefix = request.getSession().getServletContext().getRealPath("/");
    
	try {
	  //do extra work if this file upload is for custom buddy icon or custom wallpaper image
	  if(currentTime == 0) {
	    //extract targetDir, userName from targetFileName
	    int lastSlash = targetFileName.lastIndexOf("/");
	    int lastUnder = targetFileName.lastIndexOf("_");
	    String targetDir = contextPrefix + targetFileName.substring(0, lastSlash + 1);  //make sure targetDir has "/" at the end!
	    String userName = targetFileName.substring(lastSlash + 1, lastUnder);

	    //delete all files in targetDir directory that start with userName
        NameFilter filter = new NameFilter(userName);
	    File dir = new File(targetDir);
	    if(dir.exists()) {
	      String[] list = dir.list(filter);
	      for(int i = 0; i < list.length; i++) {
            File file = new File(targetDir + list[i]);
            boolean isDeleted = file.delete();
            //log.debug(file + " deleted: " + isDeleted);
          }
	    } else {
		  //directory doesn't exist yet --> create it now!
		  boolean success = dir.mkdir();
		  if(!success) throw new RuntimeException("Could not create directory: <" + targetDir + ">");
	    }
	  } else {
		request.setAttribute("ct", currentTime);
	  }

	  //construct new file's filepath
      String newFile = contextPrefix + targetFileName;
	  //System.out.println("Uploading <" + newFile + ">");
			
      //write out file
      InputStream stream = theFile.getInputStream();
      OutputStream bos = new FileOutputStream(newFile);
      int bytesRead = 0;
      byte[] buffer = new byte[Constants.FILEUPLOAD_BUFFER];
      while((bytesRead = stream.read(buffer, 0, Constants.FILEUPLOAD_BUFFER)) != -1) {
        bos.write(buffer, 0, bytesRead);
      }
      bos.close();
      stream.close();
      log.debug("Successfully uploaded: " + newFile);
    } catch(Exception ex) {
      log.error("Error while uploading: "+ex.getMessage());
      throw ex;
    }

    //done
    return mapping.findForward("success");
  }
}