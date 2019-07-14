var nodeList = document.querySelectorAll(":not(html):not(script):not(link):not(title):not(meta):not(header)");
var len = nodeList.length;
var allBgs = [];
var bgWeights = [];
var elemGroups = [];
var node;
var bg;
var style;
var weight;
var index;
var j;

for (var i = 0; i < len; ++i) {
	node = nodeList[i];
	style = getComputedStyle(node);
	bg = style.getPropertyValue("background-color");
	weight = node.offsetWidth*node.offsetHeight;

	if (bg && bg!="rgba(0, 0, 0, 0)") {
		index = allBgs.indexOf(bg);
		if (index==-1) {
			index = allBgs.length;
			elemGroups[index] = [];
			allBgs.push(bg);
			bgWeights.push(0);
        };
		
		if (weight==weight) bgWeights[index] += weight;
		elemGroups[index].push(node);
	};
};
