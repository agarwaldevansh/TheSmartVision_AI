import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import our new screens
import HomeScreen from './screens/HomeScreen';
import TextScreen from './screens/TextScreen';
import DigitScreen from './screens/DigitScreen';
import ObjectScreen from './screens/ObjectScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SmartVision Dashboard', headerShown: false }}
        />
        <Stack.Screen name="Text" component={TextScreen} options={{ title: 'Text Extraction' }} />
        <Stack.Screen name="Digit" component={DigitScreen} options={{ title: 'Digit Predictor' }} />
        <Stack.Screen name="Object" component={ObjectScreen} options={{ title: 'Object Predictor' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}