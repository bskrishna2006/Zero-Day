import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Calendar,
  Plus,
  Search,
  Pin,
  User,
  Bell,
  TrendingUp,
  Eye,
  MessageSquare,
  Filter,
  Sparkles,
  Hash,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnnouncements, useCreateAnnouncement, useMarkAnnouncementRead } from "@/hooks/useAnnouncements";

interface BackendAnnouncement {
  _id: string;
  title: string;
  description: string;
  category: string;
  channel: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  isPinned?: boolean;
  priority?: "high" | "medium" | "low";
  views?: number;
  isRead?: boolean;
}

const categories = [
  "Academic",
  "Events", 
  "Holidays",
  "Exams",
  "Sports",
  "General",
];

const channels = [
  { id: "general-announcements", label: "General Announcements", icon: "📢" },
  { id: "academic-updates", label: "Academic Updates", icon: "🎓" },
  { id: "campus-events", label: "Campus Events", icon: "🎉" },
  { id: "exam-notifications", label: "Exam Notifications", icon: "📝" },
  { id: "sports-activities", label: "Sports Activities", icon: "⚽" },
  { id: "library-updates", label: "Library Updates", icon: "📚" },
  { id: "job-placement", label: "Job Placement", icon: "💼" },
  { id: "hostel-notices", label: "Hostel Notices", icon: "🏠" },
];

const getCategoryConfig = (category: string) => {
  const configs = {
    Academic: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: "🎓",
    },
    Events: {
      color: "bg-purple-100 text-purple-800 border-purple-300", 
      icon: "🎉",
    },
    Holidays: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: "🏖️",
    },
    Exams: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: "📝",
    },
    Sports: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: "⚽",
    },
    General: {
      color: "bg-slate-100 text-slate-800 border-slate-300",
      icon: "📢",
    },
  };
  return configs[category as keyof typeof configs] || configs.General;
};

interface Channel {
  id: string;
  name: string;
  label: string;
  icon: string;
  category: string;
  unreadCount: number;
}

export default function AnnouncementsNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(() => {
    const savedReadIds = localStorage.getItem('readAnnouncements');
    return savedReadIds ? JSON.parse(savedReadIds) : [];
  });

  // Channel form state
  const [channelName, setChannelName] = useState("");
  const [channelLabel, setChannelLabel] = useState("");
  const [channelIcon, setChannelIcon] = useState("");
  const [channelCategory, setChannelCategory] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [channel, setChannel] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isPinned, setIsPinned] = useState(false);

  // API hooks
  const { data: announcementsData, isLoading, error, refetch } = useAnnouncements();
  const markAsRead = useMarkAnnouncementRead();
  const createAnnouncementMutation = useCreateAnnouncement();

  const announcements = announcementsData?.announcements || [];
  
  // Sync local read status with server data
  useEffect(() => {
    if (announcements.length > 0) {
      // Get announcements that server reports as read
      const serverReadIds = announcements
        .filter((a: BackendAnnouncement) => a.isRead === true)
        .map((a: BackendAnnouncement) => a._id);
      
      if (serverReadIds.length > 0) {
        // Add any server-reported read announcements to local state if not already there
        setReadAnnouncementIds(prev => {
          const newReadIds = [...prev];
          let changed = false;
          
          serverReadIds.forEach(id => {
            if (!newReadIds.includes(id)) {
              newReadIds.push(id);
              changed = true;
            }
          });
          
          if (changed) {
            localStorage.setItem('readAnnouncements', JSON.stringify(newReadIds));
            return newReadIds;
          }
          
          return prev;
        });
      }
    }
  }, [announcements]);
  
  // Function to mark an announcement as read
  const handleMarkAsRead = (announcementId: string) => {
    if (!readAnnouncementIds.includes(announcementId)) {
      const newReadIds = [...readAnnouncementIds, announcementId];
      setReadAnnouncementIds(newReadIds);
      localStorage.setItem('readAnnouncements', JSON.stringify(newReadIds));
      
      // If user is logged in, send read status to server
      if (user) {
        markAsRead.mutate(announcementId);
      }
    }
  };

  // Initialize channels with mock data (similar to original)
  useEffect(() => {
    const mockChannels: Channel[] = [
      {
        id: "general-announcements",
        name: "general-announcements",
        label: "General Announcements",
        icon: "📢",
        category: "Information",
        unreadCount: 0,
      },
      {
        id: "academic-updates",
        name: "academic-updates",
        label: "Academic Updates",
        icon: "🎓",
        category: "Information",
        unreadCount: 0,
      },
      {
        id: "campus-events",
        name: "campus-events",
        label: "Campus Events",
        icon: "🎉",
        category: "Information",
        unreadCount: 0,
      },
      {
        id: "exam-notifications",
        name: "exam-notifications",
        label: "Exam Notifications",
        icon: "📝",
        category: "Information",
        unreadCount: 0,
      },
      {
        id: "sports-activities",
        name: "sports-activities",
        label: "Sports Activities",
        icon: "⚽",
        category: "Activities",
        unreadCount: 0,
      },
      {
        id: "library-updates",
        name: "library-updates",
        label: "Library Updates",
        icon: "📚",
        category: "Information",
        unreadCount: 0,
      },
      {
        id: "job-placement",
        name: "job-placement",
        label: "Job Placement",
        icon: "💼",
        category: "Career",
        unreadCount: 0,
      },
      {
        id: "hostel-notices",
        name: "hostel-notices",
        label: "Hostel Notices",
        icon: "🏠",
        category: "Campus Life",
        unreadCount: 0,
      },
      {
        id: "tech-updates",
        name: "tech-updates",
        label: "Tech Updates",
        icon: "💻",
        category: "Activities",
        unreadCount: 0,
      },
    ];

    setChannels(mockChannels);
  }, []);
  
  // Update channel unread counts when announcements or read status changes
  useEffect(() => {
    if (announcements.length > 0) {
      setChannels(prevChannels => {
        return prevChannels.map(channel => {
          // Get announcements for this channel
          const channelAnnouncements = announcements.filter(
            (a: BackendAnnouncement) => a.channel === channel.id
          );
          
          // Count unread announcements - use server isRead status if available, otherwise local tracking
          const unreadCount = channelAnnouncements.filter(
            (a: BackendAnnouncement) => {
              // If server returned isRead property, use that
              if (typeof a.isRead === 'boolean') {
                return !a.isRead;
              }
              // Otherwise use local tracking
              return !readAnnouncementIds.includes(a._id);
            }
          ).length;
          
          return {
            ...channel,
            unreadCount
          };
        });
      });
    }
  }, [announcements, readAnnouncementIds]);

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement: BackendAnnouncement) => {
    const matchesSearch = !searchTerm || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory;
    const matchesChannel = selectedChannel === "all" || announcement.channel === selectedChannel;
    
    return matchesSearch && matchesCategory && matchesChannel;
  });

  const handleCreateAnnouncement = async () => {
    if (!title || !description || !category || !channel) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAnnouncementMutation.mutateAsync({
        title,
        description,
        category,
        channel,
        priority,
        isPinned,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setChannel("");
      setPriority("medium");
      setIsPinned(false);
      setIsDialogOpen(false);

      // Refetch data
      refetch();
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading announcements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Announcements</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Get channels by category for sidebar
  const getChannelsByCategory = () => {
    const channelCategories = [...new Set(channels.map((ch) => ch.category))];
    return channelCategories.map((category) => ({
      category,
      channels: channels.filter((ch) => ch.category === category),
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };
  const handleCreateChannel = () => {
    if (!channelName || !channelLabel || !channelIcon || !channelCategory) {
      toast({
        title: "Error",
        description: "Please fill in all channel fields.",
        variant: "destructive",
      });
      return;
    }

    const newChannel: Channel = {
      id: channelName.toLowerCase().replace(/\s+/g, "-"),
      name: channelName.toLowerCase().replace(/\s+/g, "-"),
      label: channelLabel,
      icon: channelIcon,
      category: channelCategory,
      unreadCount: 0,
    };

    setChannels((prev) => [...prev, newChannel]);
    setChannelName("");
    setChannelLabel("");
    setChannelIcon("");
    setChannelCategory("");
    setIsChannelDialogOpen(false);

    toast({
      title: "Success",
      description: "Channel created successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex">
      {/* Discord-like Sidebar */}
      <motion.div
        className="w-80 bg-white/95 backdrop-blur-xl border-r border-blue-100/50 shadow-xl flex-shrink-0 overflow-y-auto"
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          {/* Server Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200/50">
            <h2 className="text-lg font-black text-gray-800">
              Campus Announcements
            </h2>
            {user?.role === "admin" && (
              <Dialog
                open={isChannelDialogOpen}
                onOpenChange={setIsChannelDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                    <DialogDescription>
                      Create a new channel for organizing announcements.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="channelName">Channel Name</Label>
                      <Input
                        id="channelName"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="e.g., exam-notifications"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channelLabel">Display Label</Label>
                      <Input
                        id="channelLabel"
                        value={channelLabel}
                        onChange={(e) => setChannelLabel(e.target.value)}
                        placeholder="e.g., Exam Notifications"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channelIcon">Icon (Emoji)</Label>
                      <Input
                        id="channelIcon"
                        value={channelIcon}
                        onChange={(e) => setChannelIcon(e.target.value)}
                        placeholder="📝"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channelCategory">Category</Label>
                      <Select
                        value={channelCategory}
                        onValueChange={setChannelCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Information">
                            Information
                          </SelectItem>
                          <SelectItem value="Activities">Activities</SelectItem>
                          <SelectItem value="Career">Career</SelectItem>
                          <SelectItem value="Campus Life">
                            Campus Life
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateChannel}>
                      Create Channel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* All Announcements Button */}
          <motion.button
            className={`w-full text-left p-3 rounded-lg mb-4 transition-all duration-200 flex items-center justify-between ${
              selectedChannel === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setSelectedChannel("all")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4" />
              <span className="font-bold">All Announcements</span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                selectedChannel === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {announcements.length}
            </span>
          </motion.button>

          {/* Channel Categories */}
          {getChannelsByCategory().map(
            ({ category, channels: categoryChannels }) => (
              <div key={category} className="mb-6">
                <motion.button
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-bold uppercase tracking-wide mb-2 w-full"
                  onClick={() => toggleCategory(category)}
                  whileHover={{ x: 2 }}
                >
                  {collapsedCategories.includes(category) ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {category}
                </motion.button>

                <AnimatePresence>
                  {!collapsedCategories.includes(category) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      {categoryChannels.map((ch) => (
                        <motion.button
                          key={ch.id}
                          className={`w-full text-left p-2 rounded-md transition-all duration-200 flex items-center justify-between group ${
                            selectedChannel === ch.id
                              ? "bg-slate-700 text-white"
                              : "text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                          }`}
                          onClick={() => setSelectedChannel(ch.id)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            <span className="text-sm">{ch.name}</span>
                          </div>
                          {ch.unreadCount > 0 && (
                            <motion.span
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {ch.unreadCount > 99 ? "99+" : ch.unreadCount}
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">
                    {selectedChannel === "all"
                      ? "All Announcements"
                      : channels.find((ch) => ch.id === selectedChannel)
                          ?.label || "Announcements"}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {selectedChannel === "all"
                      ? "Stay connected with all campus updates"
                      : `Updates from ${
                          channels.find((ch) => ch.id === selectedChannel)
                            ?.label || "this channel"
                        }`}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-bold">{filteredAnnouncements.length}</span>
                  <span>Showing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {filteredAnnouncements
                      .reduce((acc: number, ann: BackendAnnouncement) => acc + (ann.views || 0), 0)
                      .toLocaleString()}
                  </span>
                  <span>Total Views</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Pin className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">
                    {filteredAnnouncements.filter((ann: BackendAnnouncement) => ann.isPinned).length}
                  </span>
                  <span>Pinned</span>
                </div>
              </div>
            </div>

            {user?.role === "admin" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold">
                      Create New Announcement
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Share important information with the campus community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter announcement title..."
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat} className="py-2">
                              <div className="flex items-center gap-2">
                                <span>{getCategoryConfig(cat).icon}</span>
                                <span>{cat}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel" className="text-sm font-medium">
                        Channel *
                      </Label>
                      <Select value={channel} onValueChange={setChannel}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id} className="py-2">
                              <div className="flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                <span>{ch.icon}</span>
                                <span>{ch.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter announcement description..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPinned"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isPinned" className="text-sm font-medium">
                        Pin this announcement
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={createAnnouncementMutation.isPending}
                      className="w-full"
                    >
                      {createAnnouncementMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Announcement"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search announcements, keywords, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48 h-11">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="py-2">
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>All Categories</span>
                  </div>
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="py-2">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryConfig(cat).icon}</span>
                      <span>{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Announcements List */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredAnnouncements.map((announcement: BackendAnnouncement, index: number) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleMarkAsRead(announcement._id)}
              >
                <Card className={`bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${
                  // Use server isRead status if available, otherwise use local tracking
                  (typeof announcement.isRead === 'boolean' ? !announcement.isRead : !readAnnouncementIds.includes(announcement._id)) 
                  ? 'border-l-4 border-l-blue-500' : ''
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {announcement.isPinned && (
                            <Pin className="h-4 w-4 text-amber-500" />
                          )}
                          <Badge className={getCategoryConfig(announcement.category).color}>
                            {getCategoryConfig(announcement.category).icon} {announcement.category}
                          </Badge>
                          {announcement.priority && (
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          {(typeof announcement.isRead === 'boolean' ? !announcement.isRead : !readAnnouncementIds.includes(announcement._id)) && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" title="Unread"></span>
                          )}
                          {announcement.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{announcement.createdByName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                          {announcement.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{announcement.views} views</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {announcement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAnnouncements.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No announcements found
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== "all" || selectedChannel !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "No announcements have been posted yet."}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  );
}