import { Image, PermissionsAndroid, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef } from 'react';
import Video, { VideoRef } from 'react-native-video';
import { imagesPath } from '../assets/imagesPath';
import Share from 'react-native-share';
import { CommonActions, useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';

const ExportScreen = ({route}:any) => {
  const { data } = route.params;
  const videoRef = useRef<VideoRef>(null);
  console.log("data...", data);
  const navigation = useNavigation();

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

  const requestStoragePermission = async () => {
    try {
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
        downloadFile();
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.warn(error);
    }
  }

  return (
    <ScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelProcess}>
          <Image source={imagesPath.backArrow} style={styles.backArrow}/>
        </TouchableOpacity>
        <Text style={styles.headerText}>Export Successful</Text>
      </View>

      <Video
        source={{uri: data.videoData.uri}}
        ref={videoRef}
        controls={true}
        paused={true}
        resizeMode='contain'
        // onBuffer={onBuffer}
        // onError={onError}
        // style={styles.backgroundVideo}
        style={{width: '100%', height: 600}}
      />

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