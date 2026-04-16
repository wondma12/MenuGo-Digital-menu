import React, { useRef, useEffect } from 'react'

const CameraView = ({ onScan, onError }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        onError?.(err.message)
      }
    }

    startCamera()

    return () => {
      const stream = videoRef.current?.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onError])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default CameraView