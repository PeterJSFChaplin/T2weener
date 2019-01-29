var easings = {
	'linear': function(i){
		return i;
	},
	'sine out': function(i){
		return Math.sin(i * Math.PI / 2);
	},
	'sine in': function(i){
		return 1 - Math.sin((1-i) * Math.PI / 2);
	},
  'sine in-out': function(i){
    return 0.5 + (0.5 * Math.cos((i+1) * Math.PI));
  },
  'cubic in': function(i){
    return i ^ 2;
  },
  'cubic out': function(i){
    return 1 - (1-i)^2;
  },
  'cubic in-out': function(i){
    if ( i < 0.5 ) {
      return i*i*2;
    } else {
      return 0.5 + 0.5 * (1 - (2-i*2)*(2-i*2));
    }
  },
  'circular in': function(i){
    return 1 - Math.sqrt(1-i^2);
  },
  'circular out':function(i){
    return Math.sqrt(1-((1-i)^2));
  }
};
