function val(selector){
	var value = parseFloat($(selector).val());
	if ( Number.isNaN(value) ) {
		throw new Error(selector + ' is not a number');
	}
	return value;
}

var data = {};
$(function(){
	'use strict';
	var canvas = $('#canvas')[0];
	var context = canvas.getContext('2d');
	var counter = 0;
	
	$('#layers').jstree({
		core: {
			animation: 0,
			check_callback: true
		},
		plugins: [
			"changed",
			"dnd",
			"types",
			"wholerow",
			"checkbox",
			"sort",
			"contextmenu",
			"unique"
		],
		contextmenu: {
			items: function (o, cb) { // Could be an object directly
				/*return {
					"create" : {
						"separator_before"	: false,
						"separator_after"	: true,
						"_disabled"			: false, //(this.check("create_node", data.reference, {}, "last")),
						"label"				: "Create",
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
								obj = inst.get_node(data.reference);
							inst.create_node(obj, {}, "last", function (new_node) {
								try {
									inst.edit(new_node);
								} catch (ex) {
									setTimeout(function () { inst.edit(new_node); },0);
								}
							});
						}
					},*/
				return {
					"rename" : {
						"separator_before"	: false,
						"separator_after"	: false,
						"_disabled"			: false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
						"label"				: "Rename",
						/*!
						"shortcut"			: 113,
						"shortcut_label"	: 'F2',
						"icon"				: "glyphicon glyphicon-leaf",
						*/
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
								obj = inst.get_node(data.reference);
							inst.edit(obj);
						}
					},
					"remove" : {
						"separator_before"	: false,
						"icon"				: false,
						"separator_after"	: false,
						"_disabled"			: false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
						"label"				: "Delete",
						"action"			: function (data) {
							var inst = $.jstree.reference(data.reference),
								obj = inst.get_node(data.reference);
							if(inst.is_selected(obj)) {
								inst.delete_node(inst.get_selected());
							}
							else {
								inst.delete_node(obj);
							}
						}
					}
				};
/*					"ccp" : {
						"separator_before"	: true,
						"icon"				: false,
						"separator_after"	: false,
						"label"				: "Edit",
						"action"			: false,
						"submenu" : {
							"cut" : {
								"separator_before"	: false,
								"separator_after"	: false,
								"label"				: "Cut",
								"action"			: function (data) {
									var inst = $.jstree.reference(data.reference),
										obj = inst.get_node(data.reference);
									if(inst.is_selected(obj)) {
										inst.cut(inst.get_top_selected());
									}
									else {
										inst.cut(obj);
									}
								}
							},
							"copy" : {
								"separator_before"	: false,
								"icon"				: false,
								"separator_after"	: false,
								"label"				: "Copy",
								"action"			: function (data) {
									var inst = $.jstree.reference(data.reference),
										obj = inst.get_node(data.reference);
									if(inst.is_selected(obj)) {
										inst.copy(inst.get_top_selected());
									}
									else {
										inst.copy(obj);
									}
								}
							},
							"paste" : {
								"separator_before"	: false,
								"icon"				: false,
								"_disabled"			: function (data) {
									return !$.jstree.reference(data.reference).can_paste();
								},
								"separator_after"	: false,
								"label"				: "Paste",
								"action"			: function (data) {
									var inst = $.jstree.reference(data.reference),
										obj = inst.get_node(data.reference);
									inst.paste(obj);
								}
							}
						}
					}
				}*/
			}
		},
		checkbox: {
			three_state: false,
			whole_node: false,
			tie_selection: false
		},
		types: {
			"#": {
				valid_children: ["group","image"]
			},
			"group": {
				valid_children: ["group","image","transformation"]
			},
			"image": {
				icon: "jstree-file",
				valid_children: ["transformation"]
			},
			"transformation": {
				icon: "t2weener-transformation",
				valid_children: []
			}
		},
		sort: function(a,b) {
			var tree = $('#layers').jstree(true);
			if (
				tree.get_type(a) === 'transformation'
				&&
				tree.get_type(b) !== 'transformation'
				) {
				return -1;
			} else if (
				tree.get_type(a) !== 'transformation'
				&&
				tree.get_type(b) === 'transformation'
				) {
				return 1;
			} else {
				return 0;
			}
		}
	})
	.on('changed.jstree',function(e,change_data){
		var tree = $('#layers').jstree(true);
		var selection = tree.get_selected();
		
		if ( tree.get_type(selection[0]) === 'transformation' ) {
			data[tree.get_node(selection[0]).id].transformation.load()
		};
	});
	
	$('#frames_in').on('change',function(){
		var name = this.files[0].name;
		var promises = [];
		
		$.each(this.files,function(i,file){
			promises.push( read(file) );
		});
		
		Promise.all(promises)
		.then(function(src_imgs){
			return new_image_node(name,src_imgs);
		})
		.then(function(t_node){
			var tree = $('#layers').jstree(true);
			tree.select_node(t_node);
			draw();
		})
		.catch(function(error){
			console.log(error);
		});
	});
	
	$('#layers_in').on('change',function(){
		var promises = [];
		
		$.each(this.files,function(i,file){
			promises.push(
				read(file)
				.then(function(src_img){
					return new_image_node(file.name,[src_img]);
				})
			)
		});
		
		Promise.all(promises)
		.then(draw)
		.catch(function(error){
			console.log(error);
		});
	});
	
	function new_image_node(name,src_imgs) {
		var parent, img_node, t_node;
		var tree = $('#layers').jstree(true);
		var selection = tree.get_selected();
		if ( selection.length > 0 ) {
			parent = selection[0];
			if ( tree.get_type(parent) === "transformation" ) {
				parent = tree.get_parent(parent);
			}
			if ( tree.get_type(parent) === "image" ) {
				parent = tree.get_parent(parent);
			}
		} else {
			parent = '#';
		}
		
		var promise = new Promise(function(resolve,reject){
			img_node = tree
				.create_node(
					parent,
					{
						"type":"image",
						"text":name
					},
					"last",
					resolve
				);
		});
		
		return promise
		.then(function(img_node){
			data[tree.get_node(img_node).id] = {
				"src_imgs": src_imgs
			};
			tree.check_node(img_node);
			
			return new Promise(function(resolve,reject){
				t_node = tree.create_node(
					img_node,
					{
						"type":"transformation",
						"text":"Transformation"+(counter++)
					},
					"last",
					resolve
				);
			});
		})			
		.then(function(t_node){
			data[tree.get_node(t_node).id] = {
				"transformation": new Transformation()
			};
			tree.check_node(t_node);
			tree.open_node(img_node);
			if ( tree.is_closed(parent) ) {
				tree.open_node(parent);
			}
			return t_node;
		});
	}
	
	$('#add_group').on('click',function(){
		var parent;
		var tree = $('#layers').jstree(true);
		var selection = tree.get_selected();
		if ( selection.length > 0 ) {
			parent = selection[0];
			if ( tree.get_type(parent) === "transformation" ) {
				parent = tree.get_parent(parent);
			}
			if ( tree.get_type(parent) === "image" ) {
				parent = tree.get_parent(parent);
			}
		} else {
			parent = '#';
		}
		var group_node = $('#layers')
			.jstree(true)
			.create_node('#',{
				"type":"group",
				"text":"Group"+(counter++)
			},
			"last",
			function(group_node){
				tree.check_node(group_node);
				if ( tree.is_closed(parent) ) {
					tree.open_node(parent);
				}
			}
		);
	});
	
	$('#add_tween').on('click',function(){
		var parent;
		var tree = $('#layers').jstree(true);
		var selection = tree.get_selected();
		if ( selection.length > 0 ) {
			parent = selection[0];
			if ( tree.get_type(parent) === "transformation" ) {
				parent = tree.get_parent(parent);
			}
		} else {
			parent = '#';
		}
		var t_node = $('#layers')
			.jstree(true)
			.create_node(parent,{
				"type":"transformation",
				"text":"Transformation"+(counter++)
			},
			"last",
			function(t_node){
				data[tree.get_node(t_node).id] = {
					"transformation": new Transformation()
				};
				tree.check_node(t_node);
				if ( tree.is_closed(parent) ) {
					tree.open_node(parent);
				}
			}
		);
	});
	
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
		var start_x, start_y, start_x_rel, start_y_rel, drag_function, transformations;
		var dragging = false;
		
		$('#canvas').on('mousedown',function(e){
			var t = current_transformation();
			if ( t ) {
				if ( $('#mode').val().slice(0,5) === 'start' ) {
					$('#current_frame').val(1);
				} else if ( $('#mode').val().slice(0,3) === 'end' ) {
					$('#current_frame').val(val('#count_frames'));
				}
				dragging = true;
				
				var tree = $('#layers').jstree(true);
				var selection = tree.get_selected();
				var node = selection[0];
				
				transformations = [];
				do {
					if ( tree.get_type(node) === "transformation" ) {
						transformations.unshift(
							data[tree.get_node(node).id].transformation.copy()
						);
					}
					node = tree.get_prev_dom(node);
				} while ( node && node.length );
				
				start_x = e.offsetX;
				start_y = e.offsetY;
				
				var point = {
					x: start_x,
					y: start_y
				};
				$.each(transformations,function(i,t){
					point = t.reverse(point,
						(val('#current_frame') - 1) / (val('#count_frames') - 1)
					);
				});
				
				start_x_rel = point.x;
				start_y_rel = point.y;
				
				drag_function = modes[ $('#mode').val() ]({
					start_x: e.offsetX,
					start_y: e.offsetY,
					start_x_rel: point.x,
					start_y_rel: point.y
				});
			}
		});
		
		$('#canvas').on('mousemove',function(e){
			if ( ! dragging ) {
				return;
			}
			
			var point = {
				x: e.offsetX,
				y: e.offsetY
			};
			$.each(transformations,function(i,t){
				point = t.reverse(
					point,
					(val('#current_frame') - 1) / (val('#count_frames') - 1)
				);
			});
				
			drag_function({
				x: e.offsetX,
				y: e.offsetY,
				change_x: e.offsetX - start_x,
				change_y: e.offsetY - start_y,
				x_rel: point.x,
				y_rel: point.y,
				change_x_rel: point.x - start_x_rel,
				change_y_rel: point.y - start_y_rel
			});
			var t = current_transformation();
			t.save();
			draw();
		});
		
		$('#canvas').on('mouseleave, mouseup',function(){
			dragging = false;
		});		
	})();
	
	$('#count_frames').on('change',function(){
		$('#current_frame').attr('max',val('#count_frames'));
	});
	
	$('input, select').on('change',function(){
		var t = current_transformation();
		if ( t ) {
			t.save();
		}
		draw();
	});
	
	$('#download').on('click',function(e){
		context.resetTransform();
		context.clearRect(0,0,canvas.width,canvas.height);
		$(canvas).hide();
		e.preventDefault();
		var zip = new JSZip();
		
		var tree = $('#layers').jstree(true);
		tree.deselect_all();
		
		var promise = Promise.resolve();
		for (var i = 1; i <= val('#count_frames'); i++) {
			promise = promise.then(
				export_nodes.bind(this,'#',i,zip,"")
			);
		}		
		promise.then(function(){
			return zip.generateAsync({type:'blob'})
		})
		.then(function(content){
			saveAs(content,'frames.zip');
			$(canvas).show();
			draw();
		})
		.catch(function(error){
			console.log(error);
		});
	});
	
	function export_nodes(node,frame,zip,prefix) {
		var tree = $('#layers').jstree(true);
		context.save();
		
		if ( tree.get_text(node) ) {
			prefix = prefix + tree.get_text(node) + '/';
		}
		
		var promise = Promise.resolve();
		
		tree.get_children_dom(node).each(function(i,element){
			if ( ! tree.is_checked(element) ) {
				return
			}
			if ( tree.get_type(element) === 'transformation' ) {
				promise = promise.then(function(){
					data[
							tree.get_node(element).id
						]
						.transformation
						.apply(
							context,
							(frame - 1) / (val('#count_frames') - 1)
						);
					});
			} else {
				promise = promise.then(function(){
					return export_nodes(element,frame,zip,prefix);
				});
			}
		});
		
		if ( tree.get_type(node) === 'image' ) {
			var src_imgs = data[tree.get_node(node).id].src_imgs;
			promise = promise.then(function(){
				context.drawImage(
					src_imgs[frame % src_imgs.length],0,0
				);
				return new Promise(function(resolve,reject){
					canvas.toBlob(function(blob){
						var filename = prefix + 'frame' + ('000'+frame).slice(-4) + '.png';
						zip.file(
							filename,
							blob
						);
						context.save();
						context.resetTransform();
						context.clearRect(0,0,canvas.width,canvas.height);
						context.restore();
						
						context.restore();
						resolve();
					});
				});
			});
		} else {
			promise = promise.then(function(){
				context.restore();
			});
		}
		return promise;
	}
	
	function current_transformation() {
		var tree = $('#layers').jstree(true);
		var selection = tree.get_selected();
		if ( tree.get_type(selection[0]) === 'transformation' ) {
			return data[
				tree
				.get_node(selection[0])
				.id
			].transformation
		} else {
			return false
		}
	}
	
	function draw() {
		context.resetTransform();
		context.clearRect(0,0,canvas.width,canvas.height);
		context.save();
		
		var alpha;
		for (var i = 1; i <= val('#count_frames'); i++) {
			context.resetTransform();
			alpha = Math.pow(val('#alpha_fade'), Math.abs(val('#current_frame') - i));
			if ( i === 1 ) {
				alpha = Math.max(alpha,val('#alpha_start'));
			}
			if ( i === val('#count_frames') ) {
				alpha = Math.max(alpha,val('#alpha_end'));
			}
			context.globalAlpha = alpha;
		
			draw_node('#',i);
		}
		context.restore();
	}
	
	function draw_node(node,frame) {
		context.save();
		var tree = $('#layers').jstree(true);
		
		var show_origin = false;
		var origin_x, origin_y;
		
		tree.get_children_dom(node).each(function(i,element){
			if ( ! tree.is_checked(element) ) {
				return
			}
			if ( tree.get_type(element) === 'transformation' ) {
				var selection = tree.get_selected();
				
				var transformation = data[
						tree.get_node(element).id
					].transformation;
					
				if ( selection.length
					&&
					tree.get_node(selection[0]).id === tree.get_node(element).id
					&&
					frame === val('#current_frame')
					) {
					show_origin = true;
					origin_x = transformation.origin.x;
					origin_y = transformation.origin.y;
				}
				transformation
					.apply(
						context,
						(frame - 1) / (val('#count_frames') - 1)
					);
			} else {
				draw_node(element,frame);
			}
		});
		
		if ( tree.get_type(node) === 'image' ) {
			var src_imgs = data[tree.get_node(node).id].src_imgs;
			context.drawImage(
				src_imgs[frame % src_imgs.length],0,0
			);
		}
		if ( show_origin ) {
			context.save();
			context.globalAlpha = 1;
			context.strokeStyle = $('#origin_colour').val();
			context.strokeRect(
				origin_x - 1,
				origin_y - 1,
				3,
				3
			);
			context.restore();
		}
		context.restore();
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
});
