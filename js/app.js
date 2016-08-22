// RENDERER PROCESS
'use strict';


const dateFormat = require('dateformat');
const electron = require('electron');
const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;
const tagsInput = require('tags-input');

var uuid = require('node-uuid'),
	$ = require('jquery'),
	marked = require('marked'),
	low = require('lowdb');

// require('./js/ace/ace.js');

var db = low(__dirname + '/notesdb.json');
var editor;
var notes = [];
var currentNote;

var $editor, $editorTextArea, $preview, $sidebar;

$(document).ready(function (){
	$editor = $("#editor");
	$editorTextArea = $("#editor-textarea");
	$preview = $("#preview");
	$sidebar = $("#sidebar");

	// Hide sidebar by default
	$sidebar.hide();

	initAce();
	initNotes();
	initNoteList();
	initSearchbox();
	setBinds();
	// initTags();
});

function initAce() {
	editor = ace.edit("editor-textarea");
	editor.setTheme("ace/theme/github");
	editor.session.setMode("ace/mode/markdown");
	editor.setOptions({
		showGutter: false,
		fontFamily: 'Menlo',
		showLineNumbers: false,
		fontSize: '9pt',
		wrap: true,
		cursorStyle: 'slim smooth',
		showPrintMargin: false,
		highlightActiveLine: false
	});

	editor.$blockScrolling = Infinity;

    editor.container.style.lineHeight = 1.4;

    // editor.renderer.setScrollMargin(30, 30);
    // editor.container.style.padding = '20px';

    // editor.container.style.fontWeight = 300;

	// Force link clicks to open in default OS browser
	$('a').on('click', function(e){
		e.preventDefault();
		// shell.openExternal("http:://www.google.com");
	});
}

function initNotes(){
	// fetch the notes from db
	db.defaults({'notes': []}).value()
	notes = db.get('notes').value()

	// Seed dummy notes
	if(notes.length === 0){
		db.get('notes').push({'id': uuid.v4(), 'body':'# New Note qwjeqwjlkeqwlk', 'tags':['code','php'], 'updated_at': new Date().getTime()}).value()
		db.get('notes').push({'id': uuid.v4(), 'body':'# hello!\n\nomg this is really awesome', 'tags':['code','electron'], 'updated_at': new Date().getTime()}).value()
		db.get('notes').push({'id': uuid.v4(), 'body':'aw yiss', 'tags':['code','omg'], 'updated_at': new Date().getTime()}).value()
	}
}

function initNoteList() {
	console.log("init");
	$('#note-list ul').html('');

	// add the loaded notes to note list
	notes.map(function(note){
		addNoteToNoteList(note);
	});

	// select the first note
	selectANoteFromNoteList($('#note-list ul li:first'))
}

function initSearchbox() {
	$('#search-note').on('change paste keyup', function(){
		search($(this).val());
	});
}

function search(searchTerm){
	notes = db.get('notes').value().filter(function(el){
		return el.body.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
	});

	// 
	console.log("search results:")
	console.log(notes)

	initNoteList();
}

function setBinds() {
	// Input code editor change handler
	editor.on('change', function(){
		saveNote();
		refreshOutput();
	});

	// Toggle notelist button
	$('#toggle-note-list').bind('click', function(e){
		$('#note-list').animate({"margin-left":"-=250"}, 200, 'swing');
	});

	// on click delete note button
	$('#note-list ul').on('click', 'li button.btn-delete-note', function(e) {
		e.stopPropagation();
		deleteNote($(this).parent());
	});

	// Select note from note list
	$('#note-list ul').on('click', 'li', function(e){
		selectANoteFromNoteList($(this))
	});

	// on click create note button
	$('button#btn-create-note').on('click', function(){
		createNewNote();
	});
}

function initTags(tags){
	$('#tags-editor').html('<input id="tags" name="hashtags" type="tags" placeholder="Add a tag" value=' + tags.join() + '>');

	[].forEach.call($('input[type="tags"]'), tagsInput);

	let $tags = $('#tags')[0];
	$tags.addEventListener('input', inputTags);
	$tags.addEventListener('change', changeTags);

	changeTags();
}

// EDITOR ---------------------

function refreshOutput(){
	var editorText = editor.getValue();

	$('#note-list ul li.active h1').html(getNoteTitleOfNoteBody(editorText));
	$preview.html(marked(editorText));
}

function saveNote(){
	currentNote.body = editor.getValue()
	db.get('notes').find({id:currentNote.id}).assign({
		body: currentNote.body,
		updated_at: new Date().getTime()
	}).value()
}

function getNoteTitleOfNoteBody(noteBody) {
	// remove html tags and markdown symbols
	var splitted = noteBody.replace(/(<([^>]+)>)/ig, '').split('\n');

	return splitted[0].replace(/^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g, '') || 'Untitled note';
	// noteSubtitle = splitted[1].replace(/^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g, '');

	// get first and second non-blank text
	// console.log(noteTitle + ' / ' + noteSubtitle);
}

// TAGS ---------------------

function inputTags(e){
	console.log('input ' + this.value);
}

function changeTags(e){
	$('span.tag').bind('click', selectTag);

	if(!this) {
		return;
	}

	db.get('notes').find({id:currentNote.id}).assign({
		tags: this.value.split(','),
		updated_at: new Date().getTime()
	}).value()
}

function selectTag(e){
	// TODO
	console.log('SELECT TAG: ' + $(e.target).text());
}

// NOTES LIST -----------------
function selectANoteFromNoteList($noteElement) {
	var id = $noteElement.attr('id')

	console.log("SELECTED NOTE ID: " + id)

	var note = notes.find(function (o){
		{ return o.id == id }
	})

	console.log("THE SELECTED NOTE")
	console.log(note)

	$('.active').removeClass('active')
	$noteElement.addClass('active')

	displayNoteToEditor(note)

	// if(offset + 54 + 20 > window.innerHeight){
	// 	$('#note-list ul').animate({scrollTop: $(window).scrollTop() + $noteElement.offset().top}, 200);
	// }

}

function displayNoteToEditor(note){

	currentNote = note;

	// Set note body to editor textarea
	editor.setValue(note.body, -1);

	// Set tags
	initTags(note.tags);
	// [].forEach.call($('input[type="tags"]'), tagsInput);

	refreshOutput();
}

function addNoteToNoteList(note) {
	$('#note-list ul').prepend('\
		<li id=' + note.id + '>\
			<h1>' + getNoteTitleOfNoteBody(note.body) + '</h1>\
			<span>' + dateFormat(note.updated_at, 'shortDate') + '</span>\
			<button class="btn btn-delete-note"><i class="icon ion-close-round"></i></button>\
		</li>');
}

function showNextNote(){
	var $next = $('#note-list ul li.active').next();
	selectANoteFromNoteList(($next.length != 0) ? $next : $('#note-list ul li:first'));
}

function showPreviousNote(){
	var $prev = $('#note-list ul li.active').prev();
	selectANoteFromNoteList(($prev.length != 0) ? $prev : $('#note-list ul li:last'));
}

function createNewNote(){
	var newNote = {'id': uuid.v4(), 'body':'', 'updated_at': new Date().getTime()}
	console.log("create new note:")
	console.log(newNote)
	notes = db.get('notes').push(newNote).value()

	addNoteToNoteList(newNote)
	selectANoteFromNoteList($('#note-list ul li:first'))
}

function deleteNote($noteElement){
	db.get('notes').remove({'id': $noteElement.attr('id')}).value()

	$noteElement.animate({
	    height: '0',
		margin: 0,
		padding: 0,
		marginLeft: '-250px',
		// marginLeft: '-' + $(this).width() + 'px',
	}, 200, 'swing', function() {
		if($noteElement.hasClass('active')) {
			showNextNote()
		}
		
		// $(this).remove();
	});
}


// IPC LISTENERS ---------------

ipcRenderer.on('getEditorContents', function(event){
	ipcRenderer.send('saveFile', editor.getValue())
});

ipcRenderer.on('loadEditorContents', function(event, data){
	$editorTextarea.val(data)
	refreshOutput()
});

ipcRenderer.on('togglePreview', function(event){
	$preview.toggle()
	editor.resize(true)
	// $output.remove()
});

ipcRenderer.on('toggleSidebar', function(event){
	$sidebar.toggle()
	editor.resize(true)
});

ipcRenderer.on('toggleEditor', function(event){
	$editor.toggle()
	editor.resize(true)
});

ipcRenderer.on('nextNote', function(event){
	showNextNote()
});

ipcRenderer.on('previousNote', function(event){
	showPreviousNote()
});

ipcRenderer.on('focusSearchBox', function(event){
	$("input#search-note").focus()
});

ipcRenderer.on('createNewNote', function(event){
	createNewNote()
});