import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Megaphone, 
  Search, 
  Calendar, 
  MessageSquare,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    name: 'Lost & Found',
    href: '/lost-found',
    icon: Search,
  },
  {
    name: 'Timetable',
    href: '/timetable',
    icon: Calendar,
  },
  {
    name: 'Skill Exchange',
    href: '/skill-exchange',
    icon: BookOpen,
  },
  {
    name: 'Complaints',
    href: '/complaints',
    icon: MessageSquare,
  },
  {
    name: 'Campus AI',
    href: '/chat',
    icon: MessageCircle,
  },
];

export const Navigation = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-card border-b">
      <div className="container">
        <div className="flex space-x-8 overflow-x-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};