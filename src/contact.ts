import { log } from 'console';
import { Wechaty } from 'wechaty';

export default async (rabbit: Wechaty) => {
  const room = await rabbit.Room.find({ topic: '七兔总坛' });
  if (!room) {
    return log('have no this contact');
  }
  // await room.say('hello');
  const members = await room.memberAll();
  const str = members.reduce((pre, curr, idx, arr) => {
    if (!curr.name()) {
      return pre;
    }
    if (idx !== arr.length - 1) {
      return pre + curr.name() + '，';
    }
    return pre + curr.name() + '。';
  }, '');
  log(str);

  const sb = await rabbit.Contact.find({ alias: '傻逼' });
  if (!sb) {
    return log('have no sb');
  }
  // await sb.say('hello');
  // await sb.say('你是傻逼');
  log(sb.id);
  // await sb.say(rabbit.Contact.load(sb.id));
  // await room.say('这个群里有:' + str);
};
