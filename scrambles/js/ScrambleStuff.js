//generated from http://ajaxload.info/
WAITING_ICON = 'ajax-loader.gif';

//LOADING_IMAGE = WAITING_ICON;
//from http://en.wikipedia.org/wiki/Data_URI_scheme
LOADING_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg==";

function isInteger(s) {
	return s.toString().match(/^-?[0-9]+$/);
}

function deleteChildren(element) {
    while(element.firstChild)
        element.removeChild(element.firstChild);
}
function parsePx(px) {
    return parseInt(px.replace(/px/g, ""));
}
function isOrIsChild(el, parent) {
	while(el != null) {
		if(el == parent)
			return true;
		el = el.parentNode;
	}
	return false;
}
//returns a shallow copy of obj
function clone(obj) {
    var o = {};
    for(var k in obj)
        o[k] = obj[k];
    return o;
}

/*** START IE hacks ***/
//from http://snipplr.com/view.php?codeview&id=13523
if(!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
            var re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
                prop = prop.replace(re, function () {
                    return arguments[2].toUpperCase();
                });
            }
            return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        }
        return this;
    }
}
if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.match(/\s*(\S*)\s*/)[1];
	};
}
function addListener(obj, event, func, useCapture) {
	if(obj.addEventListener) {
		obj.addEventListener(event, func, useCapture);
	} else {
		obj.attachEvent('on'+event, function(e) { func.call(obj, e); });
	}
}
/*** END IE HACKS ***/


function ScrambleStuff() {

var puzzle = null;
var colorScheme = null;
var defaultColorScheme = null;

function puzzleChanged() {
	if(importedScrambles) {
		if(confirm("Since you're switching puzzles, would you like to clear the currently imported scrambles?")) {
			importedScrambles = null;
		} else {
			scrambleIndex--;
		}
	}
    var newPuzzle = puzzleSelect.options[puzzleSelect.selectedIndex].value;
    if(newPuzzle == "null") { //puzzles haven't loaded yet
    	puzzle = null; //this probably isn't necessary
    	return;
	}
    
    colorScheme = null; //reset colorscheme
    currTurn = null;
    faceMap = null; //this indicates if the current puzzle support images
    puzzle = newPuzzle;
    scrambleImg.clear();

    scrambler.loadPuzzleImageInfo(function(puzzleImageInfo) {
    	if(puzzleImageInfo.error) {
    		faceMap = null; //scramble images are not supported
    		scrambleDiv.setVisible(false, false);
    	} else {
    		faceMap = puzzleImageInfo.faces;
    		colorScheme = colorScheme || puzzleImageInfo.colorScheme;
    		defaultColorScheme = clone(puzzleImageInfo.colorScheme);

    		scrambleDivDD.minw = puzzleImageInfo.size.width;
    		scrambleDivDD.minh = puzzleImageInfo.size.height;
    		scrambleDivDD.paddingVert = getScrambleVertPadding();
    		scrambleDivDD.paddingHorz = getScrambleHorzPadding();
    		scrambleDiv.style.width = puzzleImageInfo.size.width + getScrambleHorzPadding() + "px";
    		scrambleDiv.style.height = puzzleImageInfo.size.height + getScrambleVertPadding() + "px";
    		scrambleResized();
    	}
    	scramble();
    }, puzzle);
    
}

var scrambleChooser = document.createElement('input');
scrambleChooser.setAttribute('type', 'number');
scrambleChooser.setAttribute('min', 1);
scrambleChooser.setAttribute('step', 1);
addListener(scrambleChooser, 'change', function() {
	if(!isInteger(this.value) || this.value < 1 || this.value > importedScrambles.length) {
		this.value = scrambleIndex;
	} else {
		scrambleIndex = this.value-1;
		scramble();
	}
}, false);
function scramble() {
	if(puzzle == null) return;
	deleteChildren(scramblePre);

	if(importedScrambles && scrambleIndex >= importedScrambles.length) {
		alert("That was the last imported scramble, switching back to generated scrambles.");
		scrambleIndex = 0;
		scrambleSrc = null;
		importedScrambles = null;
	}
	
	if(importedScrambles == null) {
		deleteChildren(scrambleInfo);
		
		scramblePre.appendChild(document.createTextNode('Loading scramble...'));
		scrambler.loadScramble(scrambleLoaded, puzzle, null);
	} else {
		deleteChildren(scrambleInfo);
		scrambleInfo.appendChild(document.createTextNode("Scramble ("));
		scrambleChooser.setAttribute('max', importedScrambles.length);
		scrambleChooser.setAttribute('size', 1+Math.floor(Math.log(importedScrambles.length)/Math.log(10)));
		scrambleChooser.value = (scrambleIndex+1);
		scrambleInfo.appendChild(scrambleChooser);
		scrambleInfo.appendChild(document.createTextNode("/" + importedScrambles.length + ")"));
		if(scrambleSrc) {
			scrambleInfo.appendChild(document.createTextNode(" from "));
			scrambleInfo.appendChild(scrambleSrc);
		}
		
		scrambleLoaded(importedScrambles[scrambleIndex]);
		scrambleIndex++;
	}
}
function turnClicked(userInvoked) {
    if(isChangingColorScheme) {
        // first, we cancel editing of the colorscheme
        changeColorsClicked.call(changeColors);
    }
    if(currTurn)
        currTurn.className = 'turn';
    currTurn = this;
    currTurn.className = 'currTurn';
    scrambleDiv.setVisible(true, userInvoked);
    scrambleImg.drawScramble(currTurn.incrementalScramble);
}
function scrambleLoaded(scramble) {
    deleteChildren(scramblePre);
    if(!faceMap) {
    	//scramble images are not supported, so don't bother with links
    	scramblePre.appendChild(document.createTextNode(scramble));
    	return;
    }
    var turns = scramble.split(' ');
    var incrementalScramble = "";
    for(var i = 0; i < turns.length; i++) {
        var turn = turns[i];
        incrementalScramble += turn;
        var turnLink = document.createElement('span');
        turnLink.appendChild(document.createTextNode(turn));
        turnLink.incrementalScramble = incrementalScramble;
        turnLink.className = 'turn';
        addListener(turnLink, 'click', function() { turnClicked.call(this, true); }, false);
        scramblePre.appendChild(turnLink);
        if(i == turns.length-1) {
            turnClicked.call(turnLink, false);
        } else {
            incrementalScramble += " ";
            scramblePre.appendChild(document.createTextNode(' '));
        }
    }
}

var currFaceName = null;
function faceClicked() {
    currFaceName = this.faceName;
    colorChooserDiv.style.display = 'inline';
    colorChooser.setDefaultColor(colorScheme[currFaceName]);
    deleteChildren(colorChooserHeaderText);
    colorChooserHeaderText.appendChild(document.createTextNode('Editing face ' + currFaceName));
}

function getScrambleVertPadding() {
    //var headerStyle = window.getComputedStyle(scrambleDivHeader, null);
    //var scrambleHeader = parsePx(headerStyle.getPropertyValue("height")) + parsePx(headerStyle.getPropertyValue("border-bottom-width"));
    var scrambleHeader = 20; //apprently dynamically computing this doesn't work on opera
    var scrambleStyle = window.getComputedStyle(scrambleImg, null);
    return parsePx(scrambleStyle.getPropertyValue("padding-top")) + parsePx(scrambleStyle.getPropertyValue("padding-bottom")) + scrambleHeader;
}
function getScrambleHorzPadding() {
    var scrambleStyle = window.getComputedStyle(scrambleImg, null);
    return parsePx(scrambleStyle.getPropertyValue("padding-left")) + parsePx(scrambleStyle.getPropertyValue("padding-right"));
}

function scrambleResized() {
    var imgWidth = parsePx(scrambleDiv.style.width) - getScrambleHorzPadding();
    scrambleImg.style.width = imgWidth + "px";
    scrambleImg.style.height = parsePx(scrambleDiv.style.height) - getScrambleVertPadding() + "px";
    deleteChildren(scrambleImgMap);
    if(isChangingColorScheme) {
        //TODO - only do the following when we're *done* resizing
        var scale = imgWidth / scrambleDivDD.minw;
        var areas = tnoodle.scrambles.createAreas(faceMap, scale);
        for(var i = 0; i < areas.length; i++) {
            var area = areas[i];
            area.setAttribute('alt', area.faceName);
            addListener(area, 'click', faceClicked, false);

            addListener(area, 'mouseover', function() { deleteChildren(scrambleHeaderText); scrambleHeaderText.appendChild(document.createTextNode(this.faceName)); }, false);
            addListener(area, 'mouseout', function() { deleteChildren(scrambleHeaderText); }, false);
            scrambleImgMap.appendChild(area);
        }
    }
}

function changeColorsClicked() {
    isChangingColorScheme = !isChangingColorScheme;
    if(isChangingColorScheme) {
        if(currTurn)
            currTurn.className = "turn";
        this.className += " buttondown";
        resetColorScheme.style.display = 'inline';
        scrambleImg.drawScramble("");
    } else {
        if(currTurn) //curr turn will not be defined if we just changed puzzles
            turnClicked.call(currTurn);
        this.className = this.className.replace(/\bbuttondown\b/, "");
        colorChooserDiv.style.display = 'none'; //close cholor chooser window
        resetColorScheme.style.display = 'none';
    }
    scrambleResized(); //force image area map to be created
}

function puzzlesLoaded(puzzles) {
	deleteChildren(scramblePre);
    puzzleSelect.disabled = false;
    puzzleSelect.options.length = puzzles.length;
    for(var i = 0; i < puzzles.length; i++) {
        puzzleSelect.options[i] = new Option(puzzles[i][1], puzzles[i][0]);
    }
    
    //TODO - load selected puzzle
    puzzleSelect.value = '3x3x3';
    puzzleChanged();
}

var scrambleIndex = 0;
var importedScrambles = null;
function scramblesImported(scrambles) {
	newScrambles.value = scrambles.error || scrambles.join("\n");
	importButton.update();
	waitingIcon.style.display = 'none';
}


var currImportLink = null;
function setCurrImportLink(newLink) {
	scrambleSrc = null;
	if(currImportLink == newLink)
		newLink = null;
	if(currImportLink)
		currImportLink.className = currImportLink.className.replace(/\bdown\b/, '');
	if(newLink) {
		newLink.className += ' down';
		importDiv.style.display = 'inline';
	} else {
		importDiv.style.display = 'none';
	}
	currImportLink = newLink;
	
	newScrambles.value = '';
}

var scrambleSrc = null;

var urlForm = null;
var urlText = null;
var DEFAULT_URL = "http://nascarjon.us/sunday.txt";
function promptImportUrl() {
	setCurrImportLink(this);
	if(urlForm == null) { //pretty much copied from promptSeed()
		urlForm = document.createElement('span');
		urlText = document.createElement('input');
		urlText.value = DEFAULT_URL;
		urlText.type = 'text';
		urlText.style.width = '200px';
		addListener(urlText, 'input', function(e) {
			loadScramblesButton.disabled = this.value.length == 0; 
		}, false);
		var loadScramblesButton = document.createElement('input');
		loadScramblesButton.type = 'button';
		loadScramblesButton.value = 'Load Scrambles';
		addListener(loadScramblesButton, 'click', function() {
			var url = urlText.value;
			scrambleSrc = document.createElement('a');
			scrambleSrc.href = url;
			scrambleSrc.target = '_blank';
			scrambleSrc.appendChild(document.createTextNode(url));
			waitingIcon.style.display = 'inline';
			
			scrambler.importScrambles(scramblesImported, url);
		}, false);
		
		urlForm.appendChild(urlText);
		urlForm.appendChild(loadScramblesButton);
	}
	deleteChildren(importArea);
	importArea.appendChild(urlForm);
}

var uploadForm = null;
function promptImportFile() {
	setCurrImportLink(this);
	if(uploadForm == null) {
		function scramblesRequested(fileName) {
    		scrambleSrc = document.createElement('span');
    		var em = document.createElement('em');
    		em.appendChild(document.createTextNode(fileName));
    		scrambleSrc.appendChild(em);
    		
    		waitingIcon.style.display = 'inline';
    	}
		uploadForm = scrambler.getUploadForm(scramblesRequested, scramblesImported);
	}
	deleteChildren(importArea);
	importArea.appendChild(uploadForm);
}

var seedForm = null;
var seedText = null;
var scrambleCount = 5; //TODO make this an option
function promptSeed() {
	setCurrImportLink(this);
	if(seedForm == null) {
		seedForm = document.createElement('span');
		seedText = document.createElement('input');
		seedText.type = 'text';
		seedText.style.width = '200px'; //TODO - urgghhh!
		var loadScramblesButton = document.createElement('input');
		loadScramblesButton.type = 'button';
		loadScramblesButton.value = 'Seed Scrambles';
		addListener(loadScramblesButton, 'click', function() {
			var seed = seedText.value;
			scrambleSrc = document.createElement('span');
			scrambleSrc.appendChild(document.createTextNode("seed "));
			var linky = document.createElement('em');
			linky.appendChild(document.createTextNode(seed));
			scrambleSrc.appendChild(linky);

    		waitingIcon.style.display = 'inline';
			
			scrambler.loadScrambles(scramblesImported, puzzle, seed, scrambleCount);
		}, false);
		
		seedForm.appendChild(seedText);
		seedForm.appendChild(loadScramblesButton);
	}
	deleteChildren(importArea);
	importArea.appendChild(seedForm);

	//TODO - generate random seed? sounds fun =)
	seedText.value = 'randomnessss'; 
}

    var isChangingColorScheme = false;

    var dragDrop = new DragDrop();

    var scrambleArea = document.createElement('div');
    scrambleArea.className = 'scrambleArea';
    
	    var importDiv = document.createElement('div');
	    importDiv.className = 'importDiv';
	    scrambleArea.appendChild(importDiv);
	    importDiv.style.display = 'none';
	    
	    	var tempDiv = document.createElement('div');
	    	importDiv.appendChild(tempDiv);
	    	
	    	var importArea = document.createElement('span');
	    	tempDiv.appendChild(importArea);
	    	
	    	var waitingIcon = document.createElement('img');
	    	waitingIcon.src = WAITING_ICON;
	    	waitingIcon.style.display = 'none';
	    	waitingIcon.style.cssFloat = waitingIcon.style.styleFloat = 'right';
	    	tempDiv.appendChild(waitingIcon);
	    	
		    var newScrambles = document.createElement('textarea');
		    newScrambles.setAttribute('wrap', 'off');
		    newScrambles.rows = 10;
		    newScrambles.cols = 50;
		    newScrambles.getScrambles = function() {
		    	var scrambles = newScrambles.value.split('\n');
		    	for(var i = scrambles.length-1; i >= 0; i--) {
		    		if(scrambles[i].trim().length == 0) {
		    			scrambles.splice(i, 1); //remove all empty rows
		    		}
		    	}
		    	return scrambles;
		    };
		    importDiv.appendChild(newScrambles);
		    
		    var tempDiv = document.createElement('div');
		    tempDiv.style.textAlign = 'right';
		    importDiv.appendChild(tempDiv);
		    
		    var importButton = document.createElement('input');
		    importButton.type = 'button';
		    importButton.update = function() {
		    	var scrambles = newScrambles.getScrambles();
		    	importButton.value = 'Import';
		    	if(scrambles.length > 0)
		    		importButton.value += ' ' + scrambles.length + " scramble(s)";
		    	importButton.disabled = scrambles.length == 0;
		    };
		    importButton.update();
		    
		    addListener(newScrambles, 'input', function(e) { importButton.update(); });
		    addListener(importButton, 'click', function() {
		    	//TODO - disable button based on what's in the text area
		    	var scrambles = newScrambles.getScrambles();
		    	if(scrambles.length > 0) {
		    		importedScrambles = scrambles;
		    		scrambleIndex = 0;
		    		scramble();
		    		setCurrImportLink(null);
		    	}
		    }, false);
		    tempDiv.appendChild(importButton);
		    
		    var cancelImportButton = document.createElement('input');
		    cancelImportButton.type = 'button';
		    cancelImportButton.value = 'Cancel';
		    addListener(cancelImportButton, 'click', function() { setCurrImportLink(null); });
		    tempDiv.appendChild(cancelImportButton);
	    
    	var scrambleHeader = document.createElement('div');
    	scrambleHeader.className = 'scrambleHeader';
    	scrambleArea.appendChild(scrambleHeader);
    	
    	var importUrlLink = document.createElement('span');
    	importUrlLink.title = "Import scrambles from url";
    	importUrlLink.className = 'link';
    	addListener(importUrlLink, 'click', promptImportUrl, false);
    	importUrlLink.appendChild(document.createTextNode('From Url'));
    	scrambleHeader.appendChild(importUrlLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var importFileLink = document.createElement('span');
    	importFileLink.title = "Import scrambles from file";
    	importFileLink.className = 'link';
    	addListener(importFileLink, 'click', promptImportFile, false);
    	importFileLink.appendChild(document.createTextNode('From File'));
    	scrambleHeader.appendChild(importFileLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var seedLink = document.createElement('span');
    	seedLink.title = "Generate scrambles from a seed, perfect for racing!";
    	seedLink.className = 'link';
    	addListener(seedLink, 'click', promptSeed, false);
    	seedLink.appendChild(document.createTextNode('Seed'));
    	scrambleHeader.appendChild(seedLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	var newScrambleLink = document.createElement('span');
    	newScrambleLink.title = "Clear whatever may be imported and get a new scramble.";
    	newScrambleLink.className = 'link';
    	addListener(newScrambleLink, 'click', function() {
    		if(!importedScrambles || confirm('This will clear any imported scrambles, are you sure you want to continue?')) {
    			importedScrambles = null;
    			setCurrImportLink(null);
    			scramble();
    		}
    	}, false);
    	newScrambleLink.appendChild(document.createTextNode('New Scramble'));
    	scrambleHeader.appendChild(newScrambleLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	
    	addListener(document, 'click', function(e) {
    		if(!e.target) e.target = e.srcElement; //freaking ie, man
    		var clz = e.target.className;
    		if(clz.match(/\blink\b/) || clz.match(/\btitlebar\b/)) //kinda hacky, but should work
    			return;
    		if(!isOrIsChild(e.target, importDiv))
    			setCurrImportLink(null);
    	});
    	
    	/* TODO use something like zero copy here? or do what google maps does and popup a selected text box?
    	var copyLink = document.createElement('span');
    	copyLink.className = 'link';
    	addListener(copyLink, 'click', function() { console.log(this); }, false);
    	copyLink.appendChild(document.createTextNode('Copy'));
    	scrambleHeader.appendChild(copyLink);
    	scrambleHeader.appendChild(document.createTextNode(' '));
    	*/
    	
    	var scrambleInfo = document.createElement('span');
    	scrambleHeader.appendChild(scrambleInfo);
    	
	    var scramblePre = document.createElement('pre');
	    scrambleArea.appendChild(scramblePre);
	
    var scrambleDiv = document.createElement('div');
    scrambleDiv.style.display = 'none'; //this has to be after the element is set draggable
	scrambleDiv.className = 'window';
	document.body.appendChild(scrambleDiv);

		var scrambleDivHeader = document.createElement("div");
		scrambleDivHeader.className = 'titlebar';
		scrambleDiv.appendChild(scrambleDivHeader);
		scrambleDiv.id = 'scrambleDiv'; //have to have an id to make it draggable
		scrambleDiv.visibleIfPossible = true;
		scrambleDiv.setVisible = function(visible, userInvoked) {
			if(userInvoked)
				this.visibleIfPossible = visible;
			else
				visible &= this.visibleIfPossible;
			if(visible) {
				scrambleDiv.style.display = 'inline';
			} else {
				if(currTurn)
					currTurn.className = 'turn';
				scrambleDiv.style.display = 'none';
				colorChooserDiv.style.display = 'none';
			}
		};
		
			var scrambleHeaderText = document.createElement("span");
			scrambleHeaderText.className = 'titletext';
			scrambleDivHeader.appendChild(scrambleHeaderText);
			
			var resetColorScheme = document.createElement('span');
			resetColorScheme.appendChild(document.createTextNode('*'));
			resetColorScheme.setAttribute('title', 'Reset color scheme');
			resetColorScheme.className = 'button';
			resetColorScheme.style.display = 'none';
			addListener(resetColorScheme, 'click', function() {
				if(confirm("Reset the color scheme?")) {
					colorScheme = clone(defaultColorScheme);
					scrambleImg.redraw();
				}
			}, false);
			scrambleDivHeader.appendChild(resetColorScheme);
			
			var changeColors = document.createElement('span');
			changeColors.className = 'button';
			changeColors.setAttribute('title', 'Change color scheme');
			changeColors.appendChild(document.createTextNode('#'));
			addListener(changeColors, 'click', changeColorsClicked, false);
			scrambleDivHeader.appendChild(changeColors);
			
			var closeScramble = document.createElement('span');
			closeScramble.appendChild(document.createTextNode('X'));
			closeScramble.className = 'button';
			addListener(closeScramble, 'click', function() { scrambleDiv.setVisible(false, true); }, false);
			scrambleDivHeader.appendChild(closeScramble);
		//end scrambleDivHeader

		var scrambleImg = document.createElement('img');
		scrambleImg.setAttribute('usemap', '#scrambleImgMap');
		scrambleDiv.appendChild(scrambleImg);
		
		scrambleImg.scramble = null;
		scrambleImg.redraw = function() {
		    this.drawScramble(this.scramble);
		};
		scrambleImg.drawScramble = function(scramble) {
		    this.scramble = scramble;
		    if(scrambleDiv.style.display != 'none') { //no need to waste bandwidth unless we're actually displaying images
		    	this.clear(); //since the next image may take a while to load, we place this one first
			    this.src = scrambler.getScrambleImageUrl(puzzle, scramble, colorScheme);
		    }
		}
		scrambleImg.clear = function() {
			this.src = LOADING_IMAGE;
		}
		
		var scrambleImgMap = document.createElement('map');
		scrambleImgMap.setAttribute('name', 'scrambleImgMap');
		scrambleDiv.appendChild(scrambleImgMap);
		
		var resizeDiv = document.createElement('div');
		resizeDiv.className = "dragresize dragresize-br";
		scrambleDiv.appendChild(resizeDiv);
	//end scrambleDiv
    var scrambleDivDD = dragDrop.createDraggable(RESET_Z, SCALABLE, scrambleDiv.id);
    scrambleDivDD.resizeFunc = scrambleResized;

    var puzzleSelect = document.createElement('select');
    puzzleSelect.onchange = puzzleChanged; //for some reason, the change event doesn't fire until the select loses focus
    puzzleSelect.disabled = true;

    var colorChooserDiv = document.createElement('div');
	colorChooserDiv.id = 'colorChooserDiv'; // need an id to make it draggable
	colorChooserDiv.className = 'window';
	colorChooserDiv.style.zIndex = 1;
	document.body.appendChild(colorChooserDiv);
		var titlebar = document.createElement('div');
		titlebar.className = 'titlebar';
		colorChooserDiv.appendChild(titlebar);
			var colorChooserHeaderText = document.createElement('span');
			colorChooserHeaderText.className = 'titletext';
			titlebar.appendChild(colorChooserHeaderText);
			
			var closeColorChooser = document.createElement('span');
			closeColorChooser.className = "button";
			closeColorChooser.appendChild(document.createTextNode('X'));
			addListener(closeColorChooser, 'click', function() {
				colorChooserDiv.style.display = 'none';
			}, false);
			titlebar.appendChild(closeColorChooser);
		//end titlebar
		var colorChooser = new ColorChooser(function(newColor) {
			colorScheme[currFaceName] = newColor;
			colorChooserDiv.style.display = 'none';
			scrambleImg.redraw();
		});
		colorChooserDiv.appendChild(colorChooser.element);
	//end colorChooserDiv
	
    var colorChooserDD = dragDrop.createDraggable(RESET_Z, colorChooserDiv.id);
    colorChooserDiv.style.width = colorChooser.preferredWidth + 'px';
    colorChooserDiv.style.height = colorChooser.preferredHeight + 'px';
    colorChooserDiv.style.display = 'none';

    var scrambler = new tnoodle.scrambles.server('localhost', 8080);
//	var scrambler = new tnoodle.scrambles.applet(puzzlesLoaded);
    scramblePre.appendChild(document.createTextNode('Connecting to ' + scrambler.toString() + "..."));
    scrambler.connect(puzzlesLoaded);
    
	// public variables
	this.puzzleSelect = puzzleSelect;
	this.scrambleArea = scrambleArea;
	
	// public methods
	this.scramble = scramble;
	this.getSelectedPuzzle = function() {
		return puzzle;
	}
}
