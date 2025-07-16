import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
    User,
    Bell,
    Moon,
    Globe,
    Shield,
    HelpCircle,
    LogOut,
    Camera,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const Settings = ({ user, onLogout }) => {
    const [notifications, setNotifications] = useState({
        reminders: true,
        friends: true,
        messages: true,
        updates: false
    });
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const { toast } = useToast();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            onLogout();
        }
    };

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        toast({
            title: "Settings updated",
            description: "Your notification preferences have been saved",
        });
    };

    const handleProfileUpdate = () => {
        toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            </div>

            <div className="px-4 mt-4 space-y-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Avatar className="w-20 h-20">
                                    <AvatarFallback className="text-lg">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                                >
                                    <Camera className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-lg">{user.name}</h3>
                                <p className="text-gray-500">{user.email}</p>
                                <Badge variant="outline" className="mt-1">
                                    Member since {new Date(user.created_at).toLocaleDateString()}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={user.name} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={user.email} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input id="phone" type="tel" placeholder="Your phone number" />
                            </div>
                        </div>

                        <Button onClick={handleProfileUpdate} className="w-full">
                            Update Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="reminders">Study Reminders</Label>
                                <p className="text-sm text-gray-500">Get notified about your study schedule</p>
                            </div>
                            <Switch
                                id="reminders"
                                checked={notifications.reminders}
                                onCheckedChange={() => handleNotificationToggle('reminders')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="friends">Friend Activity</Label>
                                <p className="text-sm text-gray-500">Friend requests and updates</p>
                            </div>
                            <Switch
                                id="friends"
                                checked={notifications.friends}
                                onCheckedChange={() => handleNotificationToggle('friends')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="messages">Messages</Label>
                                <p className="text-sm text-gray-500">New messages and chat notifications</p>
                            </div>
                            <Switch
                                id="messages"
                                checked={notifications.messages}
                                onCheckedChange={() => handleNotificationToggle('messages')}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="updates">App Updates</Label>
                                <p className="text-sm text-gray-500">New features and announcements</p>
                            </div>
                            <Switch
                                id="updates"
                                checked={notifications.updates}
                                onCheckedChange={() => handleNotificationToggle('updates')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="darkMode">Dark Mode</Label>
                                <p className="text-sm text-gray-500">Toggle dark theme</p>
                            </div>
                            <Switch
                                id="darkMode"
                                checked={darkMode}
                                onCheckedChange={setDarkMode}
                            />
                        </div>

                        <Separator />

                        <div>
                            <Label htmlFor="language">Language</Label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>

                        <Separator />

                        <div>
                            <Label>Bible Version</Label>
                            <select
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                                defaultValue="kjv"
                            >
                                <option value="kjv">King James Version (KJV)</option>
                                <option value="niv">New International Version (NIV)</option>
                                <option value="esv">English Standard Version (ESV)</option>
                                <option value="nlt">New Living Translation (NLT)</option>
                                <option value="nkjv">New King James Version (NKJV)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Privacy & Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <Shield className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Mail className="w-4 h-4 mr-2" />
                            Privacy Settings
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Calendar className="w-4 h-4 mr-2" />
                            Data Export
                        </Button>
                    </CardContent>
                </Card>

                {/* Support */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Help Center
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Support
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Phone className="w-4 h-4 mr-2" />
                            Report a Problem
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                    <CardContent className="pt-6">
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Bible Study App v1.0.0
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <BottomNavigation />
        </div>
    );
};

export default Settings;