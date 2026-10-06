import cloudinary, { cloudinaryReady } from '../config/cloudinary.js';

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Checks the real file bytes, not just the name or declared type
export function sniffType(buf) {
  if (!buf || buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf';
  return null;
}

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', type: 'authenticated', overwrite: false },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function storeUpload({ file, clientId, label, stage, uploadedBy }) {
  if (!file) throw fail(400, 'Please choose a file to upload');
  if (!cloudinaryReady()) throw fail(503, 'Document storage is not configured yet');

  const kind = sniffType(file.buffer);
  if (!kind) throw fail(400, 'Only PDF, JPG or PNG files are allowed');

  const result = await uploadBuffer(file.buffer, `britpath/clients/${clientId}`);

  return {
    label,
    stage,
    publicId: result.public_id,
    format: result.format || kind,
    bytes: result.bytes,
    originalName: String(file.originalname || '').slice(0, 160),
    uploadedBy,
    status: uploadedBy === 'admin' ? 'approved' : 'pending',
  };
}

// Link that expires (default 5 minutes)
export function signedUrl(doc, seconds = 300) {
  if (!cloudinaryReady()) throw fail(503, 'Document storage is not configured yet');
  return cloudinary.utils.private_download_url(doc.publicId, doc.format, {
    resource_type: 'image',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + seconds,
  });
}

export async function destroyAsset(doc) {
  if (!cloudinaryReady()) return;
  try {
    await cloudinary.uploader.destroy(doc.publicId, {
      resource_type: 'image',
      type: 'authenticated',
      invalidate: true,
    });
  } catch (err) {
    console.error('Cloudinary delete failed:', err.message);
  }
}