import { useState } from 'react';
import { Key, Loader2 } from 'lucide-react';
import { registerPasskey } from '../lib/passkey-utils';

interface PasskeyData {
  credentialId: string;
  publicKey: string;
  challenge: string;
  transports: string[];
}

export function PasskeyRegistration() {
  const [username, setUsername] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passkeyData, setPasskeyData] = useState<PasskeyData | null>(null);
  const [success, setSuccess] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, Passkeys!');
  const [encryptedMessage, setEncryptedMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setPasskeyData(null);
    setLoading(true);

    try {
      console.log('[PasskeyRegistration] Starting registration for username:', username);
      
      // Generate a user ID for this username
      const userId = crypto.randomUUID();
      console.log('[PasskeyRegistration] Generated user ID:', userId);

      console.log('[PasskeyRegistration] Registering passkey with WebAuthn...');
      const passkey = await registerPasskey(username, userId);
      console.log('[PasskeyRegistration] Passkey created:', {
        credentialId: passkey.credentialId.substring(0, 20) + '...',
        transports: passkey.transports
      });
      setPasskeyData(passkey);

      console.log('[PasskeyRegistration] Saving passkey to localStorage...');
      // Store passkey in localStorage (WITHOUT public key for security)
      const storedPasskeys = JSON.parse(localStorage.getItem('passkeys') || '[]');
      storedPasskeys.push({
        userId,
        username,
        credentialId: passkey.credentialId,
        transports: passkey.transports,
        deviceName: deviceName || 'Passkey Device',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('passkeys', JSON.stringify(storedPasskeys));

      console.log('[PasskeyRegistration] Registration completed successfully!');
      setSuccess(true);
    } catch (err: any) {
      console.error('[PasskeyRegistration] Registration failed:', err);
      console.error('[PasskeyRegistration] Error stack:', err.stack);
      setError(err.message || 'Failed to register passkey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Key className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Register Passkey</h2>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Name (Optional)
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., My Laptop"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Passkey'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && passkeyData && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Passkey registered successfully!</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Challenge (Random)</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {passkeyData.challenge}
              </code>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Public Key</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {passkeyData.publicKey}
              </code>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Credential ID</h3>
              <code className="text-xs text-gray-600 break-all block bg-white p-2 rounded border border-gray-200">
                {passkeyData.credentialId}
              </code>
            </div>

            {passkeyData.transports.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Supported Transports</h3>
                <div className="flex flex-wrap gap-2">
                  {passkeyData.transports.map((transport) => (
                    <span
                      key={transport}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {transport}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Encryption/Decryption Demo */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">🔐 Encryption Demo</h3>
            <p className="text-sm text-purple-700 mb-4">
              This demonstrates a simple encryption using the public key data. WebAuthn keys are typically used for authentication signatures rather than encryption. This is just a demo of how the public key data can be used.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Message to Encrypt
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a message..."
                />
              </div>

              <button
                onClick={async () => {
                  try {
                    // Convert public key from base64url to ArrayBuffer
                    const publicKeyData = Uint8Array.from(atob(passkeyData.publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
                    
                    // Try to determine the key type and import accordingly
                    let publicKey;
                    try {
                      // First try ECDSA (most common for WebAuthn)
                      publicKey = await crypto.subtle.importKey(
                        'spki',
                        publicKeyData,
                        {
                          name: 'ECDSA',
                          namedCurve: 'P-256',
                        },
                        false,
                        ['verify']
                      );
                    } catch (ecdsaError) {
                      // If ECDSA fails, try RSA
                      publicKey = await crypto.subtle.importKey(
                        'spki',
                        publicKeyData,
                        {
                          name: 'RSA-OAEP',
                          hash: 'SHA-256',
                        },
                        false,
                        ['encrypt']
                      );
                    }

                    // For demonstration purposes, we'll create a simple hash-based "encryption"
                    // since ECDSA keys can't be used for encryption directly
                    const encoder = new TextEncoder();
                    const messageData = encoder.encode(testMessage);
                    const publicKeyHash = await crypto.subtle.digest('SHA-256', publicKeyData);
                    
                    // Create a simple XOR-based demonstration
                    const keyBytes = new Uint8Array(publicKeyHash.slice(0, 16)); // Use first 16 bytes
                    const encrypted = new Uint8Array(messageData.length);
                    for (let i = 0; i < messageData.length; i++) {
                      encrypted[i] = messageData[i] ^ keyBytes[i % keyBytes.length];
                    }

                    // Convert to base64 for display
                    const encryptedBase64 = btoa(String.fromCharCode(...encrypted));
                    setEncryptedMessage(encryptedBase64);
                  } catch (err: any) {
                    console.error('Encryption error:', err);
                    setError('Encryption failed: ' + err.message);
                  }
                }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔒 Encrypt Message
              </button>

              {encryptedMessage && (
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Encrypted Result
                  </label>
                  <code className="block text-xs text-purple-700 bg-white p-3 rounded border border-purple-300 break-all">
                    {encryptedMessage}
                  </code>
                  <p className="text-xs text-purple-600 mt-2">
                    ✓ Data encrypted using public key data. This is a demonstration - WebAuthn keys are primarily used for authentication signatures.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
