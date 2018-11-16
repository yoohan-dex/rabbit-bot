import axios from 'axios';
import { log } from 'console';
// import r2 from 'r2';
import FormData from 'form-data';
import * as path from 'path';
import * as qrcode from 'qrcode';
// import request from 'request';
import { Contact, FileBox, Wechaty } from 'wechaty';
import { MessageType } from 'wechaty-puppet';
import { ALLOW } from './commit';
import { config } from './config';
import { parseCommon } from './lib/parseItem';
import { commitOrder } from './send2Server';
import { state } from './state';

export default (rabbit: Wechaty) => {
  rabbit.on('message', async msg => {
    const sender: Contact | null = msg.from();
    if (!sender || ((await sender.alias()) !== ALLOW && !sender.self())) {
      return;
    }
    const user = msg.from();
    if (!user || !state.sendingOrderUser.some(u => u.userId === user.id)) {
      return;
    }
    if (
      msg.type() === MessageType.Text &&
      state[user.id] &&
      msg.text().indexOf('[system]') === -1
    ) {
      try {
        const imageIds = state[user.id] as ReadonlyArray<number>;
        const stateUser = state.sendingOrderUser.find(
          u => u.userId === user.id
        );
        if (!stateUser) {
          await msg.say('[system] 有问题');
          throw new Error('有问题咯');
        }
        msg.say(`[system]imageId: $${imageIds}`);
        const order = {
          ...parseCommon(msg.text()),
          imageIds,
          orderNum: stateUser.orderNum,
          orderNumYear: state.orderNumYear
        };
        log('order', order);
        try {
          const orderFromServer = await commitOrder(order);
          await msg.say('[system]好哒，下单成功了');
          await qrcode.toFile(
            path.resolve(__dirname, '../tmp/qrcode.png'),
            `https://www.hotbody.wang/mp?id=${
              orderFromServer.data.id
            }&role=operator`
          );
          const userIdx = state.sendingOrderUser.findIndex(
            u => u.userId === user.id
          );
          state.sendingOrderUser.splice(userIdx, 1);
          const fileBox = FileBox.fromFile(
            path.resolve(__dirname, '../tmp/qrcode.png')
          );
          // tslint:disable-next-line:no-delete
          delete state[user.id]; // tslint:disable-line:no-object-mutation
          await msg.say(fileBox);
        } catch (e) {
          log('error', e);
          msg.say('[system]服务器有错误，叫姚帆滚过来');
        }
      } catch (err) {
        log(err.message);
        await msg.say(err.message);
      }
    }
    if (msg.type() === MessageType.Image) {
      const file = await msg.toFileBox();
      const stream = await file.toStream();

      const formdata = new FormData();

      formdata.append('file', stream);
      try {
        const { data } = await axios.post(
          `${config.server}/common/upload`,
          formdata,
          {
            headers: formdata.getHeaders()
          }
        );
        log('id', data.id);
        // tslint:disable-next-line:no-object-mutation
        state[user.id] = state[user.id]
          ? [...state[user.id], data.id]
          : [data.id];
        await msg.say('[system]好的，你可以继续发送效果图，或者订单信息');
      } catch (e) {
        log(e);
      }
      // const res = await r2.get('https://www.hotbody.wang/product', {
      //   headers: { accept: 'application/json; charset=utf-8' }
      // }).json;
      // log('res', res);
      // request
      //   .get({
      //     headers: {
      //       accept: 'application/json; charset=utf-8'
      //     },
      //     url: 'https://www.hotbody.wang/product'
      //   })
      //   .on('response', re => {
      //     log('body1', re.toJSON());
      //   });

      // request
      //   .post({
      //     formData: {
      //       file: stream
      //     },
      //     headers: {
      //       Accept: 'application/json; charset=utf-8'
      //     },
      //     url: 'http://192.168.0.133:3000/common/upload'
      //   })

      //   .on('response', res => {
      //     log(res.toJSON());
      //     // log('body2', d);
      //     // log('state', state);
      //     // const response = res.toJSON();
      //     // if (response.statusCode === 201) {
      //     //   log('res', response);
      //     //   log('body', response.body);
      //     // } else {
      //     //   log('error', response);
      //     // }
      //   })

      //   .on('error', err => {
      //     log('err', err);
      //   });

      // stream.pipe(
      //   request
      //     .post('http://192.168.0.133:3000/common/upload')
      //     .on('response', res => {
      //       // log('res', res);
      //       log('res', res.toJSON());
      //     })
      //     .on('error', err => {
      //       log('err', err.message);
      //     })
      // );
    }
  });
};
