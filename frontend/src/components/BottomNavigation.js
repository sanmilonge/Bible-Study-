import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Bell, MessageCircle, FileText, Settings } from 'lucide-react';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: BookOpen, label: 'Bible', path: '/bible' },
        { icon: Users, label: 'Friends', path: '/friends' },
        { icon: Bell, label: 'Reminders', path: '/reminders' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: FileText, label: 'Notes', path: '/notes' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around items-center py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center p-2 min-w-0 flex-1 ${isActive
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-xs truncate">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavigation;