import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Edit, Trash2, Search, Tag, FileText, Book } from 'lucide-react';
import { notesAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const Notes = ({ user }) => {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        tags: [],
        scripture: '',
        category: 'personal'
    });
    const [newTag, setNewTag] = useState('');
    const { toast } = useToast();

    const categories = [
        { value: 'all', label: 'All Notes' },
        { value: 'personal', label: 'Personal' },
        { value: 'study', label: 'Study' },
        { value: 'sermon', label: 'Sermon' },
        { value: 'prayer', label: 'Prayer' },
        { value: 'devotional', label: 'Devotional' }
    ];

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await notesAPI.getNotes();
            setNotes(data);
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!noteForm.title.trim() || !noteForm.content.trim()) return;

        try {
            if (editingNote) {
                await notesAPI.updateNote(editingNote.id, noteForm);
                toast({
                    title: "Note updated",
                    description: "Your note has been updated successfully",
                });
            } else {
                await notesAPI.createNote(noteForm);
                toast({
                    title: "Note created",
                    description: "Your note has been created successfully",
                });
            }

            setNoteDialogOpen(false);
            setEditingNote(null);
            setNoteForm({
                title: '',
                content: '',
                tags: [],
                scripture: '',
                category: 'personal'
            });
            await loadNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            toast({
                title: "Error",
                description: "Failed to save note",
                variant: "destructive",
            });
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await notesAPI.deleteNote(noteId);
            await loadNotes();
            toast({
                title: "Note deleted",
                description: "Your note has been deleted",
            });
        } catch (error) {
            console.error('Error deleting note:', error);
            toast({
                title: "Error",
                description: "Failed to delete note",
                variant: "destructive",
            });
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setNoteForm({
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            scripture: note.scripture || '',
            category: note.category || 'personal'
        });
        setNoteDialogOpen(true);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !noteForm.tags.includes(newTag.trim())) {
            setNoteForm(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setNoteForm(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
                    <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingNote ? 'Edit Note' : 'Create New Note'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveNote} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Note title"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Write your note here..."
                                        value={noteForm.content}
                                        onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="scripture">Scripture Reference (Optional)</Label>
                                    <Input
                                        id="scripture"
                                        placeholder="e.g., John 3:16, Romans 8:28"
                                        value={noteForm.scripture}
                                        onChange={(e) => setNoteForm(prev => ({ ...prev, scripture: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={noteForm.category} onValueChange={(value) => setNoteForm(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.slice(1).map(category => (
                                                <SelectItem key={category.value} value={category.value}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {noteForm.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="cursor-pointer">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-2 hover:bg-gray-300 rounded-full"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a tag"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        />
                                        <Button type="button" onClick={handleAddTag} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full">
                                    {editingNote ? 'Update Note' : 'Create Note'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(category => (
                                <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="px-4 mt-4">
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                            {searchQuery || selectedCategory !== 'all' ? 'No notes found' : 'No notes yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery || selectedCategory !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'Start writing your study notes and insights'
                            }
                        </p>
                        {!searchQuery && selectedCategory === 'all' && (
                            <Button onClick={() => setNoteDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Note
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredNotes.map((note) => (
                            <Card key={note.id} className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{note.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {categories.find(c => c.value === note.category)?.label || note.category}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditNote(note)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteNote(note.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-gray-700 mb-3 line-clamp-3">{note.content}</p>

                                    {note.scripture && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                            <Book className="w-4 h-4" />
                                            <span>{note.scripture}</span>
                                        </div>
                                    )}

                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {note.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
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

export default Notes;