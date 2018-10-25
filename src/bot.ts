import chalk from 'chalk';
import qrcodeTerminal from 'qrcode-terminal';
import { Wechaty } from 'wechaty';
import commit from './commit';
import contact from './contact';
import receive from './receive';

const rabbit = new Wechaty({
  profile: 'rabbit'
});

const { log } = console;

let state = 0;
rabbit
  .on('scan', qrcode => {
    if (state === 0) {
      log(chalk.blue('Scan QR Code to login'));
      qrcodeTerminal.generate(qrcode);
      state = 1;
    }
  })
  .on('login', user => {
    log(chalk.blue(`User ${user} logined`));
    state = 0;
    contact(rabbit);
  });
// .on('message', message => log(chalk.green(`Message: ${message}`)))

commit(rabbit);
receive(rabbit);
rabbit.start();
