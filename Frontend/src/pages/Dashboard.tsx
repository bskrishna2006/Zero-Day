import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Bell,
  Clock,
  ArrowRight,
  Activity,
  BookOpen,
  GraduationCap,
  MapPin,
  Zap,
  Star,
  ChevronRight,
  BarChart3,
  Target,
  Award,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  Coffee,
  Wifi,
  Battery,
  Signal,
  Code,
  Palette,
  Globe,
  Music
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const quickStats = [
    { 
      title: 'Active Announcements', 
      value: '8', 
      change: '+2 from yesterday',
      icon: Megaphone, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: 'up'
    },
    { 
      title: 'Lost Items', 
      value: '3', 
      change: '-1 from yesterday',
      icon: Search, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      trend: 'down'
    },
    { 
      title: 'Classes Today', 
      value: '5', 
      change: 'Normal schedule',
      icon: Calendar, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: 'neutral'
    },
    { 
      title: 'Open Complaints', 
      value: '2', 
      change: 'Resolved 3 today',
      icon: MessageSquare, 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      trend: 'down'
    },
  ];

  const recentActivity = [
    { 
      title: 'New announcement: Mid-term exam schedule', 
      time: '2 hours ago', 
      type: 'announcement',
      icon: Megaphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Lost item reported: iPhone 13', 
      time: '4 hours ago', 
      type: 'lost',
      icon: Search,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    { 
      title: 'Complaint resolved: WiFi connectivity', 
      time: '1 day ago', 
      type: 'complaint',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      title: 'Class added to schedule: Advanced Physics', 
      time: '2 days ago', 
      type: 'schedule',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
  ];

  const upcomingEvents = [
    { title: 'Physics Lab', time: '10:00 AM', location: 'Lab 204', type: 'class' },
    { title: 'Student Council Meeting', time: '2:00 PM', location: 'Conference Room', type: 'meeting' },
    { title: 'Library Workshop', time: '4:00 PM', location: 'Main Library', type: 'workshop' },
  ];

  const campusStatus = [
    { name: 'WiFi Network', status: 'excellent', value: 98 },
    { name: 'Cafeteria Queue', status: 'moderate', value: 65 },
    { name: 'Library Occupancy', status: 'low', value: 32 },
    { name: 'Parking Availability', status: 'good', value: 78 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening on campus today
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Sun className="h-3 w-3 mr-1" />
                  Good Morning
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Calendar className="h-3 w-3 mr-1" />
                  Friday, July 25
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <Avatar className="h-20 w-20 border-4 border-white/30">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl bg-white/20 text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5"></div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${stat.borderColor} ${stat.bgColor} hover:scale-105`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  {getTrendIcon(stat.trend)}
                </div>
                <p className="text-xs text-gray-600 mt-1 flex items-center">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Access frequently used features
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors group">
                <Link to="/announcements">
                  <Megaphone className="mr-3 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  View Announcements
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start hover:bg-amber-50 hover:border-amber-300 transition-colors group">
                <Link to="/lost-found">
                  <Search className="mr-3 h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  Report Lost Item
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start hover:bg-green-50 hover:border-green-300 transition-colors group">
                <Link to="/timetable">
                  <Calendar className="mr-3 h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                  Manage Schedule
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start hover:bg-red-50 hover:border-red-300 transition-colors group">
                <Link to="/complaints">
                  <MessageSquare className="mr-3 h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
                  Submit Complaint
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from campus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-full ${activity.bgColor}`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </motion.div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="ghost" className="w-full justify-center">
                <Eye className="mr-2 h-4 w-4" />
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* New: Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-green-500" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                Your upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {event.time}
                        <MapPin className="ml-2 mr-1 h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>



      {/* New: Campus Status Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
              Campus Status
            </CardTitle>
            <CardDescription>
              Real-time campus facility status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {campusStatus.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <Progress value={item.value} className="h-2" />
                  <p className="text-xs text-gray-600">{item.value}% capacity</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Admin Panel */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-purple-600" />
                Admin Dashboard
                <Sparkles className="ml-2 h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>
                Administrative tools and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button asChild className="justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link to="/announcements">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Manage Announcements
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start hover:bg-purple-100">
                <Link to="/complaints">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Review Complaints
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start hover:bg-purple-50">
                <Link to="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start hover:bg-purple-50">
                <Link to="/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}