import fileUploader from "../jobs/file-uploader";

export class FileService {
  upload = async (req, socket) => {
    fileUploader(req, socket);
  };
}
