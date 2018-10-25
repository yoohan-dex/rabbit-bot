import { log } from 'console';
import { Contact, Message, Wechaty } from 'wechaty';
import format from './format/format';
import { state } from './state';

export const ALLOW = '七兔下单员';
const NOT_ALLOW = '[system]你没有资格和我说话';
// const TIPS = `发送‘下单格式’给我，会给你下单的格式模版
// 发送‘测试下单’给我，会给你测试下单的流程`;
const FORMAT_REQUEST = '下单格式';
const FORMAT_TYPE_ASK =
  '[system]请问要哪种下单格式？回复‘一般下单’给你一般下单格式，回复‘束口包格式’给你束口包格式。';
const COMMON = '一般下单';
const BAG = '束口包格式';

const REQUEST_SEND_ORDER = '下单';
const CANCEL_SEND_ORDER = '取消下单';
const SENDING_IMAGE = '[system]请发送一张效果图';
// const SENDING_ORDER = '请按照这个格式发送订单信息';

const say = (msg: Message) => async (str: string) => {
  const sender: Contact | null = msg.from();
  if (!sender || ((await sender.alias()) !== ALLOW && !sender.self())) {
    log('not allow');
    return msg.say(NOT_ALLOW);
  }
  return msg.say(str);
};

export default (rabbit: Wechaty) => {
  rabbit.on('message', async msg => {
    log(msg.text());
    switch (msg.text()) {
      case FORMAT_REQUEST:
        await say(msg)(FORMAT_TYPE_ASK);
        break;
      case REQUEST_SEND_ORDER:
        await say(msg)(SENDING_IMAGE);
        const user = msg.from();
        if (user) {
          state.sendingOrderUser.push(user.id);
        }
        break;
      case CANCEL_SEND_ORDER:
        const cancelUser = msg.from();
        if (cancelUser && state.sendingOrderUser.includes(cancelUser.id)) {
          const idx = state.sendingOrderUser.indexOf(cancelUser.id);
          state.sendingOrderUser.splice(idx, 1);
          // tslint:disable-next-line:no-object-mutation
          delete state[cancelUser.id]; // tslint:disable-line:no-delete
        }
        await say(msg)('ok');
        break;
      case COMMON:
        await say(msg)(format.common);
        break;
      case BAG:
        await say(msg)(format.strictBag);
        break;
      default:
        break;
    }
  });
};
