import { register, login, logout, getAuthState, hasPermission, getUsers, type User, type UserRole } from '../lib/auth';

beforeEach(() => {
  jest.clearAllMocks();
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('Authentication Functions', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await register('testuser', 'test@example.com', 'password123', 'USER');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Registration successful');
      
      const users = getUsers();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('testuser');
      expect(users[0].email).toBe('test@example.com');
      expect(users[0].role).toBe('USER');
    });

    it('should fail if email already exists', async () => {
      await register('user1', 'same@example.com', 'password123', 'USER');
      const result = await register('user2', 'same@example.com', 'password456', 'USER');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
    });

    it('should fail if username already exists', async () => {
      await register('sameuser', 'email1@example.com', 'password123', 'USER');
      const result = await register('sameuser', 'email2@example.com', 'password456', 'USER');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Username already exists');
    });

    it('should fail with empty fields', async () => {
      const result = await register('', '', '', 'USER');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('All fields are required');
    });

    it('should register with ADMIN role when specified', async () => {
      const result = await register('adminuser', 'admin@test.com', 'adminpass', 'ADMIN');
      
      expect(result.success).toBe(true);
      
      const users = getUsers();
      expect(users[0].role).toBe('ADMIN');
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      await register('testuser', 'test@example.com', 'password123', 'USER');
      
      const result = await login('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.token).toBeDefined();
      expect(result.user?.username).toBe('testuser');
    });

    it('should fail with incorrect password', async () => {
      await register('testuser', 'test@example.com', 'password123', 'USER');
      
      const result = await login('test@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Incorrect password');
    });

    it('should fail if user does not exist', async () => {
      const result = await login('nonexistent@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
    });

    it('should create default admin when no users exist', async () => {
      const result = await login('admin@example.com', 'admin123');
      
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('ADMIN');
      expect(result.user?.username).toBe('admin');
    });

    it('should store auth token in localStorage', async () => {
      await register('testuser', 'test@example.com', 'password123', 'USER');
      
      await login('test@example.com', 'password123');
      
      const token = localStorage.getItem('jira-clone-auth-token');
      expect(token).not.toBeNull();
    });
  });

  describe('logout', () => {
    it('should remove auth token from localStorage', async () => {
      await register('testuser', 'test@example.com', 'password123', 'USER');
      await login('test@example.com', 'password123');
      
      expect(localStorage.getItem('jira-clone-auth-token')).not.toBeNull();
      
      logout();
      
      expect(localStorage.getItem('jira-clone-auth-token')).toBeNull();
    });
  });

  describe('getAuthState', () => {
    it('should return authenticated state when logged in', async () => {
      await register('testuser', 'test@example.com', 'password123', 'USER');
      await login('test@example.com', 'password123');
      
      const authState = getAuthState();
      
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toBeDefined();
      expect(authState.token).not.toBeNull();
    });

    it('should return unauthenticated state when logged out', () => {
      const authState = getAuthState();
      
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(authState.token).toBeNull();
    });
  });

  describe('hasPermission', () => {
    const adminUser: User = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: 'hashed',
      role: 'ADMIN',
      createdAt: '2024-01-01',
    };

    const regularUser: User = {
      id: '2',
      username: 'user',
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: 'USER',
      createdAt: '2024-01-01',
    };

    it('should return true for ADMIN accessing ADMIN resources', () => {
      expect(hasPermission(adminUser, 'ADMIN')).toBe(true);
    });

    it('should return true for ADMIN accessing USER resources', () => {
      expect(hasPermission(adminUser, 'USER')).toBe(true);
    });

    it('should return false for USER accessing ADMIN resources', () => {
      expect(hasPermission(regularUser, 'ADMIN')).toBe(false);
    });

    it('should return true for USER accessing USER resources', () => {
      expect(hasPermission(regularUser, 'USER')).toBe(true);
    });

    it('should return false for null user', () => {
      expect(hasPermission(null, 'USER')).toBe(false);
    });
  });
});
