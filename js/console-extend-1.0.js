console.dump = function(obj, stringify) {
	if(!stringify) {
		console.log(Object.entries(obj).map(k=>({[k[0]]:k[1]})))
	} else {
		console.log(JSON.stringify(obj, null,'\t'));
	}
}