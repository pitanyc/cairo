/* cookie methods */

function setCookie(name, value, days, path, domain, secure) {
  var expires = -1;
  if (typeof days == "number" && days >= 0) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = d.toGMTString();
  }
  value = escape(value);
  document.cookie =
    name +
    "=" +
    value +
    ";" +
    (expires != -1 ? " expires=" + expires + ";" : "") +
    (path ? "path=" + path : "") +
    (domain ? "; domain=" + domain : "") +
    (secure ? "; secure" : "");
}

function getCookie(name, propertyId) {
  var idx = document.cookie.lastIndexOf(name + "=");
  if (idx == -1) {
    return null;
  }
  var value = document.cookie.substring(idx + name.length + 1);
  var end = value.indexOf(";");
  if (end == -1) {
    end = value.length;
  }
  value = value.substring(0, end);
  value = unescape(value);
  if (value) {
    var cookieArray = value.split(",");
    value = cookieArray[propertyId];
  }
  return value;
}

/* form methods */

function f(i) {
  if (i == 1) document.getElementById("userName").focus();
  else document.getElementById("password").focus();
}

function v() {
  var userName = document.getElementById("userName").value;
  var password = document.getElementById("password").value;
  if (userName.replace) {
    var re = new RegExp("^\\s+|\\s+$", "g");
    userName = userName.replace(re, "");
  }
  var text = null;
  var i = 0;
  if (userName == null || userName == "") {
    text = document.createTextNode("Username is null or empty!");
    i = 1;
  } else if (password == null || password == "") {
    text = document.createTextNode("Password is null or empty!");
    i = 2;
  } else if (
    b64_sha1(password.toLowerCase()) != "AJl8TUmpoz8WqJ4XvjrUr/PWZRY"
  ) {
    text = document.createTextNode("Invalid password!");
    i = 2;
  }
  if (text != null) {
    var lineDiv = document.getElementById("lineDiv");
    var err = document.getElementById("err");
    if (err.firstChild == null) {
      err.appendChild(text);
      lineDiv.style.height = "167px";
    } else {
      err.replaceChild(text, err.firstChild);
    }
    f(i);
    return false;
  } else {
    top.cairo.userName = userName;
    return true;
  }
}

function s(e, f) {
  if (f) {
    e.style.borderColor = "#333333";
    e.style.borderWidth = "2px";
    e.style.margin = "0";
    e.style.backgroundColor = "orange";
  } else {
    e.style.borderColor = "#6A6A69";
    e.style.borderWidth = "1px";
    e.style.margin = "1px";
    e.style.backgroundColor = "#FFFFFF";
  }
}

/* page methods */

function o() {
  if (top.cairo.isDelayedActionSet()) {
    document.getElementById("userName").disabled = "disabled";
    top.cairo.executeDelayedAction();
    top.cairo.setDelayedAction("", 0, false);
  } else {
    var wp = getCookie("com.vh.msg.globals", 7);
    if (wp) {
      document.body.style.backgroundColor = "";
      document.body.style.background = "url('" + wp + "')";
    }
    if (document.all) document.getElementById("logo").style.marginTop = "60%";
    f(1);
  }
}

/* etc */

// document.oncontextmenu = function(e) { return false; };
