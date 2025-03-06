import { Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { imagesPath } from '../assets/imagesPath';
import Share from 'react-native-share';
import { CommonActions, useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import RNFS, { read } from 'react-native-fs';

const ExportScreen = ({route}:any) => {
  const { data, apiKey } = route.params;
  const videoRef = useRef<VideoRef>(null);
  const navigation = useNavigation();
  const [videoUrl, setVideoUrl] = useState<string|null>(null);
  console.log("video url...", videoUrl);

  const shareVideo = async () => {
    const options = {
      url: data.videoData.uri,
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
      const result = await axios.post('http://192.168.0.137:5000/download_file', downloadForm, {
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
    fetchVideo();
  }, [apiKey, data]);

  const downloadVideo = async () => {
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
      const result = await axios.post('http://192.168.0.137:5000/download_file', downloadForm, {
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
      // setVideoUrl(`file://${filePath}`);

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

  const requestStoragePermission = async () => {
    const date = new Date();
    const fileName = `video_${Math.floor(date.getDate() + date.getSeconds() / 2)}.mp4`;
    const moviesDir = `${RNFS.DownloadDirectoryPath}/Faceflip`;
    const newPath = `${moviesDir}/${fileName}`;
    console.log("newPath..", newPath);
    try {
      if(Platform.OS === 'android') {
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
          
          const fileExists = await RNFS.exists(videoUrl);
          if(!fileExists) {
            console.log("❌ Video file doesn't exist:", videoUrl);
          } else {
            const dirExists = await RNFS.exists(moviesDir);
            if (!dirExists) {
              await RNFS.mkdir(moviesDir);
            } else {
              await RNFS.moveFile(videoUrl, newPath);
              console.log('✅ Video saved to:', newPath);
            }
          }
        } else {
          console.log('Storage permission denied');
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelProcess}>
          <Image source={imagesPath.backArrow} style={styles.backArrow}/>
        </TouchableOpacity>
        <Text style={styles.headerText}>Export Successful</Text>
      </View>

      {
        videoUrl && <Video
          source={{uri: videoUrl}}
          ref={videoRef}
          controls={true}
          paused={true}
          resizeMode='contain'
          // onBuffer={onBuffer}
          // onError={onError}
          // style={styles.backgroundVideo}
          style={{width: '100%', height: 600}}
        />
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
    justifyContent: 'center',
    position: 'relative',
    padding: 20,
    textAlign: 'center',
  }, 
  backArrow: {
    width: 20,
    height: 20,
    position: 'absolute',
    zIndex: 10,
    left: 0,
    top: 0,
  },
  headerText: {
    textAlign: 'center',
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
});