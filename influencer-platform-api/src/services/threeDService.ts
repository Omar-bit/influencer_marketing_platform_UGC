import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const apiKey = 'tsk_W7EOH3XtpfUmpIS6rrVcbHnVXvBYKTUd_vHQOjF_eyl';

async function uploadImage(
  filePath: string
): Promise<{ token: string; extension: string }> {
  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  const extension = filePath.split('.').pop() || 'jpg';
  form.append('file', buffer, {
    filename: `${Date.now()}3d.${extension}`,
    contentType: `image/${extension == 'jpg' ? 'jpeg' : extension}`,
  });

  const response = await axios.post(
    'https://api.tripo3d.ai/v2/openapi/upload',
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const data = response.data;
  if (data.code === 0) {
    return { token: data.data.image_token, extension };
  } else {
    throw new Error(`Upload failed: ${data.message || 'Unknown error'}`);
  }
}

async function createModelTask(
  imageToken: string,
  extension: string
): Promise<string> {
  const payload = {
    type: 'image_to_model',
    file: {
      type: extension,
      file_token: imageToken,
    },
  };

  const response = await axios.post(
    'https://api.tripo3d.ai/v2/openapi/task',
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const data = response.data;
  if (data.code === 0) {
    return data.data.task_id;
  } else {
    throw new Error(`Task creation failed: ${data.message || 'Unknown error'}`);
  }
}

async function waitForModel(
  taskId: string,
  interval = 5000,
  maxTries = 60
): Promise<{ url: string; type: string }> {
  for (let i = 0; i < maxTries; i++) {
    const response = await axios.get(
      `https://api.tripo3d.ai/v2/openapi/task/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = response.data;

    if (data.code === 0) {
      const { status, result, progress, output } = data.data;
      if (status === 'done' || status === 'success') {
        return result.pbr_model;
      } else if (status === 'failed') {
        throw new Error('Model generation failed');
      } else {
        console.log(`⏳ Waiting... Status: ${status}, Progress: ${progress}%`);
      }
    } else {
      throw new Error(`Status check failed: ${data.message}`);
    }

    await new Promise((res) => setTimeout(res, interval));
  }

  throw new Error('Model generation timeout');
}

async function downloadGLBModel(modelUrl: string): Promise<string> {
  try {
    console.log('⬇️ Downloading GLB model...');

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate a filename based on the current timestamp if not provided
    const glbName = `model_${Date.now()}.glb`;
    const fileName = path.join(downloadsDir, glbName);

    // Download the file with axios
    const response = await axios.get(modelUrl, {
      responseType: 'arraybuffer', // Important - get binary data
    });

    // Save the file
    console.log('⬇️ Saving GLB model...');
    fs.writeFileSync(fileName, Buffer.from(response.data));
    console.log(`✅ Model saved to ${fileName}`);

    return glbName;
  } catch (err: any) {
    throw new Error(`❌ Download failed: ${err.message}`);
  }
}

export async function generateGLBModelFromImage(
  filePath: string,
  downloadModel: boolean = true
): Promise<{ modelUrl: string; localPath?: string }> {
  try {
    const { token: imageToken, extension } = await uploadImage(filePath);
    console.log('✅ Image uploaded:', imageToken);

    const taskId = await createModelTask(imageToken, extension);
    console.log('✅ Model task created:', taskId);
    const modelUrlObject = await waitForModel(taskId);
    console.log('✅ Model generated:', modelUrlObject);
    const modelUrl = modelUrlObject.url;
    console.log('✅ Model URL:', modelUrl);
    // const modelUrl =
    //   'https://tripo-data.rg1.data.tripo3d.com/tcli_e16529421d55457cb2f68f73bd72e11a/20250505/c380e120-bf29-461f-919d-4e49f7f41da5/tripo_pbr_model_c380e120-bf29-461f-919d-4e49f7f41da5.glb?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90cmlwby1kYXRhLnJnMS5kYXRhLnRyaXBvM2QuY29tL3RjbGlfZTE2NTI5NDIxZDU1NDU3Y2IyZjY4ZjczYmQ3MmUxMWEvMjAyNTA1MDUvYzM4MGUxMjAtYmYyOS00NjFmLTkxOWQtNGU0OWY3ZjQxZGE1L3RyaXBvX3Bicl9tb2RlbF9jMzgwZTEyMC1iZjI5LTQ2MWYtOTE5ZC00ZTQ5ZjdmNDFkYTUuZ2xiIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzQ2NDg5NjAwfX19XX0_&Signature=PLE8zY2MdI9pbmfAA8-P9rw8R0wz90doXnbFvh1iNzJbsbY6GGez~kQRDcOYpbpgcPz47cuP5bhMT4IBfUN3mU9St~2GTeEIetWvvyZygpPaouroC11DMUUgKkuecTEXL49VvN5Z0urU5RC0aUuokdeBdd6ILvHEaQV6FdtIvP91jvGkmWkx9j40QLov5WlSUwMXUtUTqJWtt~FqNd~WPQUywdTi-WKKQYP-by5S~3e7SYi9YuLp8-t3Nxps8RZa59Jat8lnQWJQAEzK84Vp99eAKiKTdBklLkxGYt2TiNashTkTz9dYXQFyui3m7hwKHwuvy4p5I2BJ9z68u9PKuw__&Key-Pair-Id=K1676C64NMVM2J';
    if (downloadModel) {
      const localPath = await downloadGLBModel(modelUrl);
      return { modelUrl, localPath };
    }

    return { modelUrl };
  } catch (err: any) {
    throw new Error(`❌ Error: ${err.message}`);
  }
}

// Example usage:
// (async () => {
//   try {
//     const result = await generateGLBModelFromImage(
//       '../../uploads/dhia.jpg',
//       true // download the model after generation
//     );
//     console.log('✅ Final Model URL:', result.modelUrl);
//     if (result.localPath) {
//       console.log('📂 Local file saved at:', result.localPath);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// })();
