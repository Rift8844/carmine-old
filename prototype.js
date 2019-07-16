//Carmine prototype
//https://github.com/theultraman20/carmine
//By theultraman20, GNU General Public License

var bgNodeList = document.querySelectorAll(":not(html):not(script):not(link):not(title):not(meta)");
var textNodeList = getTextNodes();
var bgNodelen = bgNodeList.length;
var textNodeLen = textNodeList.length;
var colorDat, colorModProps, node;

function getTextNodes(){
  var n, a=[], walk=document.createTreeWalker(document.querySelector("body"),NodeFilter.SHOW_TEXT,null,false);
  while(n=walk.nextNode()) a.push(n);
  return a;
}
//big thanks to phrogz for this: https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page

function getColorData() {
    var allBgs = [];
    var allTextColors = [];
    var bgWeights = [];
    var bgWeightsOrdered = [];
    var elemGroups = [];
    var textGroups = [];
    var elemGroupsOrdered = [];//ordered by "weight" property
    var bg, textColor, style, oldBgWeights, weight, numBgs, index;

    for (var i = 0; i < bgNodelen; ++i) {
        node = bgNodeList[i];
        style = getComputedStyle(node);
        bg = style.getPropertyValue("background-color");
        weight = node.offsetWidth*node.offsetHeight;//calculate on-screen size

        //gather list of objects with same colors, and record data about their nodes
        if (bg && bg!="rgba(0, 0, 0, 0)") {//make sure it has a background element
            index = allBgs.indexOf(bg);
            if (index==-1) {
                index = allBgs.length;
                elemGroups[index] = [];
                allBgs.push(bg);
                bgWeights.push(0);
            };

            if (weight==weight) bgWeights[index] += weight;//make sure the weight isn't NaN
            elemGroups[index].push(node);
        };
    };

    for (var i = 0; i < textNodeLen; ++i) {
        node = textNodeList[i].parentElement;
        textColor = getComputedStyle(node).getPropertyValue("color");

        if (textColor != "") {
            index = allTextColors.indexOf(textColor);
            if (index==-1) {
                index = allTextColors.length;
                allTextColors.push(textColor);
                textGroups[index] = [];
            };
        
            textGroups[index].push(node);
        };
    }
    
    oldBgWeights = [...bgWeights];
    numBgs = bgWeights.length;
    for (var i = 0; i < numBgs; ++i) {
        bgWeightsOrdered.push(bgWeights.splice(bgWeights.indexOf(Math.max(...bgWeights)), 1)[0]);
    };
    
    for (var i = 0; i < numBgs; ++i) {
        elemGroupsOrdered[i] = elemGroups[oldBgWeights.indexOf(bgWeightsOrdered[i])];
    }

    return [elemGroupsOrdered, allBgs, textGroups, allTextColors]
};


/*color modification properties:
s: max change in saturation (0-1)
l: max change in light (0-1)
*/
function modColor(ogColor, desiredColor, colorModProps){
    var elemNewColors = [];
    var ogHsl, desiredHsl, newColor;
    
    //determine a list of new colors to be used
    //for (var i = 0; i < elemGroups.length; ++i) {
    ogHsl = tinycolor(ogColor).toHsl();//background hsl model
    desiredHsl = tinycolor(desiredColor).toHsl();//hsl model of colorList color
    newColor = desiredHsl;
        
        //create the new color saturation and light, but only within the specified range
    if (desiredHsl.s > ogHsl.s) {
        newColor.s = ogHsl.s+Math.min(colorModProps.s, desiredHsl.s-ogHsl.s);
    } else {
        newColor.s = ogHsl.s-Math.min(colorModProps.s, ogHsl.s-desiredHsl.s);
    };
    
    if (desiredHsl.l > ogHsl.l) {
        newColor.l = ogHsl.l+Math.min(colorModProps.l, desiredHsl.l-ogHsl.l);
    } else {
        newColor.l = ogHsl.l-Math.min(colorModProps.l, ogHsl.l-desiredHsl.l);
    };
    
    elemNewColors.push(tinycolor(newColor).toString());
    //};
    
    return elemNewColors;
};


/*
property weights:
{
h: 1,
s: 1,
l: 1,
etc...
}
*/
function getClosestColor(ogColorStr, colorList, colorPropWeights, colorUsageList) {//maybe add colorFormat option later?
    var ogColor = tinycolor(ogColorStr).toHsl();
    var numColors = colorList.length;
    var colorScores = [];
    var color, closestColor;
    
    for (var i = 0; i < numColors; ++i) {
        color = tinycolor(colorList[i]).toHsl();
        colorScores[i] = Math.abs(ogColor.h-color.h)*colorPropWeights.h+Math.abs(ogColor.s-color.s)*colorPropWeights.s+Math.abs(ogColor.l-color.l)*colorPropWeights.l+colorUsageList[i]*colorPropWeights.count;//make sure colors aren't overused!
    };

    closestColor = colorList[colorScores.indexOf(Math.min(...colorScores))];
    
    return closestColor;
};

function getBestTextColor(textNode){
    //todo
};

//MAIN FUNCTION------------------------------------------------------

function themePage(elemGroups, bgs, colorList, colorModProps, colorPropWeights) {
    var numColors = colorList.length;
    var elemNewColors = [];
    var colorUsageList = Array(numColors).fill(0);
    var closestColor, finalColor;

    for (var i = 0; i < elemGroups.length; ++i) {
        closestColor = getClosestColor(bgs[i], colorList, colorPropWeights, colorUsageList);
        elemNewColors[i] = modColor(bgs[i], colorList[i], colorModProps);
        colorUsageList[colorList.indexOf(closestColor)]++;
    };
    
    //set elements to their new colors
    for (var i = 0; i < elemGroups.length; ++i) {
        for (var j = 0; j < elemGroups[i].length; ++j) {
            elemGroups[i][j].style.backgroundColor = elemNewColors[i];
        };
    };

};

//-------------------------------------------------------------------------------
colorData = getColorData();

colorModProps = {
    s: 0.8,
    l: 0.2
};
/*
How much flexibility the color changing 
algorithm has when changing properties
of the colors. Can be 0-1. 
*/
colorPropWeights = {
    h: 4, 
    s: 1, 
    l: 1, 
    count: 1
};
/*
How much each property matters when
trying to find the closest theme color to 
another color on the web page. The "count"
variable will lower the chances of a color
being chosen, to prevent theme colors from
being overused.
*/

themePage(colorData[0], colorData[1], ["red", "blue", "yellow"], colorModProps, colorPropWeights);//Like Starboy!
