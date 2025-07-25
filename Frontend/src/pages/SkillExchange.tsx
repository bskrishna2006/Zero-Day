import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Star,
  Clock,
  Users,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  Filter,
  MapPin,
  Zap,
  Code,
  Palette,
  Globe,
  Music,
  Camera,
  Calculator,
  Lightbulb,
  Target,
  CheckCircle,
  User,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Send,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface PeerTeacher {
  id: string;
  name: string;
  skills: string[];
  type: "peer" | "senior";
  availability: string[];
  linkedinUrl?: string;
  email: string;
  phone?: string;
  bio: string;
  rating: number;
  totalSessions: number;
  createdAt: string;
  addedBy: string;
}

interface ContactRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  requesterName: string;
  requesterEmail: string;
  skill: string;
  message: string;
  preferredTime: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

const skillCategories = [
  {
    name: "Programming",
    skills: [
      "Java",
      "Python",
      "JavaScript",
      "React",
      "Node.js",
      "C++",
      "HTML/CSS",
    ],
    icon: Code,
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Design",
    skills: [
      "UI/UX Design",
      "Graphic Design",
      "Figma",
      "Adobe Creative Suite",
      "Web Design",
    ],
    icon: Palette,
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Languages",
    skills: ["English", "Spanish", "French", "German", "Mandarin", "Japanese"],
    icon: Globe,
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Academic",
    skills: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Statistics",
      "Data Science",
    ],
    icon: Calculator,
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Business",
    skills: [
      "Marketing",
      "Finance",
      "Management",
      "Entrepreneurship",
      "Public Speaking",
    ],
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "Creative",
    skills: [
      "Photography",
      "Video Editing",
      "Music Production",
      "Writing",
      "Content Creation",
    ],
    icon: Camera,
    color: "bg-pink-100 text-pink-800",
  },
  {
    name: "Other",
    skills: [
      "Aptitude",
      "Interview Prep",
      "Resume Building",
      "Career Guidance",
    ],
    icon: Lightbulb,
    color: "bg-gray-100 text-gray-800",
  },
];

const availabilitySlots = [
  "Monday 9:00-12:00",
  "Monday 14:00-17:00",
  "Monday 18:00-21:00",
  "Tuesday 9:00-12:00",
  "Tuesday 14:00-17:00",
  "Tuesday 18:00-21:00",
  "Wednesday 9:00-12:00",
  "Wednesday 14:00-17:00",
  "Wednesday 18:00-21:00",
  "Thursday 9:00-12:00",
  "Thursday 14:00-17:00",
  "Thursday 18:00-21:00",
  "Friday 9:00-12:00",
  "Friday 14:00-17:00",
  "Friday 18:00-21:00",
  "Saturday 10:00-13:00",
  "Saturday 14:00-17:00",
  "Sunday 10:00-13:00",
  "Sunday 14:00-17:00",
];

export default function SkillExchange() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [peerTeachers, setPeerTeachers] = useState<PeerTeacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<PeerTeacher[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<PeerTeacher | null>(
    null
  );

  // Form states for adding skills
  const [teacherName, setTeacherName] = useState("");
  const [teacherSkills, setTeacherSkills] = useState<string[]>([]);
  const [teacherType, setTeacherType] = useState<"peer" | "senior">("peer");
  const [teacherAvailability, setTeacherAvailability] = useState<string[]>([]);
  const [teacherLinkedin, setTeacherLinkedin] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherBio, setTeacherBio] = useState("");
  const [newSkillInput, setNewSkillInput] = useState("");

  // Form states for booking
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [selectedSkillForBooking, setSelectedSkillForBooking] = useState("");

  // Fetch teachers data from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log("Fetching peer teachers data...");
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/skill-exchange/teachers`;
        console.log("API URL:", apiUrl);
        
        // Add token to ensure we're authenticated, which can help with data visibility
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(apiUrl, { headers });
        console.log("Response status:", response.status);
        
        const data = await response.json();
        console.log("API Response data:", data);
        
        if (data && data.teachers && Array.isArray(data.teachers)) {
          // Transform the data to match our frontend structure if needed
          const formattedTeachers = data.teachers.map(teacher => ({
            id: teacher._id,
            name: teacher.name,
            skills: teacher.skills || [],
            type: teacher.type,
            availability: teacher.availability || [],
            linkedinUrl: teacher.linkedinUrl,
            email: teacher.email,
            phone: teacher.phone,
            bio: teacher.bio || "",
            rating: teacher.rating || 0,
            totalSessions: teacher.totalSessions || 0,
            createdAt: teacher.createdAt,
            addedBy: teacher.addedBy?.name || 'Admin'
          }));
          
          console.log("Formatted teachers data:", formattedTeachers);
          setPeerTeachers(formattedTeachers);
          setFilteredTeachers(formattedTeachers);
        } else {
          console.warn("No teachers data found in API response:", data);
          setPeerTeachers([]);
          setFilteredTeachers([]);
          // Show toast notification
          toast({
            title: "No Peer Teachers Found",
            description: "Currently, there are no peer teachers available.",
          });
        }
      } catch (error) {
        console.error("Error fetching peer teachers:", error);
        // If API fails, we could fall back to some placeholder data
        setPeerTeachers([]);
        setFilteredTeachers([]);
        // Show toast notification for error
        toast({
          title: "Failed to load peer teachers",
          description: "Please try again later or contact support.",
          variant: "destructive",
        });
      }
    };

    fetchTeachers();
    
    // Set up an interval to refresh the data every 30 seconds
    const refreshInterval = setInterval(fetchTeachers, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Filter teachers
  useEffect(() => {
    let filtered = peerTeachers;

    if (searchTerm) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          teacher.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSkill !== "all") {
      filtered = filtered.filter((teacher) =>
        teacher.skills.some((skill) =>
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((teacher) => teacher.type === selectedType);
    }

    setFilteredTeachers(filtered);
  }, [peerTeachers, searchTerm, selectedSkill, selectedType]);

  const handleAddSkill = (skill: string) => {
    if (skill && !teacherSkills.includes(skill)) {
      setTeacherSkills((prev) => [...prev, skill]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTeacherSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleAddAvailability = (slot: string) => {
    if (!teacherAvailability.includes(slot)) {
      setTeacherAvailability((prev) => [...prev, slot]);
    }
  };

  const handleRemoveAvailability = (slotToRemove: string) => {
    setTeacherAvailability((prev) =>
      prev.filter((slot) => slot !== slotToRemove)
    );
  };

  const handleSubmitTeacher = async () => {
    if (
      !teacherName ||
      !teacherEmail ||
      teacherSkills.length === 0 ||
      teacherAvailability.length === 0
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create the teacher data object
    const teacherData = {
      name: teacherName,
      skills: teacherSkills,
      type: teacherType,
      availability: teacherAvailability,
      linkedinUrl: teacherLinkedin || undefined,
      email: teacherEmail,
      phone: teacherPhone || undefined,
      bio: teacherBio,
    };

    try {
      // Show loading toast
      toast({
        title: "Submitting...",
        description: "Adding your skills to the marketplace",
      });

      // Submit to the API
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/skill-exchange/teachers`;
      
      // Get a fresh token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(teacherData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create teacher profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // If it's an authentication error, provide a helpful message
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication error:", errorMessage);
          
          // Suggest logging in again
          throw new Error("Authentication failed. Please try logging out and logging in again.");
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Teacher created successfully:", result);

      // Fetch the updated list of teachers
      const fetchResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}` // Include token for consistent auth
        }
      });
      const fetchData = await fetchResponse.json();
      
      if (fetchData && fetchData.teachers && Array.isArray(fetchData.teachers)) {
        const formattedTeachers = fetchData.teachers.map(teacher => ({
          id: teacher._id,
          name: teacher.name,
          skills: teacher.skills || [],
          type: teacher.type,
          availability: teacher.availability || [],
          linkedinUrl: teacher.linkedinUrl,
          email: teacher.email,
          phone: teacher.phone,
          bio: teacher.bio || "",
          rating: teacher.rating || 0,
          totalSessions: teacher.totalSessions || 0,
          createdAt: teacher.createdAt,
          addedBy: teacher.addedBy?.name || 'Admin'
        }));
        
        setPeerTeachers(formattedTeachers);
        setFilteredTeachers(formattedTeachers);
      }

      // Reset form
      setTeacherName("");
      setTeacherSkills([]);
      setTeacherType("peer");
      setTeacherAvailability([]);
      setTeacherLinkedin("");
      setTeacherEmail("");
      setTeacherPhone("");
      setTeacherBio("");
      setIsAddSkillDialogOpen(false);

      toast({
        title: "Success",
        description: "Your skills have been added to the marketplace!",
      });
    } catch (error) {
      console.error("Error creating teacher profile:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("Authentication")) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please log out and log in again.",
          variant: "destructive",
          action: <ToastAction altText="Logout" onClick={() => {
            // Clear auth data and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
          }}>Logout</ToastAction>,
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContactRequest = () => {
    if (
      !requesterName ||
      !requesterEmail ||
      !requestMessage ||
      !selectedSkillForBooking
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: ContactRequest = {
      id: Date.now().toString(),
      teacherId: selectedTeacher?.id || "",
      teacherName: selectedTeacher?.name || "",
      requesterName,
      requesterEmail,
      skill: selectedSkillForBooking,
      message: requestMessage,
      preferredTime: preferredTime || "Flexible",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setContactRequests((prev) => [newRequest, ...prev]);

    // Reset form
    setRequesterName("");
    setRequesterEmail("");
    setRequestMessage("");
    setPreferredTime("");
    setSelectedSkillForBooking("");
    setIsBookingDialogOpen(false);
    setSelectedTeacher(null);

    toast({
      title: "Request Sent!",
      description: "Your learning request has been sent to the teacher.",
    });
  };

  const getAllSkills = () => {
    const allSkills = skillCategories.flatMap((category) => category.skills);
    return [...new Set(allSkills)];
  };

  const getTypeIcon = (type: string) => {
    return type === "senior" ? (
      <GraduationCap className="h-4 w-4" />
    ) : (
      <UserCheck className="h-4 w-4" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "senior"
      ? "bg-purple-100 text-purple-800 border-purple-300"
      : "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skill Exchange
            </h1>
            <p className="text-gray-600 text-lg">
              Learn from peers, connect with seniors, grow together
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{peerTeachers.length} Peer Teachers</span>
          </div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-purple-500" />
            <span>
              {peerTeachers.filter((t) => t.type === "senior").length} Senior
              Mentors
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>4.8 Average Rating</span>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">Skill Directory</TabsTrigger>
          <TabsTrigger value="add-skills">Add Your Skills</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        {/* Skill Directory Tab */}
        <TabsContent value="directory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Find Peer Teachers
                </div>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({ title: "Refreshing...", description: "Updating peer teacher list" });
                    
                    // Create fetchTeachers function to refresh the data
                    const fetchTeachers = async () => {
                      try {
                        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/skill-exchange/teachers`;
                        const token = localStorage.getItem('authToken');
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        
                        if (token) {
                          headers['Authorization'] = `Bearer ${token}`;
                        }
                        
                        const response = await fetch(apiUrl, { headers });
                        const data = await response.json();
                        
                        if (data && data.teachers && Array.isArray(data.teachers)) {
                          const formattedTeachers = data.teachers.map(teacher => ({
                            id: teacher._id,
                            name: teacher.name,
                            skills: teacher.skills || [],
                            type: teacher.type,
                            availability: teacher.availability || [],
                            linkedinUrl: teacher.linkedinUrl,
                            email: teacher.email,
                            phone: teacher.phone,
                            bio: teacher.bio || "",
                            rating: teacher.rating || 0,
                            totalSessions: teacher.totalSessions || 0,
                            createdAt: teacher.createdAt,
                            addedBy: teacher.addedBy?.name || 'Admin'
                          }));
                          
                          setPeerTeachers(formattedTeachers);
                          setFilteredTeachers(formattedTeachers);
                          
                          toast({
                            title: "Updated!",
                            description: `Found ${formattedTeachers.length} peer teachers`
                          });
                        }
                      } catch (error) {
                        console.error("Error refreshing teacher list:", error);
                        toast({
                          title: "Error",
                          description: "Failed to refresh teacher list",
                          variant: "destructive"
                        });
                      }
                    };
                    
                    fetchTeachers();
                  }}
                >
                  Refresh List
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, skill, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {getAllSkills().map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="peer">Peer Teachers</SelectItem>
                    <SelectItem value="senior">Senior Mentors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredTeachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {teacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {teacher.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getTypeColor(teacher.type)}>
                                {getTypeIcon(teacher.type)}
                                <span className="ml-1">
                                  {teacher.type === "senior"
                                    ? "Senior Mentor"
                                    : "Peer Teacher"}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {teacher.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {teacher.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {teacher.bio}
                      </p>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {teacher.skills
                            .slice(0, 3)
                            .map((skill, skillIndex) => (
                              <Badge
                                key={skillIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          {teacher.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{teacher.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Availability:</h4>
                        <div className="text-xs text-gray-600">
                          {teacher.availability.slice(0, 2).join(", ")}
                          {teacher.availability.length > 2 &&
                            ` +${teacher.availability.length - 2} more`}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsContactDialogOpen(true);
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsBookingDialogOpen(true);
                          }}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTeachers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No peer teachers found matching your criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Add Skills Tab */}
        <TabsContent value="add-skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Share Your Skills
              </CardTitle>
              <CardDescription>
                Help fellow students by sharing your expertise and knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teacherName">Your Name *</Label>
                  <Input
                    id="teacherName"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherEmail">Email *</Label>
                  <Input
                    id="teacherEmail"
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="your.email@university.edu"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teacherPhone">Phone (Optional)</Label>
                  <Input
                    id="teacherPhone"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherLinkedin">
                    LinkedIn Profile (Optional)
                  </Label>
                  <Input
                    id="teacherLinkedin"
                    value={teacherLinkedin}
                    onChange={(e) => setTeacherLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={teacherType}
                  onValueChange={(value: "peer" | "senior") =>
                    setTeacherType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peer">
                      Peer Teacher (Current Student)
                    </SelectItem>
                    <SelectItem value="senior">
                      Senior Mentor (Graduate/Professional)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Skills You Can Teach *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Enter a skill (e.g., React, Java, UI/UX)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddSkill(newSkillInput)}
                    disabled={!newSkillInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {teacherSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacherSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Availability *</Label>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {availabilitySlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={slot}
                        checked={teacherAvailability.includes(slot)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleAddAvailability(slot);
                          } else {
                            handleRemoveAvailability(slot);
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={slot} className="text-sm cursor-pointer">
                        {slot}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherBio">Bio/Description</Label>
                <Textarea
                  id="teacherBio"
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  placeholder="Tell students about your experience, teaching style, and what you can help them with..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitTeacher} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add My Skills to Marketplace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Learning Requests</CardTitle>
              <CardDescription>
                Track your requests to peer teachers and mentors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    No requests sent yet. Start learning from your peers!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {request.skill} with {request.teacherName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Preferred time: {request.preferredTime} • Sent{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "secondary"
                              : request.status === "accepted"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {selectedTeacher?.name}</DialogTitle>
            <DialogDescription>
              Get in touch with this{" "}
              {selectedTeacher?.type === "senior"
                ? "senior mentor"
                : "peer teacher"}
            </DialogDescription>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                    {selectedTeacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedTeacher.name}
                  </h3>
                  <Badge className={getTypeColor(selectedTeacher.type)}>
                    {getTypeIcon(selectedTeacher.type)}
                    <span className="ml-1">
                      {selectedTeacher.type === "senior"
                        ? "Senior Mentor"
                        : "Peer Teacher"}
                    </span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedTeacher.email}</span>
                </div>

                {selectedTeacher.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedTeacher.phone}</span>
                  </div>
                )}

                {selectedTeacher.linkedinUrl && (
                  <div className="flex items-center space-x-3">
                    <Linkedin className="h-4 w-4 text-gray-500" />
                    <a
                      href={selectedTeacher.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      LinkedIn Profile
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacher.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Available Times:</h4>
                <div className="space-y-1">
                  {selectedTeacher.availability.map((slot, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 flex items-center"
                    >
                      <Clock className="h-3 w-3 mr-2" />
                      {slot}
                    </div>
                  ))}
                </div>
              </div>

              {selectedTeacher.bio && (
                <div>
                  <h4 className="font-medium mb-2">About:</h4>
                  <p className="text-sm text-gray-600">{selectedTeacher.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Learning Request</DialogTitle>
            <DialogDescription>
              Send a request to {selectedTeacher?.name} for learning assistance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requesterName">Your Name *</Label>
                <Input
                  id="requesterName"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requesterEmail">Your Email *</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectedSkillForBooking">
                Skill You Want to Learn *
              </Label>
              <Select
                value={selectedSkillForBooking}
                onValueChange={setSelectedSkillForBooking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeacher?.skills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time (Optional)</Label>
              <Select value={preferredTime} onValueChange={setPreferredTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time or leave flexible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  {selectedTeacher?.availability.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestMessage">Message *</Label>
              <Textarea
                id="requestMessage"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Tell them what you'd like to learn, your current level, and any specific questions..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleContactRequest}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
