/*
---

name: "EC"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Artem Smirnov <art543484@ya.ru>"
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Inner.TimingFunctions
	- Context2D

provides: EC

...
*/

new function () {
	
var Color = LibCanvas.Utils.Color, 
	TimingFunctions = LibCanvas.Inner.TimingFunctions,
	Point = LibCanvas.Point;

var EC = {};
EC.color = function (color) {
	color   = new Color(color || [0,0,0,1]);
	color.a = (color.a || 1) * 255;
	return color;
};

EC.gradient = function (obj) {
	if (!obj.gradient) {
		return Function.lambda( EC.color(obj.color).toArray() );
	} else if(typeof obj.gradient == 'function') {
		return obj.gradient;
	} else {
		var gradient = {}
		
		gradient.fn = obj.gradient.fn || 'linear'
		
		if (typeof gradient.fn != 'string') {
			throw new Error('Unexpected type of gradient function');
		}
		
		gradient.from = EC.color(obj.gradient.from);
		gradient.to   = EC.color(obj.gradient.to  );
		
		var diff = gradient.from.diff( gradient.to );
		
		return function(t) {
			var factor = TimingFunctions.count(gradient.fn, t);
			return gradient.from.shift( diff.clone().mul(factor) ).toArray()
		}
	}
}
EC.width = function (obj) {
	obj.width = obj.width || 1;
	switch (typeof obj.width) {
		case 'number'  : return Function.lambda(obj.width);
		case 'function': return obj.width;
		case 'object'  : return EC.width.range( obj.width );
		default: throw new Error('Unexpected type of width');
	};
};

EC.width.range = function (width) {
	if(!width.from || !width.to){
		throw new Error('width.from or width.to undefined');
	}
	var diff = width.to - width.from;
	return function(t){
		return width.from + diff * TimingFunctions.count(width.fn || 'linear', t);
	}
};

EC.angle = function (a, b) {
	return Math.atan( (a.y-b.y)/(a.x-b.x) );
};

EC.curves = {
	quadratic: function (p,t) {
		return new Point(
			(1-t)*(1-t)*p[0].x + 2*t*(1-t)*p[1].x + t*t*p[2].x,
			(1-t)*(1-t)*p[0].y + 2*t*(1-t)*p[1].y + t*t*p[2].y
		);
	},
	qubic:  function (p, t) {
		return new Point(
			(1-t)*(1-t)*(1-t)*p[0].x + 3*t*(1-t)*(1-t)*p[1].x + 3*t*t*(1-t)*p[2].x + t*t*t*p[3].x,
			(1-t)*(1-t)*(1-t)*p[0].y + 3*t*(1-t)*(1-t)*p[1].y + 3*t*t*(1-t)*p[2].y + t*t*t*p[3].y
		);
	}
};

LibCanvas.Context2D.implement({
	drawCurve:function (obj) {
		console.time('curve');
		var gradient = EC.gradient(obj);   //Getting gradient function
		var widthFn  = EC.width(obj);         //Getting width function
		
		var points = obj.points.concat([obj.to] || []).map(Point);  //Getting array of points
		
		var fn = points.length == 3 ? EC.curves.quadratic :
		         points.length == 4 ? EC.curves.qubic : null;  //Define function 
				 
		if(!fn){
			throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');
		}  //If function not defined throw error
		
		var step = obj.step || 0.0003;  //Found one step
		
		var imgd = this.original('createImageData', [this.canvas.width, this.canvas.height], true);  //Create image data
		
		var last = fn(points,0), point, color, width, angle, w, dx, dy, sin, cos;
		
		for(var t=step;t<=1;t+=step){
			point = fn(points, t); //Find x,y
			
			color = gradient(t);   //Find color
			width = widthFn(t);    //Find width
			
			angle = EC.angle(point, last);   //Found angle
			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			for(w=0;w<width;w++){
				dx = sin * w;
				dy = cos * w;
				
				p1 = (~~(point.y - dy))*4*imgd.width + (~~(point.x + dx))*4;
				p2 = (~~(point.y + dy))*4*imgd.width + (~~(point.x - dx))*4;
				
				imgd.data[p1  ] = imgd.data[p2  ] = color[0];
				imgd.data[p1+1] = imgd.data[p2+1] = color[1];
				imgd.data[p1+2] = imgd.data[p2+2] = color[2];
				imgd.data[p1+3] = imgd.data[p2+3] = color[3];
			}
			last = point;
		}
		
		this.putImageData(imgd,0,0); //Put new image data
		
		console.timeEnd('curve');
		return this;	
	}
});
};