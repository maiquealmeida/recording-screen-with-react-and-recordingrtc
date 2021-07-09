//ScreenRecording.jsx
import React, { useState, useEffect } from "react";
import RecordRTC from "recordrtc";
import ScreenRecordPreviewModal from "./ScreenRecordPreviewModal";
import { Button, Row, Col, Container, Card, CardBody } from "reactstrap";
import { FiVideo, FiStopCircle } from "react-icons/fi";

let recorder;

export default function ScreenRecording() {
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [isOpenVideoModal, setIsOpenVideoModal] = useState(false);
  const [screen, setScreen] = useState(null);
  const [camera, setCamera] = useState(null);
  const [recordPreview, setRecordPreview] = useState(null);
  const [startDisable, setStartDisable] = useState(false);
  const [stopDisable, setStopDisable] = useState(true);
  const [loadModal, setLoadModal] = useState(false);

  //to enable audio and video pass true to disable pass false
  const captureCamera = (cb) => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,//make it true for video
    }).then(cb);
  }

  //access your screen width and height  using window object adjusting camera position ,height and width  //after that pass screen and camera to recordrtc/and call startrecording method using recorder object to //start screen recording
  const startScreenRecord = async () => {
      await setStopDisable(false);
      await setStartDisable(true);
      
      captureScreen((screen) => {
        captureCamera(async (camera) => {
          screen.width = window.screen.width;
          screen.height = window.screen.height;
          screen.fullcanvas = true;
          
          camera.width = 320;
          camera.height = 240;
          camera.top = screen.height - camera.height;
          camera.left = screen.width - camera.width;
        
          setScreen(screen);
          setCamera(camera);
      
          recorder = RecordRTC([screen, camera], {
            type: "video",
          });
          recorder.startRecording();
          recorder.screen = screen;
        });
      })
  };
    //to capture screen  we need to make sure that which media devices are captured and add listeners to // start and stop stream
  const captureScreen = (callback) => {
      invokeGetDisplayMedia((screen) => {
        addStreamStopListener(screen, () => {});
        callback(screen);
      }, (error) => {
        console.error(error);
        alert("Unable to capture your screen. Please check console logs.\n" + error);
        setStopDisable(true);
        setStartDisable(false);
      });
  }

  const stopLocalVideo = async (screen, camera) => {
      [screen, camera].forEach(async (stream) => {
        stream.getTracks().forEach(async (track) => {
          track.stop();
        });
      });
  }

  const invokeGetDisplayMedia = (success, error) => {
      var displaymediastreamconstraints = {
        video: {
          displaySurface: "monitor", //Possible options: monitor, window, application, browser
          logicalSurface: true,
          cursor: "always" // Possible options: never, always, motion
        }
      };

      displaymediastreamconstraints = {
        video: true,
        audio: true,
      };

      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
      } else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
      }
  }
  
  const addStreamStopListener = (stream, callback) => {
      stream.addEventListener("ended", () => {
        callback();
        callback = () => { };
      }, false);
      
      stream.addEventListener("inactive", () => {
        callback();
        callback = () => { };
      }, false);
      
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          callback();
          callback = () => { };
        }, false);

        track.addEventListener("inactive", () => {
          callback();
          callback = () => { };
        }, false);
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };
  }

  const stopScreenRecording = () => {
    setStartDisable(true);
    recorder.stopRecording(stopScreenRecordingCallback);
  }
  
  const stopScreenRecordingCallback = async () => {
    await stopLocalVideo(screen, camera);
    
    let recordedVideoUrl;
    if (recorder.getBlob()) {
      setRecordPreview(recorder.getBlob());
    
      recordedVideoUrl = URL.createObjectURL(recorder.getBlob());
    }

    setRecordedVideoUrl(recordedVideoUrl);
    setScreen(null);
    setIsOpenVideoModal(true);
    setStartDisable(false);
    setStopDisable(true);
    setCamera(null);
    
    recorder.screen.stop();
    recorder.destroy();
    recorder = null;
  }

  const videoModalClose = () => {
    setIsOpenVideoModal(false);
  }

  const openModal = async () => {
    await setLoadModal(false);
  }

  useEffect(() => {
    window.onbeforeunload = openModal; 
  }, [])

  return (
    <div>
      <Container className="pt-5">
        <div className="centerCard">
          <div className="shadow">
            <Card >
              <CardBody>
                <Row>
                  <Col sm={12}>
                    <h3 className="text-dark pb-2 textShadowHead text-center">Screen Recording Test</h3>
                    <h5 className="text-primary my-2">Please, follow the below steps to do screen recording:</h5>
                    <p className="mt-0 mb-1 textShadowPara">- Click on start recording</p>
                    <p className="mt-0 mb-1 textShadowPara pr-1">- Select the screen type</p>
                    <p className="mt-0 mb-1 textShadowPara pl-1">- Click on share button to confirm recording</p><br/>
                    <p className="pb-3 mt-0 mb-1 textShadowPara">After started, click on stop recording to stop and preview videos.</p>
                  </Col  >
                </Row>
                <Row>
                  <div className="footerButtons">
                      <Button color="primary" className="mb-1" outline onClick={() => startScreenRecord()} disabled={startDisable}>
                        <FiVideo   /> Start Recording
                      </Button  >
                      <Button color="danger" onClick={() => stopScreenRecording()} disabled={stopDisable}>
                        <FiStopCircle/> Stop Recording
                      </Button  >
                  </div>

                  <Col sm={12} className="text-center">
                    {startDisable && <h3 className="text-success pt-2">Recording...</h3> }
                    {startDisable && <h3 className="text-warning pt-2">(Please dont refresh page)</h3>}
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </div>
        <ScreenRecordPreviewModal
          isOpenVideoModal={isOpenVideoModal}
          videoModalClose={videoModalClose}
          recordedVideoUrl={recordedVideoUrl}
          recorder={recordPreview}
        />
      </Container  >
    </div>
   )
  }


