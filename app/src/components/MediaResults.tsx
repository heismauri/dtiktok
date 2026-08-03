import { type JSX } from "react";

import type { MediaItem } from "@api/types/Media";

const MediaResults = ({ media }: { media: MediaItem[] }): JSX.Element => {
  return (
    <>
      {media.map((item, index) => {
        if (item.type === "photo") {
          return (
            <div key={index} className={`media type-${item.type}`}>
              <a href={item.link} target="_blank" rel="noreferrer">
                <img src={item.link} alt="" />
              </a>
            </div>
          );
        }
        return (
          <div key={index} className={`media type-${item.type}`}>
            <a className="btn btn-save" href={item.link} target="_blank" rel="noreferrer">
              Save video
            </a>
            <video controls>
              <source src={item.link} type="video/mp4" />
            </video>
          </div>
        );
      })}
    </>
  );
};

export default MediaResults;
