import moment from 'moment';
import { chineseType, type } from './type';

export const replaceBr = (str: string) => {
  if (!str.includes('<br/>')) {
    return str;
  }
  const reg = /\<br\/\>/g;
  return str.replace(reg, '\n');
};
export const removeLineNum = (str: string) => {
  const reg = /\d+#/g;
  return str.replace(reg, '#');
};

export const breakClass = (str: string) =>
  str
    .split('#')
    .filter(content => content !== '')
    .slice(1);

interface Category {
  readonly category: string;
  readonly content: string;
}
export const genClass = (classes: ReadonlyArray<string>) => {
  return classes.reduce(
    (
      pre: ReadonlyArray<Category>,
      curr: string,
      i,
      arr
    ): ReadonlyArray<Category> => {
      const idx = curr.indexOf('\n');
      const category = curr.slice(0, idx);
      const content =
        i === arr.length - 1
          ? curr.slice(idx + 1)
          : curr.slice(idx + 1, curr.length - 1);

      return [...pre, { category, content }];
    },
    []
  );
};

export const parseSizeAndCount = (str: string, totalCount: number) => {
  // tslint:disable-next-line:prefer-const
  let total = 0;

  const colorAndSizeArr = str
    .split('\n')
    .map(item => item.trim())
    .filter(v => v !== '');
  // tslint:disable-next-line:readonly-array
  const colorIdx: number[] = [];
  colorAndSizeArr.forEach((item, idx) => {
    if (item.indexOf('色') !== -1) {
      colorIdx.push(idx);
    }
  });
  if (colorIdx.length === 0) {
    throw new Error('[system]尺码格式错误，请重新编辑');
  }

  const colorRanges = colorIdx.map((idx, i, arr) => {
    // tslint:disable-next-line:prefer-const
    let color;
    // tslint:disable-next-line:readonly-array
    let sizeArr: string[];

    color = colorAndSizeArr[idx];
    if (i === 0 && idx === 0) {
      sizeArr = colorAndSizeArr.slice(1, arr[1]);
    } else if (i === arr.length) {
      sizeArr = colorAndSizeArr.slice(idx + 1);
    } else {
      sizeArr = colorAndSizeArr.slice(idx + 1, arr[i + 1]);
    }

    const sizeAndCount = sizeArr.map(item => {
      const [size, count] = item.split('=').map(s => s.trim());

      total += parseInt(count, 10);
      return {
        count: parseInt(count, 10),
        size
      };
    });

    return {
      color,
      sizeAndCount
    };
  });
  if (total !== totalCount) {
    throw new Error(
      `[system]上传订单的总数不对， 请重新计算检查一下, 订单写着 ${totalCount} 件, 但计算后是 ${total} 件`
    );
  }
  return colorRanges;
};

export const formatCategory = (categories: ReadonlyArray<Category>) => {
  // tslint:disable-next-line:prefer-const
  let obj = {};
  categories.forEach(item => {
    const idx = chineseType.indexOf(item.category);
    obj = {
      ...obj,
      [type[idx]]: item.content
    };
  });
  return obj as {
    readonly material: string;
    readonly pattern: string;
    readonly printing: string;
    readonly detail: string;
    readonly sizeAndNum: string;
    readonly totalNum: string;
    readonly price: string;
    readonly total: string;
    readonly address: string;
    readonly seller: string;
    readonly express: string;
    readonly remark: string;
    readonly sendTime: string;
    readonly company: string;
  };
};

export const parseTotal = (str: string) => {
  return parseInt(str.split('\n')[0], 10);
};

export const parseClient = (str: string) => {
  const [clientAddress, clientName, clientPhone] = str.split('，');
  return {
    clientAddress,
    clientName,
    clientPhone
  };
};

export const parseDate = (str: string) => {
  const willRemoveIdx = str.indexOf('之前');
  const afterSliceStr =
    willRemoveIdx !== -1 ? str.slice(0, willRemoveIdx) : str;
  const isYear = afterSliceStr.indexOf('年');
  const monthIdx = afterSliceStr.indexOf('月');
  const dayIdx = afterSliceStr.indexOf('日');
  const year =
    isYear !== -1 ? afterSliceStr.slice(0, isYear) : new Date().getFullYear();
  const month =
    isYear !== -1
      ? afterSliceStr.slice(isYear, monthIdx)
      : afterSliceStr.slice(0, monthIdx);
  const day = afterSliceStr.slice(monthIdx + 1, dayIdx);
  const fullTime = `${year}-${month}-${day}`;
  if (!moment(fullTime, 'YYYY-MM-DD').isValid()) {
    throw new Error('[system]发货时间格式错误，请检查一下');
  }

  return moment(fullTime, 'YYYY-MM-DD').valueOf();
};

export const checkTotal = (
  total: number,
  totalNumber: number,
  price: number
) => {
  if (total !== totalNumber * price) {
    throw new Error('[system]请检查一遍金额是否计算错误');
  }
};
export const parseCommon = (item: string) => {
  if (typeof item !== 'string') {
    throw new Error('item have to be a string');
  }

  const afterGen = genClass(breakClass(removeLineNum(replaceBr(item))));
  const afterFormat = formatCategory(afterGen);
  const sizeAndCount = parseSizeAndCount(
    afterFormat.sizeAndNum,
    parseInt(afterFormat.totalNum, 10)
  );
  const client = parseClient(afterFormat.address);
  const total = parseTotal(afterFormat.total);
  checkTotal(
    total,
    parseInt(afterFormat.totalNum, 10),
    parseInt(afterFormat.price, 10)
  );
  return {
    ...afterFormat,
    ...client,
    clientCompany: afterFormat.company,
    price: parseInt(afterFormat.price, 10),
    sendTime: parseDate(afterFormat.sendTime),
    sizeAndNum: sizeAndCount,
    total,
    totalNum: parseInt(afterFormat.totalNum, 10)
  };
};
