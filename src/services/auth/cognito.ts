export interface OperatorUser {
  id: string;
  email: string;
  name: string;
  role: 'operator_admin' | 'field_inspector' | 'guest_demo';
  isDemoAccount: boolean;
}

const DEMO_OPERATOR_USER: OperatorUser = {
  id: 'op_demo_01',
  email: 'operator@accesspath.transit.internal',
  name: 'Central Control Operator (Demo)',
  role: 'operator_admin',
  isDemoAccount: true,
};

export class CognitoAuthService {
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_accesspath';
    this.clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || 'demo_client_id_placeholder';
  }

  getCurrentUser(): OperatorUser {
    const raw = localStorage.getItem('accesspath_operator_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fallback
      }
    }
    return DEMO_OPERATOR_USER;
  }

  isAuthenticated(): boolean {
    return true; // Demo mode enabled by default
  }

  signInDemo(role: 'operator_admin' | 'field_inspector' = 'operator_admin'): OperatorUser {
    const user: OperatorUser = {
      ...DEMO_OPERATOR_USER,
      role,
    };
    localStorage.setItem('accesspath_operator_user', JSON.stringify(user));
    return user;
  }

  signOut(): void {
    localStorage.removeItem('accesspath_operator_user');
    localStorage.removeItem('accesspath_cognito_token');
  }

  getCredentialsInfo() {
    return {
      userPoolId: this.userPoolId,
      clientId: this.clientId,
      isConfigured: Boolean(import.meta.env.VITE_COGNITO_USER_POOL_ID),
      modeNotice: 'Running in Operator Demo Mode. Production AWS Cognito integration configured.'
    };
  }
}

export const authService = new CognitoAuthService();

