import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { authenticatePasskey } from '../lib/passkey-utils';

interface PasskeyRecord {
  userId: string;
  username: string;
  credentialId: string;
  transports: string[];
  deviceName: string;
  createdAt: string;
}

interface AuthenticationData {
  credentialId: string;
  challenge: string;
  authenticatorData: string;
  signature: string;
}

export function PasskeyAuthentication() {
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPasskeys, setLoadingPasskeys] = useState(true);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState<AuthenticationData | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    try {
      const storedPasskeys = JSON.parse(localStorage.getItem('passkeys') || '[]');
      setPasskeys(storedPasskeys);
    } catch (err: any) {
      console.error('Error loading passkeys:', err);
    } finally {
      setLoadingPasskeys(false);
    }
  };

  const handleAuthenticate = async (credentialId: string) => {
    setError('');
    setSuccess(false);
    setAuthData(null);
    setLoading(true);

    try {
      const auth = await authenticatePasskey(credentialId);
      setAuthData(auth);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with passkey');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPasskeys) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Authenticate with Passkey</h2>
      </div>

      {passkeys.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No passkeys registered yet.</p>
          <p className="text-sm mt-2">Register a passkey above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Select a passkey to authenticate:
          </p>
          {passkeys.map((passkey, index) => (
            <button
              key={index}
              onClick={() => handleAuthenticate(passkey.credentialId)}
              disabled={loading}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{passkey.deviceName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Username: {passkey.username} • Created: {new Date(passkey.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <Shield className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && authData && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Authentication successful!</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Challenge (Random)</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {authData.challenge}
              </code>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Credential ID</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {authData.credentialId}
              </code>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Authenticator Data</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {authData.authenticatorData}
              </code>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Signature</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {authData.signature}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
