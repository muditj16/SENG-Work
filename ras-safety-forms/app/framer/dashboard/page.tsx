'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, User, JobSite, SafetySubmission } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function FramerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [submissions, setSubmissions] = useState<SafetySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  // Form state
  const [jobSiteId, setJobSiteId] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [ppeWorn, setPpeWorn] = useState(false);
  const [hardHat, setHardHat] = useState(false);
  const [safetyVest, setSafetyVest] = useState(false);
  const [steelToeBoots, setSteelToeBoots] = useState(false);
  const [eyeProtection, setEyeProtection] = useState(false);
  const [fallProtection, setFallProtection] = useState(false);
  const [laddersInspected, setLaddersInspected] = useState(false);
  const [toolsGoodCondition, setToolsGoodCondition] = useState(false);
  const [hazardsIdentified, setHazardsIdentified] = useState(false);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    loadJobSites();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'framer') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadSubmissions(currentUser.id);
    setLoading(false);
  };

  const loadJobSites = async () => {
    const { data, error } = await supabase
      .from('job_sites')
      .select('*')
      .eq('is_active', true)
      .order('site_name');
    
    if (!error && data) {
      setJobSites(data);
    }
  };

  const loadSubmissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('safety_submissions')
      .select(`
        *,
        job_sites(site_name)
      `)
      .eq('user_id', userId)
      .order('submission_date', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setSubmissions(data as any);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });

      if (validFiles.length !== files.length) {
        setMessage({ type: 'error', text: 'Some files were rejected. Only images under 5MB are allowed.' });
      }

      setPhotos(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 photos
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jobSiteId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('safety_submissions')
        .insert({
          user_id: user.id,
          job_site_id: jobSiteId,
          submission_date: submissionDate,
          ppe_worn: ppeWorn,
          hard_hat: hardHat,
          safety_vest: safetyVest,
          steel_toe_boots: steelToeBoots,
          eye_protection: eyeProtection,
          fall_protection_in_place: fallProtection,
          ladders_inspected: laddersInspected,
          tools_in_good_condition: toolsGoodCondition,
          hazards_identified: hazardsIdentified,
          notes: notes || null,
          status: 'submitted'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Upload photos if any
      if (photos.length > 0 && submission) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${submission.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('safety-photos')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('safety-photos')
            .getPublicUrl(fileName);

          await supabase.from('submission_photos').insert({
            submission_id: submission.id,
            photo_url: publicUrl,
            file_name: photo.name,
            file_size: photo.size,
            photo_type: 'other'
          });
        }
      }

      setMessage({ type: 'success', text: 'Safety form submitted successfully!' });
      resetForm();
      setShowForm(false);
      loadSubmissions(user.id);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit form' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobSiteId('');
    setSubmissionDate(new Date().toISOString().split('T')[0]);
    setPpeWorn(false);
    setHardHat(false);
    setSafetyVest(false);
    setSteelToeBoots(false);
    setEyeProtection(false);
    setFallProtection(false);
    setLaddersInspected(false);
    setToolsGoodCondition(false);
    setHazardsIdentified(false);
    setNotes('');
    setPhotos([]);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
              <h1 className="text-2xl font-bold">RAS Safety Portal</h1>
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
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* New Submission Button */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              + New Safety Form
            </button>
          </div>
        )}

        {/* Safety Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Daily Safety Form</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Site *
                  </label>
                  <select
                    required
                    value={jobSiteId}
                    onChange={(e) => setJobSiteId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value="">Select a job site</option>
                    {jobSites.map(site => (
                      <option key={site.id} value={site.id}>{site.site_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Safety Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppeWorn}
                      onChange={(e) => setPpeWorn(e.target.checked)}
                      className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">All required PPE worn</span>
                  </label>

                  <div className="ml-8 space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hardHat}
                        onChange={(e) => setHardHat(e.target.checked)}
                        className="w-4 h-4 text-green-700 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-600 text-sm">Hard hat</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safetyVest}
                        onChange={(e) => setSafetyVest(e.target.checked)}
                        className="w-4 h-4 text-green-700 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-600 text-sm">Safety vest</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={steelToeBoots}
                        onChange={(e) => setSteelToeBoots(e.target.checked)}
                        className="w-4 h-4 text-green-700 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-600 text-sm">Steel toe boots</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eyeProtection}
                        onChange={(e) => setEyeProtection(e.target.checked)}
                        className="w-4 h-4 text-green-700 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-600 text-sm">Eye protection</span>
                    </label>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fallProtection}
                      onChange={(e) => setFallProtection(e.target.checked)}
                      className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Fall protection in place</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={laddersInspected}
                      onChange={(e) => setLaddersInspected(e.target.checked)}
                      className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Ladders/scaffolding inspected</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toolsGoodCondition}
                      onChange={(e) => setToolsGoodCondition(e.target.checked)}
                      className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Tools and cords in good condition</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hazardsIdentified}
                      onChange={(e) => setHazardsIdentified(e.target.checked)}
                      className="w-5 h-5 text-green-700 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Hazards identified and addressed</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any additional safety concerns or observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional, max 5 photos, 5MB each)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Safety Form'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Recent Submissions</h2>
          
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Site</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission: any) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(submission.submission_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{submission.job_sites?.site_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
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
