import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserPlus, Users, Check, X, Mail } from 'lucide-react';
import { friendsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const Friends = ({ user }) => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [friendEmail, setFriendEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadFriends();
        loadFriendRequests();
    }, []);

    const loadFriends = async () => {
        try {
            const data = await friendsAPI.getFriends();
            setFriends(data);
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    };

    const loadFriendRequests = async () => {
        try {
            const data = await friendsAPI.getFriendRequests();
            setFriendRequests(data);
        } catch (error) {
            console.error('Error loading friend requests:', error);
        }
    };

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();
        if (!friendEmail.trim()) return;

        setLoading(true);
        try {
            await friendsAPI.sendFriendRequest(friendEmail);
            setFriendEmail('');
            setInviteDialogOpen(false);

            toast({
                title: "Friend request sent",
                description: `Friend request sent to ${friendEmail}`,
            });
        } catch (error) {
            console.error('Error sending friend request:', error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to send friend request",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptFriendRequest = async (requestId) => {
        try {
            await friendsAPI.acceptFriendRequest(requestId);
            await loadFriends();
            await loadFriendRequests();

            toast({
                title: "Friend request accepted",
                description: "You are now friends!",
            });
        } catch (error) {
            console.error('Error accepting friend request:', error);
            toast({
                title: "Error",
                description: "Failed to accept friend request",
                variant: "destructive",
            });
        }
    };

    const handleRejectFriendRequest = async (requestId) => {
        try {
            await friendsAPI.rejectFriendRequest(requestId);
            await loadFriendRequests();

            toast({
                title: "Friend request rejected",
                description: "Friend request has been declined",
            });
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            toast({
                title: "Error",
                description: "Failed to reject friend request",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Friends</h1>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Friend
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Friend</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSendFriendRequest} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Friend's Email</label>
                                    <Input
                                        type="email"
                                        placeholder="Enter friend's email address"
                                        value={friendEmail}
                                        onChange={(e) => setFriendEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Friend Request'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="friends" className="px-4 mt-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="friends">
                        Friends ({friends.length})
                    </TabsTrigger>
                    <TabsTrigger value="requests">
                        Requests ({friendRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Friends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {friends.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No friends yet</h3>
                                    <p className="text-gray-500 mb-4">Start building your study community</p>
                                    <Button onClick={() => setInviteDialogOpen(true)}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Your First Friend
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {friends.map((friend) => (
                                        <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback>
                                                        {friend.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{friend.name}</div>
                                                    <div className="text-sm text-gray-500">{friend.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={friend.status === 'online' ? 'default' : 'secondary'}>
                                                    {friend.status}
                                                </Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Mail className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Friend Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {friendRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No pending requests</h3>
                                    <p className="text-gray-500">Friend requests will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {friendRequests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback>
                                                        {request.from.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{request.from.name}</div>
                                                    <div className="text-sm text-gray-500">{request.from.email}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(request.timestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAcceptFriendRequest(request.id)}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRejectFriendRequest(request.id)}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Decline
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <BottomNavigation />
        </div>
    );
};

export default Friends;
