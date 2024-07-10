import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

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
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [emptyDataModalVisible, setEmptyDataModalVisible] = useState(false);

  const categories = [
    { name: 'auto', logo: auto },
    { name: 'bike', logo: bike },
    { name: 'mini', logo: mini },
    { name: 'suv', logo: suv },
  ];

  //   const filteredRides = allRides.filter(
  //     (ride) => serviceToFilterMap[ride.service] === selectedCategory
  //   );

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

  const [bookingStatus, setBookingStatus] = useState({});

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
          ? 'https://7764-49-43-243-85.ngrok-free.app/ola/ride-search'
          : 'https://7764-49-43-243-85.ngrok-free.app/uber/ride-search',
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
          ? 'https://7764-49-43-243-85.ngrok-free.app/ola/ride-cancel'
          : 'https://7764-49-43-243-85.ngrok-free.app/uber/ride-cancel',
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setBookingStatus((prev) => ({ ...prev, [appName]: 'cancelled' }));
      })
      .catch((error) => {
        console.log(error);
        setBookingStatus((prev) => ({ ...prev, [appName]: 'failed' }));
      })
      .finally(() => {
        if (
          Object.values(bookingStatus).every((status) => status !== 'waiting')
        ) {
          setLoadingModalVisible(false);
          setDetailsModalVisible(true);
        }
      });

    // Add null check before filtering
    setRideDetails((prevDetails) => {
      if (prevDetails === null) return null;
      return prevDetails.filter((detail) => detail.id !== bookingId);
    });
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
              styles.tab,
              selectedCategory === category.name && styles.selectedTab,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Image source={category.logo} style={styles.categoryLogo} />
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No rides available for this category
          </Text>
        }
      />

      <TouchableOpacity style={styles.bookButton} onPress={handleBookRides}>
        <Text style={styles.bookButtonText}>Book your ride</Text>
      </TouchableOpacity>

      {/* Loading Modal */}

      {/* Loading Modal */}
      {/* Loading Modal */}
      <Modal visible={loadingModalVisible} animationType='slide' transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking in Progress</Text>
            {Object.entries(bookingStatus).map(([app, status]) => (
              <View key={app} style={styles.detailsContainer}>
                <Text style={styles.detailText}>Booking with {app}</Text>
                {status === 'waiting' ? (
                  <>
                    <ActivityIndicator size='small' color='#4CAF50' />
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() =>
                        handleCancelBooking(selectedRides[app].id, app)
                      }
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : status === 'completed' ? (
                  <Text style={styles.detailText}>Completed</Text>
                ) : status === 'cancelled' ? (
                  <Text style={styles.detailText}>Cancelled</Text>
                ) : (
                  <Text style={styles.detailText}>Failed</Text>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setLoadingModalVisible(false);
                if (
                  Object.values(bookingStatus).some(
                    (status) => status === 'completed'
                  )
                ) {
                  setDetailsModalVisible(true);
                }
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Details Modal */}
      <Modal visible={detailsModalVisible} animationType='slide' transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            {rideDetails && rideDetails.length > 0 ? (
              rideDetails.map((details) => (
                <View key={details.id} style={styles.detailsContainer}>
                  <Text style={styles.detailText}>
                    Driver Name: {details.data.driverName}
                  </Text>
                  <Text style={styles.detailText}>
                    Vehicle Type: {details.data.vehicleType}
                  </Text>
                  <Text style={styles.detailText}>
                    Waiting Minutes: {details.data.waitingMinutes}
                  </Text>
                  <Text style={styles.detailText}>App: {details.app}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${details.data.phoneNumber}`)
                    }
                  >
                    <Text style={styles.phoneNumber}>
                      Phone: {details.data.phoneNumber}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text>No ride details available.</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Empty Data Modal */}
      <Modal visible={emptyDataModalVisible} animationType='slide' transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>No Rides Selected</Text>
            <Text style={styles.modalText}>
              Please select at least one ride before booking.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEmptyDataModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  selectedTab: {
    backgroundColor: '#4CAF50',
  },
  categoryLogo: {
    width: 30,
    height: 30,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  rideInfo: {
    flex: 1,
  },
  rideType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 14,
    color: '#666',
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  detailsContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  phoneNumber: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AvailableRidesScreen;
