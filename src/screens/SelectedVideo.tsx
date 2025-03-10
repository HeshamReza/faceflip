import { Animated, Button, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { imagesPath } from '../assets/imagesPath';

const SelectedVideo = ({route}:any) => {
  const { videoData, apiKey, videoFile } = route.params;
  const videoRef = useRef<VideoRef>(null);
  // const background = require(video.uri);
  
  const [isModalOpen, setIsModalOpen] = useState<Boolean>(true);
  const navigation = useNavigation();
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);
  const [currentTime, setCurrentTime] = useState<Number>(0);
  const [duration, setDuration] = useState<Number>(0);
  const [lastPosition, setLastPosition] = useState<Number>(0);
  const [playButtonOpacity, setPlayButtonOpacity] = useState<Number>(1);
  // const [isFocused, setIsFocused] = useState<Boolean>(false);

  const togglePlayback = () => {
    setPlayButtonOpacity(1);
    if(!isPlaying) {
      videoRef.current.seek(lastPosition);
    } else {
      setLastPosition(currentTime);
    }
    setIsPlaying(!isPlaying);
  };

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

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setLastPosition(0);
  };

  const handleAccept = () => {
    setIsModalOpen(false);
  };

  const handleNotNow = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.mainContainer}>
      {/* <Text>SelectedVideo</Text> */}
      <View style={{display: 'flex', justifyContent: 'flex-start', padding: 10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={imagesPath.backArrow} style={{width: 20, height: 20}}/>
        </TouchableOpacity>
      </View>

      <Video
        source={{uri: videoData.uri}}
        ref={videoRef}
        paused={!isPlaying}
        resizeMode='contain'
        onEnd={handleVideoEnd}
        onProgress={(data) => setCurrentTime(data.currentTime)}
        onLoad={(data) => setDuration(data.duration)}
        style={styles.video}
      />

      {/* <View style={styles.timeContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(currentTime / duration) * 100}%` }]} />
        </View>
      </View> */}

      <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
        <Image source={isPlaying ? imagesPath.pauseButton : imagesPath.playButton} style={{width: 50, height: 50, opacity: playButtonOpacity, margin: 'auto',}} />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {navigation.navigate('ChooseImage', { videoData, apiKey, videoFile })}}
          style={styles.buttonStyle}
        >
          <LinearGradient
            colors={['#9A0EF9', '#9A0EF933', '#3F63EF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{flex: 1, padding: 14, borderRadius: 16}}
          >
            <Text style={styles.buttonText}>Click to use</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
                style={{padding: 14, borderRadius: 16, width: '100%', justifyContent: 'center', alignItems: 'center',}}
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
  },
  timeContainer: {
    position: 'absolute',
    bottom: 110,
    left: 10,
    right: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 5, // Thickness of the bar
    backgroundColor: '#ddd', // Background color of progress bar
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6683E1', // Color of the progress indicator
  },
  mainContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0215',
  },
  video: {
    width: '100%',
    height: 700,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  buttonStyle: {
    width: 200,
    margin: 'auto',
    marginTop: 30,
    backgroundColor: '#A027F2',
    // padding: 10,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderRadius: 16,
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
    paddingTop: 16,
    paddingBottom: 8,
  },
});