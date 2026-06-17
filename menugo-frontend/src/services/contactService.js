import api from './api';

export const createPublicContact = (payload) => {
  return api.post('/public/contact', payload).then(res => res.data);
};

export const getContactMessages = (params) => {
  return api.get('/public/contact', { params }).then(res => res.data);
};

export default {
  createPublicContact,
  getContactMessages,
};
