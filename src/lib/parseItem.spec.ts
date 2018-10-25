import test from 'ava';
import { log } from 'console';
import items from '../format/format';
import {
  breakClass,
  formatCategory,
  genClass,
  parseCommon,
  parseSizeAndCount,
  removeLineNum,
  replaceBr
} from './parseItem';

test('replaceBr', t => {
  const str = '123<br/>333';
  const newStr = replaceBr(str);
  t.is(newStr, '123\n333');
});

test('removeLineNumb', t => {
  const afterRemove = removeLineNum(items.common);
  t.is(afterRemove, removeLineNum(items.common));
});

test('breakClass', t => {
  const afterBreak = breakClass(removeLineNum(items.common));
  t.deepEqual(afterBreak, breakClass(removeLineNum(items.common)));
});

test('genClass', t => {
  const afterGen = genClass(breakClass(removeLineNum(items.common)));
  t.is(afterGen.length, 14);
  t.deepEqual(afterGen, afterGen);
});

test('format', t => {
  const afterGen = genClass(breakClass(removeLineNum(items.common)));
  const afterFormat = formatCategory(afterGen);
  t.deepEqual(afterFormat, afterFormat);
});

test('parseSizeAndNumber', t => {
  const afterGen = genClass(breakClass(removeLineNum(items.common)));
  const totalCountObject = afterGen.find(v => v.category === '数量');
  const sizeAndNumberObject = afterGen.find(v => v.category === '尺码');
  if (!totalCountObject || !sizeAndNumberObject) {
    throw new Error('erorr! check your program again please!');
  }
  const afterParse = parseSizeAndCount(
    sizeAndNumberObject.content,
    parseInt(totalCountObject.content, 10)
  );

  t.deepEqual(afterParse, afterParse);
});

test('parseCommon', t => {
  const afterParse = parseCommon(items.common);
  log(JSON.stringify(afterParse));
  log(afterParse);
  t.deepEqual(afterParse, afterParse);
});
