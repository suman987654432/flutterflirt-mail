import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Require valid authentication for all task routes
router.use(authenticateToken);

/**
 * 1. GET /api/tasks
 * Fetch all tasks strictly scoped to the authenticated user's email.
 */
router.get('/', async (req, res) => {
  const userEmail = req.user?.email?.toLowerCase()?.trim();
  if (!userEmail) {
    return res.status(401).json({ error: 'User email not found in token' });
  }

  try {
    const result = await query(
      `SELECT id, user_id, user_email, title, completed, important, due_date, 
              priority, notes, source_email_uid, source_email_subject, created_at, updated_at
       FROM tasks
       WHERE user_email = $1
       ORDER BY completed ASC, important DESC, created_at DESC`,
      [userEmail]
    );

    const tasks = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      title: row.title,
      completed: row.completed,
      important: row.important,
      dueDate: row.due_date || undefined,
      priority: row.priority || 'medium',
      notes: row.notes || '',
      sourceEmailUid: row.source_email_uid || undefined,
      sourceEmailSubject: row.source_email_subject || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ tasks });
  } catch (err) {
    console.warn('[Tasks GET] Note:', err.message);
    return res.json({ tasks: [] });
  }
});

/**
 * 2. POST /api/tasks
 * Create a new task strictly linked to the authenticated user.
 */
router.post('/', async (req, res) => {
  const userEmail = req.user?.email?.toLowerCase()?.trim();
  const userId = req.user?.id || null;

  if (!userEmail) {
    return res.status(401).json({ error: 'User email not found in token' });
  }

  const { title, important = false, dueDate, priority = 'medium', notes = '', sourceEmailUid, sourceEmailSubject } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const cleanTitle = title.trim();
    const cleanDueDate = dueDate ? String(dueDate).trim() : null;
    const cleanImportant = Boolean(important);
    const cleanPriority = ['high', 'medium', 'low'].includes(String(priority).toLowerCase())
      ? String(priority).toLowerCase()
      : 'medium';
    const cleanNotes = notes ? String(notes).trim() : '';
    const cleanEmailUid = sourceEmailUid ? parseInt(sourceEmailUid, 10) : null;
    const cleanEmailSubject = sourceEmailSubject ? String(sourceEmailSubject).slice(0, 500) : null;

    const result = await query(
      `INSERT INTO tasks (
         user_id, user_email, title, completed, important, due_date,
         priority, notes, source_email_uid, source_email_subject, created_at, updated_at
       )
       VALUES ($1, $2, $3, false, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        userEmail,
        cleanTitle,
        cleanImportant,
        cleanDueDate,
        cleanPriority,
        cleanNotes,
        cleanEmailUid,
        cleanEmailSubject,
      ]
    );

    const row = result.rows[0];
    return res.status(201).json({
      task: {
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        title: row.title,
        completed: row.completed,
        important: row.important,
        dueDate: row.due_date || undefined,
        priority: row.priority || 'medium',
        notes: row.notes || '',
        sourceEmailUid: row.source_email_uid || undefined,
        sourceEmailSubject: row.source_email_subject || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error('[Tasks POST] Error creating task:', err);
    return res.status(500).json({ error: 'Failed to create task in database' });
  }
});

/**
 * 3. PATCH /api/tasks/:id
 * Update task status (completed, important, title, dueDate, priority, notes).
 * Strict isolation: user can only modify their own tasks.
 */
router.patch('/:id', async (req, res) => {
  const userEmail = req.user?.email?.toLowerCase()?.trim();
  const taskId = req.params.id;

  if (!userEmail) {
    return res.status(401).json({ error: 'User email not found in token' });
  }

  const { completed, important, title, dueDate, priority, notes } = req.body;

  try {
    // Check if task exists and belongs to this user
    const checkRes = await query(
      `SELECT * FROM tasks WHERE id = $1 AND user_email = $2`,
      [taskId, userEmail]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const current = checkRes.rows[0];
    const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
    const newImportant = important !== undefined ? Boolean(important) : current.important;
    const newTitle = title !== undefined && typeof title === 'string' && title.trim() ? title.trim() : current.title;
    const newDueDate = dueDate !== undefined ? (dueDate ? String(dueDate).trim() : null) : current.due_date;
    const newPriority = priority !== undefined ? String(priority).toLowerCase() : (current.priority || 'medium');
    const newNotes = notes !== undefined ? String(notes).trim() : (current.notes || '');

    const updateRes = await query(
      `UPDATE tasks
       SET completed = $1, important = $2, title = $3, due_date = $4, priority = $5, notes = $6, updated_at = NOW()
       WHERE id = $7 AND user_email = $8
       RETURNING *`,
      [newCompleted, newImportant, newTitle, newDueDate, newPriority, newNotes, taskId, userEmail]
    );

    const row = updateRes.rows[0];
    return res.json({
      task: {
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        title: row.title,
        completed: row.completed,
        important: row.important,
        dueDate: row.due_date || undefined,
        priority: row.priority || 'medium',
        notes: row.notes || '',
        sourceEmailUid: row.source_email_uid || undefined,
        sourceEmailSubject: row.source_email_subject || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error('[Tasks PATCH] Error updating task:', err);
    return res.status(500).json({ error: 'Failed to update task in database' });
  }
});

/**
 * 4. DELETE /api/tasks/:id
 * Delete a task strictly scoped to the authenticated user.
 */
router.delete('/:id', async (req, res) => {
  const userEmail = req.user?.email?.toLowerCase()?.trim();
  const taskId = req.params.id;

  if (!userEmail) {
    return res.status(401).json({ error: 'User email not found in token' });
  }

  try {
    const result = await query(
      `DELETE FROM tasks WHERE id = $1 AND user_email = $2 RETURNING id`,
      [taskId, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    return res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('[Tasks DELETE] Error deleting task:', err);
    return res.status(500).json({ error: 'Failed to delete task from database' });
  }
});

export default router;
