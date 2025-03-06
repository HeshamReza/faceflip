import { Button, Image, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { imagesPath } from '../assets/imagesPath';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const ChooseImage = ({route}:any) => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
  const [pickerResponse, setPickerResponse] = useState<null|object>(null);
  const [imageFromDB, setImageFromDB] = useState<string>("");

  const { videoData, apiKey, videoFile } = route.params;

  // console.log("picker response...", pickerResponse);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const uploadImageFile = async (image:object) => {
    // console.log("image...", image);
    const imageForm = new FormData();
    imageForm.append("file", {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    });
    console.log("image form...", imageForm);
    try {
      const result = await axios.post('http://192.168.0.137:5000/image_upload', imageForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      // console.log(result.data);
      navigation.navigate('SelectedImage', {
        videoData,
        apiKey,
        videoFile,
        ImageData: image,
        imageFile: result.data.filename
      });
    } catch (error) {
      console.log(error);
    }
  }

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
              // navigation.navigate('SelectedImage', {
              //   ImageData: response.assets[0],
              //   videoData: videoData
              // });
              uploadImageFile(response.assets[0]);
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
              // navigation.navigate('SelectedImage', {
              //   ImageData: response.assets[0],
              //   videoData: videoData
              // });
              uploadImageFile(response.assets[0]);
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
      {/* <View style={styles.container}>
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
      </View> */}
      <View style={styles.container}>
        <View style={styles.buttonArea}>
          <LinearGradient
            colors={['transparent', '#1A0B32E6', '#1A0B32']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{flex: 1, paddingTop: 60,}}
          >
            <Text style={styles.buttonAreaHeader}>Choose a Classic Portrait Selfie</Text>
            <Text style={styles.buttonAreaSubtitle}>Don't worry, we won't save your photos. We will delete photos after analyzing facial features.</Text>
            <TouchableOpacity
              onPress={() => {setIsModalOpen(true)}}
              style={styles.buttonStyle}
            >
              <LinearGradient
                colors={['#9A0EF9', '#9A0EF933', '#3F63EF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={{flex: 1, padding: 14, borderRadius: 16}}
              >
                <Text style={styles.buttonText}>I got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <Modal
          animationType='slide'
          transparent={true}
          visible={isModalOpen}
          onRequestClose={() => {closeModal()}}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <View style={styles.modalTopLine}></View>
                <View style={styles.modalArea}>
                  <Text style={styles.modalHeader}>Select image from one of the option</Text>
                  <Pressable onPress={() => {openImagesLibrary()}}>
                    <View style={styles.imageButtonBox}>
                      <Image source={imagesPath.gallery} style={styles.imageButton} />
                    </View>
                  </Pressable>
                </View>
                </View>
            </View>
          </TouchableWithoutFeedback>
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
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  buttonArea: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonAreaHeader: {
    fontSize: 40,
    fontWeight: 500,
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonAreaSubtitle: {
    fontSize: 14,
    fontWeight: 400,
    color: '#ffffff80',
    textAlign: 'center',
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonStyle: {
    width: 240,
    // margin: 'auto',
    marginTop: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 40,
    backgroundColor: '#A027F2',
    // padding: 10,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    position: 'relative',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalView: {
    position: 'absolute',
    display: 'flex',
    // justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 100,
    elevation: 10,
    backgroundColor: '#182439',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTopLine: {
    width: 100,
    height: 2,
    backgroundColor: 'white',
    marginTop: 6,
    borderRadius: 2,
  },
  modalArea: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: 20,
  },
  modalHeader: {
    fontSize: 14,
    fontWeight: 400,
    color: 'white',
    // marginTop: 20,
  },
  imageButtonBox: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#9415FA',
    borderRadius: 4,
  },
  imageButton : {
    width: 60,
    height: 60,
    margin: 'auto',
  },
});