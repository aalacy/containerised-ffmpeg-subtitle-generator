import {
  JOB_FILE_UPLOAD,
  JOB_PROGRESS,
  PENDING_TRANSCRIBING,
  callMonsterAPI,
  extractAudioFromVideo,
  generateThumbnail,
  getAudioKey,
  getMetadataOfVideo,
  getVideoBaseKey,
  readFileContent,
  removeFile,
} from "../utils";
import { getAzureBlob, upload2Azure } from "../utils/azure";

export default async function (req, socket) {
  const { fileInfo, userId, visitorId, ext, metadata } = req.body;
  const key = fileInfo.newFilename;
  const videoBaseKey = getVideoBaseKey(key, ext);
  const audioKey = getAudioKey(key);

  console.log("file", fileInfo);
  socket.emit(JOB_PROGRESS, {
    jobName: 'upload',
    message: "Uploading...",
    percent: 10,
    userId,
    visitorId,
  });
  const audioPath = await extractAudioFromVideo(key, fileInfo.filepath);

  // upload audio file to bucket
  await upload2Azure(audioPath, audioKey, (progress) =>
    socket.emit(JOB_PROGRESS, {
      jobName: 'upload',
      message: "Uploading...",
      percent: 10 + progress * 20,
      userId,
      visitorId,
    }),
  );
  const audio = await getAzureBlob(audioKey);
  // upload original video file to bucket
  await upload2Azure(fileInfo.filepath, videoBaseKey, (progress) =>
    socket.emit(JOB_PROGRESS, {
      jobName: 'upload',
      message: "Uploading...",
      percent: 30 + progress * 20,
      userId,
      visitorId,
    }),
  );

  // get metainfo
  const info = await getMetadataOfVideo(fileInfo.filepath);

  let thumbnail;
  try {
    socket.emit(JOB_PROGRESS, {
      jobName: 'upload',
      message: "Uploading...",
      percent: 60,
      userId,
      visitorId,
    });
    const thumbnailPath = await generateThumbnail(key, fileInfo.filepath);
    // read thumbnail content
    thumbnail = await readFileContent(thumbnailPath);
    await removeFile(thumbnailPath);
  } catch (error) {
    console.log("[No thumbnail]", error);
  }

  socket.emit(JOB_PROGRESS, {
    jobName: 'upload',
    message: "Uploading...",
    percent: 70,
    userId,
    visitorId,
  });
  const monsterData = await callMonsterAPI(audio, metadata.lang[0]);
  socket.emit(JOB_PROGRESS, {
    jobName: 'upload',
    message: "Transcribing...",
    percent: 85,
    userId,
    visitorId,
  });

  // remove temporary files on local
  await removeFile(audioPath); // audio file
  await removeFile(fileInfo.filepath); // original video file

  const data = {
    userId,
    visitorId,
    localPath: fileInfo.filepath,
    thumbnail,
    audio,
    key,
    fileName: fileInfo.originalFilename,
    ext,
    width: Number(metadata.width[0]),
    height: Number(metadata.height[0]),
    duration: info.format.duration,
    processId: monsterData.process_id,
    lang: metadata.lang[0],
    status: PENDING_TRANSCRIBING,
    metadata: {
      backgroundColor: "#4d1a7f",
      fontColor: "#76f016",
      font: "Roboto",
      fontWeight: "Light",
      fontSize: 16,
      position: 50,
    },
  };

  socket.emit(JOB_FILE_UPLOAD, { data })
}
