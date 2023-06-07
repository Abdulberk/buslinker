module.exports = {
    style: {
      sass: {
        loaderOptions: {
          additionalData: `
            @import "src/_globals.scss";
            @import "src/_base.scss";

          `,
        },
      },
    },
  };