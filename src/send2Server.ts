import axios from 'axios';
import { config } from './config';

export const commitOrder = (order: object) => {
  return axios.post(`${config.server}/order/create`, order);
};
