import { PasskeyRegistration } from './components/PasskeyRegistration';
import { PasskeyAuthentication } from './components/PasskeyAuthentication';
import { Fingerprint } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Fingerprint className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            WebAuthn Passkey Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience passwordless authentication using the Web Authentication API.
            Register a passkey and see the public key and challenge in action.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <PasskeyRegistration />
          <PasskeyAuthentication />
        </div>

        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Demo</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              This application demonstrates the <strong>Web Authentication API (WebAuthn)</strong>,
              a modern standard for passwordless authentication using passkeys.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Passkeys</strong> use public-key cryptography for secure authentication
              </li>
              <li>
                Each authentication generates a <strong>random challenge</strong> to prevent replay attacks
              </li>
              <li>
                The <strong>public key</strong> is stored locally and used to verify signatures
              </li>
              <li>
                Your private key never leaves your device, ensuring maximum security
              </li>
              <li>
                Supports platform authenticators like Touch ID, Face ID, and Windows Hello
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              All passkey data is stored locally in your browser for this demo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
