export const state: {
  readonly orderNumYear: number;
  // tslint:disable-next-line:readonly-array
  readonly sendingOrderUser: Array<{
    readonly userId: string;
    readonly orderNum: string;
  }>;
  // tslint:disable-next-line:readonly-keyword
  [key: string]: any;
} = {
  orderNumYear: 2018,
  sendingOrderUser: []
};
