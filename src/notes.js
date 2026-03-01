document.addEventListener("DOMContentLoaded", () => {

  const noteList = document.getElementById('noteList')
  const editor = document.getElementById('editor')
  const noteTitle = document.getElementById('noteTitle')
  const saveBtn = document.getElementById('saveBtn')
  const newNoteBtn = document.getElementById('newNoteBtn')

  let currentFile = null

  async function refreshList() {
    const files = await window.notesAPI.list()
    noteList.innerHTML = ''

    files.forEach(file => {
      const li = document.createElement('li')
      li.textContent = file
      li.onclick = () => loadNote(file)
      noteList.appendChild(li)
    })
  }

  async function loadNote(file) {
    const content = await window.notesAPI.load(file)
    currentFile = file
    noteTitle.value = file.replace('.txt', '')
    editor.value = content
  }

  async function saveNote() {
    if (!noteTitle.value.trim()) return

    const filename = noteTitle.value.trim() + '.txt'
    currentFile = filename

    await window.notesAPI.save(filename, editor.value)
    await refreshList()
  }

  async function createNote() {
    const name = prompt('Note name:')
    if (!name) return

    const filename = name.trim() + '.txt'
    await window.notesAPI.create(filename)
    await refreshList()
    loadNote(filename)
  }

  saveBtn.onclick = saveNote
  newNoteBtn.onclick = createNote

  refreshList()
})
// Random Comment