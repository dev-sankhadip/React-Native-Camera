import React, {Component} from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  CameraRoll, 
  PermissionsAndroid, 
  Button,
  ScrollView,
  Image,
  Alert
} from 'react-native';

import {RNCamera, FaceDetector} from 'react-native-camera';
import {createAppContainer, createStackNavigator} from 'react-navigation';
import Video from 'react-native-video';
import MusicFiles from 'react-native-get-music-files';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import SoundRecorder from 'react-native-sound-recorder';



class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          /*androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          /*onGoogleVisionBarcodesDetected={({ barcodes }) => {
            console.log(barcodes);
          }}*/
        />
        <View style={{ flex: 0, flexDirection: 'row' }}>
          <TouchableOpacity onPress={this.takePicture} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> SNAP </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.takeVideo} style={styles.capture}>
            <Text style={{fontSize:14}}>RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.stopVideo} style={styles.capture}>
            <Text style={{fontSize:14}}>STOP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.capture} onPress={this.takeAudio}>
            <Text style={{fontSize:14}}>AUDIO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.capture} onPress={this.stopAudio}>
            <Text style={{fontSize:14}}>AUDIO ST</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{width:100, height:100}} onPress={this.goGallery}>
            <Text style={{fontSize:14, color:'red'}}>Gallery</Text>
          </TouchableOpacity>

          {/*<TouchableOpacity onPress={this.takeAudio} style={styles.capture}>
            <Text style={{fontSize:14}}>AUDIO</Text>
          </TouchableOpacity>*/}
        </View>
      </View>
    );
  }
  takeAudio=()=>{
    SoundRecorder.start(SoundRecorder.PATH_CACHE + '/test.mp4')
    .then(function() {
        console.log('started recording');
    });
  }
  stopAudio=()=>
  {
    SoundRecorder.stop()
    .then(function(result) {
        console.log('stopped recording, audio file saved at: ' + result.path);
    });
  }
  goGallery=()=>
  {
    this.props.navigation.navigate('Gallery');
  }

  takePicture = async (props)=> {
    if (this.camera) {
      //const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync({doNotSave:false, quality:0.5});
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Cool Photo App Storage Permission',
              message:
                'Cool Photo App needs access to your storage ' +
                'so you can save awesome pictures.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the camera');
            CameraRoll.saveToCameraRoll(data.uri);
          } else {
            console.log('Camera permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
    }
  }


  takeVideo=async ()=>
  {
    if(this.camera)
    {
      const data = await this.camera.recordAsync({doNotSave:false, maxDuration:60});
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Cool Photo App Storage Permission',
            message:
              'Cool Photo App needs access to your storage ' +
              'so you can save awesome pictures.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          CameraRoll.saveToCameraRoll(data.uri);
        } else {
          console.warn('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }
  stopVideo=()=>
  {
    this.camera.stopRecording();
  }
}


class ImageView extends Component
{

  state={
    image:[],
    video:[],
    audio:[]
  }
  loadImage=()=>
  {
    //video search
    CameraRoll.getPhotos({
      first:1,
      assetType:'Videos'
    })
    .then((r)=>{
      this.setState({
        video:r.edges
      })
    })
    .catch((error)=>{
      console.warn(error);
    })

    //photo search
    CameraRoll.getPhotos({
      first:1,
      assetType:'Photos'
    })
    .then((r)=>{
      this.setState({
        image:r.edges
      })
    })
    .catch((error)=>{
      console.warn(error)
    })

    //music files search
    MusicFiles.getAll({
      blured : true, // works only when 'cover' is set to true
      artist : true,
      duration : true, //default : true
      cover : false, //default : true,
      genre : true,
      title : true,
      cover : true,
      minimumSongDuration : 10000 // get songs bigger than 10000 miliseconds duration,
  }).then(tracks => {
      // do your stuff...
      console.log(tracks[0]);
      this.setState({
        audio:tracks
      })
  }).catch(error => {
      // catch the error
      console.warn(error);
  })
  }
  render() {
    return (
      <View>
        <Button title="Load Images" onPress={this.loadImage} />
        <ScrollView>
          {this.state.image.map((p, i) => {
          return (
            <Image
              key={i}
              style={{
                width: 500,
                height: 300,
              }}
              source={{ uri: p.node.image.uri }}
            />
          );
        })}
        </ScrollView>
        <View>
          {this.state.video.map((p,i)=>{
            return(
              <Video key={i} source={{uri:p.node.image.uri}} style={{width:500, height:500}} controls={true} />
            )
          })}
        </View>
        <View>
          
        </View>
      </View>
    );
   }
}


const AppNavigator=createStackNavigator(
  {
    Camera:App,
    Gallery:ImageView
  },
  {
    initialRouteName:'Camera'
  }
)

export default createAppContainer(AppNavigator);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    height:40
  },
});
