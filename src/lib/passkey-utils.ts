export function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64urlDecode(base64url: string): ArrayBuffer {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function generateRandomChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export async function registerPasskey(username: string, userId: string) {
  const challenge = generateRandomChallenge();
  
  console.log('[passkey-utils] Creating credential with hostname:', window.location.hostname);
  console.log('[passkey-utils] Challenge:', challenge);
  console.log('[passkey-utils] User ID:', userId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: "Passkey Demo App",
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(userId),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },   // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
  };
  
  console.log('[passkey-utils] Options:', publicKeyCredentialCreationOptions);

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error("Failed to create credential");
    }

    console.log('[passkey-utils] Credential created successfully:', credential);

    const response = credential.response as AuthenticatorAttestationResponse;

    return {
      credentialId: base64urlEncode(credential.rawId),
      publicKey: base64urlEncode(response.getPublicKey()!),
      challenge: base64urlEncode(challenge),
      transports: response.getTransports ? response.getTransports() : [],
    };
  } catch (err) {
    console.error('[passkey-utils] Credential creation failed:', err);
    throw err;
  }
}

export async function authenticatePasskey(credentialId: string, customMessage?: string) {
  let challenge: Uint8Array;
  if (customMessage) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(customMessage);
    // Ensure challenge is at least 16 bytes for some strict authenticators
    if (encoded.length < 16) {
      challenge = new Uint8Array(16);
      challenge.set(encoded);
    } else {
      challenge = encoded;
    }
  } else {
    challenge = generateRandomChallenge();
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [{
      id: base64urlDecode(credentialId),
      type: 'public-key',
      transports: ['internal', 'hybrid'],
    }],
    timeout: 60000,
    userVerification: "required",
  };

  const credential = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error("Failed to get credential");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    credentialId: base64urlEncode(credential.rawId),
    challenge: base64urlEncode(challenge),
    clientDataJSON: base64urlEncode(response.clientDataJSON),
    authenticatorData: base64urlEncode(response.authenticatorData),
    signature: base64urlEncode(response.signature),
    userHandle: response.userHandle ? base64urlEncode(response.userHandle) : null,
  };
}
