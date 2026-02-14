import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import chatService from "../services/chatService";
import { useSocket } from "../hooks/socketContext";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";
import {
    HiOutlineArrowLeft,
    HiOutlinePaperAirplane,
    HiOutlineChatBubbleLeftRight,
    HiOutlineUser,
} from "react-icons/hi2";

const ChatList = ({ user, isLandlord }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await chatService.getMyChats();
                setChats(res?.data?.chats || []);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const timeAgo = (dateStr) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "now";
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `${days}d`;
    };

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Chats</h2>
                <p className="text-sm text-slate-500 mt-1">Your conversations</p>
            </div>

            {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/5 mb-4">
                        <HiOutlineChatBubbleLeftRight className="w-12 h-12 text-slate-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-400">No Conversations Yet</h3>
                    <p className="text-sm text-slate-600 mt-1">
                        {isLandlord
                            ? "Go to Renters page and click Chat to start a conversation"
                            : "You can chat with your landlord from your room details"}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {chats.map((chat) => (
                        <button
                            key={chat._id}
                            onClick={() => navigate(`/chat/${chat.otherUser?._id}`)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/60 hover:border-violet-500/20 transition-all text-left group"
                        >
                            {chat.otherUser?.image ? (
                                <img
                                    src={chat.otherUser.image}
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold ring-2 ring-white/10">
                                    {chat.otherUser?.firstName?.[0] || "?"}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white truncate">
                                        {chat.otherUser?.firstName} {chat.otherUser?.lastName}
                                    </h3>
                                    <span className="text-[11px] text-slate-500 whitespace-nowrap ml-2">
                                        {timeAgo(chat.lastMessage?.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-xs text-slate-500 truncate">
                                        {chat.lastMessage?.content || "No messages yet"}
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isLandlord = user?.roles?.isLandlord;
    const isRenter = user?.roles?.isRenter;

    const fetchChat = async (showLoader = false) => {
        try {
            if (showLoader) setLoading(true);
            let res;
            if (isLandlord) {
                res = await chatService.getChatWithRenter(userId);
            } else if (isRenter) {
                res = await chatService.getChatWithLandlord(userId);
            }
            if (res?.data) {
                setChatInfo(res.data.chat);
                setMessages(res.data.messages || []);
                // Join socket room & mark messages as read
                if (socket && res.data.chat?._id) {
                    socket.emit("join-chat", res.data.chat._id);
                    socket.emit("mark-read", { chatId: res.data.chat._id });
                }
            }
        } catch (err) {
            if (showLoader) toast.error(err.response?.data?.message || "Failed to load chat");
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchChat(true);
        }
        return () => {
            if (socket && chatInfo?._id) {
                socket.emit("leave-chat", chatInfo._id);
            }
        };
    }, [userId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Socket event listeners
    useEffect(() => {
        if (!socket || !chatInfo?._id) return;

        const handleNewMessage = (data) => {
            if (data.chatId === chatInfo._id) {
                // Skip if this is our own message (already added optimistically)
                if (data.message.sender === user?._id || data.message.sender?._id === user?._id) {
                    // Update the optimistic message with server data (real _id, etc.)
                    setMessages((prev) => {
                        const lastIdx = prev.length - 1;
                        if (lastIdx >= 0 && prev[lastIdx]._optimistic) {
                            const updated = [...prev];
                            updated[lastIdx] = data.message;
                            return updated;
                        }
                        return prev;
                    });
                } else {
                    setMessages((prev) => [...prev, data.message]);
                }
                // Auto mark as read since we're viewing this chat
                socket.emit("mark-read", { chatId: chatInfo._id });
            }
        };

        const handleTyping = (data) => {
            if (data.chatId === chatInfo._id && data.userId !== user?._id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.chatId === chatInfo._id && data.userId !== user?._id) {
                setIsTyping(false);
            }
        };

        const handleMessagesRead = (data) => {
            if (data.chatId === chatInfo._id) {
                setMessages((prev) =>
                    prev.map((msg) => ({ ...msg, isRead: true }))
                );
            }
        };

        socket.on("new-message", handleNewMessage);
        socket.on("user-typing", handleTyping);
        socket.on("user-stop-typing", handleStopTyping);
        socket.on("messages-read", handleMessagesRead);

        return () => {
            socket.off("new-message", handleNewMessage);
            socket.off("user-typing", handleTyping);
            socket.off("user-stop-typing", handleStopTyping);
            socket.off("messages-read", handleMessagesRead);
        };
    }, [socket, chatInfo?._id, user?._id]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (socket && chatInfo?._id) {
            socket.emit("typing", { chatId: chatInfo._id });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop-typing", { chatId: chatInfo._id });
            }, 1500);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();

        // Optimistic message — show immediately
        const optimisticMsg = {
            _id: `temp-${Date.now()}`,
            _optimistic: true,
            sender: user?._id,
            content,
            messageType: "text",
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setNewMessage("");

        // Use socket for real-time if available
        if (socket?.connected && chatInfo?._id) {
            socket.emit("send-message", {
                chatId: chatInfo._id,
                content,
                messageType: "text",
            });
            socket.emit("stop-typing", { chatId: chatInfo._id });
            return;
        }

        // Fallback to HTTP
        try {
            setSending(true);
            if (isLandlord) {
                await chatService.sendMessageToRenter(userId, content);
            } else if (isRenter) {
                await chatService.sendMessageToLandlord(userId, content);
            }
            // Refresh to get the real message from server
            await fetchChat(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send message");
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return "Today";
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    // No userId selected — show conversation list
    if (!userId) {
        return <ChatList user={user} isLandlord={isLandlord} />;
    }

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
            {/* Header */}
            {(() => {
                const otherUser = chatInfo?.participants?.find(
                    (p) => p._id !== user?._id && p._id?.toString() !== user?._id
                );
                const displayName = otherUser
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : (isLandlord ? "Renter" : "Landlord");
                return (
                    <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                        <button onClick={() => navigate("/chat")} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            {otherUser?.image ? (
                                <img src={otherUser.image} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/10">
                                    {otherUser?.firstName?.[0] || <HiOutlineUser className="w-5 h-5" />}
                                </div>
                            )}
                            <div>
                                <h2 className="text-base font-semibold text-white">{displayName}</h2>
                                <p className="text-xs text-emerald-400">Online</p>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => {
                            const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
                            const showDate = i === 0 || formatDate(msg.createdAt) !== formatDate(messages[i - 1]?.createdAt);
                            return (
                                <div key={msg._id || i}>
                                    {showDate && (
                                        <div className="flex items-center justify-center my-4">
                                            <span className="px-3 py-1 rounded-full bg-slate-800/50 text-xs text-slate-500 border border-white/5">
                                                {formatDate(msg.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md"
                                            : "bg-slate-700/50 text-slate-200 border border-white/5 rounded-bl-md"
                                            }`}>
                                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? "text-violet-200/60 justify-end" : "text-slate-500"}`}>
                                                {formatTime(msg.createdAt)}
                                                {isMine && (
                                                    <span className={msg.isRead ? "text-sky-300" : "text-violet-200/40"}>
                                                        {msg.isRead ? "✓✓" : "✓"}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2.5 rounded-2xl bg-slate-700/50 border border-white/5 rounded-bl-md">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-3 pt-4 border-t border-white/5">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                />
                <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
                >
                    <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
