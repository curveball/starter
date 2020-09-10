import Controller from '@curveball/controller';
import { Context } from '@curveball/core';

class HomeController extends Controller {

  get(ctx: Context) {

    ctx.response.type = 'application/json';
    ctx.response.body = {
      title: 'Hello World!'
    };

  }

}

export default new HomeController();
