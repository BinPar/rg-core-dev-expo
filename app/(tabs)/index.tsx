import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WebView from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';
import { defaultOfflineWebBasePath } from '@/logic/getBasePath';
import createViewer from '@/logic/createViewer';


export default function HomeScreen() {

  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    const main = async () => {
      await createViewer()
      setReady(true)
    }
    main().catch()
  }, [])

  console.log({defaultOfflineWebBasePath})

  return (
    <WebView 
    allowFileAccess
    allowUniversalAccessFromFileURLs
    allowFileAccessFromFileURLs
    domStorageEnabled
    startInLoadingState
    allowingReadAccessToURL={`${defaultOfflineWebBasePath}`}
    source={ready ? {
      baseUrl: `${defaultOfflineWebBasePath}`,
      uri: `${defaultOfflineWebBasePath}/index.html`
    } : undefined}
    
    onLoadEnd={() => {

    }}/>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
