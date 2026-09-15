import React, { useState, useEffect } from 'react';

const COLORS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Yellow', value: '#fef3c7' },
  { label: 'Green', value: '#dcfce7' },
  { label: 'Blue', value: '#e0f2fe' },
  { label: 'Purple', value: '#f3e8ff' },
  { label: 'Pink', value: '#ffe4e6' },
];

const CATEGORIES = ['General', 'Work', 'Study', 'Personal'];

function NoteForm({ onSaveNote, editingNote, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setColor(editingNote.color || '#ffffff');
      setCategory(editingNote.category || 'General');
    } else {
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setCategory('General');
    }
  }, [editingNote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onSaveNote({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      color,
      category,
    });

    setTitle('');
    setContent('');
    setColor('#ffffff');
    setCategory('General');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Take a note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="char-counter">
        {wordCount} words | {charCount} chars
      </div>

      <div className="form-controls-row">
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="color-picker-row">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`color-dot ${color === c.value ? 'active' : ''}`}
              style={{
                backgroundColor: c.value,
                border: c.value === '#ffffff' ? '1px solid #ccc' : 'none',
              }}
              onClick={() => setColor(c.value)}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="form-buttons">
        <button type="submit">
          {editingNote ? 'Update Note' : 'Save Note'}
        </button>
        {editingNote && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default NoteForm;