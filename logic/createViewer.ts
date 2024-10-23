import { Asset } from "expo-asset";
import {
  EncodingType,
  readAsStringAsync,
  getInfoAsync,
  writeAsStringAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
} from "expo-file-system";
import { defaultOfflineWebBasePath } from "./getBasePath";

const createViewer = async () => {
  try {
    const dirInfo = await getInfoAsync(defaultOfflineWebBasePath);

    if (!dirInfo.exists) {
      await makeDirectoryAsync(defaultOfflineWebBasePath, {
        intermediates: true,
      });
    }

    const [cjs, css, html] = await Asset.loadAsync([
      require("../core/js/rg-core.cjs"),
      require("../core/css/rg-core.css"),
      require("../core/index.html"),
    ]);

    let contentJS = await readAsStringAsync(cjs.localUri!, {
      encoding: EncodingType.UTF8,
    });

    await writeAsStringAsync(
      `${defaultOfflineWebBasePath}/index.js`,
      contentJS,
      {
        encoding: EncodingType.UTF8,
      }
    );

    let contentCSS = await readAsStringAsync(css.localUri!, {
      encoding: EncodingType.UTF8,
    });

    await writeAsStringAsync(
      `${defaultOfflineWebBasePath}/index.css`,
      contentCSS,
      {
        encoding: EncodingType.UTF8,
      }
    );

    let content = await readAsStringAsync(html.localUri!, {
      encoding: EncodingType.UTF8,
    });

    await writeAsStringAsync(
      `${defaultOfflineWebBasePath}/index.html`,
      content,
      {
        encoding: EncodingType.UTF8,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export default createViewer;
