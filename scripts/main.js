
var selectedChords = [0, 0, 0, 0];
var chordsDatabase = [];
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

function make_draggable_chord(index, chordName, chordData) {
    chordsDatabase[index] = chordData;
    var chord_div = document.createElement("div");
    chord_div.id = index;
    chord_div.className = "draggablechord";
    chord_div.draggable = "true";
    chord_div.addEventListener("dragstart", dragstart_handler);
    chord_div.addEventListener("dragend", dragend_handler);
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
    measurexml = make_musicxml_chord_line([chordData]);
    var xmlcode = make_musicxml_doc([measurexml]);
    osmd.load(xmlcode).then(
        function() {
          osmd.render();
        }
    );
    chord_div.appendChild(osmdiv);
    document.getElementById("draggarea").appendChild(chord_div);
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
