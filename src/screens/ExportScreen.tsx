import { Image, NativeModules, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { imagesPath } from '../assets/imagesPath';
import Share from 'react-native-share';
import { CommonActions, useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const { MediaScannerConnection } = NativeModules;

const ExportScreen = ({route}:any) => {
  const { data, apiKey, videoUrl } = route.params;
  const videoRef = useRef<VideoRef>(null);
  const navigation = useNavigation();
  const [videoUrl2, setVideoUrl] = useState<string|null>(null);
  console.log("video url...", videoUrl);
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);
  const [currentTime, setCurrentTime] = useState<Number>(0);
  const [duration, setDuration] = useState<Number>(0);
  const [lastPosition, setLastPosition] = useState<Number>(0);

  const togglePlayback = () => {
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

  const shareVideo = async () => {
    const options = {
      url: videoUrl2,
      // type: data.videoData.type,
      message: 'Check out this video!',
    };

    try {
      await Share.open(options);
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const cancelProcess = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'ChooseVideo'}],
      })
    )
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
    downloadForm.append("file_name", data.filename);
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
      setVideoUrl(`file://${filePath}`);

      const fileExists = await RNFS.exists(filePath);
      if(fileExists) {
        console.log("✅ Video saved successfully:", filePath);
      } else {
        console.error("❌ Video file was not saved.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // fetchVideo();
  }, [apiKey, data]);

  const downloadVideo = async () => {
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
      setVideoUrl(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = () => {
    const {config, fs} = RNFetchBlob;
    const date = new Date();
    const fileDir = fs.dirs.DownloadDir;
    config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: fileDir + '/download_' + Math.floor(date.getDate() + date.getSeconds() / 2) + '.mp4',
        description: 'file download',
      },
    }).fetch('GET', data.videoData.uri, {})
    .then(res => {
      console.log('The file saved to', res.path());
    })
  };

  const downloadVideoFile = async () => {
    const downloadForm = new FormData();
    downloadForm.append("file_name", data.filename);
    try {
      const result = await axios.post('http://192.168.0.137:5002/download_file', downloadForm, {
        headers: {
          "Content-Type": 'multipart/form-data',
          "Authorization": `Bearer ${apiKey}`,
        },
        responseType: 'blob',
      });

      const movieDir = `${RNFS.DownloadDirectoryPath}/Faceflip`;
      const filename = `video_${Date.now()}.mp4`;
      const filePath = `${movieDir}/${filename}`;

      const dirExists = await RNFS.exists(movieDir);
      if(!dirExists) {
        await RNFS.mkdir(movieDir);
      }

      const base64Data = await blobToBase64(result.data);
      await RNFS.writeFile(filePath, base64Data, 'base64');

      // console.log('✅ Video saved:', filePath);

      // CameraRoll.save(filePath, { type: 'video' })
      //   .then(() => ToastAndroid.show("✅ Video saved to gallery!", ToastAndroid.SHORT))
      //   .catch(err => console.log("❌ Error saving to gallery:", err));

      RNFetchBlob.fs.scanFile([{ path: filePath, mime: 'video/mp4' }])
        .then(() => ToastAndroid.show("✅ Video saved to gallery!", ToastAndroid.SHORT))
        .catch(err => console.log("❌ Error saving to gallery:", err));
    } catch (error) {
      console.log(error);
    }
  };

  const requestStoragePermission = async () => {
    const date = new Date();
    const fileName = `video_${Math.floor(date.getDate() + date.getSeconds() / 2)}.mp4`;
    const moviesDir = `${RNFS.DownloadDirectoryPath}/Faceflip`;
    const newPath = `${moviesDir}/${fileName}`;
    console.log("newPath..", newPath);
    try {
      if(Platform.OS === 'android') {
        if(Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
          );
          if(granted === PermissionsAndroid.RESULTS.GRANTED) {
            // downloadVideoFile();
            
            // const fileExists = await RNFS.exists(videoUrl2);
            // if(!fileExists) {
            //   console.log("❌ Video file doesn't exist:", videoUrl2);
            // } else {
            //   const dirExists = await RNFS.exists(moviesDir);
            //   if (!dirExists) {
            //     await RNFS.mkdir(moviesDir); b
            //   } else {
            //     await RNFS.moveFile(videoUrl2, newPath);
            //     console.log('✅ Video saved to:', newPath);
            //   }
            // }
            downloadVideoFile();
          } else {
            console.log('Storage permission denied');
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Video Storage Permission',
              message: 'Faceflip need access to your storage so you can download the video',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if(granted === PermissionsAndroid.RESULTS.GRANTED) {
            // downloadVideoFile();
            
            // const fileExists = await RNFS.exists(videoUrl2);
            // if(!fileExists) {
            //   console.log("❌ Video file doesn't exist:", videoUrl2);
            // } else {
            //   const dirExists = await RNFS.exists(moviesDir);
            //   if (!dirExists) {
            //     await RNFS.mkdir(moviesDir);
            //   } else {
            //     await RNFS.moveFile(videoUrl2, newPath);
            //     console.log('✅ Video saved to:', newPath);
            //   }
            // }
            downloadVideoFile();
          } else {
            console.log('Storage permission denied');
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <ScrollView style={{backgroundColor: '#010001'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelProcess}>
          <Image source={imagesPath.backArrow} style={styles.backArrow}/>
        </TouchableOpacity>
        <View style={styles.headerTextArea}>
          <LinearGradient
            colors={['#9A0EF9', '#3F63EF']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={{borderRadius: 50, width: 20, height: 20, alignItems: 'center', padding: 4}}
          >
            <Image source={imagesPath.tickMark} style={{width: "100%", height: "100%", margin: 'auto',}} />
          </LinearGradient>
          <Text style={styles.headerText}>Export Successful</Text>
        </View>
      </View>

      {
        videoUrl && <View style={{width: "100%", height: 600, position: 'relative'}}> 
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
            <Image source={isPlaying ? imagesPath.pauseButton : imagesPath.playButton} style={{width: 50, height: 50}} />
          </TouchableOpacity>
        </View>
      }

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.okButton} onPress={shareVideo}>
          <Image source={imagesPath.share} style={styles.okImage} />
          <Text style={styles.okText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.okButton} onPress={requestStoragePermission}>
          <Image source={imagesPath.download} style={styles.okImage} />
          <Text style={styles.okText}>Download</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
};

export default ExportScreen;

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    padding: 20,
    textAlign: 'center',
  }, 
  backArrow: {
    width: 20,
    height: 20,
    // position: 'absolute',
    // zIndex: 20,
    // left: 0,
    // top: 0,
  },
  headerTextArea: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    gap: 10
  },
  headerText: {
    textAlign: 'center',
    color: 'white'
  },
  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    justifyContent: 'space-between'
  },
  okButton: {
    width: '45%',
    backgroundColor: '#A027F2',
    padding: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignContent: 'center',
  },
  okText: {
    color: 'white',
    fontWeight: 'bold',
  },
  okImage: {
    width: 20,
    height: 20,
  },
  playButton: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});