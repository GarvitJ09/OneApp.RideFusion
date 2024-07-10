import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const CustomHeader = ({ onBackPress, canGoBack }) => {
  return (
    <View style={styles.header}>
      {canGoBack && (
        <TouchableOpacity onPress={onBackPress}>
          <Icon name='arrow-back' size={24} color='#000' />
        </TouchableOpacity>
      )}
    </View>
  );
};

const UberScreen = () => {
  const webViewRef = useRef(null);

  //refeshes the webview when the screen is focused to check user if already loged in

  const [canGoBack, setCanGoBack] = useState(false);
  //  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //  const [authUrl, setAuthUrl] = useState('');
  //  const [fareEstimate, setFareEstimate] = useState(null);
  //  const [rideRequestUrl,setRideRequestUrl]=useState('');
  //  const clientId = 'RLqM9-GJjyRoc-tcJ53y_Y6yDMTFcFSe';
  //  const redirectUri = encodeURIComponent('ridefusion://callback');
  //  const scopes = encodeURIComponent('profile request');
  const [url, setUrl] = useState('https://m.uber.com/looking');
  const route = useRoute();
  const {
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude,
    pickupLocation,
    dropLocation,
  } = route.params || {};

  // console.log(route.params);
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    // console.log('In handleNavigationStateChange');
    // console.log(navState.url);
    // if (navState.url.includes('m.uber.com')) {
    //        const uberRideRequestUrl = `uber://?action=setPickup&pickup[latitude]=${startLatitude}&pickup[longitude]=&{startLongitude}&dropoff[latitude]=&{endLongitude}&dropoff[longitude]=&{endLongitude}&dropoff[nickname]=&{destinationName}`;
    //   setUrl(uberRideRequestUrl);
    //  Linking.openURL(uberRideRequestUrl).catch(err => console.error('An error occurred', err));
    // }
  };

  //  const fetchFareEstimate = async (accessToken) => {
  //    try {
  //      const response = await axios.get('https://sandbox-api.uber.com/v1.2/estimates/price', {
  //        params: {
  //          start_latitude: 12.923759,
  //          start_longitude: 77.6639824,
  //          end_latitude: 12.9788206,
  //          end_longitude: 77.7148979,
  //        },
  //        headers: {
  //          Authorization: `Bearer ${accessToken}`,
  //          'Accept-Language': 'en_US',
  //          'Content-Type': 'application/json',
  //        },
  //      });
  //      setFareEstimate(response.data);
  //      console.log(response.data)
  //    } catch (error) {
  //      console.error('Error fetching fare estimate:', error);
  //    }
  //  };

  // const fareEstimate=()=>{
  //   var options = {
  //   url: 'https://api.uber.com/v1/estimates/price',
  // 	qs: {
  // 		start_latitude: locations.start_latitude,
  // 		start_longitude: locations.start_longitude,
  // 		end_latitude: locations.end_latitude,
  // 		end_longitude: locations.end_longitude
  // 	  },
  // 	headers: {
  // 		'Authorization': 'Token '+process.env.UBER_API_KEY,
  // 	},
  // 	method: 'GET'
  // };

  // request(options)
  // .then((body)=>{
  // 	var info = JSON.parse(body);
  // 	//console.log(info);
  // 	response.send(info);
  // })
  // .catch((err)=>{
  // 	console.log('something went wrong with the uber API call');
  // 	console.log(err);
  // })
  // }

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const handleShouldStartLoadWithRequest = (event) => {
    // You can add logic here to handle specific URLs if needed
    return true; // Allow all URLs to load
  };

  const fetchUberPrices = async () => {
    const uberGraphQLQuery = `
      query Products($pickup: InputCoordinate!, $destinations: [InputCoordinate!]!) {
        products(pickup: $pickup, destinations: $destinations) {
          ...ProductsFragment
          __typename
        }
      }
      
      fragment ProductsFragment on RVWebCommonProductsResponse {
        tiers {
          ...TierFragment
          __typename
        }
        __typename
      }
      
      fragment TierFragment on RVWebCommonProductTier {
        products {
          ...ProductFragment
          __typename
        }
        title
        __typename
      }
      
      fragment ProductFragment on RVWebCommonProduct {
        capacity
        displayName
        estimatedTripTime
        fare
        __typename
      }
    `;

    const uberVariables = {
      pickup: {
        latitude: pickupLocationCoor.latitude,
        longitude: pickupLocationCoor.longitude,
      },
      destinations: [
        {
          latitude: dropLocationCoor.latitude,
          longitude: dropLocationCoor.longitude,
        },
      ],
    };

    const response = await fetch('https://m.uber.com/go/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You might need to handle CSRF token differently
        // 'X-Csrf-Token': 'Your CSRF token here'
      },
      body: JSON.stringify({
        operationName: 'Products',
        variables: uberVariables,
        query: uberGraphQLQuery,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  const handleUberData = (data) => {
    if (data.errors) {
      console.error('Errors in Uber data:', data.errors);
      return;
    }

    const uberProducts = data.data.products.tiers.flatMap((tier) =>
      tier.products.map((product) => ({
        id: product.displayName,
        service: product.displayName,
        price: product.fare ? `$${product.fare.toFixed(2)}` : 'N/A',
        estimatedTime: product.estimatedTripTime,
        logo: uber,
        app: 'uber',
        deepLink: `uber://?action=setPickup&pickup[latitude]=${pickupLocationCoor.latitude}&pickup[longitude]=${pickupLocationCoor.longitude}&dropoff[latitude]=${dropLocationCoor.latitude}&dropoff[longitude]=${dropLocationCoor.longitude}`,
      }))
    );

    setAllRides((prevRides) => [...prevRides, ...uberProducts]);
    setFares((prevFares) => [...prevFares, ...uberProducts]);
  };

  //uber graphql api
  // try {
  //   const uberResponse = await fetchUberPrices();
  //   handleUberData(uberResponse);
  // } catch (error) {
  //   console.error('Error fetching Uber data:', error);
  // }

  return (
    <View style={styles.container}>
      <CustomHeader onBackPress={handleBackPress} canGoBack={canGoBack} />

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webview}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  webview: {
    flex: 1,
  },
});

export default UberScreen;
