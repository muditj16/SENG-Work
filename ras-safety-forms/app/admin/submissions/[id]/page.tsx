'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, User, SafetySubmissionWithDetails, SubmissionPhoto } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export default function SubmissionDetail() {
  const [user, setUser] = useState<User | null>(null);
  const [submission, setSubmission] = useState<SafetySubmissionWithDetails | null>(null);
  const [photos, setPhotos] = useState<SubmissionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadSubmission();
  };

  const loadSubmission = async () => {
    setLoading(true);
    
    const { data: submissionData, error: submissionError } = await supabase
      .from('safety_submissions')
      .select(`
        *,
        users(full_name, email),
        job_sites(site_name, location)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      console.error('Error loading submission:', submissionError);
      setLoading(false);
      return;
    }

    setSubmission(submissionData as any);

    const { data: photosData, error: photosError } = await supabase
      .from('submission_photos')
      .select('*')
      .eq('submission_id', submissionId);

    if (!photosError && photosData) {
      setPhotos(photosData);
    }

    setLoading(false);
  };

  const markAsReviewed = async () => {
    const { error } = await supabase
      .from('safety_submissions')
      .update({ status: 'reviewed' })
      .eq('id', submissionId);

    if (!error) {
      loadSubmission();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Not Found</h2>
          <Link href="/admin/dashboard" className="text-green-700 hover:text-green-600">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="mr-4 hover:text-green-200">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Safety Submission Details</h1>
              <p className="text-sm text-blue-200">Submitted by {(submission as any).users?.full_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Submission Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Information</h2>
              <p className="text-gray-600">
                Submitted on {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
            {submission.status !== 'reviewed' && (
              <button
                onClick={markAsReviewed}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Reviewed
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Worker</h3>
              <p className="text-lg font-semibold text-gray-900">{(submission as any).users?.full_name}</p>
              <p className="text-sm text-gray-600">{(submission as any).users?.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Job Site</h3>
              <p className="text-lg font-semibold text-gray-900">{(submission as any).job_sites?.site_name}</p>
              {(submission as any).job_sites?.location && (
                <p className="text-sm text-gray-600">{(submission as any).job_sites?.location}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Submission Date</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(submission.submission_date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                submission.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {submission.status}
              </span>
            </div>
          </div>
        </div>

        {/* Safety Checklist */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Checklist</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                submission.ppe_worn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {submission.ppe_worn ? '✓' : '✗'}
              </div>
              <span className="text-gray-700 font-medium">All required PPE worn</span>
            </div>

            <div className="ml-9 space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-sm ${
                  submission.hard_hat ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {submission.hard_hat ? '✓' : '✗'}
                </div>
                <span className="text-gray-600">Hard hat</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-sm ${
                  submission.safety_vest ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {submission.safety_vest ? '✓' : '✗'}
                </div>
                <span className="text-gray-600">Safety vest</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-sm ${
                  submission.steel_toe_boots ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {submission.steel_toe_boots ? '✓' : '✗'}
                </div>
                <span className="text-gray-600">Steel toe boots</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center text-sm ${
                  submission.eye_protection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {submission.eye_protection ? '✓' : '✗'}
                </div>
                <span className="text-gray-600">Eye protection</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                submission.fall_protection_in_place ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {submission.fall_protection_in_place ? '✓' : '✗'}
              </div>
              <span className="text-gray-700 font-medium">Fall protection in place</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                submission.ladders_inspected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {submission.ladders_inspected ? '✓' : '✗'}
              </div>
              <span className="text-gray-700 font-medium">Ladders/scaffolding inspected</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                submission.tools_in_good_condition ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {submission.tools_in_good_condition ? '✓' : '✗'}
              </div>
              <span className="text-gray-700 font-medium">Tools and cords in good condition</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                submission.hazards_identified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {submission.hazards_identified ? '✓' : '✗'}
              </div>
              <span className="text-gray-700 font-medium">Hazards identified and addressed</span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {submission.notes && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{submission.notes}</p>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos ({photos.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <img
                    src={photo.photo_url}
                    alt={photo.file_name}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600 truncate">{photo.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {photo.file_size ? `${(photo.file_size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-500 text-center py-8">No photos attached to this submission</p>
          </div>
        )}
      </main>
    </div>
  );
}
