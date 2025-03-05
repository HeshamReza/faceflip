import { Button, Image, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { imagesPath } from '../assets/imagesPath';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';

const ChooseVideo = () => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
  const [pickerResponse, setPickerResponse] = useState<null|object>(null);
  const [imageFromDB, setImageFromDB] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string|null>(null);
  console.log("device id...", deviceId);

  const fetchDeviceId = async () => {
    // const id = await DeviceInfo.getUniqueId();
    // setDeviceId(id);
  };

  useEffect(() => {
    fetchDeviceId();
  }, []);

  // console.log("picker response...", pickerResponse);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openImagesLibrary = async () => {
    const options = {
      mediaType: 'video',
      durationLimit: 15,
      includeBase64: true
    };

    if(Platform.OS === 'android') {
      if(Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        if(
          granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED
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
              navigation.navigate('SelectedVideo', {
                videoData: response.assets[0]
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
              navigation.navigate('SelectedVideo', {
                videoData: response.assets[0]
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
        <View style={styles.buttonArea}>
          <LinearGradient
            colors={['transparent', '#1A0B32E6', '#1A0B32']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{flex: 1, paddingTop: 60,}}
          >
            <Text style={styles.buttonAreaHeader}>Choose a Classic Portrait Video</Text>
            <Text style={styles.buttonAreaSubtitle}>Don't worry, we won't save your videos. We will delete videos after analyzing facial features.</Text>
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
                  <Text style={styles.modalHeader}>Select video from one of the option</Text>
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

export default ChooseVideo;

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
    // backgroundColor: '#1A0B3299',
    // backgroundColor: 'linear-gradient(to bottom right, #00000000, #1A0B3299)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  modalView: {
    position: 'absolute',
    display: 'flex',
    // justifyContent: 'space-between',
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
  imageButton: {
    width: 60,
    height: 60,
    margin: 'auto',
  },
});