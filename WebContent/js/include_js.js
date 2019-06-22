<%@ page contentType="text/javascript" %><%@ include file="/include_tld.jsp" %>
<c:import url="/js/js_constants.jsp" />
<c:import url="/js/rijndael.js" />
<c:import url="/js/styler.js" />
<c:import url="/js/ajax.js" />
<c:import url="/js/utils.js" />
<c:import url="/js/dialog.js" />
<c:import url="/js/paint.js" />
<c:import url="/js/events.js" />

//only keep this global var here, everything else goes into js_constants!
var SCRIPTS = [ { src: '/js/js_constants.jsp' },
				{ src: '/js/rijndael.js'      },
				{ src: '/js/styler.js'        },
				{ src: '/js/ajax.js'          },
				{ src: '/js/utils.js'         },
				{ src: '/js/dialog.js'        },
				{ src: '/js/paint.js'         },
				{ src: '/js/events.js'        }  ];