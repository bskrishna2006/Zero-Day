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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  channel: string;
  date: string;
  createdBy: string;
  isPinned?: boolean;
  priority?: "high" | "medium" | "low";
  views?: number;
  isNew?: boolean;
}

interface Channel {
  id: string;
  name: string;
  label: string;
  icon: string;
  category: string;
  unreadCount: number;
}

const categories = [
  "Academic",
  "Events",
  "Holidays",
  "Exams",
  "Sports",
  "General",
  "Tech News",
  "Opportunities",
];

const getCategoryConfig = (category: string) => {
  const configs = {
    Academic: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      bgGradient: "from-blue-50 to-blue-100/50",
      icon: "🎓",
      accentColor: "border-l-blue-500",
    },
    Events: {
      color: "bg-purple-100 text-purple-800 border-purple-300",
      bgGradient: "from-purple-50 to-purple-100/50",
      icon: "🎉",
      accentColor: "border-l-purple-500",
    },
    Holidays: {
      color: "bg-green-100 text-green-800 border-green-300",
      bgGradient: "from-green-50 to-green-100/50",
      icon: "🏖️",
      accentColor: "border-l-green-500",
    },
    Exams: {
      color: "bg-red-100 text-red-800 border-red-300",
      bgGradient: "from-red-50 to-red-100/50",
      icon: "📝",
      accentColor: "border-l-red-500",
    },
    Sports: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      bgGradient: "from-orange-50 to-orange-100/50",
      icon: "⚽",
      accentColor: "border-l-orange-500",
    },
    General: {
      color: "bg-slate-100 text-slate-800 border-slate-300",
      bgGradient: "from-slate-50 to-slate-100/50",
      icon: "📢",
      accentColor: "border-l-slate-500",
    },
    "Tech News": {
      color: "bg-cyan-100 text-cyan-800 border-cyan-300",
      bgGradient: "from-cyan-50 to-cyan-100/50",
      icon: "📱",
      accentColor: "border-l-cyan-500",
    },
    Opportunities: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      icon: "🚀",
      accentColor: "border-l-emerald-500",
    },
  };
  return configs[category as keyof typeof configs] || configs.General;
};

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [channel, setChannel] = useState("");

  // Channel form state
  const [channelName, setChannelName] = useState("");
  const [channelLabel, setChannelLabel] = useState("");
  const [channelIcon, setChannelIcon] = useState("");
  const [channelCategory, setChannelCategory] = useState("");

  // Helper function to get icons for categories
  const getIconForCategory = (category: string) => {
    switch(category) {
      case "Academic":
        return "🎓";
      case "Events":
        return "🎉";
      case "Holidays":
        return "🏖️";
      case "Exams":
        return "📝";
      case "Sports":
        return "⚽";
      case "General":
        return "📢";
      case "Tech News":
        return "📱";
      case "Opportunities":
        return "🚀";
      default:
        return "📌";
    }
  };

  // Mock data
  useEffect(() => {
    const mockChannels: Channel[] = [
      {
        id: "general",
        name: "general-announcements",
        label: "General Announcements",
        icon: "📢",
        category: "Information",
        unreadCount: 5,
      },
      {
        id: "academic",
        name: "academic-updates",
        label: "Academic Updates",
        icon: "🎓",
        category: "Information",
        unreadCount: 12,
      },
      {
        id: "events",
        name: "campus-events",
        label: "Campus Events",
        icon: "🎉",
        category: "Information",
        unreadCount: 8,
      },
      {
        id: "exams",
        name: "exam-notifications",
        label: "Exam Notifications",
        icon: "📝",
        category: "Information",
        unreadCount: 3,
      },
      {
        id: "sports",
        name: "sports-activities",
        label: "Sports Activities",
        icon: "⚽",
        category: "Activities",
        unreadCount: 15,
      },
      {
        id: "library",
        name: "library-updates",
        label: "Library Updates",
        icon: "📚",
        category: "Information",
        unreadCount: 2,
      },
      {
        id: "placement",
        name: "job-placement",
        label: "Job Placement",
        icon: "💼",
        category: "Career",
        unreadCount: 25,
      },
      {
        id: "hostel",
        name: "hostel-notices",
        label: "Hostel Notices",
        icon: "🏠",
        category: "Campus Life",
        unreadCount: 7,
      },
      {
        id: "tech-news",
        name: "tech-news",
        label: "Tech News",
        icon: "📱",
        category: "Tech News",
        unreadCount: 10,
      },
      {
        id: "hackathons",
        name: "hackathons",
        label: "Hackathons",
        icon: "🚀",
        category: "Opportunities",
        unreadCount: 7,
      },
      {
        id: "internships",
        name: "internships",
        label: "Internships",
        icon: "💼",
        category: "Opportunities",
        unreadCount: 15,
      },
      {
        id: "tech-events",
        name: "tech-events",
        label: "Tech Events",
        icon: "💻",
        category: "Tech News",
        unreadCount: 8,
      },
      {
        id: "tech",
        name: "tech-updates",
        label: "Tech Updates",
        icon: "�️",
        category: "Activities",
        unreadCount: 18,
      },
    ];

    const mockAnnouncements: Announcement[] = [
      {
        id: "1",
        title: "Mid-term Examination Schedule Released",
        description:
          "The mid-term examination schedule for all departments has been released. Please check your respective department notice boards for detailed timings. Make sure to prepare well and manage your time effectively.",
        category: "Exams",
        channel: "exams",
        date: "2024-01-20",
        createdBy: "Academic Office",
        isPinned: true,
        priority: "high",
        views: 1247,
        isNew: false,
      },
      {
        id: "2",
        title: "Annual Sports Meet 2024 - Registration Open!",
        description:
          "Join us for the Annual Sports Meet happening next month. Registration is now open for all events including athletics, basketball, football, cricket, and swimming. Prizes worth ₹50,000 to be won!",
        category: "Sports",
        channel: "sports",
        date: "2024-01-18",
        createdBy: "Sports Committee",
        priority: "medium",
        views: 892,
        isNew: true,
      },
      {
        id: "3",
        title: "Library Holiday Hours & New Digital Resources",
        description:
          "The library will have reduced hours during the upcoming holiday period. Please plan your study schedules accordingly. We have also added new digital resources and e-books to our collection.",
        category: "Holidays",
        channel: "library",
        date: "2024-01-15",
        createdBy: "Library Administration",
        priority: "low",
        views: 456,
        isNew: false,
      },
      {
        id: "4",
        title: "Tech Fest 2024 - Innovation Unleashed",
        description:
          "Get ready for the biggest tech event of the year! Participate in coding competitions, hackathons, robotics challenges, and tech talks by industry experts. Registration starts tomorrow.",
        category: "Events",
        channel: "events",
        date: "2024-01-22",
        createdBy: "Tech Committee",
        isPinned: true,
        priority: "high",
        views: 2156,
        isNew: true,
      },
      {
        id: "5",
        title: "New Academic Calendar Released",
        description:
          "The academic calendar for the upcoming semester has been published. Important dates include course registration, add/drop deadlines, and examination periods.",
        category: "Academic",
        channel: "academic",
        date: "2024-01-17",
        createdBy: "Academic Office",
        priority: "medium",
        views: 1834,
        isNew: false,
      },
      {
        id: "6",
        title: "Campus Placement Drive - Tech Companies",
        description:
          "Major tech companies including Google, Microsoft, and Amazon will be visiting our campus for placement drives. Prepare your resumes and practice coding interviews.",
        category: "General",
        channel: "placement",
        date: "2024-01-19",
        createdBy: "Placement Cell",
        priority: "high",
        views: 3245,
        isNew: true,
      },
      {
        id: "7",
        title: "Hostel Mess Menu Updated",
        description:
          "New vegetarian and non-vegetarian options have been added to the hostel mess menu. Special dietary requirements can be requested at the mess office.",
        category: "General",
        channel: "hostel",
        date: "2024-01-16",
        createdBy: "Hostel Administration",
        priority: "low",
        views: 567,
        isNew: false,
      },
    ];

    setChannels(mockChannels);
    setAnnouncements(mockAnnouncements);
    setFilteredAnnouncements(mockAnnouncements);
  }, []);

  // Filter announcements
  useEffect(() => {
    let filtered = announcements;

    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (announcement) => announcement.category === selectedCategory
      );
    }

    if (selectedChannel !== "all") {
      filtered = filtered.filter(
        (announcement) => announcement.channel === selectedChannel
      );
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, selectedCategory, selectedChannel]);

  const handleCreateAnnouncement = () => {
    if (!title || !description || !category || !channel) {
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
      channel,
      date: new Date().toISOString().split("T")[0],
      createdBy: user?.name || "Admin",
      isNew: true,
      views: 0,
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    // Update unread count for the channel
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channel ? { ...ch, unreadCount: ch.unreadCount + 1 } : ch
      )
    );

    setTitle("");
    setDescription("");
    setCategory("");
    setChannel("");
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: "Announcement created successfully.",
    });
  };

  const handleCreateChannel = () => {
    if (!channelName || !channelLabel || !channelIcon || !channelCategory) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
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

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const getChannelsByCategory = () => {
    const channelCategories = [...new Set(channels.map((ch) => ch.category))];
    return channelCategories.map((category) => ({
      category,
      channels: channels.filter((ch) => ch.category === category),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
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
                    <span className="font-bold">
                      {filteredAnnouncements.length}
                    </span>
                    <span>Showing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {filteredAnnouncements
                        .reduce((acc, ann) => acc + (ann.views || 0), 0)
                        .toLocaleString()}
                    </span>
                    <span>Total Views</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Pin className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">
                      {
                        filteredAnnouncements.filter((ann) => ann.isPinned)
                          .length
                      }
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
                          Title
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
                        <Label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="py-2"
                              >
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
                        <Label
                          htmlFor="channel"
                          className="text-sm font-medium"
                        >
                          Channel
                        </Label>
                        <Select value={channel} onValueChange={setChannel}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose a channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {channels.map((ch) => (
                              <SelectItem
                                key={ch.id}
                                value={ch.id}
                                className="py-2"
                              >
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
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide detailed information..."
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateAnnouncement}
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        Publish Announcement
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search announcements, keywords, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full lg:w-56 h-12 border-gray-200">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Announcements Grid */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              {filteredAnnouncements.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                    <CardContent className="text-center py-16">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No announcements found
                          </h3>
                          <p className="text-gray-500">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                filteredAnnouncements
                  .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                  .map((announcement, index) => {
                    const config = getCategoryConfig(announcement.category);
                    return (
                      <motion.div
                        key={announcement.id}
                        variants={itemVariants}
                        whileHover={{
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Card
                          className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${config.bgGradient} border-l-4 ${config.accentColor} overflow-hidden backdrop-blur-sm`}
                        >
                          {/* Card Header */}
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                {/* Badges Row */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {announcement.isPinned && (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
                                      <Pin className="h-3 w-3 mr-1" />
                                      Pinned
                                    </Badge>
                                  )}
                                  {announcement.isNew && (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
                                      ✨ New
                                    </Badge>
                                  )}
                                  <Badge
                                    className={`${config.color} font-medium`}
                                  >
                                    {config.icon} {announcement.category}
                                  </Badge>
                                  {announcement.priority && (
                                    <Badge
                                      className={`${getPriorityColor(
                                        announcement.priority
                                      )} text-xs`}
                                    >
                                      {announcement.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>

                                {/* Title */}
                                <CardTitle className="text-xl font-bold text-gray-900 leading-tight hover:text-blue-700 transition-colors">
                                  {announcement.title}
                                </CardTitle>

                                {/* Meta Information */}
                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(announcement.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{announcement.createdBy}</span>
                                  </div>
                                  {announcement.views && (
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      <span>
                                        {formatViews(announcement.views)} views
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Hash className="h-4 w-4" />
                                    <span>
                                      {
                                        channels.find(
                                          (ch) => ch.id === announcement.channel
                                        )?.name
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          {/* Card Content */}
                          <CardContent className="pt-0">
                            <div className="prose prose-gray max-w-none mb-6">
                              <p className="text-gray-700 leading-relaxed text-base">
                                {announcement.description}
                              </p>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Comment
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <Bell className="h-4 w-4 mr-1" />
                                  Follow
                                </Button>
                              </div>
                              <div className="text-xs text-gray-500">
                                {announcement.isNew
                                  ? "Just posted"
                                  : `${
                                      Math.floor(Math.random() * 5) + 1
                                    } days ago`}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
              )}
            </AnimatePresence>
          </motion.div>

          {/* Tech News & Opportunities Feed Section */}
          <motion.div
            className="mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-1.5 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Tech News & Opportunities Feed</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest tech news, hackathons, internships, and opportunities to keep yourself competitive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Tech News Section */}
              <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Tech News</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAnnouncements
                      .filter(a => a.category === "Tech News")
                      .slice(0, 3)
                      .map(announcement => (
                        <div key={announcement.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="text-xl">{getIconForCategory("Tech News")}</div>
                          <div>
                            <h4 className="font-medium">{announcement.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{announcement.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(announcement.date)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {filteredAnnouncements.filter(a => a.category === "Tech News").length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No tech news available at the moment.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities Section */}
              <Card className="overflow-hidden border-none bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-lg">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAnnouncements
                      .filter(a => a.category === "Opportunities")
                      .slice(0, 3)
                      .map(announcement => (
                        <div key={announcement.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="text-xl">{getIconForCategory("Opportunities")}</div>
                          <div>
                            <h4 className="font-medium">{announcement.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{announcement.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(announcement.date)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    {filteredAnnouncements.filter(a => a.category === "Opportunities").length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No opportunities available at the moment.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}