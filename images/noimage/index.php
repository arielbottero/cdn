<?php 


$sSizes = (isset($_GET["s"]) && !empty($_GET["s"])) ? $_GET["s"] : "640x480";
$aSizes = explode("x", $sSizes);
$nWith = $aSizes[0];
$nHeight = $aSizes[1];
$nFont = $nHeight*.1;
$nTop = ($nHeight - ($nFont*2)) / 2;

$SVG = <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" 
    xml:space="preserve" 
    width="{$nWith}px" 
    height="{$nHeight}px" 
    version="1.1" 
    style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
    viewBox="0 0 {$nWith} {$nHeight}"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xodm="http://www.corel.com/coreldraw/odm/2003"
>
	<rect x="0" y="0" width="100%" height="100%" fill="#F4F4F4"/>
	<text x="0" y="0" dominant-baseline="hanging" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" fill="#9F9F9F" font-size="{$nFont}">
		<tspan x="50%" y="{$nTop}">IMAGEN</tspan>
		<tspan x="50%" dy="{$nFont}">{$sSizes}</tspan>
	</text>
</svg>
SVG;

header("Content-type: image/svg+xml");
die($SVG);

?>