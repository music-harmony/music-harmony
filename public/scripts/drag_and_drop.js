
var selectedChords = [null, null, null, null];
var chordsDatabase = [];

function dragstart_handler(ev) {
 // Change the source element's background color to signify drag has started
 // ev.currentTarget.style.background = "lightblue";
 // Add the id of the drag source element to the drag data payload so
 // it is available when the drop event is fired
 ev.dataTransfer.setData("chord_index", ev.target.id);
 // Tell the browser both copy and move are possible
 ev.effectAllowed = "copyMove";
}
function dragover_handler(ev) {
 // Change the target element's border to signify a drag over event
 // has occurred
 ev.currentTarget.style.background = "lightblue";
 ev.preventDefault();
}
function drop_handler(ev) {
  ev.preventDefault();
  // Get the id of drag source element (that was added to the drag data
  // payload by the dragstart event handler)
  ev.target.style.background = "#202070";
  var chord_index = ev.dataTransfer.getData("chord_index");
  var chord = chordsDatabase[chord_index];
  var index = ev.target.id;
  selectedChords[index] = chord;
  update_chord_line();
}

function dragend_handler(ev) {
  // Restore source's border
  // ev.target.style.background = "white";
  // Remove all of the drag data
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
    xmlcode = make_musicxml_chord_line(selectedChords);
    doc = make_musicxml_doc(xmlcode);
    osmd.load(doc).then(
        function() {
          osmd.render();
        }
    );
    document.getElementById("chordsheet").replaceChildren(newdiv);
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
    var xmlcode = make_musicxml_doc(measurexml);
    osmd.load(xmlcode).then(
        function() {
          osmd.render();
        }
    );
    chord_div.appendChild(osmdiv);
    // var par = document.createElement("p");
    // par.innerHTML = chord;
    // chord_div.appendChild(par);
    console.log(chord_div);
    document.getElementById("draggarea").appendChild(chord_div);
}

function make_drop_element(index) {
    var drop_div = document.createElement("div");
    drop_div.id = index;
    drop_div.className = "chorddrop";
    drop_div.addEventListener("drop", drop_handler);
    drop_div.addEventListener("dragover", dragover_handler);
    console.log(drop_div)
    document.getElementById("droparea").appendChild(drop_div);
}

function tagwrap(tag, body){
    return "<"+tag+">"+body+"</"+tag+">";
}

function tagwrapattr(tag_attr, tag, body){
    return "<"+tag_attr+">"+body+"</"+tag+">";
}

function make_musicxml_doc(body) {
  var header = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">`;
    var footer = `
  </part>
</score-partwise>`;
    return header+body+footer;
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
