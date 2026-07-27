import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail as FaEnvelope,
    Check as FaCheck,
    Trash2 as FaTrash,
    Reply as FaReply,
    Eye as FaEye,
    User as FaUser,
    CalendarDays as FaCalendarAlt,
    Mail as FaMailBulk,
    Inbox as FaInbox,
    Loader2 as FaSpinner,
    CheckCircle2 as FaCheckCircle,
    ReplyAll as FaReplyAll,
    Search as FaSearch,
    Filter as FaFilter,
    X as FaTimes,
    ArrowLeft as FaArrowLeft,
    ArrowRight as FaArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import contactService from '../../../services/contactService';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [summary, setSummary] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        filterMessages();
    }, [searchTerm, statusFilter, messages]);

    const getMessageStatus = (msg) => {
        if (!msg) return 'unread';
        if (msg.status) return msg.status;
        if (msg.replied_at || msg.reply_from_restaurant) return 'replied';
        if (msg.read_at) return 'read';
        return 'unread';
    };

    const buildSummary = (items) => {
        const counts = { total: items.length, unread: 0, read: 0, replied: 0 };
        items.forEach((msg) => {
            counts[getMessageStatus(msg)] += 1;
        });
        return counts;
    };

    const fetchMessages = async () => {
        try {
            const response = await contactService.getAdminContactMessages();
            const items = response?.data || [];
            setMessages(items);
            setFilteredMessages(items);
            setSummary(response?.meta?.summary || buildSummary(items));
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const filterMessages = () => {
        let filtered = [...messages];
        
        if (searchTerm) {
            filtered = filtered.filter(msg => 
                (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                ((msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
                (msg.message || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(msg => getMessageStatus(msg) === statusFilter);
        }
        
        setFilteredMessages(filtered);
    };

    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg);

        if (getMessageStatus(msg) === 'unread') {
            try {
                const updated = await contactService.markMessageRead(msg.id);
                const updatedMessage = updated?.data || msg;
                setMessages((current) => current.map((item) => (item.id === msg.id ? { ...item, ...updatedMessage } : item)));
                setSelectedMessage((current) => (current?.id === msg.id ? { ...current, ...updatedMessage } : current));
                setSummary((current) => ({
                    ...current,
                    unread: Math.max((current.unread || 0) - 1, 0),
                    read: (current.read || 0) + (getMessageStatus(updatedMessage) === 'read' ? 1 : 0),
                    replied: current.replied || 0,
                }));
            } catch (error) {
                console.error('Error marking message as read on open:', error);
            }
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const response = await contactService.markMessageRead(id);
            const updatedMessage = response?.data;
            toast.success('Message marked as read');
            if (updatedMessage) {
                setMessages((current) => current.map((item) => (item.id === id ? { ...item, ...updatedMessage } : item)));
                setFilteredMessages((current) => current.map((item) => (item.id === id ? { ...item, ...updatedMessage } : item)));
                setSelectedMessage((current) => (current?.id === id ? { ...current, ...updatedMessage } : current));
            }
            await fetchMessages();
        } catch (error) {
            console.error('Error marking message as read:', error);
            toast.error('Failed to update message');
        }
    };

    const handleMarkAsReplied = async (id) => {
        try {
            await contactService.markMessageReplied(id);
            toast.success('Message marked as replied');
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status: 'replied' });
            }
        } catch (error) {
            console.error('Error marking message as replied:', error);
            toast.error('Failed to update message');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            try {
                await contactService.deleteMessage(id);
                toast.success('Message deleted successfully');
                fetchMessages();
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
            } catch (error) {
                console.error('Error deleting message:', error);
                toast.error('Failed to delete message');
            }
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply message');
            return;
        }
        
        setSendingReply(true);
        try {
            await contactService.markMessageReplied(selectedMessage.id, replyText);
            toast.success(`Reply sent to ${selectedMessage.email}`);
            setReplyText('');
            await fetchMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'read': return <FaCheckCircle className="text-emerald-500 text-xs" />;
            case 'replied': return <FaReplyAll className="text-blue-500 text-xs" />;
            default: return <FaSpinner className="text-amber-500 text-xs animate-spin" />;
        }
    };

    const stats = {
        total: summary.total ?? messages.length,
        unread: summary.unread ?? buildSummary(messages).unread,
        read: summary.read ?? buildSummary(messages).read,
        replied: summary.replied ?? buildSummary(messages).replied
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-3 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-slate-500">Loading your messages...</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8 min-h-screen">
            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),transparent_32%)]" />
            <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6 overflow-visible">
                {/* Header */}
                <div className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-2">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Messages</h1>
                        <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
                            Manage and respond to your contact inquiries
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { 
                            title: 'Total Messages', 
                            value: stats.total, 
                            icon: <FaMailBulk />,
                            accent: 'border-l-orange-500',
                            iconBg: 'bg-orange-50',
                            iconColor: 'text-orange-500'
                        },
                        { 
                            title: 'Unread', 
                            value: stats.unread, 
                            icon: <FaEnvelope />,
                            accent: 'border-l-amber-500',
                            iconBg: 'bg-amber-50',
                            iconColor: 'text-amber-500'
                        },
                        { 
                            title: 'Read', 
                            value: stats.read, 
                            icon: <FaInbox />,
                            accent: 'border-l-emerald-500',
                            iconBg: 'bg-emerald-50',
                            iconColor: 'text-emerald-500'
                        },
                        { 
                            title: 'Replied', 
                            value: stats.replied, 
                            icon: <FaReply />,
                            accent: 'border-l-blue-500',
                            iconBg: 'bg-blue-50',
                            iconColor: 'text-blue-500'
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
                            whileHover={{ y: -3 }}
                            className={`relative overflow-hidden rounded-2xl border border-orange-100 border-l-4 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${stat.accent}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} text-lg flex-shrink-0`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <p className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search and filters */}
                <div className="relative z-20 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-orange-500/10 transition-all"
                            placeholder="Search by name, email, subject or message"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <div className="relative min-w-[160px]">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <select 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                        </select>
                    </div>

                    <button 
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Messages Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
                    {/* Messages List */}
                    <div className="rounded-3xl border border-orange-100 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                Inbox 
                                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {filteredMessages.length}
                                </span>
                            </h3>
                            <button 
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => fetchMessages()} 
                                title="Refresh"
                            >
                                <FaArrowLeft className="rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-orange-300">
                            {filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <FaInbox className="text-5xl text-slate-300 mb-3 opacity-50" />
                                    <p className="text-slate-500">No messages found.</p>
                                </div>
                            ) : (
                                filteredMessages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex gap-3 px-6 py-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-orange-50/50 ${
                                            selectedMessage?.id === msg.id ? 'bg-orange-50/70 border-l-4 border-l-orange-500' : ''
                                        }`}
                                        onClick={() => handleSelectMessage(msg)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-semibold text-lg">
                                                {(msg.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                {getStatusIcon(getMessageStatus(msg))}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                                    {msg.name || msg.email || 'Unknown'}
                                                </h4>
                                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium truncate">
                                                {msg.subject || 'No subject'}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate">
                                                {(msg.message || '').slice(0, 120)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Message Detail */}
                    <div className="rounded-3xl border border-orange-100 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
                        {selectedMessage ? (
                            <div className="p-6 flex flex-col gap-6 h-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
                                            {selectedMessage.subject || 'Message'}
                                        </h2>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                            getMessageStatus(selectedMessage) === 'unread'
                                                ? 'bg-amber-50 text-amber-600'
                                                : getMessageStatus(selectedMessage) === 'read'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {getMessageStatus(selectedMessage)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-medium"
                                            onClick={() => handleMarkAsRead(selectedMessage.id)}
                                        >
                                            <FaCheck /> Mark Read
                                        </button>
                                        <button 
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-medium"
                                            onClick={() => handleSendReply(selectedMessage.id)} 
                                            disabled={!selectedMessage}
                                        >
                                            <FaReply /> Reply
                                        </button>
                                        <button 
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-medium"
                                            onClick={() => handleDelete(selectedMessage.id)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/80">
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                        <FaUser className="text-orange-500" />
                                        <strong className="text-slate-900">{selectedMessage.name || 'Unknown'}</strong>
                                        <span className="text-slate-400">{selectedMessage.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                        <FaCalendarAlt className="text-orange-500" />
                                        {new Date(selectedMessage.createdAt || selectedMessage.created_at || Date.now()).toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Message</h3>
                                    <div className="bg-slate-50/80 p-4 rounded-xl max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-orange-300">
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Reply</h3>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 resize-vertical focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-orange-500/10 transition-all min-h-[100px] font-inherit"
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)} 
                                        placeholder="Write your reply here..."
                                    />
                                    <div className="mt-3">
                                        <button 
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-lg shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                            onClick={handleSendReply} 
                                            disabled={sendingReply}
                                        >
                                            {sendingReply ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaReply />
                                                    Send Reply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8">
                                <FaInbox className="text-6xl text-slate-300 mb-4 opacity-30" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No message selected</h3>
                                <p className="text-sm text-slate-500">Select a message from the left to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Messages;