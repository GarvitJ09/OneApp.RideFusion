import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

const UnifiedLogin = ({ isVisible, onClose, onAuthComplete, loginType }) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'cookiesSaved') {
        Alert.alert(
          'Cookies Saved',
          'Authentication completed and cookies saved on the server'
        );
        onAuthComplete();
        onClose();
      }
    };

    return () => {
      ws.close();
    };
  }, [onAuthComplete, onClose]);

  const getAuthUrl = useCallback(() => {
    switch (loginType) {
      case 'Ola':
        return 'https://book.olacabs.com/';
      case 'Uber':
        return 'https://m.uber.com/';
      default:
        return 'https://www.ajio.com/login';
    }
  }, [loginType]);

  const INJECTED_JAVASCRIPT = `
    (function() {
      function getNonHttpOnlyCookies() {
        return JSON.stringify({
          cookies: document.cookie.split('; ').map(cookie => {
            const [name, value] = cookie.split('=');
            return {
              name,
              value,
              domain: window.location.hostname,
              path: '/',
              expires: -1,
              httpOnly: false,
              secure: window.location.protocol === 'https:',
              sameSite: 'Lax'
            };
          })
        });
      }
      window.ReactNativeWebView.postMessage(getNonHttpOnlyCookies());
    })();
  `;

  const handleNavigationStateChange = (newNavState) => {
    console.log('Current URL:', newNavState.url);
    setCurrentUrl(newNavState.url);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'urlChanged',
          url: newNavState.url,
          loginType: loginType,
        })
      );
    }

    if (newNavState.url.includes('/go')) {
      webViewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
    }
  };

  const handleMessage = async (event) => {
    console.log('Inside handleMessage');

    try {
      const cookiesData = JSON.parse(event.nativeEvent.data);
      const cookies = cookiesData.cookies || [];

      const convertedCookies = cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        size: cookie.name.length + cookie.value.length,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        session: cookie.expires === -1,
        sameSite: cookie.sameSite,
        priority: 'Medium',
        sameParty: false,
        sourceScheme: cookie.secure ? 'Secure' : 'NonSecure',
      }));

      const storageState = {
        url: currentUrl,
        cookies: convertedCookies,
        timestamp: new Date().toISOString(),
      };

      console.log(
        'Converted storage state:',
        JSON.stringify(storageState, null, 2)
      );

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'saveCookies',
            storageState: storageState,
          })
        );
      }
    } catch (error) {
      console.error('Error processing cookies:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType='slide'
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {isLoading && (
            <View style={styles.loading}>
              <ActivityIndicator size='large' color='#0000ff' />
              <Text>Loading...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: getAuthUrl() }}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            style={styles.webview}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
  },
});

export default UnifiedLogin;
