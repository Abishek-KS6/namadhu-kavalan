const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key:     process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret:  process.env.CLOUDINARY_API_SECRET?.trim(),
});

const uploadToCloudinary = (buffer, folder = 'namadhu-kavalan') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
