/*************************************************************************************
*	Modeling Infiltration
*	a Bachelor Thesis
*	Calls
*
*	author: Ramon Wenger
*	University of Bern, 2012
*	http://scg.unibe.ch
*
*	This file contains the creation of the pulses and the call of the 
*	main() function
*************************************************************************************/

/*************************************************************************************
*
*	PULSE DEFINITIONS
*
*************************************************************************************/
var pulses12 = []; 
pulses12.push(new Pulse(0,2800,0));
pulses12.push(new Pulse(2800,9200,0.00000017));
pulses12.push(new Pulse(9200,12800,0.000001));
pulses12.push(new Pulse(12800,19400,0.0000008));
pulses12.push(new Pulse(19400,29800,0.0000014));
pulses12.push(new Pulse(29800,39600,0.0000008));
pulses12.push(new Pulse(39600,45400,0.0000014));
pulses12.push(new Pulse(45400,50000,0.0000022));
pulses12.push(new Pulse(50000,58000,0.0000008));
pulses12.push(new Pulse(58000,65000,0.0000006));
pulses12.push(new Pulse(65000,75000,0.0000004));
pulses12.push(new Pulse(75000,83000,0.0000003));
pulses12.push(new Pulse(83000,90000,0.0000001));

pulses1 = [];
pulses1.push(new Pulse(0, 2800, 0));
pulses1.push(new Pulse(2800, 90000, 8.22e-07));

pulses2 = [];
pulses2.push(new Pulse(0, 2800, 0));
pulses2.push(new Pulse(2800, 45400, 9.50e-07));
pulses2.push(new Pulse(45400, 90000, 7.51e-07));

pulses3 = [];
pulses3.push(new Pulse(0, 2800, 0));
pulses3.push(new Pulse(2800, 29800, 9.08e-07));
pulses3.push(new Pulse(29800, 58000, 1.15e-06));
pulses3.push(new Pulse(58000, 90000, 5.31e-07));

pulses4 = [];
pulses4.push(new Pulse(0, 2800, 0));
pulses4.push(new Pulse(2800, 19400, 6.00e-07));
pulses4.push(new Pulse(19400, 45400, 1.17e-06));
pulses4.push(new Pulse(45400, 65000, 9.50e-07));
pulses4.push(new Pulse(65000, 90000, 5.96e-07));

pulses6 = [];
pulses6.push(new Pulse(0, 2800, 0));
pulses6.push(new Pulse(2800, 12800, 4.68e-07));
pulses6.push(new Pulse(12800, 29800, 1.16e-06));
pulses6.push(new Pulse(29800, 45400, 1.02e-06));
pulses6.push(new Pulse(45400, 58000, 1.31e-06));
pulses6.push(new Pulse(58000, 75000, 4.17e-07));
pulses6.push(new Pulse(75000, 90000, 6.59e-07));

animate = true;
/*************************************************************************************
*
*	BUTTON EVENT HANDLERS
*
*************************************************************************************/
document.getElementById("pulse1").onclick = function(){ main(pulses1) };
document.getElementById("pulse2").onclick = function(){ main(pulses2) };
document.getElementById("pulse3").onclick = function(){ main(pulses3) };
document.getElementById("pulse4").onclick = function(){ main(pulses4) };
document.getElementById("pulse6").onclick = function(){ main(pulses6) };
document.getElementById("pulse12").onclick = function(){ main(pulses12) };
document.getElementById("half-l").onclick = function(){ L = L/2; main(currentPulses) };
document.getElementById("double-l").onclick = function(){ L = L*2; main(currentPulses) };
document.getElementById("animation").onclick = function(){
	animate = !animate;
	if(animate){
		this.innerHTML = "Animation ON";
	} else {
		this.innerHTML = "Animation OFF";
	}
};
animating = false;
main(pulses2);
animation();
function main(pulses){
	currentPulses = pulses;
	pulses = setVars(pulses);
	clearCanvas();
	//currentPoint = new Point(0,0);
	//maxIntensity = getMaxIntensity(pulses);
	difference = 0;
	points = [];
	points.push(new Point(0,0));
	currentFunction = function(){return 0;};
	inter = 0;
	functions = [];
	nextPoint = new Point(0,0);
	
	for(i=0; i<pulses.length;i++){
		p = pulses[i];
		next = pulses[i+1];
		//drawPulse(pulses12[i]);
		drawPulse(p);
		if(i==1 && pulses.length - 1 != 1){
			if(next.intensity > p.intensity){
				nextPoint.x = intersection(p.feuchtefront, function(t){ return jump(p,next,t); }, p.start, xMax);
				nextPoint.y = p.feuchtefront(nextPoint.x);
				points.push(new Point(nextPoint.x,nextPoint.y));
				drawFunction(function(t){ return jump(p,next,t); }, next.start, nextPoint.x, "0AC2FF");
				drawFunction(p.feuchtefront, p.start, nextPoint.x, "#47FF0A");
				(function(p){ functions.push(p.feuchtefront) })(p);
			}else{
				nextPoint.x = p.schnittpunkt.x;
				nextPoint.y = p.schnittpunkt.y;
				points.push(p.schnittpunkt);
				drawFunction(p.drainagefront, next.start, nextPoint.x, "0a56ff");
				drawFunction(p.feuchtefront, p.start, nextPoint.x, "#47FF0A");
				(function(p){ functions.push(p.feuchtefront)})(p);
				currentPoint = points.top();
				currentFunction = p.combined;
				(function(p){ functions.push(p.combined)})(p);
				nextPoint.x = intersection(currentFunction, next.drainagefrontStart, p.start, xMax);
				nextPoint.y = currentFunction(nextPoint.x);
				points.push(new Point(nextPoint.x, nextPoint.y));
				drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#FF0A47");
				drawFunction(next.drainagefrontStart, next.start, nextPoint.x, "#0a56ff");
			}
		} else if(i>=2 && i < pulses.length - 1){
			//currentFunction = function(t) { return linear(points[points.length-1], p.v, t) }; 
			//(function(points, p){ functions.push(function(t) { return linear(points[points.length-1], p.v, t) }) })(points, p);
				currentPoint = points.top();
				currentFunction = (function(point, p){return function(t){return linear(point, p.v, t)}})(currentPoint, p);

			if(next.intensity > p.intensity){
				nextPoint.x = intersection(currentFunction, function(t){ return jump(p,next,t); }, currentPoint.x, xMax);
				nextPoint.y = currentFunction(nextPoint.x);
				drawFunction(function(t){ return jump(p,next,t); }, next.start, nextPoint.x, "0ac2ff");
				drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#47FF0A");
				points.push(new Point(nextPoint.x, nextPoint.y));
				functions.push(currentFunction);
			}else{
				nextPoint.x = intersection(currentFunction, p.drainagefront, currentPoint.x, xMax);
				nextPoint.y = currentFunction(nextPoint.x);
				drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#47FF0A");
				drawFunction(p.drainagefront, p.end, nextPoint.x, "0a56ff");
				points.push(new Point(nextPoint.x, nextPoint.y));
				functions.push(currentFunction);
				currentPoint.copy(nextPoint);
				difference = currentFunction(currentPoint.x)-p.combined(currentPoint.x);
				currentFunction = (function(p){return function(t){ return p.combined(t) + difference }})(p);
				nextPoint.x = intersection(currentFunction, next.drainagefrontStart, currentPoint.x, xMax);
				nextPoint.y = currentFunction(nextPoint.x);
				drawFunction(next.drainagefrontStart, next.start, nextPoint.x, "0a56ff");
				points.push(new Point(nextPoint.x, nextPoint.y));
				drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#FF0A47");
				functions.push(currentFunction);
			}
		} else if(i==pulses.length-1){
			currentPoint = points.top();
			currentFunction = (function(point, p){return function(t){return linear(point, p.v, t)}})(currentPoint, p);
			nextPoint.x = intersection(currentFunction, p.drainagefront, currentPoint.x, xMax);
			nextPoint.y = currentFunction(nextPoint.x);
			drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#47FF0A");
			drawFunction(p.drainagefront, p.end, nextPoint.x, "0a56ff");
			points.push(nextPoint.x, nextPoint.y);
			functions.push(currentFunction);
			currentPoint.copy(nextPoint);
			difference = currentFunction(currentPoint.x)-p.combined(currentPoint.x);
			currentFunction = (function(p){return function(t){ return p.combined(t) + difference }})(p);
			nextPoint.x = xMax;
			nextPoint.y = currentFunction(nextPoint.x);
			points.push(new Point(nextPoint.x, nextPoint.y));
			drawFunction(currentFunction, currentPoint.x, nextPoint.x, "#FF0A47");
			functions.push(currentFunction);
		}
	}
	html = "<table><tr><th>Pulse</th><th>start</th><th>end</th><th>intensity</th></tr>";
	for(i=0;i<pulses.length;i++){
		p=pulses[i];
		html += "<tr><td>"+i+"</td><td>"+Math.floor(p.start/3600) +" h " + Math.floor(p.start/60 % 60) + 
		" min</td><td>"+Math.floor(p.end/3600) +" h " + Math.floor(p.end/60 % 60) + 
		" min</td><td>" + p.intensity + " m/s</td></tr>";
	}
	html += "</table>";
	html += "<br/><span>maximal depth</span><span>"+ Math.floor(functions.top()(xMax)*100)/100 +" m</span>";
	html += "<br/><span>timeframe</span><span>"+ xMax/3600 + "h " + xMax/60 % 60 + " min</span>";
	html += "<br/><span>value of L</span><span>"+ L +" m</span><span class=\"super\">-1</span>";
	values.innerHTML = html;
	if(animate)
		animation();
}