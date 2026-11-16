import { Router } from 'express';
import { assetsController, upload } from './assets.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorizeDocument } from '../../middleware/authorize.js';
import { Role } from '@prisma/client';

export const assetsRouter = Router({ mergeParams: true });

assetsRouter.post(
  '/',
  authenticate,
  authorizeDocument(Role.EDITOR),
  upload.single('file'),
  assetsController.uploadAsset
);

assetsRouter.get(
  '/',
  optionalAuthenticate,
  authorizeDocument(Role.VIEWER),
  assetsController.listAssets
);

assetsRouter.delete(
  '/:assetId',
  authenticate,
  authorizeDocument(Role.EDITOR),
  assetsController.deleteAsset
);

