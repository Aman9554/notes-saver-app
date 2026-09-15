import axios from 'axios';

const API_URL = 'https://notes-saver-app-bcwa.onrender.com/api/notes';

export const fetchNotes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await axios.post(API_URL, noteData);
  return response.data;
};

export const updateNote = async (id, updatedData) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};