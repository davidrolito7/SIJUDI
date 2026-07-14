type Base64Input = string | ArrayBuffer | ArrayBufferView | null | undefined;
type WebAuthnHint = 'security-key' | 'client-device' | 'hybrid';

const VALID_TRANSPORTS: AuthenticatorTransport[] = [
  'ble',
  'hybrid',
  'internal',
  'nfc',
  'usb',
];

function isAuthenticatorTransport(value: unknown): value is AuthenticatorTransport {
  return typeof value === 'string' && VALID_TRANSPORTS.includes(value as AuthenticatorTransport);
}

function normalizeTransports(
  transports: readonly string[] | readonly AuthenticatorTransport[] | undefined,
): AuthenticatorTransport[] | undefined {
  if (!transports?.length) {
    return undefined;
  }

  return transports.reduce<AuthenticatorTransport[]>((valid, transport) => {
    if (isAuthenticatorTransport(transport)) {
      valid.push(transport);
    }

    return valid;
  }, []);
}

function withDefaultHints(hints: unknown): WebAuthnHint[] {
  if (Array.isArray(hints) && hints.length > 0) {
    return hints.filter(
      (hint): hint is WebAuthnHint =>
        hint === 'security-key' || hint === 'client-device' || hint === 'hybrid'
    );
  }

  return ['client-device', 'hybrid'];
}

function toArrayBuffer(value: Base64Input): ArrayBuffer {
  if (!value) {
    return new ArrayBuffer(0);
  }

  if (value instanceof ArrayBuffer) {
    return value;
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice().buffer;
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = `${normalized}${padding}`;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function normalizeCredentialDescriptor(
  credential: PublicKeyCredentialDescriptorJSON | PublicKeyCredentialDescriptor,
): PublicKeyCredentialDescriptor {
  return {
    type: 'public-key',
    id: toArrayBuffer(credential.id),
    transports: normalizeTransports(credential.transports),
  };
}

export function normalizeCreationOptions(
  options: any,
): CredentialCreationOptions {
  const publicKey = 'publicKey' in options ? options.publicKey : options;

  return {
    publicKey: {
      ...publicKey,
      challenge: toArrayBuffer(publicKey.challenge),
      user: {
        ...publicKey.user,
        id: toArrayBuffer(publicKey.user?.id),
      },
      excludeCredentials: publicKey.excludeCredentials?.map(normalizeCredentialDescriptor),
      extensions: {
        ...publicKey.extensions,
      },
      // `hybrid` helps Windows surface the native phone/QR flow for cross-device passkeys.
      hints: withDefaultHints(publicKey.hints),
    } as PublicKeyCredentialCreationOptions,
  };
}

export function normalizeRequestOptions(
  options: any,
): CredentialRequestOptions {
  const publicKey = 'publicKey' in options ? options.publicKey : options;

  return {
    mediation: options.mediation,
    publicKey: {
      ...publicKey,
      challenge: toArrayBuffer(publicKey.challenge),
      allowCredentials: publicKey.allowCredentials?.map(normalizeCredentialDescriptor),
      extensions: {
        ...publicKey.extensions,
      },
      hints: withDefaultHints(publicKey.hints),
    } as PublicKeyCredentialRequestOptions,
  };
}
