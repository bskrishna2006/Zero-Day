import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdBy: string;
}

const categories = ['Academic', 'Events', 'Holidays', 'Exams', 'Sports', 'General'];

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Mock data
  useEffect(() => {
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Mid-term Examination Schedule Released',
        description: 'The mid-term examination schedule for all departments has been released. Please check your respective department notice boards for detailed timings.',
        category: 'Exams',
        date: '2024-01-20',
        createdBy: 'Academic Office'
      },
      {
        id: '2',
        title: 'Annual Sports Meet 2024',
        description: 'Join us for the Annual Sports Meet happening next month. Registration is now open for all events including athletics, basketball, and football.',
        category: 'Sports',
        date: '2024-01-18',
        createdBy: 'Sports Committee'
      },
      {
        id: '3',
        title: 'Library Holiday Hours',
        description: 'The library will have reduced hours during the upcoming holiday period. Please plan your study schedules accordingly.',
        category: 'Holidays',
        date: '2024-01-15',
        createdBy: 'Library Administration'
      }
    ];
    setAnnouncements(mockAnnouncements);
    setFilteredAnnouncements(mockAnnouncements);
  }, []);

  // Filter announcements
  useEffect(() => {
    let filtered = announcements;
    
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(announcement => announcement.category === selectedCategory);
    }
    
    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, selectedCategory]);

  const handleCreateAnnouncement = () => {
    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title,
      description,
      category,
      date: new Date().toISOString().split('T')[0],
      createdBy: user?.name || 'Admin'
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('');
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Announcement created successfully.",
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with campus news and events</p>
        </div>
        
        {user?.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Share important information with the campus community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter announcement details"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAnnouncement}>Create Announcement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Announcements Grid */}
      <div className="grid gap-6">
        {filteredAnnouncements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No announcements found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(announcement.date).toLocaleDateString()}
                      </div>
                      <div>By {announcement.createdBy}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{announcement.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {announcement.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}