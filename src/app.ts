import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import ApiError from './common/utils/ApiError';
import config from './common/config/config';
import * as morgan from './common/config/morgan';
import routes from './routes';
import { errorConverter, errorHandler } from './common/middlewares/error';
import authLimiter from './common/middlewares/rateLimiter';
import passport from 'passport';
import jwtStrategy from './common/config/passport';

const app: Express = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use('/v1', routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);

app.use(errorHandler);

export default app;
