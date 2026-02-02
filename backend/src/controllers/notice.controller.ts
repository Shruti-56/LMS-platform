import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const noticeController = {
  // Admin: list all notices (with optional student filter)
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.query;
      const where: { studentId?: string | null } = {};
      if (studentId === 'all' || studentId === '') {
        where.studentId = null;
      } else if (typeof studentId === 'string') {
        where.studentId = studentId;
      }

      const notices = await prisma.studentNotice.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: {
          creator: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          student: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          acks: { include: { student: { select: { id: true, email: true, profile: { select: { fullName: true } } } } } },
          _count: { select: { acks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(notices);
    } catch (error: unknown) {
      console.error('List notices error:', error);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  },

  // Admin: create notice (target: studentId or null for all students)
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { title, body, studentId } = req.body;
      if (!title?.trim()) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }
      const notice = await prisma.studentNotice.create({
        data: {
          title: title.trim(),
          body: (body ?? '').trim(),
          studentId: studentId && String(studentId).trim() ? String(studentId).trim() : null,
          createdBy: userId,
        },
        include: {
          creator: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          student: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        },
      });
      res.status(201).json(notice);
    } catch (error: unknown) {
      console.error('Create notice error:', error);
      res.status(500).json({ error: 'Failed to create notice' });
    }
  },

  // Admin: update notice
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, body, studentId } = req.body;
      const data: { title?: string; body?: string; studentId?: string | null } = {};
      if (title !== undefined) data.title = title.trim();
      if (body !== undefined) data.body = body.trim();
      if (studentId !== undefined) data.studentId = studentId && String(studentId).trim() ? String(studentId).trim() : null;

      const notice = await prisma.studentNotice.update({
        where: { id },
        data,
        include: {
          creator: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          student: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        },
      });
      res.json(notice);
    } catch (error: unknown) {
      console.error('Update notice error:', error);
      res.status(500).json({ error: 'Failed to update notice' });
    }
  },

  // Admin: delete notice
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.studentNotice.delete({ where: { id } });
      res.json({ message: 'Notice deleted' });
    } catch (error: unknown) {
      console.error('Delete notice error:', error);
      res.status(500).json({ error: 'Failed to delete notice' });
    }
  },

  // Student: list notices for me; exclude dismissed or remind-later (until time passed)
  listMy: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const now = new Date();
      const notices = await prisma.studentNotice.findMany({
        where: {
          AND: [
            { OR: [{ studentId: null }, { studentId: userId }] },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
            {
              NOT: {
                acks: {
                  some: {
                    studentId: userId,
                    OR: [
                      { action: 'DISMISSED' },
                      { action: 'REMIND_LATER', remindLaterUntil: { gt: now } },
                    ],
                  },
                },
              },
            },
          ],
        },
        include: {
          creator: { select: { profile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(notices);
    } catch (error: unknown) {
      console.error('List my notices error:', error);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  },

  // Student: acknowledge a notice (dismiss or remind later)
  acknowledge: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { id: noticeId } = req.params;
      const { action } = req.body;
      const act = String(action || '').toUpperCase().replace(/-/g, '_');
      if (act !== 'DISMISSED' && act !== 'REMIND_LATER') {
        res.status(400).json({ error: 'action must be dismissed or remind_later' });
        return;
      }
      const notice = await prisma.studentNotice.findFirst({
        where: {
          id: noticeId,
          OR: [{ studentId: null }, { studentId: userId }],
        },
      });
      if (!notice) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }
      const remindLaterUntil = act === 'REMIND_LATER'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h from now
        : null;
      await prisma.studentNoticeAck.upsert({
        where: {
          noticeId_studentId: { noticeId, studentId: userId },
        },
        create: {
          noticeId,
          studentId: userId,
          action: act,
          remindLaterUntil,
        },
        update: {
          action: act,
          remindLaterUntil,
        },
      });
      res.json({ ok: true, action: act });
    } catch (error: unknown) {
      console.error('Acknowledge notice error:', error);
      res.status(500).json({ error: 'Failed to acknowledge' });
    }
  },

  // Admin: get acknowledgements for a notice
  getAcknowledgements: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const acks = await prisma.studentNoticeAck.findMany({
        where: { noticeId: id },
        include: {
          student: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(acks);
    } catch (error: unknown) {
      console.error('Get acknowledgements error:', error);
      res.status(500).json({ error: 'Failed to fetch acknowledgements' });
    }
  },
};
