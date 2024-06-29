import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
  Button,
} from 'react-native';
import auto from '../assets/auto.png';
import bike from '../assets/bike.png';
import mini from '../assets/mini.png';
import suv from '../assets/suv.png';

// Define a mapping of service types to filter categories
const serviceToFilterMap = {
  Auto: 'auto',
  Bike: 'bike',
  Mini: 'mini',
  Prime: 'mini', // Grouping Prime under Mini
  Sedan: 'mini',
  Suv: 'suv',
  // Add more mappings as needed
};

const AvailableRidesModal = ({ isVisible, onClose, allRides }) => {
  const [selectedCategory, setSelectedCategory] = useState('auto');
  const categories = [
    { name: 'auto', logo: auto },
    { name: 'bike', logo: bike },
    { name: 'mini', logo: mini },
    { name: 'suv', logo: suv },
  ];

  useEffect(() => {
    // console.log('Modal visibility:', isVisible);
    // console.log('All rides:', allRides);
  }, [isVisible, allRides]);

  const filteredRides = allRides.filter(
    (ride) => serviceToFilterMap[ride.service] === selectedCategory
  );

  const handleDeepLinkNavigation = (url) => {
    console.log(url);
    Linking.openURL(url).catch((err) =>
      console.error(`An error occurred while opening ${app} deeplink`, err)
    );
  };

  const renderRideItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rideItem}
      onPress={() => handleDeepLinkNavigation(item.deepLink)}
    >
      <Image source={item.logo} style={styles.logo} />
      <View style={styles.rideInfo}>
        <Text style={styles.rideType}>{item.service}</Text>
        <Text style={styles.appName}>{item.app}</Text>
      </View>
      <Text style={styles.ridePrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType='slide' transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Available Rides</Text>

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
                <Image source={category.logo} style={styles.olaLogo} />
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
    maxHeight: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#444',
    marginRight: 5,
  },
  selectedTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#fff',
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rideInfo: {
    flex: 1,
  },
  rideType: {
    color: '#fff',
    fontSize: 16,
  },
  appName: {
    color: '#aaa',
    fontSize: 12,
  },
  ridePrice: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  olaLogo: {
    width: 35,
    height: 35,
  },
});

export default AvailableRidesModal;
