import api from './api';

export const createPublicContact = (payload) => {
  return api.post('/public/contact', payload).then(res => res.data);
};

export const getContactMessages = (params) => {
  return api.get('/public/contact', { params }).then(res => res.data);
};

// Admin / authenticated endpoints
export const getAdminContactMessages = (params) => {
  // Use the public contact endpoint for listing; admin /contact may not be available in some deployments
  return api.get('/public/contact', { params }).then(res => res.data);
};

export const markMessageRead = (id) => {
  // No-op: avoid calling admin endpoints that may not exist. UI should update optimistically.
  console.warn('markMessageRead: skipping server call (no admin endpoint)');
  return Promise.resolve({ ok: false });
};

export const markMessageReplied = (id) => {
  console.warn('markMessageReplied: skipping server call (no admin endpoint)');
  return Promise.resolve({ ok: false });
};

export const deleteMessage = (id) => {
  console.warn('deleteMessage: skipping server call (no admin endpoint)');
  return Promise.resolve({ ok: false });
};

export default {
  createPublicContact,
  getContactMessages,
  getAdminContactMessages,
  markMessageRead,
  markMessageReplied,
  deleteMessage,
};
