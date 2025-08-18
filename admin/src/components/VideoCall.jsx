import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';

const VideoCall = ({ roomId, onEnd }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isAudio, setIsAudio] = useState(true);
  const [isVideo, setIsVideo] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;

    // Always show doctor's own video immediately
    setupConnection(true);

    socket.emit('join-room', roomId);

    // Listen for answer and ICE candidates immediately
    const handleReceiveAnswer = async (payload) => {
      console.log('[Doctor] receive-answer', payload);
      if (payload && payload.answer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        console.log('[Doctor] Set remote description with answer');
      }
    };
    const handleReceiveIceCandidate = async (payload) => {
      console.log('[Doctor] receive-ice-candidate', payload);
      if (peerConnection.current && payload && payload.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        console.log('[Doctor] Added ICE candidate');
      }
    };

    socket.on('receive-answer', handleReceiveAnswer);
    socket.on('receive-ice-candidate', handleReceiveIceCandidate);

    return () => {
      socket.off('receive-answer', handleReceiveAnswer);
      socket.off('receive-ice-candidate', handleReceiveIceCandidate);
    };
  }, [roomId]);

  // Ensure local video element always gets the stream
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  const setupConnection = async (isCaller, remoteOffer = null) => {
    try {
      // Always stop previous tracks before requesting new stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      // Always close previous peer connection
      if (peerConnection.current) {
        peerConnection.current.ontrack = null;
        peerConnection.current.onicecandidate = null;
        peerConnection.current.close();
        peerConnection.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Got local stream:', stream);
      setLocalStream(stream);
      if (localVideoRef.current) {
        console.log('Setting srcObject for local video', localVideoRef.current);
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection();

      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };

      peerConnection.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice-candidate', { candidate: e.candidate, roomId });
        }
      };

      if (isCaller) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log('[Doctor VideoCall] Created offer:', offer);
        socket.emit('offer', { offer, roomId });
        console.log('[Doctor VideoCall] Emitted offer for room:', roomId, offer);
      } else {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { answer, roomId });
      }

      setInCall(true);
      setError("");
    } catch (err) {
      setError("Unable to access camera/mic. Please check your browser permissions.");
      console.error('getUserMedia error:', err);
    }
  };

  const toggleAudio = () => {
    localStream.getAudioTracks()[0].enabled = !isAudio;
    setIsAudio(!isAudio);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = !isVideo;
    setIsVideo(!isVideo);
  };

  const leaveCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setInCall(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (onEnd) onEnd();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 w-screen h-screen">
      <div className="relative w-full h-full max-w-none max-h-none p-0 bg-gray-900 rounded-none shadow-none flex flex-col items-center justify-center">
        {error && (
          <div className="mb-4 text-red-500 font-semibold bg-white bg-opacity-80 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8 w-full h-full justify-center items-center">
          <div className="relative w-full md:w-1/2 h-2/3 bg-black rounded-xl flex items-center justify-center overflow-hidden">
            {!isVideo && (
              <span className="absolute text-white text-2xl">Video Off</span>
            )}
            <video ref={localVideoRef} autoPlay playsInline muted onError={e => console.log('Video error', e)} className={`w-full h-full object-cover ${!isVideo ? 'hidden' : ''}`} />
            {/* Show overlay if waiting for user to join */}
            {!inCall && localStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60">
                <span className="text-white text-lg font-semibold mb-2">Waiting for user to join...</span>
                <span className="text-white text-4xl material-icons">hourglass_empty</span>
              </div>
            )}
          </div>
          <div className="relative w-full md:w-1/2 h-2/3 bg-black rounded-xl flex items-center justify-center overflow-hidden">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        </div>
        {inCall && (
          <div className="flex gap-8 mt-8 justify-center items-center absolute bottom-12 left-1/2 transform -translate-x-1/2">
            <button onClick={toggleAudio} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${isAudio ? 'bg-green-500 text-white' : 'bg-gray-400 text-gray-700'}`}
              title={isAudio ? 'Mute Mic' : 'Unmute Mic'}>
              <span className="material-icons">{isAudio ? 'mic' : 'mic_off'}</span>
            </button>
            <button onClick={toggleVideo} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${isVideo ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700'}`}
              title={isVideo ? 'Turn Off Camera' : 'Turn On Camera'}>
              <span className="material-icons">{isVideo ? 'videocam' : 'videocam_off'}</span>
            </button>
            <button onClick={leaveCall} className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all" title="End Call">
              <span className="material-icons">call_end</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;