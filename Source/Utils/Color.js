/*
---

name: "Utils.Color"

description: "Provides Color class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Color

...
*/

new function () {

var math = Math;

var Color = LibCanvas.Utils.Color = atom.Class({
	Static: {
		invoke: function (color) {
			if (color == null) return null;

			return (typeof color == 'object' && color[0] instanceof Color) ?
				color[0] : color instanceof Color ? color : new Color(color);
		},
		isColorString : function (string) {
			if (typeof string != 'string') return false;
			return string in this.colorNames ||
			       string.match(/^#\w{3,6}$/) ||
			       string.match(/^rgba?\([\d, ]+\)$/);
		},
		colorNames: {
			white:  '#ffffff',
			silver: '#c0c0c0',
			gray:   '#808080',
			black:  '#000000',
			red:    '#ff0000',
			maroon: '#800000',
			yellow: '#ffff00',
			olive:  '#808000',
			lime:   '#00ff00',
			green:  '#008000',
			aqua:   '#00ffff',
			teal:   '#008080',
			blue:   '#0000ff',
			navy:   '#000080',
			fuchsia:'#ff00ff',
			purple: '#800080',
			orange: '#ffa500'
		},
		/**
		 * @param html - only html color names
		 */
		random: function (html) {
			return new Color(html ?
				Object.values(this.colorNames).random :
				Array.create(3, Number.random.bind(Number, 0, 255))
			);
		}
	},
	r: 0,
	g: 0,
	b: 0,
	a: null,
	initialize: function (value) {
		var rgb = value;
		if (value && value.length == 1) value = value[0];
		if (arguments.length == 3) {
			rgb = arguments;
		} else if (!Array.isArray(value)) {
			var type = atom.typeOf(value);
			if (type == 'arguments') {
				rgb = Array.from(rgb);
			} else if (type != 'string') {
				throw new TypeError('Unknown value type: ' + type);
			} else {
				value = value.toLowerCase();

				value = Color.colorNames[value] || value;
				var hex = value.match(/^#(\w{1,2})(\w{1,2})(\w{1,2})$/);
				if (hex) {
					rgb = hex.slice(1).map(function (part) {
						if (part.length == 1) part += part;
						return parseInt(part, 16);
					});
				} else {
					rgb = value.match(/([\.\d]{1,3})/g).map( Number );
					if (rgb.length < 3) {
						throw new TypeError('Wrong value format: ' + atom.toArray(arguments));
					}
				}
			}
		}
		this.r = rgb[0];
		this.g = rgb[1];
		this.b = rgb[2];
		if (rgb[3] != null) this.a = rgb[3];
	},
	toArray: function () {
		return this.a == null ?
			[this.r, this.g, this.b] :
			[this.r, this.g, this.b, this.a];
	},
	toString: function (type) {
		var arr = this.toArray();
		return type == 'hex' ?
			'#' + arr.map(function (color, i) {
				if (i > 2) return '';
				var bit = (color - 0).toString(16);
				return bit.length == 1 ? '0' + bit : bit;
			}).join('')
			: (arr.length == 4 ? 'rgba(' : 'rgb(') + arr + ')';
	},
	diff: function (color) {
		color = Color( Array.from( arguments ) );
		var result = [
			color.r - this.r,
			color.g - this.g,
			color.b - this.b
		];
		if ((color.a != null) || (this.a != null)) {
			result.push(
				color.a == null ? 1 : color.a -
				this .a == null ? 1 : this .a
			);
		}
		return result;
	},
	shift: function (array) {
		var clone = this.clone();
		clone.r += math.round(array[0]);
		clone.g += math.round(array[1]);
		clone.b += math.round(array[2]);
		if (3 in array) clone.a += math.round(array[3]);
		return clone;
	},
	dump: function () {
		return '[Color(' + this + ')]';
	},
	clone: function () {
		return new Color(this.toArray());
	}
});

}();