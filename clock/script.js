// Create a clock constructor
function AnalogClock(hrhand, minhand, sechand, initAction ) {
    this.hrhand = hrhand;
    this.minhand = minhand;
    this.sechand = sechand;
    this.lastTick = new Date();
    this.tickAction = initAction;
    this.tickSeconds = 1;

    this.storedPos = new Array();

    this.calculatePosition = function( timeArray ) {
        // Convert [ hr, min, sec ] to an array of 3 sets of degrees
        var hrPosition = timeArray[0]*(360/12)+(timeArray[1]*(360/60)/12);
        var minPosition = timeArray[1]*(360/60)+(timeArray[2]*(360/60)/60);
        var secPosition = timeArray[2]*(360/60);    

        return( [ hrPosition, minPosition, secPosition ] );
    }

    this.cLog = function( logString, targetLevel ) {
        // Send logs of or relating to the clock object

        // Check for log level
        if ( logLevel >= targetLevel ) {
            // Prepend additional information
            console.log( "Clock: " + logString );
        }
    }


    this.getTime = function() {
        // What time is it Mr. Wolf?
        let date = new Date();

        let hr = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        // Remember that hours are on a 24-hour clock, so correct for pm
        if ( hr > 12 ) {
            hr -= 12;
        }

        return ( [ hr, min, sec ] );
    }

    this.initialize = function() {
        // Set up the clock

        // Snap to current time
        this.snapToNow();

        // Set current digital time
        this.updateDigitalTime();
    }

    this.intervalHandler = function() {
        // This is the function that interprets what a tick should do and redirects to the appropriate function

        // Call appropriate function based on the current tickAction
        switch( this.tickAction ) {
            case "random":
                this.randomTick();
                break;
            case "snap":
                this.styleChange( "linear", "1ms" );
                this.tick();
                break;
            case "sweep":
                this.styleChange( "linear", "1s" ); 
                this.tick();
                break;
            case "tick":
                this.styleChange( "ease-in-out", "0.5s" );
                this.tick();
                break;
            default:
                this.cLog( "Oops! intervalHandler doesn't know how to " + this.tickAction, 0 );
        }
    }

    this.moveHands = function( positionArray ) {
        // Move the hands based on the positionArray
        this.hrhand.style.transform = "rotate(" + positionArray[0] + "deg)";
        this.minhand.style.transform = "rotate(" + positionArray[1] + "deg)";
        this.sechand.style.transform = "rotate(" + positionArray[2] + "deg)";

        // Store the new positions on the object for future use
        this.storedPos = ( positionArray );

        // Log the new position
        this.cLog( "Moved to Position: " + positionArray, 2 );
    }

    this.randomTick = function() {
        // Set random time and display it.
        let hrPosition = (Math.random()*360);
        let minPosition = (Math.random()*360);
        let secPosition = (Math.random()*360);

        this.moveHands( [ hrPosition, minPosition, secPosition ] )

        this.cLog( "random tick", 1 );
    }

    this.snapToNow = function() {
        // Get the time and show it. Be snappy.

        // Grab the time
        var timeArray = this.getTime();

        // Calculate the positions required
        var positionArray = this.calculatePosition( timeArray );

        // Make the hands move instantly, then move them; the tickAction will then reset the animation style in intervalHandler
        this.styleChange( "linear", "1ms" );
        this.moveHands( positionArray );
    }

    this.styleChange = function( tickType, tickDuration ) {
        // Change the CSS to make an ease-in / ease-out ticking motion.
        this.hrhand.style.transitionTimingFunction = tickType;
        this.hrhand.style.transitionDuration = tickDuration;
        this.minhand.style.transitionTimingFunction = tickType;
        this.minhand.style.transitionDuration = tickDuration;
        this.sechand.style.transitionTimingFunction = tickType;
        this.sechand.style.transitionDuration = tickDuration;
    }

    this.tick = function() {
        // Increase the time by tickSeconds in seconds and animate it

        // Define some local variables to simplify the manipulation
        var currentHrPos = this.storedPos[0];
        var currentMinPos = this.storedPos[1];
        var currentSecPos = this.storedPos[2];

        // How far do each of these move per second?
        currentHrPos = currentHrPos+(((360/60)/60/12)*this.tickSeconds);
        currentMinPos = currentMinPos+(((360/60)/60)*this.tickSeconds);
        currentSecPos = currentSecPos+(((360/60))*this.tickSeconds);

        // Move the hands
        this.moveHands( [ currentHrPos, currentMinPos, currentSecPos ] );

        this.cLog( "tick: advance " + this.tickSeconds + " sec", 2 );
    }

    this.testMethod = function(testStr) {
        // Is this thing on??? Send the testStr to the log at any (non-negative) loglevel
        this.cLog( testStr, 0 );
    }

    this.updateDigitalTime = function() {
        // Set up some variables
        let date = new Date();
        let timeP = document.querySelector("#timeText");
        let hr = date.getHours();
        let min = date.getMinutes();
        let ampm = "(24h)";

        // Are we on a 24 hour clock? If no, do 12-hour adjustments. If no, don't worry about it. Set ampm to "" first though.
        if ( !digitalText.twentyFour ) {
            // Check to see if we are over 12 hours and set stuff up appropriately if we are/n't. Default is am initially.
            ampm = "am";
            if ( hr > 12 ) {
                // Drop by 12 and call it pm
                hr -= 12;
                ampm = "pm";
            } else if ( hr == 12 ) {
                // Just make it pm
                ampm = "pm";
            } else if ( hr == 0 ) {
                // Make it 12 and am
                hr = 12;
            }  
        }

        // Compose our string
        let newText = twoDigit(hr) + ":" + twoDigit(min) + " " + ampm;

        timeP.textContent = newText;
    }
}


/* ----------DIGITAL TEXT OBJECT & FUNCTIONS
----------------------------------------------------------*/

var digitalDisplayBox = document.querySelector("#digitalDisplay");

var digitalText = new Object();
    digitalText.elements = new Array();
    digitalText.elements = document.querySelectorAll(".digitalText");
    digitalText.isDisplayed = true;
    digitalText.twentyFour = false;
    digitalText.setColour = function( col ) {
        // Decide if we are hidden or not. If we are, update col to background color
        if ( !this.isDisplayed ) {
            col = colourScheme.bg;
        }

        // Iterate through the elements and set their color
        for ( i = 0; i < digitalText.elements.length; i++ ) {
            digitalText.elements[i].style.color = col;
        }

        // Also update the border colour
        digitalDisplayBox.style.borderColor = col;   
    }
    digitalText.toggleDisplay = function() {
        // Show or hide the digital clock display

         // First, tiggle the .isDisplayed value
        digitalText.isDisplayed = !digitalText.isDisplayed;

        // Now set the colour to the foreground--the setColour logic will determine if background color is needed instead
        this.setColour( colourScheme.fg );
    }



/* --------------BUTTON BAR FUNCTIONALITY
----------------------------------------------------------*/

function barConstructor( myID, myFg, myBg, myIsShown ) {
    this.element = document.querySelector(myID);
    this.isShown = myIsShown;
    this.fg = myFg;
    this.bg = myBg;
    this.buttonList = document.querySelectorAll(myID + " .functionbutton");
    this.arrowButton = document.querySelector(myID + " .arrow");

    this.setColour = function ( fgCol, bgCol ) {
        // We've been asked to set our colours. First, some variables:
        let newFg = fgCol;

        // Store the new information for future reference
        this.fg = fgCol;
        this.bg = bgCol;

        // Determine if we are hidden or not; if we are, then change our new colours appropriately
        if ( !this.isShown ) {
            // We are currently hidden, so we'll use background colours in a lot of places, actually
            newFg = bgCol;
        }

        // Set text and background colours; we'll use foreground for border regardless
        this.element.style.color = newFg;
        this.element.style.backgroundColor = bgCol;
        this.element.style.borderColor = fgCol;

        // Change our arrow-button colour; we'll use foreground colour regardless
        this.arrowButton.style.color = fgCol;
        this.arrowButton.style.borderColor = fgCol;
        this.arrowButton.style.backgroundColor = bgCol;

        // Change our functionbutton colours, respecting the hidden colour value for the text (but not borders)
        for ( i = 0; i < this.buttonList.length; i++ ) {
            this.buttonList[i].style.color = newFg;
            this.buttonList[i].style.borderColor = fgCol;
            this.buttonList[i].style.background = bgCol;
        }
    }

    this.toggle = function() {
        // Show or hide the button bar on the left
        if ( this.isShown ) {
            // It is currently shown, so hide it!
            this.element.classList.add("barclosed");
            this.isShown = false;

            // Also change text colours to hide text
            this.element.style.color = this.bg;

            // Also make buttons shrink and text go away
            for ( i = 0; i < this.buttonList.length; i++) {
                this.buttonList[i].classList.add("buttonreduced");
                this.buttonList[i].style.color = this.bg;
            }
        } else {
            // It is currently hidden, so show it!
            this.element.classList.remove("barclosed");
            this.isShown = true;

            // Also change text colours to reveal text
            this.element.style.color = this.fg;

            // Also make buttons expand and text come back
            for ( i = 0; i < this.buttonList.length; i++) {
                this.buttonList[i].classList.remove("buttonreduced");
                this.buttonList[i].style.color = this.fg;
            }
        }
    }
}

/* ----------------------TEXT
----------------------------------------------------------*/

var titleNode = document.querySelector("#headerbox h1");
var footerNode = document.querySelector("footer");
var textIsDisplayed = !( titleNode.classList.contains("display-none")); // Set to true if it is displayed on load

function toggleHideText() {
    // Toggle the h1 and footer on and off

    // Check if it is displayed
    if (textIsDisplayed) {
        // It is displayed; hide it by applying the display-none class
        titleNode.classList.add("display-none");
        footerNode.classList.add("display-none");
        textIsDisplayed = false;
    } else {
        // It is hidden; remove the class
        titleNode.classList.remove("display-none");
        footerNode.classList.remove("display-none");
        textIsDisplayed = true;
    }
}

/* ------------------BUTTON ACTIONS
----------------------------------------------------------*/

function popeyeToggle() {
    // Toggles Popeye class on the clockFace to turn him on and off.

    // Do we currently have Popeye?
    let clockBkg = document.querySelector("#clock");
    let isPopped = clockBkg.classList.contains("popeyed");

    if ( isPopped ) {
        // Remove class
        clockBkg.classList.remove("popeyed");
    } else {
        // Add class
        clockBkg.classList.add("popeyed");
    }
}

function randomColour() {
    // Get a random color scheme and apply it to some elements
    var colourRequest = new XMLHttpRequest();

    colourRequest.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Parse the JSON
            var colourObj = JSON.parse(this.responseText);
            let newFg = "#" + colourObj.schemes[0].colors[0];
            let newBg = "#" + colourObj.schemes[0].colors[1];

            // Check for bad data coming from the API and set it to defaults if it is broken
            if ( newFg == "#undefined" || newFg == "" || newFg == undefined ) {
                newFg = "black";
            }

            if ( newBg == "#undefined" || newBg == "" || newBg == undefined ) {
                newBg = "black";
            }

            // Set the colours
            setColours( newFg, newBg );

            // Update the colour input field values so the user can see what they are
            colourFeedback( newFg, newBg );
        } else {
            // Ruh roh. Tell someone in the console and make sure we return the previous scheme
            console.log("Error retrieving colour scheme.");

            return prevColours;
        }
    }

    colourRequest.open('GET', 'http://www.colr.org/json/schemes/random/1', true );
    colourRequest.send();
}

function setColourButton() {
    // Set colours to the current state of the input fields
    setColours( fgInput.value, bgInput.value );
}


/* -----------------COLOUR SET MODAL
----------------------------------------------------------*/

// var modalConstructor = function( myID ) {
//     this.element = document.querySelector( myID );
//     this.buttonList = document.querySelectorAll ( myID + " .functionbutton" );
// }

function colourFeedback( fgCol, bgCol ) {
    // Update the colour modal inputs to reflect the colours we've been passed; we are *not* setting colours, just inputs for feedback

    // Update foreground inputs with fg colour, and background inputs with bg colour
    colourInputUpdate( fgCol, fgInput, fgPicker );
    colourInputUpdate( bgCol, bgInput, bgPicker );
}

function colourReset() {
    // See the world as black and white
    setColours( "black", "white" );

    // For now, we're *not* changing the input values because the user might still want those
}

function colourSetClose() {
    // Remove modal-open.
    document.querySelector("#colourset").classList.remove("modal-open");
}

function colourSetOpen() {
    // Add modal-open
    document.querySelector("#colourset").classList.add("modal-open");
}

function colourInputUpdate( newCol, textElement, pickerElement ) {
    // Update the text and picker elements to display a new color

    // Variables
    let hexCol;

    // First, is the color value ""? If so, then do nothing
    // We'll accomplish this by setting it to one of the existing input values, starting with the text one unless it is ""
    // This way, the code later on doesn't need to know this logic.
    if ( newCol == "" ) { 
        if ( textElement.value == "" ) {
            newCol = pickerElement.value;
        } else {
            newCol = textElement.value;
        }
    }

    // Secondly, is the value a hex rgb code? If not, try to convert it (hex starts with # and is followed by 6 hex digits)
    if ( newCol.charAt(0) == "#" && newCol.length == 7 && parseInt(newCol.slice(2), 16) > 0 ) {
        // It is hex! Just assign the hex value over
        hexCol = newCol;
    } else {
        // It isn't hex--attempt to convert and fail out if we can't
        if ( !( hexCol = getHexColour(newCol) ) ) {
            // Warning Will Robinson. Log it and exit
            console.log("colourFeedback: invalid foreground color");
            return false;
        }
    }

    // Okay, we now should have a valid hex code to move forward with! (fingers crossed)
    // Update the text and color inputs with values (using the hex values for the pickers)
    textElement.value = newCol;
    pickerElement.value = hexCol;

    // Return true so we know there wasn't an error (that this function knows about anyway)
    return true;
}

function getHexColour(colorStr) {
    // Convert text values to hex rgb values programmatically
    // Credit: https://stackoverflow.com/a/24366628
    var a = document.createElement('div');
    a.style.color = colorStr;
    var colors = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
    document.body.removeChild(a);
    return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
}

function onInputHandler( sourceElement, fgbg ) {
    // We want to update the UI whenever this element changes

    // UNLESS we just erased everything in here, in which case, leave it empty and don't update anything.
    if ( sourceElement.value != "" ) {
        // We have value (and are totally validated). Now see if we are foreground or background by being classist
        if ( sourceElement.classList.contains("fg") ) {
            colourFeedback( sourceElement.value, "" );
        } else {
            colourFeedback( "", sourceElement.value );
        }
    }
}

// Create variables to point at nodes we'll be using
fgInput = document.querySelector("#foregroundcolour");
bgInput = document.querySelector("#backgroundcolour");
fgPicker = document.querySelector("#foregroundpicker");
bgPicker = document.querySelector("#backgroundpicker");



/* --------------------INTERVALS
----------------------------------------------------------*/


function digitalInterval() {
    clock1.updateDigitalTime();
}

function digitalStart() {
    d = setInterval( digitalInterval, 1000 );
}

function randomInterval() {
    clock1.randomTick();
}


function tickInterval() {
    clock1.intervalHandler();
}



/* ---------------- DISPLAY FUNCTIONS
----------------------------------------------------------*/

function twoDigit( int ) {
    // Return a string that is the int turned into 2 digits

    // Add a "0" to the front of the number, turning it into a string, then return last two characters
    let twoDigitString = ("0" + int).slice(-2);

    return twoDigitString;
}

function setColours( colFg, colBg ) {
    // First, update our colourScheme and use that for setting everything else
    colourScheme.fg = colFg;
    colourScheme.bg = colBg;

    // Set the colours at the document level
    DOCBODY.style.background = colourScheme.bg;
    DOCBODY.style.color = colourScheme.fg;

    // Updating the SVGs requires going through all of the sub-elements, all of which are children under "<g>"
    // Note that the middle dot is a "fill" not a "stroke" and needs some separate handling.
    let clockLines = new Array();
    clockLines = document.querySelectorAll("g *");

    for ( i = 0; i < clockLines.length; i++ ) {
        clockLines[i].style.stroke = colourScheme.fg;
    }

    // Now let's fix the fill on the circle
    document.querySelector(".mid-circle").style.fill = colourScheme.fg;

    // Now for button bars!
    leftBar.setColour( colourScheme.fg, colourScheme.bg );
    rightBar.setColour( colourScheme.fg, colourScheme.bg );

    // And the text & border around our digital display
    digitalText.setColour( colourScheme.fg );

    // Log it
    if ( logLevel > 0 ) {
        console.log( "Colors set to: " + colourScheme.fg + " on " + colourScheme.bg );
    }
}




/* ---------------------- MAIN
----------------------------------------------------------*/


// Loglevel -- set > 0 to turn on logging; 2 will be more verbose
var logLevel = 0;

// Get the DOM nodes we need
const HOURHAND = document.querySelector("#hour");
const MINUTEHAND = document.querySelector("#minute");
const SECONDHAND = document.querySelector("#second");
const DOCBODY = document.querySelector("body");

// Instantiate our clock and set it to the current time
var clock1 = new AnalogClock( HOURHAND, MINUTEHAND, SECONDHAND, "sweep" );
clock1.initialize();

// Start ticking!
var tickInterval = setInterval( tickInterval, 1000 );

// Wait half second (to align with 0.5 "tick" action), then start tracking digital time!
var digitalTimeInterval = setTimeout( digitalStart, 500 );

// Create handlers that tell the clock to correct itself: 1) on focus, 2) periodically
window.onfocus = function() {
    clock1.snapToNow();
}

// Initialize our colour-scheme-storing variable
var colourScheme = new Array();
colourScheme.bg = "white";
colourScheme.fg = "black";

// Create the handlers for the button panels
var leftBar = new barConstructor( "#leftbar", colourScheme.fg, colourScheme.bg, true );
var rightBar = new barConstructor( "#rightbar", colourScheme.fg, colourScheme.bg, true );


