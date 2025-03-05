import { Button, Image, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { imagesPath } from '../assets/imagesPath';

const ChooseImage = ({route}:any) => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
  const [pickerResponse, setPickerResponse] = useState<null|object>(null);
  const [imageFromDB, setImageFromDB] = useState<string>("");

  const { videoData } = route.params;

  // console.log("picker response...", pickerResponse);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openImagesLibrary = async () => {
    const options = {
      mediaType: 'image',
      includeBase64: true
    };

    if(Platform.OS === 'android') {
      if(Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        if(
          granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          launchImageLibrary(options, (response) => {
            if(response.didCancel) {
              // navigation.goBack();
              console.log('User cancelled');
            } else if(response.errorCode) {
              // setPickerResponse(null);
              console.log('Image picker error:', response.errorMessage);
            } else {
              // setPickerResponse(response);
              navigation.navigate('SelectedImage', {
                ImageData: response.assets[0],
                videoData: videoData
              });
            }
            // navigation.goBack();
            // console.log(response);
            setIsModalOpen(false);
          })
        } else {
          console.log("No permission");
        }
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if(granted === PermissionsAndroid.RESULTS.GRANTED) {
          launchImageLibrary(options, (response) => {
            if(response.didCancel) {
              // navigation.goBack();
              console.log('User cancelled');
            } else if(response.errorCode) {
              // setPickerResponse(null);
              console.log('Image picker error:', response.errorMessage);
            } else {
              // setPickerResponse(response);
              navigation.navigate('SelectedImage', {
                ImageData: response.assets[0],
                videoData: videoData
              });
            }
            // navigation.goBack();
            // console.log(response);
            setIsModalOpen(false);
          })
        } else {
          console.log("No permission");
        }
      }
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text>Choose a Classic Portrait Selfie</Text>
        <TouchableOpacity
          onPress={() => {setIsModalOpen(true)}}
          style={styles.buttonStyle}
        >
          <Text style={styles.buttonText}>I got it!</Text>
        </TouchableOpacity>
        <Modal
          animationType='slide'
          transparent={true}
          visible={isModalOpen}
          onRequestClose={() => {closeModal()}}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text>Select image from one of the option</Text>
              <Pressable onPress={() => {openImagesLibrary()}}>
                <Image source={imagesPath.gallery} style={styles.imageButton} />
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
};

export default ChooseImage;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonStyle: {
    width: 200,
    margin: 'auto',
    backgroundColor: '#A027F2',
    padding: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageButton : {
    width: 60,
    height: 60
  },
  modalContainer: {
    position: 'relative',
    height: '100%'
  },
  modalView: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#fff',
    zIndex: 100,
    elevation: 10,
  }
});