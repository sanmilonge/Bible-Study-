import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Bell, Clock, Users, Check, Edit, Trash2 } from 'lucide-react';
import { remindersAPI, friendsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const Reminders = ({ user }) => {
    const [reminders, setReminders] = useState([]);
    const [friends, setFriends] = useState([]);
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [reminderForm, setReminderForm] = useState({
        title: '',
        description: '',
        time: '',
        frequency: 'daily',
        monitoring_friends: []
    });
    const { toast } = useToast();

    const frequencies = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
    ];

    useEffect(() => {
        loadReminders();
        loadFriends();
    }, []);

    const loadReminders = async () => {
        try {
            const data = await remindersAPI.getReminders();
            setReminders(data);
        } catch (error) {
            console.error('Error loading reminders:', error);
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

    const handleSaveReminder = async (e) => {
        e.preventDefault();
        if (!reminderForm.title.trim() || !reminderForm.time) return;

        try {
            if (editingReminder) {
                await remindersAPI.updateReminder(editingReminder.id, reminderForm);
                toast({
                    title: "Reminder updated",
                    description: "Your reminder has been updated successfully",
                });
            } else {
                await remindersAPI.createReminder(reminderForm);
                toast({
                    title: "Reminder created",
                    description: "Your reminder has been created successfully",
                });
            }

            setReminderDialogOpen(false);
            setEditingReminder(null);
            setReminderForm({
                title: '',
                description: '',
                time: '',
                frequency: 'daily',
                monitoring_friends: []
            });
            await loadReminders();
        } catch (error) {
            console.error('Error saving reminder:', error);
            toast({
                title: "Error",
                description: "Failed to save reminder",
                variant: "destructive",
            });
        }
    };

    const handleDeleteReminder = async (reminderId) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) return;

        try {
            await remindersAPI.deleteReminder(reminderId);
            await loadReminders();
            toast({
                title: "Reminder deleted",
                description: "Your reminder has been deleted",
            });
        } catch (error) {
            console.error('Error deleting reminder:', error);
            toast({
                title: "Error",
                description: "Failed to delete reminder",
                variant: "destructive",
            });
        }
    };

    const handleCompleteReminder = async (reminderId) => {
        try {
            await remindersAPI.completeReminder(reminderId);
            await loadReminders();
            toast({
                title: "Reminder completed",
                description: "Great job staying consistent!",
            });
        } catch (error) {
            console.error('Error completing reminder:', error);
            toast({
                title: "Error",
                description: "Failed to complete reminder",
                variant: "destructive",
            });
        }
    };

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setReminderForm({
            title: reminder.title,
            description: reminder.description || '',
            time: reminder.time,
            frequency: reminder.frequency || 'daily',
            monitoring_friends: reminder.monitoring_friends || []
        });
        setReminderDialogOpen(true);
    };

    const toggleFriendMonitoring = (friendId) => {
        setReminderForm(prev => ({
            ...prev,
            monitoring_friends: prev.monitoring_friends.includes(friendId)
                ? prev.monitoring_friends.filter(id => id !== friendId)
                : [...prev.monitoring_friends, friendId]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Reminders</h1>
                    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Reminder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveReminder} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Reminder title"
                                        value={reminderForm.title}
                                        onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="What would you like to be reminded about?"
                                        value={reminderForm.description}
                                        onChange={(e) => setReminderForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="time">Time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={reminderForm.time}
                                            onChange={(e) => setReminderForm(prev => ({ ...prev, time: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="frequency">Frequency</Label>
                                        <Select value={reminderForm.frequency} onValueChange={(value) => setReminderForm(prev => ({ ...prev, frequency: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {frequencies.map(frequency => (
                                                    <SelectItem key={frequency.value} value={frequency.value}>
                                                        {frequency.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Friend Monitoring (Optional)</Label>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Select friends who can help keep you accountable
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.id}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${reminderForm.monitoring_friends.includes(friend.id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => toggleFriendMonitoring(friend.id)}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">{friend.name}</div>
                                                    <div className="text-sm text-gray-500">{friend.email}</div>
                                                </div>
                                                {reminderForm.monitoring_friends.includes(friend.id) && (
                                                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full">
                                    {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="px-4 mt-4">
                {reminders.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No reminders yet</h3>
                        <p className="text-gray-500 mb-4">Stay consistent with your Bible study routine</p>
                        <Button onClick={() => setReminderDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Reminder
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reminders.map((reminder) => (
                            <Card key={reminder.id} className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{reminder.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {reminder.time}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {frequencies.find(f => f.value === reminder.frequency)?.label || reminder.frequency}
                                                </Badge>
                                                {reminder.monitoring_friends?.length > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {reminder.monitoring_friends.length} friends
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!reminder.completed_today && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCompleteReminder(reminder.id)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditReminder(reminder)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteReminder(reminder.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {reminder.description && (
                                        <p className="text-gray-700 mb-3">{reminder.description}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={reminder.enabled}
                                                disabled // You can implement toggle functionality later
                                            />
                                            <span className="text-sm text-gray-600">
                                                {reminder.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>

                                        {reminder.completed_today && (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <Check className="w-3 h-3 mr-1" />
                                                Completed today
                                            </Badge>
                                        )}
                                    </div>

                                    {reminder.last_triggered && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Last completed: {new Date(reminder.last_triggered).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <BottomNavigation />
        </div>
    );
};

export default Reminders;