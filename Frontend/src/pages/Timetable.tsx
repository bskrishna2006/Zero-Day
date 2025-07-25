import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClassSchedule {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
  color: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const colors = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
];

export default function Timetable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  // Mock data
  useEffect(() => {
    const mockSchedule: ClassSchedule[] = [
      {
        id: '1',
        subject: 'Advanced Mathematics',
        day: 'Monday',
        startTime: '9:00',
        endTime: '10:30',
        location: 'Room A-101',
        color: colors[0]
      },
      {
        id: '2',
        subject: 'Physics Lab',
        day: 'Tuesday',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Physics Lab 1',
        color: colors[1]
      },
      {
        id: '3',
        subject: 'Computer Science',
        day: 'Wednesday',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Computer Lab',
        color: colors[2]
      }
    ];
    setSchedule(mockSchedule);
  }, []);

  const resetForm = () => {
    setSubject('');
    setDay('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setEditingClass(null);
  };

  const handleAddClass = () => {
    if (!subject || !day || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const classData: ClassSchedule = {
      id: editingClass ? editingClass.id : Date.now().toString(),
      subject,
      day,
      startTime,
      endTime,
      location,
      color: editingClass ? editingClass.color : colors[schedule.length % colors.length]
    };

    if (editingClass) {
      setSchedule(prev => prev.map(cls => cls.id === editingClass.id ? classData : cls));
      toast({
        title: "Success",
        description: "Class updated successfully.",
      });
    } else {
      setSchedule(prev => [...prev, classData]);
      toast({
        title: "Success",
        description: "Class added successfully.",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditClass = (classItem: ClassSchedule) => {
    setEditingClass(classItem);
    setSubject(classItem.subject);
    setDay(classItem.day);
    setStartTime(classItem.startTime);
    setEndTime(classItem.endTime);
    setLocation(classItem.location || '');
    setIsDialogOpen(true);
  };

  const handleDeleteClass = (classId: string) => {
    setSchedule(prev => prev.filter(cls => cls.id !== classId));
    toast({
      title: "Success",
      description: "Class deleted successfully.",
    });
  };

  const getClassesForDayAndTime = (day: string, time: string) => {
    return schedule.filter(cls => {
      const classStartHour = parseInt(cls.startTime.split(':')[0]);
      const classEndHour = parseInt(cls.endTime.split(':')[0]);
      const currentHour = parseInt(time.split(':')[0]);
      
      return cls.day === day && currentHour >= classStartHour && currentHour < classEndHour;
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Manage your weekly class schedule</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </DialogTitle>
              <DialogDescription>
                {editingClass ? 'Update class details.' : 'Add a new class to your schedule.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter classroom or location"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddClass}>
                {editingClass ? 'Update Class' : 'Add Class'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Your classes for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[800px]">
              {/* Header */}
              <div className="font-semibold text-center p-3 bg-muted rounded-lg">Time</div>
              {days.map(day => (
                <div key={day} className="font-semibold text-center p-3 bg-muted rounded-lg">
                  {day}
                </div>
              ))}
              
              {/* Time slots */}
              {timeSlots.map(time => (
                <React.Fragment key={time}>
                  <div className="text-center p-3 border-r text-sm font-medium">
                    {time}
                  </div>
                  {days.map(day => {
                    const classes = getClassesForDayAndTime(day, time);
                    return (
                      <div key={`${day}-${time}`} className="p-1 min-h-[60px]">
                        {classes.map(cls => (
                          <div
                            key={cls.id}
                            className={`p-2 rounded-lg border-2 text-xs relative group ${cls.color}`}
                          >
                            <div className="font-medium">{cls.subject}</div>
                            <div className="flex items-center text-xs mt-1">
                              <Clock className="mr-1 h-3 w-3" />
                              {cls.startTime}-{cls.endTime}
                            </div>
                            {cls.location && (
                              <div className="text-xs">{cls.location}</div>
                            )}
                            
                            {/* Edit/Delete buttons */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditClass(cls)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteClass(cls.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Summary</CardTitle>
          <CardDescription>
            Overview of your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {schedule.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No classes scheduled. Add your first class to get started.
              </p>
            ) : (
              schedule.map(cls => (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={cls.color}>{cls.subject}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {cls.day} • {cls.startTime}-{cls.endTime}
                      {cls.location && ` • ${cls.location}`}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClass(cls)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}