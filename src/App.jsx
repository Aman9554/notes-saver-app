import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from './api';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (currentNote) {
        await updateNote(currentNote._id, noteData);
      } else {
        await createNote(noteData);
      }
      setCurrentNote(null);
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Export Notes to JSON
  const handleExport = () => {
    if (notes.length === 0) {
      alert("Export karne ke liye koi notes nahi hain!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `notes_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Notes from JSON
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          for (const item of importedData) {
            await createNote({
              title: item.title || "Untitled Note",
              content: item.content || "",
              category: item.category || "Personal",
              color: item.color || "#ffffff",
              pinned: item.pinned || false
            });
          }
          await loadNotes();
          alert("Notes successfully import ho gaye!");
        } else {
          alert("File format invalid hai. JSON array hona chahiye.");
        }
      } catch (err) {
        console.error(err);
        alert("JSON file parse karne me error aaya!");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Input reset karein
  };

  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Urgent'];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>Notes Saver</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={handleExport} 
            className="action-btn"
            style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', color: '#333', fontWeight: '500' }}
          >
            ⬇ Export JSON
          </button>

          <label 
            className="action-btn" 
            style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', color: '#333', fontWeight: '500', display: 'inline-block' }}
          >
            ⬆ Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>

          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px' }}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      <main>
        <NoteForm onSave={handleSaveNote} currentNote={currentNote} />

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="notes-grid">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="no-notes">No notes found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;