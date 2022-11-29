
var currentMelody = null;
var currentMelodyIndex = 0;
var currentChordIndex = null;
var __currentChordElement = null;
var selectedChords = [];
var chordsDatabase = [
    ["C4", "E4", "G4"],
    ["G4", "B4", "D5"],
    ["D4", "F4#", "A4"],
    ["A4", "C5#", "E5"],
    ["E4", "G4#", "B4"],
    ["B4", "D5#", "F5#"],
    ["F4#", "A4#", "C5#"],
    ["D4b", "F4", "A4b"],
    ["A4b", "C5", "E5b"],
    ["E4b", "G4", "B4b"],
    ["B4b", "D5", "F5"],
    ["F4", "A4", "C5"],
// minor half
    ["A4", "C5", "E5"],
    ["E4", "G4", "B4"],
    ["B4", "D5", "F5#"],
    ["F4#", "A4", "C5#"],
    ["C5#", "E5", "G5#"],
    ["G4#", "B4", "D5#"],
    ["D4#", "F4#", "A4#"],
    ["B4b", "D5b", "F5"],
    ["F4", "A4b", "C5"],
    ["C4", "E4b", "G4"],
    ["G4", "B4b", "D5"],
    ["D4", "F4", "A4"],
];

var tonalityFifths = [
    0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1,
    0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1,
];

var tonalityDisplayWidth = [
    50, 50, 55, 60, 62, 70, 75, 70, 59, 60, 55, 50,
];

var chordsNames = [
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F♯",
    "D♭",
    "A♭",
    "E♭",
    "B♭",
    "F",
// minor half
    "a",
    "e",
    "b",
    "f♯",
    "c♯",
    "g♯",
    "d♯",
    "b♭",
    "f",
    "c",
    "g",
    "d",
]

var loadedMelody = null;

function goto_next_melody(){
    if (currentMelodyIndex < melodiesDatabase.length) {
        currentMelodyIndex++;
        set_melody_to_harmonize(melodiesDatabase[currentMelodyIndex]);
    }
}

function goto_previous_melody(){
    if (currentMelodyIndex > 0) {
        currentMelodyIndex--;
        set_melody_to_harmonize(melodiesDatabase[currentMelodyIndex]);
    }
}

function set_melody_to_harmonize(melody){
    currentMelody = melody;
    load_midi_file("midi/"+melody.name+".mid");
    load_melody_file("midi/"+melody.name+".musicxml")
    
    var droparea = document.getElementById("droparea")
    droparea.replaceChildren();
    droparea.style["padding-left"] = (80+10*Math.abs(melody.fifths))+"px";
    selectedChords = Array.from({length: melody.chordsDuration.length}, () => null);
    for (i = 0; i < melody.chordsDuration.length; i++){
        make_drop_element(i, melody.chordsDuration[i]);
    }
}

function load_melody_file(filename) {
    var req = new XMLHttpRequest();
    req.onload = function(){
        loadedMelody = req.responseText;
        update_chord_line();
    };
    req.open('GET', filename);
    req.responseType = "text";
    req.send();
}

function check_chords(){
    var droparea = document.getElementById("droparea")
    var wrongChords = 0;
    selectedChords.map(function(chord_index, i){
        var expected = currentMelody.expectedChords[i];
        var dropelem = droparea.children[i];
        if (!(chord_index === null) && expected === Number(chord_index)){
            dropelem.classList.remove("wrongChord")
            dropelem.classList.add("rightChord")
        } else {
            dropelem.classList.add("wrongChord")
            dropelem.classList.remove("rightChord")
            wrongChords++;
        }
    });
}


function update_chord_line() {
    var newdiv = document.createElement("div");
    newdiv.className = "musicsheet";
    var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(newdiv);
    osmd.setOptions({
      autoResize: true,
      backend: "svg",
      drawTitle: false,
      drawMeasureNumbers: false,
      stretchLastSystemLine: true,
      drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    var chords = selectedChords.map(function(chord_index, i){
        if (chord_index === null){
            var chord_notes = null;
        } else {
            var chord_notes = chordsDatabase[chord_index];
        }
        return {notes: chord_notes, 
                duration: currentMelody.chordsDuration[i]};
    });
    var xmlcode = make_musicxml_chord_line(chords, currentMelody.fifths);
    var doc = make_musicxml_doc([loadedMelody, xmlcode]);
    osmd.load(doc).then(
        function() {
          osmd.render();
        }
    );
    document.getElementById("mainsheet").replaceChildren(newdiv);
}

function draw_circle_of_fifths(){
    var area = document.getElementById("draggarea");
    // make a svg element to display the little segments
    var svgarea = document.getElementById("svgarea");
    // draw
    var cx = 400;
    var cy = 400;
    var ra = 380;
    var rb = 250;
    var rc = 170;
    var rd = 100;

    var n = 12;
    var alpha = -7*Math.PI / 12;
    var dAlpha = (Math.PI) / n;
    for (i = 0; i < n ; i++){
        // key display
        var elem = make_svg_arc_segment("svgarc backgroundarc", cx, cy, ra, rb, alpha, alpha+2*dAlpha);
        svgarea.appendChild(elem);

        // major chords
        var elem = make_svg_arc_segment("svgarc dragarc", cx, cy, rb, rc, alpha, alpha+2*dAlpha);
        make_clickable_chord(elem, i, cx, cy, (rc+rb)/2, alpha+dAlpha);
        svgarea.appendChild(elem);

        // minor chords
        var elem = make_svg_arc_segment("svgarc dragarc", cx, cy, rc, rd, alpha, alpha+2*dAlpha);
        make_clickable_chord(elem, i+n, cx, cy, (rc+rd)/2, alpha+dAlpha);
        svgarea.appendChild(elem);

        alpha += dAlpha;

        var osmdiv = make_key_display(i, cx, cy, (ra+rb)/2, alpha);
        area.appendChild(osmdiv);

        alpha += dAlpha;
    }

}

function polar_to_cart(cx, cy, radius, alpha){
    return [cx + radius*Math.cos(alpha), cy + radius*Math.sin(alpha)];
}

function make_svg_arc_segment(className, cx, cy, ra, rb, alphaA, alphaB){
    var svgns = "http://www.w3.org/2000/svg";
    var elem = document.createElementNS(svgns, "g");
    elem.setAttributeNS(null, "class", className);
    var path = document.createElementNS(svgns, "path");
    var p1 = polar_to_cart(cx, cy, ra, alphaA);
    var p2 = polar_to_cart(cx, cy, ra, alphaB);
    var p3 = polar_to_cart(cx, cy, rb, alphaB);
    var p4 = polar_to_cart(cx, cy, rb, alphaA);
    var code = ["M", ...p1,
                "A", ra, ra, 0, 0, 1, ...p2,
                "L", ...p3,
                "A", rb, rb, 0, 0, 0, ...p4,
                "Z"].join(" ");
    path.setAttributeNS(null, "d", code);
    elem.appendChild(path);
    return elem;
}

function drop_chord_handler(ev){
    if (currentChordIndex === null){
        return;
    }
    stop_player();
    var index = ev.target.getAttribute("dropindex");
    selectedChords[index] = currentChordIndex;
    var drop = document.getElementById("drop"+index);
    drop.classList.remove("rightChord")
    drop.classList.remove("wrongChord")
    var newpar = document.createElement("p");
    newpar.setAttribute("dropindex", index);
    newpar.innerHTML = chordsNames[currentChordIndex];
    drop.replaceChildren(newpar);
    update_chord_line();
}

function clicked(ev){
    if (__currentChordElement !== null){
        __currentChordElement.classList.remove("currentChord");
    }
    __currentChordElement = ev.target.parentNode;
    __currentChordElement.classList.add("currentChord");
    currentChordIndex = __currentChordElement.getAttribute("chordindex");
}

function make_clickable_chord(draggablechord, index, cx, cy, radius, alpha) {
    var svgns = "http://www.w3.org/2000/svg";
    // compute the central position
    [x, y] = polar_to_cart(cx, cy, radius, alpha);
    draggablechord.setAttribute("chordindex", index);
    draggablechord.addEventListener("click", clicked);
    var chord_text = document.createElementNS(svgns, "text");
    chord_text.setAttributeNS(null, "x", x-15);
    chord_text.setAttributeNS(null, "y", y+15);
    chord_text.innerHTML = chordsNames[index];
    draggablechord.appendChild(chord_text);
}

function make_key_display(index, cx, cy, radius, alpha) {
    var osmdiv = document.createElement("div");
    osmdiv.id = "osm-chord-"+index;
    osmdiv.className = "keydisplay";
    var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(osmdiv);
    osmd.setOptions({
      backend: "svg",
      drawTitle: false,
      drawTimeSignatures: false,
      drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    var fifths = tonalityFifths[index];
    var measurexml = make_musicxml_chord_line([{notes: null, duration: 4}], fifths);
    var xmlcode = make_musicxml_doc([measurexml], 0);
    osmd.load(xmlcode).then(
        function() {
          osmd.render();
        }
    );
    osmdiv.style.position = 'absolute';
    var w = tonalityDisplayWidth[index];
    var f = 65/80;
    var x = f*cx + f*radius*Math.cos(alpha) - w;
    var y = f*cy + f*radius*Math.sin(alpha) - 40;
    osmdiv.style.left = x + 'px';
    osmdiv.style.top = y + 'px';
    osmdiv.style.width = 2*w + 'px';
    osmdiv.style.height = '80px';
    return osmdiv;
}

function make_drop_element(index, widthFactor) {
    var drop_div = document.createElement("div");
    drop_div.setAttribute("dropindex", index);
    drop_div.id = "drop"+index;
    drop_div.className = "chorddrop";
    drop_div.style['width'] = (50*widthFactor)+"%";
    drop_div.addEventListener("click", drop_chord_handler);
    var droparea = document.getElementById("droparea")
    droparea.appendChild(drop_div);
}

function tagwrap(tag, body){
    return "<"+tag+">"+body+"</"+tag+">";
}

function tagwrapattr(tag_attr, tag, body){
    return "<"+tag_attr+">"+body+"</"+tag+">";
}

function make_musicxml_doc(parts) {
  var header = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">`;
  var partlist = ""
  for(let i = 0; i < parts.length; i++){
      partlist += tagwrapattr('score-part id="P'+(i+1)+'"', 'score-part', '');
  }
  partlist = tagwrap("part-list", partlist);
  var xmlparts = ""
  for(let i = 0; i < parts.length; i++){
      part = tagwrapattr('part id="P'+(i+1)+'"', 'part', parts[i]);
      xmlparts += part;
  }
var footer = `
</score-partwise>`;
    return header+partlist+xmlparts+footer;
}

function make_measure_attributes(fifths){
    var div = tagwrap("divisions", 1);
    var key = tagwrap("key", tagwrap("fifths", fifths));
    var time = tagwrap("time", tagwrap("beats", "4")+tagwrap("beat-type", "4"));
    var clef = tagwrap("clef", tagwrap("sign", "G")+tagwrap("line", "2"));
    return tagwrap("attributes", div+key+time+clef);
}


function make_rest_measure(fifths, duration){
    var rest = '<rest/>';
      if (duration == 4){
          var dur = tagwrap("duration", "4");
          var type = tagwrap("type", "whole");
      } else if (duration == 2){
          var dur = tagwrap("duration", "2");
          var type = tagwrap("type", "half");
      } else if (duration == 1){
          var dur = tagwrap("duration", "1");
          var type = tagwrap("type", "quarter");
      }
    var note = tagwrap('note', rest+dur+type);
    return note;
}

function make_musicxml_chord_line(chords, fifths) {
    var code = "";
    var measure = "";
    var length = 0;
    for(let i = 0; i < chords.length; i++){
        var chord = chords[i];
        if (chord.notes === null){
            measure += make_rest_measure(fifths, chord.duration);
            length += chord.duration;
        } else {
            measure += make_musicxml_chord(chord);
            length += chord.duration;
        }
        if (i === 0){
            measure = make_measure_attributes(fifths) + measure;
        }
        if (length >= 4){
            code += tagwrapattr('measure number="'+(i+1)+'"', 'measure', measure);
            measure = "";
            length = 0;
        }
    }
    return code;
}

function make_musicxml_chord(chord) {
  var code = ""; 
  var notes = chord.notes;
  for(let i = 0; i < notes.length; i++){
      var note = notes[i];
      var step = tagwrap("step", note[0]);
      var octave = tagwrap("octave", note[1]);
      var alter = '';
      if (note.length > 2){
          if (note[2] == '#'){
              alter = '1';
          } else {
              alter = '-1';
          }
          alter = tagwrap("alter", alter);
      }
      var pitch = tagwrap("pitch", step+octave+alter);
      if (chord.duration == 4){
          var dur = tagwrap("duration", "4");
          var type = tagwrap("type", "whole");
      } else if (chord.duration == 2){
          var dur = tagwrap("duration", "2");
          var type = tagwrap("type", "half");
      } else if (chord.duration == 1){
          var dur = tagwrap("duration", "1");
          var type = tagwrap("type", "quarter");
      }
      var accidental = '';
      if (note.length > 2){
          if (note[2] == '#'){
              acctype = 'sharp';
          } else {
              acctype = 'flat';
          }
          accidental = tagwrap("accidental", acctype);
      }
      if (i === 0){
        var chord = ""
      } else {
        var chord = "<chord/>"
      }
      var res = tagwrap("note", chord+pitch+dur+type+accidental);
      code += res;
  }
  return code;
}
