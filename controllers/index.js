const {
  MediaConvertClient,
  MediaConvert,
} = require("@aws-sdk/client-mediaconvert");
const fs = require("fs");

const compressVideo = async (req, res, next) => {
  const mediaConvert = new MediaConvert({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const video = req.files;
  //   console.log("Video :: ", video);

  const job = await mediaConvert.createJob({
    Settings: {
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "s3://armiamediaconvertbucket/converted/", // TODO; update with destination
            },
          },
          Outputs: [
            {
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    SceneChangeDetect: "TRANSITION_DETECTION",
                    MaxBitrate: 4000000, // TODO: THE BIT RATE
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              ContainerSettings: {
                Container: "MP4",
                Mp4Settings: {},
              },
              NameModifier: "_converted_file", // TODO: file name modifier
            },
          ],
          CustomName: "_the_converted", // TODO: job custom name
        },
      ],
      TimecodeConfig: {
        Source: "ZEROBASED",
      },
      FollowSource: 1,
      Inputs: [
        {
          TimecodeSource: "ZEROBASED",
          VideoSelector: {},
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
          FileInput:
            "s3://armiamediaconvertbucket/uploads/Zack Snyder_s Justice League.mp4", // TODO: input file
        },
      ],
    },
    Role: process.env.AWS_MC_ARN,
    // passing metadata
    UserMetadata: {
      test: "name",
      test2: "name2",
    },
  });
  return res.status(200).json({
    success: true,
    data: {
      message: "ok",
    },
  });
};

const getCallback = async (req, res, next) => {
  const data = req.body;
  const dataJSON = JSON.stringify(data);
  // fs.writeFile(`${__dirname}/data.json`, dataJSON, 'utf-8', function(err) {})
  fs.writeFileSync(`${__dirname}/../data.json`, dataJSON, "utf-8");
  const responseData = {
    filePath:
      data.event.detail.outputGroupDetails[0].outputDetails[0]
        .outputFilePaths[0],
    userMetaData: data.event.detail.userMetadata,
  };
  console.log("response :: ", responseData);
  return res.status(200).json({
    success: true,
    data: {
      message: "callback success",
      payload: responseData,
    },
  });
};

module.exports = {
  compressVideo,
  getCallback,
};
