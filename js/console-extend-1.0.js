console.dump = function(obj) {
	console.log(Object.entries(obj).map(k=>({[k[0]]:k[1]})))
}