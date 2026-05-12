import {useState} from 'react';

export default function useQRScanner() {
  const [scanned, setScanned] = useState(null);
  return {scanned, setScanned};
}
