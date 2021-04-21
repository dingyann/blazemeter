import React, { useEffect, useState } from 'react';
import { getBackgroundPage } from '../common/extension';

const TransactionControls: React.FC = () => {

    const background = getBackgroundPage();

    const [recordingState, setRecordingState] = useState('');

    useEffect(() => {
        chrome.runtime.sendMessage({ command: 'check_status' }, response => setRecordingState(response.recording));

        function notificationListener(request: any) {
            switch (request.command) {
                case 'recorderNotification':
                    setRecordingState(request.observable.recording);
                    break;
            }
        }

        chrome.runtime.onMessage.addListener(notificationListener);
        return () => chrome.runtime.onMessage.removeListener(notificationListener);
    }, []);

    const canStop = recordingState !== 'stopped';
    const canPause = recordingState === 'record';
    const canResume = recordingState === 'pause';

    const stopRecording = () => {
        chrome.runtime.sendMessage({ command: 'stop_recording' }, () => {});
        chrome.extension.sendRequest({ type: 'stop_traffic' }, () => {});
        background.functionalIconBlinkMode = true;
    };

    const resumeRecording = () => {
        background.mixpanelTrack('CE Start Recording');
        chrome.runtime.sendMessage({command: 'resume_recording'}, () => {});
        chrome.extension.sendRequest({ type: 'start_traffic'}, () => {});
    };

    const pauseRecording = () => {
        background.mixpanelTrack('CE Pause Recording');
        chrome.runtime.sendMessage({command: 'pause_recording'}, () => {});
        chrome.extension.sendRequest({ type: 'pause_traffic' }, () => {});
    };


    return (
        <>
            {canStop &&
            <div id='stop' className='button_container mar' onClick={stopRecording}>
                <input type='button' className='tooltip-btn button_style gray' title='Stop recording'/>
                <i className='fa fa-stop font_style yellow_font'/>
            </div>
            }

            {canPause &&
            <div id='pause' className='button_container mar' onClick={pauseRecording}>
                <input type='button' className='tooltip-btn button_style gray' title='Pause recording'/>
                <i className='fa fa-pause font_style dark_grey_font'/>
            </div>
            }

            {canResume &&
            <div id='resume' className='button_container mar' onClick={resumeRecording}>
                <input type='button' className='tooltip-btn button_style gray' title='Resume recording'/>
                <i className='fa fa-circle font_style yellow_font'/>
            </div>
            }

        </>
    );
};

export default TransactionControls;
