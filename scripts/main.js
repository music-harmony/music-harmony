
var selectedChords = [0, 0, 0, 0];
var chordsDatabase = [
    ["C4", "E4", "G4"],
    ["G3", "B3", "D4"],
    ["D4", "F4#", "A4"],
    ["A3", "C4#", "E4"],
    ["E4", "G4#", "B4"],
    ["B3", "D4#", "F4#"],
    ["F3#", "A3#", "C4#"],
    ["D4b", "F4", "A4b"],
    ["A3b", "C4", "E4b"],
    ["E4b", "G4", "B4b"],
    ["B3b", "D4", "F4"],
    ["F4", "A4", "C5"],
// minor half
    ["a3", "c4", "e4"],
    ["e4", "g4", "b4"],
    ["b3", "d4", "f4#"],
    ["f3#", "a3", "c4#"],
    ["c4#", "e4", "g4#"],
    ["g3#", "b3", "d4#"],
    ["d4#", "f4#", "a4#"],
    ["b3b", "d4b", "f4"],
    ["f4", "a4b", "c5"],
    ["c4", "e4b", "g4"],
    ["g3", "b3b", "d4"],
    ["d4", "f4", "a4"],
];

var chordsNames = [
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F",
// minor half
    "a",
    "e",
    "b",
    "f#",
    "c#",
    "g#",
    "d#",
    "bb",
    "f",
    "c",
    "g",
    "d",
]

var loadedMelody = null;

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

function dragstart_handler(ev) {
 ev.currentTarget.style.background = "lightblue";
 ev.dataTransfer.setData("chord_index", ev.target.id);
 ev.effectAllowed = "copyMove";
}
function dragenter_handler(ev) {
  ev.target.style.background = "lightblue";
  ev.preventDefault();
}
function dragleave_handler(ev) {
  ev.target.style.background = "#202070";
  ev.preventDefault();
}
function dragover_handler(ev) {
 ev.preventDefault();
}
function drop_handler(ev) {
  ev.preventDefault();
  ev.target.style.background = "#202070";
  var chord_index = ev.dataTransfer.getData("chord_index");
  var index = ev.target.id;
  selectedChords[index] = chord_index;
  update_chord_line();
}

function dragend_handler(ev) {
  ev.currentTarget.style.background = "white";
  ev.dataTransfer.clearData();
}

function update_chord_line() {
    var newdiv = document.createElement("div");
    newdiv.className = "musicsheet";
    var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(newdiv);
    osmd.setOptions({
      backend: "svg",
      drawTitle: false,
      drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    chords = selectedChords.map(function(chord_index){return chordsDatabase[chord_index]});
    xmlcode = make_musicxml_chord_line(chords);
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
    rect = area.getBoundingClientRect();
    canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    context = canvas.getContext("2d");
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    ra = 380;
    rb = 250;
    rc = 170;
    rd = 100;
    context.lineWidth = 3;
    context.strokeStyle = "black";

    context.beginPath();
    context.arc(cx, cy, ra, 0, 2*Math.PI, false);
    context.stroke();

    context.beginPath();
    context.arc(cx, cy, rb, 0, 2*Math.PI, false);
    context.stroke();

    context.beginPath();
    context.arc(cx, cy, rc, 0, 2*Math.PI, false);
    context.stroke();

    context.beginPath();
    context.arc(cx, cy, rd, 0, 2*Math.PI, false);
    context.stroke();

    n = 12;
    alpha = -7*Math.PI / 12;
    dAlpha = (Math.PI) / n;
    for (i = 0; i < n ; i++){
        context.beginPath();
        context.moveTo(cx + ra*Math.cos(alpha), cy + ra*Math.sin(alpha));
        context.lineTo(cx + rd*Math.cos(alpha), cy + rd*Math.sin(alpha));
        context.stroke();
        alpha += dAlpha;

        chord = make_draggable_chord(i+n, cx, cy, rc+rd, alpha);
        area.appendChild(chord);
        chord = make_draggable_chord(i, cx, cy, rc+rb, alpha);
        area.appendChild(chord);
        osmdiv = make_key_display(i, cx, cy, ra+rb, alpha);
        area.appendChild(osmdiv);

        alpha += dAlpha;
    }

    area.appendChild(canvas);

}

function make_draggable_chord(index, cx, cy, radius, alpha) {
    // make html element
    dragchord = document.createElement("div");
    dragchord.id = index;
    dragchord.className = "draggablechord";
    dragchord.draggable = "true";
    dragchord.addEventListener("dragstart", dragstart_handler);
    dragchord.addEventListener("dragend", dragend_handler);
    dragchord.innerHTML = chordsNames[index];
    // position in circle
    dragchord.style.position = 'absolute';
    x = cx + radius/2*Math.cos(alpha) - 25;
    y = cy + radius/2*Math.sin(alpha) - 25;
    dragchord.style.left = x + 'px';
    dragchord.style.top = y + 'px';
    return dragchord;
}

function make_key_display(index, cx, cy, radius, alpha) {
    var osmdiv = document.createElement("div");
    osmdiv.id = "osm-chord-"+index;
    osmdiv.className = "musicsheet";
    var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(osmdiv);
    osmd.setOptions({
      backend: "svg",
      drawTitle: false,
      drawTimeSignatures: false,
      drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
    });
    measurexml = make_musicxml_chord_line([["C4", "E4", "G4"]]);
    var xmlcode = make_musicxml_doc([measurexml]);
    osmd.load(xmlcode).then(
        function() {
          osmd.render();
        }
    );
    osmdiv.style.position = 'absolute';
    x = cx + radius/2*Math.cos(alpha) - 50;
    y = cy + radius/2*Math.sin(alpha) - 40;
    osmdiv.style.left = x + 'px';
    osmdiv.style.top = y + 'px';
    osmdiv.style.width = '100px';
    osmdiv.style.height = '80px';
    return osmdiv;
}

function make_drop_element(index) {
    var drop_div = document.createElement("div");
    drop_div.id = index;
    drop_div.className = "chorddrop";
    drop_div.addEventListener("drop", drop_handler);
    drop_div.addEventListener("dragover", dragover_handler);
    drop_div.addEventListener("dragenter", dragenter_handler);
    drop_div.addEventListener("dragleave", dragleave_handler);
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

function make_measure_attributes(){
    div = tagwrap("divisions", 1);
    key = tagwrap("key", tagwrap("fifths", "0"));
    time = tagwrap("time", tagwrap("beats", "4")+tagwrap("beat-type", "4"));
    clef = tagwrap("clef", tagwrap("sign", "G")+tagwrap("line", "2"));
    return tagwrap("attributes", div+key+time+clef);
}

function make_musicxml_chord_line(chords) {
    var code = "";
    for(let i = 0; i < chords.length; i++){
        chord = chords[i];
        if (chord === null){
            chord = chordsDatabase[0];
        }
        chordcode = make_musicxml_chord(chord);
        if (i === 0){
            chordcode = make_measure_attributes() + chordcode;
        }
        code += tagwrapattr('measure number="'+(i+1)+'"', 'measure', chordcode);
    }
    return code;
}

function make_musicxml_chord(notes) {
  var code = ""; 
  for(let i = 0; i < notes.length; i++){
      note = notes[i];
      var step = tagwrap("step", note[0]);
      var octave = tagwrap("octave", note[1]);
      var pitch = tagwrap("pitch", step+octave);
      var dur = tagwrap("duration", "4");
      var type = tagwrap("type", "whole");
      if (i === 0){
        var chord = ""
      } else {
        var chord = "<chord/>"
      }
      var res = tagwrap("note", chord+pitch+dur+type);
      code += res;
  }
  return code;
}
