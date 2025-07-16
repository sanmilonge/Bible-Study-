import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Send, Plus, Users, MessageCircle } from 'lucide-react';
import { chatAPI, friendsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const Chat = ({ user }) => {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [friends, setFriends] = useState([]);
    const [createChatOpen, setCreateChatOpen] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [chatName, setChatName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadChats();
        loadFriends();
    }, []);

    useEffect(() => {
        if (currentChat) {
            loadMessages(currentChat.id);
        }
    }, [currentChat]);

    const loadChats = async () => {
        try {
            const data = await chatAPI.getChats();
            setChats(data);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const loadFriends = async () => {
        try {
            const data = await friendsAPI.getFriends();
            setFriends(data);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const data = await chatAPI.getChatMessages(chatId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        try {
            await chatAPI.sendMessage(currentChat.id, newMessage);
            setNewMessage('');
            await loadMessages(currentChat.id);
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
        }
    };

    const handleCreateChat = async () => {
        if (!chatName.trim() || selectedFriends.length === 0) return;

        try {
            const chatData = {
                name: chatName,
                type: selectedFriends.length === 1 ? 'direct' : 'group',
                participants: selectedFriends
            };

            await chatAPI.createChat(chatData);
            setCreateChatOpen(false);
            setChatName('');
            setSelectedFriends([]);
            await loadChats();

            toast({
                title: "Chat created",
                description: "New chat created successfully",
            });
        } catch (error) {
            console.error('Error creating chat:', error);
            toast({
                title: "Error",
                description: "Failed to create chat",
                variant: "destructive",
            });
        }
    };

    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                    <Dialog open={createChatOpen} onOpenChange={setCreateChatOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Chat
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Chat</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Chat Name</label>
                                    <Input
                                        placeholder="Enter chat name"
                                        value={chatName}
                                        onChange={(e) => setChatName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Select Friends</label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.id}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedFriends.includes(friend.id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => toggleFriendSelection(friend.id)}
                                            >
                                                <Avatar className="w-8 h-8 mr-3">
                                                    <AvatarFallback>
                                                        {friend.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="font-medium">{friend.name}</div>
                                                    <div className="text-sm text-gray-500">{friend.email}</div>
                                                </div>
                                                {selectedFriends.includes(friend.id) && (
                                                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCreateChat}
                                    className="w-full"
                                    disabled={!chatName.trim() || selectedFriends.length === 0}
                                >
                                    Create Chat
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex h-[calc(100vh-140px)]">
                {/* Chat List */}
                <div className="w-1/3 border-r border-gray-200 bg-white">
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            {chats.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No chats yet</p>
                                    <p className="text-sm text-gray-400">Start a conversation with your friends</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {chats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${currentChat?.id === chat.id
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            onClick={() => setCurrentChat(chat)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarFallback>
                                                        {chat.type === 'group' ? (
                                                            <Users className="w-5 h-5" />
                                                        ) : (
                                                            chat.name.split(' ').map(n => n[0]).join('')
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{chat.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {chat.type === 'group' ? `${chat.participants.length} members` : 'Direct message'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 flex flex-col">
                    {currentChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-4">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback>
                                            {currentChat.type === 'group' ? (
                                                <Users className="w-5 h-5" />
                                            ) : (
                                                currentChat.name.split(' ').map(n => n[0]).join('')
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{currentChat.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {currentChat.type === 'group' ? `${currentChat.participants.length} members` : 'Active now'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_id === user.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                                }`}>
                                                {message.sender_id !== user.id && (
                                                    <div className="text-xs font-medium mb-1 opacity-70">
                                                        {message.sender_name}
                                                    </div>
                                                )}
                                                <div>{message.content}</div>
                                                <div className={`text-xs mt-1 opacity-70 ${message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                    {new Date(message.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                <form onSubmit={handleSendMessage} className="flex space-x-2">
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={!newMessage.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a chat</h3>
                                <p className="text-gray-500">Choose a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BottomNavigation />
        </div>
    );
};

export default Chat;