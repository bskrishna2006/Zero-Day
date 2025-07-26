import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Search, User, CheckCircle, Loader2, Clock, AlarmClock, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useComplaints, useCreateComplaint, useUpdateComplaint } from '@/hooks/useComplaints';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: {
    _id: string;
    name: string;
    email: string;
  };
  submittedByName: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  location?: string;
  contactInfo?: {
    email: string;
    phone?: string;
  };
  attachments?: {
    filename: string;
    url: string;
    uploadedAt: string;
  }[];
  comments?: {
    _id: string;
    author: {
      _id: string;
      name: string;
    };
    authorName: string;
    message: string;
    createdAt: string;
  }[];
  resolvedAt?: string;
  estimatedResolution?: string;
  createdAt: string;
  updatedAt: string;
}

const categories = ['Water', 'Electricity', 'Cleaning', 'Maintenance', 'Internet', 'Security', 'Other'];
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  urgent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export default function Complaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get complaints data from API
  const { data: complaintsData, isLoading: isLoadingComplaints } = useComplaints();
  const createComplaint = useCreateComplaint();
  const updateComplaint = useUpdateComplaint();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Filter complaints
  const getFilteredComplaints = () => {
    if (!complaintsData?.complaints) return [];
    
    let filtered = [...complaintsData.complaints];
    
    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.location && complaint.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === selectedStatus);
    }
    
    return filtered;
  };
  
  const filteredComplaints = getFilteredComplaints();

  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      
      if (location) {
        formData.append('location', location);
      }
      
      if (imageFile) {
        formData.append('attachment', imageFile);
      }
      
      await createComplaint.mutateAsync(formData);
      
      // Reset form after successful submission
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
      setPriority('medium');
      setImageFile(null);
      setImagePreview(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComplaintStatus = async (id: string, status: 'pending' | 'in-progress' | 'resolved') => {
    try {
      await updateComplaint.mutateAsync({
        id,
        data: { status }
      });
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if user can access complaints
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <div className="min-h-screen py-8 px-2 md:px-0">
        <div className="container space-y-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Admin Complaints Dashboard</h1>
              <p className="text-lg text-muted-foreground">Manage and resolve all hostel complaints</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <AlarmClock className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Table/List View */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Submitted By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingComplaints ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading complaints...</p>
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No complaints found. Enjoy the peace! 🎉
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{complaint.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {complaint.description.substring(0, 60)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {complaint.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[complaint.status]}>
                          {complaint.status === 'in-progress' ? 'In Progress' : 
                          complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={priorityColors[complaint.priority]}>
                          {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(complaint.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{complaint.submittedByName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {complaint.location || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {complaint.status !== 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateComplaintStatus(complaint._id, 'in-progress')}
                            >
                              <Clock className="h-4 w-4 mr-1" /> Start
                            </Button>
                          )}
                          {complaint.status !== 'resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateComplaintStatus(complaint._id, 'resolved')}
                              className="text-green-600 border-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-2 md:px-0">
      <div className="container space-y-8 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Complaints</h1>
            <p className="text-lg text-muted-foreground">Report and track hostel issues</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-400 text-white rounded-full shadow-2xl p-5 hover:scale-110 hover:shadow-[0_0_40px_10px_rgba(0,255,255,0.3)] transition-all">
                <Plus className="h-8 w-8" />
              </button>
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Room number, floor, building, etc."
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="image">Attach Image (optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img src={imagePreview} alt="Preview" className="max-h-32 rounded border" />
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitComplaint} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </Button>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingComplaints ? (
            <div className="flex flex-col items-center justify-center py-16 col-span-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 col-span-full">
              <img src="/empty-state.svg" alt="No complaints" className="w-40 mb-4 opacity-70" />
              <p className="text-xl font-semibold">No complaints found. Enjoy the peace! 🎉</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card key={complaint._id} className="relative overflow-hidden hover:shadow-lg transition-all">
                <div className={`absolute left-0 top-0 h-full w-1 
                  ${complaint.status === 'pending' ? 'bg-yellow-400' : 
                    complaint.status === 'in-progress' ? 'bg-blue-500' : 
                    'bg-green-500'}`} 
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">{complaint.title}</CardTitle>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(complaint.createdAt)}
                        </div>
                        {complaint.location && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline" className="mb-1">
                        {complaint.category}
                      </Badge>
                      <Badge className={statusColors[complaint.status]}>
                        {complaint.status === 'pending' && <Clock className="w-3 h-3 mr-1" />} 
                        {complaint.status === 'in-progress' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />} 
                        {complaint.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />} 
                        {complaint.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{complaint.description}</p>
                  {complaint.attachments && complaint.attachments.length > 0 && (
                    <div className="mb-4">
                      <img 
                        src={complaint.attachments[0].url} 
                        alt="Complaint" 
                        className="max-h-40 w-full rounded-md border object-cover" 
                        onError={(e) => {
                          // Handle image load error
                          console.error("Failed to load image:", complaint.attachments[0].url);
                          e.currentTarget.src = "/empty-state.svg";
                          e.currentTarget.className = "max-h-40 rounded-md border object-contain opacity-50";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={priorityColors[complaint.priority]}>
                      {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                    </Badge>
                    
                    {complaint.estimatedResolution && complaint.status !== 'resolved' && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Est. resolution: {formatDate(complaint.estimatedResolution)}
                      </div>
                    )}
                    
                    {complaint.resolvedAt && complaint.status === 'resolved' && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved: {formatDate(complaint.resolvedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}