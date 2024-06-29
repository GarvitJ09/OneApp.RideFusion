// HomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import locationIcon from '../assets/current-location.png';
import axios from 'axios';
// import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-virtualized-view';
import { WebView } from 'react-native-webview';
import ola from '../assets/ola.png';
import uber from '../assets/uber1.png';
import rapido from '../assets/rapido.png';
import Icon from 'react-native-vector-icons/Ionicons';
import AvailableRidesModal from '../component/AvailableRidesModal.js';

const FareItem = ({ service, price, logo, onPress }) => {
  return (
    <TouchableOpacity style={styles.fareItem} onPress={onPress}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.service}>{service}</Text>
      <Text style={styles.price}>{price}</Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  // const [modalVisible, setModalVisible] = useState(false);
  const [allRides, setAllRides] = useState([]);
  const [loginStatusVerify, setLoginStatusVerify] = useState(false);
  const googlePlacesRef = useRef(null);
  const webviewRef = useRef(null);
  const navigation = useNavigation();
  const [app, setApp] = useState('');
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLocationCoor, setPickupLocationCoor] = useState({
    latitude: '',
    longitude: '',
  });
  const [dropLocation, setDropLocation] = useState('');
  const [dropLocationCoor, setDropLocationCoor] = useState({
    latitude: '',
    longitude: '',
  });

  const [isFareModalVisible, setIsFareModalVisible] = useState(false);
  const [fares, setFares] = useState([]);

  const [panelVisible, setPanelVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(400))[0];
  const [searchRideLoading, setSearchRideLoading] = useState(false);

  //Uber api
  const [loading, setLoading] = useState(false);
  const [injectedJS, setInjectedJS] = useState('');
  const [shouldRefreshOlaPrices, setShouldRefreshOlaPrices] = useState(false);

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.error) {
      console.error('Error:', data.error);
    } else {
      console.log('Data:', data);
    }
    setLoading(false);
  };

  const handleSetPickupLocation = (data) => {
    setPickupLocation(data);
    console.log('Pickup Location Set:', pickupLocation);
    console.log('Pickup Location Passed:', data);
  };

  const handleSetDropLocation = (data) => {
    setDropLocation(data);
    console.log('Drop Location Set:', dropLocation);
    console.log('Drop Location Passed:', data);
  };

  const handleSetPickupLocationCoor = (data) => {
    setPickupLocationCoor(data);
    console.log('Pickup Location Coor Set:', pickupLocationCoor);
    console.log('Pickup Location Coor Passed:', data);
  };

  const handleSetDropLocationCoor = (data) => {
    setDropLocationCoor(data);
    console.log('Drop Location Coor Set:', dropLocationCoor);
    console.log('Drop Location Coor Passed:', data);
  };

  const handlePickupSelect = async (data, details) => {
    handleSetPickupLocationCoor({
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });

    handleSetPickupLocation(details.formatted_address);

    // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pickupLocationCoor.latitude},${pickupLocationCoor.longitude}&key=AIzaSyDoY8kaH8X6P2dhE0-FadrN5VOwfkt4Dwk&sensor=true`;
    // await fetch(url)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     if (data.status === 'OK') {
    //       const address = data.results[0].formatted_address;
    //       handleSetPickupLocation(address);
    //     } else {
    //       console.error('Error:', data.status);
    //     }
    //   })
    //   .catch((error) => console.error('Error:', error));
  };

  const handleDropSelect = async (data, details) => {
    // console.log(details);
    handleSetDropLocationCoor({
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });

    handleSetDropLocation(details.formatted_address);

    // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${details.geometry.location.lat},${details.geometry.location.lng}&key=AIzaSyDoY8kaH8X6P2dhE0-FadrN5VOwfkt4Dwk&sensor=true`;
    // await fetch(url)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     if (data.status === 'OK') {
    //       const address = data.results[0].formatted_address;
    //       handleSetDropLocation(address);
    //     } else {
    //       console.error('Error:', data.status);
    //     }
    //   })
    //   .catch((error) => console.error('Error:', error));
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location services to use this feature.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const currentLatitude = location.coords.latitude;
      const currentLongitude = location.coords.longitude;

      handleSetPickupLocationCoor({
        latitude: currentLatitude,
        longitude: currentLongitude,
      });

      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLatitude,
        longitude: currentLongitude,
      });

      const address = addressResponse[0];
      // console.log(address);
      handleSetPickupLocation(`${address.formattedAddress || ''}`.trim());

      if (googlePlacesRef.current) {
        googlePlacesRef.current.setAddressText(
          `${address.formattedAddress || ''}`.trim()
        );
      }
      // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pickupLocationCoor.latitude},${pickupLocationCoor.longitude}&key=AIzaSyDoY8kaH8X6P2dhE0-FadrN5VOwfkt4Dwk&sensor=true`;
      // await fetch(url)
      //   .then((response) => response.json())
      //   .then((data) => {
      //     if (data.status === 'OK') {
      //       const address = data.results[0].formatted_address;
      //       handleSetPickupLocation(address);
      //     } else {
      //       console.error('Error:', data.status);
      //     }
      //   })
      //   .catch((error) => console.error('Error:', error));
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch current location. Please try again later.'
      );
    }
  };

  const fetchOlaPrices = async () => {
    const url = `https://book.olacabs.com/data-api/category-fare/p2p?pickupLat=${pickupLocationCoor.latitude}&pickupLng=${pickupLocationCoor.longitude}&pickupMode=NOW&leadSource=desktop_website&dropLat=${dropLocationCoor.latitude}&dropLng=${dropLocationCoor.longitude}&silent=false&suggestPickup=true`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const categories = responseData.data.p2p.categories;

      const formattedFares = Object.entries(categories).map(
        ([key, value], index) => ({
          id: index + 1,
          service: key.charAt(0).toUpperCase() + key.slice(1),
          price: value.price,
          fareId: value.fareId,
          logo: ola,
          app: 'ola',
          deepLink: `olacabs://app/launch?lat=${pickupLocationCoor.latitude}&lng=${pickupLocationCoor.longitude}&drop_lat=${dropLocationCoor.latitude}&drop_lng=${dropLocationCoor.longitude}`,
        })
      );

      setAllRides((prevRides) => {
        const nonOlaRides = prevRides.filter((ride) => ride.app !== 'ola');
        return [...nonOlaRides, ...formattedFares];
      });
      console.log(allRides);
      // setFares((prevFares) => {
      //   const nonOlaFares = prevFares.filter((fare) => fare.app !== 'ola');
      //   return [...nonOlaFares, ...formattedFares];
      // });
    } catch (error) {
      console.error('There was a problem fetching the Ola fare data:', error);
    }
  };
  const handleCloseFareModal = () => {
    setIsFareModalVisible(false);
    setShouldRefreshOlaPrices(false);
  };
  const handleSearchRides = async () => {
    // Check if both pickupLocation and dropLocation are selected
    if (
      pickupLocationCoor.latitude &&
      pickupLocationCoor.longitude &&
      dropLocationCoor.latitude &&
      dropLocationCoor.longitude &&
      dropLocation &&
      pickupLocation
    ) {
      try {
        setSearchRideLoading(true);

        const deepLink = {
          ola: `olacabs://app/launch?lat=${pickupLocationCoor.latitude}&lng=${pickupLocationCoor.longitude}&drop_lat=${dropLocationCoor.latitude}&drop_lng=${dropLocationCoor.longitude}`,
          uber: `uber://?action=setPickup&pickup[latitude]=${pickupLocationCoor.latitude}&pickup[longitude]=${pickupLocationCoor.longitude}&dropoff[latitude]=${dropLocationCoor.latitude}&dropoff[longitude]=${dropLocationCoor.longitude}`,
          rapido: 'https://rapido.bike',
        };

        //uber graphql api
        // try {
        //   const uberResponse = await fetchUberPrices();
        //   handleUberData(uberResponse);
        // } catch (error) {
        //   console.error('Error fetching Uber data:', error);
        // }

        //ola api
        const url = `https://book.olacabs.com/data-api/category-fare/p2p?pickupLat=${pickupLocationCoor.latitude}&pickupLng=${pickupLocationCoor.longitude}&pickupMode=NOW&leadSource=desktop_website&dropLat=${dropLocationCoor.latitude}&dropLng=${dropLocationCoor.longitude}&silent=false&suggestPickup=true`;
        await fetchOlaPrices(url); // Initial fetch
        setShouldRefreshOlaPrices(true);

        setIsFareModalVisible(true);
      } catch (error) {
        console.error('There was a problem fetching the fare data:', error);
        return null;
      } finally {
        setSearchRideLoading(false); // Hide loading bar
      }

      //Check uber price

      // try {
      //   const response = await axios.get('https://sandbox-api.uber.com/v1.2/estimates/price', {
      //     params: {
      //       start_latitude: 12.923759,
      //       start_longitude: 77.6639824,
      //       end_latitude: 12.9788206,
      //       end_longitude: 77.7148979,
      //     },
      //     headers: {
      //       Authorization: `Bearer QCOlre2KITHY6vTGE9hfnMu72Y8I2XskLOsUOcKj`,
      //       'Accept-Language': 'en_US',
      //       'Content-Type': 'application/json',
      //     },
      //   });
      //   setFareEstimate(response.data);
      //   console.log(response.data)
      // } catch (error) {
      //   console.error('Error fetching fare estimate:', error);
      // }

      // Navigate to next screen and pass the locations as params
      // console.log('Pickup:', pickupLocationCoor);
      // console.log('Drop:', dropLocationCoor);
      // navigation.navigate('Uber', {
      //   startLatitude: pickupLocationCoor.latitude,
      //   startLongitude: pickupLocationCoor.longitude,
      //   endLatitude: dropLocationCoor.latitude,
      //   endLongitude: dropLocationCoor.longitude,
      //   pickupLocation: pickupLocation,
      //   dropLocation: dropLocation,
      // });

      // navigation.navigate('Ola', {
      //   startLatitude: pickupLocationCoor.latitude,
      //   startLongitude: pickupLocationCoor.longitude,
      //   endLatitude: dropLocationCoor.latitude,
      //   endLongitude: dropLocationCoor.longitude,
      //   pickupLocation: pickupLocation,
      //   dropLocation: dropLocation,
      // });

      //    const uberDeepLink = `uber://?action=setPickup&pickup[latitude]=${startLatitude}&pickup[longitude]=${startLongitude}&dropoff[latitude]=${endLatitude}&dropoff[longitude]=${endLongitude}&dropoff[nickname]=${destinationName}`;
      //
      //    Linking.openURL(uberDeepLink).catch(err => console.error("Couldn't load page", err));
    } else {
      alert('Please select both pickup and drop locations.');
    }
  };

  const handleAuthenticateApp = (app) => {
    // Handle authentication for the selected app
    console.log(`Authenticate ${app}`);
    setLoginStatusVerify(true);
    if (app === 'Ola') {
      setApp('Ola');
      // Replace this URL with the actual Ola authentication URL
      // setAuthUrl('https://accounts.olacabs.com/');
      setAuthUrl('https://book.olacabs.com/');
      setIsAuthModalVisible(true);
    } else if (app === 'Uber') {
      setApp('Uber');
      // Replace this URL with the actual Ola authentication URL
      setAuthUrl('https://m.uber.com/');
      setIsAuthModalVisible(true);
    }
    // Implement your authentication logic here
  };

  const handleAuthComplete = async (event) => {
    // Check if the URL indicates successful authentication
    if (app === 'Ola') {
      // fetch('https://accounts.olacabs.com/api/verify')
      //   .then((response) => {
      //     if (
      //       response.status == 'SUCCESS' &&
      //       response.message == 'OTP verified successfully!'
      //     ) {
      //       // setIsAuthenticated(true);
      //       console.log('Ola Authenticated');
      //       setIsAuthModalVisible(false);
      //     } else {
      //       console.log('Ola Not Authenticated');
      //       // console.error('Error:', response.message);
      //       s;
      //     }
      //   })
      //   .catch((error) => console.error('Error:', error));
      // Handle successful authentication (e.g., update state, show message)
    }
  };

  const togglePanel = () => {
    const toValue = panelVisible ? 400 : 0;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
    setPanelVisible(!panelVisible);
  };

  // const handleFareItemPress = async (app) => {
  //   let url;
  //   switch (app.toLowerCase()) {
  //     case 'ola':
  //       url = `olacabs://app/launch?lat=${pickupLocationCoor.latitude}&lng=${pickupLocationCoor.longitude}&drop_lat=${dropLocationCoor.latitude}&drop_lng=${dropLocationCoor.longitude}`;
  //       break;
  //     case 'uber':
  //       url = `uber://?action=setPickup&pickup[latitude]=${pickupLocationCoor.latitude}&pickup[longitude]=${pickupLocationCoor.longitude}&dropoff[latitude]=${dropLocationCoor.latitude}&dropoff[longitude]=${dropLocationCoor.longitude}`;
  //       break;
  //     case 'rapido':
  //       // Replace with actual Rapido deep link if available
  //       url = 'https://rapido.bike';
  //       break;
  //     default:
  //       console.log('Unknown service');
  //       return;
  //   }
  //   Linking.openURL(url).catch(err => console.error(`An error occurred while opening ${app} deeplink`, err));

  // };

  //uber graphql query
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

  useEffect(() => {
    let intervalId;

    if (shouldRefreshOlaPrices) {
      intervalId = setInterval(() => {
        fetchOlaPrices();
      }, 15000); // 15000 milliseconds = 15 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shouldRefreshOlaPrices, pickupLocationCoor, dropLocationCoor]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000' />

      {/* Add the settings icon */}
      <TouchableOpacity style={styles.settingsIcon} onPress={togglePanel}>
        <Icon name='settings-outline' size={24} color='#fff' />
      </TouchableOpacity>

      {/* Add the sliding panel */}
      <Animated.View
        style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
      >
        <TouchableOpacity style={styles.closePanel} onPress={togglePanel}>
          <Icon name='close-outline' size={30} color='#000' />
        </TouchableOpacity>
        <Text style={styles.panelTitle}>Authenticate your apps</Text>
        <View style={styles.iconList}>
          <TouchableOpacity
            style={styles.iconItem}
            onPress={() => handleAuthenticateApp('Ola')}
          >
            <Image source={ola} style={[styles.olaLogo]} />
            <Text>Ola</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconItem}
            onPress={() => handleAuthenticateApp('Uber')}
          >
            <Image source={uber} style={[styles.uberLogo]} />
            <Text>Uber</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconItem}
            onPress={() => handleAuthenticateApp('Rapido')}
          >
            <Image source={rapido} style={[styles.rapidoLogo]} />
            <Text>Rapido</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <View style={styles.content}>
        <Text style={styles.title}>RideFusion</Text>
        {/* <Text style={styles.}>Plan your ride</Text> */}

        <View style={styles.inputContainer}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder='Enter pickup location'
            minLength={2}
            onFail={(err) => console.error(err)}
            fetchDetails={true}
            listViewDisplayed='auto'
            onPress={handlePickupSelect}
            query={{
              key: process.env.GOOGLE_API_KEY,
              language: 'en',
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.textInput,
              listView: styles.listViewFirst,
            }}
            value={pickupLocation}
            // textInputProps={{
            //   value: pickupLocation,
            //   onChangeText: (text) => setPickupLocation(text),
            // }}
          />
        </View>
        {/* Use Current Location */}
        <TouchableOpacity
          style={styles.currentLocation}
          onPress={handleUseCurrentLocation}
        >
          <Image source={locationIcon} style={styles.locationIcon} />
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <GooglePlacesAutocomplete
            placeholder='Enter drop location'
            minLength={2}
            onFail={(err) => console.error(err)}
            fetchDetails={true}
            listViewDisplayed='auto'
            query={{
              key: process.env.GOOGLE_API_KEY,
              language: 'en',
            }}
            onPress={handleDropSelect}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.textInput,
              listView: styles.listViewSecond,
            }}
          />
        </View>
        {searchRideLoading && (
          <ActivityIndicator
            size='50'
            color='#4CAF50'
            style={styles.searchRideLoading}
          />
        )}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchRides}
        >
          <Text style={styles.buttonText}>Search for rides</Text>
        </TouchableOpacity>

        <Modal
          visible={isAuthModalVisible}
          onRequestClose={() => setIsAuthModalVisible(false)}
          animationType='slide'
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <WebView
                source={{ uri: authUrl }}
                onNavigationStateChange={handleAuthComplete}
                style={styles.webview}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsAuthModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <AvailableRidesModal
          isVisible={isFareModalVisible}
          onClose={handleCloseFareModal}
          allRides={allRides}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    margin: 15,
    paddingBottom: 25,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  textInput: {
    height: 40,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 5,
    paddingLeft: 10,
  },
  listViewFirst: {
    backgroundColor: '#333',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  listViewSecond: {
    backgroundColor: '#333',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 420,
    margin: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentLocation: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically
    marginBottom: 10,
    margin: 15, // Padding around the icon container
    borderRadius: 5, // Border radius for rounded corners
    width: '100%', // Ensure full width
  },
  currentLocationText: {
    color: '#4CAF50',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  locationIcon: {
    backgroundColor: '#4CAF50', // Background color of the icon

    width: 20, // Adjust width as needed
    height: 20, // Adjust height as needed
    marginRight: 10,
  },
  authContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  authLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  authButtonsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  authButton: {
    width: 80,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  authButtonText: {
    color: 'white',
    fontSize: 14,
  },
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
  fareModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  fareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  fareService: {
    fontSize: 16,
    color: '#fff',
  },
  farePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fareItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fareLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  fareService: {
    fontSize: 16,
    color: '#fff',
  },
  farePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  settingsIcon: {
    position: 'absolute',
    top: 25,
    right: 20,
    zIndex: 2,
  },
  panel: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: '50%',
    height: '110%',
    backgroundColor: '#f0f0f0',
    padding: 20,
    zIndex: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  iconList: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closePanel: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 3,
  },
  olaLogo: {
    width: 30,
    height: 30,
  },
  uberLogo: {
    width: 30,
    height: 30,
  },
  rapidoLogo: {
    width: 30,
    height: 30,
  },
  fareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  service: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  searchRideLoading: {
    marginTop: 50,
  },
});

export default HomeScreen;
