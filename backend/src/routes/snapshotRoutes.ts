import { Router } from 'express';
import { saveSnapshot, getSnapshots, restoreSnapshot, deleteSnapshot } from '../controllers/snapshotController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', saveSnapshot);
router.get('/:workspaceId', getSnapshots);
router.post('/:snapshotId/restore', restoreSnapshot);
router.delete('/:snapshotId', deleteSnapshot);

export default router;
