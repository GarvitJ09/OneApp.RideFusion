import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Or any other icon library you prefer
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import UberScreen from './screens/UberScreen';
import OlaScreen from './screens/OlaScreen';
import RapidoScreen from './screens/RapidoScreen';
import AvailableRidesScreen from './screens/AvailableRidesScreen';
import ola from './assets/ola.png';
import uber from './assets/uber1.png';
import rapido from './assets/rapido.png';
import { GOOGLE_API_KEY } from '@env';

import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 60,
          backgroundColor: 'white',
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'black',
        tabBarActiveBackgroundColor: '#4CAF50',
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Icon name='home' size={30} />
              <Text style={[styles.tabText, { color }]}>Home</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name='Ola'
        component={OlaScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Image source={ola} style={[styles.olaLogo]} />
              <Text style={[styles.tabText]}>Ola</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name='Uber'
        component={UberScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Image source={uber} style={[styles.uberLogo]} />
              <Text style={[styles.tabText, { color }]}>Uber</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name='Rapido'
        component={RapidoScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Image source={rapido} style={[styles.rapidoLogo]} />
              <Text style={[styles.tabText, { color }]}>Rapido</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Splash'>
        <Stack.Screen
          name='Splash'
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name='MainTabs'
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='AvailableRides'
          component={AvailableRidesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    backgroundColor: '#000',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
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
});

export default App;
