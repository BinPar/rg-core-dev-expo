import * as FileSystem from 'expo-file-system';
import { Base64 } from 'js-base64';
import { JSONIndex, ExtractedJSONIndexInfo } from '../model/types';
import fastEncrypt from './fastEncrypt';

const JSON_INDEX_BYTES = 32;

const extractJsonIndex = async (pathToOneFile: string): Promise<ExtractedJSONIndexInfo> => {
  const fileStats = await FileSystem.getInfoAsync(pathToOneFile);
  if (fileStats && fileStats.size) {
    const { size } = fileStats;
    const base64JsonIndexPosition = await FileSystem.readAsStringAsync(pathToOneFile, {
      encoding: FileSystem.EncodingType.Base64,
      length: JSON_INDEX_BYTES,
      position: size - JSON_INDEX_BYTES,
    });

    const [jsonIndexPosition, jsonIndexLength] = Base64.fromBase64(base64JsonIndexPosition)
      .split('-')
      .map((bytes): number => parseInt(bytes, 10));

    let base64JsonIndex = await FileSystem.readAsStringAsync(pathToOneFile, {
      encoding: FileSystem.EncodingType.Base64,
      length: jsonIndexLength,
      position: jsonIndexPosition,
    });
    const encrypted = base64JsonIndex.indexOf('ey') !== 0;
    if (encrypted) {
      base64JsonIndex = fastEncrypt(base64JsonIndex);
    }
    const index = {
      encrypted,
      jsonIndex: JSON.parse(Base64.fromBase64(base64JsonIndex)) as JSONIndex,
      jsonIndexLength,
      jsonIndexStartByte: jsonIndexPosition,
    };
    return index;
  }
  throw new Error('Not found');
};

export default extractJsonIndex;
