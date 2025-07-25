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
import { Calendar, Plus, Search, User, CheckCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  submittedBy: string;
  imageUrl?: string; // New: image preview URL
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
  const [imageFile, setImageFile] = useState<File | null>(null); // New: image file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // New: preview URL

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
        submittedBy: 'John Doe',
        imageUrl: 'https://via.placeholder.com/150', // Mock image
      },
      {
        id: '2',
        title: 'Water leakage in bathroom',
        description: 'There is a water leak in the common bathroom on floor 2.',
        category: 'Water',
        status: 'pending',
        date: '2024-01-19',
        submittedBy: 'Jane Smith',
        imageUrl: 'https://via.placeholder.com/150', // Mock image
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

  const handleSubmitComplaint = () => {
    if (!title || !description || !category || !imageFile) {
      toast({
        title: "Error",
        description: "Please fill in all fields, including attaching an image.",
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
      submittedBy: user?.name || 'Anonymous',
      imageUrl: imagePreview || undefined,
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('');
    setImageFile(null);
    setImagePreview(null);
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

  // Split complaints for student vs admin
  const studentComplaints = complaints.filter(c => c.submittedBy === (user?.name || 'Anonymous'));

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen py-8 px-2 md:px-0 bg-[#10141a]">
        <div className="container space-y-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-blue-200">Admin Complaints Dashboard</h1>
              <p className="text-lg text-blue-400">Manage and resolve all hostel complaints</p>
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#181c24] text-blue-100 border-blue-900 placeholder:text-blue-400"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] bg-[#181c24] text-blue-100 border-blue-900">
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
          {/* Table/List View */}
          <div className="overflow-x-auto rounded-xl shadow-lg">
            <table className="min-w-full bg-[#181c24] text-blue-100">
              <thead>
                <tr className="bg-[#23283a] text-blue-300">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Submitted By</th>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-blue-400">No complaints found.</td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-blue-900 hover:bg-[#23283a] transition">
                      <td className="px-4 py-3 font-bold text-blue-100">{complaint.title}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-gradient-to-r from-blue-400 to-teal-400 text-white font-semibold border-0">
                          {complaint.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow border-0
                          ${complaint.status === 'pending' ? 'bg-yellow-400/80 text-yellow-900' : complaint.status === 'in-progress' ? 'bg-blue-400/80 text-white' : 'bg-green-400/80 text-white'}`}
                        >
                          {complaint.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(complaint.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{complaint.submittedBy}</td>
                      <td className="px-4 py-3">
                        {complaint.imageUrl && (
                          <img src={complaint.imageUrl} alt="Complaint" className="h-10 w-10 object-cover rounded shadow border border-blue-900" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-yellow-400/30 hover:text-yellow-900 border-0 bg-[#23283a]/70 text-blue-100 font-bold"
                            onClick={() => updateComplaintStatus(complaint.id, 'pending')}
                            disabled={complaint.status === 'pending'}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-400/30 hover:text-white border-0 bg-[#23283a]/70 text-blue-100 font-bold"
                            onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                            disabled={complaint.status === 'in-progress'}
                          >
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-green-400/30 hover:text-white border-0 bg-[#23283a]/70 text-blue-100 font-bold"
                            onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                            disabled={complaint.status === 'resolved'}
                          >
                            Resolved
                          </Button>
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
    <div className="min-h-screen py-8 px-2 md:px-0 bg-[#181c24]">
      <div className="container space-y-8 relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">Complaints</h1>
            <p className="text-lg text-blue-200">Report and track hostel issues</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-400 text-white rounded-full shadow-2xl p-5 hover:scale-110 hover:shadow-[0_0_40px_10px_rgba(0,255,255,0.3)] transition-all">
                <Plus className="h-8 w-8" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border border-blue-400/40 bg-[#23283a]/80 backdrop-blur-2xl shadow-2xl animate-fade-in">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Submit New Complaint</DialogTitle>
                <DialogDescription className="text-blue-200">
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
                <div className="space-y-2">
                  <Label htmlFor="image">Attach Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded border" />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-400 text-white shadow-lg font-bold rounded-xl px-6 py-2 hover:scale-105 hover:shadow-[0_0_20px_5px_rgba(0,255,255,0.3)] transition-all" onClick={handleSubmitComplaint}>Submit Complaint</Button>
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {studentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 col-span-full">
              <img src="https://undraw.co/api/illustrations/undraw_empty_re_opql.svg" alt="No complaints" className="w-40 mb-4" />
              <p className="text-xl text-blue-200 font-semibold">No complaints found. Enjoy the peace! 🎉</p>
            </div>
          ) : (
            studentComplaints.map((complaint) => (
              <Card key={complaint.id} className="relative overflow-hidden rounded-2xl border-2 border-transparent bg-[#23283a]/70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-transform hover:scale-[1.025] group">
                {/* Neon/gradient accent line */}
                <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 via-purple-500 to-teal-400 shadow-[0_0_16px_4px_rgba(0,255,255,0.5)] rounded-l-2xl" />
                {/* Glowing border effect */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-[3px] group-hover:border-cyan-400 group-hover:shadow-[0_0_32px_8px_rgba(0,255,255,0.4)] transition-all" />
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white drop-shadow">{complaint.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-xs text-blue-200 mt-1">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(complaint.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.submittedBy}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gradient-to-r from-blue-400 to-teal-400 text-white font-semibold shadow border-0">
                        {complaint.category}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow border-0
                        ${complaint.status === 'pending' ? 'bg-yellow-400/80 text-yellow-900 animate-pulse' : complaint.status === 'in-progress' ? 'bg-blue-400/80 text-white animate-glow' : 'bg-green-400/80 text-white animate-bounce'}`}
                      >
                        {complaint.status === 'pending' && <Clock className="w-4 h-4" />} 
                        {complaint.status === 'in-progress' && <Loader2 className="w-4 h-4" />} 
                        {complaint.status === 'resolved' && <CheckCircle className="w-4 h-4" />} 
                        {complaint.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-base text-blue-100 mb-4 font-medium">{complaint.description}</p>
                  {complaint.imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <img src={complaint.imageUrl} alt="Complaint" className="max-h-40 rounded-xl border-2 border-blue-400/40 shadow-lg" />
                    </div>
                  )}
                  {/* Status Stepper */}
                  <div className="flex items-center mb-4">
                    <div className={`flex-1 h-2 rounded-full transition-all duration-500
                      ${complaint.status === 'pending' ? 'bg-yellow-400/60' : complaint.status === 'in-progress' ? 'bg-blue-400/60' : 'bg-green-400/60'}`}></div>
                    <div className="ml-2 text-xs font-semibold text-blue-200">
                      {complaint.status === 'pending' && 'Pending'}
                      {complaint.status === 'in-progress' && 'In Progress'}
                      {complaint.status === 'resolved' && 'Resolved'}
                    </div>
                  </div>
                  {/* No admin controls for students */}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}