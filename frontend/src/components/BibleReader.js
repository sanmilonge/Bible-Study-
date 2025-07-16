import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
    BookOpen,
    Highlighter,
    Copy,
    Share2,
    Search,
    Bookmark,
    MessageCircle,
    Bot,
    Lightbulb,
    Send,
    Loader2
} from 'lucide-react';
import { mockBibleData } from '../mock/bibleMock';
import { bibleAPI, chatbotAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import BottomNavigation from './BottomNavigation';

const BibleReader = ({ user }) => {
    const [currentBook, setCurrentBook] = useState('Genesis');
    const [currentChapter, setCurrentChapter] = useState(1);
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatbotMessage, setChatbotMessage] = useState('');
    const [chatbotResponse, setChatbotResponse] = useState('');
    const [chatbotLoading, setChatbotLoading] = useState(false);
    const [suggestedVerses, setSuggestedVerses] = useState([]);
    const { toast } = useToast();

    const bibleBooks = Object.keys(mockBibleData);
    const chapters = mockBibleData[currentBook]?.chapters || [];
    const verses = chapters[currentChapter - 1]?.verses || [];

    useEffect(() => {
        loadHighlights();
        loadBookmarks();
    }, []);

    const loadHighlights = async () => {
        try {
            const data = await bibleAPI.getHighlights();
            setHighlights(data);
        } catch (error) {
            console.error('Error loading highlights:', error);
        }
    };

    const loadBookmarks = async () => {
        try {
            const data = await bibleAPI.getBookmarks();
            setBookmarks(data);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const handleHighlight = async (verseId, color = 'yellow') => {
        try {
            const highlightData = {
                book: currentBook,
                chapter: currentChapter,
                verse: verseId,
                color
            };

            await bibleAPI.createHighlight(highlightData);
            await loadHighlights();

            toast({
                title: "Verse highlighted",
                description: `${currentBook} ${currentChapter}:${verseId} highlighted`,
            });
        } catch (error) {
            console.error('Error creating highlight:', error);
            toast({
                title: "Error",
                description: "Failed to highlight verse",
                variant: "destructive",
            });
        }
    };

    const handleBookmark = async (verseId) => {
        try {
            const bookmarkData = {
                book: currentBook,
                chapter: currentChapter,
                verse: verseId
            };

            await bibleAPI.createBookmark(bookmarkData);
            await loadBookmarks();

            toast({
                title: "Verse bookmarked",
                description: `${currentBook} ${currentChapter}:${verseId} bookmarked`,
            });
        } catch (error) {
            console.error('Error creating bookmark:', error);
            toast({
                title: "Error",
                description: "Failed to bookmark verse",
                variant: "destructive",
            });
        }
    };

    const handleCopy = (verseText, verseId) => {
        const textToCopy = `"${verseText}" - ${currentBook} ${currentChapter}:${verseId}`;
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: "Copied to clipboard",
            description: "Verse copied successfully",
        });
    };

    const handleShare = (verseText, verseId) => {
        const textToShare = `"${verseText}" - ${currentBook} ${currentChapter}:${verseId}`;

        if (navigator.share) {
            navigator.share({
                title: 'Bible Verse',
                text: textToShare,
            });
        } else {
            navigator.clipboard.writeText(textToShare);
            toast({
                title: "Copied to clipboard",
                description: "Verse ready to share",
            });
        }
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        const results = [];
        Object.entries(mockBibleData).forEach(([book, bookData]) => {
            bookData.chapters.forEach((chapter, chapterIndex) => {
                chapter.verses.forEach((verse, verseIndex) => {
                    if (verse.text.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push({
                            book,
                            chapter: chapterIndex + 1,
                            verse: verseIndex + 1,
                            text: verse.text
                        });
                    }
                });
            });
        });

        setSearchResults(results.slice(0, 20));
    };

    const handleChatbotAsk = async () => {
        if (!chatbotMessage.trim()) return;

        setChatbotLoading(true);
        try {
            const response = await chatbotAPI.askQuestion(chatbotMessage);
            setChatbotResponse(response.response);
            setSuggestedVerses(response.suggested_verses || []);

            toast({
                title: "Bible study assistant",
                description: "Got response from Bible study assistant",
            });
        } catch (error) {
            console.error('Error asking chatbot:', error);
            setChatbotResponse("Sorry, I'm having trouble connecting right now. Please try again later.");
            setSuggestedVerses([]);
        } finally {
            setChatbotLoading(false);
        }
    };

    const handleExplainVerse = async (verseText, verseId) => {
        setChatbotOpen(true);
        setChatbotLoading(true);
        setChatbotMessage(`Please explain ${currentBook} ${currentChapter}:${verseId}`);

        try {
            const response = await chatbotAPI.explainVerse(
                currentBook,
                currentChapter,
                verseId,
                verseText
            );
            setChatbotResponse(response.response);
            setSuggestedVerses(response.suggested_verses || []);
        } catch (error) {
            console.error('Error explaining verse:', error);
            setChatbotResponse("Sorry, I'm having trouble explaining this verse right now. Please try again later.");
            setSuggestedVerses([]);
        } finally {
            setChatbotLoading(false);
        }
    };

    const getVerseHighlight = (verseId) => {
        const highlight = highlights.find(h =>
            h.book === currentBook && h.chapter === currentChapter && h.verse === verseId
        );
        return highlight ? highlight.color : null;
    };

    const isBookmarked = (verseId) => {
        return bookmarks.some(b =>
            b.book === currentBook && b.chapter === currentChapter && b.verse === verseId
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Bible Reader</h1>
                    <div className="flex items-center gap-2">
                        <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Bot className="w-4 h-4 mr-2" />
                                    AI Assistant
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-blue-600" />
                                        Bible Study Assistant
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Textarea
                                            placeholder="Ask me about any Bible verse, concept, or spiritual question..."
                                            value={chatbotMessage}
                                            onChange={(e) => setChatbotMessage(e.target.value)}
                                            className="flex-1"
                                            rows={3}
                                        />
                                        <Button
                                            onClick={handleChatbotAsk}
                                            disabled={chatbotLoading || !chatbotMessage.trim()}
                                            className="self-end"
                                        >
                                            {chatbotLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {chatbotResponse && (
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bot className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-blue-800">Bible Study Assistant</span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{chatbotResponse}</p>

                                            {suggestedVerses.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Suggested verses:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {suggestedVerses.map((verse, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {verse}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select value={currentBook} onValueChange={setCurrentBook}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {bibleBooks.map(book => (
                                <SelectItem key={book} value={book}>{book}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentChapter.toString()} onValueChange={(value) => setCurrentChapter(parseInt(value))}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {chapters.map((_, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {index + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="read" className="px-4 mt-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="read">Read</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                    <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
                </TabsList>

                <TabsContent value="read" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {currentBook} Chapter {currentChapter}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {verses.map((verse, index) => {
                                        const verseNumber = index + 1;
                                        const highlightColor = getVerseHighlight(verseNumber);
                                        const bookmarked = isBookmarked(verseNumber);

                                        return (
                                            <div key={verseNumber} className="group relative">
                                                <div className={`p-3 rounded-lg border transition-all ${highlightColor
                                                        ? `bg-${highlightColor}-100 border-${highlightColor}-300`
                                                        : 'bg-white border-gray-200'
                                                    } ${selectedVerse === verseNumber ? 'ring-2 ring-blue-500' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <Badge variant="outline" className="text-xs">
                                                            {verseNumber}
                                                        </Badge>
                                                        <div className="flex-1">
                                                            <p className="text-gray-800 leading-relaxed">
                                                                {verse.text}
                                                            </p>

                                                            {/* Verse Actions */}
                                                            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleHighlight(verseNumber)}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Highlighter className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleBookmark(verseNumber)}
                                                                    className={`h-8 px-2 ${bookmarked ? 'text-red-500' : ''}`}
                                                                >
                                                                    <Bookmark className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleCopy(verse.text, verseNumber)}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleShare(verse.text, verseNumber)}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Share2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleExplainVerse(verse.text, verseNumber)}
                                                                    className="h-8 px-2"
                                                                >
                                                                    <Lightbulb className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="search" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Search Scripture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search for verses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>

                            <ScrollArea className="h-80">
                                <div className="space-y-3">
                                    {searchResults.map((result, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary">
                                                    {result.book} {result.chapter}:{result.verse}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleExplainVerse(result.text, result.verse)}
                                                    className="h-6 px-2"
                                                >
                                                    <Lightbulb className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-700">{result.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookmarks" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bookmarked Verses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-80">
                                <div className="space-y-3">
                                    {bookmarks.map((bookmark) => (
                                        <div key={bookmark.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary">
                                                    {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {new Date(bookmark.created_at).toLocaleDateString()}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCurrentBook(bookmark.book);
                                                        setCurrentChapter(bookmark.chapter);
                                                    }}
                                                >
                                                    Go to verse
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleExplainVerse('', bookmark.verse)}
                                                >
                                                    <Lightbulb className="w-4 h-4 mr-1" />
                                                    Explain
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <BottomNavigation />
        </div>
    );
};

export default BibleReader;
