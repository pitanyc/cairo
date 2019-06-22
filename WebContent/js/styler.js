if (!window.styler) { var styler = {}; };
styler.fileInput =
{
    wrapClass: 'customUpload',
	
	fini: false,
	able: false,
	init: function()
	{
		this.fini = true;
		
		var ie = 0;
		if (window.opera || (ie && ie < 5.5) || !document.getElementsByTagName) { return; }
		this.able = true;
	},
	
	stylize: function(elem)
	{
        if (!this.fini) { this.init(); };
		if (!this.able) { return; };

		elem.parentNode.file = elem;
        elem.parentNode.onmousemove = function(e)
		{
			if (typeof e == 'undefined') e = window.event;
			if (typeof e.pageY == 'undefined' &&  typeof e.clientX == 'number' && document.documentElement)
			{
				e.pageX = e.clientX + document.documentElement.scrollLeft;
				e.pageY = e.clientY + document.documentElement.scrollTop;
			};

			var ox = oy = 0;
			var elem = this;
			if (elem.offsetParent)
			{
				ox = elem.offsetLeft;
				oy = elem.offsetTop;
				while (elem = elem.offsetParent)
				{
					ox += elem.offsetLeft;
					oy += elem.offsetTop;
				};
			};

			var x = e.pageX - ox;
			var y = e.pageY - oy;
			var w = this.file.offsetWidth;
			var h = this.file.offsetHeight;

			this.file.style.top		= y - (h / 2)  + 'px';
			this.file.style.left	= x - (w - 30) + 'px';
		};
	},
	
	stylizeById: function(id)
	{
		this.stylize(document.getElementById(id));
	},
	
	stylizeAll: function(elem)
	{
		if (!elem) { elem = document; };
		if (!this.fini) { this.init(); };
		if (!this.able) { return; };
		
		var inputs = elem.getElementsByTagName('input');
		for (var i = 0; i < inputs.length; i++)
		{
			var input = inputs[i];
			if (input.type == 'file' && input.parentNode.className.indexOf(this.wrapClass) != -1)
			{
				this.stylize(input);
			};
		};
	}
};

Sound = {
  _id: 'soundEffectPlayer',
  _timeOut: null,
  stop: function() {
    var container = document.getElementById(Sound._id);
    if(container) container.parentNode.removeChild(container);
  },
  play: function(url) {
    var container;
    if(IS_IE) {
      //for IE, render a BGSOUND element: <bgsound id="".../>
      container = document.createElement('BGSOUND');
      container.id = Sound._id;
      container.src = 'http://sound.zlocker.com/' + url;
      container.loop = '1';
      container.autostart = 'true';
    } else {
      //for non-IE, render an OBJECT element: <object id="".../>
      container = document.createElement('OBJECT');
      container.id = Sound._id;
      container.type = 'audio/mpeg';
      container.data = 'http://sound.zlocker.com/' + url;
	  if (!IS_FF) {
        container.height = '0';
        container.width = '0';
	  }
    }
    Sound.stop();
	document.body.appendChild(container);
    if(Sound._timeOut) clearTimeout(Sound._timeOut);
    Sound._timeOut = setTimeout('Sound.stop()', 10000);
  }
};