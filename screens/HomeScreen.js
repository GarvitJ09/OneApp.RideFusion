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
import { GOOGLE_API_KEY } from '@env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import locationIcon from '../assets/current-location.png';
import axios from 'axios';
// import { selectAll } from 'css-select';
// import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-virtualized-view';
import { WebView } from 'react-native-webview';
import ola from '../assets/ola.png';
import uber from '../assets/uber1.png';
import rapido from '../assets/rapido.png';
import Icon from 'react-native-vector-icons/Ionicons';
import UnifiedLogin from '../component/UnifiedLogin.js';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [allRides, setAllRides] = useState([]);
  const googlePlacesRef = useRef(null);
  const webviewRef = useRef(null);
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

  const [panelVisible, setPanelVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(400))[0];
  const [searchRideLoading, setSearchRideLoading] = useState(false);

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
          id: 2 * index + 1,
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
      return formattedFares;
    } catch (error) {
      console.error('There was a problem fetching the Ola fare data:', error);
    }
  };

  const fetchUberPrices = async (uberUrl) => {
    const url = `https://7764-49-43-243-85.ngrok-free.app/uber/scrape-prices?pickupLatitude=${pickupLocationCoor.latitude}&pickupLongitude=${pickupLocationCoor.longitude}&dropLatitude=${dropLocationCoor.latitude}&dropLongitude=${dropLocationCoor.longitude}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      const formattedFares = responseData.map((ride, index) => ({
        id: ride.rideId,
        service: ride.rideType,
        price: ride.price,
        fareId: '',
        logo: uber,
        app: 'uber',
        deepLink: `uber://?action=setPickup&client_id=RLqM9-GJjyRoc-tcJ53y_Y6yDMTFcFSe&pickup[formatted_address]=${pickupLocation}&pickup[latitude]=${pickupLocationCoor.latitude}&pickup[longitude]=${pickupLocationCoor.longitude}&dropoff[formatted_address]=${dropLocation}&dropoff[latitude]=${dropLocationCoor.latitude}&dropoff[longitude]=${dropLocationCoor.longitude}
`,
        // deepLink: `uber://?action=setPickup&pickup[latitude]=${pickupLocationCoor.latitude}&pickup[longitude]=${pickupLocationCoor.longitude}&dropoff[latitude]==${dropLocationCoor.latitude}&dropoff[longitude]=${dropLocationCoor.longitude}`,
      }));

      setAllRides((prevRides) => {
        const nonUberRides = prevRides.filter((ride) => ride.app !== 'uber');
        return [...nonUberRides, ...formattedFares];
      });

      console.log(allRides);
      return formattedFares;
    } catch (error) {
      console.error('There was a problem fetching the uber fare data:', error);
    }
  };

  const handleCloseFareModal = () => {
    setIsFareModalVisible(false);
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

        //uber api
        const uberUrl = `https://m.uber.com/go/product-selection?drop[0]={"latitude":${dropLocationCoor.latitude},"longitude":${dropLocationCoor.longitude}}&pickup={"latitude":${pickupLocationCoor.latitude},"longitude":${pickupLocationCoor.longitude}}`;
        const uberData = await fetchUberPrices(uberUrl);

        //ola api
        const olaUrl = `https://book.olacabs.com/data-api/category-fare/p2p?pickupLat=${pickupLocationCoor.latitude}&pickupLng=${pickupLocationCoor.longitude}&pickupMode=NOW&leadSource=desktop_website&dropLat=${dropLocationCoor.latitude}&dropLng=${dropLocationCoor.longitude}&silent=false&suggestPickup=true`;
        const olaData = await fetchOlaPrices(olaUrl); // Initial fetch

        const combinedRides = [...uberData, ...olaData];
        navigation.navigate('AvailableRides', {
          allRides: combinedRides,
          pickupLat: pickupLocationCoor.latitude,
          pickupLng: pickupLocationCoor.longitude,
          dropLat: dropLocationCoor.latitude,
          dropLng: dropLocationCoor.longitude,
        });
      } catch (error) {
        console.error('There was a problem fetching the fare data:', error);
        return null;
      } finally {
        setSearchRideLoading(false); // Hide loading bar
      }
    } else {
      alert('Please select both pickup and drop locations.');
    }
  };

  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [loginType, setLoginType] = useState(null);

  const handleAuthenticateApp = (app) => {
    setLoginType(app);
    setIsLoginVisible(true);
  };
  const handleAuthComplete = (app) => {
    console.log(`${app} loggedIn!`);
  };

  const togglePanel = () => {
    const toValue = panelVisible ? 400 : 0;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
    setPanelVisible(!panelVisible);
  };

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

        <UnifiedLogin
          isVisible={isLoginVisible}
          onClose={() => setIsLoginVisible(false)}
          onAuthComplete={handleAuthComplete}
          loginType={loginType}
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
