import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

import { SUPABASE_KEY, SUPABASE_URL } from '../utils/secrets';
import logger from '../utils/logger';
import { readFileSync } from 'fs';
import path from 'path';

export async function uploadToCloudStorage(file: any, fileName: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let isUploaded = false;
  let tries = 0;
  const maxRetries = 10;
  const retryDelay = 3000;
  while (!isUploaded && tries < maxRetries) {
    try {
      const { data, error } = await supabase.storage
        .from('webtrend')
        .upload(Date.now() + '-' + fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.mimetype,
        });
      console.log(data);
      if (error) {
        logger.error('Error uploading file to Supabase:', error);
        throw new Error('Failed to upload file to cloud storage');
      } else {
        const { data: image } = supabase.storage
          .from('webtrend')
          .getPublicUrl(data.path);
        isUploaded = true;
        return image.publicUrl; // Return the public URL of the uploaded image
      }
    } catch (error) {
      tries++;
      logger.error(
        `Error uploading file to Supabase. Attempt ${tries}:`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  //   const { data, error } = await supabase.storage
  //     .from('webtrend')
  //     .upload(Date.now() + '-' + fileName, file, {
  //       cacheControl: '3600',
  //       upsert: true,
  //       contentType: file.mimetype,
  //     });

  //   if (error) {
  //     logger.error('Error uploading file to Supabase:', error);
  //     throw new Error('Failed to upload file to cloud storage');
  //   } else {
  //     const { data: image } = supabase.storage
  //       .from('webtrend')
  //       .getPublicUrl(data.path);
  //     return image.publicUrl; // Return the public URL of the uploaded image
  //   }
}

// async function test() {
//   const file = readFileSync(
//     path.join(__dirname, '..', '..', '/uploads/contentAssets-1746140716792.mp4')
//   );

//   try {
//     const url = await uploadToCloudStorage(file);
//     console.log('Uploaded file URL:', url);
//   } catch (error: any) {
//     console.error('Error uploading file:', error.message);
//   }
// }

// test().catch((error) => {
//   console.error('Error in test function:', error.message);
// });
