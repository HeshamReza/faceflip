import { Button, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { CommonActions, useNavigation } from '@react-navigation/native';
import Video, { VideoRef } from 'react-native-video';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const SelectedImage = ({route}:any) => {
  const navigation = useNavigation();
  const {videoData, apiKey, videoFile, ImageData, imageFile} = route.params;
  // console.log("image data...", ImageData);
  const [apiCalled, setApiCalled]= useState<Boolean>(false);
  const [data, setData] = useState<null|object>(null);
  const videoRef = useRef<VideoRef>(null);
  const [giveUpModal, setGiveUpModal] = useState<Boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<Boolean>(true);
  
  const handleAccept = async() => {
    setIsModalOpen(false);
    // setApiCalled(true);
    const imposeForm = new FormData();
    imposeForm.append("video_file", videoFile);
    imposeForm.append("image_file", imageFile);
    try {
      setApiCalled(true);
      const result = await axios.post('http://192.168.0.137:5000/start_impose_video', imposeForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        }
      });
      console.log("result...", result.data);
      setData(result.data);
    } catch (error) {
      console.log(error);
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
        const result = await axios.post('http://192.168.0.137:5000/download_file', downloadForm, {
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

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.closeButton}>
        <TouchableOpacity onPress={() => {setGiveUpModal(true)}}>
          <Text style={{color: 'white'}}>X</Text>
        </TouchableOpacity>
      </View>
      {/* <Text>SelectedVideo</Text> */}
      {
        data ? <Video
          source={{uri: videoData.uri}}
          ref={videoRef}
          controls={false}
          paused={true}
          resizeMode='contain'
          // onBuffer={onBuffer}
          // onError={onError}
          // style={styles.backgroundVideo}
          style={{width: '100%', height: 600}}
        /> : <View style={styles.imageContainer}>
          <View style={styles.imageContainer2}>
            <Image
              source={{uri: ImageData.uri}}
              style={{width: '100%', height: '100%'}}
            />
          </View>
        </View>
      }

      {
        data ? "" : apiCalled
        ? <Text style={styles.processingText}>Your video is coming soon...</Text>
        : <Text style={styles.processingText}>Your task is processing...</Text>
      }
      
      {
        data ? <TouchableOpacity
          onPress={() => {
            navigation.navigate('ExportScreen', {
              data: data,
              apiKey
            })
            // downloadVideo();
          }}
          style={styles.buttonStyle}
        >
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity> : apiCalled
        ? <Text>Please don't lock the screen or switch the app</Text>
        : <TouchableOpacity
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
      }

      <Modal visible={giveUpModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Confirm to give up?</Text>
            <Text style={styles.description}>
              All unsaved content will be lost
            </Text>
            
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
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }, mainContainer: {
    position: 'relative',
    backgroundColor: '#0A0215',
  },
  processingText: {

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
    color: 'white',
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
    borderColor: '#900FEC',
  },
  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: 20,
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