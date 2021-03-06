/*
---

name: "Inner.DownloadingProgress"

description: "Counting assets downloading progress"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.ImagePreloader
	- Utils.ProgressBar

provides: Inner.DownloadingProgress

...
*/
LibCanvas.Inner.DownloadingProgress = atom.Class({
	getImage : function (name) {
		if (this.parentLayer) return this.parentLayer.getImage(name);
		
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw new Error('No image «' + name + '»');
		}
	},
	getAudio: function (name) {
		if (this.parentLayer) return this.parentLayer.getAudio(name);
		
		if (this._audio) {
			var audio = this._audio.get(name);
			if (audio) return audio;
		}
		throw new Error('No audio «' + name + '»');
	},
	renderProgress : function () {
		if (this.parentLayer) return;
		
		if (this.options.progressBarStyle && !this.progressBar) {
			this.progressBar = new LibCanvas.Utils.ProgressBar()
				.setStyle(this.options.progressBarStyle);
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	createPreloader : function () {
		if (!this.imagePreloader) {
			
			if (this.parentLayer) {
				this.parentLayer.addEvent('ready', function () {
					this.readyEvent('ready');
				}.context(this));
				this.imagePreloader = true;
				return;
			}
			
			if (this.options.preloadAudio) {
				this._audio = new LibCanvas.Utils.AudioContainer(this.options.preloadAudio);
			} else {
				this._audio = null;
			}

			if (this.options.preloadImages) {
				this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.options.preloadImages)
					.addEvent('ready', function (preloader) {
						this.images = preloader.images;
						atom.log(preloader.getInfo());
						this.readyEvent('ready');
						this.update();
					}.context(this));
			} else {
				this.images = {};
				this.imagePreloader = true;
				this.readyEvent('ready');
			}
		}

	},
	isReady : function () {
		this.createPreloader();
		if (this.parentLayer) return this.parentLayer.isReady();

		var pI = this.options.preloadImages;
		return !pI || !Object.values(pI).length
			|| (this.imagePreloader && this.imagePreloader.isReady());
	}
});