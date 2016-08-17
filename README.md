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
- [ ] Preferences window/page
- [ ] Search notes

__Notes__
- [x] New note
- [x] Delete note
- [ ] Open file and add to list (import)
- [ ] Save As file (export)
- [ ] Add tags to notes

__Editor__
- [x] Auto save on type (no need to Save/Open files)
- [x] Open where the user left off
- [ ] Insert Markdown menu bar item
- [ ] Insert image / Drag image from Finder
- [ ] Auto scroll Preview window to where editor window cursor is
- [x] Toggle Show/Hide Preview window
- [ ] Resize Preview window (draggable separator)
- [ ] GitHub checklist markdown
- [ ] Code editor keystrokes/shortcuts (Sublime/Atom)
- [ ] Copy to clipboard button on code snippets

__Sidebars__
- [x] Navigate notes in sidebar
- [x] Toggle show sidebar
- [ ] Sort notes list
- [ ] View notes by tags in sidebar

__Format__
- [ ] Use external Markdown CSS theme
- [ ] Edit editor Font (font-size, font-family, line-height)
- [ ] Use syntax highlighter themes

__Keyboard Shortcuts__
- [x] Ctrl+(Shift)+Tab to cycle notes
- [x] Toggle Show/Hide Preview window
- [x] Toggle Show/Hide sidebar
- [ ] Create/Delete note
- [ ] Edit current line/selected text format (e.g. change to Heading 1)
- [ ] Zoom in/Out
- [ ] Open Preferences window