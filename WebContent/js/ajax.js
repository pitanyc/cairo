/**
 * AJAX methods reside here.
 * 
 * @author peter.szocs
 * @since Jan 2006
 */


/**
 * Shows the AJAX wait indicator.
 */
function showWaitIndicator() {
  document.getElementById('waitIndicator').style.visibility = 'visible';
}


/**
 * Hides the AJAX wait indicator.
 */
function hideWaitIndicator() {
  document.getElementById('waitIndicator').style.visibility = 'hidden';
}


/**
 * Prepends the context path at the beginning of the url and returns the prepended string.
 */
function rewriteURL(url) {
  return CONTEXT_PREFIX + url.substr(1,url.length-1);
}


/**
 * Gets the request URL as string.  Returns the responseText of the response (String).
 */
function ajaxRequest(callback, url, container) {
  showWaitIndicator();
  url = rewriteURL(url);
  var req;
  try {								//Firefox, Opera 8.0+, Safari
    req = new XMLHttpRequest();
  } catch(e) {						//IE
    try {
      req = new ActiveXObject('Msxml2.XMLHTTP');
    } catch(e) {
      try {
        req = new ActiveXObject('Microsoft.XMLHTTP');
      } catch(e) {					//something went wrong
        alert('Your browser does not support AJAX!');
        return false;
      }
    }
  }
  req.onreadystatechange = function() {
	if(req.readyState == 4) {
	  hideWaitIndicator();
	  if(req.status == 200) callback.apply(callback, [req, container]);
	  else alert('There was a problem with your AJAX request...\n' + req.statusText);
	}
  };
  req.open('GET', url, true);
  req.send(null);
}


/**
 * Loads the requested urls and puts them into the given containers.
 * Note: this is an ADAPTED version of the original function, specifically
 *       that the container is only loaded with content if the container 
 *       DOES NOT YET EXIST!!
 *
 * Note: Table does NOT allow to set the innerHTML.  Therefore, we cannot get a table
 *       using ajax and set the innerHTML property.  See this link:
 *       http://support.microsoft.com/kb/239832
 *       8/14/07
 *
 * Usage 1:  loadURLIntoContainer('/common/action.do','div');
 * Usage 2:  loadURLIntoContainer(['/common/action1.do','/common/action2.do'] ,['div1','div2']);
 */
function loadURLIntoContainer(urls, containers, isIframes) {
  function cb(req, container, isIframe) {
    var text = req.responseText;
	importCSSFromResponseText(text);
	importJSFromResponseText(text);
	var newEl = document.createElement('DIV');					//the new element to insert into document.body
	var closingRegExp = new RegExp('>','i');
	if(container) {
      newEl.id = container;
      newEl.innerHTML = text;
	} else {
	  var divRegExp = new RegExp('<div','i');
      if(text.search(r1) > -1) {							    //are we inserting a new div? ...
        newEl.id = extractText(text, divRegExp, closingRegExp, 0, 1);
        var r1 = new RegExp('id=','i');
        var r2 = new RegExp('">|"\\s','i');
	    newEl.id = extractText(newEl.id, r1, r2, 4, 0);
        text = text.substr(text.search(divRegExp));
        text = text.substr(text.search(closingRegExp) + 1);
	    newEl.innerHTML = text.substr(0, text.lastIndexOf('</div>'));
	  } else {													//... else give warning
        alert('ajaxRequest failed...\ncannot find DIV element in responseText!');
	  }
	}
	//alert('newEl.outerHTML:\n\n' + newEl.outerHTML);
	document.body.appendChild(newEl);
    var bodyRegExp = new RegExp('<body','i');
	var temp = extractText(req.responseText, bodyRegExp, closingRegExp, 0, 1);
    var onloadRegExp = new RegExp('onload="','i');
    var caretRegExp = new RegExp('"','i');
	eval(extractText(temp, onloadRegExp, caretRegExp, 8, 0));
  }

  if(urls.constructor != Array) {
    urls = [urls];
	containers = [containers];
  }
  for(var i=0; i<urls.length; i++) {
    try {
	  if(!document.getElementById(containers[i])) {
        if(isIframes && isIframes[i]) {
          //into IFRAME
          var newEl = document.createElement('IFRAME');					//the new element to insert into document.body
            newEl.name = container;
            newEl.id = container;
            newEl.src = urls[i];
          document.body.appendChild(newEl);
        } else {
          //into DIV
          ajaxRequest(cb, urls[i], containers[i]);
        }
      }
    } catch(e) {
	  alert('An exception occurred while loading page <' + urls[i] + '> ' +
		    'into container <' + containers[i] + '>...\n' + e.message);
	}
  }
}


/**
 * Checks whether the given CSS is already loaded.
 *
 * @param url    :  The url to the CSS.
 * @param return :  Boolean indicating whether sheet is already loaded.
 */
function isCSSLoaded(url) {
  url = rewriteURL(url);
  var sheets = document.styleSheets;
  for(var i = 0; i < sheets.length; i++) {
    if(sheets[i].href == url) return true;
  }
  return false;
}


/**
 * Checks whether the given JS is already loaded.
 *
 * @param url    :  The url to the JS.
 * @param return :  Boolean indicating whether javascript is already loaded.
 */
function isJSLoaded(url) {
  if(SCRIPTS) {
    for(var i = 0; i < SCRIPTS.length; i++) {
      if(SCRIPTS[i].src == url) return true;
    }
  }
  return false;
}


/**
 * Imports the given CSS to the page, if CSS not already loaded.
 *
 * @param url    :  The url to the CSS.
 * @param return :  Boolean indicating whether CSS got newly imported.
 */
function importCSS(url) {
  if(isCSSLoaded(url)) return false;
  var head = document.getElementsByTagName('HEAD')[0];
  var link = document.createElement('LINK');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href= rewriteURL(url);
  head.appendChild(link);
  return true;
}


/**
 * Imports the given JS to the page, if JS not already loaded.
 *
 * @param url          : The url to the javascript.
 * @param isRewriteURL : Append CONTEXT_PREFIX to the JS url?
 * @param return       : Boolean indicating whether JS got newly imported.
 */
function importJS(url, isRewriteURL) {
  if(isJSLoaded(url)) return false;
  var head = document.getElementsByTagName('HEAD')[0];
  var script = document.createElement('SCRIPT');
  script.type = 'text/javascript';
  isRewriteURL ? script.src = rewriteURL(url) : script.src = url;
  head.appendChild(script);
  if(SCRIPTS) SCRIPTS[SCRIPTS.length] = { src: url };
  return true;
}


/**
 * Imports all CSS files that are in the given responseText.
 *
 * @param text   :  The responseText to parse.
 */
function importCSSFromResponseText(text) {
  var headRegExp     = new RegExp('<\/head>','i');
  var linkRegExp     = new RegExp('<link','i');
  var closeTagRegExp = new RegExp('\/>','i');
  var hrefRegExp     = new RegExp('href','i');
  var caretRegExp    = new RegExp('"','i');
  var anyWordRegExp  = new RegExp('\\w$');

  var headEndIndex = text.search(headRegExp);
  var startIndex = text.search(linkRegExp);
  while((startIndex > 0) && (startIndex < headEndIndex)) {
	var link = extractText(text, linkRegExp, closeTagRegExp, 0, 2);
	var href = extractText(link, hrefRegExp, caretRegExp, 6, 0);
	href = extractText(href, CONTEXT_PREFIX, anyWordRegExp, CONTEXT_PREFIX.length - 1, 1);
	importCSS(href);
	text = text.substr(text.search(linkRegExp));
	text = text.substr(text.search(closeTagRegExp) + 2);
    startIndex = text.search(linkRegExp);
  }
}


/**
 * Imports all JS files that are in the given responseText.
 *
 * @param text   :  The responseText to parse.
 */
function importJSFromResponseText(text) {
  var headRegExp        = new RegExp('<\/head>','i');
  var scriptOpenRegExp  = new RegExp('<script','i');
  var scriptCloseRegExp = new RegExp('<\/script>','i');
  var srcRegExp         = new RegExp('src','i');
  var caretRegExp       = new RegExp('"','i');
  var anyWordRegExp     = new RegExp('\\w$');

  var headEndIndex = text.search(headRegExp);
  var startIndex = text.search(scriptOpenRegExp);
  while((startIndex > 0) && (startIndex < headEndIndex)) {
	var script = extractText(text, scriptOpenRegExp, scriptCloseRegExp, 0, 9);
	var src = extractText(script, srcRegExp, caretRegExp, 5, 0);
	src = extractText(src, CONTEXT_PREFIX, anyWordRegExp, CONTEXT_PREFIX.length - 1, 1);
	importJS(src, true);
	text = text.substr(text.search(scriptOpenRegExp));
	text = text.substr(text.search(scriptCloseRegExp) + 9);
    startIndex = text.search(scriptOpenRegExp);
  }
}


/**
 * Helper method that extracts text from the given text between
 * the specified regular expressions.
 *
 * @param text   :  The text to parse.
 */
function extractText(text, regExp1, regExp2, startOffset, endOffset) {
  var start = text.search(regExp1);
  text = text.substr(start + startOffset);
  var end = text.search(regExp2);
  return text.substr(0, end + endOffset);
}

