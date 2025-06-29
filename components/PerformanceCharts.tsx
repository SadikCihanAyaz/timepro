'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Clock, Calendar, PieChart as PieChartIcon } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  date: string;
  isRunning: boolean;
  editedDuration?: number;
}

interface PerformanceChartsProps {
  entries: TimeEntry[];
  projects: Project[];
}

export function PerformanceCharts({ entries, projects }: PerformanceChartsProps) {
  const dailyData = useMemo(() => {
    const data: { [key: string]: { date: string; hours: number; [key: string]: any } } = {};
    
    entries.forEach((entry) => {
      const date = entry.date;
      const hours = (entry.editedDuration || entry.duration) / 3600;
      
      if (!data[date]) {
        data[date] = { date, hours: 0 };
      }
      
      data[date].hours += hours;
      data[date][entry.projectName] = (data[date][entry.projectName] || 0) + hours;
    });
    
    return Object.values(data)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }, [entries]);

  const projectData = useMemo(() => {
    const data: { [key: string]: { name: string; hours: number; color: string; entries: number } } = {};
    
    entries.forEach((entry) => {
      const hours = (entry.editedDuration || entry.duration) / 3600;
      const project = projects.find(p => p.id === entry.projectId);
      
      if (!data[entry.projectName]) {
        data[entry.projectName] = {
          name: entry.projectName,
          hours: 0,
          color: project?.color || '#6B7280',
          entries: 0
        };
      }
      
      data[entry.projectName].hours += hours;
      data[entry.projectName].entries += 1;
    });
    
    return Object.values(data).sort((a, b) => b.hours - a.hours);
  }, [entries, projects]);

  const weeklyData = useMemo(() => {
    const weeklyMap: { [key: string]: number } = {};
    
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const weekKey = startOfWeek.toISOString().split('T')[0];
      
      const hours = (entry.editedDuration || entry.duration) / 3600;
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + hours;
    });
    
    return Object.entries(weeklyMap)
      .map(([week, hours]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: hours
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8); // Last 8 weeks
  }, [entries]);

  const totalHours = useMemo(() => {
    return entries.reduce((total, entry) => total + (entry.editedDuration || entry.duration), 0) / 3600;
  }, [entries]);

  const averageDailyHours = useMemo(() => {
    if (dailyData.length === 0) return 0;
    return dailyData.reduce((sum, day) => sum + day.hours, 0) / dailyData.length;
  }, [dailyData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Across {entries.length} entries
            </p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDailyHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Last {dailyData.length} days
            </p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectData.length}</div>
            <p className="text-xs text-muted-foreground">
              With time entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Chart */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Hours (Last 30 Days)
            </CardTitle>
            <CardDescription>Your daily productivity trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Time by Project
            </CardTitle>
            <CardDescription>Distribution of your time across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>Weekly Hours</CardTitle>
            <CardDescription>Your weekly productivity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Performance */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
            <CardDescription>Hours spent on each project</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="hours" 
                  fill="#F97316" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Summary Table */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>Detailed breakdown of time spent on each project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectData.map((project) => (
              <div key={project.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600">{project.entries} entries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{project.hours.toFixed(1)}h</p>
                  <p className="text-sm text-gray-600">
                    {((project.hours / totalHours) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}