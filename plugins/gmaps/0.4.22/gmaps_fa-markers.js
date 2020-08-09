function faMarker(classes) {
	var icon	= document.createElement("i");
	icon.className = classes;
	document.body.appendChild(icon);
	var glyph	= window.getComputedStyle(icon,":before").getPropertyValue("content");
	var color	= window.getComputedStyle(icon).color;
	var size	= window.getComputedStyle(icon).fontSize || 20;
	document.body.removeChild(icon);
	size		= parseInt(size);

	glyph = glyph.charCodeAt(1).toString(16);

	var canvas, ctx;
	canvas = document.createElement("canvas");
	canvas.width = canvas.height = size;
	ctx = canvas.getContext("2d");
	ctx.fillStyle = color;

	ctx.font = size+"px Font Awesome 5 Pro";
	ctx.fillText(String.fromCharCode(parseInt(glyph, 16)), 0, size*.8);
	return canvas.toDataURL();
}