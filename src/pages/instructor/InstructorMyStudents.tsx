import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Download, Loader2, Mail, Phone, BookOpen, RefreshCw } from 'lucide-react';

type AssignedStudentRow = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isBlocked: boolean;
  enrolledCourses: number;
  courseNames: string;
  progressText: string;
  enrollments?: Array<{ title: string; percent: number; enrolledAt: string; completedAt: string | null }>;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function downloadAssignedStudentsExcel(): Promise<number> {
  const res = await api.get('/student-instructors/my-students');
  if (!res.ok) throw new Error('Export failed');
  const rows: AssignedStudentRow[] = await res.json();
  const headers = [
    'S.No',
    'Name',
    'Email',
    'Phone',
    'Joined',
    'Status',
    'Courses Enrolled',
    'Course Names',
    'Progress',
  ];
  const csvRows = rows.map((s, idx) => [
    String(idx + 1),
    escapeCsvCell(s.fullName || ''),
    escapeCsvCell(s.email),
    escapeCsvCell(s.phoneNumber || ''),
    escapeCsvCell(
      new Date(s.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    ),
    s.isBlocked ? 'Blocked' : 'Active',
    String(s.enrolledCourses),
    escapeCsvCell(s.courseNames || ''),
    escapeCsvCell(s.progressText || ''),
  ]);
  const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return rows.length;
}

const InstructorMyStudents: React.FC = () => {
  const [list, setList] = useState<AssignedStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student-instructors/my-students');
      if (res.ok) {
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assigned students',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load assigned students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExport = async () => {
    try {
      setDownloading(true);
      const count = await downloadAssignedStudentsExcel();
      toast({
        title: 'Downloaded',
        description: `${count} student(s) exported. Open in Excel or Sheets.`,
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not download list. Try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Assigned Students</h1>
          <p className="text-muted-foreground">
            Students assigned to you. View contact details, enrolled courses, and progress. Download as Excel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudents}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={downloading || list.length === 0}>
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Excel
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No students assigned yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When an admin assigns students to you, they will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell className="font-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{row.fullName || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      {row.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      {row.phoneNumber || '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      {row.enrolledCourses}
                      {row.courseNames ? (
                        <span className="text-muted-foreground truncate max-w-[180px]" title={row.courseNames}>
                          — {row.courseNames}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[220px]">
                    <span className="text-muted-foreground whitespace-pre-wrap line-clamp-2" title={row.progressText}>
                      {row.progressText || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {row.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default InstructorMyStudents;
