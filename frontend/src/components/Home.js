import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Users, Bell, MessageCircle, FileText, Settings } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

const Home = ({ user }) => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Bible Reader',
            description: 'Read, highlight, and study scripture',
            icon: BookOpen,
            color: 'bg-blue-500',
            path: '/bible'
        },
        {
            title: 'Friends',
            description: 'Connect with fellow believers',
            icon: Users,
            color: 'bg-green-500',
            path: '/friends'
        },
        {
            title: 'Reminders',
            description: 'Stay consistent in your study',
            icon: Bell,
            color: 'bg-yellow-500',
            path: '/reminders'
        },
        {
            title: 'Chat',
            description: 'Message your study partners',
            icon: MessageCircle,
            color: 'bg-purple-500',
            path: '/chat'
        },
        {
            title: 'Notes',
            description: 'Keep track of insights',
            icon: FileText,
            color: 'bg-indigo-500',
            path: '/notes'
        },
        {
            title: 'Settings',
            description: 'Customize your experience',
            icon: Settings,
            color: 'bg-gray-500',
            path: '/settings'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div
                    className="h-64 bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1511988617509-a57c8a288659?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHl8ZW58MHx8fGJsdWV8MTc1MjQyMzA0OHww&ixlib=rb-4.1.0&q=85')`
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                            <p className="text-lg opacity-90">Continue your spiritual journey</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="px-4 -mt-8 relative z-10">
                <Card className="shadow-lg">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">7</div>
                                <div className="text-sm text-gray-600">Days streak</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">12</div>
                                <div className="text-sm text-gray-600">Friends</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">45</div>
                                <div className="text-sm text-gray-600">Notes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Verse */}
            <div className="px-4 mt-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Verse of the Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <blockquote className="text-gray-700 italic mb-2">
                            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."
                        </blockquote>
                        <cite className="text-sm text-gray-500">— Jeremiah 29:11</cite>
                    </CardContent>
                </Card>
            </div>

            {/* Features Grid */}
            <div className="px-4 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Features</h2>
                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => navigate(feature.path)}
                        >
                            <CardContent className="p-4">
                                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="px-4 mt-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Read Psalm 23</div>
                                    <div className="text-xs text-gray-500">2 hours ago</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Sarah joined your study group</div>
                                    <div className="text-xs text-gray-500">1 day ago</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Added note on faith</div>
                                    <div className="text-xs text-gray-500">2 days ago</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <BottomNavigation />
        </div>
    );
};

export default Home;
