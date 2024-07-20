import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

import { PORT } from '@env';

import auto from '../assets/auto.png';
import bike from '../assets/bike.png';
import mini from '../assets/mini.png';
import suv from '../assets/suv.png';
import CustomCheckBox from '../component/CustomCheckBox.js';

const serviceToFilterMap = {
  Auto: 'auto',
  Bike: 'bike',
  Mini: 'mini',
  Prime: 'mini',
  Sedan: 'mini',
  Suv: 'suv',
  'Uber Auto': 'auto',
  'Uber Go': 'mini',
  Moto: 'bike',
  Premier: 'mini',
  UberXL: 'suv',
  'Go Sedan': 'mini',
  'XL Plus': 'suv',
  UberXS: 'mini',
};

const AvailableRidesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { allRides, pickupLat, pickupLng, dropLat, dropLng } = route.params;

  const [selectedCategory, setSelectedCategory] = useState('auto');
  const [selectedRides, setSelectedRides] = useState({});
  const [rideDetails, setRideDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [emptyDataModalVisible, setEmptyDataModalVisible] = useState(false);
  const [animation, setAnimation] = useState(new Animated.Value(0));
  const [bookingStatus, setBookingStatus] = useState({});

  const categories = [
    { name: 'auto', logo: auto },
    { name: 'bike', logo: bike },
    { name: 'mini', logo: mini },
    { name: 'suv', logo: suv },
  ];

  const filteredRides = allRides.filter(
    (ride) =>
      (ride.app === 'ola' || ride.app === 'uber') &&
      serviceToFilterMap[ride.service] === selectedCategory
  );

  const handleRideSelection = (ride) => {
    setSelectedRides((prevSelectedRides) => {
      const newSelectedRides = { ...prevSelectedRides };
      if (newSelectedRides[ride.app]?.service === ride.service) {
        delete newSelectedRides[ride.app];
      } else {
        newSelectedRides[ride.app] = ride;
      }
      return newSelectedRides;
    });
  };

  const isSelected = (ride) => {
    return (
      selectedRides[ride.app] &&
      selectedRides[ride.app].service === ride.service
    );
  };

  const isDisabled = (ride) => {
    return (
      selectedRides[ride.app] &&
      selectedRides[ride.app].service !== ride.service
    );
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <CustomCheckBox
        value={isSelected(item)}
        onValueChange={() => handleRideSelection(item)}
        disabled={isDisabled(item)}
      />
      <Image source={item.logo} style={styles.logo} />
      <View style={styles.rideInfo}>
        <Text style={styles.rideType}>{item.service}</Text>
        <Text style={styles.appName}>{item.app}</Text>
      </View>
      <Text style={styles.ridePrice}>{item.price}</Text>
    </View>
  );

  const handleBookRides = () => {
    const selectedRideDetails = Object.values(selectedRides).filter(
      (ride) => ride.app === 'ola' || ride.app === 'uber'
    );

    if (selectedRideDetails.length === 0) {
      setEmptyDataModalVisible(true);
      return;
    }

    setLoadingModalVisible(true);
    setBookingStatus({});

    selectedRideDetails.forEach((ride) => {
      bookRide(ride);
    });
  };

  const bookRide = (ride) => {
    setBookingStatus((prev) => ({ ...prev, [ride.app]: 'waiting' }));

    const data = {
      pickupLatitude: pickupLat,
      pickupLongitude: pickupLng,
      dropLatitude: dropLat,
      dropLongitude: dropLng,
      rideId: ride.id,
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url:
        ride.app === 'ola'
          ? `${process.env.PORT}/ola/ride-search`
          : `${process.env.PORT}/uber/ride-search`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(data),
    };

    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 30000) // 30 seconds timeout
    );

    Promise.race([axios.request(config), timeoutPromise])
      .then((response) => {
        if (bookingStatus[ride.app] !== 'cancelled') {
          setBookingStatus((prev) => ({ ...prev, [ride.app]: 'completed' }));
          setRideDetails((prevDetails) => {
            if (prevDetails === null)
              return [
                {
                  id: ride.id,
                  app: ride.app,
                  service: ride.service,
                  data: response.data,
                },
              ];
            return [
              ...prevDetails,
              {
                id: ride.id,
                app: ride.app,
                service: ride.service,
                data: response.data,
              },
            ];
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (bookingStatus[ride.app] !== 'cancelled') {
          setBookingStatus((prev) => ({ ...prev, [ride.app]: 'failed' }));
        }
      })
      .finally(() => {
        if (
          Object.values(bookingStatus).every((status) => status !== 'waiting')
        ) {
          setLoadingModalVisible(false);
          if (
            Object.values(bookingStatus).some(
              (status) => status === 'completed'
            )
          ) {
            setDetailsModalVisible(true);
          }
        }
      });
  };

  const handleCancelBooking = (bookingId, appName) => {
    const config = {
      method: 'delete',
      maxBodyLength: Infinity,
      url:
        appName === 'ola'
          ? `${process.env.PORT}/ola/ride-cancel`
          : `${process.env.PORT}/uber/ride-cancel`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log('Cancellation response:', response.data);
        setBookingStatus((prev) => ({ ...prev, [appName]: 'cancelled' }));

        // Remove ride details from state
        setRideDetails((prevDetails) => {
          if (!prevDetails) return null;
          return prevDetails.filter((detail) => detail.id !== bookingId);
        });
      })
      .catch((error) => {
        console.log('Cancellation error:', error);
        setBookingStatus((prev) => ({ ...prev, [appName]: 'failed' }));
      })
      .finally(() => {
        // Ensure modal is hidden if all bookings are no longer waiting
        if (
          Object.values(bookingStatus).every((status) => status !== 'waiting')
        ) {
          setLoadingModalVisible(false);
          setDetailsModalVisible(true);
        }
      });
  };

  const animateModal = (toValue) => {
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (loadingModalVisible || detailsModalVisible || emptyDataModalVisible) {
      animateModal(1);
    } else {
      animateModal(0);
    }
  }, [loadingModalVisible, detailsModalVisible, emptyDataModalVisible]);

  const modalStyle = {
    transform: [
      {
        scale: animation,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' size={24} color='#000' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rides</Text>
      </View>

      <View style={styles.tabContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.tabButton,
              selectedCategory === category.name && styles.selectedTabButton,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Image source={category.logo} style={styles.tabIcon} />
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.name && styles.selectedTabText,
              ]}
            >
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRides.length === 0 ? (
        <View style={styles.noRidesContainer}>
          <Text style={styles.noRidesText}>No rides available</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => `${item.app}-${item.service}`}
          style={styles.rideList}
        />
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBookRides}
        disabled={loadingModalVisible}
      >
        <Text style={styles.bookButtonText}>Book your ride</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={loadingModalVisible}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            <Text style={styles.modalTitle}>Booking in progress...</Text>
            <ActivityIndicator size='large' color='#0000ff' />
            {Object.keys(bookingStatus).map((app) => (
              <View key={app} style={styles.bookingStatusContainer}>
                <Text style={styles.bookingStatusText}>
                  {app}: {bookingStatus[app]}
                </Text>
                {bookingStatus[app] === 'waiting' && (
                  <TouchableOpacity
                    onPress={() =>
                      handleCancelBooking(selectedRides[app]?.id, app)
                    }
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Animated.View>
        </View>
      </Modal>

      <Modal transparent={true} visible={detailsModalVisible}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            <Text style={styles.modalTitle}>Ride Details</Text>
            {rideDetails ? (
              rideDetails.map((detail) => (
                <View key={detail.id} style={styles.rideDetailItem}>
                  <Text style={styles.rideDetailText}>
                    App: {detail.app} - Service: {detail.service}
                  </Text>
                  <Text style={styles.rideDetailText}>
                    {JSON.stringify(detail.data)}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No ride details available</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal transparent={true} visible={emptyDataModalVisible}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            <Text style={styles.modalTitle}>
              Please select at least one ride.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEmptyDataModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    alignItems: 'center',
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  tabText: {
    fontSize: 16,
    color: '#000',
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
  rideList: {
    paddingHorizontal: 10,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logo: {
    width: 40,
    height: 40,
  },
  rideInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rideType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 14,
    color: '#555',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderRadius: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRidesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRidesText: {
    fontSize: 18,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rideDetailItem: {
    marginBottom: 15,
  },
  rideDetailText: {
    fontSize: 16,
    color: '#555',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bookingStatusContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  bookingStatusText: {
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#ff0000',
    marginTop: 5,
  },
});

export default AvailableRidesScreen;
