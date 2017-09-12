class Video {
	/**
	 * Wrap video to allow stabler manipulation
	 * @param video {HTMLElement}
	 */
	constructor ( video ){
		if( !video ) {
			throw new Error( "Video element not found" );
		}
		this.element = video;
	}

	/**
	 * Pause the video element
	 */
	pause(){
		// if(this.promise)
		// 	this.promise.then(() =>this.element.pause());
		if(this.promise)
			return this.promise.then(() =>this.element.pause());
		else return {
			then(callback){callback();}
		}
	}

	/**
	 * Play the video element
	 */
	play(){
			this.promise = this.element.play();
	}

	/**
	 * Set the video stream
	 * @param stream {MediaStream}
	 * @param muted {Boolean}
	 */
	setStream(stream, muted){
		this.element.srcObject = stream;
		if( muted !== undefined ) {
			this.element.muted = muted;
		} else {
			this.element.muted = false;
		}
	}
}
export {
	Video
};