// RENDERER PROCESS
'use strict';

const dateFormat = require('dateformat');
const moment = require('moment');
const electron = require('electron');
const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;
const syntaxesList = require('./js/syntaxes').syntaxes;
const _ = require('lodash');

var uuid = require('node-uuid'),
$ = require('jquery'),
marked = require('marked'),
low = require('lowdb');

var db = low(__dirname + '/notesdb.json');
var editor;
var notes = [];
var notesToDisplay = [];
var tags = [];
var syntaxes = [];
var currentNote;
var currentNoteListType;

var $editor,
$editorTextArea,
$preview,
$commandPalette,
$commandPaletteInput,
$emptyNote,
$noteList,
$tagsSection,
$tagEditor,
$sidebar;

$(document).ready(function (){
	cacheDom();
	initDB();
	initSettings();
	initAce();
	initSidebar();
	initNotes();
	initNoteList();
	initSearchbox();
	initCommandPalette();
	initEditorAndPreviewWindow();
	initEmptyNote();
	setBinds();

	editor.getSession().on('changeScrollTop', function(scroll){
		console.log((scroll+40) / $editor.height() * 100);
		$preview.scrollTop(scroll);
		// console.log(scroll + 40);
	});
});

function cacheDom() {
	$editor = $("#editor");
	$editorTextArea = $("#editor-textarea");
	$preview = $("#preview");
	$sidebar = $("#sidebar");
	$noteList = $("#note-list");
	$commandPalette = $("#command-palette");
	$commandPaletteInput = $("#command-palette").find('input[type="text"]');
	$emptyNote = $("#empty-note");

	$tagsSection = $("#tag-editor");
	$tagEditor = $tagsSection.find("input[type='text']");
}

function initAce() {
	editor = ace.edit("editor-textarea");
	editor.setTheme("ace/theme/github");
	editor.session.setMode("ace/mode/markdown");

	editor.container.style.lineHeight = 1.5;
	editor.$blockScrolling = Infinity;
	editor.renderer.setScrollMargin(40, 30);
	editor.renderer.setPadding(30);
	
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

	$(window).resize();

	// Force link clicks to open in default OS browser
	$('a').on('click', function(e){
		e.preventDefault();
		// shell.openExternal("http:://www.google.com");
	});
}

function initDB(){
	db.defaults({'notes': [], 'settings': {'show_sidebar': true, 'show_notelist': true}}).value()
}

function initSettings() {
	var settings = db.get('settings').value();

	(settings.show_sidebar) ? $sidebar.show() : $sidebar.hide();
	(settings.show_notelist) ? $noteList.show() : $noteList.hide();
}

function initNotes(){
	fetchNotesFromDB();
	currentNoteListType = 'all';
	notesToDisplay = notes.filter(function(n){ return n.deleted == 0});
}

function initNoteList(focusEditor = true) {
	if(notes.length <= 0){
		showEmptyNote();
	} else {
		hideEmptyNote();
	}

	refreshNoteList();

	// select the first note
	selectANoteFromNoteList($noteList.find('ul li:first'), focusEditor)
}

function initSidebar() {
	refreshTagsList();
	refreshSyntaxesList();

	$('#sidebar ul').on('click', 'li.note-list-type', function(){
		var noteListType = $(this);
		selectNoteListType(noteListType);
	});
}

function initSearchbox() {
	$('input#search-note').on('input', function(){
		var searchVal = $(this).val();
		search(searchVal);
	})
	.keyup(function(e){
		// press ESC or Enter
		if(e.keyCode == 27 || e.keyCode == 13){
			$(this).blur();
			editor.focus();
		}

		// press ESC
		if(e.keyCode == 27){
			search('');
		}
	});
}

function initCommandPalette() {
	$commandPaletteInput.on('paste keyup', function(e){
		search($(this).val());
	})
	.on('focusout', function(){
		$commandPalette.hide();
		$commandPaletteInput.val('');
		// search('');
	})
	.keyup(function(e){
		// press ESC or enter
		if(e.keyCode == 27 || e.keyCode == 13){
			$commandPalette.hide();
			$commandPaletteInput.val('');
		}

		// press ESC
		if(e.keyCode == 27){
			search('');
		}

		// press enter
		else if(e.keyCode == 13){
		}
	});
}

function initEditorAndPreviewWindow() {
}

function initEmptyNote() {
	$emptyNote.find('span').show();

	$emptyNote.find('span a').on('click', function(){
		createNewNote();
	});
}

function setBinds() {
	// Input code editor change handler
	editor.on('change', function(){
		if(editor.curOp.docChanged && ["insertstring", "backspace", "cut", "paste", "indent"].includes(editor.curOp.command.name)) {
			saveNote();
			refreshOutput();
		}
	});

	// Toggle notelist button
	$('#toggle-note-list').bind('click', function(e){
		$noteList.animate({"margin-left":"-=250"}, 200, 'swing');
	});

	// on click delete note button
	$noteList.find('ul').on('click', 'li button.btn-delete-note', function(e) {
		e.stopPropagation();
		deleteNote($(this).parent());
	});

	// Select note from note list
	$noteList.find('ul').on('click', 'li', function(e){
		$('#search-note').blur();
		selectANoteFromNoteList($(this));
	});

	// on click create note button
	$('button#btn-create-note').on('click', function(){
		createNewNote();
	});
}

function initTags(tags){
	// return;
	// $('#tags-editor').html('<input id="tags" type="tags" placeholder="add..." value=' + tags.join() + '>');

	$tagsSection.find('span.tag').remove()

	tags.map(function(tag){
		$('<span class="tag">' + tag + '</span>').insertBefore($tagEditor);
	})

	// let $tags = $('#tags')[0];
	// $tags.addEventListener('input', inputTags);
	// $tags.addEventListener('change', changeTags);

	changeTags();
}

// EDITOR ---------------------

function refreshOutput(){
	var editorText = editor.getValue();

	$noteList.find('ul li.active h1').html(getNoteTitleOfNoteBody(editorText));
	$preview.html(marked(editorText));
}

function saveNote(){
	// console.log((editor.session.getScrollTop() + 40) + '/' + (editor.height));
	$noteList.find('ul li.active').parent().prepend($noteList.find('ul li.active'));

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
}

function setEditorSyntax(syntax = 'markdown') {
	editor.setOptions({ mode: 'ace/mode/' + getSyntaxModeName(syntax) });
	(syntax == 'markdown') ? $preview.show() : $preview.hide();
}

// TAGS ---------------------

function inputTags(e){
}

// When a tag is added or removed
function changeTags(e){
	$('span.tag').bind('click', selectTag);

	if(!this) {
		return;
	}

	var tagsArray = this.value.split(',');

	db.get('notes').find({id:currentNote.id}).assign({
		tags: tagsArray,
		updated_at: new Date().getTime()
	}).value()

	refreshTagsList();
}

function selectTag(e){
	// TODO
	console.log('SELECT TAG: ' + $(e.target).text());
}

// SIDEBAR ----------------

// called on click notelist type element in the sidebar
function selectNoteListType($noteListType){
	var noteListType = $noteListType.data('note-type');
	filterNoteListType(noteListType, $noteListType);
}

// programatically select/filter notes by note list type
function filterNoteListType(noteListType, $noteListType = null){
	currentNoteListType = noteListType;

	$('#sidebar ul li.note-list-type.active').removeClass('active');
	
	if(!$noteListType){
		$noteListType = $('ul.notes-list li[data-note-type=' + currentNoteListType + ']');
	}

	setNoteListTypeLabel($noteListType[0].innerHTML);
	$noteListType.addClass('active');

	fetchNotesToDisplayByNoteListType(currentNoteListType);
	initNoteList();
}

function fetchNotesToDisplayByNoteListType(noteListType){
	switch(noteListType) {
		case 'all notes':
		notesToDisplay = notes.filter(function(n){ return n.deleted == 0});
		break;

		case 'favorites':
		notesToDisplay = notes.filter(function(n){ return n.favorited == 1 && n.deleted == 0; });
		break;

		case 'markdown':
		notesToDisplay = notes.filter(function(n){ return n.syntax == 'markdown' && n.deleted == 0; });
		break;

		case 'code':
		notesToDisplay = notes.filter(function(n) { return n.syntax !== 'markdown' && n.deleted === 0; });
		break;

		case 'trash':
		notesToDisplay = notes.filter(function(n){ return n.deleted == 1});
		break;

		case 'syntax':
		notesToDisplay = notes.filter(function(n){ return n.syntax == $noteListType.text().trim().toLowerCase() && n.deleted == 0; });
		break;

		case 'tag':
		notesToDisplay = notes.filter(function(n){ return n.tags.includes($noteListType.text().trim().toLowerCase()) && n.deleted === 0; });
		break;

		default:
		notesToDisplay = notes.filter(function(n){ return n.deleted == 0});
		break;
	}
}

// SIDEBAR TAGS LIST ----------------

function refreshTagsList() {
	// console.log('refresh tags');

	$('#sidebar ul.tags-list').html('');

	tags = _.sortBy(_.uniq(_.flatten(_.map(notes, 'tags'))))

	tags.map(function(tag){
		addTagToTagsList(tag);
	})
}

function addTagToTagsList(tag){
	$('#sidebar ul.tags-list').append('<li class="note-list-type" data-note-type="tag"><i class="fa fa-tag"></i> ' + tag + '</li>');
}

// SIDEBAR SYNTAX LIST -----------------
function refreshSyntaxesList() {
	// console.log('refresh syntaxes');

	$('#sidebar ul.syntax-list').html('');

	syntaxes = _.sortBy(_.uniq(_.map(notes, 'syntax')))

	syntaxes.map(function(syntax){
		addSyntaxToSyntaxesList(syntax);
	})
}

function addSyntaxToSyntaxesList(syntax){
	$('#sidebar ul.syntax-list').append('\
		<li class="note-list-type" data-note-type="syntax" data-note-type-value="' + syntax + '">\
		<i class="fa fa-code"></i> ' + syntax + ' \
		</li>');
}

function getSyntaxModeName(syntax) {
	return syntaxesList.find(function(s) { return s.name.toLowerCase() == syntax.toLowerCase() }).syntax;
}


// NOTES LIST -----------------

function fetchNotesFromDB() {
	// fetch the notes from db
	notes = db.get('notes').sortBy('updated_at').value()

	refreshTagsList();
	refreshSyntaxesList();
}

// Display the objects in `notes` to the note list UI
function refreshNoteList(){
	$noteList.find('ul').html('');

	// add the loaded notes to note list
	notesToDisplay.map(function(note){
		addNoteToNoteList(note);
	});
}

function selectANoteFromNoteList($noteElement, focusEditor = true) {
	var id = $noteElement.attr('id')

	var note = notes.find(function (o){
		{ return o.id == id }
	})

	if(note){
		// Set the checked syntax in the menu items (i.e. View > Syntax > what language is checked)
		ipcRenderer.send('selectSyntax', syntaxesList.findIndex(function (s) { return s.name.toLowerCase() == note.syntax.toLowerCase(); }));

		hideEmptyNote();
	} else {
		showEmptyNote();
	}

	$noteList.find('ul li.active').removeClass('active')
	$noteElement.addClass('active')

	displayNoteToEditor(note)

	if(focusEditor){
		editor.focus();
	}

	$tagsSection.on('click', function(e){
		$tagEditor.focus();
	})

	$tagsSection.find('span.tag').on('click', function(e){
		e.stopPropagation()
	})

	$tagEditor.on('input', function(e) {
		const size = $(this).val().length
		$(this).attr('size', (size > 0) ? size + 1 : 9)
	})

	// submit new tag
	$tagEditor.on('keydown', function(e){
		// if empty, return
		if($(this).val() == '') {
			return
		}

		var keycode = (e.keyCode ? e.keyCode : e.which)
		if(keycode == '13'){
			e.preventDefault()
			currentNote.tags.push($(this).val())
			
			$(this).val(null)
			$(this).trigger('input')
		}
	})

	// if(offset + 54 + 20 > window.innerHeight){
	// 	$noteList.find('ul').animate({scrollTop: $(window).scrollTop() + $noteElement.offset().top}, 200);
	// }
}

function showEmptyNote(){
	$emptyNote.show();
	$editor.hide();
	$preview.hide();
}

function hideEmptyNote() {
	$emptyNote.hide();
	$editor.show();
}

function setNoteListTypeLabel(label){
	// var newLabel = label;
	// var faIcon = '';

	// switch(label){
		// case 'trash': break;
		// default: newLabel += ' notes'; break;
	// }

	$('#note-list-label').html(label);
}

function displayNoteToEditor(note){
	if(!note){
		return;
	}
	currentNote = note;

	// Set note body to editor textarea
	editor.setValue(note.body, -1);

	// Set editor syntax
	setEditorSyntax(note.syntax);

	// Set tags
	console.log(note.tags)
	initTags(note.tags);

	// Toggle preview based on saved preview setting
	(currentNote.preview_enabled) ? $preview.show() : $preview.hide();

	refreshOutput();

	// Trigger resize to trigger word wrap
	$(window).resize();
}

function addNoteToNoteList(note) {
	$noteList.find('ul').prepend('\
		<li id=' + note.id + '>\
		<h1>' + getNoteTitleOfNoteBody(note.body) + '</h1>\
		<span class="note-timestamp">' + moment(note.updated_at).fromNow() + '</span>\
		<button class="btn btn-delete-note"><i class="icon ion-close-round"></i></button>\
		</li>');
}

function showNextNote(){
	var $next = $noteList.find('ul li.active').next();
	selectANoteFromNoteList(($next.length != 0) ? $next : $noteList.find('ul li:first'));
}

function showPreviousNote(){
	var $prev = $noteList.find('ul li.active').prev();
	selectANoteFromNoteList(($prev.length != 0) ? $prev : $noteList.find('ul li:last'));
}

function createNewNote(){
	var newNote = {
		'id': uuid.v4(),
		'body':'',
		'updated_at': new Date().getTime(),
		'deleted': 0,
		'tags': [],
		'syntax': 'markdown',
		'preview_enabled': true,
	}
	notes = db.get('notes').push(newNote).value()

	addNoteToNoteList(newNote)
	selectANoteFromNoteList($noteList.find('ul li:first'))
	editor.focus();
}

function deleteNote($noteElement){
	if(currentNote.deleted == 1){
		if(confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
			db.get('notes').remove({id: $noteElement.attr('id')}).value()
		} else {
			return;
		}
	} else {
		db.get('notes').find({id: $noteElement.attr('id')}).assign({
			deleted: 1,
			updated_at: new Date().getTime()
		}).value()
	}

	fetchNotesFromDB();
	removeNoteElementFromNoteList($noteElement);
}

function removeNoteElementFromNoteList($noteElement){
	$noteElement.animate({
		height: '0',
		margin: 0,
		padding: 0,
		marginLeft: '-250px',
		// marginLeft: '-' + $(this).width() + 'px',
	}, 200, 'swing', function() {
		$(this).remove();
		if($noteElement.hasClass('active')) {
			showNextNote()
		}
	});
}

function favoriteNote($noteElement){
	db.get('notes').find({id: $noteElement.attr('id')}).assign({
		favorited: 1
	}).value()
}

// SEARCH -------------------

function search(searchTerm){
	setNoteListTypeLabel('<i class="fa fa-search"></i> SEARCH: <b>' + searchTerm + '</b>');

	if(searchTerm == ''){
		// fetchNotesToDisplayByNoteListType(currentNoteListType);
		filterNoteListType(currentNoteListType);
	} else {
		notesToDisplay = db.get('notes').filter(function(el){
			return el.body.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 && el.deleted == 0;
		}).sortBy('updated_at').value();
	}

	initNoteList(false);
}

function showCommandPalette() {
	var $targetPane;

	$targetPane = ($editor.is(":visible")) ? $editor : $preview;

	// $targetPane.css('background-color','red');

	$commandPalette.toggle();
	$commandPaletteInput.focus();
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

	db.get('notes').find({id:currentNote.id}).assign({
		'preview_enabled': $preview.is(":visible")
	}).value()
});

ipcRenderer.on('toggleSidebar', function(event){
	$sidebar.toggle()
	editor.resize(true)

	db.get('settings').assign({
		'show_sidebar': $sidebar.is(":visible")
	}).value()
});

ipcRenderer.on('toggleNoteList', function(event){
	$noteList.toggle();
	editor.resize(true)

	db.get('settings').assign({
		'show_notelist': $noteList.is(":visible")
	}).value()
});

ipcRenderer.on('toggleEditor', function(event){
	// $editor.toggle()
	// editor.resize(true)

	// db.get('notes').find({id:currentNote.id}).assign({
	// 	'editor_enabled': $editor.is(":visible")
	// }).value()
});

ipcRenderer.on('nextNote', function(event){
	showNextNote()
});

ipcRenderer.on('previousNote', function(event){
	showPreviousNote()
});

ipcRenderer.on('focusSearchBox', function(event){
	// showCommandPalette();
	$("input#search-note").focus()
});

ipcRenderer.on('createNewNote', function(event){
	createNewNote()
});

ipcRenderer.on('deleteNote', function(event){
	deleteNote($noteList.find('ul li.active'));
});

ipcRenderer.on('favoriteNote', function(event){
	favoriteNote($noteList.find('ul li.active'));
});

ipcRenderer.on('selectNoteListType', function(event, noteListType){
	filterNoteListType(noteListType);
});

ipcRenderer.on('selectSyntax', function(event, syntax){
	db.get('notes').find({id:currentNote.id}).assign({
		'syntax': syntax
	}).value()

	setEditorSyntax(syntax);
	refreshSyntaxesList();

	// filterNoteListType();
	$('#sidebar ul li.note-list-type[data-note-type-value="' + syntax + '"]').trigger('click');
});