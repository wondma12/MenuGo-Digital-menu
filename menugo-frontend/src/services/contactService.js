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
  return api.patch(`/public/contact/${id}/read`).then(res => res.data);
};

export const markMessageReplied = (id, reply) => {
  return api.post(`/public/contact/${id}/reply`, { reply }).then(res => res.data);
};

export const deleteMessage = (id) => {
  return api.delete(`/public/contact/${id}`).then(res => res.data);
};

export default {
  createPublicContact,
  getContactMessages,
  getAdminContactMessages,
  markMessageRead,
  markMessageReplied,
  deleteMessage,
};
