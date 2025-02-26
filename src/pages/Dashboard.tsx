import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Clock, Users, GraduationCap, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/themeStore';

interface DashboardStats {
  activeAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  totalStudents?: number;
  pendingGrading?: number;
}

const DashboardCard = ({ title, value, icon: Icon, subtitle = '' }: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType;
  subtitle?: string;
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
    } rounded-xl shadow-sm p-6 border ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${
          isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'
        } flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`} />
        </div>
        <div>
          <h3 className={`text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</h3>
          <p className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{value}</p>
          {subtitle && (
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<DashboardStats>({
    activeAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0,
    totalStudents: 0,
    pendingGrading: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        const now = new Date().toISOString();

        // Get active assignments (not past due)
        const { data: activeAssignments, error: activeError } = await supabase
          .from('assignments')
          .select('id')
          .gt('due_date', now);

        if (activeError) throw activeError;

        // Get total unique students who have submitted work
        const { data: uniqueStudents, error: studentsError } = await supabase
          .from('submissions')
          .select('student_id')
          .not('student_id', 'is', null);

        if (studentsError) throw studentsError;

        // Get submissions that need grading
        const { data: pendingGrading, error: pendingError } = await supabase
          .from('submissions')
          .select('id')
          .is('grade', null);

        if (pendingError) throw pendingError;

        // Get average grade for all graded submissions
        const { data: grades, error: gradesError } = await supabase
          .from('submissions')
          .select('grade')
          .not('grade', 'is', null);

        if (gradesError) throw gradesError;

        // Calculate average grade
        const validGrades = grades?.filter(g => g.grade !== null) || [];
        const averageGrade = validGrades.length 
          ? validGrades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / validGrades.length 
          : 0;

        // Get unique student count
        const uniqueStudentIds = new Set(uniqueStudents?.map(s => s.student_id));

        setStats({
          activeAssignments: activeAssignments?.length || 0,
          completedAssignments: validGrades.length,
          averageGrade,
          totalStudents: uniqueStudentIds.size,
          pendingGrading: pendingGrading?.length || 0
        });
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        // Set default values in case of error
        setStats({
          activeAssignments: 0,
          completedAssignments: 0,
          averageGrade: 0,
          totalStudents: 0,
          pendingGrading: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
          } rounded-xl shadow-sm p-6 border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } animate-pulse`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div className="flex-1">
                <div className={`h-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } rounded w-24 mb-2`} />
                <div className={`h-6 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } rounded w-16`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Active Assignments"
          value={stats.activeAssignments}
          icon={BookOpen}
        />
        <DashboardCard
          title="Pending Grading"
          value={stats.pendingGrading || 0}
          icon={Clock}
        />
        <DashboardCard
          title="Active Students"
          value={stats.totalStudents || 0}
          icon={Users}
        />
      </div>

      <div className="mt-8">
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        } mb-4`}>Class Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard
            title="Completed Assignments"
            value={stats.completedAssignments}
            icon={GraduationCap}
          />
          <DashboardCard
            title="Average Grade"
            value={`${stats.averageGrade.toFixed(1)}%`}
            icon={Star}
            subtitle={`Across ${stats.completedAssignments} submissions`}
          />
        </div>
      </div>
    </>
  );
};

const StudentDashboard = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<DashboardStats>({
    activeAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!user) return;

      try {
        const now = new Date().toISOString();

        // Get all active assignments
        const { data: allActiveAssignments, error: activeError } = await supabase
          .from('assignments')
          .select('id')
          .gt('due_date', now);

        if (activeError) throw activeError;

        // Get the student's submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('submissions')
          .select('assignment_id, grade')
          .eq('student_id', user.id);

        if (submissionsError) throw submissionsError;

        // Calculate active assignments (not submitted)
        const submittedAssignmentIds = submissions?.map(s => s.assignment_id) || [];
        const activeAssignments = allActiveAssignments?.filter(
          a => !submittedAssignmentIds.includes(a.id)
        ) || [];

        // Get completed assignments with grades
        const completedSubmissions = submissions?.filter(s => s.grade !== null) || [];

        // Calculate average grade
        const averageGrade = completedSubmissions.length
          ? completedSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0) / completedSubmissions.length
          : 0;

        setStats({
          activeAssignments: activeAssignments.length,
          completedAssignments: completedSubmissions.length,
          averageGrade
        });
      } catch (error) {
        console.error('Error fetching student stats:', error);
        setStats({
          activeAssignments: 0,
          completedAssignments: 0,
          averageGrade: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
          } rounded-xl shadow-sm p-6 border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } animate-pulse`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div className="flex-1">
                <div className={`h-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } rounded w-24 mb-2`} />
                <div className={`h-6 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                } rounded w-16`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Active Assignments"
          value={stats.activeAssignments}
          icon={BookOpen}
          subtitle="Need to complete"
        />
        <DashboardCard
          title="Completed Assignments"
          value={stats.completedAssignments}
          icon={GraduationCap}
          subtitle="Graded submissions"
        />
        <DashboardCard
          title="Average Grade"
          value={`${stats.averageGrade.toFixed(1)}%`}
          icon={Star}
          subtitle={`Across ${stats.completedAssignments} assignments`}
        />
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div>
      <h1 className={`text-2xl font-bold ${
        isDark ? 'text-white' : 'text-gray-900'
      } mb-2`}>
        Welcome back, {user?.full_name}!
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
        {user?.role === 'teacher' 
          ? "Here's an overview of your class assignments and student progress."
          : "Here's an overview of your assignments and progress."
        }
      </p>

      <div className="mt-8">
        {user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;