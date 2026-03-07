export const compressImage = async (file: File, maxSizeKB: number = 500): Promise<File> => {
  // If file is already smaller than target, return it as is
  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  console.log(`Compressing ${file.name} from ${(file.size / 1024).toFixed(2)}KB...`);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Default max dimensions to prevent massive memory usage
        const MAX_DIM = 1920; 
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = (height * MAX_DIM) / width;
            width = MAX_DIM;
          } else {
            width = (width * MAX_DIM) / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));
        
        ctx.drawImage(img, 0, 0, width, height);

        // Recursive compression function to find the right quality
        let quality = 0.8;
        const adjustQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'));
              
              if (blob.size <= maxSizeKB * 1024 || q <= 0.2) {
                console.log(`Compressed to ${(blob.size / 1024).toFixed(2)}KB with quality ${q.toFixed(1)}`);
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                // Drop quality and try again
                adjustQuality(q - 0.15);
              }
            },
            'image/jpeg',
            q
          );
        };

        adjustQuality(quality);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};
