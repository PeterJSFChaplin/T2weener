function Transformation(data) {
	$.extend(this,{
			origin: {x:0,y:0},
			start: {
				position: {x:0,y:0},
				scale: {x:1,y:1},
				rotation: 0,
				skew: {x:0,y:0}
			},
			end: {
				position: {x:0,y:0},
				scale: {x:1,y:1},
				rotation: 0,
				skew: {x:0,y:0}
			},
			easing: 'linear'
	},data);
}
$.extend(Transformation.prototype,{
	copy: function(){
		return new Transformation({
			origin: {
				x: this.origin.x,
				y: this.origin.y
			},
			start: {
				position: {
					x: this.start.position.x,
					y: this.start.position.y
				},
				scale: {
					x: this.start.scale.x,
					y: this.start.scale.y
				},
				rotation: this.start.rotation,
				skew: {
					x: this.start.skew.x,
					y: this.start.skew.y
				}
			},
			end: {
				position: {
					x: this.end.position.x,
					y: this.end.position.y
				},
				scale: {
					x: this.end.scale.x,
					y: this.end.scale.y
				},
				rotation: this.end.rotation,
				skew: {
					x: this.end.skew.x,
					y: this.end.skew.y
				}
			},
			easing: this.easing
		});
	},
	apply: function(context,time) {		
		var t = this.get_at_time(time);
		
		context.translate(
			t.position.x + t.origin.x,
			t.position.y + t.origin.y
		)
		context.rotate(t.rotation * Math.PI / 180);
		context.transform(
			t.scale.x,
			t.skew.y,
			t.skew.x,
			t.scale.y,
			0,
			0
		);
		context.translate(
			-1 * t.origin.x,
			-1 * t.origin.y
		)
	},
	get_at_time: function(time) {
		var transformation = this;
		var ease_function = easings[this.easing];
		var f = ease_function(time);
		var t = {
			origin: this.origin,
			easing: this.easing
		};
		$.each([
			'position',
			'scale',
			'skew'
		],function(j,name){
			t[name] = {
				x: transformation.start[name].x +
					f * ( transformation.end[name].x - transformation.start[name].x ),
				y: transformation.start[name].y +
					f * ( transformation.end[name].y - transformation.start[name].y )
			};
		});
		t.rotation = this.start.rotation + f * ( this.end.rotation - this.start.rotation );
		
		return t;
	},
	reverse: function(point,time) {
		var t = this.get_at_time(time);
		
		// 1. Remove position and offset
		var p = {
			x: point.x - t.position.x - t.origin.x,
			y: point.y - t.position.y - t.origin.y
		}
		
		// 2. Remove rotation
		var distance = Math.sqrt((p.x * p.x) + (p.y * p.y));
		var angle = Math.atan2(p.y,p.x);
		angle = angle - (t.rotation * Math.PI / 180);
		p.x = Math.round(distance * Math.cos(angle));
		p.y = Math.round(distance * Math.sin(angle));
		
		// 3. Remove skew
		p.x = p.x - (p.y * t.skew.x);
		p.y = p.y - (p.x * t.skew.y);
		
		// 4. Remove scale
		p.x = p.x / t.scale.x;
		p.y = p.y / t.scale.y;
		
		return p;
	},
	save: function() {
		var transformation = this;
		this.origin = {x:val('#origin_x'),y:val('#origin_y')};
		$.each([
			'position',
			'scale',
			'skew'
		],function(j,name){
			transformation.start[name].x = val('#start_'+name+'_x');
			transformation.start[name].y = val('#start_'+name+'_y');
			transformation.end[name].x = val('#end_'+name+'_x');
			transformation.end[name].y = val('#end_'+name+'_y');
		});
		this.start.rotation = val('#start_rotate');
		this.end.rotation = val('#end_rotate');
		this.easing = $('#easing').val();
	},
	load: function() {
		var transformation = this;
		$('#origin_x').val(this.origin.x);
		$('#origin_y').val(this.origin.y);
		$.each([
			'start',
			'end'
		],function(i,time){
			$.each([
				'position',
				'scale',
				'skew'
			],function(j,name){
				$.each([
					'x','y'
				],function(k,axis){
					$('#'+time+'_'+name+'_'+axis).val(transformation[time][name][axis]);
				});
			});
			$('#'+time+'_rotate').val(transformation[time].rotation);
		});
		$('#easing').val(this.easing);
	}
});
