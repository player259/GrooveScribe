// Javascript for the Groove Scribe HTML application
// Groove Scribe is for drummers and helps create sheet music with an easy to use WYSIWYG groove editor.
//
// Author: Lou Montulli
// Original Creation date: Feb 2015.
//
//  Copyright 2015-2020 Lou Montulli, Mike Johnston
//
//  This file is part of Project Groove Scribe.
//
//  Groove Scribe is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 2 of the License, or
//  (at your option) any later version.
//
//  Groove Scribe is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with Groove Scribe.  If not, see <http://www.gnu.org/licenses/>.

// GrooveWriter class.   The only one in this file.

/*jslint browser:true devel:true */
/*global Abc, MIDI, Midi */

var global_num_GrooveUtilsCreated = 0;
var global_grooveUtilsScriptSrc = "";
if (document.currentScript)
	global_grooveUtilsScriptSrc = document.currentScript.src;
var global_midiInitialized = false;

// global constants
var constant_MAX_MEASURES = 10;
var constant_DEFAULT_TEMPO = 80;
var constant_ABC_STICK_R = '"R"x';
var constant_ABC_STICK_L = '"L"x';
var constant_ABC_STICK_BOTH = '"R/L"x';
var constant_ABC_STICK_COUNT = '"count"x';
var constant_ABC_STICK_OFF = '""x';
var constant_ABC_HH_Ride = "^A'";
var constant_ABC_HH_Ride_Bell = "^B'";
var constant_ABC_HH_Cow_Bell = "^D'";
var constant_ABC_HH_Crash = "^c'";
var constant_ABC_HH_Stacker = "^d'";
var constant_ABC_HH_Metronome_Normal = "^e'";
var constant_ABC_HH_Metronome_Accent = "^f'";
var constant_ABC_HH_Open = "!open!^g";
var constant_ABC_HH_Close = "!plus!^g";
var constant_ABC_HH_Accent = "!accent!^g";
var constant_ABC_HH_Normal = "^g";

var constant_ABC_SN_Ghost_Open_Char = "\uFE59"; // SMALL LEFT PARENTHESIS (U+FE59, Ps): ﹙
var constant_ABC_SN_Ghost_Close_Char = "\uFE5A"; // SMALL RIGHT PARENTHESIS (U+FE5A, Pe): ﹚
var constant_ABC_SN_Ghost_Open_Abc = "\"<" + constant_ABC_SN_Ghost_Open_Char + "\""; // Prepend to note ABC syntax - <(
var constant_ABC_SN_Ghost_Close_Abc = "\">" + constant_ABC_SN_Ghost_Close_Char + "\""; // Append to note ABC syntax - >)
var constant_ABC_SN_Ghost = constant_ABC_SN_Ghost_Open_Abc + constant_ABC_SN_Ghost_Close_Abc + "c";

var constant_ABC_SN_Accent = "!accent!c";
var constant_ABC_SN_Normal = "c";
var constant_ABC_SN_XStick = "^c";
var constant_ABC_SN_Buzz = "!///!c";
var constant_ABC_SN_Flam = "!accent!{/c}c";
var constant_ABC_SN_Drag = "{/cc}c";
var constant_ABC_KI_SandK = "[F^d,]"; // kick & splash
var constant_ABC_KI_Splash = "^d,"; // splash only
var constant_ABC_KI_Normal = "F";
var constant_ABC_T1_Normal = "e";
var constant_ABC_T2_Normal = "d";
var constant_ABC_T3_Normal = "B";
var constant_ABC_T4_Normal = "A";
var constant_NUMBER_OF_TOMS = 4;
var constant_ABC_OFF = false;

// Reserved: R, L, B, c, -
var labels = [
	{ code: 'kick', abc: '"K"x', url: 'K', name: 'K' },
	{ code: 'snare', abc: '"S"x', url: 'S', name: 'S' },
	{ code: 'flam', abc: '" flam "x', url: 'f', name: 'flam' },
	{ code: 'h', abc: '"H"x', url: 'h', name: 'H' },
	{ code: 'oh', abc: '"OH"x', url: 'H', name: 'OH' },
	{ code: 'fhh', abc: '"FHH"x', url: 'F', name: 'FHH' },
	{ code: 'circle', abc: '"○"x', url: 'o', name: '○' },
	{ code: 'plus', abc: '"+"x', url: '+', name: '+' },
	{ code: 'up', abc: '"UP"x', url: 'u', name: 'UP' },
	{ code: 'down', abc: '"DOWN"x', url: 'd', name: 'DOWN' },
	{ code: 'tap', abc: '"TAP"x', url: 't', name: 'TAP' },
	{ code: 'full', abc: '"FULL"x', url: 'l', name: 'FULL' },
	{ code: 't1', abc: '"T1"x', url: '1', name: 'T1' },
	{ code: 't2', abc: '"T2"x', url: '2', name: 'T2' },
	{ code: 'ft', abc: '"FT"x', url: 'T', name: 'FT' },
	{ code: 'crc', abc: '"CRC"x', url: 'C', name: 'CRC' },
	{ code: 'rc', abc: '"RC"x', url: 'r', name: 'RC' },
	{ code: 'h_k', abc: '"H/K"x', url: 'q', name: 'H/K' },
	{ code: 'h_s', abc: '"H/S"x', url: 'w', name: 'H/S' },
	{ code: 'oh_k', abc: '"OH/K"x', url: 'y', name: 'OH/K' },
	{ code: 'oh_s', abc: '"OH/S"x', url: 'i', name: 'OH/S' },
];

var constant_OUR_MIDI_VELOCITY_NORMAL = 85;
var constant_OUR_MIDI_VELOCITY_ACCENT = 120;
var constant_OUR_MIDI_VELOCITY_GHOST = 50;
var constant_OUR_MIDI_METRONOME_1 = 76;
var constant_OUR_MIDI_METRONOME_NORMAL = 77;
var constant_OUR_MIDI_HIHAT_NORMAL = 42;
var constant_OUR_MIDI_HIHAT_OPEN = 46;
var constant_OUR_MIDI_HIHAT_ACCENT = 108;
var constant_OUR_MIDI_HIHAT_CRASH = 49;
var constant_OUR_MIDI_HIHAT_STACKER = 52;
var constant_OUR_MIDI_HIHAT_METRONOME_NORMAL = 77;
var constant_OUR_MIDI_HIHAT_METRONOME_ACCENT = 76;
var constant_OUR_MIDI_HIHAT_RIDE = 51;
var constant_OUR_MIDI_HIHAT_RIDE_BELL = 53;
var constant_OUR_MIDI_HIHAT_COW_BELL = 105;
var constant_OUR_MIDI_HIHAT_FOOT = 44;
var constant_OUR_MIDI_SNARE_NORMAL = 38;
var constant_OUR_MIDI_SNARE_ACCENT = 22;
var constant_OUR_MIDI_SNARE_GHOST = 21;
var constant_OUR_MIDI_SNARE_XSTICK = 37;
var constant_OUR_MIDI_SNARE_BUZZ = 104;
var constant_OUR_MIDI_SNARE_FLAM = 107;
var constant_OUR_MIDI_SNARE_DRAG = 103;
var constant_OUR_MIDI_KICK_NORMAL = 35;
var constant_OUR_MIDI_TOM1_NORMAL = 48;
var constant_OUR_MIDI_TOM2_NORMAL = 47;
var constant_OUR_MIDI_TOM3_NORMAL = 45;
var constant_OUR_MIDI_TOM4_NORMAL = 43;

// make these global so that they are shared among all the GrooveUtils classes invoked
var global_current_midi_start_time = 0;
var global_last_midi_update_time = 0;
var global_total_midi_play_time_msecs = 0;
var global_total_midi_notes = 0;
var global_total_midi_repeats = 0;

// GrooveUtils class.   The only one in this file.
function GrooveUtils() {
	"use strict";

	global_num_GrooveUtilsCreated++; // should increment on every new

	var root = this;

	root.abc_obj = null;

	// local constants
	var CONSTANT_Midi_play_time_zero = "0:00";

	// array that can be used to map notes to the SVG generated by abc2svg
	root.note_mapping_array = null;

	// debug & special view
	root.debugMode = false;
	root.viewMode = true;  // by default to prevent screen flicker
	root.grooveDBAuthoring = false;

	// midi state variables
	root.isMIDIPaused = false;
	root.shouldMIDIRepeat = true;
	root.swingIsEnabled = false;
	root.grooveUtilsUniqueIndex = global_num_GrooveUtilsCreated;

	// metronome options
	root.metronomeSolo = false;
	root.metronomeOffsetClickStart = "1";
  // start with last in the rotation so the next rotation brings it to '1'
	root.metronomeOffsetClickStartRotation = 0;

	root.isLegendVisable = false;

	// integration with third party components
	root.noteCallback = null;  //function triggered when a note is played
	root.playEventCallback = null;  //triggered when the play button is pressed
	root.repeatCallback = null;  //triggered when a groove is going to be repeated
	root.tempoChangeCallback = null;  //triggered when the tempo changes.  ARG1 is the new Tempo integer (needs to be very fast, it can get called a lot of times from the slider)

	var class_empty_note_array = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

	root.visible_context_menu = false; // a single context menu can be visible at a time.

	root.grooveDataNew = function () {
		this.notesPerMeasure = 16;
		this.timeDivision = 16;
		this.numberOfMeasures = 1;
		this.numBeats = 4;  // TimeSigTop: Top part of Time Signture 3/4, 4/4, 5/4, 6/8, etc...
		this.noteValue = 4; // TimeSigBottom: Bottom part of Time Sig   4 = quarter notes, 8 = 8th notes, 16ths, etc..
		this.sticking_array = class_empty_note_array.slice(0); // copy by value
		this.hh_array = class_empty_note_array.slice(0);    // copy by value
		this.snare_array = class_empty_note_array.slice(0); // copy by value
		this.kick_array = class_empty_note_array.slice(0);  // copy by value
		// toms_array contains 4 toms  T1, T2, T3, T4 index starting at zero
		this.toms_array = [class_empty_note_array.slice(0), class_empty_note_array.slice(0), class_empty_note_array.slice(0), class_empty_note_array.slice(0)];
		this.showToms = true;
		this.showStickings = false;
		this.title = "";
		this.author = "";
		this.comments = "";
		this.showLegend = false;
		this.swingPercent = 0;
		this.tempo = constant_DEFAULT_TEMPO;
		this.kickStemsUp = true;
		this.metronomeFrequency = 0; // 0, 4, 8, 16
		this.debugMode = root.debugMode;
		this.grooveDBAuthoring = root.grooveDBAuthoring;
		this.viewMode = root.viewMode;
	};

	root.myGrooveData = root.grooveDataNew();

	root.getQueryVariableFromString = function (variable, def_value, my_string) {
		var query = my_string.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0].toLowerCase() == variable.toLowerCase()) {
				return pair[1];
			}
		}
		return (def_value);
	};

	// Get the "?query" values from the page URL
	root.getQueryVariableFromURL = function (variable, def_value) {
		return (root.getQueryVariableFromString(variable, def_value, window.location.search));
	};

	root.getBrowserInfo = function () {
		var browser = navigator.appName;
		var b_version = navigator.appVersion;
		var version = parseFloat(b_version);
		var useragent = navigator.userAgent;
		switch (browser) {
		case 'Microsoft Internet Explorer':
			browser = "MSIE";
			version = useragent.substr(useragent.lastIndexOf('MSIE') + 5, 3);
			break;
		case 'Netscape':
			if (useragent.lastIndexOf('Edge/') > 0) {
				browser = "Edge";
				version = useragent.substr(useragent.lastIndexOf('Edge/') + 5, 4);
			} else if (useragent.lastIndexOf('Chrome/') > 0) {
				browser = "Chrome";
				version = useragent.substr(useragent.lastIndexOf('Chrome/') + 7, 4);
			} else if (useragent.lastIndexOf('Firefox/') > 0) {
				browser = "Firefox";
				version = useragent.substr(useragent.lastIndexOf('Firefox/') + 8, 5);
			} else if (useragent.lastIndexOf('Safari/') > 0) {
				browser = "Safari";
				version = useragent.substr(useragent.lastIndexOf('Safari/') + 7, 6);
			} else if (useragent.lastIndexOf('Trident/') > 0) {
				browser = "MSIE";
				version = useragent.substr(useragent.lastIndexOf('rv:') + 3, 4);
			} else {
				console.log("undefined browser");
			}
			break;
		case 'Opera':
			version = useragent.substr(useragent.lastIndexOf('Version/') + 8, 5);
			break;
		}
		var platform = "windows";
		if (useragent.lastIndexOf('iPhone') > 0) {
			platform = "iOS";
		} else if (useragent.lastIndexOf('iPad') > 0) {
			platform = "iOS";
		} else if (useragent.lastIndexOf('Android') > 0) {
			platform = "android";
		} else if (useragent.lastIndexOf('Macintosh') > 0) {
			platform = "mac";
		}

		return {
			"browser" : browser,
			"version" : version,
			"platform" : platform,
			"uastring" : useragent
		};
	};

	// is the browser a touch device.   Usually this means no right click
	root.is_touch_device = function () {
		return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
	};

	// the notes per measure is calculated from the note division and the time signature
	// in 4/4 time the division is the division (as well as any time signature x/x)
	// in 4/8 the num notes is half as many, etc
	root.calc_notes_per_measure = function(division, time_sig_top, time_sig_bottom) {

		var numNotes = (division/time_sig_bottom) * time_sig_top;

		return numNotes;
	};


	// every document click passes through here.
	// close a popup if one is up and we click off of it.
	root.documentOnClickHanderCloseContextMenu = function (event) {
		if (root.visible_context_menu) {
			root.hideContextMenu(root.visible_context_menu);
		}
	};

	root.showContextMenu = function (contextMenu) {

		// if there is another context menu open, close it
		if (root.visible_context_menu) {
			root.hideContextMenu(root.visible_context_menu);
		}

		contextMenu.style.display = "block";
		root.visible_context_menu = contextMenu;

		// Check for screen visibility of the bottom of the menu
		if(contextMenu.offsetTop + contextMenu.clientHeight > document.documentElement.clientHeight) {
			// the menu has gone off the bottom of the screen
			contextMenu.style.top = document.documentElement.clientHeight - contextMenu.clientHeight + 'px';
		}

		// use a timeout to setup the onClick handler.
		// otherwise the click that opened the menu will close it
		// right away.  :(
		setTimeout(function () {
			document.onclick = root.documentOnClickHanderCloseContextMenu;
			document.body.style.cursor = "pointer"; // make document.onclick work on iPad

		}, 100);
	};

	root.hideContextMenu = function (contextMenu) {
		document.onclick = false;
		document.body.style.cursor = "auto"; // make document.onclick work on iPad


		if (contextMenu) {
			contextMenu.style.display = "none";
		}
		root.visible_context_menu = false;
	};

	// figure it out from the division  Division is number of notes per measure 4, 6, 8, 12, 16, 24, 32, etc...
	// Triplets only support 4/4 and 2/4 time signatures for now
	root.isTripletDivision = function (division) {
		if(division % 12 === 0)  // we only support 12 & 24 & 48  1/8th, 1/16, & 1/32 note triplets
			return true;

		return false;
	};

	// figure out if it is triplets from the number of notes (implied division)
	root.isTripletDivisionFromNotesPerMeasure = function (notesPerMeasure, timeSigTop, timeSigBottom) {
		var division = (notesPerMeasure/timeSigTop) * timeSigBottom;

		return root.isTripletDivision(division);

	};


	root.getMetronomeSolo = function () {
		return root.metronomeSolo;
	};

	root.setMetronomeSolo = function (trueElseFalse) {
		root.metronomeSolo = trueElseFalse;
	};

	root.getMetronomeOffsetClickStart = function () {
		return root.metronomeOffsetClickStart;
	};

  root.getMetronomeOffsetClickStartIsRotating = function () {
    return root.metronomeOffsetClickStart == 'ROTATE';
  };

	root.setMetronomeOffsetClickStart = function (value) {
		root.metronomeOffsetClickStart = value;
	};

	// if the Metronome offset click start is set to rotate this
	// will advance the position of the rotation and return TRUE
	// returns FALSE if rotation is OFF
  root.advanceMetronomeOptionsOffsetClickStartRotation = function (isTriplets) {
  	if(root.getMetronomeOffsetClickStartIsRotating()) {
      root.metronomeOffsetClickStartRotation++;
      return true;
    } else {
      return false;
    }
  };

  root.getMetronomeOptionsOffsetClickStartRotation = function (isTriplets) {
    if(root.getMetronomeOffsetClickStartIsRotating()) {
			// constrain the rotation
      if(isTriplets && root.metronomeOffsetClickStartRotation > 2)
				root.metronomeOffsetClickStartRotation = 0;
      else if(root.metronomeOffsetClickStartRotation > 3)
        root.metronomeOffsetClickStartRotation = 0;

      switch(root.metronomeOffsetClickStartRotation) {
        case 0:
          return '1';
        case 1:
          if (isTriplets)
            return 'TI';
          else
            return 'E';
        case 2:
          if (isTriplets)
            return 'TA';
          else
            return 'AND';
        case 3:
          return 'A';
      }
		} else {
			return root.metronomeOffsetClickStart
		}
	};

  root.resetMetronomeOptionsOffsetClickStartRotation = function (value) {
  	// start with last in the rotation so the next rotation brings it to '1'
    return root.metronomeOffsetClickStartRotation = 0;
	};

	// build a string that looks like this
	//  |----------------|----------------|
	root.GetEmptyGroove = function (notes_per_measure, numMeasures) {
		var retString = "";
		var oneMeasureString = "|";
		var i;

		for(i = 0; i < notes_per_measure; i++) {
			oneMeasureString += "-";
		}
		for (i = 0; i < numMeasures; i++)
				retString += oneMeasureString;
			retString += "|";

		return retString;
	};

	root.GetDefaultStickingsGroove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	// build a string that looks like this
    // "|x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-|";
	root.GetDefaultHHGroove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {
		var retString = "";
		var oneMeasureString = "|";
		var i;

		for(i = 0; i < notes_per_measure; i++) {
			if(notes_per_measure == 48)
				oneMeasureString += "-";
			else
				oneMeasureString += "x";
		}
		for (i = 0; i < numMeasures; i++)
			retString += oneMeasureString;
		retString += "|";

		return retString;
	};

	root.GetDefaultTom1Groove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	root.GetDefaultTom2Groove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	root.GetDefaultTom3Groove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	root.GetDefaultTom4Groove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	// build a string that looks like this
    // |--------O---------------O-------|
	root.GetDefaultSnareGroove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {
		var retString = "";
		var oneMeasureString = "|";
		var i;
		var notes_per_grouping = (notes_per_measure / timeSigTop);

		for(i = 0; i < notes_per_measure; i++) {
			// if the note falls on the beginning of a group
			// and the group is odd
			if(i % notes_per_grouping === 0 && (i / notes_per_grouping) % 2 !== 0)
				oneMeasureString += "O";
			else
				oneMeasureString += "-";
		}
		for (i = 0; i < numMeasures; i++)
				retString += oneMeasureString;
			retString += "|";

		return retString;

	};

	// build a string that looks like this
    // |o---------------o---------------|
	root.GetDefaultKickGroove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {
		var retString = "";
		var oneMeasureString = "|";
		var i;
		var notes_per_grouping = (notes_per_measure / timeSigTop);

		for(i = 0; i < notes_per_measure; i++) {
			// if the note falls on the beginning of a group
			// and the group is even
			if(i % notes_per_grouping === 0 && (i / notes_per_grouping) % 2 === 0)
				oneMeasureString += "o";
			else
				oneMeasureString += "-";
		}
		for (i = 0; i < numMeasures; i++)
				retString += oneMeasureString;
			retString += "|";

		return retString;
	};

	root.GetDefaultTomGroove = function (notes_per_measure, timeSigTop, timeSigBottom, numMeasures) {

		return root.GetEmptyGroove(notes_per_measure, numMeasures);
	};

	// takes a character from tablature form and converts it to our ABC Notation form.
	// uses drum tab format adapted from wikipedia: http://en.wikipedia.org/wiki/Drum_tablature
	//
	//  Sticking support:
	//		R: right
	//    L: left
	//
	//  HiHat support:
	//		x: normal
	//		X: accent
	//		o: open
	//		+: close
	//		c: crash
	//		r: ride
	//		b: ride bell
	//		m: (more) cow bell
	//    s: stacker
	//    n: metroNome normal
	//    N: metroNome accent
	//		-: off
	//
	//   Snare support:
	//		o: normal
	//		O: accent
	//		g: ghost
	//		x: cross stick
	//		f: flam
	//		-: off
	//
	//   Kick support:
	//		o: normal
	//		x: hi hat splash with foot
	//		X: kick & hi hat splash with foot simultaneously
	//
	//  Kick can be notated either with a "K" or a "B"
	//
	//  Note that "|" and " " will be skipped so that standard drum tabs can be applied
	//  Example:
	//     H=|x---x---x---x---|x---x---x---x---|x---x---x---x---|
	// or  H=x-x-x-x-x-x-x-x-x-x-x-x-
	//     S=|----o-------o---|----o-------o---|----o-------o---|
	// or  S=--o---o---o---o---o---o-
	//     B=|o-------o-------|o-------o-o-----|o-----o-o-------|
	// or  K=o---o---o----oo-o--oo---|
	// or  T1=|o---o---o---o|
	// or  T2=|o---o---o---o|
	// or  T3=|o---o---o---o|
	// or  T4=|o---o---o---o|
	function tablatureToABCNotationPerNote(drumType, tablatureChar) {

		if (drumType == "Stickings") {
			var label = labels.find(l => l.url === tablatureChar);
			if (label) {
				return label.abc;
			}
		}

		switch (tablatureChar) {
		case "b":
		case "B":
			if (drumType == "Stickings")
				return constant_ABC_STICK_BOTH;
			else if (drumType == "H")
				return constant_ABC_HH_Ride_Bell;
			else if (drumType == "S")
				return constant_ABC_SN_Buzz;
			break;
		case "c":
			if (drumType == "Stickings")
				return constant_ABC_STICK_COUNT;
			else if (drumType == "H")
				return constant_ABC_HH_Crash;
			break;
		case "d":
			if (drumType == "S")
				return constant_ABC_SN_Drag;
			break;
		case "f":
			if (drumType == "S")
				return constant_ABC_SN_Flam;
			break;
		case "g":
			if (drumType == "S")
				return constant_ABC_SN_Ghost;
			break;
		case "L":
			if (drumType == "Stickings")
				return constant_ABC_STICK_L;
			break;
		case "m":  // (more) cow bell
			if (drumType == "H")
				return constant_ABC_HH_Cow_Bell;
			break;
		case "n":  // (more) cow bell
			if (drumType == "H")
				return constant_ABC_HH_Metronome_Normal;
			break;
		case "N":  // (more) cow bell
			if (drumType == "H")
				return constant_ABC_HH_Metronome_Accent;
			break;
		case "O":
			if (drumType == "S")
				return constant_ABC_SN_Accent;
			break;
		case "o":
			switch (drumType) {
			case "H":
				return constant_ABC_HH_Open;
				//break;
			case "S":
				return constant_ABC_SN_Normal;
				//break;
			case "K":
			case "B":
				return constant_ABC_KI_Normal;
				//break;
			case "T1":
				return constant_ABC_T1_Normal;
				//break;
			case "T2":
				return constant_ABC_T2_Normal;
				//break;
			case "T3":
				return constant_ABC_T3_Normal;
				//break;
			case "T4":
				return constant_ABC_T4_Normal;
				//break;
			default:
				break;
			}
			break;
		case "R":
			switch (drumType) {
			case "H":
				return constant_ABC_HH_Ride;
				//break;
			case "Stickings":
				return constant_ABC_STICK_R;
				//break;
			default:
				break;
			}
			break;
		case "s":
			if (drumType == "H")
				return constant_ABC_HH_Stacker;
			break;
		case "x":
			switch (drumType) {
			case "S":
				return constant_ABC_SN_XStick;
				//break;
			case "K":
			case "B":
				return constant_ABC_KI_Splash;
				//break;
			case "H":
				return constant_ABC_HH_Normal;
				//break;
			case "T1":
				return constant_ABC_T1_Normal;
				//break;
			case "T4":
				return constant_ABC_T4_Normal;
				//break;
			default:
				break;
			}
			break;
		case "X":
			switch (drumType) {
			case "K":
				return constant_ABC_KI_SandK;
				//break;
			case "H":
				return constant_ABC_HH_Accent;
				//break;
			default:
				break;
			}
			break;
		case "+":
			if (drumType == "H") {
				return constant_ABC_HH_Close;
			}
			break;
		case "-":
			return false;
			//break;
		default:
			break;
		}

		console.log("Bad tablature note found in tablatureToABCNotationPerNote.  Tab: " + tablatureChar + " for drum type: " + drumType);
		return false;
	}

	// same as above, but reversed
	function abcNotationToTablaturePerNote(drumType, abcChar) {
		var tabChar = "-";

		if (drumType == "stickings") {
			var label = labels.find(l => l.abc === abcChar);
			if (label) {
				return label.url;
			}
		}

		switch (abcChar) {
		case constant_ABC_STICK_R:
			tabChar = "R";
			break;
		case constant_ABC_STICK_L:
			tabChar = "L";
			break;
		case constant_ABC_STICK_BOTH:
			tabChar = "B";
			break;
		case constant_ABC_STICK_OFF:
			tabChar = "-";
			break;
		case constant_ABC_STICK_COUNT:
			tabChar = "c";
			break;
		case constant_ABC_HH_Ride:
			tabChar = "r";
			break;
		case constant_ABC_HH_Ride_Bell:
			tabChar = "b";
			break;
		case constant_ABC_HH_Cow_Bell:
			tabChar = "m";
			break;
		case constant_ABC_HH_Crash:
			tabChar = "c";
			break;
		case constant_ABC_HH_Stacker:
			tabChar = "s";
			break;
    case constant_ABC_HH_Metronome_Normal:
        tabChar = "n";
        break;
    case constant_ABC_HH_Metronome_Accent:
        tabChar = "N";
        break;
    case constant_ABC_HH_Open:
			tabChar = "o";
			break;
		case constant_ABC_HH_Close:
			tabChar = "+";
			break;
		case constant_ABC_SN_Accent:
			tabChar = "O";
			break;
		case constant_ABC_SN_Buzz:
			tabChar = "b";
			break;
		case constant_ABC_HH_Normal:
		case constant_ABC_SN_XStick:
			tabChar = "x";
			break;
		case constant_ABC_SN_Ghost:
			tabChar = "g";
			break;
		case constant_ABC_SN_Normal:
		case constant_ABC_KI_Normal:
		case constant_ABC_T1_Normal:
		case constant_ABC_T2_Normal:
		case constant_ABC_T3_Normal:
		case constant_ABC_T4_Normal:
			tabChar = "o";
			break;
		case constant_ABC_SN_Flam:
			tabChar = "f";
			break;
		case constant_ABC_SN_Drag:
			tabChar = "d";
			break;
		case constant_ABC_HH_Accent:
		case constant_ABC_KI_SandK:
			tabChar = "X";
			break;
		case constant_ABC_KI_Splash:
			tabChar = "x";
			break;
		case constant_ABC_OFF:
			tabChar = "-";
			break;
		default:
			console.log("bad case in abcNotationToTablaturePerNote: " + abcChar);
			break;
		}

		return tabChar;
	}

	// takes two drum tab lines and merges them.    "-" are blanks so they will get overwritten in a merge.
	// if there are two non "-" positions to merge, the dominateLine takes priority.
	//
	//  Example    |----o-------o---|   (dominate)
	//           + |x-------x---x---|   (subordinate)
	//             |x---o---x---o---|   (result)
	//
	// this is useful to take an accent tab and an "others" tab and creating one tab out of it.
	root.mergeDrumTabLines = function (dominateLine, subordinateLine) {
		var maxLength = (dominateLine.length > subordinateLine.length ? dominateLine.length : subordinateLine.length);
		var newLine = "";

		for (var i = 0; i < maxLength; i++) {
			var newChar = "-";
			if (dominateLine.charAt(i) !== "")
				newChar = dominateLine.charAt(i);

			if (newChar == "-" && subordinateLine.charAt(i) !== "")
				newChar = subordinateLine.charAt(i);

			newLine += newChar;
		}

		return newLine;
	};

	// takes a string of notes encoded in a serialized string and convert it to an array that represents the notes
	// uses drum tab format adapted from wikipedia: http://en.wikipedia.org/wiki/Drum_tablature
	//
	//  Note that "|" and " " will be skipped so that standard drum tabs can be applied
	//  Example:
	//     H=|x---x---x---x---|x---x---x---x---|x---x---x---x---|
	// or  H=x-x-x-x-x-x-x-x-x-x-x-x-
	//     S=|----o-------o---|----o-------o---|----o-------o---|
	// or  S=--o---o---o---o---o---o-
	//     B=|o-------o-------|o-------o-o-----|o-----o-o-------|
	// or  B=o---o---o----oo-o--oo---|
	//
	// Returns array that contains notesPerMeasure * numberOfMeasures entries.
	root.noteArraysFromURLData = function (drumType, noteString, notesPerMeasure, numberOfMeasures) {
		var retArray = [];

		// decode the %7C url encoding types
		noteString = decodeURIComponent(noteString);

		var retArraySize = notesPerMeasure * numberOfMeasures;

		// ignore "|" by removing them
		//var notes = noteString.replace(/\|/g, '');
		// ignore "|" & ")" & "(" & "[" & "]" & "!" & ":" by removing them
		var notes = noteString.replace(/\:|\!|\)|\(|\[|\]|\|/g, '');

		var noteStringScaler = 1;
		var displayScaler = 1;
		if (notes.length > retArraySize && notes.length / retArraySize >= 2) {
			// if we encounter a 16th note groove for an 8th note board, let's scale it	down
			noteStringScaler = Math.ceil(notes.length / retArraySize);
		} else if (notes.length < retArraySize && retArraySize / notes.length >= 2) {
			// if we encounter a 8th note groove for an 16th note board, let's scale it up
			displayScaler = Math.ceil(retArraySize / notes.length);
		}

		// initialize an array that can carry all the measures in one array
		for (var i = 0; i < retArraySize; i++) {
			retArray[i] = false;
		}

		var retArrayIndex = 0;
		for (var j = 0; j < notes.length && retArrayIndex < retArraySize; j += noteStringScaler, retArrayIndex += displayScaler) {
			retArray[retArrayIndex] = tablatureToABCNotationPerNote(drumType, notes[j]);
		}

		return retArray;
	};

	// take an array of notes in ABC format and convert it into a drum tab String
	// drumType - H, S, K, or Stickings
	// noteArray - pass in an ABC array of notes
	// getAccents - true to get accent notes.  (false to ignore accents)
	// getOthers - true to get non-accent notes.  (false to ignore non-accents)
	// maxLength - set smaller than noteArray length to get fewer notes
	// separatorDistance - set to greater than zero integer to add "|" between measures
	root.tabLineFromAbcNoteArray = function (drumType, noteArray, getAccents, getOthers, maxLength, separatorDistance) {
		var returnTabLine = "";

		if (maxLength > noteArray.length)
			maxLength = noteArray.length;

		for (var i = 0; i < maxLength; i++) {
			var newTabChar = abcNotationToTablaturePerNote(drumType, noteArray[i]);

			if (drumType == "H" && newTabChar == "X") {
				if (getAccents)
					returnTabLine += newTabChar;
				else
					returnTabLine += "-";
			} else if ((drumType == "K" || drumType == "S") && (newTabChar == "o" || newTabChar == "O")) {
				if (getAccents)
					returnTabLine += newTabChar;
				else
					returnTabLine += "-";
			} else if (drumType == "K" && newTabChar == "X") {
				if (getAccents && getOthers)
					returnTabLine += "X"; // kick & splash
				else if (getAccents)
					returnTabLine += "o"; // just kick
				else
					returnTabLine += "x"; // just splash
			} else {
				// all the "others"
				if (getOthers)
					returnTabLine += newTabChar;
				else
					returnTabLine += "-";
			}

			if ((separatorDistance > 0) && ((i+1) % separatorDistance) === 0)
				returnTabLine += "|";
		}

		return returnTabLine;
	};

	// parse a string like "4/4", "5/4" or "2/4"
	root.parseTimeSigString = function(timeSigString) {
		var split_arr = timeSigString.split("/");

		if(split_arr.length != 2)
			return [4, 4];

		var timeSigTop = parseInt(split_arr[0], 10);
		var timeSigBottom = parseInt(split_arr[1], 10);

		if(timeSigTop < 1 || timeSigTop > 32)
			timeSigTop = 4;

		// only valid if 2,4,8, or 16
		if(timeSigBottom != 2 && timeSigBottom != 4 && timeSigBottom != 8 && timeSigBottom != 16)
			timeSigBottom = 4;

		return [timeSigTop, timeSigBottom];
	};

	root.getGrooveDataFromUrlString = function (encodedURLData) {
		var Stickings_string;
		var HH_string;
		var Snare_string;
		var Kick_string;
		var stickings_set_from_URL = false;
		var myGrooveData = new root.grooveDataNew();
		var i;

		myGrooveData.debugMode = parseInt(root.getQueryVariableFromString("Debug", root.debugMode, encodedURLData), 10);

		var timeSigArray = root.parseTimeSigString(root.getQueryVariableFromString("TimeSig", "4/4", encodedURLData));
		myGrooveData.numBeats = timeSigArray[0];
		myGrooveData.noteValue = timeSigArray[1];

		myGrooveData.timeDivision = parseInt(root.getQueryVariableFromString("Div", 16, encodedURLData), 10);
		myGrooveData.notesPerMeasure = root.calc_notes_per_measure(myGrooveData.timeDivision, myGrooveData.numBeats, myGrooveData.noteValue);

		myGrooveData.metronomeFrequency = parseInt(root.getQueryVariableFromString("MetronomeFreq", "0", encodedURLData), 10);

		myGrooveData.numberOfMeasures = parseInt(root.getQueryVariableFromString("measures", 1, encodedURLData), 10);
		if (myGrooveData.numberOfMeasures < 1 || isNaN(myGrooveData.numberOfMeasures))
			myGrooveData.numberOfMeasures = 1;
		else if (myGrooveData.numberOfMeasures > constant_MAX_MEASURES)
			myGrooveData.numberOfMeasures = constant_MAX_MEASURES;

		Stickings_string = root.getQueryVariableFromString("Stickings", false, encodedURLData);
		if (!Stickings_string) {
			Stickings_string = root.GetDefaultStickingsGroove(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue, myGrooveData.numberOfMeasures);
			myGrooveData.showStickings = false;
		} else {
			myGrooveData.showStickings = true;
		}

		HH_string = root.getQueryVariableFromString("H", false, encodedURLData);
		if (!HH_string) {
			root.getQueryVariableFromString("HH", false, encodedURLData);
			if (!HH_string) {
				HH_string = root.GetDefaultHHGroove(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue, myGrooveData.numberOfMeasures);
			}
		}

		Snare_string = root.getQueryVariableFromString("S", false, encodedURLData);
		if (!Snare_string) {
			Snare_string = root.GetDefaultSnareGroove(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue, myGrooveData.numberOfMeasures);
		}

		Kick_string = root.getQueryVariableFromString("K", false, encodedURLData);
		if (!Kick_string) {
			root.getQueryVariableFromString("B", false, encodedURLData);
			if (!Kick_string) {
				Kick_string = root.GetDefaultKickGroove(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue, myGrooveData.numberOfMeasures);
			}
		}

		// Get the Toms
		for(i=0; i < 4; i++) {
			// toms are named T1, T2, T3, T4
			var Tom_string = root.getQueryVariableFromString("T" + (i+1), false, encodedURLData);
			if (!Tom_string) {
				Tom_string = root.GetDefaultTomGroove(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue, myGrooveData.numberOfMeasures);
			} else {
				myGrooveData.showToms = true;
			}

			/// the toms array index starts at zero (0) the first one is T1
			myGrooveData.toms_array[i] = root.noteArraysFromURLData("T" + (i+1), Tom_string, myGrooveData.notesPerMeasure, myGrooveData.numberOfMeasures);
		}

		myGrooveData.sticking_array = root.noteArraysFromURLData("Stickings", Stickings_string, myGrooveData.notesPerMeasure, myGrooveData.numberOfMeasures);
		myGrooveData.hh_array = root.noteArraysFromURLData("H", HH_string, myGrooveData.notesPerMeasure, myGrooveData.numberOfMeasures);
		myGrooveData.snare_array = root.noteArraysFromURLData("S", Snare_string, myGrooveData.notesPerMeasure, myGrooveData.numberOfMeasures);
		myGrooveData.kick_array = root.noteArraysFromURLData("K", Kick_string, myGrooveData.notesPerMeasure, myGrooveData.numberOfMeasures);

		myGrooveData.title = root.getQueryVariableFromString("title", "", encodedURLData);
		myGrooveData.title = decodeURIComponent(myGrooveData.title);
		myGrooveData.title = myGrooveData.title.replace(/\+/g, " ");

		myGrooveData.author = root.getQueryVariableFromString("author", "", encodedURLData);
		myGrooveData.author = decodeURIComponent(myGrooveData.author);
		myGrooveData.author = myGrooveData.author.replace(/\+/g, " ");

		myGrooveData.comments = root.getQueryVariableFromString("comments", "", encodedURLData);
		myGrooveData.comments = decodeURIComponent(myGrooveData.comments);
		myGrooveData.comments = myGrooveData.comments.replace(/\+/g, " ");

		myGrooveData.tempo = parseInt(root.getQueryVariableFromString("tempo", constant_DEFAULT_TEMPO, encodedURLData), 10);
		if (isNaN(myGrooveData.tempo) || myGrooveData.tempo < 20 || myGrooveData.tempo > 400)
			myGrooveData.tempo = constant_DEFAULT_TEMPO;

		myGrooveData.swingPercent = parseInt(root.getQueryVariableFromString("swing", 0, encodedURLData), 10);
		if (isNaN(myGrooveData.swingPercent) || myGrooveData.swingPercent < 0 || myGrooveData.swingPercent > 100)
			myGrooveData.swingPercent = 0;

		return myGrooveData;
	};

	// get a really long URL that encodes all of the notes and the rest of the state of the page.
	// this will allow us to bookmark or reference a groove and handle undo/redo.
	//

	root.getUrlStringFromGrooveData = function (myGrooveData, url_destination) {

		var fullURL = window.location.protocol + "//" + window.location.host + window.location.pathname;

		if(!url_destination) {
			// then assume it is the groove writer display.  Do nothing
		} else if(url_destination == "display") {
			// asking for the "groove_display" page
			if(fullURL.includes('index.html'))
				fullURL = fullURL.replace('index.html', 'GrooveEmbed.html');
			else if(fullURL.includes('/gscribe'))
				fullURL = fullURL.replace('/gscribe', '/groove/GrooveEmbed.html');
			else
				fullURL += 'GrooveEmbed.html';
		} else if(url_destination == "fullGrooveScribe") {
			// asking for the full GrooveScribe link
			fullURL = 'https://www.mikeslessons.com/gscribe';
		}

		fullURL += '?';

		if (myGrooveData.debugMode)
			fullURL += "Debug=1&";

		if (myGrooveData.viewMode)
			fullURL += "Mode=view&";

		if (myGrooveData.grooveDBAuthoring)
			fullURL += "GDB_Author=1&";

		fullURL += 'TimeSig=' + myGrooveData.numBeats + '/' + myGrooveData.noteValue;

		// # of notes
		fullURL += "&Div=" + myGrooveData.timeDivision;

		if (myGrooveData.title !== "")
			fullURL += "&Title=" + encodeURIComponent(myGrooveData.title);

		if (myGrooveData.author !== "")
			fullURL += "&Author=" + encodeURIComponent(myGrooveData.author);

		if (myGrooveData.comments !== "")
			fullURL += "&Comments=" + encodeURIComponent(myGrooveData.comments);

		fullURL += "&Tempo=" + myGrooveData.tempo;

		if (myGrooveData.swingPercent > 0)
			fullURL += "&Swing=" + myGrooveData.swingPercent;

		// # of measures
		fullURL += "&Measures=" + myGrooveData.numberOfMeasures;

		// # metronome setting
		if(myGrooveData.metronomeFrequency !== 0) {
			fullURL += "&MetronomeFreq=" + myGrooveData.metronomeFrequency;
		}

		// notes
		var total_notes = myGrooveData.notesPerMeasure * myGrooveData.numberOfMeasures;
		var HH = "&H=|" +    root.tabLineFromAbcNoteArray('H',  myGrooveData.hh_array, true, true, total_notes, myGrooveData.notesPerMeasure);
		var Snare = "&S=|" + root.tabLineFromAbcNoteArray('S',  myGrooveData.snare_array, true, true, total_notes, myGrooveData.notesPerMeasure);
		var Kick = "&K=|" +  root.tabLineFromAbcNoteArray('K',  myGrooveData.kick_array, true, true, total_notes, myGrooveData.notesPerMeasure);

		fullURL += HH + Snare + Kick;

		// only add if we need them.  // they are long and ugly. :)
		if (myGrooveData.showToms) {
			var Tom1 = "&T1=|" + root.tabLineFromAbcNoteArray('T1', myGrooveData.toms_array[0], true, true, total_notes, myGrooveData.notesPerMeasure);
			var Tom2 = "&T2=|" + root.tabLineFromAbcNoteArray('T2', myGrooveData.toms_array[1], true, true, total_notes, myGrooveData.notesPerMeasure);
			var Tom3 = "&T3=|" + root.tabLineFromAbcNoteArray('T3', myGrooveData.toms_array[2], true, true, total_notes, myGrooveData.notesPerMeasure);
			var Tom4 = "&T4=|" + root.tabLineFromAbcNoteArray('T4', myGrooveData.toms_array[3], true, true, total_notes, myGrooveData.notesPerMeasure);
			fullURL += Tom1 + Tom2 + Tom3 + Tom4;
		}

		// only add if we need them.  // they are long and ugly. :)
		if (myGrooveData.showStickings) {
			var Stickings = "&Stickings=|" + root.tabLineFromAbcNoteArray('stickings', myGrooveData.sticking_array, true, true, total_notes, myGrooveData.notesPerMeasure);
			fullURL += Stickings;
		}

		return fullURL;
	}

	function setupHotKeys() {

		var isCtrl = false;
		document.onkeyup = function (e) {
			if (e.which == 17)
				isCtrl = false;
		};

		document.onkeydown = function (e) {
			if (e.which == 17)
				isCtrl = true;
			/*
			if(e.which == 83 && isCtrl == true) {
			alert('CTRL-S pressed');
			return false;
			}
			 */
			// only accept the event if it not going to an INPUT field
			// otherwise we can't use spacebar in text fields :(
			if (e.which == 32 && (e.target.type == "range" || (e.target.tagName.toUpperCase() != "INPUT" && e.target.tagName.toUpperCase() != "TEXTAREA"))) {

				// spacebar
				root.startOrStopMIDI_playback();
				return false;
			}
			if (e.which == 179) {
				// Play button
				root.startOrPauseMIDI_playback();
			}
			if (e.which == 178) {
				// Stop button
				root.stopMIDI_playback();
			}

			return true;
		};
	}

	// the top stuff in the ABC that doesn't depend on the notes
	root.get_top_ABC_BoilerPlate = function (isPermutation, tuneTitle, tuneAuthor, tuneComments, showLegend, isTriplets, kick_stems_up, timeSigTop, timeSigBottom, renderWidth) {

		// boiler plate
		var fullABC = '%abc\n%%fullsvg _' + root.grooveUtilsUniqueIndex + '\nX:6\n';

		fullABC += "M:" + timeSigTop + "/" + timeSigBottom + "\n";

		// always add a Title even if it's blank
		fullABC += "T: " + tuneTitle + "\n";

		if (tuneAuthor !== "") {
			fullABC += "C: " + tuneAuthor + "\n";
			fullABC += "%%musicspace 20px\n"; // add some more space
		}

		if (renderWidth < 400)
			renderWidth = 400; // min-width
		if (renderWidth > 3000)
			renderWidth = 3000; // max-width
		// the width of the music is always 25% bigger than what we pass in.   Go figure.
		renderWidth = Math.floor(renderWidth * 0.75);

		fullABC += "L:1/" + (32) + "\n"; // 4/4 = 32,  6/8 = 64

		if (isPermutation)
			fullABC += "%%stretchlast 0\n";
		else
			fullABC += "%%stretchlast 1\n";

		fullABC += '%%flatbeams 1\n' +
		'%%ornament up\n' +
		'%%pagewidth ' + renderWidth + 'px\n' +
		'%%leftmargin 0cm\n' +
		'%%rightmargin 0cm\n' +
		'%%topspace 10px\n' +
		'%%titlefont Lato 20\n' +
		'%%partsfont Lato 16\n' +
		'%%gchordfont MADE Waffle Soft 12\n' +
		'%%annotationfont Lato 16\n' +
		'%%infofont MADE Waffle Soft 16\n' +
		'%%textfont Lato 16\n' +
		// '%%score (Stickings Hands Feet)\n' +
		'%%beginsvg\n' +
		' <defs>\n' +
		' <path id="Xhead" d="m-3,-3 l6,6 m0,-6 l-6,6" class="stroke" style="stroke-width:1.2"/>\n' +
		' <path id="Trihead" d="m-3,2 l 6,0 l-3,-6 l-3,6 l6,0" class="stroke" style="stroke-width:1.2"/>\n' +
		' </defs>\n' +
		'%%endsvg\n' +
		'%%map drum ^g heads=Xhead print=g       % Hi-Hat\n' +
		'%%map drum ^c\' heads=Xhead print=c\'   % Crash\n' +
		'%%map drum ^d\' heads=Xhead print=d\'   % Stacker\n' +
		'%%map drum ^e\' heads=Xhead print=e\'   % Metronome click\n' +
		'%%map drum ^f\' heads=Xhead print=f\'   % Metronome beep\n' +
		'%%map drum ^A\' heads=Xhead print=A\'   % Ride\n' +
		'%%map drum ^B\' heads=Trihead print=A\' % Ride Bell\n' +
		'%%map drum ^D\' heads=Trihead print=g   % Cow Bell\n' +
		'%%map drum ^c heads=Xhead print=c  % Cross Stick\n' +
		'%%map drum ^d, heads=Xhead print=d,  % Foot Splash\n';

		//if(kick_stems_up)
		//fullABC += "%%staves (Stickings Hands)\n";
		//else
		fullABC += "%%staves (Stickings Hands Feet)\n";

		// print comments below the legend if there is one, otherwise in the header section
		if (tuneComments !== "") {
			fullABC += "P: " + tuneComments + "\n";
			fullABC += "%%musicspace 20px\n"; // add some more space
		}

		// the K ends the header;
		fullABC += "K:C clef=perc\n";

		if (showLegend) {
			fullABC += 'V:Stickings\n' +
			'x8 x8 x8 x8 x8 x8 x8 x8 ||\n' +
			'V:Hands stem=up \n' +
			'%%voicemap drum\n' +
			'"^Hi-Hat"^g4 "^Open"!open!^g4 ' +
			'"^Crash"^c\'4 "^Stacker"^d\'4 "^Ride"^A\'4 "^Ride Bell"^B\'4 x2 "^Tom"e4 "^Tom"A4 "^Snare"c4 "^Buzz"!///!c4 "^Cross"^c4 "^Ghost  "!(.!!).!c4 "^Flam"{/c}c4  x10 ||\n' +
			'V:Feet stem=down \n' +
			'%%voicemap drum\n' +
			'x52 "^Kick"F4 "^HH foot"^d,4 x4 ||\n' +
			'T:\n';
		}

		// tempo setting
		//fullABC += "Q: 1/4=" + getTempo() + "\n";

		return fullABC;
	};

	// looks for modifiers like !accent! or !plus! and moves them outside of the group abc array.
	// Most modifiers (but not all) will not render correctly if they are inside the abc group.
	// returns a string that should be added to the abc_notation if found.
	function moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, modifier_to_look_for) {

		var found_modifier = false;
		var rindex = abcNoteStrings.notes1.lastIndexOf(modifier_to_look_for);
		if (rindex > -1) {
			found_modifier = true;
			abcNoteStrings.notes1 = abcNoteStrings.notes1.replace(modifier_to_look_for, "");
		}
		rindex = abcNoteStrings.notes2.lastIndexOf(modifier_to_look_for);
		if (rindex > -1) {
			found_modifier = true;
			abcNoteStrings.notes2 = abcNoteStrings.notes2.replace(modifier_to_look_for, "");
		}
		rindex = abcNoteStrings.notes3.lastIndexOf(modifier_to_look_for);
		if (rindex > -1) {
			found_modifier = true;
			abcNoteStrings.notes3 = abcNoteStrings.notes3.replace(modifier_to_look_for, "");
		}
		if (found_modifier)
			return modifier_to_look_for;

		return ""; // didn't find it so return nothing
	}

	// take an array of arrays and use a for loop to test to see
	// if all of the arrays are equal to the "test_value" for a given "test_index"
	// returns "true" if they are all equal.
	// returns "false" if any one of them fails
	function testArrayOfArraysForEquality(array_of_arrays, test_index, test_value) {

		for(var i = 0; i < array_of_arrays.length; i++) {
			if(array_of_arrays[i][test_index] !== undefined && array_of_arrays[i][test_index] !== test_value)
				return false;
		}

		return true;
	}

	// note1_array:   an array containing "false" or a note character in ABC to designate that is is on
	// note2_array:   an array containing "false" or a note character in ABC to designate that is is on
	// end_of_group:  when to stop looking ahead in the array.  (since we group notes in to beats)
	function getABCforNote(note_array_of_arrays, start_index, end_of_group, scaler) {

		var ABC_String = "";
		var abcNoteStrings = {
			notes1 : "",
			notes2 : "",
			notes3 : ""
		};
		var num_notes_on = 0;
		var nextCount;

		for(var which_array=0; which_array < note_array_of_arrays.length; which_array++) {

			if(note_array_of_arrays[which_array][start_index] !== undefined && note_array_of_arrays[which_array][start_index] !== false) {
				// look ahead and see when the next note is
				// the length of this note is dependant on when the next note lands
				// for every empty space we increment nextCount, and then make the note that long
				nextCount = 1;
				for (var indexA = start_index + 1; indexA < (start_index + end_of_group); indexA++) {
					if(!testArrayOfArraysForEquality(note_array_of_arrays, indexA, false)) {
						break;
					} else {
						nextCount++;
					}
				}

				abcNoteStrings.notes1 += note_array_of_arrays[which_array][start_index] + (scaler * nextCount);
				num_notes_on++;
			}
		}

		if (num_notes_on > 1) {
			// if multiple are on, we need to combine them with []
			// horrible hack.  Turns out ABC will render the accents wrong unless the are outside the brackets []
			// look for any accents that are delimited by "!"  (eg !accent!  or !plus!)
			// move the accents to the front
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "!accent!");
			// in case there are two accents (on both snare and hi-hat) we remove the second one
			moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "!accent!");
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "!plus!");
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "!open!");
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "!///!");

			// Look for '[' and ']'.   They are added on to the the kick and splash and could be added to other notes
			// in the future.   They imply that the notes are on the same beat.   Since we are already putting multiple
			// notes on the same beat (see code below this line that adds '[' & ']'), we need to remove them or the
			// resulting ABC will be invalid
			moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "[");
			moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "]");

			// this is the flam notation, it can't be in a sub grouping
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "{/c}");
			// this is the drag notation, it can't be in a sub grouping
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, "{/cc}");

			// Ghost note annotation
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, constant_ABC_SN_Ghost_Open_Abc);
			ABC_String += moveAccentsOrOtherModifiersOutsideOfGroup(abcNoteStrings, constant_ABC_SN_Ghost_Close_Abc);

			ABC_String += "[" + abcNoteStrings.notes1 + abcNoteStrings.notes2 + abcNoteStrings.notes3 + "]"; // [^gc]
		} else {
			ABC_String += abcNoteStrings.notes1 + abcNoteStrings.notes2 + abcNoteStrings.notes3; // note this could be a noOp if all strings are blank
		}

		return ABC_String;
	}

	// calculate the rest ABC string
	function getABCforRest(note_array_of_arrays, start_index, end_of_group, scaler, use_hidden_rest) {
		var ABC_String = "";

		// count the # of rest
		if (testArrayOfArraysForEquality(note_array_of_arrays, start_index, false)) {
			var restCount = 1;
			for (var indexB = start_index + 1; indexB < (start_index + end_of_group); indexB++) {
				if(!testArrayOfArraysForEquality(note_array_of_arrays, indexB, false))
					break;
				else
					restCount++;
			}

			// now output a rest for the duration of the rest count
			if (use_hidden_rest)
				ABC_String += "x" + (scaler * restCount);
			else
				ABC_String += "z" + (scaler * restCount);
		}

		return ABC_String;
	}

	// the note grouping size is how groups of notes within a measure group
	// for 8ths and 16th we group with 4
	// for triplets we group with 3
	// This function is for laying out the HTML
	// see abc_gen_note_grouping_size for the sheet music layout grouping size
	root.noteGroupingSize = function (notes_per_measure, timeSigTop, timeSigBottom) {
		var note_grouping;
		var usingTriplets = root.isTripletDivisionFromNotesPerMeasure(notes_per_measure, timeSigTop, timeSigBottom);

		if(usingTriplets) {
			// triplets  ( we only support 2/4 here )
			if(timeSigTop != 2 && timeSigBottom != 4)
				console.log("Triplets are only supported in 2/4 and 4/4 time");
			note_grouping = notes_per_measure / (timeSigTop * (4/timeSigBottom));
		} else if(timeSigTop == 3) {
			// 3/4, 3/8, 3/16
			// 3 groups
			// not triplets
			note_grouping =  (notes_per_measure) / 3
		} else if(timeSigTop % 6 == 0 && timeSigBottom % 8 == 0) {
			// 6/8, 12/8
			// 2 groups in 6/8 rather than 3 groups
			// 4 groups in 12/8
			// not triplets
			note_grouping = notes_per_measure / (2 * timeSigTop/6)
		} else {
			// figure it out from the time signature
			// not triplets
			note_grouping = (notes_per_measure / timeSigTop) * (timeSigBottom/4);
		}
		return note_grouping;
	};

	// when we generate ABC we use a default larger note array and transpose it
	// For 8th note triplets that means we need to use a larger grouping to make it
	// scale correctly
	// The base array is now 32 notes long to support 32nd notes
	// since we would normally group by 4 we need to group by 8 since we are scaling it
	function abc_gen_note_grouping_size(usingTriplets, timeSigTop, timeSigBottom) {
		var note_grouping;

		if (usingTriplets) {
				note_grouping = 12;

		} else if(timeSigTop == 3) {
			// 3/4, 3/8, 3/16
			note_grouping =  8 * (4/timeSigBottom)
		} else if(timeSigTop % 6 == 0 && timeSigBottom % 8 == 0) {
			// 3/4, 6/8, 9/8, 12/8
			note_grouping = 12 * (8/timeSigBottom);
		} else {
			//note_grouping = 8 * (4/timeSigBottom);
			note_grouping = 8;
		}

		return note_grouping;
	}

	root.notesPerMeasureInFullSizeArray = function (is_triplet_division, timeSigTop, timeSigBottom) {
		// a full measure will be defined as 8 * timeSigTop.   (4 = 32, 5 = 40, 6 = 48, etc.)
		// that implies 32nd notes in quarter note beats
		// TODO: should we support triplets here?
		if (is_triplet_division)
			return 48 * (timeSigTop/timeSigBottom);
		else
			return 32 * (timeSigTop/timeSigBottom);
	}

	// since note values are 16ths or 12ths this corrects for that by multiplying note values
	// timeSigTop is the top number in a time signature (4/4, 5/4, 6/8, 7/4, etc)
	root.getNoteScaler = function (notes_per_measure, timeSigTop, timeSigBottom) {
		var scaler;

		if (!timeSigTop || timeSigTop < 1 || timeSigTop > 36) {
			console.log("Error in getNoteScaler, out of range: " + timeSigTop);
			scaler = 1;
		} else {
			if (root.isTripletDivisionFromNotesPerMeasure(notes_per_measure, timeSigTop, timeSigBottom))
				scaler = Math.ceil(root.notesPerMeasureInFullSizeArray(true, timeSigTop, timeSigBottom) / notes_per_measure);
			else
				scaler = Math.ceil(root.notesPerMeasureInFullSizeArray(false, timeSigTop, timeSigBottom) / notes_per_measure);
		}

		return scaler;
	};

	// take any size array and make it larger by padding it with rests in the spaces between
	// For triplets, expands to 48 notes per measure
	// For non Triplets, expands to 32 notes per measure
	root.scaleNoteArrayToFullSize = function(note_array, num_measures, notes_per_measure, timeSigTop, timeSigBottom) {
		var scaler = root.getNoteScaler(notes_per_measure, timeSigTop, timeSigBottom); // fill proportionally
		var retArray = [];
		var isTriplets = root.isTripletDivisionFromNotesPerMeasure(notes_per_measure, timeSigTop, timeSigBottom);
		var i;

		if (scaler == 1)
			return note_array; // no need to expand

		// preset to false (rest) all entries in the expanded array
		for (i = 0; i < num_measures * notes_per_measure * scaler; i++)
			retArray[i] = false;

		// sparsely fill in the return array with data from passed in array
		for (i = 0; i < num_measures * notes_per_measure; i++) {
			var ret_array_index = (i) * scaler;

			retArray[ret_array_index] = note_array[i];
		}

		return retArray;
	}

	// count the number of note positions that are not rests in all the arrays
	// FFFxFFFxF  would be 2
	function count_active_notes_in_arrays(array_of_arrays, start_index, how_far_to_measure) {
		var num_active_notes = 0;

		for (var i = start_index; i < start_index + how_far_to_measure; i++) {
			for(var which_array = 0; which_array < array_of_arrays.length; which_array++) {
				if (array_of_arrays[which_array][i] !== false) {
					num_active_notes++;
					which_array = array_of_arrays.length;  // exit this inner for loop immediately
				}
			}
		}

		return num_active_notes;
	}

	// takes 4 arrays 48 elements long that represent the stickings, snare, HH & kick.
	// each element contains either the note value in ABC "F","^g" or false to represent off
	// translates them to an ABC string (in 2 voices if !kick_stems_up)
	// post_voice_abc is a string added to the end of each voice line that can end the line
	//
	// We output 48 notes in the ABC rather than the traditional 16 or 32 for 4/4 time.
	// This is because of the stickings above the bar are a separate voice and should not have the "3" above them
	// This could be changed to using the normal number and moving all the stickings down to be comments on each note in one voice (But is a pretty big change)
	function snare_HH_kick_ABC_for_triplets(sticking_array,
																					HH_array,
																					snare_array,
																					kick_array,
																					toms_array,
																					post_voice_abc,
																					num_notes,
																					sub_division,
																					notes_per_measure,
																					kick_stems_up,
																					timeSigTop,
																					timeSigBottom,
																					numberOfMeasuresPerLine) {

		var scaler = 1; // we are always in 48 notes here, and the ABC needs to think we are in 48 since the specified division is 1/32
		var ABC_String = "";
		var stickings_voice_string = "V:Stickings\n";
		var hh_snare_voice_string = "V:Hands stem=up\n%%voicemap drum\n";
		var kick_voice_string = "V:Feet stem=down\n%%voicemap drum\n";
		var all_drum_array_of_array;

		// console.log(HH_array);
		// console.log(kick_array);
		// console.log(notes_per_measure);
		// console.log(sub_division);

		if(kick_stems_up) {
			all_drum_array_of_array = [snare_array, HH_array, kick_array];
		} else {
			all_drum_array_of_array = [snare_array, HH_array];  // exclude the kick
		}
		if(toms_array)
			all_drum_array_of_array = all_drum_array_of_array.concat(toms_array);

		// occationally we will change the sub_division output to 1/8th or 1/16th notes when we detect a beat that is better displayed that way
		// By default we use the base sub_division but this can be set different below
		var faker_sub_division = sub_division;

		for (var i = 0; i < num_notes; i++) {

			// triplets are special.  We want to output a note or a rest for every space of time
			// 8th note triplets should always use rests
			// end_of_group should be
			//  "4" for 1/8th note triplets
			//  "2" for 1/16th note triplets
			//  "1" for 1/32nd note triplets.
			var end_of_group = 48/faker_sub_division;
			var grouping_size_for_rests = end_of_group;
			var skip_adding_more_notes = false;

			if((i % notes_per_measure) + end_of_group > notes_per_measure) {
				// if we are in an odd time signature then the last few notes will have a different grouping to reach the end of the measure
				end_of_group = notes_per_measure - (i % num_notes);
			}

			if (i % abc_gen_note_grouping_size(true, timeSigTop, timeSigBottom) === 0) {

				// Look for some special cases that will format beats as non triplet groups.   Quarter notes, 1/8th and 1/16th notes only.

				// look for a whole beat of rests
				if (0 == count_active_notes_in_arrays(all_drum_array_of_array, i, 12)) {
					// there are no notes in the next beat.   Let's output a special string for a quarter note rest
					skip_adding_more_notes = true;
					stickings_voice_string += "x8";
					hh_snare_voice_string += "z8";  // quarter note rest
					i += 11;  // skip past all the rests


				// look for 1/4 note with no triplets  "x--"
				} else if( (0 == count_active_notes_in_arrays(all_drum_array_of_array, i+1, 11)) ) {

					// code duplicated from below
					// clear any invalid stickings since they will mess up the formatting greatly
					for(var si = i+1; si < i+12; si++)
						sticking_array[si] = false;
					stickings_voice_string += getABCforRest([sticking_array], i, 8, scaler, true);
					stickings_voice_string += getABCforNote([sticking_array], i, 8, scaler);

					if (kick_stems_up) {
						hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, 8, scaler);
						kick_voice_string = "";
					} else {
						hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, 8, scaler);
						kick_voice_string += getABCforNote([kick_array], i, 8, scaler);
					}

					skip_adding_more_notes = true;
					i += 11;  // skip past to the next beat

				// look for two 1/8 notes with no triplets in 1/16th & 1/32nd note triplets.   "x--x--", "x-----x-----"
				} else if( sub_division > 12 && 0 == count_active_notes_in_arrays(all_drum_array_of_array, i+1, 5) &&
										        0 == count_active_notes_in_arrays(all_drum_array_of_array, i+7, 5) ) {

					// think of the 1/8 notes as two groups of 3 notes
					for(var eighth_index=i; eighth_index <= i+6; eighth_index += 6) {
						// code duplicated from below
						// clear any invalid stickings since they will mess up the formatting greatly
						for(var si = eighth_index+1; si < eighth_index+6; si++)
							sticking_array[si] = false;
						stickings_voice_string += getABCforRest([sticking_array], eighth_index, 4, scaler, true);
						stickings_voice_string += getABCforNote([sticking_array], eighth_index, 4, scaler);

						if (kick_stems_up) {
							hh_snare_voice_string += getABCforRest(all_drum_array_of_array, eighth_index, 4, scaler, false);
							hh_snare_voice_string += getABCforNote(all_drum_array_of_array, eighth_index, 4, scaler);
							kick_voice_string = "";
						} else {
							hh_snare_voice_string += getABCforRest(all_drum_array_of_array, eighth_index, 4, scaler, false);
							hh_snare_voice_string += getABCforNote(all_drum_array_of_array, eighth_index, 4, scaler);
							kick_voice_string += getABCforNote([kick_array], eighth_index, 4, scaler);
						}
					}

					skip_adding_more_notes = true;
					i += 11;  // skip past to the next beat

				// look for 1/16th notes with no triplets in 1/32nd note triplets.   "x--x--"
				} else if( sub_division == 48 && 0 == count_active_notes_in_arrays(all_drum_array_of_array, i+1,  2) &&
									             0 == count_active_notes_in_arrays(all_drum_array_of_array, i+4,  2) &&
									             0 == count_active_notes_in_arrays(all_drum_array_of_array, i+7,  2) &&
									             0 == count_active_notes_in_arrays(all_drum_array_of_array, i+10, 2)) {

					// think of the 1/8 notes as two groups of 3 notes
					for(var eighth_index=i; eighth_index <= i+9; eighth_index += 3) {
						// code duplicated from below
						// clear any invalid stickings since they will mess up the formatting greatly
						for(var si = eighth_index+1; si < eighth_index+3; si++)
							sticking_array[si] = false;
						stickings_voice_string += getABCforRest([sticking_array], eighth_index, 2, scaler, true);
						stickings_voice_string += getABCforNote([sticking_array], eighth_index, 2, scaler);

						if (kick_stems_up) {
							hh_snare_voice_string += getABCforRest(all_drum_array_of_array, eighth_index, 2, scaler, false);
							hh_snare_voice_string += getABCforNote(all_drum_array_of_array, eighth_index, 2, scaler);
							kick_voice_string = "";
						} else {
							hh_snare_voice_string += getABCforRest(all_drum_array_of_array, eighth_index, 2, scaler, false);
							hh_snare_voice_string += getABCforNote(all_drum_array_of_array, eighth_index, 2, scaler);
							kick_voice_string += getABCforNote([kick_array], eighth_index, 2, scaler);
						}
					}

					skip_adding_more_notes = true;
					i += 11;  // skip past to the next beat

				} else {
					// the normal case.   We tell ABC that we are using a triplet
					var notes_in_triplet_group = sub_division / 4;    // 4 beats

					// look through the notes and see if we should "fake" 1/8 or 1/6th note triplets
					// If the groove can be expressed in "3" or "6" groups it is way easier to read than in a higher "12" group with rests
					// "3" looks like "x---x---x---"   one note and three rests
					// "6" looks like "x-x-x-x-x-x-"   one note and one rest
					if(sub_division == 48) {
						var can_fake_threes = true;
						var can_fake_sixes = true;
						for (var j = i; j < i+12; j += 4) {
							if(0 < count_active_notes_in_arrays(all_drum_array_of_array, j+1, 3)) {
								can_fake_threes = false
							}
							if(0 < count_active_notes_in_arrays(all_drum_array_of_array, j+1, 1) ||
							   0 < count_active_notes_in_arrays(all_drum_array_of_array, j+3, 1)) {
								can_fake_sixes = false
							}
							if(can_fake_threes == false && can_fake_sixes == false)
								break;  // skip the rest, since we have an answer already
						}

						// reset

						if(can_fake_threes)
							faker_sub_division = 12;
						else if(can_fake_sixes)
							faker_sub_division = 24;
						else
							faker_sub_division = sub_division;  // reset

						end_of_group = 48/faker_sub_division;
						grouping_size_for_rests = end_of_group;
						notes_in_triplet_group = faker_sub_division / 4;    // 4 beats
					}


					// creates the 3, 6 or 12 over the note grouping
					// looks like (3:3:3 or (6:6:6 or (12:12:12
					hh_snare_voice_string += "(" + notes_in_triplet_group +	":" + notes_in_triplet_group + ":" + notes_in_triplet_group;
				}
			}

			// skip the code to add notes
			// Happens for special_rest when there are no notes for the next whole beat.
			// Happens when we found only a 1/4 or 1/8 note instead of triplets
			if(!skip_adding_more_notes) {
				if (i % grouping_size_for_rests === 0) {
					// we will output a rest for each place there could be a note
					stickings_voice_string += getABCforRest([sticking_array], i, grouping_size_for_rests, scaler, true);

					if (kick_stems_up) {
						hh_snare_voice_string += getABCforRest(all_drum_array_of_array, i, grouping_size_for_rests, scaler, false);
						kick_voice_string = "";
					} else {
						hh_snare_voice_string += getABCforRest(all_drum_array_of_array, i, grouping_size_for_rests, scaler, false);
						kick_voice_string += getABCforRest([kick_array], i, grouping_size_for_rests, scaler, true);
					}
				}

				stickings_voice_string += getABCforNote([sticking_array], i, end_of_group, scaler);

				if (kick_stems_up) {
					hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, end_of_group, scaler);
					kick_voice_string = "";
				} else {
					hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, end_of_group, scaler);
					kick_voice_string += getABCforNote([kick_array], i, end_of_group, scaler);
				}
			}

			if ((i % abc_gen_note_grouping_size(true, timeSigTop, timeSigBottom)) == abc_gen_note_grouping_size(true, timeSigTop, timeSigBottom) - 1) {
				stickings_voice_string += " ";
				hh_snare_voice_string += " "; // Add a space to break the bar line every group notes
				kick_voice_string += " ";
			}

			// add a bar line every measure
			if (((i + 1) % (12 * timeSigTop * (4/timeSigBottom))) === 0) {
				stickings_voice_string += "|";
				hh_snare_voice_string += "|";
				kick_voice_string += "|";

				// add a line break every numberOfMeasuresPerLine measures
				if (i < num_notes-1 && ((i + 1) % ((12 * timeSigTop * (4/timeSigBottom)) * numberOfMeasuresPerLine)) === 0) {
					stickings_voice_string += "\n";
					hh_snare_voice_string += "\n";
					kick_voice_string += "\n";
				}
			}
		}

		if (kick_stems_up)
			ABC_String += stickings_voice_string + post_voice_abc + hh_snare_voice_string + post_voice_abc;
		else
			ABC_String += stickings_voice_string + post_voice_abc + hh_snare_voice_string + post_voice_abc + kick_voice_string + post_voice_abc;

		return ABC_String;
	}

	// takes 4 arrays 32 elements long that represent the sticking, snare, HH & kick.
	// each element contains either the note value in ABC "F","^g" or false to represent off
	// translates them to an ABC string in 3 voices
	// post_voice_abc is a string added to the end of each voice line that can end the line
	//
	function snare_HH_kick_ABC_for_quads(sticking_array,
																			 HH_array,
																			 snare_array,
																			 kick_array,
																			 toms_array,
																			 post_voice_abc,
																			 num_notes,
																			 sub_division,
																			 notes_per_measure,
																			 kick_stems_up,
																			 timeSigTop,
																			 timeSigBottom,
																			 numberOfMeasuresPerLine) {

		var scaler = 1; // we are always in 32ths notes here
		var ABC_String = "";
		var stickings_voice_string = "V:Stickings\n"; // for stickings.  they are all rests with text comments added
		var hh_snare_voice_string = "V:Hands stem=up\n%%voicemap drum\n"; // for hh and snare
		var kick_voice_string = "V:Feet stem=down\n%%voicemap drum\n"; // for kick drum
		var all_drum_array_of_array;

		all_drum_array_of_array = [snare_array, HH_array];  // exclude the kick
		if(toms_array)
			all_drum_array_of_array = all_drum_array_of_array.concat(toms_array);
		// Add the kick array last to solve a subtle bug with the kick foot splash combo note
		// If the combo note comes last in a multi note event it will space correctly.  If it
		// comes first it will create a wrong sized note
    if(kick_stems_up)
      all_drum_array_of_array = all_drum_array_of_array.concat([kick_array]);

		for (var i = 0; i < num_notes; i++) {

			var grouping_size_for_rests = abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom);
			// make sure the group end doesn't go beyond the measure.   Happens in odd time sigs
			if((i % notes_per_measure) + grouping_size_for_rests > notes_per_measure) {
				// if we are in an odd time signature then the last few notes will have a different grouping to reach the end of the measure
				grouping_size_for_rests = notes_per_measure - (i % notes_per_measure);
			}

			var end_of_group;
			if (i % abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom) === 0)
				end_of_group = abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom);
			else
				end_of_group = (abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom) - ((i) % abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom)));

			// make sure the group end doesn't go beyond the measure.   Happens in odd time sigs
			if((i % notes_per_measure) + end_of_group > notes_per_measure) {
				// if we are in an odd time signature then the last few notes will have a different grouping to reach the end of the measure
				end_of_group = notes_per_measure - (i % notes_per_measure);
			}

			if (i % abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom) === 0) {
				// we will only output a rest at the beginning of a beat phrase
				stickings_voice_string += getABCforRest([sticking_array], i, grouping_size_for_rests, scaler, true);

				if (kick_stems_up) {
					hh_snare_voice_string += getABCforRest(all_drum_array_of_array, i, grouping_size_for_rests, scaler, false);
					kick_voice_string = "";
				} else {
					hh_snare_voice_string += getABCforRest(all_drum_array_of_array, i, grouping_size_for_rests, scaler, false);
					kick_voice_string += getABCforRest([kick_array], i, grouping_size_for_rests, scaler, false);
				}
			}

			stickings_voice_string += getABCforNote([sticking_array], i, end_of_group, scaler);

			if (kick_stems_up) {
				hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, end_of_group, scaler);
				kick_voice_string = "";
			} else {
				hh_snare_voice_string += getABCforNote(all_drum_array_of_array, i, end_of_group, scaler);
				kick_voice_string += getABCforNote([kick_array], i, end_of_group, scaler);
			}

			if ((i % abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom)) == abc_gen_note_grouping_size(false, timeSigTop, timeSigBottom) - 1) {

				stickings_voice_string += " ";
				hh_snare_voice_string += " "; // Add a space to break the bar line every group notes
				kick_voice_string += " ";
			}

			// add a bar line every measure.   32 notes in 4/4 time.   (32/timeSigBottom * timeSigTop)
			if (((i + 1) % ((32/timeSigBottom) * timeSigTop)) === 0) {
				stickings_voice_string += "|";
				hh_snare_voice_string += "|";
				kick_voice_string += "|";
			}
			// add a line break every numberOfMeasuresPerLine measures, except the last
			if (i < num_notes-1 && ((i + 1) % ((32/timeSigBottom) * timeSigTop * numberOfMeasuresPerLine)) === 0) {
				stickings_voice_string += "\n";
				hh_snare_voice_string += "\n";
				kick_voice_string += "\n";
			}
		}

		if (kick_stems_up)
			ABC_String += stickings_voice_string + post_voice_abc + hh_snare_voice_string + post_voice_abc;
		else
			ABC_String += stickings_voice_string + post_voice_abc + hh_snare_voice_string + post_voice_abc + kick_voice_string + post_voice_abc;

		return ABC_String;
	}

	// create an array that can be used for note mapping
	// it is just an array of true/false that specifies weather a note can appear at that index
	root.create_note_mapping_array_for_highlighting = function (HH_array, snare_array, kick_array, toms_array, num_notes) {
		var mapping_array = new Array(num_notes); // create large empty array

		for (var i = 0; i < num_notes; i++) {
			if ((HH_array && HH_array[i] !== false) ||
				(snare_array && snare_array[i] !== false) ||
				(kick_array && kick_array[i] !== false)) {
				mapping_array[i] = true;
			} else {
				mapping_array[i] = false;

				// check toms as well with for loop
				if(toms_array) {
					for(var j = 0; j < constant_NUMBER_OF_TOMS; j++) {
						if(toms_array[j][i] !== undefined && toms_array[j][i] !== false)
							mapping_array[i] = true;
					}
				}
			}
		}

		return mapping_array;
	};

	// function to return 1,e,&,a or 2,3,4,5,6, etc...
	root.figure_out_sticking_count_for_index = function(index, notes_per_measure, sub_division, time_sig_bottom) {

		// figure out the count state by looking at the id and the subdivision
		var note_index = index % notes_per_measure;
		var new_state = 0;
		// 4/2 time changes the implied time from 4 up to 8, etc
		// 6/8 time changes the implied time from 8 down to 4
		var implied_sub_division = sub_division * (4/time_sig_bottom);
		switch(implied_sub_division) {
			case 4:
				new_state = note_index + 1;   // 1,2,3,4,5, etc.
				break;
			case 8:
				if(note_index % 2 === 0)
					new_state = Math.floor(note_index / 2) + 1;  // 1,2,3,4,5, etc.
				else
					new_state = "&";
				break;
			case 12:  // 8th triplets
				if(note_index % 3 === 0)
					new_state = Math.floor(note_index / 3) + 1;  // 1,2,3,4,5, etc.
				else if(note_index % 3 == 1)
					new_state = "&";
				else
					new_state = "a";
				break;
			case 24:  // 16th triplets
				if(note_index % 3 === 0)
					new_state = Math.floor(note_index / 6) + 1;  // 1,2,3,4,5, etc.
				else if(note_index % 3 == 1)
					new_state = "&";
				else
					new_state = "a";
				break;
			case 48:  // 32nd triplets
				if(note_index % 3 === 0)
					new_state = Math.floor(note_index / 12) + 1;  // 1,2,3,4,5, etc.
				else if(note_index % 3 == 1)
					new_state = "&";
				else
					new_state = "a";
				break;
			case 16:
			case 32:  // fall through
			default:
				var whole_note_interval = implied_sub_division/4;
				if(note_index % 4 === 0)
					new_state = Math.floor(note_index / whole_note_interval) + 1;  // 1,1,2,2,3,3,4,4,5,5, etc.
				else if(note_index % 4 === 1)
					new_state = "e";
				else if(note_index % 4 === 2)
					new_state = "&";
				else
					new_state = "a";
				break;
		}

		return new_state;
	};

	// converts the symbol for a sticking count to an actual count based on the time signature
	root.convert_sticking_counts_to_actual_counts = function(sticking_array, time_division, timeSigTop, timeSigBottom) {

		var cur_div_of_array = 32;
		if(root.isTripletDivision(time_division))
			cur_div_of_array = 48;

		var actual_notes_per_measure_in_this_array = root.calc_notes_per_measure(cur_div_of_array, timeSigTop, timeSigBottom);

		// Time division is 4, 8, 16, 32, 12, 24, or 48
		var notes_per_measure_in_time_division = ((time_division / 4) * timeSigTop) * (4/timeSigBottom);

		for(var i in sticking_array) {
			if(sticking_array[i] == constant_ABC_STICK_COUNT) {
				// convert the COUNT into an actual letter or number
				// convert the index into what it would have been if the array was "notes_per_measure" sized
				var adjusted_index = Math.floor(i / (actual_notes_per_measure_in_this_array/notes_per_measure_in_time_division));
				var new_count = root.figure_out_sticking_count_for_index(adjusted_index, notes_per_measure_in_time_division, time_division, timeSigBottom);
				var new_count_string = '"' + new_count + '"x';
				sticking_array[i] = new_count_string;
			}
		}
	};

	// create ABC from note arrays
	// The Arrays passed in must be 32 or 48 notes long
	// notes_per_measure denotes the number of notes that _should_ be in the measure even though the arrays are always scaled up and large (48 or 32)
	root.create_ABC_from_snare_HH_kick_arrays = function (sticking_array,
																												HH_array,
																												snare_array,
																												kick_array,
																												toms_array,
																												post_voice_abc,
																												num_notes,
																												time_division,
																												notes_per_measure,
																												kick_stems_up,
																												timeSigTop,
																												timeSigBottom) {

		// convert sticking count symbol to the actual count
		// do this right before ABC output so it can't every get encoded into something that gets saved.
		root.convert_sticking_counts_to_actual_counts(sticking_array, time_division, timeSigTop, timeSigBottom);

		var numberOfMeasuresPerLine = 2;   // Default

		if (notes_per_measure >= 32) {
			// Only put one measure per line for 32nd notes and above because of width issues
			numberOfMeasuresPerLine = 1;
		}

		if(root.isTripletDivisionFromNotesPerMeasure(notes_per_measure, timeSigTop, timeSigBottom)) {
			return snare_HH_kick_ABC_for_triplets(sticking_array,
																						HH_array,
																						snare_array,
																						kick_array,
																						toms_array,
																						post_voice_abc,
																						num_notes,
																						time_division,
																						notes_per_measure,
																						kick_stems_up,
																						timeSigTop,
																						timeSigBottom,
																						numberOfMeasuresPerLine);
		} else {
			return snare_HH_kick_ABC_for_quads(sticking_array,
																				 HH_array,
																				 snare_array,
																				 kick_array,
																				 toms_array,
																				 post_voice_abc,
																				 num_notes,
																				 time_division,
																				 notes_per_measure,
																				 kick_stems_up,
																				 timeSigTop,
																				 timeSigBottom,
																				 numberOfMeasuresPerLine);
		}
	}

	// create ABC notation from a GrooveData class
	// returns a string of ABC Notation data

	root.createABCFromGrooveData = function (myGrooveData, renderWidth) {

		var FullNoteStickingArray = root.scaleNoteArrayToFullSize(myGrooveData.sticking_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteHHArray = root.scaleNoteArrayToFullSize(myGrooveData.hh_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteSnareArray = root.scaleNoteArrayToFullSize(myGrooveData.snare_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteKickArray = root.scaleNoteArrayToFullSize(myGrooveData.kick_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteTomsArray = [];

		for(var i = 0; i < constant_NUMBER_OF_TOMS; i++) {
			FullNoteTomsArray[i] = root.scaleNoteArrayToFullSize(myGrooveData.toms_array[i], myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		}

		var is_triplet_division = root.isTripletDivisionFromNotesPerMeasure(myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);

		var fullABC = root.get_top_ABC_BoilerPlate(false,
				myGrooveData.title,
				myGrooveData.author,
				myGrooveData.comments,
				myGrooveData.showLegend,
				is_triplet_division,
				myGrooveData.kickStemsUp,
				myGrooveData.numBeats,
				myGrooveData.noteValue,
				renderWidth);

		fullABC += root.create_ABC_from_snare_HH_kick_arrays(FullNoteStickingArray,
			FullNoteHHArray,
			FullNoteSnareArray,
			FullNoteKickArray,
			FullNoteTomsArray,
			"|\n",
			FullNoteHHArray.length,
			myGrooveData.timeDivision,
			root.notesPerMeasureInFullSizeArray(is_triplet_division, myGrooveData.numBeats, myGrooveData.noteValue), // notes_per_measure, We scaled up to 48/32 above
			myGrooveData.kickStemsUp,
			myGrooveData.numBeats,
			myGrooveData.noteValue);

		root.note_mapping_array = root.create_note_mapping_array_for_highlighting(FullNoteHHArray,
				FullNoteSnareArray,
				FullNoteKickArray,
				FullNoteTomsArray,
				FullNoteHHArray.length);

		// console.log(fullABC);
		return fullABC;
	};

	// callback class for abc generator library
	function SVGLibCallback() {
		// -- required methods
		this.abc_svg_output = "";
		this.abc_error_output = "";

		// include a file (%%abc-include)
		this.read_file = function (fn) {
			return "";
		};
		// insert the errors
		this.errmsg = function (msg, l, c) {
			this.abc_error_output += msg + "<br/>\n";
		};

		// for possible playback or linkage
		this.get_abcmodel = function (tsfirst, voice_tb, music_types) {

			/*
			console.log(tsfirst);
			var next = tsfirst.next;

			while(next) {
			console.log(next);
			next = next.next;
			}
			 */
		};

		// annotations
		this.anno_start = function (type, start, stop, x, y, w, h) {};
		var self = this;
		self.svg_highlight_y = 0;
		self.svg_highlight_h = 44;
		this.anno_stop = function (type, start, stop, x, y, w, h) {

			// create a rectangle
			if (type == "bar") {
				// use the bar as the default y & hack
				self.svg_highlight_y = y + 5;
				self.svg_highlight_h = h + 10;
			}
			if (type == "note" || type == "grace") {
				y = self.svg_highlight_y;
				h = self.svg_highlight_h;
				root.abc_obj.out_svg('<rect style="fill: transparent;" class="abcr" id="abcNoteNum_' + root.grooveUtilsUniqueIndex + "_" + root.abcNoteNumIndex + '" x="');
				root.abc_obj.out_sxsy(x, '" y="', 15);
				root.abc_obj.out_svg('" width="' + w.toFixed(2) + '" height="' + (Math.abs(y) + 15 + h).toFixed(2) + '"/>\n');

				//console.log("Type:"+type+ "\t abcNoteNumIndex:"+root.abcNoteNumIndex+ "\t X:"+x+ "\t Y:"+y+ "\t W:"+w+ "\t H:"+h);

				// don't increment on the grace note, since it is attached to the real note
				if (type != "grace")
					root.abcNoteNumIndex++;
			}
		};

		// image output
		this.img_out = function (str) {
			this.abc_svg_output += str; // + '\n'
		};

		// -- optional attributes
		this.page_format = true; // define the non-page-breakable blocks
	}
	var abcToSVGCallback = new SVGLibCallback(); // singleton


	// converts incoming ABC notation source into an svg image.
	// returns an object with two items.   "svg" and "error_html"
	root.renderABCtoSVG = function (abc_source) {
		root.abc_obj = new Abc(abcToSVGCallback);
		if ((root.myGrooveData && root.myGrooveData.showLegend) || root.isLegendVisable)
			root.abcNoteNumIndex = -15; // subtract out the legend notes for a proper index.
		else
			root.abcNoteNumIndex = 0;
		abcToSVGCallback.abc_svg_output = ''; // clear
		abcToSVGCallback.abc_error_output = ''; // clear

		// Put all accents to the top
		// Non-declared feature
		root.abc_obj.psdeco = function (f, x, y, de) {
			if (f === 'accent') {
				root.abc_obj.xygl(x, 10, f);
				return true;
			}
			return false;
		}

		root.abc_obj.tosvg("SOURCE", abc_source);

		let output = abcToSVGCallback.abc_svg_output;

		const labelRegex = /(<text class="f1_1.*?>(.*?)<\/text>)/g
		for (const match of output.matchAll(labelRegex)) {
			const element = match[1];
			const name = match[2];

			for (const label of labels) {
				if (label.name.trim() === name.trim()) {
					output = output.replace(element, element.replace('f1_1', 'f1_1 label_' + label.code));
				}
			}
		};

		// Ghost note styling
		const parenthesisRegex = /(<text class="f0_1.*?>(.*?)<\/text>)/g
		for (const match of output.matchAll(parenthesisRegex)) {
			const element = match[1];
			const text = match[2];

			if (text === constant_ABC_SN_Ghost_Open_Char) {
				// Notice: hardcoded y position
				output = output.replace(element, element.replace('f0_1', 'f0_1 ghost_open').replace(/y="[\d\.]+?"/, 'y="11.8"'));
			}
			if (text === constant_ABC_SN_Ghost_Close_Char) {
				// Notice: hardcoded y position
				output = output.replace(element, element.replace('f0_1', 'f0_1 ghost_close').replace(/y="[\d\.]+?"/, 'y="11.8"'));
			}
		};

		return {
			svg : output,
			error_html : abcToSVGCallback.abc_error_output
		};
	};

	root.isElementOnScreen = function(element){
		var rect = element.getBoundingClientRect();

		return (
			rect.top >= 80 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
			rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
		);
	};

	root.abcNoteNumCurrentlyHighlighted = -1;
	root.clearHighlightNoteInABCSVG = function () {

		if (root.abcNoteNumCurrentlyHighlighted > -1) {
			var myElements = document.querySelectorAll("#abcNoteNum_" + root.grooveUtilsUniqueIndex + "_" + root.abcNoteNumCurrentlyHighlighted);
			for (var i = 0; i < myElements.length; i++) {
				//note.className = note.className.replace(new RegExp(' highlighted', 'g'), "");
				var class_name = myElements[i].getAttribute("class");
				myElements[i].setAttribute("class", class_name.replace(new RegExp(' highlighted', 'g'), ""));
				if(root.debugMode && i === 0) {
					if(!root.isElementOnScreen(myElements[i])) {
						if(root.abcNoteNumCurrentlyHighlighted === 0)
							myElements[i].scrollIntoView({block: "start", behavior: "smooth"});   // autoscroll if necessary
						else
							myElements[i].scrollIntoView({block: "end", behavior: "smooth"});   // autoscroll if necessary
					}
				}
			}
			root.abcNoteNumCurrentlyHighlighted = -1;
		}
	};

	// set note to -1 to unhighlight all notes
	root.highlightNoteInABCSVGByIndex = function (noteToHighlight) {

		root.clearHighlightNoteInABCSVG();

		var myElements = document.querySelectorAll("#abcNoteNum_" + root.grooveUtilsUniqueIndex + "_" + noteToHighlight);
		for (var i = 0; i < myElements.length; i++) {
			myElements[i].setAttribute("class", myElements[i].getAttribute("class") + " highlighted");
			root.abcNoteNumCurrentlyHighlighted = noteToHighlight;
			var parent = myElements[i].parentNode;
			parent.insertBefore(myElements[i], parent.firstChild);
		}
	};

	// cross index the percent complete with the myGrooveData note arrays to find the nth note
	// Then highlight the note
	root.highlightNoteInABCSVGFromPercentComplete = function (percentComplete) {

		if (root.note_mapping_array !== null) {
			// convert percentComplete to an index
			var curNoteIndex = percentComplete * root.note_mapping_array.length;

			// now count through the array with the possible notes to find the note number as
			// it correlates to the ABC
			var real_note_index = -1;
			for (var i = 0; i < curNoteIndex && i < root.note_mapping_array.length; i++) {
				if (root.note_mapping_array[i])
					real_note_index++;
			}

			// now the real_note_index should map to the correct abc note, highlight italics
			root.highlightNoteInABCSVGByIndex(real_note_index);
		}
	};

	// ******************************************************************************************************************
	// ******************************************************************************************************************
	//
	// MIDI functions
	//
	// ******************************************************************************************************************
	// ******************************************************************************************************************
	var baseLocation = ""; // global
	root.getGrooveUtilsBaseLocation = function () {

		if (baseLocation.length > 0)
			return baseLocation;

		if (global_grooveUtilsScriptSrc !== "") {
			var lastSlash = global_grooveUtilsScriptSrc.lastIndexOf("/");
			// lets find the slash before it since we need to go up a directory
			lastSlash = global_grooveUtilsScriptSrc.lastIndexOf("/", lastSlash - 1);
			baseLocation = global_grooveUtilsScriptSrc.slice(0, lastSlash + 1);
		}

		if (baseLocation.length < 1) {
			baseLocation = "https://b125c4f8bf7d89726feec9ab8202d31e0c8d14d8.googledrive.com/host/0B2wxVWzVoWGYfnB5b3VTekxyYUowVjZ5YVE3UllLaVk5dVd4TzF4Q2ZaUXVsazhNSTdRM1E/";
		}

		return baseLocation;
	};

	root.getMidiSoundFontLocation = function () {
		return root.getGrooveUtilsBaseLocation() + "soundfont/";
	};
	root.getMidiImageLocation = function () {
		return root.getGrooveUtilsBaseLocation() + "images/";
	};

	root.midiEventCallbackClass = function (classRoot) {
		this.classRoot = classRoot;
		this.noteHasChangedSinceLastDataLoad = false;

		this.playEvent = function (root) {
			var icon = document.getElementById("midiPlayImage" + root.grooveUtilsUniqueIndex);
			if (icon)
				icon.className = "midiPlayImage Playing";
				if (root.playEventCallback) {
					root.playEventCallback();
				}
		};
		// default loadMIDIDataEvent.  You probably want to override this
		// it will only make changes to the tempo and swing
		// playStarting: boolean that is true on the first time through the midi playback
		this.loadMidiDataEvent = function (root, playStarting) {
			if (root.myGrooveData) {
				root.myGrooveData.tempo = root.getTempo();
				root.myGrooveData.swingPercent = root.getSwing();
				var midiURL = root.create_MIDIURLFromGrooveData(root.myGrooveData);
				root.loadMIDIFromURL(midiURL);
				root.midiEventCallbacks.noteHasChangedSinceLastDataLoad = false;
			} else {
				console.log("can't load midi song.   myGrooveData is empty");
			}
		};
		this.doesMidiDataNeedRefresh = function (root) {
			return root.midiEventCallbacks.noteHasChangedSinceLastDataLoad;
		};
		this.pauseEvent = function (root) {
			var icon = document.getElementById("midiPlayImage" + root.grooveUtilsUniqueIndex);
			if (icon)
				icon.className = "midiPlayImage Paused";
		};

		this.resumeEvent = function (root) {};
		this.stopEvent = function (root) {
			var icon = document.getElementById("midiPlayImage" + root.grooveUtilsUniqueIndex);
			if (icon)
				icon.className = "midiPlayImage Stopped";
		};
		this.repeatChangeEvent = function (root, newValue) {
			if (newValue)
				document.getElementById("midiRepeatImage" + root.grooveUtilsUniqueIndex).src = root.getMidiImageLocation() + "repeat.png";
			else
				document.getElementById("midiRepeatImage" + root.grooveUtilsUniqueIndex).src = root.getMidiImageLocation() + "grey_repeat.png";
		};
		this.percentProgress = function (root, percent) {};
		this.notePlaying = function (root, note_type, note_position) {};

		this.midiInitialized = function (root) {
			var icon = document.getElementById("midiPlayImage" + root.grooveUtilsUniqueIndex);
			if (icon)
				icon.className = "midiPlayImage Stopped";
			document.getElementById("midiPlayImage" + root.grooveUtilsUniqueIndex).onclick = function (event) {
				root.startOrStopMIDI_playback();
			}; // enable play button
			setupHotKeys(); // spacebar to play
		};
	};
	root.midiEventCallbacks = new root.midiEventCallbackClass(root);

	// set a URL for midi playback.
	// useful for static content, so you don't have to override the loadMidiDataEvent callback
	root.setGrooveData = function (grooveData) {
		root.myGrooveData = grooveData;
	};

	// This is called so that the MIDI player will reload the groove
	// at repeat time.   If not set then the midi player just repeats what is already loaded.
	root.midiNoteHasChanged = function () {
		root.midiEventCallbacks.noteHasChangedSinceLastDataLoad = true;
	};
	root.midiResetNoteHasChanged = function () {
		root.midiEventCallbacks.noteHasChangedSinceLastDataLoad = false;
	};

	root.MIDI_build_midi_url_count_in_track = function (timeSigTop, timeSigBottom) {

		var midiFile = new Midi.File();
		var midiTrack = new Midi.Track();
		midiFile.addTrack(midiTrack);

		midiTrack.setTempo(root.getTempo());
		midiTrack.setInstrument(0, 0x13);

		// start of midi track
		// Some sort of bug in the midi player makes it skip the first note without a blank
		// TODO: Find and fix midi bug
		midiTrack.addNoteOff(9, 60, 1); // add a blank note for spacing

        var noteDelay = 128;  // quarter notes over x/4 time
        if(timeSigBottom == 8)
            noteDelay = 64;  // 8th notes over x/8 time
        else if(timeSigBottom == 16)
            noteDelay = 32;  // 16th notes over x/16 time

		// add count in
		midiTrack.addNoteOn(9, constant_OUR_MIDI_METRONOME_1, 0, constant_OUR_MIDI_VELOCITY_NORMAL);
		midiTrack.addNoteOff(9, constant_OUR_MIDI_METRONOME_1, noteDelay);
		for (var i = 1; i < timeSigTop; i++) {
			midiTrack.addNoteOn(9, constant_OUR_MIDI_METRONOME_NORMAL, 0, constant_OUR_MIDI_VELOCITY_NORMAL);
			midiTrack.addNoteOff(9, constant_OUR_MIDI_METRONOME_NORMAL, noteDelay);
		}

		var midi_url = "data:audio/midi;base64," + btoa(midiFile.toBytes());

		return midi_url;
	};

	/*
	 * midi_output_type:  "general_MIDI" or "Custom"
	 * num_notes: number of notes in the arrays  (currently expecting 32 notes per measure)
	 * metronome_frequency: 0, 4, 8, 16   None, quarter notes, 8th notes, 16ths
	 * num_notes_for_swing: how many notes are we using.   Since we need to know where the upstrokes are we need to know
	 *                      what the proper division is.   It can change when we are doing permutations, otherwise it is what is the
	 *                      class_notes_per_measure
	 *
	 * The arrays passed in contain the ABC notation for a given note value or false for a rest.
	 */
	root.MIDI_from_HH_Snare_Kick_Arrays = function (midiTrack, HH_Array, Snare_Array, Kick_Array, Toms_Array, midi_output_type, metronome_frequency, num_notes, num_notes_for_swing, swing_percentage, timeSigTop, timeSigBottom) {
		var prev_metronome_note = false;
		var prev_hh_note = 46;  // default to open hi-hat so that the first hi-hat note also mutes any previous hh open.
		var prev_snare_note = false;
		var prev_kick_note = false;
		var prev_kick_splash_note = false;
		var midi_channel = 9;  // percussion

		if (swing_percentage < 0 || swing_percentage > 0.99) {
			console.log("Swing percentage out of range in GrooveUtils.MIDI_from_HH_Snare_Kick_Arrays");
			swing_percentage = 0;
		}

		// start of midi track
		// Some sort of bug in the midi player makes it skip the first note without a blank
		// TODO: Find and fix midi bug
		if (midiTrack.events.length < 4) {
			midiTrack.addNoteOff(midi_channel, 60, 1); // add a blank note for spacing
		}

    var isTriplets = root.isTripletDivisionFromNotesPerMeasure(num_notes, timeSigTop, timeSigBottom);
    var offsetClickStartBeat = root.getMetronomeOptionsOffsetClickStartRotation(isTriplets);
    var delay_for_next_note = 0;

		for (var i = 0; i < num_notes; i++) {

			var duration = 0;

			if (isTriplets) {
				duration = 10.666; // "ticks"   16 for 32nd notes.  10.66 for 48th triplets
			} else {
				duration = 16;
			}

			if (swing_percentage !== 0) {
				// swing effects the note placement of the e and the a.  (1e&a)
				// swing increases the distance between the 1 and the e ad shortens the distance between the e and the &
				// likewise the distance between the & and the a is increased and the a and the 1 is shortened
				//  So it sounds like this:   1-e&-a2-e&-a3-e&-a4-e&-a
				var scaler = num_notes / num_notes_for_swing;
				var val = i % (4 * scaler);

				if (val < scaler) {
					// this is the 1, increase the distance between this note and the e
					duration += (duration * swing_percentage);
				} else if (val < scaler * 2) {
					// this is the e, shorten the distance between this note and the &
					duration -= (duration * swing_percentage);
				} else if (val < scaler * 3) {
					// this is the &, increase the distance between this note and the a
					duration += (duration * swing_percentage);
				} else if (val < scaler * 4) {
					// this is the a, shorten the distance between this note and the 2
					duration -= (duration * swing_percentage);
				}
			}

			// Metronome sounds.
			var metronome_note = false;
			var metronome_velocity = constant_OUR_MIDI_VELOCITY_ACCENT;
			if (metronome_frequency > 0) {
				var quarterNoteFrequency = (isTriplets ? 12 : 8);
				var eighthNoteFrequency = (isTriplets ? 6 : 4);
				var sixteenthNoteFrequency = (isTriplets ? 2 : 2);

				var metronome_specific_index = i;
				switch (offsetClickStartBeat) {
				case "1":
					// default do nothing
					break;
				case "E":
					if (isTriplets)
						console.log("OffsetClickStart error in MIDI_from_HH_Snare_Kick_Arrays");
					// shift by one sixteenth note
					metronome_specific_index -= sixteenthNoteFrequency;
					break;
				case "AND":
					if (isTriplets)
						console.log("OffsetClickStart error in MIDI_from_HH_Snare_Kick_Arrays");
					// shift by two sixteenth notes
					metronome_specific_index -= (2 * sixteenthNoteFrequency);
					break;
				case "A":
					if (isTriplets)
						console.log("OffsetClickStart error in MIDI_from_HH_Snare_Kick_Arrays");
					// shift by three sixteenth notes
					metronome_specific_index -= (3 * sixteenthNoteFrequency);
					break;
				case "TI":
					if (!isTriplets)
						console.log("OffsetClickStart error in MIDI_from_HH_Snare_Kick_Arrays");
					// shift by one sixteenth note
					metronome_specific_index -= sixteenthNoteFrequency * 2;
					break;
				case "TA":
					if (!isTriplets)
						console.log("OffsetClickStart error in MIDI_from_HH_Snare_Kick_Arrays");
					// shift by two sixteenth notes
					metronome_specific_index -= (2 * (sixteenthNoteFrequency * 2));
					break;
				default:
					console.log("bad case in MIDI_from_HH_Snare_Kick_Arrays");
					break;
				}

				if (metronome_specific_index >= 0) { // can go negative due to MetronomeOffsetClickStart shift above
					// Special sound on the one
					if (metronome_specific_index === 0 || (metronome_specific_index % (quarterNoteFrequency * timeSigTop * (4/timeSigBottom))) === 0) {
						metronome_note = constant_OUR_MIDI_METRONOME_1; // 1 count

					} else if ((metronome_specific_index % quarterNoteFrequency) === 0) {
						metronome_note = constant_OUR_MIDI_METRONOME_NORMAL; // standard metronome click
					}

					if (!metronome_note && metronome_frequency == 8) { // 8th notes requested
						if ((metronome_specific_index % eighthNoteFrequency) === 0) {
							// click every 8th note
							metronome_note = constant_OUR_MIDI_METRONOME_NORMAL; // standard metronome click
						}

					} else if (!metronome_note && metronome_frequency == 16) { // 16th notes requested
						if ((metronome_specific_index % sixteenthNoteFrequency) === 0) {
							// click every 16th note
							metronome_note = constant_OUR_MIDI_METRONOME_NORMAL; // standard metronome click
							metronome_velocity = 25; // not as loud as the normal click
						}
					}
				}

				if (metronome_note !== false) {
					//if(prev_metronome_note != false)
					//	midiTrack.addNoteOff(midi_channel, prev_metronome_note, 0);
					midiTrack.addNoteOn(midi_channel, metronome_note, delay_for_next_note, metronome_velocity);
					delay_for_next_note = 0; // zero the delay
					//prev_metronome_note = metronome_note;
				}
			}

			if (!root.metronomeSolo) { // midiSolo means to play just the metronome
				var hh_velocity = constant_OUR_MIDI_VELOCITY_NORMAL;
				var hh_note = false;
				switch (HH_Array[i]) {
				case constant_ABC_HH_Normal: // normal
				case constant_ABC_HH_Close: // normal
					hh_note = constant_OUR_MIDI_HIHAT_NORMAL;
					break;
				case constant_ABC_HH_Accent: // accent
					if (midi_output_type == "general_MIDI") {
						hh_note = constant_OUR_MIDI_HIHAT_NORMAL;
						hh_velocity = constant_OUR_MIDI_VELOCITY_ACCENT;
					} else {
						hh_note = constant_OUR_MIDI_HIHAT_ACCENT;
					}
					break;
				case constant_ABC_HH_Open: // open
					hh_note = constant_OUR_MIDI_HIHAT_OPEN;
					break;
				case constant_ABC_HH_Ride: // ride
					hh_note = constant_OUR_MIDI_HIHAT_RIDE;
					break;
				case constant_ABC_HH_Ride_Bell: // ride bell
					hh_note = constant_OUR_MIDI_HIHAT_RIDE_BELL;
					break;
				case constant_ABC_HH_Cow_Bell: // cow bell
					hh_note = constant_OUR_MIDI_HIHAT_COW_BELL;
					break;
				case constant_ABC_HH_Crash: // crash
					hh_note = constant_OUR_MIDI_HIHAT_CRASH;
					break;
				case constant_ABC_HH_Stacker: // stacker
					hh_note = constant_OUR_MIDI_HIHAT_STACKER;
					break;
				case constant_ABC_HH_Metronome_Normal: // Metronome beep
					hh_note = constant_OUR_MIDI_HIHAT_METRONOME_NORMAL;
					break;
        case constant_ABC_HH_Metronome_Accent: // Metronome beep
					hh_note = constant_OUR_MIDI_HIHAT_METRONOME_ACCENT;
					break;
        case false:
					break;
				default:
					console.log("Bad case in GrooveUtils.MIDI_from_HH_Snare_Kick_Arrays");
					break;
				}

				if (hh_note !== false) {
					// need to end hi-hat open notes else the hh open sounds horrible
					if (prev_hh_note !== false) {
						midiTrack.addNoteOff(midi_channel, prev_hh_note, delay_for_next_note);
						prev_hh_note = false;
						delay_for_next_note = 0; // zero the delay
					}
					midiTrack.addNoteOn(midi_channel, hh_note, delay_for_next_note, hh_velocity);
					delay_for_next_note = 0; // zero the delay

					// this if means that only the open hi-hat will get stopped on the next note
					if (HH_Array[i] == constant_ABC_HH_Open)
						prev_hh_note = hh_note;
				}

				var snare_velocity = constant_OUR_MIDI_VELOCITY_NORMAL;
				var snare_note = false;
				switch (Snare_Array[i]) {
				case constant_ABC_SN_Normal: // normal
					snare_note = constant_OUR_MIDI_SNARE_NORMAL;
					break;
				case constant_ABC_SN_Flam: // flam
					if (midi_output_type == "general_MIDI") {
						snare_note = constant_OUR_MIDI_SNARE_NORMAL;
						snare_velocity = constant_OUR_MIDI_VELOCITY_ACCENT;
					} else {
						snare_note = constant_OUR_MIDI_SNARE_FLAM;
						snare_velocity = constant_OUR_MIDI_VELOCITY_NORMAL;
					}
					break;
				case constant_ABC_SN_Drag: // drag
					if (midi_output_type == "general_MIDI") {
						snare_note = constant_OUR_MIDI_SNARE_NORMAL;
						snare_velocity = constant_OUR_MIDI_VELOCITY_ACCENT;
					} else {
						snare_note = constant_OUR_MIDI_SNARE_DRAG;
						snare_velocity = constant_OUR_MIDI_VELOCITY_NORMAL;
					}
					break;
				case constant_ABC_SN_Accent: // accent
					if (midi_output_type == "general_MIDI") {
						snare_note = constant_OUR_MIDI_SNARE_NORMAL;
						snare_velocity = constant_OUR_MIDI_VELOCITY_ACCENT;
					} else {
						snare_note = constant_OUR_MIDI_SNARE_ACCENT; // custom note
					}
					break;
				case constant_ABC_SN_Ghost: // ghost
					if (midi_output_type == "general_MIDI") {
						snare_note = constant_OUR_MIDI_SNARE_NORMAL;
						snare_velocity = constant_OUR_MIDI_VELOCITY_GHOST;
					} else {
						snare_note = constant_OUR_MIDI_SNARE_GHOST;
						snare_velocity = constant_OUR_MIDI_VELOCITY_GHOST;
					}
					break;
				case constant_ABC_SN_XStick: // xstick
					snare_note = constant_OUR_MIDI_SNARE_XSTICK;
					break;
				case constant_ABC_SN_Buzz: // xstick
					snare_note = constant_OUR_MIDI_SNARE_BUZZ;
					break;
				case false:
					break;
				default:
					console.log("Bad case in GrooveUtils.MIDI_from_HH_Snare_Kick_Arrays");
					break;
				}

				if (snare_note !== false) {
					//if(prev_snare_note != false)
					//	midiTrack.addNoteOff(midi_channel, prev_snare_note, 0);
					midiTrack.addNoteOn(midi_channel, snare_note, delay_for_next_note, snare_velocity);
					delay_for_next_note = 0; // zero the delay
					//prev_snare_note = snare_note;
				}

				var kick_note = false;
				var kick_splash_note = false;
				switch (Kick_Array[i]) {
				case constant_ABC_KI_Splash: // just HH Foot
					kick_splash_note = constant_OUR_MIDI_HIHAT_FOOT;
					break;
				case constant_ABC_KI_SandK: // Kick & HH Foot
					kick_splash_note = constant_OUR_MIDI_HIHAT_FOOT;
					kick_note = constant_OUR_MIDI_KICK_NORMAL;
					break;
				case constant_ABC_KI_Normal: // just Kick
					kick_note = constant_OUR_MIDI_KICK_NORMAL;
					break;
				case false:
					break;
				default:
					console.log("Bad case in GrooveUtils.MIDI_from_HH_Snare_Kick_Arrays");
					break;
				}
				if (kick_note !== false) {
					//if(prev_kick_note != false)
					//	midiTrack.addNoteOff(midi_channel, prev_kick_note, 0);
					midiTrack.addNoteOn(midi_channel, kick_note, delay_for_next_note, constant_OUR_MIDI_VELOCITY_NORMAL);
					delay_for_next_note = 0; // zero the delay
					//prev_kick_note = kick_note;
				}
				if (kick_splash_note !== false) {
					if (prev_hh_note !== false) {
						midiTrack.addNoteOff(midi_channel, prev_hh_note, delay_for_next_note);
						prev_hh_note = false;
						delay_for_next_note = 0; // zero the delay
					}
					//if(prev_kick_splash_note != false)
					//	midiTrack.addNoteOff(midi_channel, prev_kick_splash_note, 0);
					midiTrack.addNoteOn(midi_channel, kick_splash_note, delay_for_next_note, constant_OUR_MIDI_VELOCITY_NORMAL);
					delay_for_next_note = 0; // zero the delay
					//prev_kick_splash_note = kick_splash_note;
				}

				if(Toms_Array) {
					for(var which_array = 0; which_array < constant_NUMBER_OF_TOMS; which_array++) {
						var tom_note = false;
						if(Toms_Array[which_array][i] !== undefined) {
							switch (Toms_Array[which_array][i]) {
							case constant_ABC_T1_Normal: // Tom 1
								tom_note = constant_OUR_MIDI_TOM1_NORMAL;  // midi code High tom 2
								break;
							case constant_ABC_T2_Normal: // Midi code Mid tom 1
								tom_note = constant_OUR_MIDI_TOM2_NORMAL;
								break;
							case constant_ABC_T3_Normal: // Midi code Mid tom 2
								tom_note = constant_OUR_MIDI_TOM3_NORMAL;
								break;
							case constant_ABC_T4_Normal: // Midi code Low Tom 1
								tom_note = constant_OUR_MIDI_TOM4_NORMAL;
								break;
							case false:
								break;
							default:
								console.log("Bad case in GrooveUtils.MIDI_from_HH_Snare_Kick_Arrays");
								break;
							}
						}
						if (tom_note !== false) {
							midiTrack.addNoteOn(midi_channel, tom_note, delay_for_next_note, constant_OUR_MIDI_VELOCITY_NORMAL);
							delay_for_next_note = 0; // zero the delay
						}
					}
				}

			} // end metronomeSolo

			delay_for_next_note += duration;
		}

		if (delay_for_next_note)
			midiTrack.addNoteOff(0, 60, delay_for_next_note - 1); // add a blank note for spacing

	}; // end of function

	// returns a URL that is a MIDI track
	root.create_MIDIURLFromGrooveData = function (myGrooveData, MIDI_type) {

		var midiFile = new Midi.File();
		var midiTrack = new Midi.Track();
		midiFile.addTrack(midiTrack);

		midiTrack.setTempo(myGrooveData.tempo);
		midiTrack.setInstrument(0, 0x13);

		var swing_percentage = myGrooveData.swingPercent / 100;

		// the midi converter expects all the arrays to be 32 or 48 notes long.
		// Expand them
		var FullNoteHHArray = root.scaleNoteArrayToFullSize(myGrooveData.hh_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteSnareArray = root.scaleNoteArrayToFullSize(myGrooveData.snare_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);
		var FullNoteKickArray = root.scaleNoteArrayToFullSize(myGrooveData.kick_array, myGrooveData.numberOfMeasures, myGrooveData.notesPerMeasure, myGrooveData.numBeats, myGrooveData.noteValue);

		// the midi functions expect just one measure at a time to work correctly
		// call once for each measure
    var measure_notes = FullNoteHHArray.length / myGrooveData.numberOfMeasures;
    for (var measureIndex = 0; measureIndex < myGrooveData.numberOfMeasures; measureIndex++) {

      var FullNoteTomsArray = [];
      for(var i = 0; i < constant_NUMBER_OF_TOMS; i++) {
      	var orig_measure_notes = myGrooveData.notesPerMeasure;
        FullNoteTomsArray[i] = root.scaleNoteArrayToFullSize(myGrooveData.toms_array[i].slice(orig_measure_notes*measureIndex, orig_measure_notes*(measureIndex+1)),
																														 1,
																														 myGrooveData.notesPerMeasure,
																														 myGrooveData.numBeats,
																														 myGrooveData.noteValue);
      }

      root.MIDI_from_HH_Snare_Kick_Arrays(midiTrack,
          FullNoteHHArray.slice(measure_notes*measureIndex, measure_notes*(measureIndex+1)),
          FullNoteSnareArray.slice(measure_notes*measureIndex, measure_notes*(measureIndex+1)),
          FullNoteKickArray.slice(measure_notes*measureIndex, measure_notes*(measureIndex+1)),
          FullNoteTomsArray,
          MIDI_type,
          myGrooveData.metronomeFrequency,
          measure_notes,
          myGrooveData.timeDivision,
          swing_percentage,
          myGrooveData.numBeats,
          myGrooveData.noteValue);
    }

		var midi_url = "data:audio/midi;base64," + btoa(midiFile.toBytes());

		return midi_url;
	};

	root.loadMIDIFromURL = function (midiURL) {

		MIDI.Player.timeWarp = 1; // speed the song is played back
		MIDI.Player.BPM = root.getTempo();
		MIDI.Player.loadFile(midiURL, midiLoaderCallback());
	};

	root.MIDISaveAs = function (midiURL) {

		// save as
		document.location = midiURL;
	};

	root.pauseMIDI_playback = function () {
		if (root.isMIDIPaused === false) {
			root.isMIDIPaused = true;
			root.midiEventCallbacks.pauseEvent(root.midiEventCallbacks.classRoot);
			MIDI.Player.pause();
			root.midiEventCallbacks.notePlaying(root.midiEventCallbacks.classRoot, "clear", -1);
			root.clearHighlightNoteInABCSVG();
		}
	};

	// play button or keypress
	root.startMIDI_playback = function () {
		if (MIDI.Player.playing) {
			return;
		} else if (root.isMIDIPaused && false === root.midiEventCallbacks.doesMidiDataNeedRefresh(root.midiEventCallbacks.classRoot)) {
			global_current_midi_start_time = new Date();
			global_last_midi_update_time = 0;
			MIDI.Player.resume();
		} else {
			MIDI.Player.ctx.resume();
			global_current_midi_start_time = new Date();
			global_last_midi_update_time = 0;
			root.midiEventCallbacks.loadMidiDataEvent(root.midiEventCallbacks.classRoot, true);
			MIDI.Player.stop();
			MIDI.Player.loop(root.shouldMIDIRepeat); // set the loop parameter
			MIDI.Player.start();
		}
		root.midiEventCallbacks.playEvent(root.midiEventCallbacks.classRoot);
		root.isMIDIPaused = false;
	};

	// stop button or keypress
	root.stopMIDI_playback = function () {
		if (MIDI.Player.playing || root.isMIDIPaused) {
			root.isMIDIPaused = false;
			MIDI.Player.stop();
			root.midiEventCallbacks.stopEvent(root.midiEventCallbacks.classRoot);
			root.midiEventCallbacks.notePlaying(root.midiEventCallbacks.classRoot, "clear", -1);
			root.clearHighlightNoteInABCSVG();
			root.resetMetronomeOptionsOffsetClickStartRotation()
		}
	};

	// modal play/stop button
	root.startOrStopMIDI_playback = function () {

		if (MIDI.Player.playing) {
			root.stopMIDI_playback();
		} else {
			root.startMIDI_playback();
		}
	};

	// modal play/pause button
	root.startOrPauseMIDI_playback = function () {

		if (MIDI.Player.playing) {
			root.pauseMIDI_playback();
		} else {
			root.startMIDI_playback();
		}
	};

	root.isPlaying = function () {
		return MIDI.Player.playing;
	};

	root.repeatMIDI_playback = function () {
		if (root.shouldMIDIRepeat === false) {
			root.shouldMIDIRepeat = true;
			MIDI.Player.loop(true);
		} else {
			root.shouldMIDIRepeat = false;
			MIDI.Player.loop(false);
		}
		root.midiEventCallbacks.repeatChangeEvent(root.midiEventCallbacks.classRoot, root.shouldMIDIRepeat);

	};

	root.oneTimeInitializeMidi = function () {

		if (global_midiInitialized) {
			root.midiEventCallbacks.midiInitialized(root.midiEventCallbacks.classRoot);
			return;
		}

		global_midiInitialized = true;
		MIDI.loadPlugin({
			soundfontUrl : root.getMidiSoundFontLocation(),
			instruments : ["gunshot"],
			callback : function () {
				MIDI.programChange(9, 127); // use "Gunshot" instrument because I don't know how to create new ones
				root.midiEventCallbacks.midiInitialized(root.midiEventCallbacks.classRoot);
			}
		});
	};

	root.getMidiStartTime = function () {
		return global_current_midi_start_time;
	};

	// calculate how long the midi has been playing total (since the last play/pause press
	// this is computationally expensive
	root.getMidiPlayTime = function () {
		var time_now = new Date();
		var play_time_diff = new Date(time_now.getTime() - global_current_midi_start_time.getTime());

		var TotalPlayTime = document.getElementById("totalPlayTime");
		if (TotalPlayTime) {
			if (global_last_midi_update_time === 0)
				global_last_midi_update_time = global_current_midi_start_time;
			var delta_time_diff = new Date(time_now - global_last_midi_update_time);
			global_total_midi_play_time_msecs += delta_time_diff.getTime();
			var totalTime = new Date(global_total_midi_play_time_msecs);
			var time_string = "";
			if (totalTime.getUTCHours() > 0)
				time_string = totalTime.getUTCHours() + ":" + (totalTime.getUTCMinutes() < 10 ? "0" : "");
			time_string += totalTime.getUTCMinutes() + ":" + (totalTime.getSeconds() < 10 ? "0" : "") + totalTime.getSeconds();
			TotalPlayTime.innerHTML = 'Total Play Time: <span class="totalTimeNum">' + time_string + '</span> notes: <span class="totalTimeNum">' + global_total_midi_notes + '</span> repetitions: <span class="totalTimeNum">' + global_total_midi_repeats + '</span>';
		}

		global_last_midi_update_time = time_now;

		return play_time_diff; // a time struct that represents the total time played so far since the last play button push
	};

	// update the midi play timer on the player.
	// Keeps track of how long we have been playing.
	root.updateMidiPlayTime = function () {
		var totalTime = root.getMidiPlayTime();
		var time_string = totalTime.getUTCMinutes() + ":" + (totalTime.getSeconds() < 10 ? "0" : "") + totalTime.getSeconds();

		var MidiPlayTime = document.getElementById("MIDIPlayTime" + root.grooveUtilsUniqueIndex);
		if (MidiPlayTime)
			MidiPlayTime.innerHTML = time_string;
	};

	var debug_note_count = 0;
	//var class_midi_note_num = 0;  // global, but only used in this function
	// This is the function that the 3rd party midi library calls to give us events.
	// This is different from the callbacks that we use for the midi code in this library to
	// do events.   (Double chaining)
	function ourMIDICallback(data) {
		var percentComplete = (data.now / data.end);
		root.midiEventCallbacks.percentProgress(root.midiEventCallbacks.classRoot, percentComplete * 100);

		if (root.lastMidiTimeUpdate && root.lastMidiTimeUpdate < (data.now + 800)) {
			root.updateMidiPlayTime();
			root.lastMidiTimeUpdate = data.now;
		}

		if (data.now < 16) {
			// this is considered the start.   It doesn't come in at zero for some reason
			// The second note should always be at least 16 ms behind the first
			//class_midi_note_num = 0;
			root.lastMidiTimeUpdate = -1;
		}
		if (data.now == data.end) {

			// at the end of a song
			root.midiEventCallbacks.notePlaying(root.midiEventCallbacks.classRoot, "complete", 1);

			if (root.shouldMIDIRepeat) {

				global_total_midi_repeats++;

				// regenerate the MIDI if the data needs refreshing or the OffsetClick is rotating every time
				// advanceMetronomeOptionsOffsetClickStartRotation will return false if not rotating
				if (root.advanceMetronomeOptionsOffsetClickStartRotation() || root.midiEventCallbacks.doesMidiDataNeedRefresh(root.midiEventCallbacks.classRoot)) {
					MIDI.Player.stop();
					root.midiEventCallbacks.loadMidiDataEvent(root.midiEventCallbacks.classRoot, false);
					MIDI.Player.start();
					//  } else {
					// let midi.loop handle the repeat for us
					//MIDI.Player.stop();
					//MIDI.Player.start();
				}
				if (root.repeatCallback) {
					root.repeatCallback();
				}
			} else {
				// not repeating, so stopping
				MIDI.Player.stop();
				root.midiEventCallbacks.percentProgress(root.midiEventCallbacks.classRoot, 100);
				root.midiEventCallbacks.stopEvent(root.midiEventCallbacks.classRoot);
			}
		}

		// note on
		var note_type = false;
		if (data.message == 144) {
			if (data.note == constant_OUR_MIDI_METRONOME_1 || data.note == constant_OUR_MIDI_METRONOME_NORMAL) {
				note_type = "metronome";
			} else if (data.note == constant_OUR_MIDI_HIHAT_NORMAL || data.note == constant_OUR_MIDI_HIHAT_OPEN ||
						data.note == constant_OUR_MIDI_HIHAT_ACCENT || data.note == constant_OUR_MIDI_HIHAT_CRASH ||
						data.note == constant_OUR_MIDI_HIHAT_RIDE || data.note == constant_OUR_MIDI_HIHAT_STACKER ||
						data.note == constant_OUR_MIDI_HIHAT_RIDE_BELL || data.note == constant_OUR_MIDI_HIHAT_COW_BELL ||
            data.note == constant_OUR_MIDI_HIHAT_METRONOME_NORMAL || data.note == constant_OUR_MIDI_HIHAT_METRONOME_NORMAL ) {
				note_type = "hi-hat";
			} else if (data.note == constant_OUR_MIDI_SNARE_NORMAL || data.note == constant_OUR_MIDI_SNARE_ACCENT ||
						data.note == constant_OUR_MIDI_SNARE_GHOST || data.note == constant_OUR_MIDI_SNARE_XSTICK ||
						data.note == constant_OUR_MIDI_SNARE_FLAM || data.note == constant_OUR_MIDI_SNARE_DRAG ||
                		data.note == constant_OUR_MIDI_SNARE_BUZZ	) {
				note_type = "snare";
			} else if (data.note == constant_OUR_MIDI_KICK_NORMAL || data.note == constant_OUR_MIDI_HIHAT_FOOT) {
				note_type = "kick";
			} else if (data.note == constant_OUR_MIDI_TOM1_NORMAL || data.note == constant_OUR_MIDI_TOM2_NORMAL || data.note == constant_OUR_MIDI_TOM3_NORMAL || data.note == constant_OUR_MIDI_TOM4_NORMAL) {
				note_type = "tom";
			}
			if (note_type) {
				global_total_midi_notes++;
				root.midiEventCallbacks.notePlaying(root.midiEventCallbacks.classRoot, note_type, percentComplete);
				root.highlightNoteInABCSVGFromPercentComplete(percentComplete);
				if (root.noteCallback) {
					root.noteCallback(note_type);
				}
			}
		}

		// this used to work when we used note 60 as a spacer between chords
		//if(data.note == 60)
		//	class_midi_note_num++;
		/*
		if (0 && data.message == 144) {
		debug_note_count++;
		// my debugging code for midi
		var newHTML = "";
		if (data.note != 60)
		newHTML += "<b>";

		newHTML += note_type + " total notes: " + debug_note_count + " - count#: " + class_midi_note_num +
		" now: " + data.now +
		" note: " + data.note +
		" message: " + data.message +
		" channel: " + data.channel +
		" velocity: " + data.velocity +
		"<br>";

		if (data.note != 60)
		newHTML += "</b>";

		document.getElementById("midiTextOutput").innerHTML += newHTML;
		}
		 */
	}

	function midiLoaderCallback() {
		MIDI.Player.addListener(ourMIDICallback);
	}

	root.getTempo = function () {
		var tempoInput = document.getElementById("tempoInput" + root.grooveUtilsUniqueIndex);
		var tempo = constant_DEFAULT_TEMPO;

		if(tempoInput) {
			tempo = parseInt(tempoInput.value, 10);
			if (tempo < 19 && tempo > 281)
				tempo = constant_DEFAULT_TEMPO;
		}

		return tempo;
	};

	// we need code to make the range slider colors update properly
	function updateRangeSlider(sliderID) {

		var slider = document.getElementById(sliderID);
		var programaticCSSRules = document.getElementById(sliderID + "CSSRules");
		if (!programaticCSSRules) {
			// create a new one.
			programaticCSSRules = document.createElement('style');
			programaticCSSRules.id = sliderID + "CSSRules";
			document.body.appendChild(programaticCSSRules);
		}

		var style_before = document.defaultView.getComputedStyle(slider, ":before");
		var style_after = document.defaultView.getComputedStyle(slider, ":after");
		var before_color = style_before.getPropertyValue('color');
		var after_color = style_after.getPropertyValue('color');

		// change the before and after colors of the slider using a gradiant
		var percent = Math.ceil(((slider.value - slider.min) / (slider.max - slider.min)) * 100);

		var new_style_str = '#' + sliderID + '::-moz-range-track' + '{ background: -moz-linear-gradient(left, ' + before_color + ' ' + percent + '%, ' + after_color + ' ' + percent + '%)}\n';
		new_style_str += '#' + sliderID + '::-webkit-slider-runnable-track' + '{ background: -webkit-linear-gradient(left, ' + before_color + ' ' + '0%, ' + before_color + ' ' + percent + '%, ' + after_color + ' ' + percent + '%)}\n';
		programaticCSSRules.textContent = new_style_str;

	}

	// update the tempo string display
	// called by the oninput handler everytime the range slider changes
	root.tempoUpdate = function (tempo) {
		document.getElementById('tempoTextField' + root.grooveUtilsUniqueIndex).value = "" + tempo;

		updateRangeSlider('tempoInput' + root.grooveUtilsUniqueIndex);
		root.midiNoteHasChanged();

		if(root.tempoChangeCallback)
			root.tempoChangeCallback(tempo);
	};

	root.tempoUpdateFromTextField = function (event) {
		var newTempo = event.target.value;

		document.getElementById("tempoInput" + root.grooveUtilsUniqueIndex).value = newTempo;
		root.tempoUpdate(newTempo);
	};

	// update the tempo string display
	root.tempoUpdateFromSlider = function (event) {
		root.tempoUpdate(event.target.value);
	};

	// I love the pun here.  :)
	// nudge the tempo up by 1
	root.upTempo = function () {
		var tempo = root.getTempo();

		tempo++;

		root.setTempo(tempo);
	};

	// nudge the tempo down by 1
	root.downTempo = function () {
		var tempo = root.getTempo();

		tempo--;

		root.setTempo(tempo);
	};

	root.setTempo = function (newTempo) {
		if (newTempo < 19 && newTempo > 281)
			return;

		document.getElementById("tempoInput" + root.grooveUtilsUniqueIndex).value = newTempo;
		root.tempoUpdate(newTempo);
	};

	root.doesDivisionSupportSwing = function (division) {

		if (root.isTripletDivision(division) || division == 4)
			return false;

		return true;
	};

	root.setSwingSlider = function (newSetting) {
		document.getElementById("swingInput" + root.grooveUtilsUniqueIndex).value = newSetting;
		updateRangeSlider('swingInput' + root.grooveUtilsUniqueIndex);
	};

	root.swingEnabled = function (trueElseFalse) {

		root.swingIsEnabled = trueElseFalse;

		if (root.swingIsEnabled === false) {
			root.setSwing(0);
		} else {
			root.swingUpdateText(root.getSwing()); // remove N/A label
		}
	};

	root.getSwing = function () {
		var swing = 0;

		if(root.swingIsEnabled) {
			var swingInput = document.getElementById("swingInput" + root.grooveUtilsUniqueIndex);

			if(swingInput) {
				swing = parseInt(swingInput.value, 10);
				if (swing < 0 || swing > 60)
					swing = 0;
			}
		}

		return (swing);
	};

	// used to update the on screen swing display
	// also the onClick handler for the swing slider
	root.swingUpdateText = function (swingAmount) {

		if (root.swingIsEnabled === false) {
			document.getElementById('swingOutput' + root.grooveUtilsUniqueIndex).innerHTML = "N/A";
		} else {
			document.getElementById('swingOutput' + root.grooveUtilsUniqueIndex).innerHTML = "" + swingAmount + "%";
			root.swingPercent = swingAmount;
			root.midiNoteHasChanged();
		}

	};

	root.setSwing = function (swingAmount) {
		if (root.swingIsEnabled === false)
			swingAmount = 0;

		root.setSwingSlider(swingAmount);

		root.swingUpdateText(swingAmount);  // update the output
	};

	root.swingUpdateEvent = function (event) {

		if (root.swingIsEnabled === false) {
			root.setSwingSlider(0);
		} else {
			root.swingUpdateText(event.target.value);
			updateRangeSlider('swingInput' + root.grooveUtilsUniqueIndex);
		}
	};

	root.setMetronomeFrequencyDisplay = function (newFrequency) {
		var mm = document.getElementById('midiMetronomeMenu' + root.grooveUtilsUniqueIndex);

		if(mm) {
			mm.className = mm.className.replace(" selected", "");

			if(newFrequency > 0) {
				mm.className += " selected";
			}
		}
	};

	// open a new tab with GrooveScribe with the current groove
	root.loadFullScreenGrooveScribe = function() {
		var fullURL = root.getUrlStringFromGrooveData(root.myGrooveData, 'fullGrooveScribe')

		var win = window.open(fullURL, '_blank');
		win.focus();
	};


	// turn the metronome on and off
	root.metronomeMiniMenuClick = function() {
		if(root.myGrooveData.metronomeFrequency > 0)
			root.myGrooveData.metronomeFrequency = 0;
		else
			root.myGrooveData.metronomeFrequency = 4;

		root.setMetronomeFrequencyDisplay(root.myGrooveData.metronomeFrequency);
		root.midiNoteHasChanged();
	};

	root.expandOrRetractMIDI_playback = function (force, expandElseContract) {

		var playerControlElement = document.getElementById('playerControl' + root.grooveUtilsUniqueIndex);
		var playerControlRowElement = document.getElementById('playerControlsRow' + root.grooveUtilsUniqueIndex);
		var tempoAndProgressElement = document.getElementById('tempoAndProgress' + root.grooveUtilsUniqueIndex);
		var midiMetronomeMenuElement = document.getElementById('midiMetronomeMenu' + root.grooveUtilsUniqueIndex);
		var gsLogoLoadFullGSElement = document.getElementById('midiGSLogo' + root.grooveUtilsUniqueIndex);
		var midiExpandImageElement = document.getElementById('midiExpandImage' + root.grooveUtilsUniqueIndex);
		var midiPlayTime = document.getElementById('MIDIPlayTime' + root.grooveUtilsUniqueIndex);

		if (playerControlElement.className.indexOf("small") > -1 || (force && expandElseContract)) {
			// make large
			playerControlElement.className = playerControlElement.className.replace(" small", "") + " large";
			playerControlRowElement.className = playerControlRowElement.className.replace(" small", "") + " large";
			tempoAndProgressElement.className = tempoAndProgressElement.className.replace(" small", "") + " large";
			midiMetronomeMenuElement.className = midiMetronomeMenuElement.className.replace(" small", "") + " large";
			gsLogoLoadFullGSElement.className = gsLogoLoadFullGSElement.className.replace(" small", "") + " large";
			midiExpandImageElement.className = midiExpandImageElement.className.replace(" small", "") + " large";
			midiPlayTime.className = midiPlayTime.className.replace(" small", "") + " large";
		} else {
			// make small
			playerControlElement.className = playerControlElement.className.replace(" large", "") + " small";
			playerControlRowElement.className = playerControlRowElement.className.replace(" large", "") + " small";
			midiMetronomeMenuElement.className = midiMetronomeMenuElement.className.replace(" large", "") + " small";
			tempoAndProgressElement.className = tempoAndProgressElement.className.replace(" large", "") + " small";
			gsLogoLoadFullGSElement.className = gsLogoLoadFullGSElement.className.replace(" large", "") + " small";
			midiExpandImageElement.className = midiExpandImageElement.className.replace(" large", "") + " small";
			midiPlayTime.className = midiPlayTime.className.replace(" large", "") + " small";
		}

	};

	function addInlineMetronomeSVG() {
		return  '<svg class="midiMetronomeImage" version="1.1" width="30" height="30"' +
				'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" ' +
				'xml:space="preserve"><path d="M86.945,10.635c-0.863-0.494-1.964-0.19-2.455,0.673l-8.31,14.591l-2.891-1.745l-1.769,9.447l0.205,0.123' +
				'l-1.303,2.286L63.111,6.819c-0.25-1-1.299-1.819-2.33-1.819H37.608c-1.031,0-2.082,0.818-2.334,1.818L13.454,93.182' +
				'c-0.253,1,0.385,1.818,1.416,1.818h68.459c1.031,0,1.67-0.818,1.42-1.818L71.69,41.061l3.117-5.475l0.152,0.092l7.559-5.951' +
				'l-3.257-1.966l8.355-14.67C88.11,12.226,87.81,11.127,86.945,10.635z M71.58,70.625H54.855l12.946-22.737l5.197,20.789' +
				'C73.25,69.678,72.61,70.625,71.58,70.625z M50.714,70.625H26.57c-1.031,0-1.669-0.994-1.416-1.994L39.59,11.5' +
				'c0.253-1,1.303-1.812,2.334-1.812h14.431c1.032,0,2.081,0.725,2.331,1.725l7.854,31.421L50.714,70.625z"></path></svg>'
	}

	function addInLineGScribeLogoLoneGSVG() {
		return '<?xml version="1.0"?><svg width="20" heigth="30" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
				' <g>' +
				'  <title>Layer 1</title>' +
				'  <g id="svg_15">' +
				'   <path fill="#000000" d="m27.467991,47.742001c-12.28299,0 -22.276001,-9.997009 -22.276001,-22.284c0,-12.27402 9.99402,-22.272 ' +
				'22.276001,-22.272c12.278019,0 22.269009,9.99799 22.269009,22.272c-0.001011,12.286991 -9.992001,22.284 -22.269009,22.284zm0,-37.078001c-8.159,0 ' +
				'-14.794981,6.644011 -14.794981,14.79801c0,8.162979 6.63599,14.791981 14.794981,14.791981c8.157009,0 14.803009,-6.629002 14.803009,-14.791981c0,-8.153999 ' +
				'-6.646,-14.79801 -14.803009,-14.79801z" id="svg_16"/>' +
				'   <path fill="#F7941E" d="m27.467991,33.90799c-4.665991,0 -8.445011,-3.786989 -8.445011,-8.446009c0,-4.653992 3.77902,-8.440981 8.445011,-8.440981c4.64999,0 ' +
				'8.444,3.786989 8.444,8.440981c0.001007,4.659029 -3.792999,8.446009 -8.444,8.446009z" id="svg_17"/>' +
				'   <g id="svg_18">' +
				'	<path fill="#000000" d="m28.13699,85.571991c-5.79599,0 -24.746,-1.138 -24.746,-15.771004c0,-0.921997 0.125,-1.834976 0.39099,-2.791977l0.09399,-0.292999l9.21902,0l-0.151,0.517967c-0.198,0.701019 ' +
				'-0.311,1.417999 -0.311,2.137024c0,6.332001 7.898991,8.583977 15.29199,8.583977c3.610991,0 15.394989,-0.626007 15.394989,-8.687988c0,-4.349014 -3.515987,-6.41901 -11.064968,-6.52301c-6.87302,0 ' +
				'-11.539001,-0.159 -15.027012,-0.983002c-3.431,-0.807007 -4.132019,-1.12698 -6.926999,-2.752987c-3.63602,-2.385014 -5.39401,-5.328003 -5.39401,-8.99802c0,-3.687992 1.854,-6.860981 ' +
				'5.668,-9.716003c0.72501,-0.502987 1.51801,-0.750977 2.37802,-0.750977c1.92099,0 3.824981,1.311977 4.16199,2.865997c0.22501,1.028992 0.48801,0.685001 -0.84,1.881992c-0.85501,0.766968 -3.64001,2.702 ' +
				'-3.64001,5.167988c0,5.662041 10.78802,5.662041 17.235021,5.662041c16.113977,0 22.693998,4.063999 22.693998,14.03598c-0.00198,14.282013 -15.29599,16.415009 ' +
				'-24.427,16.415009l-0.00001,0.000031l0,-0.000031l0,0l0,-0.000008z" id="svg_19"/>' +
				'   </g>' +
				'   <g id="svg_20">' +
				'	<path fill="#000000" d="m46.504002,15.08499c-0.225983,0 -0.423,-0.101009 -4.70599,-2.934999c-2.208023,-1.46399 -4.708023,-3.121 -5.758003,-3.72501l-1.31601,-0.75101l20.405003,0l0,5.715l-8.224003,1.370999c-0.006989,0.01501 ' +
				'-0.006989,0.03802 -0.01498,0.05801l-0.104,0.263l-0.282009,0.004l-0.000019,0.00001l0.000011,0z" id="svg_21"/>' +
				'   </g>' +
				'  </g>' +
				' </g>' +
				'</svg>';
	}

	root.HTMLForMidiPlayer = function (expandable) {
		var newHTML = '' +
			'<div id="playerControl' + root.grooveUtilsUniqueIndex + '" class="playerControl">' +
			'	<div class="playerControlsRow" id="playerControlsRow' + root.grooveUtilsUniqueIndex + '">' +
			'		<span title="Play/Pause" class="midiPlayImage" id="midiPlayImage' + root.grooveUtilsUniqueIndex + '"></span>' +
			'       <span class="MIDIPlayTime" id="MIDIPlayTime' + root.grooveUtilsUniqueIndex + '">' + CONSTANT_Midi_play_time_zero + '</span>';

			if(expandable)
				newHTML += '' +
			'       <span title="Metronome controls" class="midiMetronomeMenu" id="midiMetronomeMenu'  + root.grooveUtilsUniqueIndex + '">' +
			           addInlineMetronomeSVG() +
			'       </span>'


		newHTML +=	'<span class="tempoAndProgress" id="tempoAndProgress' + root.grooveUtilsUniqueIndex + '">' +
			'			<div class="tempoRow">' +
			'				<span class="tempoLabel">BPM</span>' +
			'				<input type="text" for="tempo" class="tempoTextField" pattern="\\d+" id="tempoTextField' + root.grooveUtilsUniqueIndex + '" value="80"></input>' +
			'				<input type=range min=30 max=300 value=90 class="tempoInput' + (root.is_touch_device() ? ' touch' : '') + '" id="tempoInput' + root.grooveUtilsUniqueIndex + '" list="tempoSettings">' +
			'			</div>' +
			'			<div class="swingRow">' +
			'				<span class="swingLabel">SWING</span>' +
			'				<span for="swingAmount" class="swingOutput" id="swingOutput' + root.grooveUtilsUniqueIndex + '">0% swing</span>' +
			'				<input type=range min=0 max=50 value=0 class="swingInput' + (root.is_touch_device() ? ' touch' : '') + '" id="swingInput' + root.grooveUtilsUniqueIndex + '" list="swingSettings" step=5 >' +
			'			</div>' +
			'       </span>';

		if (expandable)
			newHTML +=
			'       <span title="Expand full screen in GrooveScribe" class="midiGSLogo" id="midiGSLogo'  + root.grooveUtilsUniqueIndex + '">' +
						addInLineGScribeLogoLoneGSVG() +
			'       </span>' +
			'		<span title="Expand/Retract player" class="midiExpandImage" id="midiExpandImage' + root.grooveUtilsUniqueIndex + '"></span>';

		newHTML += '</div>';

		return newHTML;
	};

	// pass in a tag ID.  (not a class)
	// HTML will be put within the tag replacing whatever else was there
	root.AddMidiPlayerToPage = function (HTML_Id_to_attach_to, division, expandable) {
		var html_element = document.getElementById(HTML_Id_to_attach_to);
		if (html_element)
			html_element.innerHTML = root.HTMLForMidiPlayer(expandable);

		var browserInfo = root.getBrowserInfo();
		var isIE10 = false;
		if(browserInfo.browser == "MSIE" && browserInfo.version < 12)
			isIE10 = true;

		// now attach the onclicks
		html_element = document.getElementById("tempoInput" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			if(isIE10)
				html_element.addEventListener("click", root.tempoUpdateFromSlider, false);
			else
				html_element.addEventListener("input", root.tempoUpdateFromSlider, false);
		}

		html_element = document.getElementById("tempoTextField" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			html_element.addEventListener("change", root.tempoUpdateFromTextField, false);
		}

		html_element = document.getElementById("swingInput" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			if(isIE10)
				html_element.addEventListener("click", root.swingUpdateEvent, false);
			else
				html_element.addEventListener("input", root.swingUpdateEvent, false);
		}

		html_element = document.getElementById("midiRepeatImage" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			html_element.addEventListener("click", root.repeatMIDI_playback, false);
		}

		html_element = document.getElementById("midiExpandImage" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			html_element.addEventListener("click", root.expandOrRetractMIDI_playback, false);
		}

		html_element = document.getElementById("midiGSLogo" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			html_element.addEventListener("click", root.loadFullScreenGrooveScribe, false);
		}

		html_element = document.getElementById("midiMetronomeMenu" + root.grooveUtilsUniqueIndex);
		if (html_element) {
			html_element.addEventListener("click", root.metronomeMiniMenuClick, false);
		}

		// enable or disable swing
		root.swingEnabled(root.doesDivisionSupportSwing(division));
	};

} // end of class
