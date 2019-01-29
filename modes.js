/*
	Edit mode functions.
	Names beginning with "start" will edit the start transform,
	others will edit the end transform.
	Each function is called on drag-start (mousedown),
	and returns a function to be called with each drag/mousemove.
	At present, e1 exposes only start_x and start_y,
	e2 exposes x, y, change_x and change_y
*/
var modes = {
	'start position': function(e1) {
		var start_x = val('#start_position_x');
		var start_y = val('#start_position_y');
		return function(e2) {
			$('#start_position_x').val(start_x + e2.change_x);
			$('#start_position_y').val(start_y + e2.change_y);
		}
	},
	'start origin': function(e1) {
		var start_x = val('#origin_x');
		var start_y = val('#origin_y');
		var scale_x = val('#start_scale_x');
		var scale_y = val('#start_scale_y');
		var start_position_x = val('#start_position_x');
		var start_position_y = val('#start_position_y');
		return function(e2) {
			$('#origin_x').val(
				start_x + ( e2.change_x / scale_x )
			);
			$('#start_position_x').val(
				start_position_x + ( e2.change_x * ( 1 - (1 / scale_x) ) )
			);
			$('#origin_y').val(
				start_y + ( e2.change_y / scale_y )
			);
			$('#start_position_y').val(
				start_position_y + ( e2.change_y * ( 1 - (1 / scale_y) ) )
			);
		}
	},
	'start scale': function(e1) {
		var start_x = val('#start_scale_x');
		var start_y = val('#start_scale_y');
		var x_sensitivity = e1.start_x - (val('#origin_x') + val('#start_position_x'));
		var y_sensitivity = e1.start_y - (val('#origin_y') + val('#start_position_y'));
		return function(e2) {
			$('#start_scale_x').val(start_x * (1 + (e2.change_x / x_sensitivity)));
			$('#start_scale_y').val(start_y * (1 + (e2.change_y / y_sensitivity)));
		}
	},
	'start rotate': function(e1) {
		var start_rotate = val('#start_rotate');
		var start_mouse_rotate = Math.atan2(
			e1.start_y - val('#start_position_y') - val('#origin_y'),
			e1.start_x - val('#start_position_x') - val('#origin_x')
		);
		var last_rotate = start_rotate;
		return function(e2) {
			var mouse_rotate = Math.atan2(
				(e2.y - val('#start_position_y') - val('#origin_y')),
				(e2.x - val('#start_position_x') - val('#origin_x'))
			);
			if ( mouse_rotate - last_rotate > Math.PI ) {
				start_rotate -= 360;
			} else if ( mouse_rotate - last_rotate < -1 * Math.PI ) {
				start_rotate += 360;
			}
			$('#start_rotate').val(start_rotate + (180 * mouse_rotate / Math.PI));
			last_rotate = mouse_rotate;
		};
	},
	'start skew': function(e1) {
		var start_x = val('#start_skew_x');
		var start_y = val('#start_skew_y');
		var sensitivity_x = (e1.start_y - val('#start_position_y') - val('#origin_y')) / (src_img.naturalHeight * src_img.naturalWidth);
		var sensitivity_y = (e1.start_x - val('#start_position_x') - val('#origin_x')) / (src_img.naturalHeight * src_img.naturalWidth);
		return function(e2) {
			if ( sensitivity_x !== 0 ) {
				$('#start_skew_x').val(start_x + e2.change_x * sensitivity_x);
			}
			if ( sensitivity_y !== 0 ) {
				$('#start_skew_y').val(start_y + e2.change_y * sensitivity_y);
			}
		}
	},
	'end position': function(e1) {
		var end_x = val('#end_position_x');
		var end_y = val('#end_position_y');
		return function(e2) {
			$('#end_position_x').val(end_x + e2.change_x);
			$('#end_position_y').val(end_y + e2.change_y);
		}
	},
	'end origin': function(e1) {
		var end_x = val('#origin_x');
		var end_y = val('#origin_y');
		var scale_x = val('#end_scale_x');
		var scale_y = val('#end_scale_y');
		var end_position_x = val('#end_position_x');
		var end_position_y = val('#end_position_y');
		return function(e2) {
			$('#origin_x').val(
				end_x + ( e2.change_x / scale_x )
			);
			$('#end_position_x').val(
				end_position_x + ( e2.change_x * ( 1 - (1 / scale_x) ) )
			);
			$('#origin_y').val(
				end_y + ( e2.change_y / scale_y )
			);
			$('#end_position_y').val(
				end_position_y + ( e2.change_y * ( 1 - (1 / scale_y) ) )
			);
		}
	},
	'end scale': function(e1) {
		var end_x = val('#end_scale_x');
		var end_y = val('#end_scale_y');
		var x_sensitivity = e1.start_x - (val('#origin_x') + val('#end_position_x'));
		var y_sensitivity = e1.start_y - (val('#origin_y') + val('#end_position_y'));
		return function(e2) {
			$('#end_scale_x').val(end_x * (1 + (e2.change_x / x_sensitivity)));
			$('#end_scale_y').val(end_y * (1 + (e2.change_y / y_sensitivity)));
		}
	},
	'end rotate': function(e1) {
		var end_rotate = val('#end_rotate');
		var end_mouse_rotate = Math.atan2(
			e1.start_y - val('#end_position_y') - val('#origin_y'),
			e1.start_x - val('#end_position_x') - val('#origin_x')
		);
		var last_rotate = end_rotate;
		return function(e2) {
			var mouse_rotate = Math.atan2(
				(e2.y - val('#end_position_y') - val('#origin_y')),
				(e2.x - val('#end_position_x') - val('#origin_x'))
			);
			if ( mouse_rotate - last_rotate > Math.PI ) {
				end_rotate -= 360;
			} else if ( mouse_rotate - last_rotate < -1 * Math.PI ) {
				end_rotate += 360;
			}
			$('#end_rotate').val(end_rotate + (180 * mouse_rotate / Math.PI));
			last_rotate = mouse_rotate;
		};
	},
	'end skew': function(e1) {
		var end_x = val('#end_skew_x');
		var end_y = val('#end_skew_y');
		var sensitivity_x = (e1.start_y - val('#end_position_y') - val('#origin_y')) / (src_img.naturalHeight * src_img.naturalWidth);
		var sensitivity_y = (e1.start_x - val('#end_position_x') - val('#origin_x')) / (src_img.naturalHeight * src_img.naturalWidth);
		return function(e2) {
			if ( sensitivity_x !== 0 ) {
				$('#end_skew_x').val(end_x + e2.change_x * sensitivity_x);
			}
			if ( sensitivity_y !== 0 ) {
				$('#end_skew_y').val(end_y + e2.change_y * sensitivity_y);
			}
		}
	}
};
