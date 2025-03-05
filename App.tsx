import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ChooseVideo from './src/screens/ChooseVideo';
import SelectedVideo from './src/screens/SelectedVideo';
import ChooseImage from './src/screens/ChooseImage';
import SelectedImage from './src/screens/SelectedImage';
import ExportScreen from './src/screens/ExportScreen';

export type RootStackParamList = {
  ChooseVideo: undefined;
  SelectedVideo: object;
  ChooseImage: object;
  SelectedImage: object;
  ExportScreen: object;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='ChooseVideo' screenOptions={{headerShown: false}}>
        <Stack.Screen
          name='ChooseVideo'
          component={ChooseVideo}
          options={{title: 'Choose Video'}}
        />
        <Stack.Screen
          name='SelectedVideo'
          component={SelectedVideo}
          options={{title: 'Selected Video'}}
        />
        <Stack.Screen
          name='ChooseImage'
          component={ChooseImage}
          options={{title: 'Choose Image'}}
        />
        <Stack.Screen
          name='SelectedImage'
          component={SelectedImage}
          options={{title: 'Selected Image'}}
        />
        <Stack.Screen
          name='ExportScreen'
          component={ExportScreen}
          options={{title: 'Export Screen'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;

const styles = StyleSheet.create({});