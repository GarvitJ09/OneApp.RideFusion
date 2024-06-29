import React, { useState, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const OlaScreen = () => {
  const [url, setUrl] = useState('https://book.olacabs.com/');

  const webViewRef = useRef(null);
  //refeshes the webview when the screen is focused to check user if already loged in

  const route = useRoute();
  const {
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
    pickupLocation,
    dropLocation,
  } = route.params || {};

  const constructOlaUrl = () => {
    const params = new URLSearchParams({
      pickup_lat: startLatitude,
      pickup_lng: startLongitude,
      drop_lat: endLatitude,
      drop_lng: endLongitude,
    });
    return `${url}?${params.toString()}`;
  };

  const handleNavigationStateChange = (navState) => {
    // You can handle navigation state changes here if needed
    // console.log('Current URL:', navState.url);
  };

  const handleShouldStartLoadWithRequest = (event) => {
    // You can add logic here to handle specific URLs if needed
    return true; // Allow all URLs to load
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const timer = setTimeout(() => {
  //       if (webViewRef.current) {
  //         webViewRef.current.reload();
  //         console.log('Ola WebView reloaded');
  //       }
  //     }, 1000); // Delay by 200ms

  //     return () => clearTimeout(timer);
  //   }, [])
  // );

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: constructOlaUrl() }}
      onNavigationStateChange={handleNavigationStateChange}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      style={{ flex: 1 }}
    />
  );
};

export default OlaScreen;
