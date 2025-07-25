import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Bell,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const quickStats = [
    { title: 'Active Announcements', value: '8', icon: Megaphone, color: 'text-primary' },
    { title: 'Lost Items', value: '3', icon: Search, color: 'text-warning' },
    { title: 'Classes Today', value: '5', icon: Calendar, color: 'text-success' },
    { title: 'Open Complaints', value: '2', icon: MessageSquare, color: 'text-destructive' },
  ];

  const recentActivity = [
    { title: 'New announcement: Mid-term exam schedule', time: '2 hours ago', type: 'announcement' },
    { title: 'Lost item reported: iPhone 13', time: '4 hours ago', type: 'lost' },
    { title: 'Complaint resolved: WiFi connectivity', time: '1 day ago', type: 'complaint' },
    { title: 'Class added to schedule: Advanced Physics', time: '2 days ago', type: 'schedule' },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening on campus today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access frequently used features
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/announcements">
                <Megaphone className="mr-2 h-4 w-4" />
                View Announcements
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/lost-found">
                <Search className="mr-2 h-4 w-4" />
                Report Lost Item
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/timetable">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Schedule
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/complaints">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Complaint
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'admin' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Admin Panel
            </CardTitle>
            <CardDescription>
              Administrative tools and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="justify-start">
              <Link to="/announcements">
                <TrendingUp className="mr-2 h-4 w-4" />
                Manage Announcements
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link to="/complaints">
                <MessageSquare className="mr-2 h-4 w-4" />
                Review Complaints
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}