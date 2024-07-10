import React, { useState, useRef } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { axios } from 'axios';

const UnifiedLogin = ({ isVisible, onClose, onAuthComplete, loginType }) => {
  const webViewRef = useRef(null);
  const getAuthUrl = () => {
    if (loginType === 'Ola') {
      //   return 'https://accounts.olacabs.com/';
      return 'https://book.olacabs.com/';
    } else if (loginType === 'Uber') {
      return 'https://m.uber.com/';
    }
    return '';
  };

  const handleLoadStart = async (event) => {
    const { url } = event.nativeEvent;
    if (url.includes('/go')) {
      saveCookies();
      onAuthComplete(loginType);
      //   onClose();
    }
  };

  const saveCookies = async () => {
    try {
      const url = getAuthUrl();
      // const cookies = await CookieManager.get(url);
      // console.log(cookies);
      // Store cookies locally
      // await AsyncStorage.setItem(`${loginType}Cookies`, JSON.stringify(cookies));

      // Send cookies to the backend (uncomment and adjust as needed)
      // await axios.post(
      //   'https://your-backend-url.com/save-cookies',
      //   {
      //     appName: loginType,
      //     cookies: cookies,
      //   }
      // );

      console.log('Cookies saved successfully');
    } catch (error) {
      console.error('Error saving cookies: ', error);
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
          <WebView
            ref={webViewRef}
            source={{ uri: getAuthUrl() }}
            onLoadStart={handleLoadStart}
            style={styles.webview}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
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
});

export default UnifiedLogin;
