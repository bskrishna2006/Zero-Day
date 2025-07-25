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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Plus, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'lost' | 'found';
  location: string;
  date: string;
  reportedBy: string;
  image?: string;
}

const categories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Sports Equipment', 'Other'];

export default function LostFound() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [location, setLocation] = useState('');

  // Mock data
  useEffect(() => {
    const mockItems: LostFoundItem[] = [
      {
        id: '1',
        title: 'iPhone 13 Pro',
        description: 'Black iPhone 13 Pro with a blue case. Found near the library entrance.',
        category: 'Electronics',
        type: 'found',
        location: 'Library Entrance',
        date: '2024-01-20',
        reportedBy: 'John Doe',
      },
      {
        id: '2',
        title: 'Red Backpack',
        description: 'Lost a red Nike backpack containing textbooks and notebooks. Last seen in cafeteria.',
        category: 'Accessories',
        type: 'lost',
        location: 'Cafeteria',
        date: '2024-01-19',
        reportedBy: 'Jane Smith',
      },
      {
        id: '3',
        title: 'Calculus Textbook',
        description: 'Advanced Calculus textbook, 3rd edition. Found in classroom B-204.',
        category: 'Books',
        type: 'found',
        location: 'Classroom B-204',
        date: '2024-01-18',
        reportedBy: 'Mike Johnson',
      }
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = items;
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, activeTab]);

  const handleSubmitReport = () => {
    if (!title || !description || !category || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newItem: LostFoundItem = {
      id: Date.now().toString(),
      title,
      description,
      category,
      type,
      location,
      date: new Date().toISOString().split('T')[0],
      reportedBy: user?.name || 'Anonymous'
    };

    setItems(prev => [newItem, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully.`,
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
          <p className="text-muted-foreground">Help reunite lost items with their owners</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Report Lost/Found Item</DialogTitle>
              <DialogDescription>
                Help others by reporting lost or found items on campus.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={type} onValueChange={(value: 'lost' | 'found') => setType(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lost">Lost Item</TabsTrigger>
                <TabsTrigger value="found">Found Item</TabsTrigger>
              </TabsList>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Name</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., iPhone, Backpack, Textbook"
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where was it lost/found?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the item"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Image (Optional)</Label>
                  <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Click to upload image</p>
                    </div>
                  </div>
                </div>
              </div>
            </Tabs>
            
            <DialogFooter>
              <Button onClick={handleSubmitReport}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
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
      </div>

      {/* Items Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No items found.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {item.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div>Reported by: {item.reportedBy}</div>
                </div>
                
                <Button size="sm" className="w-full">
                  Contact Reporter
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}