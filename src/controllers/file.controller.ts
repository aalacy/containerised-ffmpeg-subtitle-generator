import { FileService } from "../services/file.service";
import { JOB_MONSTER_TRANSCRIPTION } from "../utils";

const fileService = new FileService();

export class fileController {
  static upload = async (req, res, next) => {
    try {
      const name = await fileService.upload(req);
      res.json({ message: "Uploading a file...", name });
    } catch (error) {
      console.log("[error][upload]", error);
      if (error) {
        next(error);
      }
    }
  };

}