function val(selector){
	var value = parseFloat($(selector).val());
	if ( Number.isNaN(value) ) {
		throw new Error(selector + ' is not a number');
	}
	return value;
}

$(function(){
	'use strict';
	var ref_imgs, src_imgs, context, canvas;
	ref_imgs = [];
	src_imgs = [];
	 	
	canvas = $('#canvas')[0];
	context = canvas.getContext('2d');
	
	$.each(easings,function(name,func){
		$('#easing').append(
			$('<option>').val(name).text(name)
		);
	});
	
	$.each(modes,function(name,func){
		$('#mode').append(
			$('<option>').val(name).text(name)
		);
	});
	
	;(function(){
		var start_x;
		var start_y;
		var drag_function;
		var dragging = false;
		
		$('#canvas').on('mousedown',function(e){
			if ( src_imgs.length > 0 ) {
				if ( $('#mode').val().slice(0,5) === 'start' ) {
					$('#current_frame').val(1);
				} else if ( $('#mode').val().slice(0,3) === 'end' ) {
					$('#current_frame').val(val('#count_frames'));
				}
				dragging = true;
				start_x = e.offsetX;
				start_y = e.offsetY
				drag_function = modes[ $('#mode').val() ]({
					start_x: start_x,
					start_y: start_y
				});
			}
		});
		
		$('#canvas').on('mousemove',function(e){
			if ( ! dragging ) {
				return;
			}
			drag_function({
				x: e.offsetX,
				y: e.offsetY,
				change_x: e.offsetX - start_x,
				change_y: e.offsetY - start_y
			});
			draw();
		});
		
		$('#canvas').on('mouseleave, mouseup',function(){
			dragging = false;
		});		
	})();
	
  $('#ref_img').on('change',function(){
  	ref_imgs = [];
  	var max_width = 1;
  	var max_height = 1;
  	var promise = Promise.resolve();
  	$.each(this.files,function(i,file){
  		promise = promise
  		.then(function(){
				return read(file)
				.then(function(img){
					ref_imgs[i] = img;
					max_width = Math.max(max_width,img.naturalWidth);
					max_height = Math.max(max_height,img.naturalHeight);
				});
			})
  	});
  	promise.then(function(){
			$(canvas)
				.attr('width',max_width)
				.attr('height',max_height);
			var count_frames = Math.max(
				lcm(
					ref_imgs.length,
					src_imgs.length
				),
				12
			);
			$('#count_frames').val( count_frames );
			$('#current_frame').attr('max',count_frames);
			draw();
		});
	});
	
	$('#src_img').on('change',function(){
		src_imgs = [];
		var promise = Promise.resolve();
		$.each(this.files,function(i,file){
			promise = promise
			.then(function(){
				return read(file)
				.then(function(img){
					src_imgs[i] = img;
				});
			})
		});
		promise.then(function(){
			var count_frames = Math.max(
				lcm(
					ref_imgs.length,
					src_imgs.length
				),
				12
			);
			$('#count_frames').val( count_frames );
			$('#current_frame').attr('max',count_frames);
			draw();
		});
	});
	
	$('#count_frames').on('change',function(){
		$('#current_frame').attr('max',val('#count_frames'));
	});
	
	$('input, select').on('change',draw);
	
	$('#download').on('click',function(e){
		$(canvas).hide();
		e.preventDefault();
		var zip = new JSZip();		
		var promise = Promise.resolve();
		for (var i = 0; i < val('#count_frames'); i++) {
			;(function(i){
				promise = promise.then(function(){
					var filename = 'frame' + ('000'+i).slice(-4) + '.png';
					context.resetTransform();
					context.clearRect(0,0,canvas.width,canvas.height);
					draw_frame(i);					
					return new Promise(function(resolve, reject){
						canvas.toBlob(function(blob){
							zip.file(filename,blob);
							resolve();
						});
					})
				});
			})(i);
		}
		promise.then(function(){
			return zip.generateAsync({type:'blob'})
		})
		.then(function(content){
			saveAs(content,'frames.zip');
			$(canvas).show();
			draw();
		});
	});
	
	function draw() {
		context.resetTransform();
		context.clearRect(0,0,canvas.width,canvas.height);
		
		if ( ref_imgs.length > 0 ) {
  		context.drawImage(
  			ref_imgs[ (val('#current_frame') - 1) % ref_imgs.length ],
  			0,
  			0
  		);
		}
		
		if ( src_imgs.length > 0 ) {
			var alpha;
			for (var i = 0; i < val('#count_frames'); i++) {
				alpha = Math.pow(val('#alpha_fade'), Math.abs(val('#current_frame') - 1 - i));
				if ( i == 0 ) {
					alpha = Math.max(alpha,val('#alpha_start'));
				}
				if ( i == val('#count_frames') - 1 ) {
					alpha = Math.max(alpha,val('#alpha_end'));
				}
				context.globalAlpha = alpha;
				draw_frame(i);
				if ( i == (val('#current_frame') - 1) ) {
					var t = frame_transform(i);
					context.resetTransform();
					context.strokeStyle = $('#origin_colour').val();
					context.strokeRect(
							val('#origin_x') + t.position_x - 1,
							val('#origin_y') + t.position_y - 1,
							3,
							3
					);
				}
			}
			context.globalAlpha = 1;
		}
	}
	
	function draw_frame(i) {
		var t = frame_transform(i);
		
		context.resetTransform();
		context.translate(
			val('#origin_x') + t.position_x,
			val('#origin_y') + t.position_y
		);
		
		context.rotate(t.rotate * Math.PI / 180);
		
		context.transform(
			t.scale_x,
			t.skew_y,
			t.skew_x,
			t.scale_y,
			0,0
		);
		
		context.drawImage(
			src_imgs[i % src_imgs.length],
			-1 * val('#origin_x'),
			-1 * val('#origin_y')
		);
	}
	
	function frame_transform(i) {
		var ease_function = easings[$('#easing').val()];
		var f = ease_function(i/(val('#count_frames')-1));
		var t = {};
		$.each([
			'position_x',
			'position_y',
			'scale_x',
			'scale_y',
			'rotate',
			'skew_x',
			'skew_y'
		],function(j,name){
			t[name] = val('#start_'+name)
			+ f * ( val('#end_'+name) - val('#start_'+name) );
		});
		return t;
	}
	
	function read(file) {
		var reader = new FileReader();
		var img = new Image();
		var promise = new Promise(function(resolve, reject) {
			reader.onload = function(e) {
				$(img).on('load',function(){
					resolve(img);
				});
				img.src = e.target.result;
			}
		});
		reader.readAsDataURL(file);
		return promise;
	}
	
	function gcd(a, b) {
    if (b == 0) {
        return a;
    } else {
        return gcd(b, a % b);
    }
  }
  
  function lcm(a, b) {
  	if ( a === 0 ) {
	  	return b;
  	}
  	if ( b === 0 ) {
  		return a;
  	}
	  return a * b / gcd(a, b);
	}
});
