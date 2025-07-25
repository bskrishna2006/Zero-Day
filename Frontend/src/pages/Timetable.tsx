import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast"; // Assuming this is imported and configured
import { Menu, CalendarDays, ListChecks } from "lucide-react";

// Helper function to get the current week's days and dates
function getCurrentWeek() {
  const today = new Date();
  const week = [];
  const dayIndex = today.getDay(); // Sunday = 0, Monday = 1, etc.

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayIndex + i); // Adjust to get Mon-Sun
    week.push({
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  }
  return week;
}

export default function TimetableWithTasks() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [currentDate, setCurrentDate] = useState(""); // State to hold current date

  // Initialize weekDays and current date on component mount
  useEffect(() => {
    setWeekDays(getCurrentWeek());
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Functions to manage schedule entries and tasks
  const addScheduleEntry = (entry) => {
    setSchedule((prev) => [...prev, entry]);
    // Note: To automatically close the dialog after adding,
    // you would typically control the Dialog's open prop with a state
    // in TimetableWithTasks and update it here. For simplicity,
    // we rely on the user manually closing it after the toast appears.
  };

  const addTask = (task) => {
    setTasks((prev) => [...prev, task]);
  };

  const markTaskDone = (taskId) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t))
    );

  // Define standard times for the timetable
  const times = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Overlay for all screen sizes when sidebar is open, allows clicking outside to close */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 p-4 shadow-xl z-50 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ backgroundColor: "#e0f7fa" }} // A light, calming blue for the sidebar
      >
        {/* Menu content now wrapped in a Card for box format */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <CalendarDays className="mr-2 h-4 w-4" /> Weekly Timetable
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ListChecks className="mr-2 h-4 w-4" /> Monthly Schedule
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ListChecks className="mr-2 h-4 w-4" /> Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="min-h-screen w-full">
        <header className="flex justify-between items-center p-4 shadow bg-white">
          {/* Menu button is always visible and controls sidebar state */}
          <Button variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">
            Student Scheduler{" "}
            <span className="text-sm text-gray-500 ml-2">{currentDate}</span>
          </h1>
        </header>

        {/* Timetable Grid Section */}
        <div className="p-4 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2 min-w-max">
                {/* Time Column Header with light green background and rounded corners */}
                <div className="py-2 bg-lime-100 text-center font-bold rounded-md">
                  Time
                </div>
                {/* Day headers with light green background and rounded corners (Days as Columns) */}
                {weekDays.map(({ day, date }) => (
                  <div
                    key={day}
                    className="py-2 bg-lime-100 font-bold text-center rounded-md"
                  >
                    {day}
                    <br />
                    <span className="text-sm text-gray-500">{date}</span>
                  </div>
                ))}
                {/* Time row headers and daily slots */}
                {times.map((time) => (
                  <React.Fragment key={time}>
                    {/* Time cell with light green background and rounded corners (Times as Rows) */}
                    <div className="py-2 bg-lime-100 font-bold text-center rounded-md">
                      {time}
                    </div>
                    {/* Individual day slots with rounded corners */}
                    {weekDays.map(({ day }) => {
                      const entry = schedule.find(
                        (s) => s.day === day && s.time === time
                      );
                      const task = tasks.find(
                        (t) =>
                          t.day === day && t.time === time && !t.isCompleted
                      );
                      return (
                        <div
                          key={day + time}
                          className="border p-2 min-h-[60px] relative rounded-md"
                        >
                          {entry && (
                            <div className="text-sm font-medium">
                              📘 {entry.subject}
                            </div>
                          )}
                          {task && (
                            <div className="text-xs mt-1">
                              ✅ {task.title}
                              <Button
                                size="sm"
                                className="mt-1 w-full"
                                onClick={() => markTaskDone(task.id)}
                              >
                                Mark Done
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Class Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <AddEntryDialog
                type="class"
                onSubmit={addScheduleEntry}
                weekDays={weekDays}
              />
            </DialogContent>
          </Dialog>

          {/* Add Task Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4 ml-2">
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddEntryDialog
                type="task"
                onSubmit={addTask}
                weekDays={weekDays}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

// Reusable dialog for adding either a class or a task
// Defined within the same file for easier single-file usage
function AddEntryDialog({ type, onSubmit, weekDays }) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const times = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const handleSubmit = () => {
    const id = Date.now().toString();
    if (!title || !day || !time) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields to add the entry.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      id,
      [type === "class" ? "subject" : "title"]: title,
      day,
      time,
      ...(type === "task" ? { isCompleted: false } : {}),
    });

    toast({
      title: type === "class" ? "Class Added" : "Task Added",
      description:
        title +
        " on " +
        day +
        " at " +
        time +
        " has been added to your schedule.",
    });

    setTitle("");
    setDay("");
    setTime("");
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">
        Add New {type === "class" ? "Class" : "Task"}
      </h3>
      <Input
        placeholder={
          type === "class"
            ? "Subject Name (e.g., Math)"
            : "Task Title (e.g., Complete Homework)"
        }
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Select onValueChange={setDay} value={day}>
        <SelectTrigger>
          <SelectValue placeholder="Select Day" />
        </SelectTrigger>
        <SelectContent>
          {weekDays.map(({ day }) => (
            <SelectItem key={day} value={day}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={setTime} value={time}>
        <SelectTrigger>
          <SelectValue placeholder="Select Time" />
        </SelectTrigger>
        <SelectContent>
          {times.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSubmit} className="w-full">
        Add {type === "class" ? "Class" : "Task"}
      </Button>
    </div>
  );
}