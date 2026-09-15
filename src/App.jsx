import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from './api';

const CATEGORIES = ['All', 'Work', 'Personal', 'Ideas', 'Urgent'];
const COLORS = ['#ffffff', '#fef3c7', '#dcfce7', '#e0e7ff', '#fce7f3'];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('#ffffff');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 1. Fetch all notes from MongoDB Atlas on page load
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Create or Update a note
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    try {
      if (editingId) {
        const updated = await updateNote(editingId, { title, content, category, color });
        setNotes((prev) => prev.map((n) => (n._id === editingId ? updated : n)));
        setEditingId(null);
      } else {
        const created = await createNote({ title, content, category, color });
        setNotes((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  // 3. Delete a note
  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // 4. Toggle Pin
  const handleTogglePin = async (note) => {
    try {
      const updated = await updateNote(note._id, { isPinned: !note.isPinned });
      setNotes((prev) =>
        prev
          .map((n) => (n._id === note._id ? updated : n))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // 5. Export notes to JSON file
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

  // 6. Import notes from JSON file
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
              title: item.title || "Untitled",
              content: item.content || "",
              category: item.category || "Personal",
              color: item.color || "#ffffff"
            });
          }
          await loadNotes();
          alert("Notes successfully import ho gaye!");
        } else {
          alert("Invalid file! JSON array hona chahiye.");
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("JSON file read karne me error aaya.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // Edit setup
  const handleStartEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content || '');
    setCategory(note.category || 'Personal');
    setColor(note.color || '#ffffff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('Personal');
    setColor('#ffffff');
    setEditingId(null);
  };

  // Filter & Search
  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: darkMode ? '#111827' : '#f3f4f6', color: darkMode ? '#f9fafb' : '#111827', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Notes Saver</h1>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleExport}
              style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#fff' : '#000', fontWeight: '500' }}
            >
              ⬇ Export
            </button>

            <label
              style={{ padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', backgroundColor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#fff' : '#000', fontWeight: '500', display: 'inline-block' }}
            >
              ⬆ Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#fff' : '#000' }}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Note Editor Form */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px', fontWeight: '600', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Write a note..."
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px' }}>Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '6px', borderRadius: '6px' }}>
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px' }}>Color:</label>
              {COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c, border: color === c ? '2px solid #2563eb' : '1px solid #9ca3af', cursor: 'pointer' }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {editingId && (
                <button type="button" onClick={resetForm} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: 'transparent', cursor: 'pointer', color: darkMode ? '#fff' : '#000' }}>
                  Cancel
                </button>
              )}
              <button type="submit" style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </form>

        {/* Search & Categories Filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#2563eb' : darkMode ? '#374151' : '#e5e7eb', color: selectedCategory === cat ? '#fff' : darkMode ? '#f9fafb' : '#111827' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading notes from MongoDB Atlas...</p>
        ) : filteredNotes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No notes found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                style={{ backgroundColor: note.color || '#fff', color: '#111827', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{note.title}</h3>
                    <button
                      onClick={() => handleTogglePin(note)}
                      title="Pin note"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                    >
                      {note.isPinned ? '📌' : '📍'}
                    </button>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', whiteSpace: 'pre-wrap', color: '#374151' }}>{note.content}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.08)', padding: '2px 8px', borderRadius: '12px' }}>{note.category}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleStartEdit(note)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(note._id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}