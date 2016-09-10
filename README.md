MD Editor
===============

Programming-centric note-taking app made in Electron.

Basically like a macOS Notes app but with Markdown support and has a IDE-ish text editor.

## Installation

__Development__

```
git clone https://github.com/AlfonzM/md-editor.git
cd md-editor
npm install
npm start
```

__Build__

```
npm run build
```

## TODO

__General__
- [ ] Search notes

__Notes__
- [x] New note
- [x] Delete note
- [ ] Open file and add to list (import)
- [ ] Save As file (export)
- [x] Add tags to notes
- [ ] Select multiple notes in notelist (for deleting)
- [x] Show "No note selected, create a new note" if notes list is empty

__Editor__
- [x] Auto save on type (no need to Save/Open files)
- [x] Open where the user left off
- [ ] Insert Markdown menu bar item
- [ ] Insert image / Drag image from Finder
- [ ] Auto scroll Preview window to where editor window cursor is
- [x] Toggle Show/Hide Preview window
- [ ] ~~Resize Preview window (draggable separator)~~
- [ ] GitHub checklist markdown
- [ ] Code editor keystrokes/shortcuts (Sublime/Atom)
- [ ] "Copy to clipboard" button on code snippets
- [x] Set editor syntax per note

__Sidebars__
- [x] Filter by All Notes, Favorites, etc
- [x] Navigate notes in sidebar
- [x] Toggle show sidebar
- [x] Sort notes list by updated_by date
- [x] View notes by tags in sidebar
- [ ] List available tags and syntaxes in sidebar

__Format__
- [ ] ~~Use external Markdown CSS theme~~
- [ ] ~~Edit editor Font (font-size, font-family, line-height)~~
- [ ] Change font size
- [ ] Use syntax highlighter themes

__Preferences (menu bar items)__
- [ ] Ace editor options
- [ ] Color scheme?

__Keyboard Shortcuts__
- [x] Ctrl+(Shift)+Tab to cycle notes
- [x] Toggle Show/Hide Preview window
- [x] Toggle Show/Hide sidebar
- [x] Create note
- [ ] Delete note
- [ ] Insert/Edit current line to text format (e.g. change line to Heading 1, insert italic text etc)
- [x] Zoom in/Out
- [x] Cmd+Opt+F search notes

__Known bugs__
- [ ] Weird tag editor width when switching from notes with and without Preview pane