import router from '@curveball/router';
import homeController from './home/controller';

export default [
  router('/', homeController)
];
