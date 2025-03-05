import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const SelectedVideo = ({route}:any) => {
  const { videoData } = route.params;
  const videoRef = useRef<VideoRef>(null);
  // const background = require(video.uri);
  
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(true);
  const navigation = useNavigation();

  const handleAccept = () => {
    setIsModalOpen(false);
  };

  const handleNotNow = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.mainContainer}>
      {/* <Text>SelectedVideo</Text> */}
      <Video
        source={{uri: videoData.uri}}
        ref={videoRef}
        controls={true}
        paused={isModalOpen}
        resizeMode='contain'
        // onBuffer={onBuffer}
        // onError={onError}
        // style={styles.backgroundVideo}
        style={{width: '100%', height: 600}}
      />

      <TouchableOpacity
        onPress={() => {navigation.navigate('ChooseImage', {
          videoData: videoData
        })}}
        style={styles.buttonStyle}
      >
        <Text style={styles.buttonText}>Click to use</Text>
      </TouchableOpacity>

      <Modal visible={isModalOpen} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>User Disclaimer</Text>
            <Text style={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin viverra leo at dui venenatis, ac convallis sapien interdum. Integer ac dapibus quam, sit amet varius eros. Integer lobortis luctus odio vel viverra. Pellentesque sit amet egestas sapien. Ut dictum at dolor et auctor. Ut ornare id odio ac sagittis. Suspendisse potenti. Maecenas vitae sem dolor. Cras a ante sit amet sapien dictum viverra nec posuere urna. In eleifend arcu augue, et congue magna facilisis non. Curabitur aliquam tincidunt metus, at tempor urna pretium id. Sed tristique dui eu eleifend vehicula. Nulla placerat orci non nisi laoreet, non rhoncus orci posuere. Duis quis erat sed sapien accumsan aliquet vitae quis enim. Sed augue velit, faucibus ac odio sit amet, posuere dignissim elit.
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
};

export default SelectedVideo;

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }, mainContainer: {
    position: 'relative'
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
    color: 'white',
    fontSize: 14,
    paddingTop: 16,
    paddingBottom: 8,
  },
});