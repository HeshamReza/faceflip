import { ActivityIndicator, Animated, Button, Dimensions, Easing, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { CommonActions, useNavigation } from '@react-navigation/native';
import Video, { VideoRef } from 'react-native-video';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { imagesPath } from '../assets/imagesPath';
import RNFS from 'react-native-fs';
import Svg, { Circle } from 'react-native-svg';

const SelectedImage = ({route}:any) => {
  const navigation = useNavigation();
  const {videoData, apiKey, videoFile, ImageData, imageFile} = route.params;
  // console.log("image data...", ImageData);
  const [apiCalled, setApiCalled]= useState<Boolean>(false);
  const [data, setData] = useState<null|object>(null);
  const [errorStatus, setErrorStatus] = useState<Boolean>(false);
  const videoRef = useRef<VideoRef>(null);
  const [giveUpModal, setGiveUpModal] = useState<Boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<Boolean>(true);
  const [waitingTime, setWaitingTime] = useState<Number>(0);
  const [seconds, setSeconds] = useState<string>("00");
  const [minutes, setMinutes] = useState<string>("00");
  const [videoUrl, setVideoUrl] = useState<string|null>(null);
  // console.log("video url...", videoUrl);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);
  const [currentTime, setCurrentTime] = useState<Number>(0);
  const [duration, setDuration] = useState<Number>(0);
  const [lastPosition, setLastPosition] = useState<Number>(0);
  const [playButtonOpacity, setPlayButtonOpacity] = useState<Number>(1);
  const [loading, setLoading] = useState<Boolean>(false);
  const [progress, setProgress] = useState<Number>(0);
  const [finalError, setFinalError] = useState<Boolean>(false);

  const togglePlayback = () => {
    setPlayButtonOpacity(1);
    if(!isPlaying) {
      videoRef.current.seek(lastPosition);
    } else {
      setLastPosition(currentTime);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setLastPosition(0);
  };

  const { width } = Dimensions.get('window');

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: width - 40,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let timer;
    if(apiCalled) {
      if(!data) {
        timer = setInterval(() => {
          setWaitingTime(prev => prev + 1);
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [apiCalled, data]);

  useEffect(() => {
    if(waitingTime > 0) {
      const sec = waitingTime % 60;
      if(sec > 9) {
        setSeconds(sec.toString());
      } else {
        setSeconds(`0${sec}`);
      }
    }
  }, [waitingTime]);

  useEffect(() => {
    if(waitingTime > 0) {
      const min = Math.floor(waitingTime / 60);
      if(min > 9) {
        setMinutes(min.toString());
      } else {
        setMinutes(`0${min}`);
      }
    }
  }, [waitingTime]);
  
  const handleAccept = async() => {
    setIsModalOpen(false);
    // setApiCalled(true);
    const imposeForm = new FormData();
    imposeForm.append("video_file", videoFile);
    imposeForm.append("image_file", imageFile);
    try {
      setApiCalled(true);
      // PushNotification
      const result = await axios.post('http://192.168.0.137:5002/start_impose_video', imposeForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      console.log("result...", result.data);
      setData(result.data);
    } catch (error) {
      console.log(error);
      setErrorStatus(true);
    }
  };

  const handleNotNow = () => {
    navigation.goBack();
  };

  // useEffect(() => {
  //   if(apiCalled) {
  //     setTimeout(() => {
  //       setData({videoData, ImageData});
  //     }, 2000);
  //   } 
  // }, [apiCalled]);

  const cancelProcess = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'ChooseVideo'}],
      })
    )
  };

  const downloadVideo = async () => {
    if(data) {
      const downloadForm = new FormData();
      downloadForm.append("file_name", data.filename);
      console.log("image form...", downloadForm);
      try {
        const result = await axios.post('http://192.168.0.137:5002/download_file', downloadForm, {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": `Bearer ${apiKey}`,
          }
        });
        // console.log(result.data);
        navigation.navigate('ExportScreen', {
          data: result.data
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const blobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const fetchVideo = async () => {
    const downloadForm = new FormData();
    if(data) {
      setLoading(true);
      setProgress(0);
      downloadForm.append("file_name", data.filename);

      let interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev))
      }, 500);
      try {
        const result = await axios.post('http://192.168.0.137:5002/download_file', downloadForm, {
          headers: {
            "Content-Type": 'multipart/form-data',
            "Authorization": `Bearer ${apiKey}`,
          },
          responseType: 'blob',
        });
        // console.log("data...", result.data);
        const filePath = `${RNFS.DocumentDirectoryPath}/video.mp4`;
        console.log("filePath...", filePath);
        
        const base64Data = await blobToBase64(result.data);
        await RNFS.writeFile(filePath, base64Data, 'base64');

        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setVideoUrl(`file://${filePath}`);
          setLoading(false);
        }, 5000);

        const fileExists = await RNFS.exists(filePath);
        if(fileExists) {
          console.log("✅ Video saved successfully:", filePath);
        } else {
          console.error("❌ Video file was not saved.");
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setFinalError(true);
      }
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [data]);
  
  useEffect(() => {
    if(isPlaying) {
      let currentOpacity = 1;
      const interval = setInterval(() => {
        currentOpacity -= 0.3;
        setPlayButtonOpacity(Math.max(0, currentOpacity));

        if(currentOpacity <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if(duration === currentTime) {
      setPlayButtonOpacity(1);
    }
  }, [duration, currentTime]);

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.closeButton}>
        <TouchableOpacity onPress={() => {setGiveUpModal(true)}}>
          <Image source={imagesPath.close} style={{width: 16, height: 16}} />
        </TouchableOpacity>
      </View>
      {/* <Text>SelectedVideo</Text> */}
      {
        videoUrl
        ? <View style={{width: "100%", height: 600, position: 'relative',}}>
            <Video
              source={{uri: videoUrl}}
              ref={videoRef}
              paused={!isPlaying}
              resizeMode='contain'
              onEnd={handleVideoEnd}
              onProgress={(data) => setCurrentTime(data.currentTime)}
              onLoad={(data) => setDuration(data.duration)}
              style={{width: '100%', height: "100%"}}
            />
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <Image source={isPlaying ? imagesPath.pauseButton : imagesPath.playButton} style={{width: 50, height: 50, opacity: playButtonOpacity, margin: 'auto'}} />
            </TouchableOpacity>
          </View>
        : data
          ? finalError
            ? <View>
              <Text>Error processing on video.</Text>
            </View>
            : <View style={{width: '100%', height: 500, padding: 20, position: 'relative'}}>
                {/* <Animated.View style={[styles.circle, { transform: [{rotate: spin}]}]} /> */}

                <View style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
                  <ActivityIndicator size="large" color="blue" style={{margin: 'auto', zIndex: 10}} />
                </View>
                <Image
                  source={{uri: ImageData.uri}}
                  style={{width: '100%', height: "100%", borderRadius: 8,}}
                />
              </View>
          : errorStatus
            ? <View style={styles.imageContainer}>
                <Text style={styles.processingText}>Failed during processing.</Text>
              </View>
            : <View style={styles.imageContainer}>
              {
                apiCalled && (
                  <>
                    <Animated.View
                      style={[
                        styles.glowingLine,
                        {
                          transform: [{translateX}],
                          opacity: 0.3,
                          width: 10,
                          marginLeft: -5,
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.glowingLine,
                        {
                          transform: [{translateX}]
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.glowingLine,
                        {
                          transform: [{translateX}],
                          opacity: 0.3,
                          width: 10,
                        }
                      ]}
                    />
                  </>
                )
              }
              <View style={styles.imageContainer2}>
                <Image
                  source={{uri: ImageData.uri}}
                  style={{width: '100%', height: '100%', borderRadius: 8,}}
                />

                

                {/* Top-Left Corner */}
                <View style={[styles.corner, styles.topLeft]} />
                
                {/* Top-Right Corner */}
                <View style={[styles.corner, styles.topRight]} />
                
                {/* Bottom-Left Corner */}
                <View style={[styles.corner, styles.bottomLeft]} />
                
                {/* Bottom-Right Corner */}
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
      }

      <View style={{width: '100%', display: 'flex', flexDirection: 'column', height: 200}}>
        {
          videoUrl
          ? null
          : finalError
            ? null
            : data
              ? errorStatus
                ? null
                : <Text style={styles.processingText}>Your video is coming soon...</Text>
              : apiCalled
                ? <Text style={styles.processingText}>Your task is processing... {minutes}:{seconds}</Text>
                : null
        }
        
        {
          videoUrl
          ? <View style={styles.finalButtonStyle}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ExportScreen', {
                    data: data,
                    apiKey,
                    videoUrl
                  })
                  // downloadVideo();
                }}
                style={styles.buttonStyle}
              >
                <Text style={styles.buttonText}>Export</Text>
              </TouchableOpacity>
            </View>
          : finalError
            ? null
            : apiCalled
              ? errorStatus
                ? null
                : apiCalled
                  ? <TouchableOpacity
                    onPress={() => {
                      // navigation.navigate('ExportScreen', {
                      //   data: data,
                      //   apiKey
                      // })
                    }}
                    style={styles.buttonStyle}
                  >
                    <Text style={styles.buttonText}>Wait in background</Text>
                  </TouchableOpacity>
                  : null
              : <Text style={styles.waitingText}>Please don't lock the screen or switch the app</Text>
        }
      </View>

      <Modal visible={giveUpModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Confirm to give up?</Text>
            <Text style={styles.description}>
              All unsaved content will be lost
            </Text>

            <View style={{width: '115%', height: 1, backgroundColor: '#2A3549',}}></View>
            
            <View style={styles.buttonsRow}>
              {/* Accept Button */}
              <TouchableOpacity style={styles.cancelButton} onPress={() => {setGiveUpModal(false)}}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* Not Now Button */}
              <TouchableOpacity style={styles.okButton} onPress={cancelProcess}>
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isModalOpen} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>User Disclaimer</Text>
            <Text style={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
            </Text>
            
            {/* Accept Button */}
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <LinearGradient
                colors={['#9A0EF9', '#9A0EF933', '#3F63EF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={{padding: 14, borderRadius: 8, width: '100%', justifyContent: 'center', alignItems: 'center',}}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Not Now Button */}
            <TouchableOpacity onPress={handleNotNow}>
              <Text style={styles.notNowText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default SelectedImage

const styles = StyleSheet.create({
  closeButton: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
  },
  finalButtonStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
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
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: "#6683E1",
    borderTopColor: "transparent", // Creates a spinning effect
    position: 'absolute',
    top: "45%",
    left: "50%",
    zIndex: 50,
  },
  mainContainer: {
    position: 'relative',
    backgroundColor: '#0A0215',
  },
  processingText: {
    textAlign: 'center',
    color: 'white',
  },
  waitingText: {
    textAlign: 'center',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    height: '100%',
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#1C2D4D',
    width: '85%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontWeight: 400,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#A027F2',
    // paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  notNowText: {
    color: '#FFFFFF99',
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    padding: 20,
  },
  imageContainer2: {
    width: '100%',
    height: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#3C3B3F',
    position: 'relative',
  },
  glowingLine: {
    width: 5, // Adjust thickness
    height: "100%", // Full height
    backgroundColor: "#6683E1", // Glowing white
    shadowColor: "#5C3E7F",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 20, // Adjust glow effect
    zIndex: 50,
    position: 'absolute',
    top: 20,
    left: 20,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,  // Adjust size of corners
    height: 30,
    borderColor: 'purple', // Change to match your design
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between'
  },
  cancelButton: {
    width: '45%',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
  },
  okButton: {
    width: '45%',
    backgroundColor: '#A027F2',
    padding: 10,
    borderRadius: 10,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  okText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})