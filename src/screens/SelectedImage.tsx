import { Button, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { CommonActions, useNavigation } from '@react-navigation/native';
import Video, { VideoRef } from 'react-native-video';

const SelectedImage = ({route}:any) => {
  const navigation = useNavigation();
  const {videoData, ImageData} = route.params;
  console.log("image data...", ImageData);
  const [apiCalled, setApiCalled]= useState<Boolean>(false);
  const [data, setData] = useState<null|object>(null);
  const videoRef = useRef<VideoRef>(null);
  const [giveUpModal, setGiveUpModal] = useState<Boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<Boolean>(true);
  
  const handleAccept = () => {
    setIsModalOpen(false);
    setApiCalled(true);
  };

  const handleNotNow = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if(apiCalled) {
      setTimeout(() => {
        setData({videoData, ImageData});
      }, 2000);
    } 
  }, [apiCalled]);

  const cancelProcess = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'ChooseVideo'}],
      })
    )
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.closeButton}>
        <TouchableOpacity onPress={() => {setGiveUpModal(true)}}>
          <Text>X</Text>
        </TouchableOpacity>
      </View>
      {/* <Text>SelectedVideo</Text> */}
      {
        data ? <Video
          source={{uri: videoData.uri}}
          ref={videoRef}
          controls={true}
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
        ? <Text>Your video is coming soon...</Text>
        : <Text>Your task is processing...</Text>
      }
      
      {
        data ? <TouchableOpacity
          onPress={() => {
            navigation.navigate('ExportScreen', {
              data: data
            })
          }}
          style={styles.buttonStyle}
        >
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity> : apiCalled
        ? <Text>Please don't lock the screen or switch the app</Text>
        : <TouchableOpacity
        onPress={() => {
          // navigation.navigate('ExportScreen', {
          //   data: data
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
              <Text style={styles.acceptText}>Accept</Text>
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
    position: 'relative'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#A027F2',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  acceptText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notNowText: {
    color: 'white',
    fontSize: 14,
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
    borderColor: 'black',
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