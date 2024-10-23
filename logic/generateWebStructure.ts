import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import extractFilesToOutput from './extractFilesToOutput';
import extractJsonIndex from './extractJsonIndex';
import {
  defaultOfflineWebBasePath,
} from './getBasePath';

const generateWebStructure = async (): Promise<void> => {
  const hashPath = `${FileSystem.documentDirectory}viewer-hash`;
  let purge = false;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const [{ localUri, hash }] = await Asset.loadAsync(require('../assets/sdk-viewer.bpof'));
  const viewerHash = await FileSystem.getInfoAsync(hashPath);
  if (viewerHash.exists) {
    const lastHash = await FileSystem.readAsStringAsync(hashPath, { encoding: 'utf8' });
    purge = lastHash !== hash;
  } else {
    purge = true;
  }

  const webPathInfo = await FileSystem.getInfoAsync(defaultOfflineWebBasePath);
  if (purge) {
    await FileSystem.deleteAsync(defaultOfflineWebBasePath, { idempotent: true });
  }
  if (!webPathInfo.exists || purge) {
    await FileSystem.makeDirectoryAsync(defaultOfflineWebBasePath);
    await extractFilesToOutput(
      localUri,
      await extractJsonIndex(localUri),
      defaultOfflineWebBasePath,
    );
    await FileSystem.writeAsStringAsync(hashPath, hash, { encoding: 'utf8' });
    const booksInfo = await FileSystem.getInfoAsync(defaultOfflineBooksBasePath);
    if (!booksInfo.exists) {
      await FileSystem.makeDirectoryAsync(defaultOfflineBooksBasePath);
    }
  }
};

export default generateWebStructure;
