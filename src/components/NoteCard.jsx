import React from 'react';

function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  return (
    <div
      className="note-card"
      style={{ backgroundColor: note.color || '#ffffff' }}
    >
      <div>
        <div className="card-header">
          <div>
            <h3>{note.title}</h3>
            <span className="category-pill">{note.category || 'General'}</span>
          </div>
          <button
            className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
            onClick={() => onTogglePin(note.id)}
            title={note.isPinned ? 'Unpin' : 'Pin to top'}
          >
            📌
          </button>
        </div>
        <p>{note.content}</p>
      </div>

      <div className="card-footer">
        <span>{note.date}</span>
        <div className="card-actions">
          <button className="edit-btn" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(note.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;