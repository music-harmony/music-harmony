
var currentMelody = null;
var currentChordIndex = null;
var __currentChordElement = null;
var selectedChords = [null, null, null, null];
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
    ["F5", "A5b", "C6"],
    ["C5", "E5b", "G5"],
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

function set_melody_to_harmonize(melody){
    currentMelody = melody;
    load_midi_file("midi/"+melody.name+".mid");
    load_melody_file("midi/"+melody.name+".musicxml")

    for (i = 0; i < melody.chordsDuration.length; i++){
        make_drop_element(i);
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


function update_chord_line() {
    var newdiv = document.createElement("div");
    newdiv.className = "musicsheet";
    var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(newdiv);
    osmd.setOptions({
      autoResize: false,
      backend: "svg",
      drawTitle: false,
      drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    chords = selectedChords.map(function(chord_index){
        if (chord_index === null){
            return null;
        } else {
            return chordsDatabase[chord_index];
        }
    });
    xmlcode = make_musicxml_chord_line(chords, 0);
    doc = make_musicxml_doc([loadedMelody, xmlcode]);
    osmd.load(doc).then(
        function() {
          osmd.render();
        }
    );
    document.getElementById("mainsheet").replaceChildren(newdiv);
}

function draw_circle_of_fifths(){
    area = document.getElementById("draggarea");
    // make a svg element to display the little segments
    svgarea = document.getElementById("svgarea");
    // draw
    cx = 400;
    cy = 400;
    ra = 380;
    rb = 250;
    rc = 170;
    rd = 100;

    n = 12;
    alpha = -7*Math.PI / 12;
    dAlpha = (Math.PI) / n;
    for (i = 0; i < n ; i++){
        // key display
        elem = make_svg_arc_segment("svgarc backgroundarc", cx, cy, ra, rb, alpha, alpha+2*dAlpha);
        svgarea.appendChild(elem);

        // major chords
        elem = make_svg_arc_segment("svgarc dragarc", cx, cy, rb, rc, alpha, alpha+2*dAlpha);
        make_clickable_chord(elem, i, cx, cy, (rc+rb)/2, alpha+dAlpha);
        svgarea.appendChild(elem);

        // minor chords
        elem = make_svg_arc_segment("svgarc dragarc", cx, cy, rc, rd, alpha, alpha+2*dAlpha);
        make_clickable_chord(elem, i+n, cx, cy, (rc+rd)/2, alpha+dAlpha);
        svgarea.appendChild(elem);

        alpha += dAlpha;

        osmdiv = make_key_display(i, cx, cy, (ra+rb)/2, alpha);
        area.appendChild(osmdiv);

        alpha += dAlpha;
    }

}

function polar_to_cart(cx, cy, radius, alpha){
    return [cx + radius*Math.cos(alpha), cy + radius*Math.sin(alpha)];
}

function make_svg_arc_segment(className, cx, cy, ra, rb, alphaA, alphaB){
    svgns = "http://www.w3.org/2000/svg";
    elem = document.createElementNS(svgns, "g");
    elem.setAttributeNS(null, "class", className);
    path = document.createElementNS(svgns, "path");
    p1 = polar_to_cart(cx, cy, ra, alphaA);
    p2 = polar_to_cart(cx, cy, ra, alphaB);
    p3 = polar_to_cart(cx, cy, rb, alphaB);
    p4 = polar_to_cart(cx, cy, rb, alphaA);
    code = ["M", ...p1,
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
    console.log(ev);
    index = ev.target.getAttribute("dropindex");
    selectedChords[index] = currentChordIndex;
    console.log(index);
    drop = document.getElementById("drop"+index);
    newpar = document.createElement("p");
    newpar.setAttribute("dropindex", index);
    newpar.innerHTML = chordsNames[currentChordIndex];
    drop.replaceChildren(newpar);
    update_chord_line();
}

function clicked(ev){
    if (__currentChordElement !== null){
        __currentChordElement.classList.remove("currentChord");
    }
    __currentChordElement = ev.path[1];
    __currentChordElement.classList.add("currentChord");
    currentChordIndex = __currentChordElement.getAttribute("chordindex");
}

function make_clickable_chord(draggablechord, index, cx, cy, radius, alpha) {
    svgns = "http://www.w3.org/2000/svg";
    // compute the central position
    [x, y] = polar_to_cart(cx, cy, radius, alpha);
    draggablechord.setAttribute("chordindex", index);
    draggablechord.addEventListener("click", clicked);
    chord_text = document.createElementNS(svgns, "text");
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
    fifths = tonalityFifths[index];
    measurexml = make_musicxml_chord_line([null], fifths);
    var xmlcode = make_musicxml_doc([measurexml], 0);
    osmd.load(xmlcode).then(
        function() {
          osmd.render();
        }
    );
    osmdiv.style.position = 'absolute';
    w = tonalityDisplayWidth[index];
    f = 65/80;
    x = f*cx + f*radius*Math.cos(alpha) - w;
    y = f*cy + f*radius*Math.sin(alpha) - 40;
    osmdiv.style.left = x + 'px';
    osmdiv.style.top = y + 'px';
    osmdiv.style.width = 2*w + 'px';
    osmdiv.style.height = '80px';
    return osmdiv;
}

function make_drop_element(index) {
    var drop_div = document.createElement("div");
    drop_div.setAttribute("dropindex", index);
    drop_div.id = "drop"+index;
    drop_div.className = "chorddrop";
    drop_div.addEventListener("click", drop_chord_handler);
    document.getElementById("droparea").appendChild(drop_div);
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
  partlist = ""
  for(let i = 0; i < parts.length; i++){
      partlist += tagwrapattr('score-part id="P'+(i+1)+'"', 'score-part', '');
  }
  partlist = tagwrap("part-list", partlist);
  xmlparts = ""
  for(let i = 0; i < parts.length; i++){
      part = tagwrapattr('part id="P'+(i+1)+'"', 'part', parts[i]);
      xmlparts += part;
  }
var footer = `
</score-partwise>`;
    return header+partlist+xmlparts+footer;
}

function make_measure_attributes(fifths){
    div = tagwrap("divisions", 1);
    key = tagwrap("key", tagwrap("fifths", fifths));
    time = tagwrap("time", tagwrap("beats", "4")+tagwrap("beat-type", "4"));
    clef = tagwrap("clef", tagwrap("sign", "G")+tagwrap("line", "2"));
    return tagwrap("attributes", div+key+time+clef);
}


function make_rest_measure(fifths){
    rest = '<rest/>';
    dur = tagwrap('duration', 4);
    type = tagwrap('type', 'whole');
    note = tagwrap('note', rest+dur+type);
    return note;
}

function make_musicxml_chord_line(chords, fifths) {
    var code = "";
    // console.log(chords);
    for(let i = 0; i < chords.length; i++){
        chord = chords[i];
        if (chord === null){
            measure = make_rest_measure(fifths);
        } else {
            measure = make_musicxml_chord(chord);
        }
        if (i === 0){
            measure = make_measure_attributes(fifths) + measure;
        }
        code += tagwrapattr('measure number="'+(i+1)+'"', 'measure', measure);
    }
    return code;
}

function make_musicxml_chord(notes) {
  var code = ""; 
  for(let i = 0; i < notes.length; i++){
      note = notes[i];
      // console.log(note);
      var step = tagwrap("step", note[0]);
      var octave = tagwrap("octave", note[1]);
      alter = '';
      if (note.length > 2){
          if (note[2] == '#'){
              alter = '1';
          } else {
              alter = '-1';
          }
          alter = tagwrap("alter", alter);
      }
      var pitch = tagwrap("pitch", step+octave+alter);
      var dur = tagwrap("duration", "4");
      var type = tagwrap("type", "whole");
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
