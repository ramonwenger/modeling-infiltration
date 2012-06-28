var L = 1130;
var K = 3.27 * Math.pow(10,6); //Konstante, für g/3*n (g = Gravitation, n = Viskosität)
var y0 = 200;
var xMax = 90000*3;
var xStep = xMax/800;
//var yStep = 0.025;
var yStep = 0.1;
var maxIntensity = 0.0000022;
var pulses = [];
var accuracy = 1000;
var	scale = {
	x : 1/xStep,
	y : 1/yStep,
};
currentPulses = [];

var canvasPulses = document.getElementById("canvas-pulses");
var canvasGraph = document.getElementById("canvas-graph");

canvasGraph.onmousemove = hoverGraph;
canvasGraph.onmouseout = mouseoutGraph;
document.getElementById("legende").onmousemove = hoverGraph; 
document.getElementById("cover-graph").onmousemove = hoverGraph;
document.getElementById("cover-graph").onmouseout = mouseoutGraph;

canvasPulses.onmousemove = hoverPulse;
canvasPulses.onmouseout = mouseoutPulse;

Array.prototype.top = function(){return this[this.length-1]};

function Pulse(start, end, intensity){
	this.start = start;
	this.end = end;
	this.intensity = intensity; // q
	var F, w, v, c;
	
	var pulse = this;
	this.schnittpunkt = new Point(0,0);
	this.jump = function(t) { return null; };
	
	
	this.feuchtefront = function(t) {
		return pulse.v*(t-pulse.start);
	}
	
	this.setVars = function(){
		pulse.F = Math.pow(pulse.intensity/(K*L),1/3);
		pulse.w = L*pulse.F;
		pulse.v = K*Math.pow(pulse.F,2);
		pulse.c = 3*pulse.v;	
	}
	
	this.drainagefrontStart = function(t){
		return pulse.c*(t-pulse.start);
	}
	
	this.drainagefront = function(t) {
		return pulse.c*(t-pulse.end);
	}
	
	function setSchnittpunkt(){
		pulse.schnittpunkt.x = intersection(pulse.feuchtefront, pulse.drainagefront, pulse.start, xMax);
		pulse.schnittpunkt.y = pulse.feuchtefront(pulse.schnittpunkt.x);
	}
	
	this.combined = function(t){
		//todo: nur für t>pulse.end?
		return pulse.c*Math.pow((pulse.end-pulse.start)/2,2/3)*Math.pow(t-pulse.end,1/3);
	}
	
	this.setEnd = function(newEnd){
		pulse.end = newEnd;
		setSchnittpunkt();
	}
	
	this.setJump = function(p){
		pulse.jump = function(t){
			cj = K*(Math.pow(p.F,2)+p.F*pulse.F+Math.pow(pulse.F,2));
			return cj*(t-pulse.end);
		}
	}
	
	this.setIntensity = function(i){
		pulse.intensity = i;
		pulse.setVars();
	}
	
	this.setVars();
	setSchnittpunkt();
}

function Point(x, y){
	this.x = x;
	this.y = y;
	
	this.copy = function(point){
		this.x = point.x;
		this.y = point.y;
	}
}

function intersection(f1, f2, min, max){
	if(Math.floor(f1(min)*accuracy) == Math.floor(f2(min)*accuracy)){
		return min;
	}else if(Math.floor(f1(max)*accuracy) == Math.floor(f2(max)*accuracy)){
		return max;
	}else if( (f1(min)>f2(min) && f1(max)>f2(max)) || (f1(min)<f2(min) && f1(max)<f2(max)) ){
		return false;
	}else{
		if(intersection(f1,f2,min+(max-min)/2,max)){
			return intersection(f1,f2,min+(max-min)/2,max);
		}else{
			return intersection(f1,f2,min,max-(max-min)/2);
		}
	}	
}

function drawFunction(f, start, end, color){
	//zeichnet Funktion f von Startpunkt start bis Endpunkt end
	if(!color) var color = "#0000ff";
	if (null==canvasGraph || !canvasGraph.getContext) return;
	var ctx = canvasGraph.getContext("2d");
	var xx, yy;
	var iMax = xMax;
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = color;

 
 for (var i=start;i<=end;i+=xStep) {
	xx = i*scale.x; yy = scale.y*f(i);
  if (i==start) ctx.moveTo(xx,yy);
  else         ctx.lineTo(xx,yy);
 }
 ctx.stroke();

}

function drawRec(startx, maxHeight, endx, height) {
	if (null==canvasPulses || !canvasPulses.getContext) return;

	var  ctx=canvasPulses.getContext("2d");
	ctx.fillStyle = "#0000ff";
	ctx.fillRect(startx, maxHeight-height, endx-startx, height);
	return false;
 }
 
 function drawPulse(pulse){
	if(pulse.intensity>0){
		drawRec(pulse.start/xStep, canvasPulses.height, pulse.end/xStep, pulse.intensity*canvasPulses.height/maxIntensity);
	}
}

function jump(p1, p2, t){
	c = K*(Math.pow(p1.F,2)+p1.F*p2.F+Math.pow(p2.F,2));
	return c*(t-p2.start);
}

function linear(start, slope, t){
	return start.y+slope*(t-start.x);
}

function hoverGraph(e){
	var div = document.getElementById("hover-graph");
	var that = canvasGraph;
	var x = e.pageX - that.parentElement.offsetLeft - 1;
	var y = e.pageY - that.offsetTop - 0.5;
	if (y>=0 && x >= 0){
		x = x*xStep;
		y = Math.round(y*yStep*1000)/1000;
		div.innerHTML = Math.floor(x/3600) + " h " 
			+ Math.floor(x/60%60) + " min " 
			//+ Math.floor(x%60) + " sec" 
			+ "<br/>"
			+ y + " m";
		div.style.display = "block";
		//div.style.left = (e.pageX + 25) + "px";
		//div.style.top = (e.pageY - 10) + "px";
		div.style.left = (that.offsetLeft + that.offsetWidth - 110) + "px";
		div.style.top = (that.offsetTop + 3) + "px";
		div.style.width = "95px";
		div.style.paddingTop = "20px";
		div.style.paddingBottom = "20px";					
	}else {
		div.style.display = "none";
	}
}

function mouseoutGraph(e) {
	var div = document.getElementById("hover-graph");
	div.style.display = "none";
}

function hoverPulse(e) {
	var div = document.getElementById("hover-pulse");
	var x = e.pageX - this.parentElement.offsetLeft - 1;
	var y = e.pageY - this.parentElement.offsetTop - 0.5;
	if(pulse = checkPulse(x,y)){
		div.innerHTML = "start: " + Math.floor(pulse.start/3600) + " h " + Math.floor(pulse.start/60 % 60) + " min" + 
						"<br/>end: " + Math.floor(pulse.end/3600) + " h " + Math.floor(pulse.end/60 % 60) + " min" + 
						"<br/>intensity: " + pulse.intensity + " m/s" +
						"<br/>F: " + Math.round(pulse.F*10000000)/10000000 + 
						"<br/>v: " +Math.round(pulse.v*10000000)/10000000 + 
						"<br/>c: " + Math.round(pulse.c*10000000)/10000000;
		div.style.display = "block";
		div.style.width = "150px";
		div.style.paddingTop = "5px";
		div.style.paddingBottom = "5px";
		div.style.left = (this.offsetLeft + this.offsetWidth - div.offsetWidth - 3) + "px";
		div.style.top = (this.offsetTop + this.offsetHeight - div.offsetHeight - 3) + "px";				
	} else {
		div.style.display = "none";
	}
}

function mouseoutPulse(e) {
	var div = document.getElementById("hover-pulse");
	div.style.display = "none";
}

function checkPulse(x,y){
	var pulse;
	for (i = 0; i< currentPulses.length;i++){
		pulse = currentPulses[i];
		//pulse.index = i;
			if((x>pulse.start/xStep && x<pulse.end/xStep) && (y<canvasPulses.height && y>canvasPulses.height-pulse.intensity*canvasPulses.height/maxIntensity) )
			 return pulse;
	}
	return 0;
}


function getMaxIntensity(pulses){
	max = 0;
	for(i=0;i<pulses.length;i++){
		if(pulses[i].intensity>max)
			max = pulses[i].intensity;
	}	
	return max;
}

function clearCanvas(){
	var  ctxPulses=canvasPulses.getContext("2d");
	var  ctxGraph=canvasGraph.getContext("2d");
	
	ctxPulses.clearRect(0,0,canvasPulses.width, canvasPulses.height);
	ctxGraph.clearRect(0,0,canvasGraph.width, canvasGraph.height);
}

function setVars(pulses){
	for(i=0;i<pulses.length;i++){
		pulses[i].setVars();
	}
	return pulses;
}