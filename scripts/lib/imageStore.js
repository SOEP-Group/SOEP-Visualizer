const fs = require("fs");
const path = require("path");
const axios = require("axios");

const IMAGE_DIR = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "images",
  "satellites"
);
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const DOWNLOAD_TIMEOUT_MS =
  Number(process.env.SATNOGS_IMAGE_TIMEOUT_MS || process.env.SATNOGS_API_TIMEOUT_MS || 10000);

fs.mkdirSync(IMAGE_DIR, { recursive: true });

function slugifyName(name) {
  if (!name) return null;
  const primaryToken = name.split(" ")[0] || name;
  const hyphenToken = primaryToken.split("-")[0] || primaryToken;
  const slug = hyphenToken.replace(/[^A-Za-z0-9]/g, "");
  if (!slug) return null;
  return slug.toUpperCase();
}

function findExistingImage(slug) {
  if (!slug) return null;

  for (const ext of IMAGE_EXTENSIONS) {
    const fileName = `${slug}${ext}`;
    const absolute = path.join(IMAGE_DIR, fileName);
    if (fs.existsSync(absolute)) {
      return {
        absolute,
        relative: `/images/satellites/${fileName}`,
      };
    }
  }

  try {
    const files = fs.readdirSync(IMAGE_DIR);
    const targetLower = slug.toLowerCase();

    for (const file of files) {
      const { name, ext } = path.parse(file);
      if (!IMAGE_EXTENSIONS.includes(ext.toLowerCase())) continue;
      if (name.toLowerCase() !== targetLower) continue;

      const canonicalName = `${slug}${ext.toLowerCase()}`;
      const currentPath = path.join(IMAGE_DIR, file);
      const canonicalPath = path.join(IMAGE_DIR, canonicalName);

      if (file !== canonicalName) {
        try {
          fs.renameSync(currentPath, canonicalPath);
        } catch (renameError) {
          console.warn(
            `Failed to rename image ${file} to ${canonicalName}:`,
            renameError
          );
          return {
            absolute: currentPath,
            relative: `/images/satellites/${file}`,
          };
        }
      }

      return {
        absolute: canonicalPath,
        relative: `/images/satellites/${canonicalName}`,
      };
    }
  } catch (error) {
    console.warn("Failed to scan satellite images directory:", error);
  }

  return null;
}

function inferExtensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) {
      return ext;
    }
  } catch (error) {
    console.warn(`inferExtensionFromUrl: Failed to parse URL "${url}":`, error);
    // Only fallback for known URL parsing errors (TypeError)
    if (error instanceof TypeError) {
      return ".jpg";
    }
    throw error;
  }
  return ".jpg";
}

async function downloadImage(url, slug, timeoutMs = DOWNLOAD_TIMEOUT_MS) {
  const extension = inferExtensionFromUrl(url);
  const fileName = `${slug}${extension}`;
  const destination = path.join(IMAGE_DIR, fileName);

  const response = await axios.get(url, {
    responseType: "stream",
    timeout: timeoutMs,
  });

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(destination);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
    response.data.on("error", reject);
  });

  return `/images/satellites/${fileName}`;
}

async function ensureLocalImage(record, satnogRecord, options = {}) {
  const slug =
    slugifyName(record?.name || satnogRecord?.name) ||
    (record?.satellite_id ? `SATELLITE${record.satellite_id}` : null);

  if (!slug) {
    return record?.image_url || null;
  }

  const currentImage = record?.image_url;
  if (currentImage && currentImage.startsWith("/images/")) {
    const normalized = currentImage.replace(/^\/+/, "");
    const absolutePath = path.join(
      IMAGE_DIR,
      normalized.replace(/^images\/satellites\//i, "")
    );
    if (fs.existsSync(absolutePath)) {
      const ext = path.extname(absolutePath).toLowerCase() || ".jpg";
      const canonicalName = `${slug}${ext}`;
      const canonicalPath = path.join(IMAGE_DIR, canonicalName);

      if (path.basename(absolutePath) !== canonicalName) {
        try {
          fs.renameSync(absolutePath, canonicalPath);
        } catch (renameError) {
          console.warn(
            `Failed to rename existing image ${path.basename(
              absolutePath
            )} to ${canonicalName}:`,
            renameError
          );
          return currentImage;
        }
      }

      return `/images/satellites/${canonicalName}`;
    }
  }

  const existing = findExistingImage(slug);
  if (existing) {
    return existing.relative;
  }

  const remoteUrl = satnogRecord?.image_url;
  if (!remoteUrl) {
    return currentImage || null;
  }

  try {
    return await downloadImage(remoteUrl, slug, options.timeoutMs);
  } catch (error) {
    console.warn(
      `Failed to download image for satellite ${record?.satellite_id || slug}:`,
      error.message || error
    );
    return currentImage || null;
  }
}

module.exports = {
  ensureLocalImage,
  findExistingImage,
  slugifyName,
};
