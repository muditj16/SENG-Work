'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, User, JobSite, SafetySubmissionWithDetails } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<SafetySubmissionWithDetails[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filter state
  const [filterSite, setFilterSite] = useState('');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Stats
  const [stats, setStats] = useState<{
    totalSubmissions: number;
    submissionsBySite: { [key: string]: number };
    todaySubmissions: number;
    workersWithoutSubmissionToday: string[];
  }>({
    totalSubmissions: 0,
    submissionsBySite: {},
    todaySubmissions: 0,
    workersWithoutSubmissionToday: []
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filterSite, filterWorker, filterDateFrom, filterDateTo]);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadSubmissions(),
      loadJobSites(),
      loadWorkers(),
      calculateStats()
    ]);
    setLoading(false);
  };

  const loadSubmissions = async () => {
    let query = supabase
      .from('safety_submissions')
      .select(`
        *,
        users(id, full_name, email),
        job_sites(id, site_name),
        submission_photos(count)
      `)
      .order('submission_date', { ascending: false });

    if (filterSite) {
      query = query.eq('job_site_id', filterSite);
    }
    if (filterWorker) {
      query = query.eq('user_id', filterWorker);
    }
    if (filterDateFrom) {
      query = query.gte('submission_date', filterDateFrom);
    }
    if (filterDateTo) {
      query = query.lte('submission_date', filterDateTo);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setSubmissions(data as any);
    }
  };

  const loadJobSites = async () => {
    const { data, error } = await supabase
      .from('job_sites')
      .select('*')
      .order('site_name');
    
    if (!error && data) {
      setJobSites(data);
    }
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'framer')
      .order('full_name');
    
    if (!error && data) {
      setWorkers(data);
    }
  };

  const calculateStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Total submissions
    const { count: total } = await supabase
      .from('safety_submissions')
      .select('*', { count: 'exact', head: true });

    // Today's submissions
    const { count: todayCount } = await supabase
      .from('safety_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('submission_date', today);

    // Submissions by site
    const { data: bySite } = await supabase
      .from('safety_submissions')
      .select('job_site_id, job_sites(site_name)');

    const submissionsBySite: { [key: string]: number } = {};
    if (bySite) {
      bySite.forEach((sub: any) => {
        const siteName = sub.job_sites?.site_name || 'Unknown';
        submissionsBySite[siteName] = (submissionsBySite[siteName] || 0) + 1;
      });
    }

    // Workers without submission today
    const { data: todaySubmitters } = await supabase
      .from('safety_submissions')
      .select('user_id')
      .eq('submission_date', today);

    const submitterIds = new Set(todaySubmitters?.map(s => s.user_id) || []);
    const workersWithoutSubmission = workers
      .filter(w => !submitterIds.has(w.id))
      .map(w => w.full_name);

    setStats({
      totalSubmissions: total || 0,
      submissionsBySite,
      todaySubmissions: todayCount || 0,
      workersWithoutSubmissionToday: workersWithoutSubmission
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const clearFilters = () => {
    setFilterSite('');
    setFilterWorker('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">RAS Safety Portal - Admin</h1>
              <p className="text-sm text-blue-200">Welcome, {user?.full_name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-green-700">{stats.totalSubmissions}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Submissions</h3>
            <p className="text-3xl font-bold text-green-600">{stats.todaySubmissions}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Job Sites</h3>
            <p className="text-3xl font-bold text-orange-600">{jobSites.filter(s => s.is_active).length}</p>
          </div>
        </div>

        {/* Submissions by Site */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissions by Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.submissionsBySite).map(([site, count]) => (
              <div key={site} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{site}</span>
                <span className="font-semibold text-green-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workers Without Submission Today */}
        {stats.workersWithoutSubmissionToday.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              ⚠️ Workers Without Submission Today ({stats.workersWithoutSubmissionToday.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.workersWithoutSubmissionToday.map(name => (
                <span key={name} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Submissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Site</label>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">All Sites</option>
                {jobSites.map(site => (
                  <option key={site.id} value={site.id}>{site.site_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
              <select
                value={filterWorker}
                onChange={(e) => setFilterWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">All Workers</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>
          </div>
          
          {(filterSite || filterWorker || filterDateFrom || filterDateTo) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm text-green-700 hover:text-green-600 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Submissions</h2>
          
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Worker</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Site</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Photos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission: any) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(submission.submission_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{submission.users?.full_name}</td>
                      <td className="py-3 px-4">{submission.job_sites?.site_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {submission.submission_photos?.[0]?.count || 0}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/submissions/${submission.id}`}
                          className="text-green-700 hover:text-green-600 font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
