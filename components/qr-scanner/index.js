// components/qr-scanner/index.jsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * QR Scanner component that provides QR code scanning functionality
 * @param {Object} props
 * @param {Function} props.onScan - Callback function when QR is successfully scanned
 * @param {Function} props.onError - Callback function when an error occurs
 * @param {boolean} props.showScannerByDefault - Whether to show scanner immediately
 */
export function QRScanner({ onScan, onError, showScannerByDefault = false }) {
  const [isScannerVisible, setScannerVisible] = useState(showScannerByDefault);
  const [hasPermission, setHasPermission] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;

    const initializeScanner = async () => {
      if (isScannerVisible && containerRef.current) {
        try {
          html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;

          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length) {
            const camera = cameras[cameras.length - 1]; // Usually back camera
            startScanner(html5QrCode, camera.id);
            setHasPermission(true);
          } else {
            setHasPermission(false);
            if (onError) onError('No cameras found');
          }
        } catch (err) {
          console.error('Camera permission error:', err);
          setHasPermission(false);
          if (onError) onError('Camera permission denied');
        }
      }
    };

    const startScanner = async (scanner, cameraId) => {
      try {
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (onScan) {
              onScan(decodedText);
              setScannerVisible(false);
            }
          },
          (errorMessage) => {
            // Ignore errors during scanning as they're usually just "QR code not found in frame"
          }
        );
      } catch (err) {
        console.error('Scanner start error:', err);
        if (onError) onError(err.message || 'Failed to start scanner');
      }
    };

    if (isScannerVisible) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(error => console.error('Error stopping scanner:', error));
      }
    };
  }, [isScannerVisible, onScan, onError]);

  const handleClose = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }
    setScannerVisible(false);
  };

  if (!isScannerVisible) {
    return (
      <Button
        onClick={() => setScannerVisible(true)}
        className="w-full"
        variant="outline"
      >
        <Camera className="w-4 h-4 mr-2" />
        Scan QR Code
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      <Card className="relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={handleClose}
        >
          <XCircle className="w-5 h-5" />
        </Button>

        {hasPermission === false ? (
          <div className="p-4 text-center">
            <p className="text-red-500">Camera access denied</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please enable camera access in your browser settings to scan QR codes
            </p>
          </div>
        ) : (
          <div className="aspect-square relative" ref={containerRef}>
            <div 
              id="qr-reader" 
              className="w-full h-full"
              style={{
                position: 'relative',
                padding: 0,
                border: 'none',
              }}
            />
            <div className="absolute inset-0 border-[3px] border-primary/50 rounded-lg pointer-events-none" />
          </div>
        )}
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleClose}
      >
        Cancel Scan
      </Button>
    </motion.div>
  );
}