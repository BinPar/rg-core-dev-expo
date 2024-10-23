/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import {
  deleteAsync,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system';
import { dispatchBookUpdate } from 'hooks/useBookInfo';
import { ExtractedJSONIndexInfo } from '../model/types';
import fastEncrypt from './fastEncrypt';
import { ExtendedBookshelfProduct } from './session/model';

const extractFilesToOutput = async (
  pathToFile: string,
  jsonIndexInfo: ExtractedJSONIndexInfo,
  outputPath: string,
  book?: ExtendedBookshelfProduct,
): Promise<void> => {
  const { jsonIndexStartByte, jsonIndex, jsonIndexLength, encrypted } = jsonIndexInfo;
  const outputPaths = Object.keys(jsonIndex);
  const checkedPaths: { [path: string]: boolean } = {};
  for (let i = 0, l = outputPaths.length; i < l; i += 1) {
    if (book) {
      const progress = Math.round((i / outputPaths.length) * 100);
      if (progress !== book.extractionProgress) {
        book.extractionProgress = progress;
        dispatchBookUpdate(book.id, book);
      }
    }
    const relativePath = outputPaths[i];
    const absolutePath = `${outputPath}/${relativePath}`;
    const dirParts = absolutePath.split('/');
    dirParts.pop();
    const dirPath = dirParts.join('/');
    if (!checkedPaths[dirPath]) {
      checkedPaths[dirPath] = true;
      const dirInfo = await getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await makeDirectoryAsync(dirPath, { intermediates: true });
      }
    }
    let { start } = jsonIndex[relativePath];
    const { length } = jsonIndex[relativePath];
    if (start >= jsonIndexStartByte) {
      start += jsonIndexLength;
    }
    let content = await readAsStringAsync(pathToFile, {
      encoding: EncodingType.Base64,
      length,
      position: start,
    });
    if (encrypted) {
      content = fastEncrypt(content);
    }
    await writeAsStringAsync(absolutePath.replace(/\|/g, '.'), content, {
      encoding: EncodingType.Base64,
    });
  }
  await writeAsStringAsync(`${outputPath}/extracted.txt`, 'ok', {
    encoding: EncodingType.UTF8,
  });
  if (book) {
    book.extractionProgress = 100;
    book.extracted = true;
    book.extracting = false;
    dispatchBookUpdate(book.id, book);
  }
  try {
    await deleteAsync(pathToFile);
  } catch {
    // no need
  }
};

export default extractFilesToOutput;
