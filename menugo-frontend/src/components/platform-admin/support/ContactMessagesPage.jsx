import React from 'react';
import { useQuery } from 'react-query';
import { getContactMessages } from '../../../services/contactService';

const ContactMessagesPage = () => {
  const { data, isLoading } = useQuery(['contactMessages'], () => getContactMessages({ page: 1, limit: 50 }));

  if (isLoading) return <div>Loading...</div>;

  const messages = (data && data.data) || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contact messages</h2>
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{m.name} — {m.email}</div>
                <div className="text-sm text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-2 text-slate-700">{m.subject && <div className="font-medium">{m.subject}</div>}{m.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactMessagesPage;
