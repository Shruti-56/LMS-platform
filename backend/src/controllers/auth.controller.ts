import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      // Validate input
      if (!email || !password || !fullName) {
        res.status(400).json({ error: 'Email, password, and full name are required' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          roles: [UserRole.STUDENT],
          profile: {
            create: {
              fullName,
            },
          },
        },
        include: { profile: true },
      });

      // Generate token
      const token = this.generateToken(user.id, user.email, user.roles);

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.profile?.fullName,
          roles: user.roles,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  };

  /**
   * POST /api/auth/login
   * Login user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true },
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check if blocked
      if (user.profile?.isBlocked) {
        res.status(403).json({ error: 'Account is blocked' });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate token
      const token = this.generateToken(user.id, user.email, user.roles);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.profile?.fullName,
          avatarUrl: user.profile?.avatarUrl,
          roles: user.roles,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  };

  /**
   * GET /api/auth/me
   * Get current user info
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { profile: true },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        avatarUrl: user.profile?.avatarUrl,
        bio: user.profile?.bio,
        roles: user.roles,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    // JWT is stateless, so logout is handled client-side
    // This endpoint can be used for logging/analytics
    res.json({ message: 'Logout successful' });
  };

  /**
   * PUT /api/auth/password
   * Change password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isValid) {
        res.status(401).json({ error: 'Current password is incorrect' });
        return;
      }

      // Update password
      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  };

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, roles: UserRole[]): string {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
      { userId, email, roles },
      secret,
      { expiresIn }
    );
  }
}
