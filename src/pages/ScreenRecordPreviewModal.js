import React from 'react';
import { Modal, ModalBody, ModalHeader, Button, Row } from 'reactstrap';
import RecordRTC from 'recordrtc';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export default function ScreenRecordPreviewModal({
  recorder, isOpenVideoModal, videoModalClose, recordedVideoUrl, isLoaded
}) {
  // const [isLoaded, setIsLoaded] = useState(false);

  // Download option for screen record
  const downloadScreenRecordVideo = () => {
      let recorderBlob = recorder;

      if (!recorderBlob) {
          return;
      }

      if (isSafari) {
          if (recorderBlob && recorderBlob.getDataURL) {
              recorderBlob.getDataURL(function (dataURL) {
                  RecordRTC.SaveToDisk(dataURL, getFileName('mp4'));
              });
              return;
          }
      }

      if (recorderBlob) {
          var blob = recorderBlob;
          var file = new File([blob], getFileName('mp4'), {
              type: 'video/mp4'
          });
          RecordRTC.invokeSaveAsDialog(file);
      }
  };

  // Get file name 
  const getFileName = (fileExtension) => {
      var d = new Date();
      var year = d.getFullYear();
      var month = d.getMonth();
      var date = d.getDate();
      return 'ScreenRecord-' + year + month + date + '-' + getRandomString() + '.' + fileExtension;
  }

  // Get random string for file name
  const getRandomString = () => {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        let a = window.crypto.getRandomValues(new Uint32Array(3));
        let token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
  }
    
  return (
    <Modal isOpen={isOpenVideoModal}>
      <ModalHeader className="video__modal__header" toggle={videoModalClose} >
        <span className="bold-text">Preview</span>
      </ModalHeader>
      <ModalBody >
        <video id="videorecord"
          controls
          // controlsList="nodownload"
          autoPlay={isLoaded}
          playsInline
          width={'100%'} height={'100%'}
          src={recordedVideoUrl} 
        />
        <Row className='downloadButtonAlign' >
          <Button color='primary' outline onClick={downloadScreenRecordVideo}>
            Download file
          </Button>
        </Row>
      </ModalBody>
    </Modal>
  );
}

