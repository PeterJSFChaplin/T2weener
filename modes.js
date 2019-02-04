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
			$('#start_position_x').val(start_x + e2.change_x_rel);
			$('#start_position_y').val(start_y + e2.change_y_rel);
		}
	},
	'start origin': function(e1) {
		var start_x = val('#origin_x');
		var start_y = val('#origin_y');
		return function(e2) {
			$('#origin_x').val(
				start_x + e2.change_x_rel
			);
			$('#origin_y').val(
				start_y + e2.change_y_rel
			);
		}
	},
	'start scale': function(e1) {
		var start_x = val('#start_scale_x');
		var start_y = val('#start_scale_y');
		var x_sensitivity = e1.start_x_rel;
		var y_sensitivity = e1.start_y_rel;
		return function(e2) {
			$('#start_scale_x').val(start_x * (1 + (e2.change_x_rel / x_sensitivity)));
			$('#start_scale_y').val(start_y * (1 + (e2.change_y_rel / y_sensitivity)));
		}
	},
	'start rotate': function(e1) {
		//nb. "rotate" for degrees, "angle" for radians
		var start_rotate = val('#start_rotate');
		var start_mouse_angle = Math.atan2(
			e1.start_y_rel,
			e1.start_x_rel
		);
		var last_rotate = start_rotate;
		return function(e2) {
			var mouse_angle = Math.atan2(
				e2.y_rel,
				e2.x_rel
			);
			var mouse_angle_change = mouse_angle - start_mouse_angle;
			var mouse_rotate = mouse_angle_change * 180 / Math.PI;
			if ( mouse_rotate - last_rotate > 180 ) {
				start_rotate -= 360;
			} else if ( mouse_rotate - last_rotate < -180 ) {
				start_rotate += 360;
			}
			$('#start_rotate').val(start_rotate + mouse_rotate);
			last_rotate = mouse_rotate;
		};
	},
	'start skew': function(e1) {
		var start_x = val('#start_skew_x');
		var start_y = val('#start_skew_y');
		var sensitivity_x = e1.start_y_rel;
		var sensitivity_y = e1.start_x_rel;
		return function(e2) {
			if ( sensitivity_x !== 0 ) {
				$('#start_skew_x').val(start_x + (e2.change_x_rel / sensitivity_x));
			}
			if ( sensitivity_y !== 0 ) {
				$('#start_skew_y').val(start_y + (e2.change_y_rel / sensitivity_y));
			}
		}
	},
	'end position': function(e1) {
		var start_x = val('#end_position_x');
		var start_y = val('#end_position_y');
		return function(e2) {
			$('#end_position_x').val(start_x + e2.change_x_rel);
			$('#end_position_y').val(start_y + e2.change_y_rel);
		}
	},
	'end origin': function(e1) {
		var start_x = val('#origin_x');
		var start_y = val('#origin_y');
		return function(e2) {
			$('#origin_x').val(
				start_x + e2.change_x_rel
			);
			$('#origin_y').val(
				start_y + e2.change_y_rel
			);
		}
	},
	'end scale': function(e1) {
		var start_x = val('#end_scale_x');
		var start_y = val('#end_scale_y');
		var x_sensitivity = e1.start_x_rel;
		var y_sensitivity = e1.start_y_rel;
		return function(e2) {
			$('#end_scale_x').val(start_x * (1 + (e2.change_x_rel / x_sensitivity)));
			$('#end_scale_y').val(start_y * (1 + (e2.change_y_rel / y_sensitivity)));
		}
	},
	'end rotate': function(e1) {
		//nb. "rotate" for degrees, "angle" for radians
		var start_rotate = val('#end_rotate');
		var start_mouse_angle = Math.atan2(
			e1.start_y_rel,
			e1.start_x_rel
		);
		var last_rotate = start_rotate;
		return function(e2) {
			var mouse_angle = Math.atan2(
				e2.y_rel,
				e2.x_rel
			);
			var mouse_angle_change = mouse_angle - start_mouse_angle;
			var mouse_rotate = mouse_angle_change * 180 / Math.PI;
			if ( mouse_rotate - last_rotate > 180 ) {
				start_rotate -= 360;
			} else if ( mouse_rotate - last_rotate < -180 ) {
				start_rotate += 360;
			}
			$('#end_rotate').val(start_rotate + mouse_rotate);
			last_rotate = mouse_rotate;
		};
	},
	'end skew': function(e1) {
		var start_x = val('#end_skew_x');
		var start_y = val('#end_skew_y');
		var sensitivity_x = e1.start_y_rel;
		var sensitivity_y = e1.start_x_rel;
		return function(e2) {
			if ( sensitivity_x !== 0 ) {
				$('#end_skew_x').val(start_x + (e2.change_x_rel / sensitivity_x));
			}
			if ( sensitivity_y !== 0 ) {
				$('#end_skew_y').val(start_y + (e2.change_y_rel / sensitivity_y));
			}
		}
	},
};
