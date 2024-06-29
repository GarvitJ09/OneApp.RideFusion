# RideFusion

RideFusion is a mobile application that aggregates ride-hailing services, allowing users to compare prices and availability across multiple platforms in one place.

## Features

- Search for rides by setting pickup and drop-off locations
- Use current location for pickup
- View and compare prices from multiple ride-hailing services (currently supporting Ola, with plans to include Uber and Rapido)
- Real-time price updates every 15 seconds
- Deep linking to launch selected ride service apps
- User authentication for ride services

## Technologies Used

- React Native
- Expo
- Google Places Autocomplete API
- Ola API integration 

## Installation

1. Clone the repository:
   git clone https://github.com/yourusername/ridefusion.git

2. Navigate to the project directory:
   cd ridefusion

3. Install dependencies:
   npm install

4. Create a `.env` file in the root directory and add your Google API key:
   GOOGLE_API_KEY=your_api_key_here

5. Start the Expo development server:
   npx expo start --tunnel



## Usage

1. Open the app and grant location permissions if prompted.
2. Enter your pickup location or use the "Use Current Location" feature.
3. Enter your drop-off location.
4. Tap "Search for rides" to view available options.
5. The prices will automatically refresh every 15 seconds.
6. Tap on a ride option to open the corresponding app for booking.

## Future Enhancements

- Integration with Uber API
- Addition of Rapido services
- Ride history and favorite routes
- User profiles and preferences
- In-app booking functionality

## Contributing

Contributions to RideFusion are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Thanks to the Ola API team for providing access to their services.
- Google Places API for location autocomplete functionality.
- All contributors and testers who have helped improve RideFusion.
