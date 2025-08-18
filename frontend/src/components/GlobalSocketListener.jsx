import React, { useEffect, useState, useContext } from 'react';
import socket from '../socket';
import VideoCall from './VideoCall';
import { AppContext } from '../context/AppContext';


const GlobalSocketListener = () => {
  const { userData } = useContext(AppContext);
  const [showCall, setShowCall] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [acceptPrompt, setAcceptPrompt] = useState(false);

  // Always join the correct room as soon as the appointment page loads
  useEffect(() => {
    const path = window.location.pathname;
    let docId = null;
    const match = path.match(/appointment\/(\w+)/);
    if (match) docId = match[1];
    console.log('[GlobalSocketListener] userData:', userData);
    console.log('[GlobalSocketListener] docId:', docId);
    if (userData && userData._id && docId) {
      const room = `${docId}_${userData._id}`;
      socket.emit('join-room', room);
      console.log('[GlobalSocketListener] Emitting join-room:', room);
    } else {
      console.warn('[GlobalSocketListener] Missing userData or docId, not joining room.', { userData, docId });
    }
  }, [userData, window.location.pathname]);

  useEffect(() => {
    socket.on('joined-room', (data) => {
      console.log('[User] Joined room:', data);
    });

    const handleReceiveOffer = (offer) => {
      console.log('[GlobalSocketListener] receive-offer event:', offer);
      if (offer && offer.roomId && offer.offer) {
        setRoomId(offer.roomId);
        setIncomingOffer(offer.offer);
        setAcceptPrompt(true);
      } else {
        console.warn('[GlobalSocketListener] receive-offer missing roomId or offer:', offer);
      }
    };
    socket.on('receive-offer', handleReceiveOffer);
    socket.onAny((event, ...args) => {
      console.log('[GlobalSocketListener] Socket event:', event, args);
    });
    return () => {
      socket.off('receive-offer', handleReceiveOffer);
      socket.off('joined-room');
      socket.offAny();
    };
  }, []);

  const handleAccept = () => {
    setShowCall(true);
    setAcceptPrompt(false);
  };

  const handleReject = () => {
    setRoomId(null);
    setIncomingOffer(null);
    setAcceptPrompt(false);
  };

  const handleEnd = () => {
    setShowCall(false);
    setRoomId(null);
    setIncomingOffer(null);
  };

  return (
    <>
      {acceptPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            padding: 40,
            borderRadius: 16,
            boxShadow: '0 2px 24px #0006',
            textAlign: 'center',
            minWidth: 320,
            maxWidth: '90vw',
          }}>
            <h2 style={{ marginBottom: 20, fontSize: 28, color: '#2d3748', fontWeight: 700 }}>Incoming Video Call</h2>
            <p style={{ marginBottom: 32, fontSize: 18, color: '#374151' }}>Doctor is calling you.<br/>Do you want to accept?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <button style={{
                padding: '10px 32px',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0002',
                transition: 'background 0.2s',
              }} onClick={handleAccept}>Accept</button>
              <button style={{
                padding: '10px 32px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 1px 4px #0002',
                transition: 'background 0.2s',
              }} onClick={handleReject}>Reject</button>
            </div>
          </div>
        </div>
      )}
      {showCall && roomId && (
        <VideoCall roomId={roomId} offer={incomingOffer} onEnd={handleEnd} />
      )}
    </>
  );
};

export default GlobalSocketListener;
