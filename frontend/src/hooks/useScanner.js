import { useMutation } from '@tanstack/react-query';
import { scanFoodImageApi } from '../api/food.api';
import { scanBarcodeApi } from '../api/barcode.api';
import { compressImage } from '../utils/imageCompression';
import { useUIStore } from '../store/uiStore';

export const useScanner = () => {
  const addToast = useUIStore((state) => state.addToast);

  const scanImageMutation = useMutation({
    mutationFn: async (file) => {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressed);
      return await scanFoodImageApi(formData);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Scan failed. Please try again.';
      if (msg.toLowerCase().includes('quota')) {
        addToast('AI quota exceeded. Try again later.', 'error');
      } else if (msg.toLowerCase().includes('not_food') || msg.toLowerCase().includes('no food')) {
        addToast('No food detected. Point camera directly at a meal.', 'warning');
      } else if (msg.toLowerCase().includes('unidentified')) {
        addToast('Dish not recognised. Try better lighting or angle.', 'warning');
      } else {
        addToast(msg, 'error');
      }
    }
  });

  const scanBarcodeMutation = useMutation({
    mutationFn: async (barcode) => {
      return await scanBarcodeApi(barcode);
    },
    onError: (err) => {
      addToast(err?.response?.data?.message || 'Barcode lookup failed.', 'error');
    }
  });

  return {
    scanImage: scanImageMutation.mutateAsync,
    isScanningImage: scanImageMutation.isPending,
    imageError: scanImageMutation.error,
    imageResult: scanImageMutation.data,

    scanBarcode: scanBarcodeMutation.mutateAsync,
    isScanningBarcode: scanBarcodeMutation.isPending,
    barcodeResult: scanBarcodeMutation.data
  };
};

