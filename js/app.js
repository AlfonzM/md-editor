// RENDERER PROCESS

var uuid = require('node-uuid'),
	$ = require('jquery'),
	marked = require('marked'),
	shell = require('electron').shell,
	low = require('lowdb');

// require('./js/ace/ace.js');

var db = low(__dirname + '/notesdb.json');
var editor;
var notes = [];

var $editorTextArea, $preview;

$(document).ready(function (){
	$editorTextarea = $("#editor-textarea");
	$preview = $("#preview");

	initAce();
	initNotes();
	initEditor();
	setBinds();
});

function initAce() {
	editor = ace.edit("editor-textarea");
	editor.setTheme("ace/theme/twilight");
	editor.session.setMode("ace/mode/markdown");
	editor.setOptions({
		showGutter: false,
		fontFamily: 'Menlo',
		showLineNumbers: false,
		fontSize: '9pt',
		wrap: true,
		showPrintMargin: false
	});

	// Force link clicks to open in default OS browser
	$('a').on('click', function(e){
		e.preventDefault();
		shell.openExternal("http:://www.google.com");
	});
}

function initNotes(){
	db.defaults({'notes': []}).value()
	var notes = db.get('notes').value()

	if(notes.length === 0){
		db.get('notes').push({'id': uuid.v4(), 'body':'# New Note qwjeqwjlkeqwlk', 'updated_at': new Date().getTime()}).value()
		db.get('notes').push({'id': uuid.v4(), 'body':'# hello!\n\nomg this is really awesome', 'updated_at': new Date().getTime()}).value()
		db.get('notes').push({'id': uuid.v4(), 'body':'aw yiss', 'updated_at': new Date().getTime()}).value()
	}

	// add the loaded notes to note list
	notes.map(function(note){
		addNoteToNoteList(note);
	});

	// select the first note
	selectANoteFromNoteList($('#note-list ul li:first'))

	console.log(notes)
}

function setBinds() {
	// Input code editor change handler
	$editorTextarea.bind('input propertychange', function(){
		// saveNote();
		refreshOutput();
	});

	// Toggle notelist button
	$('#toggle-note-list').bind('click', function(e){
		$('#note-list').animate({"margin-left":"-=250"}, 200, 'swing');
	});

	// Select note from note list
	$('#note-list ul li').on('click', function(e){
		selectANoteFromNoteList($(this))
	})
}


// EDITOR ---------------------
function initEditor() {

}

function refreshOutput(){
	$preview.html(marked(editor.getValue()));
}

// NOTES LIST -----------------
function selectANoteFromNoteList($noteElement) {
	var id = $noteElement.attr('id')

	var note = notes.find(function (o){
		{ return o.id == id }
	})

	$('.active').removeClass('active')
	$noteElement.addClass('active')

	// displayNote(note)
}

function addNoteToNoteList(note) {
	$('#note-list ul').prepend('<li id=' + note.id + '><h1>' + note.body.substr(0,15) + '...</h1><span>' + note.updated_at + '</span></li>');
}