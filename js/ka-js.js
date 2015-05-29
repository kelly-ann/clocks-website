/* 
For a JavaScript live refresher demo go to: 
http://jsfiddle.net/specialk1st/j1ohv491/
*/

function onReady() {
	console.log("Hi there K-A!");

	var clock = new org.kelly_ann.AlarmClock("clock"); // UTC time
	var clock2 = new org.kelly_ann.TextClock("clock2",-4*60,"est");
	var clock2 = new org.kelly_ann.Clock("clock3",-6*60,'mst');

	//LiveDate.call(clock,1,2,3);
	//LiveDate.apply(clock,[1,2,3]);
}

/*
These static vars will belong to the Date obj.  If you are w/in
the Date obj you can refer to them using the "this." keyword,
but if you are outside the date obj you must us the fully 
qualified name of "Date."
*/

function LiveDate(a,b,c) {
	console.log(this,a,b,c);
}

Date.__interval = 0;
Date.__aDates = [];
Date.addToInterval = function(date) {
	this.__aDates.push(date);

	if (!Date.__interval) {
		Date.__interval = setInterval(function(){
			Date.updateDates();}, 1000);
	}
};

// this function will take either a date or another object.
// the "instanceof" keyword check if an var is a type of object.
Date.updateDates = function() {
	for (var i = 0; i < this.__aDates.length; i++) {

		if(this.__aDates[i] instanceof Date) {
			this.__aDates[i].updateSeconds();
		}
		else if(this.__aDates[i] instanceof Function) {
			this.__aDates[i]();
		}
		else if (this.__aDates[i] && this.__aDates[i]['update']) {
		// if the parameter = "update" then do the following
			this.__aDates[i].update();
		}
	}
}


// ".prototype" says get the orig Date obj and add a method to it
Date.prototype.updateSeconds = function() {
	this.setSeconds(this.getSeconds() + 1);
};

Date.prototype.autoClock = function(isAuto) {
	if (isAuto) {
		Date.addToInterval(this);
	}
}

/* 
If the "org" variable exists use it, if not create new obj 
for your NAMESPACE where the objects w/i it will be unique.
*/
var org = org || {};
org.kelly_ann = org.kelly_ann || {};

// this is a function 
org.kelly_ann.Clock = function (id, offset, label) {  
	offset = offset || 0; //if has value: offset=offset,else=0
	label = label || "";
	var d = new Date();
	var offset = (offset + d.getTimezoneOffset()) * 60 *1000;
	this.d = new Date(offset + d.getTime());
	this.d.autoClock(true);
	this.id = id;
	this.label = label;

	/* 
	Scope:
	To get JS to call updateClock like a method (instead of 
	as a func -- which won't work more than once b/c only the 
	method/obj has access to the "this" keyword scope) we 
	put the updateClock() method within an anonymous function
	call.  This is a very popular apprach/tool in JS.
	Once we have made the obj a constructor we it can no longer
	have access to the "this" keyword directly so we create the
	"that" var as a reference var.
	*/
	//this will call updateClock() every second. 1000ms = 1 second.
	//setInterval(c.updateClock, 1000); //called like a function
	
	this.tick(true);
	
	var that = this;
	Date.addToInterval(function(){that.updateClock();})
	
}

org.kelly_ann.Clock.prototype.tick = function(isTick) {
	this.isTicking = isTick;
}

org.kelly_ann.Clock.prototype.version = "1.00";

org.kelly_ann.Clock.prototype.updateClock = function() {
// this is a method
	if (this.isTicking) {
		var date = this.d;
		var clock = document.getElementById(this.id);

		clock.innerHTML = this.formatOutput(date.getHours(), 
			date.getMinutes(), date.getSeconds(), 
			date.getHours(), this.label);
	}
}

org.kelly_ann.Clock.prototype.formatOutput = 
	function(h,m,s,t,l){
	return this.formatDigits(h) + ":" + this.formatDigits(m) 
		+ ":" + this.formatDigits(s) + " " + this.timeOfDay(t)
		+ " " + l;
}

org.kelly_ann.Clock.prototype.formatDigits = function(val) {
	if (val < 10) {
		val = "0" + val;
	}
	return val;
};

org.kelly_ann.Clock.prototype.timeOfDay = function(hours) {
	if (hours >= 12) {
		hours = "pm"
	}
	else {
		hours = "am"
	}
	return hours;
};

// INHERITANCE
// Step 1: create new constructor
org.kelly_ann.TextClock = function(id,offset,label) {
	org.kelly_ann.Clock.apply(this, arguments);
	//console.log(this.version);
};

/* 
Step 2: create a child object that has no prototype and set 
it to the provided prototype of the parent object via the
Object.create() method (available in IE 9+).
*/
org.kelly_ann.TextClock.prototype = 
	createObject(org.kelly_ann.Clock.prototype, 
		org.kelly_ann.TextClock);

/*
Step 3: re-assign the constructor back to the newly created 
function.
*/
//org.kelly_ann.TextClock.prototype.constructor = 
//	org.kelly_ann.TextClock;

org.kelly_ann.TextClock.prototype.version = "1.01";

org.kelly_ann.TextClock.prototype.formatOutput = 
	function(h,m,s,t,l) {
	return this.formatDigits(h) + " Hours " 
		+ this.formatDigits(m) 
		+ " Mins " + this.formatDigits(s) + " Secs " 
		+ this.timeOfDay(t) + " " + l;
	}

org.kelly_ann.AlarmClock = function(id,offset,label) {
	org.kelly_ann.Clock.apply(this, arguments);

	console.log(this.version);

	this.doUpdate = true;
	this.dom = document.getElementById(id);
	this.dom.contentEditable = true;
	var that = this;
	this.dom.addEventListener('focus', function(e) {
		this.innerHTML = this.innerHTML.slice(0, this.innerHTML
			.lastIndexOf(":"));
		that.tick(false);
	});
	this.dom.addEventListener("blur", function(e) {
		var arrTimeParts = this.innerHTML.split(":");
		that.almH = parseInt(arrTimeParts[0]);
		that.almM = parseInt(arrTimeParts[1]);
		if((that.almH>=0 && that.almH<24) &&
			(that.almM>=0 && that.almM<60)) {
			var event = new Event("restart_tick");
			this.dispatchEvent(event);
		}

		console.log(that.almH, that.almM);

		that.tick(true);
	});

	this.dom.addEventListener("restart_tick", 
		function() {that.tick(true);})
}

org.kelly_ann.AlarmClock.prototype = createObject(
	org.kelly_ann.Clock.prototype, org.kelly_ann.AlarmClock);

org.kelly_ann.AlarmClock.prototype.formatOutput =function(h,m,s,t,l) 
	{
		var output;

		if (h == this.almH && m == this.almM) {
			output = "ALARM WAKE UP";
			var sound = new Audio('art/beep.mp3');
			sound.play();
		}
		else {
			output = org.kelly_ann.Clock.prototype.formatOutput
				.apply(this, arguments);
		}
		return output;
	}

/*
For older browsers we make our own function to replace the
"Object.create()" method.  "createObject()" is such a function.
*/
function createObject(theProto, theCons) {
	function c() {};
	c.prototype = theProto;
	c.prototype.constructor = theCons;
	return new c();
}

/* 
The parentheses are left off b/c you want to tell JS to call 
the onReady() function when it needs it, NOT BEFORE!  If you say
"onReady()" JS will call the function immediately and 
"window.onload" will = "undefined" since there are no body tag
elements yet.  
But if you leave off the parentheses and instead say "onReady" 
JS will call the function after the window has fully loaded.
 */
window.onload = onReady; 
