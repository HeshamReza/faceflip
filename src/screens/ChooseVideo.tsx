import { Button, Image, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { imagesPath } from '../assets/imagesPath';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const ChooseVideo = () => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
  const [pickerResponse, setPickerResponse] = useState<null|object>(null);
  const [imageFromDB, setImageFromDB] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string|null>(null);
  // console.log("device id...", deviceId);
  const [apiKey, setApiKey] = useState<string|null>(null);
  // console.log("api key...", apiKey);
  const [apiCalled, setApiCalled] = useState<Boolean>(false);

  const fetchDeviceId = async () => {
    // const id = await DeviceInfo.getUniqueId();
    // setDeviceId(id);
  };

  useEffect(() => {
    fetchDeviceId();
  }, []);

  // useEffect(() => {
  //   const formdata = new FormData();
  //   formdata.append('device_id', 'iuewfweuofg')
  //   const createSession = async () => {
  //     try {
  //       const result = await axios.post('http://192.168.0.137:5002/create_session', formdata, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       });
  //       setApiKey(result.data.api_key);
  //       // console.log("result...", result.data);
  //     } catch (error) {
  //       console.log("error...", error);
  //     }
  //   };
  //   createSession();
  // }, []);

  // console.log("picker response...", pickerResponse);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen is focused");
      const formdata = new FormData();
      formdata.append('device_id', 'iuewfweuofg')
      const createSession = async () => {
        try {
          const result = await axios.post('http://192.168.0.137:5002/create_session', formdata, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          setApiKey(result.data.api_key);
          // console.log("result...", result.data);
        } catch (error) {
          console.log("error...", error);
        }
      };
      createSession();
      return () => {
        console.log("Screen is unfocused");
      }
    }, [])
  );

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const uploadVideoFile = async (video:object) => {
    const videoForm = new FormData();
    videoForm.append('file', {
      uri: video.uri,
      type: video.type,
      name: video.fileName,
    });
    console.log("videoForm...", videoForm);
    setApiCalled(true);
    try {
      const result = await axios.post('http://192.168.0.137:5002/video_upload', videoForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      // console.log(result.data);
      setApiCalled(false);
      navigation.navigate('SelectedVideo', {
        videoData: video,
        apiKey,
        videoFile: result.data.filename
      });
    } catch (error) {
      console.log(error);
      setApiCalled(false);
    }
  }

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
              // navigation.navigate('SelectedVideo', {
              //   videoData: response.assets[0],
              //   apiKey
              // });
              // console.log(response.assets[0]);
              uploadVideoFile(response.assets[0]);
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
              // navigation.navigate('SelectedVideo', {
              //   videoData: response.assets[0],
              //   apiKey
              // });
              // console.log(response.assets[0]);
              uploadVideoFile(response.assets[0]);
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
        <View style={{position: 'absolute', top: 0, bottom: '50%', left: 0, right: 0, zIndex: 1}}>
          <LinearGradient
            colors={['#0000004D', '#0000001A', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{flex: 1, paddingTop: 60,}}
          ></LinearGradient>
        </View>
        <View style={styles.backgroundImageArea}>
          <View style={styles.backgroundImageAreaCol1}>
            <Image source={imagesPath.bg1} style={styles.bgImage} />
            <Image source={imagesPath.bg2} style={styles.bgImage} />
            <Image source={imagesPath.bg3} style={styles.bgImage} />
          </View>
          <View style={styles.backgroundImageAreaCol2}>
            <Image source={imagesPath.bg4} style={styles.bgImage} />
            <Image source={imagesPath.bg5} style={styles.bgImage} />
          </View>
          <View style={styles.backgroundImageAreaCol3}>
            <Image source={imagesPath.bg6} style={styles.bgImage} />
            <Image source={imagesPath.bg7} style={styles.bgImage} />
            <Image source={imagesPath.bg1} style={styles.bgImage} />
          </View>
        </View>
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
              onPress={() => {setIsModalOpen(apiCalled ? false : true)}}
              style={styles.buttonStyle}
            >
              <LinearGradient
                colors={['#9A0EF9', '#9A0EF933', '#3F63EF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={{flex: 1, padding: 14, borderRadius: 16}}
              >
                <Text style={styles.buttonText}>{apiCalled ? "Loading..." : "I got it!"}</Text>
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
  backgroundImageArea: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#A027F2',
    height: '100%'
  },
  backgroundImageAreaCol1: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingRight: 5,
  },
  backgroundImageAreaCol2: {
    width: '33%',
    paddingTop: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 5,
  },
  backgroundImageAreaCol3: {
    width: '33%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingLeft: 5,
  },
  bgImage: {
    width: '100%',
    height: 170,
    borderRadius: 10,
  },
  buttonArea: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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