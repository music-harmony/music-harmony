
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
    55, 60, 65, 70, 75, 80, 85, 80, 75, 70, 65, 60,
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
 // ev.currentTarget.style.background = "lightblue";
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
  // ev.currentTarget.style.background = "white";
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
    chords = selectedChords.map(function(chord_index){
        if (chord_index === null){
            return null;
        } else {
            return chordsDatabase[chord_index];
        }
    });
    xmlcode = make_musicxml_chord_line(chords, 0);
    console.log(xmlcode);
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
    x = cx + radius/2*Math.cos(alpha) - w;
    y = cy + radius/2*Math.sin(alpha) - 40;
    osmdiv.style.left = x + 'px';
    osmdiv.style.top = y + 'px';
    osmdiv.style.width = 2*w + 'px';
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
    console.log(chords);
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
      console.log(note);
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
