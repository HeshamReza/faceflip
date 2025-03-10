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
  const [apiCalled, setApiCalled] = useState<Boolean>(false);

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
    setApiCalled(true);
    try {
      const result = await axios.post('http://192.168.0.137:5002/image_upload', imageForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      // console.log(result.data);
      setApiCalled(false);
      navigation.navigate('SelectedImage', {
        videoData,
        apiKey,
        videoFile,
        ImageData: image,
        imageFile: result.data.filename
      });
    } catch (error) {
      console.log(error);
      setApiCalled(false);
    }
  }
  
  const requestMediaPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          // For Android 13+ request READ_MEDIA_IMAGES permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
  
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("✅ Video permission granted");
            return true;
          } else {
            console.log("❌ Video permission denied");
            return false;
          }
        } else {
          // For Android <13 use READ_EXTERNAL_STORAGE
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
  
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("✅ Storage permission granted");
            return true;
          } else {
            console.log("❌ Storage permission denied");
            return false;
          }
        }
      } catch (error) {
        console.error("Error requesting permission:", error);
        return false;
      }
    }
  };

  const openImagesLibrary = async () => {
    const hasPermission = await requestMediaPermission();

    if(!hasPermission) {
      console.log("User denied permission");
      closeModal();
    }
    const options = {
      mediaType: 'image',
      includeBase64: true
    };
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
    });

    // if(Platform.OS === 'android') {
    //   if(Platform.Version >= 33) {
    //     const granted = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    //     );
    //     if(granted === PermissionsAndroid.RESULTS.GRANTED) {
    //       launchImageLibrary(options, (response) => {
    //         if(response.didCancel) {
    //           // navigation.goBack();
    //           console.log('User cancelled');
    //         } else if(response.errorCode) {
    //           // setPickerResponse(null);
    //           console.log('Image picker error:', response.errorMessage);
    //         } else {
    //           // setPickerResponse(response);
    //           // navigation.navigate('SelectedImage', {
    //           //   ImageData: response.assets[0],
    //           //   videoData: videoData
    //           // });
    //           uploadImageFile(response.assets[0]);
    //         }
    //         // navigation.goBack();
    //         // console.log(response);
    //         setIsModalOpen(false);
    //       })
    //     } else {
    //       console.log("No permission");
    //     }
    //   } else {
    //     const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    //     if(granted === PermissionsAndroid.RESULTS.GRANTED) {
    //       launchImageLibrary(options, (response) => {
    //         if(response.didCancel) {
    //           // navigation.goBack();
    //           console.log('User cancelled');
    //         } else if(response.errorCode) {
    //           // setPickerResponse(null);
    //           console.log('Image picker error:', response.errorMessage);
    //         } else {
    //           // setPickerResponse(response);
    //           // navigation.navigate('SelectedImage', {
    //           //   ImageData: response.assets[0],
    //           //   videoData: videoData
    //           // });
    //           uploadImageFile(response.assets[0]);
    //         }
    //         // navigation.goBack();
    //         // console.log(response);
    //         setIsModalOpen(false);
    //       })
    //     } else {
    //       console.log("No permission");
    //     }
    //   }
    // }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={{position: 'absolute', top: 0, bottom: '50%', left: 0, right: 0, zIndex: 1}}>
          <LinearGradient
            colors={['#0000004D', '#0000001A', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{flex: 1}}
          >
            <View style={{display: 'flex', justifyContent: 'flex-start', padding: 10}}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={imagesPath.backArrow} style={{width: 20, height: 20}}/>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.backgroundImageArea}>
          {/* middle image */}
          <View style={{width: 150, height: 150, borderRadius: 9999, position: 'absolute', top: 160, left: '32%'}}>
            <Image source={imagesPath.img1} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            <View style={{width: 30, height: 30, padding: 5, paddingTop: 8, backgroundColor: '#3EC167', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -40}}>
              <Image source={imagesPath.tickMark} style={{width: "100%", height: "100%",}} />
            </View>
          </View>

          {/* top left image */}
          <View style={{width: 60, height: 60, borderRadius: 9999, position: 'absolute', top: 120, left: '3%'}}>
            <Image source={imagesPath.img2} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            <View style={{width: 10, height: 10, padding: 2, backgroundColor: '#E64344', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -15, marginRight: 2, }}>
              <Image source={imagesPath.close} style={{width: "100%", height: "100%",}} />
            </View>
          </View>

          {/* bottom left image */}
          <View style={{width: 120, height: 120, borderRadius: 9999, position: 'absolute', top: 270, left: '-10%'}}>
            <Image source={imagesPath.img3} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            <View style={{width: 16, height: 16, padding: 4, backgroundColor: '#E64344', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -30, marginRight: 6, }}>
              <Image source={imagesPath.close} style={{width: "100%", height: "100%",}} />
            </View>
          </View>

          {/* middle bottom image */}
          <View style={{width: 60, height: 60, borderRadius: 9999, position: 'absolute', top: 360, left: '60%'}}>
            <Image source={imagesPath.img4} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            <View style={{width: 10, height: 10, padding: 2.5, backgroundColor: '#E64344', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -16, }}>
              <Image source={imagesPath.close} style={{width: "100%", height: "100%",}} />
            </View>
          </View>

          {/* bottom right image */}
          <View style={{width: 120, height: 120, borderRadius: 9999, position: 'absolute', top: 250, left: '80%'}}>
            <Image source={imagesPath.img5} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            {/* <View style={{width: 16, height: 16, padding: 4, backgroundColor: '#E64344', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -30, marginRight: 6, }}>
              <Image source={imagesPath.close} style={{width: "100%", height: "100%",}} />
            </View> */}
          </View>

          {/* top right image */}
          <View style={{width: 100, height: 100, borderRadius: 9999, position: 'absolute', top: 75, left: '78%'}}>
            <Image source={imagesPath.img6} style={{width: "100%", height: "100%", borderRadius: 9999, objectFit: 'cover',}}/>
            {/* <View style={{width: 16, height: 16, padding: 4, backgroundColor: '#E64344', borderRadius: 50, alignItems: 'center', marginLeft: 'auto', marginTop: -30, marginRight: 6, }}>
              <Image source={imagesPath.close} style={{width: "100%", height: "100%",}} />
            </View> */}
          </View>
        </View>
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
                <Text style={styles.buttonText}>{apiCalled ? "Loading..." : 'I got it!'}</Text>
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
    backgroundColor: '#0A0215',
  },
  backgroundImageArea: {
    // display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // padding: 10,
    backgroundColor: '#A027F2',
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