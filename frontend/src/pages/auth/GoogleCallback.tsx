import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '@/lib/auth/oauth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google login...');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Invalid callback parameters');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      const result = await handleOAuthCallback('google', code, state);

      if (result.success) {
        setStatus('success');
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setStatus('error');
        setMessage(result.error || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authenticating...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Success!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
