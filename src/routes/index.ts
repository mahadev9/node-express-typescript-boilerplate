import express from 'express';
import config from '../common/config/config';
import userRoutes from '../api/user/user.routes';
import authRoutes from '../api/auth/auth.routes';
import docsRoutes from '../api/docs/docs.routes';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/api-docs',
    route: docsRoutes,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
