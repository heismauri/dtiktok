const jsonBuilder = (json) => {
  if (json.image_post_info) {
    return {
      media: json.image_post_info.images.map((image) => {
        return {
          type: 'photo',
          link: image.display_image.url_list[1]
        };
      })
    };
  }
  return {
    media: [
      {
        type: 'video',
        link: json.video.play_addr.url_list[0]
      }
    ]
  };
};

export default jsonBuilder;
