

var recorderType = 'audio';
var audioObject;
var audioRecorder; // WebRtc object

var videoRecorder; // webrtc object
var videoPlayer = document.querySelector('video');


var audioContext = new window.AudioContext();


var audioInput = null,
        realAudioInput = null,
        inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var gradient;

$(document).ready(function () {
    console.log('ready');

});


function recordAudio() {

    captureUserMedia({audio: true}, function (audioStream) {
        //audioPlayer.srcObject = audioStream;
        //audioPlayer.muted = true;
        //audioPlayer.play();

        $('#audio-record-start').prop('disabled', 'disabled');
        $('#audio-play').prop('disabled', 'disabled');
        $('#audio-record-stop').prop('disabled', '');
        $('#audio-download').prop('disabled', 'disabled');

        var options = {
            mimeType : 'audio/ogg', // or video/mp4 or audio/ogg
            bitsPerSecond: 128000
        };

        /*audioRecorder = RecordRTC(audioStream, {
            type: 'audio',
            bufferSize: 0,
            sampleRate: 44100,
            leftChannel: false,
            disableLogs: false
        });*/
        
        audioRecorder = RecordRTC(audioStream, options);
        
        audioRecorder.startRecording();
        gotStream(audioStream);

        audioStream.onended = function () {
            console.log('stream ended');
        };
    }, function (error) {
        console.log(error);
    });
}



function recordVideo() {

    captureUserMedia({video: true, audio: true}, function (stream) {

        $('#video-record-start').prop('disabled', 'disabled');
        //$('#video-play').prop('disabled', 'disabled');
        $('#video-record-stop').prop('disabled', '');
        $('#video-download').prop('disabled', 'disabled');

        videoPlayer.pause();
        videoPlayer.muted = true;
        // videoPlayer.src = window.URL.createObjectURL(stream);
        videoPlayer.srcObject = stream;
        videoPlayer.load();
        videoPlayer.play();

        videoRecorder = RecordRTC(stream, {
            type: 'video',
        });

        videoRecorder.startRecording();
        gotStream(stream);

        stream.onended = function () {
            console.log('stream ended');
        };
    }, function (error) {
        console.log(error);
    });
}

function stopRecordingAudio() {
    audioRecorder.stopRecording(function (url) {
        cancelAnalyserUpdates();

        $('#audio-record-start').prop('disabled', '');
        $('#audio-play').prop('disabled', '');
        $('#audio-record-stop').prop('disabled', 'disabled');
        $('#audio-download').prop('disabled', '');

        audioObject = new Audio();
        audioObject.src = url;
    });
}

function stopRecordingVideo() {
    videoRecorder.stopRecording(function (url) {

        cancelAnalyserUpdates();

        $('#video-record-start').prop('disabled', '');
        $('#video-play').prop('disabled', '');
        $('#video-record-stop').prop('disabled', 'disabled');
        $('#video-download').prop('disabled', '');

        videoPlayer.pause();
        videoPlayer.muted = false;
        videoPlayer.srcObject = null;
        videoPlayer.src = url;
        videoPlayer.load();
        videoPlayer.onended = function () {
            videoPlayer.pause();
            videoPlayer.src = URL.createObjectURL(videoRecorder.blob);
        };

    });
}

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    // needs adapter.js to work in chrome
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

function playAudio() {
    audioObject.play();
    audioObject.onended = function () {
        audioObject.pause();
    };
}



function downloadVideo() {
    videoRecorder.save();
}

function downloadAudio() {
    audioRecorder.save();
}


function gotStream(stream) {
    inputPoint = audioContext.createGain();
    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);
    analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0.3;
    analyserNode.fftSize = 2048;
    inputPoint.connect(analyserNode);
    updateAnalyser();
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame(rafID);
    // clear the current state
    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    rafID = null;
}

function updateAnalyser(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
        gradient = analyserContext.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(1, '#ffff00'); // min level color
        gradient.addColorStop(0.15, '#ff0000'); // max level color
    }
    // mic input level draw code here
    {
        var array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);
        var average = getAverageVolume(array);
        // clear the current state
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        // set the fill style
        analyserContext.fillStyle = gradient;
        // create the meters
        analyserContext.fillRect(0, canvasHeight - average, canvasWidth, canvasHeight);
    }
    rafID = window.requestAnimationFrame(updateAnalyser);
}


function getAverageVolume(array) {
    var values = 0;
    var average;
    var length = array.length;
    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }
    average = values / length;
    return average;
}


