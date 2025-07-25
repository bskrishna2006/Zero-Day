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
import { Calendar, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  submittedBy: string;
}

const categories = ['Water', 'Electricity', 'Cleaning', 'Maintenance', 'Internet', 'Security', 'Other'];
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800'
};

export default function Complaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Mock data
  useEffect(() => {
    const mockComplaints: Complaint[] = [
      {
        id: '1',
        title: 'WiFi connectivity issues in Room 302',
        description: 'Internet connection is very slow and frequently disconnects.',
        category: 'Internet',
        status: 'in-progress',
        date: '2024-01-20',
        submittedBy: 'John Doe'
      },
      {
        id: '2',
        title: 'Water leakage in bathroom',
        description: 'There is a water leak in the common bathroom on floor 2.',
        category: 'Water',
        status: 'pending',
        date: '2024-01-19',
        submittedBy: 'Jane Smith'
      }
    ];
    setComplaints(mockComplaints);
    setFilteredComplaints(mockComplaints);
  }, []);

  // Filter complaints
  useEffect(() => {
    let filtered = complaints;
    
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }
    
    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, selectedCategory]);

  const handleSubmitComplaint = () => {
    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title,
      description,
      category,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      submittedBy: user?.name || 'Anonymous'
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('');
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Complaint submitted successfully.",
    });
  };

  const updateComplaintStatus = (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === id ? { ...complaint, status } : complaint
    ));
    toast({
      title: "Status Updated",
      description: "Complaint status has been updated.",
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">Report and track hostel issues</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit New Complaint</DialogTitle>
              <DialogDescription>
                Report an issue that needs attention from the administration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
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
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmitComplaint}>Submit Complaint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search complaints..."
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

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No complaints found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(complaint.date).toLocaleDateString()}
                      </div>
                      <div>By {complaint.submittedBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{complaint.category}</Badge>
                    <Badge className={statusColors[complaint.status]}>
                      {complaint.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{complaint.description}</p>
                
                {user?.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateComplaintStatus(complaint.id, 'pending')}
                      disabled={complaint.status === 'pending'}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                      disabled={complaint.status === 'in-progress'}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                      disabled={complaint.status === 'resolved'}
                    >
                      Resolved
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}