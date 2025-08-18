import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';

const VideoCall = ({ roomId, offer, onEnd }) => {
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
    console.log('[User] Joining room:', roomId);
    socket.emit('join-room', roomId);

    // Only set up connection if offer is present (user accepted call)
    if (offer) {
      setupConnection(false, offer);
    }

    const handleReceiveAnswer = async (payload) => {
      console.log('[User] receive-answer', payload);
      if (payload && payload.answer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
      }
    };
    const handleReceiveIceCandidate = async (payload) => {
      console.log('[User] receive-ice-candidate', payload);
      if (peerConnection.current && payload && payload.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    };

    socket.on('receive-answer', handleReceiveAnswer);
    socket.on('receive-ice-candidate', handleReceiveIceCandidate);

    return () => {
      socket.off('receive-answer', handleReceiveAnswer);
      socket.off('receive-ice-candidate', handleReceiveIceCandidate);
    };
  }, [roomId, offer]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  const setupConnection = async (isCaller, remoteOffer = null) => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.ontrack = null;
        peerConnection.current.onicecandidate = null;
        peerConnection.current.close();
        peerConnection.current = null;
      }
      // User should only respond to doctor's offer, never initiate
      if (!isCaller && remoteOffer) {
        console.log('[User VideoCall] Attempting to getUserMedia...');
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          console.log('[User VideoCall] Got local stream:', stream);
        } catch (mediaErr) {
          setError('Unable to access camera/mic. Please check your browser permissions. ' + mediaErr.name + ': ' + mediaErr.message);
          console.error('[User VideoCall] getUserMedia error:', mediaErr);
          return;
        }
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log('[User VideoCall] Set srcObject for local video', localVideoRef.current);
        } else {
          console.warn('[User VideoCall] localVideoRef.current is null');
        }

        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (e) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
            console.log('[User VideoCall] Set srcObject for remote video', remoteVideoRef.current);
          } else {
            console.warn('[User VideoCall] remoteVideoRef.current is null');
          }
        };

        peerConnection.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit('ice-candidate', { candidate: e.candidate, roomId });
          }
        };

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { answer, roomId });

        setInCall(true);
        setError("");
      }
    } catch (err) {
      setError("Unable to access camera/mic. Please check your browser permissions. " + err.name + ': ' + err.message);
      console.error('[User VideoCall] setupConnection error:', err);
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
    if (roomId) {
      socket.emit('call-end', { roomId });
    }
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setInCall(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (onEnd) onEnd();
  };

  // Listen for call-ended event from the other party
  useEffect(() => {
    const handleCallEnded = (payload) => {
      if (payload && payload.roomId === roomId) {
        leaveCall();
      }
    };
    socket.on('call-ended', handleCallEnded);
    return () => {
      socket.off('call-ended', handleCallEnded);
    };
  }, [roomId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 w-screen h-screen">
      <div className="relative w-full h-full max-w-none max-h-none p-0 bg-gray-900 rounded-none shadow-none flex flex-col items-center justify-center">
        {error && (
          <div className="mb-4 text-red-500 font-semibold bg-white bg-opacity-80 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-16 w-full h-full justify-center items-center pt-8">
          <div className="w-full md:w-1/2 h-2/3 flex items-center justify-center">
            <div className="relative w-full h-full bg-black rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {!isVideo && (
                <span className="absolute text-white text-2xl">Video Off</span>
              )}
              <video ref={localVideoRef} autoPlay playsInline muted onError={e => console.log('Video error', e)} className={`w-full h-full object-cover ${!isVideo ? 'hidden' : ''}`} />
              {/* Show overlay if waiting for doctor to start call */}
              {!inCall && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60">
                  <span className="text-white text-lg font-semibold mb-2">Waiting for doctor to start call...</span>
                  <span className="text-white text-4xl material-icons">hourglass_empty</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 h-2/3 flex items-center justify-center">
            <div className="relative w-full h-full bg-black rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
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